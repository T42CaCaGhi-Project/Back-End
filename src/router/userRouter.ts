import express from "express";
import { authToken } from "../middleware/token";
import {
  getUsers,
  getUser,
  createUser,
  loginUser,
  deleteUser,
} from "../handlers/userHandle";

const userRouter = express.Router();
// NOT REQUIRE TOKEN
userRouter.post("/new", createUser);
userRouter.post("/login", loginUser);
// REQUIRE TOKEN
userRouter.use(authToken);
userRouter.delete("/delete", deleteUser);
userRouter.get("/all", getUsers);
userRouter.get("/", getUser);
export default userRouter;
