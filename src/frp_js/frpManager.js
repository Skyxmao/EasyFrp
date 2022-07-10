var frp_status = [];
function setStatus(uuid,frp){
    frp_status[uuid] = frp; 
}
function getStatus(){
    return frp_status;
}
function deleteStatus(uuid){
    delete frp_status[uuid]
}
module.exports = {setStatus,getStatus,deleteStatus}