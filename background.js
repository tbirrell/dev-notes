var id = chrome.contextMenus.create({
  "id": "devNoteMenu",
  "title": "Add New Note",
  "contexts": ["page"],
  "enabled": false
});

function enable_ext(tabId) {
  //change extention tooltip
  chrome.browserAction.setTitle({title:"Click to disable Devnotes for this domain", tabId: tabId});

  //notify content script to populate page with notes
  chrome.tabs.sendMessage(tabId, {note: "enabled"}, function(response) {
    console.log(response.status);
  });

  //enable context menu
  chrome.contextMenus.update('devNoteMenu', {
    "enabled": true
  });

  //colorize browser icon
  chrome.browserAction.setIcon({
    "path": "icon-48.png"
  });
}

function disable_ext(tabId) {
  //change extention tooltip
  chrome.browserAction.setTitle({title:"Click to enable Devnotes for this domain", tabId: tabId});

  //notify content script to remove notes
  chrome.tabs.sendMessage(tabId, {note: "disabled"}, function(response) {
    console.log(response.status);
  });

  //disable context menu
  chrome.contextMenus.update('devNoteMenu', {
    "enabled": false
  });

  //fade browser icon
  chrome.browserAction.setIcon({
    "path": "bw-48.png"
  });
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == id) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {note: "new"}, function(response) {
        console.log(response.status);
      });
    });
  }
});

chrome.cookies.set({
  url: 'http://office.fmaustin.com/',
  name: 'devnotes',
  value: 'enabled',
  domain: 'office.fmaustin.com'
});

chrome.webNavigation.onCompleted.addListener(function(page){
  console.log(page);
  chrome.cookies.get({
    url: page.url,
    name: 'devnotes'
  }, function(cookie){
    if (cookie) {
      console.log(cookie.value == 'enabled');
      if (cookie.value == 'enabled') {
        enable_ext(page.tabId);
      }
    }
  });
});

chrome.browserAction.onClicked.addListener(function(tab){
  var domain = tab.url.match(/^[\w-]+:\/{2,}\[?([\w\.:-]+)\]?(?::[0-9]*)?/)[1];
  var origin = tab.url.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];
  chrome.cookies.get({
    url: origin,
    name: 'devnotes'
  }, function(cookie){
    console.log(cookie);
    if (cookie) {
      //unset cookie
      chrome.cookies.remove({
        url: origin,
        name: 'devnotes',
      }, function(cookie){
        disable_ext(tab.id);
      });
    } else {
      //set cookie
      chrome.cookies.set({
        url: origin,
        name: 'devnotes',
        value: 'enabled',
        domain: domain
      }, function(cookie){
        enable_ext(tab.id);
      });
    }
  });
});