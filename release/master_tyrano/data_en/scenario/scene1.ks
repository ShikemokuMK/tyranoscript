;TyranoScript Sample Game

*start

[cm  ]
[clearfix]
[start_keyconfig]

[bg storage="room.jpg" time="100"]

; Display the menu button
@showmenubutton

; Message window settings
[position layer="message0" left=160 top=500 width=1000 height=200 page=fore visible=true]

; Adjust the area where text is displayed
[position layer=message0 page=fore margint="45" marginl="50" marginr="70" marginb="60"]

; Display the message window
@layopt layer=message0 visible=true

; Text area for displaying the character's name
[ptext name="chara_name_area" layer="message0" color="white" size=28 bold=true x=180 y=510]

; Declare that the above-defined area is for character name display (without this, errors occur at the # parts)
[chara_config ptext="chara_name_area"]

; Declare the characters appearing in this game
; Akane
[chara_new  name="akane" storage="chara/akane/normal.png" jname="Akane"  ]
; Register character expressions
[chara_face name="akane" face="angry" storage="chara/akane/angry.png"]
[chara_face name="akane" face="doki" storage="chara/akane/doki.png"]
[chara_face name="akane" face="happy" storage="chara/akane/happy.png"]
[chara_face name="akane" face="sad" storage="chara/akane/sad.png"]

; Yamato
[chara_new  name="yamato"  storage="chara/yamato/normal.png" jname="Yamato" ]

#
Well, they say you can easily make a game, but when I got here...[p]

There's nobody here.[p]
......[p]
Should I just go home...? [p]

[font  size="30"   ]
#?
Wait a minuteyyyy[p]
[resetfont  ]

#
Who is it!?[p]

; Character appears
[chara_show  name="akane"  ]
#?
Hello.[p]
My name is Akane.[p]
#Akane
Perhaps you're interested in developing a visual novel?[p]

[glink  color="blue"  storage="scene1.ks"  size="28"  x="360"  width="500"  y="150"  text="Yes, I'm interested"  target="*selectinterest"  ]
[glink  color="blue"  storage="scene1.ks"  size="28"  x="360"  width="500"  y="250"  text="I'm interested!"  target="*selectinterest"  ]
[glink  color="blue"  storage="scene1.ks"  size="28"  x="360"  width="500"  y="350"  text="I'm kind of interested"  target="*selectinterest"  ]
[s  ]
*selectinterest

[chara_mod  name="akane" face="happy"  ]
#Akane
Wow. I'm so happy you're interested.[p]
#
......[p]
Well, you might want to give it a try, but it must be pretty tough, right?[p]
I've never done any programming before... [p]

[chara_mod name="akane" face="default"]

#Akane
I have some exciting information for you.[p]
Wanna hear it? You do, right?[p]
#
No, not really.
#Akane
[cm]
[font size=40]
TyranoScript...[p]
[delay speed=30]
[resetfont]

#
....[p]
#Akane
Using TyranoScript, you can easily create a fully featured visual novel.[p]
#
Oh, really? That's kind of interesting.[p]

[chara_mod  name="akane" face="happy"  ]
#Akane
R-Really!? [p]
Just by playing this game, you'll experience TyranoScript's features firsthand,[p]
so please stick with it until the end.[p]

First of all, one of TyranoScript’s highlights is that it runs on [font color="red"]HTML5[resetfont][p]

#
So, what does that mean?[p]
#Akane
It means that once you create a game with TyranoScript, it can run on many different platforms![p]
#
Oh, that's great.[p]
Once you've made it, you'll want lots of people to play it.[p]

#Akane
Not only can you build PC applications for Windows,[p]
but it also supports Mac applications.[p]
And since it's HTML5, you can even release it as a browser game.[p]
You can embed it on a website so people can play it with ease.[p]
All the major browsers are supported, so rest assured.[p]
#
Impressive...[p]

But lately, my smartphone got fixed and more people are visiting my site on mobile,[p]
so, isn’t it playable on smartphones?[p]

#Akane
Games made with TyranoScript can be played on smartphones too![p]
Of course on iPhones and Androids—and even on iPads and other tablets.[p]
#
Ohhh.[p]

#Akane
You can even package and sell them as apps on the App Store or Google Play.[p]
#
Ohhh... maybe I can finally escape this life of hardship.[p]
#Akane
Well, unless you make an interesting game, it won't sell anyway![p]
#
Grr...[p]

#Akane
Alright, let’s move on to the next scene.[p]
Let's head to the hallway.[p]
[bg  time="3000"  method="crossfade" storage="rouka.jpg"  ]

#
Oh, we've moved to the hallway.[p]

#Akane
It's so cold here. Let's get back to the classroom quickly.[p]

[bg  time="1000" method="slide"  storage="room.jpg" ]
#
Huh, that scene transition was a little different.[p]
#Akane
Yeah, I was in a hurry.[p]
With TyranoScript, you can add various effects,[p]
and there are more than ten types of transitions just for switching screens.[p]
#
Hmm. Convenient.[p]

#Akane
Next, I'll change the way messages are displayed.[p]
Besides adventure-style games like this, TyranoScript can also create full-screen visual novel games.[p]

#

; Hide character
[chara_hide name="akane"]

; Switch message display to full screen
[position layer="message0" left=20 top=40 width=1200 height=660 page=fore visible=true ]

How is it? This method is useful when you want the reader to focus on the story.[l][r]
TyranoScript is extremely powerful and offers flexible expression.[l][cm]

[font size=40]You can change the font size,[l][r]
[resetfont]
[font color="pink"]change the color,[resetfont][l][r]

You can even easily add ruby annotations:[l]
[ruby text=ru]Ru[ruby text=bi]bi[ruby text=fu]fu[ruby text=kan]sim[ruby text=tan]ple[ruby text=aaa]ly[l]
[cm]

; Switch to vertical writing
[position vertical=true layer=message0 page=fore margint="45" marginl="0" marginr="70" marginb="60"]

You can also write vertically like this.[r][l]
Even with vertical writing, you can use the same functions as with horizontal writing.[r][l]

; Switch back to horizontal writing
[position vertical=false]

You can switch between horizontal and vertical layouts depending on the scene.[r][l]
Alright, let's go back to the adventure format.[p]

; Reset the message box
[position layer="message0" left=160 top=500 width=1000 height=200 page=fore visible=true]

@chara_show name="akane"

#akane
You can also use any image you like for the message box.[p]

[font color="0x454D51"]
[deffont color="0x454D51"]

; Remove the name area of the message layer
[free name="chara_name_area" layer="message0"]

; Message window settings
[position layer="message0" width="1280" height="210" top="510" left="0"]
[position layer="message0" frame="frame.png" margint="50" marginl="100" marginr="100" opacity="230" page="fore"]

; Name frame settings
[ptext name="chara_name_area" layer="message0" color="0xFAFAFA" size="28" bold="true" x="100" y="514"]
[chara_config ptext="chara_name_area"]

How is it?[p]
Feel free to create a design that suits your game.[p]

Also, by default you save and load using the buttons at the bottom right,[p]
but if you customize the window, you can... [p]

; Hide the menu button
@hidemenubutton

; Add role buttons ;;;;;;;;;;;;;;;;;;;;

; Layout role buttons

; Quick Save button
[button name="role_button" role="quicksave" graphic="button/qsave.png" enterimg="button/qsave2.png" x="40" y="690"]

; Quick Load button
[button name="role_button" role="quickload" graphic="button/qload.png" enterimg="button/qload2.png" x="140" y="690"]

; Save button
[button name="role_button" role="save" graphic="button/save.png" enterimg="button/save2.png" x="240" y="690"]

; Load button
[button name="role_button" role="load" graphic="button/load.png" enterimg="button/load2.png" x="340" y="690"]

; Auto button
[button name="role_button" role="auto" graphic="button/auto.png" enterimg="button/auto2.png" x="440" y="690"]

; Skip button
[button name="role_button" role="skip" graphic="button/skip.png" enterimg="button/skip2.png" x="540" y="690"]

; Backlog button
[button name="role_button" role="backlog" graphic="button/log.png" enterimg="button/log2.png" x="640" y="690"]

; Fullscreen toggle button
[button name="role_button" role="fullscreen" graphic="button/screen.png" enterimg="button/screen2.png" x="740" y="690"]

; Config button (calls config.ks using sleepgame)
[button name="role_button" role="sleepgame" graphic="button/sleep.png" enterimg="button/sleep2.png" storage="config.ks" x="840" y="690"]

; Menu call button (not needed if using role buttons)
[button name="role_button" role="menu" graphic="button/menu.png" enterimg="button/menu2.png" x="940" y="690"]

; Hide message window button
[button name="role_button" role="window" graphic="button/close.png" enterimg="button/close2.png" x="1040" y="690"]

; Return to title button
[button name="role_button" role="title" graphic="button/title.png" enterimg="button/title2.png" x="1140" y="690"]

;; End of role buttons

You can easily place the game functions you need on the screen like this.[p]
These are called role buttons, which let you assign special functions to buttons.[p]
The standard ones include: [l]
Save, [l]
Load, [l][cm]
Return to Title,
Show Menu,
Hide Message,
Skip,
Backlog,
Fullscreen Toggle,
Quick Save,
Quick Load,
Auto Mode!
[p]

Whew, whew.[p]

#
Are you okay?[p]
With these, making a game shouldn’t be a problem.[p]

#Akane
Now, of course, you can also play music.[l][cm]
So, shall we play some music?[l][cm]

[link target=*playmusic]【1】Yes, please play it[endlink][r]
[link target=*noplay]【2】No, don't play it now![endlink]
[s]

*playmusic

[cm]
Alright, playing music.[l]
@playbgm time="3000" storage=music.mp3 loop=true
It can even fade in gradually as it plays.[l][cm]

@jump target="*common_bgm"

*noplay
[cm]
Okay, got it. I won't play the music.[l][cm]
Maybe try it again later.[l][cm]

*common_bgm

Oh, by the way,[l][cm]
you can also branch the story with choices like these.[l][cm]

#Akane
Now, let's bring in another character.[l][cm]
Yamato-[p]
[chara_show name="yamato"]

Like this. It's simple.[l][r]
You can have as many characters appear as you want, so give it a try.[p]

#Yamato
Hey, can I go home now?[l][cm]

#Akane
Ah, sorry, sorry. Thank you.[l][cm]

[chara_hide name="yamato"]

#Akane
This concludes the explanation of TyranoScript's basic functions.[p]
What do you think?[p]

#
Yeah, I feel like I could actually make one myself.[p]

#Akane
Great![p]
I recommend starting with the tutorial on the official TyranoScript page.[p]
Of course, since this game runs on TyranoScript, it should serve as a good reference.[p]
Please try your hand at game development![p]
Thank you for playing.[p]

Finally, I'll display some links to useful information about TyranoScript.
Please take a look.[p]

[cm]

*button_link

@layopt layer=message0 visible=false
@layopt layer=fix visible=false
[anim name="akane" left=600 time=1000]

; Display link buttons
[glink text="Introduction to TyranoBuilder" size=20 width=500 x=30 y=100 color=blue target=tyranobuilder ]
[glink text="Production Examples" size=20 width=500 x=30 y=160 color=blue target=example ]
[glink text="Advanced Techniques" size=20 width=500 x=30 y=220 color=blue target=tech ]
[glink text="Useful Resources" size=20 width=500 x=30 y=280 color=blue target=info ]
[glink text="Tag Reference" size=20 width=500 x=30 y=340 color=blue target=tagref ]

[s]

*tyranobuilder

[cm]
@layopt layer=message0 visible=true
@layopt layer=fix visible=true;
[font color-"red"]
"TyranoBuilder"
[resetfont]
is a free development tool.[p]

[image layer=1 page=fore visible=true top=10 left=50 width=560 height=400  storage = builder.png]

This is a tool that lets you create visual novels using a graphical interface.[p]
Even if you're not good with scripting, you can still make games—so please give it a try.[p]
[freeimage layer=1]

@jump target=button_link

[s]
*example
@layopt layer=message0 visible=true
@layopt layer=fix visible=true
Many games have been created using TyranoScript.[p]
Some production examples are featured on the official website, so please check them out if you're interested.[p]

[iscript]
window.open("http://tyrano.jp/home/example");
[endscript]

@jump target=button_link

[cm]
[s]

*tech
@layopt layer=message0 visible=true
@layopt layer=fix visible=true
This sample only demonstrates a small portion of what TyranoScript can do.[p]
If you want to learn even more, you can download the full script,[p]
so I recommend experimenting with it![p]

[iscript]
window.open("http://tyrano.jp/home/demo");
[endscript]

@jump target=button_link


*info
@layopt layer=message0 visible=true
@layopt layer=fix visible=true
If you have any questions about TyranoScript,[p]
you can ask on the official forum or refer to the Wiki for help.[p]
@jump target=button_link

*tagref
@layopt layer=message0 visible=true
@layopt layer=fix visible=true
A detailed tag reference page is available.[p]
Learn more about how to use each tag on that page.[p]

[iscript]
window.open("http://tyrano.jp/home/tag");
[endscript]

@jump target="*button_link"

[s]
