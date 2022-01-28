const WebSocket = require('ws')
const wsPORT = process.env.WS_PORT || 6008
const bc = require('./blocks')
//소켓에 주소를 넣을 공간 마련
let sockets = []
function getSockets(){ return sockets }

const MessageAction = {
    QUERY_LAST:0,
    QUERY_ALL:1,
    RESPONSE_BLOCK:2,
}
//메세지를 받앗을떄 타입에 따라 함수 실행
function initMessageHandler(ws){
    ws.on("message",data => {
        const message = JSON.parse(data)
        switch(message.type){
            case MessageAction.QUERY_LAST:
                write(ws,responseLastMsg()) 
            break;
            case MessageAction.QUERY_ALL://
                write(ws,responseBlockMsg())
            break;
            case MessageAction.RESPONSE_BLOCK:
                handleBlockResponse(message)
            break;
        }
    })
}

function queryAllMsg(){
    return {
        type:MessageAction.QUERY_ALL,
        data:null
    }
}


function queryBlockMsg(){
    return {
        type:MessageAction.QUERY_LAST,
        data:null
    }
}

function responseLastMsg(){
    return {
        type:MessageAction.RESPONSE_BLOCK,
        data:JSON.stringify([bc.getLastBlock()]) 
    }
}

function responseBlockMsg(){
    return {
        type:MessageAction.RESPONSE_BLOCK,
        data:JSON.stringify(bc.getBlocks())
    }
}

function handleBlockResponse(message){
    const receivedBlocks = JSON.parse(message.data) 
    const lastBlockReceived = receivedBlocks[receivedBlocks.length - 1] 
    const lastBlockHeld = bc.getLastBlock() 

    if (lastBlockReceived.header.index > lastBlockHeld.header.index) {
        console.log(
            "블록의 갯수 \n" +
            `내가 받은 블록의 index 값 ${lastBlockReceived.header.index}\n` +
            `내가 가지고있는 블럭의 index 값 ${lastBlockHeld.header.index}\n`
        )
        

        if (bc.createHash(lastBlockHeld) === lastBlockReceived.header.previousHash) {//받은 블록 중 마지막 블록의 이전해시값이 내 마지막 블록으로 만들어진 암호화값이 같을떄
            console.log(`마지막 하나만 비어있는경우에는 하나만 추가합니다.`)
            if (bc.addBlock(lastBlockReceived)) {
                broadcast(responseLastMsg())
            }
        } else if (receivedBlocks.length === 1) {//받은 블록의 길이가 1일 때
            console.log(`피어로부터 블록을 연결해야합니다!`)
            broadcast(queryAllMsg())
        } else {//많이 차이가 날 때
            console.log(`블럭을 최신화를 진행합니다.`)
            bc.replaceBlock(receivedBlocks)
        }

    } else {
        console.log('블럭이 이미 최신화입니다.')
    }
}

function initErrorHandler(ws){
    ws.on("close",()=>{ closeConnection(ws) })
    ws.on("error",()=>{ closeConnection(ws) })
}

function closeConnection(ws){
    console.log(`Connection close ${ws.url}`)
    sockets.splice(sockets.indexOf(ws),1)
}

//서버의 역활
//포트를 설정하므로 웹소켓 서버를 개설하는코드
function wsInit(){
    const server = new WebSocket.Server({ port:wsPORT})
    server.on("connection",(ws)=>{
        console.log('ws는 과연 무엇일까요?')
        console.log(ws)
        init(ws)

    })
}

function write(ws,message){ ws.send(JSON.stringify(message)) }
//연결된 모든 소켓에세 메세지 전송
function broadcast(message){//
    sockets.forEach( socket => {
        write(socket,message)
    })
}
//클라이언트에서 웹소켓에 접속
function connectionToPeers(newPeers){
    newPeers.forEach(peer=>{ 
       
        const ws = new WebSocket(peer)//클라이언트가 접속해서 작동을 할떄
        ws.on("open",()=>{ init(ws) })
        ws.on("error",()=>{  console.log("connection failed") })
    })
}

function init(ws){
    sockets.push(ws)
    initMessageHandler(ws)
    initErrorHandler(ws)
    write(ws,queryBlockMsg())
}

module.exports = {
    wsInit,
    getSockets,
    broadcast,
    responseLastMsg,
    connectionToPeers,
    
}