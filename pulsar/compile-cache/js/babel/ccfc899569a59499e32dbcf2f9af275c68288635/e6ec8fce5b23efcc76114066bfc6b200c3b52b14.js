"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fuzzaldrin = _interopRequireDefault(require("fuzzaldrin"));
var _etch = _interopRequireDefault(require("etch"));
var _underscorePlus = _interopRequireDefault(require("underscore-plus"));
var _atom = require("atom");
var _collapsibleSectionPanel = _interopRequireDefault(require("./collapsible-section-panel"));
var _packageCard = _interopRequireDefault(require("./package-card"));
var _errorView = _interopRequireDefault(require("./error-view"));
var _list = _interopRequireDefault(require("./list"));
var _listView = _interopRequireDefault(require("./list-view"));
var _utils = require("./utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */
/** @jsx etch.dom */

class ThemesPanel extends _collapsibleSectionPanel.default {
  static loadPackagesDelay() {
    return 300;
  }
  constructor(settingsView, packageManager) {
    super();
    this.settingsView = settingsView;
    this.packageManager = packageManager;
    _etch.default.initialize(this);
    this.items = {
      dev: new _list.default('name'),
      core: new _list.default('name'),
      user: new _list.default('name'),
      git: new _list.default('name')
    };
    this.itemViews = {
      dev: new _listView.default(this.items.dev, this.refs.devPackages, this.createPackageCard.bind(this)),
      core: new _listView.default(this.items.core, this.refs.corePackages, this.createPackageCard.bind(this)),
      user: new _listView.default(this.items.user, this.refs.communityPackages, this.createPackageCard.bind(this)),
      git: new _listView.default(this.items.git, this.refs.gitPackages, this.createPackageCard.bind(this))
    };
    this.disposables = new _atom.CompositeDisposable();
    this.disposables.add(this.packageManager.on('theme-install-failed theme-uninstall-failed', ({
      pack,
      error
    }) => {
      this.refs.themeErrors.appendChild(new _errorView.default(this.packageManager, error).element);
    }));
    this.disposables.add(this.handleEvents());
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
    this.loadPackages();
    this.disposables.add(this.packageManager.on('theme-installed theme-uninstalled', () => {
      let loadPackagesTimeout;
      clearTimeout(loadPackagesTimeout);
      loadPackagesTimeout = setTimeout(() => {
        this.populateThemeMenus();
        this.loadPackages();
      }, ThemesPanel.loadPackagesDelay());
    }));
    this.disposables.add(atom.themes.onDidChangeActiveThemes(() => this.updateActiveThemes()));
    this.disposables.add(atom.tooltips.add(this.refs.activeUiThemeSettings, {
      title: 'Settings'
    }));
    this.disposables.add(atom.tooltips.add(this.refs.activeSyntaxThemeSettings, {
      title: 'Settings'
    }));
    this.updateActiveThemes();
    this.disposables.add(this.refs.filterEditor.onDidStopChanging(() => {
      this.matchPackages();
    }));
  }
  update() {}
  focus() {
    this.refs.filterEditor.element.focus();
  }
  show() {
    this.element.style.display = '';
  }
  destroy() {
    this.disposables.dispose();
    return _etch.default.destroy(this);
  }
  render() {
    return _etch.default.dom("div", {
      className: "panels-item",
      tabIndex: "-1"
    }, _etch.default.dom("div", {
      className: "section packages themes-panel"
    }, _etch.default.dom("div", {
      className: "section-container"
    }, _etch.default.dom("div", {
      className: "section-heading icon icon-paintcan"
    }, "Choose a Theme"), _etch.default.dom("div", {
      className: "text native-key-bindings",
      tabIndex: "-1"
    }, _etch.default.dom("span", {
      className: "icon icon-question"
    }, "You can also style Atom by editing "), _etch.default.dom("a", {
      className: "link",
      onclick: this.didClickOpenUserStyleSheet
    }, "your stylesheet")), _etch.default.dom("div", {
      className: "themes-picker"
    }, _etch.default.dom("div", {
      className: "themes-picker-item control-group"
    }, _etch.default.dom("div", {
      className: "controls"
    }, _etch.default.dom("label", {
      className: "control-label"
    }, _etch.default.dom("div", {
      className: "setting-title themes-label text"
    }, "UI Theme"), _etch.default.dom("div", {
      className: "setting-description text theme-description"
    }, "This styles the tabs, status bar, tree view, and dropdowns")), _etch.default.dom("div", {
      className: "select-container"
    }, _etch.default.dom("select", {
      ref: "uiMenu",
      className: "form-control",
      onchange: this.didChangeUiMenu.bind(this)
    }), _etch.default.dom("button", {
      ref: "activeUiThemeSettings",
      className: "btn icon icon-gear active-theme-settings",
      onclick: this.didClickActiveUiThemeSettings.bind(this)
    })))), _etch.default.dom("div", {
      className: "themes-picker-item control-group"
    }, _etch.default.dom("div", {
      className: "controls"
    }, _etch.default.dom("label", {
      className: "control-label"
    }, _etch.default.dom("div", {
      className: "setting-title themes-label text"
    }, "Syntax Theme"), _etch.default.dom("div", {
      className: "setting-description text theme-description"
    }, "This styles the text inside the editor")), _etch.default.dom("div", {
      className: "select-container"
    }, _etch.default.dom("select", {
      ref: "syntaxMenu",
      className: "form-control",
      onchange: this.didChangeSyntaxMenu.bind(this)
    }), _etch.default.dom("button", {
      ref: "activeSyntaxThemeSettings",
      className: "btn icon icon-gear active-syntax-settings",
      onclick: this.didClickActiveSyntaxThemeSettings.bind(this)
    }))))))), _etch.default.dom("section", {
      className: "section"
    }, _etch.default.dom("div", {
      className: "section-container"
    }, _etch.default.dom("div", {
      className: "section-heading icon icon-paintcan"
    }, "Installed Themes", _etch.default.dom("span", {
      ref: "totalPackages",
      className: "section-heading-count badge badge-flexible"
    }, "\u2026")), _etch.default.dom("div", {
      className: "editor-container"
    }, _etch.default.dom(_atom.TextEditor, {
      ref: "filterEditor",
      mini: true,
      placeholderText: "Filter themes by name"
    })), _etch.default.dom("div", {
      ref: "themeErrors"
    }), _etch.default.dom("section", {
      className: "sub-section installed-packages"
    }, _etch.default.dom("h3", {
      ref: "communityThemesHeader",
      className: "sub-section-heading icon icon-paintcan"
    }, "Community Themes", _etch.default.dom("span", {
      ref: "communityCount",
      className: "section-heading-count badge badge-flexible"
    }, "\u2026")), _etch.default.dom("div", {
      ref: "communityPackages",
      className: "container package-container"
    }, _etch.default.dom("div", {
      ref: "communityLoadingArea",
      className: "alert alert-info loading-area icon icon-hourglass"
    }, "Loading themes\u2026"))), _etch.default.dom("section", {
      className: "sub-section core-packages"
    }, _etch.default.dom("h3", {
      ref: "coreThemesHeader",
      className: "sub-section-heading icon icon-paintcan"
    }, "Core Themes", _etch.default.dom("span", {
      ref: "coreCount",
      className: "section-heading-count badge badge-flexible"
    }, "\u2026")), _etch.default.dom("div", {
      ref: "corePackages",
      className: "container package-container"
    }, _etch.default.dom("div", {
      ref: "coreLoadingArea",
      className: "alert alert-info loading-area icon icon-hourglass"
    }, "Loading themes\u2026"))), _etch.default.dom("section", {
      className: "sub-section dev-packages"
    }, _etch.default.dom("h3", {
      ref: "developmentThemesHeader",
      className: "sub-section-heading icon icon-paintcan"
    }, "Development Themes", _etch.default.dom("span", {
      ref: "devCount",
      className: "section-heading-count badge badge-flexible"
    }, "\u2026")), _etch.default.dom("div", {
      ref: "devPackages",
      className: "container package-container"
    }, _etch.default.dom("div", {
      ref: "devLoadingArea",
      className: "alert alert-info loading-area icon icon-hourglass"
    }, "Loading themes\u2026"))), _etch.default.dom("section", {
      className: "sub-section git-packages"
    }, _etch.default.dom("h3", {
      ref: "gitThemesHeader",
      className: "sub-section-heading icon icon-paintcan"
    }, "Git Themes", _etch.default.dom("span", {
      ref: "gitCount",
      className: "section-heading-count badge badge-flexible"
    }, "\u2026")), _etch.default.dom("div", {
      ref: "gitPackages",
      className: "container package-container"
    }, _etch.default.dom("div", {
      ref: "gitLoadingArea",
      className: "alert alert-info loading-area icon icon-hourglass"
    }, "Loading themes\u2026"))))));
  }
  filterThemes(packages) {
    packages.dev = packages.dev.filter(({
      theme
    }) => theme);
    packages.user = packages.user.filter(({
      theme
    }) => theme);
    packages.core = packages.core.filter(({
      theme
    }) => theme);
    packages.git = (packages.git || []).filter(({
      theme
    }) => theme);
    for (let pack of packages.core) {
      if (pack.repository == null) {
        pack.repository = `https://github.com/atom/${pack.name}`;
      }
    }
    for (let packageType of ['dev', 'core', 'user', 'git']) {
      for (let pack of packages[packageType]) {
        pack.owner = (0, _utils.ownerFromRepository)(pack.repository);
      }
    }
    return packages;
  }
  sortThemes(packages) {
    packages.dev.sort(_utils.packageComparatorAscending);
    packages.core.sort(_utils.packageComparatorAscending);
    packages.user.sort(_utils.packageComparatorAscending);
    packages.git.sort(_utils.packageComparatorAscending);
    return packages;
  }
  loadPackages() {
    this.packageViews = [];
    this.packageManager.getInstalled().then(packages => {
      this.packages = this.sortThemes(this.filterThemes(packages));
      this.refs.devLoadingArea.remove();
      this.items.dev.setItems(this.packages.dev);
      this.refs.coreLoadingArea.remove();
      this.items.core.setItems(this.packages.core);
      this.refs.communityLoadingArea.remove();
      this.items.user.setItems(this.packages.user);
      this.refs.gitLoadingArea.remove();
      this.items.git.setItems(this.packages.git);

      // TODO show empty mesage per section

      this.updateSectionCounts();
    }).catch(error => {
      this.refs.themeErrors.appendChild(new _errorView.default(this.packageManager, error).element);
    });
  }

  // Update the active UI and syntax themes and populate the menu
  updateActiveThemes() {
    this.activeUiTheme = this.getActiveUiTheme();
    this.activeSyntaxTheme = this.getActiveSyntaxTheme();
    this.populateThemeMenus();
    this.toggleActiveThemeButtons();
  }
  toggleActiveThemeButtons() {
    if (this.hasSettings(this.activeUiTheme)) {
      this.refs.activeUiThemeSettings.style.display = '';
    } else {
      this.refs.activeUiThemeSettings.style.display = 'none';
    }
    if (this.hasSettings(this.activeSyntaxTheme)) {
      this.refs.activeSyntaxThemeSettings.display = '';
    } else {
      this.refs.activeSyntaxThemeSettings.display = 'none';
    }
  }
  hasSettings(packageName) {
    return this.packageManager.packageHasSettings(packageName);
  }

  // Populate the theme menus from the theme manager's active themes
  populateThemeMenus() {
    this.refs.uiMenu.innerHTML = '';
    this.refs.syntaxMenu.innerHTML = '';
    const availableThemes = _underscorePlus.default.sortBy(atom.themes.getLoadedThemes(), 'name');
    for (let {
      name,
      metadata
    } of availableThemes) {
      switch (metadata.theme) {
        case 'ui':
          {
            const themeItem = this.createThemeMenuItem(name);
            if (name === this.activeUiTheme) {
              themeItem.selected = true;
            }
            this.refs.uiMenu.appendChild(themeItem);
            break;
          }
        case 'syntax':
          {
            const themeItem = this.createThemeMenuItem(name);
            if (name === this.activeSyntaxTheme) {
              themeItem.selected = true;
            }
            this.refs.syntaxMenu.appendChild(themeItem);
            break;
          }
      }
    }
  }

  // Get the name of the active ui theme.
  getActiveUiTheme() {
    for (let {
      name,
      metadata
    } of atom.themes.getActiveThemes()) {
      if (metadata.theme === 'ui') {
        return name;
      }
    }
    return null;
  }

  // Get the name of the active syntax theme.
  getActiveSyntaxTheme() {
    for (let {
      name,
      metadata
    } of atom.themes.getActiveThemes()) {
      if (metadata.theme === 'syntax') {
        return name;
      }
    }
    return null;
  }

  // Update the config with the selected themes
  updateThemeConfig() {
    const themes = [];
    if (this.activeUiTheme) {
      themes.push(this.activeUiTheme);
    }
    if (this.activeSyntaxTheme) {
      themes.push(this.activeSyntaxTheme);
    }
    if (themes.length > 0) {
      atom.config.set('core.themes', themes);
    }
  }
  scheduleUpdateThemeConfig() {
    setTimeout(() => {
      this.updateThemeConfig();
    }, 100);
  }

  // Create a menu item for the given theme name.
  createThemeMenuItem(themeName) {
    const title = _underscorePlus.default.undasherize(_underscorePlus.default.uncamelcase(themeName.replace(/-(ui|syntax)/g, '').replace(/-theme$/g, '')));
    const option = document.createElement('option');
    option.value = themeName;
    option.textContent = title;
    return option;
  }
  createPackageCard(pack) {
    return new _packageCard.default(pack, this.settingsView, this.packageManager, {
      back: 'Themes'
    });
  }
  filterPackageListByText(text) {
    if (!this.packages) {
      return;
    }
    for (let packageType of ['dev', 'core', 'user', 'git']) {
      const allViews = this.itemViews[packageType].getViews();
      const activeViews = this.itemViews[packageType].filterViews(pack => {
        if (text === '') {
          return true;
        } else {
          const owner = pack.owner != null ? pack.owner : (0, _utils.ownerFromRepository)(pack.repository);
          const filterText = `${pack.name} ${owner}`;
          return _fuzzaldrin.default.score(filterText, text) > 0;
        }
      });
      for (const view of allViews) {
        if (view) {
          view.element.style.display = 'none';
          view.element.classList.add('hidden');
        }
      }
      for (const view of activeViews) {
        if (view) {
          view.element.style.display = '';
          view.element.classList.remove('hidden');
        }
      }
    }
    this.updateSectionCounts();
  }
  updateUnfilteredSectionCounts() {
    this.updateSectionCount(this.refs.communityThemesHeader, this.refs.communityCount, this.packages.user.length);
    this.updateSectionCount(this.refs.coreThemesHeader, this.refs.coreCount, this.packages.core.length);
    this.updateSectionCount(this.refs.developmentThemesHeader, this.refs.devCount, this.packages.dev.length);
    this.updateSectionCount(this.refs.gitThemesHeader, this.refs.gitCount, this.packages.git.length);
    this.refs.totalPackages.textContent = `${this.packages.user.length + this.packages.core.length + this.packages.dev.length + this.packages.git.length}`;
  }
  updateFilteredSectionCounts() {
    const community = this.notHiddenCardsLength(this.refs.communityPackages);
    this.updateSectionCount(this.refs.communityThemesHeader, this.refs.communityCount, community, this.packages.user.length);
    const dev = this.notHiddenCardsLength(this.refs.devPackages);
    this.updateSectionCount(this.refs.developmentThemesHeader, this.refs.devCount, dev, this.packages.dev.length);
    const core = this.notHiddenCardsLength(this.refs.corePackages);
    this.updateSectionCount(this.refs.coreThemesHeader, this.refs.coreCount, core, this.packages.core.length);
    const git = this.notHiddenCardsLength(this.refs.gitPackages);
    this.updateSectionCount(this.refs.gitThemesHeader, this.refs.gitCount, git, this.packages.git.length);
    const shownThemes = dev + core + community + git;
    const totalThemes = this.packages.user.length + this.packages.core.length + this.packages.dev.length + this.packages.git.length;
    this.refs.totalPackages.textContent = `${shownThemes}/${totalThemes}`;
  }
  resetSectionHasItems() {
    this.resetCollapsibleSections([this.refs.communityThemesHeader, this.refs.coreThemesHeader, this.refs.developmentThemesHeader, this.refs.gitThemesHeader]);
  }
  matchPackages() {
    this.filterPackageListByText(this.refs.filterEditor.getText());
  }
  didClickOpenUserStyleSheet(e) {
    e.preventDefault();
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'application:open-your-stylesheet');
  }
  didChangeUiMenu() {
    this.activeUiTheme = this.refs.uiMenu.value;
    this.scheduleUpdateThemeConfig();
  }
  didChangeSyntaxMenu() {
    this.activeSyntaxTheme = this.refs.syntaxMenu.value;
    this.scheduleUpdateThemeConfig();
  }
  didClickActiveUiThemeSettings(event) {
    event.stopPropagation();
    const theme = atom.themes.getActiveThemes().find(theme => theme.metadata.theme === 'ui');
    const activeUiTheme = theme != null ? theme.metadata : null;
    if (activeUiTheme != null) {
      this.settingsView.showPanel(this.activeUiTheme, {
        back: 'Themes',
        pack: activeUiTheme
      });
    }
  }
  didClickActiveSyntaxThemeSettings(event) {
    event.stopPropagation();
    const theme = atom.themes.getActiveThemes().find(theme => theme.metadata.theme === 'syntax');
    const activeSyntaxTheme = theme != null ? theme.metadata : null;
    if (activeSyntaxTheme != null) {
      this.settingsView.showPanel(this.activeSyntaxTheme, {
        back: 'Themes',
        pack: activeSyntaxTheme
      });
    }
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
exports.default = ThemesPanel;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaGVtZXNQYW5lbCIsIkNvbGxhcHNpYmxlU2VjdGlvblBhbmVsIiwibG9hZFBhY2thZ2VzRGVsYXkiLCJjb25zdHJ1Y3RvciIsInNldHRpbmdzVmlldyIsInBhY2thZ2VNYW5hZ2VyIiwiZXRjaCIsImluaXRpYWxpemUiLCJpdGVtcyIsImRldiIsIkxpc3QiLCJjb3JlIiwidXNlciIsImdpdCIsIml0ZW1WaWV3cyIsIkxpc3RWaWV3IiwicmVmcyIsImRldlBhY2thZ2VzIiwiY3JlYXRlUGFja2FnZUNhcmQiLCJiaW5kIiwiY29yZVBhY2thZ2VzIiwiY29tbXVuaXR5UGFja2FnZXMiLCJnaXRQYWNrYWdlcyIsImRpc3Bvc2FibGVzIiwiQ29tcG9zaXRlRGlzcG9zYWJsZSIsImFkZCIsIm9uIiwicGFjayIsImVycm9yIiwidGhlbWVFcnJvcnMiLCJhcHBlbmRDaGlsZCIsIkVycm9yVmlldyIsImVsZW1lbnQiLCJoYW5kbGVFdmVudHMiLCJhdG9tIiwiY29tbWFuZHMiLCJzY3JvbGxVcCIsInNjcm9sbERvd24iLCJwYWdlVXAiLCJwYWdlRG93biIsInNjcm9sbFRvVG9wIiwic2Nyb2xsVG9Cb3R0b20iLCJsb2FkUGFja2FnZXMiLCJsb2FkUGFja2FnZXNUaW1lb3V0IiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsInBvcHVsYXRlVGhlbWVNZW51cyIsInRoZW1lcyIsIm9uRGlkQ2hhbmdlQWN0aXZlVGhlbWVzIiwidXBkYXRlQWN0aXZlVGhlbWVzIiwidG9vbHRpcHMiLCJhY3RpdmVVaVRoZW1lU2V0dGluZ3MiLCJ0aXRsZSIsImFjdGl2ZVN5bnRheFRoZW1lU2V0dGluZ3MiLCJmaWx0ZXJFZGl0b3IiLCJvbkRpZFN0b3BDaGFuZ2luZyIsIm1hdGNoUGFja2FnZXMiLCJ1cGRhdGUiLCJmb2N1cyIsInNob3ciLCJzdHlsZSIsImRpc3BsYXkiLCJkZXN0cm95IiwiZGlzcG9zZSIsInJlbmRlciIsImRpZENsaWNrT3BlblVzZXJTdHlsZVNoZWV0IiwiZGlkQ2hhbmdlVWlNZW51IiwiZGlkQ2xpY2tBY3RpdmVVaVRoZW1lU2V0dGluZ3MiLCJkaWRDaGFuZ2VTeW50YXhNZW51IiwiZGlkQ2xpY2tBY3RpdmVTeW50YXhUaGVtZVNldHRpbmdzIiwiZmlsdGVyVGhlbWVzIiwicGFja2FnZXMiLCJmaWx0ZXIiLCJ0aGVtZSIsInJlcG9zaXRvcnkiLCJuYW1lIiwicGFja2FnZVR5cGUiLCJvd25lciIsIm93bmVyRnJvbVJlcG9zaXRvcnkiLCJzb3J0VGhlbWVzIiwic29ydCIsInBhY2thZ2VDb21wYXJhdG9yQXNjZW5kaW5nIiwicGFja2FnZVZpZXdzIiwiZ2V0SW5zdGFsbGVkIiwidGhlbiIsImRldkxvYWRpbmdBcmVhIiwicmVtb3ZlIiwic2V0SXRlbXMiLCJjb3JlTG9hZGluZ0FyZWEiLCJjb21tdW5pdHlMb2FkaW5nQXJlYSIsImdpdExvYWRpbmdBcmVhIiwidXBkYXRlU2VjdGlvbkNvdW50cyIsImNhdGNoIiwiYWN0aXZlVWlUaGVtZSIsImdldEFjdGl2ZVVpVGhlbWUiLCJhY3RpdmVTeW50YXhUaGVtZSIsImdldEFjdGl2ZVN5bnRheFRoZW1lIiwidG9nZ2xlQWN0aXZlVGhlbWVCdXR0b25zIiwiaGFzU2V0dGluZ3MiLCJwYWNrYWdlTmFtZSIsInBhY2thZ2VIYXNTZXR0aW5ncyIsInVpTWVudSIsImlubmVySFRNTCIsInN5bnRheE1lbnUiLCJhdmFpbGFibGVUaGVtZXMiLCJfIiwic29ydEJ5IiwiZ2V0TG9hZGVkVGhlbWVzIiwibWV0YWRhdGEiLCJ0aGVtZUl0ZW0iLCJjcmVhdGVUaGVtZU1lbnVJdGVtIiwic2VsZWN0ZWQiLCJnZXRBY3RpdmVUaGVtZXMiLCJ1cGRhdGVUaGVtZUNvbmZpZyIsInB1c2giLCJsZW5ndGgiLCJjb25maWciLCJzZXQiLCJzY2hlZHVsZVVwZGF0ZVRoZW1lQ29uZmlnIiwidGhlbWVOYW1lIiwidW5kYXNoZXJpemUiLCJ1bmNhbWVsY2FzZSIsInJlcGxhY2UiLCJvcHRpb24iLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ2YWx1ZSIsInRleHRDb250ZW50IiwiUGFja2FnZUNhcmQiLCJiYWNrIiwiZmlsdGVyUGFja2FnZUxpc3RCeVRleHQiLCJ0ZXh0IiwiYWxsVmlld3MiLCJnZXRWaWV3cyIsImFjdGl2ZVZpZXdzIiwiZmlsdGVyVmlld3MiLCJmaWx0ZXJUZXh0IiwiZnV6emFsZHJpbiIsInNjb3JlIiwidmlldyIsImNsYXNzTGlzdCIsInVwZGF0ZVVuZmlsdGVyZWRTZWN0aW9uQ291bnRzIiwidXBkYXRlU2VjdGlvbkNvdW50IiwiY29tbXVuaXR5VGhlbWVzSGVhZGVyIiwiY29tbXVuaXR5Q291bnQiLCJjb3JlVGhlbWVzSGVhZGVyIiwiY29yZUNvdW50IiwiZGV2ZWxvcG1lbnRUaGVtZXNIZWFkZXIiLCJkZXZDb3VudCIsImdpdFRoZW1lc0hlYWRlciIsImdpdENvdW50IiwidG90YWxQYWNrYWdlcyIsInVwZGF0ZUZpbHRlcmVkU2VjdGlvbkNvdW50cyIsImNvbW11bml0eSIsIm5vdEhpZGRlbkNhcmRzTGVuZ3RoIiwic2hvd25UaGVtZXMiLCJ0b3RhbFRoZW1lcyIsInJlc2V0U2VjdGlvbkhhc0l0ZW1zIiwicmVzZXRDb2xsYXBzaWJsZVNlY3Rpb25zIiwiZ2V0VGV4dCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImRpc3BhdGNoIiwidmlld3MiLCJnZXRWaWV3Iiwid29ya3NwYWNlIiwiZXZlbnQiLCJzdG9wUHJvcGFnYXRpb24iLCJmaW5kIiwic2hvd1BhbmVsIiwic2Nyb2xsVG9wIiwiYm9keSIsIm9mZnNldEhlaWdodCIsInNjcm9sbEhlaWdodCJdLCJzb3VyY2VzIjpbInRoZW1lcy1wYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG4vKiogQGpzeCBldGNoLmRvbSAqL1xuXG5pbXBvcnQgZnV6emFsZHJpbiBmcm9tICdmdXp6YWxkcmluJ1xuaW1wb3J0IGV0Y2ggZnJvbSAnZXRjaCdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUtcGx1cydcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgVGV4dEVkaXRvcn0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IENvbGxhcHNpYmxlU2VjdGlvblBhbmVsIGZyb20gJy4vY29sbGFwc2libGUtc2VjdGlvbi1wYW5lbCdcbmltcG9ydCBQYWNrYWdlQ2FyZCBmcm9tICcuL3BhY2thZ2UtY2FyZCdcbmltcG9ydCBFcnJvclZpZXcgZnJvbSAnLi9lcnJvci12aWV3J1xuXG5pbXBvcnQgTGlzdCBmcm9tICcuL2xpc3QnXG5pbXBvcnQgTGlzdFZpZXcgZnJvbSAnLi9saXN0LXZpZXcnXG5pbXBvcnQge293bmVyRnJvbVJlcG9zaXRvcnksIHBhY2thZ2VDb21wYXJhdG9yQXNjZW5kaW5nfSBmcm9tICcuL3V0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaGVtZXNQYW5lbCBleHRlbmRzIENvbGxhcHNpYmxlU2VjdGlvblBhbmVsIHtcbiAgc3RhdGljIGxvYWRQYWNrYWdlc0RlbGF5ICgpIHtcbiAgICByZXR1cm4gMzAwXG4gIH1cblxuICBjb25zdHJ1Y3RvciAoc2V0dGluZ3NWaWV3LCBwYWNrYWdlTWFuYWdlcikge1xuICAgIHN1cGVyKClcblxuICAgIHRoaXMuc2V0dGluZ3NWaWV3ID0gc2V0dGluZ3NWaWV3XG4gICAgdGhpcy5wYWNrYWdlTWFuYWdlciA9IHBhY2thZ2VNYW5hZ2VyXG4gICAgZXRjaC5pbml0aWFsaXplKHRoaXMpXG4gICAgdGhpcy5pdGVtcyA9IHtcbiAgICAgIGRldjogbmV3IExpc3QoJ25hbWUnKSxcbiAgICAgIGNvcmU6IG5ldyBMaXN0KCduYW1lJyksXG4gICAgICB1c2VyOiBuZXcgTGlzdCgnbmFtZScpLFxuICAgICAgZ2l0OiBuZXcgTGlzdCgnbmFtZScpXG4gICAgfVxuICAgIHRoaXMuaXRlbVZpZXdzID0ge1xuICAgICAgZGV2OiBuZXcgTGlzdFZpZXcodGhpcy5pdGVtcy5kZXYsIHRoaXMucmVmcy5kZXZQYWNrYWdlcywgdGhpcy5jcmVhdGVQYWNrYWdlQ2FyZC5iaW5kKHRoaXMpKSxcbiAgICAgIGNvcmU6IG5ldyBMaXN0Vmlldyh0aGlzLml0ZW1zLmNvcmUsIHRoaXMucmVmcy5jb3JlUGFja2FnZXMsIHRoaXMuY3JlYXRlUGFja2FnZUNhcmQuYmluZCh0aGlzKSksXG4gICAgICB1c2VyOiBuZXcgTGlzdFZpZXcodGhpcy5pdGVtcy51c2VyLCB0aGlzLnJlZnMuY29tbXVuaXR5UGFja2FnZXMsIHRoaXMuY3JlYXRlUGFja2FnZUNhcmQuYmluZCh0aGlzKSksXG4gICAgICBnaXQ6IG5ldyBMaXN0Vmlldyh0aGlzLml0ZW1zLmdpdCwgdGhpcy5yZWZzLmdpdFBhY2thZ2VzLCB0aGlzLmNyZWF0ZVBhY2thZ2VDYXJkLmJpbmQodGhpcykpXG4gICAgfVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIHRoaXMucGFja2FnZU1hbmFnZXIub24oJ3RoZW1lLWluc3RhbGwtZmFpbGVkIHRoZW1lLXVuaW5zdGFsbC1mYWlsZWQnLCAoe3BhY2ssIGVycm9yfSkgPT4ge1xuICAgICAgICB0aGlzLnJlZnMudGhlbWVFcnJvcnMuYXBwZW5kQ2hpbGQobmV3IEVycm9yVmlldyh0aGlzLnBhY2thZ2VNYW5hZ2VyLCBlcnJvcikuZWxlbWVudClcbiAgICAgIH0pXG4gICAgKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuaGFuZGxlRXZlbnRzKCkpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4geyB0aGlzLnNjcm9sbFVwKCkgfSxcbiAgICAgICdjb3JlOm1vdmUtZG93bic6ICgpID0+IHsgdGhpcy5zY3JvbGxEb3duKCkgfSxcbiAgICAgICdjb3JlOnBhZ2UtdXAnOiAoKSA9PiB7IHRoaXMucGFnZVVwKCkgfSxcbiAgICAgICdjb3JlOnBhZ2UtZG93bic6ICgpID0+IHsgdGhpcy5wYWdlRG93bigpIH0sXG4gICAgICAnY29yZTptb3ZlLXRvLXRvcCc6ICgpID0+IHsgdGhpcy5zY3JvbGxUb1RvcCgpIH0sXG4gICAgICAnY29yZTptb3ZlLXRvLWJvdHRvbSc6ICgpID0+IHsgdGhpcy5zY3JvbGxUb0JvdHRvbSgpIH1cbiAgICB9KSlcbiAgICB0aGlzLmxvYWRQYWNrYWdlcygpXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIHRoaXMucGFja2FnZU1hbmFnZXIub24oJ3RoZW1lLWluc3RhbGxlZCB0aGVtZS11bmluc3RhbGxlZCcsICgpID0+IHtcbiAgICAgICAgbGV0IGxvYWRQYWNrYWdlc1RpbWVvdXRcbiAgICAgICAgY2xlYXJUaW1lb3V0KGxvYWRQYWNrYWdlc1RpbWVvdXQpXG4gICAgICAgIGxvYWRQYWNrYWdlc1RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLnBvcHVsYXRlVGhlbWVNZW51cygpXG4gICAgICAgICAgdGhpcy5sb2FkUGFja2FnZXMoKVxuICAgICAgICB9LCBUaGVtZXNQYW5lbC5sb2FkUGFja2FnZXNEZWxheSgpKVxuICAgICAgfSlcbiAgICApXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLnRoZW1lcy5vbkRpZENoYW5nZUFjdGl2ZVRoZW1lcygoKSA9PiB0aGlzLnVwZGF0ZUFjdGl2ZVRoZW1lcygpKSlcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLnRvb2x0aXBzLmFkZCh0aGlzLnJlZnMuYWN0aXZlVWlUaGVtZVNldHRpbmdzLCB7dGl0bGU6ICdTZXR0aW5ncyd9KSlcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLnRvb2x0aXBzLmFkZCh0aGlzLnJlZnMuYWN0aXZlU3ludGF4VGhlbWVTZXR0aW5ncywge3RpdGxlOiAnU2V0dGluZ3MnfSkpXG4gICAgdGhpcy51cGRhdGVBY3RpdmVUaGVtZXMoKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5yZWZzLmZpbHRlckVkaXRvci5vbkRpZFN0b3BDaGFuZ2luZygoKSA9PiB7IHRoaXMubWF0Y2hQYWNrYWdlcygpIH0pKVxuICB9XG5cbiAgdXBkYXRlICgpIHt9XG5cbiAgZm9jdXMgKCkge1xuICAgIHRoaXMucmVmcy5maWx0ZXJFZGl0b3IuZWxlbWVudC5mb2N1cygpXG4gIH1cblxuICBzaG93ICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIHJldHVybiBldGNoLmRlc3Ryb3kodGhpcylcbiAgfVxuXG4gIHJlbmRlciAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdwYW5lbHMtaXRlbScgdGFiSW5kZXg9Jy0xJz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NlY3Rpb24gcGFja2FnZXMgdGhlbWVzLXBhbmVsJz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2VjdGlvbi1jb250YWluZXInPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NlY3Rpb24taGVhZGluZyBpY29uIGljb24tcGFpbnRjYW4nPkNob29zZSBhIFRoZW1lPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSd0ZXh0IG5hdGl2ZS1rZXktYmluZGluZ3MnIHRhYkluZGV4PSctMSc+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0naWNvbiBpY29uLXF1ZXN0aW9uJz5Zb3UgY2FuIGFsc28gc3R5bGUgQXRvbSBieSBlZGl0aW5nIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPGEgY2xhc3NOYW1lPSdsaW5rJyBvbmNsaWNrPXt0aGlzLmRpZENsaWNrT3BlblVzZXJTdHlsZVNoZWV0fT55b3VyIHN0eWxlc2hlZXQ8L2E+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3RoZW1lcy1waWNrZXInPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ndGhlbWVzLXBpY2tlci1pdGVtIGNvbnRyb2wtZ3JvdXAnPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb250cm9scyc+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPSdjb250cm9sLWxhYmVsJz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NldHRpbmctdGl0bGUgdGhlbWVzLWxhYmVsIHRleHQnPlVJIFRoZW1lPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZXR0aW5nLWRlc2NyaXB0aW9uIHRleHQgdGhlbWUtZGVzY3JpcHRpb24nPlRoaXMgc3R5bGVzIHRoZSB0YWJzLCBzdGF0dXMgYmFyLCB0cmVlIHZpZXcsIGFuZCBkcm9wZG93bnM8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2VsZWN0LWNvbnRhaW5lcic+XG4gICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgcmVmPSd1aU1lbnUnIGNsYXNzTmFtZT0nZm9ybS1jb250cm9sJyBvbmNoYW5nZT17dGhpcy5kaWRDaGFuZ2VVaU1lbnUuYmluZCh0aGlzKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIHJlZj0nYWN0aXZlVWlUaGVtZVNldHRpbmdzJ1xuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nYnRuIGljb24gaWNvbi1nZWFyIGFjdGl2ZS10aGVtZS1zZXR0aW5ncydcbiAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrPXt0aGlzLmRpZENsaWNrQWN0aXZlVWlUaGVtZVNldHRpbmdzLmJpbmQodGhpcyl9IC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3RoZW1lcy1waWNrZXItaXRlbSBjb250cm9sLWdyb3VwJz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29udHJvbHMnPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT0nY29udHJvbC1sYWJlbCc+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZXR0aW5nLXRpdGxlIHRoZW1lcy1sYWJlbCB0ZXh0Jz5TeW50YXggVGhlbWU8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NldHRpbmctZGVzY3JpcHRpb24gdGV4dCB0aGVtZS1kZXNjcmlwdGlvbic+VGhpcyBzdHlsZXMgdGhlIHRleHQgaW5zaWRlIHRoZSBlZGl0b3I8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2VsZWN0LWNvbnRhaW5lcic+XG4gICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgcmVmPSdzeW50YXhNZW51JyBjbGFzc05hbWU9J2Zvcm0tY29udHJvbCcgb25jaGFuZ2U9e3RoaXMuZGlkQ2hhbmdlU3ludGF4TWVudS5iaW5kKHRoaXMpfSAvPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgcmVmPSdhY3RpdmVTeW50YXhUaGVtZVNldHRpbmdzJ1xuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nYnRuIGljb24gaWNvbi1nZWFyIGFjdGl2ZS1zeW50YXgtc2V0dGluZ3MnXG4gICAgICAgICAgICAgICAgICAgICAgb25jbGljaz17dGhpcy5kaWRDbGlja0FjdGl2ZVN5bnRheFRoZW1lU2V0dGluZ3MuYmluZCh0aGlzKX0gLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9J3NlY3Rpb24nPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZWN0aW9uLWNvbnRhaW5lcic+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2VjdGlvbi1oZWFkaW5nIGljb24gaWNvbi1wYWludGNhbic+XG4gICAgICAgICAgICAgIEluc3RhbGxlZCBUaGVtZXNcbiAgICAgICAgICAgICAgPHNwYW4gcmVmPSd0b3RhbFBhY2thZ2VzJyBjbGFzc05hbWU9J3NlY3Rpb24taGVhZGluZy1jb3VudCBiYWRnZSBiYWRnZS1mbGV4aWJsZSc+4oCmPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nZWRpdG9yLWNvbnRhaW5lcic+XG4gICAgICAgICAgICAgIDxUZXh0RWRpdG9yIHJlZj0nZmlsdGVyRWRpdG9yJyBtaW5pIHBsYWNlaG9sZGVyVGV4dD0nRmlsdGVyIHRoZW1lcyBieSBuYW1lJyAvPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgcmVmPSd0aGVtZUVycm9ycycgLz5cblxuICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPSdzdWItc2VjdGlvbiBpbnN0YWxsZWQtcGFja2FnZXMnPlxuICAgICAgICAgICAgICA8aDMgcmVmPSdjb21tdW5pdHlUaGVtZXNIZWFkZXInIGNsYXNzTmFtZT0nc3ViLXNlY3Rpb24taGVhZGluZyBpY29uIGljb24tcGFpbnRjYW4nPlxuICAgICAgICAgICAgICAgIENvbW11bml0eSBUaGVtZXNcbiAgICAgICAgICAgICAgICA8c3BhbiByZWY9J2NvbW11bml0eUNvdW50JyBjbGFzc05hbWU9J3NlY3Rpb24taGVhZGluZy1jb3VudCBiYWRnZSBiYWRnZS1mbGV4aWJsZSc+4oCmPC9zcGFuPlxuICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICA8ZGl2IHJlZj0nY29tbXVuaXR5UGFja2FnZXMnIGNsYXNzTmFtZT0nY29udGFpbmVyIHBhY2thZ2UtY29udGFpbmVyJz5cbiAgICAgICAgICAgICAgICA8ZGl2IHJlZj0nY29tbXVuaXR5TG9hZGluZ0FyZWEnIGNsYXNzTmFtZT0nYWxlcnQgYWxlcnQtaW5mbyBsb2FkaW5nLWFyZWEgaWNvbiBpY29uLWhvdXJnbGFzcyc+TG9hZGluZyB0aGVtZXPigKY8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT0nc3ViLXNlY3Rpb24gY29yZS1wYWNrYWdlcyc+XG4gICAgICAgICAgICAgIDxoMyByZWY9J2NvcmVUaGVtZXNIZWFkZXInIGNsYXNzTmFtZT0nc3ViLXNlY3Rpb24taGVhZGluZyBpY29uIGljb24tcGFpbnRjYW4nPlxuICAgICAgICAgICAgICAgIENvcmUgVGhlbWVzXG4gICAgICAgICAgICAgICAgPHNwYW4gcmVmPSdjb3JlQ291bnQnIGNsYXNzTmFtZT0nc2VjdGlvbi1oZWFkaW5nLWNvdW50IGJhZGdlIGJhZGdlLWZsZXhpYmxlJz7igKY8L3NwYW4+XG4gICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICAgIDxkaXYgcmVmPSdjb3JlUGFja2FnZXMnIGNsYXNzTmFtZT0nY29udGFpbmVyIHBhY2thZ2UtY29udGFpbmVyJz5cbiAgICAgICAgICAgICAgICA8ZGl2IHJlZj0nY29yZUxvYWRpbmdBcmVhJyBjbGFzc05hbWU9J2FsZXJ0IGFsZXJ0LWluZm8gbG9hZGluZy1hcmVhIGljb24gaWNvbi1ob3VyZ2xhc3MnPkxvYWRpbmcgdGhlbWVz4oCmPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9J3N1Yi1zZWN0aW9uIGRldi1wYWNrYWdlcyc+XG4gICAgICAgICAgICAgIDxoMyByZWY9J2RldmVsb3BtZW50VGhlbWVzSGVhZGVyJyBjbGFzc05hbWU9J3N1Yi1zZWN0aW9uLWhlYWRpbmcgaWNvbiBpY29uLXBhaW50Y2FuJz5cbiAgICAgICAgICAgICAgICBEZXZlbG9wbWVudCBUaGVtZXNcbiAgICAgICAgICAgICAgICA8c3BhbiByZWY9J2RldkNvdW50JyBjbGFzc05hbWU9J3NlY3Rpb24taGVhZGluZy1jb3VudCBiYWRnZSBiYWRnZS1mbGV4aWJsZSc+4oCmPC9zcGFuPlxuICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICA8ZGl2IHJlZj0nZGV2UGFja2FnZXMnIGNsYXNzTmFtZT0nY29udGFpbmVyIHBhY2thZ2UtY29udGFpbmVyJz5cbiAgICAgICAgICAgICAgICA8ZGl2IHJlZj0nZGV2TG9hZGluZ0FyZWEnIGNsYXNzTmFtZT0nYWxlcnQgYWxlcnQtaW5mbyBsb2FkaW5nLWFyZWEgaWNvbiBpY29uLWhvdXJnbGFzcyc+TG9hZGluZyB0aGVtZXPigKY8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT0nc3ViLXNlY3Rpb24gZ2l0LXBhY2thZ2VzJz5cbiAgICAgICAgICAgICAgPGgzIHJlZj0nZ2l0VGhlbWVzSGVhZGVyJyBjbGFzc05hbWU9J3N1Yi1zZWN0aW9uLWhlYWRpbmcgaWNvbiBpY29uLXBhaW50Y2FuJz5cbiAgICAgICAgICAgICAgICBHaXQgVGhlbWVzXG4gICAgICAgICAgICAgICAgPHNwYW4gcmVmPSdnaXRDb3VudCcgY2xhc3NOYW1lPSdzZWN0aW9uLWhlYWRpbmctY291bnQgYmFkZ2UgYmFkZ2UtZmxleGlibGUnPuKApjwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgPGRpdiByZWY9J2dpdFBhY2thZ2VzJyBjbGFzc05hbWU9J2NvbnRhaW5lciBwYWNrYWdlLWNvbnRhaW5lcic+XG4gICAgICAgICAgICAgICAgPGRpdiByZWY9J2dpdExvYWRpbmdBcmVhJyBjbGFzc05hbWU9J2FsZXJ0IGFsZXJ0LWluZm8gbG9hZGluZy1hcmVhIGljb24gaWNvbi1ob3VyZ2xhc3MnPkxvYWRpbmcgdGhlbWVz4oCmPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuICBmaWx0ZXJUaGVtZXMgKHBhY2thZ2VzKSB7XG4gICAgcGFja2FnZXMuZGV2ID0gcGFja2FnZXMuZGV2LmZpbHRlcigoe3RoZW1lfSkgPT4gdGhlbWUpXG4gICAgcGFja2FnZXMudXNlciA9IHBhY2thZ2VzLnVzZXIuZmlsdGVyKCh7dGhlbWV9KSA9PiB0aGVtZSlcbiAgICBwYWNrYWdlcy5jb3JlID0gcGFja2FnZXMuY29yZS5maWx0ZXIoKHt0aGVtZX0pID0+IHRoZW1lKVxuICAgIHBhY2thZ2VzLmdpdCA9IChwYWNrYWdlcy5naXQgfHwgW10pLmZpbHRlcigoe3RoZW1lfSkgPT4gdGhlbWUpXG5cbiAgICBmb3IgKGxldCBwYWNrIG9mIHBhY2thZ2VzLmNvcmUpIHtcbiAgICAgIGlmIChwYWNrLnJlcG9zaXRvcnkgPT0gbnVsbCkge1xuICAgICAgICBwYWNrLnJlcG9zaXRvcnkgPSBgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vJHtwYWNrLm5hbWV9YFxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IHBhY2thZ2VUeXBlIG9mIFsnZGV2JywgJ2NvcmUnLCAndXNlcicsICdnaXQnXSkge1xuICAgICAgZm9yIChsZXQgcGFjayBvZiBwYWNrYWdlc1twYWNrYWdlVHlwZV0pIHtcbiAgICAgICAgcGFjay5vd25lciA9IG93bmVyRnJvbVJlcG9zaXRvcnkocGFjay5yZXBvc2l0b3J5KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGFja2FnZXNcbiAgfVxuXG4gIHNvcnRUaGVtZXMgKHBhY2thZ2VzKSB7XG4gICAgcGFja2FnZXMuZGV2LnNvcnQocGFja2FnZUNvbXBhcmF0b3JBc2NlbmRpbmcpXG4gICAgcGFja2FnZXMuY29yZS5zb3J0KHBhY2thZ2VDb21wYXJhdG9yQXNjZW5kaW5nKVxuICAgIHBhY2thZ2VzLnVzZXIuc29ydChwYWNrYWdlQ29tcGFyYXRvckFzY2VuZGluZylcbiAgICBwYWNrYWdlcy5naXQuc29ydChwYWNrYWdlQ29tcGFyYXRvckFzY2VuZGluZylcbiAgICByZXR1cm4gcGFja2FnZXNcbiAgfVxuXG4gIGxvYWRQYWNrYWdlcyAoKSB7XG4gICAgdGhpcy5wYWNrYWdlVmlld3MgPSBbXVxuICAgIHRoaXMucGFja2FnZU1hbmFnZXIuZ2V0SW5zdGFsbGVkKCkudGhlbihwYWNrYWdlcyA9PiB7XG4gICAgICB0aGlzLnBhY2thZ2VzID0gdGhpcy5zb3J0VGhlbWVzKHRoaXMuZmlsdGVyVGhlbWVzKHBhY2thZ2VzKSlcblxuICAgICAgdGhpcy5yZWZzLmRldkxvYWRpbmdBcmVhLnJlbW92ZSgpXG4gICAgICB0aGlzLml0ZW1zLmRldi5zZXRJdGVtcyh0aGlzLnBhY2thZ2VzLmRldilcblxuICAgICAgdGhpcy5yZWZzLmNvcmVMb2FkaW5nQXJlYS5yZW1vdmUoKVxuICAgICAgdGhpcy5pdGVtcy5jb3JlLnNldEl0ZW1zKHRoaXMucGFja2FnZXMuY29yZSlcblxuICAgICAgdGhpcy5yZWZzLmNvbW11bml0eUxvYWRpbmdBcmVhLnJlbW92ZSgpXG4gICAgICB0aGlzLml0ZW1zLnVzZXIuc2V0SXRlbXModGhpcy5wYWNrYWdlcy51c2VyKVxuXG4gICAgICB0aGlzLnJlZnMuZ2l0TG9hZGluZ0FyZWEucmVtb3ZlKClcbiAgICAgIHRoaXMuaXRlbXMuZ2l0LnNldEl0ZW1zKHRoaXMucGFja2FnZXMuZ2l0KVxuXG4gICAgICAvLyBUT0RPIHNob3cgZW1wdHkgbWVzYWdlIHBlciBzZWN0aW9uXG5cbiAgICAgIHRoaXMudXBkYXRlU2VjdGlvbkNvdW50cygpXG4gICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICB0aGlzLnJlZnMudGhlbWVFcnJvcnMuYXBwZW5kQ2hpbGQobmV3IEVycm9yVmlldyh0aGlzLnBhY2thZ2VNYW5hZ2VyLCBlcnJvcikuZWxlbWVudClcbiAgICB9KVxuICB9XG5cbiAgLy8gVXBkYXRlIHRoZSBhY3RpdmUgVUkgYW5kIHN5bnRheCB0aGVtZXMgYW5kIHBvcHVsYXRlIHRoZSBtZW51XG4gIHVwZGF0ZUFjdGl2ZVRoZW1lcyAoKSB7XG4gICAgdGhpcy5hY3RpdmVVaVRoZW1lID0gdGhpcy5nZXRBY3RpdmVVaVRoZW1lKClcbiAgICB0aGlzLmFjdGl2ZVN5bnRheFRoZW1lID0gdGhpcy5nZXRBY3RpdmVTeW50YXhUaGVtZSgpXG4gICAgdGhpcy5wb3B1bGF0ZVRoZW1lTWVudXMoKVxuICAgIHRoaXMudG9nZ2xlQWN0aXZlVGhlbWVCdXR0b25zKClcbiAgfVxuXG4gIHRvZ2dsZUFjdGl2ZVRoZW1lQnV0dG9ucyAoKSB7XG4gICAgaWYgKHRoaXMuaGFzU2V0dGluZ3ModGhpcy5hY3RpdmVVaVRoZW1lKSkge1xuICAgICAgdGhpcy5yZWZzLmFjdGl2ZVVpVGhlbWVTZXR0aW5ncy5zdHlsZS5kaXNwbGF5ID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZWZzLmFjdGl2ZVVpVGhlbWVTZXR0aW5ncy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaGFzU2V0dGluZ3ModGhpcy5hY3RpdmVTeW50YXhUaGVtZSkpIHtcbiAgICAgIHRoaXMucmVmcy5hY3RpdmVTeW50YXhUaGVtZVNldHRpbmdzLmRpc3BsYXkgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlZnMuYWN0aXZlU3ludGF4VGhlbWVTZXR0aW5ncy5kaXNwbGF5ID0gJ25vbmUnXG4gICAgfVxuICB9XG5cbiAgaGFzU2V0dGluZ3MgKHBhY2thZ2VOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMucGFja2FnZU1hbmFnZXIucGFja2FnZUhhc1NldHRpbmdzKHBhY2thZ2VOYW1lKVxuICB9XG5cbiAgLy8gUG9wdWxhdGUgdGhlIHRoZW1lIG1lbnVzIGZyb20gdGhlIHRoZW1lIG1hbmFnZXIncyBhY3RpdmUgdGhlbWVzXG4gIHBvcHVsYXRlVGhlbWVNZW51cyAoKSB7XG4gICAgdGhpcy5yZWZzLnVpTWVudS5pbm5lckhUTUwgPSAnJ1xuICAgIHRoaXMucmVmcy5zeW50YXhNZW51LmlubmVySFRNTCA9ICcnXG4gICAgY29uc3QgYXZhaWxhYmxlVGhlbWVzID0gXy5zb3J0QnkoYXRvbS50aGVtZXMuZ2V0TG9hZGVkVGhlbWVzKCksICduYW1lJylcbiAgICBmb3IgKGxldCB7bmFtZSwgbWV0YWRhdGF9IG9mIGF2YWlsYWJsZVRoZW1lcykge1xuICAgICAgc3dpdGNoIChtZXRhZGF0YS50aGVtZSkge1xuICAgICAgICBjYXNlICd1aSc6IHtcbiAgICAgICAgICBjb25zdCB0aGVtZUl0ZW0gPSB0aGlzLmNyZWF0ZVRoZW1lTWVudUl0ZW0obmFtZSlcbiAgICAgICAgICBpZiAobmFtZSA9PT0gdGhpcy5hY3RpdmVVaVRoZW1lKSB7XG4gICAgICAgICAgICB0aGVtZUl0ZW0uc2VsZWN0ZWQgPSB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucmVmcy51aU1lbnUuYXBwZW5kQ2hpbGQodGhlbWVJdGVtKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnc3ludGF4Jzoge1xuICAgICAgICAgIGNvbnN0IHRoZW1lSXRlbSA9IHRoaXMuY3JlYXRlVGhlbWVNZW51SXRlbShuYW1lKVxuICAgICAgICAgIGlmIChuYW1lID09PSB0aGlzLmFjdGl2ZVN5bnRheFRoZW1lKSB7XG4gICAgICAgICAgICB0aGVtZUl0ZW0uc2VsZWN0ZWQgPSB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucmVmcy5zeW50YXhNZW51LmFwcGVuZENoaWxkKHRoZW1lSXRlbSlcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gR2V0IHRoZSBuYW1lIG9mIHRoZSBhY3RpdmUgdWkgdGhlbWUuXG4gIGdldEFjdGl2ZVVpVGhlbWUgKCkge1xuICAgIGZvciAobGV0IHtuYW1lLCBtZXRhZGF0YX0gb2YgYXRvbS50aGVtZXMuZ2V0QWN0aXZlVGhlbWVzKCkpIHtcbiAgICAgIGlmIChtZXRhZGF0YS50aGVtZSA9PT0gJ3VpJykge1xuICAgICAgICByZXR1cm4gbmFtZVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgLy8gR2V0IHRoZSBuYW1lIG9mIHRoZSBhY3RpdmUgc3ludGF4IHRoZW1lLlxuICBnZXRBY3RpdmVTeW50YXhUaGVtZSAoKSB7XG4gICAgZm9yIChsZXQge25hbWUsIG1ldGFkYXRhfSBvZiBhdG9tLnRoZW1lcy5nZXRBY3RpdmVUaGVtZXMoKSkge1xuICAgICAgaWYgKG1ldGFkYXRhLnRoZW1lID09PSAnc3ludGF4JykgeyByZXR1cm4gbmFtZSB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvLyBVcGRhdGUgdGhlIGNvbmZpZyB3aXRoIHRoZSBzZWxlY3RlZCB0aGVtZXNcbiAgdXBkYXRlVGhlbWVDb25maWcgKCkge1xuICAgIGNvbnN0IHRoZW1lcyA9IFtdXG4gICAgaWYgKHRoaXMuYWN0aXZlVWlUaGVtZSkge1xuICAgICAgdGhlbWVzLnB1c2godGhpcy5hY3RpdmVVaVRoZW1lKVxuICAgIH1cbiAgICBpZiAodGhpcy5hY3RpdmVTeW50YXhUaGVtZSkge1xuICAgICAgdGhlbWVzLnB1c2godGhpcy5hY3RpdmVTeW50YXhUaGVtZSlcbiAgICB9XG4gICAgaWYgKHRoZW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2NvcmUudGhlbWVzJywgdGhlbWVzKVxuICAgIH1cbiAgfVxuXG4gIHNjaGVkdWxlVXBkYXRlVGhlbWVDb25maWcgKCkge1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnVwZGF0ZVRoZW1lQ29uZmlnKCkgfSwgMTAwKVxuICB9XG5cbiAgLy8gQ3JlYXRlIGEgbWVudSBpdGVtIGZvciB0aGUgZ2l2ZW4gdGhlbWUgbmFtZS5cbiAgY3JlYXRlVGhlbWVNZW51SXRlbSAodGhlbWVOYW1lKSB7XG4gICAgY29uc3QgdGl0bGUgPSBfLnVuZGFzaGVyaXplKF8udW5jYW1lbGNhc2UodGhlbWVOYW1lLnJlcGxhY2UoLy0odWl8c3ludGF4KS9nLCAnJykucmVwbGFjZSgvLXRoZW1lJC9nLCAnJykpKVxuICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpXG4gICAgb3B0aW9uLnZhbHVlID0gdGhlbWVOYW1lXG4gICAgb3B0aW9uLnRleHRDb250ZW50ID0gdGl0bGVcbiAgICByZXR1cm4gb3B0aW9uXG4gIH1cblxuICBjcmVhdGVQYWNrYWdlQ2FyZCAocGFjaykge1xuICAgIHJldHVybiBuZXcgUGFja2FnZUNhcmQocGFjaywgdGhpcy5zZXR0aW5nc1ZpZXcsIHRoaXMucGFja2FnZU1hbmFnZXIsIHtiYWNrOiAnVGhlbWVzJ30pXG4gIH1cblxuICBmaWx0ZXJQYWNrYWdlTGlzdEJ5VGV4dCAodGV4dCkge1xuICAgIGlmICghdGhpcy5wYWNrYWdlcykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgZm9yIChsZXQgcGFja2FnZVR5cGUgb2YgWydkZXYnLCAnY29yZScsICd1c2VyJywgJ2dpdCddKSB7XG4gICAgICBjb25zdCBhbGxWaWV3cyA9IHRoaXMuaXRlbVZpZXdzW3BhY2thZ2VUeXBlXS5nZXRWaWV3cygpXG4gICAgICBjb25zdCBhY3RpdmVWaWV3cyA9IHRoaXMuaXRlbVZpZXdzW3BhY2thZ2VUeXBlXS5maWx0ZXJWaWV3cygocGFjaykgPT4ge1xuICAgICAgICBpZiAodGV4dCA9PT0gJycpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IG93bmVyID0gcGFjay5vd25lciAhPSBudWxsID8gcGFjay5vd25lciA6IG93bmVyRnJvbVJlcG9zaXRvcnkocGFjay5yZXBvc2l0b3J5KVxuICAgICAgICAgIGNvbnN0IGZpbHRlclRleHQgPSBgJHtwYWNrLm5hbWV9ICR7b3duZXJ9YFxuICAgICAgICAgIHJldHVybiBmdXp6YWxkcmluLnNjb3JlKGZpbHRlclRleHQsIHRleHQpID4gMFxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBmb3IgKGNvbnN0IHZpZXcgb2YgYWxsVmlld3MpIHtcbiAgICAgICAgaWYgKHZpZXcpIHtcbiAgICAgICAgICB2aWV3LmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgICAgICAgIHZpZXcuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgdmlldyBvZiBhY3RpdmVWaWV3cykge1xuICAgICAgICBpZiAodmlldykge1xuICAgICAgICAgIHZpZXcuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJydcbiAgICAgICAgICB2aWV3LmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlU2VjdGlvbkNvdW50cygpXG4gIH1cblxuICB1cGRhdGVVbmZpbHRlcmVkU2VjdGlvbkNvdW50cyAoKSB7XG4gICAgdGhpcy51cGRhdGVTZWN0aW9uQ291bnQodGhpcy5yZWZzLmNvbW11bml0eVRoZW1lc0hlYWRlciwgdGhpcy5yZWZzLmNvbW11bml0eUNvdW50LCB0aGlzLnBhY2thZ2VzLnVzZXIubGVuZ3RoKVxuICAgIHRoaXMudXBkYXRlU2VjdGlvbkNvdW50KHRoaXMucmVmcy5jb3JlVGhlbWVzSGVhZGVyLCB0aGlzLnJlZnMuY29yZUNvdW50LCB0aGlzLnBhY2thZ2VzLmNvcmUubGVuZ3RoKVxuICAgIHRoaXMudXBkYXRlU2VjdGlvbkNvdW50KHRoaXMucmVmcy5kZXZlbG9wbWVudFRoZW1lc0hlYWRlciwgdGhpcy5yZWZzLmRldkNvdW50LCB0aGlzLnBhY2thZ2VzLmRldi5sZW5ndGgpXG4gICAgdGhpcy51cGRhdGVTZWN0aW9uQ291bnQodGhpcy5yZWZzLmdpdFRoZW1lc0hlYWRlciwgdGhpcy5yZWZzLmdpdENvdW50LCB0aGlzLnBhY2thZ2VzLmdpdC5sZW5ndGgpXG5cbiAgICB0aGlzLnJlZnMudG90YWxQYWNrYWdlcy50ZXh0Q29udGVudCA9IGAke3RoaXMucGFja2FnZXMudXNlci5sZW5ndGggKyB0aGlzLnBhY2thZ2VzLmNvcmUubGVuZ3RoICsgdGhpcy5wYWNrYWdlcy5kZXYubGVuZ3RoICsgdGhpcy5wYWNrYWdlcy5naXQubGVuZ3RofWBcbiAgfVxuXG4gIHVwZGF0ZUZpbHRlcmVkU2VjdGlvbkNvdW50cyAoKSB7XG4gICAgY29uc3QgY29tbXVuaXR5ID0gdGhpcy5ub3RIaWRkZW5DYXJkc0xlbmd0aCh0aGlzLnJlZnMuY29tbXVuaXR5UGFja2FnZXMpXG4gICAgdGhpcy51cGRhdGVTZWN0aW9uQ291bnQodGhpcy5yZWZzLmNvbW11bml0eVRoZW1lc0hlYWRlciwgdGhpcy5yZWZzLmNvbW11bml0eUNvdW50LCBjb21tdW5pdHksIHRoaXMucGFja2FnZXMudXNlci5sZW5ndGgpXG5cbiAgICBjb25zdCBkZXYgPSB0aGlzLm5vdEhpZGRlbkNhcmRzTGVuZ3RoKHRoaXMucmVmcy5kZXZQYWNrYWdlcylcbiAgICB0aGlzLnVwZGF0ZVNlY3Rpb25Db3VudCh0aGlzLnJlZnMuZGV2ZWxvcG1lbnRUaGVtZXNIZWFkZXIsIHRoaXMucmVmcy5kZXZDb3VudCwgZGV2LCB0aGlzLnBhY2thZ2VzLmRldi5sZW5ndGgpXG5cbiAgICBjb25zdCBjb3JlID0gdGhpcy5ub3RIaWRkZW5DYXJkc0xlbmd0aCh0aGlzLnJlZnMuY29yZVBhY2thZ2VzKVxuICAgIHRoaXMudXBkYXRlU2VjdGlvbkNvdW50KHRoaXMucmVmcy5jb3JlVGhlbWVzSGVhZGVyLCB0aGlzLnJlZnMuY29yZUNvdW50LCBjb3JlLCB0aGlzLnBhY2thZ2VzLmNvcmUubGVuZ3RoKVxuXG4gICAgY29uc3QgZ2l0ID0gdGhpcy5ub3RIaWRkZW5DYXJkc0xlbmd0aCh0aGlzLnJlZnMuZ2l0UGFja2FnZXMpXG4gICAgdGhpcy51cGRhdGVTZWN0aW9uQ291bnQodGhpcy5yZWZzLmdpdFRoZW1lc0hlYWRlciwgdGhpcy5yZWZzLmdpdENvdW50LCBnaXQsIHRoaXMucGFja2FnZXMuZ2l0Lmxlbmd0aClcblxuICAgIGNvbnN0IHNob3duVGhlbWVzID0gZGV2ICsgY29yZSArIGNvbW11bml0eSArIGdpdFxuICAgIGNvbnN0IHRvdGFsVGhlbWVzID0gdGhpcy5wYWNrYWdlcy51c2VyLmxlbmd0aCArIHRoaXMucGFja2FnZXMuY29yZS5sZW5ndGggKyB0aGlzLnBhY2thZ2VzLmRldi5sZW5ndGggKyB0aGlzLnBhY2thZ2VzLmdpdC5sZW5ndGhcbiAgICB0aGlzLnJlZnMudG90YWxQYWNrYWdlcy50ZXh0Q29udGVudCA9IGAke3Nob3duVGhlbWVzfS8ke3RvdGFsVGhlbWVzfWBcbiAgfVxuXG4gIHJlc2V0U2VjdGlvbkhhc0l0ZW1zICgpIHtcbiAgICB0aGlzLnJlc2V0Q29sbGFwc2libGVTZWN0aW9ucyhbdGhpcy5yZWZzLmNvbW11bml0eVRoZW1lc0hlYWRlciwgdGhpcy5yZWZzLmNvcmVUaGVtZXNIZWFkZXIsIHRoaXMucmVmcy5kZXZlbG9wbWVudFRoZW1lc0hlYWRlciwgdGhpcy5yZWZzLmdpdFRoZW1lc0hlYWRlcl0pXG4gIH1cblxuICBtYXRjaFBhY2thZ2VzICgpIHtcbiAgICB0aGlzLmZpbHRlclBhY2thZ2VMaXN0QnlUZXh0KHRoaXMucmVmcy5maWx0ZXJFZGl0b3IuZ2V0VGV4dCgpKVxuICB9XG5cbiAgZGlkQ2xpY2tPcGVuVXNlclN0eWxlU2hlZXQgKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdhcHBsaWNhdGlvbjpvcGVuLXlvdXItc3R5bGVzaGVldCcpXG4gIH1cblxuICBkaWRDaGFuZ2VVaU1lbnUgKCkge1xuICAgIHRoaXMuYWN0aXZlVWlUaGVtZSA9IHRoaXMucmVmcy51aU1lbnUudmFsdWVcbiAgICB0aGlzLnNjaGVkdWxlVXBkYXRlVGhlbWVDb25maWcoKVxuICB9XG5cbiAgZGlkQ2hhbmdlU3ludGF4TWVudSAoKSB7XG4gICAgdGhpcy5hY3RpdmVTeW50YXhUaGVtZSA9IHRoaXMucmVmcy5zeW50YXhNZW51LnZhbHVlXG4gICAgdGhpcy5zY2hlZHVsZVVwZGF0ZVRoZW1lQ29uZmlnKClcbiAgfVxuXG4gIGRpZENsaWNrQWN0aXZlVWlUaGVtZVNldHRpbmdzIChldmVudCkge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgY29uc3QgdGhlbWUgPSBhdG9tLnRoZW1lcy5nZXRBY3RpdmVUaGVtZXMoKS5maW5kKCh0aGVtZSkgPT4gdGhlbWUubWV0YWRhdGEudGhlbWUgPT09ICd1aScpXG4gICAgY29uc3QgYWN0aXZlVWlUaGVtZSA9IHRoZW1lICE9IG51bGwgPyB0aGVtZS5tZXRhZGF0YSA6IG51bGxcbiAgICBpZiAoYWN0aXZlVWlUaGVtZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLnNldHRpbmdzVmlldy5zaG93UGFuZWwodGhpcy5hY3RpdmVVaVRoZW1lLCB7XG4gICAgICAgIGJhY2s6ICdUaGVtZXMnLFxuICAgICAgICBwYWNrOiBhY3RpdmVVaVRoZW1lXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGRpZENsaWNrQWN0aXZlU3ludGF4VGhlbWVTZXR0aW5ncyAoZXZlbnQpIHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIGNvbnN0IHRoZW1lID0gYXRvbS50aGVtZXMuZ2V0QWN0aXZlVGhlbWVzKCkuZmluZCgodGhlbWUpID0+IHRoZW1lLm1ldGFkYXRhLnRoZW1lID09PSAnc3ludGF4JylcbiAgICBjb25zdCBhY3RpdmVTeW50YXhUaGVtZSA9IHRoZW1lICE9IG51bGwgPyB0aGVtZS5tZXRhZGF0YSA6IG51bGxcbiAgICBpZiAoYWN0aXZlU3ludGF4VGhlbWUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5zZXR0aW5nc1ZpZXcuc2hvd1BhbmVsKHRoaXMuYWN0aXZlU3ludGF4VGhlbWUsIHtcbiAgICAgICAgYmFjazogJ1RoZW1lcycsXG4gICAgICAgIHBhY2s6IGFjdGl2ZVN5bnRheFRoZW1lXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHNjcm9sbFVwICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wIC09IGRvY3VtZW50LmJvZHkub2Zmc2V0SGVpZ2h0IC8gMjBcbiAgfVxuXG4gIHNjcm9sbERvd24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgKz0gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQgLyAyMFxuICB9XG5cbiAgcGFnZVVwICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wIC09IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgfVxuXG4gIHBhZ2VEb3duICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wICs9IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgfVxuXG4gIHNjcm9sbFRvVG9wICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wID0gMFxuICB9XG5cbiAgc2Nyb2xsVG9Cb3R0b20gKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLmVsZW1lbnQuc2Nyb2xsSGVpZ2h0XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFBdUU7QUFkdkU7QUFDQTs7QUFlZSxNQUFNQSxXQUFXLFNBQVNDLGdDQUF1QixDQUFDO0VBQy9ELE9BQU9DLGlCQUFpQixHQUFJO0lBQzFCLE9BQU8sR0FBRztFQUNaO0VBRUFDLFdBQVcsQ0FBRUMsWUFBWSxFQUFFQyxjQUFjLEVBQUU7SUFDekMsS0FB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