import { HttpError } from "./utils/HttpError";
import { unlink } from "fs";
import path from "path";
import express, { Express, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import PlaceRouter from "./routes/PlaceRoutes";
import TestRouter from "./routes/TestRouters";
import UserRouter from "./routes/UserRouters";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4455;

app.use(bodyParser.json());
app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/users", UserRouter);
app.use("/api/places", PlaceRouter);
app.use("/api/test", TestRouter);

app.use(async (req: Request, res: Response, next: NextFunction) => {
  return next(new HttpError("could not find this route", 404));
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    unlink(req.file.path, (err) => {
      console.log("file deleted");
    });
  }

  res.status(error.code || 500).json({
    message: error.message,
    statusCode: error.code,
  });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@atlascluster.yccwwdp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=AtlasCluster`
  )
  .then(() => {
    console.log("connected to db");
    app.listen(port);
  })
  .catch((err) => {
    console.log("error connecting to db" || err.message);
  });
