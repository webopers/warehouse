const randomNumber = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const randomString = (length) => {
	const source = "abcdefghijklmnopqrstuvwsyzABCDEFGHIJKLMNOPQRSTUVWSYZ0123456789";
	const sourceLength = source.length;
	let string = "-M9";
	for (let i = 0; i < length - 3; i += 1) {
		string += source[randomNumber(0, sourceLength)];
	}
	return string;
};

const validateInputValue = (time, fillItem = {}) => {
	const itemNameNode = document.querySelector("#warehouseItemName");
	const itemCategoryNode = document.querySelector("#warehouseItemCategories");
	const itemWeightNode = document.querySelector("#warehouseItemWeight");
	const itemExportDateNode = document.querySelector("#warehouseItemDeadline");
	const itemMoneyNode = document.querySelector("#warehouseItemMoney");
	const receiverNameNode = document.querySelector("#receiverName");
	const receiverPhoneNode = document.querySelector("#receiverPhone");
	const receiverEmailNode = document.querySelector("#receiverEmail");
	const receiverStreetNode = document.querySelector("#receiverStreet");
	const receiverWardNode = document.querySelector("#receiverWard");
	const receiverDistrictNode = document.querySelector("#receiverDistrict");
	let receiverCity = "Hồ Chí Minh";
	if (Object.keys(fillItem).length > 0) {
		console.log(fillItem);
		// eslint-disable-next-line object-curly-newline
		const { name: itemName, category, weight, exportDate, money } = fillItem.item;
		// eslint-disable-next-line object-curly-newline
		const { name: receiverName, phone, email, street, ward, district, city } = fillItem.receiver;
		itemNameNode.value = itemName;
		itemCategoryNode.value = category;
		itemWeightNode.value = weight;
		itemExportDateNode.value = exportDate;
		itemMoneyNode.value = money;
		receiverNameNode.value = receiverName;
		receiverPhoneNode.value = phone;
		receiverEmailNode.value = email;
		receiverStreetNode.value = street;
		receiverWardNode.value = ward;
		receiverDistrictNode.value = district;
		receiverCity = city;
	}
	if (itemNameNode.value.length < 1) itemNameNode.classList.add("is-invalid");
	else if (Number(itemWeightNode.value) < 0.1) itemWeightNode.classList.add("is-invalid");
	else if (!itemExportDateNode.value) itemExportDateNode.classList.add("is-invalid");
	else if (Number(itemMoneyNode.value) < 10000) itemMoneyNode.classList.add("is-invalid");
	else if (receiverNameNode.value.length < 1) receiverNameNode.classList.add("is-invalid");
	else if (receiverPhoneNode.value.length !== 10) receiverPhoneNode.classList.add("is-invalid");
	else if (receiverEmailNode.value.length < 10) receiverEmailNode.classList.add("is-invalid");
	else if (receiverStreetNode.value.length < 6) receiverStreetNode.classList.add("is-invalid");
	else {
		return {
			item: {
				name: itemNameNode.value,
				category: itemCategoryNode.value,
				weight: itemWeightNode.value,
				exportDate: itemExportDateNode.value,
				importDate: time,
				money: itemMoneyNode.value,
			},
			receiver: {
				name: receiverNameNode.value,
				phone: receiverPhoneNode.value,
				email: receiverEmailNode.value,
				street: receiverStreetNode.value,
				ward: receiverWardNode.value,
				district: receiverDistrictNode.value,
				city: receiverCity,
			},
		};
	}
	return false;
};

const displayConfirmItemContainer = (show = false) => {
	const container = document.querySelector("#listContainer");
	if (show) {
		container.classList.remove("d-none");
		document.querySelector("#confirmImport").classList.remove("d-none");
	} else {
		container.classList.add("d-none");
		document.querySelector("#confirmImport").classList.add("d-none");
	}
};

const removeWarehouseItem = (itemID) => {
	const warehouseItems = JSON.parse(localStorage.getItem("warehouseItems"));
	delete warehouseItems[itemID];
	localStorage.setItem("warehouseItems", JSON.stringify(warehouseItems));
	return Object.keys(warehouseItems).length;
};

const onRemoveClicked = (itemElement, itemID) => {
	const container = document.querySelector("#listContainer");
	const itemsLength = removeWarehouseItem(itemID);
	container.removeChild(itemElement);
	if (itemsLength === 0) displayConfirmItemContainer(false);
};

const onEditClicked = (items, itemID, itemElement) => {
	removeWarehouseItem(itemID);
	const container = document.querySelector("#listContainer");
	const itemsLength = removeWarehouseItem(itemID);
	container.removeChild(itemElement);
	if (itemsLength === 0) displayConfirmItemContainer(false);
	validateInputValue(items.item.importDate, items);
};

const renderList = (items) => {
	const container = document.querySelector("#listContainer");
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
	Object.keys(items).forEach((itemID) => {
		const { name, money } = items[itemID].item;
		const { district, city } = items[itemID].receiver;
		const itemElement = document.createElement("li");
		const closeElement = document.createElement("button");
		const nameElement = document.createTextNode(name);
		const titleElement = document.createElement("div");
		const subTitleElement = document.createElement("div");
		itemElement.className = "list-group-item list-group-item-action border-0";
		itemElement.id = itemID;
		closeElement.className = "close btn-sm";
		closeElement.innerHTML = '<span aria-hidden="true">&times;</span>';
		closeElement.addEventListener("click", () => onRemoveClicked(itemElement, itemID));
		titleElement.className = "block__item__title";
		titleElement.appendChild(nameElement);
		titleElement.appendChild(closeElement);
		subTitleElement.className = "block__item__sub-title";
		subTitleElement.innerText = `${money} - ${district}, ${city}`;
		subTitleElement.addEventListener("click", () => onEditClicked(items[itemID], itemID, itemElement));
		itemElement.appendChild(titleElement);
		itemElement.appendChild(subTitleElement);
		container.appendChild(itemElement);
	});
	if (Object.keys(items).length) displayConfirmItemContainer(true);
};

const onImportClicked = (time) => {
	const warehouseItems = !localStorage.getItem("warehouseItems") ? {} : JSON.parse(localStorage.getItem("warehouseItems"));
	const item = validateInputValue(time);
	if (item) {
		warehouseItems[randomString(20)] = item;
		localStorage.setItem("warehouseItems", JSON.stringify(warehouseItems));
		renderList(warehouseItems);
	}
	// const item = {
	// 	name: "Noname",
	// 	category: "Điện thoại - Máy tính bảng",
	// 	weight: 1,
	// 	exportDeadline: "16/06/2020",
	// 	money: 200000,
	// 	receiver: {
	// 		fullName: "Nguyen Khac Khanh",
	// 		phoneNumber: "0582419433",
	// 		email: "encacap@gmail.com",
	// 		address: {
	// 			street: "01 Nguyen Thi Bup",
	// 			ward: "Hiep Thanh",
	// 			district: "12",
	// 			city: "Ho Chi Minh",
	// 		},
	// 	},
	// };
	// localStorage.setItem("warehouseItems", JSON.stringify(warehouseItems));
	// console.log(JSON.parse(localStorage.getItem("warehouseItems")));
	// localStorage.clear();
};

export { onImportClicked, renderList };
