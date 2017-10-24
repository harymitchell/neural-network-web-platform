import pprint
from settings import MONGO_HOST, MONGO_PORT, MONGO_USERNAME, MONGO_PASSWORD
from evaluationService import EvaluationService

if __name__ == '__main__':

    # mongo_uri = "mongodb://{username}:{password}@{host}:{port}/notifications".format(
    mongo_uri = "mongodb://{host}:{port}/myapp".format(
            username=MONGO_USERNAME, password=MONGO_PASSWORD, host=MONGO_HOST, port=MONGO_PORT)

    evaluationService = EvaluationService(mongo_uri, 'myapp', "test_worker_id")
    evaluation = evaluationService.retrieveEvaluation()
    pprint.pprint(evaluation)
    pprint.pprint(evaluationService.updateEvaluation(evaluation, {'$set': {'status': 'NEW'}}))
    evaluationService.clearEvaluations()