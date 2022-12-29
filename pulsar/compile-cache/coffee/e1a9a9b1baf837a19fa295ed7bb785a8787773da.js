(function() {
  var BrowserWindow, CompositeDisposable, TabBarView, TabView, ipcRenderer;

  BrowserWindow = null;

  ipcRenderer = require('electron').ipcRenderer;

  CompositeDisposable = require('atom').CompositeDisposable;

  TabView = require('./tab-view');

  module.exports = TabBarView = (function() {
    function TabBarView(pane1, location1) {
      var addElementCommands, item, j, len, ref;
      this.pane = pane1;
      this.location = location1;
      this.element = document.createElement('ul');
      this.element.classList.add("list-inline");
      this.element.classList.add("tab-bar");
      this.element.classList.add("inset-panel");
      this.element.setAttribute('is', 'atom-tabs');
      this.element.setAttribute("tabindex", -1);
      this.element.setAttribute("location", this.location);
      this.tabs = [];
      this.tabsByElement = new WeakMap;
      this.subscriptions = new CompositeDisposable;
      this.paneElement = this.pane.getElement();
      this.subscriptions.add(atom.commands.add(this.paneElement, {
        'tabs:keep-pending-tab': (function(_this) {
          return function() {
            return _this.terminatePendingStates();
          };
        })(this),
        'tabs:close-tab': (function(_this) {
          return function() {
            return _this.closeTab(_this.getActiveTab());
          };
        })(this),
        'tabs:close-other-tabs': (function(_this) {
          return function() {
            return _this.closeOtherTabs(_this.getActiveTab());
          };
        })(this),
        'tabs:close-tabs-to-right': (function(_this) {
          return function() {
            return _this.closeTabsToRight(_this.getActiveTab());
          };
        })(this),
        'tabs:close-tabs-to-left': (function(_this) {
          return function() {
            return _this.closeTabsToLeft(_this.getActiveTab());
          };
        })(this),
        'tabs:close-saved-tabs': (function(_this) {
          return function() {
            return _this.closeSavedTabs();
          };
        })(this),
        'tabs:close-all-tabs': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this.closeAllTabs();
          };
        })(this),
        'tabs:open-in-new-window': (function(_this) {
          return function() {
            return _this.openInNewWindow();
          };
        })(this)
      }));
      addElementCommands = (function(_this) {
        return function(commands) {
          var commandsWithPropagationStopped;
          commandsWithPropagationStopped = {};
          Object.keys(commands).forEach(function(name) {
            return commandsWithPropagationStopped[name] = function(event) {
              event.stopPropagation();
              return commands[name]();
            };
          });
          return _this.subscriptions.add(atom.commands.add(_this.element, commandsWithPropagationStopped));
        };
      })(this);
      addElementCommands({
        'tabs:close-tab': (function(_this) {
          return function() {
            return _this.closeTab();
          };
        })(this),
        'tabs:close-other-tabs': (function(_this) {
          return function() {
            return _this.closeOtherTabs();
          };
        })(this),
        'tabs:close-tabs-to-right': (function(_this) {
          return function() {
            return _this.closeTabsToRight();
          };
        })(this),
        'tabs:close-tabs-to-left': (function(_this) {
          return function() {
            return _this.closeTabsToLeft();
          };
        })(this),
        'tabs:close-saved-tabs': (function(_this) {
          return function() {
            return _this.closeSavedTabs();
          };
        })(this),
        'tabs:close-all-tabs': (function(_this) {
          return function() {
            return _this.closeAllTabs();
          };
        })(this),
        'tabs:split-up': (function(_this) {
          return function() {
            return _this.splitTab('splitUp');
          };
        })(this),
        'tabs:split-down': (function(_this) {
          return function() {
            return _this.splitTab('splitDown');
          };
        })(this),
        'tabs:split-left': (function(_this) {
          return function() {
            return _this.splitTab('splitLeft');
          };
        })(this),
        'tabs:split-right': (function(_this) {
          return function() {
            return _this.splitTab('splitRight');
          };
        })(this)
      });
      this.element.addEventListener("mouseenter", this.onMouseEnter.bind(this));
      this.element.addEventListener("mouseleave", this.onMouseLeave.bind(this));
      this.element.addEventListener("mousewheel", this.onMouseWheel.bind(this));
      this.element.addEventListener("dragstart", this.onDragStart.bind(this));
      this.element.addEventListener("dragend", this.onDragEnd.bind(this));
      this.element.addEventListener("dragleave", this.onDragLeave.bind(this));
      this.element.addEventListener("dragover", this.onDragOver.bind(this));
      this.element.addEventListener("drop", this.onDrop.bind(this));
      this.paneElement.addEventListener('dragenter', this.onPaneDragEnter.bind(this));
      this.paneElement.addEventListener('dragleave', this.onPaneDragLeave.bind(this));
      this.paneContainer = this.pane.getContainer();
      ref = this.pane.getItems();
      for (j = 0, len = ref.length; j < len; j++) {
        item = ref[j];
        this.addTabForItem(item);
      }
      this.subscriptions.add(this.pane.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      this.subscriptions.add(this.pane.onDidAddItem((function(_this) {
        return function(arg) {
          var index, item;
          item = arg.item, index = arg.index;
          return _this.addTabForItem(item, index);
        };
      })(this)));
      this.subscriptions.add(this.pane.onDidMoveItem((function(_this) {
        return function(arg) {
          var item, newIndex;
          item = arg.item, newIndex = arg.newIndex;
          return _this.moveItemTabToIndex(item, newIndex);
        };
      })(this)));
      this.subscriptions.add(this.pane.onDidRemoveItem((function(_this) {
        return function(arg) {
          var item;
          item = arg.item;
          return _this.removeTabForItem(item);
        };
      })(this)));
      this.subscriptions.add(this.pane.onDidChangeActiveItem((function(_this) {
        return function(item) {
          return _this.updateActiveTab();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('tabs.tabScrolling', (function(_this) {
        return function(value) {
          return _this.updateTabScrolling(value);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('tabs.tabScrollingThreshold', (function(_this) {
        return function(value) {
          return _this.updateTabScrollingThreshold(value);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('tabs.alwaysShowTabBar', (function(_this) {
        return function() {
          return _this.updateTabBarVisibility();
        };
      })(this)));
      this.updateActiveTab();
      this.element.addEventListener("mousedown", this.onMouseDown.bind(this));
      this.element.addEventListener("click", this.onClick.bind(this));
      this.element.addEventListener("auxclick", this.onClick.bind(this));
      this.element.addEventListener("dblclick", this.onDoubleClick.bind(this));
      this.onDropOnOtherWindow = this.onDropOnOtherWindow.bind(this);
      ipcRenderer.on('tab:dropped', this.onDropOnOtherWindow);
    }

    TabBarView.prototype.destroy = function() {
      ipcRenderer.removeListener('tab:dropped', this.onDropOnOtherWindow);
      this.subscriptions.dispose();
      return this.element.remove();
    };

    TabBarView.prototype.terminatePendingStates = function() {
      var j, len, ref, tab;
      ref = this.getTabs();
      for (j = 0, len = ref.length; j < len; j++) {
        tab = ref[j];
        if (typeof tab.terminatePendingState === "function") {
          tab.terminatePendingState();
        }
      }
    };

    TabBarView.prototype.addTabForItem = function(item, index) {
      var tabView;
      tabView = new TabView({
        item: item,
        pane: this.pane,
        tabs: this.tabs,
        didClickCloseIcon: (function(_this) {
          return function() {
            _this.closeTab(tabView);
          };
        })(this),
        location: this.location
      });
      if (this.isItemMovingBetweenPanes) {
        tabView.terminatePendingState();
      }
      this.tabsByElement.set(tabView.element, tabView);
      this.insertTabAtIndex(tabView, index);
      if (atom.config.get('tabs.addNewTabsAtEnd')) {
        if (!this.isItemMovingBetweenPanes) {
          return this.pane.moveItem(item, this.pane.getItems().length - 1);
        }
      }
    };

    TabBarView.prototype.moveItemTabToIndex = function(item, index) {
      var tab, tabIndex;
      tabIndex = this.tabs.findIndex(function(t) {
        return t.item === item;
      });
      if (tabIndex !== -1) {
        tab = this.tabs[tabIndex];
        tab.element.remove();
        this.tabs.splice(tabIndex, 1);
        return this.insertTabAtIndex(tab, index);
      }
    };

    TabBarView.prototype.insertTabAtIndex = function(tab, index) {
      var followingTab;
      if (index != null) {
        followingTab = this.tabs[index];
      }
      if (followingTab) {
        this.element.insertBefore(tab.element, followingTab.element);
        this.tabs.splice(index, 0, tab);
      } else {
        this.element.appendChild(tab.element);
        this.tabs.push(tab);
      }
      tab.updateTitle();
      return this.updateTabBarVisibility();
    };

    TabBarView.prototype.removeTabForItem = function(item) {
      var j, len, ref, tab, tabIndex;
      tabIndex = this.tabs.findIndex(function(t) {
        return t.item === item;
      });
      if (tabIndex !== -1) {
        tab = this.tabs[tabIndex];
        this.tabs.splice(tabIndex, 1);
        this.tabsByElement["delete"](tab);
        tab.destroy();
      }
      ref = this.getTabs();
      for (j = 0, len = ref.length; j < len; j++) {
        tab = ref[j];
        tab.updateTitle();
      }
      return this.updateTabBarVisibility();
    };

    TabBarView.prototype.updateTabBarVisibility = function() {
      if (atom.config.get('tabs.alwaysShowTabBar') || this.pane.getItems().length > 1) {
        return this.element.classList.remove('hidden');
      } else {
        return this.element.classList.add('hidden');
      }
    };

    TabBarView.prototype.getTabs = function() {
      return this.tabs.slice();
    };

    TabBarView.prototype.tabAtIndex = function(index) {
      return this.tabs[index];
    };

    TabBarView.prototype.tabForItem = function(item) {
      return this.tabs.find(function(t) {
        return t.item === item;
      });
    };

    TabBarView.prototype.setActiveTab = function(tabView) {
      var ref;
      if ((tabView != null) && tabView !== this.activeTab) {
        if ((ref = this.activeTab) != null) {
          ref.element.classList.remove('active');
        }
        this.activeTab = tabView;
        this.activeTab.element.classList.add('active');
        return this.activeTab.element.scrollIntoView(false);
      }
    };

    TabBarView.prototype.getActiveTab = function() {
      return this.tabForItem(this.pane.getActiveItem());
    };

    TabBarView.prototype.updateActiveTab = function() {
      return this.setActiveTab(this.tabForItem(this.pane.getActiveItem()));
    };

    TabBarView.prototype.closeTab = function(tab) {
      if (tab == null) {
        tab = this.rightClickedTab;
      }
      if (tab != null) {
        return this.pane.destroyItem(tab.item);
      }
    };

    TabBarView.prototype.openInNewWindow = function(tab) {
      var item, itemURI, j, len, pathsToOpen, ref;
      if (tab == null) {
        tab = this.rightClickedTab;
      }
      item = tab != null ? tab.item : void 0;
      if (item == null) {
        return;
      }
      if (typeof item.getURI === 'function') {
        itemURI = item.getURI();
      } else if (typeof item.getPath === 'function') {
        itemURI = item.getPath();
      } else if (typeof item.getUri === 'function') {
        itemURI = item.getUri();
      }
      if (itemURI == null) {
        return;
      }
      this.closeTab(tab);
      ref = this.getTabs();
      for (j = 0, len = ref.length; j < len; j++) {
        tab = ref[j];
        tab.element.style.maxWidth = '';
      }
      pathsToOpen = [atom.project.getPaths(), itemURI].reduce((function(a, b) {
        return a.concat(b);
      }), []);
      return atom.open({
        pathsToOpen: pathsToOpen,
        newWindow: true,
        devMode: atom.devMode,
        safeMode: atom.safeMode
      });
    };

    TabBarView.prototype.splitTab = function(fn) {
      var copiedItem, item, ref;
      if (item = (ref = this.rightClickedTab) != null ? ref.item : void 0) {
        if (copiedItem = typeof item.copy === "function" ? item.copy() : void 0) {
          return this.pane[fn]({
            items: [copiedItem]
          });
        }
      }
    };

    TabBarView.prototype.closeOtherTabs = function(active) {
      var j, len, results, tab, tabs;
      tabs = this.getTabs();
      if (active == null) {
        active = this.rightClickedTab;
      }
      if (active == null) {
        return;
      }
      results = [];
      for (j = 0, len = tabs.length; j < len; j++) {
        tab = tabs[j];
        if (tab !== active) {
          results.push(this.closeTab(tab));
        }
      }
      return results;
    };

    TabBarView.prototype.closeTabsToRight = function(active) {
      var i, index, j, len, results, tab, tabs;
      tabs = this.getTabs();
      if (active == null) {
        active = this.rightClickedTab;
      }
      index = tabs.indexOf(active);
      if (index === -1) {
        return;
      }
      results = [];
      for (i = j = 0, len = tabs.length; j < len; i = ++j) {
        tab = tabs[i];
        if (i > index) {
          results.push(this.closeTab(tab));
        }
      }
      return results;
    };

    TabBarView.prototype.closeTabsToLeft = function(active) {
      var i, index, j, len, results, tab, tabs;
      tabs = this.getTabs();
      if (active == null) {
        active = this.rightClickedTab;
      }
      index = tabs.indexOf(active);
      if (index === -1) {
        return;
      }
      results = [];
      for (i = j = 0, len = tabs.length; j < len; i = ++j) {
        tab = tabs[i];
        if (i < index) {
          results.push(this.closeTab(tab));
        }
      }
      return results;
    };

    TabBarView.prototype.closeSavedTabs = function() {
      var base, j, len, ref, results, tab;
      ref = this.getTabs();
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        tab = ref[j];
        if (!(typeof (base = tab.item).isModified === "function" ? base.isModified() : void 0)) {
          results.push(this.closeTab(tab));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    TabBarView.prototype.closeAllTabs = function() {
      var j, len, ref, results, tab;
      ref = this.getTabs();
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        tab = ref[j];
        results.push(this.closeTab(tab));
      }
      return results;
    };

    TabBarView.prototype.getWindowId = function() {
      return this.windowId != null ? this.windowId : this.windowId = atom.getCurrentWindow().id;
    };

    TabBarView.prototype.onDragStart = function(event) {
      var item, itemURI, j, len, location, paneIndex, ref, ref1, ref2, ref3, tabIndex;
      this.draggedTab = this.tabForElement(event.target);
      if (!this.draggedTab) {
        return;
      }
      this.lastDropTargetIndex = null;
      event.dataTransfer.setData('atom-tab-event', 'true');
      this.draggedTab.element.classList.add('is-dragging');
      this.draggedTab.destroyTooltip();
      tabIndex = this.tabs.indexOf(this.draggedTab);
      event.dataTransfer.setData('sortable-index', tabIndex);
      paneIndex = this.paneContainer.getPanes().indexOf(this.pane);
      event.dataTransfer.setData('from-pane-index', paneIndex);
      event.dataTransfer.setData('from-pane-id', this.pane.id);
      event.dataTransfer.setData('from-window-id', this.getWindowId());
      item = this.pane.getItems()[this.tabs.indexOf(this.draggedTab)];
      if (item == null) {
        return;
      }
      if (typeof item.getURI === 'function') {
        itemURI = (ref = item.getURI()) != null ? ref : '';
      } else if (typeof item.getPath === 'function') {
        itemURI = (ref1 = item.getPath()) != null ? ref1 : '';
      } else if (typeof item.getUri === 'function') {
        itemURI = (ref2 = item.getUri()) != null ? ref2 : '';
      }
      if (typeof item.getAllowedLocations === 'function') {
        ref3 = item.getAllowedLocations();
        for (j = 0, len = ref3.length; j < len; j++) {
          location = ref3[j];
          event.dataTransfer.setData("allowed-location-" + location, 'true');
        }
      } else {
        event.dataTransfer.setData('allow-all-locations', 'true');
      }
      if (itemURI != null) {
        event.dataTransfer.setData('text/plain', itemURI);
        if (process.platform === 'darwin') {
          if (!this.uriHasProtocol(itemURI)) {
            itemURI = "file://" + itemURI;
          }
          event.dataTransfer.setData('text/uri-list', itemURI);
        }
        if ((typeof item.isModified === "function" ? item.isModified() : void 0) && (item.getText != null)) {
          event.dataTransfer.setData('has-unsaved-changes', 'true');
          return event.dataTransfer.setData('modified-text', item.getText());
        }
      }
    };

    TabBarView.prototype.uriHasProtocol = function(uri) {
      var error;
      try {
        return require('url').parse(uri).protocol != null;
      } catch (error1) {
        error = error1;
        return false;
      }
    };

    TabBarView.prototype.onDragLeave = function(event) {
      var j, len, ref, results, tab;
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.removePlaceholder();
        this.lastDropTargetIndex = null;
        ref = this.getTabs();
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          tab = ref[j];
          results.push(tab.element.style.maxWidth = '');
        }
        return results;
      }
    };

    TabBarView.prototype.onDragEnd = function(event) {
      if (!this.tabForElement(event.target)) {
        return;
      }
      return this.clearDropTarget();
    };

    TabBarView.prototype.onDragOver = function(event) {
      var newDropTargetIndex, placeholder, sibling, tab, tabs;
      if (!this.isAtomTabEvent(event)) {
        return;
      }
      if (!this.itemIsAllowed(event, this.location)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      newDropTargetIndex = this.getDropTargetIndex(event);
      if (newDropTargetIndex == null) {
        return;
      }
      if (this.lastDropTargetIndex === newDropTargetIndex) {
        return;
      }
      this.lastDropTargetIndex = newDropTargetIndex;
      this.removeDropTargetClasses();
      tabs = this.getTabs();
      placeholder = this.getPlaceholder();
      if (placeholder == null) {
        return;
      }
      if (newDropTargetIndex < tabs.length) {
        tab = tabs[newDropTargetIndex];
        tab.element.classList.add('is-drop-target');
        return tab.element.parentElement.insertBefore(placeholder, tab.element);
      } else {
        if (tab = tabs[newDropTargetIndex - 1]) {
          tab.element.classList.add('drop-target-is-after');
          if (sibling = tab.element.nextSibling) {
            return tab.element.parentElement.insertBefore(placeholder, sibling);
          } else {
            return tab.element.parentElement.appendChild(placeholder);
          }
        }
      }
    };

    TabBarView.prototype.onDropOnOtherWindow = function(event, fromPaneId, fromItemIndex) {
      var itemToRemove;
      if (this.pane.id === fromPaneId) {
        if (itemToRemove = this.pane.getItems()[fromItemIndex]) {
          this.pane.destroyItem(itemToRemove);
        }
      }
      return this.clearDropTarget();
    };

    TabBarView.prototype.clearDropTarget = function() {
      var ref, ref1;
      if ((ref = this.draggedTab) != null) {
        ref.element.classList.remove('is-dragging');
      }
      if ((ref1 = this.draggedTab) != null) {
        ref1.updateTooltip();
      }
      this.draggedTab = null;
      this.removeDropTargetClasses();
      return this.removePlaceholder();
    };

    TabBarView.prototype.onDrop = function(event) {
      var droppedURI, fromIndex, fromPane, fromPaneId, fromPaneIndex, fromWindowId, hasUnsavedChanges, item, modifiedText, toIndex, toPane;
      if (!this.isAtomTabEvent(event)) {
        return;
      }
      event.preventDefault();
      fromWindowId = parseInt(event.dataTransfer.getData('from-window-id'));
      fromPaneId = parseInt(event.dataTransfer.getData('from-pane-id'));
      fromIndex = parseInt(event.dataTransfer.getData('sortable-index'));
      fromPaneIndex = parseInt(event.dataTransfer.getData('from-pane-index'));
      hasUnsavedChanges = event.dataTransfer.getData('has-unsaved-changes') === 'true';
      modifiedText = event.dataTransfer.getData('modified-text');
      toIndex = this.getDropTargetIndex(event);
      toPane = this.pane;
      this.clearDropTarget();
      if (!this.itemIsAllowed(event, this.location)) {
        return;
      }
      if (fromWindowId === this.getWindowId()) {
        fromPane = this.paneContainer.getPanes()[fromPaneIndex];
        if ((fromPane != null ? fromPane.id : void 0) !== fromPaneId) {
          fromPane = Array.from(document.querySelectorAll('atom-pane')).map(function(paneEl) {
            return paneEl.model;
          }).find(function(pane) {
            return pane.id === fromPaneId;
          });
        }
        item = fromPane.getItems()[fromIndex];
        if (item != null) {
          return this.moveItemBetweenPanes(fromPane, fromIndex, toPane, toIndex, item);
        }
      } else {
        droppedURI = event.dataTransfer.getData('text/plain');
        atom.workspace.open(droppedURI).then((function(_this) {
          return function(item) {
            var activeItemIndex, activePane, browserWindow;
            activePane = atom.workspace.getActivePane();
            activeItemIndex = activePane.getItems().indexOf(item);
            _this.moveItemBetweenPanes(activePane, activeItemIndex, toPane, toIndex, item);
            if (hasUnsavedChanges) {
              if (typeof item.setText === "function") {
                item.setText(modifiedText);
              }
            }
            if (!isNaN(fromWindowId)) {
              browserWindow = _this.browserWindowForId(fromWindowId);
              return browserWindow != null ? browserWindow.webContents.send('tab:dropped', fromPaneId, fromIndex) : void 0;
            }
          };
        })(this));
        return atom.focus();
      }
    };

    TabBarView.prototype.onPaneDragEnter = function(event) {
      if (!this.isAtomTabEvent(event)) {
        return;
      }
      if (!this.itemIsAllowed(event, this.location)) {
        return;
      }
      if (this.pane.getItems().length > 1 || atom.config.get('tabs.alwaysShowTabBar')) {
        return;
      }
      if (this.paneElement.contains(event.relatedTarget)) {
        return this.element.classList.remove('hidden');
      }
    };

    TabBarView.prototype.onPaneDragLeave = function(event) {
      if (!this.isAtomTabEvent(event)) {
        return;
      }
      if (!this.itemIsAllowed(event, this.location)) {
        return;
      }
      if (this.pane.getItems().length > 1 || atom.config.get('tabs.alwaysShowTabBar')) {
        return;
      }
      if (!this.paneElement.contains(event.relatedTarget)) {
        return this.element.classList.add('hidden');
      }
    };

    TabBarView.prototype.onMouseWheel = function(event) {
      if (event.shiftKey || !this.tabScrolling) {
        return;
      }
      if (this.wheelDelta == null) {
        this.wheelDelta = 0;
      }
      this.wheelDelta += event.wheelDeltaY;
      if (this.wheelDelta <= -this.tabScrollingThreshold) {
        this.wheelDelta = 0;
        return this.pane.activateNextItem();
      } else if (this.wheelDelta >= this.tabScrollingThreshold) {
        this.wheelDelta = 0;
        return this.pane.activatePreviousItem();
      }
    };

    TabBarView.prototype.onMouseDown = function(event) {
      var tab;
      if (!this.pane.isDestroyed()) {
        this.pane.activate();
      }
      tab = this.tabForElement(event.target);
      if (!tab) {
        return;
      }
      if (event.button === 2 || (event.button === 0 && event.ctrlKey === true)) {
        this.rightClickedTab = tab;
        return event.preventDefault();
      } else if (event.button === 1) {
        return event.preventDefault();
      }
    };

    TabBarView.prototype.onClick = function(event) {
      var tab;
      tab = this.tabForElement(event.target);
      if (!tab) {
        return;
      }
      event.preventDefault();
      if (event.button === 2 || (event.button === 0 && event.ctrlKey === true)) {

      } else if (event.button === 0 && !event.target.classList.contains('close-icon')) {
        return this.pane.activateItem(tab.item);
      } else if (event.button === 1) {
        return this.pane.destroyItem(tab.item);
      }
    };

    TabBarView.prototype.onDoubleClick = function(event) {
      var base, tab;
      if (tab = this.tabForElement(event.target)) {
        return typeof (base = tab.item).terminatePendingState === "function" ? base.terminatePendingState() : void 0;
      } else if (event.target === this.element) {
        atom.commands.dispatch(this.element, 'application:new-file');
        return event.preventDefault();
      }
    };

    TabBarView.prototype.updateTabScrollingThreshold = function(value) {
      return this.tabScrollingThreshold = value;
    };

    TabBarView.prototype.updateTabScrolling = function(value) {
      if (value === 'platform') {
        return this.tabScrolling = process.platform === 'linux';
      } else {
        return this.tabScrolling = value;
      }
    };

    TabBarView.prototype.browserWindowForId = function(id) {
      if (BrowserWindow == null) {
        BrowserWindow = require('electron').remote.BrowserWindow;
      }
      return BrowserWindow.fromId(id);
    };

    TabBarView.prototype.moveItemBetweenPanes = function(fromPane, fromIndex, toPane, toIndex, item) {
      try {
        if (toPane === fromPane) {
          if (fromIndex < toIndex) {
            toIndex--;
          }
          toPane.moveItem(item, toIndex);
        } else {
          this.isItemMovingBetweenPanes = true;
          fromPane.moveItemToPane(item, toPane, toIndex--);
        }
        toPane.activateItem(item);
        return toPane.activate();
      } finally {
        this.isItemMovingBetweenPanes = false;
      }
    };

    TabBarView.prototype.removeDropTargetClasses = function() {
      var dropTarget, j, k, len, len1, ref, ref1, results, workspaceElement;
      workspaceElement = atom.workspace.getElement();
      ref = workspaceElement.querySelectorAll('.tab-bar .is-drop-target');
      for (j = 0, len = ref.length; j < len; j++) {
        dropTarget = ref[j];
        dropTarget.classList.remove('is-drop-target');
      }
      ref1 = workspaceElement.querySelectorAll('.tab-bar .drop-target-is-after');
      results = [];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        dropTarget = ref1[k];
        results.push(dropTarget.classList.remove('drop-target-is-after'));
      }
      return results;
    };

    TabBarView.prototype.getDropTargetIndex = function(event) {
      var elementCenter, elementIndex, left, ref, tab, tabs, target, width;
      target = event.target;
      if (this.isPlaceholder(target)) {
        return;
      }
      tabs = this.getTabs();
      tab = this.tabForElement(target);
      if (tab == null) {
        tab = tabs[tabs.length - 1];
      }
      if (tab == null) {
        return 0;
      }
      ref = tab.element.getBoundingClientRect(), left = ref.left, width = ref.width;
      elementCenter = left + width / 2;
      elementIndex = tabs.indexOf(tab);
      if (event.pageX < elementCenter) {
        return elementIndex;
      } else {
        return elementIndex + 1;
      }
    };

    TabBarView.prototype.getPlaceholder = function() {
      if (this.placeholderEl != null) {
        return this.placeholderEl;
      }
      this.placeholderEl = document.createElement("li");
      this.placeholderEl.classList.add("placeholder");
      return this.placeholderEl;
    };

    TabBarView.prototype.removePlaceholder = function() {
      var ref;
      if ((ref = this.placeholderEl) != null) {
        ref.remove();
      }
      return this.placeholderEl = null;
    };

    TabBarView.prototype.isPlaceholder = function(element) {
      return element.classList.contains('placeholder');
    };

    TabBarView.prototype.onMouseEnter = function() {
      var j, len, ref, tab, width;
      ref = this.getTabs();
      for (j = 0, len = ref.length; j < len; j++) {
        tab = ref[j];
        width = tab.element.getBoundingClientRect().width;
        tab.element.style.maxWidth = width.toFixed(2) + 'px';
      }
    };

    TabBarView.prototype.onMouseLeave = function() {
      var j, len, ref, tab;
      ref = this.getTabs();
      for (j = 0, len = ref.length; j < len; j++) {
        tab = ref[j];
        tab.element.style.maxWidth = '';
      }
    };

    TabBarView.prototype.tabForElement = function(element) {
      var currentElement, tab;
      currentElement = element;
      while (currentElement != null) {
        if (tab = this.tabsByElement.get(currentElement)) {
          return tab;
        } else {
          currentElement = currentElement.parentElement;
        }
      }
    };

    TabBarView.prototype.isAtomTabEvent = function(event) {
      var item, j, len, ref;
      ref = event.dataTransfer.items;
      for (j = 0, len = ref.length; j < len; j++) {
        item = ref[j];
        if (item.type === 'atom-tab-event') {
          return true;
        }
      }
      return false;
    };

    TabBarView.prototype.itemIsAllowed = function(event, location) {
      var item, j, len, ref;
      ref = event.dataTransfer.items;
      for (j = 0, len = ref.length; j < len; j++) {
        item = ref[j];
        if (item.type === 'allow-all-locations' || item.type === ("allowed-location-" + location)) {
          return true;
        }
      }
      return false;
    };

    return TabBarView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvdGFicy9saWIvdGFiLWJhci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsYUFBQSxHQUFnQjs7RUFDZixjQUFlLE9BQUEsQ0FBUSxVQUFSOztFQUVmLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsT0FBQSxHQUFVLE9BQUEsQ0FBUSxZQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxvQkFBQyxLQUFELEVBQVEsU0FBUjtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxXQUFEO01BQ25CLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsSUFBdkI7TUFDWCxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixhQUF2QjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLFNBQXZCO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbkIsQ0FBdUIsYUFBdkI7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBc0IsSUFBdEIsRUFBNEIsV0FBNUI7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBc0IsVUFBdEIsRUFBa0MsQ0FBQyxDQUFuQztNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFBVCxDQUFzQixVQUF0QixFQUFrQyxJQUFDLENBQUEsUUFBbkM7TUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRO01BQ1IsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BRXJCLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxD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O0FBSUEsYUFBTztJQUxNOzs7OztBQXhpQmpCIiwic291cmNlc0NvbnRlbnQiOlsiQnJvd3NlcldpbmRvdyA9IG51bGwgIyBEZWZlciByZXF1aXJlIHVudGlsIGFjdHVhbGx5IHVzZWRcbntpcGNSZW5kZXJlcn0gPSByZXF1aXJlICdlbGVjdHJvbidcblxue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblRhYlZpZXcgPSByZXF1aXJlICcuL3RhYi12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBUYWJCYXJWaWV3XG4gIGNvbnN0cnVjdG9yOiAoQHBhbmUsIEBsb2NhdGlvbikgLT5cbiAgICBAZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJylcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibGlzdC1pbmxpbmVcIilcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwidGFiLWJhclwiKVxuICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJpbnNldC1wYW5lbFwiKVxuICAgIEBlbGVtZW50LnNldEF0dHJpYnV0ZSgnaXMnLCAnYXRvbS10YWJzJylcbiAgICBAZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCAtMSlcbiAgICBAZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJsb2NhdGlvblwiLCBAbG9jYXRpb24pXG5cbiAgICBAdGFicyA9IFtdXG4gICAgQHRhYnNCeUVsZW1lbnQgPSBuZXcgV2Vha01hcFxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIEBwYW5lRWxlbWVudCA9IEBwYW5lLmdldEVsZW1lbnQoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIEBwYW5lRWxlbWVudCxcbiAgICAgICd0YWJzOmtlZXAtcGVuZGluZy10YWInOiA9PiBAdGVybWluYXRlUGVuZGluZ1N0YXRlcygpXG4gICAgICAndGFiczpjbG9zZS10YWInOiA9PiBAY2xvc2VUYWIoQGdldEFjdGl2ZVRhYigpKVxuICAgICAgJ3RhYnM6Y2xvc2Utb3RoZXItdGFicyc6ID0+IEBjbG9zZU90aGVyVGFicyhAZ2V0QWN0aXZlVGFiKCkpXG4gICAgICAndGFiczpjbG9zZS10YWJzLXRvLXJpZ2h0JzogPT4gQGNsb3NlVGFic1RvUmlnaHQoQGdldEFjdGl2ZVRhYigpKVxuICAgICAgJ3RhYnM6Y2xvc2UtdGFicy10by1sZWZ0JzogPT4gQGNsb3NlVGFic1RvTGVmdChAZ2V0QWN0aXZlVGFiKCkpXG4gICAgICAndGFiczpjbG9zZS1zYXZlZC10YWJzJzogPT4gQGNsb3NlU2F2ZWRUYWJzKClcbiAgICAgICd0YWJzOmNsb3NlLWFsbC10YWJzJzogKGV2ZW50KSA9PlxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBAY2xvc2VBbGxUYWJzKClcbiAgICAgICd0YWJzOm9wZW4taW4tbmV3LXdpbmRvdyc6ID0+IEBvcGVuSW5OZXdXaW5kb3coKVxuXG4gICAgYWRkRWxlbWVudENvbW1hbmRzID0gKGNvbW1hbmRzKSA9PlxuICAgICAgY29tbWFuZHNXaXRoUHJvcGFnYXRpb25TdG9wcGVkID0ge31cbiAgICAgIE9iamVjdC5rZXlzKGNvbW1hbmRzKS5mb3JFYWNoIChuYW1lKSAtPlxuICAgICAgICBjb21tYW5kc1dpdGhQcm9wYWdhdGlvblN0b3BwZWRbbmFtZV0gPSAoZXZlbnQpIC0+XG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICBjb21tYW5kc1tuYW1lXSgpXG5cbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChAZWxlbWVudCwgY29tbWFuZHNXaXRoUHJvcGFnYXRpb25TdG9wcGVkKSlcblxuICAgIGFkZEVsZW1lbnRDb21tYW5kc1xuICAgICAgJ3RhYnM6Y2xvc2UtdGFiJzogPT4gQGNsb3NlVGFiKClcbiAgICAgICd0YWJzOmNsb3NlLW90aGVyLXRhYnMnOiA9PiBAY2xvc2VPdGhlclRhYnMoKVxuICAgICAgJ3RhYnM6Y2xvc2UtdGFicy10by1yaWdodCc6ID0+IEBjbG9zZVRhYnNUb1JpZ2h0KClcbiAgICAgICd0YWJzOmNsb3NlLXRhYnMtdG8tbGVmdCc6ID0+IEBjbG9zZVRhYnNUb0xlZnQoKVxuICAgICAgJ3RhYnM6Y2xvc2Utc2F2ZWQtdGFicyc6ID0+IEBjbG9zZVNhdmVkVGFicygpXG4gICAgICAndGFiczpjbG9zZS1hbGwtdGFicyc6ID0+IEBjbG9zZUFsbFRhYnMoKVxuICAgICAgJ3RhYnM6c3BsaXQtdXAnOiA9PiBAc3BsaXRUYWIoJ3NwbGl0VXAnKVxuICAgICAgJ3RhYnM6c3BsaXQtZG93bic6ID0+IEBzcGxpdFRhYignc3BsaXREb3duJylcbiAgICAgICd0YWJzOnNwbGl0LWxlZnQnOiA9PiBAc3BsaXRUYWIoJ3NwbGl0TGVmdCcpXG4gICAgICAndGFiczpzcGxpdC1yaWdodCc6ID0+IEBzcGxpdFRhYignc3BsaXRSaWdodCcpXG5cbiAgICBAZWxlbWVudC5hZGRFdmVudExpc3RlbmVyIFwibW91c2VlbnRlclwiLCBAb25Nb3VzZUVudGVyLmJpbmQodGhpcylcbiAgICBAZWxlbWVudC5hZGRFdmVudExpc3RlbmVyIFwibW91c2VsZWF2ZVwiLCBAb25Nb3VzZUxlYXZlLmJpbmQodGhpcylcbiAgICBAZWxlbWVudC5hZGRFdmVudExpc3RlbmVyIFwibW91c2V3aGVlbFwiLCBAb25Nb3VzZVdoZWVsLmJpbmQodGhpcylcbiAgICBAZWxlbWVudC5hZGRFdmVudExpc3RlbmVyIFwiZHJhZ3N0YXJ0XCIsIEBvbkRyYWdTdGFydC5iaW5kKHRoaXMpXG4gICAgQGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcImRyYWdlbmRcIiwgQG9uRHJhZ0VuZC5iaW5kKHRoaXMpXG4gICAgQGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcImRyYWdsZWF2ZVwiLCBAb25EcmFnTGVhdmUuYmluZCh0aGlzKVxuICAgIEBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJkcmFnb3ZlclwiLCBAb25EcmFnT3Zlci5iaW5kKHRoaXMpXG4gICAgQGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcImRyb3BcIiwgQG9uRHJvcC5iaW5kKHRoaXMpXG5cbiAgICAjIFRvZ2dsZSB0aGUgdGFiIGJhciB3aGVuIGEgdGFiIGlzIGRyYWdnZWQgb3ZlciB0aGUgcGFuZSB3aXRoIGFsd2F5c1Nob3dUYWJCYXIgPSBmYWxzZVxuICAgIEBwYW5lRWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdkcmFnZW50ZXInLCBAb25QYW5lRHJhZ0VudGVyLmJpbmQodGhpcylcbiAgICBAcGFuZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnZHJhZ2xlYXZlJywgQG9uUGFuZURyYWdMZWF2ZS5iaW5kKHRoaXMpXG5cbiAgICBAcGFuZUNvbnRhaW5lciA9IEBwYW5lLmdldENvbnRhaW5lcigpXG4gICAgQGFkZFRhYkZvckl0ZW0oaXRlbSkgZm9yIGl0ZW0gaW4gQHBhbmUuZ2V0SXRlbXMoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBwYW5lLm9uRGlkRGVzdHJveSA9PlxuICAgICAgQGRlc3Ryb3koKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBwYW5lLm9uRGlkQWRkSXRlbSAoe2l0ZW0sIGluZGV4fSkgPT5cbiAgICAgIEBhZGRUYWJGb3JJdGVtKGl0ZW0sIGluZGV4KVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBwYW5lLm9uRGlkTW92ZUl0ZW0gKHtpdGVtLCBuZXdJbmRleH0pID0+XG4gICAgICBAbW92ZUl0ZW1UYWJUb0luZGV4KGl0ZW0sIG5ld0luZGV4KVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBwYW5lLm9uRGlkUmVtb3ZlSXRlbSAoe2l0ZW19KSA9PlxuICAgICAgQHJlbW92ZVRhYkZvckl0ZW0oaXRlbSlcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAcGFuZS5vbkRpZENoYW5nZUFjdGl2ZUl0ZW0gKGl0ZW0pID0+XG4gICAgICBAdXBkYXRlQWN0aXZlVGFiKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICd0YWJzLnRhYlNjcm9sbGluZycsICh2YWx1ZSkgPT4gQHVwZGF0ZVRhYlNjcm9sbGluZyh2YWx1ZSlcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAndGFicy50YWJTY3JvbGxpbmdUaHJlc2hvbGQnLCAodmFsdWUpID0+IEB1cGRhdGVUYWJTY3JvbGxpbmdUaHJlc2hvbGQodmFsdWUpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3RhYnMuYWx3YXlzU2hvd1RhYkJhcicsID0+IEB1cGRhdGVUYWJCYXJWaXNpYmlsaXR5KClcblxuICAgIEB1cGRhdGVBY3RpdmVUYWIoKVxuXG4gICAgQGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcIm1vdXNlZG93blwiLCBAb25Nb3VzZURvd24uYmluZCh0aGlzKVxuICAgIEBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJjbGlja1wiLCBAb25DbGljay5iaW5kKHRoaXMpXG4gICAgQGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcImF1eGNsaWNrXCIsIEBvbkNsaWNrLmJpbmQodGhpcylcbiAgICBAZWxlbWVudC5hZGRFdmVudExpc3RlbmVyIFwiZGJsY2xpY2tcIiwgQG9uRG91YmxlQ2xpY2suYmluZCh0aGlzKVxuXG4gICAgQG9uRHJvcE9uT3RoZXJXaW5kb3cgPSBAb25Ecm9wT25PdGhlcldpbmRvdy5iaW5kKHRoaXMpXG4gICAgaXBjUmVuZGVyZXIub24oJ3RhYjpkcm9wcGVkJywgQG9uRHJvcE9uT3RoZXJXaW5kb3cpXG5cbiAgZGVzdHJveTogLT5cbiAgICBpcGNSZW5kZXJlci5yZW1vdmVMaXN0ZW5lcigndGFiOmRyb3BwZWQnLCBAb25Ecm9wT25PdGhlcldpbmRvdylcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAZWxlbWVudC5yZW1vdmUoKVxuXG4gIHRlcm1pbmF0ZVBlbmRpbmdTdGF0ZXM6IC0+XG4gICAgdGFiLnRlcm1pbmF0ZVBlbmRpbmdTdGF0ZT8oKSBmb3IgdGFiIGluIEBnZXRUYWJzKClcbiAgICByZXR1cm5cblxuICBhZGRUYWJGb3JJdGVtOiAoaXRlbSwgaW5kZXgpIC0+XG4gICAgdGFiVmlldyA9IG5ldyBUYWJWaWV3KHtcbiAgICAgIGl0ZW0sXG4gICAgICBAcGFuZSxcbiAgICAgIEB0YWJzLFxuICAgICAgZGlkQ2xpY2tDbG9zZUljb246ID0+XG4gICAgICAgIEBjbG9zZVRhYih0YWJWaWV3KVxuICAgICAgICByZXR1cm5cbiAgICAgIEBsb2NhdGlvblxuICAgIH0pXG4gICAgdGFiVmlldy50ZXJtaW5hdGVQZW5kaW5nU3RhdGUoKSBpZiBAaXNJdGVtTW92aW5nQmV0d2VlblBhbmVzXG4gICAgQHRhYnNCeUVsZW1lbnQuc2V0KHRhYlZpZXcuZWxlbWVudCwgdGFiVmlldylcbiAgICBAaW5zZXJ0VGFiQXRJbmRleCh0YWJWaWV3LCBpbmRleClcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3RhYnMuYWRkTmV3VGFic0F0RW5kJylcbiAgICAgIEBwYW5lLm1vdmVJdGVtKGl0ZW0sIEBwYW5lLmdldEl0ZW1zKCkubGVuZ3RoIC0gMSkgdW5sZXNzIEBpc0l0ZW1Nb3ZpbmdCZXR3ZWVuUGFuZXNcblxuICBtb3ZlSXRlbVRhYlRvSW5kZXg6IChpdGVtLCBpbmRleCkgLT5cbiAgICB0YWJJbmRleCA9IEB0YWJzLmZpbmRJbmRleCgodCkgLT4gdC5pdGVtIGlzIGl0ZW0pXG4gICAgaWYgdGFiSW5kZXggaXNudCAtMVxuICAgICAgdGFiID0gQHRhYnNbdGFiSW5kZXhdXG4gICAgICB0YWIuZWxlbWVudC5yZW1vdmUoKVxuICAgICAgQHRhYnMuc3BsaWNlKHRhYkluZGV4LCAxKVxuICAgICAgQGluc2VydFRhYkF0SW5kZXgodGFiLCBpbmRleClcblxuICBpbnNlcnRUYWJBdEluZGV4OiAodGFiLCBpbmRleCkgLT5cbiAgICBmb2xsb3dpbmdUYWIgPSBAdGFic1tpbmRleF0gaWYgaW5kZXg/XG4gICAgaWYgZm9sbG93aW5nVGFiXG4gICAgICBAZWxlbWVudC5pbnNlcnRCZWZvcmUodGFiLmVsZW1lbnQsIGZvbGxvd2luZ1RhYi5lbGVtZW50KVxuICAgICAgQHRhYnMuc3BsaWNlKGluZGV4LCAwLCB0YWIpXG4gICAgZWxzZVxuICAgICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQodGFiLmVsZW1lbnQpXG4gICAgICBAdGFicy5wdXNoKHRhYilcblxuICAgIHRhYi51cGRhdGVUaXRsZSgpXG4gICAgQHVwZGF0ZVRhYkJhclZpc2liaWxpdHkoKVxuXG4gIHJlbW92ZVRhYkZvckl0ZW06IChpdGVtKSAtPlxuICAgIHRhYkluZGV4ID0gQHRhYnMuZmluZEluZGV4KCh0KSAtPiB0Lml0ZW0gaXMgaXRlbSlcbiAgICBpZiB0YWJJbmRleCBpc250IC0xXG4gICAgICB0YWIgPSBAdGFic1t0YWJJbmRleF1cbiAgICAgIEB0YWJzLnNwbGljZSh0YWJJbmRleCwgMSlcbiAgICAgIEB0YWJzQnlFbGVtZW50LmRlbGV0ZSh0YWIpXG4gICAgICB0YWIuZGVzdHJveSgpXG4gICAgdGFiLnVwZGF0ZVRpdGxlKCkgZm9yIHRhYiBpbiBAZ2V0VGFicygpXG4gICAgQHVwZGF0ZVRhYkJhclZpc2liaWxpdHkoKVxuXG4gIHVwZGF0ZVRhYkJhclZpc2liaWxpdHk6IC0+XG4gICAgIyBTaG93IHRhYiBiYXIgaWYgdGhlIHNldHRpbmcgaXMgdHJ1ZSBvciB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIHRhYlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgndGFicy5hbHdheXNTaG93VGFiQmFyJykgb3IgQHBhbmUuZ2V0SXRlbXMoKS5sZW5ndGggPiAxXG4gICAgICBAZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxuICAgIGVsc2VcbiAgICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXG5cbiAgZ2V0VGFiczogLT5cbiAgICBAdGFicy5zbGljZSgpXG5cbiAgdGFiQXRJbmRleDogKGluZGV4KSAtPlxuICAgIEB0YWJzW2luZGV4XVxuXG4gIHRhYkZvckl0ZW06IChpdGVtKSAtPlxuICAgIEB0YWJzLmZpbmQoKHQpIC0+IHQuaXRlbSBpcyBpdGVtKVxuXG4gIHNldEFjdGl2ZVRhYjogKHRhYlZpZXcpIC0+XG4gICAgaWYgdGFiVmlldz8gYW5kIHRhYlZpZXcgaXNudCBAYWN0aXZlVGFiXG4gICAgICBAYWN0aXZlVGFiPy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpXG4gICAgICBAYWN0aXZlVGFiID0gdGFiVmlld1xuICAgICAgQGFjdGl2ZVRhYi5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXG4gICAgICBAYWN0aXZlVGFiLmVsZW1lbnQuc2Nyb2xsSW50b1ZpZXcoZmFsc2UpXG5cbiAgZ2V0QWN0aXZlVGFiOiAtPlxuICAgIEB0YWJGb3JJdGVtKEBwYW5lLmdldEFjdGl2ZUl0ZW0oKSlcblxuICB1cGRhdGVBY3RpdmVUYWI6IC0+XG4gICAgQHNldEFjdGl2ZVRhYihAdGFiRm9ySXRlbShAcGFuZS5nZXRBY3RpdmVJdGVtKCkpKVxuXG4gIGNsb3NlVGFiOiAodGFiKSAtPlxuICAgIHRhYiA/PSBAcmlnaHRDbGlja2VkVGFiXG4gICAgQHBhbmUuZGVzdHJveUl0ZW0odGFiLml0ZW0pIGlmIHRhYj9cblxuICBvcGVuSW5OZXdXaW5kb3c6ICh0YWIpIC0+XG4gICAgdGFiID89IEByaWdodENsaWNrZWRUYWJcbiAgICBpdGVtID0gdGFiPy5pdGVtXG4gICAgcmV0dXJuIHVubGVzcyBpdGVtP1xuICAgIGlmIHR5cGVvZiBpdGVtLmdldFVSSSBpcyAnZnVuY3Rpb24nXG4gICAgICBpdGVtVVJJID0gaXRlbS5nZXRVUkkoKVxuICAgIGVsc2UgaWYgdHlwZW9mIGl0ZW0uZ2V0UGF0aCBpcyAnZnVuY3Rpb24nXG4gICAgICBpdGVtVVJJID0gaXRlbS5nZXRQYXRoKClcbiAgICBlbHNlIGlmIHR5cGVvZiBpdGVtLmdldFVyaSBpcyAnZnVuY3Rpb24nXG4gICAgICBpdGVtVVJJID0gaXRlbS5nZXRVcmkoKVxuICAgIHJldHVybiB1bmxlc3MgaXRlbVVSST9cbiAgICBAY2xvc2VUYWIodGFiKVxuICAgIHRhYi5lbGVtZW50LnN0eWxlLm1heFdpZHRoID0gJycgZm9yIHRhYiBpbiBAZ2V0VGFicygpXG4gICAgcGF0aHNUb09wZW4gPSBbYXRvbS5wcm9qZWN0LmdldFBhdGhzKCksIGl0ZW1VUkldLnJlZHVjZSAoKGEsIGIpIC0+IGEuY29uY2F0KGIpKSwgW11cbiAgICBhdG9tLm9wZW4oe3BhdGhzVG9PcGVuOiBwYXRoc1RvT3BlbiwgbmV3V2luZG93OiB0cnVlLCBkZXZNb2RlOiBhdG9tLmRldk1vZGUsIHNhZmVNb2RlOiBhdG9tLnNhZmVNb2RlfSlcblxuICBzcGxpdFRhYjogKGZuKSAtPlxuICAgIGlmIGl0ZW0gPSBAcmlnaHRDbGlja2VkVGFiPy5pdGVtXG4gICAgICBpZiBjb3BpZWRJdGVtID0gaXRlbS5jb3B5PygpXG4gICAgICAgIEBwYW5lW2ZuXShpdGVtczogW2NvcGllZEl0ZW1dKVxuXG4gIGNsb3NlT3RoZXJUYWJzOiAoYWN0aXZlKSAtPlxuICAgIHRhYnMgPSBAZ2V0VGFicygpXG4gICAgYWN0aXZlID89IEByaWdodENsaWNrZWRUYWJcbiAgICByZXR1cm4gdW5sZXNzIGFjdGl2ZT9cbiAgICBAY2xvc2VUYWIgdGFiIGZvciB0YWIgaW4gdGFicyB3aGVuIHRhYiBpc250IGFjdGl2ZVxuXG4gIGNsb3NlVGFic1RvUmlnaHQ6IChhY3RpdmUpIC0+XG4gICAgdGFicyA9IEBnZXRUYWJzKClcbiAgICBhY3RpdmUgPz0gQHJpZ2h0Q2xpY2tlZFRhYlxuICAgIGluZGV4ID0gdGFicy5pbmRleE9mKGFjdGl2ZSlcbiAgICByZXR1cm4gaWYgaW5kZXggaXMgLTFcbiAgICBAY2xvc2VUYWIgdGFiIGZvciB0YWIsIGkgaW4gdGFicyB3aGVuIGkgPiBpbmRleFxuXG4gIGNsb3NlVGFic1RvTGVmdDogKGFjdGl2ZSkgLT5cbiAgICB0YWJzID0gQGdldFRhYnMoKVxuICAgIGFjdGl2ZSA/PSBAcmlnaHRDbGlja2VkVGFiXG4gICAgaW5kZXggPSB0YWJzLmluZGV4T2YoYWN0aXZlKVxuICAgIHJldHVybiBpZiBpbmRleCBpcyAtMVxuICAgIEBjbG9zZVRhYiB0YWIgZm9yIHRhYiwgaSBpbiB0YWJzIHdoZW4gaSA8IGluZGV4XG5cbiAgY2xvc2VTYXZlZFRhYnM6IC0+XG4gICAgZm9yIHRhYiBpbiBAZ2V0VGFicygpXG4gICAgICBAY2xvc2VUYWIodGFiKSB1bmxlc3MgdGFiLml0ZW0uaXNNb2RpZmllZD8oKVxuXG4gIGNsb3NlQWxsVGFiczogLT5cbiAgICBAY2xvc2VUYWIodGFiKSBmb3IgdGFiIGluIEBnZXRUYWJzKClcblxuICBnZXRXaW5kb3dJZDogLT5cbiAgICBAd2luZG93SWQgPz0gYXRvbS5nZXRDdXJyZW50V2luZG93KCkuaWRcblxuICBvbkRyYWdTdGFydDogKGV2ZW50KSAtPlxuICAgIEBkcmFnZ2VkVGFiID0gQHRhYkZvckVsZW1lbnQoZXZlbnQudGFyZ2V0KVxuICAgIHJldHVybiB1bmxlc3MgQGRyYWdnZWRUYWJcbiAgICBAbGFzdERyb3BUYXJnZXRJbmRleCA9IG51bGxcblxuICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICdhdG9tLXRhYi1ldmVudCcsICd0cnVlJ1xuXG4gICAgQGRyYWdnZWRUYWIuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1kcmFnZ2luZycpXG4gICAgQGRyYWdnZWRUYWIuZGVzdHJveVRvb2x0aXAoKVxuXG4gICAgdGFiSW5kZXggPSBAdGFicy5pbmRleE9mKEBkcmFnZ2VkVGFiKVxuICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICdzb3J0YWJsZS1pbmRleCcsIHRhYkluZGV4XG5cbiAgICBwYW5lSW5kZXggPSBAcGFuZUNvbnRhaW5lci5nZXRQYW5lcygpLmluZGV4T2YoQHBhbmUpXG4gICAgZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEgJ2Zyb20tcGFuZS1pbmRleCcsIHBhbmVJbmRleFxuICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICdmcm9tLXBhbmUtaWQnLCBAcGFuZS5pZFxuICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICdmcm9tLXdpbmRvdy1pZCcsIEBnZXRXaW5kb3dJZCgpXG5cbiAgICBpdGVtID0gQHBhbmUuZ2V0SXRlbXMoKVtAdGFicy5pbmRleE9mKEBkcmFnZ2VkVGFiKV1cbiAgICByZXR1cm4gdW5sZXNzIGl0ZW0/XG5cbiAgICBpZiB0eXBlb2YgaXRlbS5nZXRVUkkgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgaXRlbVVSSSA9IGl0ZW0uZ2V0VVJJKCkgPyAnJ1xuICAgIGVsc2UgaWYgdHlwZW9mIGl0ZW0uZ2V0UGF0aCBpcyAnZnVuY3Rpb24nXG4gICAgICBpdGVtVVJJID0gaXRlbS5nZXRQYXRoKCkgPyAnJ1xuICAgIGVsc2UgaWYgdHlwZW9mIGl0ZW0uZ2V0VXJpIGlzICdmdW5jdGlvbidcbiAgICAgIGl0ZW1VUkkgPSBpdGVtLmdldFVyaSgpID8gJydcblxuICAgIGlmIHR5cGVvZiBpdGVtLmdldEFsbG93ZWRMb2NhdGlvbnMgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgZm9yIGxvY2F0aW9uIGluIGl0ZW0uZ2V0QWxsb3dlZExvY2F0aW9ucygpXG4gICAgICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhKFwiYWxsb3dlZC1sb2NhdGlvbi0je2xvY2F0aW9ufVwiLCAndHJ1ZScpXG4gICAgZWxzZVxuICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEgJ2FsbG93LWFsbC1sb2NhdGlvbnMnLCAndHJ1ZSdcblxuICAgIGlmIGl0ZW1VUkk/XG4gICAgICBldmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSAndGV4dC9wbGFpbicsIGl0ZW1VUklcblxuICAgICAgaWYgcHJvY2Vzcy5wbGF0Zm9ybSBpcyAnZGFyd2luJyAjIHNlZSAjNjlcbiAgICAgICAgaXRlbVVSSSA9IFwiZmlsZTovLyN7aXRlbVVSSX1cIiB1bmxlc3MgQHVyaUhhc1Byb3RvY29sKGl0ZW1VUkkpXG4gICAgICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICd0ZXh0L3VyaS1saXN0JywgaXRlbVVSSVxuXG4gICAgICBpZiBpdGVtLmlzTW9kaWZpZWQ/KCkgYW5kIGl0ZW0uZ2V0VGV4dD9cbiAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEgJ2hhcy11bnNhdmVkLWNoYW5nZXMnLCAndHJ1ZSdcbiAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEgJ21vZGlmaWVkLXRleHQnLCBpdGVtLmdldFRleHQoKVxuXG4gIHVyaUhhc1Byb3RvY29sOiAodXJpKSAtPlxuICAgIHRyeVxuICAgICAgcmVxdWlyZSgndXJsJykucGFyc2UodXJpKS5wcm90b2NvbD9cbiAgICBjYXRjaCBlcnJvclxuICAgICAgZmFsc2VcblxuICBvbkRyYWdMZWF2ZTogKGV2ZW50KSAtPlxuICAgICMgRG8gbm90IGRvIGFueXRoaW5nIHVubGVzcyB0aGUgZHJhZyBnb2VzIG91dHNpZGUgdGhlIHRhYiBiYXJcbiAgICB1bmxlc3MgZXZlbnQuY3VycmVudFRhcmdldC5jb250YWlucyhldmVudC5yZWxhdGVkVGFyZ2V0KVxuICAgICAgQHJlbW92ZVBsYWNlaG9sZGVyKClcbiAgICAgIEBsYXN0RHJvcFRhcmdldEluZGV4ID0gbnVsbFxuICAgICAgdGFiLmVsZW1lbnQuc3R5bGUubWF4V2lkdGggPSAnJyBmb3IgdGFiIGluIEBnZXRUYWJzKClcblxuICBvbkRyYWdFbmQ6IChldmVudCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEB0YWJGb3JFbGVtZW50KGV2ZW50LnRhcmdldClcblxuICAgIEBjbGVhckRyb3BUYXJnZXQoKVxuXG4gIG9uRHJhZ092ZXI6IChldmVudCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc0F0b21UYWJFdmVudChldmVudClcbiAgICByZXR1cm4gdW5sZXNzIEBpdGVtSXNBbGxvd2VkKGV2ZW50LCBAbG9jYXRpb24pXG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIG5ld0Ryb3BUYXJnZXRJbmRleCA9IEBnZXREcm9wVGFyZ2V0SW5kZXgoZXZlbnQpXG4gICAgcmV0dXJuIHVubGVzcyBuZXdEcm9wVGFyZ2V0SW5kZXg/XG4gICAgcmV0dXJuIGlmIEBsYXN0RHJvcFRhcmdldEluZGV4IGlzIG5ld0Ryb3BUYXJnZXRJbmRleFxuICAgIEBsYXN0RHJvcFRhcmdldEluZGV4ID0gbmV3RHJvcFRhcmdldEluZGV4XG5cbiAgICBAcmVtb3ZlRHJvcFRhcmdldENsYXNzZXMoKVxuXG4gICAgdGFicyA9IEBnZXRUYWJzKClcbiAgICBwbGFjZWhvbGRlciA9IEBnZXRQbGFjZWhvbGRlcigpXG4gICAgcmV0dXJuIHVubGVzcyBwbGFjZWhvbGRlcj9cblxuICAgIGlmIG5ld0Ryb3BUYXJnZXRJbmRleCA8IHRhYnMubGVuZ3RoXG4gICAgICB0YWIgPSB0YWJzW25ld0Ryb3BUYXJnZXRJbmRleF1cbiAgICAgIHRhYi5lbGVtZW50LmNsYXNzTGlzdC5hZGQgJ2lzLWRyb3AtdGFyZ2V0J1xuICAgICAgdGFiLmVsZW1lbnQucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUocGxhY2Vob2xkZXIsIHRhYi5lbGVtZW50KVxuICAgIGVsc2VcbiAgICAgIGlmIHRhYiA9IHRhYnNbbmV3RHJvcFRhcmdldEluZGV4IC0gMV1cbiAgICAgICAgdGFiLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCAnZHJvcC10YXJnZXQtaXMtYWZ0ZXInXG4gICAgICAgIGlmIHNpYmxpbmcgPSB0YWIuZWxlbWVudC5uZXh0U2libGluZ1xuICAgICAgICAgIHRhYi5lbGVtZW50LnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHBsYWNlaG9sZGVyLCBzaWJsaW5nKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdGFiLmVsZW1lbnQucGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZChwbGFjZWhvbGRlcilcblxuICBvbkRyb3BPbk90aGVyV2luZG93OiAoZXZlbnQsIGZyb21QYW5lSWQsIGZyb21JdGVtSW5kZXgpIC0+XG4gICAgaWYgQHBhbmUuaWQgaXMgZnJvbVBhbmVJZFxuICAgICAgaWYgaXRlbVRvUmVtb3ZlID0gQHBhbmUuZ2V0SXRlbXMoKVtmcm9tSXRlbUluZGV4XVxuICAgICAgICBAcGFuZS5kZXN0cm95SXRlbShpdGVtVG9SZW1vdmUpXG5cbiAgICBAY2xlYXJEcm9wVGFyZ2V0KClcblxuICBjbGVhckRyb3BUYXJnZXQ6IC0+XG4gICAgQGRyYWdnZWRUYWI/LmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtZHJhZ2dpbmcnKVxuICAgIEBkcmFnZ2VkVGFiPy51cGRhdGVUb29sdGlwKClcbiAgICBAZHJhZ2dlZFRhYiA9IG51bGxcbiAgICBAcmVtb3ZlRHJvcFRhcmdldENsYXNzZXMoKVxuICAgIEByZW1vdmVQbGFjZWhvbGRlcigpXG5cbiAgb25Ecm9wOiAoZXZlbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXNBdG9tVGFiRXZlbnQoZXZlbnQpXG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBmcm9tV2luZG93SWQgID0gcGFyc2VJbnQoZXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ2Zyb20td2luZG93LWlkJykpXG4gICAgZnJvbVBhbmVJZCAgICA9IHBhcnNlSW50KGV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKCdmcm9tLXBhbmUtaWQnKSlcbiAgICBmcm9tSW5kZXggICAgID0gcGFyc2VJbnQoZXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3NvcnRhYmxlLWluZGV4JykpXG4gICAgZnJvbVBhbmVJbmRleCA9IHBhcnNlSW50KGV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKCdmcm9tLXBhbmUtaW5kZXgnKSlcblxuICAgIGhhc1Vuc2F2ZWRDaGFuZ2VzID0gZXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ2hhcy11bnNhdmVkLWNoYW5nZXMnKSBpcyAndHJ1ZSdcbiAgICBtb2RpZmllZFRleHQgPSBldmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgnbW9kaWZpZWQtdGV4dCcpXG5cbiAgICB0b0luZGV4ID0gQGdldERyb3BUYXJnZXRJbmRleChldmVudClcbiAgICB0b1BhbmUgPSBAcGFuZVxuXG4gICAgQGNsZWFyRHJvcFRhcmdldCgpXG5cbiAgICByZXR1cm4gdW5sZXNzIEBpdGVtSXNBbGxvd2VkKGV2ZW50LCBAbG9jYXRpb24pXG5cbiAgICBpZiBmcm9tV2luZG93SWQgaXMgQGdldFdpbmRvd0lkKClcbiAgICAgIGZyb21QYW5lID0gQHBhbmVDb250YWluZXIuZ2V0UGFuZXMoKVtmcm9tUGFuZUluZGV4XVxuICAgICAgaWYgZnJvbVBhbmU/LmlkIGlzbnQgZnJvbVBhbmVJZFxuICAgICAgICAjIElmIGRyYWdnaW5nIGZyb20gYSBkaWZmZXJlbnQgcGFuZSBjb250YWluZXIsIHdlIGhhdmUgdG8gYmUgbW9yZVxuICAgICAgICAjIGV4aGF1c3RpdmUgaW4gb3VyIHNlYXJjaC5cbiAgICAgICAgZnJvbVBhbmUgPSBBcnJheS5mcm9tIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2F0b20tcGFuZScpXG4gICAgICAgICAgLm1hcCAocGFuZUVsKSAtPiBwYW5lRWwubW9kZWxcbiAgICAgICAgICAuZmluZCAocGFuZSkgLT4gcGFuZS5pZCBpcyBmcm9tUGFuZUlkXG4gICAgICBpdGVtID0gZnJvbVBhbmUuZ2V0SXRlbXMoKVtmcm9tSW5kZXhdXG4gICAgICBAbW92ZUl0ZW1CZXR3ZWVuUGFuZXMoZnJvbVBhbmUsIGZyb21JbmRleCwgdG9QYW5lLCB0b0luZGV4LCBpdGVtKSBpZiBpdGVtP1xuICAgIGVsc2VcbiAgICAgIGRyb3BwZWRVUkkgPSBldmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGV4dC9wbGFpbicpXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGRyb3BwZWRVUkkpLnRoZW4gKGl0ZW0pID0+XG4gICAgICAgICMgTW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBwYW5lIGl0IHdhcyBvcGVuZWQgb24gdG8gdGhlIHRhcmdldCBwYW5lXG4gICAgICAgICMgd2hlcmUgaXQgd2FzIGRyb3BwZWQgb250b1xuICAgICAgICBhY3RpdmVQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIGFjdGl2ZUl0ZW1JbmRleCA9IGFjdGl2ZVBhbmUuZ2V0SXRlbXMoKS5pbmRleE9mKGl0ZW0pXG4gICAgICAgIEBtb3ZlSXRlbUJldHdlZW5QYW5lcyhhY3RpdmVQYW5lLCBhY3RpdmVJdGVtSW5kZXgsIHRvUGFuZSwgdG9JbmRleCwgaXRlbSlcbiAgICAgICAgaXRlbS5zZXRUZXh0Pyhtb2RpZmllZFRleHQpIGlmIGhhc1Vuc2F2ZWRDaGFuZ2VzXG5cbiAgICAgICAgaWYgbm90IGlzTmFOKGZyb21XaW5kb3dJZClcbiAgICAgICAgICAjIExldCB0aGUgd2luZG93IHdoZXJlIHRoZSBkcmFnIHN0YXJ0ZWQga25vdyB0aGF0IHRoZSB0YWIgd2FzIGRyb3BwZWRcbiAgICAgICAgICBicm93c2VyV2luZG93ID0gQGJyb3dzZXJXaW5kb3dGb3JJZChmcm9tV2luZG93SWQpXG4gICAgICAgICAgYnJvd3NlcldpbmRvdz8ud2ViQ29udGVudHMuc2VuZCgndGFiOmRyb3BwZWQnLCBmcm9tUGFuZUlkLCBmcm9tSW5kZXgpXG5cbiAgICAgIGF0b20uZm9jdXMoKVxuXG4gICMgU2hvdyB0aGUgdGFiIGJhciB3aGVuIGEgdGFiIGlzIGJlaW5nIGRyYWdnZWQgaW4gdGhpcyBwYW5lIHdoZW4gYWx3YXlzU2hvd1RhYkJhciA9IGZhbHNlXG4gIG9uUGFuZURyYWdFbnRlcjogKGV2ZW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGlzQXRvbVRhYkV2ZW50KGV2ZW50KVxuICAgIHJldHVybiB1bmxlc3MgQGl0ZW1Jc0FsbG93ZWQoZXZlbnQsIEBsb2NhdGlvbilcbiAgICByZXR1cm4gaWYgQHBhbmUuZ2V0SXRlbXMoKS5sZW5ndGggPiAxIG9yIGF0b20uY29uZmlnLmdldCgndGFicy5hbHdheXNTaG93VGFiQmFyJylcbiAgICBpZiBAcGFuZUVsZW1lbnQuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldClcbiAgICAgIEBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpXG5cbiAgIyBIaWRlIHRoZSB0YWIgYmFyIHdoZW4gdGhlIGRyYWdnZWQgdGFiIGxlYXZlcyB0aGlzIHBhbmUgd2hlbiBhbHdheXNTaG93VGFiQmFyID0gZmFsc2VcbiAgb25QYW5lRHJhZ0xlYXZlOiAoZXZlbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXNBdG9tVGFiRXZlbnQoZXZlbnQpXG4gICAgcmV0dXJuIHVubGVzcyBAaXRlbUlzQWxsb3dlZChldmVudCwgQGxvY2F0aW9uKVxuICAgIHJldHVybiBpZiBAcGFuZS5nZXRJdGVtcygpLmxlbmd0aCA+IDEgb3IgYXRvbS5jb25maWcuZ2V0KCd0YWJzLmFsd2F5c1Nob3dUYWJCYXInKVxuICAgIHVubGVzcyBAcGFuZUVsZW1lbnQuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldClcbiAgICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXG5cbiAgb25Nb3VzZVdoZWVsOiAoZXZlbnQpIC0+XG4gICAgcmV0dXJuIGlmIGV2ZW50LnNoaWZ0S2V5IG9yIG5vdCBAdGFiU2Nyb2xsaW5nXG5cbiAgICBAd2hlZWxEZWx0YSA/PSAwXG4gICAgQHdoZWVsRGVsdGEgKz0gZXZlbnQud2hlZWxEZWx0YVlcblxuICAgIGlmIEB3aGVlbERlbHRhIDw9IC1AdGFiU2Nyb2xsaW5nVGhyZXNob2xkXG4gICAgICBAd2hlZWxEZWx0YSA9IDBcbiAgICAgIEBwYW5lLmFjdGl2YXRlTmV4dEl0ZW0oKVxuICAgIGVsc2UgaWYgQHdoZWVsRGVsdGEgPj0gQHRhYlNjcm9sbGluZ1RocmVzaG9sZFxuICAgICAgQHdoZWVsRGVsdGEgPSAwXG4gICAgICBAcGFuZS5hY3RpdmF0ZVByZXZpb3VzSXRlbSgpXG5cbiAgb25Nb3VzZURvd246IChldmVudCkgLT5cbiAgICBAcGFuZS5hY3RpdmF0ZSgpIHVubGVzcyBAcGFuZS5pc0Rlc3Ryb3llZCgpXG5cbiAgICB0YWIgPSBAdGFiRm9yRWxlbWVudChldmVudC50YXJnZXQpXG4gICAgcmV0dXJuIHVubGVzcyB0YWJcblxuICAgIGlmIGV2ZW50LmJ1dHRvbiBpcyAyIG9yIChldmVudC5idXR0b24gaXMgMCBhbmQgZXZlbnQuY3RybEtleSBpcyB0cnVlKVxuICAgICAgQHJpZ2h0Q2xpY2tlZFRhYiA9IHRhYlxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGVsc2UgaWYgZXZlbnQuYnV0dG9uIGlzIDFcbiAgICAgICMgVGhpcyBwcmV2ZW50cyBDaHJvbWl1bSBmcm9tIGFjdGl2YXRpbmcgXCJzY3JvbGwgbW9kZVwiIHdoZW5cbiAgICAgICMgbWlkZGxlLWNsaWNraW5nIHdoaWxlIHNvbWUgdGFicyBhcmUgb2ZmLXNjcmVlbi5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICBvbkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgdGFiID0gQHRhYkZvckVsZW1lbnQoZXZlbnQudGFyZ2V0KVxuICAgIHJldHVybiB1bmxlc3MgdGFiXG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaWYgZXZlbnQuYnV0dG9uIGlzIDIgb3IgKGV2ZW50LmJ1dHRvbiBpcyAwIGFuZCBldmVudC5jdHJsS2V5IGlzIHRydWUpXG4gICAgICAjIEJhaWwgb3V0IGVhcmx5IHdoZW4gcmVjZWl2aW5nIHRoaXMgZXZlbnQsIGJlY2F1c2Ugd2UgaGF2ZSBhbHJlYWR5XG4gICAgICAjIGhhbmRsZWQgaXQgaW4gdGhlIG1vdXNlZG93biBoYW5kbGVyLlxuICAgICAgcmV0dXJuXG4gICAgZWxzZSBpZiBldmVudC5idXR0b24gaXMgMCBhbmQgbm90IGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2Nsb3NlLWljb24nKVxuICAgICAgQHBhbmUuYWN0aXZhdGVJdGVtKHRhYi5pdGVtKVxuICAgIGVsc2UgaWYgZXZlbnQuYnV0dG9uIGlzIDFcbiAgICAgIEBwYW5lLmRlc3Ryb3lJdGVtKHRhYi5pdGVtKVxuXG4gIG9uRG91YmxlQ2xpY2s6IChldmVudCkgLT5cbiAgICBpZiB0YWIgPSBAdGFiRm9yRWxlbWVudChldmVudC50YXJnZXQpXG4gICAgICB0YWIuaXRlbS50ZXJtaW5hdGVQZW5kaW5nU3RhdGU/KClcbiAgICBlbHNlIGlmIGV2ZW50LnRhcmdldCBpcyBAZWxlbWVudFxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChAZWxlbWVudCwgJ2FwcGxpY2F0aW9uOm5ldy1maWxlJylcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICB1cGRhdGVUYWJTY3JvbGxpbmdUaHJlc2hvbGQ6ICh2YWx1ZSkgLT5cbiAgICBAdGFiU2Nyb2xsaW5nVGhyZXNob2xkID0gdmFsdWVcblxuICB1cGRhdGVUYWJTY3JvbGxpbmc6ICh2YWx1ZSkgLT5cbiAgICBpZiB2YWx1ZSBpcyAncGxhdGZvcm0nXG4gICAgICBAdGFiU2Nyb2xsaW5nID0gKHByb2Nlc3MucGxhdGZvcm0gaXMgJ2xpbnV4JylcbiAgICBlbHNlXG4gICAgICBAdGFiU2Nyb2xsaW5nID0gdmFsdWVcblxuICBicm93c2VyV2luZG93Rm9ySWQ6IChpZCkgLT5cbiAgICBCcm93c2VyV2luZG93ID89IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlLkJyb3dzZXJXaW5kb3dcblxuICAgIEJyb3dzZXJXaW5kb3cuZnJvbUlkIGlkXG5cbiAgbW92ZUl0ZW1CZXR3ZWVuUGFuZXM6IChmcm9tUGFuZSwgZnJvbUluZGV4LCB0b1BhbmUsIHRvSW5kZXgsIGl0ZW0pIC0+XG4gICAgdHJ5XG4gICAgICBpZiB0b1BhbmUgaXMgZnJvbVBhbmVcbiAgICAgICAgdG9JbmRleC0tIGlmIGZyb21JbmRleCA8IHRvSW5kZXhcbiAgICAgICAgdG9QYW5lLm1vdmVJdGVtKGl0ZW0sIHRvSW5kZXgpXG4gICAgICBlbHNlXG4gICAgICAgIEBpc0l0ZW1Nb3ZpbmdCZXR3ZWVuUGFuZXMgPSB0cnVlXG4gICAgICAgIGZyb21QYW5lLm1vdmVJdGVtVG9QYW5lKGl0ZW0sIHRvUGFuZSwgdG9JbmRleC0tKVxuICAgICAgdG9QYW5lLmFjdGl2YXRlSXRlbShpdGVtKVxuICAgICAgdG9QYW5lLmFjdGl2YXRlKClcbiAgICBmaW5hbGx5XG4gICAgICBAaXNJdGVtTW92aW5nQmV0d2VlblBhbmVzID0gZmFsc2VcblxuICByZW1vdmVEcm9wVGFyZ2V0Q2xhc3NlczogLT5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS53b3Jrc3BhY2UuZ2V0RWxlbWVudCgpXG4gICAgZm9yIGRyb3BUYXJnZXQgaW4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudGFiLWJhciAuaXMtZHJvcC10YXJnZXQnKVxuICAgICAgZHJvcFRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1kcm9wLXRhcmdldCcpXG5cbiAgICBmb3IgZHJvcFRhcmdldCBpbiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50YWItYmFyIC5kcm9wLXRhcmdldC1pcy1hZnRlcicpXG4gICAgICBkcm9wVGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ2Ryb3AtdGFyZ2V0LWlzLWFmdGVyJylcblxuICBnZXREcm9wVGFyZ2V0SW5kZXg6IChldmVudCkgLT5cbiAgICB0YXJnZXQgPSBldmVudC50YXJnZXRcblxuICAgIHJldHVybiBpZiBAaXNQbGFjZWhvbGRlcih0YXJnZXQpXG5cbiAgICB0YWJzID0gQGdldFRhYnMoKVxuICAgIHRhYiA9IEB0YWJGb3JFbGVtZW50KHRhcmdldClcbiAgICB0YWIgPz0gdGFic1t0YWJzLmxlbmd0aCAtIDFdXG5cbiAgICByZXR1cm4gMCB1bmxlc3MgdGFiP1xuXG4gICAge2xlZnQsIHdpZHRofSA9IHRhYi5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgZWxlbWVudENlbnRlciA9IGxlZnQgKyB3aWR0aCAvIDJcbiAgICBlbGVtZW50SW5kZXggPSB0YWJzLmluZGV4T2YodGFiKVxuXG4gICAgaWYgZXZlbnQucGFnZVggPCBlbGVtZW50Q2VudGVyXG4gICAgICBlbGVtZW50SW5kZXhcbiAgICBlbHNlXG4gICAgICBlbGVtZW50SW5kZXggKyAxXG5cbiAgZ2V0UGxhY2Vob2xkZXI6IC0+XG4gICAgcmV0dXJuIEBwbGFjZWhvbGRlckVsIGlmIEBwbGFjZWhvbGRlckVsP1xuXG4gICAgQHBsYWNlaG9sZGVyRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIilcbiAgICBAcGxhY2Vob2xkZXJFbC5jbGFzc0xpc3QuYWRkKFwicGxhY2Vob2xkZXJcIilcbiAgICBAcGxhY2Vob2xkZXJFbFxuXG4gIHJlbW92ZVBsYWNlaG9sZGVyOiAtPlxuICAgIEBwbGFjZWhvbGRlckVsPy5yZW1vdmUoKVxuICAgIEBwbGFjZWhvbGRlckVsID0gbnVsbFxuXG4gIGlzUGxhY2Vob2xkZXI6IChlbGVtZW50KSAtPlxuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwbGFjZWhvbGRlcicpXG5cbiAgb25Nb3VzZUVudGVyOiAtPlxuICAgIGZvciB0YWIgaW4gQGdldFRhYnMoKVxuICAgICAge3dpZHRofSA9IHRhYi5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICB0YWIuZWxlbWVudC5zdHlsZS5tYXhXaWR0aCA9IHdpZHRoLnRvRml4ZWQoMikgKyAncHgnXG4gICAgcmV0dXJuXG5cbiAgb25Nb3VzZUxlYXZlOiAtPlxuICAgIHRhYi5lbGVtZW50LnN0eWxlLm1heFdpZHRoID0gJycgZm9yIHRhYiBpbiBAZ2V0VGFicygpXG4gICAgcmV0dXJuXG5cbiAgdGFiRm9yRWxlbWVudDogKGVsZW1lbnQpIC0+XG4gICAgY3VycmVudEVsZW1lbnQgPSBlbGVtZW50XG4gICAgd2hpbGUgY3VycmVudEVsZW1lbnQ/XG4gICAgICBpZiB0YWIgPSBAdGFic0J5RWxlbWVudC5nZXQoY3VycmVudEVsZW1lbnQpXG4gICAgICAgIHJldHVybiB0YWJcbiAgICAgIGVsc2VcbiAgICAgICAgY3VycmVudEVsZW1lbnQgPSBjdXJyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50XG5cbiAgaXNBdG9tVGFiRXZlbnQ6IChldmVudCkgLT5cbiAgICBmb3IgaXRlbSBpbiBldmVudC5kYXRhVHJhbnNmZXIuaXRlbXNcbiAgICAgIGlmIGl0ZW0udHlwZSBpcyAnYXRvbS10YWItZXZlbnQnXG4gICAgICAgIHJldHVybiB0cnVlXG5cbiAgICByZXR1cm4gZmFsc2VcblxuICBpdGVtSXNBbGxvd2VkOiAoZXZlbnQsIGxvY2F0aW9uKSAtPlxuICAgIGZvciBpdGVtIGluIGV2ZW50LmRhdGFUcmFuc2Zlci5pdGVtc1xuICAgICAgaWYgaXRlbS50eXBlIGlzICdhbGxvdy1hbGwtbG9jYXRpb25zJyBvciBpdGVtLnR5cGUgaXMgXCJhbGxvd2VkLWxvY2F0aW9uLSN7bG9jYXRpb259XCJcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIHJldHVybiBmYWxzZVxuIl19
