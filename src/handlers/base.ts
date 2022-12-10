import { Response } from "express";

export function success(res: Response, data: any, code) {
  res.status(code).json({
    status: "success",
    data,
  });
}

export function fail(res: Response, message: string, code: number) {
  res.status(code).json({
    status: "fail",
    message,
  });
}

export function error(res: Response, message: string, code: number) {
  res.status(code).json({
    status: "error",
    message,
  });
}

export function unauthorized(res: Response) {
  fail(res, "Unauthorized", 401);
}
