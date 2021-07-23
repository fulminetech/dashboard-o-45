var CronJob = require('cron').CronJob;
const { exec } = require('child_process');
const restart1Command = "./cleardata.sh"

var job = new CronJob('40 12 * * *', function () {

    console.log('You will see this message every day at 12pm');
    exec(restart1Command, (err, stdout, stderr) => {
        console.log(`${stdout}`);
    });

}, null, true, 'Asia/Kolkata');
job.start();
