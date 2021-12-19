Web3 = require("web3")

rpcurl = "https://eth-mainnet.alchemyapi.io/v2/VQdDXJCy1OjhNb_kV4LrCZO9O8OofMLB"
w3 = new Web3(rpcurl)
w3m = new Web3("https://rpc-mainnet.maticvigil.com/")
ethers = require('ethers')
ethers = new ethers.providers.JsonRpcProvider(rpcurl)

univ2 = require("@uniswap/sdk")
univ3 = require("@uniswap/v3-sdk")
fs = require("fs")
var getJSON = require('get-json')
//apikey = "BSTWDFXD6QB45BJPUBVBN92EMC8M68397I"
univ2factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"

const { ChainId, Token, WETH, Pair, TokenAmount, Fetcher } = await import("@uniswap/sdk");

/**
 allow using uniswap sdk with either token object or string address
 only necessary to create token manually if decimals not 18, 
 so annoying most of time to need it, but necessary for stablecoins with decimals of 6
*/
function token(address, decimals=18, chainid=1) { 
 if(typeof(address) == 'object') { return address; }
return new Token(chainid, address, decimals); 
}


function getpairaddress(a, a1)
{
  return Pair.getAddress(token(a),token(a1));
}
/**
getpairreserves using uniswapv2 sdk
a1, a2 either address or token object
*/
async function getPairfetcher(a1, a2) {
 t1 = token(a1)
 t2 = token(a2)
return  await Fetcher.fetchPairData(t1, t2, ethers);
}

/**
get pair reserves directly without uniswap sdk with 2 tokenaddresses
inputs: address1, address2
*/
async function getreservesbyaddresses(a, a1) {
   const pairAddress = getpairaddress(a,a1);
   return await getreservesbypair(pairAddress)

}

/**
get pair reserves directly without uniswap sdk with 1 pairaddress
input pairaddress
return [reserve0: , reserve1: ] 
*/
async function getreservesbypair(pairAddress)
{
 return  await new w3.eth.Contract(pairv2abi, pairAddress).methods.getReserves().call() 
}
/**
order of addresses relative to reserves in pair 
return bool if ordered
*/
function orderbool(a1, a2) {
 return token(a1).sortsBefore(token(a2))
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
  format reserves from json rpc into map with addresses as keys and reserves as outputs,
  input reserves: map returned from json rpc in format : { reserve0: , reserve1: }
  input a1,a2, address 
  return: { reserve0:, reserve1: , a1:reserve0/1, a2: reserve1/0}
*/
function formatreserves(reserves, a1, a2)
{
  addr = orderarray(a1, a2)
  reserves[addr[0]] = reserves.reserve0
  reserves[addr[1]] = reserves.reserve1
  return reserves
}

/**
 get uniswap sdk Pair, from addresses/Tokens , and reserves json returned from uniswap pair contract
*/
function getPair1(a1, a2, reserves)
{
  addr = orderarray(a1, a2)
  tokens = addr.map(v => token(v));
  pair = new Pair( 
   new TokenAmount(tokens[0], reserves.reserve0),
   new TokenAmount(tokens[1], reserves.reserve1)
  );
  return pair;
}


/**
update pair reserves
input uniswap pair sdk object, newreserves object retrned from json rpc getReserves(),
and newpair bool for returning new Pair object instead of updating crrent one
returns the new/updated pair with updated reserves
*/
function updatepairreserves(pair, newreserves, newpair=0) { 
  t = pair.tokenAmounts; 
  t0 = new TokenAmount(t[0].token, newreserves.reserve0); 
  t1 = new TokenAmount(t[1].token, newreserves.reserve1); 
  if(!newpair) { t[0] = t0; t[1] = t1; return pair;}
  return new Pair(t0, t1);
}



/**
get reserves without uniswap sdk and convert back into uniswap sdk pair object
input address1, address2, either string or Token object
return uniswap sdk Pair object
*/
async function getPairandreserves(t1, t2) {
  
  t1 = token(t1); t2 = token(t2);
  const pairAddress = Pair.getAddress(t1, t2);

  const reserves = await getreservesbypair(pairAddress)
  
  const tokens = orderarray(t1,t2);

  const pair = new Pair(
    new TokenAmount(tokens[0], reserves.reserve0),
    new TokenAmount(tokens[1], reserves.reserve1)
  );
  return pair;
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
uni2router: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"

