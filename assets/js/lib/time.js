const getTime = () => {
	const date = new Date();
	const today = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	const month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
	const year = date.getFullYear();
	const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
	const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
	return `${today}/${month}/${year} - ${hours}:${minutes}`;
};

export default { getTime };
