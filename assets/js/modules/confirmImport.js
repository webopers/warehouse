const onConfirmImportClicked = (warehouse, logs, time) => {
	const warehouseItems = !localStorage.getItem("warehouseItems") ? {} : JSON.parse(localStorage.getItem("warehouseItems"));
	Object.keys(warehouseItems).forEach((itemID) => {
		warehouse.push(warehouseItems[itemID]);
		logs.push({
			action: "import",
			time,
			content: warehouseItems[itemID].item.name,
		});
	});
	localStorage.clear();
	window.location.href = "/";
};

export default onConfirmImportClicked;
