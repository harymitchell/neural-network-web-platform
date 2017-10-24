import * as uuid from "uuid";
import { Request } from "../app";
import { Response, Router } from "express";
import { default as Feed } from "../models/Feed";
import { userValidator } from "./validator";

const feedRouter: Router = Router();

/**
 * Get All Feeds
 */
feedRouter.get("/", userValidator, (request: Request, response: Response) => {
  console.log (request.session);
  Feed.find((err, feeds) => {
    if (err) {
      return console.error(err);
    };
    console.log(feeds);
    response.json(feeds);
  });
});

/**
 * Get One Feed by id
 */
feedRouter.get("/:id", (request: Request, response: Response) => {
  Feed.findOne({id: request.params.id}, (err, feed) => {
    if (err || !feed) {
      console.error(err || "Not found.");
      return response.status(404).send("Not found :(");
    };
    console.log(feed);
    response.json(feed);
  });
});

/**
 * Create Feed
 */
feedRouter.post("/", (request: Request, response: Response) => {

  const newFeed = new Feed({
    id: uuid.v4(),
    name: request.body.name,
    text: request.body.text,
  });

  newFeed.save((err, feed) => {
    if (err) {
      console.error(err);
      response.status(500).send("error");
    };
    console.log (feed);
    response.json(feed);
  });

});

/**
 * Create Comment on Feed
 */
feedRouter.post("/:id/comment", (request: Request, response: Response) => {

  const feedID = request.params.id;

  Feed.findOne({id: request.params.id}, (err, feed) => {
    if (err || !feed) {
      console.error(err || "Not found.");
      return response.status(404).send("Not found :(");
    }
    feed.comments.push({
      id: uuid.v4(), 
      text: request.body.text
    });
    feed.save((errSave, feedSaved) => {
      if (errSave) {
        console.error(errSave || "Error updating.");
        return response.status(404).send("Error updating");
      }
      response.json({
        comment: {
          id: uuid.v4(),
          text: request.body.text,
        },
        id: feedID,
      });
    });
  });

});

/**
 * Delete Feed
 */
feedRouter.delete("/:id", (request: Request, response: Response) => {

  Feed.deleteOne({id: request.params.id}, (err, feeds) => {
    if (err) {
      console.error(err);
      return response.status(500).send();
    };
    response.json({
      id: request.params.id,
    });
  });

});

export { feedRouter };
