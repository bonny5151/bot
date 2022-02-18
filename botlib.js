


var defaultdata1 = { type: 2,  maxPriorityFeePerGas: az(3,9,1), maxFeePerGas: az(200,9,1), gasLimit: bn(200000) }
var defaultdata137 = { type: 0, gasPrice: az(100,9,1), gasLimit: bn(300000) }




function formatgas(tr) {
  if (typeof tr == 'object') {
 return Object.entries(tr).filter(v=> v[1].constructor.name == "BigNumber").map(v=> [v[0], frombn(v[1]), frombn(v[1]).length])
 }
 return []
}


/**
tr  trasnaction object {data:0x..dfa}, or, datastring: 0xsdfwa,
*/
function formatdata(tr) {
var data = tr.data ? tr.data : tr
var formattedgas = formatgas(tr)
if(typeof data != "string") {return formattedgas} //no data field, only format gas

var i = 10; var arr = []; 
 arr.push(data.slice(0,10)); 
  while(i < data.length) { arr.push(data.slice(i, i + 64)); i+=64;}
  arr2 = arr.slice(1).map(v=> v.replace(/^0+/,"")).filter(v=> v.length > 2&& v.length <39).map(v=> { var f = "0x" + v; var ff = frombn(bn( f)); return [ f, ff, ff.length]})
   return [arr, arr2, formattedgas]

}

var defaultdata = {1: defaultdata1, 137: defaultdata137}

async function sendtransaction(t0, provider, wallet="") {

var signedtx = t0

if(wallet) {
 signedtx = await wallet.signTransaction(t0)

}
//provider.sendTransaction( transaction ) ⇒ Promise< TransactionResponse >source
//Submits transaction to the network to be mined. The transaction must be signed, and be valid (i.e. the nonce is correct and the account has sufficient balance to pay for the transaction).
 // "0xf8690401825208945555763613a12d8f3e73be831dff8598089d3dca882b992b75cbeb600080820a96a0e146b24f3246785e5be470de06a12848b2415eecb2c0300fab4b2877f2b4f26ba01feae4db9311af274c7be68ecb3bbb73c63b4b243abb58454458cdb002d43ad3";
var senttransaction = await provider.sendTransaction(signedtx);
console.log(senttransaction)
// {
//   chainId: 1337,
//   confirmations: 0,
//   data: '0x',
//   from: '0x089BFf9688805226F0C77159033960a0b0b04655',
//   gasLimit: { BigNumber: "21000" },
//   gasPrice: { BigNumber: "1" },
//   hash: '0x4cffa2526b20575ab51a392e74c797bc2ffda714112f6357c0e555e3d376c213',
//   nonce: 4,
//   r: '0xe146b24f3246785e5be470de06a12848b2415eecb2c0300fab4b2877f2b4f26b',
//   s: '0x1feae4db9311af274c7be68ecb3bbb73c63b4b243abb58454458cdb002d43ad3',
//   to: '0x5555763613a12D8F3e73be831DFf8598089d3dCa',
//   type: null,
//   v: 2710,
//   value: { BigNumber: "3141590000000000000" },
//   wait: [Function]
// }
//Returns a Promise which will not resolve until transactionHash is mined.
//If confirms is 0, this method is non-blocking and if the transaction has not been mined returns null. Otherwise, this method will block until the transaction has confirms blocks mined on top of the block in which is was mined
var receiptpromise =  provider.waitForTransaction( senttransaction.hash)
return receiptpromise

}

/**
contract data
*/
 async function populatetransaction (contractaddress, abi, funcname, args) {
  var contract = new ethers.Contract(contractaddress, abi)
  var t0 = await contract.populateTransaction[funcname](...args)
  return t0
} 

/**
nonce, gas data
*/
async function populatetransaction2(t0, wallet, data1={})
{
  var chainid = wallet.provider._network.chainId
  var data = Object.assign({}, defaultdata[chainid], wallet.data || {}, data1);
  t0 = Object.assign({},t0, data)
  if(t0.type==0 && t0.gasPrice) {
   delete t0['maxPriorityFeePerGas']
   delete t0['maxFeePerGas']
  }
  //if(botsettings.prompt) {
  t0 = await wallet.populateTransaction(t0)
  //}
  return t0  
}

async function populate(addr, abi, funcname, args, wallet, data1={})
{
    var t0 = await populatetransaction(addr, abi, funcname, args)
    t0 = await populatetransaction2(t0,wallet, data1)
    console.log(t0);
    console.log(formatdata(t0))
    var i = await promptverify()
    if(!i) { return 0;}
    return t0
}

async function populateandsend (contractaddress, abi, funcname, args,wallet, rpc, data={}) {
    rpc = rpc ? rpc : wallet.provider
    var t0 = await populatetransaction(contractaddress, abi, funcname, args)
    t0 = await populatetransaction2(t0,wallet, data)
    console.log(t0);
    console.log(formatdata(t0))
    var i = await promptverify()
    if(!i) { return 0;}
    var signedtx = await wallet.signTransaction(t0)
    console.log("signedtx: " + signedtx)
    return sendtransaction(signedtx,rpc)
}

function getrpc(wallet,rpc) {
 return rpc ? rpc : wallet.provider
}

function getaddress(addresses,wallet,rpc)
{
  var chainid = getrpc(wallet,rpc)._network.chainId
  return addresses[chainid]
}

module.exports = {
sendtransaction_: 'async function sendtransaction(t0, provider, wallet="")',
sendtransaction: sendtransaction,
populateandsend_: 'async function populateandsend (contractaddress, abi, funcname, args,wallet, rpc, data={})',
populateandsend: populateandsend,
populatetransaction_ : "async function (contractaddress, abi, funcname, args) ",
populatetransaction : populatetransaction,
populatetransaction2_:"async function populatetransaction2(t0, wallet, data1={})",
populatetransaction2: populatetransaction2,
//sendsignedtransaction_: "async function(provider, transaction) ",
//sendsignedtransaction: sendsignedtransaction,
defaultdata: defaultdata,
formatdata: formatdata,
formatadata_: "function formatdata(tr)",
formatgas_: "function formatgas(tr)",
formatgas: formatgas,
getrpc: getrpc,
getaddress: getaddress,
populate: populate
}




