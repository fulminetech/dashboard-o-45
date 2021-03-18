const express = require('express');
const app = express();
var path = require('path');
var cors = require('cors')
const host = "localhost"

app.use(cors({ origin: "*" }));

// Serve NPM modules
app.use('/charts', express.static(__dirname + '/node_modules/chart.js/dist/'));
app.use('/charts/plugin', express.static(__dirname + '/node_modules/chartjs-plugin-zoom/'));
app.use('/plugin', express.static(__dirname + '/node_modules/hammerjs/'));
app.use('/css', express.static(__dirname + '/node_modules/tailwindcss/dist/'));
app.use('/font', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/'));
app.use('/env', express.static(__dirname + '/html_/'));
app.use('/favicon_io', express.static(__dirname + '/favicon_io/'));


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
    res.header('Access-Control-Allow-Origin', '*');
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

app.get("/settings_limit", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/settings_limit.html"));
});

app.get("/settings_setup", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/settings_setup.html"));
});

app.get("/settings_user", (req, res) => {
    res.sendFile(path.join(__dirname + "/html_/settings_user.html"));
});

// Start Server
const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port} 🔥`));