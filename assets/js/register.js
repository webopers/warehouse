import firebase from "./firebase-config.js";

const domain = window.location.href.split("/")[2];

const checkLoginStatus = () => {
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			if (user.displayName !== null) location.href = "/";
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
	if (username === "") showError("username", "Tên đăng nhập hoặc Email không được phép để trống");
	else if (isValidEmail(username) === false) showError("username", "Tên đăng nhập hoặc Email đã tồn tại");
	else if (password === "") showError("password", "Mật khẩu phải có tối thiểu 6 ký tự");
	else if (password !== confirmPassword) showError("confirm-password", "Mật khẩu nhập lại không trùng khớp");
	else {
		const users = firebase.database().ref("/users");
		const warehouses = firebase.database().ref("/warehouses");
		doRegister(users, warehouses, username, password);
	}
};

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const randomString = (length) => {
	const source = "abcdefghijklmnopqrstuvwsyzABCDEFGHIJKLMNOPQRSTUVWSYZ0123456789";
	const sourceLength = source.length;
	let string = "";
	for (let i = 0; i < length; i += 1) {
		string += source[randomNumber(0, sourceLength)];
	}
	return string;
};

const getTime = () => {
	const date = new Date();
	const today = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	const month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
	const year = date.getFullYear();
	const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
	const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
	return `${today}/${month}/${year} - ${hours}:${minutes}`;
};

const doRegister = (users, warehouses, username, password) => {
	firebase
		.auth()
		.createUserWithEmailAndPassword(username, password)
		.then(async () => {
			const newUser = firebase.auth().currentUser;
			const warehouseID = randomString(28);
			const time = getTime();
			await users.child(newUser.uid).set({
				changePassword: true,
				position: "manager",
				username: "",
				warehouse: warehouseID,
			});
			await warehouses.child(warehouseID).set({
				categories: ["Khác"],
				employees: {},
				items: {},
				logs: {
					detail: {},
					updatedTime: {
						log: time,
						item: time,
						staff: time,
					},
				},
			});
			if (domain === "todos.webopers.com") window.location.href = "/information/";
			else window.location.href = "/accounts/information.html";
		})
		.catch((error) => {
			const errorCode = error.code;
			if (errorCode === "auth/email-already-in-use") showError("username", "Tên đăng nhập hoặc Email đã được sử dụng");
		});
};

const isValidEmail = (email) => {
	const atPosition = email.indexOf("@");
	const dotPosition = email.lastIndexOf(".");
	if (atPosition < 1 || dotPosition < atPosition + 2 || dotPosition + 2 >= email.length) return false;
	return true;
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

checkLoginStatus();
