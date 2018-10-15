tyrano.plugin.kag.menu = {

    tyrano : null,
    kag : null,

    snap : null,

    init : function() {

    },

    showMenu : function(call_back) {
                    
        if (this.kag.layer.layer_event.css("display") == "none" && this.kag.stat.is_strong_stop != true) {
            return false;
        }
        
        //wait中の時
        if(this.kag.stat.is_wait == true){
            return false;
        }
        
        var that = this;

        this.kag.stat.is_skip = false;
        this.kag.stat.is_auto = false;
        this.kag.stat.is_auto_wait = false;
        
        var layer_menu = this.kag.layer.getMenuLayer();

        layer_menu.empty();
        
        var button_clicked = false;

        this.kag.html("menu", {
            "novel" : $.novel
        }, function(html_str) {

            var j_menu = $(html_str);

            layer_menu.append(j_menu);

            layer_menu.find(".menu_skip").click(function(e) {

                //スキップを開始する
                layer_menu.html("");
                layer_menu.hide();
                if (that.kag.stat.visible_menu_button == true) {
                    $(".button_menu").show();
                }
                //nextOrder にして、
                that.kag.stat.is_skip = true;

                ///処理待ち状態の時は、実行してはいけない
                if (that.kag.layer.layer_event.css("display") == "none") {
                    //alert("今、スキップしない");
                    //that.kag.ftag.nextOrder();
                } else {
                    //alert("スキップするよ");
                    that.kag.ftag.nextOrder();

                }
                
                e.stopPropagation();


            });

            layer_menu.find(".menu_close").click(function(e) {
                layer_menu.hide();
                if (that.kag.stat.visible_menu_button == true) {
                    $(".button_menu").show();
                }
                
                e.stopPropagation();

            });

            layer_menu.find(".menu_window_close").click(function(e) {

                //ウィンドウ消去
                that.kag.layer.hideMessageLayers();

                layer_menu.hide();
                if (that.kag.stat.visible_menu_button == true) {
                    $(".button_menu").show();
                }
                
                e.stopPropagation();


            });

            layer_menu.find(".menu_save").click(function(e) {
                
                //連続クリック対策
                if(button_clicked==true){
                    return;
                }
                button_clicked = true;

                that.displaySave();
                e.stopPropagation();

            });

            layer_menu.find(".menu_load").click(function(e) {
                //連続クリック対策
                if(button_clicked==true){
                    return;
                }
                button_clicked = true;

                that.displayLoad();
                e.stopPropagation();

            });

            //タイトルに戻る
            layer_menu.find(".menu_back_title").click(function() {
                
                that.kag.backTitle();
                
                /*
                if (!confirm($.lang("go_title"))) {
                    return false;
                }
                */
                //first.ks の *start へ戻ります
                //location.reload();
            });
            
            $.preloadImgCallback(j_menu,function(){
                layer_menu.fadeIn(300);
                $(".button_menu").hide();
            },that);

        });

    },

    displaySave : function(cb) {

        //セーブ画面作成

        var that = this;

        this.kag.stat.is_skip = false;

        var array_save = that.getSaveData();
        var array = array_save.data;
        //セーブデータ配列

        var layer_menu = that.kag.layer.getMenuLayer();

        for (var i = 0; i < array.length; i++) {
            array[i].num = i;
        }

        this.kag.html("save", {
            array_save : array,
            "novel" : $.novel
        }, function(html_str) {
            
            var j_save = $(html_str);

            //フォントをゲームで指定されているフォントにする。
            j_save.find(".save_list").css("font-family", that.kag.config.userFace);

            j_save.find(".save_display_area").each(function() {

                $(this).click(function(e) {
                    var num = $(this).attr("data-num");

                    that.snap = null;
                    
                    var layer_menu = that.kag.layer.getMenuLayer();
                    layer_menu.hide();
                    layer_menu.empty();
                    if (that.kag.stat.visible_menu_button == true) {
                        $(".button_menu").show();
                    }
                    
                    that.doSave(num,function(){
                        
                        if(typeof cb=="function"){
                            cb();
                        }
                        
                    });
                    
                    
                });
            });
            
            //スマホの場合はボタンの上下でスクロールできるようにする
            j_save.find(".button_smart").hide();
            if($.userenv()!="pc"){
                j_save.find(".button_smart").show();
                j_save.find(".button_arrow_up").click(function(){
                    var now = j_save.find(".area_save_list").scrollTop();
                    var pos = now - 160;
                    layer_menu.find(".area_save_list").animate({scrollTop:pos},{queue:false});
                });
                
                j_save.find(".button_arrow_down").click(function(){
                    var now = j_save.find(".area_save_list").scrollTop();
                    var pos = now + 160;
                    j_save.find(".area_save_list").animate({scrollTop:pos},{queue:false});
                });
                
            }
            

            var layer_menu = that.kag.layer.getMenuLayer();

            that.setMenu(j_save,cb);

        });

        //背景素材挿入
        /*
         var j_menu_save_img =$("<img src='tyrano/images/kag/menu_save_bg.jpg' style='z-index:-1;left:0px;top:0px;position:absolute;' />");
         j_menu_save_img.css("width",this.kag.config.scWidth);
         j_menu_save_img.css("height",this.kag.config.scHeight);
         j_save.append(j_menu_save_img);
         */

    },

    //セーブを実行する
    doSave : function(num,cb) {

        var array_save = this.getSaveData();

        var data = {};
        var that = this;

        if (this.snap == null) {
            //ここはサムネイルイメージ作成のため、callback指定する
            this.snapSave(this.kag.stat.current_save_str, function() {
                //現在、停止中のステータスなら、[_s]ポジションからセーブデータ取得

                /*
                 if(that.snap.stat.is_strong_stop == true){
                 alert("ここではセーブできません");
                 return false;
                 }
                 */

                data = that.snap;
                data.save_date = $.getNowDate() + "　" + $.getNowTime();
                array_save.data[num] = data;
                $.setStorage(that.kag.config.projectID + "_tyrano_data", array_save, that.kag.config.configSave);
                
                if(typeof cb=="function"){
                    //終わったタイミングでコールバックを返す
                    cb();
                }

            });

        }else{
            
            if(typeof cb=="function"){
                //終わったタイミングでコールバックを返す
                cb();
            }
            
        }

    },

    setQuickSave : function() {
        var that = this;

        var saveTitle = that.kag.stat.current_save_str;

        that.kag.menu.snapSave(saveTitle, function() {
            var data = that.snap;
            data.save_date = $.getNowDate() + "　" + $.getNowTime();
            $.setStorage(that.kag.config.projectID + "_tyrano_quick_save", data, that.kag.config.configSave);
        });
    },

    loadQuickSave : function() {
        var data = $.getStorage(this.kag.config.projectID + "_tyrano_quick_save", this.kag.config.configSave);

        if (data) {
            data = JSON.parse(data);
        } else {
            return false;
        }

        this.loadGameData($.extend(true, {}, data));
    },

    //doSaveSnap 自動セーブのデータを保存する
    doSetAutoSave : function() {

        var data = this.snap;
        data.save_date = $.getNowDate() + "　" + $.getNowTime();
        $.setStorage(this.kag.config.projectID + "_tyrano_auto_save", data, this.kag.config.configSave);

    },

    //自動保存のデータを読み込む
    loadAutoSave : function() {
        var data = $.getStorage(this.kag.config.projectID + "_tyrano_auto_save",this.kag.config.configSave);

        if (data) {
            data = JSON.parse(data);
        } else {
            return false;
        }

        this.loadGameData($.extend(true, {}, data),{"auto_next":"yes"});
    },

    //セーブ状態のスナップを保存します。
    snapSave : function(title, call_back,flag_thumb) {

        var that = this;

        //画面のキャプチャも取るよ
        var _current_order_index = that.kag.ftag.current_order_index - 1;
        var _stat = $.extend(true, {}, $.cloneObject(that.kag.stat));
        
        if(typeof flag_thumb =="undefined"){
            flag_thumb = this.kag.config.configThumbnail;
        }
        
        if (flag_thumb == "false") {

            //サムネデータを保存しない
            var img_code = "";
            var data = {};

            data.title = title;
            data.stat = _stat;
            data.current_order_index = _current_order_index;
            //１つ前
            data.save_date = $.getNowDate() + "　" + $.getNowTime();
            data.img_data = img_code;

            //レイヤ部分のHTMLを取得
            var layer_obj = that.kag.layer.getLayeyHtml();
            data.layer = layer_obj;

            that.snap = $.extend(true, {}, $.cloneObject(data));

            if (call_back) {
                call_back();
            }

        } else {

            $("#tyrano_base").find(".layer_blend_mode").css("display","none");
                
            setTimeout(function() {
                
                var completeImage = function(img_code){
                    
                    var data = {};
    
                    data.title = title;
                    data.stat = _stat;
                    data.current_order_index = _current_order_index;
                    //１つ前
                    data.save_date = $.getNowDate() + "　" + $.getNowTime();
                    data.img_data = img_code;

                    //レイヤ部分のHTMLを取得
                    var layer_obj = that.kag.layer.getLayeyHtml();
                    data.layer = layer_obj;

                    that.snap = $.extend(true, {}, $.cloneObject(data));

                    if (call_back) {
                        call_back();
                    }
                        
                };
                
                if(that.kag.stat.save_img !=""){
                    var img = new Image();
                    img.src=_stat.save_img 
                    img.onload = function(){
                        
                        var canvas = document.createElement('canvas');
                        canvas.width  = that.kag.config.scWidth;
                        canvas.height = that.kag.config.scHeight;
                        // Draw Image
                        var ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        // To Base64
                        var img_code = that.createImgCode(canvas);
                        
                        completeImage(img_code);
                        
                        
                    };
                
                }else{
                    
                    var tmp_base = $("#tyrano_base");
                    
                    var tmp_left = tmp_base.css("left");
                    var tmp_top = tmp_base.css("top");
                    var tmp_trans = tmp_base.css("transform");
                    
                    tmp_base.css("left",0);
                    tmp_base.css("top",0);
                    tmp_base.css("transform", "");
                    
                    html2canvas(tmp_base.get(0), {
                        onrendered : function(canvas) {
                            
                            $("#tyrano_base").find(".layer_blend_mode").css("display","");
                            
                            // canvas is the final rendered <canvas> element
                            //console.log(canvas);
                            var img_code = that.createImgCode(canvas);
                            
                            completeImage(img_code);
                        
                        },
                        height:that.kag.config.scHeight,
                        width:that.kag.config.scWidth
                        
                    });
                    
                    tmp_base.hide();
                    tmp_base.css("left",tmp_left);
                    tmp_base.css("top",tmp_top);
                    tmp_base.css("transform", tmp_trans);
                    tmp_base.show();
                }

            }, 20);

        }

    },
    
    //サムネ画像の作成　thanks @hororo_memocho 
    createImgCode:function(canvas){
        
        var code = "";
        
        var q = this.kag.config.configThumbnailQuality
        
        if(q=="low"){
            code = canvas.toDataURL("image/jpeg",0.3);
        }else if(q =="middle"){
            code = canvas.toDataURL("image/jpeg",0.7);
        }else{
            code = canvas.toDataURL();
        }
        
        return code;
        
    },
    
    setGameSleep:function(next_flag){
        
        //awake時にnextOrderするか否か
        if(next_flag){
            this.kag.tmp.sleep_game_next = true;    
        }else{
            this.kag.tmp.sleep_game_next = false;    
        }
        
        this.kag.tmp.sleep_game = this.snap;
        
    },
    

    displayLoad : function(cb) {

        var that = this;

        this.kag.stat.is_skip = false;

        var array_save = that.getSaveData();
        var array = array_save.data;
        //セーブデータ配列

        var layer_menu = that.kag.layer.getMenuLayer();

        for (var i = 0; i < array.length; i++) {
            array[i].num = i;
        }

        this.kag.html("load", {
            array_save : array,
            "novel" : $.novel
        }, function(html_str) {
            var j_save = $(html_str);

            j_save.find(".save_list").css("font-family", that.kag.config.userFace);

            j_save.find(".save_display_area").each(function() {

                $(this).click(function(e) {
                    var num = $(this).attr("data-num");
                    
                    //セーブデータが存在しない場合
                    if(array[num]["save_date"]==""){
                        return ;
                    }
                    
                    that.snap = null;
                    that.loadGame(num);

                    var layer_menu = that.kag.layer.getMenuLayer();
                    layer_menu.hide();
                    layer_menu.empty();
                    if (that.kag.stat.visible_menu_button == true) {
                        $(".button_menu").show();
                    }
                    
                });
            });
            
            
            //スマホの場合はボタンの上下でスクロールできるようにする
            j_save.find(".button_smart").hide();
            if($.userenv()!="pc"){
                j_save.find(".button_smart").show();
                j_save.find(".button_arrow_up").click(function(){
                    var now = j_save.find(".area_save_list").scrollTop();
                    var pos = now - 160;
                    layer_menu.find(".area_save_list").animate({scrollTop:pos},{queue:false});
                });
                
                j_save.find(".button_arrow_down").click(function(){
                    var now = j_save.find(".area_save_list").scrollTop();
                    var pos = now + 160;
                    j_save.find(".area_save_list").animate({scrollTop:pos},{queue:false});
                });
                
            }
            

            var layer_menu = that.kag.layer.getMenuLayer();

            that.setMenu(j_save,cb);

        });

    },

    //ゲームを途中から開始します
    loadGame : function(num) {

        var array_save = this.getSaveData();
        var array = array_save.data;
        //セーブデータ配列

        //保存されていないデータはロード不可
        if (array[num].save_date == "") {
            return;
        }
        
        var auto_next = "no";
        
        if(array[num].stat.load_auto_next==true){
            auto_next = "yes";
        }
        
        this.loadGameData($.extend(true, {}, array[num]),{"auto_next":auto_next});

    },

    loadGameData : function(data,options) {

        var auto_next = "no";
        
        //普通のロードの場合
        if(typeof options =="undefined"){
            options={bgm_over:"false"};
        }else if(typeof options.bgm_over == "undefined"){
            options["bgm_over"] = "false";
        }
        
        if(options.auto_next){
            auto_next = options.auto_next;
        }
        
        //Live2Dモデルがある場合の後始末
        if(typeof Live2Dcanvas != "undefined"){
            for(model_id in Live2Dcanvas){
                if(Live2Dcanvas[model_id]){
                    Live2Dcanvas[model_id].check_delete = 2;
                    Live2D.deleteBuffer(Live2Dcanvas[model_id].modelno);
                    delete Live2Dcanvas[model_id];
                }
            }
        }
            
        
        //layerの復元
        this.kag.layer.setLayerHtml(data.layer);
        
        //バックログの初期化
        //awakegame考慮もれ。一旦戻す
        //this.kag.variable.tf.system.backlog = [];
        
        //ステータスの設定、ディープに設定する
        this.kag.stat = data.stat;
        
        //ステータスがストロングストップの場合
        if (this.kag.stat.is_strong_stop == true) {
            auto_next = "stop";
        } else {
            //停止の場合は復活
            this.kag.stat.is_strong_stop = false;
        }

        //タイトルの復元
        this.kag.setTitle(this.kag.stat.title);
        
        //一旦音楽と効果音は全て止めないと
        
        //BGMを引き継ぐかどうか。
        if(options.bgm_over=="false"){
            
            //全BGMを一旦止める
            var map_se = this.kag.tmp.map_se;
            for (var key in map_se) {
                if(map_se[key]){
                    this.kag.ftag.startTag("stopse", {
                        stop : "true",
                        buf:key
                    });
                }
            }
            
            var map_bgm = this.kag.tmp.map_bgm;
            for (var key in map_bgm) {
                this.kag.ftag.startTag("stopbgm", {
                        stop : "true",
                        buf:key
                });
            }
            

            //音楽再生
            if (this.kag.stat.current_bgm != "") {
    
                var mstorage = this.kag.stat.current_bgm;
                
                var pm = {
                    loop : "true",
                    storage : mstorage,
                    /*fadein:"true",*/
                    /*time:2000,*/
                    stop : "true"
                };
                
                //ボリュームが設定されいる場合
                if(this.kag.stat.current_bgm_vol !=""){
                    pm["volume"] = this.kag.stat.current_bgm_vol;
                }
                
                this.kag.ftag.startTag("playbgm", pm);
    
            }
            
            //効果音再生
            for(key in this.kag.stat.current_se){
                var pm_obj = this.kag.stat.current_se[key];
		        pm_obj["stop"] = "true";
		        this.kag.ftag.startTag("playse", pm_obj);
		        
		    }
            
        }
        
        //読み込んだCSSがある場合
        if(this.kag.stat.cssload){
	    	for(file in this.kag.stat.cssload){
		    	var style = '<link rel="stylesheet" href="'+file+ "?" + Math.floor(Math.random() * 10000000)+'">';
				$('head link:last').after(style);
    
	    	}
        
	    }else{
		    this.kag.stat.cssload = {};
	    }
        
        if(!this.kag.stat.current_bgmovie){
            this.kag.stat.current_bgmovie = {
                storage:"",
                volume:"" 
            };
        }
        
        //カメラ設定を復旧 ///////////////
        if(this.kag.config.useCamera=="true"){
            
            $(".layer_camera").css({
                        "-animation-name":"",
                        "-animation-duration":"",
                        "-animation-play-state":"",
                        "-animation-delay":"",
                        "-animation-iteration-count":"",
                        "-animation-direction": "",
                        "-animation-fill-mode": "",
                        "-animation-timing-function":""
            });
            
            for(key in this.kag.stat.current_camera){
                
                var a3d_define = {
                    frames : {
                        "0%" : {
                            trans : this.kag.stat.current_camera[key]
                        },
                        "100%" : {
                            trans : this.kag.stat.current_camera[key]
                        }
                    },
                    
                    config : {
                        duration : "5ms",
                        state : "running",
                        easing : "ease"
                    },
                    
                    complete:function(){
                        //特に処理なし        
                    }
                    
                };
                
                //アニメーションの実行
                if(key=="layer_camera"){
                    
                    $(".layer_camera").css("-webkit-transform-origin", "center center");
                    setTimeout(function(){
                        $(".layer_camera").a3d(a3d_define);
                    },1);
 
                }else{
                    
                    $("."+key+"_fore").css("-webkit-transform-origin", "center center");
                    setTimeout(function(){
                        $("."+key +"_fore").a3d(a3d_define);
                    },1);
 
                }
                
            }
            
        }
        ///////////カメラここまで
        
        
        
        
        //どの道動画削除。
        $(".tyrano_base").find("video").remove();
        this.kag.tmp.video_playing = false;
            
            
        //背景動画が設定中なら
        if (this.kag.stat.current_bgmovie["storage"] !=""){
            
            var vstorage = this.kag.stat.current_bgmovie["storage"];
            var volume   = this.kag.stat.current_bgmovie["volume"];
            
            var pm = {
                
                storage:vstorage,
                volume :volume,
                stop:"true"
                
            };
            
            this.kag.tmp.video_playing = false;
            
            this.kag.ftag.startTag("bgmovie", pm);
            
        }

        //カーソルの復元
        this.kag.setCursor(this.kag.stat.current_cursor);
        
        //メニューボタンの状態
        if(this.kag.stat.visible_menu_button == true){
            $(".button_menu").show();
        }else{
            $(".button_menu").hide();
        }

        //イベントの復元
        $(".event-setting-element").each(function() {
            var j_elm = $(this);
            var kind = j_elm.attr("data-event-tag");
            var pm = JSON.parse(j_elm.attr("data-event-pm"));
            var event_tag = object(tyrano.plugin.kag.tag[kind]);
            event_tag.setEvent(j_elm, pm);

        });

        //ジャンプ
        //data.stat.current_scenario;
        //data.current_order_index;
        //必ず、ファイルロード。別シナリオ経由的な
        //this.kag.ftag.startTag("call",{storage:"make.ks"});

        //auto_next 一旦makeを経由するときに、auto_nextを考えておく
        //alert(auto_next);
        
        
        var insert = {

            name : "call",
            pm : {
                storage : "make.ks",
                "auto_next" : auto_next
            },
            val : ""

        };

        //auto_next = "yes";

        //make.ks を廃止したい
        //var insert =undefined;
        
        //添付変数は消す。
        this.kag.clearTmpVariable();
        
        this.kag.ftag.nextOrderWithIndex(data.current_order_index, data.stat.current_scenario, true, insert, "yes");
        
        

    },

    //メニュー画面に指定のJクエリオブジェクト追加
    setMenu : function(j_obj,cb) {

        var that = this;

        var layer_menu = this.kag.layer.getMenuLayer();

//        layer_menu.empty();

        j_obj.find(".menu_close").click(function(e) {
            
            layer_menu.fadeOut(300,function(){
                layer_menu.empty();
                
                if(typeof cb=="function"){
                    //終わったタイミングでコールバックを返す
                    cb();
                }
                
            });
            if (that.kag.stat.visible_menu_button == true) {
                $(".button_menu").show();
            }

        });

        j_obj.hide();
        layer_menu.append(j_obj);
        layer_menu.show();
        $.preloadImgCallback(layer_menu,function(){
            j_obj.fadeIn(300);
            layer_menu.find(".block_menu").fadeOut(300);
        },that);
        
    },

    //メニューを隠します
    hideMenu : function() {

    },

    //セーブデータを取得します
    getSaveData : function() {

        var tmp_array = $.getStorage(this.kag.config.projectID + "_tyrano_data",this.kag.config.configSave);
        
        if (tmp_array) {

            // データがある場合は一覧として表示します
            //return eval("(" + tmp_array + ")");
            return JSON.parse(tmp_array);


        } else {
            tmp_array = new Array();

            var root = {
                kind : "save"
            };
            
            //セーブ数の上限を変更する。
            var save_slot_num = this.kag.config.configSaveSlotNum || 5;
            
            for (var i = 0; i < save_slot_num; i++) {

                var json = {};
                json.title = $.lang("not_saved");
                // ラストテキスト
                json.current_order_index = 0;
                json.save_date = "";
                json.img_data = "";
                json.stat = {};

                tmp_array.push(json);

            }

            root.data = tmp_array;

            return root;

        }

    },

    //バックログ画面表示
    displayLog : function() {

        var that = this;
        this.kag.stat.is_skip = false;

        var j_save = $("<div></div>");

        this.kag.html("backlog", {
            "novel" : $.novel
        }, function(html_str) {

            var j_menu = $(html_str);

            var layer_menu = that.kag.layer.getMenuLayer();
            layer_menu.empty();
            layer_menu.append(j_menu);

            layer_menu.find(".menu_close").click(function() {
                layer_menu.fadeOut(300,function(){
                    layer_menu.empty();
                    });
                if (that.kag.stat.visible_menu_button == true) {
                    $(".button_menu").show();
                }
            });
            
            //スマホの場合はボタンの上下でスクロールできるようにする
            layer_menu.find(".button_smart").hide();
            if($.userenv()!="pc"){
                layer_menu.find(".button_smart").show();
                layer_menu.find(".button_arrow_up").click(function(){
                    var now = layer_menu.find(".log_body").scrollTop();
                    var pos = now - 60;
                    layer_menu.find(".log_body").animate({scrollTop:pos},{queue:false});
                });
                
                layer_menu.find(".button_arrow_down").click(function(){
                    var now = layer_menu.find(".log_body").scrollTop();
                    var pos = now + 60;
                    layer_menu.find(".log_body").animate({scrollTop:pos},{queue:false});
                });
                
            }

            var log_str = "";

            var array_log = that.kag.variable.tf.system.backlog;

            for (var i = 0; i < array_log.length; i++) {
                log_str += array_log[i] + "<br />";
            }

            layer_menu.find(".log_body").html(log_str);
            
            layer_menu.find(".log_body").css("font-family", that.kag.config.userFace);

            
            $.preloadImgCallback(layer_menu,function(){
                layer_menu.fadeIn(300);
                //一番下固定させる
                layer_menu.find(".log_body").scrollTop(9999999999);

            },that);
        

            $(".button_menu").hide();

        });

    },

    //画面をフルスクリーンにします
    screenFull : function() {

        if ($.isNWJS() == true) {
            var gui = require("nw.gui");
            var win = gui.Window.get();
            if (win.isFullscreen) {
                win.leaveFullscreen();
            } else {
                win.enterFullscreen();
            }
            
        }else{
            
            var isFullScreen = document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.fullScreenElement || false;
            var isEnableFullScreen = document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || false;
            var elem = document.body;
            
            if( isEnableFullScreen ){
                    
                    if (elem.requestFullscreen) {
                        if(isFullScreen){
                            document.exitFullscreen();
                        }else{
                            elem.requestFullscreen();
                        } 
                    } else if (elem.webkitRequestFullscreen) {
                        if(isFullScreen){
                            document.webkitExitFullscreen();
                        }else{
                            elem.webkitRequestFullscreen();
                        }
                    } else if (elem.mozRequestFullScreen) {
                        if(isFullScreen){
                            document.mozCancelFullScreen();
                        }else{
                            elem.mozRequestFullScreen();
                        }
                    } else if (elem.msRequestFullscreen) {
                        if(isFullScreen){
                            document.msExitFullscreen();
                        }else{
                            elem.msRequestFullscreen(); 
                        }                    
                    }
            }
            
        }
        
    },

    test : function() {

    }
};

