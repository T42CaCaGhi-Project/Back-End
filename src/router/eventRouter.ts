import express from "express";
import { authToken } from "../middleware/token";
import {
  createEvent,
  modifyEvent,
  deleteEvent,
  getEvents,
  getEvent,
  searchByTag,
  periodEvento,
  imageTest,
} from "../handlers/eventHandle";
import { upload } from "../middleware/images";

const eventRouter = express.Router();
eventRouter.get("/all", getEvents);
eventRouter.get("/", getEvent);
eventRouter.get("/tag", searchByTag);
eventRouter.get("/period", periodEvento);
eventRouter.post("/imageTest", upload.single("eventImage"), imageTest);
// REQUIRE TOKEN
eventRouter.use(authToken);
eventRouter.post("/new", createEvent);
eventRouter.post("/modify", modifyEvent);
eventRouter.delete("/delete", deleteEvent);
export default eventRouter;
