import * as uuid from "uuid";
import { Request } from "../app";
import { Evaluation } from "../models/Evaluation";
import { Model } from "../models/Model";
import { userValidator } from "./validator";

import { Response, Router } from "express";

const evaluationRouter: Router = Router();

/**
 * Get All Evaluations
 * TODO: filter by current user
 */
evaluationRouter.get("/", userValidator, (request: Request, response: Response) => {
  console.log (request.session);
  Evaluation.find().populate('user').exec((err, evaluations) => {
    if (err) {
      return console.error(err);
    }
    // console.log(evaluations);
    response.json(evaluations);
  });
});

/**
 * Get One Evaluation by id
 */
evaluationRouter.get("/:id", (request: Request, response: Response) => {
  Evaluation.findOne({_id: request.params.id}).populate('user').exec((err, evaluation) => {
    if (err || !evaluation) {
      console.error(err || "Not found.");
      return response.status(404).send("Not found :(");
    };
    // console.log(evaluation);
    response.json(evaluation);
  });
});

/**
 * Update Evaluation by id
 */
evaluationRouter.post("/:id", (request: Request, response: Response) => {
  console.log("request.body",request.body);
  Evaluation.findOneAndUpdate({_id: request.params.id}, request.body, {new: true}, (err, evaluation) => {
    if (err || !evaluation) {
      console.error(err, "Update failed.");
      return response.status(404).send("Update failed :(");
    }
    console.log("updated",evaluation);
    response.json(evaluation);
  });
});

/**
 * Create Evaluation
 */
evaluationRouter.post("/", userValidator, (request: Request, response: Response) => {
    console.log ("creating evaluation",request.body);

    // Prep historical ref
    request.body.model_ref.evaluations = null;
    request.body.model_ref.isHistorical = true;
    request.body.model_ref.dataset = request.body.model_ref.dataset._id;
    request.body.model_ref.user = request.body.model_ref.user._id;

    const newEvaluation = new Evaluation({
        user: request.session["user"]._id,
        model: request.body.modelID,
        model_ref: request.body.model_ref,
        status: "NEW",
        parameters: {},
    });

    // Save evaluation
    newEvaluation.save((err, evaluation) => {
        if (err) {
            console.error(err);
            response.status(500).send("error");
        }
        // console.log (evaluation);
        Model.update(
            { _id: request.body.modelID }, 
            { $push: { evaluations: evaluation._id } },
            (err2, model) => {
              if (err2) {
                  console.error(err2);
                  response.status(500).send("error");
              }
              response.json(evaluation);
            },
        );

    });
});

/**
 * Delete Evaluation
 */
evaluationRouter.delete("/:id", (request: Request, response: Response) => {

  Evaluation.deleteOne({_id: request.params.id}, (err, evaluations) => {
    if (err) {
      console.error(err);
      return response.status(500).send();
    }
    if (evaluations.deletedCount === 1){
      response.json({
        _id: request.params.id,
      });
    } else {
      response.status(500).send();
    }
  });

});

export { evaluationRouter };
