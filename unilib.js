
 
/**const { ChainId, Token, WETH, Pair, 
   TokenAmount, Fetcher, Route, 
   Trade, TradeType } = await import("@uniswap/sdk")
*/
const uni = require("@uniswap/sdk")
const botlib = require("./botlib.js")
const [ChainId, Token, WETH, Pair, TokenAmount,
  Fetcher, Route, Trade, TradeType] = [uni.ChainId, 
   uni.Token, uni.WETH, uni.Pair, uni.TokenAmount, 
   uni.Fetcher, uni.Route, uni.Trade, uni.TradeType]

const getCreate2Address = require( '@ethersproject/address').getCreate2Address

const  keccak256  = require('@ethersproject/solidity').keccak256
const pack  = require('@ethersproject/solidity').pack




/**
  address: 0xstring, or, [0xaddress (string), decimals (int) , name (string)],
   or [0xaddress, name (string), decimals (int)]
   or Token

*/
function totoken(address, decimals=18, chainid=1) {
 var type  = address.constructor.name
 var name = ""
 if(type == 'Token') { return address; }
 else if (type == 'Array') {
   if(typeof address[1] == "number")
   {  
      decimals = address[1]; name = address[2] ? address[2] : "";
   } else if(typeof address[1] == "string") {
     name = address[1]; decimals = address[2] ? address[2] : decimals 
   }
   address = address[0]
 }
  return new Token(chainid, w3.utils.toChecksumAddress(address), decimals, name);
}


function zeroes(i) {
return new Array(i).fill("0").join("")
}



/**
input ['0xusdt',
  '0xweth',
  '0xusdc',
]
output: [ [ '0xusdt', '0xweth'], ['0xweth', '0xusdc']]
*/
function pairaddresspath(addresspath)
{
  var i = 0;
  var arr = [];

  while( i++ < addresspath.length - 1 ) { arr.push([addresspath[i-1], addresspath[i]]);}
  return arr
}

 defaultdata1 = { type: 2,  maxPriorityFeePerGas: az(3,9,1), maxFeePerGas: az(200,9,1), gasLimit: bn(200000) }
 defaultdata137 = { type: 0, gasPrice: az(100,9,1), gasLimit: bn(300000) }
 defaultdata56 = { type: 0, gasPrice: az(100,9,1), gasLimit: bn(300000) }



exchanges = {
uniswap2 : {gasdata: defaultdata1, network: "eth", factory: uni.FACTORY_ADDRESS, initcodehash: uni.INIT_CODE_HASH, router: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"},
quickswap: {network: "polygon", factory: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32', 
              initcodehash: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
             router: "0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff" ,
            gasdata: defaultdata137},
pancake: {network: "bsc", factory: "0xca143ce32fe78f1f7019d7d551a6402fc5350c73", initcodehash: "0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5",
             chainid: 56, router: "0x10ed43c718714eb63d5aa57b78b54704e256024e", gasdata: defaultdata56 }
}



unirouterabi = [
 "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[])",
 "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint256[])",
 "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint256[])"
]


/**
order of addresses relative to reserves in pair 
return bool if ordered
*/
function orderbool(a1, a2) {
 return totoken(a1).sortsBefore(totoken(a2))
}

/**
order addresses relative to reserves 
input address or Token
return array
*/
function orderarray(a1, a2) {
 return orderbool(a1, a2) ? [a1, a2] : [a2, a1]
}

/**
 return ordered tokens
*/
function ordertotokens(a1, a2)
{
   return orderarray(a1, a2).map(v => totoken(v));
}


module.exports = {
token : totoken,
abi: unirouterabi,
connect : function(exchange="uniswap2", rpcurl="") { return {

exchange: exchange,
w3: rpcurl ? new Web3(rpcurl): networks[exchanges[exchange].network].w3,
e: rpcurl ? new ethers.providers.JsonRpcProvider(rpcurl) : networks[exchanges[exchange].network].e,

token: function token(address, decimals=18, chainid=1) { 
  return totoken(address, decimals, chainid)
},

setexchange: function(exchange) {
  this.exchange = exchange
},
getaddress: function(tokenA, tokenB) {

var tokens = ordertotokens(tokenA, tokenB)
var exchange = exchanges[this.exchange]
return getCreate2Address(exchange.factory,
       keccak256(['bytes'],[pack(['address', 'address'], 
          [tokens[0].address, tokens[1].address])]), exchange.initcodehash)


},

getPair: async function(token1, token2) {
 var tokenA = totoken(token1)
 var tokenB = totoken(token2)
 const address = this.getaddress(tokenA, tokenB, exchange) 
 //const [reserves0, reserves1] = await new ethers.Contract(pairv2abi, address, e).getReserves() 
  var reserves = await  new this.w3.eth.Contract(pairv2abi, address).methods.getReserves().call() 
  const balances = tokenA.sortsBefore(tokenB) ? [reserves[0], reserves[1]] : [reserves[1], reserves[0]]
    var p = new Pair(new TokenAmount(tokenA, balances[0]), new TokenAmount(tokenB, balances[1]))
    p.tostring = this.printPair(p)
    p.reserves = this.formatpair2(p)
   return p
},
formatpair2: function(p) {
 p = p.tostring ? p.tostring : p
 var r = {}
  r[p.token1.address] = p.token1.amount
    r[p.token2.address] = p.token2.amount

    return r
},

swaptokensaddz: async function(amountin, amountoutmin, path, wallet, rpc="", data={}) {

var tokens = path.map((v)=> totoken(v))
var addressdecimals = tokens.map((v)=>[v.address, v.decimals, v.name])
var addresses = tokens.map((v)=>v.address)
var swap = {}
console.log("swap addz")
console.log(`amtin: ${amountin}  amountout  ${amountoutmin}`)
console.log(JSON.stringify(addressdecimals))

var i = await promptverify()
if(!i) { return;}

swap.amountin = az("" + amountin ,tokens[0].decimals)
swap.amountoutmin = az("" + amountoutmin, tokens[tokens.length - 1].decimals)
return this.swaptokens(swap.amountin, swap.amountoutmin, addresses, wallet, rpc, data)

},

swapethtotokens: async function(){},
swaptokenstoeth: async function(){},


swaptokens: async function(amountin, amountoutmin, path, wallet, rpc="",data1={}) {


var routerabi = unirouterabi
var exchange1 = exchanges[this.exchange]
var address = exchange1.router

var swap = {}
swap.amountin = "" + amountin
swap.amountoutmin = "" + amountoutmin
swap.path = path
swap.to = wallet.address
swap.deadline =  Math.floor(Date.now() / 1000) + 60 * 5;

console.log("swap: ")

return botlib.populateandsend(address,routerabi,"swapExactTokensForTokens",
               [swap.amountin, swap.amountoutmin, swap.path, swap.to, swap.deadline], wallet, rpc, data1)


},

zeroes: function zeroes(i) {
return new Array(i).fill("0").join("")
},

getOutputbyaddresspath: 
 async function getOutputbyaddresspath(addresspath, inputamount, decimals=0)
{
  var t = this.token(addresspath[0])
  
  var pairreserves = await this.getPairreservesbyaddresspath(addresspath)
  
  return this.getOutput(pairreserves, t, inputamount, decimals)  

},

/**
addresspath: [tokenaddress1, tokenaddress2, tokenaddress3]
returns [pair1/2, pair2/3]
*/
getPairreservesbyaddresspath : 
async function getPairreservesbyaddresspath(addresspath) {
 var arr = pairaddresspath(addresspath)

  var pairreserves = await Promise.all(
      arr.map( async(v)=> {return  await this.getPair(v[0], v[1]) } )
   )
  return pairreserves

},
printPair: function printPair(p) {  
  var pairaddress = p.liquidityToken.address
  var tokens = p.tokenAmounts.map((v)=> { 
   return {address: v.token.address, amount: v.toExact(), name:v.token.symbol, decimals:v.token.decimals}
   })
   return {pairaddress: pairaddress, token1: tokens[0], token2: tokens[1]}
},




getOutput: function getOutput(pairpath, tokeninput, inputamount, zeroesadded = false)
{
  var t = totoken(tokeninput)
  inputamount += ""
  if(!zeroesadded) {
  inputamount = ethers.utils.parseUnits(inputamount, t.decimals).toString()
   }
  var r = new Route(pairpath, t)
  var t = new Trade(r, new TokenAmount(t,inputamount), TradeType.EXACT_INPUT)
  var output = t.outputAmount
  output.tostring = output.toExact()
  output.trade = t
  output.route = r
  return output
},

route : function(pairpath, token) {
 return new Route(pairpath, totoken(token))
},

};
}


}


