var db =
  { "articles": [
    // {
    //   "title": "Title of the article",
    //   "date": "{Month} {Day}{Ordinal indicator (st, nd, rd, th)}, {year}",
    //   "description": "(optional) Description of article. Include writers name if possible.",
    //   "publication": "(optional)"
    //   "lURL": "URL of the local file. Assume it's in the same folder.",
    //   "pURL": "URL of the source; if no longer available, put explanation in this field and set online to zero.",
    //   "popup": "If the article has fancy formatting or shouldn't be displayed in the modal popup for any other reason set this to 1, article will be opened in new tab then"
    // },
    // Please leave this first object empty, so array indexs are in sync with lURL property.
    {
    },
    {
      "title": "Don't gush: why the vision of Mirror's Edge Catalyst makes it a modern great",
      "description": "by Emad Ahmed - Feminism and futurism are at one.",
      "date": "April 5th, 2018",
      "publication": "Eurogamer",
      "lURL": "1.html",
      "pURL": "https://www.eurogamer.net/articles/2018-04-05-dont-gush-why-the-vision-of-mirrors-edge-catalyst-makes-it-a-modern-great",
      "popup": "0"
    },
    {
      "title": "Shattering the norm",
      "description": "We chatted with EA DICE's Arvid Burstrom, Technical Artist; Jhony Ljungstedt, Art Director; Mikael Linderholm, Technical Art Director; and Amo Mostofi, Producer, about their latest game.",
      "date": "Unknown",
      "publication": "Autodesk",
      "lURL": "2.html",
      "pURL": "https://www.autodesk.com/campaigns/autodesk-for-games/ea-dice",
      "popup": "0"
    }
  ]
  };

$(function() {
  var db_size = db.articles.length - 1;
  var unit = 100 / db_size;
  for (var i = 1; i <= db_size; i++) {
    $("#loader").css('width', unit * i);
    $("#article-list").append(
      "<a id='obj-" + i + "' class='article-link list-group-item list-group-item-action flex-column align-items-start'><div class='d-flex w-100 justify-content-between'><h5 class='mb-1'>" + db["articles"][i].title + "</h5><small class='text-muted'>" + db["articles"][i].date + "</small></div><div class='d-flex w-100 justify-content-between'><p class='mb-1'>" + db["articles"][i].description + "</p><div><span class='badge badge-primary'>" + db["articles"][i].publication + "</span></div></div></a>"
    );
  }
  $("#loader").css('width', "100%");
  $(".progress").fadeTo( 250, 0 ).css('display', "none");
  $("#article-list").fadeTo( 500, 1 );
  $("#legal_footer").css('display', "block");
});

$("#article-list").on('click', 'a', function() {
  var art_id = $(this).attr('id').replace('obj-', '');
  $('#article-iframe').attr('src', 'articles/' + art_id + '.html');
  $('#source-link').attr('href', db["articles"][art_id].pURL)
  $('#article-modal').modal('show');
});

$("#source-link").mousedown(function(e){
  if(e.which!= 3){   
    window.open('/out/?t=' + $("#source-link").attr('href'));
    return false;
  }
});