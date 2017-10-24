"""
To run: python -m unittest -v test.test_worker
"""

import unittest
from evaluation_service import evaluation_service
from model_service import model_service
from dataset_service import dataset_service
from worker import Worker
from settings import TEST_MONGO_HOST, TEST_MONGO_PORT, TEST_MONGO_USERNAME, TEST_MONGO_PASSWORD, TEST_MONGO_DBNAME, TEST_WORKER_ID
from data import TEST_MODEL, TEST_DATASET, TEST_EVALUATION

class TestWorkerMethods(unittest.TestCase):

    def setUp(self):
        self.mongo_uri = "mongodb://{username}:{password}@{host}:{port}/{database}".format(
                username=TEST_MONGO_USERNAME, password=TEST_MONGO_PASSWORD, host=TEST_MONGO_HOST, port=TEST_MONGO_PORT, database=TEST_MONGO_DBNAME)
        self.evaluation_service = evaluation_service(self.mongo_uri, TEST_MONGO_DBNAME, TEST_WORKER_ID)
        self.model_service = model_service(db=TEST_MONGO_DBNAME, client=self.evaluation_service.client)
        self.dataset_service = dataset_service(db=TEST_MONGO_DBNAME, client=self.evaluation_service.client)
        self.created_models = []
        self.created_datasets = []
        self.test_dataset, self.test_model, self.test_evaluation = self.create_test_evaluation()

    def test_run(self):
        worker = Worker(mongo_uri=self.mongo_uri, db=TEST_MONGO_DBNAME, worker_id=TEST_WORKER_ID)
        worker.run_once()
        self.assertTrue(worker.evaluation is not None, 'worker has evaluation')
        self.assertEqual(self.test_evaluation['_id'], worker.evaluation['_id'], 'evaluation consistent')
        evaluation = self.evaluation_service.getEvaluationByID(worker.evaluation['_id'])
        self.assertEqual(evaluation['status'], 'DONE', 'evaluation successful')
        self.assertEqual(evaluation['metrics_names'][0], 'loss', 'metrics_names consistent 0')
        self.assertEqual(evaluation['metrics_names'][1], 'binary_accuracy', 'metrics_names consistent 1')
        self.assertTrue(.20 < evaluation['scores'][0] < .40, 'scores consistent 0')
        self.assertTrue(.55 < evaluation['scores'][1] < .75, 'scores consistent 1')
                
    def create_test_evaluation(self):
        # Create test data
        dataset = self.dataset_service.insertDataset(TEST_DATASET)
        self.created_datasets.append(dataset)
        TEST_MODEL['dataset'] = dataset
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
        for d in self.created_models:
            self.model_service.removeModel({'name': 'Test Pima'})
        for d in self.created_datasets:
            self.dataset_service.removeDataset({'name': 'Test Pima'})