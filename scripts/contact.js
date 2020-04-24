export const contactPageRender = function () {

    return `
    <div class="card">
        <div class="card-content" style="background-color:rgb(56, 55, 55)">
            <div class="media">
                <div class="media-left">
                    <button onclick="window.open('https://teamd.web.unc.edu/','resizable=yes')" class="button is-dark is-inverted is-outlined">More about the process</button>
                </div>
            </div>
        </div>        
        <div class="card-content">
            <div class="content has-text-centered">
                <div class="columns is-centered">
                    <div class="column">
                        <div class="content has-text-centered">
                            <br>
                            <br>
                            <h1 class="title">
                                <i>Team D</i>
                            </h1>
                            <figure class="image">
                                <img src="images/laptop2.jpg" alt="Placeholder image" style="width: 500px; height: 300px; margin-top: 50px">
                            </figure>
                        </div>
                    </div>            
                    <div class="column">
                        <article class="media">
                            <figure class="media-left image is-128x128">
                                <p class="image is-128x128">
                                    <img class="is-rounded" src="images/kevin.jpg" alt="Kevin Placeholder image" style="width: 128px; height: 128px">
                                </p>
                            </figure>
                            <div class="media-content">
                                <div class="content">
                                    <p>
                                        <h5> <strong> Website Coordinator: </strong> Jackson, Kevin  </h5>
                                        <h6> kevinj89@live.unc.edu </h6>
                                    </p>
                                </div>
                            </div>
                        </article>
                        <article class="media">
                            <figure class="media-left image is-128x128">
                                <p class="image is-128x128">
                                    <img class="is-rounded" src="images/nick.jpg" alt="Nick Placeholder image" style="width: 128px; height: 128px">
                                </p>
                            </figure>
                            <div class="media-content">
                                <div class="content">
                                    <p>
                                        <h5> <strong> Client Manager: </strong> Kellam, Nick </h5>
                                        <h6> kellamni@live.unc.edu </h6>
                                    </p>
                                </div>
                            </div>
                        </article> 
                        <article class="media">
                            <figure class="media-left image is-128x128">
                                <p class="image is-128x128">
                                    <img class="is-rounded" src="images/keilly.jpg" alt="Keilly Leyva picture" style="width: 128px; height: 128px">
                                </p>
                            </figure>
                            <div class="media-content">
                                <div class="content">
                                    <p>
                                        <h5> <strong> Project Manager: </strong> Leyva, Keilly </h5>
                                        <h6> lkeilly@live.unc.edu </h6>
                                    </p>
                                </div>
                            </div>
                        </article>
                        <article class="media">
                            <figure class="media-left image is-128x128">
                                <p class="image is-128x128">
                                    <img class="is-rounded" src="images/vijay.jpg" alt="Vijay Placeholder image" style="width: 128px; height: 128px">
                                </p>
                            </figure>
                            <div class="media-content">
                                <div class="content">
                                    <p>
                                        <h5> <strong> Tech Lead: </strong> Rachakonda, Vijay </h5>
                                        <h6> vij@live.unc.edu </h6>
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
