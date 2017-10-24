import { Request } from "../app";
import {  default as User } from "../models/User";

import { Response, Router } from "express";

import { userValidator } from "./validator";

const userRouter: Router = Router();

/**
 * Get Current user
 */
userRouter.get("/", userValidator, (request: Request, response: Response) => {
  User.findOne({email: request.session["user"].email}, (err, user) => {
    if (err || !user) {
      console.error(err || "Not found.");
      return response.status(404).send("Not found :(");
    }
    console.log(user);
    response.json(user);
  });
});

/**
 * Search All users
 * TODO: filters
 */
userRouter.get("/search", (request: Request, response: Response) => {
  User.find((err, users) => {
    if (err) {
      return console.error(err);
    };
    console.log(users);
    response.json(users);
  });
});

/**
 * Get User by Id
 */
userRouter.get("/:id", (request: Request, response: Response) => {
  User.findOne({id: request.params.id}, (err, users) => {
    if (err || !users) {
      console.error(err || "Not found.");
      return response.status(404).send("Not found :(");
    };
    console.log(users);
    response.json(users);
  });
});

export { userRouter };
