<template>
  <div class="ServerChildItem">
     <div class="bar electron-drag"></div>
     <div class="realBar">
        <Button @click="closeThis"><i class="fa fa-angle-left"></i>&nbsp;返回主页</Button>
     </div>

     <br>
     <h1 style="text-align:center">{{config.common.serverName}}</h1>
    <div class="ItemBox">
         <Col span="11" class="list-item" v-for="c in newConfig" v-bind:key="c.name+localPort">
                        <Card>
                            <p slot="title"><i class="fa fa-bolt"></i> {{c.name}}</p> 
                            <p>{{c.type}}&nbsp;{{c.localPort}} <i class="fa fa-arrows-h"></i> {{c.remotePort}}</p>
                             <p><Button type="error" @click="deleteMapping" :name="c.name">删除</Button></p>
                        </Card>
       </Col>
        <Col span="22" >
                <Alert v-show="newConfig.length == 0">
                提示
                    <template slot="desc">您还没有映射，点击下面添加映射哦</template>
                </Alert>
         </Col>
    </div>
    
        <Col span="22"  class="list-item">
            <Card class="addNew" >
                <Button type="dashed" style="width:100%;height:50px" @click="modal1 = true"> <i class="fa fa-plus"></i>   添加新映射</Button>
            </Card>
        </Col>


    <Modal
        v-model="modal1"
        title="添加映射"
        @on-ok="ok"
        @on-cancel="cancel">
        <Form :label-width="80">
                <Form-item label="名称(英文)">
                    <Col span="18">
                        <Input placeholder="请输入" v-model="name"></Input>
                    </Col>
                    <Col span="5" offset="1">
                        <Button  @click="randomName" type="info">随机名字</Button>
                    </Col>
                </Form-item>
                <Form-item label="类型">
                    <Select placeholder="请选择" v-model="type" >
                        <Option value="tcp">TCP</Option>
                        <Option value="http">HTTP</Option>
                        <Option value="udp">UDP</Option>
                    </Select>
                </Form-item>
                <Form-item label="本地IP">
                    <Col span="18">
                        <Input placeholder="请输入"  v-model="localIp"></Input>
                    </Col>
                    <Col span="5" offset="1">
                        <Button  @click="importDefaultIP" type="info">填入本地IP</Button>
                    </Col>
                </Form-item>
                <Form-item label="自定义域名" v-show="type=='http'">
                    <Input placeholder="请输入"  v-model="customDomains"></Input>
                </Form-item>
                <Form-item label="本地端口">
                    <Col span="18">
                        <Input placeholder="请输入"  v-model="localPort" type="number"></Input>
                    </Col>
                    <Col span="5" offset="1">
                        <Button  @click="randomLocalPort" type="info">随机端口</Button>
                    </Col>
                </Form-item>
                <Form-item label="远程端口">
                     <Col span="10">
                        <Input placeholder="请输入" v-model="remotePort" type="number"></Input>
                    </Col>
                    <Col span="6" offset="1">
                        <Button  @click="copyLocalPort" type="info">复制本地端口</Button>
                    </Col>
                    <Col span="4" offset="1">
                        <Button  @click="randomRemotePort" type="info">随机端口</Button>
                    </Col>
                </Form-item>
                    <Collapse  accordion>
                        <Panel name="1">
                            扩展配置
                            <p slot="content">
                                <Input v-model="serverExtend" type="textarea" :rows="4" placeholder="请输入...
格式:
server_addr=123
server_port=1234"></Input>
                            </p>
                        </Panel>
                    </Collapse>
        </Form>
    </Modal>
  </div>

</template>

<script>
import pubsub from 'pubsub-js'
import { nanoid } from 'nanoid'
export default {
    data() {
        return {    
            modal1: false,
            name:"",
            type:"tcp",
            localIp:"",
            localPort:"",
            remotePort:"",
            serverExtend:"",
            customDomains:"",
        };
    },
    methods: {
        closeThis() {
            pubsub.publish("closeShowChild", "");
        },
        ok () {
             if(this.name == "" || this.type =="" || this.localIp =="" || this.localPort ==""|| this.remotePort ==""){
                this.$Message.error("添加失败!请将映射信息填写完整");
                return 0;
            }

            let tempMap ={
               "name":this.name,
               "type":this.type,
               "localIp":this.localIp,
               "localPort":this.localPort,
               "remotePort":this.remotePort,
               "serverExtend":this.serverExtend
            }
            if(this.type =="http"){
                tempMap['customDomains'] = this.customDomains;
            }
            console.log(tempMap);
            this.$set(this.config,tempMap.name,tempMap);

            this.name = "";
            this.type ="";
            this.localIp = "";
            this.localPort = "";
            this.remotePort = "";
            this.serverExtend = "";
         },
        cancel () { 
        },
        deleteMapping(e){
            this.$delete(this.config,e.currentTarget.name);
        },
        importDefaultIP(){
            this.localIp="127.0.0.1"
        },
        randomRemotePort(){
            this.remotePort = this.randomNum(1,65535)
        },
        randomLocalPort(){
            this.localPort = this.randomNum(1,65535)
        },
        copyLocalPort(){
             this.remotePort = this.localPort
        },
        randomName(){
            this.name = nanoid();
        },  
        randomNum(minNum,maxNum){ 
                switch(arguments.length){ 
                    case 1: 
                        return parseInt(Math.random()*minNum+1,10); 
                    break; 
                    case 2: 
                        return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
                    break; 
                        default: 
                            return 0; 
                        break; 
    } 
} 
    },
    computed:{
        newConfig(){
            let result = [];
            for(var key in this.config){
               if(key =="uuid" || key =="common"){
                continue;
               }
               result.push(this.config[key])
            }
            return result;
        }
    },
    props: ["config", "showChild"],
}
</script>

<style scoped>
.ServerChildItem{
    position:fixed;
    float: 0px;
    top:0px;
    width: 100%;
    background: white;
    height: 100%;
    padding: 0;
    margin:0;
    z-index: 20;
}
.ItemBox{
    width: 98%;
    height: 520px;
    margin-top:20px;
    overflow-x:auto;
}
.bar{
    width: 100%;
    height: 30px;
}
.electron-drag{
    -webkit-app-region: drag;
}
.realBar{
    width: 100%;
    height: 60px;
}
.list-item{
    margin-left:10px;
    margin-top:10px;
}
.addNew{
    text-align: center;
    cursor: pointer;
}
</style>