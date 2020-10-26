const express = require('express');
const app = express();
var path = require('path');

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/src/index.html"));
});

app.get("/history", (req, res) => {
    res.sendFile(path.join(__dirname + "/src/history.html"));
});

// Start Server
const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port} 🔥`));