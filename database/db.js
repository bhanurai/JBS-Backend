const mongoose = require("mongoose");

const connectToDB = () => {
  mongoose.connect(process.env.DB_URL).then(() => {
    console.log("Connected to Database");
  });
};

module.exports = connectToDB;
