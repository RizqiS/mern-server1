import express, { Request, Response, NextFunction } from "express";
import Users, { IUser } from "../models/users";
import Places, { IPlace } from "../models/places";
import uploadDynamic from "../middlewares/FileUpload";
const router = express.Router();

// const upload = multer({
//   dest: "src/uploads/images/",
// });

router.post("/", uploadDynamic("user").single("image"), (req: Request, res: Response, next: NextFunction) => {
  res.json({ file: req.file || "test 1" });
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  // populate users
  const users = await Users.find().populate<{ place: IPlace }>("place");

  // populate place
  const place = await Places.find().populate<{ creator: IUser }>("creator");

  res.json({ users, place });
});

export default router;
