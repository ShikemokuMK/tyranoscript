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
            
            /*
            const light = new THREE.AmbientLight(0xFFFFFF, 2.0);
            scene.add(light);
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
            
            //モデルのサイズ。
            model.scale.set(400.0, 400.0, 400.0);
            model.position.set(0, -550, 500);
            
            const animations = gltf.animations;
            const mixer = new THREE.AnimationMixer(model);
            
            const anime = mixer.clipAction(animations[0]);
            anime.play();
            
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
        time:"500"
        
        
    },

    start : function(pm) {
        
        var three = this.kag.tmp.three;
        
        var options = {
            duration:parseInt(pm.time)
        };
        
        this.kag.tmp.three.models[pm.name].fade("in",options);
        
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
        
        var three = this.kag.tmp.three;
        
        var options = {
            duration:parseInt(pm.time)
        };
        
        this.kag.tmp.three.models[pm.name].fade("out",options);
        
        this.kag.ftag.nextOrder();
            
        
        
    },
    
    
    
        
};






