const {ipcMain,clipboard } = require('electron');
const {startClient } = require('../frp_js/index');
const {setStatus,getStatus,deleteStatus} = require('../frp_js/frpManager');
const fs = require('fs');
const {getWin,getAppPath} = require("../window");
const { camelCase }  = require('camel-case');
const { contextId } = require('process');
const decamelize = require("decamelize")
module.exports.init_events=function(){
    ipcMain.on("writeConfig",(event,arg)=>{
        console.log("*******writeConfig*********");
        console.log(arg)
        console.log(getAppPath())
        arg.forEach(element => {
            let path = getAppPath()  + "/"+ element.uuid + ".js";
            fs.writeFileSync(path,JSON.stringify(element));
        });
    })
    ipcMain.on("importConfig",(event,arg)=>{
        console.log("*******writeConfig*********");
        console.log(arg);
    })
    ipcMain.on("deleteConfig",(event,uuid)=>{
        let path = getAppPath() + "/" + uuid + ".js";
        fs.unlink(path,function(e){
            console.log(e);
        })
    })


    ipcMain.on("exportConfig",(event,config)=>{
        delete config['uuid'];
        var newData = {};
        for(key in config){
            let newJson = Object.assign(config[key],handleServerExtend(config[key].serverExtend))
            delete config[key].serverExtend;
            newData[key]=newJson;
        }

        var content = frpConfigContent = `${Object.entries(newData)
            .map(
              ([group, subObj]) =>
                `[${group}]\n${Object.entries(subObj)
                  .map(([k, v]) => `${decamelize(k, "_").toLowerCase()} = ${v}`)
                  .join("\n")}`
            )
            .join("\n\n")}`
        clipboard.writeText(content);
    })

    ipcMain.on("startClient",async (event,data)=>{

        console.log(`[startClient] UUID: ${data['uuid']} NAME: ${data['common']['serverName']}`);

        let uuid = data['uuid'];
        delete data['uuid'];
        let isok,reason;
        let haveExec = false;

        var newData = {};
        for(key in data){
            let newJson = Object.assign(data[key],handleServerExtend(data[key].serverExtend))
            delete data[key].serverExtend;
            newData[key]=newJson;
        }
        

        let frp = await startClient(newData,function(data){ 
            if(haveExec){
                getWin().webContents.send("log",{uuid,"msg":data.toString()});
                return 0;
            }
            console.log(data.toString());
            haveExec = true;
            if(data.toString().indexOf("network is unreachable") !=-1){
                isok =false,
                reason = "网络不可达"
            }else if(data.toString().indexOf("connection refused") !=-1){
                isok =false,
                reason = "连接被拒绝"
            }else if(data.toString().indexOf("no such host") !=-1){
                isok =false,
                reason = "没有该主机"
            }else if(data.toString().indexOf("alread") !=-1){
                isok =true,
                reason = "但是存在端口冲突!"
            }else if(data.toString().indexOf("invalid port") !=-1){
                isok =true,
                reason = "无效的端口!"
            }else if(data.toString().indexOf("success") !=-1){
                isok =true,
                reason = "启动成功"
            }else{
                isok=false
                reason="未知错误"
            }
            if(!isok){
                deleteStatus(uuid);
            }

            getWin().webContents.send("checkRunning",{uuid,isok,reason});
            getWin().webContents.send("log",{uuid,"msg":data.toString()});
        },function(data){});

        if (typeof(frp) != "undefined"){
            setStatus(uuid,frp)
        }
    })
    ipcMain.on("closeClient",(event,uuid)=>{
        if(typeof(getStatus()[uuid]) != "undefined" ){
            getStatus()[uuid].stop();
            deleteStatus(uuid);
        }
    })
    String.prototype.toCamelCase = function(str) {
        return str
            .replace(/\s(.)/g, function($1) { return $1.toUpperCase(); })
            .replace(/\s/g, '')
            .replace(/^(.)/, function($1) { return $1.toLowerCase(); });
    }
    
    /*checker */
    function handleServerExtend(serverExtend){
        let result={};
        let configs = serverExtend.split("\n")
        for(var key in configs){
            let temp = configs[key].split("=");
            if(camelCase(temp[0]) == '' || typeof(temp[1])  == "undefined"){
                continue;
            }
            result[camelCase(temp[0])] = temp[1]
        }
        return result;
    }
}
