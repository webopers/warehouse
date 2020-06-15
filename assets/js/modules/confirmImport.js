const onConfirmImportClicked = (warehouse, author, time) => {
	const log = warehouse.child("logs");
	const warehouseItems = !localStorage.getItem("warehouseItems") ? {} : JSON.parse(localStorage.getItem("warehouseItems"));
	Object.keys(warehouseItems).forEach((itemID) => {
		warehouse.child("items").push(warehouseItems[itemID]);
		log.child("detail").push({
			action: "import",
			time,
			content: warehouseItems[itemID].item.name,
			author,
		});
	});
	log.child("updatedTime/item").set(time);
	log.child("updatedTime/log").set(time);
	localStorage.clear();
	window.location.href = "/";
};

export default onConfirmImportClicked;
