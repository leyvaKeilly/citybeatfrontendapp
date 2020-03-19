import { handleSignupButton, handleLogoutButton, handleSigninButton, handleSigninWithGoogle } from "./auth.js";
import { homeNavBarPublicRender, homeBodyPublicRender, homeBodyPrivateRender, homeNavBarPrivateRender, userFormat, homeBodyPrivateSearchRender } from "./home.js";
import { contactPageRender, simpleNavBar } from "./contact.js";
import { workPlaceRender, numberOfNetworksFunction, workPlaceNavBar } from "./workSpace.js";

export const renderPage = function (user, page) {

    if (user) {
        allUsersInfo(user, page);
    } else {
        publicInfo();
    }
};
export const publicInfo = function () {
    // setup materialize components
    let modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    let items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);

    // signup
    const $signupForm = $("#signup-form");
    $signupForm.on("submit", handleSignupButton);

    // login
    const $loginForm = $('#login-form');
    $loginForm.on("submit", handleSigninButton);

    //login with google
    $loginForm.on("click", "#googleSignIn", handleSigninWithGoogle);

    const $body = $("#body");
    $body.html(homeBodyPublicRender());
};

export const allUsersInfo = function (user, page) {

    // setup materialize components
    let modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    let items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);

    //log out
    const $logout = $("#logout");
    $logout.on("click", handleLogoutButton);

    //Setting home page as default when rendering for first time
    if (page != -1) {
        setPage(page, user);
    }

    //Home page
    $("#homePage").click(() => {
        setPage(1, user);
    });

    $("#searchBarID").unbind('keypress').bind('keypress', function (e) {

        if (e.which === 13) {

            e.preventDefault();
            e.stopPropagation();

            handleSearchEnter(user);
        }
    });

    //Contact page    
    $("#contactPage").click(() => {
        setPage(2, user);
    });

    //Work place page
    $("#workPlace").click(() => {
        setPage(3, user);
    });

    setTimeout(() => {
        //User account info
        renderAccountInfo(user);
    }, 1000);
};

export const setPage = function (page, user) {
    const $body = $("#body");
    const $root = $("#root");

    switch (page) {
        //Home page
        case 1:
            $root.html(homeNavBarPrivateRender());
            $body.html(userFormat());
            homeBodyPrivateRender(user);
            allUsersInfo(user, -1);
            break;

        //Contact
        case 2:
            $root.html(simpleNavBar());
            $body.html(contactPageRender());
            allUsersInfo(user, -1);
            break;

        //Work place
        case 3:
            $root.html(workPlaceNavBar());
            workPlaceRender(user);
            allUsersInfo(user, -1);
            break;
    }
};

export const renderAccountInfo = function (user) {
    // account info
    const $accountDetails = $(".account-details");

    db.collection('users').doc(user.uid).get().then(doc => {

        const html = `
            <div class="card" id="userAcc">  
                <div class="card-content">
                    <div class="media">
                        <div class="media-left">
                            <figure class="image is-48x48">
                                <img src="https://bulma.io/images/placeholders/96x96.png" alt="Placeholder image">
                            </figure>
                        </div>
                        <div class="media-content">
                            <p class="title is-4">${user.email}</p>
                        </div>                        
                    </div>
                    <div class="media-content">
                            <p class="subtitle is-6"> ${doc.data().bio}</p>
                    </div>
                    <br>                    
                    <a href="#" id="editUser" data-id="${user.uid}" class="card-footer-item modal-trigger btn yellow darken-2 z-depth-0" data-target="modal-userEdit">Edit</a>
                </div>
            </div>

            <!-- EDIT MODAL -->
            <div class="modal" id="modal-userEdit" >
                <div class="modal-content">
                    <p class="subtitle is-4">Edit Account</p>
                    <form id="edit-userForm">                
                        <div class="input-field">
                            <input type="text" id="edit-name">
                            <label for="edit-name">Name</label>
                        </div>
                        <div class="input-field">
                            <input type="text" id="edit-bio">
                            <label for="edit-bio">Edit bio</label>
                        </div>
                        <br>
                        <div class="file has-name is-fullwidth">
                            <label class="file-label">
                                <input class="file-input" type="file" value="upload" id="pic">
                                <span class="file-cta">
                                    <span class="file-icon">
                                        <i class="fas fa-upload"></i>
                                    </span>
                                    <span class="file-label">
                                        Choose a pic…
                                    </span>
                                </span>
                                <span class="file-name">
                                </span>
                            </label>
                        </div>
                        <br>
                        <div class="columns is-mobile is-multiline is-centered">
                            <div class="loader" style="display: none"></div>
                        </div>
                        <button id="saveUserButton" class="btn yellow darken-2 z-depth-0">Save</button>
                    </form>
                </div>
            </div>
        `;
        $accountDetails.html(html);
    }).then(() => {
        let modals = document.querySelectorAll('.modal');
        M.Modal.init(modals);
        let $editUserForm = $("#edit-userForm");
        let file = "";

        //Uploading pic
        $editUserForm.on("change", "#pic", () => {
            file = event.target.files[0];
            let $name = $(".file-name");
            $name.html(file.name);
        });

        // Save changes
        $editUserForm.submit(() => handleEditUserButton(event, user, file));
    });
};

export const handleEditUserButton = function (event, user, file) {
    event.preventDefault();

    const form = event.currentTarget;
    const name = form['edit-name'].value;
    const bio = form['edit-bio'].value;
    const loader = $(".loader");
    let userName;
    let userBio;
    let newPic = "";

    //No file updated
    if (file.length <= 0) {
        db.collection('users').doc(user.uid).get().then(doc => {
            userName = doc.data().name;
            userBio = doc.data().bio;
        }).then(() => {
            db.collection('users').doc(user.uid).update({
                name: (name.length > 0) ? name : userName,
                bio: (bio.length > 0) ? bio : userBio,
            }).then(() => {
                renderAccountInfo(user);
            });
        });
        return;
    }

    //File updated
    let storageRef = storage.ref('users/images/' + file.name);
    let task = storageRef.put(file);

    task.on('state_changed', function (snapshot) {

        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                alert('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                loader.show();
                break;
        }
    }, function (error) {
        switch (error.code) {
            case 'storage/unauthorized':
                alert("Unauthorized");
                break;
            case 'storage/canceled':
                alert("Canceled");
                break;
            case 'storage/unknown':
                alert("Unknown");
                break;
        }
    }, function () {
        // Upload completed successfully, now we can get the download URL
        task.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            newPic = downloadURL;

            db.collection('users').doc(user.uid).get().then(doc => {
                userName = doc.data().name;
                userBio = doc.data().bio;
            }).then(() => {
                db.collection('users').doc(user.uid).update({
                    name: (name.length > 0) ? name : userName,
                    bio: (bio.length > 0) ? bio : userBio,
                    pic: newPic,
                }).then(() => {
                    loader.hide();
                    renderAccountInfo(user);
                });
            });
        });
    });
};

export const handleSearchEnter = function (user) {

    let criteria = $("#searchBarID").val();

    homeBodyPrivateSearchRender(criteria, user);
}

export const loadPageIntoDOM = async function () {

    const $root = $("#root");
    let result = await numberOfNetworksFunction();

    // listen for auth status changes
    auth.onAuthStateChanged(user => {
        //rendering page if user logged in
        if (user) {
            $root.html(homeNavBarPrivateRender());
            renderPage(user, 1);
        } else {
            //rendering page if user logged out
            $root.html(homeNavBarPublicRender());
            renderPage();
        }
    });
};
/**
 * Use jQuery to execute the loadPageIntoDOM function after the page loads
 */
$(function () {
    loadPageIntoDOM();
});
