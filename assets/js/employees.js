import firebase from "./firebase-config.js";
import firebaseSecondary from "./firebase-secondary.js";
import renderOptions from "./modules/renderOptions.js";

const developmentEnvironment = window.location.href.split("/")[2] !== "warehouse.webopers.com";

let administrativeData = {};

const checkUserPosition = (userPosition) => {
	if (userPosition === "shipper") {
		window.location.href = "/shipper/";
	}
};

const isValidEmail = (email) => {
	const atPosition = email.indexOf("@");
	const dotPosition = email.lastIndexOf(".");
	if (atPosition < 1 || dotPosition < atPosition + 2 || dotPosition + 2 >= email.length) {
		return false;
	}
	return true;
};

const showAddStaffForm = () => {
	const addStaffForm = document.querySelector("#addStaffForm");
	addStaffForm.classList.remove("d-none");
};

const hideAddStaffForm = () => {
	const addStaffForm = document.querySelector("#addStaffForm");
	addStaffForm.classList.add("d-none");
};

const handlingAdministrative = (data) => {
	administrativeData = data;
	renderOptions(Object.keys(administrativeData), "staffDistrictActivity", "Quận");
};

const registerNewStuff = (email, password, name, district, city, employee, users, detail, logs, warehouseID, authName, time) => {
	firebaseSecondary
		.auth()
		.createUserWithEmailAndPassword(email, password)
		.then(() => {
			hideAddStaffForm();
			const newStaff = firebaseSecondary.auth().currentUser;
			newStaff.updateProfile({ displayName: name });
			employee.child(newStaff.uid).set({
				activeArea: {
					city,
					district,
				},
				name,
				items: [],
			});
			logs.push({
				action: "create shipper",
				content: `${name} hoạt động tại Quận ${district}, ${city}`,
				name: authName,
				time,
			});
			detail.child("userUpdated").set(time);
			detail.child("logUpdated").set(time);
			// eslint-disable-next-line object-curly-newline
			users.child(newStaff.uid).set({ changePassword: false, position: "shipper", username: "", warehouse: warehouseID });
			firebaseSecondary.auth().signOut();
		})
		.catch(() => {
			const errorNode = document.querySelector("#addStuffError");
			errorNode.innerText = "Email đã được sử dụng bởi người khác";
			errorNode.classList.remove("d-none");
		});
};

const onAddStaffFormBtnClick = (employee, users, detail, logs, warehouseID, authName, time) => {
	const nameNode = document.querySelector("#staffName");
	const emailNode = document.querySelector("#staffEmail");
	const passwordNode = document.querySelector("#staffPassword");
	const repeatPasswordNode = document.querySelector("#staffRepeatPassword");
	const cityNode = document.querySelector("#staffCity");
	const districtNode = document.querySelector("#staffDistrictActivity");
	const name = nameNode.value;
	const email = emailNode.value;
	const password = passwordNode.value;
	const repeatPassword = repeatPasswordNode.value;
	const city = cityNode.value;
	const district = districtNode.value;
	const elementNode = [nameNode, emailNode, passwordNode, repeatPasswordNode, cityNode, districtNode];
	let error = false;
	elementNode.forEach((node) => node.classList.remove("is-invalid"));
	if (name.length < 10) {
		error = true;
		nameNode.classList.add("is-invalid");
	}
	if (!isValidEmail(email)) {
		error = true;
		emailNode.classList.add("is-invalid");
	}
	if (password < 6) {
		error = true;
		passwordNode.classList.add("is-invalid");
	} else if (repeatPassword !== password) {
		error = true;
		repeatPasswordNode.classList.add("is-invalid");
	}
	if (!error) {
		registerNewStuff(email, password, name, district, city, employee, users, detail, logs, warehouseID, authName, time);
	}
};

const getData = (database, callback) => {
	database.orderByKey().on("value", (dataSnapshot) => {
		callback(dataSnapshot.val());
	});
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

const onDeleteStaffBtnClicked = (element, employees, detail, logs, employeeID, district, city, name) => {
	employees.child(employeeID).remove();
	detail.child("userUpdated").set(getTime());
	detail.child("logUpdated").set(getTime());
	logs.push({
		action: "remove shipper",
		content: `Người vận chuyển hoạt động tại Quận ${district}, ${city}`,
		name,
		time: getTime(),
	});
	console.log(element);
};

const renderEmployeeList = (employees, employee, detail, logs, authName) => {
	const container = document.querySelector("#employeesContainer");
	while (container.firstChild) container.removeChild(container.firstChild);
	Object.keys(employees).forEach((employeeID) => {
		const { name, activeArea } = employees[employeeID];
		const employeeElement = document.createElement("tr");
		const nameColumn = document.createElement("td");
		const areaColumn = document.createElement("td");
		const incomeColumn = document.createElement("td");
		const orderShipped = document.createElement("td");
		const actionColumn = document.createElement("td");
		const deleteEmployeeBtn = document.createElement("button");
		deleteEmployeeBtn.className = "btn btn-custom btn-sm btn-danger btn-export";
		deleteEmployeeBtn.innerHTML = '<i class="fal fa-user-times pr-2 pl-1"></i> Xoá';
		deleteEmployeeBtn.addEventListener("click", () =>
			onDeleteStaffBtnClicked(employeeElement, employee, detail, logs, employeeID, activeArea.district, activeArea.city, authName)
		);
		nameColumn.innerText = name;
		areaColumn.innerText = `Quận ${activeArea.district}, ${activeArea.city}`;
		incomeColumn.innerText = `20000000`;
		orderShipped.innerText = `12`;
		actionColumn.className = "d-flex justify-content-end";
		actionColumn.style.margin = "0 -11px 0 0";
		employeeElement.appendChild(nameColumn);
		employeeElement.appendChild(areaColumn);
		employeeElement.appendChild(incomeColumn);
		employeeElement.appendChild(orderShipped);
		actionColumn.appendChild(deleteEmployeeBtn);
		employeeElement.appendChild(actionColumn);
		container.prepend(employeeElement);
	});
	const spaceRow = document.createElement("tr");
	spaceRow.style.height = "28px";
	container.prepend(spaceRow);
	document.querySelector(".loading").className = "loading d-none align-items-center justify-content-center";
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
				const { position: userPosition, warehouse: warehouseID } = dataSnapshot.val();
				const employee = database.ref(`/employees/${warehouseID}`);
				const users = database.ref(`/users`);
				const administrative = database.ref("administrative/");
				const detail = database.ref(`/detail/${warehouseID}`);
				const logs = database.ref(`/logs/${warehouseID}`);

				employee.on("value", (employeeData) => renderEmployeeList(employeeData.val(), employee, detail, logs, user.displayName));
				detail.on("value", (detailData) => {
					const updatedTimeNode = document.querySelector("#updatedTime");
					updatedTimeNode.innerText = detailData.val().userUpdated;
				});

				getData(administrative.child("Hồ Chí Minh"), handlingAdministrative);

				const addStaffBtn = document.querySelector("#addStaffBtn");
				const closeAddStaffFormBtn = document.querySelector("#closeAddStaffFormBtn");
				const addStaffFormBtn = document.querySelector("#addStaffFormBtn");

				addStaffBtn.addEventListener("click", () => showAddStaffForm());
				closeAddStaffFormBtn.addEventListener("click", () => hideAddStaffForm());
				addStaffFormBtn.addEventListener("click", () =>
					onAddStaffFormBtnClick(employee, users, detail, logs, warehouseID, user.displayName, getTime())
				);

				checkUserPosition(userPosition);
			});
	}
});
