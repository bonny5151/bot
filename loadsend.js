ethers = require('ethers')
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

var towallet = function(key, rpc=e) { 
   if(key.indexOf(" ") >0) { 
      return new ethers.Wallet(ethers.Wallet.fromMnemonic(key), rpc);
  } 
   return new ethers.Wallet(key, rpc);
}

var bn = function(i) { return ethers.BigNumber.from(i) }
var frombn = function(i) { return i.toString();}
var addzeroes = function (i, i1, bn1=0) {  var r = ethers.utils.parseUnits(i+"",i1); return bn1 ? r : r.toString();}
var removezeroes = function(i,i1, bn1 = 0) { var r = ethers.utils.formatUnits(i+"",i1); return bn1? r: r.toString();}
var num = function(i) {return Number.parseFloat(i)}
//min = function(i,i1) { i = bn(i), i1 = bn1(i1) }
var az = addzeroes
var rz = removezeroes

var defaultdata0 = { type: 0, gasPrice: "", gasLimit: "", from: "", to: "" , data: "0x"}
var defaultdata56 = {type: 0, gasPrice: az(5, 9, 1), gasLimit: bn(22000) }

var sendaz = async  function(wallet, from, to, amount, defaultdata = defaultdata56)  {
 var d1 = Object.assign({}, defaultdata);
 d1.from = from
 d1.to = to
 d1.value = az(amount, 18, 1)

  var t = await w.sendTransaction(d1)
 return t
}
var sendwaitconfirm = async function(o){
  var s = await sendaz(o.wallet, o.from, o.to, o.amount, o.defaultdata)
  console.log(s)
  return  o.wallet.provider.waitForTransaction(s.hash)

}

//test

//bscrpcurl = "https://bsc-dataseed4.defibit.io/"
//e = get_e(bscrpcurl)
//e._network
//mnemonic = " " 
//addr = " "
//w = towallet(mnemonic, e)
//ss = await sendwaitconfirm({wallet: w, from: w.address, to: addr, amount: 1})

