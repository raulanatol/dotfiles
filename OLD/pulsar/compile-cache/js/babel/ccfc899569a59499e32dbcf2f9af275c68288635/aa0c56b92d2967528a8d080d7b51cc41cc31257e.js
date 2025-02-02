"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _atom = require("atom");
var _etch = _interopRequireDefault(require("etch"));
var _fuzzaldrin = _interopRequireDefault(require("fuzzaldrin"));
var _collapsibleSectionPanel = _interopRequireDefault(require("./collapsible-section-panel"));
var _packageCard = _interopRequireDefault(require("./package-card"));
var _errorView = _interopRequireDefault(require("./error-view"));
var _list = _interopRequireDefault(require("./list"));
var _listView = _interopRequireDefault(require("./list-view"));
var _utils = require("./utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */
/** @jsx etch.dom */

class InstalledPackagesPanel extends _collapsibleSectionPanel.default {
  static loadPackagesDelay() {
    return 300;
  }
  constructor(settingsView, packageManager) {
    super();
    _etch.default.initialize(this);
    this.settingsView = settingsView;
    this.packageManager = packageManager;
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
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(this.refs.filterEditor.onDidStopChanging(() => {
      this.matchPackages();
    }));
    this.subscriptions.add(this.packageManager.on('package-install-failed theme-install-failed package-uninstall-failed theme-uninstall-failed package-update-failed theme-update-failed', ({
      pack,
      error
    }) => {
      this.refs.updateErrors.appendChild(new _errorView.default(this.packageManager, error).element);
    }));
    let loadPackagesTimeout;
    this.subscriptions.add(this.packageManager.on('package-updated package-installed package-uninstalled package-installed-alternative', () => {
      clearTimeout(loadPackagesTimeout);
      loadPackagesTimeout = setTimeout(this.loadPackages.bind(this), InstalledPackagesPanel.loadPackagesDelay());
    }));
    this.subscriptions.add(this.handleEvents());
    this.subscriptions.add(atom.commands.add(this.element, {
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
  }
  focus() {
    this.refs.filterEditor.element.focus();
  }
  show() {
    this.element.style.display = '';
  }
  destroy() {
    this.subscriptions.dispose();
    return _etch.default.destroy(this);
  }
  update() {}
  render() {
    return _etch.default.dom("div", {
      className: "panels-item",
      tabIndex: "-1"
    }, _etch.default.dom("section", {
      className: "section"
    }, _etch.default.dom("div", {
      className: "section-container"
    }, _etch.default.dom("div", {
      className: "section-heading icon icon-package"
    }, "Installed Packages", _etch.default.dom("span", {
      ref: "totalPackages",
      className: "section-heading-count badge badge-flexible"
    }, "\u2026")), _etch.default.dom("div", {
      className: "editor-container"
    }, _etch.default.dom(_atom.TextEditor, {
      ref: "filterEditor",
      mini: true,
      placeholderText: "Filter packages by name"
    })), _etch.default.dom("div", {
      ref: "updateErrors"
    }), _etch.default.dom("section", {
      className: "sub-section installed-packages"
    }, _etch.default.dom("h3", {
      ref: "communityPackagesHeader",
      className: "sub-section-heading icon icon-package"
    }, "Community Packages", _etch.default.dom("span", {
      ref: "communityCount",
      className: "section-heading-count badge badge-flexible"
    }, "\u2026")), _etch.default.dom("div", {
      ref: "communityPackages",
      className: "container package-container"
    }, _etch.default.dom("div", {
      ref: "communityLoadingArea",
      className: "alert alert-info loading-area icon icon-hourglass"
    }, "Loading packages\u2026"))), _etch.default.dom("section", {
      className: "sub-section core-packages"
    }, _etch.default.dom("h3", {
      ref: "corePackagesHeader",
      className: "sub-section-heading icon icon-package"
    }, "Core Packages", _etch.default.dom("span", {
      ref: "coreCount",
      className: "section-heading-count badge badge-flexible"
    }, "\u2026")), _etch.default.dom("div", {
      ref: "corePackages",
      className: "container package-container"
    }, _etch.default.dom("div", {
      ref: "coreLoadingArea",
      className: "alert alert-info loading-area icon icon-hourglass"
    }, "Loading packages\u2026"))), _etch.default.dom("section", {
      className: "sub-section dev-packages"
    }, _etch.default.dom("h3", {
      ref: "devPackagesHeader",
      className: "sub-section-heading icon icon-package"
    }, "Development Packages", _etch.default.dom("span", {
      ref: "devCount",
      className: "section-heading-count badge badge-flexible"
    }, "\u2026")), _etch.default.dom("div", {
      ref: "devPackages",
      className: "container package-container"
    }, _etch.default.dom("div", {
      ref: "devLoadingArea",
      className: "alert alert-info loading-area icon icon-hourglass"
    }, "Loading packages\u2026"))), _etch.default.dom("section", {
      className: "sub-section git-packages"
    }, _etch.default.dom("h3", {
      ref: "gitPackagesHeader",
      className: "sub-section-heading icon icon-package"
    }, "Git Packages", _etch.default.dom("span", {
      ref: "gitCount",
      className: "section-heading-count badge badge-flexible"
    }, "\u2026")), _etch.default.dom("div", {
      ref: "gitPackages",
      className: "container package-container"
    }, _etch.default.dom("div", {
      ref: "gitLoadingArea",
      className: "alert alert-info loading-area icon icon-hourglass"
    }, "Loading packages\u2026"))))));
  }
  filterPackages(packages) {
    packages.dev = packages.dev.filter(({
      theme
    }) => !theme);
    packages.user = packages.user.filter(({
      theme
    }) => !theme);
    packages.core = packages.core.filter(({
      theme
    }) => !theme);
    packages.git = (packages.git || []).filter(({
      theme
    }) => !theme);
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
  sortPackages(packages) {
    packages.dev.sort(_utils.packageComparatorAscending);
    packages.core.sort(_utils.packageComparatorAscending);
    packages.user.sort(_utils.packageComparatorAscending);
    packages.git.sort(_utils.packageComparatorAscending);
    return packages;
  }
  loadPackages() {
    const packagesWithUpdates = {};
    this.packageManager.getOutdated().then(packages => {
      for (let {
        name,
        latestVersion
      } of packages) {
        packagesWithUpdates[name] = latestVersion;
      }
      this.displayPackageUpdates(packagesWithUpdates);
    });
    this.packageManager.getInstalled().then(packages => {
      this.packages = this.sortPackages(this.filterPackages(packages));
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
      this.displayPackageUpdates(packagesWithUpdates);
      this.matchPackages();
    }).catch(error => {
      console.error(error.message, error.stack);
    });
  }
  displayPackageUpdates(packagesWithUpdates) {
    for (const packageType of ['dev', 'core', 'user', 'git']) {
      for (const packageCard of this.itemViews[packageType].getViews()) {
        const newVersion = packagesWithUpdates[packageCard.pack.name];
        if (newVersion) {
          packageCard.displayAvailableUpdate(newVersion);
        }
      }
    }
  }
  createPackageCard(pack) {
    return new _packageCard.default(pack, this.settingsView, this.packageManager, {
      back: 'Packages'
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
    this.updateSectionCount(this.refs.communityPackagesHeader, this.refs.communityCount, this.packages.user.length);
    this.updateSectionCount(this.refs.corePackagesHeader, this.refs.coreCount, this.packages.core.length);
    this.updateSectionCount(this.refs.devPackagesHeader, this.refs.devCount, this.packages.dev.length);
    this.updateSectionCount(this.refs.gitPackagesHeader, this.refs.gitCount, this.packages.git.length);
    const totalPackages = this.packages.user.length + this.packages.core.length + this.packages.dev.length + this.packages.git.length;
    this.refs.totalPackages.textContent = totalPackages.toString();
  }
  updateFilteredSectionCounts() {
    const community = this.notHiddenCardsLength(this.refs.communityPackages);
    this.updateSectionCount(this.refs.communityPackagesHeader, this.refs.communityCount, community, this.packages.user.length);
    const core = this.notHiddenCardsLength(this.refs.corePackages);
    this.updateSectionCount(this.refs.corePackagesHeader, this.refs.coreCount, core, this.packages.core.length);
    const dev = this.notHiddenCardsLength(this.refs.devPackages);
    this.updateSectionCount(this.refs.devPackagesHeader, this.refs.devCount, dev, this.packages.dev.length);
    const git = this.notHiddenCardsLength(this.refs.gitPackages);
    this.updateSectionCount(this.refs.gitPackagesHeader, this.refs.gitCount, git, this.packages.git.length);
    const shownPackages = dev + core + community + git;
    const totalPackages = this.packages.user.length + this.packages.core.length + this.packages.dev.length + this.packages.git.length;
    this.refs.totalPackages.textContent = `${shownPackages}/${totalPackages}`;
  }
  resetSectionHasItems() {
    this.resetCollapsibleSections([this.refs.communityPackagesHeader, this.refs.corePackagesHeader, this.refs.devPackagesHeader, this.refs.gitPackagesHeader]);
  }
  matchPackages() {
    this.filterPackageListByText(this.refs.filterEditor.getText());
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
exports.default = InstalledPackagesPanel;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnN0YWxsZWRQYWNrYWdlc1BhbmVsIiwiQ29sbGFwc2libGVTZWN0aW9uUGFuZWwiLCJsb2FkUGFja2FnZXNEZWxheSIsImNvbnN0cnVjdG9yIiwic2V0dGluZ3NWaWV3IiwicGFja2FnZU1hbmFnZXIiLCJldGNoIiwiaW5pdGlhbGl6ZSIsIml0ZW1zIiwiZGV2IiwiTGlzdCIsImNvcmUiLCJ1c2VyIiwiZ2l0IiwiaXRlbVZpZXdzIiwiTGlzdFZpZXciLCJyZWZzIiwiZGV2UGFja2FnZXMiLCJjcmVhdGVQYWNrYWdlQ2FyZCIsImJpbmQiLCJjb3JlUGFja2FnZXMiLCJjb21tdW5pdHlQYWNrYWdlcyIsImdpdFBhY2thZ2VzIiwic3Vic2NyaXB0aW9ucyIsIkNvbXBvc2l0ZURpc3Bvc2FibGUiLCJhZGQiLCJmaWx0ZXJFZGl0b3IiLCJvbkRpZFN0b3BDaGFuZ2luZyIsIm1hdGNoUGFja2FnZXMiLCJvbiIsInBhY2siLCJlcnJvciIsInVwZGF0ZUVycm9ycyIsImFwcGVuZENoaWxkIiwiRXJyb3JWaWV3IiwiZWxlbWVudCIsImxvYWRQYWNrYWdlc1RpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0IiwibG9hZFBhY2thZ2VzIiwiaGFuZGxlRXZlbnRzIiwiYXRvbSIsImNvbW1hbmRzIiwic2Nyb2xsVXAiLCJzY3JvbGxEb3duIiwicGFnZVVwIiwicGFnZURvd24iLCJzY3JvbGxUb1RvcCIsInNjcm9sbFRvQm90dG9tIiwiZm9jdXMiLCJzaG93Iiwic3R5bGUiLCJkaXNwbGF5IiwiZGVzdHJveSIsImRpc3Bvc2UiLCJ1cGRhdGUiLCJyZW5kZXIiLCJmaWx0ZXJQYWNrYWdlcyIsInBhY2thZ2VzIiwiZmlsdGVyIiwidGhlbWUiLCJyZXBvc2l0b3J5IiwibmFtZSIsInBhY2thZ2VUeXBlIiwib3duZXIiLCJvd25lckZyb21SZXBvc2l0b3J5Iiwic29ydFBhY2thZ2VzIiwic29ydCIsInBhY2thZ2VDb21wYXJhdG9yQXNjZW5kaW5nIiwicGFja2FnZXNXaXRoVXBkYXRlcyIsImdldE91dGRhdGVkIiwidGhlbiIsImxhdGVzdFZlcnNpb24iLCJkaXNwbGF5UGFja2FnZVVwZGF0ZXMiLCJnZXRJbnN0YWxsZWQiLCJkZXZMb2FkaW5nQXJlYSIsInJlbW92ZSIsInNldEl0ZW1zIiwiY29yZUxvYWRpbmdBcmVhIiwiY29tbXVuaXR5TG9hZGluZ0FyZWEiLCJnaXRMb2FkaW5nQXJlYSIsInVwZGF0ZVNlY3Rpb25Db3VudHMiLCJjYXRjaCIsImNvbnNvbGUiLCJtZXNzYWdlIiwic3RhY2siLCJwYWNrYWdlQ2FyZCIsImdldFZpZXdzIiwibmV3VmVyc2lvbiIsImRpc3BsYXlBdmFpbGFibGVVcGRhdGUiLCJQYWNrYWdlQ2FyZCIsImJhY2siLCJmaWx0ZXJQYWNrYWdlTGlzdEJ5VGV4dCIsInRleHQiLCJhbGxWaWV3cyIsImFjdGl2ZVZpZXdzIiwiZmlsdGVyVmlld3MiLCJmaWx0ZXJUZXh0IiwiZnV6emFsZHJpbiIsInNjb3JlIiwidmlldyIsImNsYXNzTGlzdCIsInVwZGF0ZVVuZmlsdGVyZWRTZWN0aW9uQ291bnRzIiwidXBkYXRlU2VjdGlvbkNvdW50IiwiY29tbXVuaXR5UGFja2FnZXNIZWFkZXIiLCJjb21tdW5pdHlDb3VudCIsImxlbmd0aCIsImNvcmVQYWNrYWdlc0hlYWRlciIsImNvcmVDb3VudCIsImRldlBhY2thZ2VzSGVhZGVyIiwiZGV2Q291bnQiLCJnaXRQYWNrYWdlc0hlYWRlciIsImdpdENvdW50IiwidG90YWxQYWNrYWdlcyIsInRleHRDb250ZW50IiwidG9TdHJpbmciLCJ1cGRhdGVGaWx0ZXJlZFNlY3Rpb25Db3VudHMiLCJjb21tdW5pdHkiLCJub3RIaWRkZW5DYXJkc0xlbmd0aCIsInNob3duUGFja2FnZXMiLCJyZXNldFNlY3Rpb25IYXNJdGVtcyIsInJlc2V0Q29sbGFwc2libGVTZWN0aW9ucyIsImdldFRleHQiLCJzY3JvbGxUb3AiLCJkb2N1bWVudCIsImJvZHkiLCJvZmZzZXRIZWlnaHQiLCJzY3JvbGxIZWlnaHQiXSwic291cmNlcyI6WyJpbnN0YWxsZWQtcGFja2FnZXMtcGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuLyoqIEBqc3ggZXRjaC5kb20gKi9cblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBUZXh0RWRpdG9yfSBmcm9tICdhdG9tJ1xuaW1wb3J0IGV0Y2ggZnJvbSAnZXRjaCdcbmltcG9ydCBmdXp6YWxkcmluIGZyb20gJ2Z1enphbGRyaW4nXG5cbmltcG9ydCBDb2xsYXBzaWJsZVNlY3Rpb25QYW5lbCBmcm9tICcuL2NvbGxhcHNpYmxlLXNlY3Rpb24tcGFuZWwnXG5pbXBvcnQgUGFja2FnZUNhcmQgZnJvbSAnLi9wYWNrYWdlLWNhcmQnXG5pbXBvcnQgRXJyb3JWaWV3IGZyb20gJy4vZXJyb3ItdmlldydcblxuaW1wb3J0IExpc3QgZnJvbSAnLi9saXN0J1xuaW1wb3J0IExpc3RWaWV3IGZyb20gJy4vbGlzdC12aWV3J1xuaW1wb3J0IHtvd25lckZyb21SZXBvc2l0b3J5LCBwYWNrYWdlQ29tcGFyYXRvckFzY2VuZGluZ30gZnJvbSAnLi91dGlscydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5zdGFsbGVkUGFja2FnZXNQYW5lbCBleHRlbmRzIENvbGxhcHNpYmxlU2VjdGlvblBhbmVsIHtcbiAgc3RhdGljIGxvYWRQYWNrYWdlc0RlbGF5ICgpIHtcbiAgICByZXR1cm4gMzAwXG4gIH1cblxuICBjb25zdHJ1Y3RvciAoc2V0dGluZ3NWaWV3LCBwYWNrYWdlTWFuYWdlcikge1xuICAgIHN1cGVyKClcbiAgICBldGNoLmluaXRpYWxpemUodGhpcylcbiAgICB0aGlzLnNldHRpbmdzVmlldyA9IHNldHRpbmdzVmlld1xuICAgIHRoaXMucGFja2FnZU1hbmFnZXIgPSBwYWNrYWdlTWFuYWdlclxuICAgIHRoaXMuaXRlbXMgPSB7XG4gICAgICBkZXY6IG5ldyBMaXN0KCduYW1lJyksXG4gICAgICBjb3JlOiBuZXcgTGlzdCgnbmFtZScpLFxuICAgICAgdXNlcjogbmV3IExpc3QoJ25hbWUnKSxcbiAgICAgIGdpdDogbmV3IExpc3QoJ25hbWUnKVxuICAgIH1cbiAgICB0aGlzLml0ZW1WaWV3cyA9IHtcbiAgICAgIGRldjogbmV3IExpc3RWaWV3KHRoaXMuaXRlbXMuZGV2LCB0aGlzLnJlZnMuZGV2UGFja2FnZXMsIHRoaXMuY3JlYXRlUGFja2FnZUNhcmQuYmluZCh0aGlzKSksXG4gICAgICBjb3JlOiBuZXcgTGlzdFZpZXcodGhpcy5pdGVtcy5jb3JlLCB0aGlzLnJlZnMuY29yZVBhY2thZ2VzLCB0aGlzLmNyZWF0ZVBhY2thZ2VDYXJkLmJpbmQodGhpcykpLFxuICAgICAgdXNlcjogbmV3IExpc3RWaWV3KHRoaXMuaXRlbXMudXNlciwgdGhpcy5yZWZzLmNvbW11bml0eVBhY2thZ2VzLCB0aGlzLmNyZWF0ZVBhY2thZ2VDYXJkLmJpbmQodGhpcykpLFxuICAgICAgZ2l0OiBuZXcgTGlzdFZpZXcodGhpcy5pdGVtcy5naXQsIHRoaXMucmVmcy5naXRQYWNrYWdlcywgdGhpcy5jcmVhdGVQYWNrYWdlQ2FyZC5iaW5kKHRoaXMpKVxuICAgIH1cblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgdGhpcy5yZWZzLmZpbHRlckVkaXRvci5vbkRpZFN0b3BDaGFuZ2luZygoKSA9PiB7IHRoaXMubWF0Y2hQYWNrYWdlcygpIH0pXG4gICAgKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICB0aGlzLnBhY2thZ2VNYW5hZ2VyLm9uKCdwYWNrYWdlLWluc3RhbGwtZmFpbGVkIHRoZW1lLWluc3RhbGwtZmFpbGVkIHBhY2thZ2UtdW5pbnN0YWxsLWZhaWxlZCB0aGVtZS11bmluc3RhbGwtZmFpbGVkIHBhY2thZ2UtdXBkYXRlLWZhaWxlZCB0aGVtZS11cGRhdGUtZmFpbGVkJywgKHtwYWNrLCBlcnJvcn0pID0+IHtcbiAgICAgICAgdGhpcy5yZWZzLnVwZGF0ZUVycm9ycy5hcHBlbmRDaGlsZChuZXcgRXJyb3JWaWV3KHRoaXMucGFja2FnZU1hbmFnZXIsIGVycm9yKS5lbGVtZW50KVxuICAgICAgfSlcbiAgICApXG5cbiAgICBsZXQgbG9hZFBhY2thZ2VzVGltZW91dFxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICB0aGlzLnBhY2thZ2VNYW5hZ2VyLm9uKCdwYWNrYWdlLXVwZGF0ZWQgcGFja2FnZS1pbnN0YWxsZWQgcGFja2FnZS11bmluc3RhbGxlZCBwYWNrYWdlLWluc3RhbGxlZC1hbHRlcm5hdGl2ZScsICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGxvYWRQYWNrYWdlc1RpbWVvdXQpXG4gICAgICAgIGxvYWRQYWNrYWdlc1RpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMubG9hZFBhY2thZ2VzLmJpbmQodGhpcyksIEluc3RhbGxlZFBhY2thZ2VzUGFuZWwubG9hZFBhY2thZ2VzRGVsYXkoKSlcbiAgICAgIH0pXG4gICAgKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmhhbmRsZUV2ZW50cygpKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4geyB0aGlzLnNjcm9sbFVwKCkgfSxcbiAgICAgICdjb3JlOm1vdmUtZG93bic6ICgpID0+IHsgdGhpcy5zY3JvbGxEb3duKCkgfSxcbiAgICAgICdjb3JlOnBhZ2UtdXAnOiAoKSA9PiB7IHRoaXMucGFnZVVwKCkgfSxcbiAgICAgICdjb3JlOnBhZ2UtZG93bic6ICgpID0+IHsgdGhpcy5wYWdlRG93bigpIH0sXG4gICAgICAnY29yZTptb3ZlLXRvLXRvcCc6ICgpID0+IHsgdGhpcy5zY3JvbGxUb1RvcCgpIH0sXG4gICAgICAnY29yZTptb3ZlLXRvLWJvdHRvbSc6ICgpID0+IHsgdGhpcy5zY3JvbGxUb0JvdHRvbSgpIH1cbiAgICB9KSlcblxuICAgIHRoaXMubG9hZFBhY2thZ2VzKClcbiAgfVxuXG4gIGZvY3VzICgpIHtcbiAgICB0aGlzLnJlZnMuZmlsdGVyRWRpdG9yLmVsZW1lbnQuZm9jdXMoKVxuICB9XG5cbiAgc2hvdyAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJ1xuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHJldHVybiBldGNoLmRlc3Ryb3kodGhpcylcbiAgfVxuXG4gIHVwZGF0ZSAoKSB7fVxuXG4gIHJlbmRlciAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdwYW5lbHMtaXRlbScgdGFiSW5kZXg9Jy0xJz5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPSdzZWN0aW9uJz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2VjdGlvbi1jb250YWluZXInPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NlY3Rpb24taGVhZGluZyBpY29uIGljb24tcGFja2FnZSc+XG4gICAgICAgICAgICAgIEluc3RhbGxlZCBQYWNrYWdlc1xuICAgICAgICAgICAgICA8c3BhbiByZWY9J3RvdGFsUGFja2FnZXMnIGNsYXNzTmFtZT0nc2VjdGlvbi1oZWFkaW5nLWNvdW50IGJhZGdlIGJhZGdlLWZsZXhpYmxlJz7igKY8L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdlZGl0b3ItY29udGFpbmVyJz5cbiAgICAgICAgICAgICAgPFRleHRFZGl0b3IgcmVmPSdmaWx0ZXJFZGl0b3InIG1pbmkgcGxhY2Vob2xkZXJUZXh0PSdGaWx0ZXIgcGFja2FnZXMgYnkgbmFtZScgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IHJlZj0ndXBkYXRlRXJyb3JzJyAvPlxuXG4gICAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9J3N1Yi1zZWN0aW9uIGluc3RhbGxlZC1wYWNrYWdlcyc+XG4gICAgICAgICAgICAgIDxoMyByZWY9J2NvbW11bml0eVBhY2thZ2VzSGVhZGVyJyBjbGFzc05hbWU9J3N1Yi1zZWN0aW9uLWhlYWRpbmcgaWNvbiBpY29uLXBhY2thZ2UnPlxuICAgICAgICAgICAgICAgIENvbW11bml0eSBQYWNrYWdlc1xuICAgICAgICAgICAgICAgIDxzcGFuIHJlZj0nY29tbXVuaXR5Q291bnQnIGNsYXNzTmFtZT0nc2VjdGlvbi1oZWFkaW5nLWNvdW50IGJhZGdlIGJhZGdlLWZsZXhpYmxlJz7igKY8L3NwYW4+XG4gICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICAgIDxkaXYgcmVmPSdjb21tdW5pdHlQYWNrYWdlcycgY2xhc3NOYW1lPSdjb250YWluZXIgcGFja2FnZS1jb250YWluZXInPlxuICAgICAgICAgICAgICAgIDxkaXYgcmVmPSdjb21tdW5pdHlMb2FkaW5nQXJlYScgY2xhc3NOYW1lPSdhbGVydCBhbGVydC1pbmZvIGxvYWRpbmctYXJlYSBpY29uIGljb24taG91cmdsYXNzJz5Mb2FkaW5nIHBhY2thZ2Vz4oCmPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9J3N1Yi1zZWN0aW9uIGNvcmUtcGFja2FnZXMnPlxuICAgICAgICAgICAgICA8aDMgcmVmPSdjb3JlUGFja2FnZXNIZWFkZXInIGNsYXNzTmFtZT0nc3ViLXNlY3Rpb24taGVhZGluZyBpY29uIGljb24tcGFja2FnZSc+XG4gICAgICAgICAgICAgICAgQ29yZSBQYWNrYWdlc1xuICAgICAgICAgICAgICAgIDxzcGFuIHJlZj0nY29yZUNvdW50JyBjbGFzc05hbWU9J3NlY3Rpb24taGVhZGluZy1jb3VudCBiYWRnZSBiYWRnZS1mbGV4aWJsZSc+4oCmPC9zcGFuPlxuICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICA8ZGl2IHJlZj0nY29yZVBhY2thZ2VzJyBjbGFzc05hbWU9J2NvbnRhaW5lciBwYWNrYWdlLWNvbnRhaW5lcic+XG4gICAgICAgICAgICAgICAgPGRpdiByZWY9J2NvcmVMb2FkaW5nQXJlYScgY2xhc3NOYW1lPSdhbGVydCBhbGVydC1pbmZvIGxvYWRpbmctYXJlYSBpY29uIGljb24taG91cmdsYXNzJz5Mb2FkaW5nIHBhY2thZ2Vz4oCmPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9J3N1Yi1zZWN0aW9uIGRldi1wYWNrYWdlcyc+XG4gICAgICAgICAgICAgIDxoMyByZWY9J2RldlBhY2thZ2VzSGVhZGVyJyBjbGFzc05hbWU9J3N1Yi1zZWN0aW9uLWhlYWRpbmcgaWNvbiBpY29uLXBhY2thZ2UnPlxuICAgICAgICAgICAgICAgIERldmVsb3BtZW50IFBhY2thZ2VzXG4gICAgICAgICAgICAgICAgPHNwYW4gcmVmPSdkZXZDb3VudCcgY2xhc3NOYW1lPSdzZWN0aW9uLWhlYWRpbmctY291bnQgYmFkZ2UgYmFkZ2UtZmxleGlibGUnPuKApjwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgPGRpdiByZWY9J2RldlBhY2thZ2VzJyBjbGFzc05hbWU9J2NvbnRhaW5lciBwYWNrYWdlLWNvbnRhaW5lcic+XG4gICAgICAgICAgICAgICAgPGRpdiByZWY9J2RldkxvYWRpbmdBcmVhJyBjbGFzc05hbWU9J2FsZXJ0IGFsZXJ0LWluZm8gbG9hZGluZy1hcmVhIGljb24gaWNvbi1ob3VyZ2xhc3MnPkxvYWRpbmcgcGFja2FnZXPigKY8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT0nc3ViLXNlY3Rpb24gZ2l0LXBhY2thZ2VzJz5cbiAgICAgICAgICAgICAgPGgzIHJlZj0nZ2l0UGFja2FnZXNIZWFkZXInIGNsYXNzTmFtZT0nc3ViLXNlY3Rpb24taGVhZGluZyBpY29uIGljb24tcGFja2FnZSc+XG4gICAgICAgICAgICAgICAgR2l0IFBhY2thZ2VzXG4gICAgICAgICAgICAgICAgPHNwYW4gcmVmPSdnaXRDb3VudCcgY2xhc3NOYW1lPSdzZWN0aW9uLWhlYWRpbmctY291bnQgYmFkZ2UgYmFkZ2UtZmxleGlibGUnPuKApjwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgPGRpdiByZWY9J2dpdFBhY2thZ2VzJyBjbGFzc05hbWU9J2NvbnRhaW5lciBwYWNrYWdlLWNvbnRhaW5lcic+XG4gICAgICAgICAgICAgICAgPGRpdiByZWY9J2dpdExvYWRpbmdBcmVhJyBjbGFzc05hbWU9J2FsZXJ0IGFsZXJ0LWluZm8gbG9hZGluZy1hcmVhIGljb24gaWNvbi1ob3VyZ2xhc3MnPkxvYWRpbmcgcGFja2FnZXPigKY8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIGZpbHRlclBhY2thZ2VzIChwYWNrYWdlcykge1xuICAgIHBhY2thZ2VzLmRldiA9IHBhY2thZ2VzLmRldi5maWx0ZXIoKHt0aGVtZX0pID0+ICF0aGVtZSlcbiAgICBwYWNrYWdlcy51c2VyID0gcGFja2FnZXMudXNlci5maWx0ZXIoKHt0aGVtZX0pID0+ICF0aGVtZSlcbiAgICBwYWNrYWdlcy5jb3JlID0gcGFja2FnZXMuY29yZS5maWx0ZXIoKHt0aGVtZX0pID0+ICF0aGVtZSlcbiAgICBwYWNrYWdlcy5naXQgPSAocGFja2FnZXMuZ2l0IHx8IFtdKS5maWx0ZXIoKHt0aGVtZX0pID0+ICF0aGVtZSlcblxuICAgIGZvciAobGV0IHBhY2sgb2YgcGFja2FnZXMuY29yZSkge1xuICAgICAgaWYgKHBhY2sucmVwb3NpdG9yeSA9PSBudWxsKSB7XG4gICAgICAgIHBhY2sucmVwb3NpdG9yeSA9IGBodHRwczovL2dpdGh1Yi5jb20vYXRvbS8ke3BhY2submFtZX1gXG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgcGFja2FnZVR5cGUgb2YgWydkZXYnLCAnY29yZScsICd1c2VyJywgJ2dpdCddKSB7XG4gICAgICBmb3IgKGxldCBwYWNrIG9mIHBhY2thZ2VzW3BhY2thZ2VUeXBlXSkge1xuICAgICAgICBwYWNrLm93bmVyID0gb3duZXJGcm9tUmVwb3NpdG9yeShwYWNrLnJlcG9zaXRvcnkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhY2thZ2VzXG4gIH1cblxuICBzb3J0UGFja2FnZXMgKHBhY2thZ2VzKSB7XG4gICAgcGFja2FnZXMuZGV2LnNvcnQocGFja2FnZUNvbXBhcmF0b3JBc2NlbmRpbmcpXG4gICAgcGFja2FnZXMuY29yZS5zb3J0KHBhY2thZ2VDb21wYXJhdG9yQXNjZW5kaW5nKVxuICAgIHBhY2thZ2VzLnVzZXIuc29ydChwYWNrYWdlQ29tcGFyYXRvckFzY2VuZGluZylcbiAgICBwYWNrYWdlcy5naXQuc29ydChwYWNrYWdlQ29tcGFyYXRvckFzY2VuZGluZylcbiAgICByZXR1cm4gcGFja2FnZXNcbiAgfVxuXG4gIGxvYWRQYWNrYWdlcyAoKSB7XG4gICAgY29uc3QgcGFja2FnZXNXaXRoVXBkYXRlcyA9IHt9XG4gICAgdGhpcy5wYWNrYWdlTWFuYWdlci5nZXRPdXRkYXRlZCgpLnRoZW4oKHBhY2thZ2VzKSA9PiB7XG4gICAgICBmb3IgKGxldCB7bmFtZSwgbGF0ZXN0VmVyc2lvbn0gb2YgcGFja2FnZXMpIHtcbiAgICAgICAgcGFja2FnZXNXaXRoVXBkYXRlc1tuYW1lXSA9IGxhdGVzdFZlcnNpb25cbiAgICAgIH1cbiAgICAgIHRoaXMuZGlzcGxheVBhY2thZ2VVcGRhdGVzKHBhY2thZ2VzV2l0aFVwZGF0ZXMpXG4gICAgfSlcblxuICAgIHRoaXMucGFja2FnZU1hbmFnZXIuZ2V0SW5zdGFsbGVkKCkudGhlbigocGFja2FnZXMpID0+IHtcbiAgICAgIHRoaXMucGFja2FnZXMgPSB0aGlzLnNvcnRQYWNrYWdlcyh0aGlzLmZpbHRlclBhY2thZ2VzKHBhY2thZ2VzKSlcbiAgICAgIHRoaXMucmVmcy5kZXZMb2FkaW5nQXJlYS5yZW1vdmUoKVxuICAgICAgdGhpcy5pdGVtcy5kZXYuc2V0SXRlbXModGhpcy5wYWNrYWdlcy5kZXYpXG5cbiAgICAgIHRoaXMucmVmcy5jb3JlTG9hZGluZ0FyZWEucmVtb3ZlKClcbiAgICAgIHRoaXMuaXRlbXMuY29yZS5zZXRJdGVtcyh0aGlzLnBhY2thZ2VzLmNvcmUpXG5cbiAgICAgIHRoaXMucmVmcy5jb21tdW5pdHlMb2FkaW5nQXJlYS5yZW1vdmUoKVxuICAgICAgdGhpcy5pdGVtcy51c2VyLnNldEl0ZW1zKHRoaXMucGFja2FnZXMudXNlcilcblxuICAgICAgdGhpcy5yZWZzLmdpdExvYWRpbmdBcmVhLnJlbW92ZSgpXG4gICAgICB0aGlzLml0ZW1zLmdpdC5zZXRJdGVtcyh0aGlzLnBhY2thZ2VzLmdpdClcblxuICAgICAgLy8gVE9ETyBzaG93IGVtcHR5IG1lc2FnZSBwZXIgc2VjdGlvblxuXG4gICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25Db3VudHMoKVxuICAgICAgdGhpcy5kaXNwbGF5UGFja2FnZVVwZGF0ZXMocGFja2FnZXNXaXRoVXBkYXRlcylcblxuICAgICAgdGhpcy5tYXRjaFBhY2thZ2VzKClcbiAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IubWVzc2FnZSwgZXJyb3Iuc3RhY2spXG4gICAgfSlcbiAgfVxuXG4gIGRpc3BsYXlQYWNrYWdlVXBkYXRlcyAocGFja2FnZXNXaXRoVXBkYXRlcykge1xuICAgIGZvciAoY29uc3QgcGFja2FnZVR5cGUgb2YgWydkZXYnLCAnY29yZScsICd1c2VyJywgJ2dpdCddKSB7XG4gICAgICBmb3IgKGNvbnN0IHBhY2thZ2VDYXJkIG9mIHRoaXMuaXRlbVZpZXdzW3BhY2thZ2VUeXBlXS5nZXRWaWV3cygpKSB7XG4gICAgICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBwYWNrYWdlc1dpdGhVcGRhdGVzW3BhY2thZ2VDYXJkLnBhY2submFtZV1cbiAgICAgICAgaWYgKG5ld1ZlcnNpb24pIHtcbiAgICAgICAgICBwYWNrYWdlQ2FyZC5kaXNwbGF5QXZhaWxhYmxlVXBkYXRlKG5ld1ZlcnNpb24pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjcmVhdGVQYWNrYWdlQ2FyZCAocGFjaykge1xuICAgIHJldHVybiBuZXcgUGFja2FnZUNhcmQocGFjaywgdGhpcy5zZXR0aW5nc1ZpZXcsIHRoaXMucGFja2FnZU1hbmFnZXIsIHtiYWNrOiAnUGFja2FnZXMnfSlcbiAgfVxuXG4gIGZpbHRlclBhY2thZ2VMaXN0QnlUZXh0ICh0ZXh0KSB7XG4gICAgaWYgKCF0aGlzLnBhY2thZ2VzKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBmb3IgKGxldCBwYWNrYWdlVHlwZSBvZiBbJ2RldicsICdjb3JlJywgJ3VzZXInLCAnZ2l0J10pIHtcbiAgICAgIGNvbnN0IGFsbFZpZXdzID0gdGhpcy5pdGVtVmlld3NbcGFja2FnZVR5cGVdLmdldFZpZXdzKClcbiAgICAgIGNvbnN0IGFjdGl2ZVZpZXdzID0gdGhpcy5pdGVtVmlld3NbcGFja2FnZVR5cGVdLmZpbHRlclZpZXdzKChwYWNrKSA9PiB7XG4gICAgICAgIGlmICh0ZXh0ID09PSAnJykge1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgb3duZXIgPSBwYWNrLm93bmVyICE9IG51bGwgPyBwYWNrLm93bmVyIDogb3duZXJGcm9tUmVwb3NpdG9yeShwYWNrLnJlcG9zaXRvcnkpXG4gICAgICAgICAgY29uc3QgZmlsdGVyVGV4dCA9IGAke3BhY2submFtZX0gJHtvd25lcn1gXG4gICAgICAgICAgcmV0dXJuIGZ1enphbGRyaW4uc2NvcmUoZmlsdGVyVGV4dCwgdGV4dCkgPiAwXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGZvciAoY29uc3QgdmlldyBvZiBhbGxWaWV3cykge1xuICAgICAgICBpZiAodmlldykge1xuICAgICAgICAgIHZpZXcuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgICAgdmlldy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCB2aWV3IG9mIGFjdGl2ZVZpZXdzKSB7XG4gICAgICAgIGlmICh2aWV3KSB7XG4gICAgICAgICAgdmlldy5lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJ1xuICAgICAgICAgIHZpZXcuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVTZWN0aW9uQ291bnRzKClcbiAgfVxuXG4gIHVwZGF0ZVVuZmlsdGVyZWRTZWN0aW9uQ291bnRzICgpIHtcbiAgICB0aGlzLnVwZGF0ZVNlY3Rpb25Db3VudCh0aGlzLnJlZnMuY29tbXVuaXR5UGFja2FnZXNIZWFkZXIsIHRoaXMucmVmcy5jb21tdW5pdHlDb3VudCwgdGhpcy5wYWNrYWdlcy51c2VyLmxlbmd0aClcbiAgICB0aGlzLnVwZGF0ZVNlY3Rpb25Db3VudCh0aGlzLnJlZnMuY29yZVBhY2thZ2VzSGVhZGVyLCB0aGlzLnJlZnMuY29yZUNvdW50LCB0aGlzLnBhY2thZ2VzLmNvcmUubGVuZ3RoKVxuICAgIHRoaXMudXBkYXRlU2VjdGlvbkNvdW50KHRoaXMucmVmcy5kZXZQYWNrYWdlc0hlYWRlciwgdGhpcy5yZWZzLmRldkNvdW50LCB0aGlzLnBhY2thZ2VzLmRldi5sZW5ndGgpXG4gICAgdGhpcy51cGRhdGVTZWN0aW9uQ291bnQodGhpcy5yZWZzLmdpdFBhY2thZ2VzSGVhZGVyLCB0aGlzLnJlZnMuZ2l0Q291bnQsIHRoaXMucGFja2FnZXMuZ2l0Lmxlbmd0aClcblxuICAgIGNvbnN0IHRvdGFsUGFja2FnZXMgPVxuICAgICAgdGhpcy5wYWNrYWdlcy51c2VyLmxlbmd0aCArXG4gICAgICB0aGlzLnBhY2thZ2VzLmNvcmUubGVuZ3RoICtcbiAgICAgIHRoaXMucGFja2FnZXMuZGV2Lmxlbmd0aCArXG4gICAgICB0aGlzLnBhY2thZ2VzLmdpdC5sZW5ndGhcbiAgICB0aGlzLnJlZnMudG90YWxQYWNrYWdlcy50ZXh0Q29udGVudCA9IHRvdGFsUGFja2FnZXMudG9TdHJpbmcoKVxuICB9XG5cbiAgdXBkYXRlRmlsdGVyZWRTZWN0aW9uQ291bnRzICgpIHtcbiAgICBjb25zdCBjb21tdW5pdHkgPSB0aGlzLm5vdEhpZGRlbkNhcmRzTGVuZ3RoKHRoaXMucmVmcy5jb21tdW5pdHlQYWNrYWdlcylcbiAgICB0aGlzLnVwZGF0ZVNlY3Rpb25Db3VudCh0aGlzLnJlZnMuY29tbXVuaXR5UGFja2FnZXNIZWFkZXIsIHRoaXMucmVmcy5jb21tdW5pdHlDb3VudCwgY29tbXVuaXR5LCB0aGlzLnBhY2thZ2VzLnVzZXIubGVuZ3RoKVxuXG4gICAgY29uc3QgY29yZSA9IHRoaXMubm90SGlkZGVuQ2FyZHNMZW5ndGgodGhpcy5yZWZzLmNvcmVQYWNrYWdlcylcbiAgICB0aGlzLnVwZGF0ZVNlY3Rpb25Db3VudCh0aGlzLnJlZnMuY29yZVBhY2thZ2VzSGVhZGVyLCB0aGlzLnJlZnMuY29yZUNvdW50LCBjb3JlLCB0aGlzLnBhY2thZ2VzLmNvcmUubGVuZ3RoKVxuXG4gICAgY29uc3QgZGV2ID0gdGhpcy5ub3RIaWRkZW5DYXJkc0xlbmd0aCh0aGlzLnJlZnMuZGV2UGFja2FnZXMpXG4gICAgdGhpcy51cGRhdGVTZWN0aW9uQ291bnQodGhpcy5yZWZzLmRldlBhY2thZ2VzSGVhZGVyLCB0aGlzLnJlZnMuZGV2Q291bnQsIGRldiwgdGhpcy5wYWNrYWdlcy5kZXYubGVuZ3RoKVxuXG4gICAgY29uc3QgZ2l0ID0gdGhpcy5ub3RIaWRkZW5DYXJkc0xlbmd0aCh0aGlzLnJlZnMuZ2l0UGFja2FnZXMpXG4gICAgdGhpcy51cGRhdGVTZWN0aW9uQ291bnQodGhpcy5yZWZzLmdpdFBhY2thZ2VzSGVhZGVyLCB0aGlzLnJlZnMuZ2l0Q291bnQsIGdpdCwgdGhpcy5wYWNrYWdlcy5naXQubGVuZ3RoKVxuXG4gICAgY29uc3Qgc2hvd25QYWNrYWdlcyA9IGRldiArIGNvcmUgKyBjb21tdW5pdHkgKyBnaXRcbiAgICBjb25zdCB0b3RhbFBhY2thZ2VzID0gdGhpcy5wYWNrYWdlcy51c2VyLmxlbmd0aCArIHRoaXMucGFja2FnZXMuY29yZS5sZW5ndGggKyB0aGlzLnBhY2thZ2VzLmRldi5sZW5ndGggKyB0aGlzLnBhY2thZ2VzLmdpdC5sZW5ndGhcbiAgICB0aGlzLnJlZnMudG90YWxQYWNrYWdlcy50ZXh0Q29udGVudCA9IGAke3Nob3duUGFja2FnZXN9LyR7dG90YWxQYWNrYWdlc31gXG4gIH1cblxuICByZXNldFNlY3Rpb25IYXNJdGVtcyAoKSB7XG4gICAgdGhpcy5yZXNldENvbGxhcHNpYmxlU2VjdGlvbnMoW3RoaXMucmVmcy5jb21tdW5pdHlQYWNrYWdlc0hlYWRlciwgdGhpcy5yZWZzLmNvcmVQYWNrYWdlc0hlYWRlciwgdGhpcy5yZWZzLmRldlBhY2thZ2VzSGVhZGVyLCB0aGlzLnJlZnMuZ2l0UGFja2FnZXNIZWFkZXJdKVxuICB9XG5cbiAgbWF0Y2hQYWNrYWdlcyAoKSB7XG4gICAgdGhpcy5maWx0ZXJQYWNrYWdlTGlzdEJ5VGV4dCh0aGlzLnJlZnMuZmlsdGVyRWRpdG9yLmdldFRleHQoKSlcbiAgfVxuXG4gIHNjcm9sbFVwICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wIC09IGRvY3VtZW50LmJvZHkub2Zmc2V0SGVpZ2h0IC8gMjBcbiAgfVxuXG4gIHNjcm9sbERvd24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgKz0gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQgLyAyMFxuICB9XG5cbiAgcGFnZVVwICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wIC09IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgfVxuXG4gIHBhZ2VEb3duICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wICs9IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgfVxuXG4gIHNjcm9sbFRvVG9wICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wID0gMFxuICB9XG5cbiAgc2Nyb2xsVG9Cb3R0b20gKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLmVsZW1lbnQuc2Nyb2xsSGVpZ2h0XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBR0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQXVFO0FBYnZFO0FBQ0E7O0FBY2UsTUFBTUEsc0JBQXNCLFNBQVNDLGdDQUF1QixDQUFDO0VBQzFFLE9BQU9DLGlCQUFpQixHQUFJO0lBQzFCLE9BQU8sR0FBRztFQUNaO0VBRUFDLFdBQVcsQ0FBRUMsWUFBWSxFQUFFQyxjQUFjLEVBQUU7SUFDekMsS0FBSyxFQUFFO0lBQ1BDLGFBQUksQ0FBQ0MsVUFBVSxDQUFDLElBQUksQ0FBQztJQUNyQixJQUFJLENBQUNILFlBQVksR0FBR0EsWUFBWTtJQUNoQyxJQUFJLENBQUNDLGNBQWMsR0FBR0EsY0FBYztJQUNwQyxJQUFJLENBQUNHLEtBQUssR0FBRztNQUNYQyxHQUFHLEVBQUUsSUFBSUMsYUFBSSxDQUFDLE1BQU0sQ0FBQztNQUNyQkMsSUFBSSxFQUFFLElBQUlELGFBQUksQ0FBQyxNQUFNLENBQUM7TUFDdEJFLElBQUksRUFBRSxJQUFJRixhQUFJLENBQUMsTUFBTSxDQUFDO01BQ3RCRyxHQUFHLEVBQUUsSUFBSUgsYUFBSSxDQUFDLE1BQU07SUFDdEIsQ0FBQztJQUNELElBQUksQ0FBQ0ksU0FBUyxHQUFHO01BQ2ZMLEdBQUcsRUFBRSxJQUFJTSxpQkFBUSxDQUFDLElBQUksQ0FBQ1AsS0FBSyxDQUFDQyxHQUFHLEVBQUUsSUFB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