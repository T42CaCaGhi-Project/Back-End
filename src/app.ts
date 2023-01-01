import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerDocs } from "./swaggerSetup";

export const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(express.json());
import mainRouter from "./router/mainRouter";
app.use("/api", mainRouter);
