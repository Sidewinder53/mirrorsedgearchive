window.addEventListener("message", getMessage, false);

function getMessage(message) {
  window.history.pushState(null, null, document.location.pathname + "?path=" + message.data);
  console.log(message.data);
}
