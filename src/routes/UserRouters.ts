import { signUp, signIn, getAllUser } from "../controllers/UserControllers";
import { check } from "express-validator";
import uploadDynamic from "../middlewares/FileUpload";
import express from "express";
const router = express.Router();

router.get("/", getAllUser);

router.post(
  "/signup",
  uploadDynamic("user").single("image"),
  [
    check("username").trim().notEmpty().escape(),
    check("email").trim().notEmpty().isEmail().normalizeEmail().escape(),
    check("password").trim().notEmpty().isLength({ min: 6 }).escape(),
  ],
  signUp
);

router.post(
  "/signin",
  [
    check("email").trim().notEmpty().isEmail().normalizeEmail().escape(),
    check("password").trim().notEmpty().isLength({ min: 6 }).escape(),
  ],
  signIn
);

export default router;
