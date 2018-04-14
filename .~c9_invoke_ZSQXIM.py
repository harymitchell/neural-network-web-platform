import os  

from flask import Flask, request, json, jsonify

import threading
from MLWorker import worker
from MLWorker.settings import MONGO_HOST, MONGO_PORT, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DBNAME, WORKER_ID, SLEEP_TIME

app = Flask(__name__)
 
mongo_uri = os.environ.get('MONGOLAB_URI', "mongodb://{username}:{password}@{host}:{port}/{database}".format(
        username=MONGO_USERNAME, password=MONGO_PASSWORD, host=MONGO_HOST, port=MONGO_PORT, database=MONGO_DBNAME))
        
@app.route("/")
def hello():
    return "404 not found"
    
@app.route("/predict/<modelID>", methods=['POST'])
def predict(modelID):
    """Data should contain input_data and input_columns"""
    req_data = request.get_json()
    print req_data
    if req_data and req_data.get('input_data') and req_data.get('input_columns'):
        w = worker.Worker(mongo_uri=mongo_uri, db=os.environ.get('MONGO_DBNAME', MONGO_DBNAME), worker_id=WORKER_ID)
        try:
            prediction = w.predictFromModel(modelID, req_data.get('input_data'), req_data.get('input_columns'))
            # prediction = w.predictFromModel('59ee371ca2a8fe3a182319d9', [{u'field2': u'3.5', u'field3': u'1.4', u'field1': u'5.1', u'field4': u'0.2'}], [u'field1', u'field2', u'field3', u'field4'])
            print prediction.tolist()
            return jsonify(
                prediction=prediction.tolist(),
            )
        except Exception as e:
            print e
            return str(e), 500
    return 'invalid request', 500
 
def runWorker():
    print ("starting against "+mongo_uri)
    w = worker.Worker(mongo_uri=mongo_uri, db=os.environ.get('MONGO_DBNAME', MONGO_DBNAME), worker_id=WORKER_ID)
    w.run()
 
if __name__ == "__main__":
    t = threading.Thread(target=runWorker)
    t.daemon = True
    print ("*** about to start worker ***")
    t.start()
    
    port = int(os.environ.get('PORT', 5000)) 
    app.run(host='0.0.0.0', port=port)






































