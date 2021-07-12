const express = require("express");
const sequelize = require('./database')
var cors = require('cors')
const User = require('./Users')
const Permissions = require('./Permissions')
const Recipies = require('./Recipies')
var CronJob = require('cron').CronJob;
// var job = new CronJob('40 11 * * *', function () {
var job = new CronJob('0 12 * * *', function () {

  reduceexpiry()
  console.log('You will see this message every day at 12pm');
}, null, true, 'Asia/Kolkata');
job.start();

// sequelize.sync({force:true}).then(()=> console.log('db ready')) // To clear DB and enforce schema
sequelize.sync().then(()=> console.log('db ready'))
const app = express();

app.use(express.json())
app.use(cors({ origin: "*" }));

function isEmpty(obj) {
  for (let key in obj) {
    return false;
  }
  return true;
}

async function reduceexpiry() {
  const users = await User.findAll();
  const userno = users.length
  // console.log(userno)

  var usersjson = JSON.stringify(users)
  var usersjson1 = JSON.parse(usersjson)

  for (let i = 0; i < userno; i++) {
    // console.log(usersjson1[i])
    const requestedid = usersjson1[i].id
    console.log(requestedid)
    // console.log(usersjson1[i].expiry)
    if (usersjson1[i].expiry > 0) {
      console.log(usersjson1[i].expiry)
      const userz = await User.findOne({ where: { id: requestedid } });
      userz.expiry = parseInt(usersjson1[i].expiry - 1)
      await userz.save()
    }
  }
}

var currentuserid

var recipe_name = ''

app.get("/api/searchedrecipe_name/:param", (req, res) => {
  recipe_name = req.params.param
});

app.get("/recipie_single", async (req, res) => {
  const result = await Recipies.findAll({
    where: {
      recn: recipe_name
    }
  });
  // console.log(User.classLevelMethod())
  // console.log(result)

  res.json(result);
});

app.get("/currentuserid", async (req, res) => {
  res.send(currentuserid);
})

app.post("/currentuserid/:id", async (req, res) => {
  currentuserid = req.params.id;
  return res.json({ message: 'Ok' });
})

app.post("/users", async (req, res) => {
  await User.create(req.body);
  res.send('user is created');
}) 

app.get("/users", async (req, res) => {
  const users = await User.findAll();
  res.json(users);
}) 

app.get("/users/:id", async (req, res) => {
  const requestedid = req.params.id;
  const users = await User.findOne({ where: { id: requestedid}});
  res.send(users);
}) 

app.get("/username/:id", async (req, res) => {
  const requestedid = req.params.id;
  const result = await User.findAll({
    where: {
      username: requestedid
    }
  });
  // console.log(User.classLevelMethod())
  // console.log(result)
  
  res.json(result);
})

app.get("/userlevel/:id", async (req, res) => {
  const requestedid = req.params.id;
  const result = await User.findAll({
    where: {
      userlevel: requestedid
    }
  });
  // console.log(User.classLevelMethod())
  // console.log(result)
  res.send(result);
})

var result

app.put("/users/:id", async (req, res) => {
  const requestedid = req.params.id;
  const users = await User.findOne({ where: { id: requestedid } });
  users.username = req.body.username
  users.userlevel = req.body.userlevel
  users.name = req.body.name
  users.password = req.body.password
  users.expiry = req.body.expiry
  users.attempts = req.body.attempts
  await users.save()
  res.send(users);
})

// {
//   "username": "maru2ti12",
//   "userlevel": "23",
//   "name": "Maruti2 Muthu",
//   "password": "pas2s123",
//   "attempts": "102",
//   "expiry": "32"
// }

app.delete("/users/:id", async (req, res) => {
  const requestedid = req.params.id;
  await User.destroy({ where: { id: requestedid } });
  res.send("removed");
})

app.post("/permissions", async (req, res) => {
  await Permissions.create(req.body);
  res.send('user is created');
})

app.get("/permissions/:id", async (req, res) => {
  const requestedid = req.params.id;
  const users = await Permissions.findAll();

  res.json(users[requestedid]);
})

app.get("/permissions", async (req, res) => {
  const users = await Permissions.findAll();
  res.send(users);
})


app.put("/permissions/:id", async (req, res) => {
  const requestedid = req.params.id;
  const permissions = await Permissions.findOne({ where: { id: requestedid } });
  permissions.dashboard = req.body.dashboard
  permissions.overview = req.body.overview
  permissions.graphlhs = req.body.graphlhs
  permissions.graphrhs = req.body.graphrhs
  permissions.history = req.body.history
  permissions.dido = req.body.dido
  permissions.alarm = req.body.alarm
  permissions.reports = req.body.reports
  permissions.settings = req.body.settings
  permissions.maintainence = req.body.maintainence
  // permissions.usersettings = req.body.usersettings
  permissions.recipiesettings = req.body.recipiesettings
  await permissions.save()
  res.json(permissions);
})

// {
//   "dashboard": "true",
//   "overview": "false",
//   "graphlhs": "true",
//   "graphrhs": "true",
//   "history": "true",
//   "dido": "true",
//   "alarm": "true",
//   "reports": "true",
//   "settings": "true",
//   "maintainence": "true",
//   "usersettings": "true",
//   "recipiesettings": "true"
// }

app.get("/recipies", async (req, res) => {
  const recipies = await Recipies.findAll();
  res.send(recipies);
})

app.post("/recipies", async (req, res) => {
  await Recipies.create(req.body);
  res.send('recipie is created');
})

app.get("/recipies/:id", async (req, res) => {
  const requestedid = req.params.id;
  const recipies = await Recipies.findOne({ where: { id: requestedid } });

  res.json(recipies);
})

app.get("/recipiename/:id", async (req, res) => {
  const requestedid = req.params.id;
  const result = await Recipies.findAll({
    where: {
      recn: requestedid
    }
  });
  // console.log(User.classLevelMethod())
  // console.log(result)

  res.json(result);
})

app.put("/recipies/:id", async (req, res) => {
  const requestedid = req.params.id;
  const recipies = await Recipies.findOne({ where: { id: requestedid } });
  recipies.recn =       req.body.recn
  recipies.pname =      req.body.pname
  recipies.tooldrg    = req.body.tooldrg
  recipies.size =       req.body.size
  recipies.thickness   = req.body.thickness
  recipies.weight =     req.body.weight
  recipies.hardness   = req.body.hardness
  recipies.depthL =     req.body.depthL
  recipies.depthR =     req.body.depthR
  recipies.forceL =     req.body.forceL
  recipies.forceR =     req.body.forceR
  recipies.preL =       req.body.preL
  recipies.preR =       req.body.preR
  recipies.mainL =      req.body.mainL
  recipies.mainR =      req.body.mainR
  await recipies.save()
  res.json(recipies);
})

// {
//   "recn":      "",
//   "pname":     "",
//   "tooldrg":   "",
//   "size":      "",
//   "thickness": "",
//   "weight":    "",
//   "hardness":  "",
//   "depthL":    "",
//   "depthR":    "",
//   "forceL":    "",
//   "forceR":    "",
//   "preL":      ""
//   "preR":      ""
//   "mainL":     ""
//   "mainR":     ""
// }


app.delete("/recipies/:id", async (req, res) => {
  const requestedid = req.params.id;
  await Recipies.destroy({ where: { id: requestedid } });
  res.send("removed");
})


app.listen(3000, async () => {
  console.log("app is running");
});