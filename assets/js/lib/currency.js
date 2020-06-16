const formatCurrency = (money, unit) => {
	const { length } = money;
	let result = "";
	let count = 0;
	for (let i = length - 1; i >= 0; i -= 1) {
		if (count % 3 !== 0) result = money[i] + result;
		else result = `${money[i]}.${result}`;
		count += 1;
	}
	return `${result.slice(0, result.length - 1)} ${unit || ""}`;
};

export default formatCurrency;
