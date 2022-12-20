import express from "express";
import db from "./db";
import swaggerUi from "swagger-ui-express";
import { swaggerDocs } from "./swaggerSetup";

db.connect();

const app = express();
const port = process.env.PORT || "3000";

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());

import mainRouter from "./router/mainRouter";
app.use("/api", mainRouter);

app.listen(port, () => {
  console.log(`app listening at port: ${port}`);
});
