@import url("./css/reset.css");
@import url("./css/font.css");
@import url("./css/animate.css");
@import url("./css/glink.css");

/* レイヤ
--------------------------------------*/

html {
    touch-action: none;
    user-select: none;
}

body {
    background-color: black;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
    touch-action: manipulation;
}

.tyrano_base {
    -moz-user-select: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    user-select: none;

    -webkit-text-size-adjust: none;

    /*Mac safari でtyrano_base の overfllow:hiddenが効かない対策*/
    -webkit-transform: translateZ(0);
    -webkit-mask-image: -webkit-radial-gradient(circle, white 100%, black 100%);

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
}

.layer {
    background-size: 100% 100%;
}

/* イベントレイヤ(ここをクリックしてゲームを進める) */
.layer_event_click {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    background-color: rgba(0, 0, 0, 0);
}

/* 画面パーツ
--------------------------------------*/

/* メニューを開くボタン */
.button_menu {
    position: absolute;
    z-index: 99999;
    top: 20px;
    cursor: pointer;
}

/* クリック待ちグリフ */
.img_next {
    padding-left: 3px;
}

.chara_part_container {
    /* スタックコンテキストを生成 */
    transform: translateZ(0);
}

.plus_lighter_container img {
    mix-blend-mode: plus-lighter;
}

.tyrano_chara .chara_img {
    position: absolute;
}

/* [edit]タグで出す<input>要素 */
/*
.text_box {
}
*/

/*ダイアログボックス*/
#alertify {
    z-index: 9999999;
}

/* 汎用クラス
--------------------------------------*/

/* 左右反転 */
.reflect {
    -webkit-transform: scaleX(-1);
    -moz-transform: scaleX(-1);
    -ms-transform: scaleX(-1);
    -o-transform: scaleX(-1);
    transform: scaleX(-1);
    filter: FlipH;
}

/* 透明化 */
.hidden {
    visibility: hidden !important;
    opacity: 0 !important;
}

/* 新しいスタックコンテキストを作成 */
.z-0 {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}

/* [filter] で付与, [free_filter] で除去 */
/*
.tyrano_filter_effect {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}
*/

/* 縦書き
--------------------------------------*/

.vertical_text {
    font-family: "@ＭＳ 明朝";
    writing-mode: tb-rl;
    writing-mode: vertical-rl;
    -webkit-writing-mode: vertical-rl;
    float: right;
    height: 100%;
}

/* メニュー
--------------------------------------*/

.layer_menu {
    display: none;
    font-size: 1.3em;
    font-weight: bold;
    position: absolute;
    width: 100%;
    height: 100%;
}

.menu_item {
    position: relative;
    margin-top: 2%;
    text-align: center;
}

.menu_item img {
    cursor: pointer;
}

/* スクロールボタン */
.button_smart {
    cursor: pointer;
    position: absolute;
}

/* ラベル */
.img_label {
    position: absolute;
    left: 0px;
    top: 0px;
}

/* 背景 */
.img_bg_base {
    z-index: -1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    position: absolute;
}

/* バックログ画面
--------------------------------------*/

.log_body {
    width: 1000px;
    height: 450px;
    margin: 50px 0 0 0;
    padding: 20px;
    border: 1px solid #798993;
    border-radius: 0;
    color: #798993;
    background: rgba(251, 250, 249, 0.5);
    font-weight: normal;
    text-align: left;
    line-height: 1.6em;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}

/* スクロールバー */
.log_body::-webkit-scrollbar {
    width: 12px;
}

.log_body::-webkit-scrollbar-thumb {
    border-radius: 0;
    background: #0f60ea;
}

.log_body::-webkit-scrollbar-track {
    background: none;
}

.display_menu .button:first-child {
    margin-top: 0;
}

.display_menu {
    overflow: visible;
    padding: 0;
    z-index: 10000;
    width: 100%;
    height: 100%;
    position: absolute;
    display: block;
}

/* セーブ・ロード画面
--------------------------------------*/

/* セーブデータリスト全体 */
.area_save_list {
    display: block;
    width: 1100px;
    height: 520px;
    margin: 30px 0 0 0;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}

/* スクロールバー */
.area_save_list::-webkit-scrollbar {
    width: 12px;
}

.area_save_list::-webkit-scrollbar-thumb {
    border-radius: 0;
    background: #0f60ea;
}

.area_save_list::-webkit-scrollbar-track {
    border-radius: 0;
    background: rgba(255, 255, 255, 0.5);
}

/* セーブデータリスト全体 */
.save_list {
    display: table;
    table-layout: fixed;
    width: 1010px;
    height: 120px;
    margin: 0;
    padding: 0;
    font-size: 18px;
    font-weight: normal;
    border: none;
    border-collapse: separate;
    border-spacing: 0 10px;
    box-sizing: border-box;
}

/* セーブデータ */
.save_list_item {
    display: table-row;
    width: 1000px;
    height: 120px;
    margin: 0;
    padding: 0;
    border: none;
    cursor: pointer;
}

.save_list_item:hover {
    background-color: rgba(153, 219, 255, 0.5);
}

/* セーブデータのサムネイル */
.save_list_item_thumb {
    display: table-cell;
    width: 190px;
    height: 120px;
    margin: 0;
    padding: 0;
    background-color: rgba(255, 255, 255, 0.3);
    background-image: url("images/system/saveslot.png");
    background-repeat: repeat-y;
    background-position: left top;
    box-sizing: border-box;
}

/* セーブデータのサムネイル画像 */
.save_list_item_thumb img {
    width: 160px;
    height: 90px;
    margin: 15px 3px 0 0;
    padding: 0;
    border-radius: 0;
}

/* セーブデータのテキスト */
.save_list_item_area {
    display: table-cell;
    width: 810px;
    height: 120px;
    padding: 15px 10px 0 0;
    border: none;
    border-radius: 0;
    background-color: rgba(255, 255, 255, 0.3);
    background-image: url("images/system/saveslot.png");
    background-repeat: repeat-y;
    background-position: right top;
    text-align: left;
    vertical-align: top;
    box-sizing: border-box;
}

/* セーブデータの日付 */
.save_list_item_date {
    display: block;
    margin: 0;
    padding: 0 0 0 20px;
    line-height: 1;
    color: #02abe6;
    font-weight: bold;
    box-sizing: border-box;
}

/* セーブデータのテキスト */
.save_list_item_text {
    display: block;
    height: 70px;
    margin: 0;
    padding: 5px 0 0 20px;
    line-height: 1.3;
    color: #666;
    overflow: hidden;
    box-sizing: border-box;
}

/* VChat
--------------------------------------*/

/* 全体のスタイル */
.vchat {
    margin-top: 25px;
}

/* 名前欄 */
.vchat-name {
    margin-top: 20px;
    font-family: Quicksand, 游ゴシック体, "Yu Gothic", YuGothic, "ヒラギノ角ゴシック Pro", "Hiragino Kaku Gothic Pro", メイリオ, Meiryo,
        Osaka, "ＭＳ Ｐゴシック", "MS PGothic", sans-serif;
}

/* 吹き出し */
.vchat_base {
    width: 100%;
    height: 100px;
    background-color: red;
    position: relative;
    display: none;
    overflow: scroll;
}

/* 吹き出しテキスト */
.vchat-text {
    -webkit-text-size-adjust: none;
    position: relative;
    margin-left: 10px;
    padding: 10px;
    border-radius: 10px;
    margin-right: 12%;
    box-shadow: 0px 3px 3px -3px rgba(0, 0, 0, 0.6);
    -webkit-box-shadow: 0px 3px 3px -3px rgba(0, 0, 0, 0.6);
    -moz-box-shadow: 0px 3px 3px -3px rgba(0, 0, 0, 0.6);
    font-size: "xx-large";

    word-break: keep-all;
    line-break: strict;
    word-wrap: break-word;
    overflow-wrap: break-word;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    font-family: Quicksand, 游ゴシック体, "Yu Gothic", YuGothic, "ヒラギノ角ゴシック Pro", "Hiragino Kaku Gothic Pro", メイリオ, Meiryo,
        Osaka, "ＭＳ Ｐゴシック", "MS PGothic", sans-serif;
    /*float: left;*/
}

.ribbon20-wrapper {
    display: block;
    position: relative;
    margin: 0 auto;
    padding: 20px 0;
    width: 300px;
    background: #f1f1f1;
}

.ribbon20 {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 5px;
    box-sizing: border-box;
    padding: 0 12px;
    margin: 0;
    height: 24px;
    line-height: 24px;
    font-size: 14px;
    letter-spacing: 0.1em;
    color: white;
    background: #70c7ff;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.12);
}

.ribbon20:before {
    position: absolute;
    content: "";
    top: 0;
    left: -7px;
    border: none;
    height: 24px;
    width: 7px;
    background: inherit;
    border-radius: 5px 0 0 5px;
}

/* 回り込み解除 */
.vchat:after,
.vchat:before {
    clear: both;
    content: "";
    display: block;
}

/* カギカッコフロート
--------------------------------------*/

.message_inner > p > span {
    position: relative;
}

/* text-stroke による縁取り
--------------------------------------*/

/* ★縁取りテキスト1文字を構成する要素ツリー
/* span.char.text-stroke
/*   span.dummy あ  … ダミー。透明。absolute。レンダリング領域を広げる役割。
/*   span.stroke あ … 縁取り。absolute。複数個でありうる。
/*   span.text あ   … テキスト本体。absolute。
/*   span.dummy あ  … ダミー。透明。relative。縁取りとテキスト本体が absolute なせいで widht, height を構成しないので
/*                    かわりにこれで width, height を構成する。*/
p .char.text-stroke {
    opacity: 1;
    display: inline-block;
    position: relative;
    z-index: auto;
    /* z-index に auto でも 0 でもない値がセットされている場合は
    /* 新しいスタックコンテキストが作成されるため、重なり順の違いが出る仕様がある
    /* ここに z-index: 10; を指定すると縁取り部分がひとつ前の文字にかぶさるようになる
    /* http://honttoni.blog74.fc2.com/blog-entry-340.html */
    /*
    z-index: 10;
    /**/
}

p .char.text-stroke.visible .entity {
    opacity: 1;
}

p .char.text-stroke span {
    margin: 0;
    padding: 0;
    position: absolute;
    display: inline-block;
    opacity: 0;
}

p .char.text-stroke .stroke {
    z-index: 100;
    transform: translateZ(0);
}

p .char.text-stroke .fill {
    z-index: 1000;
    transform: translateZ(0);
    height: 100%;
}

/* text-shadow による個別縁取り
--------------------------------------*/

/* ★縁取りテキスト1文字を構成する要素ツリー
/* span.char.text-shadow
/*   span.stroke あ … 縁取り。absolute。複数個でありうる。
/*   span.text あ   … テキスト本体。absolute。
/*   span.dummy あ  … ダミー。透明。relative。縁取りとテキスト本体が absolute なせいで widht, height を構成しないので
/*                    かわりにこれで width, height を構成する。*/
p .char.text-shadow {
    opacity: 1;
    display: inline-block;
    position: relative;
    z-index: auto;
}

p .char.text-shadow.visible .entity {
    opacity: 1;
}

p .char.text-shadow span {
    margin: 0;
    padding: 0;
    position: absolute;
    display: inline-block;
    opacity: 0;
}

p .char.text-shadow .stroke {
    z-index: auto;
    transform: translateZ(0);
}

p .char.text-shadow .fill {
    z-index: 1000;
    transform: translateZ(0);
    height: 100%;
}

/* クリック待ちグリフのカスタマイズ
--------------------------------------*/

div.img_next {
    padding: 0;
    margin-left: 3px;
    display: inline-block;
    vertical-align: baseline;
}

/*------ 図形 ------*/

/* 三角 */
.img_next_v_triangle {
    width: 20px;
    height: 20px;
    display: inline-block;
    background: white;
    clip-path: polygon(0 20%, 100% 20%, 50% 100%);
}
.img_next_triangle {
    width: 20px;
    height: 20px;
    display: inline-block;
    background: white;
    clip-path: polygon(50% 20%, 100% 100%, 0% 100%);
}

/* 丸 */
.img_next_circle {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    display: inline-block;
    background: white;
    background: rgb(206, 231, 245);
}

/* 四角 */
.img_next_rectangle {
    width: 20px;
    height: 20px;
    display: inline-block;
    background: white;
}

/* ひし型 */
.img_next_diamond {
    width: 20px;
    height: 20px;
    display: inline-block;
    background: white;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

/* 星 */
.img_next_star {
    width: 20px;
    height: 20px;
    display: inline-block;
    background: white;
    clip-path: polygon(50% 5%, 61% 40%, 98% 40%, 68% 62%, 79% 96%, 50% 75%, 21% 96%, 32% 62%, 2% 40%, 39% 40%);
}

/*------ アニメーション設定 ------*/

/* 瞬間的な点滅 */
.img_next_flash_momentary {
    animation-name: img_next_flash_momentary;
    animation-delay: 1000ms;
    animation-duration: 1800ms;
    animation-iteration-count: infinite;
    animation-timing-function: steps(1);
    opacity: 0;
}

@keyframes img_next_flash_momentary {
    from {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
}

/* 滑らかな点滅 */
.img_next_flash {
    animation-name: img_next_flash;
    animation-duration: 1800ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    opacity: 0;
}

@keyframes img_next_flash {
    from {
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}

/* 回転 */
.img_next_rotate_bounce {
    animation-name: img_next_rotate_bounce;
    animation-duration: 3200ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}

@keyframes img_next_rotate_bounce {
    from {
        transform: translateY(0px) rotateZ(0deg) scale(1);
    }
    12.5% {
        transform: translateY(-4px) rotateZ(45deg) scale(0.8);
    }
    25% {
        transform: translateY(0px) rotateZ(90deg) scale(1);
    }
    37.5% {
        transform: translateY(-4px) rotateZ(135deg) scale(0.8);
    }
    50% {
        transform: translateY(0px) rotateZ(180deg) scale(1);
    }
    62.5% {
        transform: translateY(-4px) rotateZ(225deg) scale(0.8);
    }
    75% {
        transform: translateY(0px) rotateZ(270deg) scale(1);
    }
    87.5% {
        transform: translateY(-4px) rotateZ(315deg) scale(0.8);
    }
    to {
        transform: translateY(0px) rotateZ(360deg) scale(1);
    }
}

/* Y軸を中心にスピン */
.img_next_spin_y {
    animation-name: img_next_spin_y;
    animation-duration: 3200ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}

@keyframes img_next_spin_y {
    from {
        transform: rotateY(0deg);
    }
    50% {
        transform: rotateY(180deg);
    }
    to {
        transform: rotateY(360deg);
    }
}

/* Y軸を中心にスピン */
.img_next_spin_x {
    animation-name: img_next_spin_x;
    animation-duration: 3200ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}

@keyframes img_next_spin_x {
    from {
        transform: rotateX(0deg);
    }
    50% {
        transform: rotateX(180deg);
    }
    to {
        transform: rotateX(360deg);
    }
}

/* Z軸を中心にスピン */
.img_next_spin_z {
    animation-name: img_next_spin_z;
    animation-duration: 3200ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}

@keyframes img_next_spin_z {
    from {
        transform: rotateZ(0deg);
    }
    50% {
        transform: rotateZ(180deg);
    }
    to {
        transform: rotateZ(360deg);
    }
}

/* シンプルなバウンド */
.img_next_bounce {
    animation-name: img_next_bounce;
    animation-duration: 500ms;
    animation-iteration-count: infinite;
    animation-timing-function: cubic-bezier(0, 0, 0.4, 1);
    animation-direction: alternate;
}

@keyframes img_next_bounce {
    from {
        transform: translateY(0px);
    }
    100% {
        transform: translateY(-12px);
    }
}

/* たわむバウンド */
.img_next_soft_bounce {
    animation-name: img_next_soft_bounce;
    animation-duration: 500ms;
    animation-iteration-count: infinite;
    animation-timing-function: cubic-bezier(0, 0, 0.4, 1);
    animation-direction: alternate;
}

@keyframes img_next_soft_bounce {
    from {
        transform: translateY(0px) scaleY(0.8) scaleX(1.2);
    }
    25% {
        transform: translateY(-2px) scaleY(1) scaleX(1);
    }
    100% {
        transform: translateY(-12px);
    }
}

/* 拡縮 */
.img_next_zoom {
    animation-name: img_next_zoom;
    animation-duration: 500ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    animation-direction: alternate;
}

@keyframes img_next_zoom {
    from {
        transform: scale(1);
    }
    100% {
        transform: scale(1.2);
    }
}

/* クリックエフェクト
--------------------------------------*/

.tyrano_click_effect {
    display: none;
    position: absolute;
    left: 0;
    top: 0;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: white;
    animation-name: tyrano_click_effect;
    animation-duration: 300ms;
    animation-iteration-count: 1;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    transform-origin: center center;
    transform: translate(-50%, -50%) scale(1);
    pointer-events: none;
    mix-blend-mode: overlay;
}

@keyframes tyrano_click_effect {
    from {
        transform: translate(-50%, -50%) scale(1);
    }
    100% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 0;
    }
}

/* フォーカス
--------------------------------------*/

/* デフォルトのフォーカススタイルはオフにしておく
 * (ただのマウスダウンでフォーカスが一瞬当たったケースでアウトラインが出ないように) */
[data-event-tag="button"]:focus,
[data-event-tag="link"]:focus,
[data-event-tag="glink"]:focus {
    outline: none;
}

/* キーボードによってフォーカスが当たったとき */
:focus.focus {
    outline-offset: 0px;
    outline-style: none;
    outline-width: 0px;
    outline-color: transparent;
}

/* 仮想マウスカーソル
--------------------------------------*/

/* 仮想マウスカーソル */
#vmouse {
    margin-left: 0px;
    margin-top: 0px;
    transform-origin: left top;
    position: fixed;
    display: block;
    left: 0;
    top: 0;
    z-index: 9999999999;
    pointer-events: none;
    background-repeat: no-repeat;
    background-position: left top;
    transition: transform 50ms linear, opacity 100ms linear;
    opacity: 0;
    user-select: none;
}

/* 仮想マウスカーソルが表示されているとき
 * 本当のマウスカーソルは非表示にする */
html.vmouse-displayed,
html.vmouse-displayed * {
    cursor: none !important;
}

/* remodal のカスタマイズ
--------------------------------------*/

/* ボタン */
#remodal-confirm,
#remodal-cancel {
    cursor: pointer;
    -moz-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
    margin: 0 2px;
}

/* ボタン(画像) */
img#remodal-confirm,
img#remodal-cancel {
    display: inline-block;
}

/* メッセージボックス */
/*
[data-remodal-id="modal"] {
}
*/

/* 背景となるアウター要素 */
.remodal-wrapper .remodal-base,
.remodal-wrapper .remodal-base .remodal-image,
.remodal-wrapper .remodal-boxbase {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background-image: none;
    background-color: transparent;
    background-repeat: no-repeat;
    background-size: auto;
    background-position: center;
    opacity: 1;
    pointer-events: none;
}

/* メッセージボックスのテキスト */
.remodal-wrapper .remodal_title,
.remodal-wrapper .remodal_txt {
    pointer-events: auto;
    user-select: auto;
    cursor: auto;
}

/*-- キーフレアニメ --*/
.remodal-is-opening .remodal-base,
.remodal-is-closing .remodal-base {
    -webkit-animation-duration: 0.3s;
    animation-duration: 0.3s;
    -webkit-animation-fill-mode: forwards;
    animation-fill-mode: forwards;
}

.remodal-is-opening .remodal-base {
    -webkit-animation-name: remodal-overlay-opening-keyframes;
    animation-name: remodal-overlay-opening-keyframes;
}

.remodal-is-closing .remodal-base {
    -webkit-animation-name: remodal-overlay-closing-keyframes;
    animation-name: remodal-overlay-closing-keyframes;
}

/* スキップ開始時・終了時などに画面中央に出すエフェクト
--------------------------------------*/

.mode_effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    display: block;
    pointer-events: none;
    justify-content: center;
    align-items: center;
    display: flex;
    transform-origin: center center;
    animation: mode_effect 800ms linear forwards;
    z-index: 9999999999;
}

.mode_effect_default {
    background: rgba(0, 0, 0, 1);
    border-radius: 50%;
    font-size: 10px;
    width: 15em;
    height: 15em;
}

.mode_effect_default.stop > div:first-child,
.mode_effect_default.stop > div:last-child,
.mode_effect_default.auto > div:last-child,
.mode_effect_default.skip > div:first-child,
.mode_effect_default.skip > div:last-child {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    display: block;
    pointer-events: none;
    background: transparent;
    width: 7em;
    height: 7em;
    box-sizing: border-box;
    border-bottom: 3.5em solid transparent;
    border-left: 3.5em solid white;
    border-right: 3.5em solid transparent;
    border-top: 3.5em solid transparent;
}

.mode_effect_default.skip > div:first-child,
.mode_effect_default.skip > div:last-child {
    transform: translateX(0.6em);
}

.mode_effect_default.skip > div:last-child {
    left: 7em;
}

.mode_effect_default.auto > div:first-child {
    display: none;
}
.mode_effect_default.auto > div:last-child {
    border-bottom: 3.5em solid transparent;
    border-left: 5.7em solid white;
    border-right: 5.7em solid transparent;
    border-top: 3.5em solid transparent;
    left: 5.4em;
}

.mode_effect_default.stop > div:first-child,
.mode_effect_default.stop > div:last-child {
    position: relative;
    left: 0;
    border: none;
    width: 40%;
    height: 40%;
    border-right: 1.8em solid white;
}

.mode_effect_default.stop > div:last-child {
    border-right: none;
    border-left: 1.8em solid white;
}

@keyframes mode_effect {
    from {
        transform: scale(1);
        opacity: 0.4;
    }
    to {
        transform: scale(1.2);
        opacity: 0;
    }
}

/* ローディングの通知を画面端に出す
--------------------------------------*/

.tyrano-loading {
    position: absolute;
    left: 0;
    top: 0;
    display: inline-flex;
    box-sizing: border-box;
    font-size: 25px;
    align-items: center;
    margin: 0.7em;
    pointer-events: none;
    font-weight: bold;
    z-index: 9999999999;
    filter: drop-shadow(0 0 0.2em black);
}

.tyrano-loading .icon {
    box-sizing: border-box;
    width: 1.5em;
    height: 1.5em;
    border-radius: 100%;
    border: 0.2em solid rgba(255, 255, 255, 0.2);
    border-top-color: #fff;
    animation: tyrano-loading-spin 1s infinite linear;
}

.tyrano-loading .message {
    margin-left: 0.7em;
    color: white;
    line-height: 100%;
}

.tyrano-loading .message::after {
    content: " ";
    animation: dot-animation 2s steps(4) infinite;
    animation-duration: inherit;
    position: absolute;
}

@keyframes dot-animation {
    0% {
        content: "";
    }
    25% {
        content: ".";
    }
    50% {
        content: "..";
    }
    75% {
        content: "...";
    }
}

@keyframes tyrano-loading-spin {
    100% {
        transform: rotate(360deg);
    }
}


#three-cursor{
    
    position: fixed;

    /*丸の大きさと色の指定*/
    background: #fff;
    border-radius:10px;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;/*真ん中にくるようにマイナスマージンで調整*/

    z-index: 2;/*一番手前に来るように*/
    pointer-events: none;/*クリックできなくなるのを防ぐため。noneで対応*/
    opacity: 1;
}
