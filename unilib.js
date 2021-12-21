 
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

toaddress: function toaddress(token) {
 if(typeof(token) == 'object') { return token.address; }
  return token
},


getpairaddress: function getpairaddress(a, a1)
{
  return Pair.getAddress(token(a),token(a1));
}, 
/**
getpairreserves using uniswapv2 sdk
a1, a2 either address or token object
*/
getPairfetcher: async function getPairfetcher(a1, a2) {
 var t1 = token(a1)
 var t2 = token(a2)
 var p = await Fetcher.fetchPairData(t1, t2, ethers);
 p.tostring = this.printPair(p)
 return p
},

/**
get pair reserves directly without uniswap sdk with 2 tokenaddresses
inputs: address1, address2
*/

getreservesbyaddresses: 
async function getreservesbyaddresses(a, a1) {
   const pairAddress = this.getpairaddress(a,a1);
   var reserves = await this.getreservesbypair(pairAddress)
   return this.formatreserves(reserves, a, a1);

},

/**
get pair reserves directly without uniswap sdk with 1 pairaddress
input pairaddress
return [reserve0: , reserve1: ] 
*/
getreservesbypair: 
async function getreservesbypair(pairAddress)
{
 return  await new w3.eth.Contract(pairv2abi, pairAddress).methods.getReserves().call() 
},
/**
order of addresses relative to reserves in pair 
return bool if ordered
*/
orderbool: function orderbool(a1, a2) {
 return token(a1).sortsBefore(token(a2))
},

/**
order addresses relative to reserves 
input address or Token
return array
*/
orderarray: function orderarray(a1, a2) {
 return this.orderbool(a1, a2) ? [a1, a2] : [a2, a1]
},

/**
 return ordered tokens
*/
ordertotokens: function ordertotokens(a1, a2)
{
   return this.orderarray(a1, a2).map(v => token(v));
},

/**
  format reserves from json rpc into map with addresses as keys and reserves as outputs,
  input reserves: map returned from json rpc in format : { reserve0: , reserve1: }
  input a1,a2, address 
  return: { reserve0:, reserve1: , a1:reserve0/1, a2: reserve1/0}
*/
formatreserves: function formatreserves(reserves, a1, a2)
{
  var t = this.ordertotokens(a1, a2)
  reserves[t[0].address] = reserves.reserve0
  reserves[t[1].address] = reserves.reserve1
  return reserves
},

/**
update pair reserves
input uniswap pair sdk object, newreserves object retrned from json rpc getReserves(),
and newpair bool for returning new Pair object instead of updating crrent one
returns the new/updated pair with updated reserves
*/
updatepair: function updatepair(pair, newreserves, newpair=0) { 
  var t = pair.tokenAmounts; 
  var t0 = new TokenAmount(t[0].token, newreserves.reserve0); 
  var t1 = new TokenAmount(t[1].token, newreserves.reserve1); 
  if(!newpair) { t[0] = t0; t[1] = t1; return pair;}
  return this.formatpair(new Pair(t0, t1));
},


updatepairandreserves: 
async function updatepairandreserves(pair, newpair=0)
{
   var reserves = await this.getreservesbypair(pair.liquidityToken.address)
   return this.updatepair(pair, reserves, newpair)

},

/**
 get uniswap sdk Pair, from addresses/Tokens , and reserves json returned from uniswap pair contract
*/
getPair: function getPair(a1, a2, reserves)
{
  var tokens = this.ordertotokens(a1, a2)
  var pair = new Pair( 
   new TokenAmount(tokens[0], reserves.reserve0),
   new TokenAmount(tokens[1], reserves.reserve1)
  );
  return this.formatpair(pair);
},

formatpair: function formatpair(p)
{
  p.tostring = this.printPair(p)
  return p
},

/**
get reserves without uniswap sdk and convert back into uniswap sdk pair object
input address1, address2, either string or Token object
return uniswap sdk Pair object
*/
getPairandreserves: 
async function getPairandreserves(t1, t2) {

  const reserves = await this.getreservesbyaddresses(t1, t2)
  return this.getPair(t1, t2, reserves)

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
      arr.map( async(v)=> {return  await this.getPairandreserves(v[0], v[1]) } )
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


