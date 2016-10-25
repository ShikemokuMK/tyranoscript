
/*
 #[camera]
 :group
 カメラ操作
 :title
 カメラを移動する
 :exp
 カメラをズームやパンさせる演出を追加できます。
 この機能を使うと、立ち絵のキャラクター表情にフォーカスをあてたり
 一枚絵であっても多彩な演出が可能になります。
 
 カメラ機能を使用するにはConfig.tjs の useCameraをtrueにする必要があります。
 また、カメラ機能を有効にした場合、画面の中央寄せ（ScreenCentering）が無効になります。
 →V4.31以降は画面中央寄せでも、カメラ使用可能。useCameraコンフィグは削除。
 
 カメラの座標は画面中央が(x:0,y:0)です。
 例えば、画面右上は x:200 y:200 　画面左下は x:-200 y:-200 という座標指定になります。
  
 カメラを元の位置に戻すためには[reset_camera]タグを使用します。
 カメラの演出完了を待ちたい場合は[wait_camera]タグを使用します。
 
 【重要】
 カメラ演出が終わったら、必ず[reset_camera]でカメラの位置を初期値に戻して下さい。
 カメラを戻さないと、背景の変更 [bg]タグ等は使用できません。
 
 :sample

@camera zoom=2 x=180 y=100 time=1000
@camera x=-180 y=100 time=2000
@camera zoom=2 from_zoom=3 x=180 y=100 time=1000

;カメラの位置を元に戻す
@reset_camera

 :param
 time=カメラが座標へ移動する時間を指定できます。ミリ秒で指定して下さい。デフォルトは1000,
 x=カメラの移動するX座標を指定して下さい,
 y=カメラの移動するY座標を指定して下さい,
 zoom=カメラの拡大率を指定して下さい。例えば２と指定すると２倍ズームします,
 rotate=カメラの傾きを指定します。例えば20 だとカメラが20度傾きます。,
 from_x=カメラの移動開始時のX座標を指定できます,
 from_y=カメラの移動開始時のY座標を指定できます,
 from_zoom=カメラの移動開始時の倍率を指定できます,
 from_rotate=カメラの移動開始時の傾きを指定できます,
 wait=カメラ移動の完了を待つかどうかを指定します。falseを指定するとカメラ移動中もゲームを進行することができます。デフォルトはtrue,
 layer=レイヤを指定します。背景ならbase 前景レイヤならう 0以上の数字。カメラの効果を特定レイヤだけに適応できます。,　
 ease_type=カメラの移動演出を指定できます。
 ease(開始時点と終了時点を滑らかに再生する)
 linear(一定の間隔で再生する)
 ease-in(開始時点をゆっくり再生する)
 ease-out(終了時点をゆっくり再生する)
 ease-in-out(開始時点と終了時点をゆっくり再生する)
 デフォルトはeaseです。 
 #[end]
 */


tyrano.plugin.kag.tag.camera = {

    vital : [],

    pm : {

        time : 1000,

        from_x : "0",
        from_y : "0",
        from_zoom : "1",
        from_rotate:"0",

        x : "",
        y : "",
        zoom : "",
        rotate:"",
        layer:"layer_camera",
        
        wait:"true",
        ease_type : "ease"
        

    },

    start : function(pm) {
        var that = this;
        
        if(this.kag.config.useCamera == "false"){
        //　　 カメラ使用可能
        //    $.alert("[camera]タグエラー。カメラの使用を許可して下さい。Config.tjsのuseCameraをtrueにする必要があります");
        //    return false;
        }
        
        //duration を確認する
        var duration = pm.time + "ms";
        
        if(typeof this.kag.stat.current_camera[pm.layer] == "undefined"){
            this.kag.stat.current_camera[pm.layer] = {
                x : "0",
                y : "0",
                scale : "1",
                rotate:"0"
            };
        }
        
        var to_camera = $.extend(true, {}, this.kag.stat.current_camera[pm.layer]);
        
        //指定されて項目があるなら、上書きする
        if(pm.x!="") to_camera.x = "*"+parseInt(pm.x)*-1 +"px";
        if(pm.y!="") to_camera.y = "*"+parseInt(pm.y)*1 +"px";
        if(pm.zoom!="") to_camera.scale = pm.zoom;
        if(pm.rotate!="") to_camera.rotate = pm.rotate+"deg";
        
        
        if(pm.from_x != "0" || pm.from_y!="0" || pm.from_zoom!="1" || pm.from_rotate!="0" ){
            
            this.kag.stat.current_camera[pm.layer] = {
                x : "*"+parseInt(pm.from_x)*-1 +"px",
                y : "*"+parseInt(pm.from_y)*1+"px",
                scale : pm.from_zoom,
                rotate:pm.from_rotate+"deg"
            };
            
        }
        
        var flag_complete = false;
        that.kag.stat.is_move_camera = true;
        
        var a3d_define = {
            frames : {

                "0%" : {
                    trans : this.kag.stat.current_camera[pm.layer]
                },
                "100%" : {
                    trans : to_camera
                }
            },
            
            config : {
                duration : duration,
                state : "running",
                easing : pm.ease_type
            },
            
            complete:function(){
                //アニメーションが完了しないと次へはいかない
                if(pm.wait =="true" && flag_complete ==false){
                    flag_complete=true; //最初の一回だけwait有効
                    
                    setTimeout(function(){
                        that.kag.ftag.nextOrder();
                    },300);
                    
                }else{
                    
                    //カメラを待ってる状態なら
                    if(that.kag.stat.is_wait_camera == true){
                        that.kag.stat.is_wait_camera = false;
                        that.kag.ftag.nextOrder();
                    }
                    
                }
                
                that.kag.stat.is_move_camera = false;
            }
        };
        
        this.kag.stat.current_camera[pm.layer] = to_camera;
        
        if(pm.wait =="false"){
            that.kag.ftag.nextOrder();
        }

        //アニメーションの実行
        if(pm.layer=="layer_camera"){
            $(".layer_camera").css("-webkit-transform-origin", "center center");
            $(".layer_camera").a3d(a3d_define);
            this.kag.stat.current_camera_layer = "";
        }else{
            $("."+pm.layer +"_fore").css("-webkit-transform-origin", "center center");
            $("."+pm.layer +"_fore").a3d(a3d_define);
            this.kag.stat.current_camera_layer = pm.layer;
        }

    },

    play : function(obj, cb) {

    }
};

/*
 #[reset_camera]
 :group
 カメラ操作
 :title
 カメラをリセットする
 :exp
 カメラの位置を初期値に戻します。
 [camera]タグを使った演出が終わった後は、必ず[reset_camera]で位置を元に戻して下さい。
 位置を戻さない場合は背景変更などで不具合が生じる場合があります。
 :sample
 :param
 time=初期位置にカメラが移動する時間をミリ秒で指定します。デフォルトは1000です。,
 wait=カメラ移動の完了を待つかどうかを指定します。falseを指定するとカメラ移動中もゲームを進行することができます。デフォルトはtrue,
 ease_type=カメラの戻り方を指定できます。デフォルトはease　詳細はcameraタグを確認。,
 layer=レイヤを指定します。背景ならbase 前景レイヤならう 0以上の数字。カメラの効果を特定レイヤだけに適応できます。 
 #[end]
 */


tyrano.plugin.kag.tag.reset_camera = {

    vital : [],

    pm : {

        time : 1000,
        
        wait:"true",
        ease_type : "ease",
        layer:"layer_camera"

    },

    start : function(pm) {
        var that = this;
        //duration を確認する
        var duration = pm.time + "ms";
        
        var to_scale   = 1;
        
        var to_camera = {
            x:"*0px",
            y:"*0px",
            scale:"1",
            rotate:"0deg"
        }
        
        var flag_complete = false;
        
        that.kag.stat.is_move_camera = true;
        
        var a3d_define = {
            frames : {

                "0%" : {
                    trans : this.kag.stat.current_camera[pm.layer]
                },
                "100%" : {
                    trans : to_camera
                }
            },
            
            config : {
                duration : duration,
                state : "running",
                easing : pm.ease_type
            },
            
            complete:function(){
                //アニメーションが完了しないと次へはいかない
                 if(pm.wait =="true" && flag_complete ==false){
                    flag_complete=true; //最初の一回だけwait有効
                    that.kag.ftag.nextOrder();
                }else{
                    
                    //カメラを待ってる状態なら
                    if(that.kag.stat.is_wait_camera == true){
                        that.kag.stat.is_wait_camera = false;
                        that.kag.ftag.nextOrder();
                    }
                    
                }
                
                //リセットした時は、本当に消す
                $("."+pm.layer).css({
                    "-animation-name":"",
                    "-animation-duration":"",
                    "-animation-play-state":"",
                    "-animation-delay":"",
                    "-animation-iteration-count":"",
                    "-animation-direction": "",
                    "-animation-fill-mode": "",
                    "-animation-timing-function":""
                });
                
                
                that.kag.stat.is_move_camera = false;
                
            }
        };
        
        delete this.kag.stat.current_camera[pm.layer] ;
        
        if(pm.wait =="false"){
            that.kag.ftag.nextOrder();
        }

         //アニメーションの実行
        if(pm.layer=="layer_camera"){
            $(".layer_camera").css("-webkit-transform-origin", "center center");
            $(".layer_camera").a3d(a3d_define);
            this.kag.stat.current_camera_layer = "";
        }else{
            $("."+pm.layer +"_fore").css("-webkit-transform-origin", "center center");
            $("."+pm.layer +"_fore").a3d(a3d_define);
            this.kag.stat.current_camera_layer = "";
        }


    },

    play : function(obj, cb) {

    }
};



/*
 #[wait_camera]
 :group
 カメラ操作
 :title
 カメラの演出を待つ
 :exp
 このタグはカメラの操作中である場合、完了を待つことができます。
 例えば、cameraタグでwaitにfalseを指定して、ゲームを進行する場合、特定の位置で必ずカメラ演出の完了を待たせる事が出来ます
 
 :sample
 
 [camera zoom=2 x=180 y=100 time=5000]
 カメラ演出中[p]
 ここでもカメラ演出中[p]
 [wait_camera]
 カメラの演出が終わったので進行[p]
 
 :param
 #[end]
 */

tyrano.plugin.kag.tag.wait_camera = {
    start : function(pm) {
        
        //今、カメラ中なら待つ
        if(this.kag.stat.is_move_camera == true){
            //this.kag.layer.hideEventLayer();
            this.kag.stat.is_wait_camera = true;
        }else{
            this.kag.ftag.nextOrder();
        }
    }
};
