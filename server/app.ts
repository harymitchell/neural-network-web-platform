import { json, urlencoded } from "body-parser";
import * as compression from "compression";
import * as express from "express";
import * as session from "express-session";
import * as path from "path";
import * as request from "request";

import { MONGODB_URI, MONGOLAB_URI, SESSION_SECRET} from "./config";
import { feedRouter } from "./routes/feed";
import { loginRouter } from "./routes/login";
import { protectedRouter } from "./routes/protected";
import { publicRouter } from "./routes/public";
import { userRouter } from "./routes/user";

import { datasetRouter } from "./routes/dataset";
import { modelRouter } from "./routes/model";
import { evaluationRouter } from "./routes/evaluation";

import * as mongo from "connect-mongo";
import * as mongoose from "mongoose";

import {  default as Admin } from "./models/Admin";
import { Dataset } from "./models/Dataset";

const MongoStore = mongo(session);

const app: express.Application = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI || MONGOLAB_URI);

mongoose.connection.on("error", () => {
  console.log("MongoDB connection error. Please make sure MongoDB is running.");
  process.exit();
});
let workerNodes;
mongoose.connection.once('open', function() {
  Admin
    .findOne()
    .exec((err, admin) => {
      console.log("admin",admin,err);
      if (admin) workerNodes = admin.workerNodes;
    });

    // setup gridFS
    const Grid = require('gridfs-stream');
    const GridFS = Grid(mongoose.connection.db, mongoose.mongo);
    mongoose.GridFS = GridFS;
});

/**
 * Inject session into Request type.
 */
export interface Request extends express.Request {
  session: [any];
}

app.use((req, res, next) => {
  if (workerNodes){
    workerNodes.forEach(element => {
      request(element, function (error, response, body) {
        if (error) console.log('error:', error);
        console.log(body);
      });
    });
  }
  next();
});

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: new MongoStore({
    url: MONGODB_URI || MONGOLAB_URI,
    autoReconnect: true
  })
}));

app.disable("x-powered-by");

app.use(json({limit: '50mb'}));
app.use(compression());
app.use(urlencoded({ extended: true, limit: '50mb' }));

// api routes
app.use("/api/secure", protectedRouter);
app.use("/api/login", loginRouter);
app.use("/api/public", publicRouter);
app.use("/api/feed", feedRouter);
app.use("/api/user", userRouter);
app.use("/api/dataset", datasetRouter);
app.use("/api/model", modelRouter);
app.use("/api/evaluation", evaluationRouter);

if (app.get("env") === "production") {

  // in production mode run application from dist folder
  app.use(express.static(path.join(__dirname, "/../client")));
}

// catch 404 and forward to error handler
app.use((req: express.Request, res: express.Response, next) => {
  const err = new Error("Not Found");
  next(err);
});

// production error handler
// no stacktrace leaked to user
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {

  res.status(err.status || 500);
  res.json({
    error: {},
    message: err.message,
  });
});

export { app };
