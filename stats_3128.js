var ModbusRTU = require("modbus-serial");
const { exec } = require('child_process');
const restart1Command = "pm2 restart 1"

// Express
const express = require("express");
const app = express();
var cors = require('cors')
app.use(cors({ origin: "*" }));
const host = "localhost"

// Influx
const Influx = require('influxdb-nodejs');
const { setInterval } = require('timers');
const _new = new Influx(`http://${host}:8086/new`);
const _perm  = new Influx(`http://${host}:8086/perm`);

// Fetch
const fetch = require('cross-fetch'); // To get operator and batch details for logging
const { connected } = require("process");
const { response } = require("express");

// Modbus 
const coil_410 = 410;
const coil_470 = 470;
const coil_500 = 500;
const coil_7900 = 7900;

const time_address = 100;
const reg_6000 = 6000;
const reg_7000 = 7000;
const reg_5000 = 5000;

var CODE_INIT = "State init";
var mbsState = CODE_INIT;

var client = new ModbusRTU();
const slaveID = 1;
const ip = "192.168.1.5"
// const ip = "192.168.0.99"
var mbsTimeout = 1000;
var mbsScan = 100; // Modbus scan time

var GOOD_CONNECT = "GOOD_CONNECT";
var FAILED_CONNECT = "FAILED_CONNECT";
var PASS_READ_TIME = "PASS_READ_TIME"
var FAIL_READ_TIME = "FAIL_READ_TIME"

var PASS_READ_COILS = "PASS_READ_COILS";
var PASS_WRITE_COIL = "PASS_WRITE_COIL";
var FAIL_WRITE_COIL = "FAIL_WRITE_COIL";

var PASS_READ_REGS = "PASS_READ_REGS"
var PASS_REGS_WRITE = "PASS_REGS_WRITE";
var FAIL_REGS_WRITE = "FAIL_REGS_WRITE";

let readfailed = 0;
let failrestart = 50;

let timecheck = 3;
let timetemp = 0;

var batchinfo = {
    name: '',
    operator: '',
    rotation: ''
}

var payload = {
    mbstatus: '',
    connection: '',
    batch: "",
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
        operator: 'Not Set',
        set_force_mono_upper: 0,
        set_force_mono_lower: 0,
        set_force_LHS_upper: 0,
        set_force_LHS_lower: 0,
        set_force_RHS_upper: 0,
        set_force_RHS_lower: 0,
        safety_high_LHS  : 0,
        safety_high_RHS : 0,
        rejn_high_LHS : 0,
        rejn_high_RHS : 0,
        awc_high_LHS : 0,
        awc_high_RHS : 0,
        set_force_LHS : 0,
        set_force_RHS : 0,
        awc_low_LHS : 0,
        awc_low_RHS : 0,
        rej_low_LHS : 0,
        rej_low_RHS : 0,
        safety_low_LHS : 0,
        safety_low_RHS : 0,
    },
    stats: {
        count: 0,
        tablets_per_hour: 0,
        fault_active_flash: 0,
        TABLET_MULTIPLICATION_FACTOR:0,
        SAFETY_MULTIPLICATION_FACTOR:0,
        MACHINE_STOP_DELAY: 0,
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
            analog: 0,
            analog_max: 0,
            analog_min: 0,
            weight_max: 0,
            weight_min: 0,
        },
        RHSweight: {
            value: 0,
            analog: 0,
            analog_max: 0,
            analog_min: 0,
            weight_max: 0,
            weight_min: 0,
        },
        LHSthickness: {
            value: 0,
            analog: 0,
            analog_max: 0,
            analog_min: 0,
            thickness_max: 0,
            thickness_min: 0,
        },
        RHSthickness: {
            value: 0,
            analog: 0,
            analog_max: 0,
            analog_min: 0,
            thickness_max: 0,
            thickness_min: 0,
        },
        home: {
            LHS: {
                single_turn: 0,
                multi_turn: 0,
                encoder_ppr: 0,
                home_offset: 0
            },
            RHS: {
                single_turn: 0,
                multi_turn: 0,
                encoder_ppr: 0,
                home_offset: 0
            }
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
            Actual_RHS: 0,
            MAXIMUM_REJECT_TABLET: 0,
            RTN_1_MM: 0,
            RTN_1_PPR: 0,
            RHS_HOME_OFFSET_1: 0,
            RHS_HOME_OFFSET_2: 0,
            LHS_HOME_OFFSET_1: 0,
            LHS_HOME_OFFSET_2: 0,
        },
        sampling: {
            NO_TABLET_SAMPLING: 0,
            SAMPLING_TIME_MINS: 0,
            SAMPLE_COUNT: 0
        },
        roller: {
            F: 0,
            H: 0,
            A: 0,
            frequency: 0,
            amp: 0,
            motor: 0  
        },
        active_punches: 0,
        dwell: 0,
        B_HEAD: 0,
        B_PCD: 0,
        D_HEAD: 0,
        D_PCD: 0,
        Z_PHASE_COUNT: 0,
        Z_PHASE_COUNTER: 0,
        SERVO_RHS_UPPERLIMIT: 0,
        SERVO_RHS_LOWERLIMIT: 0,
        SERVO_LHS_UPPERLIMIT: 0,
        SERVO_LHS_LOWERLIMIT: 0,
        total_punches: 0,
        encoder_PPR: 0,
        punch_offset_position: {
            L_PRE: 0,
            L_MAIN: 0,
            L_EJN: 0,
            R_PRE: 0,
            R_MAIN: 0,
            R_EJN: 0,
            L_AIR_MONO: 0,
            L_FLAP_MONO: 0,
            R_AIR_MONO: 0,
            R_FLAP_MONO: 0,
            L_AIR_BI: 0,
            L_FLAP_BI: 0,
            R_AIR_BI: 0,
            R_FLAP_BI: 0,

        },
        rejection: {
            pulse: {
                L_AIR_ON: 0,
                L_AIR_OFF: 0,
                L_FLAP_ON: 0,
                L_FLAP_OFF: 0,
                R_AIR_ON: 0,
                R_AIR_OFF: 0,
                R_FLAP_ON: 0,
                R_FLAP_OFF: 0,
            },
            air: {
                L_AIR_OFF_TIME: 0,       
                L_FLAP_OFF_TIME: 0,                 
                R_AIR_OFF_TIME: 0,       
                R_FLAP_OFF_TIME: 0
            }
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
        PRESSURE_SET_BUTTON: '',
        MACHINE_INCHING_BUTTON: '',
        MACHINE_START_BUTTON: '',
        MACHINE_STOP_BUTTON: '',
        FORCE_FEEDER_START_BUTTON: '',
        FORCE_FEEDER_STOP_BUTTON: '',
        TABLET_COUNT_RESET    : '',
        Z_PHASE_COUNT_RESET    : '',
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
        INITIAL_REJECTION: '',
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
        RHS_SERVO_ON: '',
        RHS_MULTI_TURN_CLEAR: '',
        RHS_HOME_OFFSET_WRITE: '',
        RHS_EEPROM_WRITE: '',
        LHS_SERVO_ON: '',
        LHS_MULTI_TURN_CLEAR: '',
        LHS_HOME_OFFSET_WRITE: '',
        LHS_EEPROM_WRITE: '',
        FORCE_OVERRIDE: '',
        SERVO_CALIBRATION_MODE: '',
        LHS_PRE_DISABLE: '',
        LHS_MAIN_DISABLE: '',
        RHS_PRE_DISABLE: '',
        RHS_MAIN_DISABLE: '',
        TRIAL_PRODUCTION: ''
    },
    alarm:{
        EMERGENCY_STOP_PRESSED: '',
        MAIN_MOTOR_TRIPPED: '',
        LHS_FORCE_FEEDER_MOTOR_TRIPPED: '',
        RHS_FORCE_FEEDER_MOTOR_TRIPPED: '',
        POWER_PACK_TRIP: '',
        LUBOIL_LEVEL_LOW: '',
        LHS_MCM_ABOVE_TOL_LIMIT: '',
        LHS_MCM_BELOW_TOL_LIMIT: '',
        RHS_MCM_ABOVE_TOL_LIMIT: '',
        RHS_MCM_BELOW_TOL_LIMIT: '',
        SYSTEM_OVERLOAD: '',
        SAFETY_GUARD_OPEN: '',
        HYDRAULIC_HIGH_PRESSURE: '',
        LHS_POWDER_LEVEL_LOW: '',
        RHS_POWDER_LEVEL_LOW: '',
        LUB_PUMP_FAILS: '',
        ROLLER_VFD_TRIP: '',
        SINGLE_PHASE_FAILURE: '',
        RHS_DISCHARGE_AWC_TRIP: '',
        LHS_DISCHARGE_AWC_TRIP: '',
        AWC_OVER_LIMIT: '',
        MAX_TABLET_REJECTED: '',
        MACHINE_HEALTHY: '',
        POWERPACK: '',
        DOZER_LHS: '',
        DOZER_RHS: '',
        set_force_LHS_overlimit: '', // Pre 
        set_force_RHS_overlimit: '' // Main
    },
    status: {
        data: []
    }
};

function _2x16bitTo32bit(reg1, reg2, divider) {
    let integer
    divider = divider || 1;

    reg2 == 0 ? integer = reg1 / divider : integer = (((2 ** 16) * reg2) + reg1) / divider;

    return integer
}

function signedDecToDec(integer, nbit) {

    let result
    function uintToInt(uint, nbit) {
        nbit = +nbit || 32;
        if (nbit > 32) throw new RangeError('uintToInt only supports ints up to 32 bits');
        uint <<= 32 - nbit;
        uint >>= 32 - nbit;
        return uint;
    }

    integer < (2 ** 16) ? result = integer : result = uintToInt(integer, nbit)

    return result
}

function signedDecto2x16bitArray(value, bitCount) {
    let binaryStr;
    bitCount = bitCount || 32;

    if (value >= 0) {
        let twosComp = value.toString(2);
        binaryStr = padAndChop(twosComp, '0', (bitCount || twosComp.length));
    } else {
        binaryStr = (Math.pow(2, bitCount) + value).toString(2);

        if (Number(binaryStr) < 0) {
            return undefined
        }
    }

    var digit = parseInt(binaryStr, 2);

    // console.log(digit)

    var reg2 = parseInt(digit / (2 ** 16))
    var reg1 = digit - ((2 ** 16) * reg2)

    return [reg1, reg2];
}

function padAndChop(str, padChar, length) {
    return (Array(length).fill(padChar).join('') + str).slice(length * -1);
}

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
            payload.connection = true
            mbsState = GOOD_CONNECT;
            console.log(`[ CONNECTED ]`)
        })
        .then(function () {
            runModbus()
        })
        .catch(function (e) {
            payload.connection = false
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
  
    if (readfailed > failrestart) {
            payload.mbstatus = false;
        } else {
            payload.mbstatus = true;
    }

    if (nextAction !== undefined) {
        nextAction();
    } else {
        read_regs();
    }

    // set for next run
    setTimeout(runModbus, mbsScan);
}

function writealarm(param, value) {
    
    _new.write(`${batchinfo.name}.alarm`)
        .tag({
        })
        .field({
            operator: batchinfo.operator,  // 2
            parameter: param,  // 2
            value: value,  // 2
        })
        .then(() => console.info(`[ ALARM ENTRY DONE ${param} ${value} ]`))
        .catch(console.error);
}

var read_coils = function () {
    mbsState = PASS_READ_COILS;

    client.readCoils(coil_410, 31)
        .then(function (stats_data) {
            // console.log("STATS: ",stats_data.data)

            payload.button.POWER_PACK_START_BUTTON = stats_data.data[0],
            payload.button.POWER_PACK_STOP_BUTTON = stats_data.data[1],
            payload.button.PRESSURE_ACK_BUTTON = stats_data.data[2],
            payload.button.DRAIN_BUTTON = stats_data.data[3],
            payload.button.PRESSURE_SET_BUTTON = stats_data.data[4],
            payload.button.SERVO_CALIBRATION_MODE = stats_data.data[7],

            payload.button.MACHINE_INCHING_BUTTON = stats_data.data[10],
            payload.button.MACHINE_START_BUTTON = stats_data.data[15],
            payload.button.MACHINE_STOP_BUTTON = stats_data.data[16],
            
            payload.button.FORCE_FEEDER_START_BUTTON = stats_data.data[18],
            payload.button.FORCE_FEEDER_STOP_BUTTON = stats_data.data[19],

            payload.button.TABLET_COUNT_RESET = stats_data.data[20],
            payload.button.Z_PHASE_COUNT_RESET = stats_data.data[21],

            payload.button.ROLLER_FORWARD = stats_data.data[25],
            payload.button.ROLLER_REVERSE = stats_data.data[26],

            payload.button.MANUAL_SAMPLE = stats_data.data[28],
            payload.button.FIRST_LAYER_SAMPLING = stats_data.data[30]

        })
        .catch(function (e) {
            console.error('[ coil_410 Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
    
    client.readCoils(coil_470, 32)
        .then(function (stats_data) {
            // console.log("STATS: ",stats_data.data)

            writelogg = (param, value) => {
                var oldv
                var newv
                value == true ? oldv = 0 : newv
                value == true ? newv = 1 : newv
                value == false ? oldv = 1 : newv
                value == false ? newv = 0 : newv
                
                _new.write(`${batchinfo.name}.operationlogs`)
                    .tag({
                    })
                    .field({
                        operator: batchinfo.operator,  // 2
                        parameter: param,  // 2
                        oldvalue: Number(oldv),  // 2
                        newvalue: Number(newv),  // 2
                    })
                    .then(() => console.info(`[ LOG ENTRY DONE ${batchinfo.name} ]`))
                    .catch(console.error);
            }

            writecorrection = (param, oldv, newv) => {
                
                _new.write(`${batchinfo.name}.operationlogs`)
                    .tag({
                    })
                    .field({
                        operator: batchinfo.operator,  // 2
                        parameter: param,  // 2
                        oldvalue: Number(oldv),  // 2
                        newvalue: Number(newv),  // 2
                    })
                    .then(() => console.info(`[ LOG ENTRY DONE ${batchinfo.name} ]`))
                    .catch(console.error);
            }

            var L_pre_correction 
            var L_post_correction 
            
            var R_pre_correction
            var R_post_correction 

            if (batchinfo.name !== '') {
            
                if (stats_data.data[0] === true && payload.alarm.EMERGENCY_STOP_PRESSED === '') {
                    writealarm("EMERGENCY BUTTON", true)
                    payload.alarm.EMERGENCY_STOP_PRESSED = 'ACTIVE'
                }
                if (stats_data.data[1] === true && payload.alarm.MAIN_MOTOR_TRIPPED === '') {
                    writealarm("MAIN MOTOR", true)
                    payload.alarm.MAIN_MOTOR_TRIPPED = 'ACTIVE'
                }
                if (stats_data.data[2] === true && payload.alarm.LHS_FORCE_FEEDER_MOTOR_TRIPPED == '') {
                    writealarm("LHS FORCE FEEDER MOTOR", true)
                    payload.alarm.LHS_FORCE_FEEDER_MOTOR_TRIPPED = 'ACTIVE'
                }
                if (stats_data.data[3] === true && payload.alarm.RHS_FORCE_FEEDER_MOTOR_TRIPPED == '') {
                    payload.alarm.RHS_FORCE_FEEDER_MOTOR_TRIPPED = 'ACTIVE'
                    writealarm("RHS FORCE FEEDER MOTOR", true)
                }
                if (stats_data.data[4] === true && payload.alarm.POWER_PACK_TRIP === '' ) {
                    payload.alarm.POWER_PACK_TRIP = 'ACTIVE'
                    writealarm("POWER PACK", true)
                }
                if (stats_data.data[5] === true && payload.alarm.LUBOIL_LEVEL_LOW == '' ) {
                    writealarm("LUBRICATION OIL LOW LEVEL", true)
                    payload.alarm.LUBOIL_LEVEL_LOW = 'ACTIVE'
                }
                if (stats_data.data[8] === true && payload.alarm.LHS_MCM_ABOVE_TOL_LIMIT == '') {
                    writealarm("LHS MAIN COMP ABOVE TOL", true)
                    payload.alarm.LHS_MCM_ABOVE_TOL_LIMIT = 'ACTIVE'
                }
                if (stats_data.data[9] === true && payload.alarm.LHS_MCM_BELOW_TOL_LIMIT == '') {
                    writealarm("LHS MAIN COMP BELOW TOL", true)
                    payload.alarm.LHS_MCM_BELOW_TOL_LIMIT = 'ACTIVE'
                }
                if (stats_data.data[12] === true && payload.alarm.RHS_MCM_ABOVE_TOL_LIMIT == '') {
                    writealarm("RHS MAIN COMP ABOVE TOL", true)
                    payload.alarm.RHS_MCM_ABOVE_TOL_LIMIT = 'ACTIVE'
                }
                if (stats_data.data[13] === true && payload.alarm.RHS_MCM_BELOW_TOL_LIMIT == '') {
                    writealarm("RHS MAIN COMP BELOW TOL", true)
                    payload.alarm.RHS_MCM_BELOW_TOL_LIMIT = 'ACTIVE'
                }
                if (stats_data.data[14] === true && payload.alarm.SYSTEM_OVERLOAD == '') {
                    writealarm("SYSTEM OVERLOAD", true)
                    payload.alarm.SYSTEM_OVERLOAD = 'ACTIVE'
                }
                if (stats_data.data[15] === true && payload.alarm.SAFETY_GUARD_OPEN == '') {
                    writealarm("SAFETY GUARD OPEN", true)
                    payload.alarm.SAFETY_GUARD_OPEN = 'ACTIVE'
                }
                if (stats_data.data[16] === true && payload.alarm.HYDRAULIC_HIGH_PRESSURE == '') {
                    writealarm("HYDRAULIC HIGH PRESSURE", true)
                    payload.alarm.HYDRAULIC_HIGH_PRESSURE = 'ACTIVE'
                }
                if (stats_data.data[17] === true && payload.alarm.LHS_POWDER_LEVEL_LOW == '') {
                    writealarm("LHS POWDER LEVEL LOW", true)
                    payload.alarm.LHS_POWDER_LEVEL_LOW = 'ACTIVE'
                }
                if (stats_data.data[18] === true && payload.alarm.RHS_POWDER_LEVEL_LOW == '') {
                    writealarm("RHS POWDER LEVEL LOW", true)
                    payload.alarm.RHS_POWDER_LEVEL_LOW = 'ACTIVE'
                }
                if (stats_data.data[19] === true && payload.alarm.LUB_PUMP_FAILS == '') {
                    writealarm("LUBRICATION PUMP", true)
                    payload.alarm.LUB_PUMP_FAILS = 'ACTIVE'
                }
                if (stats_data.data[20] === true && payload.alarm.ROLLER_VFD_TRIP == '') {
                    writealarm("ROLLER VFD TRIP", true)
                    payload.alarm.ROLLER_VFD_TRIP = 'ACTIVE'
                }
                if (stats_data.data[21] === true && payload.alarm.SINGLE_PHASE_FAILURE == '') {
                    writealarm("SINGLE PHASE FAILURE", true)
                    payload.alarm.SINGLE_PHASE_FAILURE = 'ACTIVE'
                }
                if (stats_data.data[22] === true && payload.alarm.RHS_DISCHARGE_AWC_TRIP == '') {
                    writealarm("RHS DISCHARGE AWC", true)
                    payload.alarm.RHS_DISCHARGE_AWC_TRIP = 'ACTIVE'
                }
                if (stats_data.data[23] === true && payload.alarm.LHS_DISCHARGE_AWC_TRIP == '') {
                    writealarm("LHS DISCHARGE AWC", true)
                    payload.alarm.LHS_DISCHARGE_AWC_TRIP = 'ACTIVE'
                }
                if (stats_data.data[24] === true && payload.alarm.AWC_OVER_LIMIT == '') {
                    writealarm("AWC OVER LIMIT", true)
                    payload.alarm.AWC_OVER_LIMIT = 'ACTIVE'
                }
                if (stats_data.data[25] === true && payload.alarm.MAX_TABLET_REJECTED === '') {
                    writealarm("MAX TABLET REJECTED", true)
                    payload.alarm.MAX_TABLET_REJECTED = 'ACTIVE'
                }
                if (stats_data.data[26] === true && payload.alarm.POWERPACK === '') {
                    writelogg("POWERPACK", true)
                    payload.alarm.POWERPACK = 'ACTIVE'
                }
                if (stats_data.data[27] === true && payload.alarm.DOZER_LHS === '') {
                    payload.alarm.DOZER_LHS = 'ACTIVE'
                    L_pre_correction = payload.machine.LHS.dozer_position
                    
                }
                if (stats_data.data[28] === true && payload.alarm.DOZER_RHS === '') {
                    payload.alarm.DOZER_RHS = 'ACTIVE'
                    R_pre_correction = payload.machine.RHS.dozer_position
                }
                if (stats_data.data[7] === true && payload.alarm.set_force_LHS_overlimit === '') {
                    writealarm("Set Force Pre Out of range", true)
                    payload.alarm.set_force_LHS_overlimit = 'ACTIVE' // pre
                }
                if (stats_data.data[8] === true && payload.alarm.set_force_RHS_overlimit === '') {
                    writealarm("Set Force Main Out of range", true)
                    payload.alarm.set_force_RHS_overlimit = 'ACTIVE' // Main
                }
                
                if (stats_data.data[0] === false && payload.alarm.EMERGENCY_STOP_PRESSED === 'ACTIVE') {
                    writealarm("EMERGENCY BUTTON", false)
                    payload.alarm.EMERGENCY_STOP_PRESSED = ''
                }
                if (stats_data.data[1] === false && payload.alarm.MAIN_MOTOR_TRIPPED == 'ACTIVE') {
                    writealarm("MAIN MOTOR", false)
                    payload.alarm.MAIN_MOTOR_TRIPPED = ''
                }
                if (stats_data.data[2] === false && payload.alarm.LHS_FORCE_FEEDER_MOTOR_TRIPPED == 'ACTIVE') {
                    writealarm("LHS FORCE FEEDER MOTOR", false)
                    payload.alarm.LHS_FORCE_FEEDER_MOTOR_TRIPPED = ''
                }
                if (stats_data.data[3] === false && payload.alarm.RHS_FORCE_FEEDER_MOTOR_TRIPPED == 'ACTIVE') {
                    writealarm("RHS FORCE FEEDER MOTOR", false)
                    payload.alarm.RHS_FORCE_FEEDER_MOTOR_TRIPPED = ''
                }
                if (stats_data.data[4] === false && payload.alarm.POWER_PACK_TRIP == 'ACTIVE') {
                    writealarm("POWER PACK", false)
                    payload.alarm.POWER_PACK_TRIP = ''
                }
                if (stats_data.data[5] === false && payload.alarm.LUBOIL_LEVEL_LOW == 'ACTIVE' ) {
                    writealarm("LUBRICATION OIL LOW LEVEL", false)
                    payload.alarm.LUBOIL_LEVEL_LOW = ''
                }
                if (stats_data.data[8] === false && payload.alarm.LHS_MCM_ABOVE_TOL_LIMIT == 'ACTIVE') {
                    writealarm("LHS MAIN COMP ABOVE TOL", false)
                    payload.alarm.LHS_MCM_ABOVE_TOL_LIMIT = ''
                }
                if (stats_data.data[9] === false && payload.alarm.LHS_MCM_BELOW_TOL_LIMIT == 'ACTIVE') {
                    writealarm("LHS MAIN COMP BELOW TOL", false)
                    payload.alarm.LHS_MCM_BELOW_TOL_LIMIT = ''
                }
                if (stats_data.data[12] === false && payload.alarm.RHS_MCM_ABOVE_TOL_LIMIT == 'ACTIVE') {
                    writealarm("RHS MAIN COMP ABOVE TOL", false)
                    payload.alarm.RHS_MCM_ABOVE_TOL_LIMIT = ''
                }
                if (stats_data.data[13] === false && payload.alarm.RHS_MCM_BELOW_TOL_LIMIT == 'ACTIVE') {
                    writealarm("RHS MAIN COMP BELOW TOL", false)
                    payload.alarm.RHS_MCM_BELOW_TOL_LIMIT = ''
                }
                if (stats_data.data[14] === false && payload.alarm.SYSTEM_OVERLOAD == 'ACTIVE') {
                    writealarm("SYSTEM OVERLOAD", false)
                    payload.alarm.SYSTEM_OVERLOAD = ''
                }
                if (stats_data.data[15] === false && payload.alarm.SAFETY_GUARD_OPEN == 'ACTIVE') {
                    writealarm("SAFETY GUARD OPEN", false)
                    payload.alarm.SAFETY_GUARD_OPEN = ''
                }
                if (stats_data.data[16] === false && payload.alarm.HYDRAULIC_HIGH_PRESSURE == 'ACTIVE') {
                    writealarm("HYDRAULIC HIGH PRESSURE", false)
                    payload.alarm.HYDRAULIC_HIGH_PRESSURE = ''
                }
                if (stats_data.data[17] === false && payload.alarm.LHS_POWDER_LEVEL_LOW == 'ACTIVE') {
                    writealarm("LHS POWDER LEVEL LOW", false)
                    payload.alarm.LHS_POWDER_LEVEL_LOW = ''
                }
                if (stats_data.data[18] === false && payload.alarm.RHS_POWDER_LEVEL_LOW == 'ACTIVE') {
                    writealarm("RHS POWDER LEVEL LOW", false)
                    payload.alarm.RHS_POWDER_LEVEL_LOW = ''
                }
                if (stats_data.data[19] === false && payload.alarm.LUB_PUMP_FAILS == 'ACTIVE') {
                    writealarm("LUBRICATION PUMP", false)
                    payload.alarm.LUB_PUMP_FAILS = ''
                }
                if (stats_data.data[20] === false && payload.alarm.ROLLER_VFD_TRIP == 'ACTIVE') {
                    writealarm("ROLLER VFD TRIP", false)
                    payload.alarm.ROLLER_VFD_TRIP = ''
                }
                if (stats_data.data[21] === false && payload.alarm.SINGLE_PHASE_FAILURE == 'ACTIVE') {
                    writealarm("SINGLE PHASE FAILURE", false)
                    payload.alarm.SINGLE_PHASE_FAILURE = ''
                }
                if (stats_data.data[22] === false && payload.alarm.RHS_DISCHARGE_AWC_TRIP == 'ACTIVE') {
                    writealarm("RHS DISCHARGE AWC", false)
                    payload.alarm.RHS_DISCHARGE_AWC_TRIP = ''
                }
                if (stats_data.data[23] === false && payload.alarm.LHS_DISCHARGE_AWC_TRIP == 'ACTIVE') {
                    writealarm("LHS DISCHARGE AWC", false)
                    payload.alarm.LHS_DISCHARGE_AWC_TRIP = ''
                }
                if (stats_data.data[24] === false && payload.alarm.AWC_OVER_LIMIT == 'ACTIVE') {
                    writealarm("AWC OVER LIMIT", false)
                    payload.alarm.AWC_OVER_LIMIT = ''
                }
                if (stats_data.data[25] === false && payload.alarm.MAX_TABLET_REJECTED == 'ACTIVE') {
                    writealarm("MAX TABLET REJECTED", false)
                    payload.alarm.MAX_TABLET_REJECTED = ''
                }
                if (stats_data.data[26] === false && payload.alarm.POWERPACK == 'ACTIVE') {
                    writelogg("POWER PACK", false)
                    payload.alarm.POWERPACK = ''
                }
                if (stats_data.data[27] === false && payload.alarm.DOZER_LHS == 'ACTIVE') {
                    payload.alarm.DOZER_LHS = ''
                    L_post_correction = payload.machine.LHS.dozer_position                        
                    writecorrection("DOZER LHS CORRECTION", L_pre_correction, L_post_correction)
                }
                if (stats_data.data[28] === false && payload.alarm.DOZER_RHS == 'ACTIVE') {
                    payload.alarm.DOZER_RHS = ''
                    R_post_correction = payload.machine.RHS.dozer_position
                    writecorrection("DOZER RHS CORRECTION", R_pre_correction, R_post_correction)
                }
                if (stats_data.data[6] === false && payload.alarm.set_force_LHS_overlimit === 'ACTIVE') {
                    writealarm("Set Force Pre Out of range", false)
                    payload.alarm.set_force_LHS_overlimit = '' // Pre 
                }
                if (stats_data.data[7] === false && payload.alarm.set_force_RHS_overlimit === 'ACTIVE') {
                    writealarm("Set Force Main Out of range", false)
                    payload.alarm.set_force_RHS_overlimit = '' // Main
                }

            }
            
        })
        .catch(function (e) {
            console.error('[ coil_470 Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
    
    client.readCoils(coil_7900, 100)
        .then(function (data) {
            // console.log("STATS: ",stats_data.data)

            payload.button.maintainence = data.data
        })
        .catch(function (e) {
            console.error('[ coil_7900 Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })

    client.readCoils(coil_500, 95)
        .then(function (data) {
            // console.log("coil_500: ", data.data)
            payload.button.DIRECT__RAMP = data.data[0]
            payload.button.WITH_DOOR__BYPASS = data.data[2]
            payload.button.INITIAL_REJECTION = data.data[6]
            payload.button.B_TYPE__D_TYPE = data.data[8]
            payload.button.POWDER_SENSOR_ENABLE = data.data[10]
            payload.button.Z_PHASE_SELECTION = data.data[11]
            payload.button.AUTO_SAMPLING = data.data[13]
            payload.button.REJECTION_BUTTON_HMI = data.data[14]
            payload.button.REJN_AIR_FLAP = data.data[15]
            payload.button.MONO_BI = data.data[16]
            payload.button.REJECTION_MODE = data.data[17]
            payload.button.AWC_ENABLE = data.data[20]
            payload.button.LHS_FORCE_FEEDER_BUTTON_HMI = data.data[21]
            payload.button.RHS_FORCE_FEEDER_BUTTON_HMI = data.data[22]
            payload.button.RHS_WEIGHT_INC = data.data[23]
            payload.button.RHS_WEIGHT_DEC = data.data[24]
            payload.button.LHS_WEIGHT_INC = data.data[25]
            payload.button.LHS_WEIGHT_DEC = data.data[26]
            payload.button.RHS_SERVO_ON = data.data[27]
            payload.button.RHS_MULTI_TURN_CLEAR = data.data[28]
            payload.button.RHS_HOME_OFFSET_WRITE = data.data[29]
            payload.button.RHS_EEPROM_WRITE = data.data[30]
            payload.button.LHS_SERVO_ON = data.data[31]
            payload.button.LHS_MULTI_TURN_CLEAR = data.data[32]
            payload.button.LHS_HOME_OFFSET_WRITE = data.data[33]
            payload.button.LHS_EEPROM_WRITE = data.data[34]
            payload.button.FORCE_OVERRIDE = data.data[35]
            payload.button.LHS_PRE_DISABLE = data.data[90]
            payload.button.LHS_MAIN_DISABLE = data.data[91]
            payload.button.RHS_PRE_DISABLE = data.data[92]
            payload.button.RHS_MAIN_DISABLE = data.data[93]
            payload.button.TRIAL_PRODUCTION = data.data[94]
            
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ coil_500 Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })

}

var read_regs = function () {
    mbsState = PASS_READ_REGS;

    client.readHoldingRegisters(reg_6000, 85)
        .then(function (data) {
            // console.log("STATS: ",data)
            // New stats! 
            payload.stats.turret.RPM = data.data[0],
            payload.stats.LHS_FF.RPM = data.data[1],
            payload.stats.RHS_FF.RPM = data.data[2],
            payload.stats.FF_MODE = data.data[3],
            payload.stats.lubrication.set_delay_min = data.data[4],
            payload.stats.lubrication.set_delay_sec = data.data[5]/10,
            payload.stats.pressure.pressure_set = data.data[7],
            payload.stats.hydraulic.high_cutoff = data.data[8]
            payload.stats.hydraulic.low_cutoff = data.data[9]

            // // Compression Limits
            payload.machine.LHS.precompression_upperlimit = data.data[10] / 100;
            payload.machine.LHS.precompression_lowerlimit = data.data[11] / 100;
            payload.machine.LHS.maincompression_upperlimit = data.data[12] / 100;
            payload.machine.LHS.maincompression_lowerlimit = data.data[13] / 100;
            payload.machine.LHS.ejection_upperlimit = data.data[14] / 100;
            payload.machine.LHS.ejection_lowerlimit = data.data[15] / 100;

            payload.machine.RHS.precompression_upperlimit = data.data[16] / 100;
            payload.machine.RHS.precompression_lowerlimit = data.data[17] / 100;
            payload.machine.RHS.maincompression_upperlimit = data.data[18] / 100;
            payload.machine.RHS.maincompression_lowerlimit = data.data[19] / 100;
            payload.machine.RHS.ejection_upperlimit = data.data[20] / 100;
            payload.machine.RHS.ejection_lowerlimit = data.data[21] / 100;

            payload.machine.LHS.pre_forceline = data.data[22] / 100;
            payload.machine.LHS.main_forceline = data.data[23] / 100;
            payload.machine.LHS.ejn_forceline = data.data[24] / 100;

            payload.machine.RHS.pre_forceline = data.data[25] / 100;
            payload.machine.RHS.main_forceline = data.data[26] / 100;
            payload.machine.RHS.ejn_forceline = data.data[27] / 100;

            payload.stats.awc.L_precompression_upperlimit = data.data[28] / 100;
            payload.stats.awc.L_precompression_lowerlimit = data.data[29] / 100;
            payload.stats.awc.L_maincompression_upperlimit = data.data[30] / 100;
            payload.stats.awc.L_maincompression_lowerlimit = data.data[31] / 100;
            payload.stats.awc.R_precompression_upperlimit = data.data[32] / 100;
            payload.stats.awc.R_precompression_lowerlimit = data.data[33] / 100;
            payload.stats.awc.R_maincompression_upperlimit = data.data[34] / 100;
            payload.stats.awc.R_maincompression_lowerlimit = data.data[35] / 100;
            
            payload.stats.awc.MONO_MAIN_FORCE = data.data[36] / 100;
            payload.stats.awc.BI_PRE_FORCE  = data.data[37] / 100;
            payload.stats.awc.BI_MAIN_FORCE  = data.data[38] / 100;
            payload.machine.RHS.dozer_position = data.data[39] / 100;
            payload.machine.LHS.dozer_position = data.data[40] / 100;

            payload.stats.awc.AVG_RTN = data.data[41];
            payload.stats.awc.AWC_TOLERANCE = data.data[42];
            payload.stats.awc.AWC_MAX_CORRECTION = data.data[43];

            payload.stats.awc.AWC_32bit_CORRECTION = _2x16bitTo32bit(data.data[44], data.data[45], 100)

            payload.stats.sampling.NO_TABLET_SAMPLING = data.data[57];
            payload.stats.sampling.SAMPLING_TIME_MINS = data.data[58];
            payload.stats.sampling.SAMPLE_COUNT = data.data[59];
            payload.stats.roller.frequency = data.data[61] / 100;

            payload.stats.roller.motor = data.data[62];

            payload.machine.set_force_mono_upper = data.data[64] / 100;
            payload.machine.set_force_mono_lower = data.data[65] / 100;
            payload.machine.set_force_LHS_upper = data.data[66] / 100;
            payload.machine.set_force_LHS_lower = data.data[67] / 100;
            payload.machine.set_force_RHS_upper = data.data[68] / 100;
            payload.machine.set_force_RHS_lower = data.data[69] / 100;

            payload.machine.safety_high_LHS = data.data[70] / 100;
            payload.machine.safety_high_RHS = data.data[71] / 100;
            payload.machine.rejn_high_LHS = data.data[72] / 100;
            payload.machine.rejn_high_RHS = data.data[73] / 100;
            payload.machine.awc_high_LHS = data.data[74] / 100;
            payload.machine.awc_high_RHS = data.data[75] / 100;
            payload.machine.set_force_LHS = data.data[76] / 100;
            payload.machine.set_force_RHS = data.data[77] / 100;
            payload.machine.awc_low_LHS = data.data[78] / 100;
            payload.machine.awc_low_RHS = data.data[79] / 100;
            payload.machine.rej_low_LHS = data.data[80] / 100;
            payload.machine.rej_low_RHS = data.data[81] / 100;
            payload.machine.safety_low_LHS = data.data[82] / 100;
            payload.machine.safety_low_RHS = data.data[83] / 100;
            
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ reg_6000 Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
    
    client.readHoldingRegisters(reg_7000, 100)
        .then(function (data) {
            // console.log("STATS: ",data.data)
            
            // ADEPT SETUP
            payload.machine.LHS.precompression_max = data.data[0] / 100
            payload.machine.LHS.maincompression_max = data.data[1] / 100;
            payload.machine.LHS.ejection_max = data.data[2] / 10;
            payload.machine.RHS.precompression_max = data.data[3] / 100;
            payload.machine.RHS.maincompression_max = data.data[4] / 100;
            payload.machine.RHS.ejection_max = data.data[5] / 10;
            payload.stats.B_HEAD = _2x16bitTo32bit(data.data[6], data.data[7], 100);
            payload.stats.B_PCD = _2x16bitTo32bit(data.data[8], data.data[9],100);
            payload.stats.D_HEAD = _2x16bitTo32bit(data.data[10], data.data[11], 100);
            payload.stats.D_PCD = _2x16bitTo32bit(data.data[12], data.data[13], 100);

            payload.stats.total_punches = data.data[14];

            payload.stats.LHSdepth.analog_max = data.data[16] / 100;
            payload.stats.LHSdepth.analog_min = data.data[17] / 100;
            payload.stats.LHSdepth.depth_max = data.data[18] / 100;
            payload.stats.LHSdepth.depth_min = data.data[19] / 100;
            payload.stats.RHSdepth.analog_max = data.data[20] / 100;
            payload.stats.RHSdepth.analog_min = data.data[21] / 100;
            payload.stats.RHSdepth.depth_max = data.data[22] / 100;
            payload.stats.RHSdepth.depth_min = data.data[23] / 100;

            payload.stats.LHSweight.analog_max = data.data[24];
            payload.stats.LHSweight.analog_min = data.data[25];
            payload.stats.LHSweight.weight_max = data.data[26] / 10;
            payload.stats.LHSweight.weight_min = data.data[27] / 10;
            payload.stats.RHSweight.analog_max = data.data[28];
            payload.stats.RHSweight.analog_min = data.data[29];
            payload.stats.RHSweight.weight_max = data.data[30] / 10;
            payload.stats.RHSweight.weight_min = data.data[31] / 10;

            payload.stats.LHSthickness.analog_max = data.data[32];
            payload.stats.LHSthickness.analog_min = data.data[33];
            payload.stats.LHSthickness.thickness_max = data.data[34] / 10;
            payload.stats.LHSthickness.thickness_min = data.data[35] / 10;
            payload.stats.RHSthickness.analog_max = data.data[36];
            payload.stats.RHSthickness.analog_min = data.data[37];
            payload.stats.RHSthickness.thickness_max = data.data[38] / 10;
            payload.stats.RHSthickness.thickness_min = data.data[39] / 10;

            payload.stats.turret.max_rpm = data.data[40]
            payload.stats.turret.max_freq = data.data[41];
            payload.stats.LHS_FF.max_rpm = data.data[42]
            payload.stats.LHS_FF.max_freq = data.data[43];
            payload.stats.RHS_FF.max_rpm = data.data[44]
            payload.stats.RHS_FF.max_freq = data.data[45];

            payload.stats.punch_offset_position.L_PRE = data.data[46]
            payload.stats.punch_offset_position.L_MAIN = data.data[47]
            payload.stats.punch_offset_position.L_EJN = data.data[48]
            payload.stats.punch_offset_position.R_PRE = data.data[49]
            payload.stats.punch_offset_position.R_MAIN = data.data[50]
            payload.stats.punch_offset_position.R_EJN = data.data[51]

            payload.stats.hydraulic.max_pressure = data.data[52];

            payload.stats.punch_offset_position.L_AIR_MONO = data.data[53]
            payload.stats.punch_offset_position.R_AIR_MONO = data.data[54]
            payload.stats.punch_offset_position.L_FLAP_MONO = data.data[55]
            payload.stats.punch_offset_position.R_FLAP_MONO = data.data[56]
            
            payload.stats.punch_offset_position.L_AIR_BI = data.data[57]
            payload.stats.punch_offset_position.R_AIR_BI = data.data[58]
            payload.stats.punch_offset_position.L_FLAP_BI = data.data[59]
            payload.stats.punch_offset_position.R_FLAP_BI = data.data[60]

            payload.stats.rejection.pulse.L_AIR_ON = data.data[61]
            payload.stats.rejection.pulse.L_AIR_OFF = data.data[62]
            payload.stats.rejection.pulse.L_FLAP_ON = data.data[63]
            payload.stats.rejection.pulse.L_FLAP_OFF = data.data[64]
            payload.stats.rejection.pulse.R_AIR_ON = data.data[65]
            payload.stats.rejection.pulse.R_AIR_OFF = data.data[66]
            payload.stats.rejection.pulse.R_FLAP_ON = data.data[67]
            payload.stats.rejection.pulse.R_FLAP_OFF = data.data[68]

            payload.stats.rejection.air.L_AIR_OFF_TIME = data.data[69]
            payload.stats.rejection.air.L_FLAP_OFF_TIME = data.data[70]
            payload.stats.rejection.air.R_AIR_OFF_TIME = data.data[71]
            payload.stats.rejection.air.R_FLAP_OFF_TIME = data.data[72]
            
            payload.stats.awc.MAXIMUM_REJECT_TABLET = data.data[73]
            payload.stats.awc.RTN_1_MM = data.data[74] /100;
            
            payload.stats.awc.RTN_1_PPR = _2x16bitTo32bit(data.data[76], data.data[77])
            
            payload.stats.awc.RHS_HOME_OFFSET_1 = signedDecToDec(_2x16bitTo32bit(data.data[78], data.data[79]))
            payload.stats.awc.RHS_HOME_OFFSET_2 = signedDecToDec(_2x16bitTo32bit(data.data[80], data.data[81]))
            payload.stats.awc.LHS_HOME_OFFSET_1 = signedDecToDec(_2x16bitTo32bit(data.data[82], data.data[83]))
            payload.stats.awc.LHS_HOME_OFFSET_2 = signedDecToDec(_2x16bitTo32bit(data.data[84], data.data[85]))
            
            payload.stats.Z_PHASE_COUNTER = data.data[86];
            payload.stats.Z_PHASE_COUNT = data.data[87];
            
            payload.stats.SERVO_RHS_UPPERLIMIT = signedDecToDec(_2x16bitTo32bit(data.data[89], data.data[90]))
            payload.stats.SERVO_RHS_LOWERLIMIT = signedDecToDec(_2x16bitTo32bit(data.data[91], data.data[92]))
            payload.stats.SERVO_LHS_UPPERLIMIT = signedDecToDec(_2x16bitTo32bit(data.data[93], data.data[94]))
            payload.stats.SERVO_LHS_LOWERLIMIT = signedDecToDec(_2x16bitTo32bit(data.data[95], data.data[96]))
            
            payload.stats.TABLET_MULTIPLICATION_FACTOR = data.data[97]

            payload.stats.SAFETY_MULTIPLICATION_FACTOR = data.data[98]
            payload.stats.MACHINE_STOP_DELAY = data.data[99] / 10 
            
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ reg_7000 Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        
    client.readHoldingRegisters(reg_5000, 70)
        .then(function (data) {
            // console.log("STATS: ",data.data)
            payload.stats.turret.F = data.data[0]/100
            payload.stats.turret.H = data.data[1]/100
            payload.stats.turret.A = data.data[2]/100
            payload.stats.LHS_FF.F = data.data[3]/100
            payload.stats.LHS_FF.H = data.data[4]/100
            payload.stats.LHS_FF.A = data.data[5]/100
            payload.stats.RHS_FF.F = data.data[6]/100
            payload.stats.RHS_FF.H = data.data[7]/100
            payload.stats.RHS_FF.A = data.data[8]/100

            payload.production = _2x16bitTo32bit(data.data[10], data.data[11])
            payload.stats.tablets_per_hour = _2x16bitTo32bit(data.data[14], data.data[15])
            
            payload.rotation_no = _2x16bitTo32bit(data.data[18], data.data[19])
            payload.stats.punch_present_position.L_PRE = data.data[20]
            payload.stats.punch_present_position.L_MAIN = data.data[21]
            payload.stats.punch_present_position.L_EJN = data.data[22]
            payload.stats.punch_present_position.R_PRE = data.data[23]
            payload.stats.punch_present_position.R_MAIN = data.data[24]
            payload.stats.punch_present_position.R_EJN = data.data[25]

            payload.stats.active_punches = data.data[26]
            payload.stats.fault_active_flash = data.data[27]
            payload.stats.LHSdepth.value = data.data[28]
            payload.stats.RHSdepth.value = data.data[29]
            payload.stats.LHSweight.value = data.data[30]/10
            payload.stats.RHSweight.value = data.data[31]/10
            payload.stats.LHSthickness.value = data.data[32]/10
            payload.stats.RHSthickness.value = data.data[33]/10
            
            payload.stats.pressure.value = data.data[34]
            payload.stats.lubrication.remaining_time = data.data[35]
             
            payload.stats.dwell = _2x16bitTo32bit(data.data[40], data.data[41], 10000)

            payload.stats.awc.actual_RHS = data.data[42] / 100
            payload.stats.awc.actual_LHS = data.data[43] / 100

            payload.stats.home.RHS.single_turn = signedDecToDec(_2x16bitTo32bit(data.data[44], data.data[45]))
            payload.stats.home.RHS.multi_turn = signedDecToDec(_2x16bitTo32bit(data.data[46], data.data[47]))
            payload.stats.home.RHS.encoder_ppr = signedDecToDec(_2x16bitTo32bit(data.data[48], data.data[49]))
            payload.stats.home.RHS.home_offset = signedDecToDec(_2x16bitTo32bit(data.data[50], data.data[51]))
            payload.stats.home.LHS.single_turn = signedDecToDec(_2x16bitTo32bit(data.data[52], data.data[53]))
            payload.stats.home.LHS.multi_turn = signedDecToDec(_2x16bitTo32bit(data.data[54], data.data[55]))
            payload.stats.home.LHS.encoder_ppr = signedDecToDec(_2x16bitTo32bit(data.data[56], data.data[57]))
            payload.stats.home.LHS.home_offset = signedDecToDec(_2x16bitTo32bit(data.data[58], data.data[59]))

            payload.stats.roller.F = data.data[60]/100
            payload.stats.roller.H = data.data[61]/100
            payload.stats.roller.A = data.data[62]/100
            
            payload.stats.RHSweight.analog = data.data[63]
            payload.stats.LHSweight.analog = data.data[64]
            payload.stats.RHSthickness.analog = data.data[65]
            payload.stats.LHSthickness.analog = data.data[66]
            
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ reg_5000 Garbage ]')
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })

}

var reg_offset_6000;
var reg_write_value;

var write_regs = function () {

    client.writeRegisters(reg_6000 + reg_offset_6000, [reg_write_value])
        .then(function (d) {
            console.log(`Address ${reg_6000 + reg_offset_6000} set to ${reg_write_value}`);
            mbsState = PASS_REGS_WRITE;
        })
        .catch(function (e) {
            mbsState = FAIL_REGS_WRITE;
            console.log(e.message);
        })
}

var write_regs_32 = function () {
   
    client.writeRegisters(reg_6000 + reg_offset_6000, signedDecto2x16bitArray(parseInt(reg_write_value)))
        .then(function (d) {
            console.log(`Address ${reg_6000 + reg_offset_6000} set to ${signedDecto2x16bitArray(parseInt(reg_write_value))}`);
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
            console.log(`Address ${coil_500 + coil_offset_500} set to ${set_status}`, d);
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

app.use("/api/machine/stats", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json(payload);
});

app.get("/api/set/status/:punch/:value", (req, res) => {
    var a = parseInt(req.params.punch);
    const b = req.params.value;

    writelog = () => {

        if (b == 'true') {
            console.log(typeof (Number(0)))
            _new.write(`${batchinfo.name}.operationlogs`)
                .tag({
                })
                .field({
                    operator: batchinfo.operator,  // 2
                    parameter: `PUNCH ${a} ENABLE`,  // 2
                    oldvalue: Number(0),  // 2
                    newvalue: Number(1),  // 2
                })
                .then(() => console.info(`[ LOG ENTRY DONE ${batchinfo.name} ]`))
                .catch(console.error);
        } else if (b == 'false') {
            console.log(typeof (Number(0)))
            _new.write(`${batchinfo.name}.operationlogs`)
                .tag({
                })
                .field({
                    operator: batchinfo.operator,  // 2
                    parameter: `PUNCH ${a} ENABLE`,  // 2
                    oldvalue: Number(1),  // 2
                    newvalue: Number(0),  // 2
                })
                .then(() => console.info(`[ LOG ENTRY DONE ${batchinfo.name} ]`))
                .catch(console.error);
        }
    }
    coil_offset_500 = 40 + a -1;

    if (b == 'true') {
        set_status = Boolean(true)
    } else if (b == 'false') {
        set_status = Boolean(false)
    }

    write_coil_500()
    writelog()

    res.header('Access-Control-Allow-Origin', '*');
    return res.json({ message: `[ UPDATED ${a} to ${b} ]` });
});


app.get("/api/set/:parameter/:value", (req, res) => {
    var a = req.params.parameter;
    const b = req.params.value;
    var c;

    writelog = () => {

        console.log('b', b, typeof(b))
        console.log('c', c, typeof(c))
        if (b == 'true' || b == 'false') {
            var newv
            var oldv
            
            if (b == 'true') {
                console.log(typeof (Number(0)))
                _new.write(`${batchinfo.name}.operationlogs`)
                    .tag({
                    })
                    .field({
                        operator: batchinfo.operator,  // 2
                        parameter: a,  // 2
                        oldvalue: Number(0),  // 2
                        newvalue: Number(1),  // 2
                    })
                    .then(() => console.info(`[ LOG ENTRY DONE ${batchinfo.name} ]`))
                    .catch(console.error);
            } else if (b == 'false') {
                console.log(typeof (Number(0)))
                _new.write(`${batchinfo.name}.operationlogs`)
                    .tag({
                    })
                    .field({
                        operator: batchinfo.operator,  // 2
                        parameter: a,  // 2
                        oldvalue: Number(1),  // 2
                        newvalue: Number(0),  // 2
                    })
                    .then(() => console.info(`[ LOG ENTRY DONE ${batchinfo.name} ]`))
                    .catch(console.error);
            }
            
        } else {
            _new.write(`${batchinfo.name}.operationlogs`)
                .tag({
                })
                .field({
                    operator: batchinfo.operator,  // 2
                    parameter: a,  // 2
                    oldvalue: Number(c),  // 2
                    newvalue: Number(b),  // 2
                })
                .then(() => console.info(`[ LOG ENTRY DONE ${batchinfo.name} ]`))
                .catch(console.error);
        }
    }

    if (a == "RESET_COUNT") {
        reg_offset_6000 = -982
        reg_write_value = b
        // c = payload.stats.turret.RPM
        write_regs_32()
        // writelog()
    }
    else if (a == "TURRET_RPM_CHANGE") {
        reg_offset_6000 = 0
        reg_write_value = b
        c = payload.stats.turret.RPM
        write_regs()
        writelog()
    }
    else if (a == "RHS_FEEDER_RPM_CHANGE") {
        reg_offset_6000 = 1
        reg_write_value = b
        c = payload.stats.LHS_FF.RPM
        write_regs()
        writelog()
    } 
    else if (a == "LHS_FEEDER_RPM_CHANGE") {
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
        // writelog()
        if (a == 0) {
            a = "FEEDER_GRAVITY"
            b = "true"
            c = "false"
            writelog()
        }
        else if (a == 1) {
            a = "FEEDER_FORCE"
            b = "true"
            c = "false"
            writelog()
        }
    } 
    else if (a == "LUBRICATION_OFF_TIME_CHANGE") {
        reg_offset_6000 = 4
        reg_write_value = b
        c = payload.stats.lubrication.set_delay_min
        write_regs()
        writelog()
    } 
    else if (a == "LUBRICATION_ON_TIME_CHANGE") {
        reg_offset_6000 = 5
        reg_write_value = b * 10
        c = payload.stats.lubrication.set_delay_sec
        write_regs()
        writelog()
    } 
    else if (a == "HYDRAULIC_PRESSURE_CHANGE") {
        reg_offset_6000 = 7
        reg_write_value = b 
        c = payload.stats.pressure.pressure_set
        write_regs()
        writelog()
    } 
    else if (a == "HYDRAULIC_HIGH_PRESSURE_CUTOFF") {
        reg_offset_6000 = 8
        reg_write_value = b
        c = payload.stats.hydraulic.high_cutoff
        write_regs()
        writelog()
    } 
    else if (a == "HYDRAULIC_LOW_PRESSURE_CUTOFF") {
        reg_offset_6000 = 9
        reg_write_value = b
        c = payload.stats.hydraulic.low_cutoff
        write_regs()
        writelog()
    } 
    else if (a == "LHS_REJN_HIGH") {
        a = "LHS BILAYER REJCTION HIGH"
        reg_offset_6000 = 10
        reg_write_value = b * 100
        c = payload.machine.LHS.precompression_upperlimit
        write_regs()
        writelog()
    } 
    else if (a == "LHS_REJN_LOW") {
        a = "LHS BILAYER REJCTION LOW"
        reg_offset_6000 = 11
        reg_write_value = b * 100
        c = payload.machine.LHS.precompression_lowerlimit
        write_regs()
        writelog()
    } 
    else if (a == "MONO_REJN_HIGH") {
        a = "MONO LAYER REJCTION HIGH"
        reg_offset_6000 = 12
        reg_write_value = b * 100
        c = payload.machine.LHS.maincompression_upperlimit
        write_regs()
        writelog()
    } 
    else if (a == "MONO_REJN_LOW") {
        a = "MONO LAYER REJCTION LOW"
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
    else if (a == "RHS_REJN_HIGH") {
        a = "RHS BILAYER REJCTION HIGH"
        reg_offset_6000 = 16
        reg_write_value = b * 100
        c = payload.machine.RHS.precompression_upperlimit
        write_regs()
        writelog()
    } 
    else if (a == "RHS_REJN_LOW") {
        a = "RHS BILAYER REJCTION LOW"
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
        a = "MONO LAYER SET FORCE"
        reg_offset_6000 = 36
        reg_write_value = Math.round(b * 100);
        c = payload.stats.awc.MONO_MAIN_FORCE
        write_regs()
        writelog()
    } 
    else if (a == "LHS_SET_FORCE") {
        a = "LHS BILAYER SET FORCE"
        reg_offset_6000 = 37
        reg_write_value = b * 100
        c = payload.stats.awc.BI_PRE_FORCE
        write_regs()
        writelog()
    } 
    else if (a == "RHS_SET_FORCE") {
        a = "RHS BILAYER SET FORCE"
        reg_offset_6000 = 38
        reg_write_value = b * 100
        c = payload.stats.awc.BI_MAIN_FORCE
        write_regs()
        writelog()
    } 
    else if (a == "RHS_DOZER") {
        a = "RHS DOZZER POSITION"
        reg_offset_6000 = 39
        reg_write_value = Math.round(b * 100);
        c = payload.machine.RHS.dozer_position
        write_regs()
        writelog()
    } 
    else if (a == "LHS_DOZER") {
        a = "LHS DOZZER POSITION"
        reg_offset_6000 = 40
        reg_write_value = Math.round(b * 100);
        c = payload.machine.LHS.dozer_position
        write_regs()
        writelog()
    } 
    else if (a == "AVG_RTN") {
        a = "NUMBER OF ROTATION"
        reg_offset_6000 = 41
        reg_write_value = b
        c = payload.stats.awc.AVG_RTN
        write_regs()
        writelog()
    } 
    else if (a == "AWC_TOLERANCE") {
        a = "AVERAGE TOLERANCE %"
        reg_offset_6000 = 42
        reg_write_value = b
        c = payload.stats.awc.AWC_TOLERANCE
        write_regs()
        writelog()
    } 
    else if (a == "AWC_MAX_CORRECTION") {
        a = "AWC MAX CORRECTION %"
        reg_offset_6000 = 43
        reg_write_value = b
        c = payload.stats.awc.AWC_MAX_CORRECTION
        write_regs()
        writelog()
    } 
    else if (a == "AWC_32bit_CORRECTION") {
        a = "AWC CORRECTION MM"
        reg_offset_6000 = 44
        reg_write_value = b * 100
        c = payload.stats.awc.AWC_32bit_CORRECTION
        write_regs_32()
        writelog()
    } 
    else if (a == "NO_TABLET_SAMPLING") {
        a = "NO. OF SAMPLE TABLET"
        reg_offset_6000 = 57
        reg_write_value = b
        c = payload.stats.sampling.NO_TABLET_SAMPLING
        write_regs()
        writelog()
    } 
    else if (a == "SAMPLING_TIME_MINS") {
        a = "SAMPLING INTERVAL (mins)"
        reg_offset_6000 = 58
        reg_write_value = b
        c = payload.stats.sampling.SAMPLING_TIME_MINS
        write_regs()
        writelog()
    } 
    else if (a == "ROLLER_VFD_FREQ") {
        reg_offset_6000 = 61
        reg_write_value = b *100
        c = payload.stats.roller.frequency
        write_regs()
        writelog()
    } 
    else if (a == "ROLLER_MOTOR_SELECTION") {
        reg_offset_6000 = 62
        reg_write_value = b
        // c = payload.stats.roller.motor
        write_regs()
        if (a == 1) {
            a = "LHS_PRE_ROLLER"
            b = "true"
            c = 'false'
            writelog()
        } else if (a == 2) {
            a = "LHS_MAIN_ROLLER"
            b = "true"
            c = 'false'
            writelog()
        } else if (a == 3) {
            a = "RHS_PRE_ROLLER"
            b = "true"
            c = 'false'
            writelog()
        } else if (a == 4) {
            a = "RHS_MAIN_ROLLER"
            b = "true"
            c = 'false'
            writelog()
        }
    }
    else if (a == "SET_FORCE_MONO_UPPER") {
        reg_offset_6000 = 64
        reg_write_value = b * 100
        c = payload.machine.set_force_mono_upper
        write_regs()
        writelog()
    }
    else if (a == "SET_FORCE_MONO_LOWER") {
        reg_offset_6000 = 65
        reg_write_value = b * 100
        c = payload.machine.set_force_mono_lower
        write_regs()
        writelog()
    }
    else if (a == "SET_FORCE_LHS_UPPER") {
        reg_offset_6000 = 66
        reg_write_value = b * 100
        c = payload.machine.set_force_LHS_upper
        write_regs()
        writelog()
    }
    else if (a == "SET_FORCE_LHS_LOWER") {
        reg_offset_6000 = 67
        reg_write_value = b * 100
        c = payload.machine.set_force_LHS_lower
        write_regs()
        writelog()
    }
    else if (a == "SET_FORCE_RHS_UPPER") {
        reg_offset_6000 = 68
        reg_write_value = b * 100
        c = payload.machine.set_force_RHS_upper
        write_regs()
        writelog()
    }
    else if (a == "SET_FORCE_RHS_LOWER") {
        reg_offset_6000 = 69
        reg_write_value = b * 100
        c = payload.machine.set_force_RHS_lower
        write_regs()
        writelog()
    }
        
        
    else if (a == "POWER_PACK_START" && b == "true") {
        coil_offset_410 = 0
        set_button = true
        c = payload.button.POWER_PACK_START_BUTTON
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "POWER_PACK_START" && b == "false") {
        coil_offset_410 = 0
        set_button = false
        c = payload.button.POWER_PACK_START_BUTTON
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "POWER_PACK_STOP" && b == "true") {
        coil_offset_410 = 1
        set_button = true
        c = payload.button.POWER_PACK_STOP_BUTTON
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "POWER_PACK_STOP" && b == "false") {
        coil_offset_410 = 1
        set_button = false
        c = payload.button.POWER_PACK_STOP_BUTTON
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "PRESSURE_ACK_BUTTON" && b == "true") {
        coil_offset_410 = 2
        set_button = true
        c = payload.button.PRESSURE_ACK_BUTTON
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "PRESSURE_ACK_BUTTON" && b == "false") {
        coil_offset_410 = 2
        set_button = false
        c = payload.button.PRESSURE_ACK_BUTTON
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "DRAIN" && b == "true") {
        coil_offset_410 = 3
        set_button = true
        c = payload.button.DRAIN_BUTTON_HMI

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "DRAIN" && b == "false") {
        coil_offset_410 = 3
        set_button = false
        c = payload.button.DRAIN_BUTTON_HMI

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "PRESSURE_SET_BUTTON" && b == "true") {
        coil_offset_410 = 4
        set_button = true
        c = payload.button.PRESSURE_SET_BUTTON
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "PRESSURE_SET_BUTTON" && b == "false") {
        coil_offset_410 = 4
        set_button = false
        c = payload.button.PRESSURE_SET_BUTTON

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "INCHING_BUTTON" && b == "true") {
        coil_offset_410 = 10
        set_button = true
        c = payload.button.MACHINE_INCHING_BUTTON
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "INCHING_BUTTON" && b == "false") {
        coil_offset_410 = 10
        set_button = false
        c = payload.button.MACHINE_INCHING_BUTTON
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()   
    }
    else if (a == "START_BUTTON" && b == "true") {
        coil_offset_410 = 15
        set_button = true
        c = payload.button.MACHINE_START_BUTTON
        
        write_coil_410()
        b == true ? oldv = 0 : newv = 1
        c == false ? oldv = 1 : newv = 0
        b == "false" & c == false || b == "true" & c == true ? c : writelog()   
    }
    else if (a == "START_BUTTON" && b == "false") {
        coil_offset_410 = 15
        set_button = false
        c = payload.button.MACHINE_START_BUTTON
        // b == "false" & c == false || b == "true" & c == true ? c : writelog()   
        
        write_coil_410()
    }
    else if (a == "STOP_BUTTON" && b == "true") {
        coil_offset_410 = 16
        set_button = true
        c = payload.button.MACHINE_STOP_BUTTON
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "STOP_BUTTON" && b == "false") {
        coil_offset_410 = 16
        set_button = false
        c = payload.button.MACHINE_STOP_BUTTON
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "FEEDER_RUN" && b == "true") {
        coil_offset_410 = 18
        set_button = true
        c = payload.button.FORCE_FEEDER_START_BUTTON
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "FEEDER_RUN" && b == "false") {
        coil_offset_410 = 18
        set_button = false
        c = payload.button.FORCE_FEEDER_START_BUTTON
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "FORCE_FEEDER_STOP_BUTTON" && b == "true") {
        coil_offset_410 = 19
        set_button = true
        c = payload.button.FORCE_FEEDER_STOP_BUTTON
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "FORCE_FEEDER_STOP_BUTTON" && b == "false") {
        coil_offset_410 = 19
        set_button = false
        c = payload.button.FORCE_FEEDER_STOP_BUTTON
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "TABLET_COUNT_RESET" && b == "true") {
        coil_offset_410 = 20
        set_button = true
        c = payload.button.TABLET_COUNT_RESET
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "TABLET_COUNT_RESET" && b == "false") {
        coil_offset_410 = 20
        set_button = false
        c = payload.button.TABLET_COUNT_RESET
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "Z_PHASE_COUNT_RESET" && b == "true") {
        coil_offset_410 = 21
        set_button = true
        c = payload.button.TABLET_COUNT_RESET
        
        write_coil_410()
        // b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "Z_PHASE_COUNT_RESET" && b == "false") {
        coil_offset_410 = 21
        set_button = false
        c = payload.button.TABLET_COUNT_RESET
        
        write_coil_410()
        // b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "ROLLER_FORWARD" && b == "true") {
        coil_offset_410 = 25
        set_button = true
        c = payload.button.ROLLER_FORWARD
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "ROLLER_FORWARD" && b == "false") {
        coil_offset_410 = 25
        set_button = false
        c = payload.button.ROLLER_FORWARD
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "ROLLER_REVERSE" && b == "true") {
        coil_offset_410 = 26
        set_button = true
        c = payload.button.ROLLER_REVERSE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "ROLLER_REVERSE" && b == "false") {
        coil_offset_410 = 26
        set_button = false
        c = payload.button.ROLLER_REVERSE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "MANUAL_SAMPLING" && b == "true") {
        coil_offset_410 = 28
        set_button = true
        c = payload.button.MANUAL_SAMPLE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "MANUAL_SAMPLING" && b == "false") {
        coil_offset_410 = 28
        set_button = false
        c = payload.button.MANUAL_SAMPLE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "1ST_LAYER_EJECTION" && b == "true") {
        coil_offset_410 = 30
        set_button = true
        c = payload.button.FIRST_LAYER_SAMPLING
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "1ST_LAYER_EJECTION" && b == "false") {
        coil_offset_410 = 30
        set_button = false
        c = payload.button.FIRST_LAYER_SAMPLING
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "DIRECT__RAMP" && b == "true") {
        a = "MODE OFF:DIRECT/ ON: RAMP"
        coil_offset_410 = 90
        set_button = true
        c = payload.button.DIRECT__RAMP

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "DIRECT__RAMP" && b == "false") {
        a = "MODE OFF:DIRECT/ ON: RAMP"
        coil_offset_410 = 90
        set_button = false
        c = payload.button.DIRECT__RAMP

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "WITH_DOOR__BYPASS" && b == "true") {
        a = "GUARD BYPASS"
        coil_offset_410 = 92
        set_button = true
        c = payload.button.WITH_DOOR__BYPASS
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "WITH_DOOR__BYPASS" && b == "false") {
        a = "GUARD BYPASS"
        coil_offset_410 = 92
        set_button = false
        c = payload.button.WITH_DOOR__BYPASS

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "INITIAL_REJECTION" && b == "true") {
        coil_offset_410 = 96
        set_button = true
        c = payload.button.INITIAL_REJECTION
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "INITIAL_REJECTION" && b == "false") {
        coil_offset_410 = 96
        set_button = false
        c = payload.button.INITIAL_REJECTION
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "B_TYPE__D_TYPE" && b == "true") {
        a = "PUNCH TYPE OFF B TYPE ON DTYPE"
        coil_offset_410 = 98
        set_button = true
        c = payload.button.B_TYPE__D_TYPE

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "B_TYPE__D_TYPE" && b == "false") {
        a = "PUNCH TYPE OFF B TYPE ON DTYPE"
        coil_offset_410 = 98
        set_button = false
        c = payload.button.B_TYPE__D_TYPE

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "POWDER_SENSOR_ENABLE" && b == "true") {
        a = "POWDER SENSOR ACTIVE"
        coil_offset_410 = 100
        set_button = true
        c = payload.button.POWDER_SENSOR_ENABLE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "POWDER_SENSOR_ENABLE" && b == "false") {
        a = "POWDER SENSOR ACTIVE"
        coil_offset_410 = 100
        set_button = false
        c = payload.button.POWDER_SENSOR_ENABLE

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "Z_PHASE_SELECTION" && b == "true") {
        coil_offset_410 = 101
        set_button = true
        c = payload.button.Z_PHASE_SELECTION

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "Z_PHASE_SELECTION" && b == "false") {
        coil_offset_410 = 101
        set_button = false
        c = payload.button.Z_PHASE_SELECTION

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "AUTO_SAMPLING" && b == "true") {
        coil_offset_410 = 103
        set_button = true
        c = payload.button.AUTO_SAMPLE

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "AUTO_SAMPLING" && b == "false") {
        coil_offset_410 = 103
        set_button = false
        c = payload.button.AUTO_SAMPLE

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "REJECTION" && b == "true") {
        coil_offset_410 = 104
        set_button = true
        c = payload.button.REJECTION_BUTTON_HMI

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "REJECTION" && b == "false") {
        coil_offset_410 = 104
        set_button = false
        c = payload.button.REJECTION_BUTTON_HMI

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "REJN_AIR_FLAP" && b == "true") {
        a = "REJECTION_BY_FLAP"
        coil_offset_410 = 105
        set_button = true
        c = payload.button.REJN_AIR_FLAP
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "REJN_AIR_FLAP" && b == "false") {
        a = "REJECTION_BY_AIR"
        coil_offset_410 = 105
        set_button = false
        c = payload.button.REJN_AIR_FLAP
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "MONO_BI" && b == "true") {
        a = "BILAYER"
        coil_offset_410 = 106
        set_button = true
        c = payload.button.MONO_BI
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "MONO_BI" && b == "false") {
        a = "BILAYER"
        coil_offset_410 = 106
        set_button = false
        c = payload.button.MONO_BI
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "REJECTION_MODE" && b == "true") {
        coil_offset_410 = 107
        set_button = true
        c = payload.button.REJECTION_MODE

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "REJECTION_MODE" && b == "false") {
        coil_offset_410 = 107
        set_button = false
        c = payload.button.REJECTION_MODE
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "AWC_ENABLE" && b == "true") {
        a = "AWC"
        coil_offset_410 = 110
        set_button = true
        c = payload.button.AWC_ENABLE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "AWC_ENABLE" && b == "false") {
        a = "AWC"
        coil_offset_410 = 110
        set_button = false
        c = payload.button.AWC_ENABLE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_FORCE_FEEDER_BUTTON_HMI" && b == "true") {
        a = "RHS DOZZER POSITION RUN"
        coil_offset_410 = 111
        set_button = true
        c = payload.button.LHS_FORCE_FEEDER_BUTTON_HMI
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_FORCE_FEEDER_BUTTON_HMI" && b == "false") {
        a = "RHS DOZZER POSITION RUN"
        coil_offset_410 = 111
        set_button = false
        c = payload.button.LHS_FORCE_FEEDER_BUTTON_HMI
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_FORCE_FEEDER_BUTTON_HMI" && b == "true") {
        a = "LHS DOZZER POSITION RUN"
        coil_offset_410 = 112
        set_button = true
        c = payload.button.RHS_FORCE_FEEDER_BUTTON_HMI
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_FORCE_FEEDER_BUTTON_HMI" && b == "false") {
        a = "LHS DOZZER POSITION RUN"
        coil_offset_410 = 112
        set_button = false
        c = payload.button.RHS_FORCE_FEEDER_BUTTON_HMI
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_WEIGHT_INC" && b == "true") {
        a = "RHS_DOZZER_DOWN"
        coil_offset_410 = 113
        set_button = true
        c = payload.button.RHS_WEIGHT_INC
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_WEIGHT_INC" && b == "false") {
        a = "RHS_DOZZER_DOWN"
        coil_offset_410 = 113
        set_button = false
        c = payload.button.RHS_WEIGHT_INC
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_WEIGHT_DEC" && b == "true") {
        a = "RHS_DOZZER_UP"
        coil_offset_410 = 114
        set_button = true
        c = payload.button.RHS_WEIGHT_DEC
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_WEIGHT_DEC" && b == "false") {
        a = "RHS_DOZZER_UP"
        coil_offset_410 = 114
        set_button = false
        c = payload.button.RHS_WEIGHT_DEC
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_WEIGHT_INC" && b == "true") {
        a = "LHS_DOZZER_DOWN"
        coil_offset_410 = 115
        set_button = true
        c = payload.button.LHS_WEIGHT_INC
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_WEIGHT_INC" && b == "false") {
        a = "LHS_DOZZER_DOWN"
        coil_offset_410 = 115
        set_button = false
        c = payload.button.LHS_WEIGHT_INC
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_WEIGHT_DEC" && b == "true") {
        a = "LHS_DOZZER_UP"
        coil_offset_410 = 116
        set_button = true
        c = payload.button.LHS_WEIGHT_DEC
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_WEIGHT_DEC" && b == "false") {
        a = "LHS_DOZZER_UP"
        coil_offset_410 = 116
        set_button = false
        c = payload.button.LHS_WEIGHT_DEC
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_SERVO_ON" && b == "true") {
        coil_offset_410 = 117
        set_button = true
        c = payload.button.RHS_SERVO_ON
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_SERVO_ON" && b == "false") {
        coil_offset_410 = 117
        set_button = false
        c = payload.button.RHS_SERVO_ON
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_MULTI_TURN_CLEAR" && b == "true") {
        coil_offset_410 = 118
        set_button = true
        c = payload.button.RHS_MULTI_TURN_CLEAR
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_MULTI_TURN_CLEAR" && b == "false") {
        coil_offset_410 = 118
        set_button = false
        c = payload.button.RHS_MULTI_TURN_CLEAR
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_HOME_OFFSET_WRITE" && b == "true") {
        a = "RHS HOME OFFSET 1 SET"
        coil_offset_410 = 119
        set_button = true
        c = payload.button.RHS_HOME_OFFSET_WRITE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_HOME_OFFSET_WRITE" && b == "false") {
        a = "RHS HOME OFFSET 1 SET"
        coil_offset_410 = 119
        set_button = false
        c = payload.button.RHS_HOME_OFFSET_WRITE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_EEPROM_WRITE" && b == "true") {
        coil_offset_410 = 120
        set_button = true
        c = payload.button.RHS_EEPROM_WRITE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_EEPROM_WRITE" && b == "false") {
        coil_offset_410 = 120
        set_button = false
        c = payload.button.RHS_EEPROM_WRITE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_SERVO_ON" && b == "true") {
        coil_offset_410 = 121
        set_button = true
        c = payload.button.LHS_SERVO_ON
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_SERVO_ON" && b == "false") {
        coil_offset_410 = 121
        set_button = false
        c = payload.button.LHS_SERVO_ON
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_MULTI_TURN_CLEAR" && b == "true") {
        coil_offset_410 = 122
        set_button = true
        c = payload.button.LHS_MULTI_TURN_CLEAR
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_MULTI_TURN_CLEAR" && b == "false") {
        coil_offset_410 = 122
        set_button = false
        c = payload.button.LHS_MULTI_TURN_CLEAR
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_HOME_OFFSET_WRITE" && b == "true") {
        a = "LHS HOME OFFSET 1 SET"
        coil_offset_410 = 123
        set_button = true
        c = payload.button.LHS_HOME_OFFSET_WRITE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_HOME_OFFSET_WRITE" && b == "false") {
        a = "LHS HOME OFFSET 1 SET"
        coil_offset_410 = 123
        set_button = false
        c = payload.button.LHS_HOME_OFFSET_WRITE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_EEPROM_WRITE" && b == "true") {
        coil_offset_410 = 124
        set_button = true
        c = payload.button.LHS_EEPROM_WRITE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_EEPROM_WRITE" && b == "false") {
        coil_offset_410 = 124
        set_button = false
        c = payload.button.LHS_EEPROM_WRITE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "FORCE_OVERRIDE" && b == "true") {
        a = "SAFETY LIMIT ENABLE"
        coil_offset_410 = 125
        set_button = true
        c = payload.button.FORCE_OVERRIDE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "FORCE_OVERRIDE" && b == "false") {
        a = "SAFETY LIMIT ENABLE"
        coil_offset_410 = 125
        set_button = false
        c = payload.button.FORCE_OVERRIDE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "TRIAL_PRODUCTION" && b == "true") {
        a = "TRIAL_PRODUCTION"
        coil_offset_410 = 184
        set_button = true
        c = payload.button.TRIAL_PRODUCTION

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "TRIAL_PRODUCTION" && b == "false") {
        a = "TRIAL_PRODUCTION"
        coil_offset_410 = 184
        set_button = false
        c = payload.button.TRIAL_PRODUCTION

        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_MAIN_DISABLE" && b == "true") {
        a = "RHS_MAIN_DISABLE"
        coil_offset_410 = 183
        set_button = true
        c = payload.button.RHS_MAIN_DISABLE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_MAIN_DISABLE" && b == "false") {
        a = "RHS_MAIN_DISABLE"
        coil_offset_410 = 183
        set_button = false
        c = payload.button.RHS_MAIN_DISABLE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_PRE_DISABLE" && b == "true") {
        a = "RHS_PRE_DISABLE"
        coil_offset_410 = 182
        set_button = true
        c = payload.button.RHS_PRE_DISABLE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "RHS_PRE_DISABLE" && b == "false") {
        a = "RHS_PRE_DISABLE"
        coil_offset_410 = 182
        set_button = false
        c = payload.button.RHS_PRE_DISABLE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_MAIN_DISABLE" && b == "true") {
        a = "LHS_MAIN_DISABLE"
        coil_offset_410 = 181
        set_button = true
        c = payload.button.LHS_MAIN_DISABLE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_MAIN_DISABLE" && b == "false") {
        a = "LHS_MAIN_DISABLE"
        coil_offset_410 = 181
        set_button = false
        c = payload.button.LHS_MAIN_DISABLE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_PRE_DISABLE" && b == "true") {
        a = "LHS_PRE_DISABLE"
        coil_offset_410 = 180
        set_button = true
        c = payload.button.LHS_PRE_DISABLE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "LHS_PRE_DISABLE" && b == "false") {
        a = "LHS_PRE_DISABLE"
        coil_offset_410 = 180
        set_button = false
        c = payload.button.LHS_PRE_DISABLE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "SERVO_CALIBRATION_MODE" && b == "true") {
        coil_offset_410 = 7
        set_button = true
        c = payload.button.SERVO_CALIBRATION_MODE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    else if (a == "SERVO_CALIBRATION_MODE" && b == "false") {
        coil_offset_410 = 7
        set_button = false
        c = payload.button.SERVO_CALIBRATION_MODE
        
        write_coil_410()
        b == "false" & c == false || b == "true" & c == true ? c : writelog()
    }
    
    else if (a == "Y0_0" && b == "true") {
        a = "MAIN TURRET VFD RUN"
        coil_offset_410 = 7490
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_0" && b == "false") {
        a = "MAIN TURRET VFD RUN"
        coil_offset_410 = 7490
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_1" && b == "true") {
        a = "RHS FORCE FEEDER VFD"
        coil_offset_410 = 7491
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_1" && b == "false") {
        a = "RHS FORCE FEEDER VFD"
        coil_offset_410 = 7491
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_2" && b == "true") {
        a = "LHS FORCE FEEDER VFD"
        coil_offset_410 = 7492
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_2" && b == "false") {
        a = "LHS FORCE FEEDER VFD"
        coil_offset_410 = 7492
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_3" && b == "true") {
        a = "LUBRICATION PUMP"
        coil_offset_410 = 7493
        set_button = true
        
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_3" && b == "false") {
        a = "LUBRICATION PUMP"
        coil_offset_410 = 7493
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_4" && b == "true") {
        a = "POWER PACK MOTOR"
        coil_offset_410 = 7494
        set_button = true
        
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_4" && b == "false") {
        a = "POWER PACK MOTOR"
        coil_offset_410 = 7494
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_5" && b == "true") {
        a = "DRAIN VALVE"
        coil_offset_410 = 7495
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_5" && b == "false") {
        a = "DRAIN VALVE"
        coil_offset_410 = 7495
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_6" && b == "true") {
        a = "1ST LAYER EJECTION"
        coil_offset_410 = 7496
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_6" && b == "false") {
        a = "1ST LAYER EJECTION"
        coil_offset_410 = 7496
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_7" && b == "true") {
        a = "PANEL FAN"
        coil_offset_410 = 7497
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_7" && b == "false") {
        a = "PANEL FAN"
        coil_offset_410 = 7497
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_11" && b == "true") {
        a = "LHS SAMPLING TABLET"
        coil_offset_410 = 7501
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_11" && b == "false") {
        a = "LHS SAMPLING TABLET"
        coil_offset_410 = 7501
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_12" && b == "true") {
        a = "RHS SAMPLING TABLET"
        coil_offset_410 = 7502
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_12" && b == "false") {
        a = "RHS SAMPLING TABLET"
        coil_offset_410 = 7502
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_13" && b == "true") {
        a = "LHS REJECTION BY FLAP"
        coil_offset_410 = 7503
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_13" && b == "false") {
        a = "LHS REJECTION BY FLAP"
        coil_offset_410 = 7503
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_14" && b == "true") {
        a = "RHS REJECTION BY FLAP"
        coil_offset_410 = 7504
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_14" && b == "false") {
        a = "RHS REJECTION BY FLAP"
        coil_offset_410 = 7504
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_15" && b == "true") {
        a = "LHS REJECTION BY AIR"
        coil_offset_410 = 7505
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y0_15" && b == "false") {
        a = "LHS REJECTION BY AIR"
        coil_offset_410 = 7505
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y1_0" && b == "true") {
        a = "RHS REJECTION BY AIR"
        coil_offset_410 = 7506
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y1_0" && b == "false") {
        a = "RHS REJECTION BY AIR"
        coil_offset_410 = 7506
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_1" && b == "true") {
        a = "LHS PRE ROLLER UP"
        coil_offset_410 = 7515
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_1" && b == "false") {
        a = "LHS PRE ROLLER UP"
        coil_offset_410 = 7515
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_2" && b == "true") {
        a = "LHS PRE ROLLER DOWN"
        coil_offset_410 = 7516
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_2" && b == "false") {
        a = "LHS PRE ROLLER DOWN"
        coil_offset_410 = 7516
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_3" && b == "true") {
        a = "LHS MAIN ROLLER UP"
        coil_offset_410 = 7517
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_3" && b == "false") {
        a = "LHS MAIN ROLLER UP"
        coil_offset_410 = 7517
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_4" && b == "true") {
        a = "LHS MAIN ROLLER DOWN"
        coil_offset_410 = 7518
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_4" && b == "false") {
        a = "LHS MAIN ROLLER DOWN"
        coil_offset_410 = 7518
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_5" && b == "true") {
        a = "RHS PRE ROLLER UP"
        coil_offset_410 = 7519
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_5" && b == "false") {
        a = "RHS PRE ROLLER UP"
        coil_offset_410 = 7519
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_6" && b == "true") {
        a = "RHS PRE ROLLER DOWN"
        coil_offset_410 = 7520
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_6" && b == "false") {
        a = "RHS PRE ROLLER DOWN"
        coil_offset_410 = 7520
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_7" && b == "true") {
        a = "RHS MAIN ROLLER UP"
        coil_offset_410 = 7521
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y2_7" && b == "false") {
        a = "RHS MAIN ROLLER UP"
        coil_offset_410 = 7521
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    else if (a == "Y3_0" && b == "true") {
        a = "RHS MAIN ROLLER DOWN"
        coil_offset_410 = 7522
        set_button = true
        c = 'false'
        write_coil_410()
        writelog()
    }
    else if (a == "Y3_0" && b == "false") {
        a = "RHS MAIN ROLLER DOWN"
        coil_offset_410 = 7522
        set_button = false
        c = 'false'
        write_coil_410()
        writelog()
        
    }
    
    
    else if (a == "LHS_PRE_MAX") {
        a = "LHS PRE MAX COMP LIMIT"
        reg_offset_6000 = 1000
        reg_write_value = Math.round(b * 100);
        c = payload.machine.LHS.precompression_max
        write_regs()
        writelog()
    }
    else if (a == "LHS_MAIN_MAX") {
        a = "LHS MAIN MAX COMP LIMIT"
        reg_offset_6000 = 1001
        reg_write_value = Math.round(b * 100);
        c = payload.machine.LHS.maincompression_max
        write_regs()
        writelog()
    }
    else if (a == "LHS_EJN_MAX") {
        a = "LHS EJN MAX COMP LIMIT"
        reg_offset_6000 = 1002
        reg_write_value = b*10
        c = payload.machine.LHS.ejection_max
        write_regs()
        writelog()
    }
    else if (a == "RHS_PRE_MAX") {
        a = "RHS PRE MAX COMP LIMIT"
        reg_offset_6000 = 1003
        reg_write_value = Math.round(b * 100);
        c = payload.machine.RHS.precompression_max
        write_regs()
        writelog()
    }
    else if (a == "RHS_MAIN_MAX") {
        a = "RHS MAIN MAX COMP LIMIT"
        reg_offset_6000 = 1004
        reg_write_value = Math.round(b * 100);
        c = payload.machine.RHS.maincompression_max
        write_regs()
        writelog()
    }
    else if (a == "RHS_EJN_MAX") {
        a = "RHS EJN MAX COMP LIMIT"
        reg_offset_6000 = 1005
        reg_write_value = b*10
        c = payload.machine.RHS.ejection_max
        write_regs()
        writelog()
    }
    else if (a == "B_TYPE_HEAD_FLAT") {
        a = "HEAD FLAT B MM"
        reg_offset_6000 = 1006
        reg_write_value = Math.round(b * 100);
        c = payload.stats.B_HEAD
        write_regs_32()
        writelog()
    }
    else if (a == "B_TYPE_PCD") {
        a = "PCD B MM"
        reg_offset_6000 = 1008
        reg_write_value = Math.round(b * 100);
        c = payload.stats.B_PCD
        write_regs_32()
        writelog()
    }
    else if (a == "D_TYPE_HEAD_FLAT") {
        a = "HEAD FLAT D MM"
        reg_offset_6000 = 1010
        reg_write_value = Math.round(b * 100);
        c = payload.stats.D_HEAD
        write_regs_32()
        writelog()
    }
    else if (a == "D_TYPE_PCD") {
        a = "PCD D MM"
        reg_offset_6000 = 1012
        reg_write_value = Math.round(b * 100);
        c = payload.stats.D_PCD
        write_regs_32()
        writelog()
    }
    else if (a == "TOTAL_PUNCHES") {
        a = "TOTAL PUNCHES"
        reg_offset_6000 = 1014
        reg_write_value = b
        c = payload.stats.total_punches
        write_regs()
        writelog()
    }
    else if (a == "RHS_FILL_DEPTH_MAX_MM") {
        reg_offset_6000 = 1016
        reg_write_value = Math.round(b * 100);
        console.log(reg_write_value)
        c = payload.stats.LHSdepth.analog_max
        write_regs()
        writelog()
    }
    else if (a == "RHS_FILL_DEPTH_MIN_MM") {
        reg_offset_6000 = 1017
        reg_write_value = Math.round(b * 100);
        c = payload.stats.LHSdepth.analog_min
        write_regs()
        writelog()
    }
    else if (a == "RHS_FILL_DEPTH_MAX_DEPTH") {
        reg_offset_6000 = 1018
        reg_write_value = Math.round(b * 100);
        c = payload.stats.LHSdepth.depth_max
        payload.stats.LHSdepth.depth_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_FILL_DEPTH_MIN_DEPTH") {
        reg_offset_6000 = 1019
        reg_write_value = Math.round(b * 100);
        c = payload.stats.LHSdepth.depth_min
        payload.stats.LHSdepth.depth_min = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_FILL_DEPTH_MAX_MM") {
        reg_offset_6000 = 1020
        reg_write_value = Math.round(b * 100);
        c = payload.stats.RHSdepth.analog_max
        payload.stats.RHSdepth.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_FILL_DEPTH_MIN_MM") {
        reg_offset_6000 = 1021
        reg_write_value = Math.round(b * 100);
        c = payload.stats.RHSdepth.analog_min
        payload.stats.RHSdepth.analog_min = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_FILL_DEPTH_MAX_DEPTH") {
        reg_offset_6000 = 1022
        reg_write_value = Math.round(b * 100);
        c = payload.stats.RHSdepth.depth_max
        payload.stats.RHSdepth.depth_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_FILL_DEPTH_MIN_DEPTH") {
        reg_offset_6000 = 1023
        reg_write_value = Math.round(b * 100);
        c = payload.stats.RHSdepth.depth_min
        payload.stats.RHSdepth.depth_min = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_PRE_MAX_ANALOG_K_VALUE") {
        a = "LHS PRE ROLLER MAX ANALOG VALUE"
        reg_offset_6000 = 1024
        reg_write_value = b
        c = payload.stats.LHSweight.analog_max
        payload.stats.LHSweight.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_PRE_MIN_ANALOG_K_VALUE") {
        a = "LHS PRE ROLLER MIN ANALOG VALUE"
        reg_offset_6000 = 1025
        reg_write_value = b
        c = payload.stats.LHSweight.analog_min
        payload.stats.LHSweight.analog_min = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_PRE_MAX_DEPTH_MM") {
        a = "LHS PRE ROLLER MAX DEPTH MM"
        reg_offset_6000 = 1026
        reg_write_value = b*10
        c = payload.stats.LHSweight.weight_max
        payload.stats.LHSweight.weight_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_PRE_MIN_DEPTH_MM") {
        a = "LHS PRE ROLLER MIN DEPTH MM"
        reg_offset_6000 = 1027
        reg_write_value = b*10
        c = payload.stats.LHSweight.weight_min
        payload.stats.LHSweight.weight_min = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_MAIN_MAX_ANALOG_K_VALUE") {
        a = "LHS MAIN ROLLER MAX ANALOG VALUE"
        reg_offset_6000 = 1028
        reg_write_value = b
        c = payload.stats.RHSweight.analog_max
        payload.stats.RHSweight.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_MAIN_MIN_ANALOG_K_VALUE") {
        a = "LHS MAIN ROLLER MIN ANALOG VALUE"
        reg_offset_6000 = 1029
        reg_write_value = b
        c = payload.stats.RHSweight.analog_max
        payload.stats.RHSweight.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_MAIN_MAX_DEPTH_MM") {
        a = "LHS MAIN ROLLER MAX DEPTH MM"
        reg_offset_6000 = 1030
        reg_write_value = b*10
        c = payload.stats.RHSweight.weight_max
        payload.stats.RHSweight.weight_max = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_MAIN_MIN_DEPTH_MM") {
        a = "LHS MAIN ROLLER MIN DEPTH MM"
        reg_offset_6000 = 1031
        reg_write_value = b*10
        c = payload.stats.RHSweight.weight_max
        payload.stats.RHSweight.weight_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_PRE_MAX_ANALOG_K_VALUE") {
        a = "RHS PRE ROLLER MAX ANALOG VALUE"
        reg_offset_6000 = 1032
        reg_write_value = b
        c = payload.stats.LHSthickness.analog_max
        payload.stats.LHSthickness.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_PRE_MIN_ANALOG_K_VALUE") {
        a = "RHS PRE ROLLER MIN ANALOG VALUE"
        reg_offset_6000 = 1033
        reg_write_value = b
        c = payload.stats.LHSthickness.analog_max
        payload.stats.LHSthickness.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_PRE_MAX_DEPTH_MM") {
        a = "RHS PRE ROLLER MAX DEPTH MM"
        reg_offset_6000 = 1034
        reg_write_value = b*10
        c = payload.stats.LHSthickness.thickness_max
        payload.stats.LHSthickness.thickness_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_PRE_MIN_DEPTH_MM") {
        a = "RHS PRE ROLLER MIN DEPTH MM"
        reg_offset_6000 = 1035
        reg_write_value = b*10
        c = payload.stats.LHSthickness.thickness_min
        payload.stats.LHSthickness.thickness_min = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_MAIN_MAX_ANALOG_K_VALUE") {
        a = "RHS MAIN ROLLER MAX ANALOG VALUE"
        reg_offset_6000 = 1036
        reg_write_value = b
        c = payload.stats.RHSthickness.analog_max
        payload.stats.RHSthickness.analog_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_MAIN_MIN_ANALOG_K_VALUE") {
        a = "RHS MAIN ROLLER MIN ANALOG VALUE"
        reg_offset_6000 = 1037
        reg_write_value = b
        c = payload.stats.RHSthickness.analog_min
        payload.stats.RHSthickness.analog_min = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_MAIN_MAX_DEPTH_MM") {
        a = "RHS MAIN ROLLER MAX DEPTH MM"
        reg_offset_6000 = 1038
        reg_write_value = b*10
        c = payload.stats.RHSthickness.thickness_max
        payload.stats.RHSthickness.thickness_max = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_MAIN_MIN_DEPTH_MM") {
        a = "RHS MAIN ROLLER MIN DEPTH MM"
        reg_offset_6000 = 1039
        reg_write_value = b*10
        c = payload.stats.RHSthickness.thickness_min
        payload.stats.RHSthickness.thickness_min = b;
        write_regs()
        writelog()
    }
    else if (a == "TURRET_MAX_RPM") {
        a = "TURRET MAX RPM"
        reg_offset_6000 = 1040
        reg_write_value = b
        c = payload.stats.turret.max_rpm
        payload.stats.turret.max_rpm = b;
        write_regs()
        writelog()
    }
    else if (a == "TURRET_MAX_FREQ") {
        a = "TURRET MAX ANALOG VALUE"
        reg_offset_6000 = 1041
        // reg_write_value = Math.round(b * 100);
        reg_write_value = b;
        c = payload.stats.turret.max_freq
        payload.stats.turret.max_freq = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_FORCE_FEEDER_MAX_RPM") {
        a = "RHS FEEDER MAX RPM"
        reg_offset_6000 = 1042
        reg_write_value = b
        c = payload.stats.LHS_FF.max_rpm
        payload.stats.LHS_FF.max_rpm = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_FORCE_FEEDER_MAX_FREQ") {
        a = "RHS FEEDER MAX ANALOG VALUE"
        reg_offset_6000 = 1043
        // reg_write_value = Math.round(b * 100);
        reg_write_value = b;
        c = payload.stats.LHS_FF.max_freq
        payload.stats.LHS_FF.max_freq = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_FORCE_FEEDER_MAX_RPM") {
        a = "LHS FEEDER MAX RPM"
        reg_offset_6000 = 1044
        reg_write_value = b
        c = payload.stats.RHS_FF.max_rpm
        payload.stats.RHS_FF.max_rpm = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_FORCE_FEEDER_MAX_FREQ") {
        a = "LHS FEEDER MAX ANALOG VALUE"
        reg_offset_6000 = 1045
        // reg_write_value = Math.round(b * 100);
        reg_write_value = b;
        c = payload.stats.RHS_FF.max_freq
        payload.stats.RHS_FF.max_freq = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_PRE_OFFSET") {
        a = "LHS PCM PUNCH OFFSET"
        reg_offset_6000 = 1046
        reg_write_value = b
        c = payload.stats.punch_offset_position.L_PRE
        payload.stats.punch_offset_position.L_PRE = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_MAIN_OFFSET") {
        a = "LHS MCM PUNCH OFFSET"
        reg_offset_6000 = 1047
        reg_write_value = b
        c = payload.stats.punch_offset_position.L_MAIN
        payload.stats.punch_offset_position.L_MAIN = b;
        write_regs()
        writelog()
    }
    else if (a == "LHS_EJN_OFFSET") {
        a = "LHS EJECTION PUNCH OFFSET"
        reg_offset_6000 = 1048
        reg_write_value = b
        c = payload.stats.punch_offset_position.L_EJN
        payload.stats.punch_offset_position.L_EJN = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_PRE_OFFSET") {
        a = "RHS PCM PUNCH OFFSET"
        reg_offset_6000 = 1049
        reg_write_value = b
        c = payload.stats.punch_offset_position.R_PRE
        payload.stats.punch_offset_position.R_PRE = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_MAIN_OFFSET") {
        a = "RHS MCM PUNCH OFFSET"
        reg_offset_6000 = 1050
        reg_write_value = b
        c = payload.stats.punch_offset_position.R_MAIN
        payload.stats.punch_offset_position.R_MAIN = b;
        write_regs()
        writelog()
    }
    else if (a == "RHS_EJN_OFFSET") {
        a = "RHS EJECTION PUNCH OFFSET"
        reg_offset_6000 = 1051
        reg_write_value = b
        c = payload.stats.punch_offset_position.R_EJN
        payload.stats.punch_offset_position.R_EJN = b;
        write_regs()
        writelog()
    }
    else if (a == "HYDRAULIC_PRESSURE_MAX") {
        a = "SET MAX HYDRAULIC PRESSURE"
        reg_offset_6000 = 1052
        reg_write_value = b
        c = payload.stats.hydraulic.max_pressure
        payload.stats.hydraulic.max_pressure = b;
        write_regs()
        writelog()
    }
    else if (a == "L_AIR_MONO") {
        a = "MONOLAYER LHS AIR REJECTION PUNCH OFFSET"
        reg_offset_6000 = 1053
        reg_write_value = b
        c = payload.stats.punch_offset_position.L_AIR_MONO
        write_regs()
        writelog()
    }
    else if (a == "L_FLAP_MONO") {
        a = "MONOLAYER LHS FLAP REJECTION PUNCH OFFSET"
        reg_offset_6000 = 1054
        reg_write_value = b
        c = payload.stats.punch_offset_position.L_FLAP_MONO
        write_regs()
        writelog()
    }
    else if (a == "R_AIR_MONO") {
        a = "MONOLAYER RHS AIR REJECTION PUNCH OFFSET"
        reg_offset_6000 = 1055
        reg_write_value = b
        c = payload.stats.punch_offset_position.R_AIR_MONO
        write_regs()
        writelog()
    }
    else if (a == "R_FLAP_MONO") {
        a = "MONOLAYER RHS FLAP REJECTION PUNCH OFFSET"
        reg_offset_6000 = 1056
        reg_write_value = b
        c = payload.stats.punch_offset_position.R_FLAP_MONO
        write_regs()
        writelog()
    }
    else if (a == "L_AIR_BI") {
        a = "BILAYER LHS AIR REJECTION PUNCH OFFSET"
        reg_offset_6000 = 1057
        reg_write_value = b
        c = payload.stats.punch_offset_position.L_AIR_BI
        write_regs()
        writelog()
    }
    else if (a == "L_FLAP_BI") {
        a = "BILAYER LHS FLAP REJECTION PUNCH OFFSET"
        reg_offset_6000 = 1058
        reg_write_value = b
        c = payload.stats.punch_offset_position.L_FLAP_BI
        write_regs()
        writelog()
    }
    else if (a == "R_AIR_BI") {
        a = "BILAYER RHS AIR REJECTION PUNCH OFFSET"
        reg_offset_6000 = 1059
        reg_write_value = b
        c = payload.stats.punch_offset_position.R_AIR_BI
        write_regs()
        writelog()
    }
    else if (a == "R_FLAP_BI") {
        a = "BILAYER RHS FLAP REJECTION PUNCH OFFSET"
        reg_offset_6000 = 1060
        reg_write_value = b
        c = payload.stats.punch_offset_position.R_FLAP_BI
        write_regs()
        writelog()
    }
    else if (a == "L_AIR_ON") {
        a = " LHS AIR REJECTION ON PULSE"
        reg_offset_6000 = 1061
        reg_write_value = b
        c = payload.stats.rejection.pulse.L_AIR_ON
        write_regs()
        writelog()
    }
    else if (a == "L_AIR_OFF") {
        a = " LHS AIR REJECTION OFF PULSE"
        reg_offset_6000 = 1062
        reg_write_value = b
        c = payload.stats.rejection.pulse.L_AIR_OFF
        write_regs()
        writelog()
    }
    else if (a == "L_FLAP_ON") {
        a = " LHS FLAP REJECTION ON PULSE"
        reg_offset_6000 = 1063
        reg_write_value = b
        c = payload.stats.rejection.pulse.L_FLAP_ON
        write_regs()
        writelog()
    }
    else if (a == "L_FLAP_OFF") {
        a = " LHS FLAP REJECTION OFF PULSE"
        reg_offset_6000 = 1064
        reg_write_value = b
        c = payload.stats.rejection.pulse.L_FLAP_OFF
        write_regs()
        writelog()
    }
    else if (a == "R_AIR_ON") {
        a = "RHS AIR REJECTION ON PULSE"

        reg_offset_6000 = 1065
        reg_write_value = b
        c = payload.stats.rejection.pulse.R_AIR_ON
        write_regs()
        writelog()
    }
    else if (a == "R_AIR_OFF") {
        a = "RHS AIR REJECTION OFF PULSE"

        reg_offset_6000 = 1066
        reg_write_value = b
        c = payload.stats.rejection.pulse.R_AIR_OFF
        write_regs()
        writelog()
    }
    else if (a == "R_FLAP_ON") {
        a = "RHS FLAP REJECTION ON PULSE"
        reg_offset_6000 = 1067
        reg_write_value = b
        c = payload.stats.rejection.pulse.R_FLAP_ON
        write_regs()
        writelog()
    }
    else if (a == "R_FLAP_OFF") {
        a = "RHS FLAP REJECTION OFF PULSE"
        reg_offset_6000 = 1068
        reg_write_value = b
        c = payload.stats.rejection.pulse.R_FLAP_OFF
        write_regs()
        writelog()
    }
    else if (a == "L_AIR_OFF_TIME") {
        a = " LHS AIR REJECTION OFF TIME"
        reg_offset_6000 = 1069
        reg_write_value = b
        c = payload.stats.rejection.air.L_AIR_OFF_TIME
        write_regs()
        writelog()
    }
    else if (a == "L_FLAP_OFF_TIME") {
        a = " LHS FLAP REJECTION OFF TIME"
        reg_offset_6000 = 1070
        reg_write_value = b
        c = payload.stats.rejection.air.L_FLAP_OFF_TIME
        write_regs()
        writelog()
    }
    else if (a == "R_AIR_OFF_TIME") {
        a = "RHS AIR REJECTION OFF TIME"
        reg_offset_6000 = 1071
        reg_write_value = b
        c = payload.stats.rejection.air.R_AIR_OFF_TIME
        write_regs()
        writelog()
    }
    else if (a == "R_FLAP_OFF_TIME") {
        a = "RHS FLAP REJECTION OFF TIME"
        reg_offset_6000 = 1072
        reg_write_value = b
        c = payload.stats.rejection.air.R_FLAP_OFF_TIME
        write_regs()
        writelog()
    }
    else if (a == "MAXIMUM_REJECT_TABLET") {
        reg_offset_6000 = 1073
        reg_write_value = b
        c = payload.stats.awc.MAXIMUM_REJECT_TABLET
        write_regs()
        writelog()
    }
    else if (a == "RTN_1_MM") {
        reg_offset_6000 = 1074
        reg_write_value = Math.round(b * 100);
        c = payload.stats.awc.RTN_1_MM
        write_regs()
        writelog()
    }
    else if (a == "SINGLE_TURN_DATA_PPR") {
        a = "SINGLE TURN DATA PPR"
        reg_offset_6000 = 1076
        reg_write_value = b
        c = payload.stats.awc.RTN_1_PPR
        write_regs_32()
        writelog()
    }
    else if (a == "RHS_HOME_OFFSET_1") {
        reg_offset_6000 = 1078
        reg_write_value = b
        c = payload.stats.awc.RHS_HOME_OFFSET_1
        write_regs_32()
        writelog()
    }
    else if (a == "RHS_HOME_OFFSET_2") {
        reg_offset_6000 = 1080
        reg_write_value = b
        c = payload.stats.awc.RHS_HOME_OFFSET_2
        write_regs_32()
        writelog()
    }
    else if (a == "LHS_HOME_OFFSET_1") {
        reg_offset_6000 = 1082
        reg_write_value = b
        c = payload.stats.awc.LHS_HOME_OFFSET_1
        write_regs_32()
        writelog()
    }
    else if (a == "LHS_HOME_OFFSET_2") {
        reg_offset_6000 = 1084
        reg_write_value = b
        c = payload.stats.awc.LHS_HOME_OFFSET_2
        write_regs_32()
        writelog()
    }
    else if (a == "SERVO_RHS_UPPERLIMIT") {
        a = "RHS SERVO UPPER LIMIT"
        reg_offset_6000 = 1089
        reg_write_value = b
        c = payload.stats.SERVO_RHS_UPPERLIMIT
        write_regs_32()
        writelog()
    }
    else if (a == "SERVO_RHS_LOWERLIMIT") {
        a = "RHS SERVO LOWER LIMIT"
        reg_offset_6000 = 1091
        reg_write_value = b
        c = payload.stats.SERVO_RHS_LOWERLIMIT
        write_regs_32()
        writelog()
    }
    else if (a == "SERVO_LHS_UPPERLIMIT") {
        a = "LHS SERVO UPPER LIMIT"
        reg_offset_6000 = 1093
        reg_write_value = b
        c = payload.stats.SERVO_LHS_UPPERLIMIT
        write_regs_32()
        writelog()
    }
    else if (a == "SERVO_LHS_LOWERLIMIT") {
        a = "LHS SERVO LOWER LIMIT"
        reg_offset_6000 = 1095
        reg_write_value = b
        c = payload.stats.SERVO_LHS_LOWERLIMIT
        write_regs_32()
        writelog()
    }
    else if (a == "TABLET_MULTIPLICATION_FACTOR") {
        reg_offset_6000 = 1097
        reg_write_value = b
        c = payload.stats.TABLET_MULTIPLICATION_FACTOR
        write_regs()
        writelog()
    }
    else if (a == "SAFETY_MULTIPLICATION_FACTOR") {
        reg_offset_6000 = 1098
        reg_write_value = b
        c = payload.stats.SAFETY_MULTIPLICATION_FACTOR
        write_regs()
        writelog()
    }
    else if (a == "MACHINE_STOP_DELAY") {
        reg_offset_6000 = 1099
        reg_write_value = b*10
        c = payload.stats.MACHINE_STOP_DELAY
        write_regs()
        writelog()
    }
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json({ message: `[ UPDATED ${a} to ${b} ]` });
});

app.get("/api/set/batchinfo/:batch/:operator", (req, res) => {
    const a = req.params.batch
    const b = req.params.operator;

    batchinfo.name = a
    batchinfo.operator = b
    console.log('[ BATCH UPDATED ]')

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(batchinfo)
});

app.get("/api/check/batchinfo", (req, res) => {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(batchinfo)
});

// Start Server
const port = 3128;
app.listen(port, () => console.log(`Server running on port ${port} 👑`));