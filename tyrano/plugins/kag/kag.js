
tyrano.plugin.kag ={
    
    version:450,
    
    tyrano:null,
    kag:null,
    sound_swf:null,
    
    is_rider:false, //ティラノライダーからの起動かどうか
    
    cache_html:{},
    
    cache_scenario : {},
    
    
    config:{
      
      defaultStorageExtension:"jpg",
      projectID : "tyranoproject",
      game_version:"0.0",
      preload:"on",
      skipSpeed:"30",
      patch_apply_auto:"true",
      mediaFormatDefault:"ogg",
      configSave:"webstorage"
        
    }, //読み込んできた値 Config.tjs の値
    
    //変更されることが無い静的な値
    define:{
        TYRANO_ENGINE_VERSION:400,
        "BASE_DIV_NAME":"tyrano_base",
        FLAG_APRI : false,
        "www":""
        
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
        
        ready_audio:false, //スマホブラウザ向け。オーディオ初期化を終えたか否か
        audio_context:false, //オーディオコンテキスト。起動時一回のみ生成
        num_anim:0, //実行中のアニメーションスタック
        map_bgm:{}, //再生中の音楽オーディオ
        map_se:{}, //再生中の効果音
        
        sleep_game:null, //sleepgame中はここにスナップが入る
        sleep_game_next:false, //awakegame時に次へNextOrderするか否か。
        
        base_scale:1,
        
        is_se_play:false, //seがプレイ中か否か
        is_se_play_wait:false, //seの終了を待ってるかどうか。
        
        is_vo_play:false, //ボイス再生中か否か
        is_vo_play_wait:false, //ボイスの終了を待ってるかどうか。
        
        is_bgm_play:false, //BGMがプレイ中か否か
        is_bgm_play_wait:false, //BGMの完了を待っているか否か。
        
        is_audio_stopping:false,//BGMがフェードアウト中かどうか。
        
        loading_make_ref:false, 
        
        wait_id:"", //waitをキャンセルするために使います。
        
        map_chara_talk_top:{}, //キャラトークのアニメーション中、開始のトップ位置を保持します。
        
        video_playing:false
        
        
       
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
        is_wait:false, //wait中。
        is_trans:false, //trans中
        
        is_wait_anim:false, //[wa]中
        
        is_strong_stop:false,// [s]タグで立ち止まってる状態。強力な停止中。解除するにはジャンプやマクロが呼び出せれる
        strong_stop_recover_index:0, //[s]タグ指定中に保存した場合、戻ってくるindex [_s]時のindexを保持しておく
        
        is_nowait:false, //ノーウェイト、テキスト瞬間表示状態
        
        current_message_str:"ゲームスタート", //現在表示中のメッセージ
        current_save_str:"", //セーブの時に使用するメッセージ
        
        current_keyframe:"", //キーフレームの名前、スタートしている場合はキーフレーム名が入る
        map_keyframe:{},     //キーフレームアニメーション情報を登録
        
        is_script:false,//スクリプト解析中。
        buff_script:"", //スクリプトを格納しておく
        
        is_html:false, //htmlタグ解析中
        map_html : {}, //htmlタグに関するステータス
        
        cssload:{}, //読み込んだCSSを保持する
        
        save_img:"", //セーブイメージ。ここにパスが入っている場合はその画像をサムネに使う。
        
        stack:{"if":[],"call":[],"macro":[]}, //if文のスタック
        
        set_text_span:false,//メッセージ中のspanを新しく作成するときに真にする
        current_scenario:"first.ks",//シナリオファイルを指定する
        is_skip:{},
        is_auto:{},
        current_bgm:"", //現在再生中のBGM
        current_bgm_vol:"", //現在再生中のBGMボリューム
        current_se:{}, //現在再生中のループ効果音
        
        load_auto_next:false,// ロード時にオートネクストするかどうか。showsave周りのときtrueになる。
        
        enable_keyconfig:true, //キーコンフィグが有効 or 無効
        
        current_bgmovie:{
            storage:"",
            volume:"" 
        }, //再生中の背景動画
        
        current_camera :{
        },
        current_camera_layer:"",
        
        
        is_move_camera:false, //カメラの演出中かどうか
        is_wait_camera:false, //カメラの演出を待ってるかどうか
        
        current_line:0, //実行中の命令の実際のファイル行　エラーや警告時に使用
        
        is_hide_message:false, //メッセージエリアが非表示状態か否か
        
        is_click_text:false, //テキストメッセージがクリックされた常態化否か
        is_adding_text:false,//テキストメッセージを追加中か否か
        
        flag_ref_page:false, //このフラグが立っている場合、次のクリックで画面がクリアされます。
        
        ruby_str:"", //ここに文字列が入っている場合は、次の１文字出力時にルビとして適応する
        
        ch_speed:"", //文字表示スピード
        
        skip_link:"true", //選択肢のあと、スキップを継続するかどうか。
        
        log_join:"false", //特定のタグの時に、ログが分裂しないようにするため。trueなら前のログに連結させる
        log_clear:false, // p cm などの文字クリアの時は、強制的に次のログ追加をjoinではなく、addにする
        
        f_chara_ptext:"false",
        
        flag_glyph : "false", //クリック待ちボタンが指定されているか否か
        current_cursor:"auto", //現在のカーソル指定
        
        //表示フォント指定
        font:{
            enable:false,
            color:"",
            bold:"",
            size:"",
            face:"",
            italic:""
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
            size:"",
            face:"",
            italic:"",
            edge:"", 
            shadow:""
        },
        
        //システム系で使用するHTMLの場所を保持
        sysview:{
			save:"./tyrano/html/save.html",
			load:"./tyrano/html/load.html",
			backlog:"./tyrano/html/backlog.html",
			menu:"./tyrano/html/menu.html"
		},
        
        /*** キャラクター操作系 ***/
        //キャラクターの立ち位置を自動的に調整する事ができます
        chara_pos_mode:"true",
        chara_effect:"swing",
        chara_ptext:"",
        chara_time:"600",
        chara_memory:"false",
        chara_anim:"true",  //キャラクター追加時、位置が変わる場合にアニメーションで表示するか否か
        pos_change_time:"600", //キャラクター自動配置のスピード
        
        chara_talk_focus:"none",
        chara_brightness_value:"60",
        chara_blur_value:"2",
        
        chara_talk_anim:"none", //キャラクターが話す時にアニメーションするかどうか
        chara_talk_anim_time:230,
        chara_talk_anim_value:30,
        
        
        apply_filter_str:"", 
        
        video_stack:null,
        is_wait_bgmovie :false,
        
        //定義されたキャラクター情報
        charas:{},
        jcharas:{},
        
        play_bgm:true, //BGMを再生するか否か
        play_se:true,  //SEを再生するか否か
        
        map_se_volume:{}, //セーブスロットごとにボリューム値を保持できる
        map_bgm_volume:{}, // 同上
        
        //ボイス周りの設定 vocoinfig
        map_vo:{
            vobuf:{},//ボイスとして指定するplayseのbuf
            vochara:{}//キャラ毎にボイスの設定が入る。
        },
        vostart:false, //vo管理が有効か否か
        
        log_write:true, //バックログを記録するか否か
        
        buff_label_name:"", //ラベル管理のもの、通過時にここに配置されて次にlabelに到達した時に記録される
        
        already_read:false, //現在の場所が既読済みか否かを保持する。ラベル通過時に判定
        
        visible_menu_button:false, //メニューボタンの表示状態
        
        title:"" //ゲームのタイトル
        
    }, //ゲームの現在の状態を保持する所 状況によって、いろいろ変わってくる
    
    
    init:function(){
     
        this.kag = this;
     
        var that = this;
     
        this.tyrano.test();
        
        //コンフィグファイルの読み込み
        this.parser.loadConfig(function(map_config){
            
            that.config = $.extend(true, that.config, map_config);
            
            //アップデートのチェック
            that.checkUpdate(function(){
            
                that.init_game(); //ゲーム画面生成
                
            });
            
            
        });
        
        //アプリか否かの設定 
        $("script").each(function(){
        
            if($(this).attr("src")){
                if($(this).attr("src").indexOf("cordova")!=-1 || $(this).attr("src").indexOf("phonegap")!=-1){
                    that.define.FLAG_APRI = true;
                }
            }
        
        });
        
        //ティラノプレイヤーを使ってるなら
        if(typeof TyranoPlayer == "function"){
            this.tmp.ready_audio = true;
        }
        
        //audio contextを設定　１回のみ実行
        var AudioContext = window.AudioContext // Default
        || window.webkitAudioContext // Safari and old versions of Chrome
        || false; 
        
        if(AudioContext){
            this.tmp.audio_context = new AudioContext();
        }
        
        
        
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
    
    //ローカルにアップデート用のファイルがある場合は、確認する
    checkUpdate:function(call_back){
        
        //NWJS環境以外では、アップデート不可
        if(!$.isNWJS()){
            call_back();
            return;  
        }
        
        //自動反映が無効の場合は反映しない
        if(this.kag.config.patch_apply_auto=="false"){
            call_back();
            return;  
        }
        
        var patch_path = $.localFilePath();
        var that = this;
        
        patch_path = patch_path + "/" + this.kag.config.projectID + ".tpatch";
        
        this.applyPatch(patch_path,"true",call_back)
        
    },
    
    //パッチを反映します。
    applyPatch:function(patch_path,flag_reload,call_back){
        
        //アップデートファイルの存在チェック
        var fs = require('fs');
        var fse = require('fs-extra'); 
        
        if (!fs.existsSync(patch_path)) {
            call_back();
            return;   
        }
        
        //リロードの場合は、アップデート不要
        if (fs.existsSync("./updated")) {
            call_back();
            return;   
        }
        
        var AdmZip = require('adm-zip');
        
        var path = require('path');
        var abspath = path.resolve("./");
        
        // reading archives 
        var zip = new AdmZip(patch_path);
        zip.extractAllTo("./update_tmp", true);
        
        fse.copySync("./update_tmp/","./");
		fse.removeSync("./update_tmp");
		
		//アップデートしたという証用
        if(flag_reload == "true"){
            fs.writeFileSync("./updated","true");
            location.reload();
        }else{
            call_back();
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
       
       if(this.kag.is_rider){
            this.kag.rider.pushVariableGrid();
       }
       
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
        
        $.setStorage(this.kag.config.projectID+"_sf", this.variable.sf ,this.kag.config.configSave);
        
    },
    
    //すべての変数クリア
    clearVariable:function(){
        
        this.stat.f ={}; //ゲーム変数
        this.variable.sf ={}; //システム変数
        
        //添付のシステムだけは残す
        this.clearTmpVariable();
        this.saveSystemVariable();
        
    },
    
    //添付変数の削除
    clearTmpVariable:function(){
        var tmp_sys = this.kag.variable.tf["system"];
        this.kag.variable.tf = {}; //一時変数かな
        this.kag.variable.tf["system"] = tmp_sys;
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
        
        this.kag.popStack("call");//スタックを奪い取る
        this.kag.ftag.nextOrderWithIndex(pm.index,pm.storage);
        
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
        
        //rider 追加
        this.rider = object(tyrano.plugin.kag.rider);
        this.rider.kag = that;
        this.rider.init();
        
        //システム変数の初期化
        var tmpsf = $.getStorage(this.kag.config.projectID+"_sf",that.config.configSave);
        
        if(tmpsf == null){
            this.variable.sf ={};
        }else{
            this.variable.sf = eval("("+tmpsf+")");
        }
        
        
        /////////////システムで使用する変数の初期化設定////////////////////
        //コンフィグ
        
        //システムが永続させたい変数はすぐにコンフィグに反映
        if(typeof that.variable.sf._system_config_bgm_volume !== "undefined") that.config["defaultBgmVolume"] = String(that.variable.sf._system_config_bgm_volume);
        if(typeof that.variable.sf._system_config_se_volume !== "undefined") that.config["defaultSeVolume"] = String(that.variable.sf._system_config_se_volume);
        //if(that.variable.sf._system_config_bgm_volume) that.config["defaultBgmVolume"] = that.variable.sf._system_config_bgm_volume;
        //if(that.variable.sf._system_config_se_volume) that.config["defaultSeVolume"] = that.variable.sf._system_config_se_volume;
        if(that.variable.sf._config_ch_speed) that.config["chSpeed"] = that.variable.sf._config_ch_speed;
        if(typeof that.variable.sf._system_config_auto_speed !== "undefined") that.config["autoSpeed"] = that.variable.sf._system_config_auto_speed;
        if(that.variable.sf._system_config_auto_click) that.config["autoClickStop"] = that.variable.sf._system_config_auto_click_stop;
        if(that.variable.sf._system_config_already_read_text_color) that.config["alreadyReadTextColor"] = that.variable.sf._system_config_already_read_text_color;
        if(typeof that.variable.sf._system_config_unread_text_skip != "undefined"){
            that.config["unReadTextSkip"] = that.variable.sf._system_config_unread_text_skip;
        }
         
        //自動セーブのデータがあるかどうか
        var auto_save_data = $.getStorage(this.kag.config.projectID+"_tyrano_auto_save",this.kag.config.configSave);
    	
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
         var button_menu_obj = $("<div class='button_menu' style='z-index:100000000'><img src='./tyrano/images/system/"+$.novel("file_button_menu")+"'  /></div>");
            
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
            this.kag.stat.visible_menu_button = false;
        }else{
            this.kag.stat.visible_menu_button = true;
        }
            
        $("."+this.kag.define.BASE_DIV_NAME).append(button_menu_obj);
        
        //カメラモードの調整
        /*
        if(this.kag.config["useCamera"] && this.kag.config["useCamera"]=="true"){
            this.kag.config["ScreenCentering"] = "false";
        }
        */
        
        //センタリングの調整
        if(this.kag.config["ScreenCentering"] && this.kag.config["ScreenCentering"]=="false"){
            
            //センタリングをキャンセルする
            $(".tyrano_base").css("transform-origin","0 0");
            $(".tyrano_base").css({
                margin: 0
            });
            
        }else{
            //指定がない or yes なら こっち
            //$(".tyrano_base").css("transform-origin","50 50");
            $(".tyrano_base").css("transform-origin","0 0");
            $(".tyrano_base").css({
                margin: 0
            });
            
        }
        
        //センタリングが有効な場合のみ
        /*
        if(this.kag.config["ScreenCentering"]=="true"){
            $("#tyrano_base").css("position","absolute");
        }
        */
        
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
        
        //１行目の上に余裕を持たせる。rubyカクつき対策
        $.insertRule(".message_inner p{ padding-top:"+this.kag.config.defaultLineSpacing+"px;}");
        
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
            .css("z-index",10+i); //デフォルト非表示　前景レイヤ
            
            this.layer.getLayer(""+i,"back")
            .css("display","none")
            .css("z-index",10+i); //デフォルト非表示　前景レイヤ
        
        }
        
        //デフォルトフォントの設定
        this.stat.default_font.color = $.convertColor(this.kag.config.defaultChColor);
        this.stat.default_font.bold  = $.convertBold(this.kag.config.defaultBold);
        this.stat.default_font.size  = this.kag.config.defaultFontSize;
        this.stat.default_font.face  = this.kag.config.userFace;
        
        //文字のアンチエイリアス効果 
        var smooth = this.kag.config.defaultAntialiased; //アンチエイリアス効果
        
        if(smooth == "2"){
            $(".tyrano_base").css("-webkit-font-smoothing","antialiased");
        }else if(smooth == "0"){
            $(".tyrano_base").css("-webkit-font-smoothing","none");
        }else{
            $(".tyrano_base").css("-webkit-font-smoothing","subpixel-antialiased");
        }
        
        //文字の影
        if(this.kag.config.defaultShadow == "true"){
            this.stat.default_font.shadow  = $.convertColor(this.kag.config.defaultShadowColor); 
        }
        
        //文字の縁
        if(this.kag.config.defaultEdge == "true"){
            this.stat.default_font.edge  = $.convertColor(this.kag.config.defaultEdgeColor); 
        }
        
        
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
        
        
        //ティラノライダーからの通知の場合、発生させる
        that.rider.complete(this);
        
        
    },
    
    
    
    //BackLogを格納します
    pushBackLog:function(str,type){
    	
    	//バックログを記録するか否か
    	if(this.stat.log_write ==false){
            return ;
        }
    	
    	type = type || "add";
    	
    	var max_back_log = parseInt(this.kag.config["maxBackLogNum"]);
    	
    	if(max_back_log < 1 ) return ;
    	
    	//バックログを必ずクリアしてから追加。pなどの通過後
    	if(this.kag.stat.log_clear==true){
        	type="add";
            this.kag.stat.log_clear=false; 
        }
    	
    	if(type=="join"){
        	
    	    var index = this.variable.tf.system.backlog.length-1;
    	    if(index >= 0){ //配列が存在しない場合はpushだ
    	       var tmp = this.variable.tf["system"]["backlog"][index];
    	       this.variable.tf["system"]["backlog"][this.variable.tf.system.backlog.length-1] = tmp + str;
		    }else{
    		    this.variable.tf["system"]["backlog"].push(str);  
		    }
		}else{
            this.variable.tf["system"]["backlog"].push(str);  
        }
        
        //セーブ用のテキストファイルを保存
        this.stat.current_save_str = this.variable.tf["system"]["backlog"][this.variable.tf.system.backlog.length-1];
        
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
    
    backTitle:function(){
        
        if ("appJsInterface" in window) {
            appJsInterface.finishGame();
        } else {
            
            if(typeof TyranoPlayer == "function"){
                //iphone
                location.href = "tyranoplayer-back://endgame";
            }else{
                //その他
                $.confirm($.lang("go_title"),
                    function(){
                        location.href="./index.html";
                    },
                    function(){
                          return false;
                    }
                );
            }
            
        }
        
    },
    
    //スキップ中に演出をカットする
    cutTimeWithSkip:function(time){
        if(this.kag.stat.is_skip == true){
            if(this.kag.config.skipEffectIgnore =="true"){
                //瞬時に終わるように設定
                return 70;
            }
        }
        return time;
    },
    
    //スマホブラウザ向け、音楽再生設定
    readyAudio:function(){
        
        this.tmp.ready_audio = true;
        
        if($.userenv() != "pc"){
            var pm = {
                loop : "false",
                storage : "",
                stop : "true"
            };
            
            //デフォルトは実行
            if(!this.tmp.map_bgm[0]){
                this.kag.ftag.startTag("playse", pm);
                this.kag.ftag.startTag("playbgm", pm);
            }
            
            var bgm_slot = parseInt(this.kag.config.defaultBgmSlotNum);
            var se_slot = parseInt(this.kag.config.defaultSoundSlotNum);
            
            for(var i=1;i< bgm_slot;i++){
                
                //バッファがまだない場合だけ
                pm.buf = i;
                if(this.tmp.map_bgm[pm.buf]){
                    this.kag.ftag.startTag("playbgm", pm);
                }
            }
            
            for(var i=1;i< se_slot;i++){
                
                //バッファがまだ無い場合だけ
                pm.buf = i;
                if(!this.tmp.map_se[pm.buf]){
                    this.kag.ftag.startTag("playse", pm);
                }
            }
            
            
        }
    
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
        if(this.kag.stat.is_wait_anim == true){
            this.kag.stat.is_wait_anim = false;
            this.kag.layer.showEventLayer();
            this.kag.ftag.nextOrder();
        }
      }
        
    },
            
    
    //シナリオファイルの読み込み
    loadScenario:function(file_name,call_back){
        
        var that = this;
        this.stat.is_strong_stop = true;
        
        this.stat.current_scenario = file_name;
        
        //同じディレクトリにある、KAG関連のデータを読み込み
        
        var file_url = "";
        
        if($.isHTTP(file_name)){
    	    file_url = file_name;	
    	}else{
    		file_url = "./data/scenario/"+file_name;
    	}
    	
    	//キャッシュ確認
    	if(that.cache_scenario[file_url]){
        	
            if(call_back){
                
                var result_obj = that.cache_scenario[file_url];
                
                var tag_obj = result_obj.array_s;
                var map_label = result_obj.map_label;
                
                //ラベル情報を格納
                that.stat.map_label = map_label;
                that.stat.is_strong_stop = false;
                
                call_back(tag_obj);
                
            }
            
        }else{
        
            $.loadText(file_url,function(text_str){
                
                var result_obj = that.parser.parseScenario(text_str);
                that.cache_scenario[file_url] = result_obj;
                
                var tag_obj = result_obj.array_s;
                var map_label = result_obj.map_label;
                
                //ラベル情報を格納
                that.stat.map_label = map_label;
                that.stat.is_strong_stop = false;
                
                
                if(call_back){
                    call_back(tag_obj);
                }
                
            });
            
        }
        
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
    
    //配列の先読み
    preloadAll:function(storage,callbk){
        
        var that = this;
        //配列で指定された場合
        if ( typeof storage == "object" && storage.length >= 0) {
            
            if(storage.length==0){
                callbk();
                return;
            }
            
            var sum = 0;

            for (var i = 0; i < storage.length; i++) {

                that.kag.preload(storage[i], function() {
                    sum++;
                    if (storage.length == sum) {
                        callbk();
                    }
                });
            }

        } else {
            this.kag.preload(pm.storage, function() {
                callbk();
            });
        }
            
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
	        
	        //存在しない場合は初期化
	        if(!this.kag.stat.sysview){
		        this.kag.stat.sysview = {};
		        this.kag.stat.sysview = {
					save:"./tyrano/html/save.html",
					load:"./tyrano/html/load.html",
					backlog:"./tyrano/html/backlog.html",
					menu:"./tyrano/html/menu.html"
				};
		    }
	        
	        var path_html = this.kag.stat.sysview[html_file_name];
	        
            $.loadText(path_html, function(text_str){
            
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
            
            $.error_message(err);
            
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

