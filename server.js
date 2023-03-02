const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/route");
const { PORT, DBURL } = require("./config/index");
const { Router } = require("express");
const cors = require("cors");
mongoose.set("strictQuery", false);

mongoose.connect(DBURL);
const database = mongoose.connection;
database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use("/user", routes);

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
