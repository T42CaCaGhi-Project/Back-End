import {
  JsonWebTokenError,
  Jwt,
  JwtHeader,
  JwtPayload,
  sign,
  SignOptions,
  verify,
} from "jsonwebtoken";
import { error } from "../handlers/base";

export const generateToken = (data: JwtPayload): string => {
  const payload: JwtPayload = {
    isAdm: data.isAdm | 0,
    isOrg: data.isOrg | 0,
    sub: data.sub,
  };
  const option: SignOptions = {
    algorithm: "HS256",
  };

  return sign(payload, process.env.ACCESS_TOKEN_SECRET, option);
};

export const authToken = (req, res, next) => {
  const authHeader: string = req.headers["authorization"];
  const token: string = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    error(res, "no token provided", 401);
  } else {
    verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data: JwtPayload) => {
      if (err) {
        error(res, err.message, 401);
      } else {
        req.body.auth = data;
      }
    });
  }
  next();
};
