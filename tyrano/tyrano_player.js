
//スマートフォン用のaudio オーバーライド
var Audio = (function() {
    // クラス内定数
    var COUNTRY = 'aaaaa';
    
    // コンストラクタ
    var Audio = function(storage_url) {
        if(!(this instanceof Audio)) {
            return new Audio(storage_url);
        }

        this.storage_url = storage_url;
        //this.age  = age;
        this.volume ="1";
        this.loop = false;
        this.currentTime = 0;
        this.map_event = {}; //コールバックが必要な部分について、イベント登録する。
        
    }

    var p = Audio.prototype;

    // プロトタイプ内でメソッドを定義
    p.setName = function(name) {
        this.name = name;
    }
    p.getStorageUrl = function() {
        return this.storage_url;
    }
        
    p.play = function(){
        alert("play:"+this.storage_url);
        var obj = {
            action:"play",
            storage:this.storage_url,
            loop:this.loop,
            volume:this.volume
            
        };
        appJsInterface.audio(JSON.stringify(obj));
    }
    
    p.stop = function(){
        alert("stop:"+this.storage_url);
        var obj = {
            action:"stop",
            storage:this.storage_url
        };
        appJsInterface.audio(JSON.stringify(obj));
    }
    
    p.release = function(){
        
    }
    
    p.pause = function(){
        this.stop();
    }
    
    //再生が終わったらcb呼び出し。/////////////////
    p.onended = function (cb){
        this.map_event["onended"] = cb;
    }
    
    p.addEventListener=function(event_name,cb){
        this.map_event[event_name] = cb;
    }

    return Audio;
    
})();



/*
var Audio = new Person('太郎', 20);
// プロトタイプ内のメソッド呼び出し
taro.setName('日本太郎');
console.log(taro.getName()); // 日本太郎
*/


