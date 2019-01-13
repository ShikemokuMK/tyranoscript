//タグ総合管理　ゲーム全体の進捗も管理する
tyrano.plugin.kag.ftag = {

    tyrano : null,
    kag : null,

    array_tag : [], //命令タグの配列
    master_tag : {}, //使用可能なタグの種類
    current_order_index : -1, //現在の命令実行インデックス
    
    init : function() {

        // タグの種類を確定させる
        for (var order_type in tyrano.plugin.kag.tag) {

            this.master_tag[order_type] = object(tyrano.plugin.kag.tag[order_type]);
            this.master_tag[order_type].kag = this.kag;

        }

    },

    //命令を元に、命令配列を作り出します
    buildTag : function(array_tag, label_name) {

        this.array_tag = array_tag;

        //ラベル名が指定されている場合は
        if (label_name) {
            //そこへジャンプ
            this.nextOrderWithLabel(label_name);
        } else {
            this.nextOrderWithLabel("");
            //ここどうなんだろう
        }

    },

    buildTagIndex : function(array_tag, index, auto_next) {

        this.array_tag = array_tag;

        this.nextOrderWithIndex(index, undefined, undefined, undefined, auto_next);

    },

    //トランジション完了 だけにとどまらず、再生を強制的に再開させる
    completeTrans : function() {
        //処理停止中なら
        this.kag.stat.is_trans = false;
        if (this.kag.stat.is_stop == true) {
            this.kag.layer.showEventLayer();
            this.nextOrder();
        }
    },

    //次へボタンを隠します
    hideNextImg : function() {

        $(".img_next").remove();
        $(".glyph_image").hide();
    },
    
    showNextImg:function(){
        
        //グリフが指定されている場合はこちらを適用
        if (this.kag.stat.flag_glyph == "false") {
            $(".img_next").remove();
            var jtext = this.kag.getMessageInnerLayer()
            jtext.find("p").append("<img class='img_next' src='./tyrano/images/system/nextpage.gif' />");

        } else {
            $(".glyph_image").show();
        }


    },

    //次の命令を実行する
    nextOrder : function() {

        //基本非表示にする。
        this.kag.layer.layer_event.hide();

        var that = this;

        //[s]タグ。ストップするか否か
        if (this.kag.stat.is_strong_stop == true ) {
            return false;
        }
        
        if(this.kag.stat.is_adding_text == true){
            return false
        }
        

        try {

            this.current_order_index++;

            //ファイルの終端に着ている場合は戻す
            if (this.array_tag.length <= this.current_order_index) {
                this.kag.endStorage();
                return false;
            }

            var tag = $.cloneObject(this.array_tag[this.current_order_index]);

            this.kag.stat.current_line = tag.line;
            
            if(this.kag.is_rider){
               
                tag.ks_file = this.kag.stat.current_scenario;
                this.kag.rider.pushConsoleLog(tag);
                
            }else{
                this.kag.log("**:" + this.current_order_index + "　line:" + tag.line);
                this.kag.log(tag);
            }
            //前に改ページ指定が入っている場合はテキスト部分をクリアする
            if((tag.name=="call" && tag.pm.storage=="make.ks") || this.kag.stat.current_scenario=="make.ks"){
                //makeです
                //make中は基本、メッセージクリアを行わない
                if(this.kag.stat.flag_ref_page==true){
                    this.kag.tmp.loading_make_ref = true;
                    this.kag.stat.flag_ref_page = false;
                    
                }
                
            }else{
            
                if (this.kag.stat.flag_ref_page == true) {
    
                    this.kag.stat.flag_ref_page = false;
                    
                    //バックログ、画面クリア後は強制的に画面クリア
                    this.kag.stat.log_clear = true;
                
                    this.kag.ftag.hideNextImg();
    
                    this.kag.getMessageInnerLayer().html("");
    
                }
                
            }

            //タグを無視する
            if (this.checkCond(tag) != true) {
                this.nextOrder();
                return;
            }

            //メッセージ非表示状態の場合は、表示して、テキスト表示
            if (this.kag.stat.is_hide_message == true) {

                this.kag.layer.showMessageLayers();
                this.kag.stat.is_hide_message = false;

            }

            if (this.master_tag[tag.name]) {

                //この時点で、変数の中にエンティティがあれば、置き換える必要あり
                tag.pm = this.convertEntity(tag.pm);

                //必須項目チェック
                var err_str = this.checkVital(tag);
                
                //バックログに入れるかどうか。
                if(this.master_tag[tag.name].log_join){
                    
                    this.kag.stat.log_join = "true";
                    
                }else{
                    
                    if(tag.name=="text"){
                        //何もしない
                    }else{
                        this.kag.stat.log_join ="false";
                    }
                    
                }

                //クリック待ち解除フラグがたってるなら
                if (this.checkCw(tag)) {
                    this.kag.layer.layer_event.show();
                }

                if (err_str != "") {
                    this.kag.error(err_str);
                } else {

                    this.master_tag[tag.name].start($.extend(true, $.cloneObject(this.master_tag[tag.name].pm), tag.pm));
                }
                
                

            } else if (this.kag.stat.map_macro[tag.name]) {

                tag.pm = this.convertEntity(tag.pm);

                //マクロの場合、その位置へジャンプ
                var pms = tag.pm;
                var map_obj = this.kag.stat.map_macro[tag.name];

                //スタックに追加する
                //呼び出し元の位置

                var back_pm = {};
                back_pm.index = this.kag.ftag.current_order_index;
                back_pm.storage = this.kag.stat.current_scenario;
                back_pm.pm = pms;

                this.kag.stat.mp = pms;
                //参照用パラメータを設定

                this.kag.pushStack("macro", back_pm);

                this.kag.ftag.nextOrderWithIndex(map_obj.index, map_obj.storage);

            } else {
                //実装されていないタグの場合は、もう帰る
                $.error_message($.lang("tag")+"：[" + tag.name + "]"+$.lang("not_exists"));

                this.nextOrder();
            }

        } catch(e) {
            console.log(e);
            that.kag.error($.lang("error_occurred"));
        }

        //ラベルといった、先行してオンメモリにしておく必要が有る命令に関しては、ここで精査しておく

    },

    checkCw : function(tag) {

        var master_tag = this.master_tag[tag.name];

        if (master_tag.cw) {

            if (this.kag.stat.is_script != true && this.kag.stat.is_html != true && this.kag.stat.checking_macro != true) {
                return true;

            } else {
                return false;
            }

        } else {
            return false;
        }

    },

    //次のタグを実行。ただし、指定のタグの場合のみ
    nextOrderWithTag : function(target_tags) {

        try {

            this.current_order_index++;
            var tag = this.array_tag[this.current_order_index];

            //タグを無視する else if などの時に、condを評価するとおかしなことになる。
            if (this.checkCond(tag) != true) {
                //this.nextOrder();
                //return;
            }

            if (target_tags[tag.name] == "") {

                if (this.master_tag[tag.name]) {
                    
                    switch (tag.name) {
					case "elsif":
					case "else":
					case "endif":
						var root = this.kag.getStack("if");
						if (!root || tag.pm.deep_if != root.deep) return false;
					};
                    
                    //この時点で、変数の中にエンティティがあれば、置き換える必要あり
                    tag.pm = this.convertEntity(tag.pm);
                    this.master_tag[tag.name].start($.extend(true, $.cloneObject(this.master_tag[tag.name].pm), tag.pm));
                    return true;
                } else {
                    return false;
                }

            } else {
                return false;
            }

        } catch(e) {
            console.log(this.array_tag);
            return false;
        }

    },

    //要素にエンティティが含まれている場合は評価値を代入する
    convertEntity : function(pm) {

        var that = this;

        //もし、pmの中に、*が入ってたら、引き継いだ引数を全て、pmに統合させる。その上で実行

        if (pm["*"] == "") {
            //マクロ呼び出し元の変数から継承、引き継ぐ
            pm = $.extend(true, this.kag.stat.mp, $.cloneObject(pm));

        }

        //ストレージ要素が存在する場合、拡張子がついていなかったら、指定した拡張子を負荷する
        //ストレージ補完
        /*
         if(pm["storage"] && pm["storage"] != ""){
         pm["storage"] = $.setExt(pm["storage"],this.kag.config.defaultStorageExtension);
         }
         */

        for (key in pm) {

            var val = pm[key];

            var c = "";

            if (val.length > 0) {
                c = val.substr(0, 1);
            }
            if (val.length > 0 && c === "&") {

                pm[key] = this.kag.embScript(val.substr(1, val.length));

            } else if (val.length > 0 && c === "%") {

                var map_obj = this.kag.getStack("macro");
                //最新のコールスタックを取得

                // | で分けられていた場合、その値を投入

                //もし、スタックが溜まっている状態なら、
                if (map_obj) {

                    pm[key] = map_obj.pm[val.substr(1, val.length)];

                }

                //代替変数の代入処理
                var d = val.split("|");

                if (d.length == 2) {
                    //%〇〇の値が渡ってきているか調査
                    if (map_obj.pm[$.trim(d[0]).substr(1, $.trim(d[0]).length)]) {
                        pm[key] = map_obj.pm[$.trim(d[0]).substr(1, $.trim(d[0]).length)];
                    } else {
                        pm[key] = $.trim(d[1]);

                    }

                }
            }

        }

        return pm;

    },

    //必須チェック
    checkVital : function(tag) {

        var master_tag = this.master_tag[tag.name];

        var err_str = "";

        if (master_tag.vital) {

        } else {
            return "";
        }

        var array_vital = master_tag.vital;

        for (var i = 0; i < array_vital.length; i++) {
            if (tag.pm[array_vital[i]]) {

                //値が入っていなかった場合
                if (tag.pm[array_vital[i]] == "") {
                    err_str += "タグ「" + tag.name + "」にパラメーター「" + array_vital[i] + "」は必須です　\n";
                }

            } else {
                err_str += "タグ「" + tag.name + "」にパラメーター「" + array_vital[i] + "」は必須です　\n";
            }
        }

        return err_str;

    },

    //cond条件のチェック
    //条件が真の時だけ実行する
    checkCond : function(tag) {
        var pm = tag.pm;

        //cond属性が存在して、なおかつ、条件
        if (pm.cond) {
            var cond = pm.cond;
            //式の評価
            return this.kag.embScript(cond);
        } else {
            return true;
        }

    },

    //タグを指定して直接実行
    startTag : function(name, pm) {

        this.master_tag[name].start($.extend(true, $.cloneObject(this.master_tag[name].pm), pm));

    },

    //indexを指定して、その命令を実行
    //シナリオファイルが異なる場合
    nextOrderWithLabel : function(label_name, scenario_file) {

        this.kag.stat.is_strong_stop = false;
        
        //Jump ラベル記録が必要な場合に記録しておく
        if(label_name){
            
            if(label_name.indexOf("*")!=-1){
                label_name = label_name.substr(1,label_name.length);
            }
            this.kag.ftag.startTag("label",{"label_name":label_name,"nextorder":"false"});
        }
        
        //セーブスナップが指定された場合
        if (label_name == "*savesnap") {

            var tmpsnap = this.kag.menu.snap;

            var co = tmpsnap.current_order_index;
            var cs = tmpsnap.stat.current_scenario;

            this.nextOrderWithIndex(co, cs, undefined, undefined, "snap");
            //snap は noかつ、スナップで上書きする

            return;

        }

        var that = this;

        var original_scenario = scenario_file;

        label_name = label_name || "";
        scenario_file = scenario_file || this.kag.stat.current_scenario;

        label_name = label_name.replace("*", "");

        //シナリオファイルが変わる場合は、全く違う動きをする
        if (scenario_file != this.kag.stat.current_scenario && original_scenario != null) {

            this.kag.layer.hideEventLayer();

            this.kag.loadScenario(scenario_file, function(array_tag) {
                that.kag.layer.showEventLayer();
                that.kag.ftag.buildTag(array_tag, label_name);

            });

        }else{

            //ラベル名が指定されてない場合は最初から
            if (label_name == "") {
    
                this.current_order_index = -1;
                this.nextOrder();
    
            } else if (this.kag.stat.map_label[label_name]) {
    
                var label_obj = this.kag.stat.map_label[label_name];
                this.current_order_index = label_obj.index;
                this.nextOrder();
    
            } else {
    
                $.error_message($.lang("label")+"：'" + label_name + "'"+$.lang("not_exists"));
    
                this.nextOrder();
    
            }
        }

    },

    //次の命令へ移動　index とストレージ名を指定する
    nextOrderWithIndex : function(index, scenario_file, flag, insert, auto_next) {

        this.kag.stat.is_strong_stop = false;
        this.kag.layer.showEventLayer();

        var that = this;

        flag = flag || false;
        auto_next = auto_next || "yes";

        scenario_file = scenario_file || this.kag.stat.current_scenario;

        //alert(scenario_file + ":" + this.kag.stat.current_scenario);

        //シナリオファイルが変わる場合は、全く違う動きをする
        if (scenario_file != this.kag.stat.current_scenario || flag == true) {

            this.kag.layer.hideEventLayer();

            this.kag.loadScenario(scenario_file, function(tmp_array_tag) {
                var array_tag = $.extend(true, [], tmp_array_tag);
                if ( typeof insert == "object") {
                    
                    array_tag.splice(index + 1, 0, insert);
                    
                }

                that.kag.layer.showEventLayer();
                that.kag.ftag.buildTagIndex(array_tag, index, auto_next);

            });

        }else{
    
            //index更新
            this.current_order_index = index;
    
            if (auto_next == "yes") {
                this.nextOrder();
            } else if (auto_next == "snap") {
                //ストロングの場合、すすめないように
                this.kag.stat.is_strong_stop = this.kag.menu.snap.stat.is_strong_stop;
    
                //スキップフラグが立っている場合は進めてくださいね。
                if (this.kag.stat.is_skip == true && this.kag.stat.is_strong_stop == false) {
                    this.kag.ftag.nextOrder();
                }
    
            } else if (auto_next == "stop") {
    
                //[s]タグで終わった人が登場してきた時
                //this.kag.stat.is_strong_stop = true;
                //レイヤイベントレイヤ非表示。
                //this.current_order_index--;
                this.kag.ftag.startTag("s",{"val":{}});
                
            }
            
        }

    }
};

//タグを記述していく
tyrano.plugin.kag.tag.text = {

    //vital:["val"], //必須のタグ

    cw : true,
    
    //初期値
    pm : {

        "val" : "",
        "backlog":"add" /*バックログ用の文字列。改行するかどうか。add join */

    },

    //実行
    start : function(pm) {

        //スクリプト解析状態の場合は、その扱いをする
        if (this.kag.stat.is_script == true) {

            this.kag.stat.buff_script += pm.val + "\n";
            this.kag.ftag.nextOrder();
            return;

        }

        //HTML解析状態の場合
        if (this.kag.stat.is_html == true) {

            this.kag.stat.map_html.buff_html += pm.val;
            this.kag.ftag.nextOrder();
            return;

        }

        var j_inner_message = this.kag.getMessageInnerLayer();

        //文字ステータスの設定        
        j_inner_message.css({
            "letter-spacing":this.kag.config.defaultPitch + "px",
            "line-height":parseInt(this.kag.config.defaultFontSize) + parseInt(this.kag.config.defaultLineSpacing) + "px",
            "font-family":this.kag.config.userFace
       });

        //現在表示中のテキストを格納
        this.kag.stat.current_message_str = pm.val;

        //縦書き指定の場合
        if (this.kag.stat.vertical == "true") {

            //自動改ページ無効の場合
            if (this.kag.config.defaultAutoReturn != "false") {

                //テキストエリアの横幅が、一定以上いっていたばあい、テキストをクリアします
                var j_outer_message = this.kag.getMessageOuterLayer();

                var limit_width = parseInt(j_outer_message.css("width")) * 0.8;
                var current_width = parseInt(j_inner_message.find("p").css("width"));

                if (current_width > limit_width) {
                    this.kag.getMessageInnerLayer().html("");
                }

            }

            this.showMessage(pm.val,pm,true);

        } else {

            if (this.kag.config.defaultAutoReturn != "false") {

                //テキストエリアの高さが、一定以上いっていたばあい、テキストをクリアします
                var j_outer_message = this.kag.getMessageOuterLayer();

                var limit_height = parseInt(j_outer_message.css("height")) * 0.8;
                var current_height = parseInt(j_inner_message.find("p").css("height"));

                if (current_height > limit_height) {

                    //画面クリア
                    this.kag.getMessageInnerLayer().html("");
					
                }

            }
            
            
            this.showMessage(pm.val,pm,false);

        }

        //this.kag.ftag.nextOrder();

    },

    showMessage : function(message_str,pm,isVertical) {
        var that = this;
        
        //特定のタグが直前にあった場合、ログの作り方に気をつける
        if(that.kag.stat.log_join=="true"){
            pm.backlog="join";
        }
        
        //バックログ用の値を格納
        var chara_name = $.isNull($(".chara_name_area").html());
        if((chara_name != "" && pm.backlog!="join") || (chara_name!="" && this.kag.stat.f_chara_ptext=="true")){
            
            this.kag.pushBackLog("<b class='backlog_chara_name "+chara_name+"'>"+chara_name+"</b>：<span class='backlog_text "+chara_name+"'>"+message_str+"</span>","add");
            
            if(this.kag.stat.f_chara_ptext=="true"){
                this.kag.stat.f_chara_ptext="false";
                this.kag.stat.log_join = "true";
            }
            
        }else{
            
            var log_str = "<span class='backlog_text "+chara_name+"'>"+ message_str +"</span>";
            
            if(pm.backlog=="join"){
                this.kag.pushBackLog(log_str,"join");
            }else{
                this.kag.pushBackLog(log_str,"add");
                
            }
        }

        //テキスト表示時に、まず、画面上の次へボタンアイコンを抹消
        that.kag.ftag.hideNextImg();

        (function(jtext) {

            if (jtext.html() == "") {
                //タグ作成
                if (isVertical) {
                    jtext.append("<p class='vertical_text'></p>");
                } else {
                    jtext.append("<p class=''></p>");
                }
            }

            var current_str = "";

            if (jtext.find("p").find(".current_span").length != 0) {

                current_str = jtext.find("p").find(".current_span").html();

            }

            that.kag.checkMessage(jtext);

            //メッセージ領域を取得
            var j_span = that.kag.getMessageCurrentSpan();
            

            j_span.css({
                        "color":that.kag.stat.font.color,
                        "font-weight": that.kag.stat.font.bold,
                        "font-size": that.kag.stat.font.size + "px",
                        "font-family": that.kag.stat.font.face,
                        "font-style":that.kag.stat.font.italic
                        });
                        
            
            
            if(that.kag.stat.font.edge !=""){
            
                var edge_color = that.kag.stat.font.edge;
                j_span.css("text-shadow","1px 1px 0 "+edge_color+", -1px 1px 0 "+edge_color+",1px -1px 0 "+edge_color+",-1px -1px 0 "+edge_color+"");
            
            }else if(that.kag.stat.font.shadow != ""){
                //j_span.css()
                j_span.css("text-shadow","2px 2px 2px "+that.kag.stat.font.shadow);
            }
            
            
            //既読管理中の場合、現在の場所が既読済みなら、色を変える 
            if(that.kag.config.autoRecordLabel == "true"){
                
                if(that.kag.stat.already_read == true){
                    //テキストの色調整
                    if(that.kag.config.alreadyReadTextColor !="default"){
                        j_span.css("color",$.convertColor(that.kag.config.alreadyReadTextColor));
                    }
                    
                }else{
                    //未読スキップがfalseの場合は、スキップ停止
                    if(that.kag.config.unReadTextSkip == "false"){
                        that.kag.stat.is_skip = false;
                    }
                }
                
            }
            
            var ch_speed = 30;
            
            if(that.kag.stat.ch_speed != ""){
                ch_speed = parseInt(that.kag.stat.ch_speed);
            }else if(that.kag.config.chSpeed){
                ch_speed = parseInt(that.kag.config.chSpeed);
            }
            
            var append_str = "";
            for (var i = 0; i < message_str.length; i++) {
                var c = message_str.charAt(i);
                //ルビ指定がされている場合
                if (that.kag.stat.ruby_str != "") {
                    c = "<ruby><rb>" + c + "</rb><rt>" + that.kag.stat.ruby_str + "</rt></ruby>";
                    that.kag.stat.ruby_str = "";
                }

                append_str += "<span style='visibility: hidden'>" + c + "</span>";
            }
            current_str += "<span>" + append_str + "</span>";

            // hidden状態で全部追加する
            that.kag.appendMessage(jtext, current_str);
            var append_span = j_span.children('span:last-child');
            var makeVisible = function(index) {
                append_span.children("span:eq(" + index + ")").css('visibility', 'visible');
            };
            var makeVisibleAll = function() {
                append_span.children("span").css('visibility', 'visible');
            };

            var pchar = function(index) {
                // 一文字ずつ表示するか？
                var isOneByOne = (
                    that.kag.stat.is_skip != true
                    && that.kag.stat.is_nowait != true
                    && ch_speed >= 3
                );

                if (isOneByOne) {
                    makeVisible(index);
                }
                
                if (index <= message_str.length) {

                    that.kag.stat.is_adding_text = true;

                    //再生途中にクリックされて、残りを一瞬で表示する
                    if (that.kag.stat.is_click_text == true || that.kag.stat.is_skip == true || that.kag.stat.is_nowait == true) {
                        pchar(++index);
                    } else {
                        setTimeout(function() {
                            pchar(++index);
                        }, ch_speed);
                    }
                } else {

                    that.kag.stat.is_adding_text = false;
                    that.kag.stat.is_click_text = false;
                    
                    
                    //すべて表示完了 ここまではイベント残ってたな

                    if (that.kag.stat.is_stop != "true") {
                        if(!isOneByOne){
                            makeVisibleAll();
                            setTimeout(function(){
                                if (!that.kag.stat.is_hide_message) that.kag.ftag.nextOrder();
                            }, parseInt(that.kag.config.skipSpeed));
                            
                        }else{
                            if (!that.kag.stat.is_hide_message) that.kag.ftag.nextOrder();
                        }
                    }
                }
            };

            pchar(0);

        })(this.kag.getMessageInnerLayer());
    },

    nextOrder : function() {

    },

    test : function() {

    }
};

tyrano.plugin.kag.tag.label = {

  pm:{
      nextorder:"true"
  },
  
  start:function(pm){
    //ラベル通過したよ。
    
    //ラベル記録
    if(this.kag.config.autoRecordLabel == "true"){
        
        var sf_tmp = "trail_"+this.kag.stat.current_scenario.replace(".ks","").replace(/\u002f/g, "").replace(/:/g,"").replace(/\./g,"");
        var sf_buff = this.kag.stat.buff_label_name;
        var sf_label = sf_tmp+"_"+ pm.label_name;
        
        if(this.kag.stat.buff_label_name!=""){
            
            if(!this.kag.variable.sf.record){
                    this.kag.variable.sf.record = {};
            }
            
            var sf_str = "sf.record."+sf_buff;
            
            var scr_str = ""
            + sf_str +" = "+sf_str+"  || 0;"
            + sf_str +"++;";
            this.kag.evalScript(scr_str);
        
        }
        
        if(this.kag.variable.sf.record){
            if(this.kag.variable.sf.record[sf_label]){
                //すでにこのラベル通過済みよ
                this.kag.stat.already_read = true;
            }else{
                this.kag.stat.already_read = false;
            }
        }
        
        //pm.label_name を stat に配置して、次のラベルで記録とする
        this.kag.stat.buff_label_name = sf_label;
    }
    
    //ラベル記録の時はNextOrderしない
    if(pm.nextorder == "true"){
        this.kag.ftag.nextOrder();
    }
    
  }
    
};


/*
#[config_record_label]

:group
システム操作
:title
既読管理の設定

:exp
既読管理に関する設定を変更できます

:sample
:param
color=既読時のテキスト色を0x000000形式で指定してください,
skip=未読スキップをの有効(true)、無効(false)を指定します。つまりfalseを指定すると、未読文章で止まります。
#[end]

*/

tyrano.plugin.kag.tag.config_record_label = {

    pm : {
        color : "",
        skip  : ""
    },

    start : function(pm) {
        
        var that = this;
        
        if (pm.color != "") {
            this.kag.config.alreadyReadTextColor = pm.color;
            this.kag.ftag.startTag("eval", {"exp":"sf._system_config_already_read_text_color = "+pm.color});
        }
        
        if (pm.skip != "") {
            if(pm.skip=="true"){
                this.kag.config.unReadTextSkip = "true";
            }else{
                this.kag.config.unReadTextSkip = "false";
            }
            
            this.kag.ftag.startTag("eval", {"exp":"sf._system_config_unread_text_skip = '"+pm.skip+"'"});
        }
        
        this.kag.ftag.nextOrder();    
        
    }
};


/*
#[l]

:group
メッセージ関連
:title
クリック待ち

:exp
このタグの位置でクリック待ちを行います。

:sample
テキスト表示[l]
テキスト表示[l][r]
:param
#[end]

*/

//[l] クリック待ち
tyrano.plugin.kag.tag.l = {

    cw : true,

    start : function() {
        
        var that = this;
        
        this.kag.ftag.showNextImg();
        
        //クリックするまで、次へすすまないようにする
        if (this.kag.stat.is_skip == true) {
            //スキップ中の場合は、nextorder
            this.kag.ftag.nextOrder();
            
        }else if(this.kag.stat.is_auto == true){
            
            this.kag.stat.is_wait_auto = true;
            
            var auto_speed = that.kag.config.autoSpeed;
            if(that.kag.config.autoSpeedWithText != "0"){
                var cnt_text = this.kag.stat.current_message_str.length;
                auto_speed = parseInt(auto_speed) + (parseInt(that.kag.config.autoSpeedWithText)*cnt_text);
            }
            
            setTimeout(function(){
                
                if(that.kag.stat.is_wait_auto == true){
                    //ボイス再生中の場合は、オートで次に行かない。効果音再生終了後に進めるためのフラグを立てる
                    
                    if(that.kag.tmp.is_vo_play==true){
                        that.kag.tmp.is_vo_play_wait = true;
                    }else{
                        that.kag.ftag.nextOrder();
                    }
                }
                
            }, auto_speed);
            
        }
        
    }
};

/*
#[p]

:group
メッセージ関連
:title
改ページクリック待ち

:exp
改ページをともなうクリック待ちで使用できます

:sample
テキスト表示[p]
テキスト表示[p][r]
:param

#[end]

*/

//[p] 改ページクリック待ち
tyrano.plugin.kag.tag.p = {

    cw : true,

    start : function() {
        
        var that = this;
        //改ページ
        this.kag.stat.flag_ref_page = true;
        
        this.kag.ftag.showNextImg();
            
        if (this.kag.stat.is_skip == true) {
            //スキップ中の場合は、nextorder
            this.kag.ftag.nextOrder();
        }else if(this.kag.stat.is_auto == true){
            
            this.kag.stat.is_wait_auto = true;
            
            var auto_speed = that.kag.config.autoSpeed;
            if(that.kag.config.autoSpeedWithText != "0"){
                var cnt_text = this.kag.stat.current_message_str.length;
                auto_speed = parseInt(auto_speed) + (parseInt(that.kag.config.autoSpeedWithText)*cnt_text);
            }
            
            setTimeout(function(){
                if(that.kag.stat.is_wait_auto == true){
                    
                    
                    //ボイス再生中の場合は、オートで次に行かない。効果音再生終了後に進めるためのフラグを立てる
                    if(that.kag.tmp.is_vo_play==true){
                        that.kag.tmp.is_vo_play_wait = true;
                    }else{
                        that.kag.ftag.nextOrder();
                    }
                }
            }, auto_speed);
            
        }
    }
};

/*
 #[graph]
 :group
 メッセージ関連
 :title
 インライン画像表示
 :exp
 任意の画像をメッセージ中に表示します。
 絵文字や特殊文字などに活用できます。
 表示させる画像はimageフォルダに配置して下さい

 また、よく使う記号については、マクロを組んでおくと楽です。

 :sample
 ; heart にはハートマークの画像
 [macro name="heart"][graph storage="heart.png"][endmacro]

 ; 以後、[heart] タグでハートマークを使用可能
 大好き[heart]
 :param
 storage=表示する画像ファイル名を指定します

 #[end]

 */

tyrano.plugin.kag.tag.graph = {

    vital : ["storage"],

    pm : {
        storage : null
    },

    //開始
    start : function(pm) {

        var jtext = this.kag.getMessageInnerLayer();

        var current_str = "";

        if (jtext.find("p").find(".current_span").length != 0) {
            current_str = jtext.find("p").find(".current_span").html();
        }

        var storage_url = "";

        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        } else {
            storage_url = "./data/image/" + pm.storage;
        }

        //テキストエリアに画像を追加して、次のメッセージへ晋
        this.kag.appendMessage(jtext, current_str + "<img src='" + storage_url + "' >");

        this.kag.ftag.nextOrder();

    }
};

/*

#[jump]
:group
ラベル・ジャンプ操作
:title
シナリオのジャンプ
:exp
指定されたファイルの指定されたラベルに移動します
callとの違いは、jumpはコールスタックに残りません。つまり、一方通行です。ラベルの指定は必須です。
:sample

; second.ks というシナリオファイルの　*start　ラベルへ移動する
[jump storage=second.ks target=*start]

:param
storage=移動するシナリオファイル名を指定します。省略された場合は現在のシナリオファイルと見なされます,
target=ジャンプ先のラベル名を指定します。省略すると先頭から実行されます

#[end]

*/

//ジャンプ命令
tyrano.plugin.kag.tag.jump = {

    pm : {
        storage : null,
        target : null, //ラベル名
        countpage : true
    },

    start : function(pm) {

        var that = this;
        //ジャンプ直後のwt などでフラグがおかしくなる対策
        setTimeout(function(){
            that.kag.ftag.nextOrderWithLabel(pm.target, pm.storage);
        },1);

    }
};

/*
#[r]
:group
メッセージ関連
:title
改行する
:exp
改行します
:sample
テキスト表示[l]
改行します[l][r]
改行します[l][r]
:param

#[end]
*/

//改行を挿入
tyrano.plugin.kag.tag.r = {

    log_join:"true",
    
    start : function() {
        
        var that = this;
        //クリックするまで、次へすすまないようにする
        var j_inner_message = this.kag.getMessageInnerLayer();

        var txt = j_inner_message.find("p").find(".current_span").html() + "<br />";
        j_inner_message.find("p").find(".current_span").html(txt);
        
        setTimeout(function(){
            that.kag.ftag.nextOrder();
        },5);
    }
};

/*
 #[er]
 :group
 メッセージ関連
 :title
 メッセージレイヤの文字の消去
 :exp
 現在の操作対象メッセージレイヤ(current指定)の文字を消去します。
 :sample
 テキスト表示[l]
 メッセージをクリアします[l][er]
 改行します[l][r]
 :param

 #[end]
 */

tyrano.plugin.kag.tag.er = {

    start : function() {

        this.kag.ftag.hideNextImg();
        //フォントのリセット
        //カレントレイヤのみ削除
        this.kag.getMessageInnerLayer().html("");

        this.kag.ftag.startTag("resetfont");

        //this.kag.ftag.nextOrder();

    }
};

/*
#[cm]
:group
メッセージ関連
:title
すべてのメッセージレイヤをクリア
:exp
すべてのメッセージレイヤをクリアします。
また、フォントスタイルなどもデフォルトの設定に戻ります。
ただし、positionやlayoptで指定した値は引き継がれます
[ct]タグのように 操作対象のメッセージレイヤが表ページの message0 に指定されるようなことはありません。 このタグを実行後も操作対象のレイヤは同じです。

:sample
テキスト表示[l]
画面クリアする[l][cm]
もう一度画面クリアする[l][cm]
:param

#[end]
*/

//画面クリア
tyrano.plugin.kag.tag.cm = {

    start : function() {

        this.kag.ftag.hideNextImg();
        //フォントのリセット
        //カレントレイヤだけじゃなくて、全てもメッセージレイヤを消去する必要がある
        this.kag.layer.clearMessageInnerLayerAll();
        
        this.kag.stat.log_clear = true;
        
        //フリーレイヤ消去
        this.kag.layer.getFreeLayer().html("").hide();

        this.kag.ftag.startTag("resetfont");

    }
};

/*
 #[ct]
 :group
 メッセージ関連
 :title
 すべてのメッセージレイヤをリセット
 :exp

 メッセージレイヤをリセットします。
 すべてのメッセージレイヤの文字は消去され、操作対象のメッセージレイヤは 表ページの message0 に指定されます。
 font タグで指定した文字の属性、style タグ で指定したスタイルはすべて標準状態に戻ります。ただ し、position タグ や layopt タグで指定した属性は引き継が れます。

 :sample
 テキスト表示[l]
 画面クリアする[l][ct]
 もう一度画面クリアする[l][ct]
 :param

 #[end]
 */

tyrano.plugin.kag.tag.ct = {

    start : function() {

        this.kag.ftag.hideNextImg();

        //フォントのリセット
        //カレントレイヤだけじゃなくて、全てもメッセージレイヤを消去する必要がある
        this.kag.layer.clearMessageInnerLayerAll();

        //フリーレイヤ消去
        this.kag.layer.getFreeLayer().html("").hide();

        this.kag.stat.current_layer = "message0";
        this.kag.stat.current_page = "fore";

        this.kag.ftag.startTag("resetfont");

    }
};

/*
#[current]
:group
メッセージ関連
:title
操作対象のメッセージレイヤの指定
:exp
操作対象とするメッセージレイヤを指定します。以後、文章や font タグでの文字属性の指定、l タグ等のクリック待ちなどは、このレイヤに対して行われます。
message0はデフォルトで可視の状態で すが、message1 は layopt タグ 等で visible=true としないと表示されないので注意してください。
:sample
[current layer="message0"]
message0レイヤに表示されています[l]
[current layer="message1"]
message1レイヤに表示されています[l]
:param
layer=操作対象のメッセージレイヤを指定します。指定がない場合、現在のメッセージレイヤとみなされます,
page=表画面を対象とするか、裏画面を対象とするかを指定します。省略すると表ページとみなされます
#[end]
*/

//メッセージレイヤの指定
tyrano.plugin.kag.tag.current = {

    pm : {
        layer : "",
        page : "fore"
    },

    start : function(pm) {

        //layer指定がない場合は、現在のレイヤを採用
        if (pm.layer == "") {
            pm.layer = this.kag.stat.current_layer;
        }

        this.kag.stat.current_layer = pm.layer;
        this.kag.stat.current_page = pm.page;

        this.kag.ftag.nextOrder();

    }
};

//メッセージレイヤの属性を変更します

/*
 #[position]
 :group
 レイヤ関連
 :title
 メッセージレイヤの属性変更
 :exp
 メッセージレイヤに対する様々な属性を指定します。<br />
 いずれの属性も、省略すれば設定は変更されません。
 :sample
 ;メッセージレイヤの位置とサイズを変更
 [position width=400 height=300 top=100 left=20]
 ;メッセージレイヤの色と透明度を変更
 [position color=blue opacity=100]
 :param
 layer=対象とするメッセージレイヤを指定します。<br/>省略するとcurrentタグで指定されたレイヤが選択されます,
 page=対象とするページを指定します。"fore"か"back"を指定して下さい。<br>この属性を省略するとcurrentタグで指定された、現在のページが選択されます。,
 left=メッセージレイヤの左端位置を指定します。（ピクセル）,
 top=メッセージレイヤの上端位置を指定します。（ピクセル）,
 width=メッセージレイヤの幅を指定します。（ピクセル）,
 height=メッセージレイヤの高さを指定します。（ピクセル）,
 frame=メッセージレイヤのフレーム画像として表示させる画像を指定します。<br>メッセージエリアをカスタマイズしたい場合に利用できます。<br />画像サイズはwidthとheight属性に準じて調整して下さい。<br />さらに、margin属性で実際にメッセージが表示される箇所の調整も行いましょう<br />また、"none"と指定することで標準枠に戻すこともできます。違う枠画像をしていすると切り替えることもできます,
 color=メッセージレイヤの表示色を 0xRRGGBB 形式で指定 します。 ,
 opacity=メッセージレイヤの不透明度を 0 ～ 255 の数値で指定しま す(文字の不透明度や、レイヤ自体の不透明度ではありません)。0 で完全 に透明です。,
 marginl=メッセージレイヤの左余白を指定します。,
 margint=メッセージレイヤの上余白を指定します。,
 marginr=メッセージレイヤの右余白を指定します。,
 marginb=メッセージレイヤの下余白を指定します。,
 vertical=メッセージレイヤを縦書きにモードにするには "true" を指定します。 横書きにするには "false" を指定してください。,
 visible=true に設定すると、メッセージレイヤが可視(表示状態)になります。<br >false に設定すると、メッセージレイヤは不可視(非表示状態)になります。
 #[end]
 */
tyrano.plugin.kag.tag.position = {

    pm : {

        layer : "message0",
        page : "fore",
        left : "",
        top : "",
        width : "",
        height : "",
        color : "",
        opacity : "",
        vertical : "",
        frame : "",
        marginl : "0", //左余白
        margint : "0", //上余白
        marginr : "0", //右余白
        marginb : "0" //下余白

    },

    start : function(pm) {

        //指定のレイヤを取得
        var target_layer = this.kag.layer.getLayer(pm.layer, pm.page).find(".message_outer");

        var new_style = {};
        
        if(pm.left!="")
            new_style["left"] = pm.left+"px";
        if(pm.top!="")
            new_style["top"] = pm.top+"px";
        if(pm.width!="")
            new_style["width"] = pm.width+"px";
        if(pm.height!="")
            new_style["height"] = pm.height+"px";
        if(pm.color !="")
            new_style["background-color"] = $.convertColor(pm.color);

        

        //背景フレーム画像の設定 透明度も自分で設定する

        if (pm.frame == "none") {

            target_layer.css("opacity", $.convertOpacity(this.kag.config.frameOpacity));
            target_layer.css("background-image", "");
            target_layer.css("background-color", $.convertColor(this.kag.config.frameColor));

        } else if (pm.frame != "") {

            var storage_url = "";

            if ($.isHTTP(pm.frame)) {
                storage_url = pm.frame;
            } else {
                storage_url = "./data/image/" + pm.frame + "";
            }

            target_layer.css("background-image", "url(" + storage_url + ")");
            target_layer.css("background-repeat", "no-repeat");
            target_layer.css("opacity", 1);
            target_layer.css("background-color", "");

        }

        if (pm.opacity != "") {
            target_layer.css("opacity", $.convertOpacity(pm.opacity));
        }

        //outer のレイヤを変更
        this.kag.setStyles(target_layer, new_style);

        //複数のレイヤに影響がでないように。
        this.kag.layer.refMessageLayer(pm.layer);
        
        //message_inner のスタイルを変更する必要もある

        var layer_inner = this.kag.layer.getLayer(pm.layer, pm.page).find(".message_inner");
        
        //縦書き指定
        if(pm.vertical !=""){
            if (pm.vertical == "true") {
                this.kag.stat.vertical = "true";
                layer_inner.find("p").addClass("vertical_text");
            } else {
                this.kag.stat.vertical = "false";
                layer_inner.find("p").removeClass("vertical_text");
            }
        }
        
        
        var new_style_inner = {};

        /*
         var new_style_inner = {

         "padding-left":parseInt(pm.marginl)+"px", //左余白
         "padding-top":parseInt(pm.margint)+"px", //上余白
         "width":parseInt(layer_inner.css("width")) - parseInt(pm.marginr)+"px", //右余白
         "height":parseInt(layer_inner.css("height")) - parseInt(pm.marginb)+"px" //下余白

         };
         */
        

        if (pm.marginl != "0")
            new_style_inner["padding-left"] = parseInt(pm.marginl) + "px";
        if (pm.margint != "0")
            new_style_inner["padding-top"] = parseInt(pm.margint) + "px";
        if (pm.marginr != "0")
            new_style_inner["width"] = (parseInt(layer_inner.css("width")) - parseInt(pm.marginr) - parseInt(pm.marginl)) + "px";
        if (pm.marginb != "0")
            new_style_inner["height"] = (parseInt(layer_inner.css("height")) - parseInt(pm.marginb)) - parseInt(pm.margint) + "px";
        
        
        this.kag.setStyles(layer_inner, new_style_inner);

        //this.kag.layer.updateLayer(pm.layer,pm.page,this.kag.layer.getLayer(pm.layer,pm.page));

        //レイヤーをリフレッシュする

        this.kag.ftag.nextOrder();

    }
};

/*
#[image]
:group
レイヤ関連
:title
画像を表示
:exp
レイヤに画像を表示します。キャラクター表示や背景切り替えなどに使用できます。前景レイヤは初期状態では非表示なのでvisible=trueとすることで表示されます
:sample
;背景変更をトランジションで実施
@layopt layer=message0 visible=false
[backlay]
[image layer=base page=back storage=rouka.jpg]
[trans time=2000]
[wt]
@layopt layer=message0 visible=true
:param
storage=画像ファイル名を指定します。ファイルは背景レイヤならプロジェクトフォルダのbgimage、前景レイヤならfgimageに入れてください,
layer=対象とするメレイヤを指定します。<br/>"base"を指定すると背景レイヤ。0以上の整数を指定すると対応する前景レイヤに画像を表示します,
page=対象とするページを指定します。"fore"か"back"を指定して下さい。<br>この属性を省略すると"fore"であるとみなされます,
visible=true or false を指定。imageは通常、非表示で始まるが、trueを指定すると最初から表示状態にできる。,
left=画像の左端位置を指定します。（ピクセル）,
top=画像の上端位置を指定します。（ピクセル）,
x=画像の左端位置を指定します。leftと同様。こちらが優先度高（ピクセル）,
y=画像の上端位置を指定します。topと同様。こちらが優先度高（ピクセル）,
width=画像の横幅を指定します。（ピクセル）,
height=画像の高さ位置を指定します。（ピクセル）,
folder=好きな画像フォルダから、画像を選択できます。通常前景レイヤはfgimage　背景レイヤはbgimageと決まっていますが、ここで記述したフォルダ以下の画像ファイルを使用することができるようになります。,
name=ティラノスクリプトのみ。animタグなどからこの名前でアニメーションさせることができます。でまた名前を指定しておくとクラス属性としてJSから操作できます。カンマで区切ることで複数指定することもできます,
time=ミリ秒を指定することで、徐々にイメージを表示させることができます。,
wait=falseを指定すると、画像が表示されるのを待たずに、処理を進め明日。デフォルトはtrue,
zindex=画像同士の重なりを指定できます。数値が大きい方が前に表示されます,
pos=レイヤ位置を自動的に決定します。前景レイヤに対して使います。横方向の位置は、この属性で指定した left ( 左端 ) 、left_center ( 左より )、center ( 中央 )、 right_center ( 右より )、right ( 右端 ) の位置に表示されます。各横方向の座標の中心 位置は Config.tjs で指定することができます。
<br>left 、left_center、 center、 right_center、 right の代わりに、それぞれ l、 lc、 c、 rc、 r を 指定することもできます ( 動作は同じです )。
<br>この属性を指定した場合は left 属性や top 属性は無視されます。
<br>layerをbase と指定した場合にはこの属性は指定しないでください。各々の表示位置はConfig.tjsで事前に設定しておきましょう
#[end]
*/

//タグを記述していく
//[image layer=base page=fore storage=haikei.jpg visible=true]
tyrano.plugin.kag.tag.image = {

    pm : {

        "layer" : "base",
        "page" : "fore",
        "visible" : "",
        "top" : "",
        "left" : "",
        "x" : "",
        "y" : "",
        "width" : "",
        "height" : "",
        "pos" : "",
        "name" : "",
        "folder" : "", //画像フォルダを明示できる
        "time" : "",
        "wait": "true",
        "zindex": "1"
        //"visible":"true"

    },

    start : function(pm) {

        var strage_url = "";
        var folder = "";
        var that = this;
        
        if (pm.layer != "base") {

            //visible true が指定されている場合は表示状態に持っていけ
            //これはレイヤのスタイル
            var layer_new_style = {};

            //デフォルト非表示 バックの場合も非表示ですよ。
            if (pm.visible == "true" && pm.page == "fore") {
                layer_new_style.display = "block";
            }

            this.kag.setStyles(this.kag.layer.getLayer(pm.layer, pm.page), layer_new_style);

            //ポジションの指定
            if (pm.pos != "") {

                switch(pm.pos) {

                    case "left":
                    case "l":
                        pm.left = this.kag.config["scPositionX.left"];
                        break;

                    case "left_center":
                    case "lc":
                        pm.left = this.kag.config["scPositionX.left_center"];
                        break;

                    case "center":
                    case "c":
                        pm.left = this.kag.config["scPositionX.center"];
                        break;

                    case "right_center":
                    case "rc":
                        pm.left = this.kag.config["scPositionX.right_center"];
                        break;

                    case "right":
                    case "r":
                        pm.left = this.kag.config["scPositionX.right"];
                        break;

                }

            }

            if (pm.folder != "") {
                folder = pm.folder;
            } else {
                folder = "fgimage";
            }

            //前景レイヤ
            if ($.isHTTP(pm.storage)) {
                strage_url = pm.storage;
            } else {
                strage_url = "./data/" + folder + "/" + pm.storage;
            }

            var img_obj = $("<img />");
            img_obj.attr("src", strage_url);

            img_obj.css("position", "absolute");
            img_obj.css("top", pm.top + "px");
            img_obj.css("left", pm.left + "px");

            if (pm.width != "") {
                img_obj.css("width", pm.width + "px");
            }

            if (pm.height != "") {
                img_obj.css("height", pm.height + "px");
            }

            if (pm.x != "") {
                img_obj.css("left", pm.x + "px");
            }

            if (pm.y != "") {
                img_obj.css("top", pm.y + "px");
            }
            
            if(pm.zindex != ""){
                img_obj.css("z-index",pm.zindex);
            }

            //オブジェクトにクラス名をセットします
            $.setName(img_obj, pm.name);
            
            if (pm.time == 0 || pm.time=="0") pm.time = ""; // integer 0 and string "0" are equal to ""
            if(pm.time != ""){
        
                img_obj.css("opacity",0);
                this.kag.layer.getLayer(pm.layer, pm.page).append(img_obj);
                
                img_obj.animate(
                    {"opacity":1},
                    parseInt(pm.time), 
                    function(){
                        if(pm.wait=="true"){
                            that.kag.ftag.nextOrder();
                        }
                    }
                );
                
                if(pm.wait !="true"){
                    that.kag.ftag.nextOrder();
                }
                        
                
            }else{
                this.kag.layer.getLayer(pm.layer, pm.page).append(img_obj);
                this.kag.ftag.nextOrder();

            }

        } else {

            //base レイヤの場合

            if (pm.folder != "") {
                folder = pm.folder;
            } else {
                folder = "bgimage";
            }

            //背景レイヤ
            if ($.isHTTP(pm.storage)) {
                strage_url = pm.storage;
            } else {
                strage_url = "./data/" + folder + "/" + pm.storage;
            }

            //backの場合はスタイルなしですよ

            var new_style = {
                "background-image" : "url(" + strage_url + ")",
                "display" : "none"
            };

            if (pm.page === "fore") {
                new_style.display = "block"
            }

            this.kag.setStyles(this.kag.layer.getLayer(pm.layer, pm.page), new_style);
            this.kag.ftag.nextOrder();

        }

    }
};

/*
#[freeimage]
:group
レイヤ関連
:title
レイヤの解放
:exp

レイヤに追加された要素をすべて削除します　レイヤ指定は必須です。
:sample
[backlay]
;キャラクター表示
[image layer=0 page=back visible=true top=100 left=300  storage = chara.png]
[trans time=2000]
@wt

@backlay
;キャラクター非表示
[freeimage layer=0 page=back]
@trans time=2000
[wt]
:param
layer=操作対象のレイヤを指定します。指定がない場合、現在のメッセージレイヤとみなされます,
page=表画面を対象とするか、裏画面を対象とするかを指定します。省略すると表ページとみなされます,
time=ミリ秒を指定した場合、指定時間をかけてイメージが消えていきます,
wait=完了を待つかどうかを指定できます。trueを指定すると完了を待ちます。デフォルトはtrue
#[end]
*/

//イメージ情報消去背景とか
tyrano.plugin.kag.tag.freeimage = {

    vital : ["layer"],

    pm : {
        layer : "",
        page : "fore",
        time:"", //徐々に非表示にする
        wait:"true"
    },

    start : function(pm) {
        
        var that = this;
        
        if (pm.layer != "base") {

            //前景レイヤの場合、全部削除だよ
            
            //非表示にした後、削除する
            if (pm.time == 0) pm.time = ""; // integer 0 and string "0" are equal to ""
            if(pm.time !=""){
                
                var j_obj = this.kag.layer.getLayer(pm.layer, pm.page).children();
                
                //存在しない場合は即next
                if(!j_obj.get(0)){
                    if(pm.wait=="true"){
                        that.kag.ftag.nextOrder();
                        return;
                    }
                }
                
                var cnt = 0;
                var s_cnt = j_obj.length;
                
                j_obj.animate(
                    {"opacity":0},
                    parseInt(pm.time), 
                    function(){
                        that.kag.layer.getLayer(pm.layer, pm.page).empty();
                        //次へ移動ですがな
                        cnt++;
                        if(s_cnt == cnt){
                            
                            if(pm.wait=="true"){
                                that.kag.ftag.nextOrder();            
                            }
        
                        }
                    }
                );
                
            }else{
                 that.kag.layer.getLayer(pm.layer, pm.page).empty();
                 //次へ移動ですがな
                 that.kag.ftag.nextOrder();
            }

        } else {
            
            this.kag.layer.getLayer(pm.layer, pm.page).css("background-image", "");
            //次へ移動ですがな
            this.kag.ftag.nextOrder();            
        }
        
        if(pm.wait=="false"){
            this.kag.ftag.nextOrder();            
        }
        

    }
};


//freeimageという名前がわかりにくい。freelayerという名前でもつかえるようにした。
tyrano.plugin.kag.tag.freelayer = tyrano.plugin.kag.tag.freeimage ;


/*
#[free]
:group
レイヤ関連
:title
オブジェクトの解放
:exp
レイヤに追加されたnameで指定された要素をすべて削除します　name指定は必須です。
:sample
[backlay]
;キャラクター表示
[image name="myimage" layer=0 page=back visible=true top=100 left=300  storage = chara.png]
[trans time=2000]
@wt

;キャラクター非表示
[free layer=0 name="myimage"]

:param
layer=操作対象のレイヤを指定します。,
name=削除する要素のnameを指定します。レイヤの中のあらゆるオブジェクトに適応できます。,
time=ミリ秒を指定した場合、指定時間をかけてイメージが消えていきます,
wait=削除の完了を待つかどうかを指定できます。trueを指定すると完了を待ちます。デフォルトはtrue
#[end]
*/



//イメージ情報消去背景とか
tyrano.plugin.kag.tag.free = {

    vital : ["layer","name"],

    pm : {
        layer : "",
        page : "fore",
        name:"",
        wait:"true",
        time:"" //徐々に非表示にする
    },

    start : function(pm) {
        
        var that = this;
        
        if (pm.layer != "base") {

            //前景レイヤの場合、全部削除だよ
            
            //非表示にした後、削除する
            if (pm.time == 0) pm.time = ""; // integer 0 and string "0" are equal to ""
            if(pm.time !=""){
                
                var j_obj = this.kag.layer.getLayer(pm.layer, pm.page);
                j_obj = j_obj.find("."+pm.name);
                
                
                //存在しない場合は即next
                if(!j_obj.get(0)){
                    if(pm.wait=="true"){
                        that.kag.ftag.nextOrder();
                        return;
                    }
                }
                
                var cnt = 0;
                var s_cnt = j_obj.length;
                
                j_obj.animate(
                    {"opacity":0},
                    parseInt(pm.time), 
                    function(){
                        j_obj.remove();
                        //次へ移動ですがな
                        cnt++;
                        if(cnt == s_cnt){
                            if(pm.wait=="true"){
                                that.kag.ftag.nextOrder();
                            }
                        }
                    }
                );
                
                //falseの時は即次へ
                if(pm.wait=="false"){
                    that.kag.ftag.nextOrder();
                }
                
            }else{
                
                 var j_obj = this.kag.layer.getLayer(pm.layer, pm.page);
                 j_obj = j_obj.find("."+pm.name);
                 j_obj.remove();
                 
                 //次へ移動ですがな
                 that.kag.ftag.nextOrder();
            }

        } else {
            
            var j_obj = this.kag.layer.getLayer(pm.layer, pm.page);
            j_obj = j_obj.find("."+pm.name);
            j_obj.remove();     
            //this.kag.layer.getLayer(pm.layer, pm.page).css("background-image", "");
            //次へ移動ですがな
            this.kag.ftag.nextOrder();            
        }
        

    }
};



/*
#[ptext]
:group
レイヤ関連
:title
レイヤにテキストを追加
:exp
レイヤにテキストを表示します。前景レイヤに対してのみ実行します<br />
前景レイヤの属性を全て継承します。文字を消す時はfreeimageタグをレイヤに対して適応します
また、前景レイヤはデフォルト非表示なので、トランジションで表示しない場合はレイヤを可視状態にしてから、追加します。
[layopt layer=0 visible=true]が必要
:sample
[backlay]
[ptext page=back text="テキストテキスト" size=30 x=200 y=300 color=red vertical=true]
[trans time=2000]
[wt]
[l]
表示したテキストを消去します
[freeimage layer = 0]
:param
layer=対象とするメレイヤを指定します。0以上の整数を指定すると対応する前景レイヤに画像を表示します,
page=対象とするページを指定します。"fore"か"back"を指定して下さい。<br>この属性を省略すると"fore"であるとみなされます,
text=表示するテキストの内容,
x=テキストの左端位置を指定します。（ピクセル）,
y=テキストの上端位置を指定します。（ピクセル）,
vertical=true 、false のいずれかを指定してください。trueで縦書き表示されます。デフォルトは横書き,
size=フォントサイズをピクセルで指定してください,
face=フォントの種類を指定してください。非KAG互換ですが、ウェブフォントも使用できます,
color=フォントの色を指定します,
bold=太字指定 boldと指定してください　HTML５互換ならfont-style指定に変換できます,
edge=文字の縁取りを有効にできます。縁取りする文字色を 0xRRGGBB 形式で指定します。,
shadow=文字に影をつけます。影の色を 0xRRGGBB 形式で指定します。縁取りをしている場合は無効化されます。,
name=ティラノスクリプトのみ。animタグなどからこの名前でアニメーションさせることができます。でまた名前を指定しておくとクラス属性としてJSから操作できます。カンマで区切ることで複数指定することもできます,
width=テキスト表示部分の横幅をピクセルで指定します,
align=文字の横方向に関する位置を指定できます。left（左寄せ）center（中央寄せ）right（右寄せ）デフォルトはleftです。widthパラメータで横幅を指定するのを忘れないようにしてください,
time=ミリ秒を指定します。指定した時間をかけて徐々に表示させることができます,
overwrite=true か false を指定します。同時にnameを指定している場合既に存在するptextの内容を変更できます。デフォルトはfalse

#[end]
*/

//タグを記述していく
tyrano.plugin.kag.tag.ptext = {

    vital : ["layer", "x", "y"],

    pm : {

        "layer" : "0",
        "page" : "fore",
        "x" : 0,
        "y" : 0,
        "vertical" : "false",
        "text" : "", //テキスト領域のデフォルト値を指定するためですが、、、
        "size" : "",
        "face" : "",
        "color" : "",
        "italic" : "",
        "bold" : "",
        "align":"left",
        "edge" : "",
        "shadow" : "",
        "name" : "",
        "time" : "",
        "width":"",
        "zindex" : "9999",
        "overwrite" : "false" //要素を上書きするかどうか

        //"visible":"true"

    },

    start : function(pm) {

        var that = this;

        //visible true が指定されている場合は表示状態に持っていけ
        //これはレイヤのスタイル
        
        //指定がない場合はデフォルトフォントを適応する
        
        if(pm.face ==""){
            pm.face=that.kag.stat.font.face;
        }
        
        if(pm.color == ""){
            pm.color=$.convertColor(that.kag.stat.font.color);
        }else{
            pm.color = $.convertColor(pm.color);
        }
        
        
        var font_new_style = {

            "color" : pm.color,
            "font-weight" : pm.bold,
            "font-style" : pm.fontstyle,
            "font-size" : pm.size + "px",
            "font-family" : pm.face,
            "z-index" : "999",
            "text" : ""

        };
        
        if(pm.edge !=""){
            var edge_color = $.convertColor(pm.edge);
            font_new_style["text-shadow"] = "1px 1px 0 "+edge_color+", -1px 1px 0 "+edge_color+",1px -1px 0 "+edge_color+",-1px -1px 0 "+edge_color+"";
        }else if(pm.shadow !=""){
            font_new_style["text-shadow"] = "2px 2px 2px " + $.convertColor(pm.shadow);    
        }
        
        var target_layer = this.kag.layer.getLayer(pm.layer, pm.page);

        //上書き指定
        if (pm.overwrite == "true" && pm.name != "") {
            if ($("." + pm.name).size() > 0) {
                $("." + pm.name).html(pm.text);
                this.kag.ftag.nextOrder();
                return false;
            }
        }

        var tobj = $("<p></p>");

        tobj.css("position", "absolute");
        tobj.css("top", pm.y + "px");
        tobj.css("left", pm.x + "px");
        tobj.css("width",pm.width);
        
        tobj.css("text-align", pm.align);
        
        
        if (pm.vertical == "true") {
            tobj.addClass("vertical_text");
        }

        //オブジェクトにクラス名をセットします
        $.setName(tobj, pm.name);

        tobj.html(pm.text);

        this.kag.setStyles(tobj, font_new_style);
        
        if(pm.layer=="fix"){
            tobj.addClass("fixlayer");
        }
        
        //時間指定
        if(pm.time != ""){
            tobj.css("opacity",0);
            target_layer.append(tobj);
            tobj.animate(
                    {"opacity":1},
                    parseInt(pm.time), 
                    function(){
                        that.kag.ftag.nextOrder();
                    }
            );
        }else{
            target_layer.append(tobj);
            this.kag.ftag.nextOrder();
            
        }
        
        
    }
};


/*
#[mtext]
:group
レイヤ関連
:title
演出テキスト
:exp
多彩な演出効果をもったテキストを画面上に表示します。
指定できる演出アニメーションは http://tyrano.jp/mtext/ を参照

[layopt layer=0 visible=true]が必要です。
:sample
;デフォルトは前景レイヤは配置されますので表示状態にしておく
[layopt layer=0 visible=true]
[mtext text="演出テキスト" x=100 y=100 in_effect="fadeIn" out_effect="fadeOut"]
:param
layer=対象とするレイヤを指定します。0以上の整数を指定すると対応する前景レイヤに画像を表示します,
page=対象とするページを指定します。"fore"か"back"を指定して下さい。<br>この属性を省略すると"fore"であるとみなされます,
text=表示するテキストの内容,
x=テキストの左端位置を指定します。（ピクセル）,
y=テキストの上端位置を指定します。（ピクセル）,
vertical=true 、false のいずれかを指定してください。trueで縦書き表示されます。デフォルトは横書き,
size=フォントサイズをピクセルで指定してください,
face=フォントの種類を指定してください。非KAG互換ですが、ウェブフォントも使用できます,
color=フォントの色を指定します,

width=テキスト表示部分の横幅をピクセルで指定します,
align=文字の横方向に関する位置を指定できます。left（左寄せ）center（中央寄せ）right（右寄せ）デフォルトはleftです。widthパラメータで横幅を指定するのを忘れないようにしてください,

name=ティラノスクリプトのみ。animタグなどからこの名前でアニメーションさせることができます。でまた名前を指定しておくとクラス属性としてJSから操作できます。カンマで区切ることで複数指定することもできます,
bold=太字指定 boldと指定してください　HTML５互換ならfont-style指定に変換できます,
edge=文字の縁取りを有効にできます。縁取りする文字色を 0xRRGGBB 形式で指定します,
shadow=文字に影をつけます。影の色を 0xRRGGBB 形式で指定します。縁取りをしている場合は無効化されます。,

fadeout=テキスト表示後にフェードアウトを実行するか否かをtrue false で指定します。デフォルトはtrueです。残った文字を消す場合はfreeimageタグを使ってlayerを消して下さい,
time=テキストが静止している時間をミリ秒で指定します。, 
wait=trueかfalse を指定します。trueを指定すると、テキストの演出完了を待ちます。デフォルトはtrue,

in_effect=文字が表示される際のアニメーション演出を指定します。,
in_delay=文字が表示される際の速度を指定します。何秒遅れて１文字が表示されるかをミリ秒で指定します。デフォルトは50です,
in_delay_scale=１文字にかかるアニメーションの比率を指定します。デフォルトは1.5,
in_sync=trueを指定すると、すべての文字が同時にアニメーションを開始します。デフォルトはfalse,
in_shuffle=trueを指定すると、文字アニメーションのタイミングがランダムに実行されます。デフォルトはfalse,
in_reverse=trueを指定すると、文字が後ろから表示されていきます。デフォルトはfalse",

out_effect=文字が消える際のアニメーション演出を指定します。指定できるアニメーションは<a href='http://tyrano.jp/mtext/' target="_blank">こちら</a>,
out_delay=文字が消える際の速度を指定します。何秒遅れて１文字が消えるかをミリ秒で指定します。デフォルトは50です,
out_delay_scale=１文字にかかるアニメーションの比率を指定します。デフォルトは1.5,
out_sync=trueを指定すると、すべての文字が同時にアニメーションを開始します。デフォルトはfalse,
out_shuffle=trueを指定すると、文字アニメーションのタイミングがランダムに実行されます。デフォルトはfalse,
out_reverse=trueを指定すると、文字が後ろから消えていきます。デフォルトはfalse"
#[end]
*/

//タグを記述していく
tyrano.plugin.kag.tag.mtext = {

    vital : ["x", "y"],

    pm : {

        "layer" : "0",
        "page" : "fore",
        "x" : 0,
        "y" : 0,
        "vertical" : "false",
        "text" : "", //テキスト領域のデフォルト値を指定するためですが、、、
        "size" : "",
        "face" : "",
        "color" : "",
        "italic" : "",
        "bold" : "",
        "shadow" : "",
        "edge" : "",
        "name" : "",
        "zindex" : "9999",
        "width":"",
        "align":"left",
        
        "fadeout":"true", //テキストを残すかどうか
        "time":"2000", //テキストを表示時間しておく時間
        
        "in_effect":"fadeIn",
        "in_delay":"50",
        "in_delay_scale":"1.5",
        "in_sync":"false",
        "in_shuffle":"false",
        "in_reverse":"false",
        
        "wait":"true",  //テキストの表示完了を待つ
        
        "out_effect":"fadeOut",
        "out_delay":"50", //次の１文字が消えるタイミングへ移動する時間をミリ秒で指定します
        "out_scale_delay":"", //１文字が消えるのにかかる時間をミリ秒で指定します
        "out_sync":"false",
        "out_shuffle":"false",
        "out_reverse":"false"
        //"visible":"true"

    },

    start : function(pm) {
        
        var that = this;

        //指定がない場合はデフォルトフォントを適応する
        
        if(pm.face ==""){
            pm.face=that.kag.stat.font.face;
        }
        
        if(pm.color == ""){
            pm.color=$.convertColor(that.kag.stat.font.color);
        }else{
            pm.color = $.convertColor(pm.color);
        }
        
        var font_new_style = {

            "color" : pm.color,
            "font-weight" : pm.bold,
            "font-style" : pm.fontstyle,
            "font-size" : pm.size + "px",
            "font-family" : pm.face,
            "z-index" : "999",
            "text" : ""

        };
        
        if(pm.edge !=""){
            var edge_color = $.convertColor(pm.edge);
            font_new_style["text-shadow"] = "1px 1px 0 "+edge_color+", -1px 1px 0 "+edge_color+",1px -1px 0 "+edge_color+",-1px -1px 0 "+edge_color+"";
        }else if(pm.shadow !=""){
            font_new_style["text-shadow"] = "2px 2px 2px " + $.convertColor(pm.shadow);    
        }

        var target_layer = this.kag.layer.getLayer(pm.layer, pm.page);

        var tobj = $("<p></p>");

        tobj.css("position", "absolute");
        tobj.css("top", pm.y + "px");
        tobj.css("left", pm.x + "px");
        tobj.css("width", pm.width);
        tobj.css("text-align", pm.align);
        
        if (pm.vertical == "true") {
            tobj.addClass("vertical_text");
        }

        //オブジェクトにクラス名をセットします
        $.setName(tobj, pm.name);

        tobj.html(pm.text);

        this.kag.setStyles(tobj, font_new_style);
        
        if(pm.layer=="fix"){
            tobj.addClass("fixlayer");
        }
        
        //前景レイヤ
        target_layer.append(tobj);
        
        //bool変換
        for(key in pm){
            if(pm[key]=="true"){
                pm[key] = true;
            }else if(pm[key] =="false"){
                pm[key] = false;
            }
        }
        
        //tobj をアニメーションさせる
        tobj.textillate({ 
            
                "loop":pm["fadeout"],
                "minDisplayTime":pm["time"],
                
                "in": { 
                    "effect":pm["in_effect"], 
                    "delayScale":pm["in_delay_scale"],
                    "delay":pm["in_delay"],
                    "sync":pm["in_sync"],
                    "shuffle":pm["in_shuffle"],
                    "reverse":pm["in_reverse"],
                    "callback":function(){
                        if (pm.fadeout==false && pm.wait == true) {
                            that.kag.ftag.nextOrder();
                        }
                    }
                },
                
                "out": {
                    "effect": pm["out_effect"], 
                    "delayScale": pm["out_delay_scale"],
                    "delay": pm["out_delay"],
                    "sync": pm["out_sync"],
                    "shuffle": pm["out_shuffle"],
                    "reverse": pm["out_reverse"],
                    "callback":function(){
                        tobj.remove();
                        if (pm.wait == true) {
                            that.kag.ftag.nextOrder();
                        }
                    }
                }
                
            });
            
        if(pm.wait != true){
            this.kag.ftag.nextOrder();
        }
    }
};

/*
#[backlay]
:group
レイヤ関連
:title
レイヤ情報の表ページから裏ページへのコピー
:exp
指定したレイヤ、あるいはすべてのレイヤの情報を、表ページから裏ページに コピーします。
利用方法としてはtrans タグで表ページのレイヤの画像を裏ページの レイヤの画像に置き換えます。
そのため、トランジション前にこの backlay タ グで画像を裏ページに転送し、裏ページでレイヤを操作してから、トランジションを 行うという方法に用います。
:sample
;背景変更をトランジションで実施
@layopt layer=message0 visible=false
[backlay]
[image layer=base page=back storage=rouka.jpg]
[trans time=2000]
[wt]
:param
layer=対象となるレイヤを指定します。<br>
base を指定すると 背景レイヤ になります。<br>
0 以上の整数を指定すると前景レイヤになります。<br>
message0 または message1 を指定するとメッセージレイヤにな ります。<br>
単に message とのみ指定した場合は、 current タグで指定した現在の操作対象のメッセージレイヤが 対象になります ( 裏ページのメッセージレイヤが操作対象であっても そのメッセージレイヤの表ページ→裏ページへのコピーが行われます )。<br>
省略すると、すべてのレイヤの情報が裏ページにコピーされます。<br>
#[end]
*/

//前景レイヤを背景レイヤにコピー
tyrano.plugin.kag.tag.backlay = {

    pm : {
        layer : ""
    },

    start : function(pm) {
        this.kag.layer.backlay(pm.layer);
        this.kag.ftag.nextOrder();
    }
};

/*
#[wt]
:group
レイヤ関連
:title
トランジションの終了待ち
:exp
トランジションが終了するまで、待ちます。
:sample
[backlay]
[image layer=base page=back storage=rouka.jpg]
[trans time=2000]
;トランジションが終わるまで先へ進まない
[wt]
:param
#[end]
*/

//トランジション完了を待つ
tyrano.plugin.kag.tag.wt = {
    start : function(pm) {
        
        if (this.kag.stat.is_trans == false) {
            this.kag.layer.showEventLayer();
            this.kag.ftag.nextOrder();
        }else{
            this.kag.layer.hideEventLayer();
        }
        
    }
};

//音楽のフェードインを待つ
tyrano.plugin.kag.tag.wb = {
    start : function(pm) {
        this.kag.layer.hideEventLayer();
    }
};

//フェードインを待つ

//画面揺らし待ち
/*
tyrano.plugin.kag.tag.wq = {
start:function(pm){
//画面揺らしが終わらないと、次に進まないよね。
}
};
*/

/*
#[link]
:group
ラベル・ジャンプ操作
:title
ハイパーリンク（選択肢）
:exp

link タグと endlink タグで囲まれた部分の文章を、 マウスやキーボードで選択可能にし、そこでクリックされたりキーを押されたときに、 ジャンプする先を指定できます。
また、囲まれた文章はページをまたぐことは出来ません(行をまたぐことはできます)。
:sample
選択肢を表示します[l][r][r]

[link target=*select1]【１】選択肢　その１[endlink][r]
[link target=*select2]【２】選択肢　その２[endlink][r]

[s]

*select1
[cm]
「選択肢１」がクリックされました[l]
@jump target=*common

*select2
[cm]
「選択肢２」がクリックされました[l]
@jump target=*common

*common
[cm]

共通ルートです
:param
storage=ジャンプ先のシナリオファイルを指定します。省略すると、現在 のシナリオファイル内であると見なされます,
target=ジャンプ先のラベルを指定します。省略すると、ファイルの先頭から実行されます。
#[end]
*/

//リンクターゲット
tyrano.plugin.kag.tag.link = {

    pm : {
        target : null,
        storage : null
    },

    start : function(pm) {

        var that = this;

        //this.kag.stat.set_text_span = true;

        //即時にスパンを設定しないとダメねw
        var j_span = this.kag.setMessageCurrentSpan();

        j_span.css("cursor", "pointer");

        (function() {

            var _target = pm.target;
            var _storage = pm.storage;

            //クラスとイベントを登録する
            that.kag.event.addEventElement({
                "tag":"link",
                "j_target":j_span, //イベント登録先の
                "pm":pm
            });
            
            //イベントを設定する
            that.setEvent(j_span,pm);

        })();

        this.kag.ftag.nextOrder();

    },
    
    setEvent:function(j_span,pm){
         
         var _target = pm.target;
         var _storage = pm.storage;
         var that = TYRANO;
         
         j_span.bind('click touchstart', function(e) {
                
                //ここから書き始める。イベントがあった場合の処理ですね　ジャンプで飛び出す
                TYRANO.kag.ftag.nextOrderWithLabel(_target, _storage);
                TYRANO.kag.layer.showEventLayer();
                
                //選択肢の後、スキップを継続するか否か
                if(that.kag.stat.skip_link=="true"){
                    e.stopPropagation();
                }else{
                    that.kag.stat.is_skip = false; 
                }
                
         });

         j_span.css("cursor", "pointer");
    
    }

};

/*
 #[endlink]
 :group
 ラベル・ジャンプ操作
 :title
 ハイパーリンク（選択肢）の終了を示します
 :exp
 ハイパーリンク（選択肢）の終了を示します
 :sample
 [link target=*select1]【１】選択肢　その１[endlink][r]
 [link target=*select2]【２】選択肢　その２[endlink][r]
 :param
 #[end]
 */

tyrano.plugin.kag.tag.endlink = {

    start : function(pm) {

        var j_span = this.kag.setMessageCurrentSpan();

        //新しいspanをつくるの
        this.kag.ftag.nextOrder();

    }
};

/*
 #[s]
 :group
 システム操作
 :title
 ゲームを停止する
 :exp
 シナリオファイルの実行を停止します。
 linkタグで選択肢表示した直後などに配置して利用する方法があります。
 :sample
 [link target=*select1]【１】選択肢　その１[endlink][r]
 [link target=*select2]【２】選択肢　その２[endlink][r]
 [s]
 :param
 #[end]
 */

tyrano.plugin.kag.tag.s = {

    start : function() {

        this.kag.stat.is_strong_stop = true;
        this.kag.layer.hideEventLayer();

    }
};

//使用禁止
//処理停止、事前準備
tyrano.plugin.kag.tag._s = {

    vital : [],

    pm : {

    },

    start : function(pm) {
        //現在のIndexを指定する。保存時に戻る場所だ
        this.kag.stat.strong_stop_recover_index = this.kag.ftag.current_order_index;
        this.kag.ftag.nextOrder();

    }
};

/*
#[wait]
:group
システム操作
:title
ウェイトを入れる
:exp
ウェイトを入れます。time属性で指定した時間、操作できなくなります。
:sample
;2000ミリ秒（２秒）処理を停止します
[wait time=2000]
:param
time=ウェイトをミリ秒で指定します。
#[end]
*/

//ウェイト
tyrano.plugin.kag.tag.wait = {

    vital : ["time"],

    pm : {

        time : 0

    },

    start : function(pm) {

        var that = this;

        //クリック無効
        this.kag.stat.is_strong_stop = true;
        this.kag.stat.is_wait = true;
        this.kag.layer.hideEventLayer();


        that.kag.tmp.wait_id = setTimeout(function() {
            that.kag.stat.is_strong_stop = false;
            that.kag.stat.is_wait = false;
            that.kag.layer.showEventLayer();
            that.kag.ftag.nextOrder();
        }, pm.time);
        
        

    }
};


/*
#[wait_cancel]
:group
システム操作
:title
ウェイトをキャンセルする
:exp
[wait]タグで待ち状態のスタックが存在する場合、キャンセルできます。
これは[wait]中にボタンクリックなどでジャンプした先でキャンセルするような使い方をします。
:param

#[end]
*/

//ウェイト
tyrano.plugin.kag.tag.wait_cancel = {

    vital : [],

    pm : {
    },

    start : function(pm) {

        var that = this;

        //[wait]キャンセル
        clearTimeout(this.kag.tmp.wait_id); 
        this.kag.tmp.wait_id="";
        this.kag.stat.is_strong_stop = false;
        this.kag.stat.is_wait = false;
        this.kag.layer.showEventLayer();
        
        this.kag.ftag.nextOrder();

    }
};


/*
 #[hidemessage]
 :group
 レイヤ関連
 :title
 メッセージを消す
 :exp
 メッセージレイヤを一時的に隠します。メニューから「メッセージを消す」を選んだのと 同じ動作を行います。
 クリック待ちを行った後、メッセージレイヤは表示され、 実行は継続します。
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag.hidemessage = {

    start : function() {

        this.kag.stat.is_hide_message = true;
        //メッセージレイヤを全て削除する //テキスト表示時に復活
        this.kag.layer.hideMessageLayers();

        //クリックは復活させる
        this.kag.layer.layer_event.show();

        //this.kag.ftag.nextOrder();

    }
};

/*
#[quake]
:group
システム操作
:title
画面を揺らす
:exp
指定したミリ秒だけ、画面を揺らします。（KAGの文字数指定は未対応）
vmax 属性を 0 に設定すると横揺れになります。hmax 属性を 0 に設定すると縦揺れになります。
:sample
[quake count=5 time=300 hmax=20]
:param
count=指定した回数揺らします,
wait  = trueかfalseを指定します。trueの場合は揺れが完了するまで、ゲームを停止します。デフォルトはtrue,
time=１回揺れるのにかかる時間をミリ秒で指定します。デフォルトは300,
hmax=揺れの横方向への最大振幅を指定します。省略すると 10(px) が指定されたと見なされます。,
vmax=揺れの縦方向への最大振幅を指定します。省略すると 10(px) が指定されたと見なされます。
#[end]
*/

//画面を揺らします
tyrano.plugin.kag.tag.quake = {

    vital : ["time"],

    pm : {
        count : 5,
        time : 300,
        timemode : "",
        hmax : "0",
        vmax : "10",
        wait : "true"
    },

    start : function(pm) {

        var that = this;

        if (pm.hmax != "0") {

            $("." + this.kag.define.BASE_DIV_NAME).effect('shake', {
                times : parseInt(pm.count),
                distance : parseInt(pm.hmax),
                direction : "left"
            }, parseInt(pm.time), function() {

                if (pm.wait == "true") {
                    that.kag.ftag.nextOrder();
                }
            });

        } else if (pm.vmax != "0") {

            $("." + this.kag.define.BASE_DIV_NAME).effect('shake', {
                times : parseInt(pm.count),
                distance : parseInt(pm.vmax),
                direction : "up"
            }, parseInt(pm.time), function() {

                if (pm.wait == "true") {
                    that.kag.ftag.nextOrder();
                }
            });

        }

        if (pm.wait == "false") {
            that.kag.ftag.nextOrder();
        }

    }
};

/*
 #[font]
 :group
 システム操作
 :title
 フォント属性設定
 :exp
 文字の様々な属性を指定します。
 これらの属性は、メッセージレイヤごとに個別に設定できます。
 いずれの属性も、省略すると前の状態を引き継ぎます。また、default を指定すると Config.tjs 内で指定したデフォルトの値に戻ります。
 resetfont や　ct cm er タグが実行されると、、Config.tjs 内や deffont タグで指定し たデフォルトの値に戻ります。
 :sample
 [font size=40 bold=true]
 この文字は大きく、そして太字で表示されます。
 [resetfont]
 もとの大きさに戻りました。
 :param
 size=文字サイズを指定します,
 color=文字色を文字色を 0xRRGGBB 形式で指定します。（吉里吉里対応）　HTML5に限るならその他指定でも大丈夫です,
 bold=太字指定。true 又は　false で指定,
 italic=trueを指定すると、イタリック体になります。デフォルトはfalseです,
 face=フォントの種類を指定。非KAG互換でウェブフォントも利用可能。プロジェクトフォルダのothersフォルダに配置してください。そして、tyrano.cssの@font-faceを指定することで利用できます。,
 edge=文字の縁取りを有効にできます。縁取りする文字色を 0xRRGGBB 形式で指定します。縁取りを解除する場合は「none」と指定してください,
 shadow=文字に影をつけます。影の色を 0xRRGGBB 形式で指定します。影を解除する場合は「none」と指定してください 

 #[end]
 */

tyrano.plugin.kag.tag.font = {

    pm : {

    },
    
    log_join:"true",
    
    start : function(pm) {

        this.kag.setMessageCurrentSpan();

        var new_font = {};

        if (pm.size) {
            this.kag.stat.font.size = pm.size;
        }

        if (pm.color) {
            this.kag.stat.font.color = $.convertColor(pm.color);
        }

        if (pm.bold) {
            this.kag.stat.font.bold = $.convertBold(pm.bold);
        }

        if (pm.face) {
            this.kag.stat.font.face = pm.face;
        }
        
        if (pm.italic){
            this.kag.stat.font["italic"] = $.convertItalic(pm.italic);
        }
        
        if (pm.edge) {
            if(pm.edge=="none" || pm.edge==""){
                this.kag.stat.font.edge = "";
            }else{
                this.kag.stat.font.edge = $.convertColor(pm.edge);
            }
        }
        
        if (pm.shadow) {
            if(pm.shadow=="none" || pm.shadow==""){
                this.kag.stat.font.shadow = "";
            }else{
                this.kag.stat.font.shadow = $.convertColor(pm.shadow);
            }
        }

        this.kag.ftag.nextOrder();
        ///////////////////

    }
};

/*
#[deffont]
:group
システム操作
:title
デフォルトの文字属性設定
:exp
現在操作対象のメッセージレイヤに対する、デフォルトの文字属性を指定します。
ここで指定した属性は、resetfont タグで実際に反映されます。
つまり、このタグを実行しただけではすぐにはフォントの属性は反映されません。resetfont タグ を実行する必要があります。
:sample
:param
size=文字サイズを指定します,
color=文字色を文字色を 0xRRGGBB 形式で指定します。（吉里吉里対応）　HTML5に限るならその他指定でも大丈夫です,
bold=太字指定。true 又は　false で指定,
italic=trueを指定するとイタリック体で表示されます。デフォルトは
face=フォントの種類を指定。非KAG互換でウェブフォントも利用可能。プロジェクトフォルダのothersフォルダに配置してください。そして、tyrano.cssの@font-faceを指定することで利用できます。,
edge=文字の縁取りを有効にできます。縁取りする文字色を 0xRRGGBB 形式で指定します。縁取りを解除する場合は「none」と指定してください,
shadow=文字に影をつけます。影の色を 0xRRGGBB 形式で指定します。影を解除する場合は「none」と指定してください 

#[end]
*/

//デフォルトフォント設定
tyrano.plugin.kag.tag.deffont = {

    pm : {

    },

    start : function(pm) {

        var new_font = {};

        if (pm.size) {
            this.kag.stat.default_font.size = pm.size;
        }

        if (pm.color) {
            this.kag.stat.default_font.color = $.convertColor(pm.color);
        }

        if (pm.bold) {
            this.kag.stat.default_font.bold = $.convertBold(pm.bold);
        }

        if (pm.face) {
            this.kag.stat.default_font.face = pm.face;
        }
        
        if (pm.italic) {
            this.kag.stat.default_font.italic = $.convertItalic(pm.italic);
        }
        
        if (pm.edge) {
            if(pm.edge=="none" || pm.edge==""){
                this.kag.stat.default_font.edge = "";
            }else{
                this.kag.stat.default_font.edge = $.convertColor(pm.edge);
            }
        }
        
        if (pm.shadow) {
            if(pm.shadow=="none" || pm.shadow==""){
                this.kag.stat.default_font.shadow = "";
            }else{
                this.kag.stat.default_font.shadow = $.convertColor(pm.shadow);
            }
        }
        
        

        this.kag.ftag.nextOrder();
        ///////////////////

    }
};

/*
#[delay]
:group
システム操作
:title
文字の表示速度の設定
:exp
文字の表示速度を指定します。
文字表示をノーウェイトにするには nowait タグをつかう こともできます。
:sample
:param
speed=文字の表示速度を指定します
#[end]
*/

//文字の表示速度変更
tyrano.plugin.kag.tag.delay = {

    pm : {
        speed : ""
    },
    
    log_join:"true",
    
    start : function(pm) {
        if (pm.speed != "") {
            this.kag.stat.ch_speed = parseInt(pm.speed);
        }

        this.kag.ftag.nextOrder();

    }
};

/*
#[resetdelay]
:group
システム操作
:title
文字の表示速度をデフォルトに戻す
:exp
文字の表示速度をデフォルト速度に戻します
:sample
:param
#[end]
*/

//文字の表示速度変更
tyrano.plugin.kag.tag.resetdelay = {

    pm : {
        speed : ""
    },
    
    log_join:"true",
    
    start : function(pm) {
        
        this.kag.stat.ch_speed  = "";
        this.kag.ftag.nextOrder();

    }
};



/*
#[configdelay]
:group
システム操作
:title
デフォルトの文字の表示速度の設定
:exp
デフォルトの文字の表示速度を指定します。
つまり、resetdelay時にはこの速度が指定されます。
コンフィグ画面などで文字速度を指定する場合はこのタグをつかって指定します。
:sample
:param
speed=文字の表示速度を指定します
#[end]
*/

//文字の表示速度変更
tyrano.plugin.kag.tag.configdelay = {

    pm : {
        speed : ""
    },

    start : function(pm) {
        if (pm.speed != "") {
            this.kag.stat.ch_speed = "";
            this.kag.config.chSpeed = pm.speed;
            this.kag.ftag.startTag("eval", {"exp":"sf._config_ch_speed = "+pm.speed});
        }else{
            this.kag.ftag.nextOrder();
        }

    }
};

/*
 #[nowait]
 :group
 システム操作
 :title
 文字表示の瞬間表示
 :exp
 待ち時間なしに、テキストを配置します。
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag.nowait = {

    pm : {},

    start : function(pm) {

        this.kag.stat.is_nowait = true;

        this.kag.ftag.nextOrder();

    }
};

/*
 #[endnowait]
 :group
 システム操作
 :title
 テキストの瞬間表示を取り消します。
 :exp
 テキストメッセージは前回nowaitタグを指定した時のスピードへ戻ります
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag.endnowait = {

    pm : {},

    start : function(pm) {

        this.kag.stat.is_nowait = false;

        this.kag.ftag.nextOrder();

    }
};

/*
 #[resetfont]
 :group
 システム操作
 :title
 フォント属性を元に戻す
 :exp
 font タグで指定した文字の属性をデフォルトに戻します。
 文字属性は、メッセージレイヤごとに個別に設定できます
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag.resetfont = {
    
    log_join:"true",
    
    start : function() {

        var j_span = this.kag.setMessageCurrentSpan();

        this.kag.stat.font = $.extend(true, {}, this.kag.stat.default_font);
        this.kag.ftag.nextOrder();

    }
};

/*
#[layopt]
:group
レイヤ関連
:title
レイヤの属性設定
:exp
レイヤの属性を指定します。
:sample
;メッセージレイヤを消去
@layopt layer=message0 visible=false
[backlay]
[image layer=0 page=back visible=true top=100 left=50  storage = miku1.png]
[trans time=2000]
@wt
;そしてレイヤ表示
@layopt layer=message0 visible=true
:param
layer=対象となる前景レイヤまたはメッセージレイヤを指定します。 　message とのみ指定した場合は、current タグで指定した、現在の操作対象のメッセージレイヤが対象となります。,
page=表(fore)画面のレイヤを対象とするか、裏(back)画面のレイヤを対象と するかを指定します。省略すると表ページであると見なされます。ただしlayerをmessage とのみ指定した場合でこの属性を省略した場合は 現在操作対象のページのメッセージレイヤが選択されます。,
visible=layer 属性で指定したレイヤを表示するか、しないかを指定 します。visibleをtrue と 指定すれば、レイヤは表示状態になります。visible=false と指定すれば、 非表示状態になります。省略すると表示状態は変わりません。,
left=layer 属性で指定したレイヤの左端位置を指定します。 省略すると位置は変更しません。　layer 属性に message0 や message1 を指定した場合は、position タグで位置等を指定してください。,
top=layer 属性で指定したレイヤの上端位置を指定します。 省略すると位置は変更しません。　layer 属性に message0 や message1 を指定した場合は、むしろ position タグで位置等を指定してください。,
opacity=レイヤの不透明度を指定します。０～２５５の範囲で指定してください（２５５で全くの不透明）
#[end]
*/

//レイヤーオプション変更
tyrano.plugin.kag.tag.layopt = {

    vital : ["layer"],

    pm : {
        layer : "",
        page : "fore",
        visible : "",
        left : "",
        top : "",
        opacity : "",
        autohide : false,
        index : 10
    },

    start : function(pm) {

        var that = this;

        if (pm.layer == "message") {

            pm.layer = this.kag.stat.current_layer;
            pm.page = this.kag.stat.current_page;

        }

        var j_layer = this.kag.layer.getLayer(pm.layer, pm.page);
        
        if(pm.layer=="fix" || pm.layer=="fixlayer"){
            j_layer = $("#tyrano_base").find(".fixlayer");
        }
        
        //表示部分の変更
        if (pm.visible != "") {

            if (pm.visible == "true") {

                //バックの場合は、その場では表示してはダメ
                if (pm.page == "fore") {
                    j_layer.css("display", "");
                }

                j_layer.attr("l_visible", "true");

            } else {

                j_layer.css("display", "none");
                j_layer.attr("l_visible", "false");

            }

        }

        //レイヤのポジション指定

        if (pm.left != "") {
            j_layer.css("left", parseInt(pm.left));
        }

        if (pm.top != "") {
            j_layer.css("top", parseInt(pm.top));
        }

        if (pm.opacity != "") {
            j_layer.css("opacity", $.convertOpacity(pm.opacity))
        }

        this.kag.ftag.nextOrder();

    }
};

/*
#[ruby]
:group
メッセージ関連
:title
ルビを振る
:exp
次の一文字に対するルビを指定します。
ルビを表示させたい場合は毎回指定してください。
複数の文字にルビを振る場合は、一文字毎にルビを指定する必要があります。
:sample
[ruby text="かん"]漢[ruby text="じ"]字
:param
text=ルビとして表示させる文字を指定します
#[end]
*/

//ルビ指定
tyrano.plugin.kag.tag["ruby"] = {

    vital : ["text"],

    pm : {
        text : ""
    },
    
    log_join:"true",

    start : function(pm) {

        var str = pm.text;

        //ここに文字が入っている場合、ルビを設定してから、テキスト表示する
        this.kag.stat.ruby_str = str;

        this.kag.ftag.nextOrder();

    }
};

/*
 #[cancelskip]
 :group
 システム操作
 :title
 スキップ解除
 :exp
 スキップ状態の解除を行います。
 プレイヤーにスキップ状態の停止を強制させることができます
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag.cancelskip = {
    start : function(pm) {

        this.kag.stat.is_skip = false;
        this.kag.ftag.nextOrder();

    }
};

/*
#[locate]
:group
システム操作
:title
表示位置の指定
:exp
グラフィックボタンの表示位置を指定します。
テキストには対応しておりません。
:sample
[locate x=20 y=100]
[button graphic="oda.png" target=*oda]

[locate x=300 y=100]
[button graphic="toyo.png" target=*toyo]

:param
x=横方向位置指定,
y=縦方向位置指定
#[end]
*/

//グラフィックボタン表示位置調整、テキストはできない
tyrano.plugin.kag.tag.locate = {

    pm : {
        x : null,
        y : null
    },

    start : function(pm) {

        if (pm.x != null) {
            this.kag.stat.locate.x = pm.x;
        }

        if (pm.y != null) {
            this.kag.stat.locate.y = pm.y;
        }

        this.kag.ftag.nextOrder();

    }
};

/*
#[button]
:group
ラベル・ジャンプ操作
:title
グラフィカルボタンの表示
:exp
グラフィカルボタンを表示します。
linkタグの画像版となります。
ただし、グラフィックボタン表示中は強制的にシナリオ進行が停止しますので、必ずジャンプ先を指定して下さい
また、グラフィックボタンの表示位置は直前のlocateタグによる指定位置を参照します。
ただし、x、y が指定されている場合は、そちらが優先されます。
ここから、移動した場合はコールスタックに残りません。つまり、リターンできないのでご注意ください
注意→fixにtrueを指定した場合はコールスタックに残ります。コール先からリターンするまで全てのボタンは有効にならないのでご注意ください
ジャンプ後に必ず[cm]タグでボタンを非表示にする必要があります。
:sample
[locate x=20 y=100]
[button graphic="oda.png" target=*oda]

[locate x=300 y=100]
[button graphic="toyo.png" target=*toyo]

:param
graphic=ボタンにする画像を指定します。ファイルはプロジェクトフォルダのimageフォルダに入れて下さい,
storage=ジャンプ先のシナリオファイルを指定します。省略すると、現在 のシナリオファイル内であると見なされます。,
target=ジャンプ先のラベルを指定します。省略すると、ファイルの先頭から実行されます。,
name=ティラノスクリプトのみ。animタグなどからこの名前でアニメーションさせることができます。でまた名前を指定しておくとクラス属性としてJSから操作できます。カンマで区切ることで複数指定することもできます,
x=ボタンの横位置を指定します,
y=ボタンの縦位置を指定します。,
width=ボタンの横幅をピクセルで指定できます,
height=ボタンの高さをピクセルで指定できます,
fix=true falseで指定します。デフォルトはfalse 。trueを指定すると、Fixレイヤーにボタンが配置されます。この場合、ボタンを表示してもシナリオを進める事ができます。例えば、セーブボタンといった常に表示したいボタンを配置する時に活用できます。また、fixレイヤーに追加した要素を消す場合はclearfixタグ を使います。fixをtrueの場合は必ず別storageのtargetを指定してその場所にボタンが押されたときの処理を記述します。fixをtrueにした場合コールスタックが残ります。コールスタックが消化されるまではボタンが有効にならないのでご注意ください。,
savesnap=true or false で指定します。デフォルトはfalse このボタンが押された時点でのセーブスナップを確保します。セーブ画面へ移動する場合はここをtrueにして、保存してからセーブを実行します,
folder=好きな画像フォルダから、画像を選択できます。通常前景レイヤはfgimage　背景レイヤはbgimageと決まっていますが、ここで記述したフォルダ以下の画像ファイルを使用することができるようになります。,
exp=ボタンがクリックされた時に実行されるJSを指定できます。,
preexp="タグが評価された時点で変数 preexpに値を格納します。つまり、ボタンがクリックされた時に、expでpreexpという変数が利用できます。",
hint=マウスカーソルを静止させたときに表示されるツールチップの文字列を指定できます。,
clickse=ボタンをクリックした時に再生される効果音を設定できます。効果音ファイルはsoundフォルダに配置してください,
enterse=ボタンの上にマウスカーソルが乗った時に再生する効果音を設定できます。効果音ファイルはsoundフォルダに配置してください,
leavese=ボタンの上からマウスカーソルが外れた時に再生する効果音を設定できます。効果音ファイルはsoundフォルダに配置してください。,
clickimg=ボタンをクリックした時に切り替える画像ファイルを指定できます。ファイルはimageフォルダに配置してください,
enterimg=ボタンの上にマウスカーソルが乗った時に切り替える画像ファイルを指定できます。ファイルはimageフォルダに配置してください。,
visible=初期状態で表示か非表示を選択できます。trueで表示falseで非表示の初期状態となります,
auto_next=true or false を指定します。falseを指定すると、fixの場合、[return]で戻った時に次のタグへ進ませません。,
role=ボタンに特別な機能を割り当てることができます。この場合storageやtargetは無視されます。強制的にfix属性がtrueになります。指定できる文字列はsave(セーブ画面を表示します)。load(ロード画面を表示します)。title(タイトル画面に戻ります)。menu(メニュー画面を表示します)。window(メッセージウィンドウを非表示にします)。skip(スキップの実行)。backlog（過去ログを表示）。fullscreen(フルスクリーン切り替え)。quicksave(クイックセーブ実行)。quickload(クイックロード実行)。auto（オート開始）。sleepgame（ゲームの状態を保存してジャンプ）
#[end]
*/

//指定した位置にグラフィックボタンを配置する
tyrano.plugin.kag.tag.button = {

    pm : {
        graphic : "",
        storage : null,
        target : null,
        ext : "",
        name : "",
        x : "",
        y : "",
        width : "",
        height : "",
        fix : "false", /*ここがtrueの場合、システムボタンになりますね*/
        savesnap : "false",
        folder : "image",
        exp : "",
        prevar : "",
        visible:"true",
        hint : "",
        clickse : "",
        enterse : "",
        leavese : "",
        clickimg : "",
        enterimg : "",
        
        auto_next:"yes",

        role : ""

    },

    //イメージ表示レイヤ。メッセージレイヤのように扱われますね。。
    //cmで抹消しよう
    start : function(pm) {

        var that = this;

        var target_layer = null;

        //role が設定された時は自動的にfix属性になる
        if (pm.role != "") {
            pm.fix = "true";
        }

        if (pm.fix == "false") {
            target_layer = this.kag.layer.getFreeLayer();
            target_layer.css("z-index", 999999);
        } else {
            target_layer = this.kag.layer.getLayer("fix");
        }

        var storage_url = "";

        if ($.isHTTP(pm.graphic)) {
            storage_url = pm.graphic;
        } else {
            storage_url = "./data/" + pm.folder + "/" + pm.graphic
        }

        var j_button = $("<img />");
        j_button.attr("src", storage_url);
        j_button.css("position", "absolute");
        j_button.css("cursor", "pointer");
        j_button.css("z-index", 99999999);
        
        //初期状態で表示か非表示か
        if(pm.visible=="true"){
            j_button.show();
        }else{
            j_button.hide();
        }
        
        if (pm.x == "") {
            j_button.css("left", this.kag.stat.locate.x + "px");
        } else {
            j_button.css("left", pm.x + "px");
        }

        if (pm.y == "") {
            j_button.css("top", this.kag.stat.locate.y + "px");
        } else {
            j_button.css("top", pm.y + "px");
        }

        if (pm.fix != "false") {
            j_button.addClass("fixlayer");
        }

        if (pm.width != "") {
            j_button.css("width", pm.width + "px");
        }

        if (pm.height != "") {
            j_button.css("height", pm.height + "px");
        }

        //ツールチップの設定
        if (pm.hint != "") {
            j_button.attr({
                "title" : pm.hint,
                "alt" : pm.hint
            });
        }

        //オブジェクトにクラス名をセットします
        $.setName(j_button, pm.name);
        
        //クラスとイベントを登録する
        that.kag.event.addEventElement({
            "tag":"button",
            "j_target":j_button, //イベント登録先の
            "pm":pm
        });
        that.setEvent(j_button,pm);

        target_layer.append(j_button);

        if (pm.fix == "false") {
            target_layer.show();
        }

        this.kag.ftag.nextOrder();

    },
    
    setEvent:function(j_button, pm){
        
        var that = TYRANO;
        
        (function() {

            var _target = pm.target;
            var _storage = pm.storage;
            var _pm = pm;
            
            var preexp = that.kag.embScript(pm.preexp);
            var button_clicked = false;

            j_button.hover(function() {
                //マウスが乗った時
                if (_pm.enterse != "") {
                    that.kag.ftag.startTag("playse", {
                        "storage" : _pm.enterse,
                        "stop" : true
                    });
                }

                if (_pm.enterimg != "") {
                    var enter_img_url = "";
                    if ($.isHTTP(_pm.enterimg)) {
                        enter_img_url = _pm.enterimg;
                    } else {
                        enter_img_url = "./data/" + _pm.folder + "/" + _pm.enterimg;
                    }

                    $(this).attr("src", enter_img_url);

                }

            }, function() {
                //マウスが外れた時
                if (_pm.leavese != "") {
                    that.kag.ftag.startTag("playse", {
                        "storage" : _pm.leavese,
                        "stop" : true
                    });
                }

                //元に戻す
                if (_pm.enterimg != "") {

                    var enter_img_url = "";
                    if ($.isHTTP(_pm.graphic)) {
                        enter_img_url = _pm.graphic;
                    } else {
                        enter_img_url = "./data/" + _pm.folder + "/" + _pm.graphic;
                    }

                    $(this).attr("src", enter_img_url);

                }

            });

            j_button.click(function(event) {
                
                if (_pm.clickimg != "") {

                    var click_img_url = "";
                    if ($.isHTTP(_pm.clickimg)) {
                        click_img_url = _pm.clickimg;
                    } else {
                        click_img_url = "./data/" + _pm.folder + "/" + _pm.clickimg;
                    }

                    j_button.attr("src", click_img_url);

                }

    
                //fix指定のボタンは、繰り返し実行できるようにする
                if (button_clicked == true && _pm.fix == "false") {
                    return false;
                }
                
                //Sタグに到達していないとクリッカブルが有効にならない fixの時は実行される必要がある
                if (that.kag.stat.is_strong_stop != true && _pm.fix == "false") {
                    return false;
                }

                button_clicked = true;

                if (_pm.exp != "") {
                    //スクリプト実行
                    that.kag.embScript(_pm.exp, preexp);
                }

                if (_pm.savesnap == "true") {

                    //セーブスナップを取る場合、アニメーション中やトランジションはNG
                    if (that.kag.stat.is_stop == true) {
                        return false;
                    }
                    
                    //ここは、現在のセーブ用のメッセージを取得しよう
                    that.kag.menu.snapSave(that.kag.stat.current_save_str);
                    
                }
                
                
                //画面効果中は実行できないようにする
                if(that.kag.layer.layer_event.css("display") =="none" && that.kag.stat.is_strong_stop != true){
                    return false;
                }
                

                //roleが設定されている場合は対応する処理を実行
                //指定できる文字列はsave(セーブ画面を表示します)。load(ロード画面を表示します)。title(タイトル画面に戻ります)。menu(メニュー画面を表示します)。message(メッセージウィンドウを非表示にします)。skip(スキップの実行)
                if (_pm.role != "") {

                    //roleがクリックされたら、skip停止 
                    that.kag.stat.is_skip = false; 
                                       
                    //オートは停止
                    if(_pm.role!="auto"){
                        that.kag.ftag.startTag("autostop", {next:"false"});
                    }
                    
                    //文字が流れているときは、セーブ出来ないようにする。
                    if(_pm.role =="save" || 
                    _pm.role =="menu" || 
                    _pm.role=="quicksave"||  
                    _pm.role=="sleepgame"){
                        
                        //テキストが流れているときとwait中は実行しない
                        if(that.kag.stat.is_adding_text == true || that.kag.stat.is_wait == true){
                            return false; 
                        }
                        
                    }
                    
                    switch(_pm.role) {
                        
                        case "save":
                            that.kag.menu.displaySave();
                            break;

                        case "load":
                            that.kag.menu.displayLoad();
                            break;

                        case "window":
                            that.kag.layer.hideMessageLayers();
                            break;
                        case "title":
                            that.kag.backTitle();
                            break;
                           
                        case "menu":
                            that.kag.menu.showMenu();
                            break;
                        case "skip":
                            that.kag.ftag.startTag("skipstart", {});
                            break;
                        case "backlog":
                            that.kag.menu.displayLog();
                            break;
                        case "fullscreen":
                            that.kag.menu.screenFull();
                            break;
                        case "quicksave":
                            that.kag.menu.setQuickSave();
                            break;
                        case "quickload":
                            that.kag.menu.loadQuickSave();
                            break;
                        case "auto":
                            
                            if(that.kag.stat.is_auto==true){
                                that.kag.ftag.startTag("autostop", {next:"false"});
                            }else{
                                that.kag.ftag.startTag("autostart", {});
                            }
                            break;
                            
                        case "sleepgame":
                            
                            //押されたオブジェクトのマウスオーバーをsleepgame前に解除
                            j_button.trigger("mouseout");
                            
                            if(that.kag.tmp.sleep_game != null){
                                return false;
                            }
                            
                            //ready
                            that.kag.tmp.sleep_game = {};
                            
                            _pm.next=false;
                            
                            that.kag.ftag.startTag("sleepgame", _pm);
                            break;

                    }
                    
                    //クリックされた時に音が指定されていたら
                    if (_pm.clickse != "") {
                        that.kag.ftag.startTag("playse", {
                            "storage" : _pm.clickse,
                            "stop" : true
                        });
                    }

                    //バグリングさせない
                    event.stopPropagation();

                    //ジャンプは行わない
                    return false;
                }
                
                //クリックされた時に音が指定されていたら
                if (_pm.clickse != "") {
                    that.kag.ftag.startTag("playse", {
                        "storage" : _pm.clickse,
                        "stop" : true
                    });
                }

                that.kag.layer.showEventLayer();
                
                //fixレイヤの場合はcallでスタックが積まれる
                if (_pm.role == "" && _pm.fix == "true") {
                    
                    //コールスタックが帰ってきてない場合は、実行しないようにする必要がある
                    //fixの場合はコールスタックに残る。
                    var stack_pm = that.kag.getStack("call"); //最新のコールスタックを取得
                    
                    if(stack_pm==null){
                       //callを実行する
                       //fixから遷移した場合はリターン時にnextorderしない
                       //strong_stopの場合は反応しない
                       //今がstrong_stopかどうかは時々刻々と変化するので、毎回新しくチェックする必要がある
                       //_pmはpmの参照コピーであるため、_pm.auto_nextを直接書き換えるわけにはいかない
                       var _auto_next = _pm.auto_next;
                       if(that.kag.stat.is_strong_stop == true){
                           _auto_next = "stop";
                       }else{
                           //パラメータ初期値が入るようになる
                           //_auto_next = "yes";
                       }
                       
                       that.kag.ftag.startTag("call", {
                           storage: _storage,
                           target: _target,
                           auto_next: _auto_next
                       });
                    
                    }else{
                        
                        //スタックで残された
                        that.kag.log("callスタックが残っている場合、fixボタンは反応しません");
                        that.kag.log(stack_pm);


                        return false;
                    }

                } else {

                    //jumpを実行する
                    that.kag.ftag.startTag("jump", _pm);

                }
                
                //選択肢の後、スキップを継続するか否か
                if(that.kag.stat.skip_link=="true"){
                    event.stopPropagation();
                }else{
                    that.kag.stat.is_skip = false; 
                }
                
            });

        })();

        
    }
    
    
    
};

/*
#[glink]
:group
ラベル・ジャンプ操作
:title
グラフィカルリンク
:exp
グラフィカルなボタンを表示することができます。画像は必要ありません
グラフィックリンク表示中は強制的にシナリオ進行が停止しますので、必ずジャンプ先を指定して下さい
また、グラフィックボタンの表示位置は直前のlocateタグによる指定位置を参照します。
ただし、x、y が指定されている場合は、そちらが優先されます。
ここから、移動した場合はコールスタックに残りません。つまり、リターンできないのでご注意ください
ジャンプ後は自動的に[cm]タグが実行され、ボタンは消失します
:sample

[glink target="j1" text="選択肢１" size=20  width="500" y=300]
[glink target="j2" text="選択肢２" size=30  width="500" y=400]
[glink target="j3" text="選択肢３" size=30  width="500" y=400]

[s]

:param
color=ボタンの色を指定できます。デフォルトはblackです（black gray white orange red blue rosy green pink）,
font_color=フォントの色を指定できます。0xRRGGBB 形式で指定してください。 ,
storage=ジャンプ先のシナリオファイルを指定します。省略すると、現在 のシナリオファイル内であると見なされます。,
target=ジャンプ先のラベルを指定します。省略すると、ファイルの先頭から実行されます。,
name=ティラノスクリプトのみ。animタグなどからこの名前でアニメーションさせることができます。でまた名前を指定しておくとクラス属性としてJSから操作できます。カンマで区切ることで複数指定することもできます,
text=ボタンの文字列です,
font_color=フォントの色を指定できます,
x=ボタンの横位置を指定します,
y=ボタンの縦位置を指定します。,
width=ボタンの横幅をピクセルで指定できます,
height=ボタンの高さをピクセルで指定できます,
preexp="タグが評価された時点で変数 preexpに値を格納します。つまり、ボタンがクリックされた時に、expでpreexpという変数が利用できます。",
exp=ボタンがクリックされた時に実行されるJSを指定できます。,
size=フォントサイズを指定できます。デフォルトは３０です,
face=フォントを指定できます。Webフォントを追加したい場合はfont.cssに定義を記述して下さい,
graphic=ボタンの背景画像を指定します。ファイルはプロジェクトフォルダのimageフォルダに入れて下さい。画像が指定された場合はcolorは無視されます,
enterimg=graphicが指定されている時に有効。カーソルが重なった時の画像を指定できます,
clickse=ボタンをクリックした時に再生される効果音を設定できます。効果音ファイルはsoundフォルダに配置してください,
enterse=ボタンの上にマウスカーソルが乗った時に再生する効果音を設定できます。効果音ファイルはsoundフォルダに配置してください,
leavese=ボタンの上からマウスカーソルが外れた時に再生する効果音を設定できます。効果音ファイルはsoundフォルダに配置してください。
#[end]
*/

//グラフィカルな選択肢を表示する　CSSボタン
tyrano.plugin.kag.tag.glink = {

    pm : {
        color : "black", //クラス名でいいよ
        font_color:"",
        storage : null,
        target : null,
        name : "",
        text : "",
        x : "auto",
        y : "",
        width : "",
        height : "",
        size : 30,
        graphic:"",
        enterimg:"",
        clickse:"",
        enterse:"",
        leavese:"",
        face:""
    },

    //イメージ表示レイヤ。メッセージレイヤのように扱われますね。。
    //cmで抹消しよう
    start : function(pm) {

        var that = this;
        var target_layer = null;
        target_layer = this.kag.layer.getFreeLayer();
        target_layer.css("z-index", 999999);

        var j_button = $("<div class='glink_button'>" + pm.text + "</div>");
        j_button.css("position", "absolute");
        j_button.css("cursor", "pointer");
        j_button.css("z-index", 99999999);
        j_button.css("font-size", pm.size + "px");
        
        if(pm.font_color !=""){
            j_button.css("color",$.convertColor(pm.font_color));
        }
        
        if (pm.height != "") {
            j_button.css("height", pm.height + "px");
        }

        if (pm.width != "") {
            j_button.css("width", pm.width + "px");
        }
        
        //graphic 背景画像を指定できます。
        if(pm.graphic !=""){
            
            //画像の読み込み
            
            j_button.removeClass("glink_button").addClass("button_graphic");
            var img_url = "./data/image/" + pm.graphic ;
            j_button.css("background-image","url("+img_url+")");
            j_button.css("background-repeat","no-repeat");
            j_button.css("background-position","center center");
            j_button.css("background-size","100% 100%");
            
        }else{
            j_button.addClass(pm.color);
        }
        
        if(pm.face !=""){
            j_button.css("font-family", pm.face);
        }else if(that.kag.stat.font.face !=""){
            j_button.css("font-family", that.kag.stat.font.face);
        }

        if (pm.x == "auto") {
            var sc_width = parseInt(that.kag.config.scWidth);
            var center = Math.floor(parseInt(j_button.css("width")) / 2);
            var base = Math.floor(sc_width / 2);
            var first_left = base - center;
            j_button.css("left", first_left + "px");

        } else if (pm.x == "") {
            j_button.css("left", this.kag.stat.locate.x + "px");
        } else {
            j_button.css("left", pm.x + "px");
        }

        if (pm.y == "") {
            j_button.css("top", this.kag.stat.locate.y + "px");
        } else {
            j_button.css("top", pm.y + "px");
        }

        //オブジェクトにクラス名をセットします
        $.setName(j_button, pm.name);
        
        that.kag.event.addEventElement({
            "tag":"glink",
            "j_target":j_button, //イベント登録先の
            "pm":pm
        });
        this.setEvent(j_button,pm);

        target_layer.append(j_button);
        target_layer.show();
        this.kag.ftag.nextOrder();

    },
    
    setEvent:function(j_button,pm){
         
         var that = TYRANO;
         
         (function() {

            var _target = pm.target;
            var _storage = pm.storage;
            var _pm = pm;
            var preexp = that.kag.embScript(pm.preexp);
            var button_clicked = false;

            j_button.click(function(e) {
                
                //クリックされた時に音が指定されていたら
                if (_pm.clickse != "") {
                    that.kag.ftag.startTag("playse", {
                        "storage" : _pm.clickse,
                        "stop" : true
                    });
                }

                //Sタグに到達していないとクリッカブルが有効にならない fixの時は実行される必要がある
                if (that.kag.stat.is_strong_stop != true) {
                    return false;
                }

                button_clicked = true;

                if (_pm.exp != "") {
                    //スクリプト実行
                    that.kag.embScript(_pm.exp, preexp);
                }

                that.kag.layer.showEventLayer();

                that.kag.ftag.startTag("cm", {});
                //コールを実行する
                that.kag.ftag.startTag("jump", _pm);
                
                //選択肢の後、スキップを継続するか否か
                if(that.kag.stat.skip_link=="true"){
                    e.stopPropagation();
                }else{
                    that.kag.stat.is_skip = false; 
                }

            });
            
            j_button.hover(function() {

                if (_pm.enterimg != "") {
                    var enterimg_url = "./data/image/" + _pm.enterimg;
                    j_button.css("background-image", "url(" + enterimg_url + ")");
                }

                //マウスが乗った時
                if (_pm.enterse != "") {
                    that.kag.ftag.startTag("playse", {
                        "storage" : _pm.enterse,
                        "stop" : true
                    });
                }
                
            }, 
            function() {

                if (_pm.enterimg != "") {
                    var img_url = "./data/image/" + _pm.graphic;
                    j_button.css("background-image", "url(" + img_url + ")");
                }
                //マウスが乗った時
                if (_pm.leavese != "") {
                    that.kag.ftag.startTag("playse", {
                        "storage" : _pm.leavese,
                        "stop" : true
                    });
                }
            }); 

            

        })();
        
    
    }
};

/*
#[clickable]
:group
ラベル・ジャンプ操作
:title
クリック可能な領域を設定
:exp
透明なクリック可能領域を設定することができます。
クリッカブルエリアの表示中は強制的にシナリオ進行が停止しますので、必ずジャンプ先を指定して下さい
また、グラフィックボタンの表示位置は直前のlocateタグによる指定位置を参照します
ここから、移動した場合はコールスタックに残りません。つまり、リターンできないのでご注意ください
☆重要：[s]タグに到達していない間は、クリッカブルは有効になりません。かならず、[s]タグでゲームを停止してください。
:sample
[locate x=20 y=100]
[clickable width=200 height=300 target=*oda]

[locate x=300 y=100]
[clickable width=100 height=100 border="solid:1px:gray" target=*oda]

[s]

:param
width=領域の横幅を指定します,
height=領域に高さを指定します,
x=領域の左端位置のX座標を指定します,
y=領域の左端位置のY座標を指定します。,
borderstyle=領域に線を表示することができます。「線の太さ:線の種類（CSS準拠）:線の色」のフォーマットで記述して下さい。線の種類はsolid double groove dashed dotted などが指定できます,　
color=表示色を 0xRRGGBB 形式で指定 します。 ,
opacity=領域の不透明度を 0 ～ 255 の数値で指定します0で完全 に透明です。,
mouseopacity=領域にマウスが乗った時透明度を変更することができます。領域の不透明度を 0 ～ 255 の数値で指定します0で完全 に透明です,
storage=クリックされた際のジャンプ先のシナリオファイルを指定します。省略すると、現在 のシナリオファイル内であると見なされます。,
target=クリックされた際のジャンプ先のラベルを指定します。省略すると、ファイルの先頭から実行されます。
#[end]
*/

//指定した位置にグラフィックボタンを配置する
tyrano.plugin.kag.tag.clickable = {

    vital : ["width", "height"],

    pm : {
        width : "0",
        height : "0",
        x : "",
        y : "",
        border : "none",
        color : "",
        mouseopacity : "",
        opacity : "140",
        storage : null,
        target : null,
        name : ""
    },

    //イメージ表示レイヤ。メッセージレイヤのように扱われますね。。
    //cmで抹消しよう
    start : function(pm) {

        var that = this;

        //this.kag.stat.locate.x
        var layer_free = this.kag.layer.getFreeLayer();

        layer_free.css("z-index", 9999999);

        var j_button = $("<div />");
        j_button.css("position", "absolute");
        j_button.css("cursor", "pointer");
        j_button.css("top", this.kag.stat.locate.y + "px");
        j_button.css("left", this.kag.stat.locate.x + "px");
        j_button.css("width", pm.width + "px");
        j_button.css("height", pm.height + "px");
        j_button.css("opacity", $.convertOpacity(pm.opacity));
        j_button.css("background-color", $.convertColor(pm.color));
        j_button.css("border", $.replaceAll(pm.border, ":", " "));

        //alert($.replaceAll(pm.border,":"," "));

        //x,y 座標が指定されている場合は、そっちを採用
        if (pm.x != "") {
            j_button.css("left", parseInt(pm.x));
        }

        if (pm.y != "") {
            j_button.css("top", parseInt(pm.y));
        }
        
        //クラスとイベントを登録する
        that.kag.event.addEventElement({
            "tag":"clickable",
            "j_target":j_button, //イベント登録先の
            "pm":pm
        });

        that.setEvent(j_button,pm);

        layer_free.append(j_button);
        layer_free.show();

        this.kag.ftag.nextOrder();

    },
    
    setEvent:function(j_button,pm){
        
        var that = TYRANO;
                
        (function() {

            var _target = pm.target;
            var _storage = pm.storage;
            var _pm = pm;

            if (_pm.mouseopacity != "") {

                j_button.bind("mouseover", function() {
                    j_button.css("opacity", $.convertOpacity(_pm.mouseopacity));

                });

                j_button.bind("mouseout", function() {
                    j_button.css("opacity", $.convertOpacity(_pm.opacity));
                });

            }

            j_button.click(function() {

                //Sタグに到達していないとクリッカブルが有効にならない

                var is_s = (function(obj) {
                    if (obj.kag.stat.is_strong_stop != true) {
                        return false;
                    }

                    return true;

                })(that);

                if (is_s == false) {
                    return false;
                }

                that.kag.ftag.startTag("cm", {});
                //コールを実行する
                that.kag.layer.showEventLayer();
                that.kag.ftag.startTag("jump", _pm);


            });

        })();
        
    
    }
    
};

/*
#[glyph]
:group
システム操作
:title
クリック待ち記号の指定
:exp
クリック待ち記号を表示する位置を設定できます
クリック記号はプロジェクトフォルダのtyrano/images/system/nextpage.gifを変更することで対応します
:sample
[glyph  fix=true left=200 top=100 ]

:param
line=クリック待ちの表示画像を指定することができます。tyrano/images/system/nextpage.gifと同一のフォルダに配置してください,
fix=trueを指定すると、left、及び、topを指定した位置に表示されます。,
left=fix 属性を true にしたときに記号を表示する位置のうち、左端位置を 指定します,
top=fix 属性を true にしたときに記号を表示する位置のうち、上端位置を 指定します

#[end]
*/

//指定した位置にグラフィックボタンを配置する
tyrano.plugin.kag.tag.glyph = {

    pm : {
        line : "nextpage.gif",
        layer : "message0",
        fix : "false",
        left : 0,
        top : 0
    },

    //イメージ表示レイヤ。メッセージレイヤのように扱われますね。。
    //cmで抹消しよう
    start : function(pm) {

        var that = this;

        $(".glyph_image").remove();

        if (pm.fix == "true") {

            var j_layer = this.kag.layer.getLayer(pm.layer);

            var j_next = $("<img class='glyph_image' />");
            j_next.attr("src", "./tyrano/images/system/" + pm.line);
            j_next.css("position", "absolute");
            j_next.css("z-index", 99999);
            j_next.css("top", pm.top + "px");
            j_next.css("left", pm.left + "px");
            j_next.css("display", "none");

            j_layer.append(j_next);

            this.kag.stat.flag_glyph = "true";

        } else {

            this.kag.stat.flag_glyph = "false";

        }

        this.kag.ftag.nextOrder();

    }
};

//スタイル変更は未サポート
/*
tyrano.plugin.kag.tag["style"] = {

pm:{

},

start:function(pm){

}
};
*/

/*
#[trans]
:group
レイヤ関連
:title
レイヤのトランジション
:exp
指定したレイヤでトランジションを行います。
トランジションは、常に裏ページの対象のレイヤが、表ページの対象のレイヤに 入れ替わる方向で行われます。
トランジション後は、表ページの対象のレイヤの画像、位置、サイズ、可視・不可視 の状態は裏ページの対象のレイヤと同じになります。
また、トランジション中はレイヤの属性変更などは行わないで下さい
:sample
[backlay]
[image storage=fg0 layer=0 page=back]
[trans time=1500 ]
[wt]
:param
layer=対象となるレイヤを指定します。<br>
base を指定すると 背景レイヤ になります。<br>
0 以上の整数を指定すると前景レイヤになります。<br>
message0 または message1 を指定するとメッセージレイヤにな ります。<br>
単に message とのみ指定した場合は、 current タグで指定した現在の操作対象のメッセージレイヤが 対象になります <br>
<br>
通常は背景の変更などに使用されます。,
children=【廃止】falseの場合、layerで指定した場所だけtrans します。デフォルトはfalseです,
time=トランジションを行っている時間をミリ秒で指定します。,
method=切り替えのタイプを指定します。デフォルトは"fadeIn"です。指定できる演出は次の通りです。
（V450以降）
fadeIn/
fadeInDown/
fadeInLeft/
fadeInRight/
fadeInUp/<br >
lightSpeedIn/
rotateIn/
rotateInDownLeft/
rotateInDownRight/
rotateInUpLeft/<br >
rotateInUpRight/
zoomIn/
zoomInDown/
zoomInLeft/<br >
zoomInRight/
zoomInUp/
slideInDown/
slideInLeft/<br >
slideInRight/
slideInUp/
bounceIn /
bounceInDown/ <br >
bounceInLeft/
bounceInRight/
bounceInUp/
rollIn
(V450以前)
指定できる効果は「crossfade」「explode」「slide」「blind」「bounce」「clip」「drop」「fold」「puff」「scale」「shake」「size」

#[end]
*/

//トランジション
tyrano.plugin.kag.tag.trans = {

    vital : ["time","layer"],

    pm : {
        layer : "base",
        method : "fadeIn",
        children : false,
        time : 1500
    },

    start : function(pm) {

        this.kag.ftag.hideNextImg();
        this.kag.stat.is_trans = true;
        var that = this;

        //backを徐々に表示して、foreを隠していく。
        //アニメーションが終わったら、back要素を全面に配置して完了

        //指定したレイヤーのみ、フェードする

        var comp_num = 0;
        var layer_num = $.countObj(this.kag.layer.map_layer_fore);

        //ここがチルドレンの場合、必ず即レイヤ実行ね
        if (pm.children == "false") {
            layer_num = 0;
        }
        
        var map_layer_fore = $.cloneObject(this.kag.layer.map_layer_fore);
        var map_layer_back = $.cloneObject(this.kag.layer.map_layer_back);
        

        for (key in map_layer_fore ) {

            //指定条件のレイヤのみ実施
            if (pm.children == true || key === pm.layer) {

                (function() {

                    var _key = key;

                    var layer_fore = map_layer_fore[_key];
                    var layer_back = map_layer_back[_key];

                    //メッセージレイヤの場合、カレント以外はトランスしない。むしろ非表示
                    //if((_key.indexOf("message")!=-1 && _key !== that.kag.stat.current_layer) || (_key.indexOf("message")!=-1 && layer_back.attr("l_visible") == "false") ){
                    
                    if ((_key.indexOf("message") != -1 && layer_back.attr("l_visible") == "false")) {

                        comp_num++;
                        that.kag.layer.forelay(_key);

                    } else {
                        
                        /*
                        $.trans_old(pm.method, layer_fore, parseInt(pm.time), "hide", function() {
                        });
                        layer_back.css("display", "none");
                        */
                        
                        $.trans(pm.method, layer_back, parseInt(pm.time), "show", function() {
                            comp_num++;
                            that.kag.layer.forelay(_key);
                            
                            that.kag.ftag.completeTrans();
                            
                            that.kag.ftag.hideNextImg();

                        });

                    }

                })();
            }
        }

        this.kag.ftag.nextOrder();

    }
};



/*
#[bg]
:group
レイヤ関連
:title
背景の切り替え
:exp
背景の切り替えを簡易的に実行できます。
常にforeのレイヤに対して切り替えが実行されます
:sample
[bg storage=fg0.png time=1500 wait=true]
:param
storage=切り替えるための画像ファイルを指定します。ファイルはbgimage以下に配置してください,
time=時間をミリ秒で指定します。,
wait=背景の切り替えが完了するまで処理を待ちます,
cross=true or false を指定します。デフォルトはfalse。trueを指定すると２つの画像が同じタイミングで透明になりながら入れ替わります。falseを指定すると、古い背景を残しながら上に重なる形で新しい背景を表示します。CG差分などで使用する場合はfalseが良いでしょう。,
method=切り替えのタイプを指定します。デフォルトは"fadeIn"です。指定できる演出は次の通りです。
（V450以降）
fadeIn/
fadeInDown/
fadeInLeft/
fadeInRight/
fadeInUp/<br >
lightSpeedIn/
rotateIn/
rotateInDownLeft/
rotateInDownRight/
rotateInUpLeft/<br >
rotateInUpRight/
zoomIn/
zoomInDown/
zoomInLeft/<br >
zoomInRight/
zoomInUp/
slideInDown/
slideInLeft/
slideInRight/<br >
slideInUp/
bounceIn /
bounceInDown/ 
bounceInLeft/<br >
bounceInRight/
bounceInUp/
rollIn/
vanishIn/
puffIn
(V450以前)
指定できる効果は「crossfade」「explode」「slide」「blind」「bounce」「clip」「drop」「fold」「puff」「scale」「shake」「size」
#[end]
*/

//背景変更
tyrano.plugin.kag.tag.bg = {

    vital : ["storage"],

    pm : {
        storage : "",
        method : "crossfade",
        wait : "true",
        time : 3000,
        cross:"false"
    },

    start : function(pm) {

        this.kag.ftag.hideNextImg();

        var that = this;
        
        // time=0 and wait=true conflicts
        // may be some code refactor needed
        if (pm.time == 0) pm.wait = "false";

        //現在の背景画像の要素を取得

        //クローンして、同じ階層に配置する
        
        var storage_url = "./data/bgimage/"+pm.storage;
        if($.isHTTP(pm.storage)){
            storage_url = pm.storage;  
        }
        
        //jqyeru で一つを削除して、もう一方を復活させる
        this.kag.preload(storage_url, function(){
            
            var j_old_bg = that.kag.layer.getLayer("base", "fore");
            var j_new_bg = j_old_bg.clone(false);
            
            j_new_bg.css("background-image","url("+storage_url+")");
            j_new_bg.css("display","none");
            
            j_old_bg.after(j_new_bg);
            
            that.kag.ftag.hideNextImg();
            that.kag.layer.updateLayer("base","fore",j_new_bg);

            if (pm.wait == "true") {
                that.kag.layer.hideEventLayer();
            }
            
            
            //スキップ中は時間を短くする
            pm.time = that.kag.cutTimeWithSkip(pm.time);
            
            if(pm.cross=="true"){   //crossがfalseの場合は、古い背景はtransしない。
                $.trans(pm.method, j_old_bg, parseInt(pm.time), "hide", function() {
                    j_old_bg.remove();
                });
            }
            
            $.trans(pm.method, j_new_bg, parseInt(pm.time), "show", function() {
                
                j_new_bg.css("opacity",1);
                
                //crossがfalseの場合は、古い背景画像を削除
                if(pm.cross=="false"){
                    j_old_bg.remove();
                }
                
                if (pm.wait == "true") {
                    that.kag.layer.showEventLayer();
                    that.kag.ftag.nextOrder();
                }
                
            });
            
            //レイヤの中で、画像を取得する
            
        });
        
        if (pm.wait == "false") {
            this.kag.ftag.nextOrder();
        }
    }
};



/*
#[bg2]
:group
レイヤ関連
:title
背景の切り替え
:exp
背景の切り替えを簡易的に実行できます。
常にforeのレイヤに対して切り替えが実行されます
:sample
[bg storage=fg0.png time=1500 wait=true]
:param
name=animタグなどからこの名前でアニメーションさせることができます。また、名前を指定しておくとクラス属性としてJSから操作できます。カンマで区切ることで複数指定することもできます,
storage=切り替えるための画像ファイルを指定します。ファイルはbgimage以下に配置してください,
left=画像の左端位置を指定します。デフォルトは０です（ピクセル）,
top=画像の上端位置を指定します。デフォルトは０です（ピクセル）,
width=画像の横幅を指定します。（ピクセル）指定しない場合はゲーム画面に一致するサイズが設定されます,
height=画像の高さ位置を指定します。（ピクセル）指定しない場合はゲーム画面に一致するサイズが設定されます,
time=時間をミリ秒で指定します。,
wait=背景の切り替えが完了するまで処理を待ちます,
cross=true or false を指定します。デフォルトはfalse。trueを指定すると２つの画像が同じタイミングで透明になりながら入れ替わります。falseを指定すると、古い背景を残しながら上に重なる形で新しい背景を表示します。CG差分などで使用する場合はfalseが良いでしょう。,
method=切り替えのタイプを指定します。デフォルトは"fadeIn"です。指定できる演出は次の通りです。
（V450以降）
fadeIn/
fadeInDown/
fadeInLeft/
fadeInRight/
fadeInUp/<br >
lightSpeedIn/
rotateIn/
rotateInDownLeft/
rotateInDownRight/
rotateInUpLeft/<br >
rotateInUpRight/
zoomIn/
zoomInDown/
zoomInLeft/<br >
zoomInRight/
zoomInUp/
slideInDown/
slideInLeft/
slideInRight/<br >
slideInUp/
bounceIn /
bounceInDown/ 
bounceInLeft/<br >
bounceInRight/
bounceInUp/
rollIn/
vanishIn/
puffIn
(V450以前)
指定できる効果は「crossfade」「explode」「slide」「blind」「bounce」「clip」「drop」「fold」「puff」「scale」「shake」「size」
#[end]
*/

//背景変更
tyrano.plugin.kag.tag.bg2 = {

    vital : ["storage"],

    pm : {
        name:"",
        storage : "",
        method : "crossfade",
        wait : "true",
        time : 3000,
        
        width:"",
        height:"",
        left:"",
        top:"",
        
        cross:"false"
    },

    start : function(pm) {

        this.kag.ftag.hideNextImg();

        var that = this;
        
        // time=0 and wait=true conflicts
        // may be some code refactor needed
        if (pm.time == 0) pm.wait = "false";

        //現在の背景画像の要素を取得

        //クローンして、同じ階層に配置する
        var storage_url = "./data/bgimage/"+pm.storage;
        if($.isHTTP(pm.storage)){
            storage_url = pm.storage;  
        }
        
        //jquery で一つを削除して、もう一方を復活させる
        this.kag.preload(storage_url, function(){
            
            var j_old_bg = that.kag.layer.getLayer("base", "fore");
            var j_new_bg = j_old_bg.clone(false);
            
            //オブジェクトに変更
            var j_bg_img = $("<img />");
            j_bg_img.css("positioin","absolute");
            
            var scWidth = parseInt(that.kag.config.scWidth);
            var scHeight = parseInt(that.kag.config.scHeight);
            var left= 0;
            var top = 0; 
            
            if(pm.width!=""){
                scWidth = parseInt(pm.width);
            }
            
            if(pm.height!=""){
                scHeight = parseInt(pm.height);
            }
            
            if(pm.left!=""){
                left = parseInt(pm.left);
            }
            
            if(pm.top!=""){
                top = parseInt(pm.top);
            }
            
            j_bg_img.css({
                width:scWidth,
                height:scHeight,
                left:left,
                top:top
            });
            
            j_bg_img.attr("src",storage_url);
            
            $.setName(j_new_bg, pm.name);
        
            j_new_bg.find("img").remove();
            j_new_bg.append(j_bg_img);
            
            
            ////ここまで
            j_new_bg.css("display","none");
            
            j_old_bg.after(j_new_bg);
            
            that.kag.ftag.hideNextImg();
            that.kag.layer.updateLayer("base","fore",j_new_bg);

            if (pm.wait == "true") {
                that.kag.layer.hideEventLayer();
            }
            
            //スキップ中は時間を短くする
            pm.time = that.kag.cutTimeWithSkip(pm.time);
            
            if(pm.cross=="true"){   //crossがfalseの場合は、古い背景はtransしない。
                $.trans(pm.method, j_old_bg, parseInt(pm.time), "hide", function() {
                    j_old_bg.remove();
                });
            }
            
            $.trans(pm.method, j_new_bg, parseInt(pm.time), "show", function() {
                
                j_new_bg.css("opacity",1);
                
                //crossがfalseの場合は、古い背景画像を削除
                if(pm.cross=="false"){
                    j_old_bg.remove();
                }
                
                if (pm.wait == "true") {
                    that.kag.layer.showEventLayer();
                    that.kag.ftag.nextOrder();
                }
                
            });
            
            //レイヤの中で、画像を取得する
            
        });
        
        if (pm.wait == "false") {
            this.kag.ftag.nextOrder();
        }
    }
};



/*
#[layermode]
:group
レイヤ関連
:title
レイヤーモード
:exp
レイヤの合成を行うことができます。
PCゲーム環境での推奨機能です。
一部ブラウザIE,Edge では動作しませんのでご注意ください
:sample
[layermode graphic=fg0.png time=1500 mode=overlay]
:param
name=レイヤ合成に名前をつけることができます。この名前はfree_layremovdeで特定の合成のみを消したい際に使用できます,
graphic=合成する画像ファイルを指定してください。ファイルはimageフォルダに配置しします,
color=合成に色を指定することができます0xFFFFFF形式で指定してください,
mode=合成方法を指定できます。デフォルトは「multiply」 次の効果が使えます→ multiply（乗算）screen（スクリーン）overlay（オーバーレイ）darken（暗く）lighten（明るく）color-dodge（覆い焼きカラー）color-burn（焼き込みカラー）hard-light（ハードライト）soft-light（ソフトライト）difference（差の絶対値）exclusion（除外）hue（色相）saturation（彩度）color（カラー）luminosity（輝度）,
folder=graphicで指定する画像のフォルダを変更できます。例えばbgimageと指定することで、背景画像から取得することができます。,
opacity=不透明度を 0 ～ 255 の数値で指定します。0 で完全 に透明です。デフォルトは透明度指定なしです,
time=合成はフェードインで行われます。合成が完了する時間をミリ秒(１秒=1000ミリ秒)で指定します。デフォルトは500ミリ秒です,
wait=合成の完了を待つか否かを指定できます。trueかfalseを指定してください。デフォルトはtrueです


#[end]
*/

//背景変更
tyrano.plugin.kag.tag.layermode = {

    vital : [],

    pm : {
        name:"", //レイヤーモードに名前をつけることができます。
        graphic : "", //画像をブレンドする場合は指定する。カンマで区切って複数指定にも対応。 image指定
        color : "", //色をブレンドする場合
        mode:"multiply", //multiply（乗算）,screen（スクリーン）,overlay（オーバーレイ）,darken（暗く）,lighten（明るく）,color-dodge（覆い焼きカラー）,color-burn（焼き込みカラー）,hard-light（ハードライト）,soft-light（ソフトライト）,difference（差の絶対値）,exclusion（除外）,hue（色相）,saturation（彩度）,color（カラー）,luminosity（輝度）
        folder:"",
        opacity:"", //opacity=メッセージレイヤの不透明度を 0 ～ 255 の数値で指定しま す(文字の不透明度や、レイヤ自体の不透明度ではありません)。0 で完全 に透明です。,
        time :"500", //時間,
        wait : "true" //演出の終わりを待つかどうか
        
    },

    start : function(pm) {

        this.kag.ftag.hideNextImg();

        var that = this;
        
        var blend_layer = null;
        
        blend_layer = $("<div class='layer_blend_mode blendlayer' style='display:none;position:absolute;width:100%;height:100%;z-index:99'></div>");
        
        
        if(pm.name!=""){
            blend_layer.addClass("layer_blend_"+pm.name);
        }
        
        if(pm.color!=""){
            blend_layer.css("background-color",$.convertColor(pm.color));
        }
        
        if(pm.opacity !=""){
            blend_layer.css("opacity", $.convertOpacity(pm.opacity));    
        }
        
        
        if (pm.folder != "") {
            folder = pm.folder;
        } else {
            folder = "image";
        }
        
        var storage_url = "";
        
        if(pm.graphic!=""){
            storage_url = "./data/"+folder+"/"+pm.graphic;
            blend_layer.css("background-image","url("+storage_url+")");
        }
        
        blend_layer.css("mix-blend-mode",pm.mode);
        
        
        $("#tyrano_base").append(blend_layer);
        
        
        //j_new_bg.css("background-image","url("+storage_url+")");
            
        
        //background: #0bd url(beach-footprint.jpg) no-repeat;
        //background-blend-mode: screen;
        
        if(pm.graphic!=""){
            
            this.kag.preload(storage_url, function(){
                
                blend_layer.fadeIn(parseInt(pm.time),function(){
                    
                    if(pm.wait=="true"){
                        that.kag.ftag.nextOrder();
                    }
                    
                });
            });
        
        }else{
        
            blend_layer.fadeIn(parseInt(pm.time),function(){
                
                if(pm.wait=="true"){
                    that.kag.ftag.nextOrder();
                }
                
            });
        
        }
        
        if(pm.wait=="false"){
            this.kag.ftag.nextOrder();
        }
        
    }
};


/*
#[layermode_movie]
:group
レイヤ関連
:title
レイヤーモード動画
:exp
ゲーム画面に動画を合成を行うことができます。
PCゲーム環境での推奨機能です。
一部ブラウザIE,Edge では動作しませんのでご注意ください
効果を打ち消す場合は[free_layermode]タグを使用します。
動画形式はogv webm mp4 などに対応します
提供するゲームによって対応するフォーマットが異なります。
PCゲーム形式の場合は webm形式を使ってください。 mp4 に対応しません。
 
:sample
[layermode_movie video=test.webm time=1500 wait=true]
:param
name=レイヤ合成に名前をつけることができます。この名前はfree_layremovdeで特定の合成のみを消したい際に使用できます,
video=合成する動画ファイルを指定してください。ファイルはvideoフォルダに配置しします,
volume=合成する動画の音ボリュームを指定します。0〜100で指定します。デフォルトは０の消音です,
loop=動画をループするか否かをtrueかfalseで指定します。デフォルトはtrueです。ループ指定した場合、free_layermodeを行うまで演出が残ります。,
speed=動画の再生スピードを指定できます。デフォルトは１ つまり2を指定すると２倍速、0.5を指定すると半分の速度で再生されます,
mode=合成方法を指定できます。デフォルトは「multiply」 次の効果が使えます→ multiply（乗算）screen（スクリーン）overlay（オーバーレイ）darken（暗く）lighten（明るく）color-dodge（覆い焼きカラー）color-burn（焼き込みカラー）hard-light（ハードライト）soft-light（ソフトライト）difference（差の絶対値）exclusion（除外）hue（色相）saturation（彩度）color（カラー）luminosity（輝度）,
opacity=不透明度を 0 ～ 255 の数値で指定します。0 で完全 に透明です。デフォルトは透明度指定なしです,
time=合成はフェードインで行われます。合成が完了する時間をミリ秒(１秒=1000ミリ秒)で指定します。デフォルトは500ミリ秒です,
wait=動作効果の再生完了を待つか否かをtrueかfalseで指定できます。デフォルトはfalseです

#[end]
*/

//背景変更
tyrano.plugin.kag.tag.layermode_movie = {

    vital : ["video"],

    pm : {
        name:"", 
        mode:"multiply", 
        opacity:"",
        time :"500", //時間,
        wait : "false", //演出の終わりを待つかどうか
        video:"", //ビデオをレイヤーとして追加する。
        volume:"",
        loop:"true",
        speed:"",
        stop:"false" //trueでnextorderを無効化。ロード復帰の時用
    },

    start : function(pm) {

        this.kag.ftag.hideNextImg();

        var that = this;
        
        var blend_layer = null;
        
        blend_layer = $("<video class='layer_blend_mode blendlayer blendvideo' data-video-name='"+pm.name+"' data-video-pm='' style='display:none;position:absolute;width:100%;height:100%;z-index:99' ></video>");
        var video = blend_layer.get(0);
        var url = "./data/video/" + pm.video;
        
        video.src = url;

        if (pm.volume != "") {
            video.volume = parseFloat(parseInt(pm.volume) / 100);
        } else {
            video.volume = 0;
        }
        
        if(pm.speed !=""){
            video.defaultPlaybackRate = parseFloat(pm.speed);
        }
    
        video.style.backgroundColor = "black";
        video.style.position = "absolute";
        video.style.top = "0px";
        video.style.left = "0px";
        video.style.width = "auto";
        video.style.height = "auto";
        video.style.minHeight="100%";
        video.style.minWidth="100%";
        video.style.backgroundSize = "cover";
        
        video.autoplay = true;
        video.autobuffer = true;
        
        
        video.setAttribute("playsinline","1");
        
        if (pm.loop == "true") {
            video.loop = true;
        } else {
            video.loop = false;
        }
        
        //ビデオ再生完了時
        video.addEventListener("ended", function(e) {
            if(pm.wait=="true"){
                that.kag.ftag.nextOrder();
            }
        });
        
        var j_video = $(video);
        
        j_video.attr("data-video-pm",JSON.stringify(pm));
        
        j_video.hide();
    
        video.load();
        video.play();
        
        blend_layer = j_video;
       
    
        if(pm.name!=""){
            blend_layer.addClass("layer_blend_"+pm.name);
        }
        
        if(pm.opacity !=""){
            blend_layer.css("opacity", $.convertOpacity(pm.opacity));    
        }
        
        blend_layer.css("mix-blend-mode",pm.mode);
        
        
        $("#tyrano_base").append(blend_layer);
        
        blend_layer.fadeIn(parseInt(pm.time),function(){
                
                if(pm.wait=="true" && pm.loop=="true"){
                    if(pm.stop!="true"){
                        that.kag.ftag.nextOrder();
                    }
                }
                
            });
        
        if(pm.wait=="false"){
            if(pm.stop!="true"){
                this.kag.ftag.nextOrder();
            }
        }
        
    }
};




/*
#[free_layermode]
:group
レイヤ関連
:title
レイヤーモードの開放
:exp
レイヤの合成を取り消します
:sample
[free_layermode name="test"]
:param
name=名前を指定して合成を行っている場合、ここで特定の合成のみを削除することも可能です。指定しない場合はすべての効果が消されます,
time=合成はフェードアウトで消えていきます。フェードアウトにかかる時間をミリ秒で指定できます。デフォルトは500ミリ秒です,
wait=フェードアウトの完了を待つか否かをtrueかfalseで指定できます。デフォルトはtrueです。

#[end]
*/

//背景変更
tyrano.plugin.kag.tag.free_layermode = {

    vital : [],

    pm : {
        name:"", //レイヤーモードに名前をつけることができます。
        time :"500", //時間,
        wait : "true" //演出の完了を待つかどうか
    },

    start : function(pm) {

        this.kag.ftag.hideNextImg();

        var that = this;
        
        var blend_layer = {};
        
        if(pm.name!=""){
            blend_layer = $(".layer_blend_" + pm.name);
        }else{
            blend_layer = $(".blendlayer");
        }
        
        var cnt = blend_layer.size();
        var n = 0;
        
        //フリーにするレイヤがない場合
        if(cnt==0){
            that.kag.ftag.nextOrder();
            return;
        }
        
        blend_layer.each(function(){
        
            var blend_obj = $(this);
            blend_obj.fadeOut(parseInt(pm.time),function(){
                blend_obj.remove();
                n++;
                if(pm.wait=="true"){
                    if(cnt==n){ 
                        that.kag.ftag.nextOrder();
                    }
                }
            });     
        
        });
        
        
        if(pm.wait=="false"){
            this.kag.ftag.nextOrder();
        }
        
    }
};














