///////////////////////////////////////////////////////////////////////////
// Code for showing & hiding sections
// Depends on: common.js
//
// Copyright 2007 Alexey Spiridonov
// Licensed under the GNU GPLv2.
// http://www.fsf.org/licensing/licenses/info/GPLv2.html
// 
// Call showElts(a, b, ...)  or hideElts(a, b, ...) to explicitly hide/show
// elements. Elements can be specified by id or by element object.
//
// Call initShowHide(hiding_link, self_link) to:
//
//   - Hide all divs that have class 'hide-by-default'.
//
//   - Add two types of links to the document: hiding links and self links.
//     Each arguments should specify the following properties (omit 
//     match_classes to avoid inserting a link type):
//
//       match_classes: { 'class-name1': true, 'class-name2': true, ... }
//       link_name: 'pick a name'
//       link_class: 'pick-a-class'
//
//     A link is added to every div that has one of the matching classes.
//     All links has the form <a class='pick-a-class' ...>pick a name</a>.
//
//     A hiding link is only added to sections (the matching div id has the
//     form 'BLAH_sec'). A hiding link is appended to the div with id
//     'BLAH'. It gets an onclick handler to hide 'BLAH_sec'.
//    
//     Self links are inserted at the beginning of the matching div.
//     They specify href="#MATCHING_DIV_ID". 
//     

// internal function; arguments are value, [elt/id, elt/id, ...]
function setDisplayForElts(value, elts) {
  for (var i = 0, len = elts.length; i < len; i++) {
    var elt = elts[i];
    var elt_type = typeof(elt);
    if (elt_type == 'string') {
      document.getElementById(elt).style.display = value;
    } else if (elt_type == 'object') {
      elt.style.display = value;
    }
  }
}

// These functions take a list of element ids (string) or 
// elements (object) as arguments.
function showElts() {
  setDisplayForElts('block', arguments);
}
function hideElts() {
  setDisplayForElts('none', arguments);
}

function eltHasMatchingClass(elt, class_table) {
  var classes = elt.className.split(' ');
  for (var i in classes) {
    if (class_table[classes[i]]) {
      return true;
    }
  }
  return false;
}

function makeLink(link_info) {
  var link = document.createElement('a');
  link.className = link_info.link_class;
  link.innerHTML = link_info.link_name;
  return link;
}

function initShowHide(hiding_link, self_link) {
  var i, len;
  var elt, elts;
  // All section names (divs ids ending in '_sec', minus the '_sec') go
  // here, with value = true.
  var sections = {};
  
  // Don't hide a section if it's requested in the URL.
  var cur_url_anchor = getCurUrlAnchor();
  var is_section, section_name;
  var link, link_parent;
  var makeHider = function (elt) {
      return function() { hideElts(elt); return true; };
    };
  elts = document.body.getElementsByTagName('div');
  for (i = 0, len = elts.length; i < len; i++) {
    elt = elts[i];
    is_section = (elt.id && elt.id.substr(elt.id.length - 4, 4) == '_sec');
    if (is_section) {
      section_name = elt.id.substr(0, elt.id.length - 4);
      sections[section_name] = true;
    }
    if (!(is_section && section_name == cur_url_anchor) &&
        eltHasMatchingClass(elt, { 'hide-by-default': true })) {
      hideElts(elt);
    }
    if (hiding_link.match_classes && 
        eltHasMatchingClass(elt, hiding_link.match_classes) && 
        is_section) {
      link_parent = document.getElementById(section_name);
      if (link_parent) {
        link = makeLink(hiding_link);
        // XXX: because this has no href, IE won't have a hover effect.
        addEvent(link, 'click', makeHider(elt));
        link_parent.appendChild(link);
      }
    }
    if (self_link.match_classes && 
        eltHasMatchingClass(elt, self_link.match_classes)) {
      if (elt.id) {
        link = makeLink(self_link);
        link.href = '#' + elt.id;
        elt.insertBefore(link, elt.firstChild);
      }
    }
  }

  // Add a show event to every hash-containing anchor.
  var makeShower = function (elt) {
      var sec_name = getTextPostHash(elt.href);
      if (sections[sec_name]) {
        return function() { showElts(sec_name + '_sec'); return true; };
      }
      return false;
    };
  addEventToInternalLinks("click", makeShower);    
}

