/*
Ver4.50以降で有効
ティラノスクリプトのキーコンフィグの設定を行うファイルです。
特定のキーボード・マウス・ジェスチャー操作に対して
ティラノスクリプトのアクション（スキップを開始するなど）を割り当てることができます。

<設定できるアクション>

    next        : 次のテキストに進む, フォーカス中のボタンをクリックする（キーボード・ゲームパッドのみ）
    auto        : オートモードを開始／停止する
    skip        : スキップモードを開始／停止する
    holdskip    : キーまたはボタンを押し込んでいる間だけスキップする（キーボード・ゲームパッドのみ）
    hidemessage : メッセージウィンドウの表示／非表示を切り替える
    fullscreen  : フルスクリーンを切り替える
    save        : セーブ画面を開く
    load        : ロード画面を開く
    menu        : メニュー画面を開く
    title       : タイトルに戻る
    backlog     : バックログを開く
    qsave       : クイックセーブを実行する
    qload       : クイックロードを実行する
    focus_index : 特定の番号のボタンをフォーカスする（index パラメータの指定が必須）
    focus_next  : ボタンのフォーカスを次に移動する
    focus_prev  : ボタンのフォーカスを前に移動する
    focus_up    : ボタンのフォーカスを上に移動する
    focus_down  : ボタンのフォーカスを下に移動する
    focus_left  : ボタンのフォーカスを左に移動する
    focus_right : ボタンのフォーカスを右に移動する
    scroll_up   : 上にスクロール
    scroll_down : 下にスクロール
    close       : メニューを閉じる
    cancel      : フォーカスを外す, 確認ウィンドウをキャンセルする, メニューを閉じる, オートモード・スキップモードを解除する
    sleepgame   : [sleepgame]を実行する（詳細は後述）
    
    
    ★ -a オプション
    
    アクション名のあとに半角スペースを空けて "-a" を付け加えて指定すると、
    そのアクションは always アクションになります。
    always アクションは、[stop_keyconfig] でキーコンフィグが無効化されているときでも使用できます。
    
    (指定例) 
    
    32: "focus_next -a",
    
    
    ★ -h オプション
    
    キーボードまたはゲームパッドに設定するアクションにのみ有効。
    -h オプションを付けることで hold アクションとなり、
    キーまたはボタンの長押しが連打として扱われるようになります（ホールド連打）。
    さらに delay パラメータを指定することで、ホールド連打が始まるまでの遅延を設定できます。
    
    (指定例) 
    
    UP: "scroll_up -h delay=300",
    
    
    ★sleepgameについて
    
    キーコンフィグで[sleepgame]を発動することができます。
    以下のように指定してください。
    
    sleepgame storage=config.ks target=start
    
    ※ラベル（target=...）は省略してもかまいません。 (例) sleepgame storage=config.ks
    
    
    ★関数の直接指定
    
    上記キーワードの代わりにJavaScriptの関数を指定することもできます。
    
    (指定例) 
    
    32: function () {
        alert("Hello!")
    },
    
    
    
<キーボード操作の指定方法> 
    
    ★キータイプによる指定方法

    "キータイプ" とそれに対応する "アクション" を次のように配置することで
    キーコンフィグを設定できます。
    
    (指定例)
    
    key: {
        " "         : "hidemessage",
        "Enter"     : "next",
    },
    
    ★キーコードによる指定方法（従来の方法）
    
    "キータイプ" のかわりに "キーコード" を使って定義することもできます。
    たとえ、次のように指定すれば、上の例とまったく同じ指定をしたことになります。
    
    (キーコードを使った指定例)
    
    key: {
        "32" : "hidemessage",
        "13" : "next",
    },
    
    ★ヒント
    
    キータイプやキーコードは次のサイトで実際にキーを押すことで調べることができます。
    https://ogihara88sai.github.io/display-keydown-event/
    (上記サイトで表示される key がキータイプ、keyCode がキーコードです)

    ★キーボード操作専用のアクション
    
    vmouse_up    : 仮想マウスカーソルを上に動かします
    vmouse_down  : 仮想マウスカーソルを下に動かします
    vmouse_left  : 仮想マウスカーソルを左に動かします
    vmouse_right : 仮想マウスカーソルを右に動かします
    
    
<マウス操作>
    
    "マウス操作を表すキーワード" とそれに対応する "アクション" を配置することで
    キーコンフィグを設定できます。
    
    ★マウス操作を表すキーワード一覧
    
    right      : マウスの右側のボタンを押したときの動作
    center     : マウスの中央のボタン（ホイール）を押したときの動作
    wheel_up   : マウスのホイールを上に回したときの動作
    wheel_down : マウスのホイールを下に回したときの動作
    next       : マウスの「進む」ボタンを押したときの動作
    prev       : マウスの「戻る」ボタンを押したときの動作

    
    
<ジェスチャー操作>

    スマホやタブレットにおけるフリック操作やホールド操作にキーコンフィグを割り当てることができます。
    
    ★操作を表すキーワード一覧
    
    swipe_up_1    : 1本の指で画面上方向にフリックしたときの動作
    swipe_left_1  : 1本の指で画面左方向にフリックしたときの動作
    swipe_right_1 : 1本の指で画面右方向にフリックしたときの動作
    swipe_down_1  : 1本の指で画面下方向にフリックしたときの動作
    hold          : 画面を一定時間タッチし続けたときの動作
    
    ★ヒント
    
    swipe_up_1 などの _1 は指の数を表しており、
    たとえば swipe_up_1 なら「1本の指で画面左方向にスワイプしたときの動作」という意味になります。
    
    つまり、2本の指でスワイプしたときのアクションを指定したい場合は
    swipe_up_2 のような名前でアクションを定義すればよいということです。

    
    
<ゲームパッド操作>

    ★ボタン
    
    2通りの設定の仕方があります。どちらで設定してもOKです。設定が混在しても問題ありません。
    
    (1) A, LEFT, START などの "ボタンを表すキーワード" と "アクション" を並べる。
    
    "ボタンを表すキーワード" として指定可能なものは以下のとおりです。
    
    A      : Aボタン（右側エリアの下ボタン）
    B      : Bボタン（右側エリアの右ボタン）
    X      : Xボタン（右側エリアの左ボタン）
    Y      : Yボタン（右側エリアの上ボタン）
    LB     : Lバンパー（Lボタン、手前側のもの）
    LT     : Lトリガー（ZLボタン、奥側のもの）
    RB     : Rバンパー（Rボタン、手前側のもの）
    RT     : Rトリガー（ZRボタン、奥側のもの）
    START  : スタートボタン（中央エリアの右ボタン）
    SELECT : セレクトボタン（中央エリアの左ボタン）
    HOME   : ホームボタン（中央エリアの中央ボタン）
    LS     : Lスティック押し込み
    RS     : Rスティック押し込み
    UP     : 十字キーの上入力
    DOWN   : 十字キーの下入力
    LEFT   : 十字キーの左入力
    RIGHT  : 十字キーの右入力
    
    ※ゲームパッドのボタン配置が標準的なXboxコントローラーと同一であることを想定しています。
    ※ニンテンドーのコントローラーとはAとB、XとYの配置が逆であることに注意してください。
    
    (指定例)
    
    gamepad: {
        button: {
            B: "next",
        },
        ...
    
    
    (2) 0, 1, 2 などの "ボタンに対応する数値" と "アクション" を並べる。
    
    たとえば標準的なXboxコントローラーであれば B = 0、A = 1、という具体に、
    各ボタンに対応する数値が存在します。
    その数値を使ってキーコンフィグを定義することもできます。
    
    (指定例)
    
    gamepad: {
        button: {
            1: "next",
        },
        ...
    
    
    ★スティックのデジタル入力
    
    アナログスティックの操作をデジタルな上下左右入力と解釈し、
    その上下左右入力に対応するアクションを設定することができます。
    
    (指定例)
    
    gamepad: {
        ...
        stick_digital: {
            L_UP: "",
            L_DOWN: "",
            L_LEFT: "",
            L_RIGHT: "",
            R_UP: "vmouse_wheelup -a -h delay=0",
            R_DOWN: "vmouse_wheeldown -a -h delay=0",
            R_LEFT: "",
            R_RIGHT: "",
        },
        ...
    
    ★スティック入力
    
    スティック入力に仮想マウスカーソルの操作を割り当てることができます。
    "vmouse_move" または "vmouse_aim" が指定可能です。
    
    vmouse_move : 仮想マウスカーソルを相対移動させます。基本はこちら。
    vmouse_aim  : スティックの角度・倒し具合に対応する画面上の一点に仮想マウスカーソルを絶対移動させます。
    
    (指定例)

    stick: {
        L: "vmouse_move",
        R: "",
    }

*/



var __tyrano_key_config = {
    // ブラウザ固有の動作（キーの組み合わせによるショートカットアクション）を許可するか否か
    // "true" だとブラウザ固有の動作が有効に、"false" だと無効になります。
    // たとえば Google Chrome には次のようなショートカットアクションが存在しますが、
    // "system_key_event" が "false" だとこのアクションが無効化されます。
    //   Ctrl + Shift + I : デベロッパーツールを開く
    //   Ctrl + Shift + O : ブックマークマネージャを開く
    system_key_event: "false",

    // キーボード操作
    key: {
        "Tab"        : "focus_next -a",
        "Escape"     : "cancel -a",
        " "          : "hidemessage",
        "Enter"      : "next -a",
        "Meta"       : "holdskip",
        "Control"    : "holdskip",
        "ArrowLeft"  : "focus_left -a -h delay=300",
        "ArrowUp"    : "focus_up -a -h delay=300",
        "ArrowRight" : "focus_right -a -h delay=300",
        "ArrowDown"  : "focus_down -a -h delay=300",
        "w"          : "vmouse_up -a -h",
        "s"          : "vmouse_down -a -h",
        "a"          : "vmouse_left -a -h",
        "d"          : "vmouse_right -a -h",
        "1"          : "focus_index -a index=1",
        "2"          : "focus_index -a index=2",
        "3"          : "focus_index -a index=3",
        "4"          : "focus_index -a index=4",
        "5"          : "focus_index -a index=5",
        "6"          : "focus_index -a index=6",
        "7"          : "focus_index -a index=7",
        "8"          : "focus_index -a index=8",
        "9"          : "focus_index -a index=9",
    },

    // マウス操作
    mouse: {
        "right"      : "hidemessage",
        "center"     : "menu",
        "wheel_up"   : "backlog",
        "wheel_down" : "next",
        "prev"       : "",
        "next"       : "",
    },

    // ジェスチャー操作
    gesture: {
        "swipe_up_1"    : "backlog",
        "swipe_left_1"  : "auto",
        "swipe_right_1" : "menu",
        "swipe_down_1"  : "load",
        "hold"          : "skip",
    },
    
    // ゲームパッド操作
    gamepad: {
        button: {
            A       : "cancel -a",
            B       : "next -a",
            X       : "auto",
            Y       : "backlog",
            LB      : "save",
            LT      : "load",
            RB      : "skip",
            RT      : "holdskip",
            START   : "menu",
            SELECT  : "",
            HOME    : "title",
            LS      : "",
            RS      : "",
            UP      : "focus_up -a -h delay=300",
            DOWN    : "focus_down -a -h delay=300",
            LEFT    : "focus_left -a -h delay=300",
            RIGHT   : "focus_right -a -h delay=300",
        },
        stick_digital: {
            L_UP    : "",
            L_DOWN  : "",
            L_LEFT  : "",
            L_RIGHT : "",
            R_UP    : "vmouse_wheelup -a -h",
            R_DOWN  : "vmouse_wheeldown -a -h",
            R_LEFT  : "",
            R_RIGHT : "",
        },
        stick: {
            L       : "vmouse_move",
            R       : "",
        }
    },
};
