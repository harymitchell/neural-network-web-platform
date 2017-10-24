import * as uuid from "uuid";
import { Request } from "../app";
import { Dataset } from "../models/Dataset";
import { userValidator } from "./validator";

import { Response, Router } from "express";

import formidable = require("formidable");
import fs = require("fs");
import csv =require("csvtojson");

const datasetRouter: Router = Router();

const DATASET_PAGE_SIZE: Number = 10;

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

/**
 * Get All Datasets
 */
datasetRouter.get("/", userValidator, (request: Request, response: Response) => {
  console.log (request.session);
  Dataset.find().populate('user').exec((err, datasets) => {
    if (err) {
      return console.error(err);
    };
    datasets.forEach(d => {
      d.data = d.dataSelection(DATASET_PAGE_SIZE, 1);
    });
    response.json(datasets);
  });
});

/**
 * Get One Dataset by id
 */
datasetRouter.get("/:id", (request: Request, response: Response) => {
  console.log (request.session);
  Dataset.findOne({_id: request.params.id}).populate('user').exec((err, dataset) => {
    if (err || !dataset) {
      console.error(err || "Not found.");
      return response.status(404).send("Not found :(");
    };
    dataset.data = dataset.dataSelection(DATASET_PAGE_SIZE, 1);
    response.json(dataset);
  });
});

/**
 * Update Dataset by id
 */
datasetRouter.put("/:id", (request: Request, response: Response) => {
  console.log(request.body);
  Dataset.findOneAndUpdate({_id: request.params.id}, request.body, {new: true}, (err, dataset) => {
    console.log(dataset.columnSpec)
    if (err || !dataset) {
      console.error(err || "Update failed.");
      return response.status(404).send("Update failed :(");
    }
    dataset.data = dataset.dataSelection(DATASET_PAGE_SIZE, 1);
    response.json(dataset);
  });
});

/**
 * Create Dataset
 */
datasetRouter.post("/", userValidator, (request: Request, response: Response) => {
  console.log ("creating dataset",request.body);

  let form = new formidable.IncomingForm();

  // Parse the form
  form.parse(request, (err, fields, file) => {
    if (err) {
      console.log("file upload failure",err);
      response.status(500).send(err);
    }
    console.log(fields);
    console.log(file);

    // Read the temp file
    fs.readFile(file.uploadFile.path, {encoding: "utf8"}, (fileErr, data) => {
      if (err) {
         console.log (fileErr)
         return response.status(500).send(fileErr);
      }
      var dataArray = [];

      // Convert file to CSV
      csv({
        noheader: !(fields.hasHeaders === "true"),
        delimiter: fields.delimiter || "auto",
        flatKeys: false,
      }).fromString(data)
        .on('json',(jsonObj, rowIndex)=>{
          dataArray.push(flattenObject(jsonObj));
          // dataArray.push(jsonObj);
        })
        .on('done',() => {

          // Create model entity
          const newDataset = new Dataset({
            name: fields.name,
            user: request.session["user"]._id,
            data: dataArray
          });

          // Save dataset
          newDataset.save((err, dataset) => {
            if (err) {
              console.error(err);
              response.status(500).send("error");
            };
            // console.log (dataset);
            response.json(dataset);
          });
        });
   })
  });
});

/**
 * Delete Dataset
 */
datasetRouter.delete("/:id", (request: Request, response: Response) => {

  Dataset.deleteOne({_id: request.params.id}, (err, datasets) => {
    if (err) {
      console.error(err);
      return response.status(500).send();
    }
    if (datasets.deletedCount === 1){
      response.json({
        _id: request.params.id,
      });
    } else {
      response.status(500).send();
    }
  });

});

export { datasetRouter };
