/**
 * 
 * jQuery A3D  v1.0　To use CSS3 Keyframe Animation from JavaScript
 * http:// 
 * Copyright 2012, ShikemokuMK  
 
 *Free to use and abuse under the MIT license.
 *https://twitter.com/shikemokumk
 * 
 */

(function($){
    var vendor = (/webkit/i).test(navigator.appVersion) ? 'webkit' : (/firefox/i).test(navigator.userAgent) ? 'Moz' : (/Trident/i).test(navigator.userAgent) ? 'ms' : 'opera' in window ? 'O' : '';  
    $.fn.a3d=function(arg){
  
        var base_point = null;
        
        return this.each(function(i){
            
            var that = this;
            
            var keyframe = arg.frames;
            var config = arg.config;
            var cb_complete = arg.complete;
            var cb_start = arg.start;
            var cb_iteration = arg.iteration;
            
            var point = {x:0, y:0, z:0};
            
            
            var anim_id = "id_"+Math.floor( Math.random() * 1000000000 );
            
            var trans = {};
            var master_text ="";
            
            var defaults={
                duration:"4s",
                state:"running",
                easing:"0.0,0.0,1.0,1.0",
                count:"1",
                delay:"0",
                direction:"",
                mode:"forwards",
                maintain:"true"
                
            }
            
            var options=$.extend(defaults, trimAll(config));
            
            var last_frame_text = "";
            var last_style_text = "";
            
            var mod_frames ={};
            var mod_styles ={}; 
            
            var ext_array = [];
            
            
            base_point = $.data(this,"base_point") || null;
            
            
            if(base_point != null){
                
            }else{
                
                base_point = $.extend({x:0,y:0,z:0},{x:parseInt($(this).offset().left),y:parseInt($(this).offset().top)});                
                $.data(this,"base_point",base_point);
                
            }
            
            if(keyframe["0%"]){
                //0%が存在する場合,そのまま適応
                
            }else{
                
                var last_frame_text = $.data(this,"last_frame_text") || "";
                var last_style_text = $.data(this,"last_style_text") || "";
                
                var last_mod_frames = $.data(this,"last_mod_frames") || {};
                var last_mod_styles = $.data(this,"last_mod_styles") || {};
                
                point = $.data(this,"point") || {x:0,y:0,z:0}
                
                var state_text = last_frame_text + "; " + last_style_text;
               
                var maintain_state = " 0%{ -"+vendor+"-transform:";
                maintain_state += state_text+"　} ";
                
                master_text = maintain_state;
                
                mod_frames = last_mod_frames;
                mod_styles = last_mod_styles;
                
                
            }
            
            var mstime = parseInt(options.duration);
            //options.duration.substring(options.duration.substring.length-1,options.duration.substring.length)!="s"){
            if(options.duration.indexOf("ms")!=-1){
            }else if(options.duration.indexOf("s")!=-1){
                mstime = mstime * 1000
            }
            
            //キーフレーム登録
            for(percentage in keyframe){
                
                var frames = [];
                var styles = [];
                
                keyframe[percentage].trans = keyframe[percentage].trans || {};
                keyframe[percentage].styles = keyframe[percentage].styles || {};
                
                frames = convertTrans(trimAll(keyframe[percentage].trans),point,base_point);
                styles = trimAll(keyframe[percentage].styles);
                
                var head_text = " "+percentage+"{ -"+vendor+"-transform:";
                
                var frame_text = "";
                var style_text = "";
                
                mod_styles = $.extend(mod_styles,styles);
                mod_frames = $.extend(mod_frames,frames);
                
                
                //スタイルの状態を引き継ぐ
                if(options.maintain == "true"){
                    
                    for(key in mod_styles){
                        style_text+=" "+key+":"+mod_styles[key]+";";
                    }
                    
                    for(var key in mod_frames){
                        frame_text+=key+"("+mod_frames[key]+") ";
                    }
                    
                }else{
                    for(key in styles){
                        style_text+=" "+key+":"+styles[key]+";";
                    }
                    
                    for(var key in frames){
                        frame_text+=key+"("+frames[key]+") ";
                    }
                }
                
                master_text += head_text + frame_text+ "; "+style_text+"　} ";
          
                last_frame_text = frame_text;
                
                //関数登録
                if (typeof keyframe[percentage].ext == "function"){
                    
                    
                    (function(){
                        var _fnc = keyframe[percentage].ext;
                        var _mstime = mstime*(parseInt(percentage));
                        var tfnc = function(){
                            setTimeout(function(){_fnc.call(that);},_mstime*0.01);
                        };
                        
                        ext_array.push(tfnc);
                        
                    })();
                } 
                
          
            }
            
            if(ext_array.length>0){
                
                if(typeof cb_start !== "function"){
                    cb_start = function(){};
                }
                if(typeof cb_iteration !== "function"){
                    cb_iteration = function(){};
                }
            }
            
            $.data(this,"ext_array",ext_array);
            
          
            for(key in mod_styles){
                last_style_text += " "+key+":"+mod_styles[key]+";"
            }
            
            
            var last_text = last_frame_text + "; " + last_style_text;
            
            var lastSheet = document.styleSheets[document.styleSheets.length - 1];
            lastSheet.insertRule("@-"+vendor+"-keyframes " + anim_id + " {"+master_text+"} ", lastSheet.cssRules.length);
            
                
            var obj = $(this);
            
            obj.a3d_name = anim_id;
            
            var original_css_param={
            
            "-animation-name":obj.a3d_name,
            "-animation-duration":defaults.duration,
            "-animation-play-state":defaults.state,
            "-animation-delay":defaults.delay,
            "-animation-iteration-count":defaults.count, 
            "-animation-direction": defaults.direction, 
            "-animation-fill-mode": defaults.mode,
            "-animation-timing-function":defaults.easing
            
            };
            
            var css_param = {};
            
            for(prefix in original_css_param){
                
                css_param["-"+vendor+prefix] = original_css_param[prefix];
                
            }
            
            obj.css(css_param);
            
            $.data(this,"last_frame_text",last_frame_text);
            $.data(this,"last_style_text",last_style_text);
            
            $.data(this,"last_mod_frames",mod_frames);
            $.data(this,"last_mod_styles",mod_styles);
            
            $.data(this,"point",point);
            
            if(vendor == "Moz"){
                
                obj.css(css_param).one('animationend',function(){
                    
                    if(typeof cb_complete === "function"){
                        
                        obj.css("transform", obj.css("transform"));
                        for (var key in mod_styles) {
                            obj.css(key, obj.css(key));
                        }
                        obj.css("animation-name","");
                        
                        cb_complete.call(that);
                    }
                    
                });
                obj.css(css_param).bind('animationiteration',function(){
                    
                    if(typeof cb_iteration === "function"){
                        cb_iteration.call(that);
                    }
                    
                    //タイムアウト呼び起こし
                    var tanim = $.data(that,"ext_array");
                    
                    if(tanim.length>0){
                        for(var i=0;i<tanim.length;i++){

                            tanim[i]();
                            
                        }
                    }

                    
                });
                
                obj.css(css_param).one('animationstart',function(){
                    
                    
                    if(typeof cb_start === "function"){
                        cb_start.call(that);
                        
                    }
                    //タイムアウト呼び起こし
                    var tanim = $.data(that,"ext_array");
                    
                    if(tanim.length>0){
                        for(var i=0;i<tanim.length;i++){

                            tanim[i]();
                            
                        }
                    }

                    
                });
                
            }else{
                
                //if(vendor =="ms") vendor="";
                //alert(vendor);
                //var hasAnimationEvt = 'AnimationEvent' in window;
                //alert(hasAnimationEvt);
                
                obj.css(css_param).one(''+vendor+'AnimationEnd animationend',function(){
                    
                    if(typeof cb_complete === "function"){
                        obj.css("transform",obj.css("transform"));
                        
                        for (var key in mod_styles) {
                            obj.css(key, obj.css(key));
                        }
                        
                        obj.css("-"+vendor+"-animation-name","");
                        cb_complete.call(that);
                    }
                    
                });
                obj.css(css_param).bind(''+vendor+'AnimationIteration animationiteration',function(){
                    
                    if(typeof cb_iteration === "function"){
                        cb_iteration.call(that);
                    }
                    
                    //タイムアウト呼び起こし
                    var tanim = $.data(that,"ext_array");
                    
                    if(tanim.length>0){
                        for(var i=0;i<tanim.length;i++){

                            tanim[i]();
                            
                        }
                    }

                    
                });
                obj.css(css_param).one(''+vendor+'AnimationStart animationstart',function(){
                    if(typeof cb_start === "function"){
                        cb_start.call(that);
                    }
                    
                    //タイムアウト呼び起こし
                    var tanim = $.data(that,"ext_array");
                    
                    if(tanim.length>0){
                        for(var i=0;i<tanim.length;i++){

                            tanim[i]();
                            
                        }
                    }
                    
                });
            
            }
            
            
        });
        
        
    };
    
    //アニメーション開始
    $.fn.a3dstate=function(str_stat){
        
        return this.each(function(i){
            
            $(this).css("-"+vendor+"-animation-play-state",str_stat);
            
        });
        
    };
    
    
    //アニメーション開始
    $.fn.a3dInfo=function(){
        
        var result_array = [];
        
        this.each(function(i){
            
            var last_frame_text = $.data(this,"last_frame_text") || "";
            var last_style_text = $.data(this,"last_style_text") || "";
                
            var last_mod_frames = $.data(this,"last_mod_frames") || {};
            var last_mod_styles = $.data(this,"last_mod_styles") || {};
                
            var point = $.data(this,"point") || {x:0,y:0,z:0}
            
            var result = {
                point : point,
                frame_text :last_frame_text,
                style_text :last_style_text,
                frames:last_mod_frames,
                styles:last_mod_styles
            }
            
            result_array.push(result);
        
        });
       
       return result_array;
            
        
    };
    
    //アニメーションをつなげる
    $.fn.a3dChain=function(a3ds,cb){
   
        var chain_num = a3ds.length;
        var index = 0;
        
        var array_a3d = [];
        
        var target = $(this);
        
        for(var i=0;i<a3ds.length;i++){
            
            var a3d   = a3ds[i];
            
            a3d.complete = function(){
              
              index++;
              if(array_a3d.length > index){
                  
                  target.a3d(array_a3d[index]);
                  target.a3dstate("running")
                  
              }else{
                  
                  if(typeof cb =="function"){
                    cb();
                  }
              }
            };
            
            //初期状態は強制的に停止状態
            a3d.config["state"] = "pause";
            
            array_a3d.push(a3d);
        
        }
        
        target.a3d(array_a3d[0]);
        target.a3dstate("running");
        
    };
    
    function trimAll(array_obj) {
        
        var result = {};
        
        for(key in array_obj){
            array_obj[key] = ""+array_obj[key] ;
            result[key.replace(/^\s+|\s+$/g, "")] = array_obj[key].replace(/^\s+|\s+$/g, "");
        }
       
        return result;
       
    }
    
    function convertTrans(array_obj,point,base_point){
        
        var result = {};
        
        for(key in array_obj){
            
            if(key == "x" || key == "y" || key == "z"){
                
                var tmp = array_obj[key];
                
                //相対位置指定
                if(tmp.substring(0,1)=="="){
                    
                    var tmp_i = parseInt(tmp.replace("=",""));
                    point[key] = point[key] + tmp_i ;
                
                }else if(tmp.substring(0,1)=="*"){
                    
                    var tmp_i = parseInt(tmp.replace("*",""));
                    point[key] = tmp_i - base_point[key];
                    
                    
                }else{
                //絶対位置指定
                    point[key] = parseInt(tmp) ;
                }
                
                delete array_obj[key];
            }
            
        }
        
        //array_obj["translate3d"] = point["x"]+"px,"+point["y"]+"px,"+point["z"]+"px";
        array_obj["translate"] = point["x"]+"px,"+point["y"]+"px";
        
        return array_obj;
        
    }
    
})(jQuery);






