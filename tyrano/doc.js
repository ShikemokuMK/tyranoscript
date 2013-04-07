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
        
        var array_script = ["kag.tag.js","kag.tag_audio.js","kag.tag_ext.js","kag.tag_system.js"];
        
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
        
        /*
        <p >■グラフィックカンレね</p>
                        <ul>
                            <a href="/usage/tutorial/about">メッセージ関連</a><br />
                            <a href="/usage/tutorial/about">メッセージ関連</a><br />
                            <a href="/usage/tutorial/about">メッセージ関連</a><br />
                            <a href="/usage/tutorial/about">メッセージ関連</a><br />
                            
                        </ul>
        */
       
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
        
        for(key in group_map){
            
            ghtml +="<p style='font-weight:bold'>■"+key+"</p>";
                
            var tmp = group_map[key];
            
            ghtml +="<ul >";
            
            for (key2 in tmp){
                var obj = tmp[key2];
                ghtml +='<div style="padding:2px"><a  href="#'+key2+'">['+key2+']　<span style="font-style:italic;color:gray">('+obj.title+')</span></a></div>';
            }
            
            ghtml +="</ul>";
            
        }
        
        $(".howtoNav").html(ghtml);
        
        console.log("=== group  =====");
        console.log(group_map);
        
        
        var j_root = $("<div></div>");
                
                
                for(key in map_doc){
                
                    var obj = map_doc[key];
                    
                    console.log(obj.exp.split("\n"));
                    
                    var html =""
                    +'<hr /><br />'
                    +'            <a name="'+key+'"></a>'
                    +'            <h3>【'+key+'】'+obj.title+'</h3>'
                    +'            <p>'+$.br($.escapeHTML(obj.exp))+'</p>'
                    
                    +'';
                    
                    html+=''
                    
                    +'            <table>'
                    +'                    <tr><th>パラメータ名</th><th>必須 </th><th>説明 </th><tr>'
                    +'';
                    
                    //繰り返し
                    
                    var param_str = obj.param;
                    
                    var array_param = obj.param.split(",");
                    
                    console.log("==== array_param  =====")
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
                     
                     html+='               </table><br />';
                     
                     if(obj.sample!=""){
                     
                      html+=''           
                         +'           '
                         +'           <p><span style="font-style:italic">サンプルコード</span><br />'
                         +'               <code><br />'
                                            
                         +$.br($.escapeHTML(obj.sample))
                                            
                         +'<br /></code>'
                         +'<p style="float:right;font-size:10px;font-style:italic">'+obj.group+'</p>'           
                         +'<br style="clear:both">'
                         +'</p>';
                         
                     }
                            
                     //htmlをぶち込みます
                     
                     j_root.append($(html));
                
                }// end map_doc loop
                
                
                
                $(".howtoMain").empty();
                $(".howtoMain").append(j_root);
                
                $("#src_html").val(html);
                
        
    };
    
    
})(jQuery);