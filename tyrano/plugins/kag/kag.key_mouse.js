/*
 * キーボードとマウス操作を支援するプラグインです.
 * キーボード:
 *     [ENTER]や[SPACE]で、次のメッセージへ.
 *     [ESC]でメッセージウィンドウを消す.
 * マウス:
 *     マウスの右クリックでメニューを表示.
 *     ※メニューが非表示の場合(configVisible = false)、メッセージウィンドウを消します.
 *
 * This is a plugin to support the operation of keyboard and mouse.
 * Keyboard:
 *     Press [Enter] or the space key to go to the next message.
 *     Press [Ecs] to hide the message window.
 * Mouse:
 *     Right-clicking displays the menu.
 *     Note: When the menu is not displayed (configVisible = false), hide the message window.
 */
tyrano.plugin.kag.key_mouose = {
    init : function() {
        $(document).keyup(function(e) {
            switch (e.keyCode) {
            case 13:
            case 32:
                if (tyrano.plugin.kag.key_mouose.canClick()) {
                    $(".layer_event_click").click();
                }
                break;
            case 27:
                tyrano.plugin.kag.key_mouose.hideMessage();
                break;
            }
        });
        $(document).on("mousedown", function(e) {
            if (e.which == 3) {
                if (tyrano.plugin.kag.config.configVisible == "true") {
                    tyrano.plugin.kag.key_mouose.showMenu();
                } else {
                    tyrano.plugin.kag.key_mouose.hideMessage();
                }
            }
        });
        $(document).on("contextmenu", function(e) {
            return false;
        });
    },
    canClick : function() {
        if ($(".layer_event_click").css("display") != "none") {
            return true;
        }
        return false;
    },
    canShowMenu : function() {
        if ($(".layer_free").css("display") == "none") {
            return true;
        }
        return false;
    },
    showMenu : function() {
        if (this.canShowMenu()) {
            if ($(".menu_close").size() > 0 && $(".layer_menu").css("display") != "none") {
                $(".menu_close").click();
            } else {
                tyrano.plugin.kag.ftag.startTag("showmenu");
            }
        }
    },
    hideMessage : function() {
        if (this.canShowMenu()) {
            if ($(".menu_close").size() > 0 && $(".layer_menu").css("display") != "none") {
                $(".menu_close").click();
            } else {
                if (!tyrano.plugin.kag.stat.is_strong_stop) {
                    if (tyrano.plugin.kag.stat.is_hide_message) {
                        var num_message_layer = parseInt(tyrano.plugin.kag.config.numMessageLayers);
                        for ( var i = 0; i < num_message_layer; i++) {
                            var j_layer = tyrano.plugin.kag.layer.getLayer("message" + i);
                            if (j_layer.attr("l_visible") == "true") {
                                j_layer.show();
                            }
                        }
                        tyrano.plugin.kag.stat.is_hide_message = false;
                    } else {
                        tyrano.plugin.kag.ftag.startTag("hidemessage");
                    }
                }
            }
        }
    }
};
tyrano.plugin.kag.key_mouose.init();
