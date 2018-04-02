"""
To run: python -m unittest -v test.test_keras_evaluator
"""

import unittest
from keras_evaluator import KerasEvaluator
from evaluation_service import evaluation_service
from model_service import model_service
from dataset_service import dataset_service
from settings import TEST_MONGO_HOST, TEST_MONGO_PORT, TEST_MONGO_USERNAME, TEST_MONGO_PASSWORD, TEST_MONGO_DBNAME
from data import TEST_MODEL, TEST_DATASET, TEST_EVALUATION, TEST_MODEL_IRIS, TEST_DATASET_IRIS, TEST_DATASET_BOSTON, TEST_MODEL_BOSTON, MNIST_TEST_MODEL, LARGE_DATASET_ID
FIT_VERBOSITY=0

class TestKerasEvaluatorMethods(unittest.TestCase):

    def setUp(self):
        self.mongo_uri = "mongodb://{username}:{password}@{host}:{port}/{database}".format(
                username=TEST_MONGO_USERNAME, password=TEST_MONGO_PASSWORD, host=TEST_MONGO_HOST, port=TEST_MONGO_PORT, database=TEST_MONGO_DBNAME)
        self.evaluation_service = evaluation_service(self.mongo_uri, TEST_MONGO_DBNAME, "unit_test_worker_id")
        self.model_service = model_service(db=TEST_MONGO_DBNAME, client=self.evaluation_service.client)
        self.dataset_service = dataset_service(db=TEST_MONGO_DBNAME, client=self.evaluation_service.client)
        self.created_models = []
        self.created_datasets = []

    def test_evaluate_model(self):
        dataset, model, evaluation = self.create_test_evaluation(model_spec=TEST_MODEL, dataset_spec=TEST_DATASET)
        self.keras_evaluator = KerasEvaluator(dataset, model, evaluation)
        self.keras_evaluator.build_and_evaluate_new_model()

    def test_evaluate_model_cross_evaluation(self):
        model_spec = dict(TEST_MODEL)
        model_spec['cross_validation'] = {
          "shuffle": True, 
          "n_splits": 10,
          "validator": "StratifiedKFold"
        }
        dataset, model, evaluation = self.create_test_evaluation(model_spec=model_spec, dataset_spec=TEST_DATASET)
        self.keras_evaluator = KerasEvaluator(dataset, model, evaluation)
        self.keras_evaluator.build_and_evaluate_new_model()
        self.assertEquals(len(self.keras_evaluator.scores), 2)
        self.assertEquals(len(self.keras_evaluator.model.metrics_names), 2)
        self.assertEquals(self.keras_evaluator.model.metrics_names[0], 'accuracy')
        self.assertTrue(.55 < self.keras_evaluator.scores[0])
        
    def test_evaluate_iris(self):
        dataset, model, evaluation = self.create_test_evaluation(model_spec=TEST_MODEL_IRIS, dataset_spec=TEST_DATASET_IRIS)
        self.keras_evaluator = KerasEvaluator(dataset, model, evaluation)
        self.keras_evaluator.build_and_evaluate_new_model()
        print (self.keras_evaluator.model.metrics_names)
        print (self.keras_evaluator.scores)
        self.assertEquals(len(self.keras_evaluator.scores), 2)
        self.assertEquals(len(self.keras_evaluator.model.metrics_names), 2)
        self.assertEquals(self.keras_evaluator.model.metrics_names[0], 'accuracy')
        self.assertEquals(self.keras_evaluator.model.metrics_names[1], 'std_deviation')
        self.assertTrue(.2 < self.keras_evaluator.scores[0])
        
    def test_evaluate_boston(self):
        dataset, model, evaluation = self.create_test_evaluation(model_spec=TEST_MODEL_BOSTON, dataset_spec=TEST_DATASET_BOSTON)
        self.keras_evaluator = KerasEvaluator(dataset, model, evaluation) #, FIT_VERBOSITY=FIT_VERBOSITY
        self.keras_evaluator.build_and_evaluate_new_model()
        print (self.keras_evaluator.model.metrics_names)
        print (self.keras_evaluator.scores)
        self.assertEquals(len(self.keras_evaluator.scores), 2)
        self.assertEquals(len(self.keras_evaluator.model.metrics_names), 2)
        self.assertEquals(self.keras_evaluator.model.metrics_names[0], 'mean_squared_error')
        self.assertEquals(self.keras_evaluator.model.metrics_names[1], 'std_deviation')
        self.assertTrue(11 < self.keras_evaluator.scores[0])
        
    def test_evaluate_mnist(self):
        """Test evaluating MNIST model
            python -m unittest -v test.test_keras_evaluator.TestKerasEvaluatorMethods.test_evaluate_mnist"""
        dataset, model, evaluation = self.create_test_evaluation(model_spec=MNIST_TEST_MODEL, dataset=self.dataset_service.getDatasetByID(LARGE_DATASET_ID).get('_id'))
        self.keras_evaluator = KerasEvaluator(dataset, model, evaluation)
        self.keras_evaluator.build_and_evaluate_new_model()
        print (self.keras_evaluator.model.metrics_names)
        print (self.keras_evaluator.scores)
        self.assertEquals(len(self.keras_evaluator.scores), 2)
        self.assertEquals(len(self.keras_evaluator.model.metrics_names), 2)
        self.assertEquals(self.keras_evaluator.model.metrics_names[0], 'accuracy')
        self.assertEquals(self.keras_evaluator.model.metrics_names[1], 'std_deviation')
        self.assertTrue(.8 < self.keras_evaluator.scores[0])
    
    def create_test_evaluation(self, model_spec=None, dataset_spec=None, dataset=None):
        # Create test data
        if dataset is None:
            dataset = self.dataset_service.insertDataset(dataset_spec)
            self.created_datasets.append(dataset)
        model_spec['dataset'] = dataset
        model = self.model_service.insertModel(model_spec)
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
        return [ret_dataset, ret_model, ret_evaluation]
    
    def tearDown(self):
        self.evaluation_service.removeEvaluations()
        for d in self.created_models:
            self.model_service.removeModel({'name': 'Test Mnist'})
            self.model_service.removeModel({'name': 'Test Pima'})
            self.model_service.removeModel({'name': 'Test Iris'})
            self.model_service.removeModel({'name': 'Boston Housing Test'})
        for d in self.created_datasets:
            self.dataset_service.removeDataset({'name': 'Test Pima'})
            self.dataset_service.removeDataset({'name': 'Test Iris'})
            self.dataset_service.removeDataset({'name': 'Boston Housing Test'})