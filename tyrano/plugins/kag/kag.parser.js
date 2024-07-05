tyrano.plugin.kag.parser = {
    tyrano: null,
    kag: null,

    flag_script: false, //スクリプト解析中なら
    deep_if: 0,

    init: function () {
        //alert("kag.parser 初期化");
        //this.tyrano.test();
    },

    loadConfig: function (call_back) {
        var that = this;

        //同じディレクトリにある、KAG関連のデータを読み込み
        $.loadText("./data/system/Config.tjs", function (text_str) {
            var map_config = that.compileConfig(text_str);

            if (call_back) {
                call_back(map_config);
            }
        });
    },

    //コンフィグファイルをデータ構造に格納
    compileConfig: function (text_str) {
        var error_str = "";
        var map_config = {};

        var array_config = text_str.split("\n");

        for (var i = 0; i < array_config.length; i++) {
            try {
                var line_str = $.trim(array_config[i]);
                if (line_str != "" && line_str.substr(0, 1) === ";") {
                    var tmp_comment = line_str.split("//");
                    if (tmp_comment.length > 1) {
                        line_str = $.trim(tmp_comment[0]);
                    }

                    line_str = $.replaceAll(line_str, ";", "");
                    line_str = $.replaceAll(line_str, '"', "");

                    var tmp = line_str.split("=");

                    var key = $.trim(tmp[0]);
                    var val = $.trim(tmp[1]);
                    map_config[key] = val;
                }
            } catch (e) {
                error_str += "Error:Config.tjsに誤りがあります/行:" + i + "";
            }
        }

        if (error_str != "") {
            alert(error_str);
        }

        return map_config;
    },

    //シナリオをオブジェクト化する
    parseScenario: function (text_str) {
        var array_s = [];

        var map_label = {}; //ラベル一覧

        var array_row = text_str.split("\n");

        var flag_comment = false; //コメント中なら

        for (var i = 0; i < array_row.length; i++) {
            var line_str = $.trim(array_row[i]);
            var first_char = line_str.substr(0, 1);

            if (line_str.indexOf("endscript") != -1) {
                this.flag_script = false;
            }

            //コメントの場合は無視する
            if (flag_comment === true && line_str === "*/") {
                //ブロックコメント解除
                //"*/"単独ではない場合、たとえば"hoge */"とか"*/ hoge"のような行ではブロックコメントは解除されない
                flag_comment = false;
            } else if (line_str === "/*") {
                //ブロックコメント開始
                //やはり"/*"単独の行でないと認識されない
                flag_comment = true;
            } else if (flag_comment == true || first_char === ";") {
                //コメントは無視
            } else if (first_char === "#") {
                //キャラ名
                //#akane:happy
                //↑を↓に変換する
                //[chara_ptext name=akane face=happy]
                var tmp_line = $.trim(line_str.replace("#", ""));
                var chara_name = "";
                var chara_face = "";
                if (tmp_line.split(":").length > 1) {
                    var array_line = tmp_line.split(":");
                    chara_name = array_line[0];
                    chara_face = array_line[1];
                } else {
                    chara_name = tmp_line;
                }
                //キャラクターボックスへの名前表示
                var text_obj = {
                    line: i,
                    name: "chara_ptext",
                    pm: { name: chara_name, face: chara_face },
                    val: "",
                };

                array_s.push(text_obj);
            } else if (first_char === "*") {
                //ラベル
                //*opening|オープニング
                //↑を↓に変換する
                //[label label_name=opening val=オープニング]
                var label_tmp = line_str.substr(1, line_str.length).split("|");

                var label_key = "";
                var label_val = "";

                label_key = $.trim(label_tmp[0]);

                if (label_tmp.length > 1) {
                    label_val = $.trim(label_tmp[1]);
                }

                var label_obj = {
                    name: "label",
                    pm: {
                        line: i,
                        index: array_s.length,
                        label_name: label_key,
                        val: label_val,
                    },
                    val: label_val,
                };

                //ラベル
                array_s.push(label_obj);

                if (map_label[label_obj.pm.label_name]) {
                    //ラベルの重複はエラー
                    this.kag.warning("duplicate_label", { name: label_obj.pm.label_name });
                } else {
                    map_label[label_obj.pm.label_name] = label_obj.pm;
                }
            } else if (first_char === "@") {
                //タグ
                //残りの部分をごそっと回す
                const tag_str = line_str.substr(1, line_str.length); // "image split=2 samba = 5"
                const tmpobj = this.makeTag(tag_str, i);
                array_s.push(tmpobj);
            } else {
                //テキストか[]記法のタグ
                //テキストは[iscript]内のJavaScriptや[html]内のHTMLである可能性がある

                //先頭の半角アンダーバーは空白を除去しないという特殊記号なので排除
                if (first_char === "_") {
                    line_str = line_str.substring(1, line_str.length);
                }

                //１文字ずつバラして解析していく
                let array_char = line_str.split("");
                let text = ""; // テキスト文字（[iscript][html]内のテキストを含む）
                let tag_str = ""; // タグ文字 例）ptext x=0 y=0 text="hogehoge[][]'''"
                let scanning_tag = false; // タグ解析中かどうか
                let deep_kakko = 0; // [ の深さ
                //↑exp属性の中で配列[]を使用した場合などに、配列の"]"を閉じタグの"]"として解釈しないようにするために必要
                let start_quot = ""; // クォートが始まってから終わるまで
                let flag_escape = false; // エスケープフラグ バックスラッシュでフラグが立つ

                for (var j = 0; j < array_char.length; j++) {
                    var c = array_char[j];

                    if (this.flag_script) {
                        // [iscript]解析中は単に足す
                        text += c;
                    } else if (scanning_tag) {
                        // タグ解析中の場合
                        if (c === "]") {
                            // タグ解析中 → 閉じタグ ] に遭遇した！
                            if (start_quot !== "") {
                                // クォート内部ならどうでもよい
                                // 例) [ptext text="[[あああ]]"] ← こういうのに対応
                                tag_str += c;
                            } else {
                                // 1段表層に浮かび上がる
                                deep_kakko--;
                                if (deep_kakko === 0) {
                                    // 最表層に戻ってきたときにタグ文字列が完成する！makeTagに投げる
                                    scanning_tag = false;
                                    array_s.push(this.makeTag(tag_str, i));
                                    tag_str = "";
                                    start_quot = "";
                                } else {
                                    // まだ最表層ではないなら単に足す
                                    // 例) [ptext text=[[あああ]] ] ← こういうのに対応
                                    tag_str += c;
                                }
                            }
                        } else if (c === "[") {
                            // タグ解析中 → 開始タグ [ に遭遇した！
                            if (start_quot === "") {
                                // クォート外部であるときだけ1段深層に沈む
                                deep_kakko++;
                            }
                            // 足すの忘れない
                            tag_str += c;
                        } else if (c === '"' || c === "'" || c === "`") {
                            // タグ解析中 → クォート " ' ` に遭遇した！
                            if (start_quot === c) {
                                // このクォートなんか見たことあるぞ…となったらクォートを脱出
                                start_quot = "";
                            } else if (start_quot === "") {
                                // まだクォートに侵入していないならこれから侵入する
                                start_quot = c;
                            }
                            // 足すの忘れない
                            tag_str += c;
                        } else {
                            // タグ解析中 → [ ] " ' ` のいずれでもない
                            tag_str += c;
                        }
                    } else if (flag_escape) {
                        // タグ解析中ではなくエスケープフラグが立っている場合
                        text += c;
                        flag_escape = false;
                    } else if (c === "[") {
                        // タグ解析中ではなくエスケープフラグも立っていないときに [ に遭遇した場合
                        // タグ解析開始！
                        scanning_tag = true;
                        deep_kakko++;
                        //この時点で格納されているテキストがあれば配列に追加
                        if (text != "") {
                            const text_obj = {
                                line: i,
                                name: "text",
                                pm: { val: text },
                                val: text,
                                is_entity_disabled: true,
                            };
                            array_s.push(text_obj);
                            text = "";
                        }
                    } else {
                        //"["以外の文字の場合
                        if (c === "\\") {
                            flag_escape = true;
                        } else {
                            text += c;
                        }
                    }
                }
                //　1文字ずつ解析していくのが完了した
                // この時点でタグがあれば配列に追加
                if (tag_str) {
                    if (tag_str.slice(-1) === "]") {
                        const tag_str_fixed = tag_str.slice(0, tag_str.length - 1);
                        this.kag.warning(
                            "compensate_missing_quart",
                            {
                                before: tag_str,
                                after: tag_str_fixed,
                            },
                            false,
                        );
                        tag_str = tag_str_fixed;
                    }
                    array_s.push(this.makeTag(tag_str, i));
                }
                //　この時点でテキストがあれば配列に追加
                if (text) {
                    array_s.push({
                        line: i,
                        name: "text",
                        pm: { val: text },
                        val: text,
                        is_entity_disabled: true,
                    });
                }

                //console.log(array_char);
            }
            //１行づつ解析解析していく
        }

        //翻訳が必要な場合はここでarray_sの中身を解析して翻訳する
        this.kag.convertLang(this.kag.stat.current_scenario, array_s);

        var result_obj = {
            array_s: array_s,
            map_label: map_label,
        };

        if (this.deep_if != 0) {
            this.kag.error("if_and_endif_do_not_match");
            this.deep_if = 0;
        }

        return result_obj;
    },

    //タグ情報から、オブジェクトを作成して返却する
    makeTag: function (str, line) {
        var that = this;
        var obj = {
            line: line,
            name: "",
            pm: {},
            val: "",
        };

        var array_c = str.split(""); // 1文字ずつバラす
        var flag_escape = false; // エスケープ中？
        var SCANNING_TAG_NAME = 1;
        var SCANNING_PARAM_NAME = 2;
        var SCANNING_EQUAL = 3;
        var SCANNING_START_QUOT = 4;
        var SCANNING_PARAM_VALUE = 5;
        var scanning_state = SCANNING_TAG_NAME; // 最初はタグ名検出モード
        var tag_name = ""; // タグ名記憶用
        var param_name = ""; // パラメータキー記憶用
        var param_value = ""; // パラメータバリュー記憶用
        var end_char_of_param_value = ""; // パラメータバリューの記述終了を検出する文字(クォート3種か空白)
        var keepSpaceConfig = that.kag.config.KeepSpaceInParameterValue;

        // パラメータが確定したときの処理を共通化
        function makeParam() {
            obj.pm[param_name] = param_value;
            // パラメータの値をトリミング（両端の空白を削除）
            var param_value_trim = $.trim(param_value);
            // トリミングして"undefined"となるようなら""に変換
            if (param_value_trim === "undefined") {
                obj.pm[param_name] = "";
            }
            // 空白保持レベルが3でない場合はトリミングした値で上書き
            // 未定義(V514以前)の場合も含まれる
            if (keepSpaceConfig !== "3") {
                obj.pm[param_name] = param_value_trim;
            }
        }

        // 1文字ずつ見ていくぞ
        for (var j = 0; j < array_c.length; j++) {
            var c = array_c[j];
            switch (scanning_state) {
                case SCANNING_TAG_NAME:
                    // タグ名検出モード
                    if (c === " ") {
                        // 空白に遭遇！
                        if (tag_name === "") {
                            // まだタグ名になにも入っていないならタグ名検出モードを継続
                            // 例) [ bg storage=room.jpg] のように先頭に空白が入っているケースに対応する
                        } else {
                            // タグ名になにか入っている状態で空白に遭遇したならパラメータキー検出モードに遷移
                            scanning_state = SCANNING_PARAM_NAME;
                        }
                    } else {
                        // 空白じゃないならタグ名に足していく
                        tag_name += c;
                    }
                    break;
                case SCANNING_PARAM_NAME:
                    // パラメータキー検出モード
                    if (c === " ") {
                        // 空白に遭遇！
                        if (param_name === "") {
                            // パラメータキーになにも入っていないならパラメータキー検出モードを継続
                        } else {
                            // パラメータキーになにか入っている場合はイコール検出モードに遷移
                            scanning_state = SCANNING_EQUAL;
                        }
                    } else if (c === "=") {
                        // イコールに遭遇！
                        // 開始クォート検出モードに遷移
                        scanning_state = SCANNING_START_QUOT;
                    } else {
                        // パラメータ名に足す
                        param_name += c;
                    }
                    break;
                case SCANNING_EQUAL:
                    // イコール検出モード
                    // ふつうはここに来ることなくタグ名検出モードからクォート検出モードに直で遷移するはずだが
                    // パラメータキーのあとにイコールではなく空白が挟まっているケースではこのモードとなる
                    // 例1) [bg storage   =room.jpg] → storage=room.jpg と解釈したい
                    // 例2) [bg * time=1000] → マクロ内のパラメータ全渡しの * にも対応
                    if (c === "=") {
                        // イコールを検出したら次は開始クォートを検出
                        scanning_state = SCANNING_START_QUOT;
                    } else if (c === " ") {
                        // 空白に遭遇してもめげない
                    } else {
                        // イコールに遭遇する前に空白以外の文字が来た
                        // たとえば [bg time storage=room.jpg] というケースでは
                        // time のあとの空白を読み取ったあとイコール検出モードに入るが
                        // 文字を読み進めていくと、なんとイコールに遭遇する前に s に遭遇してしまう！
                        // このケースでは time パラメータには空文字列を入れて
                        // s から始まるパラメータキーを検出するモードに遷移する
                        // (パラメータ全渡しの * エンティティもこれで対応できる)
                        obj.pm[param_name] = "";
                        param_name = c;
                        scanning_state = SCANNING_PARAM_NAME;
                    }
                    break;
                case SCANNING_START_QUOT:
                    // パラメータバリューの開始クォート検出モード
                    if (c === '"' || c === "'" || c === "`") {
                        // クォート3種のいずれかに遭遇！
                        // ここで読み取ったクォートを終了クォートとする
                        // パラメータバリュー検出モードに遷移
                        end_char_of_param_value = c;
                        scanning_state = SCANNING_PARAM_VALUE;
                    } else if (c === " ") {
                        // 空白に遭遇してもめげない
                    } else {
                        // クォートなしで即バリューを書き出しているようだ！
                        // この場合はクォートではなく空白によってバリューの終わりを検出
                        // パラメータバリュー検出モードに遷移
                        end_char_of_param_value = " ";
                        param_value = c;
                        scanning_state = SCANNING_PARAM_VALUE;
                    }
                    break;
                case SCANNING_PARAM_VALUE:
                    // パラメータバリュー検出モード
                    if (c === end_char_of_param_value) {
                        // 終了文字に遭遇！
                        // パラメータバリュー検出を終わりたい
                        if (flag_escape) {
                            // でもエスケープはできるようにしよう
                            flag_escape = false;
                            param_value += c;
                        } else {
                            // パラメータ完成！
                            makeParam();
                            param_name = "";
                            param_value = "";
                            end_char_of_param_value = "";
                            scanning_state = SCANNING_PARAM_NAME;
                        }
                    } else {
                        // 終了文字には遭遇しなかった
                        // バリューを足していく

                        // 従来のパーサーの仕様（バリュー内の空白全削除）を再現するための処理
                        // 開始クォートの種類がバッククォートじゃない、かつ、空白保持レベルが1の場合は半角スペースを除去
                        if (end_char_of_param_value !== "`" && c === " ") {
                            if (keepSpaceConfig === "1") {
                                c = "";
                            }
                        }
                        if (flag_escape) {
                            param_value += c;
                        } else if (c === "\\") {
                            flag_escape = true;
                        } else {
                            param_value += c;
                        }
                    }
                    break;
            }
        }

        // 全文字見終わった
        // この時点で未登録のパラメータがあるなら登録
        if (param_name !== "") {
            makeParam();
        }

        // 原文と解釈結果をコンソールで確認
        // var style =
        //     "padding: 2px 4px; border-radius: 4px; background: blue; color: white;";
        // console.log("%c" + str, "background: #ddd; padding: 4px 0;");
        // console.log("%c" + tag_name + "%o", style, obj.pm);

        obj.name = tag_name;

        if (obj.name == "iscript") {
            this.flag_script = true;
        }
        if (obj.name == "endscript") {
            this.flag_script = false;
        }

        switch (obj.name) {
            case "if":
                this.deep_if++;
                obj.pm.deep_if = this.deep_if;
                break;
            case "elsif":
            case "else":
                obj.pm.deep_if = this.deep_if;
                break;
            case "endif":
                obj.pm.deep_if = this.deep_if;
                this.deep_if--;
                break;
        }

        return obj;
    },

    test: function () { },
};
