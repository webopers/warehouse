import firebase from "./firebase-config.js";

const checkLoginStatus = () => {
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			if (user.displayName !== null) location.href = "/";
		} else if (domain === "todos.webopers.com") location.href = "/login/";
		else location.href = "/accounts/login.html";
	});
};

const onContinueBtnClicked = () => {
	const fullName = fullNameInput.value;
	suppressError();
	changeInputStatus(true);
	if (fullName === "") showError("full-name", "Full name is not allowed to empty");
	else if (fullName.length < 6) showError("full-name", "Full name is invalid");
	else doUpdate(fullName);
};

const doUpdate = (fullName) => {
	const user = firebase.auth().currentUser;

	user
		.updateProfile({
			displayName: fullName,
			position: "manager",
		})
		.then(function () {
			location.href = "/";
		})
		.catch(function (error) {
			showError(
				"full-name",
				`There was an error on our side. 
                We have noted this error and will fix it as soon as possible. Sorry for the inconvenience`
			);
		});
};

const isValidEmail = (email) => {
	const atPosition = email.indexOf("@");
	const dotPosition = email.lastIndexOf(".");
	if (atPosition < 1 || dotPosition < atPosition + 2 || dotPosition + 2 >= email.length) return false;
	else return true;
};

const changeInputStatus = (isDisabled) => {
	for (const key in inputs) if (inputs.hasOwnProperty(key)) inputs[key].disabled = isDisabled;
	continueBtn.disabled = isDisabled;
	if (isDisabled) continueBtn.children[0].style.display = "block";
	else continueBtn.children[0].style.display = "none";
};

const showError = (inputID, message) => {
	const input = document.getElementById(inputID);
	const showPlace = input.parentElement;
	const errorElement = showPlace.children[2];
	changeInputStatus(false);
	input.focus();
	showPlace.classList.add("input-group-alert");
	errorElement.innerText = message;
};

const suppressError = () => {
	const inputGroups = document.getElementsByClassName("input-group-item");
	for (const key in inputGroups) if (inputGroups.hasOwnProperty(key)) inputGroups[key].classList.remove("input-group-alert");
};

const continueBtn = document.getElementById("continue-btn");
const fullNameInput = document.getElementById("full-name");
const inputs = document.getElementsByClassName("input-group-item-text");

continueBtn.addEventListener("click", onContinueBtnClicked);
document.addEventListener("keypress", () => (event.keyCode === 13 ? onContinueBtnClicked() : ""));

const domain = window.location.href.split("/")[2];

checkLoginStatus();
