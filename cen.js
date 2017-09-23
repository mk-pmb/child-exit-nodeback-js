/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';


var EX = function (ch) {
  if (!ch) { return ch; }
  if (!ch.once) { return ch; }
  if (!ch.emit) { return ch; }
  EX.observe(ch, 'exit');
  EX.observe(ch, 'close');
  return ch;
};


function srcDeco(x, e) {
  if (x) { x.src = e; }
  return x;
}


EX.observe = function (e, v, c) {
  if (!c) { c = EX.checkError; }
  function h() { e.emit(v, srcDeco(c.apply(this, arguments), e), e); }
  e.once(v, h);
  v += ':nodeback';
};


EX.checkError = function (c, s) {
  var e = (((s !== null) && new Error('Killed by signal ' + s))
    || ((c !== 0) && new Error('Exit status ' + c))
    || false);
  if (e) {
    e.retval = c;
    e.signal = s;
  }
  return e;
};








module.exports = EX;
