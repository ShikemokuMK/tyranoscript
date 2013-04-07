
tyrano.base ={
    
    //読み込み対象のモジュール
    tyrano:null,
    modules:[],
    options:{
        
    },
    
    init:function(tyrano){
        this.tyrano = tyrano;
    },
    
    setBaseSize:function(width,height){
        
        this.tyrano.get(".tyrano_base").css("width",width).css("height",height).css("background-color","black");
            
    },
    
    //画面サイズをぴったりさせます
    fitBaseSize:function(width,height){
      
      var view_width = $.getViewPort().width;
        var view_height = $.getViewPort().height;
        
        var width_f = view_width / width ;
        var height_f = view_height / height;
        
        var scale_f = 0;
        
        $(".tyrano_base").css("-webkit-transform-origin","0 0");
        
        var space_width = 0;
        
        if(width_f > height_f){
            
            scale_f = height_f;
            
        }else{
            
            scale_f = width_f;
            
            
        }
        
        //$(".tyrano_base").css("-webkit-transform","scale("+width_f+") scaleY("+height_f+")");
        //alert(scale_f);
        $(".tyrano_base").css("-webkit-transform","scale("+scale_f+") ");
    
        
    },
    
    test:function(){
        //alert("tyrano test");
    }
    
};
