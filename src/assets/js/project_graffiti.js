import {
  buildInputFile,
  execute,
} from "/assets/vendor/wasm-imagemagick/magickApi.js";

function getRandomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function renderCategoryPicker(storeObject, type, manifest) {
  let collapseEl = document.createElement("div");
  collapseEl.classList.add("tab-pane");
  collapseEl.setAttribute("role", "tabpanel");
  collapseEl.id = "collapse-" + type;
  let selectTopEl = document.createElement("select");
  selectTopEl.classList.add("image-picker");
  selectTopEl.setAttribute(
    "id",
    "select-" + type.substring(0, type.length - 1)
  );
  storeObject[type].content.forEach((categoryStoreEl) => {
    let optgroupEl = document.createElement("optgroup");
    let optgroupId = categoryStoreEl.label.substring(0, 4).toLowerCase();
    optgroupEl.setAttribute("id", "sel-emb-" + optgroupId);
    optgroupEl.setAttribute("label", categoryStoreEl.label);
    categoryStoreEl.content.forEach((itemStoreEl) => {
      let optionEl = document.createElement("option");
      optionEl.value = itemStoreEl.id;
      optionEl.text = itemStoreEl.label;
      if (categoryStoreEl.label == "_TOOL_") {
        optionEl.setAttribute(
          "data-img-src",
          "/" +
            manifest[
              "assets/media/image/project_graffiti/generic/" +
                itemStoreEl.path.substring(0, itemStoreEl.path.length - 3) +
                "webp"
            ]
        );
      } else {
        if (type == "backgrounds") {
          optionEl.setAttribute(
            "data-img-src",
            "/" +
              manifest[
                "assets/media/image/project_graffiti/thumbnails/" +
                  type +
                  "/" +
                  itemStoreEl.path.substring(0, itemStoreEl.path.length - 3) +
                  "jpg"
              ]
          );
        } else {
          optionEl.setAttribute(
            "data-img-src",
            "/" +
              manifest[
                "assets/media/image/project_graffiti/thumbnails/" +
                  type +
                  "/" +
                  itemStoreEl.path
              ]
          );
        }
        optionEl.setAttribute("data-img-path", type + "/" + itemStoreEl.path);
      }
      optgroupEl.appendChild(optionEl);
    });
    selectTopEl.appendChild(optgroupEl);
    collapseEl.appendChild(selectTopEl);
    // selectTopEl.appendChild(document.createElement("br"));
  });
  document.querySelector("#selector_area").appendChild(collapseEl);
  $(selectTopEl).imagepicker();
}

function getSelection() {
  var selection = new Object();
  let baseUrl = "https://static.mirrorsedgearchive.org/prod/graffiti/";

  let frame_selector = document.querySelector("#select-frame");
  if (frame_selector.selectedIndex == 0) {
    selection.frame =
      baseUrl +
      frame_selector[getRandomBetween(2, frame_selector.length)].getAttribute(
        "data-img-path"
      );
  } else if (frame_selector.selectedIndex == 1) {
    selection.frame = baseUrl + "nomask.png";
  } else {
    selection.frame =
      baseUrl +
      frame_selector[frame_selector.selectedIndex].getAttribute(
        "data-img-path"
      );
  }
  console.log("🔧 Selected frame: " + selection.frame);

  let emblem_selector = document.querySelector("#select-emblem");
  if (emblem_selector.selectedIndex == 0) {
    let rnd_index = getRandomBetween(2, emblem_selector.length);
    selection.emblem =
      baseUrl + emblem_selector[rnd_index].getAttribute("data-img-path");
    selection.mask =
      baseUrl +
      "masks/" +
      emblem_selector[rnd_index].getAttribute("data-img-path").substring(8);
  } else if (emblem_selector.selectedIndex == 1) {
    selection.emblem = baseUrl + "notag.png";
    selection.mask = baseUrl + "notag.png";
  } else {
    selection.emblem =
      baseUrl +
      emblem_selector[emblem_selector.selectedIndex].getAttribute(
        "data-img-path"
      );
    selection.mask =
      baseUrl +
      "mask" +
      emblem_selector[emblem_selector.selectedIndex]
        .getAttribute("data-img-path")
        .substring(6);
  }
  console.log("🔧 Selected emblem: " + selection.emblem);
  console.log("🔧 Selected mask: " + selection.mask);

  let background_selector = document.querySelector("#select-background");
  if (background_selector.selectedIndex == 0) {
    selection.background =
      baseUrl +
      background_selector[
        getRandomBetween(2, background_selector.length)
      ].getAttribute("data-img-path");
  } else if (background_selector.selectedIndex == 1) {
    selection.background = baseUrl + "nomask.png";
  } else {
    selection.background =
      baseUrl +
      background_selector[background_selector.selectedIndex].getAttribute(
        "data-img-path"
      );
  }
  console.log("🔧 Selected background: " + selection.background);
  return selection;
}

async function renderImage(frame, emblem, mask, background) {
  let step1Result = await execute({
    inputFiles: [await buildInputFile(frame, "frame.png")],
    commands: ["convert frame.png -alpha extract step1.png"],
  });

  console.log("🔧 Render Step 1 out of 6 completed.");
  document.querySelector("#stallusermodalprogress").style.width = "20%";

  let step2Result = await execute({
    inputFiles: [
      { name: "step1.png", content: step1Result.outputFiles[0].buffer },
      await buildInputFile(mask, "mask.png"),
    ],
    commands: ["composite step1.png mask.png -compose Darken step2.png"],
  });

  console.log("🔧 Render Step 2 out of 6 completed.");
  document.querySelector("#stallusermodalprogress").style.width = "35%";

  let step3Result = await execute({
    inputFiles: [
      { name: "step2.png", content: step2Result.outputFiles[0].buffer },
      await buildInputFile(frame, "frame.png"),
    ],
    commands: ["composite step2.png -compose CopyOpacity frame.png step3.png"],
  });

  console.log("🔧 Render Step 3 out of 6 completed.");
  document.querySelector("#stallusermodalprogress").style.width = "50%"

  let step4Result = await execute({
    inputFiles: [
      { name: "step3.png", content: step3Result.outputFiles[0].buffer },
      await buildInputFile(emblem, "emblem.png"),
    ],
    commands: ["composite step3.png emblem.png -resize 512 step4.png"],
  });

  console.log("🔧 Render Step 4 out of 6 completed.");
  document.querySelector("#stallusermodalprogress").style.width = "80%";

  let step5prepResult = await execute({
    inputFiles: [await buildInputFile(background, "background.png")],
    commands: [
      "convert background.png -gravity center -resize 1024x1024 -extent 1024x1024 step5prepare.png",
    ],
  });

  console.log("🔧 Render Step 5 out of 6 completed.");
  document.querySelector("#stallusermodalprogress").style.width = "95%"

  let step5Result = await execute({
    inputFiles: [
      { name: "step4.png", content: step4Result.outputFiles[0].buffer },
      { name: "step5prep.png", content: step5prepResult.outputFiles[0].buffer },
      await buildInputFile(background, "background.png"),
    ],
    commands: ["composite -gravity center step4.png step5prep.png step5.png"],
  });

  console.log("🔧 Render Step 6 out of 6 completed.");
  document.querySelector("#stallusermodalprogress").style.width = "100%"

  return await step5Result.outputFiles[0].buffer;
}

async function paintImage(image) {
  console.log("🔧 Painting result...");
  let imageBlob = new Blob([image], { type: "image/png" });
  let blobUrl = window.URL.createObjectURL(imageBlob);
  document.querySelector("#outputImage").src = blobUrl;
  console.log("🔧 Result painted.");
}

// Main Thread
$.getJSON("/assets/rev-manifest.json", function (manifest) {
  $.getJSON("./assets.json", function (assetStore) {
    renderCategoryPicker(assetStore, "emblems", manifest);
    renderCategoryPicker(assetStore, "frames", manifest);
    renderCategoryPicker(assetStore, "backgrounds", manifest);

    let images = Array.from(document.querySelectorAll("#selector_area img"));
    let counter = 0;

    Promise.all(
      images
        .filter((image) => !image.complete)
        .map(
          (image) =>
            new Promise((resolve) => {
              image.addEventListener("load", () => {
                counter++;
                setLoadedPercentage(
                  Math.floor((90 / images.length) * counter) + 10
                );
                resolve();
              });
            })
        )
    ).then(() => {
      document.querySelector(".box-load").classList.add("box-content-hide");
      setTimeout(() => {
        document.querySelector(".box-load").style.display = "none";
        document.querySelector(".box-main").classList.add("box-content-show");
        document
          .querySelector(".box-main")
          .classList.remove("box-content-hide");
      }, 300);
      $("#collapse-emblems").tab("show");
    });
  });
});

async function generatePlayerTag() {
  $('#stallusermodal').modal('show');
  let selection = getSelection();
  let imageBuffer = await renderImage(
    selection.frame,
    selection.emblem,
    selection.mask,
    selection.background
  );
  paintImage(imageBuffer);
  $('#collapse-generator').collapse('hide');
  $('#collapse-output').collapse('show');
  $('#stallusermodal').modal('hide');
}

function setLoadedPercentage(percentage) {
  document.querySelector("#load-progress-bar").style.width = percentage + "%";
}

document.querySelector("#submit").addEventListener("click", function () {
  generatePlayerTag();
});
