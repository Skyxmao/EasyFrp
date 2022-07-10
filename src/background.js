import { app, protocol, BrowserWindow, ipcMain,Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import {startClient} from "./frp_js/index"
import {init_events} from "./events_lib/index"
import pubsub from 'pubsub-js'
import {setWin,getWin,getAppPath} from "./window"
const os = require('os')
const fs = require('fs');
const path=require('path');

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
var  win = null;
async function createWindow() { 
  if(os.platform() != "darwin")  {Menu.setApplicationMenu(null)}

  // Create the browser window.
    win = new BrowserWindow({
    height:880,
    width: 640,
    title:"EasyFrp",
    titleBarStyle: 'hidden',
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })   
  win.on('ready-to-show',()=>{
    win.setTitle('EasyFrp')
    console.log("BrowerWindow is ready to show!");
    win.webContents.send("initConfig",init_data());
    console.log("initConfig");
  });
  //win.webContents.openDevTools()
  setWin(win)
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

}


/*
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})*/

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()


})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
  app.setName('EasyFrp')

})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
console.log(process.versions);
function init_data(){
  let filePath = getAppPath();
  var files = fs.readdirSync(filePath);
  files = files.filter(function(element,index,self){
    return path.extname(element) == ".js"
  });
  var config = [];
  files.forEach(element => {
     let tempContent = fs.readFileSync(filePath + "/" + element);
     config.push(JSON.parse(tempContent));
  });
 return config;
}

init_events();

