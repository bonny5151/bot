var erc20abi = require(uni2abi + "IERC20.json").abi


var getbalance = async function getbalance(ercaddress, walletaddress, web3js=w3, decimals=18) {

   return new web3js.eth.Contract(erc20abi, ercaddress).methods.balanceOf(
                walletaddress).call().then(
                 (v=>rz(v,decimals)),(v=> {console.log(v); return ""; })  )
 }

module.exports = {
 erc20abi: erc20abi,
 getbalance: getbalance

}


