(function() {
  var CursorPositionView, Disposable;

  Disposable = require('atom').Disposable;

  module.exports = CursorPositionView = (function() {
    function CursorPositionView() {
      var ref;
      this.viewUpdatePending = false;
      this.element = document.createElement('status-bar-cursor');
      this.element.classList.add('cursor-position', 'inline-block');
      this.goToLineLink = document.createElement('a');
      this.goToLineLink.classList.add('inline-block');
      this.element.appendChild(this.goToLineLink);
      this.formatString = (ref = atom.config.get('status-bar.cursorPositionFormat')) != null ? ref : '%L:%C';
      this.activeItemSubscription = atom.workspace.onDidChangeActiveTextEditor((function(_this) {
        return function(activeEditor) {
          return _this.subscribeToActiveTextEditor();
        };
      })(this));
      this.subscribeToConfig();
      this.subscribeToActiveTextEditor();
      this.tooltip = atom.tooltips.add(this.element, {
        title: (function(_this) {
          return function() {
            return "Line " + _this.row + ", Column " + _this.column;
          };
        })(this)
      });
      this.handleClick();
    }

    CursorPositionView.prototype.destroy = function() {
      var ref, ref1, ref2;
      this.activeItemSubscription.dispose();
      if ((ref = this.cursorSubscription) != null) {
        ref.dispose();
      }
      this.tooltip.dispose();
      if ((ref1 = this.configSubscription) != null) {
        ref1.dispose();
      }
      this.clickSubscription.dispose();
      return (ref2 = this.updateSubscription) != null ? ref2.dispose() : void 0;
    };

    CursorPositionView.prototype.subscribeToActiveTextEditor = function() {
      var ref, ref1, selectionsMarkerLayer;
      if ((ref = this.cursorSubscription) != null) {
        ref.dispose();
      }
      selectionsMarkerLayer = (ref1 = atom.workspace.getActiveTextEditor()) != null ? ref1.selectionsMarkerLayer : void 0;
      this.cursorSubscription = selectionsMarkerLayer != null ? selectionsMarkerLayer.onDidUpdate(this.scheduleUpdate.bind(this)) : void 0;
      return this.scheduleUpdate();
    };

    CursorPositionView.prototype.subscribeToConfig = function() {
      var ref;
      if ((ref = this.configSubscription) != null) {
        ref.dispose();
      }
      return this.configSubscription = atom.config.observe('status-bar.cursorPositionFormat', (function(_this) {
        return function(value) {
          _this.formatString = value != null ? value : '%L:%C';
          return _this.scheduleUpdate();
        };
      })(this));
    };

    CursorPositionView.prototype.handleClick = function() {
      var clickHandler;
      clickHandler = function() {
        return atom.commands.dispatch(atom.views.getView(atom.workspace.getActiveTextEditor()), 'go-to-line:toggle');
      };
      this.element.addEventListener('click', clickHandler);
      return this.clickSubscription = new Disposable((function(_this) {
        return function() {
          return _this.element.removeEventListener('click', clickHandler);
        };
      })(this));
    };

    CursorPositionView.prototype.scheduleUpdate = function() {
      if (this.viewUpdatePending) {
        return;
      }
      this.viewUpdatePending = true;
      return this.updateSubscription = atom.views.updateDocument((function(_this) {
        return function() {
          var position, ref;
          _this.viewUpdatePending = false;
          if (position = (ref = atom.workspace.getActiveTextEditor()) != null ? ref.getCursorBufferPosition() : void 0) {
            _this.row = position.row + 1;
            _this.column = position.column + 1;
            _this.goToLineLink.textContent = _this.formatString.replace('%L', _this.row).replace('%C', _this.column);
            return _this.element.classList.remove('hide');
          } else {
            _this.goToLineLink.textContent = '';
            return _this.element.classList.add('hide');
          }
        };
      })(this));
    };

    return CursorPositionView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvc3RhdHVzLWJhci9saWIvY3Vyc29yLXBvc2l0aW9uLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSOztFQUVmLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyw0QkFBQTtBQUNYLFVBQUE7TUFBQSxJQUFDLENBQUEsaUJBQUQsR0FBcUI7TUFFckIsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixtQkFBdkI7TUFDWCxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixpQkFBdkIsRUFBMEMsY0FBMUM7TUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QjtNQUNoQixJQUFDLENBQUEsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUF4QixDQUE0QixjQUE1QjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixJQUFDLENBQUEsWUFBdEI7TUFFQSxJQUFDLENBQUEsWUFBRCw4RUFBcUU7TUFFckUsSUFBQyxDQUFBLHNCQUFELEdBQTBCLElBQUksQ0FBQyxTQUFTLENBQUMsMkJBQWYsQ0FBMkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFlBQUQ7aUJBQWtCLEtBQUMsQ0FBQSwyQkFBRCxDQUFBO1FBQWxCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQztNQUUxQixJQUFDLENBQUEsaUJBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSwyQkFBRCxDQUFBO01BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLE9BQW5CLEVBQTRCO1FBQUEsS0FB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QTFCLEVBSkY7V0FBQSxNQUFBO1lBTUUsS0FBQyxDQUFBLFlBQVksQ0FBQyxXQUFkLEdBQTRCO21CQUM1QixLQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixNQUF2QixFQVBGOztRQUY4QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUI7SUFKUjs7Ozs7QUFqRGxCIiwic291cmNlc0NvbnRlbnQiOlsie0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ3Vyc29yUG9zaXRpb25WaWV3XG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEB2aWV3VXBkYXRlUGVuZGluZyA9IGZhbHNlXG5cbiAgICBAZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0YXR1cy1iYXItY3Vyc29yJylcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjdXJzb3ItcG9zaXRpb24nLCAnaW5saW5lLWJsb2NrJylcbiAgICBAZ29Ub0xpbmVMaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgQGdvVG9MaW5lTGluay5jbGFzc0xpc3QuYWRkKCdpbmxpbmUtYmxvY2snKVxuICAgIEBlbGVtZW50LmFwcGVuZENoaWxkKEBnb1RvTGluZUxpbmspXG5cbiAgICBAZm9ybWF0U3RyaW5nID0gYXRvbS5jb25maWcuZ2V0KCdzdGF0dXMtYmFyLmN1cnNvclBvc2l0aW9uRm9ybWF0JykgPyAnJUw6JUMnXG5cbiAgICBAYWN0aXZlSXRlbVN1YnNjcmlwdGlvbiA9IGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlVGV4dEVkaXRvciAoYWN0aXZlRWRpdG9yKSA9PiBAc3Vic2NyaWJlVG9BY3RpdmVUZXh0RWRpdG9yKClcblxuICAgIEBzdWJzY3JpYmVUb0NvbmZpZygpXG4gICAgQHN1YnNjcmliZVRvQWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgICBAdG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkKEBlbGVtZW50LCB0aXRsZTogPT4gXCJMaW5lICN7QHJvd30sIENvbHVtbiAje0Bjb2x1bW59XCIpXG5cbiAgICBAaGFuZGxlQ2xpY2soKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGFjdGl2ZUl0ZW1TdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgQGN1cnNvclN1YnNjcmlwdGlvbj8uZGlzcG9zZSgpXG4gICAgQHRvb2x0aXAuZGlzcG9zZSgpXG4gICAgQGNvbmZpZ1N1YnNjcmlwdGlvbj8uZGlzcG9zZSgpXG4gICAgQGNsaWNrU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIEB1cGRhdGVTdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuXG4gIHN1YnNjcmliZVRvQWN0aXZlVGV4dEVkaXRvcjogLT5cbiAgICBAY3Vyc29yU3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcbiAgICBzZWxlY3Rpb25zTWFya2VyTGF5ZXIgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LnNlbGVjdGlvbnNNYXJrZXJMYXllclxuICAgIEBjdXJzb3JTdWJzY3JpcHRpb24gPSBzZWxlY3Rpb25zTWFya2VyTGF5ZXI/Lm9uRGlkVXBkYXRlKEBzY2hlZHVsZVVwZGF0ZS5iaW5kKHRoaXMpKVxuICAgIEBzY2hlZHVsZVVwZGF0ZSgpXG5cbiAgc3Vic2NyaWJlVG9Db25maWc6IC0+XG4gICAgQGNvbmZpZ1N1YnNjcmlwdGlvbj8uZGlzcG9zZSgpXG4gICAgQGNvbmZpZ1N1YnNjcmlwdGlvbiA9IGF0b20uY29uZmlnLm9ic2VydmUgJ3N0YXR1cy1iYXIuY3Vyc29yUG9zaXRpb25Gb3JtYXQnLCAodmFsdWUpID0+XG4gICAgICBAZm9ybWF0U3RyaW5nID0gdmFsdWUgPyAnJUw6JUMnXG4gICAgICBAc2NoZWR1bGVVcGRhdGUoKVxuXG4gIGhhbmRsZUNsaWNrOiAtPlxuICAgIGNsaWNrSGFuZGxlciA9IC0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSksICdnby10by1saW5lOnRvZ2dsZScpXG4gICAgQGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGlja0hhbmRsZXIpXG4gICAgQGNsaWNrU3Vic2NyaXB0aW9uID0gbmV3IERpc3Bvc2FibGUgPT4gQGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGlja0hhbmRsZXIpXG5cbiAgc2NoZWR1bGVVcGRhdGU6IC0+XG4gICAgcmV0dXJuIGlmIEB2aWV3VXBkYXRlUGVuZGluZ1xuXG4gICAgQHZpZXdVcGRhdGVQZW5kaW5nID0gdHJ1ZVxuICAgIEB1cGRhdGVTdWJzY3JpcHRpb24gPSBhdG9tLnZpZXdzLnVwZGF0ZURvY3VtZW50ID0+XG4gICAgICBAdmlld1VwZGF0ZVBlbmRpbmcgPSBmYWxzZVxuICAgICAgaWYgcG9zaXRpb24gPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgQHJvdyA9IHBvc2l0aW9uLnJvdyArIDFcbiAgICAgICAgQGNvbHVtbiA9IHBvc2l0aW9uLmNvbHVtbiArIDFcbiAgICAgICAgQGdvVG9MaW5lTGluay50ZXh0Q29udGVudCA9IEBmb3JtYXRTdHJpbmcucmVwbGFjZSgnJUwnLCBAcm93KS5yZXBsYWNlKCclQycsIEBjb2x1bW4pXG4gICAgICAgIEBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxuICAgICAgZWxzZVxuICAgICAgICBAZ29Ub0xpbmVMaW5rLnRleHRDb250ZW50ID0gJydcbiAgICAgICAgQGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGlkZScpXG4iXX0=
