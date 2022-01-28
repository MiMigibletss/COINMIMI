const express = require('express')
const app = express()
const port = process.env.PORT || 3003
const bodyParser = require('body-parser')
const bc = require('./blocks.js')
const ws = require('./network.js')
const wl = require('./wallet')

//데이터베이스
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');
const { sequelize } = require('./models');
dotenv.config();



app.use(bodyParser.json())
//현재 네트워크 상의 블록을 가져오는 역활
app.get("/blocks",(req,res)=>{
    res.send(bc.getBlocks())
})
//버전을 가져오는 역활
app.get("/version",(req,res)=>{
    res.send(bc.getVersion())
})

//블록체인을 만드는 작업
app.post("/mineBlock",async(req,res)=>{
    const data = req.body.data 
    const result = bc.mineBlock(data) // 
    if(result === null ) {
        res.status(400).send(`블럭추가에 오류가 발생되었습니다.`)
    } else {
        add(data)
        console.log(data)
        res.send(result)
        
    }
})

//자신의 등록된 소켓들의 도메인을 가져오는 역활
app.get('/peers',(req,res)=>{
    res.send( ws.getSockets().map( socket => {
        return `${socket._socket.remoteAddress}:${socket._socket.remotePort}`;
    }) )
})

//
//웹소켓과 다른 웹소켓을 연결하는 포트
app.post('/addPeers',(req,res)=>{
    const peers = req.body.peers
    ws.connectionToPeers(peers)
    res.send('success')
})
//서버 정지
app.get("/stop",(req,res)=>{
    res.send("Server Stop")
    process.exit(0)
})

ws.wsInit()
app.listen(port,()=>{
    console.log(`server start port ${port}`)
})

app.get('/address',(req,res)=>{
    const address = wl.getPublicFromWallet();
    res.send({"adress:": address })
});

wl.initWallet()


//데이터베이스 연결

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  }));
  app.use(passport.initialize());
app.use(passport.session());

sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });
  app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });
  
  app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
  });
  

  

    
 
//   app.post("/mineBlock",(req,res)=>{
//     const data = req.body.data 
//     const result = bc.mineBlock(data) // 
//     if(result === null ) {
//         res.status(400).send(`블럭추가에 오류가 발생되었습니다.`)
//     } else {
//         console.log(data)
//         res.send(result)
//     }
// })