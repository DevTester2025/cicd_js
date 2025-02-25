function saveData(blob, name) {
  try {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style", "none");
    blob = new Blob([blob], { type: "octet/stream" });
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    console.log(e);
  }
}

export default saveData;
