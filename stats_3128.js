var ModbusRTU = require("modbus-serial");
const express = require("express");
const { exec } = require('child_process');
const restart1Command = "pm2 restart prod-modbus"

const host = "localhost"

const fetch = require('cross-fetch'); // To get operator and batch details for logging
const payloadURL = `${host}:5000/api/payload`;

const app = express();
var cors = require('cors')
app.use(cors({ origin: "*" }));


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
const status_address = 540;
const button_address = 400;

const time_address = 100;
const stats_address = 5200;
const stats_read_address = 5000;

// Modbus 'state' constants
var MBS_STATE_INIT = "State init";

var MBS_STATE_FAIL_READ_TIME = "Time read failed"
var MBS_STATE_GOOD_READ_TIME = "Time read good"

var MBS_STATE_GOOD_READ_STATUS = "State good status (read)";
var MBS_STATE_GOOD_READ_STATS = "State good stats (read)";

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
var mbsScan = 500; // Modbus scan time

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
    production: 0,
    machine: {
        LHS: {
            precompression_upperlimit: 0,
            precompression_lowerlimit: 0,
            maincompression_upperlimit: 0,
            maincompression_lowerlimit: 0,
            ejection_upperlimit: 0,
            ejection_lowerlimit: 0,
            main_forceline: 0,
            pre_forceline: 0,
            ejn_forceline: 0,
            precompression_max: 0,
            maincompression_max: 0,
            ejection_max: 0,
        },
        RHS: {
            maincompression_upperlimit: 0,
            maincompression_lowerlimit: 0,
            precompression_upperlimit: 0,
            precompression_lowerlimit: 0,
            ejection_upperlimit: 0,
            ejection_lowerlimit: 0,
            main_forceline: 0,
            pre_forceline: 0,
            ejn_forceline: 0,
            precompression_max: 0,
            maincompression_max: 0,
            ejection_max: 0,
        },
        operator: 'Not Set'
    },
    stats: {
        count: 0,
        tablets_per_hour: 0,
        fault_active_flash: 0,
        turret: {
            F: 0,
            H: 0,
            A: 0,
            RPM: 0,
            max_rpm: 0,
            max_freq: 0,
        },
        FF_MODE: 0,
        LHS_FF: {
            F: 0,
            H: 0,
            A: 0,
            RPM: 0,
            max_rpm: 0,
            max_freq: 0,
        },
        RHS_FF: {
            F: 0,
            H: 0,
            A: 0,
            RPM: 0,
            max_rpm: 0,
            max_freq: 0,
        },
        pressure: {
            value: 0,
            pressure_set: 0,
            pressure_actual: 0,
        },
        hydraulic: {
            max_pressure: 0,
            high_cutoff: 0,
            low_cutoff: 0,
        },
        lubrication: {
            set_delay_min: 0,
            set_delay_sec: 0,
            actual_time: 0,
            remaining_time: 0
        },
        LHSdepth: {
            value: 0,
            analog_max: 0,
            analog_min: 0,
            depth_max: 0,
            depth_min: 0,
        },
        RHSdepth: {
            value: 0,
            analog_max: 0,
            analog_min: 0,
            depth_max: 0,
            depth_min: 0,
        },
        LHSweight: {
            value: 0,
            analog_max: 0,
            analog_min: 0,
            weight_max: 0,
            weight_min: 0,
        },
        RHSweight: {
            value: 0,
            analog_max: 0,
            analog_min: 0,
            weight_max: 0,
            weight_min: 0,
        },
        LHSthickness: {
            value: 0,
            analog_max: 0,
            analog_min: 0,
            thickness_max: 0,
            thickness_min: 0,
        },
        RHSthickness: {
            value: 0,
            analog_max: 0,
            analog_min: 0,
            thickness_max: 0,
            thickness_min: 0,
        },
        active_punches: 0,
        dwell: 0,
        B_HEAD: 0,
        B_PCD: 0,
        D_HEAD: 0,
        D_PCD: 0,
        total_punches: 0,
        encoder_PPR: 0,
        punch_offset_position: {
            L_PRE: 0,
            L_MAIN: 0,
            L_EJN: 0,
            R_PRE: 0,
            R_MAIN: 0,
            R_EJN: 0,
        },
        punch_present_position: {
            L_PRE: 0,
            L_MAIN: 0,
            L_EJN: 0,
            R_PRE: 0,
            R_MAIN: 0,
            R_EJN: 0,
        }
    },
    button: {
        FORCE_MEASUREMENT_ENABLE_BUTTON: '',
        GRAVITY_MODE: '',
        FORCE_MODE: '',
        POWER_PACK_START_BUTTON: '',
        POWER_PACK_STOP_BUTTON: '',
        PRESSURE_ACK_BUTTON: '',
        DRAIN_BUTTON: '',
        MACHINE_INCHING_BUTTON: '',
        MACHINE_START_BUTTON: '',
        MACHINE_STOP_BUTTON: '',
        FORCE_FEEDER_START_BUTTON: '',
        FORCE_FEEDER_STOP_BUTTON: '',
        TABLET_COUNT_RESET    : '',
        TURRET_RUN_BUTTON_HMI: '',
        LHS_FORCE_FEEDER_BUTTON_HMI: '',
        RHS_FORCE_FEEDER_BUTTON_HMI: '',
        LUBRICATION_PUMP_BUTTON_HMI: '',
        POWER_PACK_BUTTON_HMI: '',
        DRAIN_BUTTON_HMI: '',
        REJECTION_BUTTON_HMI: '',
        FAN_BUTTON_HMI: '',
        GUARD_OPEN: '',
        LUBRICATION_OIL_LOW: '',
        LHS_POWDER_LOW: '',
        RHS_POWDER_LOW: '',
        PRESSURE_OVER_LIMIT: '',
        SYSTEM_OVERLOAD: '',
        EMERGENCY_STOP: '',
        MAIN_MOTOR_TRIPPED: '',
        RHS_FORCE_FEEDER_TRIPPED: '',
        RHS_FORCE_FEEDER_TRIPPED: '',
        POWER_PACK_TRIPPED: '',
        LUBRICATION_OIL_LOW_LEVEL: '',
        LHS_MAIN_OVER_LIMIT: '',
        LHS_MAIN_UNDER_LIMIT: '',
        RHS_MAIN_OVER_LIMIT: '',
        RHS_MAIN_UNDER_LIMIT: '',
        SYSTEM_OVERLOAD: '',
        SAFETY_GUARD_OPEN: '',
        PRESSURE_OVER_LIMIT: '',
        LHS_POWDER_LOW: '',
        RHS_POWDER_LOW: '',
        LUBRICATION_PUMP_FAILS: '',
        DIRECT__RAMP: '',
        WITH_DOOR__BYPASS: '',
        FORCE_MEASUREMENT_ENABLE_BUTTON: '',
        B_TYPE__D_TYPE: '',
        POWDER_SENSOR_ENABLE: '',
        Z_PHASE_SELECTION: '',
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

var readstats = function () {
    mbsState = MBS_STATE_GOOD_READ_STATS;

    client.readHoldingRegisters(stats_address, 100)
        .then(function (stats_data) {
            // console.log("STATS: ",stats_data.data)
            // New stats! 
            payload.stats.turret.RPM = stats_data.data[0],
            payload.stats.LHS_FF.RPM = stats_data.data[1],
            payload.stats.RHS_FF.RPM = stats_data.data[2],
            payload.stats.FF_MODE = stats_data.data[3],
            payload.stats.lubrication.set_delay_min = stats_data.data[4],
            payload.stats.lubrication.set_delay_sec = stats_data.data[5],
            payload.stats.pressure_set = stats_data.data[6] / 10,
            payload.stats.hydraulic.high_cutoff = stats_data.data[7]
            payload.stats.hydraulic.low_cutoff = stats_data.data[8]

            // // Compression Limits
            payload.machine.LHS.precompression_upperlimit = stats_data.data[10] / 100;
            payload.machine.LHS.precompression_lowerlimit = stats_data.data[11] / 100;
            payload.machine.LHS.maincompression_upperlimit = stats_data.data[12] / 100;
            payload.machine.LHS.maincompression_lowerlimit = stats_data.data[13] / 100;
            payload.machine.LHS.ejection_upperlimit = stats_data.data[14] / 100;
            payload.machine.LHS.ejection_lowerlimit = stats_data.data[15] / 100;

            payload.machine.RHS.precompression_upperlimit = stats_data.data[16] / 100;
            payload.machine.RHS.precompression_lowerlimit = stats_data.data[17] / 100;
            payload.machine.RHS.maincompression_upperlimit = stats_data.data[18] / 100;
            payload.machine.RHS.maincompression_lowerlimit = stats_data.data[19] / 100;
            payload.machine.RHS.ejection_upperlimit = stats_data.data[20] / 100;
            payload.machine.RHS.ejection_lowerlimit = stats_data.data[21] / 100;

            payload.machine.LHS.pre_forceline = stats_data.data[22] / 100;
            payload.machine.LHS.main_forceline = stats_data.data[23] / 100;
            payload.machine.LHS.ejn_forceline = stats_data.data[24] / 100;

            payload.machine.RHS.pre_forceline = stats_data.data[25] / 100;
            payload.machine.RHS.main_forceline = stats_data.data[26] / 100;
            payload.machine.RHS.ejn_forceline = stats_data.data[27] / 100;

            payload.machine.LHS.precompression_max = stats_data.data[28] / 100;
            payload.machine.LHS.maincompression_max = stats_data.data[29] / 100;
            payload.machine.LHS.ejection_max = stats_data.data[30] / 100;

            payload.machine.RHS.precompression_max = stats_data.data[31] / 100;
            payload.machine.RHS.maincompression_max = stats_data.data[32] / 100;
            payload.machine.RHS.ejection_max = stats_data.data[33] / 100;

            payload.stats.B_HEAD = stats_data.data[36] / 100;
            payload.stats.B_PCD = stats_data.data[38] / 100;
            payload.stats.D_HEAD = stats_data.data[40] / 100;
            payload.stats.D_PCD = stats_data.data[42] / 100;

            payload.stats.total_punches = stats_data.data[48] / 100;

            payload.stats.LHSdepth.analog_max = stats_data.data[53] / 100;
            payload.stats.LHSdepth.analog_min = stats_data.data[54] / 100;
            payload.stats.LHSdepth.depth_max = stats_data.data[55] / 100;
            payload.stats.LHSdepth.depth_min = stats_data.data[56] / 100;
            payload.stats.RHSdepth.analog_max = stats_data.data[57] / 100;
            payload.stats.RHSdepth.analog_min = stats_data.data[58] / 100;
            payload.stats.RHSdepth.depth_max = stats_data.data[59] / 100;
            payload.stats.RHSdepth.depth_min = stats_data.data[60] / 100;

            payload.stats.LHSweight.analog_max = stats_data.data[61] / 100;
            payload.stats.LHSweight.analog_min = stats_data.data[62] / 100;
            payload.stats.LHSweight.weight_max = stats_data.data[63] / 100;
            payload.stats.LHSweight.weight_min = stats_data.data[64] / 100;
            payload.stats.RHSweight.analog_max = stats_data.data[65] / 100;
            payload.stats.RHSweight.analog_min = stats_data.data[66] / 100;
            payload.stats.RHSweight.weight_max = stats_data.data[67] / 100;
            payload.stats.RHSweight.weight_min = stats_data.data[68] / 100;

            payload.stats.LHSthickness.analog_max = stats_data.data[69] / 100;
            payload.stats.LHSthickness.analog_min = stats_data.data[70] / 100;
            payload.stats.LHSthickness.thickness_max = stats_data.data[71] / 100;
            payload.stats.LHSthickness.thickness_min = stats_data.data[72] / 100;
            payload.stats.RHSthickness.analog_max = stats_data.data[73] / 100;
            payload.stats.RHSthickness.analog_min = stats_data.data[74] / 100;
            payload.stats.RHSthickness.thickness_max = stats_data.data[75] / 100;
            payload.stats.RHSthickness.thickness_min = stats_data.data[76] / 100;

            payload.stats.turret.max_rpm = stats_data.data[80]
            payload.stats.turret.max_freq = stats_data.data[81]
            payload.stats.LHS_FF.max_rpm = stats_data.data[82]
            payload.stats.LHS_FF.max_freq = stats_data.data[83]
            payload.stats.RHS_FF.max_rpm = stats_data.data[84]
            payload.stats.RHS_FF.max_freq = dstats_data.ata[85]

            payload.stats.hydraulic.max_pressure = stats_data.data[86]
            payload.stats.encoder_PPR = stats_data.data[88]

            payload.stats.punch_offset_position.L_PRE = stats_data.data[90]
            payload.stats.punch_offset_position.L_MAIN = stats_data.data[91]
            payload.stats.punch_offset_position.L_EJN = stats_data.data[92]
            payload.stats.punch_offset_position.R_PRE = stats_data.data[93]
            payload.stats.punch_offset_position.R_MAIN = stats_data.data[94]
            payload.stats.punch_offset_position.R_EJN = stats_data.data[95]

            // payload.present_punch = stats_data.data[5];
            // // // // Production count
            // // // // Formula: [ punch count x rpm x time ]

            // var reg1 = stats_data.data[6];
            // var reg2 = stats_data.data[7];

            // if (reg2 == 0) {
            //     payload.stats.count = reg1;
            // } else {
            //     payload.stats.count = (((2 ** 16) * reg2) + reg1);
            // }
            
            // // // // Tablet per hour [ Max: 8x60x60=28800 ]
            // tablets_per_hour = (payload.stats.active_punches * payload.stats.turret.RPM * 60);
            // payload.stats.tablets_per_hour = tablets_per_hour;

            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            // console.error('[ #7 Stats Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
    
    setTimeout(() => {
        mbsState = MBS_STATE_GOOD_READ_STATS;

        client.readHoldingRegisters(stats_read_address, 41)
            .then(function (stats_data) {
                // console.log("STATS: ",stats_data.data)
                payload.stats.turret.F = stats_data.data[0]
                payload.stats.turret.H = stats_data.data[1]
                payload.stats.turret.A = stats_data.data[2]
                payload.stats.LHS_FF.F = stats_data.data[3]
                payload.stats.LHS_FF.H = stats_data.data[4]
                payload.stats.LHS_FF.A = stats_data.data[5]
                payload.stats.RHS_FF.F = stats_data.data[6]
                payload.stats.RHS_FF.H = stats_data.data[7]
                payload.stats.RHS_FF.A = stats_data.data[8]

                payload.production = stats_data.data[10]
                payload.stats.tablets_per_hour = stats_data.data[14]
                payload.stats.punch_present_position.L_PRE = stats_data.data[20]
                payload.stats.punch_present_position.L_MAIN = stats_data.data[21]
                payload.stats.punch_present_position.L_EJN = stats_data.data[22]
                payload.stats.punch_present_position.R_PRE = stats_data.data[23]
                payload.stats.punch_present_position.R_MAIN = stats_data.data[24]
                payload.stats.punch_present_position.R_EJN = stats_data.data[25]

                payload.stats.active_punches = stats_data.data[26]
                payload.stats.fault_active_flash = stats_data.data[27]
                payload.stats.LHSdepth.value = stats_data.data[28]
                payload.stats.RHSdepth.value = stats_data.data[29]
                payload.stats.LHSweight.value = stats_data.data[30]
                payload.stats.RHSweight.value = stats_data.data[31]
                payload.stats.LHSthickness.value = stats_data.data[32]
                payload.stats.RHSthickness.value = stats_data.data[34]
                
                payload.stats.pressure.value = stats_data.data[35]
                payload.stats.lubrication.remaining_time = stats_data.data[36]
                payload.stats.dwell = stats_data.data[40]

                // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
            })
            .catch(function (e) {
                // console.error('[ #7 Stats Garbage ]')
                readfailed++;
                // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
            })
        
    }, 30);   
    mbsState = MBS_STATE_GOOD_READ_STATS;

    client.readHoldingRegisters(stats_read_address, 40)
        .then(function (stats_data) {
            // console.log("STATS: ",stats_data.data)
            payload.stats.turret.F = stats_data.data[0]
            payload.stats.turret.H = stats_data.data[1]
            payload.stats.turret.A = stats_data.data[2]
            payload.stats.LHS_FF.F = stats_data.data[3]
            payload.stats.LHS_FF.H = stats_data.data[4]
            payload.stats.LHS_FF.A = stats_data.data[5]
            payload.stats.RHS_FF.F = stats_data.data[6]
            payload.stats.RHS_FF.H = stats_data.data[7]
            payload.stats.RHS_FF.A = stats_data.data[8]

            payload.production = stats_data.data[10]
            payload.stats.tablets_per_hour = stats_data.data[14]
            payload.stats.punch_present_position.L_PRE = stats_data.data[20]
            payload.stats.punch_present_position.L_MAIN = stats_data.data[21]
            payload.stats.punch_present_position.L_EJN = stats_data.data[22]
            payload.stats.punch_present_position.R_PRE = stats_data.data[23]
            payload.stats.punch_present_position.R_MAIN = stats_data.data[24]
            payload.stats.punch_present_position.R_EJN = stats_data.data[25]

            payload.stats.active_punches = stats_data.data[26]
            payload.stats.fault_active_flash = stats_data.data[27]
            payload.stats.LHSdepth.value = stats_data.data[28]
            payload.stats.RHSdepth.value = stats_data.data[29]
            payload.stats.LHSweight.value = stats_data.data[30]
            payload.stats.RHSweight.value = stats_data.data[31]
            payload.stats.LHSthickness.value = stats_data.data[32]
            payload.stats.RHSthickness.value = stats_data.data[34]

            payload.stats.pressure.value = stats_data.data[35]
            payload.stats.lubrication.remaining_time = stats_data.data[36]
            payload.stats.dwell = stats_data.data[40]

            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            // console.error('[ #7 Stats Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })


}

var readbutton = function () {
    mbsState = MBS_STATE_GOOD_READ_STATS;

    client.readCoils(button_address, 100)
        .then(function (stats_data) {
            // console.log("STATS: ",stats_data.data)
            payload.button.GRAVITY_MODE = stats_data.data[0],
            payload.button.FORCE_MODE = stats_data.data[1],
            payload.button.POWER_PACK_START_BUTTON = stats_data.data[10],
            payload.button.POWER_PACK_STOP_BUTTON = stats_data.data[11],
            payload.button.PRESSURE_ACK_BUTTON = stats_data.data[12],
            payload.button.DRAIN_BUTTON = stats_data.data[14],
            payload.button.MACHINE_INCHING_BUTTON = stats_data.data[20],
            payload.button.MACHINE_START_BUTTON = stats_data.data[25],
            payload.button.MACHINE_STOP_BUTTON = stats_data.data[26],
            payload.button.FORCE_FEEDER_START_BUTTON = stats_data.data[28],
            payload.button.FORCE_FEEDER_STOP_BUTTON = stats_data.data[29],
            payload.button.TABLET_COUNT_RESET = stats_data.data[30],
            payload.button.TURRET_RUN_BUTTON_HMI = stats_data.data[50],
            payload.button.LHS_FORCE_FEEDER_BUTTON_HMI = stats_data.data[51],
            payload.button.RHS_FORCE_FEEDER_BUTTON_HMI = stats_data.data[52],
            payload.button.LUBRICATION_PUMP_BUTTON_HMI = stats_data.data[53],
            payload.button.POWER_PACK_BUTTON_HMI = stats_data.data[54],
            payload.button.DRAIN_BUTTON_HMI = stats_data.data[55],
            payload.button.REJECTION_BUTTON_HMI = stats_data.data[56],
            payload.button.FAN_BUTTON_HMI = stats_data.data[57],
            payload.button.GUARD_OPEN = stats_data.data[60],
            payload.button.LUBRICATION_OIL_LOW = stats_data.data[61],
            payload.button.LHS_POWDER_LOW = stats_data.data[62],
            payload.button.RHS_POWDER_LOW = stats_data.data[63],
            payload.button.PRESSURE_OVER_LIMIT = stats_data.data[64],
            payload.button.SYSTEM_OVERLOAD = stats_data.data[65],
            payload.button.EMERGENCY_STOP = stats_data.data[70],
            payload.button.MAIN_MOTOR_TRIPPED = stats_data.data[71],
            payload.button.RHS_FORCE_FEEDER_TRIPPED = stats_data.data[72],
            payload.button.RHS_FORCE_FEEDER_TRIPPED = stats_data.data[73],
            payload.button.POWER_PACK_TRIPPED = stats_data.data[74],
            payload.button.LUBRICATION_OIL_LOW_LEVEL = stats_data.data[75],
            payload.button.LHS_MAIN_OVER_LIMIT = stats_data.data[78],
            payload.button.LHS_MAIN_UNDER_LIMIT = stats_data.data[79],
            payload.button.RHS_MAIN_OVER_LIMIT = stats_data.data[82],
            payload.button.RHS_MAIN_UNDER_LIMIT = stats_data.data[83],
            payload.button.SYSTEM_OVERLOAD = stats_data.data[84],
            payload.button.SAFETY_GUARD_OPEN = stats_data.data[85],
            payload.button.PRESSURE_OVER_LIMIT = stats_data.data[86],
            payload.button.LHS_POWDER_LOW = stats_data.data[87],
            payload.button.RHS_POWDER_LOW = stats_data.data[88],
            payload.button.LUBRICATION_PUMP_FAILS = stats_data.data[89],
            payload.button.DIRECT__RAMP = stats_data.data[90],
            payload.button.WITH_DOOR__BYPASS = stats_data.data[91],
            payload.button.FORCE_MEASUREMENT_ENABLE_BUTTON = stats_data.data[92],
            payload.button.B_TYPE__D_TYPE = stats_data.data[93],
            payload.button.POWDER_SENSOR_ENABLE = stats_data.data[94],
            payload.button.Z_PHASE_SELECTION = stats_data.data[95]
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

var offset_button
var set_button

var writebutton = function () {

    client.writeCoil(button_address + offset_button, set_button)
        .then(function (d) {
            console.log(`Address ${button_address} set to ${set_button}`, d);
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

    // fetch(payloadURL)
    //     .then(res => {
    //         if (res.status >= 400) {
    //             throw new Error("Bad response from server");
    //         }
    //         return res.json();
    //     })
    //     .then(data => {
    //         payload1 = data;
    //     })
    //     .catch(err => {
    //         console.error("[ MODBUS SERVER OFFLINE ]");
    //     });

    writelog = () => {
        flux.write(`operationlogs`)
            .tag({
            })
            .field({
                // batch: payload1.batch,  // 2
                batch: "TEST",  // 2
                operator: "TEST",  // 2
                // operator: payload1.machine.operator_name,  // 2
                parameter: a,  // 2
                oldvalue: c,  // 2
                newvalue: b,  // 2
            })
            .then(() => console.info('[ LOG ENTRY DONE ]'))
            .catch(console.error);
    }

    if (a == "TURRET_RPM") {
        offset_stats = 0
        set_stats = b
        c = payload.stats.turret.RPM
        payload.stats.turret.RPM = b;
        writestats()
        writelog()
    }
    else if (a == "LHS_FORCE_FEEDER_RPM") {
        offset_stats = 1
        set_stats = b
        c = payload.stats.LHS_FF.RPM
        payload.stats.LHS_FF.RPM = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_FORCE_FEEDER_RPM") {
        offset_stats = 2
        set_stats = b
        c = payload.stats.RHS_FF.RPM
        payload.stats.RHS_FF.RPM = b;
        writestats()
        writelog()
    } 
    else if (a == "FORCE_FEEDER_MODE") {
        offset_stats = 3
        set_stats = b
        c = payload.stats.FF_MODE
        payload.stats.FF_MODE = b;
        writestats()
        writelog()
    } 
    else if (a == "LUBE_TIME_DELAY_MINUTES") {
        offset_stats = 4
        set_stats = b
        c = payload.stats.lubrication.set_delay_min
        payload.stats.lubrication.set_delay_min = b;
        writestats()
        writelog()
    } 
    else if (a == "LUBE_TIME_DELAY_SECONDS") {
        offset_stats = 5
        set_stats = b
        c = payload.stats.lubrication.set_delay_sec
        payload.stats.lubrication.set_delay_sec = b;
        writestats()
        writelog()
    } 
    else if (a == "PRESSURE_TON") {
        offset_stats = 6
        set_stats = b
        c = payload.stats.pressure.pressure_set
        payload.stats.pressure.pressure_set = b;
        writestats()
        writelog()
    } 
    else if (a == "HYDRAULIC_HIGH_PRESSURE_CUTOFF_PERCENT") {
        offset_stats = 7
        set_stats = b
        c = payload.stats.hydraulic.high_cutoff
        payload.stats.hydraulic.high_cutoff = b;
        writestats()
        writelog()
    } 
    else if (a == "HYDRAULIC_LOW_PRESSURE_CUTOFF_PERCENT") {
        offset_stats = 8
        set_stats = b
        c = payload.stats.hydraulic.low_cutoff
        payload.stats.hydraulic.low_cutoff = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_PRE_TOLERANCE_UPPER") {
        offset_stats = 10
        set_stats = b
        c = payload.machine.LHS.precompression_upperlimit
        payload.machine.LHS.precompression_upperlimit = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_PRE_TOLERANCE_LOWER") {
        offset_stats = 11
        set_stats = b
        c = payload.machine.LHS.precompression_lowerlimit
        payload.machine.LHS.precompression_lowerlimit = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_MAIN_TOLERANCE_UPPER") {
        offset_stats = 12
        set_stats = b
        c = payload.machine.LHS.maincompression_upperlimit
        payload.machine.LHS.maincompression_upperlimit = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_MAIN_TOLERANCE_LOWER") {
        offset_stats = 13
        set_stats = b
        c = payload.machine.LHS.maincompression_lowerlimit
        payload.machine.LHS.maincompression_lowerlimit = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_EJN_TOLERANCE_UPPER") {
        offset_stats = 14
        set_stats = b
        c = payload.machine.LHS.ejection_upperlimit
        payload.machine.LHS.ejection_upperlimit = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_EJN_TOLERANCE_LOWER") {
        offset_stats = 15
        set_stats = b
        c = payload.machine.LHS.ejection_lowerlimit
        payload.machine.LHS.ejection_lowerlimit = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_PRE_TOLERANCE_UPPER") {
        offset_stats = 16
        set_stats = b
        c = payload.machine.RHS.precompression_upperlimit
        payload.machine.RHS.precompression_upperlimit = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_PRE_TOLERANCE_LOWER") {
        offset_stats = 17
        set_stats = b
        c = payload.machine.RHS.precompression_lowerlimit
        payload.machine.RHS.precompression_lowerlimit = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_MAIN_TOLERANCE_UPPER") {
        offset_stats = 18
        set_stats = b
        c = payload.machine.RHS.maincompression_upperlimit
        payload.machine.RHS.maincompression_upperlimit = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_MAIN_TOLERANCE_LOWER") {
        offset_stats = 19
        set_stats = b
        c = payload.machine.RHS.maincompression_lowerlimit
        payload.machine.RHS.maincompression_lowerlimit = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_EJN_TOLERANCE_UPPER") {
        offset_stats = 20
        set_stats = b
        c = payload.machine.RHS.ejection_upperlimit
        payload.machine.RHS.ejection_upperlimit = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_EJN_TOLERANCE_LOWER") {
        offset_stats = 21
        set_stats = b
        c = payload.machine.RHS.ejection_lowerlimit
        payload.machine.RHS.ejection_lowerlimit = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_PRE_FORCE_LINE") {
        offset_stats = 22
        set_stats = b
        c = payload.machine.LHS.pre_forceline
        payload.machine.LHS.pre_forceline = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_MAIN_FORCE_LINE") {
        offset_stats = 23
        set_stats = b
        c = payload.machine.LHS.main_forceline
        payload.machine.LHS.main_forceline = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_EJN_FORCE_LINE") {
        offset_stats = 24
        set_stats = b
        c = payload.machine.LHS.ejn_forceline
        payload.machine.LHS.ejn_forceline = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_PRE_FORCE_LINE") {
        offset_stats = 25
        set_stats = b
        c = payload.machine.RHS.pre_forceline
        payload.machine.RHS.pre_forceline = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_MAIN_FORCE_LINE") {
        offset_stats = 26
        set_stats = b
        c = payload.machine.RHS.main_forceline
        payload.machine.RHS.main_forceline = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_EJN_FORCE_LINE") {
        offset_stats = 27
        set_stats = b
        c = payload.machine.RHS.ejn_forceline
        payload.machine.RHS.ejn_forceline = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_PRE_MAX") {
        offset_stats = 28
        set_stats = b
        c = payload.machine.LHS.precompression_max
        payload.machine.LHS.precompression_max = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_MAIN_MAX") {
        offset_stats = 29
        set_stats = b
        c = payload.machine.LHS.maincompression_max
        payload.machine.LHS.maincompression_max = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_EJN_MAX") {
        offset_stats = 30
        set_stats = b
        c = payload.machine.LHS.ejection_max
        payload.machine.LHS.ejection_max = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_PRE_MAX") {
        offset_stats = 31
        set_stats = b
        c = payload.machine.RHS.precompression_max
        payload.machine.RHS.precompression_max = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_MAIN_MAX") {
        offset_stats = 32
        set_stats = b
        c = payload.machine.RHS.maincompression_max
        payload.machine.RHS.maincompression_max = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_EJN_MAX") {
        offset_stats = 33
        set_stats = b
        c = payload.machine.RHS.ejection_max
        payload.machine.RHS.ejection_max = b;
        writestats()
        writelog()
    } 
    else if (a == "B_TYPE_HEAD_FLAT") {
        offset_stats = 36
        set_stats = b
        c = payload.stats.B_HEAD
        payload.stats.B_HEAD = b;
        writestats()
        writelog()
    } 
    else if (a == "B_TYPE_PCD") {
        offset_stats = 38
        set_stats = b
        c = payload.stats.B_PCD
        payload.stats.B_PCD = b;
        writestats()
        writelog()
    } 
    else if (a == "D_TYPE_HEAD_FLAT") {
        offset_stats = 40
        set_stats = b
        c = payload.stats.D_HEAD
        payload.stats.D_HEAD = b;
        writestats()
        writelog()
    } 
    else if (a == "D_TYPE_PCD") {
        offset_stats = 42
        set_stats = b
        c = payload.stats.D_PCD
        payload.stats.D_PCD = b;
        writestats()
        writelog()
    } 
    else if (a == "TOTAL_PUNCHES") {
        offset_stats = 48
        set_stats = b
        c = payload.stats.total_punches
        payload.stats.total_punches = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_FILL_DEPTH_MAX_ANALOG") {
        offset_stats = 53
        set_stats = b
        c = payload.stats.LHSdepth.analog_max
        payload.stats.LHSdepth.analog_max = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_FILL_DEPTH_MIN_ANALOG") {
        offset_stats = 54
        set_stats = b
        c = payload.stats.LHSdepth.analog_min
        payload.stats.LHSdepth.analog_min = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_FILL_DEPTH_MAX") {
        offset_stats = 55
        set_stats = b
        c = payload.stats.LHSdepth.depth_max
        payload.stats.LHSdepth.depth_max = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_FILL_DEPTH_MIN") {
        offset_stats = 56
        set_stats = b
        c = payload.stats.LHSdepth.depth_min
        payload.stats.LHSdepth.depth_min = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_FILL_DEPTH_MAX_ANALOG") {
        offset_stats = 57
        set_stats = b
        c = payload.stats.RHSdepth.analog_max
        payload.stats.RHSdepth.analog_max = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_FILL_DEPTH_MIN_ANALOG") {
        offset_stats = 58
        set_stats = b
        c = payload.stats.RHSdepth.analog_min
        payload.stats.RHSdepth.analog_min = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_FILL_DEPTH_MAX") {
        offset_stats = 59
        set_stats = b
        c = payload.stats.RHSdepth.depth_max
        payload.stats.RHSdepth.depth_max = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_FILL_DEPTH_MIN") {
        offset_stats = 60
        set_stats = b
        c = payload.stats.RHSdepth.depth_min
        payload.stats.RHSdepth.depth_min = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_WEIGHT_MAX_ANALOG") {
        offset_stats = 61
        set_stats = b
        c = payload.stats.LHSweight.analog_max
        payload.stats.LHSweight.analog_max = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_WEIGHT_MIN_ANALOG") {
        offset_stats = 62
        set_stats = b
        c = payload.stats.LHSweight.analog_min
        payload.stats.LHSweight.analog_min = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_WEIGHT_MAX") {
        offset_stats = 63
        set_stats = b
        c = payload.stats.LHSweight.weight_max
        payload.stats.LHSweight.weight_max = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_WEIGHT_MIN") {
        offset_stats = 64
        set_stats = b
        c = payload.stats.LHSweight.weight_min
        payload.stats.LHSweight.weight_min = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_WEIGHT_MAX_ANALOG") {
        offset_stats = 65
        set_stats = b
        c = payload.stats.RHSweight.analog_max
        payload.stats.RHSweight.analog_max = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_WEIGHT_MIN_ANALOG") {
        offset_stats = 66
        set_stats = b
        c = payload.stats.RHSweight.analog_max
        payload.stats.RHSweight.analog_max = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_WEIGHT_MAX") {
        offset_stats = 67
        set_stats = b
        c = payload.stats.RHSweight.weight_max
        payload.stats.RHSweight.weight_max = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_WEIGHT_MIN") {
        offset_stats = 68
        set_stats = b
        c = payload.stats.RHSweight.weight_max
        payload.stats.RHSweight.weight_max = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_THICKNESS_MAX_ANALOG") {
        offset_stats = 69
        set_stats = b
        c = payload.stats.LHSthickness.analog_max
        payload.stats.LHSthickness.analog_max = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_THICKNESS_MIN_ANALOG") {
        offset_stats = 70
        set_stats = b
        c = payload.stats.LHSthickness.analog_max
        payload.stats.LHSthickness.analog_max = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_THICKNESS_MAX") {
        offset_stats = 71
        set_stats = b
        c = payload.stats.LHSthickness.thickness_max
        payload.stats.LHSthickness.thickness_max = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_THICKNESS_MIN") {
        offset_stats = 72
        set_stats = b
        c = payload.stats.LHSthickness.thickness_min
        payload.stats.LHSthickness.thickness_min = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_THICKNESS_MAX_ANALOG") {
        offset_stats = 73
        set_stats = b
        c = payload.stats.RHSthickness.analog_max
        payload.stats.RHSthickness.analog_max = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_THICKNESS_MIN_ANALOG") {
        offset_stats = 74
        set_stats = b
        c = payload.stats.RHSthickness.analog_min
        payload.stats.RHSthickness.analog_min = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_THICKNESS_MAX") {
        offset_stats = 75
        set_stats = b
        c = payload.stats.RHSthickness.thickness_max
        payload.stats.RHSthickness.thickness_max = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_THICKNESS_MIN") {
        offset_stats = 76
        set_stats = b
        c = payload.stats.RHSthickness.thickness_min
        payload.stats.RHSthickness.thickness_min = b;
        writestats()
        writelog()
    } 
    else if (a == "TURRET_MAX_RPM") {
        offset_stats = 80
        set_stats = b
        c = payload.stats.turret.max_rpm
        payload.stats.turret.max_rpm = b;
        writestats()
        writelog()
    } 
    else if (a == "TURRET_MAX_FREQ") {
        offset_stats = 81
        set_stats = b
        c = payload.stats.turret.max_freq
        payload.stats.turret.max_freq = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_FORCE_FEEDER_MAX_RPM") {
        offset_stats = 82
        set_stats = b
        c = payload.stats.LHS_FF.max_rpm
        payload.stats.LHS_FF.max_rpm = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_FORCE_FEEDER_MAX_FREQ") {
        offset_stats = 83
        set_stats = b
        c = payload.stats.LHS_FF.max_freq
        payload.stats.LHS_FF.max_freq = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_FORCE_FEEDER_MAX_RPM") {
        offset_stats = 84
        set_stats = b
        c = payload.stats.RHS_FF.max_rpm
        payload.stats.RHS_FF.max_rpm = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_FORCE_FEEDER_MAX_FREQ") {
        offset_stats = 85
        set_stats = b
        c = payload.stats.RHS_FF.max_freq
        payload.stats.RHS_FF.max_freq = b;
        writestats()
        writelog()
    } 
    else if (a == "HYDRAULIC_PRESSURE_MAX") {
        offset_stats = 86
        set_stats = b
        c = payload.stats.hydraulic.high_cutoff
        payload.stats.hydraulic.high_cutoff = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_PRE_OFFSET") {
        offset_stats = 90
        set_stats = b
        c = payload.stats.punch_offset_position.L_PRE
        payload.stats.punch_offset_position.L_PRE = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_MAIN_OFFSET") {
        offset_stats = 91
        set_stats = b
        c = payload.stats.punch_offset_position.L_MAIN
        payload.stats.punch_offset_position.L_MAIN = b;
        writestats()
        writelog()
    } 
    else if (a == "LHS_EJN_OFFSET") {
        offset_stats = 92
        set_stats = b
        c = payload.stats.punch_offset_position.L_EJN
        payload.stats.punch_offset_position.L_EJN = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_PRE_OFFSET") {
        offset_stats = 93
        set_stats = b
        c = payload.stats.punch_offset_position.R_PRE
        payload.stats.punch_offset_position.R_PRE = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_MAIN_OFFSET") {
        offset_stats = 94
        set_stats = b
        c = payload.stats.punch_offset_position.R_MAIN
        payload.stats.punch_offset_position.R_MAIN = b;
        writestats()
        writelog()
    } 
    else if (a == "RHS_EJN_OFFSET") {
        offset_stats = 95
        set_stats = b
        c = payload.stats.punch_offset_position.R_EJN
        payload.stats.punch_offset_position.R_EJN = b;
        writestats()
        writelog()
    } 
    else if (a == "MACHINE_INCHING_BUTTON" && b == "true") {
        offset_button = 20
        set_button = true
        c = payload.button.MACHINE_INCHING_BUTTON
        
        writebutton()
        writelog()   
    }
    else if (a == "MACHINE_INCHING_BUTTON" && b == "false") {
        offset_button = 20
        set_button = false
        c = payload.button.MACHINE_INCHING_BUTTON
        
        writebutton()
        writelog()   
    }
    else if (a == "MACHINE_START_BUTTON" && b == "true") {
        offset_button = 25
        set_button = true
        c = payload.button.MACHINE_START_BUTTON
        
        writebutton()
        writelog()   
    }
    else if (a == "MACHINE_START_BUTTON" && b == "false") {
        offset_button = 25
        set_button = false
        c = payload.button.MACHINE_START_BUTTON
        
        writebutton()
        writelog()   
    }
    else if (a == "MACHINE_STOP_BUTTON" && b == "true") {
        offset_button = 26
        set_button = true
        c = payload.button.MACHINE_STOP_BUTTON
        
        writebutton()
        writelog()
    }
    else if (a == "MACHINE_STOP_BUTTON" && b == "false") {
        offset_button = 26
        set_button = false
        c = payload.button.MACHINE_STOP_BUTTON
        
        writebutton()
        writelog()
    }
    else if (a == "POWER_PACK_START_BUTTON" && b == "true") {
        offset_button = 10
        set_button = true
        c = payload.button.POWER_PACK_START_BUTTON
        writebutton()
        writelog()   
    }
    else if (a == "POWER_PACK_START_BUTTON" && b == "false") {
        offset_button = 10
        set_button = false
        c = payload.button.POWER_PACK_START_BUTTON
        writebutton()
        writelog()   
    }
    else if (a == "POWER_PACK_STOP_BUTTON" && b == "true") {
        offset_button = 11
        set_button = true
        c = payload.button.POWER_PACK_STOP_BUTTON
        writebutton()
        writelog()   
    }
    else if (a == "POWER_PACK_STOP_BUTTON" && b == "false") {
        offset_button = 11
        set_button = false
        c = payload.button.POWER_PACK_STOP_BUTTON
        writebutton()
        writelog()   
    }
    else if (a == "DRAIN_BUTTON" && b == "true") {
        offset_button = 14
        set_button = true
        c = payload.button.DRAIN_BUTTON_HMI

        writebutton()
        writelog()
    }
    else if (a == "FORCE_FEEDER_START_BUTTON" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.FORCE_FEEDER_START_BUTTON
        
        writebutton()
        writelog()
    }
    else if (a == "FORCE_FEEDER_STOP_BUTTON" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.FORCE_FEEDER_STOP_BUTTON
        
        writebutton()
        writelog()
    }
    else if (a == "TABLET_COUNT_RESET" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.TABLET_COUNT_RESET
        
        writebutton()
        writelog()
    }
    else if (a == "TURRET_RUN_BUTTON_HMI" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.TURRET_RUN_BUTTON_HMI
        
        writebutton()
        writelog()
    }
    else if (a == "LHS_FORCE_FEEDER_BUTTON_HMI" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.LHS_FORCE_FEEDER_BUTTON_HMI
        
        writebutton()
        writelog()
    }
    else if (a == "RHS_FORCE_FEEDER_BUTTON_HMI" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.RHS_FORCE_FEEDER_BUTTON_HMI
        
        writebutton()
        writelog()
    }
    else if (a == "LUBRICATION_PUMP_BUTTON_HMI" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.LUBRICATION_PUMP_BUTTON_HMI
        
        writebutton()
        writelog()
    }
    else if (a == "REJECTION_BUTTON_HMI" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.REJECTION_BUTTON_HMI
        
        writebutton()
        writelog()
    }
    else if (a == "FAN_BUTTON_HMI" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.FAN_BUTTON_HMI
        
        writebutton()
        writelog()
    }
    else if (a == "DIRECT__RAMP" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.DIRECT__RAMP
        
        writebutton()
        writelog()
    }
    else if (a == "WITH_DOOR__BYPASS" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.WITH_DOOR__BYPASS
        
        writebutton()
        writelog()
    }
    else if (a == "FORCE_MEASUREMENT_ENABLE_BUTTON" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.FORCE_MEASUREMENT_ENABLE_BUTTON
        
        writebutton()
        writelog()
    }
    else if (a == "B_TYPE__D_TYPE" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.B_TYPE__D_TYPE
        
        writebutton()
        writelog()
    }
    else if (a == "POWDER_SENSOR_ENABLE" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.POWDER_SENSOR_ENABLE
        
        writebutton()
        writelog()
    }
    else if (a == "Z_PHASE_SELECTION" && b == "true") {
        offset_button = 15
        set_button = true
        c = payload.button.Z_PHASE_SELECTION
        
        writebutton()
        writelog()
    }
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json({ message: `[ UPDATED ${a} to ${b} ]` });
});

// Start Server
const port = 3128;
app.listen(port, () => console.log(`Server running on port ${port} 👑`));