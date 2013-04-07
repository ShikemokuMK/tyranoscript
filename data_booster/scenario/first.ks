
;ティラノスクリプト　ブースターパック


;メニューボタン非表示
[hidemenubutton]


;ゲームに必要なライブラリ読み込み
[call storage="tyrano.ks"]
[call storage="novel_booster.ks"]

;メッセージレイヤの定義
[position layer=message0 width=800 height=300 top=380 left=70 ]
[position layer=message0 page=fore frame="frame.png" margint="65" marginl="50" marginr="70" marginb="60"]

[ptext name="chara_name_area" layer="message0" color="white" size=26 x=100 y=390]
[chara_config ptext="chara_name_area"]

[layopt layer="message0" visible=false]

;タイトルの設定
[title name="ティラノスクリプト　ブースターパック"]

;タイトル画面表示
[call storage="title.ks"]

;--------------------------

[s]




