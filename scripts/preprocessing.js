import { handleClearButton } from "./workSpace.js";

//extracting data from csv file
export const gettingCSVData = function (event, nameClass, stringDate, header_arr, data_arr) {
    let file = event.target.files[0];

    // Check that the file is a csv file
    let arr = (file.name).toString().match(new RegExp(".*.csv"));
    if (arr == null) {
        alert("Please, select a csv file");
        handleClearButton();
        return;
    }

    let $name = $(nameClass);
    $name.html(file.name);

    Papa.parse(file, {
        dynamicTyping: true,
        complete: function (results) {
            file = results.data;

            //taking headers from csv file
            file[0].forEach(elmt => {
                if (elmt.length > 0) {
                    header_arr.push(elmt)
                }
            });

            file.shift(0);                //leaving out the headers

            //Extracting data in array of objects where keys matches the headers in csv file
            file.forEach((row, index) => {
                if (row[0].length == 0) {
                    //This is an empty line in csv file, so ignore
                } else {
                    data_arr[index] = {};
                    header_arr.forEach((elemt, indexClmn) => {
                        if (elemt == stringDate) {
                            row[indexClmn] = row[indexClmn].replace("+00", "");
                        }
                        data_arr[index][elemt] = row[indexClmn];
                    })
                }
            })
        }
    })
    return;
};

//creating array of unique users id
export const gettingUniqueUsers = function (userids, user_interactions) {
    userids = user_interactions.map(i => i.uid).filter((elemt, i, all) => all.indexOf(elemt) == i);
    return userids;
};

//categories is an object with vid/title/category/subcategory/subsubcategory from every video in the video library
export const gettingCategories = function (categories, video_lib) {
    let catgKeys = ["vid", "title", "primary_category", "sub_category", "sub_sub_category"]

    catgKeys.forEach(elem => {
        categories[elem] = video_lib.map(i => i[elem])
    });
    return categories;
};

//vid_num_views is an object with vid from each video in the video library mapped to the count of the distinct number of users that has watched each video
//keys: vid, num_distinct_views
export const gettingNumViews = function (vid_num_views, video_lib, user_interactions) {

    vid_num_views['vid'] = [];
    vid_num_views['num_distinct_views'] = [];

    video_lib.forEach(i => {
        vid_num_views['vid'].push(i['vid']);
        //matching each video in the library with the users interactions, and discarding repeted interactions from the same user
        let arr = user_interactions.filter((row) => (row.vid == i.vid)).map(row => row.uid).filter((user, index, all) => all.indexOf(user) == index);
        vid_num_views['num_distinct_views'].push(arr.length);
    });
    return vid_num_views;
};

//vid_num_selected is an object with vid from each video mapped to the count of distinct users that have selected the video
//keys: vid, num_selected  
export const gettingNumSelected = function (vid_num_selected, video_lib, user_interactions) {
    vid_num_selected['vid'] = [];
    vid_num_selected['num_selected'] = [];

    video_lib.forEach(i => {
        vid_num_selected['vid'].push(i['vid']);
        //matching each video in the library with the users interactions if the users selected the video, and discarding repeted interactions from the same user
        let arr = user_interactions.filter((row) => ((row.vid == i.vid) && (row.vid_num_selected == 1))).map(row => row.uid).filter((user, index, all) => all.indexOf(user) == index);
        vid_num_selected['num_selected'].push(arr.length);
    });
    return vid_num_selected;
};

//vid_avg_watch_time is an object with vid and length from each video in video library mapped to the average amount of time that each video has been watched
//keys: vid, length, vid_avg_time_watched
export const gettingAvgWatchTime = function (vid_avg_watch_time, video_lib, user_interactions) {
    vid_avg_watch_time['vid'] = [];
    vid_avg_watch_time['length'] = [];
    vid_avg_watch_time['vid_avg_time_watched'] = [];
    let sum = 0;
    let avg = 0;

    video_lib.forEach(i => {
        sum = 0;
        avg = 0;
        //matching each video with the users interactions and selecting the amount of time watched
        let arr = user_interactions.filter(row => (row.vid == i.vid)).map(row => row.amount_of_time_watched);
        if (arr.length > 0) {
            //calculating the average amount of time watched per video, if any
            arr.forEach(elem => sum += elem);
            avg = (sum / arr.length);
        }
        vid_avg_watch_time['vid'].push(i.vid);
        vid_avg_watch_time['length'].push(i.length);
        vid_avg_watch_time['vid_avg_time_watched'].push(avg);
    });
    return vid_avg_watch_time;

};

//vid_avg_interaction_span is an object with vid from each video mapped to the average difference between when the video was watched and when it was released
//keys: vid, vid_avg_interaction_span_days
export const gettingAvgVidInts = function (vid_avg_interaction_span, video_lib, user_interactions) {
    vid_avg_interaction_span['vid'] = [];
    vid_avg_interaction_span['vid_avg_interaction_span_days'] = [];
    let avgSpan = 0;
    let sum = 0;

    video_lib.forEach(i => {
        sum = 0;
        avgSpan = 0;
        //getting the dates watched of each video
        let arr = user_interactions.filter(row => (row.vid == i.vid)).map(elemt => new Date(elemt.date_watched));
        arr.forEach(datesWatched => {
            sum += Math.abs(new Date(i.release_date) - datesWatched);
        })
        if (arr.length > 0) {
            //calculating the average of the difference between the date the video was released and when it was watched, if it was watched 
            avgSpan = (sum / arr.length);
        }
        vid_avg_interaction_span['vid'].push(i.vid);
        vid_avg_interaction_span['vid_avg_interaction_span_days'].push(avgSpan / (1000 * 60 * 60 * 24));
    });
    console.log(vid_avg_interaction_span)

    return vid_avg_interaction_span;
};

//user_time_watched is an object with list of videos that the specified user has interacted with in any way with the following columns
//keys: amount_of_time_watched, length, vid
export const gettingUserTimeWatched = function (user_time_watched, video_lib, user_interactions, user) {
    let keys = ["amount_of_time_watched", "length", "vid"];

    keys.forEach(i => {
        let arr = [];
        if (i == "length") {
            //getting the length in video library of the videos a specific user has interacted with
            user_interactions.filter(row => (row.uid == user)).map(elmt => {
                video_lib.map(row => {
                    if (row.vid == elmt.vid) {
                        arr.push(row.length)
                    }
                })
            });
        }
        else {
            //getting the vid and amount_of_time_watched for each video a specific user has interacted with
            arr = user_interactions.filter(row => (row.uid == user)).map(elmt => elmt[i]);
        }
        user_time_watched[i] = arr;
    });

    return user_time_watched;
};
