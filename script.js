function updateScreen() {
  var output = document.getElementById("output");
  var outputList = document.getElementById("output-list");
  var downloadAll = document.getElementById("download-all");
  var downloadAll = document.getElementById("download-all");

  if (outputList.children.length > 0) {
    output.style.display = "block";
    downloadAll.style.display = "block";
  } else {
    output.style.display = "none";
    downloadAll.style.display = "none";
  }
}

function onSubmit(event) {
  event.preventDefault();
  var fileInput = document.getElementById("jsonFile");
  var file = fileInput.files[0];
  var oldString = document.getElementById("old-string").value;
  var newString = document.getElementById("new-string").value;
  var filename = file.name;
  if (filename.includes(oldString)) {
    filename = filename.replaceAll(oldString, newString);
  } else {
    filename = filename.replace(".json", "_" + newString + ".json");
  }

  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function () {
    var text = reader.result;
    var newText = text.replace(new RegExp(oldString, "g"), newString);
    var blob = new Blob([newText], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.download = filename;
    link.textContent = filename;
    link.href = url;
    document.getElementById("output-list").appendChild(link);

    updateScreen();
  };
}

function downloadAll() {
  var zip = new JSZip();
  var outputList = document.querySelector("#output-list");

  for (var i = 0; i < outputList.children.length; i++) {
    var item = outputList.children[i];
    var filename = item.textContent;
    var url = item.getAttribute("href");

    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        zip.file(filename, blob);
        if (i === outputList.children.length - 1) {
          zip.generateAsync({ type: "blob" }).then(function (content) {
            saveAs(content, "output.zip");
          });
        }
      });
  }
}
