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
