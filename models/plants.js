const mongoose = require("mongoose");
const PlantsSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Plants", PlantsSchema);
