import * as uuid from "uuid";
import { Request } from "../app";
import { Dataset } from "../models/Dataset";
import { userValidator } from "./validator";

import { Response, Router } from "express";

import formidable = require("formidable");
import fs = require("fs");
import csv = require("csvtojson");

import * as mongoose from "mongoose";

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

function typeString(x){ 
  const parsed = parseInt(x);
  return Number.isNaN(parsed) ? (true === x || false === x) ? "Boolean" : "String" : "Number";
};

function putFileGridFS(path, name, GridFS, callback) {
  const writestream = GridFS.createWriteStream({
      filename: name
  });
  writestream.on('close', function (file) {
    callback(null, file);
  });
  writestream.on('error', function (err) {
    callback(err);
  });
  fs.createReadStream(path).pipe(writestream);
}

/**
 * Create Dataset
 */
datasetRouter.post("/", userValidator, (request: Request, response: Response) => {
  console.log ("creating dataset",request.body);
  // console.log ("GridFS", mongoose.GridFS)

  let form = new formidable.IncomingForm();

  // Parse the form
  form.parse(request, (err, fields, file) => {
    if (err || !file.uploadFile.path) {
      console.log("file upload failure",err);
      response.status(500).send(err);
    }
    console.log(fields);
    console.log(file);
    const dataArray = [];

    putFileGridFS(file.uploadFile.path, fields.name, mongoose.GridFS, (error, gridFile) => {
      if (error){
        console.error("error uploading to gridFS", error);
        return response.status(500).send(err);
      }
      console.log ("gridFS file", gridFile);

      // Read the temp file
      fs.readFile(file.uploadFile.path, {encoding: "utf8"}, (fileErr, data) => {
        if (err) {
           console.log (fileErr)
           return response.status(500).send(fileErr);
        }
        console.log ("file is read", typeof data, data.length);

        const snippetArr = data.split("\r\n");
        const snippet = snippetArr.slice(0, snippetArr.length > 1000 ? 25 : 1000).join("\r\n");
        console.log ("snippet", snippet);

        // Convert file to CSV
        csv({
          noheader: !(fields.hasHeaders === "true"),
          delimiter: fields.delimiter || "auto",
          flatKeys: false,
        }).fromString(snippet)
          .on('json',(jsonObj, rowIndex)=>{
            // console.log ("row",rowIndex);
            dataArray.push(flattenObject(jsonObj));
          })
          .on('done',() => {
            console.log ("done parsing csv");
            const colSpec = {};
            Object.keys(dataArray[0]).forEach(key => {
              colSpec[key] = {"dataType": typeString(dataArray[0][key])};
            });
            // Create dataset entity
            const newDataset = new Dataset({
              name: fields.name,
              user: request.session["user"]._id,
              data: dataArray,
              columnSpec: colSpec,
              useGridFile: snippetArr.length > 1000,
              gridFile_id: gridFile._id
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
          })
          .on('error',(err)=>{
            console.log("parse error", err);
          });
      });
   });
  });
});

function deleteDataset(request, response){
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
}

/**
 * Delete Dataset
 */
datasetRouter.delete("/:id", (request: Request, response: Response) => {

  Dataset.findOne({_id: request.params.id}).exec((errFind, dataset) => {
    if (errFind || !dataset) {
      console.error(errFind || "Not found.");
      return response.status(404).send("Not found :(");
    };
    if (dataset.gridFile_id){
      mongoose.GridFS.remove({_id: dataset.gridFile_id}, (gridFSerr) => {
        if (gridFSerr){
          console.error("gridFSerr", gridFSerr);
        }
        deleteDataset(request, response);
      });
    } else {
      deleteDataset(request, response);
    }
  });
});

export { datasetRouter };
