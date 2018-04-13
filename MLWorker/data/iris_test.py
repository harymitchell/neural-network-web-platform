import numpy
import pandas
from keras.models import Sequential
from keras.layers import Dense
from keras.wrappers.scikit_learn import KerasClassifier
from keras.utils import np_utils
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import KFold
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.externals import joblib

# fix random seed for reproducibility
seed = 7
numpy.random.seed(seed)

# load dataset
dataframe = pandas.read_csv("iris.csv", header=None)
dataset = dataframe.values
X = dataset[:,0:4].astype(float)
Y = dataset[:,4]

# encode class values as integers
encoder = LabelEncoder()
encoder.fit(Y)
encoded_Y = encoder.transform(Y)
# convert integers to dummy variables (i.e. one hot encoded)
dummy_y = np_utils.to_categorical(encoded_Y)

print (X.shape)
print (dummy_y.shape)
print (type(X.shape))
print (type(dummy_y.shape))


# model = Sequential()

models = []
	
# define baseline model
def baseline_model():
	model = Sequential()
	models.append(model)
	# create model
	model.add(Dense(8, input_dim=4, activation='relu'))
	model.add(Dense(3, activation='softmax'))
	# Compile model
	model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
	return model
 
estimator = KerasClassifier(build_fn=baseline_model, epochs=2, batch_size=5, verbose=1)

# evaluate model with standardized dataset
estimators = []
estimators.append(('standardize foo', StandardScaler()))
estimators.append(('mlp foo', estimator))
pipeline = Pipeline(estimators)

kfold = KFold(n_splits=2, shuffle=True, random_state=seed)

results = cross_val_score(pipeline, X, dummy_y, cv=kfold)
print("Baseline: %.2f%% (%.2f%%)" % (results.mean()*100, results.std()*100))

# for i, m in enumerate(models):
# 	print 'model '+str(i)
# 	print m.to_json()
# 	model_json = m.to_json()
# 	with open("saved/model"+str(i)+".json", "w") as json_file:
# 	    json_file.write(model_json)
# 	# serialize weights to HDF5
# 	m.save_weights("saved/weights"+str(i)+".h5")
# 	m.save("saved/model"+str(i)+".h5")

# print estimator
# print estimator.build_fn 
# print estimator.model

for m in models:
	for layer in m.layers: print(layer.get_config(), layer.get_weights()[0])
	print ('**********')

# serialize model to JSON
model = models[len(models)-1]
model_json = model.to_json()
with open("saved/model.json", "w") as json_file:
    json_file.write(model_json)
# serialize weights to HDF5
model.save_weights("saved/weights.h5")
model.save("saved/model.h5")
print("Saved model to disk")


# SAVE MODEL
# estimator.save('keras_model.h5')

# # This hack allows us to save the sklearn pipeline:
# pipeline.named_steps['keras_model'].model = None

# # Finally, save the pipeline:
# joblib.dump(estimator, 'estimator.pkl')
# joblib.dump(pipeline, 'sklearn_pipeline.pkl')
