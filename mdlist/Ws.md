# Ws 쏘캣

## server.js
### /blocks
```js
app.get("/version",(req,res)=>{
    res.send(bc.getVersion())
})
```
- 현재 네트워크 상의 블록을 가져오는 역활
### /version
```js
app.get("/version",(req,res)=>{
    res.send(bc.getVersion())
})
```
- 버전을 가져오는 역활
### /mineBlock
```js
app.post("/mineBlock",(req,res)=>{
    const data = req.body.data 
    const result = bc.mineBlock(data) // 
    if(result === null ) {
        res.status(400).send(`블럭추가에 오류가 발생되었습니다.`)
    } else {
        res.send(result)
    }
})
```
- 블록체인을 만드는 작업
### /peers
```js
app.get('/peers',(req,res)=>{
    res.send( ws.getSockets().map( socket => {
        return `${socket._socket.remoteAddress}:${socket._socket.remotePort}`;
    }) )
})
```
- 자신의 등록된 소켓들의 도메인을 가져오는 역활
### /addPeers 
```js
app.post('/addPeers',(req,res)=>{
    const peers = req.body.peers
    ws.connectionToPeers(peers)
    res.send('success')
})
```
- 웹소켓과 다른 웹소켓을 연결하는 포트
### /stop 
```js
app.get("/stop",(req,res)=>{
    res.send("Server Stop")
    process.exit(0)
})

```
- 서버 정지

## netsocket.js


### server
```js
function wsInit(){
    const server = new WebSocket.Server({ port:wsPORT})
    server.on("connection",(ws)=>{
        init(ws)

    })
}
```

- 서버의 역활
- WebSocket.Server는 자신의 port번호를 설정함으로써 웹소켓 서버를 개설한다.
- 그리고 다른 웹소켓 서버가 접속할 때까지 기다리는 역할을 한다.
server.on("connection",callback)은 다른 소켓이 처음으로 접속했을 때 핸드쉐이크가 일어날 때 작동하는 코드이다. ws에는 고유의 키값이 담긴다.

### client
```js
function connectionToPeers(newPeers){
    newPeers.forEach(peer=>{ 
       
        const ws = new WebSocket(peer)
        ws.on("open",()=>{ init(ws) })
        ws.on("error",()=>{  console.log("connection failed") })
    })
}
```
- 클라이언트에서 웹소켓에 접속하기위한 코드

```
클라이언트 접속과 서버 접속의 코드 차이
클라이언트가 접속해서 작동을 할 때는
cosnt ws = new WebSocket(접속할 url)으로 접속하고 ws.on("open",콜백함수)의 콜백함수에 코드를 입력해주면 된다.
반면 서버가 접속을 감지할 때는
const server = new WebSocket.Server({ port:자신의 포트번호})
를 입력한 뒤 자신의 포트번호에 들어온 이에게 행할 함수에 대해선
server.on("connection",콜백함수)로 입력해준다.
```

```
let sockets = []
```
- 다음과 같이 소켓에 주소를 넣을 공간을 마련한다.
