(function() {
  var RootDragAndDropHandler, ipcRenderer, ref, remote, url,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  url = require('url');

  ref = require('electron'), ipcRenderer = ref.ipcRenderer, remote = ref.remote;

  module.exports = RootDragAndDropHandler = (function() {
    function RootDragAndDropHandler(treeView) {
      this.treeView = treeView;
      this.onDrop = bind(this.onDrop, this);
      this.onDropOnOtherWindow = bind(this.onDropOnOtherWindow, this);
      this.onDragOver = bind(this.onDragOver, this);
      this.onDragEnd = bind(this.onDragEnd, this);
      this.onDragLeave = bind(this.onDragLeave, this);
      this.onDragStart = bind(this.onDragStart, this);
      ipcRenderer.on('tree-view:project-folder-dropped', this.onDropOnOtherWindow);
      this.handleEvents();
    }

    RootDragAndDropHandler.prototype.dispose = function() {
      return ipcRenderer.removeListener('tree-view:project-folder-dropped', this.onDropOnOtherWindow);
    };

    RootDragAndDropHandler.prototype.handleEvents = function() {
      this.treeView.element.addEventListener('dragenter', this.onDragEnter.bind(this));
      this.treeView.element.addEventListener('dragend', this.onDragEnd.bind(this));
      this.treeView.element.addEventListener('dragleave', this.onDragLeave.bind(this));
      this.treeView.element.addEventListener('dragover', this.onDragOver.bind(this));
      return this.treeView.element.addEventListener('drop', this.onDrop.bind(this));
    };

    RootDragAndDropHandler.prototype.onDragStart = function(e) {
      var directory, i, index, len, pathUri, projectRoot, ref1, ref2, root, rootIndex;
      if (!this.treeView.list.contains(e.target)) {
        return;
      }
      this.prevDropTargetIndex = null;
      e.dataTransfer.setData('atom-tree-view-root-event', 'true');
      projectRoot = e.target.closest('.project-root');
      directory = projectRoot.directory;
      e.dataTransfer.setData('project-root-index', Array.from(projectRoot.parentElement.children).indexOf(projectRoot));
      rootIndex = -1;
      ref1 = this.treeView.roots;
      for (index = i = 0, len = ref1.length; i < len; index = ++i) {
        root = ref1[index];
        if (root.directory === directory) {
          rootIndex = index;
          break;
        }
      }
      e.dataTransfer.setData('from-root-index', rootIndex);
      e.dataTransfer.setData('from-root-path', directory.path);
      e.dataTransfer.setData('from-window-id', this.getWindowId());
      e.dataTransfer.setData('text/plain', directory.path);
      if ((ref2 = process.platform) === 'darwin' || ref2 === 'linux') {
        if (!this.uriHasProtocol(directory.path)) {
          pathUri = "file://" + directory.path;
        }
        return e.dataTransfer.setData('text/uri-list', pathUri);
      }
    };

    RootDragAndDropHandler.prototype.uriHasProtocol = function(uri) {
      var error;
      try {
        return url.parse(uri).protocol != null;
      } catch (error1) {
        error = error1;
        return false;
      }
    };

    RootDragAndDropHandler.prototype.onDragEnter = function(e) {
      if (!this.treeView.list.contains(e.target)) {
        return;
      }
      if (!this.isAtomTreeViewEvent(e)) {
        return;
      }
      return e.stopPropagation();
    };

    RootDragAndDropHandler.prototype.onDragLeave = function(e) {
      if (!this.treeView.list.contains(e.target)) {
        return;
      }
      if (!this.isAtomTreeViewEvent(e)) {
        return;
      }
      e.stopPropagation();
      if (e.target === e.currentTarget) {
        return this.removePlaceholder();
      }
    };

    RootDragAndDropHandler.prototype.onDragEnd = function(e) {
      if (!e.target.matches('.project-root-header')) {
        return;
      }
      if (!this.isAtomTreeViewEvent(e)) {
        return;
      }
      e.stopPropagation();
      return this.clearDropTarget();
    };

    RootDragAndDropHandler.prototype.onDragOver = function(e) {
      var element, entry, newDropTargetIndex, projectRoots;
      if (!this.treeView.list.contains(e.target)) {
        return;
      }
      if (!this.isAtomTreeViewEvent(e)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      entry = e.currentTarget;
      if (this.treeView.roots.length === 0) {
        this.treeView.list.appendChild(this.getPlaceholder());
        return;
      }
      newDropTargetIndex = this.getDropTargetIndex(e);
      if (newDropTargetIndex == null) {
        return;
      }
      if (this.prevDropTargetIndex === newDropTargetIndex) {
        return;
      }
      this.prevDropTargetIndex = newDropTargetIndex;
      projectRoots = this.treeView.roots;
      if (newDropTargetIndex < projectRoots.length) {
        element = projectRoots[newDropTargetIndex];
        element.classList.add('is-drop-target');
        return element.parentElement.insertBefore(this.getPlaceholder(), element);
      } else {
        element = projectRoots[newDropTargetIndex - 1];
        element.classList.add('drop-target-is-after');
        return element.parentElement.insertBefore(this.getPlaceholder(), element.nextSibling);
      }
    };

    RootDragAndDropHandler.prototype.onDropOnOtherWindow = function(e, fromItemIndex) {
      var paths;
      paths = atom.project.getPaths();
      paths.splice(fromItemIndex, 1);
      atom.project.setPaths(paths);
      return this.clearDropTarget();
    };

    RootDragAndDropHandler.prototype.clearDropTarget = function() {
      var element;
      element = this.treeView.element.querySelector(".is-dragging");
      if (element != null) {
        element.classList.remove('is-dragging');
      }
      if (element != null) {
        element.updateTooltip();
      }
      return this.removePlaceholder();
    };

    RootDragAndDropHandler.prototype.onDrop = function(e) {
      var browserWindow, dataTransfer, fromIndex, fromRootIndex, fromRootPath, fromWindowId, projectPaths, toIndex;
      if (!this.treeView.list.contains(e.target)) {
        return;
      }
      if (!this.isAtomTreeViewEvent(e)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      dataTransfer = e.dataTransfer;
      fromWindowId = parseInt(dataTransfer.getData('from-window-id'));
      fromRootPath = dataTransfer.getData('from-root-path');
      fromIndex = parseInt(dataTransfer.getData('project-root-index'));
      fromRootIndex = parseInt(dataTransfer.getData('from-root-index'));
      toIndex = this.getDropTargetIndex(e);
      this.clearDropTarget();
      if (fromWindowId === this.getWindowId()) {
        if (fromIndex !== toIndex) {
          projectPaths = atom.project.getPaths();
          projectPaths.splice(fromIndex, 1);
          if (toIndex > fromIndex) {
            toIndex -= 1;
          }
          projectPaths.splice(toIndex, 0, fromRootPath);
          return atom.project.setPaths(projectPaths);
        }
      } else {
        projectPaths = atom.project.getPaths();
        projectPaths.splice(toIndex, 0, fromRootPath);
        atom.project.setPaths(projectPaths);
        if (!isNaN(fromWindowId)) {
          browserWindow = remote.BrowserWindow.fromId(fromWindowId);
          return browserWindow != null ? browserWindow.webContents.send('tree-view:project-folder-dropped', fromIndex) : void 0;
        }
      }
    };

    RootDragAndDropHandler.prototype.getDropTargetIndex = function(e) {
      var center, projectRoot, projectRootIndex, projectRoots;
      if (this.isPlaceholder(e.target)) {
        return;
      }
      projectRoots = this.treeView.roots;
      projectRoot = e.target.closest('.project-root');
      if (!projectRoot) {
        projectRoot = projectRoots[projectRoots.length - 1];
      }
      if (!projectRoot) {
        return 0;
      }
      projectRootIndex = this.treeView.roots.indexOf(projectRoot);
      center = projectRoot.getBoundingClientRect().top + projectRoot.offsetHeight / 2;
      if (e.pageY < center) {
        return projectRootIndex;
      } else {
        return projectRootIndex + 1;
      }
    };

    RootDragAndDropHandler.prototype.canDragStart = function(e) {
      return e.target.closest('.project-root-header');
    };

    RootDragAndDropHandler.prototype.isDragging = function(e) {
      var i, item, len, ref1;
      ref1 = e.dataTransfer.items;
      for (i = 0, len = ref1.length; i < len; i++) {
        item = ref1[i];
        if (item.type === 'from-root-path') {
          return true;
        }
      }
      return false;
    };

    RootDragAndDropHandler.prototype.isAtomTreeViewEvent = function(e) {
      var i, item, len, ref1;
      ref1 = e.dataTransfer.items;
      for (i = 0, len = ref1.length; i < len; i++) {
        item = ref1[i];
        if (item.type === 'atom-tree-view-root-event') {
          return true;
        }
      }
      return false;
    };

    RootDragAndDropHandler.prototype.getPlaceholder = function() {
      if (!this.placeholderEl) {
        this.placeholderEl = document.createElement('li');
        this.placeholderEl.classList.add('placeholder');
      }
      return this.placeholderEl;
    };

    RootDragAndDropHandler.prototype.removePlaceholder = function() {
      var ref1;
      if ((ref1 = this.placeholderEl) != null) {
        ref1.remove();
      }
      return this.placeholderEl = null;
    };

    RootDragAndDropHandler.prototype.isPlaceholder = function(element) {
      return element.classList.contains('.placeholder');
    };

    RootDragAndDropHandler.prototype.getWindowId = function() {
      return this.processId != null ? this.processId : this.processId = atom.getCurrentWindow().id;
    };

    return RootDragAndDropHandler;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvdHJlZS12aWV3L2xpYi9yb290LWRyYWctYW5kLWRyb3AuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxREFBQTtJQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7RUFFTixNQUF3QixPQUFBLENBQVEsVUFBUixDQUF4QixFQUFDLDZCQUFELEVBQWM7O0VBS2QsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLGdDQUFDLFFBQUQ7TUFBQyxJQUFDLENBQUEsV0FBRDs7Ozs7OztNQUNaLFdBQVcsQ0FBQyxFQUFaLENBQWUsa0NBQWYsRUFBbUQsSUFBQyxDQUFBLG1CQUFwRDtNQUNBLElBQUMsQ0FBQSxZQUFELENBQUE7SUFGVzs7cUNBSWIsT0FBQSxHQUFTLFNBQUE7YUFDUCxXQUFXLENBQUMsY0FBWixDQUEyQixrQ0FBM0IsRUFBK0QsSUFBQyxDQUFBLG1CQUFoRTtJQURPOztxQ0FHVCxZQUFBLEdBQWMsU0FBQTtNQUdaLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLGdCQUFsQixDQUFtQyxXQUFuQyxFQUFnRCxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBa0IsSUFBbEIsQ0FBaEQ7TUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBbEIsQ0FBbUMsU0FBbkMsRUFBOEMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLElBQWhCLENBQTlDO01BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsZ0JBQWxCLENBQW1DLFdBQW5DLEVBQWdELElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixJQUFsQixDQUFoRDtNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLGdCQUFsQixDQUFt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ckIsY0FBQSxHQUFnQixTQUFBO01BQ2QsSUFBQSxDQUFPLElBQUMsQ0FBQSxhQUFSO1FBQ0UsSUFBQyxDQUFBLGFBQUQsR0FBaUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsSUFBdkI7UUFDakIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBekIsQ0FBNkIsYUFBN0IsRUFGRjs7YUFHQSxJQUFDLENBQUE7SUFKYTs7cUNBTWhCLGlCQUFBLEdBQW1CLFNBQUE7QUFDakIsVUFBQTs7WUFBYyxDQUFFLE1BQWhCLENBQUE7O2FBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFGQTs7cUNBSW5CLGFBQUEsR0FBZSxTQUFDLE9BQUQ7YUFDYixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQWxCLENBQTJCLGNBQTNCO0lBRGE7O3FDQUdmLFdBQUEsR0FBYSxTQUFBO3NDQUNYLElBQUMsQ0FBQSxZQUFELElBQUMsQ0FBQSxZQUFhLElBQUksQ0FBQyxnQkFBTCxDQUFBLENBQXVCLENBQUM7SUFEM0I7Ozs7O0FBdk1mIiwic291cmNlc0NvbnRlbnQiOlsidXJsID0gcmVxdWlyZSAndXJsJ1xuXG57aXBjUmVuZGVyZXIsIHJlbW90ZX0gPSByZXF1aXJlICdlbGVjdHJvbidcblxuIyBUT0RPOiBTdXBwb3J0IGRyYWdnaW5nIGV4dGVybmFsIGZvbGRlcnMgYW5kIHVzaW5nIHRoZSBkcmFnLWFuZC1kcm9wIGluZGljYXRvcnMgZm9yIHRoZW1cbiMgQ3VycmVudGx5IHRoZXkncmUgaGFuZGxlZCBpbiBUcmVlVmlldydzIGRyYWcgbGlzdGVuZXJzXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFJvb3REcmFnQW5kRHJvcEhhbmRsZXJcbiAgY29uc3RydWN0b3I6IChAdHJlZVZpZXcpIC0+XG4gICAgaXBjUmVuZGVyZXIub24oJ3RyZWUtdmlldzpwcm9qZWN0LWZvbGRlci1kcm9wcGVkJywgQG9uRHJvcE9uT3RoZXJXaW5kb3cpXG4gICAgQGhhbmRsZUV2ZW50cygpXG5cbiAgZGlzcG9zZTogLT5cbiAgICBpcGNSZW5kZXJlci5yZW1vdmVMaXN0ZW5lcigndHJlZS12aWV3OnByb2plY3QtZm9sZGVyLWRyb3BwZWQnLCBAb25Ecm9wT25PdGhlcldpbmRvdylcblxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgIyBvbkRyYWdTdGFydCBpcyBjYWxsZWQgZGlyZWN0bHkgYnkgVHJlZVZpZXcncyBvbkRyYWdTdGFydFxuICAgICMgd2lsbCBiZSBjbGVhbmVkIHVwIGJ5IHRyZWUgdmlldywgc2luY2UgdGhleSBhcmUgdHJlZS12aWV3J3MgaGFuZGxlcnNcbiAgICBAdHJlZVZpZXcuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdkcmFnZW50ZXInLCBAb25EcmFnRW50ZXIuYmluZCh0aGlzKVxuICAgIEB0cmVlVmlldy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2RyYWdlbmQnLCBAb25EcmFnRW5kLmJpbmQodGhpcylcbiAgICBAdHJlZVZpZXcuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdkcmFnbGVhdmUnLCBAb25EcmFnTGVhdmUuYmluZCh0aGlzKVxuICAgIEB0cmVlVmlldy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2RyYWdvdmVyJywgQG9uRHJhZ092ZXIuYmluZCh0aGlzKVxuICAgIEB0cmVlVmlldy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2Ryb3AnLCBAb25Ecm9wLmJpbmQodGhpcylcblxuICBvbkRyYWdTdGFydDogKGUpID0+XG4gICAgcmV0dXJuIHVubGVzcyBAdHJlZVZpZXcubGlzdC5jb250YWlucyhlLnRhcmdldClcblxuICAgIEBwcmV2RHJvcFRhcmdldEluZGV4ID0gbnVsbFxuICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEgJ2F0b20tdHJlZS12aWV3LXJvb3QtZXZlbnQnLCAndHJ1ZSdcbiAgICBwcm9qZWN0Um9vdCA9IGUudGFyZ2V0LmNsb3Nlc3QoJy5wcm9qZWN0LXJvb3QnKVxuICAgIGRpcmVjdG9yeSA9IHByb2plY3RSb290LmRpcmVjdG9yeVxuXG4gICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSAncHJvamVjdC1yb290LWluZGV4JywgQXJyYXkuZnJvbShwcm9qZWN0Um9vdC5wYXJlbnRFbGVtZW50LmNoaWxkcmVuKS5pbmRleE9mKHByb2plY3RSb290KVxuXG4gICAgcm9vdEluZGV4ID0gLTFcbiAgICAocm9vdEluZGV4ID0gaW5kZXg7IGJyZWFrKSBmb3Igcm9vdCwgaW5kZXggaW4gQHRyZWVWaWV3LnJvb3RzIHdoZW4gcm9vdC5kaXJlY3RvcnkgaXMgZGlyZWN0b3J5XG5cbiAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhICdmcm9tLXJvb3QtaW5kZXgnLCByb290SW5kZXhcbiAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhICdmcm9tLXJvb3QtcGF0aCcsIGRpcmVjdG9yeS5wYXRoXG4gICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSAnZnJvbS13aW5kb3ctaWQnLCBAZ2V0V2luZG93SWQoKVxuXG4gICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSAndGV4dC9wbGFpbicsIGRpcmVjdG9yeS5wYXRoXG5cbiAgICBpZiBwcm9jZXNzLnBsYXRmb3JtIGluIFsnZGFyd2luJywgJ2xpbnV4J11cbiAgICAgIHBhdGhVcmkgPSBcImZpbGU6Ly8je2RpcmVjdG9yeS5wYXRofVwiIHVubGVzcyBAdXJpSGFzUHJvdG9jb2woZGlyZWN0b3J5LnBhdGgpXG4gICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhICd0ZXh0L3VyaS1saXN0JywgcGF0aFVyaVxuXG4gIHVyaUhhc1Byb3RvY29sOiAodXJpKSAtPlxuICAgIHRyeVxuICAgICAgdXJsLnBhcnNlKHVyaSkucHJvdG9jb2w/XG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIGZhbHNlXG5cbiAgb25EcmFnRW50ZXI6IChlKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQHRyZWVWaWV3Lmxpc3QuY29udGFpbnMoZS50YXJnZXQpXG4gICAgcmV0dXJuIHVubGVzcyBAaXNBdG9tVHJlZVZpZXdFdmVudChlKVxuXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gIG9uRHJhZ0xlYXZlOiAoZSkgPT5cbiAgICByZXR1cm4gdW5sZXNzIEB0cmVlVmlldy5saXN0LmNvbnRhaW5zKGUudGFyZ2V0KVxuICAgIHJldHVybiB1bmxlc3MgQGlzQXRvbVRyZWVWaWV3RXZlbnQoZSlcblxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBAcmVtb3ZlUGxhY2Vob2xkZXIoKSBpZiBlLnRhcmdldCBpcyBlLmN1cnJlbnRUYXJnZXRcblxuICBvbkRyYWdFbmQ6IChlKSA9PlxuICAgIHJldHVybiB1bmxlc3MgZS50YXJnZXQubWF0Y2hlcygnLnByb2plY3Qtcm9vdC1oZWFkZXInKVxuICAgIHJldHVybiB1bmxlc3MgQGlzQXRvbVRyZWVWaWV3RXZlbnQoZSlcblxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBAY2xlYXJEcm9wVGFyZ2V0KClcblxuICBvbkRyYWdPdmVyOiAoZSkgPT5cbiAgICByZXR1cm4gdW5sZXNzIEB0cmVlVmlldy5saXN0LmNvbnRhaW5zKGUudGFyZ2V0KVxuICAgIHJldHVybiB1bmxlc3MgQGlzQXRvbVRyZWVWaWV3RXZlbnQoZSlcblxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIGVudHJ5ID0gZS5jdXJyZW50VGFyZ2V0XG5cbiAgICBpZiBAdHJlZVZpZXcucm9vdHMubGVuZ3RoIGlzIDBcbiAgICAgIEB0cmVlVmlldy5saXN0LmFwcGVuZENoaWxkKEBnZXRQbGFjZWhvbGRlcigpKVxuICAgICAgcmV0dXJuXG5cbiAgICBuZXdEcm9wVGFyZ2V0SW5kZXggPSBAZ2V0RHJvcFRhcmdldEluZGV4KGUpXG4gICAgcmV0dXJuIHVubGVzcyBuZXdEcm9wVGFyZ2V0SW5kZXg/XG4gICAgcmV0dXJuIGlmIEBwcmV2RHJvcFRhcmdldEluZGV4IGlzIG5ld0Ryb3BUYXJnZXRJbmRleFxuICAgIEBwcmV2RHJvcFRhcmdldEluZGV4ID0gbmV3RHJvcFRhcmdldEluZGV4XG5cbiAgICBwcm9qZWN0Um9vdHMgPSBAdHJlZVZpZXcucm9vdHNcblxuICAgIGlmIG5ld0Ryb3BUYXJnZXRJbmRleCA8IHByb2plY3RSb290cy5sZW5ndGhcbiAgICAgIGVsZW1lbnQgPSBwcm9qZWN0Um9vdHNbbmV3RHJvcFRhcmdldEluZGV4XVxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1kcm9wLXRhcmdldCcpXG4gICAgICBlbGVtZW50LnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKEBnZXRQbGFjZWhvbGRlcigpLCBlbGVtZW50KVxuICAgIGVsc2VcbiAgICAgIGVsZW1lbnQgPSBwcm9qZWN0Um9vdHNbbmV3RHJvcFRhcmdldEluZGV4IC0gMV1cbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZHJvcC10YXJnZXQtaXMtYWZ0ZXInKVxuICAgICAgZWxlbWVudC5wYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShAZ2V0UGxhY2Vob2xkZXIoKSwgZWxlbWVudC5uZXh0U2libGluZylcblxuICBvbkRyb3BPbk90aGVyV2luZG93OiAoZSwgZnJvbUl0ZW1JbmRleCkgPT5cbiAgICBwYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgcGF0aHMuc3BsaWNlKGZyb21JdGVtSW5kZXgsIDEpXG4gICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKHBhdGhzKVxuXG4gICAgQGNsZWFyRHJvcFRhcmdldCgpXG5cbiAgY2xlYXJEcm9wVGFyZ2V0OiAtPlxuICAgIGVsZW1lbnQgPSBAdHJlZVZpZXcuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmlzLWRyYWdnaW5nXCIpXG4gICAgZWxlbWVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtZHJhZ2dpbmcnKVxuICAgIGVsZW1lbnQ/LnVwZGF0ZVRvb2x0aXAoKVxuICAgIEByZW1vdmVQbGFjZWhvbGRlcigpXG5cbiAgb25Ecm9wOiAoZSkgPT5cbiAgICByZXR1cm4gdW5sZXNzIEB0cmVlVmlldy5saXN0LmNvbnRhaW5zKGUudGFyZ2V0KVxuICAgIHJldHVybiB1bmxlc3MgQGlzQXRvbVRyZWVWaWV3RXZlbnQoZSlcblxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIHtkYXRhVHJhbnNmZXJ9ID0gZVxuXG4gICAgZnJvbVdpbmRvd0lkID0gcGFyc2VJbnQoZGF0YVRyYW5zZmVyLmdldERhdGEoJ2Zyb20td2luZG93LWlkJykpXG4gICAgZnJvbVJvb3RQYXRoICA9IGRhdGFUcmFuc2Zlci5nZXREYXRhKCdmcm9tLXJvb3QtcGF0aCcpXG4gICAgZnJvbUluZGV4ICAgICA9IHBhcnNlSW50KGRhdGFUcmFuc2Zlci5nZXREYXRhKCdwcm9qZWN0LXJvb3QtaW5kZXgnKSlcbiAgICBmcm9tUm9vdEluZGV4ID0gcGFyc2VJbnQoZGF0YVRyYW5zZmVyLmdldERhdGEoJ2Zyb20tcm9vdC1pbmRleCcpKVxuXG4gICAgdG9JbmRleCA9IEBnZXREcm9wVGFyZ2V0SW5kZXgoZSlcblxuICAgIEBjbGVhckRyb3BUYXJnZXQoKVxuXG4gICAgaWYgZnJvbVdpbmRvd0lkIGlzIEBnZXRXaW5kb3dJZCgpXG4gICAgICB1bmxlc3MgZnJvbUluZGV4IGlzIHRvSW5kZXhcbiAgICAgICAgcHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgICAgcHJvamVjdFBhdGhzLnNwbGljZShmcm9tSW5kZXgsIDEpXG4gICAgICAgIGlmIHRvSW5kZXggPiBmcm9tSW5kZXggdGhlbiB0b0luZGV4IC09IDFcbiAgICAgICAgcHJvamVjdFBhdGhzLnNwbGljZSh0b0luZGV4LCAwLCBmcm9tUm9vdFBhdGgpXG4gICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhwcm9qZWN0UGF0aHMpXG4gICAgZWxzZVxuICAgICAgcHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgIHByb2plY3RQYXRocy5zcGxpY2UodG9JbmRleCwgMCwgZnJvbVJvb3RQYXRoKVxuICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKHByb2plY3RQYXRocylcblxuICAgICAgaWYgbm90IGlzTmFOKGZyb21XaW5kb3dJZClcbiAgICAgICAgIyBMZXQgdGhlIHdpbmRvdyB3aGVyZSB0aGUgZHJhZyBzdGFydGVkIGtub3cgdGhhdCB0aGUgdGFiIHdhcyBkcm9wcGVkXG4gICAgICAgIGJyb3dzZXJXaW5kb3cgPSByZW1vdGUuQnJvd3NlcldpbmRvdy5mcm9tSWQoZnJvbVdpbmRvd0lkKVxuICAgICAgICBicm93c2VyV2luZG93Py53ZWJDb250ZW50cy5zZW5kKCd0cmVlLXZpZXc6cHJvamVjdC1mb2xkZXItZHJvcHBlZCcsIGZyb21JbmRleClcblxuICBnZXREcm9wVGFyZ2V0SW5kZXg6IChlKSAtPlxuICAgIHJldHVybiBpZiBAaXNQbGFjZWhvbGRlcihlLnRhcmdldClcblxuICAgIHByb2plY3RSb290cyA9IEB0cmVlVmlldy5yb290c1xuICAgIHByb2plY3RSb290ID0gZS50YXJnZXQuY2xvc2VzdCgnLnByb2plY3Qtcm9vdCcpXG4gICAgcHJvamVjdFJvb3QgPSBwcm9qZWN0Um9vdHNbcHJvamVjdFJvb3RzLmxlbmd0aCAtIDFdIHVubGVzcyBwcm9qZWN0Um9vdFxuXG4gICAgcmV0dXJuIDAgdW5sZXNzIHByb2plY3RSb290XG5cbiAgICBwcm9qZWN0Um9vdEluZGV4ID0gQHRyZWVWaWV3LnJvb3RzLmluZGV4T2YocHJvamVjdFJvb3QpXG5cbiAgICBjZW50ZXIgPSBwcm9qZWN0Um9vdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgKyBwcm9qZWN0Um9vdC5vZmZzZXRIZWlnaHQgLyAyXG5cbiAgICBpZiBlLnBhZ2VZIDwgY2VudGVyXG4gICAgICBwcm9qZWN0Um9vdEluZGV4XG4gICAgZWxzZVxuICAgICAgcHJvamVjdFJvb3RJbmRleCArIDFcblxuICBjYW5EcmFnU3RhcnQ6IChlKSAtPlxuICAgIGUudGFyZ2V0LmNsb3Nlc3QoJy5wcm9qZWN0LXJvb3QtaGVhZGVyJylcblxuICBpc0RyYWdnaW5nOiAoZSkgLT5cbiAgICBmb3IgaXRlbSBpbiBlLmRhdGFUcmFuc2Zlci5pdGVtc1xuICAgICAgaWYgaXRlbS50eXBlIGlzICdmcm9tLXJvb3QtcGF0aCdcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIHJldHVybiBmYWxzZVxuXG4gIGlzQXRvbVRyZWVWaWV3RXZlbnQ6IChlKSAtPlxuICAgIGZvciBpdGVtIGluIGUuZGF0YVRyYW5zZmVyLml0ZW1zXG4gICAgICBpZiBpdGVtLnR5cGUgaXMgJ2F0b20tdHJlZS12aWV3LXJvb3QtZXZlbnQnXG4gICAgICAgIHJldHVybiB0cnVlXG5cbiAgICByZXR1cm4gZmFsc2VcblxuICBnZXRQbGFjZWhvbGRlcjogLT5cbiAgICB1bmxlc3MgQHBsYWNlaG9sZGVyRWxcbiAgICAgIEBwbGFjZWhvbGRlckVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICAgICAgQHBsYWNlaG9sZGVyRWwuY2xhc3NMaXN0LmFkZCgncGxhY2Vob2xkZXInKVxuICAgIEBwbGFjZWhvbGRlckVsXG5cbiAgcmVtb3ZlUGxhY2Vob2xkZXI6IC0+XG4gICAgQHBsYWNlaG9sZGVyRWw/LnJlbW92ZSgpXG4gICAgQHBsYWNlaG9sZGVyRWwgPSBudWxsXG5cbiAgaXNQbGFjZWhvbGRlcjogKGVsZW1lbnQpIC0+XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJy5wbGFjZWhvbGRlcicpXG5cbiAgZ2V0V2luZG93SWQ6IC0+XG4gICAgQHByb2Nlc3NJZCA/PSBhdG9tLmdldEN1cnJlbnRXaW5kb3coKS5pZFxuIl19
