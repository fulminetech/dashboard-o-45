const express = require('express');
const app = express();
var path = require('path');

const host = "localhost"

// Influx Imports
const Influx = require('influxdb-nodejs');
const { query } = require("express");
const client = new Influx(`http://${host}:8086/new`);

// Serve NPM modules
app.use('/charts', express.static(__dirname + '/node_modules/chart.js/dist/'));
app.use('/charts/plugin', express.static(__dirname + '/node_modules/chartjs-plugin-zoom/'));
app.use('/plugin', express.static(__dirname + '/node_modules/hammerjs/'));
app.use('/css', express.static(__dirname + '/node_modules/tailwindcss/dist/'));
app.use('/font', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/'));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/html/index.html"));
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


// Start Server
const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port} 🔥`));