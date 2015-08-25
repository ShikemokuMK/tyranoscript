
@bg storage ="room.jpg"
@wait time = 200

*start 
[title name="ティラノスクリプト解説"]

クリックしてスタート[l]
[cm]

@layopt layer=message0 visible=false
[backlay]

[image storage=logo3.png  layer=1 page=back visible=true top=200 left=180 ]
[trans time=3000]
[wt]
[wait time=1000]
[backlay]
[freeimage layer=1 page=back]
[trans time=3000]
[wt]

@layopt layer=message0 visible=true
@layopt layer=message1 visible=false

ティラノスクリプトを試していただき、有難うございます。[l][r]
このサンプルゲームをプレイするだけで、ティラノスクリプトの特徴を理解することができるようになっています。[l][r]
ぜひ、最後までお付き合いください m(__)m[r]
[l][cm]

まず、大きな特徴としては
[font color="red"]
「HTML5」
[resetfont]
で動作することが挙げられます。[l][r]

[image layer=1 page=fore visible=true top=200 left=200  storage = html5.png]

つまり、ティラノスクリプトで作られた作品は[r]
[l][cm]
パソコン（Windows、MAC　両対応）[l][r]
ブラウザゲーム[l][r]
アイフォン、アイパッド[l][r]
アンドロイド[l][r]
ブラウザ機能のついたゲーム機（PSVITA・NINTENDO　DS）[l][r]
などなど、幅広い環境に向けて作品を発表することが可能です[l][cm]

さらに、アプリ化することも簡単に出来ますので、作品をAppStoreやGooglePlayなどで販売することも容易です。[l][r]
実際に
[font color="red"]
１０００
[resetfont]
作品以上がティラノスクリプトで作成され、公開されています[l][cm]

[freeimage page=fore layer=1 ]


ティラノスクリプトのもう一つの大きな特徴として[l][r]
「KAG3/吉里吉里」と親和性の高いスクリプトであることが挙げられます。[l][r]

[image layer=1 page=fore visible=true top=200 left=250  storage = kirikiri.png]

「KAG3/吉里吉里」とはWindows向けのノベルゲームを作成できるゲームエンジンです。[l][r]
長い歴史と実績があり、これまで沢山のノベルゲームがKAG/吉里吉里で作成されてきました。[l][r]
そのため、何冊も書籍が発売されていたり、開発用のツールやウェブサイトの情報も非常に豊富です[l][cm]

[freeimage layer=1 ]

ティラノスクリプトで作成しておけば、あらゆる環境のプレイヤーに遊んでもらうことができるのが強みです。[l][cm]

それでは、ティラノスクリプトの機能について見ていきましょう[l][r]
ティラノスクリプトでは「KAG/吉里吉里」に大幅に機能の強化と拡張を行っており[l][r]
非常に強力で、柔軟な表現が可能です。[l][cm]

[font size=40]文字のサイズを変更したり
[l][r]
[resetfont]
[font color="pink"]色を変更したり
[resetfont][l][r]

[ruby text=る]ル[ruby text=び]ビを[ruby text=ふ]振ることだって[ruby text=かん]簡[ruby text=たん]単にできます[l]
[cm]

[position vertical=true]

このように縦書きで記述することもできます。[r][l]
縦書きでも、横書きの時と同じ機能を使うことができます。[r][l]

[position vertical=false]

横書きと縦書きをシーンによって使い分けることもできます[r][l]

[position height=160 top=300]
[l][cm]
このようにアドベンチャー形式のようなゲームも大丈夫！[l][r]
キャラクターに登場してもらいましょうか[l][cm]
ゆうこさーん[l][r]
[chara_new name="yuko" storage="normal.png" jname="ゆうこ"]
[chara_show name="yuko"]

はるこさーん[l][r]
[chara_new name="haruko" storage="haruko.png" jname="はるこ"]
[chara_show name="haruko"]

こんな風に。簡単です。[l][r]

さらに、シーンの変更を行なってみましょう[l][r]

[bg storage=rouka.jpg]

いかがですか？[l][cm]
廊下に移動しましたね。[l][cm]
ティラノスクリプトでは、１行の簡単な命令だけで、背景を変更することができます[l][r]
さらに、「KAG/吉里吉里」のトランジションという強力なレイヤ管理機能も使用できます[l][r]
シンプルな命令と協力な機能を使い分けて使用することが可能です[l]
[cm]

【ゆうこ】[r]
ねー、私達もう、帰っていいかな？[l][cm]

あ、ごめんごめん。ありがとう[l][cm]

[chara_hide name="yuko"]
[chara_hide name="haruko"]

さて、もちろん音楽を鳴らすこともできるよ[l][cm]
それじゃあ、再生するよ？[l][cm]

[link target=*playmusic]【１】うん。再生してください[endlink][r]
[link target=*noplay]【２】いや。今は再生しないで！[endlink]
[s]

*playmusic

[cm]
よし、再生するよ。[l]
@fadeinbgm time="3000" storage=music.ogg loop=true
徐々にフェードインしながら再生することもできるんだ[l][cm]

@jump target="*common"

*noplay
うん。わかった。再生はしないね。[l][cm]
また、試してみてね[l][cm]

*common

あ、そうそう[l][cm]
今みたいな選択肢で物語を分岐することも、簡単にできるよ。[l][cm]

さて、そろそろ、全画面表示に戻しましょうかね[l][cm]

[position layer="message0" left=10 top=10 height=450 page=fore visible=true]

そして、ティラノスクリプトにはゲーム制作をお手伝いする強力なサポートがたくさんございます。[l][r]
ゲーム制作で行き詰まったら、ティラノスクリプトの掲示板を訪れてみてください。[l][r]
2000近い書き込みがあり、現在も活発に交流が行われています[l][cm]

そして、
[font color-"red"]
「ティラノビルダー」
[resetfont]
という便利な開発ツールもあります。[l][r]

[image layer=1 page=fore visible=true top=10 left=50 width=560 height=400  storage = builder.png]

これは、グラフィカルな画面でノベルゲームを作れるツールです[l][r]
スクリプトが苦手な人でもゲーム制作を行うことができます[l][cm]
[freeimage layer=1]

さらに、便利なプラグインやサポートツールも用意されています[l][cm]

ここまでお付き合いいただき、ありがとうございました。[r][l]
いかがだったでしょうか？[l][cm]

他にも[r][l]
「フラグ管理」[r][l]
「JavaScript実行」[r][l]
「条件分岐」[r][l]
「演算処理」[r][l]
「JQuery連携」[r][l]
「マクロ・サブルーチン機能」[r][l]
「グラフィカルボタン」[r][l]
「クリッカブルマップ」[r][l]

などなど[l][cm]
沢山の機能があるから、是非試してみてください！
[l][cm]
最初に戻ります
[l][cm]
@jump target="*start"

[s]


