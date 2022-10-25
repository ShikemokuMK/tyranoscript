$.makeHash = function (num) {
    // 生成する文字列の長さ
    var l = num;
    // 生成する文字列に含める文字セット
    var c = "abcdefghijklmnopqrstuvwxyz0123456789";
    var cl = c.length;
    var r = "";
    for (var i = 0; i < l; i++) {
        r += c[Math.floor(Math.random() * cl)];
    }

    return r;
};

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
    //console.log(name);
    //console.log(TYRANO.kag.tmp.three.models);

    if (TYRANO.kag.tmp.three.models[name]) {
        return true;
    } else {
        return false;
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
このタグを通過時、ゲーム内に3Dを表示するためのシーンが追加されます。
また、タグを配置していないと3d_xxx で始まるタグを使用できません。

3D機能を使用する直前に宣言するようにしましょう。
また3D機能の仕様が終わった段階で[3d_close]を行いましょう。

:sample
[3d_init layer=0 ]

:param
layer=3Dモデルを配置するレイヤを指定できます。,
camera=カメラのモードを指定できます。「Perspective」（遠近感あり）「Orthographic」（遠近感なしの平行投影）デフォルトはPerspective,
near=カメラに近いオブジェクトをどの距離まで描画するかを設定できます。デフォルトは１,
far=カメラから遠いオブジェクトを表示する距離を設定できます。大きすぎると不必要に遠くまで描画するため処理が重くなります。可能な限り小さい値に調整しましょう。デフォルトは5000,
debug_option=自分のいるポジション座標を画面に表示するか否か



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

        ambient_light: "1",
        directional_light: "0",

        antialias: "true", //アンチエイリアスの有効、無効化。

        studio: "false", //"studio"が指定されている場合は、開発ツール用の動きをする

        fps30: "false", //フレームレートを半分にする
        stats: "false", // fpsステータスの表示設定
        background: "true", //バックグラウンドでの動作

        debug_pos: "true", // camera,xx,xx

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
            antialias: $.toBoolean(pm.antialias),
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

        //ray の調整
        // camera に Raycaster を作成して下方向に ray を向ける
        var ray = new THREE.Raycaster(camera.position, new THREE.Vector3(0, -1, 0));
        this.kag.tmp.three.ray = ray;

        //アウトライン設定用
        /*
const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass( scene, camera );
composer.addPass(renderPass);
const outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);

outlinePass.edgeStrength = Number(5);
outlinePass.visibleEdgeColor.set("#FFFF00");

composer.addPass(outlinePass);
outlinePass.selectedObjects = [];
*/
        ////////

        //指定のレイヤは表示状態に移行。
        target_layer.show();

        //環境光
        const light_amb = new THREE.AmbientLight(0xffffff, parseFloat(pm.ambient_light));
        scene.add(light_amb);

        //並行方向からの光
        //const light = new THREE.DirectionalLight(0xffffff, parseFloat(pm.directional_light));
        //scene.add(light);

        //オーディオリスナー
        const listener = new THREE.AudioListener();
        camera.add(listener);

        if (pm.studio == "true") {
            this.kag.tmp.three.stat.fps.is_fps_studio = true;
        }

        //デバッグ周り
        if (pm.debug_pos == "true") {
            let j_btn_get_pos = $('<input class="btn_get_pos" type="button" value="カメラポジション" />');
            j_btn_get_pos.on("click", (e) => {
                var three = this.kag.tmp.three;
                var camera = three.camera;

                let str =
                    "position:" +
                    camera.position.x +
                    "," +
                    camera.position.y +
                    "," +
                    camera.position.z +
                    "/rotation:" +
                    camera.rotation.x +
                    "," +
                    camera.rotation.y +
                    "," +
                    camera.rotation.z;

                alert(str);
            });

            $("#debug_studio_area").append(j_btn_get_pos);
        }

        this.kag.tmp.three.stat.is_load = true;
        this.kag.tmp.three.stat.canvas_show = true;
        this.kag.tmp.three.stat.init_pm = pm;

        this.kag.tmp.three.camera = camera;
        this.kag.tmp.three.scene = scene;
        this.kag.tmp.three.renderer = renderer;
        this.kag.tmp.three.light_amb = light_amb;

        /*
this.kag.tmp.three.composer = composer;
this.kag.tmp.three.outlinePass = outlinePass;
*/

        this.kag.tmp.three.audio_listener = listener;

        this.kag.tmp.three.groups = {};
        this.kag.tmp.three.groups["default"] = [];

        this.kag.tmp.three.target_layer = target_layer;
        this.kag.tmp.three.j_canvas = j_canvas;

        var three = this.kag.tmp.three;

        var t = Math.random();

        let cnt_frame = false;
        let fps30 = false;
        let fps_stats = false;

        if (pm.fps30 == "true") {
            fps30 = true;
        }

        if (pm.stats == "true") {
            var stats = new Stats();
            stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild(stats.dom);
            three.stats = stats;
            fps_stats = true;
        }

        tick();

        //毎フレーム時に実行されるループイベントです
        function tick() {
            if (three.stat.animation_loop == false) {
                return;
            }

            if (fps30 == true) {
                if (cnt_frame == true) {
                    cnt_frame = false;
                    var req_id = requestAnimationFrame(tick);
                    return;
                }

                cnt_frame = true;
            }

            if (fps_stats == true) {
                three.stats.begin();
            }

            if (three.orbit_controls) {
                three.orbit_controls.update();
            }

            that.updateFrame();

            renderer.render(scene, camera); // レンダリング

            //composer.render();

            if (fps_stats == true) {
                three.stats.end();
            }

            var req_id = requestAnimationFrame(tick);

            if (three.stat.is_load == false) {
                window.cancelAnimationFrame(req_id);
            }
        }

        if (pm.background == "false") {
            //バックグランドに移動したときの動き
            window.addEventListener(
                "focus",
                () => {
                    three.stat.animation_loop = false;

                    setTimeout(() => {
                        three.stat.animation_loop = true;
                        requestAnimationFrame(tick);
                    }, 100);
                },
                false,
            );

            window.addEventListener(
                "blur",
                () => {
                    three.stat.animation_loop = false;
                },
                false,
            );

            window.addEventListener("visibilitychange", () => {
                if (document.visibilityState == "hidden") {
                    three.stat.animation_loop = false;
                } else {
                    three.stat.animation_loop = true;

                    requestAnimationFrame(tick);
                }
            });
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

        //カーソルが重なったときの判定
        j_canvas.on("mousemove", function (event, data) {
            if (typeof data != "undefined") {
                event = data;
            }

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
            var name = "";
            var uuid = "";

            var distance = -1;

            if (intersects.length > 0) {
                for (key in intersects) {

                    //先にuuidで判定する。
                    if (typeof intersects[key].object.userData["mode"] != "undefined") {
                        name = "evt_" + intersects[key].object.uuid;
                        distance = intersects[key].distance;
                        break;
                    }
                    else if (typeof intersects[key].object.userData["name"] != "undefined") {
                        name = intersects[key].object.userData["name"];
                        distance = intersects[key].distance;
                        break;
                    }



                }

                if (that.kag.stat.is_strong_stop == true) {
                    if (three.evt[name]) {

                        if (three.stat.start_event == false) {
                            return;
                        }

                        //床が定義されていて、今いる場所がその上の場合、発動する
                        //console.log(three.evt[name]);
                        if (three.evt[name]["ground"] != "") {
                            //console.log(three.stat.fps.ground);

                            if (three.evt[name]["ground"] != three.stat.fps.ground) {
                                return;
                            }
                        }

                        let mode = three.evt[name]["mode"];
                        if (mode != "click") {
                            return;
                        }

                        //距離が指定されている場合
                        if (three.evt[name]["distance"] != "") {
                            let pm_distance = parseFloat(three.evt[name]["distance"]);

                            if (pm_distance < distance) {
                                return;
                            }
                        }

                        //カーソルを変更する。
                        $("body").css("cursor", "pointer");

                        return;
                    }
                } else {
                    //console.log("none");
                }

                $("body").css("cursor", "default");
            }
        });

        j_canvas.on("click", function (event, data) {
            console.log("click");

            if (typeof data != "undefined") {
                event = data;
            }

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
            var name = "";

            var distance = -1;

            console.log(intersects);

            if (intersects.length > 0) {

                for (key in intersects) {

                    if (typeof intersects[key].object.userData["name"] != "undefined") {
                        name = intersects[key].object.userData["name"];
                        distance = intersects[key].distance;

                        if (three.evt[name]) break;

                    }

                    if (typeof intersects[key].object.uuid != "undefined") {
                        name = "evt_" + intersects[key].object.uuid;
                        distance = intersects[key].distance;

                        if (three.evt[name]) break;

                    }

                }

                //カメラを選択できるぞ。
                /*
if (name == "") {
if ($(".area_three_debug_object").get(0)) {
TYRANO.kag.studio.selectCamera("camera", that.kag.tmp.three.models["camera"]);
}
return;
}
*/

                if (three.stat.fps.is_fps_studio == true) {
                    //カメラを移動させたあとの場合は、反応させない
                    if (three.stat.start_event == false) {
                        return;
                    }

                    if (name == "") {
                        that.kag.cancelWeakStop();
                        that.kag.ftag.startTag("jump", three.evt[name]);
                        return;
                    }

                    console.log("select!");
                    console.log(name);

                    //nameが選択されたことを上位階層に通知
                    var model_obj = that.kag.tmp.three.models[name];

                    //選択されないオブジェクトの場合はリターンする
                    if (typeof model_obj.pm["_selectable"] != "undefined") {
                        if (model_obj.pm["_selectable"] == "false") {
                            /*
if ($(".area_three_debug_object").get(0)) {
TYRANO.kag.studio.selectCamera("camera", that.kag.tmp.three.models["camera"]);
}
*/

                            return;
                        }
                    }

                    TYRANO.kag.studio.selectObject(name, model_obj);

                    return;
                }

                if (that.kag.stat.is_strong_stop == true) {
                    if (three.evt[name]) {
                        if (three.stat.start_event == false) {
                            return;
                        }

                        //床が定義されていて、今いる場所がその上の場合、発動する
                        //console.log(three.evt[name]);
                        if (three.evt[name]["ground"] != "") {
                            //console.log(three.stat.fps.ground);

                            if (three.evt[name]["ground"] != three.stat.fps.ground) {
                                return;
                            }
                        }

                        let mode = three.evt[name]["mode"];
                        if (mode != "click") {
                            return;
                        }

                        //距離が指定されている場合
                        if (three.evt[name]["distance"] != "") {
                            let pm_distance = parseFloat(three.evt[name]["distance"]);

                            if (pm_distance < distance) {
                                return;
                            }
                        }

                        let type = three.evt[name]["type"];

                        if (type == "jump") {
                            that.kag.layer.showEventLayer();
                            that.kag.ftag.startTag("jump", three.evt[name]);
                            return;
                        } else if (type == "eval") {
                            eval(three.evt[name]["exp"]);
                            return;
                        }
                    }
                } else {
                    //console.log("none");
                }
            }

            //オブジェクトがデバッグ中で、何もないところが選択されたら
            //カメラの移動に切り替える
            //デバッグ中かつ、
            if (name == "" || intersects.length == 0) {
                if ($(".area_three_debug_object").get(0)) {
                    TYRANO.kag.studio.selectCamera("camera", that.kag.tmp.three.models["camera"]);
                }
            }
        });
    },

    checkJoyStick: function (fps) {
        let joy = fps.joy;

        if (typeof window.app == "undefined" || typeof joy == "undefined") {
            return;
        }

        let dir = joy.GetDir();

        if (dir == "N" || dir == "NE" || dir == "NW") {
            fps.moveForward = true;
            app.startWalk();
        } else {
            fps.moveForward = false;
        }

        if (dir == "S" || dir == "SE" || dir == "SW") {
            fps.moveBackward = true;
        } else {
            fps.moveBackward = false;
        }

        if (dir == "NW" || dir == "W" || dir == "SW") {
            fps.rotateLeft = true;
        } else {
            fps.rotateLeft = false;
        }

        if (dir == "NE" || dir == "E" || dir == "SE") {
            fps.rotateRight = true;
        } else {
            fps.rotateRight = false;
        }

        if (fps.moveForward || fps.moveBackward || fps.rotateLeft || fps.rotateRight) {
            app.startWalk();
        } else {
            app.stopWalk();
        }
    },

    getCollisionObjectID: function (object) {

        if (typeof object.userData["mode"] != "undefined" && object.userData["mode"] == "collision") {
            return "evt_" + object.uuid;
        }

        if (typeof object.userData["name"] != "undefined") {
            return object.userData["name"];
        }

        return "";


    },

    updateFrame: function () {
        var three = this.kag.tmp.three;
        let fps = three.stat.fps;
        let that = this;

        if (fps.isJoy) {
            this.checkJoyStick(fps);
        }

        //対応が必要なフレーム処理をここで実施する。

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

        var actualMoveSpeed = delta * fps.movementSpeed;
        var actualRotateSpeed = delta * fps.rotateSpeed;

        //0.03 回転速度
        var speed_rot = 0.03;

        //FPSの動作設定
        if (fps.active == true) {

            var hitter = new THREE.Vector3(camera.position.x, camera.position.y + 10, camera.position.z);

            var _camera = camera;
            var _hitMargin = 0.5;
            var _hitteHeightOfset = 0;
            var _frontMoveEnabled = true;
            var _backMoveEnabled = true;
            var _leftMoveEnabled = true;
            var _rightMoveEnabled = true;

            var _stop_move = false;

            /*
var hitter = new THREE.Vector3(_camera.position.x, _camera.position.y + 10, _camera.position.z);

var vector = new THREE.Vector3( 0, 0, - 1 );
vector.applyQuaternion(camera.quaternion);
*/

            var collision_event_name = "";

            var dir_zf = new THREE.Vector3(0, 0, 1);
            var ray_zf = new THREE.Raycaster();
            ray_zf.setFromCamera(dir_zf, camera);

            var objs_zf = ray_zf.intersectObjects(three.groups["default"], true);

            //console.log(objs_zf);

            if (objs_zf.length > 0) {
                //console.log("F:",objs_zf[0].object.userData.name);
                if (objs_zf[0].distance < 10 + actualMoveSpeed * 3) {
                    //stop();
                    console.log("zf");
                    camera.position.z += 1;

                    _stop_move = true;

                    //let angle = vector.angleTo(objs_zf[0].object.position);

                    //前方判定でぶつかったとき
                    //if(angle < 1 ){

                    collision_event_name = that.getCollisionObjectID(objs_zf[0].object);

                    //さらに後ろに下げる。
                    //camera.position.z +=15;

                    //}
                }
            }

            // 後方向アタリ判定z
            var dir_zb = new THREE.Vector3(0, 0, 1);
            dir_zb.applyQuaternion(camera.quaternion);

            var ray_zb = new THREE.Raycaster(hitter, dir_zb);
            //ray_zb.setFromCamera(dir_zb, camera);

            var objs_zb = ray_zb.intersectObjects(three.groups["default"], true);

            if (objs_zb.length > 0) {
                //console.log("B:",objs_zb[0]);
                if (objs_zb[0].distance < 10 + actualMoveSpeed * 3) {

                    console.log("zb");
                    console.log(objs_zb[0]);

                    //stop();
                    camera.position.z -= 1;
                    _stop_move = true;

                    //let angle = vector.angleTo(objs_zb[0].object.position);
                    //前方判定でぶつかったとき
                    //if(angle < 1 ){

                    collision_event_name = that.getCollisionObjectID(objs_zb[0].object);

                    /*
console.log(objs_zb[0].object.name);
console.log(camera.rotation.y);
*/
                    //}
                }
            }

            // 左方向アタリ判定
            var dir_xl = new THREE.Vector3(-1, 0, 0);

            //var ray_xl = new THREE.Raycaster(hitter, dir_xl);

            var ray_xl = new THREE.Raycaster();
            ray_xl.setFromCamera(dir_xl, camera);

            var objs_xl = ray_xl.intersectObjects(three.groups["default"], true);

            if (objs_xl.length > 0) {
                //console.log("L:",objs_xl[0].distance);
                if (objs_xl[0].distance < 10 + actualMoveSpeed * 3) {
                    console.log("xl");

                    camera.position.x += 1;
                    _stop_move = true;

                    //let angle = vector.angleTo(objs_xl[0].object.position);
                    //if(angle < 1 ){

                    collision_event_name = that.getCollisionObjectID(objs_xl[0].object);

                    //}
                }
            }

            // 右方向アタリ判定
            var dir_xr = new THREE.Vector3(1, 0, 0);

            //var ray_xr = new THREE.Raycaster(hitter, dir_xr);

            var ray_xr = new THREE.Raycaster();
            ray_xr.setFromCamera(dir_xr, camera);

            var objs_xr = ray_xr.intersectObjects(three.groups["default"], true);

            if (objs_xr.length > 0) {
                //console.log("R:",objs_xr[0].distance);
                if (objs_xr[0].distance < 10 + actualMoveSpeed * 3) {
                    console.log("xr");

                    camera.position.x -= 1;
                    _stop_move = true;

                    var vector = new THREE.Vector3(0, 0, -1);
                    vector.applyQuaternion(camera.quaternion);
                    let angle = vector.angleTo(objs_xr[0].object.position);

                    //前方判定でぶつかったとき
                    //if(angle < 1 ){

                    collision_event_name = that.getCollisionObjectID(objs_xr[0].object);

                    //}
                }
            }

            //コリジョンイベント判定
            if (collision_event_name != "") {

                console.log(three.evt);
                console.log(collision_event_name);

                if (three.evt[collision_event_name]) {
                    let evt_pm = three.evt[collision_event_name];

                    if (evt_pm["mode"] == "collision") {
                        let type = evt_pm["type"];

                        //前に進んでるときだけ反応させる。
                        if (fps.moveForward == true) {
                            //後ろへの移動幅を大きめに。コリジョンのときは
                            camera.position.z += 10;

                            if (type == "jump") {
                                that.kag.layer.showEventLayer();
                                that.kag.ftag.startTag("jump", evt_pm);
                                return;
                            } else if (type == "eval") {
                                eval(evt_pm["exp"]);
                                return;
                            }
                        }
                    }
                }
            }

            if (_stop_move == true) {
                fps.tmpMoveBuffer = 0;

                camera.position.x = fps.memory_pos.x;
                camera.position.y = fps.memory_pos.y;
                camera.position.z = fps.memory_pos.z;

                return;
            } else {
                fps.memory_pos.x = camera.position.x;
                fps.memory_pos.y = camera.position.y;
                fps.memory_pos.z = camera.position.z;
            }

            var ray = new THREE.Raycaster();
            ray.setFromCamera(new THREE.Vector3(0, 0, 0), camera);
            const intersects = ray.intersectObjects(three.groups["default"], true);

            if (intersects.length > 0) {
                var name = intersects[0].object.userData["name"];

                var dist = intersects[0].distance;

                /*
// 例）衝突対象オブジェクトとの距離が 0 になった場合
if( dist <= 6 )
{

//移動処理しない。
if(fps.moveForward){
camera.translateZ( +10 );
}else if(fps.moveBackward){
camera.translateZ( -10 );
}

fps.offMoveBufferF=false;
fps.offMoveBufferB=false;

console.log(dist);

return true;
}
*/
            }

            //下向け
            /*
var ray2 = new THREE.Raycaster(camera.position, new THREE.Vector3(0, -1, 0));
const intersects2 = ray2.intersectObjects(three.groups["default"],true);
*/

            var ray2 = new THREE.Raycaster();
            ray2.setFromCamera(new THREE.Vector3(0, -1, 0), camera);

            const intersects2 = ray2.intersectObjects(three.groups["default"], true);

            if (intersects2.length > 0) {
                var name = intersects2[0].object.userData["name"];

                //特定オブジェクトの上にいないと、発火させない処理。
                fps.ground = name;
            }

            if (fps.moveForward || fps.moveBackward) {
            } else {
                fps.offMoveBufferF = false;
                fps.offMoveBufferB = false;
            }

            if (fps.rotateLeft || fps.rotateRight) {
            } else {
                fps.offRotateBufferL = false;
                fps.offRotateBufferR = false;
            }

            if (fps.rotateLeft || fps.offRotateBufferL) {
                if (fps.moveForward) {
                    camera.translateX(-actualMoveSpeed);
                    //actualMoveSpeed = actualMoveSpeed / 1.6;
                } else if (fps.moveBackward) {
                    camera.translateX(-actualMoveSpeed);
                    //actualMoveSpeed = actualMoveSpeed / 1.6;
                } else {
                    camera.translateX(-actualMoveSpeed);
                }

                //camera.rotation.y += actualRotateSpeed;
            }

            if (fps.rotateRight || fps.offRotateBufferR) {
                if (fps.moveForward) {
                    camera.translateX(+actualMoveSpeed);
                    //actualMoveSpeed = actualMoveSpeed / 1.6;
                } else if (fps.moveBackward) {
                    camera.translateX(+actualMoveSpeed);
                    //actualMoveSpeed = actualMoveSpeed / 1.6;
                } else {
                    camera.translateX(+actualMoveSpeed);
                }

                //camera.rotation.y -= actualRotateSpeed;
            }

            if (fps.moveForward || fps.offMoveBufferF) {
                camera.translateZ(-actualMoveSpeed);
            }

            if (fps.moveBackward || fps.offMoveBufferB) {
                camera.translateZ(actualMoveSpeed);
            }

            //視点の高さ。固定
            camera.position.y = fps.camera_pos_y;
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
外部ファイル形式の3Dモデルを読み込んで定義します。
実行時はゲーム画面には表示されません。表示するには[3d_show ]が必要です。
3Dモデルファイルは data/others/3d/modelフォルダに配置します。

:sample
[3d_init layer=0]

[3d_model_new name="mymodel" storage="mymodel/scene.gltf" ]
[3d_show name="mymodel" pos="100,20,20" rot="1,1,1" scale=10 ] 

:param
name=3Dオブジェクトの名前です。この名前をつかって表示・非表示などの制御を行います。,
storage=3Dファイルを指定します。gltf obj json 形式に対応します。ファイルはothers/3d/modelフォルダに配置してください。,
pos=3Dオブジェクトを配置する座標を指定します。半角のカンマで区切ってxyz座標を表します。 ,
rot=3Dオブジェクトの傾きを指定します。半角カンマで区切ってxyz軸の回転を設定します。,
scale=3Dオブジェクトの拡大率を指定します。半角カンマで区切ってxyz軸の拡大率を指定します。,
tonemap=トーンマッピングが有効な場合、このオブジェクトが影響を受けるか否かを設定できます。デフォルトはtrue。無効にする場合はfalseを指定してください。,
motion=ファイルにモーションが存在する場合、モーション名を指定することができます。指定がない場合は１つめのモーションファイルが自動的に適応されます。,
folder=ファイルの配置フォルダを変更できます。




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

        update: "",

    },

    start: function (pm) {
        var three = this.kag.tmp.three;

        var folder = "";

        if (pm.folder != "") {
            folder = pm.folder;
        } else {
            folder = "others/3d/model";
        }

        var storage_url = "";

        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        } else {
            storage_url = "./data/" + folder + "/" + pm.storage;
        }

        var ext = $.getExt(pm.storage);

        if (ext == "gltf" || ext == "glb") {

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
                    { name: pm.name, model: model, mixer: mixer, gltf: gltf, pm: pm },
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

            var obj_url = storage_url;
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
        } else if (ext == "json") {

            function toBase64Url(url, callback) {

                return new Promise(resolve => {
                    var xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        var reader = new FileReader();
                        reader.onloadend = function () {
                            //callback(reader.result);

                            resolve(reader.result);

                        }
                        reader.readAsDataURL(xhr.response);
                    };
                    xhr.open('GET', url);
                    xhr.responseType = 'blob';
                    xhr.send();
                });

            }

            function setEvent(object) {

                if (object.userData) {

                    if (typeof object.userData.mode != "undefined") {
                        three.evt["evt_" + object.uuid] = object.userData;
                    }

                }

                if (object.children) {

                    const objects = object.children;

                    for (let i = 0; i < objects.length; i++) {

                        setEvent(objects[i]);

                    }
                }


            }

            var obj_url = storage_url;
            var objLoader = new THREE.ObjectLoader();

            $.loadText(obj_url, async (json) => {

                console.log("json======");
                console.log(json);

                if (pm.update != "") {

                    console.log("update =============== ");
                    console.log(pm.update);

                    const json_update = JSON.parse(pm.update);
                    const texture_update = json_update.texture || {};
                    const visible_update = json_update.visible || {};

                    const object = json.object;

                    //materialを探す
                    const materials = json.materials;
                    const textures = json.textures;
                    const images = json.images;

                    async function set_texture_update(object) {

                        //visible設定
                        if (typeof visible_update[object.name] != "undefined" && visible_update[object.name] == false) {
                            object.visible = false;
                        }

                        if (object.material) {

                            for (let i = 0; i < materials.length; i++) {

                                const material = materials[i];
                                const mat_uuid = material.uuid;

                                if (!material.map) continue;

                                const map = material.map;

                                if (object.material == mat_uuid) {

                                    const obj_name = object.name;

                                    for (let j = 0; j < textures.length; j++) {
                                        const texture = textures[j];
                                        if (map == texture.uuid) {

                                            const _image = texture.image;

                                            for (let k = 0; k < images.length; k++) {
                                                const image = images[k];
                                                if (_image == image.uuid) {
                                                    images[k].name = obj_name;
                                                }
                                            }
                                        }

                                    }
                                }

                            }

                            for (let i = 0; i < images.length; i++) {

                                const image = images[i];
                                var data64 = "";

                                if (texture_update[image.name]) {

                                    const obj = texture_update[image.name];

                                    if (obj["image"]) {
                                        data64 = await toBase64Url(obj.image);
                                        image.url = data64;
                                    }

                                    //リピート回数
                                    if (obj.repeat_x && obj.repeat_y) {

                                        //textures を　ループ
                                        for (let j = 0; j < textures.length; j++) {
                                            const texture = textures[j];
                                            if (image.uuid == texture.image) {

                                                texture.repeat = [parseInt(obj.repeat_x), parseInt(obj.repeat_y)];

                                            }

                                        }

                                    }

                                }

                            }

                        }

                        if (object.children) {

                            const objects = object.children;

                            console.log("wwwwwwwwwwwwww objects");
                            console.log(objects);

                            for (let i = 0; i < objects.length; i++) {

                                await set_texture_update(objects[i]);

                            }
                        }

                    }

                    await set_texture_update(object);



                }

                //ユーザーデータの取得これをつかって、ティラノ系のイベントを操作できないかしら。
                const object = json.object;
                console.log(object);
                setEvent(object);



                objLoader.parse(
                    json,

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

                        /*
                    if (pm.tonemap == "true") {
                    this.kag.tmp.three.models[pm.name].setToneMaped(true);
                    } else {
                    this.kag.tmp.three.models[pm.name].setToneMaped(false);
                    }
                    */

                        if (pm.next == "true") {
                            this.kag.ftag.nextOrder();
                        }
                    },

                    // onProgress callback
                    (xhr) => {
                        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
                    },

                    // onError callback
                    (err) => {
                        console.error("An error happened");
                    },
                );
            });
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
球体の3Dモデルを定義します

:sample

[3d_sphere_new name="tama" ]
[3d_show name=tama pos="365,145,0" rot="0.92,-4.3,0" scale="0.77,0.77,0.77" time=2000]

:param
name=3Dオブジェクトの名前です。この名前をつかって表示・非表示などの制御を行います。,
texture=球体にテクスチャを貼ることができます。画像は「others/3d/texture」以下に配置してください。サイズは256x256 や 512x512 といったサイズを推奨します。,
color=色を指定できます。0xRRGGBB 形式で指定します。,
pos=3Dオブジェクトを配置する座標を指定します。半角のカンマで区切ってxyz座標を表します。 ,
rot=3Dオブジェクトの傾きを指定します。半角カンマで区切ってxyz軸の回転を設定します。,
scale=3Dオブジェクトの拡大率を指定します。半角カンマで区切ってxyz軸の拡大率を指定します。,

radius=球体の半径を指定します。デフォルトは300,
width=球体の横幅を指定します。デフォルトは30,
height=球体の高さを指定します。デフォルトは30,

side=テクスチャをどの面に適応するかを指定できます。front(前面) back（背面）double（両面）。デフォルトはfront,

tonemap=トーンマッピングが有効な場合、このオブジェクトが影響を受けるか否かを設定できます。デフォルトはtrue。無効にする場合はfalseを指定してください。




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

        side: "front",

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
name=3Dオブジェクトの名前です。この名前をつかって表示・非表示などの制御を行います。,
storage=表示する画像ファイルを指定します。ファイルは「othres/3d/sprite」フォルダ以下に配置してください。,
pos=3Dオブジェクトを配置する座標を指定します。半角のカンマで区切ってxyz座標を表します。 ,
rot=3Dオブジェクトの傾きを指定します。半角カンマで区切ってxyz軸の回転を設定します。,
scale=3Dオブジェクトの拡大率を指定します。半角カンマで区切ってxyz軸の拡大率を指定します。,
tonemap=トーンマッピングが有効な場合、このオブジェクトが影響を受けるか否かを設定できます。デフォルトはfalse。有効にする場合はtrueを指定してください。,
folder=ファイルの配置フォルダを変更できます。



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

        var storage_url = "";

        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        } else {
            storage_url = "./data/" + folder + "/" + pm.storage;
        }

        // マテリアルを作成する
        const material = new THREE.SpriteMaterial({
            map: new THREE.TextureLoader().load(storage_url),
            alphaTest: 0.5,
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

                    //ロードからの呼び出しの場合はこちら。

                    if (pm._load) {
                        model.scale.set(scale.x, scale.y, scale.z);
                    } else {
                        model.scale.set(parseInt(width) * scale.x, parseInt(height) * scale.y, 1);
                    }
                }

                var three = this.kag.tmp.three;
                var scene = three.scene;

                this.kag.tmp.three.models[pm.name] = new ThreeModel({ name: pm.name, model: model, pm: pm }, three);

                if (pm.next == "true") {
                    this.kag.ftag.nextOrder();
                }

                if (typeof pm.callback == "function") {
                    pm.callback();
                }
            })
            .on("error", (e) => {
                console.log(e);
                if (pm.next == "true") {
                    this.kag.ftag.nextOrder();
                }
                return false;
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
3Dシーン上のオブジェクトがクリックされたときに、イベントを発火させることができます。
イベントは[s]タグに到達していないと発火しません。
また、一度イベントが発火すると自動的に全イベントが無効化されます（イベント定義自体は残っている）
再度イベントを発生させたい場合は[3d_event_start]を通過する必要があります。 

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
name=3Dオブジェクトの名前です。イベントを発生させる3Dオブジェクトのnameを指定してください。,
storage=移動するシナリオファイル名を指定します。省略された場合は現在のシナリオファイルと見なされます,
target=ジャンプ先のラベル名を指定します。省略すると先頭から実行されます,
type=jump or eval を指定する。デフォルトはjump。evalを指定した場合はexpパラメーターに指定したjsが実行される。,
exp=typeにevalを指定した場合に実行されるjsを記述します。,
distance=クリック時にイベントが発生する距離を指定できます。この指定より遠くにあるオブジェクトは反応しません,
ground=FPSモードの際に自分が特定のオブジェクトの上にいるときだけ発火させることができます。ここで指定したnameのオブジェクト上にいるときだけイベントが発火。,
mode=click or collision を指定します。fpsの場合にクリックで発火するか、collisionで発火するかを選択できます。デフォルトはclick。

#[end]
*/

tyrano.plugin.kag.tag["3d_event"] = {
    vital: ["name"],

    pm: {
        name: "",
        type: "jump", //eval →jsの実行。
        exp: "",
        storage: "",
        target: "",

        distance: "",
        ground: "", //fpsのときに、この

        mode: "click", //click or collision とか fpsの場合は衝突の時のイベント
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
name=3Dオブジェクトの名前です。イベントを削除する3Dオブジェクトのnameを指定してください。



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
イベントが実行された後は必ず全イベントが無効化されるため、このタグで再度受付を開始する必要があります。

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
登録した3Dイベントを停止します。
[3d_event_start]で再開できます。
登録したイベント自体は消えません。

:sample

:param



#[end]
*/

//イベントを停止する
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
name=3Dオブジェクトの名前です。この名前をつかって表示・非表示などの制御を行います。,
texture=表示する画像ファイルを指定します。ファイルは「othres/3d/texture」フォルダ以下に配置してください。１つのテクスチャの場合はすべての面が同じ画像になりますが、半角カンマで区切って６つ指定するとすべての面に異なるテクスチャを適応することもできます,
color=色を指定できます。0xRRGGBB 形式で指定します。,
width=3Dオブジェクトの横幅を指定します。デフォルトは1です,
height=3Dオブジェクトの高さを指定します。デフォルトは1です,
depth=3Dオブジェクトの深さを指定します。デフォルトは1です,

pos=3Dオブジェクトを配置する座標を指定します。半角のカンマで区切ってxyz座標を表します。 ,
rot=3Dオブジェクトの傾きを指定します。半角カンマで区切ってxyz軸の回転を設定します。,
scale=3Dオブジェクトの拡大率を指定します。半角カンマで区切ってxyz軸の拡大率を指定します。,

tonemap=トーンマッピングが有効な場合、このオブジェクトが影響を受けるか否かを設定できます。デフォルトはfalse。有効にする場合はtrueを指定してください。



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
name=3Dオブジェクトの名前です。この名前をつかって表示・非表示などの制御を行います。,
texture=表示する画像ファイルを指定します。ファイルは「othres/3d/texture」フォルダ以下に配置してください。,
width=3Dオブジェクトの横幅を指定します。デフォルトは1です,
height=3Dオブジェクトの高さを指定します。省略した場合は画像サイズの比率を保った形で表示できます。,

pos=3Dオブジェクトを配置する座標を指定します。半角のカンマで区切ってxyz座標を表します。 ,
rot=3Dオブジェクトの傾きを指定します。半角カンマで区切ってxyz軸の回転を設定します。,
scale=3Dオブジェクトの拡大率を指定します。半角カンマで区切ってxyz軸の拡大率を指定します。,
doubleside=テクスチャを両面に表示させるかを指定します。デフォルトはfalse。trueを指定すると裏面にもテクスチャが表示されます。,
tonemap=トーンマッピングが有効な場合、このオブジェクトが影響を受けるか否かを設定できます。デフォルトはfalse。有効にする場合はtrueを指定してください。



#[end]
*/

//球体をつくる
tyrano.plugin.kag.tag["3d_image_new"] = {
    vital: ["name", "width"],

    pm: {
        name: "",

        type: "PlaneGeometry",

        texture: "",
        texture_repeat: "",

        width: "",
        height: "",

        width_vertical: "", //イメージが縦長の場合に採用する横幅

        width_seg: "1",
        height_seg: "1",

        scale: "1",
        pos: "0",
        rot: "0",

        doubleside: "false",
        tonemap: "false",
    },

    start: function (pm) {
        //heightが省略されている場合は画像のサイズから数値を決める
        if (pm.height == "") {
            var texture_url = "";

            if ($.isHTTP(pm.texture)) {
                texture_url = pm.texture;
            } else {
                texture_url = "./data/others/3d/texture/" + pm.texture;
            }

            $("<img />")
                .attr("src", texture_url)
                .on("load", (e) => {
                    var width = $(e.currentTarget).get(0).width;
                    var height = $(e.currentTarget).get(0).height;

                    var tmp = height / width;

                    //縦長の画像の場合は、もう一つの横幅を採用できる
                    if (parseInt(width) < parseInt(height)) {
                        if (pm.width_vertical != "") {
                            pm.width = pm.width_vertical;
                        }
                    }

                    pm.height = parseInt(parseInt(pm.width) * tmp);

                    pm.arg1 = pm.width;
                    pm.arg2 = pm.height;
                    pm.arg3 = pm.width_seg;
                    pm.arg4 = pm.height_seg;

                    this.kag.ftag.startTag("obj_model_new", pm);
                })
                .on("error", (e) => {
                    console.log(e);
                    this.kag.ftag.nextOrder();
                    return false;
                });
        } else {
            pm.arg1 = pm.width;
            pm.arg2 = pm.height;
            pm.arg3 = pm.width_seg;
            pm.arg4 = pm.height_seg;

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
        texture_repeat: "",

        color: "",

        arg1: 1,
        arg2: 1,
        arg3: 1,
        arg4: 1,

        update: "false",

        scale: "", //100,100,100 //みたいな感じで指定できる。
        pos: "", // 100,40,50
        rot: "",

        side: "",
        doubleside: "false",
        tonemap: "true",

        motion: "",

        opacity: "",

        folder: "",

        next: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;
        var scene = three.scene;

        //var storage_url = "./data/" + folder + "/" + pm.storage;

        if (pm.arg1 == 0) pm.arg1 = 1;
        if (pm.arg2 == 0) pm.arg2 = 1;
        if (pm.arg3 == 0) pm.arg3 = 1;
        if (pm.arg4 == 0) pm.arg4 = 1;

        const geometry = new THREE[pm.type](parseFloat(pm.arg1), parseFloat(pm.arg2), parseFloat(pm.arg3), parseFloat(pm.arg4));

        // 画像を読み込む
        let material;

        if (pm.texture != "") {
            //boxで配列の場合は別処理になる
            if (pm.type == "BoxGeometry" && pm.texture.split(",").length > 1) {
                var arr_texture = pm.texture.split(",");
                var arr_material = [];
                const loader = new THREE.TextureLoader();

                for (let i = 0; i < arr_texture.length; i++) {

                    if (arr_texture[i] == "") {
                        arr_texture[i] = "_system/green.png";
                    }

                    var texture_url = "";
                    if ($.isHTTP(pm.texture)) {
                        texture_url = pm.texture;
                    } else {
                        texture_url = "./data/others/3d/texture/" + arr_texture[i];
                    }

                    const texture = loader.load(texture_url);
                    arr_material.push(
                        new THREE.MeshBasicMaterial({
                            alphaTest: 0.5,
                            transparent: true,
                            map: texture,
                        }),
                    );
                }

                // マテリアルにテクスチャーを設定
                material = arr_material;
            } else {

                var texture_url = "";
                if ($.isHTTP(pm.texture)) {
                    texture_url = pm.texture;
                } else {
                    texture_url = "./data/others/3d/texture/" + pm.texture;
                }

                const loader = new THREE.TextureLoader();
                const texture = loader.load(texture_url);

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                if (pm.texture_repeat != "") {
                    let array_texture = pm.texture_repeat.split(",");
                    texture.repeat.set(parseInt(array_texture[0]), parseInt(array_texture[1]));
                }

                // マテリアルにテクスチャーを設定
                material = new THREE.MeshBasicMaterial({
                    map: texture,
                    alphaTest: 0.5,
                    transparent: true,
                });
            }
        } else {
            material = new THREE.MeshBasicMaterial({
                color: parseInt(pm.color.toLowerCase()),
                alphaTest: 0.5,
                transparent: true,
            });
        }

        if (pm.side != "") {
            if (pm.side == "front") {
                material["side"] = THREE.FrontSide;
            } else if (pm.side == "back") {
                material["side"] = THREE.BackSide;
            } else if (pm.side == "double") {
                material["side"] = THREE.DoubleSide;
            }
        } else if (pm.doubleside == "true") {
            material["side"] = THREE.DoubleSide;
        }

        if (pm.tonemap == "true") {
            material.toneMapped = true;
        } else {
            material.toneMapped = false;
        }

        if (pm.opacity != "") {
            material.opacity = parseFloat(pm.opacity);
        }

        //すでに存在する名前だった場合はアップデート対応。

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

//基本図形 直接タグで実行することはない。
tyrano.plugin.kag.tag["obj_model_mod"] = {
    vital: ["name"],

    pm: {
        name: "",
        jname: "",
        type: "",

        texture: "",
        texture_repeat: "",
        side: "",
        doubleside: "",

        storage: "",

        texture_reload: "true", //テクスチャのデータまるごと置き換え

        scale: "",
        pos: "",
        rot: "",

        width: "",
        height: "",
        depth: "",

        color: "",

        visible: "",

        next: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;
        var scene = three.scene;

        /*
console.log("wwwwwwwwww");
console.log(pm);
*/

        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        let model = this.kag.tmp.three.models[pm.name];

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

        if (pm.jname != "") {
            model.pm.jname = pm.jname;
        }

        let folder = "texture";

        if (pm.storage != "") {
            pm.texture = pm.storage;
            folder = "sprite";
        }

        if (pm.color != "") {
            let material = new THREE.MeshBasicMaterial({
                color: parseInt(pm.color.toLowerCase()),
                alphaTest: 0.5,
                transparent: true,
            });
            model.model.material = material;
            model.pm.color = pm.color;
        }

        if (pm.side != "") {
            model.pm.side = pm.side;

            if (pm.side == "front") {
                model.model.material.side = THREE.FrontSide;
            } else if (pm.side == "back") {
                model.model.material.side = THREE.BackSide;
            } else if (pm.side == "double") {
                model.model.material.side = THREE.DoubleSide;
            }
        } else if (pm.doubleside != "") {
            model.pm.doubleside = pm.doubleside;

            if (pm.doubleside == "true") {
                model.model.material.side = THREE.DoubleSide;
            } else {
                model.model.material.side = THREE.FrontSide;
            }
        }

        if (pm.texture != "") {
            if (model.pm.type == "BoxGeometry" && pm.texture.split(",").length > 1) {
                var arr_texture = pm.texture.split(",");
                var arr_material = [];
                const loader = new THREE.TextureLoader();

                model.pm.texture = pm.texture;
                model.pm.multi = "true";

                for (let i = 0; i < arr_texture.length; i++) {
                    var texture_url = "";
                    if ($.isHTTP(pm.texture)) {
                        texture_url = pm.texture;
                    } else {
                        texture_url = "./data/others/3d/texture/" + arr_texture[i];
                    }

                    const texture = loader.load(texture_url);

                    arr_material.push(
                        new THREE.MeshBasicMaterial({
                            map: texture,
                            alphaTest: 0.5,
                            transparent: true,
                        }),
                    );
                }

                // マテリアルにテクスチャーを設定
                material = arr_material;

                model.model.material = material;
            } else {
                var texture_url = "";

                if ($.isHTTP(pm.texture)) {
                    texture_url = pm.texture;
                } else {
                    texture_url = "./data/others/3d/" + folder + "/" + pm.texture;
                }

                model.pm.texture = pm.texture;
                model.pm.multi = "false";

                $("<img />")
                    .attr("src", texture_url)
                    .on("load", (e) => {
                        var width = $(e.currentTarget).get(0).width;
                        var height = $(e.currentTarget).get(0).height;

                        var tmp = height / width;

                        var scale_y = parseFloat(model.model.scale.x) * tmp;

                        const loader = new THREE.TextureLoader();
                        const texture = loader.load(texture_url);

                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                        if (pm.texture_reload == "false") {
                            //テクスチャのカラーはなくしておく。
                            //model.model.material.color.set(0xffffff);

                            //球体はテクスチャのリピートなし
                            if (model.pm._type != "sphere") {
                                if (pm.texture_repeat != "") {
                                    let array_texture = pm.texture_repeat.split(",");
                                    texture.repeat.set(parseInt(array_texture[0]), parseInt(array_texture[1]));
                                } else {
                                    //texture.repeat.set(parseInt(array_texture[0]), parseInt(array_texture[1]));
                                    let rx = model.model.material.map.repeat.x;
                                    let ry = model.model.material.map.repeat.y;
                                    texture.repeat.set(parseInt(rx), parseInt(ry));
                                }
                            }

                            model.model.material.map = texture;
                        } else {
                            //model.setScale(model.model.scale.x, scale_y, 1);

                            let material = new THREE.MeshBasicMaterial({
                                map: texture,
                                alphaTest: 0.5,
                                transparent: true,
                            });

                            model.model.material = material;
                        }

                        model.needsUpdate();

                        if (pm.next == "true") {
                            this.kag.ftag.nextOrder();
                        }
                    })
                    .on("error", (e) => {
                        console.log(e);

                        if (pm.next == "true") {
                            this.kag.ftag.nextOrder();
                        }

                        return false;
                    });
            }
        } else if (pm.texture_repeat != "") {
            model.pm.texture_repeat = pm.texture_repeat;

            let array_texture = pm.texture_repeat.split(",");
            model.model.material.map.repeat.set(parseInt(array_texture[0]), parseInt(array_texture[1]));

            model.needsUpdate();
        }

        if (pm.visible != "") {
            let flag_visible = false;

            if (pm.visible == "true") {
                flag_visible = true;
            }

            model.setVisible(flag_visible);
        }
    },
};

//基本図形 直接タグで実行することはない。
tyrano.plugin.kag.tag["3d_model_mod"] = {
    vital: ["name"],

    pm: {
        name: "",
        type: "",

        scale: "",
        pos: "",
        rot: "",

        next: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;
        var scene = three.scene;

        /*
console.log("wwwwwwwwww");
console.log(pm);
*/

        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        let model = this.kag.tmp.three.models[pm.name];

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
    },
};

//ビデオプレイ
tyrano.plugin.kag.tag["3d_video_play"] = {
    vital: ["name"],

    pm: {
        name: "",
        texture: "",

        scale: "",
        pos: "",
        rot: "",

        auto: "false",

        next: "true",
    },

    start: function (pm) {

        var three = this.kag.tmp.three;
        var scene = three.scene;

        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        let folder = "texture";

        var texture_url = "";

        if ($.isHTTP(pm.texture)) {
            texture_url = pm.texture;
        } else {
            texture_url = "./data/others/3d/" + folder + "/" + pm.texture;
        }

        let model = this.kag.tmp.three.models[pm.name];

        function stop_video(model) {

            model.video.remove();
            delete model.video;
            const mat = model.old_material;
            model.model.material = mat;
            model.needsUpdate();

        }

        if (model.video) {

            stop_video(model);
            return false;
        }



        const video = $("<video src='" + texture_url + "' />").get(0);

        if (pm.auto == "true") {
            video.muted = true;
            video.autoplay = true;
        }

        setTimeout(function () {

            //$("body").on("click", (e) => {
            //alert("wwwwww");
            video.play();
            //$("body").off("click");
            //});

        }, 300);


        /*
        $("body").on("click", () => {
            video.play();
        });
        */


        video.addEventListener('ended', function () {
            stop_video(model);
        });

        const video_texture = new THREE.VideoTexture(video);

        let material = new THREE.MeshBasicMaterial({
            map: video_texture,
            alphaTest: 0.5,
            transparent: true,
        });

        const old_material = model.model.material;

        model.video = video;
        model.old_material = old_material;
        model.model.material = material;
        model.needsUpdate();

        if (pm.next == "true") {
            this.kag.ftag.nextOrder();
        }

    },
};

//基本図形 直接タグで実行することはない。
tyrano.plugin.kag.tag["3d_sprite_mod"] = {
    vital: ["name"],

    pm: {
        name: "",
        jname: "",
        type: "",

        texture: "",
        texture_repeat: "",

        storage: "",

        texture_reload: "true", //テクスチャのデータまるごと置き換え

        scale: "",
        pos: "",
        rot: "",

        width: "",
        height: "",
        depth: "",

        next: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;
        var scene = three.scene;

        /*
console.log("wwwwwwwwww");
console.log(pm);
*/

        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        let model = this.kag.tmp.three.models[pm.name];

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

        if (pm.jname != "") {
            model.pm.jname = pm.jname;
        }

        let folder = "sprite";

        pm.texture = pm.storage;
        folder = "sprite";

        if (pm.texture != "") {
            var texture_url = "";

            if ($.isHTTP(pm.texture)) {
                texture_url = pm.texture;
            } else {
                texture_url = "./data/others/3d/" + folder + "/" + pm.texture;
            }

            model.pm.texture = pm.texture;
            model.pm.storage = pm.texture;

            $("<img />")
                .attr("src", texture_url)
                .on("load", (e) => {
                    var width = $(e.currentTarget).get(0).width;
                    var height = $(e.currentTarget).get(0).height;

                    var tmp = height / width;

                    var scale_y = parseFloat(model.model.scale.x) * tmp;

                    const loader = new THREE.TextureLoader();
                    const texture = loader.load(texture_url);

                    if (pm.texture_reload == "false") {
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                        if (pm.texture_repeat != "") {
                            let array_texture = pm.texture_repeat.split(",");
                            texture.repeat.set(parseInt(array_texture[0]), parseInt(array_texture[1]));
                        } else {
                            //texture.repeat.set(parseInt(array_texture[0]), parseInt(array_texture[1]));
                            let rx = model.model.material.map.repeat.x;
                            let ry = model.model.material.map.repeat.y;

                            texture.repeat.set(parseInt(rx), parseInt(ry));
                        }

                        model.model.material.map = texture;
                    } else {
                        model.setScale(model.model.scale.x, scale_y, 1);

                        let material = new THREE.SpriteMaterial({
                            map: texture,
                            alphaTest: 0.5,
                            transparent: true,
                        });

                        model.model.material = material;
                    }

                    model.needsUpdate();

                    if (pm.next == "true") {
                        this.kag.ftag.nextOrder();
                    }
                })
                .on("error", (e) => {
                    console.log(e);

                    if (pm.next == "true") {
                        this.kag.ftag.nextOrder();
                    }

                    return false;
                });
        } else if (pm.texture_repeat != "") {
            model.pm.texture_repeat = pm.texture_repeat;

            let array_texture = pm.texture_repeat.split(",");
            model.model.material.map.repeat.set(parseInt(array_texture[0]), parseInt(array_texture[1]));

            model.needsUpdate();
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
name=3Dオブジェクトの名前です。表示させたいオブジェクトのnameを指定してください,
time=表示させるまでの時間をミリ秒で指定します。デフォルトは500,
wait=表示の完了を待つか否か。デフォルトはtrue。,
pos=3Dオブジェクトを配置する座標を指定します。半角のカンマで区切ってxyz座標を表します。 ,
rot=3Dオブジェクトの傾きを指定します。半角カンマで区切ってxyz軸の回転を設定します。,
scale=3Dオブジェクトの拡大率を指定します。半角カンマで区切ってxyz軸の拡大率を指定します。,
group=グループに所属させることができます。グループ名を指定してください,
group_uuid=シーン中でuuidを指定してグループの直下に追加することが可能です,
force_sprite=該当オブジェクトは強制的にスプライトグループに格納されます。,
visible=true or false を指定。初期状態で非表示状態でシーンに追加したい場合はfalseを指定。



#[end]
*/

tyrano.plugin.kag.tag["3d_show"] = {
    vital: ["name"],

    pm: {
        name: "",
        group: "default",
        group_uuid: "",
        time: "500",

        scale: "",
        pos: "",
        rot: "",

        force_sprite: "false",

        wait: "true",

        visible: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;

        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        var model = this.kag.tmp.three.models[pm.name];

        //templateの場合はshowの処理を
        if (model.pm._type === "template") {
            var models = this.kag.tmp.three.models;
            let group_name = model.pm.name;

            //テンプレートの場合は所属しているテンプレートすべてを削除
            for (let key in models) {
                var _model = models[key];

                if (_model.pm.group && _model.pm.group == group_name) {
                    _model.show();
                }
            }
        }

        //グループ追加 fps
        if (model.model.isSprite) {
            pm.group = "sprite";
        } else if (pm.force_sprite == "true") {
            pm.group = "sprite";
        }

        if (!three.groups[pm.group]) {
            three.groups[pm.group] = [];
        }

        three.groups[pm.group].push(model.model);

        //シーン追加
        model.model.name = pm.name;

        if (pm.group_uuid != "") {
            const group_obj = three.scene.getObjectByProperty("uuid", pm.group_uuid);
            group_obj.add(model.model);
        } else {
            three.scene.add(model.model);
        }
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

        if (pm.visible == "true") {
            if (pm.time == "0") {
                console.log(model);
                model.show();
                this.kag.ftag.nextOrder();
            } else {
                if (pm.wait == "true") {
                    model.fade("in", options, () => {
                        this.kag.ftag.nextOrder();
                    });
                } else {
                    model.fade("in", options);
                    this.kag.ftag.nextOrder();
                }
            }
        } else {
            //非表示状態
            model.setVisible(false);
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[3d_clone]
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
name=3Dオブジェクトの名前です。表示させたいオブジェクトのnameを指定してください,
time=表示させるまでの時間をミリ秒で指定します。デフォルトは500,
wait=表示の完了を待つか否か。デフォルトはtrue。,
pos=3Dオブジェクトを配置する座標を指定します。半角のカンマで区切ってxyz座標を表します。 ,
rot=3Dオブジェクトの傾きを指定します。半角カンマで区切ってxyz軸の回転を設定します。,
scale=3Dオブジェクトの拡大率を指定します。半角カンマで区切ってxyz軸の拡大率を指定します。



#[end]
*/

tyrano.plugin.kag.tag["3d_clone"] = {
    vital: ["name"],

    pm: {
        name: "",
        time: "500",

        scale: "",
        pos: "",
        rot: "",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;

        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        var model_obj = this.kag.tmp.three.models[pm.name].model.clone();

        if (pm.pos != "") {

            let pos = $.three_pos(pm.pos);
            model_obj.position.set(pos.x, pos.y, pos.z);

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
            let scale = $.three_pos(pm.scale);
            model_obj.scale.set(scale.x, scale.y, scale.z);
        }

        if (pm.rot != "") {
            let rot = $.three_pos(pm.rot);
            model_obj.rotation.set(rot.x, rot.y, rot.z);
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

        three.scene.add(model_obj);

        this.kag.ftag.nextOrder();
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
もう一度表示する場合は[3d_show]タグを使ってください。

:sample

;3Dイメージ
[3d_image_new name="myimg" texture="room.jpg" width=200 doubleside=true ] 
[3d_show name="myimg" ]

非表示にします。[p]
[3d_hide name="myimg"]

:param
name=3Dオブジェクトの名前です。退場させたいオブジェクトのnameを指定してください,
time=退場させるまでの時間をミリ秒で指定します。デフォルトは500,
wait=退場の完了を待つか否か。デフォルトはtrue。


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
もう一度表示する場合は[3d_show]タグを使ってください。

:sample

:param
time=退場させるまでの時間をミリ秒で指定します。デフォルトは500,
wait=退場の完了を待つか否か。デフォルトはtrue。


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
3Dオブジェクト削除

:exp
3Dオブジェクトを削除します。
このタグは定義からも削除されるので、再度使用する場合は
もう一度 new タグで定義する必要があります。
使用しなくなった3Dオブジェクトはこまめに削除することで軽量な動作が期待できます。

:sample

;3Dイメージ
[3d_image_new name="myimg" texture="room.jpg" width=200 doubleside=true ] 
[3d_show name="myimg" ]

非表示にします。[p]
[3d_hide name="myimg"]

定義からも削除[p]
[3d_delete name="myimg"]

:param
name=3Dオブジェクトの名前です。削除していオブジェクトのnameを指定してください



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
        var models = this.kag.tmp.three.models;
        var model = models[pm.name];

        if (model.model) {
            three.scene.remove(model.model);
        }

        //グループの場合は付随するオブジェクトも削除
        //モデルがグループの場合
        if (model.pm._type == "template") {
            let group_name = model.pm.name;

            //テンプレートの場合は所属しているテンプレートすべてを削除
            for (let key in models) {
                var _model = models[key];

                if (_model.pm.group && _model.pm.group == group_name) {
                    three.scene.remove(_model.model);
                    delete this.kag.tmp.three.models[key];
                }
            }
        }

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
3Dキャンバスを表示にします。
例えば、3Dシーンからノベルパートへの移動を頻繁にする場合などは便利です。

:sample
time=表示にかける時間をミリ秒で指定できます。デフォルトは1000です。

:param



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
例えば、3Dシーンからノベルパートへの移動を頻繁にする場合などは便利です。

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
もう一度使用する場合は[3d_init]タグを通過させてください。

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
シーン上の3Dオブジェクトをアニメーションさせることができます。

:sample

[3d_model_new name="mymodel" storage="mymodel/scene.gltf" ]
[3d_anim name="miruku" pos="79,-458,727" scale="318.45,318.45,318.45" rot="0.13,-0.64,0" effect="easeInCubic" wait=true] 


:param
name=3Dオブジェクトの名前です。この名前の3Dオブジェクトをアニメーションさせます。カメラをアニメーションさせる場合は「camera」という名前を指定します。,
pos=アニメーション後、3Dオブジェクトを配置する座標を指定します。半角のカンマで区切ってxyz座標を表します。 ,
rot=アニメーション後、3Dオブジェクトの傾きを指定します。半角カンマで区切ってxyz軸の回転を設定します。,
scale=アニメーション後、3Dオブジェクトの拡大率を指定します。半角カンマで区切ってxyz軸の拡大率を指定します。,
time=アニメーションにかける時間をミリ秒で指定します。デフォルトは1000です。,
wait=アニメーションの完了を待つか否か。true or false デフォルトはtrueです。,
lookat=ameraのときだけ有効。オブジェクトのnameかpos座標を指定することでカメラを特定の方向に向けることができます。,
effect= 変化のエフェクトを指定します。指定できる文字列は以下の種類です<br />
jswing
｜def
｜easeInQuad
｜easeOutQuad
｜easeInOutQuad
｜easeInCubic
｜easeOutCubic
｜easeInOutCubic
｜easeInQuart
｜easeOutQuart
｜easeInOutQuart
｜easeInQuint
｜easeOutQuint
｜easeInOutQuint
｜easeInSine
｜easeOutSine
｜easeInOutSine
｜easeInExpo
｜easeOutExpo
｜easeInOutExpo
｜easeInCirc
｜easeOutCirc
｜easeInOutCirc
｜easeInElastic
｜easeOutElastic
｜easeInOutElastic
｜easeInBack
｜easeOutBack
｜easeInOutBack
｜easeInBounce
｜easeOutBounce
｜easeInOutBounce



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
        walk: "false",

        lookat: "",

        callback: "",

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
            walk: pm.walk,
        };

        var map_type = {};

        if (pm.pos != "") {
            if (pm.name == "camera" && pm.lookat != "") {
                if (three.models[pm.lookat]) {
                    var model = three.models[pm.lookat].model;
                    var pos = { x: 0, y: 0, z: 0 };
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
            var pos = map_type[key];
            var type = key;

            this.kag.tmp.three.models[pm.name].toAnim(type, pos, options, () => {
                cnt_fin++;

                if (cnt_fin >= cnt_type) {
                    if (pm.wait == "true") {
                        this.kag.ftag.nextOrder();
                    }

                    if (typeof pm.callback == "function") {
                        pm.callback();
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
アニメーション中の3Dオブジェクトを停止することができます。

:sample

:param
name=アニメーションを停止する3Dオブジェクトの名前を指定します。 ,
finish=true or false を指定します。falseを指定するとアニメーション停止の位置でオブジェクトが停止します。trueだとアニメーションする予定の位置まで移動します。デフォルトはtrue。



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
3Dのシーン全体に影響する設定を行うことができます。

:sample

[3d_scene light_amb="2" tonemap=""]

:param

tonemap=トーンマッピングをシーンに設定できます。指定できる種類はNo/Linear/Reinhard/Uncharted2/Cineon/ACESFilmic。デフォルトはNo（トーンマッピングなし）。,
tonemap_value=トーンマッピングの強さを設定します。デフォルトは0.8です。,
light_amb=環境光の強さを指定します。デフォルトは1。例えば 0.5 だと暗め。2だとかなり明るくなります。




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
カメラの座標を確認したい場合は[camera_debug]をつかって、座標や傾きをテストするのがおすすめです。

:sample

[3d_camera pos="10,20,30" ]

:param
pos=カメラを配置する座標を指定します。半角のカンマで区切ってxyz座標を表します。 ,
rot=カメラの傾きを指定します。半角カンマで区切ってxyz軸の回転を設定します。,
tonemap=トーンマッピングをシーンに設定できます。指定できる種類はNo/Linear/Reinhard/Uncharted2/Cineon/ACESFilmic。デフォルトはNo（トーンマッピングなし）。,
lookat=シーン上の3Dオブジェクトのnameを指定して、そのオブジェクトの方にカメラを向けることができます。 もしくはposを直接指定することで、その座標にカメラを向けることもできます。


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
スマホの傾きでカメラを制御することができます。
PCゲームの場合はマウスの位置でジャイロを再現することができます。

:sample

[3d_gyro max_x="20" max_y="20" ]

:param
max_x=X軸方向の傾き上限を角度で指定します。デフォルトは30,
max_y=Y軸方向の傾き上限を角度で指定します。デフォルトは30,
mode=position か rotation を指定します。傾きに対してカメラに回転の影響を与えるのか、座標移動を与えるのかの違いがあります。デフォルトはrotation（回転）です。



#[end]
*/

//カメラの設定を変更
(tyrano.plugin.kag.tag["3d_gyro"] = {
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
}),
    /*
#[3d_gyro_stop]
:group
3D関連

:title
3Dジャイロ停止

:exp
スマホ限定
ジャイロの動きを停止します。
カメラの位置も戻したい場合はこのタグの直後に3d_cameraで指定してください。
再度ジャイロを有効にしたい場合は [3d_gyro] タグです。

:sample

:param



#[end]
*/

    //カメラの設定を変更
    (tyrano.plugin.kag.tag["3d_gyro_stop"] = {
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
    }),
    /*
#[3d_debug_camera]
:group
3D関連

:title
3Dカメラデバッグ

:exp
3Dシーンのカメラ座標をマウスでドラッグアンドドロップしながら、調整することができます。
デバッグを終了する場合は画面左上のボタンを押します。
マウス操作
左クリック：カメラの向き(rot)
右クリック：カメラの位置(pos)
中央クリック：ポジションのz軸


:sample

[3d_debug_camera ]

:param
button_text=デバッグを終了するボタンのテキストを自由に設定できます。デフォルトは「カメラインスペクタを閉じる」 ,
menu=デバッグのメニューを表示するか否か。falseを指定すると終了させるボタンのみになります。デフォルトはtrue(表示) 



#[end]
*/

    (tyrano.plugin.kag.tag["3d_debug_camera"] = {
        vital: [],

        pm: {
            name: "camera",
            button_text: "カメラインスペクタを閉じる",
            menu: "true",
            menu_close: "true",

            rotate: "true", //回転
            move: "true", //カメラ移動
        },

        start: function (pm) {
            var three = this.kag.tmp.three;

            //一番前にもってきて、うごかせるようにする。
            var j_canvas = three.j_canvas;
            var target_layer = three.target_layer;

            var old_target_layer_zindex = target_layer.css("z-index");
            var old_canvas_zindex = j_canvas.css("z-index");

            //j_canvas.css("z-index",9999999);
            //target_layer.css("z-index",9999999);

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

            var spot_client_x = 0;
            var spot_client_y = 0;
            var spot_client_z = 0;

            var first_model_x = 0;
            var first_model_y = 0;
            var first_model_z = 0;

            function evt_mousewheel(e) {
                return false;

                var delta = e.wheelDelta;

                if (delta < 0) {
                    model.translateZ(+20);
                } else {
                    model.translateZ(-20);
                }

                evt_mouseup();
                e.preventDefault();
            }

            function evt_mousedown(e) {
                if (e.button == 0 && pm.rotate == "true") {
                    button = 0;

                    first_client_x = e.clientX;
                    first_client_y = e.clientY;

                    first_model_x = model.rotation.x;
                    first_model_y = model.rotation.y;

                    $(".panel_chat").css("pointer-events", "none");
                } else if (e.button == 1 && pm.move == "true") {
                    //target.innerHTML = "中ボタンが押されました。";
                    button = 1;
                    first_client_y = e.clientY;
                    first_model_z = model.position.z;
                } else if (e.button == 2 && pm.move == "true") {
                    button = 2;

                    first_client_x = e.clientX;
                    first_client_y = e.clientY;

                    first_model_x = model.position.x;
                    first_model_y = model.position.y;
                } else {
                    mousedown = false;
                    return;
                }

                mousedown = true;
            }

            function evt_mousemove(e) {
                if (three.stat.fps.move_trans_control == true) {
                    return;
                }

                if (!mousedown) return;

                //視点移動中はマウスイベントを無効にする処理
                three.stat.start_event = false;

                if (button == 0) {
                    var hen_x = first_client_x - e.clientX;
                    model.rotation.y = first_model_y + hen_x * 0.005;

                    var hen_y = first_client_y - e.clientY;
                    model.rotation.x = first_model_x + hen_y * 0.005;
                } else if (button == 1) {
                    if (spot_client_y != 0) {
                        model.translateZ((spot_client_y - e.clientY) * -1);
                    }
                    spot_client_y = e.clientY;

                    //var hen_y = first_client_y - e.clientY;
                    //model.position.z = first_model_z + hen_y;
                } else if (button == 2) {
                    /*
var hen_x = first_client_x - e.clientX;
model.position.x = first_model_x + hen_x * 1;

var hen_y = first_client_y - e.clientY;
model.position.y = first_model_y + hen_y * -1;

model.position.x = $.orgFloor(model.position.x, 1);
model.position.y = $.orgFloor(model.position.y, 1);

*/

                    if (spot_client_x != 0) {
                        model.translateX(spot_client_x - e.clientX);
                    }
                    spot_client_x = e.clientX;

                    if (spot_client_y != 0) {
                        model.translateY((spot_client_y - e.clientY) * -1);
                    }
                    spot_client_y = e.clientY;
                }
            }

            function evt_mouseup(e) {
                first_client_x = 0;
                first_client_y = 0;

                if (button == 0) {
                    var str = $.orgFloor(model.rotation.x, 100) + "," + $.orgFloor(model.rotation.y, 100) + "," + model.rotation.z;

                    $(".panel_chat").css("pointer-events", "");
                } else if (button == 2 || button == 1) {
                    spot_client_x = 0;
                    spot_client_y = 0;
                }

                var msg_pos = model.position.x + "," + model.position.y + "," + model.position.z;
                var msg_rot =
                    $.orgFloor(model.rotation.x, 100) + "," + $.orgFloor(model.rotation.y, 100) + "," + $.orgFloor(model.rotation.z, 100);
                var msg_scale =
                    $.orgFloor(model.scale.x, 100) + "," + $.orgFloor(model.scale.y, 100) + "," + $.orgFloor(model.scale.z, 100);

                var msg = 'pos="' + msg_pos + '" rot="' + msg_rot + '" scale="' + msg_scale + '" ';
                j_debug_msg.find("input").val(msg);

                mousedown = false;

                //視点移動中はマウスイベントを無効にする
                if (three.stat.fps.is_fps_studio == true) {
                    three.stat.start_event = true;
                }

                setTimeout((e) => {
                    three.stat.start_event = true;
                }, 500);
            }

            ///マウスホイール
            // Check if the device support the touch or not
            if ("ontouchstart" in document.documentElement) {
                /*
canvas.addEventListener("touchstart", onTouchStart, false);
canvas.addEventListener("touchmove", onTouchMove, false);
canvas.addEventListener("touchend", onTouchEnd, false);
*/

                renderer.domElement.addEventListener(
                    "touchstart",
                    function (e) {
                        evt_mouseup();

                        for (let key in e.touches) {
                            let touche = e.touches[key];
                            if (touche.target.id == "three") {
                                touche.button = 0;
                                evt_mousedown(touche);
                                break;
                            }
                        }
                    },
                    false,
                );

                renderer.domElement.addEventListener(
                    "touchend",
                    function (e) {
                        evt_mouseup();
                    },
                    false,
                );

                renderer.domElement.addEventListener(
                    "touchmove",
                    function (e) {
                        for (let key in e.touches) {
                            let touche = e.touches[key];
                            if (touche.target.id == "three") {
                                touche.button = 0;
                                evt_mousemove(touche);
                                break;
                            }
                        }
                    },
                    false,
                );
            } else {
                window.addEventListener("mousewheel", evt_mousewheel, false);
                window.addEventListener("mousedown", evt_mousedown, false);
                window.addEventListener("mouseup", evt_mouseup, false);
                window.addEventListener("mousemove", evt_mousemove, false);
            }

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
                stop: (e, ui) => { },
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

            if (pm.menu_close == "false") {
                this.kag.ftag.nextOrder();
                j_close_button.hide();
            }

            if (three.stat.fps.active == true) {
                three.stat.start_event = true;
                this.kag.stat.is_strong_stop = true;
            }

            $("body").append(j_close_button);
        },
    });

/*
#[3d_motion]
:group
3D関連

:title
モーション変更

:exp
3Dモデルのモーションを変更することができます。

:sample

;モデルの定義。最初はRunningというモーションで表示。 
[3d_model_new name="Robot" storage="Robot.glb" pos="0,0,0" scale="2" motion="Running" ]
[3d_show name="Robot" rot="0.28,0.67,0" pos="-129,-24,910" scale="9.68" ]

モーションを変更します。[p]

[3d_motion name="Robot" motion="Punch"]

:param
name=3Dオブジェクトの名前を指定します。 ,
motion=モーション名を指定してください。



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
3Dシーンのオブジェクトをマウスでドラッグアンドドロップしながら、調整することができます。
デバッグを終了する場合は画面左上のボタンを押します。
マウス操作
左クリック：カメラの向き(rot)
右クリック：カメラの位置(pos)
中央クリック：ポジションのz軸
スクロール：拡大縮小（scale）

:sample

[3d_model_new name="Robot" storage="Robot.glb" ]
[3d_show name="Robot" rot="0.28,0.67,0" pos="-129,-24,910" scale="9.68" ]

モーションを変更します。[p]

[3d_debug name="Robot" ]

:param
name=デバッグする3Dオブジェクトのnameを指定してください。,
button_text=デバッグを終了するボタンのテキストを自由に設定できます。デフォルトは「3Dインスペクタを閉じる」,
menu=デバッグのメニューを表示するか否か。falseを指定すると終了させるボタンのみになります。デフォルトはtrue(表示) ,
overlap=true or false。trueを指定すると最前面にモデルが表示されます。メニューに隠れたくない場合はここをtrueにしてください。デフォルトはflase,
reset=true or false。trueを指定するとデバッグが終わった後、モデルがデバッグ前の位置に戻ります。デフォルトはfalse。

#[end]
*/

tyrano.plugin.kag.tag["3d_debug"] = {
    vital: ["name"],

    pm: {
        name: "",
        button_text: "閉",
        menu: "true",
        overlap: "false",
        reset: "false",
        control: "false",
        orbit: "true",
    },

    start: function (pm) {
        var that = this;

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

        console.log("three wwwwwwwwwwwwww");
        console.log(pm);
        console.log(this.kag.tmp.three.models);

        var model_obj = this.kag.tmp.three.models[pm.name];

        console.log(model_obj);

        var model = model_obj.model;

        console.log(model_obj);

        //選択されたらそれを上位に通知 FPSが有効なときだけ

        if (this.kag.tmp.three.stat.fps.is_fps_studio) {
            TYRANO.kag.studio.selectObject(pm.name, model_obj);
        }

        var renderer = three.renderer;
        var camera = three.camera;

        var sc_width = parseInt(this.kag.config.scWidth);
        var sc_height = parseInt(this.kag.config.scHeight);

        var direction_rot = 0;

        var original_v = $.setVector(model);

        if (pm.orbit == "true" && typeof three.orbit == "undefined") {
            let orbit = new THREE.OrbitControls(camera, renderer.domElement);
            orbit.screenSpacePanning = true;
            orbit.rotateSpeed = 0.7;

            orbit.panSpeed = 2;

            //ズーム操作禁止
            orbit.enableZoom = true;

            orbit.addEventListener("change", (e) => {
                three.stat.start_event = false;
            });

            orbit.addEventListener("end", (e) => {
                setTimeout((e) => {
                    three.stat.start_event = true;
                }, 100);
            });

            three.orbit = orbit;

            //イベント登録
            /*
$("body").on("mousewheel",function(e){


var delta = e.originalEvent.deltaY ? -(e.originalEvent.deltaY) : e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta : -(e.originalEvent.detail);
if (delta < 0){

let direction = new THREE.Vector3;

let speed = 20.0;
three.camera.getWorldDirection(direction);

direction.x = direction.x*-1;
direction.y = direction.y*-1;
direction.z = direction.z*-1;

three.camera.position.addScaledVector(direction, speed);

} else {

let direction = new THREE.Vector3;

let speed = 20.0;
three.camera.getWorldDirection(direction);

direction.x = direction.x;
direction.y = direction.y;
direction.z = direction.z;

three.camera.position.addScaledVector(direction, speed);

}

//return false;


});
*/
        }

        //orbit.update();

        let is_move_camera = false;

        let control = new THREE.TransformControls(camera, renderer.domElement);
        control.size = 1.5;

        control.setTranslationSnap(20);
        control.setRotationSnap(THREE.MathUtils.degToRad(15));
        control.setScaleSnap(0.1);

        //control.addEventListener('change', renderer);

        control.addEventListener("dragging-changed", function (event) {
            if (three.orbit) {
                three.orbit.enabled = !event.value;
            }

            three.stat.fps.move_trans_control = event.value;

            console.log(event.value);
        });

        control.addEventListener("mouseUp", (e, m) => {

            console.log(e);
            console.log(m);
            console.log("mouseup!");

            var msg_pos =
                $.orgFloor(model.position.x, 100) + "," + $.orgFloor(model.position.y, 100) + "," + $.orgFloor(model.position.z, 100);
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

            //上位層に通知
            var obj = that.kag.tmp.three.models[pm.name];

            if (TYRANO.kag.studio.changeObject) {
                TYRANO.kag.studio.changeObject(pm.name, obj);
            }

            setTimeout((e) => {
                three.stat.start_event = true;
            }, 100);
        });

        control.addEventListener("mouseDown", (e) => {
            console.log(e);
            console.log("mousedown!");

            //マウス話したときにオブジェクト選択状態にしないため
            three.stat.start_event = false;
        });

        //セレクタブルが無効の場合はコントロールなし
        console.log(model_obj);

        //if(model_obj.pm["_selectable"] != "false" ){

        control.attach(model);
        three.scene.add(control);

        //}else{
        //three.scene.add(model);
        //}

        //window.addEventListener( 'resize', onWindowResize );
        window.addEventListener("keydown", function (event) {
            switch (event.keyCode) {
                case 16: //shift
                    control.setTranslationSnap(null);
                    control.setRotationSnap(null);
                    control.setScaleSnap(null);

                    break;

                case 81: // Q
                    control.setSpace(control.space === "local" ? "world" : "local");
                    break;

                case 70: // f
                    console.log("wwwwww");
                    three.orbit.screenSpacePanning = false;
                    break;

                case 71: //g
                    if (three.orbit.screenSpacePanning == true) {
                        three.orbit.screenSpacePanning = false;
                    } else {
                        three.orbit.screenSpacePanning = true;
                    }
                    break;

                case 87: // W
                    control.setMode("translate");
                    break;

                case 69: // E
                    control.setMode("rotate");
                    break;

                case 82: // R
                    control.setMode("scale");
                    break;

                case 67: // C
                    const position = camera.position.clone();

                    camera = camera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
                    camera.position.copy(position);

                    orbit.object = camera;
                    control.camera = camera;

                    camera.lookAt(orbit.target.x, orbit.target.y, orbit.target.z);
                    //onWindowResize();
                    break;

                case 86: // V
                    const randomFoV = Math.random() + 0.1;
                    const randomZoom = Math.random() + 0.1;

                    cameraPersp.fov = randomFoV * 160;
                    cameraOrtho.bottom = -randomFoV * 500;
                    cameraOrtho.top = randomFoV * 500;

                    cameraPersp.zoom = randomZoom * 5;
                    cameraOrtho.zoom = randomZoom * 5;
                    onWindowResize();
                    break;

                case 187:
                case 107: // +, =, num+
                    control.setSize(control.size + 0.1);
                    break;

                case 189:
                case 109: // -, _, num-
                    control.setSize(Math.max(control.size - 0.1, 0.1));
                    break;

                case 88: // X
                    control.showX = !control.showX;
                    break;

                case 89: // Y
                    control.showY = !control.showY;
                    break;

                case 90: // Z
                    control.showZ = !control.showZ;
                    break;

                case 32: // Spacebar
                    control.enabled = !control.enabled;
                    break;
            }
        });

        window.addEventListener("keyup", function (event) {
            switch (event.keyCode) {
                case 70:
                    three.orbit.screenSpacePanning = true;
                    break;

                case 16:
                    control.setTranslationSnap(20);
                    control.setRotationSnap(THREE.MathUtils.degToRad(15));
                    control.setScaleSnap(0.1);

                    break;
            }
        });

        /*
function onWindowResize() {

const aspect = window.innerWidth / window.innerHeight;

cameraPersp.aspect = aspect;
cameraPersp.updateProjectionMatrix();

cameraOrtho.left = cameraOrtho.bottom * aspect;
cameraOrtho.right = cameraOrtho.top * aspect;
cameraOrtho.updateProjectionMatrix();

renderer.setSize( window.innerWidth, window.innerHeight );

render();

}
*/

        var j_close_button = $(
            "<div class='area_three_debug area_three_debug_object' style='position:absolute;z-index:9999999999;padding:10px;opacity:0.8;background-color:white;left:0px;top:0px'><button style='cursor:pointer'><span style=''>" +
            pm.button_text +
            "</span></button></div>",
        );
        j_close_button.draggable({
            scroll: false,
            //containment:".tyrano_base",
            stop: (e, ui) => { },
        });

        //var j_debug_msg = $("<div style='padding:5px'><input type='text' style='width:320px' /></div>");

        let j_btn_mode_pos = $("<input type='button' value='位置' />");
        let j_btn_mode_rot = $("<input type='button' value='回転' />");
        let j_btn_mode_scale = $("<input type='button' value='スケール' />");
        let j_btn_camera_reset = $("<input type='button' value='ズームリセット' />");

        j_btn_mode_pos.on("click", (e) => {
            control.setMode("translate");
        });

        j_btn_mode_rot.on("click", (e) => {
            control.setMode("rotate");
        });

        j_btn_mode_scale.on("click", (e) => {
            control.setMode("scale");
        });

        j_btn_camera_reset.on("click", (e) => {
            //three.orbit.saveState();
            three.orbit.reset();

            //console.log(three.orbit.object.scale=1);
            //three.orbit.zoom0 = 1;
            //three.orbit.reset();

            //three.orbit.object.updateProjectionMatrix();
            //three.orbit.update();
        });

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
            //j_three_debug_layer.remove();
            control.detach();
            control.dispose();

            //orbit.dispose();

            if (pm.reset == "true") {
                j_reset_button.trigger("click");
            }

            j_close_button.remove();

            this.kag.ftag.nextOrder();
        });

        if (pm.menu == "true") {
            j_close_button.append("<span>｜</span>");

            j_close_button.append(j_btn_mode_pos);
            j_close_button.append(j_btn_mode_rot);
            j_close_button.append(j_btn_mode_scale);

            j_close_button.append(j_btn_camera_reset);

            //j_close_button.append(j_copy_button);
            //j_close_button.append(j_reset_button);

            //j_close_button.append(j_debug_msg);
        }

        //canvasでオブジェクト以外がクリックされたらリセットする仕組み

        $("body").append(j_close_button);

        //初期値を設定する。
        //evt_mouseup();
    },
};

/*
#[3d_debug_bk]
:group
3D関連

:title
3Dデバッグ

:exp
3Dシーンのオブジェクトをマウスでドラッグアンドドロップしながら、調整することができます。
デバッグを終了する場合は画面左上のボタンを押します。
マウス操作
左クリック：カメラの向き(rot)
右クリック：カメラの位置(pos)
中央クリック：ポジションのz軸
スクロール：拡大縮小（scale）

:sample

[3d_model_new name="Robot" storage="Robot.glb" ]
[3d_show name="Robot" rot="0.28,0.67,0" pos="-129,-24,910" scale="9.68" ]

モーションを変更します。[p]

[3d_debug name="Robot" ]

:param
name=デバッグする3Dオブジェクトのnameを指定してください。,
button_text=デバッグを終了するボタンのテキストを自由に設定できます。デフォルトは「3Dインスペクタを閉じる」,
menu=デバッグのメニューを表示するか否か。falseを指定すると終了させるボタンのみになります。デフォルトはtrue(表示) ,
overlap=true or false。trueを指定すると最前面にモデルが表示されます。メニューに隠れたくない場合はここをtrueにしてください。デフォルトはflase,
reset=true or false。trueを指定するとデバッグが終わった後、モデルがデバッグ前の位置に戻ります。デフォルトはfalse。

#[end]
*/

tyrano.plugin.kag.tag["3d_debug_bk"] = {
    vital: ["name"],

    pm: {
        name: "",
        button_text: "3Dインスペクタを閉じる",
        menu: "true",
        overlap: "false",
        reset: "false",
    },

    start: function (pm) {
        var that = this;

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

        //選択されたらそれを上位に通知 FPSが有効なときだけ

        if (this.kag.tmp.three.stat.fps.is_fps_studio) {
            TYRANO.kag.studio.selectObject(pm.name, model_obj);
        }

        var renderer = three.renderer;
        var camera = three.camera;

        var sc_width = parseInt(this.kag.config.scWidth);
        var sc_height = parseInt(this.kag.config.scHeight);

        // オブジェクトの回転
        var prevPosition = {};
        var mousedown = false;
        var button = 0;

        //オブジェクトの移動

        var spot_client_x = 0;
        var spot_client_y = 0;

        var direction_rot = 0;

        var original_v = $.setVector(model);

        var first_client_x = 0;
        var first_client_y = 0;

        var first_model_z = 0;

        function evt_mousewheel(e) {
            return false;

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
                first_client_x = e.clientX;
                first_client_y = e.clientY;

                button = 0;
            } else if (e.button == 1) {
                //target.innerHTML = "中ボタンが押されました。";
                button = 1;
                first_client_y = e.clientY;
                first_model_z = model.position.z;

                first_client_y = e.clientY;
            } else if (e.button == 2) {
                button = 2;

                first_client_x = e.clientX;
                first_client_y = e.clientY;

                /*
vec.set(
( e.clientX / window.innerWidth ) * 2 - 1,
- ( e.clientY / window.innerHeight ) * 2 + 1,
0.5 );

vec.unproject(camera);

vec.sub(camera.position).normalize();

var distance = 0;

if(camera.position.z > 0){
distance =  - camera.position.z / vec.z;
}else{
distance =  camera.position.z / vec.z;
}

original_pos.copy( camera.position ).add(vec.multiplyScalar( distance));

hen_pos.x = model.position.x - original_pos.x;
hen_pos.y = model.position.y - original_pos.y;
*/
            }

            mousedown = true;
            prevPosition = { x: e.clientX, y: e.clientY };
        }

        function evt_mousemove(e) {
            if (!mousedown) return;

            j_close_button.hide();

            if (button == 0) {
                moveDistance = {
                    x: prevPosition.x - e.clientX,
                    y: prevPosition.y - e.clientY,
                };
                //model.rotation.x += moveDistance.y * 0.01;
                //model.rotation.y -= moveDistance.x * 0.01;

                if (direction_rot == 0) {
                    if (Math.abs(first_client_x - e.clientX) > 5) {
                        direction_rot = 2;
                    } else if (Math.abs(first_client_y - e.clientY) > 5) {
                        direction_rot = 1;
                    }
                } else {
                    if (direction_rot == 1) {
                        model.rotateX(moveDistance.y * 0.01 * -1);

                        if (Math.abs(moveDistance.x) > Math.abs(moveDistance.y)) {
                            direction_rot = 0;
                            first_client_x = e.clientX;
                            first_client_y = e.clientY;
                        }
                    } else {
                        model.rotateY(moveDistance.x * 0.01 * -1);

                        if (Math.abs(moveDistance.y) > Math.abs(moveDistance.x)) {
                            direction_rot = 0;
                            first_client_x = e.clientX;
                            first_client_y = e.clientY;
                        }
                    }

                    prevPosition = { x: e.clientX, y: e.clientY };
                }
            } else if (button == 1) {
                //var hen_y = first_client_y - e.clientY;
                //model.position.z = first_model_z + hen_y;

                if (spot_client_y != 0) {
                    model.translateZ((spot_client_y - e.clientY) * -1);
                }

                spot_client_y = e.clientY;
            } else if (button == 2) {
                if (spot_client_x != 0) {
                    model.translateX((spot_client_x - e.clientX) * -1);
                }
                spot_client_x = e.clientX;

                if (spot_client_y != 0) {
                    model.translateY(spot_client_y - e.clientY);
                }

                spot_client_y = e.clientY;

                /*
vec.set(
( e.clientX / window.innerWidth ) * 2 - 1,
- ( e.clientY / window.innerHeight ) * 2 + 1,
0.5 );

vec.unproject(camera);

vec.sub(camera.position).normalize();

var distance = 0;

if(camera.position.z > 0){
distance =  - camera.position.z / vec.z;
}else{
distance =  camera.position.z / vec.z;
}

pos.copy( camera.position ).add(vec.multiplyScalar( distance));

//console.log(hen_pos.x + pos.x);
//console.log($.orgFloor(hen_pos.x + pos.x,1));

model.position.x = $.orgFloor(hen_pos.x + pos.x,1);
model.position.y = $.orgFloor(hen_pos.y + pos.y,1);

*/
            }
        }

        function evt_mouseup(e) {
            j_close_button.show();

            if (typeof e == "undefined") return false;
            //クリックした位置が同じ場合は、そのまま渡す
            if (Math.abs(first_client_x - e.clientX) < 10 && Math.abs(first_client_y - e.clientY) < 10) {
                that.kag.tmp.three.j_canvas.trigger("click", e);

                first_client_x = 0;
                first_client_y = 0;

                spot_client_x = 0;
                spot_client_y = 0;
                direction_rot = 0;

                mousedown = false;

                return false;
            }

            first_client_x = 0;
            first_client_y = 0;

            spot_client_x = 0;
            spot_client_y = 0;
            direction_rot = 0;

            if (button == 0) {
                var str = $.orgFloor(model.rotation.x, 100) + "," + $.orgFloor(model.rotation.y, 100) + "," + model.rotation.z;
            } else if (button == 2 || button == 1) {
            }

            var msg_pos =
                $.orgFloor(model.position.x, 100) + "," + $.orgFloor(model.position.y, 100) + "," + $.orgFloor(model.position.z, 100);
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
            //j_debug_msg.find("input").val(msg);

            //上位層に通知
            var obj = that.kag.tmp.three.models[pm.name];
            TYRANO.kag.studio.changeObject(pm.name, obj);

            mousedown = false;
        }

        if (pm.overlap == "true") {
            j_canvas.css("z-index", 9999999);
            target_layer.css("z-index", 9999999);
        }

        //デバッグ用のレイヤ
        var j_three_debug_layer = $(
            "<div class='three_debug_layer' style='width:100%;height:100%;position:absolute;z-index:9999999;'></div>",
        );
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
            "<div class='area_three_debug area_three_debug_object' style='position:absolute;z-index:9999999999;padding:10px;opacity:0.8;background-color:white;left:0px;top:0px'><button style='cursor:pointer'><span style=''>" +
            pm.button_text +
            "</span></button></div>",
        );
        j_close_button.draggable({
            scroll: false,
            //containment:".tyrano_base",
            stop: (e, ui) => { },
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

        //canvasでオブジェクト以外がクリックされたらリセットする仕組み

        $("body").append(j_close_button);

        //初期値を設定する。
        evt_mouseup();
    },
};

tyrano.plugin.kag.tag["fps_control_start"] = {
    vital: [],

    pm: {},

    start: function (pm) {
        TYRANO.kag.tmp.three.stat.fps.active = true;
        this.kag.ftag.nextOrder();
    },
};

tyrano.plugin.kag.tag["fps_control_stop"] = {
    vital: [],

    pm: {},

    start: function (pm) {
        TYRANO.kag.tmp.three.stat.fps.active = false;
        this.kag.ftag.nextOrder();
    },
};

/*
#[3d_fps_control]
:group
3D関連

:title
FPSコントロール

:exp
FPSコントロールが可能になる。
[s]に到達していないと実行されません。

:sample

[3d_fps_control]

[3d_debug_camera rotate=true move=false menu=false menu_close=false ]

[s]


:param


#[end]
*/

tyrano.plugin.kag.tag["3d_fps_control"] = {
    vital: [],

    pm: {
        joystick: "",
        camera_pos_y: "", //視点位置
    },

    start: function (pm) {
        //this.domElement.addEventListener( 'contextmenu', contextmenu, false );
        //this.domElement.addEventListener( 'mousemove', _onMouseMove, false );

        var renderer = this.kag.tmp.three.renderer;

        //renderer.domElement.addEventListener( 'mousedown', this._onMouseDown, false );
        //renderer.domElement.addEventListener( 'mouseup', this._onMouseUp, false );

        window.addEventListener("keydown", this._onKeyDown, false);
        window.addEventListener("keyup", this._onKeyUp, false);

        if (pm.joystick == "true") {
            let j_joy = $(
                '<div id="joyDiv" style="opacity:0.5;position:absolute;width:200px;height:200px;bottom:0px;left:0px;z-index:99"></div>',
            );
            $("body").prepend(j_joy);
            TYRANO.kag.tmp.three.stat.fps.joy = new JoyStick("joyDiv", {
                internalFillColor: "#DDDDDD",
                internalStrokeColor: "#DDDDDD",
                externalStrokeColor: "#DDDDDD",
            });

            TYRANO.kag.tmp.three.stat.fps.isJoy = true;
        }

        if (pm.camera_pos_y != "") {
            TYRANO.kag.tmp.three.stat.fps.camera_pos_y = parseFloat(pm.camera_pos_y);
        }

        TYRANO.kag.tmp.three.stat.fps.active = true;

        this.kag.ftag.nextOrder();
    },

    _onKeyDown: function (event) {
        let fps = TYRANO.kag.tmp.three.stat.fps;
        let k = event.keyCode;

        if (k == 13) {
            $(".text_chat").focus();
        }

        if (k == 38 || k == 87) {
            fps.moveForward = true;
            fps.offMoveBufferB = false;
        }

        if (k == 40 || k == 83) {
            fps.moveBackward = true;
            fps.offMoveBufferF = false;
        }

        if (k == 37 || k == 65) {
            fps.rotateLeft = true;
            fps.offRotateBufferR = false;
        }

        if (k == 39 || k == 68) {
            fps.rotateRight = true;
            fps.offRotateBufferL = false;
        }

        if (fps.active == true) {
            if (typeof window.app != "undefined") {
                app.startWalk();
            }
        }
    },

    _onKeyUp: function (event) {
        let fps = TYRANO.kag.tmp.three.stat.fps;
        let k = event.keyCode;

        if (k == 38 || k == 87) {
            fps.moveForward = false;
            fps.offMoveBufferF = true;
        }

        if (k == 40 || k == 83) {
            fps.moveBackward = false;
            fps.offMoveBufferB = true;
        }

        if (k == 37 || k == 65) {
            fps.rotateLeft = false;
            fps.offRotateBufferL = true;
        }

        if (k == 39 || k == 68) {
            fps.rotateRight = false;
            fps.offRotateBufferR = true;
        }

        //歩くモーションの停止
        if (typeof window.app != "undefined") {
            if (fps.moveForward == false && fps.moveBackward == false && fps.rotateLeft == false && fps.rotateRight == false) {
                app.stopWalk();
            }
        }
    },
};

/*
#[3d_new_group]
:group
3D関連

:title
3Dグループ新規作成

:exp
3Dオブジェクトをグループで管理することができるようにする。

:sample

[3d_new_group name="mygroup" ]

[3d_image_new name="model_A" texture="t.png" width=100 doubleside=true ]
[3d_add_group name="model_A" group="mygroup" pos="0,100,0" rot="-0,0,0" scale="1" ]

[3d_show name="mygroup" ]

:param
name=新規作成するグループ名を設定します。

#[end]
*/

tyrano.plugin.kag.tag["3d_new_group"] = {
    vital: ["name"],

    pm: {
        name: "",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;

        const model = new THREE.Group();
        model.name = pm.name;
        this.kag.tmp.three.models[pm.name] = new ThreeModel({ name: pm.name, model: model, pm: pm }, three);

        this.kag.ftag.nextOrder();
    },
};

/*
#[3d_add_group]
:group
3D関連

:title
3Dグループに追加

:exp
3Dオブジェクトをグループに追加します。

:sample

[3d_new_group name="mygroup" ]

[3d_image_new name="model_A" texture="t.png" width=100 doubleside=true ]
[3d_add_group name="model_A" group="mygroup" pos="0,100,0" rot="-0,0,0" scale="1" ]

[3d_show name="mygroup" ]

:param
name=追加する3Dオブジェクトを指定します。,
new_name=ここが指定されている場合、nameのオブジェクトをコピーして新しい名前で登録できます。,

#[end]
*/

//newされたもでるをcloneしてgroupに追加
tyrano.plugin.kag.tag["3d_add_group"] = {
    vital: ["name", "group"],

    pm: {
        name: "",
        new_name: "",
        scale: "",
        pos: "",
        rot: "",

        clone: "false",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;

        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        if ($.checkThreeModel(pm.group) == false) {
            return;
        }

        var model_obj;

        if (pm.clone == "true") {
            model_obj = this.kag.tmp.three.models[pm.name].model.clone();
        } else {
            model_obj = this.kag.tmp.three.models[pm.name].model;
        }

        var group_obj = this.kag.tmp.three.models[pm.group].model;
        group_obj.name = pm.group;

        //新しい名前を設定
        if (pm.new_name != "") {
            model_obj.traverse(function (node) {
                node.userData["name"] = pm.new_name;
            });
        }

        if (pm.pos != "") {
            let pos = $.three_pos(pm.pos);
            model_obj.position.set(pos.x, pos.y, pos.z);
        }

        if (pm.scale != "") {
            let scale = $.three_pos(pm.scale);
            model_obj.scale.set(scale.x, scale.y, scale.z);
        }

        if (pm.rot != "") {
            let rot = $.three_pos(pm.rot);
            model_obj.rotation.set(rot.x, rot.y, rot.z);
        }

        group_obj.add(model_obj);

        this.kag.ftag.nextOrder();
    },
};

/*
#[3d_text_new]
:group
3D関連

:title
3Dテキスト

:exp
3D空間にテキストを表示できます。

:sample

[3d_new_text name="text1" text="あああ" ]
[3d_show name="text1"]

:param
name=3Dオブジェクトの名前です。この名前をつかって表示・非表示などの制御を行います。,
text=表示するテキスト文字列を指定します,
pos=3Dオブジェクトを配置する座標を指定します。半角のカンマで区切ってxyz座標を表します。 ,
rot=3Dオブジェクトの傾きを指定します。半角カンマで区切ってxyz軸の回転を設定します。,
scale=3Dオブジェクトの拡大率を指定します。半角カンマで区切ってxyz軸の拡大率を指定します。,
size=フォントサイズ。デフォルトは42, 
sprite=true or falseを指定。trueを指定すると常に正面をむくテキストを作成します。デフォルトはfalse


#[end]
*/

//スプライトを配置する
tyrano.plugin.kag.tag["3d_text_new"] = {
    vital: ["name", "text"],

    pm: {
        name: "",
        text: "",
        size: "42",
        canvas_width: "1500",
        canvas_height: "100",
        color: "",

        width: "5",
        height: "5",

        scale: "0",
        pos: "0",
        rot: "0",
        tonemap: "false",
        next: "true",

        sprite: "false", //常に正面を向くタイプ

        folder: "",
    },

    start: function (pm) {
        //const createCanvasForTexture = (canvasWidth, canvasHeight, text, fontSize) => {
        // 貼り付けるcanvasを作成。
        const canvasForText = document.createElement("canvas");
        const ctx = canvasForText.getContext("2d");
        let canvasWidth = parseInt(pm.canvas_width);
        let canvasHeight = parseInt(pm.canvas_height);

        ctx.canvas.width = canvasWidth; // 小さいと文字がぼやける
        ctx.canvas.height = canvasHeight; // 小さいと文字がぼやける

        // 透過率50%の青背景を描く
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (pm.color != "") {
            ctx.fillStyle = $.convertColor(pm.color);
        } else {
            ctx.fillStyle = "black";
        }

        ctx.font = pm.size + "px sans-serif";

        ctx.fillText(
            pm.text,
            // x方向の余白/2をx方向開始時の始点とすることで、横方向の中央揃えをしている。
            (canvasWidth - ctx.measureText(pm.text).width) / 2,
            // y方向のcanvasの中央に文字の高さの半分を加えることで、縦方向の中央揃えをしている。
            canvasHeight / 2 + ctx.measureText(pm.text).actualBoundingBoxAscent / 2,
        );

        const canvasTexture = new THREE.CanvasTexture(canvasForText);

        let model = null;

        if (pm.sprite == "true") {
            // マテリアルを作成する
            const material = new THREE.SpriteMaterial({
                map: canvasTexture,
                alphaTest: 0.01,
                transparent: true,
            });

            model = new THREE.Sprite(material);
        } else {
            const material = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                map: canvasTexture,
                transparent: true,
                alphaTest: 0.5,
            });
            const geo = new THREE.PlaneGeometry(parseFloat(pm.width), parseFloat(pm.height), 1, 1);

            model = new THREE.Mesh(geo, material);
        }

        let pos = $.three_pos(pm.pos);
        let rot = $.three_pos(pm.rot);
        let scale = $.three_pos(pm.scale);

        model.position.set(pos.x, pos.y, pos.z);
        model.rotation.set(rot.x, rot.y, rot.z);
        model.scale.set(scale.x, scale.y * (canvasHeight / canvasWidth), scale.z);

        var three = TYRANO.kag.tmp.three;
        var scene = three.scene;

        TYRANO.kag.tmp.three.models[pm.name] = new ThreeModel({ name: pm.name, model: model, pm: pm }, three);

        if (pm.next == "true") {
            TYRANO.kag.ftag.nextOrder();
        }
    },
};

//スプライトを配置する
tyrano.plugin.kag.tag["3d_text_mod"] = {
    vital: ["name"],

    pm: {
        name: "",
        jname: "",
        text: "",

        size: "",
        canvas_width: "1500",
        canvas_height: "100",

        color: "",

        scale: "",
        pos: "",
        rot: "",

        next: "true",
    },

    start: function (pm) {
        var three = this.kag.tmp.three;
        var scene = three.scene;

        if ($.checkThreeModel(pm.name) == false) {
            return;
        }

        let model = this.kag.tmp.three.models[pm.name];

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

        if (pm.jname != "") {
            model.pm.jname = pm.jname;
        }

        /*
if(pm.doubleside!=""){

if(pm.doubleside=="true"){
model.model.material.side = THREE.DoubleSide; 
}else{
model.model.material.side = THREE.FrontSide; 
}

}
*/

        if (pm.size != "") {
            model.pm.size = pm.size;
            pm.text = model.pm.text;
        } else {
            pm.size = model.pm.size;
        }

        //const createCanvasForTexture = (canvasWidth, canvasHeight, text, fontSize) => {
        // 貼り付けるcanvasを作成。

        if (pm.color != "" || pm.text != "") {
            if (pm.color == "") {
                pm.color = model.pm.color;
            } else {
                model.pm.color = pm.color;
            }

            if (pm.text == "") {
                pm.text = model.pm.text;
            } else {
                model.pm.text = pm.text;
            }

            const canvasForText = document.createElement("canvas");
            const ctx = canvasForText.getContext("2d");
            let canvasWidth = parseInt(pm.canvas_width);
            let canvasHeight = parseInt(pm.canvas_height);

            ctx.canvas.width = canvasWidth; // 小さいと文字がぼやける
            ctx.canvas.height = canvasHeight; // 小さいと文字がぼやける

            // 透過率50%の青背景を描く
            ctx.fillStyle = "rgba(0, 0, 0, 0)";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            if (pm.color != "") {
                ctx.fillStyle = $.convertColor(pm.color);
            } else {
                ctx.fillStyle = "black";
            }

            ctx.font = pm.size + "px sans-serif";

            ctx.fillText(
                pm.text,
                // x方向の余白/2をx方向開始時の始点とすることで、横方向の中央揃えをしている。
                (canvasWidth - ctx.measureText(pm.text).width) / 2,
                // y方向のcanvasの中央に文字の高さの半分を加えることで、縦方向の中央揃えをしている。
                canvasHeight / 2 + ctx.measureText(pm.text).actualBoundingBoxAscent / 2,
            );

            const canvasTexture = new THREE.CanvasTexture(canvasForText);

            if (model.pm.sprite == "true") {
                // マテリアルを作成する
                const material = new THREE.SpriteMaterial({
                    map: canvasTexture,
                    alphaTest: 0.5,
                    transparent: true,
                });

                model.model.material = material;
            } else {
                const material = new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    map: canvasTexture,
                    transparent: true,
                    alphaTest: 0.5,
                });
                model.model.material = material;
            }

            model.needsUpdate();
        }

        if (pm.next == "true") {
            TYRANO.kag.ftag.nextOrder();
        }
    },
};

/*
#[3d_sound_new]
:group
3D関連

:title
3Dテキスト

:exp
3D空間にテキストを表示できます。

:sample

[3d_new_text name="text1" text="あああ" ]
[3d_show name="text1"]

:param
name=3Dオブジェクトの名前です。この名前をつかって表示・非表示などの制御を行います。,
text=表示するテキスト文字列を指定します,
pos=3Dオブジェクトを配置する座標を指定します。半角のカンマで区切ってxyz座標を表します。 ,
rot=3Dオブジェクトの傾きを指定します。半角カンマで区切ってxyz軸の回転を設定します。,
scale=3Dオブジェクトの拡大率を指定します。半角カンマで区切ってxyz軸の拡大率を指定します。,
size=フォントサイズ。デフォルトは42, 
sprite=true or falseを指定。trueを指定すると常に正面をむくテキストを作成します。デフォルトはfalse


#[end]
*/

//サウンドを再生する
tyrano.plugin.kag.tag["3d_sound"] = {
    vital: [],

    pm: {
        name: "",
        target_name: "", //オブジェクト。このオブジェクトがある場所で鳴らす。
        pos: "0,0,0",
        folder: "",
        storage: "",
        loop: "false",
        volume: "",
        next: "true",
    },

    start: function (pm) {
        let three = TYRANO.kag.tmp.three;

        var folder = "";
        if (pm.folder != "") {
            folder = pm.folder;
        } else {
            folder = "others/3d/audio";
        }

        var storage_url = "";
        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        } else {
            storage_url = "./data/" + folder + "/" + pm.storage;
        }

        // create a global audio source
        const sound = new THREE.PositionalAudio(three.audio_listener);

        let pos = $.three_pos(pm.pos);

        if (pm.target_name != "") {
            //$.three_pos("10,10,10");
            if ($.checkThreeModel(pm.target_name) == false) {
                return;
            }

            var model = this.kag.tmp.three.models[pm.target_name].model;
            pos.x = model.position.x;
            pos.y = model.position.y;
            pos.z = model.position.z;
        }

        //サウンドのポジション
        sound.position.x = pos.x;
        sound.position.y = pos.y;
        sound.position.z = pos.z;

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();

        audioLoader.load(storage_url, function (buffer) {
            sound.setBuffer(buffer);

            if (pm.loop == "true") {
                sound.setLoop(true);
            }

            var volume = 1;
            if (pm.volume !== "") {
                volume = parseFloat(parseInt(pm.volume) / 100);
            }

            sound.setVolume(volume);
            sound.setRefDistance(20);

            sound.onEnded = function () {
                if (pm.loop == "false") {
                    three.scene.remove(sound);
                }
            };

            sound.play();
        });

        three.scene.add(sound);

        if (pm.next == "true") {
            TYRANO.kag.ftag.nextOrder();
        }
    },
};

/*
#[3d_helper]
:group
3D関連

:title
画面に操作補助用の描画を追加

:exp
3D空間に操作補助用のラインを描画させることができる

:sample

[3d_new_text name="text1" text="あああ" ]
[3d_show name="text1"]

:param
name=3Dオブジェクトの名前です。この名前をつかって表示・非表示などの制御を行います。,
text=表示するテキスト文字列を指定します,


#[end]
*/

//サウンドを再生する
tyrano.plugin.kag.tag["3d_helper"] = {
    vital: [],


    pm: {
        name: "",
        grid: "",
        axes: "",
        next: "true",
    },

    /*
    if(button == 0) {
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
*/

    start: function (pm) {
        let three = TYRANO.kag.tmp.three;

        let gridHelper = new THREE.GridHelper(4000, 40, 0x888888, 0x444444);
        gridHelper.position.y = 0;
        gridHelper.name = "Grid";
        three.scene.add(gridHelper);

        const axes = new THREE.AxesHelper(500);
        axes.name = "AxesHelper";
        three.scene.add(axes);

        if (pm.next == "true") {
            TYRANO.kag.ftag.nextOrder();
        }
    },
};

/*
 * Name          : joy.js
 * @author       : Roberto D'Amico (Bobboteck)
 * Last modified : 09.06.2020
 * Revision      : 1.1.6
 *
 * Modification History:
 * Date         Version     Modified By		Description
 * 2020-06-09	1.1.6		Roberto D'Amico	Fixed Issue #10 and #11
 * 2020-04-20	1.1.5		Roberto D'Amico	Correct: Two sticks in a row, thanks to @liamw9534 for the suggestion
 * 2020-04-03               Roberto D'Amico Correct: InternalRadius when change the size of canvas, thanks to @vanslipon for the suggestion
 * 2020-01-07	1.1.4		Roberto D'Amico Close #6 by implementing a new parameter to set the functionality of auto-return to 0 position
 * 2019-11-18	1.1.3		Roberto D'Amico	Close #5 correct indication of East direction
 * 2019-11-12   1.1.2       Roberto D'Amico Removed Fix #4 incorrectly introduced and restored operation with touch devices
 * 2019-11-12   1.1.1       Roberto D'Amico Fixed Issue #4 - Now JoyStick work in any position in the page, not only at 0,0
 *
 * The MIT License (MIT)
 *
 *  This file is part of the JoyStick Project (https://github.com/bobboteck/JoyStick).
 *	Copyright (c) 2015 Roberto D'Amico (Bobboteck).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @desc Principal object that draw a joystick, you only need to initialize the object and suggest the HTML container
 * @costructor
 * @param container {String} - HTML object that contains the Joystick
 * @param parameters (optional) - object with following keys:
 *	title {String} (optional) - The ID of canvas (Default value is 'joystick')
 * 	width {Int} (optional) - The width of canvas, if not specified is setted at width of container object (Default value is the width of container object)
 * 	height {Int} (optional) - The height of canvas, if not specified is setted at height of container object (Default value is the height of container object)
 * 	internalFillColor {String} (optional) - Internal color of Stick (Default value is '#00AA00')
 * 	internalLineWidth {Int} (optional) - Border width of Stick (Default value is 2)
 * 	internalStrokeColor {String}(optional) - Border color of Stick (Default value is '#003300')
 * 	externalLineWidth {Int} (optional) - External reference circonference width (Default value is 2)
 * 	externalStrokeColor {String} (optional) - External reference circonference color (Default value is '#008000')
 * 	autoReturnToCenter {Bool} (optional) - Sets the behavior of the stick, whether or not, it should return to zero position when released (Default value is True and return to zero)
 */
var JoyStick = function (container, parameters) {
    parameters = parameters || {};
    var title = typeof parameters.title === "undefined" ? "joystick" : parameters.title,
        width = typeof parameters.width === "undefined" ? 0 : parameters.width,
        height = typeof parameters.height === "undefined" ? 0 : parameters.height,
        internalFillColor = typeof parameters.internalFillColor === "undefined" ? "#00AA00" : parameters.internalFillColor,
        internalLineWidth = typeof parameters.internalLineWidth === "undefined" ? 2 : parameters.internalLineWidth,
        internalStrokeColor = typeof parameters.internalStrokeColor === "undefined" ? "#003300" : parameters.internalStrokeColor,
        externalLineWidth = typeof parameters.externalLineWidth === "undefined" ? 2 : parameters.externalLineWidth,
        externalStrokeColor = typeof parameters.externalStrokeColor === "undefined" ? "#008000" : parameters.externalStrokeColor,
        autoReturnToCenter = typeof parameters.autoReturnToCenter === "undefined" ? true : parameters.autoReturnToCenter;

    // Create Canvas element and add it in the Container object
    var objContainer = document.getElementById(container);
    var canvas = document.createElement("canvas");
    canvas.id = title;
    if (width === 0) {
        width = objContainer.clientWidth;
    }
    if (height === 0) {
        height = objContainer.clientHeight;
    }
    canvas.width = width;
    canvas.height = height;
    objContainer.appendChild(canvas);
    var context = canvas.getContext("2d");

    var pressed = 0; // Bool - 1=Yes - 0=No
    var circumference = 2 * Math.PI;
    var internalRadius = (canvas.width - (canvas.width / 2 + 10)) / 2;
    var maxMoveStick = internalRadius + 5;
    var externalRadius = internalRadius + 30;
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var directionHorizontalLimitPos = canvas.width / 10;
    var directionHorizontalLimitNeg = directionHorizontalLimitPos * -1;
    var directionVerticalLimitPos = canvas.height / 10;
    var directionVerticalLimitNeg = directionVerticalLimitPos * -1;
    // Used to save current position of stick
    var movedX = centerX;
    var movedY = centerY;

    // Check if the device support the touch or not
    if ("ontouchstart" in document.documentElement) {
        canvas.addEventListener("touchstart", onTouchStart, false);
        canvas.addEventListener("touchmove", onTouchMove, false);
        canvas.addEventListener("touchend", onTouchEnd, false);
    } else {
        canvas.addEventListener("mousedown", onMouseDown, false);
        canvas.addEventListener("mousemove", onMouseMove, false);
        canvas.addEventListener("mouseup", onMouseUp, false);
    }
    // Draw the object
    drawExternal();
    drawInternal();

    /******************************************************
     * Private methods
     *****************************************************/

    /**
     * @desc Draw the external circle used as reference position
     */
    function drawExternal() {
        context.beginPath();
        context.arc(centerX, centerY, externalRadius, 0, circumference, false);
        context.lineWidth = externalLineWidth;
        context.strokeStyle = externalStrokeColor;
        context.stroke();
    }

    /**
     * @desc Draw the internal stick in the current position the user have moved it
     */
    function drawInternal() {
        context.beginPath();
        if (movedX < internalRadius) {
            movedX = maxMoveStick;
        }
        if (movedX + internalRadius > canvas.width) {
            movedX = canvas.width - maxMoveStick;
        }
        if (movedY < internalRadius) {
            movedY = maxMoveStick;
        }
        if (movedY + internalRadius > canvas.height) {
            movedY = canvas.height - maxMoveStick;
        }
        context.arc(movedX, movedY, internalRadius, 0, circumference, false);
        // create radial gradient
        var grd = context.createRadialGradient(centerX, centerY, 5, centerX, centerY, 200);
        // Light color
        grd.addColorStop(0, internalFillColor);
        // Dark color
        grd.addColorStop(1, internalStrokeColor);
        context.fillStyle = grd;
        context.fill();
        context.lineWidth = internalLineWidth;
        context.strokeStyle = internalStrokeColor;
        context.stroke();
    }

    /**
     * @desc Events for manage touch
     */
    function onTouchStart(event) {
        pressed = 1;
    }

    function onTouchMove(event) {
        // Prevent the browser from doing its default thing (scroll, zoom)
        event.preventDefault();
        if (pressed === 1 && event.targetTouches[0].target === canvas) {
            movedX = event.targetTouches[0].pageX;
            movedY = event.targetTouches[0].pageY;
            // Manage offset
            if (canvas.offsetParent.tagName.toUpperCase() === "BODY") {
                movedX -= canvas.offsetLeft;
                movedY -= canvas.offsetTop;
            } else {
                movedX -= canvas.offsetParent.offsetLeft;
                movedY -= canvas.offsetParent.offsetTop;
            }
            // Delete canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw object
            drawExternal();
            drawInternal();
        }
    }

    function onTouchEnd(event) {
        pressed = 0;
        // If required reset position store variable
        if (autoReturnToCenter) {
            movedX = centerX;
            movedY = centerY;
        }
        // Delete canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw object
        drawExternal();
        drawInternal();
        //canvas.unbind('touchmove');
    }

    /**
     * @desc Events for manage mouse
     */
    function onMouseDown(event) {
        pressed = 1;
    }

    function onMouseMove(event) {
        if (pressed === 1) {
            movedX = event.pageX;
            movedY = event.pageY;
            // Manage offset
            if (canvas.offsetParent.tagName.toUpperCase() === "BODY") {
                movedX -= canvas.offsetLeft;
                movedY -= canvas.offsetTop;
            } else {
                movedX -= canvas.offsetParent.offsetLeft;
                movedY -= canvas.offsetParent.offsetTop;
            }
            // Delete canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw object
            drawExternal();
            drawInternal();
        }
    }

    function onMouseUp(event) {
        pressed = 0;
        // If required reset position store variable
        if (autoReturnToCenter) {
            movedX = centerX;
            movedY = centerY;
        }
        // Delete canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw object
        drawExternal();
        drawInternal();
        //canvas.unbind('mousemove');
    }

    /******************************************************
     * Public methods
     *****************************************************/

    /**
     * @desc The width of canvas
     * @return Number of pixel width
     */
    this.GetWidth = function () {
        return canvas.width;
    };

    /**
     * @desc The height of canvas
     * @return Number of pixel height
     */
    this.GetHeight = function () {
        return canvas.height;
    };

    /**
     * @desc The X position of the cursor relative to the canvas that contains it and to its dimensions
     * @return Number that indicate relative position
     */
    this.GetPosX = function () {
        return movedX;
    };

    /**
     * @desc The Y position of the cursor relative to the canvas that contains it and to its dimensions
     * @return Number that indicate relative position
     */
    this.GetPosY = function () {
        return movedY;
    };

    /**
     * @desc Normalizzed value of X move of stick
     * @return Integer from -100 to +100
     */
    this.GetX = function () {
        return (100 * ((movedX - centerX) / maxMoveStick)).toFixed();
    };

    /**
     * @desc Normalizzed value of Y move of stick
     * @return Integer from -100 to +100
     */
    this.GetY = function () {
        return (100 * ((movedY - centerY) / maxMoveStick) * -1).toFixed();
    };

    /**
     * @desc Get the direction of the cursor as a string that indicates the cardinal points where this is oriented
     * @return String of cardinal point N, NE, E, SE, S, SW, W, NW and C when it is placed in the center
     */
    this.GetDir = function () {
        var result = "";
        var orizontal = movedX - centerX;
        var vertical = movedY - centerY;

        if (vertical >= directionVerticalLimitNeg && vertical <= directionVerticalLimitPos) {
            result = "C";
        }
        if (vertical < directionVerticalLimitNeg) {
            result = "N";
        }
        if (vertical > directionVerticalLimitPos) {
            result = "S";
        }

        if (orizontal < directionHorizontalLimitNeg) {
            if (result === "C") {
                result = "W";
            } else {
                result += "W";
            }
        }
        if (orizontal > directionHorizontalLimitPos) {
            if (result === "C") {
                result = "E";
            } else {
                result += "E";
            }
        }

        return result;
    };
};
