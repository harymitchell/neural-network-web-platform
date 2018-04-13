import os  
from MLWorker import worker
from MLWorker.settings import MONGO_HOST, MONGO_PORT, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DBNAME, WORKER_ID, SLEEP_TIME

mongo_uri = os.environ.get('MONGOLAB_URI', "mongodb://{username}:{password}@{host}:{port}/{database}".format(
        username=MONGO_USERNAME, password=MONGO_PASSWORD, host=MONGO_HOST, port=MONGO_PORT, database=MONGO_DBNAME))
 
def runWorker():
    print ("starting against "+mongo_uri)
    w = worker.Worker(mongo_uri=mongo_uri, db=os.environ.get('MONGO_DBNAME', MONGO_DBNAME), worker_id=WORKER_ID)
    w.run()
 
if __name__ == "__main__":
    runWorker()
    