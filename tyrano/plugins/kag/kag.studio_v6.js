//ティラノスタジオ用のクラス
//デバッグツール向けの処理が集中します。

tyrano.plugin.kag.studio = {
    app: {}, //ライダー側のルート
    tyrano: null,
    rider_view: {},
    ipc: {},

    flag_push_console: true,
    last_push_console_obj: {},

    map_watch: {},

    init: function () {
        //alert("init rider");

        if (window.navigator.userAgent.indexOf("TyranoStudio") != -1) {
            //スタジオ拡張用。iframeで読み込んだときの対応
            
            try {
                this.ipc = window.studio_api;
            } catch (e) {
                return false;
            }

            TYRANO.kag.is_studio = true;
            
            this.ipc = window.studio_api;
            
            console.log(this.ipc);

            //キャラの情報をアップデートする
            setInterval((e) => {
                let charas = this.kag.stat.charas;
                this.send("chara-update-charas", charas);
            }, 5000);

            //リロードボタンの配置
            var j_reload_button = $(
                "<div style='position:absolute;z-index:999999999;padding:10px;opacity:0.8;background-color:white;left:0px;top:0px'><button style='cursor:pointer'><span style=''>" +
                    $.lang("reload") +
                    "</span></button></div>",
            );
            j_reload_button.draggable({
                scroll: false,
                //containment:".tyrano_base",
                stop: (e, ui) => {},
            });

            j_reload_button.find("button").on("click", (e) => {
                location.reload();
            });

            $("body").append(j_reload_button);

            ////////////////

            //初期化
            this.send("init-variable", {});
        }

        //ユーザーエージェントに TyranoStudio があるかどうかで判定する
        /*
        ipcRenderer.on('ping', (event, arg) => {
            console.log(arg) // pong
        })
        */
    },
    
    trigger(cmd, arg) {
        
        if (cmd == "ping") {
        
            this.send("asynchronous-reply", JSON.stringify(arg));
            
        } else if (cmd == "variable-add") {
            
            let data = JSON.parse(arg);
            let array_name = data["names"];

            for (let i = 0; i < array_name.length; i++) {
                let name = array_name[i]["name"];

                let val = "" + this.kag.embScript(name);

                this.map_watch[name] = val;

                array_name[i]["val"] = val;
            }

            data["names"] = array_name;

            this.send("changed-variable", data);
            
        } else if (cmd=="status-clear-save-data") {
        
            localStorage.clear();
        
        } else if (cmd == "status-load-save") {
            
            let data = JSON.parse(arg);
            let slot = data["slot"];

            var timer_id = setInterval(() => {
                //strongstop 担った瞬間にロードする
                if (this.kag.stat.is_strong_stop == true) {
                    clearInterval(timer_id);
                    this.kag.menu.loadGame(slot);
                }
            }, 100);
            
        } else if (cmd == "exe-tag") {
            
            let data = JSON.parse(arg);
            let tag_text = data["tag_text"];

            this.cutTyranoScript(tag_text);
            
        } else if (cmd == "material-preview-position") {
            
            let data = JSON.parse(arg);

            let file = data["file"];
            let category = data["category"];

            this.insertElement(category, file);
            
        } else if (cmd == "variable-add-all") {
            
            var map_variable = TYRANO.kag.variable;

            var f = TYRANO.kag.stat.f;
            var mp = TYRANO.kag.stat.mp;

            map_variable.f = f;
            map_variable.mp = mp;

            this.send("init-variable-all", map_variable);
            
        } else if (cmd=="") {
        } 
        
    },

    insertElement: function (category, file) {
        
        var path = "./data/" + category + "/" + file;

        if (category == "fgimage" || category == "image") {
            var j_img = $(
                "<div style='position:absolute;z-index:9999999999;'><div class='area_pos' style='position:absolute;width:100px;opacity:0.5;background-color:black;color:white'></div><div class='button_delete' style='position:absolute;right:0px;border:solid 1px gray;background-color:white;width:20px;height:20px;cursor:pointer' >×</div><img style='width:100%;border:solid 1px green;' src='" +
                    path +
                    "' /></div>",
            );

            (() => {
                var _j_img = j_img;
                var _category = category;
                var _file = file;
                
                j_img.on("mousedown", (e) => {
                    TYRANO.kag.tmp.three.stat.fps.stop_eye_move = true;
                });

                j_img.on("mouseup", (e) => {
                    TYRANO.kag.tmp.three.stat.fps.stop_eye_move = false;
                });

                j_img.draggable({
                    scroll: false,
                    //containment:".tyrano_base",
                    stop: (e, ui) => {
                        //j_x.html(ui.position.left);
                        //j_y.html(ui.position.top);
                        let left = Math.floor(ui.position.left);
                        let top = Math.floor(ui.position.top);

                        _j_img.find(".area_pos").html("x:" + left + " y:" + top);

                        let obj = {
                            left: left,
                            top: top,
                        };

                        this.send("material-update-pos", obj);

                        //タグのプレビューがここに表示される
                        //元に渡す
                    },
                });

                j_img.resizable({
                    aspectRatio: true,
                    handles: "all",
                    resize: (e, ui) => {
                        var target = $(e.target);
                        var width = parseInt(target.css("width"));
                        var height = parseInt(target.css("height"));

                        let obj = {
                            width: width,
                            height: height,
                        };

                        this.send("material-update-size", obj);

                        //j_text_width.val(that.map_anim["width"]);
                        //j_text_height.val(that.map_anim["height"]);
                    },
                });

                _j_img.find(".button_delete").click(function () {
                    _j_img.remove();
                });

                //ドラッグを出来るように
                $(".tyrano_base").attr("ondragstart", "");
                $(".tyrano_base").append(_j_img);
            })();
        } else if (category == "bgimage") {
            //背景画像変更
            var j_new_bg = TYRANO.kag.layer.getLayer("base", "fore");
            j_new_bg.css("background-image", "url(" + path + ")");
        }
    },

    send: function (key, json_obj) {
        
        
        if (window.opener) {
            window.opener.window.app.project.triggerIpc(key, json_obj);
        }
        //普通に親の関数呼び出しでいいよ。
        //親
        //console.log(json_obj);
        //window.opener.window.app.project.triggerIpc(key, json_obj);
        //this.ipc.ipcRenderer.send(key, JSON.stringify(json_obj));
    
    },

    notifyChangeVariable: function () {
        let data = {};
        let array_name = [];

        for (let key in this.map_watch) {
            if (typeof this.map_watch[key] == "undefined") {
                this.map_watch[key] = "";
            }

            let val = this.kag.embScript(key);

            this.map_watch[key] = val;
            array_name.push({ name: key, val: val });
        }

        data["names"] = array_name;

        this.send("changed-variable", data);
    },

    pushConsole: function (obj) {
        this.last_push_console_obj = obj;

        if (this.flag_push_console == true) {
            this.flag_push_console = false;
            setTimeout((e) => {
                this.flag_push_console = true;
                this.send("replay-console", this.last_push_console_obj);
            }, 1000);
        }
    },

    //完了時に入ってくる
    complete: function (TG) {
        let array_save = TG.kag.menu.getSaveData();

        let init_data = {
            array_save: array_save,
        };

        this.send("load-complete", init_data);
    },

    cutTyranoTag: function (tag, pm) {
        TYRANO.kag.ftag.startTag(tag, pm);
    },

    cutTyranoScript: function (str) {
        var result = TYRANO.kag.parser.parseScenario(str);

        var array_s = result.array_s;
        for (var i = 0; i < array_s.length; i++) {
            var tag = array_s[i];
            this.cutTyranoTag(tag.name, tag.pm);
        }
    },
};
