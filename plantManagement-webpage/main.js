const express = require("express");

const mongoose = require("mongoose");
const config = require("./config");
const mqtt = require("mqtt");
const Sensors = require("./models/sensors");

function plant(name, tmp, hum, soilHum) {}
function plant(filelist) {
  var list = "<ul>";
  var i = 0;
  while (i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }
  list = list + "</ul>";
  return list;
}

mongoose.connect(
  config.MONGODB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to DB!");
    const client = mqtt.connect(config.MQTT_URL); // 라즈베리파이 url
    client.on("connect", () => {
      console.log("mqtt connect");
      client.subscribe("value");
    });
    client.on("message", (topic, msg) => {
      try {
        msg = msg.toString();
        if (msg.includes("nan")) {
          console.log("Sensor value is nan. ignoring...");
          return;
        }
        console.log(msg);
        let obj = JSON.parse(msg);
        let sensors = new Sensors(obj);
        sensors.save().catch((e) => console.error(e));
      } catch (e) {
        console.error(e);
      }
    });
  }
);

const app = express();
app.use("/public", express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.get("/test", (req, res) => {
//   res.send(`<form method="POST" action="/test"><input type="text" name="asdf" /><input type="submit" value="제출" /></form>`)
// })
// app.post("/test", (req, res) => {
//   // console.log(req.body);
//   // res.send("test");
//   res.send(req.body.asdf)
// })
app.get("/", (req, res) => {
  res.render("first");
});

const dict = {};
app.post("/save", (req, res) => {
  let { name, temp, humi, soil } = req.body;
  temp = Number.parseFloat(temp);
  humi = Number.parseFloat(humi);
  soil = Number.parseFloat(soil);
  
  dict[name] = {
    temp,
    humi,
    soil,
  };
  res.redirect("/");
});

app.get("/second", (req, res) => {
  res.render("second", {
    dict: dict,
    keys: Object.keys(dict),
  });
});
app.get("/third", (req, res) => {
  let { name } = req.query;
  let setting = dict[name];

  Sensors.findOne({}, null, { sort: { created_at: -1 } }, (err, result) => {
    if (err) {
      throw err;
    }
    console.log({
      setting,
      now: {
        temp: result.temp,
        humi: result.hum,
        soil: result.soilHum,
      },
    });
    res.render("third", {
      name,
      setting,
      now: {
        temp: result.temp,
        humi: result.hum,
        soil: result.soilHum,
      },
      arrow: (now, fixed, num = 5) => {
        console.log({now, fixed}, now > fixed + num, now < fixed - num);
        if (now > fixed + num) {
          return "↑";
        } else if (now < fixed - num) {
          return "↓";
        } else {
          return "";
        }
      },
    });
  });
});
app.get("/fourh", (req, res) => {
  res.render("fourth");
});
app.get("/delete", (req, res) => {
  let { name } = req.query;
  delete dict[name];
  res.redirect("/second");
});
app.listen(8080, () => console.log("listening!"));