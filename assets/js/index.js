import firebase from "./firebase-config.js";

const developmentEnvironment = window.location.href.split("/")[2] !== "warehouse.webopers.com";

const inventoryBtn = document.querySelector(".inventory");
const deliveryBtn = document.querySelector(".delivery");
const deliveredBtn = document.querySelector(".delivered");

// const checkUserPosition = (userID) => {
// 	database
// 		.ref(`users/${userID}`)
// 		.once("value")
// 		.then((snapshot) => {
// 			if (snapshot.val().position === "shipper") {
// 				if (developmentEnvironment) window.location.href = "/shipper.html";
// 				else window.location.href = "/shipper/";
// 			}
// 		});
// };

const highlightStatusBtn = (filter) => {
	inventoryBtn.classList.remove("active");
	deliveryBtn.classList.remove("active");
	deliveredBtn.classList.remove("active");
	if (filter === "inventory") inventoryBtn.classList.add("active");
	else if (filter === "delivery") deliveryBtn.classList.add("active");
	else deliveredBtn.classList.add("active");
};

const render = (items, filter) => {
	const countItemStatus = { inventory: 0, delivery: 0, delivered: 0 };
	let itemElements = "";
	Object.keys(items).forEach((itemID) => {
		const item = items[itemID];
		countItemStatus[item.status] += 1;
		if (item.status === filter) {
			itemElements = `
			<tr id="${itemID}">
				<td>
					<div class="checkbox-container">
						<input type="checkbox" name="select" class="checkbox-mark" />
						<div class="checkbox-face">
							<div class="checkbox-check"></div>
						</div>
					</div>
					1851120020
				</td>
				<td>${item.name}</td>
				<td>${item.category}</td>
				<td>${item.weight}</td>
				<td>${item.importTime}</td>
				<td>${item.exportDeadline}</td>
			</tr>
			${itemElements}`;
		}
	});

	highlightStatusBtn(filter);

	const tableEmptyNode = document.querySelector(".table-empty");
	const loadingNode = document.querySelector(".loading");

	if (countItemStatus[filter] === 0) {
		tableEmptyNode.classList.remove("d-none");
	} else tableEmptyNode.classList.add("d-none");

	inventoryBtn.innerText = `Trong kho (${countItemStatus.inventory})`;
	deliveryBtn.innerText = `Đang giao (${countItemStatus.delivery})`;
	deliveredBtn.innerText = `Đã giao (${countItemStatus.delivered})`;
	document.querySelector(".warehouseItemsContainer").innerHTML = `<tr style="height: 20px;"></tr> ${itemElements}`;
	loadingNode.classList.add("d-none");
	loadingNode.classList.remove("d-flex");
};

const getWarehouseItems = (warehouse, filter) => {
	warehouse.on("value", (dataSnapshot) => {
		render(dataSnapshot.val(), filter);
	});
};

// const onImportBtnClicked = () => {
// 	if (importFormNode.classList.length === 1) importFormNode.classList.add("d-none");
// 	else importFormNode.classList.remove("d-none");
// };

// const getTime = () => {
// 	const date = new Date();
// 	const today = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
// 	const month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
// 	const year = date.getFullYear();
// 	const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
// 	const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
// 	return `${today}/${month}/${year} - ${hours}:${minutes}`;
// };

firebase.auth().onAuthStateChanged((userData) => {
	if (!userData) {
		if (developmentEnvironment) window.location.href = "/accounts/login.html";
		else window.location.href = "/login/";
	} else {
		const database = firebase.database();
		const warehouse = database.ref(`/warehouses/${userData.uid}`);
		// const logs = database.ref(`/logs/${userData.uid}`);

		getWarehouseItems(warehouse, "inventory");

		inventoryBtn.addEventListener("click", () => getWarehouseItems(warehouse, "inventory"));
		deliveryBtn.addEventListener("click", () => getWarehouseItems(warehouse, "delivery"));
		deliveredBtn.addEventListener("click", () => getWarehouseItems(warehouse, "delivered"));

		// const importBtn = document.querySelector("#importBtn");
		// const importConfirmBtn = document.querySelector("#importConfirmBtn");
		// const time = getTime();

		// importBtn.addEventListener("click", onImportBtnClicked);

		// console.log(warehouseItems);
		// const warehouse = firebase.database().ref(`/warehouses/${warehouseID}`);
		// warehouses.on("value", (dataSnapshot) => {
		// 	console.log(dataSnapshot.val());
		// });
		// const warehouseKey = warehouse.push().key;
		// console.log(warehouseKey);
	}
});
