const express = require('express');
const app = express();
var path = require('path');

const host = "localhost"

// Influx Imports
const Influx = require('influxdb-nodejs');
const { query } = require("express");
const client = new Influx(`http://${host}:8086/new`);

const {
    payload, startmodbus
} = require('./data.js')


// Serve NPM modules
app.use('/charts', express.static(__dirname + '/node_modules/chart.js/dist/'));
app.use('/charts/plugin', express.static(__dirname + '/node_modules/chartjs-plugin-zoom/'));
app.use('/plugin', express.static(__dirname + '/node_modules/hammerjs/'));
app.use('/css', express.static(__dirname + '/node_modules/tailwindcss/dist/'));
app.use('/font', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/'));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/html/index.html"));
});

app.get("/onboard", (req, res) => {
    res.sendFile(path.join(__dirname + "/html/onboard.html"));
});

app.get("/history", (req, res) => {
    res.sendFile(path.join(__dirname + "/html/history.html"));
});

app.get("/analytics", (req, res) => {
    res.sendFile(path.join(__dirname + "/html/analytics.html"));
});

app.get("/audit", (req, res) => {
    res.sendFile(path.join(__dirname + "/html/audit.html"));
});

app.get("/settings", (req, res) => {
    res.sendFile(path.join(__dirname + "/html/settings.html"));
});

app.get("/onboard/:namee/:machinee/:recepiee/:batchh", (req, res) => {
    const a = req.params.namee;
    const b = req.params.machinee;
    const c = req.params.recepiee;
    const d = req.params.batchh;

    payload.machine.operator_name = a;
    payload.machine.machine_id = b;
    payload.stats.recipie_id = c;
    payload.stats.batch = d;

    client.queryRaw(`select "rotation" from "${d}.history" ORDER BY time DESC LIMIT 1`)
        .then(data => {
            var response = data.results[0].series[0].values[0];
            var previousrtn = parseInt(response[1]);
            console.log(previousrtn)
            if (previousrtn > 1) {
                payload.rotation_no = previousrtn;
            }
        })
        .catch(console.error);

    // watchproxy();
    startmodbus();
    return res.json({ message: `[ ONBOARDED BATCH: ${d} ]` });
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
    client.showMeasurements()
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

// --++ Returns Average Data ++--
var avg = {
    totalrotations: 0,
    data: {}
}

var report = {
    batch: 0,
    from: 0,
    to: 0,
}

app.get("/api/search/average/:batch", (req, res) => {
    // select * from "payload" where "rotation" = 7
    const r = req.params.batch

    async function passbatch(r) {
        client.queryRaw(`select "rotation", "preLHSavg", "mainLHSavg", "ejnLHSavg", "preRHSavg", "mainRHSavg", "ejnRHSavg" from "${r}.average"`)
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


app.get("/api/search/average/csv/:batch", (req, res) => {
    // select * from "payload" where "rotation" = 7
    const r = req.params.batch

    async function passbatch(r) {
        client.queryRaw(`select "rotation", "preLHSavg", "mainLHSavg", "ejnLHSavg", "preRHSavg", "mainRHSavg", "ejnRHSavg" from "${r}.average"`)
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

app.get("/api/search/rotation/:rotationn", (req, res) => {
    // select * from "payload" where "rotation" = 7
    const r = parseInt(req.params.rotationn)

    passbatch(r)

    async function passbatch(r) {
        client.query(`${payload.batch}.history`)
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

// Start Server
const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port} 🔥`));