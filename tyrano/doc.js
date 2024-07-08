function object(o) {
    var f = object.f,
        i,
        len,
        n,
        prop;
    f.prototype = o;
    n = new f();
    for (i = 1, len = arguments.length; i < len; ++i) for (prop in arguments[i]) n[prop] = arguments[i][prop];
    return n;
}

object.f = function () {};

var tyrano = {};
tyrano.plugin = {};
tyrano.plugin.kag = {};

//グループの順番
var GROUP_RANK = [
    "メッセージ・テキスト",
    "メッセージ関連の設定",
    "ラベル・ジャンプ操作",
    "キャラクター操作",
    "画像・背景・レイヤ操作",
    "演出・効果・動画",
    "アニメーション",
    "カメラ操作",
    "システム操作",
    "システムデザイン変更",
    "メニュー・HTML表示",
    "マクロ・分岐・サブルーチン関連",
    "変数・JS操作・ファイル読込",
    "オーディオ",
    "ボイス・読み上げ",
    "入力フォーム",
    "3D関連",
    "AR関連",
].reverse();

var PARAM_EXP = {
    "time/fadein":
        "フェードイン時間をミリ秒単位で指定します。これを指定すると、画像が透明な状態から徐々に表示されていきます。省略すると、一瞬で表示されます。",
    "wait/fadein": "フェードインの完了を待つかどうか。`true`または`false`で指定します。",
    "time/fadeout":
        "フェードアウト時間をミリ秒単位で指定します。これを指定すると、画像が徐々に透明になっていきます。省略すると、一瞬で消去されます。",
    "wait/fadeout": "フェードアウトの完了を待つかどうか。`true`または`false`で指定します。",
    "page": "レイヤの表ページと裏ページ、どちらを対象とするか。`fore`または`back`で指定します。省略すると、表ページとみなされます。",
    "layer": "対象のレイヤを指定します。",
    "layer/image": "対象とする前景レイヤを`0`以上の整数で指定します。",
    "storage/jump": "ジャンプ先のシナリオファイル名を指定します。省略すると、現在のシナリオファイルとみなされます。",
    "target/jump": "ジャンプ先のラベル名を指定します。省略すると、シナリオファイルの先頭にジャンプします。",
    "name": "`[anim]`タグなどからこの名前でアニメーションさせられます。カンマで区切ることで複数指定できます。（高度な知識：`name`属性で指定した値はHTMLのクラス属性になります）",
    "opacity": "不透明度を`0`～`255`の数値で指定します。`0`で完全に透明になります。",
    "left": "画像左端の位置をピクセル単位で指定します。`0`でゲーム画面の上端に表示されます。",
    "top": "画像上端の位置をピクセル単位で指定します。`0`でゲーム画面の上端に表示されます。",
    "storage/audio": "再生する音楽ファイルを指定します。",
    "loop": "ループするかどうか。`true`または`false`で指定します。",
    "sprite_time":
        "再生する区間を指定できます。開始時刻と終了時刻をハイフン繋ぎでミリ秒単位で指定します。たとえば`6000-10000`と指定すると00:06～00:10の4秒間を再生します。`loop`属性が`true`の場合、この間をループ再生します。<br>V515以降：`00:06-00:10`のような`分:秒`区切りでも指定できるようになりました。必ず`:`を含めてください。",
    "volume": "再生する音量を指定できます。`0`〜`100`の範囲で指定して下さい。",
    "html5": "通常は指定しなくてOKです。HTML5 Audioを使う場合は`true`、Web Audio APIを使う場合は`false`(デフォルト)で指定します。",
};

(function ($) {
    /**
     * JSファイルを読み込んでパースしたあと $.putHtml() を呼ぶ
     */
    $.generateHtml = function () {
        var html = "";

        var master_tag = {};
        var map_doc = {};

        // タグの種類を確定させる
        for (var order_type in tyrano.plugin.kag.tag) {
            master_tag[order_type] = object(tyrano.plugin.kag.tag[order_type]);
        }

        console.log("===master_tag");
        console.log(master_tag);

        //テキストを読み込み。スクリプトから、オブジェクト構造解析
        //同じディレクトリにある、KAG関連のデータを読み込み

        var array_script = [
            "kag.tag.js",
            "kag.tag_audio.js",
            "kag.tag_ext.js",
            "kag.tag_system.js",
            "kag.tag_camera.js",
            "kag.tag_ar.js",
            "kag.tag_three.js",
        ];

        var script_num = array_script.length;
        var loading_num = 0;

        for (var i = 0; i < array_script.length; i++) {
            $.loadText("./tyrano/plugins/kag/" + array_script[i], function (text_str) {
                var tag_name = ""; // string, いま解析中のタグ名
                var param_key = ""; // string, いま解析中のパラメータキー (例) "title", "group", "exp", ...
                var param_text = ""; // string, いま解析中のパラメータのテキストを結合していったもの

                text_str.split("\n").forEach((origin_line_str) => {
                    //トリミング
                    var line_str = $.trim(origin_line_str);

                    if (!tag_name) {
                        // ドキュメント解析中ではないときに #[ から始まる行を検知した場合は
                        // ドキュメント解析モードに移行する
                        if (line_str.substr(0, 2) === "#[") {
                            tag_name = line_str.replace("#[", "");
                            tag_name = tag_name.replace("]", "");
                            tag_name = $.trim(tag_name);
                            param_key = "";
                            param_text = "";
                            map_doc[tag_name] = {};
                        }
                        return;
                    }

                    // ドキュメント解析中に #[end] に一致する行を検知した場合は
                    // 解析したデータを格納してドキュメント解析モードを終了する
                    if (line_str === "#[end]") {
                        if (param_key) map_doc[tag_name][param_key] = param_text;
                        tag_name = "";
                        param_key = "";
                        param_text = "";
                        return;
                    }

                    // ドキュメント解析中に : から始まる行を検知した場合はヘッダーとして解釈
                    // :group, :title, :exp, :param, :sample
                    if (line_str.substr(0, 1) == ":") {
                        // 直前のコンテンツを格納する
                        if (param_key) map_doc[tag_name][param_key] = param_text;

                        // 新しいパラメータと初期化
                        param_key = line_str.substr(1, line_str.length);
                        map_doc[tag_name][param_key] = "";
                        param_text = "";
                        return;
                    }

                    //
                    // パラメータテキストを足す処理を遂行
                    // param_text += line_str
                    // ただしなんのパラメータを読んでいるかで処理を変更したい
                    //

                    // :sample 中はインデントを使いたいのでトリミング前に戻す
                    if (param_key === "sample") {
                        line_str = origin_line_str;
                    }

                    param_text += line_str + "\n";
                });

                //macdoc を　解析して、HTMLを作成

                loading_num++;

                if (loading_num == script_num) {
                    for (const tag_name in map_doc) {
                        map_doc[tag_name].array_param = $.parseParam(master_tag, tag_name, map_doc[tag_name].param);
                    }

                    console.log("===map_doc");
                    console.log(map_doc);

                    $("#studio_json").val(JSON.stringify(map_doc, undefined, 4));

                    $.putHtml(map_doc, master_tag);
                }
            });
        }

        return html;
    };

    /**
     * ドキュメントの :param を解釈
     *
     * (入力例)
     *
     * "storage = ジャンプ先のシナリオを指定します。\ntarget = ジャンプ先のラベルを指定します。"
     *
     * (出力例)
     *
     * [
     *     {
     *         name: "storage",
     *         value: "ジャンプ先のシナリオを指定します。",
     *         vital: "〇",
     *         default: "",
     *     },
     *     {
     *         name: "storage",
     *         value: "ジャンプ先のシナリオを指定します。",
     *         vital: "〇",
     *         default: "",
     *     },
     * ]
     * @param {Object} master_tag
     * @param {string} tag_name
     * @param {string} param_text
     * @returns {Object[]}
     */
    $.parseParam = function (master_tag, tag_name, param_text) {
        if (!param_text) param_text = "";
        const param_array = [];

        // 改行でで分割, 最後の空文字を除去
        const param_lines = param_text.split("\n");
        if (param_lines.length && param_lines.slice(-1) === "") {
            param_lines.pop();
        }

        let tmp_name = "";
        let tmp_value = "";
        let tmp_vital = "";
        let tmp_default = "";

        const push = () => {
            if (!tmp_name) return;
            tmp_value = tmp_value.trim();
            if (tmp_value.slice(-1) === ",") tmp_value = tmp_value.slice(0, -1);
            tmp_value = replaceParamExpWithConstant(tmp_value, tmp_name, tag_name);
            tmp_value = markup(tmp_value);
            param_array.push({
                name: tmp_name,
                value: tmp_value,
                vital: tmp_vital,
                default: tmp_default,
            });
            tmp_name = "";
            tmp_value = "";
            tmp_vital = "";
            tmp_default = "";
        };

        param_lines.forEach((line) => {
            line = line.trim();
            const is_new_param = !!line.match(/^\s*[^ =]+\s*=\s*.*$/);
            if (is_new_param) {
                push();
                tmp_name = line.match(/^\s*([^ =]+)/)[1];
                console.log(master_tag[tag_name]);
                console.log(tag_name);
                console.log(tmp_name);
                if (master_tag[tag_name].pm && master_tag[tag_name].pm[tmp_name]) {
                    tmp_default = master_tag[tag_name].pm[tmp_name];
                }
                if (master_tag[tag_name] && master_tag[tag_name].vital) {
                    if (master_tag[tag_name].vital.includes(tmp_name)) {
                        tmp_vital = "〇";
                    }
                }
                const hash = line.split("=");
                hash.shift();
                tmp_value = hash.join("=");
                return;
            }
            tmp_value += line;
        });
        push();
        return param_array;
    };

    /**
     * HTMLを生成する
     * @param {Object} map_doc
     * @param {Object} master_tag
     */
    $.putHtml = function (map_doc, master_tag) {
        console.log("===map_doc");
        console.log(map_doc);

        //------------------------------
        //タグのグルーピングで左部分作成
        //------------------------------

        var group_map = {};

        // TagDocをグループで整理
        for (var tag_name in map_doc) {
            var obj = map_doc[tag_name];
            // 文字列をトリミングしておく
            ["exp", "group", "sample", "demo"].forEach((key) => {
                if (typeof obj[key] === "string") {
                    obj[key] = obj[key].trim();
                }
            });
            // 振り分け
            var group_name = obj.group;
            if (group_map[group_name] === undefined) {
                group_map[group_name] = {};
            }
            group_map[group_name][tag_name] = obj;
        }

        //map_docに存在しているグループのリスト
        var group_names = Object.keys(group_map);

        //GROUP_RANKに存在しないグループのセット
        var unknown_groups = new Set();

        //GROUP_RANK順になるように並び変える
        //GROUP_RANKに載っていないグループは最後尾
        //GROUP_RANKに載っていないグループ同士は文字コードを比較
        group_names.sort(function (a, b) {
            var i = GROUP_RANK.indexOf(a);
            var j = GROUP_RANK.indexOf(b);
            if (i < 0) unknown_groups.add(a);
            if (j < 0) unknown_groups.add(b);
            return i > j ? -1 : i < j ? 1 : a > b ? 1 : -1;
        });

        //未登録のタググループをアラート
        if (unknown_groups.size > 0) {
            alert("未登録のタググループを検出しました。\n\n" + [...unknown_groups].join("\n"));
        }

        //ソート済みのグループリストが完成
        console.log("===group_names");
        console.log(group_names);

        //左側のHTMLを作る
        var ghtml = "";
        var num_index = 0;
        for (const group_name of group_names) {
            ghtml += '<li class="list-group-item list-toggle">';
            ghtml +=
                '<a data-toggle="collapse" data-parent="#sidebar-nav-1" href="#nav_' +
                num_index +
                '" class="collapsed" aria-expanded="false">' +
                group_name +
                "</a>";

            var tag_map = group_map[group_name];

            ghtml += '<ul id="nav_' + num_index + '" class="collapse" aria-expanded="false" style="height: 0px;">';

            for (tag_name in tag_map) {
                const obj = tag_map[tag_name];
                //ghtml +='<div style="padding:2px"><a  href="#'+tag_name+'">['+tag_name+']　<span style="font-style:italic;color:gray">('+obj.title+')</span></a></div>';
                ghtml += `<li><a href="#${tag_name}">[${tag_name}]　${obj.title}</a></li>`;
            }

            ghtml += "</ul>";
            ghtml += "</li>";

            num_index++;
        }
        $(".area_group").html(ghtml);

        //------------------------------
        //ドキュメント本体を作っていく
        //------------------------------

        var j_root = $("<div></div>");

        //スタイルの追加
        j_root.append(
            `<style>
                .news-v3 p {
                    margin-bottom: 10px;
                }
                .news-v3 h3 {
                    margin-bottom: 4px;
                }
                .news-v3 .group {
                    font-size: 90%;
                    color: #a10f2b;
                }
                .news-v3 .code {
                    padding: 0px 3px;
                    margin: 0px 2px 1px;
                    font-size: 100%;
                    background-color: rgba(0, 30, 150, 0.07);
                    border-radius: 5px;
                    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
                    line-height: 140%;
                    display: inline;
                    word-break: inherit;
                    user-select: all;
                }
                .news-v3 .code::selection {
                }
                .news-v3 .tag {
                    text-decoration: none;
                }
                .news-v3 .tag > .code {
                    color: #c7254e;
                    background-color: #f9f2f4;
                }
                .news-v3 .tag + .tag > .code {
                    margin-left: 0px;
                }
                .news-v3 .tag > .code:hover {
                    background-color: #ffe9ef;
                }
                .news-v3 .table > thead > tr > th {
                    vertical-align: middle;
                }
                .news-v3 .table > tbody > tr > td:nth-child(3) {
                    word-break: break-word;
                }
                .news-v3 .table > tbody > tr > td:nth-child(2) {
                    text-align: center;
                }
                .news-v3 .table > tbody > tr > td > p:last-child {
                    margin-bottom: 0;
                }
            </style>`
                .replace(/\n/g, "")
                .replace(/\s+/g, " "),
        );

        // タグ名のリストを作る（グループ順に準拠する）
        var tag_names = [];
        for (const group_name of group_names) {
            const tag_map = group_map[group_name];
            tag_names = tag_names.concat(Object.keys(tag_map));
        }
        console.log("===tag_names");
        console.log(tag_names);

        for (const tag_name of tag_names) {
            const obj = map_doc[tag_name];

            //説明文のパース
            var exp = parseExp(obj.exp);

            var html =
                `<div  class="news-v3 bg-color-white margin-bottom-20">` +
                `<div class="news-v3-in"><a name="${tag_name}"></a>` +
                `<h3 style="color:#a10f2b">[${tag_name}]　${obj.title}</h3>` +
                `<ul class="list-inline posted-info"><li><span class="group">${obj.group}</span></li></ul>${exp}`;

            //デモ用のURLがあるなら差し込む
            if (typeof obj.demo != "undefined") {
                var array_demo = obj.demo.split(",");
                var demo_url = "/demogame/tech_samples_" + $.trim(array_demo[0]) + "_v5/index.html?storage=" + $.trim(array_demo[1]);
                html += '<p><a href="' + demo_url + '" target="_blank"">解説チュートリアル</a></p>';
            }

            //パラメータのテーブルを作っていく
            html +=
                '<table class="table table-bordered">' +
                '<thead style="background-color:pink"><tr><th>パラメータ</th><th>必須</th><th>解説</th><th>初期値</th></tr></thead>' +
                "<tbody>";

            const array_param = obj.array_param;

            if (array_param.length === 0) {
                html += '<tr ><td colspan="4">指定できるパラメータはありません。</td></tr>';
            }
            array_param.forEach((param) => {
                const initial = param.default ? `<span class="code">${param.default}</span>` : "";
                html += `<tr><td>${param.name}</td><td>${param.vital}</td>` + `<td>${param.value}</td><td>${initial}</td></tr>`;
            });
            html += "</tbody></table>";

            //サンプルコード
            if (obj.sample) {
                html +=
                    `<ul class="list-inline posted-info"><li>サンプルコード</li></ul>` +
                    `<pre class="language-tyranoscript"><code>${$.escapeHTML(obj.sample)}</code></pre>`;
            }

            html += "</div></div>";
            html += '<div class="clearfix "><hr style="margin:0"></div>';

            //htmlをぶち込みます

            j_root.append($(html));
        } // end map_doc loop

        $(".area_ref").empty();

        //基本説明部分

        var basic_exp =
            '<div class="alert alert-success fade in margin-bottom-20">' +
            "<h4>基本</h4>" +
            "<p>" +
            "[ ] で囲まれた部分がタグになります。<br>" +
            "@で始まる行もタグとして認識されますが、１行に複数のタグを書くことはできません。</p><p>" +
            ";（セミコロン）で始まる行はコメントとして扱われます。<br>" +
            "複数行をまとめてコメントにしたいときは、コメントにしたい行を /* と */ で囲みます。/* と */ はどちらも独立した行に記述する必要があります。</p><p>" +
            "すべてのタグに共通して指定可能なパラメータにcond属性があります。cond属性は『そのタグが実行される条件』であり、JavaScriptの式で記述します。</p><p>" +
            "基本的にスクリプトの行頭の空白はないものとして扱われます。テキストの前に空白を入れたいときは、行頭に_（半角アンダーバー）を書く必要があります。</p>" +
            "</p>" +
            "</div>";
        $(".area_ref").append(basic_exp);
        $(".area_ref").append(j_root);

        // テキストノードを span 要素でラップする
        wrapTextNodeBySpan(".area_ref");

        // htmlを全部<textarea>にぶち込む処理には時間がかかるのでここではまだぶち込まない
        $("#src_html").val("ボタンを押してください");

        var js_auto_complete = "";
        for (const tag_name in master_tag) {
            js_auto_complete += '"' + tag_name + '",\n';
        }
        $("#auto_complete_tag").val(js_auto_complete);

        // window.Prism.highlightAll();
    };

    /**
     * テキストノードを span 要素でラップする
     * @param {Element}
     */
    function wrapTextNodeBySpan(elm) {
        $(elm)
            .contents()
            .filter(function () {
                if (this.nodeType == 3) {
                    // テキストノードの nodeType は3
                    var node = this.nodeValue;
                    if (node != null && node.trim() != "") {
                        // 空白ノードでなければ返す
                        return true;
                    } else {
                        // 空白は返さない
                        return false;
                    }
                } else {
                    // nodeType が 3 でないものは返さない
                    if (this.classList.contains("language-tyranoscript")) {
                        return false;
                    }
                    if (this.tagName === "SPAN") {
                        return false;
                    }
                    if (this.tagName === "STYLE") {
                        return false;
                    }
                    wrapTextNodeBySpan(this);
                    return false;
                }
            })
            .wrap("<span/>");
    }

    /**
     * タグリファレンスの innerHTML をテキストボックスにぶちこむ
     */
    $.setHtmlToTextarea = () => {
        $("#src_html").val($(".area_main").html());
    };

    /**
     * タグ説明文のパースを行う
     * 連続する空行を検知して p 要素で段落化するとか
     * (マークダウン的な)
     * @param {*} exp
     * @returns
     */
    function parseExp(exp) {
        //HTML特殊文字のエスケープ
        //exp = $.escapeHTML(exp);

        //連続改行(空行)を検出して段落配列化
        let paragraphs = exp.split(/\n\s*\n/);

        //各段落に処理を行いjoinして返す
        return paragraphs
            .map((p) => {
                return `<p>${markup(p)}</p>`;
            })
            .join("");
    }

    /**
     * HTMLタグによるマークアップを行う
     * @param {string} p
     * @returns
     */
    function markup(p) {
        //トリミング
        p = p.trim();
        //段落内における改行は<br>に変換して見た目に反映
        p = p.replace(/\n/g, "<br>");
        //インラインティラノタグ(`[hoge]`)を変換
        p = p.replace(/`\[([^`\s]+)\]`/g, `<a class="tag" href="#$1" title="[$1]タグの説明にジャンプ"><span class="code">[$1]</span></a>`);
        //インラインコード(`hoge`)を変換
        p = p.replace(/`([^`]+)`/g, `<span class="code">$1</span>`);
        //URLを検出してリンク化
        p = p.replace(/(?<!href="|')https?:\/\/[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+/g, function (url) {
            return `<a href="${url}">${url}</a>`;
        });
        return p;
    }

    /**
     * パラメータの説明を定数から取ってくる
     * @param {*} str パラメータの説明文 (例) "ジャンプ先のラベルを指定します。"
     * @param {*} param_name パラメータ名 (例) "target"
     * @param {*} tag_name タグ名 (例) "jump"
     * @returns
     */
    function replaceParamExpWithConstant(str, param_name, tag_name) {
        //トリミング
        str = str.trim();
        //"!!"から始まる場合は定数から取ってくる
        if (str.match(/^!!/)) {
            str = str.replace("!!", "");
            const key = param_name + (str ? "/" : "") + str;
            if (PARAM_EXP[key]) {
                return PARAM_EXP[key];
            } else {
                console.error(`[${tag_name}]タグ: ${key} のパラメータ説明文が定義されていません。`);
                return "";
            }
        } else {
            //"!!"から始まらない場合はそのまま
            return str;
        }
    }
})(jQuery);
