// import * as uuid from "uuid";
// import { Request } from "../app";
// import { Deploy } from "../models/Deploy";
// import { Model } from "../models/Model";
// import { userValidator } from "./validator";

// import { Response, Router } from "express";

// import requestLib = require("request");
// import formidable = require("formidable");
// import fs = require("fs");
// import csv = require("csvtojson");

// const deployRouter: Router = Router();

// /**
//  * Get One Deploy by id
//  */
// deployRouter.get("/:id", (request: Request, response: Response) => {
//     Deploy.findOne({_id: request.params.id})
//       .populate('user')
//       .populate('model')
//       .exec((err, deploy) => {
//         if (err || !deploy) {
//           console.error(err || "Not found.");
//           return response.status(404).send("Not found :(");
//         };
//         // console.log(deploy);
//         response.json(deploy);
//     });
// });

// /**
//  * Create deploy
//  */
// deployRouter.post("/", userValidator, (request: Request, response: Response) => {
//     const deployID = uuid();
//     console.log ("creating deploy",request.body, deployID);

//     Model.findOne({_id: request.body.model})
//     .populate({'path': 'dataset', select: "columnSpec"})
//     .exec((err, model) => {
//         if (err || !model) {
//           console.error(err || "Not found.");
//           return response.status(404).send("Not found :(");
//         };
//         // user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         // model: { type: mongoose.Schema.Types.ObjectId, ref: "Model" },
//         // serviceURL: String,
//         // deployID: String,
//         // dataSchema: Object,
//         // pathToHDF5: Object,
//         const newdeploy = new Deploy({
//             user: request.session["user"]._id,
//             model: request.body.model,
//             deployID: deployID,
//             dataSchema: model.dataset.columnSpec
//         });

//         // Save deploy
//         newdeploy.save((err, deploy) => {
//             if (err) {
//                 console.error(err);
//                 response.status(500).send("error");
//             }
//             // console.log (deploy);
//             response.json(deploy);
//         });
//     });

// });

// /**
//  * Evaluate Deploy by id
//  */
// deployRouter.post("/evaluate/:id", (request: Request, response: Response) => {
//     Deploy.findOne({_id: request.params.id})
//       .populate('user')
//       .populate('model')
//       .exec((err, deploy) => {
//         if (err || !deploy) {
//           console.error(err || "Not found.");
//           return response.status(404).send("Not found :(");
//         };
//         if (!deploy.serviceURL){
//             console.error(err || "No serviceURL found.");
//             return response.status(404).send("No serviceURL found :(");
//         }
//         // Proxy request
//         requestLib
//             .post({url: deploy.serviceURL, data: request.body})
//             .on('response', function(response) {
//                 response.json(response);
//             })
//             .on('error', function(response) {
//                 console.log("proxy call failed",response.statusCode);
//                 response.status(500).send("Proxy call failed :(");
//             });
//     });
// });

// export { deployRouter };