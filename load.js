Web3 = require("web3")

rpcurl = "https://eth-mainnet.alchemyapi.io/v2/VQdDXJCy1OjhNb_kV4LrCZO9O8OofMLB"
w3 = new Web3(rpcurl)
w3m = new Web3("https://rpc-mainnet.maticvigil.com/")
ethers = require('ethers')
e = new ethers.providers.JsonRpcProvider(rpcurl)
univ2 = require("@uniswap/sdk")
univ3 = require("@uniswap/v3-sdk")
fs = require("fs")
var getJSON = require('get-json')
//apikey = "BSTWDFXD6QB45BJPUBVBN92EMC8M68397I"
univ2factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
const uni = require("@uniswap/sdk")

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

function require2(a) {  delete require.cache[require.resolve(a)]; return require(a); }


