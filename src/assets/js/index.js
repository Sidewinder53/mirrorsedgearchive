function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var _ref = [a[j], a[i]];
    a[i] = _ref[0];
    a[j] = _ref[1];
  }
  return a;
}

$.fn.isInViewport = function() {
  var elementTop = $(this).offset().top;
  var elementBottom = elementTop + $(this).outerHeight();
  var viewportTop = $(window).scrollTop();
  var viewportBottom = viewportTop + $(window).height();
  return elementBottom > viewportTop && elementTop < viewportBottom;
};

$(document).ready(function() {
  var skipped = "false";

  if ($("#desktopHero").css("display") != "none") {
    $("#hero")[0].play();
    let carouselImages = {
      "hero_img_1.jpg":
        "{{ manifest['assets/media/image/home/hero_img_1.jpg'] }}",
      "hero_img_1.webp":
        "{{ manifest['assets/media/image/home/hero_img_1.webp'] }}",
      "hero_img_2.jpg":
        "{{ manifest['assets/media/image/home/hero_img_2.jpg'] }}",
      "hero_img_2.webp":
        "{{ manifest['assets/media/image/home/hero_img_2.webp'] }}",
      "hero_img_3.jpg":
        "{{ manifest['assets/media/image/home/hero_img_3.jpg'] }}",
      "hero_img_3.webp":
        "{{ manifest['assets/media/image/home/hero_img_3.webp'] }}",
      "hero_img_4.jpg":
        "{{ manifest['assets/media/image/home/hero_img_4.jpg'] }}",
      "hero_img_4.webp":
        "{{ manifest['assets/media/image/home/hero_img_4.webp'] }}",
      "hero_img_5.jpg":
        "{{ manifest['assets/media/image/home/hero_img_5.jpg'] }}",
      "hero_img_5.webp":
        "{{ manifest['assets/media/image/home/hero_img_5.webp'] }}",
      "hero_img_6.jpg":
        "{{ manifest['assets/media/image/home/hero_img_6.jpg'] }}",
      "hero_img_6.webp":
        "{{ manifest['assets/media/image/home/hero_img_6.webp'] }}",
      "hero_img_7.jpg":
        "{{ manifest['assets/media/image/home/hero_img_7.jpg'] }}",
      "hero_img_7.webp":
        "{{ manifest['assets/media/image/home/hero_img_7.webp'] }}",
      "hero_img_8.jpg":
        "{{ manifest['assets/media/image/home/hero_img_8.jpg'] }}",
      "hero_img_8.webp":
        "{{ manifest['assets/media/image/home/hero_img_8.webp'] }}",
      "hero_img_9.jpg":
        "{{ manifest['assets/media/image/home/hero_img_9.jpg'] }}",
      "hero_img_9.webp":
        "{{ manifest['assets/media/image/home/hero_img_9.webp'] }}"
    };
    let carouselImageObject = "";

    enu = shuffle([2, 3, 4, 5, 6, 7, 8, 9]);
    for (i = 0; i < 4; i++) {
      carouselImageObject +=
        '<div class="carousel-item"><div class="image-wrapper-37 image-wrapper">' +
        '<picture class="d-block w-100"><source srcset="/' +
        carouselImages["hero_img_" + enu[i] + ".webp"] +
        '" type="image/webp" width="1280px" height="480px"><img src="/' +
        carouselImages["hero_img_" + enu[i] + ".jpg"] +
        '" type="image/jpg" width="1280px" height="480px" loading="lazy">' +
        '</picture></div></div>';
    }

    $("#heroSlides > .carousel-inner").append(carouselImageObject);

    if (Cookies.get("skip_intro") == "true") {
      skipped = "true";
      $("#hero_text, #cookie_consent, #nav-cont").fadeTo("slow", 1);
      $("#overview")
        .children()
        .each(function() {
          if ($(this).isInViewport()) {
            $(this)
              .css("display", "flex")
              .css("opacity", 0)
              .fadeTo("slow", 1);
          } else {
            $(this).css("display", "flex");
          }
        });
      $("#legal_footer").css("display", "block");
      $("#herocard").addClass("shadow");
      $(".card").css("border-width", "1px");
      $(".card .bg-light").css("background-color", "#f8f9fa");
    }

    setTimeout(function() {
      if ($("#hero").get(0).paused == true) {
        $("#hero_text, #overview, #nav-cont").fadeTo("slow", 1);
        $("#herocard").addClass("shadow");
        $(".card").css("border-width", "1px");
      }
    }, 1000);
    // });
  } else {
    $("#hero_text, #cookie_consent, #nav-cont").fadeTo("slow", 1);
    $("#overview")
      .children()
      .each(function() {
        $(this).css("display", "flex");
      });
    $("#legal_footer").css("display", "block");
    $(".card").css("border-width", "1px");
    setTimeout(function() {
      $("#mobileHeroText").css("height", "5em");
    }, 1500);
  }

  $("#hero").on("timeupdate", function(event) {
    if (this.currentTime >= 1.5 && skipped == "false") {
      $("#nav-cont, #hero_text").fadeTo("slow", 1, function() {
        $("#overview")
          .children()
          .each(function() {
            if ($(this).isInViewport()) {
              $(this)
                .css("display", "flex")
                .css("opacity", 0)
                .fadeTo("slow", 1);
            } else {
              $(this).css("display", "flex");
            }
          });
        $("#cookie_consent").fadeTo("fast", 1);
        $("#legal_footer").css("display", "block");
      });
      $("#herocard").addClass("shadow");
      $(".card").css("border-width", "1px");
      Cookies.set("skip_intro", "true", { expires: 1 / 24 });
      skipped = true;
    }
  });

  $("video").on("ended", function() {
    $("#heroSlides").carousel({ interval: 3000 });
    $("#hero").addClass("d-none");
    $("#heroSlides").removeClass("d-none");
    $("#media_copyright").fadeTo("slow", 1);
  });
});
