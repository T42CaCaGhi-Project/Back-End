import express from "express";
import userRouter from "./userRouter";
import eventRouter from "./eventRouter";

const mainRouter = express.Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/event", eventRouter);

export default mainRouter;
