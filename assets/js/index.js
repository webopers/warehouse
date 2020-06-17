import firebase from "./firebase-config.js";
import { getTime } from "./lib/time.js";

const developmentEnvironment = window.location.href.split("/")[2] !== "warehouse.webopers.com";

const inventoryBtn = document.querySelector(".inventory");
const deliveryBtn = document.querySelector(".delivery");
const deliveredBtn = document.querySelector(".delivered");

let exportItems = {};
const exportEmployees = {};

const checkUserPosition = (userPosition) => {
	if (userPosition === "shipper") {
		window.location.href = "/shipper/";
	}
};

const highlightStatusBtn = (filter) => {
	inventoryBtn.classList.remove("active");
	deliveryBtn.classList.remove("active");
	deliveredBtn.classList.remove("active");
	if (filter === "inventory") inventoryBtn.classList.add("active");
	else if (filter === "delivery") deliveryBtn.classList.add("active");
	else deliveredBtn.classList.add("active");
};

const showExportItemsCount = () => {
	const showPlace = document.querySelector("#exportItemsCount");
	let exportItemsCount = 0;
	Object.keys(exportItems).forEach((exportItemID) => {
		exportItemsCount += Object.keys(exportItems[exportItemID]).length;
	});
	if (exportItemsCount > 0) {
		showPlace.classList.remove("d-none");
		showPlace.innerText = `(${exportItemsCount})`;
	} else showPlace.classList.add("d-none");
};

const onRowSelected = (rowElement, itemID, item) => {
	const checkboxElement = rowElement.children[0].children[0].children[0];
	if (rowElement.classList.length === 0) {
		rowElement.classList.add("active");
		checkboxElement.checked = true;
		exportItems[item.receiver.district] = {
			[itemID]: item,
			...exportItems[item.receiver.district],
		};
	} else {
		rowElement.classList.remove("active");
		checkboxElement.checked = false;
		delete exportItems[item.receiver.district][itemID];
		if (Object.keys(exportItems[item.receiver.district]).length === 0) {
			delete exportItems[item.receiver.district];
		}
	}
	showExportItemsCount();
};

const render = (items, filter) => {
	const container = document.querySelector("#warehouseItemsContainer");
	const countItemStatus = { inventory: 0, delivery: 0, delivered: 0 };
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
				rowElement.dataset.id = itemID;
				if (filter === "inventory") {
					rowElement.addEventListener("click", () => onRowSelected(rowElement, itemID, items[itemID]));
				}
				rowElement.innerHTML = `
						<td class="d-flex align-items-center" style="max-width: 540px;">
							<div class="checkbox-container">
								<input type="checkbox" name="select" class="checkbox-mark" />
								<div class="checkbox-face">
									<div class="checkbox-check"></div>
								</div>
							</div>
							<div>
								${item.name}
							</div>
						</td>
						<td>${item.category}</td>
						<td>${item.weight}</td>
						<td>${exportTime.date}/${exportTime.month}/${exportTime.year}</td>
						<td>Quận ${receiver.district}, ${receiver.city}</td>
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

	inventoryBtn.innerText = `Trong kho (${countItemStatus.inventory})`;
	deliveryBtn.innerText = `Đang giao (${countItemStatus.delivery})`;
	deliveredBtn.innerText = `Đã giao (${countItemStatus.delivered})`;
	loadingNode.classList.add("d-none");
	loadingNode.classList.remove("d-flex");
};

const getWarehouseItems = (warehouse, filter) => {
	warehouse.on("value", (dataSnapshot) => {
		render(dataSnapshot.val(), filter);
	});
};

const deliveryToStaff = (warehouse, author, itemsForEachEmployee, itemsRejected) => {
	let exportItemsNumber = 0;
	if (Object.keys(itemsRejected).length > 0) {
		const exportItemsError = document.querySelector("#exportItemsError");
		let listItemsRejected = "";
		Object.keys(itemsRejected).forEach((district) => {
			Object.keys(itemsRejected[district]).forEach((itemID) => {
				listItemsRejected += `- ${itemsRejected[district][itemID].item.name} <br/>`;
			});
		});
		document.querySelector("#listItemsRejected").innerHTML = listItemsRejected;
		exportItemsError.classList.remove("d-none");
	}
	Object.keys(itemsForEachEmployee).forEach((employeeID) => {
		itemsForEachEmployee[employeeID].forEach((itemID) => {
			exportItemsNumber += 1;
			warehouse.child(`employees/${employeeID}/deliveryItems`).push(itemID);
			warehouse.child(`items/${itemID}/item`).update({ status: "delivery" });
		});
	});
	if (Object.keys(itemsForEachEmployee).length > 0) {
		warehouse.child("logs/detail").push({
			action: "export",
			author,
			content: `Xuất kho ${exportItemsNumber} đơn hàng`,
			time: getTime(),
		});
		warehouse.child("logs/updatedTime").update({ item: getTime(), log: getTime() });
	}
	exportItems = {};
	showExportItemsCount();
};

const onExportBtnClicked = async (warehouse, author) => {
	let employees = {};
	const itemsForEachEmployee = {};
	const itemsRejected = {};
	await warehouse
		.child("employees")
		.once("value")
		.then((employeesData) => {
			employees = employeesData.val();
		});
	Object.keys(employees).forEach((employeeID) => {
		let districtEmployees = exportEmployees[employees[employeeID].activeArea.district];
		if (districtEmployees) {
			districtEmployees.push(employeeID);
		} else {
			districtEmployees = [employeeID];
		}
		exportEmployees[employees[employeeID].activeArea.district] = districtEmployees;
	});
	Object.keys(exportItems).forEach((district) => {
		if (exportEmployees[district]) {
			const districtEmployeeNumber = exportEmployees[district].length;
			Object.keys(exportItems[district]).forEach((itemID, index) => {
				const employeeID = exportEmployees[district][index % districtEmployeeNumber];
				// const employeeItem = exportItems[district][itemID];
				let employeeItems = itemsForEachEmployee[employeeID];
				if (employeeItems) {
					employeeItems.push(itemID);
				} else {
					employeeItems = [itemID];
				}
				itemsForEachEmployee[employeeID] = employeeItems;
			});
		} else {
			itemsRejected[district] = exportItems[district];
		}
	});
	deliveryToStaff(warehouse, author, itemsForEachEmployee, itemsRejected);
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
				const exportBtn = document.querySelector("#exportBtn");
				const closeExportItemsError = document.querySelector("#closeExportItemsError");

				warehouse.child("logs/updatedTime/item").on("value", (data) => {
					const updatedTime = data.val();
					document.querySelector("#updatedTime").innerText = updatedTime;
				});

				getWarehouseItems(warehouse.child("items"), "inventory");

				inventoryBtn.addEventListener("click", () => getWarehouseItems(warehouse.child("items"), "inventory"));
				deliveryBtn.addEventListener("click", () => getWarehouseItems(warehouse.child("items"), "delivery"));
				deliveredBtn.addEventListener("click", () => getWarehouseItems(warehouse.child("items"), "delivered"));
				exportBtn.addEventListener("click", () => onExportBtnClicked(warehouse, user.uid));
				closeExportItemsError.addEventListener("click", () => {
					document.querySelector("#exportItemsError").classList.add("d-none");
				});
			});
	}
});
