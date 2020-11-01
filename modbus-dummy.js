const express = require("express");
const app = express();


function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomIntFromIntervall() { // min and max included 
    return randomIntFromInterval(60, 80)
}

function randomIntFromIntervall1() { // min and max included 
    return randomIntFromInterval(60, 80)
}

var i = 0;
var ii = 0;

function punchno() {
    if (ii < 46) {
        ii ++
    } else {
        ii = 0
    }
}

var payload;


setInterval(() => {
    punchno();
    payload = {
        batch: "TEST-3",
        data_number: i, // Rotation Number
        rotation_no: 0,
        present_punch: ii,
        precompressionLHS_avg: randomIntFromIntervall1(),
        precompressionRHS_avg: randomIntFromIntervall1(),
        maincompressionLHS_avg: randomIntFromIntervall1(),
        maincompressionRHS_avg: randomIntFromIntervall1(),
        ejectionLHS_avg: 0,
        ejectionRHS_avg: 0,
        machine: {
            LHS: {
                maincompression_upperlimit: 75,
                maincompression_lowerlimit: 65,
                precompression_upperlimit: 75,
                precompression_lowerlimit: 65,
                ejection_upperlimit: 0,
            },
            RHS: {
                maincompression_upperlimit: 75,
                maincompression_lowerlimit: 65,
                precompression_upperlimit: 75,
                precompression_lowerlimit: 65,
                ejection_upperlimit: 0,
            },
            main_forceline: 0,
            pre_forceline: 0,
            ejn_forceline: 0,
        },
        stats: {
            status: "ONLINE",
            count: 0,
            tablets_per_hour: 0,
            rpm: 2,
            active_punches: 0,
            dwell: 0
        },
        punch1: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch2: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch3: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch4: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch5: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch6: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch7: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch8: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch9: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch10: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch11: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch12: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch13: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch14: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch15: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch16: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch17: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch18: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch19: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch20: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch21: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch22: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch23: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch24: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch25: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch26: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch27: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch28: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch29: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch30: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch31: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch32: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch33: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch34: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch35: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch36: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch37: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch38: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch39: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch40: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch41: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch42: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch43: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch44: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        },
        punch45: {
            LHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            },
            RHS: {
                precompression: randomIntFromIntervall(),
                maincompression: randomIntFromIntervall(),
                ejection: randomIntFromIntervall(),
                status: true
            }
        }
    };
    randomIntFromIntervall()
}, 1000);


setInterval(() => {
    i++
}, 3000);

app.use("/api/payload", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json(payload);
});

// Start Server
const port = 3128;
app.listen(port, () => console.log(`Server running on port ${port} 👑`));