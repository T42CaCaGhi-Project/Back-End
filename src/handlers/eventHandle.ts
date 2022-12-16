import { RequestHandler, response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Types, SchemaTypes } from "mongoose";
import fs from "node:fs";
import path from "node:path";
import {
  Evento,
  EventoInterface,
  User,
  UserInterface,
} from "../schemas/schemaIndex";
import { success, fail, error, unauthorized } from "./base";

const uploadsFolder = __dirname + "/../../uploads";

export const getEvents: RequestHandler = async (req, res) => {
  const searchEvento: EventoInterface[] = await Evento.find({});
  if (searchEvento == null) return error(res, "Not found", 404);
  success(res, searchEvento, 200);
};

export const getEvent: RequestHandler = async (req, res) => {
  const body: {
    title: string;
  } = req.body;
  try {
    const searchEvento: EventoInterface = await Evento.findOne({
      title: body.title,
    })
      .populate("idOwner", "alias img")
      .exec();
    if (searchEvento == null) return error(res, "Not found", 404);
    success(res, searchEvento, 200);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const createEvent: RequestHandler = async (req, res) => {
  const body: EventoInterface = req.body;
  const auth: JwtPayload = req.body.auth;
  try {
    if (auth.isOrg) {
      const idOwner: UserInterface = await User.findOne({
        email: auth.sub,
      });
      const eventoFind: EventoInterface = await Evento.findOne({
        title: body.title,
      }).exec();
      if (eventoFind != null) return fail(res, "Event already exists", 409);
      //https://nominatim.openstreetmap.org/search?q=<data>&format=jsonv2
      const newEvento = new Evento({
        idOwner: idOwner._id,
        location: {
          name: body.location.name,
          city: body.location.city,
          street: body.location.street,
        },
        dateStart: body.dateStart,
        dateFinish: body.dateFinish,
        title: body.title,
        tags: body.tags,
        image: body.image,
        description: body.description,
      });
      const createEvento = await newEvento.save();
      success(res, {}, 200);
    } else {
      unauthorized(res);
    }
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const modifyEvent: RequestHandler = async (req, res) => {
  const body: EventoInterface = req.body;
  const auth: JwtPayload = req.body.auth;
  try {
    const searchEvento: EventoInterface = await Evento.findOne({
      _id: body._id,
    }).exec();
    if (searchEvento == null) return error(res, "Not found", 404);
    if (searchEvento.idOwner != auth._id) return unauthorized(res);
    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        searchEvento[key] = body[key];
      }
    }
    const modifiedEvento = new Evento(searchEvento);
    const createEvento = await modifiedEvento.save();
    success(res, searchEvento, 200);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const deleteEvent: RequestHandler = async (req, res) => {
  const body: {
    title: string;
  } = req.body;
  const auth: JwtPayload = req.body.auth;
  let owner: UserInterface;
  const eventoFind: EventoInterface = await Evento.findOne({
    title: body.title,
  })
    .populate("idOwner", "email")
    .exec();
  if (eventoFind == null) {
    return error(res, "Not found", 404);
  }
  try {
    if (auth.isAdm) {
      const deletedRes = await Evento.deleteOne({
        title: eventoFind.title,
      });
      success(res, deletedRes, 200);
    } else if (auth.isOrg && auth.sub == eventoFind.idOwner.email) {
      const deletedRes = await Evento.deleteOne({
        title: eventoFind.title,
      });
      success(res, deletedRes, 200);
    } else {
      unauthorized(res);
    }
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const searchByTag: RequestHandler = async (req, res) => {
  const body: {
    tags: string[];
  } = req.body;
  const eventoFind: EventoInterface[] = await Evento.find({
    tags: { $in: body.tags },
  });
  if (eventoFind[0] == null) {
    return error(res, "Not found", 404);
  }
  success(res, eventoFind, 200);
};

export const periodEvento: RequestHandler = async (req, res) => {
  const body: {
    date: string;
    span: string;
  } = req.body;
  const date = body.date;
  let ddate: number;
  try {
    const baseDate = new Date(date);
    switch (body.span) {
      case "day":
        ddate = baseDate.getTime() + 86400000;
        break;
      case "week":
        ddate = baseDate.getTime() + 604800000;
        break;
      case "month":
        ddate = baseDate.getTime() + 86400000 * 30;
        break;
      default:
        break;
    }
    const eventoFind: EventoInterface[] = await Evento.find()
      .or([
        { dateFinish: { $gte: date, $lte: ddate } },
        { dateStart: { $gte: date, $lte: ddate } },
      ])
      .sort({ dateStart: "asc" });
    if (eventoFind[0] == null) return error(res, "Not found", 404);
    success(res, eventoFind, 200);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const imageTest: RequestHandler = async (req, res) => {
  if (req.file != undefined) console.log(req.file);
  else console.log("Missing file");
  console.log(req.body);
  success(res, "ogey", 200);
};

//  const img = fs.readFileSync(path.join(uploadsFolder + req.file.filename));
