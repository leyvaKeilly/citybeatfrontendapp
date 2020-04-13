axios.defaults.xsrfHeaderName = "X_CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

let pdict = "";
let model = "";
let users = [];
let featureSettings = [];
let DATA = [];

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

    //getting data from csv file
    $("#modelRender-form").on('change', '#csv', () => {
        let file = event.target.files[0];
        let $name = $(".file-name");
        $name.html(file.name);

        Papa.parse(file, {
            dynamicTyping: true,
            complete: function (results) {

                file = results.data

                pdict = file[0][0];
                file[0].shift(0);
                featureSettings = file[0];
                file.shift(0);

                DATA = []

                file.forEach(arr => {
                    let temp = {
                        input: [],
                        output: []
                    }
                    //First column is output value
                    temp.output = [arr[0]];
                    //Rest of the columns is input values
                    for (let i = 1; i < arr.length; i++) {
                        temp.input.push(arr[i]);
                    }
                    DATA.push(temp)
                });
            }
        })
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
                            <input id="csv" class="file-input" type="file" accept=".csv" name="myCsv">
                                <span class="file-cta">
                                    <span class="file-icon">
                                        <i class="fas fa-upload"></i>
                                    </span>
                                    <span class="file-label">
                                        Choose a file…
                                    </span>
                                </span>
                                <span class="file-name">
                                </span>                                
                        </label>
                    </div>

                    </br>
                    <div class="field">
                        <div class="control">
                            <input type='checkbox' id="fromDatabase"/><label for="fromDatabase" class="checkbox"></label> <label class="checkbox">Use data available on database (default)</label>
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
    let $name = $(".file-name");
    $name.html("");
    $('#fromDatabase')[0]['checked'] = false;
    featureSettings = [];
    model = "";
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

    //Pass data to python file
    if ((!fromDatabase) && (featureSettings.length > 0)) {
        //TO-DO Send data to python and add new data to database       
        $modelRender.html(renderModelsArea(title, description, model, featureSettings, pdict));
    } else if (fromDatabase) {
        //TO-DO Otherwise, upload features directly from database
        //Generate predefined features to select from data currently available in database
        users = ['abc123', 'cgb456', 'brc789', 'nsk579'];  //Look up in database
        featureSettings = ['primary_category', 'sub_category', 'sub_sub_category', 'vid_user_watched_ratio', 'vid_avg_time_watched_ratio', 'vid_avg_interaction_span_days'];
        pdict = "Watch time"
        $modelRender.html(renderModelsArea(title, description, model, featureSettings, pdict));
        const result = await trainModel(users[0], featureSettings, DATA);
        //console.log(result);
        console.log(result.data);
        console.log(result.status);
    } else {
        alert("Please, choose your data either from database, or upload a csv file");
    }
    //Clear form   
    handleClearButton(event);
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
        headers: { 'X-CSRFToken': csrftoken }
    });
}

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
                                        ${renderUsersList(users)}
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
                                <input id="numKFolds" class="input" type="number" placeholder="2" min="2" max="30"/>
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
export const renderUsersList = function (users) {
    let result = ``;

    $('#select').empty();
    users.forEach(elem => {
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
export const runModel = function (event, featureSettings) {
    event.preventDefault();
    let myFeatures = [];
    let $myForm = $('#runModel-form')[0];
    const user = $('#user_input')[0].value;
    const checkAccuracy = $('#checkAccuracy')[0]['checked'];
    const showVidTitles = $('#showVidTitles')[0]['checked'];
    let numKFolds = $('#numKFolds')[0].value;

    //Validating numKFolds input. Has to be greater or equal to 2
    if ((numKFolds == null) || (numKFolds < 2)) {
        numKFolds = 2;
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
    const settings = {
        modelType: model,
        checkAccuracy: checkAccuracy,
        numKFolds: numKFolds,
        showVidTitles: showVidTitles
    }

    console.log("User: " + user);
    console.log("settings: ");
    for (let key in settings) {
        console.log(settings[key]);
    }
    console.log("Features: " + myFeatures);
    console.log("Pass call to python file");

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
