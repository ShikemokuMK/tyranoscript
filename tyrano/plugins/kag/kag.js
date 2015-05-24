

tyrano.plugin.kag ={

    tyrano:null,
    
    kag:null,
    
    sound_swf:null,
    
    cache_html:{},
    
    config:{
      
      defaultStorageExtension:"jpg",
      projectID : "tyranoproject"  ,
      preload:"on",
      skipSpeed:"30"
        
    }, //読み込んできた値 Config.tjs の値
    
    //変更されることが無い静的な値
    define:{
        TYRANO_ENGINE_VERSION:0.30,
        "BASE_DIV_NAME":"tyrano_base",
        FLAG_APRI : false,
        "www":""
        
    },
    

    
    //動作オプション
    options:{
        modules:["parser","tag","layer","menu","tag_audio","tag_system","tag_ext","key_mouse","event"]
    },
    
    
    //各種変数
    variable:{
        //f:{},//ゲーム変数 stat に移動
        sf:{},//システム変数
        tf:{}//一時変数
        //mp:{}//マクロに引き渡された変数がココに入る
        
    },
    
    //一時保存オブジェクト
    tmp:{
        
        checking_macro:false, //マクロの登録時はスタックにつまれない
        
        num_anim:0, //実行中のアニメーションスタック
        map_bgm:{}, //再生中の音楽オーディオ
        map_se:{} //再生中の効果音
        
    },
    
    //逐次変化するKAGシステムの動作に必要な状況変化ファイル
    //セーブデータなどは保存する必要ありますよ
    //文字列データしか入れちゃダメ
    
    stat:{
        map_label:{}, //ラベル情報保持
        map_macro:{}, //マクロの情報保持
        
        vertical:"false", //縦書き
        
        f:{}, //ゲーム変数はstatの中
        mp:{},//マクロもstat
        
        current_layer:"message0", //現在のメッセージレイヤ
        current_page:"fore",
        is_stop:false,//停止中。クリックしても先に進ませない
        
        is_strong_stop:false,// [s]タグで立ち止まってる状態。強力な停止中。解除するにはジャンプやマクロが呼び出せれる
        strong_stop_recover_index:0, //[s]タグ指定中に保存した場合、戻ってくるindex [_s]時のindexを保持しておく
        
        is_nowait:false, //ノーウェイト、テキスト瞬間表示状態
        
        current_message_str:"ゲームスタート", //現在表示中のメッセージ
        
        current_keyframe:"", //キーフレームの名前、スタートしている場合はキーフレーム名が入る
        map_keyframe:{},     //キーフレームアニメーション情報を登録
        
        is_script:false,//スクリプト解析中。
        buff_script:"", //スクリプトを格納しておく
        
        is_html:false, //htmlタグ解析中
        map_html : {}, //htmlタグに関するステータス
        
        
        stack:{"if":[],"call":[],"macro":[]}, //if文のスタック
        
        set_text_span:false,//メッセージ中のspanを新しく作成するときに真にする
        current_scenario:"first.ks",//シナリオファイルを指定する
        is_skip:{},
        current_bgm:"", //現在再生中のBGM
        
        current_line:0, //実行中の命令の実際のファイル行　エラーや警告時に使用
        
        is_hide_message:false, //メッセージエリアが非表示状態か否か
        
        is_click_text:false, //テキストメッセージがクリックされた常態化否か
        is_adding_text:false,//テキストメッセージを追加中か否か
        
        flag_ref_page:false, //このフラグが立っている場合、次のクリックで画面がクリアされます。
        
        ruby_str:"", //ここに文字列が入っている場合は、次の１文字出力時にルビとして適応する
        
        ch_speed:30, //文字表示スピード
        
        flag_glyph : "false", //クリック待ちボタンが指定されているか否か
        current_cursor:"auto", //現在のカーソル指定
        
        //表示フォント指定
        font:{
            enable:false,
            color:"",
            bold:"",
            size:"",
            face:""
        },
        
        //表示位置調整
        locate:{
            x:0,
            y:0
        },
        
        //リセットされた時に適応されるオリジナルフォント設定
        default_font:{
            color:"",
            bold:"",
            size:""
        },
        
        /*** キャラクター操作系 ***/
        //キャラクターの立ち位置を自動的に調整する事ができます
        chara_pos_mode:"true",
        chara_effect:"swing",
        chara_ptext:"",
        chara_time:"600",
        chara_memory:"false",
        chara_anim:"true",  //キャラクター追加時、位置が変わる場合にアニメーションで表示するか否か
        //定義されたキャラクター情報
        charas:{},
        
        play_bgm:true, //BGMを再生するか否か
        play_se:true,  //SEを再生するか否か
        
        title:"" //ゲームのタイトル
        
    }, //ゲームの現在の状態を保持する所 状況によって、いろいろ変わってくる
    
    
    init:function(){
     
        this.kag = this;
     
        var that = this;
     
        this.tyrano.test();
        
        //コンフィグファイルの読み込み
        this.parser.loadConfig(function(map_config){
        
            that.config = $.extend(true, that.config, map_config);
            that.init_game();//ゲーム画面生成
            
        });
        
        //アプリか否かの設定 
        $("script").each(function(){
        
            if($(this).attr("src")){
                if($(this).attr("src").indexOf("cordova")!=-1 || $(this).attr("src").indexOf("phonegap")!=-1){
                    that.define.FLAG_APRI = true;
                }
            }
        
        });
        
        //フラッシュの設定
        try{
            var browser = $.getBrowser();
            //音楽再生にFLASHは関係なくなった
            /*
            if(browser == "firefox" || browser =="opera" || (browser =="safari" && $.userenv()=="pc" ) ){
                
                if($.isFlashInstalled() != true){
                    alert("FLASHがインストールされていないため、音楽が再生されません。");
                }else{
                    this.kag.sound_swf = $.swfName("externalnovelsound");
                }
                
            }
            */
           
        }catch(e){
            console.log(e);
        }
        
        
        
    },
    
    //スクリプトを解釈して実行する
    evalScript:function(str){
      
      var TG = this;
     
       var f = this.stat.f;
       var sf = this.variable.sf;
       var tf = this.variable.tf;
       var mp = this.stat.mp;
       
       eval(str);
       
       this.saveSystemVariable();
       
    },
    
    //式を評価して値を返却します
    embScript:function(str,preexp){
       
       var f = this.stat.f;
       var sf = this.variable.sf;
       var tf = this.variable.tf;
       var mp = this.stat.mp;
       
       return eval(str);
        
    },
    
    //システム変数を保存する
    saveSystemVariable:function(){
        
        $.setStorage(this.kag.config.projectID+"_sf", this.variable.sf );
        
    },
    
    //すべての変数クリア
    clearVariable:function(){
        
        this.stat.f ={}; //ゲーム変数
        this.variable.sf ={}; //システム変数
        this.variable.tf ={}; //一時変数かな
        
        this.saveSystemVariable();
        
    },
    
///スタック管理用
    pushStack:function(name,flag){
      this.stat.stack[name].push(flag);
    },
    
    popStack:function(name){
        return this.stat.stack[name].pop();
    },
    
    getStack:function(name){
        return this.stat.stack[name][this.stat.stack[name].length-1];
    },
    
    //催行日に値を設定
    setStack:function(name,flag){
        this.stat.stack[name][this.stat.stack[name].length-1] = flag;
    },

    
    endStorage:function(){
        
        //ファイルの終端に来た時、スタックがたまってたらそこに戻らせる
        var pm = this.kag.getStack("call"); //最新のコールスタックを取得
        //呼び出し元に戻る 
        
        if(pm==null){
           //console.log("---------終端---------");
           //this.kag.error("シナリオの終端まで、きてしまいました");
           return false;
        }
        
        this.kag.ftag.nextOrderWithIndex(pm.index,pm.storage);
        this.kag.popStack("call");//スタックを奪い取る
        
    },
    
/////////////ゲーム初期化////////////

    init_game:function(){
        
        var that = this;
        
        //kag.parser 追加
        this.parser = object(tyrano.plugin.kag.parser);
        this.parser.kag = that;
            
        //kag.tag追加 tagが全部星している
        this.ftag    = object(tyrano.plugin.kag.ftag);
        this.ftag.kag = that;
        this.ftag.init();
            
        //layer 追加　
        this.layer  = object(tyrano.plugin.kag.layer);
        this.layer.kag = that;
        this.layer.init();
        
        //menu 追加
        this.menu = object(tyrano.plugin.kag.menu);
        this.menu.kag = that;
        this.menu.init();

        //key_mouse 追加
        this.key_mouse = object(tyrano.plugin.kag.key_mouse);
        this.key_mouse.kag = that;
        this.key_mouse.init();

        //event 追加
        this.event = object(tyrano.plugin.kag.event);
        this.event.kag = that;
        this.event.init();

        //システム変数の初期化
        var tmpsf = $.getStorage(this.kag.config.projectID+"_sf");
        
        if(tmpsf == null){
            this.variable.sf ={};
        }else{
            this.variable.sf = eval("("+tmpsf+")");
        }
        
        /////////////システムで使用する変数の初期化設定////////////////////
        
        //自動セーブのデータがあるかどうか
        var auto_save_data = $.getStorage(this.kag.config.projectID+"_tyrano_auto_save");
    	
    	this.variable.sf["system"] ={};
    	
    	if(auto_save_data){
        	this.variable.sf["system"]["autosave"] = true;
        }else{
        	this.variable.sf["system"]["autosave"] = false;
        }
        
        //バックログ保存用の設定
        this.variable.tf["system"] = {};
        this.variable.tf["system"]["backlog"] = [];
        
         //コンフィグボタン追加
         var button_menu_obj = $("<div class='button_menu' style='z-index:100000000'><img src='./tyrano/images/kag/"+$.novel("file_button_menu")+"'  /></div>");
            
         //コンフィグボタンの位置を指定する
            
         if(this.kag.config.configLeft !="-1" && this.kag.config.configTop !="-1"){
             button_menu_obj.css("left",parseInt(this.kag.config.configLeft));
             button_menu_obj.css("top",parseInt(this.kag.config.configTop));
         }else{
             button_menu_obj.css("left",this.config.scWidth -35);
             button_menu_obj.css("top",this.config.scHeight -35);
         }
            
         button_menu_obj.click(function(){
                that.menu.showMenu();
         });

        //コンフィグファイルを確認して、メニュー表示
        if(this.kag.config.configVisible=="false"){
            button_menu_obj.hide();
        }   
            
        $("."+this.kag.define.BASE_DIV_NAME).append(button_menu_obj);
        
        
        
        //tyranoの大本部分の調整
        this.tyrano.base.setBaseSize(this.config.scWidth,this.config.scHeight);
        
        //スマホの場合は、実施。 PCの場合でも画面を一致させる処理→すべての画面フィットさせる仕様に変更
//       if($.userenv() !="pc"){
            this.tyrano.base.fitBaseSize(that.config.scWidth,that.config.scHeight);
            //スマホの場合、傾いた時に再計算させる
            $(window).bind("load orientationchange resize",function(){
                if(Math.abs(window.orientation) === 90){
                    if(window.pageYOffset===0){window.scrollTo(0,1);}
                    that.tyrano.base.fitBaseSize(that.config.scWidth,that.config.scHeight);
                }
                else{
                    if (window.pageYOffset === 0) { window.scrollTo(0,1); }
                    that.tyrano.base.fitBaseSize(that.config.scWidth,that.config.scHeight);
                
                }
            });
//        }
        
        
        this.layer.addLayer("base");
        
        //メッセージレイヤの追加
        this.layer.addLayer("message0");
        
        //メッセージ外枠部分の作成
        var j_message = $("<div class='message_outer'></div>");
        j_message
        .css("background-color",$.convertColor(this.config.frameColor))
        .css("opacity",$.convertOpacity(this.config.frameOpacity))
        .css("left",eval(this.config.ml))
        .css("top",eval(this.config.mt))
        .css("width",eval(this.config.mw))
        .css("height",eval(this.config.mh))
        .css("z-index",100);
        
        j_message.l_visible;
        
        this.layer.appendObj("message0","fore",j_message);
        
        //メッセージ表示領域
        var j_message_inner = $("<div class='message_inner' style='z-index:1001'></div>");
        
        //禁則処理
        if(this.config.WordBreak == "false"){
            j_message_inner.css("word-break","break-all");
        }
        
        this.layer.appendObj("message0","fore",j_message_inner);
       
       /*********************************/ 
       ///messege1 ２個目のメッセージレイヤ。ここは指定回数分作成できるようにする必要があるかも
        
        var num_message_layer = parseInt(this.config.numMessageLayers);
        
        for(var i=1 ;i<num_message_layer;i++){
        
            var message_layer_name = "message"+i;
        
            this.layer.addLayer(message_layer_name);
            //２個め移行はデフォルト非表示
            this.layer.getLayer(message_layer_name).attr("l_visible","false");
            this.layer.getLayer(message_layer_name).hide();
            var j_message1 = j_message.clone(false);
            
            this.layer.appendObj(message_layer_name,"fore",j_message1);
            var j_message_inner1 = j_message_inner.clone(false);
            
            this.layer.appendObj(message_layer_name,"fore",j_message_inner1);
        
        }
        
        //メッセージレイヤの大きさをリフレッシュする命令
        this.layer.refMessageLayer();
        
        //指定された個数分、Foreレイヤを登録する
        var fore_layer_num = parseInt(this.config.numCharacterLayers);
        for(var i=0;i<fore_layer_num;i++){
            this.layer.addLayer(""+i);
            this.layer.getLayer(""+i,"fore")
            .css("display","none")
            .css("z-index",10); //デフォルト非表示　前景レイヤ
        }
        
        //デフォルトフォントの設定
        this.stat.default_font.color = $.convertColor(this.kag.config.defaultChColor);
        this.stat.default_font.bold  = $.convertBold(this.kag.config.defaultBold);
        this.stat.default_font.size  = this.kag.config.defaultFontSize;
        this.stat.default_font.face  = this.kag.config.userFace;
        
        this.stat.vertical    = this.kag.config.vertical;
        
        //デフォルトフォントの状態を設定
        this.kag.stat.font = $.extend(true, $.cloneObject(this.kag.stat.font), this.stat.default_font);
        
        //タイトルの設定
        this.setTitle(this.config["System.title"]);
        
        //cursorの設定
        this.setCursor(this.config["cursorDefault"]);
        
        var first_scenario_file = "first.ks";
        
        if($("#first_scenario_file").size() >0){
        	first_scenario_file = $("#first_scenario_file").val();
        }
        
        //シナリオファイルの読み込み。parser から、シナリオを解析して、タグ管理画面を作る。
        this.loadScenario(first_scenario_file,function(array_tag){
            
            that.ftag.buildTag(array_tag);
            //最初にレイヤをコピーしておく、、、その必要はない！コメント化20122119
            //that.kag.ftag.startTag("backlay",{});
        
        });
        
    },
    
    //BackLogを格納します
    pushBackLog:function(str){
    	
    	var max_back_log = parseInt(this.kag.config["maxBackLogNum"]);
    	
    	if(max_back_log < 1 ) return ;
    	
    	this.variable.tf["system"]["backlog"].push(str);  
		
    	//上限を超えたらFILO で処理
    	if(max_back_log < this.variable.tf["system"]["backlog"].length){
    		this.variable.tf["system"]["backlog"].shift();
    	}
    	
    },
    
    //タイトル名を設定します
    setTitle:function(title){
        
        //タイトルの設定
        this.stat.title = title;
        document.title = title;
        
    },
    
    pushAnimStack:function(){
      this.kag.tmp.num_anim++;  
    },
    
    //ゲームのカーソルを指定する
    setCursor:function(cursor){
        
        this.stat.current_cursor = cursor;
        
        if(cursor ==="default"){
            //標準のカーソルをセット
            $("body").css("cursor","auto");
        }else{
            $("body").css("cursor","url(./data/image/"+cursor+"),default");
        }
        
    },
    
    
    popAnimStack:function(){
      
      if(this.kag.tmp.num_anim > 0){
        this.kag.tmp.num_anim--;
      }
           
      //すべてのアニメーションが終了したら、
      if(this.kag.tmp.num_anim <= 0){
          
          //停止中なら
          if(this.kag.stat.is_stop == true){
            this.kag.layer.showEventLayer();
            this.kag.ftag.nextOrder();
          }
      }
        
    },
            
    
    //シナリオファイルの読み込み
    loadScenario:function(file_name,call_back){
        
        var that = this;
        
        this.stat.current_scenario = file_name;
        
        //同じディレクトリにある、KAG関連のデータを読み込み
        
        var file_url = "";
        
        if($.isHTTP(file_name)){
    	    file_url = file_name;	
    	}else{
    		file_url = "./data/scenario/"+file_name;
    	}
        
        $.loadText(file_url,function(text_str){
            
            var result_obj = that.parser.parseScenario(text_str);
            
            var tag_obj = result_obj.array_s;
            var map_label = result_obj.map_label;
            
            //ラベル情報を格納
            that.stat.map_label = map_label;
            
            
            if(call_back){
                call_back(tag_obj);
            }
            
        });
        
    },
    
    getMessageInnerLayer:function(){
        return this.layer.getLayer(this.stat.current_layer,this.stat.current_page).find(".message_inner");  
    },
    
    getMessageOuterLayer:function(){
      return this.layer.getLayer(this.stat.current_layer,this.stat.current_page).find(".message_outer");  
    },
    
    getMessageCurrentSpan:function(){
        
        //ここでも、
        var j_obj = this.layer.getLayer(this.stat.current_layer,this.stat.current_page).find(".message_inner").find("p").find(".current_span");
        
        return j_obj;
    
    },
    
    //即座に新しい領域を確保
    setMessageCurrentSpan:function(){
        
        var jtext = this.getMessageInnerLayer();
        
        //縦書きと横書きで処理が別れる
        if(jtext.find("p").length == 0){
        
            if(this.stat.vertical == "true"){
                jtext.append($("<p class='vertical_text'></p>"));
            }else{
                jtext.append($("<p class=''></p>"));
            }

        }
        
        if(jtext.find("p").find(".current_span").length > 0){
        
            jtext.find("p").find(".current_span").removeClass("current_span");
            this.stat.set_text_span = false;
            
        }
        
        var j_span = $("<span class='current_span'></span>");
        
        jtext.find("p").append(j_span); //縦書きの場合、ここに追加されてないかも
        
        
        return j_span;
        
    },
    
    checkMessage:function(jtext){
        
        //新しい領域への切り替え
        if(this.stat.set_text_span ==true){
           jtext.find("p").find(".current_span").removeClass("current_span");
           this.stat.set_text_span = false; 
        }
        
        //必ず、spanが存在する
        if(jtext.find(".current_span").length ==0){
            jtext.find("p").append($("<span class='current_span'></span>"));
        }
        
    },
    
    //対象のメッセージエリアにテキストを挿入します。
    appendMessage:function(jtext,str){
        
        jtext.find("p").find(".current_span").html(str);
        
    },
    
    //画像のプリロード オンの場合は、ロードが完了するまで次へ行かない
    preload:function(src,callbk){
        
        var that = this;
        
        $('<img />').attr('src', src).load(function(e){
                if(callbk) callbk();
         }).error(function(e){
             
                //画像が見つからなかった時のエラー
                //that.kag.message(画像ファイル「"+src+"」が見つかりません");
                that.kag.error("画像ファイル「"+src+"」が見つかりません。場所はフルパスで指定されていますか？ (例)data/fgimage/file.png");
                
                if(callbk) callbk();
                
           });
           
    },
    
    //値が空白のものは設定しない
    setStyles:function(j_obj,array_style){
        
        for( key in array_style ){
            
            if(array_style[key]){
                if(array_style[key]==""){
                    
                }else{
                    j_obj.css(key,array_style[key]);
                }
            }
        }
        
        return j_obj;
        
    },
    
    //指定したHTMLを取得してかえす 
    html:function(html_file_name,data,callback){
        
        var that = this;
        
        data = (data || {});
        
        //キャッシュを確認して、すでに存在する場合はそれを返す
        if(this.cache_html[html_file_name]){
            if(callback){
                var tmpl = $.templates(this.cache_html[html_file_name]);
                var html = tmpl.render(data);
                callback($(html));
            }
        } else {
            $.loadText("./tyrano/html/"+html_file_name+".html",function(text_str){
            
                var tmpl = $.templates(text_str);
                var html = tmpl.render(data);
                
                //一度読みに行ったものは次回から読みに行かない
                that.cache_html[html_file_name] = text_str;
                
                if(callback){
                    callback($(html));
                }
            
            });
        }
        
    },
    
    error:function(str){
        
        if(this.kag.config["debugMenu.visible"] == "true"){
            
            //Error:first.ks：28行目:まるまるまる
            var current_storage = this.kag.stat.current_scenario;
            var line = parseInt(this.kag.stat.current_line) + 1;
            
            var err ="Error:"+current_storage+":"+line+"行目:"+str;
            
        }
      
    },
    //警告表示
    warning:function(str){
        if(this.kag.config["debugMenu.visible"] == "true"){
            alert(str);
        }
    },
    
    log:function(obj){
        
        if(this.kag.config["debugMenu.visible"] == "true"){
            console.log(obj);
        }
        
    },
    
    test:function(){
        
    }
};


//すべてのタグに共通する、拡張用
tyrano.plugin.kag.tag ={};

