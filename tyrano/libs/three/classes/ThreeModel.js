
//コンバート実行機能
class ThreeModel {

    constructor(obj){
        
        /*
        this.name  = obj.name;
        this.model = obj.model;
        this.mixer = obj.mixer;
        this.gltf  = obj.gltf;
        */
        
        for(let key in obj){
	    	this[key] = obj[key];
	    }
        
        this.setUserData("name",obj.name);
        
        this.visible = false;
        
        this.opacity(0);
        
        this.anim_obj = {};
        
    }   
    
    //音楽ディレクトリと効果音ディレクトリの２つを変換する
    update(delte_time){
        
        if(this.visible==false) return;
        
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
	
	fade(direction,options,cb){
        
        options = options || {};
        // set and check 
        var from_opacity = (direction == "in") ? 0 : 1;
        var to_opacity = (from_opacity == 0 )? 1 : 0;
        
        if(direction=="in"){
	    	this.visible=true;
        }
        
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
                    
                    if(direction!="in"){
						this.visible=false;
						
                    }else{
	                	this.visible=true;
	                
	                }
                    
                    if(typeof cb=="function"){
	                	cb();
	                }
                    
                }
            }
            
        );
        
        
        return;
        
    
    }
    
    setMotion(motion){
		
		var animations = this.gltf.animations;
		
		var anim = animations.find((obj)=>{
			
			return (obj.name == motion);
			
		});
		
		this.mixer = new THREE.AnimationMixer(this.model);
		const action = this.mixer.clipAction(anim);
		action.reset().play().fadeIn(0.5);
		
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
        
        this.anim_obj[type] = {};
				
        for(var i=0;i<arr.length;i++){
	    	
	    	(()=>{
		    	
		    	var key = arr[i];
	    		var j_obj = $("<input type='hidden'>");
				
				this.anim_obj[type][key] = {"key":key,"obj":j_obj};
        
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
		                    delete this.anim_obj[key];
		                    
		                    if(typeof cb =="function"){
			                	cb();
			                }
		                }
		            }
		        );

			})();
			
	    }
        
        		
	
	}
	
	stopAnim(finish){
		
		for(let type in this.anim_obj){	
			
			for(let key in this.anim_obj[type]){	
				
				var anim_obj = this.anim_obj[type][key];
				
				if(finish=="true"){
					anim_obj.obj.stop(true,true);
				}else{
					anim_obj.obj.stop(true,false);
				}
				
				
				/*
				if(finish == "true"){
					this.model[type][key] = anim_obj[key].finish_val;
				}
				*/

				
			}	
			
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
    
    setUserData(key,val){
		
		this.model.traverse(function(node) {
            
            node.userData[key] = val;
            
        });

		
	}
    
    //アップデートが必要なときに呼び出す。
    needsUpdate(){
		
		this.model.traverse(function(node) {
            if(node.isMesh){
                node.material.needsUpdate = true;
            }
        });
        
	}
	
	//tone 
	setToneMaped(flag){
		
		this.model.traverse(function(node) {
            if(node.isMesh){
                node.material.toneMapped = flag;
            }
        });
		
	}


}
