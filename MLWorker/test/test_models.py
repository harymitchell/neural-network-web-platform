"""
To run: python -m unittest -v test.test_models
"""

import unittest
from model_service import model_service
from dataset_service import dataset_service
from settings import TEST_MONGO_HOST, TEST_MONGO_PORT, TEST_MONGO_USERNAME, TEST_MONGO_PASSWORD, TEST_MONGO_DBNAME
from data import TEST_MODEL, TEST_DATASET

class TestModelsMethods(unittest.TestCase):

    def setUp(self):
        self.mongo_uri = "mongodb://{username}:{password}@{host}:{port}/{database}".format(
                username=TEST_MONGO_USERNAME, password=TEST_MONGO_PASSWORD, host=TEST_MONGO_HOST, port=TEST_MONGO_PORT, database=TEST_MONGO_DBNAME)
        self.model_service = model_service(self.mongo_uri, TEST_MONGO_DBNAME, "unit_test_worker_id")
        self.dataset_service = dataset_service(db=TEST_MONGO_DBNAME, client=self.model_service.client)
        self.created_models = []
        self.created_datasets = []

    def test_create(self):
        dataset = self.dataset_service.insertDataset(TEST_DATASET)
        self.created_datasets.append(dataset)
        TEST_MODEL['dataset'] = dataset
        model = self.model_service.insertModel(TEST_MODEL)
        self.created_models.append(model)
        self.assertTrue(model is not None, 'model created')
        # Retrieve model by its _id
        ret_model = self.model_service.getModelByID(model)
        self.assertEqual(ret_model['_id'], model, 'Retrieved model consistent')
        self.assertEqual(ret_model['dataset'], dataset, 'Retrieved model dataset consistent')
        self.model_service.removeModel({'name': 'Test Pima'})
        
        
    def tearDown(self):
        for d in self.created_models:
            self.model_service.removeModel({'name': 'Test Pima'})
        for d in self.created_datasets:
            self.dataset_service.removeDataset({'name': 'Test Pima'})
 