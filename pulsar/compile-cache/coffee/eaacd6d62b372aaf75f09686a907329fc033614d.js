(function() {
  var CompositeDisposable, WrapGuideElement;

  CompositeDisposable = require('atom').CompositeDisposable;

  WrapGuideElement = require('./wrap-guide-element');

  module.exports = {
    activate: function() {
      this.subscriptions = new CompositeDisposable();
      this.wrapGuides = new Map();
      return this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var editorElement, wrapGuideElement;
          if (_this.wrapGuides.has(editor)) {
            return;
          }
          editorElement = atom.views.getView(editor);
          wrapGuideElement = new WrapGuideElement(editor, editorElement);
          _this.wrapGuides.set(editor, wrapGuideElement);
          return _this.subscriptions.add(editor.onDidDestroy(function() {
            _this.wrapGuides.get(editor).destroy();
            return _this.wrapGuides["delete"](editor);
          }));
        };
      })(this)));
    },
    deactivate: function() {
      this.subscriptions.dispose();
      this.wrapGuides.forEach(function(wrapGuide, editor) {
        return wrapGuide.destroy();
      });
      return this.wrapGuides.clear();
    },
    uniqueAscending: function(list) {
      return (list.filter(function(item, index) {
        return list.indexOf(item) === index;
      })).sort(function(a, b) {
        return a - b;
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvd3JhcC1ndWlkZS9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNCQUFSOztFQUVuQixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUFVLFNBQUE7TUFDUixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJLG1CQUFKLENBQUE7TUFDakIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLEdBQUosQ0FBQTthQUVkLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO0FBQ25ELGNBQUE7VUFBQSxJQUFVLEtBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixNQUFoQixDQUFWO0FBQUEsbUJBQUE7O1VBRUEsYUFBQSxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkI7VUFDaEIsZ0JBQUEsR0FBbUIsSUFBSSxnQkFBSixDQUFxQixNQUFyQixFQUE2QixhQUE3QjtVQUVuQixLQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsTUFBaEIsRUFBd0IsZ0JBQXhCO2lCQUNBLEtBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixNQUFNLENBQUMsWUFBUCxDQUFvQixTQUFBO1lBQ3JDLEtBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixNQUFoQixDQUF1QixDQUFDLE9BQXhCLENBQUE7bUJBQ0EsS0FBQyxDQUFBLFVBQVUsRUFBQyxNQUFELEVBQVgsQ0FBbUIsTUFBbkI7VUFGcUMsQ0FBcEIsQ0FBbkI7UUFQbUQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQW5CO0lBSlEsQ0FBVjtJQWVBLFVBQUEsRUFBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7TUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBb0IsU0FBQyxTQUFELEVBQVksTUFBWjtlQUF1QixTQUFTLENBQUMsT0FBVixDQUFBO01BQXZCLENBQXBCO2FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQUE7SUFIVSxDQWZaO0lBb0JBLGVBQUEsRUFBaUIsU0FBQyxJQUFEO2FBQ2YsQ0FBQyxJQUFJLENBQUMsTUFBTCxDQUFZLFNBQUMsSUFBRCxFQUFPLEtBQVA7ZUFBaUIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLENBQUEsS0FBc0I7TUFBdkMsQ0FBWixDQUFELENBQTJELENBQUMsSUFBNUQsQ0FBaUUsU0FBQyxDQUFELEVBQUksQ0FBSjtlQUFVLENBQUEsR0FBSTtNQUFkLENBQWpFO0lBRGUsQ0FwQmpCOztBQUpGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbldyYXBHdWlkZUVsZW1lbnQgPSByZXF1aXJlICcuL3dyYXAtZ3VpZGUtZWxlbWVudCdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBAd3JhcEd1aWRlcyA9IG5ldyBNYXAoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgcmV0dXJuIGlmIEB3cmFwR3VpZGVzLmhhcyhlZGl0b3IpXG5cbiAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgd3JhcEd1aWRlRWxlbWVudCA9IG5ldyBXcmFwR3VpZGVFbGVtZW50KGVkaXRvciwgZWRpdG9yRWxlbWVudClcblxuICAgICAgQHdyYXBHdWlkZXMuc2V0KGVkaXRvciwgd3JhcEd1aWRlRWxlbWVudClcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBlZGl0b3Iub25EaWREZXN0cm95ID0+XG4gICAgICAgIEB3cmFwR3VpZGVzLmdldChlZGl0b3IpLmRlc3Ryb3koKVxuICAgICAgICBAd3JhcEd1aWRlcy5kZWxldGUoZWRpdG9yKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQHdyYXBHdWlkZXMuZm9yRWFjaCAod3JhcEd1aWRlLCBlZGl0b3IpIC0+IHdyYXBHdWlkZS5kZXN0cm95KClcbiAgICBAd3JhcEd1aWRlcy5jbGVhcigpXG5cbiAgdW5pcXVlQXNjZW5kaW5nOiAobGlzdCkgLT5cbiAgICAobGlzdC5maWx0ZXIoKGl0ZW0sIGluZGV4KSAtPiBsaXN0LmluZGV4T2YoaXRlbSkgaXMgaW5kZXgpKS5zb3J0KChhLCBiKSAtPiBhIC0gYilcbiJdfQ==
