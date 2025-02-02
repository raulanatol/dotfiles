(function() {
  var CompositeDisposable, Range, SelectNext, _, ref;

  _ = require('underscore-plus');

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Range = ref.Range;

  module.exports = SelectNext = (function() {
    SelectNext.prototype.selectionRanges = null;

    function SelectNext(editor) {
      this.editor = editor;
      this.selectionRanges = [];
    }

    SelectNext.prototype.findAndSelectNext = function() {
      if (this.editor.getLastSelection().isEmpty()) {
        return this.selectWord();
      } else {
        return this.selectNextOccurrence();
      }
    };

    SelectNext.prototype.findAndSelectAll = function() {
      if (this.editor.getLastSelection().isEmpty()) {
        this.selectWord();
      }
      return this.selectAllOccurrences();
    };

    SelectNext.prototype.undoLastSelection = function() {
      this.updateSavedSelections();
      if (this.selectionRanges.length < 1) {
        return;
      }
      if (this.selectionRanges.length > 1) {
        this.selectionRanges.pop();
        this.editor.setSelectedBufferRanges(this.selectionRanges);
      } else {
        this.editor.clearSelections();
      }
      return this.editor.scrollToCursorPosition();
    };

    SelectNext.prototype.skipCurrentSelection = function() {
      var lastSelection;
      this.updateSavedSelections();
      if (this.selectionRanges.length < 1) {
        return;
      }
      if (this.selectionRanges.length > 1) {
        lastSelection = this.selectionRanges.pop();
        this.editor.setSelectedBufferRanges(this.selectionRanges);
        return this.selectNextOccurrence({
          start: lastSelection.end
        });
      } else {
        this.selectNextOccurrence();
        this.selectionRanges.shift();
        if (this.selectionRanges.length < 1) {
          return;
        }
        return this.editor.setSelectedBufferRanges(this.selectionRanges);
      }
    };

    SelectNext.prototype.selectWord = function() {
      var clearWordSelected, disposables, lastSelection;
      this.editor.selectWordsContainingCursors();
      lastSelection = this.editor.getLastSelection();
      if (this.wordSelected = this.isWordSelected(lastSelection)) {
        disposables = new CompositeDisposable;
        clearWordSelected = (function(_this) {
          return function() {
            _this.wordSelected = null;
            return disposables.dispose();
          };
        })(this);
        disposables.add(lastSelection.onDidChangeRange(clearWordSelected));
        return disposables.add(lastSelection.onDidDestroy(clearWordSelected));
      }
    };

    SelectNext.prototype.selectAllOccurrences = function() {
      var range;
      range = [[0, 0], this.editor.getEofBufferPosition()];
      return this.scanForNextOccurrence(range, (function(_this) {
        return function(arg) {
          var range, stop;
          range = arg.range, stop = arg.stop;
          return _this.addSelection(range);
        };
      })(this));
    };

    SelectNext.prototype.selectNextOccurrence = function(options) {
      var range, ref1, startingRange;
      if (options == null) {
        options = {};
      }
      startingRange = (ref1 = options.start) != null ? ref1 : this.editor.getSelectedBufferRange().end;
      range = this.findNextOccurrence([startingRange, this.editor.getEofBufferPosition()]);
      if (range == null) {
        range = this.findNextOccurrence([[0, 0], this.editor.getSelections()[0].getBufferRange().start]);
      }
      if (range != null) {
        return this.addSelection(range);
      }
    };

    SelectNext.prototype.findNextOccurrence = function(scanRange) {
      var foundRange;
      foundRange = null;
      this.scanForNextOccurrence(scanRange, function(arg) {
        var range, stop;
        range = arg.range, stop = arg.stop;
        foundRange = range;
        return stop();
      });
      return foundRange;
    };

    SelectNext.prototype.addSelection = function(range) {
      var reversed, selection;
      reversed = this.editor.getLastSelection().isReversed();
      selection = this.editor.addSelectionForBufferRange(range, {
        reversed: reversed
      });
      return this.updateSavedSelections(selection);
    };

    SelectNext.prototype.scanForNextOccurrence = function(range, callback) {
      var nonWordCharacters, selection, text;
      selection = this.editor.getLastSelection();
      text = _.escapeRegExp(selection.getText());
      if (this.wordSelected) {
        nonWordCharacters = atom.config.get('editor.nonWordCharacters');
        text = "(^|[ \t" + (_.escapeRegExp(nonWordCharacters)) + "]+)" + text + "(?=$|[\\s" + (_.escapeRegExp(nonWordCharacters)) + "]+)";
      }
      return this.editor.scanInBufferRange(new RegExp(text, 'g'), range, function(result) {
        var prefix;
        if (prefix = result.match[1]) {
          result.range = result.range.translate([0, prefix.length], [0, 0]);
        }
        return callback(result);
      });
    };

    SelectNext.prototype.updateSavedSelections = function(selection) {
      var i, len, results, s, selectionRange, selections;
      if (selection == null) {
        selection = null;
      }
      selections = this.editor.getSelections();
      if (selections.length < 3) {
        this.selectionRanges = [];
      }
      if (this.selectionRanges.length === 0) {
        results = [];
        for (i = 0, len = selections.length; i < len; i++) {
          s = selections[i];
          results.push(this.selectionRanges.push(s.getBufferRange()));
        }
        return results;
      } else if (selection) {
        selectionRange = selection.getBufferRange();
        if (this.selectionRanges.some(function(existingRange) {
          return existingRange.isEqual(selectionRange);
        })) {
          return;
        }
        return this.selectionRanges.push(selectionRange);
      }
    };

    SelectNext.prototype.isNonWordCharacter = function(character) {
      var nonWordCharacters;
      nonWordCharacters = atom.config.get('editor.nonWordCharacters');
      return new RegExp("[ \t" + (_.escapeRegExp(nonWordCharacters)) + "]").test(character);
    };

    SelectNext.prototype.isNonWordCharacterToTheLeft = function(selection) {
      var range, selectionStart;
      selectionStart = selection.getBufferRange().start;
      range = Range.fromPointWithDelta(selectionStart, 0, -1);
      return this.isNonWordCharacter(this.editor.getTextInBufferRange(range));
    };

    SelectNext.prototype.isNonWordCharacterToTheRight = function(selection) {
      var range, selectionEnd;
      selectionEnd = selection.getBufferRange().end;
      range = Range.fromPointWithDelta(selectionEnd, 0, 1);
      return this.isNonWordCharacter(this.editor.getTextInBufferRange(range));
    };

    SelectNext.prototype.isWordSelected = function(selection) {
      var containsOnlyWordCharacters, lineRange, nonWordCharacterToTheLeft, nonWordCharacterToTheRight, selectionRange;
      if (selection.getBufferRange().isSingleLine()) {
        selectionRange = selection.getBufferRange();
        lineRange = this.editor.bufferRangeForBufferRow(selectionRange.start.row);
        nonWordCharacterToTheLeft = _.isEqual(selectionRange.start, lineRange.start) || this.isNonWordCharacterToTheLeft(selection);
        nonWordCharacterToTheRight = _.isEqual(selectionRange.end, lineRange.end) || this.isNonWordCharacterToTheRight(selection);
        containsOnlyWordCharacters = !this.isNonWordCharacter(selection.getText());
        return nonWordCharacterToTheLeft && nonWordCharacterToTheRight && containsOnlyWordCharacters;
      } else {
        return false;
      }
    };

    return SelectNext;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvZmluZC1hbmQtcmVwbGFjZS9saWIvc2VsZWN0LW5leHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQStCLE9BQUEsQ0FBUSxNQUFSLENBQS9CLEVBQUMsNkNBQUQsRUFBc0I7O0VBS3RCLE1BQU0sQ0FBQyxPQUFQLEdBQ007eUJBQ0osZUFBQSxHQUFpQjs7SUFFSixvQkFBQyxNQUFEO01BQUMsSUFBQyxDQUFBLFNBQUQ7TUFDWixJQUFDLENBQUEsZUFBRCxHQUFtQjtJQURSOzt5QkFHYixpQkFBQSxHQUFtQixTQUFBO01BQ2pCLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBLENBQTBCLENBQUMsT0FBM0IsQ0FBQSxDQUFIO2VBQ0UsSUFBQyxDQUFBLFVBQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxvQkFBRCxDQUFBLEVBSEY7O0lBRGlCOzt5QkFNbkIsZ0JBQUEsR0FBa0IsU0FBQTtNQUNoQixJQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUEsQ0FBMEIsQ0FBQyxPQUEzQixDQUFBLENBQWpCO1FBQUEsSUFBQyxDQUFBLFVBQUQsQ0FBQSxFQUFBOzthQUNBLElBQUMsQ0FBQSxvQkFBRCxDQUFBO0lBRmdCOzt5QkFJbEIsaUJBQUEsR0FBbUIsU0FBQTtNQUNqQixJQUFDLENBQUEscUJBQUQsQ0FBQTtNQUVBLElBQVUsSUFBQyxDQUFBLGVBQWUsQ0FBQyxNQUFqQixHQUEwQixDQUFwQztBQUFBLGVBQUE7O01BRUEsSUFBRyxJQUFDLENBQUEsZUFBZSxDQUFDLE1BQWpCLEdBQTBCLENBQTdCO1FBQ0UsSUFBQyxDQUFBLGVBQWUs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QUF6QixFQUFnQyxTQUFTLENBQUMsS0FBMUMsQ0FBQSxJQUMxQixJQUFDLENBQUEsMkJBQUQsQ0FBNkIsU0FBN0I7UUFDRiwwQkFBQSxHQUE2QixDQUFDLENBQUMsT0FBRixDQUFVLGNBQWMsQ0FBQyxHQUF6QixFQUE4QixTQUFTLENBQUMsR0FBeEMsQ0FBQSxJQUMzQixJQUFDLENBQUEsNEJBQUQsQ0FBOEIsU0FBOUI7UUFDRiwwQkFBQSxHQUE2QixDQUFJLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixTQUFTLENBQUMsT0FBVixDQUFBLENBQXBCO2VBRWpDLHlCQUFBLElBQThCLDBCQUE5QixJQUE2RCwyQkFUL0Q7T0FBQSxNQUFBO2VBV0UsTUFYRjs7SUFEYzs7Ozs7QUExSGxCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntDb21wb3NpdGVEaXNwb3NhYmxlLCBSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG4jIEZpbmQgYW5kIHNlbGVjdCB0aGUgbmV4dCBvY2N1cnJlbmNlIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdGV4dC5cbiNcbiMgVGhlIHdvcmQgdW5kZXIgdGhlIGN1cnNvciB3aWxsIGJlIHNlbGVjdGVkIGlmIHRoZSBzZWxlY3Rpb24gaXMgZW1wdHkuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTZWxlY3ROZXh0XG4gIHNlbGVjdGlvblJhbmdlczogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvcikgLT5cbiAgICBAc2VsZWN0aW9uUmFuZ2VzID0gW11cblxuICBmaW5kQW5kU2VsZWN0TmV4dDogLT5cbiAgICBpZiBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5pc0VtcHR5KClcbiAgICAgIEBzZWxlY3RXb3JkKClcbiAgICBlbHNlXG4gICAgICBAc2VsZWN0TmV4dE9jY3VycmVuY2UoKVxuXG4gIGZpbmRBbmRTZWxlY3RBbGw6IC0+XG4gICAgQHNlbGVjdFdvcmQoKSBpZiBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5pc0VtcHR5KClcbiAgICBAc2VsZWN0QWxsT2NjdXJyZW5jZXMoKVxuXG4gIHVuZG9MYXN0U2VsZWN0aW9uOiAtPlxuICAgIEB1cGRhdGVTYXZlZFNlbGVjdGlvbnMoKVxuXG4gICAgcmV0dXJuIGlmIEBzZWxlY3Rpb25SYW5nZXMubGVuZ3RoIDwgMVxuXG4gICAgaWYgQHNlbGVjdGlvblJhbmdlcy5sZW5ndGggPiAxXG4gICAgICBAc2VsZWN0aW9uUmFuZ2VzLnBvcCgpXG4gICAgICBAZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzIEBzZWxlY3Rpb25SYW5nZXNcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICBAZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKVxuXG4gIHNraXBDdXJyZW50U2VsZWN0aW9uOiAtPlxuICAgIEB1cGRhdGVTYXZlZFNlbGVjdGlvbnMoKVxuXG4gICAgcmV0dXJuIGlmIEBzZWxlY3Rpb25SYW5nZXMubGVuZ3RoIDwgMVxuXG4gICAgaWYgQHNlbGVjdGlvblJhbmdlcy5sZW5ndGggPiAxXG4gICAgICBsYXN0U2VsZWN0aW9uID0gQHNlbGVjdGlvblJhbmdlcy5wb3AoKVxuICAgICAgQGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyBAc2VsZWN0aW9uUmFuZ2VzXG4gICAgICBAc2VsZWN0TmV4dE9jY3VycmVuY2Uoc3RhcnQ6IGxhc3RTZWxlY3Rpb24uZW5kKVxuICAgIGVsc2VcbiAgICAgIEBzZWxlY3ROZXh0T2NjdXJyZW5jZSgpXG4gICAgICBAc2VsZWN0aW9uUmFuZ2VzLnNoaWZ0KClcbiAgICAgIHJldHVybiBpZiBAc2VsZWN0aW9uUmFuZ2VzLmxlbmd0aCA8IDFcbiAgICAgIEBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMgQHNlbGVjdGlvblJhbmdlc1xuXG4gIHNlbGVjdFdvcmQ6IC0+XG4gICAgQGVkaXRvci5zZWxlY3RXb3Jkc0NvbnRhaW5pbmdDdXJzb3JzKClcbiAgICBsYXN0U2VsZWN0aW9uID0gQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKClcbiAgICBpZiBAd29yZFNlbGVjdGVkID0gQGlzV29yZFNlbGVjdGVkKGxhc3RTZWxlY3Rpb24pXG4gICAgICBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgICBjbGVhcldvcmRTZWxlY3RlZCA9ID0+XG4gICAgICAgIEB3b3JkU2VsZWN0ZWQgPSBudWxsXG4gICAgICAgIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgICAgZGlzcG9zYWJsZXMuYWRkIGxhc3RTZWxlY3Rpb24ub25EaWRDaGFuZ2VSYW5nZSBjbGVhcldvcmRTZWxlY3RlZFxuICAgICAgZGlzcG9zYWJsZXMuYWRkIGxhc3RTZWxlY3Rpb24ub25EaWREZXN0cm95IGNsZWFyV29yZFNlbGVjdGVkXG5cbiAgc2VsZWN0QWxsT2NjdXJyZW5jZXM6IC0+XG4gICAgcmFuZ2UgPSBbWzAsIDBdLCBAZWRpdG9yLmdldEVvZkJ1ZmZlclBvc2l0aW9uKCldXG4gICAgQHNjYW5Gb3JOZXh0T2NjdXJyZW5jZSByYW5nZSwgKHtyYW5nZSwgc3RvcH0pID0+XG4gICAgICBAYWRkU2VsZWN0aW9uKHJhbmdlKVxuXG4gIHNlbGVjdE5leHRPY2N1cnJlbmNlOiAob3B0aW9ucz17fSkgLT5cbiAgICBzdGFydGluZ1JhbmdlID0gb3B0aW9ucy5zdGFydCA/IEBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpLmVuZFxuICAgIHJhbmdlID0gQGZpbmROZXh0T2NjdXJyZW5jZShbc3RhcnRpbmdSYW5nZSwgQGVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpXSlcbiAgICByYW5nZSA/PSBAZmluZE5leHRPY2N1cnJlbmNlKFtbMCwgMF0sIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpWzBdLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRdKVxuICAgIEBhZGRTZWxlY3Rpb24ocmFuZ2UpIGlmIHJhbmdlP1xuXG4gIGZpbmROZXh0T2NjdXJyZW5jZTogKHNjYW5SYW5nZSkgLT5cbiAgICBmb3VuZFJhbmdlID0gbnVsbFxuICAgIEBzY2FuRm9yTmV4dE9jY3VycmVuY2Ugc2NhblJhbmdlLCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgIGZvdW5kUmFuZ2UgPSByYW5nZVxuICAgICAgc3RvcCgpXG4gICAgZm91bmRSYW5nZVxuXG4gIGFkZFNlbGVjdGlvbjogKHJhbmdlKSAtPlxuICAgIHJldmVyc2VkID0gQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuaXNSZXZlcnNlZCgpXG4gICAgc2VsZWN0aW9uID0gQGVkaXRvci5hZGRTZWxlY3Rpb25Gb3JCdWZmZXJSYW5nZShyYW5nZSwge3JldmVyc2VkfSlcbiAgICBAdXBkYXRlU2F2ZWRTZWxlY3Rpb25zIHNlbGVjdGlvblxuXG4gIHNjYW5Gb3JOZXh0T2NjdXJyZW5jZTogKHJhbmdlLCBjYWxsYmFjaykgLT5cbiAgICBzZWxlY3Rpb24gPSBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKVxuICAgIHRleHQgPSBfLmVzY2FwZVJlZ0V4cChzZWxlY3Rpb24uZ2V0VGV4dCgpKVxuXG4gICAgaWYgQHdvcmRTZWxlY3RlZFxuICAgICAgbm9uV29yZENoYXJhY3RlcnMgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5ub25Xb3JkQ2hhcmFjdGVycycpXG4gICAgICB0ZXh0ID0gXCIoXnxbIFxcdCN7Xy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV0rKSN7dGV4dH0oPz0kfFtcXFxccyN7Xy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV0rKVwiXG5cbiAgICBAZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIG5ldyBSZWdFeHAodGV4dCwgJ2cnKSwgcmFuZ2UsIChyZXN1bHQpIC0+XG4gICAgICBpZiBwcmVmaXggPSByZXN1bHQubWF0Y2hbMV1cbiAgICAgICAgcmVzdWx0LnJhbmdlID0gcmVzdWx0LnJhbmdlLnRyYW5zbGF0ZShbMCwgcHJlZml4Lmxlbmd0aF0sIFswLCAwXSlcbiAgICAgIGNhbGxiYWNrKHJlc3VsdClcblxuICB1cGRhdGVTYXZlZFNlbGVjdGlvbnM6IChzZWxlY3Rpb249bnVsbCkgLT5cbiAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBAc2VsZWN0aW9uUmFuZ2VzID0gW10gaWYgc2VsZWN0aW9ucy5sZW5ndGggPCAzXG4gICAgaWYgQHNlbGVjdGlvblJhbmdlcy5sZW5ndGggaXMgMFxuICAgICAgQHNlbGVjdGlvblJhbmdlcy5wdXNoIHMuZ2V0QnVmZmVyUmFuZ2UoKSBmb3IgcyBpbiBzZWxlY3Rpb25zXG4gICAgZWxzZSBpZiBzZWxlY3Rpb25cbiAgICAgIHNlbGVjdGlvblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIHJldHVybiBpZiBAc2VsZWN0aW9uUmFuZ2VzLnNvbWUgKGV4aXN0aW5nUmFuZ2UpIC0+IGV4aXN0aW5nUmFuZ2UuaXNFcXVhbChzZWxlY3Rpb25SYW5nZSlcbiAgICAgIEBzZWxlY3Rpb25SYW5nZXMucHVzaCBzZWxlY3Rpb25SYW5nZVxuXG4gIGlzTm9uV29yZENoYXJhY3RlcjogKGNoYXJhY3RlcikgLT5cbiAgICBub25Xb3JkQ2hhcmFjdGVycyA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLm5vbldvcmRDaGFyYWN0ZXJzJylcbiAgICBuZXcgUmVnRXhwKFwiWyBcXHQje18uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dXCIpLnRlc3QoY2hhcmFjdGVyKVxuXG4gIGlzTm9uV29yZENoYXJhY3RlclRvVGhlTGVmdDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb25TdGFydCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgcmFuZ2UgPSBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEoc2VsZWN0aW9uU3RhcnQsIDAsIC0xKVxuICAgIEBpc05vbldvcmRDaGFyYWN0ZXIoQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSkpXG5cbiAgaXNOb25Xb3JkQ2hhcmFjdGVyVG9UaGVSaWdodDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb25FbmQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5lbmRcbiAgICByYW5nZSA9IFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShzZWxlY3Rpb25FbmQsIDAsIDEpXG4gICAgQGlzTm9uV29yZENoYXJhY3RlcihAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKSlcblxuICBpc1dvcmRTZWxlY3RlZDogKHNlbGVjdGlvbikgLT5cbiAgICBpZiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5pc1NpbmdsZUxpbmUoKVxuICAgICAgc2VsZWN0aW9uUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgbGluZVJhbmdlID0gQGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhzZWxlY3Rpb25SYW5nZS5zdGFydC5yb3cpXG4gICAgICBub25Xb3JkQ2hhcmFjdGVyVG9UaGVMZWZ0ID0gXy5pc0VxdWFsKHNlbGVjdGlvblJhbmdlLnN0YXJ0LCBsaW5lUmFuZ2Uuc3RhcnQpIG9yXG4gICAgICAgIEBpc05vbldvcmRDaGFyYWN0ZXJUb1RoZUxlZnQoc2VsZWN0aW9uKVxuICAgICAgbm9uV29yZENoYXJhY3RlclRvVGhlUmlnaHQgPSBfLmlzRXF1YWwoc2VsZWN0aW9uUmFuZ2UuZW5kLCBsaW5lUmFuZ2UuZW5kKSBvclxuICAgICAgICBAaXNOb25Xb3JkQ2hhcmFjdGVyVG9UaGVSaWdodChzZWxlY3Rpb24pXG4gICAgICBjb250YWluc09ubHlXb3JkQ2hhcmFjdGVycyA9IG5vdCBAaXNOb25Xb3JkQ2hhcmFjdGVyKHNlbGVjdGlvbi5nZXRUZXh0KCkpXG5cbiAgICAgIG5vbldvcmRDaGFyYWN0ZXJUb1RoZUxlZnQgYW5kIG5vbldvcmRDaGFyYWN0ZXJUb1RoZVJpZ2h0IGFuZCBjb250YWluc09ubHlXb3JkQ2hhcmFjdGVyc1xuICAgIGVsc2VcbiAgICAgIGZhbHNlXG4iXX0=
