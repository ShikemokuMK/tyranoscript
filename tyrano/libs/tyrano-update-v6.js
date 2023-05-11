try{
                
    if(window.studio_api){
        //Win Macなど パッケージング時 
        window.studio_api = window.studio_api;
        window.process = window.studio_api.ipcRenderer.sendSync("getProcess");
    }else if (window.opener.window.studio_api) {
        //プレビューのとき
        window.studio_api = window.opener.window.studio_api;
        window.process = window.opener.window.studio_api.ipcRenderer.sendSync("getProcess");
    }
    
}catch(e){
  console.log(e);
}
