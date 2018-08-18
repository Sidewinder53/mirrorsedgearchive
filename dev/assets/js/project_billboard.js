var gdb = null;
var psv = null;

$(function() {
  var horBillboardList = '',
    verBillboardList = '';
  $.get('data.json', function(db) {
    gdb = db;
    $.each(db['types'].horizontalBillboards, function(i, category) {
      horBillboardList +=
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
      $.each(category['videos'], function(j, video) {
        horBillboardList +=
          '<p class="list-group-item video" id=' +
          video.videoName +
          ' data-type="horizontalBillboards" data-category="' +
          category.categoryName +
          '">' +
          video.videoLabel +
          '</p>';
      });
      horBillboardList += '</div>';
    });
    $.each(db['types'].verticalBillboards, function(i, category) {
      verBillboardList +=
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
      $.each(category['videos'], function(j, video) {
        verBillboardList +=
          '<p class="list-group-item video" id=' +
          video.videoName +
          ' data-type="verticalBillboards" data-category="' +
          category.categoryName +
          '">' +
          video.videoLabel +
          '</p>';
      });
      verBillboardList += '</div>';
    });
    $('#horBillboardList').append(horBillboardList);
    $('#verBillboardList').append(verBillboardList);
    var queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has('v')) {
      let v = queryParams.get('v').replace(/\W/g, '');
      console.log('Queried video: ' + v);
      $('#' + v).click();
      $('#' + v)
        .parent()
        .collapse('show');
    }
    $('[data-toggle="popover"]').popover();
  })
    .then(
      $('.vidList').on('click', '.list-group-item.video', function() {
        history.pushState(null, null, '?v=' + this.id);
        $('#vidPlayer, #vidFooter, #vidMeta').css('display', 'block');
        $('#vidIntro').css('display', 'none');
        $('#vidContainer')
          .css('background-color', '#000')
          .css('background-image', 'none');
        let find = $(this);
        $('#' + psv)
          .css('background-color', '#fff')
          .css('color', '#000');
        find.css('background-color', '#007bff').css('color', '#fff');
        $.each(eval("gdb['types']." + find.data('type')), function(
          i,
          category
        ) {
          if (category.categoryName === find.data('category')) {
            $.each(category['videos'], function(j, video) {
              if (video.videoName === find.attr('id')) {
                let vp9AssetURL,
                  h264AssetURL,
                  vidSrc = '';
                if (video.videoURL['vp9']) {
                  if (video.videoURL['vp9'].indexOf('$mainAsset$') != -1) {
                    console.log('vp9 asset is on main asset server.');
                    vp9AssetURL = video.videoURL['vp9'].replace(
                      '$mainAsset$',
                      gdb['infrastructure'].mainAssetServer
                    );
                  } else {
                    console.log('vp9 asset is external.');
                    vp9AssetURL = video.videoURL['vp9'];
                  }
                  vidSrc +=
                    '<source id="vidFileMo" src="' +
                    vp9AssetURL +
                    '" type="video/webm">';
                } else {
                  console.log('vp9 asset does not exist.');
                  vp9AssetURL = '';
                }
                if (video.videoURL['h264']) {
                  if (video.videoURL['h264'].indexOf('$mainAsset$') != -1) {
                    console.log('h264 asset is on main asset server.');
                    h264AssetURL = video.videoURL['h264'].replace(
                      '$mainAsset$',
                      gdb['infrastructure'].mainAssetServer
                    );
                  } else {
                    console.log('h264 asset is external.');
                    h264AssetURL = video.videoURL['h264'];
                  }
                  vidSrc +=
                    '<source id="vidFileFb" src="' +
                    h264AssetURL +
                    '" type="video/webm">';
                } else {
                  console.log('h264 asset does not exist.');
                  h264AssetURL = '';
                }
                $('#vidPlayer').attr('poster', getThumbnail(video));
                if (video.description) {
                  $('#vidDesc')
                    .text(video.description)
                    .removeClass('text-muted');
                } else {
                  $('#vidDesc')
                    .text('No description.')
                    .addClass('text-muted');
                }
                $('#vidPlayer').html(vidSrc);
                if (video.subtitle) {
                  $('#subToggle').css('display', 'block');
                  $('#vidPlayer').data('track', video.subtitle);
                  if ($('#subCheck').get(0).checked) {
                    enableSubs();
                  }
                } else {
                  $('#subToggle').css('display', 'none');
                }
                $('#vidTitle').text(
                  category.categoryLabel + ' - ' + video.videoLabel
                );
                $('#vidTitle').css('display', 'block');
                $('#vidPlayer')
                  .get(0)
                  .load();
                let timestamps = getTimeStamps(video);
                if (timestamps) {
                  $('#vidNav')
                    .css('opacity', '0')
                    .css('display', 'block')
                    .fadeTo(400, 1);
                  $('#tsList').html(timestamps);
                } else {
                  $('#vidNav').fadeTo(400, 0, function() {
                    $(this).css('display', 'none');
                  });
                }
              }
            });
          }
        });
        psv = find.attr('id');
        console.log(psv);
      })
    )
    .then(
      $('#subCheck').change(function() {
        enableSubs();
      }),
      // $('#vidPlayer').bind('timeupdate', function() {
      //   console.log('timeupdate');
      // }),
      $('#tsList').on('click', '.timestamps', function() {
        $('#vidPlayer').get(0).currentTime = $(this).data('time');
        $('#vidPlayer')
          .get(0)
          .play();
      })
    );
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
          .replace('$mainAsset$', gdb['infrastructure'].mainAssetServer);
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

function getTimeStamps(video) {
  let timesList = '';
  $.each(video.timestamps, function(i, timestamp) {
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

function getThumbnail(video) {
  if (video.thumbnail) {
    if (video.thumbnail.indexOf('$mainAsset$') != -1) {
      return video.thumbnail.replace(
        '$mainAsset$',
        gdb['infrastructure'].mainAssetServer
      );
    }
  } else {
    return 'https://video-assets.mirrorsedgearchive.de/placeholder.jpg';
  }
}

function secToDIN(s) {
  return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
}

String.prototype.hashCode = function() {
  var hash = 0;
  if (this.length == 0) return hash;
  for (i = 0; i < this.length; i++) {
    char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

// var prevVideoId = '';

// function showVideo(id) {
//   var player = document.getElementById('videoPlayer');
//   var videoFile = document.getElementById('videoFile');
//   var videoTrack = document.getElementById('videoTrack');
//   var videoHelp = document.getElementById('videoHelp');
//   var videoListSelection = document.getElementById('video' + id);
//   if (player.style.display == 'none') {
//     player.style.display = 'inline';
//     videoHelp.style.display = 'none';
//   }
//   if (prevVideoId == document.getElementById('video' + id)) {
//     return;
//   }
//   if (prevVideoId != '') {
//     prevVideoId.style.backgroundColor = 'transparent';
//     prevVideoId.style.color = 'black';
//   }
//   var videoId = parseInt(id);
//   var videoUrl = getVideoUrl(videoId);
//   var trackUrl = getTrackUrl(videoId);
//   prevVideoId = document.getElementById('video' + id);
//   videoFile.src = videoUrl;
//   videoTrack.src = trackUrl;
//   videoListSelection.style.backgroundColor = 'black';
//   videoListSelection.style.color = 'white';
//   player.load();
//   player.play();
//   // player.scrollIntoView();
// }

// function getVideoUrl(id) {
//   switch (id) {
//     case 1:
//       return '/assets/media/video/project_propaganda/krugerspeech_00.webm';
//     case 2:
//       return 'https://a.safe.moe/WNkV4.mp4';
//     case 3:
//       return 'https://my.mixtape.moe/bvjwyg.mp4';
//     case 4:
//       return 'https://archive.org/download/medgec_trailers/2015%20-%20Hero.mp4';
//     case 5:
//       return 'https://aww.moe/72u3ms.mp4';
//     case 6:
//       return 'https://my.mixtape.moe/jgarbp.mp4';
//     case 7:
//       return 'https://aww.moe/72u3ms.mp4';
//     case 8:
//       return 'https://my.mixtape.moe/bvjwyg.mp4';
//     case 9:
//       return 'https://track5.mixtape.moe/fhinlq.mp4';
//     case 10:
//       return 'https://my.mixtape.moe/jgarbp.mp4';
//     case 11:
//       return 'https://aww.moe/72u3ms.mp4';
//     case 12:
//       return 'https://my.mixtape.moe/bvjwyg.mp4';
//     case 13:
//       return 'https://track5.mixtape.moe/fhinlq.mp4';
//     case 14:
//       return 'https://my.mixtape.moe/jgarbp.mp4';
//     case 15:
//       return 'https://aww.moe/72u3ms.mp4';
//     case 16:
//       return 'https://my.mixtape.moe/bvjwyg.mp4';
//     case 17:
//       return 'https://my.mixtape.moe/bvjwyg.mp4';
//     case 18:
//       return '';
//     default:
//       return 'https://aww.moe/72u3ms.mp4';
//   }
// }

// function getTrackUrl(id) {
//   switch (id) {
//     case 1:
//       return 'subs/aurore1.vtt';
//     case 2:
//       return 'subs.vtt';
//     case 3:
//       return 'subs.vtt';
//     case 4:
//       return 'subs.vtt';
//     case 5:
//       return 'subs.vtt';
//     case 6:
//       return 'subs.vtt';
//     case 7:
//       return 'subs.vtt';
//     case 8:
//       return 'subs.vtt';
//     case 9:
//       return 'subs.vtt';
//     case 10:
//       return 'subs.vtt';
//     case 11:
//       return 'subs.vtt';
//     case 12:
//       return 'subs.vtt';
//     case 13:
//       return 'subs.vtt';
//     case 14:
//       return 'subs.vtt';
//     case 15:
//       return 'subs.vtt';
//     case 16:
//       return 'subs.vtt';
//     case 17:
//       return 'subs.vtt';
//     case 18:
//       return 'subs.vtt';
//     default:
//       return 'subs.vtt';
//   }
// }
