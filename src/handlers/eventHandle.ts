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

/**
 * @swagger
 * /api/event/all:
 *   get:
 *     tags:
 *       - Event
 *     summary: Get all Events
 *     security: []
 *     responses:
 *       '200':
 *          description: Found Events
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  data:
 *                    type: array
 *                    items:
 *                      $ref: '#/schemas/Event'
 *       '404':
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 *       '500':
 *          description: internal error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 */
export const getEvents: RequestHandler = async (req, res) => {
  try {
    const searchEvento: EventoInterface[] = await Evento.find({});
    if (searchEvento == null) return error(res, "Not found", 404);
    success(res, searchEvento, 200);
  } catch (err) {
    error(res, err.message, 500);
  }
};
/**
 * @swagger
 * /api/event/:
 *   post:
 *     tags:
 *       - Event
 *     summary: Get Event by title (will change to 'by _id')
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: eventTitle
 *     responses:
 *       '200':
 *          description: Found Event
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  data:
 *                    $ref: '#/components/schemas/Event'
 *       '404':
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 *       '500':
 *          description: internal error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 */
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
/**
 * @swagger
 * /api/event/new:
 *   post:
 *     tags:
 *       - Event
 *     summary: Create new Event
 *     description: properties _id and idOwner are not required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       '200':
 *          description: Found Events
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  data:
 *                    type: object
 *       '401':
 *          description: unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 *       '409':
 *          description: Already Exists
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 *       '500':
 *          description: internal error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 */
export const createEvent: RequestHandler = async (req, res) => {
  const body: EventoInterface = req.body;
  const auth: JwtPayload = req.body.auth;
  try {
    if (auth.isOrg) {
      const eventoFind: EventoInterface = await Evento.findOne({
        title: body.title,
        dateStart: body.dateStart,
      }).exec();
      if (eventoFind != null) return fail(res, "Event already exists", 409);
      const newEvento = new Evento({
        idOwner: auth._id,
        location: {
          name: body.location.name,
          city: body.location.city,
          street: body.location.street,
          lat: body.location.lat,
          lon: body.location.lon,
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
/**
 * @swagger
 * /api/event/modify:
 *   post:
 *     tags:
 *       - Event
 *     summary: Modify Event, must be owner or admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       '200':
 *          description: Modified
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  data:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/Event'
 *       '401':
 *          description: unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 *       '404':
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 *       '500':
 *          description: internal error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 */
export const modifyEvent: RequestHandler = async (req, res) => {
  const body: EventoInterface = req.body;
  const auth: JwtPayload = req.body.auth;
  try {
    const searchEvento: EventoInterface = await Evento.findOne({
      _id: body._id,
    }).exec();
    if (searchEvento == null) return error(res, "Not found", 404);
    if (searchEvento.idOwner != auth._id || !auth.isAdm)
      return unauthorized(res);
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
/**
 * @swagger
 * /api/event/delete:
 *   post:
 *     tags:
 *       - Event
 *     summary: Delete Event, must be owner or admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               _id:
 *                 type: string
 *                 example: eventId
 *     responses:
 *       '200':
 *          description: Deleted Event
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  data:
 *                    type: object
 *                    properties:
 *                      acknowledged:
 *                        type: boolean
 *                        example: true
 *                      deletedCount:
 *                        type: integer
 *                        example: 1
 *       '401':
 *          description: unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 *       '404':
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 *       '500':
 *          description: internal error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 */
export const deleteEvent: RequestHandler = async (req, res) => {
  const body: {
    _id: Types.ObjectId;
  } = req.body;
  const auth: JwtPayload = req.body.auth;
  let owner: UserInterface;
  const eventoFind: EventoInterface = await Evento.findOne({
    _id: body._id,
  }).exec();
  if (eventoFind == null) {
    return error(res, "Not found", 404);
  }
  try {
    if (auth.isAdm) {
      const deletedRes = await Evento.deleteOne({
        title: eventoFind.title,
      });
      success(res, deletedRes, 200);
    } else if (auth.isOrg && auth._id == eventoFind.idOwner) {
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
/**
 * @swagger
 * /api/event/tag:
 *   post:
 *     tags:
 *       - Event
 *     summary: Get Events by tag
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: tag
 *     responses:
 *       '200':
 *          description: Found Events
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  data:
 *                    type: array
 *                    items:
 *                      $ref: '#/schemas/Event'
 *       '404':
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 *       '500':
 *          description: internal error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 */
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
/**
 * @swagger
 * /api/event/period:
 *   post:
 *     tags:
 *       - Event
 *     summary: Get all Events taking place within day/week/month
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 example: 2022-12-19T00:00:00
 *               span:
 *                 type: string
 *                 exampe: day - week - month
 *     responses:
 *       '200':
 *          description: Found Events
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  data:
 *                    type: array
 *                    items:
 *                      $ref: '#/schemas/Event'
 *       '404':
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 *       '500':
 *          description: internal error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 */
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
