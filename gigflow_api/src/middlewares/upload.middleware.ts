import fs from "fs";
import path from "path";
import multer from "multer";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";

const profileUploadDir = path.join(process.cwd(), "uploads", "profiles");
const cvUploadDir = path.join(process.cwd(), "uploads", "cvs");

fs.mkdirSync(profileUploadDir, { recursive: true });
fs.mkdirSync(cvUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, file, callback) => {
    if (file.fieldname === "cv") {
      callback(null, cvUploadDir);
    } else {
      callback(null, profileUploadDir);
    }
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

export const uploadCv = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      return callback(
        new HttpError(400, "Only PDF files are allowed for CV", {
          code: ErrorCodes.BAD_REQUEST,
        }),
      );
    }
    callback(null, true);
  },
});

export const uploadProfileAndCv = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (file.fieldname === "cv") {
      if (file.mimetype !== "application/pdf") {
        return callback(
          new HttpError(400, "Only PDF files are allowed for CV", {
            code: ErrorCodes.BAD_REQUEST,
          }),
        );
      }
    } else if (file.fieldname === "profilePicture") {
      if (!file.mimetype.startsWith("image/")) {
        return callback(
          new HttpError(400, "Only image files are allowed for profile picture", {
            code: ErrorCodes.BAD_REQUEST,
          }),
        );
      }
    }
    callback(null, true);
  },
}).fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "cv", maxCount: 1 },
]);
