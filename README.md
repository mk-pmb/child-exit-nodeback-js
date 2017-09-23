
<!--#echo json="package.json" key="name" underline="=" -->
child-exit-nodeback
===================
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
Observe a child_process&#39;s &#39;exit&#39; and &#39;close&#39; events and
transform them into events with nodeback-style arguments (error, child).
<!--/#echo -->


API
---

This module exports one function:

### childExitNodeback(ee)

Given an EventEmitter `ee` (e.g. a child process object), subscribes to
the next `exit` and `close` event and re-emits them as described below.

Returns `ee`.

The re-emited events are named `exit:nodeback` and `close:nodeback`.
Their 2nd argument always is `ee`.

The 1st argument is either `false` or an Error object, depending on the
first two arguments of the original event interpreted as exit status
and kill signal, as a `child_process` would fire them.

The Error object will carry a reference to `ee` in its `src` property,
and at least one of the properties `retval` (the exit code) or `signal`.



Usage
-----

from [test.usage.js](test.usage.js):

<!--#include file="test.usage.js" start="  //#u" stop="  //#r"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="40" -->
```javascript
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
```
<!--/include-->


<!--#toc stop="scan" -->



Known issues
------------

* needs more/better tests and docs




&nbsp;


License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
