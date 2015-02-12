var assert = require('assert');
var fs = require('fs');
var path = require('path');
var CssScanner = require('../css-scanner');

function readFileSync(filepath) {
  return fs.readFileSync(path.join(__dirname, filepath), { encoding: 'utf8' });
}


describe('rule', function() {
  it('normal', function() {
    var content = readFileSync('fixed/rule.css');
    var css = new CssScanner(content);
    var rules = [];

    css.on('rule', function(rule, type) {
      rules.push(rule);
    });

    css.scanner();

    assert.equal(rules.length, 2);
    assert.deepEqual({
      selector: ['html'],
      declaration: [ { property: 'font-family', value: 'sans-serif' }]
    }, rules[0]);
  });

  it('Miss semicolon', function() {
    var code = 
        'a{color:red ' + '\n' +
        'with:300}';
    var css = new CssScanner(code);

    assert.throws(
      function() {
        css.scanner();
      },
      function(err) {
        if (/;/.test(err)) {
          return true;
        }
      }
    );
  });

  it('ending without semicolon', function() {
      var code = 'a{color:red;width:300}';
      var css = new CssScanner(code);

      css.scanner();
  });

  it('selector', function() {
    var code = '{color:red;width:300}';
    var css = new CssScanner(code);

    assert.throws(
      function() {
        css.scanner();
      },
      function(err) {
        if (/selector/.test(err)) {
          return true;
        }
      }
    );
  });

  it('Miss {', function() {
    var code = 'acolor:red;width:300}';
    var css = new CssScanner(code);

    assert.throws(
      function() {
        css.scanner();
      },
      function(err) {
        if (/\{/.test(err)) {
          return true;
        }
      }
    );
  });

  it('Miss }', function() {
    var code = 'a{color:red;width:300;';
    var css = new CssScanner(code);

    assert.throws(
      function() {
        css.scanner();
      },
      function(err) {
        if (/\}/.test(err)) {
          return true;
        }
      }
    );
  });
});