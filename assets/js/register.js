import firebase from "./firebase-config.js";

const checkLoginStatus = () => {
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			if (user.displayName !== null) location.href = "/";
			else if (domain === "todos.webopers.com") location.href = "/information/";
			else location.href = "/accounts/information.html";
		}
	});
};

const onLoginBtnClicked = () => {
	changeInputStatus(true, loginBtn);
	if (domain === "todos.webopers.com") location.href = "/login/";
	else location.href = "/accounts/login.html";
};

const onRegisterBtnClicked = () => {
	const username = usernameInput.value;
	const password = passwordInput.value;
	const confirmPassword = confirmPasswordInput.value;
	suppressError();
	changeInputStatus(true, registerBtn);
	if (username === "") showError("username", "Email is not allowed to empty");
	else if (isValidEmail(username) === false) showError("username", "Email is invalid");
	else if (password === "") showError("password", "Password must be at least 6 character");
	else if (password !== confirmPassword) showError("confirm-password", "Confirm password does not match");
	else doRegister(username, password);
};

const doRegister = (username, password) => {
	firebase
		.auth()
		.createUserWithEmailAndPassword(username, password)
		.catch(function (error) {
			const errorCode = error.code;
			if (errorCode === "auth/email-already-in-use") showError("username", "Email is already taken");
		});
};

const isValidEmail = (email) => {
	const atPosition = email.indexOf("@");
	const dotPosition = email.lastIndexOf(".");
	if (atPosition < 1 || dotPosition < atPosition + 2 || dotPosition + 2 >= email.length) return false;
	else return true;
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
	changeInputStatus(false, registerBtn);
	input.focus();
	showPlace.classList.add("input-group-alert");
	errorElement.innerText = message;
};

const suppressError = () => {
	const inputGroups = document.getElementsByClassName("input-group-item");
	for (const key in inputGroups) if (inputGroups.hasOwnProperty(key)) inputGroups[key].classList.remove("input-group-alert");
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

const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const inputs = document.getElementsByClassName("input-group-item-text");
const showPasswordBtn = document.getElementById("show-password");

loginBtn.addEventListener("click", onLoginBtnClicked);
registerBtn.addEventListener("click", onRegisterBtnClicked);
document.addEventListener("keypress", () => (event.keyCode === 13 ? onRegisterBtnClicked() : ""));
showPasswordBtn.addEventListener("click", onShowPasswordBtnClicked);

const domain = window.location.href.split("/")[2];

checkLoginStatus();
