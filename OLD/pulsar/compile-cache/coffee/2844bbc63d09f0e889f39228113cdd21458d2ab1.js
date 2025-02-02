(function() {
  var Disposable, StatusBarView, Tile;

  Disposable = require('atom').Disposable;

  Tile = require('./tile');

  module.exports = StatusBarView = (function() {
    function StatusBarView() {
      var flexboxHackElement;
      this.element = document.createElement('status-bar');
      this.element.classList.add('status-bar');
      flexboxHackElement = document.createElement('div');
      flexboxHackElement.classList.add('flexbox-repaint-hack');
      this.element.appendChild(flexboxHackElement);
      this.leftPanel = document.createElement('div');
      this.leftPanel.classList.add('status-bar-left');
      flexboxHackElement.appendChild(this.leftPanel);
      this.element.leftPanel = this.leftPanel;
      this.rightPanel = document.createElement('div');
      this.rightPanel.classList.add('status-bar-right');
      flexboxHackElement.appendChild(this.rightPanel);
      this.element.rightPanel = this.rightPanel;
      this.leftTiles = [];
      this.rightTiles = [];
      this.element.getLeftTiles = this.getLeftTiles.bind(this);
      this.element.getRightTiles = this.getRightTiles.bind(this);
      this.element.addLeftTile = this.addLeftTile.bind(this);
      this.element.addRightTile = this.addRightTile.bind(this);
      this.bufferSubscriptions = [];
      this.activeItemSubscription = atom.workspace.getCenter().onDidChangeActivePaneItem((function(_this) {
        return function() {
          _this.unsubscribeAllFromBuffer();
          _this.storeActiveBuffer();
          _this.subscribeAllToBuffer();
          return _this.element.dispatchEvent(new CustomEvent('active-buffer-changed', {
            bubbles: true
          }));
        };
      })(this));
      this.storeActiveBuffer();
    }

    StatusBarView.prototype.destroy = function() {
      this.activeItemSubscription.dispose();
      this.unsubscribeAllFromBuffer();
      return this.element.remove();
    };

    StatusBarView.prototype.addLeftTile = function(options) {
      var i, index, item, len, newElement, newItem, newPriority, newTile, nextElement, nextItem, priority, ref, ref1, ref2;
      newItem = options.item;
      newPriority = (ref = options != null ? options.priority : void 0) != null ? ref : this.leftTiles[this.leftTiles.length - 1].priority + 1;
      nextItem = null;
      ref1 = this.leftTiles;
      for (index = i = 0, len = ref1.length; i < len; index = ++i) {
        ref2 = ref1[index], priority = ref2.priority, item = ref2.item;
        if (priority > newPriority) {
          nextItem = item;
          break;
        }
      }
      newTile = new Tile(newItem, newPriority, this.leftTiles);
      this.leftTiles.splice(index, 0, newTile);
      newElement = atom.views.getView(newItem);
      nextElement = atom.views.getView(nextItem);
      this.leftPanel.insertBefore(newElement, nextElement);
      return newTile;
    };

    StatusBarView.prototype.addRightTile = function(options) {
      var i, index, item, len, newElement, newItem, newPriority, newTile, nextElement, nextItem, priority, ref, ref1, ref2;
      newItem = options.item;
      newPriority = (ref = options != null ? options.priority : void 0) != null ? ref : this.rightTiles[0].priority + 1;
      nextItem = null;
      ref1 = this.rightTiles;
      for (index = i = 0, len = ref1.length; i < len; index = ++i) {
        ref2 = ref1[index], priority = ref2.priority, item = ref2.item;
        if (priority < newPriority) {
          nextItem = item;
          break;
        }
      }
      newTile = new Tile(newItem, newPriority, this.rightTiles);
      this.rightTiles.splice(index, 0, newTile);
      newElement = atom.views.getView(newItem);
      nextElement = atom.views.getView(nextItem);
      this.rightPanel.insertBefore(newElement, nextElement);
      return newTile;
    };

    StatusBarView.prototype.getLeftTiles = function() {
      return this.leftTiles;
    };

    StatusBarView.prototype.getRightTiles = function() {
      return this.rightTiles;
    };

    StatusBarView.prototype.getActiveBuffer = function() {
      return this.buffer;
    };

    StatusBarView.prototype.getActiveItem = function() {
      return atom.workspace.getCenter().getActivePaneItem();
    };

    StatusBarView.prototype.storeActiveBuffer = function() {
      var ref;
      return this.buffer = (ref = this.getActiveItem()) != null ? typeof ref.getBuffer === "function" ? ref.getBuffer() : void 0 : void 0;
    };

    StatusBarView.prototype.subscribeToBuffer = function(event, callback) {
      this.bufferSubscriptions.push([event, callback]);
      if (this.buffer) {
        return this.buffer.on(event, callback);
      }
    };

    StatusBarView.prototype.subscribeAllToBuffer = function() {
      var callback, event, i, len, ref, ref1, results;
      if (!this.buffer) {
        return;
      }
      ref = this.bufferSubscriptions;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        ref1 = ref[i], event = ref1[0], callback = ref1[1];
        results.push(this.buffer.on(event, callback));
      }
      return results;
    };

    StatusBarView.prototype.unsubscribeAllFromBuffer = function() {
      var callback, event, i, len, ref, ref1, results;
      if (!this.buffer) {
        return;
      }
      ref = this.bufferSubscriptions;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        ref1 = ref[i], event = ref1[0], callback = ref1[1];
        results.push(this.buffer.off(event, callback));
      }
      return results;
    };

    return StatusBarView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvc3RhdHVzLWJhci9saWIvc3RhdHVzLWJhci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsYUFBYyxPQUFBLENBQVEsTUFBUjs7RUFDZixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHVCQUFBO0FBQ1gsVUFBQTtNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsWUFBdkI7TUFDWCxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixZQUF2QjtNQUVBLGtCQUFBLEdBQXFCLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ3JCLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxHQUE3QixDQUFpQyxzQkFBakM7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsa0JBQXJCO01BRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNiLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQXJCLENBQXlCLGlCQUF6QjtNQUNBLGtCQUFrQixDQUFDLFdBQW5CLENBQStCLElBQUMsQ0FBQSxTQUFoQztNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixJQUFDLENBQUE7TUFFdEIsSUFBQyxDQUFBLFVBQUQsR0FBYyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNkLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQXRCLENBQTBCLGtCQUExQjtNQUNBLGtCQUFrQixDQUFDLFdBQW5CLENBQStCLElBQUMsQ0FBQSxVQUFoQztNQUNBLElBQUMsQ0FB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YyxJQUFDLENBQUEsTUFBZjtBQUFBLGVBQUE7O0FBQ0E7QUFBQTtXQUFBLHFDQUFBO3VCQUFLLGlCQUFPO3FCQUNWLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLEtBQVosRUFBbUIsUUFBbkI7QUFERjs7SUFGd0I7Ozs7O0FBdkc1QiIsInNvdXJjZXNDb250ZW50IjpbIntEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5UaWxlID0gcmVxdWlyZSAnLi90aWxlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTdGF0dXNCYXJWaWV3XG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3RhdHVzLWJhcicpXG4gICAgQGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc3RhdHVzLWJhcicpXG5cbiAgICBmbGV4Ym94SGFja0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGZsZXhib3hIYWNrRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdmbGV4Ym94LXJlcGFpbnQtaGFjaycpXG4gICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQoZmxleGJveEhhY2tFbGVtZW50KVxuXG4gICAgQGxlZnRQYW5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgQGxlZnRQYW5lbC5jbGFzc0xpc3QuYWRkKCdzdGF0dXMtYmFyLWxlZnQnKVxuICAgIGZsZXhib3hIYWNrRWxlbWVudC5hcHBlbmRDaGlsZChAbGVmdFBhbmVsKVxuICAgIEBlbGVtZW50LmxlZnRQYW5lbCA9IEBsZWZ0UGFuZWxcblxuICAgIEByaWdodFBhbmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBAcmlnaHRQYW5lbC5jbGFzc0xpc3QuYWRkKCdzdGF0dXMtYmFyLXJpZ2h0JylcbiAgICBmbGV4Ym94SGFja0VsZW1lbnQuYXBwZW5kQ2hpbGQoQHJpZ2h0UGFuZWwpXG4gICAgQGVsZW1lbnQucmlnaHRQYW5lbCA9IEByaWdodFBhbmVsXG5cbiAgICBAbGVmdFRpbGVzID0gW11cbiAgICBAcmlnaHRUaWxlcyA9IFtdXG5cbiAgICBAZWxlbWVudC5nZXRMZWZ0VGlsZXMgPSBAZ2V0TGVmdFRpbGVzLmJpbmQodGhpcylcbiAgICBAZWxlbWVudC5nZXRSaWdodFRpbGVzID0gQGdldFJpZ2h0VGlsZXMuYmluZCh0aGlzKVxuICAgIEBlbGVtZW50LmFkZExlZnRUaWxlID0gQGFkZExlZnRUaWxlLmJpbmQodGhpcylcbiAgICBAZWxlbWVudC5hZGRSaWdodFRpbGUgPSBAYWRkUmlnaHRUaWxlLmJpbmQodGhpcylcblxuICAgIEBidWZmZXJTdWJzY3JpcHRpb25zID0gW11cblxuICAgIEBhY3RpdmVJdGVtU3Vic2NyaXB0aW9uID0gYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSA9PlxuICAgICAgQHVuc3Vic2NyaWJlQWxsRnJvbUJ1ZmZlcigpXG4gICAgICBAc3RvcmVBY3RpdmVCdWZmZXIoKVxuICAgICAgQHN1YnNjcmliZUFsbFRvQnVmZmVyKClcblxuICAgICAgQGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2FjdGl2ZS1idWZmZXItY2hhbmdlZCcsIGJ1YmJsZXM6IHRydWUpKVxuXG4gICAgQHN0b3JlQWN0aXZlQnVmZmVyKClcblxuICBkZXN0cm95OiAtPlxuICAgIEBhY3RpdmVJdGVtU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIEB1bnN1YnNjcmliZUFsbEZyb21CdWZmZXIoKVxuICAgIEBlbGVtZW50LnJlbW92ZSgpXG5cbiAgYWRkTGVmdFRpbGU6IChvcHRpb25zKSAtPlxuICAgIG5ld0l0ZW0gPSBvcHRpb25zLml0ZW1cbiAgICBuZXdQcmlvcml0eSA9IG9wdGlvbnM/LnByaW9yaXR5ID8gQGxlZnRUaWxlc1tAbGVmdFRpbGVzLmxlbmd0aCAtIDFdLnByaW9yaXR5ICsgMVxuICAgIG5leHRJdGVtID0gbnVsbFxuICAgIGZvciB7cHJpb3JpdHksIGl0ZW19LCBpbmRleCBpbiBAbGVmdFRpbGVzXG4gICAgICBpZiBwcmlvcml0eSA+IG5ld1ByaW9yaXR5XG4gICAgICAgIG5leHRJdGVtID0gaXRlbVxuICAgICAgICBicmVha1xuXG4gICAgbmV3VGlsZSA9IG5ldyBUaWxlKG5ld0l0ZW0sIG5ld1ByaW9yaXR5LCBAbGVmdFRpbGVzKVxuICAgIEBsZWZ0VGlsZXMuc3BsaWNlKGluZGV4LCAwLCBuZXdUaWxlKVxuICAgIG5ld0VsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcobmV3SXRlbSlcbiAgICBuZXh0RWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhuZXh0SXRlbSlcbiAgICBAbGVmdFBhbmVsLmluc2VydEJlZm9yZShuZXdFbGVtZW50LCBuZXh0RWxlbWVudClcbiAgICBuZXdUaWxlXG5cbiAgYWRkUmlnaHRUaWxlOiAob3B0aW9ucykgLT5cbiAgICBuZXdJdGVtID0gb3B0aW9ucy5pdGVtXG4gICAgbmV3UHJpb3JpdHkgPSBvcHRpb25zPy5wcmlvcml0eSA/IEByaWdodFRpbGVzWzBdLnByaW9yaXR5ICsgMVxuICAgIG5leHRJdGVtID0gbnVsbFxuICAgIGZvciB7cHJpb3JpdHksIGl0ZW19LCBpbmRleCBpbiBAcmlnaHRUaWxlc1xuICAgICAgaWYgcHJpb3JpdHkgPCBuZXdQcmlvcml0eVxuICAgICAgICBuZXh0SXRlbSA9IGl0ZW1cbiAgICAgICAgYnJlYWtcblxuICAgIG5ld1RpbGUgPSBuZXcgVGlsZShuZXdJdGVtLCBuZXdQcmlvcml0eSwgQHJpZ2h0VGlsZXMpXG4gICAgQHJpZ2h0VGlsZXMuc3BsaWNlKGluZGV4LCAwLCBuZXdUaWxlKVxuICAgIG5ld0VsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcobmV3SXRlbSlcbiAgICBuZXh0RWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhuZXh0SXRlbSlcbiAgICBAcmlnaHRQYW5lbC5pbnNlcnRCZWZvcmUobmV3RWxlbWVudCwgbmV4dEVsZW1lbnQpXG4gICAgbmV3VGlsZVxuXG4gIGdldExlZnRUaWxlczogLT5cbiAgICBAbGVmdFRpbGVzXG5cbiAgZ2V0UmlnaHRUaWxlczogLT5cbiAgICBAcmlnaHRUaWxlc1xuXG4gIGdldEFjdGl2ZUJ1ZmZlcjogLT5cbiAgICBAYnVmZmVyXG5cbiAgZ2V0QWN0aXZlSXRlbTogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5nZXRBY3RpdmVQYW5lSXRlbSgpXG5cbiAgc3RvcmVBY3RpdmVCdWZmZXI6IC0+XG4gICAgQGJ1ZmZlciA9IEBnZXRBY3RpdmVJdGVtKCk/LmdldEJ1ZmZlcj8oKVxuXG4gIHN1YnNjcmliZVRvQnVmZmVyOiAoZXZlbnQsIGNhbGxiYWNrKSAtPlxuICAgIEBidWZmZXJTdWJzY3JpcHRpb25zLnB1c2goW2V2ZW50LCBjYWxsYmFja10pXG4gICAgQGJ1ZmZlci5vbihldmVudCwgY2FsbGJhY2spIGlmIEBidWZmZXJcblxuICBzdWJzY3JpYmVBbGxUb0J1ZmZlcjogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBidWZmZXJcbiAgICBmb3IgW2V2ZW50LCBjYWxsYmFja10gaW4gQGJ1ZmZlclN1YnNjcmlwdGlvbnNcbiAgICAgIEBidWZmZXIub24oZXZlbnQsIGNhbGxiYWNrKVxuXG4gIHVuc3Vic2NyaWJlQWxsRnJvbUJ1ZmZlcjogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBidWZmZXJcbiAgICBmb3IgW2V2ZW50LCBjYWxsYmFja10gaW4gQGJ1ZmZlclN1YnNjcmlwdGlvbnNcbiAgICAgIEBidWZmZXIub2ZmKGV2ZW50LCBjYWxsYmFjaylcbiJdfQ==
