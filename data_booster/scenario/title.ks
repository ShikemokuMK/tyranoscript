
;==============================
; タイトル画面
;==============================

;タイトルのボタンを隠す
[macro name="hide_title_button"]
    
    [anim name="button_title_start" left=1000 time=600 ]
    [wait time=60]
    
    [anim name="button_title_load" left=1000 time=600 ]
    [wait time=60]
    
    [anim name="button_title_cg" left=1000 time=600 ]
    [wait time=60]
    
    [anim name="button_title_replay" left=1000 time=600  ]
    [wait time=60]
    
    [wa]

[endmacro]

;タイトルボタンを表示する
[macro name="show_title_button"]
    
    [anim name="button_title_start" left=600 time=600 ]
    [wait time=60]
    
    [anim name="button_title_load" left=600 time=600 target="*load"]
    [wait time=60]
    
    [anim name="button_title_cg" left=600 time=600 target="*cg"]
    [wait time=60]
    
    [anim name="button_title_replay" left=600 time=600 target="*replay" ]
    [wait time=60]
    
    [wa]

[endmacro]


;標準のメッセージレイヤを非表示
@layopt layer="message0" visible = false

;タイトル画像の先読み
[preload storage="data/bgimage/title.jpg?2321"]


;タイトル表示
[back storage ="title.jpg"]

[iscript]
    tf.flag_replay = false;
[endscript]


*title

;タイトル各種ボタン
[locate x=1000 y=270]
[button name="button_title_start" graphic="button_title_start.gif" target="*start"]

[locate x=1000 y=350]
[button name="button_title_load" graphic="button_title_load.gif" target="*load"]

[locate x=1000 y=430]
[button name="button_title_cg" graphic="button_title_cg.gif" target="*cg"]

[locate x=1000 y=510]
[button name="button_title_replay" graphic="button_title_replay.gif" target="*replay" ]

[show_title_button]

[s]

;-------ボタンが押されたときの処理

*start

[showmenubutton]
[hide_title_button]
;------シナリオの最初にジャンプする
@jump storage="scene1.ks"

[s]

;--------ロードが押された時の処理
*load

[showmenubutton]
[hide_title_button]

[cm]
[showload]
[jump target=*title]
[cm]

[s]

;----------CGモードが選択された時
*cg
[hide_title_button]
[jump storage="cg.ks"]
[s]

;----------回想モードが選択された時
*replay
[hide_title_button]
[jump storage="replay.ks"]
[s]
