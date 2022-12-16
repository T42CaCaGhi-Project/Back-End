import { Request } from "express";
import multer, {
  diskStorage,
  FileFilterCallback,
  Multer,
  Options,
  StorageEngine,
} from "multer";

const storage: StorageEngine = diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, "uploads/");
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const validFormats: string[] = ["image/jpeg", "image/png"];

const filter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (validFormats.includes(file.mimetype)) cb(null, true);
  else {
    cb(null, false);
  }
};

const options: Options = {
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 16,
  },
  fileFilter: filter,
};

export const upload: Multer = multer(options);
