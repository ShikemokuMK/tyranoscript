
/*
 #[v_init]
 :group
 View
 :title
 ビューの初期化
 :exp
 ビューを初期化します。
[v_init]を使用するまでビュー関連の機能は使用できません。
first.ksなどで定義しておくと良いでしょう。
 :sample
 [v_init ]

 :param
 name=モデル名を指定します。省略した場合はmodel_idの値がnameに適応されます。,
 model_id=モデルIDを指定します。modelフォルダ以下に配置されたフォルダ名がモデルIDです。また、○○.model3.jsonなど関連するファイルもすべて同じ名前にします。,
 #[end]
*/


tyrano.plugin.kag.tag.v_init = {

    kag: TYRANO.kag,
    vital: [],

    pm: {

        height: "",
        width: "",

        next: "true"

    },

    start: async function (pm) {

        var that = this;

        let layer_view = this.kag.layer.getViewLayer();

        if (layer_view.find(".view_canvas").length != 0) {

            console.log("view 作成済み");
            TYRANO.kag.ftag.nextOrder();

        }

        let storage_url = "./tyrano/libs/view/pixi.min.js";
        $.getScript(storage_url, async () => {

            //pixi js 一番最初の実行
            //var layer = rpg_tyrano.layer;

            if (layer_view.find(".view_canvas").length == 0) {

                let html = `<div class="view_canvas" style="
                position:absolute;
                left:0; top:0;
            "></div>`;

                let j_view = $(html);

                if (pm.width == "") {
                    pm.width = TYRANO.kag.config.scWidth;
                }

                if (pm.height == "") {
                    pm.height = TYRANO.kag.config.scHeight;
                }

                j_view.css({
                    "width": parseInt(pm.width),
                    "height": parseInt(pm.height),
                });

                const app = new PIXI.Application();
                //this.kag.tmp.view.app = app;

                await app.init({
                    width: parseInt(pm.width),
                    height: parseInt(pm.height),
                    backgroundAlpha: 0,
                    preserveDrawingBuffer: true,
                    //backgroundColor: 0x1099bb,
                });

                j_view.append(app.canvas);

                layer_view.append(j_view);
                layer_view.show();

                this.kag.view.complete_v_init(app);


            }

            //_rpg_tyrano.tm = tyranolive2dplugin.getTyranoManager();

            if (pm.next == "true") {
                TYRANO.kag.ftag.nextOrder();
            }

        });


        //const r = await setupRpgSample(rpg_tyrano.app);


    }

};



/*
 #[v_image]
 :group
 View
 :title
 ビューに画像を表示
 :exp
 ビューに画像を表示することができます。
[v_init]を使用するまでビュー関連の機能は使用できません。
first.ksなどで定義しておくと良いでしょう。
 :sample
 [v_init ]

 :param
 name=モデル名を指定します。省略した場合はmodel_idの値がnameに適応されます。,
 model_id=モデルIDを指定します。modelフォルダ以下に配置されたフォルダ名がモデルIDです。また、○○.model3.jsonなど関連するファイルもすべて同じ名前にします。,
 #[end]
*/
tyrano.plugin.kag.tag.v_image = {

    vital: ["storage"],

    pm: {
        name: "",
        visible: "true",
        top: "",
        left: "",
        x: "",
        y: "",
        width: "",
        height: "",
        folder: "", //画像フォルダを明示できる

        zindex: "",

        cont: "default",

        _update: "false",
        next: "true",

        //"visible":"true"
    },

    start: function (pm) {

        var storage_url = "";
        var folder = "";
        var that = this;

        if (pm.folder != "") {
            folder = pm.folder;
        } else {
            folder = "fgimage";
        }

        //前景レイヤ
        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        } else {
            storage_url = "./data/" + folder + "/" + pm.storage;
        }

        if (pm._update == "false") {

            PIXI.Assets.load(storage_url)
                .then(texture => {

                    let sprite = new PIXI.Sprite(texture);

                    sprite = this.kag.view.setParam(sprite, pm);

                    //オブジェクトの追加
                    this.kag.view.addObject(sprite, pm.cont);

                    if (pm.next == "true") {
                        TYRANO.kag.ftag.nextOrder();
                    }

                });

        } else {

            let obj = this.kag.view.getObject(pm.name, pm.cont);

            this.kag.view.setParam(obj, pm);

            if (pm.storage != "") {
                this.kag.view.changeImage(obj, storage_url);
            }

            this.kag.view.setParam(obj, pm);

            if (pm.next == "true") {
                TYRANO.kag.ftag.nextOrder();
            }

        }

        //セーブ用の処理
        this.kag.view.updateStat(pm);

    }
};


tyrano.plugin.kag.tag.v_image_mod = {

    vital: ["name"],

    pm: {
        name: "",
        storage: "",
        visible: "",
        top: "",
        left: "",
        x: "",
        y: "",
        width: "",
        height: "",
        folder: "", //画像フォルダを明示できる

        zindex: "",

        cont: "default",

        _update: "true",

        //"visible":"true"
    },

    start: function (pm) {

        this.kag.ftag.startTag("v_image", pm);


    }
};

//テキスト配置
tyrano.plugin.kag.tag.v_text = {

    vital: ["text"],

    pm: {

        name: "",
        text: "", //テキスト領域のデフォルト値を指定するためですが、、、
        x: "",
        y: "",
        size: "",
        face: "", //フォントの種類 //fontFamily
        color: "",

        italic: "", //italic とか指定する
        bold: "", //bold とか指定する

        align: "",
        edge: "",
        shadow: "",
        time: "",
        width: "",
        zindex: "",

        visible: "",

        cont: "default",
        _update: "false",
        next: "true",

        //"visible":"true"
    },

    start: async function (pm) {

        const default_pm = {
            fontSize: 30,
            fill: "#ffffff",
            visible: "true",
        }

        if (pm._update == "false") {
            pm = $.extend(true, pm, default_pm);
        }

        let style_pm = {};

        if (pm.size != "") {
            style_pm.fontSize = parseInt(pm.size);
        }

        if (pm.color != "") {
            style_pm.fill = $.convertColor(pm.color);
        }

        if (pm.face != "") {
            await document.fonts.load('32px "dotfont"');
            style_pm.fontFamily = pm.face;
        }

        if (pm.bold != "") {
            if (pm.bold == "true") {
                pm.bold = "bold";
            }

            style_pm.fontWeight = pm.bold;

        }

        if (pm.italic != "") {

            if (pm.italic == "true") {
                pm.italic = "italic";
            }

            style_pm.fontStyle = pm.italic;

        }

        //テキストの作成
        let text = {};

        if (pm._update == "false") {
            text = new PIXI.Text({
                text: pm.text,
                style: style_pm
            });

            text = this.kag.view.setParam(text, pm);

            //オブジェクトの追加
            this.kag.view.addObject(text, pm.cont);


        } else {

            let text = this.kag.view.getObject(pm.name, pm.cont);

            if (pm.text != "") {
                text.text = pm.text;
            }

            //スタイルの上書き
            Object.entries(style_pm).forEach(([key, value]) => {
                text.style[key] = value;
            });

            text = this.kag.view.setParam(text, pm);

        }

        this.kag.view.updateStat(pm);

        if (pm.next == "true") {
            TYRANO.kag.ftag.nextOrder();
        }

    }
};


tyrano.plugin.kag.tag.v_text_mod = {

    vital: ["name"],

    pm: {

        name: "",
        _update: "true",

        //"visible":"true"
    },

    start: async function (pm) {

        //アップデート用
        this.kag.ftag.startTag("v_text", pm);

        //TYRANO.kag.ftag.nextOrder();

    }
};

tyrano.plugin.kag.tag.v_config = {

    vital: [],

    pm: {

        zindex: "",
        visible: "",
        click_event: "", // ティラノ側のイベントを透過するかどうか

        next: "true",

        //"visible":"true"
    },

    start: function (pm) {

        let layer_view = this.kag.layer.getViewLayer();

        if (pm.zindex != "") {

            if (pm.zindex == "back") {
                pm.zindex = "9";
            } else if (pm.zindex == "mask") {
                pm.zindex = "10000000";
            }

            layer_view.css("z-index", parseInt(pm.zindex));

        }

        if (pm.visible != "") {
            if (pm.visible == "true") {
                layer_view.css("display", "");
            } else {
                layer_view.css("display", "none");
            }
        }

        if (pm.click_event != "") {
            if (pm.click_event == "true") {
                layer_view.find("canvas").css("pointer-events", "none");
                layer_view.css("pointer-events", "none");

            } else if (pm.click_event == "false") {
                layer_view.find("canvas").css("pointer-events", "");
                layer_view.css("pointer-events", "");
            }
        }



        //基本的なビューの設定
        this.kag.stat.view.config = pm;

        if (pm.next == "true") {
            TYRANO.kag.ftag.nextOrder();
        }
    }
};

//イベント登録
tyrano.plugin.kag.tag.v_event = {

    vital: ["name", "storage", "target"],

    pm: {
        name: "",
        cont: "default",

        storage: "",
        target: "",

        type: "click",

        next: "true",

        //"visible":"true"
    },

    start: function (pm) {

        //イベント登録、クリックされた場合、callを呼び出すような仕組みを
        let obj = this.kag.view.getObject(pm.name, pm.cont);

        obj.eventMode = 'static'; // v7以降（推奨）
        obj.cursor = 'pointer';   // カーソルを手に

        // ② クリックイベント
        let event_type = "pointerdown";
        if (pm.type == "click") {
            event_type = "pointerdown";
        }

        obj.on('pointerdown', (event) => {
            console.log('クリックされた！');
            console.log(event);

            this.kag.ftag.startTag("call", {
                storage: pm.storage,
                target: pm.target,
                auto_next: "stop",
            });


        });

        //イベントの登録
        this.kag.view.updateEvent(pm);

        if (pm.next == "true") {
            TYRANO.kag.ftag.nextOrder();
        }

    }
};


tyrano.plugin.kag.tag.v_cont = {

    vital: [],

    pm: {

        name: "default",
        visible: "",
        event_mode: "",

        //"visible":"true"
    },

    start: function (pm) {

        this.kag.view.modContainer(pm);

        TYRANO.kag.ftag.nextOrder();

    }
};




tyrano.plugin.kag.tag.v_obj_show = {

    vital: ["name"],
    pm: {
        name: "",
        cont: "default",
        time: "0",
        wait: "false",
    },

    start: function (pm) {

        if (pm.time == "0") pm.wait = "false";

        if (pm.wait == "true") {
            this.kag.view.fadeIn(pm.name, pm.cont, parseInt(pm.time), () => {
                TYRANO.kag.ftag.nextOrder();
            });
        } else {
            this.kag.view.fadeIn(pm.name, pm.cont, parseInt(pm.time));
            TYRANO.kag.ftag.nextOrder();
        }

    }
};

tyrano.plugin.kag.tag.v_obj_hide = {

    vital: ["name"],

    pm: {

        name: "",
        cont: "default",
        time: "0",
        wait: "false",

    },

    start: function (pm) {

        if (pm.time == "0") pm.wait = "false";

        if (pm.wait == "true") {
            this.kag.view.fadeOut(pm.name, pm.cont, parseInt(pm.time), () => {
                TYRANO.kag.ftag.nextOrder();
            });
        } else {
            this.kag.view.fadeOut(pm.name, pm.cont, parseInt(pm.time));
            TYRANO.kag.ftag.nextOrder();
        }

    }
};

tyrano.plugin.kag.tag.v_obj_delete = {

    vital: ["name"],

    pm: {

        name: "",
        cont: "default",

    },

    start: function (pm) {

        this.kag.view.deleteObject(pm.name, pm.cont);

        TYRANO.kag.ftag.nextOrder();

    }
};



/*
#[v_bg]

:group
ビュー関連

:title
背景の設定

:exp
背景の切り替えを簡易的に実行できます。

:sample
[v_bg storage=fg0.png time=1500 wait=true]

:param
storage  = 画像ファイル名を指定します。ファイルは`data/bgimage`に配置してください,
time    = 背景の切り替えにかける時間をミリ秒で指定します。,
wait    = 背景の切り替えを待つかどうか。`true`または`false`で指定します。`false`を指定すると、切り替えの完了を待たずに次のタグに進みます。,

#[end]
*/

//背景変更
tyrano.plugin.kag.tag.v_bg = {
    vital: ["storage"],

    pm: {
        name: "bg",
        storage: "",
        folder: "bgimage",
        wait: "true",
        time: "1000",
    },

    start: function (pm) {

        if (pm.time == "0") pm.wait = "false";

        //現在の背景画像の要素を取得
        var storage_url = "./data/bgimage/" + pm.storage;
        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        }

        pm.zindex = "-1";
        pm.x = "0";
        pm.y = "0";

        pm.width = this.kag.view.app.screen.width;
        pm.height = this.kag.view.app.screen.height;

        this.kag.ftag.startTag("v_image", pm);


    },
};


