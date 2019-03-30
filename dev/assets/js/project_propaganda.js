// Global variables
var database = null;
var previousVideo = null;
var nextVideo = null;
var jumpCategory = null;
var chapter = null;

$(function () {
  $.get('data.json', function (fetchedDatabase) {
    database = fetchedDatabase;
  }).then(function () {
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
          video.videoName +
          ' data-category="' +
          category.categoryName +
          '">' +
          video.videoLabel +
          '</p>';
      });

      castList += '</div>';
    });

    $('#castList').append(castList);

    // Search for videoID in query and play video if any
    let queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has('v')) {
      let v = queryParams.get('v').replace(/\W/g, '');
      $('#' + v).click();
      $('#' + v).parent().collapse('show');
    }

  });

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

    $.each(database.newscasts, function (i, category) {
      if (category.categoryName === $(selectedVideoElement).data('category')) {
        $.each(category['videos'], function (j, video) {
          if (video.videoName === $(selectedVideoElement).attr('id')) {
            if (video.videoURL['vp9']) {
              if (video.videoURL['vp9'].indexOf('$mainAsset$') != -1) {
                videoAsset.VP9 = video.videoURL['vp9'].replace(
                  '$mainAsset$',
                  database['infrastructure'].mainAssetServer
                );
              } else {
                videoAsset.VP9 = video.videoURL['vp9'];
              }
            }

            if (video.videoURL['h264']) {
              if (video.videoURL['h264'].indexOf('$mainAsset$') != -1) {
                videoAsset.H264 = video.videoURL['h264'].replace(
                  '$mainAsset$',
                  database['infrastructure'].mainAssetServer
                );
              } else {
                videoAsset.H264 = video.videoURL['h264'];
              }
            }

            if (video.thumbnail) {
              if (video.thumbnail.indexOf('$mainAsset$') != -1) {
                videoAsset.thumbnail = video.thumbnail.replace(
                  '$mainAsset$',
                  database['infrastructure'].mainAssetServer
                );
              } else {
                videoAsset.thumbnail = video.thumbnail;
              }
            } else {
              videoAsset.thumbnail = 'https://video-assets.mirrorsedgearchive.de/placeholder.jpg';
            }

            $('#vidPlayer').attr('poster', videoAsset.thumbnail);
            $('#vidTitle').text(category.categoryLabel + ' - ' + video.videoLabel);
            $('#vidTitle').css('display', 'block');

            videoAsset.html = '';

            if (videoAsset.hasOwnProperty('VP9')) {
              videoAsset.html +=
                '<source id="vidFileMo" src="' +
                videoAsset.VP9 +
                '" type="video/webm">';
            }

            if (videoAsset.hasOwnProperty('H264')) {
              videoAsset.html +=
                '<source id="vidFileFb" src="' +
                videoAsset.H264 +
                '" type="video/mp4">';
            }

            // Apply sourced video asset to document
            $('#vidPlayer').html(videoAsset.html);

            if (video.description) {
              $('#vidDesc')
                .text(video.description)
                .removeClass('text-muted');
            } else {
              $('#vidDesc')
                .text('No description.')
                .addClass('text-muted');
            }

            if (video.subtitle) {
              $('#subToggle').css('display', 'block');
              $('#vidPlayer').data('track', video.subtitle);
              if ($('#subCheck').get(0).checked) {
                enableSubs();
              }
            } else {
              $('#subToggle').css('display', 'none');
            }

            let timestamps = video.timestamps;
            let timestampList = buildTimestampList(timestamps);
            if (timestampList) {
              tl = getTsNumArr(timestamps);
              chapter = null;
              $('#vidAd').fadeTo(400, 0, function () {
                $('#tsList').html(timestampList);
                $("#tsList > a").eq(0).addClass("active");
                $('#vidNav')
                  .css('opacity', '0')
                  .css('display', 'block')
                  .fadeTo(100, 1);
              });
            } else {
              $('#tsList').html(null);
              tl = null;
              $('#vidNav').css('display', 'none');
              $('#vidAd').fadeTo(100, 0.6);
            }

            // Play video
            $('#vidPlayer').get(0).load();
          }
        });
      }
    });
    if ($(this).next('.list-group-item.video').attr('id')) {
      nextVideo = $(this).next('.list-group-item.video').attr('id');
      jumpCategory = false;
    } else {
      nextVideo = $(this).parent().next().next().children().eq(0).attr('id');
      jumpCategory = true;
    }
  })

  $('#subCheck').change(function () {
    enableSubs();
  })

  $('#vidPlayer').bind('timeupdate', function (event) {
    for (let index = tl.length - 1; index >= 0; index--) {
      if (event.target.currentTime + 0.5 >= tl[index] && (event.target.currentTime + 0.5 <= tl[index + 1] || index == tl.length - 1)) {
        if (index != chapter) {
          chapter = index;
          $("#tsList > a").each(function () {
            $(this).removeClass('active');
          });
          console.log("[DEBUG] playback chapter: " + index);
          $('#tsList')
            .children()
            .eq(index)
            .addClass('active');
        }
      }
    }
  }),
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
    }),
    $('#tsList').on('click', '.timestamps', function () {
      $("#tsList > a").each(function () {
        $(this).removeClass('active');
      });
      $(this).addClass('active');
      $('#vidPlayer').get(0).currentTime = $(this).data('time');
      $('#vidPlayer')
        .get(0)
        .play();
    }),
    $('#vidRCM').on('click', function () {
      $('#vidRCM').css('display', 'none');
    })

  $('#vidPlayer').contextmenu(function (e) {
    $('#vidRCM').css('display', 'block');
    e.preventDefault();
  });

  $('[data-toggle="popover"]').popover();
});

function enableSubs() {
  if ($('#subCheck').get(0).checked) {
    if ($('#vidPlayer').get(0).textTracks[0]) {
      $('#vidPlayer').get(0).textTracks[0].mode = 'showing';
    } else {
      if (
        $('#vidPlayer')
          .data('track')
          .indexOf('$mainAsset$') != -1
      ) {
        subURL = $('#vidPlayer')
          .data('track')
          .replace('$mainAsset$', database['infrastructure'].mainAssetServer);
      } else {
        subURL = $('#vidPlayer').data('track');
      }
      $('#vidPlayer').append(
        '<track kind="subtitles" label="English" src="' +
        subURL +
        '" srclang="en" default>'
      );
      $('#vidPlayer').get(0).textTracks[0].mode = 'showing';
    }
  } else {
    $('#vidPlayer').get(0).textTracks[0].mode = 'hidden';
  }
}

function getTsNumArr(ts) {
  let arr = [];
  $.each(ts, function (i, text) {
    arr.push(i);
  });
  return arr;
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

function secToDIN(s) {
  return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
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
