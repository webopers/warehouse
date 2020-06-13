import firebase from "./firebase-config.js";
import { onImportClicked, renderList, onRandomClicked } from "./modules/insertWarehouseItem.js";
import renderOptions from "./modules/renderOptions.js";
import onConfirmImportClicked from "./modules/confirmImport.js";

const developmentEnvironment = window.location.href.split("/")[2] !== "warehouse.webopers.com";
let categoriesData = [];
let administrativeData = {};

const onDistrictChanged = (district = "1") => {
	renderOptions(administrativeData[district], "receiverWard", "Phường");
};

const handlingAdministrative = (data) => {
	administrativeData = data;
	renderOptions(Object.keys(administrativeData), "receiverDistrict", "Quận");
	onDistrictChanged();
};

const handlingCategories = (categories) => {
	categoriesData = categories;
	renderOptions(categoriesData, "warehouseItemCategories");
};

const getData = (database, callback) => {
	database.orderByKey().on("value", (dataSnapshot) => {
		callback(dataSnapshot.val());
	});
};

const onAddCategoryBtnClicked = (action) => {
	const addCategoryNode = document.querySelector("#categoriesContainer");
	const categoryContainer = addCategoryNode.children[0];
	const addCategoryContainer = addCategoryNode.children[1];
	if (action === "show") {
		categoryContainer.classList = "d-none";
		addCategoryContainer.classList = "d-flex";
		addCategoryContainer.children[0].focus();
	} else {
		categoryContainer.classList = "d-flex";
		addCategoryContainer.classList = "d-none";
		addCategoryContainer.children[0].value = "";
	}
};

const addCategory = (warehouse, addCategoryNode) => {
	const category = addCategoryNode.value;
	categoriesData.push(category);
	if (category.length > 0) warehouse.child("categories").set(categoriesData);
	onAddCategoryBtnClicked("hide");
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

firebase.auth().onAuthStateChanged((userData) => {
	if (!userData) {
		if (developmentEnvironment) window.location.href = "/accounts/login.html";
		else window.location.href = "/login/";
	} else {
		const database = firebase.database();
		const warehouses = database.ref(`warehouses/${userData.uid}`);
		const administrative = database.ref("administrative/");

		getData(warehouses.child("categories"), handlingCategories);
		getData(administrative.child("Hồ Chí Minh"), handlingAdministrative);

		if (localStorage.getItem("warehouseItems")) renderList(JSON.parse(localStorage.getItem("warehouseItems")));

		const addCategoryBtn = document.querySelector("#addCategoryBtn");
		const closeAddCategoryBtn = document.querySelector("#closeAddCategoryBtn");
		const addCategoryInput = document.querySelector("#addCategoryInput");
		const receiverDistrict = document.querySelector("#receiverDistrict");
		const importBtn = document.querySelector("#importBtn");
		const randomBtn = document.querySelector("#randomBtn");
		const confirmImportBtn = document.querySelector("#confirmImport");

		addCategoryBtn.addEventListener("click", () => onAddCategoryBtnClicked("show"));
		closeAddCategoryBtn.addEventListener("click", () => onAddCategoryBtnClicked("hide"));
		addCategoryInput.addEventListener("keypress", (event) => {
			if (event.keyCode === 13) addCategory(warehouses, addCategoryInput);
		});
		receiverDistrict.addEventListener("change", () => onDistrictChanged(receiverDistrict.value));
		importBtn.addEventListener("click", () => onImportClicked(getTime()));
		randomBtn.addEventListener("click", () => onRandomClicked(getTime(), administrativeData));
		confirmImportBtn.addEventListener("click", () => onConfirmImportClicked(warehouses));
	}
});
