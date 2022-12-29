(function() {
  var SelectionCountView, _;

  _ = require('underscore-plus');

  module.exports = SelectionCountView = (function() {
    function SelectionCountView() {
      var ref;
      this.element = document.createElement('status-bar-selection');
      this.element.classList.add('selection-count', 'inline-block');
      this.tooltipElement = document.createElement('div');
      this.tooltipDisposable = atom.tooltips.add(this.element, {
        item: this.tooltipElement
      });
      this.formatString = (ref = atom.config.get('status-bar.selectionCountFormat')) != null ? ref : '(%L, %C)';
      this.activeItemSubscription = atom.workspace.onDidChangeActiveTextEditor((function(_this) {
        return function() {
          return _this.subscribeToActiveTextEditor();
        };
      })(this));
      this.subscribeToConfig();
      this.subscribeToActiveTextEditor();
    }

    SelectionCountView.prototype.destroy = function() {
      var ref, ref1;
      this.activeItemSubscription.dispose();
      if ((ref = this.selectionSubscription) != null) {
        ref.dispose();
      }
      if ((ref1 = this.configSubscription) != null) {
        ref1.dispose();
      }
      return this.tooltipDisposable.dispose();
    };

    SelectionCountView.prototype.subscribeToConfig = function() {
      var ref;
      if ((ref = this.configSubscription) != null) {
        ref.dispose();
      }
      return this.configSubscription = atom.config.observe('status-bar.selectionCountFormat', (function(_this) {
        return function(value) {
          _this.formatString = value != null ? value : '(%L, %C)';
          return _this.scheduleUpdateCount();
        };
      })(this));
    };

    SelectionCountView.prototype.subscribeToActiveTextEditor = function() {
      var activeEditor, ref, selectionsMarkerLayer;
      if ((ref = this.selectionSubscription) != null) {
        ref.dispose();
      }
      activeEditor = this.getActiveTextEditor();
      selectionsMarkerLayer = activeEditor != null ? activeEditor.selectionsMarkerLayer : void 0;
      this.selectionSubscription = selectionsMarkerLayer != null ? selectionsMarkerLayer.onDidUpdate(this.scheduleUpdateCount.bind(this)) : void 0;
      return this.scheduleUpdateCount();
    };

    SelectionCountView.prototype.getActiveTextEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    SelectionCountView.prototype.scheduleUpdateCount = function() {
      if (!this.scheduledUpdate) {
        this.scheduledUpdate = true;
        return atom.views.updateDocument((function(_this) {
          return function() {
            _this.updateCount();
            return _this.scheduledUpdate = false;
          };
        })(this));
      }
    };

    SelectionCountView.prototype.updateCount = function() {
      var count, lineCount, range, ref, ref1;
      count = (ref = this.getActiveTextEditor()) != null ? ref.getSelectedText().length : void 0;
      range = (ref1 = this.getActiveTextEditor()) != null ? ref1.getSelectedBufferRange() : void 0;
      lineCount = range != null ? range.getRowCount() : void 0;
      if ((range != null ? range.end.column : void 0) === 0) {
        lineCount -= 1;
      }
      if (count > 0) {
        this.element.textContent = this.formatString.replace('%L', lineCount).replace('%C', count);
        return this.tooltipElement.textContent = (_.pluralize(lineCount, 'line')) + ", " + (_.pluralize(count, 'character')) + " selected";
      } else {
        this.element.textContent = '';
        return this.tooltipElement.textContent = '';
      }
    };

    return SelectionCountView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvc3RhdHVzLWJhci9saWIvc2VsZWN0aW9uLWNvdW50LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyw0QkFBQTtBQUNYLFVBQUE7TUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLHNCQUF2QjtNQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLGlCQUF2QixFQUEwQyxjQUExQztNQUVBLElBQUMsQ0FBQSxjQUFELEdBQWtCLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ2xCLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLE9BQW5CLEVBQTRCO1FBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxjQUFQO09BQTVCO01BRXJCLElBQUMsQ0FBQSxZQUFELDhFQUFxRTtNQUVyRSxJQUFDLENBQUEsc0JBQUQsR0FBMEIsSUFBSSxDQUFDLFNBQVMsQ0FBQywyQkFBZixDQUEyQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLDJCQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0M7TUFFMUIsSUFBQyxDQUFBLGlCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsMkJBQUQsQ0FBQTtJQVpXOztpQ0FjYixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsc0JBQXNCLENBQUMsT0FBeEIsQ0FBQTs7V0FDc0IsQ0FBRSxPQUF4QixDQUFBOzs7WUFDbUIsQ0FBRSxPQUFyQixDQUFBOzthQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxPQUFuQixDQUFBO0lBSk87O2lDQU1ULGlCQUFBLEdBQW1CLFNBQUE7QUFDakIsVUFBQTs7V0FBbUIsQ0FBRSxPQUFyQixDQUFBOzthQUNBLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsaUNBQXBCLEVBQXVELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO1VBQzNFLEtBQUMsQ0FBQSxZQUFELG1CQUFnQixRQUFRO2lCQUN4QixLQUFDLENBQUEsbUJBQUQsQ0FBQTtRQUYyRTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQ7SUFGTDs7aUNBTW5CLDJCQUFBLEdBQTZCLFNBQUE7QUFDM0IsVUFBQTs7V0FBc0IsQ0FBRSxPQUF4QixDQUFBOztNQUNBLFlBQUEsR0FBZSxJQUFDLENBQUEsbUJBQUQsQ0FBQTtNQUNmLHFCQUFBLDBCQUF3QixZQUFZLENBQUU7TUFDdEMsSUFBQyxDQUFBLHFCQUFELG1DQUF5QixxQkFBcUIsQ0FBRSxXQUF2QixDQUFtQyxJQUFDLENBQUEsbUJBQW1CLENBQUMsSUFBckIsQ0FBMEIsSUFBMUIsQ0FBbkM7YUFDekIsSUFBQyxDQUFBLG1CQUFELENBQUE7SUFMMkI7O2lDQU83QixtQkFBQSxHQUFxQixTQUFBO2FBQ25CLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtJQURtQjs7aUNBR3JCLG1CQUFBLEdBQXFCLFNBQUE7TUFDbkIsSUFBQSxDQUFPLElBQUMsQ0FBQSxlQUFSO1FBQ0UsSUFBQyxDQUFBLGVBQUQsR0FBbUI7ZUFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFYLENBQTBCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7WUFDeEIsS0FBQyxDQUFBLFdBQUQsQ0FBQTttQkFDQSxLQUFDLENBQUEsZUFBRCxHQUFtQjtVQUZLO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQixFQUZGOztJQURtQjs7aUNBT3JCLFdBQUEsR0FBYSxTQUFBO0FBQ1gsVUFBQTtNQUFBLEtBQUEsbURBQThCLENBQUUsZUFBeEIsQ0FBQSxDQUF5QyxDQUFDO01BQ2xELEtBQUEscURBQThCLENBQUUsc0JBQXhCLENBQUE7TUFDUixTQUFBLG1CQUFZLEtBQUssQ0FBRSxXQUFQLENBQUE7TUFDWixxQkFBa0IsS0FBSyxDQUFFLEdBQUcsQ0FBQyxnQkFBWCxLQUFxQixDQUF2QztRQUFBLFNBQUEsSUFBYSxFQUFiOztNQUNBLElBQUcsS0FBQSxHQUFRLENBQVg7UUFDRSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsR0FBdUIsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLENBQXNCLElBQXRCLEVBQTRCLFNBQTVCLENBQXNDLENBQUMsT0FBdkMsQ0FBK0MsSUFBL0MsRUFBcUQsS0FBckQ7ZUFDdkIsSUFBQyxDQUFBLGNBQWMsQ0FBQyxXQUFoQixHQUFnQyxDQUFDLENBQUMsQ0FBQyxTQUFGLENBQVksU0FBWixFQUF1QixNQUF2QixDQUFELENBQUEsR0FBZ0MsSUFBaEMsR0FBbUMsQ0FBQyxDQUFDLENBQUMsU0FBRixDQUFZLEtBQVosRUFBbUIsV0FBbkIsQ0FBRCxDQUFuQyxHQUFvRSxZQUZ0RztPQUFBLE1BQUE7UUFJRSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsR0FBdUI7ZUFDdkIsSUFBQyxDQUFBLGNBQWMsQ0FBQyxXQUFoQixHQUE4QixHQUxoQzs7SUFMVzs7Ozs7QUEvQ2YiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTZWxlY3Rpb25Db3VudFZpZXdcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdGF0dXMtYmFyLXNlbGVjdGlvbicpXG4gICAgQGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0aW9uLWNvdW50JywgJ2lubGluZS1ibG9jaycpXG5cbiAgICBAdG9vbHRpcEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIEB0b29sdGlwRGlzcG9zYWJsZSA9IGF0b20udG9vbHRpcHMuYWRkIEBlbGVtZW50LCBpdGVtOiBAdG9vbHRpcEVsZW1lbnRcblxuICAgIEBmb3JtYXRTdHJpbmcgPSBhdG9tLmNvbmZpZy5nZXQoJ3N0YXR1cy1iYXIuc2VsZWN0aW9uQ291bnRGb3JtYXQnKSA/ICcoJUwsICVDKSdcblxuICAgIEBhY3RpdmVJdGVtU3Vic2NyaXB0aW9uID0gYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVUZXh0RWRpdG9yID0+IEBzdWJzY3JpYmVUb0FjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgQHN1YnNjcmliZVRvQ29uZmlnKClcbiAgICBAc3Vic2NyaWJlVG9BY3RpdmVUZXh0RWRpdG9yKClcblxuICBkZXN0cm95OiAtPlxuICAgIEBhY3RpdmVJdGVtU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIEBzZWxlY3Rpb25TdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuICAgIEBjb25maWdTdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuICAgIEB0b29sdGlwRGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICBzdWJzY3JpYmVUb0NvbmZpZzogLT5cbiAgICBAY29uZmlnU3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcbiAgICBAY29uZmlnU3Vic2NyaXB0aW9uID0gYXRvbS5jb25maWcub2JzZXJ2ZSAnc3RhdHVzLWJhci5zZWxlY3Rpb25Db3VudEZvcm1hdCcsICh2YWx1ZSkgPT5cbiAgICAgIEBmb3JtYXRTdHJpbmcgPSB2YWx1ZSA/ICcoJUwsICVDKSdcbiAgICAgIEBzY2hlZHVsZVVwZGF0ZUNvdW50KClcblxuICBzdWJzY3JpYmVUb0FjdGl2ZVRleHRFZGl0b3I6IC0+XG4gICAgQHNlbGVjdGlvblN1YnNjcmlwdGlvbj8uZGlzcG9zZSgpXG4gICAgYWN0aXZlRWRpdG9yID0gQGdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHNlbGVjdGlvbnNNYXJrZXJMYXllciA9IGFjdGl2ZUVkaXRvcj8uc2VsZWN0aW9uc01hcmtlckxheWVyXG4gICAgQHNlbGVjdGlvblN1YnNjcmlwdGlvbiA9IHNlbGVjdGlvbnNNYXJrZXJMYXllcj8ub25EaWRVcGRhdGUoQHNjaGVkdWxlVXBkYXRlQ291bnQuYmluZCh0aGlzKSlcbiAgICBAc2NoZWR1bGVVcGRhdGVDb3VudCgpXG5cbiAgZ2V0QWN0aXZlVGV4dEVkaXRvcjogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICBzY2hlZHVsZVVwZGF0ZUNvdW50OiAtPlxuICAgIHVubGVzcyBAc2NoZWR1bGVkVXBkYXRlXG4gICAgICBAc2NoZWR1bGVkVXBkYXRlID0gdHJ1ZVxuICAgICAgYXRvbS52aWV3cy51cGRhdGVEb2N1bWVudCA9PlxuICAgICAgICBAdXBkYXRlQ291bnQoKVxuICAgICAgICBAc2NoZWR1bGVkVXBkYXRlID0gZmFsc2VcblxuICB1cGRhdGVDb3VudDogLT5cbiAgICBjb3VudCA9IEBnZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFNlbGVjdGVkVGV4dCgpLmxlbmd0aFxuICAgIHJhbmdlID0gQGdldEFjdGl2ZVRleHRFZGl0b3IoKT8uZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpXG4gICAgbGluZUNvdW50ID0gcmFuZ2U/LmdldFJvd0NvdW50KClcbiAgICBsaW5lQ291bnQgLT0gMSBpZiByYW5nZT8uZW5kLmNvbHVtbiBpcyAwXG4gICAgaWYgY291bnQgPiAwXG4gICAgICBAZWxlbWVudC50ZXh0Q29udGVudCA9IEBmb3JtYXRTdHJpbmcucmVwbGFjZSgnJUwnLCBsaW5lQ291bnQpLnJlcGxhY2UoJyVDJywgY291bnQpXG4gICAgICBAdG9vbHRpcEVsZW1lbnQudGV4dENvbnRlbnQgPSBcIiN7Xy5wbHVyYWxpemUobGluZUNvdW50LCAnbGluZScpfSwgI3tfLnBsdXJhbGl6ZShjb3VudCwgJ2NoYXJhY3RlcicpfSBzZWxlY3RlZFwiXG4gICAgZWxzZVxuICAgICAgQGVsZW1lbnQudGV4dENvbnRlbnQgPSAnJ1xuICAgICAgQHRvb2x0aXBFbGVtZW50LnRleHRDb250ZW50ID0gJydcbiJdfQ==
