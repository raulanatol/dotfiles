(function() {
  var CompositeDisposable, DeprecationCopStatusBarView, Disposable, Grim, _, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  _ = require('underscore-plus');

  Grim = require('grim');

  module.exports = DeprecationCopStatusBarView = (function() {
    DeprecationCopStatusBarView.prototype.lastLength = null;

    DeprecationCopStatusBarView.prototype.toolTipDisposable = null;

    function DeprecationCopStatusBarView() {
      this.update = bind(this.update, this);
      var clickHandler, debouncedUpdateDeprecatedSelectorCount;
      this.subscriptions = new CompositeDisposable;
      this.element = document.createElement('div');
      this.element.classList.add('deprecation-cop-status', 'inline-block', 'text-warning');
      this.element.setAttribute('tabindex', -1);
      this.icon = document.createElement('span');
      this.icon.classList.add('icon', 'icon-alert');
      this.element.appendChild(this.icon);
      this.deprecationNumber = document.createElement('span');
      this.deprecationNumber.classList.add('deprecation-number');
      this.deprecationNumber.textContent = '0';
      this.element.appendChild(this.deprecationNumber);
      clickHandler = function() {
        var workspaceElement;
        workspaceElement = atom.views.getView(atom.workspace);
        return atom.commands.dispatch(workspaceElement, 'deprecation-cop:view');
      };
      this.element.addEventListener('click', clickHandler);
      this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.element.removeEventListener('click', clickHandler);
        };
      })(this)));
      this.update();
      debouncedUpdateDeprecatedSelectorCount = _.debounce(this.update, 1000);
      this.subscriptions.add(Grim.on('updated', this.update));
      if (atom.styles.onDidUpdateDeprecations != null) {
        this.subscriptions.add(atom.styles.onDidUpdateDeprecations(debouncedUpdateDeprecatedSelectorCount));
      }
    }

    DeprecationCopStatusBarView.prototype.destroy = function() {
      this.subscriptions.dispose();
      return this.element.remove();
    };

    DeprecationCopStatusBarView.prototype.getDeprecatedCallCount = function() {
      return Grim.getDeprecations().map(function(d) {
        return d.getStackCount();
      }).reduce((function(a, b) {
        return a + b;
      }), 0);
    };

    DeprecationCopStatusBarView.prototype.getDeprecatedStyleSheetsCount = function() {
      if (atom.styles.getDeprecations != null) {
        return Object.keys(atom.styles.getDeprecations()).length;
      } else {
        return 0;
      }
    };

    DeprecationCopStatusBarView.prototype.update = function() {
      var length, ref1;
      length = this.getDeprecatedCallCount() + this.getDeprecatedStyleSheetsCount();
      if (this.lastLength === length) {
        return;
      }
      this.lastLength = length;
      this.deprecationNumber.textContent = "" + (_.pluralize(length, 'deprecation'));
      if ((ref1 = this.toolTipDisposable) != null) {
        ref1.dispose();
      }
      this.toolTipDisposable = atom.tooltips.add(this.element, {
        title: (_.pluralize(length, 'call')) + " to deprecated methods"
      });
      if (length === 0) {
        return this.element.style.display = 'none';
      } else {
        return this.element.style.display = '';
      }
    };

    return DeprecationCopStatusBarView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvZGVwcmVjYXRpb24tY29wL2xpYi9kZXByZWNhdGlvbi1jb3Atc3RhdHVzLWJhci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMEVBQUE7SUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLDZDQUFELEVBQXNCOztFQUN0QixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUNNOzBDQUNKLFVBQUEsR0FBWTs7MENBQ1osaUJBQUEsR0FBbUI7O0lBRU4scUNBQUE7O0FBQ1gsVUFBQTtNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFFckIsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLHdCQUF2QixFQUFpRCxjQUFqRCxFQUFpRSxjQUFqRTtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFBVCxDQUFzQixVQUF0QixFQUFrQyxDQUFDLENBQW5DO01BRUEsSUFBQyxDQUFBLElBQUQsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtNQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLE1BQXBCLEVBQTRCLFlBQTVCO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLElBQUMsQ0FBQSxJQUF0QjtNQUVBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtNQUNyQixJQUFDLENBQUEsaUJBQWlCLENBQUMsU0FB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QUdFLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQWYsR0FBeUIsR0FIM0I7O0lBVk07Ozs7O0FBdERWIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5HcmltID0gcmVxdWlyZSAnZ3JpbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRGVwcmVjYXRpb25Db3BTdGF0dXNCYXJWaWV3XG4gIGxhc3RMZW5ndGg6IG51bGxcbiAgdG9vbFRpcERpc3Bvc2FibGU6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgQGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZGVwcmVjYXRpb24tY29wLXN0YXR1cycsICdpbmxpbmUtYmxvY2snLCAndGV4dC13YXJuaW5nJylcbiAgICBAZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgLTEpXG5cbiAgICBAaWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIEBpY29uLmNsYXNzTGlzdC5hZGQoJ2ljb24nLCAnaWNvbi1hbGVydCcpXG4gICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQoQGljb24pXG5cbiAgICBAZGVwcmVjYXRpb25OdW1iZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBAZGVwcmVjYXRpb25OdW1iZXIuY2xhc3NMaXN0LmFkZCgnZGVwcmVjYXRpb24tbnVtYmVyJylcbiAgICBAZGVwcmVjYXRpb25OdW1iZXIudGV4dENvbnRlbnQgPSAnMCdcbiAgICBAZWxlbWVudC5hcHBlbmRDaGlsZChAZGVwcmVjYXRpb25OdW1iZXIpXG5cbiAgICBjbGlja0hhbmRsZXIgPSAtPlxuICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggd29ya3NwYWNlRWxlbWVudCwgJ2RlcHJlY2F0aW9uLWNvcDp2aWV3J1xuICAgIEBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xpY2tIYW5kbGVyKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZSg9PiBAZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrSGFuZGxlcikpKVxuXG4gICAgQHVwZGF0ZSgpXG5cbiAgICBkZWJvdW5jZWRVcGRhdGVEZXByZWNhdGVkU2VsZWN0b3JDb3VudCA9IF8uZGVib3VuY2UoQHVwZGF0ZSwgMTAwMClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBHcmltLm9uICd1cGRhdGVkJywgQHVwZGF0ZVxuICAgICMgVE9ETzogUmVtb3ZlIGNvbmRpdGlvbmFsIHdoZW4gdGhlIG5ldyBTdHlsZU1hbmFnZXIgZGVwcmVjYXRpb24gQVBJcyByZWFjaCBzdGFibGUuXG4gICAgaWYgYXRvbS5zdHlsZXMub25EaWRVcGRhdGVEZXByZWNhdGlvbnM/XG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5zdHlsZXMub25EaWRVcGRhdGVEZXByZWNhdGlvbnMoZGVib3VuY2VkVXBkYXRlRGVwcmVjYXRlZFNlbGVjdG9yQ291bnQpKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQGVsZW1lbnQucmVtb3ZlKClcblxuICBnZXREZXByZWNhdGVkQ2FsbENvdW50OiAtPlxuICAgIEdyaW0uZ2V0RGVwcmVjYXRpb25zKCkubWFwKChkKSAtPiBkLmdldFN0YWNrQ291bnQoKSkucmVkdWNlKCgoYSwgYikgLT4gYSArIGIpLCAwKVxuXG4gIGdldERlcHJlY2F0ZWRTdHlsZVNoZWV0c0NvdW50OiAtPlxuICAgICMgVE9ETzogUmVtb3ZlIGNvbmRpdGlvbmFsIHdoZW4gdGhlIG5ldyBTdHlsZU1hbmFnZXIgZGVwcmVjYXRpb24gQVBJcyByZWFjaCBzdGFibGUuXG4gICAgaWYgYXRvbS5zdHlsZXMuZ2V0RGVwcmVjYXRpb25zP1xuICAgICAgT2JqZWN0LmtleXMoYXRvbS5zdHlsZXMuZ2V0RGVwcmVjYXRpb25zKCkpLmxlbmd0aFxuICAgIGVsc2VcbiAgICAgIDBcblxuICB1cGRhdGU6ID0+XG4gICAgbGVuZ3RoID0gQGdldERlcHJlY2F0ZWRDYWxsQ291bnQoKSArIEBnZXREZXByZWNhdGVkU3R5bGVTaGVldHNDb3VudCgpXG5cbiAgICByZXR1cm4gaWYgQGxhc3RMZW5ndGggaXMgbGVuZ3RoXG5cbiAgICBAbGFzdExlbmd0aCA9IGxlbmd0aFxuICAgIEBkZXByZWNhdGlvbk51bWJlci50ZXh0Q29udGVudCA9IFwiI3tfLnBsdXJhbGl6ZShsZW5ndGgsICdkZXByZWNhdGlvbicpfVwiXG4gICAgQHRvb2xUaXBEaXNwb3NhYmxlPy5kaXNwb3NlKClcbiAgICBAdG9vbFRpcERpc3Bvc2FibGUgPSBhdG9tLnRvb2x0aXBzLmFkZCBAZWxlbWVudCwgdGl0bGU6IFwiI3tfLnBsdXJhbGl6ZShsZW5ndGgsICdjYWxsJyl9IHRvIGRlcHJlY2F0ZWQgbWV0aG9kc1wiXG5cbiAgICBpZiBsZW5ndGggaXMgMFxuICAgICAgQGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIGVsc2VcbiAgICAgIEBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJ1xuIl19
