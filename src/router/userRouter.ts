import express from "express";
import { authToken } from "../middleware/token";
import { createUser, loginUser, deleteUser } from "../handlers/userHandle";

const userRouter = express.Router();
// NOT REQUIRE TOKEN
userRouter.post("/new", createUser);
userRouter.post("/login", loginUser);
// REQUIRE TOKEN
userRouter.use(authToken);
userRouter.post("/delete", deleteUser);
export default userRouter;
