import { NextFunction, Response, Router } from "express";
import { Request } from "../app";

function userValidator (request: Request, response: Response, next: NextFunction){
    if (request.session && request.session["user"] && request.session["user"]._id) {
        next();
    } else if (request.session && request.session["user"]) {
        response.status(401).send("User has no id!");
    } else if (request.session) {
        response.status(401).send("No user found!");
    } else {
        response.status(401).send("No session found!");
    }
}

export { userValidator };
