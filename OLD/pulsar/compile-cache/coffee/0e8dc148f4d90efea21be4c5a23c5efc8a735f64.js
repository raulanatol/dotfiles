(function() {
  var BufferSearch, CompositeDisposable, Disposable, FindOptions, FindView, History, HistoryCycler, ProjectFindView, ReporterProxy, ResultsModel, ResultsPaneView, SelectNext, TextBuffer, getIconServices, metricsReporter, ref, ref1;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable, TextBuffer = ref.TextBuffer;

  SelectNext = require('./select-next');

  ref1 = require('./history'), History = ref1.History, HistoryCycler = ref1.HistoryCycler;

  FindOptions = require('./find-options');

  BufferSearch = require('./buffer-search');

  getIconServices = require('./get-icon-services');

  FindView = require('./find-view');

  ProjectFindView = require('./project-find-view');

  ResultsModel = require('./project/results-model').ResultsModel;

  ResultsPaneView = require('./project/results-pane');

  ReporterProxy = require('./reporter-proxy');

  metricsReporter = new ReporterProxy();

  module.exports = {
    activate: function(arg) {
      var findHistory, findOptions, handleEditorCancel, pathsHistory, ref2, replaceHistory, selectNextObjectForEditorElement, showPanel, togglePanel;
      ref2 = arg != null ? arg : {}, findOptions = ref2.findOptions, findHistory = ref2.findHistory, replaceHistory = ref2.replaceHistory, pathsHistory = ref2.pathsHistory;
      if (atom.config.get('find-and-replace.openProjectFindResultsInRightPane')) {
        atom.config.set('find-and-replace.projectSearchResultsPaneSplitDirection', 'right');
      }
      atom.config.unset('find-and-replace.openProjectFindResultsInRightPane');
      atom.workspace.addOpener(function(filePath) {
        if (filePath.indexOf(ResultsPaneView.URI) !== -1) {
          return new ResultsPaneView();
        }
      });
      this.subscriptions = new CompositeDisposable;
      this.currentItemSub = new Disposable;
      this.findHistory = new History(findHistory);
      this.replaceHistory = new History(replaceHistory);
      this.pathsHistory = new History(pathsHistory);
      this.findOptions = new FindOptions(findOptions);
      this.findModel = new BufferSearch(this.findOptions);
      this.resultsModel = new ResultsModel(this.findOptions, metricsReporter);
      this.subscriptions.add(atom.workspace.getCenter().observeActivePaneItem((function(_this) {
        return function(paneItem) {
          _this.subscriptions["delete"](_this.currentItemSub);
          _this.currentItemSub.dispose();
          if (atom.workspace.isTextEditor(paneItem)) {
            return _this.findModel.setEditor(paneItem);
          } else if ((paneItem != null ? paneItem.observeEmbeddedTextEditor : void 0) != null) {
            _this.currentItemSub = paneItem.observeEmbeddedTextEditor(function(editor) {
              if (atom.workspace.getCenter().getActivePaneItem() === paneItem) {
                return _this.findModel.setEditor(editor);
              }
            });
            return _this.subscriptions.add(_this.currentItemSub);
          } else if ((paneItem != null ? paneItem.getEmbeddedTextEditor : void 0) != null) {
            return _this.findModel.setEditor(paneItem.getEmbeddedTextEditor());
          } else {
            return _this.findModel.setEditor(null);
          }
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('.find-and-replace, .project-find', 'window:focus-next-pane', function() {
        return atom.views.getView(atom.workspace).focus();
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'project-find:show', (function(_this) {
        return function() {
          _this.createViews();
          return showPanel(_this.projectFindPanel, _this.findPanel, function() {
            return _this.projectFindView.focusFindElement();
          });
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'project-find:toggle', (function(_this) {
        return function() {
          _this.createViews();
          return togglePanel(_this.projectFindPanel, _this.findPanel, function() {
            return _this.projectFindView.focusFindElement();
          });
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'project-find:show-in-current-directory', (function(_this) {
        return function(arg1) {
          var target;
          target = arg1.target;
          _this.createViews();
          _this.findPanel.hide();
          _this.projectFindPanel.show();
          _this.projectFindView.focusFindElement();
          return _this.projectFindView.findInCurrentlySelectedDirectory(target);
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'find-and-replace:use-selection-as-find-pattern', (function(_this) {
        return function() {
          var ref3, ref4;
          if (((ref3 = _this.projectFindPanel) != null ? ref3.isVisible() : void 0) || ((ref4 = _this.findPanel) != null ? ref4.isVisible() : void 0)) {
            return;
          }
          return _this.createViews();
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'find-and-replace:use-selection-as-replace-pattern', (function(_this) {
        return function() {
          var ref3, ref4;
          if (((ref3 = _this.projectFindPanel) != null ? ref3.isVisible() : void 0) || ((ref4 = _this.findPanel) != null ? ref4.isVisible() : void 0)) {
            return;
          }
          return _this.createViews();
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'find-and-replace:toggle', (function(_this) {
        return function() {
          _this.createViews();
          return togglePanel(_this.findPanel, _this.projectFindPanel, function() {
            return _this.findView.focusFindEditor();
          });
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'find-and-replace:show', (function(_this) {
        return function() {
          _this.createViews();
          return showPanel(_this.findPanel, _this.projectFindPanel, function() {
            return _this.findView.focusFindEditor();
          });
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'find-and-replace:show-replace', (function(_this) {
        return function() {
          _this.createViews();
          return showPanel(_this.findPanel, _this.projectFindPanel, function() {
            return _this.findView.focusReplaceEditor();
          });
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'find-and-replace:clear-history', (function(_this) {
        return function() {
          _this.findHistory.clear();
          return _this.replaceHistory.clear();
        };
      })(this)));
      handleEditorCancel = (function(_this) {
        return function(arg1) {
          var isMiniEditor, ref3, ref4, target;
          target = arg1.target;
          isMiniEditor = target.tagName === 'ATOM-TEXT-EDITOR' && target.hasAttribute('mini');
          if (!isMiniEditor) {
            if ((ref3 = _this.findPanel) != null) {
              ref3.hide();
            }
            return (ref4 = _this.projectFindPanel) != null ? ref4.hide() : void 0;
          }
        };
      })(this);
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'core:cancel': handleEditorCancel,
        'core:close': handleEditorCancel
      }));
      selectNextObjectForEditorElement = (function(_this) {
        return function(editorElement) {
          var editor, selectNext;
          if (_this.selectNextObjects == null) {
            _this.selectNextObjects = new WeakMap();
          }
          editor = editorElement.getModel();
          selectNext = _this.selectNextObjects.get(editor);
          if (selectNext == null) {
            selectNext = new SelectNext(editor);
            _this.selectNextObjects.set(editor, selectNext);
          }
          return selectNext;
        };
      })(this);
      showPanel = function(panelToShow, panelToHide, postShowAction) {
        panelToHide.hide();
        panelToShow.show();
        return typeof postShowAction === "function" ? postShowAction() : void 0;
      };
      togglePanel = function(panelToToggle, panelToHide, postToggleAction) {
        panelToHide.hide();
        if (panelToToggle.isVisible()) {
          return panelToToggle.hide();
        } else {
          panelToToggle.show();
          return typeof postToggleAction === "function" ? postToggleAction() : void 0;
        }
      };
      return this.subscriptions.add(atom.commands.add('.editor:not(.mini)', {
        'find-and-replace:select-next': function(event) {
          return selectNextObjectForEditorElement(this).findAndSelectNext();
        },
        'find-and-replace:select-all': function(event) {
          return selectNextObjectForEditorElement(this).findAndSelectAll();
        },
        'find-and-replace:select-undo': function(event) {
          return selectNextObjectForEditorElement(this).undoLastSelection();
        },
        'find-and-replace:select-skip': function(event) {
          return selectNextObjectForEditorElement(this).skipCurrentSelection();
        }
      }));
    },
    consumeMetricsReporter: function(service) {
      metricsReporter.setReporter(service);
      return new Disposable(function() {
        return metricsReporter.unsetReporter();
      });
    },
    consumeElementIcons: function(service) {
      getIconServices().setElementIcons(service);
      return new Disposable(function() {
        return getIconServices().resetElementIcons();
      });
    },
    consumeFileIcons: function(service) {
      getIconServices().setFileIcons(service);
      return new Disposable(function() {
        return getIconServices().resetFileIcons();
      });
    },
    toggleAutocompletions: function(value) {
      var disposable, ref2;
      if (this.findView == null) {
        return;
      }
      if (value) {
        this.autocompleteSubscriptions = new CompositeDisposable;
        disposable = typeof this.autocompleteWatchEditor === "function" ? this.autocompleteWatchEditor(this.findView.findEditor, ['default']) : void 0;
        if (disposable != null) {
          return this.autocompleteSubscriptions.add(disposable);
        }
      } else {
        return (ref2 = this.autocompleteSubscriptions) != null ? ref2.dispose() : void 0;
      }
    },
    consumeAutocompleteWatchEditor: function(watchEditor) {
      this.autocompleteWatchEditor = watchEditor;
      atom.config.observe('find-and-replace.autocompleteSearches', (function(_this) {
        return function(value) {
          return _this.toggleAutocompletions(value);
        };
      })(this));
      return new Disposable((function(_this) {
        return function() {
          var ref2;
          if ((ref2 = _this.autocompleteSubscriptions) != null) {
            ref2.dispose();
          }
          return _this.autocompleteWatchEditor = null;
        };
      })(this));
    },
    provideService: function() {
      return {
        resultsMarkerLayerForTextEditor: this.findModel.resultsMarkerLayerForTextEditor.bind(this.findModel)
      };
    },
    createViews: function() {
      var findBuffer, findHistoryCycler, options, pathsBuffer, pathsHistoryCycler, replaceBuffer, replaceHistoryCycler;
      if (this.findView != null) {
        return;
      }
      findBuffer = new TextBuffer;
      replaceBuffer = new TextBuffer;
      pathsBuffer = new TextBuffer;
      findHistoryCycler = new HistoryCycler(findBuffer, this.findHistory);
      replaceHistoryCycler = new HistoryCycler(replaceBuffer, this.replaceHistory);
      pathsHistoryCycler = new HistoryCycler(pathsBuffer, this.pathsHistory);
      options = {
        findBuffer: findBuffer,
        replaceBuffer: replaceBuffer,
        pathsBuffer: pathsBuffer,
        findHistoryCycler: findHistoryCycler,
        replaceHistoryCycler: replaceHistoryCycler,
        pathsHistoryCycler: pathsHistoryCycler
      };
      this.findView = new FindView(this.findModel, options);
      this.projectFindView = new ProjectFindView(this.resultsModel, options);
      this.findPanel = atom.workspace.addBottomPanel({
        item: this.findView,
        visible: false,
        className: 'tool-panel panel-bottom'
      });
      this.projectFindPanel = atom.workspace.addBottomPanel({
        item: this.projectFindView,
        visible: false,
        className: 'tool-panel panel-bottom'
      });
      this.findView.setPanel(this.findPanel);
      this.projectFindView.setPanel(this.projectFindPanel);
      ResultsPaneView.projectFindView = this.projectFindView;
      return this.toggleAutocompletions(atom.config.get('find-and-replace.autocompleteSearches'));
    },
    deactivate: function() {
      var ref2, ref3, ref4, ref5, ref6, ref7, ref8;
      if ((ref2 = this.findPanel) != null) {
        ref2.destroy();
      }
      this.findPanel = null;
      if ((ref3 = this.findView) != null) {
        ref3.destroy();
      }
      this.findView = null;
      if ((ref4 = this.findModel) != null) {
        ref4.destroy();
      }
      this.findModel = null;
      if ((ref5 = this.projectFindPanel) != null) {
        ref5.destroy();
      }
      this.projectFindPanel = null;
      if ((ref6 = this.projectFindView) != null) {
        ref6.destroy();
      }
      this.projectFindView = null;
      ResultsPaneView.model = null;
      if ((ref7 = this.autocompleteSubscriptions) != null) {
        ref7.dispose();
      }
      this.autocompleteManagerService = null;
      if ((ref8 = this.subscriptions) != null) {
        ref8.dispose();
      }
      return this.subscriptions = null;
    },
    serialize: function() {
      return {
        findOptions: this.findOptions.serialize(),
        findHistory: this.findHistory.serialize(),
        replaceHistory: this.replaceHistory.serialize(),
        pathsHistory: this.pathsHistory.serialize()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvZmluZC1hbmQtcmVwbGFjZS9saWIvZmluZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQWdELE9BQUEsQ0FBUSxNQUFSLENBQWhELEVBQUMsNkNBQUQsRUFBc0IsMkJBQXRCLEVBQWtDOztFQUVsQyxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBQ2IsT0FBMkIsT0FBQSxDQUFRLFdBQVIsQ0FBM0IsRUFBQyxzQkFBRCxFQUFVOztFQUNWLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFDZixlQUFBLEdBQWtCLE9BQUEsQ0FBUSxxQkFBUjs7RUFDbEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSOztFQUNqQixlQUFnQixPQUFBLENBQVEseUJBQVI7O0VBQ2pCLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHdCQUFSOztFQUNsQixhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUjs7RUFFaEIsZUFBQSxHQUFrQixJQUFJLGFBQUosQ0FBQTs7RUFFbEIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxTQUFDLEdBQUQ7QUFFUixVQUFBOzJCQUZTLE1BQXlELElBQXhELGdDQUFhLGdDQUFhLHNDQUFnQjtNQUVwRCxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvREFBaEIsQ0FBSDtRQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5REFBaEIsRUFBMkUsT0FBM0UsRUFERjs7TUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQVosQ0FBa0Isb0RBQWxCO01BRUEsSUFBSSxDQUFDLFNB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YTs7WUFFSSxDQUFFLE9BQW5CLENBQUE7O01BQ0EsSUFBQyxDQUFBLGdCQUFELEdBQW9COztZQUNKLENBQUUsT0FBbEIsQ0FBQTs7TUFDQSxJQUFDLENBQUEsZUFBRCxHQUFtQjtNQUVuQixlQUFlLENBQUMsS0FBaEIsR0FBd0I7O1lBRUUsQ0FBRSxPQUE1QixDQUFBOztNQUNBLElBQUMsQ0FBQSwwQkFBRCxHQUE4Qjs7WUFDaEIsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBbEJQLENBMU1aO0lBOE5BLFNBQUEsRUFBVyxTQUFBO2FBQ1Q7UUFBQSxXQUFBLEVBQWEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLENBQUEsQ0FBYjtRQUNBLFdBQUEsRUFBYSxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsQ0FBQSxDQURiO1FBRUEsY0FBQSxFQUFnQixJQUFDLENBQUEsY0FBYyxDQUFDLFNBQWhCLENBQUEsQ0FGaEI7UUFHQSxZQUFBLEVBQWMsSUFBQyxDQUFBLFlBQVksQ0FBQyxTQUFkLENBQUEsQ0FIZDs7SUFEUyxDQTlOWDs7QUFoQkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSwgVGV4dEJ1ZmZlcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5TZWxlY3ROZXh0ID0gcmVxdWlyZSAnLi9zZWxlY3QtbmV4dCdcbntIaXN0b3J5LCBIaXN0b3J5Q3ljbGVyfSA9IHJlcXVpcmUgJy4vaGlzdG9yeSdcbkZpbmRPcHRpb25zID0gcmVxdWlyZSAnLi9maW5kLW9wdGlvbnMnXG5CdWZmZXJTZWFyY2ggPSByZXF1aXJlICcuL2J1ZmZlci1zZWFyY2gnXG5nZXRJY29uU2VydmljZXMgPSByZXF1aXJlICcuL2dldC1pY29uLXNlcnZpY2VzJ1xuRmluZFZpZXcgPSByZXF1aXJlICcuL2ZpbmQtdmlldydcblByb2plY3RGaW5kVmlldyA9IHJlcXVpcmUgJy4vcHJvamVjdC1maW5kLXZpZXcnXG57UmVzdWx0c01vZGVsfSA9IHJlcXVpcmUgJy4vcHJvamVjdC9yZXN1bHRzLW1vZGVsJ1xuUmVzdWx0c1BhbmVWaWV3ID0gcmVxdWlyZSAnLi9wcm9qZWN0L3Jlc3VsdHMtcGFuZSdcblJlcG9ydGVyUHJveHkgPSByZXF1aXJlICcuL3JlcG9ydGVyLXByb3h5J1xuXG5tZXRyaWNzUmVwb3J0ZXIgPSBuZXcgUmVwb3J0ZXJQcm94eSgpXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgYWN0aXZhdGU6ICh7ZmluZE9wdGlvbnMsIGZpbmRIaXN0b3J5LCByZXBsYWNlSGlzdG9yeSwgcGF0aHNIaXN0b3J5fT17fSkgLT5cbiAgICAjIENvbnZlcnQgb2xkIGNvbmZpZyBzZXR0aW5nIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnZmluZC1hbmQtcmVwbGFjZS5vcGVuUHJvamVjdEZpbmRSZXN1bHRzSW5SaWdodFBhbmUnKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdmaW5kLWFuZC1yZXBsYWNlLnByb2plY3RTZWFyY2hSZXN1bHRzUGFuZVNwbGl0RGlyZWN0aW9uJywgJ3JpZ2h0JylcbiAgICBhdG9tLmNvbmZpZy51bnNldCgnZmluZC1hbmQtcmVwbGFjZS5vcGVuUHJvamVjdEZpbmRSZXN1bHRzSW5SaWdodFBhbmUnKVxuXG4gICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyIChmaWxlUGF0aCkgLT5cbiAgICAgIG5ldyBSZXN1bHRzUGFuZVZpZXcoKSBpZiBmaWxlUGF0aC5pbmRleE9mKFJlc3VsdHNQYW5lVmlldy5VUkkpIGlzbnQgLTFcblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAY3VycmVudEl0ZW1TdWIgPSBuZXcgRGlzcG9zYWJsZVxuICAgIEBmaW5kSGlzdG9yeSA9IG5ldyBIaXN0b3J5KGZpbmRIaXN0b3J5KVxuICAgIEByZXBsYWNlSGlzdG9yeSA9IG5ldyBIaXN0b3J5KHJlcGxhY2VIaXN0b3J5KVxuICAgIEBwYXRoc0hpc3RvcnkgPSBuZXcgSGlzdG9yeShwYXRoc0hpc3RvcnkpXG5cbiAgICBAZmluZE9wdGlvbnMgPSBuZXcgRmluZE9wdGlvbnMoZmluZE9wdGlvbnMpXG4gICAgQGZpbmRNb2RlbCA9IG5ldyBCdWZmZXJTZWFyY2goQGZpbmRPcHRpb25zKVxuICAgIEByZXN1bHRzTW9kZWwgPSBuZXcgUmVzdWx0c01vZGVsKEBmaW5kT3B0aW9ucywgbWV0cmljc1JlcG9ydGVyKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLm9ic2VydmVBY3RpdmVQYW5lSXRlbSAocGFuZUl0ZW0pID0+XG4gICAgICBAc3Vic2NyaXB0aW9ucy5kZWxldGUgQGN1cnJlbnRJdGVtU3ViXG4gICAgICBAY3VycmVudEl0ZW1TdWIuZGlzcG9zZSgpXG5cbiAgICAgIGlmIGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihwYW5lSXRlbSlcbiAgICAgICAgQGZpbmRNb2RlbC5zZXRFZGl0b3IocGFuZUl0ZW0pXG4gICAgICBlbHNlIGlmIHBhbmVJdGVtPy5vYnNlcnZlRW1iZWRkZWRUZXh0RWRpdG9yP1xuICAgICAgICBAY3VycmVudEl0ZW1TdWIgPSBwYW5lSXRlbS5vYnNlcnZlRW1iZWRkZWRUZXh0RWRpdG9yIChlZGl0b3IpID0+XG4gICAgICAgICAgaWYgYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlUGFuZUl0ZW0oKSBpcyBwYW5lSXRlbVxuICAgICAgICAgICAgQGZpbmRNb2RlbC5zZXRFZGl0b3IoZWRpdG9yKVxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGN1cnJlbnRJdGVtU3ViXG4gICAgICBlbHNlIGlmIHBhbmVJdGVtPy5nZXRFbWJlZGRlZFRleHRFZGl0b3I/XG4gICAgICAgIEBmaW5kTW9kZWwuc2V0RWRpdG9yKHBhbmVJdGVtLmdldEVtYmVkZGVkVGV4dEVkaXRvcigpKVxuICAgICAgZWxzZVxuICAgICAgICBAZmluZE1vZGVsLnNldEVkaXRvcihudWxsKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICcuZmluZC1hbmQtcmVwbGFjZSwgLnByb2plY3QtZmluZCcsICd3aW5kb3c6Zm9jdXMtbmV4dC1wYW5lJywgLT5cbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSkuZm9jdXMoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdwcm9qZWN0LWZpbmQ6c2hvdycsID0+XG4gICAgICBAY3JlYXRlVmlld3MoKVxuICAgICAgc2hvd1BhbmVsIEBwcm9qZWN0RmluZFBhbmVsLCBAZmluZFBhbmVsLCA9PiBAcHJvamVjdEZpbmRWaWV3LmZvY3VzRmluZEVsZW1lbnQoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdwcm9qZWN0LWZpbmQ6dG9nZ2xlJywgPT5cbiAgICAgIEBjcmVhdGVWaWV3cygpXG4gICAgICB0b2dnbGVQYW5lbCBAcHJvamVjdEZpbmRQYW5lbCwgQGZpbmRQYW5lbCwgPT4gQHByb2plY3RGaW5kVmlldy5mb2N1c0ZpbmRFbGVtZW50KClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAncHJvamVjdC1maW5kOnNob3ctaW4tY3VycmVudC1kaXJlY3RvcnknLCAoe3RhcmdldH0pID0+XG4gICAgICBAY3JlYXRlVmlld3MoKVxuICAgICAgQGZpbmRQYW5lbC5oaWRlKClcbiAgICAgIEBwcm9qZWN0RmluZFBhbmVsLnNob3coKVxuICAgICAgQHByb2plY3RGaW5kVmlldy5mb2N1c0ZpbmRFbGVtZW50KClcbiAgICAgIEBwcm9qZWN0RmluZFZpZXcuZmluZEluQ3VycmVudGx5U2VsZWN0ZWREaXJlY3RvcnkodGFyZ2V0KVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdmaW5kLWFuZC1yZXBsYWNlOnVzZS1zZWxlY3Rpb24tYXMtZmluZC1wYXR0ZXJuJywgPT5cbiAgICAgIHJldHVybiBpZiBAcHJvamVjdEZpbmRQYW5lbD8uaXNWaXNpYmxlKCkgb3IgQGZpbmRQYW5lbD8uaXNWaXNpYmxlKClcbiAgICAgIEBjcmVhdGVWaWV3cygpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2ZpbmQtYW5kLXJlcGxhY2U6dXNlLXNlbGVjdGlvbi1hcy1yZXBsYWNlLXBhdHRlcm4nLCA9PlxuICAgICAgcmV0dXJuIGlmIEBwcm9qZWN0RmluZFBhbmVsPy5pc1Zpc2libGUoKSBvciBAZmluZFBhbmVsPy5pc1Zpc2libGUoKVxuICAgICAgQGNyZWF0ZVZpZXdzKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZmluZC1hbmQtcmVwbGFjZTp0b2dnbGUnLCA9PlxuICAgICAgQGNyZWF0ZVZpZXdzKClcbiAgICAgIHRvZ2dsZVBhbmVsIEBmaW5kUGFuZWwsIEBwcm9qZWN0RmluZFBhbmVsLCA9PiBAZmluZFZpZXcuZm9jdXNGaW5kRWRpdG9yKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZmluZC1hbmQtcmVwbGFjZTpzaG93JywgPT5cbiAgICAgIEBjcmVhdGVWaWV3cygpXG4gICAgICBzaG93UGFuZWwgQGZpbmRQYW5lbCwgQHByb2plY3RGaW5kUGFuZWwsID0+IEBmaW5kVmlldy5mb2N1c0ZpbmRFZGl0b3IoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdmaW5kLWFuZC1yZXBsYWNlOnNob3ctcmVwbGFjZScsID0+XG4gICAgICBAY3JlYXRlVmlld3MoKVxuICAgICAgc2hvd1BhbmVsIEBmaW5kUGFuZWwsIEBwcm9qZWN0RmluZFBhbmVsLCA9PiBAZmluZFZpZXcuZm9jdXNSZXBsYWNlRWRpdG9yKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZmluZC1hbmQtcmVwbGFjZTpjbGVhci1oaXN0b3J5JywgPT5cbiAgICAgIEBmaW5kSGlzdG9yeS5jbGVhcigpXG4gICAgICBAcmVwbGFjZUhpc3RvcnkuY2xlYXIoKVxuXG4gICAgIyBIYW5kbGluZyBjYW5jZWwgaW4gdGhlIHdvcmtzcGFjZSArIGNvZGUgZWRpdG9yc1xuICAgIGhhbmRsZUVkaXRvckNhbmNlbCA9ICh7dGFyZ2V0fSkgPT5cbiAgICAgIGlzTWluaUVkaXRvciA9IHRhcmdldC50YWdOYW1lIGlzICdBVE9NLVRFWFQtRURJVE9SJyBhbmQgdGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnbWluaScpXG4gICAgICB1bmxlc3MgaXNNaW5pRWRpdG9yXG4gICAgICAgIEBmaW5kUGFuZWw/LmhpZGUoKVxuICAgICAgICBAcHJvamVjdEZpbmRQYW5lbD8uaGlkZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdjb3JlOmNhbmNlbCc6IGhhbmRsZUVkaXRvckNhbmNlbFxuICAgICAgJ2NvcmU6Y2xvc2UnOiBoYW5kbGVFZGl0b3JDYW5jZWxcblxuICAgIHNlbGVjdE5leHRPYmplY3RGb3JFZGl0b3JFbGVtZW50ID0gKGVkaXRvckVsZW1lbnQpID0+XG4gICAgICBAc2VsZWN0TmV4dE9iamVjdHMgPz0gbmV3IFdlYWtNYXAoKVxuICAgICAgZWRpdG9yID0gZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpXG4gICAgICBzZWxlY3ROZXh0ID0gQHNlbGVjdE5leHRPYmplY3RzLmdldChlZGl0b3IpXG4gICAgICB1bmxlc3Mgc2VsZWN0TmV4dD9cbiAgICAgICAgc2VsZWN0TmV4dCA9IG5ldyBTZWxlY3ROZXh0KGVkaXRvcilcbiAgICAgICAgQHNlbGVjdE5leHRPYmplY3RzLnNldChlZGl0b3IsIHNlbGVjdE5leHQpXG4gICAgICBzZWxlY3ROZXh0XG5cbiAgICBzaG93UGFuZWwgPSAocGFuZWxUb1Nob3csIHBhbmVsVG9IaWRlLCBwb3N0U2hvd0FjdGlvbikgLT5cbiAgICAgIHBhbmVsVG9IaWRlLmhpZGUoKVxuICAgICAgcGFuZWxUb1Nob3cuc2hvdygpXG4gICAgICBwb3N0U2hvd0FjdGlvbj8oKVxuXG4gICAgdG9nZ2xlUGFuZWwgPSAocGFuZWxUb1RvZ2dsZSwgcGFuZWxUb0hpZGUsIHBvc3RUb2dnbGVBY3Rpb24pIC0+XG4gICAgICBwYW5lbFRvSGlkZS5oaWRlKClcblxuICAgICAgaWYgcGFuZWxUb1RvZ2dsZS5pc1Zpc2libGUoKVxuICAgICAgICBwYW5lbFRvVG9nZ2xlLmhpZGUoKVxuICAgICAgZWxzZVxuICAgICAgICBwYW5lbFRvVG9nZ2xlLnNob3coKVxuICAgICAgICBwb3N0VG9nZ2xlQWN0aW9uPygpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy5lZGl0b3I6bm90KC5taW5pKScsXG4gICAgICAnZmluZC1hbmQtcmVwbGFjZTpzZWxlY3QtbmV4dCc6IChldmVudCkgLT5cbiAgICAgICAgc2VsZWN0TmV4dE9iamVjdEZvckVkaXRvckVsZW1lbnQodGhpcykuZmluZEFuZFNlbGVjdE5leHQoKVxuICAgICAgJ2ZpbmQtYW5kLXJlcGxhY2U6c2VsZWN0LWFsbCc6IChldmVudCkgLT5cbiAgICAgICAgc2VsZWN0TmV4dE9iamVjdEZvckVkaXRvckVsZW1lbnQodGhpcykuZmluZEFuZFNlbGVjdEFsbCgpXG4gICAgICAnZmluZC1hbmQtcmVwbGFjZTpzZWxlY3QtdW5kbyc6IChldmVudCkgLT5cbiAgICAgICAgc2VsZWN0TmV4dE9iamVjdEZvckVkaXRvckVsZW1lbnQodGhpcykudW5kb0xhc3RTZWxlY3Rpb24oKVxuICAgICAgJ2ZpbmQtYW5kLXJlcGxhY2U6c2VsZWN0LXNraXAnOiAoZXZlbnQpIC0+XG4gICAgICAgIHNlbGVjdE5leHRPYmplY3RGb3JFZGl0b3JFbGVtZW50KHRoaXMpLnNraXBDdXJyZW50U2VsZWN0aW9uKClcblxuICBjb25zdW1lTWV0cmljc1JlcG9ydGVyOiAoc2VydmljZSkgLT5cbiAgICBtZXRyaWNzUmVwb3J0ZXIuc2V0UmVwb3J0ZXIoc2VydmljZSlcbiAgICBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgbWV0cmljc1JlcG9ydGVyLnVuc2V0UmVwb3J0ZXIoKVxuXG4gIGNvbnN1bWVFbGVtZW50SWNvbnM6IChzZXJ2aWNlKSAtPlxuICAgIGdldEljb25TZXJ2aWNlcygpLnNldEVsZW1lbnRJY29ucyBzZXJ2aWNlXG4gICAgbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgIGdldEljb25TZXJ2aWNlcygpLnJlc2V0RWxlbWVudEljb25zKClcblxuICBjb25zdW1lRmlsZUljb25zOiAoc2VydmljZSkgLT5cbiAgICBnZXRJY29uU2VydmljZXMoKS5zZXRGaWxlSWNvbnMgc2VydmljZVxuICAgIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgICBnZXRJY29uU2VydmljZXMoKS5yZXNldEZpbGVJY29ucygpXG5cbiAgdG9nZ2xlQXV0b2NvbXBsZXRpb25zOiAodmFsdWUpIC0+XG4gICAgaWYgbm90IEBmaW5kVmlldz9cbiAgICAgIHJldHVyblxuICAgIGlmIHZhbHVlXG4gICAgICBAYXV0b2NvbXBsZXRlU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgICBkaXNwb3NhYmxlID0gQGF1dG9jb21wbGV0ZVdhdGNoRWRpdG9yPyhAZmluZFZpZXcuZmluZEVkaXRvciwgWydkZWZhdWx0J10pXG4gICAgICBpZiBkaXNwb3NhYmxlP1xuICAgICAgICBAYXV0b2NvbXBsZXRlU3Vic2NyaXB0aW9ucy5hZGQoZGlzcG9zYWJsZSlcbiAgICBlbHNlXG4gICAgICBAYXV0b2NvbXBsZXRlU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG5cbiAgY29uc3VtZUF1dG9jb21wbGV0ZVdhdGNoRWRpdG9yOiAod2F0Y2hFZGl0b3IpIC0+XG4gICAgQGF1dG9jb21wbGV0ZVdhdGNoRWRpdG9yID0gd2F0Y2hFZGl0b3JcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFxuICAgICAgJ2ZpbmQtYW5kLXJlcGxhY2UuYXV0b2NvbXBsZXRlU2VhcmNoZXMnLFxuICAgICAgKHZhbHVlKSA9PiBAdG9nZ2xlQXV0b2NvbXBsZXRpb25zKHZhbHVlKSlcbiAgICBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGF1dG9jb21wbGV0ZVN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgICAgQGF1dG9jb21wbGV0ZVdhdGNoRWRpdG9yID0gbnVsbFxuXG4gIHByb3ZpZGVTZXJ2aWNlOiAtPlxuICAgIHJlc3VsdHNNYXJrZXJMYXllckZvclRleHRFZGl0b3I6IEBmaW5kTW9kZWwucmVzdWx0c01hcmtlckxheWVyRm9yVGV4dEVkaXRvci5iaW5kKEBmaW5kTW9kZWwpXG5cbiAgY3JlYXRlVmlld3M6IC0+XG4gICAgcmV0dXJuIGlmIEBmaW5kVmlldz9cblxuICAgIGZpbmRCdWZmZXIgPSBuZXcgVGV4dEJ1ZmZlclxuICAgIHJlcGxhY2VCdWZmZXIgPSBuZXcgVGV4dEJ1ZmZlclxuICAgIHBhdGhzQnVmZmVyID0gbmV3IFRleHRCdWZmZXJcblxuICAgIGZpbmRIaXN0b3J5Q3ljbGVyID0gbmV3IEhpc3RvcnlDeWNsZXIoZmluZEJ1ZmZlciwgQGZpbmRIaXN0b3J5KVxuICAgIHJlcGxhY2VIaXN0b3J5Q3ljbGVyID0gbmV3IEhpc3RvcnlDeWNsZXIocmVwbGFjZUJ1ZmZlciwgQHJlcGxhY2VIaXN0b3J5KVxuICAgIHBhdGhzSGlzdG9yeUN5Y2xlciA9IG5ldyBIaXN0b3J5Q3ljbGVyKHBhdGhzQnVmZmVyLCBAcGF0aHNIaXN0b3J5KVxuXG4gICAgb3B0aW9ucyA9IHtmaW5kQnVmZmVyLCByZXBsYWNlQnVmZmVyLCBwYXRoc0J1ZmZlciwgZmluZEhpc3RvcnlDeWNsZXIsIHJlcGxhY2VIaXN0b3J5Q3ljbGVyLCBwYXRoc0hpc3RvcnlDeWNsZXJ9XG5cbiAgICBAZmluZFZpZXcgPSBuZXcgRmluZFZpZXcoQGZpbmRNb2RlbCwgb3B0aW9ucylcblxuICAgIEBwcm9qZWN0RmluZFZpZXcgPSBuZXcgUHJvamVjdEZpbmRWaWV3KEByZXN1bHRzTW9kZWwsIG9wdGlvbnMpXG5cbiAgICBAZmluZFBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogQGZpbmRWaWV3LCB2aXNpYmxlOiBmYWxzZSwgY2xhc3NOYW1lOiAndG9vbC1wYW5lbCBwYW5lbC1ib3R0b20nKVxuICAgIEBwcm9qZWN0RmluZFBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogQHByb2plY3RGaW5kVmlldywgdmlzaWJsZTogZmFsc2UsIGNsYXNzTmFtZTogJ3Rvb2wtcGFuZWwgcGFuZWwtYm90dG9tJylcblxuICAgIEBmaW5kVmlldy5zZXRQYW5lbChAZmluZFBhbmVsKVxuICAgIEBwcm9qZWN0RmluZFZpZXcuc2V0UGFuZWwoQHByb2plY3RGaW5kUGFuZWwpXG5cbiAgICAjIEhBQ0s6IFNvb29vLCB3ZSBuZWVkIHRvIGdldCB0aGUgbW9kZWwgdG8gdGhlIHBhbmUgdmlldyB3aGVuZXZlciBpdCBpc1xuICAgICMgY3JlYXRlZC4gQ3JlYXRpb24gY291bGQgY29tZSBmcm9tIHRoZSBvcGVuZXIgYmVsb3csIG9yLCBtb3JlIHByb2JsZW1hdGljLFxuICAgICMgZnJvbSBhIGRlc2VyaWFsaXplIGNhbGwgd2hlbiBzcGxpdHRpbmcgcGFuZXMuIEZvciBub3csIGFsbCBwYW5lIHZpZXdzIHdpbGxcbiAgICAjIHVzZSB0aGlzIHNhbWUgbW9kZWwuIFRoaXMgbmVlZHMgdG8gYmUgaW1wcm92ZWQhIEkgZG9udCBrbm93IHRoZSBiZXN0IHdheVxuICAgICMgdG8gZGVhbCB3aXRoIHRoaXM6XG4gICAgIyAxLiBIb3cgc2hvdWxkIHNlcmlhbGl6YXRpb24gd29yayBpbiB0aGUgY2FzZSBvZiBhIHNoYXJlZCBtb2RlbC5cbiAgICAjIDIuIE9yIG1heWJlIHdlIGNyZWF0ZSB0aGUgbW9kZWwgZWFjaCB0aW1lIGEgbmV3IHBhbmUgaXMgY3JlYXRlZD8gVGhlblxuICAgICMgICAgUHJvamVjdEZpbmRWaWV3IG5lZWRzIHRvIGtub3cgYWJvdXQgZWFjaCBtb2RlbCBzbyBpdCBjYW4gaW52b2tlIGEgc2VhcmNoLlxuICAgICMgICAgQW5kIG9uIGVhY2ggbmV3IG1vZGVsLCBpdCB3aWxsIHJ1biB0aGUgc2VhcmNoIGFnYWluLlxuICAgICNcbiAgICAjIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9maW5kLWFuZC1yZXBsYWNlL2lzc3Vlcy82M1xuICAgICNSZXN1bHRzUGFuZVZpZXcubW9kZWwgPSBAcmVzdWx0c01vZGVsXG4gICAgIyBUaGlzIG1ha2VzIHByb2plY3RGaW5kVmlldyBhY2Nlc2libGUgaW4gUmVzdWx0c1BhbmVWaWV3IHNvIHRoYXQgcmVzdWx0c01vZGVsXG4gICAgIyBjYW4gYmUgcHJvcGVybHkgc2V0IGZvciBSZXN1bHRzUGFuZVZpZXcgaW5zdGFuY2VzIGFuZCBQcm9qZWN0RmluZFZpZXcgaW5zdGFuY2VcbiAgICAjIGFzIGRpZmZlcmVudCBwYW5lIHZpZXdzIGRvbid0IG5lY2Vzc2FyaWx5IHVzZSBzYW1lIG1vZGVscyBhbnltb3JlXG4gICAgIyBidXQgbW9zdCByZWNlbnQgcGFuZSB2aWV3IGFuZCBwcm9qZWN0RmluZFZpZXcgZG9cbiAgICBSZXN1bHRzUGFuZVZpZXcucHJvamVjdEZpbmRWaWV3ID0gQHByb2plY3RGaW5kVmlld1xuXG4gICAgQHRvZ2dsZUF1dG9jb21wbGV0aW9ucyBhdG9tLmNvbmZpZy5nZXQoJ2ZpbmQtYW5kLXJlcGxhY2UuYXV0b2NvbXBsZXRlU2VhcmNoZXMnKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGZpbmRQYW5lbD8uZGVzdHJveSgpXG4gICAgQGZpbmRQYW5lbCA9IG51bGxcbiAgICBAZmluZFZpZXc/LmRlc3Ryb3koKVxuICAgIEBmaW5kVmlldyA9IG51bGxcbiAgICBAZmluZE1vZGVsPy5kZXN0cm95KClcbiAgICBAZmluZE1vZGVsID0gbnVsbFxuXG4gICAgQHByb2plY3RGaW5kUGFuZWw/LmRlc3Ryb3koKVxuICAgIEBwcm9qZWN0RmluZFBhbmVsID0gbnVsbFxuICAgIEBwcm9qZWN0RmluZFZpZXc/LmRlc3Ryb3koKVxuICAgIEBwcm9qZWN0RmluZFZpZXcgPSBudWxsXG5cbiAgICBSZXN1bHRzUGFuZVZpZXcubW9kZWwgPSBudWxsXG5cbiAgICBAYXV0b2NvbXBsZXRlU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQGF1dG9jb21wbGV0ZU1hbmFnZXJTZXJ2aWNlID0gbnVsbFxuICAgIEBzdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG51bGxcblxuICBzZXJpYWxpemU6IC0+XG4gICAgZmluZE9wdGlvbnM6IEBmaW5kT3B0aW9ucy5zZXJpYWxpemUoKVxuICAgIGZpbmRIaXN0b3J5OiBAZmluZEhpc3Rvcnkuc2VyaWFsaXplKClcbiAgICByZXBsYWNlSGlzdG9yeTogQHJlcGxhY2VIaXN0b3J5LnNlcmlhbGl6ZSgpXG4gICAgcGF0aHNIaXN0b3J5OiBAcGF0aHNIaXN0b3J5LnNlcmlhbGl6ZSgpXG4iXX0=
