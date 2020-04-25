import pandas as pd
import psycopg2
import numpy as np
from sqlalchemy import create_engine
import random
import warnings
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
import xgboost as xgb
from sklearn.model_selection import KFold
from sklearn import metrics
import json
import os


def aimodel(uid, settings, featureSettings, data):
    warnings.filterwarnings('ignore')

    sql_uids = """select uid from userinfo"""

    sql_categories = """select vid,title,primary_category,sub_category,sub_sub_category, length
    from videolibrary"""

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

    # sql_vid_avg_time_watched = """select videolibrary.vid,videolibrary.length, avg(userinteractions.amount_of_time_watched) as vid_avg_time_watched
    # from userinteractions, videolibrary
    # where userinteractions.vid = videolibrary.vid
    # group by videolibrary.vid"""
    sql_vid_avg_time_watched = """select videolibrary.vid, avg(userinteractions.amount_of_time_watched) as vid_avg_time_watched
    from userinteractions, videolibrary
    where userinteractions.vid = videolibrary.vid
    group by videolibrary.vid"""

    sql_vid_avg_interaction_span = """select avg(date_watched - release_date) as vid_avg_interaction_span_days, userinteractions.vid 
    from userinteractions, videolibrary, userinfo 
    where userinteractions.vid = videolibrary.vid
    group by userinteractions.vid"""

    # function to be used on columns to strip whitespace

    def rstrip(string):
        if string is None:
            return(None)
        else:
            return(string.rstrip())

    # function used to change day format to integer number of days
    # based on data format returned from sql query
    def stripdays(string):
        string = str(string)
        index = string.find('day')
        if index == -1:
            index2 = string.find(':')
            return(int(string[:index2])/24)
        else:
            return(int(string[:index]))

    # used for multilogistic regression
    def partitionClasses(index):
        amt_time_watched = user_time_watched_ratio.loc[index]['amount_of_time_watched']
        vid_length = user_time_watched_ratio.loc[index]['length']
        ratio = amt_time_watched/vid_length
        if (ratio < .25):
            return 0
        elif (ratio < .5):
            return 1
        elif (ratio < .75):
            return 2
        else:
            return 3

    # return list of probabilities that this user will want to watch that corresponding video
    def runLogisticRegression(ttuserint, vidfeatures, settings=settings):
        # ttuserint = ttuserint.drop('if_watched_multi',axis=1)
        y = ttuserint['if_watched']
        features = list(set(ttuserint.columns) - set(['if_watched']))
        X = ttuserint[features]

        if settings['nUserF1Scores'] is True:
            return(checkAccuracy(X, y, settings['numKFolds'], 'logreg'))
        else:
            outputDict = {'f1score': 0, 'tp': 0,
                          'fp': 0, 'tn': 0, 'fn': 0, 'nusers': 1}
            if settings['checkF1Scores'] is True:
                outputDict = checkAccuracy(
                    X, y, settings['numKFolds'], 'logreg')

            model = LogisticRegression(solver='liblinear').fit(X, y)
            vids = np.array(vidfeatures['vid'])
            if settings['showVidTitles'] is True:
                titles = np.array(vidfeatures['title'])
                vids_prob = model.predict_proba(
                    vidfeatures.drop(['vid', 'title'], axis=1))[:, 1]
                outputDict['data'] = sorted(
                    zip(vids_prob.tolist(), vids.tolist(), titles.tolist()), reverse=True)
                return(outputDict)
            else:
                vids_prob = model.predict_proba(
                    vidfeatures.drop(['vid', 'title'], axis=1))[:, 1]
                outputDict['data'] = sorted(
                    zip(vids_prob.tolist(), vids.tolist()), reverse=True)
                return(outputDict)

    def runKNN(ttuserint, vidfeatures, settings=settings):

        # ttuserint = ttuserint.drop('if_watched_multi',axis=1)
        y = ttuserint['if_watched']
        features = list(set(ttuserint.columns) - set(['if_watched']))
        X = ttuserint[features]

        if settings['nUserF1Scores'] is True:
            return(checkAccuracy(X, y, settings['numKFolds'], 'knn'))
        else:
            outputDict = {'f1score': 0, 'tp': 0,
                          'fp': 0, 'tn': 0, 'fn': 0, 'nusers': 1}
            if settings['checkF1Scores'] is True:
                outputDict = checkAccuracy(X, y, settings['numKFolds'], 'knn')

            model = KNeighborsClassifier(
                n_neighbors=3, weights='uniform', metric='minkowski').fit(X, y)
            vids = np.array(vidfeatures['vid'])
            if settings['showVidTitles'] is True:
                titles = np.array(vidfeatures['title'])
                vids_prob = model.predict_proba(
                    vidfeatures.drop(['vid', 'title'], axis=1))[:, 1]
                outputDict['data'] = sorted(
                    zip(vids_prob.tolist(), vids.tolist(), titles.tolist()), reverse=True)
                return(outputDict)
            else:
                vids_prob = model.predict_proba(
                    vidfeatures.drop(['vid', 'title'], axis=1))[:, 1]
                outputDict['data'] = sorted(
                    zip(vids_prob.tolist(), vids.tolist()), reverse=True)
                return(outputDict)

    # likely not the algorithm to use due to binary nature of initial question
    def runMultiLogisticRegression(ttuserint, vidfeatures, settings=settings):

        ttuserint = ttuserint.drop('if_watched', axis=1)
        y = ttuserint['if_watched_multi']
        features = list(set(ttuserint.columns) -
                        set(['if_watched_multi', 'index']))
        X = ttuserint[features]

        if settings['nUserF1Scores'] is True:
            return(checkAccuracy(X, y, settings['numKFolds'], 'multilogreg'))
        else:
            outputDict = {'f1score': 0, 'tp': 0,
                          'fp': 0, 'tn': 0, 'fn': 0, 'nusers': 1}
            if settings['checkF1Scores'] is True:
                outputDict = checkAccuracy(
                    X, y, settings['numKFolds'], 'multilogreg')

            model = LogisticRegression(
                solver='liblinear', multi_class='auto').fit(X, y)
            vids = np.array(vidfeatures['vid'])
            if settings['showVidTitles'] is True:
                titles = np.array(vidfeatures['title'])
                vids_prob = model.predict_proba(
                    vidfeatures.drop(['vid', 'title'], axis=1))[:, 1]
                outputDict['data'] = sorted(
                    zip(vids_prob.tolist(), vids.tolist(), titles.tolist()), reverse=True)
                return(outputDict)
            else:
                vids_prob = model.predict_proba(
                    vidfeatures.drop(['vid', 'title'], axis=1))[:, 1]
                outputDict['data'] = sorted(
                    zip(vids_prob.tolist(), vids.tolist()), reverse=True)
                return(outputDict)

    def runMLP(ttuserint, vidfeatures, settings=settings):

        y = ttuserint['if_watched']
        features = list(set(ttuserint.columns) - set(['if_watched']))
        X = ttuserint[features]

        if settings['nUserF1Scores'] is True:
            return(checkAccuracy(X, y, settings['numKFolds'], 'mlp'))
        else:
            outputDict = {'f1score': 0, 'tp': 0,
                          'fp': 0, 'tn': 0, 'fn': 0, 'nusers': 1}
            if settings['checkF1Scores'] is True:
                outputDict = checkAccuracy(X, y, settings['numKFolds'], 'mlp')

            model = MLPClassifier(
                solver='lbfgs', alpha=1e-5, hidden_layer_sizes=(5, 2), random_state=1).fit(X, y)
            vids = np.array(vidfeatures['vid'])
            if settings['showVidTitles'] is True:
                titles = np.array(vidfeatures['title'])
                vids_prob = model.predict_proba(
                    vidfeatures.drop(['vid', 'title'], axis=1))[:, 1]
                outputDict['data'] = sorted(
                    zip(vids_prob.tolist(), vids.tolist(), titles.tolist()), reverse=True)
                return(outputDict)
            else:
                vids_prob = model.predict_proba(
                    vidfeatures.drop(['vid', 'title'], axis=1))[:, 1]
                outputDict['data'] = sorted(
                    zip(vids_prob.tolist(), vids.tolist()), reverse=True)
                return(outputDict)

    def runXGBoost(ttuserint, vidfeatures, settings=settings):

        # ttuserint = ttuserint.drop('if_watched_multi',axis=1)
        y = ttuserint['if_watched']
        features = list(set(ttuserint.columns) - set(['if_watched']))
        X = ttuserint[features]
        data

        if settings['nUserF1Scores'] is True:
            return(checkAccuracy(X, y, settings['numKFolds'], 'mlp'))
        else:
            outputDict = {'f1score': 0, 'tp': 0,
                          'fp': 0, 'tn': 0, 'fn': 0, 'nusers': 1}
            if settings['checkF1Scores'] is True:
                outputDict = checkAccuracy(
                    X, y, settings['numKFolds'], 'xgboost')

            model = xgb.XGBClassifier(
                learning_rate=0.1,
                n_estimators=1000,
                max_depth=5,
                min_child_weight=1,
                gamma=0,
                subsample=0.8,
                colsample_bytree=0.8,
                objective='binary:logistic',
                nthread=4,
                scale_pos_weight=1)

            model.fit(X.values, y.values, eval_metric='error')
            vids = np.array(vidfeatures['vid'])
            if settings['showVidTitles'] is True:
                titles = np.array(vidfeatures['title'])
                vids_prob = model.predict_proba(
                    vidfeatures.drop(['vid', 'title'], axis=1).values)[:, 1]
                outputDict['data'] = sorted(
                    zip(vids_prob.tolist(), vids.tolist(), titles.tolist()), reverse=True)
                return(outputDict)
            else:
                vids_prob = model.predict_proba(
                    vidfeatures.drop(['vid', 'title'], axis=1).values)[:, 1]
                outputDict['data'] = sorted(
                    zip(vids_prob.tolist(), vids.tolist()), reverse=True)
                return(outputDict)

    # returns the F1 score and results from confusion matrix.
    # The F1 score is define as follows: F1 = 2 * (precision * recall) / (precision + recall)
    def checkAccuracy(X, y, numsplits, modelSelection, settings=settings):

        # global userDefinedFeatures

        kf = KFold(n_splits=numsplits)
        f1_scores = []
        conf_matrices = []
        sample_size = 0
        final_conf_matrix = [[0, 0], [0, 0]]
        for train_index, test_index in kf.split(X):
            X_train, X_test = X.iloc[train_index], X.iloc[test_index]
            y_train, y_test = y.iloc[train_index], y.iloc[test_index]
            if modelSelection == 'logreg':
                model = LogisticRegression(
                    solver='liblinear').fit(X_train, y_train)
                y_pred = model.predict(X_test)
                f1_scores.append(metrics.f1_score(
                    y_test, y_pred, average='weighted'))
                conf_matrices.append(metrics.confusion_matrix(y_test, y_pred))
            elif modelSelection == 'knn':
                model = KNeighborsClassifier(
                    n_neighbors=3, weights='uniform', metric='minkowski').fit(X, y)
                y_pred = model.predict(X_test)
                f1_scores.append(metrics.f1_score(
                    y_test, y_pred, average='weighted'))
                conf_matrices.append(metrics.confusion_matrix(y_test, y_pred))
            elif modelSelection == 'multilogreg':
                model = LogisticRegression(
                    solver='liblinear', multi_class='auto').fit(X_train, y_train)
                y_pred = model.predict(X_test)
                f1_scores.append(metrics.f1_score(
                    y_test, y_pred, average='weighted'))
                conf_matrices.append(metrics.confusion_matrix(y_test, y_pred))
            elif modelSelection == 'mlp':
                model = LogisticRegression(
                    solver='liblinear', multi_class='auto').fit(X_train, y_train)
                y_pred = model.predict(X_test)
                f1_scores.append(metrics.f1_score(
                    y_test, y_pred, average='weighted'))
                conf_matrices.append(metrics.confusion_matrix(y_test, y_pred))
        if modelSelection == 'xgboost':

            model = xgb.XGBClassifier(
                learning_rate=0.1,
                n_estimators=1000,
                max_depth=5,
                min_child_weight=1,
                gamma=0,
                subsample=0.8,
                colsample_bytree=0.8,
                objective='binary:logistic',
                nthread=4,
                scale_pos_weight=1)

            xgtrain = xgb.DMatrix(X.values, label=y.values)
            model.fit(X.values, y.values, eval_metric='error')
            cvresult = xgb.cv(model.get_xgb_params(), xgtrain, num_boost_round=model.get_params()[
                              'n_estimators'], nfold=numsplits, metrics='logloss', early_stopping_rounds=50)
            vid_predictions = model.predict(X.values)
            vid_predprob = model.predict_proba(X.values)[:, 1]
            if settings['nUserF1Scores'] is True:
                f1score = metrics.f1_score(
                    y.values, vid_predictions, average='weighted')
                final_conf_matrix = metrics.confusion_matrix(
                    y.values, vid_predictions)
                sample_size = sum([sum(i) for i in final_conf_matrix])
                tp = final_conf_matrix[0][0]/sample_size
                fp = final_conf_matrix[0][1]/sample_size
                tn = final_conf_matrix[1][1]/sample_size
                fn = final_conf_matrix[1][0]/sample_size
                return (f1score, tp, fp, tn, fn)
            else:
                final_conf_matrix = metrics.confusion_matrix(
                    y.values, vid_predictions)
                sample_size = sum([sum(i) for i in final_conf_matrix])

                f1score = round(metrics.f1_score(
                    y.values, vid_predictions, average='weighted'), 4)
                tp = round(final_conf_matrix[0][0]/sample_size, 2)
                fp = round(final_conf_matrix[0][1]/sample_size, 2)
                tn = round(final_conf_matrix[1][1]/sample_size, 2)
                fn = round(final_conf_matrix[1][0]/sample_size, 2)
                return({'f1score': f1score, 'tp': tp, 'fp': fp, 'tn': tn, 'fn': fn, 'nusers': 1})

        else:
            avg_f1_scores = sum(f1_scores)/len(f1_scores)
            for m in conf_matrices:
                if len(m) == 1:
                    sample_size = sample_size + m[0][0]
                    final_conf_matrix[0][0] += m[0][0]
                else:
                    sample_size = sample_size + \
                        m[0][0] + m[0][1] + m[1][0] + m[1][1]
                    final_conf_matrix[0][0] += m[0][0]
                    final_conf_matrix[0][1] += m[0][1]
                    final_conf_matrix[1][0] += m[1][0]
                    final_conf_matrix[1][1] += m[1][1]
            if settings['nUserF1Scores'] is True:
                return(avg_f1_scores, final_conf_matrix[0][0]/sample_size, final_conf_matrix[0][1]/sample_size, final_conf_matrix[1][1]/sample_size, final_conf_matrix[1][0]/sample_size)
            else:
                f1score = round(avg_f1_scores, 4)
                tp = round(final_conf_matrix[0][0]/sample_size, 2)
                fp = round(final_conf_matrix[0][1]/sample_size, 2)
                tn = round(final_conf_matrix[1][1]/sample_size, 2)
                fn = round(final_conf_matrix[1][0]/sample_size, 2)
                return({'f1score': f1score, 'tp': tp, 'fp': fp, 'tn': tn, 'fn': fn})

    if settings['nUserF1Scores'] and len(data) == 0:
        output = {'f1score': 0, 'tp': 0, 'fp': 0,
                  'tn': 0, 'fn': 0, 'nusers': 0, 'data': []}
        userIDs = None
        engine = None
        dbusername = 'dxxgpeye'
        password = 'LuMS6WYy5EDkUs85hXToB9GtWGF78NSM'
        host = 'drona.db.elephantsql.com'
        port = '5432'
        database = 'dxxgpeye'

        url = os.environ['DATABASE_URL']
        engine = create_engine(url)

        userIDs = pd.read_sql_query(sql_uids, con=engine)

        n_Users = int(userIDs.shape[0]*settings['nUserFraction'])
        if n_Users == 0:
            n_Users = 1

        randNums = np.random.choice(userIDs.shape[0], n_Users, replace=False)
        userIDStrings = list(userIDs['uid'])
        userIDStrings = [uid for ind, uid in enumerate(
            userIDStrings) if ind in randNums]
        f1score, tp, fp, tn, fn = 0, 0, 0, 0, 0

        for user in userIDStrings:

            sql_user_time_watched = """select amount_of_time_watched, videolibrary.length, userinteractions.vid 
            from userinteractions, videolibrary, userinfo 
            where userinteractions.vid = videolibrary.vid and userinfo.uid = userinteractions.uid
            and userinfo.uid = '{uid}'""".format(uid=uid)

            user_time_watched_ratio = pd.read_sql_query(
                sql_user_time_watched, con=engine)
            categories = pd.read_sql_query(sql_categories, con=engine)
            vid_num_views = pd.read_sql_query(sql_vid_num_views, con=engine)
            vid_num_selected = pd.read_sql_query(
                sql_vid_num_selected, con=engine)
            vid_avg_time_watched = pd.read_sql_query(
                sql_vid_avg_time_watched, con=engine)
            vid_avg_interaction_span = pd.read_sql_query(
                sql_vid_avg_interaction_span, con=engine)
            vid_avg_interaction_span['vid_avg_interaction_span_days'] = vid_avg_interaction_span['vid_avg_interaction_span_days'].apply(
                stripdays)

            # integer value of number of users. used in later calculations
            num_users = len(userIDs)

            user_time_watched_ratio['if_watched'] = np.where(
                user_time_watched_ratio['amount_of_time_watched']/user_time_watched_ratio['length'] > .75, 1, 0)

            # used for multilogistic regression
            if settings['modelType'] == 'multilogreg':
                user_time_watched_ratio.index.name = 'index'
                user_time_watched_ratio.reset_index(inplace=True)
                user_time_watched_ratio['if_watched_multi'] = user_time_watched_ratio['index'].apply(
                    partitionClasses)
                user_time_watched_ratio.drop('index', axis=1)

            # table of the categories for all videos in the videolibrary
            categories['primary_category'] = categories['primary_category'].apply(
                rstrip)
            categories['sub_category'] = categories['sub_category'].apply(
                rstrip)
            categories['sub_sub_category'] = categories['sub_sub_category'].apply(
                rstrip)

            # table of videos with the ratio of number of unique views to total number of users

            vid_num_views['vid_user_watched_ratio'] = vid_num_views['num_distinct_views']/num_users

            # table of videos with the count of how many times it has been selected, used later for other table calculations
            # table of videos with the ratio of number of times video has been selected to number of unique views,
            # merged with the vid_num_views table from above
            vid_view_info = pd.merge(
                vid_num_views, vid_num_selected, how='outer', on='vid')

            vid_view_info = vid_view_info.fillna(value=0)
            vid_view_info['vid_user_selected_watch_ratio'] = np.where(
                vid_view_info['num_distinct_views'] > 0, vid_view_info['num_selected']/vid_view_info['num_distinct_views'], 0)

            # vid_avg_interaction_span['vid_avg_interaction_span_days'] = vid_avg_interaction_span['vid_avg_interaction_span_days'].apply(
            #    stripdays)

            # merges the tables together by vid to form one large table, vidfeatures
            # vidfeatures is a table of the entire videolibrary with the previously calculated columns
            vidfeatures = pd.merge(
                categories, vid_view_info, how='outer', on='vid')
            vidfeatures = pd.merge(
                vidfeatures, vid_avg_time_watched, how='outer', on='vid')
            # table of the average amount of time in seconds that the video has been watched
            vidfeatures['vid_avg_time_watched_ratio'] = vidfeatures['vid_avg_time_watched'] / \
                vidfeatures['length']
            vidfeatures = pd.merge(
                vidfeatures, vid_avg_interaction_span, how='outer', on='vid')
            vidfeatures = vidfeatures.fillna(value=0)

            # drops features set to False by user in featureSettings + other unused table columns
            # global userDefinedFeatures
            # userDefinedFeatures = [f[0] for f in featureSettings.items() if f[1] is True]
            dropfeatures = [f[0]
                            for f in featureSettings.items() if f[1] is False]
            vidfeatures = vidfeatures.drop(
                ['num_distinct_views', 'num_selected', 'length', 'vid_avg_time_watched'], axis=1)
            vidfeatures = vidfeatures.drop(dropfeatures, axis=1)

            if (featureSettings['primary_category'] is False or featureSettings['sub_category'] is False or featureSettings['sub_sub_category'] is False):
                cats = ['primary_category', 'sub_category', 'sub_sub_category']
                subsetfeats = [f[0] for f in featureSettings.items() if (
                    (f[1] is True) and (f[0] in cats))]
                vidfeatures = pd.get_dummies(vidfeatures, columns=subsetfeats)
            else:
                vidfeatures = pd.get_dummies(
                    vidfeatures, columns=['primary_category', 'sub_category', 'sub_sub_category'])

            # subsection of the vidfeatures table of the videos that ONLY the specified user has watched/skipped
            # also contains the dependent variable, time_watched
            ttuserint = pd.merge(vidfeatures, user_time_watched_ratio, how='inner', on='vid').drop(
                ['amount_of_time_watched', 'length'], axis=1)

            # this is the subset of the vidfeatures table of the videos that we want to run through the trained model
            # to get our list of probabilities that the selected user will watch each video
            keys = list(ttuserint.vid.values)
            # final table. use this to push through the already trained model
            vidfeatures = vidfeatures[~vidfeatures.vid.isin(keys)]

            # final table. use this to test/train the model
            ttuserint = ttuserint.drop(['vid', 'title'], axis=1)

            if settings['modelType'] == 'logreg':
                tmpf1score, tmptp, tmpfp, tmptn, tmpfn = runLogisticRegression(
                    ttuserint, vidfeatures)
                f1score += tmpf1score
                tp += tmptp
                fp += tmpfp
                tn += tmptn
                fn += tmpfn
            elif settings['modelType'] == 'multilogreg':
                tmpf1score, tmptp, tmpfp, tmptn, tmpfn = runMultiLogisticRegression(
                    ttuserint, vidfeatures)
                f1score += tmpf1score
                tp += tmptp
                fp += tmpfp
                tn += tmptn
                fn += tmpfn
            elif settings['modelType'] == 'knn':
                tmpf1score, tmptp, tmpfp, tmptn, tmpfn = runKNN(
                    ttuserint, vidfeatures)
                f1score += tmpf1score
                tp += tmptp
                fp += tmpfp
                tn += tmptn
                fn += tmpfn
            elif settings['modelType'] == 'xgboost':
                tmpf1score, tmptp, tmpfp, tmptn, tmpfn = runXGBoost(
                    ttuserint, vidfeatures)
                f1score += tmpf1score
                tp += tmptp
                fp += tmpfp
                tn += tmptn
                fn += tmpfn
            elif settings['modelType'] == 'mlp':
                tmpf1score, tmptp, tmpfp, tmptn, tmpfn = runMLP(
                    ttuserint, vidfeatures)
                f1score += tmpf1score
                tp += tmptp
                fp += tmpfp
                tn += tmptn
                fn += tmpfn
            else:
                print('Invalid model type selection.')
        # print('Running model {model} on {n_Users} users:'.format(
        #     model=settings['modelType'], n_Users=n_Users))
        # print('F1 Score: {f1score}'.format(f1score=round(f1score/n_Users, 2)))
        # print('True Positive: {tp} (model is correct when it says user likes video)'.format(
        #     tp=round(tp/n_Users, 2)))
        # print('False Positive: {fp} (model says user likes video when they don\'t)'.format(
        #     fp=round(fp/n_Users, 2)))
        # print('True Negative: {tn} (model is correct when it says user doesn\'t like video)'.format(
        #     tn=round(tn/n_Users, 2)))
        # print('False Negative: {fn} (model says user doesn\'t like video when they do)'.format(
        #     fn=round(fn/n_Users, 2)))
        f1score = round(f1score/n_Users, 2)
        tp = round(tp/n_Users, 2)
        fp = round(fp/n_Users, 2)
        tn = round(tn/n_Users, 2)
        fn = round(fn/n_Users, 2)
        output['f1score'] = f1score
        output['tp'] = tp
        output['fp'] = fp
        output['tn'] = tn
        output['fn'] = fn
        output['nusers'] = n_Users
        return(output)

    else:
        output = {'f1score': 0, 'tp': 0, 'fp': 0,
                  'tn': 0, 'fn': 0, 'nusers': 1, 'data': []}
        userIDs = None
        user_time_watched_ratio = None
        categories = None
        vid_num_views = None
        vid_num_selected = None
        vid_avg_time_watched = None
        vid_avg_interaction_span = None

        if len(data) > 0:
            userIDs = pd.DataFrame(data[0], columns=['uid'])
            user_time_watched_ratio = pd.DataFrame.from_dict(data[6])
            categories = pd.DataFrame.from_dict(data[1])
            vid_num_views = pd.DataFrame.from_dict(data[2])
            vid_num_selected = pd.DataFrame.from_dict(data[3])
            vid_avg_time_watched = pd.DataFrame.from_dict(data[4])
            vid_avg_interaction_span = pd.DataFrame.from_dict(data[5])
        else:
            url = os.environ['DATABASE_URL']
            engine = create_engine(url)

            sql_user_time_watched = """select amount_of_time_watched, videolibrary.length, userinteractions.vid 
            from userinteractions, videolibrary, userinfo 
            where userinteractions.vid = videolibrary.vid and userinfo.uid = userinteractions.uid
            and userinfo.uid = '{uid}'""".format(uid=uid)
            userIDs = pd.read_sql_query(sql_num_users, con=engine)
            user_time_watched_ratio = pd.read_sql_query(
                sql_user_time_watched, con=engine)
            categories = pd.read_sql_query(sql_categories, con=engine)
            vid_num_views = pd.read_sql_query(sql_vid_num_views, con=engine)
            vid_num_selected = pd.read_sql_query(
                sql_vid_num_selected, con=engine)
            vid_avg_time_watched = pd.read_sql_query(
                sql_vid_avg_time_watched, con=engine)
            vid_avg_interaction_span = pd.read_sql_query(
                sql_vid_avg_interaction_span, con=engine)
            vid_avg_interaction_span['vid_avg_interaction_span_days'] = vid_avg_interaction_span['vid_avg_interaction_span_days'].apply(
                stripdays)

        # integer value of number of users. used in later calculations
        num_users = len(userIDs)
        user_time_watched_ratio['if_watched'] = np.where(
            user_time_watched_ratio['amount_of_time_watched']/user_time_watched_ratio['length'] > .75, 1, 0)

        # used for multilogistic regression
        if settings['modelType'] == 'multilogreg':
            user_time_watched_ratio.index.name = 'index'
            user_time_watched_ratio.reset_index(inplace=True)
            user_time_watched_ratio['if_watched_multi'] = user_time_watched_ratio['index'].apply(
                partitionClasses)
            user_time_watched_ratio.drop('index', axis=1)
        # table of the categories for all videos in the videolibrary
        categories['primary_category'] = categories['primary_category'].apply(
            rstrip)
        categories['sub_category'] = categories['sub_category'].apply(rstrip)
        categories['sub_sub_category'] = categories['sub_sub_category'].apply(
            rstrip)

        # table of videos with the ratio of number of unique views to total number of users
        vid_num_views['vid_user_watched_ratio'] = vid_num_views['num_distinct_views']/num_users

        # table of videos with the ratio of number of times video has been selected to number of unique views,
        # merged with the vid_num_views table from above
        vid_view_info = pd.merge(
            vid_num_views, vid_num_selected, how='outer', on='vid')
        vid_view_info = vid_view_info.fillna(value=0)
        vid_view_info['vid_user_selected_watch_ratio'] = np.where(
            vid_view_info['num_distinct_views'] > 0, vid_view_info['num_selected']/vid_view_info['num_distinct_views'], 0)

        # merges the tables together by vid to form one large table, vidfeatures
        # vidfeatures is a table of the entire videolibrary with the previously calculated columns
        vidfeatures = pd.merge(
            categories, vid_view_info, how='outer', on='vid')
        if len(data) > 0:
            # table of the average amount of time in seconds that the video has been watched
            vid_avg_time_watched['vid_avg_time_watched_ratio'] = vid_avg_time_watched['vid_avg_time_watched'] / \
                vid_avg_time_watched['length']
            vidfeatures = pd.merge(
                vidfeatures, vid_avg_time_watched, how='outer', on='vid')
        else:
            vidfeatures = pd.merge(
                vidfeatures, vid_avg_time_watched, how='outer', on='vid')
            vidfeatures['vid_avg_time_watched_ratio'] = vidfeatures['vid_avg_time_watched'] / \
                vidfeatures['length']
        vidfeatures = pd.merge(
            vidfeatures, vid_avg_interaction_span, how='outer', on='vid')
        vidfeatures = vidfeatures.fillna(value=0)

        # drops features set to False by user in featureSettings + other unused table columns
        # global userDefinedFeatures
        # userDefinedFeatures = [f[0] for f in featureSettings.items() if f[1] is True]
        dropfeatures = [f[0] for f in featureSettings.items() if f[1] is False]
        vidfeatures = vidfeatures.drop(
            ['num_distinct_views', 'num_selected', 'length', 'vid_avg_time_watched'], axis=1)
        vidfeatures = vidfeatures.drop(dropfeatures, axis=1)

        if (featureSettings['primary_category'] is False or featureSettings['sub_category'] is False or featureSettings['sub_sub_category'] is False):
            cats = ['primary_category', 'sub_category', 'sub_sub_category']
            subsetfeats = [f[0] for f in featureSettings.items() if (
                (f[1] is True) and (f[0] in cats))]
            vidfeatures = pd.get_dummies(vidfeatures, columns=subsetfeats)
        else:
            vidfeatures = pd.get_dummies(
                vidfeatures, columns=['primary_category', 'sub_category', 'sub_sub_category'])

        # subsection of the vidfeatures table of the videos that ONLY the specified user has watched/skipped
        # also contains the dependent variable, time_watched
        ttuserint = pd.merge(vidfeatures, user_time_watched_ratio, how='inner', on='vid').drop(
            ['amount_of_time_watched', 'length'], axis=1)
        # this is the subset of the vidfeatures table of the videos that we want to run through the trained model
        # to get our list of probabilities that the selected user will watch each video
        keys = list(ttuserint.vid.values)
        # final table. use this to push through the already trained model
        vidfeatures = vidfeatures[~vidfeatures.vid.isin(keys)]
        # final table. use this to test/train the model
        ttuserint = ttuserint.drop(['vid', 'title'], axis=1)
        if settings['modelType'] == 'logreg':
            return(runLogisticRegression(ttuserint, vidfeatures))
        elif settings['modelType'] == 'multilogreg':
            return(runMultiLogisticRegression(ttuserint, vidfeatures))
        elif settings['modelType'] == 'knn':
            return(runKNN(ttuserint, vidfeatures))
        elif settings['modelType'] == 'xgboost':
            return(runXGBoost(ttuserint, vidfeatures))
        elif settings['modelType'] == 'mlp':
            return(runMLP(ttuserint, vidfeatures))
        else:
            print('Invalid model type selection.')
