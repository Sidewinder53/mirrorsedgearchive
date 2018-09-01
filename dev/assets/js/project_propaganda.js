var gdb, psv, nv, nvc, chapter;
gdb = psv = nv = nvc = chapter = null;

$(function() {
  var castList = '';
  $.get('data.json', function(db) {
    gdb = db;
    $.each(db.newscasts, function(i, category) {
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
          ' data-category="' +
          category.categoryName +
          '">' +
          video.videoLabel +
          '</p>';
      });
      castList += '</div>';
    });
    $('#castList').append(castList);
    var queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has('v')) {
      let v = queryParams.get('v').replace(/\W/g, '');

      $('#' + v).click();
      $('#' + v)
        .parent()
        .collapse('show');
    }
    $('[data-toggle="popover"]').popover();
  })
    .then(
      $('.vidList').on('click', '.list-group-item.video', function() {
        if (
          $(this)
            .next('.list-group-item.video')
            .attr('id')
        ) {
          nv = $(this)
            .next('.list-group-item.video')
            .attr('id');
          nvc = false;
        } else {
          nv = $(this)
            .parent()
            .next()
            .next()
            .children()
            .eq(0)
            .attr('id');
          nvc = true;
        }
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
        let type = find.data('type') + 's';
        $.each(gdb.newscasts, function(i, category) {
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
                      atob(gdb['infrastructure'].mainAssetServer)
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
                      atob(gdb['infrastructure'].mainAssetServer)
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
                let ts = getTs(video);
                let tsList = buildTimestampList(ts);
                if (tsList) {
                  tl = getTsNumArr(ts);
                  chapter = 0;
                  $('#vidAd').fadeTo(400, 0, function() {
                    $('#vidNav')
                      .css('opacity', '0')
                      .css('display', 'block')
                      .fadeTo(400, 1);
                    $('#tsList').html(tsList);
                  });
                } else {
                  tl = null;
                  $('#vidNav').fadeTo(400, 0, function() {
                    $(this).css('display', 'none');
                    $('#vidAd').fadeTo(100, 0.6);
                  });
                }
              }
            });
          }
        });
        psv = find.attr('id');
      })
    )
    .then(
      $('#subCheck').change(function() {
        enableSubs();
      }),
      $('#vidPlayer').bind('timeupdate', function(event) {
        for (let index = 0; index < tl.length; index++) {
          if (event.target.currentTime <= tl[index]) {
            index = tl.length;
            console.log(chapter);
            if (index - 1 != chapter) {
              chapter = index - 1;
              console.log(chapter);
              $('#tsList')
                .children()
                .eq(chapter)
                .addClass('active');
            }
          }
        }
      }),
      $('#vidPlayer').bind('ended', function() {
        if ($('#apCheck').prop('checked')) {
          if (nvc) {
            $('#' + psv)
              .parent()
              .collapse('hide');
          }
          $('#' + nv)
            .parent()
            .collapse('show');
          $('#' + nv).click();
        }
      }),
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
          .replace('$mainAsset$', atob(gdb['infrastructure'].mainAssetServer));
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

function getTs(video) {
  return video.timestamps;
}

function getTsNumArr(ts) {
  let arr = [];
  $.each(ts, function(i, text) {
    arr.push(i);
  });
  return arr;
}

function buildTimestampList(ts) {
  let timesList = '';
  $.each(ts, function(i, timestamp) {
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
        atob(gdb['infrastructure'].mainAssetServer)
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
    hash = hash & hash;
  }
  return hash;
};
