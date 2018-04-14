import os
import pprint
import pandas
import numpy as np
from pymongo import MongoClient
import gridfs

from keras_evaluator import KerasEvaluator
from keras.models import load_model
from sklearn.externals import joblib
from evaluation_service import evaluation_service
from model_service import model_service
from dataset_service import dataset_service
from settings import MONGO_HOST, MONGO_PORT, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DBNAME, WORKER_ID, SLEEP_TIME, DEPLOY_DIRECTORY
import time, sys, os, traceback

from sklearn.pipeline import Pipeline

class Worker (object):
    """Object which processes OPEN evaluations from the DB and writes back results"""

    def __init__(self, mongo_uri=None, db=None, worker_id=None, client=None):
        self.serviceURL = os.environ.get('SERVICE_URL', None)
        self.worker_id = worker_id
        self.mongo_uri = mongo_uri
        if client:
            self.client = client
        else:
            self.client = MongoClient(mongo_uri)
        self.evaluation_service = evaluation_service(client=self.client, db=db, worker_id=worker_id)
        self.model_service = model_service(db=db, client=self.evaluation_service.client)
        self.dataset_service = dataset_service(db=db, client=self.evaluation_service.client)
        # gridFS setup
        self.db = self.client[db]
        self.fs = gridfs.GridFS(self.db)
    
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
        # self.deploy = self.model_service.retrieveRequestedDeploy()
        # if self.deploy:
        #     print (self.deploy)
            
    def process_current_evaluation(self):
        """Process the current evaluation"""
        try:
            print ("Processing evaluation: {}".format(self.evaluation['_id']))
            self.model = self.evaluation['model_ref']
            self.dataset = self.dataset_service.getDatasetByID(self.model['dataset'])
            self.keras_evaluator = KerasEvaluator(self.dataset, self.model, self.evaluation)#, gridfs=self.fs, model_service=self.model_service)
            evaluated_model = self.keras_evaluator.build_and_evaluate_new_model()
            print 'model evaluated'
            self.saveModel(evaluated_model)
            if len(self.keras_evaluator.errors) > 0:
                self.handle_errored_evaluation(self.keras_evaluator.errors)
            else:
                self.handle_successful_evaluation()
        except Exception as e:
            type_, value_, traceback_ = sys.exc_info()
            ex = traceback.format_exception(type_, value_, traceback_)
            print (ex)
            self.handle_errored_evaluation(ex)
    
    def saveModel(self, evaluated_model):
        """write back the h5 file to the DB"""
        print 'saving model'
        if not os.path.exists(DEPLOY_DIRECTORY):
            print 'creating deploy directory'
            os.makedirs(DEPLOY_DIRECTORY)
        model_file_name = str(self.model.get('_id'))+'.h5'
        model_full_path = os.path.join(DEPLOY_DIRECTORY, model_file_name)
        print 'saving to file '+ model_full_path
        evaluated_model.save(model_full_path)
        try:
            # save weights to gridfs
            f = open(model_full_path, 'r')
            fileId = self.fs.put(f)
            print self.model
            print self.model['_id']
            print {'$set': {'serviceURL': self.serviceURL, 'pathToHDF5': model_full_path, 'deployID': fileId}}
            res = self.model_service.updateModel(self.model, {'$set': {'serviceURL': self.serviceURL, 'pathToHDF5': model_full_path, 'deployID': fileId}})
            print 'model updated'
            print res.raw_result
        except Exception as e:
            print 'error saving file'
            print e
        finally:
            f.close()
    
    def savePipeline(self, pipeline):
        # Save the Keras model first:
        pipeline.named_steps['keras_model'].model.save('deploys/keras_model.h5')
        
        # This hack allows us to save the sklearn pipeline:
        pipeline.named_steps['keras_model'].model = None
        
        # Finally, save the pipeline:
        joblib.dump(pipeline, 'deploys/sklearn_pipeline.pkl')
    
    def saveWeightsJson(self, evaluated_model):
        ###
        ##  write back the h5 file and json separately
        ###
        if not os.path.exists(DEPLOY_DIRECTORY):
            os.makedirs(DEPLOY_DIRECTORY)
        model_file_name = str(self.model.get('_id'))+'.h5'
        model_full_path = os.path.join(DEPLOY_DIRECTORY, model_file_name)
        json_file_name = str(self.model.get('_id'))+'.json'
        json_full_path = os.path.join(DEPLOY_DIRECTORY, json_file_name)
        # evaluated_model.save(model_full_path)
        
        # save architecture
        model_json = evaluated_model.to_json()
        with open(json_full_path, "w") as json_file:
            json_file.write(model_json)
        # save weights
        evaluated_model.save_weights(model_full_path)
        
        try:
            # save weights to gridfs
            f = open(model_full_path, 'r')
            fileId = self.fs.put(f)
            # save architecture to gridfs
            f_json = open(json_full_path, 'r')
            fileId_json = self.fs.put(f_json)
            self.model_service.updateModel(self.model, {'$set': {'serviceURL': self.serviceURL, 'pathToHDF5': model_full_path, 'deployID': fileId, 'jsonFileID': fileId_json}})
        finally:
            f.close()
    
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
        
    def predictFromModel(self, modelID, input_data, input_columns):
        """Return a prediction for modelID"""
        print modelID, input_data, input_columns
        
        # setup input data
        if not isinstance(input_data, list):
            input_data = [input_data]
        df = pandas.DataFrame(input_data)[input_columns]
        X = df.as_matrix().astype(np.float)
        
        if not os.path.exists(DEPLOY_DIRECTORY):
            os.makedirs(DEPLOY_DIRECTORY)
        model_file_name = str(modelID)+'.h5'
        model_full_path = os.path.join(DEPLOY_DIRECTORY, model_file_name)
        # json_file_name = str(modelID)+'.json'
        # json_full_path = os.path.join(DEPLOY_DIRECTORY, json_file_name)
        if not os.path.isfile(model_full_path):
            print 'loading model from gridfs'
            model_ref = self.model_service.getModelByID(ObjectId(modelID))
            # load and save weights
            grid_out = self.fs.get(model_ref.get('deployID'))
            f = open(model_full_path, 'w')
            f.write(grid_out.read())
            f.close()
            # load and save json
            # grid_out = self.fs.get(model_ref.get('jsonFileID'))
            # f = open(json_full_path, 'w')
            # f.write(grid_out.read())
            f.close()
        else:
            print 'loading model from file'
        
        # load json and create model
        # json_file = open(json_full_path, 'r')
        # loaded_model_json = json_file.read()
        # json_file.close()
        # model = model_from_json(loaded_model_json)
        # # load weights into new model
        # model.load_weights(model_full_path)
        
        model = load_model(model_full_path)
        model._make_predict_function()
        predictions = model.predict(X)
        return predictions

            
if __name__ == '__main__':
    mongo_uri = os.environ.get('MONGOLAB_URI', "mongodb://{username}:{password}@{host}:{port}/{database}".format(
            username=MONGO_USERNAME, password=MONGO_PASSWORD, host=MONGO_HOST, port=MONGO_PORT, database=MONGO_DBNAME))
    print ("starting against "+mongo_uri)
    worker = Worker(mongo_uri=mongo_uri, db=os.environ.get('MONGO_DBNAME', MONGO_DBNAME), worker_id=WORKER_ID)
    worker.run_once()