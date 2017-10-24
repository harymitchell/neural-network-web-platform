from pymongo import MongoClient
from settings import MONGO_HOST, MONGO_PORT, MONGO_USERNAME, MONGO_PASSWORD
import pprint

class EvaluationService (object):
    """Service which connects to Evaluations via MongoDB"""

    def __init__(self, mongo_uri, db, worker_id):
        self.worker_id = worker_id
        self.client = MongoClient(mongo_uri)
        self.db = self.client[db]

    def retrieveEvaluation(self):
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

    def clearEvaluations(self):
        """Clears open evaluation for this worker"""
        for evaluation in self.db.evaluations.find({'status':'PENDING', 'worker': self.worker_id}):
            self.db.evaluations.update_one(
                {'_id': evaluation["_id"]},
                {'$set': {'worker': None, 'status': 'NEW'}}, 
                upsert=False)
                
    def updateEvaluation(self, evaluation, set_obj):
        """Updates the given evaluation"""
        return self.db.evaluations.update_one(
            {'_id': evaluation["_id"]}, set_obj, 
            upsert=False)

# if __name__ == '__main__':
#     # mongo_uri = "mongodb://{username}:{password}@{host}:{port}/notifications".format(
#     mongo_uri = "mongodb://{host}:{port}/myapp".format(
#             username=MONGO_USERNAME, password=MONGO_PASSWORD, host=MONGO_HOST, port=MONGO_PORT)

#     evaluationService = EvaluationService(mongo_uri, 'myapp', "test_worker_id")
#     evaluation = evaluationService.retrieveEvaluation()
#     pprint.pprint(evaluation)
#     pprint.pprint(evaluationService.updateEvaluation(evaluation, {'$set': {'status': 'NEW'}}))
#     evaluationService.clearEvaluations()



""" NOTES
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
db = client.myapp
for item in db.evaluations.find():
    print item

"""