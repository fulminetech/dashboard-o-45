const Gpio = require('onoff').Gpio;
const proxy = new Gpio(2, 'in', 'falling', { debounceTimeout: 10 });

console.log("Testing proxy")

var data_number = 0

proxy.watch((err, value) => {
    if (err) {
        throw err;
    }
    data_number++;
    console.log(`Data: ${data_number}`)
    
});