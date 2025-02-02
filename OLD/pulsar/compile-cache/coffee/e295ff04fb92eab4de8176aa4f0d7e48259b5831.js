(function() {
  var CompositeDisposable, Disposable, TabView, getIconServices, layout, path, ref;

  path = require('path');

  ref = require('atom'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  getIconServices = require('./get-icon-services');

  layout = require('./layout');

  module.exports = TabView = (function() {
    function TabView(arg) {
      var base, closeIcon, didClickCloseIcon, location;
      this.item = arg.item, this.pane = arg.pane, didClickCloseIcon = arg.didClickCloseIcon, this.tabs = arg.tabs, location = arg.location;
      if (typeof this.item.getPath === 'function') {
        this.path = this.item.getPath();
      }
      this.element = document.createElement('li');
      this.element.setAttribute('is', 'tabs-tab');
      if (['TextEditor', 'TestView'].indexOf(this.item.constructor.name) > -1) {
        this.element.classList.add('texteditor');
      }
      this.element.classList.add('tab', 'sortable');
      this.itemTitle = document.createElement('div');
      this.itemTitle.classList.add('title');
      this.element.appendChild(this.itemTitle);
      if (location === 'center' || !(typeof (base = this.item).isPermanentDockItem === "function" ? base.isPermanentDockItem() : void 0)) {
        closeIcon = document.createElement('div');
        closeIcon.classList.add('close-icon');
        closeIcon.onclick = didClickCloseIcon;
        this.element.appendChild(closeIcon);
      }
      this.subscriptions = new CompositeDisposable();
      this.handleEvents();
      this.updateDataAttributes();
      this.updateTitle();
      this.updateIcon();
      this.updateModifiedStatus();
      this.setupTooltip();
      if (this.isItemPending()) {
        this.itemTitle.classList.add('temp');
        this.element.classList.add('pending-tab');
      }
      this.element.ondrag = function(e) {
        return layout.drag(e);
      };
      this.element.ondragend = function(e) {
        return layout.end(e);
      };
      this.element.pane = this.pane;
      this.element.item = this.item;
      this.element.itemTitle = this.itemTitle;
      this.element.path = this.path;
    }

    TabView.prototype.handleEvents = function() {
      var base, iconChangedHandler, modifiedHandler, onDidChangeIconDisposable, onDidChangeModifiedDisposable, onDidChangePathDisposable, onDidChangeTitleDisposable, onDidSaveDisposable, pathChangedHandler, titleChangedHandler;
      titleChangedHandler = (function(_this) {
        return function() {
          return _this.updateTitle();
        };
      })(this);
      this.subscriptions.add(this.pane.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      this.subscriptions.add(this.pane.onItemDidTerminatePendingState((function(_this) {
        return function(item) {
          if (item === _this.item) {
            return _this.clearPending();
          }
        };
      })(this)));
      if (typeof this.item.onDidChangeTitle === 'function') {
        onDidChangeTitleDisposable = this.item.onDidChangeTitle(titleChangedHandler);
        if (Disposable.isDisposable(onDidChangeTitleDisposable)) {
          this.subscriptions.add(onDidChangeTitleDisposable);
        } else {
          console.warn("::onDidChangeTitle does not return a valid Disposable!", this.item);
        }
      } else if (typeof this.item.on === 'function') {
        this.item.on('title-changed', titleChangedHandler);
        this.subscriptions.add({
          dispose: (function(_this) {
            return function() {
              var base;
              return typeof (base = _this.item).off === "function" ? base.off('title-changed', titleChangedHandler) : void 0;
            };
          })(this)
        });
      }
      pathChangedHandler = (function(_this) {
        return function(path1) {
          _this.path = path1;
          _this.updateDataAttributes();
          _this.updateTitle();
          _this.updateTooltip();
          return _this.updateIcon();
        };
      })(this);
      if (typeof this.item.onDidChangePath === 'function') {
        onDidChangePathDisposable = this.item.onDidChangePath(pathChangedHandler);
        if (Disposable.isDisposable(onDidChangePathDisposable)) {
          this.subscriptions.add(onDidChangePathDisposable);
        } else {
          console.warn("::onDidChangePath does not return a valid Disposable!", this.item);
        }
      } else if (typeof this.item.on === 'function') {
        this.item.on('path-changed', pathChangedHandler);
        this.subscriptions.add({
          dispose: (function(_this) {
            return function() {
              var base;
              return typeof (base = _this.item).off === "function" ? base.off('path-changed', pathChangedHandler) : void 0;
            };
          })(this)
        });
      }
      iconChangedHandler = (function(_this) {
        return function() {
          return _this.updateIcon();
        };
      })(this);
      this.subscriptions.add(getIconServices().onDidChange((function(_this) {
        return function() {
          return _this.updateIcon();
        };
      })(this)));
      if (typeof this.item.onDidChangeIcon === 'function') {
        onDidChangeIconDisposable = typeof (base = this.item).onDidChangeIcon === "function" ? base.onDidChangeIcon((function(_this) {
          return function() {
            return _this.updateIcon();
          };
        })(this)) : void 0;
        if (Disposable.isDisposable(onDidChangeIconDisposable)) {
          this.subscriptions.add(onDidChangeIconDisposable);
        } else {
          console.warn("::onDidChangeIcon does not return a valid Disposable!", this.item);
        }
      } else if (typeof this.item.on === 'function') {
        this.item.on('icon-changed', iconChangedHandler);
        this.subscriptions.add({
          dispose: (function(_this) {
            return function() {
              var base1;
              return typeof (base1 = _this.item).off === "function" ? base1.off('icon-changed', iconChangedHandler) : void 0;
            };
          })(this)
        });
      }
      modifiedHandler = (function(_this) {
        return function() {
          return _this.updateModifiedStatus();
        };
      })(this);
      if (typeof this.item.onDidChangeModified === 'function') {
        onDidChangeModifiedDisposable = this.item.onDidChangeModified(modifiedHandler);
        if (Disposable.isDisposable(onDidChangeModifiedDisposable)) {
          this.subscriptions.add(onDidChangeModifiedDisposable);
        } else {
          console.warn("::onDidChangeModified does not return a valid Disposable!", this.item);
        }
      } else if (typeof this.item.on === 'function') {
        this.item.on('modified-status-changed', modifiedHandler);
        this.subscriptions.add({
          dispose: (function(_this) {
            return function() {
              var base1;
              return typeof (base1 = _this.item).off === "function" ? base1.off('modified-status-changed', modifiedHandler) : void 0;
            };
          })(this)
        });
      }
      if (typeof this.item.onDidSave === 'function') {
        onDidSaveDisposable = this.item.onDidSave((function(_this) {
          return function(event) {
            _this.terminatePendingState();
            if (event.path !== _this.path) {
              _this.path = event.path;
              if (atom.config.get('tabs.enableVcsColoring')) {
                return _this.setupVcsStatus();
              }
            }
          };
        })(this));
        if (Disposable.isDisposable(onDidSaveDisposable)) {
          this.subscriptions.add(onDidSaveDisposable);
        } else {
          console.warn("::onDidSave does not return a valid Disposable!", this.item);
        }
      }
      this.subscriptions.add(atom.config.observe('tabs.showIcons', (function(_this) {
        return function() {
          return _this.updateIconVisibility();
        };
      })(this)));
      return this.subscriptions.add(atom.config.observe('tabs.enableVcsColoring', (function(_this) {
        return function(isEnabled) {
          if (isEnabled && (_this.path != null)) {
            return _this.setupVcsStatus();
          } else {
            return _this.unsetVcsStatus();
          }
        };
      })(this)));
    };

    TabView.prototype.setupTooltip = function() {
      var onMouseEnter;
      onMouseEnter = (function(_this) {
        return function() {
          _this.mouseEnterSubscription.dispose();
          _this.hasBeenMousedOver = true;
          _this.updateTooltip();
          return _this.element.dispatchEvent(new CustomEvent('mouseenter', {
            bubbles: true
          }));
        };
      })(this);
      this.mouseEnterSubscription = {
        dispose: (function(_this) {
          return function() {
            _this.element.removeEventListener('mouseenter', onMouseEnter);
            return _this.mouseEnterSubscription = null;
          };
        })(this)
      };
      return this.element.addEventListener('mouseenter', onMouseEnter);
    };

    TabView.prototype.updateTooltip = function() {
      if (!this.hasBeenMousedOver) {
        return;
      }
      this.destroyTooltip();
      if (this.path) {
        return this.tooltip = atom.tooltips.add(this.element, {
          title: this.path,
          html: false,
          delay: {
            show: 1000,
            hide: 100
          },
          placement: 'bottom'
        });
      }
    };

    TabView.prototype.destroyTooltip = function() {
      var ref1;
      if (!this.hasBeenMousedOver) {
        return;
      }
      return (ref1 = this.tooltip) != null ? ref1.dispose() : void 0;
    };

    TabView.prototype.destroy = function() {
      var ref1, ref2, ref3;
      if ((ref1 = this.subscriptions) != null) {
        ref1.dispose();
      }
      if ((ref2 = this.mouseEnterSubscription) != null) {
        ref2.dispose();
      }
      if ((ref3 = this.repoSubscriptions) != null) {
        ref3.dispose();
      }
      this.destroyTooltip();
      return this.element.remove();
    };

    TabView.prototype.updateDataAttributes = function() {
      var itemClass, ref1;
      if (this.path) {
        this.itemTitle.dataset.name = path.basename(this.path);
        this.itemTitle.dataset.path = this.path;
      } else {
        delete this.itemTitle.dataset.name;
        delete this.itemTitle.dataset.path;
      }
      if (itemClass = (ref1 = this.item.constructor) != null ? ref1.name : void 0) {
        return this.element.dataset.type = itemClass;
      } else {
        return delete this.element.dataset.type;
      }
    };

    TabView.prototype.updateTitle = function(arg) {
      var base, base1, i, len, ref1, ref2, ref3, ref4, tab, title, updateSiblings, useLongTitle;
      ref1 = arg != null ? arg : {}, updateSiblings = ref1.updateSiblings, useLongTitle = ref1.useLongTitle;
      if (this.updatingTitle) {
        return;
      }
      this.updatingTitle = true;
      if (updateSiblings === false) {
        title = this.item.getTitle();
        if (useLongTitle) {
          title = (ref2 = typeof (base = this.item).getLongTitle === "function" ? base.getLongTitle() : void 0) != null ? ref2 : title;
        }
        this.itemTitle.textContent = title;
      } else {
        title = this.item.getTitle();
        useLongTitle = false;
        ref3 = this.tabs;
        for (i = 0, len = ref3.length; i < len; i++) {
          tab = ref3[i];
          if (tab !== this) {
            if (tab.item.getTitle() === title) {
              tab.updateTitle({
                updateSiblings: false,
                useLongTitle: true
              });
              useLongTitle = true;
            }
          }
        }
        if (useLongTitle) {
          title = (ref4 = typeof (base1 = this.item).getLongTitle === "function" ? base1.getLongTitle() : void 0) != null ? ref4 : title;
        }
        this.itemTitle.textContent = title;
      }
      return this.updatingTitle = false;
    };

    TabView.prototype.updateIcon = function() {
      return getIconServices().updateTabIcon(this);
    };

    TabView.prototype.isItemPending = function() {
      if (this.pane.getPendingItem != null) {
        return this.pane.getPendingItem() === this.item;
      } else if (this.item.isPending != null) {
        return this.item.isPending();
      }
    };

    TabView.prototype.terminatePendingState = function() {
      if (this.pane.clearPendingItem != null) {
        if (this.pane.getPendingItem() === this.item) {
          return this.pane.clearPendingItem();
        }
      } else if (this.item.terminatePendingState != null) {
        return this.item.terminatePendingState();
      }
    };

    TabView.prototype.clearPending = function() {
      this.itemTitle.classList.remove('temp');
      return this.element.classList.remove('pending-tab');
    };

    TabView.prototype.updateIconVisibility = function() {
      if (atom.config.get('tabs.showIcons')) {
        return this.itemTitle.classList.remove('hide-icon');
      } else {
        return this.itemTitle.classList.add('hide-icon');
      }
    };

    TabView.prototype.updateModifiedStatus = function() {
      var base;
      if (typeof (base = this.item).isModified === "function" ? base.isModified() : void 0) {
        if (!this.isModified) {
          this.element.classList.add('modified');
        }
        return this.isModified = true;
      } else {
        if (this.isModified) {
          this.element.classList.remove('modified');
        }
        return this.isModified = false;
      }
    };

    TabView.prototype.setupVcsStatus = function() {
      if (this.path == null) {
        return;
      }
      return this.repoForPath(this.path).then((function(_this) {
        return function(repo) {
          _this.subscribeToRepo(repo);
          return _this.updateVcsStatus(repo);
        };
      })(this));
    };

    TabView.prototype.subscribeToRepo = function(repo) {
      var ref1;
      if (repo == null) {
        return;
      }
      if ((ref1 = this.repoSubscriptions) != null) {
        ref1.dispose();
      }
      this.repoSubscriptions = new CompositeDisposable();
      this.repoSubscriptions.add(repo.onDidChangeStatus((function(_this) {
        return function(event) {
          if (event.path === _this.path) {
            return _this.updateVcsStatus(repo, event.pathStatus);
          }
        };
      })(this)));
      return this.repoSubscriptions.add(repo.onDidChangeStatuses((function(_this) {
        return function() {
          return _this.updateVcsStatus(repo);
        };
      })(this)));
    };

    TabView.prototype.repoForPath = function() {
      var dir, i, len, ref1;
      ref1 = atom.project.getDirectories();
      for (i = 0, len = ref1.length; i < len; i++) {
        dir = ref1[i];
        if (dir.contains(this.path)) {
          return atom.project.repositoryForDirectory(dir);
        }
      }
      return Promise.resolve(null);
    };

    TabView.prototype.updateVcsStatus = function(repo, status) {
      var newStatus;
      if (repo == null) {
        return;
      }
      newStatus = null;
      if (repo.isPathIgnored(this.path)) {
        newStatus = 'ignored';
      } else {
        if (status == null) {
          status = repo.getCachedPathStatus(this.path);
        }
        if (repo.isStatusModified(status)) {
          newStatus = 'modified';
        } else if (repo.isStatusNew(status)) {
          newStatus = 'added';
        }
      }
      if (newStatus !== this.status) {
        this.status = newStatus;
        return this.updateVcsColoring();
      }
    };

    TabView.prototype.updateVcsColoring = function() {
      this.itemTitle.classList.remove('status-ignored', 'status-modified', 'status-added');
      if (this.status && atom.config.get('tabs.enableVcsColoring')) {
        return this.itemTitle.classList.add("status-" + this.status);
      }
    };

    TabView.prototype.unsetVcsStatus = function() {
      var ref1;
      if ((ref1 = this.repoSubscriptions) != null) {
        ref1.dispose();
      }
      delete this.status;
      return this.updateVcsColoring();
    };

    return TabView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvdGFicy9saWIvdGFiLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsTUFBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQywyQkFBRCxFQUFhOztFQUNiLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSOztFQUVsQixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLGlCQUFDLEdBQUQ7QUFDWCxVQUFBO01BRGEsSUFBQyxDQUFBLFdBQUEsTUFBTSxJQUFDLENBQUEsV0FBQSxNQUFNLDJDQUFtQixJQUFDLENBQUEsV0FBQSxNQUFNO01BQ3JELElBQUcsT0FBTyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQWIsS0FBd0IsVUFBM0I7UUFDRSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLEVBRFY7O01BR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixJQUF2QjtNQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFBVCxDQUFzQixJQUF0QixFQUE0QixVQUE1QjtNQUNBLElBQUcsQ0FBQyxZQUFELEVBQWUsVUFBZixDQUEwQixDQUFDLE9BQTNCLENBQW1DLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQXJELENBQUEsR0FBNkQsQ0FBQyxDQUFqRTtRQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLFlBQXZCLEVBREY7O01BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbkIsQ0FBdUIsS0FBdkIsRUFBOEIs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QUEsTUFBQTtRQUdFLElBQWdELGNBQWhEO1VBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxtQkFBTCxDQUF5QixJQUFDLENBQUEsSUFBMUIsRUFBVDs7UUFDQSxJQUFHLElBQUksQ0FBQyxnQkFBTCxDQUFzQixNQUF0QixDQUFIO1VBQ0UsU0FBQSxHQUFZLFdBRGQ7U0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsTUFBakIsQ0FBSDtVQUNILFNBQUEsR0FBWSxRQURUO1NBTlA7O01BU0EsSUFBRyxTQUFBLEtBQWUsSUFBQyxDQUFBLE1BQW5CO1FBQ0UsSUFBQyxDQUFBLE1BQUQsR0FBVTtlQUNWLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBRkY7O0lBYmU7O3NCQWlCakIsaUJBQUEsR0FBbUIsU0FBQTtNQUNqQixJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFyQixDQUE0QixnQkFBNUIsRUFBOEMsaUJBQTlDLEVBQWtFLGNBQWxFO01BQ0EsSUFBRyxJQUFDLENBQUEsTUFBRCxJQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsQ0FBZjtlQUNFLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQXJCLENBQXlCLFNBQUEsR0FBVSxJQUFDLENBQUEsTUFBcEMsRUFERjs7SUFGaUI7O3NCQUtuQixjQUFBLEdBQWdCLFNBQUE7QUFDZCxVQUFBOztZQUFrQixDQUFFLE9BQXBCLENBQUE7O01BQ0EsT0FBTyxJQUFDLENBQUE7YUFDUixJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQUhjOzs7OztBQXBTbEIiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbntEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5nZXRJY29uU2VydmljZXMgPSByZXF1aXJlICcuL2dldC1pY29uLXNlcnZpY2VzJ1xuXG5sYXlvdXQgPSByZXF1aXJlICcuL2xheW91dCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVGFiVmlld1xuICBjb25zdHJ1Y3RvcjogKHtAaXRlbSwgQHBhbmUsIGRpZENsaWNrQ2xvc2VJY29uLCBAdGFicywgbG9jYXRpb259KSAtPlxuICAgIGlmIHR5cGVvZiBAaXRlbS5nZXRQYXRoIGlzICdmdW5jdGlvbidcbiAgICAgIEBwYXRoID0gQGl0ZW0uZ2V0UGF0aCgpXG5cbiAgICBAZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICBAZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lzJywgJ3RhYnMtdGFiJylcbiAgICBpZiBbJ1RleHRFZGl0b3InLCAnVGVzdFZpZXcnXS5pbmRleE9mKEBpdGVtLmNvbnN0cnVjdG9yLm5hbWUpID4gLTFcbiAgICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3RleHRlZGl0b3InKVxuICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3RhYicsICdzb3J0YWJsZScpXG5cbiAgICBAaXRlbVRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBAaXRlbVRpdGxlLmNsYXNzTGlzdC5hZGQoJ3RpdGxlJylcbiAgICBAZWxlbWVudC5hcHBlbmRDaGlsZChAaXRlbVRpdGxlKVxuXG4gICAgaWYgbG9jYXRpb24gaXMgJ2NlbnRlcicgb3Igbm90IEBpdGVtLmlzUGVybWFuZW50RG9ja0l0ZW0/KClcbiAgICAgIGNsb3NlSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICBjbG9zZUljb24uY2xhc3NMaXN0LmFkZCgnY2xvc2UtaWNvbicpXG4gICAgICBjbG9zZUljb24ub25jbGljayA9IGRpZENsaWNrQ2xvc2VJY29uXG4gICAgICBAZWxlbWVudC5hcHBlbmRDaGlsZChjbG9zZUljb24pXG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIEBoYW5kbGVFdmVudHMoKVxuICAgIEB1cGRhdGVEYXRhQXR0cmlidXRlcygpXG4gICAgQHVwZGF0ZVRpdGxlKClcbiAgICBAdXBkYXRlSWNvbigpXG4gICAgQHVwZGF0ZU1vZGlmaWVkU3RhdHVzKClcbiAgICBAc2V0dXBUb29sdGlwKClcblxuICAgIGlmIEBpc0l0ZW1QZW5kaW5nKClcbiAgICAgIEBpdGVtVGl0bGUuY2xhc3NMaXN0LmFkZCgndGVtcCcpXG4gICAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdwZW5kaW5nLXRhYicpXG5cbiAgICBAZWxlbWVudC5vbmRyYWcgPSAoZSkgLT4gbGF5b3V0LmRyYWcgZVxuICAgIEBlbGVtZW50Lm9uZHJhZ2VuZCA9IChlKSAtPiBsYXlvdXQuZW5kIGVcblxuICAgIEBlbGVtZW50LnBhbmUgPSBAcGFuZVxuICAgIEBlbGVtZW50Lml0ZW0gPSBAaXRlbVxuICAgIEBlbGVtZW50Lml0ZW1UaXRsZSA9IEBpdGVtVGl0bGVcbiAgICBAZWxlbWVudC5wYXRoID0gQHBhdGhcblxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgdGl0bGVDaGFuZ2VkSGFuZGxlciA9ID0+XG4gICAgICBAdXBkYXRlVGl0bGUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBwYW5lLm9uRGlkRGVzdHJveSA9PiBAZGVzdHJveSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBwYW5lLm9uSXRlbURpZFRlcm1pbmF0ZVBlbmRpbmdTdGF0ZSAoaXRlbSkgPT5cbiAgICAgIEBjbGVhclBlbmRpbmcoKSBpZiBpdGVtIGlzIEBpdGVtXG5cbiAgICBpZiB0eXBlb2YgQGl0ZW0ub25EaWRDaGFuZ2VUaXRsZSBpcyAnZnVuY3Rpb24nXG4gICAgICBvbkRpZENoYW5nZVRpdGxlRGlzcG9zYWJsZSA9IEBpdGVtLm9uRGlkQ2hhbmdlVGl0bGUodGl0bGVDaGFuZ2VkSGFuZGxlcilcbiAgICAgIGlmIERpc3Bvc2FibGUuaXNEaXNwb3NhYmxlKG9uRGlkQ2hhbmdlVGl0bGVEaXNwb3NhYmxlKVxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5hZGQob25EaWRDaGFuZ2VUaXRsZURpc3Bvc2FibGUpXG4gICAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUud2FybiBcIjo6b25EaWRDaGFuZ2VUaXRsZSBkb2VzIG5vdCByZXR1cm4gYSB2YWxpZCBEaXNwb3NhYmxlIVwiLCBAaXRlbVxuICAgIGVsc2UgaWYgdHlwZW9mIEBpdGVtLm9uIGlzICdmdW5jdGlvbidcbiAgICAgICNUT0RPIFJlbW92ZSBvbmNlIG9sZCBldmVudHMgYXJlIG5vIGxvbmdlciBzdXBwb3J0ZWRcbiAgICAgIEBpdGVtLm9uKCd0aXRsZS1jaGFuZ2VkJywgdGl0bGVDaGFuZ2VkSGFuZGxlcilcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBkaXNwb3NlOiA9PlxuICAgICAgICBAaXRlbS5vZmY/KCd0aXRsZS1jaGFuZ2VkJywgdGl0bGVDaGFuZ2VkSGFuZGxlcilcblxuICAgIHBhdGhDaGFuZ2VkSGFuZGxlciA9IChAcGF0aCkgPT5cbiAgICAgIEB1cGRhdGVEYXRhQXR0cmlidXRlcygpXG4gICAgICBAdXBkYXRlVGl0bGUoKVxuICAgICAgQHVwZGF0ZVRvb2x0aXAoKVxuICAgICAgQHVwZGF0ZUljb24oKVxuXG4gICAgaWYgdHlwZW9mIEBpdGVtLm9uRGlkQ2hhbmdlUGF0aCBpcyAnZnVuY3Rpb24nXG4gICAgICBvbkRpZENoYW5nZVBhdGhEaXNwb3NhYmxlID0gQGl0ZW0ub25EaWRDaGFuZ2VQYXRoKHBhdGhDaGFuZ2VkSGFuZGxlcilcbiAgICAgIGlmIERpc3Bvc2FibGUuaXNEaXNwb3NhYmxlKG9uRGlkQ2hhbmdlUGF0aERpc3Bvc2FibGUpXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZChvbkRpZENoYW5nZVBhdGhEaXNwb3NhYmxlKVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLndhcm4gXCI6Om9uRGlkQ2hhbmdlUGF0aCBkb2VzIG5vdCByZXR1cm4gYSB2YWxpZCBEaXNwb3NhYmxlIVwiLCBAaXRlbVxuICAgIGVsc2UgaWYgdHlwZW9mIEBpdGVtLm9uIGlzICdmdW5jdGlvbidcbiAgICAgICNUT0RPIFJlbW92ZSBvbmNlIG9sZCBldmVudHMgYXJlIG5vIGxvbmdlciBzdXBwb3J0ZWRcbiAgICAgIEBpdGVtLm9uKCdwYXRoLWNoYW5nZWQnLCBwYXRoQ2hhbmdlZEhhbmRsZXIpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZGlzcG9zZTogPT5cbiAgICAgICAgQGl0ZW0ub2ZmPygncGF0aC1jaGFuZ2VkJywgcGF0aENoYW5nZWRIYW5kbGVyKVxuXG4gICAgaWNvbkNoYW5nZWRIYW5kbGVyID0gPT5cbiAgICAgIEB1cGRhdGVJY29uKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBnZXRJY29uU2VydmljZXMoKS5vbkRpZENoYW5nZSA9PiBAdXBkYXRlSWNvbigpXG5cbiAgICBpZiB0eXBlb2YgQGl0ZW0ub25EaWRDaGFuZ2VJY29uIGlzICdmdW5jdGlvbidcbiAgICAgIG9uRGlkQ2hhbmdlSWNvbkRpc3Bvc2FibGUgPSBAaXRlbS5vbkRpZENoYW5nZUljb24/ID0+XG4gICAgICAgIEB1cGRhdGVJY29uKClcbiAgICAgIGlmIERpc3Bvc2FibGUuaXNEaXNwb3NhYmxlKG9uRGlkQ2hhbmdlSWNvbkRpc3Bvc2FibGUpXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZChvbkRpZENoYW5nZUljb25EaXNwb3NhYmxlKVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLndhcm4gXCI6Om9uRGlkQ2hhbmdlSWNvbiBkb2VzIG5vdCByZXR1cm4gYSB2YWxpZCBEaXNwb3NhYmxlIVwiLCBAaXRlbVxuICAgIGVsc2UgaWYgdHlwZW9mIEBpdGVtLm9uIGlzICdmdW5jdGlvbidcbiAgICAgICNUT0RPIFJlbW92ZSBvbmNlIG9sZCBldmVudHMgYXJlIG5vIGxvbmdlciBzdXBwb3J0ZWRcbiAgICAgIEBpdGVtLm9uKCdpY29uLWNoYW5nZWQnLCBpY29uQ2hhbmdlZEhhbmRsZXIpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZGlzcG9zZTogPT5cbiAgICAgICAgQGl0ZW0ub2ZmPygnaWNvbi1jaGFuZ2VkJywgaWNvbkNoYW5nZWRIYW5kbGVyKVxuXG4gICAgbW9kaWZpZWRIYW5kbGVyID0gPT5cbiAgICAgIEB1cGRhdGVNb2RpZmllZFN0YXR1cygpXG5cbiAgICBpZiB0eXBlb2YgQGl0ZW0ub25EaWRDaGFuZ2VNb2RpZmllZCBpcyAnZnVuY3Rpb24nXG4gICAgICBvbkRpZENoYW5nZU1vZGlmaWVkRGlzcG9zYWJsZSA9IEBpdGVtLm9uRGlkQ2hhbmdlTW9kaWZpZWQobW9kaWZpZWRIYW5kbGVyKVxuICAgICAgaWYgRGlzcG9zYWJsZS5pc0Rpc3Bvc2FibGUob25EaWRDaGFuZ2VNb2RpZmllZERpc3Bvc2FibGUpXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZChvbkRpZENoYW5nZU1vZGlmaWVkRGlzcG9zYWJsZSlcbiAgICAgIGVsc2VcbiAgICAgICAgY29uc29sZS53YXJuIFwiOjpvbkRpZENoYW5nZU1vZGlmaWVkIGRvZXMgbm90IHJldHVybiBhIHZhbGlkIERpc3Bvc2FibGUhXCIsIEBpdGVtXG4gICAgZWxzZSBpZiB0eXBlb2YgQGl0ZW0ub24gaXMgJ2Z1bmN0aW9uJ1xuICAgICAgI1RPRE8gUmVtb3ZlIG9uY2Ugb2xkIGV2ZW50cyBhcmUgbm8gbG9uZ2VyIHN1cHBvcnRlZFxuICAgICAgQGl0ZW0ub24oJ21vZGlmaWVkLXN0YXR1cy1jaGFuZ2VkJywgbW9kaWZpZWRIYW5kbGVyKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGRpc3Bvc2U6ID0+XG4gICAgICAgIEBpdGVtLm9mZj8oJ21vZGlmaWVkLXN0YXR1cy1jaGFuZ2VkJywgbW9kaWZpZWRIYW5kbGVyKVxuXG4gICAgaWYgdHlwZW9mIEBpdGVtLm9uRGlkU2F2ZSBpcyAnZnVuY3Rpb24nXG4gICAgICBvbkRpZFNhdmVEaXNwb3NhYmxlID0gQGl0ZW0ub25EaWRTYXZlIChldmVudCkgPT5cbiAgICAgICAgQHRlcm1pbmF0ZVBlbmRpbmdTdGF0ZSgpXG4gICAgICAgIGlmIGV2ZW50LnBhdGggaXNudCBAcGF0aFxuICAgICAgICAgIEBwYXRoID0gZXZlbnQucGF0aFxuICAgICAgICAgIEBzZXR1cFZjc1N0YXR1cygpIGlmIGF0b20uY29uZmlnLmdldCAndGFicy5lbmFibGVWY3NDb2xvcmluZydcblxuICAgICAgaWYgRGlzcG9zYWJsZS5pc0Rpc3Bvc2FibGUob25EaWRTYXZlRGlzcG9zYWJsZSlcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkKG9uRGlkU2F2ZURpc3Bvc2FibGUpXG4gICAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUud2FybiBcIjo6b25EaWRTYXZlIGRvZXMgbm90IHJldHVybiBhIHZhbGlkIERpc3Bvc2FibGUhXCIsIEBpdGVtXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3RhYnMuc2hvd0ljb25zJywgPT5cbiAgICAgIEB1cGRhdGVJY29uVmlzaWJpbGl0eSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAndGFicy5lbmFibGVWY3NDb2xvcmluZycsIChpc0VuYWJsZWQpID0+XG4gICAgICBpZiBpc0VuYWJsZWQgYW5kIEBwYXRoPyB0aGVuIEBzZXR1cFZjc1N0YXR1cygpIGVsc2UgQHVuc2V0VmNzU3RhdHVzKClcblxuICBzZXR1cFRvb2x0aXA6IC0+XG4gICAgIyBEZWZlciBjcmVhdGluZyB0aGUgdG9vbHRpcCB1bnRpbCB0aGUgdGFiIGlzIG1vdXNlZCBvdmVyXG4gICAgb25Nb3VzZUVudGVyID0gPT5cbiAgICAgIEBtb3VzZUVudGVyU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgQGhhc0JlZW5Nb3VzZWRPdmVyID0gdHJ1ZVxuICAgICAgQHVwZGF0ZVRvb2x0aXAoKVxuXG4gICAgICAjIFRyaWdnZXIgYWdhaW4gc28gdGhlIHRvb2x0aXAgc2hvd3NcbiAgICAgIEBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdtb3VzZWVudGVyJywgYnViYmxlczogdHJ1ZSkpXG5cbiAgICBAbW91c2VFbnRlclN1YnNjcmlwdGlvbiA9IGRpc3Bvc2U6ID0+XG4gICAgICBAZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuICAgICAgQG1vdXNlRW50ZXJTdWJzY3JpcHRpb24gPSBudWxsXG5cbiAgICBAZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXG4gIHVwZGF0ZVRvb2x0aXA6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaGFzQmVlbk1vdXNlZE92ZXJcblxuICAgIEBkZXN0cm95VG9vbHRpcCgpXG5cbiAgICBpZiBAcGF0aFxuICAgICAgQHRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAZWxlbWVudCxcbiAgICAgICAgdGl0bGU6IEBwYXRoXG4gICAgICAgIGh0bWw6IGZhbHNlXG4gICAgICAgIGRlbGF5OlxuICAgICAgICAgIHNob3c6IDEwMDBcbiAgICAgICAgICBoaWRlOiAxMDBcbiAgICAgICAgcGxhY2VtZW50OiAnYm90dG9tJ1xuXG4gIGRlc3Ryb3lUb29sdGlwOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGhhc0JlZW5Nb3VzZWRPdmVyXG4gICAgQHRvb2x0aXA/LmRpc3Bvc2UoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBtb3VzZUVudGVyU3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcbiAgICBAcmVwb1N1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBkZXN0cm95VG9vbHRpcCgpXG4gICAgQGVsZW1lbnQucmVtb3ZlKClcblxuICB1cGRhdGVEYXRhQXR0cmlidXRlczogLT5cbiAgICBpZiBAcGF0aFxuICAgICAgQGl0ZW1UaXRsZS5kYXRhc2V0Lm5hbWUgPSBwYXRoLmJhc2VuYW1lKEBwYXRoKVxuICAgICAgQGl0ZW1UaXRsZS5kYXRhc2V0LnBhdGggPSBAcGF0aFxuICAgIGVsc2VcbiAgICAgIGRlbGV0ZSBAaXRlbVRpdGxlLmRhdGFzZXQubmFtZVxuICAgICAgZGVsZXRlIEBpdGVtVGl0bGUuZGF0YXNldC5wYXRoXG5cbiAgICBpZiBpdGVtQ2xhc3MgPSBAaXRlbS5jb25zdHJ1Y3Rvcj8ubmFtZVxuICAgICAgQGVsZW1lbnQuZGF0YXNldC50eXBlID0gaXRlbUNsYXNzXG4gICAgZWxzZVxuICAgICAgZGVsZXRlIEBlbGVtZW50LmRhdGFzZXQudHlwZVxuXG4gIHVwZGF0ZVRpdGxlOiAoe3VwZGF0ZVNpYmxpbmdzLCB1c2VMb25nVGl0bGV9PXt9KSAtPlxuICAgIHJldHVybiBpZiBAdXBkYXRpbmdUaXRsZVxuICAgIEB1cGRhdGluZ1RpdGxlID0gdHJ1ZVxuXG4gICAgaWYgdXBkYXRlU2libGluZ3MgaXMgZmFsc2VcbiAgICAgIHRpdGxlID0gQGl0ZW0uZ2V0VGl0bGUoKVxuICAgICAgdGl0bGUgPSBAaXRlbS5nZXRMb25nVGl0bGU/KCkgPyB0aXRsZSBpZiB1c2VMb25nVGl0bGVcbiAgICAgIEBpdGVtVGl0bGUudGV4dENvbnRlbnQgPSB0aXRsZVxuICAgIGVsc2VcbiAgICAgIHRpdGxlID0gQGl0ZW0uZ2V0VGl0bGUoKVxuICAgICAgdXNlTG9uZ1RpdGxlID0gZmFsc2VcbiAgICAgIGZvciB0YWIgaW4gQHRhYnMgd2hlbiB0YWIgaXNudCB0aGlzXG4gICAgICAgIGlmIHRhYi5pdGVtLmdldFRpdGxlKCkgaXMgdGl0bGVcbiAgICAgICAgICB0YWIudXBkYXRlVGl0bGUodXBkYXRlU2libGluZ3M6IGZhbHNlLCB1c2VMb25nVGl0bGU6IHRydWUpXG4gICAgICAgICAgdXNlTG9uZ1RpdGxlID0gdHJ1ZVxuICAgICAgdGl0bGUgPSBAaXRlbS5nZXRMb25nVGl0bGU/KCkgPyB0aXRsZSBpZiB1c2VMb25nVGl0bGVcblxuICAgICAgQGl0ZW1UaXRsZS50ZXh0Q29udGVudCA9IHRpdGxlXG5cbiAgICBAdXBkYXRpbmdUaXRsZSA9IGZhbHNlXG5cbiAgdXBkYXRlSWNvbjogLT5cbiAgICBnZXRJY29uU2VydmljZXMoKS51cGRhdGVUYWJJY29uKHRoaXMpXG5cbiAgaXNJdGVtUGVuZGluZzogLT5cbiAgICBpZiBAcGFuZS5nZXRQZW5kaW5nSXRlbT9cbiAgICAgIEBwYW5lLmdldFBlbmRpbmdJdGVtKCkgaXMgQGl0ZW1cbiAgICBlbHNlIGlmIEBpdGVtLmlzUGVuZGluZz9cbiAgICAgIEBpdGVtLmlzUGVuZGluZygpXG5cbiAgdGVybWluYXRlUGVuZGluZ1N0YXRlOiAtPlxuICAgIGlmIEBwYW5lLmNsZWFyUGVuZGluZ0l0ZW0/XG4gICAgICBAcGFuZS5jbGVhclBlbmRpbmdJdGVtKCkgaWYgQHBhbmUuZ2V0UGVuZGluZ0l0ZW0oKSBpcyBAaXRlbVxuICAgIGVsc2UgaWYgQGl0ZW0udGVybWluYXRlUGVuZGluZ1N0YXRlP1xuICAgICAgQGl0ZW0udGVybWluYXRlUGVuZGluZ1N0YXRlKClcblxuICBjbGVhclBlbmRpbmc6IC0+XG4gICAgQGl0ZW1UaXRsZS5jbGFzc0xpc3QucmVtb3ZlKCd0ZW1wJylcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdwZW5kaW5nLXRhYicpXG5cbiAgdXBkYXRlSWNvblZpc2liaWxpdHk6IC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0ICd0YWJzLnNob3dJY29ucydcbiAgICAgIEBpdGVtVGl0bGUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZS1pY29uJylcbiAgICBlbHNlXG4gICAgICBAaXRlbVRpdGxlLmNsYXNzTGlzdC5hZGQoJ2hpZGUtaWNvbicpXG5cbiAgdXBkYXRlTW9kaWZpZWRTdGF0dXM6IC0+XG4gICAgaWYgQGl0ZW0uaXNNb2RpZmllZD8oKVxuICAgICAgQGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbW9kaWZpZWQnKSB1bmxlc3MgQGlzTW9kaWZpZWRcbiAgICAgIEBpc01vZGlmaWVkID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIEBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ21vZGlmaWVkJykgaWYgQGlzTW9kaWZpZWRcbiAgICAgIEBpc01vZGlmaWVkID0gZmFsc2VcblxuICBzZXR1cFZjc1N0YXR1czogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwYXRoP1xuICAgIEByZXBvRm9yUGF0aChAcGF0aCkudGhlbiAocmVwbykgPT5cbiAgICAgIEBzdWJzY3JpYmVUb1JlcG8ocmVwbylcbiAgICAgIEB1cGRhdGVWY3NTdGF0dXMocmVwbylcblxuICAjIFN1YnNjcmliZSB0byB0aGUgcHJvamVjdCdzIHJlcG8gZm9yIGNoYW5nZXMgdG8gdGhlIFZDUyBzdGF0dXMgb2YgdGhlIGZpbGUuXG4gIHN1YnNjcmliZVRvUmVwbzogKHJlcG8pIC0+XG4gICAgcmV0dXJuIHVubGVzcyByZXBvP1xuXG4gICAgIyBSZW1vdmUgcHJldmlvdXMgcmVwbyBzdWJzY3JpcHRpb25zLlxuICAgIEByZXBvU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQHJlcG9TdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgQHJlcG9TdWJzY3JpcHRpb25zLmFkZCByZXBvLm9uRGlkQ2hhbmdlU3RhdHVzIChldmVudCkgPT5cbiAgICAgIEB1cGRhdGVWY3NTdGF0dXMocmVwbywgZXZlbnQucGF0aFN0YXR1cykgaWYgZXZlbnQucGF0aCBpcyBAcGF0aFxuICAgIEByZXBvU3Vic2NyaXB0aW9ucy5hZGQgcmVwby5vbkRpZENoYW5nZVN0YXR1c2VzID0+XG4gICAgICBAdXBkYXRlVmNzU3RhdHVzKHJlcG8pXG5cbiAgcmVwb0ZvclBhdGg6IC0+XG4gICAgZm9yIGRpciBpbiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuICAgICAgcmV0dXJuIGF0b20ucHJvamVjdC5yZXBvc2l0b3J5Rm9yRGlyZWN0b3J5KGRpcikgaWYgZGlyLmNvbnRhaW5zIEBwYXRoXG4gICAgUHJvbWlzZS5yZXNvbHZlKG51bGwpXG5cbiAgIyBVcGRhdGUgdGhlIFZDUyBzdGF0dXMgcHJvcGVydHkgb2YgdGhpcyB0YWIgdXNpbmcgdGhlIHJlcG8uXG4gIHVwZGF0ZVZjc1N0YXR1czogKHJlcG8sIHN0YXR1cykgLT5cbiAgICByZXR1cm4gdW5sZXNzIHJlcG8/XG5cbiAgICBuZXdTdGF0dXMgPSBudWxsXG4gICAgaWYgcmVwby5pc1BhdGhJZ25vcmVkKEBwYXRoKVxuICAgICAgbmV3U3RhdHVzID0gJ2lnbm9yZWQnXG4gICAgZWxzZVxuICAgICAgc3RhdHVzID0gcmVwby5nZXRDYWNoZWRQYXRoU3RhdHVzKEBwYXRoKSB1bmxlc3Mgc3RhdHVzP1xuICAgICAgaWYgcmVwby5pc1N0YXR1c01vZGlmaWVkKHN0YXR1cylcbiAgICAgICAgbmV3U3RhdHVzID0gJ21vZGlmaWVkJ1xuICAgICAgZWxzZSBpZiByZXBvLmlzU3RhdHVzTmV3KHN0YXR1cylcbiAgICAgICAgbmV3U3RhdHVzID0gJ2FkZGVkJ1xuXG4gICAgaWYgbmV3U3RhdHVzIGlzbnQgQHN0YXR1c1xuICAgICAgQHN0YXR1cyA9IG5ld1N0YXR1c1xuICAgICAgQHVwZGF0ZVZjc0NvbG9yaW5nKClcblxuICB1cGRhdGVWY3NDb2xvcmluZzogLT5cbiAgICBAaXRlbVRpdGxlLmNsYXNzTGlzdC5yZW1vdmUoJ3N0YXR1cy1pZ25vcmVkJywgJ3N0YXR1cy1tb2RpZmllZCcsICAnc3RhdHVzLWFkZGVkJylcbiAgICBpZiBAc3RhdHVzIGFuZCBhdG9tLmNvbmZpZy5nZXQgJ3RhYnMuZW5hYmxlVmNzQ29sb3JpbmcnXG4gICAgICBAaXRlbVRpdGxlLmNsYXNzTGlzdC5hZGQoXCJzdGF0dXMtI3tAc3RhdHVzfVwiKVxuXG4gIHVuc2V0VmNzU3RhdHVzOiAtPlxuICAgIEByZXBvU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgZGVsZXRlIEBzdGF0dXNcbiAgICBAdXBkYXRlVmNzQ29sb3JpbmcoKVxuIl19
