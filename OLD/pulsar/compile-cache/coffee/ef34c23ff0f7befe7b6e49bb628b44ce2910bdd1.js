(function() {
  var CompositeDisposable, Dialog, Disposable, Emitter, Point, Range, TextEditor, getFullExtension, path, ref;

  ref = require('atom'), TextEditor = ref.TextEditor, CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable, Emitter = ref.Emitter, Range = ref.Range, Point = ref.Point;

  path = require('path');

  getFullExtension = require("./helpers").getFullExtension;

  module.exports = Dialog = (function() {
    function Dialog(arg) {
      var baseName, blurHandler, extension, iconClass, initialPath, prompt, ref1, select, selectionEnd, selectionStart;
      ref1 = arg != null ? arg : {}, initialPath = ref1.initialPath, select = ref1.select, iconClass = ref1.iconClass, prompt = ref1.prompt;
      this.emitter = new Emitter();
      this.disposables = new CompositeDisposable();
      this.element = document.createElement('div');
      this.element.classList.add('tree-view-dialog');
      this.promptText = document.createElement('label');
      this.promptText.classList.add('icon');
      if (iconClass) {
        this.promptText.classList.add(iconClass);
      }
      this.promptText.textContent = prompt;
      this.element.appendChild(this.promptText);
      this.miniEditor = new TextEditor({
        mini: true
      });
      blurHandler = (function(_this) {
        return function() {
          if (document.hasFocus()) {
            return _this.close();
          }
        };
      })(this);
      this.miniEditor.element.addEventListener('blur', blurHandler);
      this.disposables.add(new Disposable((function(_this) {
        return function() {
          return _this.miniEditor.element.removeEventListener('blur', blurHandler);
        };
      })(this)));
      this.disposables.add(this.miniEditor.onDidChange((function(_this) {
        return function() {
          return _this.showError();
        };
      })(this)));
      this.element.appendChild(this.miniEditor.element);
      this.errorMessage = document.createElement('div');
      this.errorMessage.classList.add('error-message');
      this.element.appendChild(this.errorMessage);
      atom.commands.add(this.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.onConfirm(_this.miniEditor.getText());
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this)
      });
      this.miniEditor.setText(initialPath);
      if (select) {
        extension = getFullExtension(initialPath);
        baseName = path.basename(initialPath);
        selectionStart = initialPath.length - baseName.length;
        if (baseName === extension) {
          selectionEnd = initialPath.length;
        } else {
          selectionEnd = initialPath.length - extension.length;
        }
        this.miniEditor.setSelectedBufferRange(Range(Point(0, selectionStart), Point(0, selectionEnd)));
      }
    }

    Dialog.prototype.attach = function() {
      this.panel = atom.workspace.addModalPanel({
        item: this
      });
      this.miniEditor.element.focus();
      return this.miniEditor.scrollToCursorPosition();
    };

    Dialog.prototype.close = function() {
      var activePane, panel;
      panel = this.panel;
      this.panel = null;
      if (panel != null) {
        panel.destroy();
      }
      this.emitter.dispose();
      this.disposables.dispose();
      this.miniEditor.destroy();
      activePane = atom.workspace.getCenter().getActivePane();
      if (!activePane.isDestroyed()) {
        return activePane.activate();
      }
    };

    Dialog.prototype.cancel = function() {
      var ref1;
      this.close();
      return (ref1 = document.querySelector('.tree-view')) != null ? ref1.focus() : void 0;
    };

    Dialog.prototype.showError = function(message) {
      if (message == null) {
        message = '';
      }
      this.errorMessage.textContent = message;
      if (message) {
        this.element.classList.add('error');
        return window.setTimeout(((function(_this) {
          return function() {
            return _this.element.classList.remove('error');
          };
        })(this)), 300);
      }
    };

    return Dialog;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvdHJlZS12aWV3L2xpYi9kaWFsb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUF1RSxPQUFBLENBQVEsTUFBUixDQUF2RSxFQUFDLDJCQUFELEVBQWEsNkNBQWIsRUFBa0MsMkJBQWxDLEVBQThDLHFCQUE5QyxFQUF1RCxpQkFBdkQsRUFBOEQ7O0VBQzlELElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTixtQkFBb0IsT0FBQSxDQUFRLFdBQVI7O0VBRXJCLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxnQkFBQyxHQUFEO0FBQ1gsVUFBQTsyQkFEWSxNQUEyQyxJQUExQyxnQ0FBYSxzQkFBUSw0QkFBVztNQUM3QyxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksT0FBSixDQUFBO01BQ1gsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJLG1CQUFKLENBQUE7TUFFZixJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbkIsQ0FBdUIsa0JBQXZCO01BRUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxRQUFRLENBQUMsYUFBVCxDQUF1QixPQUF2QjtNQUNkLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQXRCLENBQTBCLE1BQTFCO01BQ0EsSUFBd0MsU0FBeEM7UUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUF0QixDQUEwQixTQUExQixFQUFBOztNQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsV0FBWixHQUEwQjtNQUMxQixJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsSUFBQyxDQUFBLFVBQXRCO01BRUEsSUFB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LENBQUE7TUFDVCxJQUFDLENBQUEsS0FBRCxHQUFTOztRQUNULEtBQUssQ0FBRSxPQUFQLENBQUE7O01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQUE7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBO01BQ0EsVUFBQSxHQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBZixDQUFBLENBQTBCLENBQUMsYUFBM0IsQ0FBQTtNQUNiLElBQUEsQ0FBNkIsVUFBVSxDQUFDLFdBQVgsQ0FBQSxDQUE3QjtlQUFBLFVBQVUsQ0FBQyxRQUFYLENBQUEsRUFBQTs7SUFSSzs7cUJBVVAsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBQTt5RUFDb0MsQ0FBRSxLQUF0QyxDQUFBO0lBRk07O3FCQUlSLFNBQUEsR0FBVyxTQUFDLE9BQUQ7O1FBQUMsVUFBUTs7TUFDbEIsSUFBQyxDQUFBLFlBQVksQ0FBQyxXQUFkLEdBQTRCO01BQzVCLElBQUcsT0FBSDtRQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLE9BQXZCO2VBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsQ0FBQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQW5CLENBQTBCLE9BQTFCO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUQsQ0FBbEIsRUFBMkQsR0FBM0QsRUFGRjs7SUFGUzs7Ozs7QUFsRWIiLCJzb3VyY2VzQ29udGVudCI6WyJ7VGV4dEVkaXRvciwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSwgRW1pdHRlciwgUmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbntnZXRGdWxsRXh0ZW5zaW9ufSA9IHJlcXVpcmUgXCIuL2hlbHBlcnNcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBEaWFsb2dcbiAgY29uc3RydWN0b3I6ICh7aW5pdGlhbFBhdGgsIHNlbGVjdCwgaWNvbkNsYXNzLCBwcm9tcHR9ID0ge30pIC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgQGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3RyZWUtdmlldy1kaWFsb2cnKVxuXG4gICAgQHByb21wdFRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpXG4gICAgQHByb21wdFRleHQuY2xhc3NMaXN0LmFkZCgnaWNvbicpXG4gICAgQHByb21wdFRleHQuY2xhc3NMaXN0LmFkZChpY29uQ2xhc3MpIGlmIGljb25DbGFzc1xuICAgIEBwcm9tcHRUZXh0LnRleHRDb250ZW50ID0gcHJvbXB0XG4gICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQoQHByb21wdFRleHQpXG5cbiAgICBAbWluaUVkaXRvciA9IG5ldyBUZXh0RWRpdG9yKHttaW5pOiB0cnVlfSlcbiAgICBibHVySGFuZGxlciA9ID0+XG4gICAgICBAY2xvc2UoKSBpZiBkb2N1bWVudC5oYXNGb2N1cygpXG4gICAgQG1pbmlFZGl0b3IuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgYmx1ckhhbmRsZXIpXG4gICAgQGRpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSg9PiBAbWluaUVkaXRvci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCBibHVySGFuZGxlcikpKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQoQG1pbmlFZGl0b3Iub25EaWRDaGFuZ2UgPT4gQHNob3dFcnJvcigpKVxuICAgIEBlbGVtZW50LmFwcGVuZENoaWxkKEBtaW5pRWRpdG9yLmVsZW1lbnQpXG5cbiAgICBAZXJyb3JNZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBAZXJyb3JNZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ2Vycm9yLW1lc3NhZ2UnKVxuICAgIEBlbGVtZW50LmFwcGVuZENoaWxkKEBlcnJvck1lc3NhZ2UpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZWxlbWVudCxcbiAgICAgICdjb3JlOmNvbmZpcm0nOiA9PiBAb25Db25maXJtKEBtaW5pRWRpdG9yLmdldFRleHQoKSlcbiAgICAgICdjb3JlOmNhbmNlbCc6ID0+IEBjYW5jZWwoKVxuXG4gICAgQG1pbmlFZGl0b3Iuc2V0VGV4dChpbml0aWFsUGF0aClcblxuICAgIGlmIHNlbGVjdFxuICAgICAgZXh0ZW5zaW9uID0gZ2V0RnVsbEV4dGVuc2lvbihpbml0aWFsUGF0aClcbiAgICAgIGJhc2VOYW1lID0gcGF0aC5iYXNlbmFtZShpbml0aWFsUGF0aClcbiAgICAgIHNlbGVjdGlvblN0YXJ0ID0gaW5pdGlhbFBhdGgubGVuZ3RoIC0gYmFzZU5hbWUubGVuZ3RoXG4gICAgICBpZiBiYXNlTmFtZSBpcyBleHRlbnNpb25cbiAgICAgICAgc2VsZWN0aW9uRW5kID0gaW5pdGlhbFBhdGgubGVuZ3RoXG4gICAgICBlbHNlXG4gICAgICAgIHNlbGVjdGlvbkVuZCA9IGluaXRpYWxQYXRoLmxlbmd0aCAtIGV4dGVuc2lvbi5sZW5ndGhcbiAgICAgIEBtaW5pRWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UoUmFuZ2UoUG9pbnQoMCwgc2VsZWN0aW9uU3RhcnQpLCBQb2ludCgwLCBzZWxlY3Rpb25FbmQpKSlcblxuICBhdHRhY2g6IC0+XG4gICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgIEBtaW5pRWRpdG9yLmVsZW1lbnQuZm9jdXMoKVxuICAgIEBtaW5pRWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKVxuXG4gIGNsb3NlOiAtPlxuICAgIHBhbmVsID0gQHBhbmVsXG4gICAgQHBhbmVsID0gbnVsbFxuICAgIHBhbmVsPy5kZXN0cm95KClcbiAgICBAZW1pdHRlci5kaXNwb3NlKClcbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQG1pbmlFZGl0b3IuZGVzdHJveSgpXG4gICAgYWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLmdldEFjdGl2ZVBhbmUoKVxuICAgIGFjdGl2ZVBhbmUuYWN0aXZhdGUoKSB1bmxlc3MgYWN0aXZlUGFuZS5pc0Rlc3Ryb3llZCgpXG5cbiAgY2FuY2VsOiAtPlxuICAgIEBjbG9zZSgpXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRyZWUtdmlldycpPy5mb2N1cygpXG5cbiAgc2hvd0Vycm9yOiAobWVzc2FnZT0nJykgLT5cbiAgICBAZXJyb3JNZXNzYWdlLnRleHRDb250ZW50ID0gbWVzc2FnZVxuICAgIGlmIG1lc3NhZ2VcbiAgICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2Vycm9yJylcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCg9PiBAZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdlcnJvcicpKSwgMzAwKVxuIl19
