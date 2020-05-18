
//コンバート実行機能
class ThreeModel {

    constructor(obj){
        
        this.model = obj.model;
        this.mixer = obj.mixer;
        
        this.opacity(0);
        
    }   
    
    //音楽ディレクトリと効果音ディレクトリの２つを変換する
    update(delte_time){
        
        if(this.mixer){
            this.mixer.update(delte_time);
        }
    }
    
    setPosition(x,y,z){
		this.model.position.set(x,y,z);
	
	}
    
    setScale(x,y,z){
	
		this.model.scale.set(x,y,z);
		
	}
    
    setRotation(x,y,z){
	
		this.model.rotation.set(x,y,z);
    
	}
	
	fade(direction,options){
        
        options = options || {};
        // set and check 
        var from_opacity = (direction == "in") ? 0 : 1;
        var to_opacity = (from_opacity == 0 )? 1 : 0;
        
        var easing = options.easing || "linear";
        var duration = options.duration || 1000;
        
        var j_obj = $("<input type='hidden'>");
        j_obj.css("opacity",from_opacity);
        
        var timer = j_obj.animate(
            {"opacity":to_opacity},
            {
                duration: duration,
                easing: easing,
                step : (now,elem)=>{
                    this.opacity(now);
                },
                complete:()=> {
                    j_obj.remove();
                }
            }
        );
        
        
        return;
        
    
    }
    
    //ポジションを指定位置まで移動させる
    toAnim(type,pos,options,cb){
		
		var setFunc = "setPosition";
		
		var to_pos = {};
		
		to_pos.x = pos.x || this.model[type].x;
        to_pos.y = pos.y || this.model[type].y;
        to_pos.z = pos.z || this.model[type].z;
        
        if(pos.x==0){
			to_pos.x = 0;
		}
		
		if(pos.y==0){
			to_pos.y = 0;
		}
		
		if(pos.z==0){
			to_pos.z = 0;
		}
		
        
        var arr = ["x","y","z"];
        
        for(var i=0;i<arr.length;i++){
	    	
	    	(()=>{
		    	var key = arr[i];
	    		var j_obj = $("<input type='hidden'>");
				j_obj.css("left",this.model[type][key]);
				
				j_obj.animate(
		            {"left":to_pos[key]},
		            {
		                duration: options.duration,
		                easing: options.easing,
		                step : (now,elem)=>{
		                    this.model[type][key] = now;
						},
		                complete:()=> {
		                    j_obj.remove();
		                    if(typeof cb =="function"){
			                	cb();
			                }
		                }
		            }
		        );

			})();
			
	    }
        
        		
	
	}
    
    
    opacity(val){
        
        this.model.traverse(function(node) {
            if(node.isMesh){
                node.material.transparent = true;
                node.material.opacity = val;
            }
        });
        
        
    }


}
