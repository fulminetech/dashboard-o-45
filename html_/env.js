// Environment Variable
// var ip = "10.0.0.71"
// var ip = "10.0.0.198"
// var ip = "192.168.0.2"

// Modbus Set URL

// Python servers 
// 1. raw:
var rawurl = "http://127.0.0.1:5000/api/machine/raw";

// 2. processed:
var processedurl = "http://127.0.0.1:5050/api/machine/processed";

// Node servers
var ip = "localhost"

// 1. compression 
var rawpayload = `http://${ip}:3129/api/payload`

// 2. stats (settings)
var statsurl = `http://${ip}:3128/api/machine/stats`
var seturl = `http://${ip}:3128/set`
var controlurl = `http://${ip}:3128/set/limit`
var statusurl = `http://${ip}:3128/set/status`

// 3. index
var hostname = `http://${ip}:5000`

var payloadURL = `${hostname}/api/payload`;
const batchURL = `${hostname}/api/search/batch`;
const searchAvgURL = `${hostname}/api/search/average/`
const reportdetailsURL = `${hostname}/report/average/now`
const reportAvgURL = `${hostname}/report/average`
const reportAvgGenURL = `${hostname}/report/average/generate`

const searchURL = `${hostname}/api/search/rotation/`
const restartURL = `${hostname}/restart/pm2-0`

const logsURL = `${hostname}/api/search/logs/`

// 4. data


// compression


// Reports


