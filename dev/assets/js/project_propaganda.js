var gdb = null;

$(function() {
  var castList = '',
    extrasList = '';
  $.get('data.json', function(db) {
    gdb = db;
    $.each(db['types'].casts, function(i, category) {
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
      $.each(category['videos'], function(j, video) {
        castList +=
          '<p class="list-group-item video" id=' +
          video.videoName +
          ' data-type="cast" data-category="' +
          category.categoryName +
          '">' +
          video.videoLabel +
          '</p>';
      });
      castList += '</div>';
    });
    $.each(db['types'].extras, function(i, category) {
      extrasList +=
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
        extrasList +=
          '<p class="list-group-item video" id=' +
          video.videoName +
          ' data-type="extra" data-category="' +
          category.categoryName +
          '">' +
          video.videoLabel +
          '</p>';
      });
      extrasList += '</div>';
    });
    $('#castList').append(castList);
    $('#extrasList').append(extrasList);
  })
    .then(
      $('.vidList').on('click', '.list-group-item.video', function() {
        $('#vidPlayer, #vidFooter, #vidMeta').css('display', 'block');
        $('#vidIntro').css('display', 'none');
        $('#vidContainer')
          .css('background-color', '#000')
          .css('background-image', 'none');
        let find = $(this);
        let type = find.data('type') + 's';
        $.each(eval("gdb['types']." + type), function(i, category) {
          if (category.categoryName === find.data('category')) {
            $.each(category['videos'], function(j, video) {
              if (video.videoName === find.attr('id')) {
                let modernAssetURL,
                  fallbackAssetURL,
                  vidSrc = '';
                if (video.videoURL['modern']) {
                  if (video.videoURL['modern'].indexOf('$mainAsset$') != -1) {
                    console.log('Modern asset is on main asset server.');
                    modernAssetURL = video.videoURL['modern'].replace(
                      'mainAsset',
                      gdb['infrastructure'].mainAssetServer
                    );
                  } else {
                    console.log('Modern asset is external.');
                    modernAssetURL = video.videoURL['modern'];
                  }
                  vidSrc +=
                    '<source id="vidFileMo" src="' +
                    modernAssetURL +
                    '" type="video/webm">';
                } else {
                  console.log('Modern asset does not exist.');
                  modernAssetURL = '';
                }
                if (video.videoURL['fallback']) {
                  if (video.videoURL['fallback'].indexOf('$mainAsset$') != -1) {
                    console.log('Fallback asset is on main asset server.');
                    fallbackAssetURL = video.videoURL['fallback'].replace(
                      '$mainAsset$',
                      gdb['infrastructure'].mainAssetServer
                    );
                  } else {
                    console.log('Fallback asset is external.');
                    fallbackAssetURL = video.videoURL['fallback'];
                  }
                  vidSrc +=
                    '<source id="vidFileFb" src="' +
                    fallbackAssetURL +
                    '" type="video/webm">';
                } else {
                  console.log('Fallback asset does not exist.');
                  fallbackAssetURL = '';
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
