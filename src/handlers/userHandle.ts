import { RequestHandler } from "express";
import { User, UserInterface } from "../schemas/schemaIndex";
import bcrypt, { compare } from "bcrypt";
import { generateToken } from "../middleware/token";
import { success, fail, error, unauthorized } from "./base";
import { Jwt, JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

const hashing = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
  } catch (error) {
    console.log(error);
  }
};
/**
 * @swagger
 * /api/user/new:
 *   post:
 *     tags:
 *       - User
 *     summary: Create new User
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: name.surname@mail.com
 *               password:
 *                 type: string
 *                 example: mypassword
 *               isAdm:
 *                 type: boolean
 *                 example: false
 *               isOrg:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       '200':
 *          description: Successfully created new User
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
 *                    example: {}
 *       '400':
 *          description: Missing input data
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 *       '409':
 *          description: User already exists
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
export const createUser: RequestHandler = async (req, res) => {
  try {
    /* const body: {
      email: string;
      password: string;
      isAdm: boolean;
      isOrg: boolean;
    } = req.body; */
    const body: UserInterface = req.body;
    if (!body.email || !body.password) {
      return fail(res, "Dati Mancanti", 400);
    }
    const userFind: UserInterface = await User.findOne({
      email: body.email,
    }).exec();
    if (userFind != null) return fail(res, "User already exists", 409);
    const hashed = await hashing(body.password);
    const newUser = new User({
      email: body.email,
      password: hashed,
      isAdm: body.isAdm,
      isOrg: body.isOrg,
    });
    const createUser = await newUser.save();
    success(res, {}, 200);
  } catch (err) {
    error(res, err.message, 500);
  }
};
/**
 * @swagger
 * /api/user/login:
 *   post:
 *     tags:
 *       - User
 *     summary: User login
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: name.surname@mail.com
 *               password:
 *                 type: string
 *                 example: mypassword
 *     responses:
 *       '200':
 *          description: Successfully logged in User
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
 *                      token:
 *                        type: string
 *                        example: authToken
 *                      user:
 *                        type: object
 *                        properties:
 *                          email:
 *                            type: string
 *                            example: name.surname@mail.com
 *                          preferiti:
 *                            type: array
 *                            items:
 *                                type: string
 *                          isAdm:
 *                            type: boolean
 *                            example: false
 *                          isOrg:
 *                            type: boolean
 *                            example: false
 *                          alias:
 *                            type: string
 *                            example: alias
 *                          img:
 *                            type: string
 *                            example: BASE64_img
 *       '400':
 *          description: Login credentials not submitted
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 *       '401':
 *          description: incorrect password
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/errorRes'
 *       '404':
 *          description: User not found
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
export const loginUser: RequestHandler = async (req, res) => {
  const body: {
    email: string;
    password: string;
  } = req.body;
  if (!body.email || !body.password)
    return fail(res, "Login credentials not submitted", 400);
  try {
    const userFind: UserInterface = await User.findOne({
      email: body.email,
    }).exec();
    if (userFind != null) {
      if (await compare(body.password, userFind.password)) {
        const token = generateToken({
          _id: userFind._id,
          sub: userFind.email,
          isAdm: userFind.isAdm,
          isOrg: userFind.isOrg,
        });
        const userResData = {
          email: userFind.email,
          preferiti: userFind.preferiti,
          isAdm: userFind.isAdm,
          isOrg: userFind.isOrg,
          alias: userFind.alias,
          img: userFind.img,
        };
        success(res, { token, userResData }, 200);
      } else {
        fail(res, "incorrect password", 401);
      }
    } else {
      fail(res, "not found", 404);
    }
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const getUsers = async () => {
  console.log("getUsers");
};

//più che altro di debug ora
export const getUser: RequestHandler = async (req, res) => {
  const body: {
    email: String;
  } = req.body;
  const userFind: UserInterface = await User.findOne({
    email: body.email,
  }).exec();
  if (userFind == null) {
    return error(res, "user not found", 404);
  }
  try {
    success(res, userFind, 200);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const modifyUser: RequestHandler = async (req, res) => {
  const body: UserInterface = req.body;
  const auth: JwtPayload = req.body.auth;
  try {
    const searchUser: UserInterface = await User.findOne({
      _id: body._id,
    }).exec();
    if (searchUser == null) return error(res, "Not found", 404);
    if (searchUser._id != auth._id) return unauthorized(res);
    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        searchUser[key] = body[key];
      }
    }
    const modifiedEvento = new User(searchUser);
    const createEvento = await modifiedEvento.save();
    success(res, searchUser, 200);
  } catch (err) {
    error(res, err.message, 500);
  }
};
/**
 * @swagger
 * /api/user/delete:
 *   post:
 *     tags:
 *       - User
 *     summary: Delete User, requires JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: name.surname@mail.com
 *               password:
 *                 type: string
 *                 example: mypassword
 *     responses:
 *       '200':
 *          description: Successfully logged in User
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
 *          description: User not found
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
export const deleteUser: RequestHandler = async (req, res) => {
  const body: {
    email: string;
    password: string;
  } = req.body;
  const auth: JwtPayload = req.body.auth;
  const userFind: UserInterface = await User.findOne({
    email: body.email,
  }).exec();
  if (userFind == null) {
    return error(res, "user not found", 404);
  }
  try {
    if (auth.isAdm) {
      const deletedRes = await User.deleteOne({
        email: body.email,
      });
      success(res, deletedRes, 200);
    } else if (
      auth.sub == body.email &&
      (await compare(body.password, userFind.password))
    ) {
      const deletedRes = await User.deleteOne({
        email: body.email,
      });
      success(res, deletedRes, 200);
    } else {
      unauthorized(res);
    }
  } catch (err) {
    error(res, err.message, 500);
  }
};
