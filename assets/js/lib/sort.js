const convertObjectToArray = (object) => {
	return Object.keys(object).map((itemID) => {
		return {
			itemID,
			...object[itemID],
		};
	});
};

const convertArrayToObject = (array) => {
	const result = {};
	array.forEach((item) => {
		const itemData = item;
		const { itemID } = item;
		delete itemData.itemID;
		result[itemID] = { ...itemData };
	});
	return result;
};

const convertToMiliSeconds = (dateString) => {
	const date = dateString.slice(0, 2);
	const month = dateString.slice(3, 5);
	const year = dateString.slice(6, 10);
	const dateObj = new Date();
	dateObj.setDate(Number(date));
	dateObj.setMonth(Number(month) - 1);
	dateObj.setFullYear(Number(year));
	return dateObj.getTime();
};

const isDate = (string) => {
	return string.length === 10 && string[2] === "/" && string[5] === "/";
};

const compareValues = (key, order = "asc") => {
	return (a, b) => {
		let varA = typeof a.item[key] === "string" ? a.item[key].toUpperCase() : a.item[key];
		let varB = typeof b.item[key] === "string" ? b.item[key].toUpperCase() : b.item[key];
		let comparison = 0;
		if (isDate(varA)) {
			varA = convertToMiliSeconds(varA);
			varB = convertToMiliSeconds(varB);
		}
		comparison = varA.localeCompare(varB);
		return order === "desc" ? comparison * -1 : comparison;
	};
};

const quickSort = (arr, compareFunc) => {
	if (arr.length < 2) return arr;

	const pivotIndex = arr.length - 1;
	const pivot = arr[pivotIndex];

	const left = [];
	const right = [];

	let currentItem;
	for (let i = 0; i < pivotIndex; i += 1) {
		currentItem = arr[i];
		if (compareFunc()(currentItem, pivot) === -1) {
			left.push(currentItem);
		} else {
			right.push(currentItem);
		}
	}

	return [...quickSort(left, compareFunc), pivot, ...quickSort(right, compareFunc)];
};

const sort = (algorithm = "default", itemsObject, key, order = "asc") => {
	let warehouseItems = convertObjectToArray(itemsObject);
	if (algorithm === "quicksort") warehouseItems = quickSort(warehouseItems, () => compareValues(key, order));
	else warehouseItems.sort(compareValues(key, order));
	return convertArrayToObject(warehouseItems);
};

// const a = sort("quicksort", warehouseItemsObject, "name");
// Object.keys(a).forEach((itemID) => console.log(a[itemID].item.name));

export { sort as default };
