
tyrano.plugin.kag.layer ={

    tyrano:null,
    kag:null,
    
    layer_event:{},
    
    layer_menu:{}, //メニュー用の画面。イベントレイヤーよりも更に上
    
    layer_free:{},// フリーレイヤー 用　画像の配置などはここで設定する
    
    map_layer_fore:{},
    map_layer_back:{},
    
    //状況に応じて変化する
    
    //指が動いた状態を管理するための値
    start_point:{x:0,y:0},
    end_point:{x:0,y:0},
    
    init:function(){
     
        var that = this;
        //同じディレクトリにある、KAG関連のデータを読み込み
        
        //隠しレイヤの登録
        //画面クリックのレイヤ
        var layer_obj_click = $("<div class='layer layer_event_click' style='z-index:9999;display:none'></div>");
        layer_obj_click.css("width",this.kag.config.scWidth).css("height",this.kag.config.scHeight).css("position","absolute");
        
        
        
        layer_obj_click.click(function(e){
            
            //スキップ中にクリックされたら、速度を元に戻す
            if(that.kag.stat.is_skip == true){
                that.kag.stat.is_skip = false; 
            }

            // POSSIBLE IMPROVE
            // make "isReturn" variable
            // and do all if statements
            // then do "if (isReturn) return;"
            
            if(that.kag.stat.is_hide_message == true){
                that.showMessageLayers();
                return;
            }
            
            //テキスト再生中にクリックされた場合、文字列を進めて終了にする
            if(that.kag.stat.is_adding_text == true){
                that.kag.stat.is_click_text = true;
                return;
            }
            
            //テキストマッハ表示時もリターン。
            if(that.kag.stat.is_click_text == true){
                return;
            }
            
            if(that.kag.stat.is_stop == true){
                return;
            }

            that.kag.ftag.nextOrder();
            
        });
        
        
        ///マウス周り
        //スライドイベント
        layer_obj_click.bind('touchstart', function(e) {
            e.preventDefault();                     // ページが動くのを止める
            var pageX = event.changedTouches[0].pageX; // X 座標の位置
            var pageY = event.changedTouches[0].pageY; // Y 座標の位置
            that.start_point.x = pageX;
            that.start_point.y = pageY;
            
            console.log("start -------");
            console.log(pageY);
            
        });
        
        //スライドイベント
        layer_obj_click.bind('touchend', function(e) {
            e.preventDefault();                     // ページが動くのを止める
            var pageX = event.changedTouches[0].pageX; // X 座標の位置
            var pageY = event.changedTouches[0].pageY; // Y 座標の位置
            
            that.end_point.x = pageX;
            that.end_point.y = pageY;
            
            var move_x = that.end_point.x - that.start_point.x;
            var move_y = that.end_point.y - that.start_point.y;
            
            ////
            if(move_x > 250){
                //右スライド
                console.log("右スライド");
            }else if(move_y > 50){
                //縦スライド
                that.kag.ftag.startTag("showmenu", {});
            
            }
            
            console.log(move_y);
        
        });
        
        this.layer_event = layer_obj_click ;
        this.appendLayer(this.layer_event);
        
        
        //メニュー画面用のレイヤ
        var layer_menu = $("<div class='layer layer_menu' style='z-index:100000000;display:none'  align='center'></div>");
        layer_menu.css("width",this.kag.config.scWidth).css("height",this.kag.config.scHeight).css("position","absolute");
        this.layer_menu = layer_menu;
        this.appendLayer(this.layer_menu);

        //フリーレイヤ
        var layer_free = $("<div class='layer layer_free' style='z-index:9998;display:none' ></div>");
        layer_free.css("width",this.kag.config.scWidth).css("height",this.kag.config.scHeight).css("position","absolute");
        this.layer_free = layer_free;
        this.appendLayer(this.layer_free);
        

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
      
      var layer_obj_fore = $("<div class='layer "+layer_name+"_fore layer_fore'></div>");
      var layer_obj_back = $("<div class='layer "+layer_name+"_back layer_back' style='display:none'></div>");
      
      layer_obj_fore.css("width",this.kag.config.scWidth).css("height",this.kag.config.scHeight).css("position","absolute");
      layer_obj_back.css("width",this.kag.config.scWidth).css("height",this.kag.config.scHeight).css("position","absolute");
      
      this.map_layer_fore[layer_name] = layer_obj_fore;
      this.map_layer_back[layer_name] = layer_obj_back;
      
      //表示ステータス
      this.map_layer_fore[layer_name].attr("l_visible","true");
      this.map_layer_back[layer_name].attr("l_visible","true");
      
      
      this.appendLayer(this.map_layer_fore[layer_name]);
      this.appendLayer(this.map_layer_back[layer_name]);
      
    },
    
    //メッセージレイヤ追加用
    appendLayer:function(layer_obj){
        
        $("."+this.kag.define.BASE_DIV_NAME).append(layer_obj);
        
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
    refMessageLayer:function(){
        
        var num = 0;
        
        
        while(true){
        
            if(this.map_layer_fore["message"+num]){
                
                var j_message_outer = this.map_layer_fore["message"+num].find(".message_outer");
                var j_message_inner = this.map_layer_fore["message"+num].find(".message_inner");
                
                j_message_inner
                //.css("background-color",$.convertColor(this.config.frameColor))
                .css("left",parseInt(j_message_outer.css("left"))+10)
                .css("top",parseInt(j_message_outer.css("top"))+10)
                .css("width",parseInt(j_message_outer.css("width"))-10)
                .css("height",parseInt(j_message_outer.css("height"))-10);
                
            }else{
                break;
            }
        
            num++;
        }
        
    },
    
    //レイヤに関連するHTMLファイルを文字列でぶっこ抜きます
    getLayerHtml:function(){
        
        var layer_info ={
            
            map_layer_fore:{},
            map_layer_back:{},
            layer_free:{},
            layer_fix:{}
            
        };
        
        for( key in this.map_layer_fore ){
            layer_info["map_layer_fore"][key] = this.map_layer_fore[key].outerHTML();
        }
        for( key in this.map_layer_back ){
            layer_info["map_layer_fore"][key] = this.map_layer_fore[key].outerHTML();
        }
        
        /*
        for( key in this.map_layer_fix ){
            layer_info["map_layer_fix"][key] = this.map_layer_fix[key].outerHTML();
        }
        */
        
        layer_info["layer_free"] = this.layer_free.outerHTML();
        
        var n = 0;
        $(".fixlayer").each(function(){
        
            layer_info["layer_fix"][n]  = $(this).outerHTML();
            n++;
            
        });
        
        return layer_info;
        
        
    },
    
    setLayerHtml:function(layer){
        
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

    backlayProcess: function(layer, key) {
        if (layer == "" || layer == key) {
            var fore_class_name = this.map_layer_fore[key].attr("class");
            var back_class_name = this.map_layer_back[key].attr("class");

            this.map_layer_back[key] = this.map_layer_fore[key].clone();

            this.map_layer_back[key].removeClass(fore_class_name);
            this.map_layer_back[key].addClass(back_class_name);

            this.map_layer_back[key].hide();
            $("." + back_class_name.replace(/ +/g, '.')).replaceWith(this.map_layer_back[key]);
        }
    },
    
    //前景レイヤを背景レイヤにコピーする
    backlay: function(layer) {
        
        //レイヤが指定されている場合は、そのレイヤのみコピーする
        layer = layer || "";

        for (key in this.map_layer_fore)
            if (key == 'base')
                this.backlayProcess(layer, key);

        for (key in this.map_layer_fore)
            if (key.indexOf('message') != -1)
                this.backlayProcess(layer, key);

        for (key in this.map_layer_fore)
            if (key != 'base' && key.indexOf('message') == -1)
                this.backlayProcess(layer, key);

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

    forelayProcess: function(layer, key) {
        if (layer == "" || layer == key) {
            var fore_class_name = this.map_layer_fore[key].attr("class");
            var back_class_name = this.map_layer_back[key].attr("class");

            this.map_layer_fore[key] = this.map_layer_back[key].clone(true);

            this.map_layer_fore[key].removeClass(back_class_name);
            this.map_layer_fore[key].addClass(fore_class_name);

            $("." + fore_class_name.replace(/ +/g, '.')).replaceWith(this.map_layer_fore[key]);

            this.map_layer_back[key].hide();
            if (key.indexOf("message") != -1) this.map_layer_fore[key].css("opacity", "")
        }
    },
    
    //backlayの逆 トランスの後に実施する
    forelay:function(layer){
        
        //レイヤが指定されている場合は、そのレイヤのみコピーする
        layer = layer || "";

        for (key in this.map_layer_back)
            this.forelayProcess(layer, key);
    },
    
    test:function(){
        
    }
};


