///////////////////////////////////////////////////////////////////////////
// Code to implement slowly changing wavy borders.
//
// Copyright 2007 Alexey Spiridonov
// Licensed under the GNU GPLv2.
// http://www.fsf.org/licensing/licenses/info/GPLv2.html
// 
// Performance, as measured on a 2Ghz Pentium M, Linux Firefox 1.5 over 60
// seconds:
//   wlen wave_res step_time %cpu
//   30   5        1000      7.7
//   30   4        1000      6.6
//   30   2        1000      4.6
//   30   4        2000      3.4
// So, in short, if you make the animation fast enough to be visible, you'll
// be hosing people's CPUs. But, visible animation isn't the point: this 
// is supposed to be cute without distracting from the content.

// essential wave parameters 
var wlen = 30; // amount of wave to render (30 -> ~10 half-periods)
var wave_res = 4; // smoothness of the curve (# points per unit of wlen)
// time-related parameters: wave_time controls the animation;
// it is incremented by 1/time_res every step.
var wave_time = 0; // control parameter
var time_res = 10; // smoothness of animation
var step_time = 2000; // time between steps in milliseconds
var max_steps = (240*1000)/step_time; // stop after 4 minutes -- conserve power
// the rendered wave is actually composed of two, one small and one big.
// relation of small wave to big wave (values for the big wave would be 1)
var smallwave_ratio = 2.413; // wavelength ratio (increase to shorten)
var smallwave_size = 0.5; // amplitude ratio (increase for bigger swings)
// speeds of the waves; positive means up, negative -- down the screen
var bigwave_speed = 6.72; // speed of big wave  
var smallwave_speed = -3.312; // speed small wave
// fade in parameters: the waves are multiplied by parameter fadein
// it starts at zero, and grows by fadein_speed every step until reaching
// fadein_max.
var fadein = 0;
var fadein_speed = 0.01;
var fadein_max = 0.5;
// some (probably useless) pre-computation
var wlensqr = (wlen)*(wlen); // wlen squared
var wave_interval = 1/wave_res; // change in t that corresponds to one bar
var time_interval = 1/time_res; // change in t that corresponds to one bar

// structure that records left & right bar heights, and 
// the tiny bar elements that are used in the animation.
var border = {l: {}, r: {}};
// number of tiny bar elements used in the animation. 
// this number is set to -1 to detect whether one animation is
// running already.
var num_bars = -1;

function drawWave() {
  var lcur, lprev, rcur, rprev;  // values of the wave
  var lwidth, rwidth;
  var scale;
  var bigwave, smallwave;
  var i = -1;
  for (var t = -wave_interval; i < num_bars; ++i, t += wave_interval) {
    // Compute the two wave components.
    bigwave = Math.sin(t + wave_time/bigwave_speed) + 1 + smallwave_size;
    smallwave = smallwave_size*Math.cos(smallwave_ratio*t + 
                                        wave_time/smallwave_speed);
    
    // Make the left border and right border waves a little different.                                    
    lcur = bigwave + smallwave;
    rcur = bigwave - smallwave;
    
    // Scale by an upside-down parabola going from a maximum of 1 at the
    // beginning of the wave, down to 0 again at the end.
    scale = (wlensqr - t*t)/wlensqr;
    // Also scale by a "fade in" factor.
    lcur *= fadein*scale;
    rcur *= fadein*scale;
    
    // Update the rendering.
    if (i >= 0) {
      if (lprev <= lcur) {
        lwidth = '0em ' + (lcur - lprev) + 'em ' + 
                 border.l.bar_height + 'em ' + lprev + 'em';
      } else {
        lwidth = border.l.bar_height + 'em ' + (lprev - lcur) + 'em ' + 
                 '0em ' + lcur + 'em';
      }
      if (rprev <= rcur) {
        rwidth = '0em ' + rprev + 'em ' + 
                 border.r.bar_height + 'em ' + (rcur - rprev) + 'em';
      } else {
        rwidth = border.r.bar_height + 'em ' + rcur + 'em ' + 
                 '0em ' + (rprev - rcur) + 'em';
      }
      border.l.bars[i].style.borderWidth = lwidth;
      border.r.bars[i].style.borderWidth = rwidth;
    }
    lprev = lcur;
    rprev = rcur;
  }
  
  if (fadein < fadein_max) {
    fadein += fadein_speed;
  }
  wave_time += time_interval;
  if (max_steps > 0) {
    max_steps -= 1;
    setTimeout(drawWave, step_time);
  }
}
/* The initial Octave (free MATLAB analog) code was:
w=30; r=10; hws=((w/2)^2); t=([1:(w*r)]/r); f=[4 0 t];
s=((hws-(t-(w/2)).^2)/hws); 
for i=1:10000; 
  f(3:w*r+2) = (cos(t) + 0.5*cos(1.31*t+i/30)).*s + (1.5*s); 
  plot(f);
endfor */

function initWave() {
  // An animation is running already;
  if (num_bars != -1) {
    return;
  }
  
  num_bars = wlen*wave_res;
  
  var i;
  for (var side in border) {
    var sidebar = document.getElementById(side + "sidebar");
    var sheight = sidebar.style.height;
    if (sheight.substr(sheight.length - 2, 2) != 'em') {
      alert('this page is broken (expected height in ems)');
    }
    border[side].bar_height = 
        parseFloat(sheight.substr(0, sheight.length - 2)) / num_bars;
   
    var str = "";  
    for (i = 0; i < num_bars; ++i) {
      str += '<div id="' + side + 'border_bar' + i + 
             '"class="border ' + side + 'border" style="' +
             'border-width: 0em 0em ' + border[side].bar_height + 
             'em 0em;"></div>';
    }
    sidebar.innerHTML = str;
    border[side].bars = [];
    for (i = 0; i < num_bars; ++i) {
      border[side].bars[i] = 
          document.getElementById(side + "border_bar" + i);
    }
  }

  drawWave();
}
