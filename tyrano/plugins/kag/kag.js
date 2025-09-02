tyrano.plugin.kag = {
    version: 520,
    tyrano: null,
    kag: null,
    sound_swf: null,

    lang: "", //言語設定
    map_lang: {},    //言語設定のマップ

    is_rider: false, //ティラノライダーからの起動かどうか
    is_studio: false, //ティラノスタジオからの起動かどうか

    save_key_id: "",
    save_key_val: "", //セーブデータ用のキー

    cache_html: {},
    cache_scenario: {},

    event_listener_map: {},

    //セーブ時に保存する属性ホワイトリスト
    array_white_attr: [
        "id",
        "src",
        "name",
        "width",
        "height",
        "data-event-tag",
        "data-event-pm",
        "data-event-target",
        "data-event-storage",
        "data-restore",
        "tabindex",
        "l_visible",
        "data-parent-layer",
        "data-video-name",
        "data-video-pm",
        "data-effect",
        "data",
        "type",
    ],

    config: {
        defaultStorageExtension: "jpg",
        projectID: "tyranoproject",
        game_version: "0.0",
        preload: "on",
        skipSpeed: "30",
        patch_apply_auto: "true",
        mediaFormatDefault: "ogg",
        configSave: "webstorage",
        configSaveOverwrite: "false",
    }, //読み込んできた値 Config.tjs の値

    //変更されることが無い静的な値
    define: {
        TYRANO_ENGINE_VERSION: 520,
        BASE_DIV_NAME: "tyrano_base",
        FLAG_APRI: false,
    },

    //各種変数
    variable: {
        //f:{},//ゲーム変数 stat に移動
        sf: {}, //システム変数
        tf: {}, //一時変数
        //mp:{}//マクロに引き渡された変数がココに入る
    },

    //一時保存オブジェクト
    tmp: {
        checking_macro: false, //マクロの登録時はスタックにつまれない

        ready_audio: false, //スマホブラウザ向け。オーディオ初期化を終えたか否か
        audio_context: false, //オーディオコンテキスト。起動時一回のみ生成
        num_anim: 0, //実行中のアニメーションスタック
        map_bgm: {}, //再生中の音楽オーディオ
        map_se: {}, //再生中の効果音

        sleep_game: null, //sleepgame中はここにスナップが入る
        sleep_game_next: false, //awakegame時に次へNextOrderするか否か。

        base_scale: 1,

        is_se_play: false, //seがプレイ中か否か
        is_se_play_wait: false, //seの終了を待ってるかどうか。

        is_vo_play: false, //ボイス再生中か否か
        is_vo_play_wait: false, //ボイスの終了を待ってるかどうか。

        is_bgm_play: false, //BGMがプレイ中か否か
        is_bgm_play_wait: false, //BGMの完了を待っているか否か。

        loading_make_ref: false,

        cut_nextorder: null,

        wait_id: "", //waitをキャンセルするために使います。

        map_chara_talk_top: {}, //キャラトークのアニメーション中、開始のトップ位置を保持します。

        camera_stream: false, //カメラストリームが有効化否か

        video_playing: false,

        angle: 0, //スマホの場合盾持ちか否か。0なら盾持ち。
        largerWidth: false, // 横幅の方が大きければ

        three: {
            stat: {
                is_load: false,
                canvas_show: false,
                start_event: true,

                animation_loop: true,

                scene_pm: {}, //シーン情報の設定
                init_pm: {}, //初期設定のpm

                gyro: {
                    pm: {},
                    x: 0,
                    y: 0,
                    enable: -1,
                    mode: 0,
                },

                fps: {
                    active: false,

                    movementSpeed: 300,
                    rotateSpeed: 0.5,

                    tmpMoveBuffer: 0,
                    tmpRotateBuffer: 0,

                    offMoveBufferF: false,
                    offMoveBufferB: false,
                    offRotateBufferL: false,
                    offRotateBufferR: false,
                    
                    moveUp: false,
                    moveDown: false,


                    is_colid: false,

                    moveForward: false,
                    moveBackward: false,
                    rotateLeft: false,
                    rotateRight: false,

                    memory_pos: { x: 0, y: 0, z: 0 },

                    ground: "",
                    is_fps_studio: false,

                    isJoy: false,
                    camera_pos_y: 40,

                    fps_rate: 0,

                    move_trans_control: false,
                    
                    stop_eye_move: false,
                    enable_move_updown: true, //上下の高さ移動
                },
            },

            groups: {},
            models: {},
            evt: {},
        },

        preload_audio_map: {},
        preload_objects: [],
        preload_complete_callbacks: [],
        
        popopo: {
            key: "",
            player: null,
        },

        mode_effect: {
            pc: {
                skip: null,
                auto: null,
                stop: null,
                holdskip: null,
                holdstop: null,
            },
            phone: {
                skip: null,
                auto: null,
                stop: null,
                holdskip: null,
                holdstop: null,
            },
        },
    },

    //逐次変化するKAGシステムの動作に必要な状況変化ファイル
    //セーブデータなどは保存する必要ありますよ
    //文字列データしか入れちゃダメ

    stat: {
        map_label: {}, //ラベル情報保持
        map_macro: {}, //マクロの情報保持

        vertical: "false", //縦書き

        f: {}, //ゲーム変数はstatの中
        mp: {}, //マクロもstat

        current_layer: "message0", //現在のメッセージレイヤ
        current_page: "fore",
        is_stop: false, //停止中。クリックしても先に進ませない
        is_wait: false, //wait中。
        is_trans: false, //trans中

        is_wait_anim: false, //[wa]中

        is_strong_stop: false, // [s]タグで立ち止まってる状態。強力な停止中。解除するにはジャンプやマクロが呼び出せれる
        strong_stop_recover_index: 0, //[s]タグ指定中に保存した場合、戻ってくるindex [_s]時のindexを保持しておく

        is_nowait: false, //ノーウェイト、テキスト瞬間表示状態

        current_message_str: "ゲームスタート", //現在表示中のメッセージ
        current_save_str: "", //セーブの時に使用するメッセージ

        current_keyframe: "", //キーフレームの名前、スタートしている場合はキーフレーム名が入る
        map_keyframe: {}, //キーフレームアニメーション情報を登録

        is_script: false, //スクリプト解析中。
        buff_script: "", //スクリプトを格納しておく

        is_html: false, //htmlタグ解析中
        map_html: {}, //htmlタグに関するステータス

        cssload: {}, //読み込んだCSSを保持する

        save_img: "", //セーブイメージ。ここにパスが入っている場合はその画像をサムネに使う。

        stack: { if: [], call: [], macro: [] }, //if文のスタック

        set_text_span: false, //メッセージ中のspanを新しく作成するときに真にする
        current_scenario: "first.ks", //シナリオファイルを指定する
        is_skip: false,
        is_auto: false,
        current_bgm: "", //現在再生中のBGM
        current_bgm_vol: "", //現在再生中のBGMボリューム
        current_bgm_html5: "false", //現在再生中のhtml5パラメータ

        current_bgm_base64: "", //現在再生中のBGMがbase64エンコードされているかどうか。されている場合はファイル形式が格納される。(mp3 ogg etc)

        current_bgm_pause_seek: "", //ポーズ中ならその時間が入る。ポーズ中じゃない場合は空白

        current_se: {}, //現在再生中のループ効果音

        load_auto_next: false, // ロード時にオートネクストするかどうか。showsave周りのときtrueになる。

        current_bgcamera: "", //bgcamerの有効性

        enable_keyconfig: true, //キーコンフィグが有効 or 無効

        current_bgmovie: {
            storage: "",
            volume: "",
        }, //再生中の背景動画

        current_camera: {},
        current_camera_layer: "",

        is_move_camera: false, //カメラの演出中かどうか
        is_wait_camera: false, //カメラの演出を待ってるかどうか

        current_line: 0, //実行中の命令の実際のファイル行　エラーや警告時に使用

        is_hide_message: false, //メッセージエリアが非表示状態か否か

        is_click_text: false, //テキストメッセージがクリックされた常態化否か
        is_adding_text: false, //テキストメッセージを追加中か否か

        flag_ref_page: false, //このフラグが立っている場合、次のクリックで画面がクリアされます。

        ruby_str: "", //ここに文字列が入っている場合は、次の１文字出力時にルビとして適応する

        mark: 0, //マーカーを引いてるときはここに1 が入る。 マーカー終了まちは2
        style_mark: "", //マーカーのスタイルをテキストでもつ。

        ch_speed: "", //文字表示スピード

        skip_link: "true", //選択肢のあと、スキップを継続するかどうか。

        log_join: "false", //特定のタグの時に、ログが分裂しないようにするため。trueなら前のログに連結させる
        log_clear: false, // p cm などの文字クリアの時は、強制的に次のログ追加をjoinではなく、addにする

        f_chara_ptext: "false",

        flag_glyph: "false", //クリック待ちボタンが指定されているか否か
        path_glyph: "nextpage.gif", //glyph画像ファイル名

        current_cursor: "auto", //現在のカーソル指定
        use_close_confirm: false,

        //表示フォント指定
        font: {
            enable: false,
            color: "",
            bold: "",
            size: "",
            face: "",
            italic: "",
            effect: "",
            effect_speed: "0.2s",
            edge_method: "shadow",
        },

        //qr系の設定
        qr: {
            mode: "off",
            define: {},
        },

        //表示位置調整
        locate: {
            x: 0,
            y: 0,
        },

        //リセットされた時に適応されるオリジナルフォント設定
        default_font: {
            color: "",
            bold: "",
            size: "",
            face: "",
            italic: "",
            edge: "",
            shadow: "",
            effect: "",
            effect_speed: "",
            edge_method: "shadow",
        },

        //ふきだしで使用するパラメータ郡
        fuki: {
            def_style: {}, //ポジションで指定されたスタイルを保持する
            def_style_inner: {},
            def_pm: {}, //positionで指定されたパラメータを保持する
            active: false,
            marginr: 0,
            marginb: 0,

            others_style: {},
        },
        
        popopo:{
            volume: "default",
            time: 0.02,
            tailtime: 0.03,
            frequency: 0,
            octave: 0,
            interval: 80,
            type: "sine",
            mode: "everyone",
            buf: "0",
            storage: "none",
            samplerate: 44000,
            noplaychars: "…・、。「」（）　 "
        },
        
        popopo_chara: {},

        //システム系で使用するHTMLの場所を保持
        sysview: {
            save: "./tyrano/html/save.html",
            load: "./tyrano/html/load.html",
            backlog: "./tyrano/html/backlog.html",
            menu: "./tyrano/html/menu.html",
        },

        /*** キャラクター操作系 ***/
        //キャラクターの立ち位置を自動的に調整する事ができます
        chara_pos_mode: "true",
        chara_effect: "swing",
        chara_ptext: "",
        chara_time: "600",
        chara_memory: "false",
        chara_anim: "true", //キャラクター追加時、位置が変わる場合にアニメーションで表示するか否か
        pos_change_time: "600", //キャラクター自動配置のスピード

        chara_last_zoom_name: "", //最後にズーム処理したキャラクターの名前

        chara_talk_focus: "none",
        chara_brightness_value: "60",
        chara_blur_value: "2",

        chara_talk_anim: "none", //キャラクターが話す時にアニメーションするかどうか
        chara_talk_anim_time: 230,
        chara_talk_anim_value: 30,
        chara_talk_anim_zoom_rate: 1.2,

        apply_filter_str: "",

        video_stack: null,
        is_wait_bgmovie: false,

        //定義されたキャラクター情報
        charas: {},
        jcharas: {},

        play_bgm: true, //BGMを再生するか否か
        play_se: true, //SEを再生するか否か

        play_speak: false, // 読み上げを行うか否か

        map_se_volume: {}, //セーブスロットごとにボリューム値を保持できる
        map_bgm_volume: {}, // 同上

        //ボイス周りの設定 vocoinfig
        map_vo: {
            vobuf: {}, //ボイスとして指定するplayseのbuf
            vochara: {}, //キャラ毎にボイスの設定が入る。
        },
        vostart: false, //vo管理が有効か否か

        log_write: true, //バックログを記録するか否か

        buff_label_name: "", //ラベル管理のもの、通過時にここに配置されて次にlabelに到達した時に記録される

        already_read: false, //現在の場所が既読済みか否かを保持する。ラベル通過時に判定

        visible_menu_button: false, //メニューボタンの表示状態

        resizecall: {
            storage: "",
            target: "",
        },

        vchat: {
            is_active: false,
            chara_name_color: "0x70c7ff", //キャラネーム欄の色
            max_log_count: 200, //最大ログ数。200を超えると削除されていく
            charas: {}, //キャラ一覧
        },

        message_config: {},
        word_nobreak_list: [],

        lipsync_buf_chara: {},
        
        checkpoint: {},

        title: "", //ゲームのタイトル

    }, //ゲームの現在の状態を保持する所 状況によって、いろいろ変わってくる

    init: function () {
        
        this.kag = this;

        var that = this;

        this.tyrano.test();

        //二重起動チェック ElectronかつTyranoStudioからの起動じゃない場合
        if ($.isElectron() && window.navigator.userAgent.indexOf("TyranoStudio") == -1) {
            //if (!require("electron").remote.app.requestSingleInstanceLock()) {
            if (!window.studio_api.ipcRenderer.sendSync("doubleCheck", {})) {
                alert($.lang("double_start"));
                window.close();
                if (typeof navigator.app != "undefined") {
                    navigator.app.exitApp();
                }
            }
        }

        //コンフィグファイルの読み込み
        this.parser.loadConfig(function (map_config) {
            that.config = $.extend(true, that.config, map_config);

            that.checkUpdate(function () {
                that.init_game(); //ゲーム画面生成
            });
        });

        //アプリか否かの設定
        $("script").each(function () {
            if ($(this).attr("src")) {
                if ($(this).attr("src").indexOf("cordova") != -1 || $(this).attr("src").indexOf("phonegap") != -1) {
                    that.define.FLAG_APRI = true;
                }
            }
        });

        //ティラノプレイヤーを使ってるなら
        if (typeof TyranoPlayer == "function") {
            this.tmp.ready_audio = true;
        } else if ($.isNWJS()) {
            this.tmp.ready_audio = true;
        }

        //audio contextを設定　１回のみ実行
        var AudioContext =
            window.AudioContext || // Default
            window.webkitAudioContext || // Safari and old versions of Chrome
            false;

        if (AudioContext) {
            this.tmp.audio_context = new AudioContext();
        }

        //フラッシュの設定
        try {
            var browser = $.getBrowser();
            //音楽再生にFLASHは関係なくなった
            /*
            if(browser == "firefox" || browser =="opera" || (browser =="safari" && $.userenv()=="pc" ) ){

                if($.isFlashInstalled() != true){
                    alert("FLASHがインストールされていないため、音楽が再生されません。");
                }else{
                    this.kag.sound_swf = $.swfName("externalnovelsound");
                }

            }
            */
        } catch (e) {
            console.log(e);
        }
    },

    //ローカルにアップデート用のファイルがある場合は、確認する
    checkUpdate: function (call_back) {
        //NWJS環境以外では、アップデート不可
        if (!$.isNWJS() && !$.isElectron()) {
            call_back();
            return;
        }

        //自動反映が無効の場合は反映しない
        if (this.kag.config.patch_apply_auto == "false") {
            call_back();
            return;
        }

        var patch_path = $.localFilePath();
        var that = this;

        patch_path = patch_path + "/" + this.kag.config.projectID + ".tpatch";

        this.applyPatch(patch_path, "true", call_back);
    },

    //パッチを反映します。
    applyPatch: function (patch_path, flag_reload, call_back) {
        //アップデートファイルの存在チェック
        var fs = window.studio_api.fs;

        if (!fs.existsSync(patch_path)) {
            call_back();
            return;
        }

        var fse = window.studio_api.fs;
        var _path = window.studio_api.path;
        //リロードの場合は、アップデート不要

        var unzip_path = $.getUnzipPath();

        //asar化している場合は上書きできない
        if (unzip_path == "asar") {
            const asar = window.studio_api.asar;

            let path = process.__dirname;

            //let asar_files = fs.readdirSync(path);

            let out_path = $.localFilePath();

            if (process.platform == "darwin") {
                alert("パッチを適応するゲーム実行ファイル（.app）の場所を選択してください。");

                //実行パスを選択させる
                //let dialog = require("electron").remote.dialog;
                
                let filenames = window.studio_api.ipcRenderer.sendSync("showSelectFileDialog",
                    {
                        prop: ["openFile"],
                        title: "パッチを適応するゲームの実行ファイル（app）を選択してください。",
                        filters: [{ name: "", extensions: ["app"] }],
                    }
                );
                
                console.log(filenames);
        
                /*
                let filenames = dialog.showOpenDialogSync(null, {
                    prop: ["openFile"],
                    title: "パッチを適応するゲームの実行ファイル（app）を選択してください。",
                    filters: [{ name: "", extensions: ["app"] }],
                });
                */

                if (typeof filenames == "undefined") {
                    alert("パッチの適応を中止します");
                    call_back();
                    return;
                }

                path = filenames.filepath + "/Contents/Resources/app.asar";
                out_path = out_path + "/";
            } else {
                out_path = out_path + "/";
            }

            fse.mkdirSync(_path.resolve(out_path + "/update_tmp"));

            (async () => {
                await asar.extractAll(_path.resolve(path), _path.resolve(out_path + "/update_tmp/"));
            })();

            //ファイル全部コピーする
            var AdmZip = window.studio_api.admzip;

            // reading archives  ファイルを上書きしている。
            var zip = new AdmZip(patch_path);

            //console.log(_path.resolve(out_path + "update_tmp/"));

            zip.extractAllTo(_path.resolve(out_path + "update_tmp/"), true);

            const src = _path.resolve(out_path + "update_tmp/");
            const dest = _path.resolve(path);

            (async () => {
                await asar.createPackage(src, dest);

                $.alert($.lang("apply_patch_complete"), function () {
                    //パッチの削除。
                    fse.removeSync(_path.resolve(patch_path));

                    //作業ディレクトリ削除
                    fse.removeSync(_path.resolve(out_path + "update_tmp"));

                    window.close();
                });
            })();

            return;
        } else {
            const AdmZip = window.studio_api.admzip; 

            var path = window.studio_api.path; 
            var abspath = path.resolve("./");

            // reading archives
            const zip = new AdmZip(patch_path);
            zip.extractAllTo(unzip_path + "/update_tmp", true);

            //ファイルを上書きしている
            fse.copySync(unzip_path + "/update_tmp/", unzip_path + "/");
            fse.removeSync(unzip_path + "/update_tmp");

            //パッチの削除。
            fse.removeSync(patch_path);

            $.alert("パッチを適応しました。再起動します。", function () {
                location.reload();
            });

            //アップデートしたという証用
            /*
            if(flag_reload == "true"){
                fs.writeFileSync(unzip_path+"/updated","true");
                location.reload();
            }else{
                call_back();
            }
            */
        }
    },

    //スクリプトを解釈して実行する
    evalScript: function (str) {
        var TG = this;

        var f = this.stat.f;
        var sf = this.variable.sf;
        var tf = this.variable.tf;
        var mp = this.stat.mp;

        try {
            eval(str);
            this.saveSystemVariable();
        } catch (e) {
            console.error(e);
            this.warning(e, true);
        }

        /*
        if(this.kag.is_rider){
            this.kag.rider.pushVariableGrid();
        }
        */

        if (this.kag.is_studio) {
            this.kag.studio.notifyChangeVariable();
        }
    },

    //式を評価して値を返却します
    embScript: function (str, preexp) {

        try {
            var f = this.stat.f;
            var sf = this.variable.sf;
            var tf = this.variable.tf;
            var mp = this.stat.mp;

            return eval("(" + str + ")");

        } catch (e) {

            try {
                return eval(str);
            } catch (e) {
                return undefined;
            }
        }
    },

    removeSaveData: function () {
        const project_id = this.kag.config.projectID;
        const type = this.kag.config.configSave;
        const suffixes = ["_sf", "_tyrano_data", "_tyrano_quick_save", "_tyrano_auto_save"];
        for (const suffix of suffixes) {
            const key = project_id + suffix;
            $.removeStorage(key, type);
        }
    },

    //システム変数を保存する
    saveSystemVariable: function () {
        $.setStorage(this.kag.config.projectID + "_sf", this.variable.sf, this.kag.config.configSave);

        // ティラノイベント"storage-sf"を発火
        this.kag.trigger("storage-sf");
    },

    //すべての変数クリア
    clearVariable: function () {
        this.stat.f = {}; //ゲーム変数
        this.variable.sf = {}; //システム変数

        //添付のシステムだけは残す
        this.clearTmpVariable();
        this.saveSystemVariable();
    },

    //添付変数の削除
    clearTmpVariable: function () {
        var tmp_sys = this.kag.variable.tf["system"];
        this.kag.variable.tf = {}; //一時変数かな
        this.kag.variable.tf["system"] = tmp_sys;
    },

    ///スタック管理用
    pushStack: function (name, flag) {
        this.stat.stack[name].push(flag);
    },

    popStack: function (name) {
        return this.stat.stack[name].pop();
    },

    getStack: function (name) {
        return this.stat.stack[name][this.stat.stack[name].length - 1];
    },

    setStack: function (name, flag) {
        this.stat.stack[name][this.stat.stack[name].length - 1] = flag;
    },

    endStorage: function () {
        //ファイルの終端に来た時、スタックがたまってたらそこに戻らせる
        var pm = this.kag.getStack("call"); //最新のコールスタックを取得
        //呼び出し元に戻る

        if (pm == null) {
            //console.log("---------終端---------");
            //this.kag.error("シナリオの終端まで、きてしまいました");
            return false;
        }

        this.kag.popStack("call"); //スタックを奪い取る
        this.kag.ftag.nextOrderWithIndex(pm.index, pm.storage);
    },

    /////////////ゲーム初期化////////////

    init_game: function () {
        var that = this;

        //kag.parser 追加
        this.parser = object(tyrano.plugin.kag.parser);
        this.parser.kag = that;

        //kag.tag追加 tagが全部星している
        this.ftag = object(tyrano.plugin.kag.ftag);
        this.ftag.kag = that;
        this.ftag.init();

        //layer 追加
        this.layer = object(tyrano.plugin.kag.layer);
        this.layer.kag = that;
        this.layer.init();

        //menu 追加
        this.menu = object(tyrano.plugin.kag.menu);
        this.menu.kag = that;
        this.menu.init();

        //key_mouse 追加
        this.key_mouse = object(tyrano.plugin.kag.key_mouse);
        this.key_mouse.kag = that;
        this.key_mouse.init();

        //event 追加
        this.event = object(tyrano.plugin.kag.event);
        this.event.kag = that;
        this.event.init();

        //rider 追加
        this.rider = object(tyrano.plugin.kag.rider);
        this.rider.kag = that;
        this.rider.init();

        //studio 追加
        this.studio = object(tyrano.plugin.kag.studio);
        this.studio.kag = that;
        this.studio.init();

        this.chara = object(tyrano.plugin.kag.chara);
        this.chara.kag = that;
        this.chara.init();

        //セーブデータ認証用のKey確認（ローカルストレージ）
        if ($.isElectron() && that.kag.config.configSave == "file") {
            //PC
            if (process.execPath.indexOf("var/folders") != -1) {
                that.save_key_id = that.kag.config.projectID + "_save_key";
            } else {
                that.save_key_id = $.getExePath() + "_" + that.kag.config.projectID;
            }

            if (localStorage.getItem(that.save_key_id)) {
                that.save_key_val = localStorage.getItem(that.save_key_id);
            } else {
                //認証キーの書き出し
                that.save_key_val = $.makeSaveKey();
                localStorage.setItem(that.save_key_id, that.save_key_val);

                //セーブデータ上書き
                let tmp_array = that.menu.getSaveData();
                //ハッシュを上書き
                tmp_array["hash"] = that.save_key_val;
                $.setStorage(that.kag.config.projectID + "_tyrano_data", tmp_array, that.kag.config.configSave);
            }

            //ハッシュに差分があったら、警告を表示して上書きするか確認。
            let tmp_array = that.menu.getSaveData();

            if (tmp_array["hash"] != that.save_key_val) {
                alert($.lang("save_file_violation_1"));

                if (that.kag.config.configSaveOverwrite == "true") {
                    if (confirm($.lang("save_file_violation_2"))) {
                        tmp_array["hash"] = that.save_key_val;
                        $.setStorage(that.kag.config.projectID + "_tyrano_data", tmp_array, that.kag.config.configSave);
                    } else {
                        alert($.lang("save_file_violation_3"));
                        return false;
                    }
                } else {
                    alert($.lang("save_file_violation_3"));
                    return false;
                }
            }
        }

        //システム変数の初期化
        var tmpsf = $.getStorage(this.kag.config.projectID + "_sf", that.config.configSave);

        if (tmpsf == null) {
            this.variable.sf = {};
        } else {
            this.variable.sf = JSON.parse(tmpsf);
        }

        /////////////システムで使用する変数の初期化設定////////////////////
        //コンフィグ

        //システムが永続させたい変数はすぐにコンフィグに反映
        if (typeof that.variable.sf._system_config_bgm_volume !== "undefined")
            that.config["defaultBgmVolume"] = String(that.variable.sf._system_config_bgm_volume);
        if (typeof that.variable.sf._system_config_se_volume !== "undefined")
            that.config["defaultSeVolume"] = String(that.variable.sf._system_config_se_volume);
        //if(that.variable.sf._system_config_bgm_volume) that.config["defaultBgmVolume"] = that.variable.sf._system_config_bgm_volume;
        //if(that.variable.sf._system_config_se_volume) that.config["defaultSeVolume"] = that.variable.sf._system_config_se_volume;
        if (that.variable.sf._config_ch_speed) that.config["chSpeed"] = that.variable.sf._config_ch_speed;
        if (typeof that.variable.sf._system_config_auto_speed !== "undefined")
            that.config["autoSpeed"] = that.variable.sf._system_config_auto_speed;
        if (that.variable.sf._system_config_auto_click) that.config["autoClickStop"] = that.variable.sf._system_config_auto_click_stop;
        if (that.variable.sf._system_config_already_read_text_color)
            that.config["alreadyReadTextColor"] = that.variable.sf._system_config_already_read_text_color;
        if (typeof that.variable.sf._system_config_unread_text_skip != "undefined") {
            that.config["unReadTextSkip"] = that.variable.sf._system_config_unread_text_skip;
        }

        //自動セーブのデータがあるかどうか
        var auto_save_data = $.getStorage(this.kag.config.projectID + "_tyrano_auto_save", this.kag.config.configSave);

        this.variable.sf["system"] = {};

        if (auto_save_data) {
            this.variable.sf["system"]["autosave"] = true;
        } else {
            this.variable.sf["system"]["autosave"] = false;
        }

        //バックログ保存用の設定
        this.variable.tf["system"] = {};
        this.variable.tf["system"]["backlog"] = [];

        //コンフィグボタン追加
        var button_menu_obj = $(
            "<div class='button_menu' style='z-index:100000000'><img src='./tyrano/images/system/" +
            $.novel("file_button_menu") +
            "'  /></div>",
        );

        //コンフィグボタンの位置を指定する

        if (this.kag.config.configLeft != "-1" && this.kag.config.configTop != "-1") {
            button_menu_obj.css("left", parseInt(this.kag.config.configLeft));
            button_menu_obj.css("top", parseInt(this.kag.config.configTop));
        } else {
            button_menu_obj.css("left", this.config.scWidth - 70);
            button_menu_obj.css("top", this.config.scHeight - 70);
        }

        button_menu_obj.click(function () {
            // ブラウザの音声の再生制限を解除
            if (!that.kag.tmp.ready_audio) that.kag.readyAudio();

            that.menu.showMenu();
        });

        //コンフィグファイルを確認して、メニュー表示
        if (this.kag.config.configVisible == "false") {
            button_menu_obj.hide();
            this.kag.stat.visible_menu_button = false;
        } else {
            this.kag.stat.visible_menu_button = true;
        }

        $("." + this.kag.define.BASE_DIV_NAME).append(button_menu_obj);

        //センタリングの調整
        if (this.kag.config["ScreenCentering"] && this.kag.config["ScreenCentering"] == "false") {
            //センタリングをキャンセルする
            $(".tyrano_base").css("transform-origin", "0 0");
            $(".tyrano_base").css({
                margin: 0,
            });
        } else {
            //指定がない or yes なら こっち
            //$(".tyrano_base").css("transform-origin","50 50");
            $(".tyrano_base").css("transform-origin", "0 0");
            $(".tyrano_base").css({
                margin: 0,
            });
        }

        //センタリングが有効な場合のみ
        /*
        if(this.kag.config["ScreenCentering"]=="true"){
            $("#tyrano_base").css("position","absolute");
        }
        */

        //スマホの場合
        if ($.userenv() != "pc") {
            //absolute指定
            $("#tyrano_base").css("position", "absolute");

            // スクロール禁止(SP) vchatのときは例外
            if (this.kag.config["vchat"] != "true") {
                const noScroll = (event) => {
                    event.preventDefault();
                };
                document.addEventListener("touchmove", noScroll, {
                    passive: false,
                });
            }

            // Howl を走査して再生中のものを止めて再開フラグを立てる
            const pauseSoundsOnWindowBlur = () => {
                for (const howl of Howler._howls) {
                    if (howl.playing()) {
                        howl.pause();
                        howl.__should_play_on_focus = true;
                    } else {
                        howl.__should_play_on_focus = false;
                    }
                }
            };

            // Howl を走査して再開フラグの立っているものを再生して回る
            const resumeSoundsOnWindowFocus = () => {
                for (const howl of Howler._howls) {
                    if (howl.__should_play_on_focus) {
                        howl.play();
                        howl.__should_play_on_focus = false;
                    }
                }
            };

            $(document).on("visibilitychange", () => {
                if (document.visibilityState === "visible") {
                    resumeSoundsOnWindowFocus();
                }
                if (document.visibilityState === "hidden") {
                    pauseSoundsOnWindowBlur();
                }
            });

            // $(window).on("blur", pauseSoundsOnWindowBlur);
            // $(window).on("focus", resumeSoundsOnWindowFocus);
        }

        //tyranoの大本部分の調整
        this.tyrano.base.setBaseSize(this.config.scWidth, this.config.scHeight);

        that.tmp.angle = $.getAngle();
        that.tmp.largerWidth = $.getLargeScreenWidth();

        // kag.baseでbaseを参照できるように
        this.base = this.tyrano.base;

        // base.kagでkagを参照できるように
        this.base.kag = this;

        // 現在のゲーム画面のスケーリング情報を格納
        this.tmp.screen_info = {
            scale_x: 1,
            scale_y: 1,
            width: 1280,
            height: 720,
            top: 0,
            bottom: 720,
            left: 0,
            right: 1280,
            original_width: 1280,
            original_height: 720,
            viewport_width: 1920,
            viewport_hegiht: 1080,
        };

        // ゲーム画面フィットを即実行する
        this.tyrano.base._fitBaseSize(that.config.scWidth, that.config.scHeight, 0);

        //繰り返し実行用の関数
        var timerId = null;

        var flag_resized = false;

        $(window).bind("load resize orientationchange", function () {
            if (flag_resized === true) {
                return;
            } else {
                setTimeout(function () {
                    flag_resized = false;
                }, 100);
            }

            flag_resized = true;

            that.tmp.angle = $.getAngle();

            //リサイズコールの仕組み
            if (that.tmp.largerWidth != $.getLargeScreenWidth()) {
                //resizecallが設定されていれば呼び出す。
                if (that.stat.resizecall["storage"] != "") {
                    //画面変化中にリサイズするとすぐに反映されない仕組みを実装。
                    //クリックできない状態のときは実行しない
                    if (that.kag.layer.layer_event.css("display") == "none" && that.kag.stat.is_strong_stop != true) {
                        timerId = setTimeout(function () {
                            $(window).trigger("resize");
                        }, 1000);
                        return false;
                    }

                    //テキストが流れているときとwait中は実行しない
                    if (that.kag.stat.is_adding_text == true || that.kag.stat.is_wait == true) {
                        timerId = setTimeout(function () {
                            $(window).trigger("resize");
                        }, 1000);
                        return false;
                    }

                    //that.kag.ftag.nextOrderWithIndex(that.ftag.current_order_index, that.stat.current_scenario, true, insert, "yes");
                    var stack_pm = that.kag.getStack("call"); //最新のコールスタックを取得

                    //if(stack_pm==null){

                    var _auto_next = "false";
                    if (that.kag.stat.is_strong_stop == true) {
                        _auto_next = "stop";
                    } else {
                        //パラメータ初期値が入るようになる
                        //_auto_next = "yes";
                    }

                    if ($.getLargeScreenWidth() == true) {
                        that.variable.tf["_larger_width"] = 1;
                    } else {
                        that.variable.tf["_larger_width"] = 0;
                    }

                    that.kag.ftag.startTag("call", {
                        storage: that.stat.resizecall["storage"],
                        target: that.stat.resizecall["target"],
                        auto_next: _auto_next,
                        textclear: "false", //移動したときに現在のメッセージレイヤをクリアさせない。
                    });

                    /*
                    }else{

                        //スタックで残された
                        that.kag.log("callスタックが残っている場合、resizecallボタンは反応しません");
                        that.kag.log(stack_pm);

                        return false;
                    }
                    */
                }
            }

            that.tmp.largerWidth = $.getLargeScreenWidth();

            ////リサイズコールここまで

            if (Math.abs(window.orientation) === 90) {
                window.scrollTo(0, 1);
                that.tyrano.base.fitBaseSize(that.config.scWidth, that.config.scHeight);
            } else {
                if (window.pageYOffset === 0) {
                    window.scrollTo(0, 1);
                }
                that.tyrano.base.fitBaseSize(that.config.scWidth, that.config.scHeight);
            }
        });

        // この時点ですでにloadが発火済みの場合がありえる！（Electronの場合は基本的に発火済み）
        // その場合は手動でloadをトリガーすることで上記イベントリスナを実行する
        if (window.isLoaded === true) {
            $(window).trigger("load");
        }

        // フルスクリーン状態の変動を検知
        $("body").on("fullscreenchange", (e) => {
            // いまフルスクリーンか？
            // フルスクリーンならフルスクリーン要素が取得できる (truthy)
            // フルスクリーンじゃないならnullが返ってくる (falsy)
            const is_full_screen =
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement ||
                document.fullScreenElement ||
                false;

            if (is_full_screen) {
                // ティラノイベント"fullscreen-start"を発火
                this.kag.trigger("fullscreen-start", e);
            } else {
                // ティラノイベント"fullscreen-stop"を発火
                this.kag.trigger("fullscreen-stop", e);
            }
        });

        this.layer.addLayer("base");

        //メッセージレイヤの追加
        this.layer.addLayer("message0");

        //メッセージ外枠部分の作成
        var j_message = $("<div class='message_outer'></div>");
        j_message
            .css("background-color", $.convertColor(this.config.frameColor))
            .css("opacity", $.convertOpacity(this.config.frameOpacity))
            .css("left", eval(this.config.ml))
            .css("top", eval(this.config.mt))
            .css("width", eval(this.config.mw))
            .css("height", eval(this.config.mh))
            .css("z-index", 100);

        j_message.l_visible;

        this.layer.appendObj("message0", "fore", j_message);

        //メッセージ表示領域
        var j_message_inner = $("<div class='message_inner' style='z-index:1001'></div>");

        //禁則処理
        if (this.config.WordBreak == "false") {
            j_message_inner.css("word-break", "break-all");
        }

        //１行目の上に余裕を持たせる。rubyカクつき対策
        $.insertRule(".message_inner p{ padding-top:" + this.kag.config.defaultLineSpacing + "px;}");

        this.layer.appendObj("message0", "fore", j_message_inner);

        /*********************************/
        ///messege1 ２個目のメッセージレイヤ。ここは指定回数分作成できるようにする必要があるかも

        var num_message_layer = parseInt(this.config.numMessageLayers);

        for (let i = 1; i < num_message_layer; i++) {
            var message_layer_name = "message" + i;

            this.layer.addLayer(message_layer_name);
            //２個め移行はデフォルト非表示
            this.layer.getLayer(message_layer_name).attr("l_visible", "false");
            this.layer.getLayer(message_layer_name).hide();
            var j_message1 = j_message.clone(false);

            this.layer.appendObj(message_layer_name, "fore", j_message1);
            var j_message_inner1 = j_message_inner.clone(false);

            this.layer.appendObj(message_layer_name, "fore", j_message_inner1);
        }

        //メッセージレイヤの大きさをリフレッシュする命令
        this.layer.refMessageLayer();

        //指定された個数分、Foreレイヤを登録する
        var fore_layer_num = parseInt(this.config.numCharacterLayers);
        for (let i = 0; i < fore_layer_num; i++) {
            this.layer.addLayer("" + i);
            this.layer
                .getLayer("" + i, "fore")
                .css("display", "none")
                .css("z-index", 10 + i); //デフォルト非表示　前景レイヤ

            this.layer
                .getLayer("" + i, "back")
                .css("display", "none")
                .css("z-index", 10 + i); //デフォルト非表示　前景レイヤ
        }

        //デフォルトフォントの設定
        this.stat.default_font.color = $.convertColor(this.kag.config.defaultChColor);
        this.stat.default_font.bold = $.convertBold(this.kag.config.defaultBold);
        this.stat.default_font.size = this.kag.config.defaultFontSize;
        this.stat.default_font.face = this.kag.config.userFace;

        this.stat.default_font.effect = this.kag.config.defaultChEffect;
        this.stat.default_font.effect_speed = this.kag.config.defaultChEffectSpeed;

        //文字のアンチエイリアス効果
        var smooth = this.kag.config.defaultAntialiased; //アンチエイリアス効果

        if (smooth == "2") {
            $(".tyrano_base").css("-webkit-font-smoothing", "antialiased");
        } else if (smooth == "0") {
            $(".tyrano_base").css("-webkit-font-smoothing", "none");
        } else {
            $(".tyrano_base").css("-webkit-font-smoothing", "subpixel-antialiased");
        }

        //文字の影
        if (this.kag.config.defaultShadow == "true") {
            this.stat.default_font.shadow = $.convertColor(this.kag.config.defaultShadowColor);
        }

        //文字の縁
        if (this.kag.config.defaultEdge == "true") {
            this.stat.default_font.edge = $.convertColor(this.kag.config.defaultEdgeColor);
        }

        this.stat.vertical = this.kag.config.vertical;

        //デフォルトフォントの状態を設定
        this.kag.stat.font = $.extend(true, $.cloneObject(this.kag.stat.font), this.stat.default_font);

        //タイトルの設定
        this.setTitle(this.config["System.title"]);

        //cursorの設定
        this.setCursor(this.config["cursorDefault"]);

        //オーディオでワンクリックが必要かどうかの判定
        if (!$.isNeedClickAudio()) {
            this.tmp.ready_audio = true;
        }

        //index.htmlでのvchat定義を確認。index.htmlでコンフィグを調整したい。
        $("[tyrano='config']").each(function () {
            var key = $(this).attr("key");
            var val = $(this).val();
            that.kag.config[key] = "" + val;
        });

        //ビジュアルチャット形式/////////////////
        if (this.kag.config["vchat"] && this.kag.config["vchat"] == "true") {
            this.kag.config["ScreenCentering"] = "false";
            this.kag.config["ScreenRatio"] = "fix";

            this.kag.stat.vchat.is_active = true;

            $("#vchat_base").css({
                "background-color": "#EEEEEE",
                "overflow": "scroll",
            });

            $("#vchat_base").show();

            //イベントを消す
            $("body").get(0).ontouchmove = "";

            //縦書きを無効にする
            this.stat.vertical = "false";

            //縦書きは無効化
            this.kag.config.vertical = "false";
            this.stat.vertical = "false";

            this.kag.ftag.startTag("vchat_in", {});

            //テキスト部分にクリックイベントを挿入
            $("#vchat_base").on("click", (e) => {
                $(".layer_event_click").trigger("click");
                e.preventDefault();
            });
        }

        //vchat形式で便利なメニューの表示。
        if (this.kag.config["vchatMenuVisible"] && this.kag.config["vchatMenuVisible"] == "true") {
            //コンフィグを表示する。
            setTimeout(function () {
                let player_back_cnt;

                (function () {
                    player_back_cnt = 0;
                    var j_menu_button = $(
                        "<div id='player_menu_button' class='player_menu_area' style='display:none;opacity:0.6;border-radius:5px;padding:10px;margin:10px;cursor:pointer;position:absolute;left:0px;top:0px;background-color:white;font-size:2em'><span style='color:#6495ED'>メニュー</span></div>",
                    );
                    var j_menu_area = $("<div style='display:none;position:absolute;left:10px;top:10px;font-size:2em'></div>");

                    var j_end_button = $(
                        "<div class='player_menu_area' id='player_end_button' style='opacity:0.6;border-radius:5px;padding:10px;margin:10px 10px 10px 10px;cursor:pointer;left:0px;top:0px;background-color:white;'><span style='color:#6495ED'>タイトルへ</span></div>",
                    );
                    var j_auto_button = $(
                        "<div class='player_menu_area' id='player_auto_button' style='opacity:0.6;border-radius:5px;padding:10px;margin:10px 10px 10px 10px;cursor:pointer;left:0px;top:0px;background-color:white;'><span style='color:#6495ED'>オート</span></div>",
                    );
                    var j_skip_button = $(
                        "<div class='player_menu_area' id='player_skip_button' style='opacity:0.6;border-radius:5px;padding:10px;margin:10px 10px 10px 10px;cursor:pointer;left:0px;top:0px;background-color:white;'><span style='color:#6495ED'>スキップ</span></div>",
                    );

                    j_menu_area.append(j_end_button);
                    j_menu_area.append(j_auto_button);
                    j_menu_area.append(j_skip_button);

                    function hide_menu() {
                        j_menu_area.hide();

                        /*
                        j_end_button.hide();
                        j_auto_button.hide();
                        j_skip_button.hide();
                        */

                        j_menu_button.hide();
                        player_back_cnt = 0;
                    }

                    j_menu_button.click(function (e) {
                        j_menu_button.hide();
                        j_menu_area.show();

                        /*
                        j_end_button.show();
                        j_auto_button.show();
                        j_skip_button.show();
                        */
                    });

                    j_end_button.click(function (e) {
                        //アンドロイドとiOSで処理分け
                        hide_menu();
                        location.reload();
                        e.stopPropagation();
                    });

                    j_auto_button.click(function (e) {
                        hide_menu();
                        TYRANO.kag.ftag.startTag("autostart", {});
                        e.stopPropagation();
                    });

                    j_skip_button.click(function (e) {
                        hide_menu();
                        TYRANO.kag.ftag.startTag("skipstart", {});
                        e.stopPropagation();
                    });

                    $("body").append(j_menu_button);

                    $("body").append(j_menu_area);

                    $("#tyrano_base").on("click.player", function () {
                        if (player_back_cnt > 8) {
                            hide_menu();
                        }

                        player_back_cnt = 0;
                    });

                    //10秒操作がなかったら、ボタンを表示する。
                    setInterval(function () {
                        if (player_back_cnt == 9) {
                            j_menu_button.show();
                        } else if (player_back_cnt > 3) {
                        }

                        player_back_cnt++;
                    }, 1000);
                })();

                $("#tyrano_base").on("click.player", function () {
                    player_back_cnt = 0;
                });
            }, 1000);
        }

        /////////////////////////////

        var first_scenario_file = "first.ks";

        if ($("#first_scenario_file").length > 0) {
            first_scenario_file = $("#first_scenario_file").val();
        }

        //追加分のプロジェクトファイルの読み込み
        var array_scripts = [];

        if (this.kag.config["use3D"] == "true") {
            array_scripts = [
                 "./tyrano/libs/three/three.js",

                "./tyrano/libs/three/loader/GLTFLoader.js",
                "./tyrano/libs/three/loader/OBJLoader.js",
                "./tyrano/libs/three/loader/MTLLoader.js",
                //"./tyrano/libs/three/loader/MMDLoader.js",

                "./tyrano/libs/three/controls/OrbitControls.js",
                "./tyrano/libs/three/controls/TransformControls.js",
                "./tyrano/libs/three/controls/DeviceOrientationControls.js",
                "./tyrano/libs/three/classes/ThreeModel.js",
                "./tyrano/libs/three/etc/stats.min.js",
                "./tyrano/libs/three/etc/ar.js",

                "./tyrano/libs/three/etc/CSS3DRenderer.js",
            ];
        }

        $.getMultiScripts(array_scripts, () => {
            //シナリオファイルの読み込み。parser から、シナリオを解析して、タグ管理画面を作る。
            this.loadScenario(first_scenario_file, function (array_tag) {
                that.ftag.buildTag(array_tag);
                //最初にレイヤをコピーしておく、、、その必要はない！コメント化20122119
                //that.kag.ftag.startTag("backlay",{});
            });
        });

        //
        // キーボードによるボタンフォーカス関連の設定
        //

        if (this.config["keyFocusOutlineWidth"]) {
            const width = this.config["keyFocusOutlineWidth"];
            $.insertRuleToTyranoCSS(`:focus.focus { outline-width: ${width}px}`);
        }

        let focus_outline_color = "#000000";
        if (this.config["keyFocusOutlineColor"]) {
            const color = $.convertColor(this.config["keyFocusOutlineColor"]);
            focus_outline_color = color;
            $.insertRuleToTyranoCSS(`:focus.focus { outline-color: ${color}}`);
        }
        if (this.config["keyFocusOutlineStyle"]) {
            const style = $.convertColor(this.config["keyFocusOutlineStyle"]);
            $.insertRuleToTyranoCSS(`:focus.focus { outline-style: ${style}}`);
        }
        if (this.config["keyFocusOutlineAnim"] && this.config["keyFocusOutlineAnim"] !== "none") {
            switch (this.config["keyFocusOutlineAnim"]) {
                default:
                case "flash":
                    $.insertRuleToTyranoCSS(`:focus.focus { animation: focus 1000ms infinite alternate linear; }`);
                    $.insertRuleToTyranoCSS(`
                    @keyframes focus {
                        0%   { outline-color: ${focus_outline_color}; }
                        3%   { outline-color: ${focus_outline_color}; }
                        97%  { outline-color: transparent; }
                        100% { outline-color: transparent; }
                    }`);
                    break;
                case "flash_momentary":
                    $.insertRuleToTyranoCSS(`:focus.focus { animation: focus 1000ms infinite steps(1, end); }`);
                    $.insertRuleToTyranoCSS(`
                    @keyframes focus {
                        0% { outline-color: ${focus_outline_color}; }
                        50%, 100% { outline-color: transparent; }
                    }`);
                    break;
            }
            if (this.config["keyFocusOutlineAnimDuration"]) {
                $.insertRuleToTyranoCSS(`:focus.hover { animation-duration: ${this.config["keyFocusOutlineAnimDuration"]}ms; }`);
            }
        }
        if (this.config["keyFocusWithHoverStyle"] === "true") {
            $.copyHoverCSSToFocusCSS('link[href*="tyrano/tyrano.css"]');
        }

        //
        // 終了時の確認ダイアログ
        //

        if (this.config["useCloseConfirm"] === "true") {
            // 通常セーブ、クイックセーブ、オートセーブ、ロード時にコンファームを破壊
            this.kag.on(
                "storage-save storage-quicksave storage-autosave load-complete",
                () => {
                    $.disableCloseConfirm();
                },
                { system: true },
            );

            // nextOrder 時にコンファームを復元
            this.kag.on(
                "nextorder",
                (e) => {
                    if (this.stat.use_close_confirm) $.enableCloseConfirm();
                },
                { system: true },
            );
        }

        //
        // remodal のリセット
        //

        this.kag.ftag.master_tag.dialog_config.init();

        //ティラノライダーからの通知の場合、発生させる
        //that.rider.complete(this);

        if (this.kag.is_studio) {
            that.studio.complete(this);
        }
    },

    //BackLogを格納します
    pushBackLog: function (str, type) {
        //バックログを記録するか否か
        if (this.stat.log_write == false) {
            return;
        }

        type = type || "add";

        var max_back_log = parseInt(this.kag.config["maxBackLogNum"]);

        if (max_back_log < 1) return;

        //バックログを必ずクリアしてから追加。pなどの通過後
        if (this.kag.stat.log_clear == true) {
            type = "add";
            this.kag.stat.log_clear = false;
        }

        if (type == "join") {
            var index = this.variable.tf.system.backlog.length - 1;
            if (index >= 0) {
                //配列が存在しない場合はpushだ
                var tmp = this.variable.tf["system"]["backlog"][index];
                this.variable.tf["system"]["backlog"][this.variable.tf.system.backlog.length - 1] = tmp + str;
            } else {
                this.variable.tf["system"]["backlog"].push(str);
            }
        } else {
            this.variable.tf["system"]["backlog"].push(str);
        }

        //セーブ用のテキストファイルを保存
        this.stat.current_save_str = this.variable.tf["system"]["backlog"][this.variable.tf.system.backlog.length - 1];

        //上限を超えたらFILO で処理
        if (max_back_log < this.variable.tf["system"]["backlog"].length) {
            this.variable.tf["system"]["backlog"].shift();
        }
    },

    //タイトル名を設定します
    setTitle: function (title) {
        //タイトルの設定
        this.stat.title = title;
        document.title = title;
    },

    pushAnimStack: function () {
        this.kag.tmp.num_anim++;
    },

    backTitle: function () {
        if ("appJsInterface" in window) {
            appJsInterface.finishGame();
        } else {
            if (typeof TyranoPlayer == "function") {
                //iphone
                //location.href = "tyranoplayer-back://endgame";
                webkit.messageHandlers.backHandler.postMessage("endgame");
            } else {
                //その他
                $.confirm(
                    $.lang("go_title"),
                    function () {
                        location.href = "./index.html";
                    },
                    function () {
                        return false;
                    },
                );
            }
        }
    },

    //スキップ中に演出をカットする
    cutTimeWithSkip: function (time) {
        if (this.kag.stat.is_skip == true) {
            if (this.kag.config.skipEffectIgnore == "true") {
                //瞬時に終わるように設定
                return 70;
            }
        }
        return time;
    },

    //スマホブラウザ向け、音楽再生設定
    readyAudio: function () {
        if (this.tmp.ready_audio) {
            return;
        }

        this.tmp.ready_audio = true;
        if ($.isNeedClickAudio()) {
            var audio_obj = new Howl({
                src: "./tyrano/audio/silent.mp3",
                volume: 0.1,
                onplay: () => {
                    // ティラノイベント"readyaudio"を発火
                    this.kag.trigger("readyaudio");
                },
                onend: () => {
                    audio_obj.unload();
                },
            });
            audio_obj.play();
        }
    },

    //ゲームのカーソルを指定する
    setCursor: function (cursor) {
        this.stat.current_cursor = cursor;

        let storage, x, y;
        if (typeof cursor === "string") {
            storage = cursor;
            x = "0";
            y = "0";
        } else if (typeof cursor === "object") {
            storage = cursor.storage;
            x = cursor.x;
            y = cursor.y;
        }

        let image_url;
        let css_str;
        if (storage === "default") {
            css_str = "auto";
        } else {
            image_url = `./data/image/${storage}`;
            css_str = `url(${image_url}) ${x} ${y}, default`;
        }

        $("body").css("cursor", css_str);
        this.kag.key_mouse.vmouse.addImage("default", image_url, x, y);
    },

    /**
     * ある要素にカーソル設定をセットする
     * @param {jQuery} j_elm
     * @param {string} type (例) "pointer"
     */
    setElmCursor: function (j_elm, type) {
        if (!this.stat.current_cursor_map) {
            this.stat.current_cursor_map = {};
        }
        const option = this.stat.current_cursor_map[type] || type;
        j_elm.css("cursor", option);
    },

    //吹き出しのスタイルをアップデートする
    updateFuki: function (chara_name, opt = {}) {
        if (!$(".tyrano_base").find("#tmp_style").get(0)) {
            $(".tyrano_base").prepend("<style id='tmp_style' type='text/css'></style>");
        }

        var msg_inner_layer = this.kag.getMessageInnerLayer();
        var msg_outer_layer = this.kag.getMessageOuterLayer();

        if (chara_name == "others") {
            $("#tmp_style").html("");
            return false;
        }

        var fuki_chara = this.kag.stat.charas[chara_name]["fuki"];

        fuki_chara["sippo_width"] = parseInt(fuki_chara["sippo_width"]);
        fuki_chara["sippo_height"] = parseInt(fuki_chara["sippo_height"]);

        let fuki_def_style = this.kag.stat.fuki.def_style;

        let border_size = parseInt(msg_outer_layer.css("border-width"));

        let sippo_left = fuki_chara.sippo_left;

        let style_text = "";
        let style_text_after = "";
        let style_text_before = "";

        if (fuki_chara.sippo == "top" || fuki_chara.sippo == "bottom") {
            sippo_left = opt.sippo_left + parseInt(fuki_chara.sippo_left);
            style_text = "left:" + sippo_left + "px;";
        } else {
            sippo_left = opt.sippo_left + parseInt(fuki_chara.sippo_top);
            style_text = "top:" + sippo_left + "px;";
        }

        let style_text_key = "";

        //トップ指定の場合

        if (fuki_chara.sippo == "top") {
            style_text += "bottom:100%;";
            style_text_key = "bottom";
        } else if (fuki_chara.sippo == "bottom") {
            style_text += "top:100%;";
            style_text_key = "top";
        } else if (fuki_chara.sippo == "left") {
            style_text += "right:100%;";
            style_text_key = "right";
        } else if (fuki_chara.sippo == "right") {
            style_text += "left:100%;";
            style_text_key = "left";
        }

        style_text_after = "border-bottom-color:";

        let str_css = `

		.fuki_box:after,.fuki_box:before{
		    border: solid transparent;
		    content:'';
		    height:0;
		    width:0;
		    pointer-events:none;
		    position:absolute;
		    ${style_text}
		}
		`;

        let str_css2 = "";

        if (fuki_chara.sippo == "top" || fuki_chara.sippo == "bottom") {
            str_css2 = `

			.fuki_box:after{

			    border-color: ${msg_outer_layer.css("border-color").replace(")", ",0)")};
			    border-top-width:${fuki_chara["sippo_height"]}px;
			    border-bottom-width:${fuki_chara["sippo_height"]}px;
			    border-left-width:${fuki_chara["sippo_width"]}px;
			    border-right-width:${fuki_chara["sippo_width"]}px;
			    margin-left: ${fuki_chara["sippo_width"] * -1}px;
			    border-${style_text_key}-color:${msg_outer_layer.css("background-color")};

			}

			.fuki_box:before{

			    border-color: ${msg_outer_layer.css("border-color").replace(")", ",0)")};
			    border-top-width:${fuki_chara["sippo_height"] + border_size}px;
			    border-bottom-width:${fuki_chara["sippo_height"] + border_size}px;
			    border-left-width:${fuki_chara["sippo_width"] + border_size}px;
			    border-right-width:${fuki_chara["sippo_width"] + border_size}px;
			    margin-left: ${(fuki_chara["sippo_width"] + border_size) * -1}px;
			    margin-${style_text_key}: ${border_size}px;
			    border-${style_text_key}-color:${msg_outer_layer.css("border-color")};

			}`;
        } else {
            str_css2 = `

			.fuki_box:after{

			    border-color: ${msg_outer_layer.css("border-color").replace(")", ",0)")};
			    border-top-width:${fuki_chara["sippo_width"]}px;
			    border-bottom-width:${fuki_chara["sippo_width"]}px;
			    border-left-width:${fuki_chara["sippo_height"] - 2}px;
			    border-right-width:${fuki_chara["sippo_height"] - 2}px;
			    margin-top: ${(fuki_chara["sippo_width"] + 2) * -1}px;
			    border-${style_text_key}-color:${msg_outer_layer.css("background-color")};

			}

			.fuki_box:before{

			    border-color: ${msg_outer_layer.css("border-color").replace(")", ",0)")};
			    border-top-width:${fuki_chara["sippo_width"] + border_size}px;
			    border-bottom-width:${fuki_chara["sippo_width"] + border_size}px;
			    border-left-width:${fuki_chara["sippo_height"] + border_size - 2}px;
			    border-right-width:${fuki_chara["sippo_height"] + border_size - 2}px;
			    margin-top: ${(fuki_chara["sippo_width"] + border_size + 2) * -1}px;
			    margin-${style_text_key}: ${border_size}px;
			    border-${style_text_key}-color:${msg_outer_layer.css("border-color")};

			}`;
        }

        $("#tmp_style").html(str_css + "\n" + str_css2);
    },

    popAnimStack: function () {
        if (this.kag.tmp.num_anim > 0) {
            this.kag.tmp.num_anim--;
        }

        //すべてのアニメーションが終了したら、
        if (this.kag.tmp.num_anim <= 0) {
            //停止中なら
            if (this.kag.stat.is_wait_anim == true) {
                this.kag.stat.is_wait_anim = false;
                this.kag.cancelWeakStop();
                this.kag.ftag.nextOrder();
            }
        }
    },

    //シナリオファイルの読み込み
    loadScenario: function (file_name, call_back) {
        var that = this;
        this.stronglyStop();

        this.stat.current_scenario = file_name;

        //同じディレクトリにある、KAG関連のデータを読み込み

        var file_url = "";

        if ($.isHTTP(file_name)) {
            file_url = file_name;
        } else {
            file_url = "./data/scenario/" + file_name;
        }

        //キャッシュ確認
        if (that.cache_scenario[file_url]) {
            if (call_back) {
                var result_obj = that.cache_scenario[file_url];

                var tag_obj = result_obj.array_s;
                var map_label = result_obj.map_label;

                //ラベル情報を格納
                that.stat.map_label = map_label;
                that.cancelStrongStop();

                call_back(tag_obj);
            }
        } else {
            $.loadText(file_url, function (text_str) {
                var result_obj = that.parser.parseScenario(text_str);
                that.cache_scenario[file_url] = result_obj;

                var tag_obj = result_obj.array_s;
                var map_label = result_obj.map_label;

                //ラベル情報を格納
                that.stat.map_label = map_label;
                that.cancelStrongStop();

                if (call_back) {
                    call_back(tag_obj);
                }
            });
        }
    },

    //キャッシュ領域にシナリオを格納します。
    //これはシナリオファイルを配置しなくても動的に挿入できることを意味します。
    setCacheScenario: function (filename, str) {
        var result_obj = this.parser.parseScenario(str);
        this.cache_scenario["./data/scenario/" + filename] = result_obj;
    },
    
     //キャッシュシナリオの削除
    deleteCacheScenario: function (filename) {
        delete this.cache_scenario["./data/scenario/" + filename];
    },

    getMessageInnerLayer: function () {
        //vchat形式の場合
        if (this.stat.vchat.is_active) {
            var j_msg_inner = $("#vchat_base").find(".current_vchat"); //.find(".vchat-text-inner").html(current_str);
            //j_msg_inner.show();
            return j_msg_inner;
        } else {
            return this.layer.getLayer(this.stat.current_layer, this.stat.current_page).find(".message_inner");
        }
    },

    getMessageOuterLayer: function () {
        //console.trace();
        return this.layer.getLayer(this.stat.current_layer, this.stat.current_page).find(".message_outer");
    },

    getMessageCurrentSpan: function () {
        //ここでも、
        var j_obj = this.layer
            .getLayer(this.stat.current_layer, this.stat.current_page)
            .find(".message_inner")
            .find("p")
            .find(".current_span");

        return j_obj;
    },

    //即座に新しい領域を確保
    setMessageCurrentSpan: function () {
        var jtext = this.getMessageInnerLayer();

        //縦書きと横書きで処理が別れる
        if (jtext.find("p").length == 0) {
            this.setNewParagraph(jtext);
        }

        if (jtext.find("p").find(".current_span").length > 0) {
            jtext.find("p").find(".current_span").removeClass("current_span");
            this.stat.set_text_span = false;
        }

        var j_span = $("<span class='current_span'></span>");

        jtext.find("p").append(j_span); //縦書きの場合、ここに追加されてないかも

        return j_span;
    },

    setNewParagraph: function (j_inner) {
        if (this.stat.vertical == "true") {
            j_inner.append("<p class='vertical_text'></p>");
        } else {
            j_inner.append("<p class=''></p>");
        }
    },

    checkMessage: function (jtext) {
        //新しい領域への切り替え
        if (this.stat.set_text_span == true) {
            jtext.find("p").find(".current_span").removeClass("current_span");
            this.stat.set_text_span = false;
        }

        //必ず、spanが存在する
        if (jtext.find(".current_span").length == 0) {
            jtext.find("p").append($("<span class='current_span'></span>"));
        }
    },

    //対象のメッセージエリアにテキストを挿入します。
    appendMessage: function (jtext, str) {
        jtext.find("p").find(".current_span").html(str);
    },

    registerPreloadCompleteCallback(callback) {
        if (this.tmp.preload_objects.length === 0) {
            callback();
            return;
        }
        this.tmp.preload_complete_callbacks.push(callback);
    },

    //画像のプリロード オンの場合は、ロードが完了するまで次へ行かない
    preload: function (src, callbk, options = {}) {
        var symbol = Symbol();
        this.tmp.preload_objects.push(symbol);
        this.kag.showLoadingLog("preload");

        const removeByPreloadObjects = () => {
            var index = this.tmp.preload_objects.indexOf(symbol);
            if (index !== -1) {
                this.tmp.preload_objects.splice(index, 1);
            }
            if (this.tmp.preload_objects.length == 0 && this.tmp.preload_complete_callbacks.length > 0) {
                this.tmp.preload_complete_callbacks.forEach((callback) => {
                    callback();
                });
                this.tmp.preload_complete_callbacks.splice(0, this.tmp.preload_complete_callbacks.length);
            }
        }

        const onend = (elm) => {
            removeByPreloadObjects();
            this.kag.hideLoadingLog();
            if (callbk) callbk(elm);
        };

        var that = this;

        var ext = $.getExt(src);

        const is_http = $.isHTTP(src);
        const is_inline_data = src.substring(0, 5) === "data:";

        // 相対パスの場合は"./"を補完
        if (!is_http && !is_inline_data) {
            const c1 = src.charAt(0);
            const c2 = src.substring(0, 2);
            if (c1 === "/") {
                // "/data/sound/foo.mp3"
                src = "." + src;
            } else if (c2 !== "./") {
                // "data/sound/foo.mp3"
                src = "./" + src;
            }
        }

        if (ext == "wav" || ext == "mp3" || ext == "ogg" || ext == "m4a") {
            // 音声ファイルの場合

            // プリロード済みのHowlマップをチェック
            const preloaded_audio = this.kag.tmp.preload_audio_map[src];
            if (preloaded_audio) {
                // プリロードしたことがある場合、ステータスを確認
                switch (preloaded_audio.state()) {
                    case "unload":
                        // アンロードで残っていることは基本的にはないが…
                        removeByPreloadObjects();
                        delete this.kag.tmp.preload_audio_map[src];
                        break;
                    case "loading":
                        // ロード中の場合はロードイベントリスナを追加
                        preloaded_audio.once("load", () => {
                            onend(preloaded_audio);
                        });
                        return;
                    case "loaded":
                        // ロード済みなら即コールバック
                        onend(preloaded_audio);
                        return;
                }
            }

            // ここに到達したということは新しくロードする必要がある
            // とりあえずHowlオブジェクトを作る
            const audio_obj = new Howl({
                src: src,
                preload: false,
            });

            // プリロード済みHowlマップに格納
            this.kag.tmp.preload_audio_map[src] = audio_obj;

            // ロードに成功したとき
            audio_obj.once("load", () => {
                onend(audio_obj);
            });

            // ロードに失敗したとき
            audio_obj.once("loaderror", () => {
                audio_obj.unload();
                this.kag.error("preload_failure_sound", { src });
                onend(audio_obj);
                delete this.kag.tmp.preload_audio_map[src];
            });

            // このHowlは[preload]でプリロードしたものですよという目印
            audio_obj.__preload = true;

            // プリロードデータを使い捨てにするかどうか
            audio_obj.__single_use = options.single_use !== undefined ? options.single_use : true;

            // 名前をつけられる
            const name = options.name || "";
            const names = name.split(",").map((item) => {
                return item.trim();
            });
            audio_obj.__names = names;

            // ロード開始
            audio_obj.load();
        } else if ("mp4" == ext || "ogv" == ext || "webm" == ext) {
            // 動画ファイルプリロード

            let evt_name = "loadeddata";

            if ($.userenv() == "iphone") {
                evt_name = "loadedmetadata";
            }

            $("<video />")
                .on(evt_name, function (e) {
                    onend(this);
                })
                .on("error", function (e) {
                    that.kag.error("preload_failure_video", { src });
                    onend();
                })
                .attr("src", src);
        }else if ("json" == ext) {

            $.loadText(src, function (text_str) {
                onend(this);
            }, true);

        } else {
            // 画像ファイルプリロード
            $("<img />")
                .on("load", function (e) {
                    onend(this);
                })
                .on("error", function (e) {
                    that.kag.error("preload_failure_image", { src });
                    onend();
                })
                .attr("src", src);
        }
    },

    //配列の先読み
    preloadAll: function (storage, callbk) {
        const that = this;
        if (Array.isArray(storage)) {
            // 配列で指定された場合

            // 空の配列が渡された…だと…
            if (storage.length == 0) {
                if (callbk) callbk();
                return;
            }

            let sum = 0;

            for (let i = 0; i < storage.length; i++) {
                that.kag.preload(storage[i], () => {
                    sum++;
                    if (sum === storage.length) {
                        if (callbk) callbk();
                    }
                });
            }
        } else {
            // 配列じゃなかった場合
            this.kag.preload(storage, callbk);
        }
    },

    /**
     * 現在のインデックスから次に現れる[chara_ptext]をサーチして
     * その[chara_ptext]で自動再生されるボイスをプリロードする処理
     * ※生の[chara_ptext]で記述されている必要がある。マクロ内部に隠蔽されている場合はサーチ不可
     */
    preloadNextVoice: function () {
        const array_tag = this.kag.ftag.array_tag;
        const max_search_tag_coung = 20; // どれくらい深く探索するか 20もあれば充分でしょう
        const end_index = Math.min(array_tag.length, this.kag.ftag.current_order_index + max_search_tag_coung);
        const search_target_tag = "chara_ptext";
        let i = this.kag.ftag.current_order_index + 1;
        let next_chara_ptext_pm = null;
        for (; i < end_index; i++) {
            const tag = array_tag[i];
            // [chara_ptext]が見つかったらクローンして脱出
            if (tag.name === search_target_tag) {
                next_chara_ptext_pm = $.extend({}, tag.pm);
                break;
            }
        }
        if (next_chara_ptext_pm) {
            // 一応エンティティ置換しておく(基本的に #hoge 表記であろうからほぼ不要とは思うが)
            next_chara_ptext_pm = this.kag.ftag.convertEntity(next_chara_ptext_pm);
            const next_chara_name = next_chara_ptext_pm.name;
            const next_chara_voconfig = this.kag.stat.map_vo.vochara[next_chara_name];
            if (next_chara_voconfig) {
                const next_voice_storage = $.replaceAll(next_chara_voconfig.vostorage, "{number}", next_chara_voconfig.number);
                const next_voice_storage_path = $.parseStorage(next_voice_storage, "sound");
                this.kag.preload(next_voice_storage_path, () => {
                    // console.warn(`loaded ${next_voice_storage_path}`);
                });
            }
        }
    },

    //値が空白のものは設定しない
    setStyles: function (j_obj, array_style) {
        for (let key in array_style) {
            if (typeof array_style[key] != "undefined") {
                if (array_style[key] === "") {
                } else {
                    j_obj.css(key, array_style[key]);
                }
            }
        }

        return j_obj;
    },

    //指定したHTMLを取得してかえす
    html: function (html_file_name, data, callback) {
        var that = this;

        data = data || {};

        //キャッシュを確認して、すでに存在する場合はそれを返す
        if (this.cache_html[html_file_name]) {
            if (callback) {
                var tmpl = $.templates(this.cache_html[html_file_name]);
                var html = tmpl.render(data);
                callback($(html));
            }
        } else {
            //存在しない場合は初期化
            if (!this.kag.stat.sysview) {
                this.kag.stat.sysview = {};
                this.kag.stat.sysview = {
                    save: "./tyrano/html/save.html",
                    load: "./tyrano/html/load.html",
                    backlog: "./tyrano/html/backlog.html",
                    menu: "./tyrano/html/menu.html",
                };
            }

            var path_html = this.kag.stat.sysview[html_file_name];

            $.loadText(path_html, function (text_str) {
                var tmpl = $.templates(text_str);
                var html = tmpl.render(data);

                //一度読みに行ったものは次回から読みに行かない
                that.cache_html[html_file_name] = text_str;

                if (callback) {
                    callback($(html));
                }
            });
        }
    },

    error: function (message, replace_map) {
        if (this.kag.config["debugMenu.visible"] == "true") {
            // Error: first.ks：28行目
            // ほにゃららのエラーが発生しました。
            const current_storage = this.kag.stat.current_scenario;
            const line = parseInt(this.kag.stat.current_line) + 1;
            const line_str = $.lang("line", { line });
            if (message in tyrano_lang.word) {
                message = $.lang(message, replace_map);
            }
            const error_str = `Error: ${current_storage}:${line_str}\n\n${message}`;
            $.error_message(error_str);
        }
    },

    //警告表示
    warning: function (message, replace_map, is_alert = true) {
        if (this.kag.config["debugMenu.visible"] == "true") {
            if (typeof replace_map === "boolean") is_alert = replace_map;
            if (message in tyrano_lang.word) {
                message = $.lang(message, replace_map);
            }
            const warning_str = `Warning: ${message}`;
            if (is_alert) {
                $.error_message(warning_str);
            } else {
                console.warn(warning_str);
            }
        }
    },

    log: function (obj) {
        if (this.kag.config["debugMenu.visible"] == "true") {
            console.log(obj);
        }
    },

    /**
     * オートモード状態を設定する (現在の状態からの変更がない場合は無視)
     * @param {boolean} bool オートモードにするかどうか
     */
    setAuto: function (bool) {
        if (this.stat.is_auto === bool) {
            return;
        }
        if (bool) {
            // ティラノイベント"auto-start"を発火
            this.trigger("auto-start");

            // グリフ表示
            this.kag.ftag.showGlyph("auto");
            this.kag.ftag.changeAutoNextGlyph();

            // オートモード状態にボタン画像を同期させる
            $(".button-auto-sync").each((i, elm) => {
                const j_elm = $(elm);
                const pm = JSON.parse(j_elm.attr("data-event-pm"));
                j_elm.attr("src", $.parseStorage(pm.autoimg, pm.folder));
                j_elm.addClass("src-change-disabled");
            });

            this.showModeEffect("auto");

            // スキップモードとオートモードは同時に成立しない
            this.setSkip(false);
        } else {
            this.stat.is_wait_auto = false;

            // ティラノイベント"auto-stop"を発火
            this.trigger("auto-stop");

            // グリフ非表示
            this.kag.ftag.hideGlyph("auto");
            this.kag.ftag.restoreAutoNextGlyph();

            // オートモード状態にボタン画像を同期させる
            $(".button-auto-sync").each((i, elm) => {
                const j_elm = $(elm);
                const pm = JSON.parse(j_elm.attr("data-event-pm"));
                j_elm.attr("src", $.parseStorage(pm.graphic, pm.folder));
                j_elm.removeClass("src-change-disabled");
            });

            this.showModeEffect("stop");
        }
        this.stat.is_auto = bool;
    },

    /**
     * スキップモード状態を設定する (現在の状態からの変更がない場合は無視)
     * @param {boolean} スキップモードにするかどうか
     * @param {options}
     */
    setSkip: function (bool, options = {}) {
        if (this.stat.is_skip === bool) {
            return;
        }
        if (bool) {
            // ティラノイベント"skip-start"を発火
            this.trigger("skip-start");

            // グリフ表示
            this.kag.ftag.showGlyph("skip");

            // スキップモード状態にボタン画像を同期させる
            $(".button-skip-sync").each((i, elm) => {
                const j_elm = $(elm);
                const pm = JSON.parse(j_elm.attr("data-event-pm"));
                j_elm.attr("src", $.parseStorage(pm.skipimg, pm.folder));
                j_elm.addClass("src-change-disabled");
            });

            this.showModeEffect("skip", options);

            // スキップモードとオートモードは同時に成立しない
            this.setAuto(false);
        } else {
            // ティラノイベント"skip-stop"を発火
            this.trigger("skip-stop");

            // グリフ非表示
            this.kag.ftag.hideGlyph("skip");

            // スキップモード状態にボタン画像を同期させる
            $(".button-skip-sync").each((i, elm) => {
                const j_elm = $(elm);
                const pm = JSON.parse(j_elm.attr("data-event-pm"));
                j_elm.attr("src", $.parseStorage(pm.graphic, pm.folder));
                j_elm.removeClass("src-change-disabled");
            });

            this.showModeEffect("stop", options);
        }
        this.stat.is_skip = bool;
    },

    /**
     * stat.is_stop に true を入れる
     *
     * - is_stop        (弱いストップ) アニメーションやトランジションの最中に有効
     * - is_strong_stop (強いストップ) [s]や[wait]で有効
     *
     * - 弱いストップが有効なときはイベントレイヤをクリックしても反応しなくなる。
     *   ただし、外部から直接 nextOrder が呼び出されたときは次のタグに進行する。
     * - 強いストップが有効なときは外部から呼び出された nextOrder にすら反応しなくなる！
     */
    weaklyStop: function () {
        this.stat.is_stop = true;
    },
    cancelWeakStop: function () {
        this.stat.is_stop = false;
    },
    stronglyStop: function () {
        this.stat.is_strong_stop = true;
    },
    cancelStrongStop: function () {
        this.stat.is_strong_stop = false;
    },
    waitClick: function (name) {
        // console.warn(`waitClick: ${name}`);
        this.layer.showEventLayer();
        this.cancelStrongStop();
        this.cancelWeakStop();
    },

    /**
     * ロガー
     * @param {string} event_name
     * @param  {Object} event_obj
     */
    logTrigger: function (event_name, event_obj) {
        let color = "orange";
        const hash = event_name.split(":");
        switch (hash[0]) {
            case "tag":
                color = "limegreen";
                break;
            case "storage":
                color = "yellow";
                break;
            case "click":
                color = "cyan";
                break;
        }
        const bgcolor = "#000";
        console.log("%c" + event_name, `padding: 4px 6px; border-radius: 4px; background: ${bgcolor}; color: ${color};`);
        console.log(event_obj);
    },

    /**
     * イベントログが有効かどうか
     */
    is_event_logging_enabled: false,

    /**
     * イベントログを有効にする
     */
    enableEventLogging: function () {
        this.is_event_logging_enabled = true;
    },

    /**
     * イベントリスナの数をログに出す
     */
    logEventLisnenerCount: function () {
        let str = "現在登録されているイベントリスナ\n";
        const map = this.event_listener_map;
        let sum = 0;
        for (const event in map) {
            if (map[event]) {
                str += `${event}: ${map[event].length}件\n`;
                sum += map[event].length;
            }
        }
        str += "%o";
        console.log(str, map);
        console.log(`合計 ${sum} 個のイベントリスナが登録されています。`);
    },

    /**
     * イベントを指定してイベントリスナ(コールバック)を呼び出す
     * コールバックに引数を渡すこともできる
     * コールバック内の this には kag が格納される
     * @param {string} event_name リスナを呼び出すイベント名
     * @param  {Object} [event_obj] リスナのコールバックに引数として渡すオブジェクト nameプロパティにはイベント名がセットされる
     */
    trigger: function (event_name, event_obj = {}) {
        event_obj.name = event_name;
        if (this.is_event_logging_enabled) this.logTrigger(event_name, event_obj);
        const map = this.event_listener_map;
        if (map[event_name] === undefined || map[event_name].length === 0) {
            return;
        }

        // onceリスナが存在するか
        let exists_once = false;

        // 削除対象のリスナのID格納
        const unbind_target_ids = [];

        for (const listener of map[event_name]) {
            let callback_return_value;
            if (typeof listener.callback === "function") {
                callback_return_value = listener.callback.call(this, event_obj);
            }
            // このリスナがonceリスナなら記憶しておく
            if (listener.once) {
                exists_once = true;
                unbind_target_ids.push(listener.id);
            }
            if (callback_return_value === false) {
                break;
            }
        }

        // onceリスナを除いた生き残りをメンバーとする配列を新しく作って代入
        if (exists_once) {
            const new_listeners = [];
            for (const listener of map[event_name]) {
                if (!unbind_target_ids.includes(listener.id)) {
                    new_listeners.push(listener);
                }
            }
            map[event_name] = new_listeners;
            if (this.is_event_logging_enabled) this.logEventLisnenerCount();
        }
    },

    /**
     * イベントリスナのカウンタ
     */
    event_listener_count: 0,

    /**
     * イベントリスナを登録する
     * @param {string} event_names 登録するイベント名 半角スペース区切りで複数イベントに対して一気に登録できる
     *   イベント名のあとにドット区切りで名前空間を指定できる(複数可能) あとから特定の名前空間のリスナだけを削除できる
     *   例) "resize load.ABC save.hoge.fuga"
     * @param {function} callback コールバック 第1引数にはeventオブジェクトが格納される
     *   コールバック内で return false するとイベントリスナの呼び出しを中断する
     *   それ以降のイベントリスナは呼び出されない(onceの削除もされない)
     * @param {Object} options
     * @param {boolean} options.once イベントリスナを1回実行したら削除すべきならtrue
     * @param {boolean} options.system (ユーザーが独自に追加したのではなく)システムが利用しているリスナならtrue
     * @param {boolean} options.temp セーブデータロード時に削除すべきならtrue
     * @param {number} options.priority　優先度。これが「高い」ほうから順に実行される。デフォルトは0
     */
    on: function (event_names, callback, options = {}) {
        // 例) "resize load.ABC save.hoge.fuga"
        const map = this.event_listener_map;
        const event_name_hash = event_names.split(" ");
        // 半角スペースで刻んだ各イベント文字列について
        for (const event_name of event_name_hash) {
            // 例) "save.hoge.fuga"
            const dot_hash = event_name.split("."); // ["save", "hoge", "fuga"]
            const event = dot_hash[0].replace(/:/g, "-"); // "save"
            const namespaces = dot_hash.slice(1); // ["hoge", "fuga"]
            if (event !== "") {
                if (map[event] === undefined) {
                    map[event] = [];
                }
                const listener = {
                    id: this.event_listener_count,
                    callback: callback,
                    namespaces: namespaces,
                    priority: options.priority || 0,
                    once: !!options.once || false,
                    system: options.system || false,
                    temp: options.temp || false,
                };
                map[event].push(listener);
                this.event_listener_count += 1;
                this.sortEventLisneners(event);
            }
        }
        if (this.is_event_logging_enabled) this.logEventLisnenerCount();
    },

    /**
     * on メソッドのラッパー
     * once オプションを true で上書きしたうえで on メソッドに投げる
     * @param {string} event_names
     * @param {function} callback
     * @param {ListenerOption} options
     */
    once: function (event_names, callback, options = {}) {
        options.once = true;
        this.on(event_names, callback, options);
    },

    /**
     * on + off メソッドのラッパー
     * @param {string} event_names
     * @param {function} callback
     * @param {ListenerOption} options
     */
    overwrite: function (event_names, callback, options = {}) {
        this.off(event_names, options);
        this.on(event_names, callback, options);
    },

    /**
     * イベントリスナをソートする
     * - priority (優先度)が高いほうが先頭
     * - priority が同じ場合は、先に登録されたほうが先頭
     * @param {string} evnet_name
     */
    sortEventLisneners: function (evnet_name) {
        const listeners = this.event_listener_map[evnet_name];
        if (Array.isArray(listeners)) {
            listeners.sort((a, b) => {
                if (a.priority > b.priority) {
                    return -1;
                } else if (a.priority < b.priority) {
                    return 1;
                }
                return a.id < b.id ? -1 : 1;
            });
        }
    },

    /**
     * イベントリスナを削除する
     * @param {*} event_names リスナを削除するイベント名
     *   半角スペース区切りで複数イベントを指定可能 それぞれのイベントリスナを一括で削除できる
     *   ドット区切りで名前空間を複数指定可能 指定したすべての名前空間を持つリスナだけを削除できる
     *   いきなりドットで書き始めることで削除対象のリスナを"名前空間だけ"で指定することも可能
     * @param {Object} options
     * @param {boolean} options.system システムリスナを除去するかどうか
     */
    off: function (event_names, options = {}) {
        const map = this.event_listener_map;
        const event_name_hash = event_names.split(" ");
        for (const event_name of event_name_hash) {
            // 半角スペースで刻んだ各イベント文字列について
            const dot_hash = event_name.split(".");
            const event = dot_hash[0];
            const del_namespaces = dot_hash.slice(1);
            if (event && (map[event] === undefined || map[event].length === 0)) {
                // そのイベントに登録されているイベントリスナがない場合
                // なにもしなくていい
            } else {
                // そのイベントに登録されているイベントリスナがある場合
                // イベントリスナを順繰りに見て選別していく

                // イベント名が空欄で名前空間だけが指定されている場合はすべてのイベントを処理対象とする
                let event_list;
                if (event === "") {
                    event_list = Object.keys(map);
                } else {
                    event_list = [event];
                }

                // 各イベントについて
                for (const _event of event_list) {
                    // 生き残りリスナたち
                    const new_listeners = [];
                    // このイベントに登録されている各リスナについて
                    for (const listener of map[_event]) {
                        // このリスナは生き残るべきだろうか？
                        // デフォルトはfalse(生き残るべきでない)として、生き残るものを選別していく
                        let should_keep = false;

                        // 削除対象名前空間は複数でありうる！その場合はAND指定と解釈する
                        // AND指定、つまり、削除対象名前空間を"すべて"持つリスナだけを削除したい
                        // 削除対象名前空間のうちのひとつでも保有しないものがあるリスナは生き残り確定
                        for (const this_del_namespace of del_namespaces) {
                            if (!listener.namespaces.includes(this_del_namespace)) {
                                should_keep = true;
                                break;
                            }
                        }

                        // システムリスナの場合、基本生き残り確定だが、
                        if (listener.system) {
                            should_keep = true;
                            // システムリスナすら除去するオプションが指定されているようならやっぱり殺す
                            if (options.system) {
                                should_keep = false;
                            }
                        }

                        // 生き残り確定のリスナは新しいリスナリストに追加する
                        if (should_keep) {
                            new_listeners.push(listener);
                        }
                    }
                    map[_event] = new_listeners;
                }
            }
        }
        if (this.is_event_logging_enabled) this.logEventLisnenerCount();
    },

    /**
     * 一時リスナをすべて削除する
     */
    offTempListeners: function () {
        const map = this.event_listener_map;
        for (const event in map) {
            if (map[event]) {
                map[event] = map[event].filter((listener) => {
                    return !listener.temp;
                });
            }
        }
        if (this.is_event_logging_enabled) this.logEventLisnenerCount();
    },

    /**
     * @typedef {Object} Tag タグのロジック定義
     * @property {Object} pm タグのパラメータの初期値 これにユーザーの指定パラメータがマージされたものがstartに渡される
     * @property {Array} vital 必須パラメータ名の配列
     * @property {function} start タグの処理ロジック このなかで this.kag.ftag.nextOrder() しないと次のタグに進まない
     * @property {Object} kag TYRANO.kagへの参照
     */
    /**
     * タグのロジック定義への参照を取得する
     * @param {string} tag_name
     * @returns {Tag}
     */
    getTag: function (tag_name = "") {
        return this.ftag.master_tag[tag_name];
    },

    /**
     * ティラノスクリプトの[keyframe]-[frame]-[endkeyframe]で定義されたキーフレームアニメーションを
     * Web Animation APIで使用できるキーフレーム情報に変換する
     * @param {string} name [keyframe]タグに指定したname
     * @returns {Object[] | null} キーフレーム情報
     */
    parseKeyframesForWebAnimationAPI: function (name) {
        if (!(this.stat.map_keyframe[name] && this.stat.map_keyframe[name].frames)) {
            return null;
        }
        const frames = this.stat.map_keyframe[name].frames;
        const keyframes = [];
        for (const percentage_str in frames) {
            const percentage_int = parseInt(percentage_str);
            const offset = percentage_int / 100;
            const frame = frames[percentage_str];
            const this_keyframe = {};
            // transform
            const transform_strs = [];
            for (const _key in frame.trans) {
                let key = _key;
                let value = frame.trans[_key];
                if (_key === "x" || _key === "y" || _key === "z") {
                    key = "translate" + _key.toUpperCase();
                    value = value + "px";
                }
                transform_strs.push(`${key}(${value})`);
            }
            if (transform_strs.length > 0) {
                this_keyframe["transform"] = transform_strs.join(" ");
            }
            // transform以外のスタイル
            for (const _key in frame.styles) {
                if (_key === "_tag") {
                    continue;
                }
                const key = $.parseCamelCaseCSS(_key);
                this_keyframe[key] = $.convertColor(frame.styles[_key]);
            }
            // 進行度(0～1の小数点数)
            this_keyframe.offset = offset;
            keyframes.push(this_keyframe);
        }
        return keyframes;
    },

    /**
     * div#hidden_area　を取得する
     * @return {jQuery}
     */
    getHiddenArea() {
        // プロパティに代入済みならそれを即返す
        if (this.__j_hiden_area) {
            return this.__j_hiden_area;
        }

        // プロパティに代入されていない場合とりあえずサーチしてみる 見つかったらプロパティに代入して返す
        let j_hidden_area = $("#hidden_area");
        if (j_hidden_area.length > 0) {
            this.__j_hiden_area = j_hidden_area;
            return j_hidden_area;
        }

        // なければ新しく作ろう
        j_hidden_area = $('<div id="hidden_area" />').appendTo("body").css({
            position: "fixed",
            left: "200%",
            top: "200%",
            opacity: "0",
        });

        this.__j_hiden_area = j_hidden_area;
        return j_hidden_area;
    },

    __j_hiden_area: null,

    /**
     * 再生中のHowlオブジェクトの音量を変更する
     * @param {Howl} audio_obj
     * @param {{ tag: number | undefined; config: number | undefined; }} volume_options
     */
    changeHowlVolume: function (audio_obj, options = {}) {
        // 音声再生タグに指定されていたvolumeを思い出せ…！ 忘れてたら1だったことにしろ…！
        let tag_volume = audio_obj.__tag_volume !== undefined ? audio_obj.__tag_volume : 1;

        // 音声再生タグが実行された時点のコンフィグ音量を思い出せ…！ 忘れてたら1だったことにしろ…！
        let config_volume = audio_obj.__config_volume !== undefined ? audio_obj.__config_volume : 1;

        // タグ音量を変更する場合
        if (options.tag !== undefined) {
            tag_volume = options.tag;
        }

        // コンフィグ音量を変更する場合
        if (options.config !== undefined) {
            config_volume = options.config;
        }

        // 改めて掛け算しよう
        const new_howl_volume = tag_volume * config_volume;

        // フェード処理するかどうかで場合分け
        if (options.time && parseInt(options.time) !== 0) {
            const duration = Math.max(100, parseInt(options.time));
            audio_obj.fade(audio_obj.volume(), new_howl_volume, duration);
        } else {
            audio_obj.volume(new_howl_volume);
        }

        // 記憶改変！
        audio_obj.__tag_volume = tag_volume;
        audio_obj.__config_volume = config_volume;
    },

    /**
     * ボタンクリックSEなどシステム系の効果音を鳴らすための関数
     * nextOrder を呼ばない
     * @param {string} storage
     */
    playSound: function (storage, buf) {
        this.kag.ftag.startTag("playse", {
            storage: storage,
            buf: buf,
            stop: "true",
        });
    },

    /**
     * あるjQueryオブジェクト（ボタン類）をキーボードでフォーカス可能にする
     * @param {jQuery} j_elm
     * @param {number|string} tabindex
     */
    makeFocusable: function (j_elm, tabindex = 0) {
        // キーフォーカスが無効なら帰る
        if (this.config["useKeyFocus"] === "false") {
            return;
        }
        if (typeof tabindex === "string") {
            if (tabindex === "false") {
                return;
            }
            tabindex = parseInt(tabindex) || 0;
        }
        j_elm.attr("tabindex", tabindex);
        j_elm.addClass("tyrano-focusable");
        j_elm.off("focusin focusout");
        // この要素にmousedownが発生したときのタイムスタンプを記憶しておく
        let mousedown_timestamp = 0;
        let mousedown_target = null;
        j_elm.on("mousedown", (e) => {
            mousedown_timestamp = e.timeStamp;
            mousedown_target = e.target;
        });

        // 要素にフォーカスが当たったときのイベントハンドラを設定する
        // 要素にフォーカスが当たるのは次の3ケース
        // - マウスクリックによる選択
        // - Tabキーによる選択
        // - focus()メソッドの使用
        j_elm.on("focusin", (e) => {
            // Tabキーによる選択でこの要素にフォーカスが当たったときに
            // mouseenterイベントをトリガーすることで、
            // 本来マウスを乗せたときに生じる効果音の再生などを再現することができる。
            // if (this.config["keyFocusWithHoverStyle"] === "true") {
            //     j_elm.trigger("mouseenter");
            // }

            // しかし、マウスクリックでこの要素にフォーカスが当たった場合に
            // mouseenterをトリガーしてしまうと、
            // mouseenterが二重に実行されることになるため、おかしなことになる

            // したがって、マウスクリックでフォーカスが当たった場合を検知して除外する必要がある
            // focusinイベントが発火する直前（10ミリ秒以内）に同じ要素でmousedownイベントが発火している場合は
            // マウスクリックでフォーカスが当たったと見なす
            let by_mousedown = e.timeStamp - mousedown_timestamp < 10 && mousedown_target === e.target;
            if (by_mousedown) {
                // console.log("マウスクリックによるフォーカス");
            } else {
                // console.log("TabキーやJS操作によるフォーカス");
                if (this.config["keyFocusWithHoverStyle"] === "true") {
                    j_elm.trigger("mouseenter");
                }
            }

            j_elm.addClass("focus");
        });

        // 要素にフォーカスが当たったときのイベントハンドラを設定する
        // 要素にフォーカスが当たるのは次の3ケース
        // - マウスクリックによる選択
        // - Tabキーによる選択
        // - focus()メソッドの使用
        j_elm.on("focusin", (e) => {
            // Tabキーによる選択でこの要素にフォーカスが当たったときに
            // mouseenterイベントをトリガーすることで、
            // 本来マウスを乗せたときに生じる効果音の再生などを再現することができる。
            // if (this.config["keyFocusWithHoverStyle"] === "true") {
            //     j_elm.trigger("mouseenter");
            // }

            // しかし、マウスクリックでこの要素にフォーカスが当たった場合に
            // mouseenterをトリガーしてしまうと、
            // mouseenterが二重に実行されることになるため、おかしなことになる

            // したがって、マウスクリックでフォーカスが当たった場合を検知して除外する必要がある
            // focusinイベントが発火する直前（10ミリ秒以内）に同じ要素でmousedownイベントが発火している場合は
            // マウスクリックでフォーカスが当たったと見なす
            let by_mousedown = e.timeStamp - mousedown_timestamp < 10 && mousedown_target === e.target;
            if (by_mousedown) {
                // console.log("マウスクリックによるフォーカス");
            } else {
                // console.log("TabキーやJS操作によるフォーカス");
                if (this.config["keyFocusWithHoverStyle"] === "true") {
                    j_elm.trigger("mouseenter");
                }
            }

            j_elm.addClass("focus");
            
        });
        
        j_elm.on("focusout", () => {
            if (this.config["keyFocusWithHoverStyle"] === "true") {
                j_elm.trigger("mouseleave");
            }
            j_elm.removeClass("focus");
        });
    },

    /**
     * あるjQueryオブジェクト（ボタン類）をキーボードでフォーカス不可能にする
     * @param {jQuery} j_elm
     */
    makeUnfocusable: function (j_elm) {
        // キーフォーカスが無効なら帰る
        if (this.config["useKeyFocus"] === "false") {
            return;
        }
        j_elm.removeAttr("tabindex");
        j_elm.removeClass("tyrano-focusable");
        j_elm.off("focusin focusout");
    },

    /**
     * あるjQueryオブジェクトに含まれるすべてのボタン類をフォーカス不可能にする
     * @param {jQuery} j_elm
     */
    makeUnfocusableAll: function (j_elm) {
        // キーフォーカスが無効なら帰る
        if (this.config["useKeyFocus"] === "false") {
            return;
        }
        this.makeUnfocusable(j_elm.find("[tabindex]"));
    },

    /**
     * フォーカスを外す
     */
    unfocus: function () {
        $(":focus").blur().removeClass("hover");
    },

    /**
     * フォーカスの復元
     * イベントリスナやホワイトリストに載っていないアトリビュートはセーブ＆ロード時に破壊されるため
     * 改めて準備する必要がある
     */
    restoreFocusable: function () {
        // キーフォーカスが無効なら帰る
        if (this.config["useKeyFocus"] === "false") {
            return;
        }

        $(".tyrano-focusable").each((i, elm) => {
            const j_elm = $(elm);
            const tabindex = parseInt(j_elm.attr("tabindex")) || 0;
            this.makeFocusable(j_elm, tabindex);
        });
    },

    chara: {
        init() { },

        /**
         * 発言者の名前欄を意味する p 要素を返す
         * [chara_config] タグによる chara_ptext の設定が済んでいない場合は
         * 空のjQueryオブジェクトを返す
         * @returns {jQuery}
         */
        getCharaNameArea() {
            return this.kag.stat.chara_ptext ? $("." + this.kag.stat.chara_ptext) : $();
        },

        /**
         * 発言者の名前を返す
         * 発言者がいない場合は空の文字列を返す
         * @returns {string}
         */
        getCharaName(convert_to_id) {
            let chara_name = "";

            // stat.current_speakerが未定義でないならそれを返す
            if (this.kag.stat.current_speaker !== undefined) {
                return this.kag.stat.current_speaker;
            }

            // stat.current_speakerが未定義の場合は
            // 泥臭いがchara_ptext_areaから抽出する必要がある
            if (this.kag.stat.chara_ptext != "") {
                // 発言者エリアを取得
                const j_chara_name = this.getCharaNameArea();
                if (!j_chara_name.hasClass("multiple-text")) {
                    // ふつうはこれでよい
                    chara_name = $.isNull(j_chara_name.html());
                } else {
                    // 個別縁取りが施されている場合
                    // この場合はそのままhtml()するとエラいことになる！
                    // span
                    //   span.stroke あ
                    //   span.fill   あ
                    // span
                    //   span.stroke か
                    //   span.fill   か
                    // span
                    //   span.stroke ね
                    //   span.fill   ね
                    // こんな構造になっているから
                    chara_name = j_chara_name.find(".fill").text();
                }
            }

            // IDへの変換をする場合
            if (convert_to_id) {
                if (this.kag.stat.jcharas[chara_name]) {
                    chara_name = this.kag.stat.jcharas[chara_name];
                }
            }

            return chara_name;
        },

        /**
         * 発言していない人用のスタイルを当てる
         * @param {jQuery} j_chara
         */
        setNotSpeakerStyle(j_chara) {
            const filter = this.kag.stat.apply_filter_str;
            j_chara.setFilterCSS(filter);
        },

        /**
         * 発言している人用のスタイルを当てる
         * @param {jQuery} j_chara
         */
        setSpeakerStyle: function (j_chara) {
            // 発言していない人はフィルターなし
            const filter = "";
            j_chara.setFilterCSS(filter);
        },

        /**
         * mix-blend-mode: plus-lighter を使用するか？
         * @returns {boolean}
         */
        isPlusLighterEnabled() {
            return this.kag.stat.plus_lighter === "true";
        },

        /**
         * キャラの div 要素を返す
         * chara_name を省略することで全キャラの div 要素を取得できる
         * @param {string} [chara_name]
         * @param {jQuery} [j_layer]
         * @returns {jQuery}
         */
        getCharaContainer(chara_name, j_layer) {
            // レイヤ指定がなければすべての fore レイヤから探す
            if (!j_layer) j_layer = $(".layer_fore");

            // chara_name 指定がない場合はすべてのキャラを探す
            let chara_selector = "";
            if (chara_name) chara_selector = "." + chara_name;

            return j_layer.find(".tyrano_chara" + chara_selector);
        },

        /**
         * キャラの各パーツを div でラップする処理。
         *
         * V514時点でキャラのDOM構造は次のようになっている。
         *
         * div.tyrano_chara.akane
         *     img.chara_img      ← [chara_face]  で定義, [chara_mod]  で表示変更
         *     img.part.eye       ← [chara_layer] で定義, [chara_part] で表示変更
         *     img.part.mouth
         * 　　　...
         *
         * これを
         *
         * div.tyrano_chara.akane
         *     div.chara_part_container
         *         img.chara_img
         *     div.chara_part_container
         *         img.part.eye
         *     div.chara_part_container
         *         img.part.mouth
         * 　　 ...
         *
         * のように変更する。各パーツの img 要素を div 要素でラップする。
         * @param {jQuery} j_chara
         */
        setPartContainer(j_chara) {
            if (!this.isPlusLighterEnabled()) return;
            j_chara.children("img").each((i, img) => {
                this.wrapPartContainer(img);
            });
        },

        /**
         * ひとつの img 要素を div.chara_part_container 要素でラップする
         * @param {Element | jQuery} j_img
         */
        wrapPartContainer(j_img) {
            const j_div = $('<div class="chara_part_container plus_lighter_container" />');
            j_div.insertAfter(j_img);
            j_div.append(j_img);
        },

        /**
         * リップシンクの対象となるパーツを取得する。
         * 取得できなかった場合はnullが返る。
         * @param {string} name - キャラクターの名前。
         * @param {string} type - リップシンクタイプ。"voice"または"text"。
         * @returns {Array<Object>} target_parts - 更新対象のパーツの配列。
         * @returns {Object} target_parts[].j_frames - jQueryオブジェクト。フレームのコレクション。
         * @returns {Array<number>} target_parts[].thresholds - 各フレームを表示するための閾値の配列。
         */
        getLipSyncParts(name, type = "voice") {
            // キャラ定義
            const cpm = this.kag.stat.charas[name];

            // キャラ定義が存在しない→無効
            if (!cpm) return null;
            // キャラが表示されていない→無効
            if (!cpm.is_show === "false") return null;
            // キャラ定義は存在するがリップシンクタイプが一致しない→無効
            if (cpm.lipsync_type !== type) return null;

            // キャラのjQueryオブジェクト
            const j_chara = this.kag.chara.getCharaContainer(name);

            // キャラのjQueryオブジェクトが取得できない→無効
            if (j_chara.length === 0) return null;

            //
            // 現在のキャラクターのパーツの状況をチェック
            //

            // リップシンクのパーツを格納する配列
            // 口が複数あるようなキャラクターを一応想定している
            const target_parts = [];

            // すべてのパーツを走査してリップシンク対象のパーツを特定する
            const part_map = cpm._layer;
            if (!part_map) return;
            for (const part in part_map) {
                const part_obj = part_map[part];
                const state = part_obj.current_part_id;
                const part_state_obj = part_obj[state];
                if (!part_state_obj || !part_state_obj.is_lipsync_enabled) {
                    continue;
                }
                // ここに到達したならばこのパーツはリップシンク対象である

                // このパーツのすべてのフレームの<img>要素の集合を取得
                const j_frames = j_chara.find(`.lipsync-frame[data-effect="${part}-${state}"]`);
                const thresholds = part_state_obj.lip_volume;
                if (j_frames.length > 0 && thresholds) {
                    target_parts.push({
                        j_frames,
                        thresholds,
                        current_index: 0,
                        max_open_mouth_time: 0,
                        text_lipsync_timer_id: 0,
                        def: part_state_obj,
                    });
                }
            }
            // 対象のパーツがない→無効
            if (target_parts.length === 0) return null;

            return target_parts;
        },

        /**
         * フレームアニメーションの各フレームの画像ソースの配列を取得する
         * @param {Object} cpm - キャラ定義。例）TYRANO.kag.stat.charas.akane
         * @param {string} part - パーツ部位名。例）eye
         * @param {string} state - パーツ状態名。例）smile
         * @returns {Array<string>}
         */
        getFrameAnimationSrcs(cpm, part, state) {
            // パーツ状態がstorage直接指定の場合は無視
            if (state === "allow_storage") {
                return [];
            }

            // パーツ状態定義を取得
            const state_obj = cpm["_layer"][part][state];

            // frame_image属性が未指定なら無視
            if (!state_obj.frame_image) {
                return [];
            }

            // 画像ソースの配列
            const srcs = [];

            // 画像ファイルの拡張子を取得する関数
            const image_extensions = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "tiff", "tif", "svg", "ico"];
            const get_image_extension = (filename) => {
                const extension = filename.split(".").pop();
                return image_extensions.includes(extension.toLowerCase()) ? extension : null;
            };

            // ベースフレームの画像ファイルのパス
            const base_path = $.parseStorage(state_obj.storage, "fgimage");
            const base_extension = get_image_extension(base_path);

            // すべてのフレームについて画像ソースを決定
            state_obj.frame_image.forEach((frame_src) => {
                // このフレームの画像ソースの拡張子を取得
                // ※省略されている場合もある！
                const frame_extension = get_image_extension(frame_src);

                // ベースのパスのファイル名部分を置換する
                const hash_slash = base_path.split("/");
                let new_filename;
                // ベースのパスには拡張子が指定されているがこのフレームには拡張子が指定されていない場合
                // ベースのパスの拡張子でこのフレームのソースを補う
                if (base_extension && !frame_extension) {
                    new_filename = `${frame_src}.${base_extension}`;
                } else {
                    new_filename = frame_src;
                }
                hash_slash.pop();
                hash_slash.push(new_filename);
                const src = hash_slash.join("/");

                srcs.push(src);
            });

            return srcs;
        },

        /**
         * フレームアニメーションを設定する
         * @param {Object} cpm - キャラ定義。例）TYRANO.kag.stat.charas.akane
         * @param {string} part - パーツ部位名。例）eye
         * @param {string} state - パーツ状態名。例）smile
         * @param {jQuery} j_frame_base - ベースとなるパーツの<img>要素。
         * @param {Array<string>} preload_srcs - この配列に画像ソースを入れておくと関数の呼び出し元でプリロードに使われる。
         * @returns {jQuery|null}
         */
        setFrameAnimation(cpm, part, state, j_frame_base, preload_srcs) {
            // フレームの画像ソースの配列
            const frame_srcs = this.getFrameAnimationSrcs(cpm, part, state);
            if (!frame_srcs.length) {
                return null;
            }

            // パーツ状態定義を取得
            const state_obj = cpm["_layer"][part][state];

            let j_frames = $(j_frame_base);
            let j_prev_frame = j_frame_base;

            // すべてのフレームについて<img>要素を作成
            frame_srcs.forEach((frame_src) => {
                // オリジナルの<img>要素をクローンする
                const j_clone = j_frame_base.clone();

                // 属性、クラス、CSSの調整
                j_clone.attr("src", frame_src);
                j_clone.addClass("sub");
                j_clone.removeClass("base");
                j_clone.css("visibility", "hidden");

                // プリロードに追加
                if (preload_srcs) {
                    preload_srcs.push(frame_src);
                }

                // オリジナルの画像の後ろに追加していく
                j_clone.insertAfter(j_prev_frame);
                j_prev_frame = j_clone;

                // jQueryオブジェクトの集合に追加しておく
                j_frames = j_frames.add(j_clone);
            });

            if (state_obj.lip_image) {
                cpm.lipsync_type = state_obj.lip_type;
                state_obj.is_lipsync_enabled = true;
                j_frame_base.addClass("base");
                j_frames.addClass("lipsync-frame");
                j_frames.attr("data-effect", `${part}-${state}`);
                return j_frames;
            }

            // オリジナルの<img>要素にクラスと属性付与
            // キャラの名前、パーツ部位の名前、パーツ状態の名前を記憶
            j_frame_base.addClass("base");
            j_frame_base.attr(
                "data-restore",
                JSON.stringify({
                    chara_name: cpm.name,
                    part_name: part,
                    state_name: state,
                }),
            );

            // すべての<img>要素にクラスと属性付与
            j_frames.each(function (i) {
                const j_img = $(this);
                j_img.addClass("chara-layer-frame");
                j_img.attr("data-effect", i);
                j_img.attr("data-event-pm", part);
            });

            this.startFrameAnimation(state_obj, j_frames);
            return j_frames;
        },

        /**
         * フレームアニメーションを開始する
         * @param {string} state_obj - パーツ状態定義。例）cpm._layer.eye.smile
         * @param {jQuery} j_frames - フレームアニメーションを構成するすべての<img>要素のjQueryコレクション
         */
        startFrameAnimation(state_obj, j_frames) {
            // フレーム番号
            let frame_index = 0;

            // 最初のフレームから最後のフレームに向かっている最中であるかどうか
            let to_last = true;

            // 総フレーム数
            const frame_count = state_obj.frame_image.length + 1;

            const calc_duration = (i) => {
                let duration = state_obj.frame_time[i] || 40;
                if (Array.isArray(duration)) {
                    const min = duration[0];
                    const max = duration[1];
                    duration = Math.floor(min + (max - min) * Math.random());
                }
                return duration;
            };

            // フレームアニメーション1枚分の処理
            const anim = () => {
                clearTimeout(state_obj.frame_timer_id);

                // すでにDOMから削除されている場合はフレームアニメーションを終了する
                if (j_frames.eq(0).closest("html").length === 0) {
                    return;
                }

                // フレーム番号増加
                switch (state_obj.frame_direction) {
                    // 0-1-2-3-2-1-0のような変化
                    case "alternate":
                        if (to_last) {
                            frame_index += 1;
                            if (frame_index === frame_count) {
                                frame_index -= 2;
                                to_last = false;
                            }
                        } else {
                            frame_index -= 1;
                            if (frame_index === -1) {
                                frame_index += 2;
                                to_last = true;
                            }
                        }
                        break;
                    // 0-1-2-3-0-1-2-3のような変化
                    default:
                        frame_index = (frame_index + 1) % frame_count;
                        break;
                }

                // すべてのフレーム画像を非表示にしてから
                // 現在のフレーム画像だけを表示する
                j_frames.showAtIndexWithVisibility(frame_index);

                // 最後のフレームでループしない設定なら終了する
                if (frame_index === frame_count - 1) {
                    if (state_obj.frame_loop === "false") {
                        return;
                    }
                }

                // 次のフレームまでの時間
                const duration = calc_duration(frame_index);

                // 次回のフレーム処理の予約
                state_obj.frame_timer_id = setTimeout(anim, duration);
            };

            // 最初の瞬き
            state_obj.frame_timer_id = setTimeout(anim, calc_duration(0));
        },

        /**
         * すべてのキャラクターのフレームアニメーションを停止する
         * ロード時に呼び出す
         * @returns
         */
        stopFrameAnimation(cpm) {
            if (!cpm._layer) {
                return;
            }
            for (const part in cpm._layer) {
                for (const state in cpm._layer[part]) {
                    clearTimeout(cpm._layer[part][state].frame_timer_id);
                }
            }
        },

        /**
         * すべてのキャラクターのフレームアニメーションを停止する
         * ロード時に呼び出す
         * @returns
         */
        stopAllFrameAnimation() {
            // キャラが存在しない場合なにもしない
            const charas = this.kag.stat.charas;
            if (!charas) {
                return;
            }

            // すべてのキャラについて瞬きのsetTimeoutを停止
            for (const name in this.kag.stat.charas) {
                const cpm = charas[name];
                this.stopFrameAnimation(cpm);
            }
        },

        /**
         * ゲーム画面に出ているすべてのキャラクターの瞬きを復元する
         * ロード時に呼び出す
         */
        restoreAllFrameAnimation() {
            const that = this;

            // フレームアニメーションの復元作業
            $(".chara-layer-frame.base").each(function () {
                try {
                    // ベース画像
                    const j_frame_base = $(this);
                    // 保存しておいた設定値
                    const setting = JSON.parse(j_frame_base.attr("data-restore"));
                    // キャラ定義
                    const cpm = that.kag.stat.charas[setting.chara_name];
                    // キャラパーツ状態定義
                    const state_obj = cpm._layer[setting.part_name][setting.state_name];

                    // このパーツのフレームアニメーションの
                    // すべてのフレーム画像を含むようなコレクション
                    let j_frames = $(j_frame_base);
                    const j_siblings = j_frame_base.siblings(`.chara-layer-frame[data-event-pm=${setting.part_name}]`);
                    j_frames = j_frames.add(j_siblings);

                    // いったんベース画像を表示する
                    const i = j_frames.index(j_frame_base);
                    j_frames.showAtIndexWithVisibility(i);

                    // フレームアニメーションを開始
                    that.startFrameAnimation(state_obj, j_frames);
                } catch (e) {
                    console.error(e);
                }
            });

            // リップシンクが有効な口パーツをベース画像に戻す
            // 口パク中にセーブされる可能性があるためその対策
            $(".lipsync-frame.base").each(function () {
                try {
                    const j_frame_base = $(this);
                    const data_effect = j_frame_base.attr("data-effect");
                    j_frame_base.siblings(`.sub[data-effect=${data_effect}]`).css("visibility", "hidden");
                    j_frame_base.css("visibility", "visible");
                } catch (e) {
                    console.error(e);
                }
            });
        },

        /**
         * リップシンクを更新するメソッド。
         * 入力値に基づいて、指定されたパーツの表示状態を変更する。
         * @param {number} value - 現在の振幅の値。
         * @param {Array<Object>} target_parts - 更新対象のパーツの配列。
         * @param {number} elapsed_time - 前回のリップシンクからの経過時間。
         * @param {Object} target_parts[].j_frames - jQueryオブジェクト。フレームのコレクション。
         * @param {Array<number>} target_parts[].thresholds - 各フレームを表示するための閾値の配列。
         * @param {number} target_parts[].current_index - 前回表示したフレームのインデックス。
         */
        updateLipSyncWithVoice(value, target_parts, elapsed_time) {
            target_parts.forEach((part) => {
                // 閾値から現在形成すべきリップフレーム番号を特定する
                let target_i = 0;
                for (; target_i < part.thresholds.length; target_i++) {
                    if (value < part.thresholds[target_i]) {
                        break;
                    }
                }

                // 前回のリップフレーム番号と同じであれば何も処理しなくてよい
                if (target_i === part.current_index) {
                    return;
                }

                // ここに到達したならば前回のリップフレーム番号とは異なるということ

                // 先ほどまで口を最大まで開けていた場合
                if (part.current_index === part.thresholds.length) {
                    // 経過時間を数える
                    part.max_open_mouth_time += elapsed_time;
                    // 一度口を開けたら200ミリ秒間はそのまま固定する
                    if (part.max_open_mouth_time < 200) {
                        return;
                    } else {
                        part.max_open_mouth_time = 0;
                    }
                }

                // より口を大きく開こうとしている
                if (target_i > part.current_index) {
                    // 1ずつ大きくしよう
                    target_i = part.current_index + 1;
                } else {
                    // 1ずつ小さくしよう
                    target_i = part.current_index - 1;
                }

                part.j_frames.showAtIndexWithVisibility(target_i);
                part.current_index = target_i;
            });
        },
    },

    /**
     * モード変化のエフェクトを出す
     * @param {"skip" | "stop" | "auto"} type
     * @param {Object} [options]
     * @param {boolean} options.hold
     * @returns
     */
    showModeEffect(_type, options = {}) {
        clearTimeout(this.tmp.screen_effect_timer_id);

        const type = options.hold ? "hold" + _type : _type;

        // 10ミリ秒後にエフェクトを予約
        this.tmp.screen_effect_timer_id = setTimeout(() => {
            // 10ミリ秒後の時点でモードに変化がなければリターン
            if (this.kag.tmp.prev_screen_effect_type === type) return;

            this.kag.tmp.prev_screen_effect_type = type;

            // この環境の定義がなければリターン
            const env = $.userenv() === "pc" ? "pc" : "phone";
            if (!this.tmp.mode_effect[env] || !this.tmp.mode_effect[env][type]) return;

            // storage が取れなければリターン
            const def = this.tmp.mode_effect[env][type];
            const storage = def.storage;
            if (!storage || storage === "none") return;

            // 前回エフェクトの削除
            $("#mode_effect").remove();

            // デフォルトなら div 要素, 画像が指定されているなら img 要素
            let j_effect;
            if (storage === "default") {
                j_effect = $(`<div id="mode_effect" class="mode_effect mode_effect_default ${_type}"><div></div><div></div></div>`);
                if (def.width && def.width !== "auto") j_effect.css("font-size", `${(def.width / 15).toFixed(0)}px`);
                if (def.bgcolor) j_effect.css("background", $.convertColor(def.bgcolor));
                if (def.color) {
                    if (_type === "stop") {
                        j_effect.children().eq(0).css("border-right-color", $.convertColor(def.color));
                        j_effect.children().eq(1).css("border-left-color", $.convertColor(def.color));
                    } else {
                        j_effect.children().css("border-left-color", $.convertColor(def.color));
                    }
                }
            } else {
                const src = $.parseStorage(storage, "image");
                j_effect = $(`<img id="mode_effect" src="${src}" class="mode_effect ${type}" />`);
                if (def.width && def.width !== "auto") j_effect.css("width", $.convertLength(def.width));
                if (def.height && def.height !== "auto") j_effect.css("height", $.convertLength(def.height));
            }

            const duration = 800;
            j_effect.setStyle("animation-duration", `${duration}ms`);

            $("#tyrano_base").append(j_effect);

            setTimeout(() => {
                j_effect.remove();
            }, duration);
        }, 10);
    },

    /**
     * 「ローディング中...」のログを画面端に出す
     * @param {"preload" | "save"} type
     */
    showLoadingLog(type = "preload") {
        // 未定義なら
        if (!this.kag.stat.loading_log) return;

        // 予約解除
        const tmp = this.kag.tmp;
        clearTimeout(tmp.loading_log_hide_timer_id);

        // テキスト参照
        let text = this.kag.stat.loading_log.message_map[type];
        if (!text || text === "none") return;
        if (text === "default") text = this.kag.getTag("loading_log").default_message_map[type];
        if (text === "notext") text = "";
        tmp.j_loading_log_message.text(text);

        // 「...」のアニメーションの設定
        if (text) {
            tmp.j_loading_log_message.setStyle("animation-duration", `${this.kag.stat.loading_log.dot_time}ms`);
        }

        if (this.kag.stat.loading_log.use_icon) {
            tmp.j_loading_log_icon.show();
        } else {
            tmp.j_loading_log_icon.hide();
        }

        // タイムアウトを設ける (数フレームだけローディングが出るのは鬱陶しいため)
        clearTimeout(tmp.loading_log_timer_id);
        tmp.loading_log_timer_id = $.setTimeout(() => {
            tmp.j_loading_log.show();
        }, Math.max(11, this.kag.stat.loading_log.min_time));
    },

    /**
     * 「ローディング中」のログを消す
     */
    hideLoadingLog() {
        if (!this.kag.ftag.master_tag.loading_log || !this.kag.ftag.master_tag.loading_log.initialized) return;
        const tmp = this.kag.tmp;
        clearTimeout(tmp.loading_log_hide_timer_id);
        tmp.loading_log_hide_timer_id = setTimeout(() => {
            clearTimeout(tmp.loading_log_timer_id);
            tmp.j_loading_log.hide();
        }, 10);
    },


    convertLang(scenario, array_s) {

        if (this.kag.lang == "") return array_s;

        if (!this.kag.map_lang["scenes"][scenario]) {
            return array_s;
        }

        let map_trans = this.kag.map_lang["scenes"][scenario];
        let map_charas = this.kag.map_lang["charas"];


        let is_script = false;

        for (let i = 0; i < array_s.length; i++) {

            const tobj = array_s[i];

            if (tobj.name === "iscript") {
                is_script = true;
            } else if (tobj.name === "endscript") {
                is_script = false;
            } else if (tobj.name === "text") {

                if (!is_script) {

                    let trans_text = "";
                    if (map_trans["scenario"][tobj.pm.val]) {
                        trans_text = map_trans["scenario"][tobj.pm.val];
                        tobj.pm.val = trans_text;
                        array_s[i] = tobj;
                    }

                }

            } else if (tobj.name === "chara_ptext") {

                if (map_charas && map_charas[tobj["pm"]["name"]]) {

                    //キャラ名指定の場合はこうなる
                    if (this.kag.stat.charas[tobj["pm"]["name"]]) {
                        this.kag.stat.charas[tobj["pm"]["name"]].jname = map_charas[tobj["pm"]["name"]];
                    } else {

                        tobj["pm"]["name"] = map_charas[tobj["pm"]["name"]];

                    }
                    array_s[i] = tobj;
                }

            } else {

                if (map_trans["tag"] && map_trans["tag"][tobj.name]) {

                    //翻訳対象のタグだった場合
                    let pm = tobj["pm"];
                    for (let key in pm) {

                        if (map_trans["tag"][tobj.name][key]) {
                            if (map_trans["tag"][tobj.name][key][pm[key]]) {
                                array_s[i]["pm"][key] = map_trans["tag"][tobj.name][key][pm[key]];
                            }
                        }

                    }
                }

            }

        }

        return array_s;

    },

    //langファイルを読み込んで設定する
    async loadLang(name, cb) {

        if (name != "default") {

            try {

                let lang_json = await $.loadTextSync("./data/others/lang/" + name + ".json");
                this.lang = name;
                this.map_lang = lang_json;
                
                //システム関連の更新
                if (this.map_lang["systems"]) {
                    window.tyrano_lang["word"] = this.map_lang["systems"];
                }

            } catch (e) {
                console.log(e);
                this.lang = "";
                this.map_lang = {};
            }

        } else {

            this.lang = "";
            this.map_lang = {};

        }

        //キャッシュは削除
        this.cache_scenario = {};

        this.kag.evalScript("sf._system_config_lang='" + name + "';");

        cb();

    },

    test: function () { },
};

//すべてのタグに共通する、拡張用
tyrano.plugin.kag.tag = {};
