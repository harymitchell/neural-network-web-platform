import { pbkdf2, randomBytes } from "crypto";
import { NextFunction, Response, Router } from "express";
import { Request } from "../app";
import { digest, length, secret } from "../config";
import {  default as User } from "../models/User";

import { sign } from "jsonwebtoken";

const GoogleAuth = require ("google-auth-library");
const auth = new GoogleAuth();
import { GOOGLE_ID } from "../config";

const loginRouter: Router = Router();

/**
 * Creates Google user in DB if not exists already.
 * @param login
 * @param response
 */
function createGoogleUser(login, request: Request, response: Response){
    let payload = login.getPayload();
    User.findOne({email: payload.email}, (err, user) => {
      if (err) {
        console.error(err || "DB Error");
        request.session["user"] = null;
        return response.status(404).send("DB Error");
      } else if (user) {
        console.log("User already existed in DB",user);
        request.session["user"] = user;
        response.json(user);
      } else {
        const newUser = new User(payload);
        newUser.save((err, createdUser) => {
          if (err) {
            console.error(err);
            request.session["user"] = null;
            response.status(500).send("error");
          }; 
          console.log ("createdUser",createdUser);
          request.session["user"] = createdUser;
          console.log("session user",request.session["user"])
          response.json(createdUser);
        });
      }
    });
}

// login method
loginRouter.post("/", (request: Request, response: Response, next: NextFunction) => {
    // console.log(request.body);
    const client = new auth.OAuth2(GOOGLE_ID, "", "");
    client.verifyIdToken(
        request.body.idToken,
        GOOGLE_ID,
        (e, login) => {
            if (e || !login){
                console.log(e)
                request.session["user"] = null;
                response.status(401).send("Login Failed");
            } else {
                console.log(login)
                createGoogleUser(login, request, response);
            }
    });
});

// logout method
loginRouter.post("/logout", (request: Request, response: Response, next: NextFunction) => {
    console.log ("user logging out");
    request.session["user"] = null;
    response.json({status: "loggedOut"});
});

export { loginRouter };


// const user = {
//     hashedPassword: "6fb3a68cb5fe34d0c2c9fc3807c8fa9bc0e7dd10023065ea4233d40a2d6bb4a" +
//     "7e336a82f48bcb5a7cc95b8a590cf03a4a07615a226d09a89420a342584a" +
//     "a28748336aa0feb7ac3a12200d13641c8f8e26398cfdaf268dd68746982bcf" +
//     "59415670655edf4e9ac30f6310bd2248cb9bc185db8059fe979294dd3611fdf28c2b731",
//     salt: "OxDZYpi9BBJUZTTaC/yuuF3Y634YZ90KjpNa+Km4qGgZXGI6vhSWW0T91" +
//     "rharcQWIjG2uPZEPXiKGnSAQ73s352aom56AIYpYCfk7uNsd+7AzaQ6dxTnd9AzCCdIc/J" +
//     "62JohpHPJ5eGHUJJy3PAgHYcfVzvBHnIQlTJCQdQAonQ=",
//     username: "john",
// };

// loginRouter.post("/signup", (request: Request, response: Response, next: NextFunction) => {
//     if (!request.body.hasOwnProperty("password")) {
//         const err = new Error("No password");
//         return next(err);
//     }

//     const salt = randomBytes(128).toString("base64");

//     pbkdf2(request.body.password, salt, 10000, length, digest, (err: Error, hash: Buffer) => {
//         response.json({
//             hashed: hash.toString("hex"),
//             salt,
//         });
//     });
// });
// login method
// loginRouter.post("/", (request: Request, response: Response, next: NextFunction) => {
    
//         pbkdf2(request.body.password, user.salt, 10000, length, digest, (err: Error, hash: Buffer) => {
//             if (err) {
//                 console.error(err);
//             }
    
//             // check if password is active
//             if (hash.toString("hex") === user.hashedPassword) {
    
//                 const token = sign(Object.assign({}, { user: user.username, permissions: [] }), secret, { expiresIn: "7d" });
//                 response.json({jwt: token});
    
//             } else {
//                 response.json({message: "Wrong password"});
//             }
    
//         });
//     });
