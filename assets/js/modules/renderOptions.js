const renderOptions = (options, selectID, prefix = "") => {
	const categoriesNode = document.querySelector(`#${selectID}`);
	const { length } = categoriesNode.options;
	for (let i = length - 1; i >= 0; i -= 1) {
		categoriesNode.options[i] = null;
	}
	options.forEach((optionID) => {
		const optionElement = document.createElement("option");
		optionElement.text = prefix !== "" ? `${prefix} ${optionID}` : optionID;
		optionElement.value = optionID;
		categoriesNode.add(optionElement);
	});
};
export default renderOptions;
