export const homeNavBarPublicRender = function () {

    return `
    <!-- NAVBAR -->
    <nav class=" z-depth-0 white lighten-4" id="navBar">
        <div id="networks" class="content is-family-sans-serif has-text-weight-medium has-text-white">
            <p>We have trainned ${numberOfNetworks} networks!!</p>
        </div>
        <div class="nav-wrapper container">
            <a href="#" class="brand-logo">
                <img src="img/logo.png" style="width: 50px; height: 50px; margin-top: 5px;">
            </a>
            <ul id="nav-mobile" class="right hide-on-med-and-down">
                <li class="logged-out">
                    <a href="#" class="grey-text modal-trigger" data-target="modal-login">Login</a>
                </li>
                <li class="logged-out">
                    <a href="#" class="grey-text modal-trigger" data-target="modal-signup">Sign up</a>
                </li>
            </ul>
        </div>
    </nav>

    <!-- SIGN UP MODAL -->
    <div id="modal-signup" class="modal">
        <div class="modal-content">
            <br>
            <p class="subtitle is-4">Sign Up</p>
            <form id="signup-form">                
                <div class="input-field">
                    <input type="text" id="signup-name" required />
                    <label for="signup-name">Name</label>
                </div>
                <div class="input-field">
                    <input type="email" id="signup-email" required />
                    <label for="signup-email">Email address</label>
                </div>
                <div class="input-field">
                    <input type="password" id="signup-password" required />
                    <label for="signup-password">Choose password</label>
                </div>
                <div class="input-field">
                    <input type="text" id="signup-bio" required />
                    <label for="signup-bio">One Line Bio</label>
                </div>
                <button id="signupButton" class="btn yellow darken-2 z-depth-0">Sign up</button>
            </form>
        </div>
    </div>
  
    <!-- LOGIN MODAL -->
    <div id="modal-login" class="modal">
        <div class="modal-content">
            <br>
            <p class="subtitle is-4">Log in</p>
            <form id="login-form">
                <div class="input-field">
                    <input type="email" id="login-email" required />
                    <label for="login-email">Email address</label>
                </div>
                <div class="input-field">
                    <input type="password" id="login-password" required />
                    <label for="login-password">Your password</label>
                </div>
                <button class="btn yellow darken-2 z-depth-0">Login</button>
                <div>
                    <br>
                    <button id="googleSignIn" class="btn yellow darken-2 z-depth-0">
                        <span class="icon is-medium">
                            <i class="fab fa-google"></i>
                        </span>
                        <span>Sign in with Google</span>
                    </button>
                </div>
            </form>
        </div>
    </div>    
`;
};

export const homeBodyPublicRender = function () {

    return `
    <div class="card">
        <div class="content has-text-centered">
            <div class="card-content" style="background-color:rgb(56, 55, 55)">
                <div class="media">
                    <div class="media-left">
                        <button onclick="window.open('https://skymind.ai/wiki/neural-network','resizable=yes')" class="button is-dark is-inverted is-outlined">Learn More</button>
                    </div>
                </div>
            </div>
            <figure class="image">
                <img src="img/laptop1.jpg" alt="Placeholder image" style="width: 500px; height: 300px; margin-top: 50px">
            </figure>
        </div>
        <div class="card-content container is-widescreen">
            <div class="content has-text-centered is-family-sans-serif has-text-weight-medium has-text-grey-dark is-size-3">
                <p class="subtitle is-4 notification"> Harness the power of machine learning for your application needs. 
                Just configure the kind of network you want, we will do the rest.</p>
                <br>
            </div>            
        </div>
    </div>
    `;
};

export const homeNavBarPrivateRender = function () {

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
            <div class="search-container">
            <form action="/action_page.php">
                <input type="text" id="searchBarID" placeholder="Search Users.." name="search">
            </form>
            </div>
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
    <script>
    $('#searchBarID').autocomplete({
        source: function(request,response) { 
            let names = [];
            let ids = [];
            let users = [];
            db.collection('users').get().then(users => {
                for(let i = 0; i<users.docs.length; i++){
                    names[i] = users.docs[i].data().name;
                    ids[i] = users.docs[i].id;
                    users[i]={name: names[i], id: ids[i]};
                }
                let result = [];
                console.log(request.term);
                result = names.filter(name => name.toLowerCase().includes(request.term.toLowerCase()));
                response(result);
            })
            }
        },{})
    </script>
`;
}

export const homeBodyPrivateRender = function (user) {
    const $usersList = $(".users");

    db.collection('users').onSnapshot(snapshot => {
        $usersList.html(snapshot.docs.map(renderUsers(user)));

        $usersList.on("click", "#like", () => {
            handleLikeButton(event, user);
        });

    }, err => console.log(err.message));
};

export const homeBodyPrivateSearchRender = function (criteria, user) {
    const $usersList = $(".users");

    let names = [];
    let ids = [];
    let userObjects = [];
    let resultObjects = [];
    let profiles = [];
    db.collection('users').get().then(users => {
        for(let i = 0; i<users.docs.length; i++){
            names[i] = users.docs[i].data().name;
            ids[i] = users.docs[i].id;
            userObjects[i] = {name: names[i], id: ids[i]};
        }
        resultObjects = userObjects.filter(particularUser => particularUser['name'].toLowerCase().includes(criteria.toLowerCase()));
    }).then(()=>{
        for(let i = 0; i<resultObjects.length; i++){
            db.collection('users').doc(resultObjects[i].id).get().then(users =>{
                profiles[i] = users;
            })
            }
        setTimeout(function(){
            $usersList.html(profiles.map(renderUsers(user)));
         }, 300);
        
    })


};

export const handleLikeButton = function (event, user) {
    event.preventDefault();
    let profileId = event.target.value;
    let currUser = user.uid;
    let likeCounter;
    let like;

    db.collection('likes').doc(profileId).get().then(doc => {
        let arrLikes = doc.data().liked;
        let isUnlike = arrLikes.filter(item => item == currUser);
        likeCounter = doc.data().likesCount;

        if (isUnlike.length > 0) {
            let index = arrLikes.indexOf(currUser);
            arrLikes.splice(index, 1);
            likeCounter--;
            like = "Like";

            db.collection('likes').doc(profileId).update({
                liked: arrLikes,
                likesCount: likeCounter,
            });

        } else {
            arrLikes.push(currUser);
            likeCounter++;
            like = "Unlike";

            db.collection('likes').doc(profileId).update({
                liked: arrLikes,
                likesCount: likeCounter,
            });
        }
    }).then(() => {
        let $likeDiv = $("#Like" + profileId);
        let $CountDiv = $("#Count" + profileId);
        $CountDiv.html(`
                <div>
                    <p class="heading">Likes</p>
                    <p class="title">${likeCounter}</p>
                </div>
            `);
        $likeDiv.html(`</div><button id="like" value="${profileId}" class="level-item button is-dark" type = "button" style="float:right; width:80px"> ${like} </button>`);
    });
};

export const userFormat = function () {

    return `
        <!-- USER LIST -->
        <div class="container" style="margin-top: 40px;">
            <ul class="users">
            </ul>
        </div>
    `;
};

export const renderUsers = function (user) {

     return function (doc) {
        
        if (doc.length < 1) {
            return ``;
        }
        let like = "";
        let likesCount = 0;
        let userLiked;

        db.collection('users').doc(doc.id).collection('networks').orderBy('title').get().then(item => {
            let $userNetworks = $('#' + doc.id);

            if (item.docs.length > 0) {
                $userNetworks.html(item.docs.map(renderNetworks));
            }
        });

        db.collection('likes').doc(doc.id).get().then(item => {
            if (item.data().liked.length > 0) {
                userLiked = item.data().liked.filter(id => id == user.uid);
                if (userLiked.length > 0) {
                    like = "Unlike";
                }
                likesCount = item.data().likesCount;
            }
        }).then(() => {
            if (like != "Unlike") {
                like = "Like";
            }
            let $likeDiv = $("#Like" + doc.id);
            let $CountDiv = $("#Count" + doc.id);
            $CountDiv.html(`
                <div>
                    <p class="heading">Likes</p>
                    <p class="title">${likesCount}</p>
                </div>
            `);
            $likeDiv.html(`</div><button id="like" value="${doc.id}" class="level-item button is-dark" type = "button" style="float:right; width:80px"> ${like} </button>`);
        });

        const currUser = doc.data();
        let userPic;

        if (currUser.pic.length > 0) {
            userPic = currUser.pic;
        } else {
            userPic = "https://bulma.io/images/placeholders/256x256.png";
        }

        return `
        <div class="card">
            <div class="card-content">
                <div class="media">
                    <div class="media-left">
                        <figure class="image is-256x256">
                            <img src=${userPic} alt="Placeholder image" style="width:256px; height:256px">
                        </figure>
                    </div>
                    <div class="media-content">
                        <br>
                        <p class="title is-2">${currUser.name}</p>
                        <p class="title is-6">${currUser.email}</p>
                        <br>
                        <p class="subtitle is-4 content">${currUser.bio}</p>
                    </div>
                    <br>
                    <div>                    
                        <div id="Count${doc.id}" class="level-item has-text-centered">
                            <div>
                                <p class="heading">Likes</p>
                                <p class="title">0</p>
                            </div>
                        </div>
                        <br>
                        <div id="Like${doc.id}">
                            <button id="like" value="${doc.id}" class="level-item button is-dark" type = "button" style="float:right; width:80px"> ${like} </button>
                        </div>
                    </div>
                </div>
                <br>
                <div id="${doc.id}"></div>                     
            </div>
        </div>  
    `;
    }
};

export const renderNetworks = function (doc) {
    let network = doc.data();
    return `
    <div class="column is-full">
        <div class="card">
            <header class="card-header">
                <p class="card-header-title">
                    ${network.title}
                </p>                
            </header>
            <div class="card-content">
                <div class="content">
                    <i> ${network.description} </i>
                    <br>
                </div>
            </div>            
        </div>
    </div>
    `;
};
