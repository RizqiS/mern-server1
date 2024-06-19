import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const MIME_TYPE_MAP: { [key: string]: string } = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storages = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads/images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(".").join("_");
    callback(null, name + uuidv4().slice(0, 8) + "." + MIME_TYPE_MAP[file.mimetype]);
  },
});

export const upload = multer({
  storage: storages,
  limits: { fileSize: 1048576 },
  fileFilter: (req, file, callback) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    const errors: any = isValid ? null : new Error("Invalid mime type");
    callback(errors, isValid);
  },
});

function uploadDynamic(folderName: string) {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, callback) => {
        callback(null, `uploads/images/${folderName}`);
      },
      filename: (req, file, callback) => {
        const name = file.originalname.split(".").join("_");
        callback(null, name + uuidv4().slice(0, 8) + "." + MIME_TYPE_MAP[file.mimetype]);
      },
    }),
    limits: { fileSize: 1048576 },
    fileFilter: (req, file, callback) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype];
      const errors: any = isValid ? null : new Error("Invalid mime type");
      callback(errors, isValid);
    },
  });
}

export default uploadDynamic;
