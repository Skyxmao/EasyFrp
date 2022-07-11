<template>
    <div class="box header">
            <Dropdown trigger="click">
                <Button type="primary">
                    <i class="fa fa-plus"></i>&nbsp;新增服务器&nbsp;&nbsp;<i class="fa fa-caret-down" aria-hidden="true"></i>
                </Button>
                <Dropdown-menu slot="list">
                   <a  @click="modal1 = true"><Dropdown-item>新建</Dropdown-item></a>
                   <a  @click="modal2 = true"><Dropdown-item>导入</Dropdown-item></a>
                </Dropdown-menu>
            </Dropdown>
            <Modal
                v-model="modal1"
                title="新增服务器"
                @on-ok="ok"
                @on-cancel="cancel">
                <Form ref="formValidate" :model="formValidate"  :label-width="80">
                    <Form-item label="服务器名称" prop="serverName">
                        <Input v-model="formValidate.serverName" placeholder="请输入服务器名称"></Input>
                    </Form-item>
                     <Form-item label="服务器地址" prop="serverAddr">
                        <Input v-model="formValidate.serverAddr" placeholder="请输入IP或者域名"></Input>
                    </Form-item>
                     <Form-item label="服务器端口" prop="serverPort">
                        <Input v-model="formValidate.serverPort" type="number" placeholder="请输入服务器端口"></Input>
                    </Form-item>
                    <Collapse  accordion>
                        <Panel name="1">
                            扩展配置
                            <p slot="content">
                                <Input v-model="formValidate.serverExtend" type="textarea" :rows="4" placeholder="请输入...
格式:
server_addr=123
server_port=1234"></Input>
                            </p>
                        </Panel>
                    </Collapse>
                </Form>
            </Modal>

            <Modal
                v-model="modal2"
                title="导入服务器"
                @on-ok="importServer"
                @on-cancel="cancel">
                <Form  :label-width="80">
                    <Form-item label="服务器名称" prop="serverName">
                        <Input v-model="importName" placeholder="请输入服务器名称"></Input>
                    </Form-item>
                    <Alert>直接将frp的frpc.ini粘贴到下方</Alert>
                    <Input v-model="importData" type="textarea" :rows="20" placeholder="请输入...
格式:
server_addr=123
server_port=1234"></Input>
                </Form>
            </Modal>  
    </div>
</template>

<script>
import pubsub from 'pubsub-js'
const ipcRenderer = require('electron').ipcRenderer;

export default {
    data(){
        return {
            modal1: false,
            modal2: false,
            formValidate: {
                serverPort: '',
                serverAddr: '',
                serverName: '',
                serverExtend:'',
            },
            importData:"",
            importName:"",
        }
    },
    methods: {
        ok () {
             if(this.formValidate.serverAddr == "" || this.formValidate.serverName =="" || this.formValidate.serverPort ==""){
                this.$Message.error("添加失败!请将服务器信息填写完整");
                return 0;
            }
            pubsub.publish("addConfig",{

                "serverAddr":this.formValidate.serverAddr,
                "serverPort":this.formValidate.serverPort,
                "serverName":this.formValidate.serverName,
                "serverExtend":this.formValidate.serverExtend
            });
            this.$Message.info("添加成功!");
        },
        cancel () {

        },
        importServer(){
            pubsub.publish("importConfig",{
                serverName:this.importName,
                serverConfig:this.importData
            })
            this.$Message.info("添加成功!");
        }
    }
}
</script>

<style scoped>
    .header{
        width: 100%;
        height: 32px;
    }
</style>