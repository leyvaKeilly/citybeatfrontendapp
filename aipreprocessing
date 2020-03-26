import psycopg2
import pandas as pd
import numpy as np
from sqlalchemy import create_engine

#enter the unique user id that the model will train on
uid = 'cgb456'

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

sql_vid_num_selected = """select videolibrary.vid, count(userinteractions.uid) as num_selected 
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
vidfeatures = vidfeatures.drop('vid',axis=1) #final table. use this to push through the already trained model
