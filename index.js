// npm  start
require("dotenv").config();

const http         = require("http");
const express      = require("express");
const port         = process.env.PORT || 3000;
const createError  = require("http-errors");
const bodyParser   = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet       = require('helmet');
const mongoose     = require("mongoose");
const logger       = require("morgan");
const cors         = require("cors");

mongoose.Promise   = global.Promise;
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const app = express();
app.set("view engine", "html");
app.set("port", port);

// const allowedOrigins = ["http://localhost:4200", "https://poc-angular-app.azurewebsites.net", "https://tnmy1991.github.io/"];
// app.use(
//   cors({
//     origin: function(origin, callback) {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         let msg =
//           "The CORS policy for this site does not " +
//           "allow access from the specified Origin.";
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     }
//   })
// );
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());

const { auth }       = require("./middleware/auth");
const authRouter     = require("./routers/auth.router")(auth);
const vendorRouter   = require("./routers/vendors.router")(auth);
const workflowRouter = require("./routers/workflow.router")(auth);

app.use("/api/v1/users", authRouter);
app.use("/api/v1/vendors", vendorRouter);
app.use("/api/v1/workflow-logs", workflowRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: true, message: err.message});
});

const server = http.createServer(app);
server.listen(port);

module.exports = server;
