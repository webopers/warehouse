import firebase from "../firebase-config.js";
import { getTime } from "../lib/time.js";
import { formatCurrency } from "../lib/currency.js";

const developmentEnvironment = window.location.href.split("/")[2] !== "warehouse.webopers.com";

let userPosition = "";

const showUserData = (userData, userEmail) => {
	const { name } = userData;
	const nameElement = document.querySelector("#name");
	const emailElement = document.querySelector("#email");
	const loadingContainer = document.querySelector(".loading");
	const brandContainer = document.querySelector(".brand");
	nameElement.value = name;
	emailElement.value = userEmail;
	if (userPosition === "shipper") {
		const { activeArea, deliveryItems, deliveredItems, salary } = userData;
		const shipperAnalystContainer = document.querySelector("#shipperAnalystContainer");
		const districtElement = document.querySelector("#district");
		const cityElement = document.querySelector("#city");
		const deliveryElement = document.querySelector("#delivery");
		const deliveredElement = document.querySelector("#delivered");
		const salaryElement = document.querySelector("#salary");
		shipperAnalystContainer.classList.remove("d-none");
		districtElement.value = `Quận ${activeArea.district}`;
		cityElement.value = activeArea.city;
		if (deliveryItems) deliveryElement.value = Object.keys(deliveryItems).length;
		else deliveryElement.value = 0;
		if (deliveredItems) deliveredElement.value = Object.keys(deliveredItems).length;
		else deliveredElement.value = 0;
		if (salary) {
			let salarySum = 0;
			Object.keys(salary).forEach((salaryID) => {
				salarySum += salary[salaryID];
			});
			salaryElement.value = formatCurrency(String(salarySum), "VND");
		}
	}
	loadingContainer.className = "loading d-none align-items-center justify-content-center";
	brandContainer.href = userPosition === "manager" ? "/" : "/shipper/";
};

const showError = (inputElement) => {
	inputElement.classList.add("is-invalid");
};

const showAlert = (status, message) => {
	const alertNode = document.querySelector(`.alert-${status}`);
	const messageNode = alertNode.firstElementChild;
	const passwordElement = document.querySelector("#currentPassword");
	const repeatPasswordElement = document.querySelector("#repeatNewPassword");
	const newPasswordElement = document.querySelector("#newPassword");
	passwordElement.value = "";
	newPasswordElement.value = "";
	repeatPasswordElement.value = "";
	messageNode.innerText = message;
	alertNode.classList.add("show");
	setTimeout(() => {
		alertNode.classList.remove("show");
	}, 5000);
};

const removeAlert = (alertNodeID) => {
	const alertNode = document.querySelector(`#${alertNodeID}`);
	alertNode.classList.add("show");
};

// const disabledInput = () => {}

const doUpdate = (databases, name) => {
	const { warehouse, userDatabase: user } = databases;
	// const credentials = firebase.auth.EmailAuthProvider.credential(currentUser.email, password);
	user.update({ name });
	if (userPosition === "shipper") warehouse.update({ name });
	showAlert("success", "Cập nhật thông tin thành công");
	// currentUser
	// 	.reauthenticateWithCredential(credentials)
	// 	.then(() => {
	// 		if (newPassword.length >= 6) currentUser.updatePassword(newPassword);
	// 	})
	// 	.catch(() => {
	// 		showError("danger", "Mật khẩu không chính xác");
	// 	});
};

const removeError = (elements) => {
	elements.forEach((element) => element.classList.remove("is-invalid"));
};

const onUpdateClicked = (databases) => {
	const nameElement = document.querySelector("#name");
	// const emailElement = document.querySelector("#email");
	const passwordElement = document.querySelector("#currentPassword");
	const newPasswordElement = document.querySelector("#newPassword");
	const repeatNewPasswordElement = document.querySelector("#repeatNewPassword");
	const name = nameElement.value;
	// const email = emailElement.value;
	const password = passwordElement.value;
	const newPassword = newPasswordElement.value;
	const repeatNewPassword = repeatNewPasswordElement.value;
	if (name.length < 10) showError(nameElement);
	else if (password.length < 6) showError(passwordElement);
	else if (newPassword.length >= 6 && repeatNewPassword !== newPassword) {
		showError(newPasswordElement);
		showError(repeatNewPasswordElement);
	} else {
		removeError([nameElement, passwordElement, newPasswordElement, repeatNewPasswordElement]);
		// disableInput([nameElement, passwordElement, newPasswordElement, repeatNewPasswordElement]);
		doUpdate(databases, name);
	}
};

firebase.auth().onAuthStateChanged((user) => {
	if (!user) {
		if (developmentEnvironment) window.location.href = "/accounts/login.html";
		else window.location.href = "/login/";
	} else {
		firebase
			.database()
			.ref(`/users/${user.uid}`)
			.once("value")
			.then((dataSnapshot) => {
				const database = firebase.database();
				const { position, warehouse: warehouseID } = dataSnapshot.val();
				const warehouse = database.ref(`/warehouses/${warehouseID}/employees/${user.uid}`);
				const userDatabase = database.ref(`/users/${user.uid}`);
				const updateProfile = document.querySelector("#updateProfile");
				const closeSuccessAlert = document.querySelector("#closeSuccessAlert");

				userPosition = position;

				if (userPosition === "shipper") warehouse.on("value", (data) => showUserData(data.val(), user.email));
				else if (userPosition === "manager") userDatabase.on("value", (data) => showUserData(data.val(), user.email));

				closeSuccessAlert.addEventListener("click", () => removeAlert("successAlert"));
				updateProfile.addEventListener("click", () => onUpdateClicked({ warehouse, userDatabase }));
			});
	}
});
