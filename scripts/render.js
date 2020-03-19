import { handleSignupButton, handleLogoutButton, handleSigninButton, handleSigninWithGoogle } from "./auth.js";
import { homeNavBarPublicRender, homeBodyPublicRender, homeNavBarPrivateRender } from "./home.js";
import { contactPageRender } from "./contact.js";
import { workPlaceRender } from "./workSpace.js";

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

    //Setting work place page as default when rendering for first time
    if (page != -1) {
        setPage(page, user);
    }

    //Contact page    
    $("#contactPage").click(() => {
        setPage(2, user);
    });

    //Work place page
    $("#workPlace").click(() => {
        setPage(3, user);
    });
};

export const setPage = function (page, user) {
    const $body = $("#body");
    const $root = $("#root");

    switch (page) {
        //Contact
        case 2:
            $root.html(homeNavBarPrivateRender());
            $body.html(contactPageRender());
            allUsersInfo(user, -1);
            break;

        //Work place
        case 3:
            $root.html(homeNavBarPrivateRender());
            workPlaceRender(user);
            allUsersInfo(user, -1);
            break;
    }
};

export const loadPageIntoDOM = async function () {

    const $root = $("#root");

    // listen for auth status changes
    auth.onAuthStateChanged(user => {
        //rendering page if user logged in
        if (user) {
            $root.html(homeNavBarPrivateRender());
            renderPage(user, 3);
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
