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
          sub: userFind.email,
          isAdm: userFind.isAdm,
          isOrg: userFind.isOrg,
        });
        success(res, token, 200);
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
