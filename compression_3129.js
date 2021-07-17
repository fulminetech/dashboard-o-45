var ModbusRTU = require("modbus-serial");
const express = require("express");
const { exec } = require('child_process');
const { fail } = require("assert");

const restart1Command = "./restart.sh"

// const restart1Command = "pm2 reload stats_3128 && pm2 reload main_5000 && pm2 reload compression_3129"
// const restart1Command = "pm2 restart stats_3128"
// const restart2Command = "pm2 restart main_5000"
// const restart3Command = "pm2 restart compression_3129"
// const restart1Command = "restart.sh"

const app = express();

// Timestamp for which returns current date and time 
var noww = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
console.log('Start:', noww)
var startTime = + new Date();

var payload = {
    connection: false,
    batch: 0,
    data_number: 0, // Rotation Number
    rotation_no: 0,
    present_punch: 0,
    precompressionLHS_avg: 0,
    precompressionRHS_avg: 0,
    maincompressionLHS_avg: 0,
    maincompressionRHS_avg: 0,
    ejectionLHS_avg: 0,
    ejectionRHS_avg: 0,
    input: {},
    output: {},
    alarm: {},
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
    },
    stats: {
        status: "OFFLINE",
        count: 0,
        tablets_per_hour: 0,
        rpm: 0,
        active_punches: 0,
        dwell: 0
    },
    punch1: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch2: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch3: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch4: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch5: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch6: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch7: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch8: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch9: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch10: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch11: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch12: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch13: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch14: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch15: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch16: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch17: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch18: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch19: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch20: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch21: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch22: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch23: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch24: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch25: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch26: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch27: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch28: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch29: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch30: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch31: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch32: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch33: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch34: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch35: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch36: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch37: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch38: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch39: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch40: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch41: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch42: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch43: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch44: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    },
    punch45: {
        LHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        },
        RHS: {
            precompression: 0,
            maincompression: 0,
            ejection: 0,
            status: false
        }
    }
};

// Modbus TCP configs
var client = new ModbusRTU();
const slaveID = 1;
// const ip = "10.0.0.103"
const ip = "192.168.1.5"
// const ip = "192.168.0.99"

// Modbus Addresses
const precompressionLHS_address = 2000;
const precompressionRHS_address = 2400;
const maincompressionLHS_address = 2200;
const maincompressionRHS_address = 2600;
const ejectionLHS_address = 2800;
const ejectionRHS_address = 3000;
const input_address = 24576;
const output_address = 40960;
const alarm_address = 469;

const avg_address = 3204;
const status_address = 540;

const time_address = 100;

// Modbus 'state' constants
var MBS_STATE_INIT = "State init";

var MBS_STATE_GOOD_READ_TIME = "State good time (read)";
var MBS_STATE_GOOD_READ_PRELHS = "State good pre LHS (read)";
var MBS_STATE_GOOD_READ_PRERHS = "State good pre RHS (read)";
var MBS_STATE_GOOD_READ_MAINLHS = "State good main LHS (read)";
var MBS_STATE_GOOD_READ_MAINRHS = "State good main RHS (read)";
var MBS_STATE_GOOD_READ_EJNLHS = "State good ejn LHS (read)";
var MBS_STATE_GOOD_READ_EJNRHS = "State good ejn RHS (read)";
var MBS_STATE_GOOD_READ_AVG = "State good avg (read)";
var MBS_STATE_GOOD_READ_STATUS = "State good status (read)";
var MBS_STATE_GOOD_READ_STATS = "State good stats (read)";
var MBS_STATE_GOOD_READ_INPUT = "State good input (read)";
var MBS_STATE_GOOD_READ_OUTPUT = "State good output (read)";
var MBS_STATE_GOOD_READ_ALARM = "State good alarm (read)";

var MBS_STATE_FAIL_READ_TIME = "State fail time (read)";
var MBS_STATE_FAIL_READ_PRELHS = "State fail pre LHS (read)";
var MBS_STATE_FAIL_READ_PRERHS = "State fail pre RHS (read)";
var MBS_STATE_FAIL_READ_MAINLHS = "State fail main LHS (read)";
var MBS_STATE_FAIL_READ_MAINRHS = "State fail main RHS (read)";
var MBS_STATE_FAIL_READ_EJNLHS = "State fail ejn LHS (read)";
var MBS_STATE_FAIL_READ_EJNRHS = "State fail ejn RHS (read)";
var MBS_STATE_FAIL_READ_AVG = "State fail avg (read)";
var MBS_STATE_FAIL_READ_STATUS = "State fail status (read)";
var MBS_STATE_FAIL_READ_STATS = "State fail stats (read)";
var MBS_STATE_FAIL_READ_INPUT = "State fail input (read)";
var MBS_STATE_FAIL_READ_OUTPUT = "State fail output (read)";
var MBS_STATE_FAIL_READ_ALARM = "State fail alarm (read)";

var MBS_STATE_GOOD_CONNECT = "State good (port)";
var MBS_STATE_FAIL_CONNECT = "State fail (port)";

var mbsState = MBS_STATE_INIT;

var mbsTimeout = 5000;
var mbsScan = 20;
// var mbsScan = 100; // Modbus scan time

let readfailed = 0;
let failcounter = 15;

let connectfailed = 0
let connectcounter = 3

let timecheck = 3;
let timetemp = 0;

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
            payload.connection = true
            console.log(`[ CONNECTED ]`)
        })
        .then(function () {
            runModbus()
        })
        .catch(function (e) {
            mbsState = MBS_STATE_FAIL_CONNECT;
            payload.connection = false
            connectfailed++
            
            if (connectfailed > connectcounter) {
                restartprodmodbus()
                connectfailed=0
            }
            
            console.log(`[ FAILED TO CONNECT ]`)

            setTimeout(() => {
                connectClient()
            }, 500);
            // console.log(e);
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
            nextAction = readpreLHS;
            break;

        case MBS_STATE_GOOD_READ_PRELHS || MBS_STATE_FAIL_READ_PRELHS:
            nextAction = readpreRHS;
            break;

        case MBS_STATE_GOOD_READ_PRERHS || MBS_STATE_FAIL_READ_PRERHS:
            nextAction = readmainLHS;
            break;

        case MBS_STATE_GOOD_READ_MAINLHS || MBS_STATE_FAIL_READ_MAINLHS:
            nextAction = readmainRHS;
            break;

        case MBS_STATE_GOOD_READ_MAINRHS || MBS_STATE_FAIL_READ_MAINRHS:
            nextAction = readejnLHS;
            break;

        case MBS_STATE_GOOD_READ_EJNLHS || MBS_STATE_FAIL_READ_EJNLHS:
            nextAction = readejnRHS;
            break;

            // case MBS_STATE_GOOD_READ_MAINRHS || MBS_STATE_FAIL_READ_MAINRHS:
            
        case MBS_STATE_GOOD_READ_EJNRHS || MBS_STATE_FAIL_READ_EJNRHS:
            nextAction = readavg;
            break;

        case MBS_STATE_GOOD_READ_AVG || MBS_STATE_FAIL_READ_AVG:
            nextAction = readstatus;
            break;

        case MBS_STATE_GOOD_READ_STATUS || MBS_STATE_FAIL_READ_STATUS:
            nextAction = readinput;
            break;

        case MBS_STATE_GOOD_READ_INPUT || MBS_STATE_FAIL_READ_INPUT:
            nextAction = readoutput;
            break;

        case MBS_STATE_GOOD_READ_OUTPUT || MBS_STATE_GOOD_READ_OUTPUT:
            nextAction = readalarm;
            break;
            
        case MBS_STATE_GOOD_READ_ALARM || MBS_STATE_FAIL_READ_ALARM:
            nextAction = readpreLHS;
            break;

        case MBS_STATE_FAIL_CONNECT:
            nextAction = connectClient;
            break;

        default:
        // nothing to do, keep scanning until actionable case

    }

    // console.log(mbsState);
    // console.log(nextAction);

    // console.log(readfailed)

    if (readfailed > failcounter) {
        payload.connection = false;
        readfailed = 0
        client.close();
        restartprodmodbus()
    }

    // execute "next action" function if defined
    if (nextAction !== undefined) {
        nextAction();
    } else {
        readpreLHS();
    }

    // set for next run
    setTimeout(runModbus, mbsScan);
}

var readpreLHS = function () {
    client.readHoldingRegisters(precompressionLHS_address, 45)
        .then(function (precompressionLHS) {
            // console.log((+ new Date() - startTime) / 1000, '1! Precompression:', precompressionLHS.data[0]);
            payload.punch1.LHS.precompression = precompressionLHS.data[0];
            payload.punch2.LHS.precompression = precompressionLHS.data[1];
            payload.punch3.LHS.precompression = precompressionLHS.data[2];
            payload.punch4.LHS.precompression = precompressionLHS.data[3];
            payload.punch5.LHS.precompression = precompressionLHS.data[4];
            payload.punch6.LHS.precompression = precompressionLHS.data[5];
            payload.punch7.LHS.precompression = precompressionLHS.data[6];
            payload.punch8.LHS.precompression = precompressionLHS.data[7];
            payload.punch9.LHS.precompression = precompressionLHS.data[8];
            payload.punch10.LHS.precompression = precompressionLHS.data[9];
            payload.punch11.LHS.precompression = precompressionLHS.data[10];
            payload.punch12.LHS.precompression = precompressionLHS.data[11];
            payload.punch13.LHS.precompression = precompressionLHS.data[12];
            payload.punch14.LHS.precompression = precompressionLHS.data[13];
            payload.punch15.LHS.precompression = precompressionLHS.data[14];
            payload.punch16.LHS.precompression = precompressionLHS.data[15];
            payload.punch17.LHS.precompression = precompressionLHS.data[16];
            payload.punch18.LHS.precompression = precompressionLHS.data[17];
            payload.punch19.LHS.precompression = precompressionLHS.data[18];
            payload.punch20.LHS.precompression = precompressionLHS.data[19];
            payload.punch21.LHS.precompression = precompressionLHS.data[20];
            payload.punch22.LHS.precompression = precompressionLHS.data[21];
            payload.punch23.LHS.precompression = precompressionLHS.data[22];
            payload.punch24.LHS.precompression = precompressionLHS.data[23];
            payload.punch25.LHS.precompression = precompressionLHS.data[24];
            payload.punch26.LHS.precompression = precompressionLHS.data[25];
            payload.punch27.LHS.precompression = precompressionLHS.data[26];
            payload.punch28.LHS.precompression = precompressionLHS.data[27];
            payload.punch29.LHS.precompression = precompressionLHS.data[28];
            payload.punch30.LHS.precompression = precompressionLHS.data[29];
            payload.punch31.LHS.precompression = precompressionLHS.data[30];
            payload.punch32.LHS.precompression = precompressionLHS.data[31];
            payload.punch33.LHS.precompression = precompressionLHS.data[32];
            payload.punch34.LHS.precompression = precompressionLHS.data[33];
            payload.punch35.LHS.precompression = precompressionLHS.data[34];
            payload.punch36.LHS.precompression = precompressionLHS.data[35];
            payload.punch37.LHS.precompression = precompressionLHS.data[36];
            payload.punch38.LHS.precompression = precompressionLHS.data[37];
            payload.punch39.LHS.precompression = precompressionLHS.data[38];
            payload.punch40.LHS.precompression = precompressionLHS.data[39];
            payload.punch41.LHS.precompression = precompressionLHS.data[40];
            payload.punch42.LHS.precompression = precompressionLHS.data[41];
            payload.punch43.LHS.precompression = precompressionLHS.data[42];
            payload.punch44.LHS.precompression = precompressionLHS.data[43];
            payload.punch45.LHS.precompression = precompressionLHS.data[44];

            mbsState = MBS_STATE_GOOD_READ_PRELHS;
            // console.log(`${(+ new Date() - startTime)0} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ #1 Precompression LHS Garbage ]')
            mbsState = MBS_STATE_FAIL_READ_PRELHS;
            readfailed++;
            //console.log(`${(+ new Date() - startTime)0} : ${mbsState}`)
        })
}

var readpreRHS = function () {
    client.readHoldingRegisters(precompressionRHS_address, 45)
        .then(function (precompressionRHS) {
            // console.log("Pre RHS: ",precompressionRHS.data)
            payload.punch1.RHS.precompression = precompressionRHS.data[0];
            payload.punch2.RHS.precompression = precompressionRHS.data[1];
            payload.punch3.RHS.precompression = precompressionRHS.data[2];
            payload.punch4.RHS.precompression = precompressionRHS.data[3];
            payload.punch5.RHS.precompression = precompressionRHS.data[4];
            payload.punch6.RHS.precompression = precompressionRHS.data[5];
            payload.punch7.RHS.precompression = precompressionRHS.data[6];
            payload.punch8.RHS.precompression = precompressionRHS.data[7];
            payload.punch9.RHS.precompression = precompressionRHS.data[8];
            payload.punch10.RHS.precompression = precompressionRHS.data[9];
            payload.punch11.RHS.precompression = precompressionRHS.data[10];
            payload.punch12.RHS.precompression = precompressionRHS.data[11];
            payload.punch13.RHS.precompression = precompressionRHS.data[12];
            payload.punch14.RHS.precompression = precompressionRHS.data[13];
            payload.punch15.RHS.precompression = precompressionRHS.data[14];
            payload.punch16.RHS.precompression = precompressionRHS.data[15];
            payload.punch17.RHS.precompression = precompressionRHS.data[16];
            payload.punch18.RHS.precompression = precompressionRHS.data[17];
            payload.punch19.RHS.precompression = precompressionRHS.data[18];
            payload.punch20.RHS.precompression = precompressionRHS.data[19];
            payload.punch21.RHS.precompression = precompressionRHS.data[20];
            payload.punch22.RHS.precompression = precompressionRHS.data[21];
            payload.punch23.RHS.precompression = precompressionRHS.data[22];
            payload.punch24.RHS.precompression = precompressionRHS.data[23];
            payload.punch25.RHS.precompression = precompressionRHS.data[24];
            payload.punch26.RHS.precompression = precompressionRHS.data[25];
            payload.punch27.RHS.precompression = precompressionRHS.data[26];
            payload.punch28.RHS.precompression = precompressionRHS.data[27];
            payload.punch29.RHS.precompression = precompressionRHS.data[28];
            payload.punch30.RHS.precompression = precompressionRHS.data[29];
            payload.punch31.RHS.precompression = precompressionRHS.data[30];
            payload.punch32.RHS.precompression = precompressionRHS.data[31];
            payload.punch33.RHS.precompression = precompressionRHS.data[32];
            payload.punch34.RHS.precompression = precompressionRHS.data[33];
            payload.punch35.RHS.precompression = precompressionRHS.data[34];
            payload.punch36.RHS.precompression = precompressionRHS.data[35];
            payload.punch37.RHS.precompression = precompressionRHS.data[36];
            payload.punch38.RHS.precompression = precompressionRHS.data[37];
            payload.punch39.RHS.precompression = precompressionRHS.data[38];
            payload.punch40.RHS.precompression = precompressionRHS.data[39];
            payload.punch41.RHS.precompression = precompressionRHS.data[40];
            payload.punch42.RHS.precompression = precompressionRHS.data[41];
            payload.punch43.RHS.precompression = precompressionRHS.data[42];
            payload.punch44.RHS.precompression = precompressionRHS.data[43];
            payload.punch45.RHS.precompression = precompressionRHS.data[44];

            mbsState = MBS_STATE_GOOD_READ_PRERHS;
            // console.log(`${(+ new Date() - startTime)0} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ #1 Precompression RHS Garbage ]')
            mbsState = MBS_STATE_FAIL_READ_PRERHS;
            readfailed++;
            //console.log(`${(+ new Date() - startTime)0} : ${mbsState}`)
        })
}

var readmainLHS = function () {
    client.readHoldingRegisters(maincompressionLHS_address, 45)
        .then(function (maincompressionLHS) {
            // console.log("Main LHS: ",maincompressionLHS.data)
            payload.punch1.LHS.maincompression = maincompressionLHS.data[0];
            payload.punch2.LHS.maincompression = maincompressionLHS.data[1];
            payload.punch3.LHS.maincompression = maincompressionLHS.data[2];
            payload.punch4.LHS.maincompression = maincompressionLHS.data[3];
            payload.punch5.LHS.maincompression = maincompressionLHS.data[4];
            payload.punch6.LHS.maincompression = maincompressionLHS.data[5];
            payload.punch7.LHS.maincompression = maincompressionLHS.data[6];
            payload.punch8.LHS.maincompression = maincompressionLHS.data[7];
            payload.punch9.LHS.maincompression = maincompressionLHS.data[8];
            payload.punch10.LHS.maincompression = maincompressionLHS.data[9];
            payload.punch11.LHS.maincompression = maincompressionLHS.data[10];
            payload.punch12.LHS.maincompression = maincompressionLHS.data[11];
            payload.punch13.LHS.maincompression = maincompressionLHS.data[12];
            payload.punch14.LHS.maincompression = maincompressionLHS.data[13];
            payload.punch15.LHS.maincompression = maincompressionLHS.data[14];
            payload.punch16.LHS.maincompression = maincompressionLHS.data[15];
            payload.punch17.LHS.maincompression = maincompressionLHS.data[16];
            payload.punch18.LHS.maincompression = maincompressionLHS.data[17];
            payload.punch19.LHS.maincompression = maincompressionLHS.data[18];
            payload.punch20.LHS.maincompression = maincompressionLHS.data[19];
            payload.punch21.LHS.maincompression = maincompressionLHS.data[20];
            payload.punch22.LHS.maincompression = maincompressionLHS.data[21];
            payload.punch23.LHS.maincompression = maincompressionLHS.data[22];
            payload.punch24.LHS.maincompression = maincompressionLHS.data[23];
            payload.punch25.LHS.maincompression = maincompressionLHS.data[24];
            payload.punch26.LHS.maincompression = maincompressionLHS.data[25];
            payload.punch27.LHS.maincompression = maincompressionLHS.data[26];
            payload.punch28.LHS.maincompression = maincompressionLHS.data[27];
            payload.punch29.LHS.maincompression = maincompressionLHS.data[28];
            payload.punch30.LHS.maincompression = maincompressionLHS.data[29];
            payload.punch31.LHS.maincompression = maincompressionLHS.data[30];
            payload.punch32.LHS.maincompression = maincompressionLHS.data[31];
            payload.punch33.LHS.maincompression = maincompressionLHS.data[32];
            payload.punch34.LHS.maincompression = maincompressionLHS.data[33];
            payload.punch35.LHS.maincompression = maincompressionLHS.data[34];
            payload.punch36.LHS.maincompression = maincompressionLHS.data[35];
            payload.punch37.LHS.maincompression = maincompressionLHS.data[36];
            payload.punch38.LHS.maincompression = maincompressionLHS.data[37];
            payload.punch39.LHS.maincompression = maincompressionLHS.data[38];
            payload.punch40.LHS.maincompression = maincompressionLHS.data[39];
            payload.punch41.LHS.maincompression = maincompressionLHS.data[40];
            payload.punch42.LHS.maincompression = maincompressionLHS.data[41];
            payload.punch43.LHS.maincompression = maincompressionLHS.data[42];
            payload.punch44.LHS.maincompression = maincompressionLHS.data[43];
            payload.punch45.LHS.maincompression = maincompressionLHS.data[44];

            mbsState = MBS_STATE_GOOD_READ_MAINLHS;
            // console.log(`${(+ new Date() - startTime)0} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ #2 Maincompression LHS Garbage ]')
            mbsState = MBS_STATE_FAIL_READ_MAINLHS;
            readfailed++;
            //console.log(`${(+ new Date() - startTime)0} : ${mbsState}`)
        })
}

var readmainRHS = function () {
    client.readHoldingRegisters(maincompressionRHS_address, 45)
        .then(function (maincompressionRHS) {
            // console.log("Main RHS: ",maincompressionRHS.data)
            payload.punch1.RHS.maincompression = maincompressionRHS.data[0];
            payload.punch2.RHS.maincompression = maincompressionRHS.data[1];
            payload.punch3.RHS.maincompression = maincompressionRHS.data[2];
            payload.punch4.RHS.maincompression = maincompressionRHS.data[3];
            payload.punch5.RHS.maincompression = maincompressionRHS.data[4];
            payload.punch6.RHS.maincompression = maincompressionRHS.data[5];
            payload.punch7.RHS.maincompression = maincompressionRHS.data[6];
            payload.punch8.RHS.maincompression = maincompressionRHS.data[7];
            payload.punch9.RHS.maincompression = maincompressionRHS.data[8];
            payload.punch10.RHS.maincompression = maincompressionRHS.data[9];
            payload.punch11.RHS.maincompression = maincompressionRHS.data[10];
            payload.punch12.RHS.maincompression = maincompressionRHS.data[11];
            payload.punch13.RHS.maincompression = maincompressionRHS.data[12];
            payload.punch14.RHS.maincompression = maincompressionRHS.data[13];
            payload.punch15.RHS.maincompression = maincompressionRHS.data[14];
            payload.punch16.RHS.maincompression = maincompressionRHS.data[15];
            payload.punch17.RHS.maincompression = maincompressionRHS.data[16];
            payload.punch18.RHS.maincompression = maincompressionRHS.data[17];
            payload.punch19.RHS.maincompression = maincompressionRHS.data[18];
            payload.punch20.RHS.maincompression = maincompressionRHS.data[19];
            payload.punch21.RHS.maincompression = maincompressionRHS.data[20];
            payload.punch22.RHS.maincompression = maincompressionRHS.data[21];
            payload.punch23.RHS.maincompression = maincompressionRHS.data[22];
            payload.punch24.RHS.maincompression = maincompressionRHS.data[23];
            payload.punch25.RHS.maincompression = maincompressionRHS.data[24];
            payload.punch26.RHS.maincompression = maincompressionRHS.data[25];
            payload.punch27.RHS.maincompression = maincompressionRHS.data[26];
            payload.punch28.RHS.maincompression = maincompressionRHS.data[27];
            payload.punch29.RHS.maincompression = maincompressionRHS.data[28];
            payload.punch30.RHS.maincompression = maincompressionRHS.data[29];
            payload.punch31.RHS.maincompression = maincompressionRHS.data[30];
            payload.punch32.RHS.maincompression = maincompressionRHS.data[31];
            payload.punch33.RHS.maincompression = maincompressionRHS.data[32];
            payload.punch34.RHS.maincompression = maincompressionRHS.data[33];
            payload.punch35.RHS.maincompression = maincompressionRHS.data[34];
            payload.punch36.RHS.maincompression = maincompressionRHS.data[35];
            payload.punch37.RHS.maincompression = maincompressionRHS.data[36];
            payload.punch38.RHS.maincompression = maincompressionRHS.data[37];
            payload.punch39.RHS.maincompression = maincompressionRHS.data[38];
            payload.punch40.RHS.maincompression = maincompressionRHS.data[39];
            payload.punch41.RHS.maincompression = maincompressionRHS.data[40];
            payload.punch42.RHS.maincompression = maincompressionRHS.data[41];
            payload.punch43.RHS.maincompression = maincompressionRHS.data[42];
            payload.punch44.RHS.maincompression = maincompressionRHS.data[43];
            payload.punch45.RHS.maincompression = maincompressionRHS.data[44];

            mbsState = MBS_STATE_GOOD_READ_MAINRHS;
            // console.log(`${(+ new Date() - startTime)0} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ #2 Maincompression RHS Garbage ]')
            mbsState = MBS_STATE_FAIL_READ_MAINRHS;
            readfailed++;
            //console.log(`${(+ new Date() - startTime)0} : ${mbsState}`)
        })
}

var readejnLHS = function () {
    client.readHoldingRegisters(ejectionLHS_address, 45)
        .then(function (ejectionLHS) {
            payload.punch1.LHS.ejection = ejectionLHS.data[0];
            payload.punch2.LHS.ejection = ejectionLHS.data[1];
            payload.punch3.LHS.ejection = ejectionLHS.data[2];
            payload.punch4.LHS.ejection = ejectionLHS.data[3];
            payload.punch5.LHS.ejection = ejectionLHS.data[4];
            payload.punch6.LHS.ejection = ejectionLHS.data[5];
            payload.punch7.LHS.ejection = ejectionLHS.data[6];
            payload.punch8.LHS.ejection = ejectionLHS.data[7];
            payload.punch9.LHS.ejection = ejectionLHS.data[8];
            payload.punch10.LHS.ejection = ejectionLHS.data[9];
            payload.punch11.LHS.ejection = ejectionLHS.data[10];
            payload.punch12.LHS.ejection = ejectionLHS.data[11];
            payload.punch13.LHS.ejection = ejectionLHS.data[12];
            payload.punch14.LHS.ejection = ejectionLHS.data[13];
            payload.punch15.LHS.ejection = ejectionLHS.data[14];
            payload.punch16.LHS.ejection = ejectionLHS.data[15];
            payload.punch17.LHS.ejection = ejectionLHS.data[16];
            payload.punch18.LHS.ejection = ejectionLHS.data[17];
            payload.punch19.LHS.ejection = ejectionLHS.data[18];
            payload.punch20.LHS.ejection = ejectionLHS.data[19];
            payload.punch21.LHS.ejection = ejectionLHS.data[20];
            payload.punch22.LHS.ejection = ejectionLHS.data[21];
            payload.punch23.LHS.ejection = ejectionLHS.data[22];
            payload.punch24.LHS.ejection = ejectionLHS.data[23];
            payload.punch25.LHS.ejection = ejectionLHS.data[24];
            payload.punch26.LHS.ejection = ejectionLHS.data[25];
            payload.punch27.LHS.ejection = ejectionLHS.data[26];
            payload.punch28.LHS.ejection = ejectionLHS.data[27];
            payload.punch29.LHS.ejection = ejectionLHS.data[28];
            payload.punch30.LHS.ejection = ejectionLHS.data[29];
            payload.punch31.LHS.ejection = ejectionLHS.data[30];
            payload.punch32.LHS.ejection = ejectionLHS.data[31];
            payload.punch33.LHS.ejection = ejectionLHS.data[32];
            payload.punch34.LHS.ejection = ejectionLHS.data[33];
            payload.punch35.LHS.ejection = ejectionLHS.data[34];
            payload.punch36.LHS.ejection = ejectionLHS.data[35];
            payload.punch37.LHS.ejection = ejectionLHS.data[36];
            payload.punch38.LHS.ejection = ejectionLHS.data[37];
            payload.punch39.LHS.ejection = ejectionLHS.data[38];
            payload.punch40.LHS.ejection = ejectionLHS.data[39];
            payload.punch41.LHS.ejection = ejectionLHS.data[40];
            payload.punch42.LHS.ejection = ejectionLHS.data[41];
            payload.punch43.LHS.ejection = ejectionLHS.data[42];
            payload.punch44.LHS.ejection = ejectionLHS.data[43];
            payload.punch45.LHS.ejection = ejectionLHS.data[44];

            mbsState = MBS_STATE_GOOD_READ_EJNLHS;
            // console.log(`${(+ new Date() - startTime)0} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ #3 Ejection Garbage ]')
            mbsState = MBS_STATE_FAIL_READ_EJNLHS;
            readfailed++;
            // console.log(`${(+ new Date() - startTime)0} : ${mbsState}`)
        })
}

var readejnRHS = function () {
    client.readHoldingRegisters(ejectionRHS_address, 45)
        .then(function (ejectionRHS) {
            payload.punch1.RHS.ejection = ejectionRHS.data[0];
            payload.punch2.RHS.ejection = ejectionRHS.data[1];
            payload.punch3.RHS.ejection = ejectionRHS.data[2];
            payload.punch4.RHS.ejection = ejectionRHS.data[3];
            payload.punch5.RHS.ejection = ejectionRHS.data[4];
            payload.punch6.RHS.ejection = ejectionRHS.data[5];
            payload.punch7.RHS.ejection = ejectionRHS.data[6];
            payload.punch8.RHS.ejection = ejectionRHS.data[7];
            payload.punch9.RHS.ejection = ejectionRHS.data[8];
            payload.punch10.RHS.ejection = ejectionRHS.data[9];
            payload.punch11.RHS.ejection = ejectionRHS.data[10];
            payload.punch12.RHS.ejection = ejectionRHS.data[11];
            payload.punch13.RHS.ejection = ejectionRHS.data[12];
            payload.punch14.RHS.ejection = ejectionRHS.data[13];
            payload.punch15.RHS.ejection = ejectionRHS.data[14];
            payload.punch16.RHS.ejection = ejectionRHS.data[15];
            payload.punch17.RHS.ejection = ejectionRHS.data[16];
            payload.punch18.RHS.ejection = ejectionRHS.data[17];
            payload.punch19.RHS.ejection = ejectionRHS.data[18];
            payload.punch20.RHS.ejection = ejectionRHS.data[19];
            payload.punch21.RHS.ejection = ejectionRHS.data[20];
            payload.punch22.RHS.ejection = ejectionRHS.data[21];
            payload.punch23.RHS.ejection = ejectionRHS.data[22];
            payload.punch24.RHS.ejection = ejectionRHS.data[23];
            payload.punch25.RHS.ejection = ejectionRHS.data[24];
            payload.punch26.RHS.ejection = ejectionRHS.data[25];
            payload.punch27.RHS.ejection = ejectionRHS.data[26];
            payload.punch28.RHS.ejection = ejectionRHS.data[27];
            payload.punch29.RHS.ejection = ejectionRHS.data[28];
            payload.punch30.RHS.ejection = ejectionRHS.data[29];
            payload.punch31.RHS.ejection = ejectionRHS.data[30];
            payload.punch32.RHS.ejection = ejectionRHS.data[31];
            payload.punch33.RHS.ejection = ejectionRHS.data[32];
            payload.punch34.RHS.ejection = ejectionRHS.data[33];
            payload.punch35.RHS.ejection = ejectionRHS.data[34];
            payload.punch36.RHS.ejection = ejectionRHS.data[35];
            payload.punch37.RHS.ejection = ejectionRHS.data[36];
            payload.punch38.RHS.ejection = ejectionRHS.data[37];
            payload.punch39.RHS.ejection = ejectionRHS.data[38];
            payload.punch40.RHS.ejection = ejectionRHS.data[39];
            payload.punch41.RHS.ejection = ejectionRHS.data[40];
            payload.punch42.RHS.ejection = ejectionRHS.data[41];
            payload.punch43.RHS.ejection = ejectionRHS.data[42];
            payload.punch44.RHS.ejection = ejectionRHS.data[43];
            payload.punch45.RHS.ejection = ejectionRHS.data[44];

            mbsState = MBS_STATE_GOOD_READ_EJNRHS;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ #3 Ejection Garbage ]')
            mbsState = MBS_STATE_FAIL_READ_EJNRHS;
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
} 

var readavg = function () {
    client.readHoldingRegisters(avg_address, 21)
        .then(function (avg) {
            // console.log("AVG data: ",avg.data)
            payload.precompressionLHS_avg = avg.data[0] / 100;
            payload.maincompressionLHS_avg = avg.data[4] / 100;
            payload.precompressionRHS_avg = avg.data[8] / 100;
            payload.maincompressionRHS_avg = avg.data[12] / 100;
            payload.ejectionLHS_avg = avg.data[16] / 10;
            payload.ejectionRHS_avg = avg.data[20] / 10;

            mbsState = MBS_STATE_GOOD_READ_AVG;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ #4 Avg Garbage ]')
            mbsState = MBS_STATE_FAIL_READ_AVG;
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
}

var readstatus = function () {
    client.readCoils(status_address, 45)
        .then(function (punch_status) {
            // console.log("STATUS: ", punch_status.data)
            payload.punch1.LHS.status = punch_status.data[0];
            payload.punch2.LHS.status = punch_status.data[1];
            payload.punch3.LHS.status = punch_status.data[2];
            payload.punch4.LHS.status = punch_status.data[3];
            payload.punch5.LHS.status = punch_status.data[4];
            payload.punch6.LHS.status = punch_status.data[5];
            payload.punch7.LHS.status = punch_status.data[6];
            payload.punch8.LHS.status = punch_status.data[7];
            payload.punch9.LHS.status = punch_status.data[8];
            payload.punch10.LHS.status = punch_status.data[9];
            payload.punch11.LHS.status = punch_status.data[10];
            payload.punch12.LHS.status = punch_status.data[11];
            payload.punch13.LHS.status = punch_status.data[12];
            payload.punch14.LHS.status = punch_status.data[13];
            payload.punch15.LHS.status = punch_status.data[14];
            payload.punch16.LHS.status = punch_status.data[15];
            payload.punch17.LHS.status = punch_status.data[16];
            payload.punch18.LHS.status = punch_status.data[17];
            payload.punch19.LHS.status = punch_status.data[18];
            payload.punch20.LHS.status = punch_status.data[19];
            payload.punch21.LHS.status = punch_status.data[20];
            payload.punch22.LHS.status = punch_status.data[21];
            payload.punch23.LHS.status = punch_status.data[22];
            payload.punch24.LHS.status = punch_status.data[23];
            payload.punch25.LHS.status = punch_status.data[24];
            payload.punch26.LHS.status = punch_status.data[25];
            payload.punch27.LHS.status = punch_status.data[26];
            payload.punch28.LHS.status = punch_status.data[27];
            payload.punch29.LHS.status = punch_status.data[28];
            payload.punch30.LHS.status = punch_status.data[29];
            payload.punch31.LHS.status = punch_status.data[30];
            payload.punch32.LHS.status = punch_status.data[31];
            payload.punch33.LHS.status = punch_status.data[32];
            payload.punch34.LHS.status = punch_status.data[33];
            payload.punch35.LHS.status = punch_status.data[34];
            payload.punch36.LHS.status = punch_status.data[35];
            payload.punch37.LHS.status = punch_status.data[36];
            payload.punch38.LHS.status = punch_status.data[37];
            payload.punch39.LHS.status = punch_status.data[38];
            payload.punch40.LHS.status = punch_status.data[39];
            payload.punch41.LHS.status = punch_status.data[40];
            payload.punch42.LHS.status = punch_status.data[41];
            payload.punch43.LHS.status = punch_status.data[42];
            payload.punch44.LHS.status = punch_status.data[43];
            payload.punch45.LHS.status = punch_status.data[44];


            mbsState = MBS_STATE_GOOD_READ_STATUS;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ #6 Status Garbage ]')
            mbsState = MBS_STATE_FAIL_READ_STATUS;
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
}

var readinput = function () {
    client.readCoils(input_address, 55)
        .then(function (input) {
            // console.log("Input: ", input.data)
            payload.input = input.data;
            
            mbsState = MBS_STATE_GOOD_READ_INPUT;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ #6 Input Garbage ]')
            mbsState = MBS_STATE_FAIL_READ_INPUT;
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
}

var readoutput = function () {
    client.readCoils(output_address, 70)
        .then(function (output) {
            payload.output = output.data;
            
            mbsState = MBS_STATE_GOOD_READ_OUTPUT;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ #6 Output Garbage ]')
            mbsState = MBS_STATE_GOOD_READ_OUTPUT;
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
}

var readalarm = function () {
    client.readCoils(alarm_address, 32)
        .then(function (output) {
            // console.log("Output: ", output.data)
            payload.alarm = output.data;
            // console.log(payload.alarm[])
            mbsState = MBS_STATE_GOOD_READ_ALARM;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
        .catch(function (e) {
            console.error('[ #6 Output Garbage ]')
            mbsState = MBS_STATE_FAIL_READ_ALARM;
            readfailed++;
            // console.log(`${(+ new Date() - startTime) / 1000} : ${mbsState}`)
        })
}

function restartprodmodbus() {
    console.log(`[ RESTARTING: ${restart1Command} ]`);
    exec(restart1Command, (err, stdout, stderr) => {
        console.log(`${stdout}`);
    });
    // console.log(`[ RESTARTING: ${restart2Command} ]`);
    // exec(restart2Command, (err, stdout, stderr) => {
    //     console.log(`${stdout}`);
    // });
    // console.log(`[ RESTARTING: ${restart3Command} ]`);
    // exec(restart3Command, (err, stdout, stderr) => {
    //     console.log(`${stdout}`);
    // });
}

app.use("/api/payload", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json(payload);
});

// Start Server
const port = 3129;
app.listen(port, () => console.log(`Server running on port ${port} 👑`));

