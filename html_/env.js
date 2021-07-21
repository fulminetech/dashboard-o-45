// Environment Variable
// var ip = "10.0.0.71"
// var ip = "10.0.0.198"
// var ip = "192.168.0.2"

// Modbus Set URL

// Python servers 
// 1. raw:
var rawurl = "http://127.0.0.1:5001/api/machine/raw";

// 2. processed:
var processedurl = "http://127.0.0.1:5050/api/machine/processed";

// Node servers
var ip = "localhost"
// var ip = "192.168.0.132"

// 1. compression 
var rawpayload = `http://${ip}:3129/api/payload`

// 2. stats (settings)
var statsurl = `http://${ip}:3128/api/machine/stats`
var seturl = `http://${ip}:3128/api/set`
var punchseturl = `http://${ip}:3128/api/set/status`
var controlurl = `http://${ip}:3128/set/limit`
var statusurl = `http://${ip}:3128/set/status`

// 3. index
var hostname = `http://${ip}:5000`

var payloadURL = `${hostname}/api/payload`;
// var restartURL = `${hostname}/restart`;
var batchinfoURL = `${hostname}/api/batchinfo`;
const dbsearchURL = `${hostname}/api/search`;
const dbsearchcsvURL = `${hostname}/api/search/csv`;
const batchURL = `${hostname}/api/search/batch`;
const searchAvgURL = `${hostname}/api/search/average/`
const reportdetailsURL = `${hostname}/report/average/now`
const userlevelURL = `${hostname}/checkuserlevel`
const adduserURL = `${hostname}/adduser`
const userlistURL = `${hostname}/api/userlist`
const usersearchURL = `${hostname}/api/usersearch`
const reportAvgURL = `${hostname}/report/average`
const reportAvgGenURL = `${hostname}/report/average/generate`
const reportAvgGraphGenURL = `${hostname}/report/averagegraph/generate`
const reportAlarmGenURL = `${hostname}/report/alarm/generate`
const reportAuditGenURL = `${hostname}/report/audit/generate`
const reportpreLHSGenURL = `${hostname}/report/preLHS/generate`
const reportpreRHSGenURL = `${hostname}/report/preRHS/generate`
const reportmainLHSGenURL = `${hostname}/report/mainLHS/generate`
const reportmainRHSGenURL = `${hostname}/report/mainRHS/generate`
const reportejnLHSGenURL = `${hostname}/report/ejnLHS/generate`
const reportejnRHSGenURL = `${hostname}/report/ejnRHS/generate`
const reportRecipeGenURL = `${hostname}/report/recipe/generate`
const reportRecipeSingleGenURL = `${hostname}/report/recipe_single/generate`

const reportcsvURL = `${hostname}/api/csv`

const searchURL = `${hostname}/api/search/rotation/`
const restartURL = `${hostname}/restart`

const logsURL = `${hostname}/api/search/logs/`

// 4. data
var opbatch
const oplogs = `http://localhost:8086/query?pretty=true&db=new&q=select%20*%20from%20%22operationlogs%22%20where%20%22batch%22%20=%20%27${opbatch}%27`


// compression


// Reports


