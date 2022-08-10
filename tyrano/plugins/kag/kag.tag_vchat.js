//スクリプトの評価

/*
TYRANO.kag.stat.tchat = {
            "current_top":0,
            "current_scroll":0, //スクロールされた幅を保持しておく
            "layer" : "0",
            "face_width":"100",//表情アイコンの横サイズ
            "margin_face":"20",
            "left_bgcolor":"0xFFC0CB",
            "right_bgcolor":"0xFFFFFF",
            "center_bgcolor":"0xDCDCDC",
            "anim_time":"", //アニメーションタイム
            "width":"",
            "height":"",
            "left":"0",
            "top":"0",
            "se":"",
            "backlog":"true",
            "overflow":"remove",
            "name_font_size":"16",
            "name_font_color":"0x000000",
            "zindex":""
        };
*/

/*
 vchat_in
 画面外にバルーンを配置する動作。一般的なタグとしては利用不可。
 */

var _vchat_log_count = 0;

tyrano.plugin.kag.tag.vchat_in = {
    vital: [],

    pm: {},

    start: function (pm) {
        this.kag.weaklyStop();

        var that = this;

        //レイヤを非表示にする
        var layer = this.kag.stat.current_layer;
        var page = this.kag.stat.current_page;

        var j_layer = this.kag.layer.getLayer(layer, page);
        j_layer.css("display", "none");
        j_layer.css("left", -100000);

        var j_area_chat = $("#vchat_base");

        j_area_chat.find(".current_vchat").addClass("talked_vchat").removeClass("current_vchat");

        var html =
            '\
        <div style="right: 0px; margin-right: 5px;" class="vchat current_vchat ">\
            <div class="v_chat_text vchat-text" style="margin-top: 0px; margin-right: 5px; margin-left: 20px; background-color: rgb(255, 255, 255);">\
                <h3 class="ribbon20 vchat_chara_name"></h3>\
                <p class="vchat-text-inner" ></p>\
            </div>\
        </div>\
        ';

        var j_vchat = $(html);

        j_vchat.hide();

        //クラス名追加
        //$.setName(j_vchat,"vchat_story_"+pm.name);
        // $.setName(j_vchat,pm.id);

        //テキスト内部
        var j_vchat_text = j_vchat.find(".vchat-text-inner");

        //// フォントのスタイル設定 /////////////////
        var font_style = {
            "color": "black",
            "font-weight": "normal",
            "font-size": "16px",
            "margin": "0.2em",
            "line-height": "1.2em",
            /*    "font-family": that.kag.stat.font.face,*/
        };

        j_vchat_text.css(font_style);

        //もし、キャラ名がない場合は間をあけない。
        //j_vchat_text.css("margin-top","2em");

        j_vchat.find(".vchat_chara_name").css({
            /*    "font-size":"1.8em",*/
            /*  "font-family":that.kag.stat.font.face,*/
        });

        j_area_chat.prepend(j_vchat);

        //スクロールを一番上にする。
        j_area_chat.scrollTop(0);

        _vchat_log_count++;

        if (_vchat_log_count > this.kag.stat.vchat.max_log_count) {
            //最後の１個消す
            $("#vchat_base").find(".vchat:eq(-1)").remove();
        }

        this.kag.cancelWeakStop();

        return false;
    },
};

tyrano.plugin.kag.tag.vchat_config = {
    vital: [],

    pm: {
        chara_name_color: "",
    },

    start: function (pm) {
        if (pm.chara_name_color != "") {
            this.kag.stat.vchat.chara_name_color = pm.chara_name_color;
        }

        this.kag.ftag.nextOrder();
    },
};

tyrano.plugin.kag.tag.vchat_chara = {
    vital: ["name"],

    pm: {
        name: "",
        color: "",
    },

    start: function (pm) {
        //vchatが有効じゃない場合は無視する
        if (!this.kag.stat.vchat.is_active) {
            this.kag.ftag.nextOrder();
            return;
        }

        var charas = this.kag.stat.vchat.charas;

        if (!charas[pm.name]) {
            charas[pm.name] = {
                color: "",
            };
        }

        if (pm.color != "") {
            charas[pm.name]["color"] = pm.color;
        }

        this.kag.ftag.nextOrder();
    },
};
