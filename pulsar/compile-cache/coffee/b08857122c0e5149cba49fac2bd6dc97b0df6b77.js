(function() {
  var AddDialog, AddProjectsView, BufferedProcess, CompositeDisposable, CopyDialog, Directory, DirectoryView, Emitter, IgnoredNames, MoveDialog, RootDragAndDrop, TREE_VIEW_URI, TreeView, _, fs, getFullExtension, getStyleObject, nextId, path, ref, ref1, repoForPath, shell, toggleConfig,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');

  shell = require('electron').shell;

  _ = require('underscore-plus');

  ref = require('atom'), BufferedProcess = ref.BufferedProcess, CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ref1 = require("./helpers"), repoForPath = ref1.repoForPath, getStyleObject = ref1.getStyleObject, getFullExtension = ref1.getFullExtension;

  fs = require('fs-plus');

  AddDialog = require('./add-dialog');

  MoveDialog = require('./move-dialog');

  CopyDialog = require('./copy-dialog');

  IgnoredNames = null;

  AddProjectsView = require('./add-projects-view');

  Directory = require('./directory');

  DirectoryView = require('./directory-view');

  RootDragAndDrop = require('./root-drag-and-drop');

  TREE_VIEW_URI = 'atom://tree-view';

  toggleConfig = function(keyPath) {
    return atom.config.set(keyPath, !atom.config.get(keyPath));
  };

  nextId = 1;

  module.exports = TreeView = (function() {
    function TreeView(state) {
      this.onDragLeave = bind(this.onDragLeave, this);
      this.onDragEnter = bind(this.onDragEnter, this);
      this.onStylesheetsChanged = bind(this.onStylesheetsChanged, this);
      this.moveConflictingEntry = bind(this.moveConflictingEntry, this);
      var j, len, observer, ref2, ref3, selectedPath;
      this.id = nextId++;
      this.element = document.createElement('div');
      this.element.classList.add('tool-panel', 'tree-view');
      this.element.tabIndex = -1;
      this.list = document.createElement('ol');
      this.list.classList.add('tree-view-root', 'full-menu', 'list-tree', 'has-collapsable-children', 'focusable-panel');
      this.disposables = new CompositeDisposable;
      this.emitter = new Emitter;
      this.roots = [];
      this.selectedPath = null;
      this.selectOnMouseUp = null;
      this.lastFocusedEntry = null;
      this.ignoredPatterns = [];
      this.useSyncFS = false;
      this.currentlyOpening = new Map;
      this.editorsToMove = [];
      this.editorsToDestroy = [];
      this.dragEventCounts = new WeakMap;
      this.rootDragAndDrop = new RootDragAndDrop(this);
      this.handleEvents();
      process.nextTick((function(_this) {
        return function() {
          var onStylesheetsChanged;
          _this.onStylesheetsChanged();
          onStylesheetsChanged = _.debounce(_this.onStylesheetsChanged, 100);
          _this.disposables.add(atom.styles.onDidAddStyleElement(onStylesheetsChanged));
          _this.disposables.add(atom.styles.onDidRemoveStyleElement(onStylesheetsChanged));
          return _this.disposables.add(atom.styles.onDidUpdateStyleElement(onStylesheetsChanged));
        };
      })(this));
      this.updateRoots(state.directoryExpansionStates);
      if (((ref2 = state.selectedPaths) != null ? ref2.length : void 0) > 0) {
        ref3 = state.selectedPaths;
        for (j = 0, len = ref3.length; j < len; j++) {
          selectedPath = ref3[j];
          this.selectMultipleEntries(this.entryForPath(selectedPath));
        }
      } else {
        this.selectEntry(this.roots[0]);
      }
      if ((state.scrollTop != null) || (state.scrollLeft != null)) {
        observer = new IntersectionObserver((function(_this) {
          return function() {
            if (_this.isVisible()) {
              _this.element.scrollTop = state.scrollTop;
              _this.element.scrollLeft = state.scrollLeft;
              return observer.disconnect();
            }
          };
        })(this));
        observer.observe(this.element);
      }
      if (state.width > 0) {
        this.element.style.width = state.width + "px";
      }
      this.disposables.add(this.onWillMoveEntry((function(_this) {
        return function(arg) {
          var editor, editors, filePath, initialPath, k, l, len1, len2, newPath, results, results1;
          initialPath = arg.initialPath, newPath = arg.newPath;
          editors = atom.workspace.getTextEditors();
          if (fs.isDirectorySync(initialPath)) {
            initialPath += path.sep;
            results = [];
            for (k = 0, len1 = editors.length; k < len1; k++) {
              editor = editors[k];
              filePath = editor.getPath();
              if (filePath != null ? filePath.startsWith(initialPath) : void 0) {
                results.push(_this.editorsToMove.push(filePath));
              } else {
                results.push(void 0);
              }
            }
            return results;
          } else {
            results1 = [];
            for (l = 0, len2 = editors.length; l < len2; l++) {
              editor = editors[l];
              filePath = editor.getPath();
              if (filePath === initialPath) {
                results1.push(_this.editorsToMove.push(filePath));
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }
        };
      })(this)));
      this.disposables.add(this.onEntryMoved((function(_this) {
        return function(arg) {
          var editor, filePath, index, initialPath, k, len1, newPath, ref4, results;
          initialPath = arg.initialPath, newPath = arg.newPath;
          ref4 = atom.workspace.getTextEditors();
          results = [];
          for (k = 0, len1 = ref4.length; k < len1; k++) {
            editor = ref4[k];
            filePath = editor.getPath();
            index = _this.editorsToMove.indexOf(filePath);
            if (index !== -1) {
              editor.getBuffer().setPath(filePath.replace(initialPath, newPath));
              results.push(_this.editorsToMove.splice(index, 1));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this)));
      this.disposables.add(this.onMoveEntryFailed((function(_this) {
        return function(arg) {
          var index, initialPath, newPath;
          initialPath = arg.initialPath, newPath = arg.newPath;
          index = _this.editorsToMove.indexOf(initialPath);
          if (index !== -1) {
            return _this.editorsToMove.splice(index, 1);
          }
        };
      })(this)));
      this.disposables.add(this.onWillDeleteEntry((function(_this) {
        return function(arg) {
          var editor, editors, filePath, k, l, len1, len2, pathToDelete, results, results1;
          pathToDelete = arg.pathToDelete;
          editors = atom.workspace.getTextEditors();
          if (fs.isDirectorySync(pathToDelete)) {
            pathToDelete += path.sep;
            results = [];
            for (k = 0, len1 = editors.length; k < len1; k++) {
              editor = editors[k];
              filePath = editor.getPath();
              if ((filePath != null ? filePath.startsWith(pathToDelete) : void 0) && !editor.isModified()) {
                results.push(_this.editorsToDestroy.push(filePath));
              } else {
                results.push(void 0);
              }
            }
            return results;
          } else {
            results1 = [];
            for (l = 0, len2 = editors.length; l < len2; l++) {
              editor = editors[l];
              filePath = editor.getPath();
              if (filePath === pathToDelete && !editor.isModified()) {
                results1.push(_this.editorsToDestroy.push(filePath));
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }
        };
      })(this)));
      this.disposables.add(this.onEntryDeleted((function(_this) {
        return function(arg) {
          var editor, index, k, len1, pathToDelete, ref4, results;
          pathToDelete = arg.pathToDelete;
          ref4 = atom.workspace.getTextEditors();
          results = [];
          for (k = 0, len1 = ref4.length; k < len1; k++) {
            editor = ref4[k];
            index = _this.editorsToDestroy.indexOf(editor.getPath());
            if (index !== -1) {
              editor.destroy();
              results.push(_this.editorsToDestroy.splice(index, 1));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this)));
      this.disposables.add(this.onDeleteEntryFailed((function(_this) {
        return function(arg) {
          var index, pathToDelete;
          pathToDelete = arg.pathToDelete;
          index = _this.editorsToDestroy.indexOf(pathToDelete);
          if (index !== -1) {
            return _this.editorsToDestroy.splice(index, 1);
          }
        };
      })(this)));
    }

    TreeView.prototype.serialize = function() {
      return {
        directoryExpansionStates: new (function(roots) {
          var j, len, root;
          for (j = 0, len = roots.length; j < len; j++) {
            root = roots[j];
            this[root.directory.path] = root.directory.serializeExpansionState();
          }
          return this;
        })(this.roots),
        deserializer: 'TreeView',
        selectedPaths: Array.from(this.getSelectedEntries(), function(entry) {
          return entry.getPath();
        }),
        scrollLeft: this.element.scrollLeft,
        scrollTop: this.element.scrollTop,
        width: parseInt(this.element.style.width || 0)
      };
    };

    TreeView.prototype.destroy = function() {
      var j, len, ref2, root;
      ref2 = this.roots;
      for (j = 0, len = ref2.length; j < len; j++) {
        root = ref2[j];
        root.directory.destroy();
      }
      this.disposables.dispose();
      this.rootDragAndDrop.dispose();
      return this.emitter.emit('did-destroy');
    };

    TreeView.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    TreeView.prototype.getTitle = function() {
      return "Project";
    };

    TreeView.prototype.getURI = function() {
      return TREE_VIEW_URI;
    };

    TreeView.prototype.getPreferredLocation = function() {
      if (atom.config.get('tree-view.showOnRightSide')) {
        return 'right';
      } else {
        return 'left';
      }
    };

    TreeView.prototype.getAllowedLocations = function() {
      return ["left", "right"];
    };

    TreeView.prototype.isPermanentDockItem = function() {
      return true;
    };

    TreeView.prototype.getPreferredWidth = function() {
      var result;
      this.list.style.width = 'min-content';
      result = this.list.offsetWidth;
      this.list.style.width = '';
      return result;
    };

    TreeView.prototype.onDirectoryCreated = function(callback) {
      return this.emitter.on('directory-created', callback);
    };

    TreeView.prototype.onEntryCopied = function(callback) {
      return this.emitter.on('entry-copied', callback);
    };

    TreeView.prototype.onWillDeleteEntry = function(callback) {
      return this.emitter.on('will-delete-entry', callback);
    };

    TreeView.prototype.onEntryDeleted = function(callback) {
      return this.emitter.on('entry-deleted', callback);
    };

    TreeView.prototype.onDeleteEntryFailed = function(callback) {
      return this.emitter.on('delete-entry-failed', callback);
    };

    TreeView.prototype.onWillMoveEntry = function(callback) {
      return this.emitter.on('will-move-entry', callback);
    };

    TreeView.prototype.onEntryMoved = function(callback) {
      return this.emitter.on('entry-moved', callback);
    };

    TreeView.prototype.onMoveEntryFailed = function(callback) {
      return this.emitter.on('move-entry-failed', callback);
    };

    TreeView.prototype.onFileCreated = function(callback) {
      return this.emitter.on('file-created', callback);
    };

    TreeView.prototype.handleEvents = function() {
      this.element.addEventListener('click', (function(_this) {
        return function(e) {
          if (e.target.classList.contains('entries')) {
            return;
          }
          if (!(e.shiftKey || e.metaKey || e.ctrlKey)) {
            return _this.entryClicked(e);
          }
        };
      })(this));
      this.element.addEventListener('mousedown', (function(_this) {
        return function(e) {
          return _this.onMouseDown(e);
        };
      })(this));
      this.element.addEventListener('mouseup', (function(_this) {
        return function(e) {
          return _this.onMouseUp(e);
        };
      })(this));
      this.element.addEventListener('dragstart', (function(_this) {
        return function(e) {
          return _this.onDragStart(e);
        };
      })(this));
      this.element.addEventListener('dragenter', (function(_this) {
        return function(e) {
          return _this.onDragEnter(e);
        };
      })(this));
      this.element.addEventListener('dragleave', (function(_this) {
        return function(e) {
          return _this.onDragLeave(e);
        };
      })(this));
      this.element.addEventListener('dragover', (function(_this) {
        return function(e) {
          return _this.onDragOver(e);
        };
      })(this));
      this.element.addEventListener('drop', (function(_this) {
        return function(e) {
          return _this.onDrop(e);
        };
      })(this));
      atom.commands.add(this.element, {
        'core:move-up': (function(_this) {
          return function(e) {
            return _this.moveUp(e);
          };
        })(this),
        'core:move-down': (function(_this) {
          return function(e) {
            return _this.moveDown(e);
          };
        })(this),
        'core:page-up': (function(_this) {
          return function() {
            return _this.pageUp();
          };
        })(this),
        'core:page-down': (function(_this) {
          return function() {
            return _this.pageDown();
          };
        })(this),
        'core:move-to-top': (function(_this) {
          return function() {
            return _this.scrollToTop();
          };
        })(this),
        'core:move-to-bottom': (function(_this) {
          return function() {
            return _this.scrollToBottom();
          };
        })(this),
        'tree-view:expand-item': (function(_this) {
          return function() {
            return _this.openSelectedEntry({
              pending: true
            }, true);
          };
        })(this),
        'tree-view:recursive-expand-directory': (function(_this) {
          return function() {
            return _this.expandDirectory(true);
          };
        })(this),
        'tree-view:collapse-directory': (function(_this) {
          return function() {
            return _this.collapseDirectory();
          };
        })(this),
        'tree-view:recursive-collapse-directory': (function(_this) {
          return function() {
            return _this.collapseDirectory(true);
          };
        })(this),
        'tree-view:collapse-all': (function(_this) {
          return function() {
            return _this.collapseDirectory(true, true);
          };
        })(this),
        'tree-view:open-selected-entry': (function(_this) {
          return function() {
            return _this.openSelectedEntry();
          };
        })(this),
        'tree-view:open-selected-entry-right': (function(_this) {
          return function() {
            return _this.openSelectedEntryRight();
          };
        })(this),
        'tree-view:open-selected-entry-left': (function(_this) {
          return function() {
            return _this.openSelectedEntryLeft();
          };
        })(this),
        'tree-view:open-selected-entry-up': (function(_this) {
          return function() {
            return _this.openSelectedEntryUp();
          };
        })(this),
        'tree-view:open-selected-entry-down': (function(_this) {
          return function() {
            return _this.openSelectedEntryDown();
          };
        })(this),
        'tree-view:move': (function(_this) {
          return function() {
            return _this.moveSelectedEntry();
          };
        })(this),
        'tree-view:copy': (function(_this) {
          return function() {
            return _this.copySelectedEntries();
          };
        })(this),
        'tree-view:cut': (function(_this) {
          return function() {
            return _this.cutSelectedEntries();
          };
        })(this),
        'tree-view:paste': (function(_this) {
          return function() {
            return _this.pasteEntries();
          };
        })(this),
        'tree-view:copy-full-path': (function(_this) {
          return function() {
            return _this.copySelectedEntryPath(false);
          };
        })(this),
        'tree-view:show-in-file-manager': (function(_this) {
          return function() {
            return _this.showSelectedEntryInFileManager();
          };
        })(this),
        'tree-view:open-in-new-window': (function(_this) {
          return function() {
            return _this.openSelectedEntryInNewWindow();
          };
        })(this),
        'tree-view:copy-project-path': (function(_this) {
          return function() {
            return _this.copySelectedEntryPath(true);
          };
        })(this),
        'tree-view:unfocus': (function(_this) {
          return function() {
            return _this.unfocus();
          };
        })(this),
        'tree-view:toggle-vcs-ignored-files': function() {
          return toggleConfig('tree-view.hideVcsIgnoredFiles');
        },
        'tree-view:toggle-ignored-names': function() {
          return toggleConfig('tree-view.hideIgnoredNames');
        },
        'tree-view:remove-project-folder': (function(_this) {
          return function(e) {
            return _this.removeProjectFolder(e);
          };
        })(this)
      });
      [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((function(_this) {
        return function(index) {
          return atom.commands.add(_this.element, "tree-view:open-selected-entry-in-pane-" + (index + 1), function() {
            return _this.openSelectedEntryInPane(index);
          });
        };
      })(this));
      this.disposables.add(atom.workspace.getCenter().onDidChangeActivePaneItem((function(_this) {
        return function() {
          _this.selectActiveFile();
          if (atom.config.get('tree-view.autoReveal')) {
            return _this.revealActiveFile({
              show: false,
              focus: false
            });
          }
        };
      })(this)));
      this.disposables.add(atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.updateRoots();
        };
      })(this)));
      this.disposables.add(atom.config.onDidChange('tree-view.hideVcsIgnoredFiles', (function(_this) {
        return function() {
          return _this.updateRoots();
        };
      })(this)));
      this.disposables.add(atom.config.onDidChange('tree-view.hideIgnoredNames', (function(_this) {
        return function() {
          return _this.updateRoots();
        };
      })(this)));
      this.disposables.add(atom.config.onDidChange('core.ignoredNames', (function(_this) {
        return function() {
          if (atom.config.get('tree-view.hideIgnoredNames')) {
            return _this.updateRoots();
          }
        };
      })(this)));
      this.disposables.add(atom.config.onDidChange('tree-view.sortFoldersBeforeFiles', (function(_this) {
        return function() {
          return _this.updateRoots();
        };
      })(this)));
      return this.disposables.add(atom.config.onDidChange('tree-view.squashDirectoryNames', (function(_this) {
        return function() {
          return _this.updateRoots();
        };
      })(this)));
    };

    TreeView.prototype.toggle = function() {
      return atom.workspace.toggle(this);
    };

    TreeView.prototype.show = function(focus) {
      return atom.workspace.open(this, {
        searchAllPanes: true,
        activatePane: false,
        activateItem: false
      }).then((function(_this) {
        return function() {
          atom.workspace.paneContainerForURI(_this.getURI()).show();
          if (focus) {
            return _this.focus();
          }
        };
      })(this));
    };

    TreeView.prototype.hide = function() {
      return atom.workspace.hide(this);
    };

    TreeView.prototype.focus = function() {
      return this.element.focus();
    };

    TreeView.prototype.unfocus = function() {
      return atom.workspace.getCenter().activate();
    };

    TreeView.prototype.hasFocus = function() {
      return document.activeElement === this.element;
    };

    TreeView.prototype.toggleFocus = function() {
      if (this.hasFocus()) {
        return this.unfocus();
      } else {
        return this.show(true);
      }
    };

    TreeView.prototype.entryClicked = function(e) {
      var entry, isRecursive;
      if (entry = e.target.closest('.entry')) {
        isRecursive = e.altKey || false;
        this.selectEntry(entry);
        if (entry.classList.contains('directory')) {
          return entry.toggleExpansion(isRecursive);
        } else if (entry.classList.contains('file')) {
          return this.fileViewEntryClicked(e);
        }
      }
    };

    TreeView.prototype.fileViewEntryClicked = function(e) {
      var alwaysOpenExisting, detail, filePath, openPromise, ref2;
      filePath = e.target.closest('.entry').getPath();
      detail = (ref2 = e.detail) != null ? ref2 : 1;
      alwaysOpenExisting = atom.config.get('tree-view.alwaysOpenExisting');
      if (detail === 1) {
        if (atom.config.get('core.allowPendingPaneItems')) {
          openPromise = atom.workspace.open(filePath, {
            pending: true,
            activatePane: false,
            searchAllPanes: alwaysOpenExisting
          });
          this.currentlyOpening.set(filePath, openPromise);
          return openPromise.then((function(_this) {
            return function() {
              return _this.currentlyOpening["delete"](filePath);
            };
          })(this));
        }
      } else if (detail === 2) {
        return this.openAfterPromise(filePath, {
          searchAllPanes: alwaysOpenExisting
        });
      }
    };

    TreeView.prototype.openAfterPromise = function(uri, options) {
      var promise;
      if (promise = this.currentlyOpening.get(uri)) {
        return promise.then(function() {
          return atom.workspace.open(uri, options);
        });
      } else {
        return atom.workspace.open(uri, options);
      }
    };

    TreeView.prototype.updateRoots = function(expansionStates) {
      var addProjectsViewElement, directory, j, k, key, len, len1, oldExpansionStates, projectPath, projectPaths, ref2, results, root, selectedPath, selectedPaths, stats;
      if (expansionStates == null) {
        expansionStates = {};
      }
      selectedPaths = this.selectedPaths();
      oldExpansionStates = {};
      ref2 = this.roots;
      for (j = 0, len = ref2.length; j < len; j++) {
        root = ref2[j];
        oldExpansionStates[root.directory.path] = root.directory.serializeExpansionState();
        root.directory.destroy();
        root.remove();
      }
      this.roots = [];
      projectPaths = atom.project.getPaths();
      if (projectPaths.length > 0) {
        if (!this.element.querySelector('tree-view-root')) {
          this.element.appendChild(this.list);
        }
        addProjectsViewElement = this.element.querySelector('#add-projects-view');
        if (addProjectsViewElement) {
          this.element.removeChild(addProjectsViewElement);
        }
        if (IgnoredNames == null) {
          IgnoredNames = require('./ignored-names');
        }
        this.roots = (function() {
          var k, l, len1, len2, ref3, ref4, ref5, results;
          results = [];
          for (k = 0, len1 = projectPaths.length; k < len1; k++) {
            projectPath = projectPaths[k];
            stats = fs.lstatSyncNoException(projectPath);
            if (!stats) {
              continue;
            }
            stats = _.pick.apply(_, [stats].concat(slice.call(_.keys(stats))));
            ref3 = ["atime", "birthtime", "ctime", "mtime"];
            for (l = 0, len2 = ref3.length; l < len2; l++) {
              key = ref3[l];
              stats[key] = stats[key].getTime();
            }
            directory = new Directory({
              name: path.basename(projectPath),
              fullPath: projectPath,
              symlink: false,
              isRoot: true,
              expansionState: (ref4 = (ref5 = expansionStates[projectPath]) != null ? ref5 : oldExpansionStates[projectPath]) != null ? ref4 : {
                isExpanded: true
              },
              ignoredNames: new IgnoredNames(),
              useSyncFS: this.useSyncFS,
              stats: stats
            });
            root = new DirectoryView(directory).element;
            this.list.appendChild(root);
            results.push(root);
          }
          return results;
        }).call(this);
        results = [];
        for (k = 0, len1 = selectedPaths.length; k < len1; k++) {
          selectedPath = selectedPaths[k];
          results.push(this.selectMultipleEntries(this.entryForPath(selectedPath)));
        }
        return results;
      } else {
        if (this.element.querySelector('.tree-view-root')) {
          this.element.removeChild(this.list);
        }
        if (!this.element.querySelector('#add-projects-view')) {
          return this.element.appendChild(new AddProjectsView().element);
        }
      }
    };

    TreeView.prototype.getActivePath = function() {
      var ref2;
      return (ref2 = atom.workspace.getCenter().getActivePaneItem()) != null ? typeof ref2.getPath === "function" ? ref2.getPath() : void 0 : void 0;
    };

    TreeView.prototype.selectActiveFile = function() {
      var activeFilePath;
      activeFilePath = this.getActivePath();
      if (this.entryForPath(activeFilePath)) {
        return this.selectEntryForPath(activeFilePath);
      } else {
        return this.deselect();
      }
    };

    TreeView.prototype.revealActiveFile = function(options) {
      var focus, promise, show;
      if (options == null) {
        options = {};
      }
      if (!atom.project.getPaths().length) {
        return Promise.resolve();
      }
      show = options.show, focus = options.focus;
      if (focus == null) {
        focus = atom.config.get('tree-view.focusOnReveal');
      }
      promise = show || focus ? this.show(focus) : Promise.resolve();
      return promise.then((function(_this) {
        return function() {
          var activeFilePath, activePathComponents, currentPath, entry, j, len, pathComponent, ref2, relativePath, results, rootPath;
          if (!(activeFilePath = _this.getActivePath())) {
            return;
          }
          ref2 = atom.project.relativizePath(activeFilePath), rootPath = ref2[0], relativePath = ref2[1];
          if (rootPath == null) {
            return;
          }
          activePathComponents = relativePath.split(path.sep);
          activePathComponents.unshift(rootPath.substr(rootPath.lastIndexOf(path.sep) + 1));
          currentPath = rootPath.substr(0, rootPath.lastIndexOf(path.sep));
          results = [];
          for (j = 0, len = activePathComponents.length; j < len; j++) {
            pathComponent = activePathComponents[j];
            currentPath += path.sep + pathComponent;
            entry = _this.entryForPath(currentPath);
            if (entry.classList.contains('directory')) {
              results.push(entry.expand());
            } else {
              _this.selectEntry(entry);
              results.push(_this.scrollToEntry(entry));
            }
          }
          return results;
        };
      })(this));
    };

    TreeView.prototype.copySelectedEntryPath = function(relativePath) {
      var pathToCopy;
      if (relativePath == null) {
        relativePath = false;
      }
      if (pathToCopy = this.selectedPath) {
        if (relativePath) {
          pathToCopy = atom.project.relativize(pathToCopy);
        }
        return atom.clipboard.write(pathToCopy);
      }
    };

    TreeView.prototype.entryForPath = function(entryPath) {
      var bestMatchEntry, bestMatchLength, entry, entryLength, j, len, ref2, ref3;
      bestMatchEntry = null;
      bestMatchLength = 0;
      ref2 = this.list.querySelectorAll('.entry');
      for (j = 0, len = ref2.length; j < len; j++) {
        entry = ref2[j];
        if (entry.isPathEqual(entryPath)) {
          return entry;
        }
        entryLength = entry.getPath().length;
        if (((ref3 = entry.directory) != null ? ref3.contains(entryPath) : void 0) && entryLength > bestMatchLength) {
          bestMatchEntry = entry;
          bestMatchLength = entryLength;
        }
      }
      return bestMatchEntry;
    };

    TreeView.prototype.selectEntryForPath = function(entryPath) {
      return this.selectEntry(this.entryForPath(entryPath));
    };

    TreeView.prototype.moveDown = function(event) {
      var nextEntry, selectedEntry;
      if (event != null) {
        event.stopImmediatePropagation();
      }
      selectedEntry = this.selectedEntry();
      if (selectedEntry != null) {
        if (selectedEntry.classList.contains('directory')) {
          if (this.selectEntry(selectedEntry.entries.children[0])) {
            this.scrollToEntry(this.selectedEntry(), false);
            return;
          }
        }
        if (nextEntry = this.nextEntry(selectedEntry)) {
          this.selectEntry(nextEntry);
        }
      } else {
        this.selectEntry(this.roots[0]);
      }
      return this.scrollToEntry(this.selectedEntry(), false);
    };

    TreeView.prototype.moveUp = function(event) {
      var entries, previousEntry, selectedEntry;
      event.stopImmediatePropagation();
      selectedEntry = this.selectedEntry();
      if (selectedEntry != null) {
        if (previousEntry = this.previousEntry(selectedEntry)) {
          this.selectEntry(previousEntry);
        } else {
          this.selectEntry(selectedEntry.parentElement.closest('.directory'));
        }
      } else {
        entries = this.list.querySelectorAll('.entry');
        this.selectEntry(entries[entries.length - 1]);
      }
      return this.scrollToEntry(this.selectedEntry(), false);
    };

    TreeView.prototype.nextEntry = function(entry) {
      var currentEntry;
      currentEntry = entry;
      while (currentEntry != null) {
        if (currentEntry.nextSibling != null) {
          currentEntry = currentEntry.nextSibling;
          if (currentEntry.matches('.entry')) {
            return currentEntry;
          }
        } else {
          currentEntry = currentEntry.parentElement.closest('.directory');
        }
      }
      return null;
    };

    TreeView.prototype.previousEntry = function(entry) {
      var entries, previousEntry;
      previousEntry = entry.previousSibling;
      while ((previousEntry != null) && !previousEntry.matches('.entry')) {
        previousEntry = previousEntry.previousSibling;
      }
      if (previousEntry == null) {
        return null;
      }
      if (previousEntry.matches('.directory.expanded')) {
        entries = previousEntry.querySelectorAll('.entry');
        if (entries.length > 0) {
          return entries[entries.length - 1];
        }
      }
      return previousEntry;
    };

    TreeView.prototype.expandDirectory = function(isRecursive) {
      var directory, selectedEntry;
      if (isRecursive == null) {
        isRecursive = false;
      }
      selectedEntry = this.selectedEntry();
      if (selectedEntry == null) {
        return;
      }
      directory = selectedEntry.closest('.directory');
      if (isRecursive === false && directory.isExpanded) {
        if (directory.directory.getEntries().length > 0) {
          return this.moveDown();
        }
      } else {
        return directory.expand(isRecursive);
      }
    };

    TreeView.prototype.collapseDirectory = function(isRecursive, allDirectories) {
      var directory, j, len, ref2, root, selectedEntry;
      if (isRecursive == null) {
        isRecursive = false;
      }
      if (allDirectories == null) {
        allDirectories = false;
      }
      if (allDirectories) {
        ref2 = this.roots;
        for (j = 0, len = ref2.length; j < len; j++) {
          root = ref2[j];
          root.collapse(true);
        }
        return;
      }
      selectedEntry = this.selectedEntry();
      if (selectedEntry == null) {
        return;
      }
      if (directory = selectedEntry.closest('.expanded.directory')) {
        directory.collapse(isRecursive);
        return this.selectEntry(directory);
      }
    };

    TreeView.prototype.openSelectedEntry = function(options, expandDirectory) {
      var selectedEntry;
      if (options == null) {
        options = {};
      }
      if (expandDirectory == null) {
        expandDirectory = false;
      }
      selectedEntry = this.selectedEntry();
      if (selectedEntry == null) {
        return;
      }
      if (selectedEntry.classList.contains('directory')) {
        if (expandDirectory) {
          return this.expandDirectory(false);
        } else {
          return selectedEntry.toggleExpansion();
        }
      } else if (selectedEntry.classList.contains('file')) {
        if (atom.config.get('tree-view.alwaysOpenExisting')) {
          options = Object.assign({
            searchAllPanes: true
          }, options);
        }
        return this.openAfterPromise(selectedEntry.getPath(), options);
      }
    };

    TreeView.prototype.openSelectedEntrySplit = function(orientation, side) {
      var pane, selectedEntry, split;
      selectedEntry = this.selectedEntry();
      if (selectedEntry == null) {
        return;
      }
      pane = atom.workspace.getCenter().getActivePane();
      if (pane && selectedEntry.classList.contains('file')) {
        if (atom.workspace.getCenter().getActivePaneItem()) {
          split = pane.split(orientation, side);
          return atom.workspace.openURIInPane(selectedEntry.getPath(), split);
        } else {
          return this.openSelectedEntry(true);
        }
      }
    };

    TreeView.prototype.openSelectedEntryRight = function() {
      return this.openSelectedEntrySplit('horizontal', 'after');
    };

    TreeView.prototype.openSelectedEntryLeft = function() {
      return this.openSelectedEntrySplit('horizontal', 'before');
    };

    TreeView.prototype.openSelectedEntryUp = function() {
      return this.openSelectedEntrySplit('vertical', 'before');
    };

    TreeView.prototype.openSelectedEntryDown = function() {
      return this.openSelectedEntrySplit('vertical', 'after');
    };

    TreeView.prototype.openSelectedEntryInPane = function(index) {
      var pane, selectedEntry;
      selectedEntry = this.selectedEntry();
      if (selectedEntry == null) {
        return;
      }
      pane = atom.workspace.getCenter().getPanes()[index];
      if (pane && selectedEntry.classList.contains('file')) {
        return atom.workspace.openURIInPane(selectedEntry.getPath(), pane);
      }
    };

    TreeView.prototype.moveSelectedEntry = function() {
      var dialog, entry, oldPath;
      if (this.hasFocus()) {
        entry = this.selectedEntry();
        if ((entry == null) || indexOf.call(this.roots, entry) >= 0) {
          return;
        }
        oldPath = entry.getPath();
      } else {
        oldPath = this.getActivePath();
      }
      if (oldPath) {
        dialog = new MoveDialog(oldPath, {
          willMove: (function(_this) {
            return function(arg) {
              var initialPath, newPath;
              initialPath = arg.initialPath, newPath = arg.newPath;
              return _this.emitter.emit('will-move-entry', {
                initialPath: initialPath,
                newPath: newPath
              });
            };
          })(this),
          onMove: (function(_this) {
            return function(arg) {
              var initialPath, newPath;
              initialPath = arg.initialPath, newPath = arg.newPath;
              return _this.emitter.emit('entry-moved', {
                initialPath: initialPath,
                newPath: newPath
              });
            };
          })(this),
          onMoveFailed: (function(_this) {
            return function(arg) {
              var initialPath, newPath;
              initialPath = arg.initialPath, newPath = arg.newPath;
              return _this.emitter.emit('move-entry-failed', {
                initialPath: initialPath,
                newPath: newPath
              });
            };
          })(this)
        });
        return dialog.attach();
      }
    };

    TreeView.prototype.showSelectedEntryInFileManager = function() {
      var filePath, ref2;
      if (!(filePath = (ref2 = this.selectedEntry()) != null ? ref2.getPath() : void 0)) {
        return;
      }
      if (!fs.existsSync(filePath)) {
        return atom.notifications.addWarning("Unable to show " + filePath + " in " + (this.getFileManagerName()));
      }
      return shell.showItemInFolder(filePath);
    };

    TreeView.prototype.showCurrentFileInFileManager = function() {
      var filePath, ref2;
      if (!(filePath = (ref2 = atom.workspace.getCenter().getActiveTextEditor()) != null ? ref2.getPath() : void 0)) {
        return;
      }
      if (!fs.existsSync(filePath)) {
        return atom.notifications.addWarning("Unable to show " + filePath + " in " + (this.getFileManagerName()));
      }
      return shell.showItemInFolder(filePath);
    };

    TreeView.prototype.getFileManagerName = function() {
      switch (process.platform) {
        case 'darwin':
          return 'Finder';
        case 'win32':
          return 'Explorer';
        default:
          return 'File Manager';
      }
    };

    TreeView.prototype.openSelectedEntryInNewWindow = function() {
      var pathToOpen, ref2;
      if (pathToOpen = (ref2 = this.selectedEntry()) != null ? ref2.getPath() : void 0) {
        return atom.open({
          pathsToOpen: [pathToOpen],
          newWindow: true
        });
      }
    };

    TreeView.prototype.copySelectedEntry = function() {
      var dialog, entry, oldPath;
      if (this.hasFocus()) {
        entry = this.selectedEntry();
        if (indexOf.call(this.roots, entry) >= 0) {
          return;
        }
        oldPath = entry != null ? entry.getPath() : void 0;
      } else {
        oldPath = this.getActivePath();
      }
      if (!oldPath) {
        return;
      }
      dialog = new CopyDialog(oldPath, {
        onCopy: (function(_this) {
          return function(arg) {
            var initialPath, newPath;
            initialPath = arg.initialPath, newPath = arg.newPath;
            return _this.emitter.emit('entry-copied', {
              initialPath: initialPath,
              newPath: newPath
            });
          };
        })(this)
      });
      return dialog.attach();
    };

    TreeView.prototype.removeSelectedEntries = function() {
      var activePath, j, len, ref2, ref3, root, selectedEntries, selectedPaths;
      if (this.hasFocus()) {
        selectedPaths = this.selectedPaths();
        selectedEntries = this.getSelectedEntries();
      } else if (activePath = this.getActivePath()) {
        selectedPaths = [activePath];
        selectedEntries = [this.entryForPath(activePath)];
      }
      if (!((selectedPaths != null ? selectedPaths.length : void 0) > 0)) {
        return;
      }
      ref2 = this.roots;
      for (j = 0, len = ref2.length; j < len; j++) {
        root = ref2[j];
        if (ref3 = root.getPath(), indexOf.call(selectedPaths, ref3) >= 0) {
          atom.confirm({
            message: "The root directory '" + root.directory.name + "' can't be removed.",
            buttons: ['OK']
          }, function() {});
          return;
        }
      }
      return atom.confirm({
        message: "Are you sure you want to delete the selected " + (selectedPaths.length > 1 ? 'items' : 'item') + "?",
        detailedMessage: "You are deleting:\n" + (selectedPaths.join('\n')),
        buttons: ['Move to Trash', 'Cancel']
      }, (function(_this) {
        return function(response) {
          var failedDeletions, firstSelectedEntry, k, len1, repo, selectedPath;
          if (response === 0) {
            failedDeletions = [];
            for (k = 0, len1 = selectedPaths.length; k < len1; k++) {
              selectedPath = selectedPaths[k];
              if (!fs.existsSync(selectedPath)) {
                continue;
              }
              _this.emitter.emit('will-delete-entry', {
                pathToDelete: selectedPath
              });
              if (shell.moveItemToTrash(selectedPath)) {
                _this.emitter.emit('entry-deleted', {
                  pathToDelete: selectedPath
                });
              } else {
                _this.emitter.emit('delete-entry-failed', {
                  pathToDelete: selectedPath
                });
                failedDeletions.push(selectedPath);
              }
              if (repo = repoForPath(selectedPath)) {
                repo.getPathStatus(selectedPath);
              }
            }
            if (failedDeletions.length > 0) {
              atom.notifications.addError(_this.formatTrashFailureMessage(failedDeletions), {
                description: _this.formatTrashEnabledMessage(),
                detail: "" + (failedDeletions.join('\n')),
                dismissable: true
              });
            }
            if (firstSelectedEntry = selectedEntries[0]) {
              _this.selectEntry(firstSelectedEntry.closest('.directory:not(.selected)'));
            }
            if (atom.config.get('tree-view.squashDirectoryNames')) {
              return _this.updateRoots();
            }
          }
        };
      })(this));
    };

    TreeView.prototype.formatTrashFailureMessage = function(failedDeletions) {
      var fileText;
      fileText = failedDeletions.length > 1 ? 'files' : 'file';
      return "The following " + fileText + " couldn't be moved to the trash.";
    };

    TreeView.prototype.formatTrashEnabledMessage = function() {
      switch (process.platform) {
        case 'linux':
          return 'Is `gvfs-trash` installed?';
        case 'darwin':
          return 'Is Trash enabled on the volume where the files are stored?';
        case 'win32':
          return 'Is there a Recycle Bin on the drive where the files are stored?';
      }
    };

    TreeView.prototype.copySelectedEntries = function() {
      var selectedPaths;
      selectedPaths = this.selectedPaths();
      if (!(selectedPaths && selectedPaths.length > 0)) {
        return;
      }
      window.localStorage.removeItem('tree-view:cutPath');
      return window.localStorage['tree-view:copyPath'] = JSON.stringify(selectedPaths);
    };

    TreeView.prototype.cutSelectedEntries = function() {
      var selectedPaths;
      selectedPaths = this.selectedPaths();
      if (!(selectedPaths && selectedPaths.length > 0)) {
        return;
      }
      window.localStorage.removeItem('tree-view:copyPath');
      return window.localStorage['tree-view:cutPath'] = JSON.stringify(selectedPaths);
    };

    TreeView.prototype.pasteEntries = function() {
      var copiedPaths, cutPaths, initialPath, initialPaths, j, len, newDirectoryPath, results, selectedEntry;
      selectedEntry = this.selectedEntry();
      if (!selectedEntry) {
        return;
      }
      cutPaths = window.localStorage['tree-view:cutPath'] ? JSON.parse(window.localStorage['tree-view:cutPath']) : null;
      copiedPaths = window.localStorage['tree-view:copyPath'] ? JSON.parse(window.localStorage['tree-view:copyPath']) : null;
      initialPaths = copiedPaths || cutPaths;
      if (!(initialPaths != null ? initialPaths.length : void 0)) {
        return;
      }
      newDirectoryPath = selectedEntry.getPath();
      if (selectedEntry.classList.contains('file')) {
        newDirectoryPath = path.dirname(newDirectoryPath);
      }
      results = [];
      for (j = 0, len = initialPaths.length; j < len; j++) {
        initialPath = initialPaths[j];
        if (fs.existsSync(initialPath)) {
          if (copiedPaths) {
            results.push(this.copyEntry(initialPath, newDirectoryPath));
          } else if (cutPaths) {
            if (!this.moveEntry(initialPath, newDirectoryPath)) {
              break;
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    TreeView.prototype.add = function(isCreatingFile) {
      var dialog, ref2, ref3, selectedEntry, selectedPath;
      selectedEntry = (ref2 = this.selectedEntry()) != null ? ref2 : this.roots[0];
      selectedPath = (ref3 = selectedEntry != null ? selectedEntry.getPath() : void 0) != null ? ref3 : '';
      dialog = new AddDialog(selectedPath, isCreatingFile);
      dialog.onDidCreateDirectory((function(_this) {
        return function(createdPath) {
          var ref4;
          if ((ref4 = _this.entryForPath(createdPath)) != null) {
            ref4.reload();
          }
          _this.selectEntryForPath(createdPath);
          if (atom.config.get('tree-view.squashDirectoryNames')) {
            _this.updateRoots();
          }
          return _this.emitter.emit('directory-created', {
            path: createdPath
          });
        };
      })(this));
      dialog.onDidCreateFile((function(_this) {
        return function(createdPath) {
          var ref4;
          if ((ref4 = _this.entryForPath(createdPath)) != null) {
            ref4.reload();
          }
          atom.workspace.open(createdPath);
          if (atom.config.get('tree-view.squashDirectoryNames')) {
            _this.updateRoots();
          }
          return _this.emitter.emit('file-created', {
            path: createdPath
          });
        };
      })(this));
      return dialog.attach();
    };

    TreeView.prototype.removeProjectFolder = function(e) {
      var pathToRemove, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
      pathToRemove = (ref2 = e.target.closest(".project-root > .header")) != null ? (ref3 = ref2.querySelector(".name")) != null ? ref3.dataset.path : void 0 : void 0;
      if (pathToRemove == null) {
        pathToRemove = (ref4 = this.selectedEntry()) != null ? (ref5 = ref4.closest(".project-root")) != null ? (ref6 = ref5.querySelector(".header")) != null ? (ref7 = ref6.querySelector(".name")) != null ? ref7.dataset.path : void 0 : void 0 : void 0 : void 0;
      }
      if (this.roots.length === 1) {
        if (pathToRemove == null) {
          pathToRemove = (ref8 = this.roots[0].querySelector(".header")) != null ? (ref9 = ref8.querySelector(".name")) != null ? ref9.dataset.path : void 0 : void 0;
        }
      }
      if (pathToRemove != null) {
        return atom.project.removePath(pathToRemove);
      }
    };

    TreeView.prototype.selectedEntry = function() {
      return this.list.querySelector('.selected');
    };

    TreeView.prototype.selectEntry = function(entry) {
      var selectedEntries;
      if (entry == null) {
        return;
      }
      this.selectedPath = entry.getPath();
      this.lastFocusedEntry = entry;
      selectedEntries = this.getSelectedEntries();
      if (selectedEntries.length > 1 || selectedEntries[0] !== entry) {
        this.deselect(selectedEntries);
        entry.classList.add('selected');
      }
      return entry;
    };

    TreeView.prototype.getSelectedEntries = function() {
      return this.list.querySelectorAll('.selected');
    };

    TreeView.prototype.deselect = function(elementsToDeselect) {
      var j, len, selected;
      if (elementsToDeselect == null) {
        elementsToDeselect = this.getSelectedEntries();
      }
      for (j = 0, len = elementsToDeselect.length; j < len; j++) {
        selected = elementsToDeselect[j];
        selected.classList.remove('selected');
      }
      return void 0;
    };

    TreeView.prototype.scrollTop = function(top) {
      if (top != null) {
        return this.element.scrollTop = top;
      } else {
        return this.element.scrollTop;
      }
    };

    TreeView.prototype.scrollBottom = function(bottom) {
      if (bottom != null) {
        return this.element.scrollTop = bottom - this.element.offsetHeight;
      } else {
        return this.element.scrollTop + this.element.offsetHeight;
      }
    };

    TreeView.prototype.scrollToEntry = function(entry, center) {
      var element;
      if (center == null) {
        center = true;
      }
      element = (entry != null ? entry.classList.contains('directory') : void 0) ? entry.header : entry;
      return element != null ? element.scrollIntoViewIfNeeded(center) : void 0;
    };

    TreeView.prototype.scrollToBottom = function() {
      var lastEntry;
      if (lastEntry = _.last(this.list.querySelectorAll('.entry'))) {
        this.selectEntry(lastEntry);
        return this.scrollToEntry(lastEntry);
      }
    };

    TreeView.prototype.scrollToTop = function() {
      if (this.roots[0] != null) {
        this.selectEntry(this.roots[0]);
      }
      return this.element.scrollTop = 0;
    };

    TreeView.prototype.pageUp = function() {
      return this.element.scrollTop -= this.element.offsetHeight;
    };

    TreeView.prototype.pageDown = function() {
      return this.element.scrollTop += this.element.offsetHeight;
    };

    TreeView.prototype.copyEntry = function(initialPath, newDirectoryPath) {
      var error, extension, fileCounter, filePath, initialPathIsDirectory, newPath, originalNewPath, realInitialPath, realNewDirectoryPath, repo;
      initialPathIsDirectory = fs.isDirectorySync(initialPath);
      realNewDirectoryPath = fs.realpathSync(newDirectoryPath) + path.sep;
      realInitialPath = fs.realpathSync(initialPath) + path.sep;
      if (initialPathIsDirectory && realNewDirectoryPath.startsWith(realInitialPath)) {
        if (!fs.isSymbolicLinkSync(initialPath)) {
          atom.notifications.addWarning('Cannot copy a folder into itself');
          return;
        }
      }
      newPath = path.join(newDirectoryPath, path.basename(initialPath));
      fileCounter = 0;
      originalNewPath = newPath;
      while (fs.existsSync(newPath)) {
        if (initialPathIsDirectory) {
          newPath = "" + originalNewPath + fileCounter;
        } else {
          extension = getFullExtension(originalNewPath);
          filePath = path.join(path.dirname(originalNewPath), path.basename(originalNewPath, extension));
          newPath = "" + filePath + fileCounter + extension;
        }
        fileCounter += 1;
      }
      try {
        this.emitter.emit('will-copy-entry', {
          initialPath: initialPath,
          newPath: newPath
        });
        if (initialPathIsDirectory) {
          fs.copySync(initialPath, newPath);
        } else {
          fs.writeFileSync(newPath, fs.readFileSync(initialPath));
        }
        this.emitter.emit('entry-copied', {
          initialPath: initialPath,
          newPath: newPath
        });
        if (repo = repoForPath(newPath)) {
          repo.getPathStatus(initialPath);
          return repo.getPathStatus(newPath);
        }
      } catch (error1) {
        error = error1;
        this.emitter.emit('copy-entry-failed', {
          initialPath: initialPath,
          newPath: newPath
        });
        return atom.notifications.addWarning("Failed to copy entry " + initialPath + " to " + newDirectoryPath, {
          detail: error.message
        });
      }
    };

    TreeView.prototype.moveEntry = function(initialPath, newDirectoryPath) {
      var error, newPath, realInitialPath, realNewDirectoryPath, repo;
      try {
        realNewDirectoryPath = fs.realpathSync(newDirectoryPath) + path.sep;
        realInitialPath = fs.realpathSync(initialPath) + path.sep;
        if (fs.isDirectorySync(initialPath) && realNewDirectoryPath.startsWith(realInitialPath)) {
          if (!fs.isSymbolicLinkSync(initialPath)) {
            atom.notifications.addWarning('Cannot move a folder into itself');
            return;
          }
        }
      } catch (error1) {
        error = error1;
        atom.notifications.addWarning("Failed to move entry " + initialPath + " to " + newDirectoryPath, {
          detail: error.message
        });
      }
      newPath = path.join(newDirectoryPath, path.basename(initialPath));
      try {
        this.emitter.emit('will-move-entry', {
          initialPath: initialPath,
          newPath: newPath
        });
        fs.moveSync(initialPath, newPath);
        this.emitter.emit('entry-moved', {
          initialPath: initialPath,
          newPath: newPath
        });
        if (repo = repoForPath(newPath)) {
          repo.getPathStatus(initialPath);
          repo.getPathStatus(newPath);
        }
      } catch (error1) {
        error = error1;
        if (error.code === 'EEXIST') {
          return this.moveConflictingEntry(initialPath, newPath, newDirectoryPath);
        } else {
          this.emitter.emit('move-entry-failed', {
            initialPath: initialPath,
            newPath: newPath
          });
          atom.notifications.addWarning("Failed to move entry " + initialPath + " to " + newDirectoryPath, {
            detail: error.message
          });
        }
      }
      return true;
    };

    TreeView.prototype.moveConflictingEntry = function(initialPath, newPath, newDirectoryPath) {
      var chosen, entries, entry, error, j, len, repo;
      try {
        if (!fs.isDirectorySync(initialPath)) {
          chosen = atom.confirm({
            message: "'" + (path.relative(newDirectoryPath, newPath)) + "' already exists",
            detailedMessage: 'Do you want to replace it?',
            buttons: ['Replace file', 'Skip', 'Cancel']
          });
          switch (chosen) {
            case 0:
              fs.renameSync(initialPath, newPath);
              this.emitter.emit('entry-moved', {
                initialPath: initialPath,
                newPath: newPath
              });
              if (repo = repoForPath(newPath)) {
                repo.getPathStatus(initialPath);
                repo.getPathStatus(newPath);
              }
              break;
            case 2:
              return false;
          }
        } else {
          entries = fs.readdirSync(initialPath);
          for (j = 0, len = entries.length; j < len; j++) {
            entry = entries[j];
            if (fs.existsSync(path.join(newPath, entry))) {
              if (!this.moveConflictingEntry(path.join(initialPath, entry), path.join(newPath, entry), newDirectoryPath)) {
                return false;
              }
            } else {
              this.moveEntry(path.join(initialPath, entry), newPath);
            }
          }
          if (!fs.readdirSync(initialPath).length) {
            fs.rmdirSync(initialPath);
          }
        }
      } catch (error1) {
        error = error1;
        this.emitter.emit('move-entry-failed', {
          initialPath: initialPath,
          newPath: newPath
        });
        atom.notifications.addWarning("Failed to move entry " + initialPath + " to " + newPath, {
          detail: error.message
        });
      }
      return true;
    };

    TreeView.prototype.onStylesheetsChanged = function() {
      if (!this.isVisible()) {
        return;
      }
      this.element.style.display = 'none';
      this.element.offsetWidth;
      return this.element.style.display = '';
    };

    TreeView.prototype.onMouseDown = function(e) {
      var cmdKey, entryToSelect, shiftKey;
      if (!(entryToSelect = e.target.closest('.entry'))) {
        return;
      }
      e.stopPropagation();
      cmdKey = e.metaKey || (e.ctrlKey && process.platform !== 'darwin');
      if (entryToSelect.classList.contains('selected')) {
        if (e.button === 2 || (e.ctrlKey && process.platform === 'darwin')) {
          return;
        } else {
          shiftKey = e.shiftKey;
          this.selectOnMouseUp = {
            shiftKey: shiftKey,
            cmdKey: cmdKey
          };
          return;
        }
      }
      if (e.shiftKey && cmdKey) {
        this.selectContinuousEntries(entryToSelect, false);
        return this.showMultiSelectMenuIfNecessary();
      } else if (e.shiftKey) {
        this.selectContinuousEntries(entryToSelect);
        return this.showMultiSelectMenuIfNecessary();
      } else if (cmdKey) {
        this.selectMultipleEntries(entryToSelect);
        this.lastFocusedEntry = entryToSelect;
        return this.showMultiSelectMenuIfNecessary();
      } else {
        this.selectEntry(entryToSelect);
        return this.showFullMenu();
      }
    };

    TreeView.prototype.onMouseUp = function(e) {
      var cmdKey, entryToSelect, ref2, shiftKey;
      if (this.selectOnMouseUp == null) {
        return;
      }
      ref2 = this.selectOnMouseUp, shiftKey = ref2.shiftKey, cmdKey = ref2.cmdKey;
      this.selectOnMouseUp = null;
      if (!(entryToSelect = e.target.closest('.entry'))) {
        return;
      }
      e.stopPropagation();
      if (shiftKey && cmdKey) {
        this.selectContinuousEntries(entryToSelect, false);
        return this.showMultiSelectMenuIfNecessary();
      } else if (shiftKey) {
        this.selectContinuousEntries(entryToSelect);
        return this.showMultiSelectMenuIfNecessary();
      } else if (cmdKey) {
        this.deselect([entryToSelect]);
        this.lastFocusedEntry = entryToSelect;
        return this.showMultiSelectMenuIfNecessary();
      } else {
        this.selectEntry(entryToSelect);
        return this.showFullMenu();
      }
    };

    TreeView.prototype.selectedPaths = function() {
      var entry, j, len, ref2, results;
      ref2 = this.getSelectedEntries();
      results = [];
      for (j = 0, len = ref2.length; j < len; j++) {
        entry = ref2[j];
        results.push(entry.getPath());
      }
      return results;
    };

    TreeView.prototype.selectContinuousEntries = function(entry, deselectOthers) {
      var currentSelectedEntry, element, elements, entries, entryIndex, i, j, len, parentContainer, ref2, selectedIndex;
      if (deselectOthers == null) {
        deselectOthers = true;
      }
      currentSelectedEntry = (ref2 = this.lastFocusedEntry) != null ? ref2 : this.selectedEntry();
      parentContainer = entry.parentElement;
      elements = [];
      if (parentContainer === currentSelectedEntry.parentElement) {
        entries = Array.from(parentContainer.querySelectorAll('.entry'));
        entryIndex = entries.indexOf(entry);
        selectedIndex = entries.indexOf(currentSelectedEntry);
        elements = (function() {
          var j, ref3, ref4, results;
          results = [];
          for (i = j = ref3 = entryIndex, ref4 = selectedIndex; ref3 <= ref4 ? j <= ref4 : j >= ref4; i = ref3 <= ref4 ? ++j : --j) {
            results.push(entries[i]);
          }
          return results;
        })();
        if (deselectOthers) {
          this.deselect();
        }
        for (j = 0, len = elements.length; j < len; j++) {
          element = elements[j];
          element.classList.add('selected');
        }
      }
      return elements;
    };

    TreeView.prototype.selectMultipleEntries = function(entry) {
      if (entry != null) {
        entry.classList.toggle('selected');
      }
      return entry;
    };

    TreeView.prototype.showFullMenu = function() {
      this.list.classList.remove('multi-select');
      return this.list.classList.add('full-menu');
    };

    TreeView.prototype.showMultiSelectMenu = function() {
      this.list.classList.remove('full-menu');
      return this.list.classList.add('multi-select');
    };

    TreeView.prototype.showMultiSelectMenuIfNecessary = function() {
      if (this.getSelectedEntries().length > 1) {
        return this.showMultiSelectMenu();
      } else {
        return this.showFullMenu();
      }
    };

    TreeView.prototype.multiSelectEnabled = function() {
      return this.list.classList.contains('multi-select');
    };

    TreeView.prototype.onDragEnter = function(e) {
      var entry;
      if (entry = e.target.closest('.entry.directory')) {
        if (this.rootDragAndDrop.isDragging(e)) {
          return;
        }
        if (!this.isAtomTreeViewEvent(e)) {
          return;
        }
        e.stopPropagation();
        if (!this.dragEventCounts.get(entry)) {
          this.dragEventCounts.set(entry, 0);
        }
        if (!(this.dragEventCounts.get(entry) !== 0 || entry.classList.contains('selected'))) {
          entry.classList.add('drag-over', 'selected');
        }
        return this.dragEventCounts.set(entry, this.dragEventCounts.get(entry) + 1);
      }
    };

    TreeView.prototype.onDragLeave = function(e) {
      var entry;
      if (entry = e.target.closest('.entry.directory')) {
        if (this.rootDragAndDrop.isDragging(e)) {
          return;
        }
        if (!this.isAtomTreeViewEvent(e)) {
          return;
        }
        e.stopPropagation();
        this.dragEventCounts.set(entry, this.dragEventCounts.get(entry) - 1);
        if (this.dragEventCounts.get(entry) === 0 && entry.classList.contains('drag-over')) {
          return entry.classList.remove('drag-over', 'selected');
        }
      }
    };

    TreeView.prototype.onDragStart = function(e) {
      var dragImage, entry, entryPath, initialPaths, j, key, len, newElement, parentSelected, ref2, ref3, target, value;
      this.dragEventCounts = new WeakMap;
      this.selectOnMouseUp = null;
      if (entry = e.target.closest('.entry')) {
        e.stopPropagation();
        if (this.rootDragAndDrop.canDragStart(e)) {
          return this.rootDragAndDrop.onDragStart(e);
        }
        dragImage = document.createElement("ol");
        dragImage.classList.add("entries", "list-tree");
        dragImage.style.position = "absolute";
        dragImage.style.top = 0;
        dragImage.style.left = 0;
        dragImage.style.willChange = "transform";
        initialPaths = [];
        ref2 = this.getSelectedEntries();
        for (j = 0, len = ref2.length; j < len; j++) {
          target = ref2[j];
          entryPath = target.querySelector(".name").dataset.path;
          parentSelected = target.parentNode.closest(".entry.selected");
          if (!parentSelected) {
            initialPaths.push(entryPath);
            newElement = target.cloneNode(true);
            if (newElement.classList.contains("directory")) {
              newElement.querySelector(".entries").remove();
            }
            ref3 = getStyleObject(target);
            for (key in ref3) {
              value = ref3[key];
              newElement.style[key] = value;
            }
            newElement.style.paddingLeft = "1em";
            newElement.style.paddingRight = "1em";
            dragImage.append(newElement);
          }
        }
        document.body.appendChild(dragImage);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        e.dataTransfer.setData("initialPaths", JSON.stringify(initialPaths));
        e.dataTransfer.setData("atom-tree-view-event", "true");
        return window.requestAnimationFrame(function() {
          return dragImage.remove();
        });
      }
    };

    TreeView.prototype.onDragOver = function(e) {
      var entry;
      if (entry = e.target.closest('.entry.directory')) {
        if (this.rootDragAndDrop.isDragging(e)) {
          return;
        }
        if (!this.isAtomTreeViewEvent(e)) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (this.dragEventCounts.get(entry) > 0 && !entry.classList.contains('selected')) {
          return entry.classList.add('drag-over', 'selected');
        }
      }
    };

    TreeView.prototype.onDrop = function(e) {
      var entry, file, initialPath, initialPaths, j, k, l, len, len1, newDirectoryPath, ref2, ref3, ref4, ref5, results, results1, results2;
      this.dragEventCounts = new WeakMap;
      if (entry = e.target.closest('.entry.directory')) {
        if (this.rootDragAndDrop.isDragging(e)) {
          return;
        }
        if (!this.isAtomTreeViewEvent(e)) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        newDirectoryPath = (ref2 = entry.querySelector('.name')) != null ? ref2.dataset.path : void 0;
        if (!newDirectoryPath) {
          return false;
        }
        initialPaths = e.dataTransfer.getData('initialPaths');
        if (initialPaths) {
          initialPaths = JSON.parse(initialPaths);
          if (initialPaths.includes(newDirectoryPath)) {
            return;
          }
          entry.classList.remove('drag-over', 'selected');
          results = [];
          for (j = initialPaths.length - 1; j >= 0; j += -1) {
            initialPath = initialPaths[j];
            if ((ref3 = this.entryForPath(initialPath)) != null) {
              if (typeof ref3.collapse === "function") {
                ref3.collapse();
              }
            }
            if ((process.platform === 'darwin' && e.metaKey) || e.ctrlKey) {
              results.push(this.copyEntry(initialPath, newDirectoryPath));
            } else {
              if (!this.moveEntry(initialPath, newDirectoryPath)) {
                break;
              } else {
                results.push(void 0);
              }
            }
          }
          return results;
        } else {
          entry.classList.remove('selected');
          ref4 = e.dataTransfer.files;
          results1 = [];
          for (k = 0, len = ref4.length; k < len; k++) {
            file = ref4[k];
            if ((process.platform === 'darwin' && e.metaKey) || e.ctrlKey) {
              results1.push(this.copyEntry(file.path, newDirectoryPath));
            } else {
              if (!this.moveEntry(file.path, newDirectoryPath)) {
                break;
              } else {
                results1.push(void 0);
              }
            }
          }
          return results1;
        }
      } else if (e.dataTransfer.files.length) {
        ref5 = e.dataTransfer.files;
        results2 = [];
        for (l = 0, len1 = ref5.length; l < len1; l++) {
          entry = ref5[l];
          results2.push(atom.project.addPath(entry.path));
        }
        return results2;
      }
    };

    TreeView.prototype.isAtomTreeViewEvent = function(e) {
      var item, j, len, ref2;
      ref2 = e.dataTransfer.items;
      for (j = 0, len = ref2.length; j < len; j++) {
        item = ref2[j];
        if (item.type === 'atom-tree-view-event' || item.kind === 'file') {
          return true;
        }
      }
      return false;
    };

    TreeView.prototype.isVisible = function() {
      return this.element.offsetWidth !== 0 || this.element.offsetHeight !== 0;
    };

    return TreeView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvdHJlZS12aWV3L2xpYi90cmVlLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1UkFBQTtJQUFBOzs7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNOLFFBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVYsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUFrRCxPQUFBLENBQVEsTUFBUixDQUFsRCxFQUFDLHFDQUFELEVBQWtCLDZDQUFsQixFQUF1Qzs7RUFDdkMsT0FBa0QsT0FBQSxDQUFRLFdBQVIsQ0FBbEQsRUFBQyw4QkFBRCxFQUFjLG9DQUFkLEVBQThCOztFQUM5QixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBRUwsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSOztFQUNaLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDYixVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBQ2IsWUFBQSxHQUFlOztFQUVmLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSOztFQUVsQixTQUFBLEdBQVksT0FBQSxDQUFRLGFBQVI7O0VBQ1osYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVI7O0VBQ2hCLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHNCQUFSOztFQUVsQixhQUFBLEdBQWdCOztFQUVoQixZQUFBLEdBQWUsU0FBQyxPQUFEO1dBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLE9BQWhCLEVBQXlCLENBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLE9BQWhCLENBQTdCO0VBRGE7O0VBR2YsTUFBQSxHQUFTOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxrQkFBQyxLQUFEOzs7OztBQUNY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QUFDbkIsVUFBQTtBQUFBO0FBQUEsV0FBQSxzQ0FBQTs7UUFDRSxJQUFHLElBQUksQ0FBQyxJQUFMLEtBQWEsc0JBQWIsSUFBdUMsSUFBSSxDQUFDLElBQUwsS0FBYSxNQUF2RDtBQUNFLGlCQUFPLEtBRFQ7O0FBREY7QUFJQSxhQUFPO0lBTFk7O3VCQU9yQixTQUFBLEdBQVcsU0FBQTthQUNULElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxLQUEwQixDQUExQixJQUErQixJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsS0FBMkI7SUFEakQ7Ozs7O0FBdHFDYiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xue3NoZWxsfSA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0J1ZmZlcmVkUHJvY2VzcywgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJ1xue3JlcG9Gb3JQYXRoLCBnZXRTdHlsZU9iamVjdCwgZ2V0RnVsbEV4dGVuc2lvbn0gPSByZXF1aXJlIFwiLi9oZWxwZXJzXCJcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcblxuQWRkRGlhbG9nID0gcmVxdWlyZSAnLi9hZGQtZGlhbG9nJ1xuTW92ZURpYWxvZyA9IHJlcXVpcmUgJy4vbW92ZS1kaWFsb2cnXG5Db3B5RGlhbG9nID0gcmVxdWlyZSAnLi9jb3B5LWRpYWxvZydcbklnbm9yZWROYW1lcyA9IG51bGwgIyBEZWZlciByZXF1aXJpbmcgdW50aWwgYWN0dWFsbHkgbmVlZGVkXG5cbkFkZFByb2plY3RzVmlldyA9IHJlcXVpcmUgJy4vYWRkLXByb2plY3RzLXZpZXcnXG5cbkRpcmVjdG9yeSA9IHJlcXVpcmUgJy4vZGlyZWN0b3J5J1xuRGlyZWN0b3J5VmlldyA9IHJlcXVpcmUgJy4vZGlyZWN0b3J5LXZpZXcnXG5Sb290RHJhZ0FuZERyb3AgPSByZXF1aXJlICcuL3Jvb3QtZHJhZy1hbmQtZHJvcCdcblxuVFJFRV9WSUVXX1VSSSA9ICdhdG9tOi8vdHJlZS12aWV3J1xuXG50b2dnbGVDb25maWcgPSAoa2V5UGF0aCkgLT5cbiAgYXRvbS5jb25maWcuc2V0KGtleVBhdGgsIG5vdCBhdG9tLmNvbmZpZy5nZXQoa2V5UGF0aCkpXG5cbm5leHRJZCA9IDFcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVHJlZVZpZXdcbiAgY29uc3RydWN0b3I6IChzdGF0ZSkgLT5cbiAgICBAaWQgPSBuZXh0SWQrK1xuICAgIEBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd0b29sLXBhbmVsJywgJ3RyZWUtdmlldycpXG4gICAgQGVsZW1lbnQudGFiSW5kZXggPSAtMVxuXG4gICAgQGxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvbCcpXG4gICAgQGxpc3QuY2xhc3NMaXN0LmFkZCgndHJlZS12aWV3LXJvb3QnLCAnZnVsbC1tZW51JywgJ2xpc3QtdHJlZScsICdoYXMtY29sbGFwc2FibGUtY2hpbGRyZW4nLCAnZm9jdXNhYmxlLXBhbmVsJylcblxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEByb290cyA9IFtdXG4gICAgQHNlbGVjdGVkUGF0aCA9IG51bGxcbiAgICBAc2VsZWN0T25Nb3VzZVVwID0gbnVsbFxuICAgIEBsYXN0Rm9jdXNlZEVudHJ5ID0gbnVsbFxuICAgIEBpZ25vcmVkUGF0dGVybnMgPSBbXVxuICAgIEB1c2VTeW5jRlMgPSBmYWxzZVxuICAgIEBjdXJyZW50bHlPcGVuaW5nID0gbmV3IE1hcFxuICAgIEBlZGl0b3JzVG9Nb3ZlID0gW11cbiAgICBAZWRpdG9yc1RvRGVzdHJveSA9IFtdXG5cbiAgICBAZHJhZ0V2ZW50Q291bnRzID0gbmV3IFdlYWtNYXBcbiAgICBAcm9vdERyYWdBbmREcm9wID0gbmV3IFJvb3REcmFnQW5kRHJvcCh0aGlzKVxuXG4gICAgQGhhbmRsZUV2ZW50cygpXG5cbiAgICBwcm9jZXNzLm5leHRUaWNrID0+XG4gICAgICBAb25TdHlsZXNoZWV0c0NoYW5nZWQoKVxuICAgICAgb25TdHlsZXNoZWV0c0NoYW5nZWQgPSBfLmRlYm91bmNlKEBvblN0eWxlc2hlZXRzQ2hhbmdlZCwgMTAwKVxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLnN0eWxlcy5vbkRpZEFkZFN0eWxlRWxlbWVudChvblN0eWxlc2hlZXRzQ2hhbmdlZClcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5zdHlsZXMub25EaWRSZW1vdmVTdHlsZUVsZW1lbnQob25TdHlsZXNoZWV0c0NoYW5nZWQpXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uc3R5bGVzLm9uRGlkVXBkYXRlU3R5bGVFbGVtZW50KG9uU3R5bGVzaGVldHNDaGFuZ2VkKVxuXG4gICAgQHVwZGF0ZVJvb3RzKHN0YXRlLmRpcmVjdG9yeUV4cGFuc2lvblN0YXRlcylcblxuICAgIGlmIHN0YXRlLnNlbGVjdGVkUGF0aHM/Lmxlbmd0aCA+IDBcbiAgICAgIEBzZWxlY3RNdWx0aXBsZUVudHJpZXMoQGVudHJ5Rm9yUGF0aChzZWxlY3RlZFBhdGgpKSBmb3Igc2VsZWN0ZWRQYXRoIGluIHN0YXRlLnNlbGVjdGVkUGF0aHNcbiAgICBlbHNlXG4gICAgICBAc2VsZWN0RW50cnkoQHJvb3RzWzBdKVxuXG4gICAgaWYgc3RhdGUuc2Nyb2xsVG9wPyBvciBzdGF0ZS5zY3JvbGxMZWZ0P1xuICAgICAgb2JzZXJ2ZXIgPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoPT5cbiAgICAgICAgaWYgQGlzVmlzaWJsZSgpXG4gICAgICAgICAgQGVsZW1lbnQuc2Nyb2xsVG9wID0gc3RhdGUuc2Nyb2xsVG9wXG4gICAgICAgICAgQGVsZW1lbnQuc2Nyb2xsTGVmdCA9IHN0YXRlLnNjcm9sbExlZnRcbiAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KClcbiAgICAgIClcbiAgICAgIG9ic2VydmVyLm9ic2VydmUoQGVsZW1lbnQpXG5cbiAgICBAZWxlbWVudC5zdHlsZS53aWR0aCA9IFwiI3tzdGF0ZS53aWR0aH1weFwiIGlmIHN0YXRlLndpZHRoID4gMFxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAb25XaWxsTW92ZUVudHJ5ICh7aW5pdGlhbFBhdGgsIG5ld1BhdGh9KSA9PlxuICAgICAgZWRpdG9ycyA9IGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgIGlmIGZzLmlzRGlyZWN0b3J5U3luYyhpbml0aWFsUGF0aClcbiAgICAgICAgaW5pdGlhbFBhdGggKz0gcGF0aC5zZXAgIyBBdm9pZCBtb3ZpbmcgbGliMidzIGVkaXRvcnMgd2hlbiBsaWIgd2FzIG1vdmVkXG4gICAgICAgIGZvciBlZGl0b3IgaW4gZWRpdG9yc1xuICAgICAgICAgIGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICAgIGlmIGZpbGVQYXRoPy5zdGFydHNXaXRoKGluaXRpYWxQYXRoKVxuICAgICAgICAgICAgQGVkaXRvcnNUb01vdmUucHVzaChmaWxlUGF0aClcbiAgICAgIGVsc2VcbiAgICAgICAgZm9yIGVkaXRvciBpbiBlZGl0b3JzXG4gICAgICAgICAgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgICAgaWYgZmlsZVBhdGggaXMgaW5pdGlhbFBhdGhcbiAgICAgICAgICAgIEBlZGl0b3JzVG9Nb3ZlLnB1c2goZmlsZVBhdGgpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBvbkVudHJ5TW92ZWQgKHtpbml0aWFsUGF0aCwgbmV3UGF0aH0pID0+XG4gICAgICBmb3IgZWRpdG9yIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgICAgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIGluZGV4ID0gQGVkaXRvcnNUb01vdmUuaW5kZXhPZihmaWxlUGF0aClcbiAgICAgICAgaWYgaW5kZXggaXNudCAtMVxuICAgICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRQYXRoKGZpbGVQYXRoLnJlcGxhY2UoaW5pdGlhbFBhdGgsIG5ld1BhdGgpKVxuICAgICAgICAgIEBlZGl0b3JzVG9Nb3ZlLnNwbGljZShpbmRleCwgMSlcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQG9uTW92ZUVudHJ5RmFpbGVkICh7aW5pdGlhbFBhdGgsIG5ld1BhdGh9KSA9PlxuICAgICAgaW5kZXggPSBAZWRpdG9yc1RvTW92ZS5pbmRleE9mKGluaXRpYWxQYXRoKVxuICAgICAgQGVkaXRvcnNUb01vdmUuc3BsaWNlKGluZGV4LCAxKSBpZiBpbmRleCBpc250IC0xXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBvbldpbGxEZWxldGVFbnRyeSAoe3BhdGhUb0RlbGV0ZX0pID0+XG4gICAgICBlZGl0b3JzID0gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVxuICAgICAgaWYgZnMuaXNEaXJlY3RvcnlTeW5jKHBhdGhUb0RlbGV0ZSlcbiAgICAgICAgcGF0aFRvRGVsZXRlICs9IHBhdGguc2VwICMgQXZvaWQgZGVzdHJveWluZyBsaWIyJ3MgZWRpdG9ycyB3aGVuIGxpYiB3YXMgZGVsZXRlZFxuICAgICAgICBmb3IgZWRpdG9yIGluIGVkaXRvcnNcbiAgICAgICAgICBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgICBpZiBmaWxlUGF0aD8uc3RhcnRzV2l0aChwYXRoVG9EZWxldGUpIGFuZCBub3QgZWRpdG9yLmlzTW9kaWZpZWQoKVxuICAgICAgICAgICAgQGVkaXRvcnNUb0Rlc3Ryb3kucHVzaChmaWxlUGF0aClcbiAgICAgIGVsc2VcbiAgICAgICAgZm9yIGVkaXRvciBpbiBlZGl0b3JzXG4gICAgICAgICAgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgICAgaWYgZmlsZVBhdGggaXMgcGF0aFRvRGVsZXRlIGFuZCBub3QgZWRpdG9yLmlzTW9kaWZpZWQoKVxuICAgICAgICAgICAgQGVkaXRvcnNUb0Rlc3Ryb3kucHVzaChmaWxlUGF0aClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQG9uRW50cnlEZWxldGVkICh7cGF0aFRvRGVsZXRlfSkgPT5cbiAgICAgIGZvciBlZGl0b3IgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVxuICAgICAgICBpbmRleCA9IEBlZGl0b3JzVG9EZXN0cm95LmluZGV4T2YoZWRpdG9yLmdldFBhdGgoKSlcbiAgICAgICAgaWYgaW5kZXggaXNudCAtMVxuICAgICAgICAgIGVkaXRvci5kZXN0cm95KClcbiAgICAgICAgICBAZWRpdG9yc1RvRGVzdHJveS5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBvbkRlbGV0ZUVudHJ5RmFpbGVkICh7cGF0aFRvRGVsZXRlfSkgPT5cbiAgICAgIGluZGV4ID0gQGVkaXRvcnNUb0Rlc3Ryb3kuaW5kZXhPZihwYXRoVG9EZWxldGUpXG4gICAgICBAZWRpdG9yc1RvRGVzdHJveS5zcGxpY2UoaW5kZXgsIDEpIGlmIGluZGV4IGlzbnQgLTFcblxuICBzZXJpYWxpemU6IC0+XG4gICAgZGlyZWN0b3J5RXhwYW5zaW9uU3RhdGVzOiBuZXcgKChyb290cykgLT5cbiAgICAgIEBbcm9vdC5kaXJlY3RvcnkucGF0aF0gPSByb290LmRpcmVjdG9yeS5zZXJpYWxpemVFeHBhbnNpb25TdGF0ZSgpIGZvciByb290IGluIHJvb3RzXG4gICAgICB0aGlzKShAcm9vdHMpXG4gICAgZGVzZXJpYWxpemVyOiAnVHJlZVZpZXcnXG4gICAgc2VsZWN0ZWRQYXRoczogQXJyYXkuZnJvbShAZ2V0U2VsZWN0ZWRFbnRyaWVzKCksIChlbnRyeSkgLT4gZW50cnkuZ2V0UGF0aCgpKVxuICAgIHNjcm9sbExlZnQ6IEBlbGVtZW50LnNjcm9sbExlZnRcbiAgICBzY3JvbGxUb3A6IEBlbGVtZW50LnNjcm9sbFRvcFxuICAgIHdpZHRoOiBwYXJzZUludChAZWxlbWVudC5zdHlsZS53aWR0aCBvciAwKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgcm9vdC5kaXJlY3RvcnkuZGVzdHJveSgpIGZvciByb290IGluIEByb290c1xuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAcm9vdERyYWdBbmREcm9wLmRpc3Bvc2UoKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95JylcblxuICBvbkRpZERlc3Ryb3k6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBjYWxsYmFjaylcblxuICBnZXRUaXRsZTogLT4gXCJQcm9qZWN0XCJcblxuICBnZXRVUkk6IC0+IFRSRUVfVklFV19VUklcblxuICBnZXRQcmVmZXJyZWRMb2NhdGlvbjogLT5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3RyZWUtdmlldy5zaG93T25SaWdodFNpZGUnKVxuICAgICAgJ3JpZ2h0J1xuICAgIGVsc2VcbiAgICAgICdsZWZ0J1xuXG4gIGdldEFsbG93ZWRMb2NhdGlvbnM6IC0+IFtcImxlZnRcIiwgXCJyaWdodFwiXVxuXG4gIGlzUGVybWFuZW50RG9ja0l0ZW06IC0+IHRydWVcblxuICBnZXRQcmVmZXJyZWRXaWR0aDogLT5cbiAgICBAbGlzdC5zdHlsZS53aWR0aCA9ICdtaW4tY29udGVudCdcbiAgICByZXN1bHQgPSBAbGlzdC5vZmZzZXRXaWR0aFxuICAgIEBsaXN0LnN0eWxlLndpZHRoID0gJydcbiAgICByZXN1bHRcblxuICBvbkRpcmVjdG9yeUNyZWF0ZWQ6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbignZGlyZWN0b3J5LWNyZWF0ZWQnLCBjYWxsYmFjaylcblxuICBvbkVudHJ5Q29waWVkOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24oJ2VudHJ5LWNvcGllZCcsIGNhbGxiYWNrKVxuXG4gIG9uV2lsbERlbGV0ZUVudHJ5OiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24oJ3dpbGwtZGVsZXRlLWVudHJ5JywgY2FsbGJhY2spXG5cbiAgb25FbnRyeURlbGV0ZWQ6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbignZW50cnktZGVsZXRlZCcsIGNhbGxiYWNrKVxuXG4gIG9uRGVsZXRlRW50cnlGYWlsZWQ6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbignZGVsZXRlLWVudHJ5LWZhaWxlZCcsIGNhbGxiYWNrKVxuXG4gIG9uV2lsbE1vdmVFbnRyeTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uKCd3aWxsLW1vdmUtZW50cnknLCBjYWxsYmFjaylcblxuICBvbkVudHJ5TW92ZWQ6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbignZW50cnktbW92ZWQnLCBjYWxsYmFjaylcblxuICBvbk1vdmVFbnRyeUZhaWxlZDogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdtb3ZlLWVudHJ5LWZhaWxlZCcsIGNhbGxiYWNrKVxuXG4gIG9uRmlsZUNyZWF0ZWQ6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbignZmlsZS1jcmVhdGVkJywgY2FsbGJhY2spXG5cbiAgaGFuZGxlRXZlbnRzOiAtPlxuICAgIEBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgKGUpID0+XG4gICAgICAjIFRoaXMgcHJldmVudHMgYWNjaWRlbnRhbCBjb2xsYXBzaW5nIHdoZW4gYSAuZW50cmllcyBlbGVtZW50IGlzIHRoZSBldmVudCB0YXJnZXRcbiAgICAgIHJldHVybiBpZiBlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2VudHJpZXMnKVxuXG4gICAgICBAZW50cnlDbGlja2VkKGUpIHVubGVzcyBlLnNoaWZ0S2V5IG9yIGUubWV0YUtleSBvciBlLmN0cmxLZXlcbiAgICBAZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAoZSkgPT4gQG9uTW91c2VEb3duKGUpXG4gICAgQGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsIChlKSA9PiBAb25Nb3VzZVVwKGUpXG4gICAgQGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnZHJhZ3N0YXJ0JywgKGUpID0+IEBvbkRyYWdTdGFydChlKVxuICAgIEBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2RyYWdlbnRlcicsIChlKSA9PiBAb25EcmFnRW50ZXIoZSlcbiAgICBAZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdkcmFnbGVhdmUnLCAoZSkgPT4gQG9uRHJhZ0xlYXZlKGUpXG4gICAgQGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnZHJhZ292ZXInLCAoZSkgPT4gQG9uRHJhZ092ZXIoZSlcbiAgICBAZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdkcm9wJywgKGUpID0+IEBvbkRyb3AoZSlcblxuICAgIGF0b20uY29tbWFuZHMuYWRkIEBlbGVtZW50LFxuICAgICAnY29yZTptb3ZlLXVwJzogKGUpID0+IEBtb3ZlVXAoZSlcbiAgICAgJ2NvcmU6bW92ZS1kb3duJzogKGUpID0+IEBtb3ZlRG93bihlKVxuICAgICAnY29yZTpwYWdlLXVwJzogPT4gQHBhZ2VVcCgpXG4gICAgICdjb3JlOnBhZ2UtZG93bic6ID0+IEBwYWdlRG93bigpXG4gICAgICdjb3JlOm1vdmUtdG8tdG9wJzogPT4gQHNjcm9sbFRvVG9wKClcbiAgICAgJ2NvcmU6bW92ZS10by1ib3R0b20nOiA9PiBAc2Nyb2xsVG9Cb3R0b20oKVxuICAgICAndHJlZS12aWV3OmV4cGFuZC1pdGVtJzogPT4gQG9wZW5TZWxlY3RlZEVudHJ5KHBlbmRpbmc6IHRydWUsIHRydWUpXG4gICAgICd0cmVlLXZpZXc6cmVjdXJzaXZlLWV4cGFuZC1kaXJlY3RvcnknOiA9PiBAZXhwYW5kRGlyZWN0b3J5KHRydWUpXG4gICAgICd0cmVlLXZpZXc6Y29sbGFwc2UtZGlyZWN0b3J5JzogPT4gQGNvbGxhcHNlRGlyZWN0b3J5KClcbiAgICAgJ3RyZWUtdmlldzpyZWN1cnNpdmUtY29sbGFwc2UtZGlyZWN0b3J5JzogPT4gQGNvbGxhcHNlRGlyZWN0b3J5KHRydWUpXG4gICAgICd0cmVlLXZpZXc6Y29sbGFwc2UtYWxsJzogPT4gQGNvbGxhcHNlRGlyZWN0b3J5KHRydWUsIHRydWUpXG4gICAgICd0cmVlLXZpZXc6b3Blbi1zZWxlY3RlZC1lbnRyeSc6ID0+IEBvcGVuU2VsZWN0ZWRFbnRyeSgpXG4gICAgICd0cmVlLXZpZXc6b3Blbi1zZWxlY3RlZC1lbnRyeS1yaWdodCc6ID0+IEBvcGVuU2VsZWN0ZWRFbnRyeVJpZ2h0KClcbiAgICAgJ3RyZWUtdmlldzpvcGVuLXNlbGVjdGVkLWVudHJ5LWxlZnQnOiA9PiBAb3BlblNlbGVjdGVkRW50cnlMZWZ0KClcbiAgICAgJ3RyZWUtdmlldzpvcGVuLXNlbGVjdGVkLWVudHJ5LXVwJzogPT4gQG9wZW5TZWxlY3RlZEVudHJ5VXAoKVxuICAgICAndHJlZS12aWV3Om9wZW4tc2VsZWN0ZWQtZW50cnktZG93bic6ID0+IEBvcGVuU2VsZWN0ZWRFbnRyeURvd24oKVxuICAgICAndHJlZS12aWV3Om1vdmUnOiA9PiBAbW92ZVNlbGVjdGVkRW50cnkoKVxuICAgICAndHJlZS12aWV3OmNvcHknOiA9PiBAY29weVNlbGVjdGVkRW50cmllcygpXG4gICAgICd0cmVlLXZpZXc6Y3V0JzogPT4gQGN1dFNlbGVjdGVkRW50cmllcygpXG4gICAgICd0cmVlLXZpZXc6cGFzdGUnOiA9PiBAcGFzdGVFbnRyaWVzKClcbiAgICAgJ3RyZWUtdmlldzpjb3B5LWZ1bGwtcGF0aCc6ID0+IEBjb3B5U2VsZWN0ZWRFbnRyeVBhdGgoZmFsc2UpXG4gICAgICd0cmVlLXZpZXc6c2hvdy1pbi1maWxlLW1hbmFnZXInOiA9PiBAc2hvd1NlbGVjdGVkRW50cnlJbkZpbGVNYW5hZ2VyKClcbiAgICAgJ3RyZWUtdmlldzpvcGVuLWluLW5ldy13aW5kb3cnOiA9PiBAb3BlblNlbGVjdGVkRW50cnlJbk5ld1dpbmRvdygpXG4gICAgICd0cmVlLXZpZXc6Y29weS1wcm9qZWN0LXBhdGgnOiA9PiBAY29weVNlbGVjdGVkRW50cnlQYXRoKHRydWUpXG4gICAgICd0cmVlLXZpZXc6dW5mb2N1cyc6ID0+IEB1bmZvY3VzKClcbiAgICAgJ3RyZWUtdmlldzp0b2dnbGUtdmNzLWlnbm9yZWQtZmlsZXMnOiAtPiB0b2dnbGVDb25maWcgJ3RyZWUtdmlldy5oaWRlVmNzSWdub3JlZEZpbGVzJ1xuICAgICAndHJlZS12aWV3OnRvZ2dsZS1pZ25vcmVkLW5hbWVzJzogLT4gdG9nZ2xlQ29uZmlnICd0cmVlLXZpZXcuaGlkZUlnbm9yZWROYW1lcydcbiAgICAgJ3RyZWUtdmlldzpyZW1vdmUtcHJvamVjdC1mb2xkZXInOiAoZSkgPT4gQHJlbW92ZVByb2plY3RGb2xkZXIoZSlcblxuICAgIFswLi44XS5mb3JFYWNoIChpbmRleCkgPT5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkIEBlbGVtZW50LCBcInRyZWUtdmlldzpvcGVuLXNlbGVjdGVkLWVudHJ5LWluLXBhbmUtI3tpbmRleCArIDF9XCIsID0+XG4gICAgICAgIEBvcGVuU2VsZWN0ZWRFbnRyeUluUGFuZSBpbmRleFxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtID0+XG4gICAgICBAc2VsZWN0QWN0aXZlRmlsZSgpXG4gICAgICBAcmV2ZWFsQWN0aXZlRmlsZSh7c2hvdzogZmFsc2UsIGZvY3VzOiBmYWxzZX0pIGlmIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LmF1dG9SZXZlYWwnKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMgPT5cbiAgICAgIEB1cGRhdGVSb290cygpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAndHJlZS12aWV3LmhpZGVWY3NJZ25vcmVkRmlsZXMnLCA9PlxuICAgICAgQHVwZGF0ZVJvb3RzKClcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICd0cmVlLXZpZXcuaGlkZUlnbm9yZWROYW1lcycsID0+XG4gICAgICBAdXBkYXRlUm9vdHMoKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2NvcmUuaWdub3JlZE5hbWVzJywgPT5cbiAgICAgIEB1cGRhdGVSb290cygpIGlmIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LmhpZGVJZ25vcmVkTmFtZXMnKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3RyZWUtdmlldy5zb3J0Rm9sZGVyc0JlZm9yZUZpbGVzJywgPT5cbiAgICAgIEB1cGRhdGVSb290cygpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAndHJlZS12aWV3LnNxdWFzaERpcmVjdG9yeU5hbWVzJywgPT5cbiAgICAgIEB1cGRhdGVSb290cygpXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLnRvZ2dsZSh0aGlzKVxuXG4gIHNob3c6IChmb2N1cykgLT5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHRoaXMsIHtcbiAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICAgICAgYWN0aXZhdGVQYW5lOiBmYWxzZSxcbiAgICAgIGFjdGl2YXRlSXRlbTogZmFsc2UsXG4gICAgfSkudGhlbiA9PlxuICAgICAgYXRvbS53b3Jrc3BhY2UucGFuZUNvbnRhaW5lckZvclVSSShAZ2V0VVJJKCkpLnNob3coKVxuICAgICAgQGZvY3VzKCkgaWYgZm9jdXNcblxuICBoaWRlOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLmhpZGUodGhpcylcblxuICBmb2N1czogLT5cbiAgICBAZWxlbWVudC5mb2N1cygpXG5cbiAgdW5mb2N1czogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5hY3RpdmF0ZSgpXG5cbiAgaGFzRm9jdXM6IC0+XG4gICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBpcyBAZWxlbWVudFxuXG4gIHRvZ2dsZUZvY3VzOiAtPlxuICAgIGlmIEBoYXNGb2N1cygpXG4gICAgICBAdW5mb2N1cygpXG4gICAgZWxzZVxuICAgICAgQHNob3codHJ1ZSlcblxuICBlbnRyeUNsaWNrZWQ6IChlKSAtPlxuICAgIGlmIGVudHJ5ID0gZS50YXJnZXQuY2xvc2VzdCgnLmVudHJ5JylcbiAgICAgIGlzUmVjdXJzaXZlID0gZS5hbHRLZXkgb3IgZmFsc2VcbiAgICAgIEBzZWxlY3RFbnRyeShlbnRyeSlcbiAgICAgIGlmIGVudHJ5LmNsYXNzTGlzdC5jb250YWlucygnZGlyZWN0b3J5JylcbiAgICAgICAgZW50cnkudG9nZ2xlRXhwYW5zaW9uKGlzUmVjdXJzaXZlKVxuICAgICAgZWxzZSBpZiBlbnRyeS5jbGFzc0xpc3QuY29udGFpbnMoJ2ZpbGUnKVxuICAgICAgICBAZmlsZVZpZXdFbnRyeUNsaWNrZWQoZSlcblxuICBmaWxlVmlld0VudHJ5Q2xpY2tlZDogKGUpIC0+XG4gICAgZmlsZVBhdGggPSBlLnRhcmdldC5jbG9zZXN0KCcuZW50cnknKS5nZXRQYXRoKClcbiAgICBkZXRhaWwgPSBlLmRldGFpbCA/IDFcbiAgICBhbHdheXNPcGVuRXhpc3RpbmcgPSBhdG9tLmNvbmZpZy5nZXQoJ3RyZWUtdmlldy5hbHdheXNPcGVuRXhpc3RpbmcnKVxuICAgIGlmIGRldGFpbCBpcyAxXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2NvcmUuYWxsb3dQZW5kaW5nUGFuZUl0ZW1zJylcbiAgICAgICAgb3BlblByb21pc2UgPSBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoLCBwZW5kaW5nOiB0cnVlLCBhY3RpdmF0ZVBhbmU6IGZhbHNlLCBzZWFyY2hBbGxQYW5lczogYWx3YXlzT3BlbkV4aXN0aW5nKVxuICAgICAgICBAY3VycmVudGx5T3BlbmluZy5zZXQoZmlsZVBhdGgsIG9wZW5Qcm9taXNlKVxuICAgICAgICBvcGVuUHJvbWlzZS50aGVuID0+IEBjdXJyZW50bHlPcGVuaW5nLmRlbGV0ZShmaWxlUGF0aClcbiAgICBlbHNlIGlmIGRldGFpbCBpcyAyXG4gICAgICBAb3BlbkFmdGVyUHJvbWlzZShmaWxlUGF0aCwgc2VhcmNoQWxsUGFuZXM6IGFsd2F5c09wZW5FeGlzdGluZylcblxuICBvcGVuQWZ0ZXJQcm9taXNlOiAodXJpLCBvcHRpb25zKSAtPlxuICAgIGlmIHByb21pc2UgPSBAY3VycmVudGx5T3BlbmluZy5nZXQodXJpKVxuICAgICAgcHJvbWlzZS50aGVuIC0+IGF0b20ud29ya3NwYWNlLm9wZW4odXJpLCBvcHRpb25zKVxuICAgIGVsc2VcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4odXJpLCBvcHRpb25zKVxuXG4gIHVwZGF0ZVJvb3RzOiAoZXhwYW5zaW9uU3RhdGVzPXt9KSAtPlxuICAgIHNlbGVjdGVkUGF0aHMgPSBAc2VsZWN0ZWRQYXRocygpXG5cbiAgICBvbGRFeHBhbnNpb25TdGF0ZXMgPSB7fVxuICAgIGZvciByb290IGluIEByb290c1xuICAgICAgb2xkRXhwYW5zaW9uU3RhdGVzW3Jvb3QuZGlyZWN0b3J5LnBhdGhdID0gcm9vdC5kaXJlY3Rvcnkuc2VyaWFsaXplRXhwYW5zaW9uU3RhdGUoKVxuICAgICAgcm9vdC5kaXJlY3RvcnkuZGVzdHJveSgpXG4gICAgICByb290LnJlbW92ZSgpXG5cbiAgICBAcm9vdHMgPSBbXVxuXG4gICAgcHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICBpZiBwcm9qZWN0UGF0aHMubGVuZ3RoID4gMFxuICAgICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQoQGxpc3QpIHVubGVzcyBAZWxlbWVudC5xdWVyeVNlbGVjdG9yKCd0cmVlLXZpZXctcm9vdCcpXG5cbiAgICAgIGFkZFByb2plY3RzVmlld0VsZW1lbnQgPSBAZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcjYWRkLXByb2plY3RzLXZpZXcnKVxuICAgICAgQGVsZW1lbnQucmVtb3ZlQ2hpbGQoYWRkUHJvamVjdHNWaWV3RWxlbWVudCkgaWYgYWRkUHJvamVjdHNWaWV3RWxlbWVudFxuXG4gICAgICBJZ25vcmVkTmFtZXMgPz0gcmVxdWlyZSgnLi9pZ25vcmVkLW5hbWVzJylcblxuICAgICAgQHJvb3RzID0gZm9yIHByb2plY3RQYXRoIGluIHByb2plY3RQYXRoc1xuICAgICAgICBzdGF0cyA9IGZzLmxzdGF0U3luY05vRXhjZXB0aW9uKHByb2plY3RQYXRoKVxuICAgICAgICBjb250aW51ZSB1bmxlc3Mgc3RhdHNcbiAgICAgICAgc3RhdHMgPSBfLnBpY2sgc3RhdHMsIF8ua2V5cyhzdGF0cykuLi5cbiAgICAgICAgZm9yIGtleSBpbiBbXCJhdGltZVwiLCBcImJpcnRodGltZVwiLCBcImN0aW1lXCIsIFwibXRpbWVcIl1cbiAgICAgICAgICBzdGF0c1trZXldID0gc3RhdHNba2V5XS5nZXRUaW1lKClcblxuICAgICAgICBkaXJlY3RvcnkgPSBuZXcgRGlyZWN0b3J5KHtcbiAgICAgICAgICBuYW1lOiBwYXRoLmJhc2VuYW1lKHByb2plY3RQYXRoKVxuICAgICAgICAgIGZ1bGxQYXRoOiBwcm9qZWN0UGF0aFxuICAgICAgICAgIHN5bWxpbms6IGZhbHNlXG4gICAgICAgICAgaXNSb290OiB0cnVlXG4gICAgICAgICAgZXhwYW5zaW9uU3RhdGU6IGV4cGFuc2lvblN0YXRlc1twcm9qZWN0UGF0aF0gP1xuICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRFeHBhbnNpb25TdGF0ZXNbcHJvamVjdFBhdGhdID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAge2lzRXhwYW5kZWQ6IHRydWV9XG4gICAgICAgICAgaWdub3JlZE5hbWVzOiBuZXcgSWdub3JlZE5hbWVzKClcbiAgICAgICAgICBAdXNlU3luY0ZTXG4gICAgICAgICAgc3RhdHNcbiAgICAgICAgfSlcbiAgICAgICAgcm9vdCA9IG5ldyBEaXJlY3RvcnlWaWV3KGRpcmVjdG9yeSkuZWxlbWVudFxuICAgICAgICBAbGlzdC5hcHBlbmRDaGlsZChyb290KVxuICAgICAgICByb290XG5cbiAgICAgICMgVGhlIERPTSBoYXMgYmVlbiByZWNyZWF0ZWQ7IHJlc2VsZWN0IGV2ZXJ5dGhpbmdcbiAgICAgIEBzZWxlY3RNdWx0aXBsZUVudHJpZXMoQGVudHJ5Rm9yUGF0aChzZWxlY3RlZFBhdGgpKSBmb3Igc2VsZWN0ZWRQYXRoIGluIHNlbGVjdGVkUGF0aHNcbiAgICBlbHNlXG4gICAgICBAZWxlbWVudC5yZW1vdmVDaGlsZChAbGlzdCkgaWYgQGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnRyZWUtdmlldy1yb290JylcbiAgICAgIEBlbGVtZW50LmFwcGVuZENoaWxkKG5ldyBBZGRQcm9qZWN0c1ZpZXcoKS5lbGVtZW50KSB1bmxlc3MgQGVsZW1lbnQucXVlcnlTZWxlY3RvcignI2FkZC1wcm9qZWN0cy12aWV3JylcblxuICBnZXRBY3RpdmVQYXRoOiAtPiBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5nZXRBY3RpdmVQYW5lSXRlbSgpPy5nZXRQYXRoPygpXG5cbiAgc2VsZWN0QWN0aXZlRmlsZTogLT5cbiAgICBhY3RpdmVGaWxlUGF0aCA9IEBnZXRBY3RpdmVQYXRoKClcbiAgICBpZiBAZW50cnlGb3JQYXRoKGFjdGl2ZUZpbGVQYXRoKVxuICAgICAgQHNlbGVjdEVudHJ5Rm9yUGF0aChhY3RpdmVGaWxlUGF0aClcbiAgICBlbHNlXG4gICAgICAjIElmIHRoZSBhY3RpdmUgZmlsZSBpcyBub3QgcGFydCBvZiB0aGUgcHJvamVjdCwgZGVzZWxlY3QgYWxsIGVudHJpZXNcbiAgICAgIEBkZXNlbGVjdCgpXG5cbiAgcmV2ZWFsQWN0aXZlRmlsZTogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkgdW5sZXNzIGF0b20ucHJvamVjdC5nZXRQYXRocygpLmxlbmd0aFxuXG4gICAge3Nob3csIGZvY3VzfSA9IG9wdGlvbnNcblxuICAgIGZvY3VzID89IGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LmZvY3VzT25SZXZlYWwnKVxuICAgIHByb21pc2UgPSBpZiBzaG93IG9yIGZvY3VzIHRoZW4gQHNob3coZm9jdXMpIGVsc2UgUHJvbWlzZS5yZXNvbHZlKClcbiAgICBwcm9taXNlLnRoZW4gPT5cbiAgICAgIHJldHVybiB1bmxlc3MgYWN0aXZlRmlsZVBhdGggPSBAZ2V0QWN0aXZlUGF0aCgpXG5cbiAgICAgIFtyb290UGF0aCwgcmVsYXRpdmVQYXRoXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChhY3RpdmVGaWxlUGF0aClcbiAgICAgIHJldHVybiB1bmxlc3Mgcm9vdFBhdGg/XG5cbiAgICAgIGFjdGl2ZVBhdGhDb21wb25lbnRzID0gcmVsYXRpdmVQYXRoLnNwbGl0KHBhdGguc2VwKVxuICAgICAgIyBBZGQgdGhlIHJvb3QgZm9sZGVyIHRvIHRoZSBwYXRoIGNvbXBvbmVudHNcbiAgICAgIGFjdGl2ZVBhdGhDb21wb25lbnRzLnVuc2hpZnQocm9vdFBhdGguc3Vic3RyKHJvb3RQYXRoLmxhc3RJbmRleE9mKHBhdGguc2VwKSArIDEpKVxuICAgICAgIyBBbmQgcmVtb3ZlIGl0IGZyb20gdGhlIGN1cnJlbnQgcGF0aFxuICAgICAgY3VycmVudFBhdGggPSByb290UGF0aC5zdWJzdHIoMCwgcm9vdFBhdGgubGFzdEluZGV4T2YocGF0aC5zZXApKVxuICAgICAgZm9yIHBhdGhDb21wb25lbnQgaW4gYWN0aXZlUGF0aENvbXBvbmVudHNcbiAgICAgICAgY3VycmVudFBhdGggKz0gcGF0aC5zZXAgKyBwYXRoQ29tcG9uZW50XG4gICAgICAgIGVudHJ5ID0gQGVudHJ5Rm9yUGF0aChjdXJyZW50UGF0aClcbiAgICAgICAgaWYgZW50cnkuY2xhc3NMaXN0LmNvbnRhaW5zKCdkaXJlY3RvcnknKVxuICAgICAgICAgIGVudHJ5LmV4cGFuZCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAc2VsZWN0RW50cnkoZW50cnkpXG4gICAgICAgICAgQHNjcm9sbFRvRW50cnkoZW50cnkpXG5cbiAgY29weVNlbGVjdGVkRW50cnlQYXRoOiAocmVsYXRpdmVQYXRoID0gZmFsc2UpIC0+XG4gICAgaWYgcGF0aFRvQ29weSA9IEBzZWxlY3RlZFBhdGhcbiAgICAgIHBhdGhUb0NvcHkgPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZShwYXRoVG9Db3B5KSBpZiByZWxhdGl2ZVBhdGhcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHBhdGhUb0NvcHkpXG5cbiAgZW50cnlGb3JQYXRoOiAoZW50cnlQYXRoKSAtPlxuICAgIGJlc3RNYXRjaEVudHJ5ID0gbnVsbFxuICAgIGJlc3RNYXRjaExlbmd0aCA9IDBcblxuICAgIGZvciBlbnRyeSBpbiBAbGlzdC5xdWVyeVNlbGVjdG9yQWxsKCcuZW50cnknKVxuICAgICAgaWYgZW50cnkuaXNQYXRoRXF1YWwoZW50cnlQYXRoKVxuICAgICAgICByZXR1cm4gZW50cnlcblxuICAgICAgZW50cnlMZW5ndGggPSBlbnRyeS5nZXRQYXRoKCkubGVuZ3RoXG4gICAgICBpZiBlbnRyeS5kaXJlY3Rvcnk/LmNvbnRhaW5zKGVudHJ5UGF0aCkgYW5kIGVudHJ5TGVuZ3RoID4gYmVzdE1hdGNoTGVuZ3RoXG4gICAgICAgIGJlc3RNYXRjaEVudHJ5ID0gZW50cnlcbiAgICAgICAgYmVzdE1hdGNoTGVuZ3RoID0gZW50cnlMZW5ndGhcblxuICAgIGJlc3RNYXRjaEVudHJ5XG5cbiAgc2VsZWN0RW50cnlGb3JQYXRoOiAoZW50cnlQYXRoKSAtPlxuICAgIEBzZWxlY3RFbnRyeShAZW50cnlGb3JQYXRoKGVudHJ5UGF0aCkpXG5cbiAgbW92ZURvd246IChldmVudCkgLT5cbiAgICBldmVudD8uc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICBzZWxlY3RlZEVudHJ5ID0gQHNlbGVjdGVkRW50cnkoKVxuICAgIGlmIHNlbGVjdGVkRW50cnk/XG4gICAgICBpZiBzZWxlY3RlZEVudHJ5LmNsYXNzTGlzdC5jb250YWlucygnZGlyZWN0b3J5JylcbiAgICAgICAgaWYgQHNlbGVjdEVudHJ5KHNlbGVjdGVkRW50cnkuZW50cmllcy5jaGlsZHJlblswXSlcbiAgICAgICAgICBAc2Nyb2xsVG9FbnRyeShAc2VsZWN0ZWRFbnRyeSgpLCBmYWxzZSlcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgaWYgbmV4dEVudHJ5ID0gQG5leHRFbnRyeShzZWxlY3RlZEVudHJ5KVxuICAgICAgICBAc2VsZWN0RW50cnkobmV4dEVudHJ5KVxuICAgIGVsc2VcbiAgICAgIEBzZWxlY3RFbnRyeShAcm9vdHNbMF0pXG5cbiAgICBAc2Nyb2xsVG9FbnRyeShAc2VsZWN0ZWRFbnRyeSgpLCBmYWxzZSlcblxuICBtb3ZlVXA6IChldmVudCkgLT5cbiAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgIHNlbGVjdGVkRW50cnkgPSBAc2VsZWN0ZWRFbnRyeSgpXG4gICAgaWYgc2VsZWN0ZWRFbnRyeT9cbiAgICAgIGlmIHByZXZpb3VzRW50cnkgPSBAcHJldmlvdXNFbnRyeShzZWxlY3RlZEVudHJ5KVxuICAgICAgICBAc2VsZWN0RW50cnkocHJldmlvdXNFbnRyeSlcbiAgICAgIGVsc2VcbiAgICAgICAgQHNlbGVjdEVudHJ5KHNlbGVjdGVkRW50cnkucGFyZW50RWxlbWVudC5jbG9zZXN0KCcuZGlyZWN0b3J5JykpXG4gICAgZWxzZVxuICAgICAgZW50cmllcyA9IEBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5lbnRyeScpXG4gICAgICBAc2VsZWN0RW50cnkoZW50cmllc1tlbnRyaWVzLmxlbmd0aCAtIDFdKVxuXG4gICAgQHNjcm9sbFRvRW50cnkoQHNlbGVjdGVkRW50cnkoKSwgZmFsc2UpXG5cbiAgbmV4dEVudHJ5OiAoZW50cnkpIC0+XG4gICAgY3VycmVudEVudHJ5ID0gZW50cnlcbiAgICB3aGlsZSBjdXJyZW50RW50cnk/XG4gICAgICBpZiBjdXJyZW50RW50cnkubmV4dFNpYmxpbmc/XG4gICAgICAgIGN1cnJlbnRFbnRyeSA9IGN1cnJlbnRFbnRyeS5uZXh0U2libGluZ1xuICAgICAgICBpZiBjdXJyZW50RW50cnkubWF0Y2hlcygnLmVudHJ5JylcbiAgICAgICAgICByZXR1cm4gY3VycmVudEVudHJ5XG4gICAgICBlbHNlXG4gICAgICAgIGN1cnJlbnRFbnRyeSA9IGN1cnJlbnRFbnRyeS5wYXJlbnRFbGVtZW50LmNsb3Nlc3QoJy5kaXJlY3RvcnknKVxuXG4gICAgcmV0dXJuIG51bGxcblxuICBwcmV2aW91c0VudHJ5OiAoZW50cnkpIC0+XG4gICAgcHJldmlvdXNFbnRyeSA9IGVudHJ5LnByZXZpb3VzU2libGluZ1xuICAgIHdoaWxlIHByZXZpb3VzRW50cnk/IGFuZCBub3QgcHJldmlvdXNFbnRyeS5tYXRjaGVzKCcuZW50cnknKVxuICAgICAgcHJldmlvdXNFbnRyeSA9IHByZXZpb3VzRW50cnkucHJldmlvdXNTaWJsaW5nXG5cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcHJldmlvdXNFbnRyeT9cblxuICAgICMgSWYgdGhlIHByZXZpb3VzIGVudHJ5IGlzIGFuIGV4cGFuZGVkIGRpcmVjdG9yeSxcbiAgICAjIHdlIG5lZWQgdG8gc2VsZWN0IHRoZSBsYXN0IGVudHJ5IGluIHRoYXQgZGlyZWN0b3J5LFxuICAgICMgbm90IHRoZSBkaXJlY3RvcnkgaXRzZWxmXG4gICAgaWYgcHJldmlvdXNFbnRyeS5tYXRjaGVzKCcuZGlyZWN0b3J5LmV4cGFuZGVkJylcbiAgICAgIGVudHJpZXMgPSBwcmV2aW91c0VudHJ5LnF1ZXJ5U2VsZWN0b3JBbGwoJy5lbnRyeScpXG4gICAgICByZXR1cm4gZW50cmllc1tlbnRyaWVzLmxlbmd0aCAtIDFdIGlmIGVudHJpZXMubGVuZ3RoID4gMFxuXG4gICAgcmV0dXJuIHByZXZpb3VzRW50cnlcblxuICBleHBhbmREaXJlY3Rvcnk6IChpc1JlY3Vyc2l2ZT1mYWxzZSkgLT5cbiAgICBzZWxlY3RlZEVudHJ5ID0gQHNlbGVjdGVkRW50cnkoKVxuICAgIHJldHVybiB1bmxlc3Mgc2VsZWN0ZWRFbnRyeT9cblxuICAgIGRpcmVjdG9yeSA9IHNlbGVjdGVkRW50cnkuY2xvc2VzdCgnLmRpcmVjdG9yeScpXG4gICAgaWYgaXNSZWN1cnNpdmUgaXMgZmFsc2UgYW5kIGRpcmVjdG9yeS5pc0V4cGFuZGVkXG4gICAgICAjIFNlbGVjdCB0aGUgZmlyc3QgZW50cnkgaW4gdGhlIGV4cGFuZGVkIGZvbGRlciBpZiBpdCBleGlzdHNcbiAgICAgIEBtb3ZlRG93bigpIGlmIGRpcmVjdG9yeS5kaXJlY3RvcnkuZ2V0RW50cmllcygpLmxlbmd0aCA+IDBcbiAgICBlbHNlXG4gICAgICBkaXJlY3RvcnkuZXhwYW5kKGlzUmVjdXJzaXZlKVxuXG4gIGNvbGxhcHNlRGlyZWN0b3J5OiAoaXNSZWN1cnNpdmU9ZmFsc2UsIGFsbERpcmVjdG9yaWVzPWZhbHNlKSAtPlxuICAgIGlmIGFsbERpcmVjdG9yaWVzXG4gICAgICByb290LmNvbGxhcHNlKHRydWUpIGZvciByb290IGluIEByb290c1xuICAgICAgcmV0dXJuXG5cbiAgICBzZWxlY3RlZEVudHJ5ID0gQHNlbGVjdGVkRW50cnkoKVxuICAgIHJldHVybiB1bmxlc3Mgc2VsZWN0ZWRFbnRyeT9cblxuICAgIGlmIGRpcmVjdG9yeSA9IHNlbGVjdGVkRW50cnkuY2xvc2VzdCgnLmV4cGFuZGVkLmRpcmVjdG9yeScpXG4gICAgICBkaXJlY3RvcnkuY29sbGFwc2UoaXNSZWN1cnNpdmUpXG4gICAgICBAc2VsZWN0RW50cnkoZGlyZWN0b3J5KVxuXG4gIG9wZW5TZWxlY3RlZEVudHJ5OiAob3B0aW9ucz17fSwgZXhwYW5kRGlyZWN0b3J5PWZhbHNlKSAtPlxuICAgIHNlbGVjdGVkRW50cnkgPSBAc2VsZWN0ZWRFbnRyeSgpXG4gICAgcmV0dXJuIHVubGVzcyBzZWxlY3RlZEVudHJ5P1xuXG4gICAgaWYgc2VsZWN0ZWRFbnRyeS5jbGFzc0xpc3QuY29udGFpbnMoJ2RpcmVjdG9yeScpXG4gICAgICBpZiBleHBhbmREaXJlY3RvcnlcbiAgICAgICAgQGV4cGFuZERpcmVjdG9yeShmYWxzZSlcbiAgICAgIGVsc2VcbiAgICAgICAgc2VsZWN0ZWRFbnRyeS50b2dnbGVFeHBhbnNpb24oKVxuICAgIGVsc2UgaWYgc2VsZWN0ZWRFbnRyeS5jbGFzc0xpc3QuY29udGFpbnMoJ2ZpbGUnKVxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCd0cmVlLXZpZXcuYWx3YXlzT3BlbkV4aXN0aW5nJylcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24gc2VhcmNoQWxsUGFuZXM6IHRydWUsIG9wdGlvbnNcbiAgICAgIEBvcGVuQWZ0ZXJQcm9taXNlKHNlbGVjdGVkRW50cnkuZ2V0UGF0aCgpLCBvcHRpb25zKVxuXG4gIG9wZW5TZWxlY3RlZEVudHJ5U3BsaXQ6IChvcmllbnRhdGlvbiwgc2lkZSkgLT5cbiAgICBzZWxlY3RlZEVudHJ5ID0gQHNlbGVjdGVkRW50cnkoKVxuICAgIHJldHVybiB1bmxlc3Mgc2VsZWN0ZWRFbnRyeT9cblxuICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5nZXRBY3RpdmVQYW5lKClcbiAgICBpZiBwYW5lIGFuZCBzZWxlY3RlZEVudHJ5LmNsYXNzTGlzdC5jb250YWlucygnZmlsZScpXG4gICAgICBpZiBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5nZXRBY3RpdmVQYW5lSXRlbSgpXG4gICAgICAgIHNwbGl0ID0gcGFuZS5zcGxpdCBvcmllbnRhdGlvbiwgc2lkZVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lIHNlbGVjdGVkRW50cnkuZ2V0UGF0aCgpLCBzcGxpdFxuICAgICAgZWxzZVxuICAgICAgICBAb3BlblNlbGVjdGVkRW50cnkgeWVzXG5cbiAgb3BlblNlbGVjdGVkRW50cnlSaWdodDogLT5cbiAgICBAb3BlblNlbGVjdGVkRW50cnlTcGxpdCAnaG9yaXpvbnRhbCcsICdhZnRlcidcblxuICBvcGVuU2VsZWN0ZWRFbnRyeUxlZnQ6IC0+XG4gICAgQG9wZW5TZWxlY3RlZEVudHJ5U3BsaXQgJ2hvcml6b250YWwnLCAnYmVmb3JlJ1xuXG4gIG9wZW5TZWxlY3RlZEVudHJ5VXA6IC0+XG4gICAgQG9wZW5TZWxlY3RlZEVudHJ5U3BsaXQgJ3ZlcnRpY2FsJywgJ2JlZm9yZSdcblxuICBvcGVuU2VsZWN0ZWRFbnRyeURvd246IC0+XG4gICAgQG9wZW5TZWxlY3RlZEVudHJ5U3BsaXQgJ3ZlcnRpY2FsJywgJ2FmdGVyJ1xuXG4gIG9wZW5TZWxlY3RlZEVudHJ5SW5QYW5lOiAoaW5kZXgpIC0+XG4gICAgc2VsZWN0ZWRFbnRyeSA9IEBzZWxlY3RlZEVudHJ5KClcbiAgICByZXR1cm4gdW5sZXNzIHNlbGVjdGVkRW50cnk/XG5cbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0UGFuZXMoKVtpbmRleF1cbiAgICBpZiBwYW5lIGFuZCBzZWxlY3RlZEVudHJ5LmNsYXNzTGlzdC5jb250YWlucygnZmlsZScpXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lIHNlbGVjdGVkRW50cnkuZ2V0UGF0aCgpLCBwYW5lXG5cbiAgbW92ZVNlbGVjdGVkRW50cnk6IC0+XG4gICAgaWYgQGhhc0ZvY3VzKClcbiAgICAgIGVudHJ5ID0gQHNlbGVjdGVkRW50cnkoKVxuICAgICAgcmV0dXJuIGlmIG5vdCBlbnRyeT8gb3IgZW50cnkgaW4gQHJvb3RzXG4gICAgICBvbGRQYXRoID0gZW50cnkuZ2V0UGF0aCgpXG4gICAgZWxzZVxuICAgICAgb2xkUGF0aCA9IEBnZXRBY3RpdmVQYXRoKClcblxuICAgIGlmIG9sZFBhdGhcbiAgICAgIGRpYWxvZyA9IG5ldyBNb3ZlRGlhbG9nIG9sZFBhdGgsXG4gICAgICAgIHdpbGxNb3ZlOiAoe2luaXRpYWxQYXRoLCBuZXdQYXRofSkgPT5cbiAgICAgICAgICBAZW1pdHRlci5lbWl0ICd3aWxsLW1vdmUtZW50cnknLCB7aW5pdGlhbFBhdGgsIG5ld1BhdGh9XG4gICAgICAgIG9uTW92ZTogKHtpbml0aWFsUGF0aCwgbmV3UGF0aH0pID0+XG4gICAgICAgICAgQGVtaXR0ZXIuZW1pdCAnZW50cnktbW92ZWQnLCB7aW5pdGlhbFBhdGgsIG5ld1BhdGh9XG4gICAgICAgIG9uTW92ZUZhaWxlZDogKHtpbml0aWFsUGF0aCwgbmV3UGF0aH0pID0+XG4gICAgICAgICAgQGVtaXR0ZXIuZW1pdCAnbW92ZS1lbnRyeS1mYWlsZWQnLCB7aW5pdGlhbFBhdGgsIG5ld1BhdGh9XG4gICAgICBkaWFsb2cuYXR0YWNoKClcblxuICBzaG93U2VsZWN0ZWRFbnRyeUluRmlsZU1hbmFnZXI6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBmaWxlUGF0aCA9IEBzZWxlY3RlZEVudHJ5KCk/LmdldFBhdGgoKVxuXG4gICAgcmV0dXJuIHVubGVzcyBmcy5leGlzdHNTeW5jKGZpbGVQYXRoKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCJVbmFibGUgdG8gc2hvdyAje2ZpbGVQYXRofSBpbiAje0BnZXRGaWxlTWFuYWdlck5hbWUoKX1cIilcblxuICAgIHNoZWxsLnNob3dJdGVtSW5Gb2xkZXIoZmlsZVBhdGgpXG5cbiAgc2hvd0N1cnJlbnRGaWxlSW5GaWxlTWFuYWdlcjogLT5cbiAgICByZXR1cm4gdW5sZXNzIGZpbGVQYXRoID0gYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlVGV4dEVkaXRvcigpPy5nZXRQYXRoKClcblxuICAgIHJldHVybiB1bmxlc3MgZnMuZXhpc3RzU3luYyhmaWxlUGF0aClcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiVW5hYmxlIHRvIHNob3cgI3tmaWxlUGF0aH0gaW4gI3tAZ2V0RmlsZU1hbmFnZXJOYW1lKCl9XCIpXG5cbiAgICBzaGVsbC5zaG93SXRlbUluRm9sZGVyKGZpbGVQYXRoKVxuXG4gIGdldEZpbGVNYW5hZ2VyTmFtZTogLT5cbiAgICBzd2l0Y2ggcHJvY2Vzcy5wbGF0Zm9ybVxuICAgICAgd2hlbiAnZGFyd2luJ1xuICAgICAgICByZXR1cm4gJ0ZpbmRlcidcbiAgICAgIHdoZW4gJ3dpbjMyJ1xuICAgICAgICByZXR1cm4gJ0V4cGxvcmVyJ1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gJ0ZpbGUgTWFuYWdlcidcblxuICBvcGVuU2VsZWN0ZWRFbnRyeUluTmV3V2luZG93OiAtPlxuICAgIGlmIHBhdGhUb09wZW4gPSBAc2VsZWN0ZWRFbnRyeSgpPy5nZXRQYXRoKClcbiAgICAgIGF0b20ub3Blbih7cGF0aHNUb09wZW46IFtwYXRoVG9PcGVuXSwgbmV3V2luZG93OiB0cnVlfSlcblxuICBjb3B5U2VsZWN0ZWRFbnRyeTogLT5cbiAgICBpZiBAaGFzRm9jdXMoKVxuICAgICAgZW50cnkgPSBAc2VsZWN0ZWRFbnRyeSgpXG4gICAgICByZXR1cm4gaWYgZW50cnkgaW4gQHJvb3RzXG4gICAgICBvbGRQYXRoID0gZW50cnk/LmdldFBhdGgoKVxuICAgIGVsc2VcbiAgICAgIG9sZFBhdGggPSBAZ2V0QWN0aXZlUGF0aCgpXG4gICAgcmV0dXJuIHVubGVzcyBvbGRQYXRoXG5cbiAgICBkaWFsb2cgPSBuZXcgQ29weURpYWxvZyBvbGRQYXRoLFxuICAgICAgb25Db3B5OiAoe2luaXRpYWxQYXRoLCBuZXdQYXRofSkgPT5cbiAgICAgICAgQGVtaXR0ZXIuZW1pdCAnZW50cnktY29waWVkJywge2luaXRpYWxQYXRoLCBuZXdQYXRofVxuICAgIGRpYWxvZy5hdHRhY2goKVxuXG4gIHJlbW92ZVNlbGVjdGVkRW50cmllczogLT5cbiAgICBpZiBAaGFzRm9jdXMoKVxuICAgICAgc2VsZWN0ZWRQYXRocyA9IEBzZWxlY3RlZFBhdGhzKClcbiAgICAgIHNlbGVjdGVkRW50cmllcyA9IEBnZXRTZWxlY3RlZEVudHJpZXMoKVxuICAgIGVsc2UgaWYgYWN0aXZlUGF0aCA9IEBnZXRBY3RpdmVQYXRoKClcbiAgICAgIHNlbGVjdGVkUGF0aHMgPSBbYWN0aXZlUGF0aF1cbiAgICAgIHNlbGVjdGVkRW50cmllcyA9IFtAZW50cnlGb3JQYXRoKGFjdGl2ZVBhdGgpXVxuXG4gICAgcmV0dXJuIHVubGVzcyBzZWxlY3RlZFBhdGhzPy5sZW5ndGggPiAwXG5cbiAgICBmb3Igcm9vdCBpbiBAcm9vdHNcbiAgICAgIGlmIHJvb3QuZ2V0UGF0aCgpIGluIHNlbGVjdGVkUGF0aHNcbiAgICAgICAgYXRvbS5jb25maXJtKHtcbiAgICAgICAgICBtZXNzYWdlOiBcIlRoZSByb290IGRpcmVjdG9yeSAnI3tyb290LmRpcmVjdG9yeS5uYW1lfScgY2FuJ3QgYmUgcmVtb3ZlZC5cIixcbiAgICAgICAgICBidXR0b25zOiBbJ09LJ11cbiAgICAgICAgfSwgLT4gIyBub29wXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuXG5cbiAgICBhdG9tLmNvbmZpcm0oe1xuICAgICAgbWVzc2FnZTogXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoZSBzZWxlY3RlZCAje2lmIHNlbGVjdGVkUGF0aHMubGVuZ3RoID4gMSB0aGVuICdpdGVtcycgZWxzZSAnaXRlbSd9P1wiLFxuICAgICAgZGV0YWlsZWRNZXNzYWdlOiBcIllvdSBhcmUgZGVsZXRpbmc6XFxuI3tzZWxlY3RlZFBhdGhzLmpvaW4oJ1xcbicpfVwiLFxuICAgICAgYnV0dG9uczogWydNb3ZlIHRvIFRyYXNoJywgJ0NhbmNlbCddXG4gICAgfSwgKHJlc3BvbnNlKSA9PlxuICAgICAgaWYgcmVzcG9uc2UgaXMgMCAjIE1vdmUgdG8gVHJhc2hcbiAgICAgICAgZmFpbGVkRGVsZXRpb25zID0gW11cbiAgICAgICAgZm9yIHNlbGVjdGVkUGF0aCBpbiBzZWxlY3RlZFBhdGhzXG4gICAgICAgICAgIyBEb24ndCBkZWxldGUgZW50cmllcyB3aGljaCBubyBsb25nZXIgZXhpc3QuIFRoaXMgY2FuIGhhcHBlbiwgZm9yIGV4YW1wbGUsIHdoZW46XG4gICAgICAgICAgIyAqIFRoZSBlbnRyeSBpcyBkZWxldGVkIG91dHNpZGUgb2YgQXRvbSBiZWZvcmUgXCJNb3ZlIHRvIFRyYXNoXCIgaXMgc2VsZWN0ZWRcbiAgICAgICAgICAjICogQSBmb2xkZXIgYW5kIG9uZSBvZiBpdHMgY2hpbGRyZW4gYXJlIGJvdGggc2VsZWN0ZWQgZm9yIGRlbGV0aW9uLFxuICAgICAgICAgICMgICBidXQgdGhlIHBhcmVudCBmb2xkZXIgaXMgZGVsZXRlZCBmaXJzdFxuICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBmcy5leGlzdHNTeW5jKHNlbGVjdGVkUGF0aClcblxuICAgICAgICAgIEBlbWl0dGVyLmVtaXQgJ3dpbGwtZGVsZXRlLWVudHJ5Jywge3BhdGhUb0RlbGV0ZTogc2VsZWN0ZWRQYXRofVxuICAgICAgICAgIGlmIHNoZWxsLm1vdmVJdGVtVG9UcmFzaChzZWxlY3RlZFBhdGgpXG4gICAgICAgICAgICBAZW1pdHRlci5lbWl0ICdlbnRyeS1kZWxldGVkJywge3BhdGhUb0RlbGV0ZTogc2VsZWN0ZWRQYXRofVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBlbWl0dGVyLmVtaXQgJ2RlbGV0ZS1lbnRyeS1mYWlsZWQnLCB7cGF0aFRvRGVsZXRlOiBzZWxlY3RlZFBhdGh9XG4gICAgICAgICAgICBmYWlsZWREZWxldGlvbnMucHVzaCBzZWxlY3RlZFBhdGhcblxuICAgICAgICAgIGlmIHJlcG8gPSByZXBvRm9yUGF0aChzZWxlY3RlZFBhdGgpXG4gICAgICAgICAgICByZXBvLmdldFBhdGhTdGF0dXMoc2VsZWN0ZWRQYXRoKVxuXG4gICAgICAgIGlmIGZhaWxlZERlbGV0aW9ucy5sZW5ndGggPiAwXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIEBmb3JtYXRUcmFzaEZhaWx1cmVNZXNzYWdlKGZhaWxlZERlbGV0aW9ucyksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogQGZvcm1hdFRyYXNoRW5hYmxlZE1lc3NhZ2UoKVxuICAgICAgICAgICAgZGV0YWlsOiBcIiN7ZmFpbGVkRGVsZXRpb25zLmpvaW4oJ1xcbicpfVwiXG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuXG4gICAgICAgICMgRm9jdXMgdGhlIGZpcnN0IHBhcmVudCBmb2xkZXJcbiAgICAgICAgaWYgZmlyc3RTZWxlY3RlZEVudHJ5ID0gc2VsZWN0ZWRFbnRyaWVzWzBdXG4gICAgICAgICAgQHNlbGVjdEVudHJ5KGZpcnN0U2VsZWN0ZWRFbnRyeS5jbG9zZXN0KCcuZGlyZWN0b3J5Om5vdCguc2VsZWN0ZWQpJykpXG4gICAgICAgIEB1cGRhdGVSb290cygpIGlmIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LnNxdWFzaERpcmVjdG9yeU5hbWVzJylcbiAgICApXG5cbiAgZm9ybWF0VHJhc2hGYWlsdXJlTWVzc2FnZTogKGZhaWxlZERlbGV0aW9ucykgLT5cbiAgICBmaWxlVGV4dCA9IGlmIGZhaWxlZERlbGV0aW9ucy5sZW5ndGggPiAxIHRoZW4gJ2ZpbGVzJyBlbHNlICdmaWxlJ1xuXG4gICAgXCJUaGUgZm9sbG93aW5nICN7ZmlsZVRleHR9IGNvdWxkbid0IGJlIG1vdmVkIHRvIHRoZSB0cmFzaC5cIlxuXG4gIGZvcm1hdFRyYXNoRW5hYmxlZE1lc3NhZ2U6IC0+XG4gICAgc3dpdGNoIHByb2Nlc3MucGxhdGZvcm1cbiAgICAgIHdoZW4gJ2xpbnV4JyB0aGVuICdJcyBgZ3Zmcy10cmFzaGAgaW5zdGFsbGVkPydcbiAgICAgIHdoZW4gJ2RhcndpbicgdGhlbiAnSXMgVHJhc2ggZW5hYmxlZCBvbiB0aGUgdm9sdW1lIHdoZXJlIHRoZSBmaWxlcyBhcmUgc3RvcmVkPydcbiAgICAgIHdoZW4gJ3dpbjMyJyB0aGVuICdJcyB0aGVyZSBhIFJlY3ljbGUgQmluIG9uIHRoZSBkcml2ZSB3aGVyZSB0aGUgZmlsZXMgYXJlIHN0b3JlZD8nXG5cbiAgIyBQdWJsaWM6IENvcHkgdGhlIHBhdGggb2YgdGhlIHNlbGVjdGVkIGVudHJ5IGVsZW1lbnQuXG4gICMgICAgICAgICBTYXZlIHRoZSBwYXRoIGluIGxvY2FsU3RvcmFnZSwgc28gdGhhdCBjb3B5aW5nIGZyb20gMiBkaWZmZXJlbnRcbiAgIyAgICAgICAgIGluc3RhbmNlcyBvZiBhdG9tIHdvcmtzIGFzIGludGVuZGVkXG4gICNcbiAgI1xuICAjIFJldHVybnMgYGNvcHlQYXRoYC5cbiAgY29weVNlbGVjdGVkRW50cmllczogLT5cbiAgICBzZWxlY3RlZFBhdGhzID0gQHNlbGVjdGVkUGF0aHMoKVxuICAgIHJldHVybiB1bmxlc3Mgc2VsZWN0ZWRQYXRocyBhbmQgc2VsZWN0ZWRQYXRocy5sZW5ndGggPiAwXG4gICAgIyBzYXZlIHRvIGxvY2FsU3RvcmFnZSBzbyB3ZSBjYW4gcGFzdGUgYWNyb3NzIG11bHRpcGxlIG9wZW4gYXBwc1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndHJlZS12aWV3OmN1dFBhdGgnKVxuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ3RyZWUtdmlldzpjb3B5UGF0aCddID0gSlNPTi5zdHJpbmdpZnkoc2VsZWN0ZWRQYXRocylcblxuICAjIFB1YmxpYzogQ3V0IHRoZSBwYXRoIG9mIHRoZSBzZWxlY3RlZCBlbnRyeSBlbGVtZW50LlxuICAjICAgICAgICAgU2F2ZSB0aGUgcGF0aCBpbiBsb2NhbFN0b3JhZ2UsIHNvIHRoYXQgY3V0dGluZyBmcm9tIDIgZGlmZmVyZW50XG4gICMgICAgICAgICBpbnN0YW5jZXMgb2YgYXRvbSB3b3JrcyBhcyBpbnRlbmRlZFxuICAjXG4gICNcbiAgIyBSZXR1cm5zIGBjdXRQYXRoYFxuICBjdXRTZWxlY3RlZEVudHJpZXM6IC0+XG4gICAgc2VsZWN0ZWRQYXRocyA9IEBzZWxlY3RlZFBhdGhzKClcbiAgICByZXR1cm4gdW5sZXNzIHNlbGVjdGVkUGF0aHMgYW5kIHNlbGVjdGVkUGF0aHMubGVuZ3RoID4gMFxuICAgICMgc2F2ZSB0byBsb2NhbFN0b3JhZ2Ugc28gd2UgY2FuIHBhc3RlIGFjcm9zcyBtdWx0aXBsZSBvcGVuIGFwcHNcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3RyZWUtdmlldzpjb3B5UGF0aCcpXG4gICAgd2luZG93LmxvY2FsU3RvcmFnZVsndHJlZS12aWV3OmN1dFBhdGgnXSA9IEpTT04uc3RyaW5naWZ5KHNlbGVjdGVkUGF0aHMpXG5cbiAgIyBQdWJsaWM6IFBhc3RlIGEgY29waWVkIG9yIGN1dCBpdGVtLlxuICAjICAgICAgICAgSWYgYSBmaWxlIGlzIHNlbGVjdGVkLCB0aGUgZmlsZSdzIHBhcmVudCBkaXJlY3RvcnkgaXMgdXNlZCBhcyB0aGVcbiAgIyAgICAgICAgIHBhc3RlIGRlc3RpbmF0aW9uLlxuICBwYXN0ZUVudHJpZXM6IC0+XG4gICAgc2VsZWN0ZWRFbnRyeSA9IEBzZWxlY3RlZEVudHJ5KClcbiAgICByZXR1cm4gdW5sZXNzIHNlbGVjdGVkRW50cnlcblxuICAgIGN1dFBhdGhzID0gaWYgd2luZG93LmxvY2FsU3RvcmFnZVsndHJlZS12aWV3OmN1dFBhdGgnXSB0aGVuIEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZVsndHJlZS12aWV3OmN1dFBhdGgnXSkgZWxzZSBudWxsXG4gICAgY29waWVkUGF0aHMgPSBpZiB3aW5kb3cubG9jYWxTdG9yYWdlWyd0cmVlLXZpZXc6Y29weVBhdGgnXSB0aGVuIEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZVsndHJlZS12aWV3OmNvcHlQYXRoJ10pIGVsc2UgbnVsbFxuICAgIGluaXRpYWxQYXRocyA9IGNvcGllZFBhdGhzIG9yIGN1dFBhdGhzXG4gICAgcmV0dXJuIHVubGVzcyBpbml0aWFsUGF0aHM/Lmxlbmd0aFxuXG4gICAgbmV3RGlyZWN0b3J5UGF0aCA9IHNlbGVjdGVkRW50cnkuZ2V0UGF0aCgpXG4gICAgbmV3RGlyZWN0b3J5UGF0aCA9IHBhdGguZGlybmFtZShuZXdEaXJlY3RvcnlQYXRoKSBpZiBzZWxlY3RlZEVudHJ5LmNsYXNzTGlzdC5jb250YWlucygnZmlsZScpXG5cbiAgICBmb3IgaW5pdGlhbFBhdGggaW4gaW5pdGlhbFBhdGhzXG4gICAgICBpZiBmcy5leGlzdHNTeW5jKGluaXRpYWxQYXRoKVxuICAgICAgICBpZiBjb3BpZWRQYXRoc1xuICAgICAgICAgIEBjb3B5RW50cnkoaW5pdGlhbFBhdGgsIG5ld0RpcmVjdG9yeVBhdGgpXG4gICAgICAgIGVsc2UgaWYgY3V0UGF0aHNcbiAgICAgICAgICBicmVhayB1bmxlc3MgQG1vdmVFbnRyeShpbml0aWFsUGF0aCwgbmV3RGlyZWN0b3J5UGF0aClcblxuICBhZGQ6IChpc0NyZWF0aW5nRmlsZSkgLT5cbiAgICBzZWxlY3RlZEVudHJ5ID0gQHNlbGVjdGVkRW50cnkoKSA/IEByb290c1swXVxuICAgIHNlbGVjdGVkUGF0aCA9IHNlbGVjdGVkRW50cnk/LmdldFBhdGgoKSA/ICcnXG5cbiAgICBkaWFsb2cgPSBuZXcgQWRkRGlhbG9nKHNlbGVjdGVkUGF0aCwgaXNDcmVhdGluZ0ZpbGUpXG4gICAgZGlhbG9nLm9uRGlkQ3JlYXRlRGlyZWN0b3J5IChjcmVhdGVkUGF0aCkgPT5cbiAgICAgIEBlbnRyeUZvclBhdGgoY3JlYXRlZFBhdGgpPy5yZWxvYWQoKVxuICAgICAgQHNlbGVjdEVudHJ5Rm9yUGF0aChjcmVhdGVkUGF0aClcbiAgICAgIEB1cGRhdGVSb290cygpIGlmIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LnNxdWFzaERpcmVjdG9yeU5hbWVzJylcbiAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpcmVjdG9yeS1jcmVhdGVkJywge3BhdGg6IGNyZWF0ZWRQYXRofVxuICAgIGRpYWxvZy5vbkRpZENyZWF0ZUZpbGUgKGNyZWF0ZWRQYXRoKSA9PlxuICAgICAgQGVudHJ5Rm9yUGF0aChjcmVhdGVkUGF0aCk/LnJlbG9hZCgpXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGNyZWF0ZWRQYXRoKVxuICAgICAgQHVwZGF0ZVJvb3RzKCkgaWYgYXRvbS5jb25maWcuZ2V0KCd0cmVlLXZpZXcuc3F1YXNoRGlyZWN0b3J5TmFtZXMnKVxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZmlsZS1jcmVhdGVkJywge3BhdGg6IGNyZWF0ZWRQYXRofVxuICAgIGRpYWxvZy5hdHRhY2goKVxuXG4gIHJlbW92ZVByb2plY3RGb2xkZXI6IChlKSAtPlxuICAgICMgUmVtb3ZlIHRoZSB0YXJnZXRlZCBwcm9qZWN0IGZvbGRlciAoZ2VuZXJhbGx5IHRoaXMgb25seSBoYXBwZW5zIHRocm91Z2ggdGhlIGNvbnRleHQgbWVudSlcbiAgICBwYXRoVG9SZW1vdmUgPSBlLnRhcmdldC5jbG9zZXN0KFwiLnByb2plY3Qtcm9vdCA+IC5oZWFkZXJcIik/LnF1ZXJ5U2VsZWN0b3IoXCIubmFtZVwiKT8uZGF0YXNldC5wYXRoXG4gICAgIyBJZiBhbiBlbnRyeSBpcyBzZWxlY3RlZCwgcmVtb3ZlIHRoYXQgZW50cnkncyBwcm9qZWN0IGZvbGRlclxuICAgIHBhdGhUb1JlbW92ZSA/PSBAc2VsZWN0ZWRFbnRyeSgpPy5jbG9zZXN0KFwiLnByb2plY3Qtcm9vdFwiKT8ucXVlcnlTZWxlY3RvcihcIi5oZWFkZXJcIik/LnF1ZXJ5U2VsZWN0b3IoXCIubmFtZVwiKT8uZGF0YXNldC5wYXRoXG4gICAgIyBGaW5hbGx5LCBpZiBvbmx5IG9uZSBwcm9qZWN0IGZvbGRlciBleGlzdHMgYW5kIG5vdGhpbmcgaXMgc2VsZWN0ZWQsIHJlbW92ZSB0aGF0IGZvbGRlclxuICAgIHBhdGhUb1JlbW92ZSA/PSBAcm9vdHNbMF0ucXVlcnlTZWxlY3RvcihcIi5oZWFkZXJcIik/LnF1ZXJ5U2VsZWN0b3IoXCIubmFtZVwiKT8uZGF0YXNldC5wYXRoIGlmIEByb290cy5sZW5ndGggaXMgMVxuICAgIGF0b20ucHJvamVjdC5yZW1vdmVQYXRoKHBhdGhUb1JlbW92ZSkgaWYgcGF0aFRvUmVtb3ZlP1xuXG4gIHNlbGVjdGVkRW50cnk6IC0+XG4gICAgQGxpc3QucXVlcnlTZWxlY3RvcignLnNlbGVjdGVkJylcblxuICBzZWxlY3RFbnRyeTogKGVudHJ5KSAtPlxuICAgIHJldHVybiB1bmxlc3MgZW50cnk/XG5cbiAgICBAc2VsZWN0ZWRQYXRoID0gZW50cnkuZ2V0UGF0aCgpXG4gICAgQGxhc3RGb2N1c2VkRW50cnkgPSBlbnRyeVxuXG4gICAgc2VsZWN0ZWRFbnRyaWVzID0gQGdldFNlbGVjdGVkRW50cmllcygpXG4gICAgaWYgc2VsZWN0ZWRFbnRyaWVzLmxlbmd0aCA+IDEgb3Igc2VsZWN0ZWRFbnRyaWVzWzBdIGlzbnQgZW50cnlcbiAgICAgIEBkZXNlbGVjdChzZWxlY3RlZEVudHJpZXMpXG4gICAgICBlbnRyeS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG4gICAgZW50cnlcblxuICBnZXRTZWxlY3RlZEVudHJpZXM6IC0+XG4gICAgQGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLnNlbGVjdGVkJylcblxuICBkZXNlbGVjdDogKGVsZW1lbnRzVG9EZXNlbGVjdD1AZ2V0U2VsZWN0ZWRFbnRyaWVzKCkpIC0+XG4gICAgc2VsZWN0ZWQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKSBmb3Igc2VsZWN0ZWQgaW4gZWxlbWVudHNUb0Rlc2VsZWN0XG4gICAgdW5kZWZpbmVkXG5cbiAgc2Nyb2xsVG9wOiAodG9wKSAtPlxuICAgIGlmIHRvcD9cbiAgICAgIEBlbGVtZW50LnNjcm9sbFRvcCA9IHRvcFxuICAgIGVsc2VcbiAgICAgIEBlbGVtZW50LnNjcm9sbFRvcFxuXG4gIHNjcm9sbEJvdHRvbTogKGJvdHRvbSkgLT5cbiAgICBpZiBib3R0b20/XG4gICAgICBAZWxlbWVudC5zY3JvbGxUb3AgPSBib3R0b20gLSBAZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgICBlbHNlXG4gICAgICBAZWxlbWVudC5zY3JvbGxUb3AgKyBAZWxlbWVudC5vZmZzZXRIZWlnaHRcblxuICBzY3JvbGxUb0VudHJ5OiAoZW50cnksIGNlbnRlcj10cnVlKSAtPlxuICAgIGVsZW1lbnQgPSBpZiBlbnRyeT8uY2xhc3NMaXN0LmNvbnRhaW5zKCdkaXJlY3RvcnknKSB0aGVuIGVudHJ5LmhlYWRlciBlbHNlIGVudHJ5XG4gICAgZWxlbWVudD8uc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZChjZW50ZXIpXG5cbiAgc2Nyb2xsVG9Cb3R0b206IC0+XG4gICAgaWYgbGFzdEVudHJ5ID0gXy5sYXN0KEBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5lbnRyeScpKVxuICAgICAgQHNlbGVjdEVudHJ5KGxhc3RFbnRyeSlcbiAgICAgIEBzY3JvbGxUb0VudHJ5KGxhc3RFbnRyeSlcblxuICBzY3JvbGxUb1RvcDogLT5cbiAgICBAc2VsZWN0RW50cnkoQHJvb3RzWzBdKSBpZiBAcm9vdHNbMF0/XG4gICAgQGVsZW1lbnQuc2Nyb2xsVG9wID0gMFxuXG4gIHBhZ2VVcDogLT5cbiAgICBAZWxlbWVudC5zY3JvbGxUb3AgLT0gQGVsZW1lbnQub2Zmc2V0SGVpZ2h0XG5cbiAgcGFnZURvd246IC0+XG4gICAgQGVsZW1lbnQuc2Nyb2xsVG9wICs9IEBlbGVtZW50Lm9mZnNldEhlaWdodFxuXG4gICMgQ29waWVzIGFuIGVudHJ5IGZyb20gYGluaXRpYWxQYXRoYCB0byBgbmV3RGlyZWN0b3J5UGF0aGBcbiAgIyBJZiB0aGUgZW50cnkgYWxyZWFkeSBleGlzdHMgaW4gYG5ld0RpcmVjdG9yeVBhdGhgLCBhIG51bWJlciBpcyBhcHBlbmRlZCB0byB0aGUgYmFzZW5hbWVcbiAgY29weUVudHJ5OiAoaW5pdGlhbFBhdGgsIG5ld0RpcmVjdG9yeVBhdGgpIC0+XG4gICAgaW5pdGlhbFBhdGhJc0RpcmVjdG9yeSA9IGZzLmlzRGlyZWN0b3J5U3luYyhpbml0aWFsUGF0aClcblxuICAgICMgRG8gbm90IGFsbG93IGNvcHlpbmcgdGVzdC9hLyBpbnRvIHRlc3QvYS9iL1xuICAgICMgTm90ZTogQSB0cmFpbGluZyBwYXRoLnNlcCBpcyBhZGRlZCB0byBwcmV2ZW50IGZhbHNlIHBvc2l0aXZlcywgc3VjaCBhcyB0ZXN0L2EgLT4gdGVzdC9hYlxuICAgIHJlYWxOZXdEaXJlY3RvcnlQYXRoID0gZnMucmVhbHBhdGhTeW5jKG5ld0RpcmVjdG9yeVBhdGgpICsgcGF0aC5zZXBcbiAgICByZWFsSW5pdGlhbFBhdGggPSBmcy5yZWFscGF0aFN5bmMoaW5pdGlhbFBhdGgpICsgcGF0aC5zZXBcbiAgICBpZiBpbml0aWFsUGF0aElzRGlyZWN0b3J5IGFuZCByZWFsTmV3RGlyZWN0b3J5UGF0aC5zdGFydHNXaXRoKHJlYWxJbml0aWFsUGF0aClcbiAgICAgIHVubGVzcyBmcy5pc1N5bWJvbGljTGlua1N5bmMoaW5pdGlhbFBhdGgpXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdDYW5ub3QgY29weSBhIGZvbGRlciBpbnRvIGl0c2VsZicpXG4gICAgICAgIHJldHVyblxuXG4gICAgbmV3UGF0aCA9IHBhdGguam9pbihuZXdEaXJlY3RvcnlQYXRoLCBwYXRoLmJhc2VuYW1lKGluaXRpYWxQYXRoKSlcblxuICAgICMgYXBwZW5kIGEgbnVtYmVyIHRvIHRoZSBmaWxlIGlmIGFuIGl0ZW0gd2l0aCB0aGUgc2FtZSBuYW1lIGV4aXN0c1xuICAgIGZpbGVDb3VudGVyID0gMFxuICAgIG9yaWdpbmFsTmV3UGF0aCA9IG5ld1BhdGhcbiAgICB3aGlsZSBmcy5leGlzdHNTeW5jKG5ld1BhdGgpXG4gICAgICBpZiBpbml0aWFsUGF0aElzRGlyZWN0b3J5XG4gICAgICAgIG5ld1BhdGggPSBcIiN7b3JpZ2luYWxOZXdQYXRofSN7ZmlsZUNvdW50ZXJ9XCJcbiAgICAgIGVsc2VcbiAgICAgICAgZXh0ZW5zaW9uID0gZ2V0RnVsbEV4dGVuc2lvbihvcmlnaW5hbE5ld1BhdGgpXG4gICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKHBhdGguZGlybmFtZShvcmlnaW5hbE5ld1BhdGgpLCBwYXRoLmJhc2VuYW1lKG9yaWdpbmFsTmV3UGF0aCwgZXh0ZW5zaW9uKSlcbiAgICAgICAgbmV3UGF0aCA9IFwiI3tmaWxlUGF0aH0je2ZpbGVDb3VudGVyfSN7ZXh0ZW5zaW9ufVwiXG4gICAgICBmaWxlQ291bnRlciArPSAxXG5cbiAgICB0cnlcbiAgICAgIEBlbWl0dGVyLmVtaXQgJ3dpbGwtY29weS1lbnRyeScsIHtpbml0aWFsUGF0aCwgbmV3UGF0aH1cbiAgICAgIGlmIGluaXRpYWxQYXRoSXNEaXJlY3RvcnlcbiAgICAgICAgIyB1c2UgZnMuY29weSB0byBjb3B5IGRpcmVjdG9yaWVzIHNpbmNlIHJlYWQvd3JpdGUgd2lsbCBmYWlsIGZvciBkaXJlY3Rvcmllc1xuICAgICAgICBmcy5jb3B5U3luYyhpbml0aWFsUGF0aCwgbmV3UGF0aClcbiAgICAgIGVsc2VcbiAgICAgICAgIyByZWFkIHRoZSBvbGQgZmlsZSBhbmQgd3JpdGUgYSBuZXcgb25lIGF0IHRhcmdldCBsb2NhdGlvblxuICAgICAgICAjIFRPRE86IFJlcGxhY2Ugd2l0aCBmcy5jb3B5RmlsZVN5bmNcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhuZXdQYXRoLCBmcy5yZWFkRmlsZVN5bmMoaW5pdGlhbFBhdGgpKVxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZW50cnktY29waWVkJywge2luaXRpYWxQYXRoLCBuZXdQYXRofVxuXG4gICAgICBpZiByZXBvID0gcmVwb0ZvclBhdGgobmV3UGF0aClcbiAgICAgICAgcmVwby5nZXRQYXRoU3RhdHVzKGluaXRpYWxQYXRoKVxuICAgICAgICByZXBvLmdldFBhdGhTdGF0dXMobmV3UGF0aClcblxuICAgIGNhdGNoIGVycm9yXG4gICAgICBAZW1pdHRlci5lbWl0ICdjb3B5LWVudHJ5LWZhaWxlZCcsIHtpbml0aWFsUGF0aCwgbmV3UGF0aH1cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiRmFpbGVkIHRvIGNvcHkgZW50cnkgI3tpbml0aWFsUGF0aH0gdG8gI3tuZXdEaXJlY3RvcnlQYXRofVwiLCBkZXRhaWw6IGVycm9yLm1lc3NhZ2UpXG5cbiAgIyBNb3ZlcyBhbiBlbnRyeSBmcm9tIGBpbml0aWFsUGF0aGAgdG8gYG5ld0RpcmVjdG9yeVBhdGhgXG4gIG1vdmVFbnRyeTogKGluaXRpYWxQYXRoLCBuZXdEaXJlY3RvcnlQYXRoKSAtPlxuICAgICMgRG8gbm90IGFsbG93IG1vdmluZyB0ZXN0L2EvIGludG8gdGVzdC9hL2IvXG4gICAgIyBOb3RlOiBBIHRyYWlsaW5nIHBhdGguc2VwIGlzIGFkZGVkIHRvIHByZXZlbnQgZmFsc2UgcG9zaXRpdmVzLCBzdWNoIGFzIHRlc3QvYSAtPiB0ZXN0L2FiXG4gICAgdHJ5XG4gICAgICByZWFsTmV3RGlyZWN0b3J5UGF0aCA9IGZzLnJlYWxwYXRoU3luYyhuZXdEaXJlY3RvcnlQYXRoKSArIHBhdGguc2VwXG4gICAgICByZWFsSW5pdGlhbFBhdGggPSBmcy5yZWFscGF0aFN5bmMoaW5pdGlhbFBhdGgpICsgcGF0aC5zZXBcbiAgICAgIGlmIGZzLmlzRGlyZWN0b3J5U3luYyhpbml0aWFsUGF0aCkgYW5kIHJlYWxOZXdEaXJlY3RvcnlQYXRoLnN0YXJ0c1dpdGgocmVhbEluaXRpYWxQYXRoKVxuICAgICAgICB1bmxlc3MgZnMuaXNTeW1ib2xpY0xpbmtTeW5jKGluaXRpYWxQYXRoKVxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdDYW5ub3QgbW92ZSBhIGZvbGRlciBpbnRvIGl0c2VsZicpXG4gICAgICAgICAgcmV0dXJuXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiRmFpbGVkIHRvIG1vdmUgZW50cnkgI3tpbml0aWFsUGF0aH0gdG8gI3tuZXdEaXJlY3RvcnlQYXRofVwiLCBkZXRhaWw6IGVycm9yLm1lc3NhZ2UpXG5cbiAgICBuZXdQYXRoID0gcGF0aC5qb2luKG5ld0RpcmVjdG9yeVBhdGgsIHBhdGguYmFzZW5hbWUoaW5pdGlhbFBhdGgpKVxuXG4gICAgdHJ5XG4gICAgICBAZW1pdHRlci5lbWl0ICd3aWxsLW1vdmUtZW50cnknLCB7aW5pdGlhbFBhdGgsIG5ld1BhdGh9XG4gICAgICBmcy5tb3ZlU3luYyhpbml0aWFsUGF0aCwgbmV3UGF0aClcbiAgICAgIEBlbWl0dGVyLmVtaXQgJ2VudHJ5LW1vdmVkJywge2luaXRpYWxQYXRoLCBuZXdQYXRofVxuXG4gICAgICBpZiByZXBvID0gcmVwb0ZvclBhdGgobmV3UGF0aClcbiAgICAgICAgcmVwby5nZXRQYXRoU3RhdHVzKGluaXRpYWxQYXRoKVxuICAgICAgICByZXBvLmdldFBhdGhTdGF0dXMobmV3UGF0aClcblxuICAgIGNhdGNoIGVycm9yXG4gICAgICBpZiBlcnJvci5jb2RlIGlzICdFRVhJU1QnXG4gICAgICAgIHJldHVybiBAbW92ZUNvbmZsaWN0aW5nRW50cnkoaW5pdGlhbFBhdGgsIG5ld1BhdGgsIG5ld0RpcmVjdG9yeVBhdGgpXG4gICAgICBlbHNlXG4gICAgICAgIEBlbWl0dGVyLmVtaXQgJ21vdmUtZW50cnktZmFpbGVkJywge2luaXRpYWxQYXRoLCBuZXdQYXRofVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIkZhaWxlZCB0byBtb3ZlIGVudHJ5ICN7aW5pdGlhbFBhdGh9IHRvICN7bmV3RGlyZWN0b3J5UGF0aH1cIiwgZGV0YWlsOiBlcnJvci5tZXNzYWdlKVxuXG4gICAgcmV0dXJuIHRydWVcblxuICBtb3ZlQ29uZmxpY3RpbmdFbnRyeTogKGluaXRpYWxQYXRoLCBuZXdQYXRoLCBuZXdEaXJlY3RvcnlQYXRoKSA9PlxuICAgIHRyeVxuICAgICAgdW5sZXNzIGZzLmlzRGlyZWN0b3J5U3luYyhpbml0aWFsUGF0aClcbiAgICAgICAgIyBGaWxlcywgc3ltbGlua3MsIGFueXRoaW5nIGJ1dCBhIGRpcmVjdG9yeVxuICAgICAgICBjaG9zZW4gPSBhdG9tLmNvbmZpcm1cbiAgICAgICAgICBtZXNzYWdlOiBcIicje3BhdGgucmVsYXRpdmUobmV3RGlyZWN0b3J5UGF0aCwgbmV3UGF0aCl9JyBhbHJlYWR5IGV4aXN0c1wiXG4gICAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiAnRG8geW91IHdhbnQgdG8gcmVwbGFjZSBpdD8nXG4gICAgICAgICAgYnV0dG9uczogWydSZXBsYWNlIGZpbGUnLCAnU2tpcCcsICdDYW5jZWwnXVxuXG4gICAgICAgIHN3aXRjaCBjaG9zZW5cbiAgICAgICAgICB3aGVuIDAgIyBSZXBsYWNlXG4gICAgICAgICAgICBmcy5yZW5hbWVTeW5jKGluaXRpYWxQYXRoLCBuZXdQYXRoKVxuICAgICAgICAgICAgQGVtaXR0ZXIuZW1pdCAnZW50cnktbW92ZWQnLCB7aW5pdGlhbFBhdGgsIG5ld1BhdGh9XG5cbiAgICAgICAgICAgIGlmIHJlcG8gPSByZXBvRm9yUGF0aChuZXdQYXRoKVxuICAgICAgICAgICAgICByZXBvLmdldFBhdGhTdGF0dXMoaW5pdGlhbFBhdGgpXG4gICAgICAgICAgICAgIHJlcG8uZ2V0UGF0aFN0YXR1cyhuZXdQYXRoKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB3aGVuIDIgIyBDYW5jZWxcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgZWxzZVxuICAgICAgICBlbnRyaWVzID0gZnMucmVhZGRpclN5bmMoaW5pdGlhbFBhdGgpXG4gICAgICAgIGZvciBlbnRyeSBpbiBlbnRyaWVzXG4gICAgICAgICAgaWYgZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4obmV3UGF0aCwgZW50cnkpKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyBAbW92ZUNvbmZsaWN0aW5nRW50cnkocGF0aC5qb2luKGluaXRpYWxQYXRoLCBlbnRyeSksIHBhdGguam9pbihuZXdQYXRoLCBlbnRyeSksIG5ld0RpcmVjdG9yeVBhdGgpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG1vdmVFbnRyeShwYXRoLmpvaW4oaW5pdGlhbFBhdGgsIGVudHJ5KSwgbmV3UGF0aClcblxuICAgICAgICAjIFwiTW92ZVwiIHRoZSBjb250YWluaW5nIGZvbGRlciBieSBkZWxldGluZyBpdCwgc2luY2Ugd2UndmUgYWxyZWFkeSBtb3ZlZCBldmVyeXRoaW5nIGluIGl0XG4gICAgICAgIGZzLnJtZGlyU3luYyhpbml0aWFsUGF0aCkgdW5sZXNzIGZzLnJlYWRkaXJTeW5jKGluaXRpYWxQYXRoKS5sZW5ndGhcbiAgICBjYXRjaCBlcnJvclxuICAgICAgQGVtaXR0ZXIuZW1pdCAnbW92ZS1lbnRyeS1mYWlsZWQnLCB7aW5pdGlhbFBhdGgsIG5ld1BhdGh9XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIkZhaWxlZCB0byBtb3ZlIGVudHJ5ICN7aW5pdGlhbFBhdGh9IHRvICN7bmV3UGF0aH1cIiwgZGV0YWlsOiBlcnJvci5tZXNzYWdlKVxuXG4gICAgcmV0dXJuIHRydWVcblxuICBvblN0eWxlc2hlZXRzQ2hhbmdlZDogPT5cbiAgICAjIElmIHZpc2libGUsIGZvcmNlIGEgcmVkcmF3IHNvIHRoZSBzY3JvbGxiYXJzIGFyZSBzdHlsZWQgY29ycmVjdGx5IGJhc2VkIG9uXG4gICAgIyB0aGUgdGhlbWVcbiAgICByZXR1cm4gdW5sZXNzIEBpc1Zpc2libGUoKVxuICAgIEBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICBAZWxlbWVudC5vZmZzZXRXaWR0aFxuICAgIEBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJ1xuXG4gIG9uTW91c2VEb3duOiAoZSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIGVudHJ5VG9TZWxlY3QgPSBlLnRhcmdldC5jbG9zZXN0KCcuZW50cnknKVxuXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgIyBUT0RPOiBtZXRhK2NsaWNrIGFuZCBjdHJsK2NsaWNrIHNob3VsZCBub3QgZG8gdGhlIHNhbWUgdGhpbmcgb24gV2luZG93cy5cbiAgICAjICAgICAgIFJpZ2h0IG5vdyByZW1vdmluZyBtZXRhS2V5IGlmIHBsYXRmb3JtIGlzIG5vdCBkYXJ3aW4gYnJlYWtzIHRlc3RzXG4gICAgIyAgICAgICB0aGF0IHNldCB0aGUgbWV0YUtleSB0byB0cnVlIHdoZW4gc2ltdWxhdGluZyBhIGNtZCtjbGljayBvbiBtYWNvc1xuICAgICMgICAgICAgYW5kIGN0cmwrY2xpY2sgb24gd2luZG93cyBhbmQgbGludXguXG4gICAgY21kS2V5ID0gZS5tZXRhS2V5IG9yIChlLmN0cmxLZXkgYW5kIHByb2Nlc3MucGxhdGZvcm0gaXNudCAnZGFyd2luJylcblxuICAgICMgcmV0dXJuIGVhcmx5IGlmIGNsaWNraW5nIG9uIGEgc2VsZWN0ZWQgZW50cnlcbiAgICBpZiBlbnRyeVRvU2VsZWN0LmNsYXNzTGlzdC5jb250YWlucygnc2VsZWN0ZWQnKVxuICAgICAgIyBtb3VzZSByaWdodCBjbGljayBvciBjdHJsIGNsaWNrIGFzIHJpZ2h0IGNsaWNrIG9uIGRhcndpbiBwbGF0Zm9ybXNcbiAgICAgIGlmIGUuYnV0dG9uIGlzIDIgb3IgKGUuY3RybEtleSBhbmQgcHJvY2Vzcy5wbGF0Zm9ybSBpcyAnZGFyd2luJylcbiAgICAgICAgcmV0dXJuXG4gICAgICBlbHNlXG4gICAgICAgICMgYWxsb3cgY2xpY2sgb24gbW91c2V1cCBpZiBub3QgZHJhZ2dpbmdcbiAgICAgICAge3NoaWZ0S2V5fSA9IGVcbiAgICAgICAgQHNlbGVjdE9uTW91c2VVcCA9IHtzaGlmdEtleSwgY21kS2V5fVxuICAgICAgICByZXR1cm5cblxuICAgIGlmIGUuc2hpZnRLZXkgYW5kIGNtZEtleVxuICAgICAgIyBzZWxlY3QgY29udGludW91cyBmcm9tIEBsYXN0Rm9jdXNlZEVudHJ5IGJ1dCBsZWF2ZSBvdGhlcnNcbiAgICAgIEBzZWxlY3RDb250aW51b3VzRW50cmllcyhlbnRyeVRvU2VsZWN0LCBmYWxzZSlcbiAgICAgIEBzaG93TXVsdGlTZWxlY3RNZW51SWZOZWNlc3NhcnkoKVxuICAgIGVsc2UgaWYgZS5zaGlmdEtleVxuICAgICAgIyBzZWxlY3QgY29udGludW91cyBmcm9tIEBsYXN0Rm9jdXNlZEVudHJ5IGFuZCBkZXNlbGVjdCByZXN0XG4gICAgICBAc2VsZWN0Q29udGludW91c0VudHJpZXMoZW50cnlUb1NlbGVjdClcbiAgICAgIEBzaG93TXVsdGlTZWxlY3RNZW51SWZOZWNlc3NhcnkoKVxuICAgICMgb25seSBhbGxvdyBjdHJsIGNsaWNrIGZvciBtdWx0aSBzZWxlY3Rpb24gb24gbm9uIGRhcndpbiBzeXN0ZW1zXG4gICAgZWxzZSBpZiBjbWRLZXlcbiAgICAgIEBzZWxlY3RNdWx0aXBsZUVudHJpZXMoZW50cnlUb1NlbGVjdClcbiAgICAgIEBsYXN0Rm9jdXNlZEVudHJ5ID0gZW50cnlUb1NlbGVjdFxuICAgICAgQHNob3dNdWx0aVNlbGVjdE1lbnVJZk5lY2Vzc2FyeSgpXG4gICAgZWxzZVxuICAgICAgQHNlbGVjdEVudHJ5KGVudHJ5VG9TZWxlY3QpXG4gICAgICBAc2hvd0Z1bGxNZW51KClcblxuICBvbk1vdXNlVXA6IChlKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQHNlbGVjdE9uTW91c2VVcD9cblxuICAgIHtzaGlmdEtleSwgY21kS2V5fSA9IEBzZWxlY3RPbk1vdXNlVXBcbiAgICBAc2VsZWN0T25Nb3VzZVVwID0gbnVsbFxuXG4gICAgcmV0dXJuIHVubGVzcyBlbnRyeVRvU2VsZWN0ID0gZS50YXJnZXQuY2xvc2VzdCgnLmVudHJ5JylcblxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIGlmIHNoaWZ0S2V5IGFuZCBjbWRLZXlcbiAgICAgICMgc2VsZWN0IGNvbnRpbnVvdXMgZnJvbSBAbGFzdEZvY3VzZWRFbnRyeSBidXQgbGVhdmUgb3RoZXJzXG4gICAgICBAc2VsZWN0Q29udGludW91c0VudHJpZXMoZW50cnlUb1NlbGVjdCwgZmFsc2UpXG4gICAgICBAc2hvd011bHRpU2VsZWN0TWVudUlmTmVjZXNzYXJ5KClcbiAgICBlbHNlIGlmIHNoaWZ0S2V5XG4gICAgICAjIHNlbGVjdCBjb250aW51b3VzIGZyb20gQGxhc3RGb2N1c2VkRW50cnkgYW5kIGRlc2VsZWN0IHJlc3RcbiAgICAgIEBzZWxlY3RDb250aW51b3VzRW50cmllcyhlbnRyeVRvU2VsZWN0KVxuICAgICAgQHNob3dNdWx0aVNlbGVjdE1lbnVJZk5lY2Vzc2FyeSgpXG4gICAgIyBvbmx5IGFsbG93IGN0cmwgY2xpY2sgZm9yIG11bHRpIHNlbGVjdGlvbiBvbiBub24gZGFyd2luIHN5c3RlbXNcbiAgICBlbHNlIGlmIGNtZEtleVxuICAgICAgQGRlc2VsZWN0KFtlbnRyeVRvU2VsZWN0XSlcbiAgICAgIEBsYXN0Rm9jdXNlZEVudHJ5ID0gZW50cnlUb1NlbGVjdFxuICAgICAgQHNob3dNdWx0aVNlbGVjdE1lbnVJZk5lY2Vzc2FyeSgpXG4gICAgZWxzZVxuICAgICAgQHNlbGVjdEVudHJ5KGVudHJ5VG9TZWxlY3QpXG4gICAgICBAc2hvd0Z1bGxNZW51KClcblxuICAjIFB1YmxpYzogUmV0dXJuIGFuIGFycmF5IG9mIHBhdGhzIGZyb20gYWxsIHNlbGVjdGVkIGl0ZW1zXG4gICNcbiAgIyBFeGFtcGxlOiBAc2VsZWN0ZWRQYXRocygpXG4gICMgPT4gWydzZWxlY3RlZC9wYXRoL29uZScsICdzZWxlY3RlZC9wYXRoL3R3bycsICdzZWxlY3RlZC9wYXRoL3RocmVlJ11cbiAgIyBSZXR1cm5zIEFycmF5IG9mIHNlbGVjdGVkIGl0ZW0gcGF0aHNcbiAgc2VsZWN0ZWRQYXRoczogLT5cbiAgICBlbnRyeS5nZXRQYXRoKCkgZm9yIGVudHJ5IGluIEBnZXRTZWxlY3RlZEVudHJpZXMoKVxuXG4gICMgUHVibGljOiBTZWxlY3RzIGl0ZW1zIHdpdGhpbiBhIHJhbmdlIGRlZmluZWQgYnkgYSBjdXJyZW50bHkgc2VsZWN0ZWQgZW50cnkgYW5kXG4gICMgICAgICAgICBhIG5ldyBnaXZlbiBlbnRyeS4gVGhpcyBpcyBzaGlmdCtjbGljayBmdW5jdGlvbmFsaXR5XG4gICNcbiAgIyBSZXR1cm5zIGFycmF5IG9mIHNlbGVjdGVkIGVsZW1lbnRzXG4gIHNlbGVjdENvbnRpbnVvdXNFbnRyaWVzOiAoZW50cnksIGRlc2VsZWN0T3RoZXJzID0gdHJ1ZSkgLT5cbiAgICBjdXJyZW50U2VsZWN0ZWRFbnRyeSA9IEBsYXN0Rm9jdXNlZEVudHJ5ID8gQHNlbGVjdGVkRW50cnkoKVxuICAgIHBhcmVudENvbnRhaW5lciA9IGVudHJ5LnBhcmVudEVsZW1lbnRcbiAgICBlbGVtZW50cyA9IFtdXG4gICAgaWYgcGFyZW50Q29udGFpbmVyIGlzIGN1cnJlbnRTZWxlY3RlZEVudHJ5LnBhcmVudEVsZW1lbnRcbiAgICAgIGVudHJpZXMgPSBBcnJheS5mcm9tKHBhcmVudENvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuZW50cnknKSlcbiAgICAgIGVudHJ5SW5kZXggPSBlbnRyaWVzLmluZGV4T2YoZW50cnkpXG4gICAgICBzZWxlY3RlZEluZGV4ID0gZW50cmllcy5pbmRleE9mKGN1cnJlbnRTZWxlY3RlZEVudHJ5KVxuICAgICAgZWxlbWVudHMgPSAoZW50cmllc1tpXSBmb3IgaSBpbiBbZW50cnlJbmRleC4uc2VsZWN0ZWRJbmRleF0pXG5cbiAgICAgIEBkZXNlbGVjdCgpIGlmIGRlc2VsZWN0T3RoZXJzXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJykgZm9yIGVsZW1lbnQgaW4gZWxlbWVudHNcblxuICAgIGVsZW1lbnRzXG5cbiAgIyBQdWJsaWM6IFNlbGVjdHMgY29uc2VjdXRpdmUgZ2l2ZW4gZW50cmllcyB3aXRob3V0IGNsZWFyaW5nIHByZXZpb3VzbHkgc2VsZWN0ZWRcbiAgIyAgICAgICAgIGl0ZW1zLiBUaGlzIGlzIGNtZCtjbGljayBmdW5jdGlvbmFsaXR5XG4gICNcbiAgIyBSZXR1cm5zIGdpdmVuIGVudHJ5XG4gIHNlbGVjdE11bHRpcGxlRW50cmllczogKGVudHJ5KSAtPlxuICAgIGVudHJ5Py5jbGFzc0xpc3QudG9nZ2xlKCdzZWxlY3RlZCcpXG4gICAgZW50cnlcblxuICAjIFB1YmxpYzogVG9nZ2xlIGZ1bGwtbWVudSBjbGFzcyBvbiB0aGUgbWFpbiBsaXN0IGVsZW1lbnQgdG8gZGlzcGxheSB0aGUgZnVsbCBjb250ZXh0XG4gICMgICAgICAgICBtZW51LlxuICBzaG93RnVsbE1lbnU6IC0+XG4gICAgQGxpc3QuY2xhc3NMaXN0LnJlbW92ZSgnbXVsdGktc2VsZWN0JylcbiAgICBAbGlzdC5jbGFzc0xpc3QuYWRkKCdmdWxsLW1lbnUnKVxuXG4gICMgUHVibGljOiBUb2dnbGUgbXVsdGktc2VsZWN0IGNsYXNzIG9uIHRoZSBtYWluIGxpc3QgZWxlbWVudCB0byBkaXNwbGF5IHRoZVxuICAjICAgICAgICAgbWVudSB3aXRoIG9ubHkgaXRlbXMgdGhhdCBtYWtlIHNlbnNlIGZvciBtdWx0aSBzZWxlY3QgZnVuY3Rpb25hbGl0eVxuICBzaG93TXVsdGlTZWxlY3RNZW51OiAtPlxuICAgIEBsaXN0LmNsYXNzTGlzdC5yZW1vdmUoJ2Z1bGwtbWVudScpXG4gICAgQGxpc3QuY2xhc3NMaXN0LmFkZCgnbXVsdGktc2VsZWN0JylcblxuICBzaG93TXVsdGlTZWxlY3RNZW51SWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQGdldFNlbGVjdGVkRW50cmllcygpLmxlbmd0aCA+IDFcbiAgICAgIEBzaG93TXVsdGlTZWxlY3RNZW51KClcbiAgICBlbHNlXG4gICAgICBAc2hvd0Z1bGxNZW51KClcblxuICAjIFB1YmxpYzogQ2hlY2sgZm9yIG11bHRpLXNlbGVjdCBjbGFzcyBvbiB0aGUgbWFpbiBsaXN0XG4gICNcbiAgIyBSZXR1cm5zIGJvb2xlYW5cbiAgbXVsdGlTZWxlY3RFbmFibGVkOiAtPlxuICAgIEBsaXN0LmNsYXNzTGlzdC5jb250YWlucygnbXVsdGktc2VsZWN0JylcblxuICBvbkRyYWdFbnRlcjogKGUpID0+XG4gICAgaWYgZW50cnkgPSBlLnRhcmdldC5jbG9zZXN0KCcuZW50cnkuZGlyZWN0b3J5JylcbiAgICAgIHJldHVybiBpZiBAcm9vdERyYWdBbmREcm9wLmlzRHJhZ2dpbmcoZSlcbiAgICAgIHJldHVybiB1bmxlc3MgQGlzQXRvbVRyZWVWaWV3RXZlbnQoZSlcblxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICBAZHJhZ0V2ZW50Q291bnRzLnNldChlbnRyeSwgMCkgdW5sZXNzIEBkcmFnRXZlbnRDb3VudHMuZ2V0KGVudHJ5KVxuICAgICAgdW5sZXNzIEBkcmFnRXZlbnRDb3VudHMuZ2V0KGVudHJ5KSBpc250IDAgb3IgZW50cnkuY2xhc3NMaXN0LmNvbnRhaW5zKCdzZWxlY3RlZCcpXG4gICAgICAgIGVudHJ5LmNsYXNzTGlzdC5hZGQoJ2RyYWctb3ZlcicsICdzZWxlY3RlZCcpXG5cbiAgICAgIEBkcmFnRXZlbnRDb3VudHMuc2V0KGVudHJ5LCBAZHJhZ0V2ZW50Q291bnRzLmdldChlbnRyeSkgKyAxKVxuXG4gIG9uRHJhZ0xlYXZlOiAoZSkgPT5cbiAgICBpZiBlbnRyeSA9IGUudGFyZ2V0LmNsb3Nlc3QoJy5lbnRyeS5kaXJlY3RvcnknKVxuICAgICAgcmV0dXJuIGlmIEByb290RHJhZ0FuZERyb3AuaXNEcmFnZ2luZyhlKVxuICAgICAgcmV0dXJuIHVubGVzcyBAaXNBdG9tVHJlZVZpZXdFdmVudChlKVxuXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIEBkcmFnRXZlbnRDb3VudHMuc2V0KGVudHJ5LCBAZHJhZ0V2ZW50Q291bnRzLmdldChlbnRyeSkgLSAxKVxuICAgICAgaWYgQGRyYWdFdmVudENvdW50cy5nZXQoZW50cnkpIGlzIDAgYW5kIGVudHJ5LmNsYXNzTGlzdC5jb250YWlucygnZHJhZy1vdmVyJylcbiAgICAgICAgZW50cnkuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZy1vdmVyJywgJ3NlbGVjdGVkJylcblxuICAjIEhhbmRsZSBlbnRyeSBuYW1lIG9iamVjdCBkcmFnc3RhcnQgZXZlbnRcbiAgb25EcmFnU3RhcnQ6IChlKSAtPlxuICAgIEBkcmFnRXZlbnRDb3VudHMgPSBuZXcgV2Vha01hcFxuICAgIEBzZWxlY3RPbk1vdXNlVXAgPSBudWxsXG4gICAgaWYgZW50cnkgPSBlLnRhcmdldC5jbG9zZXN0KCcuZW50cnknKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICBpZiBAcm9vdERyYWdBbmREcm9wLmNhbkRyYWdTdGFydChlKVxuICAgICAgICByZXR1cm4gQHJvb3REcmFnQW5kRHJvcC5vbkRyYWdTdGFydChlKVxuXG4gICAgICBkcmFnSW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib2xcIilcbiAgICAgIGRyYWdJbWFnZS5jbGFzc0xpc3QuYWRkKFwiZW50cmllc1wiLCBcImxpc3QtdHJlZVwiKVxuICAgICAgZHJhZ0ltYWdlLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiXG4gICAgICBkcmFnSW1hZ2Uuc3R5bGUudG9wID0gMFxuICAgICAgZHJhZ0ltYWdlLnN0eWxlLmxlZnQgPSAwXG4gICAgICAjIEVuc3VyZSB0aGUgY2xvbmVkIGZpbGUgbmFtZSBlbGVtZW50IGlzIHJlbmRlcmVkIG9uIGEgc2VwYXJhdGUgR1BVIGxheWVyXG4gICAgICAjIHRvIHByZXZlbnQgb3ZlcmxhcHBpbmcgZWxlbWVudHMgbG9jYXRlZCBhdCAoMHB4LCAwcHgpIGZyb20gYmVpbmcgdXNlZCBhc1xuICAgICAgIyB0aGUgZHJhZyBpbWFnZS5cbiAgICAgIGRyYWdJbWFnZS5zdHlsZS53aWxsQ2hhbmdlID0gXCJ0cmFuc2Zvcm1cIlxuXG4gICAgICBpbml0aWFsUGF0aHMgPSBbXVxuICAgICAgZm9yIHRhcmdldCBpbiBAZ2V0U2VsZWN0ZWRFbnRyaWVzKClcbiAgICAgICAgZW50cnlQYXRoID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIubmFtZVwiKS5kYXRhc2V0LnBhdGhcbiAgICAgICAgcGFyZW50U2VsZWN0ZWQgPSB0YXJnZXQucGFyZW50Tm9kZS5jbG9zZXN0KFwiLmVudHJ5LnNlbGVjdGVkXCIpXG4gICAgICAgIHVubGVzcyBwYXJlbnRTZWxlY3RlZFxuICAgICAgICAgIGluaXRpYWxQYXRocy5wdXNoKGVudHJ5UGF0aClcbiAgICAgICAgICBuZXdFbGVtZW50ID0gdGFyZ2V0LmNsb25lTm9kZSh0cnVlKVxuICAgICAgICAgIGlmIG5ld0VsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZGlyZWN0b3J5XCIpXG4gICAgICAgICAgICBuZXdFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZW50cmllc1wiKS5yZW1vdmUoKVxuICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIGdldFN0eWxlT2JqZWN0KHRhcmdldClcbiAgICAgICAgICAgIG5ld0VsZW1lbnQuc3R5bGVba2V5XSA9IHZhbHVlXG4gICAgICAgICAgbmV3RWxlbWVudC5zdHlsZS5wYWRkaW5nTGVmdCA9IFwiMWVtXCJcbiAgICAgICAgICBuZXdFbGVtZW50LnN0eWxlLnBhZGRpbmdSaWdodCA9IFwiMWVtXCJcbiAgICAgICAgICBkcmFnSW1hZ2UuYXBwZW5kKG5ld0VsZW1lbnQpXG5cbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZHJhZ0ltYWdlKVxuXG4gICAgICBlLmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gXCJtb3ZlXCJcbiAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERyYWdJbWFnZShkcmFnSW1hZ2UsIDAsIDApXG4gICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKFwiaW5pdGlhbFBhdGhzXCIsIEpTT04uc3RyaW5naWZ5KGluaXRpYWxQYXRocykpXG4gICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKFwiYXRvbS10cmVlLXZpZXctZXZlbnRcIiwgXCJ0cnVlXCIpXG5cbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgLT5cbiAgICAgICAgZHJhZ0ltYWdlLnJlbW92ZSgpXG5cbiAgIyBIYW5kbGUgZW50cnkgZHJhZ292ZXIgZXZlbnQ7IHJlc2V0IGRlZmF1bHQgZHJhZ292ZXIgYWN0aW9uc1xuICBvbkRyYWdPdmVyOiAoZSkgLT5cbiAgICBpZiBlbnRyeSA9IGUudGFyZ2V0LmNsb3Nlc3QoJy5lbnRyeS5kaXJlY3RvcnknKVxuICAgICAgcmV0dXJuIGlmIEByb290RHJhZ0FuZERyb3AuaXNEcmFnZ2luZyhlKVxuICAgICAgcmV0dXJuIHVubGVzcyBAaXNBdG9tVHJlZVZpZXdFdmVudChlKVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgaWYgQGRyYWdFdmVudENvdW50cy5nZXQoZW50cnkpID4gMCBhbmQgbm90IGVudHJ5LmNsYXNzTGlzdC5jb250YWlucygnc2VsZWN0ZWQnKVxuICAgICAgICBlbnRyeS5jbGFzc0xpc3QuYWRkKCdkcmFnLW92ZXInLCAnc2VsZWN0ZWQnKVxuXG4gICMgSGFuZGxlIGVudHJ5IGRyb3AgZXZlbnRcbiAgb25Ecm9wOiAoZSkgLT5cbiAgICBAZHJhZ0V2ZW50Q291bnRzID0gbmV3IFdlYWtNYXBcbiAgICBpZiBlbnRyeSA9IGUudGFyZ2V0LmNsb3Nlc3QoJy5lbnRyeS5kaXJlY3RvcnknKVxuICAgICAgcmV0dXJuIGlmIEByb290RHJhZ0FuZERyb3AuaXNEcmFnZ2luZyhlKVxuICAgICAgcmV0dXJuIHVubGVzcyBAaXNBdG9tVHJlZVZpZXdFdmVudChlKVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgbmV3RGlyZWN0b3J5UGF0aCA9IGVudHJ5LnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJyk/LmRhdGFzZXQucGF0aFxuICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyBuZXdEaXJlY3RvcnlQYXRoXG5cbiAgICAgIGluaXRpYWxQYXRocyA9IGUuZGF0YVRyYW5zZmVyLmdldERhdGEoJ2luaXRpYWxQYXRocycpXG5cbiAgICAgIGlmIGluaXRpYWxQYXRoc1xuICAgICAgICAjIERyb3AgZXZlbnQgZnJvbSBBdG9tXG4gICAgICAgIGluaXRpYWxQYXRocyA9IEpTT04ucGFyc2UoaW5pdGlhbFBhdGhzKVxuICAgICAgICByZXR1cm4gaWYgaW5pdGlhbFBhdGhzLmluY2x1ZGVzKG5ld0RpcmVjdG9yeVBhdGgpXG5cbiAgICAgICAgZW50cnkuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZy1vdmVyJywgJ3NlbGVjdGVkJylcblxuICAgICAgICAjIGl0ZXJhdGUgYmFja3dhcmRzIHNvIGZpbGVzIGluIGEgZGlyIGFyZSBtb3ZlZCBiZWZvcmUgdGhlIGRpciBpdHNlbGZcbiAgICAgICAgZm9yIGluaXRpYWxQYXRoIGluIGluaXRpYWxQYXRocyBieSAtMVxuICAgICAgICAgICMgTm90ZTogdGhpcyBpcyBuZWNlc3Nhcnkgb24gV2luZG93cyB0byBjaXJjdW12ZW50IG5vZGUtcGF0aHdhdGNoZXJcbiAgICAgICAgICAjIGhvbGRpbmcgYSBsb2NrIG9uIGV4cGFuZGVkIGZvbGRlcnMgYW5kIHByZXZlbnRpbmcgdGhlbSBmcm9tXG4gICAgICAgICAgIyBiZWluZyBtb3ZlZCBvciBkZWxldGVkXG4gICAgICAgICAgIyBUT0RPOiBUaGlzIGNhbiBiZSByZW1vdmVkIHdoZW4gdHJlZS12aWV3IGlzIHN3aXRjaGVkIHRvIEBhdG9tL3dhdGNoZXJcbiAgICAgICAgICBAZW50cnlGb3JQYXRoKGluaXRpYWxQYXRoKT8uY29sbGFwc2U/KClcbiAgICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSBpcyAnZGFyd2luJyBhbmQgZS5tZXRhS2V5KSBvciBlLmN0cmxLZXlcbiAgICAgICAgICAgIEBjb3B5RW50cnkoaW5pdGlhbFBhdGgsIG5ld0RpcmVjdG9yeVBhdGgpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWsgdW5sZXNzIEBtb3ZlRW50cnkoaW5pdGlhbFBhdGgsIG5ld0RpcmVjdG9yeVBhdGgpXG4gICAgICBlbHNlXG4gICAgICAgICMgRHJvcCBldmVudCBmcm9tIE9TXG4gICAgICAgIGVudHJ5LmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJylcbiAgICAgICAgZm9yIGZpbGUgaW4gZS5kYXRhVHJhbnNmZXIuZmlsZXNcbiAgICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSBpcyAnZGFyd2luJyBhbmQgZS5tZXRhS2V5KSBvciBlLmN0cmxLZXlcbiAgICAgICAgICAgIEBjb3B5RW50cnkoZmlsZS5wYXRoLCBuZXdEaXJlY3RvcnlQYXRoKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJyZWFrIHVubGVzcyBAbW92ZUVudHJ5KGZpbGUucGF0aCwgbmV3RGlyZWN0b3J5UGF0aClcbiAgICBlbHNlIGlmIGUuZGF0YVRyYW5zZmVyLmZpbGVzLmxlbmd0aFxuICAgICAgIyBEcm9wIGV2ZW50IGZyb20gT1MgdGhhdCBpc24ndCB0YXJnZXRpbmcgYSBmb2xkZXI6IGFkZCBhIG5ldyBwcm9qZWN0IGZvbGRlclxuICAgICAgYXRvbS5wcm9qZWN0LmFkZFBhdGgoZW50cnkucGF0aCkgZm9yIGVudHJ5IGluIGUuZGF0YVRyYW5zZmVyLmZpbGVzXG5cbiAgaXNBdG9tVHJlZVZpZXdFdmVudDogKGUpIC0+XG4gICAgZm9yIGl0ZW0gaW4gZS5kYXRhVHJhbnNmZXIuaXRlbXNcbiAgICAgIGlmIGl0ZW0udHlwZSBpcyAnYXRvbS10cmVlLXZpZXctZXZlbnQnIG9yIGl0ZW0ua2luZCBpcyAnZmlsZSdcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIHJldHVybiBmYWxzZVxuXG4gIGlzVmlzaWJsZTogLT5cbiAgICBAZWxlbWVudC5vZmZzZXRXaWR0aCBpc250IDAgb3IgQGVsZW1lbnQub2Zmc2V0SGVpZ2h0IGlzbnQgMFxuIl19
