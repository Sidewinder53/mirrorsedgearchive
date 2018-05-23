submit = function(event) {
	if (document.getElementById("agreement").checked == true) {
		return true;
	} else {
		document.getElementById("agreement").classList.add("is-invalid");
		return false;
	}
}

fc = function(event) {
	$('#collapse_info').collapse('hide');
	$('#collapse_fc').collapse('show');
}