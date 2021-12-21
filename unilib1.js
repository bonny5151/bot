 
/**const { ChainId, Token, WETH, Pair, 
   TokenAmount, Fetcher, Route, 
   Trade, TradeType } = await import("@uniswap/sdk")
*/
const uni = require("@uniswap/sdk")

const [ChainId, Token, WETH, Pair, TokenAmount,
  Fetcher, Route, Trade, TradeType] = [uni.ChainId, 
   uni.Token, uni.WETH, uni.Pair, uni.TokenAmount, 
   uni.Fetcher, uni.Route, uni.Trade, uni.TradeType]

async function getgasprice() {
 var g = await w3.eth.getGasPrice()
 return Number.parseInt(a) * 1e-9
}
async function getgasprice1() {
 var g = await e.getGasPrice().toString()
 return g
}

 function token(address, decimals=18, chainid=1) {
 if(typeof(address) == 'object') { return address; }
return new Token(chainid, w3.utils.toChecksumAddress(address), decimals);
}

module.exports = {

/**
 allow using uniswap sdk with either token object or string address
 only necessary to create token manually if decimals not 18, 
 so annoying most of time to need it, but necessary for stablecoins with decimals of 6
*/
token: function token(address, decimals=18, chainid=1) { 
 if(typeof(address) == 'object') { return address; }
return new Token(chainid, w3.utils.toChecksumAddress(address), decimals); 
},


getPair: async function(token1, token2) {
 var tokenA = token(token1)
 var tokenB = token(token2)
 const address = Pair.getAddress(tokenA, tokenB) 
 //const [reserves0, reserves1] = await new ethers.Contract(pairv2abi, address, e).getReserves() 
  var reserves = await  new w3.eth.Contract(pairv2abi, address).methods.getReserves().call() 
  const balances = tokenA.sortsBefore(tokenB) ? [reserves[0], reserves[1]] : [reserves[1], reserves[0]]
    var p = new Pair(new TokenAmount(tokenA, balances[0]), new TokenAmount(tokenB, balances[1]))
    p.tostring = this.printPair(p)
   return p
},

/**

pairpath[unisdkPair, 
tokeninput: address string or unisdkToken
inputamount , numberstring
decimals = number of added 0s already in inputamount
inputamount: 21.112, decimals calculated to 3,
inputamount: 21112, decimals: 3
*/
getOutput: 
function getOutput(pairpath, tokeninput, inputamount, decimalsadded = 0)
{
  var t = token(tokeninput)
  inputamount += ""
  var decimalsin = inputamount.indexOf(".")
  if(decimalsin > -1) {
      decimalsadded = inputamount.length - decimalsin  - 1
      inputamount = inputamount.replace(".","")
  }
  var zeroes = t.decimals - decimalsadded

  zeroes = new Array(zeroes).fill("0").join("")
  inputamount += zeroes
  var r = new Route(pairpath, t)
  var t = new Trade(r, new TokenAmount(t,inputamount), TradeType.EXACT_INPUT)
  var output = t.outputAmount
  output.tostring = output.toExact()
  return output
},

/**
input ['0xusdt',
  '0xweth',
  '0xusdc',
]
output: [ [ '0xusdt', '0xweth'], ['0xweth', '0xusdc']]
*/
pairaddresspath: function pairaddresspath(addresspath)
{
  var i = 0;
  var arr = [];

  while( i++ < addresspath.length - 1 ) { arr.push([addresspath[i-1], addresspath[i]]);}
  return arr
},

/**
addresspath: [tokenaddres1, tokenaddress2, tokenaddressout]
inputamount: 21.112, 
inputamount: 21112, decimals: 3
decimals, decimals added when no ".", ignored if "."
returns TokenAmount, 
*/
getOutputbyaddresspath: 
 async function getOutputbyaddresspath(addresspath, inputamount, decimals=0)
{
  var t = token(addresspath[0])
  
  var pairreserves = await this.getPairreservesbyaddresspath(addresspath)
  
  return this.getOutput(pairreserves, t, inputamount, decimals)  

},

/**
addresspath: [tokenaddress1, tokenaddress2, tokenaddress3]
returns [pair1/2, pair2/3]
*/
getPairreservesbyaddresspath : 
async function getPairreservesbyaddresspath(addresspath) {
 var arr = this.pairaddresspath(addresspath)

  var pairreserves = await Promise.all(
      arr.map( async(v)=> {return  await this.getPair(v[0], v[1]) } )
   )
  return pairreserves

},
printPair: function printPair(p) {  
  var pairaddress = p.liquidityToken.address
  var tokens = p.tokenAmounts.map((v)=> { 
   return {address: v.token.address, amount: v.toExact()}
   })
   return {address: pairaddress, token1: tokens[0], token2: tokens[1]}
}

}


