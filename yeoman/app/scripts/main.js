require.config({
  shim: {
  },

  paths: {
    hm: 'vendor/hm',
    esprima: 'vendor/esprima',
    jquery: 'vendor/jquery.min'
  }
});
 
require(['app'], function(app) {

  var root = "http://localhost:9393";

  /******
   * Recents
   *****/

  var refreshRecent = function() {

    $.getJSON(root + "/recents.json", function(json) {

      for(i = 0; i < json.length; i++) {
        var element = json[i];

        if($("#recents #element-" + element.id).length == 0) {
          var elementHtml = "<div id='element-" + element.id + "' class='row-fluid'><div class='span2'>";
          elementHtml += element.date + "</div><div class='span8'>";
          elementHtml += element.text + "</div><div class='span2'>";
          elementHtml += "<p><button class='accept btn btn-mini btn-success' type='button'>Ok</button></p>";
          elementHtml += "<p><button class='reject btn btn-mini btn-danger' type='button'>No</button></p><hr></div></div>";
          $("#recents").prepend(elementHtml);
        }
      }
    });

  }

  $("#recents-refresh").live("click", function() { refreshRecent(); });

  $("#recents button.accept").live("click", function() {
    var parent = $(this).parents(".row-fluid");
    var msgId = parent.attr("id").split("-")[1];
    $.post(root + "/accept/" + msgId, function() {
      $(parent).remove();
      refreshSelected();
    });
  });

  $("#recents button.reject").live("click", function() {
    var parent = $(this).parents(".row-fluid");
    var msgId = parent.attr("id").split("-")[1];
    $.post(root + "/reject/" + msgId, function() {
      $(parent).remove();
      refreshSelected();
    });
  });

  /******
   * Selected
   *****/

  var refreshSelected = function() {

    $.getJSON(root + "/selected.json", function(json) {

      for(i = 0; i < json.length; i++) {
        var element = json[i];

        if($("#selected #element-" + element.id).length == 0) {
          var elementHtml = "<div id='element-" + element.id + "' class='row-fluid'><div class='span2'>";
          elementHtml += element.date + "</div><div class='span8'>";
          elementHtml += element.text + "</div><div class='span2'>";
          elementHtml += "<p><button class='favorite btn btn-mini btn-danger' type='button'>Fav</button></p>";
          elementHtml += "<p><button class='reject btn btn-mini btn-danger' type='button'>No</button></p><hr></div></div>";
          $("#selected").prepend(elementHtml);
        }
      }

      $("#selected_count").html(json.length);
    });

  }

  $("#selected button.favorite").live("click", function() {
    var parent = $(this).parents(".row-fluid");
    var msgId = parent.attr("id").split("-")[1];
    $.post(root + "/favorite/" + msgId, function() {
      refreshFavorites();
    });
  });

  $("#selected button.reject").live("click", function() {
    var parent = $(this).parents(".row-fluid");
    var msgId = parent.attr("id").split("-")[1];
    $.post(root + "/reject/" + msgId, function() {
      $(parent).remove();
      refreshSelected();
    });
  });

  /******
   * Examples
   *****/

  var refreshExamples = function() {

    $.getJSON(root + "/examples.json", function(json) {

      for(i = 0; i < json.length; i++) {
        var element = json[i];

        if($("#examples #element-" + element.id).length == 0) {
          var elementHtml = "<div id='element-" + element.id + "' class='row-fluid'><div class='span10'>";
          elementHtml += element.text + "</div><div class='span2'>";
          elementHtml += "<p><button class='select btn btn-mini btn-info' type='button'>Select</button></p><hr></div></div>";
          $("#examples").prepend(elementHtml);
        }
      }

    });

  }

  $("#examples button.select").live("click", function() {
    var parent = $(this).parents(".row-fluid");
    var msgId = parent.attr("id").split("-")[1];
    $.post(root + "/select/" + msgId, function() {
      refreshSelected();
    });
  });

  /******
   * Favorites
   *****/

  var refreshFavorites = function() {

    $.getJSON(root + "/favorites.json", function(json) {

      for(i = 0; i < json.length; i++) {
        var element = json[i];

        if($("#favorites #element-" + element.id).length == 0) {
          var elementHtml = "<div id='element-" + element.id + "' class='row-fluid'><div class='span10'>";
          elementHtml += element.text + "</div><div class='span2'>";
          elementHtml += "<p><button class='select btn btn-mini btn-info' type='button'>Select</button></p><hr></div></div>";
          $("#favorites").prepend(elementHtml);
        }
      }

    });

  }

  $("#favorites button.select").live("click", function() {
    var parent = $(this).parents(".row-fluid");
    var msgId = parent.attr("id").split("-")[1];
    $.post(root + "/select/" + msgId, function() {
      refreshSelected();
    });
  });

  /******
   * Main
   *****/

  refreshRecent();
  refreshSelected();
  refreshExamples();
  refreshFavorites();
});
