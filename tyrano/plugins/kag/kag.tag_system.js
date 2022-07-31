/*
#[eval]

:group
変数・JS操作・ファイル読込

:title
式の評価

:exp
`exp`に指定されたJavaScriptの文を実行します。主に変数に値をセットする際に活用できます。

`exp`に指定する文は必ずダブルクォート（"）で囲みましょう。意図しない動作を防ぐことができます。

`exp`には任意のJavaScript文を指定できるので、関数の実行なども可能です。（高度）

:sample
[eval exp="f.akane_like=50"]
;↑ゲーム変数 akane_like に 50 という数値をセット
;あかねの好感度は50のようだ

[eval exp="f.akane_nickname=''"]
;↑ゲーム変数 akane_nickname に あーちゃん という文字列をセット
;あかねのあだ名はあーちゃんのようだ
;※文字列はシングルクォーテーション（'）で囲みます

[eval exp="f.yamato_like = f.akane_like * 2"]
;↑ゲーム変数 yamato_like に ゲーム変数 akane_like の 2倍の数値をセット
;やまとの好感度はあかねの好感度の2倍のようだ

:param
exp = 実行するJavaScript文を指定します。

:demo
1,kaisetsu/19_variable_1

#[end]
*/

//スクリプトの評価
tyrano.plugin.kag.tag.eval = {
    vital: ["exp"],

    pm: {
        exp: "",
        next: "true",
    },

    start: function (pm) {
        this.kag.evalScript(pm.exp);

        if (pm.next == "true") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[clearvar]

:group
変数・JS操作・ファイル読込

:title
変数の消去

:exp
変数を消去します。特定の変数だけを消去することもできます。

:sample

:param
exp = 消去する変数名を指定します。`f.name`や`sf.flag`のように指定します。`name``flag`では動作しません。<br>省略すると、すべての変数が消去されます。

#[end]
*/

//すべての編集を初期化
tyrano.plugin.kag.tag.clearvar = {
    //すべての変数を削除
    pm: {
        exp: "",
    },

    start: function (pm) {
        if (pm.exp == "") {
            this.kag.clearVariable();
        } else {
            this.kag.evalScript("delete " + pm.exp);
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[clearsysvar]

:group
変数・JS操作・ファイル読込

:title
システム変数の全消去

:exp
システム変数を全消去します。

:sample

:param

#[end]
*/

//システム変数の初期化
tyrano.plugin.kag.tag.clearsysvar = {
    start: function () {
        this.kag.variable.sf = {};
        //システム変数
        this.kag.ftag.nextOrder();
    },
};

/*
#[clearstack]

:group
マクロ・分岐・サブルーチン関連

:title
スタックの消去

:exp
システムが管理するスタックを消去します。<b>帰るべきスタックがない場面（タイトルや章の始まりなど、きりの良い場面）でこのタグを配置しておくことをオススメします</b>。

スタックとは、ゲームを進める中で`[call]`、`[if]`、マクロを通過するときに呼び出し元に帰ってくるために記憶しておくメモリ領域です。（森を探検するときに目印として落としておくパンくずのようなものとお考えください）

通常であれば、スタックは`[return]``[endif]``[endmacro]`を踏んだときに回収されます。しかし`[call]`先で`[return]`することなく別のシナリオにジャンプしたり、`[if]`やマクロの中でジャンプしたりすることを繰り返した場合、回収されないスタックが溜まっていきます。

スタックが溜まりすぎると、ゲームの動作が重くなったりセーブデータが肥大化したりする恐れがあります。

:sample

:param
stack = `call`、`if`、`macro`のいずれかを指定できます。特定のスタックのみ削除できます。省略すると、全てのスタックを削除します。<br>V515以降：`anim`を指定できます。`anim`を指定した場合、現在実行中のアニメーション数を強制的にゼロにして、`[wa]`で確実に次のタグに進むようにできます。なお、`stack`パラメータを省略した場合はこの操作は行われません。

#[end]
*/

//システム変数の初期化
tyrano.plugin.kag.tag.clearstack = {
    pm: {
        stack: "",
    },
    start: function (pm) {
        if (pm.stack == "") {
            this.kag.stat.stack = {
                if: [],
                call: [],
                macro: [],
            };
        } else if (pm.stack === "anim") {
            this.kag.tmp.num_anim = 0;
        } else {
            this.kag.stat.stack[pm.stack] = [];
        }
        this.kag.ftag.nextOrder();
    },
};

/*
#[close]

:group
システム操作

:title
ウィンドウを閉じる

:exp
PCアプリの場合、ウィンドウを閉じます。
ブラウザゲームの場合、タブを閉じます。

:sample

:param
ask = 終了の確認をするかどうか。`true`または`false`で指定します。デフォルトは`true`。

#[end]
*/

//ウィンドウを閉じる命令
tyrano.plugin.kag.tag["close"] = {
    pm: {
        ask: "true",
    },

    start: function (pm) {
        var that = this;
        if (pm.ask == "true") {
            $.confirm(
                $.lang("exit_game"),
                function () {
                    that.close();
                },
                function () {
                    that.kag.ftag.nextOrder();
                },
            );
        } else {
            this.close();
        }
    },

    close: function () {
        window.close();
        if (typeof navigator.app != "undefined") {
            navigator.app.exitApp();
        }
        if (typeof require != "undefined" && typeof require("nw.gui") != "undefined") {
            require("nw.gui").Window.get().close();
        }

        //最新のブラウザは、window.closeで閉じないので以下を実行。
        //※ただし、Firefoxや最新のChromeは、blankページが残る。
        //（新規で開いたページでないと、セキュリティポリシーで閉じれない）
        //window.open('about:blank','_self').close();
    },
};

/*
#[trace]

:group
変数・JS操作・ファイル読込

:title
コンソールへの値の出力

:exp
`exp`パラメータで指定された式を評価し、結果をコンソールに出力します。

ブラウザ版の場合、コンソールを確認するにはデベロッパーツールを開いてください。

:sample
;ゲーム変数testに1を入れる
[eval exp="f.test=1"]

;ゲーム変数testの内容をコンソールに出力する
[trace exp="f.test"]

:param
exp = 評価するJS式を指定します。

#[end]
*/

//変数をコンソールに出力
tyrano.plugin.kag.tag["trace"] = {
    pm: {
        exp: "",
    },

    start: function (pm) {
        var val = this.kag.embScript(pm.exp);
        //評価された値を代入
        //this.kag.ftag.startTag("text",{"val":val});

        this.kag.log("trace出力：" + val);
        this.kag.ftag.nextOrder();
    },
};

/*
#[body]

:group
システム画面・画像変更

:title
ゲーム画面外の設定

:exp
ゲーム画面サイズやゲーム画面外側の黒帯部分をカスタマイズできます。黒帯部分の色を変更したり、黒帯部分に画像を設定したり、ゲーム画面サイズをゲーム中に変更したりできます。

<b>★注意</b>
このタグで変更した内容はセーブデータのロード時に復元されません。

:sample
[body bgimage="back.png" bgcolor="black" ]

:param
bgimage  = ゲーム画面外の背景に設定する画像を指定します。`bgimage`フォルダに配置してください。,
bgrepeat = 背景に画像を指定した際の表示パターンを指定します。デフォルトは縦横に繰り返し表示されます。<br>`repeat-x`(水平方向のみ繰り返し)<br>`repeat-y`(垂直方向のみ繰り返し)<br>`round`(比率を崩して覆うように全画面繰り返し)<br>`no-repeat`(繰り返しなし),
bgcolor  = 背景色を`0xRRGGBB`形式で指定します。`bgimage`が設定されている場合は無視されます。,
bgcover  = 背景画像を画面全体に引き伸ばすかどうか。`true`または`false`で指定します。,
scWidth  = ゲーム画面のオリジナルの横幅をゲーム中に変更できます。レスポンシブ対応を想定したタグです。`Config.tjs`の`scWidth`に相当します。<br>※「オリジナルの」は「ウィンドウサイズにフィットさせるためにゲーム画面の拡縮を行う前の」という意味で用いられています。,
scHeight = ゲーム画面のオリジナルの高さをゲーム中に変更できます。レスポンシブ対応を想定したタグです。`Config.tjs`の`scHeight`に相当します。

#[end]
*/

tyrano.plugin.kag.tag["body"] = {
    vital: [],

    pm: {
        bgimage: "",
        bgrepeat: "",
        bgcolor: "",
        bgcover: "false",
        scWidth: "",
        scHeight: "",
    },

    start: function (pm) {
        if (pm.bgcolor != "") {
            $("body").css("background-color", $.convertColor(pm.bgcolor));
        }

        if (pm.bgimage != "") {
            if (pm.bgimage == "transparent") {
                //背景透過設定
                this.kag.layer.getLayer("base", "fore").hide();
                $("body").css("background-color", "transparent");
                $(".tyrano_base").css("background-color", "transparent");
            } else {
                var img_url = "";
                //画像指定
                if ($.isHTTP(pm.bgimage)) {
                    img_url = pm.bgimage;
                } else {
                    img_url = "./data/bgimage/" + pm.bgimage;
                }

                $("body").css("background-image", 'url("' + img_url + '")');
            }
        }

        if (pm.bgrepeat != "") {
            $("body").css("background-repeat", pm.bgrepeat);
        }

        if (pm.bgcover == "true") {
            $("body").css("background-size", "cover");
        }

        let flag_resize = false;

        if (pm.scWidth != "" && parseInt(pm.scWidth) != parseInt(this.kag.config.scWidth)) {
            flag_resize = true;
            this.kag.config.scWidth = parseInt(pm.scWidth);
            $(".tyrano_base").css("width", parseInt(pm.scWidth));
            $(".layer").css("width", parseInt(pm.scWidth));
        }

        if (pm.scHeight != "" && parseInt(pm.scHeight) != parseInt(this.kag.config.scHeight)) {
            flag_resize = true;
            this.kag.config.scHeight = parseInt(pm.scHeight);
            $(".tyrano_base").css("height", parseInt(pm.scHeight));
            $(".layer").css("height", parseInt(pm.scHeight));
        }

        if (flag_resize) {
            $(window).trigger("resize");
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[title]

:group
システム画面・画像変更

:title
タイトル指定

:exp
ゲームタイトルを指定します。たとえば、章ごとにタイトルを変えるとプレイヤーがわかりやすくなります。

PCアプリではウィンドウタイトル、ブラウザゲームではタブタイトルが変わります。

このタグを通過するまでのタイトルは次のようになっています。
ゲーム起動直後 … `Loading TyranoScript`
読み込み後 … `Config.tjs`の`System.title`で設定されたテキスト

:sample
[title name="変更後のタイトル"]

:param
name = 表示したいタイトルを指定します

#[end]
*/

tyrano.plugin.kag.tag["title"] = {
    vital: ["name"],

    pm: {
        name: "",
    },

    //タイトルの設定
    start: function (pm) {
        if (pm.name != "") {
            //タイトルの設定
            this.kag.setTitle(pm.name);
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[iscript]

:group
変数・JS操作・ファイル読込

:title
JavaScriptの記述

:exp
`[iscript]`と`[endscript]`に囲まれた箇所にJavaScriptの文を記述できます。

:sample
[iscript]

var test = 22;
f.name = test;
//JavaScriptの関数にアクセス可能
alert("JavaScript");
//jQueryも利用可能
$("body").html();

//JS方式の行コメントも書けますが
;ティラノスクリプトの行コメントも有効のままなので注意が必要です
;alert("!!")

[endscript]

:param

:demo
1,kaisetsu/19_variable_1

#[end]
*/

//スクリプト開始
tyrano.plugin.kag.tag.iscript = {
    start: function (pm) {
        this.kag.stat.is_script = true;
        this.kag.stat.buff_script = "";
        this.kag.ftag.nextOrder();
    },
};

/*
#[endscript]

:group
変数・JS操作・ファイル読込

:title
JavaScriptの終了

:exp
JavaScriptの記述を終了します。

:sample

:param
stop = 【高度】`true`を指定すると、`[endscript]`に到達したときに次のタグに進まなくなります。JavaScriptの記述によってシナリオをジャンプさせたい場合に`true`を指定します。

#[end]
*/

//スクリプト終了
tyrano.plugin.kag.tag.endscript = {
    pm: {
        stop: "false",
    },

    start: function (pm) {
        var that = this;
        this.kag.stat.is_script = false;
        //スクリプトを実行する
        try {
            this.kag.evalScript(this.kag.stat.buff_script);
        } catch (err) {
            that.kag.error("error_in_iscript");
            console.error(err);
        }
        this.kag.stat.buff_script = "";

        if (pm.stop == "false") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[html]

:group
メニュー・HTML表示

:title
HTMLをレイヤ追加

:exp
`[html]`と`[endhtml]`の間に記述したHTMLを表示できます。このHTMLは最前面に表示されます。

この機能は非常に強力です。JavaScript、Canvas、YouTubeのプレイヤーなどを埋め込むことができ、次世代Web表現を全てサポートします。

HTMLの記述内にティラノスクリプトの変数を使うことができます。通常のテキスト通り`[emb]`タグを使用してください。

<b>★注意</b>
HTML表示中は画面をクリックしてもゲームが進みません。必ずグラフィックボタンなどを配置して、ジャンプでゲームを進める状態にしてください。

:sample
;youtubeのプレイヤーを指定した位置に挿入します
;yoububeから埋め込み用タグを取得してきています
[html top=100 left=300]

<object width="200" height="113">
<param name="movie" value="http://www.youtube.com/v/60TMm2sQTBU?version=3&amp;hl=ja_JP&amp;rel=0">
</param>
<param name="allowFullScreen" value="true"></param>
<param name="allowscriptaccess" value="always"></param>
<embed src="http://www.youtube.com/v/60TMm2sQTBU?version=3&amp;hl=ja_JP&amp;rel=0" type="application/x-shockwave-flash" width="200" height="113" allowscriptaccess="always" allowfullscreen="true">
</embed></object>

[endhtml]

:param
left = HTMLの左端位置を指定します。（ピクセル）,
top  = HTMLの上端位置を指定します。（ピクセル）,
name = HTML領域に名前を指定できます。この名前を使って、HTML領域に対してアニメーションを実行することができます。

:demo
2,kaisetsu/11_html

#[end]
*/
//htmlの表示、そして、格納だわな。
tyrano.plugin.kag.tag.html = {
    pm: {
        layer: "",
        top: 0,
        left: 0,
    },

    start: function (pm) {
        this.kag.stat.is_html = true;
        this.kag.stat.map_html = {};
        this.kag.stat.map_html.buff_html = "";
        this.kag.stat.map_html.buff_pm = pm;

        this.kag.ftag.nextOrder();
    },
};

/*
#[endhtml]

:group
メニュー・HTML表示

:title
HTMLの終了

:exp
HTMLの記述を終了します。

:sample

:param

#[end]
*/
//htmlの終了
tyrano.plugin.kag.tag.endhtml = {
    start: function (pm) {
        var that = this;

        var tpm = this.kag.stat.map_html.buff_pm;
        var html = this.kag.stat.map_html.buff_html;

        var html_obj = $("<div></div>");
        html_obj.css("position", "absolute");
        html_obj.css("top", tpm.top + "px");
        html_obj.css("left", tpm.left + "px");

        $.setName(html_obj, tpm.name);

        html_obj.append($(html));

        var layer_free = this.kag.layer.getFreeLayer();

        /*
         layer_free.unbind("click");
         layer_free.bind("click",function(){

         that.kag.ftag.nextOrder();
         layer_free.unbind("click");

         });
         */

        layer_free.css("z-index", 9999999);
        layer_free.append(html_obj);

        layer_free.show();

        this.kag.stat.is_html = false;
        this.kag.stat.map_html = {};
        this.kag.ftag.nextOrder();
    },
};

/*
#[emb]

:group
変数・JS操作・ファイル読込

:title
式評価結果の埋め込み

:exp
`exp`で指定されたJavaScriptの文を評価し、その結果をテキストとして表示します。

変数の中身をシナリオに埋め込みたい場合に使います。

:sample
;ゲーム変数 name に ポチ という文字列をセット
[eval exp="f.name='ポチ'"]
;↑長くなるためここでは扱いませんが
; [edit]タグでプレイヤーに入力させてみても面白いですね

;テキスト中に変数の中身を埋め込む
今日からこの子の名前は[emb exp="f.name"]だ。[l][r]

;キャラの名前のようなケースでは
;仮名でマクロ化しておくとシナリオファイルが読みやすくなるでしょう
[macro name="シロ"]
  [emb exp="f.name"]
[endmacro]

;仮名マクロで記述する
おーい、[シロ]。[シロ]！元気？[s]
;※サンプルでは f.name に ポチ が入っているのでポチと表示される

:param
exp = 評価するJavaScriptの式を指定します。基本的には変数の名前を指定すればよいでしょう。`f.name``sf.text`など。

#[end]
*/

tyrano.plugin.kag.tag.emb = {
    vital: ["exp"],

    pm: {
        exp: "",
    },

    log_join: "true",

    start: function (pm) {
        var val = "" + this.kag.embScript(pm.exp);
        //評価された値を代入
        this.kag.ftag.startTag("text", {
            val: val,
            backlog: "join",
        });
    },
};

/*
#[if]

:group
マクロ・分岐・サブルーチン関連

:title
条件分岐

:exp
条件分岐を行います。

`exp`に指定されたJavaScriptの式を評価します。その結果が`true`(真)ならば、`[elsif]``[else]``[endif]`のいずれかまでにある文章やタグを実行します。`false`(偽)ならば、次の`[elsif]``[else]``[endif]`のいずれかに移動します。

JavaScriptの比較式の例を以下に示します。例中の`A`や`B`には、変数、数値、文字列、式などを当てはめることができます。

`A === B` AとBは等しい
`A !== B` AとBは等しくない
`A > B` AはBよりも大きい
`A >= B` AはB以上である
`A < B` AはBよりも小さい
`A <= B` AはB以下である

<b>★高度</b>
`exp`には比較式以外も記述できます。`true`や`false`などのキーワードを直接指定したり、変数を指定したり、関数を実行したりできます。JavaScriptにはいくつか特殊な`trueとして扱われる値`が存在しますので、注意が必要です。

:sample
;ゲーム変数 like に 50 という数値をセット
;自由に変えてみてください
[iscript]
f.like = 50
[endscript]

例1[p]

[if exp="f.like < 30"]
  好感度が低いです[p]
[endif]

例2[p]

[if exp="f.like < 3c0"]
  好感度が低いです[p]
[else]
  好感度が低くはないようです[p]
[endif]

例3[p]

[if exp="f.like >= 80"]
  最高の好感度です[p]
[elsif exp="f.like >= 40"]
  かなり高い好感度です[p]
[else]
  好感度は高くありません[p]
[endif]

:param
exp = 評価するJavaScriptの式を指定します。

:demo
1,kaisetsu/20_variable_2

#[end]
*/

//条件分岐
tyrano.plugin.kag.tag["if"] = {
    vital: ["exp"],

    pm: {
        exp: "",
    },

    log_join: "true",

    start: function (pm) {
        //条件合格
        if (this.kag.embScript(pm.exp)) {
            //実行済み、次にels elsif が出てきても、無視する
            //this.kag.pushStack("if", true);
            this.kag.pushStack("if", { bool: true, deep: pm.deep_if });

            //普通に次の処理を実行
            this.kag.ftag.nextOrder();

            //条件ミス
        } else {
            //まだ、if文をぬけられない
            //this.kag.pushStack("if", false);
            this.kag.pushStack("if", { bool: false, deep: pm.deep_if });
            const done = this.kag.ftag.nextOrderWithTagSearch({
                else: "",
                elsif: "",
                endif: "",
            });
            if (!done) {
                this.kag.error("missing_endif");
            }
        }
    },
};

/*
#[elsif]

:group
マクロ・分岐・サブルーチン関連

:title
条件分岐（複数の条件）

:exp
`[if]`タグと`[endif]`タグの間で使います。分岐の条件を増やして、複雑な分岐を行なうことができます。

このタグまでに記述された`[if]``[elsif]`タグの条件をまだ満たしていない場合に`exp`を評価します。その結果が`true`(真)ならば、次の`[elsif]``[else]``[endif]`のいずれかまでにある文章やタグを実行します。`false`(偽)ならば、次の`[elsif]``[else]``[endif]`のいずれかに移動します。

使い方の例については`[if]`タグの項目を参照してください。

:sample

:param
exp = 評価する JS 式を指定します。

:demo
1,kaisetsu/20_variable_2

#[end]
*/

tyrano.plugin.kag.tag["elsif"] = {
    vital: ["exp"],

    pm: {
        exp: "",
    },

    log_join: "true",

    start: function (pm) {
        //条件合格
        if (this.kag.getStack("if").bool == false && this.kag.embScript(pm.exp)) {
            this.kag.setStack("if", { bool: true, deep: pm.deep_if });

            this.kag.ftag.nextOrder();

            //条件ミス
        } else {
            const done = this.kag.ftag.nextOrderWithTagSearch({
                else: "",
                elsif: "",
                endif: "",
            });
            if (!done) {
                this.kag.error("missing_endif");
            }
        }
    },
};

/*
#[else]

:group
マクロ・分岐・サブルーチン関連

:title
条件分岐（条件を満たさなかったとき）

:exp
`[if]`もしくは`[elsif]`タグと`[endif]`タグの間で用いられます。 このタグまでに記述された`[if]``[elsif]`タグの条件をまだ満たしていない場合に、このタグから`[endif]`までの記述が実行されます。

使い方の例については`[if]`タグの項目を参照してください。


:sample

:param

:demo
1,kaisetsu/20_variable_2

#[end]
*/

tyrano.plugin.kag.tag["else"] = {
    pm: {
        exp: "",
    },

    log_join: "true",

    start: function (pm) {
        //条件合格
        if (this.kag.getStack("if").bool == false) {
            this.kag.setStack("if", { bool: true, deep: pm.deep_if });

            this.kag.ftag.nextOrder();

            //条件ミス
        } else {
            const done = this.kag.ftag.nextOrderWithTagSearch({
                endif: "",
            });
            if (!done) {
                this.kag.error("missing_endif");
            }
        }
    },
};

/*
#[endif]

:group
マクロ・分岐・サブルーチン関連

:title
条件分岐の終了

:exp
`[if]`文を終了します。`[if]`文の終わりに必ず記述する必要があります。

:sample

:param

#[end]
*/

tyrano.plugin.kag.tag["endif"] = {
    log_join: "true",

    start: function () {
        //普通に次の処理を実行すればいいんじゃないか
        this.kag.popStack("if");
        //スタック取り出し
        this.kag.ftag.nextOrder();
    },
};

/*
#[call]

:group
マクロ・分岐・サブルーチン関連

:title
サブルーチンの呼び出し

:exp
指定したシナリオファイル・ラベルにジャンプします。

ジャンプ先で`[return]`タグに到達すると、`[call]`タグの場所にまた戻ってきます。<b>`[return]`タグで戻ってこれる</b>という点が`[jump]`タグとの違いです。

`[call]`タグのジャンプ先のことを<b>サブルーチン</b>と呼びます。たとえば、何度も使うことになる同じ処理をサブルーチンとして記述して`[call]`で呼び出すようにする、という使い方があります。

`[call]`タグが実行されるとスタックがひとつ溜まります。スタックは`[return]`で回収されます。スタックについては`[clearstack]`の項目もご確認ください。

:sample
頭をなでた。[p]
[call target=sub]
しっぽをなでた。[p]
[call target=sub]
おなかをなでた。[p]
[call target=sub]
おわり[s]

*sub
[font color=green]
好感度が上がったぞ！
[resetfont][p]
[return]


:param
storage = 呼び出したいサブルーチンのあるのシナリオファイルを 指定します。省略すると、現在 のシナリオファイル内であるとみなされます。,
target  = 呼び出すサブルーチンのラベルを指定します。省略すると、ファイルの先頭から実行されます。

:demo
1,kaisetsu/21_macro

#[end]
*/

tyrano.plugin.kag.tag["call"] = {
    pm: {
        storage: null,
        target: null, //ラベル名
        countpage: true,
        auto_next: "yes",
    },

    start: function (pm) {
        var back_pm = {};
        back_pm.index = this.kag.ftag.current_order_index;
        back_pm.storage = this.kag.stat.current_scenario;
        back_pm.auto_next = pm.auto_next;

        back_pm.caller = pm;

        //コールはラベルに対して行われる
        this.kag.pushStack("call", back_pm);

        if (pm.target == null && pm.storage != null) {
            this.kag.ftag.nextOrderWithIndex(-1, pm.storage);
        } else {
            this.kag.ftag.nextOrderWithLabel(pm.target, pm.storage);
        }
    },
};

/*
#[return]

:group
マクロ・分岐・サブルーチン関連

:title
サブルーチンから戻る

:exp
サブルーチンから呼び出し元に戻ります。詳細は`[call]`の項目を参照してください。

:sample

:param

:demo
 1,kaisetsu/21_macro

#[end]
*/

//呼び出し元に戻る
tyrano.plugin.kag.tag["return"] = {
    start: function () {
        //マクロからの場合、ここから、呼び出さないとだめ。だからmacro で return は使えない
        var pm = this.kag.getStack("call");
        //最新のコールスタックを取得
        //呼び出し元に戻る

        //make.ksが終わるときの判定用
        if (pm.caller && pm.caller.storage) {
            if (pm.caller.storage == "make.ks" || pm.caller.storage == this.kag.stat.resizecall["storage"]) {
                if (this.kag.tmp.loading_make_ref == true) {
                    this.kag.stat.flag_ref_page = true;
                    this.kag.tmp.loading_make_ref = false;
                    // ティラノイベント"load-complete"を発火
                    this.kag.trigger("load-complete");
                }
            }
        }

        var auto_next = pm.auto_next;
        this.kag.popStack("call");

        this.kag.ftag.nextOrderWithIndex(pm.index, pm.storage, undefined, undefined, auto_next);
        //スタックを奪い取る
    },
};

/*
#[macro]

:group
マクロ・分岐・サブルーチン関連

:title
マクロ定義の開始

:exp
マクロ記述を開始します。<b>自分で新しいタグを定義することが出来ます</b>。

`[macro]`から`[endmacro]`タグまでにある文章やタグは、`name`属性で指定されたタグとして登録されます。登録されたあとは自由に使用できるようになります。

マクロの中に書かれたタグには、特殊なパラメータの指定の記述方法が存在します。

パラメータの値の先頭に`%`を付けると、マクロに渡されたパラメータの値を流用できます。このとき、`|`を使って属性の省略値を指定することもできます。サンプルコードを見れば理解しやすいでしょう。

またタグのなかに`*`を書くと、マクロに渡されたすべてのパラメータをそのタグに流用できます。

:sample
;自分で[my_color_1]というタグを作れる！！
[macro name="my_color_1"]
  [font color="0xff0000"]
  新しいタグです[p]
  [resetfont]
[endmacro]

;さっそく使ってみる
[my_color_1]

;iroパラメータを指定できる、もし指定がなかったら0xff0000
[macro name="my_color_2"]
  [font color=%iro|0xff0000]
  iroパラメータを指定できるタグです[p]
  [resetfont]
[endmacro]

;さっそく使ってみる
[my_color_2 iro=0x00ff00]
[my_color_2]

;すべてのパラメータを流用するマクロ
[macro name="my_color_3"]
  [font *]
  すべてのパラメータを渡せるタグです[p]
  [resetfont]
[endmacro]

[my_color_3 color=0x0000ff bold=true size=80]

:param
name = <p>マクロの名前を指定します。以後、この名前をタグのように記述することで、マクロを呼び出せるようになります。</p><p><b>★重要</b><br>ティラノスクリプトにすでに使用されているタグ名は使わないでください。また`text`や`label`も使えません。</p>

:demo
 1,kaisetsu/21_macro

#[end]
*/

//マクロの定義
tyrano.plugin.kag.tag.macro = {
    vital: ["name"],

    pm: {
        name: "",
    },

    log_join: "true",

    start: function (pm) {
        var index = this.kag.ftag.current_order_index;
        var storage = this.kag.stat.current_scenario;
        this.kag.stat.map_macro[pm.name] = {
            storage: storage,
            index: index,
        };

        this.kag.tmp.checking_macro = true;

        const done = this.kag.ftag.nextOrderWithTagSearch({
            endmacro: "",
        });
        if (!done) {
            this.kag.error("missing_endmacro");
        }
    },
};

/*
#[endmacro]

:group
マクロ・分岐・サブルーチン関連

:title
マクロ定義の終了

:exp
マクロの記述を終了します。

:sample

:param

#[end]
*/

//マクロ終了
tyrano.plugin.kag.tag.endmacro = {
    log_join: "true",

    start: function (pm) {
        //解析チェック中にここに来た場合は、なにもしない
        if (this.kag.tmp.checking_macro == true) {
            this.kag.tmp.checking_macro = false;
            this.kag.ftag.nextOrder();
            return;
        }

        //最新のマクロスタックを取得
        var map_obj = this.kag.getStack("macro");

        //マクロスタックが取得できたかどうか
        if (map_obj) {
            //マクロスタックが取得できた場合（取得できない、ということは通常ではありえない）

            //マクロスタックをpop
            this.kag.popStack("macro");

            //さらにスタックを取得してみよう
            var macro_stack = this.kag.getStack("macro") || { pm: {} };
            //↑マクロの中で呼ばれたマクロの[endmacro]のケースではこれが取得できる！
            //↑最も表層のマクロの[endmacro]のケースではundefinedとなってしまうので初期値を代入

            //mpを復元
            this.kag.stat.mp = $.extend({}, macro_stack.pm);

            this.kag.ftag.nextOrderWithIndex(map_obj.index, map_obj.storage, true);
        } else {
            //呼び出し元がない場合、普通に次の処理を行えば良い
            //endmacroの場合はだめじゃないでしょうか。。。
            //this.kag.ftag.nextOrder();
        }
    },
};

/*
#[erasemacro]

:group
マクロ・分岐・サブルーチン関連

:title
マクロの削除

:exp
登録したマクロを削除します。

:sample

:param
name = 削除するマクロ名を指定します。

#[end]
*/

//マクロの削除
tyrano.plugin.kag.tag.erasemacro = {
    vital: ["name"],

    pm: {
        name: "",
    },

    start: function (pm) {
        delete this.kag.stat.map_macro[pm.name];
        this.kag.ftag.nextOrder();
    },
};

/*
#[savesnap]

:group
システム操作

:title
セーブスナップの作成

:exp
現在のプレイ状況を一時保存します。その後、`tyrano.ks`拡張の`[setsave]`を行うことで、ここで記録したセーブデータが保存されます。

:sample

:param
title = セーブデータのタイトルを指定します。

#[end]
*/

//セーブスナップの保存
tyrano.plugin.kag.tag.savesnap = {
    vital: ["title"],

    pm: {
        title: "",
    },

    start: function (pm) {
        var that = this;
        this.kag.menu.snapSave(pm.title, function () {
            that.kag.ftag.nextOrder();
        });
    },
};

/*
#[autosave]

:group
システム操作

:title
オートセーブを実行

:exp
このタグに到達した際、自動的にプレイ状況を保存します。

`[autosave]`されたデータが存在する場合、`sf.system.autosave`に`true`が格納されます。

サンプルコードのような判定ロジックをタイトル画面より前に用意しておくことで、前回のプレイ状況からゲームを再開するような仕組みが作れます。

:sample
オートセーブデータの判定を行います[l][r]

[if exp="sf.system.autosave === true"]

  自動的に保存されたデータが存在します。ロードしますか？[r]
  [link target=select1]【１】はい[endlink][r]
  [link target=select2]【２】いいえ[endlink][r]
  [s]

  *select1
  ロードを実行します[l]
  [autoload]

  *select2
  [cm]
  ロードを実行しません[l][r]

[else]

  自動的に保存されたデータはありません[l][r]

[endif]

オートセーブを実行しました[autosave][l][r]
ゲームを再起動してみてください[s]

:param
title = セーブデータのタイトルを指定します。

#[end]
*/

tyrano.plugin.kag.tag.autosave = {
    vital: [],

    pm: {
        title: "",
    },

    start: function (pm) {
        var that = this;

        //タイトルが設定されいない場合は現在のテキストを設定
        if (pm.title == "") {
            pm.title = this.kag.stat.current_save_str;
        }

        this.kag.menu.snapSave(pm.title, function () {
            that.kag.menu.doSetAutoSave();
            that.kag.ftag.nextOrder();
        });
    },
};

/*
#[autoload]

:group
システム操作

:title
オートロードを実行

:exp
`[autosave]`タグで保存されたデータを読み込みます。

:sample

:param

#[end]
*/

tyrano.plugin.kag.tag.autoload = {
    vital: [],

    pm: {
        title: "",
    },

    start: function (pm) {
        var game_data = $.getStorage(this.kag.config.projectID + "_tyrano_auto_save", this.kag.config.configSave);
        this.kag.menu.loadAutoSave();
    },
};

/*
#[ignore]

:group
マクロ・分岐・サブルーチン関連

:title
条件によりシナリオを無視

:exp

`exp`に指定されたJavaScriptの式を評価します。その結果が`true`(真)ならば、`[ignore]`と`[endignore]`で囲まれた文章やタグが無視されます。

:sample

:param
exp = 評価するJavaScriptの式を指定します。

#[end]
*/

tyrano.plugin.kag.tag.ignore = {
    vital: ["exp"],

    pm: {
        exp: "",
    },

    start: function (pm) {
        if (this.kag.embScript(pm.exp)) {
            const done = this.kag.ftag.nextOrderWithTagSearch({
                endignore: "",
            });
            if (!done) {
                this.kag.error("missing_endignore");
            }
        } else {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[endignore]

:group
マクロ・分岐・サブルーチン関連

:title
[ignore]の終了

:exp
`[ignore]`の記述を終了します。

:sample

:param

#[end]
*/

tyrano.plugin.kag.tag.endignore = {
    start: function () {
        this.kag.ftag.nextOrder();
    },
};

/*
#[edit]

:group
入力フォーム

:title
テキストボックス

:exp
プレイヤーが入力可能なテキストボックスを表示します。

テキストボックス表示中はシナリオの進行が止まります。必ずグラフィックボタンなどを配置してジャンプできるようにしてください。

入力されたテキストは`[commit]`タグが実行されるタイミングで指定された変数に格納されます。`[commit]`タグが実行される時点でテキストボックスがまだ表示されている必要があります。`[glink]`と組み合わせる場合、`[glink]`タグに`cm=false`を指定してください。

<b>★高度</b>
テキストボックスのデザインは`tyrano/tyrano.css`を編集することで調整可能です。

:sample
この子の名前を決めなければ…[l]

[edit name="f.dog_name" left=50 top=100]
[glink text="決定" target=next x=250 y=100 cm=false]
[s]

*next
[commit name="f.dog_name"]
[cm]
この子の名前は「[emb exp=f.dog_name]」だ！[r]
やあ[emb exp=f.dog_name]！一緒に遊ぼう！[s]

:param
name         = プレイヤーの入力テキストを保存する変数名を指定してください。,
initial      = テキストボックスの初期値を設定できます。,
color        = 文字の色を指定します。,
left         = テキストボックスの横位置を指定します。,
top          = テキストボックスの縦位置を指定します。,
autocomplete = 入力の履歴を表示するかどうか。`true`または`false`で指定します。,
size         = 文字のサイズを指定します。,
width        = テキストボックスの横幅を指定します。,
height       = テキストボックスの高さを指定します。,
maxchars     = 最大入力文字数を指定します。

:demo
 1,kaisetsu/15_input_1

#[end]
*/

//テキストボックス、ティラノスクリプト
tyrano.plugin.kag.tag.edit = {
    vital: ["name"],

    pm: {
        name: "",
        length: "", //ピクセル　横幅
        initial: "",
        placeholder: "",
        color: "black",
        left: "0",
        top: "0",
        size: "20",
        face: "",
        width: "200",
        autocomplete: "false",
        height: "40",
        maxchars: "1000",
    },

    start: function (pm) {
        var j_text = $("<input class='text_box form' name='" + pm.name + "' type='text' value='' />");

        //指定がない場合はデフォルトフォントを適応する
        if (pm.face == "") {
            pm.face = this.kag.stat.default_font.face;
        }

        pm = $.minifyObject(pm);

        var new_style = {
            "color": $.convertColor(pm.color),
            "left": parseInt(pm.left),
            "top": parseInt(pm.top),
            "placeholder": pm.placeholder,
            "width": pm.width,
            "height": pm.height,
            "font-size": parseInt(pm.size),
            "font-family": pm.face,
        };

        //クラスとイベントを登録する
        this.kag.event.addEventElement({
            tag: "edit",
            j_target: j_text,
            pm: pm,
        });
        this.setEvent(j_text, pm);

        j_text.css(new_style);
        j_text.css("position", "absolute");

        j_text.attr("maxlength", pm.maxchars);

        if (pm.autocomplete == "true") {
            j_text.attr("autocomplete", "on");
        } else {
            j_text.attr("autocomplete", "off");
        }

        this.kag.layer.getFreeLayer().append(j_text);
        this.kag.layer.getFreeLayer().show();

        this.kag.ftag.nextOrder();
    },

    setEvent: function (j_text, pm) {
        var that = TYRANO;
        var _pm = pm;

        (function () {
            //初期値の設定
            j_text.val(_pm.initial);

            j_text.click(function () {
                j_text.focus();
            });

            j_text.on("keydown", function (e) {
                //バブリング停止
                e.stopPropagation();
            });
        })();
    },
};

/*
#[preload]

:group
変数・JS操作・ファイル読込

:title
素材ファイルの事前読み込み

:exp
`[preload]`タグを使用することで、素材ファイル（画像や音楽）を事前に読み込むことができます。
実際に素材を使用する際に表示がスムーズになります。

V515以降：プリロードした音声ファイルは一度再生した時点で破棄される仕様になりました（メモリを圧迫しないようにするため）。
システム効果音やBGMなど、繰り返し使うことが予想される音声ファイルをプリロードするときは`single_use="false"`を指定することを検討してください。

:sample

;画像ファイルはフルパス（プロジェクトファイル以下）で指定します
[preload storage="data/fgimage/girl.jpg"]

;配列を渡すと、まとめてロードすることもできます。
[iscript]
f.preload_images = [
  'data/fgimage/girl.jpg',
  'data/fgimage/haruko.png',
  'data/fgimage/miku1.png',
  'data/fgimage/miku2.png'
];
[endscript]

[preload storage=&f.preload_images]

:param
storage = プリロードするファイルをフルパスで指定します。JavaScriptの配列を指定することもできます。,
wait    = `true`を指定すると、すべての読み込みが完了するまでゲームを停止します。`true`にする場合は画面に「Now Loading」などと表示しておき、素材のロード中であることをプレイヤーに知らせるべきでしょう。,
single_use = 音声ファイルを読み込む場合にのみ意味を持つパラメータです。`true`(デフォルト)を指定するとプリロードデータが使い捨てとなり、[playbgm]などでプリロードデータを一度使用した時点でプリロードデータが破棄されます（メモリを圧迫しないようにするため）。一度使ったあともプリロードデータを保持したい場合は`false`を指定してください。`false`を指定した場合であっても`[unload]`タグを使うことでプリロードデータを明示的に破棄できます。,
name       = 音声ファイルを読み込む場合にのみ意味を持つパラメータです。たとえば"bgm"、"se"、"section1"などのグループ名を付けておくことで、あとで`[unload]`タグでデータを破棄する際に対象をまとめて指定できます。カンマ区切りで複数指定可。,

#[end]
*/

//画像ファイルの事前読み込み
tyrano.plugin.kag.tag.preload = {
    vital: ["storage"],

    pm: {
        storage: "",
        wait: "false",
        single_use: "true",
        name: "",
    },

    start: function (pm) {
        var that = this;

        if (pm.wait == "true") {
            this.kag.layer.hideEventLayer();
        }

        var storage = pm.storage;

        // プリロードオプション
        const preload_option = {
            single_use: pm.single_use === "true",
            name: pm.name || "",
        };

        //配列で指定された場合
        if (typeof storage == "object" && storage.length > 0) {
            var sum = 0;

            for (var i = 0; i < storage.length; i++) {
                that.kag.preload(
                    storage[i],
                    function () {
                        sum++;
                        if (storage.length == sum) {
                            //すべてのプリロードが完了
                            if (pm.wait == "true") {
                                that.kag.layer.showEventLayer();
                                that.kag.ftag.nextOrder();
                            }
                        }
                    },
                    preload_option,
                );
            }

            if (pm.wait == "false") {
                that.kag.layer.showEventLayer();
                that.kag.ftag.nextOrder();
            }
        } else {
            this.kag.preload(
                pm.storage,
                function () {
                    if (pm.wait == "true") {
                        that.kag.layer.showEventLayer();
                        that.kag.ftag.nextOrder();
                    }
                },
                preload_option,
            );

            if (pm.wait == "false") {
                that.kag.layer.showEventLayer();
                that.kag.ftag.nextOrder();
            }
        }
    },
};

/*
#[unload]

:group
変数・JS操作・ファイル読込

:title
音声プリロードデータの破棄

:exp
`[preload]`タグに`single_use="false"`を指定したうえで多数の音声ファイルをプリロードしていると、音声プリロードデータがメモリを圧迫して動作に悪影響を及ぼすことがあります。

`[unload]`タグを使うことで、音声プリロードデータを明示的に破棄できます。`storage``name``all_sound`のいずれかのパラメータを指定してください。

:sample

:param
storage   = 破棄する音声プリロードデータの場所。`[preload]`に指定していたものを指定します。,
name      = `[preload]`に指定した`name`を使って対象をまとめて指定できます。,
all_sound = `true`を指定すると、すべての音声プリロードデータを破棄します。,

#[end]
*/

//画像ファイルの事前読み込み
tyrano.plugin.kag.tag.unload = {
    pm: {
        storage: "",
        name: "",
        all_sound: "false",
    },

    start: function (pm) {
        var that = this;

        if (pm.all_sound === "true") {
            for (const key in this.kag.tmp.preload_audio_map) {
                const audio_obj = this.kag.tmp.preload_audio_map[key];
                if (audio_obj) {
                    audio_obj.unload();
                    delete this.kag.tmp.preload_audio_map[key];
                }
            }
        } else if (pm.name) {
            for (const key in this.kag.tmp.preload_audio_map) {
                const audio_obj = this.kag.tmp.preload_audio_map[key];
                if (audio_obj) {
                    if (audio_obj.__names.includes(pm.name)) {
                        audio_obj.unload();
                        delete this.kag.tmp.preload_audio_map[key];
                    }
                }
            }
        } else if (pm.storage) {
            const key = $.parseStorage(pm.storage);
            const audio_obj = this.kag.tmp.preload_audio_map[key];
            if (audio_obj) {
                audio_obj.unload();
                delete this.kag.tmp.preload_audio_map[key];
            }
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[clearfix]

:group
画像・背景・レイヤ操作

:title
fixレイヤーのクリア

:exp
fixレイヤーの要素を消去します。`name`属性を指定することで特定の要素のみを消去することもできます。

fixレイヤーはゲームの最前面にある特殊なレイヤーであり、主にセーブやロードなどの固定ボタンを配置する場所です。

:sample

;fixレイヤーへの追加
[ptext name="sample" layer=fix page=fore text="テキストテキスト" size=30 x=200 y=100 color=red ]

;fixレイヤーのクリア
[clearfix name="sample"]

:param
name = これを指定すると、該当する要素だけを消去することができます。

#[end]
*/

tyrano.plugin.kag.tag.clearfix = {
    pm: {
        name: "",
    },

    start: function (pm) {
        if (pm.name != "") {
            $(".fixlayer." + pm.name).remove();
        } else {
            $(".fixlayer").remove();
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[commit]

:group
入力フォーム

:title
フォームの確定

:exp
`[edit]`で表示したテキストボックスの入力内容を確定し、`name`属性で指定した変数に値をセットします。

<b>★注意</b>
`[commit]`が実行されるタイミングで、まだテキストボックスが表示されている必要があります。

:sample

:param

:demo
1,kaisetsu/15_input_1

#[end]
*/

tyrano.plugin.kag.tag.commit = {
    start: function () {
        var that = this;

        this.kag.layer
            .getFreeLayer()
            .find(".form")
            .each(function () {
                var name = $(this).attr("name");
                var val = $(this).val();

                var str = name + " = '" + val + "'";

                that.kag.evalScript(str);

                //console.log($(this));
            });

        that.kag.ftag.nextOrder();
    },
};

/*
#[cursor]

:group
システム画面・画像変更

:title
マウスカーソルに画像を設定

:exp
マウスカーソルに画像を設定することができます。画像は`data/image`フォルダに配置してください。使用可能な画像形式は`gif``png``jpg`です。

ゲーム中に何度でも変更することが可能です。[cursor]タグを通過する前の標準カーソルを指定したい場合は`data/system/Config.tjs`の`cursorDefault`を変更します。

システムの標準カーソルに戻す場合は`default`を指定します。

<b>★ヒント</b>
マウスカーソル画像の推奨サイズは<b>32x32ピクセル以下</b>です。

ブラウザによって異なるケースがありますが、概ね、マウスカーソルに設定可能な最大の画像サイズは128x128ピクセルです。それより大きい画像をマウスカーソルに設定することはできません。

また、32x32ピクセルよりも大きな画像をマウスカーソルに設定した場合、画面端にマウスカーソルを移動させたときにカーソル画像がデフォルトに戻ってしまうことがあります。

<b>★注意</b>
開発者ツール（デベロッパーツール）を開いている場合などには、マウスカーソルの自動非表示が利かないことがあります。


:sample
;デフォルトのマウスカーソル画像を変更
[cursor storage="my_cursor_32x32.png"]

;ボタンの上にマウスカーソルを乗せたときの画像を変更
[cursor storage="my_cursor_pointer_32x32.png" type="pointer"]

;一定時間マウスの操作がなかった場合にマウスカーソルを非表示にする
[cursor auto_hide="true"]

;クリックエフェクトを有効にする
[cursor click_effect="true"]

;クリックエフェクトの設定変更
[cursor e_width="200" e_color="0xff0000" e_time="600" e_scale="200" e_blend="normal" e_opacity="100"]

;クリックエフェクトの設定変更(デフォルト設定)
[cursor e_width="100" e_color="0xffffff" e_time="300" e_scale="120" e_blend="overlay" e_opacity="204"]

:param
storage = マウスカーソルに設定する画像ファイルを指定します。画像は`data/image`フォルダに配置します。`default`と指定するとデフォルトのカーソルに戻せます。,
x       = 指定した数値の分だけ、マウスカーソルに設定する画像を左側にずらすことができます。,
y       = 指定した数値の分だけ、マウスカーソルに設定する画像を上側にずらすことができます。,
type    = ボタン類にマウスを載せたときのカーソルを変更したい場合、このパラメータに`pointer`を指定します。,
auto_hide    = プレイヤーが一定時間マウス操作をしなかった場合にマウスカーソルを自動で非表示にするための設定です。`true`で自動非表示が有効、`false`で自動非表示が無効（常にマウスカーソル表示）になります。また、`2000`のように数値を指定することで、マウスカーソルの自動非表示を有効にした上でマウスカーソルを非表示にするまでの時間をミリ秒単位で設定できます。,
click_effect = クリックエフェクトを有効にするかどうか。`true`または`false`で指定します。,
e_width      = クリックエフェクトの横幅をpx単位で指定します。,
e_opacity    = クリックエフェクトの最初の不透明度を`0～255`で指定します。,
e_time       = クリックエフェクトの表示時間をミリ秒単位で指定します。,
e_color      = クリックエフェクトの色を指定します。,
e_blend      = クリックエフェクトの合成モードを指定します。`[layermode]`タグのmodeパラメータと同じキーワードが指定可能です。`normal`や`overlay`など。,
e_scale      = クリックエフェクトの拡大率をパーセント単位で指定します。たとえば`200`と指定すると、エフェクトサイズが最終的に200%になるように拡大されていきます。,

#[end]
*/

tyrano.plugin.kag.tag.cursor = {
    pm: {
        storage: "",
        x: "0",
        y: "0",
        type: "default",
        click_effect: "",
        mousedown_effect: "",
        touch_effect: "",
        next: "true",
    },

    start: function (pm) {
        // storage パラメータになにかしらが指定されている場合
        if (pm.storage) {
            // なんのカーソルを変更するか
            if (pm.type === "default") {
                // デフォルトのカーソルを変更したい場合
                this.kag.setCursor(pm);
            } else {
                // デフォルト以外のカーソル（たとえば pointer）を変更したい場合
                // current_cursor_map オブジェクトに情報を格納してから overwriteCSS() を呼ぶ
                if (!this.kag.stat.current_cursor_map) {
                    this.kag.stat.current_cursor_map = {};
                }
                let image_url;
                let css_str;
                if (pm.storage === "default") {
                    css_str = pm.type;
                } else {
                    image_url = `./data/image/${pm.storage}`;
                    css_str = `url(${image_url}) ${pm.x} ${pm.y}, ${pm.type}`;
                }
                this.kag.key_mouse.vmouse.addImage(pm.type, image_url, pm.x, pm.y);
                this.kag.stat.current_cursor_map[pm.type] = css_str;
                this.overwriteCSS();
            }
        }

        //
        // カーソルの自動非表示
        //

        if (pm.auto_hide === "false") {
            // 自動非表示を無効にする場合

            // ステータスを更新してイベントを取り外す
            this.kag.stat.cursor_auto_hide = false;
            $("body").off("mousemove.cursor_auto_hide");

            // この時点でカーソルが非表示になっている可能性があるので表示してやる
            this.kag.setCursor(this.kag.stat.current_cursor);
        } else if (pm.auto_hide) {
            // 自動非表示を有効にする場合

            // ステータスを更新してイベントを取り外す
            this.kag.stat.cursor_auto_hide = pm.auto_hide;
            const j_body = $("body").off("mousemove.cursor_auto_hide");

            // マウスカーソルを非表示にする setTimeout の timerId 管理変数
            this.kag.tmp.cursor_hide_timer = null;

            // タイムアウト
            const timeout = parseInt(pm.auto_hide) || 3000;

            // いまマウスカーソルが表示されているかどうかのフラグ
            this.kag.tmp.is_cursor_visible = true;

            // マウスを動かすたびに呼ばれる
            j_body.on("mousemove.cursor_auto_hide", () => {
                // マウスを動かしたのでマウスカーソルを表示してあげよう
                // ただし mousemove のたびに都度 setCursor を呼ぶのは無駄なのでフラグで管理する
                // フラグが立っていないときだけ setCursor は呼ぶ、呼んだらフラグを立てる
                if (!this.kag.tmp.is_cursor_visible) {
                    this.kag.setCursor(this.kag.stat.current_cursor);
                    this.kag.tmp.is_cursor_visible = true;
                }

                // timeout ミリ秒後にマウスカーソルを非表示にする予約を改めて取り付ける
                clearTimeout(this.kag.tmp.cursor_hide_timer);
                this.kag.tmp.cursor_hide_timer = setTimeout(() => {
                    // カーソルを非表示にしてフラグを折る
                    j_body.setStyle("cursor", "none");
                    this.kag.tmp.is_cursor_visible = false;
                }, timeout);
            });
        }

        //
        // クリックエフェクト
        //

        // クリックエフェクトの情報格納領域をステータス上に作成
        if (!this.kag.stat.click_effect) {
            this.kag.stat.click_effect = {};
        }

        // クリックエフェクトの有効・無効を操作する場合
        if (pm.click_effect) {
            // とりあえずクリックイベントリスナを取り外す
            if (typeof this.kag.tmp.show_effect_callback === "function") {
                document.body.removeEventListener("click", this.kag.tmp.show_effect_callback, { capture: true });
            }

            // click_effect ステータスを更新
            this.kag.stat.click_effect.is_enabled = pm.click_effect === "true";

            // クリックエフェクトを有効にする場合
            if (this.kag.stat.click_effect.is_enabled) {
                // クリックイベントリスナを tmp 領域に作成
                // ※ あとで removeEventListener するときリスナを参照できるようにするため
                if (typeof this.kag.tmp.show_effect_callback !== "function") {
                    this.kag.tmp.show_effect_callback = (e) => {
                        this.showEffect(e);
                    };
                }

                // クリックイベントリスナを useCapture で取り付ける
                document.body.addEventListener("click", this.kag.tmp.show_effect_callback, { capture: true });
            }
        }

        // e_ から始まるパラメータはクリックエフェクト用のパラメータであるため
        // e_ を取り外した上で click_effect ステータスに保存する
        for (const key in pm) {
            if (key.includes("e_")) {
                const _key = key.substring(2);
                this.kag.stat.click_effect[_key] = pm[key];
            }
        }

        //
        // next="false" が渡されていない限り nextOrder
        //

        if (pm.next !== "false") {
            this.kag.ftag.nextOrder();
        }
    },

    /**
     * セーブデータロード時のカーソル関連の復元
     */
    restore: function () {
        // デフォルトのカーソルを復元する
        this.kag.setCursor(this.kag.stat.current_cursor);

        // ポインターのカーソルを復元する
        this.overwriteCSS();

        // カーソルの自動非表示を復元する
        this.kag.ftag.startTag("cursor", {
            auto_hide: String(this.kag.stat.cursor_auto_hide || false),
            next: "false",
        });

        // クリックエフェクトを復元する
        this.kag.ftag.startTag("cursor", {
            click_effect: String(this.kag.stat.click_effect && this.kag.stat.click_effect.is_enabled),
            next: "false",
        });
    },

    /**
     * クリックエフェクトを表示する
     * @param {Event} e
     */
    showEffect: function (e) {
        if (e.pageX === undefined || e.pageY === undefined) {
            return;
        }
        if (!this.kag.stat.click_effect) {
            this.kag.stat.click_effect = {};
        }
        const base_width = parseInt(this.kag.stat.click_effect.width) || 100;
        const width = parseInt(base_width * this.kag.tmp.screen_info.scale_x);
        const scale = this.kag.stat.click_effect.scale || 120;
        const color = $.convertColor(this.kag.stat.click_effect.color || "white");
        const blend = this.kag.stat.click_effect.blend || "overlay";
        const duration = parseInt(this.kag.stat.click_effect.time) || 300;
        const opacity = $.convertOpacity(this.kag.stat.click_effect.opacity) || 0.8;
        const j_effect = $('<div class="tyrano_click_effect">').appendTo("body");
        j_effect
            .setStyleMap({
                "top": `${e.pageY}px`,
                "left": `${e.pageX}px`,
                "width": `${width}px`,
                "height": `${width}px`,
                "opacity": opacity,
                "--scale": `${scale}%`,
                "mix-blend-mode": blend,
                "background-color": color,
                "animation-duration": `${duration}ms`,
            })
            .show();
        setTimeout(() => {
            j_effect.remove();
        }, duration);
    },

    /**
     * メニューボタンやリモーダルに設定されている cursor: pointer; を
     * <style>要素を用いてユーザー指定のカーソル画像で上書きするための処理
     * [cursor]タグで設定を変更した段階、あるいは、セーブデータをロードした段階で呼ぶ
     */
    overwriteCSS: function () {
        // current_cursor_map　が未定義なら必要ない
        if (!this.kag.stat.current_cursor_map) {
            return;
        }

        // pointer の設定が未定義ならやはり必要ない
        if (!this.kag.stat.current_cursor_map.pointer) {
            return;
        }

        // ゲームを起動してからカーソル上書き用の<style>要素をまだ作ったことがないならいま作ろう
        if (!this.kag.tmp.j_cursor_css) {
            this.kag.tmp.j_cursor_css = $("<style />");
            this.kag.tmp.j_cursor_css.appendTo("head");
        }

        // <style>要素の textContent を作成
        const pointer_css = this.kag.stat.current_cursor_map.pointer || "pointer";
        const css_text = `
            .remodal-cancel,
            .remodal-confirm,
            .button_menu,
            .menu_item img,
            .save_list_item {
                cursor: ${pointer_css};
            }
        `;

        // <style>要素の textContent を更新
        this.kag.tmp.j_cursor_css.text(css_text);
    },
};

/*
#[screen_full]

:group
システム操作

:title
フルスクリーン

:exp
ゲーム画面をフルスクリーンにします。再度呼び出すことでフルスクリーンからウィンドウに戻ります。

PCゲームでのみ動作します。

:sample
[screen_full]

:param

#[end]
*/

tyrano.plugin.kag.tag.screen_full = {
    vital: [],

    pm: {},

    start: function (pm) {
        this.kag.menu.screenFull();

        this.kag.ftag.nextOrder();
    },
};

/*
#[sleepgame]

:group
マクロ・分岐・サブルーチン関連

:title
ゲームの一時停止

:exp

このタグに到達した時点でゲームの状態を保存した上で、他のシナリオにジャンプできます。ジャンプ先で`[awakegame]`に到達するとゲームの状態が`[sleepgame]`時点に復帰します。

このタグはゲームから一時的に画面を遷移したい場合に非常に強力に機能します。たとえばゲームの途中でコンフィグの設定を行いたい場合には、`[sleepgame]`で進行状態を保持したうえでコンフィグ用のシナリオファイルに移動したあと、`[awakegame]`タグでゲームに復帰するような挙動が可能です。

`[sleepgame]`は複数実行することはできません。つまり、`[sleepgame]`で休止中の状態で`[sleepgame]`するようなことはできません。ジャンプ先には必ず`[awakegame]`を配置してください。

休止中に`[breakgame]`タグを踏むと戻ってくることなく休止中の状態を破棄します。

`[sleepgame]`の動作を`[button]`に登録することもできます。`[button]`タグに`role=sleepgame`を指定することで`[sleepgame]`の挙動になります。

:sample

[sleepgame storage="scene3.ks" target="*start" ]

;buttonに紐付ける方法
[button name="button" role="sleepgame" fix="true" graphic="button/skip.gif" x=450 y=400 storage="scene3.ks" ]

:param
storage = !!jump,
target  = !!jump,
next    = `true`または`false`を指定します。`false`を指定すると`[awakegame]`で戻ってきたときに次のタグに進まなくなります。

:demo
2,kaisetsu/09_sleepgame

#[end]
*/

tyrano.plugin.kag.tag.sleepgame = {
    vital: [],

    pm: {
        storage: "",
        target: "",
        next: true,
    },

    start: function (pm) {
        var that = this;

        //タイトルが設定されていない場合は現在のテキストを設定
        var title = this.kag.stat.current_save_str;

        //スナップを保存。サムネは不要
        this.kag.menu.snapSave(
            title,
            function () {
                //保存したスナップを、sleep領域に配置したうえで、ジャンプする
                that.kag.menu.setGameSleep(pm.next);
                that.kag.ftag.startTag("jump", pm);
            },
            "false",
        );
    },
};

/*
#[awakegame]

:group
マクロ・分岐・サブルーチン関連

:title
ゲームの一時停止からの復帰

:exp
`[sleepgame]`タグで保存されたゲームの状態に復帰します。

ジャンプ先でゲーム変数を操作した場合、その内容は復帰後に反映されます。

セーブデータをロードするときと同様に、ゲームの復帰時には`make.ks`を通過します。休止中の操作に対してなんらかの特別な処理を実行したい場合、`make.ks`でゲーム変数などを使って`[awakegame]`からの復帰かどうかの判定をいれるとよいでしょう。

:sample

:param
variable_over = `true`または`false`を指定します。`true`を指定すると、`[sleepgame]`中のゲーム変数の変更を復帰後に引き継ぎます。,
bgm_over      = `true`または`false`を指定します。`true`を指定すると、`[sleepgame]`中のBGMを復帰後に引き継ぎます。

:demo
2,kaisetsu/09_sleepgame

#[end]
*/

tyrano.plugin.kag.tag.awakegame = {
    vital: [],

    pm: {
        variable_over: "true", // f変数を引き継ぐか
        sound_opt_over: "true", // stat の map_se_volume, map_bgm_volume を引き継ぐか
        bgm_over: "true",
    },

    start: function (pm) {
        var that = this;

        if (this.kag.tmp.sleep_game == null) {
            //this.kag.error("保存されたゲームがありません。[awakegame]タグは無効です");
            //データがない場合はそのまま次の命令へ
            this.kag.ftag.nextOrder();
        } else {
            var sleep_data = this.kag.tmp.sleep_game;

            //f変数を継承する
            if (pm.variable_over == "true") {
                sleep_data.stat.f = this.kag.stat.f;
            }

            if (pm.sound_opt_over === "true") {
                sleep_data.stat.map_se_volume = this.kag.stat.map_se_volume;
                sleep_data.stat.map_bgm_volume = this.kag.stat.map_bgm_volume;
            }

            var options = {
                bgm_over: pm.bgm_over,
            };

            if (this.kag.tmp.sleep_game_next == true) {
                options["auto_next"] = "yes";
            }

            this.kag.menu.loadGameData($.extend(true, {}, sleep_data), options);

            this.kag.tmp.sleep_game = null;
        }
    },
};

/*
#[breakgame]

:group
マクロ・分岐・サブルーチン関連

:title
ゲームの停止データの削除

:exp
`[sleepgame]`タグで保存した休止状態を破棄します。

休止状態に復帰する必要がなくなった段階で`[breakgame]`を配置するとよいでしょう。

:sample

:param

#[end]
*/

tyrano.plugin.kag.tag.breakgame = {
    vital: [],

    pm: {},

    start: function (pm) {
        var that = this;

        this.kag.tmp.sleep_game = null;
        this.kag.ftag.nextOrder();
    },
};

/*
#[dialog]

:group
システム操作

:title
ダイアログ表示

:exp
確認用のダイアログを表示します。

ダイアログは以下のタイプがあります。
`alert``confirm``input`

※`input`は廃止予定です。使用は推奨されません。

:sample
;警告
[dialog type="alert" text="ここから先は危険地帯です"]

;確認してOKならシナリオジャンプ
[dialog type="confirm" text="本当に進みますか？" target="ok" target_cancel="cancel"]

*ok
進みます[p]
[jump target=input]

*cancel
進みませんでした[p]
[jump target=input]

*input
;inputは廃止予定！！
;入力
[dialog type="input" name="f.name" text="名前を教えてください" target="next"]

*next
あなたの名前は[emb exp="f.name"]ですね[s]

:param
type           = ダイアログの種類を以下のキーワードのいずれかで指定します。<br>`alert`(警告)<br>`confirm`(確認)<br>`input`(入力),
name           = 入力ダイアログの場合に、入力内容を保存する変数名を指定します。`f.name`など。,
text           = ダイアログに表示するメッセージを記述します。,
storage        = OKボタンが押されたときのジャンプ先のシナリオファイルを指定します。省略すると、現在のシナリオファイルとみなされます。,
target         = OKボタンが押されたときのジャンプ先のラベルを指定します。省略すると、シナリオファイルの先頭とみなされます。<br><br><b>なお、`storage`と`target`が両方省略されている場合、単に次のタグに進みます。</b>,
storage_cancel = キャンセルボタンが押されたときのジャンプ先のシナリオファイルを指定します。省略すると、現在のシナリオファイルとみなされます。,
target_cancel  = キャンセルボタンが押されたときのジャンプ先のラベルを指定します。省略すると、シナリオファイルの先頭とみなされます。,
label_ok       = OKボタンのテキストを変更できます。,
label_cancel   = キャンセルボタンのテキストを変更できます。　
#[end]
*/

tyrano.plugin.kag.tag.dialog = {
    vital: [],

    pm: {
        name: "tf.dialog_value",
        type: "alert",
        text: "",
        storage: "",
        target: "",
        storage_cancel: "",
        target_cancel: "",
        label_ok: "OK",
        label_cancel: "Cancel",
    },

    start: function (pm) {
        var that = this;

        $(".remodal").find(".remodal-confirm").html(pm.label_ok);
        $(".remodal").find(".remodal-cancel").html(pm.label_cancel);

        if (pm.type == "confirm") {
            $.confirm(
                pm.text,
                function () {
                    that.finish(pm);
                },
                function () {
                    pm.storage = pm.storage_cancel;
                    pm.target = pm.target_cancel;
                    that.finish(pm);
                },
            );
        } else if (pm.type == "input") {
            alertify.set({
                buttonFocus: "none",
                labels: {
                    ok: pm.label_ok,
                    cancel: pm.label_cancel,
                },
            });
            alertify.prompt(pm.text, function (flag, text) {
                if (flag) {
                    var name = pm.name;
                    var val = text;
                    var str = name + " = '" + val + "'";

                    that.kag.evalScript(str);
                } else {
                    pm.storage = pm.storage_cancel;
                    pm.target = pm.target_cancel;
                }

                that.finish(pm);
            });

            $(".alertify-text").on("keydown", function (e) {
                e.stopPropagation();
            });
        } else {
            //alert
            $.alert(pm.text, function () {
                that.finish(pm);
            });
        }

        //this.kag.ftag.nextOrder();
    },

    //終わった後どうするか
    finish: function (pm) {
        if (pm.storage != "" || pm.target != "") {
            this.kag.ftag.startTag("jump", pm);
        } else {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[plugin]

:group
変数・JS操作・ファイル読込

:title
プラグイン読み込み

:exp
外部プラグインを読み込むことができます。
プラグインは`data/others/plugin`フォルダに配置します。

`[plugin]`タグには自由にパラメータを指定することができます。たとえば、

`[plugin name="my_plugin" my_color="black" my_name="シケモク"]`

と指定すると、プラグインの`init.ks`のなかで

`mp.my_color`
`mp.my_name`

のような形で引数を利用できます。

これを`&mp.my_color`のように使うことで、カスタマイズ可能なプラグインが作れます。

ただし、マクロで使用可能だった`%my_color`のような形での使用はできません。

:sample
;プラグイン my_plugin を読み込み
[plugin name="my_plugin" ]
;↑ data/others/plugin/my_plugin/init.ks にジャンプしているよ

;自由に引数を渡すことも可能
[plugin name="my_plugin" font_color="black" arg2="aaaaaa" ]

:param
name    = 読み込むプラグインの名前を指定します。プラグインは`data/others/plugin`フォルダに配置します。,
storage = 最初に読み込むシナリオファイルを変更できます。

:demo
2,kaisetsu/06_plugin

#[end]
*/

tyrano.plugin.kag.tag.plugin = {
    vital: ["name"],

    pm: {
        name: "",
        storage: "init.ks",
    },

    start: function (pm) {
        var storage_url = "";
        var name = pm.name;

        pm.storage = "../others/plugin/" + name + "/" + pm.storage;

        //引数に渡す。
        this.kag.stat.mp = pm;

        this.kag.ftag.startTag("call", pm);
    },
};

/*
#[sysview]

:group
システム画面・画像変更

:title
システム画面変更

:exp
システム系機能で使用するHTMLファイルを変更できます。

:sample
[sysview type="save" storage="./data/others/plugin/mytheme/html/save.html" ]
[sysview type="load" storage="./data/others/plugin/mytheme/html/load.html" ]
[sysview type="backlog" storage="./data/others/plugin/mytheme/html/backlog.html" ]
[sysview type="menu" storage="./data/others/plugin/mytheme/html/menu.html]

:param
type    = `save``load``backlog``menu`が指定可能です。,
storage = HTMLファイルのパスを指定します。

#[end]
*/

tyrano.plugin.kag.tag.sysview = {
    vital: ["type", "storage"],

    pm: {
        type: "",
        storage: "",
    },

    start: function (pm) {
        var type = pm.type;
        var storage = pm.storage;

        //システムで使用するHTMLの場所を変更する
        //HTMLキャッシュは削除する
        if (this.kag.cache_html[type]) {
            delete this.kag.cache_html[type];
        }

        this.kag.stat.sysview[type] = storage;

        this.kag.ftag.nextOrder();
    },
};

/*
#[loadcss]

:group
変数・JS操作・ファイル読込

:title
CSS反映

:exp
ゲームの途中でCSSを読み込むことができます。

:sample
;CSSファイルの読み込み
[loadcss file="./data/others/css/mystyle.css" ]

:param
file = 読み込むCSSファイルのパスを指定します。パスは`data/`から記述します。

:demo
1,kaisetsu/22_font

#[end]
*/

tyrano.plugin.kag.tag.loadcss = {
    vital: ["file"],

    pm: {
        file: "",
    },

    start: function (pm) {
        var file = pm.file;

        //ファイルの読み込み
        var style = '<link class="_tyrano_cssload_tag" rel="stylesheet" href="' + file + "?" + Math.floor(Math.random() * 10000000) + '">';
        const j_style = $(style);
        $("head link:last").after(j_style);
        if (this.kag.config["keyFocusWithHoverStyle"] === "true") {
            j_style.on("load", () => {
                $.copyHoverCSSToFocusCSS(j_style);
            });
        }
        this.kag.stat.cssload[file] = true;

        this.kag.ftag.nextOrder();
    },
};

/*
#[save_img]

:group
システム画面・画像変更

:title
セーブデータのサムネイル変更

:exp
セーブデータのサムネイルに好きな画像を指定できます。

通常、セーブデータのサムネイルにはセーブした瞬間のゲーム画面のキャプチャが使用されます。しかし`[save_img]`タグを使用することで、特定の画像をサムネイルにすることができます。

画像ファイルは`data/bgimage`フォルダに配置します。

`storage`に`default`を指定すると、通常のサムネイル（ゲーム画面のキャプチャ）に戻すことができます。

:sample
;サムネイル画像の変更
[save_img storage="my_capture.png" ]

:param
storage = サムネイルに設定したい画像ファイルを設定します。`bgimage`フォルダに配置してください。`default`を指定すると画面キャプチャに戻ります。,
folder  = 画像を`bgimage`フォルダ以外から取得したい場合は、ここに指定します。たとえば`others``fgimage``image`など。

:demo
2,kaisetsu/10_save_img

#[end]
*/

tyrano.plugin.kag.tag.save_img = {
    vital: [],

    pm: {
        storage: "",
        folder: "",
    },

    start: function (pm) {
        var storage = pm.storage;
        var folder = "";
        var storage_url = "";

        if (pm.storage == "") {
            pm.storage = "default";
        }

        if (pm.folder != "") {
            folder = pm.folder;
        } else {
            folder = "bgimage";
        }

        //画像指定
        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        } else {
            storage_url = "./data/" + folder + "/" + pm.storage;
        }

        if (pm.storage == "default") {
            storage_url = "";
        }

        //画像の場所を指定する。
        this.kag.stat.save_img = storage_url;

        this.kag.ftag.nextOrder();
    },
};

/*
#[nolog]

:group
メッセージ関連の設定

:title
バックログ記録の一時停止

:exp
このタグに到達すると、テキストがバックログに記録されなくなります。

`[endnolog]`タグに到達すると、バックログへの記録が再開されます。

:sample
ここはログに記録される[p]
[nolog]
ログに記録されない[p]
ここもログに記録されない[p]
[endnolog]
ここから、ログ記録再開[p]

:demo
2,kaisetsu/07_pushlog

#[end]
*/

tyrano.plugin.kag.tag.nolog = {
    vital: [],

    pm: {},

    start: function (pm) {
        this.kag.stat.log_write = false;
        //記録しないフラグ追加
        this.kag.ftag.nextOrder();
    },
};

/*
#[endnolog]

:group
メッセージ関連の設定


:title
バックログ記録の再開

:exp
`[nolog]`タグで一時停止したバックログへの記録を再開します。

:sample
ここはログに記録される[p]
[nolog]
ログに記録されない[p]
ここもログに記録されない[p]
[endnolog]
ここから、ログ記録再開[p]

:demo
2,kaisetsu/07_pushlog

#[end]
*/

tyrano.plugin.kag.tag.endnolog = {
    vital: [],

    pm: {},

    start: function (pm) {
        this.kag.stat.log_write = true;
        //記録しないフラグ追加
        this.kag.ftag.nextOrder();
    },
};

/*
#[pushlog]

:group
メッセージ関連の設定

:title
バックログにテキスト追加

:exp
バックログに任意のテキストを追加できます。

たとえば`[mtext]`で表示したアニメーションテキストは、そのままではバックログに記録されません。しかし、`[mtext]`に併せて`[pushlog]`を使うことで、バックログにアニメーションテキストの内容を記録することができます。

:sample
[pushlog text="ここに好きなログ文字列を記述できます"]

:param
text = バックログに追加するテキストを指定します。,
join = バックログを前のテキストに連結するかどうか。`true`または`false`で指定します。

:demo
2,kaisetsu/07_pushlog

#[end]
*/

tyrano.plugin.kag.tag.pushlog = {
    vital: ["text"],

    pm: {
        text: "",
        join: "false",
    },

    start: function (pm) {
        if (pm.join == "true") {
            this.kag.pushBackLog(pm.text, "join");
        } else {
            this.kag.pushBackLog(pm.text, "add");
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[start_keyconfig]

:group
システム操作

:title
キーコンフィグ操作の有効化

:exp
`[stop_keyconfig]`で無効化したキーコンフィグを有効化できます。

:sample
[start_keyconfig]

:param

#[end]
*/

tyrano.plugin.kag.tag.start_keyconfig = {
    pm: {},

    start: function (pm) {
        this.kag.stat.enable_keyconfig = true;
        this.kag.ftag.nextOrder();
    },
};

/*
#[stop_keyconfig]

:group
システム操作

:title
キーコンフィグ操作の無効化

:exp
キーコンフィグを一時的に無効化します。`[start_keyconfig]`で再び有効化できます。

無効になるのは次の操作です。
・マウス操作
・キーボード操作
・マウスのスワイプ操作

:sample
キーコンフィグが有効[p]
[stop_keyconfig]
ここは無効[p]
ここも無効[p]
[start_keyconfig]
ここからまた有効[p]

:param

#[end]
*/

tyrano.plugin.kag.tag.stop_keyconfig = {
    pm: {},

    start: function (pm) {
        this.kag.stat.enable_keyconfig = false;
        this.kag.ftag.nextOrder();
    },
};

/*
#[apply_local_patch]

:group
システム操作

:title
パッチファイルの適用

:exp
V470以降で使用可。<b>PCアプリとして配布している場合のみ有効です</b>。

このタグに到達した時点で、パッチファイルをゲームに反映します。

`data`フォルダ以外（`tyrano`本体）をアップデートするときは、このタグではなく、起動時のアップデートで対応してください。

パッチファイルの容量が大きい場合は一時的にゲームが停止します。ロード中などのテキストを表示するとプレイヤーに親切でしょう。

:sample
[apply_local_patch file="test.tpatch" ]

:param
file   = パッチファイルのパスを指定します。exeファイルの階層を起点として指定します,
reload = `true`または`false`を指定します。`true`を指定すると、パッチ反映後にゲームが自動的に再起動されます。

#[end]
*/

tyrano.plugin.kag.tag.apply_local_patch = {
    vital: ["file"],

    pm: {
        file: "",
        reload: "false",
    },

    start: function (pm) {
        var that = this;

        if (!$.isNWJS() && !$.isElectron()) {
            that.kag.ftag.nextOrder();
            return;
        }

        var patch_path = $.localFilePath() + "/" + pm.file;

        that.kag.applyPatch(patch_path, pm.reload, function () {
            that.kag.ftag.nextOrder();
        });
    },
};

/*
#[check_web_patch]

:group
システム操作

:title
アップデートのチェック

:exp
V470以降で使用可。<b>PCアプリとして配布している場合のみ有効です</b>。

サーバーに配置してあるアップデートパッチに更新がある場合、自動的にメッセージを表示して、パッチの適応を促すことができます。（パッチの反映にはゲームの再起動が必要です）

サーバーをレンタルして`json`ファイルと`tpatch`ファイルを配置する必要があります。

:sample
[check_web_patch url="http://tyrano.jp/patch/mygame.json" ]

:param
url = パッチの`json`ファイルのURLを指定します。

#[end]
*/

tyrano.plugin.kag.tag.check_web_patch = {
    vital: ["url"],

    pm: {
        url: "",
        reload: "false",
    },

    start: function (pm) {
        var that = this;

        if (!$.isNWJS() && !$.isElectron()) {
            that.kag.ftag.nextOrder();
            return;
        }

        $.ajax({
            url: pm.url + "?" + Math.floor(Math.random() * 1000000),
            cache: false,
            dataType: "json",
            success: function (json) {
                if (typeof json != "object") {
                    json = JSON.parse(json);
                }

                that.checkPatch(json, pm);
            },
            error: function (e) {
                console.log(e);
                alert("file not found:" + pm.url);
            },
        });
    },

    checkPatch: function (obj, pm) {
        var that = this;

        //バージョンの確認
        if (typeof this.kag.variable.sf._patch_version == "undefined") {
            this.kag.evalScript("sf._patch_version=" + this.kag.config["game_version"]);
        }

        if (parseFloat(this.kag.variable.sf._patch_version) < parseFloat(obj.version)) {
            $.confirm(
                "新しいアップデートが見つかりました。Ver:" +
                    parseFloat(obj.version) +
                    "「" +
                    obj.message +
                    "」<br>アップデートを行いますか？",
                function () {
                    alert("アップデートを行います。完了後、自動的にゲームは終了します。");

                    var http = require("http");
                    var fs = require("fs");

                    var file = obj.file;
                    // URLを指定
                    var url = $.getDirPath(pm.url) + file;

                    if (url.indexOf("https") != -1) {
                        http = require("https");
                        //alert("エラー：SSL(https)の通信は非対応です");
                        //return;
                    }

                    // 出力ファイル名を指定
                    var patch_path = $.localFilePath();
                    patch_path = patch_path + "/" + file;

                    var outFile = fs.createWriteStream(patch_path);

                    var flag = false;
                    // ダウンロード開始
                    var req = http.get(url, function (res) {
                        res.pipe(outFile);

                        res.on("end", function () {
                            outFile.close();
                            //アップデートを実行
                            that.kag.evalScript("sf._patch_version=" + obj.version);

                            window.close();

                            //require('nw.gui').Window.get().close();
                        });
                    });

                    // エラーがあれば扱う。
                    req.on("error", function (err) {
                        console.log("Error: ", err);
                        return;
                    });
                },
                function () {
                    that.kag.ftag.nextOrder();
                },
            );
        } else {
            that.kag.ftag.nextOrder();
        }

        console.log(obj);

        //ディレクトリのみ変更して差し替えて実行。
        //メッセージは表示するよ。
        //バージョンを確認。未反映ならダウンロードして配置する。
        //再起動
    },
};

/*
#[set_resizecall]

:group
システム画面・画像変更

:title
レスポンシブデザイン対応

:exp
プレイ端末の画面比率が入れ替わったタイミングでシナリオを呼び出すことができます。

たとえば、タテ持ち→ヨコ持ちになったタイミングで、ヨコ持ち用の座標へ変更するスクリプトを実行。

逆に、ヨコ持ち→タテ持ちになったタイミングで、タテ持ち用の座標へ変更するスクリプトを実行。

このように実装することで、様々なレイアウトに対応したゲームを作ることができます。

なお、呼び出した先では必ず`[return]`を実行する必要があります。

公式の実践テクニック解説もご覧ください。
https://tyrano.jp/usage/advance/responsive

:sample
[call storage="resize.ks"]

;画面比率が変わったタイミングでresize.ksを呼び出す、という宣言
[set_resizecall storage="resize.ks" ]

:param
storage = !!jump,
target  = !!jump

:demo

#[end]
*/

//背景変更
tyrano.plugin.kag.tag.set_resizecall = {
    vital: ["storage"],

    pm: {
        storage: "",
        target: "",
    },

    start: function (pm) {
        var that = this;

        //ストレージとターゲット
        this.kag.stat.resizecall["storage"] = pm.storage;
        this.kag.stat.resizecall["target"] = pm.target;

        //強制発火
        //this.kag.tmp.largerWidth = !this.kag.tmp.largerWidth;
        //$(window).trigger("resize");

        this.kag.ftag.nextOrder();
    },
};

/*
#[closeconfirm_on]

:group
システム操作

:title
終了時の確認の有効化

:exp
このタグを通過してからは、タグが進行する度にゲームが「未保存状態」になります。ゲームが「未保存状態」のときにプレイヤーがゲームを閉じようとすると、確認ダイアログが出ます。

ゲームが「保存状態」になるのはプレイヤーがセーブまたはロードしたときです。

:sample

ここで閉じようとしても終了時の確認はない[p]
ここで閉じようとしても終了時の確認はない[p]
[closeconfirm_on]
ここから未保存状態で閉じようとすると終了時の確認が出る[p]
ここから未保存状態で閉じようとすると終了時の確認が出る[p]
[closeconfirm_off]
ここで閉じようとしても終了時の確認はない[p]
ここで閉じようとしても終了時の確認はない[p]

:param

#[end]
*/

tyrano.plugin.kag.tag.closeconfirm_on = {
    pm: {},

    start: function (pm) {
        this.kag.stat.use_close_confirm = true;
        this.kag.ftag.nextOrder();
    },
};

/*
#[closeconfirm_off]

:group
システム操作

:title
終了時の確認の無効化

:exp
このタグを通過すると、ゲームが「未保存状態」のときにプレイヤーがゲームを閉じようとしても確認ダイアログが出なくなります。

#[end]
*/

tyrano.plugin.kag.tag.closeconfirm_off = {
    pm: {},

    start: function (pm) {
        this.kag.stat.use_close_confirm = false;
        $.disableCloseConfirm();
        this.kag.ftag.nextOrder();
    },
};
