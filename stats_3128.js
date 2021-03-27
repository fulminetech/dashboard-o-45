var ModbusRTU = require("modbus-serial");
const { exec } = require('child_process');
const restart1Command = "pm2 restart prod-modbus"

// Express
const express = require("express");
const app = express();
var cors = require('cors')
app.use(cors({ origin: "*" }));

// Influx
const Influx = require('influxdb-nodejs');
const { setInterval } = require('timers');
const flux = new Influx(`http://${host}:8086/new`);

// Fetch
const host = "localhost"
const fetch = require('cross-fetch'); // To get operator and batch details for logging
const payloadURL = `${host}:5000/api/payload`;

// Modbus 
const coil_410 = 410;
const coil_500 = 500;
const coil_7900 = 7900;

const time_address = 100;
const reg_6000 = 6000;
const reg_5000 = 5000;

var CODE_INIT = "State init";
var mbsState = CODE_INIT;

var client = new ModbusRTU();
const slaveID = 1;
const ip = "192.168.0.100"
var mbsTimeout = 5000;
var mbsScan = 300; // Modbus scan time

var GOOD_CONNECT = "State good (port)";
var FAILED_CONNECT = "State fail (port)";
var PASS_READ_TIME = "Time read good"
var FAIL_READ_TIME = "Time read failed"

var PASS_READ_COILS = "State good status (read)";
var PASS_WRITE_COIL = "State good status (write)";
var FAIL_WRITE_COIL = "State fail status (write)";

var PASS_READ_REGS = "State good status (read)";
var PASS_REGS_WRITE = "State good stats (write)";
var FAIL_REGS_WRITE = "State fail stats (write)";

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
            dozer_position: 0,
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
            dozer_position: 0,
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
        awc: {
            L_precompression_upperlimit: 0,
            L_precompression_lowerlimit: 0,
            L_maincompression_upperlimit: 0,
            L_maincompression_lowerlimit: 0,
            R_precompression_upperlimit: 0,
            R_precompression_lowerlimit: 0,
            R_maincompression_upperlimit: 0,
            R_maincompression_lowerlimit: 0,
            MONO_MAIN_FORCE: 0,
            BI_PRE_FORCE: 0,
            BI_MAIN_FORCE: 0,
            AVG_RTN: 0,
            AWC_TOLERANCE: 0,
            AWC_MAX_CORRECTION: 0,
            AWC_32bit_CORRECTION: 0,
            Actual_LHS: 0,
            Actual_RHS: 0
        },
        sampling: {
            NO_TABLET_SAMPLING: 0,
            SAMPLING_TIME_MINS: 0,
        },
        roller: {
            frequency: 0,
            motor: 0  
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
        maintainence: [],
        FORCE_MEASUREMENT_ENABLE_BUTTON: '',
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
        ROLLER_FORWARD: '',
        ROLLER_REVERSE: '',
        MANUAL_SAMPLE: '',
        AUTO_SAMPLING: '',
        REJN_AIR_FLAP: '',
        MONO_BI: '',
        REJECTION_MODE: '',
        AWC_ENABLE: '',
        LHS_WEIGHT_INC: '',
        LHS_WEIGHT_DEC: '',
        RHS_WEIGHT_INC: '',
        RHS_WEIGHT_DEC: '',
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
            mbsState = GOOD_CONNECT;
            console.log(`[ CONNECTED ]`)
        })
        .then(function () {
            runModbus()
        })
        .catch(function (e) {
            mbsState = FAILED_CONNECT;
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
            mbsState = PASS_READ_TIME;
        })
        .catch(function (e) {
            timetemp++
            if (timetemp < timecheck) {
                mbsState = GOOD_CONNECT;
                console.log(mbsState)
            } else {
                console.log(mbsState)
                mbsState = FAIL_READ_TIME;
            }
        })
}

// Run MODBUS
var runModbus = function () {
    var nextAction;
    switch (mbsState) {
        case CODE_INIT:
            nextAction = connectClient;
            break;
        
        case FAILED_CONNECT:
            nextAction = connectClient;
            break;

        case GOOD_CONNECT:
            nextAction = syncplctime;
            break;

        case PASS_READ_TIME || FAIL_READ_TIME:
            nextAction = read_coils;
            break;

        case PASS_READ_COILS:
            nextAction = read_regs;
            break;
        
        case PASS_READ_REGS: // Not used
            nextAction = read_coils;
            break;

        case PASS_READ_COILS:
            nextAction = read_regs;
            break;

        case PASS_WRITE_COIL || FAIL_WRITE_COIL:
            nextAction = read_coils;
            break;
        
        case PASS_REGS_WRITE || FAIL_REGS_WRITE:
            nextAction = read_coils;
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
        read_regs();
    }

    // set for next run
    setTimeout(runModbus, mbsScan);
}

var read_coils = function () {
    mbsState = PASS_READ_COILS;

    client.readCoils(coil_500, 100)
        .then(function (punch_status) {
            // console.log("STATUS: ", punch_status.data)
            payload.status.data = punch_status.data[0];

            payload.button.DIRECT__RAMP = punch_status.data[0],
            payload.button.WITH_DOOR__BYPASS = punch_status.data[2],
            payload.button.B_TYPE__D_TYPE = punch_status.data[8],
            payload.button.POWDER_SENSOR_ENABLE = punch_status.data[10],
            payload.button.Z_PHASE_SELECTION = punch_status.data[11]
            
            payload.button.AUTO_SAMPLING = punch_status.data[13]
            payload.button.REJECTION_BUTTON_HMI = punch_status.data[14]
            payload.button.REJN_AIR_FLAP = punch_status.data[15]
            payload.button.MONO_BI = punch_status.data[16]
            payload.button.REJECTION_MODE = punch_status.data[17]
            payload.button.AWC_ENABLE = punch_status.data[20]
            payload.button.LHS_FORCE_FEEDER_BUTTON_HMI = punch_status.data[21]
            payload.button.RHS_FORCE_FEEDER_BUTTON_HMI = punch_status.data[22]
            
            payload.button.RHS_WEIGHT_INC = punch_status.data[23]
            payload.button.RHS_WEIGHT_DEC = punch_status.data[24]
            
            payload.button.LHS_WEIGHT_INC = punch_status.data[25]
            payload.button.LHS_WEIGHT_DEC = punch_status.data[26]

            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            // console.error('[ #6 Status Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
    
    client.readCoils(coil_410, 100)
        .then(function (stats_data) {
            // console.log("STATS: ",stats_data.data)

            payload.button.POWER_PACK_START_BUTTON = stats_data.data[0],
                payload.button.POWER_PACK_STOP_BUTTON = stats_data.data[1],
                payload.button.PRESSURE_ACK_BUTTON = stats_data.data[2],
                payload.button.DRAIN_BUTTON = stats_data.data[4],

                payload.button.MACHINE_INCHING_BUTTON = stats_data.data[10],
                payload.button.MACHINE_START_BUTTON = stats_data.data[15],
                payload.button.MACHINE_STOP_BUTTON = stats_data.data[16],

                payload.button.FORCE_FEEDER_START_BUTTON = stats_data.data[18],
                payload.button.FORCE_FEEDER_STOP_BUTTON = stats_data.data[19],

                payload.button.TABLET_COUNT_RESET = stats_data.data[20],

                payload.button.ROLLER_FORWARD = stats_data.data[25],
                payload.button.ROLLER_REVERSE = stats_data.data[26],

                payload.button.MANUAL_SAMPLE = stats_data.data[28],
                payload.button.INITIAL_REJECTION = stats_data.data[29],

                payload.button.GUARD_OPEN = stats_data.data[50],
                payload.button.LUBRICATION_OIL_LOW = stats_data.data[51],
                payload.button.LHS_POWDER_LOW = stats_data.data[52],
                payload.button.RHS_POWDER_LOW = stats_data.data[53],
                payload.button.PRESSURE_OVER_LIMIT = stats_data.data[54],
                payload.button.SYSTEM_OVERLOAD = stats_data.data[55],
                payload.button.EMERGENCY_STOP = stats_data.data[60],
                payload.button.MAIN_MOTOR_TRIPPED = stats_data.data[61],
                payload.button.RHS_FORCE_FEEDER_TRIPPED = stats_data.data[62],
                payload.button.RHS_FORCE_FEEDER_TRIPPED = stats_data.data[63],
                payload.button.POWER_PACK_TRIPPED = stats_data.data[64],
                payload.button.LUBRICATION_OIL_LOW_LEVEL = stats_data.data[65],
                payload.button.LHS_MAIN_OVER_LIMIT = stats_data.data[68],
                payload.button.LHS_MAIN_UNDER_LIMIT = stats_data.data[69],
                payload.button.RHS_MAIN_OVER_LIMIT = stats_data.data[72],
                payload.button.RHS_MAIN_UNDER_LIMIT = stats_data.data[73],
                payload.button.SYSTEM_OVERLOAD = stats_data.data[74],
                payload.button.SAFETY_GUARD_OPEN = stats_data.data[75],
                payload.button.PRESSURE_OVER_LIMIT = stats_data.data[76],
                payload.button.LHS_POWDER_LOW = stats_data.data[77],
                payload.button.RHS_POWDER_LOW = stats_data.data[78],
                payload.button.LUBRICATION_PUMP_FAILS = stats_data.data[79]
        })
        .catch(function (e) {
            // console.error('[ #7 Stats Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
    
    client.readCoils(coil_7900, 100)
        .then(function (data) {
            // console.log("STATS: ",stats_data.data)

            payload.button.maintainence = data.data[0]
        })
        .catch(function (e) {
            // console.error('[ #7 Stats Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
}

var read_regs = function () {
    mbsState = PASS_READ_REGS;

    client.readHoldingRegisters(reg_6000, 100)
        .then(function (stats_data) {
            // console.log("STATS: ",stats_data.data)
            // New stats! 
            payload.stats.turret.RPM = stats_data.data[0],
            payload.stats.LHS_FF.RPM = stats_data.data[1],
            payload.stats.RHS_FF.RPM = stats_data.data[2],
            payload.stats.FF_MODE = stats_data.data[3],
            payload.stats.lubrication.set_delay_min = stats_data.data[4],
            payload.stats.lubrication.set_delay_sec = stats_data.data[5]/10,
            payload.stats.pressure.pressure_set = stats_data.data[7]/10,
            payload.stats.hydraulic.high_cutoff = stats_data.data[8]
            payload.stats.hydraulic.low_cutoff = stats_data.data[9]

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

            payload.stats.awc.MONO_MAIN_FORCE = stats_data.data[36] / 100;
            payload.stats.awc.BI_PRE_FORCE  = stats_data.data[37] / 100;
            payload.stats.awc.BI_MAIN_FORCE  = stats_data.data[38] / 100;
            payload.machine.RHS.dozer_position = stats_data.data[39] / 100;
            payload.machine.LHS.dozer_position = stats_data.data[40] / 100;
            payload.stats.awc.AVG_RTN = stats_data.data[41];
            payload.stats.awc.AWC_TOLERANCE = stats_data.data[42];
            payload.stats.awc.AWC_MAX_CORRECTION = stats_data.data[43];
            payload.stats.awc.AWC_32bit_CORRECTION = stats_data.data[44]/100;
            payload.stats.sampling.NO_TABLET_SAMPLING = stats_data.data[57];
            payload.stats.sampling.SAMPLING_TIME_MINS = stats_data.data[58];
            payload.stats.roller.frequency = stats_data.data[61] / 100;

            payload.stats.roller.motor = stats_data.data[62];

            // ADEPT SETUP
            // payload.machine.LHS.precompression_max = stats_data.data[28] / 100;
            // payload.machine.LHS.maincompression_max = stats_data.data[29] / 100;
            // payload.machine.LHS.ejection_max = stats_data.data[30] / 100;

            // payload.machine.RHS.precompression_max = stats_data.data[31] / 100;
            // payload.machine.RHS.maincompression_max = stats_data.data[32] / 100;
            // payload.machine.RHS.ejection_max = stats_data.data[33] / 100;

            // payload.stats.B_HEAD = stats_data.data[36] / 100;
            // payload.stats.B_PCD = stats_data.data[38] / 100;
            // payload.stats.D_HEAD = stats_data.data[40] / 100;
            // payload.stats.D_PCD = stats_data.data[42] / 100;

            // payload.stats.total_punches = stats_data.data[48] / 100;

            // payload.stats.LHSdepth.analog_max = stats_data.data[53] / 100;
            // payload.stats.LHSdepth.analog_min = stats_data.data[54] / 100;
            // payload.stats.LHSdepth.depth_max = stats_data.data[55] / 100;
            // payload.stats.LHSdepth.depth_min = stats_data.data[56] / 100;
            // payload.stats.RHSdepth.analog_max = stats_data.data[57] / 100;
            // payload.stats.RHSdepth.analog_min = stats_data.data[58] / 100;
            // payload.stats.RHSdepth.depth_max = stats_data.data[59] / 100;
            // payload.stats.RHSdepth.depth_min = stats_data.data[60] / 100;

            // payload.stats.LHSweight.analog_max = stats_data.data[61] / 100;
            // payload.stats.LHSweight.analog_min = stats_data.data[62] / 100;
            // payload.stats.LHSweight.weight_max = stats_data.data[63] / 100;
            // payload.stats.LHSweight.weight_min = stats_data.data[64] / 100;
            // payload.stats.RHSweight.analog_max = stats_data.data[65] / 100;
            // payload.stats.RHSweight.analog_min = stats_data.data[66] / 100;
            // payload.stats.RHSweight.weight_max = stats_data.data[67] / 100;
            // payload.stats.RHSweight.weight_min = stats_data.data[68] / 100;

            // payload.stats.LHSthickness.analog_max = stats_data.data[69] / 100;
            // payload.stats.LHSthickness.analog_min = stats_data.data[70] / 100;
            // payload.stats.LHSthickness.thickness_max = stats_data.data[71] / 100;
            // payload.stats.LHSthickness.thickness_min = stats_data.data[72] / 100;
            // payload.stats.RHSthickness.analog_max = stats_data.data[73] / 100;
            // payload.stats.RHSthickness.analog_min = stats_data.data[74] / 100;
            // payload.stats.RHSthickness.thickness_max = stats_data.data[75] / 100;
            // payload.stats.RHSthickness.thickness_min = stats_data.data[76] / 100;

            // payload.stats.turret.max_rpm = stats_data.data[80]
            // payload.stats.turret.max_freq = stats_data.data[81]
            // payload.stats.LHS_FF.max_rpm = stats_data.data[82]
            // payload.stats.LHS_FF.max_freq = stats_data.data[83]
            // payload.stats.RHS_FF.max_rpm = stats_data.data[84]
            // payload.stats.RHS_FF.max_freq = dstats_data.ata[85]

            // payload.stats.hydraulic.max_pressure = stats_data.data[86]
            // payload.stats.encoder_PPR = stats_data.data[88]

            // payload.stats.punch_offset_position.L_PRE = stats_data.data[90]
            // payload.stats.punch_offset_position.L_MAIN = stats_data.data[91]
            // payload.stats.punch_offset_position.L_EJN = stats_data.data[92]
            // payload.stats.punch_offset_position.R_PRE = stats_data.data[93]
            // payload.stats.punch_offset_position.R_MAIN = stats_data.data[94]
            // payload.stats.punch_offset_position.R_EJN = stats_data.data[95]

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
        
    client.readHoldingRegisters(reg_5000, 45)
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

            payload.stats.awc.Actual_LHS = stats_data.data[42]
            payload.stats.awc.Actual_RHS = stats_data.data[43]
            
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            // console.error('[ #7 Stats Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })

}

var reg_offset_6000;
var reg_write_value;

var write_regs = function () {

    client.writeRegisters(reg_6000 + reg_offset_6000, [reg_write_value])
        .then(function (d) {
            console.log(`New value ${reg_write_value}`);
            mbsState = PASS_REGS_WRITE;
        })
        .catch(function (e) {
            mbsState = FAIL_REGS_WRITE;
            console.log(e.message);
        })
}

var coil_offset_500;
var set_status;

var write_coil_500 = function () {

    client.writeCoil(coil_500 + coil_offset_500, set_status)
        .then(function (d) {
            console.log(`Address ${coil_500} set to ${set_status}`, d);
            mbsState = PASS_WRITE_COIL;
        })
        .catch(function (e) {
            console.log(e.message);
            mbsState = FAIL_WRITE_COIL;
        })
}

var coil_offset_410
var set_button

var write_coil_410 = function () {

    client.writeCoil(coil_410 + coil_offset_410, set_button)
        .then(function (d) {
            console.log(`Address ${coil_410} set to ${set_button}`, d);
            mbsState = PASS_WRITE_COIL;
        })
        .catch(function (e) {
            console.log(e.message);
            mbsState = FAIL_WRITE_COIL;
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

    coil_offset_500 = a - 1;
    if (b == 'true') {
        set_status = Boolean(true)
    } else if (b == 'false') {
        set_status = Boolean(false)
    }

    write_coil_500()

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
        reg_offset_6000 = 0
        reg_write_value = b
        c = payload.stats.turret.RPM
        write_regs()
        writelog()
    }
    else if (a == "LHS_FORCE_FEEDER_RPM") {
        reg_offset_6000 = 1
        reg_write_value = b
        c = payload.stats.LHS_FF.RPM
        write_regs()
        writelog()
    } 
    else if (a == "RHS_FORCE_FEEDER_RPM") {
        reg_offset_6000 = 2
        reg_write_value = b
        c = payload.stats.RHS_FF.RPM
        write_regs()
        writelog()
    } 
    else if (a == "FORCE_FEEDER_MODE") {
        reg_offset_6000 = 3
        reg_write_value = b
        c = payload.stats.FF_MODE
        write_regs()
        writelog()
    } 
    else if (a == "LUBE_TIME_DELAY_MINUTES") {
        reg_offset_6000 = 4
        reg_write_value = b
        c = payload.stats.lubrication.set_delay_min
        write_regs()
        writelog()
    } 
    else if (a == "LUBE_TIME_DELAY_SECONDS") {
        reg_offset_6000 = 5
        reg_write_value = b
        c = payload.stats.lubrication.set_delay_sec
        write_regs()
        writelog()
    } 
    else if (a == "PRESSURE_TON") {
        reg_offset_6000 = 7
        reg_write_value = b * 10
        c = payload.stats.pressure.pressure_set
        write_regs()
        writelog()
    } 
    else if (a == "HYDRAULIC_HIGH_PRESSURE_CUTOFF_PERCENT") {
        reg_offset_6000 = 8
        reg_write_value = b
        c = payload.stats.hydraulic.high_cutoff
        write_regs()
        writelog()
    } 
    else if (a == "HYDRAULIC_LOW_PRESSURE_CUTOFF_PERCENT") {
        reg_offset_6000 = 9
        reg_write_value = b
        c = payload.stats.hydraulic.low_cutoff
        write_regs()
        writelog()
    } 
    else if (a == "LHS_PRE_TOLERANCE_UPPER") {
        reg_offset_6000 = 10
        reg_write_value = b * 100
        c = payload.machine.LHS.precompression_upperlimit
        write_regs()
        writelog()
    } 
    else if (a == "LHS_PRE_TOLERANCE_LOWER") {
        reg_offset_6000 = 11
        reg_write_value = b * 100
        c = payload.machine.LHS.precompression_lowerlimit
        write_regs()
        writelog()
    } 
    else if (a == "LHS_MAIN_TOLERANCE_UPPER") {
        reg_offset_6000 = 12
        reg_write_value = b * 100
        c = payload.machine.LHS.maincompression_upperlimit
        write_regs()
        writelog()
    } 
    else if (a == "LHS_MAIN_TOLERANCE_LOWER") {
        reg_offset_6000 = 13
        reg_write_value = b * 100
        c = payload.machine.LHS.maincompression_lowerlimit
        write_regs()
        writelog()
    } 
    else if (a == "LHS_EJN_TOLERANCE_UPPER") {
        reg_offset_6000 = 14
        reg_write_value = b * 100
        c = payload.machine.LHS.ejection_upperlimit
        write_regs()
        writelog()
    } 
    else if (a == "LHS_EJN_TOLERANCE_LOWER") {
        reg_offset_6000 = 15
        reg_write_value = b
        c = payload.machine.LHS.ejection_lowerlimit
        write_regs()
        writelog()
    } 
    else if (a == "RHS_PRE_TOLERANCE_UPPER") {
        reg_offset_6000 = 16
        reg_write_value = b * 100
        c = payload.machine.RHS.precompression_upperlimit
        write_regs()
        writelog()
    } 
    else if (a == "RHS_PRE_TOLERANCE_LOWER") {
        reg_offset_6000 = 17
        reg_write_value = b * 100
        c = payload.machine.RHS.precompression_lowerlimit
        write_regs()
        writelog()
    } 
    else if (a == "RHS_MAIN_TOLERANCE_UPPER") {
        reg_offset_6000 = 18
        reg_write_value = b * 100
        c = payload.machine.RHS.maincompression_upperlimit
        write_regs()
        writelog()
    } 
    else if (a == "RHS_MAIN_TOLERANCE_LOWER") {
        reg_offset_6000 = 19
        reg_write_value = b * 100
        c = payload.machine.RHS.maincompression_lowerlimit
        write_regs()
        writelog()
    } 
    else if (a == "RHS_EJN_TOLERANCE_UPPER") {
        reg_offset_6000 = 20
        reg_write_value = b * 100
        c = payload.machine.RHS.ejection_upperlimit
        write_regs()
        writelog()
    } 
    else if (a == "RHS_EJN_TOLERANCE_LOWER") {
        reg_offset_6000 = 21
        reg_write_value = b * 100
        c = payload.machine.RHS.ejection_lowerlimit
        write_regs()
        writelog()
    } 
    else if (a == "LHS_PRE_FORCE_LINE") {
        reg_offset_6000 = 22
        reg_write_value = b * 100
        c = payload.machine.LHS.pre_forceline
        write_regs()
        writelog()
    } 
    else if (a == "LHS_MAIN_FORCE_LINE") {
        reg_offset_6000 = 23
        reg_write_value = b * 100
        c = payload.machine.LHS.main_forceline
        write_regs()
        writelog()
    } 
    else if (a == "LHS_EJN_FORCE_LINE") {
        reg_offset_6000 = 24
        reg_write_value = b * 100
        c = payload.machine.LHS.ejn_forceline
        write_regs()
        writelog()
    } 
    else if (a == "RHS_PRE_FORCE_LINE") {
        reg_offset_6000 = 25
        reg_write_value = b * 100
        c = payload.machine.RHS.pre_forceline
        write_regs()
        writelog()
    } 
    else if (a == "RHS_MAIN_FORCE_LINE") {
        reg_offset_6000 = 26
        reg_write_value = b * 100
        c = payload.machine.RHS.main_forceline
        write_regs()
        writelog()
    } 
    else if (a == "RHS_EJN_FORCE_LINE") {
        reg_offset_6000 = 27
        reg_write_value = b * 100
        c = payload.machine.RHS.ejn_forceline
        write_regs()
        writelog()
    } 
    else if (a == "MONO_MAIN_FORCE") {
        reg_offset_6000 = 36
        reg_write_value = b
        c = payload.stats.awc.MONO_MAIN_FORCE
        write_regs()
        writelog()
    } 
    else if (a == "BI_PRE_FORCE") {
        reg_offset_6000 = 37
        reg_write_value = b
        c = payload.stats.awc.BI_PRE_FORCE
        write_regs()
        writelog()
    } 
    else if (a == "BI_MAIN_FORCE") {
        reg_offset_6000 = 38
        reg_write_value = b
        c = payload.stats.awc.BI_MAIN_FORCE
        write_regs()
        writelog()
    } 
    else if (a == "RHS_DOZER") {
        reg_offset_6000 = 39
        reg_write_value = b
        c = payload.machine.RHS.dozer_position
        write_regs()
        writelog()
    } 
    else if (a == "LHS_DOZER") {
        reg_offset_6000 = 40
        reg_write_value = b
        c = payload.machine.LHS.dozer_position
        write_regs()
        writelog()
    } 
    else if (a == "AVG_RTN") {
        reg_offset_6000 = 41
        reg_write_value = b
        c = payload.stats.awc.AVG_RTN
        write_regs()
        writelog()
    } 
    else if (a == "AWC_TOLERANCE") {
        reg_offset_6000 = 42
        reg_write_value = b
        c = payload.stats.awc.AWC_TOLERANCE
        write_regs()
        writelog()
    } 
    else if (a == "AWC_MAX_CORRECTION") {
        reg_offset_6000 = 43
        reg_write_value = b
        c = payload.stats.awc.AWC_MAX_CORRECTION
        write_regs()
        writelog()
    } 
    else if (a == "AWC_32bit_CORRECTION") {
        reg_offset_6000 = 44
        reg_write_value = b
        c = payload.stats.awc.AWC_32bit_CORRECTION
        write_regs()
        writelog()
    } 
    else if (a == "NO_TABLET_SAMPLING") {
        reg_offset_6000 = 57
        reg_write_value = b
        c = payload.stats.sampling.NO_TABLET_SAMPLING
        write_regs()
        writelog()
    } 
    else if (a == "SAMPLING_TIME_MINS") {
        reg_offset_6000 = 58
        reg_write_value = b
        c = payload.stats.sampling.SAMPLING_TIME_MINS
        write_regs()
        writelog()
    } 
    else if (a == "ROLLER_VFD_FREQ") {
        reg_offset_6000 = 61
        reg_write_value = b
        c = payload.stats.roller.frequency
        write_regs()
        writelog()
    } 
    else if (a == "ROLLER_MOTOR_SELECTION") {
        reg_offset_6000 = 62
        reg_write_value = b
        c = payload.stats.roller.motor
        write_regs()
        writelog()
    }
        
        
    else if (a == "POWER_PACK_START_BUTTON" && b == "true") {
        coil_offset_410 = 0
        set_button = true
        c = payload.button.POWER_PACK_START_BUTTON
        write_coil_410()
        writelog()
    }
    else if (a == "POWER_PACK_START_BUTTON" && b == "false") {
        coil_offset_410 = 0
        set_button = false
        c = payload.button.POWER_PACK_START_BUTTON
        write_coil_410()
        writelog()
    }
    else if (a == "POWER_PACK_STOP_BUTTON" && b == "true") {
        coil_offset_410 = 1
        set_button = true
        c = payload.button.POWER_PACK_STOP_BUTTON
        write_coil_410()
        writelog()
    }
    else if (a == "POWER_PACK_STOP_BUTTON" && b == "false") {
        coil_offset_410 = 1
        set_button = false
        c = payload.button.POWER_PACK_STOP_BUTTON
        write_coil_410()
        writelog()
    }
    else if (a == "DRAIN_BUTTON" && b == "true") {
        coil_offset_410 = 4
        set_button = true
        c = payload.button.DRAIN_BUTTON_HMI

        write_coil_410()
        writelog()
    }
    else if (a == "DRAIN_BUTTON" && b == "false") {
        coil_offset_410 = 4
        set_button = false
        c = payload.button.DRAIN_BUTTON_HMI

        write_coil_410()
        writelog()
    }
    else if (a == "MACHINE_INCHING_BUTTON" && b == "true") {
        coil_offset_410 = 10
        set_button = true
        c = payload.button.MACHINE_INCHING_BUTTON
        
        write_coil_410()
        writelog()   
    }
    else if (a == "MACHINE_INCHING_BUTTON" && b == "false") {
        coil_offset_410 = 10
        set_button = false
        c = payload.button.MACHINE_INCHING_BUTTON
        
        write_coil_410()
        writelog()   
    }
    else if (a == "MACHINE_START_BUTTON" && b == "true") {
        coil_offset_410 = 15
        set_button = true
        c = payload.button.MACHINE_START_BUTTON
        
        write_coil_410()
        writelog()   
    }
    else if (a == "MACHINE_START_BUTTON" && b == "false") {
        coil_offset_410 = 15
        set_button = false
        c = payload.button.MACHINE_START_BUTTON
        
        write_coil_410()
        writelog()   
    }
    else if (a == "MACHINE_STOP_BUTTON" && b == "true") {
        coil_offset_410 = 16
        set_button = true
        c = payload.button.MACHINE_STOP_BUTTON
        
        write_coil_410()
        writelog()
    }
    else if (a == "MACHINE_STOP_BUTTON" && b == "false") {
        coil_offset_410 = 16
        set_button = false
        c = payload.button.MACHINE_STOP_BUTTON
        
        write_coil_410()
        writelog()
    }
    else if (a == "FORCE_FEEDER_START_BUTTON" && b == "true") {
        coil_offset_410 = 18
        set_button = true
        c = payload.button.FORCE_FEEDER_START_BUTTON
        
        write_coil_410()
        writelog()
    }
    else if (a == "FORCE_FEEDER_START_BUTTON" && b == "false") {
        coil_offset_410 = 18
        set_button = false
        c = payload.button.FORCE_FEEDER_START_BUTTON
        
        write_coil_410()
        writelog()
    }
    else if (a == "FORCE_FEEDER_STOP_BUTTON" && b == "true") {
        coil_offset_410 = 19
        set_button = true
        c = payload.button.FORCE_FEEDER_STOP_BUTTON
        
        write_coil_410()
        writelog()
    }
    else if (a == "FORCE_FEEDER_STOP_BUTTON" && b == "false") {
        coil_offset_410 = 19
        set_button = false
        c = payload.button.FORCE_FEEDER_STOP_BUTTON
        
        write_coil_410()
        writelog()
    }
    else if (a == "TABLET_COUNT_RESET" && b == "true") {
        coil_offset_410 = 20
        set_button = true
        c = payload.button.TABLET_COUNT_RESET
        
        write_coil_410()
        writelog()
    }
    else if (a == "TABLET_COUNT_RESET" && b == "false") {
        coil_offset_410 = 20
        set_button = false
        c = payload.button.TABLET_COUNT_RESET
        
        write_coil_410()
        writelog()
    }
    else if (a == "ROLLER_FORWARD" && b == "true") {
        coil_offset_410 = 25
        set_button = true
        c = payload.button.ROLLER_FORWARD
        
        write_coil_410()
        writelog()
    }
    else if (a == "ROLLER_FORWARD" && b == "false") {
        coil_offset_410 = 25
        set_button = false
        c = payload.button.ROLLER_FORWARD
        
        write_coil_410()
        writelog()
    }
    else if (a == "ROLLER_REVERSE" && b == "true") {
        coil_offset_410 = 26
        set_button = true
        c = payload.button.ROLLER_REVERSE
        
        write_coil_410()
        writelog()
    }
    else if (a == "ROLLER_REVERSE" && b == "false") {
        coil_offset_410 = 26
        set_button = false
        c = payload.button.ROLLER_REVERSE
        
        write_coil_410()
        writelog()
    }
    else if (a == "MANUAL_SAMPLE" && b == "true") {
        coil_offset_410 = 28
        set_button = true
        c = payload.button.MANUAL_SAMPLE
        
        write_coil_410()
        writelog()
    }
    else if (a == "MANUAL_SAMPLE" && b == "false") {
        coil_offset_410 = 28
        set_button = false
        c = payload.button.MANUAL_SAMPLE
        
        write_coil_410()
        writelog()
    }
    else if (a == "INITIAL_REJECTION" && b == "true") {
        coil_offset_410 = 29
        set_button = true
        c = payload.button.INITIAL_REJECTION
        
        write_coil_410()
        writelog()
    }
    else if (a == "INITIAL_REJECTION" && b == "false") {
        coil_offset_410 = 29
        set_button = false
        c = payload.button.INITIAL_REJECTION
        
        write_coil_410()
        writelog()
    }
    else if (a == "FIRST_LAYER_SAMPLING" && b == "true") {
        coil_offset_410 = 30
        set_button = true
        c = payload.button.FIRST_LAYER_SAMPLING
        
        write_coil_410()
        writelog()
    }
    else if (a == "FIRST_LAYER_SAMPLING" && b == "false") {
        coil_offset_410 = 30
        set_button = false
        c = payload.button.FIRST_LAYER_SAMPLING
        
        write_coil_410()
        writelog()
    }
    else if (a == "DIRECT__RAMP" && b == "true") {
        coil_offset_410 = 90
        set_button = true
        c = payload.button.DIRECT__RAMP

        write_coil_410()
        writelog()
    }
    else if (a == "DIRECT__RAMP" && b == "false") {
        coil_offset_410 = 90
        set_button = false
        c = payload.button.DIRECT__RAMP

        write_coil_410()
        writelog()
    }
    else if (a == "WITH_DOOR__BYPASS" && b == "true") {
        coil_offset_410 = 92
        set_button = true
        c = payload.button.WITH_DOOR__BYPASS

        write_coil_410()
        writelog()
    }
    else if (a == "WITH_DOOR__BYPASS" && b == "false") {
        coil_offset_410 = 92
        set_button = false
        c = payload.button.WITH_DOOR__BYPASS

        write_coil_410()
        writelog()
    }
    else if (a == "B_TYPE__D_TYPE" && b == "true") {
        coil_offset_410 = 98
        set_button = true
        c = payload.button.B_TYPE__D_TYPE

        write_coil_410()
        writelog()
    }
    else if (a == "B_TYPE__D_TYPE" && b == "false") {
        coil_offset_410 = 98
        set_button = false
        c = payload.button.B_TYPE__D_TYPE

        write_coil_410()
        writelog()
    }
    else if (a == "POWDER_SENSOR_ENABLE" && b == "true") {
        coil_offset_410 = 100
        set_button = true
        c = payload.button.POWDER_SENSOR_ENABLE

        write_coil_410()
        writelog()
    }
    else if (a == "POWDER_SENSOR_ENABLE" && b == "false") {
        coil_offset_410 = 100
        set_button = false
        c = payload.button.POWDER_SENSOR_ENABLE

        write_coil_410()
        writelog()
    }
    else if (a == "Z_PHASE_SELECTION" && b == "true") {
        coil_offset_410 = 101
        set_button = true
        c = payload.button.Z_PHASE_SELECTION

        write_coil_410()
        writelog()
    }
    else if (a == "Z_PHASE_SELECTION" && b == "false") {
        coil_offset_410 = 101
        set_button = false
        c = payload.button.Z_PHASE_SELECTION

        write_coil_410()
        writelog()
    }
    else if (a == "AUTO_SAMPLING" && b == "true") {
        coil_offset_410 = 103
        set_button = true
        c = payload.button.AUTO_SAMPLE

        write_coil_410()
        writelog()
    }
    else if (a == "AUTO_SAMPLING" && b == "false") {
        coil_offset_410 = 103
        set_button = false
        c = payload.button.AUTO_SAMPLE

        write_coil_410()
        writelog()
    }
    else if (a == "REJECTION_BUTTON_HMI" && b == "true") {
        coil_offset_410 = 104
        set_button = true
        c = payload.button.REJECTION_BUTTON_HMI

        write_coil_410()
        writelog()
    }
    else if (a == "REJECTION_BUTTON_HMI" && b == "false") {
        coil_offset_410 = 104
        set_button = false
        c = payload.button.REJECTION_BUTTON_HMI

        write_coil_410()
        writelog()
    }
    else if (a == "REJN_AIR_FLAP" && b == "true") {
        coil_offset_410 = 105
        set_button = true
        c = payload.button.REJN_AIR_FLAP
        write_coil_410()
        writelog()
    }
    else if (a == "REJN_AIR_FLAP" && b == "false") {
        coil_offset_410 = 105
        set_button = false
        c = payload.button.REJN_AIR_FLAP
        write_coil_410()
        writelog()
    }
    else if (a == "MONO_BI" && b == "true") {
        coil_offset_410 = 106
        set_button = true
        c = payload.button.MONO_BI
        write_coil_410()
        writelog()
    }
    else if (a == "MONO_BI" && b == "false") {
        coil_offset_410 = 106
        set_button = false
        c = payload.button.MONO_BI
        write_coil_410()
        writelog()
    }
    else if (a == "REJECTION_MODE" && b == "true") {
        coil_offset_410 = 107
        set_button = true
        c = payload.button.REJECTION_MODE

        write_coil_410()
        writelog()
    }
    else if (a == "REJECTION_MODE" && b == "false") {
        coil_offset_410 = 107
        set_button = false
        c = payload.button.REJECTION_MODE

        write_coil_410()
        writelog()
    }
    else if (a == "AWC_ENABLE" && b == "true") {
        coil_offset_410 = 110
        set_button = true
        c = payload.button.AWC_ENABLE
        
        write_coil_410()
        writelog()
    }
    else if (a == "AWC_ENABLE" && b == "false") {
        coil_offset_410 = 110
        set_button = false
        c = payload.button.AWC_ENABLE
        
        write_coil_410()
        writelog()
    }
    else if (a == "LHS_FORCE_FEEDER_BUTTON_HMI" && b == "true") {
        coil_offset_410 = 111
        set_button = true
        c = payload.button.LHS_FORCE_FEEDER_BUTTON_HMI
        
        write_coil_410()
        writelog()
    }
    else if (a == "LHS_FORCE_FEEDER_BUTTON_HMI" && b == "false") {
        coil_offset_410 = 111
        set_button = false
        c = payload.button.LHS_FORCE_FEEDER_BUTTON_HMI
        
        write_coil_410()
        writelog()
    }
    else if (a == "RHS_FORCE_FEEDER_BUTTON_HMI" && b == "true") {
        coil_offset_410 = 112
        set_button = true
        c = payload.button.RHS_FORCE_FEEDER_BUTTON_HMI
        
        write_coil_410()
        writelog()
    }
    else if (a == "RHS_FORCE_FEEDER_BUTTON_HMI" && b == "false") {
        coil_offset_410 = 112
        set_button = false
        c = payload.button.RHS_FORCE_FEEDER_BUTTON_HMI
        
        write_coil_410()
        writelog()
    }
    else if (a == "RHS_WEIGHT_INC" && b == "true") {
        coil_offset_410 = 113
        set_button = true
        c = payload.button.RHS_WEIGHT_INC
        
        write_coil_410()
        writelog()
    }
    else if (a == "RHS_WEIGHT_INC" && b == "false") {
        coil_offset_410 = 113
        set_button = false
        c = payload.button.RHS_WEIGHT_INC
        
        write_coil_410()
        writelog()
    }
    else if (a == "RHS_WEIGHT_DEC" && b == "true") {
        coil_offset_410 = 114
        set_button = true
        c = payload.button.RHS_WEIGHT_DEC
        
        write_coil_410()
        writelog()
    }
    else if (a == "RHS_WEIGHT_DEC" && b == "false") {
        coil_offset_410 = 114
        set_button = false
        c = payload.button.RHS_WEIGHT_DEC
        
        write_coil_410()
        writelog()
    }
    else if (a == "LHS_WEIGHT_INC" && b == "true") {
        coil_offset_410 = 115
        set_button = true
        c = payload.button.LHS_WEIGHT_INC
        
        write_coil_410()
        writelog()
    }
    else if (a == "LHS_WEIGHT_INC" && b == "false") {
        coil_offset_410 = 115
        set_button = false
        c = payload.button.LHS_WEIGHT_INC
        
        write_coil_410()
        writelog()
    }
    else if (a == "LHS_WEIGHT_DEC" && b == "true") {
        coil_offset_410 = 116
        set_button = true
        c = payload.button.LHS_WEIGHT_DEC
        
        write_coil_410()
        writelog()
    }
    else if (a == "LHS_WEIGHT_DEC" && b == "false") {
        coil_offset_410 = 116
        set_button = false
        c = payload.button.LHS_WEIGHT_DEC
        
        write_coil_410()
        writelog()
    }
    else if (a == "LHS_FORCE_FEEDER_BUTTON_HMI" && b == "true") {
        coil_offset_410 = 122
        set_button = true
        c = payload.button.LHS_FORCE_FEEDER_BUTTON_HMI
        
        write_coil_410()
        writelog()
    }
    else if (a == "LHS_FORCE_FEEDER_BUTTON_HMI" && b == "false") {
        coil_offset_410 = 122
        set_button = false
        c = payload.button.LHS_FORCE_FEEDER_BUTTON_HMI
        
        write_coil_410()
        writelog()
    }
    else if (a == "RHS_FORCE_FEEDER_BUTTON_HMI" && b == "true") {
        coil_offset_410 = 121
        set_button = true
        c = payload.button.RHS_FORCE_FEEDER_BUTTON_HMI
        
        write_coil_410()
        writelog()
    }
    else if (a == "RHS_FORCE_FEEDER_BUTTON_HMI" && b == "false") {
        coil_offset_410 = 121
        set_button = false
        c = payload.button.RHS_FORCE_FEEDER_BUTTON_HMI
        
        write_coil_410()
        writelog()
    }
    else if (a == "LHS_WEIGHT_INC" && b == "true") {
        coil_offset_410 = 125
        set_button = true
        c = payload.button.LHS_WEIGHT_INC
        
        write_coil_410()
        writelog()
    }
    else if (a == "LHS_WEIGHT_INC" && b == "false") {
        coil_offset_410 = 125
        set_button = false
        c = payload.button.LHS_WEIGHT_INC
        
        write_coil_410()
        writelog()
    }
    else if (a == "RHS_WEIGHT_INC" && b == "true") {
        coil_offset_410 = 123
        set_button = true
        c = payload.button.RHS_WEIGHT_INC
        
        write_coil_410()
        writelog()
    }
    else if (a == "RHS_WEIGHT_INC" && b == "false") {
        coil_offset_410 = 123
        set_button = false
        c = payload.button.RHS_WEIGHT_INC
        
        write_coil_410()
        writelog()
    }
    else if (a == "LHS_WEIGHT_DEC" && b == "true") {
        coil_offset_410 = 126
        set_button = true
        c = payload.button.LHS_WEIGHT_DEC
        
        write_coil_410()
        writelog()
    }
    else if (a == "LHS_WEIGHT_DEC" && b == "false") {
        coil_offset_410 = 126
        set_button = false
        c = payload.button.LHS_WEIGHT_DEC
        
        write_coil_410()
        writelog()
    }
    else if (a == "RHS_WEIGHT_DEC" && b == "true") {
        coil_offset_410 = 124
        set_button = true
        c = payload.button.RHS_WEIGHT_DEC
        
        write_coil_410()
        writelog()
    }
    else if (a == "RHS_WEIGHT_DEC" && b == "false") {
        coil_offset_410 = 124
        set_button = false
        c = payload.button.RHS_WEIGHT_DEC
        
        write_coil_410()
        writelog()
    }
        
        
        
   
    else if (a == "AWC_ENABLE" && b == "true") {
        coil_offset_410 = 110
        set_button = true
        
        write_coil_410()
        writelog()
    }
    else if (a == "AWC_DISABLE" && b == "false") {
        coil_offset_410 = 110
        set_button = false
        
        write_coil_410()
        writelog()
    }
    
    else if (a == "TABLET_COUNT_RESET" && b == "true") {
        coil_offset_410 = 15
        set_button = true
        
        write_coil_410()
        writelog()
    }
    else if (a == "TABLET_COUNT_RESET" && b == "false") {
        coil_offset_410 = 15
        set_button = false
        
        write_coil_410()
        writelog()
    }
    else if (a == "BATCH_OFF" && b == "true") {
        coil_offset_410 = 15
        set_button = true
        
        write_coil_410()
        writelog()
    }
    else if (a == "BATCH_OFF" && b == "false") {
        coil_offset_410 = 15
        set_button = false
        
        write_coil_410()
        writelog()
    }
    else if (a == "INITIAL_REJN" && b == "true") {
        coil_offset_410 = 15
        set_button = true
        
        write_coil_410()
        writelog()
    }
    else if (a == "INITIAL_REJN" && b == "false") {
        coil_offset_410 = 15
        set_button = false
        
        write_coil_410()
        writelog()
    }
    else if (a == "1_REJN" && b == "true") {
        coil_offset_410 = 15
        set_button = true
        
        write_coil_410()
        writelog()
    }
    else if (a == "1_REJN" && b == "false") {
        coil_offset_410 = 15
        set_button = false
        
        write_coil_410()
        writelog()
    }
    else if (a == "BI_LAYER" && b == "true") {
        coil_offset_410 = 15
        set_button = true
        
        write_coil_410()
        writelog()
    }
    else if (a == "BI_LAYER" && b == "false") {
        coil_offset_410 = 15
        set_button = false
        
        write_coil_410()
        writelog()
    }
    else if (a == "Y0_0" && b == "true") {
        coil_offset_410 = 7490
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y0_0" && b == "false") {
        coil_offset_410 = 7490
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y0_1" && b == "true") {
        coil_offset_410 = 7491
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y0_1" && b == "false") {
        coil_offset_410 = 7491
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y0_2" && b == "true") {
        coil_offset_410 = 7492
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y0_2" && b == "false") {
        coil_offset_410 = 7492
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y0_3" && b == "true") {
        coil_offset_410 = 7493
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y0_3" && b == "false") {
        coil_offset_410 = 7493
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y0_4" && b == "true") {
        coil_offset_410 = 7494
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y0_4" && b == "false") {
        coil_offset_410 = 7494
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y0_5" && b == "true") {
        coil_offset_410 = 7495
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y0_5" && b == "false") {
        coil_offset_410 = 7495
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y0_6" && b == "true") {
        coil_offset_410 = 7496
        set_button = true

        write_coil_410()
        
    }
    else if (a == "Y0_6" && b == "false") {
        coil_offset_410 = 7496
        set_button = false

        write_coil_410()
        
    }
    else if (a == "Y0_7" && b == "true") {
        coil_offset_410 = 7497
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y0_7" && b == "false") {
        coil_offset_410 = 7497
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y0_11" && b == "true") {
        coil_offset_410 = 7501
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y0_11" && b == "false") {
        coil_offset_410 = 7501
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y0_12" && b == "true") {
        coil_offset_410 = 7502
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y0_12" && b == "false") {
        coil_offset_410 = 7502
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y0_13" && b == "true") {
        coil_offset_410 = 7503
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y0_13" && b == "false") {
        coil_offset_410 = 7503
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y0_14" && b == "true") {
        coil_offset_410 = 7504
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y0_14" && b == "false") {
        coil_offset_410 = 7504
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y0_15" && b == "true") {
        coil_offset_410 = 7505
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y0_15" && b == "false") {
        coil_offset_410 = 7505
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y1_0" && b == "true") {
        coil_offset_410 = 7506
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y1_0" && b == "false") {
        coil_offset_410 = 7506
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y2_1" && b == "true") {
        coil_offset_410 = 7515
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y2_1" && b == "false") {
        coil_offset_410 = 7515
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y2_2" && b == "true") {
        coil_offset_410 = 7516
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y2_2" && b == "false") {
        coil_offset_410 = 7516
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y2_3" && b == "true") {
        coil_offset_410 = 7517
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y2_3" && b == "false") {
        coil_offset_410 = 7517
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y2_4" && b == "true") {
        coil_offset_410 = 7518
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y2_4" && b == "false") {
        coil_offset_410 = 7518
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y2_5" && b == "true") {
        coil_offset_410 = 7519
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y2_5" && b == "false") {
        coil_offset_410 = 7519
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y2_6" && b == "true") {
        coil_offset_410 = 7520
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y2_6" && b == "false") {
        coil_offset_410 = 7520
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y2_7" && b == "true") {
        coil_offset_410 = 7521
        set_button = true
        
        write_coil_410()
        
    }
    else if (a == "Y2_7" && b == "false") {
        coil_offset_410 = 7521
        set_button = false
        
        write_coil_410()
        
    }
    else if (a == "Y3_0" && b == "true") {
        coil_offset_410 = 7522
        set_button = true
        
        write_coil_410()
    }
    else if (a == "Y3_0" && b == "false") {
        coil_offset_410 = 7522
        set_button = false
        
        write_coil_410()
        
    }
    
    
    else if (a == "LHS_PRE_MAX") {
        reg_offset_6000 = 28
        reg_write_value = b
        c = payload.machine.LHS.precompression_max
        write_regs()
        writelog()
    }
    else if (a == "LHS_MAIN_MAX") {
        reg_offset_6000 = 29
        reg_write_value = b
        c = payload.machine.LHS.maincompression_max
        write_regs()
        writelog()
    }
    else if (a == "LHS_EJN_MAX") {
        reg_offset_6000 = 30
        reg_write_value = b
        c = payload.machine.LHS.ejection_max
        write_regs()
        writelog()
    }
    else if (a == "RHS_PRE_MAX") {
        reg_offset_6000 = 31
        reg_write_value = b
        c = payload.machine.RHS.precompression_max
        write_regs()
        writelog()
    }
    else if (a == "RHS_MAIN_MAX") {
        reg_offset_6000 = 32
        reg_write_value = b
        c = payload.machine.RHS.maincompression_max
        write_regs()
        writelog()
    }
    else if (a == "RHS_EJN_MAX") {
        reg_offset_6000 = 33
        reg_write_value = b
        c = payload.machine.RHS.ejection_max
        write_regs()
        writelog()
    }
    else if (a == "B_TYPE_HEAD_FLAT") {
        reg_offset_6000 = 36
        reg_write_value = b
        c = payload.stats.B_HEAD
        write_regs()
        writelog()
    }
    else if (a == "B_TYPE_PCD") {
        reg_offset_6000 = 38
        reg_write_value = b
        c = payload.stats.B_PCD
        write_regs()
        writelog()
    }
    else if (a == "D_TYPE_HEAD_FLAT") {
        reg_offset_6000 = 40
        reg_write_value = b
        c = payload.stats.D_HEAD
        write_regs()
        writelog()
    }
    else if (a == "D_TYPE_PCD") {
        reg_offset_6000 = 42
        reg_write_value = b
        c = payload.stats.D_PCD
        write_regs()
        writelog()
    }
    else if (a == "TOTAL_PUNCHES") {
        reg_offset_6000 = 48
        reg_write_value = b
        c = payload.stats.total_punches
        write_regs()
        writelog()
    }
    else if (a == "LHS_FILL_DEPTH_MAX_ANALOG") {
        reg_offset_6000 = 53
        reg_write_value = b
        c = payload.stats.LHSdepth.analog_max
        write_regs()
        writelog()
    }
    else if (a == "LHS_FILL_DEPTH_MIN_ANALOG") {
        reg_offset_6000 = 54
        reg_write_value = b
        c = payload.stats.LHSdepth.analog_min
        write_regs()
        writelog()
    }
    else if (a == "LHS_FILL_DEPTH_MAX") {
        reg_offset_6000 = 55
        reg_write_value = b
        c = payload.stats.LHSdepth.depth_max
        payload.stats.LHSdepth.depth_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_FILL_DEPTH_MIN") {
        reg_offset_6000 = 56
        reg_write_value = b
        c = payload.stats.LHSdepth.depth_min
        payload.stats.LHSdepth.depth_min = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_FILL_DEPTH_MAX_ANALOG") {
        reg_offset_6000 = 57
        reg_write_value = b
        c = payload.stats.RHSdepth.analog_max
        payload.stats.RHSdepth.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_FILL_DEPTH_MIN_ANALOG") {
        reg_offset_6000 = 58
        reg_write_value = b
        c = payload.stats.RHSdepth.analog_min
        payload.stats.RHSdepth.analog_min = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_FILL_DEPTH_MAX") {
        reg_offset_6000 = 59
        reg_write_value = b
        c = payload.stats.RHSdepth.depth_max
        payload.stats.RHSdepth.depth_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_FILL_DEPTH_MIN") {
        reg_offset_6000 = 60
        reg_write_value = b
        c = payload.stats.RHSdepth.depth_min
        payload.stats.RHSdepth.depth_min = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_WEIGHT_MAX_ANALOG") {
        reg_offset_6000 = 61
        reg_write_value = b
        c = payload.stats.LHSweight.analog_max
        payload.stats.LHSweight.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_WEIGHT_MIN_ANALOG") {
        reg_offset_6000 = 62
        reg_write_value = b
        c = payload.stats.LHSweight.analog_min
        payload.stats.LHSweight.analog_min = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_WEIGHT_MAX") {
        reg_offset_6000 = 63
        reg_write_value = b
        c = payload.stats.LHSweight.weight_max
        payload.stats.LHSweight.weight_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_WEIGHT_MIN") {
        reg_offset_6000 = 64
        reg_write_value = b
        c = payload.stats.LHSweight.weight_min
        payload.stats.LHSweight.weight_min = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_WEIGHT_MAX_ANALOG") {
        reg_offset_6000 = 65
        reg_write_value = b
        c = payload.stats.RHSweight.analog_max
        payload.stats.RHSweight.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_WEIGHT_MIN_ANALOG") {
        reg_offset_6000 = 66
        reg_write_value = b
        c = payload.stats.RHSweight.analog_max
        payload.stats.RHSweight.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_WEIGHT_MAX") {
        reg_offset_6000 = 67
        reg_write_value = b
        c = payload.stats.RHSweight.weight_max
        payload.stats.RHSweight.weight_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_WEIGHT_MIN") {
        reg_offset_6000 = 68
        reg_write_value = b
        c = payload.stats.RHSweight.weight_max
        payload.stats.RHSweight.weight_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_THICKNESS_MAX_ANALOG") {
        reg_offset_6000 = 69
        reg_write_value = b
        c = payload.stats.LHSthickness.analog_max
        payload.stats.LHSthickness.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_THICKNESS_MIN_ANALOG") {
        reg_offset_6000 = 70
        reg_write_value = b
        c = payload.stats.LHSthickness.analog_max
        payload.stats.LHSthickness.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_THICKNESS_MAX") {
        reg_offset_6000 = 71
        reg_write_value = b
        c = payload.stats.LHSthickness.thickness_max
        payload.stats.LHSthickness.thickness_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_THICKNESS_MIN") {
        reg_offset_6000 = 72
        reg_write_value = b
        c = payload.stats.LHSthickness.thickness_min
        payload.stats.LHSthickness.thickness_min = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_THICKNESS_MAX_ANALOG") {
        reg_offset_6000 = 73
        reg_write_value = b
        c = payload.stats.RHSthickness.analog_max
        payload.stats.RHSthickness.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_THICKNESS_MIN_ANALOG") {
        reg_offset_6000 = 74
        reg_write_value = b
        c = payload.stats.RHSthickness.analog_min
        payload.stats.RHSthickness.analog_min = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_THICKNESS_MAX") {
        reg_offset_6000 = 75
        reg_write_value = b
        c = payload.stats.RHSthickness.thickness_max
        payload.stats.RHSthickness.thickness_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_THICKNESS_MIN") {
        reg_offset_6000 = 76
        reg_write_value = b
        c = payload.stats.RHSthickness.thickness_min
        payload.stats.RHSthickness.thickness_min = b;
        write_regs()
        writelog()
    }
    else if (a == "TURRET_MAX_RPM") {
        reg_offset_6000 = 80
        reg_write_value = b
        c = payload.stats.turret.max_rpm
        payload.stats.turret.max_rpm = b;
        write_regs()
        writelog()
    }
    else if (a == "TURRET_MAX_FREQ") {
        reg_offset_6000 = 81
        reg_write_value = b
        c = payload.stats.turret.max_freq
        payload.stats.turret.max_freq = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_FORCE_FEEDER_MAX_RPM") {
        reg_offset_6000 = 82
        reg_write_value = b
        c = payload.stats.LHS_FF.max_rpm
        payload.stats.LHS_FF.max_rpm = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_FORCE_FEEDER_MAX_FREQ") {
        reg_offset_6000 = 83
        reg_write_value = b
        c = payload.stats.LHS_FF.max_freq
        payload.stats.LHS_FF.max_freq = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_FORCE_FEEDER_MAX_RPM") {
        reg_offset_6000 = 84
        reg_write_value = b
        c = payload.stats.RHS_FF.max_rpm
        payload.stats.RHS_FF.max_rpm = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_FORCE_FEEDER_MAX_FREQ") {
        reg_offset_6000 = 85
        reg_write_value = b
        c = payload.stats.RHS_FF.max_freq
        payload.stats.RHS_FF.max_freq = b;
        write_regs()
        writelog()
    }
    else if (a == "HYDRAULIC_PRESSURE_MAX") {
        reg_offset_6000 = 86
        reg_write_value = b
        c = payload.stats.hydraulic.high_cutoff
        payload.stats.hydraulic.high_cutoff = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_PRE_OFFSET") {
        reg_offset_6000 = 90
        reg_write_value = b
        c = payload.stats.punch_offset_position.L_PRE
        payload.stats.punch_offset_position.L_PRE = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_MAIN_OFFSET") {
        reg_offset_6000 = 91
        reg_write_value = b
        c = payload.stats.punch_offset_position.L_MAIN
        payload.stats.punch_offset_position.L_MAIN = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_EJN_OFFSET") {
        reg_offset_6000 = 92
        reg_write_value = b
        c = payload.stats.punch_offset_position.L_EJN
        payload.stats.punch_offset_position.L_EJN = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_PRE_OFFSET") {
        reg_offset_6000 = 93
        reg_write_value = b
        c = payload.stats.punch_offset_position.R_PRE
        payload.stats.punch_offset_position.R_PRE = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_MAIN_OFFSET") {
        reg_offset_6000 = 94
        reg_write_value = b
        c = payload.stats.punch_offset_position.R_MAIN
        payload.stats.punch_offset_position.R_MAIN = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_EJN_OFFSET") {
        reg_offset_6000 = 95
        reg_write_value = b
        c = payload.stats.punch_offset_position.R_EJN
        payload.stats.punch_offset_position.R_EJN = b;
        write_regs()
        writelog()
    }
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json({ message: `[ UPDATED ${a} to ${b} ]` });
});

// Start Server
const port = 3128;
app.listen(port, () => console.log(`Server running on port ${port} 👑`));