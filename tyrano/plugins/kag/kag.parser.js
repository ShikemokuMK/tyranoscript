
tyrano.plugin.kag.parser ={
    
    tyrano:null,
    kag:null,
    
    flag_script:false , //スクリプト解析中なら
    deep_if: 0,
	
    init:function(){
     
        //alert("kag.parser 初期化");
        //this.tyrano.test();
        
        
    },
    
    loadConfig:function(call_back){
        
        var that = this;
        
        //同じディレクトリにある、KAG関連のデータを読み込み
        $.loadText("./data/system/Config.tjs",function(text_str){
            
            var map_config = that.compileConfig(text_str);
            
            if(call_back){
                call_back(map_config);
            }
            
        });
        
    },
    
    //コンフィグファイルをデータ構造に格納
    compileConfig:function(text_str){
        
        var error_str ="";
        var map_config = {};
        
        var array_config = text_str.split("\n");
        
        for(var i=0; i< array_config.length;i++){
        
            try{
            
                var line_str = $.trim(array_config[i]); 
                if(line_str !="" && line_str.substr(0,1)===";"){
                    
                    var tmp_comment = line_str.split("//");
                    if(tmp_comment.length>1){
                        line_str = $.trim(tmp_comment[0]);
                    }
                    
                    line_str = $.replaceAll(line_str,";","");
                    line_str = $.replaceAll(line_str,"\"","");
                    
                    var tmp = line_str.split("=");
                
                    var key = $.trim(tmp[0]);
                    var val = $.trim(tmp[1]);
                    map_config[key] = val;
                }
            
            }catch(e){
                
                error_str +="Error:Config.tjsに誤りがあります/行:"+i+"";
                
            }
                
        }
        
        if(error_str !=""){
            alert(error_str);
        }
       
        return map_config;
       
    },
    
    //シナリオをオブジェクト化する
    parseScenario:function(text_str){
        
        var array_s = [];
        
        var map_label = {}; //ラベル一覧
        
        var array_row = text_str.split("\n");
        
        var flag_comment = false; //コメント中なら
        
        for(var i=0;i<array_row.length;i++){
            
            var line_str = $.trim(array_row[i]);
            var first_char = line_str.substr(0,1);
            
            if(line_str.indexOf("endscript") !=-1){
                this.flag_script = false;
            }
            
            //コメントの場合は無視する
            if(flag_comment === true && line_str ==="*/"){
                flag_comment = false;
            }else if(line_str==="/*"){
                flag_comment = true;
            }else if(flag_comment == true||first_char ===";"){
                
            }else if(first_char ==="#"){
                
                var tmp_line = $.trim(line_str.replace("#",""));
                var chara_name = "";
                var chara_face = "";
                if(tmp_line.split(":").length > 1){
                	var array_line = tmp_line.split(":");
                	chara_name = array_line[0];
                	chara_face = array_line[1];
                }else{
                	chara_name = tmp_line;
                }
                //キャラクターボックスへの名前表示
               var text_obj = {
                                line:i,
                                name:"chara_ptext",
                                pm:{"name":chara_name,"face":chara_face},
                                val:text
              };
                            
              array_s.push(text_obj);
                            
                
            }else if(first_char ==="*"){
                //ラベル
                
                var label_tmp = line_str.substr(1,line_str.length).split("|");
                
                var label_key = "";
                var label_val = "";
                
                label_key = $.trim(label_tmp[0]);
                
                if(label_tmp.length >1){
                    label_val = $.trim(label_tmp[1]);
                }
                
                 var label_obj = {
                    name:"label",
                    pm:{
                        "line":i,
                        "index":array_s.length,
                        "label_name":label_key,
                        "val":label_val
                    },
                    val:label_val
                 };
                 
                 //ラベル
                 array_s.push(label_obj);
                 
                 if(map_label[label_obj.pm.label_name]){
                    //this.kag.warning("警告:"+i+"行目:"+"ラベル名「"+label_obj.pm.label_name+"」は同一シナリオファイル内に重複しています");    
                    this.kag.warning("Warning line:"+i+" "+ $.lang("label") +"'"+ label_obj.pm.label_name+"'"+ $.lang("label_double"));
                    
                 }else{
                    map_label[label_obj.pm.label_name] = label_obj.pm;
                 }     
            
            }else if(first_char ==="@"){
                //コマンド行確定なので、その残りの部分を、ごそっと回す
                var tag_str =line_str.substr(1,line_str.length); // "image split=2 samba = 5" 
                var tmpobj = this.makeTag(tag_str,i);
                array_s.push(tmpobj);
            }else{
                
                //半角アンダーバーで始まっている場合は空白ではじめる
                if(first_char === "_") {
                    line_str = line_str.substring(1,line_str.length);
                }
                
                var array_char = line_str.split("");
                
                var text = "";//命令じゃない部分はここに配置していく
                
                var tag_str ="";
                
                //１文字づつ解析していく
                var flag_tag = false; //タグ解析中
                
                var num_kakko = 0; //embタグの中の配列[]扱うために
                
                for(var j=0;j<array_char.length;j++){
                    var c = array_char[j];
                    
                    if(flag_tag ===true){
                        
                        if(c==="]" && this.flag_script ==false){
                            
                            num_kakko--;
                            
                            if(num_kakko == 0){
                                
                                flag_tag = false;
                                array_s.push(this.makeTag(tag_str,i));
                                //tag_str をビルドして、命令配列に格納
                                tag_str ="";
                                
                            }else{
                                tag_str +=c;
                            }
                        }else if(c ==="[" && this.flag_script == false ){
                            
                            num_kakko++;
                            tag_str +=c;
                            
                        } else{
                            tag_str +=c;
                        }
                        
                    }
                    else if(flag_tag === false && c==="[" && this.flag_script == false){
                        
                        num_kakko++;
                        
                        //テキストファイルを命令に格納
                        if(text!=""){
                            
                            var text_obj = {
                                line:i,
                                name:"text",
                                pm:{"val":text},
                                val:text
                            };
                            
                            array_s.push(text_obj);
                            
                            text ="";
                        }
                        
                        flag_tag = true;
                    
                    }else{
                        
                        text +=c;
                    }
                    
                }
                
                if(text !=""){
                    var text_obj = {
                        line:i,
                        name:"text",
                        pm:{"val":text},
                        val:text
                    };
                    
                    array_s.push(text_obj);
                }
                
                //console.log(array_char);
                
            }
            //１行づつ解析解析していく
            
        }
        
        var result_obj = {
            
            array_s:array_s,
            map_label:map_label
            
        };
        
        if (this.deep_if != 0) {
			alert("[if]と[endif]の数が一致しません。シナリオを見直してみませんか？");
			this.deep_if = 0;
		}
        
        return result_obj;
        
        
    },
    
    //タグ情報から、オブジェクトを作成して返却する
    makeTag:function(str,line){
        
        var obj ={
            line:line,
            name:"",
            pm:{},
            val:""
        };
        
        
        var array_c = str.split("");
        
        var flag_quot_c = "";
        
        var tmp_str = "";
        
        var cnt_quot_c = 0;
        
        for (var j=0;j<array_c.length;j++){
            
            var c = array_c[j];
            
            if(flag_quot_c =="" && (c ==="\"" || c ==="'" )){
                flag_quot_c = c;
                cnt_quot_c = 0;
            }else{
            
                //特殊自体発生中
                if(flag_quot_c !=""){
                    
                    //特殊状態解除
                    if(c === flag_quot_c){
                        
                        flag_quot_c ="";
                        
                        //""のように直後に"が出てきた場合undefinedを代入
                        if(cnt_quot_c==0){
                            tmp_str+="undefined";
                        }
                    
                        cnt_quot_c=0;
                    
                    }else{
                    
                        if(c =="="){
                            c = "#";
                        }
                        
                        //空白削除。カンマの中の場合
                        if(c ==" "){
                            //個々消さないとダメ
                            c ="";
                        }
                        
                        tmp_str +=c;
                        cnt_quot_c++;
                    
                    }
                    
                
                    
                }else{
                    tmp_str +=c;
                }
                
            }
            
            
        }
        
        str = tmp_str ;
        
        //str = $.replaceAll(str,'"','');
        //str = $.replaceAll(str,"'",'');
                
        var array = str.split(" ");
        
        //タグの名前 [xxx 
        obj.name = $.trim(array[0]);
        
        //=のみが出てきた場合は前後のをくっつけて、ひとつの変数にしてしまって良い
        for(var k=1;k<array.length;k++){
            
            if(array[k] ==""){
                
                array.splice(k,1);
                k--;
            }
            
            else if(array[k] ==="="){
                if(array[k-1]){
                    if(array[k+1]){
                        array[k-1] = array[k-1]+"="+array[k+1];
                        array.splice(k,2);
                        k--;
                        
                    }
                }
            }else if(array[k].substr(0,1)==="="){
                if(array[k-1]){
                    if(array[k]){
                        array[k-1] = array[k-1]+array[k];
                        array.splice(k,1);
                        //k--;
                        
                    }
                }
            }else if(array[k].substr(array[k].length-1,array[k].length)==="="){
                if(array[k+1]){
                    if(array[k]){
                        array[k] = array[k]+array[k+1];
                        array.splice(k+1,1);
                        //k--;
                        
                    }
                }
            }
            
            
            
        }
        
        for(var i=1;i<array.length;i++){
            
            var tmp = $.trim(array[i]).split("=");
            
            var pm_key = $.trim(tmp[0]);
            var pm_val = $.trim(tmp[1]);
            
            //全引き継ぎ対応
            if(pm_key=="*"){
                obj.pm["*"]="";
            }
            //特殊変換された値はそのまま代入できない
            if(pm_val!=""){
                obj.pm[pm_key] = $.replaceAll(pm_val,"#","=");
            }
            
            if(pm_val=="undefined"){
                obj.pm[pm_key]="";
            }
            
        }
        
        if(obj.name == "iscript"){
            this.flag_script = true;
        }
        if(obj.name == "endscript"){
            this.flag_script = false;
        }
        
        
        switch (obj.name) {
		case "if":
			this.deep_if++;
		case "elsif":
		case "else":
			obj.pm.deep_if = this.deep_if;
			break;
		case "endif":
			obj.pm.deep_if = this.deep_if;
			this.deep_if--;
			break;
		};
        
        return obj;
        
    },
    
    test:function(){
        
    }
};


