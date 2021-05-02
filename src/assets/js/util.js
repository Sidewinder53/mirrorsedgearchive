if (
  window.navigator.userAgent.indexOf("MSIE ") > 0 ||
  window.navigator.userAgent.indexOf("Trident/") > 0
) {
  if (document.readyState === "complete" || document.readyState === "loaded") {
    displayUnsupportedBrowserBanner();
  } else {
    window.addEventListener("DOMContentLoaded", function() {
      displayUnsupportedBrowserBanner();
    });
  }
} else if (document.referrer.includes('mirrorsedgearchive.de')) {
  if (Cookies.get("domain_migration_read") != "true") {
    displayDomainMigrationBanner();
    console.log("Domain migration banner triggered");
    Cookies.set("domain_migration_read", "true", { expires: 30 });
  }
}

function displayUnsupportedBrowserBanner() {
  var el = document.createElement("div");
  el.innerHTML =
    "<div id='unsupported_ie' class='bg-dark text-white d-flex align-items-center'><div class='container'><div class='row'><div class='col- pt-2'><svg viewBox='0 0 24 24'><path fill='#ffffff' d='M13,3L14,3.06C16.8,1.79 19.23,1.64 20.5,2.92C21.5,3.93 21.58,5.67 20.92,7.72C21.61,9 22,10.45 22,12L21.95,13H9.08C9.45,15.28 11.06,17 13,17C14.31,17 15.47,16.21 16.2,15H21.5C20.25,18.5 16.92,21 13,21C11.72,21 10.5,20.73 9.41,20.25C6.5,21.68 3.89,21.9 2.57,20.56C1,18.96 1.68,15.57 4,12C4.93,10.54 6.14,9.06 7.57,7.65L8.38,6.88C7.21,7.57 5.71,8.62 4.19,10.17C5.03,6.08 8.66,3 13,3M13,7C11.21,7 9.69,8.47 9.18,10.5H16.82C16.31,8.47 14.79,7 13,7M20.06,4.06C19.4,3.39 18.22,3.35 16.74,3.81C18.22,4.5 19.5,5.56 20.41,6.89C20.73,5.65 20.64,4.65 20.06,4.06M3.89,20C4.72,20.84 6.4,20.69 8.44,19.76C6.59,18.67 5.17,16.94 4.47,14.88C3.27,17.15 3,19.07 3.89,20Z' /></svg></div><div class='col'><p class='mb-0'><b>Please note that The Mirror's Edge Archive no longer supports Internet Explorer.</b><br>We recommend upgrading to the latest <a href='https://www.microsoft.com/edge/'>Microsoft Edge</a> or <a href='https://www.mozilla.org/firefox/new/'>Firefox</a>.</p></div></div></div></div>";
  document.body.insertBefore(el, document.getElementsByClassName("navbar")[0]);
}

function displayDomainMigrationBanner() {
  var el = document.createElement("div");
  el.innerHTML =
    "<div id='domain-migration-banner' class='bg-dark text-white d-flex align-items-center'><div class='container'><div class='row'><div class='col- pt-2'><svg viewBox='0 0 24 24'><path fill='#ffffff' d='M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' /></svg></div><div class='col'><p class='mb-0'>The Mirror's Edge Archive is now on <kbd>.org</kbd><br>You were redirect from mirrorsedgearchive<b>.de</b> to mirrorsedgearchive<b>.org</b>.</p></div></div></div></div>";
  document.body.insertBefore(el, document.getElementsByClassName("navbar")[0]);
}

if (Cookies.get("cookie_consent") == "true") {
} else if (Cookies.get("cookie_attempts") == "0") {
  Cookies.set("cookie_consent", "true", { expires: 30 });
} else {
  if ($("#cookie_consent_placeholder").length === 1) {
    if (Cookies.get("cookie_attempts")) {
      var attempts_left = Cookies.get("cookie_attempts");
      Cookies.set("cookie_attempts", attempts_left - 1, { expires: 30 });
    } else {
      Cookies.set("cookie_attempts", "3", { expires: 30 });
    }
    $("#cookie_consent_placeholder").html(
      "<div id='cookie_consent' class='alert alert-secondary alert-dismissible fade show' role='alert'><div class='media'><svg class='mr-3' style='width:24px;height:24px' viewBox='0 0 24 24'><path fill='#007bff' d='M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12C21,11.5 20.96,11 20.87,10.5C20.6,10 20,10 20,10H18V9C18,8 17,8 17,8H15V7C15,6 14,6 14,6H13V4C13,3 12,3 12,3M9.5,6A1.5,1.5 0 0,1 11,7.5A1.5,1.5 0 0,1 9.5,9A1.5,1.5 0 0,1 8,7.5A1.5,1.5 0 0,1 9.5,6M6.5,10A1.5,1.5 0 0,1 8,11.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 5,11.5A1.5,1.5 0 0,1 6.5,10M11.5,11A1.5,1.5 0 0,1 13,12.5A1.5,1.5 0 0,1 11.5,14A1.5,1.5 0 0,1 10,12.5A1.5,1.5 0 0,1 11.5,11M16.5,13A1.5,1.5 0 0,1 18,14.5A1.5,1.5 0 0,1 16.5,16H16.5A1.5,1.5 0 0,1 15,14.5H15A1.5,1.5 0 0,1 16.5,13M11,16A1.5,1.5 0 0,1 12.5,17.5A1.5,1.5 0 0,1 11,19A1.5,1.5 0 0,1 9.5,17.5A1.5,1.5 0 0,1 11,16Z' /></svg>			<div class='media-body'><small>We use cookies to optimize your experience. By continuing to use our site, you accept our use of cookies and <a href='/legal/privacy-policy.html'>Privacy Policy</a>.</a></small><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div></div></div>"
    );
    setTimeout(function() {
      if ($("#legal_footer").css("display") == "block") {
        $("#cookie_consent").fadeTo("fast", 1);
      }
    }, 500);
  }
}

$("#cookie_consent").on("closed.bs.alert", function() {
  Cookies.set("cookie_consent", "true", { expires: 30 });
});
