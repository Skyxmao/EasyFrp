<template>
    <div class="ServerItem">
        <Card>
                <Row type="flex" justify="end">
                    <Col span="2"><i class="fa fa-server"></i></Col>
                    <Col span="7"><p>{{config.common.serverName}}</p></Col>
                     <Col span="8">
                     
                        <Button-group>
                                <Button @click="modal1 = true">配置</Button>
                                <Button @click="showChild = !showChild">映射</Button>
                                <Button @click="exportConfig">导出</Button>
                        </Button-group>
                        
                    </Col>
                    <Col span="5">
                        <Button-group>
                            <i-switch size="large" v-model="isOn" :disabled="disabled">
                                <span slot="open" >连接</span>
                                <span slot="close">关闭</span>
                            </i-switch>
                        </Button-group>
                    </Col>
  
                      <Col span="2">
                            <Poptip
                                 placement="left"
                                confirm
                                title="您确认删除这个服务器吗？"
                                @on-ok="deleteServer">
                                <Button shape="circle">删除</Button>
                            </Poptip>
                    </Col>
                </Row>
        </Card>
        <Modal
            v-model="modal1"
            title="配置服务器"
            @on-ok="ok"
            @on-cancel="cancel">
                <Form ref="formValidate"   :label-width="80">
                    <Form-item label="服务器名称" prop="serverName">
                        <Input v-model="config.common.serverName" placeholder="请输入服务器名称"></Input>
                    </Form-item>
                     <Form-item label="服务器地址" prop="serverAddr">
                        <Input v-model="config.common.serverAddr" placeholder="请输入IP或者域名"></Input>
                    </Form-item>
                     <Form-item label="服务器端口" prop="serverPort">
                        <Input v-model="config.common.serverPort" type="number" placeholder="请输入服务器端口"></Input>
                    </Form-item>
                    <Collapse  accordion>
                        <Panel name="1">
                            扩展配置
                            <p slot="content">
                                <Input v-model="config.common.serverExtend" type="textarea" :rows="4" placeholder="请输入...
格式:
server_addr=123
server_port=1234"></Input>
                            </p>
                        </Panel>
                    </Collapse>
                </Form>
        </Modal>
        <ServerChildItem v-show="showChild" :config="config" :showChild="showChild"></ServerChildItem>
        <Collapse>
            <Panel name="1">
                运行日志 [{{log_other_question}}] &nbsp;<Button type="primary" size="small" @click="clearLog">清除日志</Button>
                <p slot="content" v-html="log"></p>
            </Panel>
        </Collapse>
    </div>
</template>

<script>
import pubsub from 'pubsub-js'
import ServerChildItem from './ServerChildItem.vue'
import {ipcRenderer} from 'electron';
export default {
    data() {
        return {
            isOn: false,
            modal1: false,
            showChild: false,
            disabled:false,
            log:"",
            log_other_question:"正常"
        };
    },
    methods: {
        deleteServer() {
            if(this.isOn){
                this.$Message.warning("必须先停止该服务器在删除!");
                return 0;
            }
            this.$Message.success('删除成功!');
            pubsub.publish("deleteConfig", this.config.uuid);
        },
        ok() {
            this.$Message.info("点击了确定");
        },
        cancel() {
           
        },
        clearLog(){
            this.log = "";
        },
        exportConfig(){
           ipcRenderer.send("exportConfig",this.config);

           this.$Message.success('配置已写入粘贴板!');
        }
    },
    watch:{
        isOn(newVal,oldVal){
            if(newVal) {
                this.disabled=true;
                ipcRenderer.send("startClient",this.config);
            }else{
                ipcRenderer.send("closeClient",this.config.uuid);
                this.disabled=true;
                setTimeout(()=>{
                this.disabled=false;
                },3000);
            }
        }
    },
    props: ["config"],
    components: { ServerChildItem },
    mounted(){
        pubsub.subscribe("closeShowChild",()=>{
            this.showChild = false;
        })
         ipcRenderer.on("log",(event,data)=>{
            if(data.uuid != this.config.uuid){return;};
            this.log = "<p>"+data.msg+this.log + "</p>";
            if(data.msg.indexOf("already") !=-1){
                this.log_other_question="存在端口冲突问题"
            }
         })
        ipcRenderer.on("checkRunning",(event,data)=>{
            console.log(data);
            if(data.uuid == this.config.uuid){
                this.isOn = data.isok;
                if(!data.isok){
                    this.$Message.error(`${this.config.common.serverName} 启动失败! ${data.reason}`);
                }else{
                    this.$Message.success(`${this.config.common.serverName} 启动成功! ${data.reason}`);
                }
                this.disabled=false;
            }
        });
    }
}
</script>

<style scoped>
.ServerItem{
    line-height: 40px;
    margin-top: 10px;
}
</style>