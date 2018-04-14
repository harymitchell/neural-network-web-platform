import os
from pymongo import MongoClient
from bson import ObjectId

# from pymongo import MongoClient
from settings import TEST_MONGO_HOST, TEST_MONGO_PORT, TEST_MONGO_USERNAME, TEST_MONGO_PASSWORD
import pprint

class model_service (object):
    """Service which connects to Models via MongoDB"""

    def __init__(self, mongo_uri=None, db=None, worker_id=None, client=None):
        self.serviceURL = os.environ.get('SERVICE_URL', None)
        if client:
            self.client = client
        else:
            self.client = MongoClient(mongo_uri)
        self.db = self.client[db]

    def retrieveAllModels(self):
        """Returns all models for worker"""
        result = []
        for model in self.db.models.find():
            result.append(model)
        return result

    def getModelByID(self, identifier):
        return self.db.models.find_one({'_id': identifier})

    def removeModel(self, filter):
        """Removes all models for filter"""
        self.db.models.remove(filter)
                
    def updateModel(self, model, set_obj):
        """Updates the given model"""
        return self.db.models.update_one(
            {'_id': ObjectId(model["_id"])}, set_obj, 
            upsert=False)
            
    def retrieveRequestedDeploy(self):
        """Claims a requested deploy from the DB
            returns the model object, once claim verified"""
        if self.serviceURL is None:
            print ("No serviceURL!")
            return None
        result = None
        for model in self.db.models.find({'deployRequested':True}):
            self.db.models.update_one(
                {'_id': model["_id"]},
                {'$set': {'serviceURL': self.serviceURL, 'deployRequested': False}}, 
                upsert=False)
            result = self.db.models.find_one({'_id': model["_id"]})
            if result.get("deployRequested") == False and result.get("serviceURL") == self.serviceURL:
                break
        return result
                
    def insertModel(self, model):
        """Inserts the given model"""
        return self.db.models.insert(model)
        