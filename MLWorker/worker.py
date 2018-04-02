import os
import pprint
from pymongo import MongoClient
from keras_evaluator import KerasEvaluator
from evaluation_service import evaluation_service
from model_service import model_service
from dataset_service import dataset_service
from settings import MONGO_HOST, MONGO_PORT, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DBNAME, WORKER_ID, SLEEP_TIME
import time, sys, os, traceback

class Worker (object):
    """Object which processes OPEN evaluations from the DB and writes back results"""

    def __init__(self, mongo_uri=None, db=None, worker_id=None, client=None):
        self.worker_id = worker_id
        self.mongo_uri = mongo_uri
        if client:
            self.client = client
        else:
            self.client = MongoClient(mongo_uri)
        self.evaluation_service = evaluation_service(client=self.client, db=db, worker_id=worker_id)
        self.model_service = model_service(db=db, client=self.evaluation_service.client)
        self.dataset_service = dataset_service(db=db, client=self.evaluation_service.client)
    
    def run(self):
        """Run application"""
        print ("starting worker node")
        while True:
            self.run_once()
            time.sleep(SLEEP_TIME)
        
    def run_once(self):
        """Attempt to retrieve a single open evaluation"""
        self.evaluation = self.evaluation_service.retrieveOpenEvaluation()
        if self.evaluation:
            self.process_current_evaluation()
        
            
    def process_current_evaluation(self):
        """Process the current evaluation"""
        try:
            print ("Processing evaluation: {}".format(self.evaluation['_id']))
            self.model = self.evaluation['model_ref']
            self.dataset = self.dataset_service.getDatasetByID(self.model['dataset'])
            self.keras_evaluator = KerasEvaluator(self.dataset, self.model, self.evaluation)
            self.keras_evaluator.build_and_evaluate_new_model()
            if len(self.keras_evaluator.errors) > 0:
                self.handle_errored_evaluation(self.keras_evaluator.errors)
            else:
                self.handle_successful_evaluation()
        except Exception as e:
            type_, value_, traceback_ = sys.exc_info()
            ex = traceback.format_exception(type_, value_, traceback_)
            print (ex)
            self.handle_errored_evaluation(ex)
            
    def handle_successful_evaluation(self):
        """Handles successful evaluation by writing to DB with DONE status and
            metrics"""
        self.evaluation_service.updateEvaluation(self.evaluation, {
            '$set': {
                'status': 'DONE',
                'metrics_names': self.keras_evaluator.model.metrics_names,
                'scores': self.keras_evaluator.scores,
                'model_ref': self.model
            }
        })
            
    def handle_errored_evaluation(self, errors):
        """Handles failure in processing
            write evaluation to DB with FAILED status and errors"""
        self.evaluation_service.updateEvaluation(self.evaluation, {
            '$set': {
                'status': 'FAILED',
                'errors': errors
            }
        })
            
if __name__ == '__main__':
    mongo_uri = os.environ.get('MONGOLAB_URI', "mongodb://{username}:{password}@{host}:{port}/{database}".format(
            username=MONGO_USERNAME, password=MONGO_PASSWORD, host=MONGO_HOST, port=MONGO_PORT, database=MONGO_DBNAME))
    print ("starting against "+mongo_uri)
    worker = Worker(mongo_uri=mongo_uri, db=os.environ.get('MONGO_DBNAME', MONGO_DBNAME), worker_id=WORKER_ID)
    try:
        worker.run()
    except KeyboardInterrupt:
        print '\nInterrupted'
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)