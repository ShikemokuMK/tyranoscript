
tyrano.plugin.kag.menu ={
    
    tyrano:null,
    kag:null,
    
    snap:null,
    
    init:function(){
        
    },
    
    showMenu:function(call_back){
        
        var that = this;
        
        this.kag.stat.is_skip = false;
        
        var layer_menu = this.kag.layer.getMenuLayer();
        
        layer_menu.html("");


/*
 

<div class="display_menu" style="z-index: 10000; width: 740px; height: 780px; position: absolute; background-color:white; display:block;:auto;"align="center">
    <div class="menu_item menu_close" style="float:right;"><img src="tyrano/images/kag/menu_button_close.png" /></div>
    <div style="clear:both"></div>
    <div class="menu_item menu_save"><img src="tyrano/images/kag/menu_button_save.gif" /></div>
    <div class="menu_item menu_load"><img src="tyrano/images/kag/menu_button_save.gif" /></div>
    <div class="menu_item menu_window_close"><img src="tyrano/images/kag/menu_button_save.gif" /></div>
    <div class="menu_item menu_skip"><img src="tyrano/images/kag/menu_button_save.gif" /></div>
    <div class="menu_item menu_back_title"><img src="tyrano/images/kag/menu_button_save.gif" /></div>
</div>


 * 
 * */

        var menu_html = ""
                
        +'<div class="display_menu" style="z-index: 10000; width:100%; height:100%; position: absolute; display:block;" align="center">'
        +'    <div class="menu_item menu_close" style="float:right;width:64px;"><img src="tyrano/images/kag/menu_button_close.png" /></div>'
        +'    <div style="clear:both"></div>'
        +'    <div class="menu_item menu_save"><img src="tyrano/images/kag/menu_button_save.gif" /></div>'
        +'    <div class="menu_item menu_load"><img src="tyrano/images/kag/menu_button_load.gif" /></div>'
        +'    <div class="menu_item menu_window_close"><img src="tyrano/images/kag/menu_message_close.gif" /></div>'
        +'    <div class="menu_item menu_skip"><img src="tyrano/images/kag/menu_button_skip.gif" /></div>'
        +'    <div class="menu_item menu_back_title"><img src="tyrano/images/kag/menu_button_title.gif" /></div>'
        +'</div>';
        
        var j_menu_img =$("<img src='tyrano/images/kag/menu_bg.jpg' style=left:0px;top:0px;position:absolute;z-index:100' />");
        
        j_menu_img.css("width",this.kag.config.scWidth);
        j_menu_img.css("height",this.kag.config.scHeight);
        
        layer_menu.append(j_menu_img);
                
        var j_menu = $(menu_html);
        
            
        layer_menu.append(j_menu);
    
        layer_menu.find(".menu_skip").click(function(){
            
            //スキップを開始する
            layer_menu.html("");
            layer_menu.hide();
            $(".button_menu").show();
            
            //nextOrder にして、
            that.kag.stat.is_skip = true;
            that.kag.ftag.nextOrder();
            
        });
        
        layer_menu.find(".menu_close").click(function(){
            layer_menu.hide();
            $(".button_menu").show();
        });
        
        layer_menu.find(".menu_window_close").click(function(){
            
            //ウィンドウ消去
            that.kag.layer.hideMessageLayers();
            
            layer_menu.hide();
            $(".button_menu").show();
            
        });
        
        layer_menu.find(".menu_save").click(function(){
            
            that.displaySave();
            
        });
        
        layer_menu.find(".menu_load").click(function(){
            
            that.displayLoad();
            
        });
        
        //タイトルに戻る
        layer_menu.find(".menu_back_title").click(function(){
            
            /*
            if(!confirm("タイトルに戻ります。よろしいですね？")){
                return false;
            }
            */
            //first.ks の *start へ戻ります
            location.reload();
        });
        
        layer_menu.show();
        $(".button_menu").hide();
         
    },
    
    //displaySave displayLoadこの２つだな
    
    displaySave:function(){
        
        //セーブ画面作成
            //セーブ個数は５個までにしておくか
            
            var that = this;
            
            this.kag.stat.is_skip = false;
        
            
            var array_save = that.getSaveData();
            
            var array = array_save.data; //セーブデータ配列
            
            var j_save = $("<div></div>");
            
            
            for(var i=0;i<array.length;i++){
               
                (function(){
                   
                    var _data = array[i];
                    var _i = i;
                    
                    //var html ="<div class='save_display_area'><span class='save_menu_font' style='font-size:10px;'>【"+(i+1)+"】"+_data.save_date+"</span><br/><span class='save_menu_font' style='font-size:14px;'>"+_data.title+"</span></div>";
                    var html ="<div class='save_display_area' style=''><span class='save_menu_date_font' style=''>【"+(i+1)+"】"+_data.save_date+"</span><br/><span class='save_menu_text_font' style=''>"+_data.title+"</span></div>";
                    
                    
                    var save = $(html);
                
                    j_save.append(save);
                    
                    save.css("cursor","pointer");
                    
                    save.click(function(){
                        
                        //デフォルトシステムからの場合はスナップクリア
                        that.snap = null;
                        
                        that.doSave(_i);
                        
                        var layer_menu = that.kag.layer.getMenuLayer();
                        layer_menu.hide();
                        $(".button_menu").show();
            
                        
                    });
                    
                })();
                
            
            }
            
            //背景素材挿入
            var j_menu_save_img =$("<img src='tyrano/images/kag/menu_save_bg.jpg' style='z-index:-1;left:0px;top:0px;position:absolute;' />");
            j_menu_save_img.css("width",this.kag.config.scWidth);
            j_menu_save_img.css("height",this.kag.config.scHeight);
            j_save.append(j_menu_save_img);
        
            that.setMenu(j_save);
            
    },
    
    //セーブを実行する
    doSave:function(num){
        
        
        var array_save = this.getSaveData();
        
        var data = {};
        
        if(this.snap == null){
            this.snapSave(this.kag.stat.current_message_str);
        }
        
        //現在、停止中のステータスなら、
        if(this.snap.stat.is_strong_stop == true){
            alert("ここではセーブできません");
            return false;
        }
        
        
        data = this.snap;
        
        
        data.save_date = $.getNowDate()+"　"+$.getNowTime();
        
         
        array_save.data[num] = data;
                       
         $.setStorage(this.kag.config.projectID+"_tyrano_data",array_save);
                            
        
    },
    
    //セーブ状態のスナップを保存します。
    snapSave:function(title,scenario,order_index){
        
        scenario = scenario || "";
        order_index = order_index || "";
        
        var data = {};
        
        data.title = title;
        data.stat = this.kag.stat;
        data.current_order_index = this.kag.ftag.current_order_index; //１つ前
        data.save_date = $.getNowDate()+"　"+$.getNowTime();
        
        //レイヤ部分のHTMLを取得
        var layer_obj = this.kag.layer.getLayeyHtml();
        data.layer = layer_obj;
        
        this.snap= $.extend(true, {}, $.cloneObject(data));
        //現在のシナリオ上書き。Save.ksから呼び出された場合、うまく機能しないのに対応
        if(scenario !=""){
            this.snap.stat.current_scenario = scenario;
        }
        
        if(order_index !=""){
            this.snap.current_order_index = order_index;
            
        }
        
    },
    
    //ロード画面の呼び出し
    displayLoad:function(){
            
            var that = this;
            
            this.kag.stat.is_skip = false;
        
            
            var array_save = that.getSaveData();
            var array = array_save.data; //セーブデータ配列
            
            
            var j_save = $("<div></div>");
            
            
            for(var i=0;i<array.length;i++){
               
                (function(){
                   
                    var _data = array[i];
                    var _i = i;
                    
                    var html ="<div class='save_display_area' style=''><span class='save_menu_date_font' style=''>【"+(i+1)+"】"+_data.save_date+"</span><br/><span class='save_menu_text_font' style=''>"+_data.title+"</span></div>";
                    var save = $(html);
                
                    j_save.append(save);
                    
                    save.css("cursor","pointer");
                    
                    save.click(function(){
                       
                       that.loadGame(_i);
                        
                        //レイヤメニュー
                        var layer_menu = that.kag.layer.getMenuLayer();
                        layer_menu.hide();
                        $(".button_menu").show();
                      
                        
                    });
                    
                })();
            
            }
            
             //背景素材挿入
            var j_menu_save_img =$("<img src='tyrano/images/kag/menu_load_bg.jpg' style='z-index:-1;left:0px;top:0px;position:absolute;' />");
            j_menu_save_img.css("width",this.kag.config.scWidth);
            j_menu_save_img.css("height",this.kag.config.scHeight);
            j_save.append(j_menu_save_img);
            
            that.setMenu(j_save);
        
    },
    
    
    //ゲームを途中から開始します
    loadGame:function(num){
       
       var array_save = this.getSaveData();
       var array = array_save.data; //セーブデータ配列
       
       var auto_next = "yes";
       
       data = $.extend(true,{},array[num]) ;
       
        //layerの復元
        this.kag.layer.setLayerHtml(data.layer);
        
        //その他ステータスの設定
        this.kag.stat = data.stat;
        
        //停止の場合は復活
        this.kag.stat.is_strong_stop = false;
        
        //一旦音楽と効果音は全て止めないと
        
        this.kag.ftag.startTag("stopbgm",{stop:"true"});
        this.kag.ftag.startTag("stopse",{stop:"true"});
         
        //音楽再生
        if(this.kag.stat.current_bgm != ""){
        
            var mstorage = this.kag.stat.current_bgm;
            
            var pm ={
                loop:"true",
                storage:mstorage,
                /*fadein:"true",*/
                /*time:2000,*/
                stop:"true"
            }
            
            this.kag.ftag.startTag("playbgm",pm);
    
        }
        
        
        //ジャンプ
        //data.stat.current_scenario; 
        //data.current_order_index;
        //必ず、ファイルロード。別シナリオ経由的な
        //this.kag.ftag.startTag("call",{storage:"make.ks"});
        
        var insert = {
          
          name:"call",
          pm:{storage:"make.ks"},
          val:"" 
            
        };
        
        this.kag.ftag.nextOrderWithIndex(data.current_order_index,data.stat.current_scenario,true,insert,auto_next);
        
        
    },
    
    //メニュー画面に指定のJクエリオブジェクト追加
      setMenu:function(j_obj){
            
            var that = this;
        
            var layer_menu = this.kag.layer.getMenuLayer();
        
            layer_menu.html("");
        
            var menu_html = ""
        
            +"<div class='menu_item menu_close' style='float:right;'><img src='tyrano/images/kag/menu_button_close.png' /></div>"
            +"<div style='clear:both'></div>"
            +"";
        
            var j_menu = $(menu_html);
            layer_menu.append(j_menu);

            layer_menu.find(".menu_close").click(function(){
                layer_menu.hide();
                $(".button_menu").show();
                that.kag.ftag.nextOrder();
            
            });
            
            layer_menu.show();
            layer_menu.append(j_obj);
            
            
        },
        
    
    //メニューを隠します
    hideMenu:function(){
        
    },
    
    //セーブデータを取得します
    getSaveData:function(){
        
        var tmp_array = $.getStorage(this.kag.config.projectID+"_tyrano_data");
        
        if(tmp_array){
        
            // データがある場合は一覧として表示します
            return eval("("+tmp_array+")");
            
        }else{
            
            tmp_array = new Array();
            
            var root = {kind:"save"};
            
            for(var i=0;i<5;i++){
            
                var json ={};
                json.title  = "まだ、保存されているデータがありません"; // ラストテキスト
                json.current_order_index = 0;
                json.save_date = "　";
                json.stat = {};
                
                tmp_array.push(json);
            
            }
            
            root.data = tmp_array;
            
            return root;
        
        }
        
    },
    
      
    test:function(){
        
    }
};


