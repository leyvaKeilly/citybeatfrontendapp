
export const handleSignupButton = function (event) {

    event.preventDefault();
    const form = event.currentTarget;
    const name = form['signup-name'].value;
    const email = form['signup-email'].value;
    const password = form['signup-password'].value;

    // sign up the user & add firestore data
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        //creating likes collection for user
        let arrLikes = [];
        db.collection('likes').doc(cred.user.uid).set({
            liked: arrLikes,
            likesCount: 0,
        });
        //adding user at user collection
        return db.collection('users').doc(cred.user.uid).set({
            name: name,
            email: email,
            bio: form['signup-bio'].value,
            pic: "",
        });
    }).then(() => {
        // close the signup modal & reset form
        const modal = document.querySelector('#modal-signup');
        M.Modal.getInstance(modal).close();
        form.reset();
    }).catch(err => {
        if (err.message != "t is null") {
            alert(err.message);
        }
    });
};

export const handleLogoutButton = function (event) {

    event.preventDefault();
    auth.signOut().then(() => {
    }).catch(err => alert(err));
};

export const handleSigninButton = function (event) {

    event.preventDefault();
    // get user info
    const form = event.currentTarget;
    const email = form['login-email'].value;
    const password = form['login-password'].value;

    // log the user in
    auth.signInWithEmailAndPassword(email, password).then((cred) => {
        // close the signup modal & reset form
        const modal = document.querySelector('#modal-login');
        M.Modal.getInstance(modal).close();
        form.reset();
    }).catch(err => alert(err.message));
};

export const handleSigninWithGoogle = function (event) {
    event.preventDefault();

    firebase.auth().signInWithPopup(provider).then(function (result) {
        let token = result.user.uid;
        // The signed-in user info.
        let user = result.user;

        db.collection('users').doc(token).get().then((doc) => {

            //First time user
            if (doc.data() == undefined) {
                //creating likes collection for user
                let arrLikes = [];
                db.collection('likes').doc(token).set({
                    liked: arrLikes,
                    likesCount: 0,
                });
                //adding user at user collection
                return db.collection('users').doc(token).set({
                    name: user.displayName,
                    email: user.email,
                    bio: "",
                    pic: user.photoURL,
                });
            }
        });
    }).catch(function (error) {
        // Handle Errors here.
        let errorMessage = error.message;
        alert(errorMessage);
    });
};
