



$.three_pos = function(str){
    
    var obj = {};
    arr_obj = str.split(",");
    
    if(arr_obj.length == 1){
        obj.x = parseFloat(arr_obj[0]);
        obj.y = parseFloat(arr_obj[0]);
        obj.z = parseFloat(arr_obj[0]);
    }else{
        obj.x = parseFloat(arr_obj[0]);
        obj.y = parseFloat(arr_obj[1]);
        obj.z = parseFloat(arr_obj[2]);
    }
    
    return obj;
    
};


$.orgFloor = function(value, base) {
	
    return Math.floor(value * base) / base;

}

$.checkThreeModel = function(name){
	
	console.log(TYRANO.kag.tmp.three.models);
	
	if(TYRANO.kag.tmp.three.models[name]){
		return true;
	}else{
		alert("model「"+name+"」は未定義です。[model_new]で定義してください。");
	}
}



/*
 #[3d_init]
 :group
 3D操作
 :title
 3Dの初期化
 :exp
 3D関連の機能を使用するために必要な宣言です。
 first.ks などで宣言しておくと安全です。
 :sample
 [3d_init layer=0 ]
 
 :param
 layer=3Dモデルを配置するレイヤを指定できます。
  
 :demo
 
 #[end]
 */
 
tyrano.plugin.kag.tag["3d_init"] = {

    vital : [],
     	
    pm : {
        
        layer:"0",
        
    },
    
    clock:{},

    start : function(pm) {
        
        var that = this;
            
        var target_layer = this.kag.layer.getLayer(pm.layer, pm.page);
        
        var array_scripts = [
            "./tyrano/libs/three/three.js",
            
            "./tyrano/libs/three/loader/GLTFLoader.js",
            "./tyrano/libs/three/controls/OrbitControls.js",
            "./tyrano/libs/three/classes/ThreeModel.js",
            
        ];
        
        $.getMultiScripts(array_scripts,(e)=> {
            
            if(this.kag.tmp.three.is_load == true){
                return;
            }
            
            this.clock = new THREE.Clock();
            
            //3Dモデル用のシーンを挿入する。
            var j_canvas = $("<canvas id='three'></canvas>");
            
            var sc_width = parseInt(this.kag.config.scWidth);
            var sc_height = parseInt(this.kag.config.scHeight);
                
            j_canvas.css({
                "position":"absolute",
                "width":sc_width,
                "height":sc_height,
            });
            
            target_layer.append(j_canvas);
            
            
            const renderer = new THREE.WebGLRenderer({
                canvas: document.querySelector('#three'),
                alpha:true
            });
            
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(sc_width, sc_height);
        
            // シーンを作成
            const scene = new THREE.Scene();
        
            // カメラを作成
            const camera = new THREE.PerspectiveCamera(45, sc_width / sc_height);
            camera.position.set(0, 0, +1000);
        
            // 箱を作成
            const geometry = new THREE.BoxGeometry(400, 400, 400);
            const material = new THREE.MeshNormalMaterial();
            const box = new THREE.Mesh(geometry, material);
            
            //scene.add(box);
            
            //指定のレイヤは表示状態にもっていけ。
            target_layer.show();
            
            
            var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
            scene.add( directionalLight );
            
            const amb_light = new THREE.AmbientLight(0xFFFFFF, 1);
            scene.add(amb_light);
            
            /*
            var directionalLightShadowHelper = new THREE.CameraHelper( directionalLight.shadow.camera);
            scene.add( directionalLightShadowHelper);
             
            var directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight);
            scene.add( directionalLightHelper);
            */
            
            
            this.kag.tmp.three.is_load = true;
            
            this.kag.tmp.three.camera = camera;
            this.kag.tmp.three.scene = scene;
            this.kag.tmp.three.renderer = renderer;
            
            tick();
            
            // 毎フレーム時に実行されるループイベントです
            function tick() {
                //box.rotation.y += 0.01;
                that.updateFrame();
                renderer.render(scene, camera); // レンダリング
                requestAnimationFrame(tick);
            }
            
            this.kag.ftag.nextOrder();
            
            
        });
        
        
    },
    
    updateFrame:function(){
        
        //対応が必要なフレーム処理をここで実施する。
        var models = this.kag.tmp.three.models;
        
        for(key in models){
            
            if(models[key].mixer){
                models[key].update(this.clock.getDelta());
            }
            
        }
            
    }
    
    
    
        
};



/*
 #[3d_init]
 :group
 3D操作
 :title
 3Dの初期化
 :exp
 3D関連の機能を使用するために必要な宣言です。
 first.ks などで宣言しておくと安全です。
 :sample
 [3d_init layer=0 ]
 
 :param
 layer=3Dモデルを配置するレイヤを指定できます。
  
 :demo
 
 #[end]
 */
 
tyrano.plugin.kag.tag["model_new"] = {

    vital : [],
     	
    pm : {
        
        name:"",
        storage:"",
        
        scale:"100", //100,100,100 //みたいな感じで指定できる。
        pos:"0",  // 100,40,50
        rot:"0",
        
        folder:"",
        
    },

    start : function(pm) {
        
        var three = this.kag.tmp.three;
        
        var loader = new THREE.GLTFLoader();
        var folder = "";
        
        if (pm.folder != "") {
            folder = pm.folder;
        } else {
            folder = "others/model";
        }
        
        var storage_url = "./data/" + folder + "/" + pm.storage;
        
        loader.load(storage_url,(data)=>{
            
            var gltf = data;
            var model = gltf.scene;
            
            let pos = $.three_pos(pm.pos);
            let scale = $.three_pos(pm.scale);
            let rot = $.three_pos(pm.rot);
            
            //モデルのサイズ。
            model.position.set(pos.x,pos.y,pos.z);
            model.scale.set(scale.x,scale.y,scale.z);
            model.rotation.set(rot.x,rot.y,rot.z);
            
            const animations = gltf.animations;
            let mixer = new THREE.AnimationMixer(model);
            
            if(animations.length > 0){
                const anime = mixer.clipAction(animations[0]);
                anime.play();
            }else{
                mixer=undefined;
            }
            
            three.scene.add(model);
            
            this.kag.tmp.three.models[pm.name] = new ThreeModel({"model":model,"mixer":mixer});
            
            this.kag.ftag.nextOrder();
            
            
        });
         
        //読み込んだシーンが暗いので、明るくする
        //three.render.gammaOutput = true;

        
        
    },
    
    
    
        
};


tyrano.plugin.kag.tag["model_show"] = {

    vital : ["name"],
     	
    pm : {
        
        name:"",
        time:"500",
        
        scale:"", //100,100,100 //みたいな感じで指定できる。
        pos:"",  // 100,40,50
        rot:"",
        
        
    },

    start : function(pm) {
        
        var three = this.kag.tmp.three;
        
        if($.checkThreeModel(pm.name) == false){
	    	return;  
	    }
        
        var model = this.kag.tmp.three.models[pm.name];
        
        var options = {
            duration:parseInt(pm.time)
        };
        
        if(pm.pos!=""){
        	let pos = $.three_pos(pm.pos);
        	model.setPosition(pos.x,pos.y,pos.z);
        }
        
        if(pm.scale!=""){
	        let scale = $.three_pos(pm.scale);
            model.setScale(scale.x,scale.y,scale.z);
		}
		
		if(pm.rot !=""){
	        let rot = $.three_pos(pm.rot);
            model.setRotation(rot.x,rot.y,rot.z);
        }
        
        
        model.fade("in",options);
        
        this.kag.ftag.nextOrder();
            
        
        
    },
    
    
    
        
};


tyrano.plugin.kag.tag["model_hide"] = {

    vital : ["name"],
     	
    pm : {
        
        name:"",
        time:"500"
        
    },

    start : function(pm) {
        
        if($.checkThreeModel(pm.name) == false){
	    	return;  
	    }
        
        var three = this.kag.tmp.three;
        
        var options = {
            duration:parseInt(pm.time)
        };
        
        this.kag.tmp.three.models[pm.name].fade("out",options);
        
        this.kag.ftag.nextOrder();
            
        
        
    },
    
    
    
        
};


//Threeオブジェクトをアニメーションさせる命令

tyrano.plugin.kag.tag["three_anim"] = {

    vital : ["name"],
     	
    pm : {
        
        name:"",
        time:"1000",
        effect:"linear",
        
        type:"", //pos or rot or scale
        
        pos:"", 
        rot:"",
        scale:"",
        
        x:"",
        y:"",
        z:"",
        
        wait:"true",
        
    },

    start : function(pm) {
        
        if($.checkThreeModel(pm.name) == false){
	    	return;  
	    }
        
        var three = this.kag.tmp.three;
        
        var options = {
	    	"duration": parseInt(pm.time),
	    	"easing":pm.effect
	    };
	    
	    var type = pm.type;
        
        if(type==""){
	    	
	    	if(pm.pos!="") type="position";
	    	if(pm.rot!="") type="rotation";
	    	if(pm.scale!="") type="scale";
	    	
	    	if(type==""){
		    	alert("[three_anim]タグにパラメータ typeの指定が必要です。");
		    	return;
		    }
	    }
        
        //修復してあげる
        if(type=="pos") type="position";
        if(type=="rot") type="rotation";
        
        var pos = {};
        
        if(type=="position" && pm.pos!=""){
	    	pos = $.three_pos(pm.pos);   
	    }else if(type=="rotation" && pm.rot!=""){
			pos = $.three_pos(pm.rot);   
	    }else if(type=="scale" && pm.scale!=""){
			pos = $.three_pos(pm.scale);   
	    }
	    
	    if(pm.x!=""){
			pos.x = parseFloat(pm.x);
		}
	    
	    if(pm.y!=""){
			pos.y = parseFloat(pm.y);
		}
	    
	    if(pm.z!=""){
			pos.z = parseFloat(pm.z);
		}
	    
	    
        this.kag.tmp.three.models[pm.name].toAnim(type, pos, options, ()=>{
			
			if(pm.wait=="true"){
        		this.kag.ftag.nextOrder();
       		}
        	
	    });
        
        if(pm.wait!="true"){
        	this.kag.ftag.nextOrder();
       	}
        
        
    },
    
    
    
        
};


tyrano.plugin.kag.tag["model_debug"] = {

    vital : ["name"],
     	
    pm : {
        
        name:"",
        time:"500"
        
    },

    start : function(pm) {
        
        var three = this.kag.tmp.three;
        
        var model_obj = this.kag.tmp.three.models[pm.name]; 
        var model = model_obj.model;
        
        var renderer = three.renderer;
        var camera   = three.camera;
        
        var sc_width = parseInt(this.kag.config.scWidth);
        var sc_height = parseInt(this.kag.config.scHeight);
            
        // オブジェクトの回転
        var prevPosition ={};
        var mousedown = false;
        var button = 0;

        //オブジェクトの移動
        var vec = new THREE.Vector3(); // create once and reuse
        var pos = new THREE.Vector3(); // create once and reuse
        
        var original_pos = new THREE.Vector3(); // create once and reuse
        
        var hen_pos = {
            
            x:0,
            y:0,
            z:0,
            
        }
        
        var first_client_y = 0; 
        var first_model_z = 0;
        
        ///マウスホイール
        renderer.domElement.addEventListener("mousewheel",function(e){
            
            var delta = e.wheelDelta;
            
            if(delta < 0){
                
                model.scale.x -= model.scale.x*0.01;
                model.scale.y -= model.scale.y*0.01
                model.scale.z -= model.scale.z*0.01;
                
            }else{
	            
                model.scale.x += model.scale.x*0.01;
                model.scale.y += model.scale.y*0.01
                model.scale.z += model.scale.z*0.01;
            
            }
            
            console.log("scale="+$.orgFloor(model.scale.x,100));
            
            e.preventDefault();
            
        });
            
        renderer.domElement.addEventListener('mousedown', function(e) {
            
            if (e.button == 0) {
                button = 0;
            }
            else if (e.button == 1) {
                //target.innerHTML = "中ボタンが押されました。";
                button = 1;
                first_client_y = e.clientY;
                first_model_z = model.position.z;
            }
            else if (e.button == 2) {
	            
                button = 2;
                
                vec.set(
                ( e.clientX / window.innerWidth ) * 2 - 1,
                    - ( e.clientY / window.innerHeight ) * 2 + 1,
                0.5 );
                
                vec.unproject(camera);
                
                vec.sub(camera.position).normalize();
                
                var distance = - camera.position.z / vec.z;
                
                original_pos.copy( camera.position ).add(vec.multiplyScalar( distance));
                
                hen_pos.x = model.position.x - original_pos.x;
                hen_pos.y = model.position.y - original_pos.y;
                
                
            }
            
            mousedown = true;
            prevPosition = {x: e.pageX, y: e.pageY};
            
        
        }, false);
        
        renderer.domElement.addEventListener('mousemove', function(e) {
            
            if (!mousedown) return;
            
            if(button==0){

                moveDistance = {x: prevPosition.x - e.pageX, y: prevPosition.y - e.pageY};
                model.rotation.x += moveDistance.y * 0.01;
                model.rotation.y -= moveDistance.x * 0.01;
                prevPosition = {x: e.pageX, y: e.pageY};
                
            }else if(button==1){
	        	
	        	var hen_y = first_client_y - e.clientY;
	        	model.position.z = first_model_z + hen_y;
                
	        }else if(button ==2){
                
                vec.set(
                ( e.clientX / window.innerWidth ) * 2 - 1,
                    - ( e.clientY / window.innerHeight ) * 2 + 1,
                0.5 );
                
                vec.unproject(camera);
                
                vec.sub(camera.position).normalize();
                
                var distance = - camera.position.z / vec.z;
                
                pos.copy( camera.position ).add(vec.multiplyScalar( distance));
                
                model.position.x = $.orgFloor(hen_pos.x + pos.x,1);
                model.position.y = $.orgFloor(hen_pos.y + pos.y,1);
                
            }
            
            
        }, false);
 
        renderer.domElement.addEventListener('mouseup', function(e) {
            
            
            if(button==0){
                
                var str = $.orgFloor(model.rotation.x,100) + "," + $.orgFloor(model.rotation.y,100) + "," + model.rotation.z;
                console.log('rot="'+str+'"');
    
            }else if(button ==2 || button==1){
            
                var str = model.position.x + "," + model.position.y + "," + model.position.z;
                console.log('pos="'+str+'"');
    
            }
            
            mousedown = false;
        }, false);
        
        
        //デバッグ終了ボタンを押すと、nextOrderする。
        //リロードボタンの配置
        //メッセージエリア非表示。
        
        var j_close_button = $("<div style='position:absolute;z-index:9999999999;padding:10px;opacity:0.8;background-color:white;left:0px;top:0px'><button style='cursor:pointer'><span style=''>3Dインスペクタを閉じる</span></button></div>");
        j_close_button.draggable({
    
            scroll : false,
            //containment:".tyrano_base",
            stop : (e, ui) => {
                
            }
        });
        
        j_close_button.find("button").on("click",(e)=>{
            j_close_button.remove();
            
            $(renderer.domElement).off("mousedown");
            $(renderer.domElement).off("mouseup");
            $(renderer.domElement).off("mousemove");
            $(renderer.domElement).off("mousewheel");
            
            this.kag.ftag.nextOrder();
        });
        
        $("body").append(j_close_button);
        
        
    },
    
    
    
        
};




