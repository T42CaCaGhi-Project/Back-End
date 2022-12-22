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
  preferito,
} from "../handlers/eventHandle";
import { upload } from "../middleware/images";

const eventRouter = express.Router();
eventRouter.get("/all", getEvents);
eventRouter.post("/", getEvent);
eventRouter.post("/tag", searchByTag);
eventRouter.post("/period", periodEvento);
//eventRouter.post("/imageTest", upload.single("eventImage"), imageTest);
// REQUIRE TOKEN
eventRouter.use(authToken);
eventRouter.post("/new", createEvent);
eventRouter.post("/modify", modifyEvent);
eventRouter.post("/delete", deleteEvent);
eventRouter.post("/preferito", preferito);
export default eventRouter;
