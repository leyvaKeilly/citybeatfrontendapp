import psycopg2
import pandas as pd
import numpy as np
from sqlalchemy import create_engine

#enter the unique user id that the model will train on
uids = {1:'abc123',2:'cgb456',3:'brc789',4:'nsk579'}
uid = uids[2]

dbusername = 'username'
password = 'password'
host = '127.0.0.1'
port = '5432'
database = 'AIData'

engine = create_engine("postgresql+psycopg2://{user}:{pw}@localhost/{db}"
                       .format(user=dbusername,
                               pw=password,
                               db=database))

sql_categories = """select vid,primary_category,sub_category,sub_sub_category
from videolibrary"""

sql_user_time_watched = """select amount_of_time_watched, videolibrary.length, userinteractions.vid 
from userinteractions, videolibrary, userinfo 
where userinteractions.vid = videolibrary.vid and userinfo.uid = userinteractions.uid
and userinfo.uid = '{uid}'""".format(uid=uid)

sql_vid_num_views = """select videolibrary.vid, count(distinct userinteractions.uid) as num_distinct_views
from userinteractions, videolibrary
where userinteractions.vid = videolibrary.vid
group by videolibrary.vid"""

sql_num_users = """select count(userinfo.uid) as num_users
from userinfo"""

sql_vid_num_selected = """select videolibrary.vid, count(distinct userinteractions.uid) as num_selected 
from userinteractions, videolibrary
where userinteractions.vid = videolibrary.vid 
and userinteractions.vid_selected = true
group by videolibrary.vid"""

sql_vid_avg_time_watched = """select videolibrary.vid,videolibrary.length, avg(userinteractions.amount_of_time_watched) as vid_avg_time_watched
from userinteractions, videolibrary
where userinteractions.vid = videolibrary.vid
group by videolibrary.vid"""

sql_vid_avg_interaction_span = """select avg(date_watched - release_date) as vid_avg_interaction_span_days, userinteractions.vid 
from userinteractions, videolibrary, userinfo 
where userinteractions.vid = videolibrary.vid
group by userinteractions.vid"""

#function to be used on columns to strip whitespace
def rstrip(string):
    if string is None:
        return(None)
    else:
        return(string.rstrip())

#function used to change day format to integer number of days
#based on data format returned from sql query
def stripdays(string):
    string = str(string)
    index = string.find('day')
    if index == -1:
        index2 = string.find(':')
        return(int(string[:index2])/24)
    else:
        return(int(string[:index]))

#integer value of number of users. used in later calculations
num_users = pd.read_sql_query(sql_num_users,con=engine)
num_users = int(num_users['num_users'].iloc[0])

#table of the video ids that the specified user has watched/skipped
user_time_watched_ratio = pd.read_sql_query(sql_user_time_watched,con=engine)
user_time_watched_ratio['if_watched'] = np.where(user_time_watched_ratio['amount_of_time_watched']/user_time_watched_ratio['length'] > .75, 1,0)

#table of the categories for all videos in the videolibrary
categories = pd.read_sql_query(sql_categories,con=engine)
categories['primary_category'] = categories['primary_category'].apply(rstrip)
categories['sub_category'] = categories['sub_category'].apply(rstrip)
categories['sub_sub_category'] = categories['sub_sub_category'].apply(rstrip)

#table of videos with the ratio of number of unique views to total number of users
vid_num_views = pd.read_sql_query(sql_vid_num_views,con=engine)
vid_num_views['vid_user_watched_ratio'] = vid_num_views['num_distinct_views']/num_users

#table of videos with the count of how many times it has been selected, used later for other table calculations 
vid_num_selected = pd.read_sql_query(sql_vid_num_selected,con=engine)

#table of videos with the ratio of number of times video has been selected to number of unique views,
#merged with the vid_num_views table from above
vid_view_info = pd.merge(vid_num_views,vid_num_selected,how='outer',on='vid')
vid_view_info = vid_view_info.fillna(value=0)
vid_view_info['vid_user_selected_watch_ratio'] = np.where(vid_view_info['num_distinct_views'] > 0,vid_view_info['num_selected']/vid_view_info['num_distinct_views'],0)

#table of the average amount of time in seconds that the video has been watched
vid_avg_time_watched = pd.read_sql_query(sql_vid_avg_time_watched,con=engine)
vid_avg_time_watched['vid_avg_time_watched_ratio'] = vid_avg_time_watched['vid_avg_time_watched']/vid_avg_time_watched['length']

#table of the average length of time that has passed since users watched the video and since the video was released
vid_avg_interaction_span = pd.read_sql_query(sql_vid_avg_interaction_span,con=engine)
vid_avg_interaction_span['vid_avg_interaction_span_days'] = vid_avg_interaction_span['vid_avg_interaction_span_days'].apply(stripdays)

#merges the tables together by vid to form one large table, vidfeatures
#vidfeatures is a table of the entire videolibrary with the previously calculated columns
vidfeatures = pd.merge(categories,vid_view_info,how='outer',on='vid')
vidfeatures = pd.merge(vidfeatures,vid_avg_time_watched,how='outer',on='vid')
vidfeatures = pd.merge(vidfeatures,vid_avg_interaction_span,how='outer',on='vid')
vidfeatures = vidfeatures.fillna(value=0)
vidfeatures = pd.get_dummies(vidfeatures,columns=['primary_category','sub_category','sub_sub_category'])
vidfeatures = vidfeatures.drop(['num_distinct_views','num_selected','length','vid_avg_time_watched'],axis=1)

#subsection of the vidfeatures table of the videos that ONLY the specified user has watched/skipped
#also contains the dependent variable, time_watched
ttuserint = pd.merge(vidfeatures,user_time_watched_ratio,how='inner',on='vid').drop(['amount_of_time_watched','length'],axis=1)

#this is the subset of the vidfeatures table of the videos that we want to run through the trained model
#to get our list of probabilities that the selected user will watch each video
keys = list(ttuserint.vid.values)
vidfeatures = vidfeatures[~vidfeatures.vid.isin(keys)]

ttuserint = ttuserint.drop('vid',axis=1) #final table. use this to test/train the model

#return list of probabilities that this user will want to watch that corresponding video
def implementLogisticRegression(ttuserint,vidfeatures):    
    from sklearn.linear_model import LogisticRegression

    y = ttuserint['if_watched']
    features = list(set(ttuserint.columns) - set(['if_watched']))
    X = ttuserint[features]
    model = LogisticRegression(solver='liblinear').fit(X,y)
    
    #uncomment checkAccuracy to check information on model accuracy
    #checkAccuracy(X,y,5,'logreg')
    
    vids = np.array(vidfeatures['vid'])
    vids_prob = model.predict_proba(vidfeatures.drop('vid',axis=1))[:,1]
    return(sorted(zip(vids_prob,vids), reverse=True))

#knn ml model
def runKNN(ttuserint, vidfeatures):
    from sklearn.neighbors import KNeighborsClassifier
    
    y = ttuserint['if_watched']
    features = list(set(ttuserint.columns) - set(['if_watched']))
    X = ttuserint[features]
    
    #uncomment checkAccuracy to check information on model accuracy
    #checkAccuracy(X,y,5,'knn')
    model = KNeighborsClassifier(n_neighbors = 3, weights = 'uniform', metric = 'minkowski').fit(X,y)
    vids = np.array(vidfeatures['vid'])
    vids_prob = model.predict_proba(vidfeatures.drop('vid',axis=1))[:,1]
    return(sorted(zip(vids_prob,vids), reverse=True))
  
#returns the F1 score and results from confusion matrix. 
#The F1 score is define as follows: F1 = 2 * (precision * recall) / (precision + recall)
def checkAccuracy(X, y, numsplits, modelSelection):
    from sklearn.model_selection import KFold
    from sklearn.metrics import f1_score
    from sklearn.metrics import confusion_matrix

    kf = KFold(n_splits = numsplits)
    f1_scores = []
    conf_matrices = []
    sample_size = 0
    final_conf_matrix = [[0,0],[0,0]]
    for train_index, test_index in kf.split(X):
        X_train, X_test = X.iloc[train_index], X.iloc[test_index]
        y_train, y_test = y.iloc[train_index], y.iloc[test_index]
        if modelSelection == 'logreg':
            from sklearn.linear_model import LogisticRegression
            model = LogisticRegression(solver='liblinear').fit(X_train,y_train)
            y_pred = model.predict(X_test)
            f1_scores.append(f1_score(y_test, y_pred, average='weighted'))
            conf_matrices.append(confusion_matrix(y_test, y_pred))
        elif modelSelection == 'knn':
            from sklearn.neighbors import KNeighborsClassifier
            model = KNeighborsClassifier(n_neighbors = 3, weights = 'uniform', metric = 'minkowski').fit(X,y)
            y_pred = model.predict(X_test)
            f1_scores.append(f1_score(y_test, y_pred, average='weighted'))
            conf_matrices.append(confusion_matrix(y_test, y_pred))
    avg_f1_scores = sum(f1_scores)/len(f1_scores)

    for m in conf_matrices:
        if len(m) == 1:
            sample_size = sample_size + m[0][0]
            final_conf_matrix[0][0] += m[0][0]
        else:
            sample_size = sample_size + m[0][0] + m[0][1] + m[1][0] + m[1][1]
            final_conf_matrix[0][0] += m[0][0]
            final_conf_matrix[0][1] += m[0][1]
            final_conf_matrix[1][0] += m[1][0]
            final_conf_matrix[1][1] += m[1][1]
    print('The F1 score is a value between 0 and 1. The closer to 1, the better the score.')
    print('Average F1 score: '+str(round(avg_f1_scores,4)))
    print()
    print('Normalized confusion matrix results below. Values are between 0 and 1.\nTrue Positive + True Negative = F1 score.\n')
    print('True Positive: '+str(round(final_conf_matrix[0][0]/sample_size,2))+' (model is correct when it says you like video)')
    print('False Positive (model error): '+str(round(final_conf_matrix[0][1]/sample_size,2))+' (model says you like a video when you don\'t)')
    print('True Negative: '+str(round(final_conf_matrix[1][1]/sample_size,2))+' (model is correct when it says you dont like video)')
    print('False Negative (model error): '+str(round(final_conf_matrix[1][0]/sample_size,2))+' (model says you dont like video when you do)')      
    
