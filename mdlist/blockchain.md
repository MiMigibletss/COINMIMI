# blockchain
## addblock
```js
function addBlock(data){

    const newBlock = nextBlock(data)
    Blocks.push(newBlock);
}
```
- 인자값으로 data를 넣어 nextBlock의 함수를 실행해 블록을 생성한다.(인자값인 data를 배열의 형태로 넣어준다.)
- 그 결과물을 블록체인인 Blocks 배열에 마지막 블록으로 추가해주는 역할을 한다.


## nextBlock
```js
function nextBlock(data){
    //header
    const prevBlock = getLastBlock()
    const version = getVersion()
    const index = prevBlock.header.index + 1
    const previousHash = createHash(prevBlock) 
    const time = parseInt(Date.now()/1000);
    const merkleTREE = merkle('sha256').sync(data)
    const merkleRoot = merkleTREE.root() || '0'.repeat(64)
    const header = new BlockHeader(version,index,previousHash,time,merkleRoot)
    return new Block(header,data)
}
```
전체적인 블록 생성
- 버전,이전해시값,시간,머클루트,인덱스 값 포함

## .getLastBlock
```js
function createHash(data){
    //header
    const {
        version,
        index,
        previoushash,
        time,
        merkleRoot
    } = data.header
    const blockString = version+index+previoushash+time+merkleRoot
    const Hash = CryptoJs.SHA256(blockString).toString()
    return Hash
}
```
## 검증

- 각타입들이 맞게 들어갓는지
- 암호화가 제대로 되어 있는지
- 인덱스가 이전블록에서 +1이 되어 있는지
- 이전블록이 제네시스 블록 및 이전블록인지 확인
- 배열별로 각 항목이 제대로 되어 있는지 확인

## 전체 코드

```js
const fs = require('fs')
const merkle = require('merkle')
const CryptoJs = require('crypto-js')
const random = require('random')
//예상 채굴시간과 난이도 조절 단위 수를 변수로 설정
const BLOCK_GENERATION_INTERVAL = 10; //블록이 생성되는 간격
const BLOCK_ADJUSTMENT_INTERVAL = 10  //블록마나 난이도가 조정되는 간격
class BlockHeader { 
    constructor(version ,index ,previousHash, time, merkleRoot,difficulty,nonce){
        this.version = version 
        this.index = index 
        this.previousHash = previousHash 
        this.time = time  
        this.merkleRoot = merkleRoot
        this.difficulty = difficulty
        this.nonce = nonce
    }
}


class Block {
    constructor(header,body){
        this.header = header
        this.body = body
    }
}

let Blocks = [createGenesisBlock()] 
// 전체 블록으 반환 Blocks는 앞으로 블록들이 생성되어서 넣어질 공간
function getBlocks(){
    return Blocks 
}
//우리가 만들고있는 블록체인 배열 Block의 현재의 마지막 블록을 반환해주는 역할을 한다.
function getLastBlock() {
   return Blocks[Blocks.length - 1]
}
// 최초의 블록생성
function createGenesisBlock(){
    const version ="1.0.0"//
 const index = 0
 const time = 1630907567
 const previousHash = '0'.repeat(64)
 const body = ['hello block']
 const tree = merkle('sha256').sync(body)
 const root = tree.root() || '0'.repeat(64)
 const difficulty = 1;
 const nonce = 0

 const header = new BlockHeader(version,index,previousHash,time,root,difficulty,nonce)
 return new Block(header,body)
}
//전체적인 블록을 만든다.
//return 부분을 보면 return new Block(header,body)으로 되어 클래스로 되어있음을 알 수 있다. 즉, 각 블록은 class로 되어있음을 알 수 있다.
function nextBlock(data){
    const prevBlock = getLastBlock()
    const version = getVersion()
    const index = prevBlock.header.index + 1
    const previousHash = createHash(prevBlock)
    const time = getCurrentTime()
    const difficulty = getDifficulty(getBlocks())
    //함수를 만들어서 조절을 할 것이다.//총 코인의 갯수를 정해놓고 난이도를 정해놓는 방법도 있다.
    //
    const merkleTree = merkle("sha256").sync(data) 
    const merkleRoot = merkleTree.root() || '0'.repeat(64)

    const header = new findBlock(version,index,previousHash,time,merkleRoot,difficulty);
    return new Block(header,data)
}
//바로 이전 블록의 header의 value값들을 가져와서 string으로 바꾼 다음에 다 합친 내용을 암호화를 한다.
function createHash(block){
    const {
        version,
        index,
        previousHash,
        time,
        merkleRoot
    } = block.header
    const blockString = version+index+previousHash+time+merkleRoot;
    const Hash = CryptoJs.SHA256(blockString).toString()
    return Hash
}

//블록추가 
function addBlock(newBlock){
    if(isVaildNewBlock(newBlock, getLastBlock())) {
        Blocks.push(newBlock);
        return true;
    } 
    return false;
}

function mineBlock(blockData){
    const newBlock = nextBlock(blockData) // Object Block {header, body}
    if(addBlock(newBlock)){
        const nw = require('./network')
        nw.broadcast(nw.responseLastMsg())
        return newBlock
    } else {
        return null
    }
}
//현재 넣으려는 블록 검증하는 함수
function isVaildNewBlock(currentBlock,previousBlock){

    if(!isVaildType(currentBlock)){
        console.log(`invaild block structrue ${JSON.stringify(currentBlock)}`)
        return false
    }

    if(previousBlock.header.index + 1 !== currentBlock.header.index) {
        console.log(`invaild index`)
        return false
    }
  
    if(createHash(previousBlock) !== currentBlock.header.previousHash){
        console.log(`invaild previousBlock`)
        return false
    }

    if (currentBlock.body.length === 0) {
        console.log(`invaild body`)
        return false
    }

    if (merkle("sha256").sync(currentBlock.body).root() !== currentBlock.header.merkleRoot) {
        console.log(`invalid merkleRoot`)
        return false
    }

    return true
}

function isVaildType(block){
    return (
        typeof(block.header.version) === "string" &&
        typeof(block.header.index) === "number" && 
        typeof(block.header.previousHash) === "string" && 
        typeof(block.header.time) === "number" && 
        typeof(block.header.merkleRoot) === "string" &&
        typeof(block.body) === "object" 
    )
    
}

function replaceBlock(newBlocks){

    if (isVaildBlock(newBlocks) && newBlocks.length > Blocks.length && random.boolean()) {
        console.log(`Blocks 배열을 newBlocks 으로 교체합니다.`)
        const nw = require('./network')
        Blocks = newBlocks
        nw.broadcast(nw.responseLastMsg())

    } else {
        console.log(`메시지로부터 받은 블록배열이 맞지 않습니다.`)
    }
}


function getVersion(){
    const {version} = JSON.parse(fs.readFileSync("./package.json"))
    return version
}

function getCurrentTime(){
    return Math.ceil(new Date().getTime()/1000) 
}
//전체적인 블록 내용을 검증하는 함수
function isVaildBlock(Blocks){
    if (JSON.stringify(Blocks[0]) !== JSON.stringify(createGenesisBlock())) {
        console.log(`genesis error`)
        return false 
    }


    let tempBlocks = [Blocks[0]] 
    for ( let i = 1; i < Blocks.length; i++) {
        if (isVaildNewBlock(Blocks[i],tempBlocks[i-1])) {
            tempBlocks.push(Blocks[i])
        } else {
            return false 
        }
    }

    return true
}
//SHA256으로 16진수로 변환한 결과를 2신수로 변환하여 조건 생성
function hexToBinary(s){
    const lookup={
        "0":"0000",
        "1":"0001",
        "2":"0010",    
        "3":"0011",
        "4":"0100",
        "5":"0101",
        "6":"0110",
        "7":"0111",
        "8":"1000",
        "9":"1001",
        "A":"1010",
        "B":"1011",
        "C":"1100",
        "D":"1101",
        "E":"1110",
        "F":"1111",    
    }
    let rst = "";
    for(let i = 0; i <s.length; i++){
        if(lookup[s[i]] ===undefined) return null
        rst +=lookup[s[i]]
    }
    return rst;
}
//내장함수를 이용하여 16진수를 2진수로 변환
function hexToBinary(s){
	let rst ="";
	for(let i = 0; i < s.length; i++){
    		if(parseInt(s[i],16)===NaN) return null
        rst +=((parseInt(s[i],16).toString(2).padStart(4,'0')))
        }
        return rst;
}    
//createHeaderHash의 값이 조건에 맞을 때까지 무한히 반복한다. 조건문이 반복할 때마다 nonce값이 증가
function findBlock(version,index,previousHash,time,merkleRoot,difficulty){
    let nonce = 0
    while(true){
        let hash = createHeaderHash(version,index,previousHash,time,merkleRoot,difficulty,nonce)
        if(hashMatchDifficulty(hash,difficulty)){//우리가 만들 header의 hash값의 앞자리 0이 몇개인가....
            //이곳에서 createHeaderHash 함수 호출할 것임
            return new BlockHeader(version,index,previousHash,time,merkleRoot,difficulty,nonce);
        }
        nonce++;
    }
}
//createHeaderHash: 헤더의 값에 nonce값을 추가해서 모두 더한 string값을 가지고 SHA256 암호화를 한 결과를 내보낸다.
function createHeaderHash(version,index,previousHash,time,merkleRoot,difficulty,nonce){
    let txt = version+index+previousHash+time+merkleRoot+difficulty+nonce
    return CryptoJs.SHA256(txt).toString().toUpperCase()
    
}

//hashMatchDifficulty: difficulty를 이용해 만든 조건을 만족하는지 hash값과 대조해보고 조건에 해당되면 블록을 생성한다.
function hashMatchDifficulty(hash,difficulty){
    const hashBinary = hexToBinary(hash);
    const prefix = "0".repeat(difficulty);
    
    //높으면 높을수록 조건을 맞추기가 까다로워짐(nonce값과 time값이 바뀌면서 암호화값이 달라진다.)
    return hash.startsWith(prefix)

}

//난이도 조절 단위수가 되었을 떄 (여기서는 10번쨰 블록)시간을 보고,적절하면 난이도를 유지하고,오래 걸리면 난이도를 감소시키고빠르면 난이도를 증가
function getDifficulty(blocks){

    const lastBlock = blocks[blocks.length-1];
    if(lastBlock.header.index % BLOCK_ADJUSTMENT_INTERVAL ===0 && lastBlock.header.index!=0){
        //난이도 조정 코드
        return getAdjustedDifficulty(lastBlock,blocks)
    }
    return lastBlock.header.difficulty
}
//지금 블록에서 난이도 조절 단위 수만큼의 전 블록과의 time즉 생성시간을 비교해서 자신의 예상 시간보다 느리거나 빠르면 난이도를 조잘
//적당하면 난이도를 유지되고 블록의 생성시간이 느리면 난이도를 낮추고 빠르면 난이도를 높인다
function getAdjustedDifficulty(lastBlock,blocks){
    const preAdjustmentBlock = blocks[blocks.length - BLOCK_ADJUSTMENT_INTERVAL];
    //시간 관련
    const timeToken = lastBlock.header.time - preAdjustmentBlock.header.time;
    const timeExpected = BLOCK_ADJUSTMENT_INTERVAL*BLOCK_GENERATION_INTERVAL;
    if(timeExpected>timeToken/2){
        return preAdjustmentBlock.header.difficulty+1;
    } else if(timeExpected<timeToken*2){
        return preAdjustmentBlock.header.difficulty-1;
    } else{
        return preAdjustmentBlock.header.difficulty
    }
}
module.exports = {
    getBlocks,
    getLastBlock,
    addBlock,
    getVersion,
    mineBlock,
    createHash,
    replaceBlock
}



```

## hashMatchDifficulty
```js
function hashMatchDifficulty(hash,difficulty){
    const hashBinary = hexToBinary(hash);
    const prefix = "0".repeat(difficulty);
    
    //높으면 높을수록 조건을 맞추기가 까다로워짐(nonce값과 time값이 바뀌면서 암호화값이 달라진다.)
    return hash.startsWith(prefix)

}
```
- hashMatchDifficulty함수가 hexToBinary을 받아올경우 2진수 바뀌어 0을찾는 속도 및 넌스가 줄어듬
- hash로 변경할 경우 16진수로 변경되어 
