function object(o) {
    var f = object.f,
        i,
        len,
        n,
        prop;
    f.prototype = o;
    n = new f();
    for (i = 1, len = arguments.length; i < len; ++i)
        for (prop in arguments[i]) n[prop] = arguments[i][prop];
    return n;
}

object.f = function () {};

var tyrano = {};
tyrano.plugin = {};
tyrano.plugin.kag = {};

//グループの順番
var GROUP_RANK = [
    "メッセージ関連",
    "ラベル・ジャンプ操作",
    "キャラクター操作",
    "レイヤ関連",
    "システム操作",
    "マクロ・変数・JS操作",
    "カメラ操作",
    "アニメーション関連",
    "オーディオ関連",
    "入力フォーム関連",
    "3D関連",
    "AR関連",
    "その他",
].reverse();

(function ($) {
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
            $.loadText(
                "./tyrano/plugins/kag/" + array_script[i],
                function (text_str) {
                    var flag_tag = ""; //タグ解析中の場合
                    var flag_param = ""; //パラメータ名

                    var tmp_str = "";

                    var array_str = text_str.split("\n");

                    for (var i = 0; i < array_str.length; i++) {
                        var line_str = $.trim(array_str[i]);

                        //タグ解析中は改行もつかう
                        if (line_str != "" || flag_tag != "") {
                            if (line_str === "#[end]") {
                                //終了時点で登録すべきデータが残っていた場合は入れておく
                                map_doc[flag_tag][flag_param] = tmp_str;

                                flag_tag = "";
                                flag_param = "";
                            } else if (flag_tag != "") {
                                if (line_str.substr(0, 1) == ":") {
                                    if (tmp_str != "") {
                                        if (flag_param != "") {
                                            map_doc[flag_tag][flag_param] =
                                                tmp_str;
                                        }
                                    }

                                    flag_param = "";
                                    flag_param = line_str.substr(
                                        1,
                                        line_str.length,
                                    );

                                    //すでに登録済みのデータがあれば、それを格納する
                                    map_doc[flag_tag][flag_param] = "";

                                    tmp_str = "";
                                } else {
                                    if (
                                        flag_param != "param" &&
                                        flag_param != "title"
                                    ) {
                                        tmp_str += line_str + "\n";
                                    } else {
                                        tmp_str += line_str;
                                    }
                                }

                                //タグ読み込み開始
                            } else if (line_str.substr(0, 2) === "#[") {
                                var tag_name = line_str.replace("#[", "");
                                tag_name = tag_name.replace("]", "");
                                tag_name = $.trim(tag_name);

                                flag_tag = tag_name;
                                flag_param = "";

                                map_doc[flag_tag] = {};
                            }
                        }
                    }

                    //macdoc を　解析して、HTMLを作成

                    loading_num++;

                    if (loading_num == script_num) {
                        //HTML作成
                        $.putHtml(map_doc, master_tag);

                        ////////スタジオ用データ作成
                        for (var key in map_doc) {
                            var tag = map_doc[key];
                            tag.array_param = [];

                            var array_param = tag.param.split(",");

                            for (var k = 0; k < array_param.length; k++) {
                                var tmp_array = array_param[k].split("=");
                                var param_name = $.trim(tmp_array[0]);
                                var param_value = $.trim(tmp_array[1]);

                                if (param_name == "") {
                                    continue;
                                }

                                var pm_obj = {
                                    name: param_name,
                                    value: param_value,
                                    vital: "×",
                                    default: "",
                                };

                                if (
                                    master_tag[key].pm &&
                                    master_tag[key].pm[param_name]
                                ) {
                                    pm_obj["default"] =
                                        master_tag[key].pm[param_name];
                                }

                                if (
                                    master_tag[key] != null &&
                                    master_tag[key]["vital"] != null
                                ) {
                                    var array_vital = master_tag[key]["vital"];

                                    for (
                                        var j = 0;
                                        j < array_vital.length;
                                        j++
                                    ) {
                                        if (
                                            master_tag[key].vital[j] ==
                                            param_name
                                        ) {
                                            pm_obj["vital"] = "◯";
                                            break;
                                        }
                                    }
                                }

                                tag.array_param.push(pm_obj);

                                delete tag["param"];
                            }
                        } //end for loop

                        console.log("===map_doc");
                        console.log(map_doc);

                        $("#studio_json").val(
                            JSON.stringify(map_doc, undefined, 4),
                        );
                    }
                },
            ); //　ローディング
        }

        return html;
    };

    $.putHtml = function (map_doc, master_tag) {
        console.log("===map_doc");
        console.log(map_doc);

        //------------------------------
        //タグのグルーピングで左部分作成
        //------------------------------

        var group_map = {};

        // TagDocをグループで整理
        for (key in map_doc) {
            var obj = map_doc[key];
            // 文字列をトリミングしておく
            ["exp", "group", "sample", "demo"].forEach(function (key) {
                if (typeof obj[key] === "string") {
                    obj[key] = obj[key].trim();
                }
            });
            // 振り分け
            if (group_map[obj.group] === undefined) {
                group_map[obj.group] = {};
            }
            group_map[obj.group][key] = obj;
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
            alert(
                "未登録のタググループを検出しました。\n\n" +
                    [...unknown_groups].join("\n"),
            );
        }

        //ソート済みのグループリストが完成
        console.log("===group_names");
        console.log(group_names);

        //左側のHTMLを作る
        var ghtml = "";
        var num_index = 0;
        for (var group_name of group_names) {
            ghtml += '<li class="list-group-item list-toggle">';
            ghtml +=
                '<a data-toggle="collapse" data-parent="#sidebar-nav-1" href="#nav_' +
                num_index +
                '" class="collapsed" aria-expanded="false">' +
                group_name +
                "</a>";

            var tag_map = group_map[group_name];

            ghtml +=
                '<ul id="nav_' +
                num_index +
                '" class="collapse" aria-expanded="false" style="height: 0px;">';

            for (tag_name in tag_map) {
                var obj = tag_map[tag_name];
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

        j_root.append(
            `<style>
                .news-v3 p {
                    margin-bottom: 10px;
                }
                .news-v3 p > code {
                    color: #555;
                    background-color: #ececec;
                }
                .news-v3 h3 {
                    margin-bottom: 4px;
                }
                .news-v3 .group {
                    font-size: 90%;
                    color: #a10f2b;
                }
                .news-v3 .code {
                    padding: 2px 3px;
                    margin: 0px 2px;
                    font-size: 95%;
                    background-color: rgba(0, 0, 0, 0.07);
                    border-radius: 4px;
                    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
                }
                .news-v3 .table > thead > tr > th {
                    vertical-align: middle;
                }
            </style>`
                .replace(/\n/g, "")
                .replace(/\s+/g, " "),
        );

        // タグ名のリストを作る（グループ順に準拠する）
        var tag_names = [];
        for (var group_name of group_names) {
            var tag_map = group_map[group_name];
            tag_names = tag_names.concat(Object.keys(tag_map));
        }
        console.log("===tag_names");
        console.log(tag_names);

        for (var key of tag_names) {
            var obj = map_doc[key];

            //説明文のパース
            exp = parseExp(obj.exp);

            var html =
                `<div  class="news-v3 bg-color-white margin-bottom-20">` +
                `<div class="news-v3-in"><a name="${key}"></a>` +
                `<h3 style="color:#a10f2b">[${key}]　${obj.title}</h3>` +
                `<ul class="list-inline posted-info"><li><span class="group">${obj.group}</span></li></ul>${exp}`;

            //デモ用のURLがあるなら差し込む
            if (typeof obj.demo != "undefined") {
                var array_demo = obj.demo.split(",");
                var demo_url =
                    "/demogame/tech_samples_" +
                    $.trim(array_demo[0]) +
                    "_v5/index.html?storage=" +
                    $.trim(array_demo[1]);
                html +=
                    '<p><a href="' +
                    demo_url +
                    '" target="_blank"">解説チュートリアル</a></p>';
            }

            //パラメータのテーブルを作っていく
            html +=
                '<table class="table table-bordered">' +
                '<thead style="background-color:pink"><tr><th>パラメータ</th><th>必須</th><th>初期値</th><th>解説</th></tr></thead>' +
                "<tbody>";

            var array_param = obj.param.split(",");

            //console.log("==== array_param  =====");
            //console.log(array_param);

            for (var k = 0; k < array_param.length; k++) {
                if (array_param[k] == "") {
                    html +=
                        '<tr ><td colspan="4">指定できるパラメータはありません。</td></tr>';
                } else {
                    var tmp_array = array_param[k].split("=");

                    //属性名
                    var param_name = $.trim(tmp_array[0]);

                    //解説
                    var param_exp = $.trim(tmp_array[1]);
                    param_exp = markup(param_exp);

                    //初期値
                    var param_initial = "";
                    try {
                        param_initial =
                            tyrano.plugin.kag.tag[key].pm[param_name];
                    } catch (err) {}
                    param_initial = param_initial ?? "";

                    //必須
                    var vital = "×";
                    if (
                        master_tag[key] != null &&
                        master_tag[key]["vital"] != null
                    ) {
                        var array_vital = master_tag[key]["vital"];

                        for (var j = 0; j < array_vital.length; j++) {
                            if (master_tag[key].vital[j] == param_name) {
                                vital = "◯";
                                break;
                            }
                        }
                    }

                    html +=
                        `<tr><td>${param_name}</td><td>${vital}</td>` +
                        `<td>${param_initial}</td><td>${param_exp}</td></tr>`;
                }
            } //end for loop

            html += "</tbody></table>";

            //サンプルコード
            if (obj.sample != "") {
                html +=
                    `<ul class="list-inline posted-info"><li>サンプルコード</li></ul>` +
                    `<pre class="language-tyranoscript"><code>${$.escapeHTML(
                        obj.sample,
                    )}</code></pre>`;
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

        // htmlを全部<textarea>にぶち込む処理には時間がかかるのでここではまだぶち込まない
        $("#src_html").val("ボタンを押してください");

        var js_auto_complete = "";
        for (key in master_tag) {
            js_auto_complete += '"' + key + '",\n';
        }
        $("#auto_complete_tag").val(js_auto_complete);
    };

    $.setHtmlToTextarea = () => {
        $("#src_html").val($(".area_main").html());
    };

    //タグ説明文のパース
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

    //マークアップ
    function markup(p) {
        //トリミング
        p = p.trim();
        //段落内における改行は<br>に変換して見た目に反映
        p = p.replace(/\n/g, "<br>");
        //インラインコードを変換
        p = p.replace(/`([^`]+)`/g, `<span class="code">$1</span>`);
        //URLを検出してリンク化
        p = p.replace(
            /https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/g,
            function (url) {
                return `<a href="${url}">${url}</a>`;
            },
        );
        return p;
    }
})(jQuery);
