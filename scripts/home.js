
export const homeNavBar = function () {

    return `    
    <nav class="navbar" role="navigation" aria-label="main navigation" id="navBar">
        <div id="navbarBasicExample" class="navbar-menu">
            <div class="navbar-start">
                <a class="navbar-item" id="home">
                    Home
                </a>
                <a class="navbar-item" id="workPlace">
                    AI Engine
                </a>
                <a class="navbar-item" id="contactPage">
                    Contact Us
                </a>
            </div>
        </div>                  
    </nav>   
    `;
};

export const homeBody = function () {

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
            <div class="content has-text-centered is-family-sans-serif has-text-weight-medium has-text-grey-dark is-size-2">
                <p class="subtitle is-5 notification"> City News Beat, Inc. owns and operates the streaming Television channels Tar Heel News Beat, Seattle News Beat, NYC News Beat and Bay Area News Beat for Roku users. Incubated as part of Cohort 11 in 2019 @Launch-Chapel Hill, a not-for-profit organization funded by the Town of Chapel Hill, Orange County and the University of North Carolina, City News Beat is committed to delivering an agenda-free view of local news and weather for the cord-cutter and Smart TV communities they serve across the USA.
                <br>
                <br>
                We are going to create an A.I. engine that can read different data sources including questions asked at the time the app is loaded, that matches 3rd party data to know more about the device users’ interests. Our goal is to deliver each user a Newscast-for-1 based on those preferences.</p>
                <br>
            </div>            
        </div>
    </div>
    `;
};
