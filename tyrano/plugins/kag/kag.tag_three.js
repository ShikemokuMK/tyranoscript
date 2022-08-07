$.three_pos = function (str) {
    var obj = {};
    var arr_obj = str.split(",");

    if (arr_obj.length == 1) {
        obj.x = parseFloat(arr_obj[0]);
        obj.y = parseFloat(arr_obj[0]);
        obj.z = parseFloat(arr_obj[0]);
    } else {
        obj.x = parseFloat(arr_obj[0]);
        obj.y = parseFloat(arr_obj[1]);
        obj.z = parseFloat(arr_obj[2]);
    }

    return obj;
};

$.setVector = function (model) {
    var vector = {};

    vector["pos"] = {
        x: model.position.x,
        y: model.position.y,
        z: model.position.z,
    };
    vector["rot"] = {
        x: model.rotation.x,
        y: model.rotation.y,
        z: model.rotation.z,
    };
    vector["scale"] = { x: model.scale.x, y: model.scale.y, z: model.scale.z };

    return vector;
};

$.orgFloor = function (value, base) {
    return Math.floor(value * base) / base;
};

$.checkThreeModel = function (name) {
    if (TYRANO.kag.tmp.three.models[name]) {
        return true;
    } else {
        TYRANO.kag.error("undefined_3d_model", { name });
    }
};

/*
$.getAngle = function(){


    let disp = 0;

    switch(window.orientation) {
      case 0:
       disp += 0;
       break;

      case -90:
       disp = 1;
       break;

      case 90:
       disp = 2;
       break;

      case 180:
       disp = 3;
       break;

    }

    return disp;

}
*/

/*
#[3d_init]

:group
3D関連

:title
3D機能の初期化

:exp
3D関連の機能を使用するために必要な宣言です。
このタグを通過するとき、ゲーム内に3Dを表示するための初期化が行われます。
このタグを通過するまで`[3d_...]`で始まるタグは使えません。

3D機能を使用する直前に宣言し、3D機能の仕様が終わった段階で`[3d_close]`を行いましょう。

:sample
[3d_init layer=0]

:param
layer  = 3Dモデルを配置するレイヤを指定できます。,
camera = カメラのモードを指定できます。`Perspective`(遠近感あり)、`Orthographic`(遠近感なしの平行投影),
near   = カメラに近いオブジェクトをどの距離まで描画するかを設定できます。,
far    = カメラから遠いオブジェクトを表示する距離を設定できます。大きすぎると不必要に遠くまで描画するため処理が重くなります。可能な限り小さい値に調整しましょう。

#[end]
*/

tyrano.plugin.kag.tag["3d_init"] = {
    vital: [],

    pm: {
        layer: "0",
        page: "fore",
        camera: "Perspective",
        near: "1",
        far: "5000",

        next: "true",
    },

    clock: {},

    start: function (pm) {
        var that = this;

        var target_layer = this.kag.layer.getLayer(pm.layer, pm.page);

        this.clock = new THREE.Clock();

        //すでにthreelayerが存在する場合は無視する
        if ($(".three_canvas").length > 0) {
            //２重登録
            this.kag.ftag.nextOrder();
            return;
        }

        //3Dモデル用のシーンを挿入する。
        var j_canvas = $("<canvas id='three' class='three_canvas'></canvas>");

        var sc_width = parseInt(this.kag.config.scWidth);
        var sc_height = parseInt(this.kag.config.scHeight);

        j_canvas.css({
            position: "absolute",
            width: sc_width,
            height: sc_height,
        });

        target_layer.append(j_canvas);

        const renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector("#three"),
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true,
        });

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(sc_width, sc_height);

        // シーンを作成
        const scene = new THREE.Scene();

        //カメラの種類
        const camera_mode = pm.camera + "Camera";

        // カメラを作成 Perspective or Orthographic
        const camera = new THREE[camera_mode](45, sc_width / sc_height, parseFloat(pm.near), parseFloat(pm.far));
        camera.rotation.order = "YXZ";

        camera.position.set(0, 0, +1000);

        this.kag.tmp.three.models["camera"] = new ThreeModel({ name: "camera", model: camera, mixer: null, gltf: null, pm: pm }, three);

        //指定のレイヤは表示状態に移行。
        target_layer.show();

        //環境光
        const light_amb = new THREE.AmbientLight(0xffffff, 1);
        scene.add(light_amb);

        //並行方向からの光
        const light = new THREE.DirectionalLight(0xffffff, 1);
        scene.add(light);

        this.kag.tmp.three.stat.is_load = true;
        this.kag.tmp.three.stat.canvas_show = true;
        this.kag.tmp.three.stat.init_pm = pm;

        this.kag.tmp.three.camera = camera;
        this.kag.tmp.three.scene = scene;
        this.kag.tmp.three.renderer = renderer;
        this.kag.tmp.three.light_amb = light_amb;

        this.kag.tmp.three.target_layer = target_layer;
        this.kag.tmp.three.j_canvas = j_canvas;

        var three = this.kag.tmp.three;

        tick();

        var t = Math.random();

        //毎フレーム時に実行されるループイベントです
        function tick() {
            if (three.orbit_controls) {
                three.orbit_controls.update();
            }

            that.updateFrame();

            renderer.render(scene, camera); // レンダリング

            var req_id = requestAnimationFrame(tick);

            if (three.stat.is_load == false) {
                window.cancelAnimationFrame(req_id);
            }
        }

        //イベント検知用の処理
        this.initEvent(this.kag.tmp.three);

        if (pm.next == "true") {
            this.kag.ftag.nextOrder();
        }
    },

    initEvent: function (three) {
        var that = this;

        var renderer = three.renderer;
        var target_layer = three.target_layer;
        var j_canvas = three.j_canvas;
        var camera = three.camera;
        var scene = three.scene;

        j_canvas.on("click", function (event) {
            var x = event.clientX;
            var y = event.clientY;

            // マウスクリック位置を正規化
            var mouse = new THREE.Vector2();
            mouse.x = (x / window.innerWidth) * 2 - 1;
            mouse.y = -(y / window.innerHeight) * 2 + 1;

            // Raycasterインスタンス作成
            var raycaster = new THREE.Raycaster();

            // 取得したX、Y座標でrayの位置を更新
            raycaster.setFromCamera(mouse, camera);

            // オブジェクトの取得
            var intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                //console.log(intersects[0].object);
                var name = intersects[0].object.userData["name"];
                if (that.kag.stat.is_strong_stop == true) {
                    if (three.evt[name]) {
                        that.kag.cancelWeakStop();
                        that.kag.ftag.startTag("jump", three.evt[name]);
                        return;
                    }
                } else {
                    //console.log("none");
                }
            }
        });
    },

    updateFrame: function () {
        //対応が必要なフレーム処理をここで実施する。

        var three = this.kag.tmp.three;
        var camera = three.camera;
        var models = three.models;

        var delta = this.clock.getDelta();

        for (let key in models) {
            if (models[key].mixer) {
                models[key].update(delta);
            }
        }

        //フレームアップデートのタイミングでジャイロ反映
        if (three.stat.gyro.mode == 1) {
            camera.rotation.x = three.stat.gyro.x;
            camera.rotation.y = three.stat.gyro.y;
        } else if (three.stat.gyro.mode == 2) {
            camera.position.x = three.stat.gyro.x;
            camera.position.y = three.stat.gyro.y;
        }
    },
};

/*
#[3d_model_new]

:group
3D関連

:title
3Dモデルの作成

:exp
外部ファイルの3Dモデルを読み込んで定義します。
このタグを実行しただけでは、3Dモデルはまだゲーム画面に表示されません。表示するには`[3d_show]`が必要です。
3Dモデルファイルは`data/others/3d/model`フォルダに配置します。

:sample
[3d_init layer=0]

[3d_model_new name="mymodel" storage="mymodel/scene.gltf" ]
[3d_show name="mymodel" pos="100,20,20" rot="1,1,1" scale=10 ]

:param
name    = 3Dオブジェクトの名前です。この名前をつかって表示・非表示などを制御します。,
storage = 3Dモデルのファイルを指定します。対応している形式は`gltf`、`obj`です。ファイルは`dataothers/3d/model`フォルダに配置します。,
pos     = 3Dオブジェクトを配置する座標を指定します。xyz座標をそれぞれ半角カンマ区切りでまとめて指定します。,
rot     = 3Dオブジェクトの回転を指定します。xyz軸の回転をそれぞれ半角カンマ区切りでまとめて指定します。,
scale   = 3Dオブジェクトの拡大率を指定します。xyz軸の拡大率をそれぞれ半角カンマで区切ってまとめて指定します。,
tonemap = トーンマッピングが有効な場合、このオブジェクトが影響を受けるかどうか。デフォルトは`true`。無効にする場合は`false`を指定します。,
motion  = 3Dモデルにモーションが存在する場合、モーション名を指定できます。指定がない場合はひとつめのモーションファイルが自動的に適応されます。,
folder  = ファイルの配置フォルダを変更できます。たとえば`fgimage`と指定すると、`data/fgimage`フォルダにある3Dモデルファイルを探します。

#[end]
*/

tyrano.plugin.kag.tag["3d_model_new"] = {
    vital: ["name", "storage"],

    pm: {
        name: "",
        storage: "",

        pos: "0",
        rot: "0",
        scale: "100",
        tonemap: "true",
        motion: "",
        next: "true",
        folder: "",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;

        var folder = "";

        if (pm.folder != "") {
            folder = pm.folder;
        } else {
            folder = "others/3d/model";
        }

        var ext = $.getExt(pm.storage);

        if (ext == "gltf" || ext == "glb") {
            var storage_url = "./data/" + folder + "/" + pm.storage;

            var loader = new THREE.GLTFLoader();
            loader.load(storage_url, (data) => {
                var gltf = data;
                var model = gltf.scene;

                let pos = $.three_pos(pm.pos);
                let scale = $.three_pos(pm.scale);
                let rot = $.three_pos(pm.rot);

                //モデルのサイズ。
                model.position.set(pos.x, pos.y, pos.z);
                model.scale.set(scale.x, scale.y, scale.z);
                model.rotation.set(rot.x, rot.y, rot.z);

                const animations = gltf.animations;
                let mixer = new THREE.AnimationMixer(model);

                if (animations.length > 0) {
                    let anim = animations[0];

                    //モーションが指定されている場合はそれを再生する
                    if (pm.motion != "") {
                        for (var i = 0; i < animations.length; i++) {
                            var name = animations[i].name;

                            if (name == pm.motion) {
                                anim = animations[i];
                                break;
                            }
                        }
                    }

                    const anime = mixer.clipAction(anim);
                    anime.play();
                } else {
                    mixer = undefined;
                }

                this.kag.tmp.three.models[pm.name] = new ThreeModel(
                    {
                        name: pm.name,
                        model: model,
                        mixer: mixer,
                        gltf: gltf,
                        pm: pm,
                    },
                    three,
                );

                if (pm.tonemap == "true") {
                    this.kag.tmp.three.models[pm.name].setToneMaped(true);
                } else {
                    this.kag.tmp.three.models[pm.name].setToneMaped(false);
                }

                if (pm.next == "true") {
                    this.kag.ftag.nextOrder();
                }
            });
        } else if (ext == "obj") {
            var obj_url = "./data/" + folder + "/" + pm.storage;
            var mtl_file = obj_url.replace(".obj", ".mtl");
            var mtl_url = mtl_file;

            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.load(mtl_url, (materials) => {
                materials.preload();
                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);

                materials.toneMaped = false;

                objLoader.load(
                    obj_url,
                    (obj) => {
                        var model = obj;
                        let pos = $.three_pos(pm.pos);
                        let scale = $.three_pos(pm.scale);
                        let rot = $.three_pos(pm.rot);

                        //モデルのサイズ。
                        model.position.set(pos.x, pos.y, pos.z);
                        model.scale.set(scale.x, scale.y, scale.z);
                        model.rotation.set(rot.x, rot.y, rot.z);

                        //three.scene.add(model);
                        this.kag.tmp.three.models[pm.name] = new ThreeModel({ name: pm.name, model: model, pm: pm }, three);

                        if (pm.tonemap == "true") {
                            this.kag.tmp.three.models[pm.name].setToneMaped(true);
                        } else {
                            this.kag.tmp.three.models[pm.name].setToneMaped(false);
                        }

                        if (pm.next == "true") {
                            this.kag.ftag.nextOrder();
                        }
                    } /*, onProgress, onError */,
                );
            });
        } else if (ext == "mmd") {
        } else {
            this.kag.error("unsupported_extensions", { ext });
        }

        //読み込んだシーンが暗いので、明るくする
        //three.render.gammaOutput = true;
    },
};

/*
#[3d_sphere_new]

:group
3D関連

:title
3Dモデル(球体)

:exp
球体の3Dモデルを定義します。

:sample

[3d_sphere_new name="tama"]
[3d_show name=tama pos="365,145,0" rot="0.92,-4.3,0" scale="0.77,0.77,0.77" time=2000]

:param
name    = 3Dオブジェクトの名前です。この名前をつかって表示・非表示などを制御します。,
texture = 球体にテクスチャを貼ることができます。画像は`data/others/3d/texture`以下に配置します。画像サイズは`256x256`や`512x512`が推奨されます。,
color   = 球体の色を`0xRRGGBB`形式で指定します。,
pos     = 3Dオブジェクトを配置する座標を指定します。xyz座標をそれぞれ半角カンマ区切りでまとめて指定します。,
rot     = 3Dオブジェクトの回転を指定します。xyz軸の回転をそれぞれ半角カンマ区切りでまとめて指定します。,
scale   = 3Dオブジェクトの拡大率を指定します。xyz軸の拡大率をそれぞれ半角カンマで区切ってまとめて指定します。,

radius  = 球体の半径を指定します。,
width   = 球体の横幅を指定します。,
height  = 球体の高さを指定します。,

tonemap = トーンマッピングが有効な場合、このオブジェクトが影響を受けるかどうか。デフォルトは`true`。無効にする場合は`false`を指定します。

#[end]
*/

tyrano.plugin.kag.tag["3d_sphere_new"] = {
    vital: ["name"],

    pm: {
        name: "",

        type: "SphereGeometry",

        texture: "",
        color: "0x00ff00",

        radius: "300",
        width: "30",
        height: "30",

        scale: "1",
        pos: "0",
        rot: "0",

        folder: "",
    },

    start: function (pm) {
        pm.arg1 = pm.radius;
        pm.arg2 = pm.width;
        pm.arg3 = pm.height;

        this.kag.ftag.startTag("obj_model_new", pm);
    },
};

/*
#[3d_sprite_new]

:group
3D関連

:title
3Dモデル(スプライト)

:exp
スプライトの3Dモデルを定義します。
イメージとの違いはスプライトの場合、オブジェクトが常にカメラの方を向きます。

:sample

[3d_sprite_new name="yamato" storage="doki.png"]
[3d_show name="yamato"]

:param
name    = 3Dオブジェクトの名前です。この名前をつかって表示・非表示などの制御を行います。,
storage = 表示する画像ファイルを指定します。ファイルは「others/3d/sprite」フォルダ以下に配置してください。,
pos     = 3Dオブジェクトを配置する座標を指定します。xyz座標をそれぞれ半角カンマ区切りでまとめて指定します。,
rot     = 3Dオブジェクトの回転を指定します。xyz軸の回転をそれぞれ半角カンマ区切りでまとめて指定します。,
scale   = 3Dオブジェクトの拡大率を指定します。xyz軸の拡大率をそれぞれ半角カンマで区切ってまとめて指定します。,
tonemap = トーンマッピングが有効な場合、このオブジェクトが影響を受けるかどうか。デフォルトは`true`。無効にする場合は`false`を指定します。,
folder  = ファイルの配置フォルダを変更できます。たとえば`fgimage`と指定すると、`data/fgimage`フォルダにある3Dモデルファイルを探します。

#[end]
*/

//スプライトを配置する
tyrano.plugin.kag.tag["3d_sprite_new"] = {
    vital: ["name", "storage"],

    pm: {
        name: "",
        storage: "",

        scale: "",
        pos: "0",
        rot: "0",
        tonemap: "false",
        next: "true",

        folder: "",
    },

    start: function (pm) {
        var folder = "";

        if (pm.folder != "") {
            folder = pm.folder;
        } else {
            folder = "others/3d/sprite";
        }

        var storage_url = "./data/" + folder + "/" + pm.storage;

        // マテリアルを作成する
        const material = new THREE.SpriteMaterial({
            map: new THREE.TextureLoader().load(storage_url),
            alphaTest: 0.01,
            transparent: true,
        });

        if (pm.tonemap == "true") {
            material.toneMapped = true;
        } else {
            material.toneMapped = false;
        }

        var model = new THREE.Sprite(material);

        $("<img />")
            .attr("src", storage_url)
            .on("load", (e) => {
                var width = $(e.currentTarget).get(0).width;
                var height = $(e.currentTarget).get(0).height;

                let pos = $.three_pos(pm.pos);
                let rot = $.three_pos(pm.rot);

                model.position.set(pos.x, pos.y, pos.z);
                model.rotation.set(rot.x, rot.y, rot.z);

                if (pm.scale == "") {
                    model.scale.set(parseInt(width) * 1, parseInt(height) * 1, 1);
                } else {
                    let scale = $.three_pos(pm.scale);
                    model.scale.set(scale.x, scale.y, scale.z);
                }

                var three = this.kag.tmp.three;
                var scene = three.scene;

                this.kag.tmp.three.models[pm.name] = new ThreeModel({ name: pm.name, model: model, pm: pm }, three);

                if (pm.next == "true") {
                    this.kag.ftag.nextOrder();
                }
            });
    },
};

/*
#[3d_event]

:group
3D関連

:title
3Dイベント定義

:exp
3Dオブジェクトがクリックされたときにイベントを発火（シナリオをジャンプ）させることができます。イベントは`[s]`タグに到達していないと発火しません。

一度イベントが発火すると、次に`[3d_event_start]`タグを通過するまでイベントが発火しなくなります。イベントを何度も発火させる必要がある場合、ジャンプ先に`[3d_event_start]`を配置してください。

:sample

;3Dモデルの定義と表示
[3d_model_new name="miruku" storage="miruku/scene.gltf" scale=300 pos="0,-300,500" ]
[3d_event name="miruku" target="miruku"]

;ボックスの表示
[3d_box_new name="box" width=100 height=100 depth=100 scale=2 tone=false color="0xFFFFFF"]
[3d_show name="box" time=2000 ]

;イベントの定義
[3d_event name="miruku" target="miruku_click"]
[3d_event name="box" target="box_click"]

[s]

*miruku_click
3Dモデルがクリックされた[p]

@jump target="common"

*box_click
ボックスがクリックされた[p]

*common

イベントを再開する[p]
@3d_event_start

:param
name    = 3Dオブジェクトの名前です。イベントを発生させる3Dオブジェクトの`name`を指定します。,
storage = !!jump,
target  = !!jump

#[end]
*/

tyrano.plugin.kag.tag["3d_event"] = {
    vital: ["name"],

    pm: {
        name: "",
        storage: "",
        target: "",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;

        three.stat.start_event = true;
        three.evt[pm.name] = pm;

        this.kag.ftag.nextOrder();
    },
};

/*
#[3d_event_delete]

:group
3D関連

:title
3Dイベントの削除

:exp
登録した3Dイベントを無効化します。

:sample
;ボックスの表示
[3d_box_new name="box" width=100 height=100 depth=100 scale=2 tone=false color="0xFFFFFF"]
[3d_show name="box" time=2000 ]

;イベントの定義の削除。これ移行はクリックしても反応しなくなります。
[3d_event_delete name="box" ]

[s]

:param
name = 3Dオブジェクトの名前です。イベントを削除する3Dオブジェクトの`name`を指定します。

#[end]
*/

tyrano.plugin.kag.tag["3d_event_delete"] = {
    vital: ["name"],

    pm: {
        name: "",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;

        delete three.evt[pm.name];

        this.kag.ftag.nextOrder();
    },
};

/*
#[3d_event_start]

:group
3D関連

:title
3Dイベントの開始

:exp
登録した3Dイベントを開始します。
イベントが一度実行された後は全イベントが無効化されるため、受付を再開したい場合はこのタグを配置する必要があります。

:sample


:param

#[end]
*/

tyrano.plugin.kag.tag["3d_event_start"] = {
    vital: [],

    pm: {},

    start: function (pm) {
        var three = this.kag.tmp.three;
        three.stat.start_event = true;
        this.kag.ftag.nextOrder();
    },
};

/*
#[3d_event_stop]

:group
3D関連

:title
3Dイベントの停止

:exp
登録した3Dイベントを一時的に停止します。

登録したイベント自体は消えません。`[3d_event_start]`タグでいつでも再開できます。

:sample

:param

#[end]
*/

//イベントを取得する。
tyrano.plugin.kag.tag["3d_event_stop"] = {
    vital: [],

    pm: {},

    start: function (pm) {
        var three = this.kag.tmp.three;
        three.stat.start_event = false;
        this.kag.ftag.nextOrder();
    },
};

/*
#[3d_box_new]

:group
3D関連

:title
3Dモデル(ボックス)

:exp
立方体の3Dモデルを定義します。

:sample

;ボックスの定義と表示
[3d_box_new name="mybox1" ]
[3d_show name="mybox1" pos="365,145,0" rot="0.92,-4.3,0" scale="0.77,0.77,0.77" time=2000]

;テクスチャの６面に異なる画像を使う場合の例
[3d_box_new name="mybox2" width=100 height=100 depth=100 texture="dice/1.png,dice/2.png,dice/3.png,dice/4.png,dice/5.png,dice/6.png" ]
[3d_show name="mybox2" time=2000 ]


:param
name    = 3Dオブジェクトの名前です。この名前をつかって表示・非表示を制御します。,
texture = 表示する画像ファイルを指定します。ファイルは`data/others/3d/texture`フォルダ以下に配置してください。１つのテクスチャの場合はすべての面が同じ画像になりますが、半角カンマで区切って６つ指定するとすべての面に異なるテクスチャを適応することもできます,
color   = 色を指定できます。0xRRGGBB 形式で指定します。,
width   = 3Dオブジェクトの横幅を指定します。デフォルトは1です,
height  = 3Dオブジェクトの高さを指定します。デフォルトは1です,
depth   = 3Dオブジェクトの深さを指定します。デフォルトは1です,
pos     = 3Dオブジェクトを配置する座標を指定します。xyz座標をそれぞれ半角カンマ区切りでまとめて指定します。,
rot     = 3Dオブジェクトの回転を指定します。xyz軸の回転をそれぞれ半角カンマ区切りでまとめて指定します。,
scale   = 3Dオブジェクトの拡大率を指定します。xyz軸の拡大率をそれぞれ半角カンマで区切ってまとめて指定します。,
tonemap = トーンマッピングが有効な場合、このオブジェクトが影響を受けるかどうか。デフォルトは`true`。無効にする場合は`false`を指定します。

#[end]
*/

tyrano.plugin.kag.tag["3d_box_new"] = {
    vital: ["name"],

    pm: {
        name: "",

        type: "BoxGeometry",

        texture: "", // ,でくくると６面体それぞれにテクスチャを貼ることができる。
        color: "0x00ff00",

        width: "1",
        height: "1",
        depth: "1",

        scale: "1",
        pos: "0",
        rot: "0",

        folder: "",
    },

    start: function (pm) {
        pm.arg1 = pm.width;
        pm.arg2 = pm.height;
        pm.arg3 = pm.depth;

        this.kag.ftag.startTag("obj_model_new", pm);
    },
};

/*
#[3d_image_new]

:group
3D関連

:title
3Dモデル(イメージ)

:exp
イメージの3Dモデルを定義します。
平面の板が3Dシーンに追加されるイメージです。

:sample

;3Dイメージ
[3d_image_new name="myimg" texture="room.jpg" width=200 doubleside=true ]
[3d_show name="myimg" ]

:param
name       = 3Dオブジェクトの名前です。この名前をつかって表示・非表示などの制御を行います。,
texture    = 表示する画像ファイルを指定します。ファイルは「others/3d/texture」フォルダ以下に配置してください。,
width      = 3Dオブジェクトの横幅を指定します。デフォルトは1です,
height     = 3Dオブジェクトの高さを指定します。省略した場合は画像サイズの比率を保った形で表示できます。,
pos        = 3Dオブジェクトを配置する座標を指定します。xyz座標をそれぞれ半角カンマ区切りでまとめて指定します。,
rot        = 3Dオブジェクトの回転を指定します。xyz軸の回転をそれぞれ半角カンマ区切りでまとめて指定します。,
scale      = 3Dオブジェクトの拡大率を指定します。xyz軸の拡大率をそれぞれ半角カンマで区切ってまとめて指定します。,
tonemap    = トーンマッピングが有効な場合、このオブジェクトが影響を受けるかどうか。デフォルトは`true`。無効にする場合は`false`を指定します。,
doubleside = テクスチャを両面に表示させるかを指定します。デフォルトはfalse。trueを指定すると裏面にもテクスチャが表示されます。

#[end]
*/

//球体をつくる
tyrano.plugin.kag.tag["3d_image_new"] = {
    vital: ["name", "width"],

    pm: {
        name: "",

        type: "PlaneGeometry",

        texture: "",

        width: "",
        height: "",

        scale: "1",
        pos: "0",
        rot: "0",

        doubleside: "false",
        tonemap: "false",
    },

    start: function (pm) {
        //heightが省略されている場合は画像のサイズから数値を決める
        if (pm.height == "") {
            var texture_url = "./data/others/3d/texture/" + pm.texture;

            $("<img />")
                .attr("src", texture_url)
                .on("load", (e) => {
                    var width = $(e.currentTarget).get(0).width;
                    var height = $(e.currentTarget).get(0).height;

                    var tmp = height / width;

                    pm.height = parseInt(parseInt(pm.width) * tmp);

                    pm.arg1 = pm.width;
                    pm.arg2 = pm.height;
                    pm.arg3 = 1;

                    this.kag.ftag.startTag("obj_model_new", pm);
                });
        } else {
            pm.arg1 = pm.width;
            pm.arg2 = pm.height;
            pm.arg3 = 1;

            this.kag.ftag.startTag("obj_model_new", pm);
        }
    },
};

//基本図形 直接タグで実行することはない。
tyrano.plugin.kag.tag["obj_model_new"] = {
    vital: ["name", "type"],

    pm: {
        name: "",
        type: "",

        texture: "",
        color: "",

        arg1: 0,
        arg2: 0,
        arg3: 0,

        scale: "", //100,100,100 //みたいな感じで指定できる。
        pos: "", // 100,40,50
        rot: "",

        doubleside: "false",
        tonemap: "true",

        motion: "",

        folder: "",

        next: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;
        var scene = three.scene;

        //var storage_url = "./data/" + folder + "/" + pm.storage;

        const geometry = new THREE[pm.type](parseFloat(pm.arg1), parseFloat(pm.arg2), parseFloat(pm.arg3));

        // 画像を読み込む
        let material;

        if (pm.texture != "") {
            //boxで配列の場合は別処理になる
            if (pm.type == "BoxGeometry" && pm.texture.split(",").length > 1) {
                var arr_texture = pm.texture.split(",");
                var arr_material = [];
                const loader = new THREE.TextureLoader();

                for (let i = 0; i < arr_texture.length; i++) {
                    let texture_url = "./data/others/3d/texture/" + arr_texture[i];
                    const texture = loader.load(texture_url);
                    arr_material.push(new THREE.MeshStandardMaterial({ map: texture }));
                }

                // マテリアルにテクスチャーを設定
                material = arr_material;
            } else {
                let texture_url = "./data/others/3d/texture/" + pm.texture;
                const loader = new THREE.TextureLoader();
                const texture = loader.load(texture_url);
                // マテリアルにテクスチャーを設定
                material = new THREE.MeshStandardMaterial({
                    map: texture,
                    alphaTest: 0.01,
                    transparent: true,
                });
            }
        } else {
            material = new THREE.MeshStandardMaterial({
                color: parseInt(pm.color.toLowerCase()),
            });
        }

        if (pm.doubleside == "true") {
            material["side"] = THREE.DoubleSide;
        }

        if (pm.tonemap == "true") {
            material.toneMapped = true;
        } else {
            material.toneMapped = false;
        }

        // メッシュを作成
        const model = new THREE.Mesh(geometry, material);

        let pos = $.three_pos(pm.pos);
        let scale = $.three_pos(pm.scale);
        let rot = $.three_pos(pm.rot);

        model.position.set(pos.x, pos.y, pos.z);
        model.scale.set(scale.x, scale.y, scale.z);
        model.rotation.set(rot.x, rot.y, rot.z);

        // 3D空間にメッシュを追加
        //scene.add(model);

        this.kag.tmp.three.models[pm.name] = new ThreeModel({ name: pm.name, model: model, pm: pm }, three);

        if (pm.next == "true") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[3d_show]

:group
3D関連

:title
3Dオブジェクト表示

:exp
定義した3Dオブジェクトを実際にゲーム画面に登場させます。

:sample

;3Dイメージ
[3d_image_new name="myimg" texture="room.jpg" width=200 doubleside=true ]
[3d_show name="myimg" ]

:param
name  = 3Dオブジェクトの名前です。表示させたいオブジェクトの`name`を指定します,
time  = 表示させるまでの時間をミリ秒で指定します。,
wait  = 表示の完了を待つか否か。,
pos   = 3Dオブジェクトを配置する座標を指定します。xyz座標をそれぞれ半角カンマ区切りでまとめて指定します。,
rot   = 3Dオブジェクトの回転を指定します。xyz軸の回転をそれぞれ半角カンマ区切りでまとめて指定します。,
scale = 3Dオブジェクトの拡大率を指定します。xyz軸の拡大率をそれぞれ半角カンマで区切ってまとめて指定します。

#[end]
*/

tyrano.plugin.kag.tag["3d_show"] = {
    vital: ["name"],

    pm: {
        name: "",
        time: "500",

        scale: "",
        pos: "",
        rot: "",

        wait: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;

        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        var model = this.kag.tmp.three.models[pm.name];

        three.scene.add(model.model);

        var options = {
            duration: parseInt(pm.time),
        };

        if (pm.pos != "") {
            let pos = $.three_pos(pm.pos);
            model.setPosition(pos.x, pos.y, pos.z);
        }

        if (pm.scale != "") {
            let scale = $.three_pos(pm.scale);
            model.setScale(scale.x, scale.y, scale.z);
        }

        if (pm.rot != "") {
            let rot = $.three_pos(pm.rot);
            model.setRotation(rot.x, rot.y, rot.z);
        }

        if (pm.wait == "true") {
            model.fade("in", options, () => {
                this.kag.ftag.nextOrder();
            });
        } else {
            model.fade("in", options);
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[3d_hide]

:group
3D関連

:title
3Dオブジェクト非表示

:exp
3Dオブジェクトをゲーム画面から退場させます。
このタグを実行しても定義自体は削除されません。
もう一度表示させるには`[3d_show]`タグを使います。

:sample

;3Dイメージ
[3d_image_new name="myimg" texture="room.jpg" width=200 doubleside=true]
[3d_show name="myimg"]

非表示にします。[p]
[3d_hide name="myimg"]

:param
name = 退場させるオブジェクトの`name`を指定します。,
time = 退場させるまでの時間をミリ秒で指定します。,
wait = 退場の完了を待つかどうか。`true`または`false`で指定します。

#[end]
*/

tyrano.plugin.kag.tag["3d_hide"] = {
    vital: ["name"],

    pm: {
        name: "",
        time: "500",
        next: "true",
        wait: "true",
    },

    start: function (pm) {
        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        var three = this.kag.tmp.three;

        var options = {
            duration: parseInt(pm.time),
        };

        var model = this.kag.tmp.three.models[pm.name];

        if (pm.wait == "true") {
            model.fade("out", options, (_model) => {
                this.kag.ftag.nextOrder();
                three.scene.remove(_model);
            });
        } else {
            model.fade("out", options, (_model) => {
                three.scene.remove(_model);
            });

            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[3d_hide_all]

:group
3D関連

:title
3Dオブジェクト全非表示

:exp
すべての3Dオブジェクトをゲーム画面から退場させます。
このタグを実行しても定義自体は削除されません。
もう一度表示する場合は`[3d_show]`タグを使ってください。

:sample

:param
time = 退場させるまでの時間をミリ秒で指定します。,
wait = 退場の完了を待つかどうか。`true`または`false`で指定します

#[end]
*/

tyrano.plugin.kag.tag["3d_hide_all"] = {
    vital: [],

    pm: {
        time: "500",
        wait: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;

        var options = {
            duration: parseInt(pm.time),
        };

        var models = this.kag.tmp.three.models;

        var cnt_fade = 0;
        var fin_fade = 0;

        for (let key in models) {
            if (key == "camera") continue;

            cnt_fade++;

            if (pm.wait == "true") {
                models[key].fade("out", options, (_model) => {
                    three.scene.remove(_model);
                    fin_fade++;

                    if (cnt_fade == fin_fade) {
                        this.kag.ftag.nextOrder();
                    }
                });
            } else {
                models[key].fade("out", options, (_model) => {
                    three.scene.remove(_model);
                    fin_fade++;
                });

                this.kag.ftag.nextOrder();
            }
        }

        if (cnt_fade == 0) {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
 #[3d_delete]

:group
3D関連

:title
3Dオブジェクトの定義の削除

:exp
3Dオブジェクトの定義を削除します。
このタグは[3d_hide]とは異なり3Dモデルの定義自体を削除するので、モデルを再度使用するには`[3d_model_new]`タグを使う必要があります。
使用しなくなった3Dオブジェクトの定義をこまめに削除しておくことで軽量な動作が期待できます。

:sample

;3Dイメージ
[3d_image_new name="myimg" texture="room.jpg" width=200 doubleside=true]
[3d_show name="myimg"]

非表示にします。[p]
[3d_hide name="myimg"]

定義からも削除[p]
[3d_delete name="myimg"]

:param
name = 削除したい3Dオブジェクトの`name`を指定します。

#[end]
*/

tyrano.plugin.kag.tag["3d_delete"] = {
    vital: ["name"],

    pm: {
        name: "",
    },

    start: function (pm) {
        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        var three = this.kag.tmp.three;

        var model = this.kag.tmp.three.models[pm.name];
        three.scene.remove(model.model);

        delete this.kag.tmp.three.models[pm.name];
        this.kag.ftag.nextOrder();
    },
};

/*
#[3d_delete_all]

:group
3D関連

:title
3Dオブジェクト全削除

:exp
3Dオブジェクトをすべて削除します。
3Dシーンをリセットするときに利用します。

:sample

:param

#[end]
*/

tyrano.plugin.kag.tag["3d_delete_all"] = {
    vital: [],

    pm: {},

    start: function (pm) {
        var three = this.kag.tmp.three;

        var models = this.kag.tmp.three.models;

        for (let key in models) {
            if (key == "camera") continue;

            var model = models[key];
            three.scene.remove(model.model);

            delete three.models[key];
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[3d_canvas_show]

:group
3D関連

:title
3Dキャンバス表示

:exp
3Dキャンバスを表示状態にします。
対になる`[3d_canvas_hide]`タグと組み合わせて使います。
3Dシーンとノベルパートを頻繁に行き来する場合に活用できます。

:sample

:param
time = 表示にかける時間をミリ秒で指定できます。

#[end]
*/

tyrano.plugin.kag.tag["3d_canvas_show"] = {
    vital: [],

    pm: {
        time: "1000",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;
        this.kag.tmp.three.stat.canvas_show = true;

        three.j_canvas.fadeIn(parseInt(pm.time), () => {
            this.kag.ftag.nextOrder();
        });
    },
};

/*
#[3d_canvas_hide]

:group
3D関連

:title
3Dキャンバス非表示

:exp
3Dキャンバスを非表示にします。
3Dシーン自体は維持されます。
3Dシーンとノベルパートを頻繁に行き来する場合に活用できます。

:sample
time=表示にかける時間をミリ秒で指定できます。デフォルトは1000です。

:param

#[end]
*/

tyrano.plugin.kag.tag["3d_canvas_hide"] = {
    vital: [],

    pm: {
        time: "1000",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;
        this.kag.tmp.three.stat.canvas_show = false;

        three.j_canvas.fadeOut(parseInt(pm.time), () => {
            this.kag.ftag.nextOrder();
        });
    },
};

/*
#[3d_close]

:group
3D関連

:title
3Dシーン削除

:exp
3Dシーンをすべて削除します。
このタグを使用すると3D系の機能は全て使えなくなります。
もう一度3D系の機能を使用するには`[3d_init]`タグを使用してください。

:sample

:param

#[end]
*/

tyrano.plugin.kag.tag["3d_close"] = {
    vital: [],

    pm: {},

    start: function (pm) {
        var three = this.kag.tmp.three;

        three.stat.is_load = false;
        three.stat.canvas_show = false;

        if (three.j_canvas) {
            three.j_canvas.remove();
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[3d_anim]

:group
3D関連

:title
3Dアニメーション

:exp
シーン上の3Dオブジェクトをアニメーションさせます。

:sample

[3d_model_new name="mymodel" storage="mymodel/scene.gltf" ]
[3d_anim name="miruku" pos="79,-458,727" scale="318.45,318.45,318.45" rot="0.13,-0.64,0" effect="easeInCubic" wait=true]


:param
name   = アニメーション対象の3Dオブジェクトの`name`を指定します。ただし`camera`を指定した場合はカメラをアニメーションさせる動作となります。,
pos    = アニメーション後の座標を指定します。xyz座標をそれぞれ半角カンマ区切りでまとめて指定します。,
rot    = アニメーション後の回転を指定します。xyz軸の回転をそれぞれ半角カンマ区切りでまとめて指定します。,
scale  = アニメーション後の拡大率を指定します。xyz軸の拡大率をそれぞれ半角カンマで区切ってまとめて指定します。,
time   = アニメーションにかける時間をミリ秒で指定します。,
wait   = アニメーションの完了を待つかどうかを`true`または`false`で指定します。,
lookat = `name`が`camera`のときだけ有効。オブジェクトの`name`か`pos`座標を指定することで、カメラを特定の方向に向けられます。,
effect = 変化のエフェクトを指定します。以下のキーワードが指定できます。<br>
`jswing``def``easeInQuad``easeOutQuad``easeInOutQuad``easeInCubic``easeOutCubic``easeInOutCubic``easeInQuart``easeOutQuart``easeInOutQuart``easeInQuint``easeOutQuint``easeInOutQuint``easeInSine``easeOutSine``easeInOutSine``easeInExpo``easeOutExpo``easeInOutExpo``easeInCirc``easeOutCirc``easeInOutCirc``easeInElastic``easeOutElastic``easeInOutElastic``easeInBack``easeOutBack``easeInOutBack``easeInBounce``easeOutBounce``easeInOutBounce`

#[end]
*/

tyrano.plugin.kag.tag["3d_anim"] = {
    vital: ["name"],

    pm: {
        name: "",
        time: "1000",
        effect: "linear",

        pos: "",
        rot: "",
        scale: "",

        lookat: "",

        wait: "true",
    },

    start: function (pm) {
        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        var three = this.kag.tmp.three;

        var options = {
            duration: parseInt(pm.time),
            easing: pm.effect,
        };

        var map_type = {};

        if (pm.pos != "") {
            if (pm.name == "camera" && pm.lookat != "") {
                if (three.models[pm.lookat]) {
                    var model = three.models[pm.lookat].model;
                    let pos = { x: 0, y: 0, z: 0 };
                    pos.x = model.position.x;
                    pos.y = model.position.y;
                    pos.z = model.position.z;

                    map_type["position"] = pos;
                } else {
                    //座標を直接し指定
                    map_type["position"] = $.three_pos(pm.lookat);
                }
            } else {
                map_type["position"] = $.three_pos(pm.pos);
            }
        }

        if (pm.rot != "") {
            map_type["rotation"] = $.three_pos(pm.rot);
        }

        if (pm.scale != "") {
            map_type["scale"] = $.three_pos(pm.scale);
        }

        var cnt_fin = 0;
        var cnt_type = Object.keys(map_type).length;

        for (let key in map_type) {
            let pos = map_type[key];
            var type = key;

            this.kag.tmp.three.models[pm.name].toAnim(type, pos, options, () => {
                cnt_fin++;

                if (cnt_fin >= cnt_type) {
                    if (pm.wait == "true") {
                        this.kag.ftag.nextOrder();
                    }
                }
            });
        }

        if (pm.wait != "true") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[3d_anim_stop]

:group
3D関連

:title
3Dアニメ停止

:exp
3Dオブジェクトのアニメーションを停止できます。

:sample

:param
name   = アニメーションを停止する3Dオブジェクトの`name`を指定します。,
finish = `true`または`false`を指定します。`true`を指定すると3Dオブジェクトが最終的にアニメーションする予定だった場所まで移動します。`false`を指定するとその場で停止します。

#[end]
*/

tyrano.plugin.kag.tag["3d_anim_stop"] = {
    vital: ["name"],

    pm: {
        name: "",
        finish: "true",
    },

    start: function (pm) {
        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        var three = this.kag.tmp.three;

        this.kag.tmp.three.models[pm.name].stopAnim(pm.finish);

        this.kag.ftag.nextOrder();
    },
};

/*
#[3d_scene]

:group
3D関連

:title
3Dシーン設定

:exp
3Dシーン全体に影響する設定を行うことができます。

:sample

[3d_scene light_amb="2" tonemap=""]

:param

tonemap       = トーンマッピングをシーンに設定できます。以下のキーワードが指定できます。`No``Linear``Reinhard``Uncharted2``Cineon``ACESFilmic`<br>デフォルトは`No`(トーンマッピングなし),
tonemap_value = トーンマッピングの強さを設定します。,
light_amb     = 環境光の強さを指定します。デフォルトは`1`。`0.5`だと暗めに、`2`だとかなり明るくなります。

#[end]
*/

//カメラの設定を変更
tyrano.plugin.kag.tag["3d_scene"] = {
    vital: [],

    pm: {
        tonemap: "",
        tonemap_value: "0.8",

        light_amb: "", // 100,40,50

        fog: "", //
        fog_range: "1,3000",
        fog_color: "0xFFFFFF",

        next: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;
        var scene = three.scene;
        var camera = three.camera;
        var renderer = three.renderer;

        if (pm.light_amb != "") {
            three.stat.scene_pm["light_amb"] = pm.light_amb;

            //オブジェクトに設定を入れる。
            three.light_amb.intensity = parseFloat(pm.light_amb);
        }

        if (pm.tonemap != "") {
            three.stat.scene_pm["tonemap"] = pm.tonemap;

            //表示の方法
            renderer.toneMapping = THREE[pm.tonemap + "ToneMapping"];
            renderer.toneMappingExposure = parseFloat(pm.tonemap_value);

            //needs update
            for (let key in three.models) {
                three.models[key].needsUpdate();
            }
        }

        if (pm.fog != "") {
            if (pm.fog == "true") {
                three.stat.scene_pm["fog"] = pm.fog;
                three.stat.scene_pm["fog_color"] = pm.fog_color;
                three.stat.scene_pm["fog_range"] = pm.fog_range;

                var fog_tmp = pm.fog_range.split(",");
                scene.fog = new THREE.Fog(parseInt(pm.fog_color), parseFloat(fog_tmp[0]), parseFloat(fog_tmp[1]));
            } else {
                three.stat.scene_pm["fog"];

                scene.fog.near = 0.1;
                scene.fog.far = 0;
            }
        }

        if (pm.next == "true") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[3d_camera]

:group
3D関連

:title
3Dカメラ

:exp
3Dシーンのカメラを設定できます。
カメラの座標を確認したい場合は`[camera_debug]`をつかって、座標や傾きをテストするのがおすすめです。

:sample

[3d_camera pos="10,20,30"]

:param
pos     = カメラの座標を指定します。xyz座標をそれぞれ半角カンマで区切って指定します。,
rot     = カメラの回転を指定します。xyz軸の回転をそれぞれ半角カンマで区切って指定します。,
lookat  = シーン上の3Dオブジェクトの`name`を指定することで、そのオブジェクトの方にカメラを向けることができます。もしくはxyz座標を直接指定することで、その座標にカメラを向けることもできます。

#[end]
*/

//カメラの設定を変更
tyrano.plugin.kag.tag["3d_camera"] = {
    vital: [],

    pm: {
        pos: "", // 100,40,50
        rot: "", //
        lookat: "", //モデル名を設定。どの場所をみるか。 モデル名　か positionを直指定。

        next: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;
        var camera = three.camera;
        var renderer = three.renderer;

        if (pm.pos != "") {
            let pos = $.three_pos(pm.pos);
            camera.position.set(pos.x, pos.y, pos.z);
        }

        /*
        if(pm.scale!=""){
            let scale = $.three_pos(pm.scale);
            camera.scale.set(scale.x,scale.y,scale.z);
        }
        */

        if (pm.rot != "") {
            let rot = $.three_pos(pm.rot);
            camera.rotation.set(rot.x, rot.y, rot.z);
        }

        if (pm.lookat != "") {
            var pos = {
                x: 0,
                y: 0,
                z: 0,
            };

            if (three.models[pm.lookat]) {
                var model = TYRANO.kag.tmp.three.models[pm.lookat].model;

                pos.x = model.position.x;
                pos.y = model.position.y;
                pos.z = model.position.z;
            } else {
                //座標を直接し指定
                pos = $.three_pos(pm.lookat);
            }

            camera.lookAt(new THREE.Vector3(pos.x, pos.y, pos.z));
        }

        if (pm.next == "true") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[3d_gyro]

:group
3D関連

:title
3Dジャイロ

:exp
ジャイロ（スマホの傾き）でカメラを制御できます。
PCゲームの場合はマウスの位置でジャイロを再現できます。

:sample
[3d_gyro max_x="20" max_y="20" ]

:param
max_x = X軸方向の傾き上限を角度で指定します。,
max_y = Y軸方向の傾き上限を角度で指定します。,
mode  = `position`または`rotation`。カメラの「座標」と「回転」のうちどちらをジャイロで制御するのかを指定できます。回転をジャイロで制御できるようするには`rotation`を、座標をジャイロで制御できるようにするには`position`を指定します。

#[end]
*/

//カメラの設定を変更
tyrano.plugin.kag.tag["3d_gyro"] = {
    vital: [],

    pm: {
        max_x: "30",
        max_y: "30",

        mode: "rotation", // rotation or position

        next: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;
        var camera = three.camera;
        var renderer = three.renderer;

        //ジャイロ設定
        if (true) {
            const GyroMonitor = (device_type) => {
                //var first_pos = {x:}
                var first_beta = 0;
                var first_gamma = 0;
                var first_flag = true;
                var cnt = 0;

                var max_y = parseFloat(pm.max_y);
                var max_x = parseFloat(pm.max_x);

                var default_camera_y = camera.rotation.y;
                var default_camera_x = camera.rotation.x;

                var default_camera_pos_y = camera.position.y;
                var default_camera_pos_x = camera.position.x;

                var angle = 0;

                var frame = parseInt(pm.frame);

                three.stat.gyro.pm = pm;

                const orientEvent = (e) => {
                    //let angle_code = $.getAngle();
                    //console.log(angle);

                    if (first_flag == true) {
                        first_flag = false;
                        first_beta = e.beta;
                        first_gamma = e.gamma;

                        angle = this.kag.tmp.angle;

                        if (pm.mode == "rotation") {
                            three.stat.gyro.mode = 1;
                        } else {
                            three.stat.gyro.mode = 2;
                        }

                        if (angle != 0) {
                            //値の入れ替え
                            [max_x, max_y] = [max_y, max_x];
                        } else {
                            max_x = pm.max_x;
                            max_y = pm.max_y;
                        }
                    }

                    if (angle != this.kag.tmp.angle) {
                        first_flag = true;
                        return;
                    }

                    if (angle != 0) {
                        var t_gamma = e.gamma;

                        if (angle == -90) {
                            if (t_gamma < 0) {
                                return;
                            }
                        } else if (angle == 90) {
                            if (t_gamma > 0) {
                                return;
                            }
                        }
                    }

                    var hen_y = first_beta - e.beta;
                    var hen_x = first_gamma - e.gamma;

                    if (Math.abs(hen_y) > max_y) {
                        if (hen_y > 0) {
                            hen_y = max_y;
                        } else {
                            hen_y = -1 * max_y;
                        }
                    }

                    if (Math.abs(hen_x) > max_x) {
                        if (hen_x > 0) {
                            hen_x = max_x;
                        } else {
                            hen_x = -1 * max_x;
                        }
                    }

                    //カメラのローテーション
                    var gyro_x = 0;
                    var gyro_y = 0;

                    if (three.stat.gyro.mode == 1) {
                        //縦持ち
                        if (angle == 0) {
                            gyro_y = default_camera_x - hen_x * (Math.PI / 180);
                            gyro_x = default_camera_y - hen_y * (Math.PI / 180);
                        } else if (angle == -90) {
                            gyro_y = default_camera_y + hen_y * (Math.PI / 180);
                            gyro_x = default_camera_x - hen_x * (Math.PI / 180);
                        } else if (angle == 90) {
                            gyro_y = default_camera_y + hen_y * -1 * (Math.PI / 180);
                            gyro_x = default_camera_x - hen_x * -1 * (Math.PI / 180);
                        }
                    } else if (three.stat.gyro.mode == 2) {
                        //縦持ち
                        if (angle == 0) {
                            //position  変更
                            gyro_x = default_camera_pos_y + hen_x * 10;
                            gyro_y = default_camera_pos_x + hen_y * 10;
                        } else if (angle == -90) {
                            gyro_y = default_camera_pos_y + hen_x * 10;
                            gyro_x = default_camera_pos_x + hen_y * 10;
                        } else if (angle == 90) {
                            //position  変更
                            gyro_y = default_camera_pos_y + hen_x * 10;
                            gyro_x = default_camera_pos_x + hen_y * 10;
                        }
                    }

                    three.stat.gyro.x = gyro_x;
                    three.stat.gyro.y = gyro_y;
                };

                var sc_width = parseInt(this.kag.config.scWidth);
                var sc_height = parseInt(this.kag.config.scHeight);

                var sc_x = sc_width / 2;
                var sc_y = sc_height / 2;

                //PC版のイベントマウス動かします。
                const mouseMoveEvent = (e) => {
                    //マウスがどう動いたか
                    var x = e.clientX;
                    var y = e.clientY;

                    x = x - sc_x;
                    y = (y - sc_y) * -1;

                    //-1 〜 1 の間で進捗を出す。
                    var p_x = x / sc_x;
                    var p_y = y / sc_y;

                    //座標を調整する。
                    var max_x = parseFloat(pm.max_x);
                    var max_y = parseFloat(pm.max_y);

                    var gyro_x = 0;
                    var gyro_y = 0;

                    if (first_flag == true) {
                        first_flag = false;

                        if (pm.mode == "rotation") {
                            three.stat.gyro.mode = 1;
                        } else {
                            three.stat.gyro.mode = 2;
                        }
                    }

                    //最大値以上になってたら、止める
                    if (three.stat.gyro.mode == 1) {
                        //rotation 変更
                        gyro_x = default_camera_x + max_x * p_x * (Math.PI / 180);
                        gyro_y = default_camera_y - max_y * p_y * (Math.PI / 180);
                    } else if (three.stat.gyro.mode == 2) {
                        //position  変更
                        gyro_y = default_camera_pos_x + max_x * p_x;
                        gyro_x = default_camera_pos_y + max_y * p_y;
                    }

                    three.stat.gyro.x = gyro_y;
                    three.stat.gyro.y = gyro_x;
                };

                if (device_type == "pc") {
                    //イベントの登録と削除。マシンの場合
                    $(".tyrano_base").get(0).removeEventListener("mousemove", mouseMoveEvent);
                    $(".tyrano_base").get(0).addEventListener("mousemove", mouseMoveEvent, true);
                } else {
                    //スマホの場合
                    window.removeEventListener("deviceorientation", orientEvent);
                    window.addEventListener("deviceorientation", orientEvent, true);
                }
            };

            const requestDeviceMotionPermission = () => {
                //PCと
                if ($.userenv() != "pc") {
                    if (DeviceMotionEvent) {
                        if (typeof DeviceMotionEvent.requestPermission === "function") {
                            DeviceMotionEvent.requestPermission()
                                .then((permissionState) => {
                                    if (permissionState === "granted") {
                                        GyroMonitor("sp");
                                    } else {
                                        // 許可を得られなかった場合の処理
                                    }
                                })
                                .catch(console.error); // https通信でない場合などで許可を取得できなかった場合
                        } else {
                            //アンドロイド
                            GyroMonitor("sp");
                        }
                    } else {
                    }
                } else {
                    GyroMonitor("pc");
                }
            };

            requestDeviceMotionPermission();
        }

        if (pm.next == "true") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[3d_gyro_stop]
:group
3D関連

:title
3Dジャイロ停止

:exp
ジャイロの動きを停止します。
カメラの位置や回転をもとに戻したい場合、このタグの直後に`[3d_camera]`で指定する必要があります。
ジャイロを有効にするには再び`[3d_gyro]`タグを使用します。

:sample

:param

#[end]
*/

//カメラの設定を変更
tyrano.plugin.kag.tag["3d_gyro_stop"] = {
    vital: [],

    pm: {
        max_x: "30",
        max_y: "30",
        frame: "1",
        next: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;
        var camera = three.camera;
        var renderer = three.renderer;

        three.stat.gyro.mode = 0;

        this.kag.ftag.nextOrder();
    },
};

/*
#[3d_debug_camera]

:group
3D関連

:title
3Dカメラデバッグ

:exp
3Dシーンのカメラ座標をマウスでドラッグアンドドロップしながら調整できます。
デバッグを終了する場合は画面左上のボタンを押します。

<b>★マウス操作</b>
左クリック：カメラの回転`rot`
右クリック：カメラの位置`pos`
中央クリック：ポジションの`z`軸

:sample
[3d_debug_camera]

:param
button_text = デバッグ終了ボタンのテキストを自由に設定できます。,
menu        = デバッグのメニューを表示するかどうか。`false`を指定すると終了ボタンのみになります。

#[end]
*/

tyrano.plugin.kag.tag["3d_debug_camera"] = {
    vital: [],

    pm: {
        name: "camera",
        button_text: "カメラインスペクタを閉じる",
        menu: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;

        //一番前にもってきて、うごかせるようにする。
        var j_canvas = three.j_canvas;
        var target_layer = three.target_layer;

        var old_target_layer_zindex = target_layer.css("z-index");
        var old_canvas_zindex = j_canvas.css("z-index");

        j_canvas.css("z-index", 9999999);
        target_layer.css("z-index", 9999999);

        var model_obj = this.kag.tmp.three.models[pm.name];
        var model = model_obj.model;

        var renderer = three.renderer;
        var camera = three.camera;

        var sc_width = parseInt(this.kag.config.scWidth);
        var sc_height = parseInt(this.kag.config.scHeight);

        // オブジェクトの回転
        var prevPosition = {};
        var mousedown = false;
        var button = 0;

        //オブジェクトの移動
        var vec = new THREE.Vector3(); // create once and reuse
        var pos = new THREE.Vector3(); // create once and reuse

        var original_pos = new THREE.Vector3(); // create once and reuse

        var hen_pos = {
            x: 0,
            y: 0,
            z: 0,
        };

        var original_v = $.setVector(model);

        var first_client_x = 0;
        var first_client_y = 0;

        var first_model_x = 0;
        var first_model_y = 0;
        var first_model_z = 0;

        function evt_mousewheel(e) {
            var delta = e.wheelDelta;

            if (delta < 0) {
                model.position.z += 5;
            } else {
                model.position.z -= 5;
            }

            evt_mouseup();
            e.preventDefault();
        }

        function evt_mousedown(e) {
            if (e.button == 0) {
                button = 0;

                first_client_x = e.clientX;
                first_client_y = e.clientY;

                first_model_x = model.rotation.x;
                first_model_y = model.rotation.y;
            } else if (e.button == 1) {
                //target.innerHTML = "中ボタンが押されました。";
                button = 1;
                first_client_y = e.clientY;
                first_model_z = model.position.z;
            } else if (e.button == 2) {
                button = 2;

                first_client_x = e.clientX;
                first_client_y = e.clientY;

                first_model_x = model.position.x;
                first_model_y = model.position.y;
            }

            mousedown = true;
        }

        function evt_mousemove(e) {
            if (!mousedown) return;

            if (button == 0) {
                let hen_x = first_client_x - e.clientX;
                model.rotation.y = first_model_y + hen_x * 0.005;

                let hen_y = first_client_y - e.clientY;
                model.rotation.x = first_model_x + hen_y * 0.005;
            } else if (button == 1) {
                let hen_y = first_client_y - e.clientY;
                model.position.z = first_model_z + hen_y;
            } else if (button == 2) {
                let hen_x = first_client_x - e.clientX;
                model.position.x = first_model_x + hen_x * 1;

                let hen_y = first_client_y - e.clientY;
                model.position.y = first_model_y + hen_y * -1;

                model.position.x = $.orgFloor(model.position.x, 1);
                model.position.y = $.orgFloor(model.position.y, 1);
            }
        }

        function evt_mouseup(e) {
            first_client_x = 0;
            first_client_y = 0;

            if (button == 0) {
                var str = $.orgFloor(model.rotation.x, 100) + "," + $.orgFloor(model.rotation.y, 100) + "," + model.rotation.z;
            } else if (button == 2 || button == 1) {
            }

            var msg_pos = model.position.x + "," + model.position.y + "," + model.position.z;
            var msg_rot =
                $.orgFloor(model.rotation.x, 100) + "," + $.orgFloor(model.rotation.y, 100) + "," + $.orgFloor(model.rotation.z, 100);
            var msg_scale = $.orgFloor(model.scale.x, 100) + "," + $.orgFloor(model.scale.y, 100) + "," + $.orgFloor(model.scale.z, 100);

            var msg = 'pos="' + msg_pos + '" rot="' + msg_rot + '" scale="' + msg_scale + '" ';
            j_debug_msg.find("input").val(msg);

            mousedown = false;
        }

        ///マウスホイール
        renderer.domElement.addEventListener("mousewheel", evt_mousewheel, false);
        renderer.domElement.addEventListener("mousedown", evt_mousedown, false);
        renderer.domElement.addEventListener("mouseup", evt_mouseup, false);
        renderer.domElement.addEventListener("mousemove", evt_mousemove, false);

        //デバッグ終了ボタンを押すと、nextOrderする。
        //リロードボタンの配置
        //メッセージエリア非表示。

        var j_close_button = $(
            "<div class='area_three_debug' style='position:absolute;z-index:9999999999;padding:10px;opacity:0.8;background-color:white;left:0px;top:0px'><button style='cursor:pointer'><span style=''>" +
                pm.button_text +
                "</span></button></div>",
        );
        j_close_button.draggable({
            scroll: false,
            //containment:".tyrano_base",
            stop: (e, ui) => {},
        });

        var j_debug_msg = $("<div style='padding:5px'><input type='text' style='width:320px' /></div>");
        var j_copy_button = $("<input type='button' value='コピー' />");

        j_copy_button.on("click", (e) => {
            evt_mouseup();

            j_debug_msg.find("input").select();
            // コピー
            document.execCommand("copy");
        });

        var j_reset_button = $("<input type='button' value='リセット' />");
        j_reset_button.on("click", (e) => {
            //モデルを最初の位置に戻す
            //document.execCommand("copy");
            model.position.set(original_v.pos.x, original_v.pos.y, original_v.pos.z);
            model.rotation.set(original_v.rot.x, original_v.rot.y, original_v.rot.z);
            model.scale.set(original_v.scale.x, original_v.scale.y, original_v.scale.z);
        });

        j_close_button.find("button").on("click", (e) => {
            j_close_button.remove();

            j_canvas.css("z-index", old_canvas_zindex);
            target_layer.css("z-index", old_target_layer_zindex);

            renderer.domElement.removeEventListener("mousedown", evt_mousedown);
            renderer.domElement.removeEventListener("mouseup", evt_mouseup);
            renderer.domElement.removeEventListener("mousemove", evt_mousemove);
            renderer.domElement.removeEventListener("mousewheel", evt_mousewheel);

            this.kag.ftag.nextOrder();
        });

        if (pm.menu == "true") {
            j_close_button.append("<span style='font-size:10px'>｜</span>");
            j_close_button.append(j_copy_button);
            j_close_button.append(j_reset_button);
            j_close_button.append(j_debug_msg);
        }

        $("body").append(j_close_button);
    },
};

/*
#[3d_motion]

:group
3D関連

:title
モーション変更

:exp
3Dモデルのモーションを変更できます。

:sample

;モデルの定義。最初はRunningというモーションで表示。
[3d_model_new name="Robot" storage="Robot.glb" pos="0,0,0" scale="2" motion="Running" ]
[3d_show name="Robot" rot="0.28,0.67,0" pos="-129,-24,910" scale="9.68" ]

モーションを変更します。[p]

[3d_motion name="Robot" motion="Punch"]

:param
name   = 3Dオブジェクトの`name`を指定します。,
motion = モーション名を指定します。

#[end]
*/

tyrano.plugin.kag.tag["3d_motion"] = {
    vital: ["name", "motion"],

    pm: {
        name: "",
        motion: "",
    },

    start: function (pm) {
        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        var three = this.kag.tmp.three;

        this.kag.tmp.three.models[pm.name].setMotion(pm.motion);

        this.kag.ftag.nextOrder();
    },
};

/*
#[3d_debug]

:group
3D関連

:title
3Dデバッグ

:exp
3Dシーンのオブジェクトをマウスでドラッグアンドドロップしながら、調整できます。
デバッグを終了する場合は画面左上のボタンを押します。

<b>★マウス操作</b>
左クリック：カメラの回転`rot`
右クリック：カメラの位置`pos`
中央クリック：ポジションの`z`軸
スクロール：拡大縮小`scale`

:sample
[3d_model_new name="Robot" storage="Robot.glb" ]
[3d_show name="Robot" rot="0.28,0.67,0" pos="-129,-24,910" scale="9.68" ]

モーションを変更します。[p]

[3d_debug name="Robot" ]

:param
name        = デバッグする3Dオブジェクトのnameを指定します。,
button_text = デバッグ終了ボタンのテキストを自由に設定できます。,
menu        = デバッグのメニューを表示するかどうか。`false`を指定すると終了ボタンのみになります。,
overlap     = `true`または`false`。`true`を指定すると、モデルが最前面に表示されます。モデルがメニューに隠れてしまう場合はここを`true`にしてください。,
reset       = `true`または`false`。`true`を指定すると、デバッグ終了後にモデルの状態がデバッグ前に戻ります。

#[end]
*/

tyrano.plugin.kag.tag["3d_debug"] = {
    vital: ["name"],

    pm: {
        name: "",
        button_text: "3Dインスペクタを閉じる",
        menu: "true",
        overlap: "false",
        reset: "false",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;

        //一番前にもってきて、うごかせるようにする。
        var j_canvas = three.j_canvas;
        var target_layer = three.target_layer;

        var old_target_layer_zindex = target_layer.css("z-index");
        var old_canvas_zindex = j_canvas.css("z-index");

        /*
        j_canvas.css("z-index",9999999);
        target_layer.css("z-index",9999999);
        */

        var model_obj = this.kag.tmp.three.models[pm.name];
        var model = model_obj.model;

        var renderer = three.renderer;
        var camera = three.camera;

        var sc_width = parseInt(this.kag.config.scWidth);
        var sc_height = parseInt(this.kag.config.scHeight);

        // オブジェクトの回転
        var prevPosition = {};
        var mousedown = false;
        var button = 0;

        //オブジェクトの移動
        var vec = new THREE.Vector3(); // create once and reuse
        var pos = new THREE.Vector3(); // create once and reuse

        var original_pos = new THREE.Vector3(); // create once and reuse

        var hen_pos = {
            x: 0,
            y: 0,
            z: 0,
        };

        var original_v = $.setVector(model);

        var first_client_y = 0;
        var first_model_z = 0;

        function evt_mousewheel(e) {
            var delta = e.wheelDelta;

            if (delta < 0) {
                model.scale.x -= model.scale.x * 0.01;
                model.scale.y -= model.scale.y * 0.01;
                model.scale.z -= model.scale.z * 0.01;
            } else {
                model.scale.x += model.scale.x * 0.01;
                model.scale.y += model.scale.y * 0.01;
                model.scale.z += model.scale.z * 0.01;
            }

            evt_mouseup();

            e.preventDefault();
        }

        function evt_mousedown(e) {
            if (e.button == 0) {
                button = 0;
            } else if (e.button == 1) {
                //target.innerHTML = "中ボタンが押されました。";
                button = 1;
                first_client_y = e.clientY;
                first_model_z = model.position.z;
            } else if (e.button == 2) {
                button = 2;

                vec.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5);

                vec.unproject(camera);

                vec.sub(camera.position).normalize();

                var distance = 0;

                if (camera.position.z > 0) {
                    distance = -camera.position.z / vec.z;
                } else {
                    distance = camera.position.z / vec.z;
                }

                original_pos.copy(camera.position).add(vec.multiplyScalar(distance));

                hen_pos.x = model.position.x - original_pos.x;
                hen_pos.y = model.position.y - original_pos.y;
            }

            mousedown = true;
            prevPosition = { x: e.clientX, y: e.clientY };
        }

        function evt_mousemove(e) {
            if (!mousedown) return;

            j_close_button.hide();

            if (button == 0) {
                let moveDistance = {
                    x: prevPosition.x - e.clientX,
                    y: prevPosition.y - e.clientY,
                };
                model.rotation.x += moveDistance.y * 0.01;
                model.rotation.y -= moveDistance.x * 0.01;
                prevPosition = { x: e.clientX, y: e.clientY };
            } else if (button == 1) {
                var hen_y = first_client_y - e.clientY;
                model.position.z = first_model_z + hen_y;
            } else if (button == 2) {
                vec.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5);

                vec.unproject(camera);

                vec.sub(camera.position).normalize();

                var distance = 0;

                if (camera.position.z > 0) {
                    distance = -camera.position.z / vec.z;
                } else {
                    distance = camera.position.z / vec.z;
                }

                pos.copy(camera.position).add(vec.multiplyScalar(distance));

                model.position.x = $.orgFloor(hen_pos.x + pos.x, 1);
                model.position.y = $.orgFloor(hen_pos.y + pos.y, 1);
            }
        }

        function evt_mouseup(e) {
            j_close_button.show();

            if (button == 0) {
                var str = $.orgFloor(model.rotation.x, 100) + "," + $.orgFloor(model.rotation.y, 100) + "," + model.rotation.z;
            } else if (button == 2 || button == 1) {
            }

            var msg_pos = model.position.x + "," + model.position.y + "," + model.position.z;
            var msg_rot =
                $.orgFloor(model.rotation.x, 100) + "," + $.orgFloor(model.rotation.y, 100) + "," + $.orgFloor(model.rotation.z, 100);
            var msg_scale = $.orgFloor(model.scale.x, 100) + "," + $.orgFloor(model.scale.y, 100) + "," + $.orgFloor(model.scale.z, 100);

            //pmを更新する
            var _pm = model_obj["pm"];
            _pm["pos"] = msg_pos;
            _pm["rot"] = msg_rot;
            _pm["scale"] = msg_scale;
            model_obj["pm"] = _pm;

            var msg = 'pos="' + msg_pos + '" rot="' + msg_rot + '" scale="' + msg_scale + '" ';
            j_debug_msg.find("input").val(msg);

            mousedown = false;
        }

        if (pm.overlap == "true") {
            j_canvas.css("z-index", 9999999);
            target_layer.css("z-index", 9999999);
        }

        //デバッグ用のレイヤ
        var j_three_debug_layer = $("<div style='width:100%;height:100%;position:absolute;z-index:9999999;'></div>");
        $(".tyrano_base").append(j_three_debug_layer);
        var three_debug_layer = j_three_debug_layer.get(0);

        ///マウスホイール
        three_debug_layer.addEventListener("mousewheel", evt_mousewheel, false);
        three_debug_layer.addEventListener("mousedown", evt_mousedown, false);
        three_debug_layer.addEventListener("mouseup", evt_mouseup, false);
        three_debug_layer.addEventListener("mousemove", evt_mousemove, false);

        //デバッグ終了ボタンを押すと、nextOrderする。
        //リロードボタンの配置
        //メッセージエリア非表示。

        var j_close_button = $(
            "<div class='area_three_debug' style='position:absolute;z-index:9999999999;padding:10px;opacity:0.8;background-color:white;left:0px;top:0px'><button style='cursor:pointer'><span style=''>" +
                pm.button_text +
                "</span></button></div>",
        );
        j_close_button.draggable({
            scroll: false,
            //containment:".tyrano_base",
            stop: (e, ui) => {},
        });

        var j_debug_msg = $("<div style='padding:5px'><input type='text' style='width:320px' /></div>");
        var j_copy_button = $("<input type='button' value='コピー' />");

        j_copy_button.on("click", (e) => {
            evt_mouseup();

            j_debug_msg.find("input").select();
            // コピー
            document.execCommand("copy");
        });

        var j_reset_button = $("<input type='button' value='リセット' />");
        j_reset_button.on("click", (e) => {
            //モデルを最初の位置に戻す
            //document.execCommand("copy");
            model.position.set(original_v.pos.x, original_v.pos.y, original_v.pos.z);
            model.rotation.set(original_v.rot.x, original_v.rot.y, original_v.rot.z);
            model.scale.set(original_v.scale.x, original_v.scale.y, original_v.scale.z);
        });

        j_close_button.find("button").on("click", (e) => {
            j_three_debug_layer.remove();

            if (pm.reset == "true") {
                j_reset_button.trigger("click");
            }

            j_close_button.remove();

            j_canvas.css("z-index", old_canvas_zindex);
            target_layer.css("z-index", old_target_layer_zindex);

            three_debug_layer.removeEventListener("mousedown", evt_mousedown);
            three_debug_layer.removeEventListener("mouseup", evt_mouseup);
            three_debug_layer.removeEventListener("mousemove", evt_mousemove);
            three_debug_layer.removeEventListener("mousewheel", evt_mousewheel);

            this.kag.ftag.nextOrder();
        });

        if (pm.menu == "true") {
            j_close_button.append("<span>｜</span>");
            j_close_button.append(j_copy_button);
            j_close_button.append(j_reset_button);

            j_close_button.append(j_debug_msg);
        }

        $("body").append(j_close_button);

        //初期値を設定する。
        evt_mouseup();
    },
};
