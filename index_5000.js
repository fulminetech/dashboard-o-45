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
const restartstats = "pm2 restart stats_3128"
const restartcompression = "pm2 restart compression_3129"
const restartraw = "pm2 restart main_5000"

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

app.get("/history_datatable", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/history_datatable.html"));
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

function restartserver(arg) {
    exec(arg, (err, stdout, stderr) => {
        // handle err if you like!
        console.log(`[ RESTARTING ${stdout} ]`);
        console.log(`[ RESTARTING ${err} ${stderr} ]`);
    });
}

app.get("/restart/:param", (req, res) => {
    const a = req.params.param;
    a == "stats" ? restartserver(restartstats) : restartstats
    a == "compression" ? restartserver(restartcompression) : restartcompression
    a == "raw" ? restartserver(restartraw) : restartraw
});

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
            parameter: "operator",  // 2
            newvalue: "ONLINE"
        })
        .then(() => console.info('[ BATCH ENTRY DONE ]'))
        .then(function () {
            _new.write(`${payload.batch}.operationlogs`)
                .tag({
                })
                .field({
                    operator: payload.machine.operator_name,  // 2
                    parameter: "BATCH START",  // 2
                })
                .then(() => console.info(`[ LOG ENTRY DONE ${payload.machine.operator_name} ]`))
                .catch(console.error);
        })
        .catch(console.error);
    
    watchproxy();
    startmodbus();
    updatestatsbatch()
    return res.json({ message: `[ ONBOARDED BATCH: ${d} ]` });
});

app.get("/onboard/continue", (req, res) => {

    var lastBatch

    function checkbatch() {
        _perm.queryRaw(`select "batch", "operator" from "batchlist" ORDER BY time DESC LIMIT 1`)
            .then(data => {
                var response = data.results[0].series[0].values[0];
                console.log(response)

                lastBatch = response[1]
                var lastOperator = response[2]
                console.log(lastBatch)
                console.log(lastOperator)
            
                payload.machine.operator_name = lastOperator;
                payload.batch = lastBatch
                payload.stats.status = "ONLINE"

            })
            .then(function () {
                _new.queryRaw(`select "rotation" from "${lastBatch}.average" ORDER BY time DESC LIMIT 1`)
                    .then(data => {
                        var response = data.results[0].series[0].values[0];
                        var previousrtn = parseInt(response[1]);
                        // console.log(previousrtn)
                        payload.data_number = previousrtn
                    })
                    .catch(console.error)
            })
            .then(function () {
                _new.write(`${payload.batch}.operationlogs`)
                    .tag({
                    })
                    .field({
                        operator: payload.machine.operator_name,  // 2
                        parameter: "BATCH CONTINUED",  // 2
                    })
                    .then(() => console.info(`[ LOG ENTRY DONE ${payload.machine.operator_name} ]`))
                    .catch(console.error);
            })
            .then(function () {
                watchproxy();
                startmodbus();
                updatestatsbatch()
                return res.json({ message: `[ CONTINUING BATCH: ${payload.batch} ]` });
                }
            )
            .catch(console.error);
    }

    checkbatch()

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
    userlevel: '',
    username: ''
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

app.get("/api/csv/:param/:batch/:from/:to", (req, res) => {
    // select * from "payload" where "rotation" = 7
    const param = req.params.param
    const batch = req.params.batch
    const from = req.params.from
    const to = req.params.to

    if (param == "preLHS") {
        
        _new.queryRaw(`select "rotation", "p1LHSpre", "p2LHSpre", "p3LHSpre", "p4LHSpre", "p5LHSpre", "p6LHSpre", "p7LHSpre", "p8LHSpre", "p9LHSpre", "p10LHSpre", "p11LHSpre", "p12LHSpre", "p13LHSpre", "p14LHSpre", "p15LHSpre", "p16LHSpre", "p17LHSpre", "p18LHSpre", "p19LHSpre", "p20LHSpre", "p21LHSpre", "p22LHSpre", "p23LHSpre", "p24LHSpre", "p25LHSpre", "p26LHSpre", "p27LHSpre", "p28LHSpre", "p29LHSpre", "p30LHSpre", "p31LHSpre", "p32LHSpre", "p33LHSpre", "p34LHSpre", "p35LHSpre", "p36LHSpre", "p37LHSpre", "p38LHSpre", "p39LHSpre", "p40LHSpre", "p41LHSpre", "p42LHSpre", "p43LHSpre", "p44LHSpre", "p45LHSpre" from "${batch}.history" WHERE "rotation" <= ${to} AND "rotation" >= ${from}`)
            .then(data => {
                var response = data.results[0].series[0].values
                var _data = {
                    count: response.length,
                    data: response
                }
                res.json(_data)
                // console.log(_data.data)
            })
            .catch(console.error);
        
    } else if (param == "preRHS") {
        _new.queryRaw(`select "rotation", "p1RHSpre", "p2RHSpre", "p3RHSpre", "p4RHSpre", "p5RHSpre", "p6RHSpre", "p7RHSpre", "p8RHSpre", "p9RHSpre", "p10RHSpre", "p11RHSpre", "p12RHSpre", "p13RHSpre", "p14RHSpre", "p15RHSpre", "p16RHSpre", "p17RHSpre", "p18RHSpre", "p19RHSpre", "p20RHSpre", "p21RHSpre", "p22RHSpre", "p23RHSpre", "p24RHSpre", "p25RHSpre", "p26RHSpre", "p27RHSpre", "p28RHSpre", "p29RHSpre", "p30RHSpre", "p31RHSpre", "p32RHSpre", "p33RHSpre", "p34RHSpre", "p35RHSpre", "p36RHSpre", "p37RHSpre", "p38RHSpre", "p39RHSpre", "p40RHSpre", "p41RHSpre", "p42RHSpre", "p43RHSpre", "p44RHSpre", "p45RHSpre" from "${batch}.history" WHERE "rotation" <= ${to} AND "rotation" >= ${from}`)
            .then(data => {
                var response = data.results[0].series[0].values
                var _data = {
                    count: response.length,
                    data: response
                }
                res.json(_data)
                // console.log(_data)
            })
            .catch(console.error);


    } else if (param == "mainLHS") {
        _new.queryRaw(`select "rotation", "p1LHSmain", "p2LHSmain", "p3LHSmain", "p4LHSmain", "p5LHSmain", "p6LHSmain", "p7LHSmain", "p8LHSmain", "p9LHSmain", "p10LHSmain", "p11LHSmain", "p12LHSmain", "p13LHSmain", "p14LHSmain", "p15LHSmain", "p16LHSmain", "p17LHSmain", "p18LHSmain", "p19LHSmain", "p20LHSmain", "p21LHSmain", "p22LHSmain", "p23LHSmain", "p24LHSmain", "p25LHSmain", "p26LHSmain", "p27LHSmain", "p28LHSmain", "p29LHSmain", "p30LHSmain", "p31LHSmain", "p32LHSmain", "p33LHSmain", "p34LHSmain", "p35LHSmain", "p36LHSmain", "p37LHSmain", "p38LHSmain", "p39LHSmain", "p40LHSmain", "p41LHSmain", "p42LHSmain", "p43LHSmain", "p44LHSmain", "p45LHSmain" from "${batch}.history" WHERE "rotation" <= ${to} AND "rotation" >= ${from}`)
            .then(data => {
                var response = data.results[0].series[0].values
                var _data = {
                    count: response.length,
                    data: response
                }
                res.json(_data)
                // console.log(_data)
            })
            .catch(console.error);

    } else if (param == "mainRHS") {
        _new.queryRaw(`select "rotation", "p1RHSmain", "p2RHSmain", "p3RHSmain", "p4RHSmain", "p5RHSmain", "p6RHSmain", "p7RHSmain", "p8RHSmain", "p9RHSmain", "p10RHSmain", "p11RHSmain", "p12RHSmain", "p13RHSmain", "p14RHSmain", "p15RHSmain", "p16RHSmain", "p17RHSmain", "p18RHSmain", "p19RHSmain", "p20RHSmain", "p21RHSmain", "p22RHSmain", "p23RHSmain", "p24RHSmain", "p25RHSmain", "p26RHSmain", "p27RHSmain", "p28RHSmain", "p29RHSmain", "p30RHSmain", "p31RHSmain", "p32RHSmain", "p33RHSmain", "p34RHSmain", "p35RHSmain", "p36RHSmain", "p37RHSmain", "p38RHSmain", "p39RHSmain", "p40RHSmain", "p41RHSmain", "p42RHSmain", "p43RHSmain", "p44RHSmain", "p45RHSmain" from "${batch}.history" WHERE "rotation" <= ${to} AND "rotation" >= ${from}`)
            .then(data => {
                var response = data.results[0].series[0].values
                var _data = {
                    count: response.length,
                    data: response
                }
                res.json(_data)
                // console.log(_data)
            })
            .catch(console.error);

    } else if (param == "ejnLHS") {
        _new.queryRaw(`select "rotation", "p1LHSejn", "p2LHSejn", "p3LHSejn", "p4LHSejn", "p5LHSejn", "p6LHSejn", "p7LHSejn", "p8LHSejn", "p9LHSejn", "p10LHSejn", "p11LHSejn", "p12LHSejn", "p13LHSejn", "p14LHSejn", "p15LHSejn", "p16LHSejn", "p17LHSejn", "p18LHSejn", "p19LHSejn", "p20LHSejn", "p21LHSejn", "p22LHSejn", "p23LHSejn", "p24LHSejn", "p25LHSejn", "p26LHSejn", "p27LHSejn", "p28LHSejn", "p29LHSejn", "p30LHSejn", "p31LHSejn", "p32LHSejn", "p33LHSejn", "p34LHSejn", "p35LHSejn", "p36LHSejn", "p37LHSejn", "p38LHSejn", "p39LHSejn", "p40LHSejn", "p41LHSejn", "p42LHSejn", "p43LHSejn", "p44LHSejn", "p45LHSejn" from "${batch}.history" WHERE "rotation" <= ${to} AND "rotation" >= ${from}`)
            .then(data => {
                var response = data.results[0].series[0].values
                var _data = {
                    count: response.length,
                    data: response
                }
                res.json(_data)
                // console.log(_data)
            })
            .catch(console.error);

    } else if (param == "ejnRHS") {
        _new.queryRaw(`select "rotation", "p1RHSejn", "p2RHSejn", "p3RHSejn", "p4RHSejn", "p5RHSejn", "p6RHSejn", "p7RHSejn", "p8RHSejn", "p9RHSejn", "p10RHSejn", "p11RHSejn", "p12RHSejn", "p13RHSejn", "p14RHSejn", "p15RHSejn", "p16RHSejn", "p17RHSejn", "p18RHSejn", "p19RHSejn", "p20RHSejn", "p21RHSejn", "p22RHSejn", "p23RHSejn", "p24RHSejn", "p25RHSejn", "p26RHSejn", "p27RHSejn", "p28RHSejn", "p29RHSejn", "p30RHSejn", "p31RHSejn", "p32RHSejn", "p33RHSejn", "p34RHSejn", "p35RHSejn", "p36RHSejn", "p37RHSejn", "p38RHSejn", "p39RHSejn", "p40RHSejn", "p41RHSejn", "p42RHSejn", "p43RHSejn", "p44RHSejn", "p45RHSejn" from "${batch}.history" WHERE "rotation" <= ${to} AND "rotation" >= ${from}`)
            .then(data => {
                var response = data.results[0].series[0].values
                var _data = {
                    count: response.length,
                    data: response
                }
                res.json(_data)
                // console.log(_data)
            })
            .catch(console.error);

    } else {
        return res.status(400).json({ message: 'Not found' });
    }
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

// Does not work! 
app.get("/api/search/rotation/:batch/:rotationn", (req, res) => {
    // select * from "payload" where "rotation" = 7
    const rotation = parseInt(req.params.rotationn)
    const batch = parseInt(req.params.batch)

    async function passbatch(batch, rotation) {
        _new.query(`${batch}.history`)
            .where('rotation', `${rotation}`)
            .then(data => {
                let payload1 = Object.values(data.results[0].series[0].values);
                // let payload1 = Object.values(data);
                console.log(`[ RESPONSE:  ${payload1} ]`);
                if (typeof payload1 === "object") {
                    res.send(payload1)
                }
            })
            .catch(console.error);
    };

    passbatch(batch, rotation)
});

app.use("/api/payload", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.json(payload);
});

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

app.get("/report/alarm", (req, res) => {
    res.sendFile(path.join(__dirname + "/report/alarm.html"));
});

app.get("/report/audit", (req, res) => {
    res.sendFile(path.join(__dirname + "/report/audit.html"));
});

app.get("/report/average/now", (req, res) => {
    res.send(report);
})

app.get("/checkuserlevel/:batch", (req, res) => {
    const b = req.params.batch


    _perm.queryRaw(`select "parameter", "operator" from "batchlist" WHERE "batch" = '${b}'`)
        .then(data => {
            var response = data.results[0].series[0].values[0];
            report.userlevel = response[1]
            report.username = response[2]
            // console.log(response[1])
        })
        .catch(console.error);
    res.json(report);
})



app.get("/report/average/generate", (req, res) => {
    (async () => {
        // const browser = await puppeteer.launch({ product: 'chrome', executablePath: '/usr/local/bin/chromium' }); // For MAC
        const browser = await puppeteer.launch({ product: 'chrome', executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const page = await browser.newPage();
        await page.goto(`http://${host}:5000/report/template`, { waitUntil: 'networkidle0' });
        await page.pdf({
            path: `batch_${report.batch}_from_${report.from}_to_${report.to}.pdf`, format: 'A4', landscape: true,
            displayHeaderFooter: true,
            headerTemplate: ``,
            footerTemplate: `
            <div style="width: 100%; font-size: 12px;
                padding: 5px 5px 0;">
                <p style="text-align:left; padding-right: 100px; padding-left: 30px;">
                    Prepared By:
                    <span style="float:right;">
                        Checked By:
                    </span>
                </p>
                <div style="text-align: center; center: 5px; top: 5px;">Page: <span class="pageNumber"></span> of <span class="totalPages"></span></div>
            </div>
            `,
            // this is needed to prevent content from being placed over the footer
            margin: { bottom: '80px', top: '20px' },
        });
        await browser.close();
    })();

    return res.json({ message: 'EXPORTED' });
})

app.get("/report/alarm/generate", (req, res) => {
    (async () => {
        // const browser = await puppeteer.launch({ product: 'chrome', executablePath: '/usr/local/bin/chromium' }); // For MAC
        const browser = await puppeteer.launch({ product: 'chrome', executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(`http://${host}:5000/report/alarm`, { waitUntil: 'networkidle0' });
        await page.pdf({
            path: `batch_${report.batch}_alarm.pdf`, format: 'A4', landscape: true,
            displayHeaderFooter: true,
            headerTemplate: ``,
            footerTemplate: `
            <div style="width: 100%; font-size: 12px;
                padding: 5px 5px 0;">
                <p style="text-align:left; padding-right: 100px; padding-left: 30px;">
                    Prepared By:
                    <span style="float:right;">
                        Checked By:
                    </span>
                </p>
                <div style="text-align: center; center: 5px; top: 5px;">Page: <span class="pageNumber"></span> of <span class="totalPages"></span></div>
            </div>
            `,
            // this is needed to prevent content from being placed over the footer
            margin: { bottom: '80px', top: '20px' },
        });
        await browser.close();
    })();

    return res.json({ message: 'EXPORTED' });
})

app.get("/report/audit/generate", (req, res) => {
    (async () => {
        // const browser = await puppeteer.launch({ product: 'chrome', executablePath: '/usr/local/bin/chromium' }); // For MAC
        const browser = await puppeteer.launch({ product: 'chrome', executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(`http://${host}:5000/report/audit`, { waitUntil: 'networkidle0' });
        await page.pdf({
            path: `batch_${report.batch}_audit.pdf`, format: 'A4', landscape: true,
            displayHeaderFooter: true,
            headerTemplate: ``,
            footerTemplate: `
            <div style="width: 100%; font-size: 12px;
                padding: 5px 5px 0;">
                <p style="text-align:left; padding-right: 100px; padding-left: 30px;">
                    Prepared By:
                    <span style="float:right;">
                        Checked By:
                    </span>
                </p>
                <div style="text-align: center; center: 5px; top: 5px;">Page: <span class="pageNumber"></span> of <span class="totalPages"></span></div>
            </div>
            `,
            // this is needed to prevent content from being placed over the footer
            margin: { bottom: '80px', top: '20px' },
        });
        await browser.close();
    })();

    return res.json({ message: 'EXPORTED AUDIT' });
})

app.get("/report/audit/download", (req, res) => {
    var file = path.join(__dirname, `batch_${report.batch}_audit.pdf`);
    res.download(file, function (err) {
        if (err) {
            console.log("Error");
            console.log(err);
        } else {
            console.log("Success");
        }
    });
})

app.get("/report/alarm/download", (req, res) => {
    var file = path.join(__dirname, `batch_${report.batch}_alarm.pdf`);
    res.download(file, function (err) {
        if (err) {
            console.log("Error");
            console.log(err);
        } else {
            console.log("Success");
        }
    });
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