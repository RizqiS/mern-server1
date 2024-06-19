import express from "express";
import uploadDynamic from "../middlewares/FileUpload";
import { check } from "express-validator";
import {
  allPlace,
  allPlaceById,
  placeByUserId,
  insertPlace,
  updatePlace,
  deletePlace,
} from "../controllers/PlaceControllers";
import authCheck from "../middlewares/authCheck";

const router = express.Router();

router.get("/", allPlace);

router.get("/:placeId", allPlaceById);

router.get("/user/:userId", placeByUserId);

router.use(authCheck);

router.post(
  "/",
  uploadDynamic("place").single("image"),
  [
    check("title").trim().notEmpty(),
    check("description").trim().notEmpty(),
    check("address").trim().notEmpty(),
    check("creator").trim().notEmpty(),
    check("location").trim().notEmpty(),
  ],
  insertPlace
);

router.patch("/:placeId", [check("title").trim().notEmpty(), check("description").trim().notEmpty()], updatePlace);

router.delete("/:placeId", deletePlace);

export default router;
