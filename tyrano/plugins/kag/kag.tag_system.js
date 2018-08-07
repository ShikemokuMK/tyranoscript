/*
#[eval]
:group
マクロ・変数・JS操作
:title
式の評価
:exp
expで示された式を評価します。変数への値の代入などに使用されます。
exp には任意の TJS(JS) 式を指定できるので、TJS(JS) として有効な式であれば 何でも評価できます。
:sample
[eval exp="f.test=500"]
;↑ゲーム変数 test に数値を代入している
[eval exp="f.test2='文字列'"]
;↑ゲーム変数 test2 に文字列を代入している
[eval exp="sf.test=400"]
;↑システム変数 test に数値を代入している
[eval exp="f.test2=f.test*3"]
;↑ゲーム変数 test2 に ゲーム変数 test の 3 倍の数値を代入している
:param
exp=評価するTJS式を指定します。
#[end]
*/

//スクリプトの評価
tyrano.plugin.kag.tag.eval = {

    vital : ["exp"],

    pm : {
        exp : "",
        next: "true"
    },

    start : function(pm) {

        this.kag.evalScript(pm.exp);
        
        if(pm.next=="true"){
            this.kag.ftag.nextOrder();
        }

    }
};

/*
#[clearvar]
:group
マクロ・変数・JS操作
:title
ゲーム変数の全消去
:exp
ゲーム変数をすべて消去します
:sample
:param
#[end]
*/

//すべての編集を初期化
tyrano.plugin.kag.tag.clearvar = {

    //すべての変数を削除
    pm : {

    },

    start : function(pm) {
        this.kag.clearVariable();
        this.kag.ftag.nextOrder();

    }
};

/*
#[clearsysvar]
:group
マクロ・変数・JS操作
:title
システム変数の全消去
:exp
システム変数を全消去します
:sample
:param
#[end]
*/

//システム変数の初期化
tyrano.plugin.kag.tag.clearsysvar = {

    start : function() {
        this.kag.variable.sf = {};
        //システム変数
        this.kag.ftag.nextOrder();
    }
};

/*
#[clearstack]
:group
マクロ・変数・JS操作
:title
スタックの消去
:exp
システムが管理するスタックを消去します。
スタックとはゲームを進める中で Call、マクロ呼び出し、 if 文などを通過した時に
呼び出し元に帰ってくるために保持するメモリ領域です。
通常のノベルゲームであれば、特に問題はおきませんが
Call の途中でジャンプ。if文の中でジャンプ
などを繰り返した場合、回収されないスタックが溜まっていきます。
これらは、セーブデータの肥大化などを引き起こす場合ばあるので
戻るべきスタックが無い場面でこのタグを配置しておくことをオススメします。
きりの良い場所などです。（タイトル 章の始まり）
:sample
:param
stack=call if macro のいづれかを指定できます。特定のスタックのみ削除することができます。指定しなければ全てのスタックを削除します。
#[end]
*/

//システム変数の初期化
tyrano.plugin.kag.tag.clearstack = {
    pm : {
        stack : ""
    },
    start : function(pm) {
        if (pm.stack == "") {
            this.kag.stat.stack = {
                "if" : [],
                "call" : [],
                "macro" : []
            };
        } else {
            this.kag.stat.stack[pm.stack] = [];
        }
        this.kag.ftag.nextOrder();
    }
};

/*
#[close]
:group
システム操作
:title
ウィンドウを閉じる
:exp
ウィンドウを閉じます。
ブラウザから閲覧している場合は、ブラウザが終了します
:sample
:param
ask=true を指定すると、終了するかどうかの確認をします。false を 指定するとこの確認はありません。この属性を省略 すると、 true を指定したとみなされます。
#[end]
*/

//ウィンドウを閉じる命令
tyrano.plugin.kag.tag["close"] = {

    pm : {
        ask : "true"
    },

    start : function(pm) {
        var that = this;
        if (pm.ask == "true") {

            $.confirm($.lang("exit_game"), function() {
                that.close();
            }, function() {
                that.kag.ftag.nextOrder();
            });

        } else {
            this.close();
        }
    },

    close : function() {
        window.close();
        if ( typeof navigator.app != 'undefined') {
            navigator.app.exitApp();
        }
        if ( typeof require != 'undefined' && typeof require('nw.gui') != 'undefined') {
            require('nw.gui').Window.get().close();
        }

        //最新のブラウザは、window.closeで閉じないので以下を実行。
        //※ただし、Firefoxや最新のChromeは、blankページが残る。
        //（新規で開いたページでないと、セキュリティポリシーで閉じれない）
        //window.open('about:blank','_self').close();
    }
};

/*
#[trace]
:group
その他
:title
コンソールへの値の出力
:exp
expで指定された式を評価し、結果をコンソールに出力します。
【KAG3吉里吉里の場合】
コンソールは Shift+F4 で表示されるほか、Config.tjs 内で logMode を設定することに より、ファイルに記録することもできます。
【ティラノスクリプト　ブラウザの場合】
ブラウザのウェブインスペクタからコンソールを確認してください
:sample
[trace exp="f.test"]
; ↑ ゲーム変数 test の内容を コンソール に出力する
:param
exp=評価するTJS（JS）式を指定します
#[end]
*/

//変数をコンソールに出力
tyrano.plugin.kag.tag["trace"] = {

    pm : {
        exp : ""
    },

    start : function(pm) {

        var val = this.kag.embScript(pm.exp);
        //評価された値を代入
        //this.kag.ftag.startTag("text",{"val":val});

        this.kag.log("trace出力：" + val);
        this.kag.ftag.nextOrder();

    }
};

/*
 #[title]
 :group
 システム操作
 :title
 タイトル指定
 :exp
 ゲームタイトルを指定します。
 例えば、章ごとにタイトルを変えるとプレイヤーからわかりやすくなります。
 吉里吉里の場合、アプリのウィンドウタイトル。
 ティラノスクリプトの場合、ブラウザタイトルが変わります
 :sample
 [title name="変更後のタイトル"]
 :param
 name=表示したいタイトルを指定してください
 #[end]
 */

tyrano.plugin.kag.tag["title"] = {

    vital : ["name"],

    pm : {
        name : ""
    },

    //タイトルの設定
    start : function(pm) {
        if (pm.name != "") {
            //タイトルの設定
            this.kag.setTitle(pm.name);
            this.kag.ftag.nextOrder();
        }
    }
};

/*
#[iscript]
:group
マクロ・変数・JS操作
:title
JavaScriptの記述
:exp
[iscript]と[endscript]に囲まれた箇所にJavaScriptを記述することができます。
TJSの式にも適応できますが、ティラノスクリプトとの動作互換はありません
:sample
[iscript]

var test = 22;
f.name = test;
alert("javascriptの関数にもアクセス可能");
//jqueryも利用可能 コメントもJS方式利用可能
$("body").html();

[endscript]
:param
#[end]
*/

//スクリプト開始
tyrano.plugin.kag.tag.iscript = {
    start : function(pm) {

        this.kag.stat.is_script = true;
        this.kag.stat.buff_script = "";
        this.kag.ftag.nextOrder();

    }
};

/*
#[endscript]
:group
マクロ・変数・JS操作
:title
JavaScriptの終了
:exp
JavaScriptの記述を終了します
:sample
:param
stop=endscriptに到達した時、ここにtrueを指定すると次のタグに進ませない。scriptの中でjumpした時などに指定する。デフォルトはfalse
#[end]
*/

//スクリプト終了
tyrano.plugin.kag.tag.endscript = {

    pm : {
        stop : "false"
    },

    start : function(pm) {

        this.kag.stat.is_script = false;
        //スクリプトを実行する
        this.kag.evalScript(this.kag.stat.buff_script);
        this.kag.stat.buff_script = "";

        if (pm.stop == "false") {
            this.kag.ftag.nextOrder();
        }
    }
};

/*
#[html]
:group
その他
:title
HTMLをレイヤ追加
:exp
[html]と[endhtml]の間に記述したHTMLを表示することができます。
この機能は非常に強力です。もちろんJavaScriptタグ。Canvasなど次世代Web表現を全てサポートします。
例えば、Youtubeのビデオプレイヤーを挿入したり、無数に公開されているWebAPIとの連携なども可能です。
このタグで挿入した場合は最前面にHTML要素が挿入されます
cmタグなどで画面をクリアしない限り、クリックしてもゲームが進みません。
必ずグラフィックボタンなども配置して、ジャンプでゲームを進める状態にしておくことが必要です。
タグの中に、ティラノスクリプトの変数を挿入することもできます。
従来通りHTMLの中で[emb]タグを使用してください
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
left=HTMLタグの左端位置を指定します。（ピクセル）,
top=HTMLの上端位置を指定します。（ピクセル）,
name=HTML領域に名前を指定することができます。この名前を使って、HTML領域に対してアニメーションなども実行できます。
#[end]
*/
//htmlの表示、そして、格納だわな。
tyrano.plugin.kag.tag.html = {

    pm : {
        layer : "",
        top : 0,
        left : 0
    },

    start : function(pm) {

        this.kag.stat.is_html = true;
        this.kag.stat.map_html = {};
        this.kag.stat.map_html.buff_html = "";
        this.kag.stat.map_html.buff_pm = pm;

        this.kag.ftag.nextOrder();

    }
};

/*
#[endhtml]
:group
その他
:title
HTMLの終了
:exp
HTMLの記述を終了します
:sample
:param
#[end]
*/
//htmlの終了
tyrano.plugin.kag.tag.endhtml = {

    start : function(pm) {

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

    }
};

/*
 #[emb]
 :group
 マクロ・変数・JS操作
 :title
 式評価結果の埋め込み
 :exp
 exp で示された式を評価(実行)し、その結果を埋め込みます。
 変数をシナリオ中に表示させたい場合に使います。
 :sample
 [eval exp="f.value1='変数の値だよ～ん'"]
 とどこかで書いておいて、
 [emb exp="f.value1"]
 と書くと、この emb タグが 変数の値だよ～ん という内容に置き換わります。
 :param
 exp=評価するTJS（JS）式を指定します。ここで評価された式がembタグと置き換わります
 #[end]
 */

tyrano.plugin.kag.tag.emb = {

    vital : ["exp"],
    
    pm : {
        exp : ""
    },
    
    log_join:"true",

    start : function(pm) {

        var val = "" + this.kag.embScript(pm.exp);
        //評価された値を代入
        this.kag.ftag.startTag("text", {
            "val" : val,
            "backlog":"join"
        });

    }
};

/*
#[if]
:group
マクロ・変数・JS操作
:title
条件分岐
:exp
式を評価し、その結果が true ( または 0 以外 ) ならば、 elsif・else・endif のいずれかまでにある文章やタグを実行し、 そうでない場合は無視します。
:sample
; 例1
[if exp="false"]
ここは表示されない
[else]
ここは表示される
[endif]

; 例2
[if exp="false"]
ここは表示されない
[elsif exp="false"]
ここは表示されない
[else]
ここは表示される
[endif]

; 例3
[if exp="false"]
ここは表示されない
[elsif exp="true"]
ここは表示される
[else]
ここは表示されない
[endif]

; 例4
[if exp="true"]
ここは表示される
[elsif exp="true"]
ここは表示されない
[else]
ここは表示されない
[endif]
:param
exp=評価する TJS 式を指定します。この式の結果が false ( または 0 な らば、elsif・else・endif タグまでの文章やタグが無視されます。
#[end]
*/

//条件分岐
tyrano.plugin.kag.tag["if"] = {

    vital : ["exp"],

    pm : {
        "exp" : ""
    },
    
    log_join:"true",


    start : function(pm) {

        //条件合格
        if (this.kag.embScript(pm.exp)) {

            //実行済み、次にels elsif が出てきても、無視する
            //this.kag.pushStack("if", true);
            this.kag.pushStack("if", {bool: true, deep: pm.deep_if});
			
            //普通に次の処理を実行
            this.kag.ftag.nextOrder();

            //条件ミス
        } else {
            //まだ、if文をぬけられない
            //this.kag.pushStack("if", false);
            this.kag.pushStack("if", {bool: false, deep: pm.deep_if});
			
            for (var i = 0; i < 2000; i++) {

                var r = this.kag.ftag.nextOrderWithTag({
                    "else" : "",
                    "elsif" : "",
                    "endif" : ""
                });

                if (r == true) {
                    //alert("処理が見つかった!")
                    break;
                    //指定の命令へ処理が写っていることでしょう
                }

            }

            if (i > 1900) {
                this.kag.error("If文に誤りがあります");
            }

        }
    }
};

/*
 #[elsif]
 :group
 マクロ・変数・JS操作
 :title
 それまでの if の中身が実行されていなかったときに、条件付きで実行
 :exp
 if タグと endif タグの間で用いられます。 それまでの if タグまたは elsif タグの中身がひとつも実行されていないときに 式を評価し、その結果が真ならば elsif から次の elsif・else・endif までの間を実行します。
 使い方の例については、if タグの項目を参照してください。
 :sample
 :param
 exp=評価する JS 式を指定します。
 #[end]
 */

tyrano.plugin.kag.tag["elsif"] = {

    vital : ["exp"],

    pm : {
        "exp" : ""
    },

    log_join:"true",

    start : function(pm) {

        //条件合格
        if (this.kag.getStack("if").bool == false && this.kag.embScript(pm.exp)) {
			this.kag.setStack("if", {bool: true, deep: pm.deep_if});
		    
            this.kag.ftag.nextOrder();

            //条件ミス
        } else {

            for (var i = 0; i < 2000; i++) {

                var r = this.kag.ftag.nextOrderWithTag({
                    "else" : "",
                    "elsif" : "",
                    "endif" : ""
                });

                if (r == true) {
                    //alert("処理が見つかった!")
                    break;

                }

            }

            if (i > 1900) {
                this.kag.error("If文に誤りがあります");
            }

        }
    }
};

/*
 #[else]
 :group
 マクロ・変数・JS操作
 :title
 if の中身が実行されなかったときに実行
 :exp
 if タグもしくは elsif タグ と endif タグの間で用いられます。 if または elsif ブロックの中身がひとつも実行されていないとき、 else から endif までの間を実行します。
 使い方の例については、if タグの項目を参照してください。
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag["else"] = {

    pm : {
        "exp" : ""
    },

    log_join:"true",

    start : function(pm) {

        //条件合格
        if (this.kag.getStack("if").bool == false) {
			this.kag.setStack("if", {bool: true, deep: pm.deep_if});
			
            this.kag.ftag.nextOrder();

            //条件ミス
        } else {

            for (var i = 0; i < 2000; i++) {

                var r = this.kag.ftag.nextOrderWithTag({
                    "endif" : ""
                });

                if (r == true) {
                    //alert("処理が見つかった!")
                    break;
                    //指定の命令へ処理が写っていることでしょう
                }

            }

            if (i > 1900) {
                this.kag.error("If文に誤りがあります");
            }

        }
    }
};

/*
 #[endif]
 :group
 マクロ・変数・JS操作
 :title
 if文を終了します
 :exp
 if文を終了します。必ずif文の終わりに記述する必要があります
 :sample
 :param
 exp=評価する TJS 式を指定します。
 #[end]
 */

tyrano.plugin.kag.tag["endif"] = {

    log_join:"true",

    start : function() {

        //普通に次の処理を実行すればいいんじゃないか
        this.kag.popStack("if");
        //スタック取り出し
        this.kag.ftag.nextOrder();

    }
};

/*
 #[call]
 :group
 マクロ・変数・JS操作
 :title
 サブルーチンの呼び出し
 :exp
 指定されたシナリオファイルの指定されたラベルで示される サブルーチンを呼び出します。
 呼び出されたサブルーチンは、 return タグで 呼び出し元や任意の場所に戻ることができます。
 :sample
 :param
 storage=呼び出したいサブルーチンのあるのシナリオファイルを 指定します。省略すると、現在 のシナリオファイル内であると見なされます。,
 target=呼び出すサブルーチンのラベルを指定します。省略すると、ファイルの先頭から実行されます。
 #[end]
 */

tyrano.plugin.kag.tag["call"] = {

    pm : {
        storage : null,
        target : null, //ラベル名
        countpage : true,
        auto_next : "yes"
    },

    start : function(pm) {

        var back_pm = {};
        back_pm.index = this.kag.ftag.current_order_index;
        back_pm.storage = this.kag.stat.current_scenario;
        back_pm.auto_next = pm.auto_next;
        
        back_pm.caller = pm;

        
        //コールはラベルに対して行われる
        this.kag.pushStack("call", back_pm);
        
        if (pm.target == null && pm.storage != null) {
            this.kag.ftag.nextOrderWithIndex(-1, pm.storage)
        } else {
            this.kag.ftag.nextOrderWithLabel(pm.target, pm.storage);
        }
        
        
    }
};

/*
#[return]
:group
マクロ・変数・JS操作
:title
サブルーチンから戻る
:exp
サブルーチンから呼び出し元に戻ります。
KAG３の任意の場所へのリターンは廃止しました。
（必要な場合はCallで代用してください）
:sample
:param
#[end]
*/

//呼び出し元に戻る
tyrano.plugin.kag.tag["return"] = {

    start : function() {

        //マクロからの場合、ここから、呼び出さないとだめ。だからmacro で return は使えない
        var pm = this.kag.getStack("call");
        //最新のコールスタックを取得
        //呼び出し元に戻る
        
        //make.ksが終わるときの判定用
        if(pm.caller && pm.caller.storage){
            if(pm.caller.storage=="make.ks"){
               if(this.kag.tmp.loading_make_ref==true){
                   this.kag.stat.flag_ref_page = true;
                   this.kag.tmp.loading_make_ref = false;
               }
            }
        }
        
        var auto_next = pm.auto_next;
        this.kag.popStack("call");
        
        this.kag.ftag.nextOrderWithIndex(pm.index, pm.storage, undefined, undefined, auto_next);
        //スタックを奪い取る

    }
};

/*
#[macro]
:group
マクロ・変数・JS操作
:title
マクロの記述
:exp
マクロ記述を開始します。新しいタグを定義することが出来ます。
このタグから、endmacro タグまでにある文章やタグは、 name 属性で指定されたタグとして登録され、以後使用できるようになります。
マクロ中に書かれたタグには、特別に % を頭につけた属性の値を指定することができます。 % 以降にはマクロに渡された属性名を指定します。すると、マクロに渡された属性の値をその属性の値とすることができます。このとき、| を使って属性の省略値を指定することもできます ( 下の例参照 )。 属性名には小文字を用いてください。
また、属性の代わりに * を書くと、マクロに渡されたすべての属性をそのタグに渡すこと ができます。
:sample
[macro name="newtag"][font color=0xff0000]新しいタグです[resetfont][endmacro]
[newtag]
[macro name="colortag"][font color=%iro]iro 属性付きのタグ[resetfont][endmacro]
[colortag iro=0x332211]
; ↑ colotag に渡された iro 属性の値が font タグの color 属性に渡される
[macro name="transwait"][trans *][wt][endmacro]
; ↑ この transwait に渡されたすべての属性が trans タグに渡される
[macro name="colortag"][font color=%iro|0xff0000]iro 属性付きで省略値をしていしたタグ[resetfont][endmacro]
; ↑ % の属性の値では、 | のあとに続けて、その属性の省略値を指定することができます
:param
name=マクロの名前を指定してください。以後この名前で新しいタグが定義され呼び出せるようになります。
#[end]
*/

//マクロの定義
tyrano.plugin.kag.tag.macro = {

    vital : ["name"],

    pm : {
        name : ""
    },
    
    log_join:"true",


    start : function(pm) {

        var index = this.kag.ftag.current_order_index;
        var storage = this.kag.stat.current_scenario;
        this.kag.stat.map_macro[pm.name] = {
            "storage" : storage,
            "index" : index
        };

        this.kag.tmp.checking_macro = true;

        //endmacroが出るまで、無視される
        for (var i = 0; i < 2000; i++) {

            var r = this.kag.ftag.nextOrderWithTag({
                "endmacro" : ""
            });

            if (r == true) {
                //alert("endacroが見つかった");
                break;
                //指定の命令へ処理が写っていることでしょう

            }

        }

        if (i > 1900) {
            this.kag.error("マクロが閉じていません");
        }

        //this.kag.ftag.nextOrder();

    }
};

/*
#[endmacro]
:group
マクロ・変数・JS操作
:title
マクロを終了します
:exp
マクロの終了タグです
:sample
:param
#[end]
*/

//マクロ終了
tyrano.plugin.kag.tag.endmacro = {

    log_join:"true",

    start : function(pm) {

        //解析チェック中にここに来た場合は、なにもしない
        if (this.kag.tmp.checking_macro == true) {
            this.kag.tmp.checking_macro = false;
            this.kag.ftag.nextOrder();
            return;
        }

        var map_obj = this.kag.getStack("macro");
        //最新のコールスタックを取得

        //もし、スタックが溜まっている状態なら、
        if (map_obj) {

            //呼び出し元に戻る
            this.kag.popStack("macro");
            this.kag.stat.mp = this.kag.getStack("macro");
            //参照用パラメータを設定
            
            this.kag.ftag.nextOrderWithIndex(map_obj.index, map_obj.storage, true);
            //スタックを奪い取る

            
        } else {

            //呼び出し元がない場合、普通に次の処理を行えば良い
            //endmacroの場合はだめじゃないでしょうか。。。
            //this.kag.ftag.nextOrder();

        }

    }
};

/*
#[erasemacro]
:group
マクロ・変数・JS操作
:title
マクロの削除
:exp
登録したマクロを削除します
:sample
:param
name=削除するマクロ名を記述してください
#[end]
*/

//マクロの削除
tyrano.plugin.kag.tag.erasemacro = {

    vital : ["name"],

    pm : {
        name : ""
    },

    start : function(pm) {
        delete this.kag.stat.map_macro[pm.name];
        this.kag.ftag.nextOrder();
    }
};

/*
#[savesnap]
:group
システム操作
:title
セーブスナップの作成
:exp
現在のプレイ状況を一時保存します。その後、tyrano.ks　拡張の[setsave]を行うことで、ここで記録したセーブデータが保存されます。
:sample
:param
title=セーブデータのタイトルを指定します。
#[end]
*/

//セーブスナップの保存
tyrano.plugin.kag.tag.savesnap = {

    vital : ["title"],

    pm : {
        title : ""
    },

    start : function(pm) {
        this.kag.menu.snapSave(pm.title);
    }
};

/*
 #[autosave]
 :group
 システム操作
 :title
 オートセーブ機能
 :exp
 このタグに到達した際、自動的にプレイ状況を保存します。自動セーブ機能に活用ください。
 [autosave]されたデータが存在する場合、sf.system.autosaveにtrueが格納されます。
 タイトル画面より前に、サンプルのような判定ロジックを用意しておくことで、
 スマートフォンなどで、復帰後に事前にプレイしていた状態からゲームを開始することができるようになります。
 :sample

 [autosave]

 ;autosaveされたデータが存在する場合、sf.system.autosave に trueが入ります
 [if exp="sf.system.autosave ==true"]
 自動的に保存されたデータが存在します。ロードしますか？[l][r]

 [link target=*select1]【１】はい[endlink][r]
 [link target=*select2]【２】いいえ[endlink][r]

 [s]

 *select1
 ;ロードを実行します
 [autoload]

 *select2
 [cm]
 ロードをやめました[l]
 @jump target=*noload
 [else]
 自動的に保存されたデータはありません。[l][r]
 [endif]

 :param
 title=セーブデータのタイトルを指定します。
 #[end]
 */

tyrano.plugin.kag.tag.autosave = {

    vital : [],

    pm : {
        title : ""
    },

    start : function(pm) {

        var that = this;

        //タイトルが設定されいない場合は現在のテキストを設定
        if (pm.title == "") {
            pm.title = this.kag.stat.current_save_str;
        }

        this.kag.menu.snapSave(pm.title, function() {
            that.kag.menu.doSetAutoSave();
            that.kag.ftag.nextOrder();
        });

    }
};

/*
 #[autoload]
 :group
 システム操作
 :title
 オートロード機能
 :exp
 [autosave]タグで保存されたデータを読み込みます
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag.autoload = {

    vital : [],

    pm : {
        title : ""
    },

    start : function(pm) {

        var game_data = $.getStorage(this.kag.config.projectID + "_tyrano_auto_save",this.kag.config.configSave);
        this.kag.menu.loadAutoSave();
        
    }
};

/*
 #[ignore]
 :group
 マクロ・変数・JS操作
 :title
 条件によりシナリオを無視
 :exp
 式を評価し、その結果が true ( または 0 以外 ) ならば、endignore タグまでにある文章 やタグが無視されます。
 :sample
 :param
 exp=評価する TJS 式を指定します。この式の結果が true ( または 0 以外 )ならば、endignore タグまでの文章やタグが無視されます。
 #[end]
 */

tyrano.plugin.kag.tag.ignore = {

    vital : ["exp"],

    pm : {
        exp : ""
    },

    start : function(pm) {

        if (this.kag.embScript(pm.exp)) {

            for (var i = 0; i < 2000; i++) {

                var r = this.kag.ftag.nextOrderWithTag({
                    "endignore" : ""
                });

                if (r == true) {
                    break;
                }
            }

            if (i > 1900) {
                this.kag.error("ignoreが閉じていません");
            }
        } else {

            this.kag.ftag.nextOrder();

        }
    }
};

/*
 #[endignore]
 :group
 マクロ・変数・JS操作
 :title
 ignoreの終了
 :exp
 ignoreを終了します
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag.endignore = {

    start : function() {
        this.kag.ftag.nextOrder();
    }
};

/*
#[edit]
:group
入力フォーム関連
:title
テキストボックス
:exp
テキストボックスを表示します。
入力された値はcommitタグのタイミングで指定した変数名に格納されます
フォーム表示中はシナリオは停止します。（クリックしてもストーリーが進まない）
必ず、グラフィックボタンなどを配置してラベルへジャンプしてください。
こまかい表示方法の変更はtyrano.css内を編集することで可能です。
:sample
[edit name="f.test"]

[locate x=200 y=300 ]
[button graphic="start.png" target=*commit]

[s]

*commit
[commit name="f.test"]
[cm]
;入力されたテキストの内容を表示する
値が確定しました[l]
「[emb exp=f.test]」と入力しましたね[l]

:param
name=格納する変数名を指定して下さい,
length=横幅です,
initial=初期値を設定することができます,
color=文字の色を指定して下さい　デフォルトは黒です,
left=テキストボックスの横位置を指定します,
top=テキストボックスの縦位置を指定します,
size=文字のサイズを指定します　デフォルト２０px,
width=テキストボックスの幅サイズを指定します,
height=テキストボックスの高さを指定します,
maxchars=最大入力文字数

#[end]
*/

//テキストボックス、ティラノスクリプト
tyrano.plugin.kag.tag.edit = {

    vital : ["name"],

    pm : {
        name : "",
        length : "", //ピクセル　横幅
        initial:"",
        placeholder:"",
        color : "black",
        left : "0",
        top : "0",
        size : "20",
        face : "",
        width : "200",
        height : "40",
        maxchars : "1000"
    },

    start : function(pm) {

        var j_text = $("<input class='text_box form' name='" + pm.name + "' type='text' value='' />");

        //指定がない場合はデフォルトフォントを適応する
        if (pm.face == "") {
            pm.face = this.kag.stat.default_font.face;
        }

        pm = $.minifyObject(pm);

        var new_style = {
            color : $.convertColor(pm.color),
            left : parseInt(pm.left),
            top : parseInt(pm.top),
            placeholder : pm.placeholder,
            width : pm.width,
            height : pm.height,
            "font-size" : parseInt(pm.size),
            "font-family" : pm.face
        };
        
        //クラスとイベントを登録する
        this.kag.event.addEventElement({
            "tag":"edit",
            "j_target":j_text,
            "pm":pm
        });
        this.setEvent(j_text,pm);

        j_text.css(new_style);
        j_text.css("position", "absolute");
        
        j_text.attr("maxlength", pm.maxchars);

        this.kag.layer.getFreeLayer().append(j_text);
        this.kag.layer.getFreeLayer().show();

        this.kag.ftag.nextOrder();

    },
    
    setEvent:function(j_text,pm){
         
         var that = TYRANO;
         var _pm = pm;
         
         (function() {
            
            //初期値の設定
            j_text.val(_pm.initial);
            
            j_text.click(function() {
                j_text.focus();
            });

            j_text.on("keydown",function(e){
                //バブリング停止
                e.stopPropagation();
            });

        })();
    
    }
};

/*
#[preload]
:group
システム操作
:title
画像ファイルの事前読み込み
:exp
preloadタグを使用することで、素材ファイル（画像や音楽）を事前に読み込んでおくことができます。
実際に素材を使用する際に表示がスムーズになります。
:sample

;画像ファイルはフルパス（プロジェクトファイル以下）で指定してください
[preload storage="data/fgimage/girl.jpg"]

;配列を渡すと、まとめてロードすることもできます。
[iscript]
f.preload_images = ["data/fgimage/girl.jpg","data/fgimage/haruko.png","data/fgimage/miku1.png","data/fgimage/miku2.png"];
[endscript]

[preload storage=&f.preload_images]

:param
storage=事前に読み込む画像ファイルをフルパスでしていしてください。配列を渡すことでまとめて指定することもできます。,
wait=trueを指定すると、全ての読み込みが完了するまでゲームを停止します。NowLoadingの表示が必要でしょう。true or false デフォルトはfalse

#[end]
*/

//画像ファイルの事前読み込み
tyrano.plugin.kag.tag.preload = {

    vital : ["storage"],

    pm : {
        storage : "",
        wait : "false"
    },

    start : function(pm) {

        var that = this;

        if (pm.wait == "true") {
            this.kag.layer.hideEventLayer();
        }

        var storage = pm.storage;

        //配列で指定された場合
        if ( typeof storage == "object" && storage.length > 0) {

            var sum = 0;

            for (var i = 0; i < storage.length; i++) {

                that.kag.preload(storage[i], function() {
                    sum++;
                    if (storage.length == sum) {
                        //すべてのプリロードが完了
                        if (pm.wait == "true") {
                            that.kag.layer.showEventLayer();
                        }

                        that.kag.ftag.nextOrder();

                    }
                });
            }

        } else {
            this.kag.preload(pm.storage, function() {

                if (pm.wait == "true") {
                    that.kag.layer.showEventLayer();
                }
                that.kag.ftag.nextOrder();

            });
        }

    }
};

/*
 #[clearfix]
 :group
 レイヤ関連
 :title
 Fixレイヤーをクリアします。
 :exp
 name属性を指定することで、該当する要素のみを削除することもできます。
 :sample

 ;fixレイヤーへの追加
 [ptext name="sample" layer=fix page=fore text="テキストテキスト" size=30 x=200 y=100 color=red ]

 ;fixレイヤーのクリア
 [clearfix name="sample"]

 :param
 name=fixレイヤーへ追加した時に名前を指定した場合、適応できます。

 #[end]
 */

tyrano.plugin.kag.tag.clearfix = {

    pm : {
        name : ""
    },

    start : function(pm) {

        if (pm.name != "") {
            $(".fixlayer." + pm.name).remove();
        } else {
            $(".fixlayer").remove();
        }

        this.kag.ftag.nextOrder();

    }
};

/*
 #[commit]
 :group
 入力フォーム関連
 :title
 フォームの確定
 :exp
 テキストボックスの値を確定して指定したname属性で指定した変数に値を格納します。
 注意点としてcommitが実行された段階で、テキストボックスなどのフォームが表示されている必要があります。
 :sample
 :param

 #[end]
 */

tyrano.plugin.kag.tag.commit = {

    start : function() {

        var that = this;

        this.kag.layer.getFreeLayer().find(".form").each(function() {

            var name = $(this).attr("name");
            var val = $(this).val();

            var str = name + " = '" + val + "'";

            that.kag.evalScript(str);

            //console.log($(this));

        });

        that.kag.ftag.nextOrder();

    }
};

/*
 #[cursor]
 :group
 システム操作
 :title
 マウスカーソルに画像を設定できいます
 :exp
 storageに指定した画像ファイルがマウスカーソルに指定されます。data/imageフォルダ以下に配置してください。ファイルは形式は gif png jpg です。
 ゲーム中に何度でも変更することが可能です。ゲームでの標準カーソルを指定する場合はsystem/Config.tjsのcursorDefaultを指定してください。
 システムの標準カーソルに戻す場合はdefaultを指定します
 :sample
 [cursor storage="my_cursor.gif"]
 :param
 storage=カーソルに指定したい画像ファイルを指定します。画像はdata/imageフォルダに配置してください。
 #[end]
 */

tyrano.plugin.kag.tag.cursor = {

    vital : ["storage"],

    pm : {
        storage : "default"
    },

    start : function(pm) {

        //評価された値を代入
        this.kag.setCursor(pm.storage);
        this.kag.ftag.nextOrder();

    }
};

/*
 #[screen_full]
 :group
 システム操作
 :title
 フルスクリーン
 :exp
 ゲーム画面をフルスクリーンにします。PCゲームのみ動作します
 ウィンドウに戻す場合は再度呼び出すことでウィンドウに戻ります
 :sample
 [screen_full]
 :param
 #[end]
 */

tyrano.plugin.kag.tag.screen_full = {

    vital : [],

    pm : {
    },

    start : function(pm) {

        this.kag.menu.screenFull();

        this.kag.ftag.nextOrder();

    }
};

/*
 #[sleepgame]
 :group
 システム操作
 :title
 ゲームの一時停止
 :exp

 このタグに到達した時点でゲームの状態を保存した上で、他のシナリオへ移動することができます。
 そして遷移先で[awakegame]が実行されたらゲームに復帰できます。

 このタグはゲームから一時的に画面を遷移したい場合に非常に強力に機能します。

 例えば、ゲームの途中でコンフィグの設定を行いたい場合などは
 sleepgameで進行状態を保持した上で、コンフィグ画面に移動します。[awakegame]タグでゲームに復帰します

 sleepgameは複数実行することはできません。必ず[awakegame]を実行して下さい。
 [awakegame]を実行しない場合は[breakgame]で休止中の状態を破棄します。

 [button]で呼びたす場合、roleにsleepgameを指定すると、押された時にsleepgameを適応することができます。

 :sample

 [sleepgame storage="scene3.ks" target="*start" ]

 ;buttonに紐付ける方法
 [button name="button" role="sleepgame" fix="true" graphic="button/skip.gif" x=450 y=400 storage="scene3.ks" ]

 :param
 storage=ゲームを中断して処理を始めるシナリオ名を記述します。省略された場合は、現在のファイル名と解釈されます,
 target=ジャンプする先のラベル名を指定できます。省略されている場合は先頭位置からと解釈されます,
 next=true か　falseを指定。 falseを指定するとawakegameで戻ってくる時に次の命令へ移らなくなります。デフォルトはtrue

 #[end]
 */

tyrano.plugin.kag.tag.sleepgame = {

    vital : [],

    pm : {
        storage : "",
        target : "",
        next:true
    },

    start : function(pm) {

        var that = this;

        //タイトルが設定されていない場合は現在のテキストを設定
        var title = this.kag.stat.current_save_str;

        //スナップを保存。サムネは不要
        this.kag.menu.snapSave(title, function() {
            //保存したスナップを、sleep領域に配置したうえで、ジャンプする
            that.kag.menu.setGameSleep(pm.next);
            that.kag.ftag.startTag("jump", pm);

        }, "false");

    }
};

/*
 #[awakegame]
 :group
 システム操作
 :title
 ゲームの一時停止からの復帰
 :exp
 [gamesleep]タグで一時停止していたゲームを再開します。
 ジャンプ先での変数操作 （f）については、ゲーム復旧後も反映されます。
 ゲームに戻る前にmake.ksを通過します。ジャンプ先での操作に対して戻る前に設定を行いたい場合は
 make.ksで変数fに対して、[awakegame]からの復帰かどうかの判定をいれるとよいでしょう。
 :sample
 :param
 variable_over=trueかfalseを指定します。trueを指定するとsleepgame中のゲーム変数への変更を引き継ぎます。デフォルトはtrue,
 bgm_over=trueかfalseを指定します。trueを指定するとsleepgame中のBGMを再生し続けます。デフォルトはtrue。falseだとsleepgame時のBGMに切り替わります。
 #[end]
 */

tyrano.plugin.kag.tag.awakegame = {

    vital : [],

    pm : {

        variable_over : "true",
        bgm_over : "true"

    },

    start : function(pm) {

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

            var options = {
                bgm_over : pm.bgm_over
            };
            
            if(this.kag.tmp.sleep_game_next==true){
                options["auto_next"] ="yes";
            }

            this.kag.menu.loadGameData($.extend(true, {}, sleep_data), options);

            this.kag.tmp.sleep_game = null;

        }
    }
};

/*
 #[breakgame]
 :group
 システム操作
 :title
 ゲームの停止データの削除
 :exp
 [gamesleep]タグで一時停止していたゲームを削除します。
 [gameawake]しない場合、このタグで削除してください。

 :sample
 :param

 #[end]
 */

tyrano.plugin.kag.tag.breakgame = {

    vital : [],

    pm : {
    },

    start : function(pm) {

        var that = this;

        this.kag.tmp.sleep_game = null;
        this.kag.ftag.nextOrder();

    }
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
 alert confirm input
 inputはv470以降、廃止します。使用しないでください
 :sample
 ;警告ウィンドウのメッセージ表示
 [dialog type="alert" text="メッセージ内容" ]

 ;確認ダイアログの表示
 [dialog type="confirm" text="メッセージ内容" storage="scene2" target="ok_label" storage_cancel="" target_cancel="" ]

 ;V470から廃止です。使用しないでください
 ;テキスト入力ダイアログの表示
 [dialog type="input" text="名前を教えて下さい" storage="scene2" target="ok_label" ]

 :param
 name=confirmを指定した時に格納する変数名を指定して下さい。,
 type=ダイアログの種類を指定します。alert confirm ,
 text=メッセージとして表示するてテキストを指定して下さい,
 storage=指定されている場合はダイアログのボタンを押した後のジャンプ先シナリオファイルを指定します。省略すると、現在 のシナリオファイル内であると見なされます。,
 target=指定されている場合はダイアログのボタンを押した後のジャンプ先ラベルを指定します。,
 storage_cancel=指定されている場合はダイアログのキャンセルボタンを押した後のジャンプ先シナリオファイルを指定します。,
 target_cancel=指定されている場合はダイアログのキャンセルボタンを押した後のジャンプ先ラベルを指定します。,
 label_ok=OKボタンの名前を好きなものに指定できます。デフォルトはOKです　,
 label_cancel=キャンセルボタンの名前を好きなものに指定できます。デフォルトはCancelです　
 #[end]
 */

tyrano.plugin.kag.tag.dialog = {

    vital : [],

    pm : {
        name : "tf.dialog_value",
        type : "alert",
        text : "",
        storage : "",
        target : "",
        storage_cancel : "",
        target_cancel : "",
        label_ok : "OK",
        label_cancel : "Cancel"
    },

    start : function(pm) {

        var that = this;
        
        $(".remodal").find(".remodal-confirm").html(pm.label_ok);
        $(".remodal").find(".remodal-cancel").html(pm.label_cancel);

        if (pm.type == "confirm") {
            $.confirm(pm.text, function() {
                that.finish(pm);
            }, function() {
                pm.storage = pm.storage_cancel;
                pm.target = pm.target_cancel;
                that.finish(pm);
            });
        } else if (pm.type == "input") {

            alertify.set({
                buttonFocus : "none",
                labels : {
                    ok : pm.label_ok,
                    cancel : pm.label_cancel
                }
            });
            alertify.prompt(pm.text, function(flag, text) {
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
            
            $(".alertify-text").on("keydown",function(e){
                e.stopPropagation();
            });

        } else {
            //alert
            $.alert(pm.text, function() {
                that.finish(pm);
            });

        }

        //this.kag.ftag.nextOrder();

    },

    //終わった後どうするか
    finish : function(pm) {

        if (pm.storage != "" || pm.target != "") {
            this.kag.ftag.startTag("jump", pm);
        } else {
            this.kag.ftag.nextOrder();
        }

    }
};

/*
 #[plugin]
 :group
 システム操作
 :title
 プラグイン読み込み
 :exp
 外部プラグインを読み込むことができます。
 プラグインはdata/others/plugin/　フォルダに配置します。

 また、pluginタグは引数を自由に渡すことができます。
 例えば
 [plugin name="original1" font_color="black" myname="シケモク" ]

 のようにすると、プラグイン先のinit.ks 内で
 mp.font_color
 mp.myname
 のような形で引数を利用できます。

 これを &mp.font_color のように使うことで、カスタマイズ可能なプラグインが作れます。
 ただ、マクロで使用可能だった%font_color のような形の使用はできませんので注意。

 :sample
 ;テーマ変更
 [plugin name="original1" ]

 ;自由に引数を渡すことも可能
 [plugin name="original1" font_color="black" arg2="aaaaaa" ]

 :param
 name=data/othres/plugin以下の配置したフォルダ名（プラグイン名）を指定する,
 storage=最初に読み込むシナリオファイルを変更できます。デフォルトはinit.ks です。

 #[end]
 */

tyrano.plugin.kag.tag.plugin = {

    vital : ["name"],

    pm : {

        name : "",
        storage : "init.ks"

    },

    start : function(pm) {

        var storage_url = "";
        var name = pm.name;

        pm.storage = "../others/plugin/" + name + "/" + pm.storage;

        //引数に渡す。
        this.kag.stat.mp = pm;

        this.kag.ftag.startTag("call", pm);

    }
};

/*
 #[sysview]
 :group
 システム操作
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
 type=save load backlog menu が指定可能 ,
 storage=HTMLファイルのパスを指定します。
 #[end]
 */

tyrano.plugin.kag.tag.sysview = {

    vital : ["type", "storage"],

    pm : {

        type : "",
        storage : ""

    },

    start : function(pm) {

        var type = pm.type;
        var storage = pm.storage;

        //システムで使用するHTMLの場所を変更する
        //HTMLキャッシュは削除する
        if (this.kag.cache_html[type]) {
            delete this.kag.cache_html[type];
        }

        this.kag.stat.sysview[type] = storage;

        this.kag.ftag.nextOrder();

    }
};

/*
 #[loadcss]
 :group
 システム操作
 :title
 CSS反映

 :exp
 ゲームの途中でCSSを読み込むことができます。
 :sample
 ;CSSファイルの読み込み
 [loadcss file="./data/others/css/mystyle.css" ]

 :param
 file=読み込みたいCSSファイルを指定します

 #[end]
 */

tyrano.plugin.kag.tag.loadcss = {

    vital : ["file"],

    pm : {
        file : ""
    },

    start : function(pm) {

        var file = pm.file;

        //ファイルの読み込み
        var style = '<link rel="stylesheet" href="' + file + "?" + Math.floor(Math.random() * 10000000) + '">';
        $('head link:last').after(style);
        this.kag.stat.cssload[file] = true;

        this.kag.ftag.nextOrder();

    }
};

/*
 #[save_img]
 :group
 システム操作
 :title
 セーブ時のキャプチャイメージ変更

 :exp
 セーブデータのサムネイルをキャプチャを変更することができます。
 このタグで設定したイメージがセーブ時の画像として適応されます。
 セーブ画像は「bgimage」フォルダから指定します。
 storageに「default」と指定することで、従来の画面自動キャプチャに戻せます。

 :sample
 ;サムネイル画像の変更
 [save_img storage="my_capture.png" ]

 :param
 storage=設定したいセーブ用画像を設定します。bgimageフォルダに配置してください。「default」を指定するとオートキャプチャに戻ります。,
 folder=bgimageフォルダ以外から取得したい場合は、ここに指定します。例えば、othersやfgimage、imageなどです。

 #[end]
 */

tyrano.plugin.kag.tag.save_img = {

    vital : [],

    pm : {
        storage : "",
        folder : ""
    },

    start : function(pm) {

        var storage = pm.storage;
        var folder ="";
        var storage_url ="";
        
        if(pm.storage==""){
            pm.storage="default";
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
        
        if(pm.storage=="default"){
             storage_url = "";
        }
        
        //画像の場所を指定する。
        this.kag.stat.save_img = storage_url;

        this.kag.ftag.nextOrder();

    }
};


/*
 #[nolog]
 :group
 システム操作
 :title
 バックログ記録停止

 :exp
 このタグに到達すると、バックログへ一切追加されなくなります。
 [endnolog]タグに到達すると、バックログへの記録が再開されます。

 :sample
 ここはログに記録される[p]
 [nolog]
 ログに記録されない[p]
 ここもログに記録されない[p]
 [endnolog]
 ここから、ログ記録再開[p]
 
 :param
 
 #[end]
 */

tyrano.plugin.kag.tag.nolog = {

    vital : [],

    pm : {
        
    },

    start : function(pm) {

        this.kag.stat.log_write = false;
        //記録しないフラグ追加
        this.kag.ftag.nextOrder();

    }
};

/*
 #[endnolog]
 :group
 システム操作
 :title
 バックログ記録を再開する

 :exp
 [nolog]タグでログ記録を停止している場合
 この[endnolog]タグで記録を再開する必要があります。

 :sample
 ここはログに記録される[p]
 [nolog]
 ログに記録されない[p]
 ここもログに記録されない[p]
 [endnolog]
 ここから、ログ記録再開[p]
 
 :param
 
 #[end]
 */

tyrano.plugin.kag.tag.endnolog = {

    vital : [],

    pm : {
        
    },

    start : function(pm) {

        this.kag.stat.log_write = true;
        //記録しないフラグ追加
        this.kag.ftag.nextOrder();

    }
};


/*
 #[pushlog]
 :group
 システム操作
 :title
 バックログに文字列記録

 :exp
 バックログに任意の文字列を追加できます。
 例えば [mtext]などは通常バックログに記録されませんが
 このタグを内包したマクロなどにしておくと、バックログに追加した
 演出テキストなどが可能です。 

 :sample
 [pushlog text="ここに好きなログ文字列を記述できます"]
 
 :param
 text=バックログに追加する文字列を追加できます,
 join=バックログを前の文字列に連結するか否かを指定できます。trueを指定すると前の文字列につなげます。デフォルトはfalse
 
 #[end]
 */

tyrano.plugin.kag.tag.pushlog = {

    vital : ["text"],

    pm : {
        "text":"",
        "join":"false"
    },

    start : function(pm) {
        
        if(pm.join=="true"){
            this.kag.pushBackLog(pm.text,"join");
        }else{
            this.kag.pushBackLog(pm.text,"add");
        }

        this.kag.ftag.nextOrder();

    }
};

/*
 #[start_keyconfig]
 :group
 システム操作
 :title
 キーコンフィグ操作の有効化

 :exp
 キーコンフィグが無効の場合、再開することができます。
 
 :sample
 [start_keyconfig]
 
 :param
 
 #[end]
 */

tyrano.plugin.kag.tag.start_keyconfig = {

    
    pm : {
    },

    start : function(pm) {
        
        this.kag.stat.enable_keyconfig = true;
        this.kag.ftag.nextOrder();

    }
};


/*
 #[stop_keyconfig]
 :group
 システム操作
 :title
 キーコンフィグ操作の無効化

 :exp
 キーコンフィグを一時的に無効にすることができます。
 再開させる場合は[start_keyconfig]タグを使用してください。
 
 無効になるのは
 ・マウス操作
 ・キーボード操作
 ・マウスのスワイプ操作
  
 :sample
 [stop_keyconfig]
 ここは無効。
 ここも無効。
 [start_keyconfig]
 ここから、キーコンフィグ設定が有効。
 
 :param
 
 #[end]
 */

tyrano.plugin.kag.tag.stop_keyconfig = {

    
    pm : {
    },

    start : function(pm) {
        
        this.kag.stat.enable_keyconfig = false;
        this.kag.ftag.nextOrder();

    }
};


/*
 #[apply_local_patch]
 :group
 システム操作
 :title
 パッチファイルを手動で反映します

 :exp
 V470以降で使用可
 パッケージングして配布している場合のみ有効。
 このタグに到達した時点で、パッチファイルをゲームに反映することが可能。
 dataフォルダ以外、tyrano本体をアップデートするときは
 このタグではなく、起動時のアップデートで対応してください。
 パッチファイルの容量が大きい場合は一時的にゲームが停止します。ロード中といった表記を表示すると親切です。
 
 :sample
 [apply_local_patch file="test.tpatch" ]
 
 :param
 file=パッチファイルのパスを指定してください。exeファイルの階層を起点として指定します,
 reload=true or false を指定。trueを指定すると反映後にゲームが再読込されます。デフォルトはfalse
 
 
 #[end]
 */

tyrano.plugin.kag.tag.apply_local_patch = {

    vital : ["file"],

    pm : {
        file:"",
        reload:"false"
        
    },

    start : function(pm) {
    
        var that = this;
        
        if(!$.isNWJS()){
            that.kag.ftag.nextOrder();
        }
        
        var patch_path = $.localFilePath() +"/"+pm.file;
        
        that.kag.applyPatch(patch_path, pm.reload, function(){
        
            that.kag.ftag.nextOrder();
        
        });
        
    }
};

/*
 #[check_web_patch]
 :group
 システム操作
 :title
 サーバーからアップデートをチェックして反映させることができます。

 :exp
 V470以降で使用可
 サーバーにアップデートパッチを配置して更新がある場合
 自動的にメッセージを表示して、パッチの適応を促すことができます。
 サーバーをレンタルして json ファイルと tpatch ファイルを配置します。
 また、反映するためには、一度ゲームを再起動する必要があります。
 
 :sample
 [check_web_patch url="http://tyrano.jp/patch/mygame.json" ]
 
 :param
 url=サーバのjsonファイルのURLをhttp:// から指定してください
 
 #[end]
 */
 
 
tyrano.plugin.kag.tag.check_web_patch = {

    vital : ["url"],

    pm : {
        url:"",
        reload:"false"
        
    },
    
    start : function(pm) {
    
        var that = this;
        
        if(!$.isNWJS()){
            that.kag.ftag.nextOrder();
        }
        
        $.ajax({
            url: pm.url + "?" + Math.floor(Math.random() * 1000000),
            cache: false,
            dataType: "json",
            success: function(json){
                
                if(typeof json!="object"){
                    json = JSON.parse(json);
                }   
                
                that.checkPatch(json,pm);
            },
            error:function(e){
                console.log(e);
                alert("file not found:"+pm.url);
            }
            
        });
        
    },
    
    checkPatch:function(obj,pm){
        
        var that = this;
        
        //バージョンの確認
        if(typeof this.kag.variable.sf._patch_version == "undefined"){
            this.kag.evalScript("sf._patch_version="+this.kag.config["game_version"]);
        }
        
        if(parseFloat(this.kag.variable.sf._patch_version) < parseFloat(obj.version)){
        
            $.confirm("新しいアップデートが見つかりました。Ver:"+parseFloat(obj.version)+"「"+obj.message+"」<br />アップデートを行いますか？",
                function(){
                    
                    alert("アップデートを行います。完了後、自動的にゲームは終了します。");
                    
                    var http = require('http');
                    var fs = require('fs');
                    
                    var file = obj.file;
                    // URLを指定 
                    var url = $.getDirPath(pm.url) + file;
                    
                    if(url.indexOf("https")!=-1){
                        alert("エラー：SSL(https)の通信は非対応です");
                        return;
                    }
                    
                    // 出力ファイル名を指定
                    var patch_path = $.localFilePath();
                    patch_path = patch_path + "/" + file;
                    
                    var outFile = fs.createWriteStream(patch_path);
                    
                    var flag = false;
                    // ダウンロード開始
                    var req = http.get(url, function (res) {
                        
                        res.pipe(outFile);
                        
                        res.on('end', function () {
                            
                            outFile.close();
                            //アップデートを実行
                            that.kag.evalScript("sf._patch_version="+ obj.version);
                            require('nw.gui').Window.get().close();
                            
                        }); 
                        
                    });
                    
                    // エラーがあれば扱う。
                    req.on('error', function (err) {
                        console.log('Error: ', err); return;
                    });

                     
                    
                    
                },function(){
                    
                    that.kag.ftag.nextOrder();
                    
                }
            );
        
        }else{
            
            that.kag.ftag.nextOrder();
        
        }
        
        console.log(obj);
        
        
        
        //ディレクトリのみ変更して差し替えて実行。
        //メッセージは表示するよ。
        //バージョンを確認。未反映ならダウンロードして配置する。
        //再起動
        
        
    }
};




