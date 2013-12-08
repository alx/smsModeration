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
        var elementHtml = "<div id='element-" + element.id + "' class='row-fluid message'><div class='row'><div class='span2'>";
        elementHtml += "<span class='label label-info'>" + element.hours + "</span></div><div class='span10'>";
        elementHtml += element.msg + "</div></div><div class='row align-right'>";
        if(element.phone_valid_messages == 1) {
          elementHtml += "<span class='badge badge-warning'>";
        } else if(element.phone_valid_messages > 1) {
          elementHtml += "<span class='badge badge-important'>";
        } else {
          elementHtml += "<span class='badge'>";
        }
        elementHtml += element.phone_valid_messages + "/" + element.phone_messages + "</span> ";
        elementHtml += "<span class='badge messageListSelector messageListSelector-1'>1</span>";
        elementHtml += "<span class='badge messageListSelector messageListSelector-2'>2</span>";
        elementHtml += "<span class='badge messageListSelector messageListSelector-3'>3</span>";
        elementHtml += "<span class='badge messageListSelector messageListSelector-4'>4</span>";
        elementHtml += "<span class='badge messageListSelector messageListSelector-5'>5</span>";
        elementHtml += "<button class='select btn btn-mini btn-success' type='button'><i class='icon-home icon-white'></i></button> ";
        elementHtml += "<button class='reject btn btn-mini btn-danger' type='button'><i class='icon-trash icon-white'></i></button></div></div>";
        $("#recents").prepend(elementHtml);
      }
    }
    $("#nb-recents").html(json.length);
  });

}

$("#recents-refresh").live("click", function() { refreshRecent(); });

$("#recents button.select").live("click", function() {
  var parent = $(this).parents(".message");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'select'}, function() {
    $(parent).remove();
    refreshSelected();
  });
});

$("#recents .messageListSelector").live("click", function() {
  var parent = $(this).parents(".message");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'select', list_index: $(this).html()}, function() {
    $(parent).remove();
    refreshSelected();
  });
});

$("#recents button.reject").live("click", function() {
  var parent = $(this).parents(".message");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'reject'}, function() {
    $(parent).remove();
    refreshSelected();
  });
});

$("#delete-received").live("click", function() {
  $.each($("#recents .message"), function() {
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

$("#refresh-recents").live("click", function() {
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
        var elementHtml = "<div id='element-" + element.id + "' class='row-fluid message'><div class='row'>";
        elementHtml += "<span class='label label-info'>" + element.hours + "</span></div><div class='row'>";
        elementHtml += element.msg + "</div><div class='row align-right'>";

        elementHtml += "<span class='badge messageListSelector messageListSelector-1";
        if(element.list_index == 1) {
          elementHtml += " active";
        }
        elementHtml += "'>1</span>";

        elementHtml += "<span class='badge messageListSelector messageListSelector-2";
        if(element.list_index == 2) {
          elementHtml += " active";
        }
        elementHtml += "'>2</span>";

        elementHtml += "<span class='badge messageListSelector messageListSelector-3";
        if(element.list_index == 3) {
          elementHtml += " active";
        }
        elementHtml += "'>3</span>";

        elementHtml += "<span class='badge messageListSelector messageListSelector-4";
        if(element.list_index == 4) {
          elementHtml += " active";
        }
        elementHtml += "'>4</span>";

        elementHtml += "<span class='badge messageListSelector messageListSelector-5";
        if(element.list_index == 5) {
          elementHtml += " active";
        }
        elementHtml += "'>5</span>";

        if(element.is_favorite) {
          elementHtml += "<button class='favorite btn btn-warning btn-mini' type='button'><i class='icon-white icon-star'></i></button> ";
        } else {
          elementHtml += "<button class='favorite btn btn-mini' type='button'><i class='icon-star'></i></button> ";
        }

        elementHtml += "<button class='reject btn btn-danger btn-mini' type='button'><i class='icon-trash icon-white'></i></button></div></div>";
        $("#selected").prepend(elementHtml);
      }
    }

    $("#selected_count").html(json.messages.length);
    $("#selected_id").html(json.id);
  });

}

$('#selected .messageListSelector').live('click', function() {
  var button = $(this);
  var parent = button.parents(".message");
  var msgId = parent.attr("id").split("-")[1];

  $.post(root + "/messages/" + msgId, {action: 'change_list', list_index: button.html()}, function() {
    parent.find('.messageListSelector').removeClass('active');
    button.addClass('active');
  });
});

$("button.favorite").live("click", function() {
  var button = $(this);
  var parent = button.parents(".message");
  var msgId = parent.attr("id").split("-")[1];

  // Message is already favorite
  if(button.hasClass('btn-warning')) {
    $.post(root + "/messages/" + msgId, {action: 'unfavorite'}, function() {
      button.removeClass('btn-warning');
      button.find('i').removeClass('icon-white');
      refreshFavorites();
    });
  } else {
    $.post(root + "/messages/" + msgId, {action: 'favorite'}, function() {
      button.addClass('btn-warning');
      button.find('i').addClass('icon-white');
      refreshFavorites();
    });
  }
});

$("#selected button.reject").live("click", function() {
  var parent = $(this).parents(".message");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'reject'}, function() {
    $(parent).remove();
    refreshSelected();
  });
});

$("#new-selection").live("click", function() {
  $.post(root + "/selection", function() {
    $("#selected .message").remove();
    refreshSelected();
  })
});

/******
 * Favorites
 *****/

var refreshFavorites = function() {

  $("#favorites .message").remove();

  $.getJSON(root + "/favorites.json", function(json) {

    for(i = 0; i < json.length; i++) {
      var element = json[i];

      var elementHtml = "<div id='element-" + element.id + "' class='row-fluid message'><div class='row'><div class='span2'>";
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
  var parent = $(this).parents(".message");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'select'}, function() {
    refreshSelected();
  });
});

/******
 * All
 *****/

var refreshAll = function() {

  $("#all .message").remove();

  $.getJSON(root + "/all.json", function(json) {

    for(i = 0; i < json.length; i++) {
      var element = json[i];

      var elementHtml = "<div id='element-" + element.id + "' class='row-fluid message'><div class='row'><div class='span2'>";
      elementHtml += "<span class='label label-info'>" + element.hours + "</span></div><div class='span10'>";
      elementHtml += element.msg + "</div></div><div class='row align-right'>";

      if(element.is_favorite) {
        elementHtml += "<button class='favorite btn btn-warning' type='button'><i class='icon-white icon-star'></i></button> ";
      } else {
        elementHtml += "<button class='favorite btn' type='button'><i class='icon-star'></i></button> ";
      }

      elementHtml += "<button class='select btn btn-info' type='button'>Select</button></div></div>";
      $("#all").prepend(elementHtml);
    }

  });

}

$("#display-all").live("click", function() {
  refreshAll();
});

$("#all button.select").live("click", function() {
  var parent = $(this).parents(".message");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'select'}, function() {
    refreshSelected();
  });
});

$("#all .messageListSelector").live("click", function() {
  var parent = $(this).parents(".message");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'select', list_index: $(this).html()}, function() {
    refreshSelected();
  });
});

/******
 * Latest
 *****/

var refreshLatest = function() {

  $("#latest .row-fluid").remove();

  $.getJSON(root + "/latest.json", function(json) {

    for(i = 0; i < json.length; i++) {
      var element = json[i];

      var elementHtml = "<div id='element-" + element.id + "' class='row-fluid message'><div class='row'><div class='span2'>";
      elementHtml += "<span class='label label-info'>" + element.hours + "</span></div><div class='span10'>";
      elementHtml += element.msg + "</div></div><div class='row align-right'>";

      if(element.is_favorite) {
        elementHtml += "<button class='favorite btn btn-warning' type='button'><i class='icon-white icon-star'></i></button> ";
      } else {
        elementHtml += "<button class='favorite btn' type='button'><i class='icon-star'></i></button> ";
      }

      elementHtml += "<button class='select btn btn-info' type='button'>Select</button></div></div>";
      $("#latest").prepend(elementHtml);
    }

  });

}

$("#latest button.select").live("click", function() {
  var parent = $(this).parents(".message");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'select'}, function() {
    refreshSelected();
  });
});

$("#latest .messageListSelector").live("click", function() {
  var parent = $(this).parents(".message");
  var msgId = parent.attr("id").split("-")[1];
  $.post(root + "/messages/" + msgId, {action: 'select', list_index: $(this).html()}, function() {
    refreshSelected();
  });
});

/******
 * Stats
 *****/

var refreshStats = function() {

  $.getJSON(root + "/stats.json", function(json) {

    $("#stats-messages").html(json.messages);
    $("#stats-selected_messages").html(json.selected_messages);
    $("#stats-selections").html(json.selections);
    $("#stats-favorites").html(json.favorites);

    Morris.Line({
        element: 'line',
        data: [
          { y: '2006', a: 100, b: 90 },
          { y: '2007', a: 75,  b: 65 },
          { y: '2008', a: 50,  b: 40 },
          { y: '2009', a: 75,  b: 65 },
          { y: '2010', a: 50,  b: 40 },
          { y: '2011', a: 75,  b: 65 },
          { y: '2012', a: 100, b: 90 }
      ],
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['Received', 'Selected']
    });
  });
}

/******
 * Main
 *****/

refreshRecent();
refreshSelected();
refreshFavorites();
refreshLatest();

setInterval(function(){refreshRecent()}, timeout * 1000);
setInterval(function(){$("#recents-timeout").html(parseInt($("#recents-timeout").html()) - 1)}, 1000);

var windowHeight = $(window).height();
var offset = 120;
$("#recents").css("max-height", windowHeight - offset);
$("#selected").css("max-height", windowHeight - offset);
$("#favorites").css("max-height", windowHeight - offset);
$("#all").css("max-height", windowHeight - offset);
