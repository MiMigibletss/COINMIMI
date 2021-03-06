
const   bodyParser =require('body-parser') ;
const express  =require('express') ;

const {
    Block, generateNextBlock, generatenextBlockWithTransaction, generateRawNextBlock, getAccountBalance,
    getBlockchain, getMyUnspentTransactionOutputs, getUnspentTxOuts, sendTransaction
} =require('./blockchain') ;
const {connectToPeers, getSockets, initP2PServer,broadcast} =require('./p2p') ;
const {getTransactionPool} =require('./transactionPool') ;
const {getPublicFromWallet, initWallet} =require('./wallet') ;
const httpPort = parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort = parseInt(process.env.P2P_PORT) || 6001;
/**이 서버를 사용하여 다음과 같은 걸 할거에요.

블록의 리스트 가져오기
새로운 블록을 만들기
노드 목록을 가져오거나 새로운 노드를 추가하기 curl명령어로도 노드를 제어할 수 있어요. */
const initHttpServer = (myHttpPort) => {
    const app = express();
    app.use(bodyParser.json());
    app.use((err, req, res, next) => {
        if (err) {
            res.status(400).send(err.message);
        }
    });
    app.get('/blocks', (req, res) => {
        res.send(getBlockchain());
    });
    app.get('/unspentTransactionOutputs', (req, res) => {
        res.send(getUnspentTxOuts());
    });
    app.get('/myUnspentTransactionOutputs', (req, res) => {
        res.send(getMyUnspentTransactionOutputs());
    });
    app.post('/mineRawBlock', (req, res) => {
        if (req.body.data == null) {
            res.send('데이터 매개변수가 없습니다');
            return;
        }
        const newBlock = generateRawNextBlock(req.body.data);
        if (newBlock === null) {
            res.status(400).send('블록을 생성할 수 없습니다');
        }
        else {
            res.send(newBlock);
        }
    });
    app.post('/mineBlock', (req, res) => {
        const newBlock = generateNextBlock();
        if (newBlock === null) {
            res.status(400).send('블록을 생성할 수 없습니다');
        }
        else {
            res.send(newBlock);
        }
    });
    app.get('/balance', (req, res) => {
        const balance = getAccountBalance();
        res.send({ 'balance': balance });
    });
    app.get('/address', (req, res) => {
        const address = getPublicFromWallet();
        res.send({ 'address': address });
    });
    //지갑을 사용하기 위해 기능을 넣어 보죠.
    //위에서 보듯 사용자는 단지 주소와 코인금액만 제공하면 되요. 블럭체인의 노드가 나머지는 알아서 뿅.
    app.post('/mineTransaction', (req, res) => {
        const address = req.body.address;
        const amount = req.body.amount;
        try {
            const resp = generatenextBlockWithTransaction(address, amount);
            res.send(resp);
        }
        catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });
    //새로운 HTTP 인터페이스가 하나 더 필요해요. POST타입의 /sendTransaction. 이를 이용해 wallet에 트랜젝션을 만들고 이 트랜젝션을 트랜젝션풀에 넣는 기능을 더할 거에요. 블럭체인에 새 트랜젝션을 포함시키고자 할 때, 이 인터페이스를 우선적으로 사용할 거에요.
    app.post('/sendTransaction', (req, res) => {
        try {
            const address = req.body.address;
            const amount = req.body.amount;
            if (address === undefined || amount === undefined) {
                throw Error('잘못된 주소 또는 금액');
            }
            const resp = sendTransaction(address, amount);
            res.send(resp);
        }
        catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });
    app.get('/transactionPool', (req, res) => {
        res.send(getTransactionPool());
    });
    app.get('/peers', (req, res) => {
        res.send(getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        connectToPeers(req.body.peer);
        res.send();
    });
    app.post('/stop', (req, res) => {
        res.send({ 'msg': 'stopping server' });
        process.exit();
    });
    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};
initHttpServer(httpPort);
initP2PServer(p2pPort);
initWallet();




/**
 *  curl http://localhost:3001/blocks 
 * 
 */