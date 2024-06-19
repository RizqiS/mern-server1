import { HttpError } from "../utils/HttpError";
import { Request, Response, NextFunction } from "express";
import { unlink } from "fs";
import { validationResult } from "express-validator";
import Places, { IPlace } from "../models/places";
import Users, { IUser } from "../models/users";
import mongoose from "mongoose";

export async function insertPlace(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("invalid inputs passed, please check your data", 422));
  }

  const { title, description, address, location, creator } = req.body as {
    title: string;
    description: string;
    address: string;
    location: string;
    creator: string;
  };

  const parseToObjLocation = JSON.parse(location);

  let existingUser;
  try {
    existingUser = await Users.findById(creator);
  } catch (err) {
    return next(new HttpError("server internal error", 500));
  }

  if (!existingUser) {
    return next(new HttpError("please sign in or sign up in your account", 404));
  }

  const createPlace: any = new Places({
    title,
    description,
    address,
    location: parseToObjLocation,
    creator,
    image: req.file?.path,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createPlace.save({ session: sess });
    existingUser.place.push(createPlace._id);
    await existingUser.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("failed to create place, please try again", 500));
  }

  res.status(201).json({ place: createPlace });
}

export async function updatePlace(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("invalid inputs passed, please check your data", 422));
  }

  const { placeId } = req.params;
  const { title, description } = req.body as { title: string; description: string };

  let place;

  try {
    place = await Places.findById(placeId);
  } catch (err) {
    return next(new HttpError("something went wrong, could not update place", 500));
  }

  const { userID } = req.userData as { userID: string };
  if (place?.creator.toString() !== userID) {
    return next(new HttpError("you are not allowed to see this place", 401));
  }

  try {
    place = await Places.findByIdAndUpdate(
      placeId,
      { ...req.body, title, description },
      { runValidators: true, new: true }
    );
  } catch (err) {
    return next(new HttpError("something went wrong, could not update place", 500));
  }

  if (!place) {
    return next(new HttpError("could not find place with that id", 404));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
}

export async function deletePlace(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("invalid inputs passed, please check your data", 422));
  }

  const { placeId } = req.params;

  let place;
  try {
    place = await Places.findById(placeId).populate<{ creator: IUser }>("creator");
  } catch (err) {
    return next(new HttpError("server internal error", 500));
  }

  const { userID } = req.userData as { userID: string };
  if (place?.creator.id !== userID) {
    return next(new HttpError("you are not allowed to see this place", 401));
  }

  if (!place) {
    return next(new HttpError("could not find place with that id", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Places.findByIdAndDelete(placeId, { session: sess });

    const newPlace = place?.creator.place.filter((f) => f.toString() !== placeId);
    if (place && place.creator) {
      place.creator.place = newPlace;
    }

    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("server internal error,failed to delete place", 500));
  }

  unlink(place.image, () => {
    console.log("image place was deleted");
  });

  res.status(201).json({ message: "deleted place is succes" });
}

export async function allPlace(req: Request, res: Response, next: NextFunction) {
  let places;
  try {
    places = await Places.find();
  } catch (err) {
    return next(new HttpError("server internal error", 500));
  }

  res.json({ places: places.map((item) => item.toObject({ getters: true })) });
}

export async function allPlaceById(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("invalid inputs passed, please check your data", 422));
  }

  const { placeId } = req.params;

  let place;

  try {
    place = await Places.findById(placeId);
  } catch (err) {
    return next(new HttpError("server internal error", 500));
  }

  if (!place) {
    return next(new HttpError("could not find place with that id", 404));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
}

export async function placeByUserId(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("invalid inputs passed, please check your data", 422));
  }

  const { userId } = req.params;

  let place;

  try {
    place = await Users.findById(userId).populate<{ place: IPlace[] }>("place");
  } catch (err) {
    return next(new HttpError("server internal error", 500));
  }

  if (!place || !place.place) {
    return next(new HttpError("could not find place with that id", 404));
  }

  const userPlace = {
    id: place.id,
    name: place.name,
    email: place.email,
    image: place.image,
    place: place.place.map((item) => item.toObject({ getters: true })),
  };

  res.status(200).json({ userPlace });
}
