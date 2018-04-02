import numpy as np
from numpy import ma
import pandas
from bson.objectid import ObjectId
from pymongo import MongoClient
from settings import TEST_MONGO_HOST, TEST_MONGO_PORT, TEST_MONGO_USERNAME, TEST_MONGO_PASSWORD
import gridfs
import pprint
import StringIO

class dataset_service (object):
    """Service which connects to Datasets via MongoDB"""

    def __init__(self, mongo_uri=None, db=None, worker_id=None, client=None):
        if client:
            self.client = client
        else:
            self.client = MongoClient(mongo_uri)
        self.db = self.client[db]
        self.fs = gridfs.GridFS(self.db)

    def retrieveAllDatasets(self):
        """Returns all datasets for worker"""
        result = []
        for dataset in self.db.datasets.find():
            result.append(dataset)
        return result

    def getDatasetByID(self, identifier):
        # print (type(identifier))
        # print (identifier)
        # if type(identifier) is dict:
        #     identifier = identifier['_id']
        # print (identifier)
        result = self.db.datasets.find_one({'_id': ObjectId(identifier)})
        if result.get('useGridFile') and result.get('gridFile_id'):
            result['data'] = self.fileToDF(result)
        return result

    def removeDataset(self, filter):
        """Removes all datasets for filter"""
        self.db.datasets.remove(filter)
                
    def updateDataset(self, dataset, set_obj):
        """Updates the given dataset"""
        return self.db.datasets.update_one(
            {'_id': dataset["_id"]}, set_obj, 
            upsert=False)
                
    def insertDataset(self, dataset):
        """Inserts the given dataset"""
        return self.db.datasets.insert(dataset)
        
    def fileToDF(self, dataset):
        """Returns a pandas dataframe containing the data from gridFile_id"""
        exists = self.fs.exists(dataset.get('gridFile_id'))
        if exists:
            file = self.fs.get(dataset.get('gridFile_id')) # names=None if dataset['hasHeaders'] == True else ['field'+str(i+1) for i in range(len(dataset['data'][0].items()))]
            df = pandas.read_csv(file)
            return df
        return dataset.get('data')
        
    def dataToNumpy(self, data):
        """Takes array of dict and returns numpy array
            Currently, defaults to convert to float"""
        df = pandas.DataFrame(data)
        numpyMatrix = df.as_matrix().astype(np.float)
        return numpyMatrix
        
    @staticmethod
    def floatFromString(s):
        try:
            return float(s)
        except ValueError:
            return None
