const express = require('express');
const app = express();
var path = require('path');


var dir = "/Users/marutimuthu/Documents/Fulmine_Tech/Projects/dashboard/dashboard-o-45/public/process-controls"

// Serve NPM modules
var node_modules = "/Users/marutimuthu/Documents/Fulmine_Tech/Projects/dashboard/dashboard-o-45/node_modules"

app.use('/charts', express.static(node_modules + '/chart.js/dist/'));
app.use('/charts/plugin', express.static(node_modules + '/chartjs-plugin-zoom/'));
app.use('/plugin', express.static(node_modules + '/hammerjs/'));
app.use('/css', express.static(node_modules + '/tailwindcss/dist/'));
app.use('/font', express.static(node_modules + '/@fortawesome/fontawesome-free/'));
// app.use('/favicon_io', express.static(__dirname + '/favicon_io/'));
app.use('/env', express.static(__dirname + '/html/'));

app.get("/:page", (req, res) => {
    const page = req.params.page;

    if(page === "pid")
        res.sendFile(path.join(dir + "/pid.html"));
    
    if(page === "vfd")
        res.sendFile(path.join(dir + "/vfd.html"));
    
});

// Start Server
const port = 9000;
app.listen(port, () => console.log(`Server running on port ${port} 🔥`));