import { formatCurrency } from "../lib/currency.js";

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

const addDays = (dateObj, numDays) => {
	dateObj.setDate(dateObj.getDate() + numDays);
	const date = dateObj.getDate() < 10 ? `0${dateObj.getDate()}` : dateObj.getDate();
	const month = dateObj.getMonth() < 10 ? `0${dateObj.getMonth() + 1}` : dateObj.getMonth() + 1;
	const year = dateObj.getFullYear();
	return `${year}-${month}-${date}`;
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
	if (itemNameNode.value.length < 1) itemNameNode.classList.add("is-invalid");
	else if (Number(itemWeightNode.value) < 0.1) itemWeightNode.classList.add("is-invalid");
	else if (!itemExportDateNode.value) itemExportDateNode.classList.add("is-invalid");
	else if (Number(itemMoneyNode.value) < 10000) itemMoneyNode.classList.add("is-invalid");
	else if (receiverNameNode.value.length < 1) receiverNameNode.classList.add("is-invalid");
	else if (receiverPhoneNode.value.length !== 10) receiverPhoneNode.classList.add("is-invalid");
	else if (receiverEmailNode.value.length < 10) receiverEmailNode.classList.add("is-invalid");
	else if (receiverStreetNode.value.length < 6) receiverStreetNode.classList.add("is-invalid");
	else {
		const itemData = {
			item: {
				name: itemNameNode.value,
				category: itemCategoryNode.value,
				weight: itemWeightNode.value,
				exportDate: itemExportDateNode.value,
				importDate: time,
				money: itemMoneyNode.value,
				status: "inventory",
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

		itemNameNode.value = "";
		itemWeightNode.value = "";
		itemExportDateNode.value = "";
		itemMoneyNode.value = "";
		receiverNameNode.value = "";
		receiverPhoneNode.value = "";
		receiverEmailNode.value = "";
		receiverStreetNode.value = "";
		receiverCity = "";
		return itemData;
	}
	if (Object.keys(fillItem).length > 0) {
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
		subTitleElement.innerText = `${formatCurrency(String(money), "VND")} - ${district}, ${city}`;
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
};

const randomItems = [
	{
		name: "Smart Tivi Samsung 55 inch 4K UHD UA55NU7090KXXV",
		category: "Điện tử - Điện lạnh",
		money: 9600000,
		weight: 17.5,
	},
	{
		name: "Máy Lạnh Casper SC-09TL22 (1.0HP)",
		category: "Điện tử - Điện lạnh",
		money: 5550000,
		weight: 8,
	},
	{
		name: "Smart Tivi LG 55 inch 4K UHD 55UM7600PTA",
		category: "Điện tử - Điện lạnh",
		money: 13790000,
		weight: 17.1,
	},
	{
		name: "Smart Tivi LG 43 inch Full HD 43LK571C",
		category: "Điện tử - Điện lạnh",
		money: 6389000,
		weight: 8.1,
	},
	{
		name: "Android Tivi Box Xiaomi Mibox S 4K Global Quốc Tế (Android 8.1)",
		category: "Điện tử - Điện lạnh",
		money: 1349000,
		weight: 1.1,
	},
	{
		name: "Điện Thoại Samsung Galaxy M11 (32GB/3GB)",
		category: "Điện thoại - Máy tính bảng",
		money: 3190000,
		weight: 0.2,
	},
	{
		name: "Điện Thoại Vsmart Active 3",
		category: "Điện thoại - Máy tính bảng",
		money: 2985000,
		weight: 0.2,
	},
	{
		name: "iPad 10.2 Inch WiFi 32GB New 2019",
		category: "Điện thoại - Máy tính bảng",
		money: 8090000,
		weight: 0.2,
	},
	{
		name: "Điện Thoại Samsung Galaxy Note 10 Lite (128GB/8GB)",
		category: "Điện thoại - Máy tính bảng",
		money: 12990000,
		weight: 0.2,
	},
	{
		name: "Điện Thoại Vsmart Star",
		category: "Điện thoại - Máy tính bảng",
		money: 1190000,
		weight: 0.2,
	},
	{
		name: "Apple Macbook Air 2020 - 13 Inchs (i3-10th/ 8GB/ 256GB)",
		category: "Laptop - Thiết bị IT",
		money: 24529000,
		weight: 1.3,
	},
	{
		name: "Màn Hình Máy Tính Cong Full Viền 24inch 75Hz Mới HUGON Q24 sử dụng cáp HDMI",
		category: "Laptop - Thiết bị IT",
		money: 1549000,
		weight: 4,
	},
	{
		name: "Laptop Asus Vivobook A512DA-EJ406T AMD R5-3500U/Win10 (15.6 FHD)",
		category: "Laptop - Thiết bị IT",
		money: 13159000,
		weight: 1.7,
	},
	{
		name: "Bàn Phím Có Dây Dell KB216 - Đen",
		category: "Laptop - Thiết bị IT",
		money: 145000,
		weight: 1,
	},
	{
		name: "Chuột Không Dây Logitech M238 Marvel Collection",
		category: "Laptop - Thiết bị IT",
		money: 263000,
		weight: 0.1,
	},
	{
		name: "Adapter Sạc 2 Cổng Anker PowerPort Mini 12W - A2620",
		category: "Phụ kiện - Thiết bị số",
		money: 214000,
		weight: 0.1,
	},
	{
		name: "Tai Nghe Nhét Tai Mi Basic Xiaomi HSEJ03JY",
		category: "Phụ kiện - Thiết bị số",
		money: 116000,
		weight: 0.1,
	},
	{
		name: "Tai nghe Inpod i12 TWS Bluetooth 5.0",
		category: "Phụ kiện - Thiết bị số",
		money: 102000,
		weight: 0.1,
	},
	{
		name: "Pin Sạc Dự Phòng Anker PowerCore II 20000mAh Tích Hợp PowerIQ 2.0 - A1260",
		category: "Phụ kiện - Thiết bị số",
		money: 1050000,
		weight: 0.5,
	},
	{
		name: "Tai nghe gaming có mic G901 dùng được cho điện thoại và máy tính",
		category: "Phụ kiện - Thiết bị số",
		money: 117000,
		weight: 0.1,
	},
];
const randomName = ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Dương Thị D", "Võ Thị E", "Nguyễn Thị F"];
const randomPhone = ["0123456789", "0157451245", "4512220001", "7541201451", "7548120155", "0123584126"];
const randomMail = [
	"lasdfjaf@gmail.com",
	"aksjfauw@gmail.com",
	"sfiawjieasf@gmail.com",
	"asfkmvvskjda@gmail.com",
	"sascmslksmcsaf@gmail.com",
	"sadifwnasd@gmail.com",
	"asdfiqwoer@gmail.com",
	"asdfioqriw@gmail.com",
];
const randomStreet = [
	"Đường số 1",
	"Đường số 2",
	"Đường số 3",
	"Đường số 4",
	"Đường số 5",
	"Đường số 6",
	"Đường số 7",
	"Đường số 8",
	"Đường số 9",
	"Đường số 10",
	"Đường số 11",
];

const onRandomClicked = (time, administrative) => {
	const itemID = randomString(20);
	const randomDistrict = Object.keys(administrative);
	const district = randomDistrict[randomNumber(0, randomDistrict.length)];
	const randomWard = administrative[district];
	const item = {
		item: randomItems[randomNumber(0, randomItems.length)],
		receiver: {
			name: randomName[randomNumber(0, randomName.length)],
			phone: randomPhone[randomNumber(0, randomPhone.length)],
			email: randomMail[randomNumber(0, randomMail.length)],
			street: randomStreet[randomNumber(0, randomStreet.length)],
			district,
			ward: randomWard[randomNumber(0, randomWard.length)],
			city: "Hồ Chí Minh",
		},
	};
	item.item.status = "inventory";
	item.item.importDate = time;
	item.item.exportDate = addDays(new Date(), randomNumber(0, 10));
	const warehouseItems = !localStorage.getItem("warehouseItems") ? {} : JSON.parse(localStorage.getItem("warehouseItems"));
	warehouseItems[itemID] = item;
	localStorage.setItem("warehouseItems", JSON.stringify(warehouseItems));
	renderList(warehouseItems);
};

export { onImportClicked, renderList, onRandomClicked };
