import numpy as np
from numpy import ma
import pandas

from keras.models import Sequential
from keras.layers import Dense
from keras.wrappers.scikit_learn import KerasClassifier, KerasRegressor
from keras.utils import np_utils

from sklearn.model_selection import StratifiedKFold, KFold
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import Normalizer

import numpy
numpy.random.seed(7)
seed = 7

class KerasEvaluator():
    """Class handles the construction of Keras models
    
        load dataset
        split into input (X) and output (Y) variables
        create model
        Compile model
        Fit the model
        evaluate the model"""
    
    def __init__(self, dataset, model, evaluation, FIT_VERBOSITY=1):
        """Creates a new Keras model from given dataset, model, and evaluation"""
        # print ("Creating Keras model from spec: \ndataset: {}\nmodel:{}\neval:{}".format(dataset, model, evaluation))
        self.model_spec = model
        self.dataset_spec = dataset
        self.evaluation_spec = evaluation
        self.X = None
        self.Y = None
        self.scores = None
        self.errors = []
        self.FIT_VERBOSITY = FIT_VERBOSITY
    
    def build_and_evaluate_new_model(self):
        self.initializeData()
        print self.X.shape
        print self.Y.shape
        if ('cross_validation' in self.model_spec and self.kFoldFunction(self.model_spec['cross_validation']['validator'])):
            # Use scikit_learn for cross validation
            print ('Using scikit_learn')
            
            # Determine wrapper
            if self.model_spec['modelType'] == "Regression":
                wrapper = KerasRegressor
            elif self.model_spec['modelType'] == "Classification":
                self.model_spec['metrics'] = 'accuracy' # must must accuracy
                wrapper = KerasClassifier
            else:
                raise Exception("Unsupported modelType: "+self.model_spec['modelType'])
            
            # Build estimator
            estimators = self.initiaze_estimators()
            # last estimator is the keras model
            estimators.append(('keras_model', wrapper(
                    build_fn=self.create_and_compile_model, 
                    epochs=int(self.model_spec['epochs']), 
                    batch_size=int(self.model_spec['batch_size']), 
                    verbose=self.FIT_VERBOSITY)))
            pipeline = Pipeline(estimators)
            kfold = self.kFoldFunction(self.model_spec['cross_validation']['validator'])(
                n_splits=int(self.model_spec['cross_validation']['n_splits']), 
                shuffle=self.model_spec['cross_validation']['shuffle'], 
                random_state=seed)
            if "one_hot_encode_output" in self.model_spec and self.model_spec['one_hot_encode_output'] == True:
                pass # don't reshape output
            else:
                self.Y = np.reshape(self.Y,[self.Y.shape[0],])
                # print (self.X.shape)
                # print (self.Y.shape)
                # print (type(self.X.shape))
                # print (type(self.Y.shape))
            result = cross_val_score(pipeline, self.X, self.Y, cv=kfold)
            self.scores = [result.mean(), result.std()]
    	    self.model = Sequential() # for consistency
            self.model.metrics_names = [self.model_spec['metrics'], "std_deviation"]
        else:
            # No cross validation (plain keras) 
            # TODO: determine if this should be supported 
            self.create_and_compile_model()
            self.fitModel()
            self.evaluateModel()
        
        # print (self.keras_evaluator.scores)
        # print (self.keras_evaluator.model.metrics_names)
        # end build_and_evaluate_new_model
    
    def initiaze_estimators(self):
        """Initializes list of estimators"""
        estimators = []
        if "estimators" in self.model_spec:
            for estimator_spec in self.model_spec['estimators']:
                estimator = self.build_estimator(estimator_spec)
                if estimator:
                    estimators.append(estimator)
        return estimators
        
    def build_estimator(self, estimator_spec):
        """Builds scikit_learn estimator from estimator_spec"""
        if "name" not in estimator_spec:
            return None
        elif estimator_spec["name"] == "StandardScaler":
            return (estimator_spec["name"], StandardScaler())
        elif estimator_spec["name"] == "Normalizer":
            return (estimator_spec["name"], Normalizer())
        else:
            return None
    
    def kFoldFunction(self, validator):
        """Returns scikit_learn kFold function for validator string"""
        if validator == "StratifiedKFold":
            return StratifiedKFold
        elif validator == "KFold":
            return KFold
    
    def initializeData(self):
        """
            model{
              "outputColumns": [
                "field9"
              ],
              "inputColumns": [
                "field1",
                ...
              ]}
            dataset{
              "data": [{
                "field1": "6",
                ...
               },
        
            df = pandas.DataFrame(data)
            numpyMatrix = df.as_matrix().astype(np.float)
        """
        # print (self.model_spec['inputColumns'])
        # print (self.model_spec['outputColumns'])
        # print (self.dataset_spec)
        input_df = pandas.DataFrame(self.dataset_spec['data'])[self.model_spec['inputColumns']]
        output_df = pandas.DataFrame(self.dataset_spec['data'])[self.model_spec['outputColumns']]
        self.X = input_df.as_matrix().astype(np.float)
        col_type = KerasEvaluator.outputColumnType(self.model_spec, self.dataset_spec)
        self.Y = output_df.as_matrix().astype(col_type)
        if "one_hot_encode_output" in self.model_spec and self.model_spec['one_hot_encode_output'] == True:
            print ("will one_hot_encode_output")
            one_hot_encoder = LabelEncoder()
            self.Y = np.reshape(self.Y,[self.Y.shape[0],])
            one_hot_encoder.fit(self.Y)
            one_hot_encoded_Y = one_hot_encoder.transform(self.Y)
            self.Y = np_utils.to_categorical(one_hot_encoded_Y)

    @staticmethod
    def outputColumnType(model_spec, dataset_spec):
        if "columnSpec" in dataset_spec:
            if model_spec['outputColumns'][0] in dataset_spec['columnSpec']:
                cType = dataset_spec['columnSpec'][model_spec['outputColumns'][0]]['dataType']
                print ("cType "+cType)
                if cType == "Number":
                    return np.float
                elif cType == "Boolean":
                    return np.bool_
                else:
                    return '|S10'
            else:
                print("output column not in colspec")
        else:
            print("no colspec provided")
            # none provided, so we can only guess
            return np.float
    
    @staticmethod
    def dataToNumpy(data):
        """Takes array of dict and returns numpy array
            Currently, defaults to convert to float"""
        df = pandas.DataFrame(data)
        numpyMatrix = df.as_matrix()#.astype(np.float)
        return numpyMatrix
    
    def create_and_compile_model(self):
        """Function to create and compile self.model, which also returns 
            self.model, as required for scikit_learn build fn"""
    	# create model
    	self.model = Sequential()
        for idx, layer_spec in enumerate(self.model_spec['layers']):
            # print ("Layer {} spec: {}".format(idx,layer_spec))
            self.model.add(self.newLayerForSpec(layer_spec, idx))
    	self.compileModel()
        # print (self.model.to_json())
    	return self.model

    def newLayerForSpec(self, layer_spec, idx):
        """Returns a new Keras layer for given spec"""
        if layer_spec['layerType'] == "Dense":
            arguments = layer_spec['arguments']
            final_args = {k: v for k, v in {
                'input_dim': len(self.model_spec['inputColumns']) if idx == 0 else None, 
                'bias_constraint': KerasEvaluator.safe_layer_argument(arguments, 'bias_constraint', None), 
                'kernel_constraint': KerasEvaluator.safe_layer_argument(arguments, 'kernel_constraint', None), 
                'activity_regularizer': KerasEvaluator.safe_layer_argument(arguments, 'activity_regularizer', None), 
                'bias_regularizer': KerasEvaluator.safe_layer_argument(arguments, 'bias_regularizer', None), 
                'kernel_regularizer': KerasEvaluator.safe_layer_argument(arguments, 'kernel_regularizer', None), 
                'bias_initializer': KerasEvaluator.safe_layer_argument(arguments, 'bias_initializer', None), 
                'kernel_initializer': KerasEvaluator.safe_layer_argument(arguments, 'kernel_initializer', None), 
                'use_bias': KerasEvaluator.safe_layer_argument(arguments, 'use_bias', 'bool'), 
                'activation': KerasEvaluator.safe_layer_argument(arguments, 'activation', None)
            }.items() if v is not None}
            # print (final_args)
            # print (int(KerasEvaluator.safe_layer_argument(arguments, 'units', 'int')))
            return Dense(int(KerasEvaluator.safe_layer_argument(arguments, 'units', 'int')), **final_args)
        else:
            raise Exception('Unsupported Layer Type: {}'.format(layer_spec['layerType']))
    
    @staticmethod
    def safe_layer_argument(arguments, key, castType):
        """Returns value of arguments at given key cast 
            to type castType if supplied. 'NONE' values 
            are converted to None type."""
        if arguments[key] == 'NONE':
            return None
        elif castType == 'int':
            return int(arguments[key])
        elif castType == 'float':
            return float(arguments[key])
        elif castType == 'bool':
            return bool(arguments[key])
        else:
            return arguments[key]
    
    def numpyFromData(self, data):
        """Converts data from MongoDB object to numpy array"""
        # self.dataset = numpy.loadtxt("pima-indians-diabetes.csv", delimiter=",")
        # self.X = self.dataset[:,0:8]
        # self.Y = self.dataset[:,8]
        pass
    
    def compileModel(self):
        """Compiles model
            self.model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])"""
        args = {k: v for k, v in {
          "optimizer": self.model_spec['optimizer'],
          "metrics": [self.model_spec['metrics']],
          "loss": self.model_spec['loss']
        }.items() if v is not None}
        self.model.compile(**args)
        
    def fitModel(self):
        """Fits model
            self.model.fit(self.X, self.Y, epochs=150, batch_size=10)"""
        args = {k: v for k, v in {
          "batch_size": int(self.model_spec['batch_size']),
          "epochs": int(self.model_spec['epochs']),
          "verbose": self.FIT_VERBOSITY
            }.items() if v is not None}
        self.model.fit(self.X, self.Y, **args)
        
    def evaluateModel(self):
        """Evaluates the fitted model
            print("\n%s: %.2f%%" % (self.model.metrics_names[1], self.scores[1]*100))"""
        self.scores = self.model.evaluate(self.X, self.Y)
