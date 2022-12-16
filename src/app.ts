import express from "express";
import db from "./db";
//sotto era tutta roba usata per hhtps
import https from "node:https";
import fs from "node:fs";
import path from "node:path";

db.connect();

const app = express();
const port = process.env.PORT || "3000";
app.use(express.json());

import mainRouter from "./router/mainRouter";
app.use("/api", mainRouter);

app.listen(port, () => {
  console.log(`app listening at port: ${port}`);
});
