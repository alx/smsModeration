//var root = "http://localhost:4567";
var root = "";
var displayHiddenNumbers = true;
var timeout = 60;

/******
 * Recents
 *****/

var refreshRecent = function() {

  $("#recents-timeout").html(timeout);
  $.getJSON(root + "/recents.json", function(json) {

    if(!displayHiddenNumbers) {
      json.filter(function(element) {
        return !element.is_hidden;
      });
    }

//    var output = $.map(json, function(element) {
//
//      var elementHtml = "<div id='element-" + element.id + "' class='row-fluid'><div class='row'><div class='span2'>";
//      elementHtml += "<span class='label label-info'>" + element.hours + "</span></div><div class='span10'>";
//      elementHtml += element.msg + "</div></div><div class='row align-right'>";
//      elementHtml += "<span class='badge'>" + element.phone_valid_messages + "/" + element.phone_messages + "</span> ";
//      elementHtml += "<button class='select btn btn-success' type='button'>Ok</button> ";
//      elementHtml += "<button class='reject btn btn-danger' type='button'>No</button></div></div>";
//
//      return elementHtml;
//    });
//    $("#recents").html(output.join(""));
//
    for(i = 0; i < json.length; i++) {
      var element = json[i];

      if($("#recents #element-" + element.id).length == 0) {
        var elementHtml = "<div id='element-" + element.id + "' class='row-fluid'><div class='row'><div class='span2'>";
        elementHtml += "<span class='label label-info'>" + element.hours + "</span></div><div class='span10'>";
        elementHtml += element.msg + "</div></div><div class='row align-right'>";
        elementHtml += "<span class='badge'>" + element.phone_valid_messages + "/" + element.phone_messages + "</span> ";
        elementHtml += "<button class='select btn btn-success' type='button'>Ok</button> ";
        elementHtml += "<button class='reject btn btn-danger' type='button'>No</button></div></div>";
        $("#recents").prepend(elementHtml);
      }
    }
    $("#nb-recents").html(json.length);
  });

}

$("#recents-refresh").live("click", function() { refreshRecent(); });

$("#recents button.select").live("click", function() {
  var parent = $(this).parents(".row-fluid");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'select'}, function() {
    $(parent).remove();
    refreshAll();
    refreshSelected();
  });
});

$("#recents button.reject").live("click", function() {
  var parent = $(this).parents(".row-fluid");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'reject'}, function() {
    $(parent).remove();
    refreshSelected();
  });
});

$("#delete-received").live("click", function() {
  $.each($("#recents .row-fluid"), function() {
    var message = $(this);
    var msgId = message.attr("id").split("-")[1];
    $.post(root + "/messages/" + msgId, {action: 'reject'}, function() {
      message.remove();
    });
  });
  refreshSelected();
});

$("#hidden-numbers").live("click", function() {
  var button = $(this);

  if(button.hasClass('btn-inverse')) {
    displayHiddenNumbers = false;
    button.removeClass('btn-inverse');
    button.find('i').removeClass('icon-ok icon-white').addClass('icon-remove');
  } else {
    displayHiddenNumbers = true;
    button.addClass('btn-inverse');
    button.find('i').removeClass('icon-remove').addClass('icon-white icon-ok');
  }

  refreshRecent();
});

/******
 * Selected
 *****/

var refreshSelected = function() {

  $.getJSON(root + "/selected.json", function(json) {

//    var output = $.map(json.messages, function(element) {
//      var elementHtml = "";
//      if($("#selected #element-" + element.id).length == 0) {
//        elementHtml = "<div id='element-" + element.id + "' class='row-fluid'><div class='row'><div class='span2'>";
//        elementHtml += "<span class='label label-info'>" + element.hours + "</span></div><div class='span10'>";
//        elementHtml += element.msg + "</div></div><div class='row align-right'>";
//
//        if(element.is_favorite) {
//          elementHtml += "<button class='favorite btn btn-warning' type='button'><i class='icon-white icon-star'></i></button> ";
//        } else {
//          elementHtml += "<button class='favorite btn' type='button'><i class='icon-star'></i></button> ";
//        }
//
//        elementHtml += "<button class='reject btn btn-danger' type='button'>No</button></div></div>";
//      }
//      return elementHtml;
//    });
//    $("#selected").html(output.join(""));
    for(i = 0; i < json.messages.length; i++) {
      var element = json.messages[i];

      if($("#selected #element-" + element.id).length == 0) {
        var elementHtml = "<div id='element-" + element.id + "' class='row-fluid'><div class='row'><div class='span2'>";
        elementHtml += "<span class='label label-info'>" + element.hours + "</span></div><div class='span10'>";
        elementHtml += element.msg + "</div></div><div class='row align-right'>";

        if(element.is_favorite) {
          elementHtml += "<button class='favorite btn btn-warning' type='button'><i class='icon-white icon-star'></i></button> ";
        } else {
          elementHtml += "<button class='favorite btn' type='button'><i class='icon-star'></i></button> ";
        }

        elementHtml += "<button class='reject btn btn-danger' type='button'>No</button></div></div>";
        $("#selected").prepend(elementHtml);
      }
    }

    $("#selected_count").html(json.messages.length);
    $("#selected_id").html(json.id);
  });

}

$("button.favorite").live("click", function() {
  var button = $(this);
  var parent = button.parents(".row-fluid");
  var msgId = parent.attr("id").split("-")[1];

  // Message is already favorite
  if(button.hasClass('btn-warning')) {
    $.post(root + "/messages/" + msgId, {action: 'unfavorite'}, function() {
      button.removeClass('btn-warning');
      button.find('i').removeClass('icon-white');
      refreshFavorites();
      refreshAll();
    });
  } else {
    $.post(root + "/messages/" + msgId, {action: 'favorite'}, function() {
      button.addClass('btn-warning');
      button.find('i').addClass('icon-white');
      refreshFavorites();
      refreshAll();
    });
  }
});

$("#selected button.reject").live("click", function() {
  var parent = $(this).parents(".row-fluid");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'reject'}, function() {
    $(parent).remove();
    refreshSelected();
  });
});

$("#new-selection").live("click", function() {
  $.post(root + "/selection", function() {
    $("#selected .row-fluid").remove();
    refreshSelected();
  })
});

/******
 * Favorites
 *****/

var refreshFavorites = function() {

  $("#favorites .row-fluid").remove();

  $.getJSON(root + "/favorites.json", function(json) {

    for(i = 0; i < json.length; i++) {
      var element = json[i];

      var elementHtml = "<div id='element-" + element.id + "' class='row-fluid'><div class='row'><div class='span2'>";
      elementHtml += "<span class='label label-info'>" + element.hours + "</span></div><div class='span10'>";
      elementHtml += element.msg + "</div></div><div class='row align-right'>";

      if(element.is_favorite) {
        elementHtml += "<button class='favorite btn btn-warning' type='button'><i class='icon-white icon-star'></i></button> ";
      } else {
        elementHtml += "<button class='favorite btn' type='button'><i class='icon-star'></i></button> ";
      }

      elementHtml += "<button class='select btn btn-info' type='button'>Select</button></div></div>";
      $("#favorites").prepend(elementHtml);
    }
    $("#nb-favorites").html(json.length);

  });

}

$("#favorites button.select").live("click", function() {
  var parent = $(this).parents(".row-fluid");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'select'}, function() {
    refreshSelected();
  });
});

/******
 * All
 *****/

var refreshAll = function() {

  $("#all .row-fluid").remove();

//  $.getJSON(root + "/all.json", function(json) {
//
//    for(i = 0; i < json.length; i++) {
//      var element = json[i];
//
//      var elementHtml = "<div id='element-" + element.id + "' class='row-fluid'><div class='row'><div class='span2'>";
//      elementHtml += "<span class='label label-info'>" + element.hours + "</span></div><div class='span10'>";
//      elementHtml += element.msg + "</div></div><div class='row align-right'>";
//
//      if(element.is_favorite) {
//        elementHtml += "<button class='favorite btn btn-warning' type='button'><i class='icon-white icon-star'></i></button> ";
//      } else {
//        elementHtml += "<button class='favorite btn' type='button'><i class='icon-star'></i></button> ";
//      }
//
//      elementHtml += "<button class='select btn btn-info' type='button'>Select</button></div></div>";
//      $("#all").prepend(elementHtml);
//    }
//    $("#nb-all").html(json.length);
//
//  });

}

$("#all button.select").live("click", function() {
  var parent = $(this).parents(".row-fluid");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'select'}, function() {
    refreshSelected();
  });
});

/******
 * Main
 *****/

refreshRecent();
refreshSelected();
refreshFavorites();
refreshAll();

setInterval(function(){refreshRecent()}, timeout * 1000);
setInterval(function(){$("#recents-timeout").html(parseInt($("#recents-timeout").html()) - 1)}, 1000);

var windowHeight = $(window).height();
var offset = 120;
$("#recents").css("max-height", windowHeight - offset);
$("#selected").css("max-height", windowHeight - offset);
$("#favorites").css("max-height", windowHeight - offset);
$("#all").css("max-height", windowHeight - offset);
