const express = require("express");
const app = express();

var payload = {
    'connection': false,
    'pstatus': [],
    'pLHS_data': [],
    'pRHS_data': [],
    'mLHS_data': [],
    'mRHS_data': [],
    'eLHS_data': [],
    'eRHS_data': [],
    'avg': []
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

var arr = [2, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 21, 22, 24, 27, 30, 31, 32, 34, 35, 37, 40, 41, 42, 47, 48, 50, 51, 52, 53, 55, 56, 57, 60, 61, 63, 66, 67, 69, 70, 72, 73, 76];
var avg = [50, 80, 90, 24, 56, 76]
var status = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
shuffle(arr);

payload.connection = true



payload.pLHS_data = shuffle(arr);
payload.pRHS_data = shuffle(arr);
payload.mLHS_data = shuffle(arr);
payload.mRHS_data = shuffle(arr);
payload.eLHS_data = shuffle(arr);
payload.eRHS_data = shuffle(arr);
payload.avg = shuffle(avg);
payload.pstatus = shuffle(status);

app.use("/api/machine/raw", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json(payload);
});


// Start Server
const port = 7000;
app.listen(port, () => console.log(`Server running on port ${port} 👑`));