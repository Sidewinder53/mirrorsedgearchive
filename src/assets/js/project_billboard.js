var globalVideoDatabase = null;
var nextVideoId = null;
var previousVideoId = null;
var isNextVideoNextChapter = null;

$(function() {
  console.log("%cVideos on this page are the intellectual property of EA Digital Illusions CE", "font-size: 20px; font-weight: bold;");
  console.log("%cYou may not redistribute them without obtaining permission from the copyright holder.", "font-size: 20px; color: red;");
  if (document.addEventListener) {
    // IE >= 9; other browsers
    $('#vidPlayer')
      .get(0)
      .addEventListener(
        'contextmenu',
        function(e) {
          $('#vidRCM').css('display', 'block');
          e.preventDefault();
        },
        false
      );
  } else {
    // IE < 9
    $('#vidPlayer')
      .get(0)
      .attachEvent('oncontextmenu', function() {
        $('#vidRCM').css('display', 'block');
      });
  }
  $('#vidContainer').css('background-image', "/{{ manifest['assets/media/image/project_billboard/static.jpg'] }}");
  var horBillboardList = '',
    verBillboardList = '';
  $.get('data.json', function(db) {
    globalVideoDatabase = db;
    $.each(db['types'].horizontalBillboards, function(i, category) {
      horBillboardList +=
        '<p class="list-group-item category collapsed mb-0" id="' +
        category.categoryName +
        '" data-toggle="collapse" href="#col-' +
        category.categoryName +
        '" role="button" aria-expanded="false" aria-controls="col-' +
        category.categoryName +
        '">' +
        category.categoryLabel +
        '</p><div class="collapse list-group-flush" id="col-' +
        category.categoryName +
        '">';
      $.each(category['videos'], function(j, video) {
        horBillboardList +=
          '<p class="list-group-item video mb-0" id=' +
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
        '<p class="list-group-item category collapsed mb-0" id="' +
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
          '<p class="list-group-item video mb-0" id=' +
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
      $(
        '#' +
          $('#' + v)
            .parents()
            .eq(2)
            .attr('id') +
          'Tab'
      ).click();
      $('#' + v).click();
      $('#' + v)
        .parent()
        .collapse('show');
    }
    $('[data-toggle="popover"]').popover();
  }).then(
    $('.vidList').on('click', '.list-group-item.video', function() {
      if (
        $(this)
          .next('.list-group-item.video')
          .attr('id')
      ) {
        nextVideoId = $(this)
          .next('.list-group-item.video')
          .attr('id');
        isNextVideoNextChapter = false;
      } else {
        nextVideoId = $(this)
          .parent()
          .next()
          .next()
          .children()
          .eq(0)
          .attr('id');
        isNextVideoNextChapter = true;
      }
      history.pushState(null, null, '?v=' + this.id);
      $('#vidPlayer, #vidFooter, #vidMeta').css('display', 'block');
      $('#vidIntro').css('display', 'none');
      $('#vidContainer')
        .css('background-color', '#000')
        .css('background-image', 'none');
      let find = $(this);
      $('#' + previousVideoId)
        .css('background-color', '#fff')
        .css('color', '#000');
      find.css('background-color', '#007bff').css('color', '#fff');
      $.each(eval("globalVideoDatabase['types']." + find.data('type')), function(i, category) {
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
                    globalVideoDatabase['infrastructure'].mainAssetServer
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
                    globalVideoDatabase['infrastructure'].mainAssetServer
                  );
                } else {
                  console.log('h264 asset is external.');
                  h264AssetURL = video.videoURL['h264'];
                }
                vidSrc +=
                  '<source id="vidFileFb" src="' +
                  h264AssetURL +
                  '" type="video/mp4">';
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
                  .html(
                    'Created by <a href="https://pixeldust.se/" target="_blank">Pixeldust</a> (Joachim Ljunggren) for EA/DICE. Big thanks to derwangler who made this project possible.'
                  )
                  .removeClass('text-muted');
              }
              $('#vidPlayer').html(vidSrc);
              $('#vidTitle').text(
                category.categoryLabel + ' - ' + video.videoLabel
              );
              $('#vidTitle').css('display', 'block');
              $('#vidPlayer')
                .get(0)
                .load();
            }
          });
        }
      });
      previousVideoId = find.attr('id');
      console.log(previousVideoId);
    }),
    $('#vidPlayer').bind('ended', function() {
      if ($('#apCheck').prop('checked')) {
        if (isNextVideoNextChapter) {
          $('#' + previousVideoId)
            .parent()
            .collapse('hide');
        }
        $('#' + nextVideoId)
          .parent()
          .collapse('show');
        $('#' + nextVideoId).click();
      }
    }),
    $('#apCheck').change(function() {
      toggleLoop($('#apCheck').prop('checked'));
    }),
    $('#vidRCM').on('click', function() {
      $('#vidRCM').css('display', 'none');
    })
  );
});

function getThumbnail(video) {
  if (video.thumbnail) {
    if (video.thumbnail.indexOf('$mainAsset$') != -1) {
      return video.thumbnail.replace(
        '$mainAsset$',
        globalVideoDatabase['infrastructure'].mainAssetServer
      );
    }
  } else {
    return "/{{ manifest['assets/media/image/project_billboard/static.jpg'] }}";
  }
}

function toggleLoop(state) {
  if (state) {
    $('#vidPlayer').removeAttr('loop');
  } else {
    $('#vidPlayer').attr('loop', '');
  }
}
