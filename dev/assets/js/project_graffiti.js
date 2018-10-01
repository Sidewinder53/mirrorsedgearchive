$(document).ready(function() {
  $.getScript(
    "https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.2.0/js.cookie.min.js",
    function() {
      if (Cookies.get("skipIntro") == "true") {
        $("#collapseIntro").collapse("hide");
        $("#collapseGenerator").collapse("show");
        $("#emblem-tab").removeClass("disabled");
        $("#frame-tab").removeClass("disabled");
        $("#background-tab").removeClass("disabled");
        $("#jumpToGeneratorButton").removeClass("disabled");
        $("#emblem-tab").addClass("active");
      } else {
        $("#collapseIntro").collapse("show");
      }
    }
  );

  if ($(window).width() >= 1400) {
    $vp_sm = false;
  } else {
    $vp_sm = true;
  }

  $("select").imagepicker();

  noUiSlider.create(document.getElementById("bgXslider"), {
    start: [1024],
    connect: [true, false],
    behaviour: "snap",
    range: {
      min: [64, 8],
      "20%": [128, 16],
      "40%": [256, 32],
      "60%": [512, 64],
      "80%": [1024, 128],
      max: [2048]
    },
    pips: {
      mode: "range",
      density: 3
    },
    format: wNumb({
      decimals: 0
    })
  });

  noUiSlider.create(document.getElementById("bgYslider"), {
    start: [1024],
    connect: [true, false],
    behaviour: "snap",
    range: {
      min: [64, 8],
      "20%": [128, 16],
      "40%": [256, 32],
      "60%": [512, 64],
      "80%": [1024, 128],
      max: [2048]
    },
    pips: {
      mode: "range",
      density: 3
    },
    format: wNumb({
      decimals: 0
    })
  });

  noUiSlider.create(document.getElementById("emslider"), {
    start: [256],
    connect: [true, false],
    behaviour: "snap",
    range: {
      min: [64, 8],
      "33%": [128, 16],
      "66%": [256, 32],
      max: [512]
    },
    pips: {
      mode: "range",
      density: 3
    },
    format: wNumb({
      decimals: 0
    })
  });

  $("#stacked_col").hide();
  $('[data-toggle="tooltip"]').tooltip();

  $("#closeIntro").click(function() {
    if (document.getElementById("skipIntroCookie").checked) {
      Cookies.set("skipIntro", "true");
    } else {
      Cookies.set("skipIntro", "false");
    }
    $("#collapseIntro").collapse("hide");
    $("#collapseGenerator").collapse("show");
    $("#emblem-tab").removeClass("disabled");
    $("#frame-tab").removeClass("disabled");
    $("#background-tab").removeClass("disabled");
    $("#jumpToGeneratorButton").removeClass("disabled");
    $("#emblem-tab").addClass("active");
    window.scrollTo(0, 0);
  });

  $(".nav-item").click(function() {
    window.scrollTo(0, 56);
  });

  var wrap = $("#wrap");

  $(window).scroll(function() {
    if ($(window).scrollTop() >= 128) {
      $("#myTab").addClass("fixed-header");
    } else {
      $("#myTab").removeClass("fixed-header");
    }
  });

  $("#emblemPicker, #framePicker, #backgroundPicker").change(function() {
    $selected_emblem = $("#emblemPicker option:selected").text();
    $selected_frame = $("#framePicker option:selected").text();
    $selected_background = $("#backgroundPicker option:selected").text();

    $selected_emblem_path = $("#emblemPicker")
      .find(":selected")
      .attr("data-img-src");
    $selected_frame_path = $("#framePicker")
      .find(":selected")
      .attr("data-img-src");
    $selected_background_path = $("#backgroundPicker")
      .find(":selected")
      .attr("data-img-src");

    $selected_emblem_alt = $("#emblemPicker option:selected").attr(
      "data-img-alt"
    );
    $selected_frame_alt = $("#framePicker option:selected").attr(
      "data-img-alt"
    );
    $selected_background_alt = $("#backgroundPicker option:selected").attr(
      "data-img-alt"
    );

    console.log("Image selection changed, updating preview images...");

    console.log("Selected Emblem: " + $selected_emblem);
    console.log("Selected Frame: " + $selected_frame);
    console.log("Selected Background: " + $selected_background);
    console.log("Selected Emblem image path: " + $selected_emblem_path);
    console.log("Selected Frame image path: " + $selected_frame_path);
    console.log("Selected Background image path: " + $selected_background_path);

    $("#emblem_preview").attr("src", $selected_emblem_path);
    $("#frame_preview").attr("src", $selected_frame_path);
    $("#background_preview").attr("src", $selected_background_path);
    updateBackgroundGradient();

    $("#emblem_preview_label").text($selected_emblem_alt);
    $("#frame_preview_label").text($selected_frame_alt);
    $("#background_preview_label").text($selected_background_alt);

    if ($selected_emblem == "random_emblem") $selected_emblem_path = "";

    if ($selected_frame == "random_frame") $selected_frame_path = "";

    if ($selected_background == "random_background")
      $selected_background_path = "";

    if ($selected_emblem == "no_emblem")
      $selected_emblem_path =
        "/assets/media/image/project_graffiti/img/empty.png";

    if ($selected_frame == "no_frame")
      $selected_frame_path =
        "/assets/media/image/project_graffiti/img/empty.png";

    if ($selected_background == "no_background")
      $selected_background_path =
        "/assets/media/image/project_graffiti/img/empty.png";

    if (
      $selected_emblem == "random_emblem" ||
      $selected_frame == "random_frame" ||
      $selected_background == "random_background"
    ) {
      togglePreviewVisibility(false);
    } else {
      togglePreviewVisibility(true);
    }

    if ($vp_sm == true) {
      drawCanvas("previewCanvas");
    } else {
      drawCanvas("floatingPreviewCanvas");
    }
  });

  function updateBackgroundGradient() {
    if (
      $selected_background == "random_background" ||
      $selected_background == "no_background"
    ) {
      $("#background_preview_background").css({
        background:
          "-moz-linear-gradient(-45deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 100%)",
        background:
          "-webkit-linear-gradient(-45deg, rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.5) 100%)",
        background:
          "linear-gradient(135deg, rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.5) 100%)",
        filter:
          'progid:DXImageTransform.Microsoft.gradient( startColorstr="#f2000000", endColorstr="#80000000",GradientType=1 )'
      });
    } else {
      $("#background_preview_background").css({
        background:
          "-moz-linear-gradient(left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.6) 100%)",
        background:
          "-webkit-linear-gradient(left, rgba(0,0,0,0.6) 0%,rgba(0,0,0,1) 50%,rgba(0,0,0,0.6) 100%)",
        background:
          "linear-gradient(to right, rgba(0,0,0,0.6) 0%,rgba(0,0,0,1) 50%,rgba(0,0,0,0.6) 100%)",
        filter:
          'progid:DXImageTransform.Microsoft.gradient( startColorstr="#99000000", endColorstr=#99000000",GradientType=1 )'
      });
    }
  }

  function adjustBackgroundGradient() {
    if ($("#resultpng").height == $("#print").height) {
      $("#print").css({
        background:
          "-moz-linear-gradient(left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.6) 100%)",
        background:
          "-webkit-linear-gradient(left, rgba(0,0,0,0.6) 0%,rgba(0,0,0,1) 50%,rgba(0,0,0,0.6) 100%)",
        background:
          "linear-gradient(to right, rgba(0,0,0,0.6) 0%,rgba(0,0,0,1) 50%,rgba(0,0,0,0.6) 100%)",
        filter:
          'progid:DXImageTransform.Microsoft.gradient( startColorstr="#99000000", endColorstr=#99000000",GradientType=1 )'
      });
    } else if ($("#resultpng").width == $("#print").width) {
      $("#print").css({
        background:
          "-moz-linear-gradient(top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.5) 100%)",
        background:
          "-webkit-linear-gradient(top, rgba(0,0,0,0.5) 0%,rgba(0,0,0,1) 50%,rgba(0,0,0,0.5) 100%)",
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%,rgba(0,0,0,1) 50%,rgba(0,0,0,0.5) 100%)",
        filter:
          'progid:DXImageTransform.Microsoft.gradient( startColorstr=#80000000", endColorstr=#80000000",GradientType=0 )'
      });
    } else {
      $("#print").css({
        background:
          "-moz-linear-gradient(left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.6) 100%)",
        background:
          "-webkit-linear-gradient(left, rgba(0,0,0,0.6) 0%,rgba(0,0,0,1) 50%,rgba(0,0,0,0.6) 100%)",
        background:
          "linear-gradient(to right, rgba(0,0,0,0.6) 0%,rgba(0,0,0,1) 50%,rgba(0,0,0,0.6) 100%)",
        filter:
          'progid:DXImageTransform.Microsoft.gradient( startColorstr="#99000000", endColorstr=#99000000",GradientType=1 )'
      });
    }
  }

  function drawCanvas(element) {
    var canvas;
    var context;
    var imgArray = [
      $selected_background_path,
      $selected_frame_path,
      $selected_emblem_path
    ];

    var images = [];
    canvas = document.getElementById(element);
    context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    var loadCount = 0;
    //context.clearRect(0, 0,  canvas.width, canvas.height);
    for (var i = 0; i < imgArray.length; i++) {
      var img = new Image();
      img.src = imgArray[i];
      images.push(img);

      img.onload = function() {
        if (++loadCount == imgArray.length) {
          for (var i = 0; i < imgArray.length; i++) {
            context.drawImage(images[i], 0, 0);
          }
        }
      };
    }
  }

  $("#debugButton").click(function() {
    //$('#stallusermodal').modal({backdrop: 'static', keyboard: false })
    $("#collapseGenerator").collapse("hide");
    $("#collapseResult").collapse("show");
    $("#print").height($("#print").width());
    $("#resultpng").css({
      "max-width": $("#print").width(),
      "max-height": $("#print").height()
    });
    adjustBackgroundGradient();
  });

  $("#debugErrorButton").click(function() {
    $("#errormodal").modal({ backdrop: "static", keyboard: false });
  });

  $("#resetButton").click(function() {
    $("#collapseGenerator").collapse("show");
    $("#collapseResult").collapse("hide");
  });

  $("#downloadButton").click(function() {
    $("#downloadButtonHelper")
      .get(0)
      .click();
  });

  $("#show_advanced").click(function() {
    $("#collapseAdvancedSettings").collapse("toggle");
  });

  $("#jumpToGeneratorButton").click(function() {
    $("html, body").animate(
      {
        scrollTop: $("#finishcard").offset().top
      },
      500
    );
  });

  var IsManualChange = false;
  var bgXslider = document.getElementById("bgXslider");
  var bgYslider = document.getElementById("bgYslider");
  var emslider = document.getElementById("emslider");

  bgXslider.noUiSlider.on("update", function(values, handle) {
    if (IsManualChange == false) {
      $("#bgXvalue").val(values[handle]);
    }
    IsManualChange = false;
  });

  bgYslider.noUiSlider.on("update", function(values, handle) {
    if (IsManualChange == false) {
      $("#bgYvalue").val(values[handle]);
    }
    IsManualChange = false;
  });

  emslider.noUiSlider.on("update", function(values, handle) {
    if (IsManualChange == false) {
      $("#emvalue").val(values[handle]);
    }
    IsManualChange = false;
  });

  $("#bgXvalue").change(function() {
    IsManualChange = true;
    bgXslider.noUiSlider.set($("#bgXvalue").val());
  });

  $("#bgYvalue").change(function() {
    IsManualChange = true;
    bgYslider.noUiSlider.set($("#bgYvalue").val());
  });

  $("#emvalue").change(function() {
    IsManualChange = true;
    emslider.noUiSlider.set($("#emvalue").val());
  });

  $("#generateButton").click(function() {
    $("#stallusermodal").modal({ backdrop: "static", keyboard: false });

    togglePreviewVisibility(false);

    $bgX = $("#bgXvalue").val();
    $bgY = $("#bgYvalue").val();
    $em = $("#emvalue").val();

    if ($bgX > 2048 || $bgX < 64) {
      $bgX = 1024;
    }

    if ($bgY > 2048 || $bgY < 64) {
      $bgY = 1024;
    }

    if ($em > 512 || $em < 16) {
      $bgX = 256;
    }

    $selected_emblem = $("#emblemPicker option:selected").text();
    $selected_frame = $("#framePicker option:selected").text();
    $selected_background = $("#backgroundPicker option:selected").text();

    $selected_emblem_path = $("#emblemPicker")
      .find(":selected")
      .attr("data-img-src");
    $selected_frame_path = $("#framePicker")
      .find(":selected")
      .attr("data-img-src");
    $selected_background_path = $("#backgroundPicker")
      .find(":selected")
      .attr("data-img-src");

    if ($("#random_unused").is(":checked")) {
      $include_random_assets = "1";
    } else {
      $include_random_assets = "0";
    }
    console.log($include_random_assets);

    console.log("Selected Emblem: " + $selected_emblem);
    console.log("Selected Frame: " + $selected_frame);
    console.log("Selected Background: " + $selected_background);
    console.log("Selected Emblem image path: " + $selected_emblem_path);
    console.log("Selected Frame image path: " + $selected_frame_path);
    console.log("Selected Background image path: " + $selected_background_path);

    $("#emblem_preview").attr("src", $selected_emblem_path);
    $("#frame_preview").attr("src", $selected_frame_path);
    $("#background_preview").attr("src", $selected_background_path);

    if ($selected_emblem == "no_emblem")
      $selected_emblem_path = "resources/thumbnails/emblems/none.png";

    if ($selected_frame == "no_frame")
      $selected_frame_path = "resources/thumbnails/frames/none.png";

    if ($selected_background == "no_background")
      $selected_background_path = "resources/thumbnails/backgrounds/none.jpg";

    console.log("Sending data...");
    console.log($selected_emblem_path);
    console.log($selected_frame_path);
    console.log($selected_background_path);
    console.log($bgX);
    console.log($bgY);
    console.log($em);

    request = $.ajax({
      url: "https://mirrorsedgearchive.de/project_graffiti/generate.php",
      type: "post",
      data: {
        emblem: $selected_emblem_path,
        frame: $selected_frame_path,
        background: $selected_background_path,
        bgX: $bgX,
        bgY: $bgY,
        em: $em,
        unused: $include_random_assets,
        version: "2"
      },
      success: function(msg) {
        if (msg == "deprecated") {
          $("#stallusermodal").modal("hide");
          $("#deprecatedmodal").modal({ backdrop: "static", keyboard: false });
        }
        if (msg.indexOf("https://a.uguu.se/") >= 0) {
          $("#resultpng").attr("src", msg);
          $("#tempshareURL").val(msg);
          $("#DLform").attr("action", msg);
          $("#downloadButtonHelper").attr("href", msg);
          var resultpng = document.getElementById("resultpng");
          window.tid = setInterval(waitonimageload, 500);
        } else {
          $("#stallusermodal").modal("hide");
          $("#errormodal").modal({ backdrop: "static", keyboard: false });
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("Ajax error" + textStatus + " " + errorThrown);
      }
    });
  });

  function waitonimageload() {
    if (resultpng.complete) {
      adjustBackgroundGradient();
      $("#collapseGenerator").collapse("hide");
      $("#collapseResult").collapse("show");
      $("#print").height($("#print").width());
      $("#resultpng").css({
        "max-width": $("#print").width(),
        "max-height": $("#print").height()
      });
      $("#stallusermodal").modal("hide");
      window.scrollTo(0, 0);
      abortTimer();
    }
  }
  function abortTimer() {
    clearInterval(window.tid);
  }

  function togglePreviewVisibility(visible) {
    if (visible == true) {
      if ($vp_sm == false) {
        $("#floatingPreview").css({ visibility: "visible", opacity: "1" });
      } else {
        $("#stacked_col").show();
      }
    } else {
      if ($vp_sm == false) {
        $("#floatingPreview").css({ visibility: "hidden", opacity: "0" });
      } else {
        $("#stacked_col").hide();
      }
    }
  }
});
