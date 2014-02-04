
//スクリプトの評価

/*
#[loadjs]
:group
マクロ・変数・JS操作
:title
外部JavaScriptファイル読み込み
:exp
外部JavaScriptファイルをロードします
無制限な機能拡張が可能です
JSファイルは/data/others フォルダ以下に格納してください
:sample
[loadjs storage="sample.js"  ]
:param
storage=ロードするJSファイルを指定します
#[end]
*/
tyrano.plugin.kag.tag.loadjs={
    
    vital:["storage"],
    
    pm:{
        storage:""
    },
    
    start:function(pm){
        
        var that = this;
        
        $.getScript("./data/others/"+pm.storage, function(){
            that.kag.ftag.nextOrder();
        });

        
    }
    
};


/*
#[movie]
:group
その他
:title
ムービーの再生
:exp
mp4形式の動画を再生します。
:sample
[movie storage="" skip=false ]
:param
storage=再生するmp4ファイルを指定してください
skip=動画再生中に途中でスキップ可能か否かを指定します true か false を指定してください
#[end]
*/

//グラフィックボタン表示位置調整、テキストはできない
tyrano.plugin.kag.tag.movie ={
    
    vital:["storage"],
    
    pm:{
        storage:"",
        skip:false
    },
    
    start:function(pm){
        
        var that = this;
        
        if($.userenv() !="pc"){
            this.kag.layer.showEventLayer();
             //クリックしないと始まらないようにする
            $('.tyrano_base').bind('click.movie', function(e){
                that.playVideo(pm);
                $(".tyrano_base").unbind("click.movie");
            
            });
            
        }else{
            
            //firefoxの場合は再生できない旨、警告
            if($.getBrowser()=="firefox"){
                alert("ご利用のブラウザでは、ムービーを再生できません。飛ばします。");
                that.kag.ftag.nextOrder();
                return;
            }
            
            that.playVideo(pm);
        }
        
    },
    
    playVideo:function(pm){
    
        var that = this;
        
            var url = "./data/video/"+pm.storage;
            
            var video = document.createElement('video');
            video.setAttribute('myvideo');
            video.src = url;
            
            //top:0px;left:0px;width:100%;height:100%;'";
            
            video.style.backgroundColor = "black";
            video.style.zIndex=199999;
            video.style.position="absolute";
            video.style.top="0px";
            video.style.left="0px";
            video.style.width="100%";
            video.style.height="100%";
            video.autoplay = true;
            video.autobuffer = true;
            
            video.addEventListener("ended",function(e){
                $(".tyrano_base").find("video").remove();
                that.kag.ftag.nextOrder();
        
            });
            
            //スキップ可能なら、クリックで削除
            
            if(pm.skip == "true"){
                
                video.addEventListener("click",function(e){
                    $(".tyrano_base").find("video").remove();
                    that.kag.ftag.nextOrder();
        
                });
           
           }
            
            document.getElementById("tyrano_base").appendChild(video);
            video.load();
            video.play();
    
    }
    
};


/*
#[showsave]
:group
システム操作
:title
セーブ画面を表示します
:exp
セーブ画面を表示します
:sample
[showsave]
:param
#[end]
*/

tyrano.plugin.kag.tag.showsave ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        this.kag.menu.displaySave();
        
    }
    
};


/*
#[showload]
:group
システム操作
:title
ロード画面を表示します
:exp
ロード画面を表示します
:sample
[showload]
:param
#[end]
*/

tyrano.plugin.kag.tag.showload ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        this.kag.menu.displayLoad();
        
    }
};


/*
#[showmenu]
:group
システム操作
:title
メニュー画面を表示します
:exp
メニュ＾画面を表示します
:sample
[showmenu]
:param
#[end]
*/

tyrano.plugin.kag.tag.showmenu ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        this.kag.menu.showMenu();
        
    }
};



/*
#[showmenubutton]
:group
システム操作
:title
メニューボタンを表示
:exp
メニューボタンを表示します
:sample
[showmenubutton]
:param
#[end]
*/

tyrano.plugin.kag.tag.showmenubutton ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        $(".button_menu").show();
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[hidemenubutton]
:group
システム操作
:title
メニューボタンを非表示
:exp
メニューボタンを非表示します
:sample
[hidemenubutton]
:param
#[end]
*/

tyrano.plugin.kag.tag.hidemenubutton ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        $(".button_menu").hide();
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[skipstart]
:group
システム操作
:title
スキップ開始
:exp
文字表示をスキップモードにします。
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag.skipstart ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        this.kag.stat.is_skip = true;
        this.kag.ftag.nextOrder();
            
    }
};


/*
#[skipstop]
:group
システム操作
:title
スキップ停止
:exp
スキップモードを停止します。
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag.skipstop ={
    
    pm:{
    },
    
    start:function(pm){
        
        this.kag.stat.is_skip = false;
        this.kag.ftag.nextOrder();
            
    }
};



/*
#[anim]
:group
アニメーション関連
:title
アニメーション
:exp
画像やボタン、レイヤなどの中身をアニメーションさせることができます
アニメーションさせる要素は[image][ptext][button]タグ作成時にname属性で指定した名前を利用できます。
レイヤを指定するとレイヤの中にある要素全てを同時にアニメーションできます
このタグはアニメーションの終了を待ちません。[wa]タグを使用すると実行中のすべてのアニメーションの完了を待つことができます。
位置のアニメーションは指定する値に+=100 -=100　と指定することで相対位置指定できます（今表示されているところから、右へ１００PX移動といった指定ができます）
透明度を指定すれば、アニメーションしながら非表示にすることもできます。
:sample
[ptext layer=1 page=fore text="文字列" size=30 x=0 y=0 color=red vertical=true]

[image layer=0 left=100 top=100  storage = yuko1.png page=fore visible=true name=yuko,chara ]
[image layer=1 left=300 top=100 storage = haruko1.png page=fore visible=true name=haruko ]

;name属性を指定してアニメーション
[anim name=haruko left="+=100" time=10000 effect=easeInCirc opacity=0  ]

;レイヤを指定してアニメーション
[anim layer=1 left="+=100" effect=easeInCirc opacity=0  ]

;すべてのアニメーション完了を待ちます
[wa]

アニメーション終了

:param
name=ここで指定した値が設定されている要素に対してアニメーションを開始します。name属性で指定した値です。,
layer=name属性が指定されている場合は無視されます。前景レイヤを指定します。必ずforeページに対して実施されます。,
left=指定した横位置にアニメーションで移動します。,
top=指定した縦位置にアニメーションで移動します。,
width=幅を指定します,
height=高さを指定します,
opacity=0～255の値を指定します。指定した透明度へアニメーションします,
color=色指定,
time=アニメーションにかける時間をミリ秒で指定して下さい。デフォルトは2000ミリ秒です,
effect=変化のエフェクトを指定します。指定できる文字列は以下の種類です<br />

jswing
｜def
｜easeInQuad
｜easeOutQuad
｜easeInOutQuad
｜easeInCubic
｜easeOutCubic
｜easeInOutCubic
｜easeInQuart
｜easeOutQuart
｜easeInOutQuart
｜easeInQuint
｜easeOutQuint
｜easeInOutQuint
｜easeInSine
｜easeOutSine
｜easeInOutSine
｜easeInExpo
｜easeOutExpo
｜easeInOutExpo
｜easeInCirc
｜easeOutCirc
｜easeInOutCirc
｜easeInElastic
｜easeOutElastic
｜easeInOutElastic
｜easeInBack
｜easeOutBack
｜easeInOutBack
｜easeInBounce
｜easeOutBounce
｜easeInOutBounce

#[end]
*/


tyrano.plugin.kag.tag.anim ={
    
    pm:{
    
        name:"",
        layer:"",
        left:"",
        top:"",
        width:"",
        height:"",
        opacity:"",
        color:"",
        time:"2000",
        effect:""
    
    },
    
    start:function(pm){
        
        var that = this;
        
        var anim_style = {};
        
        
        if(pm.left !=""){
            anim_style.left=pm.left;
        }
        if(pm.top !=""){
            anim_style.top = pm.top;
        }
        if(pm.width !=""){
            anim_style.width = pm.width;
        }
        if(pm.height !=""){
            anim_style.height=pm.height;
        }
        
        if(pm.opacity !=""){
            anim_style.opacity=$.convertOpacity(pm.opacity);
        }
        
        if(pm.color !=""){
            anim_style.color = $.convertColor(pm.color);
        }
        
        
        
        var target ="";
        
        if(pm.name !=""){ 
            
            //アニメーションスタックの積み上げ
            that.kag.pushAnimStack();
            
            $("."+pm.name).animate(
                anim_style,
                parseInt(pm.time), 
                pm.effect,
                function(){
                    
                    that.kag.popAnimStack();
            
                }
            );
        
        }else if(pm.layer !=""){
            
            var layer_name = pm.layer+"_fore";
            
            //フリーレイヤに対して実施
            if(pm.layer =="free"){
                layer_name = "layer_free";
            }
            
            //レイヤ指定の場合、その配下にある要素全てに対して、実施
            var target_array = $("."+layer_name).children();
            
            target_array.each(function(){
               
               that.kag.pushAnimStack();
            
               
               $(this).animate(
                    anim_style,
                    parseInt(pm.time), 
                    pm.effect,
                    function(){
                        that.kag.popAnimStack();
            
                    }
                );
               
            });
            
            
        }
        
        
        //次の命令へ　アニメーション終了街の場合は厳しい
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[wa]
:group
アニメーション関連
:title
アニメーション終了待ち
:exp
実行中のアニメーションすべて終了するまで処理を待ちます
:sample
:param
#[end]
*/

//トランジション完了を待つ
tyrano.plugin.kag.tag.wa={
    start:function(pm){
        this.kag.layer.hideEventLayer();
    }
};


//================キーフレームアニメーション系

/*
#[keyframe]
:group
アニメーション関連
:title
キーフレームアニメーション定義
:exp
キーフレームアニメーションを定義します。定義したアニメーションは[kanim]タグで指定することで使用できます
:sample

;----keyframeの定義
[keyframe name="fuwafuwa"]

[frame p=40%  x="100" ]
[frame p=100% y="-200" opacity=0 ]

[endkeyframe]

;-----定義したアニメーションを実行



:param
name=キーブレームの名前を指定します。後に[kanim]タグを使用する際に指定する名前になります
#[end]
*/

tyrano.plugin.kag.tag.keyframe ={
    
    vital:["name"],
    
    pm:{
        name:""
    },
    
    start:function(pm){
        
        this.kag.stat.current_keyframe = pm.name;
        
        this.kag.ftag.nextOrder();
            
    }
};


/*
#[endkeyframe]
:group
アニメーション関連
:title
キーフレームアニメーション定義を終了します
:exp
キーフレームアニメーション定義を終了します
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag.endkeyframe ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        this.kag.stat.current_keyframe = "";
        this.kag.ftag.nextOrder();
            
    }
};

/*
#[frame]
:group
アニメーション関連
:title
キーフレームアニメーション定義
:exp
キーフレームアニメーションを定義します。定義したアニメーションは[kanim]タグで指定することで使用できます
:sample
:param
p=パーセンテージを指定してください。例えば５秒かかるアニメーションに対して20%の位置という指定になります。0〜100%の間で指定してください。0%を省略することで前回のアニメーション状態を継承して新しいアニメーションを開始できます。,
x=X軸方向へのアニメーション量をpxで指定して下さい。　また、*(アスタリスク)で始めることで、絶対位置として指定することができます。（例） x="100"（前へ100px移動する） x="*100" 画面左端から100pxの位置へ移動する,
y=Y軸方向へのアニメーション量をpxで指定して下さい。　また、*(アスタリスク)で始めることで、絶対位置として指定することができます。（例） y="100"（前へ100px移動する） y="*100" 画面上端から100pxの位置へ移動する,
z=Z軸方向へのアニメーション量をpxで指定して下さい。　また、*(アスタリスク)で始めることで、絶対位置として指定することができます。（例） z="100"（前へ100px移動する） z="*100" こちらのタグを使用すると三次元を表現できますが、現状一部ブラウザ（safari iphone系）で動作します,
rotate=対象を回転させることができます。例　rotate="360deg"のような形で指定して下さい（３６０度回転）,
rotateX=対象をX軸を軸として回転させることができます。例　rotateX="360deg"のような形で指定して下さい（３６０度回転）,
rotateY=対象をY軸を軸として回転させることができます。例　rotateY="360deg"のような形で指定して下さい（３６０度回転）,
rotateZ=対象をZ軸を軸として回転させることができます。例　rotateZ="360deg"のような形で指定して下さい（３６０度回転）,
scale=対象を拡大、縮小することができます。例　scale="2" (２倍に拡大します) scale="0.5" 半分に縮小します,
scaleX=X方向に拡大、縮小できます,
scaleY=Y方向に拡大、縮小できます,
scaleZ=Z方向に拡大、縮小できます,
skew=傾斜,
skewX=X傾斜,
skewY=Y傾斜,
perspective=遠近効果を付与することができます。一部ブラウザのみ,
opacity=0～1を指定することで、各要素の透明度を指定することができます、非表示にしたりすることができます。0で完全に透明になります。
その他=CSSのスタイルを各種指定することができます。

#[end]
*/

tyrano.plugin.kag.tag.frame ={
    
    vital:["p"],
    
    pm:{
        p:""
    },
    
    master_trans:{
        "x":"",
        "y":"",
        "z":"",
        "translate":"",
        "translate3d":"",
        "translateX":"",
        "translateY":"",
        "translateZ":"",
        "scale":"",
        "scale3d":"",
        "scaleX":"",
        "scaleY":"",
        "scaleZ":"",
        "rotate":"",
        "rotate3d":"",
        "rotateX":"",
        "rotateY":"",
        "rotateZ":"",
        "skew":"",
        "skewX":"",
        "skewY":"",
        "perspective":""
    },
    
    start:function(pm){
        
        var percentage = pm.p;
        
        delete pm.p ;
        
        //!!!!!!!!!transかstyleかをここで振り分ける必要がありますよ！
        
        //色々定義できる
        
        if(this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]){
            
        }else{
            
            this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]= {};
            this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]["frames"]= {};
            this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]["styles"]= {};
            
        }
        
        
        var map_trans = {};
        var map_style = {};
        
        for(key in pm){
           
           if(this.master_trans[key] =="" ){
            map_trans[key] = pm[key];
           }else{
            map_style[key] = pm[key];
           }
        }
        
        
        this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]["frames"][percentage] ={"trans":map_trans,"styles":map_style};
        
        this.kag.ftag.nextOrder();
            
    }
};



/*
#[kanim]
:group
アニメーション関連
:title
キーフレームアニメーションの実行
:exp
キーフレームアニメーションを実行します。[keyframe]タグで定義した名前とアニメーションさせる画像やテキストを指定することで
複雑なアニメーションを実現できます。
:sample
:param
name=アニメーションさせる画像やテキストのnameを指定してください,
layer=nameを指定せずに、layerを指定することでそのlayerに属するエレメント全てにアニメーションを適用させることができます,
keyframe=実行するキーフレームアニメーション名を指定してください。,
time=アニメーションを実行する時間をミリ秒で指定してください。,
easing=アニメーションの変化パターンを指定することができます。
指定できる値として
ease(開始時点と終了時点を滑らかに再生する)　linear(一定の間隔で再生する)
ease-in(開始時点をゆっくり再生する)
ease-out(終了時点をゆっくり再生する)
ease-in-out(開始時点と終了時点をゆっくり再生する)
この他に、cubic-bezier関数を使って、イージングを独自に設定することも可能です
,
count = 再生回数を指定できます。初期値は１。"infinite"を指定することで無限にアニメーションさせることもできます。,
delay = 開始までの時間を指定できます。初期値は遅延なし(0)です。,
direction = 偶数回のアニメーションを逆再生するか指定できます。 初期値は"normal" 偶数回逆再生させる場合は、"alternate"を指定します,
mode = 再生前後の状態を指定できます。初期値は"forwards"で再生後の状態を維持します。 "none"を指定すると、再生後の状態を維持しません


#[end]
*/

tyrano.plugin.kag.tag.kanim ={
    
    vital:["keyframe"],
    
    pm:{
        "name":"",
        "layer":"",
        "keyframe":""
    },
    
    start:function(pm){
        
        var that = this;
        
        var anim = this.kag.stat.map_keyframe[pm.keyframe];
        
        var class_name = "."+pm.name;
        
        anim.config = pm;
        
        if(pm.time){
            pm.duration = parseInt(pm.time) +"ms";
        }
          
        //アニメーション完了したら、
        anim.complete = function(){
            
            that.kag.popAnimStack();
            
        }
        
        if(pm.name !=""){ 
            
            delete pm.name;
            delete pm.keyframe;
            
            that.kag.pushAnimStack();
            
            $(class_name).a3d(
                anim
            );
        
        }else if(pm.layer !=""){
            
            var layer_name = pm.layer+"_fore";
            
            //フリーレイヤに対して実施
            if(pm.layer =="free"){
                layer_name = "layer_free";
            }
            
            delete pm.name;
            delete pm.keyframe;
            delete pm.layer;
            
            
            //レイヤ指定の場合、その配下にある要素全てに対して、実施
            var target_array = $("."+layer_name).children();
            
            
            target_array.each(function(){
               
               that.kag.pushAnimStack();
               
               $(this).a3d(
                anim
                );
                
            });
            
            
        }
        
        
        this.kag.ftag.nextOrder();
            
    }
};



//=====================================

/*
#[chara_ptext]
:group
キャラクター操作
:title
キャラクターの発言名前欄表示と表情変更
:exp
[chara_config ptext="hogehoge"]という形式で定義した発言者のメッセージボックスにnameで指定した名前を設定できます。
さらに、faceパラメータを指定することで、同時に表情も変更できます。
このタグには省略して書くことができます。
#chara_name:face_name と　[ptext name="chara_name" face="face_name"] は同じ動作をします。
[chara_new]時に登録した画像ファイルはface="default"で指定できます。
[chara_new name="yuko" storage="yuko.png"  jname="ゆうこ"]
:param
name=[chara_new]で定義したnameを指定します。紐づいたjnameがptext欄に表示されます,
face=[chara_face]で定義したface名を指定してください
:sample

#[end]
*/
tyrano.plugin.kag.tag.chara_ptext ={
    
    
    pm:{
        
        name : "",
        face : ""
    },
    
    start:function(pm){
        
        if(pm.name==""){
            $("."+this.kag.stat.chara_ptext).html("");
        }else{
            
            var cpm =  this.kag.stat.charas[pm.name];
            
            if(cpm){
            //キャラクター名出力
                $("."+this.kag.stat.chara_ptext).html(cpm.jname);
            
            }else{
                //存在しない場合はそのまま表示できる
                 $("."+this.kag.stat.chara_ptext).html(pm.name);
            }
        }
        
        //表情の変更もあわせてできる
        if(pm.face !=""){
       		if(!(this.kag.stat.charas[pm.name]["map_face"][pm.face])){
        	    this.kag.error("指定されたキャラクター「"+pm.name+"」もしくはface:「"+pm.face+"」は定義されていません。もう一度確認をお願いします");
        	    return;
        	}
       		var storage_url = this.kag.stat.charas[pm.name]["map_face"][pm.face];
       		$("."+pm.name).attr("src",storage_url);
        }
        this.kag.ftag.nextOrder();
        
    }
};

/*
#[chara_config]
:group
キャラクター操作
:title
キャラクター操作タグの基本設定
:exp
キャラクター操作タグの基本設定を変更できます
:sample
:param
pos_mode=true か false　を指定します。デフォルトはtrueです。trueの場合は、[chara_show]タグなどで追加した時の立ち位置を自動的に計算し、配置します。,
ptext=発言者の名前領域のptextを指定できます。例えば[ptext name="name_space"] のように定義されていた場合、その後 #yuko のように指定するだけで、ptext領域キャラクターの名前を表示することができます。,
effect=キャラクターが位置を入れ替わる際のエフェクト（動き方）を指定できます。
jswing
｜def
｜easeInQuad
｜easeOutQuad
｜easeInOutQuad
｜easeInCubic
｜easeOutCubic
｜easeInOutCubic
｜easeInQuart
｜easeOutQuart
｜easeInOutQuart
｜easeInQuint
｜easeOutQuint
｜easeInOutQuint
｜easeInSine
｜easeOutSine
｜easeInOutSine
｜easeInExpo
｜easeOutExpo
｜easeInOutExpo
｜easeInCirc
｜easeOutCirc
｜easeInOutCirc
｜easeInElastic
｜easeOutElastic
｜easeInOutElastic
｜easeInBack
｜easeOutBack
｜easeInOutBack
｜easeInBounce
｜easeOutBounce
｜easeInOutBounce
,
#[end]
*/

tyrano.plugin.kag.tag.chara_config ={
    
    
    pm:{
        
        pos_mode : "true",
        effect:"swing",
        ptext:""
        
    },
    
    start:function(pm){
        
        this.kag.stat.chara_pos_mode = pm.pos_mode;
        this.kag.stat.chara_effect = pm.effect;
        this.kag.stat.chara_ptext = pm.ptext;
        
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[chara_new]
:group
キャラクター操作
:title
キャラクターの定義
:exp
登場するキャラクターの情報を定義します。その後[chara_show ]で指定した名称で表示したり、画像を変更したりできます。
また、ここで定義したname属性は[anim]タグなどからも指定可能です。
つまり、キャラクターを追加したあとアニメーションすることも自由にできます。
:sample
[chara_new name="yuko" storage="yuko.png"  jname="ゆうこ"]
:param
name=キャラクターを以後操作するための名前を半角英数で指定します。このnameは他のタグを含めて必ずユニークでなければなりません,
storage=キャラクター画像を指定してください。画像ファイルはプロジェクトフォルダのfgimageフォルダに配置してください,
width=画像の横幅を指定できます,
height=画像の高さを指定できます。,
jname=このキャラクターをネームスペースに表示する場合、適用する名称を指定できます。例えば、#yuko と指定すると　メッセージエリアに　ゆうこ　と表示できます
#[end]
*/

tyrano.plugin.kag.tag.chara_new ={
    
    vital:["name","storage"],
    
    pm:{
        
        name:"",
        storage:"",
        width:"",
        height:"",
        jname:"",
        visible:"false", 
        map_face:{}
    },
    
    start:function(pm){
        
        //イメージの追加
        
        var storage_url = "./data/fgimage/"+pm.storage;
        
        //HTTP対応
        if($.isHTTP(pm.storage)){
    	    storage_url	= pm.storage;	
    	}
      	
      	pm.map_face["default"] = storage_url;
        this.kag.preload(storage_url);
        
        //即座に追加
        if(pm.visible == "true"){
            
        }
        
        //前景レイヤ
        this.kag.stat.charas[pm.name] = pm;
        
        
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[chara_show]
:group
キャラクター操作
:title
キャラクターの登場
:exp
定義しておいたキャラクターを画面に表示します
:sample
[chara_show name="yuko" ]
:param
name=[chara_new]で定義したname属性を指定してください。,
time="ミリ秒で指定します。指定した時間をかけて登場します。デフォルトは1000ミリ秒です",
layer="キャラクターを配置するレイヤーを指定できます。デフォルトは前景レイヤ layer=0 です",
page="foreかbackを指定します。デフォルトはforeです",
wait="trueを指定すると、キャラクターの登場完了を待ちます。デフォルトはtrue です。",
left="キャラクターの横位置を指定できます。指定した場合、自動配置が有効であっても無効になります。",
top="キャラクターの縦位置を指定できます。指定した場合、自動配置が有効であっても無効になります。"

#[end]
*/

tyrano.plugin.kag.tag.chara_show ={
    
    vital:["name"],
    
    pm:{
        
        name:"",
        page:"fore",
        layer:"0",//レイヤーデフォルトは０に追加
        wait:"true", //アニメーションの終了を待ちます
        left:"0",  //chara_config でauto になっている場合は、自動的に決まります。指定されている場合はこちらを優先します。
        top:"0",  
        time:1000
        
    },
    
    start:function(pm){
        
        var that = this;
        
        var cpm =  this.kag.stat.charas[pm.name];
        
        if(cpm == null){
            this.kag.error("指定されたキャラクター「"+pm.name+"」は定義されていません。[chara_new]で定義してください");
            return;
        }
        
        var storage_url = "./data/fgimage/"+cpm.storage;
        
         if($.isHTTP(cpm.storage)){
    	    storage_url	= cpm.storage;	
    	}
        
        
        var img_obj = $("<img />");
	    img_obj.attr("src",storage_url);
	    img_obj.css("position","absolute");
	    img_obj.css("display","none");
	    //前景レイヤを表示状態にする
	        
        //画像は事前にロードしておく必要がありそう
        this.kag.preload(storage_url,function(){
        	
	        var target_layer = that.kag.layer.getLayer(pm.layer,pm.page);
	        target_layer.append(img_obj).show();
	        
	        
	        var chara_num = 1;
	        that.kag.layer.hideEventLayer();
	            
	        
	        //立ち位置を自動的に設定する場合
	        if(that.kag.stat.chara_pos_mode =="true" && pm.top=="0" && pm.left =="0"){
	            
	            //立ち位置自動調整
	            img_obj.css("bottom","0px");
	            
	            //既存キャラの位置を調整する
	            var chara_cnt = target_layer.find(".tyrano_chara").length;
	            
	            var sc_width = parseInt(that.kag.config.scWidth);
	            var sc_height = parseInt(that.kag.config.scHeight);
	            
	            var center = Math.floor(parseInt(img_obj.css("width"))/2);
	           
	            //一つあたりの位置決定
	            var base = Math.floor(sc_width/(chara_cnt+2));
	            var tmp_base = base;
	            var first_left = base - center;
	                     
	            img_obj.css("left",first_left+"px");
	            
	            //すべてのanimationが完了するまで、次へ進めないように指定
	            
	            target_layer.find(".tyrano_chara").each(function(){
	                
	                chara_num++;
	                
	                tmp_base +=base;
	                
	                var j_chara = $(this);
	                //この分をプラスする感じですね
	                center = Math.floor(parseInt(j_chara.css("width"))/2);
	                //1つ目は主人公にゆずる
	                var left = tmp_base - center;
	                
	                j_chara.animate(
	                    {
	                        left:left
	                    }
	                    ,
	                    parseInt(pm.time), 
	                    that.kag.stat.chara_effect,
	                    function(){
	                        chara_num--;
	                        if(chara_num == 0){
	                            that.kag.layer.showEventLayer();
	                            that.kag.ftag.nextOrder();
	                        }
	                    }
	                );
	                
	            });
	            
	            
	        }else{
	            
	            
	            img_obj.css("top",pm.top+"px");
	            img_obj.css("left",pm.left+"px");
	            
	            //that.kag.ftag.nextOrder();
	            
	        }
	        
	        //オブジェクトにクラス名をセットします name属性は一意でなければなりません
	        $.setName(img_obj,cpm.name);
	        img_obj.addClass("tyrano_chara"); //キャラクター属性を付与。
	        
	        //新しいスタイルの定義
	        
	        if(cpm.width!=""){
	            img_obj.css("width",cpm.width+"px");
	        }
	        
	        if(cpm.height!=""){
	            img_obj.css("height",cpm.height+"px");
	        }
	        
	        if(pm.wait!="true"){
	            that.kag.ftag.nextOrder();
	        }
	        
	        //アニメーションでj表示させます
	        img_obj.animate(
	                {
	                    opacity:"show"
	                },
	                {
	                    duration: pm.time, 
	                    easing:that.kag.stat.chara_effect,
	                    complete: function(){
	                        
	                        chara_num--;
	                        if(chara_num == 0){
	                            that.kag.layer.showEventLayer();
	                            
	                            if(pm.wait=="true"){
	                                that.kag.ftag.nextOrder();
	                            }
	                            
	                        }
	                        
	                    }//end complerte
	                }
	       );
                
        }); //end preload
        
       
    }
};



/*
#[chara_hide]
:group
キャラクター操作
:title
キャラクターの退場
:exp
[chara_show]タグで表示したキャラクターを退場させます。
:sample
[chara_hide name="yuko" ]
:param
name=[chara_new]で定義したname属性を指定してください。,
wait=trueを指定すると、キャラクターの退場を待ちます。デフォルトはtrueです。,
time=ミリ秒で指定します。指定した時間をかけて退場します。デフォルトは1000ミリ秒です,
layer=削除対象のレイヤ。chara_showの時にレイヤ指定した場合は、指定します。デフォルトは０,
overwrite=trueを指定した場合、nameのptextが既に画面に存在する場合、テキストのみを入れ替えることができます。デフォルトはfalse

#[end]
*/

tyrano.plugin.kag.tag.chara_hide ={
    
    vital:["name"],
    
    pm:{
        page:"fore",
        layer:"0",//レイヤーデフォルトは０に追加
        name:"",
        wait:"true",
        time:1000
        
    },
    
    start:function(pm){
        
        var that = this;
        
        var target_layer = this.kag.layer.getLayer(pm.layer,pm.page);
        
        var img_obj = target_layer.find("."+pm.name);
        
        
        var chara_num = 0;
        that.kag.layer.hideEventLayer();
 
        //アニメーションでj表示させます
        img_obj.animate(
                {
                    opacity:"hide"
                },
                {
                    duration: pm.time, 
                    easing: "linear",
                    complete: function(){
                        
                            img_obj.remove();
                            
                            if(that.kag.stat.chara_pos_mode =="true"){
                                
                                //既存キャラの位置を調整する
                                var chara_cnt = target_layer.find(".tyrano_chara").length;
                                var sc_width = parseInt(that.kag.config.scWidth);
                                var sc_height = parseInt(that.kag.config.scHeight);
                                
                                //一つあたりの位置決定
                                var base = Math.floor(sc_width/(chara_cnt+1));
                                var tmp_base = 0;
                                
                                if(chara_cnt == 0){
                                    that.kag.layer.showEventLayer();
                                    that.kag.ftag.nextOrder();
                                    return;
                                }
                                
                                target_layer.find(".tyrano_chara").each(function(){
                                    
                                    chara_num++;
                                    
                                    tmp_base +=base;
                                    
                                    var j_chara = $(this);
                                    //この分をプラスする感じですね
                                    var  center = Math.floor(parseInt(j_chara.css("width"))/2);
                                    //1つ目は主人公にゆずる
                                    var left = tmp_base - center;
                                    
                                    j_chara.animate(
                                        {
                                            left:left
                                        }
                                        ,
                                        parseInt(pm.time), 
                                        that.kag.stat.chara_effect,
                                        function(){
                                            
                                            chara_num--;
                                            if(chara_num == 0){
                                                that.kag.layer.showEventLayer();
                                                
                                                that.kag.ftag.nextOrder();
                                            }
                                            
                                        }
                                    );
                                    
                                });
                                
                                
                                //that.kag.ftag.nextOrder();
                            
                        }else{
                            
                            that.kag.layer.showEventLayer();
                            //that.kag.ftag.nextOrder();
                            
                        }
                    }//end complerte
                }
       ); // end animate
       
        //すぐに次の命令を実行
        if(pm.wait!="true"){
            this.kag.ftag.nextOrder();
        }
       
       //this.kag.ftag.nextOrder();
        
    }
    
};

/*
#[chara_delete]
:group
キャラクター操作
:title
キャラクター情報の削除
:exp
定義しておいたキャラクター情報を削除します。（画面から消す場合は[chara_hide]を使用してください）
:sample
[chara_delete="yuko" ]
:param
name=[chara_new]で定義したname属性を指定してください。

#[end]
*/

tyrano.plugin.kag.tag.chara_delete ={
    
    vital:["name"],
    
    pm:{
        
        name:""
        
    },
    
    start:function(pm){
        
       delete this.kag.stat.charas[pm.name];
       
       this.kag.ftag.nextOrder();
        
    }
    
};


/*
#[chara_mod]
:group
キャラクター操作
:title
キャラクター画像変更
:exp
画面のキャラクター画像を変更します。表情を変更する場合などに便利でしょう
:sample
[chara_mod name="yuko" storage="newface.png"]
:param
name=[chara_new]で定義したname属性を指定してください。,
face=[chara_face]で定義したface属性を指定してください,
storage=変更する画像ファイルを指定してください。ファイルはプロジェクトフォルダのfgimageフォルダに配置します。

#[end]
*/

tyrano.plugin.kag.tag.chara_mod ={
    
    vital:["name"],
    
    pm:{
        
        name:"",
        face:"",
        storage:"" 
        
    },
    
    start:function(pm){
    	
    	var storage_url ="";
       	if(pm.face !=""){
       		if(!(this.kag.stat.charas[pm.name]["map_face"][pm.face])){
        	    this.kag.error("指定されたキャラクター「"+pm.name+"」もしくはface:「"+pm.face+"」は定義されていません。もう一度確認をお願いします");
        	    return;
        	}
       		storage_url = this.kag.stat.charas[pm.name]["map_face"][pm.face];
       	}else{
       		
	        if($.isHTTP(pm.storage)){
	    	    storage_url	= pm.storage;	
	    	}else{
	    		storage_url = "./data/fgimage/"+pm.storage
	    	}	
	       	
       	}
       
       $("."+pm.name).attr("src",storage_url);
       
       this.kag.ftag.nextOrder();
        
    }
    
};


/*
#[chara_face]
:group
キャラクター操作
:title
キャラクター表情登録
:exp
キャラクターの表情画像を名称と共に登録できます
:sample

;表情の登録
[chara_face name="yuko" face="angry" storage="newface.png"]
;表情の適応
[chara_mod name="yuko" face="angry"]
;発言者の名前も同時にかえたい場合
[chara_ptext name="yuko" face="angry"]
;短縮して書けます。以下も同じ意味
#yuko:angry
;chara_new で登録した画像はdefaultという名前で指定可能
#yuko:default


:param
name=[chara_new]で定義したname属性を指定してください。,
face=登録する表情の名前を指定してください,
storage=変更する画像ファイルを指定してください。ファイルはプロジェクトフォルダのfgimageフォルダに配置します。

#[end]
*/

tyrano.plugin.kag.tag.chara_face ={
    
    vital:["name","face","storage"],
    
    pm:{
        
        name:"",
        face:"",
        storage:"" 
        
    },
    
    start:function(pm){
    	
    	var storage_url ="";
       
        if($.isHTTP(pm.storage)){
    	    storage_url	= pm.storage;	
    	}else{
    		storage_url = "./data/fgimage/"+pm.storage
    	}
    	
    	this.kag.stat.charas[pm.name]["map_face"][pm.face]=storage_url;
       	this.kag.ftag.nextOrder();
        
    }
    
};



/*
#[showlog]
:group
システム操作
:title
バックログを表示します
:exp
バックログを表示します
:sample
[showlog]
:param
#[end]
*/

tyrano.plugin.kag.tag.showlog ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        this.kag.menu.displayLog();
        
    }
    
};


