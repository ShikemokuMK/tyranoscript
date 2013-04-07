
@image storage ="room.jpg" page=fore layer=base
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

ティラノ・スクリプトを試していただき、有難うございます。[l][r]
このサンプルゲームをプレイするだけで、ティラノ・スクリプトの特徴を理解することができるようになっています。[l][r]
ぜひ、最後までお付き合いください m(__)m[r]
[l][cm]

まず、大きな特徴としては
[font color="red"]
「HTML5」
[resetfont]
で動作することが挙げられます。[l][r]


[image layer=1 page=fore visible=true top=200 left=200  storage = html5.png]

つまり、ティラノ・スクリプトで作られた作品は[r]
[l][cm]
パソコン（Windows、MAC　両対応）[l][r]
アイフォン、アイパッド[l][r]
アンドロイド[l][r]
ブラウザ機能のついたゲーム機（PSVITA・NINTENDO　DS）[l][r]
などなど、幅広い環境に向けて作品を発表することが可能です[l][cm]

さらに、アプリ化することも簡単に出来ますので、創作した作品をAppStoreやアンドロイドマーケットなどで販売することも容易です。[l][cm]

[freeimage page=fore layer=1 ]


ティラノ・スクリプトのもう一つの大きな特徴として[l][r]
「KAG3/吉里吉里」と親和性の高いスクリプトであることが挙げられます。[l][r]

[image layer=1 page=fore visible=true top=200 left=250  storage = kirikiri.png]

「KAG3/吉里吉里」とはWindows向けのノベルゲームを作成できるゲームエンジンです。[l][r]
長い歴史と実績があり、これまで沢山のノベルゲームがKAG/吉里吉里で作成されてきました。[l][r]
そのため、何冊も書籍が発売されていたり、開発用のツールやウェブサイトの情報も非常に豊富です[l][cm]


[freeimage layer=1 ]


ティラノスクリプトでは、KAG3/吉里吉里と高い互換性を実現しています。[l][r]
「KAG３／吉里吉里」で作成されたウィンドウズ用のゲームを容易にスマートフォンやインターネット向けに対応させることが可能になります。[l][cm]
もちろん、逆にティラノスクリプトで作成したゲームをそのまま、KAG３/吉里吉里上で動作させることもできます。[l][r]
ティラノスクリプトで作成しておけば、あらゆる環境のプレイヤーに遊んでもらうことができるのが強みです。[l][cm]

それでは、ティラノスクリプトの機能について見ていきましょう[l][r]
ティラノスクリプトはKAG3/吉里吉里との高い互換性を持たせることを大事にしているため[l][r]
非常に強力で、柔軟な表現が可能です。[l][r]
[font size=40]文字のサイズを変更したり
[l][r]
[resetfont]
[font color="pink"]色を変更したり
[resetfont][l][r]

[ruby text=る]ル[ruby text=び]ビを[ruby text=ふ]振ることだって[ruby text=かん]簡[ruby text=たん]単にできます[l][r]

[l][cm]

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

@layopt layer=message0 visible=false
[backlay]
[image layer=0 page=back visible=true top=100 left=50  storage = normal.png]
[trans time=2000]
@wt
@layopt layer=message0 visible=true

はるこさーん[l][r]

@layopt layer=message0 visible=false
[backlay]
[image layer=0 page=back visible=true top=100 left=300  storage = haruko.png]
[trans time=2000]
@wt
@layopt layer=message0 visible=true

こんな風に。簡単です。[l][r]

さらに、シーンの変更を行なってみましょう[l][r]

@layopt layer=message0 visible=false
[backlay]
[image layer=base page=back storage=rouka.jpg]
[trans time=2000]
[wt]
@layopt layer=message0 visible=true
[l][cm]
いかがですか？[l][cm]
廊下に移動しましたね。[l][cm]

ティラノスクリプトでは、トランジションという強力なレイヤ管理機能が使用できます[l][cm]

【ゆうこ】[r]
ねー、私達もう、帰っていいかな？[l][cm]

あ、ごめんごめん。ありがとう[l][cm]

@backlay
[freeimage layer=0 page=back]
@trans time=2000
[wt]

[l][cm]
さて、もちろん音楽を鳴らすこともできるよ[l][cm]
それじゃあ、再生するよ？[l][cm]

[link target=*playmusic]【１】うん。再生してください[endlink][r]
[link target=*noplay]【２】いや。今は再生しないで！[endlink]
[s]

*playmusic

[l][cm]
よし、再生するよ。[l]
@fadeinbgm time="3000" storage=music.mp3 loop=true
徐々にフェードインしながら再生することもできるんだ[l][cm]

@jump target="*common"

*noplay
[l][cm]
うん。わかった。再生はしないね。[l][cm]
また、試してみてね[l][cm]

*common

あ、そうそう[l][cm]
今みたいな選択肢で物語を分岐することも、簡単にできるよ。[l][cm]

さて、そろそろ、全画面表示に戻しましょうかね[l][cm][l][cm]

[position layer="message0" left=10 top=10 height=450 page=fore visible=true]

ここまでお付き合いいただき、ありがとうございました。[r][l]
いかがだったでしょうか？[l][cm]

他にも[r][l]
「変数管理」[r][l]
「JavaScript実行」[r][l]
「条件分岐」[r][l]
「フラグ管理」[r][l]
「演算処理」[r][l]
「JQuery連携」[r][l]
「マクロ・サブルーチン機能」[r][l]
「グラフィカルボタン」[r][l]
などなどなどなど[l][cm]

沢山の機能があるから、是非試してみてね！[l][cm]

まだまだ、実験版だから、不具合など有ると思いますので[l][cm]
ぜひとも、ご連絡ください。[l][cm]
あと、さらにKAG3/吉里吉里との互換性を高めるために、過去にKAG3/吉里吉里で作成したプロジェクトファイルを
ご提供いただける方を募集しております。[r][l]
ファイルはKAG3/吉里吉里の互換性を高めるためだけに使用します[l][cm]
それでは、お付き合いいただきありがとうございました！[l][cm]
今後とも、ティラノ・スクリプトを何卒、よろしくお願いします。[l]

[l][cm]
最初に戻ります.[l]
[l][cm]
@jump target="*start"






[l]






[l][r]





