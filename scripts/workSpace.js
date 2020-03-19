import { buildANetwork, netFromJson } from "./ml.js";

let $editForm;
let pdict = "";
let columns = [];
let DATA = []
let myNets = {};

export const workPlaceRender = function (user) {
    let modals;
    const $body = $("#body");
    $body.html(renderCreateNetworksArea());
    const $networks = $("#neurons");

    //Loading existing networks to DOM
    db.collection('users').doc(user.uid).collection('networks').orderBy('title').onSnapshot(snapshot => {
        let changes = snapshot.docChanges();
        changes.forEach(change => {
            $networks.html(snapshot.docs.map(renderNetworksArea));
        });
        modals = document.querySelectorAll('.modal');
        M.Modal.init(modals);
        $editForm = $("#edit-form");
        let $box = $(".box");
        let networkId;

        // Edit
        $box.on("click", "#editNetwork", () => {
            networkId = $(event.target);
        });

        // Delete
        $box.on("click", "#deleteNetwork", () => {
            event.preventDefault();
            networkId = $(event.target);
            handleDeleteButton(user, networkId);
        });

        //Save
        $editForm.submit(() => handleSaveButton(event, user, networkId));

    }, err => console.log(err.message));

    // submit
    const $submit = $("#submit");
    $submit.click(() => handleSubmitButton(event, user));

    // clear
    const $clear = $("#clear");
    $clear.click(() => handleClearButton(event));

    // what is an epoc?
    $("#epc_label").click(() => toggleModal(event, '#epc_modal', true));
    // what are hidden layers?
    $("#hid_label").click(() => toggleModal(event, '#hid_modal', true));
    // what is an activation function?
    $("#atv_label").click(() => toggleModal(event, '#atv_modal', true));
    // what is learning rate?
    $("#lrn_label").click(() => toggleModal(event, '#lrn_modal', true));
    // what is nodes per layer?
    $("#npl_label").click(() => toggleModal(event, '#npl_modal', true));
    $("#format_label").click(() => toggleModal(event, '#format_modal', true));

    // delete em
    $("#del_epc_modal").click(() => toggleModal(event, '#epc_modal', false));
    $("#del_hid_modal").click(() => toggleModal(event, '#hid_modal', false));
    $("#del_atv_modal").click(() => toggleModal(event, '#atv_modal', false));
    $("#del_lrn_modal").click(() => toggleModal(event, '#lrn_modal', false));
    $("#del_npl_modal").click(() => toggleModal(event, '#npl_modal', false));
    $("#del_format_modal").click(() => toggleModal(event, '#format_modal', false));

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
                columns = file[0];
                file.shift(0);

                DATA = []

                file.forEach(arr => {
                    let temp = {
                        input: [],
                        output: []
                    }

                    temp.output = [arr[0]];
                    for (let i = 1; i < arr.length; i++) {
                        temp.input.push(arr[i]);
                    }
                    DATA.push(temp)
                });
            }
        })

    });

    $networks.on("click", ".trainButton", () => {
        trainNetwork(event, user);
    });
}

// toggle a modal
export const toggleModal = function (event, modalID, turnOn) {
    event.preventDefault;
    if (turnOn) {
        document.getElementById(modalID).className += " is-active";
    } else {
        document.getElementById(modalID).className = "modal";
    }
}

export const trainNetwork = function (event, user) {
    let myID = event.target.id;
    let myData = myNets[myID + ""];
    let myBoxes = [];
    let $myForm = $('#edit-form-' + myID)[0];
    for (let i = 1; i <= myData.columns.length; i++) {
        myBoxes.push(parseFloat($myForm['box' + i + ":" + myID].value));
    }
    myBoxes = myBoxes.reverse()
    let network = (netFromJson(myData.net))
    let result = network.run(myBoxes);
    db.collection('users').doc(user.uid).collection('networks').doc(myID).update({
        currentOutput: Math.round(result),
    });
}

//Deleting networks from firestore
export const handleDeleteButton = function (user, network) {
    event.preventDefault();
    const networkId = network[0].getAttribute('data-id');
    db.collection('users').doc(user.uid).collection('networks').doc(networkId).delete();
};

//Editing saved network
export const handleSaveButton = function (event, user, network) {
    event.preventDefault();

    const form = event.currentTarget;
    const title = form['edit-title'].value;
    const description = form['edit-description'].value;
    const networkId = network[0].getAttribute('data-id');
    let userTitle;
    let userDescription;

    db.collection('users').doc(user.uid).collection('networks').doc(networkId).get().then(doc => {
        userTitle = doc.data().title;
        userDescription = doc.data().description;
    }).then(() => {
        db.collection('users').doc(user.uid).collection('networks').doc(networkId).update({
            title: (title.length > 0) ? title : userTitle,
            description: (description.length > 0) ? description : userDescription,
        });
    });
};

//Submitting new network
export const handleSubmitButton = function (event, user) {
    event.preventDefault();
    event.stopPropagation();

    const form = $("#network-form");
    const title = form[0]['title'].value;
    const description = form[0]['description'].value;
    let networkCounter = 0;

    //(act, hidLay, nodesPerLay, iter, lrnRat, DATA, numRows, inputColNames, outputColName) 
    const activationFunction = $('#atv_input')[0].value;
    const hiddenLayers = $('#hid_input')[0].value;
    const nodesPerLayer = $('#npl_input')[0].value;
    const iterations = $('#epc_input')[0].value;
    const learningRate = $('#lrn_input')[0].value;

    let myNetObj = buildANetwork(activationFunction, hiddenLayers, nodesPerLayer, iterations, learningRate, DATA, DATA.length, columns, pdict);

    //updating network count
    db.collection('public').doc('allNetworks').get().then(doc => {
        networkCounter = doc.data().networkCount;
        networkCounter++;
    }).then(() => {
        db.collection('public').doc('allNetworks').update({
            networkCount: networkCounter,
        });
    });

    db.collection('users').doc(user.uid).collection('networks').add({
        title: title,
        description: description,
        net: myNetObj.net.toJSON(),
        acc: myNetObj.acc,
        columns: columns,
        pdict: pdict,
        currentOutput: "(train for result)"
    }).then(() => {
        handleClearButton();
    }).catch(err => {
        alert(err.message);
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

};

//Loading content into DOM
export const renderCreateNetworksArea = function () {

    return `    
        <div class="columns">    
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
                        <label class="label" id="lrn_label" >Learning Rate</label>
                        <div class="control">
                            <div>
                                <div class="control">
                                    <input id="lrn_input" class="input" type="number" step=".01" min="0" max="1" placeholder=".5" required/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="#lrn_modal" class="modal">
                        <div class="modal-background"></div>
                        <div class="modal-card">
                        <header class="modal-card-head">
                            <button id="del_lrn_modal" class="delete" aria-label="close"></button>
                        </header>
                        <section class="modal-card-body">
                            <div class="content">
                            <h1>What is learning rate?</h1>
                            <p>A network’s learning rate is how much that neural network changes each time it trains. A higher learning rate could make a network train faster but it may not be as accurate/precise. .5 is a good learning rate for most networks.</p>
                            </div>
                        </section>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label" id="epc_label">Epocs</label>
                        <div class="control">
                            <input id="epc_input" class="input" type="number" placeholder="300" required/>
                        </div>
                    </div>                
                    <div id="#epc_modal" class="modal">
                        <div class="modal-background"></div>
                        <div class="modal-card">
                        <header class="modal-card-head">
                            <button id="del_epc_modal" class="delete" aria-label="close"></button>
                        </header>
                        <section class="modal-card-body">
                            <div class="content">
                            <h1>What is an epoc?</h1>
                            <p>The number of epochs is the number of times that a neural network trains on a given data set. More epochs could lead to greater accuracy but will it will take a longer amount of time to train the neural network. 300 is a good number of epochs for training most neural networks.</p>
                            </div>
                        </section>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label" id="hid_label">Hidden Layers</label>
                        <div class="control">
                            <input id="hid_input" class="input" type="number" placeholder="4" required/>
                        </div>
                    </div>                
                    <div id="#hid_modal" class="modal">
                        <div class="modal-background"></div>
                        <div class="modal-card">
                        <header class="modal-card-head">
                            <button id="del_hid_modal" class="delete" aria-label="close"></button>
                        </header>
                        <section class="modal-card-body">
                            <div class="content">
                            <h1>What are hidden layers?</h1>
                            <p>The number of hidden layers is the number of layers of neurons in a network between the input and the output. More layers could lead to greater accuracy but the network will require a longer amount of time to train. Four layers is usually plenty but feel free to experiment!</p>
                            </div>
                        </section>
                        </div>

                    </div><div class="field">
                        <label class="label" id="npl_label">Nodes Per Layer</label>
                        <div class="control">
                            <input id="npl_input" class="input" type="number" placeholder="4" required/>
                        </div>
                    </div>                
                    <div id="#npl_modal" class="modal">
                        <div class="modal-background"></div>
                        <div class="modal-card">
                        <header class="modal-card-head">
                            <button id="del_npl_modal" class="delete" aria-label="close"></button>
                        </header>
                        <section class="modal-card-body">
                            <div class="content">
                            <h1>What is nodes per layer?</h1>
                            <p>Nodes per layer is the number of nodes that each layer in a neural network has! More nodes could lead to greater accuracy but the network may require a longer amount of time to train. Four nodes is usually plenty but feel free to experiment!</p>
                            </div>
                        </section>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label" id="atv_label" >Activation Function</label>
                        <div class="control">
                            <div class="select">
                                <select id="atv_input">
                                    <option>sigmoid</option>
                                    <option>tanh</option>
                                    <option>relu</option>
                                    <option>leaky-relu</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div id="#atv_modal" class="modal">
                        <div class="modal-background"></div>
                        <div class="modal-card">
                            <header class="modal-card-head">
                                <button id="del_atv_modal" class="delete" aria-label="close"></button>
                            </header>
                            <section class="modal-card-body">
                                <div class="content">
                                    <h1>What is an activation function?</h1>
                                    <p>Each neuron has something called an activation function. An activation function looks at an input value given to Neuron A and decides whether Neuron A should activate- and by how much.</p>

                                    <img src="img/Activation Function Pics/Step.png" alt="Smiley face" style="height:100; width:100">

                                    <p>The simplest activation function is called a “step” function (pictured above). If the value is given to Neuron A meets a certain criteria (for example, if value is >= 5) than Neuron A fires at 100%. Otherwise, Neuron A does not fire at all. The problem with this activation function is that it does not allow for nuance. Two blue pixels, for example, might not be the same shade of blue. A step activation function could tell you that a pixel was blue but a different activation function could better capture just how blue.</p>
                                    <p>This website allows for the use of four common activation functions that solve this problem:  Sigmoid, Tanh, Relu and Leaky Relu. Activation functions should be chosen based on whether the shape of the function approximates that of the problem you are trying to solve. However, if you don’t enjoy math, guess and check is also a great strategy.</p>
                                    <p>HINT: For binary classification using a neural network (what this website does), Sigmoid and Tanh will likely work the best as they approximate the shape of the binary “step” function.</p>
                                    
                                    <h2>Sigmoid Function:</h2>
                                    <img src="img/Activation Function Pics/Sigmoid.png" alt="Smiley face" style="height:80; width:80">

                                    <h2>Tanh Function:</h2>
                                    <img src="img/Activation Function Pics/Tanh.jpg" alt="Smiley face" style="height:80; width:80">

                                    <h2>Relu Function:</h2>
                                    <img src="img/Activation Function Pics/Relu.png" alt="Smiley face" style="height:80; width:80">

                                    <h2>Leaky Relu Function:</h2>
                                    <img src="img/Activation Function Pics/Leaky Relu.jpg" alt="Smiley face" style="height:80; width:80">
                                </div>
                            </section>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">Short Description</label>
                        <div class="control">
                            <textarea id="description" class="textarea" placeholder="Textarea"></textarea>
                        </div>
                    </div>

                    <div class="field">
                        <label id="format_label" class="label">How Should I Format My Data?</label>
                    </div>
                    <div id="#format_modal" class="modal">
                        <div class="modal-background"></div>
                        <div class="modal-card">
                            <header class="modal-card-head">
                                <button id="del_format_modal" class="delete" aria-label="close"></button>
                            </header>
                            <section class="modal-card-body">
                                <div class="content">
                                    <h1>How should I format my data?</h1>
                                    <p>1. First, using a tool like Google Docs or Microsoft Excel, arrange your training data so that the first row contains column names and subsequent rows contain numeric data. This data could take the form of either true/false (represented as “1” for true and “0” for false) or an integer.</p>

                                    <p>2. Then, make sure that the first column contains the value that you are trying to predict (represented as “1” for true and “0” for false). For example:</p>

                                    <img src="img/Data Example.png" alt="Smiley face" >

                                    <p>3. Finally, download this data as a CSV file and upload it to this website. You may have any number of rows and any number of columns. More rows is generally better when training a network.</p>
                                </div>
                            </section>
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
          
                    <div class="field">
                        <div class="control">
                            <label class="checkbox">
                                <input type="checkbox">
                                I agree to the <a href="#">terms and conditions</a>
                            </label>
                        </div>
                    </div>

                    <div class="field">
                        <div class="control">
                            <label class="radio">
                                <input type="radio" name="question">
                                Yes
                            </label>
                            <label class="radio">
                                <input type="radio" name="question">
                                No
                            </label>
                        </div>
                    </div>
          
                    <div class="field is-grouped">
                        <div class="control">
                            <button id="submit" class="button is-link" type="submit">Submit</button>
                        </div>
                        <div class="control">
                            <button id="clear" class="button is-link is-light" type="buttom">Clear</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
};

export const renderNetworkInputBox = function (columns, id) {

    let result = `<div class="columns is-mobile is-centered is-vcentered">`;

    let i = 0

    columns.forEach(elem => {
        result += (`
        <div class="column">
            <span>"${elem}"</span> 
        </div>
        `);
        i++;
    });

    result += (`
    </div>
    <div class="columns is-mobile is-centered is-vcentered">
    `);

    for (i; i > 0; i--) {
        result += (`
        <div class="column">
            <input id=${"box" + i + ":" + id} class="input" type="number">
        </div>
        `);
    };

    return result += (`</div>`);
}

export const renderNetworksArea = function (network) {


    myNets[network.id] = network.data();

    let result = `    
        <div class="column is-full">
            <div class="box">
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">
                            ${network.data().title}
                        </p>                        
                        <a href="#" class="card-header-icon" aria-label="more options">
                            <span class="icon">
                                <i class="fas fa-angle-down" aria-hidden="true"></i>
                            </span>
                        </a>
                    </header>
                    <div class="card-content">
                        <div class="content">
                            <form id="edit-form-${network.id}">
                            <div>
                            <p><strong><i> ${network.data().description} </i></strong></p>
                            </div> 
                            <br>
                            <br>  
                            ${renderNetworkInputBox(network.data().columns, network.id)}
                            </form>   
                        </div>
                        <div class="columns is-mobile is-centered is-vcentered">
                            <div class="column">
                                <button id="${network.id}" class="trainButton button is-link"">
                                    Train
                                </button>
                            </div>
                            <div class="column">
                                <div class="box">
                                    <span>${network.data().pdict + '?'}</span> 
                                    <span id="resultBox:${network.id}">${network.data().currentOutput}</span>
                                </div>
                            </div>
                            <div class="column">
                                <div class="box">
                                    <span>${'Network is ' + network.data().acc * 100 + '% accurate!'}</span> 
                                </div>
                            </div>
                    </div>
                    
                    <footer class="card-footer">
                        <a href="#" id="editNetwork" data-id="${network.id}" class="card-footer-item modal-trigger" data-target="modal-edit">Edit</a>
                        <a href="#" id="deleteNetwork" data-id="${network.id}" class="card-footer-item">Delete</a>
                    </footer>
                </div>
            </div>
        </div> 
        
        <!-- EDIT MODAL -->
        <div class="modal" id="modal-edit" >
            <div class="modal-content">
                <br>
                <p class="subtitle is-4">Edit Network</p>
                <br>
                <form id="edit-form">                
                    <div class="input-field">
                        <input type="text" id="edit-title">
                        <label for="edit-title">Title</label>
                    </div>
                    <div class="input-field">
                        <input type="text" id="edit-description">
                        <label for="edit-description">Description</label>
                    </div>
                    <button id="saveButton" class="btn yellow darken-2 z-depth-0">Save</button>
                </form>
            </div>
        </div>
    `;
    return result;
};

export const renderUncompleteNetwork = function (network) {
    return `    
        <div class="column is-full">
            <div class="box">
                <div class="card" style="width: 400px">
                    <header class="card-header">
                        <p class="card-header-title">
                            ${network.data().title}
                        </p>
                        <a href="#" class="card-header-icon" aria-label="more options">
                            <span class="icon">
                                <i class="fas fa-angle-down" aria-hidden="true"></i>
                            </span>
                        </a>
                    </header>
                    <div class="card-content">
                        <div class="content">
                            <i> ${network.data().description} </i>
                            <br>
                            
                        </div>
                        <div class="columns is-mobile is-centered is-vcentered">
                            <div class="column">
                                <button class="button">
                                    Train
                                </button>
                            </div>
                            <div class="column">
                                <div class="box">
                                    <span></span> 
                                    <span id="result_ + ${network.id}">(train for result)</span>
                                </div>
                            </div>
                            <div class="column">
                                <div class="box">
                                    <span>${'Network is % accurate!'}</span> 
                                </div>
                            </div>
                    </div>
                    
                    <footer class="card-footer">
                        <a href="#" id="editNetwork" data-id="${network.id}" class="card-footer-item modal-trigger" data-target="modal-edit">Edit</a>
                        <a href="#" id="deleteNetwork" data-id="${network.id}" class="card-footer-item">Delete</a>
                    </footer>
                </div>
            </div>
        </div> 
        
        <!-- EDIT MODAL -->
        <div class="modal" id="modal-edit" >
            <div class="modal-content">
                <br>
                <p class="subtitle is-4">Edit Network</p>
                <br>
                <form id="edit-form">                
                    <div class="input-field">
                        <input type="text" id="edit-title">
                        <label for="edit-title">Title</label>
                    </div>
                    <div class="input-field">
                        <input type="text" id="edit-description">
                        <label for="edit-description">Description</label>
                    </div>
                    <button id="saveButton" class="btn yellow darken-2 z-depth-0">Save</button>
                </form>
            </div>
        </div>
    `;
}

//Calculating number of networks
export const numberOfNetworksFunction = async function () {
    let result = await db.collection('public').doc('allNetworks').get().then((doc) => {
        numberOfNetworks = doc.data().networkCount;
    });
    //updating number of networks
    db.collection('public').doc('allNetworks').onSnapshot(doc => {
        numberOfNetworks = doc.data().networkCount;
    });
};

export const workPlaceNavBar = function () {

    return `    
    <!-- NAVBAR -->
    <nav class=" z-depth-0 white lighten-4" id="navBar">
        <div class="nav-wrapper container">
            <a href="#" class="brand-logo">
                <img src="img/logo.png" style="width: 50px; height: 50px; margin-top: 5px;">
            </a>
            <ul id="nav-mobile" class="right hide-on-med-and-down">
                <li class="logged-in">
                    <a href="#" id="homePage" class="grey-text">Home</a>
                </li>                
                <li class="logged-in">
                    <a href="#" class="grey-text modal-trigger" data-target="modal-account">Account</a>
                </li>
                <li class="logged-in">
                    <a href="#" id="workPlace" class="grey-text">Work Place</a>
                </li>
                <li class="logged-in">
                    <a href="#" id="contactPage" class="grey-text">Contact Us</a>
                </li>
                <li class="logged-in">
                    <a href="#" class="grey-text" id="logout">Logout</a>
                </li>
            </ul>            
        </div>
    </nav>

    <!-- ACCOUNT MODAL -->
    <div id="modal-account" class="modal">
        <div class="modal-content center-align">
            <br>
            <p class="subtitle is-4">Account Details</p> 
            <br>           
            <div class="account-details"></div>
        </div>
    </div>
`;
};
