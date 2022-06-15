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
                    val: text,
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
                    //this.kag.warning("警告:"+i+"行目:"+"ラベル名「"+label_obj.pm.label_name+"」は同一シナリオファイル内に重複しています");
                    this.kag.warning(
                        "Warning line:" +
                            i +
                            " " +
                            $.lang("label") +
                            "'" +
                            label_obj.pm.label_name +
                            "'" +
                            $.lang("label_double"),
                    );
                } else {
                    map_label[label_obj.pm.label_name] = label_obj.pm;
                }
            } else if (first_char === "@") {
                //タグ
                //残りの部分をごそっと回す
                var tag_str = line_str.substr(1, line_str.length); // "image split=2 samba = 5"
                var tmpobj = this.makeTag(tag_str, i);
                array_s.push(tmpobj);
            } else {
                //テキストか[]記法のタグ
                //テキストは[iscript]内のJavaScriptや[html]内のHTMLである可能性がある

                //先頭の半角アンダーバーは空白を除去しないという特殊記号なので排除
                if (first_char === "_") {
                    line_str = line_str.substring(1, line_str.length);
                }

                //１文字ずつバラして解析していく
                var array_char = line_str.split("");

                var text = ""; //命令じゃない部分はここに配置していく

                var tag_str = "";

                var flag_tag = false; //タグ解析中

                var num_kakko = 0; //"["の深さ
                //↑exp属性の中で配列[]を使用した場合などに、配列の"]"を閉じタグの"]"として解釈しないようにするために必要

                for (var j = 0; j < array_char.length; j++) {
                    var c = array_char[j];

                    if (flag_tag === true) {
                        //タグ解析中！
                        if (c === "]" && this.flag_script == false) {
                            //[iscript]解析中以外で"]"に遭遇したらカッコの深さを減らす
                            num_kakko--;

                            if (num_kakko == 0) {
                                //一番表層に戻ってきたときにタグ文字列が完成する！makeTagに投げる
                                flag_tag = false;
                                array_s.push(this.makeTag(tag_str, i));
                                tag_str = "";
                            } else {
                                //ネストされた"]"なら閉じタグではない
                                tag_str += c;
                            }
                        } else if (c === "[" && this.flag_script == false) {
                            //[iscript]解析中以外で"["に遭遇したらカッコの深さを増やす
                            num_kakko++;
                            tag_str += c;
                        } else {
                            //"["でも"]"でもない
                            //あるいは[iscript]解析中であるなら単に足す
                            tag_str += c;
                        }
                    } else if (
                        flag_tag === false &&
                        c === "[" &&
                        this.flag_script == false
                    ) {
                        //[iscript]解析中以外で"["に遭遇したらタグ解析モード！
                        flag_tag = true;
                        num_kakko++;

                        //この時点で格納されているテキストがあれば配列に追加
                        if (text != "") {
                            var text_obj = {
                                line: i,
                                name: "text",
                                pm: { val: text },
                                val: text,
                            };
                            array_s.push(text_obj);
                            text = "";
                        }
                    } else {
                        //[iscript]解析中か"["以外の文字なら単に足す
                        text += c;
                    }
                }
                //1文字ずつ解析していくのが完了した
                //この時点でテキストがあれば配列に追加
                if (text != "") {
                    var text_obj = {
                        line: i,
                        name: "text",
                        pm: { val: text },
                        val: text,
                    };
                    array_s.push(text_obj);
                }

                //console.log(array_char);
            }
            //１行づつ解析解析していく
        }

        var result_obj = {
            array_s: array_s,
            map_label: map_label,
        };

        if (this.deep_if != 0) {
            this.kag.warning("[if]と[endif]の数が一致しません。");
            this.deep_if = 0;
        }

        return result_obj;
    },

    //タグ情報から、オブジェクトを作成して返却する
    makeTag: function (str, line) {
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
        var scanning_state = SCANNING_TAG_NAME; // 最初はタグ名読み取りモード
        var tag_name = ""; // タグ名記憶用
        var param_name = ""; // パラメータキー記憶用
        var param_value = ""; // パラメータバリュー記憶用
        var end_char_of_param_value = ""; // パラメータバリューの記述終了を検出する文字(クォート3種か空白)

        // 1文字ずつ見ていくぞ
        for (var j = 0; j < array_c.length; j++) {
            var c = array_c[j];
            switch (scanning_state) {
                case SCANNING_TAG_NAME:
                    // タグ名検出モード
                    if (c === " ") {
                        // 空白を検出！
                        if (tag_name === "") {
                            // まだタグ名になにも入っていないならタグ名読み取りを継続
                            // 例) [ bg storage=room.jpg] のように先頭に空白が入っているケースに対応する
                        } else {
                            // タグ名になにか入っている場合のみパラメータ名読み取りに遷移
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
                            // パラメータ名になにも入っていないならパラメータ名読み取りを継続
                        } else {
                            // パラメータ名になにか入っている場合はイコール読み取りに遷移
                            scanning_state = SCANNING_EQUAL;
                        }
                    } else if (c === "=") {
                        // イコールに遭遇！
                        // 開始クォートを検出
                        scanning_state = SCANNING_START_QUOT;
                    } else {
                        // パラメータ名に足す
                        param_name += c;
                    }
                    break;
                case SCANNING_EQUAL:
                    // イコール検出モード
                    // ふつうはここに来ることなくタグ名検出モードから直接クォート検出モードに移行するはずだが
                    // パラメータ名のあとにすぐイコールが記述されなかったケースにも対応する
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
                        // なんと s が来ているので time 要らない説が出てくる
                        // (パラメータ全渡しの * エンティティもここで対応)
                        obj.pm[param_name] = "";
                        param_name = c;
                        // パラメータ読み取りに戻る
                        scanning_state = SCANNING_PARAM_NAME;
                    }
                    break;
                case SCANNING_START_QUOT:
                    // パラメータバリューの開始クォート検出モード
                    if (c === '"' || c === "'" || c === "`") {
                        // クォート3種の神器
                        // ここで読み取ったクォートを終了クォートとする
                        end_char_of_param_value = c;
                        scanning_state = SCANNING_PARAM_VALUE;
                    } else if (c === " ") {
                        // 空白に遭遇してもめげない
                    } else {
                        // クォートなしで即バリューを書き出すケースにも対応
                        // この場合はクォートではなく空白によってバリューの終わりを検出
                        end_char_of_param_value = " ";
                        param_value = c;
                        scanning_state = SCANNING_PARAM_VALUE;
                    }
                    break;
                case SCANNING_PARAM_VALUE:
                    // パラメータバリュー検出モード
                    if (c === end_char_of_param_value) {
                        //終了文字に遭遇したらパラメータバリュー解析は終わり！
                        if (flag_escape) {
                            //でもエスケープはできるようにしよう
                            flag_escape = false;
                            param_value += c;
                        } else {
                            //パラメータ完成！
                            obj.pm[param_name] = param_value;
                            param_name = "";
                            param_value = "";
                            end_char_of_param_value = "";
                            scanning_state = SCANNING_PARAM_NAME;
                        }
                    } else {
                        // バリューを足していく
                        // 開始クォートの種類がバッククォートじゃない場合バリュー内の空白は削除
                        // (従来のティラノの仕様に合わせるため)
                        if (end_char_of_param_value !== "`" && c === " ") {
                            c = "";
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
            obj.pm[param_name] = param_value;
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

    test: function () {},
};
