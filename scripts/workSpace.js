import { gettingCSVData, gettingUniqueUsers, gettingCategories, gettingNumViews, gettingNumSelected, gettingAvgWatchTime, gettingAvgVidInts, gettingUserTimeWatched } from "./preprocessing.js";

//Global and fixed settings
//If the backend is chaged, please reflect changes in this section
let video_lib = [];
let user_interactions = [];
let video_lib_headers = [];
let user_interactions_headers = [];
let preprocessNeeded = false;
let data = [];

//This is the backend app url on heroku
let herokuUrl = 'https://citybeatapp.herokuapp.com/';
//If the server is running locally use urlLocal on AJAX call to backend
let urlLocal = 'http://localhost:8000/'
//These are the users in database. For demo purposes only
let userids = ["abc123", "brc789", "nsk579", "cgb456"];
//These are the features that are run through our models
const featureSettings = ['primary_category', 'sub_category', 'sub_sub_category', 'vid_user_watched_ratio', 'vid_avg_time_watched_ratio', 'vid_avg_interaction_span_days'];
//This is the output the models are predicting
const pdict = "Watch time";


export const workPlaceRender = function () {
    const $body = $("#body");

    //Rendering workPlace body
    $body.html(renderFormArea());
    const $modelRender = $("#modelRender");

    // submit listener
    const $submit = $("#submit");
    $submit.click(() => handleSubmitButton(event));

    // clear listener
    const $clear = $("#clear");
    $clear.click(() => handleClearButton(event));

    // delete listener
    $modelRender.on("click", "#deleteModel", () => {
        event.preventDefault();
        handleDeleteButton();
    });

    //run button listener
    $modelRender.on("click", ".runButton", () => {
        runModel(event, featureSettings);
    });

    //renderAccuracyFollowUp listener
    $modelRender.on("change", "#checkAccuracy", () => {
        const $accuracyDiv = $("#accuracyFollowUp");
        $accuracyDiv.html(renderAccuracyFollowUp(event.target.value, userids));
    });

    //TO_DO: try and catch
    //getting data from video_library csv file
    $("#modelRender-form").on('change', '#csv1', () => {
        video_lib = [];
        let nameClass = ".csv1";
        let stringDate = "release_date";
        try {
            gettingCSVData(event, nameClass, stringDate, video_lib_headers, video_lib);
            $("#csv1")[0].value = "";
        }
        catch (err) {
            alert(err);
        }
    });

    //getting data from user_interactions csv file
    $("#modelRender-form").on('input', '#csv2', () => {
        user_interactions = [];
        let nameClass = ".csv2";
        let stringDate = "date_watched";
        try {
            gettingCSVData(event, nameClass, stringDate, user_interactions_headers, user_interactions);
            $("#csv2")[0].value = "";
        }
        catch (err) {
            alert(err);
        }
    });
};

//rendering form to choose model
export const renderFormArea = function () {

    return `
<div class="card">
    <div class="card-content" style="background-color:rgb(56, 55, 55)">
        <div class="media">
            <div class="media-left">
                <button onclick="window.open('https://teamd.web.unc.edu/files/2020/04/TeamD_Documentation-3.pdf','resizable=yes')" class="button is-dark is-inverted is-outlined">Documentation</button>
            </div>
        </div>
        <div class="media">
            <div class="media-left">
                <button onclick="window.open('https://www.youtube.com/watch?v=L8MQb1gbe3E#action=share','resizable=yes')" class="button is-dark is-inverted is-outlined">Walkthrough</button>
            </div>
        </div>
    </div>
    <div id="columns" class="columns">    
        <div id="modelRender">
        </div>
        <div class="column">
            <div class="box">
                <form id="modelRender-form">                    
                    <div class="field">
                        <label class="label">Select data</label>
                    </div>
                    <div class="file has-name is-fullwidth">
                        <label class="file-label">
                            <input id="csv1" class="file-input" type="file" accept=".csv" name="myCsv1">
                                <span class="file-cta">
                                    <span class="file-icon">
                                        <i class="fas fa-upload"></i>
                                    </span>
                                    <span class="file-label">
                                        Choose the video_library csv
                                    </span>
                                </span>
                                <span class="file-name csv1">
                                </span>                                
                        </label>
                    </div>
                    </br>
                    <div class="file has-name is-fullwidth">
                        <label class="file-label">
                            <input id="csv2" class="file-input" type="file" accept=".csv" name="myCsv2">
                            <span class="file-cta">
                                <span class="file-icon">
                                    <i class="fas fa-upload"></i>
                                </span>
                                <span class="file-label">
                                    Choose the user_interactions csv
                                </span>
                            </span>
                            <span class="file-name csv2">
                            </span>                                
                        </label>
                    </div>

                    </br>
                    <label class="container">
                        <input id="fromDatabase" type="checkbox"/>
                        <span class="checkmark" id="showVidTitles">Use data available on database (preferred)</span>                                
                    </label>
                    </br>
                    </br>                                                        

                    <div class="field is-grouped">
                        <div class="control">
                            <button id="submit" class="button is-link" type="submit">Submit</button>
                        </div>
                        <div class="control">
                            <button id="clear" class="button is-link is-light" type="buttom">Clear</button>
                        </div>
                    </div>
                    </br>

                    <div class="field">
                        <div class="control">
                            <input id="terms" type="radio"/><label>I agree to the <a href="#">terms and conditions</a></label>
                            <br> 
                        </div>
                    </div>   
                    </br>
                </form>
            </div>
        </div>
    </div>
    <div class="loader-wrapper" style="display:none">
        <div class="loader is-loading"></div>
    </div>  
    <div id="output">
    </div>
</div>
    `;
};

//Clearing form
export const handleClearButton = function (event) {
    if (event != null) {
        event.preventDefault();
    }
    const form = $("#modelRender-form");
    let $name1 = $(".csv1");
    $name1.html("");
    let $name2 = $(".csv2");
    $name2.html("");
    $('#fromDatabase')[0]['checked'] = false;
    user_interactions_headers = [];
    video_lib_headers = [];
};

//Submitting new model
export const handleSubmitButton = async function (event) {
    event.preventDefault();
    event.stopPropagation();

    const fromDatabase = $('#fromDatabase')[0]['checked'];
    const $modelRender = $("#modelRender");

    //Running model with data from csv
    if ((!fromDatabase) && (video_lib_headers.length > 0) && (user_interactions_headers.length > 0)) {

        preprocessNeeded = true;

        //Extracting the data to run the model

        //userids is array of unique users id
        userids = gettingUniqueUsers(userids, user_interactions);
        data[0] = userids;

        //categories is an object with vid/title/category/subcategory/subsubcategory from every video in the video library
        let categories = {};
        categories = gettingCategories(categories, video_lib);
        data[1] = categories;

        //vid_num_views is an object with vid from each video in the video library mapped to the count of the distinct number of users that has watched each video
        //keys: vid, num_distinct_views
        let vid_num_views = {}
        vid_num_views = gettingNumViews(vid_num_views, video_lib, user_interactions);
        data[2] = vid_num_views;

        //vid_num_selected is an object with vid from each video mapped to the count of distinct users that have selected the video
        //keys: vid, num_selected       
        let vid_num_selected = {}
        vid_num_selected = gettingNumSelected(vid_num_selected, video_lib, user_interactions);
        data[3] = vid_num_selected;

        //vid_avg_watch_time is an object with vid and length from each video in video library mapped to the average amount of time that each video has been watched
        //keys: vid, length, vid_avg_time_watched
        let vid_avg_watch_time = {};
        vid_avg_watch_time = gettingAvgWatchTime(vid_avg_watch_time, video_lib, user_interactions);
        data[4] = vid_avg_watch_time;

        //vid_avg_interaction_span is an object with vid from each video mapped to the average difference between when the video was watched and when it was released
        //keys: vid, vid_avg_interaction_span_days       
        let vid_avg_interaction_span = {};
        vid_avg_interaction_span = gettingAvgVidInts(vid_avg_interaction_span, video_lib, user_interactions);
        data[5] = vid_avg_interaction_span;

    } else if (fromDatabase) {  //Running model with data from database

        preprocessNeeded = false;
        data = [];

        //TO-DO upload features directly from database
        //Generate predefined features to select from data currently available in database
        userids = ["abc123", "brc789", "nsk579", "cgb456"];  //Look up in database

    } else {
        alert("Please, choose your data either from database, or upload two csv files");
        return;
    }
    //Rendering models area
    $modelRender.html(renderModelsArea(featureSettings, pdict, userids));
    //Clear form   
    handleClearButton(event);
};

//rendering model area
export const renderModelsArea = function (featureSettings, pdict, userids) {

    let result = `    
        <div class="column is-full">
            <div class="box">          
                <label class="label">Settings</label>           
                <div class="card-content">
                    <div class="content">
                        <form id="runModel-form">
                            <div class="field">
                                <label class="label" id="model_label" >Select a model</label>
                                <div class="control">
                                    <div class="select">
                                        <select id="model_input">
                                            <option>logreg</option>
                                            <option>multilogreg</option>
                                            <option>knn</option>
                                            <option>mlp</option>
                                        </select>
                                    </div>
                                </div>
                            </div>                               
                            <p><strong> Select features: </strong></p>  
                            ${renderFeatures(featureSettings)}
                            <br>                          
                            <div class="field">
                                <label class="label" id="numKFolds_label">NumKFolds</label>
                                <div class="control">
                                    <input id="numKFolds" class="input" type="number" placeholder="5" min="2" max="10"/>
                                </div>
                            </div>
                            <br>   
                            ${renderAccuracySelector()}                            
                            <br>        
                            <div id="accuracyFollowUp">${renderAccuracyFollowUp("F1Scores", userids)}</div>
                            <br>                                                                            
                        </form>   
                    </div>                      
                    <div id="columns" class="columns is-mobile is-centered is-vcentered">
                        <div class="column">
                            <div class="box">
                                <span><strong>Output to predict: </strong>${pdict}</span> 
                            </div>
                        </div>
                    </div>
                </div>
                <footer class="card-footer">
                    <a href="#" class="runButton card-footer-item">Run</a>               
                    <a href="#" id="deleteModel" class="card-footer-item">Delete</a>
                </footer>          
            </div>
        </div>        
    `;
    return result;
};

//rendering check accuracy selector. if the user uploads data from csv files, only checkF1Scores can be provided. Otherwise, it can choose from checkF1Scores and nF1Scores
export const renderAccuracySelector = function () {
    let result = ``;
    if (preprocessNeeded) {
        result = `<div class="field">
                    <label class="label" id="F1Score_label">Check Accuracy: F1Score</label>
                </div>
            `;
    }
    else {
        result = `<div class="field">
                        <label class="label" id="checkAccuracyLabel">Check Accuracy</label>
                        <div class="control">
                            <div class="select">
                                <select id="checkAccuracy">
                                    <option>F1Scores</option>
                                    <option>nUserF1Scores</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `;
    }
    return result;
};

//rendering the features that are dependent on the type of F1Score selected for accuracy
export const renderAccuracyFollowUp = function (option, userids) {
    let result = ``;

    if (option == "F1Scores") {
        result = ` <div class="field">
                        <label class="label" id="user_label">Select a user</label>
                        <div class="control">
                            <div class="select">
                                <select id="user_input">
                                    ${renderUsersList(userids)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <br>
                    <label class="container">
                        <input id="showVidTitles" type="checkbox"/>
                        <span class="checkmark">Show video titles</span>                                
                    </label> 
                `;
    } else if (option == "nUserF1Scores") {
        result = `<div class="field">
                    <label class="label" id="nUserFraction_label">nUserFraction</label>
                    <div class="control">
                        <input id="nUserFraction" class="input" type="number" placeholder="0.66" step="0.01" min="0" max="1"/>
                    </div>
                </div> 
            `;
    }

    return result;
};

//rendering features to select
export const renderFeatures = function (featureSettings) {

    let result = ``;

    let i = 0

    featureSettings.forEach(elem => {
        result += (`
            <label class="container">
                <input id=${"box" + i} type="checkbox"/>
                <span class="checkmark" id="showVidTitles">${elem}</span>                                
            </label>
            <br> 
        `);
        i++;
    });

    return result;
};

//rendering users to select
export const renderUsersList = function (userids) {
    let result = ``;

    $('#select').empty();
    userids.forEach(elem => {
        result += (`
        <option> ${elem} </option>
        `);
    });

    return result;
};

//Deleting model
export const handleDeleteButton = function () {
    event.preventDefault();
    const $model = $("#modelRender");
    const $output = $("#output");

    $model.html("");
    $output.html("");
    data = [];
    handleClearButton(event);
};

//Running model
export const runModel = async function (event, featureSettings) {
    event.preventDefault();
    let myFeatures = [];
    let $myForm = $('#runModel-form')[0];
    let numKFolds = $('#numKFolds')[0].value;
    let model = $('#model_input')[0].value;
    let accuracyOption = "F1Scores";
    let showVidTitles = false;
    let user = "";
    let nUserFraction = 0;
    let response = "";

    $('.loader-wrapper').show(); //Showing loader while running the model

    if (preprocessNeeded) {

        accuracyOption = "F1Scores";
        showVidTitles = $myForm['showVidTitles']['checked'];
        user = $('#user_input')[0].value;

        // //user_time_watched is an object with list of videos that the specified user has interacted with in any way with the following columns
        // //amount_of_time_watched, length, vid
        let user_time_watched = {}
        user_time_watched = gettingUserTimeWatched(user_time_watched, video_lib, user_interactions, user);
        data[6] = user_time_watched;

    } else {
        accuracyOption = $('#checkAccuracy')[0].value;
        if (accuracyOption == "F1Scores") {
            showVidTitles = $myForm['showVidTitles']['checked'];
            user = $('#user_input')[0].value;
        } else if (accuracyOption == "nUserF1Scores") {
            nUserFraction = $('#nUserFraction')[0].value;

            //validate nUserFraction input. Default value is 0.66
            if (nUserFraction == "") {
                nUserFraction = 0.66;
            }
        }
    }

    //Validating numKFolds input. Has to be greater or equal to 2. Defaultl is 5
    if ((numKFolds == null) || (numKFolds < 2)) {
        numKFolds = 5;
    }

    //Validating myFeatures input
    let allFalse = true;
    for (let i = 0; i < featureSettings.length; i++) {
        myFeatures.push($myForm['box' + i]['checked']);
        if (myFeatures[i] == true) {
            allFalse = false;
        }
    }
    //if all features set to false, then set all to true
    if (allFalse) {
        let newArr = [];
        for (let i = 0; i < featureSettings.length; i++) {
            newArr.push(true);
        }
        myFeatures = newArr;
    }
    let fSettings = {};
    featureSettings.forEach((feature, i) => {
        fSettings[feature] = myFeatures[i];
    })

    //Sending settings to python
    let settings = {
        modelType: model,
        checkF1Scores: (accuracyOption == "F1Scores"),
        numKFolds: numKFolds,
        showVidTitles: showVidTitles,
        nUserF1Scores: (accuracyOption == "nUserF1Scores"),
        nUserFraction: nUserFraction
    }

    //Train model with userid, featureSettings, settings, data
    try {
        const result = await trainModel(user, fSettings, settings, data);
        $('.loader-wrapper').hide();
        response = result.data.data;
        //Rendering output area with backend response
        const $output = $("#output");
        $output.html(renderOutputArea(response));
    }
    catch (err) {
        $('.loader-wrapper').hide();
        alert(err);
    }
};

//AJAX function
function trainModel(user, featureSettings, settings, data) {
    return axios({
        method: 'post',
        url: herokuUrl,
        crossOrigin: true,
        data: {
            user,
            featureSettings,
            settings,
            data
        },
    });
}

//Rendering output area with backend response. Note: For this to work properly, the backend needs to send an array called "data" with the predictions
export const renderOutputArea = function (response) {
    let result = ``;
    let table = ``;

    for (let key in response) {
        if (key != "data") {
            result += (`
            <div class="level-item has-text-centered">
                <div>
                    <p class="heading">${key}</p>
                    <p class="title">${response[key]}</p>
                </div>
            </div>
        `);
        }
    }

    // Displaying a maximum of 20 videos, unless there are less than 20 videos availables  -- TO-DO ?? Maybe
    let i;
    if (response["data"].length >= 20) {
        i = 20;
    } else {
        i = response["data"].length;
    }

    response["data"].map((elmt) => {
        table += (`<tr>`);
        for (let i in elmt) {
            table += (`         
                <td>${elmt[i]}</td>            
            `);
        }
        table += (`</tr>`);
    });

    return `
        <div class="box">
            <div class="level is-mobile">
            ${result}            
            </div>
            <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">        
                <tbody>
                ${table} 
                </tbody>
            </table> 
        </div>
    `;
};
