import http from "node:http";
import { RequestHandler, response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Types, SchemaTypes } from "mongoose";
import {
  Evento,
  EventoInterface,
  User,
  UserInterface,
} from "../schemas/schemaIndex";
import { success, fail, error, unauthorized } from "./base";

export const getEvents: RequestHandler = async (req, res) => {
  console.log("getEvents");
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
  console.log("modifyEvent");
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
