"""
To run: python -m unittest -v test.test_worker
"""
import os

from keras.models import load_model

import unittest
from evaluation_service import evaluation_service
from model_service import model_service
from dataset_service import dataset_service
from worker import Worker
from settings import TEST_MONGO_HOST, TEST_MONGO_PORT, TEST_MONGO_USERNAME, TEST_MONGO_PASSWORD, TEST_MONGO_DBNAME, TEST_WORKER_ID, DEPLOY_DIRECTORY
from data import TEST_MODEL, TEST_DATASET, TEST_EVALUATION

import numpy as np

class TestWorkerMethods(unittest.TestCase):
    
    def __init__(self, *args, **kwargs):
        super(TestWorkerMethods, self).__init__(*args, **kwargs)
        self.mongo_uri = "mongodb://{username}:{password}@{host}:{port}/{database}".format(
                username=TEST_MONGO_USERNAME, password=TEST_MONGO_PASSWORD, host=TEST_MONGO_HOST, port=TEST_MONGO_PORT, database=TEST_MONGO_DBNAME)
        self.evaluation_service = evaluation_service(self.mongo_uri, TEST_MONGO_DBNAME, TEST_WORKER_ID)
        self.model_service = model_service(db=TEST_MONGO_DBNAME, client=self.evaluation_service.client)
        self.dataset_service = dataset_service(db=TEST_MONGO_DBNAME, client=self.evaluation_service.client)
        

    def setUp(self):
        # self.mongo_uri = "mongodb://{username}:{password}@{host}:{port}/{database}".format(
        #         username=TEST_MONGO_USERNAME, password=TEST_MONGO_PASSWORD, host=TEST_MONGO_HOST, port=TEST_MONGO_PORT, database=TEST_MONGO_DBNAME)
        # self.evaluation_service = evaluation_service(self.mongo_uri, TEST_MONGO_DBNAME, TEST_WORKER_ID)
        # self.model_service = model_service(db=TEST_MONGO_DBNAME, client=self.evaluation_service.client)
        # self.dataset_service = dataset_service(db=TEST_MONGO_DBNAME, client=self.evaluation_service.client)
        
        self.created_models = []
        self.created_datasets = []

    def test_run(self):
        self.test_dataset, self.test_model, self.test_evaluation = self.create_test_evaluation(cross_val=False)
        worker = Worker(mongo_uri=self.mongo_uri, db=TEST_MONGO_DBNAME, worker_id=TEST_WORKER_ID)
        worker.run_once()
        self.assertTrue(worker.evaluation is not None, 'worker has evaluation')
        self.assertEqual(self.test_evaluation['_id'], worker.evaluation['_id'], 'evaluation consistent')
        evaluation = self.evaluation_service.getEvaluationByID(worker.evaluation['_id'])
        self.assertEqual(evaluation['status'], 'DONE', 'evaluation successful')
        print evaluation['metrics_names']
        self.assertEqual(evaluation['metrics_names'][0], 'loss', 'metrics_names consistent 0')
        self.assertEqual(evaluation['metrics_names'][1], 'binary_accuracy', 'metrics_names consistent 1')
        self.assertTrue(.20 < evaluation['scores'][0] < .8, 'scores consistent 0')
        # self.assertTrue(.55 < evaluation['scores'][1] < .75, 'scores consistent 1')
        
        model = self.model_service.getModelByID(worker.evaluation.get('model'))
        self.assertTrue(model is not None, 'evaluation has model')
        self.assertTrue(model.get('deployID') is not None, 'deployID exists')
        self.assertEqual(model.get('name'),'Test Pima')
        self.assertEqual(model.get('pathToHDF5'),'deploys/'+str(model.get('_id'))+'.h5')
        
        w = Worker(mongo_uri=self.mongo_uri, db=TEST_MONGO_DBNAME, worker_id=TEST_WORKER_ID)
        data = {
            "field8": "50",
            "field7": "0.627",
            "field6": "33.6",
            "field5": "0",
            "field4": "35",
            "field3": "72",
            "field2": "148",
            "field1": "6"
        }
        # predictions = w.predictFromModel(model['_id'], [{u'field2': u'3.5', u'field3': u'1.4', u'field1': u'5.1', u'field4': u'0.2'}], [u'field1', u'field2', u'field3', u'field4'])
        # return None

        predictions = w.predictFromModel(model['_id'], data, TEST_MODEL.get('inputColumns'))
        rounded = [round(x[0]) for x in predictions]
        print(rounded)
        self.assertEqual(rounded, [0.0], 'single prediction successful')
        data = [
        {
            "field9": "1",
            "field8": "50",
            "field7": "0.627",
            "field6": "33.6",
            "field5": "0",
            "field4": "35",
            "field3": "72",
            "field2": "148",
            "field1": "6"
        },
        {
            "field9": "0",
            "field8": "31",
            "field7": "0.351",
            "field6": "26.6",
            "field5": "0",
            "field4": "29",
            "field3": "66",
            "field2": "85",
            "field1": "1"
        }]
        # data = TEST_DATASET['data']
        predictions = w.predictFromModel(model['_id'], data, TEST_MODEL.get('inputColumns'))
        rounded = [round(x[0]) for x in predictions]
        print(rounded)
        self.assertEqual(rounded, [0.0, 0.0], 'multiple prediction successful')
        
    def test_run_cross_val(self):
        self.test_dataset, self.test_model, self.test_evaluation = self.create_test_evaluation(cross_val=True)
        worker = Worker(mongo_uri=self.mongo_uri, db=TEST_MONGO_DBNAME, worker_id=TEST_WORKER_ID)
        worker.run_once()
        self.assertTrue(worker.evaluation is not None, 'worker has evaluation')
        self.assertEqual(self.test_evaluation['_id'], worker.evaluation['_id'], 'evaluation consistent')
        evaluation = self.evaluation_service.getEvaluationByID(worker.evaluation['_id'])
        self.assertEqual(evaluation['status'], 'DONE', 'evaluation successful')
        print evaluation['scores']
        self.assertEqual(evaluation['metrics_names'][0], 'accuracy', 'metrics_names consistent 0')
        self.assertEqual(evaluation['metrics_names'][1], 'std_deviation', 'metrics_names consistent 1')
        self.assertTrue(.20 < evaluation['scores'][0] < .8, 'scores consistent 0')
        # self.assertTrue(.55 < evaluation['scores'][1] < .75, 'scores consistent 1')
        
        model = self.model_service.getModelByID(worker.evaluation.get('model'))
        self.assertTrue(model is not None, 'evaluation has model')
        self.assertTrue(model.get('deployID') is not None, 'deployID exists')
        self.assertEqual(model.get('name'),'Test Pima')
        self.assertEqual(model.get('pathToHDF5'),'deploys/'+str(model.get('_id'))+'.h5')
        
        w = Worker(mongo_uri=self.mongo_uri, db=TEST_MONGO_DBNAME, worker_id=TEST_WORKER_ID)
        data = {
            "field8": "50",
            "field7": "0.627",
            "field6": "33.6",
            "field5": "0",
            "field4": "35",
            "field3": "72",
            "field2": "148",
            "field1": "6"
        }
        predictions = w.predictFromModel(model['_id'], data, TEST_MODEL.get('inputColumns'))
        rounded = [round(x[0]) for x in predictions]
        print(rounded)
        self.assertEqual(rounded, [0.0], 'single prediction successful')
        data = [
        {
            "field9": "1",
            "field8": "50",
            "field7": "0.627",
            "field6": "33.6",
            "field5": "0",
            "field4": "35",
            "field3": "72",
            "field2": "148",
            "field1": "6"
        },
        {
            "field9": "0",
            "field8": "32",
            "field7": "0.672",
            "field6": "23.3",
            "field5": "0",
            "field4": "0",
            "field3": "64",
            "field2": "183",
            "field1": "8"
        }]
        # data = TEST_DATASET['data']
        predictions = w.predictFromModel(model['_id'], data, TEST_MODEL.get('inputColumns'))
        rounded = [round(x[0]) for x in predictions]
        print(rounded)
        self.assertEqual(rounded, [0.0, 1.0], 'multiple prediction successful')
                
    def create_test_evaluation(self, cross_val=False):
        # Create test data
        dataset = self.dataset_service.insertDataset(TEST_DATASET)
        self.created_datasets.append(dataset)
        TEST_MODEL['dataset'] = dataset
        if cross_val:
            TEST_MODEL['cross_validation'] = {
                "shuffle": True, 
                "n_splits": 2,
                "validator": "KFold"
            }
        model = self.model_service.insertModel(TEST_MODEL)
        self.created_models.append(model)
        TEST_EVALUATION['model'] = model
        TEST_EVALUATION['model_ref'] = TEST_MODEL
        TEST_EVALUATION['worker'] = self.evaluation_service.worker_id
        evaluation = self.evaluation_service.insertEvaluation(TEST_EVALUATION)
        ret_evaluation = self.evaluation_service.getEvaluationByID(evaluation)
        self.assertTrue(ret_evaluation is not None, 'evaluation created')
        self.assertEqual(ret_evaluation['_id'], evaluation, 'Retrieved evaluation consistent')
        self.assertEqual(ret_evaluation['model_ref']['_id'], model, 'Retrieved evaluation model_ref consistent')
        ret_model = self.model_service.getModelByID(ret_evaluation['model'])
        self.assertTrue(ret_model is not None, 'evaluation has model')
        self.assertEqual(ret_model['_id'], model, 'evaluation model consistent')
        ret_dataset = self.dataset_service.getDatasetByID(ret_model['dataset'])
        self.assertTrue(ret_dataset is not None, 'model has dataset')
        self.assertEqual(ret_dataset['_id'], dataset, 'model ret_dataset consistent')
        return [ret_dataset, ret_model, ret_evaluation]
    
    def tearDown(self):
        self.evaluation_service.removeEvaluations()
        for m in self.created_models:
            self.model_service.removeModel({'name': 'Test Mnist'})
            self.model_service.removeModel({'name': 'Test Pima'})
            self.model_service.removeModel({'name': 'Test Iris'})
            self.model_service.removeModel({'name': 'Boston Housing Test'})
        for d in self.created_datasets:
            self.dataset_service.removeDataset({'name': 'Test Pima'})
            self.dataset_service.removeDataset({'name': 'Test Iris'})
            self.dataset_service.removeDataset({'name': 'Boston Housing Test'})
        for grid_out in self.dataset_service.fs.find():
            if grid_out.filename != 'mnist':
                self.dataset_service.fs.delete(grid_out._id)
        for the_file in os.listdir(DEPLOY_DIRECTORY):
            file_path = os.path.join(DEPLOY_DIRECTORY, the_file)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(e)