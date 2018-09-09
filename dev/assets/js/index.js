function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var _ref = [a[j], a[i]];
    a[i] = _ref[0];
    a[j] = _ref[1];
  }
  return a;
}

$(document).ready(function() {
  var skipped = 'false';

  if ($('#responsiveHero').css('display') != 'none') {
    $('#hero')[0].play();
    var cit =
      '<div class="carousel-item"><picture class="d-block w-100"><source srcset="/assets/media/image/home/hero_img_X.webp" type="image/webp"><img src="/assets/media/image/home/hero_img_X.jpg"></picture></div>';
    var cis =
      '<div class="carousel-item active"><picture class="d-block w-100"><source srcset="/assets/media/image/home/hero_img_1.webp" type="image/webp"><img src="/assets/media/image/home/hero_img_1.jpg"></picture></div>';
    enu = shuffle([2, 3, 4, 5, 6, 7, 8, 9]);
    for (i = 0; i < 4; i++) {
      cis += cit.replace(/hero_img_X/g, 'hero_img_' + enu[i]);
    }

    $('#heroSlides > .carousel-inner').html(cis);
    $.getScript('/assets/js/cookie-consent.js', function() {
      if (Cookies.get('skip_intro') == 'true') {
        skipped = 'true';
        $('#hero_text, #overview, #cookie_consent, #nav-cont').fadeTo(
          'slow',
          1
        );
        $('#herocard').addClass('shadow');
        $('.card').css('border-width', '1px');
        $('.card .bg-light').css('background-color', '#f8f9fa');
      }

      setTimeout(function() {
        if ($('#hero').get(0).paused == true) {
          $('#hero_text, #overview, #nav-cont').fadeTo('slow', 1);
          $('#herocard').addClass('shadow');
          $('.card').css('border-width', '1px');
        }
      }, 1000);
    });
  } else {
    $('#hero_text, #overview, #cookie_consent, #nav-cont').fadeTo('slow', 1);
    $('.card').css('border-width', '1px');
    setTimeout(function() {
      $('#faithHeroText').css('height', '5em');
    }, 1500);
  }
  $('#hero').on('timeupdate', function(event) {
    if (this.currentTime >= 1.5 && skipped == 'false') {
      $('#hero_text, #overview, #cookie_consent, #nav-cont').fadeTo('slow', 1);
      $('#herocard').addClass('shadow');
      $('.card').css('border-width', '1px');
      Cookies.set('skip_intro', 'true', { expires: 1 / 24 });
    }
  });

  $('video').on('ended', function() {
    $('#heroSlides').carousel({ interval: 3000 });
    $('#hero').addClass('d-none');
    $('#heroSlides').removeClass('d-none');
    $('#media_copyright').fadeTo('slow', 1);
  });
});
