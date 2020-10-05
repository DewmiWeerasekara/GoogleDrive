$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const redirect_uri = "http://localhost:8080/GoogleDrive/upload.html";
  const client_secret = "qr7FtRATWD5vb0748W3ZIEEp";
  const scope = "https://www.googleapis.com/auth/drive";
  var client_id = "647733953679-iu3b6iuds3tcp9qkgko18tvabbeo06fi.apps.googleusercontent.com";
  $.ajax({
    type: "POST",
    url: "https://www.googleapis.com/oauth2/v4/token",
    data: {
      code: code,
      redirect_uri: redirect_uri,
      client_secret: client_secret,
      client_id: client_id,
      scope: scope,
      grant_type: "authorization_code",
    },
    dataType: "json",
    success: function (resultData) {
      localStorage.setItem("accessToken", resultData.access_token);
      localStorage.setItem("refreshToken", resultData.refreshToken);
      localStorage.setItem("expires_in", resultData.expires_in);
      window.history.pushState(
        {},
        document.title,
        "/GoogleDrive/" + "upload.html"
      );
    },
  });

  var Upload = function (file) {
    this.file = file;
  };

  Upload.prototype.getType = function () {
    console.log("type: "+this.file.type);
    localStorage.setItem("type", this.file.type);
    return this.file.type;
  };
  Upload.prototype.getSize = function () {
    console.log("size: "+this.file.size);
    localStorage.setItem("size", this.file.size);
    return this.file.size;
  };
  Upload.prototype.getName = function () {
    console.log("2");
    console.log("file name: "+this.file.name);
    return this.file.name;
  };
  Upload.prototype.doUpload = function () {
    console.log("1");
    var that = this;
    var formData = new FormData();
    console.log("3");
    console.log("---------- "+this.file+" --------- "+this.getName());
    formData.append("file", this.file, this.getName());
    formData.append("upload_file", true);

    $.ajax({
      type: "POST",
      beforeSend: function (request) {
        request.setRequestHeader(
          "Authorization",
          "Bearer" + " " + localStorage.getItem("accessToken")
        );
      },
      url: "https://www.googleapis.com/upload/drive/v2/files",
      data: {
        uploadType: "media",
      },
      xhr: function () {
        var myXhr = $.ajaxSettings.xhr();
        if (myXhr.upload) {
          myXhr.upload.addEventListener(
            "progress",
            that.progressHandling,
            false
          );
        }
        console.log("myXhr: "+myXhr);
        return myXhr;
      },
      success: function (data) {
        console.log("success: "+data);
        location.reload();
      },
      error: function (error) {
        console.log("error: "+error);
      },
      async: true,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      timeout: 60000,
    });
  };

  Upload.prototype.progressHandling = function (event) {
    var percent = 0;
    var position = event.loaded || event.position;
    var total = event.total;
    var progress_bar_id = "#progress-wrp";
    if (event.lengthComputable) {
      percent = Math.ceil((position / total) * 100);
    }
    // update progressbars classes so it fits your code
    $(progress_bar_id + " .progress-bar").css("width", +percent + "%");
    $(progress_bar_id + " .status").text(percent + "%");
  };

  $("#upload").on("click", function (e) {
    var file = $("#files")[0].files[0];
    var upload = new Upload(file);
    console.log("upload: "+upload);
    upload.doUpload();
  });
});
