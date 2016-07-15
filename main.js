/**
 * Sets CSS as defined by params
 */
function setCSS(selector, top, left) {
  var winWidth = $(window).width(); //get window width
  var leftWidth = left.substring(0, left.length - 2); //get int of leftval

  $(selector).css('top', top); // set topval
  $(selector).css('position', 'absolute'); // set postion

  // if location is off right side of screen, bring it into view.
  if (winWidth < leftWidth) {
    left = winWidth - 300;
    left = left + 'px';
  }

  $(selector).css('left', left); //set leftval
}

/**
 * Sends note to API
 */
function ajaxPost(selector) {
  $.ajax({
    url: window.location.protocol + '//devnotes.timothy.office.fmaustin.com',
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

/**
 * Gets notes from API
 */
function ajaxGet() {
  $.ajax({
    url: window.location.protocol + '//devnotes.timothy.office.fmaustin.com',
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

/**
 * Cycles through note data from API and displays them
 */
function populate(json) {
  $.each(json, function() {
    $('body').append('<div class="dev-note" id="' + this.id + '">' + this.textval + '</div>');
    var note = $('#' + this.id);
    setCSS(note, this.topval, this.leftval);
    $(note).draggable();
  });
}

/**
 * Creates a New Note and displays it
 */
function addNew() {
  var newId = new Date().getTime()
  $('body').append('<div class="dev-note new-note" id="' + newId + '">New Note</div>');
  var note = $('#' + newId);
  setCSS(note, '100px', '100px');
  $(note).css('position', 'fixed');
  $(note).draggable();
}

/**
 * Send notice to API to delete note
 */
function deleteNote(noteId) {
  $.ajax({
    url: window.location.protocol + '//devnotes.timothy.office.fmaustin.com',
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

/**
 * Listens for double click and enabled editing of note
 */
$(document).on('dblclick', '.dev-note', function(){
  var text = $(this).text(); // save text
  $(this).text(''); // remove text from display
  $(this).append('<textarea class="edit">' + text + '</textarea>'); //insert textarea with saved text
  $('.edit').focus(); //focus on text area
});

/**
 * Sets note back to display mode when finished editing
 */
$(document).on('blur', 'textarea.edit', function(){
  var text = $(this).val(); // save text
  if (text != '') { //if note is not empty, display
    var parent = $(this).parent().attr('id'); // find parent (note body)
    $(this).remove(); //remove textarea
    $('#' + parent).text(text); //add text to note body
  } else { // if note is blank, delete it
    deleteNote($(this).parent().attr('id')); //send delete notice to API
    $(this).parent().remove(); //remove from page
  }
});

/**
 * Sends all note data to API when user leaves site
 */
$(window).bind('beforeunload', function() {
  $.each($('.dev-note'), function() {
    ajaxPost($(this));
  });
});

/**
 * Sets new notes to position absolute
 */
$(document).on('mouseup', '.dev-note', function(){
  if ($(this).css('position') == 'fixed') {
    $(this).css('position', 'absolute')
  }
});

/**
 * Listens for messages from extention status
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if (request.note == "new") { //context menu
    addNew();
  } else if (request.note == "enabled") { //browser action
    ajaxGet();
  } else if (request.note == "disabled") { //browser action
    $.each($('.dev-note'), function() {
      $(this).remove();
    });
  }
  sendResponse({status: "recived"});
});