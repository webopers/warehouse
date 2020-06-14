const onConfirmImportClicked = (warehouse, logs, updated, name, time) => {
	const warehouseItems = !localStorage.getItem("warehouseItems") ? {} : JSON.parse(localStorage.getItem("warehouseItems"));
	Object.keys(warehouseItems).forEach((itemID) => {
		warehouse.push(warehouseItems[itemID]);
		logs.push({
			action: "import",
			time,
			content: warehouseItems[itemID].item.name,
			name,
		});
	});
	localStorage.clear();
	updated.child("logUpdate").set(time);
	updated.child("updated").set(time);
	window.location.href = "/";
};

export default onConfirmImportClicked;
