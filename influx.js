// Include Library
const fetch = require('cross-fetch');
const { exec } = require('child_process');
// const CronJob = require('cron').CronJob;

var host = "http://localhost";

const Influx = require('influxdb-nodejs');
const { setInterval } = require('timers');
const flux = new Influx(`${host}:8086/new`);

// Timestamp for which returns current date and time
function date() {
    return new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
}

var i = 0

var noww = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
console.log(`[ STARTING INFLUX : ${noww} ]`)

var payload

async function payload_() {

    fetch(payloadURL)
        .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
        .then(data => {
            payload = data;
            // console.log(batchinfo.name)
        })
        .catch(err => {
            console.error("[ MODBUS SERVER OFFLINE ]");
        });
};




// module.exports = {
//     batchinfo, payload_, batchinfo_, stats_, processed_, writeHistory, writeAverage
// }