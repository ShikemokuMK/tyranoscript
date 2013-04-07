
*start

;=============================================
;シナリオその１　ゲームの本編を記述して行きましょう
;=============================================

[cm]

;背景素材のプリロード
[preload storage="data/bgimage/room.jpg"]
[preload storage="data/bgimage/rouka.jpg"]
[preload storage="data/bgimage/entrance.jpg"]
[preload storage="data/bgimage/toile.jpg"]

;背景変更
[back storage="room.jpg" time=5000]

;メッセージエリアの表示
@layopt layer="message0" visible=true

;登場キャラクターの定義
[chara_new name="yuko" storage="yuko/normal.png" jname="ゆうこ"]
[chara_new name="haruko" storage="haruko.png" jname="はるこ"]


#俺
さて、、簡単にゲーム開発が始められると聞いたけど[p]
何から始めれば良いんだろう。。。[p]

#？
おーーー。私に任せて！[p]

#俺
だれだ！？[p]

;キャラクター登場
[chara_show name="yuko"]

#音楽の再生
[fadeinbgm storage="music.mp3" time=2000]

#？
こんにちは。私の名前はゆうこ。[p]

#yuko
このブースターパックを使えば、誰でも簡単にゲーム開発が始められるよ！[p]

#俺
え、そうなの。[p]

#yuko
うん。しかも、ノベルゲームに必要な機能は最初からテンプレート（土台）が用意されてて[p]
修正していくだけでゲームが完成するよ！[p]

#俺
へー。[l]それは良いな。楽そう。[p]

#yuko
うん。もちろん、カスタマイズすればかなり凝ったことも出来るようになるから。[p]
ぜひ、ゲーム制作にチャレンジしてみてね。[p]

#俺
よし、やってみようかな。[p]

#yuko
じゃあ、ここからはノベルゲームに必要な動作をひと通り、試してみるね。[p]

実際にティラノスクリプトのシナリオファイルも見ることができるから[p]
ゲームの動作とスクリプトをあわせて確認すると、やりたいことがすぐできるようになるよね[p]

#俺
うん。じゃあよろしく[p]

#yuko
じゃあまず、一番基本の場面切り替えから[p]
廊下に移動するね[p]

[back storage="rouka.jpg"]

#俺
おお！移動したね。[p]

#yuko
場面切り替えのにかかる時間とか、エフェクトも沢山あるよ。[p]
じゃあ、次は入り口まで移動してみようか[p]

[back storage=entrance.jpg method="slide" time=1000 ]


#俺
なんか、かっこいい。[p]

#yuko
今のは[font color=red]スライド[resetfont]というエフェクトと、切り替え時間を１秒に設定してみたよ。

#俺
ちょっと、寒いね。やっぱり教室に戻ろうよ[p]

#yuko
うん。わかった。次もちょっと派手な演出で移動してみよう！[p]

[back storage=room.jpg method="drop"]

#yuko
じゃあ、次は。[p]

新しいキャラクターを画面に登場させてみるね[p]

[chara_mod name="yuko" storage="yuko/normal2.png"]
おーい。はるこちゃーん[p]

[chara_show name="haruko" jname="はるこ"]

#haruko
はーい。どうしたの？[p]

#yuko
あ、ごめんごめん。[l]
こんなかんじで簡単にキャラクターを登場させることができるよ[p]
立ち位置などは自動で調整してくれるんだ[p]
もちろん、好きな位置に表示することもできるモードもあるから安心してね[p]

#俺
なるほど、簡単だね。[p]

#haruko
ねー、私もう、行っていいかな？[p]

#yuko
あ、ごめん。[l]ありがとう。

#haruko
じゃあねー。
[chara_hide name="haruko"]

#yuko
さて、次は選択肢を表示して、物語を分岐してみようか[p]

ねぇねぇ、ちょっと、廊下にでてみない？[p]

#選択肢

[nowait]
[font color=PaleGreen]

[link target="yes"]【１】え、別に良いけど[endlink][r]
[link target="no"]【２】寒いからやだ[endlink][r]

[resetfont]
[endnowait]

[s]

#

*yes
[cm]
#yuko
よし、じゃあ、移動だ！
[back storage="rouka.jpg" method ="clip"]

廊下に出たよ。[p]
じゃあ、教室に戻るね[p]

[back storage="room.jpg" method="slide"]

@jump target="common"

*no
[cm]
#yuko
ちぇー、残念[p]


*common
ここから共通ルートだよ[p]

#俺
よし、分岐は完璧だね。[p]

#yuko
じゃあ、次は、効果音や音声、音楽について試してみるね[p]

ねぇ、電話番号教えてくれない [p]

#俺
別にいいけど[p]

#yuko
えへへ[p]

[playse storage="phone.mp3" loop="true"]

#
プルルル　プルルル　[p]

#俺
ん？誰だろう。[p]

[nowait]
[font color=PaleGreen]

[link target="*phonetake"]電話にでる[endlink][r]

[resetfont]
[endnowait]

[s]

*phonetake

#
;[stopse]
[cm]
[playse storage="phone_take.mp3"]
ピッ[p]

#俺
はい。もしもし[p]

#電話の声
息子さんが交通事故にあって、振り込まないと、、、[p]

#俺
詐欺だ！[p]

#yuko
ちぇー、、[p]

#俺
まったく。[p]

#yuko
まぁ、これで効果音の鳴らし方は完璧だね。[p]

#俺
そうだね。

#yuko
ここまでで、基本的なゲームはつくれるようになったと思うけど[p]
仕上げに、CGモード、回想モードの作り方も紹介しておくね[p]

CGモードはゲームの中で、一度見た画像を後から見れるようになるシステムだね。[p]
タイトル画面のCGモードボタンを押すことで移動できるよ。[p]
もちろん、そんなの必要ないって場合は、ボタンを消してしまえば大丈夫だよ[p]
このブースターぱっくでは、簡単にCGモードや回想モードを登録できるようになってるよ[p]

それじゃあ、ここで、新しい画像を見てみるよ。[p]
その時に、「この画像をみました」っていうフラグを立てるんだ。[p]
そうすれば、CGモードで見れるようになってるよ。[p]

じゃあ、CGを表示するね。[p]

[back storage="toile.jpg"]

;☆ここで、フラグを立てている☆

[cg storage="toile.jpg" ]
[cg storage="entrance.jpg" ]

ここで、フラグを立てました[p]

[back storage="room.jpg"]

これで、CGモードに行った時、さっきの画像をみれるようになってるよ[p]

次に、回想モードの作り方を見てみるね[p]
回想モードはシナリオの一部を切り取って、後から再生することができる機能だよ[p]

じゃあ、試しにここから、回想モードを登録してみるね。[p]

@call storage=event.ks

はい！記録完了、回想モードでさっきまでの会話をもう一度再生することができるようになってるよ[p]


以上で、簡単な解説は終わりだよ。[p]

自分の好きなようにカスタマイズして、ノベルゲームを創りだしてみてね。[p]

END

[s]


