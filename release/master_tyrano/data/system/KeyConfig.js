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
    
    ゲームパッドのみ有効。-h オプションを付けることで hold アクションとなります。
    ボタンが長押しされたときに連打として扱い、連続してアクションを実行するようになります。
    
    (指定例) 
    
    UP: "scroll_up -h",
    
    
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
    
    "キーコード" と "そのキーが押されたときのアクション" を配置します。
    キーコードはキーの種類に対応する特定の数値です。たとえばスペースキーなら"32"といった具合です。
    キーコードの確認には次のサイトが利用可能です。
    http://shanabrian.com/web/javascript/keycode.php
    上記サイトで実際にキーを押すことでキーコードを確認できます。
    
    ★使用頻度が高いと思われるキーコードの一覧
    
    32 : space
    13 : Enter
    91 : Command (Mac)
    17 : Ctrl (Windows)
    27 : Escape
    37 : ←
    38 : ↑
    39 : →
    40 : ↓
    90 : z
    88 : x
    
<マウス操作>
    
    right      : 右クリックしたときの動作
    center     : センターボタン（マウスホイール）をクリックしたときの動作
    wheel_up   : マウスホイールを上に回したときの動作
    wheel_down : マウスホイールを下に回したときの動作

<ジェスチャー操作>

    ★スマホ・タブレット限定
    フリック操作やホールド操作にキーコンフィグを割り当てることができます。
    
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
    
    指定可能なキーワードは、次のとおりです。
    
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
        button: {
            ...
        },
        stick_digital: {
            L: {
                UP: "focus_up",
                DOWN: "focus_down",
                LEFT: "focus_left",
                RIGHT: "focus_right",
            },
            R: {
                ...
            },
        },
        ...

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
        9: "focus_next -a",   // Tab
        27: "cancel -a",      // Escape
        32: "hidemessage",    // Space
        13: "next -a",        // Enter
        91: "holdskip",       // Command (Mac)
        17: "holdskip",       // Ctrl (Windows)
        37: "focus_next -a",  // ←
        38: "focus_up -a",    // ↑
        39: "focus_right -a", // →
        40: "focus_down -a",  // ↓
    },

    // マウス操作
    mouse: {
        right: "hidemessage", // 右クリック
        center: "menu",       // ホイールクリック
        wheel_up: "backlog",  // ホイールアップ
        wheel_down: "next",   // ホイールダウン
    },

    // ジェスチャー操作
    gesture: {
        // 上スワイプ
        swipe_up_1: {
            action: "backlog",
        },
        // 左スワイプ
        swipe_left_1: {
            action: "auto",
        },
        // 右スワイプ
        swipe_right_1: {
            action: "menu",
        },
        // 下スワイプ
        swipe_down_1: {
            action: "load",
        },
        // ホールド
        hold: {
            action: "skip",
        },
    },
    
    // ゲームパッド操作
    gamepad: {
        button: {
            A: "cancel -a",
            B: "next -a",
            X: "auto",
            Y: "backlog",
            LB: "save",
            LT: "load",
            RB: "skip",
            RT: "holdskip",
            START: "menu",
            SELECT: "",
            HOME: "title",
            LS: "",
            RS: "",
            UP: "focus_up -a",
            DOWN: "focus_down -a",
            LEFT: "focus_left -a",
            RIGHT: "focus_right -a",
        },
        stick_digital: {
            L: {
                UP: "focus_up -a",
                DOWN: "focus_down -a",
                LEFT: "focus_left -a",
                RIGHT: "focus_right -a",
            },
            R: {
                UP: "scroll_up -h",
                DOWN: "scroll_down -h",
                LEFT: "",
                RIGHT: "",
            },
        },
    },
};
