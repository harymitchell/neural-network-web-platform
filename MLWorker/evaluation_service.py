from pymongo import MongoClient
from settings import TEST_MONGO_HOST, TEST_MONGO_PORT, TEST_MONGO_USERNAME, TEST_MONGO_PASSWORD
import pprint

class evaluation_service (object):
    """Service which connects to Evaluations via MongoDB"""

    def __init__(self, mongo_uri=None, db=None, worker_id=None, client=None):
        if client:
            self.client = client
        else:
            self.client = MongoClient(mongo_uri)
        self.worker_id = worker_id
        self.db = self.client[db]

    def retrieveOpenEvaluation(self):
        """Claims an open evaluation from the DB
            returns the evaluation object, once claim verified"""
        result = None
        for evaluation in self.db.evaluations.find({'status':'NEW'}):
            self.db.evaluations.update_one(
                {'_id': evaluation["_id"]},
                {'$set': {'worker': self.worker_id, 'status': 'PENDING'}}, 
                upsert=False)
            result = self.db.evaluations.find_one({'_id': evaluation["_id"]})
            if result["worker"] == self.worker_id and result["status"] == 'PENDING':
                break
        return result

    def retrieveAllEvaluations(self):
        """Returns all evaluations for worker"""
        result = []
        for evaluation in self.db.evaluations.find({'worker': self.worker_id}):
            result.append(evaluation)
        return result

    def getEvaluationByID(self, identifier):
        return self.db.evaluations.find_one({'_id': identifier})

    def clearEvaluations(self):
        """Clears open evaluations for this worker
            sets worker to None 
            sets status to NEW"""
        for evaluation in self.db.evaluations.find({'worker': self.worker_id}):
            self.db.evaluations.update_one(
                {'_id': evaluation["_id"]},
                {'$set': {'worker': None, 'status': 'NEW'}}, 
                upsert=False)

    def removeEvaluations(self):
        """Removes all evaluations for this worker"""
        self.db.evaluations.remove({'worker': self.worker_id})
                
    def updateEvaluation(self, evaluation, set_obj):
        """Updates the given evaluation"""
        return self.db.evaluations.update_one(
            {'_id': evaluation["_id"]}, set_obj, 
            upsert=False)
                
    def insertEvaluation(self, evaluation):
        """Inserts the given evaluation"""
        return self.db.evaluations.insert(evaluation)

# if __name__ == '__main__':
#     # mongo_uri = "mongodb://{username}:{password}@{host}:{port}/notifications".format(
#     mongo_uri = "mongodb://{host}:{port}/myapp".format(
#             username=TEST_MONGO_USERNAME, password=TEST_MONGO_PASSWORD, host=TEST_MONGO_HOST, port=TEST_MONGO_PORT)

#     evaluation_service = evaluation_service(mongo_uri, 'myapp', "test_worker_id")
#     evaluation = evaluation_service.retrieveEvaluation()
#     pprint.pprint(evaluation)
#     pprint.pprint(evaluation_service.updateEvaluation(evaluation, {'$set': {'status': 'NEW'}}))
#     evaluation_service.clearEvaluations()



""" NOTES
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
db = client.myapp
for item in db.evaluations.find():
    print item

"""