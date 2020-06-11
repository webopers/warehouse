import firebase from "./firebase-config.js";

const developmentEnvironment = window.location.href.split("/")[2] === "warehouse.webopers.com";

firebase.auth().onAuthStateChanged((user) => {
	if (!user) {
		if (developmentEnvironment) Location.href = "/accounts/login/";
		else Location.href = "/login/";
	}
});
