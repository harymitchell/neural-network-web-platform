import os  

from flask import Flask, request, json, jsonify

import threading
from multiprocessing import Queue

from MLWorker import worker
from MLWorker.settings import MONGO_HOST, MONGO_PORT, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DBNAME, WORKER_ID, SLEEP_TIME

import traceback

app = Flask(__name__)

in_queue = Queue()
out_queue = Queue()
 
mongo_uri = os.environ.get('MONGOLAB_URI', "mongodb://{username}:{password}@{host}:{port}/{database}".format(
        username=MONGO_USERNAME, password=MONGO_PASSWORD, host=MONGO_HOST, port=MONGO_PORT, database=MONGO_DBNAME))
        
@app.route("/")
def hello():
    # in_queue.put(({'message':'hello'}, 333))
    # while True:
    #     got = out_queue.get()
    #     if got:
    #         print got
    #         break
    return "404 not found"
    
@app.route("/predict/<modelID>", methods=['POST'])
def predict(modelID):
    """Data should contain input_data and input_columns"""
    req_data = request.get_json()
    print req_data
    if req_data and req_data.get('input_data') and req_data.get('input_columns'):
        w = worker.Worker(mongo_uri=mongo_uri, db=os.environ.get('MONGO_DBNAME', MONGO_DBNAME), worker_id=WORKER_ID)
        try:
            # prediction = w.predictFromModel(modelID, req_data.get('input_data'), req_data.get('input_columns'))
            # prediction = w.predictFromModel('59ee371ca2a8fe3a182319d9', [{u'field2': u'3.5', u'field3': u'1.4', u'field1': u'5.1', u'field4': u'0.2'}], [u'field1', u'field2', u'field3', u'field4'])
            in_queue.put((modelID, req_data.get('input_data'), req_data.get('input_columns')))
            while True:
                result = out_queue.get()
                if result:
                    if 'prediction' in result:
                        print result.get('prediction').tolist()
                        return jsonify(
                            prediction=result.get('prediction').tolist(),
                        )
                    elif 'error' in result:
                        print result.get('error')
                        return str(result.get('error')), 500
        except Exception as e:
            print e
            traceback.print_exc()
            return str(e), 500
    return 'invalid request', 500
 
def runWorker(in_q, out_q):
    print ("starting against "+mongo_uri)
    w = worker.Worker(mongo_uri=mongo_uri, db=os.environ.get('MONGO_DBNAME', MONGO_DBNAME), worker_id=WORKER_ID)
    w.run(in_q=in_q, out_q=out_q)
 
if __name__ == "__main__":
    t = threading.Thread(target=runWorker, args=(in_queue, out_queue))
    t.daemon = True
    print ("*** about to start worker ***")
    t.start()
    
    port = int(os.environ.get('PORT', 5000)) 
    app.run(host='0.0.0.0', port=port)