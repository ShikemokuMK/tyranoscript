
tyrano.plugin.kag.layer ={

    tyrano:null,
    kag:null,
    
    layer_event:{},
    
    layer_menu:{}, //メニュー用の画面。イベントレイヤーよりも更に上
    
    layer_free:{},// フリーレイヤー 用　画像の配置などはここで設定する
    
    map_layer_fore:{},
    map_layer_back:{},
    
    //状況に応じて変化する
    is_swipe: false,
    timeoutId:0,
    
    //指が動いた状態を管理するための値
    start_point:{x:0,y:0},
    end_point:{x:0,y:0},
    
    init:function(){
     
        var that = this;
        //同じディレクトリにある、KAG関連のデータを読み込み
        
        //分割用のレイヤ
        $("#tyrano_base").append('<div id="root_layer_game" class="root_layer_game"></div>');
        $("#tyrano_base").append('<div id="root_layer_system" class="root_layer_system"></div>');

        //隠しレイヤの登録
        //画面クリックのレイヤ
        var layer_obj_click = $("<div class='layer layer_event_click' style='z-index:9999;display:none'></div>");
        layer_obj_click.css("width",this.kag.config.scWidth).css("height",this.kag.config.scHeight).css("position","absolute");
        
        
        //スキップやオートキャンセルの停止、画面がクリックされた時。
        $("body").click(function(){
            
            //スキップ中にクリックされたら元に戻す
            if(that.kag.stat.is_skip == true){
                that.kag.stat.is_skip = false; 
            }
            
            //オート中でクリックされた場合。オート停止
            if(that.kag.stat.is_auto == true){
                if(that.kag.config.autoClickStop == "true"){
                    that.kag.ftag.startTag("autostop", {next:"false"});
                }
            }
            
            //オート待ち状態なら、、解除する
            if(that.kag.stat.is_wait_auto = true){
                that.kag.stat.is_wait_auto = false;
            }
            
            
        });
        
        
        
        this.layer_event = layer_obj_click ;
        this.appendLayer(this.layer_event,"root_layer_system");
        
        
        //メニュー画面用のレイヤ
        var layer_menu = $("<div class='layer layer_menu' style='z-index:1000000000;display:none'  align='center'></div>");
        layer_menu.css("width",this.kag.config.scWidth).css("height",this.kag.config.scHeight).css("position","absolute");
        this.layer_menu = layer_menu;
        this.appendLayer(this.layer_menu,"root_layer_system");

        //フリーレイヤ
        var layer_free = $("<div class='layer layer_free' style='z-index:9998;display:none' ></div>");
        layer_free.css("width",this.kag.config.scWidth).css("height",this.kag.config.scHeight).css("position","absolute");
        this.layer_free = layer_free;
        this.appendLayer(this.layer_free,"root_layer_system");
        

    },
    
    //メニューレイヤーを返す
    getMenuLayer:function(){
        return this.layer_menu;
    },
    
    //フリーレイヤを返却します
    getFreeLayer:function(){
        return this.layer_free;
    },
    
    addLayer:function(layer_name){
        
      var system_layer = "";
      
      var layer_obj_fore = $("<div class='layer "+layer_name+"_fore layer_fore'></div>");
      var layer_obj_back = $("<div class='layer "+layer_name+"_back layer_back' style='display:none'></div>");
      
      if(layer_name.indexOf("message")==-1){
        layer_obj_fore.addClass("layer_camera");
        layer_obj_back.addClass("layer_camera");
      }else{
        system_layer = "root_layer_system";
      }
      
      layer_obj_fore.css("width",this.kag.config.scWidth).css("height",this.kag.config.scHeight).css("position","absolute");
      layer_obj_back.css("width",this.kag.config.scWidth).css("height",this.kag.config.scHeight).css("position","absolute");
      
      this.map_layer_fore[layer_name] = layer_obj_fore;
      this.map_layer_back[layer_name] = layer_obj_back;
      
      //表示ステータス
      this.map_layer_fore[layer_name].attr("l_visible","true");
      this.map_layer_back[layer_name].attr("l_visible","true");
      
      
      this.appendLayer(this.map_layer_fore[layer_name],system_layer);
      this.appendLayer(this.map_layer_back[layer_name],system_layer);
      
    },
    
    //メッセージレイヤ追加用
    appendLayer:function(layer_obj,system){
        
        system = system || "root_layer_game";
        
        if(system!=""){
            $("."+this.kag.define.BASE_DIV_NAME).find("#"+system).append(layer_obj);
        }else{
            $("."+this.kag.define.BASE_DIV_NAME).append(layer_obj);
        }
    },
    
    //全景レイヤにオブジェクトを追加する
    appendImage:function(image_obj){
        
        $("."+this.kag.define.BASE_DIV_NAME).append(layer_obj);
        
    },
    
    getLayer:function(layer_name,page){
        
        if(layer_name =="fix"){
            return $("#tyrano_base");
        }
        
        page = page || 'fore';
        
        if(page=="fore"){
            return this.map_layer_fore[layer_name];
        }else{
            return this.map_layer_back[layer_name];
        }
        
    },
    
     updateLayer:function(layer_name,page,layer_obj){
        
        page = page || 'fore';
        
        if(page=="fore"){
            this.map_layer_fore[layer_name] = layer_obj;
        }else{
            this.map_layer_back[layer_name] = layer_obj;
        }
        
    },
    
    //メッセージレイヤの消去
    hideMessageLayers:function(){
        
        this.kag.stat.is_hide_message = true ;
        
        var num_message_layer = parseInt(this.kag.config.numMessageLayers);
        
        for(var i=0; i < num_message_layer ;i++){
            this.getLayer("message"+i).hide();
        }
        
        //fixレイヤも隠します
        this.hideFixLayer();
    },
    
    //メッセージレイヤの表示
    showMessageLayers:function(){
        
        this.kag.stat.is_hide_message = false ;
        
        var num_message_layer = parseInt(this.kag.config.numMessageLayers);
        
        //表示するときに、もともと表示状態のもののみ、表示する必要がある
        for(var i=0; i < num_message_layer ;i++){
            
            var j_layer = this.getLayer("message"+i);
            
            //もともと、表示状態の場合のみ、再表示する
            if(j_layer.attr("l_visible") == "true"){
                j_layer.show();
            }
            
        }
        
        //fixレイヤも
        this.showFixLayer();
        
    },
    
    showFixLayer:function(){
        $(".fixlayer").show();
    },
    
    hideFixLayer:function(){
        $(".fixlayer").hide();
    },
    
    
    appendObj:function(layer_name,page,obj){
        
        obj.css("position","absolute");
        this.getLayer(layer_name,page).append(obj);
        
    },
    
    
    //メッセージレイヤのインナーを最適化する
    refMessageLayer:function(target_layer){
        
        var num = 0;
        
        if(!target_layer){
        
            while(true){
            
                if(this.map_layer_fore["message"+num]){
                    
                    var j_message_outer = this.map_layer_fore["message"+num].find(".message_outer");
                    var j_message_inner = this.map_layer_fore["message"+num].find(".message_inner");
                    
                    j_message_inner
                    .css("left",parseInt(j_message_outer.css("left"))+10)
                    .css("top",parseInt(j_message_outer.css("top"))+10)
                    .css("width",parseInt(j_message_outer.css("width"))-10)
                    .css("height",parseInt(j_message_outer.css("height"))-10);
                    
                }else{
                    break;
                }
            
                num++;
            }
        
        }else{
            
            if(this.map_layer_fore[target_layer]){
                
                var j_message_outer = this.map_layer_fore[target_layer].find(".message_outer");
                var j_message_inner = this.map_layer_fore[target_layer].find(".message_inner");
                    
                j_message_inner
                .css("left",parseInt(j_message_outer.css("left"))+10)
                .css("top",parseInt(j_message_outer.css("top"))+10)
                .css("width",parseInt(j_message_outer.css("width"))-10)
                .css("height",parseInt(j_message_outer.css("height"))-10);
            }
            
        }
        
    },
    
    //レイヤに関連するHTMLファイルを文字列でぶっこ抜きます
    getLayeyHtml:function(){
        
        var layer_info ={
            
            map_layer_fore:{},
            map_layer_back:{},
            layer_free:{},
            layer_fix:{},
            layer_blend:{}
            
        };
        
        for( key in this.map_layer_fore ){
            layer_info["map_layer_fore"][key] = $.playerHtmlPath(this.map_layer_fore[key].outerHTML());
        }
        for( key in this.map_layer_back ){
            layer_info["map_layer_back"][key] = $.playerHtmlPath(this.map_layer_back[key].outerHTML());
        }
        
        /*
        for( key in this.map_layer_fix ){
            layer_info["map_layer_fix"][key] = this.map_layer_fix[key].outerHTML();
        }
        */
        
        layer_info["layer_free"] = $.playerHtmlPath(this.layer_free.outerHTML());
        
        var n = 0;
        $(".fixlayer").each(function(){
        
            layer_info["layer_fix"][n]  = $.playerHtmlPath($(this).outerHTML());
            n++;
            
        });
        
        var m = 0;
        $(".blendlayer").each(function(){
            layer_info["layer_blend"][m]  = $.playerHtmlPath($(this).outerHTML());
            m++;
            
        });
        
        return layer_info;
        
        
    },
    
    setLayerHtml:function(layer){
        
        var that = this;
        
        for(key in layer.map_layer_fore){
                this["map_layer_fore"][key].remove();
                delete this["map_layer_fore"][key];
                this["map_layer_fore"][key] = $(layer["map_layer_fore"][key]);
                this.appendLayer(this["map_layer_fore"][key]);
         }
        
        for(key in layer.map_layer_back){
                this["map_layer_back"][key].remove();
                delete this["map_layer_back"][key];
                this["map_layer_back"][key] = $(layer["map_layer_back"][key]);
                this.appendLayer(this["map_layer_back"][key]);
         }

//fixlayerの削除
        $(".fixlayer").each(function(){
            $(this).remove();
        });
           
//fixlayer は復元しない 
        
        for(key in layer.layer_fix){
            $("#tyrano_base").append($(layer.layer_fix[key]));
         }
         
        //ブレンド演出の復元
         $(".blendlayer").remove();
         for(key in layer.layer_blend){
             
            var obj = $(layer.layer_blend[key]);
            if(obj.hasClass("blendvideo")){
                //ビデオの再現
                //console.log(obj.attr("data-video-pm"));
                var video_pm = JSON.parse(obj.attr("data-video-pm"));
                
                video_pm.stop = "true";
                video_pm.time = 10;
                //ビデオレイヤ追加だお。
                (function(){
                    var _video_pm = video_pm;
                    setTimeout(function(){
                        that.kag.ftag.startTag("layermode_movie", _video_pm );
                    },10);
                })();
                
            }else{
                //画像のブレンド
                $("#tyrano_base").append(obj);
            }
            
         }
         
         
         
         this.layer_free.remove();
         delete this.layer_free ;
         this.layer_free = $(layer.layer_free);
         this.appendLayer(this.layer_free);
         
        
    },
    
    //すべてのメッセージインナーレイヤ削除
    clearMessageInnerLayerAll:function(){
        
        for( key in this.map_layer_fore ){
            
            if(key.indexOf("message")!=-1){
                //メッセージインナーの削除
                this.map_layer_fore[key].find(".message_inner").html("");
                
            }
            
        }
        
    },
    
    //前景レイヤを背景レイヤにコピーする
    backlay:function(layer){
        
        //レイヤが指定されている場合は、そのレイヤのみコピーする
        layer = layer || "";
        
    	for( key in this.map_layer_fore ){
    		
    		if(layer == "" || layer == key){
            	
        		var fore_class_name = this.map_layer_fore[key].attr("class");
        		var back_class_name = this.map_layer_back[key].attr("class");
        		
        		this.map_layer_back[key] = this.map_layer_fore[key].clone();
        		
        		this.map_layer_back[key].removeClass(fore_class_name);
        		this.map_layer_back[key].addClass(back_class_name);
        		
        		back_class_name = $.replaceAll(back_class_name," ",".");
                
        		//削除
        		$("."+back_class_name).remove();
        		//$("." + back_class_name.replace(/ +/g, '.')).remove();
        		
        		//追加
        		this.map_layer_back[key].hide();
        		this.appendLayer(this.map_layer_back[key]);
          	
          	}	
    		
    	}
    	
    },
    
    //全面のイベントレイヤを削除する
    showEventLayer:function(){
        this.kag.stat.is_stop = false;
        this.layer_event.show();
    },
    
    hideEventLayer:function(){
        this.kag.stat.is_stop = true;
        this.layer_event.hide();
    },
    
    //backlayの逆 トランスの後に実施する
    forelay:function(layer){
        
        //レイヤが指定されている場合は、そのレイヤのみコピーする
        layer = layer || "";
        
        for( key in this.map_layer_back ){
            
            if(layer == "" || layer == key){
            
                var fore_class_name = this.map_layer_fore[key].attr("class");
                var back_class_name = this.map_layer_back[key].attr("class");
                
                this.map_layer_fore[key] = this.map_layer_back[key].clone(true);
                
                this.map_layer_fore[key].removeClass(back_class_name);
                this.map_layer_fore[key].addClass(fore_class_name);
                
                fore_class_name = $.replaceAll(fore_class_name," ",".");
                
                //削除
                $("."+fore_class_name).remove();
                //$("." + back_class_name.replace(/ +/g, '.')).remove();
                
                //追加
                //this.appendLayer(this.map_layer_fore[key]);
                this.map_layer_back[key].before(this.map_layer_fore[key]);
                
                
                //バックレイヤは隠す
                this.map_layer_back[key].css("display","none");
                
                //this.map_layer_fore[key].css("display","block");
                
                if(key.indexOf("message")!=-1){
                    this.map_layer_fore[key].css("opacity","");
                }
            
            }
            
        }  
    },
    
    test:function(){
        
    }
};


