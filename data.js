// Include Library
const fetch = require('cross-fetch');
const { exec } = require('child_process');
// const CronJob = require('cron').CronJob;

// const Gpio = require('onoff').Gpio;
// const proxy = new Gpio(2, 'in', 'falling', { debounceTimeout: 10 });

var host = "http://localhost";
// var os = require("os");
// var hostname = os.networkInterfaces()
// var ip_address_wifi = hostname.wlan0[0].address;
// var ip_address_4G = hostname.ppp0[0].address;
// var ip_address = hostname.ppp0[0].address;

const Influx = require('influxdb-nodejs');
const { setInterval } = require('timers');
const flux = new Influx(`${host}:8086/new`);

// Timestamp for which returns current date and time
function date() {
    return new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
}

var i = 0
const payloadURL = `${host}:3129/api/payload`;
var noww = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
console.log(`[ STARTING INFLUX : ${noww} ]`)

var payload = {
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
            // console.log(payload1)
            // payload.batch = payload1.batch
            // payload.data_number = payload1.data_number
            payload.rotation_no = payload1.rotation_no
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

function startmodbus() {
    setInterval(() => {
        fetchpayload()
    }, 100);
}

// For tesing purpose
startmodbus()

// --+++=== DATABASE WRITE ===+++-- //
// Initialise Rotation 
var rotation = -1;

// Updated with each rotation
writeHistory = () => {
    flux.write(`${payload.batch}.history`)
        .tag({
        })
        .field({
            batch: payload.batch,
            rotation: payload.data_number,

            p1LHSpre: payload.punch1.LHS.precompression,
            p1LHSmain: payload.punch1.LHS.maincompression,
            p1LHSejn: payload.punch1.LHS.ejection,
            p1LHSstatus: payload.punch1.LHS.status,
            p1RHSpre: payload.punch1.RHS.precompression,
            p1RHSmain: payload.punch1.RHS.maincompression,
            p1RHSejn: payload.punch1.RHS.ejection,
            p1RHSstatus: payload.punch1.RHS.status,
            p2LHSpre: payload.punch2.LHS.precompression,
            p2LHSmain:payload.punch2.LHS.maincompression,
            p2LHSejn:payload.punch2.LHS.ejection,
            p2LHSstatus:payload.punch2.LHS.status,
            p2RHSpre:payload.punch2.RHS.precompression,
            p2RHSmain:payload.punch2.RHS.maincompression,
            p2RHSejn:payload.punch2.RHS.ejection,
            p2RHSstatus:payload.punch2.RHS.status,
            p3LHSpre:payload.punch3.LHS.precompression,
            p3LHSmain:payload.punch3.LHS.maincompression,
            p3LHSejn:payload.punch3.LHS.ejection,
            p3LHSstatus:payload.punch3.LHS.status,
            p3RHSpre:payload.punch3.RHS.precompression,
            p3RHSmain:payload.punch3.RHS.maincompression,
            p3RHSejn:payload.punch3.RHS.ejection,
            p3RHSstatus:payload.punch3.RHS.status,
            p4LHSpre:payload.punch4.LHS.precompression,
            p4LHSmain:payload.punch4.LHS.maincompression,
            p4LHSejn:payload.punch4.LHS.ejection,
            p4LHSstatus:payload.punch4.LHS.status,
            p4RHSpre:payload.punch4.RHS.precompression,
            p4RHSmain:payload.punch4.RHS.maincompression,
            p4RHSejn:payload.punch4.RHS.ejection,
            p4RHSstatus:payload.punch4.RHS.status,
            p5LHSpre:payload.punch5.LHS.precompression,
            p5LHSmain:payload.punch5.LHS.maincompression,
            p5LHSejn:payload.punch5.LHS.ejection,
            p5LHSstatus:payload.punch5.LHS.status,
            p5RHSpre:payload.punch5.RHS.precompression,
            p5RHSmain:payload.punch5.RHS.maincompression,
            p5RHSejn:payload.punch5.RHS.ejection,
            p5RHSstatus:payload.punch5.RHS.status,
            p6LHSpre:payload.punch6.LHS.precompression,
            p6LHSmain:payload.punch6.LHS.maincompression,
            p6LHSejn:payload.punch6.LHS.ejection,
            p6LHSstatus:payload.punch6.LHS.status,
            p6RHSpre:payload.punch6.RHS.precompression,
            p6RHSmain:payload.punch6.RHS.maincompression,
            p6RHSejn:payload.punch6.RHS.ejection,
            p6RHSstatus:payload.punch6.RHS.status,
            p7LHSpre:payload.punch7.LHS.precompression,
            p7LHSmain:payload.punch7.LHS.maincompression,
            p7LHSejn:payload.punch7.LHS.ejection,
            p7LHSstatus:payload.punch7.LHS.status,
            p7RHSpre:payload.punch7.RHS.precompression,
            p7RHSmain:payload.punch7.RHS.maincompression,
            p7RHSejn:payload.punch7.RHS.ejection,
            p7RHSstatus:payload.punch7.RHS.status,
            p8LHSpre:payload.punch8.LHS.precompression,
            p8LHSmain:payload.punch8.LHS.maincompression,
            p8LHSejn:payload.punch8.LHS.ejection,
            p8LHSstatus:payload.punch8.LHS.status,
            p8RHSpre:payload.punch8.RHS.precompression,
            p8RHSmain:payload.punch8.RHS.maincompression,
            p8RHSejn:payload.punch8.RHS.ejection,
            p8RHSstatus:payload.punch8.RHS.status,
            p9LHSpre:payload.punch9.LHS.precompression,
            p9LHSmain:payload.punch9.LHS.maincompression,
            p9LHSejn:payload.punch9.LHS.ejection,
            p9LHSstatus:payload.punch9.LHS.status,
            p9RHSpre:payload.punch9.RHS.precompression,
            p9RHSmain:payload.punch9.RHS.maincompression,
            p9RHSejn:payload.punch9.RHS.ejection,
            p9RHSstatus:payload.punch9.RHS.status,
            p10LHSpre:payload.punch10.LHS.precompression,
            p10LHSmain:payload.punch10.LHS.maincompression,
            p10LHSejn:payload.punch10.LHS.ejection,
            p10LHSstatus:payload.punch10.LHS.status,
            p10RHSpre:payload.punch10.RHS.precompression,
            p10RHSmain:payload.punch10.RHS.maincompression,
            p10RHSejn:payload.punch10.RHS.ejection,
            p10RHSstatus:payload.punch10.RHS.status,
            p11LHSpre:payload.punch11.LHS.precompression,
            p11LHSmain:payload.punch11.LHS.maincompression,
            p11LHSejn:payload.punch11.LHS.ejection,
            p11LHSstatus:payload.punch11.LHS.status,
            p11RHSpre:payload.punch11.RHS.precompression,
            p11RHSmain:payload.punch11.RHS.maincompression,
            p11RHSejn:payload.punch11.RHS.ejection,
            p11RHSstatus:payload.punch11.RHS.status,
            p12LHSpre:payload.punch12.LHS.precompression,
            p12LHSmain:payload.punch12.LHS.maincompression,
            p12LHSejn:payload.punch12.LHS.ejection,
            p12LHSstatus:payload.punch12.LHS.status,
            p12RHSpre:payload.punch12.RHS.precompression,
            p12RHSmain:payload.punch12.RHS.maincompression,
            p12RHSejn:payload.punch12.RHS.ejection,
            p12RHSstatus:payload.punch12.RHS.status,
            p13LHSpre:payload.punch13.LHS.precompression,
            p13LHSmain:payload.punch13.LHS.maincompression,
            p13LHSejn:payload.punch13.LHS.ejection,
            p13LHSstatus:payload.punch13.LHS.status,
            p13RHSpre:payload.punch13.RHS.precompression,
            p13RHSmain:payload.punch13.RHS.maincompression,
            p13RHSejn:payload.punch13.RHS.ejection,
            p13RHSstatus:payload.punch13.RHS.status,
            p14LHSpre:payload.punch14.LHS.precompression,
            p14LHSmain:payload.punch14.LHS.maincompression,
            p14LHSejn:payload.punch14.LHS.ejection,
            p14LHSstatus:payload.punch14.LHS.status,
            p14RHSpre:payload.punch14.RHS.precompression,
            p14RHSmain:payload.punch14.RHS.maincompression,
            p14RHSejn:payload.punch14.RHS.ejection,
            p14RHSstatus:payload.punch14.RHS.status,
            p15LHSpre:payload.punch15.LHS.precompression,
            p15LHSmain:payload.punch15.LHS.maincompression,
            p15LHSejn:payload.punch15.LHS.ejection,
            p15LHSstatus:payload.punch15.LHS.status,
            p15RHSpre:payload.punch15.RHS.precompression,
            p15RHSmain:payload.punch15.RHS.maincompression,
            p15RHSejn:payload.punch15.RHS.ejection,
            p15RHSstatus:payload.punch15.RHS.status,
            p16LHSpre:payload.punch16.LHS.precompression,
            p16LHSmain:payload.punch16.LHS.maincompression,
            p16LHSejn:payload.punch16.LHS.ejection,
            p16LHSstatus:payload.punch16.LHS.status,
            p16RHSpre:payload.punch16.RHS.precompression,
            p16RHSmain:payload.punch16.RHS.maincompression,
            p16RHSejn:payload.punch16.RHS.ejection,
            p16RHSstatus:payload.punch16.RHS.status,
            p17LHSpre:payload.punch17.LHS.precompression,
            p17LHSmain:payload.punch17.LHS.maincompression,
            p17LHSejn:payload.punch17.LHS.ejection,
            p17LHSstatus:payload.punch17.LHS.status,
            p17RHSpre:payload.punch17.RHS.precompression,
            p17RHSmain:payload.punch17.RHS.maincompression,
            p17RHSejn:payload.punch17.RHS.ejection,
            p17RHSstatus:payload.punch17.RHS.status,
            p18LHSpre:payload.punch18.LHS.precompression,
            p18LHSmain:payload.punch18.LHS.maincompression,
            p18LHSejn:payload.punch18.LHS.ejection,
            p18LHSstatus:payload.punch18.LHS.status,
            p18RHSpre:payload.punch18.RHS.precompression,
            p18RHSmain:payload.punch18.RHS.maincompression,
            p18RHSejn:payload.punch18.RHS.ejection,
            p18RHSstatus:payload.punch18.RHS.status,
            p19LHSpre:payload.punch19.LHS.precompression,
            p19LHSmain:payload.punch19.LHS.maincompression,
            p19LHSejn:payload.punch19.LHS.ejection,
            p19LHSstatus:payload.punch19.LHS.status,
            p19RHSpre:payload.punch19.RHS.precompression,
            p19RHSmain:payload.punch19.RHS.maincompression,
            p19RHSejn:payload.punch19.RHS.ejection,
            p19RHSstatus:payload.punch19.RHS.status,
            p20LHSpre:payload.punch20.LHS.precompression,
            p20LHSmain:payload.punch20.LHS.maincompression,
            p20LHSejn:payload.punch20.LHS.ejection,
            p20LHSstatus:payload.punch20.LHS.status,
            p20RHSpre:payload.punch20.RHS.precompression,
            p20RHSmain:payload.punch20.RHS.maincompression,
            p20RHSejn:payload.punch20.RHS.ejection,
            p20RHSstatus:payload.punch20.RHS.status,
            p21LHSpre:payload.punch21.LHS.precompression,
            p21LHSmain:payload.punch21.LHS.maincompression,
            p21LHSejn:payload.punch21.LHS.ejection,
            p21LHSstatus:payload.punch21.LHS.status,
            p21RHSpre:payload.punch21.RHS.precompression,
            p21RHSmain:payload.punch21.RHS.maincompression,
            p21RHSejn:payload.punch21.RHS.ejection,
            p21RHSstatus:payload.punch21.RHS.status,
            p22LHSpre:payload.punch22.LHS.precompression,
            p22LHSmain:payload.punch22.LHS.maincompression,
            p22LHSejn:payload.punch22.LHS.ejection,
            p22LHSstatus:payload.punch22.LHS.status,
            p22RHSpre:payload.punch22.RHS.precompression,
            p22RHSmain:payload.punch22.RHS.maincompression,
            p22RHSejn:payload.punch22.RHS.ejection,
            p22RHSstatus:payload.punch22.RHS.status,
            p23LHSpre:payload.punch23.LHS.precompression,
            p23LHSmain:payload.punch23.LHS.maincompression,
            p23LHSejn:payload.punch23.LHS.ejection,
            p23LHSstatus:payload.punch23.LHS.status,
            p23RHSpre:payload.punch23.RHS.precompression,
            p23RHSmain:payload.punch23.RHS.maincompression,
            p23RHSejn:payload.punch23.RHS.ejection,
            p23RHSstatus:payload.punch23.RHS.status,
            p24LHSpre:payload.punch24.LHS.precompression,
            p24LHSmain:payload.punch24.LHS.maincompression,
            p24LHSejn:payload.punch24.LHS.ejection,
            p24LHSstatus:payload.punch24.LHS.status,
            p24RHSpre:payload.punch24.RHS.precompression,
            p24RHSmain:payload.punch24.RHS.maincompression,
            p24RHSejn:payload.punch24.RHS.ejection,
            p24RHSstatus:payload.punch24.RHS.status,
            p25LHSpre:payload.punch25.LHS.precompression,
            p25LHSmain:payload.punch25.LHS.maincompression,
            p25LHSejn:payload.punch25.LHS.ejection,
            p25LHSstatus:payload.punch25.LHS.status,
            p25RHSpre:payload.punch25.RHS.precompression,
            p25RHSmain:payload.punch25.RHS.maincompression,
            p25RHSejn:payload.punch25.RHS.ejection,
            p25RHSstatus:payload.punch25.RHS.status,
            p26LHSpre:payload.punch26.LHS.precompression,
            p26LHSmain:payload.punch26.LHS.maincompression,
            p26LHSejn:payload.punch26.LHS.ejection,
            p26LHSstatus:payload.punch26.LHS.status,
            p26RHSpre:payload.punch26.RHS.precompression,
            p26RHSmain:payload.punch26.RHS.maincompression,
            p26RHSejn:payload.punch26.RHS.ejection,
            p26RHSstatus:payload.punch26.RHS.status,
            p27LHSpre:payload.punch27.LHS.precompression,
            p27LHSmain:payload.punch27.LHS.maincompression,
            p27LHSejn:payload.punch27.LHS.ejection,
            p27LHSstatus:payload.punch27.LHS.status,
            p27RHSpre:payload.punch27.RHS.precompression,
            p27RHSmain:payload.punch27.RHS.maincompression,
            p27RHSejn:payload.punch27.RHS.ejection,
            p27RHSstatus:payload.punch27.RHS.status,
            p28LHSpre:payload.punch28.LHS.precompression,
            p28LHSmain:payload.punch28.LHS.maincompression,
            p28LHSejn:payload.punch28.LHS.ejection,
            p28LHSstatus:payload.punch28.LHS.status,
            p28RHSpre:payload.punch28.RHS.precompression,
            p28RHSmain:payload.punch28.RHS.maincompression,
            p28RHSejn:payload.punch28.RHS.ejection,
            p28RHSstatus:payload.punch28.RHS.status,
            p29LHSpre:payload.punch29.LHS.precompression,
            p29LHSmain:payload.punch29.LHS.maincompression,
            p29LHSejn:payload.punch29.LHS.ejection,
            p29LHSstatus:payload.punch29.LHS.status,
            p29RHSpre:payload.punch29.RHS.precompression,
            p29RHSmain:payload.punch29.RHS.maincompression,
            p29RHSejn:payload.punch29.RHS.ejection,
            p29RHSstatus:payload.punch29.RHS.status,
            p30LHSpre:payload.punch30.LHS.precompression,
            p30LHSmain:payload.punch30.LHS.maincompression,
            p30LHSejn:payload.punch30.LHS.ejection,
            p30LHSstatus:payload.punch30.LHS.status,
            p30RHSpre:payload.punch30.RHS.precompression,
            p30RHSmain:payload.punch30.RHS.maincompression,
            p30RHSejn:payload.punch30.RHS.ejection,
            p30RHSstatus:payload.punch30.RHS.status,
            p31LHSpre:payload.punch31.LHS.precompression,
            p31LHSmain:payload.punch31.LHS.maincompression,
            p31LHSejn:payload.punch31.LHS.ejection,
            p31LHSstatus:payload.punch31.LHS.status,
            p31RHSpre:payload.punch31.RHS.precompression,
            p31RHSmain:payload.punch31.RHS.maincompression,
            p31RHSejn:payload.punch31.RHS.ejection,
            p31RHSstatus:payload.punch31.RHS.status,
            p32LHSpre:payload.punch32.LHS.precompression,
            p32LHSmain:payload.punch32.LHS.maincompression,
            p32LHSejn:payload.punch32.LHS.ejection,
            p32LHSstatus:payload.punch32.LHS.status,
            p32RHSpre:payload.punch32.RHS.precompression,
            p32RHSmain:payload.punch32.RHS.maincompression,
            p32RHSejn:payload.punch32.RHS.ejection,
            p32RHSstatus:payload.punch32.RHS.status,
            p33LHSpre:payload.punch33.LHS.precompression,
            p33LHSmain:payload.punch33.LHS.maincompression,
            p33LHSejn:payload.punch33.LHS.ejection,
            p33LHSstatus:payload.punch33.LHS.status,
            p33RHSpre:payload.punch33.RHS.precompression,
            p33RHSmain:payload.punch33.RHS.maincompression,
            p33RHSejn:payload.punch33.RHS.ejection,
            p33RHSstatus:payload.punch33.RHS.status,
            p34LHSpre:payload.punch34.LHS.precompression,
            p34LHSmain:payload.punch34.LHS.maincompression,
            p34LHSejn:payload.punch34.LHS.ejection,
            p34LHSstatus:payload.punch34.LHS.status,
            p34RHSpre:payload.punch34.RHS.precompression,
            p34RHSmain:payload.punch34.RHS.maincompression,
            p34RHSejn:payload.punch34.RHS.ejection,
            p34RHSstatus:payload.punch34.RHS.status,
            p35LHSpre:payload.punch35.LHS.precompression,
            p35LHSmain:payload.punch35.LHS.maincompression,
            p35LHSejn:payload.punch35.LHS.ejection,
            p35LHSstatus:payload.punch35.LHS.status,
            p35RHSpre:payload.punch35.RHS.precompression,
            p35RHSmain:payload.punch35.RHS.maincompression,
            p35RHSejn:payload.punch35.RHS.ejection,
            p35RHSstatus:payload.punch35.RHS.status,
            p36LHSpre:payload.punch36.LHS.precompression,
            p36LHSmain:payload.punch36.LHS.maincompression,
            p36LHSejn:payload.punch36.LHS.ejection,
            p36LHSstatus:payload.punch36.LHS.status,
            p36RHSpre:payload.punch36.RHS.precompression,
            p36RHSmain:payload.punch36.RHS.maincompression,
            p36RHSejn:payload.punch36.RHS.ejection,
            p36RHSstatus:payload.punch36.RHS.status,
            p37LHSpre:payload.punch37.LHS.precompression,
            p37LHSmain:payload.punch37.LHS.maincompression,
            p37LHSejn:payload.punch37.LHS.ejection,
            p37LHSstatus:payload.punch37.LHS.status,
            p37RHSpre:payload.punch37.RHS.precompression,
            p37RHSmain:payload.punch37.RHS.maincompression,
            p37RHSejn:payload.punch37.RHS.ejection,
            p37RHSstatus:payload.punch37.RHS.status,
            p38LHSpre:payload.punch38.LHS.precompression,
            p38LHSmain:payload.punch38.LHS.maincompression,
            p38LHSejn:payload.punch38.LHS.ejection,
            p38LHSstatus:payload.punch38.LHS.status,
            p38RHSpre:payload.punch38.RHS.precompression,
            p38RHSmain:payload.punch38.RHS.maincompression,
            p38RHSejn:payload.punch38.RHS.ejection,
            p38RHSstatus:payload.punch38.RHS.status,
            p39LHSpre:payload.punch39.LHS.precompression,
            p39LHSmain:payload.punch39.LHS.maincompression,
            p39LHSejn:payload.punch39.LHS.ejection,
            p39LHSstatus:payload.punch39.LHS.status,
            p39RHSpre:payload.punch39.RHS.precompression,
            p39RHSmain:payload.punch39.RHS.maincompression,
            p39RHSejn:payload.punch39.RHS.ejection,
            p39RHSstatus:payload.punch39.RHS.status,
            p40LHSpre:payload.punch40.LHS.precompression,
            p40LHSmain:payload.punch40.LHS.maincompression,
            p40LHSejn:payload.punch40.LHS.ejection,
            p40LHSstatus:payload.punch40.LHS.status,
            p40RHSpre:payload.punch40.RHS.precompression,
            p40RHSmain:payload.punch40.RHS.maincompression,
            p40RHSejn:payload.punch40.RHS.ejection,
            p40RHSstatus:payload.punch40.RHS.status,
            p41LHSpre:payload.punch41.LHS.precompression,
            p41LHSmain:payload.punch41.LHS.maincompression,
            p41LHSejn:payload.punch41.LHS.ejection,
            p41LHSstatus:payload.punch41.LHS.status,
            p41RHSpre:payload.punch41.RHS.precompression,
            p41RHSmain:payload.punch41.RHS.maincompression,
            p41RHSejn:payload.punch41.RHS.ejection,
            p41RHSstatus:payload.punch41.RHS.status,
            p42LHSpre:payload.punch42.LHS.precompression,
            p42LHSmain:payload.punch42.LHS.maincompression,
            p42LHSejn:payload.punch42.LHS.ejection,
            p42LHSstatus:payload.punch42.LHS.status,
            p42RHSpre:payload.punch42.RHS.precompression,
            p42RHSmain:payload.punch42.RHS.maincompression,
            p42RHSejn:payload.punch42.RHS.ejection,
            p42RHSstatus:payload.punch42.RHS.status,
            p43LHSpre:payload.punch43.LHS.precompression,
            p43LHSmain:payload.punch43.LHS.maincompression,
            p43LHSejn:payload.punch43.LHS.ejection,
            p43LHSstatus:payload.punch43.LHS.status,
            p43RHSpre:payload.punch43.RHS.precompression,
            p43RHSmain:payload.punch43.RHS.maincompression,
            p43RHSejn:payload.punch43.RHS.ejection,
            p43RHSstatus:payload.punch43.RHS.status,
            p44LHSpre:payload.punch44.LHS.precompression,
            p44LHSmain:payload.punch44.LHS.maincompression,
            p44LHSejn:payload.punch44.LHS.ejection,
            p44LHSstatus:payload.punch44.LHS.status,
            p44RHSpre:payload.punch44.RHS.precompression,
            p44RHSmain:payload.punch44.RHS.maincompression,
            p44RHSejn:payload.punch44.RHS.ejection,
            p44RHSstatus:payload.punch44.RHS.status,
            p45LHSpre:payload.punch45.LHS.precompression,
            p45LHSmain:payload.punch45.LHS.maincompression,
            p45LHSejn:payload.punch45.LHS.ejection,
            p45LHSstatus:payload.punch45.LHS.status,
            p45RHSpre:payload.punch45.RHS.precompression,
            p45RHSmain:payload.punch45.RHS.maincompression,
            p45RHSejn:payload.punch45.RHS.ejection,
            p45RHSstatus:payload.punch45.RHS.status,
        })
        .then(() => console.info(`[ HISTORY WRITE SUCESSFUL ${payload.data_number} ]`))
        .catch(console.error);
}

// Updated with each rotation
writeAverage = () => {
    flux.write(`${payload.batch}.average`)
        .tag({
        })
        .field({
            batch: payload.batch,
            rotation: payload.data_number,

            preLHSavg: payload.precompressionLHS_avg,
            mainLHSavg: payload.maincompressionLHS_avg,
            ejnLHSavg: payload.ejectionLHS_avg,
            preRHSavg: payload.precompressionRHS_avg,
            mainRHSavg: payload.maincompressionRHS_avg,
            ejnRHSavg: payload.ejectionRHS_avg,    
        })
        .then(() => console.info(`[ AVERAGE WRITE SUCESSFUL ${payload.data_number} ]`))
        .catch(console.error);
}

// Updated when a parameter changed
writeMachine = () => {
    flux.write(`${payload.batch}.machine`)
        .tag({
        })
        .field({
            operatorname: payload.machine.operator_name,
            machineID: payload.machine.machine_id,
            LHSmcUpperLimit: payload.machine.LHS.maincompression_upperlimit,
            LHSmcLowerLimit: payload.machine.LHS.maincompression_lowerlimit,
            LHSpcUpperLimit: payload.machine.LHS.precompression_upperlimit,
            LHSpcLowerLimit: payload.machine.LHS.precompression_lowerlimit,
            LHSejnUpperLimit: payload.machine.LHS.ejection_upperlimit,
            RHSmcUpperLimit: payload.machine.RHS.maincompression_upperlimit,
            RHSmcLowerLimit: payload.machine.RHS.maincompression_lowerlimit,
            RHSpcUpperLimit: payload.machine.RHS.precompression_upperlimit,
            RHSpcLowerLimit: payload.machine.RHS.precompression_lowerlimit,
            RHSejnUpperLimit: payload.machine.RHS.ejection_upperlimit,

            rpm: payload.stats.rpm,
            recipieID: payload.stats.recipie_id,
            productionCount: payload.stats.count,
            productionPerHour: payload.stats.tablets_per_hour,
        })
        .then(() => console.info(`[ MACHINE WRITE SUCESSFUL ${date()} ]`))
        .catch(console.error);
};

// write every 10 mins
writemachine = () => {
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
   
    // proxy.watch((err, value) => {
    //     if (err) {
    //         throw err;
    //     }
    //     payload.data_number++;
    //     console.log("DATA")
    //     writeHistory();
    //     writeAverage();
    // });
}

module.exports = {
    payload, startmodbus, watchproxy
}