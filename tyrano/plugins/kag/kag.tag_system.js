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
システムデザイン変更

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
システムデザイン変更

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
#[checkpoint]

:group
システム操作

:title
チェックポイントの登録

:exp
`[rollback]`タグでチェックポイントの地点へ戻ってくることができます。
チェックポイントを作りすぎるとゲームの動作が重くなる場合があります。
必要最低限に留めておき、不要になったら`[clear_checkpoint]`タグで削除しましょう。

:sample

[checkpoint name="p1"]

;ここでいろいろ画面をつくりかえる

;チェックポイントの位置へどこからでも戻ることができる
[rollback checkpoint="p1"]

:param
name = チェックポイント名を指定します。

#[end]
*/

tyrano.plugin.kag.tag.checkpoint = {
    vital: ["name"],

    pm: {
        name: "",
    },

    start: function (pm) {
        
        var that = this;
        var name = pm.name;
        
        this.kag.menu.snapSave("checkpoint", function () {
            that.kag.menu.doSetCheckpoint(name);
            that.kag.ftag.nextOrder();
        },"false");
    },
};


/*
#[rollback]

:group
システム操作

:title
ロールバック

:exp
`[checkpoint]`タグを通過した場所にどこからでも戻ることができます。

:sample

[checkpoint name="p1"]

;ここでいろいろ画面をつくりかえる

;チェックポイントの位置へどこからでも戻ることができる
[rollback checkpoint="p1"]

:param
checkpoint = チェックポイント名を指定します。,
variable_over = `true`または`false`を指定します。`true`を指定すると、ロールバック後に現在のゲーム変数を引き継ぎます。デフォルトは`true`,
bgm_over      = `true`または`false`を指定します。`true`を指定すると、ロールバック後にBGMを引き継ぎます。デフォルトは`false`

#[end]
*/

tyrano.plugin.kag.tag.rollback = {
    vital: ["checkpoint"],

    pm: {
        checkpoint: "",
        variable_over: "true",
        bgm_over:"false",
    },

    start: function (pm) {
        
        let result = this.kag.menu.doRollback(pm.checkpoint,pm.variable_over,pm.bgm_over);
        if (result == false) {
            this.kag.error("チェックポイント「"+pm.checkpoint+"」は存在しません");
            this.kag.ftag.nextOrder();            
        }
    },
};

/*
#[clear_checkpoint]

:group
システム操作

:title
チェックポイントの削除

:exp
`[checkpoint]`タグをクリアすることができます。
チェックポイントは便利ですが不用意に増やしすぎるとゲームの動作に影響します。
不要になったチェックポイントはこまめに削除しておきましょう。

:sample

;チェックポイントの作成
[checkpoint name="p1"]

[clear_checkpoint name="p1"]

:param
name = 削除するチェックポイント名を指定します。指定しない場合はすべてのチェックポイントが削除されます


#[end]
*/

tyrano.plugin.kag.tag.clear_checkpoint = {
    vital: [],

    pm: {
        name: "",
    },

    start: function (pm) {
        
        if (pm.name == "") {
            this.kag.stat.checkpoint = {};
        } else {
            delete this.kag.stat.checkpoint[pm.name];
        }
        this.kag.ftag.nextOrder();            
        
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
            this.kag.weaklyStop();
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
                                that.kag.cancelWeakStop();
                                that.kag.ftag.nextOrder();
                            }
                        }
                    },
                    preload_option,
                );
            }

            if (pm.wait == "false") {
                that.kag.cancelWeakStop();
                that.kag.ftag.nextOrder();
            }
        } else {
            this.kag.preload(
                pm.storage,
                function () {
                    if (pm.wait == "true") {
                        that.kag.cancelWeakStop();
                        that.kag.ftag.nextOrder();
                    }
                },
                preload_option,
            );

            if (pm.wait == "false") {
                that.kag.cancelWeakStop();
                that.kag.ftag.nextOrder();
            }
        }
    },
};

/*
#[wait_preload]

:group
変数・JS操作・ファイル読込

:title
素材ファイルの事前読み込みの完了待機

:exp
`[preload]`タグをwait=falseで利用した後、何かの演出を挟んだ後、全てのpreloadが終わるのを待機します。

:sample

;preloadで複数の画像をwait=falseで読み込みます
[preload storage="data/fgimage/girl.jpg" wait="false"]
[preload storage="data/fgimage/haruko.jpg" wait="false"]
;読み込んでいる間に別のアニメーションをします
[quake2 time="1000" wait="true"]
;まだ終わっていない場合は終わるまで待機します
[wait_preload]

#[end]
*/
tyrano.plugin.kag.tag.wait_preload = {
    start: function (pm) {
        var that = this;
        that.kag.weaklyStop();
        that.kag.registerPreloadCompleteCallback(function () {
            that.kag.cancelWeakStop();
            that.kag.ftag.nextOrder();
        });
    },
}

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
システムデザイン変更

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

            j_body.trigger("mousemove.cursor_auto_hide");
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
            const event_type = $.userenv() === "pc" ? "click" : "pointerdown";

            // とりあえずクリックイベントリスナを取り外す
            if (typeof this.kag.tmp.show_effect_callback === "function") {
                document.body.removeEventListener(event_type, this.kag.tmp.show_effect_callback, { capture: true });
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
                document.body.addEventListener(event_type, this.kag.tmp.show_effect_callback, { capture: true });
            }

            this.overwriteCSS();
        }

        // e_ から始まるパラメータはクリックエフェクト用のパラメータであるため
        // e_ を取り外した上で click_effect ステータスに保存する
        for (const key in pm) {
            if (key.includes("e_")) {
                const _key = key.substring(2);
                this.kag.stat.click_effect[_key] = pm[key];
            }
        }

        // 仮想マウスカーソルに即反映
        this.kag.key_mouse.vmouse.refreshImage();

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
        let x = e.pageX;
        let y = e.pageY;
        if (this.kag.key_mouse.vmouse.is_visible) {
            x = this.kag.key_mouse.vmouse.x;
            y = this.kag.key_mouse.vmouse.y;
        }
        if (!this.kag.stat.click_effect) {
            this.kag.stat.click_effect = {};
        }
        const base_width = parseInt(this.kag.stat.click_effect.width) || 100;
        const width = parseInt(base_width * this.kag.tmp.screen_info.scale_x);
        const color = $.convertColor(this.kag.stat.click_effect.color || "white");
        const blend = this.kag.stat.click_effect.blend || "overlay";
        const duration = parseInt(this.kag.stat.click_effect.time) || 300;
        const opacity = $.convertOpacity(this.kag.stat.click_effect.opacity) || 0.8;
        const j_effect = $('<div class="tyrano_click_effect">').appendTo("body");
        j_effect
            .setStyleMap({
                "top": `${y}px`,
                "left": `${x}px`,
                "width": `${width}px`,
                "height": `${width}px`,
                "opacity": opacity,
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
        let css_text = `
            #remodal-cancel,
            #remodal-confirm,
            .button_menu,
            .menu_item img,
            .save_list_item {
                cursor: ${pointer_css};
            }
        `;

        if (this.kag.stat.click_effect) {
            const scale = (this.kag.stat.click_effect.scale || 120) / 100;
            css_text += `
                @keyframes tyrano_click_effect {
                    from {
                        transform: translate(-50%, -50%) scale(1);
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(${scale});
                        opacity: 0;
                    }
                }
            `;
        }

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

        $(".remodal").find("#remodal-confirm").html(pm.label_ok);
        $(".remodal").find("#remodal-cancel").html(pm.label_cancel);

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
システムデザイン変更

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
システムデザイン変更

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
                alert($.lang("patch_not_found", { path: pm.url }));
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
            const confirm_message = $.lang("new_patch_found", {
                version: parseFloat(obj.version),
                message: obj.message,
            }).replace(/\n/g, "<br>");

            $.confirm(
                confirm_message,
                function () {
                    alert($.lang("apply_web_patch"));

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
システムデザイン変更

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

/*
#[dialog_config]

:group
システムデザイン変更

:title
確認ダイアログのデザイン変更

:exp
タイトルに戻っていいかどうかを確認するときなどに表示される確認ダイアログのデザインを変更することができます。ダイアログのデザインを変更するタグには以下の4種類があります。

・`[dialog_config]`
・`[dialog_config_ok]`
・`[dialog_config_ng]`
・`[dialog_config_filter]`

<b>★重要</b>
このタグで変更した内容はセーブ・ロードによって復元されません。つまり、シナリオが始まったあと・ロードができる状態になったあとで演出の都合で一時的にこのタグでダイアログを変更する、といった使い方は危険です。ゲームを起動してからタイトルなどに移行するまでの間（`first.ks`など）に記述するとよいでしょう。

:param
btntype      = ボタンのタイプをまとめて指定できます。指定できるキーワードは`[glink]`の`color`パラメータに準じます。
btnwidth     = ボタンの横幅をpx単位でまとめて指定できます。
btnmargin    = ボタンの外余白をpx単位でまとめて指定できます。カンマ区切りに対応。`10,20`のように指定すると、縦余白が10、横余白が20と指定したことになります。
btnpadding   = ボタンの内余白をpx単位でまとめて指定できます。カンマ区切りに対応。`10,20`のように指定すると、縦余白が10、横余白が20と指定したことになります。

fontsize     = メッセージの文字サイズを指定します。
fontbold     = メッセージを太字にする場合は`true`を指定します。
fontface     = メッセージのフォントを指定します。
fontcolor    = メッセージの文字色を指定します。
btnfontsize  = ボタンの文字サイズを指定します。
btnfontbold  = ボタンを文字を太字にする場合は`true`を指定します。
btnfontface  = ボタンのフォントを指定します。
btnfontcolor = ボタンの文字色を指定します。

boxcolor     = メッセージボックスの背景色を指定できます。
boxopacity   = メッセージボックスの不透明度を`0`～`255`で指定できます。`255`で完全に不透明です。
boxradius    = メッセージボックスの角に丸みを付けたいときにその丸みの半径を数値で指定します。
boxwidth     = メッセージボックスの横幅をpx単位で指定できます。
boxheight    = メッセージボックスの高さpx単位で指定できます。
boxpadding   = メッセージボックスの内余白をpx単位で指定できます。`10,20,10`のようなカンマ区切りの指定に対応します。
boximg       = メッセージボックスの背景画像を指定できます。ファイルの場所は`image`が基準となります。
boximgpos    = メッセージボックスの背景画像の表示位置を指定できます。たとえば`center`と指定すると画面中央、`left top`で左上、`right top`で右上、`right bottom`で右下、`left bottom`で左下となります。
boximgrepeat = メッセージボックスの背景画像の繰り返しを指定できます。画像を繰り返して敷き詰める場合は`repeat`、繰り返したくない場合は`no-repeat`を指定します。
boximgsize   = メッセージボックスの背景画像のサイズをpx単位で指定できます。

bgcolor      = ダイアログ外側の背景色を指定できます。
bgopacity    = ダイアログ外側の不透明度を`0`～`255`で指定できます。`255`で完全に不透明です。
bgimg        = ダイアログ外側の背景画像を指定できます。ファイルの場所は`image`が基準となります。
bgimgpos     = ダイアログ外側の背景画像の表示位置を指定できます。たとえば`center`と指定すると画面中央、`left top`で左上、`right top`で右上、`right bottom`で右下、`left bottom`で左下となります。
bgimgrepeat  = ダイアログ外側の背景画像の繰り返しを指定できます。画像を繰り返して敷き詰める場合は`repeat`、繰り返したくない場合は`no-repeat`を指定します。
bgimgsize    = ダイアログ外側の背景画像のサイズをpx単位で指定できます。

openeffect   = ダイアログを開いたときのエフェクトを指定できます。指定できるキーワードは`[mask]`に準じます。
opentime     = ダイアログを開いたときのエフェクト時間をミリ秒単位で指定できます。

closeeffect  = ダイアログを開いたときのエフェクトを指定できます。指定できるキーワードは`[mask_off]`に準じます。
closetime    = ダイアログを開いたときのエフェクト時間をミリ秒単位で指定できます。

gotitle      = タイトルに戻っていいかを確認するときのテキストを変更できます。

okpos        = 「OK」ボタンの位置を左に変更したい場合は`left`、右に変更したい場合は`right`を指定します。

ingame       = ディスプレイ全体ではなくゲーム画面の範囲内に確認ダイアログを収めたい場合には`true`を指定します。`false`でもとに戻ります。

:sample
[dialog_config bgimg="pattern.jpg" bgimgrepeat="repeat" bgopacity="66"]
[dialog_config boxradius="20" boxcolor="#F0E3FD" boximg="../bgimage/title.jpg" boximgpos="right bottom" boximgsize="200" boxopacity="200"]
[dialog_config openeffect="rotateIn" opentime="800" closeeffect="rotateOut" closetime="800"]

#[end]
*/
tyrano.plugin.kag.tag.dialog_config = {
    pm: {
        okpos: "",

        btntype: "",
        btnwidth: "",
        btnmargin: "",
        btnpadding: "",

        fontsize: "",
        fontbold: "",
        fontface: "",
        fontcolor: "",
        btnfontsize: "",
        btnfontbold: "",
        btnfontface: "",
        btnfontcolor: "",

        boxradius: "",
        boxcolor: "",
        boximg: "",
        boximgpos: "",
        boximgrepeat: "",
        boximgsize: "",
        boxopacity: "",
        boxwidth: "",
        boxheight: "",
        boxpadding: "",

        bgcolor: "",
        bgimg: "",
        bgimgpos: "",
        bgimgrepeat: "",
        bgimgsize: "",
        bgopacity: "",

        openeffect: "",
        opentime: "",

        closeeffect: "",
        closetime: "",

        gotitle: "",

        ingame: "",
    },

    __initialized: false,

    init() {
        if (this.__initialized) return;
        this.__initialized = true;
        this.j_overlay = $(".remodal-overlay");
        this.j_box = $("[data-remodal-id=modal]");
        this.j_wrapper = this.j_box.parent();
        this.j_title = this.j_box.find(".remodal_title");
        this.j_message = this.j_box.find(".remodal_txt");
        this.j_text = $([this.j_title[0], this.j_message[0]]);
        this.j_cancel = this.j_box.find(".remodal-cancel").attr("id", "remodal-cancel");
        this.j_ok = this.j_box.find(".remodal-confirm").attr("id", "remodal-confirm");
        this.j_button = $([this.j_ok[0], this.j_cancel[0]]);
        this.j_boxbase = $('<div class="remodal-boxbase"></div>');
        this.j_box.prepend(this.j_boxbase);
        this.j_base = $('<div class="remodal-base"></div>');
        this.j_image = $('<div class="remodal-image"></div>');
        this.j_base.append(this.j_image);
        this.j_wrapper.prepend(this.j_base);
        this.j_ok_img = null;
        this.j_cancel_img = null;
    },

    start: function (pm) {
        this.init();

        // ボタン共通スタイル
        if (pm.btntype) this.j_button.attr("class", pm.btntype);
        if (pm.btnwidth) this.j_button.setStyle("width", $.convertLength(pm.btnwidth));
        if (pm.btnmargin) this.j_button.setMargin(pm.btnmargin);
        if (pm.btnpadding) this.j_button.setPadding(pm.btnpadding);

        // フォント設定
        if (pm.fontsize) this.j_text.setStyle("font-size", $.convertLength(pm.fontsize));
        if (pm.fontbold) this.j_text.setStyle("font-weight", $.convertFontWeight(pm.fontbold));
        if (pm.fontface) this.j_text.setStyle("font-family", pm.fontface);
        if (pm.fontcolor) this.j_text.setStyle("color", $.convertColor(pm.fontcolor));
        if (pm.btnfontsize) this.j_button.setStyle("font-size", $.convertLength(pm.btnfontsize));
        if (pm.btnfontbold) this.j_button.setStyle("font-weight", $.convertFontWeight(pm.btnfontbold));
        if (pm.btnfontface) this.j_button.setStyle("font-family", pm.btnfontface);
        if (pm.btnfontcolor) this.j_button.setStyle("color", $.convertColor(pm.btnfontcolor));

        // ボックス
        if (pm.boxradius) {
            this.j_box.setStyle("border-radius", $.convertLength(pm.boxradius + "px"));
            this.j_boxbase.setStyle("border-radius", $.convertLength(pm.boxradius + "px"));
        }
        if (pm.boxcolor) this.j_boxbase.setStyle("background-color", $.convertColor(pm.boxcolor));
        if (pm.boximg) this.j_boxbase.setStyle("background-image", $.convertBackgroundImage(pm.boximg, "image"));
        if (pm.boximgpos) this.j_boxbase.setStyle("background-position", $.convertBackgroundPosition(pm.boximgpos));
        if (pm.boximgsize) this.j_boxbase.setStyle("background-size", $.convertLength(pm.boximgsize));
        if (pm.boximgrepeat) this.j_boxbase.setStyle("background-repeat", pm.boximgrepeat);
        if (pm.boxopacity) this.j_boxbase.setStyle("opacity", $.convertOpacity(pm.boxopacity));
        if (pm.boxwidth) this.j_box.setStyle("width", $.convertLength(pm.boxwidth)).setStyle("max-width", $.convertLength(pm.boxwidth));
        if (pm.boxheight)
            this.j_box.setStyle("height", $.convertLength(pm.boxheight)).setStyle("max-height", $.convertLength(pm.boxheight));
        if (pm.boxpadding) this.j_box.setPadding(pm.boxpadding);

        // ボックス背景を変更するならデフォの設定を切る
        if (pm.boximg || pm.boxcolor) {
            this.j_box.setStyleMap({
                background: "none",
            });
        }

        // 背景を変更するならデフォの設定を切る
        if (pm.bgimg || pm.bgcolor) {
            this.j_overlay.setStyleMap({
                webkitFilter: "none",
                filter: "none",
                background: "none",
            });
        }

        // 背景
        if (pm.bgcolor) this.j_image.setStyle("background-color", $.convertColor(pm.bgcolor));
        if (pm.bgimg) this.j_image.setStyle("background-image", $.convertBackgroundImage(pm.bgimg, "image"));
        if (pm.bgimgpos) this.j_image.setStyle("background-position", $.convertBackgroundPosition(pm.bgimgpos));
        if (pm.bgimgsize) this.j_image.setStyle("background-size", $.convertLength(pm.bgimgsize));
        if (pm.bgimgrepeat) this.j_image.setStyle("background-repeat", pm.bgimgrepeat);
        if (pm.bgopacity) this.j_image.setStyle("opacity", $.convertOpacity(pm.bgopacity));

        // アニメーション
        if (pm.openeffect) this.kag.tmp.remodal_opening_effect = pm.openeffect;
        if (pm.closeeffect) this.kag.tmp.remodal_closing_effect = pm.closeeffect;
        if (pm.opentime) this.kag.tmp.remodal_opening_effect_time = pm.opentime + "ms";
        if (pm.closetime) this.kag.tmp.remodal_closing_effect_time = pm.closetime + "ms";

        // タイトルに戻るテキストの変更
        if (pm.gotitle) tyrano_lang.word.go_title = pm.gotitle;

        // ボタンの位置入れ替え
        if (pm.okpos) {
            const insert_method = pm.okpos === "left" ? "insertBefore" : "insertAfter";
            this.j_ok[insert_method](this.j_cancel);
            if (this.j_ok_img) this.j_ok_img[insert_method](this.j_ok);
            if (this.j_cancel_img) this.j_cancel_img[insert_method](this.j_cancel);
        }

        if (pm.ingame) {
            const j_remodal = $(".remodal-bg, .remodal-overlay, .remodal-wrapper");
            if (pm.ingame === "true") {
                j_remodal.appendTo("#tyrano_base");
                j_remodal.setStyle("z-index", "1000000000");
            } else if (pm.ingame === "false") {
                j_remodal.appendTo("body");
            }
        }

        this.kag.ftag.nextOrder();
    },

    /**
     * 画像ボタンを更新する
     * @param {{[key: string]: string}} pm
     * @param {boolean} is_ok
     * @returns
     */
    changeButton(pm, is_ok) {
        // ボタンを画像に変更する場合は replaceButton に丸投げする
        if (pm.img && pm.btnimgtype !== "bg") return this.replaceButton(pm, is_ok);

        // 画像ボタンではない場合
        const j_elm = is_ok ? this.j_ok : this.j_cancel;

        const id = is_ok ? "remodal-confirm" : "remodal-cancel";
        const j_old_image = $(`img#${id}`);
        if (j_old_image.length > 0) {
            j_old_image.remove();
            j_elm.show().attr("id", id);
            TYRANO.kag.makeFocusable(j_elm);
        }

        if (pm.text) j_elm.text(pm.text);
        if (pm.type) j_elm.attr("class", pm.type);
        if (pm.width) j_elm.setStyle("width", $.convertLength(pm.width));
        if (pm.margin) j_elm.setMargin(pm.margin);
        if (pm.padding) j_elm.setPadding(pm.padding);

        // フォント設定
        if (pm.fontsize) j_elm.setStyle("font-size", $.convertLength(pm.fontsize));
        if (pm.fontbold) j_elm.setStyle("font-weight", $.convertFontWeight(pm.fontbold));
        if (pm.fontface) j_elm.setStyle("font-family", pm.fontface);
        if (pm.fontcolor) j_elm.setStyle("color", $.convertColor(pm.fontcolor));

        // ボタンの背景画像を設定
        if (pm.img) {
            this.css_map[`#${id}`]["background-image"] = $.convertBackgroundImage(pm.img, "image");
        }
        if (pm.activeimg) {
            this.css_map[`#${id}:active`]["background-image"] = $.convertBackgroundImage(pm.activeimg, "image");
            this.css_map[`#${id}.active`]["background-image"] = $.convertBackgroundImage(pm.activeimg, "image");
        }
        if (pm.enterimg) {
            this.css_map[`#${id}:hover`]["background-image"] = $.convertBackgroundImage(pm.enterimg, "image");
            this.css_map[`#${id}.hover`]["background-image"] = $.convertBackgroundImage(pm.enterimg, "image");
        }
        if (pm.clickimg) {
            this.css_map[`#${id}.clicked`]["background-image"] = $.convertBackgroundImage(pm.clickimg, "image");
        }
        this.updateCSS();

        // ホバーイン, ホバーアウト
        j_elm.off("init mouseenter mouseleave click");
        j_elm.on("init", () => {
            j_elm.removeClass("clicked");
        });
        j_elm.on("mouseenter", () => {
            if (pm.enterse) this.kag.playSound(pm.enterse);
        });
        j_elm.on("mouseleave", () => {
            if (pm.leavese) this.kag.playSound(pm.leavese);
        });
        j_elm.on("click", () => {
            if (pm.clickse) this.kag.playSound(pm.clickse);
            j_elm.addClass("clicked");
        });
    },

    css_map: {
        "#remodal-confirm": {},
        "#remodal-confirm:hover": {},
        "#remodal-confirm.hover": {},
        "#remodal-confirm:active": {},
        "#remodal-confirm.active": {},
        "#remodal-confirm.clicked": {},
        "#remodal-cancel": {},
        "#remodal-cancel:hover": {},
        "#remodal-cancel.hover": {},
        "#remodal-cancel:active": {},
        "#remodal-cancel.active": {},
        "#remodal-cancel.clicked": {},
    },

    updateCSS() {
        let css_exists = false;
        let css = "";
        for (const key in this.css_map) {
            css += `${key}{`;
            const styles = this.css_map[key];
            for (const prop in styles) {
                const value = styles[prop];
                css += `${prop}:${value};`;
                css_exists = true;
            }
            css += `}`;
        }
        if (!css_exists) {
            return;
        }
        let style_elm = document.getElementById("dialog_config_style");
        if (!style_elm) {
            style_elm = document.createElement("style");
            style_elm.id = "dialog_config_style";
            document.head.appendChild(style_elm);
        }
        style_elm.textContent = css;
    },

    /**
     * ダイアログのボタンを button から img に置き換える
     * @param {{[key: string]: string}} pm
     * @param {boolean} is_ok
     */
    replaceButton(pm, is_ok) {
        pm.img = $.parseStorage(pm.img, "image");
        pm.enterimg = $.parseStorage(pm.enterimg, "image");
        pm.activeimg = $.parseStorage(pm.activeimg, "image");
        pm.clickimg = $.parseStorage(pm.clickimg, "image");

        const id = is_ok ? "remodal-confirm" : "remodal-cancel";
        const j_original_button = is_ok ? this.j_ok : this.j_cancel;
        const j_old_image = $(`img#${id}`);
        if (j_old_image.length) {
            j_old_image.remove();
        } else {
            j_original_button.hide().attr("id", "");
            TYRANO.kag.makeUnfocusable(j_original_button);
        }

        const j_img = this.createButton(pm);
        if (pm.margin) j_img.setMargin(pm.margin);
        if (pm.padding) j_img.setPadding(pm.padding);

        j_img.attr("id", id);
        j_img.addClass("remodal-image-button");
        j_img.insertBefore(j_original_button);
        j_img.on("click", () => {
            j_original_button.trigger("click");
        });
        j_img.on("touchstart", () => {
            j_original_button.trigger("touchstart");
        });

        if (is_ok) this.j_ok_img = j_img;
        else this.j_cancel_img = j_img;
    },

    /**
     * 画像ボタンの img 要素を作成して返す
     * @param {{[key: string]: string}} pm
     * @returns {jQuery}
     */
    createButton(pm) {
        const j_img = $("<img />").attr("src", pm.img);
        if (pm.width) j_img.setStyle("width", $.convertLength(pm.width));

        let clicked = false;

        j_img.on("init", () => {
            clicked = false;
            j_img.attr("src", pm.img);
        });

        // ホバーイン
        j_img.on("mouseenter", () => {
            if (pm.enterimg) {
                // アクティブ中にホバーインしたときに画像を変更しないようにする
                if (!pm.activeimg || j_img.filter(":active").length === 0) j_img.attr("src", pm.enterimg);
            }
            if (pm.enterse) this.kag.playSound(pm.enterse);
        });

        // ホバーアウト
        j_img.on("mouseleave", () => {
            if (pm.activeimg) {
                // アクティブ中にホバーアウトしたときに画像を変更しないようにする
                if (!clicked && j_img.filter(":active").length === 0) j_img.attr("src", pm.img);
            } else {
                // クリック済みなのに画像を変えてしまうことのないように
                if (!clicked) j_img.attr("src", pm.img);
            }
            if (pm.leavese) this.kag.playSound(pm.leavese);
        });

        // マウスダウン (アクティブインでもある)
        j_img.on("mousedown", () => {
            if (pm.activeimg) j_img.attr("src", pm.activeimg);
            if (pm.clickse) this.kag.playSound(pm.clickse);
            window.__active_element = j_img[0];
        });

        // アクティブアウト
        j_img.on("activeoff", () => {
            // クリックのケース
            if (j_img.filter(":hover").length > 0) {
                clicked = true;
                return;
            }
            // クリックでなかったケース
            if (pm.activeimg) j_img.attr("src", pm.img);
        });

        // クリック
        j_img.on("click", () => {
            clicked = true;
            if (pm.clickimg) j_img.attr("src", pm.clickimg);
            if (pm.clickse) this.kag.playSound(pm.clickse);
        });

        j_img.on("remove", () => {
            if (window.__active_element === j_img[0]) window.__active_element = null;
        });

        // :active が外れたときのイベント activeoff を設定できるようにするために、
        // window の mouseup にイベントリスナを仕込む。
        // ※ activeoff を設定したい要素の mousedown イベントに、
        // 　 window.__active_element に自身を登録するイベントを仕込む必要あり。
        if (!window.__is_set_active_remover) {
            window.__is_set_active_remover = true;
            window.addEventListener(
                "mouseup",
                () => {
                    if (window.__active_element) {
                        const elm = window.__active_element;
                        window.__active_element = null;
                        $(elm).trigger("activeoff");
                    }
                },
                { capture: true },
            );
        }

        return j_img;
    },
};

/*
#[dialog_config_ok]

:group
システムデザイン変更

:title
確認ダイアログのデザイン変更（OKボタン）

:exp
タイトルに戻っていいかどうかを確認するときなどに表示される確認ダイアログのデザインを変更することができます。ダイアログのデザインを変更するタグには以下の4種類があります。

・`[dialog_config]`
・`[dialog_config_ok]`
・`[dialog_config_ng]`
・`[dialog_config_filter]`

このタグでは、OKボタンの設定を行うことができます。

<b>★重要</b>
このタグで変更した内容はセーブ・ロードによって復元されません。つまり、シナリオが始まったあと・ロードができる状態になったあとで演出の都合で一時的にこのタグでダイアログを変更する、といった使い方は危険です。ゲームを起動してからタイトルなどに移行するまでの間（`first.ks`など）に記述するとよいでしょう。

<b>★重要</b>
`img`パラメータが指定された`[glink_config_ok]`を通過するタイミングで、それまでのOKボタンの設定が破棄されます。つまり、画像をボタンに使う場合はタグを小分けして書かずにひとつの`[glink_config_ok]`で記述する必要があります。（文字ボタンの場合は関係ありません）

:param
text      = OKボタンのテキストを指定できます。
type      = OKボタンのタイプを指定できます。指定できるキーワードは`[glink]`の`color`パラメータに準じます。
width     = OKボタンの横幅をpx単位で指定できます。
margin    = OKボタンの外余白をpx単位で指定できます。カンマ区切りに対応。`10,20`のように指定すると、縦余白が10、横余白が20と指定したことになります。
padding   = OKボタンの内余白をpx単位で指定できます。カンマ区切りに対応。`10,20`のように指定すると、縦余白が10、横余白が20と指定したことになります。
fontsize  = OKボタンの文字サイズを指定します。
fontbold  = OKボタンを文字を太字にする場合は`true`を指定します。
fontface  = OKボタンのフォントを指定します。
fontcolor = OKボタンの文字色を指定します。
img       = OKボタンに画像を使うことができます。`image`フォルダを基準とした画像ファイルの場所を指定します。
imgwidth  = OKボタンの画像の横幅をpx単位で指定できます。
enterimg  = マウスがOKボタンの上に乗ったときの画像ファイル。`image`フォルダから探します。
activeimg = マウスがOKボタンを押し込んでから放されるまでの画像ファイル。`image`フォルダから探します。
clickimg  = マウスがOKボタンをクリックした後の画像ファイル。`image`フォルダから探します。
enterse   = マウスがOKボタンの上に乗ったときに再生する音声ファイル。`sound`フォルダから探します。
leavese   = マウスがOKボタンの上から離れたときに再生する音声ファイル。`sound`フォルダから探します。
clickse   = マウスがOKボタンを押し込んだときに再生する音声ファイル。`sound`フォルダから探します。
btnimgtype= このパラメータに`bg`を指定しておくと、`img`や`enterimg`などのパラメータで指定した画像がボタンの「背景」として使われるようになります。（通常、`img`に画像を指定したときはテキストが消え、画像がそのままボタン化されます。つまり、画像内に「OK」などのデザインが含まれていることを想定しているということです）

:sample
[dialog_config_ok text="いいですよ"]
[dialog_config_ok width="200" margin="10,30" type="btn_04_green"]

;画像ボタンにする場合はひとつのタグで記述
[dialog_config_ok img="dialog/ok.png" width="100" margin="20" enterimg="dialog/ok_enter.png" activeimg="dialog/ok_active.png" clickimg="dialog/ok_click.png" enterse="lab1.mp3" leavese="lab2.mp3" clickse="lab3.mp3"]


#[end]
*/

tyrano.plugin.kag.tag.dialog_config_ok = {
    pm: {
        text: "",
        type: "",
        width: "",
        margin: "",
        padding: "",
        fontsize: "",
        fontbold: "",
        fontface: "",
        fontcolor: "",

        img: "",
        imgwidth: "",
        enterimg: "",
        activeimg: "",
        clickimg: "",
        enterse: "",
        leavese: "",
        clickse: "",

        btnimgtype: "",
    },

    start: function (pm) {
        const that = this.kag.ftag.master_tag.dialog_config;
        that.init();
        that.changeButton(pm, true);
        this.kag.ftag.nextOrder();
    },
};

/*
#[dialog_config_ng]

:group
システムデザイン変更

:title
確認ダイアログのデザイン変更（キャンセルボタン）

:exp
タイトルに戻っていいかどうかを確認するときなどに表示される確認ダイアログのデザインを変更することができます。ダイアログのデザインを変更するタグには以下の4種類があります。

・`[dialog_config]`
・`[dialog_config_ok]`
・`[dialog_config_ng]`
・`[dialog_config_filter]`

このタグでは、キャンセルボタンの設定を行うことができます。

<b>★重要</b>
このタグで変更した内容はセーブ・ロードによって復元されません。つまり、シナリオが始まったあと・ロードができる状態になったあとで演出の都合で一時的にこのタグでダイアログを変更する、といった使い方は危険です。ゲームを起動してからタイトルなどに移行するまでの間（`first.ks`など）に記述するとよいでしょう。

<b>★重要</b>
`img`パラメータが指定された`[glink_config_ng]`を通過するタイミングで、それまでのキャンセルボタンの設定が破棄されます。つまり、画像をボタンに使う場合はタグを小分けして書かずにひとつの`[glink_config_ng]`で記述する必要があります。（文字ボタンの場合は関係ありません）

:param
text      = キャンセルボタンのテキストを指定できます。
type      = キャンセルボタンのタイプを指定できます。指定できるキーワードは`[glink]`の`color`パラメータに準じます。
width     = キャンセルボタンの横幅をpx単位で指定できます。
margin    = キャンセルボタンの外余白をpx単位で指定できます。カンマ区切りに対応。`10,20`のように指定すると、縦余白が10、横余白が20と指定したことになります。
padding   = キャンセルボタンの内余白をpx単位で指定できます。カンマ区切りに対応。`10,20`のように指定すると、縦余白が10、横余白が20と指定したことになります。
fontsize  = キャンセルボタンの文字サイズを指定します。
fontbold  = キャンセルボタンを文字を太字にする場合は`true`を指定します。
fontface  = キャンセルボタンのフォントを指定します。
fontcolor = キャンセルボタンの文字色を指定します。
img       = キャンセルボタンに画像を使うことができます。`image`フォルダを基準とした画像ファイルの場所を指定します。
imgwidth  = キャンセルボタンの画像の横幅をpx単位で指定できます。
enterimg  = マウスがキャンセルボタンの上に乗ったときの画像ファイル。`image`フォルダから探します。
activeimg = マウスがキャンセルボタンを押し込んでから放されるまでの画像ファイル。`image`フォルダから探します。
clickimg  = マウスがキャンセルボタンをクリックした後の画像ファイル。`image`フォルダから探します。
enterse   = マウスがキャンセルボタンの上に乗ったときに再生する音声ファイル。`sound`フォルダから探します。
leavese   = マウスがキャンセルボタンの上から離れたときに再生する音声ファイル。`sound`フォルダから探します。
clickse   = マウスがキャンセルボタンを押し込んだときに再生する音声ファイル。`sound`フォルダから探します。
btnimgtype= このパラメータに`bg`を指定しておくと、`img`や`enterimg`などのパラメータで指定した画像がボタンの「背景」として使われるようになります。（通常、`img`に画像を指定したときはテキストが消え、画像がそのままボタン化されます。つまり、画像内に「OK」などのデザインが含まれていることを想定しているということです）

:sample
[dialog_config_ng text="ダメです"]
[dialog_config_ng width="200" margin="10,30" type="btn_04_white"]

#[end]
*/

tyrano.plugin.kag.tag.dialog_config_ng = {
    pm: tyrano.plugin.kag.tag.dialog_config_ok.pm,
    start: function (pm) {
        const that = this.kag.ftag.master_tag.dialog_config;
        that.init();
        that.changeButton(pm, false);
        this.kag.ftag.nextOrder();
    },
};

/*
#[dialog_config_filter]

:group
システムデザイン変更

:title
確認ダイアログのデザイン変更（フィルター）

:exp
タイトルに戻っていいかどうかを確認するときなどに表示される確認ダイアログのデザインを変更することができます。ダイアログのデザインを変更するタグには以下の4種類があります。

・`[dialog_config]`
・`[dialog_config_ok]`
・`[dialog_config_ng]`
・`[dialog_config_filter]`

このタグでは、ダイアログを表示したときに背景全体に適用するフィルターを指定できます。指定できるパラメータは`[filter]`と同じです。

<b>★重要</b>
このタグで変更した内容はセーブ・ロードによって復元されません。つまり、シナリオが始まったあと・ロードができる状態になったあとで演出の都合で一時的にこのタグでダイアログを変更する、といった使い方は危険です。ゲームを起動してからタイトルなどに移行するまでの間（`first.ks`など）に記述するとよいでしょう。

:param
layer      = フィルタをかけるレイヤを指定します。省略すると、もしくは`all`と指定するとゲーム画面全てに効果がかかります。,
name       = 特定の要素にフィルタをかけたい場合に、その要素の`name`を指定します。,
grayscale  = `0`(デフォルト)～`100`を指定することで、画像の表示をグレースケールに変換できます。,
sepia      = `0`(デフォルト)～`100`を指定することで、画像の表示をセピア調に変換できます。,
saturate   = `0`～`100`(デフォルト)を指定してあげることで、画像の表示の彩度（色の鮮やかさ）を変更できます。,
hue        = `0`(デフォルト)～`360`を指定することで、画像の表示の色相を変更できます。,
invert     = `0`(デフォルト)～`100`を指定することで、画像の表示の階調を反転させることができます。,
opacity    = `0`～`100`(デフォルト)を指定することで、画像の表示の透過度を変更できます。,
brightness = `100`(デフォルト)を基準とする数値を指定することで、画像の明度を変更できます。`0`で真っ暗に、`100`以上の数値でより明るくなります。,
contrast   = `0`～`100`(デフォルト)を指定することで、画像の表示のコントラストを変更できます。,
blur       = `0`(デフォルト)～`任意の値`を指定することで、画像の表示をぼかすことができます。

:sample
[dialog_config_filter blur="15"]


#[end]
*/
tyrano.plugin.kag.tag.dialog_config_filter = {
    start: function (pm) {
        const filter = this.kag.ftag.master_tag.filter;
        pm = $.extend({}, filter.pm, pm);
        const filter_str = filter.buildFilterPropertyValue(pm);
        $(".remodal-base").setStyleMap({ "backdrop-filter": filter_str }, "webkit");
        this.kag.ftag.nextOrder();
    },
};

/*
#[mode_effect]

:group
システムデザイン変更

:title
モード変化エフェクト

:exp
次のタイミングで画面中央にエフェクトを出すことができます。

①スキップモード開始時
②オートモード開始時
③スキップモードまたはオートモード停止時
④ホールドスキップモード開始時
⑤ホールドスキップモード停止時

※ホールドスキップとは「ボタンやキーを押している間だけスキップする機能」のことです。キーボードの`Ctrl`キーに割り当てられていることが一般的です。

:param
skip       = スキップモード開始時に表示されるエフェクト。`none`、`default`、または`imageフォルダを基準とする画像ファイルの場所`を指定します。`none`だとエフェクトなし、`default`だとデフォルトのエフェクト、画像ファイルを指定するとその画像を出すことができます。
auto       = オートモード開始時に表示されるエフェクト。`skip`パラメータと同様に指定します。
stop       = スキップモードまたはオートモード停止時に表示されるエフェクト。`skip`パラメータと同様に指定します。
holdskip   = ホールドスキップモード開始時に表示されるエフェクト。`skip`パラメータと同様に指定します。
holdstop   = ホールドストップモード停止時に表示されるエフェクト。`skip`パラメータと同様に指定します。
all        = 5種類のエフェクトをまとめて指定できます。`skip`パラメータと同様に指定します。
env        = `all``pc``phone`のいずれかを指定します。`pc`を指定すると、プレイヤーがPCでゲームを遊んでいるとき限定のエフェクトを設定できます。`phone`を指定すると、プレイヤーがスマホ・タブレットでゲームを遊んでいるとき限定のエフェクトを設定できます。`all`(デフォルト)の場合は2つの環境の設定をまとめて行います。
width      = エフェクトの横幅を指定したい場合、数値(px単位)を指定します。
height     = エフェクトの高さを指定したい場合、数値(px単位)を指定します。
color      = エフェクトに`default`を使用する場合に、図形部分の色を指定できます。
bgcolor    = エフェクトに`default`を使用する場合に、図形を囲む丸部分の色を指定できます。

:sample
[mode_effect all="default" holdskip="none" holdstop="none"]


#[end]
*/
tyrano.plugin.kag.tag.mode_effect = {
    pm: {
        all: "", // none, default, hoge.png
        skip: "",
        auto: "",
        holdskip: "",
        stop: "",
        env: "all", // all, pc, phone
    },
    next: function (pm) {
        this.kag.ftag.nextOrder();
    },
    mode_list: ["skip", "auto", "stop", "holdskip", "holdstop"],
    start: function (pm) {
        let target_env_keys;

        if (pm.env === "all") target_env_keys = ["pc", "phone"];
        else target_env_keys = [pm.env];

        if (pm.all) {
            this.mode_list.forEach((mode) => {
                if (!pm[mode]) {
                    pm[mode] = pm.all;
                }
            });
        }

        target_env_keys.forEach((env_key) => {
            const map = this.kag.tmp.mode_effect[env_key];
            this.mode_list.forEach((mode) => {
                if (pm[mode]) {
                    if (!map[mode]) map[mode] = {};
                    map[mode].storage = pm[mode];
                    ["width", "height", "color", "bgcolor"].forEach((pm_key) => {
                        if (pm[pm_key]) map[mode][pm_key] = pm[pm_key];
                    });
                }
            });
        });

        this.kag.ftag.nextOrder();
    },
};

/*
#[loading_log]

:group
システムデザイン変更

:title
ローディングログ

:exp
素材の読み込みを行っているときやセーブ処理が走っているときなど、ゲームが一時的に止まっているタイミングで画面端に「Loading...」のようなログを出すことができます。

:param
preload = 素材の読み込み中に表示するテキストを自由に設定できます。`none`を指定するとログを無効にできます。`default`を指定するとデフォルトのログになります。`notext`を指定するとテキストなしでローディングアイコンだけを出すことができます。
save    = セーブ処理中に表示するテキストを自由に設定できます。preload パラメータと同様に、`none`、`default`、`notext`というキーワードが指定可能。
all     = preload、save パラメータをまとめて指定できます。たとえば、`all="default"`とすればすべてのログにデフォルトのテキストを設定できます。
dottime = テキストの後ろに「...」というドットが増えていくアニメーションの所要時間をミリ秒で指定できます。`0`を指定するとドットアニメーションを無くすことができます。
icon    = ローディングアイコンを表示するかどうかを`true`または`false`で指定します。ローディングアイコンを非表示にしてテキストのみにしたい場合には`false`を指定してください。

:sample
[loading_log all="default"]

#[end]
*/
tyrano.plugin.kag.tag.loading_log = {
    pm: {
        mintime: "",
        all: "",
        load: "",
        save: "",
        dottime: "",
    },
    initialized: false,
    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.j_loading_log = $("#tyrano-loading");
        if (!this.j_loading_log.length) {
            const html = `
            <div id="tyrano-loading" class="tyrano-loading">
                <div class="icon"></div>
                <div class="message"></div>
            </div>
            `;
            this.j_loading_log = $(html);
        }
        this.kag.tmp.j_loading_log = this.j_loading_log;
        this.kag.stat.loading_log = {
            min_time: 20,
            dot_time: 1500,
            use_icon: true,
            use: false,
            message_map: {
                preload: "",
                save: "",
            },
        };
        this.kag.tmp.j_loading_log_message = this.j_loading_log.find(".message");
        this.kag.tmp.j_loading_log_icon = this.j_loading_log.find(".icon");
        this.j_loading_log.appendTo("#tyrano_base");
    },
    default_message_map: {
        preload: "Loading",
        save: "Saving",
    },
    start(pm) {
        this.init();
        if (pm.mintime) this.kag.stat.loading_log.min_time = parseInt(pm.mintime);
        if (pm.all) {
            ["preload", "save"].forEach((key) => {
                if (!pm[key]) {
                    pm[key] = pm.all;
                }
            });
        }
        if (pm.icon) this.kag.stat.loading_log.use_icon = pm.icon === "true";
        if (pm.preload) this.kag.stat.loading_log.message_map.preload = pm.preload;
        if (pm.save) this.kag.stat.loading_log.message_map.save = pm.save;
        if (pm.dottime) this.kag.stat.loading_log.dot_time = parseInt(pm.dottime);
        if (pm.left) {
            this.j_loading_log.setStyleMap({
                left: $.convertLength(pm.left),
                right: "auto",
            });
        } else if (pm.right) {
            this.j_loading_log.setStyleMap({
                left: "auto",
                right: $.convertLength(pm.right),
            });
        }
        if (pm.top) {
            this.j_loading_log.setStyleMap({
                top: $.convertLength(pm.top),
                bottom: "auto",
            });
        } else if (pm.bottom) {
            this.j_loading_log.setStyleMap({
                top: "auto",
                bottom: $.convertLength(pm.bottom),
            });
        }
        this.j_loading_log.hide();
        this.kag.ftag.nextOrder();
    },
};



/*
#[lang_set]

:group
システムデザイン変更

:title
言語の切替

:exp
ゲームで使用する言語を変更することができます。
例えば[lang_set name="en"] を指定すると data/others/lang/en.json の翻訳設定が採用されます。

:param
name = `default`を指定するとローカライズを行いません。

:sample
[lang_set name="en"]

#[end]
*/

tyrano.plugin.kag.tag.lang_set = {
    vital: ["name"],

    pm: {
        name: "",
    },

    start: function (pm) {

        var that = this;
        //langファイルを読み込んで設定する

        this.kag.loadLang(pm.name, () => {

            const scenario_file = this.kag.stat.current_scenario;

            //呼び出したファイル自身をロード
            this.kag.loadScenario(scenario_file, (array_tag) => {
                this.kag.ftag.array_tag = array_tag;
                this.kag.ftag.nextOrder();
            });

        });


    },
};

