(function() {
  var Disposable, FileInfoView, fs, url;

  Disposable = require('atom').Disposable;

  url = require('url');

  fs = require('fs-plus');

  module.exports = FileInfoView = (function() {
    function FileInfoView() {
      var clickHandler;
      this.element = document.createElement('status-bar-file');
      this.element.classList.add('file-info', 'inline-block');
      this.currentPath = document.createElement('a');
      this.currentPath.classList.add('current-path');
      this.element.appendChild(this.currentPath);
      this.element.currentPath = this.currentPath;
      this.element.getActiveItem = this.getActiveItem.bind(this);
      this.activeItemSubscription = atom.workspace.getCenter().onDidChangeActivePaneItem((function(_this) {
        return function() {
          return _this.subscribeToActiveItem();
        };
      })(this));
      this.subscribeToActiveItem();
      this.registerTooltip();
      clickHandler = (function(_this) {
        return function(event) {
          var isShiftClick, text;
          isShiftClick = event.shiftKey;
          _this.showCopiedTooltip(isShiftClick);
          text = _this.getActiveItemCopyText(isShiftClick);
          atom.clipboard.write(text);
          return setTimeout(function() {
            return _this.clearCopiedTooltip();
          }, 2000);
        };
      })(this);
      this.element.addEventListener('click', clickHandler);
      this.clickSubscription = new Disposable((function(_this) {
        return function() {
          return _this.element.removeEventListener('click', clickHandler);
        };
      })(this));
    }

    FileInfoView.prototype.registerTooltip = function() {
      return this.tooltip = atom.tooltips.add(this.element, {
        title: function() {
          return "Click to copy absolute file path (Shift + Click to copy relative path)";
        }
      });
    };

    FileInfoView.prototype.clearCopiedTooltip = function() {
      var ref;
      if ((ref = this.copiedTooltip) != null) {
        ref.dispose();
      }
      return this.registerTooltip();
    };

    FileInfoView.prototype.showCopiedTooltip = function(copyRelativePath) {
      var ref, ref1, text;
      if ((ref = this.tooltip) != null) {
        ref.dispose();
      }
      if ((ref1 = this.copiedTooltip) != null) {
        ref1.dispose();
      }
      text = this.getActiveItemCopyText(copyRelativePath);
      return this.copiedTooltip = atom.tooltips.add(this.element, {
        title: "Copied: " + text,
        trigger: 'manual',
        delay: {
          show: 0
        }
      });
    };

    FileInfoView.prototype.getActiveItemCopyText = function(copyRelativePath) {
      var activeItem, path, relativized;
      activeItem = this.getActiveItem();
      path = activeItem != null ? typeof activeItem.getPath === "function" ? activeItem.getPath() : void 0 : void 0;
      if (path == null) {
        return (activeItem != null ? typeof activeItem.getTitle === "function" ? activeItem.getTitle() : void 0 : void 0) || '';
      }
      if (copyRelativePath) {
        relativized = atom.project.relativize(path);
        if (relativized !== path) {
          return relativized;
        }
      }
      if ((path != null ? path.indexOf('://') : void 0) > 0) {
        path = url.parse(path).path;
      }
      return path;
    };

    FileInfoView.prototype.subscribeToActiveItem = function() {
      var activeItem, ref, ref1;
      if ((ref = this.modifiedSubscription) != null) {
        ref.dispose();
      }
      if ((ref1 = this.titleSubscription) != null) {
        ref1.dispose();
      }
      if (activeItem = this.getActiveItem()) {
        if (this.updateCallback == null) {
          this.updateCallback = (function(_this) {
            return function() {
              return _this.update();
            };
          })(this);
        }
        if (typeof activeItem.onDidChangeTitle === 'function') {
          this.titleSubscription = activeItem.onDidChangeTitle(this.updateCallback);
        } else if (typeof activeItem.on === 'function') {
          activeItem.on('title-changed', this.updateCallback);
          this.titleSubscription = {
            dispose: (function(_this) {
              return function() {
                return typeof activeItem.off === "function" ? activeItem.off('title-changed', _this.updateCallback) : void 0;
              };
            })(this)
          };
        }
        this.modifiedSubscription = typeof activeItem.onDidChangeModified === "function" ? activeItem.onDidChangeModified(this.updateCallback) : void 0;
      }
      return this.update();
    };

    FileInfoView.prototype.destroy = function() {
      var ref, ref1, ref2, ref3, ref4;
      this.activeItemSubscription.dispose();
      if ((ref = this.titleSubscription) != null) {
        ref.dispose();
      }
      if ((ref1 = this.modifiedSubscription) != null) {
        ref1.dispose();
      }
      if ((ref2 = this.clickSubscription) != null) {
        ref2.dispose();
      }
      if ((ref3 = this.copiedTooltip) != null) {
        ref3.dispose();
      }
      return (ref4 = this.tooltip) != null ? ref4.dispose() : void 0;
    };

    FileInfoView.prototype.getActiveItem = function() {
      return atom.workspace.getCenter().getActivePaneItem();
    };

    FileInfoView.prototype.update = function() {
      var ref;
      this.updatePathText();
      return this.updateBufferHasModifiedText((ref = this.getActiveItem()) != null ? typeof ref.isModified === "function" ? ref.isModified() : void 0 : void 0);
    };

    FileInfoView.prototype.updateBufferHasModifiedText = function(isModified) {
      if (isModified) {
        this.element.classList.add('buffer-modified');
        return this.isModified = true;
      } else {
        this.element.classList.remove('buffer-modified');
        return this.isModified = false;
      }
    };

    FileInfoView.prototype.updatePathText = function() {
      var path, ref, ref1, relativized, title;
      if (path = (ref = this.getActiveItem()) != null ? typeof ref.getPath === "function" ? ref.getPath() : void 0 : void 0) {
        relativized = atom.project.relativize(path);
        return this.currentPath.textContent = relativized != null ? fs.tildify(relativized) : path;
      } else if (title = (ref1 = this.getActiveItem()) != null ? typeof ref1.getTitle === "function" ? ref1.getTitle() : void 0 : void 0) {
        return this.currentPath.textContent = title;
      } else {
        return this.currentPath.textContent = '';
      }
    };

    return FileInfoView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvc3RhdHVzLWJhci9saWIvZmlsZS1pbmZvLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSOztFQUNmLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7RUFDTixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBRUwsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHNCQUFBO0FBQ1gsVUFBQTtNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsaUJBQXZCO01BQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbkIsQ0FBdUIsV0FBdkIsRUFBb0MsY0FBcEM7TUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCO01BQ2YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBdkIsQ0FBMkIsY0FBM0I7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsSUFBQyxDQUFBLFdBQXRCO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULEdBQXVCLElBQUMsQ0FBQTtNQUV4QixJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsR0FBeUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQW9CLElBQXBCO01BRXpCLElBQUMsQ0FBQSxzQkFBRCxHQUEwQixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQWYsQ0FBQSxDQUEwQixDQUFDLHlCQUEzQixDQUFxRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzdFLEtBQUMsQ0FBQSxxQkFBRCxDQUFBO1FBRDZFO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyRDtNQUUx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Q0FBQSxVQUFELEdBQWMsS0FGaEI7T0FBQSxNQUFBO1FBSUUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBbkIsQ0FBMEIsaUJBQTFCO2VBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxNQUxoQjs7SUFEMkI7OzJCQVE3QixjQUFBLEdBQWdCLFNBQUE7QUFDZCxVQUFBO01BQUEsSUFBRyxJQUFBLGlGQUF1QixDQUFFLDJCQUE1QjtRQUNFLFdBQUEsR0FBYyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQWIsQ0FBd0IsSUFBeEI7ZUFDZCxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBOEIsbUJBQUgsR0FBcUIsRUFBRSxDQUFDLE9BQUgsQ0FBVyxXQUFYLENBQXJCLEdBQWtELEtBRi9FO09BQUEsTUFHSyxJQUFHLEtBQUEscUZBQXdCLENBQUUsNEJBQTdCO2VBQ0gsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLEdBQTJCLE1BRHhCO09BQUEsTUFBQTtlQUdILElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQixHQUh4Qjs7SUFKUzs7Ozs7QUE5R2xCIiwic291cmNlc0NvbnRlbnQiOlsie0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnVybCA9IHJlcXVpcmUgJ3VybCdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRmlsZUluZm9WaWV3XG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3RhdHVzLWJhci1maWxlJylcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdmaWxlLWluZm8nLCAnaW5saW5lLWJsb2NrJylcblxuICAgIEBjdXJyZW50UGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICAgIEBjdXJyZW50UGF0aC5jbGFzc0xpc3QuYWRkKCdjdXJyZW50LXBhdGgnKVxuICAgIEBlbGVtZW50LmFwcGVuZENoaWxkKEBjdXJyZW50UGF0aClcbiAgICBAZWxlbWVudC5jdXJyZW50UGF0aCA9IEBjdXJyZW50UGF0aFxuXG4gICAgQGVsZW1lbnQuZ2V0QWN0aXZlSXRlbSA9IEBnZXRBY3RpdmVJdGVtLmJpbmQodGhpcylcblxuICAgIEBhY3RpdmVJdGVtU3Vic2NyaXB0aW9uID0gYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSA9PlxuICAgICAgQHN1YnNjcmliZVRvQWN0aXZlSXRlbSgpXG4gICAgQHN1YnNjcmliZVRvQWN0aXZlSXRlbSgpXG5cbiAgICBAcmVnaXN0ZXJUb29sdGlwKClcbiAgICBjbGlja0hhbmRsZXIgPSAoZXZlbnQpID0+XG4gICAgICBpc1NoaWZ0Q2xpY2sgPSBldmVudC5zaGlmdEtleVxuICAgICAgQHNob3dDb3BpZWRUb29sdGlwKGlzU2hpZnRDbGljaylcbiAgICAgIHRleHQgPSBAZ2V0QWN0aXZlSXRlbUNvcHlUZXh0KGlzU2hpZnRDbGljaylcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHRleHQpXG4gICAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAgIEBjbGVhckNvcGllZFRvb2x0aXAoKVxuICAgICAgLCAyMDAwXG5cbiAgICBAZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrSGFuZGxlcilcbiAgICBAY2xpY2tTdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZSA9PiBAZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrSGFuZGxlcilcblxuICByZWdpc3RlclRvb2x0aXA6IC0+XG4gICAgQHRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZChAZWxlbWVudCwgdGl0bGU6IC0+XG4gICAgICBcIkNsaWNrIHRvIGNvcHkgYWJzb2x1dGUgZmlsZSBwYXRoIChTaGlmdCArIENsaWNrIHRvIGNvcHkgcmVsYXRpdmUgcGF0aClcIilcblxuICBjbGVhckNvcGllZFRvb2x0aXA6IC0+XG4gICAgQGNvcGllZFRvb2x0aXA/LmRpc3Bvc2UoKVxuICAgIEByZWdpc3RlclRvb2x0aXAoKVxuXG4gIHNob3dDb3BpZWRUb29sdGlwOiAoY29weVJlbGF0aXZlUGF0aCkgLT5cbiAgICBAdG9vbHRpcD8uZGlzcG9zZSgpXG4gICAgQGNvcGllZFRvb2x0aXA/LmRpc3Bvc2UoKVxuICAgIHRleHQgPSBAZ2V0QWN0aXZlSXRlbUNvcHlUZXh0KGNvcHlSZWxhdGl2ZVBhdGgpXG4gICAgQGNvcGllZFRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAZWxlbWVudCxcbiAgICAgIHRpdGxlOiBcIkNvcGllZDogI3t0ZXh0fVwiXG4gICAgICB0cmlnZ2VyOiAnbWFudWFsJ1xuICAgICAgZGVsYXk6XG4gICAgICAgIHNob3c6IDBcblxuICBnZXRBY3RpdmVJdGVtQ29weVRleHQ6IChjb3B5UmVsYXRpdmVQYXRoKSAtPlxuICAgIGFjdGl2ZUl0ZW0gPSBAZ2V0QWN0aXZlSXRlbSgpXG4gICAgcGF0aCA9IGFjdGl2ZUl0ZW0/LmdldFBhdGg/KClcbiAgICByZXR1cm4gYWN0aXZlSXRlbT8uZ2V0VGl0bGU/KCkgb3IgJycgaWYgbm90IHBhdGg/XG5cbiAgICAjIE1ha2Ugc3VyZSB3ZSB0cnkgdG8gcmVsYXRpdml6ZSBiZWZvcmUgcGFyc2luZyBVUkxzLlxuICAgIGlmIGNvcHlSZWxhdGl2ZVBhdGhcbiAgICAgIHJlbGF0aXZpemVkID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemUocGF0aClcbiAgICAgIGlmIHJlbGF0aXZpemVkIGlzbnQgcGF0aFxuICAgICAgICByZXR1cm4gcmVsYXRpdml6ZWRcblxuICAgICMgQW4gaXRlbSBwYXRoIGNvdWxkIGJlIGEgdXJsLCB3ZSBvbmx5IHdhbnQgdG8gY29weSB0aGUgYHBhdGhgIHBhcnRcbiAgICBpZiBwYXRoPy5pbmRleE9mKCc6Ly8nKSA+IDBcbiAgICAgIHBhdGggPSB1cmwucGFyc2UocGF0aCkucGF0aFxuICAgIHBhdGhcblxuICBzdWJzY3JpYmVUb0FjdGl2ZUl0ZW06IC0+XG4gICAgQG1vZGlmaWVkU3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcbiAgICBAdGl0bGVTdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuXG4gICAgaWYgYWN0aXZlSXRlbSA9IEBnZXRBY3RpdmVJdGVtKClcbiAgICAgIEB1cGRhdGVDYWxsYmFjayA/PSA9PiBAdXBkYXRlKClcblxuICAgICAgaWYgdHlwZW9mIGFjdGl2ZUl0ZW0ub25EaWRDaGFuZ2VUaXRsZSBpcyAnZnVuY3Rpb24nXG4gICAgICAgIEB0aXRsZVN1YnNjcmlwdGlvbiA9IGFjdGl2ZUl0ZW0ub25EaWRDaGFuZ2VUaXRsZShAdXBkYXRlQ2FsbGJhY2spXG4gICAgICBlbHNlIGlmIHR5cGVvZiBhY3RpdmVJdGVtLm9uIGlzICdmdW5jdGlvbidcbiAgICAgICAgI1RPRE8gUmVtb3ZlIG9uY2UgdGl0bGUtY2hhbmdlZCBldmVudCBzdXBwb3J0IGlzIHJlbW92ZWRcbiAgICAgICAgYWN0aXZlSXRlbS5vbigndGl0bGUtY2hhbmdlZCcsIEB1cGRhdGVDYWxsYmFjaylcbiAgICAgICAgQHRpdGxlU3Vic2NyaXB0aW9uID0gZGlzcG9zZTogPT5cbiAgICAgICAgICBhY3RpdmVJdGVtLm9mZj8oJ3RpdGxlLWNoYW5nZWQnLCBAdXBkYXRlQ2FsbGJhY2spXG5cbiAgICAgIEBtb2RpZmllZFN1YnNjcmlwdGlvbiA9IGFjdGl2ZUl0ZW0ub25EaWRDaGFuZ2VNb2RpZmllZD8oQHVwZGF0ZUNhbGxiYWNrKVxuXG4gICAgQHVwZGF0ZSgpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAYWN0aXZlSXRlbVN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICBAdGl0bGVTdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuICAgIEBtb2RpZmllZFN1YnNjcmlwdGlvbj8uZGlzcG9zZSgpXG4gICAgQGNsaWNrU3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcbiAgICBAY29waWVkVG9vbHRpcD8uZGlzcG9zZSgpXG4gICAgQHRvb2x0aXA/LmRpc3Bvc2UoKVxuXG4gIGdldEFjdGl2ZUl0ZW06IC0+XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuXG4gIHVwZGF0ZTogLT5cbiAgICBAdXBkYXRlUGF0aFRleHQoKVxuICAgIEB1cGRhdGVCdWZmZXJIYXNNb2RpZmllZFRleHQoQGdldEFjdGl2ZUl0ZW0oKT8uaXNNb2RpZmllZD8oKSlcblxuICB1cGRhdGVCdWZmZXJIYXNNb2RpZmllZFRleHQ6IChpc01vZGlmaWVkKSAtPlxuICAgIGlmIGlzTW9kaWZpZWRcbiAgICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2J1ZmZlci1tb2RpZmllZCcpXG4gICAgICBAaXNNb2RpZmllZCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBAZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdidWZmZXItbW9kaWZpZWQnKVxuICAgICAgQGlzTW9kaWZpZWQgPSBmYWxzZVxuXG4gIHVwZGF0ZVBhdGhUZXh0OiAtPlxuICAgIGlmIHBhdGggPSBAZ2V0QWN0aXZlSXRlbSgpPy5nZXRQYXRoPygpXG4gICAgICByZWxhdGl2aXplZCA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplKHBhdGgpXG4gICAgICBAY3VycmVudFBhdGgudGV4dENvbnRlbnQgPSBpZiByZWxhdGl2aXplZD8gdGhlbiBmcy50aWxkaWZ5KHJlbGF0aXZpemVkKSBlbHNlIHBhdGhcbiAgICBlbHNlIGlmIHRpdGxlID0gQGdldEFjdGl2ZUl0ZW0oKT8uZ2V0VGl0bGU/KClcbiAgICAgIEBjdXJyZW50UGF0aC50ZXh0Q29udGVudCA9IHRpdGxlXG4gICAgZWxzZVxuICAgICAgQGN1cnJlbnRQYXRoLnRleHRDb250ZW50ID0gJydcbiJdfQ==
