import numpy
import pandas
from keras.models import Sequential
from keras.layers import Dense
from keras.wrappers.scikit_learn import KerasRegressor
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import KFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.externals import joblib

seed = 7

# load dataset
dataframe = pandas.read_csv("housing.csv", header=None)
dataset = dataframe.values
# split into input (X) and output (Y) variables
X = dataset[:,0:13]
Y = dataset[:,13]

# define base model
def baseline_model():
	model.add(Dense(13, input_dim=13, kernel_initializer='normal', activation='relu'))
	model.add(Dense(1, kernel_initializer='normal'))
	# Compile model
	model.compile(loss='mean_squared_error', optimizer='adam')
	return model
	
# define the model
def larger_model():
	model.add(Dense(13, input_dim=13, kernel_initializer='normal', activation='relu'))
	model.add(Dense(6, kernel_initializer='normal', activation='relu'))
	model.add(Dense(1, kernel_initializer='normal'))
	# Compile model
	model.compile(loss='mean_squared_error', metrics=['mean_squared_error'], optimizer='adam')
	return model

# define wider model
def wider_model():
	model.add(Dense(20, input_dim=13, kernel_initializer='random_normal', activation='relu'))
	model.add(Dense(1, kernel_initializer='random_normal'))
	# Compile model
	model.compile(loss='mean_squared_error', optimizer='adam')
# 	print (model.to_json())
	return model
	
# fix random seed for reproducibility
seed = 7
numpy.random.seed(seed)

# evaluate model with standardized dataset
# estimator = KerasRegressor(build_fn=wider_model, nb_epoch=100, batch_size=5, verbose=0)
# kfold = KFold(n_splits=10, random_state=seed)
 
# evaluate model with standardized dataset
estimators = []
estimators.append(('standardize foo', StandardScaler()))
estimators.append(('mlp foo', KerasRegressor(build_fn=wider_model, epochs=2, batch_size=5, verbose=0)))
pipeline = Pipeline(estimators)
# print (estimators)
# print ((wider_model, 100, 5, 0))
kfold = KFold(n_splits=2, shuffle=True, random_state=seed)
results = cross_val_score(pipeline, X, Y, cv=kfold)

print (results)
print("Standardized: %.2f (%.2f) MSE" % (results.mean(), results.std()))


# serialize model to JSON
model_json = model.to_json()
with open("saved/model.json", "w") as json_file:
    json_file.write(model_json)
# serialize weights to HDF5
model.save_weights("saved/model.h5")
print("Saved model to disk")


# SAVE MODEL
# estimator.save('keras_model.h5')

# # This hack allows us to save the sklearn pipeline:
# pipeline.named_steps['keras_model'].model = None

# # Finally, save the pipeline:
# joblib.dump(estimator, 'estimator.pkl')
# joblib.dump(pipeline, 'sklearn_pipeline.pkl')