var assert = require('assert');
var fs = require('fs');
var path = require('path');
var CssScanner = require('../css-scanner');


function readFileSync(filepath) {
  return fs.readFileSync(path.join(__dirname, filepath), { encoding: 'utf8' });
}

describe('@rule', function() {
  describe('@media', function() {
    it ('Normal', function() {
      var content = readFileSync('fixed/atmedia.css')
      var css = new CssScanner(content);
      var rules = [];

      css.on('rule', function (value, type) {
        rules.push(value);
        assert.equal(type, '@media');
      });

      css.on('@media', function(name) {
        if (name) {
          assert.equal('(max-device-width: 480px) and (orientation: landscape)', name);
        }
      });

      css.scanner();
      assert.equal(rules.length, 2);
    });

    it('Miss name', function() {
      var code = '@media {  } ';
      var css = new CssScanner(code);

      assert.throws(
        function() {
          css.scanner();
        },
        function(err) {
          if (/@media.*name/.test(err)) {
            return true;
          }
        }
      );
    });

    it('Miss {', function() {
      var code = '@media (max-width: 480px)';
      var css = new CssScanner(code);

      assert.throws(
        function() {
          css.scanner();
        },
        function(err) {
          assert.equal(css._line,1);
          assert.equal(css._column, code.length + 1);

          if (/\{/.test(err)) {
            return true;
          }
        }
      );
    });

    it('Miss }', function() {
      var code = '@media (max-width: 480px) { body { color: red }';
      var css = new CssScanner(code);

      assert.throws(
        function() {
          css.scanner();
        },
        function(err) {
          assert.equal(css._line,1);
          assert.equal(css._column, code.length + 1);

          if (/\}/.test(err)) {
            return true;
          }
        }
      );
    });
  });
  
  describe('@keyframes', function() {
    it ('Normal', function() {
      var content = readFileSync('fixed/atkeyframes.css')
      var css = new CssScanner(content);

      css.on('rule', function(rule) {
        rule.selector.forEach(function(item) {
          assert(item === 'from' || item === 'to');
        });
      });

      css.on('@keyframes', function(name) {
        if (name) {
          assert(name.name);
        }
      });

      css.scanner();
    });

    it('Miss name', function() {
      var code = '@-webkit-keyframes {}';
      var css = new CssScanner(code);

      assert.throws(
        function() {
          css.scanner();
        },
        function(err) {
          if (/@keyframes.*name/.test(err)) {
            return true;
          }
        }
      );
    });

    it('Miss {', function() {
      var code = '@media (max-width: 480px)';
      var css = new CssScanner(code);

      assert.throws(
        function() {
          css.scanner();
        },
        function(err) {
          assert.equal(css._line,1);
          assert.equal(css._column, code.length + 1);

          if (/\{/.test(err)) {
            return true;
          }
        }
      );
    });

    it('Miss }', function() {
      var code = '@media (max-width: 480px) { body { color: red }';
      var css = new CssScanner(code);

      assert.throws(
        function() {
          css.scanner();
        },
        function(err) {
          assert.equal(css._line,1);
          assert.equal(css._column, code.length + 1);

          if (/\}/.test(err)) {
            return true;
          }
        }
      );
    });
  });

  describe('@import', function() {
    it ('Normal', function() {
      var content = '@import url("bluish.css") projection, tv;';
      var css = new CssScanner(content);
      
      css.on('@import', function(name) {
        assert.equal(name, 'url("bluish.css") projection, tv')
      });

      css.scanner();
    });

    it('Miss name', function() {
      var code = '@import ';
      var css = new CssScanner(code);

      assert.throws(
        function() {
          css.scanner();
        },
        function(err) {
          if (/@import.*name/.test(err)) {
            return true;
          }
        }
      );
    });

    it('Miss ;', function() {
      var code = '@import url("bluish.css") projection, tv';
      var css = new CssScanner(code);

      assert.throws(
        function() {
          css.scanner();
        },
        function(err) {
          if (/@import.*;/.test(err)) {
            return true;
          }
        }
      );
    });
  });

  describe('@@charset', function() {
    it('Normal', function() {
      var content = '@charset "UTF-8";';
      var css = new CssScanner(content);
      
      css.on('@charset', function(name) {
        assert.equal(name, 'UTF-8');
      });

      css.scanner();
    });

    it('a space', function() {
      var code = ' @charset "UTF-8";';
      var css = new CssScanner(code);

      assert.throws(
        function() {
          css.scanner();
        },
        function(err) {
          if (/@charset.*space/.test(err)) {
            return true;
          }
        }
      );
    });

    it('first element', function() {
      var content = 'a {} @charset "UTF-8";';
      var css = new CssScanner(content);
      
      assert.throws(
        function() {
          css.scanner();
        },
        function(err) {
          if (/@charset.*element/.test(err)) {
            return true;
          }
        }
      );
    });

    it('without quote', function() {
      var content = '@charset UTF-8;';
      var css = new CssScanner(content);
      
      assert.throws(
        function() {
          css.scanner();
        },
        function(err) {
          if (/@charset/.test(err)) {
            return true;
          }
        }
      );
    });

    it('without semicolon', function() {
      var content = '@charset "UTF-8"';
      var css = new CssScanner(content);
      
      assert.throws(
        function() {
          css.scanner();
        },
        function(err) {
          if (/@charset/.test(err)) {
            return true;
          }
        }
      );
    });
  });

  describe('@font-face', function() {
    it('Normal', function() {
      var content = readFileSync('fixed/atfontface.css');
      var css = new CssScanner(content);

      css.on('@rule', function(rule) {
        assert.deepEqual(rule, {
          selector: ['@font-face'],
          declaration: [{
            property: 'font-family',
            value: 'MyHelvetica'
          }, {
            property: 'src',
            value: 'local("Helvetica Neue Bold"), local("HelveticaNeue-Bold"), url(MgOpenModernaBold.ttf)'
          }, {
            property: 'font-weight',
            value: 'bold'
          }]
        });
      });

      css.scanner();
    });
  });
});