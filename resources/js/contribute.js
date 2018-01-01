document.addEventListener("keydown", keyDownTextField, false);

var i = 9;

var IntervalId = setInterval(function(){
	document.getElementById("contributeButton").innerHTML = "<small>" + i + "</small>";
	if (i<=0) {
		document.getElementById("contributeButton").classList.remove("disabled");
		document.getElementById("contributeButton").innerHTML = "Continue to upload form";
		clearInterval(IntervalId);
	}
	i--;
}, 1000);

function keyDownTextField(e) {
var keyCode = e.keyCode;
  if(keyCode==13) {
  document.getElementById("contributeButton").classList.remove("disabled");
  document.getElementById("contributeButton").innerHTML = "Continue to upload form";
  clearInterval(IntervalId);
  }
}