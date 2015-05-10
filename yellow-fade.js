///////////////////////////////////////////////////////////////////////////
// Code to do yellow fades whenever the user clicks a named anchor link.
// Depends on: common.js
//
// Copyright 2007 Alexey Spiridonov
// Licensed under the GNU GPLv2.
// http://www.fsf.org/licensing/licenses/info/GPLv2.html
// 
// Call initFade to attach a fade handler to all #name links on the page.
// Call fade(element_id) to perform a fade on that element.
// Fade colors are hard-coded because I don't need anything better yet.
// 
// This code was largely inspired by:
//   www.yourtotalsite.com/archives/javascript/yellowfade_technique_for/Default.aspx
//   http://www.axentric.com/aside/fat/

function setBackgroundColor(id, color) {
  document.getElementById(id).style.backgroundColor = color;
}

function fade(id) {
  // Timing of the fade
  var i;
  var msec = 3000; // length of fade in milliseconds
  var fps = 30; // frames per second
  var period = 1000/fps; // interval between frames
    
  // Fade colors; the elements of the arrays are: [from, to]
  // XXX: 'to' is hard-coded because it's a pain to portably
  // get the background color of an element.
  // XXX: Hex conversion is done to make it easier to switch to
  // auto-detecting the background color later on.
  var colors_str = ["#ffdd55", "#ffffff"]; 
  var colors = []; // [r, g, b], filled in by the loop below
  for (var j in colors_str) {
    var c = [];
    var str = colors_str[j];
    for (i = 0; i < 3; ++i) {
      c[i] = parseInt(str.substr(2*i + 1, 2), 16);
    }
    colors[j] = c;
  }
  
  var num_frames = msec/period;
  for (var f = 0; f < num_frames; ++f) {
    var t = f/(num_frames - 1);
    var color = "#";
    for (i = 0; i < 3; ++i) {
      var digits = Math.round((1 - t)*colors[0][i] + t*colors[1][i]);
      digits = digits.toString(16);
      if (digits.length == 1) {
        digits = "0" + digits;
      }
      color += digits;
    }
    setTimeout("setBackgroundColor('" + id + "', '" +
                                        color + "');", f*period);
  }
  
}

function initFade() {
  // Do a fade if the URL specifies a fade.
  var anchor = getCurUrlAnchor();
  if (anchor && document.getElementById(anchor)) {
    fade(anchor);
  }

  // Add a fade event to every hash-containing anchor.
  var makeFader = function (elt) {
      return function() { fade(getTextPostHash(elt.href)); return true; };
    };
  addEventToInternalLinks("click", makeFader);
}
