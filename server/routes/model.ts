import * as uuid from "uuid";
import { Request } from "../app";
import { Model } from "../models/Model";
import { userValidator } from "./validator";

import { Response, Router } from "express";

import formidable = require("formidable");
import fs = require("fs");
import csv =require("csvtojson");

const modelRouter: Router = Router();

/**
 * Get All Models
 * TODO: filter by current user
 */
modelRouter.get("/", userValidator, (request: Request, response: Response) => {
  console.log (request.session);
  Model.find()
    .populate('user')
    .populate('evaluations')
    .populate({'path': 'dataset', select: {data: {$slice: 10}}})
    .exec((err, models) => {
      if (err) {
        return console.error(err);
      }
      // console.log(models);
      response.json(models);
  });
});

/**
 * Get One Model by id
 */
modelRouter.get("/:id", (request: Request, response: Response) => {
  Model.findOne({_id: request.params.id})
    .populate('user')
    .populate('evaluations')
    .populate({'path': 'dataset', select: {data: {$slice: 10}}})
    .exec((err, model) => {
      if (err || !model) {
        console.error(err || "Not found.");
        return response.status(404).send("Not found :(");
      };
      // console.log(model);
      response.json(model);
  });
});

/**
 * Update Model by id
 */
modelRouter.post("/:id", (request: Request, response: Response) => {
  console.log("request.body",request.body);
  Model.findOneAndUpdate({_id: request.params.id}, request.body, {new: true})
    .populate('user')
    .populate('evaluations')
    .populate({'path': 'dataset', select: {data: {$slice: 10}}})
    .exec((err, model) => {
      if (err || !model) {
        console.error(err, "Update failed.");
        return response.status(404).send("Update failed :(");
      }
      console.log("updated",model);
      response.json(model);
    });
});

/**
 * Create Model
 */
modelRouter.post("/", userValidator, (request: Request, response: Response) => {
    console.log ("creating model",request.body);

    const newModel = new Model({
        user: request.session["user"]._id,
        name: request.body.name,
        dataset: request.body.dataset,
        modelType: request.body.modelType,
        trainTestSplit: request.body.trainTestSplit,
        inputColumns: request.body.inputColumns,
        outputColumns: request.body.outputColumns,
        layers: request.body.layers,
        optimizer: request.body.optimizer,
        loss: request.body.loss,
        metrics: request.body.metrics,
        sample_weight_mode: request.body.sample_weight_mode,
        weighted_metrics: request.body.weighted_metrics,
    });

    // Save model
    newModel.save((err, model) => {
        if (err) {
            console.error(err);
            response.status(500).send("error");
        }
        // console.log (model);
        response.json(model);
    });
});

/**
 * Delete Model
 */
modelRouter.delete("/:id", (request: Request, response: Response) => {

  Model.deleteOne({_id: request.params.id}, (err, models) => {
    if (err) {
      console.error(err);
      return response.status(500).send();
    }
    if (models.deletedCount === 1){
      response.json({
        _id: request.params.id,
      });
    } else {
      response.status(500).send();
    }
  });

});

export { modelRouter };
