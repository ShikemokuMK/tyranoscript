tyrano.plugin.kag.view = {

    tyrano: null,
    kag: null,
    app: null,

    container: {},

    init: function () {

        var that = this;


    },

    //初期化の後
    complete_v_init: function (app) {

        this.app = app;
        //デフォルトコンテナの追加
        this.kag.view.addContainer("default");

    },

    //コンテナを追加する
    addContainer: function (name) {

        const cont = new PIXI.Container();
        cont.sortableChildren = true;

        this.app.stage.addChild(cont);

        this.container[name] = cont;

        return cont;

    },

    getContainer: function (name, make_cont = false) {

        if (!this.container[name]) {
            if (make_cont == true) {
                return this.addContainer(name);
            } else {
                this.kag.error("view_undefined_container", { "name": name });
                return null;
            }
        }

        return this.container[name];

    },

    //コンテナの状態変更
    modContainer: function (pm) {

        //コンテナがない場合はつくっていいよ。
        if (!this.container[pm.name]) {
            this.addContainer(pm.name);
        }

        if (!this.container[pm.name]) {
            this.kag.error("undefined_container", pm);
            return false;
        }

        if (pm.visible) {
            if (pm.visible == "true") {
                this.container[pm.name].visible = true;
            } else {
                this.container[pm.name].visible = false;
            }
        }
    },

    //コンテナを削除する
    deleteContainer: function (name) {
        delete this.container[name];
    },

    getObject: function (name, cont_name, make_cont = false) {

        let obj_cont = this.getContainer(cont_name, make_cont);

        if (!obj_cont.getChildByName(name)) {

            //更新が前提の場合はエラーを出す
            if (make_cont == false) {
                this.kag.error("view_undefined_object", { "name": name, "cont_name": cont_name });
            }

            return null;
        }

        return obj_cont.getChildByName(name);


    },

    //コンテナにオブジェクト追加
    addObject: function (obj, cont_name = "default") {

        if (!this.container[cont_name]) {
            this.addContainer(cont_name);
        }

        this.container[cont_name].addChild(obj);

    },

    //コンテナのオブジェクト表示
    showObject: function (name, cont_name = "default", time = 0, cb) {

        const obj = this.getObject(name, cont_name);
        if (time == 0) {
            obj.visible = true;
        } else {
            this.fadeTo(obj, 1, time, cb);
        }

    },

    hideObject: function (name, cont_name = "default", time = 0, cb) {

        this.getObject(name, cont_name).visible = false;

    },

    deleteObject: function (name, cont_name = "default") {

        let obj = this.getObject(name, cont_name);
        obj.parent.removeChild(obj);
        obj.destroy();

    },

    fadeIn: function (name, cont, time = 500, cb) {

        let obj = this.getObject(name, cont);
        obj.visible = true;
        obj.alpha = 0;

        //表示設定のアップデート
        this.kag.view.updateStat({
            "name": name,
            "cont": cont,
            "visible": "true"
        });


        this.fadeTo(obj, 1, time, cb);
    },

    fadeOut: function (name, cont, time = 500, cb) {

        let obj = this.getObject(name, cont);

        //表示設定のアップデート
        this.kag.view.updateStat({
            "name": name,
            "cont": cont,
            "visible": "false"
        });

        this.fadeTo(obj, 0, time, () => {
            obj.visible = false;
            if (cb) {
                cb()
            };
        });
    },

    //オブジェクトのフェードイン、アウト
    fadeTo: function (obj, targetAlpha, duration = 500, onComplete = null) {

        const startAlpha = obj.alpha;
        let elapsed = 0;

        const tick = (ticker) => {

            elapsed += ticker.deltaMS;

            let progress = elapsed / duration;
            if (progress > 1) progress = 1;

            obj.alpha = startAlpha + (targetAlpha - startAlpha) * progress;

            if (progress === 1) {
                this.app.ticker.remove(tick);
                if (onComplete) onComplete();
            }

        };

        this.app.ticker.add(tick);
    },


    setParam: function (obj, pm) {

        if (pm.name != "") obj.name = pm.name;

        if ($.isDefine(pm.x)) {
            obj.x = parseInt(pm.x);
        }

        if ($.isDefine(pm.left)) {
            obj.x = parseInt(pm.left);
        }

        if ($.isDefine(pm.y)) {
            obj.y = parseInt(pm.y);
        }

        if ($.isDefine(pm.top)) {
            obj.y = parseInt(pm.top);
        }

        if ((obj instanceof PIXI.Sprite)) {
            if (pm.width != "" && pm.height == "") {
                obj.scale.set(parseInt(pm.width) / obj.texture.width);
            } else if (pm.width == "" && pm.height != "") {
                obj.scale.set(parseInt(pm.height) / obj.texture.height);
            }
            else if (pm.width != "" && pm.height != "") {
                obj.width = parseInt(pm.width);
                obj.height = parseInt(pm.height);
            }
        }

        if ($.isDefine(pm.visible)) {
            if (pm.visible == "true") {
                obj.visible = true;
            } else {
                obj.visible = false;
            }
        }

        if ($.isDefine(pm.zindex)) {
            obj.zIndex = parseInt(pm.zindex);
        }

        return obj;

    },

    //アップデート用のステータスを追加
    updateStat: function (pm) {

        //名前が指定されてない場合はランダムなIDを割り振る
        if (pm.name == "") {
            pm.name = this.genId();
        }

        let cont = pm.cont;

        if (!this.kag.stat.view.cont[cont]) {
            this.kag.stat.view.cont[cont] = {};
        }

        if (!this.kag.stat.view.cont[cont][pm.name]) {
            this.kag.stat.view.cont[cont][pm.name] = {};
        }

        //未設定のものは排除する
        const filteredPm = Object.fromEntries(
            Object.entries(pm).filter(([key, value]) => value !== "")
        );

        this.kag.stat.view.cont[cont][pm.name] = {
            ...this.kag.stat.view.cont[cont][pm.name],
            ...filteredPm
        };

    },

    //イベントの登録
    updateEvent: function (pm) {

        let cont = pm.cont;

        if (!this.kag.stat.view.event[cont]) {
            this.kag.stat.view.event[cont] = {};
        }

        if (!this.kag.stat.view.event[cont][pm.name]) {
            this.kag.stat.view.event[cont][pm.name] = {};
        }

        this.kag.stat.view.event[cont][pm.name] = pm;

    },

    claerContainer: function () {


        removeChildren();

    },

    //Viewの復元
    loadView: function () {

        console.log("view の　復元");

        //コンテナを一度すべてクリアにする
        Object.entries(this.kag.stat.view.cont).forEach(([cont_key, cont_obj]) => {
            let cont_name = cont_key;
            this.getContainer(cont_name).removeChildren();
        });

        this.kag.ftag.startTag("v_config", {
            "zindex": this.kag.stat.view.config.zindex,
            "next": "false",
        });

        let array_tags = [];

        Object.entries(this.kag.stat.view.cont).forEach(([cont_key, cont_obj]) => {

            let cont_name = cont_key;

            //コンテナの作成
            Object.entries(this.kag.stat.view.cont[cont_name]).forEach(([obj_name, pm]) => {

                let tag = {
                    "tag": pm._tag,
                    "pm": {
                        ...pm,
                        _update: "false",
                        time: "0",
                    }
                };

                array_tags.push(tag);

            });

        });

        TYRANO.kag.ftag.startTags(array_tags, async () => {

            setTimeout(() => {

                //イベントの復元
                Object.entries(this.kag.stat.view.event).forEach(([cont_key, cont_obj]) => {

                    let cont_name = cont_key;

                    //コンテナの作成
                    Object.entries(this.kag.stat.view.event[cont_name]).forEach(([obj_name, pm]) => {

                        this.kag.ftag.startTag("v_event", {
                            ...pm,
                            _update: "false",
                        });

                    });

                });

            }, 10);

        });

    },

    genId: function () {

        return (
            Date.now().toString(36) +
            Math.random().toString(36).substring(2, 6)
        );

    },

    changeImage: async function (obj, url) {
        const texture = await PIXI.Assets.load(url);
        obj.texture = texture;
    },


    test: function () { },
};
