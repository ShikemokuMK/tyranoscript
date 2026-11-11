;The file called first

[title name="TyranoScript Guide"]

[stop_keyconfig]


;Useful libraries provided as standard by TyranoScript
;Required for config, CG, and flashback mode
@call storage="tyrano.ks"

;It is recommended to write all essential game initialization procedures in this file

;Hide the message box
@layopt layer="message" visible=false

;Initially hide the menu button at the bottom right
[hidemenubutton]

;Jump to the title screen
@jump storage="title.ks"

[s]


