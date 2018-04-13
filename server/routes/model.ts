import * as uuid from "uuid";
import { Request } from "../app";
import { Model } from "../models/Model";
import { userValidator } from "./validator";

import requestLib = require("request");

import { Response, Router } from "express";

import formidable = require("formidable");
import fs = require("fs");
import csv =require("csvtojson");

const url = require('url');

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


/**
 * Evaluate Deploy by id
 */
modelRouter.post("/deploy/:id", (request: Request, response: Response) => {

  Model.findOne({_id: request.params.id}).populate('user').exec((err, model) => {
    if (err || !model) {
      console.error(err || "Not found.");
      return response.status(404).send("Not found :(");
    }

    if (!model.serviceURL){
      console.error(err || "No serviceURL found.");
      return response.status(404).send("No serviceURL found :(");
    }

    console.log ("data",request.body, "model", model._id);

    let json;
    if (request.body.json) {
      console.log ('json body');
      json = request.body.json;
      return proxyPrediction(request, response, json, model);
    } else if (request.body.csv){
      console.log ('csv body');
      json = []
      csv({
        flatKeys: false,
      }).fromString(request.body.csv)
        .on('json',(jsonObj, rowIndex)=>{
          json.push(flattenObject(jsonObj));
        })
        .on('done',() => {
          console.log ("done parsing csv");
          return proxyPrediction(request, response, json, model);
        })
        .on('error',err =>{
          return response.status(500).send('error parsing csv');
        });
    } else {
      console.error("invalid type");
      return response.status(500).send("Invalid mime type");
    }
  });
  
});

function proxyPrediction(request: Request, response: Response, input_data, model){
  if (!input_data) {
    console.log("Invalid input data",input_data)
    return response.status(500).send("Invalid input data ");
  }
  const proxy = url.resolve(model.serviceURL, 'predict/' + model._id);
  console.log ('proxying to ',proxy);
  // Proxy request
  requestLib
    .post({
      url: proxy,
      body: {
        input_columns: model.inputColumns,
        input_data: input_data
      },
      json: true
    }, (error, res, body) => {
      if (error){
        console.log("proxy call failed",res.statusCode);
        return response.status(500).send("Proxy call failed :(");
      }
      console.log ("proxy prediction success", res.body);
      response.send(res.body);
    });
}

/**
 * Helper to flatten object.
 * https://gist.github.com/penguinboy/762197
 * @param ob 
 */
const flattenObject = (ob) => {
  var toReturn = {};

  for (var i in ob) {
    if (!ob.hasOwnProperty(i)){
      continue;
    }

    if ((typeof ob[i]) == 'object') {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)){
          continue;
        }
        toReturn[i + "_" + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};

export { modelRouter };
