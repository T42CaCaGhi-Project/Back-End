import express from "express";
import { authToken } from "../middleware/token";
import {
  createEvent,
  modifyEvent,
  deleteEvent,
  getEvents,
  getEvent,
  searchByTag,
} from "../handlers/eventHandle";

const eventRouter = express.Router();
eventRouter.get("/all", getEvents);
eventRouter.get("/", getEvent);
eventRouter.get("/tag", searchByTag);
// REQUIRE TOKEN
eventRouter.use(authToken);
eventRouter.post("/new", createEvent);
eventRouter.post("/modify", modifyEvent);
eventRouter.delete("/delete", deleteEvent);
export default eventRouter;
