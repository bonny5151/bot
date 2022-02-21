Web3 = require("web3")
ethers = require('ethers')
prompt = require("prompt-sync")()
rpcurl = "https://mainnet.infura.io/v3/8e02f790d43741e988dabd248ec38d2c"
rpcurl2 = "https://eth-mainnet.gateway.pokt.network/v1/lb/61ce4e77b86d760039e03a5b"
rpcurl3 = "https://mainnet.infura.io/v3/3761bae078234c858784dece17947c86"
//rpcp = "https://rpc.ankr.com/polygon"
rpcp = "https://polygon-mainnet.g.alchemy.com/v2/t1_gSvWjb7JybAE0I7Z4CHWLto6SQB1t"

rpcflashbots = "https://rpc.flashbots.net"
rpcethermine = "https://rpc.ethermine.org"
rpcvps = "http://157.245.75.10:8545"
rpcvps1 = "http://64.227.71.130:8545"
rpclocal1 = "http://192.168.1.168:8545"
rpclocal2 = "http://192.168.1.168:8547"
rpclocal3 = "ws://192.168.1.168:8548"
rpcarchivetrace = "https://eth-trace.gateway.pokt.network/v1/lb/61faf29d928807003ad3ff94" 
get_e = function get_e(url){
 var e1;
 if(url.startsWith("ws")) {
   e1 = new ethers.providers.WebSocketProvider(url)
 } else {
  e1 = new ethers.providers.JsonRpcProvider(url)
 }
 e1.getNetwork()
 return e1
}
networks = {
polygon: { w3: new Web3(rpcp), e: get_e(rpcp)}, 
eth: { w3: new Web3(rpcurl3), e: get_e(rpcurl3)}

}

w3 = networks.eth.w3;
w3m = networks.polygon.w3
e = networks.eth.e
localrpc ="http://127.0.0.1:8545/"
//elocal = get_e(localrpc)

eflashbots = get_e(rpcflashbots)
eethermine = get_e(rpcethermine)
univ2 = require("@uniswap/sdk")
univ3 = require("@uniswap/v3-sdk")
//fs = require("fs")
//var getJSON = require('get-json')
//apikey = "BSTWDFXD6QB45BJPUBVBN92EMC8M68397I"
univ2factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
const uni = require("@uniswap/sdk")
filterpending = function(_e,fn2, arr){
  _e.on("pending", (v)=> {
    _e.getTransaction(v).then((v1)=>{if(fn2(v1)){ arr.push(v1);}},()=>{})
  })

}
//etherscanurl = `https://api.etherscan.io/api?module=contract&action=getabi&apikey=${apikey}&address=${address}`
//abi22 = fs.readFileSync("./factoryv2.abi","utf8").trim()
uni2abi =  "@uniswap/v2-core/build/"
uni3abi = "@uniswap/v3-core/artifacts/contracts/interfaces/"
factoryv2abi = require( uni2abi + "IUniswapV2Factory.json").abi
factoryv3abi = require( uni3abi + "IUniswapV3Factory.sol/IUniswapV3Factory.json").abi
pairv2abi =  require( uni2abi +  "IUniswapV2Pair.json").abi
pairv3abi = require( uni3abi + "IUniswapV3Pool.sol/IUniswapV3Pool.json").abi

//abi2 = await getJSON(etherscanurl)
//abi2 = abi2.result
factory = new w3.eth.Contract(factoryv2abi,univ2.FACTORY_ADDRESS)
uni2router = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"

require2 = function require2(a) {  delete require.cache[require.resolve(a)]; return require(a); }

bn = function(i) { return ethers.BigNumber.from(i) }
frombn = function(i) { return i.toString();}
addzeroes = function (i, i1, bn1=0) {  var r = ethers.utils.parseUnits(i+"",i1); return bn1 ? r : r.toString();}
removezeroes = function(i,i1, bn1 = 0) { var r = ethers.utils.formatUnits(i+"",i1); return bn1? r: r.toString();}
num = function(i) {return Number.parseFloat(i)}
//min = function(i,i1) { i = bn(i), i1 = bn1(i1) }
az = addzeroes
rz = removezeroes

resolvenum = async function resolvenum(p, i=0) { 
  var f = await p; 
  f = frombn(f); 
  return i ? rz(f,i) : f;
}


botsettings = {
 prompt: 0
}
towallet = function(key, rpc=e) { return new ethers.Wallet(key, rpc);}
getw = async function getwjson(json,rpc,k, prompt1=0 ) { 
var d = ""
if(prompt1) {
 d = prompt.hide("pd ")
 //cl.close()
}
if(typeof json == "object") { json = JSON.stringify(json);}
var wallet = ethers.Wallet.fromEncryptedJsonSync(json,k + d)
return wallet.connect(rpc)

}


promptverify = async function(force) {
  if(botsettings.prompt || force=="force") {
    var c = prompt("continue y/n ") 
    //cl.close()
    if(c == 'y' || c == 'yes'){return 1;} 
    else {return 0}
  }
  return 1
}

var u = require("./unilib.js")
var u1 = u.connect()
tokens = {
  usdt: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  weth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  mana: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
 dai : "0x6b175474e89094c44da98b954eedeac495271d0f",
   weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
   
   uni2router: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"
   
   }

var t = tokens; 


async function getgasprice() {
 var gp = await w3.eth.getGasPrice()
 return Number.parseFloat(rz(gp,9))
}

async function getetherprice() {
  var g = await u1.getOutputbyaddresspath([t.weth,[t.usdc,6,"usdc"]],1)
  var g1 = await u1.getOutputbyaddresspath([t.weth,t.dai],1)
  return (Number.parseFloat(g.tostring) + Number.parseFloat(g1.tostring)) * 1.003 / 2
}

(async function() {
gasprice = await getgasprice()
etherprice = await getetherprice()
})();
estimategas = function(gaslimit) { return gasprice * gaslimit * etherprice * 1e-9}


startgasprice = function() {
  setInterval(function(){getgasprice().then((v=>gasprice=v),(b=>{console.log(b); console.log("errgasprice11");}))},3000)
}
startgasprice()

startetherprice = function() {
  setInterval(function() { getetherprice().then((v=>etherprice=v),(b=>console.log("erretherprice")))},30000)
}
startetherprice()



