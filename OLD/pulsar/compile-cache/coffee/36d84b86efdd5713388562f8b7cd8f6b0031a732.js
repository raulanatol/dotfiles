(function() {
  var Emitter, HISTORY_MAX, History, HistoryCycler, _;

  _ = require('underscore-plus');

  Emitter = require('atom').Emitter;

  HISTORY_MAX = 25;

  History = (function() {
    function History(items) {
      this.items = items != null ? items : [];
      this.emitter = new Emitter;
      this.length = this.items.length;
    }

    History.prototype.onDidAddItem = function(callback) {
      return this.emitter.on('did-add-item', callback);
    };

    History.prototype.serialize = function() {
      return this.items.slice(-HISTORY_MAX);
    };

    History.prototype.getLast = function() {
      return _.last(this.items);
    };

    History.prototype.getAtIndex = function(index) {
      return this.items[index];
    };

    History.prototype.add = function(text) {
      this.items.push(text);
      this.length = this.items.length;
      return this.emitter.emit('did-add-item', text);
    };

    History.prototype.clear = function() {
      this.items = [];
      return this.length = 0;
    };

    return History;

  })();

  HistoryCycler = (function() {
    function HistoryCycler(buffer, history) {
      this.buffer = buffer;
      this.history = history;
      this.index = this.history.length;
      this.history.onDidAddItem((function(_this) {
        return function(text) {
          if (text !== _this.buffer.getText()) {
            return _this.buffer.setText(text);
          }
        };
      })(this));
    }

    HistoryCycler.prototype.addEditorElement = function(editorElement) {
      return atom.commands.add(editorElement, {
        'core:move-up': (function(_this) {
          return function() {
            return _this.previous();
          };
        })(this),
        'core:move-down': (function(_this) {
          return function() {
            return _this.next();
          };
        })(this)
      });
    };

    HistoryCycler.prototype.previous = function() {
      var ref;
      if (this.history.length === 0 || (this.atLastItem() && this.buffer.getText() !== this.history.getLast())) {
        this.scratch = this.buffer.getText();
      } else if (this.index > 0) {
        this.index--;
      }
      return this.buffer.setText((ref = this.history.getAtIndex(this.index)) != null ? ref : '');
    };

    HistoryCycler.prototype.next = function() {
      var item;
      if (this.index < this.history.length - 1) {
        this.index++;
        item = this.history.getAtIndex(this.index);
      } else if (this.scratch) {
        item = this.scratch;
      } else {
        item = '';
      }
      return this.buffer.setText(item);
    };

    HistoryCycler.prototype.atLastItem = function() {
      return this.index === this.history.length - 1;
    };

    HistoryCycler.prototype.store = function() {
      var text;
      text = this.buffer.getText();
      if (!text || text === this.history.getLast()) {
        return;
      }
      this.scratch = null;
      this.history.add(text);
      return this.index = this.history.length - 1;
    };

    return HistoryCycler;

  })();

  module.exports = {
    History: History,
    HistoryCycler: HistoryCycler
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvZmluZC1hbmQtcmVwbGFjZS9saWIvaGlzdG9yeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0gsVUFBVyxPQUFBLENBQVEsTUFBUjs7RUFFWixXQUFBLEdBQWM7O0VBRVI7SUFDUyxpQkFBQyxLQUFEO01BQUMsSUFBQyxDQUFBLHdCQUFELFFBQU87TUFDbkIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BQ2YsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsS0FBSyxDQUFDO0lBRk47O3NCQUliLFlBQUEsR0FBYyxTQUFDLFFBQUQ7YUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxjQUFaLEVBQTRCLFFBQTVCO0lBRFk7O3NCQUdkLFNBQUEsR0FBVyxTQUFBO2FBQ1QsSUFBQyxDQUFBLEtBQU07SUFERTs7c0JBR1gsT0FBQSxHQUFTLFNBQUE7YUFDUCxDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxLQUFSO0lBRE87O3NCQUdULFVBQUEsR0FBWSxTQUFDLEtBQUQ7YUFDVixJQUFDLENBQUEsS0FBTSxDQUFBLEtBQUE7SUFERzs7c0JBR1osR0FBQSxHQUFLLFNBQUMsSUFBRDtNQUNILElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLElBQVo7TUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxLQUFLLENBQUM7YUFDakIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsY0FBZCxFQUE4QixJQUE5QjtJQUhHOztzQkFLTCxLQUFBLEdBQU8sU0FBQTtNQUNMLElBQUMsQ0FBQSxLQUFELEdBQVM7YUFDVCxJQUFDLENBQUEsTUFBRCxHQUFVO0lB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XyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cbkhJU1RPUllfTUFYID0gMjVcblxuY2xhc3MgSGlzdG9yeVxuICBjb25zdHJ1Y3RvcjogKEBpdGVtcz1bXSkgLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQGxlbmd0aCA9IEBpdGVtcy5sZW5ndGhcblxuICBvbkRpZEFkZEl0ZW06IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWFkZC1pdGVtJywgY2FsbGJhY2tcblxuICBzZXJpYWxpemU6IC0+XG4gICAgQGl0ZW1zWy1ISVNUT1JZX01BWC4uXVxuXG4gIGdldExhc3Q6IC0+XG4gICAgXy5sYXN0KEBpdGVtcylcblxuICBnZXRBdEluZGV4OiAoaW5kZXgpIC0+XG4gICAgQGl0ZW1zW2luZGV4XVxuXG4gIGFkZDogKHRleHQpIC0+XG4gICAgQGl0ZW1zLnB1c2godGV4dClcbiAgICBAbGVuZ3RoID0gQGl0ZW1zLmxlbmd0aFxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1hZGQtaXRlbScsIHRleHRcblxuICBjbGVhcjogLT5cbiAgICBAaXRlbXMgPSBbXVxuICAgIEBsZW5ndGggPSAwXG5cbiMgQWRkcyB0aGUgYWJpbGl0eSB0byBjeWNsZSB0aHJvdWdoIGhpc3RvcnlcbmNsYXNzIEhpc3RvcnlDeWNsZXJcblxuICAjICogYGJ1ZmZlcmAgYW4ge0VkaXRvcn0gaW5zdGFuY2UgdG8gYXR0YWNoIHRoZSBjeWNsZXIgdG9cbiAgIyAqIGBoaXN0b3J5YCBhIHtIaXN0b3J5fSBvYmplY3RcbiAgY29uc3RydWN0b3I6IChAYnVmZmVyLCBAaGlzdG9yeSkgLT5cbiAgICBAaW5kZXggPSBAaGlzdG9yeS5sZW5ndGhcbiAgICBAaGlzdG9yeS5vbkRpZEFkZEl0ZW0gKHRleHQpID0+XG4gICAgICBAYnVmZmVyLnNldFRleHQodGV4dCkgaWYgdGV4dCBpc250IEBidWZmZXIuZ2V0VGV4dCgpXG5cbiAgYWRkRWRpdG9yRWxlbWVudDogKGVkaXRvckVsZW1lbnQpIC0+XG4gICAgYXRvbS5jb21tYW5kcy5hZGQgZWRpdG9yRWxlbWVudCxcbiAgICAgICdjb3JlOm1vdmUtdXAnOiA9PiBAcHJldmlvdXMoKVxuICAgICAgJ2NvcmU6bW92ZS1kb3duJzogPT4gQG5leHQoKVxuXG4gIHByZXZpb3VzOiAtPlxuICAgIGlmIEBoaXN0b3J5Lmxlbmd0aCBpcyAwIG9yIChAYXRMYXN0SXRlbSgpIGFuZCBAYnVmZmVyLmdldFRleHQoKSBpc250IEBoaXN0b3J5LmdldExhc3QoKSlcbiAgICAgIEBzY3JhdGNoID0gQGJ1ZmZlci5nZXRUZXh0KClcbiAgICBlbHNlIGlmIEBpbmRleCA+IDBcbiAgICAgIEBpbmRleC0tXG5cbiAgICBAYnVmZmVyLnNldFRleHQgQGhpc3RvcnkuZ2V0QXRJbmRleChAaW5kZXgpID8gJydcblxuICBuZXh0OiAtPlxuICAgIGlmIEBpbmRleCA8IEBoaXN0b3J5Lmxlbmd0aCAtIDFcbiAgICAgIEBpbmRleCsrXG4gICAgICBpdGVtID0gQGhpc3RvcnkuZ2V0QXRJbmRleChAaW5kZXgpXG4gICAgZWxzZSBpZiBAc2NyYXRjaFxuICAgICAgaXRlbSA9IEBzY3JhdGNoXG4gICAgZWxzZVxuICAgICAgaXRlbSA9ICcnXG5cbiAgICBAYnVmZmVyLnNldFRleHQgaXRlbVxuXG4gIGF0TGFzdEl0ZW06IC0+XG4gICAgQGluZGV4IGlzIEBoaXN0b3J5Lmxlbmd0aCAtIDFcblxuICBzdG9yZTogLT5cbiAgICB0ZXh0ID0gQGJ1ZmZlci5nZXRUZXh0KClcbiAgICByZXR1cm4gaWYgbm90IHRleHQgb3IgdGV4dCBpcyBAaGlzdG9yeS5nZXRMYXN0KClcbiAgICBAc2NyYXRjaCA9IG51bGxcbiAgICBAaGlzdG9yeS5hZGQodGV4dClcbiAgICBAaW5kZXggPSBAaGlzdG9yeS5sZW5ndGggLSAxXG5cbm1vZHVsZS5leHBvcnRzID0ge0hpc3RvcnksIEhpc3RvcnlDeWNsZXJ9XG4iXX0=
