/**
 * Sets CSS as defined by params
 */
function setCSS(selector, top, left) {
  var winWidth = $(window).width(); //get window width
  var leftWidth = left.substring(0, left.length - 2); //get int of left

  $(selector).css('top', top); // set top
  $(selector).css('position', 'absolute'); // set postion

  // if location is off right side of screen, bring it into view.
  if (winWidth < leftWidth) {
    left = winWidth - 300;
    left = left + 'px';
  }

  $(selector).css('left', left); //set left
}


/**
 * Set URL for ajax
 */
var baseurl;
chrome.storage.sync.get("baseurl" , function(items) {
  baseurl = items.baseurl;
});


/**
 * Sends note to API
 */
function ajaxPost(el) {
  $.ajax({
    url: baseurl + '/page/' + md5(window.location.href) + '/note/' + el.attr('id'),
    method: 'PUT',
    data: {
      top: el.css('top'),
      left: el.css('left'),
      text: el.text(),
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
    url: baseurl + '/page/' + md5(window.location.href),
    method: 'GET',
    success: function(msgs){
      console.log(msgs);
      populate(msgs);
    }
  });
}

/**
 * Cycles through note data from API and displays them
 */
function populate(msgs) {
  $.each(msgs, function() {
    $('body').append('<div class="dev-note" id="' + this.timestamp + '">' + this.text + '</div>');
    var note = $('#' + this.timestamp);
    setCSS(note, this.top, this.left);
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
    url: baseurl + '/page/' + md5(window.location.href) + '/note/' + noteId,
    method: 'DELETE',
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
    var topval = $(this).offset().top;
    $(this).css('position', 'absolute');
    $(this).css('top', topval);
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
