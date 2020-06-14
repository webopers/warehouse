import firebase from "./firebase-config.js";

const developmentEnvironment = window.location.href.split("/")[2] !== "warehouse.webopers.com";

const inventoryBtn = document.querySelector(".inventory");
const deliveryBtn = document.querySelector(".delivery");
const deliveredBtn = document.querySelector(".delivered");

const checkUserPosition = (userPosition) => {
	if (userPosition !== "manager") {
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

const render = (items, filter) => {
	const countItemStatus = { inventory: 0, delivery: 0, delivered: 0 };
	let itemElements = "";
	Object.keys(items).forEach((itemID) => {
		const { item, receiver } = items[itemID];
		if (itemID !== "categories") {
			const exportTime = {
				year: item.exportDate.slice(0, 4),
				month: item.exportDate.slice(5, 7),
				date: item.exportDate.slice(8, 10),
			};
			countItemStatus[item.status] += 1;
			if (item.status === filter) {
				itemElements = `
				<tr id="${itemID}">
					<td class="d-flex" style="max-width: 540px;">
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
				</tr>
				${itemElements}`;
			}
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
				const warehouse = database.ref(`/warehouses/${warehouseID}`);
				const updated = database.ref(`/detail/${warehouseID}/updated`);

				checkUserPosition(userPosition);

				updated.on("value", (data) => {
					const updatedTime = data.val();
					document.querySelector("#updatedTime").innerText = updatedTime;
				});

				getWarehouseItems(warehouse, "inventory");

				inventoryBtn.addEventListener("click", () => getWarehouseItems(warehouse, "inventory"));
				deliveryBtn.addEventListener("click", () => getWarehouseItems(warehouse, "delivery"));
				deliveredBtn.addEventListener("click", () => getWarehouseItems(warehouse, "delivered"));
			});
	}
});
