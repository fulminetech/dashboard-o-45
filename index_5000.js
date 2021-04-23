const express = require('express');
const app = express();
var path = require('path');
const puppeteer = require('puppeteer');
var cors = require('cors')
const host = "localhost"

// Influx Imports
const Influx = require('influxdb-nodejs');
const { query } = require("express");
const _new = new Influx(`http://${host}:8086/new`);
const _perm = new Influx(`http://${host}:8086/perm`);

const { exec } = require('child_process');
const restart1Command = "pm2 restart all"

const {
    payload, startmodbus, watchproxy, updatestatsbatch
} = require('./data.js')

app.use(cors({ origin: "*" }));

// Serve NPM modules
app.use('/charts', express.static(__dirname + '/node_modules/chart.js/dist/'));
app.use('/charts/plugin', express.static(__dirname + '/node_modules/chartjs-plugin-zoom/'));
app.use('/plugin', express.static(__dirname + '/node_modules/hammerjs/'));
app.use('/css', express.static(__dirname + '/node_modules/tailwindcss/dist/'));
app.use('/font', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/'));
app.use('/env', express.static(__dirname + '/html_/'));
app.use('/favicon_io', express.static(__dirname + '/favicon_io/'));
app.use('/guage', express.static(__dirname + '/html_/guage/'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/login.html"));
});

app.get("/users", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/users.html"));
});

app.get("/recipe", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/recipe.html"));
});

app.get("/audit", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/audit.html"));
});

app.get("/alarm", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/alarm.html"));
});

app.get("/dashboard", (req, res) => {
    // res.header('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(__dirname + "/html_/index.html"));
});

app.get("/login/logo", (req, res) => {
    res.sendFile(path.join(__dirname + "/background.png"));
});
app.get("/login/image", (req, res) => {
    res.sendFile(path.join(__dirname + "/login.jpeg"));
});

app.get("/graphLHS", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/graphLHS.html"));
});

app.get("/graphRHS", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/graphRHS.html"));
});

app.get("/dido", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/dido.html"));
});

app.get("/do", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/do.html"));
});

app.get("/io_alarm", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/io_alarm.html"));
});

app.get("/io_maintanience", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/io_maintanience.html"));
});

app.get("/onboard", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/onboard.html"));
});

app.get("/processsetup", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/processsetup.html"));
});

app.get("/history", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/history.html"));
});

app.get("/analytics", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/analytics.html"));
});

app.get("/audit", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/audit.html"));
});

app.get("/settings", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/settings.html"));
});

app.get("/settings_recipie", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/settings_recipie.html"));
});

app.get("/settings_awc", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/settings_awc.html"));
});

app.get("/settings_homing", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/settings_homing.html"));
});

app.get("/settings_limit", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/settings_limit.html"));
});

app.get("/settings_setup", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/settings_setup.html"));
});

app.get("/settings_user", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/settings_user.html"));
});

app.get("/restart_server", (req, res) => {
    restartprodmodbus()
});

function restartprodmodbus() {
    exec(restart1Command, (err, stdout, stderr) => {
        // handle err if you like!
        console.log(`[ RESTARTING ]`);
        console.log(`${stdout}`);
    });
}


app.get("/onboard/:namee/:machinee/:recepiee/:batchh", (req, res) => {
    const a = req.params.namee;
    const b = req.params.machinee;
    const c = req.params.recepiee;
    const d = req.params.batchh;

    payload.machine.operator_name = a;
    payload.machine.machine_id = b;
    payload.stats.recipie_id = c;
    payload.batch = d;
    payload.stats.status = "ONLINE",
        
    _perm.write(`batchlist`)
        .tag({
        })
        .field({
            batch: d,  // 2
            operator: a,  // 2
            parameter: "Process",  // 2
            newvalue: "ONLINE"
        })
        .then(() => console.info('[ BATCH ENTRY DONE ]'))
        .catch(console.error);
    
    watchproxy();
    startmodbus();
    updatestatsbatch()
    return res.json({ message: `[ ONBOARDED BATCH: ${d} ]` });
});

app.get("/onboard/continue", (req, res) => {

    function checkbatch() {
        _perm.queryRaw(`select "batch" from "batchlist" ORDER BY time DESC LIMIT 1`)
            .then(data => {
                var response = data.results[0].series[0].values[0];
                var response1 = data.results[0].series[0].values[1];
                var lastBatch = response[1]
                var lastOperator = response1[1]
                console.log(lastBatch)
                console.log(lastOperator)
            
                payload.machine.operator_name = lastOperator;
                payload.batch = lastBatch
                payload.stats.status = "ONLINE"

            })
            .then(
                _new.queryRaw(`select "rotation" from "${batchinfo.name}.average" ORDER BY time DESC LIMIT 1`)
                    .then(data => {
                        var response = data.results[0].series[0].values[0];
                        var previousrtn = parseInt(response[1]);
                        console.log(previousrtn)
                        batchinfo.rotation = previousrtn
                    })
                    .catch(console.error)
            )
            .catch(console.error);
    }

    watchproxy();
    startmodbus();
    updatestatsbatch()
    return res.json({ message: `[ CONTINUING BATCH: ${payload.batch} ]` });
});


// --++ Gives List of Batches ++--

function filterItems(arr, query) {
    return arr.filter(function (el) {
        return el.toLowerCase().indexOf(query.toLowerCase()) !== -1
    })
}

function removeWord(arr, word) {
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].replace(word, '');
    }
}

var response = {
    batchcount: 0,
    batchnames: {
    }
}

app.get("/api/search/batch", (req, res) => {
    _new.showMeasurements()
        .then(data => {
            var originalList = Object.values(data)
            var filteredList = filterItems(originalList, 'machine')
            response.batchcount = filteredList.length;
            removeWord(filteredList, '.machine')
            response.batchnames = filteredList

            res.send(response)
        })
        .catch(console.error);
})

// --++ Get data from Database ++--
var avg = {
    totalrotations: 0,
    data: {}
}

var alarms = {
    totalalarms: 0,
    data: {}
}

var report = {
    batch: 0,
    from: 0,
    to: 0,
}

app.get("/api/batchinfo", (req, res) => {
    var batchinfo = {
        name: payload.batch,
        operator: payload.machine.operator_name,
        rotation: payload.data_number
    }

    res.json(batchinfo)
});

app.get("/api/search/average/:batch", (req, res) => {
    // select * from "payload" where "rotation" = 7
    const r = req.params.batch

    async function passbatch(r) {
        _new.queryRaw(`select "rotation", "preLHSavg", "mainLHSavg", "ejnLHSavg", "preRHSavg", "mainRHSavg", "ejnRHSavg" from "${r}.average"`)
            .then(data => {
                var response = data.results[0].series[0].values
                avg.totalrotations = response.length - 1
                avg.data = response
                res.json(avg)
            })
            .catch(console.error);
    };

    passbatch(r)
});

var logs = {
    totallogs: 0,
    data: {}
}

app.get("/api/search/:batch/:param", (req, res) => {
    // select * from "payload" where "rotation" = 7
    const batch = req.params.batch
    const param = req.params.param

    async function getData(batch, param) {
        _new.queryRaw(`select * from "${batch}.${param}"`)
            .then(data => {
                var response = data.results[0].series[0].values
                var _data = {
                    count: response.length,
                    data: response
                }
                res.json(_data)
            })
            .catch(console.error);
    };


    getData(batch, param)
    
});

app.get("/api/search/csv/:batch/:param", (req, res) => {
    // select * from "payload" where "rotation" = 7

    const batch = req.params.batch
    const param = req.params.param

    async function getData(batch, param) {
        _new.queryRaw(`select * from "${batch}.${param}"`)
            .then(data => {
                var response = data.results[0].series[0].values
                var _data = {
                    count: response.length,
                    data: response
                }
                res.json(_data.data)
            })
            .catch(console.error);
    };

    getData(batch, param)
});

var history = {
    count: 0,
    data: {}
}

app.get("/api/search/average/csv/:batch", (req, res) => {
    // select * from "payload" where "rotation" = 7
    const r = req.params.batch
    async function passbatch(r) {
        _new.queryRaw(`select * from "${r}.average"`)
            .then(data => {
                var response = data.results[0].series[0].values
                avg.totalrotations = response.length - 1
                avg.data = response

                res.json(avg.data)
            })
            .catch(console.error);
    };

    passbatch(r)
});

app.get("/api/search/logs/:batch", (req, res) => {
    // select * from "payload" where "rotation" = 7
    const r = req.params.batch

    async function passbatch(r) {
        _perm.queryRaw(`select * from "operationlogs" where "batch" = '${r}'`)
            .then(data => {
                var response = data.results[0].series[0].values
                res.json(response)
            })
            .catch(console.error);
    };

    passbatch(r)
});

app.get("/api/search/rotation/:rotationn", (req, res) => {
    // select * from "payload" where "rotation" = 7
    const r = parseInt(req.params.rotationn)

    passbatch(r)

    async function passbatch(r) {
        _new.query(`${payload.batch}.history`)
            .where('rotation', r)
            .then(data => {
                let payload1 = Object.values(data.results[0].series[0].values[0]);
                // let payload1 = Object.values(data);
                console.log(`[ RESPONSE:  ${payload1} ]`);
                if (typeof payload1 === "object") {
                    res.send(payload1)
                }
            })
            .catch(console.error);
    };
});

app.use("/api/payload", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.json(payload);
});

var report = {
    batch: 0,
    from: 0,
    to: 0,
}

app.get("/report/average/:batch/:from/:to", (req, res) => {
    const b = req.params.batch
    const f = req.params.from
    const t = req.params.to

    report.batch = b;
    report.from = f;
    report.to = t;

    return res.json({ message: `[ READY TO EXPORT ]` });

})

app.get("/report/template", (req, res) => {
    res.sendFile(path.join(__dirname + "/report/report.html"));
});

app.get("/report/average/now", (req, res) => {
    res.send(report);
})

app.get("/report/average/generate", (req, res) => {
    (async () => {
        // const browser = await puppeteer.launch({ product: 'chrome', executablePath: '/usr/bin/chromium-browser' });
        const browser = await puppeteer.launch({ product: 'chrome' });
        const page = await browser.newPage();
        await page.goto(`http://${host}:5000/report/template`, { waitUntil: 'networkidle0' });
        await page.pdf({ path: `batch_${report.batch}_from_${report.from}_to_${report.to}.pdf`, format: 'A4' });
        await browser.close();
    })();

    return res.json({ message: 'EXPORTED' });
})

app.get("/report/average/download", (req, res) => {
    var file = path.join(__dirname, `batch_${report.batch}_from_${report.from}_to_${report.to}.pdf`);
    res.download(file, function (err) {
        if (err) {
            console.log("Error");
            console.log(err);
        } else {
            console.log("Success");
        }
    });
})

// Start Server
const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port} 🔥`));