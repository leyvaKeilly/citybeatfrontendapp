export const homeNavBarPublicRender = function () {

    return `
    <!-- NAVBAR -->
    <nav class=" z-depth-0 white lighten-4" id="navBar">
        <div class="nav-wrapper container">
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
                <button id="signupButton" class="btn grey darken-3 z-depth-0">Sign up</button>
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
                <button class="btn grey darken-3 z-depth-0">Login</button>
                <div>
                    <br>
                    <button id="googleSignIn" class="btn grey darken-3 z-depth-0">
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
                        <button onclick="window.open('https://getnewsbeat.com/','resizable=yes')" class="button is-dark is-inverted is-outlined">Learn More</button>
                    </div>
                </div>
            </div>
            <figure class="image">
                <img src="images/citynewsbeat.jpg" alt="City News Beat App Image" style="width: 500px; height: 300px; margin-top: 50px">
            </figure>
        </div>
        <div class="card-content container is-widescreen">
            <div class="content has-text-centered is-family-sans-serif has-text-weight-medium has-text-grey-dark is-size-3">
                <p class="subtitle is-4 notification"> City News Beat, Inc. owns and operates the streaming Television channels Tar Heel News Beat, Seattle News Beat, NYC News Beat and Bay Area News Beat for Roku users. Incubated as part of Cohort 11 in 2019 @Launch-Chapel Hill, a not-for-profit organization funded by the Town of Chapel Hill, Orange County and the University of North Carolina, City News Beat is committed to delivering an agenda-free view of local news and weather for the cord-cutter and Smart TV communities they serve across the USA.
                <br>
                <br>
                We are going to create an A.I. engine that can read different data sources including questions asked at the time the app is loaded, that matches 3rd party data to know more about the device users’ interests. Our goal is to deliver each user a Newscast-for-1 based on those preferences.</p>
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
            <ul id="nav-mobile" class="right hide-on-med-and-down">
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
`;
};
