(function() {
  var CompositeDisposable, WrapGuideElement;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = WrapGuideElement = (function() {
    function WrapGuideElement(editor, editorElement) {
      this.editor = editor;
      this.editorElement = editorElement;
      this.subscriptions = new CompositeDisposable();
      this.configSubscriptions = new CompositeDisposable();
      this.element = document.createElement('div');
      this.element.setAttribute('is', 'wrap-guide');
      this.element.classList.add('wrap-guide-container');
      this.attachToLines();
      this.handleEvents();
      this.updateGuide();
      this.element.updateGuide = this.updateGuide.bind(this);
      this.element.getDefaultColumn = this.getDefaultColumn.bind(this);
    }

    WrapGuideElement.prototype.attachToLines = function() {
      var scrollView;
      scrollView = this.editorElement.querySelector('.scroll-view');
      return scrollView != null ? scrollView.appendChild(this.element) : void 0;
    };

    WrapGuideElement.prototype.handleEvents = function() {
      var updateGuideCallback;
      updateGuideCallback = (function(_this) {
        return function() {
          return _this.updateGuide();
        };
      })(this);
      this.handleConfigEvents();
      this.subscriptions.add(atom.config.onDidChange('editor.fontSize', (function(_this) {
        return function() {
          return _this.editorElement.getComponent().getNextUpdatePromise().then(function() {
            return updateGuideCallback();
          });
        };
      })(this)));
      this.subscriptions.add(this.editorElement.onDidChangeScrollLeft(updateGuideCallback));
      this.subscriptions.add(this.editor.onDidChangePath(updateGuideCallback));
      this.subscriptions.add(this.editor.onDidChangeGrammar((function(_this) {
        return function() {
          _this.configSubscriptions.dispose();
          _this.handleConfigEvents();
          return updateGuideCallback();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          _this.subscriptions.dispose();
          return _this.configSubscriptions.dispose();
        };
      })(this)));
      return this.subscriptions.add(this.editorElement.onDidAttach((function(_this) {
        return function() {
          _this.attachToLines();
          return updateGuideCallback();
        };
      })(this)));
    };

    WrapGuideElement.prototype.handleConfigEvents = function() {
      var uniqueAscending, updateGuideCallback, updateGuidesCallback, updatePreferredLineLengthCallback;
      uniqueAscending = require('./main').uniqueAscending;
      updatePreferredLineLengthCallback = (function(_this) {
        return function(args) {
          var columns, i;
          columns = atom.config.get('wrap-guide.columns', {
            scope: _this.editor.getRootScopeDescriptor()
          });
          if (columns.length > 0) {
            columns[columns.length - 1] = args.newValue;
            columns = uniqueAscending((function() {
              var j, len, results;
              results = [];
              for (j = 0, len = columns.length; j < len; j++) {
                i = columns[j];
                if (i <= args.newValue) {
                  results.push(i);
                }
              }
              return results;
            })());
            atom.config.set('wrap-guide.columns', columns, {
              scopeSelector: "." + (_this.editor.getGrammar().scopeName)
            });
          }
          return _this.updateGuide();
        };
      })(this);
      this.configSubscriptions.add(atom.config.onDidChange('editor.preferredLineLength', {
        scope: this.editor.getRootScopeDescriptor()
      }, updatePreferredLineLengthCallback));
      updateGuideCallback = (function(_this) {
        return function() {
          return _this.updateGuide();
        };
      })(this);
      this.configSubscriptions.add(atom.config.onDidChange('wrap-guide.enabled', {
        scope: this.editor.getRootScopeDescriptor()
      }, updateGuideCallback));
      updateGuidesCallback = (function(_this) {
        return function(args) {
          var columns;
          columns = uniqueAscending(args.newValue);
          if (columns != null ? columns.length : void 0) {
            atom.config.set('wrap-guide.columns', columns);
            atom.config.set('editor.preferredLineLength', columns[columns.length - 1], {
              scopeSelector: "." + (_this.editor.getGrammar().scopeName)
            });
            return _this.updateGuide();
          }
        };
      })(this);
      return this.configSubscriptions.add(atom.config.onDidChange('wrap-guide.columns', {
        scope: this.editor.getRootScopeDescriptor()
      }, updateGuidesCallback));
    };

    WrapGuideElement.prototype.getDefaultColumn = function() {
      return atom.config.get('editor.preferredLineLength', {
        scope: this.editor.getRootScopeDescriptor()
      });
    };

    WrapGuideElement.prototype.getGuidesColumns = function(path, scopeName) {
      var columns, ref;
      columns = (ref = atom.config.get('wrap-guide.columns', {
        scope: this.editor.getRootScopeDescriptor()
      })) != null ? ref : [];
      if (columns.length > 0) {
        return columns;
      }
      return [this.getDefaultColumn()];
    };

    WrapGuideElement.prototype.isEnabled = function() {
      var ref;
      return (ref = atom.config.get('wrap-guide.enabled', {
        scope: this.editor.getRootScopeDescriptor()
      })) != null ? ref : true;
    };

    WrapGuideElement.prototype.hide = function() {
      return this.element.style.display = 'none';
    };

    WrapGuideElement.prototype.show = function() {
      return this.element.style.display = 'block';
    };

    WrapGuideElement.prototype.updateGuide = function() {
      if (this.isEnabled()) {
        return this.updateGuides();
      } else {
        return this.hide();
      }
    };

    WrapGuideElement.prototype.updateGuides = function() {
      this.removeGuides();
      this.appendGuides();
      if (this.element.children.length) {
        return this.show();
      } else {
        return this.hide();
      }
    };

    WrapGuideElement.prototype.destroy = function() {
      this.element.remove();
      this.subscriptions.dispose();
      return this.configSubscriptions.dispose();
    };

    WrapGuideElement.prototype.removeGuides = function() {
      var results;
      results = [];
      while (this.element.firstChild) {
        results.push(this.element.removeChild(this.element.firstChild));
      }
      return results;
    };

    WrapGuideElement.prototype.appendGuides = function() {
      var column, columns, j, len, results;
      columns = this.getGuidesColumns(this.editor.getPath(), this.editor.getGrammar().scopeName);
      results = [];
      for (j = 0, len = columns.length; j < len; j++) {
        column = columns[j];
        if (!(column < 0)) {
          results.push(this.appendGuide(column));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    WrapGuideElement.prototype.appendGuide = function(column) {
      var columnWidth, guide;
      columnWidth = this.editorElement.getDefaultCharacterWidth() * column;
      columnWidth -= this.editorElement.getScrollLeft();
      guide = document.createElement('div');
      guide.classList.add('wrap-guide');
      guide.style.left = (Math.round(columnWidth)) + "px";
      return this.element.appendChild(guide);
    };

    return WrapGuideElement;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvd3JhcC1ndWlkZS9saWIvd3JhcC1ndWlkZS1lbGVtZW50LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MsMEJBQUMsTUFBRCxFQUFVLGFBQVY7TUFBQyxJQUFDLENBQUEsU0FBRDtNQUFTLElBQUMsQ0FBQSxnQkFBRDtNQUNyQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJLG1CQUFKLENBQUE7TUFDakIsSUFBQyxDQUFBLG1CQUFELEdBQXVCLElBQUksbUJBQUosQ0FBQTtNQUN2QixJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULENBQXNCLElBQXRCLEVBQTRCLFlBQTVCO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbkIsQ0FBdUIsc0JBQXZCO01BQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxZQUFELENBQUE7TUFDQSxJQUFDLENBQUEsV0FBRCxDQUFBO01BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULEdBQXVCLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixJQUFsQjtNQUN2QixJQUFDLENBQUEsT0FBTyxDQUFDLGdCQUFULEdBQTRCLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixJQUF2QjtJQVhqQjs7K0JBYWIsYUFBQSxHQUFlLFNBQUE7QUFDYixVQUFBO01BQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxhQUFhLENBQUMsYUFBZixDQUE2QixjQUE3QjtrQ0FDYixVQUFVLENBQUUs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QSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQVosR0FBcUIsQ0FBQyxJQUFJLENBQUMsS0FBTCxDQUFXLFdBQVgsQ0FBRCxDQUFBLEdBQXlCO2FBQzlDLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixLQUFyQjtJQU5XOzs7OztBQWxJZiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFdyYXBHdWlkZUVsZW1lbnRcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBAY29uZmlnU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBAZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgQGVsZW1lbnQuc2V0QXR0cmlidXRlKCdpcycsICd3cmFwLWd1aWRlJylcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd3cmFwLWd1aWRlLWNvbnRhaW5lcicpXG4gICAgQGF0dGFjaFRvTGluZXMoKVxuICAgIEBoYW5kbGVFdmVudHMoKVxuICAgIEB1cGRhdGVHdWlkZSgpXG5cbiAgICBAZWxlbWVudC51cGRhdGVHdWlkZSA9IEB1cGRhdGVHdWlkZS5iaW5kKHRoaXMpXG4gICAgQGVsZW1lbnQuZ2V0RGVmYXVsdENvbHVtbiA9IEBnZXREZWZhdWx0Q29sdW1uLmJpbmQodGhpcylcblxuICBhdHRhY2hUb0xpbmVzOiAtPlxuICAgIHNjcm9sbFZpZXcgPSBAZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2Nyb2xsLXZpZXcnKVxuICAgIHNjcm9sbFZpZXc/LmFwcGVuZENoaWxkKEBlbGVtZW50KVxuXG4gIGhhbmRsZUV2ZW50czogLT5cbiAgICB1cGRhdGVHdWlkZUNhbGxiYWNrID0gPT4gQHVwZGF0ZUd1aWRlKClcblxuICAgIEBoYW5kbGVDb25maWdFdmVudHMoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdlZGl0b3IuZm9udFNpemUnLCA9PlxuICAgICAgIyBXYWl0IGZvciBlZGl0b3IgdG8gZmluaXNoIHVwZGF0aW5nIGJlZm9yZSB1cGRhdGluZyB3cmFwIGd1aWRlXG4gICAgICAjIFRPRE86IFVzZSBhc3luYy9hd2FpdCBvbmNlIHRoaXMgZmlsZSBpcyBjb252ZXJ0ZWQgdG8gSlNcbiAgICAgIEBlZGl0b3JFbGVtZW50LmdldENvbXBvbmVudCgpLmdldE5leHRVcGRhdGVQcm9taXNlKCkudGhlbiAtPiB1cGRhdGVHdWlkZUNhbGxiYWNrKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbExlZnQodXBkYXRlR3VpZGVDYWxsYmFjaylcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZVBhdGgodXBkYXRlR3VpZGVDYWxsYmFjaylcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZUdyYW1tYXIgPT5cbiAgICAgIEBjb25maWdTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgQGhhbmRsZUNvbmZpZ0V2ZW50cygpXG4gICAgICB1cGRhdGVHdWlkZUNhbGxiYWNrKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkRGVzdHJveSA9PlxuICAgICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICBAY29uZmlnU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yRWxlbWVudC5vbkRpZEF0dGFjaCA9PlxuICAgICAgQGF0dGFjaFRvTGluZXMoKVxuICAgICAgdXBkYXRlR3VpZGVDYWxsYmFjaygpXG5cbiAgaGFuZGxlQ29uZmlnRXZlbnRzOiAtPlxuICAgIHt1bmlxdWVBc2NlbmRpbmd9ID0gcmVxdWlyZSAnLi9tYWluJ1xuXG4gICAgdXBkYXRlUHJlZmVycmVkTGluZUxlbmd0aENhbGxiYWNrID0gKGFyZ3MpID0+XG4gICAgICAjIGVuc3VyZSB0aGF0IHRoZSByaWdodC1tb3N0IHdyYXAgZ3VpZGUgaXMgdGhlIHByZWZlcnJlZExpbmVMZW5ndGhcbiAgICAgIGNvbHVtbnMgPSBhdG9tLmNvbmZpZy5nZXQoJ3dyYXAtZ3VpZGUuY29sdW1ucycsIHNjb3BlOiBAZWRpdG9yLmdldFJvb3RTY29wZURlc2NyaXB0b3IoKSlcbiAgICAgIGlmIGNvbHVtbnMubGVuZ3RoID4gMFxuICAgICAgICBjb2x1bW5zW2NvbHVtbnMubGVuZ3RoIC0gMV0gPSBhcmdzLm5ld1ZhbHVlXG4gICAgICAgIGNvbHVtbnMgPSB1bmlxdWVBc2NlbmRpbmcoaSBmb3IgaSBpbiBjb2x1bW5zIHdoZW4gaSA8PSBhcmdzLm5ld1ZhbHVlKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3dyYXAtZ3VpZGUuY29sdW1ucycsIGNvbHVtbnMsXG4gICAgICAgICAgc2NvcGVTZWxlY3RvcjogXCIuI3tAZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWV9XCJcbiAgICAgIEB1cGRhdGVHdWlkZSgpXG4gICAgQGNvbmZpZ1N1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJyxcbiAgICAgIHNjb3BlOiBAZWRpdG9yLmdldFJvb3RTY29wZURlc2NyaXB0b3IoKSxcbiAgICAgIHVwZGF0ZVByZWZlcnJlZExpbmVMZW5ndGhDYWxsYmFja1xuICAgIClcblxuICAgIHVwZGF0ZUd1aWRlQ2FsbGJhY2sgPSA9PiBAdXBkYXRlR3VpZGUoKVxuICAgIEBjb25maWdTdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcbiAgICAgICd3cmFwLWd1aWRlLmVuYWJsZWQnLFxuICAgICAgc2NvcGU6IEBlZGl0b3IuZ2V0Um9vdFNjb3BlRGVzY3JpcHRvcigpLFxuICAgICAgdXBkYXRlR3VpZGVDYWxsYmFja1xuICAgIClcblxuICAgIHVwZGF0ZUd1aWRlc0NhbGxiYWNrID0gKGFyZ3MpID0+XG4gICAgICAjIGVuc3VyZSB0aGF0IG11bHRpcGxlIGd1aWRlcyBzdGF5IHNvcnRlZCBpbiBhc2NlbmRpbmcgb3JkZXJcbiAgICAgIGNvbHVtbnMgPSB1bmlxdWVBc2NlbmRpbmcoYXJncy5uZXdWYWx1ZSlcbiAgICAgIGlmIGNvbHVtbnM/Lmxlbmd0aFxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3dyYXAtZ3VpZGUuY29sdW1ucycsIGNvbHVtbnMpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCAnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnLCBjb2x1bW5zW2NvbHVtbnMubGVuZ3RoIC0gMV0sXG4gICAgICAgICAgc2NvcGVTZWxlY3RvcjogXCIuI3tAZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWV9XCJcbiAgICAgICAgQHVwZGF0ZUd1aWRlKClcbiAgICBAY29uZmlnU3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAnd3JhcC1ndWlkZS5jb2x1bW5zJyxcbiAgICAgIHNjb3BlOiBAZWRpdG9yLmdldFJvb3RTY29wZURlc2NyaXB0b3IoKSxcbiAgICAgIHVwZGF0ZUd1aWRlc0NhbGxiYWNrXG4gICAgKVxuXG4gIGdldERlZmF1bHRDb2x1bW46IC0+XG4gICAgYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCcsIHNjb3BlOiBAZWRpdG9yLmdldFJvb3RTY29wZURlc2NyaXB0b3IoKSlcblxuICBnZXRHdWlkZXNDb2x1bW5zOiAocGF0aCwgc2NvcGVOYW1lKSAtPlxuICAgIGNvbHVtbnMgPSBhdG9tLmNvbmZpZy5nZXQoJ3dyYXAtZ3VpZGUuY29sdW1ucycsIHNjb3BlOiBAZWRpdG9yLmdldFJvb3RTY29wZURlc2NyaXB0b3IoKSkgPyBbXVxuICAgIHJldHVybiBjb2x1bW5zIGlmIGNvbHVtbnMubGVuZ3RoID4gMFxuICAgIHJldHVybiBbQGdldERlZmF1bHRDb2x1bW4oKV1cblxuICBpc0VuYWJsZWQ6IC0+XG4gICAgYXRvbS5jb25maWcuZ2V0KCd3cmFwLWd1aWRlLmVuYWJsZWQnLCBzY29wZTogQGVkaXRvci5nZXRSb290U2NvcGVEZXNjcmlwdG9yKCkpID8gdHJ1ZVxuXG4gIGhpZGU6IC0+XG4gICAgQGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG4gIHNob3c6IC0+XG4gICAgQGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcblxuICB1cGRhdGVHdWlkZTogLT5cbiAgICBpZiBAaXNFbmFibGVkKClcbiAgICAgIEB1cGRhdGVHdWlkZXMoKVxuICAgIGVsc2VcbiAgICAgIEBoaWRlKClcblxuICB1cGRhdGVHdWlkZXM6IC0+XG4gICAgQHJlbW92ZUd1aWRlcygpXG4gICAgQGFwcGVuZEd1aWRlcygpXG4gICAgaWYgQGVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoXG4gICAgICBAc2hvdygpXG4gICAgZWxzZVxuICAgICAgQGhpZGUoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGVsZW1lbnQucmVtb3ZlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAY29uZmlnU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICByZW1vdmVHdWlkZXM6IC0+XG4gICAgd2hpbGUgQGVsZW1lbnQuZmlyc3RDaGlsZFxuICAgICAgQGVsZW1lbnQucmVtb3ZlQ2hpbGQoQGVsZW1lbnQuZmlyc3RDaGlsZClcblxuICBhcHBlbmRHdWlkZXM6IC0+XG4gICAgY29sdW1ucyA9IEBnZXRHdWlkZXNDb2x1bW5zKEBlZGl0b3IuZ2V0UGF0aCgpLCBAZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpXG4gICAgZm9yIGNvbHVtbiBpbiBjb2x1bW5zXG4gICAgICBAYXBwZW5kR3VpZGUoY29sdW1uKSB1bmxlc3MgY29sdW1uIDwgMFxuXG4gIGFwcGVuZEd1aWRlOiAoY29sdW1uKSAtPlxuICAgIGNvbHVtbldpZHRoID0gQGVkaXRvckVsZW1lbnQuZ2V0RGVmYXVsdENoYXJhY3RlcldpZHRoKCkgKiBjb2x1bW5cbiAgICBjb2x1bW5XaWR0aCAtPSBAZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcbiAgICBndWlkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZ3VpZGUuY2xhc3NMaXN0LmFkZCgnd3JhcC1ndWlkZScpXG4gICAgZ3VpZGUuc3R5bGUubGVmdCA9IFwiI3tNYXRoLnJvdW5kKGNvbHVtbldpZHRoKX1weFwiXG4gICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQoZ3VpZGUpXG4iXX0=
