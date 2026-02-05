import multer from "multer";
import fs from "fs";
import path from "path";
import { validateExtension } from "./validator.js";
import { generatePrefix } from "./utils.js";

export function createUploader(config) {
  const storage = multer.diskStorage({
    destination(req, file, callBack) {
      const { dir } = validateExtension(file.originalname, config.requiredDirs);
      const fullPath = path.join(config.uploadRoot, dir);
      fs.mkdirSync(fullPath, { recursive: true });
      callBack(null, fullPath);
    },

    filename(req, file, callBack) {
      const prefix = generatePrefix(config.rename?.prefix);
      callBack(null, `${prefix}-original-${file.originalname}`);
    }
  });

  return multer({
    storage,

    limits: {
      fileSize: config.maxFileSizeMB * 1024 * 1024
    },

    fileFilter(req, file, callBack) {
      try {
        validateExtension(file.originalname, config.requiredDirs);
        callBack(null, true);
      } catch (err) {
        callBack(new Error(err.message));
      }
    }
  });
}
