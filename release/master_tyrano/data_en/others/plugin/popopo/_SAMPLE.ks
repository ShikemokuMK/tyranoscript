; 画面設定など
[call target=set]

クリックで開始（音が出ます）[p]

; プラグイン「popopo」読み込み
[plugin name=popopo]


[delay speed=150]
; 音量は50、タイプはノイズ、サンプルレートは5000
[popopo volume=50 type=noise samplerate=5000]
#
_　　　　　　２月２０日　午前９時３０分　　[r]
_　　　　東京ティラノスクリプト専門学校一室[p]


[resetfont]
[delay speed=60]
[playbgm storage=music.ogg volume=50]

; タイプは三角波、音程はA(ラ)
[popopo type=triangle frequency=A octave=0]
#鈴木
さて、ゲームが簡単に作れるというから、来てみたものの[p]
誰もいねぇじゃねぇか。[p]
……[p]
帰るか。。。[p]


; タイプは正弦波、音程はE(ミ)
[popopo type=sine frequency=E octave=0]
#？？？
ちょっとまったーーーーー[p]


; タイプはのこぎり波、音程はA(ラ)、オクターブ1つ下
[popopo type=sawtooth frequency=A octave=-1]
#
誰だ！？[p]


[chara_show name=akane width=440]
[popopo type=sine frequency=E octave=0]
#？？？
こんにちは。[p]
私の名前はあかね。[p]


; タイプはファイル、popopo.oggを再生せよ
[popopo type=file storage=popopo.ogg]
#あかね
もしかして、ノベルゲームの開発に興味があるの？[p]
(サンプルシナリオここまで)
[s]





*set
[bg storage=room.jpg time=0]
[iscript]
TYRANO.kag.config.defaultLineSpacing = "40";
[endscript]
[chara_new  name=akane storage=chara/akane/normal.png jname=あかね]
[deffont size=50 color=0xdddddd]
[resetfont]
[ptext name=chara_name_area layer=message0 color=white size=50 x=50 y=480 bold=bold]
[chara_config ptext=chara_name_area]
[position left=0 top=460 width=1280 height=260 visible=true opacity=200]
[position margint=80 marginl=40 marginr=40 marginb=50]
[font color=0x33AA33]
[wait time=300]
[return]
