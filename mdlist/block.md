# Block
- 블록은 데이터를 저장하는 단위로, 바디(body)와 헤더(header)로 구분된다. 바디에는 거래 내용이, 헤더에는 머클해시(머클루트)나 넌스(nounce, 암호화와 관련되는 임의의 수) 등의 암호코드가 담겨 있다. 블록은 약 10분을 주기로 생성되며, 거래 기록을 끌어 모아 블록을 만들어 신뢰성을 검증하면서 이전 블록에 연결하여 블록체인 형태가 된다. 여기서 처음 시작된 블록을 제네시스 블록이라고 부른다. 즉, 제네시스 블록은 그 앞에 어떤 블록도 생성되지 않은 최초의 블록을 말한다. [1] 블록은 평균적으로 10분에 하나씩 생성이 된다. 민주적인 합의를 거쳐 블록이 생성된다.

## Hash
- sha256
단방향 암호화(복호화할 수 없는 암호시스템)
자리수 고정됨(a를 넣어도 64글자 bbbbdcaadsf를 넣어도 64자리...)


## 블록의 구성요소
```js
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

```
#### 헤더
- version
- timestamp
- HashPrevBlock
- index
- merkle root
- difficulty
- nonce
####  바디
```js
배열의 형태로 집어넣는다.
[ 'ssssss' ]
배열 안의 객체의 형태로 넣어도 상관이 없다.
[{ssss},{ddddd}]
```
- 바디는 많은거래 내역이 들어간다. 거래내역의 크기에 따라 블록 하나에 들어가는 거래내역의 수도 달라진다. 바디에는 머클트리를 따로 저장하지 않는다. 바디에는 INPUT , OUTPUT같은 거래 그 자체만 들어 있다.
## version
```js
const fs = require('fs');//filesystem

function getVersion(){
    const package = fs.readFileSync("../package.json");
    console.log(package.toString("utf8"));
};


getVersion();
```
- 버전(version, 4바이트) : 말 그대로 이 블록헤더의 버전이다(윈도우 7,8, 10과 같은). 현재 이 블록헤더를 만든 비트코인 프로그램의 버전 번호가 된다.
## timestamp
- 타임스탬프(timestamp, 4바이트) : 블록의 대략적인 생성 시간을 뜻한다.
## HashPrevBlock
- 이전블록해시(previous block hash, 32바이트) : 블록체인이 검증 가능한 체인이 되는 중요한 이유이다. 백서 글에서 설명했듯이 각 블록들은 이 이전 블록해시를 통해서 연결된다. 각 블록들이 이전 블록의 내용을 확인하고 저장하고 있으니 그 검증이 최초 블록인 제네시스 블록(genesis block)까지 이어지는 것이다. 블록 중 중간에 하나를 고치려면 그 뒤에 모든 블록을 고쳐야 하므로 각 블록의 거래내역들은 변경할 수 없는 영원한 기록이 되는 것이다.
## index
- 몇번쨰 블록인지 확인
## merkle root
![C3TZR1g81UNchGPKLQuxAL7oEwDJ42cT977qXjChRoAJaLMRNYADqaYTPf4p22Ah5vW1kkSf3Q2kirixsqcZh8289jKAmHKP8FsQrc4FegHoog7m9YKXn4v](https://user-images.githubusercontent.com/88940298/148062279-dc622bc9-d0c6-45c5-a71a-b86086a0a899.png)
```js
const {MerkleTree} = require('merkletreejs');
const SHA256 = require('crypto-js/sha256');

const testSet =['a','b','c','c'];
const testArray = testSet.map((v)=>SHA256(v));
const tree = new MerkleTree(testArray,SHA256);
const root = tree.getRoot();
console.log(root.toString('hex'));
```

- 머클루트(merkle root, 32바이트) : 백서 글에서 설명한 머클트리의 루트 부분이다. 이 루트 부분이 SPV 노드를 가능하게 만들고 거래내역 검증을 쉽게 해준다.
- 최초 데이터를 SHA256형태의 해시값으로 변환한다.
- 가장 가까운 노드 2개를 한쌍으로 묶어 합친 후 그 값을 해시값으로 변환한다.
- 하나가 남을때까지 2번 과정을 계속 반복되며 하나의 값만 남았을 때까지 이 과정을 반복한다.
- 최종적으로 남는 하나의 블록은 모든 거래를 합친 해시값을 포함하고 있으며 이를 머클루트(Merkle Root)라 한다.
## difficulty
- 난이도(해시 목표값, bits, 4바이트) : 블럭 생성은 약 10분에 하나씩 만들어지는 것으로 블록체인 네트워크에 설정되어 있다. 그러나 다른 중앙화된 시스템처럼 관리자가 있는 것이 아니므로 네트워크 안에서 이 시간이 조정되게 만들어져 있다. 그 시간을 조정하는 장치가 바로 이 비트(bits)라고 불리는 난이도(難易度, difficulty)이다.
## nonce
- 논스(nonce, 4바이트) : 논스는 블록을 만드는 과정에서 적절한 해시값을 찾는 재료이다. 1씩 올려주면서 적절한 해시값을 찾게 해주는 재료가 된다. 작업증명 방식의 유일한 변수가 된다.
