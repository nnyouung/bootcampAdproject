const mongoose = require("mongoose");
const SensorsSchema = mongoose.Schema({
  temp: {
    type: Number,
    require: true
  },
  hum: {
    type: Number,
    require: true,
  },
  soilHum: {
    type: Number,
    require: true
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Sensors", SensorsSchema);
