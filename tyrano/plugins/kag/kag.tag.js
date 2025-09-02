//タグ総合管理　ゲーム全体の進捗も管理する
tyrano.plugin.kag.ftag = {
    tyrano: null,
    kag: null,

    array_tag: [], //命令タグの配列
    master_tag: {}, //使用可能なタグの種類
    current_order_index: -1, //現在の命令実行インデックス

    init: function () {
        // タグの種類を確定させる
        for (var order_type in tyrano.plugin.kag.tag) {
            this.master_tag[order_type] = object(tyrano.plugin.kag.tag[order_type]);
            this.master_tag[order_type].kag = this.kag;
        }
    },

    //命令を元に、命令配列を作り出します
    buildTag: function (array_tag, label_name) {
        this.array_tag = array_tag;

        //ラベル名が指定されている場合は
        if (label_name) {
            //そこへジャンプ
            this.nextOrderWithLabel(label_name);
        } else {
            this.nextOrderWithLabel("");
            //ここどうなんだろう
        }
    },

    buildTagIndex: function (array_tag, index, auto_next) {
        this.array_tag = array_tag;

        this.nextOrderWithIndex(index, undefined, undefined, undefined, auto_next);
    },

    //トランジション完了 だけにとどまらず、再生を強制的に再開させる
    completeTrans: function () {
        //処理停止中なら
        this.kag.stat.is_trans = false;
        if (this.kag.stat.is_stop == true) {
            this.kag.cancelWeakStop();
            this.nextOrder();
        }
    },

    /**
     * 固定オートモードグリフまたは固定スキップモードグリフを表示する
     * @param {"skip" | "auto"} mode 表示するグリフを指定
     */
    showGlyph(mode) {
        $("#mode_glyph_" + mode).show();
    },

    /**
     * 固定オートモードグリフまたは固定スキップモードグリフを非表示にする
     * @param {"skip" | "auto"} mode 非表示にするグリフを指定
     */
    hideGlyph(mode) {
        $("#mode_glyph_" + mode).hide();
    },

    /**
     * オートモード開始時にクリック待ちグリフを変化させる
     * (メッセージ末尾のクリック待ちグリフとして格納されているオプションをオートモード用のオプションで上書きする)
     */
    changeAutoNextGlyph() {
        const glyph_auto_pm = this.kag.stat.glyph_auto_next_pm;
        if (!glyph_auto_pm) return;
        this.kag.stat.glyph_pm_restore = this.kag.stat.glyph_pm || {
            line: this.kag.stat.path_glyph,
            fix: this.kag.stat.flag_glyph,
            folder: "tyrano/images/system",
        };
        this.kag.stat.glyph_pm = glyph_auto_pm;
    },

    /**
     * オートモード終了時にクリック待ちグリフをもとに戻す
     * (メッセージ末尾のクリック待ちグリフとして格納されているオプションをもともとのクリック待ちグリフのオプションで上書きする)
     */
    restoreAutoNextGlyph() {
        const glyph_default_pm = this.kag.stat.glyph_pm_restore;
        if (!glyph_default_pm) return;
        this.kag.stat.glyph_pm = glyph_default_pm;
    },

    /**
     * グリフの情報格納キーを返す
     * @param {"" | "skip" | "auto"} [mode=""] グリフのモード
     * @param {booelean} [fix=true] 固定グリフかどうか
     * @returns {"glyph_pm" | "glyph_skip_pm" | "glyph_auto_pm" | "glyph_auto_next_pm"}
     */
    getGlyphKey(mode, fix = true) {
        let glyph_key = "glyph";
        if (mode) glyph_key += "_" + mode;
        if (mode === "auto" && !fix) glyph_key += "_next";
        return glyph_key + "_pm";
    },

    /**
     * クリック待ちグリフを削除または隠蔽する
     */
    hideNextImg: function () {
        $(".img_next").remove();
        $(".glyph_image").hide();
    },

    /**
     * クリック待ちグリフを表示する
     */
    showNextImg: function () {
        // メッセージウィンドウ内グリフか、画面上固定グリフか
        if (this.kag.stat.flag_glyph == "false") {
            // メッセージウィンドウ内グリフの場合
            $(".img_next").remove();
            const j_glyph = this.createNextImg();
            this.kag.getMessageInnerLayer().find("p").append(j_glyph);
        } else {
            // 画面上固定グリフの場合
            // [glyph]タグの時点ですでに要素として追加済みなので表示状態を操作するだけでよい
            $(".glyph_image").show();
        }
    },

    /**
     * クリック待ちグリフを復元する（セーブデータロード時に使用）
     * ただDOMを復元するだけではアニメーションが再現されないケースがあるため
     */
    restoreNextImg: function () {
        const is_fixed = this.kag.stat.flag_glyph === "true";
        const class_name = is_fixed ? "glyph_image" : "img_next";
        const j_glyph = $("." + class_name);

        // クリック待ちグリフが存在しないセーブデータを読み込んだ場合にはなにもする必要はない
        if (j_glyph.length === 0) return;

        // stat 領域に glyph_pm プロパティが存在しない場合
        // つまり [glyph] タグで独自のグリフを設定していない場合もなにもしなくていい
        if (!this.kag.stat.glyph_pm) return;

        //
        // 作り直し
        //

        if (is_fixed) {
            // 固定グリフ
            const pm = $.extend({}, this.kag.stat.glyph_pm, { next: "false" });
            this.kag.ftag.startTag("glyph", pm);
        } else {
            // 非固定グリフ
            this.showNextImg();
        }
    },

    /**
     * 現在の設定に基づいてクリック待ちグリフのjQueryオブジェクトを作成して返す
     * @param {"" | "skip" | "auto"} [mode=""] グリフのモード。
     *   "" なら「クリック待ちグリフ」、"skip" なら「スキップ中グリフ」、"auto" なら「オート中グリフ」
     * @returns {jQuery | null} クリック待ちグリフの<img>または<div>を含むjQueryオブジェクト
     */
    createNextImg: function (mode = "") {
        const glyph_key = this.getGlyphKey(mode);

        let pm = this.kag.stat[glyph_key];

        // 情報がまだ格納されていない！
        if (!pm) {
            if (mode) {
                // スキップモード, オートモードのデフォルトグリフは存在しない
                return null;
            } else {
                // クリック待ちグリフには初期値を与える
                pm = {
                    line: this.kag.stat.path_glyph,
                    fix: this.kag.stat.flag_glyph,
                    folder: "tyrano/images/system",
                };
            }
        }

        // クラスの配列
        const class_names = [];

        // id 属性
        let id = "";

        // クラス名や id 属性の調整
        if (!mode) {
            if (pm.fix !== "true") {
                // メッセージウィンドウ内
                class_names.push("img_next");
            } else {
                // 固定
                class_names.push("glyph_image");
            }
        } else {
            id = "mode_glyph_" + mode;
        }

        // jQueryオブジェクトを生成
        let j_glyph;
        let img_src;
        switch (pm.type) {
            // 画像パス指定
            default:
            case "image":
                img_src = $.parseStorage(pm.line || "nextpage.gif", pm.folder);
                j_glyph = $(`<img src="${img_src}">`);
                // 横幅と高さ
                if (pm.width) {
                    j_glyph.setStyle("width", pm.width + "px");
                }
                if (pm.height) {
                    j_glyph.setStyle("height", pm.height + "px");
                }
                break;
            // innerHTML直接指定
            case "html":
                j_glyph = $(`<div>${pm.html}</div>`);
                // 横幅と高さ
                // 横幅だけが指定されている場合は横幅を高さに流用する
                if (pm.width) {
                    j_glyph.setStyle("width", pm.width + "px");
                }
                if (pm.height) {
                    j_glyph.setStyle("height", pm.height + "px");
                } else if (pm.width) {
                    j_glyph.setStyle("height", pm.width + "px");
                }
                break;
            // 図形指定
            case "figure":
                // クラス追加：図形
                if (pm.figure) {
                    class_names.push("img_next_" + pm.figure);
                }
                j_glyph = $(`<div></div>`);
                // 色
                if (pm.color) {
                    j_glyph.setStyle("background-color", $.convertColor(pm.color));
                }
                // 横幅と高さ
                // 横幅だけが指定されている場合は横幅を高さに流用する
                if (pm.width) {
                    j_glyph.setStyle("width", pm.width + "px");
                }
                if (pm.height) {
                    j_glyph.setStyle("height", pm.height + "px");
                } else if (pm.width) {
                    j_glyph.setStyle("height", pm.width + "px");
                }
                break;
            // コマアニメ
            case "koma_anim": {
                img_src = $.parseStorage(pm.koma_anim, pm.folder);
                j_glyph = $(`<div></div>`);
                const j_koma_anim = $(`<div></div>`);
                j_koma_anim.setStyleMap({
                    "display": "inline-block",
                    "vertical-align": "sub",
                    "background-color": "transparent",
                    "background-image": `url(${img_src})`,
                    "background-repeat": "no-repeat",
                    "background-position": "0px 0px",
                    "background-size": `${pm.image_width}px ${pm.image_height}px`,
                    "width": `${pm.koma_width}px`,
                    "height": `${pm.koma_height}px`,
                });
                j_koma_anim.get(0).animate(
                    {
                        backgroundPositionX: ["0px", `-${pm.image_width}px`],
                    },
                    {
                        delay: 0,
                        direction: "normal",
                        duration: parseInt(pm.koma_anim_time) || 1000,
                        easing: `steps(${pm.koma_count}, end)`,
                        iterations: Infinity,
                        fill: pm.mode || "forwards",
                    },
                );
                j_glyph.append(j_koma_anim);
                break;
            }
        }

        if (pm.keyframe) {
            // ティラノタグで定義したキーフレームアニメーションを使う場合
            j_glyph.animateWithTyranoKeyframes(pm);
        } else if (pm.anim) {
            // プリセットのアニメーションを使用する場合
            // クラス追加
            class_names.push("img_next_" + pm.anim);
            if (pm.time) j_glyph.setStyle("animation-duration", $.convertDuration(pm.time));
            if (pm.delay) j_glyph.setStyle("animation-delay", $.convertDuration(pm.delay));
            if (pm.count) j_glyph.setStyle("animation-iteration-count", pm.count);
            if (pm.mode) j_glyph.setStyle("animation-fill-mode", pm.mode);
            if (pm.easing) j_glyph.setStyle("animation-timing-function", pm.easing);
            if (pm.direction) j_glyph.setStyle("animation-direction", pm.direction);
        }

        // マージン設定がある場合
        if (pm.marginl) {
            j_glyph.setStyle("margin-left", pm.marginl + "px");
        }
        if (pm.marginb) {
            j_glyph.setStyle("margin-bottom", pm.marginb + "px");
        }

        // 貯めこんだクラス名をここでセット
        j_glyph.attr("class", class_names.join(" "));

        // id 属性もセット
        if (id) j_glyph.attr("id", id);

        // nameパラメータが指定されている場合はそれも追加
        if (pm.name) {
            $.setName(j_glyph, pm.name);
        }

        return j_glyph;
    },

    //次の命令を実行する
    nextOrder: function () {
        //nextOrderの割り込みが発生している場合
        if (typeof this.kag.tmp.cut_nextorder == "function") {
            this.kag.tmp.cut_nextorder();
            return false;
        }

        //基本非表示にする。
        this.kag.layer.hideEventLayer();

        var that = this;

        //[s]タグ。ストップするか否か
        if (this.kag.stat.is_strong_stop == true) {
            return false;
        }

        if (this.kag.stat.is_adding_text == true) {
            return false;
        }

        /*
                try {
        */

        this.current_order_index++;

        // ティラノイベント"nextorder"を発火
        that.kag.trigger("nextorder", {
            scenario: this.kag.stat.current_scenario,
            index: this.current_order_index,
        });

        //ファイルの終端に着ている場合は戻す
        if (this.array_tag.length <= this.current_order_index) {
            this.kag.endStorage();
            return false;
        }

        var tag = $.cloneObject(this.array_tag[this.current_order_index]);

        this.kag.stat.current_line = tag.line;

        if (this.kag.is_rider) {
            tag.ks_file = this.kag.stat.current_scenario;
            this.kag.rider.pushConsoleLog(tag);
        } else if (this.kag.is_studio) {
            tag.ks_file = this.kag.stat.current_scenario;
            this.kag.studio.pushConsole(tag);

            this.kag.log("**:" + this.current_order_index + "　line:" + tag.line);
            this.kag.log(tag);
        } else {
            this.kag.log("**:" + this.current_order_index + "　line:" + tag.line);
            this.kag.log(tag);
        }
        //前に改ページ指定が入っている場合はテキスト部分をクリアする
        if (
            (tag.name == "call" && tag.pm.storage == "make.ks") ||
            this.kag.stat.current_scenario == "make.ks" ||
            (tag.name == "call" && tag.pm.storage == this.kag.stat.resizecall["storage"]) ||
            this.kag.stat.current_scenario == this.kag.stat.resizecall["storage"]
        ) {
            //make or resize中 です
            //make中は基本、メッセージクリアを行わない
            if (this.kag.stat.flag_ref_page == true) {
                this.kag.tmp.loading_make_ref = true;
                this.kag.stat.flag_ref_page = false;
            }
        } else {
            if (this.kag.stat.flag_ref_page == true) {
                this.kag.stat.flag_ref_page = false;

                //バックログ、画面クリア後は強制的に画面クリア
                this.kag.stat.log_clear = true;

                this.kag.ftag.hideNextImg();

                //vchatの場合タグを入れる
                if (that.kag.stat.vchat.is_active) {
                    this.kag.ftag.startTag("vchat_in", {});
                } else {
                    this.kag.getMessageInnerLayer().html("");
                }
            }
        }

        //タグを無視する
        if (this.checkCond(tag) != true) {
            this.nextOrder();
            return;
        }

        //メッセージ非表示状態の場合は、表示して、テキスト表示
        if (this.kag.stat.is_hide_message == true && that.kag.stat.fuki.active != true) {
            this.kag.layer.showMessageLayers();
            this.kag.stat.is_hide_message = false;
        }

        if (this.master_tag[tag.name]) {
            // マスタータグの場合

            //この時点で、変数の中にエンティティがあれば、置き換える必要あり
            //ただし、次の場合はエンティティ置換をしない
            //・[iscript]-[endscript]内
            //・エンティティ置換が無効化されている(本文テキスト)
            if (!this.kag.stat.is_script && tag.is_entity_disabled !== true) {
                tag.pm = this.convertEntity(tag.pm);
            }

            //必須項目チェック
            var err_str = this.checkVital(tag);

            //バックログに入れるかどうか。
            if (this.master_tag[tag.name].log_join) {
                this.kag.stat.log_join = "true";
            } else {
                if (tag.name == "text") {
                    //何もしない
                } else {
                    this.kag.stat.log_join = "false";
                }
            }

            //クリック待ち解除フラグがたってるなら
            if (this.checkCw(tag)) {
                this.kag.layer.showEventLayer();
            }

            if (err_str != "") {
                this.kag.error(err_str);
            } else {
                tag.pm["_tag"] = tag.name;
                // ティラノイベント"tag-<tagName>"を発火
                this.kag.trigger(`tag-${tag.name}`, { target: tag.pm, in_scenario: true, is_macro: false });
                this.master_tag[tag.name].start($.extend(true, $.cloneObject(this.master_tag[tag.name].pm), tag.pm));
            }
        } else if (this.kag.stat.map_macro[tag.name]) {
            // マクロの場合
            // ティラノイベント"tag-<tagName>"を発火
            this.kag.trigger(`tag-${tag.name}`, { target: tag.pm, in_scenario: true, is_macro: true });

            // マクロスタックを取得してみる
            var stack = TYRANO.kag.getStack("macro");
            if (stack) {
                // マクロスタックが取得できたということはすでにここはマクロの内部だ
                // 現時点でのmpに復元できるように最新のマクロスタックを書き変えておく必要がある
                stack.pm = $.extend({}, this.kag.stat.mp);
            }

            tag.pm = this.convertEntity(tag.pm);

            //マクロの場合、その位置へジャンプ
            var pms = tag.pm;
            var map_obj = this.kag.stat.map_macro[tag.name];

            //スタックに追加する
            //呼び出し元の位置

            var back_pm = {};
            back_pm.index = this.kag.ftag.current_order_index;
            back_pm.storage = this.kag.stat.current_scenario;
            back_pm.pm = $.extend({}, pms);

            this.kag.stat.mp = pms;
            //参照用パラメータを設定

            this.kag.pushStack("macro", back_pm);

            this.kag.ftag.nextOrderWithIndex(map_obj.index, map_obj.storage);
        } else {
            //実装されていないタグの場合は、もう帰る
            this.kag.error("undefined_tag", tag);
            this.nextOrder();
        }

        /*
                } catch(e) {
                    console.log(e);
                    that.kag.error($.lang("error_occurred"));
                }
        */

        //ラベルといった、先行してオンメモリにしておく必要が有る命令に関しては、ここで精査しておく
    },

    checkCw: function (tag) {
        var master_tag = this.master_tag[tag.name];

        if (master_tag.cw) {
            if (this.kag.stat.is_script != true && this.kag.stat.is_html != true && this.kag.stat.checking_macro != true) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },

    //指定のタグが現れるまで進み続ける
    nextOrderWithTagSearch: function (target_tags) {
        const last_index = this.array_tag.length - 1;
        for (var i = 0; i < 2000; i++) {
            if (this.current_order_index >= last_index) break;
            const done = this.kag.ftag.nextOrderWithTag(target_tags);
            if (done) return true;
        }
        return false;
    },

    //次のタグを実行。ただし、指定のタグの場合のみ
    nextOrderWithTag: function (target_tags) {
        try {
            this.current_order_index++;
            var tag = this.array_tag[this.current_order_index];

            //タグを無視する else if などの時に、condを評価するとおかしなことになる。
            if (this.checkCond(tag) != true) {
                //this.nextOrder();
                //return;
            }

            if (target_tags[tag.name] == "") {
                if (this.master_tag[tag.name]) {
                    switch (tag.name) {
                        case "elsif":
                        case "else":
                        case "endif":
                            var root = this.kag.getStack("if");
                            if (!root || tag.pm.deep_if != root.deep) return false;
                    }

                    //この時点で、変数の中にエンティティがあれば、置き換える必要あり
                    tag.pm = this.convertEntity(tag.pm);
                    tag.pm["_tag"] = tag.name;
                    this.master_tag[tag.name].start($.extend(true, $.cloneObject(this.master_tag[tag.name].pm), tag.pm));
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (e) {
            //console.log(this.array_tag);
            console.log(e);
            return false;
        }
    },

    //要素にエンティティが含まれている場合は評価値を代入する
    convertEntity: function (pm) {
        var that = this;

        //もし、pmの中に、*が入ってたら、引き継いだ引数を全て、pmに統合させる。その上で実行

        if (pm["*"] == "") {
            //マクロ呼び出し元の変数から継承、引き継ぐ
            pm = $.extend(true, this.kag.stat.mp, $.cloneObject(pm));
        }

        //ストレージ要素が存在する場合、拡張子がついていなかったら、指定した拡張子を負荷する
        //ストレージ補完
        /*
         if(pm["storage"] && pm["storage"] != ""){
         pm["storage"] = $.setExt(pm["storage"],this.kag.config.defaultStorageExtension);
         }
         */

        for (let key in pm) {
            var val = pm[key];

            var c = "";

            if (val.length > 0) {
                c = val.substr(0, 1);
            }
            if (val.length > 0 && c === "&") {
                pm[key] = this.kag.embScript(val.substr(1, val.length));
            } else if (val.length > 0 && c === "%") {
                // 現在のマクロパラメータ(mp)を取得
                var mp = this.kag.stat.mp;
                // マクロスタックが取得できた場合はエンティティ置換
                if (mp) {
                    // 文字列を加工して扱いやすくする
                    // もとのvalの例) "%color|0xffffff"
                    var val_sub = val.substring(1); // "color|0xffffff"
                    var vertical_bar_hash = val_sub.split("|"); // ["color", "0xffffff"]
                    var map_key = vertical_bar_hash[0]; // "color"
                    var default_value = vertical_bar_hash[1] || ""; // "0xffffff"

                    // トリミング
                    if (that.kag.config.KeepSpaceInParameterValue !== "3") {
                        map_key = $.trim(map_key);
                        default_value = $.trim(default_value);
                    }

                    if (map_key in mp) {
                        // マクロスタックのパラメータにそのキーが存在する場合、それを取り出して代入
                        pm[key] = mp[map_key];
                    } else {
                        // 存在しない場合はデフォルト値を代入
                        pm[key] = default_value;
                    }
                }
            } else {
                
            }
        }

        return pm;
    },

    //必須チェック
    checkVital: function (tag) {
        var master_tag = this.master_tag[tag.name];

        var err_str = "";

        if (master_tag.vital) {
        } else {
            return "";
        }

        var array_vital = master_tag.vital;

        for (var i = 0; i < array_vital.length; i++) {
            if (tag.pm[array_vital[i]]) {
                //値が入っていなかった場合
                if (tag.pm[array_vital[i]] == "") {
                    err_str = $.lang("missing_parameter", { tag: tag.name, param: array_vital[i] });
                }
            } else {
                err_str = $.lang("missing_parameter", { tag: tag.name, param: array_vital[i] });
            }
        }

        return err_str;
    },

    //cond条件のチェック
    //条件が真の時だけ実行する
    checkCond: function (tag) {
        var pm = tag.pm;

        //cond属性が存在して、なおかつ、条件
        if (pm.cond) {
            var cond = pm.cond;
            //式の評価
            return this.kag.embScript(cond);
        } else {
            return true;
        }
    },

    //タグを指定して直接実行
    startTag: function (name, pm, cb) {
        if (typeof pm == "undefined") {
            pm = {};
        }

        /*
        if (typeof pm.next != "undefined" && pm.next == "false") {
            this.kag.tmp.cut_nextorder = () => {
                //何もしない。nextOrderで。
                this.kag.tmp.cut_nextorder = null;
            }
        }
        */

        //コールバックがある場合はnextOrderの書き換え
        if (typeof cb == "function") {
            this.kag.tmp.cut_nextorder = cb;
        }

        // ティラノイベント"tag-<tagName>"を発火
        TYRANO.kag.trigger(`tag-${name}`, { target: pm, is_next_order: false, is_macro: false });

        pm["_tag"] = name;
        this.master_tag[name].start($.extend(true, $.cloneObject(this.master_tag[name].pm), pm));
    },

    bufTags: [],
    current_tags: [],
    current_cb: null,
    isExeTag: false,
    cntTag: 0,

    //タグをnextorderの順番で使用する
    startTags: function (array_tag, cb) {
        
        if (array_tag.length == 0) {
            cb();
            return;
        }
        
        var that = this;

        this.bufTags.push({ tags: array_tag, cb: cb });

        //console.log("buftags");
        //console.log(this.bufTags);
        
        let next_tag = () => {

            TYRANO.kag.tmp.cut_nextorder = null;
            this.cntTag++;

            if (this.current_tags.length == this.cntTag) {

                //最後まできた
                if (this.current_cb) {
                    this.current_cb();
                }

                if (this.bufTags.length != 0) {
                    this.cntTag = 0;
                    //setTimeout(() => {
                    post_tag();
                    //}, 10);
                } else {
                    this.isExeTag = false;
                }
            } else {
                //setTimeout(() => {
                post_tag();
                //}, 10);
            }
        }

        let post_tag = () => {
            this.isExeTag = true;

            let tobj = null;
            if (this.cntTag == 0) {
                var tmp = this.bufTags.shift();
                this.current_tags = tmp.tags;
                this.current_cb = tmp.cb;
            }

            tobj = this.current_tags[this.cntTag];

            //console.log(this.cntTag);
            //console.log(tobj);

            //Condチェック
            if (tobj) {
                if (tobj.pm.cond) {

                    if (TYRANO.kag.ftag.checkCond(tobj) == false) {
                        next_tag();
                        return;
                    }
                }
            }

            that.startTag(tobj.tag, tobj.pm, () => {

                next_tag();

            });
        };

        if (this.isExeTag == false) {
            this.cntTag = 0;
            post_tag();
        }
    },

    //indexを指定して、その命令を実行
    //シナリオファイルが異なる場合
    nextOrderWithLabel: function (label_name, scenario_file) {
        this.kag.cancelStrongStop();

        //Jump ラベル記録が必要な場合に記録しておく
        if (label_name) {
            if (label_name.indexOf("*") != -1) {
                label_name = label_name.substr(1, label_name.length);
            }
            this.kag.ftag.startTag("label", {
                label_name: label_name,
                nextorder: "false",
            });
        }

        //セーブスナップが指定された場合
        if (label_name == "*savesnap") {
            var tmpsnap = this.kag.menu.snap;

            var co = tmpsnap.current_order_index;
            var cs = tmpsnap.stat.current_scenario;

            this.nextOrderWithIndex(co, cs, undefined, undefined, "snap");
            //snap は noかつ、スナップで上書きする

            return;
        }

        var that = this;

        var original_scenario = scenario_file;

        label_name = label_name || "";
        scenario_file = scenario_file || this.kag.stat.current_scenario;

        label_name = label_name.replace("*", "");

        //シナリオファイルが変わる場合は、全く違う動きをする
        if (scenario_file != this.kag.stat.current_scenario && original_scenario != null) {
            this.kag.weaklyStop();

            this.kag.loadScenario(scenario_file, function (array_tag) {
                that.kag.cancelWeakStop();
                that.kag.ftag.buildTag(array_tag, label_name);
            });
        } else {
            //ラベル名が指定されてない場合は最初から
            if (label_name == "") {
                this.current_order_index = -1;
                this.nextOrder();
            } else if (this.kag.stat.map_label[label_name]) {
                var label_obj = this.kag.stat.map_label[label_name];
                this.current_order_index = label_obj.index;
                this.nextOrder();
            } else {
                this.kag.error("undefined_label", { name: label_name });
                this.nextOrder();
            }
        }
    },

    //次の命令へ移動　index とストレージ名を指定する
    nextOrderWithIndex: function (index, scenario_file, flag, insert, auto_next) {
        this.kag.cancelStrongStop();
        this.kag.cancelWeakStop();

        var that = this;

        flag = flag || false;
        auto_next = auto_next || "yes";

        scenario_file = scenario_file || this.kag.stat.current_scenario;

        //alert(scenario_file + ":" + this.kag.stat.current_scenario);

        //シナリオファイルが変わる場合は、全く違う動きをする
        if (scenario_file != this.kag.stat.current_scenario || flag == true) {
            this.kag.weaklyStop();

            this.kag.loadScenario(scenario_file, function (tmp_array_tag) {
                var array_tag = $.extend(true, [], tmp_array_tag);
                if (typeof insert == "object") {
                    array_tag.splice(index + 1, 0, insert);
                }

                that.kag.cancelWeakStop();
                that.kag.ftag.buildTagIndex(array_tag, index, auto_next);
            });
        } else {
            //index更新
            this.current_order_index = index;
            let nextorder_called = false;
            if (auto_next == "yes") {
                this.nextOrder();
                nextorder_called = true;
            } else if (auto_next == "snap") {
                //ストロングの場合、すすめないように
                this.kag.stat.is_strong_stop = this.kag.menu.snap.stat.is_strong_stop;

                //スキップフラグが立っている場合は進めてくださいね。
                if (this.kag.stat.is_skip == true && this.kag.stat.is_strong_stop == false) {
                    this.kag.ftag.nextOrder();
                    nextorder_called = true;
                }
            } else if (auto_next == "stop") {
                this.kag.ftag.startTag("s");
            }
            // イベントレイヤを復活させる処理
            // - 上で nextOrder が呼ばれたのなら、その nextOrder の中でイベントレイヤを復活させる処理が行われている
            // - [s] 中ならイベントレイヤを復活させる必要はない
            // このどちらにも該当しない場合は手動でイベントレイヤを復活させる必要がある
            if (!nextorder_called && !this.kag.stat.is_strong_stop) {
                this.kag.layer.showEventLayer();
            }
        }
    },
};

//タグを記述していく
tyrano.plugin.kag.tag.text = {
    //vital:["val"], //必須のタグ

    //初期値
    pm: {
        val: "",
        backlog: "add" /*バックログ用の文字列。改行するかどうか。add join */,
    },

    /**
     * メッセージ・テキストのデフォルトのコンフィグ
     */
    default_message_config: {
        ch_speed_in_click: "1",
        effect_speed_in_click: "100ms",
        edge_overlap_text: "true",
        speech_bracket_float: "false",
        speech_margin_left: "false",
        kerning: "false",
        line_spacing: "",
        letter_spacing: "",
        control_line_break: "false",
        control_line_break_chars: "、。）」』】,.)]",
    },

    /**
     * メッセージ・テキストのコンフィグを取り出す
     * 基本的にstat.message_configから取り出すがそれが不可の場合はdefault_message_configを参照
     * (旧バージョンのセーブデータではstat.message_configが定義されていない点に留意)
     * @param {string} key
     * @returns {*}
     */
    getMessageConfig: function (key) {
        const config = this.kag.stat.message_config || {};
        return config[key] || this.default_message_config[key];
    },

    // 実行
    start: function (pm) {
        // スクリプト解析状態の場合は早期リターン
        if (this.kag.stat.is_script == true) {
            this.buildIScript(pm);
            return;
        }

        // HTML解析状態の場合は早期リターン
        if (this.kag.stat.is_html == true) {
            this.buildHTML(pm);
            return;
        }

        // ティラノイベント"tag-text-message"を発火
        this.kag.trigger("tag-text-message", { target: pm });

        // メッセージレイヤのアウターとインナーを取得
        // div.messageX_fore
        //   div.message_outer ←
        //   div.message_inner ← こいつら
        const j_outer_message = this.kag.getMessageOuterLayer();
        const j_inner_message = this.kag.getMessageInnerLayer();

        // インナーにCSSを設定
        // letter-spacing, line-height, font-family など
        this.setMessageInnerStyle(j_inner_message);

        //　現在表示中のテキストを格納
        this.kag.stat.current_message_str = pm.val;

        // 縦書きかどうか
        const is_vertical = this.kag.stat.vertical == "true";

        // 自動改ページ
        if (this.kag.config.defaultAutoReturn != "false") {
            this.autoInsertPageBreak(j_inner_message, j_outer_message, is_vertical);
        }

        // showMessageに投げる
        this.showMessage(pm.val, is_vertical);
    },

    /**
     * [iscript]中のテキストを組み立てる
     * @param {{val:string;}} pm テキストタグのパラメータ
     */
    buildIScript: function (pm) {
        this.kag.stat.buff_script += pm.val + "\n";
        // タグを先読みして、[text]が続く限り文字列の連結処理を継続する
        // エンティティ置換やcondチェックは不要なのでどんどん生のvalを足していく
        // [text]以外のタグ([endscript]を想定)を検知した段階で正式なnextOrderを呼ぶ
        const array_tag = this.kag.ftag.array_tag;
        for (let i = this.kag.ftag.current_order_index + 1; i < array_tag.length; i++) {
            const tag = array_tag[i];
            if (tag.name === "text") {
                this.kag.stat.buff_script += tag.val + "\n";
                this.kag.ftag.current_order_index = i;
            } else {
                break;
            }
        }
        this.kag.ftag.nextOrder();
    },

    /**
     * [html]中のテキストを組み立てる
     * @param {{val:string;}} pm テキストタグのパラメータ
     */
    buildHTML: function (pm) {
        this.kag.stat.map_html.buff_html += pm.val;
        // タグを先読みして、[text]が続く限り文字列の連結処理を継続する
        // エンティティ置換やcondチェックは不要なのでどんどん生のvalを足していく
        // [text]以外のタグ([emb]や[endhtml]を想定)を検知した段階で正式なnextOrderを呼ぶ
        const array_tag = this.kag.ftag.array_tag;
        for (let i = this.kag.ftag.current_order_index + 1; i < array_tag.length; i++) {
            const tag = array_tag[i];
            if (tag.name === "text") {
                this.kag.stat.map_html.buff_html += tag.val;
                this.kag.ftag.current_order_index = i;
            } else {
                break;
            }
        }
        this.kag.ftag.nextOrder();
    },

    /**
     * メッセージレイヤのインナーにCSSを当てる
     * letter-spacing, line-height, font-family など
     * @param {jQuery} j_inner_message div.message_inner
     */
    setMessageInnerStyle: function (j_inner_message) {
        // 字詰め
        const font_feature_settings = this.getMessageConfig("kerning") === "true" ? '"palt"' : "initial";

        j_inner_message.setStyleMap({
            "letter-spacing": this.kag.config.defaultPitch + "px",
            "line-height": parseInt(this.kag.config.defaultFontSize) + parseInt(this.kag.config.defaultLineSpacing) + "px",
            "font-family": this.kag.config.userFace,
            "font-feature-settings": font_feature_settings,
        });
    },

    /**
     * 自動改ページを行う
     * @param {jQuery} j_inner_message div.message_inner
     * @param {jQuery} j_outer_message div.message_outer
     * @param {boolean} is_vertical 縦書きかどうか
     */
    autoInsertPageBreak: function (j_inner_message, j_outer_message, is_vertical) {
        // 縦書きならwidthを、横書きならheightを文章がはみ出ているかどうかの判定に用いる
        const target_property = is_vertical ? "width" : "height";

        // インナーサイズがアウターサイズの8割を超えているようならもう満杯。自動で改ページしてやる
        var limit_width = parseInt(j_outer_message.css(target_property)) * 0.8;
        var current_width = parseInt(j_inner_message.find("p").css(target_property));
        if (current_width > limit_width) {
            if (this.kag.stat.vchat.is_active) {
                this.kag.ftag.startTag("vchat_in", {});
            } else {
                this.kag.getMessageInnerLayer().html("");
            }
        }
    },
    
    /**
     * テキストを表示する統括的な処理
     * @param {string} message_str 表示するテキスト
     * @param {boolean} is_vertical 縦書きにするかどうか
     */
    showMessage: function (message_str, is_vertical) {
        // 現在の発言者名（誰も喋っていない場合は空の文字列）
        let chara_name = this.kag.chara.getCharaName();

        //chara_nameにjnameが存在する場合は変換する
        if (this.kag.stat.charas[chara_name]&&this.kag.stat.charas[chara_name].jname!="") {
            chara_name = this.kag.stat.charas[chara_name].jname;
        }

        // バックログにテキストを追加
        this.pushTextToBackLog(chara_name, message_str);
        
        // 読み上げ（有効な場合）
        if (this.kag.stat.play_speak) {
            this.speechMessage(message_str);
        }

        // メッセージレイヤのインナーを取得
        // div.messageX_fore
        //   div.message_outer
        //   div.message_inner ← これ
        const j_msg_inner = this.kag.getMessageInnerLayer();

        // インナーが空なら<p>追加
        if (j_msg_inner.html() == "") {
            this.kag.setNewParagraph(j_msg_inner);
            this.kag.tmp.last_char_info = null;
        }

        // vchatモード
        if (this.kag.stat.vchat.is_active) {
            j_msg_inner.show();
        }

        // 新しい span.current_span に切り替える必要があるかチェック (必要があるなら切り替え処理も行う)
        this.kag.checkMessage(j_msg_inner);

        // span.current_span を取得
        const j_span = this.kag.getMessageCurrentSpan();

        // カギカッコフロートを行うべきか メッセージウィンドウがまっさらのときだけ有効
        const tmp = this.kag.tmp;
        tmp.should_set_reverse_indent = chara_name && !j_span.text() && this.getMessageConfig("speech_bracket_float") !== "false";

        // アニメーションやグラデーションが無効な場合を検知
        // undefined, "none" の場合は無効
        const font = this.kag.stat.font;
        if (font.effect === undefined || font.effect === "none") {
            font.effect = "";
        }
        if (font.gradient === undefined || font.gradient === "none") {
            font.gradient = "";
        }

        // -webkit-text-strokeによる縁取りを行うかどうか
        tmp.is_text_stroke = font.edge && font.edge_method === "stroke";

        // 縁を前の文字に重ねるかどうか
        tmp.is_edge_overlap = this.getMessageConfig("edge_overlap_text") === "true";

        // 1文字1文字を個別に装飾するかどうか
        // * -webkit-text-strokeによる縁取りを行なう場合 → true
        // * text-shadowによる縁取りを行なう場合
        //   * 前の文字に縁を重ねたくない → true
        //   * グラデーションをかけたい → true
        //   * それ以外 → false (個別にtext-shadowをかけなくてもいい。各文字をラップする親のspanにtext-shadowをかけるだけでいい)
        tmp.is_individual_decoration =
            tmp.is_text_stroke || (font.edge && font.edge_method === "shadow" && (!tmp.is_edge_overlap || font.gradient));

        // span.current_span のスタイルを調整
        this.setCurrentSpanStyle(j_span, chara_name);

        // 既読処理（有効な場合）
        if (this.kag.config.autoRecordLabel == "true") {
            this.manageAlreadyRead(j_span);
        }

        // 1文字1文字を包む span に inline-block を適用するかどうか
        // エフェクトによって文字を transform で動かすためには inline-block でなければならない！
        let should_use_inline_block = true;
        if (font.effect == "" || font.effect == "fadeIn") {
            // エフェクトなし、あるいはただのフェードインの場合は inline でも動くので inline にする
            // inline にしておくと英単語や句読点の禁則処理が有効になるので便利
            should_use_inline_block = false;
        }
        // message_str からHTMLを生成する
        // 入力例) "かきく"
        // 出力例) "<span>か</span><span>き</span><span>く</span>"
        // 各<span>には opacity: 0; が適用されており透明な状態
        const message_html = this.buildMessageHTML(message_str, should_use_inline_block);

        // 生成したHTMLを<span>でラップする
        const j_message_span = $(`<span>${message_html}</span>`);

        // span.current_span の中に付け加える
        // div.message_inner
        //   p ← 改ページ時に作り直される
        //     span.current_span ← [font]でスタイルが変わったときなどに新しく挿入される
        //       span       ← これは直前の[text]で表示したやつ
        //         span あ
        //         span い
        //         span う
        //       span       ← これがいま追加した j_message_span
        //         span か
        //         span き
        //         span く
        j_message_span.appendTo(j_span);

        // ふきだしのサイズ調整（有効な場合）
        if (this.kag.stat.fuki.active) {
            this.adjustFukiSize(j_msg_inner, chara_name);
        }

        this.addChars(j_message_span, j_msg_inner, is_vertical);
    },

    /**
     * テキストをバックログに追加する
     * @param {string} chara_name 発言者の名前
     * @param {string} message_str 表示するテキスト
     */
    pushTextToBackLog: function (chara_name, message_str) {
        // ひとつ前のログに連結させるべきかどうか
        // たとえば[r][font][delay]などのタグを通過したあとは連結が有効になる
        var should_join_log = this.kag.stat.log_join == "true";

        // バックログへの追加
        if ((chara_name != "" && !should_join_log) || (chara_name != "" && this.kag.stat.f_chara_ptext == "true")) {
            // バックログにキャラ名を新しく書き出す場合
            const log_str =
                `<b class="backlog_chara_name ${chara_name}">${chara_name}</b>：` +
                `<span class="backlog_text ${chara_name}">${message_str}</span>`;
            this.kag.pushBackLog(log_str, "add");

            if (this.kag.stat.f_chara_ptext == "true") {
                this.kag.stat.f_chara_ptext = "false";
                this.kag.stat.log_join = "true";
            }
        } else {
            // バックログにキャラ名を新しく書き出す必要がない場合
            const log_str = `<span class="backlog_text ${chara_name}">${message_str}</span>`;
            const join_type = should_join_log ? "join" : "add";
            this.kag.pushBackLog(log_str, join_type);
        }
    },

    /**
     * テキストを読み上げる [speak_on]タグで有効になる
     * @param {string} message_str 読み上げる文字列
     */
    speechMessage: function (message_str) {
        const utterance = new SpeechSynthesisUtterance(message_str);
        if (this.kag.tmp.speak_on_volume) utterance.volume = this.kag.tmp.speak_on_volume;
        if (this.kag.tmp.speak_on_pitch) utterance.pitch = this.kag.tmp.speak_on_pitch;
        if (this.kag.tmp.speak_on_rate) utterance.rate = this.kag.tmp.speak_on_rate;
        if (this.kag.tmp.speak_on_utterance && this.kag.tmp.speak_on_cancel) speechSynthesis.cancel(this.kag.tmp.speak_on_utterance);
        speechSynthesis.speak(utterance);
        this.kag.tmp.speak_on_utterance = utterance;
    },

    /**
     * span.current_span のスタイルを調整する
     * @param {jQuery} j_span span.current_span
     * @param {string} chara_name 発言者の名前
     */
    setCurrentSpanStyle: function (j_span, chara_name) {
        if (this.kag.stat.vchat.is_active) {
            // vchatモードの場合
            if (chara_name == "") {
                $(".current_vchat").find(".vchat_chara_name").remove();
                $(".current_vchat").find(".vchat-text-inner").css("margin-top", "0.2em");
            } else {
                $(".current_vchat").find(".vchat_chara_name").html(chara_name);

                //キャラ名欄の色
                var vchat_name_color = $.convertColor(this.kag.stat.vchat.chara_name_color);

                var cpm = this.kag.stat.vchat.charas[chara_name];

                if (cpm) {
                    //色指定がある場合は、その色を指定する。
                    if (cpm.color != "") {
                        vchat_name_color = $.convertColor(cpm.color);
                    }
                }

                $(".current_vchat").find(".vchat_chara_name").css("background-color", vchat_name_color);

                $(".current_vchat").find(".vchat-text-inner").css("margin-top", "1.5em");
            }
        } else {
            // vchatモードでない場合

            const font = this.kag.stat.font;

            // 基本のテキストスタイル
            j_span.setStyleMap({
                "color": font.color,
                "font-weight": font.bold,
                "font-size": font.size + "px",
                "font-family": font.face,
                "font-style": font.italic,
            });

            // 字間と行の高さ
            const letter_spacing = this.getMessageConfig("letter_spacing") || this.kag.config.defaultPitch;
            const line_spacing = this.getMessageConfig("line_spacing") || this.kag.config.defaultLineSpacing;
            const line_height = parseInt(font.size) + parseInt(line_spacing);
            j_span.setStyleMap({
                "letter-spacing": `${letter_spacing}px`,
                "line-height": `${line_height}px`,
            });

            // 特殊な装飾
            if (font.edge != "") {
                // 縁取り文字
                const edge_str = font.edge;
                switch (font.edge_method) {
                    default:
                    case "shadow":
                        if (!this.kag.tmp.is_individual_decoration) {
                            // 個別縁取りが無効な場合だけでよい
                            j_span.setStyle("text-shadow", $.generateTextShadowStrokeCSS(edge_str));
                        } else {
                            // 個別縁取りが有効な場合
                            const edges = $.parseEdgeOptions(edge_str);
                            this.kag.tmp.text_shadow_values = [];
                            for (let i = edges.length - 1; i >= 0; i--) {
                                const edge = edges[i];
                                const text_shadow_value = $.generateTextShadowStrokeCSSOne(edge.color, edge.total_width);
                                this.kag.tmp.text_shadow_values.push(text_shadow_value);
                            }
                            this.kag.tmp.inside_stroke_color = edges[0].color;
                        }
                        break;
                    case "filter":
                        j_span.setFilterCSS($.generateDropShadowStrokeCSS(edge_str));
                        break;
                    case "stroke":
                        break;
                }
            } else if (font.shadow != "") {
                // 影文字
                j_span.setStyle("text-shadow", "2px 2px 2px " + font.shadow);
            }
        }
    },

    /**
     * メッセージ表示時のの既読管理を行う
     * 既読テキスト→文字色を変更する
     * 未読テキスト→未読スキップが無効ならスキップを止める
     * @param {jQuery} j_span span.current_span 既読の場合に文字色を変える
     */
    manageAlreadyRead: function (j_span) {
        // このテキストが既読かどうか
        if (this.kag.stat.already_read == true) {
            // このテキストが既読の場合
            // テキストの色を変更
            if (this.kag.config.alreadyReadTextColor != "default") {
                j_span.setStyle("color", $.convertColor(this.kag.config.alreadyReadTextColor));
            }
        } else {
            // このテキストが既読でない場合
            // 未読スキップ機能が無効の場合はここでスキップを停止してやる
            if (this.kag.config.unReadTextSkip == "false") {
                this.kag.setSkip(false);
            }
        }
    },

    /**
     * テキストを加工して実際にDOMに追加できるHTMLを生成する
     * たとえば"ウホ"を渡すと`"<span>ウ</span><span>ホ</span>"`が得られる
     * 各<span>要素にはすべて opacity: 0; スタイルが適用されており透明な状態
     * @param {string} message_str
     * @param {boolean} should_use_inline_block
     * @returns {string}
     */
    buildMessageHTML: function (message_str, should_use_inline_block = true) {
        let message_html = "";

        //
        // ワードブレイク禁止処理
        //

        // ワードブレイク(単語の途中での自然改行)を禁止する単語のリスト
        const word_nobreak_list = this.kag.stat.word_nobreak_list || [];

        // ワードブレイク禁止単語がないならチェックする必要はない
        const should_check_word_break = word_nobreak_list.length > 0;

        let escape_char;
        let is_escaping = false;

        if (should_check_word_break) {
            // メッセージ中に含まれていない記号を適当に選んでエスケープ用の文字にする
            const escape_char = this.getEscapeChar(message_str);
            let is_escaping = false;

            // メッセージ中に含まれる該当単語をエスケープ文字で囲む
            // 処理前の例) "「俺は――ゴリラだ」" … このうち"――"をワードブレイクしないように保護したい
            // 処理後の例) "「俺は#――#ゴリラだ」" … このとき"#"はもとのメッセージ中には存在しないことが保証されている
            word_nobreak_list.forEach((word) => {
                const reg = new RegExp(word, "g");
                message_str = message_str.replace(reg, escape_char + word + escape_char);
            });
        }

        //
        // 1文字ずつ見ていきながらHTML生成
        //

        for (let i = 0; i < message_str.length; i++) {
            // 1文字ずつ見ていく
            let c = message_str.charAt(i);

            // ワードブレイク禁止処理
            if (should_check_word_break && c === escape_char) {
                if (is_escaping) {
                    is_escaping = false;
                    message_html += "</span>";
                } else {
                    is_escaping = true;
                    message_html += '<span style="display: inline-block;">';
                }
                continue;
            }

            // ルビ指定がされている場合は<ruby>で囲う
            if (this.kag.stat.ruby_str != "") {
                c = `<ruby><rb>${c}</rb><rt>${this.kag.stat.ruby_str}</rt></ruby>`;
                this.kag.stat.ruby_str = "";
            }

            // 文字種で場合分け
            if (c == " ") {
                // 空白の場合
                message_html += `<span class="char" style="opacity:0">${c}</span>`;
            } else {
                // 空白以外の場合

                // マーカー処理
                if (this.kag.stat.mark == 1) {
                    var mark_style = this.kag.stat.style_mark;
                    c = `<mark style="${mark_style}">${c}</mark>`;
                } else if (this.kag.stat.mark == 2) {
                    this.kag.stat.mark = 0;
                }

                if (!this.kag.tmp.is_individual_decoration) {
                    // 通常はこちら
                    if (should_use_inline_block) {
                        message_html += `<span class="char" style="opacity:0;display:inline-block;">${c}</span>`;
                    } else {
                        message_html += `<span class="char" style="opacity:0">${c}</span>`;
                    }
                } else {
                    // 1文字1文字に個別に装飾を当てる場合
                    if (this.kag.tmp.is_text_stroke) {
                        // -webkit-text-strokeによる個別縁取りを行なう場合
                        message_html += this.buildTextStrokeChar(c, this.kag.stat.font.edge);
                    } else {
                        // text-shadowによる個別縁取りを行なう場合
                        message_html += this.buildTextShadowChar(c, this.kag.stat.font.edge);
                    }
                }
            }
        }
        return message_html;
    },

    /**
     * 引数の文字列に含まれていない適当な記号を返す
     * @param {string} message_str
     * @return {string} 適当な1文字
     */
    getEscapeChar: function (message_str) {
        // 999まで見れば大丈夫だろ…
        for (let i = 34; i < 999; i++) {
            const c = String.fromCharCode(i);
            if (!message_str.includes(c)) {
                return c;
            }
        }
        return "∅";
    },

    /**
     * text-shadowで文字を"1文字ずつ"縁取りしたHTMLを組み立てる
     * @param {string} c 縁取りする1文字
     * @param {string} edge_str 縁取りを定義した文字列
     * @param {boolean} is_visible 最初から表示状態にするか
     * @returns {string} ビルドされたHTML文字列
     */
    buildTextShadowChar: function (c, edge_str, is_visible = false) {
        let char_html = "";

        // 縁を前の文字の上に重ねるかどうか
        const is_edge_overlap = this.kag.tmp.is_edge_overlap;

        // 最初から表示するか
        const visible_class = is_visible ? "visible" : "";

        // span.char.text-shadow の開始
        const style = is_edge_overlap ? "z-index: 10; opacity: 0; " : "";
        char_html += `<span class="char text-shadow ${visible_class}" style="${style}">`;

        // テキストの縁取り部分を作成
        const opacity_style = is_edge_overlap ? "opacity: 1; " : "";
        this.kag.tmp.text_shadow_values.forEach((text_shadow_value, i, arr) => {
            const z_index = 11 + i;
            const color_style = i + 1 < arr.length ? "" : `color: ${this.kag.tmp.inside_stroke_color}; `;
            char_html += `<span class="stroke entity" style="${color_style}${opacity_style}text-shadow: ${text_shadow_value}; z-index: ${z_index};">${c}</span>`;
        });

        // テキストの本体を作成
        char_html += `<span class="fill entity" style="${opacity_style}">${c}</span>`;

        // 上の要素はいずれも absolute なため width, height の構成要件にならない
        // relative, inline なダミーを追加して width, height を確保する
        char_html += `<span class="dummy" style="position:relative;display:inline;">${c}</span>`;

        return char_html + `</span>`;
    },

    /**
     * -webkit-text-strokeで文字を縁取りするためのHTMLを組み立てる
     * @param {string} c 縁取りする1文字
     * @param {string} edge_str 縁取りを定義した文字列
     * @param {boolean} is_visible 最初から表示状態にするか
     * @returns {string} ビルドされたHTML文字列
     */
    buildTextStrokeChar: function (c, edge_str, is_visible = false) {
        let char_html = "";

        // 縁取り定義をパース
        const edges = $.parseEdgeOptions(edge_str);

        // 縁を前の文字の上に重ねるかどうか
        const is_edge_overlap = this.kag.tmp.is_edge_overlap;

        // 最初から表示するか
        const visible_class = is_visible ? "visible" : "";

        // span.char.text-stroke の開始
        if (is_edge_overlap) {
            // 縁取りをひとつ前の文字に重ねてもいい場合は z-index: 10; をセット
            // スタックコンテキストが生成されるため重なり順に影響が出る
            char_html += `<span class="char text-stroke ${visible_class}" style="z-index:10;opacity:0;">`;
        } else {
            char_html += `<span class="char text-stroke ${visible_class}">`;
        }

        // チラつきを無くすおまじない
        // 巨大な文字を加えておくことでレンダリングエリアを広げる効果がある(透明にしておく)
        char_html += `<span class="dummy" style="transform: scale(2);">${c}</span>`;

        // テキストの縁取り部分を作成
        for (let i = edges.length - 1; i >= 0; i--) {
            const edge = edges[i];
            const width = edge.total_width * 2;
            let style = `-webkit-text-stroke: ${width}px ${edge.color}; z-index: ${
                100 - i
            }; padding: ${width}px; margin: -${width}px 0 0 -${width}px;`;
            if (is_edge_overlap) {
                style += "opacity:1;";
            }
            char_html += `<span class="stroke entity" style="${style}">${c}</span>`;
        }

        // テキストの本体を作成
        let style = is_edge_overlap ? "opacity:1;" : "";
        char_html += `<span class="fill entity" style="${style}">${c}</span>`;

        // 上の要素はいずれも absolute なため width, height の構成要件にならない
        // relative, inline なダミーを追加して width, height を確保する
        char_html += `<span class="dummy" style="position:relative;display:inline;">${c}</span>`;

        return char_html + `</span>`;
    },

    /**
     * ふきだしのサイズを良い感じに調整する
     * @param {jQuery} j_msg_inner div.message_inner
     * @param {string} chara_jname 発言者の名前
     */
    adjustFukiSize: function (j_msg_inner, chara_jname) {
        // メッセージレイヤの表示
        this.kag.layer.showMessageLayers();
        this.kag.stat.is_hide_message = false;

        // chara_name_area の隠蔽
        this.kag.chara.getCharaNameArea().hide();

        // そもそも発言者が空欄ならothers用のふきだし処理にぶん投げる！(早期リターン)
        if (chara_jname == "") {
            this.adjustOthersFukiSize(j_msg_inner);
            return;
        }

        // キャラの name を取得する
        // ※ chara_name には name ではなく jname (画面表示用の日本語)が入っている
        let chara_name = chara_jname;
        if (this.kag.stat.jcharas[chara_jname]) {
            chara_name = this.kag.stat.jcharas[chara_jname];
        }

        // キャラ画像のjQueryオブジェクトの取得を試みる
        let chara_obj;
        try {
            chara_obj = $(".layer_fore").find("." + chara_name);
        } catch (e) {
            // chara_name にクラス名の禁止文字(たとえば"?")が含まれている場合は
            // ご丁寧にjQueryが「そのクラス名はおかしいですよ」と例外を投げてくれるので
            // try...catch で捕捉してやらねばならない
            console.log(e);
            chara_obj = undefined;
        }

        // 次のいずれかにあてはまるならothers用のふきだし処理にぶん投げる！(早期リターン)
        // - キャラ画像のjQueryオブジェクト取得時に例外(エラー)が発生
        // - キャラ画像のjQueryオブジェクトがひとつも取れなかった
        // - いまの発言者に[chara_fuki]が設定されていない
        if (chara_obj === undefined || !chara_obj.get(0) || this.kag.stat.charas[chara_name]["fuki"]["enable"] !== "true") {
            this.adjustOthersFukiSize(j_msg_inner);
            return;
        }

        // ここまで来たならキャラ専用のふきだしを設定しなければならない
        this.adjustCharaFukiSize(j_msg_inner, chara_name, chara_obj);
    },

    /**
     * キャラ用のふきだしのサイズを良い感じに調整する
     * @param {jQuery} j_msg_inner div.message_inner
     * @param {string} chara_name 発言者の名前
     * @param {jQuery} chara_obj キャラ画像のjQueryオブジェクト
     */
    adjustCharaFukiSize: function (j_msg_inner, chara_name, chara_obj) {
        // キャラクターのふきだし設定
        const chara_fuki = this.kag.stat.charas[chara_name]["fuki"];
        // たとえばこういうデータ
        // {
        //   name: "akane",
        //   top: "270",
        //   left: "200",
        //   sippo: "top",
        //   sippo_top: "30",
        //   sippo_left: "30",
        //   sippo_width: 12,
        //   sippo_height: 20,
        //   max_width: "300",
        //   radius: "15",
        //   fix_width: "",
        //   enable: "true",
        //   _tag: "fuki_chara",
        // }

        // インナーの width, max-width の設定
        // 横幅固定するかどうかで場合分け
            
        if (chara_fuki["fix_width"] != "") {
            // 横幅固定する場合
            // max-width を解除し width を直接指定する
            j_msg_inner.css("height", "");
            j_msg_inner.css("max-width", "");
            j_msg_inner.css("width", parseInt(chara_fuki["fix_width"]));
        } else {
            // 横幅固定しない場合（自動調節する場合）
            // width を解除し max-width だけを指定する
            j_msg_inner.css("width", "");
            j_msg_inner.css("max-width", parseInt(chara_fuki["max_width"]));
        }

        // インナーの width, height の設定
        // 縦書きかどうかで場合分け
        if (this.kag.stat.vertical == "true") {
            // 縦書きの場合は height だけ無視する
            // safari でも表示させるための処置
            let w = j_msg_inner.find(".vertical_text").css("width");
            j_msg_inner.css("width", w);
            j_msg_inner.css("height", "");
            j_msg_inner.css("max-height", parseInt(chara_fuki["max_width"]));
        } else {
            // 横書きの場合
            // 自動調節する場合は width, height を解除する
            if (chara_fuki["fix_width"] == "") {
                j_msg_inner.css("width", "");
                j_msg_inner.css("height", "");
            }
        }

        //
        // アウターサイズを自動調節する
        //

        // インナーサイズを取得する
        let width = j_msg_inner.css("width");
        let height = j_msg_inner.css("height");

        // margin, padding, border を含まない
        // width = j_msg_inner.width()
        // height = j_msg_inner.height()

        // padding-left(top)、margin-right(bottom)、20（アイコンの分）を足す
        // これがアウターのサイズとなる
        
        const icon_size = 20;
        width = parseInt(width) + parseInt(j_msg_inner.css("padding-left")) + this.kag.stat.fuki.marginr + icon_size;
        height = parseInt(height) + parseInt(j_msg_inner.css("padding-top")) + this.kag.stat.fuki.marginb + icon_size;

        // アウターのサイズ
        const j_outer_message = this.kag.getMessageOuterLayer();
        j_outer_message.css("width", width);
        j_outer_message.css("height", height);

        //インナーに同期できてないのでここで同期する（Safariでの不具合対応）
        if (this.kag.stat.vertical != "true" && chara_fuki["fix_width"] == "") {
            j_msg_inner.css("width", width);
            j_msg_inner.css("height", height);
        }
        
        //
        // アウターの位置を決定する
        // まずキャラ画像の left, top にふきだし設定の left, top を足す
        // その際にキャラ画像の実際の表示サイズとオリジナルサイズの比を考慮する
        // オリジナルサイズのキャラ画像の口の部分に合わせてふきだしの left, top が設定されることを想定しているため
        //

        let fuki_left = chara_fuki["left"];
        let fuki_top = chara_fuki["top"];
        const chara_left = parseInt(chara_obj.css("left"));
        const chara_top = parseInt(chara_obj.css("top"));
        const chara_width = parseInt(chara_obj.find("img").css("width"));
        const chara_height = parseInt(chara_obj.find("img").css("height"));
        const origin_width = this.kag.stat.charas[chara_name]["origin_width"];
        const origin_height = this.kag.stat.charas[chara_name]["origin_height"];
        const per_width = chara_width / origin_width;
        const per_height = chara_height / origin_height;
        fuki_left = chara_left + fuki_left * per_width;
        fuki_top = chara_top + fuki_top * per_height;

        //
        // アウターのサイズを改めて取得する
        // しっぽのサイズも考慮する
        //

        const sippo_width = parseInt(chara_fuki.sippo_width);
        const sippo_height = parseInt(chara_fuki.sippo_height);
        const sippo_left = parseInt(chara_fuki.sippo_left);
        const sippo_top = parseInt(chara_fuki.sippo_top);
        const outer_width = parseInt(j_outer_message.css("width")) + sippo_width;
        const outer_height = parseInt(j_outer_message.css("height")) + sippo_height;

        //
        // しっぽの位置（ふきだしの方向）次第で位置を調節する
        //

        switch (chara_fuki.sippo) {
            case "top":
                // しっぽが上に付く場合（下に向かってふきだしが出る場合）
                break;
            case "bottom":
                // しっぽが下に付く場合（上に向かってふきだしが出る場合）
                // top はアウターサイズ分だけ上にずらす
                fuki_top -= outer_height;
                break;
            case "left":
                // しっぽが左に付く場合（右に向かってふきだしが出る場合）
                break;
            case "right":
                // しっぽが右に付く場合（左に向かってふきだしが出る場合）
                // left はアウターサイズ分だけ左にずらす
                fuki_left -= outer_width;
                break;
        }

        //
        // ふきだしが画面から飛び出していたら押し戻す
        //

        // ふきだしの右端と下端の座標
        let fuki_right = fuki_left + outer_width;
        let fuki_bottom = fuki_top + outer_height;

        // ゲーム画面サイズ
        const sc_padding = 10; // ゲーム画面内にふきだしを配置する際の最低限の余白
        const sc_width = parseInt(this.kag.config.scWidth) - sc_padding;
        const sc_height = parseInt(this.kag.config.scHeight) - sc_padding;

        // しっぽのX座標調整量
        let sippo_left_offset = 0;

        // 画面右に飛び出している場合
        if (fuki_right >= sc_width) {
            // 飛び出している量
            const overflow_width = fuki_right - sc_width;

            // ふきだしを左に押し戻す
            fuki_left -= overflow_width;

            // ふきだし全体を左に押し戻すだけだとしっぽの位置がキャラの口からずれてしまう
            // ふきだし全体を左に押し戻した分だけしっぽは右にずらしてあげる
            sippo_left_offset = overflow_width;
        }

        // 画面左に飛び出している場合
        if (fuki_left <= sc_padding) {
            // 飛び出している量
            const overflow_width = sc_padding - fuki_left;
            // ふきだしを右に押し戻す
            fuki_left = sc_padding;
            // しっぽの補正量
            sippo_left_offset = -overflow_width;
        }

        // 画面下に飛び出している場合
        if (fuki_bottom >= sc_height) {
            // 上に押し戻す
            fuki_top = fuki_top - (fuki_bottom - sc_height);
        }

        // 画面上に飛び出ている場合
        if (fuki_top <= sc_padding) {
            fuki_top = sc_padding;
        }

        // アウターの位置を更新
        j_outer_message.css("left", fuki_left);
        j_outer_message.css("top", fuki_top);

        // インナーの位置を更新
        j_msg_inner.css({
            left: parseInt(j_outer_message.css("left")) + 10,
            top: parseInt(j_outer_message.css("top")) + 10,
        });

        // スタイルをセット
        this.setFukiStyle(j_outer_message, chara_fuki);

        // しっぽの調整
        this.kag.updateFuki(chara_name, {
            sippo_left: sippo_left_offset,
        });
    },

    /**
     * others用のふきだしのサイズを良い感じに調整する
     * @param {jQuery} j_msg_inner div.message_inner
     */
    adjustOthersFukiSize: function (j_msg_inner) {
        const others_style = this.kag.stat.fuki.others_style;
        const def_style = this.kag.stat.fuki.def_style;
        const fuki_max_width = others_style.max_width || def_style.width;
        const fuki_left = others_style.left || def_style.left;
        const fuki_top = others_style.top || def_style.top;

        // インナーの width, max-width の設定
        // 縦書きかどうかで場合分け
        if (this.kag.stat.vertical !== "true") {
            // 横書きの場合

            // 高さは自由にしてやる
            j_msg_inner.css("height", "");
            j_msg_inner.css("max-height", "");

            // 横幅固定するかどうかで場合分け
            if (others_style.fix_width) {
                // 横幅固定の場合は直接 width を指定する
                j_msg_inner.css("max-width", "");
                j_msg_inner.css("width", parseInt(others_style.fix_width));
            } else {
                // 自動調節の場合は max-width だけを指定する
                j_msg_inner.css("width", "");
                j_msg_inner.css("max-width", parseInt(fuki_max_width));
            }
        } else {
            // 縦書きの場合

            // 縦書きの場合は width, max-width と height, max-height を入れ替えて処理する
            j_msg_inner.css("width", "");
            j_msg_inner.css("max-width", "");

            // 高さ固定するかどうかで場合分け
            if (others_style.fix_width) {
                // 高さ固定
                j_msg_inner.css("max-height", "");
                j_msg_inner.css("height", parseInt(others_style.fix_width));
            } else {
                // 自動調節
                j_msg_inner.css("height", "");
                j_msg_inner.css("max-height", parseInt(fuki_max_width));
            }

            // 縦書きの場合は内部の p.vertical_text の横幅を引っ張ってインナーに直接指定しておかないと
            // 後々アウターのサイズと合わなくなる
            j_msg_inner.css("width", j_msg_inner.find(".vertical_text").css("width"));
        }

        //
        // アウターサイズを自動調節する
        //

        // インナーサイズを取得する
        let width = j_msg_inner.css("width");
        let height = j_msg_inner.css("height");

        // margin, padding, border を含まない
        // width = j_msg_inner.width()
        // height = j_msg_inner.height()

        // padding-left(top)、margin-right(bottom)、20（アイコンの分）を足す
        // これがアウターのサイズとなる
        const icon_size = 20;
        width = parseInt(width) + parseInt(j_msg_inner.css("padding-left")) + this.kag.stat.fuki.marginr + icon_size;
        height = parseInt(height) + parseInt(j_msg_inner.css("padding-top")) + this.kag.stat.fuki.marginb + icon_size;

        // アウターの位置とサイズを更新
        const j_outer_message = this.kag.getMessageOuterLayer();
        j_outer_message.css("width", width);
        j_outer_message.css("height", height);
        j_outer_message.css("left", parseInt(fuki_left));
        j_outer_message.css("top", parseInt(fuki_top));

        // インナーの位置を更新
        j_msg_inner.css({
            left: parseInt(j_outer_message.css("left")) + 10,
            top: parseInt(j_outer_message.css("top")) + 10,
        });

        // スタイルを適用する（文字色やボーダー関連など）
        this.setFukiStyle(j_outer_message, this.kag.stat.fuki.others_style);

        // しっぽを消す
        this.kag.updateFuki("others", { sippo: "none" });
    },

    /**
     * 1文字を可視化する
     * @param {jQuery} j_char_span 1文字の`<span>`のjQueryオブジェクト
     */
    makeOneCharVisible: function (j_char_span) {
        // 個別縁取りが有効、かつ、縁を前のテキストに重ねたくない場合は
        // span.charそのものではなくその中の子要素に対してアニメーションを当てる
        if (this.kag.tmp.is_individual_decoration && !this.kag.tmp.is_edge_overlap) {
            j_char_span = j_char_span.find(".entity");
        }

        if (this.kag.stat.font.effect != "") {
            const anim_name = "t" + this.kag.stat.font.effect;

            // エフェクト時間を決定する
            let anim_duration = this.kag.tmp.effect_speed;
            if (!anim_duration.includes("s")) {
                anim_duration += "ms";
            }

            // アニメ―ション終了時に文字を完全表示
            j_char_span.on("animationend", function (e) {
                j_char_span.removeClass("animchar");
                j_char_span.setStyleMap({
                    opacity: 1,
                    visibility: "visible",
                    animation: "",
                });
            });

            //　クラスを付けてアニメーション再生開始
            j_char_span.addClass("animchar");
            j_char_span.setStyle("animation", `${anim_name} ${anim_duration} ease 0s 1 normal forwards`);
        } else {
            j_char_span.setStyleMap({ visibility: "visible", opacity: "1" });
        }
    },

    /**
     * すべての文字を可視化する
     * @param {jQuery} j_char_span_children 1文字1文字の`<span>`のjQueryオブジェクトのコレクション
     */
    makeAllCharsVisible: function (j_char_span_children) {
        // 個別文字装飾が有効な場合はspan.charそのものではなくその中の子要素に対してアニメーションを当てる
        if (this.kag.tmp.is_individual_decoration) {
            j_char_span_children = j_char_span_children.find(".entity");
        }
        j_char_span_children.setStyleMap({
            animation: "",
            visibility: "visible",
            opacity: "1",
        });
    },

    /**
     * 特定のインデックスの1文字を追加する
     * @param {number} char_index 表示する文字のインデックス
     * @param {jQuery} j_char_span_children 1文字1文字の`<span>`のjQueryオブジェクトのコレクション
     * @param {jQuery} j_message_span 1文字1文字の`<span>`をラップしている親`<span>`のjQueryオブジェクト
     * @param {jQuery} j_msg_inner div.message_inner
     */
    addOneChar: function (char_index, j_char_span_children, j_message_span, j_msg_inner) {
        // まだ文字表示中だよ
        this.kag.stat.is_adding_text = true;

        // 表示中のクリック割り込みを検知するよ
        this.checkClickInterrupt(j_msg_inner);

        // この1文字を可視化
        this.makeOneCharVisible(j_char_span_children.eq(char_index));

        // 次の文字のインデックス
        const next_char_index = char_index + 1;
        
        //ポポポ判定
        if (this.kag.tmp.popopo.key) {
            this.kag.tmp.popopo.player.play(j_char_span_children.eq(char_index).text());
        }

        // すべての文字を表示し終わったかどうか
        if (next_char_index < j_char_span_children.length) {
            // まだ表示していない文字があるようだ
            // タイムアウトを設けて次の文字を表示しよう
            $.setTimeout(() => {
                this.addOneChar(next_char_index, j_char_span_children, j_message_span, j_msg_inner);
            }, this.kag.tmp.ch_speed);
        } else {
            
            // すべての文字を表示し終わったようだ
            
            //ポポポ判定があるなら停止させる
            if (this.kag.tmp.popopo.key) {
                this.kag.tmp.popopo.player.stop();
            }
            
            $.setTimeout(() => {
                this.finishAddingChars();
            }, this.kag.tmp.ch_speed);
        }
    },

    /**
     * 文字表示中のクリック割り込みを検知する
     * 文字表示中のスキップ割り込みについても対応を検討(現在は[skipstart]の部分で文字表示中のスキップ開始を拒否している)
     */
    checkClickInterrupt: function (j_msg_inner) {
        // スキップ割り込み
        const is_skip = this.kag.stat.is_skip;
        if ((this.kag.stat.is_click_text || is_skip) && !this.kag.tmp.processed_click_interrupt) {
            this.kag.tmp.processed_click_interrupt = true;
            // 文字表示の途中でクリックされたようだ

            // 文字途中クリック時の文字表示速度の設定を見る
            const ch_speed_in_click = is_skip ? "0" : this.getMessageConfig("ch_speed_in_click");
            if (ch_speed_in_click !== "default") {
                this.kag.tmp.ch_speed = parseInt(ch_speed_in_click);
            }

            // 文字途中クリック時のエフェクト速度の設定を見る
            let effect_speed_in_click = is_skip ? "0ms" : this.getMessageConfig("effect_speed_in_click");

            if (effect_speed_in_click !== "default" || is_skip) {
                this.kag.tmp.effect_speed = effect_speed_in_click;
                // すでにアニメーションが始まっている文字のアニメ―ション時間も短くしておく
                if (!effect_speed_in_click.includes("s")) {
                    effect_speed_in_click += "ms";
                }
                j_msg_inner.find(".animchar").setStyleMap({
                    "animation-duration": effect_speed_in_click,
                });
            }
        }
    },

    /**
     * 文字の追加を終えて次のタグに進む
     */
    finishAddingChars: function () {
        // もう追加しおわった
        this.kag.stat.is_adding_text = false;

        // リップシンク開始
        this.stopLipSyncWithText();

        // いまメッセージウィンドウがユーザー操作によって非表示にされているかどうか
        if (this.kag.stat.is_hide_message) {
            // メッセージの表示途中でユーザーが右クリックしてメッセージウィンドウを消しおった！
            // 次のタグ ([text]か[l]か[p]か[font]か…etc) には進ませない
            // 次にユーザーがメッセージウィンドウを表示したときに一度だけ nextOrder を走らせる
            this.kag.once(
                "messagewindow-show",
                () => {
                    this.kag.ftag.nextOrder();
                },
                {
                    temp: true, // これはセーブデータロード時に削除すべきリスナ
                    system: true, // これはシステムが利用するリスナ
                },
            );
        } else {
            // ふつうにメッセージウィンドウが表示されている
            this.kag.ftag.nextOrder();
        }
    },

    /**
     * 文字を追加していく
     * @param {jQuery} j_message_span 1文字1文字の`<span>`をラップしている親`<span>`のjQueryオブジェクト
     * @param {jQuery} j_msg_inner div.message_inner
     * @param {boolean} is_vertical 縦書きかどうか
     */
    addChars: function (j_message_span, j_msg_inner, is_vertical) {
        // 文字の表示速度 (単位はミリ秒/文字)
        let ch_speed = 30;
        if (this.kag.stat.ch_speed !== "") {
            ch_speed = parseInt(this.kag.stat.ch_speed);
        } else if (this.kag.config.chSpeed) {
            ch_speed = parseInt(this.kag.config.chSpeed);
        }
        
        //ポポポ判定
        
        if (this.kag.stat.popopo.enable) {
            
            if (this.kag.stat.is_skip !== true && !this.kag.stat.is_nowait && ch_speed >= 3) {
        
                //初期化が完了してるかどうか。
                if (!TYRANO.kag.popopo.is_ready) {
                    console.log("init popopo");
                    TYRANO.kag.popopo.init();
                }
            
                let popopo_obj = this.kag.stat.popopo;
        
                //当該キャラクターのpopopoが登録されているかを確認する。
                //存在すれば、popopo_objの差し替え
                let chara_name = this.kag.chara.getCharaName();
            
                if (!chara_name) {
                    chara_name = "default";
                }
            
                let j_chara_name = "-1";
                //chara_nameにjnameが存在する場合は変換する
                if (this.kag.stat.charas[chara_name] && this.kag.stat.charas[chara_name].jname != "") {
                    j_chara_name = this.kag.stat.charas[chara_name].jname;
                }
            
                if (this.kag.stat.popopo_chara[chara_name]) {
                    popopo_obj = this.kag.stat.popopo_chara[chara_name];
                } else if (this.kag.stat.popopo_chara[j_chara_name]) {
                    popopo_obj = this.kag.stat.popopo_chara[j_chara_name];
                } else if (this.kag.stat.popopo_chara["default"]) {
                    popopo_obj = this.kag.stat.popopo_chara["default"];
                }
            
                this.kag.stat.popopo = popopo_obj;
            
                var key = popopo_obj.type;
                if (key === "file") {
                } else if (key === "none") {
                    key = "";
                } else {
                    key = "wave";
                }
        
                if (key) {
            
                    const message_str = this.kag.stat.current_message_str;
                    var key2 = popopo_obj.mode;
                    var player = this.kag.popopo[key][key2];
                    this.kag.tmp.popopo.player = player;
            
                    player.start(message_str, ch_speed);
        
                }
        
                this.kag.tmp.popopo.key = key;
                
            } else {
                TYRANO.kag.popopo.is_ready = false;
            }
            
        }
        
       
        

        // 1文字1文字の<span>要素のjQueryオブジェクトのコレクション
        const j_char_span_children = j_message_span.find(".char");

        // グラデーションの設定が有効の場合
        const font = this.kag.stat.font;
        if (font.gradient && font.gradient !== "none") {
            const j_target = this.kag.tmp.is_individual_decoration ? j_char_span_children.find(".fill") : j_char_span_children;
            j_target.setGradientText(font.gradient);
        }

        //　セリフのカギカッコフロート
        if (this.kag.tmp.should_set_reverse_indent) {
            this.setReverseIndent(j_msg_inner, j_char_span_children);
        }

        // 禁則処理
        if (this.getMessageConfig("control_line_break") === "true") {
            this.controlLineBreak(j_char_span_children, is_vertical);
        }

        // すべてのテキストを一瞬で表示すべきなら全部表示してさっさと早期リターンしよう
        // 次のいずれかに該当するならすべてのテキストを一瞬で表示すべきである
        // - スキップモード中である
        // - [nowait]中である
        // - 1文字あたりの表示時間が 3 ミリ秒以下である
        if (this.kag.stat.is_skip === true || this.kag.stat.is_nowait || ch_speed <= 3) {
            // 全文字表示
            this.makeAllCharsVisible(j_char_span_children);
            // スキップ時間のタイムアウトを設ける
            $.setTimeout(() => {
                // メッセージウィンドウが隠れていなければ次のタグへ
                if (!this.kag.stat.is_hide_message) {
                    this.kag.ftag.nextOrder();
                }
            }, parseInt(this.kag.config.skipSpeed));
            return;
        }

        //
        // ここまで来たということは1文字ずつ追加していかねばならないようだ
        //

        // テキスト追加中だよ
        this.kag.stat.is_adding_text = true;

        // リップシンク開始
        this.startLipSyncWithText();

        // クリックの割り込みを処理したかどうか
        this.kag.tmp.processed_click_interrupt = false;

        // 文字表示速度
        this.kag.tmp.ch_speed = ch_speed;

        // エフェクト速度
        this.kag.tmp.effect_speed = this.kag.stat.font.effect_speed;

        // 文字表示中にクリックしたときに残りのテキストをマッハ表示する処理を割り込ませたいので
        // クリックできるようにイベントレイヤを表示しておく必要がある
        this.kag.waitClick("text");

        // 1文字目を追加 あとは関数内で再帰して表示
        this.addOneChar(0, j_char_span_children, j_message_span, j_msg_inner);
    },

    /**
     * カギカッコの下に文章が回り込まないように、最初の行だけ左側にずらす
     * 内部的には最初のカギカッコだけ absolute にして左にずらす！
     *
     * 　「こんにちは
     * 　カギカッコフロートなしだよ」
     *
     * これをこうしてこうじゃ
     *
     * 「こんにちは
     * 　カギカッコフロートありだよ」
     * @param {jQuery} j_msg_inner div.message_inner
     * @param {jQuery} j_children 1文字1文字の span.char のコレクション
     */
    setReverseIndent: function (j_msg_inner, j_children) {
        // 最初の1文字
        const j_first_char = j_children.eq(0);

        // 設定を取得
        const indent_config = this.getMessageConfig("speech_bracket_float");
        const margin_config = this.getMessageConfig("speech_margin_left");

        // 最初の1文字の横幅が何ピクセルなのか調査する
        let first_char_width = 0;
        if (indent_config === "true" || margin_config === "true") {
            const j_width_check = j_first_char.clone();
            j_width_check.setStyleMap({
                "opacity": "0",
                "position": "fixed",
                "display": "inline-block",
                "z-index": "1",
                "top": "-9999px",
                "left": "-9999px",
            });
            j_width_check.insertBefore(j_first_char);
            first_char_width = j_width_check.width();
            j_width_check.remove();
        }

        // インデント幅を決定 コンフィグの値によって場合分け
        // - "true" が指定されている場合は、上で調査した文字幅を自動で使う
        // - 単位のない数値が指定されている場合は、その数値に"px"を付けて使う
        // - 単位のある数値が指定されている場合は、それをそのまま使う
        let indent = 0;
        let px_indent = "px";
        switch (indent_config) {
            case "true":
                indent = first_char_width;
                break;
            default:
                indent = indent_config;
                if (indent_config.match(/em|%|px|vw|vh/)) {
                    px_indent = "";
                }
        }

        // 最初の1文字を absolute にしてしまおう
        j_first_char.setStyleMap({
            position: "absolute",
            // top: "0",
            left: `-${indent}${px_indent}`,
        });

        //
        // さらに全体を右側に動かす
        //

        // 右側に動かす量を決定 コンフィグの値によって場合分け
        // - "false" が指定されている場合は、右側に動かす処理を行わない
        // - "true" が指定されている場合は、上で調査した文字幅を自動で使う
        // - 単位のない数値が指定されている場合は、その数値に"px"を付けて使う
        // - 単位のある数値が指定されている場合は、それをそのまま使う
        let margin = 0;
        let px_margin = "px";
        switch (margin_config) {
            case "false":
                break;
            case "true":
                margin = first_char_width;
                break;
            default:
                margin = margin_config;
                if (margin_config.match(/em|%|px|vw|vh/)) {
                    px_margin = "";
                }
        }

        // border-box にしつつ左側に padding を付ける
        if (margin !== 0) {
            j_msg_inner.find("p").setStyleMap({
                "box-sizing": "border-box",
                "padding-left": `${margin}${px_margin}`,
            });
        }
    },

    /**
     * 禁則処理
     * 特定の文字が行頭に来ていたら改行を早める
     * @param {jQuery} j_char_children 各1文字1文字のjQueryコレクション
     * @param {boolean} is_vertical 縦書きかどうか
     */
    controlLineBreak: function (j_char_children, is_vertical) {
        // 今回の[text]を表示する前にメッセージウィンドウ上に存在していた最後の1文字の情報を取得
        // [p][cm][er]などでまっさらになっている場合はもちろん取れないので初期値を設定
        const prev = this.kag.tmp.last_char_info || {
            left: is_vertical ? Infinity : -Infinity,
            top: -Infinity,
            j_char: null,
        };

        // 最初の1文字のy座標と最後の1文字のy座標を取得
        const first_char_top = j_char_children.first().offset().top;
        const last_j_char = j_char_children.last();
        const last_char_offset = last_j_char.offset();

        // 最後の1文字の情報は一時データに記憶しておく
        this.kag.tmp.last_char_info = {
            left: last_char_offset.left,
            top: last_char_offset.top,
            j_char: last_j_char,
        };

        // 最初と最後の文字のy座標が一致している(改行が生じていない)かつ今回の[text]よりも前のテキストが存在していない
        // なら、禁則処理は必要ないとわかるので早期リターン
        if (first_char_top === last_char_offset.top && !prev.j_char) {
            return;
        }

        // 先頭に来てはいけない文字列
        const bad_chars = this.getMessageConfig("control_line_break_chars");

        // さあ、1文字ずつ見ていくぞ
        for (let i = 0, len = j_char_children.length; i < len; i++) {
            const j_this = j_char_children.eq(i);
            const offset = j_this.offset();
            const char = j_this.text().charAt(0);
            const is_new_line = is_vertical ? offset.left < prev.left : offset.top > prev.top;
            if (is_new_line) {
                // この文字が禁則処理対象の文字であるとき『ひとつ前の文字』の前に改行を入れる
                if (bad_chars.includes(char)) {
                    prev.j_char.before("<br>");
                }
                // ここで最後の1文字とy座標を比較 一致するならもうこの先に改行はない
                if (offset.top === last_char_offset.top) {
                    break;
                }
            }
            prev.top = offset.top;
            prev.left = offset.left;
            prev.j_char = j_this;
        }
    },

    //nextOrder: function () { },

    setFukiStyle: function (j_outer_message, chara_fuki) {
        //見た目の指定がある場合は設定する
        if (typeof chara_fuki["color"] != "undefined") {
            j_outer_message.css("background-color", $.convertColor(chara_fuki["color"]));
        }

        if (typeof chara_fuki["opacity"] != "undefined") {
            j_outer_message.css("opacity", $.convertOpacity(chara_fuki["opacity"]));
        }

        if (typeof chara_fuki["border_size"] != "undefined") {
            j_outer_message.css("border-width", parseInt(chara_fuki["border_size"]));
            j_outer_message.css("border-style", "solid");
        }

        if (typeof chara_fuki["border_color"] != "undefined") {
            j_outer_message.css("border-color", $.convertColor(chara_fuki["border_color"]));
        }

        if (typeof chara_fuki["radius"] != "undefined") {
            j_outer_message.css("border-radius", parseInt(chara_fuki["radius"]));
        }

        //内部設定
        if (typeof chara_fuki["font_color"] != "undefined") {
            j_outer_message.parent().find(".message_inner").find(".current_span").css("color", $.convertColor(chara_fuki["font_color"]));
        }

        if (typeof chara_fuki["font_size"] != "undefined") {
            j_outer_message.parent().find(".message_inner").find(".current_span").css("font-size", parseInt(chara_fuki["font_size"]));
        }
    },

    /**
     * テキストによるリップシンクを開始する。
     */
    startLipSyncWithText() {
        // 現在の発言者名（誰のセリフでもない場合は無効）
        let chara_name = this.kag.chara.getCharaName(true);
        if (!chara_name) return null;

        // リップシンク対象のパーツを取得する（取得できなければこのリップシンクは無効）
        const target_parts = this.kag.chara.getLipSyncParts.call(this, chara_name, "text");
        if (!target_parts) return null;

        // 別のメソッドからtarget_partsにアクセスできるようにするために
        // tmp領域にtarget_partsの参照を格納しておく
        this.kag.tmp.text_lipsync_target_parts = target_parts;

        // パーツごとに
        target_parts.forEach((part) => {
            // アップデート関数と初回呼び出し
            const updateLipSync = () => {
                const i = Math.floor(Math.random() * part.j_frames.length);
                part.j_frames.showAtIndexWithVisibility(i);
                const duration = parseInt(part.def.lip_time) || 50;
                part.text_lipsync_timer_id = setTimeout(updateLipSync, duration);
            };
            updateLipSync();
        });
    },

    /**
     * テキストによるリップシンクを終了する。
     */
    stopLipSyncWithText() {
        // ターゲットパーツがなければなにもしない
        const target_parts = this.kag.tmp.text_lipsync_target_parts;
        if (!target_parts) return null;

        // タイマーを停止
        target_parts.forEach((part) => {
            clearTimeout(part.text_lipsync_timer_id);
        });

        // ベースとなる口を表示し中間点を非表示にする
        target_parts.forEach((target_part) => {
            target_part.j_frames.showAtIndexWithVisibility(0);
        });

        // 不要になったプロパティを削除
        delete this.kag.tmp.text_lipsync_target_parts;
    },
};

tyrano.plugin.kag.tag.label = {
    pm: {
        nextorder: "true",
    },

    start: function (pm) {
        //ラベル通過したよ。

        //ラベル記録
        if (this.kag.config.autoRecordLabel == "true") {
            var sf_tmp =
                "trail_" +
                this.kag.stat.current_scenario
                    .replace(".ks", "")
                    .replace(/\u002f/g, "")
                    .replace(/:/g, "")
                    .replace(/\./g, "");
            var sf_buff = this.kag.stat.buff_label_name;
            var sf_label = sf_tmp + "_" + pm.label_name;

            if (this.kag.stat.buff_label_name != "") {
                if (!this.kag.variable.sf.record) {
                    this.kag.variable.sf.record = {};
                }

                var sf_str = "sf.record." + sf_buff;

                var scr_str = "" + sf_str + " = " + sf_str + "  || 0;" + sf_str + "++;";
                this.kag.evalScript(scr_str);
            }

            if (this.kag.variable.sf.record) {
                if (this.kag.variable.sf.record[sf_label]) {
                    //すでにこのラベル通過済みよ
                    this.kag.stat.already_read = true;
                } else {
                    this.kag.stat.already_read = false;
                }
            }

            //pm.label_name を stat に配置して、次のラベルで記録とする
            this.kag.stat.buff_label_name = sf_label;
        }

        //ラベル記録の時はNextOrderしない
        if (pm.nextorder == "true") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[config_record_label]

:group
メッセージ関連の設定

:title
既読管理の設定

:exp
既読管理の設定を変更できます。

:sample

:param
color = 既読テキスト色を`0xRRGGBB`形式で指定します。,
skip  = プレイヤーが未読テキストをスキップできるかどうか。`true`または`false`で指定します。`false`を指定すると、プレイヤーが未読テキストに到達したときにスキップが解除されます。

#[end]
*/

tyrano.plugin.kag.tag.config_record_label = {
    pm: {
        color: "",
        skip: "",
    },

    start: function (pm) {
        var that = this;

        if (pm.color != "") {
            this.kag.config.alreadyReadTextColor = pm.color;
            this.kag.ftag.startTag("eval", {
                exp: "sf._system_config_already_read_text_color = " + pm.color,
            });
        }

        if (pm.skip != "") {
            if (pm.skip == "true") {
                this.kag.config.unReadTextSkip = "true";
            } else {
                this.kag.config.unReadTextSkip = "false";
            }

            this.kag.ftag.startTag("eval", {
                exp: "sf._system_config_unread_text_skip = '" + pm.skip + "'",
            });
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[l]

:group
メッセージ・テキスト

:title
クリック待ち

:exp
このタグの位置でプレイヤーのクリックを待ちます。

:sample
テキスト表示[l]
テキスト表示[l][r]

:param

:demo
1,kaisetsu/01_text

#[end]
*/

//[l] クリック待ち
tyrano.plugin.kag.tag.l = {
    start: function () {
        var that = this;

        this.kag.stat.is_click_text = false;
        this.kag.ftag.showNextImg();

        //
        // スキップまたはオートモード時の処理
        //

        // スキップモードの場合は単に次のタグに進んで早期リターン
        if (this.kag.stat.is_skip == true) {
            this.kag.ftag.nextOrder();
            return;
        }

        // ここに到達したということは
        // スキップモード中ではない

        // オートモード時は現在表示されているメッセージ量から待機時間を計算して
        // setTimeout で次のタグに進む
        if (this.kag.stat.is_auto == true) {
            this.kag.stat.is_wait_auto = true;

            var auto_speed = that.kag.config.autoSpeed;
            if (that.kag.config.autoSpeedWithText != "0") {
                var cnt_text = this.kag.stat.current_message_str.length;
                auto_speed = parseInt(auto_speed) + parseInt(that.kag.config.autoSpeedWithText) * cnt_text;
            }

            setTimeout(function () {
                if (that.kag.stat.is_wait_auto == true) {
                    //ボイス再生中の場合は、オートで次に行かない。効果音再生終了後に進めるためのフラグを立てる
                    if (that.kag.tmp.is_vo_play == true) {
                        that.kag.tmp.is_vo_play_wait = true;
                    } else {
                        // クリック待ちグリフを消去
                        that.kag.ftag.hideNextImg();
                        that.kag.ftag.nextOrder();
                    }
                }
            }, auto_speed);
        }

        // waitClick を呼んでイベントレイヤ―の表示処理などを行う
        this.kag.waitClick("l");
    },
};

/*
#[p]

:group
メッセージ・テキスト

:title
クリック待ち＋改ページ

:exp
プレイヤーのクリックを待ちます。
プレイヤーがクリックすると改ページされます。

:sample
テキスト表示[p]
テキスト表示[p][r]

:param

:demo
1,kaisetsu/01_text

#[end]
*/

//[p] 改ページクリック待ち
tyrano.plugin.kag.tag.p = {
    start: function () {
        var that = this;

        //改ページ
        this.kag.stat.flag_ref_page = true;

        this.kag.stat.is_click_text = false;
        this.kag.ftag.showNextImg();

        //
        // スキップまたはオートモード時の処理
        //

        // スキップモードの場合は単に次のタグに進んで早期リターン
        if (this.kag.stat.is_skip == true) {
            this.kag.ftag.nextOrder();
            return;
        }

        // ここに到達したということは
        // スキップモード中ではない

        // オートモード時は現在表示されているメッセージ量から待機時間を計算して
        // setTimeout で次のタグに進む
        if (this.kag.stat.is_auto == true) {
            this.kag.stat.is_wait_auto = true;

            var auto_speed = that.kag.config.autoSpeed;
            if (that.kag.config.autoSpeedWithText != "0") {
                var cnt_text = this.kag.stat.current_message_str.length;
                auto_speed = parseInt(auto_speed) + parseInt(that.kag.config.autoSpeedWithText) * cnt_text;
            }

            setTimeout(function () {
                if (that.kag.stat.is_wait_auto == true) {
                    //ボイス再生中の場合は、オートで次に行かない。効果音再生終了後に進めるためのフラグを立てる
                    if (that.kag.tmp.is_vo_play == true) {
                        that.kag.tmp.is_vo_play_wait = true;
                    } else {
                        // クリック待ちグリフを消去
                        that.kag.ftag.hideNextImg();
                        that.kag.ftag.nextOrder();
                    }
                }
            }, auto_speed);
        }

        // waitClick を呼んでイベントレイヤ―の表示処理などを行う
        this.kag.waitClick("p");
    },
};

/*
#[graph]

:group
メッセージ・テキスト

:title
インライン画像表示

:exp
任意の画像をメッセージ中に表示します。絵文字や特殊文字などに活用できます。
表示する画像は`data/image`フォルダに配置してください。
よく使う記号についてはマクロを組んでおくと楽です。

:sample
;heart.png はハートマークの画像
[macro name="heart"]
[graph storage="heart.png"]
[endmacro]

;以後、[heart] タグでハートマークを使用可能
大好き[heart][p]

:param
storage = 表示する画像ファイル名を指定します。

:demo
1,kaisetsu/02_decotext

#[end]
*/

tyrano.plugin.kag.tag.graph = {
    vital: ["storage"],

    pm: {
        storage: null,
    },

    //開始
    start: function (pm) {
        var jtext = this.kag.getMessageInnerLayer();

        var current_str = "";

        if (jtext.find("p").find(".current_span").length != 0) {
            current_str = jtext.find("p").find(".current_span").html();
        }

        var storage_url = "";

        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        } else {
            storage_url = "./data/image/" + pm.storage;
        }

        //テキストエリアに画像を追加して、次のメッセージへ晋
        this.kag.appendMessage(jtext, current_str + "<img src='" + storage_url + "' >");

        this.kag.ftag.nextOrder();
    },
};

/*
#[jump]

:group
ラベル・ジャンプ操作

:title
シナリオのジャンプ

:exp
指定シナリオファイルの指定ラベルに移動します。

`[call]`タグとは異なり、`[jump]`タグの移動はコールスタックに残りません。つまり一方通行であり、`[return]`で戻ってくることはできません。

:sample
;second.ks というシナリオファイルの *start ラベルへ移動する
[jump storage=second.ks target=*start]

:param
storage = !!jump,
target  = !!jump

:demo

#[end]
*/

//ジャンプ命令
tyrano.plugin.kag.tag.jump = {
    pm: {
        storage: null,
        target: null, //ラベル名
        countpage: true,
    },

    start: function (pm) {
        if (this.kag.stat.hold_glink && !pm.storage && !pm.target) {
            pm.storage = this.kag.stat.hold_glink_storage;
            pm.target = this.kag.stat.hold_glink_target;
            this.kag.stat.hold_glink = false;
            this.kag.stat.hold_glink_storage = "";
            this.kag.stat.hold_glink_target = "";
        }

        var that = this;

        //ジャンプ直後のwt などでフラグがおかしくなる対策
        setTimeout(function () {
            that.kag.ftag.nextOrderWithLabel(pm.target, pm.storage);
        }, 1);
    },
};

/*
#[r]

:group
メッセージ・テキスト

:title
改行

:exp
改行します。

:sample
テキスト表示[l]
改行します[l][r]
改行します[l][r]

:param

:demo
 1,kaisetsu/01_text

#[end]
*/

//改行を挿入
tyrano.plugin.kag.tag.r = {
    log_join: "true",

    start: function () {
        var that = this;
        this.kag.getMessageInnerLayer().find("p").find(".current_span").append("<br>");
        this.kag.ftag.nextOrder();
    },
};

/*
#[er]

:group
メッセージ・テキスト

:title
メッセージレイヤの文字の消去

:exp
現在の操作対象のメッセージレイヤの文字を消去します。

操作対象のメッセージレイヤを切り替えるには`[current]`タグを使います。

:sample
クリックするとメッセージがクリアされます[l][er]
クリアされました[l]

:param

:demo
1,kaisetsu/01_text

#[end]
*/

tyrano.plugin.kag.tag.er = {
    start: function () {
        this.kag.ftag.hideNextImg();
        //フォントのリセット
        //カレントレイヤのみ削除
        this.kag.getMessageInnerLayer().html("");

        this.kag.ftag.startTag("resetfont");

        //this.kag.ftag.nextOrder();
    },
};

/*
#[cm]

:group
メッセージ・テキスト

:title
すべてのメッセージレイヤのクリア

:exp
すべてのメッセージレイヤの文字を消去します。`[button]``[glink]``[html]`タグなどで表示した要素も消去されます。

フォントスタイルがデフォルトの設定に戻ります。

`[ct]`タグとは異なり、操作対象のメッセージレイヤが`message0`に変更されるようなことはありません。このタグを実行したあとも操作対象のメッセージレイヤは同じままです。

:sample
テキスト表示[l]
画面クリアする[l][cm]
もう一度画面クリアする[l][cm]

:param

:demo
1,kaisetsu/01_text

#[end]
*/

//画面クリア
tyrano.plugin.kag.tag.cm = {
    pm: {
        next: "true",
    },

    start: function (pm) {
        this.kag.ftag.hideNextImg();
        //フォントのリセット
        //カレントレイヤだけじゃなくて、全てもメッセージレイヤを消去する必要がある

        if (this.kag.stat.vchat.is_active) {
            this.kag.ftag.startTag("vchat_in", {});
        } else {
            this.kag.layer.clearMessageInnerLayerAll();
        }

        this.kag.stat.log_clear = true;

        //フリーレイヤ消去
        this.kag.layer.getFreeLayer().html("").hide();

        this.kag.ftag.startTag("resetfont", pm);
    },
};

/*
#[ct]

:group
メッセージ・テキスト

:title
メッセージレイヤのリセット

:exp
すべてのメッセージレイヤの文字が消去されます。

フォントスタイルがデフォルトの設定に戻り、操作対象のメッセージレイヤが`message0`の表ページに変更されます。

:sample
テキスト表示[l]
画面リセットする[l][ct]
もう一度画面リセットする[l][ct]

:param

:demo
1,kaisetsu/01_text

#[end]
*/

tyrano.plugin.kag.tag.ct = {
    start: function () {
        this.kag.ftag.hideNextImg();

        //フォントのリセット
        //カレントレイヤだけじゃなくて、全てもメッセージレイヤを消去する必要がある
        this.kag.layer.clearMessageInnerLayerAll();

        //フリーレイヤ消去
        this.kag.layer.getFreeLayer().html("").hide();

        this.kag.stat.current_layer = "message0";
        this.kag.stat.current_page = "fore";

        this.kag.ftag.startTag("resetfont");
    },
};

/*
#[current]

:group
メッセージ・テキスト

:title
操作対象のメッセージレイヤの指定

:exp
操作対象とするメッセージレイヤを指定します。以後、テキストや`[font]`タグでの文字属性の指定、`[l]`タグ等のクリック待ちなどはこのレイヤに対して行われます。

`message0`はデフォルトで可視の状態ですが、`message1`は`[layopt]`タグを使用しないと表示されないので注意してください。

:sample
[current layer="message0"]
message0レイヤに表示されています[l]
[current layer="message1"]
message1レイヤに表示されています[l]

:param
layer = 操作対象のメッセージレイヤを指定します。省略すると、現在のメッセージレイヤとみなされます。,
page  = !!

:demo
1,kaisetsu/18_window_2

#[end]
*/

//メッセージレイヤの指定
tyrano.plugin.kag.tag.current = {
    pm: {
        layer: "",
        page: "fore",
    },

    start: function (pm) {
        //layer指定がない場合は、現在のレイヤを採用
        if (pm.layer == "") {
            pm.layer = this.kag.stat.current_layer;
        }

        this.kag.stat.current_layer = pm.layer;
        this.kag.stat.current_page = pm.page;

        this.kag.ftag.nextOrder();
    },
};

//メッセージレイヤの属性を変更します

/*
#[position]

:group
メッセージ関連の設定

:title
メッセージウィンドウの属性変更

:exp
メッセージウィンドウに対する様々な属性を指定します。
いずれの属性も、省略すれば設定は変更されません。

:sample
;メッセージウィンドウの位置とサイズを変更
[position width=400 height=300 top=100 left=20]
;メッセージウィンドウの色と透明度を変更
[position color=blue opacity=100]

:param
layer        = 対象とするメッセージレイヤを指定します。,
page         = !!,
left         = メッセージウィンドウの左端位置を指定します。（ピクセル）,
top          = メッセージウィンドウの上端位置を指定します。（ピクセル）,
width        = メッセージウィンドウの横幅を指定します。（ピクセル）,
height       = メッセージウィンドウの高さを指定します。（ピクセル）,
frame        = <p>メッセージウィンドウのフレーム画像として表示させる画像を指定します。</p><p>画像サイズは`width`と`height`属性に準じて調整してください。`margin`属性で実際にメッセージが表示される箇所の調整も行いましょう。</p><p>`none`と指定することで標準枠に戻すこともできます。,
color        = メッセージウィンドウの表示色を`0xRRGGBB`形式で指定します。 ,
border_color = 外枠の線が有効な場合の色を`0xRRGGBB`形式で指定します。`border_size`属性の指定が同時に必要です,
border_size  = 外枠の線が有効な場合の太さを指定します。`0`を指定すると外枠は表示されません。初期値は`0`です。,
opacity      = メッセージウィンドウの不透明度を`0`～`255`の数値で指定します。`0`で完全に透明。（文字の不透明度や、レイヤ自体の不透明度ではありません）,
marginl      = メッセージウィンドウの左余白を指定します。,
margint      = メッセージウィンドウの上余白を指定します。,
marginr      = メッセージウィンドウの右余白を指定します。,
marginb      = メッセージウィンドウの下余白を指定します。,
margin       = メッセージウィンドウの余白を一括で指定します。たとえば`30`と指定すると上下左右すべてに30pxの余白ができます。<br>カンマ区切りで方向ごとの余白を一括指定することもできます。`上下,左右`、`上,左右,下`、`上,右,下,左`のように指定できます（方向の部分は数値に変えてください）。,
radius       = メッセージウィンドウの角の丸みを数値で指定します。例：`10`(控えめな角丸)、`30`(普通の角丸)、`100`(巨大な角丸),
vertical     = メッセージウィンドウを縦書きモードにするかどうか。`true`または`false`で指定します。`true`で縦書き、`false`で横書き。,
visible      = メッセージレイヤを表示状態にするかどうか。`true`または`false`を指定すると、同時にメッセージレイヤの表示状態を操作できます。,
gradient     = 背景にグラデーションを適用することができます。CSSグラデーション形式で指定します。CSSグラデーションとは、たとえば`linear-gradient(45deg, red 0%, yellow 100%)`のような形式です。<br>CSSグラデーションを簡単に作れるサイトがWeb上にいくつか存在しますので、「CSS グラデーション ジェネレーター」で検索してみてください。

:demo
1,kaisetsu/17_window_1

#[end]
*/

tyrano.plugin.kag.tag.position = {
    pm: {
        layer: "message0",
        page: "fore",
        left: "",
        top: "",
        width: "",
        height: "",
        color: "",
        opacity: "",
        vertical: "",
        frame: "",
        radius: "",
        border_color: "",
        border_size: "",
        marginl: "", //左余白
        margint: "", //上余白
        marginr: "", //右余白
        marginb: "", //下余白
        margin: "", //一括余白
        gradient: "",
        visible: "",
        next: "true",
    },

    start: function (pm) {
        // メッセージレイヤ、アウター、インナー
        const j_message_layer = this.kag.layer.getLayer(pm.layer, pm.page);
        const j_message_outer = j_message_layer.find(".message_outer");
        const j_message_inner = j_message_layer.find(".message_inner");

        if (pm.visible !== "") {
            if (pm.visible === "true") {
                this.kag.layer.showLayer(j_message_layer);
            } else {
                this.kag.layer.hideLayer(j_message_layer);
            }
        }

        //
        // アウターのスタイル
        //

        const new_style_outer = {};

        if (pm.left !== "") new_style_outer["left"] = pm.left + "px";
        if (pm.top !== "") new_style_outer["top"] = pm.top + "px";
        if (pm.width !== "") new_style_outer["width"] = pm.width + "px";
        if (pm.height !== "") new_style_outer["height"] = pm.height + "px";
        if (pm.radius !== "") {
            new_style_outer["border-radius"] = parseInt(pm.radius) + "px";
        }
        if (pm.border_size !== "") {
            new_style_outer["border-width"] = parseInt(pm.border_size) + "px";
            j_message_outer.css("border-style", "solid");
        }
        if (pm.border_color !== "") {
            new_style_outer["border-color"] = $.convertColor(pm.border_color);
        }
        if (pm.opacity !== "") {
            new_style_outer["opacity"] = $.convertOpacity(pm.opacity);
        }
        if (pm.color !== "") {
            new_style_outer["background-color"] = $.convertColor(pm.color);
            j_message_outer.css("background-image", "");
        }
        if (pm.gradient !== "") {
            new_style_outer["background-image"] = pm.gradient;
        }

        // 背景フレームの設定 単色か画像か
        if (pm.frame == "none") {
            // 単色
            j_message_outer.css("background-image", "");
            j_message_outer.css("background-color", $.convertColor(this.kag.config.frameColor));
        } else if (pm.frame !== "") {
            // 画像のパス
            let storage_url = "";
            if ($.isHTTP(pm.frame)) {
                storage_url = pm.frame;
            } else {
                storage_url = "./data/image/" + pm.frame;
            }
            j_message_outer.css("background-image", "url(" + storage_url + ")");
            j_message_outer.css("background-repeat", "no-repeat");
            j_message_outer.css("background-color", "");
        }

        // アウターにスタイルを当てる
        this.kag.setStyles(j_message_outer, new_style_outer);

        // アウターのスタイル情報を保存
        this.kag.stat.fuki.def_style = $.extend(true, this.kag.stat.fuki.def_style, new_style_outer);

        //
        // アウターの変更内容を[position_filter]にも反映する
        //

        const j_filter = j_message_layer.find(".message_filter");
        if (j_filter.length > 0) {
            ["left", "top", "width", "height", "border-radius", "border-style", "border-width"].forEach((key) => {
                j_filter.css(key, j_message_outer.css(key));
            });
        }

        //
        // インナーのスタイル
        //

        // インナーのリフレッシュ
        // インナーの left, top, width, height を操作して全体的にアウターの10px内側に収まるようにする処理
        this.kag.layer.refMessageLayer(pm.layer);

        // 縦書き指定
        if (pm.vertical != "") {
            if (pm.vertical == "true") {
                this.kag.stat.vertical = "true";
                j_message_inner.find("p").addClass("vertical_text");
            } else {
                this.kag.stat.vertical = "false";
                j_message_inner.find("p").removeClass("vertical_text");
            }
        }

        // インナーに box-sizing: border-box を採用
        // https://developer.mozilla.org/ja/docs/Web/CSS/box-sizing
        // 旧実装では marginr, marginb を実現するために width, height を操作していたが
        // [position]タグ実行時には必ず上のインナーリフレッシュによって width, height が破壊されてしまうため、
        // 『marginr, marginb が指定されていない[position]タグ』を通過するときにそれまでの marginr, marginb が破棄される問題があった
        // (タグリファレンスの『いずれの属性も、指定しなければ変更は行われません。』という説明と矛盾していた)
        const new_style_inner = {};

        if (this.kag.stat.fuki.active == true) {
            new_style_inner["box-sizing"] = "content-box";
        } else {
            new_style_inner["box-sizing"] = "border-box";
        }

        // marginパラメータで一括指定
        if (pm.margin !== "") {
            const hash = pm.margin.split(",");
            switch (hash.length) {
                default:
                case 1:
                    pm.margint = pm.marginr = pm.marginb = pm.marginl = pm.margin;
                    break;
                case 2:
                    pm.margint = pm.marginb = hash[0];
                    pm.marginl = pm.marginr = hash[1];
                    break;
                case 3:
                    pm.margint = hash[0];
                    pm.marginl = pm.marginr = hash[1];
                    pm.marginb = hash[2];
                    break;
                case 4:
                    pm.margint = hash[0];
                    pm.marginr = hash[1];
                    pm.marginb = hash[2];
                    pm.marginl = hash[3];
                    break;
            }
        }

        if (pm.marginl !== "") new_style_inner["padding-left"] = parseInt(pm.marginl) + "px";
        if (pm.margint !== "") new_style_inner["padding-top"] = parseInt(pm.margint) + "px";
        if (pm.marginr !== "") {
            new_style_inner["padding-right"] = parseInt(pm.marginr) + "px";
            this.kag.stat.fuki.marginr = parseInt(pm.marginr);
        }
        if (pm.marginb !== "") {
            new_style_inner["padding-bottom"] = parseInt(pm.marginb) + "px";
            this.kag.stat.fuki.marginb = parseInt(pm.marginb);
        }

        // インナーにスタイルを当てる
        this.kag.setStyles(j_message_inner, new_style_inner);

        // インナーのスタイル情報を保存
        this.kag.stat.fuki.def_style_inner = $.extend(true, this.kag.stat.fuki.def_style_inner, new_style_inner);

        if (pm.next == "true") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[fuki_start]

:group
メッセージ・テキスト

:title
メッセージレイヤをふきだし化する

:exp
メッセージレイヤを漫画のふきだし風に表現できます。

このタグでふきだし表示を有効にする前に`[fuki_chara]`タグで設定が必要です。

ふきだしのデザインは`[position]`タグの設定が引き継がれますが、`[fuki_chara]`タグで個別に設定することも可能です。

:sample

;通常のメッセージレイヤに対して、ふきだしに適応したいデザインを設定する
[font color="black"]
[position layer="message0" page=fore radius=15 visible=true color="white" opacity=255 border_size="3" border_color="black" ]

;ふきだしの表示位置をキャラごとに設定する
[fuki_chara name="akane" left=200 top=270 sippo_left=30 sippo_top=30 sippo="top" max_width=300 radius=15]
[fuki_chara name="yamato" left=350 top=280  sippo_left=30 sippo_top=30 sippo="top" ]

;キャラクターが画面上に存在しない場合に適応するふきだし設定 name=others
[fuki_chara name="others" left=250 top=500 max_width=700 fix_width=700 radius=0 ]

;ふきだし表示を開始する
[fuki_start ]

#akane
あかねの位置にふきだしを表示[p]

#yamato
やまとのいちにふきだしを表示[p]

#
othersで設定した位置にふきだしを表示[p]

:param
layer = 対象とするメッセージレイヤを指定します。

#[end]
*/

tyrano.plugin.kag.tag.fuki_start = {
    pm: {
        layer: "message0",
        page: "fore",
    },

    start: function (pm) {
        this.kag.stat.fuki.active = true;

        //どこに表示するか
        //指定のレイヤを取得
        var target_layer = this.kag.layer.getLayer(pm.layer, pm.page).find(".message_outer");
        target_layer.addClass("fuki_box");

        var j_msg_inner = this.kag.layer.getLayer(pm.layer, pm.page).find(".message_inner");
        j_msg_inner.css("width", "");
        j_msg_inner.css("height", "");
        j_msg_inner.css("box-sizing", "content-box");

        this.kag.ftag.nextOrder();
    },
};

/*
#[fuki_stop]

:group
メッセージ・テキスト

:title
メッセージレイヤのふきだし化を無効にする

:exp
ふきだし表示を停止します。

メッセージレイヤのスタイルは`[fuki_start]`タグの前の状態に戻ります。

:sample

:param

#[end]
*/

tyrano.plugin.kag.tag.fuki_stop = {
    pm: {},

    start: function (pm) {
        this.kag.stat.fuki.active = false;

        var j_outer_layer = this.kag.getMessageOuterLayer();
        j_outer_layer.removeClass("fuki_box");

        //スタイルをもとに戻す
        let def_style = this.kag.stat.fuki.def_style;
        this.kag.setStyles(j_outer_layer, def_style);

        var j_inner_layer = this.kag.getMessageInnerLayer();

        j_inner_layer.css("max-width", "");

        //スタイルをもとに戻す
        let def_style_inner = this.kag.stat.fuki.def_style_inner;

        j_inner_layer.css("left", parseInt(j_outer_layer.css("left")) + 10).css("top", parseInt(j_outer_layer.css("top")) + 10);
        j_inner_layer.css("box-sizing", "border-box");

        this.kag.setStyles(j_inner_layer, def_style_inner);

        //名前表示エリアを復元する。
        $(".tyrano_base").find(".chara_name_area").show();

        this.kag.ftag.nextOrder();
    },
};

/*
#[fuki_chara]

:group
メッセージ・テキスト

:title
ふきだしのキャラクター登録

:exp
ふきだしのデザインをキャラクターごとに設定できます。

`name`属性に`others`を指定すると、画面上にキャラクターがいない場合のデザインを設定できます。

:sample

;ふきだしの表示位置をキャラごとに設定する
[fuki_chara name="akane" left=200 top=270 sippo_left=30 sippo_top=30 sippo="top" max_width=300 radius=15]
[fuki_chara name="yamato" left=350 top=280  sippo_left=30 sippo_top=30 sippo="top" ]

;キャラクターが画面上に存在しない場合に適応するふきだし設定 name=others
[fuki_chara name="others" left=250 top=500 max_width=700 fix_width=700 radius=0 ]

:param
name         = キャラクター名を指定します。キャラクターがいないときデザインを設定するには`others`を指定します。,
left         = どの位置にふきだしを表示するかを指定します。（キャラクター画像左端からの相対位置）,
top          = どの位置にふきだしを表示するかを指定します。（キャラクター画像上端からの相対位置）,
sippo        = しっぽをどの方向に表示するかを指定します。`top`(上)、 `bottom`(下)、`left`(左)、`right`(右),
sippo_left   = ふきだしの位置が`top`か`bottom`の場合、しっぽを表示する左端からの位置を指定できます。,
sippo_top    = ふきだしの位置が`left`か`right`の場合、しっぽを表示する上端からの位置を指定できます。,
sippo_width  = しっぽの幅を指定できます。,
sippo_height = しっぽの高さを指定できます。,
max_width    = ふきだしのサイズは自動的に調整されますが、その際の横幅の上限サイズを指定できます。,
fix_width    = これを指定することで、ふきだしの横幅の自動調節機能を停止し、指定した横幅で固定できます。,
color        = ふきだしの表示色を`0xRRGGBB`形式で指定します。,
border_color = 外枠の線の色を`0xRRGGBB`形式で指定します。`border_size`の指定が同時に必要です。,
border_size  = 外枠の線の太さを指定します。`0`を指定すると外枠は表示されません。初期値は`0`。,
opacity      = ふきだしの不透明度を`0`～`255`の数値で指定します。`0`で完全に透明。（文字の不透明度や、レイヤ自体の不透明度ではありません）,
radius       = ふきだしの角の丸みを数値で指定します。例：`10`(控えめな角丸)、`30`(普通の角丸)、`100`(巨大な角丸),
font_color   = フォントの色を`0xRRGGBB`形式で指定します。,
font_size    = フォントサイズを指定します。

#[end]
*/

tyrano.plugin.kag.tag.fuki_chara = {
    vital: ["name"],

    pm: {
        name: "",

        //left:"",
        //top:"",

        sippo: "top", // top bottom left right none
        sippo_left: "40",
        sippo_top: "40",

        sippo_width: "12", //border-left-width
        sippo_height: "20", //border-top-width

        //指定しない場合はデフォルトのスタイルが適応される。
        enable: "true",

        max_width: "300", //ふきだしの最大幅
        fix_width: "", //ふきだしを固定にするか否か

        font_color: "",
        font_size: "",

        color: "",
        opacity: "",
        border_size: "",
        border_color: "",
        radius: "",
    },

    start: function (pm) {
        var storage_url = "";

        //見た目は継承させない
        if (pm.color == "") delete pm.color;
        if (pm.opacity == "") delete pm.opacity;
        if (pm.border_size == "") delete pm.border_size;
        if (pm.border_color == "") delete pm.border_color;
        if (pm.radius == "") delete pm.radius;

        if (pm.font_size == "") delete pm.font_size;
        if (pm.font_color == "") delete pm.font_color;

        if (pm.name == "others") {
            this.kag.stat.fuki.others_style = $.extend(this.kag.stat.fuki.others_style, pm);
        } else {
            var cpm = this.kag.stat.charas[pm.name];

            if (cpm == null) {
                this.kag.error("undefined_character");
                return;
            }

            let _cpm = cpm["fuki"];

            //パラメータ更新
            this.kag.stat.charas[pm.name]["fuki"] = $.extend(_cpm, pm);
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[image]

:group
画像・背景・レイヤ操作

:title
画像を表示

:exp
指定したレイヤに画像を追加します。キャラクター表示や背景切り替えなどに使用できます。

初期状態ではレイヤ自体が非表示になっているため、そのままでは`[image]`タグで画像を追加しても画面に表示されません。はじめに`[layopt]`タグでレイヤ自体を表示状態にする必要があります。

:sample
;レイヤ1を表示状態に
[layopt layer="1" visible="true"]
;レイヤ1にcat.pngを追加
[image layer="1" x="150" y="150" storage="cat.png"]
[l]

;画像を削除
[freeimage layer="1"]

:param
storage = 画像ファイル名を指定します。ファイルは背景レイヤなら`data/bgimage`、前景レイヤなら`data/fgimage`に入れてください。,
layer   = 画像を追加するレイヤを指定します。<br>`base`を指定すると背景レイヤ。`0`以上の整数を指定すると対応する前景レイヤに画像を表示します。,
page    = !!,
visible = `true`または`false`を指定します。`true`を指定すると、画像を追加すると同時に対象レイヤを表示状態にします。つまり、`[layopt visible="true"]`を省略できます。,
left    = 画像の左端位置を指定します。（ピクセル）,
top     = 画像の上端位置を指定します。（ピクセル）,
x       = 画像の左端位置を指定します。`left`と同様。こちらが優先度高。（ピクセル）,
y       = 画像の上端位置を指定します。`top`と同様。こちらが優先度高。（ピクセル）,
width   = 画像の横幅を指定します。（ピクセル）,
height  = 画像の高さを指定します。（ピクセル）,
folder  = 画像が入っているフォルダを指定できます。デフォルトでは前景レイヤ用の画像は`fgimage`フォルダ、背景レイヤ用の画像は`bgimage`フォルダと決まっていますが、これを変更できます。,
name    = !!,
time    = !!fadein,
wait    = !!fadein,
zindex  = 画像同士の重なりを指定できます。数値が大きい方が前に表示されます。,
depth   = zindexが同一な場合の重なりを指定できます。`front`(最前面)または`back`(最後面)で指定します。デフォルトはfront。,
reflect = `true`を指定すると左右反転します。,
pos     = <p>画像の位置をキーワードで決定します。</p><p>指定できるキーワードは`left`(左端)、`left_center`(左寄り)、`center`(中央)、`right_center`(右寄り)、`right`(右端)。各キーワードに対応する実際の座標は`Config.tjs`で設定されており、自由に編集できます。</p><p>各キーワードにはそれぞれ省略形があり、`l`、`lc`、`c`、`rc`、`r`と指定することもできます。動作は同じです。</p><p>この属性を指定した場合は`left`パラメータは無視されます。</p><p>`layer`を`base`と指定した場合、この属性は指定しないでください。</p>,
animimg = `true`を指定すると、GIFまたはAPNG形式のアニメーション画像を最初から再生できます。,

:demo
1,kaisetsu/05_image

#[end]
*/

//タグを記述していく
//[image layer=base page=fore storage=haikei.jpg visible=true]
tyrano.plugin.kag.tag.image = {
    pm: {
        layer: "base",
        page: "fore",
        visible: "",
        top: "",
        left: "",
        x: "",
        y: "",
        width: "",
        height: "",
        pos: "",
        name: "",
        folder: "", //画像フォルダを明示できる
        time: "",
        wait: "true",
        depth: "front",
        reflect: "",
        zindex: "1",
        //"visible":"true"
    },

    start: function (pm) {
        var strage_url = "";
        var folder = "";
        var that = this;

        if (pm.layer != "base") {
            //visible true が指定されている場合は表示状態に持っていけ
            //これはレイヤのスタイル
            var layer_new_style = {};

            //デフォルト非表示 バックの場合も非表示ですよ。
            if (pm.visible == "true" && pm.page == "fore") {
                layer_new_style.display = "block";
            }

            this.kag.setStyles(this.kag.layer.getLayer(pm.layer, pm.page), layer_new_style);

            //ポジションの指定
            if (pm.pos != "") {
                switch (pm.pos) {
                    case "left":
                    case "l":
                        pm.left = this.kag.config["scPositionX.left"];
                        break;

                    case "left_center":
                    case "lc":
                        pm.left = this.kag.config["scPositionX.left_center"];
                        break;

                    case "center":
                    case "c":
                        pm.left = this.kag.config["scPositionX.center"];
                        break;

                    case "right_center":
                    case "rc":
                        pm.left = this.kag.config["scPositionX.right_center"];
                        break;

                    case "right":
                    case "r":
                        pm.left = this.kag.config["scPositionX.right"];
                        break;
                }
            }

            if (pm.folder != "") {
                folder = pm.folder;
            } else {
                folder = "fgimage";
            }

            //前景レイヤ
            if ($.isHTTP(pm.storage)) {
                strage_url = pm.storage;
            } else {
                strage_url = "./data/" + folder + "/" + pm.storage;
            }

            var img_obj = $("<img />");

            if ($.getExt(pm.storage) == "svg" || $.getExt(pm.storage) == "SVG") {
                img_obj = $("<object type='image/svg+xml' />");
                img_obj.attr("data", strage_url);
            }

            img_obj.attr("src", strage_url);

            img_obj.css("position", "absolute");
            img_obj.css("top", pm.top + "px");
            img_obj.css("left", pm.left + "px");

            if (pm.width != "") {
                img_obj.css("width", pm.width + "px");
            }

            if (pm.height != "") {
                img_obj.css("height", pm.height + "px");
            }

            if (pm.x != "") {
                img_obj.css("left", pm.x + "px");
            }

            if (pm.y != "") {
                img_obj.css("top", pm.y + "px");
            }

            if (pm.zindex != "") {
                img_obj.css("z-index", pm.zindex);
            }

            if (pm.reflect != "") {
                if (pm.reflect == "true") {
                    img_obj.addClass("reflect");
                }
            }

            // APNG/GIF画像によるアニメーションを最初から再生するための処理
            // [image ... animimg="true"] で有効
            if (pm.animimg === "true") {
                // 現在のドキュメント上に存在する同じソースを持つ画像の個数を取得
                const same_src_imgs = $(`[src^='${strage_url}'`);
                const count = same_src_imgs.length;
                // 個数をクエリパラメータに追加する（?count=1 のように）
                const url_obj = new URL(strage_url, window.location.href);
                url_obj.searchParams.set("count", count + 1);
                let new_url = url_obj.pathname + url_obj.search;
                // 元のURLが相対指定の場合は調整する
                if (strage_url.startsWith("./data/")) {
                    const separator = strage_url.slice(1).split("?")[0];
                    new_url = "." + separator + new_url.split(separator).pop();
                }
                img_obj.attr("src", new_url);
                that.kag.event.addEventElement({
                    tag: "image",
                    j_target: img_obj,
                    pm: pm,
                });
                that.setEvent(img_obj, pm);
            }

            //オブジェクトにクラス名をセットします
            $.setName(img_obj, pm.name);

            if (pm.time == 0 || pm.time == "0") pm.time = ""; // integer 0 and string "0" are equal to ""
            if (pm.time != "") {
                img_obj.css("opacity", 0);

                if (pm.depth == "back") {
                    this.kag.layer.getLayer(pm.layer, pm.page).prepend(img_obj);
                } else {
                    this.kag.layer.getLayer(pm.layer, pm.page).append(img_obj);
                }

                img_obj.stop(true, true).animate({ opacity: 1 }, parseInt(pm.time), function () {
                    if (pm.wait == "true") {
                        that.kag.ftag.nextOrder();
                    }
                });

                if (pm.wait != "true") {
                    that.kag.ftag.nextOrder();
                }
            } else {
                if (pm.depth == "back") {
                    this.kag.layer.getLayer(pm.layer, pm.page).prepend(img_obj);
                } else {
                    this.kag.layer.getLayer(pm.layer, pm.page).append(img_obj);
                }

                this.kag.ftag.nextOrder();
            }
        } else {
            //base レイヤの場合

            if (pm.folder != "") {
                folder = pm.folder;
            } else {
                folder = "bgimage";
            }

            //背景レイヤ
            if ($.isHTTP(pm.storage)) {
                strage_url = pm.storage;
            } else {
                strage_url = "./data/" + folder + "/" + pm.storage;
            }

            //backの場合はスタイルなしですよ

            var new_style = {
                "background-image": "url(" + strage_url + ")",
                "display": "none",
            };

            if (pm.page === "fore") {
                new_style.display = "block";
            }

            this.kag.setStyles(this.kag.layer.getLayer(pm.layer, pm.page), new_style);
            this.kag.ftag.nextOrder();
        }
    },

    setEvent(j_obj, pm) {
        if (pm.animimg === "true") {
            // 画像を削除する前にソースを空にする
            j_obj.on("remove", () => {
                j_obj.attr("src", "");
            });
        }
    },
};

/*
#[freeimage]

:group
画像・背景・レイヤ操作

:title
レイヤのクリア

:exp
指定したレイヤに存在する画像などをすべて削除します。

:sample
;イメージを配置
[image layer="0" page="fore" visible="true" top="100" left="300"  storage="chara.png"]

;レイヤをクリア
[freeimage layer="0"]

;名前を指定してイメージを配置
[image name="myimg" layer="0" visible="true" top="100" left="300"  storage="myimg.png"]

;イメージの名前を指定して１つだけ消す
[free name="myimg" layer="0"]

:param
layer = !!,
page  = !!,
time  = !!fadeout,
wait  = !!fadeout

:demo
1,kaisetsu/05_image

#[end]
*/

//イメージ情報消去背景とか
tyrano.plugin.kag.tag.freeimage = {
    vital: ["layer"],

    pm: {
        layer: "",
        page: "fore",
        time: "", //徐々に非表示にする
        wait: "true",
    },

    start: function (pm) {
        var that = this;

        if (pm.layer != "base") {
            //前景レイヤの場合、全部削除だよ

            //非表示にした後、削除する
            if (pm.time == 0) pm.time = ""; // integer 0 and string "0" are equal to ""
            if (pm.time != "") {
                var j_obj = this.kag.layer.getLayer(pm.layer, pm.page).children();

                //存在しない場合は即next
                if (!j_obj.get(0)) {
                    if (pm.wait == "true") {
                        that.kag.ftag.nextOrder();
                        return;
                    }
                }

                var cnt = 0;
                var s_cnt = j_obj.length;

                j_obj.stop(true, true).animate({ opacity: 0 }, parseInt(pm.time), function () {
                    that.kag.layer.getLayer(pm.layer, pm.page).empty();
                    //次へ移動ですがな
                    cnt++;
                    if (s_cnt == cnt) {
                        if (pm.wait == "true") {
                            that.kag.ftag.nextOrder();
                        }
                    }
                });
            } else {
                that.kag.layer.getLayer(pm.layer, pm.page).empty();
                //次へ移動ですがな
                that.kag.ftag.nextOrder();
            }
        } else {
            this.kag.layer.getLayer(pm.layer, pm.page).css("background-image", "");
            //次へ移動ですがな
            this.kag.ftag.nextOrder();
        }

        if (pm.wait == "false") {
            this.kag.ftag.nextOrder();
        }
    },
};

//freeimageという名前がわかりにくい。freelayerという名前でもつかえるようにした。
tyrano.plugin.kag.tag.freelayer = tyrano.plugin.kag.tag.freeimage;

/*
#[free]

:group
画像・背景・レイヤ操作

:title
オブジェクトの解放

:exp
レイヤに追加された`name`で指定された要素をすべて削除します。`name`指定は必須です。

:sample
[backlay]
;キャラクター表示
[image name="myimage" layer=0 page=back visible=true top=100 left=300  storage = chara.png]
[trans time=2000]
@wt

;キャラクター非表示
[free name="myimage" layer=0 ]

:param
layer = !!,
name  = 削除する要素の`name`を指定します。レイヤ内のあらゆる要素に適応できます。,
time  = !!fadeout,
wait  = !!fadeout

:demo
1,kaisetsu/05_image

#[end]
*/

//イメージ情報消去背景とか
tyrano.plugin.kag.tag.free = {
    vital: ["layer", "name"],

    pm: {
        layer: "",
        page: "fore",
        name: "",
        wait: "true",
        time: "", //徐々に非表示にする
    },

    start: function (pm) {
        var that = this;

        if (pm.layer != "base") {
            //前景レイヤの場合、全部削除だよ

            //非表示にした後、削除する
            if (pm.time == 0) pm.time = ""; // integer 0 and string "0" are equal to ""
            if (pm.time != "") {
                var j_obj = this.kag.layer.getLayer(pm.layer, pm.page);
                j_obj = j_obj.find("." + pm.name);

                //存在しない場合は即next
                if (!j_obj.get(0)) {
                    if (pm.wait == "true") {
                        that.kag.ftag.nextOrder();
                        return;
                    }
                }

                var cnt = 0;
                var s_cnt = j_obj.length;

                j_obj.stop(true, true).animate({ opacity: 0 }, parseInt(pm.time), function () {
                    j_obj.remove();
                    //次へ移動ですがな
                    cnt++;
                    if (cnt == s_cnt) {
                        if (pm.wait == "true") {
                            that.kag.ftag.nextOrder();
                        }
                    }
                });

                //falseの時は即次へ
                if (pm.wait == "false") {
                    that.kag.ftag.nextOrder();
                }
            } else {
                let j_obj = this.kag.layer.getLayer(pm.layer, pm.page);
                j_obj = j_obj.find("." + pm.name);
                j_obj.remove();

                //次へ移動ですがな
                that.kag.ftag.nextOrder();
            }
        } else {
            let j_obj = this.kag.layer.getLayer(pm.layer, pm.page);
            j_obj = j_obj.find("." + pm.name);
            j_obj.remove();
            //this.kag.layer.getLayer(pm.layer, pm.page).css("background-image", "");
            //次へ移動ですがな
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[ptext]

:group
メッセージ・テキスト

:title
レイヤにテキストを表示

:exp
前景レイヤにテキストを表示します。メッセージウィンドウのテキストとは別に画面上にテキストを出したいときに使用できます。

テキストを消す時は`[freeimage]`タグを使うか、このタグで指定しておいた`name`属性に対して`[free]`タグを使う必要があります。

初期状態ではレイヤ自体が非表示になっているため、そのままでは`[ptext]`タグで文字を追加しても画面に表示されません。はじめに`[layopt]`タグでレイヤ自体を表示状態にする必要があります。

:sample
[backlay]
[ptext page=back text="テキストテキスト" size=30 x=200 y=300 color=red vertical=true]
[trans time=2000]
[wt]
[l]
表示したテキストを消去します
[freeimage layer=0]

:param
layer     = !!image,
page      = !!,
text      = 表示するテキストの内容。,
x         = テキストの左端位置を指定します。（ピクセル）,
y         = テキストの上端位置を指定します。（ピクセル）,
vertical  = 縦書きにするかどうか。`true`または`false`で指定します。,
size      = フォントサイズをピクセル単位で指定します。,
face      = フォントの種類を指定します。非KAG互換ですが、ウェブフォントも使用できます。,
color     = フォントの色を`0xRRGGBB`形式で指定します。,
bold      = 太字にする場合は`bold`と指定します。（このパラメータをCSSの`font-style`にセットします）<br>V515以降：`true`でも太字にできるようにしました。,
edge      = 文字の縁取りを有効にできます。縁取りする文字色を`0xRRGGBB`形式で指定します。<br>V515以降：縁取りの太さもあわせて指定できます。`4px 0xFF0000`のように、色の前に縁取りの太さをpx付きで記述します。太さと色は半角スペースで区切ってください。さらに`4px 0xFF0000, 2px 0xFFFFFF`のようにカンマ区切りで複数の縁取りを指定できます。,
shadow    = 文字に影をつけます。影の色を`0xRRGGBB`形式で指定します。縁取りをしている場合は無効化されます。,
name      = !!,
width     = テキスト表示部分の横幅をピクセルで指定します。,
align     = 文字の横方向に関する位置を指定できます。`width`パラメータを同時に指定する必要があります。`left`(左寄せ)、`center`(中央寄せ)、`right`（右寄せ),
time      = !!fadein,
overwrite = 上書きするかどうかを`true`または`false`で指定します。`true`を指定すると、同じ`name`が指定されたテキストがすでに存在している場合に、新規テキストを追加するのではなく既存のテキストの内容を書き変える処理を行います。,
gradient  = V515以降：文字にグラデーションを適用することができます。CSSのグラデーション関数を指定します。グラデーション関数とは`linear-gradient(45deg, red 0%, yellow 100%)`のような文字列です。<br>グラデーション関数を簡単に作れるサイトがWeb上にいくつか存在しますので、「CSS グラデーション ジェネレーター」で検索してみてください。


:demo
1,kaisetsu/06_ptext

#[end]
*/

//タグを記述していく
tyrano.plugin.kag.tag.ptext = {
    vital: ["layer", "x", "y"],

    pm: {
        layer: "0",
        page: "fore",
        x: 0,
        y: 0,
        vertical: "false",
        text: "", //テキスト領域のデフォルト値を指定するためですが、、、
        size: "",
        face: "",
        color: "",
        italic: "",
        bold: "",
        align: "left",
        edge: "",
        shadow: "",
        name: "",
        time: "",
        width: "",
        zindex: "9999",
        overwrite: "false", //要素を上書きするかどうか

        //"visible":"true"
    },

    start: function (pm) {
        var that = this;

        //
        // 上書き指定
        //

        if (pm.overwrite == "true" && pm.name != "") {
            if ($("." + pm.name).length > 0) {
                $("." + pm.name).updatePText(pm.text);

                //サイズとか位置とかも調整できるならやっとく
                if (pm.x != 0) {
                    $("." + pm.name).css("left", parseInt(pm.x));
                }

                if (pm.y != 0) {
                    $("." + pm.name).css("top", parseInt(pm.y));
                }

                if (pm.color != "") {
                    $("." + pm.name).css("color", $.convertColor(pm.color));
                }

                if (pm.size != "") {
                    $("." + pm.name).css("font-size", parseInt(pm.size));
                }

                this.kag.ftag.nextOrder();
                return false;
            }
        }

        //
        // 指定がない場合はデフォルトフォントを適応する
        //

        const font = this.kag.stat.font;

        if (pm.face == "") {
            pm.face = font.face;
        }

        if (pm.color == "") {
            pm.color = $.convertColor(font.color);
        } else {
            pm.color = $.convertColor(pm.color);
        }

        // bold="true" が指定されているなら font-weight: bold; を指定したい
        if (pm.bold === "true") {
            pm.bold = "bold";
        }

        //
        // CSSを準備
        //

        const font_new_style = {
            "color": pm.color,
            "font-weight": pm.bold,
            "font-style": pm.fontstyle,
            "font-size": pm.size + "px",
            "font-family": pm.face,
            "z-index": "999",
            "text": "",
        };

        //
        // DOM(jQueryオブジェクト)生成
        //

        const tobj = $("<p></p>");

        // スタイルをセット
        tobj.css({
            "position": "absolute",
            "top": pm.y + "px",
            "left": pm.x + "px",
            "width": pm.width,
            "text-align": pm.align,
        });
        this.kag.setStyles(tobj, font_new_style);

        //
        // 縁取り・影付き
        //

        // 縁取り有効か
        const is_edge_enabled = pm.edge !== "";
        // 縁取りタイプ
        pm.edge_method = pm.edge_method || font.edge_method || "shadow";
        // 1文字1文字を個別に装飾すべきか
        let is_individual_decoration = is_edge_enabled && pm.edge_method === "stroke";
        // shadowタイプの縁取りが有効でグラデーションも設定しようとしているなら個別装飾
        if (is_edge_enabled && pm.edge_method === "shadow" && pm.gradient) {
            is_individual_decoration = true;
        }
        if (is_edge_enabled) {
            // 縁取り文字
            switch (pm.edge_method) {
                case "shadow":
                    if (!is_individual_decoration) {
                        tobj.css("text-shadow", $.generateTextShadowStrokeCSS(pm.edge));
                    }
                    break;
                case "filter":
                    tobj.setFilterCSS($.generateDropShadowStrokeCSS(pm.edge));
                    break;
                case "stroke":
                    break;
            }
        } else if (pm.shadow != "") {
            tobj.css("text-shadow", "2px 2px 2px " + $.convertColor(pm.shadow));
        }

        // クラスをセット
        if (pm.vertical == "true") {
            tobj.addClass("vertical_text");
        }
        if (pm.layer == "fix") {
            tobj.addClass("fixlayer");
        }
        $.setName(tobj, pm.name);

        // 個別装飾が有効なら単純なhtml()では書き変えられなくなるので特別な処理
        if (is_individual_decoration) {
            tobj.addClass("multiple-text");
            this.kag.event.addEventElement({
                tag: "ptext",
                j_target: tobj,
                pm: pm,
            });
            this.setEvent(tobj, pm);
        }

        // innerHTMLをセット！
        tobj.updatePText(pm.text);

        // グラデーションの設定
        if (pm.gradient === "none") {
            pm.gradient = "";
        }
        if (pm.gradient && !is_individual_decoration) {
            tobj.setGradientText(pm.gradient);
        }

        //
        // レイヤに追加
        //

        const target_layer = this.kag.layer.getLayer(pm.layer, pm.page);

        //　時間指定
        if (pm.time != "") {
            tobj.css("opacity", 0);
            target_layer.append(tobj);
            tobj.stop(true, true).animate({ opacity: 1 }, parseInt(pm.time), function () {
                that.kag.ftag.nextOrder();
            });
        } else {
            target_layer.append(tobj);
            this.kag.ftag.nextOrder();
        }
    },

    setEvent: function (j_target, pm) {
        const that = TYRANO;

        /**
         * 生のElementにupdateTextメソッドを追加する
         * @param {string} str 新しくセットするテキスト
         */
        j_target.get(0).updateText = (str) => {
            that.kag.tmp.is_edge_overlap = false;

            // 個別縁取りが有効な場合
            const is_shadow = pm.edge_method === "shadow";
            if (is_shadow) {
                const edges = $.parseEdgeOptions(pm.edge);
                that.kag.tmp.text_shadow_values = [];
                for (let i = edges.length - 1; i >= 0; i--) {
                    const edge = edges[i];
                    const text_shadow_value = $.generateTextShadowStrokeCSSOne(edge.color, edge.total_width);
                    that.kag.tmp.text_shadow_values.push(text_shadow_value);
                }
                that.kag.tmp.inside_stroke_color = edges[0].color;
            }

            const inner_html = Array.prototype.reduce.call(
                str,
                (total_html, this_char) => {
                    if (is_shadow) {
                        return total_html + that.kag.getTag("text").buildTextShadowChar(this_char, pm.edge, true);
                    } else {
                        return total_html + that.kag.getTag("text").buildTextStrokeChar(this_char, pm.edge, true);
                    }
                },
                "",
            );
            j_target.html(inner_html);
            if (pm.gradient) {
                j_target.find(".fill").setGradientText(pm.gradient);
            }
        };
    },
};

/*
#[mtext]

:group
メッセージ・テキスト

:title
演出テキスト

:exp
多彩な演出効果をもったテキストを画面上に表示します。

指定できる演出アニメーションは http://tyrano.jp/mtext/ を参照してください。

初期状態ではレイヤ自体が非表示になっているため、そのままでは`[mtext]`タグで文字を追加しても画面に表示されません。はじめに`[layopt]`タグでレイヤ自体を表示状態にする必要があります。

:sample
;レイヤ0を表示状態に
[layopt layer=0 visible=true]
;演出テキストを表示
[mtext text="演出テキスト" x=100 y=100 in_effect="fadeIn" out_effect="fadeOut"]

:param
layer           = !!image,
page            = !!,
text            = 表示するテキストの内容を指定します。,
x               = テキストの左端位置を指定します。（ピクセル）,
y               = テキストの上端位置を指定します。（ピクセル）,
vertical        = 縦書きにするかどうか。`true`または`false`で指定します。,
size            = フォントサイズをピクセルで指定します。,
face            = フォントの種類を指定します。Webフォントを使用する場合は`tyrano/css/font.css`に定義を記述してください。,
color           = フォントの色を`0xRRGGBB`形式で指定します。,
width           = テキスト表示部分の横幅をピクセルで指定します。,
align           = 文字の横方向に関する位置を指定できます。同時に`width`パラメータを指定する必要があります。`left`(左寄せ)、`center`(中央寄せ)、`right`(右寄せ),
name            = !!,
bold            = 太字にする場合は`bold`と指定します。,
edge            = 文字の縁取りを有効にできます。縁取り色を`0xRRGGBB`形式で指定します。,
shadow          = 文字に影をつけます。影の色を`0xRRGGBB`形式で指定します。縁取りをしている場合は無効化されます。,
fadeout         = テキスト表示後にフェードアウトを実行するか否かを`true`または`false`で指定します。残った文字を消す場合は`[freeimage]`タグや`[free]`タグを使います。,
time            = テキストが静止している時間をミリ秒で指定します。,
wait            = アニメーションの完了を待つかどうか。`true`または`false`を指定します。`false`を指定すると、テキストの演出完了を待たずに次のタグに進みます。,
in_effect       = 文字が表示される際のアニメーション演出を指定します。,
in_delay        = 文字が表示される際の速度を指定します。何秒遅れて1文字が表示されるかをミリ秒で指定します。,
in_delay_scale  = １文字にかかるアニメーションの比率を指定します。,
in_sync         = `true`を指定すると、すべての文字が同時にアニメーションを開始します。,
in_shuffle      = `true`を指定すると、文字アニメーションのタイミングがランダムに実行されます。,
in_reverse      = `true`を指定すると、文字が後ろから表示されていきます。",
out_effect      = 文字が消える際のアニメーション演出を指定します。指定できるアニメーションは http://tyrano.jp/mtext/ を参照。,
out_delay       = 文字が消える際の速度を指定します。何秒遅れて1文字が消えるかをミリ秒で指定します。,
out_delay_scale = １文字にかかるアニメーションの比率を指定します。,
out_sync        = `true`を指定すると、すべての文字が同時にアニメーションを開始します。,
out_shuffle     = `true`を指定すると、文字アニメーションのタイミングがランダムに実行されます。,
out_reverse     = `true`を指定すると、文字が後ろから消えていきます。"

:demo
1,kaisetsu/07_mtext

#[end]
*/

//タグを記述していく
tyrano.plugin.kag.tag.mtext = {
    vital: ["x", "y"],

    pm: {
        layer: "0",
        page: "fore",
        x: 0,
        y: 0,
        vertical: "false",
        text: "", //テキスト領域のデフォルト値を指定するためですが、、、
        size: "",
        face: "",
        color: "",
        italic: "",
        bold: "",
        shadow: "",
        edge: "",
        name: "",
        zindex: "9999",
        width: "",
        align: "left",

        fadeout: "true", //テキストを残すかどうか
        time: "2000", //テキストを表示時間しておく時間

        in_effect: "fadeIn",
        in_delay: "50",
        in_delay_scale: "1.5",
        in_sync: "false",
        in_shuffle: "false",
        in_reverse: "false",

        wait: "true", //テキストの表示完了を待つ

        out_effect: "fadeOut",
        out_delay: "50", //次の１文字が消えるタイミングへ移動する時間をミリ秒で指定します
        out_scale_delay: "", //１文字が消えるのにかかる時間をミリ秒で指定します
        out_sync: "false",
        out_shuffle: "false",
        out_reverse: "false",
        //"visible":"true"
    },

    start: function (pm) {
        var that = this;

        //指定がない場合はデフォルトフォントを適応する

        if (pm.face == "") {
            pm.face = that.kag.stat.font.face;
        }

        if (pm.color == "") {
            pm.color = $.convertColor(that.kag.stat.font.color);
        } else {
            pm.color = $.convertColor(pm.color);
        }

        var font_new_style = {
            "color": pm.color,
            "font-weight": pm.bold,
            "font-style": pm.fontstyle,
            "font-size": pm.size + "px",
            "font-family": pm.face,
            "z-index": "999",
            "text": "",
        };

        if (pm.edge != "") {
            var edge_color = $.convertColor(pm.edge);
            font_new_style["text-shadow"] =
                "1px 1px 0 " + edge_color + ", -1px 1px 0 " + edge_color + ",1px -1px 0 " + edge_color + ",-1px -1px 0 " + edge_color + "";
        } else if (pm.shadow != "") {
            font_new_style["text-shadow"] = "2px 2px 2px " + $.convertColor(pm.shadow);
        }

        var target_layer = this.kag.layer.getLayer(pm.layer, pm.page);

        var tobj = $("<p></p>");

        tobj.css("position", "absolute");
        tobj.css("top", pm.y + "px");
        tobj.css("left", pm.x + "px");
        tobj.css("width", pm.width);
        tobj.css("text-align", pm.align);

        if (pm.vertical == "true") {
            tobj.addClass("vertical_text");
        }

        //オブジェクトにクラス名をセットします
        $.setName(tobj, pm.name);

        tobj.html(pm.text);

        this.kag.setStyles(tobj, font_new_style);

        if (pm.layer == "fix") {
            tobj.addClass("fixlayer");
        }

        //前景レイヤ
        target_layer.append(tobj);

        //bool変換
        for (let key in pm) {
            if (pm[key] == "true") {
                pm[key] = true;
            } else if (pm[key] == "false") {
                pm[key] = false;
            }
        }

        //tobj をアニメーションさせる
        tobj.textillate({
            loop: pm["fadeout"],
            minDisplayTime: pm["time"],

            in: {
                effect: pm["in_effect"],
                delayScale: pm["in_delay_scale"],
                delay: pm["in_delay"],
                sync: pm["in_sync"],
                shuffle: pm["in_shuffle"],
                reverse: pm["in_reverse"],
                callback: function () {
                    if (pm.fadeout == false && pm.wait == true) {
                        that.kag.ftag.nextOrder();
                    }
                },
            },

            out: {
                effect: pm["out_effect"],
                delayScale: pm["out_delay_scale"],
                delay: pm["out_delay"],
                sync: pm["out_sync"],
                shuffle: pm["out_shuffle"],
                reverse: pm["out_reverse"],
                callback: function () {
                    tobj.remove();
                    if (pm.wait == true) {
                        that.kag.ftag.nextOrder();
                    }
                },
            },
        });

        if (pm.wait != true) {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[backlay]

:group
画像・背景・レイヤ操作

:title
レイヤ情報の表ページから裏ページへのコピー

:exp
指定したレイヤ（あるいはすべてのレイヤ）の情報を、表ページから裏ページにコピーします。

`[trans]`タグと組み合わせて使います。まず`[backlay]`タグで表ページの画像を裏ページにコピーし、裏ページで画像の書き変えを行なってから、`[trans]`で裏ページの画像を表に持ってくる……というふうにすると、画像の書き変え最中の様子がゲーム画面上に映ってしまう心配がありません。

:sample
;背景変更をトランジションで実施
@layopt layer=message0 visible=false
[backlay]
[image layer=base page=back storage=rouka.jpg]
[trans time=2000]
[wt]

:param
layer = 対象となるレイヤを指定します。`base`を指定すると背景レイヤに、`0`以上の整数を指定すると前景レイヤに、`message0`や`message1`のように指定するとメッセージレイヤになります。`message`とのみ指定した場合は`[current]`タグで指定してある現在の操作対象のメッセージレイヤが対象になります。省略すると、すべてのレイヤの情報が裏ページにコピーされます。

:demo
1,kaisetsu/03_layer

#[end]
*/

//前景レイヤを背景レイヤにコピー
tyrano.plugin.kag.tag.backlay = {
    pm: {
        layer: "",
    },

    start: function (pm) {
        this.kag.layer.backlay(pm.layer);
        this.kag.ftag.nextOrder();
    },
};

/*
#[wt]

:group
画像・背景・レイヤ操作

:title
トランジションの終了待ち

:exp
トランジションが終了するまで、待ちます。

:sample
[backlay]
[image layer=base page=back storage=rouka.jpg]
[trans time=2000]
トランジションしてるよ……
[wt]

[cm]
トランジションが終わったよ[p]

:param

:demo
1,kaisetsu/03_layer

#[end]
*/

//トランジション完了を待つ
tyrano.plugin.kag.tag.wt = {
    start: function (pm) {
        if (this.kag.stat.is_trans == false) {
            this.kag.cancelWeakStop();
            this.kag.ftag.nextOrder();
        } else {
            this.kag.weaklyStop();
        }
    },
};

//音楽のフェードインを待つ
tyrano.plugin.kag.tag.wb = {
    start: function (pm) {
        this.kag.weaklyStop();
    },
};

//フェードインを待つ

//画面揺らし待ち
/*
tyrano.plugin.kag.tag.wq = {
start:function(pm){
//画面揺らしが終わらないと、次に進まないよね。
}
};
*/

/*
#[link]

:group
ラベル・ジャンプ操作

:title
ハイパーリンク（選択肢）の開始

:exp

`[link]`タグと`[endlink]`タグで囲まれた部分のテキストをリンク化します。選択肢の表示として使用可能。

リンク化されたテキストはマウスやキーボードで選択可能になります。クリックやキー入力で選択されたときに、特定のシナリオファイルまたはラベルにジャンプします。

ページをまたいでテキストをリンク化することはできません。（行をまたぐことはできます）

選択肢を表示したあとには`[s]`タグを配置して進行を停止させる必要があります。

:sample
選択肢を表示します[l][r][r]

[link target=*select1]【１】選択肢　その１[endlink][r]
[link target=*select2]【２】選択肢　その２[endlink][r]

[s]

*select1
[cm]
「選択肢１」がクリックされました[l]
@jump target=*common

*select2
[cm]
「選択肢２」がクリックされました[l]
@jump target=*common

*common
[cm]

共通ルートです

:param
storage  = !!jump,
target   = !!jump,
keyfocus = `false`を指定すると、キーボードやゲームパッドで選択できなくなります。また`1`や`2`などの数値を指定すると、キーコンフィグの`focus_next`アクションでボタンを選択していくときの順序を指定できます。,

:demo
1,kaisetsu/14_select

#[end]
*/

//リンクターゲット
tyrano.plugin.kag.tag.link = {
    pm: {
        target: null,
        storage: null,
        keyfocus: "",
        once: "true",
    },

    start: function (pm) {
        var that = this;

        //即時にスパンを設定しないとダメね
        var j_span = this.kag.setMessageCurrentSpan();

        that.kag.stat.display_link = true;

        that.kag.setElmCursor(j_span, "pointer");
        that.kag.makeFocusable(j_span, pm.keyfocus);

        (function () {
            var _target = pm.target;
            var _storage = pm.storage;

            //クラスとイベントを登録する
            that.kag.event.addEventElement({
                tag: "link",
                j_target: j_span, //イベント登録先の
                pm: pm,
            });

            //イベントを設定する
            that.setEvent(j_span, pm);
        })();

        this.kag.ftag.nextOrder();
    },

    setEvent: function (j_span, pm) {
        var _target = pm.target;
        var _storage = pm.storage;
        var that = TYRANO;

        // クリックされたかどうか
        var clicked = false;

        const once = pm.once !== "false";

        // mousedown イベントを親要素に貫通させない
        j_span.on("mousedown", () => {
            return false;
        });

        j_span.on("click", (e) => {
            // ブラウザの音声の再生制限を解除
            if (!that.kag.tmp.ready_audio) that.kag.readyAudio();

            //
            // 無効な場合を検知
            //

            // 仮想マウスカーソルが表示中、あるいは非表示になってから間もないなら無効
            if (!that.kag.key_mouse.mouse.isClickEnabled(e)) {
                that.kag.key_mouse.vmouse.hide();
                return false;
            }

            // クリック済みなら反応しない
            if (clicked && once) {
                return;
            }

            //
            // クリックが有効だったときの処理
            //

            // クリック済み
            clicked = true;

            // いま存在する once タイプの [link] 要素をクリックできなくする
            $("[data-event-tag=link]").each((i, elm) => {
                const j_elm = $(elm);
                const pm = JSON.parse(j_elm.attr("data-event-pm"));
                const once = pm.once !== "false";
                if (once) {
                    j_elm.off("click");
                    j_elm.setStyle("cursor", "auto");
                    this.kag.event.removeEventAttr(j_elm);
                }
            });

            // 仮想マウスカーソルを消去
            that.kag.key_mouse.vmouse.hide();

            // ティラノイベント"click-tag-link"を発火
            that.kag.trigger("click-tag-link", e);

            that.kag.stat.display_link = false;

            //ここから書き始める。イベントがあった場合の処理ですね　ジャンプで飛び出す
            TYRANO.kag.ftag.nextOrderWithLabel(_target, _storage);
            TYRANO.kag.cancelWeakStop();

            //選択肢の後、スキップを継続するか否か
            if (that.kag.stat.skip_link == "true") {
                e.stopPropagation();
            } else {
                that.kag.setSkip(false);
            }

            return false;
        });

        that.kag.setElmCursor(j_span, "pointer");
    },
};

/*
#[endlink]

:group
ラベル・ジャンプ操作

:title
ハイパーリンク（選択肢）の終了

:exp
`[link]`タグと組み合わせて使います。リンク化を終了します。

:sample
[link target=*select1]【１】選択肢　その１[endlink][r]
[link target=*select2]【２】選択肢　その２[endlink][r]

:param


:demo
1,kaisetsu/14_select

#[end]
*/

tyrano.plugin.kag.tag.endlink = {
    start: function (pm) {
        var j_span = this.kag.setMessageCurrentSpan();

        //新しいspanをつくるの
        this.kag.ftag.nextOrder();
    },
};

/*
#[s]

:group
システム操作

:title
ゲームを停止する

:exp
シナリオファイルの実行を停止します。

プレイヤーの選択を待つ場面、たとえば`[link]``[glink]``[button]`タグなどで選択肢表示したあとに`[s]`を記述します。

逆に言うと、<b>`[s]`に到達するとプレイヤーがクリックやタップでシナリオを進めることが不可能になる</b>ため、必ずプレイヤーにシナリオをジャンプさせるための手段を提供する必要があります。

:sample
[link target=*select1]【１】選択肢　その１[endlink][r]
[link target=*select2]【２】選択肢　その２[endlink][r]
[s]

:param

#[end]
*/

tyrano.plugin.kag.tag.s = {
    start: function () {
        this.kag.stronglyStop();
        this.kag.weaklyStop();

        // [glink]自動配置が有効な場合はここで表示する
        if (this.kag.stat.glink_config && this.kag.stat.glink_config.auto_place === "true") {
            this.showGLinks();
        }
    },

    /**
     * [glink]の自動配置を行う
     */
    showGLinks: function () {
        const j_layer = this.kag.layer.getFreeLayer();
        const j_glink_collection = j_layer.find(".glink_button_auto_place");

        // [glink]がないならなにもしない
        if (j_glink_collection.length === 0) {
            return;
        }

        // もうクラスは外すべき
        // ※[s]で止まっているセーブデータを読み込んだ直後に[s]が実行されることがあり
        // 　もしこのクラスが付いたままだとそこで変なことになる
        j_glink_collection.removeClass("glink_button_auto_place");

        // [glink_config]で設定したコンフィグを取得
        const glink_config = this.kag.getTag("glink_config").getConfig();

        //
        // ボタンにスタイルを当てる
        //
        j_glink_collection.setStyleMap({
            position: "relative",
            left: "auto",
            top: "auto",
            visibility: "hidden",
        });

        //
        // ボタンの width を決定する
        //

        switch (glink_config.width) {
            case "default":
                break;
            case "max":
                j_glink_collection.alignMaxWidth();
                break;
            default:
                j_glink_collection.css({
                    "box-sizing": "border-box",
                    "width": glink_config.width,
                });
        }

        //
        // ボタンの height を決定する
        //

        switch (glink_config.height) {
            case "default":
                break;
            case "max":
                j_glink_collection.alignMaxHeight();
                break;
            default:
                j_glink_collection.css({
                    "box-sizing": "border-box",
                    "height": glink_config.height,
                });
        }

        //
        // ボタンの margin を決定する
        //

        if (glink_config.margin_y !== "default") {
            j_glink_collection.setStyleMap({
                "margin-top": `${glink_config.margin_y}px`,
                "margin-bottom": `${glink_config.margin_y}px`,
            });
        }

        if (glink_config.margin_x !== "default") {
            j_glink_collection.setStyleMap({
                "margin-left": `${glink_config.margin_x}px`,
                "margin-right": `${glink_config.margin_x}px`,
            });
        }

        //
        // ボタンの padding を決定する
        //

        if (glink_config.padding_y !== "default") {
            j_glink_collection.setStyleMap({
                "padding-top": `${glink_config.padding_y}px`,
                "padding-bottom": `${glink_config.padding_y}px`,
            });
        }

        if (glink_config.padding_x !== "default") {
            j_glink_collection.setStyleMap({
                "padding-left": `${glink_config.padding_x}px`,
                "padding-right": `${glink_config.padding_x}px`,
            });
        }

        // 改めて表示
        j_glink_collection.show();

        //
        // ラッパーに当てるスタイル
        //

        const wrapper_style = {
            "position": "absolute",
            "display": "flex",
            "flex-direction": glink_config.direction,
            "flex-wrap": glink_config.wrap,
            "align-items": glink_config.horizontal,
            "justify-content": glink_config.vertical,
        };

        // ラッパーの領域（left, top, width, height)
        let area_nums;
        if (glink_config.place_area === "auto") {
            $.extend(wrapper_style, this.calcFlexPosition(glink_config));
        } else if (glink_config.place_area === "cover") {
            $.extend(wrapper_style, {
                left: "0",
                top: "0",
                width: "100%",
                height: "100%",
            });
        } else {
            area_nums = glink_config.place_area.split(",").map((item) => {
                return $.trim(item);
            });
            $.extend(wrapper_style, {
                left: `${area_nums[0]}px`,
                top: `${area_nums[1]}px`,
                width: `${area_nums[2]}px`,
                height: `${area_nums[3]}px`,
            });
        }

        // flexなラッパーを作る
        const j_wrapper = $('<div class="glink_auto_place_wrapper" />').setStyleMap(wrapper_style);

        // 全体をずらす
        if (glink_config.dx !== "0") j_wrapper.css("left", `+=${glink_config.dx}px`);
        if (glink_config.dy !== "0") j_wrapper.css("top", `+=${glink_config.dy}px`);

        // [glink]たちはこちらのラッパーに移動
        j_glink_collection.appendTo(j_wrapper);

        // 各ボタンについてアニメーション設定を見ていく
        let animation_target_count = 0;
        j_glink_collection.each((i, elm) => {
            const j_elm = $(elm);
            // このボタンを出すときに指定されていたパラメータをオブジェクトに復元
            const _pm = JSON.parse(j_elm.attr("data-event-pm"));
            // アニメーションが必要か
            const need_animate =
                _pm.show_time !== undefined &&
                parseInt(_pm.show_time) >= 10 &&
                (_pm.show_keyframe !== "none" || _pm.show_effect !== "none");
            if (need_animate) {
                animation_target_count += 1;
            }
            // Elementのプロパティに情報を格納 すぐあとで使う
            elm.__pm = _pm;
            elm.__need_animate = need_animate;
        });

        //
        // 表示アニメーションが必要ない場合はここでラッパーをフリーレイヤにぶち込んで終わり
        //

        if (animation_target_count === 0 || this.kag.stat.is_skip) {
            j_glink_collection.setStyle("visibility", "visible");
            j_wrapper.appendTo(j_layer);
            return;
        }

        //
        // 表示アニメーションが必要な場合
        //

        // アニメーション中はラッパー自体をクリック不可にする
        j_wrapper.setStyleMap({ "pointer-events": "none" });

        // アニメーション完了要素カウンタ
        let showed_counter = 0;

        j_glink_collection.each((i, elm) => {
            const j_elm = $(elm);
            if (!elm.__need_animate) {
                j_elm.setStyle("visibility", "visible");
                return;
            }
            const _pm = elm.__pm;
            const timeout = parseInt(_pm.show_delay) * i;
            $.setTimeout(() => {
                j_elm.setStyle("visibility", "visible");
                if (_pm.show_keyframe && _pm.show_keyframe !== "none") {
                    //
                    // ティラノタグで定義したキーフレームアニメーションを使う場合
                    //

                    j_elm.animateWithTyranoKeyframes({
                        keyframe: _pm.show_keyframe,
                        time: _pm.show_time,
                        easing: _pm.show_easing,
                        delay: "0",
                        count: "1",
                        mode: "",
                        onend: (anim) => {
                            anim.cancel();
                            showed_counter += 1;
                            if (showed_counter === animation_target_count) {
                                j_wrapper.setStyleMap({ "pointer-events": "auto" });
                            }
                        },
                    });
                } else {
                    //
                    // animate.css のプリセットを使う場合
                    //

                    j_elm.setStyle("animation-fill-mode", "forwards");
                    if (_pm.show_time) j_elm.setStyle("animation-duration", $.convertDuration(glink_config.show_time));
                    if (_pm.show_easing) j_elm.setStyle("animation-timing-function", glink_config.show_easing);
                    j_elm.on("animationend", (e) => {
                        if (j_elm.get(0) === e.target) {
                            j_elm.off("animationend");
                            j_elm.removeClass(_pm.show_effect);
                            j_elm.setStyleMap({
                                "animation-fill-mode": "",
                                "animation-duration": "",
                                "animation-timing-function": "",
                            });
                            showed_counter += 1;
                            if (showed_counter === animation_target_count) {
                                j_wrapper.setStyleMap({ "pointer-events": "auto" });
                            }
                        }
                    });
                    j_elm.addClass(glink_config.show_effect);
                }
            }, timeout);
        });
        j_wrapper.appendTo(j_layer);
    },

    /**
     * [glink]の自動配置をおこなう際の領域（flexなラッパーに設定するleft, top, width, height）を計算する
     * @param {Object} glink_config
     * @returns {Object}
     */
    calcFlexPosition: function (glink_config) {
        const j_message_layer = this.kag.layer.getLayer(this.kag.stat.current_layer, this.kag.stat.current_page);
        if (j_message_layer.css("display") === "none") {
            return {
                left: "0",
                top: "0",
                width: "100%",
                height: "100%",
            };
        }
        const j_message_outer = j_message_layer.find(".message_outer");
        const gh = this.kag.tmp.screen_info.original_height;
        const gh_half = gh / 2;
        const top = parseInt(j_message_outer.css("top")) || 0;
        const height = parseInt(j_message_outer.css("height")) || gh;
        const bottom = top + height;

        // メッセージウィンドウの縦幅が画面の8割以上を占めているなら画面全体を基準にしたほうがいいだろう
        const blank_rate = height / gh;
        if (blank_rate > 0.8) {
            return {
                left: "0",
                top: "0",
                width: "100%",
                height: "100%",
            };
        }
        const blank_upper = top; // メッセージウィンドウの上側余白
        const blank_lower = gh - bottom; // メッセージウィンドウの下側余白
        if (blank_upper > blank_lower) {
            // 上のほうがスペースが空いている場合
            return {
                left: "0",
                top: "0",
                width: "100%",
                height: `${top}px`,
            };
        } else {
            // 下のほうがスペースが空いている場合
            return {
                left: "0",
                top: `${bottom}px`,
                width: "100%",
                height: `${gh - bottom}px`,
            };
        }
    },
};

//使用禁止
//処理停止、事前準備
tyrano.plugin.kag.tag._s = {
    vital: [],

    pm: {},

    start: function (pm) {
        //現在のIndexを指定する。保存時に戻る場所だ
        this.kag.stat.strong_stop_recover_index = this.kag.ftag.current_order_index;
        this.kag.ftag.nextOrder();
    },
};

/*
#[wait]

:group
システム操作

:title
ウェイト

:exp
ウェイトを入れます。`time`属性で指定した時間、操作できなくなります。

:sample
2秒待つよ……

;2000ミリ秒（2秒）処理を停止します
[wait time=2000]

2秒待ったよ[p]

:param
time = ウェイトをミリ秒で指定します。

#[end]
*/

//ウェイト
tyrano.plugin.kag.tag.wait = {
    vital: ["time"],

    pm: {
        time: 0,
    },

    start: function (pm) {
        var that = this;

        //クリック無効
        this.kag.weaklyStop();
        this.kag.stronglyStop();
        this.kag.stat.is_wait = true;

        that.kag.tmp.wait_id = setTimeout(function () {
            that.kag.cancelStrongStop();
            that.kag.cancelWeakStop();
            that.kag.stat.is_wait = false;
            that.kag.ftag.nextOrder();
        }, pm.time);
    },
};

/*
#[wait_cancel]

:group
システム操作

:title
ウェイトのキャンセル

:exp
`[wait]`タグによるウェイト状態をキャンセルできます。

これは`[wait]`中にボタンクリックなどで無理やりシナリオジャンプしたときにジャンプ先でウェイトをキャンセルする、といった使い方をします。

:param

:demo
2,kaisetsu/08_wait_cancel

#[end]
*/

//ウェイト
tyrano.plugin.kag.tag.wait_cancel = {
    vital: [],

    pm: {},

    start: function (pm) {
        var that = this;

        //[wait]キャンセル
        clearTimeout(this.kag.tmp.wait_id);
        this.kag.tmp.wait_id = "";
        this.kag.cancelStrongStop();
        this.kag.stat.is_wait = false;
        this.kag.cancelWeakStop();

        this.kag.ftag.nextOrder();
    },
};

/*
#[hidemessage]

:group
メッセージ関連の設定

:title
メッセージレイヤの一時的な非表示

:exp
メッセージレイヤを一時的に隠してクリックを待ちます。テキストは消去されません。メニューから「メッセージを消す」を選んだのと同じ動作を行います。

クリックされると再びメッセージレイヤが表示されます。

:sample

:param

#[end]
*/

tyrano.plugin.kag.tag.hidemessage = {
    start: function () {
        this.kag.stat.is_hide_message = true;
        // メッセージレイヤを隠す
        this.kag.layer.hideMessageLayers();
        // 次にクリックしたときにメッセージウィンドウを復活させる処理を割り込ませたいため
        // クリックできるようにイベントレイヤを表示しておく必要あり
        this.kag.layer.showEventLayer("hidemessage");
    },
};

/*
#[quake]

:group
演出・効果・動画

:title
画面を揺らす

:exp
指定したミリ秒だけ、画面を揺らします。
`vmax`属性を`0`に設定すると横揺れに、`hmax`属性を`0`に設定すると縦揺れになります。

:sample
[quake count=5 time=300 hmax=20]

:param
count  = 揺らす回数を指定します。,
wait   = 揺れの終了を待つかどうか。`true`または`false`で指定します。,
time   = １回揺れるのにかかる時間をミリ秒で指定します。,
hmax   = 揺れの横方向への最大振幅を指定します。,
vmax   = 揺れの縦方向への最大振幅を指定します。

:demo
1,kaisetsu/12_anim

#[end]
*/

//画面を揺らします
tyrano.plugin.kag.tag.quake = {
    vital: ["time"],

    pm: {
        count: 5,
        time: 300,
        timemode: "",
        hmax: "0",
        vmax: "10",
        wait: "true",
    },

    start: function (pm) {
        var that = this;

        if (pm.hmax != "0") {
            $("." + this.kag.define.BASE_DIV_NAME).effect(
                "shake",
                {
                    times: parseInt(pm.count),
                    distance: parseInt(pm.hmax),
                    direction: "left",
                },
                parseInt(pm.time),
                function () {
                    if (pm.wait == "true") {
                        that.kag.ftag.nextOrder();
                    }
                },
            );
        } else if (pm.vmax != "0") {
            $("." + this.kag.define.BASE_DIV_NAME).effect(
                "shake",
                {
                    times: parseInt(pm.count),
                    distance: parseInt(pm.vmax),
                    direction: "up",
                },
                parseInt(pm.time),
                function () {
                    if (pm.wait == "true") {
                        that.kag.ftag.nextOrder();
                    }
                },
            );
        }

        if (pm.wait == "false") {
            that.kag.ftag.nextOrder();
        }
    },
};

/*
#[quake2]

:group
演出・効果・動画

:title
画面を揺らす

:exp
指定したミリ秒だけ画面を揺らします。

:sample
画面を揺らすよ。[l][s]

[quake2 time="1000"]

[cm]揺れたね。[p]

[quake2 time="1000" wait="false"]

揺らしたまま次のタグに進むよ。[p]

[quake2 time="3000" wait="false"]

揺らしたまま次のタグに進んで、揺れの完了を待つよ…[wa]終わったよ。[p]

:param
time     = 揺れ全体の時間をミリ秒で指定します。,
hmax     = 揺れの横方向への最大振幅を指定します。,
vmax     = 揺れの縦方向への最大振幅を指定します。,
wait     = 揺れの終了を待つかどうか。`true`または`false`で指定します。,
copybase = `true`を指定した場合、画面が揺れている間、ベースレイヤの背景のコピーが最後面に固定されます。これによって、たとえば画面が上に揺れた瞬間に下側にできる隙間から黒色がのぞくことがなくなります。,

#[end]
*/

//画面を揺らします
tyrano.plugin.kag.tag.quake2 = {
    pm: {
        time: "1000",
        hmax: "0",
        vmax: "200",
        wait: "true",
        copybase: "true",
        skippable: "true",
    },
    start: function (pm) {
        // 前回の揺れが残っているなら終わらせる
        if (this.kag.tmp.quake2_finish) this.kag.tmp.quake2_finish();
        // スキップ中でこの揺れがスキップ可能なら無視
        if (this.kag.stat.is_skip && pm.skippable === "true") return this.kag.ftag.nextOrder();

        const duration = parseInt(pm.time);
        const j_quake = $("#root_layer_game, #root_layer_system");

        // ベースレイヤのコピー
        const do_copy = pm.copybase === "true";
        let j_base_clone;
        if (do_copy) {
            j_base_clone = $(".base_fore").clone();
            j_base_clone.attr("class", "temp-element quake2-element");
            $("#tyrano_base").prepend(j_base_clone);
        }

        const vmax = parseInt(pm.vmax);
        const hmax = parseInt(pm.hmax);
        const is_wait = pm.wait !== "false";
        let sign = 1;
        const ignore_rate = Math.max(1, Math.ceil(refreshRate / 60));
        let current_frame = 0;
        const end_frame = ((duration / (1000 / 60)) * ignore_rate) | 0;
        this.kag.pushAnimStack();

        // 揺れを終わらせる
        this.kag.tmp.quake2_finish = () => {
            this.kag.tmp.quake2_finish = false;
            cancelAnimationFrame(this.kag.tmp.quake2_timer_id);
            j_quake.setStyle("transform", "");
            this.kag.popAnimStack();
            if (do_copy) j_base_clone.remove();
            if (is_wait) this.kag.ftag.nextOrder();
        };

        // アニメーションループ
        const loop = () => {
            if (current_frame < end_frame) {
                if (current_frame % ignore_rate === 0) {
                    sign *= -1;
                    let v = 0;
                    let h = 0;
                    if (vmax > 0) {
                        v = sign * $.easing.easeOutQuad(null, current_frame, vmax, -vmax, end_frame);
                    }
                    if (hmax > 0) {
                        h = sign * $.easing.easeOutQuad(null, current_frame, hmax, -hmax, end_frame);
                    }
                    const css = `translate(${h}px, ${v}px)`;
                    j_quake.setStyle("transform", css);
                    j_quake.setStyle("background", "red");
                }
                current_frame++;
                this.kag.tmp.quake2_timer_id = requestAnimationFrame(loop);
            } else {
                if (this.kag.tmp.quake2_finish) this.kag.tmp.quake2_finish();
            }
        };

        // ロードしたときにこの揺れを終わらせる
        this.kag.overwrite("load-start.quake2", () => {
            if (this.kag.tmp.quake2_finish) this.kag.tmp.quake2_finish();
        });

        // スキップを開始したときにこの揺れを終わらせる
        this.kag.overwrite("skip-start.quake2", () => {
            if (this.kag.tmp.quake2_finish) this.kag.tmp.quake2_finish();
        });

        // アニメーションを開始
        this.kag.tmp.quake2_timer_id = requestAnimationFrame(loop);

        if (!is_wait) this.kag.ftag.nextOrder();
    },
};

/*
#[vibrate]

:group
演出・効果・動画

:title
スマホ・パッドの振動

:exp
プレイヤーが使用しているモバイル端末やゲームパッドを振動させることができます。

指定した振動時間が長すぎると振動しなくなることがありますので注意してください。環境にもよりますが、目安として振動時間は5000ミリ秒以下に抑えるとよいでしょう。

:sample
[vibrate time=1000 power=100]
1秒振動[p]

[vibrate time="800,200" power="50" count="3"]
パターン振動を3回繰り返し[p]

[vibrate time="5000" power="50" count="3"]
途中で振動停止…
[wait time="1000"]
[vibrate_stop]
停止させました。[p]

:param
time  = 振動させる時間(ミリ秒)。`600,200,1000,200,600`のようにカンマ区切りで複数の数値を指定すると、600ミリ秒振動→200ミリ秒静止→1000ミリ秒静止→…というパターンを指定することができます。,
power = 振動させる強さ(0～100)。ゲームパッドを振動させるときのみ有効なパラメータです。,
count = 振動を繰り返す回数。,

#[end]
*/

tyrano.plugin.kag.tag.vibrate = {
    pm: {
        time: "500",
        power: "100",
        count: "",
    },
    start: function (pm) {
        let time;
        const duration = parseInt(pm.time);
        const power = parseInt(pm.power) / 100;
        if (pm.time.includes(",")) {
            time = pm.time.split(",").map((item) => {
                return parseInt(item);
            });
        } else {
            time = duration;
        }
        if (pm.count) {
            let new_time = [];
            if (typeof time === "number") {
                const count = (parseInt(pm.count) || 1) * 2 - 1;
                for (let i = 0; i < count; i++) {
                    new_time.push(time);
                }
            } else {
                const count = parseInt(pm.count) || 1;
                for (let i = 0; i < count; i++) {
                    new_time = new_time.concat(time.concat());
                }
            }
            time = new_time;
        }
        try {
            if (this.kag.key_mouse.gamepad.last_used_next_gamepad_index > -1) {
                this.kag.key_mouse.gamepad.vibrate({ duration: time, power });
            } else {
                navigator.vibrate(time);
            }
        } catch (e) {
            console.log(e);
        }
        this.kag.ftag.nextOrder();
    },
};

/*
#[vibrate_stop]

:group
演出・効果・動画

:title
スマホ・パッドの振動停止

:exp
`[vibrate]`で開始したモバイル端末やゲームパッドの振動を途中で停止することができます。

#[end]
*/

tyrano.plugin.kag.tag.vibrate_stop = {
    start: function (pm) {
        this.kag.key_mouse.gamepad.vibrate({ duration: 0, power: 0 });
        navigator.vibrate(0);
        this.kag.ftag.nextOrder();
    },
};

/*
#[font]

:group
メッセージ関連の設定

:title
テキストスタイルの変更

:exp
テキストのスタイルを変更します。スタイルはメッセージレイヤごとに個別に設定できます。

いずれのパラメータについても、省略すると変更を行いません。また`default`と指定した場合はデフォルトの値（`Config.tjs`内あるいは`[deffont]`タグで指定した値）に戻ります。

このタグで変更したスタイルは、`[resetfont]``[ct]``[cm]``[er]`などのタグが実行されたタイミングでデフォルトの値に戻ります。デフォルトの値自体を変更したい場合は、`Config.tjs`を編集するか、`[deffont]`タグを使用します。

:sample
[font size=40 bold=true]
この文字は大きく、そして太字で表示されます。
[resetfont]
もとの大きさに戻りました。

:param
size         = 文字サイズを指定します,
color        = 文字色を`0xRRGGBB`形式で指定します。,
bold         = 太字にするかどうか。`true`または`false`で指定します。,
italic       = イタリック体にするかどうか。`true`または`false`で指定します。,
face         = フォントの種類を指定します。Webフォントを使用する場合は`tyrano/css/font.css`に定義を記述してください。,
edge         = 文字の縁取りを有効にできます。縁取り色を`0xRRGGBB`形式等で指定します。縁取りを解除する場合は`none`と指定します。<br>V515以降：縁取りの太さもあわせて指定できます。`4px 0xFF0000`のように、色の前に縁取りの太さをpx付きで記述します。太さと色は半角スペースで区切ってください。さらに`4px 0xFF0000, 2px 0xFFFFFF`のようにカンマ区切りで複数の縁取りを指定できます。,
edge_method  = 縁取りの実装方式を選択できます。指定できるキーワードは`shadow`または`filter`。,
shadow       = 文字に影をつけます。影の色を`0xRRGGBB`形式で指定します。影を解除する場合は`none`と指定します。,
effect       = フォントの表示演出にアニメーションを設定できます。`none`を指定すると無効。指定できるキーワードは以下のとおり。`fadeIn``fadeInDown``fadeInLeft``fadeInRight``fadeInUp``rotateIn``zoomIn``slideIn``bounceIn``vanishIn``puffIn``rollIn``none`,
effect_speed = `effect`パラメータが`none`以外の場合に、表示されるまでの時間を指定します。デフォルトは`0.2s`です。`s`は秒を表します。,
gradient     = V515以降：文字にグラデーションを適用することができます。CSSグラデーション形式で指定します。CSSグラデーションとは、たとえば`linear-gradient(45deg, red 0%, yellow 100%)`のような形式です。<br>CSSグラデーションを簡単に作れるサイトがWeb上にいくつか存在しますので、「CSS グラデーション ジェネレーター」で検索してみてください。,


:demo
1,kaisetsu/02_decotext

#[end]
*/

tyrano.plugin.kag.tag.font = {
    pm: {},

    log_join: "true",

    start: function (pm) {
        this.kag.setMessageCurrentSpan();

        var new_font = {};

        if (pm.size) {
            this.kag.stat.font.size = pm.size;
        }

        if (pm.color) {
            this.kag.stat.font.color = $.convertColor(pm.color);
        }

        if (pm.gradient) {
            this.kag.stat.font.gradient = pm.gradient;
        }

        if (pm.bold) {
            this.kag.stat.font.bold = $.convertBold(pm.bold);
        }

        if (pm.face) {
            this.kag.stat.font.face = pm.face;
        }

        if (pm.italic) {
            this.kag.stat.font["italic"] = $.convertItalic(pm.italic);
        }

        if (pm.effect) {
            if (pm.effect == "none") {
                this.kag.stat.font["effect"] = "";
            } else {
                this.kag.stat.font["effect"] = pm.effect;
            }
        }

        if (pm.effect_speed) {
            this.kag.stat.font["effect_speed"] = pm.effect_speed;
        }

        if (pm.edge) {
            if (pm.edge == "none" || pm.edge == "") {
                this.kag.stat.font.edge = "";
            } else {
                this.kag.stat.font.edge = $.convertColor(pm.edge);
            }
        }

        if (pm.edge_method) {
            this.kag.stat.font.edge_method = pm.edge_method;
        }

        if (pm.shadow) {
            if (pm.shadow == "none" || pm.shadow == "") {
                this.kag.stat.font.shadow = "";
            } else {
                this.kag.stat.font.shadow = $.convertColor(pm.shadow);
            }
        }

        this.kag.ftag.nextOrder();
        ///////////////////
    },
};

/*
#[deffont]

:group
メッセージ関連の設定

:title
デフォルトのテキストスタイル設定

:exp
現在操作対象のメッセージレイヤに対する、デフォルトのテキストスタイルを指定します。

ここで指定したスタイルは`[resetfont]`タグを通過したときに反映されます。つまり、`[deffont]`タグを使用しただけでは実際のスタイルは変更されません。

:sample

:param
size         = 文字サイズを指定します,
color        = 文字色を`0xRRGGBB`形式で指定します。,
bold         = 太字にするかどうか。`true`または`false`で指定します。,
italic       = イタリック体にするかどうか。`true`または`false`で指定します。,
face         = フォントの種類を指定します。Webフォントも利用可能。Webフォントを使用する場合、フォントファイルを`data/others`フォルダに配置し、`tyrano.css`で`@font-face`を設定する必要があります。,
edge         = 文字の縁取りを有効にできます。縁取り色を`0xRRGGBB`形式等で指定します。縁取りを解除する場合は`none`と指定します。<br>V515以降：縁取りの太さもあわせて指定できます。`4px 0xFF0000`のように、色の前に縁取りの太さをpx付きで記述します。太さと色は半角スペースで区切ってください。さらに`4px 0xFF0000, 2px 0xFFFFFF`のようにカンマ区切りで複数の縁取りを指定できます。,
edge_method  = 縁取りの実装方式を選択できます。指定できるキーワードは`shadow`または`filter`。,
shadow       = 文字に影をつけます。影の色を`0xRRGGBB`形式で指定します。影を解除する場合は`none`と指定します。,
effect       = フォントの表示演出にアニメーションを設定できます。`none`を指定すると無効。指定できるキーワードは以下。`fadeIn``fadeInDown``fadeInLeft``fadeInRight``fadeInUp``rotateIn``zoomIn``slideIn``bounceIn``vanishIn``puffIn``rollIn``none`,
effect_speed = `effect`パラメータが`none`以外の場合に、表示されるまでの時間を指定します。デフォルトは`0.2s`です。`s`は秒を表します。,
gradient     = V515以降：文字にグラデーションを適用することができます。CSSのグラデーション関数を指定します。グラデーション関数とは`linear-gradient(45deg, red 0%, yellow 100%)`のような文字列です。<br>グラデーション関数を簡単に作れるサイトがWeb上にいくつか存在しますので、「CSS グラデーション ジェネレーター」で検索してみてください。

:demo
1,kaisetsu/22_font

#[end]
*/

//デフォルトフォント設定
tyrano.plugin.kag.tag.deffont = {
    pm: {},

    start: function (pm) {
        var new_font = {};

        if (pm.size) {
            this.kag.stat.default_font.size = pm.size;
        }

        if (pm.color) {
            this.kag.stat.default_font.color = $.convertColor(pm.color);
        }

        if (pm.gradient) {
            this.kag.stat.default_font.gradient = pm.gradient;
        }

        if (pm.bold) {
            this.kag.stat.default_font.bold = $.convertBold(pm.bold);
        }

        if (pm.face) {
            this.kag.stat.default_font.face = pm.face;
        }

        if (pm.italic) {
            this.kag.stat.default_font.italic = $.convertItalic(pm.italic);
        }

        if (pm.effect) {
            if (pm.effect == "none") {
                this.kag.stat.default_font["effect"] = "";
            } else {
                this.kag.stat.default_font["effect"] = pm.effect;
            }
        }

        if (pm.effect_speed) {
            this.kag.stat.default_font["effect_speed"] = pm.effect_speed;
        }

        if (pm.edge) {
            if (pm.edge == "none" || pm.edge == "") {
                this.kag.stat.default_font.edge = "";
            } else {
                this.kag.stat.default_font.edge = $.convertColor(pm.edge);
            }
        }

        if (pm.edge_method) {
            this.kag.stat.default_font.edge_method = pm.edge_method;
        }

        if (pm.shadow) {
            if (pm.shadow == "none" || pm.shadow == "") {
                this.kag.stat.default_font.shadow = "";
            } else {
                this.kag.stat.default_font.shadow = $.convertColor(pm.shadow);
            }
        }

        this.kag.ftag.nextOrder();
        ///////////////////
    },
};

/*
#[message_config]

:group
メッセージ関連の設定

:title
メッセージコンフィグ

:exp
ティラノスクリプトV515以降。
メッセージに関連する詳細な設定を行えます。
省略した属性の設定は変更されません。

:param
ch_speed_in_click     = 文字表示の途中でクリックされたあとの文字表示速度。1文字あたりの表示時間をミリ秒で指定します。<br>`default`と指定した場合はクリック前の文字表示速度を引き継ぐようになります。,
effect_speed_in_click = 文字表示の途中でクリックされたあとの文字エフェクト速度。`0.2s`、`200ms`、あるいは単に`200`などで指定します。例はいずれも200ミリ秒となります。<br>`default`と指定した場合はクリック前の文字表示速度を引き継ぐようになります。,
edge_overlap_text     = 縁取りテキストの縁をひとつ前の文字に重ねるかどうか。`true`または`false`で指定します。現状は`edge_method`が`stroke`の場合にのみ有効なパラメータです。,
speech_bracket_float  = キャラのセリフの最初のカギカッコを左側に浮かして、開始カギカッコの下に文字が周りこまないようにするための設定です。`true`を指定すると、開始カギカッコだけが左側にずれます。`false`で無効。`true`のかわりに`20`のような数値を指定することで、開始カギカッコを左側にずらす量を直接指定できます。,
speech_margin_left    = `speech_bracket_float`が有効のときに、さらにテキスト全体を右側に動かすことができます。`true`で有効、`false`で無効。`20`のように数値で直接指定することで全体を右側にずらす量を直接指定できます。,
kerning               = 字詰めを有効にするか。`true`または`false`で指定します。フォント、もともとの字間設定、プレイヤーの使用ブラウザによっては効果が見られないこともあります。（高度な知識：CSSのfont-feature-settingsプロパティを設定する機能です）,
add_word_nobreak      = ワードブレイク(単語の途中で自然改行される現象)を禁止する単語を追加できます。カンマ区切りで複数指定可能。,
remove_word_nobreak   = 一度追加したワードブレイク禁止単語を除外できます。カンマ区切りで複数指定可能。,
line_spacing          = 行間のサイズをpx単位で指定できます。,
letter_spacing        = 字間のサイズをpx単位で指定できます。,
control_line_break    = 禁則処理を手動で行なうかどうかを`true`または`false`で指定します。`。`や`、`などの特定の文字が行頭に来ていたとき、そのひとつ前の文字で改行するようにします。基本的にはこれを指定しなくても自動で禁則処理が行われますが、フォントの設定（エフェクトや縁取りなど）によっては禁則処理が自動で行われなくなることがあるので、その場合はこのパラメータに`true`を指定してみてください。,
control_line_break_chars = 行頭に来ていたときに禁則処理を行なう文字をまとめて指定します。デフォルトでは`、。）」』】,.)]`が禁則処理の対象です。,

:sample
;クリックされても文字表示速度を変更しない
[message_config ch_speed_in_click="default" effect_speed_in_click="default"]

;クリックされたら残りを瞬間表示
[message_config ch_speed_in_click="0" effect_speed_in_click="0ms"]

;セリフの先頭のカギカッコだけを左側にずらして、カギカッコの下に文章が回り込まないようにする
[message_config speech_bracket_float="true"]

;"――"はワードブレイクされてほしくない
[message_config add_word_nobreak="――"]

;行間も字間もめちゃくちゃ広げてみる
[message_config line_spacing="50" letter_spacing="30"]

;ダッシュの字間を詰めてみる
@macro name="――"
  [message_config letter_spacing="-4"]―[message_config letter_spacing="0"]―
@endmacro
――力が欲しいか？[l][r]
[――]力が欲しいか？[l][r]

#[end]
*/
tyrano.plugin.kag.tag.message_config = {
    pm: {},

    start: function (pm) {
        // span.current_span を新しくする
        this.kag.setMessageCurrentSpan();

        // デフォルトのコンフィグ
        const default_message_config = this.kag.ftag.master_tag.text.default_message_config || {};

        // stat.message_configを必要であれば初期化してその参照を取得
        if (!this.kag.stat.message_config) {
            this.kag.stat.message_config = {};
        }
        const message_config = this.kag.stat.message_config;

        // pmが持つプロパティのうち記憶対象のものだけstatに移す
        // デフォルトのコンフィグに存在するプロパティが記憶対象
        for (const key in default_message_config) {
            if (key in pm) {
                message_config[key] = pm[key];
            }
        }

        // ワードブレイク禁止単語リストを必要であれば初期化してその参照を取得
        if (!this.kag.stat.word_nobreak_list) {
            this.kag.stat.word_nobreak_list = [];
        }
        const list = this.kag.stat.word_nobreak_list;

        // ワードブレイク禁止単語を追加していく
        if ($.isNonEmptyStr(pm.add_word_nobreak)) {
            pm.add_word_nobreak.split(",").forEach((word) => {
                const word_trimed = $.trim(word);
                if (!list.includes(word_trimed)) {
                    list.push(word_trimed);
                }
            });
        }

        // ワードブレイク禁止単語を除外していく
        if ($.isNonEmptyStr(pm.remove_word_nobreak)) {
            let filterd_list = list;
            pm.remove_word_nobreak.split(",").forEach((word) => {
                const word_trimed = $.trim(word);
                // filter メソッドで新しい配列を生成して変数を更新していく
                filterd_list = filterd_list.filter((item) => item !== word_trimed);
            });
            // 最後に変数をもとの参照に放り込む
            this.kag.stat.word_nobreak_list = filterd_list;
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[delay]

:group
メッセージ関連の設定

:title
文字の表示速度の設定

:exp
文字の表示速度を指定します。
文字表示をノーウェイトにするには`[nowait]`タグを使うこともできます。

:sample

:param
speed = <p>文字の表示速度を指定します。小さいほど早くなります。</p><p>ここで指定した値は、次の1文字を表示するまでの時間（ミリ秒）として解釈されます。たとえば`1000`と指定すると1秒ごとに1文字ずつ表示されます。</p>

:demo
1,kaisetsu/02_decotext

#[end]
*/

//文字の表示速度変更
tyrano.plugin.kag.tag.delay = {
    pm: {
        speed: "",
    },

    log_join: "true",

    start: function (pm) {
        if (pm.speed != "") {
            this.kag.stat.ch_speed = parseInt(pm.speed);
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[resetdelay]

:group
メッセージ関連の設定

:title
文字の表示速度をデフォルトに戻す

:exp
文字の表示速度をデフォルト速度に戻します。

:sample

:param

#[end]
*/

//文字の表示速度変更
tyrano.plugin.kag.tag.resetdelay = {
    pm: {
        speed: "",
    },

    log_join: "true",

    start: function (pm) {
        this.kag.stat.ch_speed = "";
        this.kag.ftag.nextOrder();
    },
};

/*
#[configdelay]

:group
メッセージ関連の設定

:title
デフォルトの文字の表示速度の設定

:exp
デフォルトの文字の表示速度を指定します。
つまり、`[resetdelay]`タグを使用したときにこの速度に戻るようになります。
コンフィグ画面などでゲーム全体の文字速度を変更したい場合にこのタグを使います。

<b>★注意</b>
あくまで演出のために一時的に文字速度を変更したいだけの場合には、`[configdelay]`タグではなく`[delay]`タグを使用します。

:sample

:param
speed = <p>文字の表示速度を指定します。小さいほど早くなります。</p><p>ここで指定した値は、次の1文字を表示するまでの時間（ミリ秒単位）として解釈されます。たとえば`1000`と指定すると1秒ごとに1文字表示されていきます。</p>

#[end]
*/

//文字の表示速度変更
tyrano.plugin.kag.tag.configdelay = {
    pm: {
        speed: "",
    },

    start: function (pm) {
        if (pm.speed != "") {
            this.kag.stat.ch_speed = "";
            this.kag.config.chSpeed = pm.speed;
            this.kag.ftag.startTag("eval", {
                exp: "sf._config_ch_speed = " + pm.speed,
            });
        } else {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[nowait]

:group
メッセージ関連の設定

:title
テキスト瞬間表示モードの開始

:exp
テキスト瞬間表示モードを開始します。このモード中は、テキスト全体が一瞬で表示されます。文字が1文字ずつ追加されていく処理（通常の処理）は行われません。

通常のモードに戻すには`[endnowait]`タグを使います。

#[end]
*/

tyrano.plugin.kag.tag.nowait = {
    pm: {},

    start: function (pm) {
        this.kag.stat.is_nowait = true;

        this.kag.ftag.nextOrder();
    },
};

/*
#[endnowait]

:group
メッセージ関連の設定

:title
テキスト瞬間表示モードの停止

:exp
`[nowait]`によるテキスト瞬間表示モードを停止します。
テキストの表示速度は`[nowait]`タグを指定する前の状態に戻ります。

#[end]
*/

tyrano.plugin.kag.tag.endnowait = {
    pm: {},

    start: function (pm) {
        this.kag.stat.is_nowait = false;

        this.kag.ftag.nextOrder();
    },
};

/*
#[resetfont]

:group
メッセージ関連の設定

:title
テキストスタイルのリセット

:exp
テキストスタイルをもとに戻します。すなわち`[deffont]`で指定されたスタイルにリセットされます。

`[font]`タグで一時的（部分的）にテキストスタイルを変更したあと、`[resetfont]`でもとに戻す、というふうに活用できます。

テキストスタイルは、メッセージレイヤごとに個別に設定できます。

:sample
[deffont size=30]
デフォルトの文字サイズ[p]

[font size=55 bold=true]
うおおおおおおおおおお！！！[p]

[resetfont]
い、いきなりなんだよ！
[font size=20]（びっくりした…）[p]

[resetfont]

:param

#[end]
*/

tyrano.plugin.kag.tag.resetfont = {
    log_join: "true",

    pm: {
        next: "true",
    },

    start: function (pm) {
        this.kag.setMessageCurrentSpan();
        this.kag.stat.font = $.extend(true, {}, this.kag.stat.default_font);
        if (pm.next !== "false") this.kag.ftag.nextOrder();
    },
};

/*
#[layopt]

:group
画像・背景・レイヤ操作

:title
レイヤの属性設定

:exp
レイヤの属性を指定します。

:sample
;メッセージレイヤを消去
@layopt layer=message0 visible=false
[backlay]
[image layer=0 page=back visible=true top=100 left=50  storage = miku1.png]
[trans time=2000]
@wt
;そしてレイヤ表示
@layopt layer=message0 visible=true

:param
layer   = 対象となる前景レイヤまたはメッセージレイヤを指定します。`message`とのみ指定した場合は、`[current]`タグで指定した現在の操作対象のメッセージレイヤが対象となります。,
page    = 対象レイヤの表ページと裏ページのどちらを対象とするか。`fore`か`back`で指定します。ただし`layer`属性に`message`とのみ指定し、さらにこの属性を省略した場合には、現在操作対象のページが選択されます。,
visible = `layer`属性で指定したレイヤを表示するかどうか。`true`を指定するとレイヤは表示状態に、`false`を指定すると非表示状態になります。省略すると、表示状態は変更されません。,
left    = `layer`属性で指定したレイヤの左端位置を指定します。省略すると位置は変更されません。（メッセージウィンドウの位置やデザインを調整したい場合はこのタグの代わりに`[position]`タグを使用します）,
top     = `layer`属性で指定したレイヤの上端位置を指定します。省略すると位置は変更されません。（メッセージウィンドウの位置やデザインを調整したい場合はこのタグの代わりに`[position]`タグを使用します）,
opacity = レイヤの不透明度を`0`～`255`の範囲で指定します。`0`で完全に透明、`255`で完全に不透明。

:demo
1,kaisetsu/18_window_2

#[end]
*/


//レイヤーオプション変更
tyrano.plugin.kag.tag.layopt = {
    vital: ["layer"],

    pm: {
        layer: "",
        page: "fore",
        visible: "",
        left: "",
        top: "",
        opacity: "",
        autohide: false,
        index: 10,
    },

    start: function (pm) {
        var that = this;

        if (pm.layer == "message") {
            pm.layer = this.kag.stat.current_layer;
            pm.page = this.kag.stat.current_page;
        }

        var j_layer = this.kag.layer.getLayer(pm.layer, pm.page);

        if (pm.layer == "fix" || pm.layer == "fixlayer") {
            j_layer = $("#tyrano_base").find(".fixlayer");
        }

        //表示部分の変更
        if (pm.visible != "") {
            if (pm.visible == "true") {
                //バックの場合は、その場では表示してはダメ
                if (pm.page == "fore") {
                    j_layer.css("display", "");
                }

                j_layer.attr("l_visible", "true");
            } else {
                j_layer.css("display", "none");
                j_layer.attr("l_visible", "false");
            }
        }

        //レイヤのポジション指定

        if (pm.left != "") {
            j_layer.css("left", parseInt(pm.left));
        }

        if (pm.top != "") {
            j_layer.css("top", parseInt(pm.top));
        }

        if (pm.opacity != "") {
            j_layer.css("opacity", $.convertOpacity(pm.opacity));
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[ruby]

:group
メッセージ・テキスト

:title
ルビを振る

:exp
次の一文字に対するルビを指定します。
ルビを表示させたい場合は毎回指定する必要があります。
複数の文字にルビを振る場合は、一文字毎にルビを指定する必要があります。

:sample
[ruby text="かん"]漢[ruby text="じ"]字

:param
text = ルビとして表示させる文字を指定します。

:demo
1,kaisetsu/02_decotext

#[end]
*/

//ルビ指定
tyrano.plugin.kag.tag["ruby"] = {
    vital: ["text"],

    pm: {
        text: "",
    },

    log_join: "true",

    start: function (pm) {
        var str = pm.text;

        //ここに文字が入っている場合、ルビを設定してから、テキスト表示する
        this.kag.stat.ruby_str = str;

        this.kag.ftag.nextOrder();
    },
};

/*
#[mark]

:group
メッセージ・テキスト

:title
テキストマーカー

:exp
テキストに蛍光ペンでマーカーを引いたような効果をつけることができます。
色やサイズも指定可能。

:sample
ここはまだです。[mark]ここにマーカーがひかれています。[endmark]ここはひかれません。

[mark color="0xff7f50" size=70]マーカーの色やサイズを指定することもできます。[endmark]

:param
color      = マーカーの色を`0xRRGGBB`形式で指定します。デフォルトは黄色。,
font_color = マーカーを引いたときのフォントの色を`0xRRGGBB`形式で指定します。省略すると、ゲーム中のフォント色を継承します。,
size       = マーカーのサイズを`0`〜`100`で指定します。たとえば`50`だとテキストの下半分にマーカーが引かれます。`10`だとただの下線に近くなります。

:demo

#[end]
*/

//ルビ指定
tyrano.plugin.kag.tag["mark"] = {
    vital: [],

    pm: {
        color: "0xFFFF00",
        font_color: "",
        size: "",
    },

    start: function (pm) {
        var str = pm.text;

        this.kag.stat.mark = 1;

        var style_mark = "margin-right:-1px;";
        style_mark += "background-color:" + $.convertColor(pm.color) + ";";

        if (pm.font_color != "") {
            style_mark += "color:" + $.convertColor(pm.font_color) + ";";
        } else {
            style_mark += "color:" + this.kag.stat.font.color + ";";
        }

        if (pm.size != "") {
            style_mark +=
                "background: linear-gradient(transparent " + (100 - parseInt(pm.size)) + "%, " + $.convertColor(pm.color) + " 0%);";
        }

        style_mark += "padding-top:4px;padding-bottom:4px;";

        this.kag.stat.style_mark = style_mark;

        this.kag.ftag.nextOrder();
    },
};

/*
#[endmark]

:group
メッセージ・テキスト

:title
テキストマーカー終了

:exp
`[mark]`タグで開始したテキストマーカーを終了します。

:sample
ここはまだです。[mark]ここにマーカーがひかれています。[endmark]ここはひかれません。

[mark color="0xff7f50" size=70 ]マーカーの色やサイズを指定することもできます。[endmark]

:param

:demo

#[end]
*/

//ルビ指定
tyrano.plugin.kag.tag["endmark"] = {
    vital: [],

    pm: {},

    start: function (pm) {
        var str = pm.text;

        //ここに文字が入っている場合、ルビを設定してから、テキスト表示する
        if (this.kag.stat.mark == 1) {
            this.kag.stat.mark = 2;
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[locate]

:group
画像・背景・レイヤ操作

:title
表示位置の指定

:exp
グラフィックボタンの表示位置を指定します。
テキストには対応していません。

:sample
[locate x=20 y=100]
[button graphic="oda.png" target=*oda]

[locate x=300 y=100]
[button graphic="toyo.png" target=*toyo]

:param
x = 横方向の位置を指定します。（ピクセル）,
y = 縦方向の位置を指定します。（ピクセル）

#[end]
*/

//グラフィックボタン表示位置調整、テキストはできない
tyrano.plugin.kag.tag.locate = {
    pm: {
        x: null,
        y: null,
    },

    start: function (pm) {
        if (pm.x != null) {
            this.kag.stat.locate.x = pm.x;
        }

        if (pm.y != null) {
            this.kag.stat.locate.y = pm.y;
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[button]

:group
ラベル・ジャンプ操作

:title
グラフィカルボタンの表示

:exp
グラフィカルボタンを表示します。`[link]`タグの画像版となります。

グラフィックボタン表示中は強制的にシナリオ進行が停止しますので、必ずジャンプ先を指定してください。また、ジャンプ後に必ず`[cm]`タグを配置してボタンを消去する必要があります。

グラフィックボタンの表示位置は直前の`[locate]`タグによる指定位置を参照します。ただし、`x``y`属性が指定されている場合はそちらが優先されます。

【通常の選択肢ボタン（`fix=false`）の場合】このボタンでシナリオを飛ぶときは`[jump]`タグでジャンプするときと同様、コールスタックに残りません。つまり、`[return]`タグで戻ってくることはできません。

【固定ボタン（`fix=true`）の場合】`[call]`タグでジャンプするときと同様、コールスタックに残ります。つまり、コール先から`[return]`タグで戻ってくる必要があります。

:sample
[locate x=20 y=100]
[button graphic="oda.png" target=*oda]

[locate x=300 y=100]
[button graphic="toyo.png" target=*toyo]

:param
graphic   = ボタンにする画像を指定します。ファイルは`data/image`フォルダに配置します。,
folder    = 画像が入っているフォルダを指定できます。デフォルトでは前景レイヤ用の画像は`fgimage`フォルダ、背景レイヤ用の画像は`bgimage`フォルダと決まっていますが、これを変更できます。,
storage   = !!jump,
target    = !!jump,
name      = !!,
x         = ボタンの横位置を指定します,
y         = ボタンの縦位置を指定します。,
width     = ボタンの横幅をピクセルで指定できます,
height    = ボタンの高さをピクセルで指定できます,
fix       = <p>固定ボタン（セーブボタンなどの常に表示しておくボタン）にするかどうか。`true`または`false`で指定します。通常の選択肢ボタンは`false`(デフォルト)。選択肢ボタンとは異なり、固定ボタンはそれが表示されている間も画面をクリックしてふつうにシナリオを読み進めることができます。</p><p>`true`を指定すると、`fix`レイヤという特殊なレイヤにボタンが配置されます。fixレイヤに追加した要素を消す場合は`[clearfix]`タグを使います。</p><p>`fix`に`true`を指定した場合は別の`storage`の`target`を指定して、そこにボタンが押されたときの処理を記述する必要があります。</p><p>`fix`に`true`を指定した場合、コールスタックが残ります。コールスタックが消化されるまではボタンが有効にならないのでご注意ください。</p>,
role      = ボタンに特別な機能を割り当てることができます。この場合、`storage`や`target`は無視されます。また、強制的に`fix`属性が`true`になります。指定できるキーワードは以下のとおりです。<br>`save`(セーブ画面を表示)<br>`load`(ロード画面を表示)<br>`title`(タイトル画面に戻る)<br>`menu`(メニュー画面を表示)<br>`window`(メッセージウィンドウの非表示)<br>`skip`(スキップモードを開始)<br>`backlog`（バックログを表示）<br>`fullscreen`(フルスクリーン切り替え)<br>`quicksave`(クイックセーブ実行)<br>`quickload`(クイックロード実行)<br>`auto`(オートモード開始)<br>`sleepgame`(ゲームの状態を保存してジャンプ),
exp       = ボタンがクリックされた時に実行されるJSを指定できます。,
preexp    = タグが実行された時点で、この属性に指定した値が変数`preexp`に格納されます。そしてボタンがクリックされた時に`exp`内で`preexp`という変数が利用できるようになります。,
hint      = マウスカーソルをボタンの上で静止させたときに表示されるツールチップの文字列を指定できます。,
clickse   = ボタンをクリックした時に再生される効果音を設定できます。効果音ファイルは`sound`フォルダに配置してください。,
enterse   = ボタンの上にマウスカーソルが乗った時に再生する効果音を設定できます。効果音ファイルは`sound`フォルダに配置してください,
leavese   = ボタンの上からマウスカーソルが外れた時に再生する効果音を設定できます。効果音ファイルは`sound`フォルダに配置してください。,
activeimg = ボタンの上でマウスボタンを押している間に切り替える画像ファイルを指定できます。ファイルは`image`フォルダに配置してください。,
clickimg  = ボタンをクリックしたあとに切り替える画像ファイルを指定できます。ファイルは`image`フォルダに配置してください。,
enterimg  = ボタンの上にマウスカーソルが乗った時に切り替える画像ファイルを指定できます。ファイルは`image`フォルダに配置してください。,
autoimg   = オートモードが開始されたときに切り替える画像ファイルを指定できます。ファイルは`image`フォルダに配置してください。,
skipimg   = スキップモードが開始されたときに切り替える画像ファイルを指定できます。ファイルは`image`フォルダに配置してください。,
visible   = 最初からボタンを表示するかどうか。`true`で表示、`false`で非表示となります。,
auto_next = `true`または`false`を指定します。これに`false`が指定してあり、かつ`fix=true`の場合、`[return]`で戻ったときに次のタグに進まなくなります。,
savesnap  = `true`または`false`で指定します。`true`にすると、このボタンが押された時点でのセーブスナップを確保します。セーブ画面へ移動する場合はここをtrueにして、保存してからセーブを実行します。,
keyfocus  = `false`を指定すると、キーボードやゲームパッドで選択できなくなります。また`1`や`2`などの数値を指定すると、キーコンフィグの`focus_next`アクションでボタンを選択していくときの順序を指定できます。,


:demo
1,kaisetsu/14_select

#[end]
*/

//指定した位置にグラフィックボタンを配置する
tyrano.plugin.kag.tag.button = {
    pm: {
        graphic: "",
        storage: null,
        target: null,
        ext: "",
        name: "",
        x: "",
        y: "",
        width: "",
        height: "",
        fix: "false" /*ここがtrueの場合、システムボタンになりますね*/,
        savesnap: "false",
        folder: "image",
        exp: "",
        preexp: "",
        visible: "true",
        hint: "",
        clickse: "",
        enterse: "",
        leavese: "",
        activeimg: "",
        clickimg: "",
        enterimg: "",
        autoimg: "",
        skipimg: "",
        keyfocus: "",

        auto_next: "yes",

        role: "",
    },

    //イメージ表示レイヤ。メッセージレイヤのように扱われますね。。
    //cmで抹消しよう
    start: function (pm) {
        var that = this;

        var target_layer = null;

        //role が設定された時は自動的にfix属性になる
        if (pm.role != "") {
            pm.fix = "true";
        }

        if (pm.fix == "false") {
            target_layer = this.kag.layer.getFreeLayer();
            target_layer.css("z-index", 999999);
        } else {
            target_layer = this.kag.layer.getLayer("fix");
        }

        var storage_url = "";

        if ($.isHTTP(pm.graphic)) {
            storage_url = pm.graphic;
        } else {
            storage_url = "./data/" + pm.folder + "/" + pm.graphic;
        }

        var j_button = $("<img />");
        j_button.attr("src", storage_url);
        j_button.css("position", "absolute");
        j_button.css("z-index", 99999999);
        that.kag.setElmCursor(j_button, "pointer");
        that.kag.makeFocusable(j_button, pm.keyfocus);

        //初期状態で表示か非表示か
        if (pm.visible == "true") {
            j_button.show();
        } else {
            j_button.hide();
        }

        if (pm.x == "") {
            if (this.kag.stat.locate.x != 0) {
                j_button.css("left", this.kag.stat.locate.x + "px");
            }
        } else {
            j_button.css("left", pm.x + "px");
        }

        if (pm.y == "") {
            if (this.kag.stat.locate.y != 0) {
                j_button.css("top", this.kag.stat.locate.y + "px");
            }
        } else {
            j_button.css("top", pm.y + "px");
        }

        if (pm.fix != "false") {
            j_button.addClass("fixlayer");
        }

        if (pm.width != "") {
            j_button.css("width", pm.width + "px");
        }

        if (pm.height != "") {
            j_button.css("height", pm.height + "px");
        }

        //ツールチップの設定
        if (pm.hint != "") {
            j_button.attr({
                title: pm.hint,
                alt: pm.hint,
            });
        }

        //オブジェクトにクラス名をセットします
        $.setName(j_button, pm.name);

        if (pm.preexp !== "") {
            var preexp_entity = that.kag.embScript(pm.preexp);
            pm.preexp = JSON.stringify(preexp_entity);
        }

        if (pm.autoimg) {
            j_button.addClass("button-auto-sync");
        }
        if (pm.skipimg) {
            j_button.addClass("button-skip-sync");
        }

        //クラスとイベントを登録する
        that.kag.event.addEventElement({
            tag: "button",
            j_target: j_button, //イベント登録先の
            pm: pm,
        });
        that.setEvent(j_button, pm);

        target_layer.append(j_button);

        if (pm.fix == "false") {
            target_layer.show();
        }

        this.kag.ftag.nextOrder();
    },

    /**
     * クリック時やホバー時などのイベントリスナをセットする
     * タグを実行したときおよびセーブデータをロードしたときに実行される
     * @param {jQuery} j_button
     * @param {Object} pm
     */
    setEvent: function (j_button, pm) {
        const that = this;

        // セーブした瞬間にホバー時の画像などになっていると、それがそのまま保存・復元されてしまうため、
        // もとの画像パスに戻す
        j_button.attr("src", $.parseStorage(pm.graphic, pm.folder));

        if (pm.autoimg && this.kag.stat.is_auto) j_button.attr("src", $.parseStorage(pm.autoimg, pm.folder));
        if (pm.skipimg && this.kag.stat.is_skip) j_button.attr("src", $.parseStorage(pm.skipimg, pm.folder));

        // クリックされたか
        let button_clicked = false;

        // 固定ボタンか ([clearfix]するまで永続するボタンか)
        const is_fix_button = pm.fix === "true";

        // ロールボタンか (セーブやロードなどを行なうためのボタンか)
        const is_role_button = !!pm.role;

        // コールボタンか (サブルーチンをコールするボタンか)
        const is_call_button = !is_role_button && is_fix_button;

        // 選択肢ボタンか ([cm]で消えるボタンか)
        const is_jump_button = !is_role_button && !is_fix_button;

        // セーブに関連する機能を持ったロールボタンか
        const is_save_button = pm.role == "save" || pm.role == "menu" || pm.role == "quicksave" || pm.role == "sleepgame";

        // preexp をこの時点で評価
        const preexp = this.kag.embScript(pm.preexp);

        //
        // ホバーイベント
        //

        j_button.hover(
            // マウスカーソルが乗った時
            () => {
                if (!is_fix_button && !this.kag.stat.is_strong_stop) return false;
                if (!is_fix_button && button_clicked) return false;
                if (!j_button.hasClass("src-change-disabled")) {
                    if (pm.enterimg) j_button.attr("src", $.parseStorage(pm.enterimg, pm.folder));
                }
                if (pm.enterse) this.kag.playSound(pm.enterse);
            },
            // マウスカーソルが外れた時
            () => {
                if (!is_fix_button && !this.kag.stat.is_strong_stop) return false;
                if (!is_fix_button && button_clicked) return false;
                if (!j_button.hasClass("src-change-disabled")) {
                    if (pm.enterimg) j_button.attr("src", $.parseStorage(pm.graphic, pm.folder));
                }
                if (pm.leavese) this.kag.playSound(pm.leavese);
            },
        );

        //
        // 押下イベント
        //

        j_button.on("mousedown touchstart", (e) => {
            e.stopPropagation();

            if (!this.kag.stat.is_strong_stop) return true;
            if (button_clicked) return true;
            if (!j_button.hasClass("src-change-disabled")) {
                if (pm.activeimg) j_button.attr("src", $.parseStorage(pm.activeimg, pm.folder));
            }
            //falseを返すと ipad などの一部環境で不具合
            return true;
        });

        //
        // クリックイベント
        //

        j_button.on("click", (e) => {
            // ブラウザの音声の再生制限を解除
            if (!that.kag.tmp.ready_audio) that.kag.readyAudio();

            //
            //　無効な場合を検知
            //

            // 仮想マウスカーソルが表示中、あるいは非表示になってから間もないなら無効
            if (!that.kag.key_mouse.mouse.isClickEnabled(e)) {
                that.kag.key_mouse.vmouse.hide();
                return false;
            }

            // [s]または[wait]に到達していないときの非固定ボタンは無効
            if (!this.kag.stat.is_strong_stop && !is_fix_button) return false;

            // 1度クリックした非固定ボタンも無効
            if (button_clicked && !is_fix_button) return false;

            // クリックできる状態じゃないなら無効
            if (!that.kag.stat.is_strong_stop && that.kag.layer.layer_event.css("display") === "none") return false;

            // セーブスナップを取ろうとしたもののアニメーション中やトランジション中なら無効
            if (pm.savesnap === "true" && that.kag.stat.is_stop) return false;

            // セーブしようとしたものの[text]中や[wait]中であれば無効
            if (is_save_button && (that.kag.stat.is_adding_text || that.kag.stat.is_wait)) return false;

            // [sleepgame]しようとしたものの現在すでに[sleepgame]中なら無効
            if (pm.role === "sleepgame" && that.kag.tmp.sleep_game !== null) return false;

            // storageもtargetも指定されてない場合は無効
            if (pm.role == "" && pm.storage == null && pm.target == null) return false;

            // [call]スタックが存在するか ボタン実行時に判定する。
            const exists_call_stack = !!that.kag.getStack("call");

            // [call]しようとしたもののすでに[call]スタックが溜まっているなら無効
            if (is_call_button && exists_call_stack) {
                that.kag.log("callスタックが残っている場合、fixボタンは反応しません");
                that.kag.log(that.kag.getStack("call"));
                return false;
            }

            //
            // クリックが有効だった場合の処理
            //

            // 仮想マウスカーソルを消去
            this.kag.key_mouse.vmouse.hide();

            // 非固定ボタンの場合クリック済みであるフラグを立てよう
            if (!is_fix_button) {
                // ボタンクリック済み
                button_clicked = true;

                // 他の[button]を即座に無効にするためにストロングストップを切っておこう
                this.kag.cancelStrongStop();

                // 念のためフリーレイヤ内のボタンのイベントをすべて解除しておこう
                this.kag.layer.cancelAllFreeLayerButtonsEvents();

                // クリックされたというクラスを付ける！これを指定したアニメーションが可能
                j_button.addClass("clicked_button");
            }

            // クリック画像が設定されているなら画像を変える
            if (pm.clickimg != "") {
                j_button.attr("src", $.parseStorage(pm.clickimg, pm.folder));
            } else if (pm.activeimg != "") {
                // クリック画像は設定されていないが、アクティブ画像が設定されている場合
                // いままさにアクティブ画像になっているはずなので、もとに戻す
                j_button.attr("src", $.parseStorage(pm.graphic, pm.folder));
            }

            // クリック効果音を鳴らす
            if (pm.clickse) this.kag.playSound(pm.clickse);

            // JSの実行
            if (pm.exp) this.kag.embScript(pm.exp, preexp);

            // セーブスナップの取得
            if (pm.savesnap === "true") that.kag.menu.snapSave(that.kag.stat.current_save_str);

            //
            // [jump]ボタン
            //

            if (is_jump_button) {
                // ティラノイベント"click-tag-button"を発火
                that.kag.trigger("click-tag-button", e);

                // [jump]を実行
                that.kag.ftag.startTag("jump", pm);

                // スキップの継続設定
                if (that.kag.stat.skip_link === "true") {
                    e.stopPropagation();
                } else {
                    that.kag.setSkip(false);
                }

                return false;
            }

            //
            // [call]ボタン
            //

            if (is_call_button) {
                // ティラノイベント"click-tag-button-call"を発火
                that.kag.trigger("click-tag-button-call", e);

                // [call]を実行
                that.kag.ftag.startTag("call", {
                    storage: pm.storage,
                    target: pm.target,
                    auto_next: that.kag.stat.is_strong_stop ? "stop" : pm.auto_next,
                });

                // スキップの継続設定
                if (that.kag.stat.skip_link === "true") {
                    e.stopPropagation();
                } else {
                    that.kag.setSkip(false);
                }

                return false;
            }

            //
            // ロールボタン
            //

            if (is_role_button) {
                // ティラノイベント"click-tag-button-role"を発火
                that.kag.trigger("click-tag-button-role", e);

                // スキップを停止
                that.kag.setSkip(false);

                // オートモードも(これがオートモードボタンでなければ)停止
                if (pm.role !== "auto") {
                    that.kag.ftag.startTag("autostop", { next: "false" });
                }

                switch (pm.role) {
                    case "save":
                        that.kag.menu.displaySave();
                        break;
                    case "load":
                        that.kag.menu.displayLoad();
                        break;
                    case "window":
                        that.kag.layer.hideMessageLayers();
                        break;
                    case "title":
                        that.kag.backTitle();
                        break;
                    case "menu":
                        that.kag.menu.showMenu();
                        break;
                    case "skip":
                        if (that.kag.stat.is_skip) {
                            that.kag.setSkip(false);
                        } else {
                            if (that.kag.layer.layer_event.isDisplayed()) {
                                that.kag.layer.layer_event.click();
                            }
                            that.kag.setSkip(true);
                        }
                        break;
                    case "backlog":
                        that.kag.menu.displayLog();
                        break;
                    case "fullscreen":
                        that.kag.menu.screenFull();
                        break;
                    case "quicksave":
                        // mouseleave をトリガーしておく。ホバー時のボタン画像で保存されないように
                        j_button.trigger("mouseleave");
                        that.kag.menu.setQuickSave();
                        break;
                    case "quickload":
                        that.kag.menu.loadQuickSave();
                        break;
                    case "auto":
                        if (this.kag.stat.is_auto) {
                            that.kag.setAuto(false);
                        } else {
                            if (that.kag.layer.layer_event.isDisplayed()) {
                                that.kag.layer.layer_event.click();
                            }
                            that.kag.setAuto(true);
                        }
                        break;
                    case "sleepgame":
                        // mouseleave をトリガーしておく。ホバー時のボタン画像で保存されないように
                        j_button.trigger("mouseleave");
                        that.kag.tmp.sleep_game = {};
                        pm.next = false;
                        that.kag.ftag.startTag("sleepgame", pm);
                        break;
                }

                return false;
            }
        });
    },
};

/*
#[glink_config]

:group
ラベル・ジャンプ操作

:title
グラフィカルリンクの設定

:exp
V515以降で使用可能。

`[glink]`（グラフィカルリンク）の自動配置の設定ができます。自動配置が有効の場合(デフォルトで有効)、xとyがどちらも指定されていない`[glink]`が自動配置の対象となります。自動配置対象の`[glink]`はすぐには表示されず、`[s]`タグに到達した時点で表示されるようになります。

省略したパラメータの設定は変更されません。

:sample
[glink_config auto_place="true" show_time="300"]
[position left="160" top="500" width="1000" height="200" visible="true"]
[position margint="45" marginl="50" marginr="70" marginb="60"]
ティラノスクリプトに興味ある？[l]
[glink  color="btn_13_red" text="はい。興味あります"  target="*selectinterest"]
[glink  color="btn_13_red" text="興味あります！"  target="*selectinterest"]
[glink  color="btn_13_red" text="どちらかと言うと興味あり"  target="*selectinterest"]
[s]

*selectinterest
ホント！？うれしいなー[p]

:param
auto_place       = `[glink]`の自動配置を有効にするかどうか。`true`を指定すると、xとyが指定されていない`[glink]`を対象とする自動配置を有効にします。`false`で無効。,
auto_place_force = `true`を指定すると、xとyが指定されている`[glink]`も強制的に自動配置の対象にします。,
margin_x         = ボタンの外側に付ける横余白を数値(px)で指定します。,
margin_y         = ボタンの外側に付ける縦余白を数値(px)で指定します。,
padding_x        = ボタンの内側に付ける横余白を数値(px)で指定します。`default`を指定すると調整を行いません。,
padding_y        = ボタンの内側に付ける縦余白を数値(px)で指定します。`default`を指定すると調整を行いません。,
width            = `max`と指定すると、ボタンの横幅を『一番横幅の大きいボタンの横幅』に揃えることができます。数値を直接指定することで共通の横幅を指定することもできます。`default`を指定すると調整を行いません。,
height           = `max`と指定すると、ボタンの高さを『一番横幅の大きいボタンの高さ』に揃えることができます。数値を直接指定することで共通の高さを指定することもできます。`default`を指定すると調整を行いません。,
vertical         = ボタンの縦方向の揃え方を`top`(上揃え)、`center`(中央揃え)、`bottom`(下揃え)のいずれかで指定します。,
horizontal       = ボタンの横方向の揃え方を`left`(左揃え)、`center`(中央揃え)、`right`(右揃え)のいずれかで指定します。,
wrap             = `wrap`を指定すると、ボタンが収まりきらないときの折り返しが有効になります。,
place_area       = 揃え方の基準となる領域の位置や大きさを指定できます。`auto`(デフォルト)を指定すると、メッセージウィンドウ考慮して自動で領域を調整します。`cover`だと画面全体を基準にします。領域の位置とサイズを直接指定したい場合は`100,100,1000,1000`のようにカンマ区切りで数値を4つ指定してください。そうすると、順にleft, top, width, heightとして解釈されます。,
show_time        = 表示アニメーションにかける時間をミリ秒単位で指定します。`0`を指定するとアニメーションを行いません。なお、アニメーション中はクリックすることができません。,
show_effect      = 表示アニメーションのエフェクトを以下のキーワードから指定できます。<br>`fadeIn``fadeInDown``fadeInLeft``fadeInRight``fadeInUp``lightSpeedIn``rotateIn``rotateInDownLeft``rotateInDownRight``rotateInUpLeft``rotateInUpRight``zoomIn``zoomInDown``zoomInLeft``zoomInRight``zoomInUp``bounceIn``bounceInDown``bounceInLeft``bounceInRight``bounceInUp``rollIn``vanishIn``puffIn`,
show_keyframe    = 表示アニメーションとして`[keyframe]`タグで定義したキーフレームアニメーションの`name`を指定できます。これを指定した場合、`show_effect`は無視されます。,
show_delay       = 各ボタンを表示していく際の遅延をミリ秒で指定できます。`0`だとすべてのボタンが同時に表示され、たとえば`100`と指定すると100ミリ秒ごとに1個ずつボタンが表示されます。,
show_easing      = 表示アニメーションの変化パターンを指定できます。以下のキーワードが指定できます。デフォルトは`linear`。<br>
`ease`(開始時点と終了時点を滑らかに再生する)<br>
`linear`(一定の間隔で再生する)<br>
`ease-in`(開始時点をゆっくり再生する)<br>
`ease-out`(終了時点をゆっくり再生する)<br>
`ease-in-out`(開始時点と終了時点をゆっくり再生する)<br>
この他に`cubic-bezier`関数を使って独自のイージングを指定することも可能です。,
select_time      = ボタンが選択されたときの退場アニメーションにかける時間をミリ秒単位で指定します。`0`を指定するとアニメーションを行いません。,
select_effect    = <p>選択時の退場アニメーションのエフェクトを以下のキーワードが指定できます。</p><p>`fadeOut``fadeOutDownBig``fadeOutLeftBig``fadeOutRightBig``fadeOutUpBig``flipOutX``flipOutY``lightSpeedOut``rotateOut``rotateOutDownLeft``rotateOutDownRight``rotateOutUpLeft``rotateOutUpRight``zoomOut``zoomOutDown``zoomOutLeft``zoomOutRight``zoomOutUp``slideOutDown``slideOutLeft``slideOutRight``slideOutUp``bounceOut ``bounceOutDown``bounceOutLeft``bounceOutRight``bounceOutUp`</p>,
select_keyframe  = 選択時の退場アニメーションとして`[keyframe]`タグで定義したキーフレームアニメーションの`name`を指定できます。これを指定した場合、`select_effect`は無視されます。,
select_delay     = 選択時の退場アニメーションを開始するまでの遅延をミリ秒単位で指定します。,
select_easing    = 選択時の退場アニメ―ションのイージングを指定します。,
reject_time      = ボタンが選択されなかったときの退場アニメーションにかける時間をミリ秒単位で指定します。`0`を指定するとアニメーションを行いません。,
reject_effect    = <p>非選択時の退場アニメーションのエフェクトを以下のキーワードが指定できます。</p><p>`fadeOut``fadeOutDownBig``fadeOutLeftBig``fadeOutRightBig``fadeOutUpBig``flipOutX``flipOutY``lightSpeedOut``rotateOut``rotateOutDownLeft``rotateOutDownRight``rotateOutUpLeft``rotateOutUpRight``zoomOut``zoomOutDown``zoomOutLeft``zoomOutRight``zoomOutUp``slideOutDown``slideOutLeft``slideOutRight``slideOutUp``bounceOut ``bounceOutDown``bounceOutLeft``bounceOutRight``bounceOutUp`</p>,
reject_keyframe  = 非選択時の退場アニメーションとして`[keyframe]`タグで定義したキーフレームアニメーションの`name`を指定できます。これを指定した場合、`reject_effect`は無視されます。,
reject_delay     = 選択時の退場アニメーションを開始するまでの遅延をミリ秒単位で指定します。,
reject_easing    = 選択時の退場アニメ―ションのイージングを指定します。,

#[end]
*/

tyrano.plugin.kag.tag.glink_config = {
    pm: {},

    default_glink_config: {
        auto_place: "true",
        auto_place_force: "false",
        margin_y: "20",
        margin_x: "0",
        padding_y: "default",
        padding_x: "default",
        direction: "column",
        wrap: "nowrap",
        dx: "0",
        dy: "0",
        width: "default",
        vertical: "center",
        horizontal: "center",
        place_area: "auto",

        show_time: "0",
        show_effect: "fadeIn",
        show_keyframe: "none",
        show_delay: "0",
        show_easing: "linear",

        select_time: "0",
        select_effect: "fadeOutRight",
        select_keyframe: "none",
        select_delay: "0",
        select_easing: "linear",

        reject_time: "0",
        reject_effect: "fadeOut",
        reject_keyframe: "none",
        reject_delay: "0",
        reject_easing: "linear",
    },

    getConfig: function (name) {
        if (!this.kag.stat.glink_config) {
            this.kag.stat.glink_config = $.extend({}, this.default_glink_config);
        }
        if (name) {
            return this.kag.stat.glink_config[name];
        } else {
            return this.kag.stat.glink_config;
        }
    },

    start: function (pm) {
        if (!this.kag.stat.glink_config) {
            this.kag.stat.glink_config = $.extend({}, this.default_glink_config);
        }

        // 横揃えの方向
        if (pm.horizontal === "left") pm.horizontal = "flex-start";
        if (pm.horizontal === "right") pm.horizontal = "flex-end";

        // 縦揃えの方向
        if (pm.vertical === "top") pm.vertical = "start";
        if (pm.vertical === "bottom") pm.vertical = "end";

        for (const key in pm) {
            if (key !== "_tag") {
                if (pm[key]) {
                    this.kag.stat.glink_config[key] = pm[key];
                }
            }
        }
        this.kag.ftag.nextOrder();
    },
};

/*
#[glink]

:group
ラベル・ジャンプ操作

:title
グラフィカルリンク

:exp
グラフィカルリンク(テキストボタン)を表示できます。画像は必要ありません。

グラフィックリンク表示中は強制的にシナリオ進行が停止しますので、必ずジャンプ先を指定してください。

グラフィックリンクの表示位置は直前の`[locate]`タグによる指定位置を参照します。ただし、`x``y`属性が指定されている場合は、そちらが優先されます。

このボタンでシナリオを移動するときは、`[jump]`タグでジャンプするときと同様に、コールスタックに残りません。つまり、`[return]`タグで戻ってくることはできません。

ジャンプ後は自動的に`[cm]`タグが実行され、ボタンが消去されます。

<b>glinkはV501c以降で大幅にデザインが追加されています。ぜひ次のURLからサンプルをご覧ください。</b>
https://tyrano.jp/sample2/code/siryou/1

:sample

[glink target="j1" text="選択肢１" size=20  width="500" y=300]
[glink target="j2" text="選択肢２" size=30  width="500" y=400]
[glink target="j3" text="選択肢３" size=30  width="500" y=400]

[s]

:param
color      = <p>ボタンの色をキーワードで指定できます。デフォルトは`black`です。`black``gray``white``orange``red``blue``rosy``green``pink`のキーワードが指定できます。</p><p><b>V501c以降では200パターン以上のデザインが追加されました</b>。詳しくは https://tyrano.jp/sample2/code/siryou/1 をご覧ください。</p>,
font_color = フォントの色を`0xRRGGBB`形式で指定します。 ,
storage    = !!jump,
target     = !!jump,
name       = !!,
text       = テキストの内容を指定します。,
x          = ボタンの横位置を指定します。,
y          = ボタンの縦位置を指定します。,
width      = ボタンの横幅をピクセルで指定できます。,
height     = ボタンの高さをピクセルで指定できます。,
size       = フォントサイズを指定できます。,
face       = フォントを指定できます。Webフォントを使用する場合は`tyrano/css/font.css`に定義を記述してください。,
graphic    = ボタンの背景画像を指定します。ファイルは`data/image`フォルダに入れてください。画像が指定された場合は`color`は無視されます。,
enterimg   = `graphic`が指定されている時に有効。カーソルが重なった時の画像を指定できます,
clickse    = ボタンをクリックした時に再生される効果音を設定できます。効果音ファイルは`data/sound`フォルダに配置してください,
enterse    = ボタンの上にマウスカーソルが乗った時に再生する効果音を設定できます。効果音ファイルは`sound`フォルダに配置してください,
leavese    = ボタンの上からマウスカーソルが外れた時に再生する効果音を設定できます。効果音ファイルは`sound`フォルダに配置してください。,
cm         = <p>ボタンクリック後に`[cm]`を実行するかどうか。`[glink]`は通常、ボタンクリック後に自動的に`[cm]`が実行されますが、`false`を指定するとこの`[cm]`を実行しません。</p><p>プレイヤー入力などの決定を`[glink]`で行いたい場合は`false`を指定しておき、`[commit]`後に手動で`[cm]`を実行してボタンや入力ボックスを消してください。</p>,
exp        = ボタンがクリックされた時に実行されるJSを指定できます。,
preexp     = タグが実行された時点で、この属性に指定した値が変数`preexp`に格納されます。そしてボタンがクリックされた時に`exp`内で`preexp`という変数が利用できるようになります。,
bold       = 太字にする場合は`true`を指定します。,
opacity    = 領域の不透明度を`0`～`255`の数値で指定します。`0`で完全に透明です。,
edge       = 文字の縁取りを有効にできます。縁取り色を`0xRRGGBB`形式等で指定します。<br>V515以降：縁取りの太さもあわせて指定できます。`4px 0xFF0000`のように、色の前に縁取りの太さをpx付きで記述します。太さと色は半角スペースで区切ってください。さらに`4px 0xFF0000, 2px 0xFFFFFF`のようにカンマ区切りで複数の縁取りを指定できます。,
shadow     = 文字に影をつけます。影の色を`0xRRGGBB`形式で指定します。,
keyfocus   = `false`を指定すると、キーボードやゲームパッドで選択できなくなります。また`1`や`2`などの数値を指定すると、キーコンフィグの`focus_next`アクションでボタンを選択していくときの順序を指定できます。,
autopos    = `true`か`false`を指定します。デフォルトは`false`。trueを指定するとボタンの位置を自動的に調整します。つまりxとyに何も指定しなかったと同じ動作になります,

:demo
1,kaisetsu/14_select

#[end]
*/

//グラフィカルな選択肢を表示する　CSSボタン
tyrano.plugin.kag.tag.glink = {
    pm: {
        color: "black", //クラス名でいいよ
        font_color: "",
        storage: null,
        target: null,
        hold: "",
        name: "",
        text: "",
        x: "auto",
        y: "",
        width: "",
        height: "",
        exp: "",
        preexp: "",
        size: 30,
        graphic: "",
        enterimg: "",
        cm: "true",
        opacity: "",
        clickse: "",
        enterse: "",
        leavese: "",
        face: "",
        bold: "",
        keyfocus: "",
        autopos:"false",
    },

    //イメージ表示レイヤ。メッセージレイヤのように扱われますね。。
    //cmで抹消しよう
    start: function (pm) {
        var that = this;
        var target_layer = null;
        target_layer = this.kag.layer.getFreeLayer();
        target_layer.css("z-index", 999999);

        var j_button = $("<div class='glink_button'>" + pm.text + "</div>");
        j_button.css("position", "absolute");
        j_button.css("z-index", 99999999);
        j_button.css("font-size", pm.size + "px");
        that.kag.setElmCursor(j_button, "pointer");
        that.kag.makeFocusable(j_button, pm.keyfocus);
        
        //強制自動配置が有効な場合
        if (pm.autopos == "true") {
            pm.x = "auto";
            pm.y = "";
            pm.height = "";
        }

        if (pm.font_color != "") {
            j_button.css("color", $.convertColor(pm.font_color));
        }

        if (pm.height != "") {
            j_button.css("height", pm.height + "px");
        }

        if (pm.width != "") {
            j_button.css("width", pm.width + "px");
        }

        if (pm.opacity != "") {
            j_button.css("opacity", $.convertOpacity(pm.opacity));
        }

        if (pm.bold === "true") {
            j_button.css("font-weight", "bold");
        }

        if (pm.edge) {
            j_button.css("text-shadow", $.generateTextShadowStrokeCSS(pm.edge));
        } else if (pm.shadow) {
            j_button.css("text-shadow", "2px 2px 2px " + $.convertColor(pm.shadow));
        }

        //graphic 背景画像を指定できます。
        if (pm.graphic != "") {
            //画像の読み込み

            j_button.removeClass("glink_button").addClass("button_graphic");
            var img_url = "./data/image/" + pm.graphic;
            j_button.css("background-image", "url(" + img_url + ")");
            j_button.css("background-repeat", "no-repeat");
            j_button.css("background-position", "center center");
            j_button.css("background-size", "100% 100%");
        } else {
            j_button.addClass(pm.color);
        }

        if (pm.face != "") {
            j_button.css("font-family", pm.face);
        } else if (that.kag.stat.font.face != "") {
            j_button.css("font-family", that.kag.stat.font.face);
        }
        
        if (pm.x == "auto") {
            var sc_width = parseInt(that.kag.config.scWidth);
            var center = Math.floor(parseInt(j_button.css("width")) / 2);
            var base = Math.floor(sc_width / 2);
            var first_left = base - center;
            j_button.css("left", first_left + "px");
        } else if (pm.x == "") {
            j_button.css("left", this.kag.stat.locate.x + "px");
        } else {
            j_button.css("left", pm.x + "px");
        }

        if (pm.y == "") {
            j_button.css("top", this.kag.stat.locate.y + "px");
        } else {
            j_button.css("top", pm.y + "px");
        }

        //オブジェクトにクラス名をセットします
        $.setName(j_button, pm.name);

        //preexpにmpやtfなどの一時変数が指定されるとロード後に復元できないので
        //data属性に格納する前にあらかじめ評価しておきます
        if (pm.preexp !== "") {
            var preexp_entity = that.kag.embScript(pm.preexp);
            pm.preexp = JSON.stringify(preexp_entity);
        }

        // アニメーション系のパラメータの glink_config からの上書き
        const glink_config = this.kag.getTag("glink_config").getConfig();
        ["show", "select", "reject"].forEach((key_1) => {
            ["effect", "keyframe", "time", "easing", "delay"].forEach((key_2) => {
                const key = `${key_1}_${key_2}`;
                // このパラメータが未指定の場合は glink_config から引っ張ってくる
                if (!pm[key]) pm[key] = glink_config[key];
            });
        });

        that.kag.event.addEventElement({
            tag: "glink",
            j_target: j_button, //イベント登録先の
            pm: pm,
        });
        this.setEvent(j_button, pm);

        // 自動配置が有効な場合は非表示にしておく
        let is_auto_place = glink_config.auto_place_force === "true";
        if (is_auto_place || (glink_config.auto_place === "true" && pm.x === "auto" && !pm.y)) {
            j_button.addClass("glink_button_auto_place");
            j_button.hide();
        } else {
            // <自動配置は無効だが表示アニメ―ションが有効なケース>では単独で表示アニメーションを適用したい

            // 表示アニメーションのオプションを取得
            const show_options = {};
            ["time", "easing", "effect", "keyframe", "delay"].forEach((key) => {
                show_options[key] = pm[`show_${key}`];
            });

            // 表示アニメーションが必要か
            const need_animate =
                show_options.time !== undefined &&
                parseInt(show_options.time) >= 10 &&
                (show_options.keyframe !== "none" || show_options.effect !== "none");

            // 表示アニメーションが必要ならこの glink に単独でアニメーションを適用する
            if (need_animate) {
                show_options.callback = () => {
                    j_button.setStyleMap({ "pointer-events": "auto" });
                };
                this.startAnim(j_button, show_options);
            }
        }

        target_layer.append(j_button);
        target_layer.show();
        this.kag.ftag.nextOrder();
    },

    setEvent: function (j_button, pm) {
        // ボタンがクリックされたか
        let button_clicked = false;

        // クリック時に[cm]を使用するか。cm="false" が指定されていないなら true
        const use_cm = pm.cm !== "false";

        // preexp をこの時点で評価
        const preexp = this.kag.embScript(pm.preexp);

        //
        // ホバーイベント
        //

        j_button.hover(
            () => {
                // マウスが乗ったとき
                if (!this.kag.stat.is_strong_stop) return false;
                if (button_clicked) return false;
                if (pm.enterimg) j_button.css("background-image", "url(./data/image/" + pm.enterimg + ")");
                if (pm.enterse) this.kag.playSound(pm.enterse);
            },
            () => {
                // マウスが離れたとき
                if (!this.kag.stat.is_strong_stop) return false;
                if (button_clicked) return false;
                if (pm.enterimg) j_button.css("background-image", "url(./data/image/" + pm.graphic + ")");
                if (pm.leavese) this.kag.playSound(pm.leavese);
            },
        );

        j_button.on("mousedown", () => {
            return false;
        });

        //
        // クリックイベント
        //

        j_button.click((e) => {
            // ブラウザの音声の再生制限を解除
            if (!this.kag.tmp.ready_audio) this.kag.readyAudio();

            //
            // 無効な場合を検知
            //

            // 仮想マウスカーソルが表示中、あるいは非表示になってから間もないなら無効
            if (!this.kag.key_mouse.mouse.isClickEnabled(e)) {
                this.kag.key_mouse.vmouse.hide();
                return false;
            }

            // [s]または[wait]に到達していないときは無効
            if (!this.kag.stat.is_strong_stop) return false;

            // 1度クリックした cm="true" なボタンは無効
            if (button_clicked && use_cm) return false;
            // ※ cm="false" なボタンは何度でもクリックできるようにする

            //
            // クリックが有効だったときの処理
            //

            // ボタンクリック済み
            button_clicked = true;

            // 仮想マウスカーソルを消去
            this.kag.key_mouse.vmouse.hide();

            // 他の[glink]を即座に無効にするためにストロングストップを切っておこう
            this.kag.cancelStrongStop();

            // クリックされたというクラスを付ける
            j_button.addClass("glink_button_clicked");

            // 画像変更
            if (pm.clickimg) j_button.css("background-image", "url(./data/image/" + pm.clickimg + ")");

            // ティラノイベント"click-tag-glink"を発火
            this.kag.trigger("click-tag-glink", e);

            // クリック効果音を鳴らす
            if (pm.clickse) this.kag.playSound(pm.clickse);

            // JSの実行
            if (pm.exp) this.kag.embScript(pm.exp, preexp);

            // [cm]+[jump]を実行する関数
            const next = () => {
                // [cm]を実行するかどうか
                if (use_cm) {
                    // [cm]の実行
                    this.kag.ftag.startTag("cm", { next: "false" });
                } else {
                    // [cm]を実行しない場合はボタンが残り続ける
                    // 念のため、すべてのボタンのマウス系イベントを解除しておこう
                    // this.kag.layer.cancelAllFreeLayerButtonsEvents();
                    // cm="false" なボタンは何度でもクリックできるようにしたいためコメントアウト
                }

                // [jump]の実行
                if (pm.hold === "true") {
                    this.kag.stat.hold_glink = true;
                    this.kag.stat.hold_glink_storage = pm.storage;
                    this.kag.stat.hold_glink_target = pm.target;
                    this.kag.cancelStrongStop();
                    this.kag.cancelWeakStop();
                    this.kag.ftag.nextOrder();
                } else {
                    this.kag.ftag.startTag("jump", pm);
                }

                // 選択肢の後、スキップを継続するか否か
                if (this.kag.stat.skip_link === "true") {
                    e.stopPropagation();
                } else {
                    this.kag.setSkip(false);
                }
            };

            //
            // アニメーション設定の存在をチェック
            //

            // アニメーションが必要なボタンの数
            let animation_target_count = 0;

            // ボタンを全部取得
            const j_collection = $(".glink_button");

            // 各ボタンについてアニメーション設定を見ていく
            j_collection.each((i, elm) => {
                const j_elm = $(elm);
                // このボタンを出すときに指定されていたパラメータをオブジェクトに復元
                const _pm = JSON.parse(j_elm.attr("data-event-pm"));
                // このボタンはクリックされたものか
                const is_selected = j_elm.hasClass("glink_button_clicked");
                if (!is_selected) {
                    j_elm.addClass("glink_button_not_clicked");
                }
                // クリックされたかどうかに応じて退場アニメーション設定を取得する
                const head = is_selected ? "select" : "reject";
                const hide_options = {};
                ["time", "easing", "effect", "keyframe", "delay"].forEach((key) => {
                    hide_options[key] = _pm[`${head}_${key}`];
                });
                // アニメーションが必要か
                const need_animate =
                    hide_options.time !== undefined &&
                    parseInt(hide_options.time) >= 10 &&
                    (hide_options.keyframe !== "none" || hide_options.effect !== "none");
                if (need_animate) {
                    animation_target_count += 1;
                }
                // Elementのプロパティに情報を格納 すぐあとで使う
                elm.__hide_options = hide_options;
                elm.__need_animate = need_animate;
            });

            // スキップ維持設定
            const should_keep_skip = this.kag.stat.is_skip && this.kag.stat.skip_link === "true";

            //
            // アニメーションが必要ない場合
            //

            // アニメーション対象が存在しない、または、いまスキップ状態でありそれを選択後も継続させる設定である
            if (animation_target_count === 0 || should_keep_skip) {
                next();
                return false;
            }

            //
            // アニメーションが必要なボタンが少なくともひとつはある場合
            //

            // 念のためすべてのボタンのマウス系イベントを解除しておこう
            this.kag.layer.cancelAllFreeLayerButtonsEvents();

            let anim_complete_counter = 0;
            j_collection.each((i, elm) => {
                const j_elm = $(elm);
                if (!elm.__need_animate) {
                    // アニメーションが必要ないなら即隠蔽
                    j_elm.setStyle("transition", "none");
                    j_elm.get(0).offsetHeight; // transition: none; の強制反映
                    j_elm.setStyle("opacity", "0");
                    j_elm.setStyle("visibility", "hidden");
                } else {
                    // アニメーションを適用
                    elm.__hide_options.callback = () => {
                        anim_complete_counter += 1;
                        if (anim_complete_counter === animation_target_count) {
                            next();
                        }
                    };
                    this.startAnim(j_elm, elm.__hide_options, true);
                }
            });

            return false;
        });
    },

    startAnim: function (j_collection, options, do_hide) {
        // クリック不可にする
        j_collection.setStyleMap({ "pointer-events": "none" });

        //
        // ティラノタグで定義したキーフレームアニメーションを使う場合
        //

        if (options.keyframe && options.keyframe !== "none") {
            j_collection.each((i, elm) => {
                const j_elm = $(elm);
                j_elm.animateWithTyranoKeyframes({
                    keyframe: options.keyframe,
                    time: options.time,
                    delay: options.delay,
                    count: "1",
                    mode: "forwards",
                    easing: options.easing,
                    onend: () => {
                        if (options.callback) options.callback();
                    },
                });
            });
            return;
        }

        //
        // プリセットのアニメーションを使用する場合
        //

        j_collection.each((i, elm) => {
            const j_elm = $(elm);
            j_elm.setStyle("animation-fill-mode", "forwards");
            if (options.time) j_elm.setStyle("animation-duration", $.convertDuration(options.time));
            if (options.delay) j_elm.setStyle("animation-delay", $.convertDuration(options.delay));
            if (options.easing) j_elm.setStyle("animation-timing-function", options.easing);
            j_elm.on("animationend", (e) => {
                if (j_elm.get(0) === e.target) {
                    j_elm.off("animationend");
                    j_elm.removeClass(options.effect);
                    if (do_hide) {
                        j_elm.addClass("hidden");
                    }
                    if (options.callback) options.callback();
                }
            });
            j_elm.addClass(options.effect);
        });
    },
};

/*
#[clickable]

:group
ラベル・ジャンプ操作

:title
クリック可能な領域を設定

:exp
透明なクリック可能領域を設定できます。

クリッカブルエリアの表示中は強制的にシナリオ進行が停止しますので、必ずジャンプ先を指定してください。

このボタンでシナリオを移動するときは、`[jump]`タグでジャンプするときと同様に、コールスタックに残りません。つまり、`[return]`タグで戻ってくることはできません。

<b>`[s]`タグに到達していない間は、クリッカブルは有効になりません</b>。必ず`[s]`タグでゲームを停止させてください。

:sample
[locate x=20 y=100]
[clickable width=200 height=300 target=*oda]

[locate x=300 y=100]
[clickable width=100 height=100 border="10px:dotted:red" target=*oda]

[s]

:param
width        = 領域の横幅を指定します。,
height       = 領域の高さを指定します。,
x            = 領域の左端位置のX座標を指定します。,
y            = 領域の左端位置のY座標を指定します。,
borderstyle  = 領域に表示する線のデザインを指定できます。`線の太さ:線の種類:線の色`のフォーマットで記述してください。各項目は<a href="https://developer.mozilla.org/ja/docs/Web/CSS/border" target="_blank">CSSの記法</a>で記述します。線の種類は`solid``double``groove``dashed dotted`などが指定できます。,　
color        = 表示色を`0xRRGGBB`形式で指定します。,
opacity      = 領域の不透明度を`0`～`255`の数値で指定します。`0`で完全に透明です。,
mouseopacity = 領域にマウスが乗ったときの不透明度を指定できます。,
storage      = !!jump,
target       = !!jump,

:demo
1,kaisetsu/13_clickable

#[end]
*/

//指定した位置にグラフィックボタンを配置する
tyrano.plugin.kag.tag.clickable = {
    vital: ["width", "height"],

    pm: {
        width: "0",
        height: "0",
        x: "",
        y: "",
        border: "none",
        color: "",
        mouseopacity: "",
        opacity: "140",
        storage: null,
        target: null,
        name: "",
    },

    //イメージ表示レイヤ。メッセージレイヤのように扱われますね。。
    //cmで抹消しよう
    start: function (pm) {
        var that = this;

        //this.kag.stat.locate.x
        var layer_free = this.kag.layer.getFreeLayer();

        layer_free.css("z-index", 9999999);

        var j_button = $("<div />");
        j_button.css("position", "absolute");
        j_button.css("top", this.kag.stat.locate.y + "px");
        j_button.css("left", this.kag.stat.locate.x + "px");
        j_button.css("width", pm.width + "px");
        j_button.css("height", pm.height + "px");
        j_button.css("opacity", $.convertOpacity(pm.opacity));
        j_button.css("background-color", $.convertColor(pm.color));
        j_button.css("border", $.replaceAll(pm.border, ":", " "));
        that.kag.setElmCursor(j_button, "pointer");

        //alert($.replaceAll(pm.border,":"," "));

        //x,y 座標が指定されている場合は、そっちを採用
        if (pm.x != "") {
            j_button.css("left", parseInt(pm.x));
        }

        if (pm.y != "") {
            j_button.css("top", parseInt(pm.y));
        }

        //クラスとイベントを登録する
        that.kag.event.addEventElement({
            tag: "clickable",
            j_target: j_button, //イベント登録先の
            pm: pm,
        });

        that.setEvent(j_button, pm);

        layer_free.append(j_button);
        layer_free.show();

        this.kag.ftag.nextOrder();
    },

    setEvent: function (j_button, pm) {
        const that = this;
        let button_clicked = false;

        //
        // ホバーイベント
        //

        if (pm.mouseopacity) {
            j_button.hover(
                () => {
                    j_button.css("opacity", $.convertOpacity(pm.mouseopacity));
                },
                () => {
                    j_button.css("opacity", $.convertOpacity(pm.opacity));
                },
            );
        }

        j_button.click((e) => {
            // ブラウザの音声の再生制限を解除
            if (!that.kag.tmp.ready_audio) that.kag.readyAudio();

            //
            //　無効な場合を検知
            //

            // [s]または[wait]に到達していないときは無効
            if (!this.kag.stat.is_strong_stop) return false;

            // 1度クリックしたボタンも無効
            if (button_clicked) return false;

            //
            // クリックが有効だったときの処理
            //

            // ボタンクリック済み
            button_clicked = true;

            // 他の[clickable]を即座に無効にするためにストロングストップを切る
            this.kag.cancelStrongStop();

            // ティラノイベント"click-tag-clickable"を発火
            that.kag.trigger("click-tag-clickable", e);

            // [cm]の実行
            this.kag.ftag.startTag("cm", { next: "false" });

            // [jump]の実行
            this.kag.ftag.startTag("jump", pm);
        });
    },
};

/*
#[glyph]

:group
システムデザイン変更

:title
クリック待ちグリフの設定

:exp
クリック待ちグリフ（`[l]`や`[p]`でクリックを待つ状態のときにメッセージの末尾に表示される画像）の設定が変更できます。使用する画像を変更したり、位置をメッセージの最後ではなく画面上の固定位置に出すようにしたりできます。

クリック待ちグリフのコンテンツには以下のパターンがあります。

①画像ファイル（`line`パラメータを指定する）※GIFやWebPもOK
②図形（`figure`パラメータを指定する）
③コマアニメ（`koma_anim`パラメータを指定する）
④HTMLを直接指定（`html`パラメータを指定する）※上級者向け

画像ではなく図形をプリセットから選んでクリック待ちグリフを作ることができます。図形には色を自由に指定できます。

アニメーションをプリセットから選んで適用したり、自分で`[keyframe]`タグで定義したキーフレームアニメーションを適用したりできます。

※クリック待ちグリフの設定は`[glyph]`タグを通過するたびに（指定しなかったパラメータも含めて）初期化されます。`[position]`や`[font]`のように複数タグに分割して定義することはできませんのでご注意ください。

:sample
[glyph]
デフォルトのクリック待ちグリフ（gif動画）[p]

[glyph fix="true" left="640" top="600"]
画面下中央に固定表示[p]

[glyph figure="rectangle" anim="bounce" width="5" color="0xCEE7F5" marginl="15"]
デフォルトのクリック待ちグリフを図形＋アニメーションで再現[p]

[glyph figure="v_triangle" anim="flash_momentary" delay="200"]
瞬間的に点滅する下向き三角[p]

[glyph figure="diamond" anim="flash"]
滑らかに点滅するひし形[p]

[glyph figure="circle" anim="soft_bounce" marginl="10"]
やわらかく弾む円[p]

[glyph figure="rectangle" anim="rotate_bounce"]
ぐるぐるしながらバウンドする四角[p]

[glyph figure="star" anim="spin_y" color="yellow"]
Y軸スピンする星[p]

[glyph figure="star" anim="spin_x" color="yellow"]
X軸スピンする星[p]

[glyph figure="star" anim="spin_z" color="yellow"]
Z軸スピンする星[p]

[glyph figure="star" anim="zoom" color="yellow"]
拡縮する星[p]

[glyph koma_anim="stepanim.jpg" koma_count="4" width="28"]
コマアニメ[p]

[glyph html='<span style="color: white; font-size: 20px;">🥺</span>']
HTMLを直接指定[p]

[keyframe name="yoko"]
[frame p="0%" x="0"]
[frame p="50%" x="10"]
[frame p="100%" x="0"]
[endkeyframe]
[glyph line="nextpage.gif" easing="linear" keyframe="yoko"]
自分で定義したキーフレームアニメーションを適用[p]

:param
line = グリフに使用する画像を指定できます。画像ファイルは、デフォルトでは`tyrano/images/system`フォルダ（`nextpage.gif`があるフォルダ）から探されます。`folder`パラメータで変更可。,
fix  = `true`を指定すると、グリフがメッセージの末尾ではなくゲーム画面上の固定位置に表示されます。,
left = グリフを表示する横の位置を指定します。（`fix`属性を`true`にした場合に有効）,
top  = グリフを表示する縦の位置を指定します。（`fix`属性を`true`にした場合に有効）,

folder  = グリフの画像を探すフォルダを指定できます。,
width   = グリフの横幅をpx単位で指定できます。,
height  = グリフの高さをpx単位で指定できます。,
marginl = グリフの左側の余白をpx単位で指定できます。,
marginb = グリフの下側の余白をpx単位で指定できます。,
anim    = グリフに適用するアニメーションを以下のキーワードから指定できます。<br>`flash_momentary`(瞬間的な点滅)<br>`flash`(滑らかな点滅)<br>`spin_x`(X軸を中心に回転)<br>`spin_y`(Y軸を中心に回転)<br>`spin_z`(Z軸を中心に回転)<br>`bounce`(バウンド)<br>`rotate_bounce`(回転しながらバウンド)<br>`soft_bounce`(ぽよんと弾むバウンド)<br>`zoom`(拡縮),
time    = グリフに適用するアニメーションの時間をミリ秒単位で指定します。,
figure  = グリフに使用する図形を以下のキーワードから指定できます。<br>`circle`(円)<br>`triangle`(三角形)<br>`v_triangle`(下向き三角形)<br>`rectangle`(四角形)<br>`diamond`(ひし形)<br>`start`(星),
color   = グリフに図形を使用する場合に、図形の色を指定できます。,
name    = グリフに付けるクラス名を指定できます。（上級者向け）,
html    = グリフのコンテンツとしてHTMLを直接指定できます。（上級者向け）,

keyframe   = 適用するキーフレームアニメーションの`name`を指定します。`anim`と併用することはできません。,
easing     = アニメーションの変化パターンを指定できます。以下のキーワードが指定できます。<br>
`ease`(開始時点と終了時点を滑らかに再生する)<br>
`linear`(一定の間隔で再生する)<br>
`ease-in`(開始時点をゆっくり再生する)<br>
`ease-out`(終了時点をゆっくり再生する)<br>
`ease-in-out`(開始時点と終了時点をゆっくり再生する)<br>
この他に`cubic-bezier`関数を使って独自のイージングを指定することも可能です。,
count      =  再生回数を指定できます。`infinite`を指定することで無限ループさせることもできます。,
delay      =  開始までの時間を指定できます。初期値は`0`、つまり遅延なしです。,
direction  =  アニメーションを複数回ループさせる場合に、偶数回目のアニメーションを逆再生にするかを設定できます。偶数回目を逆再生にする場合は`alternate`を指定します。,
mode       =  アニメーションの最後のフレームの状態（位置、回転など）をアニメーション終了後も維持するかを設定できます。`forwards`(デフォルト)で維持。`none`を指定すると、アニメーション再生前の状態に戻ります。,

koma_anim      = グリフに使用するコマアニメの画像を指定できます。コマアニメに使用する画像は「すべてのコマが横並びで連結されたひとつの画像ファイル」である必要があります。,
koma_count     = コマアニメを使用する場合、画像に含まれるコマ数を指定します。これを指定した場合、`koma_width`を省略できます。,
koma_width     = コマアニメを使用する場合、1コマあたりの横幅をpx単位で指定します。これを指定した場合、`koma_count`を省略できます。,
koma_anim_time = コマアニメが1周するまでの時間をミリ秒単位で指定します。

:demo
1,kaisetsu/02_decotext

#[end]
*/

//指定した位置にグラフィックボタンを配置する
tyrano.plugin.kag.tag.glyph = {
    pm: {
        // 基本
        line: "nextpage.gif",
        layer: "message0",
        fix: "false",
        left: "0",
        top: "0",

        // 拡張
        name: "",
        folder: "tyrano/images/system",
        width: "",
        height: "",
        anim: "",
        time: "",
        figure: "",
        color: "0xFFFFFF",
        html: "",
        marginl: "3",
        marginb: "0",

        // クリック待ちグリフに[keyframe]タグで定義した
        // キーフレームアニメーションを適用したい場合のパラメータ
        keyframe: "",
        easing: "",
        count: "",
        delay: "",
        derection: "",
        mode: "",

        // 各コマを連結して1枚の画像にしたパラパラ漫画アニメーションを使用したい場合のパラメータ
        koma_anim: "",
        koma_count: "",
        koma_width: "",
        koma_anim_time: "1000",

        // クリック待ちグリフ、オートモードグリフ、スキップモードグリフ
        target: "",
    },

    start: function (pm) {
        //
        // 既存のグリフを削除する処理
        //

        // 固定グリフか？
        const fix = pm.fix === "true";
        // いままさに固定グリフが表示されていたか
        let is_fix_glyph_displayed = false;
        // 固定グリフ
        let j_fix_glyph;

        // 固定グリフは削除
        switch (pm.target) {
            default:
            case "":
                j_fix_glyph = $(".glyph_image");
                break;
            case "skip":
                j_fix_glyph = $("#mode_glyph_skip");
                break;
            case "auto":
                if (fix) {
                    j_fix_glyph = $("#mode_glyph_auto");
                }
                break;
        }

        if (j_fix_glyph && j_fix_glyph.length) {
            is_fix_glyph_displayed = j_fix_glyph.isDisplayed();
            j_fix_glyph.remove();
        }

        //
        // グリフタイプを決定
        //

        if (pm.figure) {
            pm.type = "figure";
        } else if (pm.html) {
            pm.type = "html";
        } else if (pm.koma_anim) {
            pm.type = "koma_anim";
        } else {
            pm.type = "image";
        }

        // キーフレームが設定されている場合はanimを無視
        if (pm.keyframe) {
            pm.anim = "";
        }

        // 情報を格納
        // glyph_pm, glyph_skip_pm, glyph_auto_pm, glyph_auto_next_pm
        const glyph_key = this.kag.ftag.getGlyphKey(pm.target, fix);
        this.kag.stat[glyph_key] = $.extend({}, pm);

        if (!pm.target) {
            // 旧実装のフォールバック
            this.kag.stat.path_glyph = pm.line;
            this.kag.stat.flag_glyph = pm.fix;
        }

        // 画面上固定タイプか、メッセージ末尾タイプか
        if (fix) {
            // 画面上固定タイプ
            // もう作っておいて非表示で画面上に配置しちゃおう
            const j_next = this.kag.ftag.createNextImg(pm.target);
            j_next.setStyleMap({
                "position": "absolute",
                "z-index": "9998",
                "top": pm.top + "px",
                "left": pm.left + "px",
                "display": "none",
            });
            this.kag.layer.getLayer(pm.layer).append(j_next);

            // この[glyph]タグを通過する直前までグリフが表示されていたなら
            // 新しく作り直したグリフも表示する
            if (is_fix_glyph_displayed) j_next.show();
        }

        // コマアニメを使用しない場合は早期リターン
        if (!pm.koma_anim) {
            this.nextOrder(pm);
            return;
        }

        // コマアニメを使用する場合
        // 画像幅を取得したいのでプリロードする
        this.kag.preload($.parseStorage(pm.koma_anim, pm.folder), (img) => {
            if (!img) {
                this.nextOrder(pm);
                return;
            }
            pm.image_width = img.naturalWidth;
            pm.image_height = img.naturalHeight;
            pm.koma_height = pm.image_height;
            // コマ数が指定されている場合、コマ数からコマ幅を計算
            if (pm.koma_count) {
                pm.koma_count = parseInt(pm.koma_count);
                pm.koma_width = Math.round(pm.image_width / pm.koma_count);
            }
            // コマ幅が指定されている場合、コマ幅からコマ数を計算
            if (pm.koma_width) {
                pm.koma_width = parseInt(pm.koma_width);
                pm.koma_count = Math.round(pm.image_width / pm.koma_width);
            }
            // 画像幅あるいは高さの指定がある場合はスケーリングする必要がある
            pm.scale_x = 1;
            pm.scale_y = 1;
            if (pm.width && !pm.height) {
                // widthだけが指定されている
                pm.scale_x = parseInt(pm.width) / pm.koma_width;
                pm.scale_y = pm.scale_x;
            } else if (!pm.width && pm.height) {
                // heightだけが指定されているいる
                pm.scale_y = parseInt(pm.height) / pm.koma_height;
                pm.scale_x = pm.scale_y;
            } else if (pm.width && pm.height) {
                // widthとheightが指定されている
                pm.scale_x = parseInt(pm.width) / pm.koma_width;
                pm.scale_y = parseInt(pm.height) / pm.koma_height;
            }
            // スケーリング
            pm.image_width = parseInt(pm.image_width * pm.scale_x);
            pm.image_height = parseInt(pm.image_height * pm.scale_x);
            pm.koma_width = parseInt(pm.koma_width * pm.scale_x);
            pm.koma_height = parseInt(pm.koma_height * pm.scale_x);
            this.kag.stat[glyph_key] = $.extend({}, pm);
            this.nextOrder(pm);
        });
    },

    // next="false" が渡されているときは nextOrder しない
    nextOrder(pm) {
        if (pm.next !== "false") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[glyph_skip]

:group
システムデザイン変更

:title
スキップモードグリフの設定

:exp
スキップモード中に表示されるグリフを設定できます。

・`use`パラメータを指定したとき
・`delete`パラメータを指定したとき
・どちらも指定しなかったとき

の3パターンで動作が異なります。

`use`パラメータを指定した場合、`[ptext]`などですでに画面上に出している要素をスキップモードグリフにすることができます。

`delete`パラメータを指定した場合、以前の`[glyph_skip]`で設定した定義を削除することができます。

どちらも指定しなかった場合は`[glyph]`と同等の処理を行います。

:param
use    = すでに画面上に出ている要素をスキップモード中のグリフとして扱うようにできます。`[ptext]`や`[image]`に設定した`name`をここに指定します。
delete = `true`を指定した場合、グリフの定義を削除する処理を実行します。
その他 = `[glyph]`と同じパラメータが指定できます。ただし`fix`パラメータは`true`で固定されます。

:sample
;固定スキップモードグリフ、固定オートモードグリフを設定
[glyph_skip fix="true" left="10" top="10" figure="diamond" anim="flash"  color="orange" time="400" width="80"]
[glyph_auto fix="true" left="10" top="10" figure="star"    anim="spin_y" color="green" time="5000" width="80"]

;オートモードグリフについては、
;固定グリフと同時にメッセージ末尾型のオートモードグリフも設定できる
[glyph_auto html="⌛" anim="flash"]

;[ptext]で出した文字をスキップグリフ、オートグリフとして扱うパターン
[ptext     name="glyph_skip" layer="message0" x="20" y="10" text="SKIP!" edge="4px orange" size="30"]
[ptext     name="glyph_auto" layer="message0" x="20" y="10" text="AUTO" edge="4px green" size="30"]
[glyph_skip use="glyph_skip"]
[glyph_auto use="glyph_auto"]

;上記のすべての設定を抹消する
[glyph_auto delete="true" fix="true"]
[glyph_auto delete="true" fix="false"]
[glyph_skip delete="true"]

#[end]
*/

//指定した位置にグラフィックボタンを配置する
tyrano.plugin.kag.tag.glyph_skip = {
    start: function (pm) {
        if (pm.delete === "true") {
            $("#mode_glyph_skip").remove();
            delete this.kag.stat.glyph_auto_pm;
            this.kag.ftag.nextOrder();
            return;
        }

        if (pm.use) {
            $("#mode_glyph_skip").remove();
            const j_glyph = $("." + pm.use).eq(0);
            if (j_glyph.length) {
                j_glyph.attr("id", "mode_glyph_skip");
                if (this.kag.stat.is_skip) {
                    j_glyph.show();
                } else {
                    j_glyph.hide();
                }
            }
            this.kag.ftag.nextOrder();
            return;
        }

        pm.target = "skip";
        pm.fix = "true";
        this.kag.ftag.startTag("glyph", pm);
    },
};

/*
#[glyph_auto]

:group
システムデザイン変更

:title
オートモードグリフの設定

:exp
オートモード中に表示されるグリフを設定できます。

・`use``use``use`パラメータを指定したとき
・`delete`パラメータを指定したとき
・どちらも指定しなかったとき

の3パターンで動作が異なります。

`use`パラメータを指定した場合、`[ptext]`などですでに画面上に出している要素を画面固定のオートモードグリフにすることができます。

`delete`パラメータを指定した場合、以前の`[glyph_auto]`で設定した定義を削除することができます。

どちらも指定しなかった場合は`[glyph]`と同等の処理を行います。

:param
fix    = 画面固定グリフの設定をするなら`true`、メッセージ末尾のグリフの設定をするなら`false`を指定します。オートモードグリフに限り、固定グリフと非固定グリフを両方設定できます。
use    = すでに画面上に出ている要素を画面固定グリフとして扱うようにできます。`[ptext]`や`[image]`に設定した`name`をここに指定します。
delete = `true`を指定した場合、グリフの定義を削除する処理を実行します。
その他 = `[glyph]`と同じパラメータが指定できます。

#[end]
*/

//指定した位置にグラフィックボタンを配置する
tyrano.plugin.kag.tag.glyph_auto = {
    start: function (pm) {
        if (pm.delete === "true") {
            if (pm.fix === "true") {
                $("#mode_glyph_auto").remove();
                delete this.kag.stat.glyph_auto_pm;
            } else {
                delete this.kag.stat.glyph_auto_next_pm;
            }
            this.kag.ftag.nextOrder();
            return;
        }

        if (pm.use) {
            $("#mode_glyph_auto").remove();
            const j_glyph = $("." + pm.use).eq(0);
            if (j_glyph.length) {
                j_glyph.attr("id", "mode_glyph_auto");
                if (this.kag.stat.is_auto) {
                    j_glyph.show();
                } else {
                    j_glyph.hide();
                }
            }
            this.kag.ftag.nextOrder();
            return;
        }

        pm.target = "auto";
        this.kag.ftag.startTag("glyph", pm);
    },
};

//スタイル変更は未サポート
/*
tyrano.plugin.kag.tag["style"] = {

pm:{

},

start:function(pm){

}
};
*/

/*
#[trans]

:group
画像・背景・レイヤ操作

:title
レイヤのトランジション

:exp
指定したレイヤでトランジションを行います。

指定したレイヤに対して、裏ページの内容を表ページに持ってくる処理を行います。トランジション後の表ページの内容（画像、位置、サイズ、表示状態など）はもとの裏ページと同一になります。

トランジション中はレイヤの属性変更などは行わないでください。

:sample
[backlay]
[image storage=fg0 layer=0 page=back]
[trans time=1500 ]
[wt]

:param
layer    = 対象となるレイヤを指定します。`base`を指定すると背景レイヤ、`0`以上の整数を指定すると前景レイヤ、`message0`や`message1`を指定するとメッセージレイヤを指定できます。`message`とのみ指定した場合は、`[current]`タグで指定した現在の操作対象のメッセージレイヤが対象になります。（通常は背景の変更などに使用されます）,
time     = トランジション時間をミリ秒で指定します。,
method  = <p>切り替えのタイプを指定します。デフォルトは`fadeIn`です。指定できる演出は次の通りです。</p><p>
【V450以降】`fadeIn``fadeInDown``fadeInLeft``fadeInRight``fadeInUp``lightSpeedIn``rotateIn``rotateInDownLeft``rotateInDownRight``rotateInUpLeft``rotateInUpRight``zoomIn``zoomInDown``zoomInLeft``zoomInRight``zoomInUp``slideInDown``slideInLeft``slideInRight``slideInUp``bounceIn ``bounceInDown``bounceInLeft``bounceInRight``bounceInUp``rollIn``vanishIn``puffIn`</p><p>
【V450以前】`crossfade``explode``slide``blind``bounce``clip``drop``fold``puff``scale``shake``size`</p>,
children = 【廃止】`false`の場合、`layer`で指定した場所だけトランジションします。デフォルトは`false`です。

:demo
1,kaisetsu/03_layer

#[end]
*/

//トランジション
tyrano.plugin.kag.tag.trans = {
    vital: ["time", "layer"],

    pm: {
        layer: "base",
        method: "fadeIn",
        children: false,
        time: 1500,
    },

    start: function (pm) {
        this.kag.ftag.hideNextImg();
        this.kag.stat.is_trans = true;
        var that = this;

        //backを徐々に表示して、foreを隠していく。
        //アニメーションが終わったら、back要素を全面に配置して完了

        //指定したレイヤーのみ、フェードする

        var comp_num = 0;
        var layer_num = $.countObj(this.kag.layer.map_layer_fore);

        //ここがチルドレンの場合、必ず即レイヤ実行ね
        if (pm.children == "false") {
            layer_num = 0;
        }

        var map_layer_fore = $.cloneObject(this.kag.layer.map_layer_fore);
        var map_layer_back = $.cloneObject(this.kag.layer.map_layer_back);

        for (let key in map_layer_fore) {
            //指定条件のレイヤのみ実施
            if (pm.children == true || key === pm.layer) {
                (function () {
                    var _key = key;

                    var layer_fore = map_layer_fore[_key];
                    var layer_back = map_layer_back[_key];

                    //メッセージレイヤの場合、カレント以外はトランスしない。むしろ非表示
                    //if((_key.indexOf("message")!=-1 && _key !== that.kag.stat.current_layer) || (_key.indexOf("message")!=-1 && layer_back.attr("l_visible") == "false") ){

                    if (_key.indexOf("message") != -1 && layer_back.attr("l_visible") == "false") {
                        comp_num++;
                        that.kag.layer.forelay(_key);
                    } else {
                        /*
                        $.trans_old(pm.method, layer_fore, parseInt(pm.time), "hide", function() {
                        });
                        layer_back.css("display", "none");
                        */

                        $.trans(pm.method, layer_back, parseInt(pm.time), "show", function () {
                            comp_num++;
                            that.kag.layer.forelay(_key);

                            that.kag.ftag.completeTrans();

                            that.kag.ftag.hideNextImg();
                        });
                    }
                })();
            }
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[bg]

:group
画像・背景・レイヤ操作

:title
背景の切り替え

:exp
背景の切り替えを簡易的に実行できます。
常に`fore`のレイヤに対して切り替えが実行されます。

:sample
[bg storage=fg0.png time=1500 wait=true]

:param
storage  = 画像ファイル名を指定します。ファイルは`data/bgimage`に配置してください,
time    = 背景の切り替えにかける時間をミリ秒で指定します。,
wait    = 背景の切り替えを待つかどうか。`true`または`false`で指定します。`false`を指定すると、切り替えの完了を待たずに次のタグに進みます。,
cross    = `true`または`false`を指定します。デフォルトは`false`。`true`を指定すると、2つの画像が同じタイミングで透明になりながら入れ替わります。`false`を指定すると、古い背景を残しながら上に重ねる形で新しい背景を表示します。CG差分などで使用する場合は`false`が良いでしょう。,
position = 省略すると、画像がゲーム画面いっぱいに引き伸ばされます（比率は崩れる）。この値を指定すると、背景画像と画面サイズの比率が異なる場合に、比率を崩さずに背景を配置できます。配置位置を次のキーワードから選択してください。`left`(左寄せ)、`center`(中央寄せ)、`right`(右寄せ)、`top`(上寄せ)、`bottom`(下寄せ),
method  = <p>切り替えのタイプを指定します。デフォルトは`fadeIn`です。指定できる演出は次の通りです。</p><p>
【V450以降】`fadeIn``fadeInDown``fadeInLeft``fadeInRight``fadeInUp``lightSpeedIn``rotateIn``rotateInDownLeft``rotateInDownRight``rotateInUpLeft``rotateInUpRight``zoomIn``zoomInDown``zoomInLeft``zoomInRight``zoomInUp``slideInDown``slideInLeft``slideInRight``slideInUp``bounceIn ``bounceInDown``bounceInLeft``bounceInRight``bounceInUp``rollIn``vanishIn``puffIn`</p><p>
【V450以前】`crossfade``explode``slide``blind``bounce``clip``drop``fold``puff``scale``shake``size`</p>

:demo
1,kaisetsu/04_bg

#[end]
*/

//背景変更
tyrano.plugin.kag.tag.bg = {
    vital: ["storage"],

    pm: {
        storage: "",
        method: "crossfade",
        wait: "true",
        time: 3000,
        cross: "false",
        position: "",
    },

    start: function (pm) {
        this.kag.ftag.hideNextImg();

        var that = this;

        // time=0 and wait=true conflicts
        // may be some code refactor needed
        if (pm.time == 0) pm.wait = "false";

        //現在の背景画像の要素を取得

        //クローンして、同じ階層に配置する

        var storage_url = "./data/bgimage/" + pm.storage;
        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        }

        //jqyeru で一つを削除して、もう一方を復活させる
        this.kag.preload(storage_url, function () {
            var j_old_bg = that.kag.layer.getLayer("base", "fore");
            var j_new_bg = j_old_bg.clone(false);

            j_new_bg.css("background-image", "url(" + storage_url + ")");
            j_new_bg.css("display", "none");

            if (pm.position != "") {
                j_new_bg.css("background-size", "cover");
                j_new_bg.css("background-position", pm.position);
            }

            j_old_bg.after(j_new_bg);

            that.kag.ftag.hideNextImg();
            that.kag.layer.updateLayer("base", "fore", j_new_bg);

            if (pm.wait == "true") {
                that.kag.weaklyStop();
            }

            //スキップ中は時間を短くする
            pm.time = that.kag.cutTimeWithSkip(pm.time);

            if (pm.cross == "true") {
                //crossがfalseの場合は、古い背景はtransしない。
                $.trans(pm.method, j_old_bg, parseInt(pm.time), "hide", function () {
                    j_old_bg.remove();
                });
            }

            $.trans(pm.method, j_new_bg, parseInt(pm.time), "show", function () {
                j_new_bg.css("opacity", 1);

                //crossがfalseの場合は、古い背景画像を削除
                if (pm.cross == "false") {
                    j_old_bg.remove();
                }

                if (pm.wait == "true") {
                    that.kag.cancelWeakStop();
                    that.kag.ftag.nextOrder();
                }
            });

            //レイヤの中で、画像を取得する
        });

        if (pm.wait == "false") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[bg2]

:group
画像・背景・レイヤ操作

:title
背景の切り替え

:exp
背景の切り替えを簡易的に実行できます。
常に`fore`のレイヤに対して切り替えが実行されます。

:sample
[bg storage=fg0.png time=1500 wait=true]

:param
name    = !!,
storage = 画像ファイルの名前を指定します。ファイルは`data/bgimage`以下に配置します。,
left    = !!,
top     = !!,
width   = 画像の横幅をピクセル単位で指定します。省略すると、ゲーム画面いっぱいに引き伸ばされます。,
height  = 画像の高さ位置をピクセル単位で指定します。省略すると、ゲーム画面いっぱいに引き伸ばされます。,
time    = 背景の切り替えにかける時間をミリ秒で指定します。,
wait    = 背景の切り替えを待つかどうか。`true`または`false`で指定します。`false`を指定すると、切り替えの完了を待たずに次のタグに進みます。,
cross   = `true`または`false`を指定します。デフォルトは`false`。`true`を指定すると、2つの画像が同じタイミングで透明になりながら入れ替わります。`false`を指定すると、古い背景を残しながら上に重ねる形で新しい背景を表示します。CG差分などで使用する場合は`false`が良いでしょう。,
method  = <p>切り替えのタイプを指定します。デフォルトは`fadeIn`です。指定できる演出は次の通りです。</p><p>
【V450以降】`fadeIn``fadeInDown``fadeInLeft``fadeInRight``fadeInUp``lightSpeedIn``rotateIn``rotateInDownLeft``rotateInDownRight``rotateInUpLeft``rotateInUpRight``zoomIn``zoomInDown``zoomInLeft``zoomInRight``zoomInUp``slideInDown``slideInLeft``slideInRight``slideInUp``bounceIn ``bounceInDown``bounceInLeft``bounceInRight``bounceInUp``rollIn``vanishIn``puffIn`</p><p>
【V450以前】`crossfade``explode``slide``blind``bounce``clip``drop``fold``puff``scale``shake``size`</p>


#[end]
*/

//背景変更
tyrano.plugin.kag.tag.bg2 = {
    vital: ["storage"],

    pm: {
        name: "",
        storage: "",
        method: "crossfade",
        wait: "true",
        time: 3000,

        width: "",
        height: "",
        left: "",
        top: "",

        cross: "false",
    },

    start: function (pm) {
        this.kag.ftag.hideNextImg();

        var that = this;

        // time=0 and wait=true conflicts
        // may be some code refactor needed
        if (pm.time == 0) pm.wait = "false";

        //現在の背景画像の要素を取得

        //クローンして、同じ階層に配置する
        var storage_url = "./data/bgimage/" + pm.storage;
        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        }

        //jquery で一つを削除して、もう一方を復活させる
        this.kag.preload(storage_url, function () {
            var j_old_bg = that.kag.layer.getLayer("base", "fore");
            var j_new_bg = j_old_bg.clone(false);

            //オブジェクトに変更
            var j_bg_img = $("<img />");
            j_bg_img.css("position", "absolute");

            var scWidth = parseInt(that.kag.config.scWidth);
            var scHeight = parseInt(that.kag.config.scHeight);
            var left = 0;
            var top = 0;

            if (pm.width != "") {
                scWidth = parseInt(pm.width);
            }

            if (pm.height != "") {
                scHeight = parseInt(pm.height);
            }

            if (pm.left != "") {
                left = parseInt(pm.left);
            }

            if (pm.top != "") {
                top = parseInt(pm.top);
            }

            j_bg_img.css({
                width: scWidth,
                height: scHeight,
                left: left,
                top: top,
            });

            j_bg_img.attr("src", storage_url);

            $.setName(j_new_bg, pm.name);

            j_new_bg.find("img").remove();
            j_new_bg.append(j_bg_img);

            ////ここまで
            j_new_bg.css("display", "none");

            j_old_bg.after(j_new_bg);

            that.kag.ftag.hideNextImg();
            that.kag.layer.updateLayer("base", "fore", j_new_bg);

            if (pm.wait == "true") {
                that.kag.weaklyStop();
            }

            //スキップ中は時間を短くする
            pm.time = that.kag.cutTimeWithSkip(pm.time);

            if (pm.cross == "true") {
                //crossがfalseの場合は、古い背景はtransしない。
                $.trans(pm.method, j_old_bg, parseInt(pm.time), "hide", function () {
                    j_old_bg.remove();
                });
            }

            $.trans(pm.method, j_new_bg, parseInt(pm.time), "show", function () {
                j_new_bg.css("opacity", 1);

                //crossがfalseの場合は、古い背景画像を削除
                if (pm.cross == "false") {
                    j_old_bg.remove();
                }

                if (pm.wait == "true") {
                    that.kag.cancelWeakStop();
                    that.kag.ftag.nextOrder();
                }
            });

            //レイヤの中で、画像を取得する
        });

        if (pm.wait == "false") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[layermode]

:group
演出・効果・動画

:title
レイヤーモード

:exp
ゲーム画面上に画像を合成できます。乗算、スクリーン、オーバーレイなどの合成方法を選べます。

IEなど一部の古いブラウザでは動作しないため、ブラウザゲームとして公開する場合は注意してください。PCアプリとして出力するゲームで使用することを推奨。

:sample
[layermode graphic=fg0.png time=1500 mode=overlay]

:param
name    = 合成する画像につける名前を指定します。ここで指定した名前は`[free_layremovde]`で特定の合成のみを消したい際に使用します。,
graphic = 合成する画像ファイルを指定します。ファイルは`image`フォルダに配置します。,
color   = 画像を使わず単色を合成することもできます。その場合、このパラメータに合成色を`0xRRGGBB`形式で指定します。,
mode    = 合成方法を指定できます。以下のキーワードが指定できます。<br>`multiply`(乗算)<br>`screen`(スクリーン)<br>`overlay`(オーバーレイ)<br>`darken`(暗く)<br>`lighten`(明るく)<br>`color-dodge`(覆い焼きカラー)<br>`color-burn`(焼き込みカラー)<br>`hard-light`(ハードライト)<br>`soft-light`(ソフトライト)<br>`difference`(差の絶対値)<br>`exclusion`(除外)<br>`hue`(色相)<br>`saturation`(彩度)<br>`color`(カラー)<br>`luminosity`(輝度),
folder  = `graphic`で指定する画像のフォルダを変更できます。たとえば`bgimage`と指定すると`bgimage`から画像を取得します。,
opacity = !!,
time    = !!fadein,
wait    = !!fadein

:demo
2,kaisetsu/02_layermode

#[end]
*/

//背景変更
tyrano.plugin.kag.tag.layermode = {
    vital: [],

    pm: {
        name: "", //レイヤーモードに名前をつけることができます。
        graphic: "", //画像をブレンドする場合は指定する。カンマで区切って複数指定にも対応。 image指定
        color: "", //色をブレンドする場合
        mode: "multiply", //multiply（乗算）,screen（スクリーン）,overlay（オーバーレイ）,darken（暗く）,lighten（明るく）,color-dodge（覆い焼きカラー）,color-burn（焼き込みカラー）,hard-light（ハードライト）,soft-light（ソフトライト）,difference（差の絶対値）,exclusion（除外）,hue（色相）,saturation（彩度）,color（カラー）,luminosity（輝度）
        folder: "",
        opacity: "", //opacity=メッセージレイヤの不透明度を 0 ～ 255 の数値で指定しま す(文字の不透明度や、レイヤ自体の不透明度ではありません)。0 で完全 に透明です。,
        time: "500", //時間,
        wait: "true", //演出の終わりを待つかどうか
    },

    start: function (pm) {
        this.kag.ftag.hideNextImg();

        var that = this;

        var blend_layer = null;

        blend_layer = $(
            "<div class='layer_blend_mode blendlayer' style='display:none;position:absolute;width:100%;height:100%;z-index:99'></div>",
        );

        if (pm.name != "") {
            blend_layer.addClass("layer_blend_" + pm.name);
        }

        if (pm.color != "") {
            blend_layer.css("background-color", $.convertColor(pm.color));
        }

        if (pm.opacity != "") {
            blend_layer.css("opacity", $.convertOpacity(pm.opacity));
        }

        let folder;
        if (pm.folder != "") {
            folder = pm.folder;
        } else {
            folder = "image";
        }

        var storage_url = "";

        if (pm.graphic != "") {
            storage_url = "./data/" + folder + "/" + pm.graphic;
            blend_layer.css("background-image", "url(" + storage_url + ")");
        }

        blend_layer.css("mix-blend-mode", pm.mode);

        $("#tyrano_base").append(blend_layer);

        //j_new_bg.css("background-image","url("+storage_url+")");

        //background: #0bd url(beach-footprint.jpg) no-repeat;
        //background-blend-mode: screen;

        if (pm.graphic != "") {
            this.kag.preload(storage_url, function () {
                blend_layer.stop(true, true).fadeIn(parseInt(pm.time), function () {
                    if (pm.wait == "true") {
                        that.kag.ftag.nextOrder();
                    }
                });
            });
        } else {
            blend_layer.stop(true, true).fadeIn(parseInt(pm.time), function () {
                if (pm.wait == "true") {
                    that.kag.ftag.nextOrder();
                }
            });
        }

        if (pm.wait == "false") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[layermode_movie]

:group
演出・効果・動画

:title
レイヤーモード（動画）

:exp
ゲーム画面上に動画レイヤを合成できます。IEなど一部の古いブラウザでは動作しないため、ブラウザゲームとして公開する場合は注意してください。

合成した動画を消去するためには`[free_layermode]`タグを使用します。

<b>`mp4`形式推奨</b>。`ogv``webm`形式にも対応します。

ブラウザゲームとして出力する場合、ブラウザによってはサポートしない動画形式があるので注意してください。特に、<b>`webm`形式はSafariでは動作しません</b>。

また、`mp4`形式はFireFoxやOperaでは動作しません。このとき、もし`mp4`ファイルと同じ場所に同名の`webm`ファイルがある場合は自動的にそちらを選択します。

:sample
[layermode_movie video=test.webm time=1500 wait=true]

:param
name    = 合成するレイヤに名前をつけることができます。この名前は`[free_layremovde]`タグで特定の合成レイヤのみを消したい場合に使用します。,
video   = 合成する動画ファイルを指定します。ファイルはdata/videoフォルダに配置します。,
volume  = 合成する動画の音量を`0`〜`100`で指定します。,
mute    = 動画の音をミュートするかどうか。`true`または`false`で指定します。ブラウザ上では動画を再生する前にユーザアクション（タップなど）が必要という制限がありますが、`true`を指定することでこの制限を無視できます。,
loop    = 動画をループするかどうか。`true`または`false`で指定します。デフォルトは`true`。ループ指定した場合、`[free_layermode]`を行うまで演出が残ります。,
speed   = 動画の再生スピードを指定できます。`2`を指定すると2倍速、`0.5`を指定すると半分の速度で再生されます。,
mode    = 合成方法を指定できます。デフォルトは「multiply」 次の効果が使えます→ multiply（乗算）screen（スクリーン）overlay（オーバーレイ）darken（暗く）lighten（明るく）color-dodge（覆い焼きカラー）color-burn（焼き込みカラー）hard-light（ハードライト）soft-light（ソフトライト）difference（差の絶対値）exclusion（除外）hue（色相）saturation（彩度）color（カラー）luminosity（輝度）,
opacity = !!,
time    = フェードイン時間をミリ秒単位で指定します。,
left    = 合成レイヤの位置を指定できます。（ピクセル）,
top     = 合成レイヤの位置を指定できます。（ピクセル）,
width   = 合成レイヤの横幅を指定します。（ピクセル）,
height  = 合成レイヤの高さを指定します。（ピクセル）,
fit     = 合成レイヤをゲーム画面いっぱいに引き伸ばすかどうか。`true`または`false`で指定します。,
wait    = 合成した動画の再生完了を待つかどうか。`true`または`false`で指定します。

:demo
2,kaisetsu/03_layermode_movie

#[end]
*/

//背景変更
tyrano.plugin.kag.tag.layermode_movie = {
    vital: ["video"],

    pm: {
        name: "",
        mode: "multiply",
        opacity: "",
        time: "500", //時間,
        wait: "false", //演出の終わりを待つかどうか
        video: "", //ビデオをレイヤーとして追加する。
        volume: "",
        loop: "true",
        mute: "false",
        speed: "",

        fit: "true",

        width: "",
        height: "",
        top: "",
        left: "",

        stop: "false", //trueでnextorderを無効化。ロード復帰の時用
    },

    start: function (pm) {
        this.kag.ftag.hideNextImg();

        var that = this;

        var blend_layer = null;

        blend_layer = $(
            "<video class='layer_blend_mode blendlayer blendvideo' data-video-name='" +
                pm.name +
                "' data-video-pm='' style='display:none;position:absolute;width:100%;height:100%;z-index:99' ></video>",
        );
        var video = blend_layer.get(0);
        var url = "./data/video/" + pm.video;

        video.src = url;

        if (pm.volume != "") {
            video.volume = parseFloat(parseInt(pm.volume) / 100);
        } else {
            video.volume = 0;
        }

        if (pm.speed != "") {
            video.defaultPlaybackRate = parseFloat(pm.speed);
        }

        video.style.backgroundColor = "black";
        video.style.position = "absolute";
        video.style.top = "0px";
        video.style.left = "0px";
        video.style.width = "auto";
        video.style.height = "auto";

        /*
        video.style.width = that.kag.config.scWidth+"px";
        video.style.height = that.kag.config.scHeight+"px";
        */

        if (pm.width != "") {
            video.style.width = pm.width + "px";
        }

        if (pm.height != "") {
            video.style.height = pm.height + "px";
        } else {
            if (pm.fit == "false") {
                video.style.height = "100%";
            } else {
                video.style.height = "";
            }
        }

        if (pm.left != "") {
            video.style.left = pm.left + "px";
        }

        if (pm.top != "") {
            video.style.top = pm.top + "px";
        }

        video.style.minHeight = "100%";
        video.style.minWidth = "100%";
        video.style.backgroundSize = "cover";

        video.autoplay = true;
        video.autobuffer = true;

        video.setAttribute("playsinline", "1");

        if (pm.mute == "true") {
            video.muted = true;
        }

        if (pm.loop == "true") {
            video.loop = true;
        } else {
            video.loop = false;
        }

        var j_video = $(video);

        //ビデオ再生完了時
        video.addEventListener("ended", function (e) {
            if (pm.loop == "false") {
                j_video.remove();
            }

            if (pm.wait == "true") {
                that.kag.ftag.nextOrder();
            }
        });

        j_video.attr("data-video-pm", JSON.stringify(pm));

        j_video.hide();

        video.load();
        video.play();

        blend_layer = j_video;

        if (pm.name != "") {
            blend_layer.addClass("layer_blend_" + pm.name);
        }

        if (pm.opacity != "") {
            blend_layer.css("opacity", $.convertOpacity(pm.opacity));
        }

        blend_layer.css("mix-blend-mode", pm.mode);

        $("#tyrano_base").append(blend_layer);

        blend_layer.stop(true, true).fadeIn(parseInt(pm.time), function () {
            if (pm.wait == "true" && pm.loop == "true") {
                if (pm.stop != "true") {
                    that.kag.ftag.nextOrder();
                }
            }
        });

        if (pm.wait == "false") {
            if (pm.stop != "true") {
                this.kag.ftag.nextOrder();
            }
        }
    },
};

/*
#[free_layermode]

:group
演出・効果・動画

:title
合成レイヤの消去

:exp
合成レイヤを消去します。

:sample
[free_layermode name="test"]

:param
name = 消去する合成レイヤの`name`を指定します。省略すると、すべての合成レイヤが消去されます。,
time = フェードアウト時間をミリ秒で指定します。,
wait = !!fadeout

:demo
2,kaisetsu/02_layermode

#[end]
*/

//背景変更
tyrano.plugin.kag.tag.free_layermode = {
    vital: [],

    pm: {
        name: "", //レイヤーモードに名前をつけることができます。
        time: "500", //時間,
        wait: "true", //演出の完了を待つかどうか
    },

    start: function (pm) {
        this.kag.ftag.hideNextImg();

        var that = this;

        var blend_layer = {};

        if (pm.name != "") {
            blend_layer = $(".layer_blend_" + pm.name);
        } else {
            blend_layer = $(".blendlayer");
        }

        var cnt = blend_layer.length;
        var n = 0;

        //フリーにするレイヤがない場合
        if (cnt == 0) {
            that.kag.ftag.nextOrder();
            return;
        }

        blend_layer.each(function () {
            var blend_obj = $(this);
            blend_obj.stop(true, true).fadeOut(parseInt(pm.time), function () {
                blend_obj.remove();
                n++;
                if (pm.wait == "true") {
                    if (cnt == n) {
                        that.kag.ftag.nextOrder();
                    }
                }
            });
        });

        if (pm.wait == "false") {
            this.kag.ftag.nextOrder();
        }
    },
};
