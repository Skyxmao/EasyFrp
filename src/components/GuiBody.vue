<template>
    
    <div class="box GuiBody" style="margin-top:20px;">
        <Alert v-show="serverLength==0">
           提示
            <template slot="desc">您还没有服务器哦~点击右上角新增服务器添加一个服务器吧</template>
        </Alert>
        <ServerItem  v-for="c in serverConfig" :key="c.uuid" :config="c"></ServerItem>
        
    </div>
</template>

<script>
import ServerItem from './ServerItem.vue'

export default {
        data () {
            return {
            }
        },
        methods:{
        },
        components:{
            ServerItem,
        },
        computed:{
            serverLength(){
                return this.serverConfig.length;
            }
        },
        props:['serverConfig']
}
</script>

<style scoped>
    li{
        margin-top: 10px;
    }
    .GuiBody{
        height: 480px;
        overflow-y:auto;
    }
</style>