import firebase from "./firebase-config.js";

const developmentEnvironment = window.location.href.split("/")[2] !== "warehouse.webopers.com";

const render = (logs) => {
	const container = document.querySelector(".logsItemContainer");
	const loadingNode = document.querySelector(".loading");
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
	if (logs) {
		Object.keys(logs).forEach((logID) => {
			// eslint-disable-next-line object-curly-newline
			const { content, time } = logs[logID];
			let { action } = logs[logID];
			const rowElement = document.createElement("tr");
			if (action === "import") action = "Nhập hàng";
			else if (action === "create shipper") action = "Thêm nhân viên";
			else if (action === "remove shipper") action = "Xoá nhân viên";
			else if (action === "export") action = "Giao hàng";
			else if (action === "return") action = "Trả hàng về kho";
			rowElement.innerHTML = `
				<td>${action}</td>
				<td>${content}</td>
				<td>${time}</td>
			`;
			container.prepend(rowElement);
		});
	} else {
		document.querySelector(".table-empty").classList.remove("d-none");
	}
	const spaceRow = document.createElement("tr");
	spaceRow.style.height = "24px";
	container.prepend(spaceRow);
	loadingNode.classList.add("d-none");
	loadingNode.classList.remove("d-flex");
};

const getLogsItem = (logs) => {
	logs.on("value", (dataSnapshot) => {
		render(dataSnapshot.val());
	});
};

firebase.auth().onAuthStateChanged((user) => {
	if (!user) {
		if (developmentEnvironment) window.location.href = "/accounts/login.html";
		else window.location.href = "/login/";
	} else {
		firebase
			.database()
			.ref(`/users/${user.uid}`)
			.once("value")
			.then((dataSnapshot) => {
				const database = firebase.database();
				const { warehouse: warehouseID } = dataSnapshot.val();
				const logs = database.ref(`/warehouses/${warehouseID}/employees/${user.uid}/logs`);

				getLogsItem(logs.child("detail"));

				logs.child("updated").on("value", (updatedTime) => {
					document.querySelector("#updatedTime").innerText = updatedTime.val();
				});
				const logoutBtn = document.querySelector("#logout");
				logoutBtn.addEventListener("click", () => {
					firebase
						.auth()
						.signOut()
						.then(() => {
							window.location.href = "/accounts/login.html";
						});
				});
			});
	}
});
