import firebase from "./firebase-config.js";
import { getTime } from "./lib/time.js";
import { formatCurrency, chargeShipping } from "./lib/currency.js";

const developmentEnvironment = window.location.href.split("/")[2] !== "warehouse.webopers.com";

const deliveryBtn = document.querySelector(".delivery");
const deliveredBtn = document.querySelector(".delivered");

let warehouseItems = {};

const checkUserPosition = (userPosition) => {
	if (userPosition === "manager") {
		window.location.href = "/";
	}
};

const highlightStatusBtn = (filter) => {
	deliveryBtn.classList.remove("active");
	deliveredBtn.classList.remove("active");
	if (filter === "delivery") deliveryBtn.classList.add("active");
	else deliveredBtn.classList.add("active");
};

const successDelivery = (databases, itemID) => {
	const { warehouse, employees } = databases;
	warehouse.child(`${itemID}/item/status`).set("delivered");
	employees.child(`deliveryItems/${itemID}`).remove();
	employees.child(`deliveredItems/${itemID}`).set(itemID);
};

const onRowSelected = (item, itemID) => {
	const orderDetail = document.querySelector("#orderDetail");
	const { name, money, weight } = item.item;
	// eslint-disable-next-line object-curly-newline
	const { name: receiverNameString, phone, email, street, ward, district, city } = item.receiver;
	const itemName = document.querySelector("#itemName");
	const itemMoney = document.querySelector("#itemMoney");
	const receiverName = document.querySelector("#receiverName");
	const receiverPhone = document.querySelector("#receiverPhone");
	const receiverEmail = document.querySelector("#receiverEmail");
	const receiverAddress = document.querySelector("#receiverAddress");
	const rejectBtn = document.querySelector("#rejectBtn");
	const successBtn = document.querySelector("#successBtn");
	rejectBtn.dataset.id = itemID;
	successBtn.dataset.id = itemID;
	itemName.innerText = name;
	itemMoney.innerText = formatCurrency(String(Number(money) + chargeShipping(Number(money), weight)), "VND");
	receiverName.innerText = receiverNameString;
	receiverPhone.innerText = phone;
	receiverEmail.innerText = email;
	receiverAddress.innerText = `${street}, phường ${ward}, quận ${district}, ${city}`;
	orderDetail.classList.remove("d-none");
};

const render = (databases, items, filter) => {
	const container = document.querySelector("#warehouseItemsContainer");
	const countItemStatus = { delivery: 0, delivered: 0 };
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
	if (items) {
		Object.keys(items).forEach((itemID) => {
			const { item, receiver } = items[itemID];
			countItemStatus[item.status] += 1;
			const exportTime = {
				year: item.exportDate.slice(0, 4),
				month: item.exportDate.slice(5, 7),
				date: item.exportDate.slice(8, 10),
			};
			if (item.status === filter && items) {
				const rowElement = document.createElement("tr");
				const successBtn = document.createElement("button");
				const rejectBtn = document.createElement("button");
				const actionColumn = document.createElement("td");
				actionColumn.className = "d-flex justify-content-end";
				actionColumn.style.margin = "0 -11px 0 0";
				successBtn.className = "btn btn-custom btn-sm btn-success btn-export";
				successBtn.innerHTML = '<i class="fal fa-check pr-2 pl-1"></i> Hoàn thành';
				successBtn.addEventListener("click", () => successDelivery(databases, itemID));
				rejectBtn.className = "btn btn-custom btn-sm btn-danger btn-export mr-3";
				rejectBtn.innerHTML = '<i class="fal fa-times pr-2 pl-1"></i> Lỗi';
				if (filter === "delivery") rowElement.addEventListener("click", () => onRowSelected(items[itemID], itemID));
				rowElement.innerHTML = `
            <td class="d-flex align-items-center" style="max-width: 540px;">
              ${itemID}
						</td>
            <td>${receiver.name}</td>
            <td>${receiver.phone}</td>
						<td>${receiver.street}, phường ${receiver.ward}</td>
						<td>${formatCurrency(String(Number(item.money) + chargeShipping(Number(item.money), item.weight)))}</td>
						<td>${exportTime.date}/${exportTime.month}/${exportTime.year}</td>
          `;
				container.prepend(rowElement);
			}
		});
	}

	highlightStatusBtn(filter);

	const tableEmptyNode = document.querySelector(".table-empty");
	const loadingNode = document.querySelector(".loading");
	const spaceRow = document.createElement("tr");

	if (countItemStatus[filter] === 0) {
		tableEmptyNode.classList.remove("d-none");
	} else tableEmptyNode.classList.add("d-none");

	spaceRow.style.height = "24px";
	container.prepend(spaceRow);

	deliveryBtn.innerText = `Đang giao (${countItemStatus.delivery})`;
	deliveredBtn.innerText = `Đã giao (${countItemStatus.delivered})`;
	loadingNode.classList.add("d-none");
	loadingNode.classList.remove("d-flex");
};

const getWarehouseItems = (warehouse, employees, filter) => {
	const employeeItems = {};
	employees.on("value", (dataSnapshot) => {
		const { deliveryItems, deliveredItems, activeArea } = dataSnapshot.val();
		document.querySelector("#deliveryArea").innerText = `Quận ${activeArea.district}, ${activeArea.city}`;
		warehouse.on("value", (warehouseItemsData) => {
			warehouseItems = warehouseItemsData.val();
			if (deliveryItems) {
				Object.keys(deliveryItems).forEach((itemID) => {
					employeeItems[itemID] = { ...warehouseItems[itemID], itemID };
				});
			}
			if (deliveredItems) {
				Object.keys(deliveredItems).forEach((itemID) => {
					employeeItems[itemID] = { ...warehouseItems[itemID], itemID };
				});
			}
			render({ warehouse, employees }, employeeItems, filter);
		});
	});
};

const onSuccess = (databases) => {
	const { warehouse, employee } = databases;
	const itemID = document.querySelector("#successBtn").dataset.id;
	const orderDetail = document.querySelector("#orderDetail");
	const salary = chargeShipping(warehouseItems[itemID].item.money, warehouseItems[itemID].item.weight);
	warehouse.child(`${itemID}/item/status`).set("delivered");
	employee.child(`deliveryItems/${itemID}`).remove();
	employee.child(`deliveredItems/${itemID}`).set(itemID);
	employee.child(`salary`).push(salary);
	employee.child(`logs/detail`).push({
		action: "export",
		content: warehouseItems[itemID].item.name,
		time: getTime(),
	});
	employee.child(`logs`).update({ updated: getTime() });
	orderDetail.classList.add("d-none");
};

const onError = (databases) => {
	const { warehouse, employee } = databases;
	const itemID = document.querySelector("#successBtn").dataset.id;
	const orderDetail = document.querySelector("#orderDetail");
	warehouse.child(`${itemID}/item/status`).set("inventory");
	employee.child(`deliveryItems/${itemID}`).remove();
	employee.child(`logs/detail`).push({
		action: "return",
		content: warehouseItems[itemID].item.name,
		time: getTime(),
	});
	employee.child(`logs`).update({ updated: getTime() });
	orderDetail.classList.add("d-none");
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

				checkUserPosition(userPosition);

				const warehouse = database.ref(`/warehouses/${warehouseID}`);
				const employee = warehouse.child(`employees/${user.uid}`);
				const closeBtn = document.querySelector(".close");
				const successBtn = document.querySelector("#successBtn");
				const rejectBtn = document.querySelector("#rejectBtn");

				getWarehouseItems(warehouse.child("items"), employee, "delivery");

				deliveryBtn.addEventListener("click", () => {
					getWarehouseItems(warehouse.child("items"), employee, "delivery");
				});
				deliveredBtn.addEventListener("click", () => {
					getWarehouseItems(warehouse.child("items"), employee, "delivered");
				});
				closeBtn.addEventListener("click", () => {
					document.querySelector("#orderDetail").classList.add("d-none");
				});
				rejectBtn.addEventListener("click", () => onError({ warehouse: warehouse.child("items"), employee }));
				successBtn.addEventListener("click", () => onSuccess({ warehouse: warehouse.child("items"), employee }));

				const logoutBtn = document.querySelector("#logout");
				logoutBtn.addEventListener("click", () => {
					firebase
						.auth()
						.signOut()
						.then(() => {
							window.location.href = "/accounts/login.html";
						});
				});
			});
	}
});
