# -*- coding: utf-8 -*-
"""
Created on Sun Oct 27 14:00:32 2019

@author: Eli
"""

# Import Dependencies ---------------------------------------------------------
print("Importing dependencies...")
import pandas as pd
from keras.models import Sequential
from keras.layers import Dense
from sklearn.model_selection import train_test_split
from sklearn import preprocessing

# Import Data -----------------------------------------------------------------
print("Importing data...")
df = pd.read_csv (r'C:\Users\Eli\Desktop\Python\sales_week_anon_201909241613.csv')

# Format Data -----------------------------------------------------------------
print("Formating data...")

# turns all strings into dummy variables
encodableColumn = 0
columnsToEncode = []
for column in df.columns:
    if (type(df[column][0]) == str):
        encodableColumn += 1
        columnsToEncode.append(column)
if (encodableColumn):
    df = pd.get_dummies(df, prefix_sep="__", columns=columnsToEncode)

# define x and y
x = df.drop('units_sold', axis=1)
y = df['units_sold']

min_max_scaler = preprocessing.MinMaxScaler()
x_scale = min_max_scaler.fit_transform(x)

X_train, X_val_and_test, Y_train, Y_val_and_test = train_test_split(x_scale, y, test_size=0.3)
X_val, X_test, Y_val, Y_test = train_test_split(X_val_and_test, Y_val_and_test, test_size=0.5)

# change this so that it works with anything
model = Sequential([
    Dense(32, activation='relu', input_shape=(47,)), #CHANGE THIS VARIABLE IF YOU DROP THINGS
    Dense(32, activation='relu'),
    Dense(32, activation='relu'),
    Dense(32, activation='relu'),
    Dense(32, activation='relu'),
    Dense(32, activation='relu'),
    Dense(32, activation='relu'),
    Dense(1, activation='sigmoid')
])
    
# Training network ------------------------------------------------------------
print("Training network...")

model.compile(optimizer='sgd',
          loss='binary_crossentropy',
          metrics=['accuracy'])

train = model.fit(X_train, Y_train,
          batch_size=32, epochs=10,
          validation_data=(X_val, Y_val))

print("model is {}% accurate!".format(model.evaluate(X_test, Y_test)[1]))
