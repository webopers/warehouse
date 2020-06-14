const renderOptions = (options, selectID, prefix = "") => {
	const loadingNode = document.querySelector(".loading");
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
	loadingNode.classList.add("d-none");
	loadingNode.classList.remove("d-flex");
};
export default renderOptions;
