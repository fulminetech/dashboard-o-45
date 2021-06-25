// Include Library
const fetch = require('cross-fetch');
const { exec } = require('child_process');
// const CronJob = require('cron').CronJob;

// const Gpio = require('onoff').Gpio;
// const proxy = new Gpio(22, 'in', 'falling', { debounceTimeout: 7 });

var host = "http://localhost";
// var os = require("os");
// var hostname = os.networkInterfaces()
// var ip_address_wifi = hostname.wlan0[0].address;
// var ip_address_4G = hostname.ppp0[0].address;
// var ip_address = hostname.ppp0[0].address;

const Influx = require('influxdb-nodejs');
const { setInterval } = require('timers');
const _new = new Influx(`${host}:8086/new`);

// Timestamp for which returns current date and time
function date() {
    return new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
}

var i = 0
const payloadURL = `${host}:3129/api/payload`;
const updatestatsbatchURL = `${host}:3128/api/set/batchinfo`;
var statsurl = `${host}:3128/api/machine/stats`
var processedurl = "http://127.0.0.1:5050/api/machine/processed"

var noww = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
console.log(`[ STARTING INFLUX : ${noww} ]`)

var payload = {
    connection: false,
    batch: "DEFAULT",
    data_number: 0, // Rotation Number
    rotation_no: 0,
    present_punch: 0,
    precompressionLHS_avg: 0,
    precompressionRHS_avg: 0,
    maincompressionLHS_avg: 0,
    maincompressionRHS_avg: 0,
    ejectionLHS_avg: 0,
    ejectionRHS_avg: 0,
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
        operator_name: "DEFAULT",
        machine_id: "1",
    },
    stats: {
        status: "OFFLINE",
        recipie_id: "DEFAULT",
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

async function updatestatsbatch() {

    fetch(`${updatestatsbatchURL}/${payload.batch}/${payload.machine.operator_name}`)
        .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            console.log('[ BATCH UPDATED ]')
        })
        .catch(err => {
            console.error("[ MODBUS SERVER STATS OFFLINE ]");
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
            console.log("[ PAYLOAD FETCH PROCESSED ERROR ]", error)
        });
};

var stats
var rotation = 1
var oldrotation

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
            payload.rotation_no = stats.rotation_no

            if (payload.batch !== 'DEFAULT') {
                checkrtn(rotation, stats.rotation_no)
            }
            rotation = stats.rotation_no

            // console.log(rotation)
            // stats.mbstatus == false || stats.connection == false ? restart :
        })
        .catch(err => {
            console.error("[ MODBUS SERVER STATS OFFLINE ]", err);
        });
};

function checkrtn(old, neww) {
    if (neww == old+1) {
        // if (neww > old) {
        // console.log("inc")
        writeHistory(old);
        writeAverage(old);
    } else if (neww > old + 1) {
        
    }

}

// setInterval(() => {
//     stats_()
// }, 300);

// Updated with each rotation
var writeHistory = (rtn) => {
    _new.write(`${payload.batch}.history`)
        .tag({
        })
        .field({
            rotation: rtn,
            turretrpm: stats.stats.turret.RPM,
            dwelltime: stats.stats.dwell,
            dozerLHS: stats.stats.awc.actual_RHS,
            dozerRHS: stats.stats.awc.actual_LHS,
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
        .then(() => console.info(`[ HISTORY WRITE SUCESSFUL ${payload.batch} ${payload.data_number} ]`))
        .catch(console.error);
}

// Updated with each rotation
var writeAverage = (rtn) => {
    _new.write(`${payload.batch}.average`)
        .tag({
        })
        .field({
            rotation: rtn,

            preLHSavg: payload.precompressionLHS_avg,
            mainLHSavg: payload.maincompressionLHS_avg,
            ejnLHSavg: payload.ejectionLHS_avg,
            preRHSavg: payload.precompressionRHS_avg,
            mainRHSavg: payload.maincompressionRHS_avg,
            ejnRHSavg: payload.ejectionRHS_avg,
            turretrpm: stats.stats.turret.RPM,
            dwelltime: stats.stats.dwell,
            dozerLHS: stats.stats.awc.actual_RHS,
            dozerRHS: stats.stats.awc.actual_LHS,
        })
        .then(() => console.info(`[ AVERAGE WRITE SUCESSFUL ${payload.batch} ${payload.data_number} ]`))
        .catch(console.error);
}

async function fetchpayload() {

    fetch(payloadURL)
        .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
        .then(data => {
            
            payload1 = data;

            // payload1.status == false ? restart :
            
            // console.log(payload1)
            payload.connection = payload1.connection
            // payload.data_number = payload1.data_number
            // payload.rotation_no = payload1.rotation_no
            payload.present_punch = payload1.present_punch
            payload.precompressionLHS_avg = payload1.precompressionLHS_avg
            payload.precompressionRHS_avg = payload1.precompressionRHS_avg
            payload.maincompressionLHS_avg = payload1.maincompressionLHS_avg
            payload.maincompressionRHS_avg = payload1.maincompressionRHS_avg
            payload.ejectionLHS_avg = payload1.ejectionLHS_avg
            payload.ejectionRHS_avg = payload1.ejectionRHS_avg
            payload.machine.LHS.maincompression_upperlimit = payload1.machine.LHS.maincompression_upperlimit
            payload.machine.LHS.maincompression_lowerlimit = payload1.machine.LHS.maincompression_lowerlimit
            payload.machine.LHS.precompression_upperlimit = payload1.machine.LHS.precompression_upperlimit
            payload.machine.LHS.precompression_lowerlimit = payload1.machine.LHS.precompression_lowerlimit
            payload.machine.LHS.ejection_upperlimit = payload1.machine.LHS.ejection_upperlimit
            payload.machine.RHS.maincompression_upperlimit = payload1.machine.RHS.maincompression_upperlimit
            payload.machine.RHS.maincompression_lowerlimit = payload1.machine.RHS.maincompression_lowerlimit
            payload.machine.RHS.precompression_upperlimit = payload1.machine.RHS.precompression_upperlimit
            payload.machine.RHS.precompression_lowerlimit = payload1.machine.RHS.precompression_lowerlimit
            payload.machine.RHS.ejection_upperlimit = payload1.machine.RHS.ejection_upperlimit
            payload.machine.main_forceline = payload1.machine.main_forceline
            payload.machine.pre_forceline = payload1.machine.pre_forceline
            payload.machine.ejn_forceline = payload1.machine.ejn_forceline
            // payload.stats.status = payload1.stats.status
            payload.stats.count = payload1.stats.count
            payload.stats.tablets_per_hour = payload1.stats.tablets_per_hour
            payload.stats.rpm = payload1.stats.rpm
            payload.stats.rpm_amp = payload1.stats.rpm_amp
            payload.stats.turretLHS = payload1.stats.turretLHS
            payload.stats.turretLHS_amp = payload1.stats.turretLHS_amp
            payload.stats.turretRHS = payload1.stats.turretRHS
            payload.stats.turretRHS_amp = payload1.stats.turretRHS_amp
            
            payload.stats.LHSdepth = payload1.stats.LHSdepth
            payload.stats.RHSdepth = payload1.stats.RHSdepth
            payload.stats.pressure_set = payload1.stats.pressure_set
            payload.stats.pressure_actual = payload1.stats.pressure_actual
            payload.stats.lubetime_set = payload1.stats.lubetime_set
            payload.stats.lubetime_actual = payload1.stats.lubetime_actual

            payload.stats.active_punches = payload1.stats.active_punches
            payload.stats.dwell = payload1.stats.dwell
            payload.punch1.LHS.precompression = payload1.punch1.LHS.precompression / 100
            payload.punch1.LHS.maincompression = payload1.punch1.LHS.maincompression / 100
            payload.punch1.LHS.ejection = payload1.punch1.LHS.ejection / 10  
            payload.punch1.LHS.status = payload1.punch1.LHS.status
            payload.punch1.RHS.precompression = payload1.punch1.RHS.precompression / 100
            payload.punch1.RHS.maincompression = payload1.punch1.RHS.maincompression / 100
            payload.punch1.RHS.ejection = payload1.punch1.RHS.ejection / 10
            payload.punch1.RHS.status = payload1.punch1.RHS.status
            payload.punch2.LHS.precompression = payload1.punch2.LHS.precompression / 100
            payload.punch2.LHS.maincompression = payload1.punch2.LHS.maincompression / 100
            payload.punch2.LHS.ejection = payload1.punch2.LHS.ejection / 10
            payload.punch2.LHS.status = payload1.punch2.LHS.status
            payload.punch2.RHS.precompression = payload1.punch2.RHS.precompression / 100
            payload.punch2.RHS.maincompression = payload1.punch2.RHS.maincompression / 100
            payload.punch2.RHS.ejection = payload1.punch2.RHS.ejection / 10
            payload.punch2.RHS.status = payload1.punch2.RHS.status
            payload.punch3.LHS.precompression = payload1.punch3.LHS.precompression / 100
            payload.punch3.LHS.maincompression = payload1.punch3.LHS.maincompression / 100
            payload.punch3.LHS.ejection = payload1.punch3.LHS.ejection / 10
            payload.punch3.LHS.status = payload1.punch3.LHS.status
            payload.punch3.RHS.precompression = payload1.punch3.RHS.precompression /100
            payload.punch3.RHS.maincompression = payload1.punch3.RHS.maincompression /100
            payload.punch3.RHS.ejection = payload1.punch3.RHS.ejection / 10
            payload.punch3.RHS.status = payload1.punch3.RHS.status
            payload.punch4.LHS.precompression = payload1.punch4.LHS.precompression/100
            payload.punch4.LHS.maincompression = payload1.punch4.LHS.maincompression/100
            payload.punch4.LHS.ejection = payload1.punch4.LHS.ejection / 10
            payload.punch4.LHS.status = payload1.punch4.LHS.status
            payload.punch4.RHS.precompression = payload1.punch4.RHS.precompression/100
            payload.punch4.RHS.maincompression = payload1.punch4.RHS.maincompression/100
            payload.punch4.RHS.ejection = payload1.punch4.RHS.ejection / 10
            payload.punch4.RHS.status = payload1.punch4.RHS.status
            payload.punch5.LHS.precompression = payload1.punch5.LHS.precompression/100
            payload.punch5.LHS.maincompression = payload1.punch5.LHS.maincompression/100
            payload.punch5.LHS.ejection = payload1.punch5.LHS.ejection / 10
            payload.punch5.LHS.status = payload1.punch5.LHS.status
            payload.punch5.RHS.precompression = payload1.punch5.RHS.precompression/100
            payload.punch5.RHS.maincompression = payload1.punch5.RHS.maincompression/100
            payload.punch5.RHS.ejection = payload1.punch5.RHS.ejection / 10
            payload.punch5.RHS.status = payload1.punch5.RHS.status
            payload.punch6.LHS.precompression = payload1.punch6.LHS.precompression/100
            payload.punch6.LHS.maincompression = payload1.punch6.LHS.maincompression/100
            payload.punch6.LHS.ejection = payload1.punch6.LHS.ejection / 10
            payload.punch6.LHS.status = payload1.punch6.LHS.status
            payload.punch6.RHS.precompression = payload1.punch6.RHS.precompression/100
            payload.punch6.RHS.maincompression = payload1.punch6.RHS.maincompression/100
            payload.punch6.RHS.ejection = payload1.punch6.RHS.ejection / 10
            payload.punch6.RHS.status = payload1.punch6.RHS.status
            payload.punch7.LHS.precompression = payload1.punch7.LHS.precompression/100
            payload.punch7.LHS.maincompression = payload1.punch7.LHS.maincompression/100
            payload.punch7.LHS.ejection = payload1.punch7.LHS.ejection / 10
            payload.punch7.LHS.status = payload1.punch7.LHS.status
            payload.punch7.RHS.precompression = payload1.punch7.RHS.precompression/100
            payload.punch7.RHS.maincompression = payload1.punch7.RHS.maincompression/100
            payload.punch7.RHS.ejection = payload1.punch7.RHS.ejection / 10
            payload.punch7.RHS.status = payload1.punch7.RHS.status
            payload.punch8.LHS.precompression = payload1.punch8.LHS.precompression/100
            payload.punch8.LHS.maincompression = payload1.punch8.LHS.maincompression/100
            payload.punch8.LHS.ejection = payload1.punch8.LHS.ejection / 10
            payload.punch8.LHS.status = payload1.punch8.LHS.status
            payload.punch8.RHS.precompression = payload1.punch8.RHS.precompression/100
            payload.punch8.RHS.maincompression = payload1.punch8.RHS.maincompression/100
            payload.punch8.RHS.ejection = payload1.punch8.RHS.ejection / 10
            payload.punch8.RHS.status = payload1.punch8.RHS.status
            payload.punch9.LHS.precompression = payload1.punch9.LHS.precompression/100
            payload.punch9.LHS.maincompression = payload1.punch9.LHS.maincompression/100
            payload.punch9.LHS.ejection = payload1.punch9.LHS.ejection / 10
            payload.punch9.LHS.status = payload1.punch9.LHS.status
            payload.punch9.RHS.precompression = payload1.punch9.RHS.precompression/100
            payload.punch9.RHS.maincompression = payload1.punch9.RHS.maincompression/100
            payload.punch9.RHS.ejection = payload1.punch9.RHS.ejection / 10
            payload.punch9.RHS.status = payload1.punch9.RHS.status
            payload.punch10.LHS.precompression = payload1.punch10.LHS.precompression/100
            payload.punch10.LHS.maincompression = payload1.punch10.LHS.maincompression/100
            payload.punch10.LHS.ejection = payload1.punch10.LHS.ejection / 10
            payload.punch10.LHS.status = payload1.punch10.LHS.status
            payload.punch10.RHS.precompression = payload1.punch10.RHS.precompression/100
            payload.punch10.RHS.maincompression = payload1.punch10.RHS.maincompression/100
            payload.punch10.RHS.ejection = payload1.punch10.RHS.ejection / 10
            payload.punch10.RHS.status = payload1.punch10.RHS.status
            payload.punch11.LHS.precompression = payload1.punch11.LHS.precompression/100
            payload.punch11.LHS.maincompression = payload1.punch11.LHS.maincompression/100
            payload.punch11.LHS.ejection = payload1.punch11.LHS.ejection / 10
            payload.punch11.LHS.status = payload1.punch11.LHS.status
            payload.punch11.RHS.precompression = payload1.punch11.RHS.precompression/100
            payload.punch11.RHS.maincompression = payload1.punch11.RHS.maincompression/100
            payload.punch11.RHS.ejection = payload1.punch11.RHS.ejection / 10
            payload.punch11.RHS.status = payload1.punch11.RHS.status
            payload.punch12.LHS.precompression = payload1.punch12.LHS.precompression/100
            payload.punch12.LHS.maincompression = payload1.punch12.LHS.maincompression/100
            payload.punch12.LHS.ejection = payload1.punch12.LHS.ejection / 10
            payload.punch12.LHS.status = payload1.punch12.LHS.status
            payload.punch12.RHS.precompression = payload1.punch12.RHS.precompression/100
            payload.punch12.RHS.maincompression = payload1.punch12.RHS.maincompression/100
            payload.punch12.RHS.ejection = payload1.punch12.RHS.ejection / 10
            payload.punch12.RHS.status = payload1.punch12.RHS.status
            payload.punch13.LHS.precompression = payload1.punch13.LHS.precompression/100
            payload.punch13.LHS.maincompression = payload1.punch13.LHS.maincompression/100
            payload.punch13.LHS.ejection = payload1.punch13.LHS.ejection / 10
            payload.punch13.LHS.status = payload1.punch13.LHS.status
            payload.punch13.RHS.precompression = payload1.punch13.RHS.precompression/100
            payload.punch13.RHS.maincompression = payload1.punch13.RHS.maincompression/100
            payload.punch13.RHS.ejection = payload1.punch13.RHS.ejection / 10
            payload.punch13.RHS.status = payload1.punch13.RHS.status
            payload.punch14.LHS.precompression = payload1.punch14.LHS.precompression/100
            payload.punch14.LHS.maincompression = payload1.punch14.LHS.maincompression/100
            payload.punch14.LHS.ejection = payload1.punch14.LHS.ejection / 10
            payload.punch14.LHS.status = payload1.punch14.LHS.status
            payload.punch14.RHS.precompression = payload1.punch14.RHS.precompression/100
            payload.punch14.RHS.maincompression = payload1.punch14.RHS.maincompression/100
            payload.punch14.RHS.ejection = payload1.punch14.RHS.ejection / 10
            payload.punch14.RHS.status = payload1.punch14.RHS.status
            payload.punch15.LHS.precompression = payload1.punch15.LHS.precompression/100
            payload.punch15.LHS.maincompression = payload1.punch15.LHS.maincompression/100
            payload.punch15.LHS.ejection = payload1.punch15.LHS.ejection / 10
            payload.punch15.LHS.status = payload1.punch15.LHS.status
            payload.punch15.RHS.precompression = payload1.punch15.RHS.precompression/100
            payload.punch15.RHS.maincompression = payload1.punch15.RHS.maincompression/100
            payload.punch15.RHS.ejection = payload1.punch15.RHS.ejection / 10
            payload.punch15.RHS.status = payload1.punch15.RHS.status
            payload.punch16.LHS.precompression = payload1.punch16.LHS.precompression/100
            payload.punch16.LHS.maincompression = payload1.punch16.LHS.maincompression/100
            payload.punch16.LHS.ejection = payload1.punch16.LHS.ejection / 10
            payload.punch16.LHS.status = payload1.punch16.LHS.status
            payload.punch16.RHS.precompression = payload1.punch16.RHS.precompression/100
            payload.punch16.RHS.maincompression = payload1.punch16.RHS.maincompression/100
            payload.punch16.RHS.ejection = payload1.punch16.RHS.ejection / 10
            payload.punch16.RHS.status = payload1.punch16.RHS.status
            payload.punch17.LHS.precompression = payload1.punch17.LHS.precompression/100
            payload.punch17.LHS.maincompression = payload1.punch17.LHS.maincompression/100
            payload.punch17.LHS.ejection = payload1.punch17.LHS.ejection / 10
            payload.punch17.LHS.status = payload1.punch17.LHS.status
            payload.punch17.RHS.precompression = payload1.punch17.RHS.precompression/100
            payload.punch17.RHS.maincompression = payload1.punch17.RHS.maincompression/100
            payload.punch17.RHS.ejection = payload1.punch17.RHS.ejection / 10
            payload.punch17.RHS.status = payload1.punch17.RHS.status
            payload.punch18.LHS.precompression = payload1.punch18.LHS.precompression/100
            payload.punch18.LHS.maincompression = payload1.punch18.LHS.maincompression/100
            payload.punch18.LHS.ejection = payload1.punch18.LHS.ejection / 10
            payload.punch18.LHS.status = payload1.punch18.LHS.status
            payload.punch18.RHS.precompression = payload1.punch18.RHS.precompression/100
            payload.punch18.RHS.maincompression = payload1.punch18.RHS.maincompression/100
            payload.punch18.RHS.ejection = payload1.punch18.RHS.ejection / 10
            payload.punch18.RHS.status = payload1.punch18.RHS.status
            payload.punch19.LHS.precompression = payload1.punch19.LHS.precompression/100
            payload.punch19.LHS.maincompression = payload1.punch19.LHS.maincompression/100
            payload.punch19.LHS.ejection = payload1.punch19.LHS.ejection / 10
            payload.punch19.LHS.status = payload1.punch19.LHS.status
            payload.punch19.RHS.precompression = payload1.punch19.RHS.precompression/100
            payload.punch19.RHS.maincompression = payload1.punch19.RHS.maincompression/100
            payload.punch19.RHS.ejection = payload1.punch19.RHS.ejection / 10
            payload.punch19.RHS.status = payload1.punch19.RHS.status
            payload.punch20.LHS.precompression = payload1.punch20.LHS.precompression/100
            payload.punch20.LHS.maincompression = payload1.punch20.LHS.maincompression/100
            payload.punch20.LHS.ejection = payload1.punch20.LHS.ejection /10
            payload.punch20.LHS.status = payload1.punch20.LHS.status
            payload.punch20.RHS.precompression = payload1.punch20.RHS.precompression/100
            payload.punch20.RHS.maincompression = payload1.punch20.RHS.maincompression/100
            payload.punch20.RHS.ejection = payload1.punch20.RHS.ejection /10
            payload.punch20.RHS.status = payload1.punch20.RHS.status
            payload.punch21.LHS.precompression = payload1.punch21.LHS.precompression/100
            payload.punch21.LHS.maincompression = payload1.punch21.LHS.maincompression/100
            payload.punch21.LHS.ejection = payload1.punch21.LHS.ejection /10
            payload.punch21.LHS.status = payload1.punch21.LHS.status
            payload.punch21.RHS.precompression = payload1.punch21.RHS.precompression/100
            payload.punch21.RHS.maincompression = payload1.punch21.RHS.maincompression/100
            payload.punch21.RHS.ejection = payload1.punch21.RHS.ejection /10
            payload.punch21.RHS.status = payload1.punch21.RHS.status
            payload.punch22.LHS.precompression = payload1.punch22.LHS.precompression/100
            payload.punch22.LHS.maincompression = payload1.punch22.LHS.maincompression/100
            payload.punch22.LHS.ejection = payload1.punch22.LHS.ejection /10
            payload.punch22.LHS.status = payload1.punch22.LHS.status
            payload.punch22.RHS.precompression = payload1.punch22.RHS.precompression/100
            payload.punch22.RHS.maincompression = payload1.punch22.RHS.maincompression/100
            payload.punch22.RHS.ejection = payload1.punch22.RHS.ejection /10
            payload.punch22.RHS.status = payload1.punch22.RHS.status
            payload.punch23.LHS.precompression = payload1.punch23.LHS.precompression/100
            payload.punch23.LHS.maincompression = payload1.punch23.LHS.maincompression/100
            payload.punch23.LHS.ejection = payload1.punch23.LHS.ejection /10
            payload.punch23.LHS.status = payload1.punch23.LHS.status
            payload.punch23.RHS.precompression = payload1.punch23.RHS.precompression/100
            payload.punch23.RHS.maincompression = payload1.punch23.RHS.maincompression/100
            payload.punch23.RHS.ejection = payload1.punch23.RHS.ejection /10
            payload.punch23.RHS.status = payload1.punch23.RHS.status
            payload.punch24.LHS.precompression = payload1.punch24.LHS.precompression/100
            payload.punch24.LHS.maincompression = payload1.punch24.LHS.maincompression/100
            payload.punch24.LHS.ejection = payload1.punch24.LHS.ejection /10
            payload.punch24.LHS.status = payload1.punch24.LHS.status
            payload.punch24.RHS.precompression = payload1.punch24.RHS.precompression/100
            payload.punch24.RHS.maincompression = payload1.punch24.RHS.maincompression/100
            payload.punch24.RHS.ejection = payload1.punch24.RHS.ejection /10
            payload.punch24.RHS.status = payload1.punch24.RHS.status
            payload.punch25.LHS.precompression = payload1.punch25.LHS.precompression/100
            payload.punch25.LHS.maincompression = payload1.punch25.LHS.maincompression/100
            payload.punch25.LHS.ejection = payload1.punch25.LHS.ejection /10
            payload.punch25.LHS.status = payload1.punch25.LHS.status
            payload.punch25.RHS.precompression = payload1.punch25.RHS.precompression/100
            payload.punch25.RHS.maincompression = payload1.punch25.RHS.maincompression/100
            payload.punch25.RHS.ejection = payload1.punch25.RHS.ejection /10
            payload.punch25.RHS.status = payload1.punch25.RHS.status
            payload.punch26.LHS.precompression = payload1.punch26.LHS.precompression/100
            payload.punch26.LHS.maincompression = payload1.punch26.LHS.maincompression/100
            payload.punch26.LHS.ejection = payload1.punch26.LHS.ejection /10
            payload.punch26.LHS.status = payload1.punch26.LHS.status
            payload.punch26.RHS.precompression = payload1.punch26.RHS.precompression/100
            payload.punch26.RHS.maincompression = payload1.punch26.RHS.maincompression/100
            payload.punch26.RHS.ejection = payload1.punch26.RHS.ejection /10
            payload.punch26.RHS.status = payload1.punch26.RHS.status
            payload.punch27.LHS.precompression = payload1.punch27.LHS.precompression/100
            payload.punch27.LHS.maincompression = payload1.punch27.LHS.maincompression/100
            payload.punch27.LHS.ejection = payload1.punch27.LHS.ejection /10
            payload.punch27.LHS.status = payload1.punch27.LHS.status
            payload.punch27.RHS.precompression = payload1.punch27.RHS.precompression/100
            payload.punch27.RHS.maincompression = payload1.punch27.RHS.maincompression/100
            payload.punch27.RHS.ejection = payload1.punch27.RHS.ejection /10
            payload.punch27.RHS.status = payload1.punch27.RHS.status
            payload.punch28.LHS.precompression = payload1.punch28.LHS.precompression/100
            payload.punch28.LHS.maincompression = payload1.punch28.LHS.maincompression/100
            payload.punch28.LHS.ejection = payload1.punch28.LHS.ejection /10
            payload.punch28.LHS.status = payload1.punch28.LHS.status
            payload.punch28.RHS.precompression = payload1.punch28.RHS.precompression/100
            payload.punch28.RHS.maincompression = payload1.punch28.RHS.maincompression/100
            payload.punch28.RHS.ejection = payload1.punch28.RHS.ejection /10
            payload.punch28.RHS.status = payload1.punch28.RHS.status
            payload.punch29.LHS.precompression = payload1.punch29.LHS.precompression/100
            payload.punch29.LHS.maincompression = payload1.punch29.LHS.maincompression/100
            payload.punch29.LHS.ejection = payload1.punch29.LHS.ejection /10
            payload.punch29.LHS.status = payload1.punch29.LHS.status
            payload.punch29.RHS.precompression = payload1.punch29.RHS.precompression/100
            payload.punch29.RHS.maincompression = payload1.punch29.RHS.maincompression/100
            payload.punch29.RHS.ejection = payload1.punch29.RHS.ejection /10
            payload.punch29.RHS.status = payload1.punch29.RHS.status
            payload.punch30.LHS.precompression = payload1.punch30.LHS.precompression/100
            payload.punch30.LHS.maincompression = payload1.punch30.LHS.maincompression/100
            payload.punch30.LHS.ejection = payload1.punch30.LHS.ejection /10
            payload.punch30.LHS.status = payload1.punch30.LHS.status
            payload.punch30.RHS.precompression = payload1.punch30.RHS.precompression/100
            payload.punch30.RHS.maincompression = payload1.punch30.RHS.maincompression/100
            payload.punch30.RHS.ejection = payload1.punch30.RHS.ejection /10
            payload.punch30.RHS.status = payload1.punch30.RHS.status
            payload.punch31.LHS.precompression = payload1.punch31.LHS.precompression/100
            payload.punch31.LHS.maincompression = payload1.punch31.LHS.maincompression/100
            payload.punch31.LHS.ejection = payload1.punch31.LHS.ejection /10
            payload.punch31.LHS.status = payload1.punch31.LHS.status
            payload.punch31.RHS.precompression = payload1.punch31.RHS.precompression/100
            payload.punch31.RHS.maincompression = payload1.punch31.RHS.maincompression/100
            payload.punch31.RHS.ejection = payload1.punch31.RHS.ejection /10
            payload.punch31.RHS.status = payload1.punch31.RHS.status
            payload.punch32.LHS.precompression = payload1.punch32.LHS.precompression/100
            payload.punch32.LHS.maincompression = payload1.punch32.LHS.maincompression/100
            payload.punch32.LHS.ejection = payload1.punch32.LHS.ejection /10
            payload.punch32.LHS.status = payload1.punch32.LHS.status
            payload.punch32.RHS.precompression = payload1.punch32.RHS.precompression/100
            payload.punch32.RHS.maincompression = payload1.punch32.RHS.maincompression/100
            payload.punch32.RHS.ejection = payload1.punch32.RHS.ejection /10
            payload.punch32.RHS.status = payload1.punch32.RHS.status
            payload.punch33.LHS.precompression = payload1.punch33.LHS.precompression/100
            payload.punch33.LHS.maincompression = payload1.punch33.LHS.maincompression/100
            payload.punch33.LHS.ejection = payload1.punch33.LHS.ejection /10
            payload.punch33.LHS.status = payload1.punch33.LHS.status
            payload.punch33.RHS.precompression = payload1.punch33.RHS.precompression/100
            payload.punch33.RHS.maincompression = payload1.punch33.RHS.maincompression/100
            payload.punch33.RHS.ejection = payload1.punch33.RHS.ejection /10
            payload.punch33.RHS.status = payload1.punch33.RHS.status
            payload.punch34.LHS.precompression = payload1.punch34.LHS.precompression/100
            payload.punch34.LHS.maincompression = payload1.punch34.LHS.maincompression/100
            payload.punch34.LHS.ejection = payload1.punch34.LHS.ejection /10
            payload.punch34.LHS.status = payload1.punch34.LHS.status
            payload.punch34.RHS.precompression = payload1.punch34.RHS.precompression/100
            payload.punch34.RHS.maincompression = payload1.punch34.RHS.maincompression/100
            payload.punch34.RHS.ejection = payload1.punch34.RHS.ejection /10
            payload.punch34.RHS.status = payload1.punch34.RHS.status
            payload.punch35.LHS.precompression = payload1.punch35.LHS.precompression/100
            payload.punch35.LHS.maincompression = payload1.punch35.LHS.maincompression/100
            payload.punch35.LHS.ejection = payload1.punch35.LHS.ejection /10
            payload.punch35.LHS.status = payload1.punch35.LHS.status
            payload.punch35.RHS.precompression = payload1.punch35.RHS.precompression/100
            payload.punch35.RHS.maincompression = payload1.punch35.RHS.maincompression/100
            payload.punch35.RHS.ejection = payload1.punch35.RHS.ejection /10
            payload.punch35.RHS.status = payload1.punch35.RHS.status
            payload.punch36.LHS.precompression = payload1.punch36.LHS.precompression/100
            payload.punch36.LHS.maincompression = payload1.punch36.LHS.maincompression/100
            payload.punch36.LHS.ejection = payload1.punch36.LHS.ejection /10
            payload.punch36.LHS.status = payload1.punch36.LHS.status
            payload.punch36.RHS.precompression = payload1.punch36.RHS.precompression/100
            payload.punch36.RHS.maincompression = payload1.punch36.RHS.maincompression/100
            payload.punch36.RHS.ejection = payload1.punch36.RHS.ejection /10
            payload.punch36.RHS.status = payload1.punch36.RHS.status
            payload.punch37.LHS.precompression = payload1.punch37.LHS.precompression/100
            payload.punch37.LHS.maincompression = payload1.punch37.LHS.maincompression/100
            payload.punch37.LHS.ejection = payload1.punch37.LHS.ejection /10
            payload.punch37.LHS.status = payload1.punch37.LHS.status
            payload.punch37.RHS.precompression = payload1.punch37.RHS.precompression/100
            payload.punch37.RHS.maincompression = payload1.punch37.RHS.maincompression/100
            payload.punch37.RHS.ejection = payload1.punch37.RHS.ejection /10
            payload.punch37.RHS.status = payload1.punch37.RHS.status
            payload.punch38.LHS.precompression = payload1.punch38.LHS.precompression/100
            payload.punch38.LHS.maincompression = payload1.punch38.LHS.maincompression/100
            payload.punch38.LHS.ejection = payload1.punch38.LHS.ejection /10
            payload.punch38.LHS.status = payload1.punch38.LHS.status
            payload.punch38.RHS.precompression = payload1.punch38.RHS.precompression/100
            payload.punch38.RHS.maincompression = payload1.punch38.RHS.maincompression/100
            payload.punch38.RHS.ejection = payload1.punch38.RHS.ejection /10
            payload.punch38.RHS.status = payload1.punch38.RHS.status
            payload.punch39.LHS.precompression = payload1.punch39.LHS.precompression/100
            payload.punch39.LHS.maincompression = payload1.punch39.LHS.maincompression/100
            payload.punch39.LHS.ejection = payload1.punch39.LHS.ejection /10
            payload.punch39.LHS.status = payload1.punch39.LHS.status
            payload.punch39.RHS.precompression = payload1.punch39.RHS.precompression/100
            payload.punch39.RHS.maincompression = payload1.punch39.RHS.maincompression/100
            payload.punch39.RHS.ejection = payload1.punch39.RHS.ejection /10
            payload.punch39.RHS.status = payload1.punch39.RHS.status
            payload.punch40.LHS.precompression = payload1.punch40.LHS.precompression/100
            payload.punch40.LHS.maincompression = payload1.punch40.LHS.maincompression/100
            payload.punch40.LHS.ejection = payload1.punch40.LHS.ejection /10
            payload.punch40.LHS.status = payload1.punch40.LHS.status
            payload.punch40.RHS.precompression = payload1.punch40.RHS.precompression/100
            payload.punch40.RHS.maincompression = payload1.punch40.RHS.maincompression/100
            payload.punch40.RHS.ejection = payload1.punch40.RHS.ejection /10
            payload.punch40.RHS.status = payload1.punch40.RHS.status
            payload.punch41.LHS.precompression = payload1.punch41.LHS.precompression/100
            payload.punch41.LHS.maincompression = payload1.punch41.LHS.maincompression/100
            payload.punch41.LHS.ejection = payload1.punch41.LHS.ejection /10
            payload.punch41.LHS.status = payload1.punch41.LHS.status
            payload.punch41.RHS.precompression = payload1.punch41.RHS.precompression/100
            payload.punch41.RHS.maincompression = payload1.punch41.RHS.maincompression/100
            payload.punch41.RHS.ejection = payload1.punch41.RHS.ejection /10
            payload.punch41.RHS.status = payload1.punch41.RHS.status
            payload.punch42.LHS.precompression = payload1.punch42.LHS.precompression/100
            payload.punch42.LHS.maincompression = payload1.punch42.LHS.maincompression/100
            payload.punch42.LHS.ejection = payload1.punch42.LHS.ejection /10
            payload.punch42.LHS.status = payload1.punch42.LHS.status
            payload.punch42.RHS.precompression = payload1.punch42.RHS.precompression/100
            payload.punch42.RHS.maincompression = payload1.punch42.RHS.maincompression/100
            payload.punch42.RHS.ejection = payload1.punch42.RHS.ejection /10
            payload.punch42.RHS.status = payload1.punch42.RHS.status
            payload.punch43.LHS.precompression = payload1.punch43.LHS.precompression/100
            payload.punch43.LHS.maincompression = payload1.punch43.LHS.maincompression/100
            payload.punch43.LHS.ejection = payload1.punch43.LHS.ejection /10
            payload.punch43.LHS.status = payload1.punch43.LHS.status
            payload.punch43.RHS.precompression = payload1.punch43.RHS.precompression/100
            payload.punch43.RHS.maincompression = payload1.punch43.RHS.maincompression/100
            payload.punch43.RHS.ejection = payload1.punch43.RHS.ejection /10
            payload.punch43.RHS.status = payload1.punch43.RHS.status
            payload.punch44.LHS.precompression = payload1.punch44.LHS.precompression/100
            payload.punch44.LHS.maincompression = payload1.punch44.LHS.maincompression/100
            payload.punch44.LHS.ejection = payload1.punch44.LHS.ejection /10
            payload.punch44.LHS.status = payload1.punch44.LHS.status
            payload.punch44.RHS.precompression = payload1.punch44.RHS.precompression/100
            payload.punch44.RHS.maincompression = payload1.punch44.RHS.maincompression/100
            payload.punch44.RHS.ejection = payload1.punch44.RHS.ejection /10
            payload.punch44.RHS.status = payload1.punch44.RHS.status
            payload.punch45.LHS.precompression = payload1.punch45.LHS.precompression/100
            payload.punch45.LHS.maincompression = payload1.punch45.LHS.maincompression/100
            payload.punch45.LHS.ejection = payload1.punch45.LHS.ejection /10
            payload.punch45.LHS.status = payload1.punch45.LHS.status
            payload.punch45.RHS.precompression = payload1.punch45.RHS.precompression/100
            payload.punch45.RHS.maincompression = payload1.punch45.RHS.maincompression/100
            payload.punch45.RHS.ejection = payload1.punch45.RHS.ejection /10
            payload.punch45.RHS.status = payload1.punch45.RHS.status
            
        })
        .catch(err => {
            console.error("[ MODBUS SERVER OFFLINE ]");
        });
};

var myVar = setInterval(checkPLCconnection, 1000);
function checkPLCconnection() {
    fetchpayload()
}

function stopChecking() {
    clearInterval(myVar);
}

function startmodbus() {
    stopChecking()
    fetchpayload()
    stats_()
    processed_()
    setInterval(() => {
        fetchpayload()
        stats_()
        processed_()
    }, 100);

}

// Updated when a parameter changed
var writeMachine = () => {
    _new.write(`${payload.batch}.machine`)
        .tag({
        })
        .field({
            operatorname: payload.machine.operator_name,
            machineID: payload.machine.machine_id,
            // LHSmcUpperLimit: payload.machine.LHS.maincompression_upperlimit,
            // LHSmcLowerLimit: payload.machine.LHS.maincompression_lowerlimit,
            // LHSpcUpperLimit: payload.machine.LHS.precompression_upperlimit,
            // LHSpcLowerLimit: payload.machine.LHS.precompression_lowerlimit,
            // LHSejnUpperLimit: payload.machine.LHS.ejection_upperlimit,
            // RHSmcUpperLimit: payload.machine.RHS.maincompression_upperlimit,
            // RHSmcLowerLimit: payload.machine.RHS.maincompression_lowerlimit,
            // RHSpcUpperLimit: payload.machine.RHS.precompression_upperlimit,
            // RHSpcLowerLimit: payload.machine.RHS.precompression_lowerlimit,
            // RHSejnUpperLimit: payload.machine.RHS.ejection_upperlimit,

            rpm: payload.stats.rpm,
            recipieID: payload.stats.recipie_id,
            productionCount: payload.stats.count,
            productionPerHour: payload.stats.tablets_per_hour,
        })
        .then(() => console.info(`[ MACHINE WRITE SUCESSFUL ${date()} ]`))
        .catch(console.error);
};

// write every 10 mins
var writemachine = () => {
    setTimeout(() => {
        writeMachine();
    }, 2000);
    setInterval(() => {
        writeMachine();
    }, 600000);
};

var watchproxy = function () {
    writemachine();
    console.log("Watching proxy")
    
    // setTimeout(() => {
    //     proxy.watch((err, value) => {
    //         if (err) {
    //             throw err;
    //         }
    //         payload.data_number++;
    //         console.log("DATA")
    //         writeHistory();
    //         writeAverage();
    //     });
    // }, 2000);
}




module.exports = {
    payload, startmodbus, watchproxy, updatestatsbatch
}