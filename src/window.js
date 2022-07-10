const {app } = require('electron');
var win = null;
function setWin(data){
    win = data;
};
function getWin(){
    return win;
}
function getAppPath(){
    return app.getPath('userData');
}
module.exports = {setWin,getWin,getAppPath}