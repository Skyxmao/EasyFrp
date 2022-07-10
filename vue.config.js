
module.exports = {
  runtimeCompiler: true,
  pluginOptions: {
      electronBuilder: {
          nodeIntegration: true,
          builderOptions:{
            productName: "EasyFrp",
            copyright: "Copyright XMAO",
            appId: "me.xmao.easyfrp",
            extraResources: [
            {from:'./frp',to:'./frp'}],
            "mac": {
              "icon": "./static/Icon.icns"
            },
            "win": {
              "icon": "./static/pic.png"
            },
            "linux": {
              "icon": "./static/pic.png"
            }
        }
      }
  }
}