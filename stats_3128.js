var ModbusRTU = require("modbus-serial");
const express = require("express");
const { exec } = require('child_process');
const restart1Command = "pm2 restart prod-modbus"

const fetch = require('cross-fetch');
const payloadURL = `${host}:5000/api/payload`;

const app = express();
var cors = require('cors')
app.use(cors({ origin: "*" }));

const host = "localhost"

const Influx = require('influxdb-nodejs');
const { setInterval } = require('timers');
const flux = new Influx(`http://${host}:8086/new`);

// Timestamp for which returns current date and time 
var noww = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
console.log('Start:', noww)
var startTime = + new Date();

// Modbus TCP configs
var client = new ModbusRTU();
const slaveID = 1;
// const ip = "10.0.0.103"
const ip = "192.168.0.100"

// Modbus Addresses
const status_address = 2589;
const button_address = 2468;

const time_address = 4196;
const stats_address = 37768;

// Modbus 'state' constants
var MBS_STATE_INIT = "State init";

var MBS_STATE_FAIL_READ_TIME = "Time read failed"
var MBS_STATE_GOOD_READ_TIME = "Time read good"

var MBS_STATE_GOOD_READ_AVG = "State good avg (read)";
var MBS_STATE_GOOD_READ_STATUS = "State good status (read)";
var MBS_STATE_GOOD_READ_STATS = "State good stats (read)";

var MBS_STATE_FAIL_READ_AVG = "State fail avg (read)";
var MBS_STATE_FAIL_READ_STATUS = "State fail status (read)";
var MBS_STATE_FAIL_READ_STATS = "State fail stats (read)";

var MBS_STATE_GOOD_WRITE_STATS = "State good stats (write)";
var MBS_STATE_GOOD_WRITE_STATUS = "State good status (write)";

var MBS_STATE_FAIL_WRITE_STATS = "State fail stats (write)";
var MBS_STATE_FAIL_WRITE_STATUS = "State fail status (write)";

var MBS_STATE_GOOD_CONNECT = "State good (port)";
var MBS_STATE_FAIL_CONNECT = "State fail (port)";

var WRITE_STATUS

var mbsState = MBS_STATE_INIT;

var WRITE_STATS

var mbsTimeout = 5000;
var mbsScan = 50; // Modbus scan time

let readfailed = 0;
let failcounter = 100;

let writefailed = 0;
let failcounter_w = 3;

let timecheck = 3;
let timetemp = 0;

var payload = {
    connection: false,
    batch: "Not set",
    rotation_no: 0,
    present_punch: 0,
    machine: {
        LHS: {
            maincompression_upperlimit: 0,
            maincompression_lowerlimit: 0,
            precompression_upperlimit: 0,
            precompression_lowerlimit: 0,
            ejection_upperlimit: 0,
        },
        RHS: {
            maincompression_upperlimit: 0,
            maincompression_lowerlimit: 0,
            precompression_upperlimit: 0,
            precompression_lowerlimit: 0,
            ejection_upperlimit: 0,
        },
        main_forceline: 0,
        pre_forceline: 0,
        ejn_forceline: 0,
        operator: 'Not Set'
    },
    stats: {
        count: 0,
        tablets_per_hour: 0,
        rpm: 0,
        rpm_amp: 0,
        turretLHS: 0,
        turretLHS_amp: 0,
        turretRHS: 0,
        turretRHS_amp: 0,
        LHSdepth: 0,
        RHSdepth: 0,
        pressure_set: 0,
        pressure_actual: 0,
        lubetime_set: 0,
        lubetime_actual: 0,
        active_punches: 0,
        dwell: 0,
    },
    status: {
        data: []
    }
};


// Make connection
var connectClient = function () {

    // close port (NOTE: important in order not to create multiple connections)
    // client.close();

    // set requests parameters
    client.setID(slaveID);
    client.setTimeout(mbsTimeout);

    // try to connect
    client.connectTCP(ip)
        .then(function () {
            mbsState = MBS_STATE_GOOD_CONNECT;
            console.log(`[ CONNECTED ]`)
        })
        .then(function () {
            runModbus()
        })
        .catch(function (e) {
            mbsState = MBS_STATE_FAIL_CONNECT;
            console.log(`[ FAILED TO CONNECT ]`)
            console.log(e);
        });
}

connectClient()


// Sync Time from PLC
var syncplctime = function () {
    client.readHoldingRegisters(time_address, 6)
        .then(function (plcTime) {
            exec(`sudo timedatectl set-time '20${plcTime.data[2]}-${plcTime.data[1]}-${plcTime.data[0]} ${plcTime.data[3]}:${plcTime.data[4]}:${plcTime.data[5]}'`, (err, stdout, stderr) => {
                console.log(`[ Time updated! ]`)
            })
        })
        .then(function () {
            mbsState = MBS_STATE_GOOD_READ_TIME;
        })
        .catch(function (e) {
            timetemp++
            if (timetemp < timecheck) {
                mbsState = MBS_STATE_GOOD_CONNECT;
                console.log(mbsState)
            } else {
                console.log(mbsState)
                mbsState = MBS_STATE_FAIL_READ_TIME;
            }
        })
}

// Run MODBUS
var runModbus = function () {
    var nextAction;
    switch (mbsState) {
        case MBS_STATE_INIT:
            nextAction = connectClient;
            break;

        case MBS_STATE_GOOD_CONNECT:
            nextAction = syncplctime;
            break;

        case MBS_STATE_GOOD_READ_TIME || MBS_STATE_FAIL_READ_TIME:
            nextAction = readstatus;
            break;

        case MBS_STATE_GOOD_READ_STATUS:
            nextAction = readstats;
            break;

        case MBS_STATE_GOOD_READ_STATS:
            nextAction = readstatus;
            break;

        case MBS_STATE_GOOD_WRITE_STATS || MBS_STATE_FAIL_WRITE_STATS:
            nextAction = readstats;
            break;

        case MBS_STATE_GOOD_WRITE_STATUS || MBS_STATE_FAIL_WRITE_STATUS:
            nextAction = readstatus;
            break;

        case MBS_STATE_FAIL_CONNECT:
            nextAction = connectClient;
            break;

        case WRITE_STATS:
            nextAction = writestats;
            break;

        case WRITE_STATUS:
            nextAction = writestatus;
            break;

        // nothing to do, keep scanning until actionable case
        default:
    }

    // console.log(mbsState);
    // console.log(nextAction);

    // payload.stats.status = "ONLINE";

    if (nextAction !== undefined) {
        nextAction();
    } else {
        readstats();
    }

    // set for next run
    setTimeout(runModbus, mbsScan);
}

runModbus()

var readstatus = function () {
    mbsState = MBS_STATE_GOOD_READ_STATUS;

    client.readCoils(status_address, 45)
        .then(function (punch_status) {
            // console.log("STATUS: ", punch_status.data)
            payload.status.data = punch_status.data[0];

            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            // console.error('[ #6 Status Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
}

var stats_data_;

var processStats = function (stats_data_) {
    var stats_data = {
        data: []
    }

    // console.log(stats_data_)

    stats_data.data = stats_data_

    // Active Punches
    // machine.stats.active_punches = ((active_punches + 1) / 32); // if 0-255
    var active_punches = stats_data.data[0];
    payload.stats.active_punches = active_punches;

    // // Current rotation
    var data_number = stats_data.data[1]; // 32-bit 
    // var data_number_mul = stats_data.data[2]; // Multiplier
    // if (data_number_mul == 0) {
    //     payload.data_number = data_number;
    // }
    // else {
    //     payload.data_number = ((2 ^ 16 * data_number_mul) + data_number);
    // }

    // // // Present Punch
    payload.present_punch = stats_data.data[5];

    // // // Production count
    // // // Formula: [ punch count x rpm x time ]

    var reg1 = stats_data.data[6];
    var reg2 = stats_data.data[7];

    if (reg2 == 0) {
        payload.stats.count = reg1;
    } else {
        payload.stats.count = (((2 ** 16) * reg2) + reg1);
    }

    // // // Tablet per hour [ Max: 8x60x60=28800 ]
    tablets_per_hour = (payload.stats.active_punches * payload.stats.rpm * 60);
    payload.stats.tablets_per_hour = tablets_per_hour;

    payload.stats.rpm = stats_data.data[30];
    payload.stats.turretLHS = stats_data.data[31];
    payload.stats.turretRHS = stats_data.data[32];
    payload.stats.lubetime_set = stats_data.data[33]
    payload.stats.pressure_set = stats_data.data[34] / 10;

    // // Compression Limits
    payload.machine.LHS.precompression_upperlimit = stats_data.data[15] / 100;
    payload.machine.LHS.precompression_lowerlimit = stats_data.data[16] / 100;
    payload.machine.LHS.maincompression_upperlimit = stats_data.data[17] / 100;
    payload.machine.LHS.maincompression_lowerlimit = stats_data.data[18] / 100;
    payload.machine.RHS.precompression_upperlimit = stats_data.data[19] / 100;
    payload.machine.RHS.precompression_lowerlimit = stats_data.data[20] / 100;
    payload.machine.RHS.maincompression_upperlimit = stats_data.data[21] / 100;
    payload.machine.RHS.maincompression_lowerlimit = stats_data.data[22] / 100;
    // payload.machine.LHS.ejection_upperlimit = stats_data.data[19] / 100;
    // payload.machine.RHS.ejection_upperlimit = stats_data.data[19] / 100;

    // payload.machine.main_forceline = stats_data.data[22] / 100;
    // payload.machine.pre_forceline = stats_data.data[23] / 100;
    // payload.machine.ejn_forceline = stats_data.data[24] / 100;
    payload.stats.rpm_amp = stats_data.data[41] / 100;
    payload.stats.turretLHS_amp = stats_data.data[42] / 100;
    payload.stats.turretRHS_amp = stats_data.data[43] / 100;

    payload.stats.LHSdepth = stats_data.data[44] / 10;
    payload.stats.RHSdepth = stats_data.data[45] / 10;
    payload.stats.lubetime_actual = stats_data.data[46] / 10;
    payload.stats.pressure_actual = stats_data.data[47] / 10;

}

var readstats = function () {
    mbsState = MBS_STATE_GOOD_READ_STATS;

    client.readHoldingRegisters(stats_address, 50)
        .then(function (stats_data) {
            // console.log("STATS: ",stats_data.data)
            stats_data_ = stats_data.data
            processStats(stats_data_)
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            // console.error('[ #7 Stats Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
}

var offset_stats;
var set_stats;

var writestats = function () {

    client.writeRegisters(stats_address + offset_stats, [set_stats])
        .then(function (d) {
            console.log(`New value ${set_stats}`);
            mbsState = MBS_STATE_GOOD_WRITE_STATS;
        })
        .catch(function (e) {
            mbsState = MBS_STATE_FAIL_WRITE_STATS;
            console.log(e.message);
        })
}

var offset_status;
var set_status;

var writestatus = function () {

    client.writeCoil(status_address + offset_status, set_status)
        .then(function (d) {
            console.log(`Address ${status_address} set to ${set_status}`, d);
            mbsState = MBS_STATE_GOOD_WRITE_STATUS;
        })
        .catch(function (e) {
            console.log(e.message);
            mbsState = MBS_STATE_FAIL_WRITE_STATUS;
        })
}

var writebutton = function () {

    client.writeCoil(button_address + offset_status, set_status)
        .then(function (d) {
            console.log(`Address ${status_address} set to ${set_status}`, d);
            mbsState = MBS_STATE_GOOD_WRITE_STATUS;
        })
        .catch(function (e) {
            console.log(e.message);
            mbsState = MBS_STATE_FAIL_WRITE_STATUS;
        })
}

function restartprodmodbus() {
    exec(restart1Command, (err, stdout, stderr) => {
        // handle err if you like!
        console.log(`[ RESTARTING: prod-modbus ]`);
        console.log(`${stdout}`);
    });
}

app.use("/api/machine/stats", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json(payload);
});

app.get("/api/set/limit/:parameter/:value", (req, res) => {
    const a = req.params.parameter;
    const b = req.params.value;
    var c;
    var payload1

    fetch(payloadURL)
        .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
        .then(data => {
            payload1 = data;
        })
        .catch(err => {
            console.error("[ MODBUS SERVER OFFLINE ]");
        });

    writelog = () => {
        flux.write(`operationlogs`)
            .tag({
            })
            .field({
                batch: payload1.batch,  // 2
                operator: payload1.machine.operator_name,  // 2
                parameter: a,  // 2
                oldvalue: c,  // 2
                newvalue: b,  // 2
            })
            .then(() => console.info('[ LOG ENTRY DONE ]'))
            .catch(console.error);
    }

    if (a == "preLHSup") {
        offset_stats = 15
        set_stats = b
        c = payload.machine.LHS.precompression_upperlimit
        payload.machine.LHS.precompression_upperlimit = b;
        writelog()
    } else if (a == "preLHSlow") {
        offset_stats = 16
        set_stats = b
        c = payload.machine.LHS.precompression_lowerlimit
        payload.machine.LHS.precompression_lowerlimit = b;
        writelog()
    } else if (a == "mainLHSup") {
        offset_stats = 17
        set_stats = b
        c = payload.machine.LHS.maincompression_upperlimit
        payload.machine.LHS.maincompression_upperlimit = b;
        writelog()
    } else if (a == "mainLHSlow") {
        offset_stats = 18
        set_stats = b
        c = payload.machine.LHS.maincompression_lowerlimit
        payload.machine.LHS.maincompression_lowerlimit = b;
        writelog()
    } else if (a == "preRHSup") {
        offset_stats = 19
        set_stats = b
        c = payload.machine.RHS.precompression_upperlimit
        payload.machine.RHS.precompression_upperlimit = b;
        writelog()
    } else if (a == "preRHSlow") {
        offset_stats = 20
        set_stats = b
        c = payload.machine.RHS.precompression_lowerlimit
        payload.machine.RHS.precompression_lowerlimit = b;
        writelog()
    } else if (a == "mainRHSup") {
        offset_stats = 21
        set_stats = b
        c = payload.machine.RHS.maincompression_upperlimit
        payload.machine.RHS.maincompression_upperlimit = b;
        writelog()
    } else if (a == "mainRHSlow") {
        offset_stats = 22
        set_stats = b
        c = payload.machine.RHS.maincompression_lowerlimit
        payload.machine.RHS.maincompression_lowerlimit = b;
        writelog()
    }

    mbsState = WRITE_STATS;

    res.header('Access-Control-Allow-Origin', '*');
    return res.json({ message: `[ UPDATED ${a} to ${b} ]` });
});


app.get("/api/set/status/:punch/:value", (req, res) => {
    const a = parseInt(req.params.punch);
    const b = req.params.value;

    offset_status = a - 1;
    if (b == 'true') {
        set_status = Boolean(true)
    } else if (b == 'false') {
        set_status = Boolean(false)
    }

    writestatus()

    res.header('Access-Control-Allow-Origin', '*');
    return res.json({ message: `[ UPDATED ${a} to ${b} ]` });
});


app.get("/api/set/:parameter/:value", (req, res) => {
    const a = req.params.parameter;
    const b = req.params.value;
    var c;
    var payload1

    fetch(payloadURL)
        .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
        .then(data => {
            payload1 = data;
        })
        .catch(err => {
            console.error("[ MODBUS SERVER OFFLINE ]");
        });

    writelog = () => {
        flux.write(`operationlogs`)
            .tag({
            })
            .field({
                batch: payload1.batch,  // 2
                operator: payload1.machine.operator_name,  // 2
                parameter: a,  // 2
                oldvalue: c,  // 2
                newvalue: b,  // 2
            })
            .then(() => console.info('[ LOG ENTRY DONE ]'))
            .catch(console.error);
    }

    if (a == "rpm") {
        offset_stats = 30
        set_stats = b
        c = payload.stats.rpm
        payload.stats.rpm = b;
        writestats()
        writelog()
    } else if (a == "feederLHS") {
        offset_stats = 31
        set_stats = b
        c = payload.stats.turretLHS
        payload.stats.turretLHS = b;
        writestats()
        writelog()
    } else if (a == "feederRHS") {
        offset_stats = 32
        set_stats = b
        c = payload.stats.turretRHS
        payload.stats.turretRHS = b;
        writestats()
        writelog()
    }
    else if (a == "pressure") {
        offset_stats = 34
        set_stats = b,
            c = payload.stats.pressure_set
        payload.stats.pressure_set = b;
        writestats()
        writelog()
    }
    else if (a == "lubetime") {
        offset_stats = 33
        set_stats = b
        c = payload.stats.lubetime_set
        payload.stats.lubetime_set = b;
        writestats()
        writelog()
    }
    else if (a == "machine" && b == "start") {
        offset_status = 15
        set_status = true
        writebutton()
        writelog()
        // payload.stats.lubetime_set = b;
    }
    else if (a == "machine" && b == "stop") {
        offset_status = 16
        set_status = false
        writebutton()
        writelog()
    }
    else if (a == "machine" && b == "inch") {
        offset_status = 10
        set_status = true // Toggle
        writebutton()
        // writelog()
    }
    else if (a == "powerpack" && b == "start") {
        offset_status = 0
        set_status = true
        writebutton()
        writelog()
    }
    else if (a == "powerpack" && b == "stop") {
        offset_status = 1
        set_status = false
        writebutton()
        writelog()
    }
    else if (a == "powerpack" && b == "drain") {
        offset_status = 3
        set_status = true // Toggle
        writebutton()
        writelog()
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json({ message: `[ UPDATED ${a} to ${b} ]` });
});

// Start Server
const port = 3128;
app.listen(port, () => console.log(`Server running on port ${port} 👑`));