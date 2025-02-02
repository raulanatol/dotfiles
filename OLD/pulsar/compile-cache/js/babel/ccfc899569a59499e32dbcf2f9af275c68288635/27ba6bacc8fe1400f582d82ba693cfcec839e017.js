"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = _interopRequireDefault(require("path"));
var _electron = _interopRequireDefault(require("electron"));
var _etch = _interopRequireDefault(require("etch"));
var _hostedGitInfo = _interopRequireDefault(require("hosted-git-info"));
var _atom = require("atom");
var _packageCard = _interopRequireDefault(require("./package-card"));
var _errorView = _interopRequireDefault(require("./error-view"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */
/** @jsx etch.dom */

const PackageNameRegex = /config\/install\/(package|theme):([a-z0-9-_]+)/i;
class InstallPanel {
  constructor(settingsView, packageManager) {
    this.settingsView = settingsView;
    this.packageManager = packageManager;
    this.disposables = new _atom.CompositeDisposable();
    this.client = this.packageManager.getClient();
    this.atomIoURL = 'https://pulsar-edit.dev/packages';
    _etch.default.initialize(this);
    this.refs.searchMessage.style.display = 'none';
    this.refs.searchEditor.setPlaceholderText('Search packages');
    this.searchType = 'packages';
    this.disposables.add(this.packageManager.on('package-install-failed', ({
      pack,
      error
    }) => {
      this.refs.searchErrors.appendChild(new _errorView.default(this.packageManager, error).element);
    }));
    this.disposables.add(this.packageManager.on('package-installed theme-installed', ({
      pack
    }) => {
      const gitUrlInfo = this.currentGitPackageCard && this.currentGitPackageCard.pack && this.currentGitPackageCard.pack.gitUrlInfo ? this.currentGitPackageCard.pack.gitUrlInfo : null;
      if (gitUrlInfo && gitUrlInfo === pack.gitUrlInfo) {
        this.updateGitPackageCard(pack);
      }
    }));
    this.disposables.add(this.refs.searchEditor.onDidStopChanging(() => {
      this.performSearch();
    }));
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
    this.loadFeaturedPackages();
  }
  destroy() {
    this.disposables.dispose();
    return _etch.default.destroy(this);
  }
  update() {}
  focus() {
    this.refs.searchEditor.element.focus();
  }
  show() {
    this.element.style.display = '';
  }
  render() {
    return _etch.default.dom("div", {
      className: "panels-item",
      tabIndex: "-1"
    }, _etch.default.dom("div", {
      className: "section packages"
    }, _etch.default.dom("div", {
      className: "section-container"
    }, _etch.default.dom("h1", {
      ref: "installHeading",
      className: "section-heading icon icon-plus"
    }, "Install Packages"), _etch.default.dom("div", {
      className: "text native-key-bindings",
      tabIndex: "-1"
    }, _etch.default.dom("span", {
      className: "icon icon-question"
    }), _etch.default.dom("span", {
      ref: "publishedToText"
    }, "Packages are published to "), _etch.default.dom("a", {
      className: "link",
      onclick: this.didClickOpenAtomIo.bind(this)
    }, "atom.io"), _etch.default.dom("span", null, " and are installed to ", _path.default.join(process.env.ATOM_HOME, 'packages'))), _etch.default.dom("div", {
      className: "search-container clearfix"
    }, _etch.default.dom("div", {
      className: "editor-container"
    }, _etch.default.dom(_atom.TextEditor, {
      mini: true,
      ref: "searchEditor"
    })), _etch.default.dom("div", {
      className: "btn-group"
    }, _etch.default.dom("button", {
      ref: "searchPackagesButton",
      className: "btn btn-default selected",
      onclick: this.didClickSearchPackagesButton.bind(this)
    }, "Packages"), _etch.default.dom("button", {
      ref: "searchThemesButton",
      className: "btn btn-default",
      onclick: this.didClickSearchThemesButton.bind(this)
    }, "Themes"))), _etch.default.dom("div", {
      ref: "searchErrors"
    }), _etch.default.dom("div", {
      ref: "searchMessage",
      className: "alert alert-info search-message icon icon-search"
    }), _etch.default.dom("div", {
      ref: "resultsContainer",
      className: "container package-container"
    }))), _etch.default.dom("div", {
      className: "section packages"
    }, _etch.default.dom("div", {
      className: "section-container"
    }, _etch.default.dom("div", {
      ref: "featuredHeading",
      className: "section-heading icon icon-star"
    }), _etch.default.dom("div", {
      ref: "featuredErrors"
    }), _etch.default.dom("div", {
      ref: "loadingMessage",
      className: "alert alert-info icon icon-hourglass"
    }), _etch.default.dom("div", {
      ref: "featuredContainer",
      className: "container package-container"
    }))));
  }
  setSearchType(searchType) {
    if (searchType === 'theme') {
      this.searchType = 'themes';
      this.refs.searchThemesButton.classList.add('selected');
      this.refs.searchPackagesButton.classList.remove('selected');
      this.refs.searchEditor.setPlaceholderText('Search themes');
      this.refs.publishedToText.textContent = 'Themes are published to ';
      this.atomIoURL = 'https://pulsar-edit.dev/themes';
      this.loadFeaturedPackages(true);
    } else if (searchType === 'package') {
      this.searchType = 'packages';
      this.refs.searchPackagesButton.classList.add('selected');
      this.refs.searchThemesButton.classList.remove('selected');
      this.refs.searchEditor.setPlaceholderText('Search packages');
      this.refs.publishedToText.textContent = 'Packages are published to ';
      this.atomIoURL = 'https://pulsar-edit.dev/packages';
      this.loadFeaturedPackages();
    }
  }
  beforeShow(options) {
    if (options && options.uri) {
      const query = this.extractQueryFromURI(options.uri);
      if (query != null) {
        const {
          searchType,
          packageName
        } = query;
        this.setSearchType(searchType);
        this.refs.searchEditor.setText(packageName);
        this.performSearch();
      }
    }
  }
  extractQueryFromURI(uri) {
    const matches = PackageNameRegex.exec(uri);
    if (matches) {
      const [, searchType, packageName] = Array.from(matches);
      return {
        searchType,
        packageName
      };
    } else {
      return null;
    }
  }
  performSearch() {
    const query = this.refs.searchEditor.getText().trim().toLowerCase();
    if (query) {
      this.performSearchForQuery(query);
    }
  }
  performSearchForQuery(query) {
    const gitUrlInfo = _hostedGitInfo.default.fromUrl(query);
    if (gitUrlInfo) {
      const type = gitUrlInfo.default;
      if (type === 'sshurl' || type === 'https' || type === 'shortcut') {
        this.showGitInstallPackageCard({
          name: query,
          gitUrlInfo
        });
      }
    } else {
      this.search(query);
    }
  }
  showGitInstallPackageCard(pack) {
    if (this.currentGitPackageCard) {
      this.currentGitPackageCard.destroy();
    }
    this.currentGitPackageCard = this.getPackageCardView(pack);
    this.currentGitPackageCard.displayGitPackageInstallInformation();
    this.replaceCurrentGitPackageCardView();
  }
  updateGitPackageCard(pack) {
    if (this.currentGitPackageCard) {
      this.currentGitPackageCard.destroy();
    }
    this.currentGitPackageCard = this.getPackageCardView(pack);
    this.replaceCurrentGitPackageCardView();
  }
  replaceCurrentGitPackageCardView() {
    this.refs.resultsContainer.innerHTML = '';
    this.addPackageCardView(this.refs.resultsContainer, this.currentGitPackageCard);
  }
  async search(query) {
    this.refs.resultsContainer.innerHTML = '';
    this.refs.searchMessage.textContent = `Searching ${this.searchType} for \u201C${query}\u201D\u2026`;
    this.refs.searchMessage.style.display = '';
    const options = {};
    options[this.searchType] = true;
    try {
      const packages = (await this.client.search(query, options)) || [];
      this.refs.resultsContainer.innerHTML = '';
      this.refs.searchMessage.style.display = 'none';
      if (packages.length === 0) {
        this.refs.searchMessage.textContent = `No ${this.searchType.replace(/s$/, '')} results for \u201C${query}\u201D`;
        this.refs.searchMessage.style.display = '';
      }
      this.addPackageViews(this.refs.resultsContainer, packages);
    } catch (error) {
      this.refs.searchMessage.style.display = 'none';
      this.refs.searchErrors.appendChild(new _errorView.default(this.packageManager, error).element);
    }
  }
  addPackageViews(container, packages) {
    for (const pack of packages) {
      this.addPackageCardView(container, this.getPackageCardView(pack));
    }
  }
  addPackageCardView(container, packageCard) {
    const packageRow = document.createElement('div');
    packageRow.classList.add('row');
    packageRow.appendChild(packageCard.element);
    container.appendChild(packageRow);
  }
  getPackageCardView(pack) {
    return new _packageCard.default(pack, this.settingsView, this.packageManager, {
      back: 'Install'
    });
  }
  filterPackages(packages, themes) {
    return packages.filter(({
      theme
    }) => themes ? theme : !theme);
  }

  // Load and display the featured packages that are available to install.
  loadFeaturedPackages(loadThemes) {
    if (loadThemes == null) {
      loadThemes = false;
    }
    this.refs.featuredContainer.innerHTML = '';
    if (loadThemes) {
      this.refs.installHeading.textContent = 'Install Themes';
      this.refs.featuredHeading.textContent = 'Featured Themes';
      this.refs.loadingMessage.textContent = 'Loading featured themes\u2026';
    } else {
      this.refs.installHeading.textContent = 'Install Packages';
      this.refs.featuredHeading.textContent = 'Featured Packages';
      this.refs.loadingMessage.textContent = 'Loading featured packages\u2026';
    }
    this.refs.loadingMessage.style.display = '';
    const handle = error => {
      this.refs.loadingMessage.style.display = 'none';
      this.refs.featuredErrors.appendChild(new _errorView.default(this.packageManager, error).element);
    };
    if (loadThemes) {
      this.client.featuredThemes((error, themes) => {
        if (error) {
          handle(error);
        } else {
          this.refs.loadingMessage.style.display = 'none';
          this.refs.featuredHeading.textContent = 'Featured Themes';
          this.addPackageViews(this.refs.featuredContainer, themes);
        }
      });
    } else {
      this.client.featuredPackages((error, packages) => {
        if (error) {
          handle(error);
        } else {
          this.refs.loadingMessage.style.display = 'none';
          this.refs.featuredHeading.textContent = 'Featured Packages';
          this.addPackageViews(this.refs.featuredContainer, packages);
        }
      });
    }
  }
  didClickOpenAtomIo(event) {
    event.preventDefault();
    _electron.default.shell.openExternal(this.atomIoURL);
  }
  didClickSearchPackagesButton() {
    if (!this.refs.searchPackagesButton.classList.contains('selected')) {
      this.setSearchType('package');
    }
    this.performSearch();
  }
  didClickSearchThemesButton() {
    if (!this.refs.searchThemesButton.classList.contains('selected')) {
      this.setSearchType('theme');
    }
    this.performSearch();
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
exports.default = InstallPanel;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYWNrYWdlTmFtZVJlZ2V4IiwiSW5zdGFsbFBhbmVsIiwiY29uc3RydWN0b3IiLCJzZXR0aW5nc1ZpZXciLCJwYWNrYWdlTWFuYWdlciIsImRpc3Bvc2FibGVzIiwiQ29tcG9zaXRlRGlzcG9zYWJsZSIsImNsaWVudCIsImdldENsaWVudCIsImF0b21Jb1VSTCIsImV0Y2giLCJpbml0aWFsaXplIiwicmVmcyIsInNlYXJjaE1lc3NhZ2UiLCJzdHlsZSIsImRpc3BsYXkiLCJzZWFyY2hFZGl0b3IiLCJzZXRQbGFjZWhvbGRlclRleHQiLCJzZWFyY2hUeXBlIiwiYWRkIiwib24iLCJwYWNrIiwiZXJyb3IiLCJzZWFyY2hFcnJvcnMiLCJhcHBlbmRDaGlsZCIsIkVycm9yVmlldyIsImVsZW1lbnQiLCJnaXRVcmxJbmZvIiwiY3VycmVudEdpdFBhY2thZ2VDYXJkIiwidXBkYXRlR2l0UGFja2FnZUNhcmQiLCJvbkRpZFN0b3BDaGFuZ2luZyIsInBlcmZvcm1TZWFyY2giLCJhdG9tIiwiY29tbWFuZHMiLCJzY3JvbGxVcCIsInNjcm9sbERvd24iLCJwYWdlVXAiLCJwYWdlRG93biIsInNjcm9sbFRvVG9wIiwic2Nyb2xsVG9Cb3R0b20iLCJsb2FkRmVhdHVyZWRQYWNrYWdlcyIsImRlc3Ryb3kiLCJkaXNwb3NlIiwidXBkYXRlIiwiZm9jdXMiLCJzaG93IiwicmVuZGVyIiwiZGlkQ2xpY2tPcGVuQXRvbUlvIiwiYmluZCIsInBhdGgiLCJqb2luIiwicHJvY2VzcyIsImVudiIsIkFUT01fSE9NRSIsImRpZENsaWNrU2VhcmNoUGFja2FnZXNCdXR0b24iLCJkaWRDbGlja1NlYXJjaFRoZW1lc0J1dHRvbiIsInNldFNlYXJjaFR5cGUiLCJzZWFyY2hUaGVtZXNCdXR0b24iLCJjbGFzc0xpc3QiLCJzZWFyY2hQYWNrYWdlc0J1dHRvbiIsInJlbW92ZSIsInB1Ymxpc2hlZFRvVGV4dCIsInRleHRDb250ZW50IiwiYmVmb3JlU2hvdyIsIm9wdGlvbnMiLCJ1cmkiLCJxdWVyeSIsImV4dHJhY3RRdWVyeUZyb21VUkkiLCJwYWNrYWdlTmFtZSIsInNldFRleHQiLCJtYXRjaGVzIiwiZXhlYyIsIkFycmF5IiwiZnJvbSIsImdldFRleHQiLCJ0cmltIiwidG9Mb3dlckNhc2UiLCJwZXJmb3JtU2VhcmNoRm9yUXVlcnkiLCJob3N0ZWRHaXRJbmZvIiwiZnJvbVVybCIsInR5cGUiLCJkZWZhdWx0Iiwic2hvd0dpdEluc3RhbGxQYWNrYWdlQ2FyZCIsIm5hbWUiLCJzZWFyY2giLCJnZXRQYWNrYWdlQ2FyZFZpZXciLCJkaXNwbGF5R2l0UGFja2FnZUluc3RhbGxJbmZvcm1hdGlvbiIsInJlcGxhY2VDdXJyZW50R2l0UGFja2FnZUNhcmRWaWV3IiwicmVzdWx0c0NvbnRhaW5lciIsImlubmVySFRNTCIsImFkZFBhY2thZ2VDYXJkVmlldyIsInBhY2thZ2VzIiwibGVuZ3RoIiwicmVwbGFjZSIsImFkZFBhY2thZ2VWaWV3cyIsImNvbnRhaW5lciIsInBhY2thZ2VDYXJkIiwicGFja2FnZVJvdyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIlBhY2thZ2VDYXJkIiwiYmFjayIsImZpbHRlclBhY2thZ2VzIiwidGhlbWVzIiwiZmlsdGVyIiwidGhlbWUiLCJsb2FkVGhlbWVzIiwiZmVhdHVyZWRDb250YWluZXIiLCJpbnN0YWxsSGVhZGluZyIsImZlYXR1cmVkSGVhZGluZyIsImxvYWRpbmdNZXNzYWdlIiwiaGFuZGxlIiwiZmVhdHVyZWRFcnJvcnMiLCJmZWF0dXJlZFRoZW1lcyIsImZlYXR1cmVkUGFja2FnZXMiLCJldmVudCIsInByZXZlbnREZWZhdWx0IiwiZWxlY3Ryb24iLCJzaGVsbCIsIm9wZW5FeHRlcm5hbCIsImNvbnRhaW5zIiwic2Nyb2xsVG9wIiwiYm9keSIsIm9mZnNldEhlaWdodCIsInNjcm9sbEhlaWdodCJdLCJzb3VyY2VzIjpbImluc3RhbGwtcGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuLyoqIEBqc3ggZXRjaC5kb20gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBlbGVjdHJvbiBmcm9tICdlbGVjdHJvbidcbmltcG9ydCBldGNoIGZyb20gJ2V0Y2gnXG5pbXBvcnQgaG9zdGVkR2l0SW5mbyBmcm9tICdob3N0ZWQtZ2l0LWluZm8nXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgVGV4dEVkaXRvcn0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IFBhY2thZ2VDYXJkIGZyb20gJy4vcGFja2FnZS1jYXJkJ1xuaW1wb3J0IEVycm9yVmlldyBmcm9tICcuL2Vycm9yLXZpZXcnXG5cbmNvbnN0IFBhY2thZ2VOYW1lUmVnZXggPSAvY29uZmlnXFwvaW5zdGFsbFxcLyhwYWNrYWdlfHRoZW1lKTooW2EtejAtOS1fXSspL2lcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5zdGFsbFBhbmVsIHtcbiAgY29uc3RydWN0b3IgKHNldHRpbmdzVmlldywgcGFja2FnZU1hbmFnZXIpIHtcbiAgICB0aGlzLnNldHRpbmdzVmlldyA9IHNldHRpbmdzVmlld1xuICAgIHRoaXMucGFja2FnZU1hbmFnZXIgPSBwYWNrYWdlTWFuYWdlclxuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5jbGllbnQgPSB0aGlzLnBhY2thZ2VNYW5hZ2VyLmdldENsaWVudCgpXG4gICAgdGhpcy5hdG9tSW9VUkwgPSAnaHR0cHM6Ly9wdWxzYXItZWRpdC5kZXYvcGFja2FnZXMnXG5cbiAgICBldGNoLmluaXRpYWxpemUodGhpcylcblxuICAgIHRoaXMucmVmcy5zZWFyY2hNZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgIHRoaXMucmVmcy5zZWFyY2hFZGl0b3Iuc2V0UGxhY2Vob2xkZXJUZXh0KCdTZWFyY2ggcGFja2FnZXMnKVxuICAgIHRoaXMuc2VhcmNoVHlwZSA9ICdwYWNrYWdlcydcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIHRoaXMucGFja2FnZU1hbmFnZXIub24oJ3BhY2thZ2UtaW5zdGFsbC1mYWlsZWQnLCAoe3BhY2ssIGVycm9yfSkgPT4ge1xuICAgICAgICB0aGlzLnJlZnMuc2VhcmNoRXJyb3JzLmFwcGVuZENoaWxkKG5ldyBFcnJvclZpZXcodGhpcy5wYWNrYWdlTWFuYWdlciwgZXJyb3IpLmVsZW1lbnQpXG4gICAgICB9KVxuICAgIClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIHRoaXMucGFja2FnZU1hbmFnZXIub24oJ3BhY2thZ2UtaW5zdGFsbGVkIHRoZW1lLWluc3RhbGxlZCcsICh7cGFja30pID0+IHtcbiAgICAgICAgY29uc3QgZ2l0VXJsSW5mbyA9XG4gICAgICAgICAgKHRoaXMuY3VycmVudEdpdFBhY2thZ2VDYXJkICYmIHRoaXMuY3VycmVudEdpdFBhY2thZ2VDYXJkLnBhY2sgJiYgdGhpcy5jdXJyZW50R2l0UGFja2FnZUNhcmQucGFjay5naXRVcmxJbmZvKVxuICAgICAgICAgID8gdGhpcy5jdXJyZW50R2l0UGFja2FnZUNhcmQucGFjay5naXRVcmxJbmZvXG4gICAgICAgICAgOiBudWxsXG5cbiAgICAgICAgaWYgKGdpdFVybEluZm8gJiYgZ2l0VXJsSW5mbyA9PT0gcGFjay5naXRVcmxJbmZvKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVHaXRQYWNrYWdlQ2FyZChwYWNrKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIHRoaXMucmVmcy5zZWFyY2hFZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcoKCkgPT4ge1xuICAgICAgICB0aGlzLnBlcmZvcm1TZWFyY2goKVxuICAgICAgfSlcbiAgICApXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4geyB0aGlzLnNjcm9sbFVwKCkgfSxcbiAgICAgICdjb3JlOm1vdmUtZG93bic6ICgpID0+IHsgdGhpcy5zY3JvbGxEb3duKCkgfSxcbiAgICAgICdjb3JlOnBhZ2UtdXAnOiAoKSA9PiB7IHRoaXMucGFnZVVwKCkgfSxcbiAgICAgICdjb3JlOnBhZ2UtZG93bic6ICgpID0+IHsgdGhpcy5wYWdlRG93bigpIH0sXG4gICAgICAnY29yZTptb3ZlLXRvLXRvcCc6ICgpID0+IHsgdGhpcy5zY3JvbGxUb1RvcCgpIH0sXG4gICAgICAnY29yZTptb3ZlLXRvLWJvdHRvbSc6ICgpID0+IHsgdGhpcy5zY3JvbGxUb0JvdHRvbSgpIH1cbiAgICB9KSlcblxuICAgIHRoaXMubG9hZEZlYXR1cmVkUGFja2FnZXMoKVxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICByZXR1cm4gZXRjaC5kZXN0cm95KHRoaXMpXG4gIH1cblxuICB1cGRhdGUgKCkge31cblxuICBmb2N1cyAoKSB7XG4gICAgdGhpcy5yZWZzLnNlYXJjaEVkaXRvci5lbGVtZW50LmZvY3VzKClcbiAgfVxuXG4gIHNob3cgKCkge1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJydcbiAgfVxuXG4gIHJlbmRlciAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdwYW5lbHMtaXRlbScgdGFiSW5kZXg9Jy0xJz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NlY3Rpb24gcGFja2FnZXMnPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZWN0aW9uLWNvbnRhaW5lcic+XG4gICAgICAgICAgICA8aDEgcmVmPSdpbnN0YWxsSGVhZGluZycgY2xhc3NOYW1lPSdzZWN0aW9uLWhlYWRpbmcgaWNvbiBpY29uLXBsdXMnPkluc3RhbGwgUGFja2FnZXM8L2gxPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ndGV4dCBuYXRpdmUta2V5LWJpbmRpbmdzJyB0YWJJbmRleD0nLTEnPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J2ljb24gaWNvbi1xdWVzdGlvbicgLz5cbiAgICAgICAgICAgICAgPHNwYW4gcmVmPSdwdWJsaXNoZWRUb1RleHQnPlBhY2thZ2VzIGFyZSBwdWJsaXNoZWQgdG8gPC9zcGFuPlxuICAgICAgICAgICAgICA8YSBjbGFzc05hbWU9J2xpbmsnIG9uY2xpY2s9e3RoaXMuZGlkQ2xpY2tPcGVuQXRvbUlvLmJpbmQodGhpcyl9PmF0b20uaW88L2E+XG4gICAgICAgICAgICAgIDxzcGFuPiBhbmQgYXJlIGluc3RhbGxlZCB0byB7cGF0aC5qb2luKHByb2Nlc3MuZW52LkFUT01fSE9NRSwgJ3BhY2thZ2VzJyl9PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZWFyY2gtY29udGFpbmVyIGNsZWFyZml4Jz5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2VkaXRvci1jb250YWluZXInPlxuICAgICAgICAgICAgICAgIDxUZXh0RWRpdG9yIG1pbmkgcmVmPSdzZWFyY2hFZGl0b3InIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nYnRuLWdyb3VwJz5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHJlZj0nc2VhcmNoUGFja2FnZXNCdXR0b24nIGNsYXNzTmFtZT0nYnRuIGJ0bi1kZWZhdWx0IHNlbGVjdGVkJyBvbmNsaWNrPXt0aGlzLmRpZENsaWNrU2VhcmNoUGFja2FnZXNCdXR0b24uYmluZCh0aGlzKX0+UGFja2FnZXM8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHJlZj0nc2VhcmNoVGhlbWVzQnV0dG9uJyBjbGFzc05hbWU9J2J0biBidG4tZGVmYXVsdCcgb25jbGljaz17dGhpcy5kaWRDbGlja1NlYXJjaFRoZW1lc0J1dHRvbi5iaW5kKHRoaXMpfT5UaGVtZXM8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiByZWY9J3NlYXJjaEVycm9ycycgLz5cbiAgICAgICAgICAgIDxkaXYgcmVmPSdzZWFyY2hNZXNzYWdlJyBjbGFzc05hbWU9J2FsZXJ0IGFsZXJ0LWluZm8gc2VhcmNoLW1lc3NhZ2UgaWNvbiBpY29uLXNlYXJjaCcgLz5cbiAgICAgICAgICAgIDxkaXYgcmVmPSdyZXN1bHRzQ29udGFpbmVyJyBjbGFzc05hbWU9J2NvbnRhaW5lciBwYWNrYWdlLWNvbnRhaW5lcicgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NlY3Rpb24gcGFja2FnZXMnPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZWN0aW9uLWNvbnRhaW5lcic+XG4gICAgICAgICAgICA8ZGl2IHJlZj0nZmVhdHVyZWRIZWFkaW5nJyBjbGFzc05hbWU9J3NlY3Rpb24taGVhZGluZyBpY29uIGljb24tc3RhcicgLz5cbiAgICAgICAgICAgIDxkaXYgcmVmPSdmZWF0dXJlZEVycm9ycycgLz5cbiAgICAgICAgICAgIDxkaXYgcmVmPSdsb2FkaW5nTWVzc2FnZScgY2xhc3NOYW1lPSdhbGVydCBhbGVydC1pbmZvIGljb24gaWNvbi1ob3VyZ2xhc3MnIC8+XG4gICAgICAgICAgICA8ZGl2IHJlZj0nZmVhdHVyZWRDb250YWluZXInIGNsYXNzTmFtZT0nY29udGFpbmVyIHBhY2thZ2UtY29udGFpbmVyJyAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIHNldFNlYXJjaFR5cGUgKHNlYXJjaFR5cGUpIHtcbiAgICBpZiAoc2VhcmNoVHlwZSA9PT0gJ3RoZW1lJykge1xuICAgICAgdGhpcy5zZWFyY2hUeXBlID0gJ3RoZW1lcydcbiAgICAgIHRoaXMucmVmcy5zZWFyY2hUaGVtZXNCdXR0b24uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICAgICAgdGhpcy5yZWZzLnNlYXJjaFBhY2thZ2VzQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJylcbiAgICAgIHRoaXMucmVmcy5zZWFyY2hFZGl0b3Iuc2V0UGxhY2Vob2xkZXJUZXh0KCdTZWFyY2ggdGhlbWVzJylcbiAgICAgIHRoaXMucmVmcy5wdWJsaXNoZWRUb1RleHQudGV4dENvbnRlbnQgPSAnVGhlbWVzIGFyZSBwdWJsaXNoZWQgdG8gJ1xuICAgICAgdGhpcy5hdG9tSW9VUkwgPSAnaHR0cHM6Ly9wdWxzYXItZWRpdC5kZXYvdGhlbWVzJ1xuICAgICAgdGhpcy5sb2FkRmVhdHVyZWRQYWNrYWdlcyh0cnVlKVxuICAgIH0gZWxzZSBpZiAoc2VhcmNoVHlwZSA9PT0gJ3BhY2thZ2UnKSB7XG4gICAgICB0aGlzLnNlYXJjaFR5cGUgPSAncGFja2FnZXMnXG4gICAgICB0aGlzLnJlZnMuc2VhcmNoUGFja2FnZXNCdXR0b24uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICAgICAgdGhpcy5yZWZzLnNlYXJjaFRoZW1lc0J1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG4gICAgICB0aGlzLnJlZnMuc2VhcmNoRWRpdG9yLnNldFBsYWNlaG9sZGVyVGV4dCgnU2VhcmNoIHBhY2thZ2VzJylcbiAgICAgIHRoaXMucmVmcy5wdWJsaXNoZWRUb1RleHQudGV4dENvbnRlbnQgPSAnUGFja2FnZXMgYXJlIHB1Ymxpc2hlZCB0byAnXG4gICAgICB0aGlzLmF0b21Jb1VSTCA9ICdodHRwczovL3B1bHNhci1lZGl0LmRldi9wYWNrYWdlcydcbiAgICAgIHRoaXMubG9hZEZlYXR1cmVkUGFja2FnZXMoKVxuICAgIH1cbiAgfVxuXG4gIGJlZm9yZVNob3cgKG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnVyaSkge1xuICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLmV4dHJhY3RRdWVyeUZyb21VUkkob3B0aW9ucy51cmkpXG4gICAgICBpZiAocXVlcnkgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCB7c2VhcmNoVHlwZSwgcGFja2FnZU5hbWV9ID0gcXVlcnlcbiAgICAgICAgdGhpcy5zZXRTZWFyY2hUeXBlKHNlYXJjaFR5cGUpXG4gICAgICAgIHRoaXMucmVmcy5zZWFyY2hFZGl0b3Iuc2V0VGV4dChwYWNrYWdlTmFtZSlcbiAgICAgICAgdGhpcy5wZXJmb3JtU2VhcmNoKClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBleHRyYWN0UXVlcnlGcm9tVVJJICh1cmkpIHtcbiAgICBjb25zdCBtYXRjaGVzID0gUGFja2FnZU5hbWVSZWdleC5leGVjKHVyaSlcbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgY29uc3QgWywgc2VhcmNoVHlwZSwgcGFja2FnZU5hbWVdID0gQXJyYXkuZnJvbShtYXRjaGVzKVxuICAgICAgcmV0dXJuIHtzZWFyY2hUeXBlLCBwYWNrYWdlTmFtZX1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICBwZXJmb3JtU2VhcmNoICgpIHtcbiAgICBjb25zdCBxdWVyeSA9IHRoaXMucmVmcy5zZWFyY2hFZGl0b3IuZ2V0VGV4dCgpLnRyaW0oKS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKHF1ZXJ5KSB7XG4gICAgICB0aGlzLnBlcmZvcm1TZWFyY2hGb3JRdWVyeShxdWVyeSlcbiAgICB9XG4gIH1cblxuICBwZXJmb3JtU2VhcmNoRm9yUXVlcnkgKHF1ZXJ5KSB7XG4gICAgY29uc3QgZ2l0VXJsSW5mbyA9IGhvc3RlZEdpdEluZm8uZnJvbVVybChxdWVyeSlcbiAgICBpZiAoZ2l0VXJsSW5mbykge1xuICAgICAgY29uc3QgdHlwZSA9IGdpdFVybEluZm8uZGVmYXVsdFxuICAgICAgaWYgKHR5cGUgPT09ICdzc2h1cmwnIHx8IHR5cGUgPT09ICdodHRwcycgfHwgdHlwZSA9PT0gJ3Nob3J0Y3V0Jykge1xuICAgICAgICB0aGlzLnNob3dHaXRJbnN0YWxsUGFja2FnZUNhcmQoe25hbWU6IHF1ZXJ5LCBnaXRVcmxJbmZvfSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZWFyY2gocXVlcnkpXG4gICAgfVxuICB9XG5cbiAgc2hvd0dpdEluc3RhbGxQYWNrYWdlQ2FyZCAocGFjaykge1xuICAgIGlmICh0aGlzLmN1cnJlbnRHaXRQYWNrYWdlQ2FyZCkge1xuICAgICAgdGhpcy5jdXJyZW50R2l0UGFja2FnZUNhcmQuZGVzdHJveSgpXG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50R2l0UGFja2FnZUNhcmQgPSB0aGlzLmdldFBhY2thZ2VDYXJkVmlldyhwYWNrKVxuICAgIHRoaXMuY3VycmVudEdpdFBhY2thZ2VDYXJkLmRpc3BsYXlHaXRQYWNrYWdlSW5zdGFsbEluZm9ybWF0aW9uKClcbiAgICB0aGlzLnJlcGxhY2VDdXJyZW50R2l0UGFja2FnZUNhcmRWaWV3KClcbiAgfVxuXG4gIHVwZGF0ZUdpdFBhY2thZ2VDYXJkIChwYWNrKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudEdpdFBhY2thZ2VDYXJkKSB7XG4gICAgICB0aGlzLmN1cnJlbnRHaXRQYWNrYWdlQ2FyZC5kZXN0cm95KClcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRHaXRQYWNrYWdlQ2FyZCA9IHRoaXMuZ2V0UGFja2FnZUNhcmRWaWV3KHBhY2spXG4gICAgdGhpcy5yZXBsYWNlQ3VycmVudEdpdFBhY2thZ2VDYXJkVmlldygpXG4gIH1cblxuICByZXBsYWNlQ3VycmVudEdpdFBhY2thZ2VDYXJkVmlldyAoKSB7XG4gICAgdGhpcy5yZWZzLnJlc3VsdHNDb250YWluZXIuaW5uZXJIVE1MID0gJydcbiAgICB0aGlzLmFkZFBhY2thZ2VDYXJkVmlldyh0aGlzLnJlZnMucmVzdWx0c0NvbnRhaW5lciwgdGhpcy5jdXJyZW50R2l0UGFja2FnZUNhcmQpXG4gIH1cblxuICBhc3luYyBzZWFyY2ggKHF1ZXJ5KSB7XG4gICAgdGhpcy5yZWZzLnJlc3VsdHNDb250YWluZXIuaW5uZXJIVE1MID0gJydcbiAgICB0aGlzLnJlZnMuc2VhcmNoTWVzc2FnZS50ZXh0Q29udGVudCA9IGBTZWFyY2hpbmcgJHt0aGlzLnNlYXJjaFR5cGV9IGZvciBcXHUyMDFDJHtxdWVyeX1cXHUyMDFEXFx1MjAyNmBcbiAgICB0aGlzLnJlZnMuc2VhcmNoTWVzc2FnZS5zdHlsZS5kaXNwbGF5ID0gJydcblxuICAgIGNvbnN0IG9wdGlvbnMgPSB7fVxuICAgIG9wdGlvbnNbdGhpcy5zZWFyY2hUeXBlXSA9IHRydWVcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYWNrYWdlcyA9IChhd2FpdCB0aGlzLmNsaWVudC5zZWFyY2gocXVlcnksIG9wdGlvbnMpKSB8fCBbXVxuICAgICAgdGhpcy5yZWZzLnJlc3VsdHNDb250YWluZXIuaW5uZXJIVE1MID0gJydcbiAgICAgIHRoaXMucmVmcy5zZWFyY2hNZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICAgIGlmIChwYWNrYWdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5yZWZzLnNlYXJjaE1lc3NhZ2UudGV4dENvbnRlbnQgPSBgTm8gJHt0aGlzLnNlYXJjaFR5cGUucmVwbGFjZSgvcyQvLCAnJyl9IHJlc3VsdHMgZm9yIFxcdTIwMUMke3F1ZXJ5fVxcdTIwMURgXG4gICAgICAgIHRoaXMucmVmcy5zZWFyY2hNZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnJ1xuICAgICAgfVxuXG4gICAgICB0aGlzLmFkZFBhY2thZ2VWaWV3cyh0aGlzLnJlZnMucmVzdWx0c0NvbnRhaW5lciwgcGFja2FnZXMpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMucmVmcy5zZWFyY2hNZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICAgIHRoaXMucmVmcy5zZWFyY2hFcnJvcnMuYXBwZW5kQ2hpbGQobmV3IEVycm9yVmlldyh0aGlzLnBhY2thZ2VNYW5hZ2VyLCBlcnJvcikuZWxlbWVudClcbiAgICB9XG4gIH1cblxuICBhZGRQYWNrYWdlVmlld3MgKGNvbnRhaW5lciwgcGFja2FnZXMpIHtcbiAgICBmb3IgKGNvbnN0IHBhY2sgb2YgcGFja2FnZXMpIHtcbiAgICAgIHRoaXMuYWRkUGFja2FnZUNhcmRWaWV3KGNvbnRhaW5lciwgdGhpcy5nZXRQYWNrYWdlQ2FyZFZpZXcocGFjaykpXG4gICAgfVxuICB9XG5cbiAgYWRkUGFja2FnZUNhcmRWaWV3IChjb250YWluZXIsIHBhY2thZ2VDYXJkKSB7XG4gICAgY29uc3QgcGFja2FnZVJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgcGFja2FnZVJvdy5jbGFzc0xpc3QuYWRkKCdyb3cnKVxuICAgIHBhY2thZ2VSb3cuYXBwZW5kQ2hpbGQocGFja2FnZUNhcmQuZWxlbWVudClcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocGFja2FnZVJvdylcbiAgfVxuXG4gIGdldFBhY2thZ2VDYXJkVmlldyAocGFjaykge1xuICAgIHJldHVybiBuZXcgUGFja2FnZUNhcmQocGFjaywgdGhpcy5zZXR0aW5nc1ZpZXcsIHRoaXMucGFja2FnZU1hbmFnZXIsIHtiYWNrOiAnSW5zdGFsbCd9KVxuICB9XG5cbiAgZmlsdGVyUGFja2FnZXMgKHBhY2thZ2VzLCB0aGVtZXMpIHtcbiAgICByZXR1cm4gcGFja2FnZXMuZmlsdGVyKCh7dGhlbWV9KSA9PiB0aGVtZXMgPyB0aGVtZSA6ICF0aGVtZSlcbiAgfVxuXG4gIC8vIExvYWQgYW5kIGRpc3BsYXkgdGhlIGZlYXR1cmVkIHBhY2thZ2VzIHRoYXQgYXJlIGF2YWlsYWJsZSB0byBpbnN0YWxsLlxuICBsb2FkRmVhdHVyZWRQYWNrYWdlcyAobG9hZFRoZW1lcykge1xuICAgIGlmIChsb2FkVGhlbWVzID09IG51bGwpIHtcbiAgICAgIGxvYWRUaGVtZXMgPSBmYWxzZVxuICAgIH1cbiAgICB0aGlzLnJlZnMuZmVhdHVyZWRDb250YWluZXIuaW5uZXJIVE1MID0gJydcblxuICAgIGlmIChsb2FkVGhlbWVzKSB7XG4gICAgICB0aGlzLnJlZnMuaW5zdGFsbEhlYWRpbmcudGV4dENvbnRlbnQgPSAnSW5zdGFsbCBUaGVtZXMnXG4gICAgICB0aGlzLnJlZnMuZmVhdHVyZWRIZWFkaW5nLnRleHRDb250ZW50ID0gJ0ZlYXR1cmVkIFRoZW1lcydcbiAgICAgIHRoaXMucmVmcy5sb2FkaW5nTWVzc2FnZS50ZXh0Q29udGVudCA9ICdMb2FkaW5nIGZlYXR1cmVkIHRoZW1lc1xcdTIwMjYnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVmcy5pbnN0YWxsSGVhZGluZy50ZXh0Q29udGVudCA9ICdJbnN0YWxsIFBhY2thZ2VzJ1xuICAgICAgdGhpcy5yZWZzLmZlYXR1cmVkSGVhZGluZy50ZXh0Q29udGVudCA9ICdGZWF0dXJlZCBQYWNrYWdlcydcbiAgICAgIHRoaXMucmVmcy5sb2FkaW5nTWVzc2FnZS50ZXh0Q29udGVudCA9ICdMb2FkaW5nIGZlYXR1cmVkIHBhY2thZ2VzXFx1MjAyNidcbiAgICB9XG5cbiAgICB0aGlzLnJlZnMubG9hZGluZ01lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICcnXG5cbiAgICBjb25zdCBoYW5kbGUgPSBlcnJvciA9PiB7XG4gICAgICB0aGlzLnJlZnMubG9hZGluZ01lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgICAgdGhpcy5yZWZzLmZlYXR1cmVkRXJyb3JzLmFwcGVuZENoaWxkKG5ldyBFcnJvclZpZXcodGhpcy5wYWNrYWdlTWFuYWdlciwgZXJyb3IpLmVsZW1lbnQpXG4gICAgfVxuXG4gICAgaWYgKGxvYWRUaGVtZXMpIHtcbiAgICAgIHRoaXMuY2xpZW50LmZlYXR1cmVkVGhlbWVzKChlcnJvciwgdGhlbWVzKSA9PiB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIGhhbmRsZShlcnJvcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlZnMubG9hZGluZ01lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgICAgICAgIHRoaXMucmVmcy5mZWF0dXJlZEhlYWRpbmcudGV4dENvbnRlbnQgPSAnRmVhdHVyZWQgVGhlbWVzJ1xuICAgICAgICAgIHRoaXMuYWRkUGFja2FnZVZpZXdzKHRoaXMucmVmcy5mZWF0dXJlZENvbnRhaW5lciwgdGhlbWVzKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsaWVudC5mZWF0dXJlZFBhY2thZ2VzKChlcnJvciwgcGFja2FnZXMpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgaGFuZGxlKGVycm9yKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucmVmcy5sb2FkaW5nTWVzc2FnZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgICAgdGhpcy5yZWZzLmZlYXR1cmVkSGVhZGluZy50ZXh0Q29udGVudCA9ICdGZWF0dXJlZCBQYWNrYWdlcydcbiAgICAgICAgICB0aGlzLmFkZFBhY2thZ2VWaWV3cyh0aGlzLnJlZnMuZmVhdHVyZWRDb250YWluZXIsIHBhY2thZ2VzKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGRpZENsaWNrT3BlbkF0b21JbyAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZWxlY3Ryb24uc2hlbGwub3BlbkV4dGVybmFsKHRoaXMuYXRvbUlvVVJMKVxuICB9XG5cbiAgZGlkQ2xpY2tTZWFyY2hQYWNrYWdlc0J1dHRvbiAoKSB7XG4gICAgaWYgKCF0aGlzLnJlZnMuc2VhcmNoUGFja2FnZXNCdXR0b24uY2xhc3NMaXN0LmNvbnRhaW5zKCdzZWxlY3RlZCcpKSB7XG4gICAgICB0aGlzLnNldFNlYXJjaFR5cGUoJ3BhY2thZ2UnKVxuICAgIH1cblxuICAgIHRoaXMucGVyZm9ybVNlYXJjaCgpXG4gIH1cblxuICBkaWRDbGlja1NlYXJjaFRoZW1lc0J1dHRvbiAoKSB7XG4gICAgaWYgKCF0aGlzLnJlZnMuc2VhcmNoVGhlbWVzQnV0dG9uLmNsYXNzTGlzdC5jb250YWlucygnc2VsZWN0ZWQnKSkge1xuICAgICAgdGhpcy5zZXRTZWFyY2hUeXBlKCd0aGVtZScpXG4gICAgfVxuXG4gICAgdGhpcy5wZXJmb3JtU2VhcmNoKClcbiAgfVxuXG4gIHNjcm9sbFVwICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wIC09IGRvY3VtZW50LmJvZHkub2Zmc2V0SGVpZ2h0IC8gMjBcbiAgfVxuXG4gIHNjcm9sbERvd24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgKz0gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQgLyAyMFxuICB9XG5cbiAgcGFnZVVwICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wIC09IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgfVxuXG4gIHBhZ2VEb3duICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wICs9IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgfVxuXG4gIHNjcm9sbFRvVG9wICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wID0gMFxuICB9XG5cbiAgc2Nyb2xsVG9Cb3R0b20gKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLmVsZW1lbnQuc2Nyb2xsSGVpZ2h0XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFBb0M7QUFYcEM7QUFDQTs7QUFZQSxNQUFNQSxnQkFBZ0IsR0FBRyxpREFBaUQ7QUFFM0QsTUFBTUMsWUFBWSxDQUFDO0VBQ2hDQyxXQUFXLENBQUVDLFlBQVksRUFBRUMsY0FBYyxFQUFFO0lBQ3pDLElBQUksQ0FBQ0QsWUFBWSxHQUFHQSxZQUFZO0lBQ2hDLElBQUksQ0FBQ0MsY0FBYyxHQUFHQSxjQUFjO0lBQ3BDLElBQUksQ0FBQ0MsV0FBVyxHQUFHLElBQUlDLHlCQUFtQixFQUFFO0lBQzVDLElBQUksQ0FBQ0MsTUFBTSxHQUFHLElBQUksQ0FBQ0gsY0FBYyxDQUFDSSxTQUFTLEVBQUU7SUFDN0MsSUFBSSxDQUFDQyxTQUFTLEdBQUcsa0NBQWtDO0lBRW5EQyxhQUFJLENBQUNDLFVBQVUsQ0FBQyxJQUFJLENBQUM7SUFFckIsSUFBSSxDQUFDQyxJQUFJLENBQUNDLGFBQWEsQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLEdBQUcsTUFBTTtJQUU5QyxJQUFJLENBQUNILElBQUksQ0FBQ0ksWUFBWSxDQUFDQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQztJQUM1RCxJQUFJLENBQUNDLFVBQVUsR0FBRyxVQUFVO0lBQzVCLElBQUksQ0FBQ2IsV0FBVyxDQUFDYyxHQUFHLENBQ2xCLElBQUksQ0FBQ2YsY0FBYyxDQUFDZ0IsRUFBRSxDQUFDLHdCQUF3QixFQUFFLENBQUM7TUFBQ0MsSUFBSTtNQUFFQztJQUFLLENBQUMsS0FBSztNQUNsRSxJQUFJLENBQUNWLElBQUksQ0FBQ1csWUFBWSxDQUFDQyxXQUFXLENBQUMsSUFBSUMsa0JBQVMsQ0FBQyxJQUFJLENBQUNyQixjQUFjLEVBQUVrQixLQUFLLENBQUMsQ0FBQ0ksT0FBTyxDQUFDO0lBQ3ZGLENBQUMsQ0FBQyxDQUNIO0lBQ0QsSUFBSSxDQUFDckIsV0FBVyxDQUFDYyxHQUFHLENBQ2xCLElBQUksQ0FBQ2YsY0FBYyxDQUFDZ0IsRUFBRSxDQUFDLG1DQUFtQyxFQUFFLENBQUM7TUFBQ0M7SUFBSSxDQUFDLEtBQUs7TUFDdEUsTUFBTU0sVUFBVSxHQUNiLElBQUksQ0FBQ0MscUJBQXFCLElBQUksSUFBSSxDQUFDQSxxQkFBcUIsQ0FBQ1AsSUFBSSxJQUFJLElBQUksQ0FBQ08scUJBQXFCLENBQUNQLElBQUksQ0FBQ00sVUFBVSxHQUMxRyxJQUFJLENBQUNDLHFCQUFxQixDQUFDUCxJQUFJLENBQUNNLFVBQVUsR0FDMUMsSUFBSTtNQUVSLElBQUlBLFVBQVUsSUFBSUEsVUFBVSxLQUFLTixJQUFJLENBQUNNLFVBQVUsRUFBRTtRQUNoRCxJQUFJLENBQUNFLG9CQUFvQixDQUFDUixJQUFJLENBQUM7TUFDakM7SUFDRixDQUFDLENBQUMsQ0FDSDtJQUNELElBQUksQ0FBQ2hCLFdBQVcsQ0FBQ2MsR0FBRyxDQUNsQixJQUFJLENBQUNQLElBQUksQ0FBQ0ksWUFBWSxDQUFDYyxpQkFBaUIsQ0FBQyxNQUFNO01BQzdDLElBQUksQ0FBQ0MsYUFBYSxFQUFFO0lBQ3RCLENBQUMsQ0FBQyxDQUNIO0lBQ0QsSUFBSSxDQUFDMUIsV0FBVyxDQUFDYyxHQUFHLENBQUNhLElBQUksQ0FBQ0MsUUFBUSxDQUFDZCxHQUFHLENBQUMsSUFBSSxDQUFDTyxPQUFPLEVBQUU7TUFDbkQsY0FBYyxFQUFFLE1BQU07UUFBRSxJQUFJLENBQUNRLFFBQVEsRUFBRTtNQUFDLENBQUM7TUFDekMsZ0JBQWdCLEVBQUUsTUFBTTtRQUFFLElBQUksQ0FBQ0MsVUFBVSxFQUFFO01BQUMsQ0FBQztNQUM3QyxjQUFjLEVBQUUsTUFBTTtRQUFFLElBQUksQ0FBQ0MsTUFBTSxFQUFFO01BQUMsQ0FBQztNQUN2QyxnQkFBZ0IsRUFBRSxNQUFNO1FBQUUsSUFBSSxDQUFDQyxRQUFRLEVBQUU7TUFBQyxDQUFDO01BQzNDLGtCQUFrQixFQUFFLE1BQU07UUFBRSxJQUFJLENBQUNDLFdBQVcsRUFBRTtNQUFDLENBQUM7TUFDaEQscUJBQXFCLEVBQUUsTUFBTTtRQUFFLElBQUksQ0FBQ0MsY0FBYyxFQUFFO01BQUM7SUFDdkQsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUNDLG9CQUFvQixFQUFFO0VBQzdCO0VBRUFDLE9BQU8sR0FBSTtJQUNULElBQUksQ0FBQ3BDLFdBQVcsQ0FBQ3FDLE9BQU8sRUFBRTtJQUMxQixPQUFPaEMsYUFBSSxDQUFDK0IsT0FBTyxDQUFDLElBQUksQ0FBQztFQUMzQjtFQUVBRSxNQUFNLEdBQUksQ0FBQztFQUVYQyxLQUFLLEdBQUk7SUFDUCxJQUFJLENBQUNoQyxJQUFJLENBQUNJLFlBQVksQ0FBQ1UsT0FBTyxDQUFDa0IsS0FBSyxFQUFFO0VBQ3hDO0VBRUFDLElBQUksR0FBSTtJQUNOLElBQUksQ0FBQ25CLE9BQU8sQ0FBQ1osS0FBSyxDQUFDQyxPQUFPLEdBQUcsRUFBRTtFQUNqQztFQUVBK0IsTUFBTSxHQUFJO0lBQ1IsT0FDRTtNQUFLLFNBQVMsRUFBQyxhQUFhO01BQUMsUUFBUSxFQUFDO0lBQUksR0FDeEM7TUFBSyxTQUFTLEVBQUM7SUFBa0IsR0FDL0I7TUFBSyxTQUFTLEVBQUM7SUFBbUIsR0FDaEM7TUFBSSxHQUFHLEVBQUMsZ0JBQWdCO01BQUMsU0FBUyxFQUFDO0lBQWdDLHNCQUFzQixFQUV6RjtNQUFLLFNBQVMsRUFBQywwQkFBMEI7TUFBQyxRQUFRLEVBQUM7SUFBSSxHQUNyRDtNQUFNLFNBQVMsRUFBQztJQUFvQixFQUFHLEVBQ3ZDO01BQU0sR0FBRyxFQUFDO0lBQWlCLGdDQUFrQyxFQUM3RDtNQUFHLFNBQVMsRUFBQyxNQUFNO01BQUMsT0FBTyxFQUFFLElBQUksQ0FBQ0Msa0JBQWtCLENBQUNDLElBQUksQ0FBQyxJQUFJO0lBQUUsYUFBWSxFQUM1RSwwREFBNkJDLGFBQUksQ0FBQ0MsSUFBSSxDQUFDQyxPQUFPLENBQUNDLEdBQUcsQ0FBQ0MsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFRLENBQzdFLEVBRU47TUFBSyxTQUFTLEVBQUM7SUFBMkIsR0FDeEM7TUFBSyxTQUFTLEVBQUM7SUFBa0IsR0FDL0Isa0JBQUMsZ0JBQVU7TUFBQyxJQUFJO01BQUMsR0FBRyxFQUFDO0lBQWMsRUFBRyxDQUNsQyxFQUNOO01BQUssU0FBUyxFQUFDO0lBQVcsR0FDeEI7TUFBUSxHQUFHLEVBQUMsc0JBQXNCO01BQUMsU0FBUyxFQUFDLDBCQUEwQjtNQUFDLE9BQU8sRUFBRSxJQUFJLENBQUNDLDRCQUE0QixDQUFDTixJQUFJLENBQUMsSUFBSTtJQUFFLGNBQWtCLEVBQ2hKO01BQVEsR0FBRyxFQUFDLG9CQUFvQjtNQUFDLFNBQVMsRUFBQyxpQkFBaUI7TUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDTywwQkFBMEIsQ0FBQ1AsSUFBSSxDQUFDLElBQUk7SUFBRSxZQUFnQixDQUM3SCxDQUNGLEVBRU47TUFBSyxHQUFHLEVBQUM7SUFBYyxFQUFHLEVBQzFCO01BQUssR0FBRyxFQUFDLGVBQWU7TUFBQyxTQUFTLEVBQUM7SUFBa0QsRUFBRyxFQUN4RjtNQUFLLEdBQUcsRUFBQyxrQkFBa0I7TUFBQyxTQUFTLEVBQUM7SUFBNkIsRUFBRyxDQUNsRSxDQUNGLEVBRU47TUFBSyxTQUFTLEVBQUM7SUFBa0IsR0FDL0I7TUFBSyxTQUFTLEVBQUM7SUFBbUIsR0FDaEM7TUFBSyxHQUFHLEVBQUMsaUJBQWlCO01BQUMsU0FBUyxFQUFDO0lBQWdDLEVBQUcsRUFDeEU7TUFBSyxHQUFHLEVBQUM7SUFBZ0IsRUFBRyxFQUM1QjtNQUFLLEdBQUcsRUFBQyxnQkFBZ0I7TUFBQyxTQUFTLEVBQUM7SUFBc0MsRUFBRyxFQUM3RTtNQUFLLEdBQUcsRUFBQyxtQkFBbUI7TUFBQyxTQUFTLEVBQUM7SUFBNkIsRUFBRyxDQUNuRSxDQUNGLENBQ0Y7RUFFVjtFQUVBUSxhQUFhLENBQUV0QyxVQUFVLEVBQUU7SUFDekIsSUFBSUEsVUFBVSxLQUFLLE9BQU8sRUFBRTtNQUMxQixJQUFJLENBQUNBLFVBQVUsR0FBRyxRQUFRO01BQzFCLElBQUksQ0FBQ04sSUFBSSxDQUFDNkMsa0JBQWtCLENBQUNDLFNBQVMsQ0FBQ3ZDLEdBQUcsQ0FBQyxVQUFVLENBQUM7TUFDdEQsSUFBSSxDQUFDUCxJQUFJLENBQUMrQyxvQkFBb0IsQ0FBQ0QsU0FBUyxDQUFDRSxNQUFNLENBQUMsVUFBVSxDQUFDO01BQzNELElBQUksQ0FBQ2hELElBQUksQ0FBQ0ksWUFBWSxDQUFDQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUM7TUFDMUQsSUFBSSxDQUFDTCxJQUFJLENBQUNpRCxlQUFlLENBQUNDLFdBQVcsR0FBRywwQkFBMEI7TUFDbEUsSUFBSSxDQUFDckQsU0FBUyxHQUFHLGdDQUFnQztNQUNqRCxJQUFJLENBQUMrQixvQkFBb0IsQ0FBQyxJQUFJLENBQUM7SUFDakMsQ0FBQyxNQUFNLElBQUl0QixVQUFVLEtBQUssU0FBUyxFQUFFO01BQ25DLElBQUksQ0FBQ0EsVUFBVSxHQUFHLFVBQVU7TUFDNUIsSUFBSSxDQUFDTixJQUFJLENBQUMrQyxvQkFBb0IsQ0FBQ0QsU0FBUyxDQUFDdkMsR0FBRyxDQUFDLFVBQVUsQ0FBQztNQUN4RCxJQUFJLENBQUNQLElBQUksQ0FBQzZDLGtCQUFrQixDQUFDQyxTQUFTLENBQUNFLE1BQU0sQ0FBQyxVQUFVLENBQUM7TUFDekQsSUFBSSxDQUFDaEQsSUFBSSxDQUFDSSxZQUFZLENBQUNDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDO01BQzVELElBQUksQ0FBQ0wsSUFBSSxDQUFDaUQsZUFBZSxDQUFDQyxXQUFXLEdBQUcsNEJBQTRCO01BQ3BFLElBQUksQ0FBQ3JELFNBQVMsR0FBRyxrQ0FBa0M7TUFDbkQsSUFBSSxDQUFDK0Isb0JBQW9CLEVBQUU7SUFDN0I7RUFDRjtFQUVBdUIsVUFBVSxDQUFFQyxPQUFPLEVBQUU7SUFDbkIsSUFBSUEsT0FBTyxJQUFJQSxPQUFPLENBQUNDLEdBQUcsRUFBRTtNQUMxQixNQUFNQyxLQUFLLEdBQUcsSUFBSSxDQUFDQyxtQkFBbUIsQ0FBQ0gsT0FBTyxDQUFDQyxHQUFHLENBQUM7TUFDbkQsSUFBSUMsS0FBSyxJQUFJLElBQUksRUFBRTtRQUNqQixNQUFNO1VBQUNoRCxVQUFVO1VBQUVrRDtRQUFXLENBQUMsR0FBR0YsS0FBSztRQUN2QyxJQUFJLENBQUNWLGFBQWEsQ0FBQ3RDLFVBQVUsQ0FBQztRQUM5QixJQUFJLENBQUNOLElBQUksQ0FBQ0ksWUFBWSxDQUFDcUQsT0FBTyxDQUFDRCxXQUFXLENBQUM7UUFDM0MsSUFBSSxDQUFDckMsYUFBYSxFQUFFO01BQ3RCO0lBQ0Y7RUFDRjtFQUVBb0MsbUJBQW1CLENBQUVGLEdBQUcsRUFBRTtJQUN4QixNQUFNSyxPQUFPLEdBQUd0RSxnQkFBZ0IsQ0FBQ3VFLElBQUksQ0FBQ04sR0FBRyxDQUFDO0lBQzFDLElBQUlLLE9BQU8sRUFBRTtNQUNYLE1BQU0sR0FBR3BELFVBQVUsRUFBRWtELFdBQVcsQ0FBQyxHQUFHSSxLQUFLLENBQUNDLElBQUksQ0FBQ0gsT0FBTyxDQUFDO01BQ3ZELE9BQU87UUFBQ3BELFVBQVU7UUFBRWtEO01BQVcsQ0FBQztJQUNsQyxDQUFDLE1BQU07TUFDTCxPQUFPLElBQUk7SUFDYjtFQUNGO0VBRUFyQyxhQUFhLEdBQUk7SUFDZixNQUFNbUMsS0FBSyxHQUFHLElBQUksQ0FBQ3RELElBQUksQ0FBQ0ksWUFBWSxDQUFDMEQsT0FBTyxFQUFFLENBQUNDLElBQUksRUFBRSxDQUFDQyxXQUFXLEVBQUU7SUFDbkUsSUFBSVYsS0FBSyxFQUFFO01BQ1QsSUFBSSxDQUFDVyxxQkFBcUIsQ0FBQ1gsS0FBSyxDQUFDO0lBQ25DO0VBQ0Y7RUFFQVcscUJBQXFCLENBQUVYLEtBQUssRUFBRTtJQUM1QixNQUFNdkMsVUFBVSxHQUFHbUQsc0JBQWEsQ0FBQ0MsT0FBTyxDQUFDYixLQUFLLENBQUM7SUFDL0MsSUFBSXZDLFVBQVUsRUFBRTtNQUNkLE1BQU1xRCxJQUFJLEdBQUdyRCxVQUFVLENBQUNzRCxPQUFPO01BQy9CLElBQUlELElBQUksS0FBSyxRQUFRLElBQUlBLElBQUksS0FBSyxPQUFPLElBQUlBLElBQUksS0FBSyxVQUFVLEVBQUU7UUFDaEUsSUFBSSxDQUFDRSx5QkFBeUIsQ0FBQztVQUFDQyxJQUFJLEVBQUVqQixLQUFLO1VBQUV2QztRQUFVLENBQUMsQ0FBQztNQUMzRDtJQUNGLENBQUMsTUFBTTtNQUNMLElBQUksQ0FBQ3lELE1BQU0sQ0FBQ2xCLEtBQUssQ0FBQztJQUNwQjtFQUNGO0VBRUFnQix5QkFBeUIsQ0FBRTdELElBQUksRUFBRTtJQUMvQixJQUFJLElBQUksQ0FBQ08scUJBQXFCLEVBQUU7TUFDOUIsSUFBSSxDQUFDQSxxQkFBcUIsQ0FBQ2EsT0FBTyxFQUFFO0lBQ3RDO0lBRUEsSUFBSSxDQUFDYixxQkFBcUIsR0FBRyxJQUFJLENBQUN5RCxrQkFBa0IsQ0FBQ2hFLElBQUksQ0FBQztJQUMxRCxJQUFJLENBQUNPLHFCQUFxQixDQUFDMEQsbUNBQW1DLEVBQUU7SUFDaEUsSUFBSSxDQUFDQyxnQ0FBZ0MsRUFBRTtFQUN6QztFQUVBMUQsb0JBQW9CLENBQUVSLElBQUksRUFBRTtJQUMxQixJQUFJLElBQUksQ0FBQ08scUJBQXFCLEVBQUU7TUFDOUIsSUFBSSxDQUFDQSxxQkFBcUIsQ0FBQ2EsT0FBTyxFQUFFO0lBQ3RDO0lBRUEsSUFBSSxDQUFDYixxQkFBcUIsR0FBRyxJQUFJLENBQUN5RCxrQkFBa0IsQ0FBQ2hFLElBQUksQ0FBQztJQUMxRCxJQUFJLENBQUNrRSxnQ0FBZ0MsRUFBRTtFQUN6QztFQUVBQSxnQ0FBZ0MsR0FBSTtJQUNsQyxJQUFJLENBQUMzRSxJQUFJLENBQUM0RSxnQkFBZ0IsQ0FBQ0MsU0FBUyxHQUFHLEVBQUU7SUFDekMsSUFBSSxDQUFDQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM5RSxJQUFJLENBQUM0RSxnQkFBZ0IsRUFBRSxJQUFJLENBQUM1RCxxQkFBcUIsQ0FBQztFQUNqRjtFQUVBLE1BQU13RCxNQUFNLENBQUVsQixLQUFLLEVBQUU7SUFDbkIsSUFBSSxDQUFDdEQsSUFBSSxDQUFDNEUsZ0JBQWdCLENBQUNDLFNBQVMsR0FBRyxFQUFFO0lBQ3pDLElBQUksQ0FBQzdFLElBQUksQ0FBQ0MsYUFBYSxDQUFDaUQsV0FBVyxHQUFJLGFBQVksSUFBSSxDQUFDNUMsVUFBVyxjQUFhZ0QsS0FBTSxjQUFhO0lBQ25HLElBQUksQ0FBQ3RELElBQUksQ0FBQ0MsYUFBYSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sR0FBRyxFQUFFO0lBRTFDLE1BQU1pRCxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCQSxPQUFPLENBQUMsSUFBSSxDQUFDOUMsVUFBVSxDQUFDLEdBQUcsSUFBSTtJQUUvQixJQUFJO01BQ0YsTUFBTXlFLFFBQVEsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDcEYsTUFBTSxDQUFDNkUsTUFBTSxDQUFDbEIsS0FBSyxFQUFFRixPQUFPLENBQUMsS0FBSyxFQUFFO01BQ2pFLElBQUksQ0FBQ3BELElBQUksQ0FBQzRFLGdCQUFnQixDQUFDQyxTQUFTLEdBQUcsRUFBRTtNQUN6QyxJQUFJLENBQUM3RSxJQUFJLENBQUNDLGFBQWEsQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLEdBQUcsTUFBTTtNQUM5QyxJQUFJNEUsUUFBUSxDQUFDQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3pCLElBQUksQ0FBQ2hGLElBQUksQ0FBQ0MsYUFBYSxDQUFDaUQsV0FBVyxHQUFJLE1BQUssSUFBSSxDQUFDNUMsVUFBVSxDQUFDMkUsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUUsc0JBQXFCM0IsS0FBTSxRQUFPO1FBQ2hILElBQUksQ0FBQ3RELElBQUksQ0FBQ0MsYUFBYSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sR0FBRyxFQUFFO01BQzVDO01BRUEsSUFBSSxDQUFDK0UsZUFBZSxDQUFDLElBQUksQ0FBQ2xGLElBQUksQ0FBQzRFLGdCQUFnQixFQUFFRyxRQUFRLENBQUM7SUFDNUQsQ0FBQyxDQUFDLE9BQU9yRSxLQUFLLEVBQUU7TUFDZCxJQUFJLENBQUNWLElBQUksQ0FBQ0MsYUFBYSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sR0FBRyxNQUFNO01BQzlDLElBQUksQ0FBQ0gsSUFBSSxDQUFDVyxZQUFZLENBQUNDLFdBQVcsQ0FBQyxJQUFJQyxrQkFBUyxDQUFDLElBQUksQ0FBQ3JCLGNBQWMsRUFBRWtCLEtBQUssQ0FBQyxDQUFDSSxPQUFPLENBQUM7SUFDdkY7RUFDRjtFQUVBb0UsZUFBZSxDQUFFQyxTQUFTLEVBQUVKLFFBQVEsRUFBRTtJQUNwQyxLQUFLLE1BQU10RSxJQUFJLElBQUlzRSxRQUFRLEVBQUU7TUFDM0IsSUFBSSxDQUFDRCxrQkFBa0IsQ0FBQ0ssU0FBUyxFQUFFLElBQUksQ0FBQ1Ysa0JBQWtCLENBQUNoRSxJQUFJLENBQUMsQ0FBQztJQUNuRTtFQUNGO0VBRUFxRSxrQkFBa0IsQ0FBRUssU0FBUyxFQUFFQyxXQUFXLEVBQUU7SUFDMUMsTUFBTUMsVUFBVSxHQUFHQyxRQUFRLENBQUNDLGFBQWEsQ0FBQyxLQUFLLENBQUM7SUFDaERGLFVBQVUsQ0FBQ3ZDLFNBQVMsQ0FBQ3ZDLEdBQUcsQ0FBQyxLQUFLLENBQUM7SUFDL0I4RSxVQUFVLENBQUN6RSxXQUFXLENBQUN3RSxXQUFXLENBQUN0RSxPQUFPLENBQUM7SUFDM0NxRSxTQUFTLENBQUN2RSxXQUFXLENBQUN5RSxVQUFVLENBQUM7RUFDbkM7RUFFQVosa0JBQWtCLENBQUVoRSxJQUFJLEVBQUU7SUFDeEIsT0FBTyxJQUFJK0Usb0JBQVcsQ0FBQy9FLElBQUksRUFBRSxJQUFJLENBQUNsQixZQUFZLEVBQUUsSUFBSSxDQUFDQyxjQUFjLEVBQUU7TUFBQ2lHLElBQUksRUFBRTtJQUFTLENBQUMsQ0FBQztFQUN6RjtFQUVBQyxjQUFjLENBQUVYLFFBQVEsRUFBRVksTUFBTSxFQUFFO0lBQ2hDLE9BQU9aLFFBQVEsQ0FBQ2EsTUFBTSxDQUFDLENBQUM7TUFBQ0M7SUFBSyxDQUFDLEtBQUtGLE1BQU0sR0FBR0UsS0FBSyxHQUFHLENBQUNBLEtBQUssQ0FBQztFQUM5RDs7RUFFQTtFQUNBakUsb0JBQW9CLENBQUVrRSxVQUFVLEVBQUU7SUFDaEMsSUFBSUEsVUFBVSxJQUFJLElBQUksRUFBRTtNQUN0QkEsVUFBVSxHQUFHLEtBQUs7SUFDcEI7SUFDQSxJQUFJLENBQUM5RixJQUFJLENBQUMrRixpQkFBaUIsQ0FBQ2xCLFNBQVMsR0FBRyxFQUFFO0lBRTFDLElBQUlpQixVQUFVLEVBQUU7TUFDZCxJQUFJLENBQUM5RixJQUFJLENBQUNnRyxjQUFjLENBQUM5QyxXQUFXLEdBQUcsZ0JBQWdCO01BQ3ZELElBQUksQ0FBQ2xELElBQUksQ0FBQ2lHLGVBQWUsQ0FBQy9DLFdBQVcsR0FBRyxpQkFBaUI7TUFDekQsSUFBSSxDQUFDbEQsSUFBSSxDQUFDa0csY0FBYyxDQUFDaEQsV0FBVyxHQUFHLCtCQUErQjtJQUN4RSxDQUFDLE1BQU07TUFDTCxJQUFJLENBQUNsRCxJQUFJLENBQUNnRyxjQUFjLENBQUM5QyxXQUFXLEdBQUcsa0JBQWtCO01BQ3pELElBQUksQ0FBQ2xELElBQUksQ0FBQ2lHLGVBQWUsQ0FBQy9DLFdBQVcsR0FBRyxtQkFBbUI7TUFDM0QsSUFBSSxDQUFDbEQsSUFBSSxDQUFDa0csY0FBYyxDQUFDaEQsV0FBVyxHQUFHLGlDQUFpQztJQUMxRTtJQUVBLElBQUksQ0FBQ2xELElBQUksQ0FBQ2tHLGNBQWMsQ0FBQ2hHLEtBQUssQ0FBQ0MsT0FBTyxHQUFHLEVBQUU7SUFFM0MsTUFBTWdHLE1BQU0sR0FBR3pGLEtBQUssSUFBSTtNQUN0QixJQUFJLENBQUNWLElBQUksQ0FBQ2tHLGNBQWMsQ0FBQ2hHLEtBQUssQ0FBQ0MsT0FBTyxHQUFHLE1BQU07TUFDL0MsSUFBSSxDQUFDSCxJQUFJLENBQUNvRyxjQUFjLENBQUN4RixXQUFXLENBQUMsSUFBSUMsa0JBQVMsQ0FBQyxJQUFJLENBQUNyQixjQUFjLEVBQUVrQixLQUFLLENBQUMsQ0FBQ0ksT0FBTyxDQUFDO0lBQ3pGLENBQUM7SUFFRCxJQUFJZ0YsVUFBVSxFQUFFO01BQ2QsSUFBSSxDQUFDbkcsTUFBTSxDQUFDMEcsY0FBYyxDQUFDLENBQUMzRixLQUFLLEVBQUVpRixNQUFNLEtBQUs7UUFDNUMsSUFBSWpGLEtBQUssRUFBRTtVQUNUeUYsTUFBTSxDQUFDekYsS0FBSyxDQUFDO1FBQ2YsQ0FBQyxNQUFNO1VBQ0wsSUFBSSxDQUFDVixJQUFJLENBQUNrRyxjQUFjLENBQUNoRyxLQUFLLENBQUNDLE9BQU8sR0FBRyxNQUFNO1VBQy9DLElBQUksQ0FBQ0gsSUFBSSxDQUFDaUcsZUFBZSxDQUFDL0MsV0FBVyxHQUFHLGlCQUFpQjtVQUN6RCxJQUFJLENBQUNnQyxlQUFlLENBQUMsSUFBSSxDQUFDbEYsSUFBSSxDQUFDK0YsaUJBQWlCLEVBQUVKLE1BQU0sQ0FBQztRQUMzRDtNQUNGLENBQUMsQ0FBQztJQUNKLENBQUMsTUFBTTtNQUNMLElBQUksQ0FBQ2hHLE1BQU0sQ0FBQzJHLGdCQUFnQixDQUFDLENBQUM1RixLQUFLLEVBQUVxRSxRQUFRLEtBQUs7UUFDaEQsSUFBSXJFLEtBQUssRUFBRTtVQUNUeUYsTUFBTSxDQUFDekYsS0FBSyxDQUFDO1FBQ2YsQ0FBQyxNQUFNO1VBQ0wsSUFBSSxDQUFDVixJQUFJLENBQUNrRyxjQUFjLENBQUNoRyxLQUFLLENBQUNDLE9BQU8sR0FBRyxNQUFNO1VBQy9DLElBQUksQ0FBQ0gsSUFBSSxDQUFDaUcsZUFBZSxDQUFDL0MsV0FBVyxHQUFHLG1CQUFtQjtVQUMzRCxJQUFJLENBQUNnQyxlQUFlLENBQUMsSUFBSSxDQUFDbEYsSUFBSSxDQUFDK0YsaUJBQWlCLEVBQUVoQixRQUFRLENBQUM7UUFDN0Q7TUFDRixDQUFDLENBQUM7SUFDSjtFQUNGO0VBRUE1QyxrQkFBa0IsQ0FBRW9FLEtBQUssRUFBRTtJQUN6QkEsS0FBSyxDQUFDQyxjQUFjLEVBQUU7SUFDdEJDLGlCQUFRLENBQUNDLEtBQUssQ0FBQ0MsWUFBWSxDQUFDLElBQUksQ0FBQzlHLFNBQVMsQ0FBQztFQUM3QztFQUVBNkMsNEJBQTRCLEdBQUk7SUFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQzFDLElBQUksQ0FBQytDLG9CQUFvQixDQUFDRCxTQUFTLENBQUM4RCxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7TUFDbEUsSUFBSSxDQUFDaEUsYUFBYSxDQUFDLFNBQVMsQ0FBQztJQUMvQjtJQUVBLElBQUksQ0FBQ3pCLGFBQWEsRUFBRTtFQUN0QjtFQUVBd0IsMEJBQTBCLEdBQUk7SUFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQzNDLElBQUksQ0FBQzZDLGtCQUFrQixDQUFDQyxTQUFTLENBQUM4RCxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7TUFDaEUsSUFBSSxDQUFDaEUsYUFBYSxDQUFDLE9BQU8sQ0FBQztJQUM3QjtJQUVBLElBQUksQ0FBQ3pCLGFBQWEsRUFBRTtFQUN0QjtFQUVBRyxRQUFRLEdBQUk7SUFDVixJQUFJLENBQUNSLE9BQU8sQ0FBQytGLFNBQVMsSUFBSXZCLFFBQVEsQ0FBQ3dCLElBQUksQ0FBQ0MsWUFBWSxHQUFHLEVBQUU7RUFDM0Q7RUFFQXhGLFVBQVUsR0FBSTtJQUNaLElBQUksQ0FBQ1QsT0FBTyxDQUFDK0YsU0FBUyxJQUFJdkIsUUFBUSxDQUFDd0IsSUFBSSxDQUFDQyxZQUFZLEdBQUcsRUFBRTtFQUMzRDtFQUVBdkYsTUFBTSxHQUFJO0lBQ1IsSUFBSSxDQUFDVixPQUFPLENBQUMrRixTQUFTLElBQUksSUFBSSxDQUFDL0YsT0FBTyxDQUFDaUcsWUFBWTtFQUNyRDtFQUVBdEYsUUFBUSxHQUFJO0lBQ1YsSUFBSSxDQUFDWCxPQUFPLENBQUMrRixTQUFTLElBQUksSUFBSSxDQUFDL0YsT0FBTyxDQUFDaUcsWUFBWTtFQUNyRDtFQUVBckYsV0FBVyxHQUFJO0lBQ2IsSUFBSSxDQUFDWixPQUFPLENBQUMrRixTQUFTLEdBQUcsQ0FBQztFQUM1QjtFQUVBbEYsY0FBYyxHQUFJO0lBQ2hCLElBQUksQ0FBQ2IsT0FBTyxDQUFDK0YsU0FBUyxHQUFHLElBQUksQ0FBQy9GLE9BQU8sQ0FBQ2tHLFlBQVk7RUFDcEQ7QUFDRjtBQUFDO0FBQUEifQ==