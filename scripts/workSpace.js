import { gettingCSVData, gettingUniqueUsers, gettingCategories, gettingNumViews, gettingNumSelected, gettingAvgWatchTime, gettingAvgVidInts, gettingUserTimeWatched } from "./preprocessing.js";

axios.defaults.xsrfHeaderName = "X_CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

//Global and fixed settings
//If the backend is chaged, please reflect changes in this section
let model = "";
let video_lib = [];
let user_interactions = [];
let video_lib_headers = [];
let user_interactions_headers = [];
let preprocessNeeded = false;

//These are the features that are run through our models
const featureSettings = ['primary_category', 'sub_category', 'sub_sub_category', 'vid_user_watched_ratio', 'vid_avg_time_watched_ratio', 'vid_avg_interaction_span_days'];
//This is the output the models are predicting
const pdict = "Watch time";

let userids = ["abc123", "brc789", "nsk579", "cgb456"];  //Look up in database


export const workPlaceRender = function () {
    let modals;
    const $body = $("#body");

    modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

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

    //getting data from video_library csv file
    $("#modelRender-form").on('change', '#csv1', () => {
        video_lib = [];
        let nameClass = ".csv1";
        let stringDate = "release_date";
        gettingCSVData(event, nameClass, stringDate, video_lib_headers, video_lib);
    });

    //getting data from user_interactions csv file
    $("#modelRender-form").on('change', '#csv2', () => {
        user_interactions = [];
        let nameClass = ".csv2";
        let stringDate = "date_watched";
        gettingCSVData(event, nameClass, stringDate, user_interactions_headers, user_interactions);
    });
};

//rendering form to choose model
export const renderFormArea = function () {

    return `    
        <div id="columns" class="columns">    
            <div id="modelRender">
            </div>
        <div class="column">
            <div class="box">
                <form id="modelRender-form">                    
                    <div class="field">
                        <label class="label">Title</label>
                        <div class="control">
                            <input id="title" class="input" type="text" placeholder="Enter title" required/>
                        </div>
                    </div>                   

                    <div class="field">
                        <label class="label" id="model_label" >Select a model</label>
                        <div class="control">
                            <div class="select">
                                <select id="model_input">
                                    <option>logreg</option>
                                    <option>multilogreg</option>
                                    <option>knn</option>
                                    <option>xgboost</option>
                                    <option>mlp</option>
                                </select>
                            </div>
                        </div>
                    </div>
                   
                    <div class="field">
                        <label class="label">Short Description</label>
                        <div class="control">
                            <textarea id="description" class="textarea" placeholder="Enter your model description here"></textarea>
                        </div>
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
                    <div class="field">
                        <div class="control">
                            <input type='checkbox' id="fromDatabase"/><label for="fromDatabase" class="checkbox"></label> <label class="checkbox">Use data available on database (preferred)</label>
                            <br>                          
                        </div>
                    </div> 
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
    <div id="output">
    </div>
    `;
};

//Clearing form
export const handleClearButton = function (event) {
    if (event != null) {
        event.preventDefault();
    }
    const form = $("#modelRender-form");
    form[0]['title'].value = "";
    document.getElementById("description").value = "";
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

    const form = $("#modelRender-form");
    const title = form[0]['title'].value;
    const description = form[0]['description'].value;
    const fromDatabase = $('#fromDatabase')[0]['checked'];
    const $modelRender = $("#modelRender");
    model = $('#model_input')[0].value;

    //Running model with data from csv
    if ((!fromDatabase) && (video_lib_headers.length > 0) && (user_interactions_headers.length > 0)) {

        preprocessNeeded = true;

        //Extracting the data to run the model

        //userids is array of unique users id
        gettingUniqueUsers(userids, user_interactions);

        //categories is an object with vid/title/category/subcategory/subsubcategory from every video in the video library
        let categories = {};
        categories = gettingCategories(categories, video_lib);

        //vid_num_views is an object with vid from each video in the video library mapped to the count of the distinct number of users that has watched each video
        //keys: vid, num_distinct_views
        let vid_num_views = {}
        vid_num_views = gettingNumViews(vid_num_views, video_lib, user_interactions);

        //vid_num_selected is an object with vid from each video mapped to the count of distinct users that have selected the video
        //keys: vid, num_selected       
        let vid_num_selected = {}
        vid_num_selected = gettingNumSelected(vid_num_selected, video_lib, user_interactions);

        //vid_avg_watch_time is an object with vid and length from each video in video library mapped to the average amount of time that each video has been watched
        //keys: vid, length, vid_avg_time_watched
        let vid_avg_watch_time = {};
        vid_avg_watch_time = gettingAvgWatchTime(vid_avg_watch_time, video_lib, user_interactions);

        //vid_avg_interaction_span is an object with vid from each video mapped to the average difference between when the video was watched and when it was released
        //keys: vid, vid_avg_interaction_span_days       
        let vid_avg_interaction_span = {};
        vid_avg_interaction_span = gettingAvgVidInts(vid_avg_interaction_span, video_lib, user_interactions);

        //TO-DO: send data to backend and wait foe a response

    } else if (fromDatabase) {  //Running model with data from database

        preprocessNeeded = false;

        //TO-DO upload features directly from database
        //Generate predefined features to select from data currently available in database

    } else {
        alert("Please, choose your data either from database, or upload two csv files");
        return;
    }

    //Rendering models area
    $modelRender.html(renderModelsArea(title, description, model, featureSettings, pdict));
    //Clear form   
    handleClearButton(event);
};

//rendering model area
export const renderModelsArea = function (title, description, model, featureSettings, pdict) {

    let result = `    
    <div class="column is-full">
        <div class="box">
            <div class="card">
                <header class="card-header">
                    <p class="card-header-title">
                        ${title}
                    </p>                           
                </header>
                <div class="card-content">
                    <div class="content">
                        <form id="runModel-form">                        
                        <div>
                            <p class="card-header-title">
                                <strong>Model: ${model}</strong>
                            </p>  
                            <p> <i> ${description} </i></p>
                        </div> 
                        <br>
                        <br>
                        <p><strong> Select features: </strong></p>  
                        ${renderFeatures(featureSettings)}
                        <br>
                        <div class="field">
                            <label class="label" id="user_label">Select a user</label>
                            <div class="control">
                                <div class="select">
                                    <select id="user_input">
                                        ${renderUsersList(userids)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="field">
                            <div class="control">
                                <input type='checkbox' id="checkAccuracy"/><label for="checkAccuracy"></label> <label>Check Accuracy</label>
                                <br>                          
                            </div>
                        </div> 

                        <div class="field">
                            <div class="control">
                                <input type='checkbox' id="showVidTitles"/><label for="showVidTitles"></label> <label>Show video titles</label>
                                <br>                          
                            </div>
                        </div>

                        <div class="field">
                            <label class="label" id="numKFolds_label">NumKFolds</label>
                            <div class="control">
                                <input id="numKFolds" class="input" type="number" placeholder="5" min="2" max="10"/>
                            </div>
                        </div>                                                  
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
    </div>    
`;
    return result;
};

//rendering features to select
export const renderFeatures = function (featureSettings) {

    let result = ``;

    let i = 0

    featureSettings.forEach(elem => {
        result += (`
        <div class="field">
            <div class="control">
                <input id=${"box" + i} type='checkbox'/><label for=${"box" + i}></label><label> ${elem} </label>
                <br>                          
            </div>
        </div>
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
    handleClearButton(event);
};

//Running model
export const runModel = async function (event, featureSettings) {
    event.preventDefault();
    let myFeatures = [];
    let $myForm = $('#runModel-form')[0];
    const user = $('#user_input')[0].value;
    const checkAccuracy = $('#checkAccuracy')[0]['checked'];
    const showVidTitles = $('#showVidTitles')[0]['checked'];
    let numKFolds = $('#numKFolds')[0].value;

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
    //Sending settings to python
    let settings = {
        modelType: model,
        checkAccuracy: checkAccuracy,
        numKFolds: numKFolds,
        showVidTitles: showVidTitles
    }

    console.log("User: " + user);
    console.log("Fix model and settings: ");
    for (let key in settings) {
        console.log(settings[key]);
    }
    console.log("Features: " + myFeatures);
    console.log("Pass call to python file");


    if (preprocessNeeded) {
        //user_time_watched is an object with list of videos that the specified user has interacted with in any way with the following columns
        //amount_of_time_watched, length, vid
        let user_time_watched = {}
        user_time_watched = gettingUserTimeWatched(user_time_watched, video_lib, user_interactions, user);
    }

    //TO-DO: send data to backend and wait for a response
    //TO-DO: Train model
    const result = await trainModel(userids[0], featureSettings, settings);
    console.log(result);
    console.log(result.data);
    console.log(result.status);

    //made-up response    
    let response = {
        uid: user,
        accuracy: 0.90,
        truePositive: 0,
        trueNegative: 0,
        list: [["movie1", 0.98], ["movie2", 0.33], ["movie3", 0.99]]
    }

    //Rendering output area with backend response
    const $output = $("#output");
    $output.html(renderOutputArea(response));
};

//AJAX function
function trainModel(userid, settings, data) {
    return axios({
        method: 'post',
        url: 'https://citybeatapp.herokuapp.com/',
        crossOrigin: true,
        data: {
            userid,
            settings,
            data,
        },
    });
}

//Rendering output area with backend response
export const renderOutputArea = function (response) {
    let result = ``;
    let table = ``;

    for (let key in response) {
        if (key != "list") {
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

    response["list"].map((elmt) => {
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
