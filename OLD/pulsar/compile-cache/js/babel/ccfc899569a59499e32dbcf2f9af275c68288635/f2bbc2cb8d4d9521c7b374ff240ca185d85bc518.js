"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = _interopRequireDefault(require("path"));
var _etch = _interopRequireDefault(require("etch"));
var _underscorePlus = _interopRequireDefault(require("underscore-plus"));
var _atom = require("atom");
var _generalPanel = _interopRequireDefault(require("./general-panel"));
var _editorPanel = _interopRequireDefault(require("./editor-panel"));
var _packageDetailView = _interopRequireDefault(require("./package-detail-view"));
var _keybindingsPanel = _interopRequireDefault(require("./keybindings-panel"));
var _installPanel = _interopRequireDefault(require("./install-panel"));
var _themesPanel = _interopRequireDefault(require("./themes-panel"));
var _installedPackagesPanel = _interopRequireDefault(require("./installed-packages-panel"));
var _updatesPanel = _interopRequireDefault(require("./updates-panel"));
var _uriHandlerPanel = _interopRequireDefault(require("./uri-handler-panel"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */
/** @jsx etch.dom */

class SettingsView {
  constructor({
    uri,
    packageManager,
    snippetsProvider,
    activePanel
  } = {}) {
    this.uri = uri;
    this.packageManager = packageManager;
    this.snippetsProvider = snippetsProvider;
    this.deferredPanel = activePanel;
    this.destroyed = false;
    this.panelsByName = {};
    this.panelCreateCallbacks = {};
    _etch.default.initialize(this);
    this.disposables = new _atom.CompositeDisposable();
    this.disposables.add(atom.commands.add(this.element, {
      'core:move-up': () => {
        this.scrollUp();
      },
      'core:move-down': () => {
        this.scrollDown();
      },
      'core:page-up': () => {
        this.pageUp();
      },
      'core:page-down': () => {
        this.pageDown();
      },
      'core:move-to-top': () => {
        this.scrollToTop();
      },
      'core:move-to-bottom': () => {
        this.scrollToBottom();
      }
    }));
    this.disposables.add(atom.packages.onDidActivateInitialPackages(() => {
      this.disposables.add(atom.packages.onDidActivatePackage(pack => this.removePanelCache(pack.name)), atom.packages.onDidDeactivatePackage(pack => this.removePanelCache(pack.name)));
    }));
    process.nextTick(() => this.initializePanels());
  }
  removePanelCache(name) {
    delete this.panelsByName[name];
  }
  update() {}
  destroy() {
    this.destroyed = true;
    this.disposables.dispose();
    for (let name in this.panelsByName) {
      const panel = this.panelsByName[name];
      panel.destroy();
    }
    return _etch.default.destroy(this);
  }
  render() {
    return _etch.default.dom("div", {
      className: "settings-view pane-item",
      tabIndex: "-1"
    }, _etch.default.dom("div", {
      className: "config-menu",
      ref: "sidebar"
    }, _etch.default.dom("ul", {
      className: "panels-menu nav nav-pills nav-stacked",
      ref: "panelMenu"
    }, _etch.default.dom("div", {
      className: "panel-menu-separator",
      ref: "menuSeparator"
    })), _etch.default.dom("div", {
      className: "button-area"
    }, _etch.default.dom("button", {
      className: "btn btn-default icon icon-link-external",
      ref: "openDotAtom"
    }, "Open Config Folder"))), _etch.default.dom("div", {
      className: "panels",
      tabIndex: "-1",
      ref: "panels"
    }));
  }

  // This prevents the view being actually disposed when closed
  // If you remove it you will need to ensure the cached settingsView
  // in main.coffee is correctly released on close as well...
  onDidChangeTitle() {
    return new _atom.Disposable();
  }
  initializePanels() {
    if (this.refs.panels.children.length > 1) {
      return;
    }
    const clickHandler = event => {
      const target = event.target.closest('.panels-menu li a, .panels-packages li a');
      if (target) {
        this.showPanel(target.closest('li').name);
      }
    };
    this.element.addEventListener('click', clickHandler);
    this.disposables.add(new _atom.Disposable(() => this.element.removeEventListener('click', clickHandler)));
    const focusHandler = () => {
      this.focusActivePanel();
    };
    this.element.addEventListener('focus', focusHandler);
    this.disposables.add(new _atom.Disposable(() => this.element.removeEventListener('focus', focusHandler)));
    const openDotAtomClickHandler = () => {
      atom.open({
        pathsToOpen: [atom.getConfigDirPath()]
      });
    };
    this.refs.openDotAtom.addEventListener('click', openDotAtomClickHandler);
    this.disposables.add(new _atom.Disposable(() => this.refs.openDotAtom.removeEventListener('click', openDotAtomClickHandler)));
    this.addCorePanel('Core', 'settings', () => new _generalPanel.default());
    this.addCorePanel('Editor', 'code', () => new _editorPanel.default());
    if (atom.config.getSchema('core.uriHandlerRegistration').type !== 'any') {
      // "feature flag" based on core support for URI handling
      this.addCorePanel('URI Handling', 'link', () => new _uriHandlerPanel.default());
    }
    if (process.platform === 'win32' && require('atom').WinShell != null) {
      const SystemPanel = require('./system-windows-panel');
      this.addCorePanel('System', 'device-desktop', () => new SystemPanel());
    }
    this.addCorePanel('Keybindings', 'keyboard', () => new _keybindingsPanel.default());
    this.addCorePanel('Packages', 'package', () => new _installedPackagesPanel.default(this, this.packageManager));
    this.addCorePanel('Themes', 'paintcan', () => new _themesPanel.default(this, this.packageManager));
    this.addCorePanel('Updates', 'cloud-download', () => new _updatesPanel.default(this, this.packageManager));
    this.addCorePanel('Install', 'plus', () => new _installPanel.default(this, this.packageManager));
    this.showDeferredPanel();
    if (!this.activePanel) {
      this.showPanel('Core');
    }
    if (document.body.contains(this.element)) {
      this.refs.sidebar.style.width = this.refs.sidebar.offsetWidth;
    }
  }
  serialize() {
    return {
      deserializer: 'SettingsView',
      version: 2,
      activePanel: this.activePanel != null ? this.activePanel : this.deferredPanel,
      uri: this.uri
    };
  }
  getPackages() {
    let bundledPackageMetadataCache;
    if (this.packages != null) {
      return this.packages;
    }
    this.packages = atom.packages.getLoadedPackages();
    try {
      const packageMetadata = require(_path.default.join(atom.getLoadSettings().resourcePath, 'package.json'));
      bundledPackageMetadataCache = packageMetadata ? packageMetadata._atomPackages : null;
    } catch (error) {}

    // Include disabled packages so they can be re-enabled from the UI
    const disabledPackages = atom.config.get('core.disabledPackages') || [];
    for (const packageName of disabledPackages) {
      var metadata;
      const packagePath = atom.packages.resolvePackagePath(packageName);
      if (!packagePath) {
        continue;
      }
      try {
        metadata = require(_path.default.join(packagePath, 'package.json'));
      } catch (error) {
        if (bundledPackageMetadataCache && bundledPackageMetadataCache[packageName]) {
          metadata = bundledPackageMetadataCache[packageName].metadata;
        }
      }
      if (metadata == null) {
        continue;
      }
      const name = metadata.name != null ? metadata.name : packageName;
      if (!_underscorePlus.default.findWhere(this.packages, {
        name
      })) {
        this.packages.push({
          name,
          metadata,
          path: packagePath
        });
      }
    }
    this.packages.sort((pack1, pack2) => {
      const title1 = this.packageManager.getPackageTitle(pack1);
      const title2 = this.packageManager.getPackageTitle(pack2);
      return title1.localeCompare(title2);
    });
    return this.packages;
  }
  addCorePanel(name, iconName, panelCreateCallback) {
    const panelMenuItem = document.createElement('li');
    panelMenuItem.name = name;
    panelMenuItem.setAttribute('name', name);
    const a = document.createElement('a');
    a.classList.add('icon', `icon-${iconName}`);
    a.textContent = name;
    panelMenuItem.appendChild(a);
    this.refs.menuSeparator.parentElement.insertBefore(panelMenuItem, this.refs.menuSeparator);
    this.addPanel(name, panelCreateCallback);
  }
  addPanel(name, panelCreateCallback) {
    this.panelCreateCallbacks[name] = panelCreateCallback;
    if (this.deferredPanel && this.deferredPanel.name === name) {
      this.showDeferredPanel();
    }
  }
  getOrCreatePanel(name, options) {
    let panel = this.panelsByName[name];
    if (panel) return panel;
    if (name in this.panelCreateCallbacks) {
      panel = this.panelCreateCallbacks[name]();
      delete this.panelCreateCallbacks[name];
    } else if (options && options.pack) {
      if (!options.pack.metadata) {
        options.pack.metadata = _underscorePlus.default.clone(options.pack);
      }
      panel = new _packageDetailView.default(options.pack, this, this.packageManager, this.snippetsProvider);
    }
    if (panel) {
      this.panelsByName[name] = panel;
    }
    return panel;
  }
  makePanelMenuActive(name) {
    const previouslyActivePanel = this.refs.sidebar.querySelector('.active');
    if (previouslyActivePanel) {
      previouslyActivePanel.classList.remove('active');
    }
    const newActivePanel = this.refs.sidebar.querySelector(`[name='${name}']`);
    if (newActivePanel) {
      newActivePanel.classList.add('active');
    }
  }
  focusActivePanel() {
    // Pass focus to panel that is currently visible
    for (let i = 0; i < this.refs.panels.children.length; i++) {
      const child = this.refs.panels.children[i];
      if (child.offsetWidth > 0) {
        child.focus();
      }
    }
  }
  showDeferredPanel() {
    if (this.deferredPanel) {
      const {
        name,
        options
      } = this.deferredPanel;
      this.showPanel(name, options);
    }
  }

  // Public: show a panel.
  //
  // * `name` {String} the name of the panel to show
  // * `options` {Object} an options hash. Will be passed to `beforeShow()` on
  //   the panel. Options may include (but are not limited to):
  //   * `uri` the URI the panel was launched from
  showPanel(name, options) {
    const panel = this.getOrCreatePanel(name, options);
    if (panel) {
      this.appendPanel(panel, options);
      this.makePanelMenuActive(name);
      this.setActivePanel(name, options);
      this.deferredPanel = null;
    } else {
      this.deferredPanel = {
        name,
        options
      };
    }
  }
  showPanelForURI(uri) {
    const regex = /config\/([a-z]+)\/?([a-zA-Z0-9_-]+)?/i;
    const match = regex.exec(uri);
    if (match) {
      const path1 = match[1];
      const path2 = match[2];
      if (path1 === 'packages' && path2 != null) {
        this.showPanel(path2, {
          uri: uri,
          pack: {
            name: path2
          },
          back: atom.packages.getLoadedPackage(path2) ? 'Packages' : null
        });
      } else {
        const panelName = path1[0].toUpperCase() + path1.slice(1);
        this.showPanel(panelName, {
          uri
        });
      }
    }
  }
  appendPanel(panel, options) {
    for (let i = 0; i < this.refs.panels.children.length; i++) {
      this.refs.panels.children[i].style.display = 'none';
    }
    if (!this.refs.panels.contains(panel.element)) {
      this.refs.panels.appendChild(panel.element);
    }
    if (panel.beforeShow) {
      panel.beforeShow(options);
    }
    panel.show();
    panel.focus();
  }
  setActivePanel(name, options = {}) {
    this.activePanel = {
      name,
      options
    };
  }
  removePanel(name) {
    const panel = this.panelsByName[name];
    if (panel) {
      panel.destroy();
      delete this.panelsByName[name];
    }
  }
  getTitle() {
    return 'Settings';
  }
  getIconName() {
    return 'tools';
  }
  getURI() {
    return this.uri;
  }
  isEqual(other) {
    return other instanceof SettingsView;
  }
  scrollUp() {
    this.element.scrollTop -= document.body.offsetHeight / 20;
  }
  scrollDown() {
    this.element.scrollTop += document.body.offsetHeight / 20;
  }
  pageUp() {
    this.element.scrollTop -= this.element.offsetHeight;
  }
  pageDown() {
    this.element.scrollTop += this.element.offsetHeight;
  }
  scrollToTop() {
    this.element.scrollTop = 0;
  }
  scrollToBottom() {
    this.element.scrollTop = this.element.scrollHeight;
  }
}
exports.default = SettingsView;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZXR0aW5nc1ZpZXciLCJjb25zdHJ1Y3RvciIsInVyaSIsInBhY2thZ2VNYW5hZ2VyIiwic25pcHBldHNQcm92aWRlciIsImFjdGl2ZVBhbmVsIiwiZGVmZXJyZWRQYW5lbCIsImRlc3Ryb3llZCIsInBhbmVsc0J5TmFtZSIsInBhbmVsQ3JlYXRlQ2FsbGJhY2tzIiwiZXRjaCIsImluaXRpYWxpemUiLCJkaXNwb3NhYmxlcyIsIkNvbXBvc2l0ZURpc3Bvc2FibGUiLCJhZGQiLCJhdG9tIiwiY29tbWFuZHMiLCJlbGVtZW50Iiwic2Nyb2xsVXAiLCJzY3JvbGxEb3duIiwicGFnZVVwIiwicGFnZURvd24iLCJzY3JvbGxUb1RvcCIsInNjcm9sbFRvQm90dG9tIiwicGFja2FnZXMiLCJvbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzIiwib25EaWRBY3RpdmF0ZVBhY2thZ2UiLCJwYWNrIiwicmVtb3ZlUGFuZWxDYWNoZSIsIm5hbWUiLCJvbkRpZERlYWN0aXZhdGVQYWNrYWdlIiwicHJvY2VzcyIsIm5leHRUaWNrIiwiaW5pdGlhbGl6ZVBhbmVscyIsInVwZGF0ZSIsImRlc3Ryb3kiLCJkaXNwb3NlIiwicGFuZWwiLCJyZW5kZXIiLCJvbkRpZENoYW5nZVRpdGxlIiwiRGlzcG9zYWJsZSIsInJlZnMiLCJwYW5lbHMiLCJjaGlsZHJlbiIsImxlbmd0aCIsImNsaWNrSGFuZGxlciIsImV2ZW50IiwidGFyZ2V0IiwiY2xvc2VzdCIsInNob3dQYW5lbCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZm9jdXNIYW5kbGVyIiwiZm9jdXNBY3RpdmVQYW5lbCIsIm9wZW5Eb3RBdG9tQ2xpY2tIYW5kbGVyIiwib3BlbiIsInBhdGhzVG9PcGVuIiwiZ2V0Q29uZmlnRGlyUGF0aCIsIm9wZW5Eb3RBdG9tIiwiYWRkQ29yZVBhbmVsIiwiR2VuZXJhbFBhbmVsIiwiRWRpdG9yUGFuZWwiLCJjb25maWciLCJnZXRTY2hlbWEiLCJ0eXBlIiwiVXJpSGFuZGxlclBhbmVsIiwicGxhdGZvcm0iLCJyZXF1aXJlIiwiV2luU2hlbGwiLCJTeXN0ZW1QYW5lbCIsIktleWJpbmRpbmdzUGFuZWwiLCJJbnN0YWxsZWRQYWNrYWdlc1BhbmVsIiwiVGhlbWVzUGFuZWwiLCJVcGRhdGVzUGFuZWwiLCJJbnN0YWxsUGFuZWwiLCJzaG93RGVmZXJyZWRQYW5lbCIsImRvY3VtZW50IiwiYm9keSIsImNvbnRhaW5zIiwic2lkZWJhciIsInN0eWxlIiwid2lkdGgiLCJvZmZzZXRXaWR0aCIsInNlcmlhbGl6ZSIsImRlc2VyaWFsaXplciIsInZlcnNpb24iLCJnZXRQYWNrYWdlcyIsImJ1bmRsZWRQYWNrYWdlTWV0YWRhdGFDYWNoZSIsImdldExvYWRlZFBhY2thZ2VzIiwicGFja2FnZU1ldGFkYXRhIiwicGF0aCIsImpvaW4iLCJnZXRMb2FkU2V0dGluZ3MiLCJyZXNvdXJjZVBhdGgiLCJfYXRvbVBhY2thZ2VzIiwiZXJyb3IiLCJkaXNhYmxlZFBhY2thZ2VzIiwiZ2V0IiwicGFja2FnZU5hbWUiLCJtZXRhZGF0YSIsInBhY2thZ2VQYXRoIiwicmVzb2x2ZVBhY2thZ2VQYXRoIiwiXyIsImZpbmRXaGVyZSIsInB1c2giLCJzb3J0IiwicGFjazEiLCJwYWNrMiIsInRpdGxlMSIsImdldFBhY2thZ2VUaXRsZSIsInRpdGxlMiIsImxvY2FsZUNvbXBhcmUiLCJpY29uTmFtZSIsInBhbmVsQ3JlYXRlQ2FsbGJhY2siLCJwYW5lbE1lbnVJdGVtIiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsImEiLCJjbGFzc0xpc3QiLCJ0ZXh0Q29udGVudCIsImFwcGVuZENoaWxkIiwibWVudVNlcGFyYXRvciIsInBhcmVudEVsZW1lbnQiLCJpbnNlcnRCZWZvcmUiLCJhZGRQYW5lbCIsImdldE9yQ3JlYXRlUGFuZWwiLCJvcHRpb25zIiwiY2xvbmUiLCJQYWNrYWdlRGV0YWlsVmlldyIsIm1ha2VQYW5lbE1lbnVBY3RpdmUiLCJwcmV2aW91c2x5QWN0aXZlUGFuZWwiLCJxdWVyeVNlbGVjdG9yIiwicmVtb3ZlIiwibmV3QWN0aXZlUGFuZWwiLCJpIiwiY2hpbGQiLCJmb2N1cyIsImFwcGVuZFBhbmVsIiwic2V0QWN0aXZlUGFuZWwiLCJzaG93UGFuZWxGb3JVUkkiLCJyZWdleCIsIm1hdGNoIiwiZXhlYyIsInBhdGgxIiwicGF0aDIiLCJiYWNrIiwiZ2V0TG9hZGVkUGFja2FnZSIsInBhbmVsTmFtZSIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJkaXNwbGF5IiwiYmVmb3JlU2hvdyIsInNob3ciLCJyZW1vdmVQYW5lbCIsImdldFRpdGxlIiwiZ2V0SWNvbk5hbWUiLCJnZXRVUkkiLCJpc0VxdWFsIiwib3RoZXIiLCJzY3JvbGxUb3AiLCJvZmZzZXRIZWlnaHQiLCJzY3JvbGxIZWlnaHQiXSwic291cmNlcyI6WyJzZXR0aW5ncy12aWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cbi8qKiBAanN4IGV0Y2guZG9tICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZXRjaCBmcm9tICdldGNoJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgR2VuZXJhbFBhbmVsIGZyb20gJy4vZ2VuZXJhbC1wYW5lbCdcbmltcG9ydCBFZGl0b3JQYW5lbCBmcm9tICcuL2VkaXRvci1wYW5lbCdcbmltcG9ydCBQYWNrYWdlRGV0YWlsVmlldyBmcm9tICcuL3BhY2thZ2UtZGV0YWlsLXZpZXcnXG5pbXBvcnQgS2V5YmluZGluZ3NQYW5lbCBmcm9tICcuL2tleWJpbmRpbmdzLXBhbmVsJ1xuaW1wb3J0IEluc3RhbGxQYW5lbCBmcm9tICcuL2luc3RhbGwtcGFuZWwnXG5pbXBvcnQgVGhlbWVzUGFuZWwgZnJvbSAnLi90aGVtZXMtcGFuZWwnXG5pbXBvcnQgSW5zdGFsbGVkUGFja2FnZXNQYW5lbCBmcm9tICcuL2luc3RhbGxlZC1wYWNrYWdlcy1wYW5lbCdcbmltcG9ydCBVcGRhdGVzUGFuZWwgZnJvbSAnLi91cGRhdGVzLXBhbmVsJ1xuaW1wb3J0IFVyaUhhbmRsZXJQYW5lbCBmcm9tICcuL3VyaS1oYW5kbGVyLXBhbmVsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXR0aW5nc1ZpZXcge1xuICBjb25zdHJ1Y3RvciAoe3VyaSwgcGFja2FnZU1hbmFnZXIsIHNuaXBwZXRzUHJvdmlkZXIsIGFjdGl2ZVBhbmVsfSA9IHt9KSB7XG4gICAgdGhpcy51cmkgPSB1cmlcbiAgICB0aGlzLnBhY2thZ2VNYW5hZ2VyID0gcGFja2FnZU1hbmFnZXJcbiAgICB0aGlzLnNuaXBwZXRzUHJvdmlkZXIgPSBzbmlwcGV0c1Byb3ZpZGVyXG4gICAgdGhpcy5kZWZlcnJlZFBhbmVsID0gYWN0aXZlUGFuZWxcbiAgICB0aGlzLmRlc3Ryb3llZCA9IGZhbHNlXG4gICAgdGhpcy5wYW5lbHNCeU5hbWUgPSB7fVxuICAgIHRoaXMucGFuZWxDcmVhdGVDYWxsYmFja3MgPSB7fVxuXG4gICAgZXRjaC5pbml0aWFsaXplKHRoaXMpXG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICdjb3JlOm1vdmUtdXAnOiAoKSA9PiB7IHRoaXMuc2Nyb2xsVXAoKSB9LFxuICAgICAgJ2NvcmU6bW92ZS1kb3duJzogKCkgPT4geyB0aGlzLnNjcm9sbERvd24oKSB9LFxuICAgICAgJ2NvcmU6cGFnZS11cCc6ICgpID0+IHsgdGhpcy5wYWdlVXAoKSB9LFxuICAgICAgJ2NvcmU6cGFnZS1kb3duJzogKCkgPT4geyB0aGlzLnBhZ2VEb3duKCkgfSxcbiAgICAgICdjb3JlOm1vdmUtdG8tdG9wJzogKCkgPT4geyB0aGlzLnNjcm9sbFRvVG9wKCkgfSxcbiAgICAgICdjb3JlOm1vdmUtdG8tYm90dG9tJzogKCkgPT4geyB0aGlzLnNjcm9sbFRvQm90dG9tKCkgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzKCgpID0+IHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlKHBhY2sgPT4gdGhpcy5yZW1vdmVQYW5lbENhY2hlKHBhY2submFtZSkpLFxuICAgICAgICBhdG9tLnBhY2thZ2VzLm9uRGlkRGVhY3RpdmF0ZVBhY2thZ2UocGFjayA9PiB0aGlzLnJlbW92ZVBhbmVsQ2FjaGUocGFjay5uYW1lKSlcbiAgICAgIClcbiAgICB9KSlcblxuICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4gdGhpcy5pbml0aWFsaXplUGFuZWxzKCkpXG4gIH1cblxuICByZW1vdmVQYW5lbENhY2hlIChuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMucGFuZWxzQnlOYW1lW25hbWVdXG4gIH1cblxuICB1cGRhdGUgKCkge31cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWVcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIGZvciAobGV0IG5hbWUgaW4gdGhpcy5wYW5lbHNCeU5hbWUpIHtcbiAgICAgIGNvbnN0IHBhbmVsID0gdGhpcy5wYW5lbHNCeU5hbWVbbmFtZV1cbiAgICAgIHBhbmVsLmRlc3Ryb3koKVxuICAgIH1cblxuICAgIHJldHVybiBldGNoLmRlc3Ryb3kodGhpcylcbiAgfVxuXG4gIHJlbmRlciAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZXR0aW5ncy12aWV3IHBhbmUtaXRlbScgdGFiSW5kZXg9Jy0xJz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbmZpZy1tZW51JyByZWY9J3NpZGViYXInPlxuICAgICAgICAgIDx1bCBjbGFzc05hbWU9J3BhbmVscy1tZW51IG5hdiBuYXYtcGlsbHMgbmF2LXN0YWNrZWQnIHJlZj0ncGFuZWxNZW51Jz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwYW5lbC1tZW51LXNlcGFyYXRvcicgcmVmPSdtZW51U2VwYXJhdG9yJyAvPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2J1dHRvbi1hcmVhJz5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLWRlZmF1bHQgaWNvbiBpY29uLWxpbmstZXh0ZXJuYWwnIHJlZj0nb3BlbkRvdEF0b20nPk9wZW4gQ29uZmlnIEZvbGRlcjwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgey8qIFRoZSB0YWJpbmRleCBhdHRyIGJlbG93IGVuc3VyZXMgdGhhdCBjbGlja3MgaW4gYSBwYW5lbCBpdGVtIHdvbid0XG4gICAgICAgIGNhdXNlIHRoaXMgdmlldyB0byBnYWluIGZvY3VzLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHdoZW4gdGhpcyB2aWV3XG4gICAgICAgIGdhaW5zIGZvY3VzIChlLmcuIGltbWVkaWF0ZWx5IGFmdGVyIGF0b20gZGlzcGxheXMgaXQpLCBpdCBmb2N1c2VzIHRoZVxuICAgICAgICBjdXJyZW50bHkgYWN0aXZlIHBhbmVsIGl0ZW0uIElmIHRoYXQgZm9jdXNpbmcgY2F1c2VzIHRoZSBhY3RpdmUgcGFuZWwgdG9cbiAgICAgICAgc2Nyb2xsIChlLmcuIGJlY2F1c2UgdGhlIGFjdGl2ZSBwYW5lbCBpdHNlbGYgcGFzc2VzIGZvY3VzIG9uIHRvIGEgc2VhcmNoXG4gICAgICAgIGJveCBhdCB0aGUgdG9wIG9mIGEgc2Nyb2xsZWQgcGFuZWwpLCB0aGVuIHRoZSBicm93c2VyIHdpbGwgbm90IGZpcmUgdGhlXG4gICAgICAgIGNsaWNrIGV2ZW50IG9uIHRoZSBlbGVtZW50IHdpdGhpbiB0aGUgcGFuZWwgb24gd2hpY2ggdGhlIHVzZXIgb3JpZ2luYWxseVxuICAgICAgICBjbGlja2VkIChlLmcuIGEgcGFja2FnZSBjYXJkKS4gVGhpcyB3b3VsZCBwcmV2ZW50IHVzIGZyb20gc2hvd2luZyBhXG4gICAgICAgIHBhY2thZ2UgZGV0YWlsIHZpZXcgd2hlbiBjbGlja2luZyBvbiBhIHBhY2thZ2UgY2FyZC4gUGhldyEgKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwYW5lbHMnIHRhYkluZGV4PSctMScgcmVmPSdwYW5lbHMnIC8+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuICAvLyBUaGlzIHByZXZlbnRzIHRoZSB2aWV3IGJlaW5nIGFjdHVhbGx5IGRpc3Bvc2VkIHdoZW4gY2xvc2VkXG4gIC8vIElmIHlvdSByZW1vdmUgaXQgeW91IHdpbGwgbmVlZCB0byBlbnN1cmUgdGhlIGNhY2hlZCBzZXR0aW5nc1ZpZXdcbiAgLy8gaW4gbWFpbi5jb2ZmZWUgaXMgY29ycmVjdGx5IHJlbGVhc2VkIG9uIGNsb3NlIGFzIHdlbGwuLi5cbiAgb25EaWRDaGFuZ2VUaXRsZSAoKSB7IHJldHVybiBuZXcgRGlzcG9zYWJsZSgpIH1cblxuICBpbml0aWFsaXplUGFuZWxzICgpIHtcbiAgICBpZiAodGhpcy5yZWZzLnBhbmVscy5jaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBjbGlja0hhbmRsZXIgPSAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCcucGFuZWxzLW1lbnUgbGkgYSwgLnBhbmVscy1wYWNrYWdlcyBsaSBhJylcbiAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgdGhpcy5zaG93UGFuZWwodGFyZ2V0LmNsb3Nlc3QoJ2xpJykubmFtZSlcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xpY2tIYW5kbGVyKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrSGFuZGxlcikpKVxuXG4gICAgY29uc3QgZm9jdXNIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgdGhpcy5mb2N1c0FjdGl2ZVBhbmVsKClcbiAgICB9XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgZm9jdXNIYW5kbGVyKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIGZvY3VzSGFuZGxlcikpKVxuXG4gICAgY29uc3Qgb3BlbkRvdEF0b21DbGlja0hhbmRsZXIgPSAoKSA9PiB7XG4gICAgICBhdG9tLm9wZW4oe3BhdGhzVG9PcGVuOiBbYXRvbS5nZXRDb25maWdEaXJQYXRoKCldfSlcbiAgICB9XG4gICAgdGhpcy5yZWZzLm9wZW5Eb3RBdG9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb3BlbkRvdEF0b21DbGlja0hhbmRsZXIpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5yZWZzLm9wZW5Eb3RBdG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb3BlbkRvdEF0b21DbGlja0hhbmRsZXIpKSlcblxuICAgIHRoaXMuYWRkQ29yZVBhbmVsKCdDb3JlJywgJ3NldHRpbmdzJywgKCkgPT4gbmV3IEdlbmVyYWxQYW5lbCgpKVxuICAgIHRoaXMuYWRkQ29yZVBhbmVsKCdFZGl0b3InLCAnY29kZScsICgpID0+IG5ldyBFZGl0b3JQYW5lbCgpKVxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXRTY2hlbWEoJ2NvcmUudXJpSGFuZGxlclJlZ2lzdHJhdGlvbicpLnR5cGUgIT09ICdhbnknKSB7XG4gICAgICAvLyBcImZlYXR1cmUgZmxhZ1wiIGJhc2VkIG9uIGNvcmUgc3VwcG9ydCBmb3IgVVJJIGhhbmRsaW5nXG4gICAgICB0aGlzLmFkZENvcmVQYW5lbCgnVVJJIEhhbmRsaW5nJywgJ2xpbmsnLCAoKSA9PiBuZXcgVXJpSGFuZGxlclBhbmVsKCkpXG4gICAgfVxuICAgIGlmICgocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykgJiYgKHJlcXVpcmUoJ2F0b20nKS5XaW5TaGVsbCAhPSBudWxsKSkge1xuICAgICAgY29uc3QgU3lzdGVtUGFuZWwgPSByZXF1aXJlKCcuL3N5c3RlbS13aW5kb3dzLXBhbmVsJylcbiAgICAgIHRoaXMuYWRkQ29yZVBhbmVsKCdTeXN0ZW0nLCAnZGV2aWNlLWRlc2t0b3AnLCAoKSA9PiBuZXcgU3lzdGVtUGFuZWwoKSlcbiAgICB9XG4gICAgdGhpcy5hZGRDb3JlUGFuZWwoJ0tleWJpbmRpbmdzJywgJ2tleWJvYXJkJywgKCkgPT4gbmV3IEtleWJpbmRpbmdzUGFuZWwoKSlcbiAgICB0aGlzLmFkZENvcmVQYW5lbCgnUGFja2FnZXMnLCAncGFja2FnZScsICgpID0+IG5ldyBJbnN0YWxsZWRQYWNrYWdlc1BhbmVsKHRoaXMsIHRoaXMucGFja2FnZU1hbmFnZXIpKVxuICAgIHRoaXMuYWRkQ29yZVBhbmVsKCdUaGVtZXMnLCAncGFpbnRjYW4nLCAoKSA9PiBuZXcgVGhlbWVzUGFuZWwodGhpcywgdGhpcy5wYWNrYWdlTWFuYWdlcikpXG4gICAgdGhpcy5hZGRDb3JlUGFuZWwoJ1VwZGF0ZXMnLCAnY2xvdWQtZG93bmxvYWQnLCAoKSA9PiBuZXcgVXBkYXRlc1BhbmVsKHRoaXMsIHRoaXMucGFja2FnZU1hbmFnZXIpKVxuICAgIHRoaXMuYWRkQ29yZVBhbmVsKCdJbnN0YWxsJywgJ3BsdXMnLCAoKSA9PiBuZXcgSW5zdGFsbFBhbmVsKHRoaXMsIHRoaXMucGFja2FnZU1hbmFnZXIpKVxuXG4gICAgdGhpcy5zaG93RGVmZXJyZWRQYW5lbCgpXG5cbiAgICBpZiAoIXRoaXMuYWN0aXZlUGFuZWwpIHtcbiAgICAgIHRoaXMuc2hvd1BhbmVsKCdDb3JlJylcbiAgICB9XG5cbiAgICBpZiAoZG9jdW1lbnQuYm9keS5jb250YWlucyh0aGlzLmVsZW1lbnQpKSB7XG4gICAgICB0aGlzLnJlZnMuc2lkZWJhci5zdHlsZS53aWR0aCA9IHRoaXMucmVmcy5zaWRlYmFyLm9mZnNldFdpZHRoXG4gICAgfVxuICB9XG5cbiAgc2VyaWFsaXplICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzZXJpYWxpemVyOiAnU2V0dGluZ3NWaWV3JyxcbiAgICAgIHZlcnNpb246IDIsXG4gICAgICBhY3RpdmVQYW5lbDogdGhpcy5hY3RpdmVQYW5lbCAhPSBudWxsID8gdGhpcy5hY3RpdmVQYW5lbCA6IHRoaXMuZGVmZXJyZWRQYW5lbCxcbiAgICAgIHVyaTogdGhpcy51cmlcbiAgICB9XG4gIH1cblxuICBnZXRQYWNrYWdlcyAoKSB7XG4gICAgbGV0IGJ1bmRsZWRQYWNrYWdlTWV0YWRhdGFDYWNoZVxuICAgIGlmICh0aGlzLnBhY2thZ2VzICE9IG51bGwpIHsgcmV0dXJuIHRoaXMucGFja2FnZXMgfVxuXG4gICAgdGhpcy5wYWNrYWdlcyA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZXMoKVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhY2thZ2VNZXRhZGF0YSA9IHJlcXVpcmUocGF0aC5qb2luKGF0b20uZ2V0TG9hZFNldHRpbmdzKCkucmVzb3VyY2VQYXRoLCAncGFja2FnZS5qc29uJykpXG4gICAgICBidW5kbGVkUGFja2FnZU1ldGFkYXRhQ2FjaGUgPSBwYWNrYWdlTWV0YWRhdGEgPyBwYWNrYWdlTWV0YWRhdGEuX2F0b21QYWNrYWdlcyA6IG51bGxcbiAgICB9IGNhdGNoIChlcnJvcikge31cblxuICAgIC8vIEluY2x1ZGUgZGlzYWJsZWQgcGFja2FnZXMgc28gdGhleSBjYW4gYmUgcmUtZW5hYmxlZCBmcm9tIHRoZSBVSVxuICAgIGNvbnN0IGRpc2FibGVkUGFja2FnZXMgPSBhdG9tLmNvbmZpZy5nZXQoJ2NvcmUuZGlzYWJsZWRQYWNrYWdlcycpIHx8IFtdXG4gICAgZm9yIChjb25zdCBwYWNrYWdlTmFtZSBvZiBkaXNhYmxlZFBhY2thZ2VzKSB7XG4gICAgICB2YXIgbWV0YWRhdGFcbiAgICAgIGNvbnN0IHBhY2thZ2VQYXRoID0gYXRvbS5wYWNrYWdlcy5yZXNvbHZlUGFja2FnZVBhdGgocGFja2FnZU5hbWUpXG4gICAgICBpZiAoIXBhY2thZ2VQYXRoKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIG1ldGFkYXRhID0gcmVxdWlyZShwYXRoLmpvaW4ocGFja2FnZVBhdGgsICdwYWNrYWdlLmpzb24nKSlcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChidW5kbGVkUGFja2FnZU1ldGFkYXRhQ2FjaGUgJiYgYnVuZGxlZFBhY2thZ2VNZXRhZGF0YUNhY2hlW3BhY2thZ2VOYW1lXSkge1xuICAgICAgICAgIG1ldGFkYXRhID0gYnVuZGxlZFBhY2thZ2VNZXRhZGF0YUNhY2hlW3BhY2thZ2VOYW1lXS5tZXRhZGF0YVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWV0YWRhdGEgPT0gbnVsbCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBuYW1lID0gbWV0YWRhdGEubmFtZSAhPSBudWxsID8gbWV0YWRhdGEubmFtZSA6IHBhY2thZ2VOYW1lXG4gICAgICBpZiAoIV8uZmluZFdoZXJlKHRoaXMucGFja2FnZXMsIHtuYW1lfSkpIHtcbiAgICAgICAgdGhpcy5wYWNrYWdlcy5wdXNoKHtuYW1lLCBtZXRhZGF0YSwgcGF0aDogcGFja2FnZVBhdGh9KVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucGFja2FnZXMuc29ydCgocGFjazEsIHBhY2syKSA9PiB7XG4gICAgICBjb25zdCB0aXRsZTEgPSB0aGlzLnBhY2thZ2VNYW5hZ2VyLmdldFBhY2thZ2VUaXRsZShwYWNrMSlcbiAgICAgIGNvbnN0IHRpdGxlMiA9IHRoaXMucGFja2FnZU1hbmFnZXIuZ2V0UGFja2FnZVRpdGxlKHBhY2syKVxuICAgICAgcmV0dXJuIHRpdGxlMS5sb2NhbGVDb21wYXJlKHRpdGxlMilcbiAgICB9KVxuXG4gICAgcmV0dXJuIHRoaXMucGFja2FnZXNcbiAgfVxuXG4gIGFkZENvcmVQYW5lbCAobmFtZSwgaWNvbk5hbWUsIHBhbmVsQ3JlYXRlQ2FsbGJhY2spIHtcbiAgICBjb25zdCBwYW5lbE1lbnVJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICAgIHBhbmVsTWVudUl0ZW0ubmFtZSA9IG5hbWVcbiAgICBwYW5lbE1lbnVJdGVtLnNldEF0dHJpYnV0ZSgnbmFtZScsIG5hbWUpXG5cbiAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgYS5jbGFzc0xpc3QuYWRkKCdpY29uJywgYGljb24tJHtpY29uTmFtZX1gKVxuICAgIGEudGV4dENvbnRlbnQgPSBuYW1lXG4gICAgcGFuZWxNZW51SXRlbS5hcHBlbmRDaGlsZChhKVxuXG4gICAgdGhpcy5yZWZzLm1lbnVTZXBhcmF0b3IucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUocGFuZWxNZW51SXRlbSwgdGhpcy5yZWZzLm1lbnVTZXBhcmF0b3IpXG4gICAgdGhpcy5hZGRQYW5lbChuYW1lLCBwYW5lbENyZWF0ZUNhbGxiYWNrKVxuICB9XG5cbiAgYWRkUGFuZWwgKG5hbWUsIHBhbmVsQ3JlYXRlQ2FsbGJhY2spIHtcbiAgICB0aGlzLnBhbmVsQ3JlYXRlQ2FsbGJhY2tzW25hbWVdID0gcGFuZWxDcmVhdGVDYWxsYmFja1xuICAgIGlmICh0aGlzLmRlZmVycmVkUGFuZWwgJiYgdGhpcy5kZWZlcnJlZFBhbmVsLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHRoaXMuc2hvd0RlZmVycmVkUGFuZWwoKVxuICAgIH1cbiAgfVxuXG4gIGdldE9yQ3JlYXRlUGFuZWwgKG5hbWUsIG9wdGlvbnMpIHtcbiAgICBsZXQgcGFuZWwgPSB0aGlzLnBhbmVsc0J5TmFtZVtuYW1lXVxuICAgIGlmIChwYW5lbCkgcmV0dXJuIHBhbmVsXG5cbiAgICBpZiAobmFtZSBpbiB0aGlzLnBhbmVsQ3JlYXRlQ2FsbGJhY2tzKSB7XG4gICAgICBwYW5lbCA9IHRoaXMucGFuZWxDcmVhdGVDYWxsYmFja3NbbmFtZV0oKVxuICAgICAgZGVsZXRlIHRoaXMucGFuZWxDcmVhdGVDYWxsYmFja3NbbmFtZV1cbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5wYWNrKSB7XG4gICAgICBpZiAoIW9wdGlvbnMucGFjay5tZXRhZGF0YSkge1xuICAgICAgICBvcHRpb25zLnBhY2subWV0YWRhdGEgPSBfLmNsb25lKG9wdGlvbnMucGFjaylcbiAgICAgIH1cbiAgICAgIHBhbmVsID0gbmV3IFBhY2thZ2VEZXRhaWxWaWV3KG9wdGlvbnMucGFjaywgdGhpcywgdGhpcy5wYWNrYWdlTWFuYWdlciwgdGhpcy5zbmlwcGV0c1Byb3ZpZGVyKVxuICAgIH1cbiAgICBpZiAocGFuZWwpIHtcbiAgICAgIHRoaXMucGFuZWxzQnlOYW1lW25hbWVdID0gcGFuZWxcbiAgICB9XG5cbiAgICByZXR1cm4gcGFuZWxcbiAgfVxuXG4gIG1ha2VQYW5lbE1lbnVBY3RpdmUgKG5hbWUpIHtcbiAgICBjb25zdCBwcmV2aW91c2x5QWN0aXZlUGFuZWwgPSB0aGlzLnJlZnMuc2lkZWJhci5xdWVyeVNlbGVjdG9yKCcuYWN0aXZlJylcbiAgICBpZiAocHJldmlvdXNseUFjdGl2ZVBhbmVsKSB7XG4gICAgICBwcmV2aW91c2x5QWN0aXZlUGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJylcbiAgICB9XG5cbiAgICBjb25zdCBuZXdBY3RpdmVQYW5lbCA9IHRoaXMucmVmcy5zaWRlYmFyLnF1ZXJ5U2VsZWN0b3IoYFtuYW1lPScke25hbWV9J11gKVxuICAgIGlmIChuZXdBY3RpdmVQYW5lbCkge1xuICAgICAgbmV3QWN0aXZlUGFuZWwuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcbiAgICB9XG4gIH1cblxuICBmb2N1c0FjdGl2ZVBhbmVsICgpIHtcbiAgICAvLyBQYXNzIGZvY3VzIHRvIHBhbmVsIHRoYXQgaXMgY3VycmVudGx5IHZpc2libGVcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVmcy5wYW5lbHMuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gdGhpcy5yZWZzLnBhbmVscy5jaGlsZHJlbltpXVxuICAgICAgaWYgKGNoaWxkLm9mZnNldFdpZHRoID4gMCkge1xuICAgICAgICBjaGlsZC5mb2N1cygpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2hvd0RlZmVycmVkUGFuZWwgKCkge1xuICAgIGlmICh0aGlzLmRlZmVycmVkUGFuZWwpIHtcbiAgICAgIGNvbnN0IHtuYW1lLCBvcHRpb25zfSA9IHRoaXMuZGVmZXJyZWRQYW5lbFxuICAgICAgdGhpcy5zaG93UGFuZWwobmFtZSwgb3B0aW9ucylcbiAgICB9XG4gIH1cblxuICAvLyBQdWJsaWM6IHNob3cgYSBwYW5lbC5cbiAgLy9cbiAgLy8gKiBgbmFtZWAge1N0cmluZ30gdGhlIG5hbWUgb2YgdGhlIHBhbmVsIHRvIHNob3dcbiAgLy8gKiBgb3B0aW9uc2Age09iamVjdH0gYW4gb3B0aW9ucyBoYXNoLiBXaWxsIGJlIHBhc3NlZCB0byBgYmVmb3JlU2hvdygpYCBvblxuICAvLyAgIHRoZSBwYW5lbC4gT3B0aW9ucyBtYXkgaW5jbHVkZSAoYnV0IGFyZSBub3QgbGltaXRlZCB0byk6XG4gIC8vICAgKiBgdXJpYCB0aGUgVVJJIHRoZSBwYW5lbCB3YXMgbGF1bmNoZWQgZnJvbVxuICBzaG93UGFuZWwgKG5hbWUsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBwYW5lbCA9IHRoaXMuZ2V0T3JDcmVhdGVQYW5lbChuYW1lLCBvcHRpb25zKVxuICAgIGlmIChwYW5lbCkge1xuICAgICAgdGhpcy5hcHBlbmRQYW5lbChwYW5lbCwgb3B0aW9ucylcbiAgICAgIHRoaXMubWFrZVBhbmVsTWVudUFjdGl2ZShuYW1lKVxuICAgICAgdGhpcy5zZXRBY3RpdmVQYW5lbChuYW1lLCBvcHRpb25zKVxuICAgICAgdGhpcy5kZWZlcnJlZFBhbmVsID0gbnVsbFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlZmVycmVkUGFuZWwgPSB7bmFtZSwgb3B0aW9uc31cbiAgICB9XG4gIH1cblxuICBzaG93UGFuZWxGb3JVUkkgKHVyaSkge1xuICAgIGNvbnN0IHJlZ2V4ID0gL2NvbmZpZ1xcLyhbYS16XSspXFwvPyhbYS16QS1aMC05Xy1dKyk/L2lcbiAgICBjb25zdCBtYXRjaCA9IHJlZ2V4LmV4ZWModXJpKVxuXG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICBjb25zdCBwYXRoMSA9IG1hdGNoWzFdXG4gICAgICBjb25zdCBwYXRoMiA9IG1hdGNoWzJdXG5cbiAgICAgIGlmIChwYXRoMSA9PT0gJ3BhY2thZ2VzJyAmJiBwYXRoMiAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2hvd1BhbmVsKHBhdGgyLCB7XG4gICAgICAgICAgdXJpOiB1cmksXG4gICAgICAgICAgcGFjazoge25hbWU6IHBhdGgyfSxcbiAgICAgICAgICBiYWNrOiBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UocGF0aDIpID8gJ1BhY2thZ2VzJyA6IG51bGxcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHBhbmVsTmFtZSA9IHBhdGgxWzBdLnRvVXBwZXJDYXNlKCkgKyBwYXRoMS5zbGljZSgxKVxuICAgICAgICB0aGlzLnNob3dQYW5lbChwYW5lbE5hbWUsIHt1cml9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFwcGVuZFBhbmVsIChwYW5lbCwgb3B0aW9ucykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yZWZzLnBhbmVscy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5yZWZzLnBhbmVscy5jaGlsZHJlbltpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnJlZnMucGFuZWxzLmNvbnRhaW5zKHBhbmVsLmVsZW1lbnQpKSB7XG4gICAgICB0aGlzLnJlZnMucGFuZWxzLmFwcGVuZENoaWxkKHBhbmVsLmVsZW1lbnQpXG4gICAgfVxuXG4gICAgaWYgKHBhbmVsLmJlZm9yZVNob3cpIHtcbiAgICAgIHBhbmVsLmJlZm9yZVNob3cob3B0aW9ucylcbiAgICB9XG4gICAgcGFuZWwuc2hvdygpXG4gICAgcGFuZWwuZm9jdXMoKVxuICB9XG5cbiAgc2V0QWN0aXZlUGFuZWwgKG5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuYWN0aXZlUGFuZWwgPSB7bmFtZSwgb3B0aW9uc31cbiAgfVxuXG4gIHJlbW92ZVBhbmVsIChuYW1lKSB7XG4gICAgY29uc3QgcGFuZWwgPSB0aGlzLnBhbmVsc0J5TmFtZVtuYW1lXVxuICAgIGlmIChwYW5lbCkge1xuICAgICAgcGFuZWwuZGVzdHJveSgpXG4gICAgICBkZWxldGUgdGhpcy5wYW5lbHNCeU5hbWVbbmFtZV1cbiAgICB9XG4gIH1cblxuICBnZXRUaXRsZSAoKSB7XG4gICAgcmV0dXJuICdTZXR0aW5ncydcbiAgfVxuXG4gIGdldEljb25OYW1lICgpIHtcbiAgICByZXR1cm4gJ3Rvb2xzJ1xuICB9XG5cbiAgZ2V0VVJJICgpIHtcbiAgICByZXR1cm4gdGhpcy51cmlcbiAgfVxuXG4gIGlzRXF1YWwgKG90aGVyKSB7XG4gICAgcmV0dXJuIG90aGVyIGluc3RhbmNlb2YgU2V0dGluZ3NWaWV3XG4gIH1cblxuICBzY3JvbGxVcCAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCAtPSBkb2N1bWVudC5ib2R5Lm9mZnNldEhlaWdodCAvIDIwXG4gIH1cblxuICBzY3JvbGxEb3duICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wICs9IGRvY3VtZW50LmJvZHkub2Zmc2V0SGVpZ2h0IC8gMjBcbiAgfVxuXG4gIHBhZ2VVcCAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCAtPSB0aGlzLmVsZW1lbnQub2Zmc2V0SGVpZ2h0XG4gIH1cblxuICBwYWdlRG93biAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCArPSB0aGlzLmVsZW1lbnQub2Zmc2V0SGVpZ2h0XG4gIH1cblxuICBzY3JvbGxUb1RvcCAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCA9IDBcbiAgfVxuXG4gIHNjcm9sbFRvQm90dG9tICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wID0gdGhpcy5lbGVtZW50LnNjcm9sbEhlaWdodFxuICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQWlEO0FBaEJqRDtBQUNBOztBQWlCZSxNQUFNQSxZQUFZLENBQUM7RUFDaENDLFdBQVcsQ0FBRTtJQUFDQyxHQUFHO0lBQUVDLGNBQWM7SUFBRUMsZ0JBQWdCO0lBQUVDO0VBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0lBQ3RFLElBQUksQ0FBQ0gsR0FBRyxHQUFHQSxHQUFHO0lBQ2QsSUFBSSxDQUFDQyxjQUFjLEdBQUdBLGNBQWM7SUFDcEMsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBR0EsZ0JBQWdCO0lBQ3hDLElBQUksQ0FBQ0UsYUFBYSxHQUFHRCxXQUFXO0lBQ2hDLElBQUksQ0FBQ0UsU0FBUyxHQUFHLEtBQUs7SUFDdEIsSUFBSSxDQUFDQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCLElBQUksQ0FBQ0Msb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO0lBRTlCQyxhQUFJLENBQUNDLFVBQVUsQ0FBQyxJQUFJLENBQUM7SUFDckIsSUFBSSxDQUFDQyxXQUFXLEdBQUcsSUFBSUMseUJBQW1CLEVBQUU7SUFDNUMsSUFBSSxDQUFDRCxXQUFXLENBQUNFLEdBQUcsQ0FBQ0MsSUFBSSxDQUFDQyxRQUFRLENBQUNGLEdBQUcsQ0FBQyxJQUFJLENBQUNHLE9BQU8sRUFBRTtNQUNuRCxjQUFjLEVBQUUsTUFBTTtRQUFFLElB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