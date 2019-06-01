firebase.auth().onAuthStateChanged(function(user) {
  document.getElementById("loading").style.display = "none";
  if (user) {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("loggedIn").style.display = "block";

    var user = firebase.auth().currentUser;

    if ( user != null) {
      document.getElementById("login_subtext").innerHTML = "You are currently logged in as " + user.email;
    }
  } else {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("loggedIn").style.display = "none";
  }
});


function login() {

  var userEmail = document.getElementById("userInput").value;
  var userPassword = document.getElementById("passwordInput").value;

  firebase.auth().signInWithEmailAndPassword(userEmail, userPassword).catch(function(error) {

    var errorCode = error.code;
    var errorMessage = error.message;

    window.alert("We are sorry, something is not quite right.\n\nError code:\n" + errorCode + "\n\nError message:\n" + errorMessage);
  });
}

function logout() {
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    window.alert("We are sorry, something is not quite right.\n\nError message:\n" + errorMessage);
  });
}