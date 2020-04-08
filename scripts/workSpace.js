let pdict = "";
let model = '';
let users = [];
let featureSettings = [];
let DATA = [];

export const workPlaceRender = function (user) {
    let modals;
    const $body = $("#body");
    $body.html(renderCreateNetworksArea());
    const $networks = $("#neurons");
    modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    // submit
    const $submit = $("#submit");
    $submit.click(() => handleSubmitButton(event, $networks[0]));

    // clear
    const $clear = $("#clear");
    $clear.click(() => handleClearButton(event));

    // Delete
    $networks.on("click", "#deleteNetwork", () => {
        event.preventDefault();
        handleDeleteButton(user, $networks[0]);
    });

    //getting data from csv file
    $("#network-form").on('change', '#csv', () => {
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
                    //console.log(DATA)
                });
            }
        })
    });

    //Listener in run button
    $networks.on("click", ".runButton", () => {
        runModel(event, featureSettings);
    });
};

//Clearing form
export const handleClearButton = function (event) {
    if (event != null) {
        event.preventDefault();
    }
    const form = $("#network-form");
    form[0]['title'].value = "";
    document.getElementById("description").value = "";
    let $name = $(".file-name");
    $name.html("");
};

//Deleting model from firestore
export const handleDeleteButton = function (user, network) {
    event.preventDefault();
    const $network = $(network);
    $network.html("<div></div>");
    handleClearButton(event);
};

//Running model
export const runModel = function (event, featureSettings) {
    event.preventDefault();
    let myID = event.target.id;
    let myFeatures = [];
    let $myForm = $('#edit-form-' + myID)[0];
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
        myFeatures.push($myForm['box' + i + ":" + myID]['checked']);
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
}

//Submitting new model
export const handleSubmitButton = function (event, network) {
    event.preventDefault();
    event.stopPropagation();
    handleClearButton(event);

    const form = $("#network-form");
    const title = form[0]['title'].value;
    const description = form[0]['description'].value;
    const fromDatabase = $('#fromDatabase')[0]['checked'];
    const $network = $(network);
    model = $('#model_input')[0].value;

    //Pass data to python file
    //TO-DO Check if user wants to upload his data from file
    if (!fromDatabase) {
        //TO-DO Send data to python and set data base        
        $network.html(renderNetworksArea(title, description, model, featureSettings, pdict));
    } else {
        //Generate predefined features to select
        users = ['abc123', 'cgb456', 'brc789', 'nsk579'];  //Look up in database
        featureSettings = ['primary_category', 'sub_category', 'sub_sub_category', 'vid_user_watched_ratio', 'vid_avg_time_watched_ratio', 'vid_avg_interaction_span_days'];
        pdict = "Watch time"
        $network.html(renderNetworksArea(title, description, model, featureSettings, pdict));
    }
    //TO-DO Otherwise, upload features directly from database

};

//Loading content into DOM
export const renderCreateNetworksArea = function () {

    return `    
        <div id="columns" class="columns">    
            <div id="neurons">
            </div>
        <div class="column">
            <div class="box">
                <form id="network-form">                    
                    <div class="field">
                        <label class="label">Title</label>
                        <div class="control">
                            <input id="title" class="input" type="text" placeholder="Enter title for your network" required/>
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
                            <textarea id="description" class="textarea" placeholder="Textarea"></textarea>
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
                            <input type='checkbox' id="fromDatabase"/><label for="fromDatabase"></label> <label>Use data available on database (default)</label>
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
    `;
};

export const renderFeatures = function (featureSettings, id) {

    let result = ``;

    let i = 0

    featureSettings.forEach(elem => {
        result += (`
        <div class="columns is-mobile is-pulled-left">
            <input id=${"box" + i + ":" + id} type='checkbox'/><label for=${"box" + i + ":" + id}></label><label>${elem}</label>                       
        </div>
        <br> 
        `);
        i++;
    });

    return result;
};

export const renderUsersList = function (users) {
    let result = ``;

    //console.log($('#select'));
    $('#select').empty();

    users.forEach(elem => {
        result += (`
        <option> ${elem} </option>
        `);
    });
    //console.log($('#select'));
    return result;
};

export const renderNetworksArea = function (title, description, model, featureSettings, pdict) {

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
                        <form id="edit-form-${1}">
                        
                        <div>
                            <p class="card-header-title">
                                <strong>Model: ${model}</strong>
                            </p>  
                            <p> <i> ${description} </i></p>
                        </div> 
                        <br>
                        <br>
                        <p><strong> Select features: </strong></p>  
                        ${renderFeatures(featureSettings, 1)}
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
                                <input id="numKFolds" class="input" type="number" placeholder="2"/>
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
                    <a href="#" id="${1}" class="runButton card-footer-item">Run</a>               
                    <a href="#" id="deleteNetwork" data-id="${1}" class="card-footer-item">Delete</a>
                </footer>
            </div>
        </div>
    </div>    
`;
    return result;
};
