<template>
    <div class="box header">
            <Button type="primary" @click="modal1 = true"><i class="fa fa-plus"></i>&nbsp;新增服务器</Button>
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
    </div>
</template>

<script>
import pubsub from 'pubsub-js'
const ipcRenderer = require('electron').ipcRenderer;

export default {
    data(){
        return {
            modal1: false,
            formValidate: {
                serverPort: '',
                serverAddr: '',
                serverName: '',
                serverExtend:'',
            }
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