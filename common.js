//////////////////////////////////////////////////////////////////////////
// Common code: used by yellow-fade.js, show-hide.js
//
// Copyright 2007 Alexey Spiridonov
// Licensed under the GNU GPLv2.
// http://www.fsf.org/licensing/licenses/info/GPLv2.html
//

function textHasHash(str) {
  var hash_index = str.indexOf('#');
  return hash_index > -1 && hash_index < str.length - 1;
}
function getTextPostHash(str) {
  return str.substring(str.indexOf('#') + 1, str.length);
}

function getCurUrlAnchor() {
 var url = unescape(window.location);
  if (textHasHash(url)) {
    return getTextPostHash(url);
  }
  return false;
}

function addEvent(obj, eventType, fn) {
  if (obj.addEventListener) {
    obj.addEventListener(eventType, fn, false);
    return true;
  } else if (obj.attachEvent) {
    return obj.attachEvent("on" + eventType, fn);
  }
  return false;
}

function addEventToInternalLinks(eventType, eventMaker) {
  var anchors = document.body.getElementsByTagName('a');
  var eventFunc;
  for (var i = 0; i < anchors.length; i++) {
    if (textHasHash(anchors[i].href)) {
      eventFunc = eventMaker(anchors[i]);
      if (eventFunc) {
        addEvent(anchors[i], eventType, eventFunc);
      }
    }
  }
}
