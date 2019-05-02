'use strict';

// Global variables
var database = null;
var previousVideo = null;
var nextVideo = null;
var jumpCategory = null;
var chapter = null;
var timestampList = null;
var protectedPlaybackAvailable = false;

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  // Fetch database
  $.get('data.json', function (fetchedDatabase) {
    database = fetchedDatabase;
    let castList = '';

    $.each(database.newscasts, function (i, category) {
      castList +=
        '<p class="list-group-item category collapsed" id="' +
        category.categoryName +
        '" data-toggle="collapse" href="#col-' +
        category.categoryName +
        '" role="button" aria-expanded="false" aria-controls="col-' +
        category.categoryName +
        '">' +
        category.categoryLabel +
        '</p><div class="collapse" id="col-' +
        category.categoryName +
        '">';

      $.each(category['videos'], function (j, video) {
        castList +=
          '<p class="list-group-item video" id=' +
          video.name +
          ' data-category="' +
          category.categoryName +
          '">' +
          video.label +
          '</p>';
      });
      castList += '</div>';
    });
    $('#castList').append(castList);
    console.log("[PropP] Built newscast list")

    // Search for videoID in query and play video if any
    let queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has('v')) {
      let v = queryParams.get('v').replace(/\W/g, '');
      console.log("[PropP] Query params contained video '" + v + "', playing now")
      $('#' + v).click();
      $('#' + v).parent().collapse('show');
    }
  });

  // Compatibility checks
  let comp_vidEl = false;
  let comp_mse = false;
  let comp_eme = false;
  let comp_emeVP9 = false;
  let comp_emeH264 = false;

  console.log("🛂 Checking browser compatibility...")

  if (window.HTMLVideoElement) {
    console.log("✔️ HTML5 Video Element");
    comp_vidEl = true;
  } else {
    console.log("❌ HTML5 Video Element");
  }

  if (window.MediaSource) {
    console.log("✔️ Media Source Extensions");
    comp_mse = true;
  } else {
    console.log("❌ Media Source Extensions");
  }

  if (window.MediaKeys) {
    console.log("✔️ Encrypted Media Extensions");
    comp_eme = true;
    var comp_promH264 = navigator.requestMediaKeySystemAccess(
      "org.w3.clearkey", [{ "initDataTypes": ["cenc"], "audioCapabilities": [{ "contentType": "audio/mp4;codecs=\"mp4a.40.2\"" }], "videoCapabilities": [{ "contentType": "video/mp4;codecs=\"avc1.4d481f\"" }] }]
    ).then(function (mediaKeySystemAccess) {
      console.log('✔️ MPEG-CENC with ClearKey (H264)');
      comp_emeH264 = true;
    }).catch(function (e) {
      console.log('❌ MPEG-CENC with ClearKey (H264)');
    });

    var comp_promVP9 = navigator.requestMediaKeySystemAccess(
      "org.w3.clearkey", [{ "initDataTypes": ["cenc"], "audioCapabilities": [{ "contentType": "audio/webm;codecs=\"vorbis\"" }], "videoCapabilities": [{ "contentType": "video/webm;codecs=\"vp09.00.40.08.01.02.02.02.00\"" }] }]
    ).then(function (mediaKeySystemAccess) {
      console.log('✔️ MPEG-CENC with ClearKey (VP9)');
      comp_emeVP9 = true;
    }).catch(function (e) {
      console.log('❌ MPEG-CENC with ClearKey (VP9)');
    });
  } else {
    console.log("❌ Encrypted Media Extensions");
  }

  if (comp_vidEl == true) {
    if (comp_mse == true && comp_eme == true) {
      Promise.all([comp_promH264, comp_promVP9]).then(function () {
        if (comp_emeH264 == true || comp_emeVP9 == true) {
          console.log("✔️ Protected content available");
          console.log("✔️ Video playback available");
          $("#vidCENC").css('display', 'block')
          protectedPlaybackAvailable = true;
          shaka.polyfill.installAll();
          console.log("⚙️ Initializing Shaka Player...");
          console.log("🛑 ============== SHAKA DEBUG ACTIVE ==============");
          initPlayer();
          hookBindings();
          hookDashBindings();
        } else {
          console.log("❌ Protected content unavailable");
          $("#vidCompStatus").css('display', 'flex');
          $("#vidIntro").addClass('font-weight-bold');
          $("#vidIntro").html("Fallback video is not available in this build.");
          hookBindings();
          hookFallbackBindings();
          console.log("✔️ Video playback available");
        }
      })
    } else {
      console.log("❌ Protected content unavailable");
      $("#vidCompStatus").css('display', 'flex');
      $("#vidIntro").addClass('font-weight-bold');
      $("#vidIntro").html("Fallback video is not available in this build.");
      hookBindings();
      hookFallbackBindings();
      console.log("✔️ Video playback available");
    }
  } else {
    console.log("❌ Video playback unavailable");
    // TODO Display fatal error
  }
  // End of compatibility checks
}

function initPlayer() {
  var video = $('#vidPlayer').get(0);
  var player = new shaka.Player(video);
  var bandwidth = getBandwidthCookie();
  var trackOverride = getTrackOverrideCookie();
  window.abrEnabled = getAbrCookie();
  console.log('[Shaka] ABR enabled: ' + abrEnabled + ' | ABR bandwidth: ' + Math.round(bandwidth/100000) / 10 + ' Mbit/s')
  var keys = JSON.parse(atob("eyIzYzMxYzY2MzcwODMwNGY1YThlZmMxODI5YTFiODI4NCI6IjdhYWRiMzNmMzExMTQyYjk3NmEzMDMyNmQ0N2U3YmE2IiwiMzg5MzA3ZjI4OGMwYjRhMzczOTE5OTllNTAzNDVjMWYiOiI4MTQ1Y2ZiZTI4ZGU0ODkzY2RlOWNkYzlkZmE0ZjczYiJ9"));

  player.configure({
    abr: {
      defaultBandwidthEstimate: bandwidth,
      enabled: abrEnabled
    },
    drm: {
      clearKeys: keys
    }
  });
  window.player = player;
  player.addEventListener('error', onErrorEvent);
}

function loadManifest(manifestUri) {
  player.load(manifestUri).then(function () {
    console.log('[PropP] Manifest loaded.');
    window.tracks = player.getVariantTracks()

    // Populate quality select menu
    let options = [];
    $("#qualitySelect").html("");
    tracks.forEach(function (element, index) {
      options.push([element.height, index])
    });
    options.sort(sortQualities);
    $("#qualitySelect").append(new Option("Auto", "auto"));
    options.forEach(function (element) {
      $("#qualitySelect").append(new Option(element[0] + "p", element[1]));
    })

    // Restore ABR status
    if (abrEnabled == true) {
      $("#qualitySelect").get(0).selectedIndex = 0;
    } else {

    }

    // Restore subtitle status
    if (Cookies.get("subtitles") == "true" && $("#subCheck").get(0).checked == false) {
      console.log("[PropP] Subtitle state restored, subtitles enabled.")
      $("#subCheck").click();
    }
  }).catch(onError);
}

function sortQualities(a, b) {
  if (a[0] === b[0]) {
    return 0;
  }
  else {
    return (a[0] < b[0]) ? -1 : 1;
  }
}


function onErrorEvent(event) {
  onError(event.detail);
}

function onError(error) {
  console.error('Error code', error.code, 'object', error);
}

function getBandwidthCookie() {
  let bandwidth = Cookies.get('bandwidth');
  if (bandwidth != undefined) {
    return Number(bandwidth);
  } else {
    return 500000;
  }
}

function getTrackOverrideCookie() {
  let trackOverride = Cookies.get('trackOverride');
  if (trackOverride != undefined) {
    return trackOverride;
  } else {
    return null;
  }
}

function getAbrCookie() {
  let abrEnabled = Cookies.get('abrEnabled');
  if (abrEnabled == "false") {
    return false;
  } else {
    Cookies.set('abrEnabled', true, { path: '/project_propaganda' })
    return true;
  }
}

function hookBindings() {
  // Enable popovers
  $('[data-toggle="popover"]').popover();

  // Show copyright notice on right click
  $('#vidPlayer').contextmenu(function (e) {
    $('#vidRCM').css('display', 'block');
    e.preventDefault();
  });

  // Hide copyright notice on regular click
  $('#vidRCM').on('click', function () {
    $('#vidRCM').css('display', 'none');
  })

  // Bind video end to autoplay check
  $('#vidPlayer').bind('ended', function () {
    if ($('#apCheck').prop('checked')) {
      if (jumpCategory) {
        $(previousVideo).parent().collapse('hide');
      }
      $('#' + nextVideo)
        .parent()
        .collapse('show');
      $('#' + nextVideo).click();
    }
  })

  // Bind clicks on timestamp list element to timestamp jump
  $('#tsList').on('click', '.timestamps', function () {
    $("#tsList > a").each(function () {
      $(this).removeClass('active');
    });
    $(this).addClass('active');
    $('#vidPlayer').get(0).currentTime = $(this).data('time');
    $('#vidPlayer')
      .get(0)
      .play();
  })

  // Bind clicks on video list element to video load
  $('.vidList').on('click', '.list-group-item.video', function () {

    // Pause player and hide navigation
    $('#vidPlayer').get(0).pause();
    $('#vidNav').hide();

    history.pushState(null, null, '?v=' + this.id);

    $('#vidPlayer, #vidFooter, #vidMeta').css('display', 'block');
    $('#vidIntro').css('display', 'none');
    $('#vidContainer')
      .css('background-color', '#000')
      .css('background-image', 'none');

    let selectedVideoElement = this;

    // Change highlight states
    $(previousVideo).css('background-color', '#fff').css('color', '#000');
    $(selectedVideoElement).css('background-color', '#007bff').css('color', '#fff');

    previousVideo = selectedVideoElement;
    let videoAsset = new Object();

    // $.each(database.newscasts, function (i, category) {
    //   if (category.categoryName === $(selectedVideoElement).data('category')) {
    //     $.each(category['videos'], function (j, video) {
    //       if (video.videoName === $(selectedVideoElement).attr('id')) {
    //         if (video.videoURL['vp9']) {
    //           if (video.videoURL['vp9'].indexOf('$mainAsset$') != -1) {
    //             videoAsset.VP9 = video.videoURL['vp9'].replace(
    //               '$mainAsset$',
    //               database['infrastructure'].mainAssetServer
    //             );
    //           } else {
    //             videoAsset.VP9 = video.videoURL['vp9'];
    //           }
    //         }

    //         if (video.videoURL['h264']) {
    //           if (video.videoURL['h264'].indexOf('$mainAsset$') != -1) {
    //             videoAsset.H264 = video.videoURL['h264'].replace(
    //               '$(main)',
    //               database['infrastructure'].mainAssetServer
    //             );
    //           } else {
    //             videoAsset.H264 = video.videoURL['h264'];
    //           }
    //         }

    $.each(database.newscasts, function (i, category) {
      if (category.categoryName === $(selectedVideoElement).data('category')) {
        $.each(category['videos'], function (j, video) {
          if (video.name === $(selectedVideoElement).attr('id')) {
            if (protectedPlaybackAvailable == true) {
              var manifestUri = video.manifest.replace('$(main)', database['infrastructure'].mainAssetServer);
              loadManifest(manifestUri);
            } else {
              $("#subCheck").parent().addClass("d-none");
              playFallback(video);
            }
            $('#vidTitle').text(category.categoryLabel + ' - ' + video.label);
            $('#vidTitle').css('display', 'block');
            if (video.description) {
              $('#vidDesc')
                .text(video.description)
                .removeClass('text-muted');
            } else {
              $('#vidDesc')
                .text('No description.')
                .addClass('text-muted');
            }

            if (video.thumbnail) {
              $("#vidPlayer").attr("poster", video.thumbnail.replace('$(main)', database['infrastructure'].mainAssetServer));
            } else {
              $("#vidPlayer").attr("poster", "https://video-assets.mirrorsedgearchive.de/beta/propaganda/static.jpg")
            }

            if (video.timestamps) {
              let timestamps = video.timestamps;
              let timestampDom = buildTimestampList(timestamps);
              if (timestampDom) {
                timestampList = getTsNumArr(timestamps);
                chapter = null;
                $('#vidAd').css('display', 'none');
                $('#tsList').html(timestampDom);
                $("#tsList > a").eq(0).addClass("active");
                $('#vidNav')
                  .css('opacity', '0')
                  .css('display', 'block')
                  .fadeTo(100, 1);
              } else {
                $('#tsList').html(null);
                timestampList = null;
                $('#vidNav').css('display', 'none');
                $('#vidAd').css('display', 'block');
              }

              if ($(this).next('.list-group-item.video').attr('id')) {
                nextVideo = $(this).next('.list-group-item.video').attr('id');
                jumpCategory = false;
              } else {
                nextVideo = $(this).parent().next().next().children().eq(0).attr('id');
                jumpCategory = true;
              }
            }

          }
        })
      }
    })
  })
}

function hookDashBindings() {
  // Bind player timeupdates to chapter tracking function
  $('#vidPlayer').bind('timeupdate', function (event) {
    let estimate = Math.floor(player.getStats().estimatedBandwidth);
    if (estimate != undefined && !isNaN(estimate) && abrEnabled == true) {
      console.log("[Shaka-DEBUG] " + Math.floor(event.currentTarget.currentTime*100)/100 + "s > ABR bandwidth: " + Math.round(estimate/100000) / 10 + " Mbit/s | Fetching: " + player.getStats().height + "p | Playing: " + $("#vidPlayer").get(0).videoHeight + "p")
      Cookies.set('bandwidth', estimate, { path: '/project_propaganda' });
    } else if (!isNaN(player.getStats().height)) {
      console.log("[Shaka-DEBUG] " + Math.floor(event.currentTarget.currentTime*100)/100 + "s > Current quality: " + player.getStats().height + "p")
    }
    if (timestampList) {
      for (let index = timestampList.length - 1; index >= 0; index--) {
        if (event.target.currentTime + 0.5 >= timestampList[index] && (event.target.currentTime + 0.5 <= timestampList[index + 1] || index == timestampList.length - 1)) {
          if (index != chapter) {
            chapter = index;
            $("#tsList > a").each(function () {
              $(this).removeClass('active');
            });
            console.log("[PropP-DEBUG] playback chapter: " + index);
            $('#tsList')
              .children()
              .eq(index)
              .addClass('active');
          }
        }
      }
    }
  })

  $("#qualitySelect").change(function () {
    let select = $("#qualitySelect").get(0);
    if (select.value != null && select.value != undefined && select.value != 'fallback' && select.value != 'auto') {
      player.configure({ abr: { enabled: false } });
      window.abrEnabled = false;
      Cookies.set('abrEnabled', 'false', { path: '/project_propaganda' });
      Cookies.set('trackOverride', select.options[select.selectedIndex].text.substring(0, 3), { path: '/project_propaganda' });
      player.selectVariantTrack(tracks[$("#qualitySelect option:selected").val()], true);
      console.log("[Shaka] ABR disabled, changed to " + select.options[select.selectedIndex].text);
      Cookies.set('bandwidth', player.getStats().streamBandwidth, { path: '/project_propaganda' });
    } else if (select.value == 'auto') {
      window.abrEnabled = true;
      player.configure({ abr: { enabled: true } });
      console.log("[Shaka] ABR enabled, changed to auto");
      Cookies.set('abrEnabled', 'true', { path: '/project_propaganda' });
    }
  });

  // Bind checkbox toggle to subtitle state update
  $('#subCheck').change(function () {
    if (this.checked) {
      player.setTextTrackVisibility(1);
      Cookies.set('subtitles', true, { path: '/project_propaganda' });
    } else {
      player.setTextTrackVisibility(0);
      Cookies.set('subtitles', false, { path: '/project_propaganda' })
    }
  })
}

function hookFallbackBindings() {
  // Bind checkbox toggle to subtitle state update
  $('#subCheck').change(function () {
    if (this.checked) {
      Cookies.set('subtitles', true, { path: '/project_propaganda' });
      if ($('#vidPlayer').get(0).textTracks[0]) {
        $('#vidPlayer').get(0).textTracks[0].mode = 'showing';
      } else {
        $('#vidPlayer').append('<track kind="subtitles" label="English" src="' + $('#vidPlayer').data('track') + '" srclang="en" default>');
        $('#vidPlayer').get(0).textTracks[0].mode = 'showing';
      }
    } else {
      $('#vidPlayer').get(0).textTracks[0].mode = 'hidden';
      Cookies.set('subtitles', false, { path: '/project_propaganda' })
    }
  })
}

function buildTimestampList(ts) {
  let timesList = '';
  $.each(ts, function (i, timestamp) {
    timesList +=
      "<a href='#' class='list-group-item list-group-item-action flex-column align-items-start timestamps' data-time='" +
      i +
      "'><div class='d-flex w-100 justify-content-between' ><span>" +
      timestamp +
      '</span><small>' +
      secToDIN(i) +
      '</small></div></a>';
  });
  if (timesList) {
    return timesList;
  } else {
    return null;
  }
}

function playFallback(video) {
  $('#vidPlayer').empty();
  $("#vidPlayer").attr('src', video.fallback.replace('$(main)', database['infrastructure'].mainAssetServer));
  $('#vidPlayer').append('<track kind="subtitles" label="English" src="' + video.track.replace('$(main)', database['infrastructure'].mainAssetServer) + '" srclang="en" default>');
  $("#qualitySelect").html("");
  $("#qualitySelect").attr("disabled", true);
  $("#qualitySelect").append(new Option("300p", "fallback"));
}

function secToDIN(s) {
  return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
}

function getTsNumArr(ts) {
  let arr = [];
  $.each(ts, function (i, text) {
    arr.push(i);
  });
  return arr;
}

String.prototype.hashCode = function () {
  var hash = 0;
  if (this.length == 0) return hash;
  for (i = 0; i < this.length; i++) {
    char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};