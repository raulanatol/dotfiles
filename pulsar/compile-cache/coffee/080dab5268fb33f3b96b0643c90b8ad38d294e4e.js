(function() {
  var IgnoredNames, Minimatch;

  Minimatch = null;

  module.exports = IgnoredNames = (function() {
    function IgnoredNames() {
      var error, i, ignoredName, ignoredNames, len, ref;
      this.ignoredPatterns = [];
      if (Minimatch == null) {
        Minimatch = require('minimatch').Minimatch;
      }
      ignoredNames = (ref = atom.config.get('core.ignoredNames')) != null ? ref : [];
      if (typeof ignoredNames === 'string') {
        ignoredNames = [ignoredNames];
      }
      for (i = 0, len = ignoredNames.length; i < len; i++) {
        ignoredName = ignoredNames[i];
        if (ignoredName) {
          try {
            this.ignoredPatterns.push(new Minimatch(ignoredName, {
              matchBase: true,
              dot: true
            }));
          } catch (error1) {
            error = error1;
            atom.notifications.addWarning("Error parsing ignore pattern (" + ignoredName + ")", {
              detail: error.message
            });
          }
        }
      }
    }

    IgnoredNames.prototype.matches = function(filePath) {
      var i, ignoredPattern, len, ref;
      ref = this.ignoredPatterns;
      for (i = 0, len = ref.length; i < len; i++) {
        ignoredPattern = ref[i];
        if (ignoredPattern.match(filePath)) {
          return true;
        }
      }
      return false;
    };

    return IgnoredNames;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvdHJlZS12aWV3L2xpYi9pZ25vcmVkLW5hbWVzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsU0FBQSxHQUFZOztFQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxzQkFBQTtBQUNYLFVBQUE7TUFBQSxJQUFDLENBQUEsZUFBRCxHQUFtQjs7UUFFbkIsWUFBYSxPQUFBLENBQVEsV0FBUixDQUFvQixDQUFDOztNQUVsQyxZQUFBLGdFQUFzRDtNQUN0RCxJQUFpQyxPQUFPLFlBQVAsS0FBdUIsUUFBeEQ7UUFBQSxZQUFBLEdBQWUsQ0FBQyxZQUFELEVBQWY7O0FBQ0EsV0FBQSw4Q0FBQTs7WUFBcUM7QUFDbkM7WUFDRSxJQUFDLENBQUEsZUFBZSxDQUFDLElBQWpCLENBQXNCLElBQUksU0FBSixDQUFjLFdBQWQsRUFBMkI7Y0FBQSxTQUFBLEVBQVcsSUFBWDtjQUFpQixHQUFBLEVBQUssSUFBdEI7YUFBM0IsQ0FBdEIsRUFERjtXQUFBLGNBQUE7WUFFTTtZQUNKLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsZ0NBQUEsR0FBaUMsV0FBakMsR0FBNkMsR0FBM0UsRUFBK0U7Y0FBQSxNQUFBLEVBQVEsS0FBSyxDQUFDLE9BQWQ7YUFBL0UsRUFIRjs7O0FBREY7SUFQVzs7MkJBYWIsT0FBQSxHQUFTLFNBQUMsUUFBRDtBQUNQLFVBQUE7QUFBQTtBQUFBLFdBQUEscUNBQUE7O1FBQ0UsSUFBZSxjQUFjLENBQUMsS0FBZixDQUFxQixRQUFyQixDQUFmO0FBQUEsaUJBQU8sS0FBUDs7QUFERjtBQUdBLGFBQU87SUFKQTs7Ozs7QUFqQlgiLCJzb3VyY2VzQ29udGVudCI6WyJNaW5pbWF0Y2ggPSBudWxsICAjIERlZmVyIHJlcXVpcmluZyB1bnRpbCBhY3R1YWxseSBuZWVkZWRcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSWdub3JlZE5hbWVzXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBpZ25vcmVkUGF0dGVybnMgPSBbXVxuXG4gICAgTWluaW1hdGNoID89IHJlcXVpcmUoJ21pbmltYXRjaCcpLk1pbmltYXRjaFxuXG4gICAgaWdub3JlZE5hbWVzID0gYXRvbS5jb25maWcuZ2V0KCdjb3JlLmlnbm9yZWROYW1lcycpID8gW11cbiAgICBpZ25vcmVkTmFtZXMgPSBbaWdub3JlZE5hbWVzXSBpZiB0eXBlb2YgaWdub3JlZE5hbWVzIGlzICdzdHJpbmcnXG4gICAgZm9yIGlnbm9yZWROYW1lIGluIGlnbm9yZWROYW1lcyB3aGVuIGlnbm9yZWROYW1lXG4gICAgICB0cnlcbiAgICAgICAgQGlnbm9yZWRQYXR0ZXJucy5wdXNoKG5ldyBNaW5pbWF0Y2goaWdub3JlZE5hbWUsIG1hdGNoQmFzZTogdHJ1ZSwgZG90OiB0cnVlKSlcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiRXJyb3IgcGFyc2luZyBpZ25vcmUgcGF0dGVybiAoI3tpZ25vcmVkTmFtZX0pXCIsIGRldGFpbDogZXJyb3IubWVzc2FnZSlcblxuICBtYXRjaGVzOiAoZmlsZVBhdGgpIC0+XG4gICAgZm9yIGlnbm9yZWRQYXR0ZXJuIGluIEBpZ25vcmVkUGF0dGVybnNcbiAgICAgIHJldHVybiB0cnVlIGlmIGlnbm9yZWRQYXR0ZXJuLm1hdGNoKGZpbGVQYXRoKVxuXG4gICAgcmV0dXJuIGZhbHNlXG4iXX0=
