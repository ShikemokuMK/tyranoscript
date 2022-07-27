/*
Ver4.50以降で有効
ティラノスクリプトのキーコンフィグの設定を行うファイルです。
特定のキーボード・マウス・ジェスチャー操作に対して
ティラノスクリプトのアクション（スキップを開始するなど）を割り当てることができます。

<設定できるアクション>

    save        : セーブ画面を開く
    load        : ロード画面を開く
    next        : 次のテキストに進む
    menu        : メニュー画面を開く
    title       : タイトルに戻る
    skip        : スキップを開始する
    backlog     : バックログを開く
    fullscreen  : フルスクリーンを切り替える
    qsave       : クイックセーブを実行する
    qload       : クイックロードを実行する
    auto        : オートモードを開始する
    hidemessage : メッセージウィンドウを非表示にする
    focus_up    : ボタンのフォーカスを上に移動する
    focus_down  : ボタンのフォーカスを下に移動する
    focus_left  : ボタンのフォーカスを左に移動する
    focus_right : ボタンのフォーカスを右に移動する
    
    上記キーワードの代わりにJavaScriptの関数を指定することもできます。
    たとえば「コンフィグ画面の呼び出し」機能を割り当てるためには、次のような関数を指定します。
    (シナリオファイル名は適宜変更してください)
    
    function () {
        TYRANO.kag.sleepgame({ storage: "config.ks" });
    }
    
<キーボード操作の指定方法> 
    
    "キーコード"と"そのキーが押されたときのアクション"を配置します。
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
    
*/

var __tyrano_key_config = {
    // ブラウザ固有の動作（キーの組み合わせによるショートカットアクション）を許可するか否か
    // "true" だとブラウザ固有の動作が有効に、"false" だと無効になります。
    // たとえば Google Chrome には次のようなショートカットアクションが存在しますが、
    // "system_key_event" が "false" だとこのアクションが無効化されます。
    //   Ctrl + Shift + I : デベロッパーツールを開く
    //   Ctrl + Shift + O : ブックマークマネージャを開く
    "system_key_event" : "false",
    
    // キーボード操作
    "key": {
        "32": "hidemessage", // Space
        "13": "next",        // Enter
        "91": "skip",        // Command (Mac)
        "17": "skip",        // Ctrl (Windows)
        "37": "focus_left",  // ←
        "38": "focus_up",    // ↑
        "39": "focus_right", // →
        "40": "focus_down",  // ↓
        "67": function () {  // C
            // コンフィグを呼び出す例（シナリオファイル名は適宜変更してください）
            // （コメントアウトしてあります）
            // TYRANO.kag.sleepgame({ storage: "config.ks" });
        },
    },

    // マウス操作
    "mouse": {
        "right": "hidemessage", // 右クリック
        "center": "menu",       // ホイールクリック
        "wheel_up": "backlog",  // ホイールアップ
        "wheel_down": "next",   // ホイールダウン
    },

    // ジェスチャー操作
    "gesture": {
        // 上スワイプ
        "swipe_up_1": {
            "action": "backlog",
        },
        // 左スワイプ
        "swipe_left_1": {
            "action": "auto",
        },
        // 右スワイプ
        "swipe_right_1": {
            "action": "menu",
        },
        // 下スワイプ
        "swipe_down_1": {
            "action": "load",
        },
        // ホールド
        "hold": {
            "action": "skip",
        },
    },
};
