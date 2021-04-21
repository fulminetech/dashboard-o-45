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
const payloadURL = `${host}:3129/api/payload`;
const batchinfoURL = `${host}:5000/api/batchinfo`;
var statsurl = `${host}:3128/api/machine/stats`
var processedurl = "http://127.0.0.1:5050/api/machine/processed"

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

var batchinfo 

async function batchinfo_() {

    fetch(batchinfoURL)
        .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
        .then(data => {
            batchinfo = data;
            // console.log(batchinfo.rotation)
        })
        .catch(err => {
            console.error("[ MODBUS SERVER OFFLINE ]");
        });
};

var stats

async function stats_() {

    fetch(statsurl)
        .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
        .then(data => {
            stats = data
        })
        .catch(err => {
            console.error("[ MODBUS SERVER OFFLINE ]");
        });
};

var processed 

async function processed_() {

    fetch(processedurl)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
            // Here you get the data to modify as you please
            processed = data
        })
        .catch(function (error) {
            // If there is any error you will catch them here
            console.log("[ PAYLOAD FETCH ERROR ]", error)
        });
};

// Updated with each rotation
var writeHistory = () => {
    flux.write(`${batchinfo.name}.history`)
        .tag({
        })
        .field({
            rotation: batchinfo.rotation,
            p1LHSpre: processed.pLHS_data[0],
            p2LHSpre: processed.pLHS_data[1],
            p3LHSpre: processed.pLHS_data[2],
            p4LHSpre: processed.pLHS_data[3],
            p5LHSpre: processed.pLHS_data[4],
            p6LHSpre: processed.pLHS_data[5],
            p7LHSpre: processed.pLHS_data[6],
            p8LHSpre: processed.pLHS_data[7],
            p9LHSpre: processed.pLHS_data[8],
            p10LHSpre: processed.pLHS_data[9],
            p11LHSpre: processed.pLHS_data[10],
            p12LHSpre: processed.pLHS_data[11],
            p13LHSpre: processed.pLHS_data[12],
            p14LHSpre: processed.pLHS_data[13],
            p15LHSpre: processed.pLHS_data[14],
            p16LHSpre: processed.pLHS_data[15],
            p17LHSpre: processed.pLHS_data[16],
            p18LHSpre: processed.pLHS_data[17],
            p19LHSpre: processed.pLHS_data[18],
            p20LHSpre: processed.pLHS_data[19],
            p21LHSpre: processed.pLHS_data[20],
            p22LHSpre: processed.pLHS_data[21],
            p23LHSpre: processed.pLHS_data[22],
            p24LHSpre: processed.pLHS_data[23],
            p25LHSpre: processed.pLHS_data[24],
            p26LHSpre: processed.pLHS_data[25],
            p27LHSpre: processed.pLHS_data[26],
            p28LHSpre: processed.pLHS_data[27],
            p29LHSpre: processed.pLHS_data[28],
            p30LHSpre: processed.pLHS_data[29],
            p31LHSpre: processed.pLHS_data[30],
            p32LHSpre: processed.pLHS_data[31],
            p33LHSpre: processed.pLHS_data[32],
            p34LHSpre: processed.pLHS_data[33],
            p35LHSpre: processed.pLHS_data[34],
            p36LHSpre: processed.pLHS_data[35],
            p37LHSpre: processed.pLHS_data[36],
            p38LHSpre: processed.pLHS_data[37],
            p39LHSpre: processed.pLHS_data[38],
            p40LHSpre: processed.pLHS_data[39],
            p41LHSpre: processed.pLHS_data[40],
            p42LHSpre: processed.pLHS_data[41],
            p43LHSpre: processed.pLHS_data[42],
            p44LHSpre: processed.pLHS_data[43],
            p45LHSpre: processed.pLHS_data[44],
           

            p1RHSpre: processed.pRHS_data[0],
            p2RHSpre: processed.pRHS_data[1],
            p3RHSpre: processed.pRHS_data[2],
            p4RHSpre: processed.pRHS_data[3],
            p5RHSpre: processed.pRHS_data[4],
            p6RHSpre: processed.pRHS_data[5],
            p7RHSpre: processed.pRHS_data[6],
            p8RHSpre: processed.pRHS_data[7],
            p9RHSpre: processed.pRHS_data[8],
            p10RHSpre: processed.pRHS_data[9],
            p11RHSpre: processed.pRHS_data[10],
            p12RHSpre: processed.pRHS_data[11],
            p13RHSpre: processed.pRHS_data[12],
            p14RHSpre: processed.pRHS_data[13],
            p15RHSpre: processed.pRHS_data[14],
            p16RHSpre: processed.pRHS_data[15],
            p17RHSpre: processed.pRHS_data[16],
            p18RHSpre: processed.pRHS_data[17],
            p19RHSpre: processed.pRHS_data[18],
            p20RHSpre: processed.pRHS_data[19],
            p21RHSpre: processed.pRHS_data[20],
            p22RHSpre: processed.pRHS_data[21],
            p23RHSpre: processed.pRHS_data[22],
            p24RHSpre: processed.pRHS_data[23],
            p25RHSpre: processed.pRHS_data[24],
            p26RHSpre: processed.pRHS_data[25],
            p27RHSpre: processed.pRHS_data[26],
            p28RHSpre: processed.pRHS_data[27],
            p29RHSpre: processed.pRHS_data[28],
            p30RHSpre: processed.pRHS_data[29],
            p31RHSpre: processed.pRHS_data[30],
            p32RHSpre: processed.pRHS_data[31],
            p33RHSpre: processed.pRHS_data[32],
            p34RHSpre: processed.pRHS_data[33],
            p35RHSpre: processed.pRHS_data[34],
            p36RHSpre: processed.pRHS_data[35],
            p37RHSpre: processed.pRHS_data[36],
            p38RHSpre: processed.pRHS_data[37],
            p39RHSpre: processed.pRHS_data[38],
            p40RHSpre: processed.pRHS_data[39],
            p41RHSpre: processed.pRHS_data[40],
            p42RHSpre: processed.pRHS_data[41],
            p43RHSpre: processed.pRHS_data[42],
            p44RHSpre: processed.pRHS_data[43],
            p45RHSpre: processed.pRHS_data[44],

            p1LHSmain: processed.mLHS_data[0],
            p2LHSmain: processed.mLHS_data[1],
            p3LHSmain: processed.mLHS_data[2],
            p4LHSmain: processed.mLHS_data[3],
            p5LHSmain: processed.mLHS_data[4],
            p6LHSmain: processed.mLHS_data[5],
            p7LHSmain: processed.mLHS_data[6],
            p8LHSmain: processed.mLHS_data[7],
            p9LHSmain: processed.mLHS_data[8],
            p10LHSmain: processed.mLHS_data[9],
            p11LHSmain: processed.mLHS_data[10],
            p12LHSmain: processed.mLHS_data[11],
            p13LHSmain: processed.mLHS_data[12],
            p14LHSmain: processed.mLHS_data[13],
            p15LHSmain: processed.mLHS_data[14],
            p16LHSmain: processed.mLHS_data[15],
            p17LHSmain: processed.mLHS_data[16],
            p18LHSmain: processed.mLHS_data[17],
            p19LHSmain: processed.mLHS_data[18],
            p20LHSmain: processed.mLHS_data[19],
            p21LHSmain: processed.mLHS_data[20],
            p22LHSmain: processed.mLHS_data[21],
            p23LHSmain: processed.mLHS_data[22],
            p24LHSmain: processed.mLHS_data[23],
            p25LHSmain: processed.mLHS_data[24],
            p26LHSmain: processed.mLHS_data[25],
            p27LHSmain: processed.mLHS_data[26],
            p28LHSmain: processed.mLHS_data[27],
            p29LHSmain: processed.mLHS_data[28],
            p30LHSmain: processed.mLHS_data[29],
            p31LHSmain: processed.mLHS_data[30],
            p32LHSmain: processed.mLHS_data[31],
            p33LHSmain: processed.mLHS_data[32],
            p34LHSmain: processed.mLHS_data[33],
            p35LHSmain: processed.mLHS_data[34],
            p36LHSmain: processed.mLHS_data[35],
            p37LHSmain: processed.mLHS_data[36],
            p38LHSmain: processed.mLHS_data[37],
            p39LHSmain: processed.mLHS_data[38],
            p40LHSmain: processed.mLHS_data[39],
            p41LHSmain: processed.mLHS_data[40],
            p42LHSmain: processed.mLHS_data[41],
            p43LHSmain: processed.mLHS_data[42],
            p44LHSmain: processed.mLHS_data[43],
            p45LHSmain: processed.mLHS_data[44],

            p1RHSmain: processed.mRHS_data[0],
            p2RHSmain: processed.mRHS_data[1],
            p3RHSmain: processed.mRHS_data[2],
            p4RHSmain: processed.mRHS_data[3],
            p5RHSmain: processed.mRHS_data[4],
            p6RHSmain: processed.mRHS_data[5],
            p7RHSmain: processed.mRHS_data[6],
            p8RHSmain: processed.mRHS_data[7],
            p9RHSmain: processed.mRHS_data[8],
            p10RHSmain: processed.mRHS_data[9],
            p11RHSmain: processed.mRHS_data[10],
            p12RHSmain: processed.mRHS_data[11],
            p13RHSmain: processed.mRHS_data[12],
            p14RHSmain: processed.mRHS_data[13],
            p15RHSmain: processed.mRHS_data[14],
            p16RHSmain: processed.mRHS_data[15],
            p17RHSmain: processed.mRHS_data[16],
            p18RHSmain: processed.mRHS_data[17],
            p19RHSmain: processed.mRHS_data[18],
            p20RHSmain: processed.mRHS_data[19],
            p21RHSmain: processed.mRHS_data[20],
            p22RHSmain: processed.mRHS_data[21],
            p23RHSmain: processed.mRHS_data[22],
            p24RHSmain: processed.mRHS_data[23],
            p25RHSmain: processed.mRHS_data[24],
            p26RHSmain: processed.mRHS_data[25],
            p27RHSmain: processed.mRHS_data[26],
            p28RHSmain: processed.mRHS_data[27],
            p29RHSmain: processed.mRHS_data[28],
            p30RHSmain: processed.mRHS_data[29],
            p31RHSmain: processed.mRHS_data[30],
            p32RHSmain: processed.mRHS_data[31],
            p33RHSmain: processed.mRHS_data[32],
            p34RHSmain: processed.mRHS_data[33],
            p35RHSmain: processed.mRHS_data[34],
            p36RHSmain: processed.mRHS_data[35],
            p37RHSmain: processed.mRHS_data[36],
            p38RHSmain: processed.mRHS_data[37],
            p39RHSmain: processed.mRHS_data[38],
            p40RHSmain: processed.mRHS_data[39],
            p41RHSmain: processed.mRHS_data[40],
            p42RHSmain: processed.mRHS_data[41],
            p43RHSmain: processed.mRHS_data[42],
            p44RHSmain: processed.mRHS_data[43],
            p45RHSmain: processed.mRHS_data[44],
            p45RHSpre: processed.pRHS_data[44],

            p1LHSejn: processed.eLHS_data[0],
            p2LHSejn: processed.eLHS_data[1],
            p3LHSejn: processed.eLHS_data[2],
            p4LHSejn: processed.eLHS_data[3],
            p5LHSejn: processed.eLHS_data[4],
            p6LHSejn: processed.eLHS_data[5],
            p7LHSejn: processed.eLHS_data[6],
            p8LHSejn: processed.eLHS_data[7],
            p9LHSejn: processed.eLHS_data[8],
            p10LHSejn: processed.eLHS_data[9],
            p11LHSejn: processed.eLHS_data[10],
            p12LHSejn: processed.eLHS_data[11],
            p13LHSejn: processed.eLHS_data[12],
            p14LHSejn: processed.eLHS_data[13],
            p15LHSejn: processed.eLHS_data[14],
            p16LHSejn: processed.eLHS_data[15],
            p17LHSejn: processed.eLHS_data[16],
            p18LHSejn: processed.eLHS_data[17],
            p19LHSejn: processed.eLHS_data[18],
            p20LHSejn: processed.eLHS_data[19],
            p21LHSejn: processed.eLHS_data[20],
            p22LHSejn: processed.eLHS_data[21],
            p23LHSejn: processed.eLHS_data[22],
            p24LHSejn: processed.eLHS_data[23],
            p25LHSejn: processed.eLHS_data[24],
            p26LHSejn: processed.eLHS_data[25],
            p27LHSejn: processed.eLHS_data[26],
            p28LHSejn: processed.eLHS_data[27],
            p29LHSejn: processed.eLHS_data[28],
            p30LHSejn: processed.eLHS_data[29],
            p31LHSejn: processed.eLHS_data[30],
            p32LHSejn: processed.eLHS_data[31],
            p33LHSejn: processed.eLHS_data[32],
            p34LHSejn: processed.eLHS_data[33],
            p35LHSejn: processed.eLHS_data[34],
            p36LHSejn: processed.eLHS_data[35],
            p37LHSejn: processed.eLHS_data[36],
            p38LHSejn: processed.eLHS_data[37],
            p39LHSejn: processed.eLHS_data[38],
            p40LHSejn: processed.eLHS_data[39],
            p41LHSejn: processed.eLHS_data[40],
            p42LHSejn: processed.eLHS_data[41],
            p43LHSejn: processed.eLHS_data[42],
            p44LHSejn: processed.eLHS_data[43],
            p45LHSejn: processed.eLHS_data[44],

            p1RHSejn: processed.eRHS_data[0],
            p2RHSejn: processed.eRHS_data[1],
            p3RHSejn: processed.eRHS_data[2],
            p4RHSejn: processed.eRHS_data[3],
            p5RHSejn: processed.eRHS_data[4],
            p6RHSejn: processed.eRHS_data[5],
            p7RHSejn: processed.eRHS_data[6],
            p8RHSejn: processed.eRHS_data[7],
            p9RHSejn: processed.eRHS_data[8],
            p10RHSejn: processed.eRHS_data[9],
            p11RHSejn: processed.eRHS_data[10],
            p12RHSejn: processed.eRHS_data[11],
            p13RHSejn: processed.eRHS_data[12],
            p14RHSejn: processed.eRHS_data[13],
            p15RHSejn: processed.eRHS_data[14],
            p16RHSejn: processed.eRHS_data[15],
            p17RHSejn: processed.eRHS_data[16],
            p18RHSejn: processed.eRHS_data[17],
            p19RHSejn: processed.eRHS_data[18],
            p20RHSejn: processed.eRHS_data[19],
            p21RHSejn: processed.eRHS_data[20],
            p22RHSejn: processed.eRHS_data[21],
            p23RHSejn: processed.eRHS_data[22],
            p24RHSejn: processed.eRHS_data[23],
            p25RHSejn: processed.eRHS_data[24],
            p26RHSejn: processed.eRHS_data[25],
            p27RHSejn: processed.eRHS_data[26],
            p28RHSejn: processed.eRHS_data[27],
            p29RHSejn: processed.eRHS_data[28],
            p30RHSejn: processed.eRHS_data[29],
            p31RHSejn: processed.eRHS_data[30],
            p32RHSejn: processed.eRHS_data[31],
            p33RHSejn: processed.eRHS_data[32],
            p34RHSejn: processed.eRHS_data[33],
            p35RHSejn: processed.eRHS_data[34],
            p36RHSejn: processed.eRHS_data[35],
            p37RHSejn: processed.eRHS_data[36],
            p38RHSejn: processed.eRHS_data[37],
            p39RHSejn: processed.eRHS_data[38],
            p40RHSejn: processed.eRHS_data[39],
            p41RHSejn: processed.eRHS_data[40],
            p42RHSejn: processed.eRHS_data[41],
            p43RHSejn: processed.eRHS_data[42],
            p44RHSejn: processed.eRHS_data[43],
            p45RHSejn: processed.eRHS_data[44],
           
            mode: stats.button.MONO_BI,
            mono_rjn_high: processed.limit[3],
            mono_rjn_low: processed.limit[2],
            mono_force_line: processed.limit[16],

            bi_L_rjn_high: processed.limit[5],
            bi_L_rjn_low: processed.limit[4],
            bi_L_force_line: processed.limit[12],
            bi_R_rjn_high: processed.limit[7],
            bi_R_rjn_low: processed.limit[6],
            bi_R_force_line: processed.limit[15],
        })
        .then(() => console.info(`[ HISTORY WRITE SUCESSFUL ${batchinfo.name} ]`))
        .catch(console.error);
}

// Updated with each rotation
var writeAverage = () => {
    flux.write(`${batchinfo.name}.average`)
        .tag({
        })
        .field({
            rotation: batchinfo.rotation,

            preLHSavg: payload.precompressionLHS_avg,
            mainLHSavg: payload.maincompressionLHS_avg,
            ejnLHSavg: payload.ejectionLHS_avg,
            preRHSavg: payload.precompressionRHS_avg,
            mainRHSavg: payload.maincompressionRHS_avg,
            ejnRHSavg: payload.ejectionRHS_avg,
            turretrpm: stats.stats.turret.RPM,
            dwelltime: stats.stats.dwell,
        })
        .then(() => console.info(`[ AVERAGE WRITE SUCESSFUL ${batchinfo.name} ]`))
        .catch(console.error);
}

module.exports = {
    batchinfo, payload_, batchinfo_, stats_, processed_, writeHistory, writeAverage
}