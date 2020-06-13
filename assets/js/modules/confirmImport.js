const onConfirmImportClicked = (database) => {
	const warehouseItems = !localStorage.getItem("warehouseItems") ? {} : JSON.parse(localStorage.getItem("warehouseItems"));
	Object.keys(warehouseItems).forEach((itemID) => {
		database.push(warehouseItems[itemID]);
	});
	localStorage.clear();
	window.location.href = "/";
};

export default onConfirmImportClicked;
