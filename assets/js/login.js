import firebase from "./firebase-config.js";

const domain = window.location.href.split("/")[2];

const checkLoginStatus = () => {
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			if (user.displayName === null) {
				if (domain === "todos.webopers.com") window.location.href = "/information/";
				else window.location.href = "/accounts/information.html";
			} else {
				firebase
					.database()
					.ref(`users/${user.uid}`)
					.once("value")
					.then((userData) => {
						const { position: userPosition } = userData.val();
						if (userPosition === "manager") {
							window.location.href = "/";
						} else {
							window.location.href = "/shipper/";
						}
					});
			}
		}
	});
};

const isValidEmail = (email) => {
	const atPosition = email.indexOf("@");
	const dotPosition = email.lastIndexOf(".");
	if (atPosition < 1 || dotPosition < atPosition + 2 || dotPosition + 2 >= email.length) {
		return false;
	}
	return true;
};

const onLoginBtnClicked = () => {
	const username = usernameInput.value;
	const password = passwordInput.value;
	suppressError();
	changeInputStatus(true, loginBtn);
	if (username === "") showError("username", "Username or email is not allowed to empty");
	else if (password === "") showError("password", "Password must be at least 6 character");
	else if (isValidEmail(username) === false) showError("username", "Username or email does not exist");
	else doLogin(username, password);
};

const onCreateBtnClicked = () => {
	changeInputStatus(true, createBtn);
	if (domain === "todos.webopers.com") location.href = "/register/";
	else location.href = "/accounts/register.html";
};

const changeInputStatus = (isDisabled, buttonElement) => {
	for (const key in inputs) if (inputs.hasOwnProperty(key)) inputs[key].disabled = isDisabled;
	buttonElement.disabled = isDisabled;
	if (isDisabled) buttonElement.children[0].style.display = "block";
	else buttonElement.children[0].style.display = "none";
};

const showError = (inputID, message) => {
	const input = document.getElementById(inputID);
	const showPlace = input.parentElement;
	const errorElement = showPlace.children[2];
	changeInputStatus(false, loginBtn);
	input.focus();
	showPlace.classList.add("input-group-alert");
	errorElement.innerText = message;
};

const suppressError = () => {
	const inputGroups = document.getElementsByClassName("input-group-item");
	for (const key in inputGroups) if (inputGroups.hasOwnProperty(key)) inputGroups[key].classList.remove("input-group-alert");
};

const doLogin = (username, password) => {
	firebase
		.auth()
		.signInWithEmailAndPassword(username, password)
		.catch(function (error) {
			const errorCode = error.code;
			if (errorCode === "auth/user-not-found") showError("username", "Username is password does not exist");
			else if (errorCode === "auth/wrong-password") showError("password", "Password is incorrect");
		});
};

const changeLanguage = (languageCode) => {
	const ref = firebase.database().ref("languages/" + languageCode + "/login");
	ref.once("value", (dataSnapshot) => {
		const value = dataSnapshot.val();
		document.getElementById("sub-heading").innerText = value.subTitle;
		createBtn.innerHTML = value.createBtn;
		usernameInput.placeholder = value.usernamePlaceholder;
		passwordInput.placeholder = value.passwordPlaceholder;
		document.getElementById("forgot-password").innerText = value.forgotPassword;
		document.getElementById("login-btn-text").innerText = value.loginBtn;
		console.log(value);
	});
};

const onShowPasswordBtnClicked = () => {
	const clickElement = event.target;
	const passwordInputs = Object.values(inputs).filter((input) => input.dataset.type === "password");
	if (clickElement.dataset.action === "show") {
		passwordInputs.map((input) => (input.type = "text"));
		clickElement.dataset.action = "hide";
		clickElement.classList.remove("fa-eye");
		clickElement.classList.add("fa-eye-slash");
	} else {
		passwordInputs.map((input) => (input.type = "password"));
		clickElement.dataset.action = "show";
		clickElement.classList.add("fa-eye");
		clickElement.classList.remove("fa-eye-slash");
	}
};

const inputs = document.getElementsByClassName("input-group-item-text");
const loginBtn = document.getElementById("login-btn");
const createBtn = document.getElementById("create-btn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const showPasswordBtn = document.getElementById("show-password");

loginBtn.addEventListener("click", onLoginBtnClicked);
document.addEventListener("keypress", () => (event.keyCode === 13 ? onLoginBtnClicked() : ""));
createBtn.addEventListener("click", onCreateBtnClicked);
showPasswordBtn.addEventListener("click", onShowPasswordBtnClicked);

checkLoginStatus();
