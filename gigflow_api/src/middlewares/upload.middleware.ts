import fs from "fs";
import path from "path";
import multer from "multer";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";

const uploadDir = path.join(process.cwd(), "uploads", "profiles");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname);
    const safeBase = path
      .basename(file.originalname, extension)
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();
    callback(null, `${Date.now()}-${safeBase}${extension}`);
  },
});

export const uploadProfileImage = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(
        new HttpError(400, "Only image files are allowed", {
          code: ErrorCodes.BAD_REQUEST,
        }),
      );
    }

    callback(null, true);
  },
});
