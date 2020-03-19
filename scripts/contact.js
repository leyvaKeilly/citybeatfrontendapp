export const simpleNavBar = function () {

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

export const contactPageRender = function () {

    return `
    <div class="card">        
        <div class="card-content">
            <div class="content has-text-centered">
                <div class="columns is-centered">
                    <div class="column">
                        <div class="content has-text-centered">
                            <br>
                            <h1 class="title">
                                <i>The Edge Cases</i> Team
                            </h1>
                            <figure class="image">
                                <img src="img/laptop2.jpg" alt="Placeholder image" style="width: 500px; height: 300px; margin-top: 50px">
                            </figure>
                        </div>
                    </div>            
                    <div class="column">
                        <article class="media">
                            <figure class="media-left image is-128x128">
                                <p class="image is-128x128">
                                    <img class="is-rounded" src="img/image1.png" alt="Placeholder image" style="width: 128px; height: 128px">
                                </p>
                            </figure>
                            <div class="media-content">
                                <div class="content">
                                    <p>
                                        <h3> Keilly Leyva </h3>
                                        <h5> lkeilly@live.unc.edu </h5>
                                    </p>
                                </div>
                            </div>
                        </article>
                        <article class="media">
                            <figure class="media-left image is-128x128">
                                <p class="image is-128x128">
                                    <img class="is-rounded" src="img/micah.jpg" alt="Placeholder image" style="width: 128px; height: 128px">
                                </p>
                            </figure>
                            <div class="media-content">
                                <div class="content">
                                    <p>
                                        <h3> Micah Jhaycraft </h3>
                                        <h5> micahjhaycraft@gmail.com </h5>
                                    </p>
                                </div>
                            </div>
                        </article>
                        <article class="media">
                            <figure class="media-left image is-128x128">
                                <p class="image is-128x128">
                                    <img class="is-rounded" src="img/elijah.jpg" alt="Placeholder image" style="width: 128px; height: 128px">
                                </p>
                            </figure>
                            <div class="media-content">
                                <div class="content">
                                    <p>
                                        <h3> Elija Wilde </h3>
                                        <h5> eswilde98@gmail.com </h5>
                                    </p>
                                </div>
                            </div>
                        </article>             
                    </div>                    
                </div>
                <br>   
            </div>            
        </div>
    </div>
    `;
};
