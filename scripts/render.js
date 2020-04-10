import { homeNavBar, homeBody } from "./home.js";
import { contactPageRender } from "./contact.js";
import { workPlaceRender } from "./workSpace.js";

export const renderPage = function (page) {

    // setup materialize components
    let modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    let items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);

    //Setting work place page as default when rendering for first time
    if (page != -1) {
        setPage(page);
    }

    //Home page
    $("#home").click(() => {
        setPage(1);
    });

    //Work place page
    $("#workPlace").click(() => {
        setPage(2);
    });

    //Contact page    
    $("#contactPage").click(() => {
        setPage(3);
    });
};

export const setPage = function (page) {
    const $body = $("#body");

    switch (page) {
        //Home
        case 1:
            $body.html(homeBody());
            renderPage(-1);
            break;
        //Work place
        case 2:
            $body.html(workPlaceRender());
            renderPage(-1);
            break;
        //Contact
        case 3:
            $body.html(contactPageRender());
            renderPage(-1);
            break;
    }
};

export const loadPageIntoDOM = async function () {

    const $root = $("#root");

    //rendering home page
    $root.html(homeNavBar());
    renderPage(1);
};
/**
 * Use jQuery to execute the loadPageIntoDOM function after the page loads
 */
$(function () {
    loadPageIntoDOM();
});
