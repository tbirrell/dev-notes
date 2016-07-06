function setCSS(selector, top, left) {
  var winWidth = $(window).width();
  var leftWidth = left.substring(0, left.length - 2);

  $(selector).css('top', top);
  $(selector).css('position', 'absolute');

  if (winWidth < leftWidth) {
    left = winWidth - 300;
    left = left + 'px';
  console.log(left);
  }
  $(selector).css('left', left);
}

function ajaxPost(selector) {
  $.ajax({
    url: window.location.protocol + '//timothy.office.fmaustin.com/devnotes/api.php',
    method: 'POST',
    data: {
      api: 'post',
      id: selector.attr('id'),
      top: selector.css('top'),
      left: selector.css('left'),
      text: selector.text(),
      url: window.location.href
    },
    success: function(msg){
      console.log(msg);
    }
  });
}
function ajaxGet() {
  $.ajax({
    url: window.location.protocol + '//timothy.office.fmaustin.com/devnotes/api.php',
    method: 'GET',
    data: {
      api: 'get',
      url: window.location.href
    },
    success: function(msg){
      populate(msg);
    }
  });
}

function populate(json) {
  $.each($.parseJSON(json), function() {
    $('body').append('<div class="dev-note" id="' + this.id + '">' + this.textval + '</div>');
    var note = $('#' + this.id);
    setCSS(note, this.topval, this.leftval);
    $(note).draggable();
  });
}

function addNew() {
  var newId = new Date().getTime()
  $('body').append('<div class="dev-note new-note" id="' + newId + '">New Note</div>');
  var note = $('#' + newId);
  setCSS(note, '100px', '100px');
  $(note).css('position', 'fixed');
  $(note).draggable();
}

function deleteNote(noteId) {
  $.ajax({
    url: window.location.protocol + '//timothy.office.fmaustin.com/devnotes/api.php',
    method: 'POST',
    data: {
      api: 'delete',
      id: noteId,
    },
    success: function(res) {
      console.log(res);
    }
  });
}

$(document).on('dblclick', '.dev-note', function(){
  var text = $(this).text();
  $(this).text('');
  $(this).append('<textarea class="edit">' + text + '</textarea>');
  $('.edit').focus();
});

$(document).on('blur', 'textarea.edit', function(){
  var text = $(this).val();
  if (text != '') {
    var parent = $(this).parent().attr('id');
    $(this).remove();
    $('#' + parent).text(text);
  } else {
    deleteNote($(this).parent().attr('id'));
    $(this).parent().remove();
  }
});

$(window).bind('beforeunload', function() {
  $.each($('.dev-note'), function() {
    ajaxPost($(this));
  });
});

$(document).on('mouseup', '.dev-note', function(){
  if ($(this).css('position') == 'fixed') {
    $(this).css('position', 'absolute')
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  console.log("tap");
  if (request.note == "new") {
    addNew();
  } else if (request.note == "enabled") {
    ajaxGet();
  } else if (request.note == "disabled") {
    $.each($('.dev-note'), function() {
      $(this).remove();
    });
  }
  console.log(request);
  sendResponse({status: "recived"});
});