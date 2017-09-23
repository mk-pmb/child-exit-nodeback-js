/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = module.exports, equal = require('equal-pmb'),
  async = require('async'),
  arSlc = Array.prototype.slice;

EX.tests = [];
function addTest(f) { EX.tests.push(f); }

EX.log = [];

function arg2str(a) {
  if (!a) { return a; }
  if (typeof a !== 'object') { return a; }
  var d = a.constructor.name;
  if (a.message) { d += ' "' + a.message + '"'; }
  //if (a.pid) { d += ' #' + a.pid; }
  return '{' + d + '}';
}

EX.log.args = function (topic) {
  return function () {
    EX.log.push([topic].concat(arSlc.call(arguments).map(arg2str)));
  };
};
EX.log.want = [];
EX.log.expect = function (add) { EX.log.want = EX.log.want.concat(add); };



(function readmeDemo(test) {
  //#u
  var childExitNodeback = require('child-exit-nodeback'),
    spawn = require('child_process').spawn;
  function spawnNodeEval(js) { return spawn(process.execPath, ['-e', js]); }

  test.add(function () {
    var child = spawnNodeEval('// no-op');
    equal(typeof child.pid, 'number');
    childExitNodeback(child);
    child.once('exit:nodeback',  test.log.args('no-op exit'));
    child.once('close:nodeback', test.log.args('no-op close'));
    test.log.expect([
      [ 'no-op exit',  false, '{ChildProcess}' ],
      [ 'no-op close', false, '{ChildProcess}' ],
    ]);
  });

  test.add(function () {
    var child = childExitNodeback(spawnNodeEval('process.exit(42)'));
    equal(typeof child.pid, 'number');
    child.once('exit:nodeback',  test.log.args('42 exit'));
    child.once('close:nodeback', test.log.args('42 close'));
    test.log.expect([
      [ '42 exit',  '{Error "Exit status 42"}', '{ChildProcess}' ],
      [ '42 close', '{Error "Exit status 42"}', '{ChildProcess}' ],
    ]);
  });

  test.add(function () {
    var child = spawnNodeEval('setTimeout(Function, 1e4);' +
      'process.kill(process.pid, "SIGHUP");');
    childExitNodeback(child);
    child.once('exit:nodeback',  test.log.args('hup exit'));
    child.once('close:nodeback', test.log.args('hup close'));
    test.log.expect([
      [ 'hup exit',  '{Error "Killed by signal SIGHUP"}', '{ChildProcess}' ],
      [ 'hup close', '{Error "Killed by signal SIGHUP"}', '{ChildProcess}' ],
    ]);
  });
  //#r

  async.eachSeries(EX.tests, function (t, nx) {
    equal.lists(EX.log, EX.log.want);
    t();
    setTimeout(nx, 500);
  }, function (asyncErr) {
    if (asyncErr) { throw asyncErr; }
    equal.lists(EX.log, EX.log.want);
    console.log("+OK tests passed.");
  });
}({ add: addTest, log: EX.log }));











//= "+OK tests passed."
