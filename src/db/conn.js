const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/Viapp_users_regInfo", {
    // useNewUrlParser:true,
    // useUnifiedTopology:true,
    // useCreateIndex:true
  })
  .then(() => {
    console.log(`connection done`);
  })
  .catch((e) => {
    console.log("connection error");
  });
