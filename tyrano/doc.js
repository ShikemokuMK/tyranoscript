function object(o) {
  var f = object.f, i, len, n, prop;
  f.prototype = o;
  n = new f;
  for (i=1, len=arguments.length; i<len; ++i)
    for (prop in arguments[i])
      n[prop] = arguments[i][prop];
  return n;
}

object.f = function(){};

var tyrano ={};
tyrano.plugin ={};
tyrano.plugin.kag ={};


(function($){
    
    $.generateHtml = function() {
        
        var html="";
        
        var master_tag ={};
        var map_doc = {};
        
        // タグの種類を確定させる
        for(var order_type in tyrano.plugin.kag.tag){
          
            master_tag[order_type] = object(tyrano.plugin.kag.tag[order_type]);
          
        }
        
        console.log(master_tag);
        
        //テキストを読み込み。スクリプトから、オブジェクト構造解析
        //同じディレクトリにある、KAG関連のデータを読み込み
        
        var array_script = ["kag.tag.js","kag.tag_audio.js","kag.tag_ext.js","kag.tag_system.js","kag.tag_camera.js"];
        
        var script_num = array_script.length;
        var loading_num = 0;
        
        for(var i=0;i<array_script.length;i++){
            
            $.loadText("./tyrano/plugins/kag/"+array_script[i],function(text_str){
                
                var flag_tag = ""; //タグ解析中の場合
                var flag_param =""; //パラメータ名
                
                var tmp_str ="";
                
                var array_str = text_str.split("\n");
                
                for(var i=0; i< array_str.length;i++){
        
                    var line_str = $.trim(array_str[i]); 
                    
                    //タグ解析中は改行もつかう
                    if (line_str !="" || flag_tag !=""){
                        
                        if(line_str ==="#[end]"){
                           
                           
                           //終了時点で登録すべきデータが残っていた場合は入れておく
                           map_doc[flag_tag][flag_param] = tmp_str;
                           
                           flag_tag ="";
                           flag_param ="";
                           
                           
                        }
                        else if(flag_tag!=""){
                            
                            if(line_str.substr(0,1)==":"){
                                
                                if(tmp_str!=""){
                                    
                                    if(flag_param!=""){
                                        map_doc[flag_tag][flag_param] = tmp_str;
                                    }
                                }
                                
                                flag_param ="";
                                flag_param = line_str.substr(1,line_str.length);
                                
                                //すでに登録済みのデータがあれば、それを格納する
                                map_doc[flag_tag][flag_param] = "";
                                
                                tmp_str ="";
                                
                            }else {
                                
                                if(flag_param != "param" && flag_param != "title"){
                                    tmp_str +=line_str+"\n";
                                }else{
                                    tmp_str +=line_str;
                                }
                                
                            }
                        
                        
                        //タグ読み込み開始
                        }else if(line_str.substr(0,2)==="#["){
                            
                            var tag_name = line_str.replace("#[","");
                            tag_name = tag_name.replace("]","");
                            tag_name = $.trim(tag_name);
                            
                            flag_tag = tag_name;
                            flag_param ="";
                            
                            
                            map_doc[flag_tag] = {};
                            
                       }
                       
                    }
                
                }
                
                console.log(map_doc);
                
                //macdoc を　解析して、HTMLを作成
                
                loading_num++;
                
                if(loading_num == script_num){
                    $.putHtml(map_doc,master_tag);
                }
                
                
            });//　ローディング
        
        }
        
        return html;
        
    };
    
    
    $.putHtml = function (map_doc,master_tag){
        
        //タグのグルーピングで左部分作成
        
        var group_map = {};
        
        var ghtml = "";
                     
        for(key in map_doc){
                
                    var obj = map_doc[key];
                    if(group_map[obj.group]){
                    }else{
                        group_map[obj.group] ={};
                    }
                    group_map[obj.group][key] = obj;
                    
        }
        
        var num_index = 0;
        
        //グループをつくる
        for(key in group_map){
            
           
            ghtml+='<li class="list-group-item list-toggle">';
            ghtml +='<a data-toggle="collapse" data-parent="#sidebar-nav-1" href="#nav_'+num_index+'" class="collapsed" aria-expanded="false">'+key+'</a>';
                
            var tmp = group_map[key];
            
            ghtml += '<ul id="nav_'+num_index+'" class="collapse" aria-expanded="false" style="height: 0px;">';
            
            for (key2 in tmp){
                var obj = tmp[key2];
                //ghtml +='<div style="padding:2px"><a  href="#'+key2+'">['+key2+']　<span style="font-style:italic;color:gray">('+obj.title+')</span></a></div>';
                ghtml +='<li><a href="#'+key2+'"> ['+key2+']　'+obj.title+'</a></li>';
            }
            
            ghtml +="</ul>";
            ghtml +="</li>";
            
            num_index++;
            
        }
        
        $(".area_group").html(ghtml);
        
        
        var j_root = $("<div></div>");
                
                
                for(key in map_doc){
                
                    var obj = map_doc[key];
                    
                    console.log(obj.exp.split("\n"));
                    
                    var html =''
                    +'<div  class="news-v3 bg-color-white margin-bottom-20">'
                    +'<div class="news-v3-in"><a name="'+key+'"></a>'
                    +'<h3 style="color:#a10f2b">['+key+']　'+obj.title+'</h3>'
                    +'<ul class="list-inline posted-info"><li>'+obj.group+'</li></ul>'
                    +'<p>'+$.br($.escapeHTML(obj.exp))+'</p>'
                    +'<table class="table table-bordered">'
                    +'<thead style="background-color:pink"><tr><th>パラメータ</th><th>必須</th><th>解説</th></tr></thead>'
                    +'<tbody>';
                    
                    
                    //繰り返し
                    
                    var param_str = obj.param;
                    
                    var array_param = obj.param.split(",");
                    
                    console.log("==== array_param  =====");
                    console.log(array_param);
                    
                    for(var k=0;k<array_param.length;k++){
                    
                     if(array_param[k]==""){
                         html+='<tr ><td colspan="3">指定できるパラメータはありません</td></tr>';
                     }else{
                         var tmp_array = array_param[k].split("=");
                         
                         var param_name = $.trim(tmp_array[0]);
                         var param_value =$.trim(tmp_array[1]);
                         
                         var vital = "×";
                         
                         if(master_tag[key]!=null && master_tag[key]["vital"]!=null){
                            
                            var array_vital = master_tag[key]["vital"];
                            
                            for(var j=0;j<array_vital.length;j++){
                            
                                if(master_tag[key].vital[j]==param_name){
                             
                                    vital ="◯";
                                    break;
                                }
                            
                            }
                         
                         }
                                      
                         html+='                 <tr>'
                              +'                  <td>'+param_name+'</td>'
                              +'                  <td>'+vital+'</td>'
                              +'                  <td>'+param_value+'</td>'
                                                
                              +'              </tr>';
                         
                        }
                         
                     }//end for loop
                     
                     html +='</tbody></table>';
                    
                    
                     if(obj.sample!=""){
                     
                      html+=''           
                         +'<ul class="list-inline posted-info"><li>サンプルコード</li></ul>'
                         +'<code><br />'
                                            
                         +$.br($.escapeHTML(obj.sample))
                                            
                         +'<br /></code>'
                         +'';
                         
                     }
                     
                     html +="</div></div>";
                     html +='<div class="clearfix "><hr style="margin:0"></div>';
                            
                     //htmlをぶち込みます
                     
                     j_root.append($(html));
                
                }// end map_doc loop
                
                
                
                $(".area_ref").empty();
                
                //基本説明部分ｎ
               
                var basic_exp = ''
                +' <div class="alert alert-success fade in margin-bottom-20">'
+'<h4>基本</h4>'
+'<p>'                        
+'                       [ ] で囲まれた部分がタグになります。 <br/ >'
+'                        @で始まる行も、タグとして認識しますが、１行で記述しなければなりません<br/ >'
+'                        ;(セミコロン)で始まる行はコメントとして扱われます。<br/ >'
+'                        複数行にわたってコメントにする場合は、/* からはじめて */ で 閉じることでコメントになります。　<br/ >'
+'                        すべてのタグにcond属性があります。JS式を記述して、その結果が真の場合のみタグが実行されます<br/ >'
+'                        _（半角アンダーバー）で始まる行は、文章の前に空白を挿入することができます。<br />'
+'                        '
+'                    </p>     '
+''
+'</div>';
                $(".area_ref").append(basic_exp);
                $(".area_ref").append(j_root);
                $("#src_html").val($(".area_main").html());
                
                var js_auto_complete = "";
                for(key in master_tag ){
                    js_auto_complete += '"'+key+'",\n';
                }
                
                console.log(master_tag);
                
                $("#auto_complete_tag").val(js_auto_complete);
                
        
    };
    
    
})(jQuery);