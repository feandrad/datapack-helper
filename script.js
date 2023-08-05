function updateScreen() {
  var output = document.getElementById("output");
  var outputList = document.getElementById("output-list");
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
  var folderInput = document.getElementById("jsonFolder");
  var files = folderInput.files;
  var oldString = document.getElementById("old-string").value;
  var newString = document.getElementById("new-string").value;

  // Collect promises for each processed file
  var promises = [];
  
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (file.type === "application/json") {
      promises.push(processFile(file, oldString, newString));
    }
  }

  // Wait for all promises to complete
  Promise.all(promises)
    .then(function() {
      updateScreen();
      zipAll();
    })
    .catch(function(error) {
      console.error("An error occurred:", error);
    });
}

function processFile(file, oldString, newString) {
  return new Promise(function(resolve, reject) {
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
      link.aux = newText;
      document.getElementById("output-list").appendChild(link);

      resolve(); // Resolve the Promise
    };
    
    reader.onerror = function(error) {
      reject(error); // Reject the Promise if an error occurs
    };
  });
}

function zipAll() {
  var zip = new JSZip();
  var outputList = document.querySelector("#output-list");

  for (var i = 0; i < outputList.children.length; i++) {
    var item = outputList.children[i];
    var filename = item.textContent;

    zip.file(filename, item.aux);
  }

  zip.generateAsync({ type: "blob" })
    .then(function (content) {
      var file = new File([content], "arquivos.zip", { type: "application/zip" });
      var downloadAll = document.getElementById("download-all");
      downloadAll.href = URL.createObjectURL(file);
      downloadAll.download = "arquivos.zip";
    });
}
