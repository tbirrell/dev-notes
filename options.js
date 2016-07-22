console.log("tap");

// Saves options to chrome.storage.sync.
function save_options() {
  console.log('tap');
  var baseurl = document.getElementById('baseurl').value;
  chrome.storage.sync.set({
    baseurl: baseurl
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'URL saved.';
  });
}

function restore_options() {
  chrome.storage.sync.get("baseurl" , function(items) {
    if (items.baseurl) {
      document.getElementById('baseurl').value = items.baseurl;
    }
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
  save_options);