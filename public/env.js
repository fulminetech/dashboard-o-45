// Environment Variable
var hostname = "http://192.168.0.2:5000"

// APIs

var payloadURL = `${hostname}/api/payload`;

const batchURL = `${hostname}/api/search/batch`;
const searchAvgURL = `${hostname}/api/search/average/`
const reportdetailsURL = `${hostname}/report/average/now`
const reportAvgURL = `${hostname}/report/average`
const reportAvgGenURL = `${hostname}/report/average/generate`

const searchURL = `${hostname}/api/search/rotation/`
const restartURL = `${hostname}/restart/pm2-0`

const logsURL = `${hostname}/api/search/logs/`

// Modbus Set URL
var seturl = `http://192.168.0.2:3128/set`
var controlurl = `http://192.168.0.2:3128/set/limit`
var statusurl = `http://192.168.0.2:3128/set/status`