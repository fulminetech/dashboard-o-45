var ModbusRTU = require("modbus-serial");
const express = require("express");
const { exec } = require('child_process');
const restart1Command = "pm2 restart prod-modbus"

const app = express();

var payload = {
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
    control: {

    }
};

// Modbus TCP configs
var client = new ModbusRTU();
const slaveID = 1;
const ip = "10.0.0.103"

var mbsTimeout = 5000;
var mbsScan = 50;

// Modbus Addresses
const status_address = 2589;
// const stats_address = 8096 + 17;
const stats_address = 8113;


setInterval(() => {
    // run()
}, 1000);

// Make connection
// set requests parameters
client.setID(slaveID);
client.setTimeout(mbsTimeout);

// try to connect
client.connectTCP(ip)
    .then(function () {
        console.log(`[ CONNECTED ]`)
    })
    .catch(function (e) {
        console.log(`[ FAILED TO CONNECT ]`)
        console.log(e);
    });

function run() {
    
    readstats()
    writestats()
    
    
}

var readstats = function () {
    client.readHoldingRegisters(8140, 2)
        .then(function (stats_data) {
            console.log("STATS: ", stats_address ,stats_data)
        })
        .catch(function (e) {
            console.error('[ #7 Stats Garbage ]')
        })
}

var data = 4000
var data1 = 5000

var writestats = function () {
    // write 3 registers statrting at register 101
    // negative values (< 0) have to add 65535 for Modbus registers
    // client.writeRegisters(stats_address, [7800])
    
    client.writeRegisters(8140, [data,data1])
        .then(function (d) {
            data++
            data1++
            console.log(d);
        })
        .catch(function (e) {
            console.log(e.message);
        })
}

var writecoil = function () {
    // write to coil
    client.writeCoil(status_address + 32, true)
        .then(function (d) {
            console.log("Write true to coil 5", d);
        })
        .catch(function (e) {
            console.log(e.message);
        })
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

var neww = randomIntFromInterval(10, 15);

setInterval(() => {
    neww = randomIntFromInterval(10, 15);
    console.log(neww)
}, 1000);