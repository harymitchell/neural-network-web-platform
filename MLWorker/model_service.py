import numpy as np
from numpy import ma
import pandas

from pymongo import MongoClient
from settings import TEST_MONGO_HOST, TEST_MONGO_PORT, TEST_MONGO_USERNAME, TEST_MONGO_PASSWORD
import pprint

class model_service (object):
    """Service which connects to Models via MongoDB"""

    def __init__(self, mongo_uri=None, db=None, worker_id=None, client=None):
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
            {'_id': model["_id"]}, set_obj, 
            upsert=False)
                
    def insertModel(self, model):
        """Inserts the given model"""
        return self.db.models.insert(model)
        