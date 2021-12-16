(async function() {

const fetch = await import("fetch-json")
const {exec} = require("child_process")
//sound file, vlc media player installed on laptop
sound = "vlc a.mp3"
//default args for temporary easy 
//cmd usage "amountintoken1,amountoutminimumforprofittoken2 amountintoken3,amountoutminimumforprofittoken4"
in1 = "123,2.8"
in2 = "2,400"

//123,2.8 2,400
args = process.argv.slice(2);
if(args.length == 0) {
args.push(in1);
args.push(in2);
}
// parse args to array [[pair1], [pair2]] 
//: [[amountin1, amount2outminforprofit], [...]]
args = args.map(v=> v.split(",").map (f => Number.parseFloat(f)))
console.log(args)

l = new Array(18)
l.fill(0)
//ethereum uses wei units,  has 18 decimals
zeroes18 = l.join("")

var input = args[0][0] + zeroes18
//hardcodedtoken address for now
//random for now, rendoge/upi:
token1 = "0x3832d2F059E55934220881F831bE501D180671A7"
token2 = "0x70D2b7C19352bB76e4409858FF5746e500f2B67c"

url1= `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${token1}&toTokenAddress=${token2}&amount=${input}`
args[0].push(url1)
//other direction, hardcoded for nnow
var input2 = args[1][0] + zeroes18
url2 = `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${token2}&toTokenAddress=${token1}&amount=${input2}`
args[1].push(url2)
const timer = ms=> new Promise ( res => setTimeout(res, ms) );
i = 0;


async function fetchurl(a, gt) {
var d = ""
try {
 d = await fetch.fetchJson.get(a)
out = d.toTokenAmount
out2 = Number.parseInt(out)
out2 = out2 * 1e-18
console.log(out2)
return out2
} catch(e) { console.log(e); console.log (d); }
return -1
}
var i = 0
while (++i) {
var d = 0;

arg = args[i % 2]
console.log(`fetching ${arg[0]}, gt ${arg[1]}, url ${arg[2]}`)

d = await fetchurl(arg[2], arg[1])
if(d > arg[1]) {
  console.log("alarm: d:  " + d)
  
 exec(sound);
 await timer(1000000);
}
await timer (1500);

}

})()
