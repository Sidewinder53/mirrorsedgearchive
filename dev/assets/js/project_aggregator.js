$(function() {
  var db = $.get('/project_aggregator/articles.json', function(db) {
    var db_size = db.articles.length - 1;
    var unit = 100 / db_size;
    for (var i = 1; i <= db_size; i++) {
      $('#loader').css('width', unit * i);
      $('#article-list').append(
        "<a id='obj-" +
          i +
          "' class='article-link list-group-item list-group-item-action flex-column align-items-start'><div class='d-flex w-100 justify-content-between'><h5 class='mb-1'>" +
          db['articles'][i].title +
          "</h5><small class='text-muted'>" +
          db['articles'][i].date +
          "</small></div><div class='d-flex w-100 justify-content-between'><p class='mb-1'>" +
          db['articles'][i].description +
          "</p><div><span href='#' class='badge badge-primary article-link-badge'>" +
          db['articles'][i].publication +
          '</span></div></div></a>'
      );
    }
    $('#loader').css('width', '100%');
    $('.progress')
      .fadeTo(250, 0)
      .css('display', 'none');
    $('#article-list').fadeTo(500, 1);
    $('#legal_footer').css('display', 'block');

    $('#article-list').on('click', 'a', function() {
      var art_id = $(this)
        .attr('id')
        .replace('obj-', '');
      $.get('articles/' + art_id + '.html', function(data) {
        data = data.replace(/(.*\W.*)<body class="ennote" >/gm, '');

        var oldlink = art_id + '_files';
        var newlink = 'articles/' + art_id + '_files';
        var re = new RegExp(oldlink, 'g');
        data = data.replace(re, newlink);

        $('#article-modal-content').html(data);
        //$('#article-iframe').attr('src', 'articles/' + art_id + '.html');
        $('#source-link').attr('href', db['articles'][art_id].pURL);
        $('#article-modal').modal('show');
      });
    });

    $('#source-link').mousedown(function(e) {
      if (e.which != 3) {
        window.open('/out/?t=' + $('#source-link').attr('href'));
        return false;
      }
    });

    $('.article-link-badge').mousedown(function(e) {
      if (e.which != 3) {
        var art_id = $(this)
          .closest('a')
          .attr('id')
          .replace('obj-', '');
        window.open('/out/?t=' + db['articles'][art_id].pURL);
        return false;
      }
    });
  });
});
