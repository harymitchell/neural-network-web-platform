import socket

###########################
# Local Mongo
# TEST_MONGO_HOST = 'localhost'
# TEST_MONGO_PORT = 27017

###########################
# MongoLab ds111565.mlab.com:11565/mscs-1
# mongodb://mscs:mscs123@ds111565.mlab.com:11565/mscs-1
MONGO_HOST = 'ds111565.mlab.com'
MONGO_PORT = 11565
MONGO_USERNAME = 'mscs'
MONGO_PASSWORD = 'mscs123'
MONGO_DBNAME = 'mscs-1'
WORKER_ID = "worker-{}".format(socket.gethostname())

###########################
# MongoLab ds111565.mlab.com:11565/mscs-1
# mongodb://<dbuser>:<dbpassword>@ds113505.mlab.com:13505/mscs-testing
TEST_MONGO_HOST = 'ds113505.mlab.com'
TEST_MONGO_PORT = 13505
TEST_MONGO_USERNAME = 'mscs'
TEST_MONGO_PASSWORD = 'mscs123'
TEST_MONGO_DBNAME = 'mscs-testing'
TEST_WORKER_ID = "unit_test_worker_id"

SLEEP_TIME = 15

DEPLOY_DIRECTORY = 'deploys'