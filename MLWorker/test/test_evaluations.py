"""
To run: python -m unittest -v test.test_evaluations
"""

import unittest
from evaluation_service import evaluation_service
from model_service import model_service
from dataset_service import dataset_service
from settings import TEST_MONGO_HOST, TEST_MONGO_PORT, TEST_MONGO_USERNAME, TEST_MONGO_PASSWORD, TEST_MONGO_DBNAME
from data import TEST_MODEL, TEST_DATASET, TEST_EVALUATION

class TestEvaluationsMethods(unittest.TestCase):

    def setUp(self):
        self.mongo_uri = "mongodb://{username}:{password}@{host}:{port}/{database}".format(
                username=TEST_MONGO_USERNAME, password=TEST_MONGO_PASSWORD, host=TEST_MONGO_HOST, port=TEST_MONGO_PORT, database=TEST_MONGO_DBNAME)
        self.evaluation_service = evaluation_service(self.mongo_uri, TEST_MONGO_DBNAME, "unit_test_worker_id")
        self.model_service = model_service(db=TEST_MONGO_DBNAME, client=self.evaluation_service.client)
        self.dataset_service = dataset_service(db=TEST_MONGO_DBNAME, client=self.evaluation_service.client)
        self.created_models = []
        self.created_datasets = []

    def test_crud(self):
        evaluation = self.evaluation_service.insertEvaluation({'status': 'NEW', 'worker': self.evaluation_service.worker_id})
        self.assertTrue(evaluation is not None, 'evaluation created')
        self.assertEqual(self.evaluation_service.getEvaluationByID(evaluation)['_id'], evaluation, 'Retrieved evaluation consistent')
        self.evaluation_service.updateEvaluation(self.evaluation_service.getEvaluationByID(evaluation), {'$set': {'status': 'PENDING'}})
        self.assertEqual(self.evaluation_service.getEvaluationByID(evaluation)['status'], 'PENDING', 'PENDING evaluation consistent')
        self.evaluation_service.updateEvaluation(self.evaluation_service.getEvaluationByID(evaluation), {'$set': {'status': 'NEW'}})
        self.assertEqual(self.evaluation_service.getEvaluationByID(evaluation)['status'], 'NEW', 'NEW evaluation consistent')
        self.assertEqual(len(self.evaluation_service.retrieveAllEvaluations()), 1, '1 test evaluation present')
        self.evaluation_service.removeEvaluations()
        self.assertEqual(len(self.evaluation_service.retrieveAllEvaluations()), 0, '0 test evaluations present')

    def test_retrieve_open_evaluation(self):
        self.assertEqual(len(self.evaluation_service.retrieveAllEvaluations()), 0, '0 test evaluations present')
        pending = self.evaluation_service.insertEvaluation({'status': 'PENDING', 'worker': self.evaluation_service.worker_id})
        new_evaluation = self.evaluation_service.insertEvaluation({'status': 'NEW', 'worker': self.evaluation_service.worker_id})
        self.assertEqual(len(self.evaluation_service.retrieveAllEvaluations()), 2, '2 test evaluations present')
        open_evaluation = self.evaluation_service.retrieveOpenEvaluation()
        self.assertEqual(new_evaluation, open_evaluation['_id'], 'Retrieved open evaluation consistent')
        self.evaluation_service.removeEvaluations()
        self.assertEqual(len(self.evaluation_service.retrieveAllEvaluations()), 0, '0 test evaluations present')
        
    def test_create_full_evaluation(self):
        dataset = self.dataset_service.insertDataset(TEST_DATASET)
        self.created_datasets.append(dataset)
        TEST_MODEL['dataset'] = dataset
        model = self.model_service.insertModel(TEST_MODEL)
        self.created_models.append(model)
        TEST_EVALUATION['model'] = model
        TEST_EVALUATION['worker'] = self.evaluation_service.worker_id
        evaluation = self.evaluation_service.insertEvaluation(TEST_EVALUATION)
        ret_evaluation = self.evaluation_service.getEvaluationByID(evaluation)
        self.assertTrue(ret_evaluation is not None, 'evaluation created')
        self.assertEqual(ret_evaluation['_id'], evaluation, 'Retrieved evaluation consistent')
        ret_model = self.model_service.getModelByID(ret_evaluation['model'])
        self.assertTrue(ret_model is not None, 'evaluation has model')
        self.assertEqual(ret_model['_id'], model, 'evaluation model consistent')
        ret_dataset = self.dataset_service.getDatasetByID(ret_model['dataset'])
        self.assertTrue(ret_dataset is not None, 'model has dataset')
        self.assertEqual(ret_dataset['_id'], dataset, 'model ret_dataset consistent')
        self.evaluation_service.removeEvaluations()
        self.assertEqual(len(self.evaluation_service.retrieveAllEvaluations()), 0, '0 test evaluations present')
        
    def tearDown(self):
        self.evaluation_service.removeEvaluations()
        for d in self.created_models:
            self.model_service.removeModel({'name': 'Test Pima'})
        for d in self.created_datasets:
            self.dataset_service.removeDataset({'name': 'Test Pima'})
  