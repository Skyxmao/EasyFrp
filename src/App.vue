<template>
  <div id="app">
    <Bar/>
    <GuiHeader/>
    <Logo/>
    <GuiBody :serverConfig="serverConfig"/>
  </div>
</template>

<script>
import Bar from './components/Bar.vue';
import Logo from './components/Logo.vue'
import GuiHeader from './components/GuiHeader.vue'
import GuiBody from './components/GuiBody.vue'
import pubsub from 'pubsub-js'
const { camelCase }  = require('camel-case');
const { v4: uuidv4 } = require('uuid');
import {ipcRenderer} from 'electron';
  export default {
    name: 'App',
    data(){
      return {
        serverConfig:[]
      }
    },
    components: {
        Bar,
        GuiHeader,
        GuiBody,
        Logo
    },
    methods:{
      addConfig(config){
        
        let totalConfig = {
          'uuid' : uuidv4(),
          "common":config
        };
        this.serverConfig.push(totalConfig);
      },
      importConfig(data){
        var name = data.serverName;
        var config = data.serverConfig;
        var totalConfig = (this.coverFrpcToEasyFrp(config));
        totalConfig.common['serverName'] = name;
        console.log(totalConfig);
        this.serverConfig.push(totalConfig);
      },
      coverFrpcToEasyFrp(config){
        var uuid = uuidv4();
        var configs = config.split("[").filter(item => item != '');;
        var resultConfig = {};
        configs.forEach((element)=>{
            let temp = element.split(']');

            let tempName = temp[0]; 
            let tempData = temp[1];
            if(typeof(tempName) == "undefined" || typeof(tempData) == "undefined" || tempData == "" || tempName ==""){
                return;
            }
            resultConfig[tempName] = (this.handleServerExtend(tempData));
            resultConfig[tempName]['serverExtend'] = "";
        });
        resultConfig['uuid'] = uuid;

        return resultConfig;
      },
      handleServerExtend(serverExtend){
              let result={};
              let configs = serverExtend.split("\n").filter(item => item != '')
              for(var key in configs){
                  let temp = configs[key].split("=");
                  if(camelCase(temp[0]) == '' || typeof(temp[1])  == "undefined"){
                      continue;
                  }
                  result[camelCase(temp[0])] = temp[1]
              }
              return result;
      }
    },
    watch:{
      serverConfig:{
        handler(newVal,oldVal){
            ipcRenderer.send("writeConfig",newVal);
        },
        immediate: true,
        deep:true
      }
    },
    mounted(){
        pubsub.subscribe('addConfig',(e,data)=>{
          this.addConfig(data);
        })
        pubsub.subscribe('deleteConfig',(e,uuid)=>{
          this.serverConfig.forEach( (value, index)=>{
              if(value.uuid == uuid){
                this.serverConfig.splice(index,1);
                ipcRenderer.send("deleteConfig",uuid);
              }
          });
        })
        pubsub.subscribe('importConfig',(e,data)=>{
          this.importConfig(data);
        })
        ipcRenderer.on("initConfig",(e,data)=>{
          console.log(data);
            data.forEach((ele)=>{
              this.serverConfig.push(ele)
            });
        });
    }
  }
</script>
<style>
.box{
  padding-left: 10px;
  padding-right: 10px;
}
</style>
