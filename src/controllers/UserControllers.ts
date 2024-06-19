import Users from "../models/users";
import { HttpError } from "../utils/HttpError";
import { validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";

export async function getAllUser(req: Request, res: Response, next: NextFunction) {
  let users;
  try {
    users = await Users.find();
  } catch (err) {
    return next(new HttpError("Internal Server Error", 500));
  }
  res.json({ users: users.map((item) => item.toObject({ getters: true })) });
}

export async function signUp(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("invalid inputs passed, please check your data", 422));
  }

  const { username, email, password } = req.body as { username: string; email: string; password: string };

  let createdUser;
  try {
    createdUser = await Users.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("something wrong, please try again", 500));
  }

  if (createdUser) {
    return next(new HttpError("could not create user, email already exists.", 422));
  }

  let hashPassword;
  try {
    hashPassword = await hash(password, 12);
  } catch (err) {
    next(new HttpError("could not sign up, please try again", 500));
  }

  const users = new Users({
    name: username,
    email,
    password: hashPassword,
    image: req.file?.path,
    place: [],
  });

  try {
    await users.save();
  } catch (error) {
    return next(new HttpError("could not sign up, please try again", 500));
  }

  let token;
  try {
    token = sign({ userId: users.id, email: users.email }, `${process.env.JWT_SECRET}`, { expiresIn: "1h" });
  } catch (err) {
    return next(new HttpError("could not sign up, please try again", 500));
  }

  return res.json({ users: { userID: users.id, email: users.email, token: token } });
}

export async function signIn(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("invalid inputs passed, please check your data", 422));
  }

  const { email, password } = req.body as { email: string; password: string };

  let existingUser;
  try {
    existingUser = await Users.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("could not sign in, please try again", 500));
  }

  if (!existingUser) {
    return next(new HttpError("could not sign in check your email and password, please try again", 404));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError("invalid credentials, please try again", 404));
  }

  if (!isValidPassword) {
    return next(new HttpError("invalid credentials, please try again", 404));
  }

  let token;
  try {
    token = sign({ userID: existingUser.id, email: existingUser.email }, `${process.env.JWT_SECRET}`, {
      expiresIn: "1h",
    });
  } catch (err) {
    return next(new HttpError("sign in failed, please try again", 500));
  }

  res.json({ users: { userID: existingUser.id, email: existingUser.email, token: token } });
}
