(function ($) {
    //jquery 拡張

    $.getBaseURL = function () {
        var str = location.pathname;
        var i = str.lastIndexOf("/");
        return str.substring(0, i + 1);
    };

    $.getDirPath = function (str) {
        var i = str.lastIndexOf("/");
        return str.substring(0, i + 1);
    };

    $.isHTTP = function (str) {
        if ($.isBase64(str)) {
            return true;
        }

        if (str.substring(0, 4) === "http") {
            return true;
        } else {
            return false;
        }
    };

    $.play_audio = function (audio_obj) {
        audio_obj.play();
    };

    $.toBoolean = function (str) {
        if (str == "true") {
            return true;
        } else {
            return false;
        }
    };

    $.getAngle = function () {
        let angle = screen && screen.orientation && screen.orientation.angle;
        if (angle === undefined) {
            angle = window.orientation; // iOS用
        }

        return angle;
    };

    //横幅の方が大きければtrue;
    $.getLargeScreenWidth = function () {
        let w = parseInt(window.innerWidth);
        let h = parseInt(window.innerHeight);

        if (w > h) {
            return true;
        } else {
            return false;
        }
    };

    $.localFilePath = function () {
        
        var path = "";
        //Mac os Sierra 対応
        if (process.execPath.indexOf("var/folders") != -1) {
            path = process.env.HOME + "/_TyranoGameData";
        } else {
            path = $.getExePath();
        }

        return path;
    };

    $.getViewPort = function () {
        let width;
        let height;

        if (self.innerHeight) {
            // all except Explorer
            width = self.innerWidth;
            height = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) {
            // Explorer 6 Strict Mode
            width = document.documentElement.clientWidth;
            height = document.documentElement.clientHeight;
        } else if (document.body) {
            // other Explorers
            width = document.body.clientWidth;
            height = document.body.clientHeight;
        }

        return {
            width: width,
            height: height,
        };
    };

    $.escapeHTML = function (val, replace_str) {
        val = val || "";
        var t = $("<div />").text(val).html();

        if (replace_str) {
            if (t === "") {
                t = replace_str;
            }
        }
        return t;
    };

    $.br = function (txtVal) {
        txtVal = txtVal.replace(/\r\n/g, "<br />");
        txtVal = txtVal.replace(/(\n|\r)/g, "<br />");
        return txtVal;
    };

    const dateFormatter = {
        _fmt: {
            hh: function (date) {
                return ("0" + date.getHours()).slice(-2);
            },
            h: function (date) {
                return date.getHours();
            },
            mm: function (date) {
                return ("0" + date.getMinutes()).slice(-2);
            },
            m: function (date) {
                return date.getMinutes();
            },
            ss: function (date) {
                return ("0" + date.getSeconds()).slice(-2);
            },
            dd: function (date) {
                return ("0" + date.getDate()).slice(-2);
            },
            d: function (date) {
                return date.getDate();
            },
            s: function (date) {
                return date.getSeconds();
            },
            yyyy: function (date) {
                return date.getFullYear() + "";
            },
            yy: function (date) {
                return date.getYear() + "";
            },
            t: function (date) {
                return date.getDate() <= 3 ? ["st", "nd", "rd"][date.getDate() - 1] : "th";
            },
            w: function (date) {
                return ["Sun", "$on", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
            },
            MMMM: function (date) {
                return [
                    "January",
                    "February",
                    "$arch",
                    "April",
                    "$ay",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ][date.getMonth()];
            },
            MMM: function (date) {
                return ["Jan", "Feb", "$ar", "Apr", "$ay", "Jun", "Jly", "Aug", "Spt", "Oct", "Nov", "Dec"][date.getMonth()];
            },
            MM: function (date) {
                return ("0" + (date.getMonth() + 1)).slice(-2);
            },
            M: function (date) {
                return date.getMonth() + 1;
            },
            $: function (date) {
                return "M";
            },
        },
        _priority: ["hh", "h", "mm", "m", "ss", "dd", "d", "s", "yyyy", "yy", "t", "w", "MMMM", "MMM", "MM", "M", "$"],
        format: function (date, format) {
            return this._priority.reduce((res, fmt) => res.replace(fmt, this._fmt[fmt](date)), format);
        },
    };

    /**
     * Dateをフォーマットする
     * @param {Date} date 日付
     * @param {string} format フォーマット (例) "yyyy/M/d hh:mm:ss"
     * @returns {string}
     */
    $.formatDate = function (date, format) {
        return dateFormatter.format(date, format);
    };

    //現在時刻を取得
    //現在の日
    $.getNowDate = function (format = "yyyy/M/d") {
        return $.formatDate(new Date(), format);
    };

    //現在の時刻
    $.getNowTime = function (format = "hh:mm:ss") {
        return $.formatDate(new Date(), format);
    };

    $.convertRem = function (px_val) {
        function getRootElementFontSize() {
            // Returns a number
            return parseFloat(
                // of the computed font-size, so in px
                getComputedStyle(
                    // for the root <html> element
                    document.documentElement,
                ).fontSize,
            );
        }

        return px_val * getRootElementFontSize();
    };

    //複数のスクリプトを一括して読み込み
    $.getMultiScripts = function (arr, cb) {
        var cnt_script = arr.length;
        var load_cnt = 0;

        if (cnt_script == 0) {
            cb();
            return;
        }

        function getScript(src) {
            $.getScript(arr[load_cnt], function (e) {
                load_cnt++;

                if (cnt_script == load_cnt) {
                    if (typeof cb == "function") {
                        cb();
                    }
                } else {
                    getScript(arr[load_cnt]);
                }
            });
        }

        getScript(arr[0]);
    };

    $.convertSecToString = function (val) {
        if (val == 0) {
            return "-";
        }
        var day = Math.floor(val / (24 * 60 * 60));
        var hour = Math.floor((val % (24 * 60 * 60)) / (60 * 60));
        var minute = Math.floor(((val % (24 * 60 * 60)) % (60 * 60)) / 60);
        var second = Math.floor(((val % (24 * 60 * 60)) % (60 * 60)) % 60);

        var str = "";
        if (day !== 0) {
            str += day + "日";
        }
        if (hour !== 0) {
            str += hour + "時間";
        }
        if (minute !== 0) {
            str += minute + "分";
        }
        if (second !== 0) {
            str += second + "秒";
        }

        return str;
    };

    $.secToMinute = function (val) {
        if (val === 0) {
            return "-";
        }

        var m = Math.floor(val / 60);
        var s = Math.floor(val % 60);
        var str = "";

        if (m !== 0) {
            str += m + "分";
        }
        str += s + "秒";

        return str;
    };

    $.trim = function (str) {
        if (str) {
        } else {
            return "";
        }

        return str.replace(/^\s+|\s+$/g, "");
    };

    $.tag = function (tag_name, pm) {
        var pm_str = "";
        for (key in pm) {
            pm_str += " " + key + '="' + pm[key] + '" ';
        }
        return "[" + tag_name + " " + pm_str + " ]";
    };

    $.rmspace = function (str) {
        str = str.replace(/ /g, "");
        str = str.replace(/　/g, "");
        str = str.replace(/\r\n?/g, "");

        return str;
    };

    $.replaceAll = function (text, searchString, replacement) {
        if (typeof text != "string") {
            return text;
        }

        //置換のコード変えてみた
        var result = text.split(searchString).join(replacement);

        return result;
    };

    //確証しを取得
    $.getExt = function (str) {
        return str.split(".").pop();
    };

    //指定した拡張子を付ける。拡張子がなければ
    $.setExt = function (name, ext_str) {
        var tmp = name.split(".");
        if (tmp.length == 1) {
            name = name + "." + ext_str;
        }

        return name;
    };

    //要素をクローンします
    $.cloneObject = function (source) {
        return $.extend(true, {}, source);
    };

    //透明度を適切な値に変更
    $.convertOpacity = function (val) {
        //255をマックスとして計算する

        var p = val / 255;

        return p;
    };

    //パスにfgimage bgimage image が含まれていた場合、それを適応する
    $.convertStorage = function (path) {};

    $.convertColor = function (val) {
        if (val.indexOf("0x") != -1) {
            return val.replace("0x", "#");
        }

        return val;
    };

    $.convertBold = function (flag) {
        if (flag == "true") {
            return "bold";
        }

        return "";
    };

    $.convertItalic = function (flag) {
        if (flag == "true") {
            return "italic";
        }

        return "";
    };

    $.send = function (url, obj, call_back) {
        //game.current_story_file = story_file;
        $.ajax({
            type: "POST",
            url: url,
            data: obj,
            dataType: "json",
            complete: function () {
                //通信終了時の処理
                $.hideLoading();
            },
            success: function (data, status) {
                $.hideLoading();

                var data_obj = data;
                if (call_back) {
                    call_back(data_obj);
                }
            },
        });
    };

    $.loadText = function (file_path, callback) {
        if (window.TYRANO) window.TYRANO.kag.showLoadingLog();

        $.ajax({
            url: file_path + "?" + Math.floor(Math.random() * 1000000),
            dataType: 'text',
            cache: false,
            success: function (text) {
                if (window.TYRANO) window.TYRANO.kag.hideLoadingLog();
                const order_str = text;
                callback(order_str);
            },
            error: function () {
                if (window.TYRANO) window.TYRANO.kag.hideLoadingLog();
                alert($.lang("file_not_found", { path: file_path }));
                callback("");
            },
        });
    };

    $.loadTextSync = function (file_path) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: file_path + "?" + Math.floor(Math.random() * 1000000),
                dataType: 'text',
                cache: false,
                success: function (text) {
                    if (window.TYRANO) window.TYRANO.kag.hideLoadingLog();
                    const order_str = text;
                    resolve(order_str);
                },

                error: function () {
                    if (window.TYRANO) window.TYRANO.kag.hideLoadingLog();
                    alert($.lang("file_not_found", { path: file_path }));
                    reject();
                },
            });
        });
    };

    //クッキーを取得
    $.getCookie = function (key) {
        var tmp = document.cookie + ";";
        var index1 = tmp.indexOf(key, 0);
        if (index1 != -1) {
            tmp = tmp.substring(index1, tmp.length);
            var index2 = tmp.indexOf("=", 0) + 1;
            var index3 = tmp.indexOf(";", index2);
            return tmp.substring(index2, index3);
        }
        return null;
    };

    $.isNull = function (str) {
        if (str == null) {
            return "";
        } else {
        }

        return str;
    };

    $.dstop = function () {
        console.log("dstop");
    };

    //ユーザ環境を取得
    $.userenv = function () {
        var ua = navigator.userAgent;
        if (ua.indexOf("iPhone") > -1) {
            return "iphone";
        } else if (ua.indexOf("iPad") > -1) {
            return "iphone";
        } else if (ua.indexOf("Android") > -1) {
            return "android";
        } else if (ua.indexOf("Chrome") > -1 && navigator.platform.indexOf("Linux") > -1) {
            return "android";
        } else {
            return "pc";
        }
    };

    $.isTyranoPlayer = function () {
        if (typeof _tyrano_player != "undefined") {
            return true;
        } else {
            return false;
        }
    };

    $.lang = function (key, replace_map, target = "word") {
        if (typeof replace_map === "string") target = replace_map;
        let string_defined = tyrano_lang[target][key];
        if (string_defined) {
            if (replace_map) {
                for (const replace_key in replace_map) {
                    const pattern = new RegExp(`\\{\\s*${replace_key}\\s*\\}`, "g");
                    string_defined = string_defined.replace(pattern, replace_map[replace_key]);
                }
            }
            return string_defined;
        } else {
            return "NOT_DEFINED";
        }
    };

    $.novel = function (key) {
        if (tyrano_lang["novel"][key]) {
            return tyrano_lang["novel"][key];
        } else {
            return "NOT_DEFINED";
        }
    };

    //ユーザのブラウザ情報を取得
    $.getBrowser = function () {
        var userAgent = window.navigator.userAgent.toLowerCase();

        if (userAgent.indexOf("msie") >= 0 || userAgent.indexOf("trident") >= 0) {
            return "msie";
        } else if (userAgent.indexOf("edge") > -1) {
            return "edge";
        } else if (userAgent.indexOf("firefox") > -1) {
            return "firefox";
        } else if (userAgent.indexOf("opera") > -1) {
            return "opera";
        } else if (userAgent.indexOf("chrome") > -1) {
            return "chrome";
        } else if (userAgent.indexOf("safari") > -1) {
            return "safari";
        } else if (userAgent.indexOf("applewebkit") > -1) {
            return "safari";
        } else {
            return "unknown";
        }
    };

    $.isNWJS = function () {
        //Electronならfalse
        if ($.isElectron()) {
            return false;
        }

        // Node.js で動作しているか
        var isNode = typeof process !== "undefined" && typeof require !== "undefined";
        // ブラウザ上(非Node.js)で動作しているか
        var isBrowser = !isNode;
        // node-webkitで動作しているか
        var isNodeWebkit;
        try {
            isNodeWebkit = isNode ? typeof require("nw.gui") !== "undefined" : false;
        } catch (e) {
            isNodeWebkit = false;
        }

        if (isNodeWebkit) {
            // node-webkitで動作
            return true;
        } else if (isNode) {
            // Node.js上で動作している
            return true;
        } else {
            //  通常のWebページとして動作している
            return false;
        }
    };

    $.isNeedClickAudio = function () {
        //プレイヤーはクリックの必要なし
        if ($.isTyranoPlayer()) {
            return false;
        }

        //ブラウザやスマホアプリは必要
        if ($.isElectron() || $.isNWJS()) {
            return false;
        }

        return true;
    };

    $.isElectron = function () {
        if (navigator.userAgent.indexOf("TyranoErectron") != -1) {
            return true;
        } else {
            return false;
        }
    };

    //オブジェクトを引き継ぐ。
    $.extendParam = function (pm, target) {
        var tmp = target;

        for (let key in target) {
            if (pm[key]) {
                if (pm[key] != "") {
                    target[key] = pm[key];
                }
            }
        }

        return target;
    };

    $.insertRule = function (css_str) {
        var sheet = (function () {
            var style = document.createElement("style");
            document.getElementsByTagName("head")[0].appendChild(style);
            return style.sheet;
        })();
        sheet.insertRule(css_str, 0);
    };

    $.insertRuleToTyranoCSS = function (css_str) {
        const sheet = $('link[href*="tyrano/tyrano.css"]').get(0).sheet;
        sheet.insertRule(css_str, sheet.cssRules.length);
    };

    $.swfName = function (str) {
        if (navigator.appName.indexOf("Microsoft") != -1) {
            return window[str];
        } else {
            return document[str];
        }
    };

    //古いトランス。
    $.trans_old = function (method, j_obj, time, mode, callback) {
        if (method == "crossfade" || mode == "show") {
            if (time == 0) {
                if (mode == "show") {
                    j_obj.show();
                } else {
                    j_obj.hide();
                }
                if (callback) {
                    callback();
                }
            } else {
                var ta = {};

                if (mode == "show") {
                    ta = {
                        opacity: "show",
                    };
                } else {
                    ta = {
                        opacity: "hide",
                    };
                }

                j_obj.animate(ta, {
                    duration: time,
                    easing: "linear",
                    complete: function () {
                        if (callback) {
                            callback();
                        }
                    }, //end complerte
                });
            }

            return false;
        } else {
            if (mode == "hide") {
                j_obj.hide(method, time, function () {
                    if (callback) callback();
                });
            } else if (mode == "show") {
                j_obj.show(method, time, function () {
                    if (callback) callback();
                });
            }
        }
    };

    //コンバート v450rc5以前
    var _map_conv_method = {
        corssfade: "fadeIn",
        explode: "zoomIn",
        slide: "slideInLeft",
        blind: "bounceIn",
        bounce: "bounceIn",
        clip: "flipInX",
        drop: "slideInLeft",
        fold: "fadeIn",
        puff: "fadeIn",
        scale: "zoomIn",
        shake: "fadeIn",
        size: "zoomIn",
    };

    $.trans = function (method, j_obj, time, mode, callback) {
        if (method == "crossfade") {
            method = "fadeIn";
        } else if (_map_conv_method[method]) {
            method = _map_conv_method[method];
        }

        j_obj.css("animation-duration", parseInt(time) + "ms");

        if (mode == "hide") {
            j_obj.show();
            method = $.replaceAll(method, "In", "Out");
            const animationEnd = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
            j_obj.addClass("animated " + method).one(animationEnd, function () {
                j_obj.off(animationEnd);
                j_obj.css("animation-duration", "");
                $(this).remove();
                if (callback) {
                    //callback();
                }
            });
        } else if (mode == "show") {
            j_obj.show();
            const animationEnd = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
            j_obj.addClass("animated " + method).one(animationEnd, function () {
                j_obj.off(animationEnd);
                j_obj.css("animation-duration", "");
                $(this).removeClass("animated " + method);
                if (callback) {
                    callback();
                }
            });
        }
    };

    //要素から空白のオブジェクトを削除して返却する
    $.minifyObject = function (obj) {
        for (let key in obj) {
            if (obj[key] == null || obj[key] == "") {
                delete obj[key];
            }
        }

        return obj;
    };

    $.preloadImgCallback = function (j_menu, cb, that) {
        var img_storage = [];

        j_menu.find("img").each(function () {
            img_storage.push($(this).attr("src"));
        });

        //ロードが全て完了したら、ふわっと出す
        var sum = 0;
        for (var i = 0; i < img_storage.length; i++) {
            that.kag.preload(img_storage[i], function () {
                sum++;
                if (img_storage.length == sum) {
                    cb();
                }
            });
        }

        if (img_storage.length == 0) {
            cb();
        }
    };

    $.removeStorage = function (key, type) {
        if (type == "file") {
            $.removeStorageFile(key);
        } else {
            $.removeStorageWeb(key);
        }
    };

    $.setStorage = function (key, val, type) {
        if (type == "webstorage_compress") {
            $.setStorageCompress(key, val);
        } else if (type == "file") {
            $.setStorageFile(key, val);
        } else {
            $.setStorageWeb(key, val);
        }
    };

    //PC版のみ。実行フォルダを取得
    /*
    $.getProcessPath = function(){
        var path = process.execPath;
        var tmp_index = path.indexOf(".app");
        var os = "mac";
        if(tmp_index == -1){
            tmp_index = path.indexOf(".exe");
            os="win";
        }
        var tmp_path =  path.substr(0,tmp_index);
        var path_index =0;
        if(os=="mac"){
            path_index = tmp_path.lastIndexOf("/");
        }else{
            path_index = tmp_path.lastIndexOf("\\");
        }

        var out_path = path.substr(0,path_index);
        return out_path;

    };
    */

    $.getOS = function () {
        if ($.isElectron()) {
            if (process.platform == "darwin") {
                return "mac";
            } else {
                return "win";
            }
        } else {
            const ua = window.navigator.userAgent.toLowerCase();
            if (ua.includes("windows nt")) {
                return "win";
            } else if (ua.includes("android")) {
                return "android";
            } else if (ua.includes("iphone") || ua.includes("ipad")) {
                return "ios";
            } else if (ua.includes("mac os x")) {
                return "mac";
            } else {
                return "";
            }
        }
    };

    $.makeSaveKey = function () {
        var S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var N = 16;
        let key = Array.from(Array(N))
            .map(() => S[Math.floor(Math.random() * S.length)])
            .join("");
        return key;
    };

    $.getStorage = function (key, type) {
        var gv = "null";

        if (type == "webstorage_compress") {
            gv = $.getStorageCompress(key);
        } else if (type == "file") {
            gv = $.getStorageFile(key);
        } else {
            gv = $.getStorageWeb(key);
        }

        return gv;
    };

    $.removeStorageWeb = function (key) {
        localStorage.removeItem(key);
    };

    $.setStorageWeb = function (key, val) {
        val = JSON.stringify(val);
        //localStorage.setItem(key, LZString.compress(escape(val)));
        try {
            localStorage.setItem(key, escape(val));
        } catch (e) {
            console.error("セーブデータ。localstorageが利用できません。");
            return;
        }
    };

    $.getStorageWeb = function (key) {
        try {
            var gv = "null";

            if (localStorage.getItem(key)) {
                //gv = unescape(LZString.decompress(localStorage.getItem(key)));
                gv = unescape(localStorage.getItem(key));
            }

            if (gv == "null") return null;
        } catch (e) {
            //alert("この環境はセーブ機能を利用できません。ローカルで実行している場合などに発生します");
            //$.confirmSaveClear();

            console.error("セーブデータ。localstorageが利用できません。");
            return null;
        }

        return gv;
    };

    $.playerHtmlPath = function (html) {
        if ("appJsInterface" in window) {
            //Android
        } else {
            if (typeof TyranoPlayer == "function") {
                //playerの場合HTMLを修正する必要がある
                var result_html = "";
                while (1) {
                    var index = html.indexOf("file:///");
                    if (index == -1) {
                        result_html += html;
                        break;
                    } else {
                        result_html += html.substring(0, index);
                        html = html.substring(index, html.length);

                        var replace_index = html.indexOf("/game/data");
                        const tmp_html = html.substring(replace_index + "/game/data".length, html.length);
                        html = "./data" + tmp_html;
                    }
                }

                if (result_html != "") {
                    html = result_html;
                }
            }
        }

        return html;
    };

    $.confirmSaveClear = function () {
        if (confirm($.lang("saved_data_is_corrupted"))) {
            alert($.lang("initialized_saved_data"));
            TYRANO.kag.removeSaveData();
        }
    };

    $.setStorageCompress = function (key, val) {
        val = JSON.stringify(val);
        localStorage.setItem(key, LZString.compress(escape(val)));
        //localStorage.setItem(key, escape(val));
    };

    $.getStorageCompress = function (key) {
        try {
            var gv = "null";

            if (localStorage.getItem(key)) {
                gv = unescape(LZString.decompress(localStorage.getItem(key)));

                if (gv == "null") {
                    gv = unescape(localStorage.getItem(key));
                }
            }

            if (gv == "null") return null;
        } catch (e) {
            console.log("==============");
            console.log(e);
            alert($.lang("save_does_not_work"));
            $.confirmSaveClear();
        }

        return gv;
    };

    $.getExtWithFile = function (str) {
        var filename = "";
        if (str.indexOf("/") != -1) {
            filename = str.split("/").pop();
        } else {
            filename = str;
        }

        var dir_name = $.replaceAll(str, filename, "");

        var ext = "";
        if (filename.indexOf(".") != -1) {
            ext = str.split(".").pop();
        } else {
            ext = "";
            //拡張子がない場合はディレクトリ名とする。
            dir_name = str;
        }
        var name = $.replaceAll(filename, "." + ext, "");

        return { filename: filename, ext: ext, name: name, dir_name: dir_name };
    };
    
    //getExePathのキャッシュ
    $.cacheExePath = "";
    
    //PC用の実行パスを取得
    $.getExePath = function () {
        
        if ($.cacheExePath != "") {
            return $.cacheExePath;
        }
        
        //TyranoStudio.app/Contents/Resources/app
        let path = window.studio_api.ipcRenderer.sendSync("getAppPath", {});
        
        let platform = "";
        //alert(process.platform);
        //console.log(process.platform)
        //console.log(path);

        if (process.platform == "darwin") {
            const platrofm = "mac";
            //TyranoStudio-darwin-x64.asar
            if (path.indexOf(".asar") != -1) {
                path = $.replaceAll(path, "/Contents/Resources/app.asar", "");
            } else {
                path = $.replaceAll(path, "/Contents/Resources/app", "");
            }

            path = $.getExtWithFile(path).dir_name;
        } else if (process.platform == "win32") {
            if (path.indexOf(".asar") != -1) {
                path = $.replaceAll(path, "\\resources\\app.asar", "");
            } else {
                path = $.replaceAll(path, "\\resources\\app", "");
            }
        }
        
        $.cacheExePath = path;

        return path;
    };

    //展開先のパスを返す。
    $.getUnzipPath = function () {
        let path = process.__dirname;

        if (path.indexOf(".asar") != -1) {
            return "asar";
        }

        return path;
    };

    $.removeStorageFile = function (key) {
        try {
            const fs = window.studio_api.fs;
            let out_path;
            if (process.execPath.indexOf("var/folders") != -1) {
                out_path = process.env.HOME + "/_TyranoGameData";
                if (!fs.existsSync(out_path)) {
                    fs.mkdirSync(out_path);
                }
            } else {
                out_path = $.getExePath();
            }
            const file_path = out_path + "/" + key + ".sav";
            fs.unlinkSync(file_path);
        } catch (e) {}
    };

    $.setStorageFile = function (key, val) {
        val = JSON.stringify(val);
        var fs = window.studio_api.fs;

        var out_path = $.getExePath();

        //mac os Sierra 対応
        if (process.execPath.indexOf("var/folders") != -1) {
            out_path = process.env.HOME + "/_TyranoGameData";
            if (!fs.existsSync(out_path)) {
                fs.mkdirSync(out_path);
            }
        } else {
            out_path = $.getExePath();
        }

        fs.writeFileSync(out_path + "/" + key + ".sav", escape(val));
    };

    $.getStorageFile = function (key) {
        try {
            var gv = "null";
            var fs = window.studio_api.fs;
            var out_path = $.getExePath();

            if (process.execPath.indexOf("var/folders") != -1) {
                out_path = process.env.HOME + "/_TyranoGameData";
                if (!fs.existsSync(out_path)) {
                    fs.mkdirSync(out_path);
                }
            } else {
                out_path = $.getExePath();
            }

            if (fs.existsSync(out_path + "/" + key + ".sav")) {
                var str = fs.readFileSync(out_path + "/" + key + ".sav","utf8");
                gv = unescape(str);
            } else {
                //Fileが存在しない場合にローカルストレージから読み取る使用は破棄。
                //gv = unescape(localStorage.getItem(key));
            }

            if (gv == "null") {
                return null;
            }
        } catch (e) {
            console.log(e);
            alert($.lang("save_does_not_work"));
            $.confirmSaveClear();
        }

        return gv;
    };

    /**
     * remodal のイベントをすべて消去
     */
    $.removeRemodalEvents = function (includes_closed) {
        $(document).off("opening", ".remodal");
        $(document).off("opened", ".remodal");
        $(document).off("closing", ".remodal");
        $(document).off("confirmation", ".remodal");
        $(document).off("cancellation", ".remodal");
        if (includes_closed) $(document).off("closed", ".remodal");
    };

    /**
     * remodal のイベント汎用処理
     * @param {Object} options
     * @param {"alert" | "confirm"} options.type
     * @param {string} options.title
     * @param {function} on_ok
     * @param {function} on_cancel
     */
    $.remodalCommon = function (options = {}) {
        const j_box = $("[data-remodal-id=modal]");
        const j_ok = $(".remodal").find("#remodal-confirm");
        const j_ng = $(".remodal").find("#remodal-cancel");
        const j_wrapper = $(".remodal-wrapper");
        const j_button = $([j_ok[0], j_ng[0]]);
        const j_event = $([j_ok[0], j_ng[0], j_wrapper[0], j_box[0]]);
        const j_anim = $(".remodal-base").add(j_box);

        // <h1> の更新
        $(".remodal_title").html(options.title);

        // OK 表示
        j_ok.show().focusable();
        j_ok.trigger("init");

        // Cancel 表示
        if (options.type === "confirm") {
            j_ng.show().focusable();
            j_ng.trigger("init");
        } else {
            j_ng.hide();
        }

        // ポイント不可
        j_event.setStyle("pointer-events", "none");

        // remodal 初期化
        j_box.css("font-family", TYRANO.kag.config.userFace);
        const inst = j_box.remodal();

        // 汎用クローズ処理
        const close_common = (e) => {
            e.stopPropagation();
            j_event.setStyle("pointer-events", "none");
            TYRANO.kag.key_mouse.vmouse.hide();
            const effect = TYRANO.kag.tmp.remodal_closing_effect;
            if (effect && effect !== "none") {
                j_box.setStyleMap({ "animation-name": effect }, "webkit");
                $(document).on("closed", ".remodal", () => {
                    j_box.setStyleMap({ "animation-name": "" }, "webkit");
                });
            }
            $.removeRemodalEvents(false);
        };

        //
        // イベントリスナを設定
        // https://github.com/VodkaBears/Remodal#events
        //

        // 旧イベントを消去
        $.removeRemodalEvents(true);

        let mousedown_elm = null;

        // ラッパーのクリックでウィンドウを閉じられるようにする
        j_wrapper
            .off("mousedown.outerclose click.outerclose")
            .on("click.outerclose", (e) => {
                e.stopPropagation();
                if (mousedown_elm !== j_wrapper[0]) return;
                j_box.off("mousedown.outerclose");
                j_wrapper.off("mousedown.outerclose click.outerclose");
                if (options.type === "confirm") j_ng.trigger("click");
            })
            .on("mousedown.outerclose", () => {
                mousedown_elm = j_wrapper[0];
            });

        // メッセージボックスのクリックがラッパーに突き抜けないようにする
        j_box.off("mousedown.outerclose").on("mousedown.outerclose", (e) => {
            mousedown_elm = j_box[0];
            e.stopPropagation();
        });

        j_button.off("click.outerclose").on("click.outerclose", () => {
            j_box.off("click.outerclose");
        });

        // 表示完了時
        $(document).on("opened", ".remodal", () => {
            // ポイント可
            j_event.setStyle("pointer-events", "auto");
        });

        //
        // ボタンのクリックイベント
        //

        if (options.type === "alert") {
            // アラート: クローズ時の処理
            $(document).on("closed", ".remodal", (e) => {
                close_common(e);
                $.removeRemodalEvents(false);
                if (typeof options.on_ok === "function") {
                    options.on_ok();
                }
            });
        }

        if (options.type === "confirm") {
            // コンファーム: OK 時の処理
            $(document).on("confirmation", ".remodal", (e) => {
                close_common(e);
                if (typeof options.on_ok === "function") {
                    options.on_ok();
                }
            });

            // コンファーム: Cancel 時の処理
            $(document).on("cancellation", ".remodal", (e) => {
                close_common(e);
                if (typeof options.on_cancel === "function") {
                    options.on_cancel();
                }
            });
        }

        //
        // オープンアニメーション
        //

        if (TYRANO.kag.tmp.remodal_opening_effect_time !== undefined) {
            j_anim.setStyleMap({ "animation-duration": TYRANO.kag.tmp.remodal_opening_effect_time }, "webkit");
        }

        // オープン開始時にアニメクラスを付ける, オープン完了時に外す
        const opening_effect = TYRANO.kag.tmp.remodal_opening_effect;
        if (opening_effect && opening_effect !== "none") {
            $(document).on("opening", ".remodal", () => {
                j_box.setStyleMap({ "animation-name": opening_effect }, "webkit");
            });
            $(document).on("opened", ".remodal", () => {
                j_box.setStyleMap({ "animation-name": "" }, "webkit");
                if (TYRANO.kag.tmp.remodal_closing_effect_time !== undefined) {
                    j_anim.setStyleMap({ "animation-duration": TYRANO.kag.tmp.remodal_closing_effect_time }, "webkit");
                }
            });
        }

        //
        // 開く
        //

        inst.open();
    };

    /**
     * モーダルウィンドウで remodal
     * @param {string} title
     * @param {function} on_ok
     */
    $.alert = (title, on_ok) => {
        $.remodalCommon({ type: "alert", title, on_ok });
    };

    /**
     * モーダルウィンドウでコンファーム, remodal
     * @param {string} title
     * @param {function} on_ok
     * @param {function} on_cancel
     */
    $.confirm = function (title, on_ok, on_cancel) {
        $.remodalCommon({ type: "confirm", title, on_ok, on_cancel });
    };

    /**
     * 画面右下にトースト通知, alertify
     * ゲーム画面(tyrano_base)よりも外側に出る
     * @param {*} str
     * @param {*} type
     */
    $.inform = (str, type) => {
        alertify.log(str, type);
    };

    $.prompt = function (str, cb) {
        alertify.prompt(str, function (flag, text) {
            if (typeof cb == "function") {
                cb(flag, text);
            }
        });
    };

    $.isBase64 = function (str) {
        if (!str) return false;

        if (str.substr(0, 10) == "data:image") {
            return true;
        } else {
            return false;
        }
    };

    //オブジェクトの個数をもってきます。1
    $.countObj = function (obj) {
        var num = 0;
        for (let key in obj) {
            num++;
        }
        return num;
    };

    $.getUrlQuery = function (url) {
        var hash = url.slice(1).split("&");
        var max = hash.length;
        var vars = {};
        var array = "";

        for (var i = 0; i < max; i++) {
            array = hash[i].split("=");
            vars[array[0]] = array[1];
        }

        return vars;
    };

    //アトリビュートの中で保存するリストを取得する
    $.makeSaveJSON = function (el, array_white_attr) {
        var j_el = $($.playerHtmlPath($(el).outerHTML()));

        var root = {
            tag: el.tagName,
            style: j_el.attr("style"),
            class: j_el.attr("class"),
            text: "",
            attr: {},
            children: [],
        };

        //属性を設置
        for (var k = 0; k < array_white_attr.length; k++) {
            if (j_el.attr(array_white_attr[k])) {
                root["attr"][array_white_attr[k]] = j_el.attr(array_white_attr[k]);
            }
        }

        loop(el, root);

        function loop(node, _root) {
            var nodes = node.childNodes;
            for (var i = 0; i < nodes.length; i++) {
                //console.log(nodes[i]);
                var j_node = $(nodes[i]);

                var obj = {
                    tag: nodes[i].tagName,
                    style: j_node.attr("style"),
                    class: j_node.attr("class"),
                    text: j_node.text(),
                    attr: {},
                    children: [],
                };

                //属性を設置
                for (var k = 0; k < array_white_attr.length; k++) {
                    if (j_node.attr(array_white_attr[k])) {
                        obj["attr"][array_white_attr[k]] = j_node.attr(array_white_attr[k]);
                    }
                }

                if (!nodes[i]) {
                    console.error("セーブデータ作成エラー");
                    console.error(nodes[i]);
                    continue;
                }

                if (nodes[i].childNodes.length > 0) {
                    loop(nodes[i], obj);
                }

                _root.children.push(obj);
            }
        }

        return root;
    };

    //レイヤーをhtmlエレメントとして復元する
    $.makeElementFromSave = function (root, array_white_attr) {
        if (root.tag.toLowerCase() == "script") return false;

        var j_root = $(document.createElement(root.tag));

        j_root.attr("style", root["style"]);
        j_root.attr("class", root["class"]);

        for (var i = 0; i < array_white_attr.length; i++) {
            if (typeof root["attr"][array_white_attr[i]] != "undefined") {
                j_root.attr(array_white_attr[i], root["attr"][array_white_attr[i]]);
            }
        }

        loop(root, j_root);

        function loop(_root, _j_obj) {
            var nodes = _root.children;
            for (var i = 0; i < nodes.length; i++) {
                if (typeof nodes[i].tag != "undefined" && nodes[i].tag.toLowerCase() == "script") {
                    break;
                }

                if (typeof nodes[i].tag == "undefined") {
                    _j_obj.append(nodes[i].text);
                    continue;
                }

                var j_node = $(document.createElement(nodes[i].tag));

                j_node.attr("style", nodes[i]["style"]);
                j_node.attr("class", nodes[i]["class"]);

                for (var k = 0; k < array_white_attr.length; k++) {
                    if (typeof nodes[i]["attr"][array_white_attr[k]] != "undefined") {
                        j_node.attr(array_white_attr[k], nodes[i]["attr"][array_white_attr[k]]);
                    }
                }

                if (!nodes[i]) {
                    console.error("セーブデータ作成エラー");
                    console.error(nodes[i]);
                    continue;
                }

                if (nodes[i].children.length > 0) {
                    loop(nodes[i], j_node);
                }

                _j_obj.append(j_node);
            }
        }

        return j_root;
    };

    //渡されたJqueryオブジェクトにクラスをセットします
    $.setName = function (jobj, str) {
        str = $.trim(str);

        if (str == "") return;

        var array = str.split(",");
        for (var i = 0; i < array.length; i++) {
            jobj.addClass(array[i]);
        }
    };

    //フラッシュのインストール判定
    $.isFlashInstalled = function () {
        if (navigator.plugins["Shockwave Flash"]) {
            return true;
        }
        try {
            new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            return true;
        } catch (e) {
            return false;
        }
    };

    /*スマホの場合は、タッチでクリックを置き換える*/
    /*タッチ系、一応出来たけど、動作確認よくしなければならなｋ，問題なければR9にも適応*/
    if ($.userenv() != "pc") {
        $.event.tap = function (o) {
            o.bind("touchstart", onTouchStart_);
            function onTouchStart_(e) {
                e.preventDefault();
                o.data("event.tap.moved", false).one("touchmove", onTouchMove_).one("touchend", onTouchEnd_);
                e.stopPropagation();
            }

            function onTouchMove_(e) {
                //o.data('event.tap.moved', true);
                e.stopPropagation();
            }

            function onTouchEnd_(e) {
                if (!o.data("event.tap.moved")) {
                    o.unbind("touchmove", onTouchMove_);
                    o.trigger("click").click();
                    e.stopPropagation();
                }
            }
        };

        if ("ontouchend" in document) {
            $.fn.tap = function (data, fn) {
                //alert("tap!");

                if (fn == null) {
                    fn = data;
                    data = null;
                }

                if (arguments.length > 0) {
                    this.bind("tap", data, fn);
                    $.event.tap(this);
                } else {
                    this.trigger("tap");
                }
                return this;
            };

            if ($.attrFn) {
                $.attrFn["tap"] = true;
            }

            //クリック上書き
            $.fn.click = $.fn.tap;
        } else {
            //$.fn.tap = $.fn.click;
        }
    }

    //////////////////////////////

    $.error_message = function (str) {
        alert(str);
    };

    //クッキー設定
    $.setCookie = function (key, val) {
        document.cookie = key + "=" + escape(val) + ";expires=Fri, 31-Dec-2030 23:59:59;path=/;";
    };

    // window.setTimeoutのラッパー関数
    // timeoutが0より大きい数値ならwindow.setTimeoutに投げて非同期実行（戻り値はtimerId:正の整数）
    // そうでないならcallbackを同期実行（戻り値は0）
    // ※window.setTimeout(callback, 0)は非同期実行になってしまう
    $.setTimeout = function (callback, timeout) {
        if (typeof timeout === "number" && timeout > 0) {
            return setTimeout(callback, timeout);
        }
        callback();
        return 0;
    };

    /**
     * @typedef {Object} EdgeOption
     * @property {string} color
     * @property {number} width
     * @property {number} total_width
     */
    /**
     * 縁取りの太さと幅を指定した文字列を解析してEdgeの配列を返す
     * たとえば $.parseEdgeOptions("4px rgb(255,0,0), 2px 0xFFFFFF, blue") は次の配列を返す
     * [
     *   {color: "rgb(255,0,0)", width: 4, total_width: 4},
     *   {color: "#FFFFFF", width: 2, total_width: 6},
     *   {color: "blue", width: 1, total_width: 7}
     * ]
     * @param {string} edge_str 縁取りの太さと幅 (例) "4px rgb(255,0,0), 2px 0xFFFFFF"
     * @returns {EdgeOption[]}
     */
    $.parseEdgeOptions = function (edge_str) {
        // キャッシュを活用
        const cache_map = $.parseEdgeOptions.cache;
        if (edge_str in cache_map) {
            return cache_map[edge_str];
        }

        // 戻り値となるEdgeの配列
        const edges = [];

        // 文字列を「カッコの外にあるカンマ」で刻む
        // 色指定自体にカンマが含まれるケース（"rgb(255,255,255)"のような）を考慮しなければならない
        const edge_str_hash = edge_str.split(/,(?![^(]*\))/);

        // 内側から加算していった合計の縁取り太さ（複数縁取りを行う場合に意味を持つ）
        // filter: drop-shadow()方式では不要、text-shadow方式や-webkit-text-stroke方式では必要
        let total_width = 0;

        for (const this_edge_str of edge_str_hash) {
            // 例) "6px Black"
            const this_edge_str_trim = $.trim(this_edge_str);

            // 先頭の〇〇pxをチェック
            const width_match = this_edge_str_trim.match(/^[0-9.]+px /);

            let width;
            let width_str;
            if (width_match) {
                // 先頭の〇〇pxが見つかればそれを縁取りの太さとして解釈し、〇〇pxよりもあとの文字列を色解析に回す
                width = parseFloat(width_match[0]);
                width_str = this_edge_str_trim.substring(width_match[0].length);
            } else {
                // 先頭の〇〇pxが見つからなければ太さは1とし、文字列をまるごと色解析に回す
                width = 1;
                width_str = this_edge_str_trim;
            }

            const color = $.convertColor($.trim(width_str));
            total_width += width;
            if (color) {
                edges.push({ color, width, total_width });
            }
        }
        cache_map[edge_str] = edges;
        return edges;
    };
    $.parseEdgeOptions.cache = {};

    /**
     * 縁取りしたいDOM要素のスタイルのfilterプロパティにセットするべき値を生成する
     * @param {string} edge_str 縁取りの太さと幅 (例) "4px red, 2px white"
     * @returns {string} (例) "drop-shadow(0 0 4px red) drop-shadow(0 0 red) ..."
     */
    $.generateDropShadowStrokeCSS = function (edge_str) {
        // 毎回計算するのは意外と重いのでキャッシュを活用
        const cache_map = $.generateDropShadowStrokeCSS.cache;
        if (edge_str in cache_map) {
            return cache_map[edge_str];
        }

        // "drop-shadow(...)" を格納していく配列
        const css_arr = [];

        const edges = $.parseEdgeOptions(edge_str);
        for (const edge of edges) {
            css_arr.push($.generateDropShadowStrokeCSSOne(edge.color, edge.width));
        }

        const css_value = css_arr.join(" ");
        cache_map[edge_str] = css_value;
        return css_value;
    };
    $.generateDropShadowStrokeCSS.cache = {};

    /**
     * 縁取りしたいDOM要素のスタイルのfilterプロパティにセットするべき値を生成する
     * @param {string} color 縁取りの色 (例) "red"
     * @param {number} width 縁取りの幅 (例) 3
     * @returns {string} 例) "drop-shadow(0 0 3px red) drop-shadow(0 0 red) ..."
     */
    $.generateDropShadowStrokeCSSOne = function (color = "black", width = 1) {
        // drop-shadow(...)を重ねる
        // 試行錯誤の結果これが良い感じと思われた
        const shadow_width = (width - 1) * 0.4;
        const css_array = [];
        if (shadow_width > 0) {
            css_array.push(`drop-shadow(0 0 ${shadow_width.toFixed(2)}px ${color})`);
            for (let i = 0; i < 8; i++) {
                css_array.push(`drop-shadow(0 0 ${color})`);
            }
        }
        // 最後にうっすらとぼかした細い影を落とすことでアンチエイリアス効果を与える
        // これがないと縁取りがガビガビに見えてしまう
        css_array.push(`drop-shadow(0 0 0.4px ${color})`);
        css_array.push(`drop-shadow(0 0 0.4px ${color})`);
        css_array.push(`drop-shadow(0 0 0.2px ${color})`);
        return css_array.join(" ");
    };

    if ($.getOS() === "ios" && $.getBrowser() === "safari") {
        $.generateDropShadowStrokeCSSOne = function (color = "black", width = 1) {
            const shadow_width = Math.max(1, parseInt(width * 0.5));
            console.warn(shadow_width);
            const css_array = [];
            if (shadow_width > 0) {
                css_array.push(`drop-shadow(0 0 ${shadow_width}px ${color})`);
                for (let i = 0; i < 8; i++) {
                    css_array.push(`drop-shadow(0 0 ${color})`);
                }
            }
            return css_array.join(" ");
        };
    }

    /**
     * 縁取りしたいDOM要素のスタイルのtext-shadowプロパティにセットするべき値を生成する
     * @param {string} edge_str 縁取りの太さと幅 (例) "4px red, 2px white"
     * @returns {string} 例) "1px 1px 0px red, -1px 1px 0px red, ..."
     */
    $.generateTextShadowStrokeCSS = function (edge_str) {
        // 毎回計算するのは意外と重いのでキャッシュを活用
        const cache_map = $.generateTextShadowStrokeCSS.cache;
        if (edge_str in cache_map) {
            return cache_map[edge_str];
        }

        // "1px 1px 0px black" のような文字列を格納していく配列
        const css_arr = [];

        const edges = $.parseEdgeOptions(edge_str);
        for (const edge of edges) {
            css_arr.push($.generateTextShadowStrokeCSSOne(edge.color, edge.total_width));
        }

        const css_value = css_arr.join(",");
        cache_map[edge_str] = css_value;
        return css_value;
    };
    $.generateTextShadowStrokeCSS.cache = {};

    /**
     * 縁取りしたいDOM要素のスタイルのtext-shadowプロパティにセットするべき値を生成する
     * @param {string} color 縁取りの色 例) "black"
     * @param {number} width 縁取りの幅 例) 3
     * @returns {string} 例) "1px 1px 0px black, -1px 1px 0px black, ..."
     */
    $.generateTextShadowStrokeCSSOne = function (color = "black", width = 1) {
        // 円周上の頂点を取得
        const points = $.calcTextShadowStrokePoints(width);

        // 座標の小数点以下の桁数
        const position_digits = 2;

        // text-shadowを重ねる
        const css_array = [];
        for (let p of points) {
            const x = p.x.toFixed(position_digits);
            const y = p.y.toFixed(position_digits);
            const css = `${x}px ${y}px 0px ${color}`;
            css_array.push(css);
        }

        return css_array.join(",");
    };

    /**
     * text-shadowで文字の縁取りを行うときの、陰をずらす先の頂点の座標配列を計算する
     * 太い縁取りを行う場合ほど大量の頂点を生み出す必要がある
     * @param {number} width 縁取りの幅 (例) 3
     * @returns {{x: number; y: number;}[]}
     */
    $.calcTextShadowStrokePoints = function (width) {
        // 太さが1以下の場合は固定値を返す
        if (width <= 1) {
            return [
                { x: 1, y: -1 },
                { x: 1, y: 1 },
                { x: -1, y: 1 },
                { x: -1, y: -1 },
            ];
        }

        // 円周の長さ
        const circumference = 2 * width * Math.PI;

        // 円周をこの長さで分割する
        const hash_length = 1;

        // 頂点の数の最低値
        const point_num_min = 8;

        // 頂点の数（円周の長さ÷分割する長さ）
        const point_num = Math.max(point_num_min, circumference / hash_length);

        // 1周（2πラジアン＝360°）
        const round = 2 * Math.PI;

        // 1周をこの角度で分割する
        const hash_angle = round / point_num;

        // 円周上の点の座標を格納する配列
        const points = [];

        for (let angle = 0; angle < round; angle += hash_angle) {
            points.push({
                x: width * Math.cos(angle),
                y: width * Math.sin(angle),
            });
        }

        return points;
    };

    /**
     * CSSのfilterプロパティに値をセット
     * prefixを考慮
     * @param {string} str filter プロパティにセットする値
     * @param {boolean} [add_z_0=true] z-0 クラスを付けるかどうか
     * @return {jQuery}
     */
    $.fn.setFilterCSS = function (str, add_z_0 = true) {
        // プレフィックスを考慮して filter プロパティをセット
        this.setStyle("filter", str, ["webkit", "moz", "ms"]);

        // z-0 クラスを付与して transform: translateZ(0) でGPUレイヤー作成を促す
        // Safari on iOS においてfilterプロパティだけではGPUレイヤーが作成されず
        // filterが崩れる可能性がある
        if (add_z_0) this.addClass("z-0");

        return this;
    };

    /**
     * CSSグラデーションのプリセット
     */
    $.gradientPresetMap = {
        dark: "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 41%, rgba(126,126,126,1) 100%)",
        light: "linear-gradient(0deg, rgba(193,245,239,1) 0%, rgba(255,255,255,1) 34%, rgba(255,255,255,1) 100%)",
        fire: "linear-gradient(0deg, rgba(255,0,0,1) 0%, rgba(255,239,0,1) 100%)",
        sky: "linear-gradient(0deg, rgba(0,255,235,1) 0%, rgba(0,18,255,1) 100%)",
        leaf: "linear-gradient(0deg, rgba(234,240,0,1) 0%, rgba(0,226,49,1) 100%)",
        gold: "repeating-linear-gradient(0deg, #B67B03 0.1em, #DAAF08 0.2em, #FEE9A0 0.3em, #DAAF08 0.4em, #B67B03 0.5em)",
        gold2: "linear-gradient(0deg, #b8751e 0%, #ffce08 37%, #fefeb2 47%, #fafad6 50%, #fefeb2 53%, #e1ce08 63%, #b8751e 100%)",
        silver: "repeating-linear-gradient(0deg, #a8c7c3 0.1em, #b6c9d1 0.2em, #e7fbff 0.3em, #c7d5d6 0.4em, #a6b2b6 0.5em)",
        silver2: "linear-gradient(0deg, #acb4b8 0%, #e6f8ff 37%, #e6f7f8 47%, #e2f3fd 50%, #eff9ff 53%, #d8e4e7 63%, #b5bbbd 100%)",
    };

    /**
     * グラデーションテキストを設定する
     * @param {string} gradient CSSのグラデーション関数文字列 linear-gradient(...)
     * @return {jQuery}
     */
    $.fn.setGradientText = function (gradient) {
        if (this.length === 0) {
            return this;
        }
        if (gradient in $.gradientPresetMap) {
            gradient = $.gradientPresetMap[gradient];
        }
        this.each(function () {
            $(this)
                .setStyleMap({
                    "background-image": gradient,
                    "-webkit-background-clip": "text",
                    "background-clip": "text",
                    "color": "transparent",
                })
                .addClass("gradient-text");
        });
        return this;
    };

    /**
     * グラデーションテキストを復元する
     * @return {jQuery}
     */
    $.fn.restoreGradientText = function () {
        if (this.length === 0) {
            return this;
        }
        this.each(function () {
            const j_this = $(this);
            const style = j_this.attr("style");
            if (style && !style.includes("-webkit-background-clip") && style.includes("background-clip")) {
                const new_style = style.replace("background-clip", "-webkit-background-clip: text; background-clip");
                j_this.attr("style", new_style);
            }
        });
        return this;
    };

    /**
     * -webkit-text-strokeで縁取りされている可能性のある
     * [ptext]のテキスト内容を書き換える
     * @param {string} str 新しいテキスト
     * @return {jQuery}
     */
    $.fn.updatePText = function (str) {
        if (this.length === 0) {
            return this;
        }
        this.each(function () {
            if (typeof this.updateText === "function") {
                this.updateText(str);
            } else {
                $(this).html(str);
            }
        });
        return this;
    };

    /**
     * 引数が"空でない文字列"であるかどうかを返す
     * @param {any} val
     * @returns {boolean}
     */
    $.isNonEmptyStr = function (val) {
        if (typeof val === "string" && val !== "") {
            return true;
        }
        return false;
    };

    /**
     * CSSのオブジェクトを渡してセットする
     * 本家jQueryの.css()メソッドは汎用性が高い分処理が遅い
     * こちらのメソッドであれば処理時間が40-50%ほどで済む
     * @param {{[key: string]: string;}} map CSSのプロパティと値が対になっているオブジェクト
     * @param {string | string[]} [prefixes] ベンダープレフィックス対応 (例) [ "webkit", "mz" ]
     * @return {jQuery}
     */
    $.fn.setStyleMap = function (map, prefixes) {
        const len = this.length;
        if (len === 0) {
            return this;
        }
        if (typeof prefixes === "string") {
            prefixes = [prefixes];
        }
        for (let i = 0; i < len; i++) {
            const elm = this[i];
            for (const plain_key in map) {
                const value = map[plain_key];
                if (prefixes) {
                    for (const prefix of prefixes) {
                        const prefix_key = `-${prefix}-${plain_key}`;
                        elm.style.setProperty(prefix_key, value);
                    }
                }
                elm.style.setProperty(plain_key, value);
            }
        }
        return this;
    };

    /**
     * CSSのキーとバリューを渡してセットする
     * 本家jQueryの.css()メソッドは汎用性が高い分処理が遅い
     * こちらのメソッドであれば処理時間が40-50%ほどで済む
     * @param {string} key
     * @param {string} value
     * @param {string | string[]} [prefixes] ベンダープレフィックス対応 (例) [ "webkit", "mz" ]
     * @return {jQuery}
     */
    $.fn.setStyle = function (key, value, prefixes) {
        const len = this.length;
        if (len === 0) {
            return this;
        }
        if (typeof prefixes === "string") {
            prefixes = [prefixes];
        }
        for (let i = 0; i < len; i++) {
            const elm = this[i];
            if (prefixes) {
                for (const prefix of prefixes) {
                    const prefix_key = `-${prefix}-${key}`;
                    elm.style.setProperty(prefix_key, value);
                }
            }
            elm.style.setProperty(key, value);
        }
        return this;
    };

    /**
     * 要素に直接指定されているスタイルの値を取得する
     * なにも指定されていない場合は空の文字列が帰る
     * ※ .css()とは違う。.css()は.getComputedStyle()がベースになっている。
     * 　 .css()は、要素自体には何のスタイルも指定されていない場合でも、読み込まれているCSSを考慮して
     * 　 最終的にどのようなスタイルが当たるのかを判断し、さらに長さのプロパティをpxに変換して返す仕様がある。
     * ※ ここで定義している.getStyle()は単純に『この要素に直接』指定されているスタイルを返す。
     * @param {string | string[]} prop
     * @return {string}
     */
    $.fn.getStyle = function (prop) {
        if (this[0]) {
            if (typeof prop === "string") {
                return this[0].style.getPropertyValue(prop);
            } else {
                const style_map = {};
                prop.forEach((this_prop) => {
                    style_map[this_prop] = this[0].style.getPropertyValue(this_prop);
                });
                return style_map;
            }
        }
        return "";
    };

    /**
     * 要素が表示されていれば true を返す
     * (display: none; でなければ true を返す)
     * @return {boolean}
     */
    $.fn.isDisplayed = function () {
        if (!this[0]) return false;
        return this.css("display") !== "none";
    };

    /**
     * 渡されたjQueryコレクション内のすべての要素について横幅を調査し、
     * その調査で得られたもっとも大きい横幅をすべての要素のwidthプロパティにpx単位で適用する
     * box-sizingも考慮する
     * @returns {jQuery}
     */
    $.fn.alignMaxWidth = function () {
        return this.alignMaxWidthOrHeight("width", "left", "right");
    };
    $.fn.alignMaxHeight = function () {
        return this.alignMaxWidthOrHeight("height", "top", "bottom");
    };
    $.fn.alignMaxWidthOrHeight = function (_width, _left, _right) {
        const len = this.length;
        if (len === 0) {
            return this;
        }
        let max_width = -1;
        let j_max_elm;
        this.each((i, elm) => {
            const j_elm = $(elm);
            // border-box にしておく → 横幅を統一的に解釈するため
            // display: block にしておく → 表示状態でないと横幅が取得できないため
            j_elm.setStyle("box-sizing", "border-box").show();
            const computed_style = j_elm.css([
                "box-sizing",
                `padding-${_left}`,
                `padding-${_right}`,
                `border-${_left}-width`,
                `border-${_right}-width`,
            ]);
            const padding_sum =
                parseFloat(computed_style[`padding-${_left}`]) +
                parseFloat(computed_style[`padding-${_right}`]) +
                parseFloat(computed_style[`border-${_left}-width`]) +
                parseFloat(computed_style[`border-${_right}-width`]);
            const client_width = j_elm[_width]() + padding_sum;
            if (client_width > max_width) {
                max_width = client_width;
                j_max_elm = j_elm;
            }
        });
        const width = j_max_elm.getStyle("width");
        this.setStyle(_width, `${max_width}px`);
        return this;
    };

    /**
     * ティラノスクリプトの[kanim]に渡されたパラメータを用いて
     * 任意のDOM要素にWeb Animation APIによるキーフレームアニメーションを適用する
     * @param {Object} pm
     * @return {jQuery}
     */
    $.fn.animateWithTyranoKeyframes = function (pm) {
        const len = this.length;
        if (len === 0) {
            return this;
        }
        const keyframes = TYRANO.kag.parseKeyframesForWebAnimationAPI(pm.keyframe);
        if (!keyframes) {
            return this;
        }
        for (let i = 0; i < len; i++) {
            const anim = this[i].animate(keyframes, {
                delay: parseInt(pm.delay) || 0,
                direction: pm.direction || "normal",
                duration: parseInt(pm.time) || 1000,
                easing: pm.easing || "linear",
                iterations: pm.count === "infinite" ? Infinity : parseInt(pm.count) || Infinity,
                fill: pm.mode || "forwards",
            });
            anim.onfinish = () => {
                if (pm.onend) {
                    pm.onend(anim);
                }
            };
        }
        return this;
    };

    /**
     * dataフォルダに入っていることが想定されるフォルダ名("scenario", "image"など)を格納した配列
     */
    const data_folder_names = ["scenario", "image", "fgimage", "bgimage", "video", "sound", "bgm", "others"];

    /**
     * タグのstorageパラメータに指定された値をフルパスに直す
     * - "http" から始まる場合はそのまま返す。
     * - そうでない場合、戻り値が "./" で始まることを保証する。
     * - 同等のパスが一意に定まるパスで表されることを保証する。
     * - そのために "../" を除去する。
     * - "../" を許可してしまうと、同等のパスを無限のパターンで表せてしまうため、
     *   たとえばパスをキーにした連想配列でキャッシュ管理をしている場合に
     *   キャッシュが機能しないケースが出てきてしまう。
     * @param {string} storage "foo.png"
     * @param {string} folder "image"
     * @returns {string}
     * @example
     * $.parseStorage("foo.png", "image");
     * // "./data/image/foo.png"
     * $.parseStorage("https://tyrano.jp/foo.png", "image");
     * // "https://tyrano.jp/foo.png"
     * $.parseStorage("nextpage.gif", "tyrano/images/system");
     * // "./tyrano/images/system/nextpage.gif"
     * $.parseStorage("foo.png", "data/image");
     * // "./data/image/foo.png"
     * $.parseStorage("../fgimage/foo.png", "image");
     * // "./data/fgimage/foo.png"
     */
    $.parseStorage = function (storage, folder = "") {
        if (!storage) return "";

        // "http"で始まっているならそのまま返す
        if ($.isHTTP(storage)) {
            return storage;
        }

        // フォルダパスを特定
        if (folder && data_folder_names.includes(folder.split("/").shift())) {
            // dataフォルダに入っているフォルダ名が指定されている場合は自動的に"data/"を足す
            // たとえば"scenario"を"data/scenario"に変換する
            folder = `data/${folder}`;
        }

        // / フォルダパス / ファイル名
        let full_path = `/${folder}/${storage}`;

        // "//" や "/./" は "/" に直す
        full_path = full_path.replace(/\/\.?\/+/g, "/");

        const path_hash = [];

        full_path.split("/").forEach((item) => {
            if (item === "" || item === ".") {
                return;
            }
            if (item === "..") {
                path_hash.pop();
                return;
            }
            path_hash.push(item);
        });

        full_path = "./" + path_hash.join("/");

        return full_path;
    };

    /**
     * "300", "0.3s", "300ms" などでありうる文字列を
     * animation-duration にセットできる値に変換する
     * @param {string} str
     * @returns
     */
    $.convertDuration = function (str, default_value = "0s") {
        if (typeof str !== "string" || str === "") {
            return default_value;
        }
        if (str.includes("s")) {
            return str;
        }
        return str + "ms";
    };

    /**
     * スネークケース(ハイフン区切り)のCSSのプロパティ名を
     * キャメルケースに変換して返す
     * @param {string} str
     * @returns {string}
     * @example
     * $.parseCamelCaseCSS("-webkit-text-stroke");
     * // "webkitTextStroke"
     */
    $.parseCamelCaseCSS = function (str) {
        if (typeof str !== "string") {
            return "";
        }
        // 先頭のハイフンはただ消去するだけでいい
        if (str.charAt(0) === "-") {
            str = str.substring(1);
        }
        // ハイフン＋なんらかの小文字アルファベットのマッチ
        const match = str.match(/-[a-z]/);
        // マッチしなくなったら完成
        if (!match) {
            return str;
        }
        // マッチし続ける限り再帰する
        return $.parseCamelCaseCSS(str.replace(match[0], match[0].charAt(1).toUpperCase()));
    };

    $.findAnimTargets = function (pm = {}) {
        // アニメーション対象
        let j_target = null;

        if (pm.name) {
            // nameパラメータが指定されている場合
            j_target = $("." + pm.name);
        } else if (pm.layer) {
            // nameパラメータは指定されていないがlayerパラメータが指定されている場合
            // 対象レイヤのクラス名を取得 (例) "layer_free", "0_fore", "1_fore"
            const layer_name = pm.layer == "free" ? "layer_free" : pm.layer + "_fore";
            // レイヤ内の子要素をすべて対象に取る
            j_target = $("." + layer_name).children();
        }

        return j_target || $();
    };

    /**
     * volumeパラメータの値を実際にhowler.jsで利用可能な値に直す
     * "0"～"100" の文字列を 0.0～1.0 の数値に変換する
     * @param {string} vol_str parseInt()で数値に変換可能な文字列 (例) "0", "50", "100"
     * @returns {number} 0以上1以下の数値
     */
    $.parseVolume = function (vol_str) {
        const vol_int = typeof vol_str === "string" ? parseInt(vol_str) : vol_str;
        if (isNaN(vol_int)) {
            return 1;
        }
        return Math.max(0, Math.min(1, vol_str / 100));
    };

    /**
     * フォーカス可能にする
     * @param {number} tabindex
     * @return {jQuery}
     */
    $.fn.focusable = function (tabindex = 0) {
        TYRANO.kag.makeFocusable(this, tabindex);
        return this;
    };

    /**
     * フォーカス不可能にする
     * @param {number} tabindex
     * @return {jQuery}
     */
    $.fn.unfocusable = function (tabindex = 0) {
        TYRANO.kag.makeUnfocusable(this, tabindex);
        return this;
    };

    /**
     * rule のセレクタが :hover や :active であるなら
     * セレクタを .hover や .active に書き変えたものを複製して stylesheet に追加する
     * https://developer.mozilla.org/ja/docs/Web/API/CSSStyleSheet
     * @param {CSSRule} rule
     * @param {CSSStyleSheet} stylesheet
     */
    $.copyHoverRuleToFocusRule = (rule, stylesheet) => {
        if (rule.selectorText) {
            const new_selector_texts = [];
            const hash = rule.selectorText.split(",");
            for (const selector of hash) {
                if (selector.includes(":hover")) {
                    new_selector_texts.push(selector.replace(":hover", ".hover"));
                    new_selector_texts.push(selector.replace(":hover", ".focus"));
                }
                if (selector.includes(":active")) {
                    new_selector_texts.push(selector.replace(":active", ".active"));
                }
            }
            if (new_selector_texts.length) {
                const selector_text = new_selector_texts.join(",");
                const bracket_index = rule.cssText.indexOf("{");
                const style_text = rule.cssText.substring(bracket_index);
                const css_text = selector_text + style_text;
                stylesheet.insertRule(css_text, stylesheet.cssRules.length);
            }
        }
    };

    /**
     * ボタンのホバー時の CSS をキーボードによるフォーカス時や仮想マウスカーソルによるホバー時にも適用するために、
     * 渡された <style> 要素に記載されている CSS ルールをすべて洗い出し、
     * :hover や :active へのルールを .hover や .active へのルールとしてコピーして、
     * スタイルシートの末尾に insertRule する
     * @param {jQuery|Element|string} j_style
     */
    $.copyHoverCSSToFocusCSS = function (j_style) {
        try {
            if (!(j_style instanceof jQuery)) j_style = $(j_style);
            const stylesheet = j_style.get(0).sheet;
            const import_map = {};
            for (const rule of stylesheet.cssRules) {
                if (rule instanceof CSSImportRule) {
                    // @import で外部CSSを読み込んでいる場合は記憶しておく
                    import_map[rule.href] = rule.styleSheet;
                } else {
                    $.copyHoverRuleToFocusRule(rule, stylesheet);
                }
            }
            // @import で読み込んだ外部CSSに対しても同じことをする
            for (const key in import_map) {
                const imported_stylesheet = import_map[key];
                for (const rule of imported_stylesheet.cssRules) {
                    $.copyHoverRuleToFocusRule(rule, stylesheet);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    $.fn.outerHTML = function (s) {
        if (s) {
            this.before(s);
            this.remove();
            return this;
        } else {
            var dummy = $("<p>");
            var elem = this.eq(0);
            dummy.append(elem.clone());
            return dummy.html();
        }
    };

    // t: current time, b: begInnIng value, c: change In value, d: duration
    $.easing["jswing"] = $.easing["swing"];

    $.extend($.easing, {
        def: "easeOutQuad",
        swing: function (x, t, b, c, d) {
            //alert(jQuery.easing.default);
            return $.easing[$.easing.def](x, t, b, c, d);
        },
        _linear: function (x, t, b, c, d) {
            return b + c * (t / d);
        },
        easeInQuad: function (x, t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOutQuad: function (x, t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOutQuad: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return (c / 2) * t * t + b;
            return (-c / 2) * (--t * (t - 2) - 1) + b;
        },
        easeInCubic: function (x, t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function (x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b;
            return (c / 2) * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function (x, t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function (x, t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t + b;
            return (-c / 2) * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function (x, t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function (x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t * t + b;
            return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function (x, t, b, c, d) {
            return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function (x, t, b, c, d) {
            return c * Math.sin((t / d) * (Math.PI / 2)) + b;
        },
        easeInOutSine: function (x, t, b, c, d) {
            return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
        },
        easeInExpo: function (x, t, b, c, d) {
            return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function (x, t, b, c, d) {
            return t == d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
        },
        easeInOutExpo: function (x, t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
            return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (x, t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function (x, t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return (-c / 2) * (Math.sqrt(1 - t * t) - 1) + b;
            return (c / 2) * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * 0.3;
            if (a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else s = (p / (2 * Math.PI)) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b;
        },
        easeOutElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * 0.3;
            if (a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else s = (p / (2 * Math.PI)) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) + c + b;
        },
        easeInOutElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (0.3 * 1.5);
            if (a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else s = (p / (2 * Math.PI)) * Math.asin(c / a);
            if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) * 0.5 + c + b;
        },
        easeInBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
            return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
        },
        easeInBounce: function (x, t, b, c, d) {
            return c - $.easing.easeOutBounce(x, d - t, 0, c, d) + b;
        },
        easeOutBounce: function (x, t, b, c, d) {
            if ((t /= d) < 1 / 2.75) {
                return c * (7.5625 * t * t) + b;
            } else if (t < 2 / 2.75) {
                return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
            } else if (t < 2.5 / 2.75) {
                return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
            } else {
                return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
            }
        },
        easeInOutBounce: function (x, t, b, c, d) {
            if (t < d / 2) return $.easing.easeInBounce(x, t * 2, 0, c, d) * 0.5 + b;
            return $.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        },
    });

    // いま終了時コンファームが有効かどうか
    let is_close_confirm_enabled = false;
    let is_set_electron_close_event = false;

    /**
     * プレイヤーが未保存の状態でページを離れようとしたときの警告を有効化する
     * 再読み込み, ページ移動, タブを閉じる, などの操作が該当する
     */
    $.enableCloseConfirm = () => {
        if (is_close_confirm_enabled) return;
        is_close_confirm_enabled = true;

        // Electron でない場合は簡単
        if (!$.isElectron()) {
            window.onbeforeunload = () => {
                return $.lang("confirm_beforeunload");
            };
            return;
        }

        // Electron の場合
        window.onbeforeunload = (e) => {
            // 【！】remote は deprecated
            const { remote } = require("electron");
            const win = remote.getCurrentWindow();
            const dialog = remote.dialog;
            const choice = dialog.showMessageBoxSync(win, {
                type: "warning",
                buttons: ["OK", "Cancel"],
                title: document.title,
                message: $.lang("confirm"),
                detail: $.lang("confirm_beforeunload"),
                defaultId: 0,
                cancelId: 1,
            });
            const leave = choice === 0;
            if (leave) {
                // void を返すとページの離脱が続行される
                return;
            }
            // true を返すとページの離脱がキャンセルされる
            return true;
        };
    };

    /**
     * タブを閉じようとしたときのコンファームを無効化する
     */
    $.disableCloseConfirm = () => {
        if (!is_close_confirm_enabled) return;
        is_close_confirm_enabled = false;
        window.onbeforeunload = null;
    };

    /**
     * 使用ディスプレイのリフレッシュレート(通常は 60)の計測を開始し
     * 計測が完了したらコールバックに結果を渡して実行する
     * @param {function} onfinish 計測終了時コールバック
     */
    const __measureRefreshRate = (onfinish) => {
        let previous_rate;
        let previous_time;
        let same_count = 0;
        const measure = (time) => {
            if (previous_time) {
                const rate = Math.round(1000 / (time - previous_time));
                if (previous_rate === rate) {
                    same_count++;
                    if (same_count > 10) {
                        if (onfinish) onfinish(rate);
                        return;
                    }
                } else {
                    same_count = 0;
                }
                previous_rate = rate;
            }
            previous_time = time;
            requestAnimationFrame(measure);
        };
        requestAnimationFrame(measure);
    };

    /**
     * __measureRefreshRate をラップしてリフレッシュレートを計測する
     * window.refreshRate にまず初期値として 60 を代入し、計測完了後に値を更新する
     * つまり window.refreshRate は定数ではなく時々刻々と変化しうる
     */
    const measureRefreshRate = () => {
        window.refreshRate = 60;
        __measureRefreshRate((rate) => {
            window.refreshRate = rate;
            // 60 以外であれば 3 秒後に測りなおす
            if (rate !== 60) {
                setTimeout(() => {
                    __measureRefreshRate((rate) => {
                        // 測りなおした
                        // 60 でなければ警告を出す
                        if (rate < 60) {
                            console.warn(`${rate} Hz: %cLow%c refresh rate of display detected.`, "font-weight: bold", "");
                        } else if (rate > 60) {
                            console.warn(`${rate} Hz: %cHigh%c refresh rate of display detected.`, "font-weight: bold", "");
                        }
                        window.refreshRate = rate;
                    });
                }, 3000);
            }
        });
    };

    // 計測を開始
    measureRefreshRate();

    /**
     * カンマ区切りあるいはスペース区切りの文字列を配列にして返す
     * - "10, 20, 30" => [ "10", "20", "30" ]
     * - "10 20 30" => [ "10", "20", "30" ]
     * @param {string} value
     * @returns {string[]}
     */
    $.splitCommaOrSpace = (value) => {
        value = value.trim().replace(/ +/g, " ");
        if (value.includes(","))
            return value.split(",").map((item) => {
                return item.trim();
            });
        if (value.includes(" ")) return value.split(" ");
        return [value];
    };

    /**
     * ティラノタグに指定された値をもとに margin を設定する
     * 10,20,10 のようなカンマ区切りの指定に対応する
     * @param {jQuery} j_elm
     * @param {string} length_str
     * @param {string} [prop="margin"]
     */
    $.fn.setMargin = function (length_str, prop = "margin") {
        if (this.length === 0) {
            return this;
        }
        const hash = length_str.split(",").map((length) => {
            return $.convertLength(length);
        });
        let top, bottom, left, right;
        switch (hash.length) {
            case 1:
                top = bottom = left = right = hash[0];
                break;
            case 2:
                top = bottom = hash[0];
                left = right = hash[1];
                break;
            case 3:
                top = hash[0];
                left = right = hash[1];
                bottom = hash[2];
                break;
            default:
            case 4:
                top = hash[0];
                bottom = hash[1];
                left = hash[2];
                right = hash[3];
                break;
        }
        const style = {};
        style[`${prop}-top`] = top;
        style[`${prop}-bottom`] = bottom;
        style[`${prop}-left`] = left;
        style[`${prop}-right`] = right;
        this.each((i, elm) => {
            $(elm).setStyleMap(style);
        });
        return this;
    };

    $.fn.setPadding = function (length_str) {
        return this.setMargin(length_str, "padding");
    };

    /**
     * ティラノタグのパラメータに指定された値を
     * 実際のCSSの width, height プロパティなどに設定できる値に変換する
     * - 文字列中に数値しか含まれていないなら "px" を足して返す
     * - それ以外はそのまま返す
     * @param {string} value
     * @returns {string}
     */
    $.convertLength = (value) => {
        value = value.trim();
        if (!value) return "";
        // 数値オンリーか？
        if (value.match(/^[0-9. +-]+$/)) {
            // 数値オンリーなら px を補完
            return value + "px";
        } else {
            // すでに単位が含まれているならそのまま返す
            return value;
        }
    };

    /**
     * ティラノタグのパラメータに指定された値を
     * 実際のCSSの font-weight プロパティに設定できる値に変換する
     * - "true" に対して "bold" を返す
     * - "false" に対して "normal" を返す
     * - それ以外はそのまま返す
     * @param {string} value
     * @returns {string}
     */
    $.convertFontWeight = (value) => {
        value = value.trim();
        if (value === "true") return "bold";
        if (value === "false") return "normal";
        return value;
    };

    /**
     * ティラノタグのパラメータに指定された値を
     * 実際のCSSの background-image プロパティに設定できる値に変換する
     * @param {string} value
     * @returns {string}
     */
    $.convertBackgroundImage = (value, folder) => {
        value = value.trim();
        if (value.includes("-gradient(")) return value;
        if (value.includes("url(")) return value;
        return `url(${$.parseStorage(value, folder)})`;
    };

    /**
     * ティラノタグのパラメータに指定された値を
     * 実際のCSSの background-position に設定できる値に変換する
     * @param {string} value
     * @returns {string}
     */
    $.convertBackgroundPosition = (value) => {
        value = value.trim().replace(/ +/g, " ");
        const hash = value.split(" ").map((item) => {
            return $.convertLength(item);
        });
        return hash.join(" ");
    };

    $.fn.showAtIndexWithVisibility = function (index) {
        return this.each(function (i) {
            if (i === index) {
                if (this.style.visibility !== "visible") {
                    this.style.visibility = "visible";
                }
            } else {
                if (this.style.visibility !== "hidden") {
                    this.style.visibility = "hidden";
                }
            }
        });
    };

    $.captureStackTrace = (str = "captured stack trace!") => {
        try {
            throw new Error(str);
        } catch (e) {
            console.warn(e);
        }
    };
})(jQuery);

// windowのloadイベントが発火済みかどうかを管理
window.isLoaded = false;
window.addEventListener("load", function () {
    window.isLoaded = true;
});
