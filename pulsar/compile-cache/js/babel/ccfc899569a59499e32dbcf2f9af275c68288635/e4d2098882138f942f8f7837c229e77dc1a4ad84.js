"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = _interopRequireDefault(require("path"));
var _url = _interopRequireDefault(require("url"));
var _underscorePlus = _interopRequireDefault(require("underscore-plus"));
var _fsPlus = _interopRequireDefault(require("fs-plus"));
var _electron = require("electron");
var _atom = require("atom");
var _etch = _interopRequireDefault(require("etch"));
var _packageCard = _interopRequireDefault(require("./package-card"));
var _packageGrammarsView = _interopRequireDefault(require("./package-grammars-view"));
var _packageKeymapView = _interopRequireDefault(require("./package-keymap-view"));
var _packageReadmeView = _interopRequireDefault(require("./package-readme-view"));
var _packageSnippetsView = _interopRequireDefault(require("./package-snippets-view"));
var _settingsPanel = _interopRequireDefault(require("./settings-panel"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */
/** @jsx etch.dom */

const NORMALIZE_PACKAGE_DATA_README_ERROR = 'ERROR: No README data found!';
class PackageDetailView {
  constructor(pack, settingsView, packageManager, snippetsProvider) {
    this.pack = pack;
    this.settingsView = settingsView;
    this.packageManager = packageManager;
    this.snippetsProvider = snippetsProvider;
    this.disposables = new _atom.CompositeDisposable();
    _etch.default.initialize(this);
    this.loadPackage();
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
    const packageRepoClickHandler = event => {
      event.preventDefault();
      const repoUrl = this.packageManager.getRepositoryUrl(this.pack);
      if (typeof repoUrl === 'string') {
        if (_url.default.parse(repoUrl).pathname === '/atom/atom') {
          _electron.shell.openExternal(`${repoUrl}/tree/master/packages/${this.pack.name}`);
        } else {
          _electron.shell.openExternal(repoUrl);
        }
      }
    };
    this.refs.packageRepo.addEventListener('click', packageRepoClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.packageRepo.removeEventListener('click', packageRepoClickHandler);
    }));
    const issueButtonClickHandler = event => {
      event.preventDefault();
      let bugUri = this.packageManager.getRepositoryBugUri(this.pack);
      if (bugUri) {
        _electron.shell.openExternal(bugUri);
      }
    };
    this.refs.issueButton.addEventListener('click', issueButtonClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.issueButton.removeEventListener('click', issueButtonClickHandler);
    }));
    const changelogButtonClickHandler = event => {
      event.preventDefault();
      if (this.changelogPath) {
        this.openMarkdownFile(this.changelogPath);
      }
    };
    this.refs.changelogButton.addEventListener('click', changelogButtonClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.changelogButton.removeEventListener('click', changelogButtonClickHandler);
    }));
    const licenseButtonClickHandler = event => {
      event.preventDefault();
      if (this.licensePath) {
        this.openMarkdownFile(this.licensePath);
      }
    };
    this.refs.licenseButton.addEventListener('click', licenseButtonClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.licenseButton.removeEventListener('click', licenseButtonClickHandler);
    }));
    const openButtonClickHandler = event => {
      event.preventDefault();
      if (_fsPlus.default.existsSync(this.pack.path)) {
        atom.open({
          pathsToOpen: [this.pack.path]
        });
      }
    };
    this.refs.openButton.addEventListener('click', openButtonClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.openButton.removeEventListener('click', openButtonClickHandler);
    }));
    const learnMoreButtonClickHandler = event => {
      event.preventDefault();
      _electron.shell.openExternal(`https://pulsar-edit.dev/packages/${this.pack.name}`);
    };
    this.refs.learnMoreButton.addEventListener('click', learnMoreButtonClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.learnMoreButton.removeEventListener('click', learnMoreButtonClickHandler);
    }));
    const breadcrumbClickHandler = event => {
      event.preventDefault();
      this.settingsView.showPanel(this.breadcrumbBackPanel);
    };
    this.refs.breadcrumb.addEventListener('click', breadcrumbClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.breadcrumb.removeEventListener('click', breadcrumbClickHandler);
    }));
  }
  completeInitialization() {
    if (this.refs.packageCard) {
      this.packageCard = this.refs.packageCard.packageCard;
    } else if (!this.packageCard) {
      // Had to load this from the network
      this.packageCard = new _packageCard.default(this.pack.metadata, this.settingsView, this.packageManager, {
        onSettingsView: true
      });
      this.refs.packageCardParent.replaceChild(this.packageCard.element, this.refs.loadingMessage);
    }
    this.refs.packageRepo.classList.remove('hidden');
    this.refs.startupTime.classList.remove('hidden');
    this.refs.buttons.classList.remove('hidden');
    this.activateConfig();
    this.populate();
    this.updateFileButtons();
    this.subscribeToPackageManager();
    this.renderReadme();
  }
  loadPackage() {
    const loadedPackage = atom.packages.getLoadedPackage(this.pack.name);
    if (loadedPackage) {
      this.pack = loadedPackage;
      this.completeInitialization();
    } else {
      // If the package metadata in `@pack` isn't complete, hit the network.
      if (!this.pack.metadata || !this.pack.metadata.owner) {
        this.fetchPackage();
      } else {
        this.completeInitialization();
      }
    }
  }
  fetchPackage() {
    this.showLoadingMessage();
    this.packageManager.getClient().package(this.pack.name, (err, packageData) => {
      if (err || !packageData || !packageData.name) {
        this.hideLoadingMessage();
        this.showErrorMessage();
      } else {
        this.pack = packageData;
        // TODO: this should match Package.loadMetadata from core, but this is
        // an acceptable hacky workaround
        this.pack.metadata = _underscorePlus.default.extend(this.pack.metadata != null ? this.pack.metadata : {}, this.pack);
        this.completeInitialization();
      }
    });
  }
  showLoadingMessage() {
    this.refs.loadingMessage.classList.remove('hidden');
  }
  hideLoadingMessage() {
    this.refs.loadingMessage.classList.add('hidden');
  }
  showErrorMessage() {
    this.refs.errorMessage.classList.remove('hidden');
  }
  hideErrorMessage() {
    this.refs.errorMessage.classList.add('hidden');
  }
  activateConfig() {
    // Package.activateConfig() is part of the Private package API and should not be used outside of core.
    if (atom.packages.isPackageLoaded(this.pack.name) && !atom.packages.isPackageActive(this.pack.name)) {
      this.pack.activateConfig();
    }
  }
  destroy() {
    if (this.settingsPanel) {
      this.settingsPanel.destroy();
      this.settingsPanel = null;
    }
    if (this.keymapView) {
      this.keymapView.destroy();
      this.keymapView = null;
    }
    if (this.grammarsView) {
      this.grammarsView.destroy();
      this.grammarsView = null;
    }
    if (this.snippetsView) {
      this.snippetsView.destroy();
      this.snippetsView = null;
    }
    if (this.readmeView) {
      this.readmeView.destroy();
      this.readmeView = null;
    }
    if (this.packageCard) {
      this.packageCard.destroy();
      this.packageCard = null;
    }
    this.disposables.dispose();
    return _etch.default.destroy(this);
  }
  update() {}
  beforeShow(opts) {
    if (opts.back == null) {
      opts.back = 'Install';
    }
    this.breadcrumbBackPanel = opts.back;
    this.refs.breadcrumb.textContent = this.breadcrumbBackPanel;
  }
  show() {
    this.element.style.display = '';
  }
  focus() {
    this.element.focus();
  }
  render() {
    let packageCardView;
    if (this.pack && this.pack.metadata && this.pack.metadata.owner) {
      packageCardView = _etch.default.dom("div", {
        ref: "packageCardParent",
        className: "row"
      }, _etch.default.dom(PackageCardComponent, {
        ref: "packageCard",
        settingsView: this.settingsView,
        packageManager: this.packageManager,
        metadata: this.pack.metadata,
        options: {
          onSettingsView: true
        }
      }));
    } else {
      packageCardView = _etch.default.dom("div", {
        ref: "packageCardParent",
        className: "row"
      }, _etch.default.dom("div", {
        ref: "loadingMessage",
        className: "alert alert-info icon icon-hourglass"
      }, `Loading ${this.pack.name}\u2026`), _etch.default.dom("div", {
        ref: "errorMessage",
        className: "alert alert-danger icon icon-hourglass hidden"
      }, "Failed to load ", this.pack.name, " - try again later."));
    }
    return _etch.default.dom("div", {
      tabIndex: "0",
      className: "package-detail"
    }, _etch.default.dom("ol", {
      ref: "breadcrumbContainer",
      className: "native-key-bindings breadcrumb",
      tabIndex: "-1"
    }, _etch.default.dom("li", null, _etch.default.dom("a", {
      ref: "breadcrumb"
    })), _etch.default.dom("li", {
      className: "active"
    }, _etch.default.dom("a", {
      ref: "title"
    }))), _etch.default.dom("div", {
      className: "panels-item"
    }, _etch.default.dom("section", {
      className: "section"
    }, _etch.default.dom("form", {
      className: "section-container package-detail-view"
    }, _etch.default.dom("div", {
      className: "container package-container"
    }, packageCardView), _etch.default.dom("p", {
      ref: "packageRepo",
      className: "link icon icon-repo repo-link hidden"
    }), _etch.default.dom("p", {
      ref: "startupTime",
      className: "text icon icon-dashboard hidden",
      tabIndex: "-1"
    }), _etch.default.dom("div", {
      ref: "buttons",
      className: "btn-wrap-group hidden"
    }, _etch.default.dom("button", {
      ref: "learnMoreButton",
      className: "btn btn-default icon icon-link"
    }, "View on Atom.io"), _etch.default.dom("button", {
      ref: "issueButton",
      className: "btn btn-default icon icon-bug"
    }, "Report Issue"), _etch.default.dom("button", {
      ref: "changelogButton",
      className: "btn btn-default icon icon-squirrel"
    }, "CHANGELOG"), _etch.default.dom("button", {
      ref: "licenseButton",
      className: "btn btn-default icon icon-law"
    }, "LICENSE"), _etch.default.dom("button", {
      ref: "openButton",
      className: "btn btn-default icon icon-link-external"
    }, "View Code")), _etch.default.dom("div", {
      ref: "errors"
    }))), _etch.default.dom("div", {
      ref: "sections"
    })));
  }
  populate() {
    this.refs.title.textContent = `${_underscorePlus.default.undasherize(_underscorePlus.default.uncamelcase(this.pack.name))}`;
    this.type = this.pack.metadata.theme ? 'theme' : 'package';
    const repoUrl = this.packageManager.getRepositoryUrl(this.pack);
    if (repoUrl) {
      const repoName = _url.default.parse(repoUrl).pathname;
      this.refs.packageRepo.textContent = repoName.substring(1);
      this.refs.packageRepo.style.display = '';
    } else {
      this.refs.packageRepo.style.display = 'none';
    }
    this.updateInstalledState();
  }
  updateInstalledState() {
    if (this.settingsPanel) {
      this.settingsPanel.destroy();
      this.settingsPanel = null;
    }
    if (this.keymapView) {
      this.keymapView.destroy();
      this.keymapView = null;
    }
    if (this.grammarsView) {
      this.grammarsView.destroy();
      this.grammarsView = null;
    }
    if (this.snippetsView) {
      this.snippetsView.destroy();
      this.snippetsView = null;
    }
    if (this.readmeView) {
      this.readmeView.destroy();
      this.readmeView = null;
    }
    this.updateFileButtons();
    this.activateConfig();
    this.refs.startupTime.style.display = 'none';
    if (atom.packages.isPackageLoaded(this.pack.name)) {
      if (!atom.packages.isPackageDisabled(this.pack.name)) {
        this.settingsPanel = new _settingsPanel.default({
          namespace: this.pack.name,
          includeTitle: false
        });
        this.keymapView = new _packageKeymapView.default(this.pack);
        this.refs.sections.appendChild(this.settingsPanel.element);
        this.refs.sections.appendChild(this.keymapView.element);
        if (this.pack.path) {
          this.grammarsView = new _packageGrammarsView.default(this.pack.path);
          this.snippetsView = new _packageSnippetsView.default(this.pack, this.snippetsProvider);
          this.refs.sections.appendChild(this.grammarsView.element);
          this.refs.sections.appendChild(this.snippetsView.element);
        }
        this.refs.startupTime.innerHTML = `This ${this.type} added <span class='highlight'>${this.getStartupTime()}ms</span> to startup time.`;
        this.refs.startupTime.style.display = '';
      }
    }
    const sourceIsAvailable = this.packageManager.isPackageInstalled(this.pack.name) && !atom.packages.isBundledPackage(this.pack.name);
    if (sourceIsAvailable) {
      this.refs.openButton.style.display = '';
    } else {
      this.refs.openButton.style.display = 'none';
    }
    this.renderReadme();
  }
  renderReadme() {
    let readme;
    if (this.pack.metadata.readme && this.pack.metadata.readme.trim() !== NORMALIZE_PACKAGE_DATA_README_ERROR) {
      readme = this.pack.metadata.readme;
    } else {
      readme = null;
    }
    if (this.readmePath && _fsPlus.default.existsSync(this.readmePath) && _fsPlus.default.statSync(this.readmePath).isFile() && !readme) {
      readme = _fsPlus.default.readFileSync(this.readmePath, {
        encoding: 'utf8'
      });
    }
    let readmeSrc;
    if (this.pack.path) {
      // If package is installed, use installed path
      readmeSrc = this.pack.path;
    } else {
      // If package isn't installed, use url path
      let repoUrl = this.packageManager.getRepositoryUrl(this.pack);

      // Check if URL is undefined (i.e. package is unpublished)
      if (repoUrl) {
        readmeSrc = repoUrl + `/blob/master/`;
      }
    }
    const readmeView = new _packageReadmeView.default(readme, readmeSrc);
    if (this.readmeView) {
      this.readmeView.element.parentElement.replaceChild(readmeView.element, this.readmeView.element);
      this.readmeView.destroy();
    } else {
      this.refs.sections.appendChild(readmeView.element);
    }
    this.readmeView = readmeView;
  }
  subscribeToPackageManager() {
    this.disposables.add(this.packageManager.on('theme-installed package-installed', ({
      pack
    }) => {
      if (this.pack.name === pack.name) {
        this.loadPackage();
        this.updateInstalledState();
      }
    }));
    this.disposables.add(this.packageManager.on('theme-uninstalled package-uninstalled', ({
      pack
    }) => {
      if (this.pack.name === pack.name) {
        return this.updateInstalledState();
      }
    }));
    this.disposables.add(this.packageManager.on('theme-updated package-updated', ({
      pack
    }) => {
      if (this.pack.name === pack.name) {
        this.loadPackage();
        this.updateFileButtons();
        this.populate();
      }
    }));
  }
  openMarkdownFile(path) {
    if (atom.packages.isPackageActive('markdown-preview')) {
      atom.workspace.open(encodeURI(`markdown-preview://${path}`));
    } else {
      atom.workspace.open(path);
    }
  }
  updateFileButtons() {
    this.changelogPath = null;
    this.licensePath = null;
    this.readmePath = null;
    const packagePath = this.pack.path != null ? this.pack.path : atom.packages.resolvePackagePath(this.pack.name);
    for (const child of _fsPlus.default.listSync(packagePath)) {
      switch (_path.default.basename(child, _path.default.extname(child)).toLowerCase()) {
        case 'changelog':
        case 'history':
          this.changelogPath = child;
          break;
        case 'license':
        case 'licence':
          this.licensePath = child;
          break;
        case 'readme':
          this.readmePath = child;
          break;
      }
      if (this.readmePath && this.changelogPath && this.licensePath) {
        break;
      }
    }
    if (this.changelogPath) {
      this.refs.changelogButton.style.display = '';
    } else {
      this.refs.changelogButton.style.display = 'none';
    }
    if (this.licensePath) {
      this.refs.licenseButton.style.display = '';
    } else {
      this.refs.licenseButton.style.display = 'none';
    }
  }
  getStartupTime() {
    const loadTime = this.pack.loadTime != null ? this.pack.loadTime : 0;
    const activateTime = this.pack.activateTime != null ? this.pack.activateTime : 0;
    return loadTime + activateTime;
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
exports.default = PackageDetailView;
class PackageCardComponent {
  constructor(props) {
    this.packageCard = new _packageCard.default(props.metadata, props.settingsView, props.packageManager, props.options);
    this.element = this.packageCard.element;
  }
  update() {}
  destroy() {}
}
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOT1JNQUxJWkVfUEFDS0FHRV9EQVRBX1JFQURNRV9FUlJPUiIsIlBhY2thZ2VEZXRhaWxWaWV3IiwiY29uc3RydWN0b3IiLCJwYWNrIiwic2V0dGluZ3NWaWV3IiwicGFja2FnZU1hbmFnZXIiLCJzbmlwcGV0c1Byb3ZpZGVyIiwiZGlzcG9zYWJsZXMiLCJDb21wb3NpdGVEaXNwb3NhYmxlIiwiZXRjaCIsImluaXRpYWxpemUiLCJsb2FkUGFja2FnZSIsImFkZCIsImF0b20iLCJjb21tYW5kcyIsImVsZW1lbnQiLCJzY3JvbGxVcCIsInNjcm9sbERvd24iLCJwYWdlVXAiLCJwYWdlRG93biIsInNjcm9sbFRvVG9wIiwic2Nyb2xsVG9Cb3R0b20iLCJwYWNrYWdlUmVwb0NsaWNrSGFuZGxlciIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJyZXBvVXJsIiwiZ2V0UmVwb3NpdG9yeVVybCIsInVybCIsInBhcnNlIiwicGF0aG5hbWUiLCJzaGVsbCIsIm9wZW5FeHRlcm5hbCIsIm5hbWUiLCJyZWZzIiwicGFja2FnZVJlcG8iLCJhZGRFdmVudExpc3RlbmVyIiwiRGlzcG9zYWJsZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpc3N1ZUJ1dHRvbkNsaWNrSGFuZGxlciIsImJ1Z1VyaSIsImdldFJlcG9zaXRvcnlCdWdVcmkiLCJpc3N1ZUJ1dHRvbiIsImNoYW5nZWxvZ0J1dHRvbkNsaWNrSGFuZGxlciIsImNoYW5nZWxvZ1BhdGgiLCJvcGVuTWFya2Rvd25GaWxlIiwiY2hhbmdlbG9nQnV0dG9uIiwibGljZW5zZUJ1dHRvbkNsaWNrSGFuZGxlciIsImxpY2Vuc2VQYXRoIiwibGljZW5zZUJ1dHRvbiIsIm9wZW5CdXR0b25DbGlja0hhbmRsZXIiLCJmcyIsImV4aXN0c1N5bmMiLCJwYXRoIiwib3BlbiIsInBhdGhzVG9PcGVuIiwib3BlbkJ1dHRvbiIsImxlYXJuTW9yZUJ1dHRvbkNsaWNrSGFuZGxlciIsImxlYXJuTW9yZUJ1dHRvbiIsImJyZWFkY3J1bWJDbGlja0hhbmRsZXIiLCJzaG93UGFuZWwiLCJicmVhZGNydW1iQmFja1BhbmVsIiwiYnJlYWRjcnVtYiIsImNvbXBsZXRlSW5pdGlhbGl6YXRpb24iLCJwYWNrYWdlQ2FyZCIsIlBhY2thZ2VDYXJkIiwibWV0YWRhdGEiLCJvblNldHRpbmdzVmlldyIsInBhY2thZ2VDYXJkUGFyZW50IiwicmVwbGFjZUNoaWxkIiwibG9hZGluZ01lc3NhZ2UiLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJzdGFydHVwVGltZSIsImJ1dHRvbnMiLCJhY3RpdmF0ZUNvbmZpZyIsInBvcHVsYXRlIiwidXBkYXRlRmlsZUJ1dHRvbnMiLCJzdWJzY3JpYmVUb1BhY2thZ2VNYW5hZ2VyIiwicmVuZGVyUmVhZG1lIiwibG9hZGVkUGFja2FnZSIsInBhY2thZ2VzIiwiZ2V0TG9hZGVkUGFja2FnZSIsIm93bmVyIiwiZmV0Y2hQYWNrYWdlIiwic2hvd0xvYWRpbmdNZXNzYWdlIiwiZ2V0Q2xpZW50IiwicGFja2FnZSIsImVyciIsInBhY2thZ2VEYXRhIiwiaGlkZUxvYWRpbmdNZXNzYWdlIiwic2hvd0Vycm9yTWVzc2FnZSIsIl8iLCJleHRlbmQiLCJlcnJvck1lc3NhZ2UiLCJoaWRlRXJyb3JNZXNzYWdlIiwiaXNQYWNrYWdlTG9hZGVkIiwiaXNQYWNrYWdlQWN0aXZlIiwiZGVzdHJveSIsInNldHRpbmdzUGFuZWwiLCJrZXltYXBWaWV3IiwiZ3JhbW1hcnNWaWV3Iiwic25pcHBldHNWaWV3IiwicmVhZG1lVmlldyIsImRpc3Bvc2UiLCJ1cGRhdGUiLCJiZWZvcmVTaG93Iiwib3B0cyIsImJhY2siLCJ0ZXh0Q29udGVudCIsInNob3ciLCJzdHlsZSIsImRpc3BsYXkiLCJmb2N1cyIsInJlbmRlciIsInBhY2thZ2VDYXJkVmlldyIsInRpdGxlIiwidW5kYXNoZXJpemUiLCJ1bmNhbWVsY2FzZSIsInR5cGUiLCJ0aGVtZSIsInJlcG9OYW1lIiwic3Vic3RyaW5nIiwidXBkYXRlSW5zdGFsbGVkU3RhdGUiLCJpc1BhY2thZ2VEaXNhYmxlZCIsIlNldHRpbmdzUGFuZWwiLCJuYW1lc3BhY2UiLCJpbmNsdWRlVGl0bGUiLCJQYWNrYWdlS2V5bWFwVmlldyIsInNlY3Rpb25zIiwiYXBwZW5kQ2hpbGQiLCJQYWNrYWdlR3JhbW1hcnNWaWV3IiwiUGFja2FnZVNuaXBwZXRzVmlldyIsImlubmVySFRNTCIsImdldFN0YXJ0dXBUaW1lIiwic291cmNlSXNBdmFpbGFibGUiLCJpc1BhY2thZ2VJbnN0YWxsZWQiLCJpc0J1bmRsZWRQYWNrYWdlIiwicmVhZG1lIiwidHJpbSIsInJlYWRtZVBhdGgiLCJzdGF0U3luYyIsImlzRmlsZSIsInJlYWRGaWxlU3luYyIsImVuY29kaW5nIiwicmVhZG1lU3JjIiwiUGFja2FnZVJlYWRtZVZpZXciLCJwYXJlbnRFbGVtZW50Iiwib24iLCJ3b3Jrc3BhY2UiLCJlbmNvZGVVUkkiLCJwYWNrYWdlUGF0aCIsInJlc29sdmVQYWNrYWdlUGF0aCIsImNoaWxkIiwibGlzdFN5bmMiLCJiYXNlbmFtZSIsImV4dG5hbWUiLCJ0b0xvd2VyQ2FzZSIsImxvYWRUaW1lIiwiYWN0aXZhdGVUaW1lIiwic2Nyb2xsVG9wIiwiZG9jdW1lbnQiLCJib2R5Iiwib2Zmc2V0SGVpZ2h0Iiwic2Nyb2xsSGVpZ2h0IiwiUGFja2FnZUNhcmRDb21wb25lbnQiLCJwcm9wcyIsIm9wdGlvbnMiXSwic291cmNlcyI6WyJwYWNrYWdlLWRldGFpbC12aWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cbi8qKiBAanN4IGV0Y2guZG9tICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgdXJsIGZyb20gJ3VybCdcblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnXG5pbXBvcnQge3NoZWxsfSBmcm9tICdlbGVjdHJvbidcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCBldGNoIGZyb20gJ2V0Y2gnXG5cbmltcG9ydCBQYWNrYWdlQ2FyZCBmcm9tICcuL3BhY2thZ2UtY2FyZCdcbmltcG9ydCBQYWNrYWdlR3JhbW1hcnNWaWV3IGZyb20gJy4vcGFja2FnZS1ncmFtbWFycy12aWV3J1xuaW1wb3J0IFBhY2thZ2VLZXltYXBWaWV3IGZyb20gJy4vcGFja2FnZS1rZXltYXAtdmlldydcbmltcG9ydCBQYWNrYWdlUmVhZG1lVmlldyBmcm9tICcuL3BhY2thZ2UtcmVhZG1lLXZpZXcnXG5pbXBvcnQgUGFja2FnZVNuaXBwZXRzVmlldyBmcm9tICcuL3BhY2thZ2Utc25pcHBldHMtdmlldydcbmltcG9ydCBTZXR0aW5nc1BhbmVsIGZyb20gJy4vc2V0dGluZ3MtcGFuZWwnXG5cbmNvbnN0IE5PUk1BTElaRV9QQUNLQUdFX0RBVEFfUkVBRE1FX0VSUk9SID0gJ0VSUk9SOiBObyBSRUFETUUgZGF0YSBmb3VuZCEnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhY2thZ2VEZXRhaWxWaWV3IHtcbiAgY29uc3RydWN0b3IgKHBhY2ssIHNldHRpbmdzVmlldywgcGFja2FnZU1hbmFnZXIsIHNuaXBwZXRzUHJvdmlkZXIpIHtcbiAgICB0aGlzLnBhY2sgPSBwYWNrXG4gICAgdGhpcy5zZXR0aW5nc1ZpZXcgPSBzZXR0aW5nc1ZpZXdcbiAgICB0aGlzLnBhY2thZ2VNYW5hZ2VyID0gcGFja2FnZU1hbmFnZXJcbiAgICB0aGlzLnNuaXBwZXRzUHJvdmlkZXIgPSBzbmlwcGV0c1Byb3ZpZGVyXG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBldGNoLmluaXRpYWxpemUodGhpcylcbiAgICB0aGlzLmxvYWRQYWNrYWdlKClcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCwge1xuICAgICAgJ2NvcmU6bW92ZS11cCc6ICgpID0+IHsgdGhpcy5zY3JvbGxVcCgpIH0sXG4gICAgICAnY29yZTptb3ZlLWRvd24nOiAoKSA9PiB7IHRoaXMuc2Nyb2xsRG93bigpIH0sXG4gICAgICAnY29yZTpwYWdlLXVwJzogKCkgPT4geyB0aGlzLnBhZ2VVcCgpIH0sXG4gICAgICAnY29yZTpwYWdlLWRvd24nOiAoKSA9PiB7IHRoaXMucGFnZURvd24oKSB9LFxuICAgICAgJ2NvcmU6bW92ZS10by10b3AnOiAoKSA9PiB7IHRoaXMuc2Nyb2xsVG9Ub3AoKSB9LFxuICAgICAgJ2NvcmU6bW92ZS10by1ib3R0b20nOiAoKSA9PiB7IHRoaXMuc2Nyb2xsVG9Cb3R0b20oKSB9XG4gICAgfSkpXG5cbiAgICBjb25zdCBwYWNrYWdlUmVwb0NsaWNrSGFuZGxlciA9IChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgY29uc3QgcmVwb1VybCA9IHRoaXMucGFja2FnZU1hbmFnZXIuZ2V0UmVwb3NpdG9yeVVybCh0aGlzLnBhY2spXG4gICAgICBpZiAodHlwZW9mIHJlcG9VcmwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmICh1cmwucGFyc2UocmVwb1VybCkucGF0aG5hbWUgPT09ICcvYXRvbS9hdG9tJykge1xuICAgICAgICAgIHNoZWxsLm9wZW5FeHRlcm5hbChgJHtyZXBvVXJsfS90cmVlL21hc3Rlci9wYWNrYWdlcy8ke3RoaXMucGFjay5uYW1lfWApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2hlbGwub3BlbkV4dGVybmFsKHJlcG9VcmwpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5yZWZzLnBhY2thZ2VSZXBvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGFja2FnZVJlcG9DbGlja0hhbmRsZXIpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4geyB0aGlzLnJlZnMucGFja2FnZVJlcG8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwYWNrYWdlUmVwb0NsaWNrSGFuZGxlcikgfSkpXG5cbiAgICBjb25zdCBpc3N1ZUJ1dHRvbkNsaWNrSGFuZGxlciA9IChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgbGV0IGJ1Z1VyaSA9IHRoaXMucGFja2FnZU1hbmFnZXIuZ2V0UmVwb3NpdG9yeUJ1Z1VyaSh0aGlzLnBhY2spXG4gICAgICBpZiAoYnVnVXJpKSB7XG4gICAgICAgIHNoZWxsLm9wZW5FeHRlcm5hbChidWdVcmkpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucmVmcy5pc3N1ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGlzc3VlQnV0dG9uQ2xpY2tIYW5kbGVyKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdGhpcy5yZWZzLmlzc3VlQnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaXNzdWVCdXR0b25DbGlja0hhbmRsZXIpIH0pKVxuXG4gICAgY29uc3QgY2hhbmdlbG9nQnV0dG9uQ2xpY2tIYW5kbGVyID0gKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBpZiAodGhpcy5jaGFuZ2Vsb2dQYXRoKSB7XG4gICAgICAgIHRoaXMub3Blbk1hcmtkb3duRmlsZSh0aGlzLmNoYW5nZWxvZ1BhdGgpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucmVmcy5jaGFuZ2Vsb2dCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjaGFuZ2Vsb2dCdXR0b25DbGlja0hhbmRsZXIpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4geyB0aGlzLnJlZnMuY2hhbmdlbG9nQnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2hhbmdlbG9nQnV0dG9uQ2xpY2tIYW5kbGVyKSB9KSlcblxuICAgIGNvbnN0IGxpY2Vuc2VCdXR0b25DbGlja0hhbmRsZXIgPSAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGlmICh0aGlzLmxpY2Vuc2VQYXRoKSB7XG4gICAgICAgIHRoaXMub3Blbk1hcmtkb3duRmlsZSh0aGlzLmxpY2Vuc2VQYXRoKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlZnMubGljZW5zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGxpY2Vuc2VCdXR0b25DbGlja0hhbmRsZXIpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4geyB0aGlzLnJlZnMubGljZW5zZUJ1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGxpY2Vuc2VCdXR0b25DbGlja0hhbmRsZXIpIH0pKVxuXG4gICAgY29uc3Qgb3BlbkJ1dHRvbkNsaWNrSGFuZGxlciA9IChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgaWYgKGZzLmV4aXN0c1N5bmModGhpcy5wYWNrLnBhdGgpKSB7XG4gICAgICAgIGF0b20ub3Blbih7cGF0aHNUb09wZW46IFt0aGlzLnBhY2sucGF0aF19KVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlZnMub3BlbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9wZW5CdXR0b25DbGlja0hhbmRsZXIpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4geyB0aGlzLnJlZnMub3BlbkJ1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIG9wZW5CdXR0b25DbGlja0hhbmRsZXIpIH0pKVxuXG4gICAgY29uc3QgbGVhcm5Nb3JlQnV0dG9uQ2xpY2tIYW5kbGVyID0gKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBzaGVsbC5vcGVuRXh0ZXJuYWwoYGh0dHBzOi8vcHVsc2FyLWVkaXQuZGV2L3BhY2thZ2VzLyR7dGhpcy5wYWNrLm5hbWV9YClcbiAgICB9XG4gICAgdGhpcy5yZWZzLmxlYXJuTW9yZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGxlYXJuTW9yZUJ1dHRvbkNsaWNrSGFuZGxlcilcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRoaXMucmVmcy5sZWFybk1vcmVCdXR0b24ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBsZWFybk1vcmVCdXR0b25DbGlja0hhbmRsZXIpIH0pKVxuXG4gICAgY29uc3QgYnJlYWRjcnVtYkNsaWNrSGFuZGxlciA9IChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5zZXR0aW5nc1ZpZXcuc2hvd1BhbmVsKHRoaXMuYnJlYWRjcnVtYkJhY2tQYW5lbClcbiAgICB9XG4gICAgdGhpcy5yZWZzLmJyZWFkY3J1bWIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBicmVhZGNydW1iQ2xpY2tIYW5kbGVyKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdGhpcy5yZWZzLmJyZWFkY3J1bWIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBicmVhZGNydW1iQ2xpY2tIYW5kbGVyKSB9KSlcbiAgfVxuXG4gIGNvbXBsZXRlSW5pdGlhbGl6YXRpb24gKCkge1xuICAgIGlmICh0aGlzLnJlZnMucGFja2FnZUNhcmQpIHtcbiAgICAgIHRoaXMucGFja2FnZUNhcmQgPSB0aGlzLnJlZnMucGFja2FnZUNhcmQucGFja2FnZUNhcmRcbiAgICB9IGVsc2UgaWYgKCF0aGlzLnBhY2thZ2VDYXJkKSB7IC8vIEhhZCB0byBsb2FkIHRoaXMgZnJvbSB0aGUgbmV0d29ya1xuICAgICAgdGhpcy5wYWNrYWdlQ2FyZCA9IG5ldyBQYWNrYWdlQ2FyZCh0aGlzLnBhY2subWV0YWRhdGEsIHRoaXMuc2V0dGluZ3NWaWV3LCB0aGlzLnBhY2thZ2VNYW5hZ2VyLCB7b25TZXR0aW5nc1ZpZXc6IHRydWV9KVxuICAgICAgdGhpcy5yZWZzLnBhY2thZ2VDYXJkUGFyZW50LnJlcGxhY2VDaGlsZCh0aGlzLnBhY2thZ2VDYXJkLmVsZW1lbnQsIHRoaXMucmVmcy5sb2FkaW5nTWVzc2FnZSlcbiAgICB9XG5cbiAgICB0aGlzLnJlZnMucGFja2FnZVJlcG8uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcbiAgICB0aGlzLnJlZnMuc3RhcnR1cFRpbWUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcbiAgICB0aGlzLnJlZnMuYnV0dG9ucy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxuICAgIHRoaXMuYWN0aXZhdGVDb25maWcoKVxuICAgIHRoaXMucG9wdWxhdGUoKVxuICAgIHRoaXMudXBkYXRlRmlsZUJ1dHRvbnMoKVxuICAgIHRoaXMuc3Vic2NyaWJlVG9QYWNrYWdlTWFuYWdlcigpXG4gICAgdGhpcy5yZW5kZXJSZWFkbWUoKVxuICB9XG5cbiAgbG9hZFBhY2thZ2UgKCkge1xuICAgIGNvbnN0IGxvYWRlZFBhY2thZ2UgPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UodGhpcy5wYWNrLm5hbWUpXG4gICAgaWYgKGxvYWRlZFBhY2thZ2UpIHtcbiAgICAgIHRoaXMucGFjayA9IGxvYWRlZFBhY2thZ2VcbiAgICAgIHRoaXMuY29tcGxldGVJbml0aWFsaXphdGlvbigpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZSBwYWNrYWdlIG1ldGFkYXRhIGluIGBAcGFja2AgaXNuJ3QgY29tcGxldGUsIGhpdCB0aGUgbmV0d29yay5cbiAgICAgIGlmICghdGhpcy5wYWNrLm1ldGFkYXRhIHx8ICF0aGlzLnBhY2subWV0YWRhdGEub3duZXIpIHtcbiAgICAgICAgdGhpcy5mZXRjaFBhY2thZ2UoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb21wbGV0ZUluaXRpYWxpemF0aW9uKClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmZXRjaFBhY2thZ2UgKCkge1xuICAgIHRoaXMuc2hvd0xvYWRpbmdNZXNzYWdlKClcbiAgICB0aGlzLnBhY2thZ2VNYW5hZ2VyLmdldENsaWVudCgpLnBhY2thZ2UodGhpcy5wYWNrLm5hbWUsIChlcnIsIHBhY2thZ2VEYXRhKSA9PiB7XG4gICAgICBpZiAoZXJyIHx8ICFwYWNrYWdlRGF0YSB8fCAhcGFja2FnZURhdGEubmFtZSkge1xuICAgICAgICB0aGlzLmhpZGVMb2FkaW5nTWVzc2FnZSgpXG4gICAgICAgIHRoaXMuc2hvd0Vycm9yTWVzc2FnZSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBhY2sgPSBwYWNrYWdlRGF0YVxuICAgICAgICAvLyBUT0RPOiB0aGlzIHNob3VsZCBtYXRjaCBQYWNrYWdlLmxvYWRNZXRhZGF0YSBmcm9tIGNvcmUsIGJ1dCB0aGlzIGlzXG4gICAgICAgIC8vIGFuIGFjY2VwdGFibGUgaGFja3kgd29ya2Fyb3VuZFxuICAgICAgICB0aGlzLnBhY2subWV0YWRhdGEgPSBfLmV4dGVuZCh0aGlzLnBhY2subWV0YWRhdGEgIT0gbnVsbCA/IHRoaXMucGFjay5tZXRhZGF0YSA6IHt9LCB0aGlzLnBhY2spXG4gICAgICAgIHRoaXMuY29tcGxldGVJbml0aWFsaXphdGlvbigpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHNob3dMb2FkaW5nTWVzc2FnZSAoKSB7XG4gICAgdGhpcy5yZWZzLmxvYWRpbmdNZXNzYWdlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpXG4gIH1cblxuICBoaWRlTG9hZGluZ01lc3NhZ2UgKCkge1xuICAgIHRoaXMucmVmcy5sb2FkaW5nTWVzc2FnZS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxuICB9XG5cbiAgc2hvd0Vycm9yTWVzc2FnZSAoKSB7XG4gICAgdGhpcy5yZWZzLmVycm9yTWVzc2FnZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxuICB9XG5cbiAgaGlkZUVycm9yTWVzc2FnZSAoKSB7XG4gICAgdGhpcy5yZWZzLmVycm9yTWVzc2FnZS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxuICB9XG5cbiAgYWN0aXZhdGVDb25maWcgKCkge1xuICAgIC8vIFBhY2thZ2UuYWN0aXZhdGVDb25maWcoKSBpcyBwYXJ0IG9mIHRoZSBQcml2YXRlIHBhY2thZ2UgQVBJIGFuZCBzaG91bGQgbm90IGJlIHVzZWQgb3V0c2lkZSBvZiBjb3JlLlxuICAgIGlmIChhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUxvYWRlZCh0aGlzLnBhY2submFtZSkgJiYgIWF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKHRoaXMucGFjay5uYW1lKSkge1xuICAgICAgdGhpcy5wYWNrLmFjdGl2YXRlQ29uZmlnKClcbiAgICB9XG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICBpZiAodGhpcy5zZXR0aW5nc1BhbmVsKSB7XG4gICAgICB0aGlzLnNldHRpbmdzUGFuZWwuZGVzdHJveSgpXG4gICAgICB0aGlzLnNldHRpbmdzUGFuZWwgPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKHRoaXMua2V5bWFwVmlldykge1xuICAgICAgdGhpcy5rZXltYXBWaWV3LmRlc3Ryb3koKVxuICAgICAgdGhpcy5rZXltYXBWaWV3ID0gbnVsbFxuICAgIH1cblxuICAgIGlmICh0aGlzLmdyYW1tYXJzVmlldykge1xuICAgICAgdGhpcy5ncmFtbWFyc1ZpZXcuZGVzdHJveSgpXG4gICAgICB0aGlzLmdyYW1tYXJzVmlldyA9IG51bGxcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zbmlwcGV0c1ZpZXcpIHtcbiAgICAgIHRoaXMuc25pcHBldHNWaWV3LmRlc3Ryb3koKVxuICAgICAgdGhpcy5zbmlwcGV0c1ZpZXcgPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKHRoaXMucmVhZG1lVmlldykge1xuICAgICAgdGhpcy5yZWFkbWVWaWV3LmRlc3Ryb3koKVxuICAgICAgdGhpcy5yZWFkbWVWaWV3ID0gbnVsbFxuICAgIH1cblxuICAgIGlmICh0aGlzLnBhY2thZ2VDYXJkKSB7XG4gICAgICB0aGlzLnBhY2thZ2VDYXJkLmRlc3Ryb3koKVxuICAgICAgdGhpcy5wYWNrYWdlQ2FyZCA9IG51bGxcbiAgICB9XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIHJldHVybiBldGNoLmRlc3Ryb3kodGhpcylcbiAgfVxuXG4gIHVwZGF0ZSAoKSB7fVxuXG4gIGJlZm9yZVNob3cgKG9wdHMpIHtcbiAgICBpZiAob3B0cy5iYWNrID09IG51bGwpIHtcbiAgICAgIG9wdHMuYmFjayA9ICdJbnN0YWxsJ1xuICAgIH1cblxuICAgIHRoaXMuYnJlYWRjcnVtYkJhY2tQYW5lbCA9IG9wdHMuYmFja1xuICAgIHRoaXMucmVmcy5icmVhZGNydW1iLnRleHRDb250ZW50ID0gdGhpcy5icmVhZGNydW1iQmFja1BhbmVsXG4gIH1cblxuICBzaG93ICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnXG4gIH1cblxuICBmb2N1cyAoKSB7XG4gICAgdGhpcy5lbGVtZW50LmZvY3VzKClcbiAgfVxuXG4gIHJlbmRlciAoKSB7XG4gICAgbGV0IHBhY2thZ2VDYXJkVmlld1xuICAgIGlmICh0aGlzLnBhY2sgJiYgdGhpcy5wYWNrLm1ldGFkYXRhICYmIHRoaXMucGFjay5tZXRhZGF0YS5vd25lcikge1xuICAgICAgcGFja2FnZUNhcmRWaWV3ID0gKFxuICAgICAgICA8ZGl2IHJlZj0ncGFja2FnZUNhcmRQYXJlbnQnIGNsYXNzTmFtZT0ncm93Jz5cbiAgICAgICAgICA8UGFja2FnZUNhcmRDb21wb25lbnRcbiAgICAgICAgICAgIHJlZj0ncGFja2FnZUNhcmQnXG4gICAgICAgICAgICBzZXR0aW5nc1ZpZXc9e3RoaXMuc2V0dGluZ3NWaWV3fVxuICAgICAgICAgICAgcGFja2FnZU1hbmFnZXI9e3RoaXMucGFja2FnZU1hbmFnZXJ9XG4gICAgICAgICAgICBtZXRhZGF0YT17dGhpcy5wYWNrLm1ldGFkYXRhfVxuICAgICAgICAgICAgb3B0aW9ucz17e29uU2V0dGluZ3NWaWV3OiB0cnVlfX0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHBhY2thZ2VDYXJkVmlldyA9IChcbiAgICAgICAgPGRpdiByZWY9J3BhY2thZ2VDYXJkUGFyZW50JyBjbGFzc05hbWU9J3Jvdyc+XG4gICAgICAgICAgPGRpdiByZWY9J2xvYWRpbmdNZXNzYWdlJyBjbGFzc05hbWU9J2FsZXJ0IGFsZXJ0LWluZm8gaWNvbiBpY29uLWhvdXJnbGFzcyc+e2BMb2FkaW5nICR7dGhpcy5wYWNrLm5hbWV9XFx1MjAyNmB9PC9kaXY+XG4gICAgICAgICAgPGRpdiByZWY9J2Vycm9yTWVzc2FnZScgY2xhc3NOYW1lPSdhbGVydCBhbGVydC1kYW5nZXIgaWNvbiBpY29uLWhvdXJnbGFzcyBoaWRkZW4nPkZhaWxlZCB0byBsb2FkIHt0aGlzLnBhY2submFtZX0gLSB0cnkgYWdhaW4gbGF0ZXIuPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiB0YWJJbmRleD0nMCcgY2xhc3NOYW1lPSdwYWNrYWdlLWRldGFpbCc+XG4gICAgICAgIDxvbCByZWY9J2JyZWFkY3J1bWJDb250YWluZXInIGNsYXNzTmFtZT0nbmF0aXZlLWtleS1iaW5kaW5ncyBicmVhZGNydW1iJyB0YWJJbmRleD0nLTEnPlxuICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgIDxhIHJlZj0nYnJlYWRjcnVtYicgLz5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9J2FjdGl2ZSc+XG4gICAgICAgICAgICA8YSByZWY9J3RpdGxlJyAvPlxuICAgICAgICAgIDwvbGk+XG4gICAgICAgIDwvb2w+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BhbmVscy1pdGVtJz5cbiAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9J3NlY3Rpb24nPlxuICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPSdzZWN0aW9uLWNvbnRhaW5lciBwYWNrYWdlLWRldGFpbC12aWV3Jz5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbnRhaW5lciBwYWNrYWdlLWNvbnRhaW5lcic+XG4gICAgICAgICAgICAgICAge3BhY2thZ2VDYXJkVmlld31cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPHAgcmVmPSdwYWNrYWdlUmVwbycgY2xhc3NOYW1lPSdsaW5rIGljb24gaWNvbi1yZXBvIHJlcG8tbGluayBoaWRkZW4nIC8+XG4gICAgICAgICAgICAgIDxwIHJlZj0nc3RhcnR1cFRpbWUnIGNsYXNzTmFtZT0ndGV4dCBpY29uIGljb24tZGFzaGJvYXJkIGhpZGRlbicgdGFiSW5kZXg9Jy0xJyAvPlxuXG4gICAgICAgICAgICAgIDxkaXYgcmVmPSdidXR0b25zJyBjbGFzc05hbWU9J2J0bi13cmFwLWdyb3VwIGhpZGRlbic+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiByZWY9J2xlYXJuTW9yZUJ1dHRvbicgY2xhc3NOYW1lPSdidG4gYnRuLWRlZmF1bHQgaWNvbiBpY29uLWxpbmsnPlZpZXcgb24gQXRvbS5pbzwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gcmVmPSdpc3N1ZUJ1dHRvbicgY2xhc3NOYW1lPSdidG4gYnRuLWRlZmF1bHQgaWNvbiBpY29uLWJ1Zyc+UmVwb3J0IElzc3VlPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiByZWY9J2NoYW5nZWxvZ0J1dHRvbicgY2xhc3NOYW1lPSdidG4gYnRuLWRlZmF1bHQgaWNvbiBpY29uLXNxdWlycmVsJz5DSEFOR0VMT0c8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHJlZj0nbGljZW5zZUJ1dHRvbicgY2xhc3NOYW1lPSdidG4gYnRuLWRlZmF1bHQgaWNvbiBpY29uLWxhdyc+TElDRU5TRTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gcmVmPSdvcGVuQnV0dG9uJyBjbGFzc05hbWU9J2J0biBidG4tZGVmYXVsdCBpY29uIGljb24tbGluay1leHRlcm5hbCc+VmlldyBDb2RlPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgcmVmPSdlcnJvcnMnIC8+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICAgPGRpdiByZWY9J3NlY3Rpb25zJyAvPlxuXG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgcG9wdWxhdGUgKCkge1xuICAgIHRoaXMucmVmcy50aXRsZS50ZXh0Q29udGVudCA9IGAke18udW5kYXNoZXJpemUoXy51bmNhbWVsY2FzZSh0aGlzLnBhY2submFtZSkpfWBcbiAgICB0aGlzLnR5cGUgPSB0aGlzLnBhY2subWV0YWRhdGEudGhlbWUgPyAndGhlbWUnIDogJ3BhY2thZ2UnXG5cbiAgICBjb25zdCByZXBvVXJsID0gdGhpcy5wYWNrYWdlTWFuYWdlci5nZXRSZXBvc2l0b3J5VXJsKHRoaXMucGFjaylcbiAgICBpZiAocmVwb1VybCkge1xuICAgICAgY29uc3QgcmVwb05hbWUgPSB1cmwucGFyc2UocmVwb1VybCkucGF0aG5hbWVcbiAgICAgIHRoaXMucmVmcy5wYWNrYWdlUmVwby50ZXh0Q29udGVudCA9IHJlcG9OYW1lLnN1YnN0cmluZygxKVxuICAgICAgdGhpcy5yZWZzLnBhY2thZ2VSZXBvLnN0eWxlLmRpc3BsYXkgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlZnMucGFja2FnZVJlcG8uc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlSW5zdGFsbGVkU3RhdGUoKVxuICB9XG5cbiAgdXBkYXRlSW5zdGFsbGVkU3RhdGUgKCkge1xuICAgIGlmICh0aGlzLnNldHRpbmdzUGFuZWwpIHtcbiAgICAgIHRoaXMuc2V0dGluZ3NQYW5lbC5kZXN0cm95KClcbiAgICAgIHRoaXMuc2V0dGluZ3NQYW5lbCA9IG51bGxcbiAgICB9XG5cbiAgICBpZiAodGhpcy5rZXltYXBWaWV3KSB7XG4gICAgICB0aGlzLmtleW1hcFZpZXcuZGVzdHJveSgpXG4gICAgICB0aGlzLmtleW1hcFZpZXcgPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ3JhbW1hcnNWaWV3KSB7XG4gICAgICB0aGlzLmdyYW1tYXJzVmlldy5kZXN0cm95KClcbiAgICAgIHRoaXMuZ3JhbW1hcnNWaWV3ID0gbnVsbFxuICAgIH1cblxuICAgIGlmICh0aGlzLnNuaXBwZXRzVmlldykge1xuICAgICAgdGhpcy5zbmlwcGV0c1ZpZXcuZGVzdHJveSgpXG4gICAgICB0aGlzLnNuaXBwZXRzVmlldyA9IG51bGxcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZWFkbWVWaWV3KSB7XG4gICAgICB0aGlzLnJlYWRtZVZpZXcuZGVzdHJveSgpXG4gICAgICB0aGlzLnJlYWRtZVZpZXcgPSBudWxsXG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVGaWxlQnV0dG9ucygpXG4gICAgdGhpcy5hY3RpdmF0ZUNvbmZpZygpXG4gICAgdGhpcy5yZWZzLnN0YXJ0dXBUaW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgIGlmIChhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUxvYWRlZCh0aGlzLnBhY2submFtZSkpIHtcbiAgICAgIGlmICghYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VEaXNhYmxlZCh0aGlzLnBhY2submFtZSkpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5nc1BhbmVsID0gbmV3IFNldHRpbmdzUGFuZWwoe25hbWVzcGFjZTogdGhpcy5wYWNrLm5hbWUsIGluY2x1ZGVUaXRsZTogZmFsc2V9KVxuICAgICAgICB0aGlzLmtleW1hcFZpZXcgPSBuZXcgUGFja2FnZUtleW1hcFZpZXcodGhpcy5wYWNrKVxuICAgICAgICB0aGlzLnJlZnMuc2VjdGlvbnMuYXBwZW5kQ2hpbGQodGhpcy5zZXR0aW5nc1BhbmVsLmVsZW1lbnQpXG4gICAgICAgIHRoaXMucmVmcy5zZWN0aW9ucy5hcHBlbmRDaGlsZCh0aGlzLmtleW1hcFZpZXcuZWxlbWVudClcblxuICAgICAgICBpZiAodGhpcy5wYWNrLnBhdGgpIHtcbiAgICAgICAgICB0aGlzLmdyYW1tYXJzVmlldyA9IG5ldyBQYWNrYWdlR3JhbW1hcnNWaWV3KHRoaXMucGFjay5wYXRoKVxuICAgICAgICAgIHRoaXMuc25pcHBldHNWaWV3ID0gbmV3IFBhY2thZ2VTbmlwcGV0c1ZpZXcodGhpcy5wYWNrLCB0aGlzLnNuaXBwZXRzUHJvdmlkZXIpXG4gICAgICAgICAgdGhpcy5yZWZzLnNlY3Rpb25zLmFwcGVuZENoaWxkKHRoaXMuZ3JhbW1hcnNWaWV3LmVsZW1lbnQpXG4gICAgICAgICAgdGhpcy5yZWZzLnNlY3Rpb25zLmFwcGVuZENoaWxkKHRoaXMuc25pcHBldHNWaWV3LmVsZW1lbnQpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlZnMuc3RhcnR1cFRpbWUuaW5uZXJIVE1MID1cbiAgICAgICAgICBgVGhpcyAke3RoaXMudHlwZX0gYWRkZWQgPHNwYW4gY2xhc3M9J2hpZ2hsaWdodCc+JHt0aGlzLmdldFN0YXJ0dXBUaW1lKCl9bXM8L3NwYW4+IHRvIHN0YXJ0dXAgdGltZS5gXG4gICAgICAgIHRoaXMucmVmcy5zdGFydHVwVGltZS5zdHlsZS5kaXNwbGF5ID0gJydcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzb3VyY2VJc0F2YWlsYWJsZSA9IHRoaXMucGFja2FnZU1hbmFnZXIuaXNQYWNrYWdlSW5zdGFsbGVkKHRoaXMucGFjay5uYW1lKSAmJiAhYXRvbS5wYWNrYWdlcy5pc0J1bmRsZWRQYWNrYWdlKHRoaXMucGFjay5uYW1lKVxuICAgIGlmIChzb3VyY2VJc0F2YWlsYWJsZSkge1xuICAgICAgdGhpcy5yZWZzLm9wZW5CdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVmcy5vcGVuQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICB9XG5cbiAgICB0aGlzLnJlbmRlclJlYWRtZSgpXG4gIH1cblxuICByZW5kZXJSZWFkbWUgKCkge1xuICAgIGxldCByZWFkbWVcbiAgICBpZiAodGhpcy5wYWNrLm1ldGFkYXRhLnJlYWRtZSAmJiB0aGlzLnBhY2subWV0YWRhdGEucmVhZG1lLnRyaW0oKSAhPT0gTk9STUFMSVpFX1BBQ0tBR0VfREFUQV9SRUFETUVfRVJST1IpIHtcbiAgICAgIHJlYWRtZSA9IHRoaXMucGFjay5tZXRhZGF0YS5yZWFkbWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmVhZG1lID0gbnVsbFxuICAgIH1cblxuICAgIGlmICh0aGlzLnJlYWRtZVBhdGggJiYgZnMuZXhpc3RzU3luYyh0aGlzLnJlYWRtZVBhdGgpICYmIGZzLnN0YXRTeW5jKHRoaXMucmVhZG1lUGF0aCkuaXNGaWxlKCkgJiYgIXJlYWRtZSkge1xuICAgICAgcmVhZG1lID0gZnMucmVhZEZpbGVTeW5jKHRoaXMucmVhZG1lUGF0aCwge2VuY29kaW5nOiAndXRmOCd9KVxuICAgIH1cblxuICAgIGxldCByZWFkbWVTcmNcblxuICAgIGlmICh0aGlzLnBhY2sucGF0aCkge1xuICAgICAgLy8gSWYgcGFja2FnZSBpcyBpbnN0YWxsZWQsIHVzZSBpbnN0YWxsZWQgcGF0aFxuICAgICAgcmVhZG1lU3JjID0gdGhpcy5wYWNrLnBhdGhcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgcGFja2FnZSBpc24ndCBpbnN0YWxsZWQsIHVzZSB1cmwgcGF0aFxuICAgICAgbGV0IHJlcG9VcmwgPSB0aGlzLnBhY2thZ2VNYW5hZ2VyLmdldFJlcG9zaXRvcnlVcmwodGhpcy5wYWNrKVxuXG4gICAgICAvLyBDaGVjayBpZiBVUkwgaXMgdW5kZWZpbmVkIChpLmUuIHBhY2thZ2UgaXMgdW5wdWJsaXNoZWQpXG4gICAgICBpZiAocmVwb1VybCkge1xuICAgICAgICByZWFkbWVTcmMgPSByZXBvVXJsICsgYC9ibG9iL21hc3Rlci9gXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcmVhZG1lVmlldyA9IG5ldyBQYWNrYWdlUmVhZG1lVmlldyhyZWFkbWUsIHJlYWRtZVNyYylcbiAgICBpZiAodGhpcy5yZWFkbWVWaWV3KSB7XG4gICAgICB0aGlzLnJlYWRtZVZpZXcuZWxlbWVudC5wYXJlbnRFbGVtZW50LnJlcGxhY2VDaGlsZChyZWFkbWVWaWV3LmVsZW1lbnQsIHRoaXMucmVhZG1lVmlldy5lbGVtZW50KVxuICAgICAgdGhpcy5yZWFkbWVWaWV3LmRlc3Ryb3koKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlZnMuc2VjdGlvbnMuYXBwZW5kQ2hpbGQocmVhZG1lVmlldy5lbGVtZW50KVxuICAgIH1cbiAgICB0aGlzLnJlYWRtZVZpZXcgPSByZWFkbWVWaWV3XG4gIH1cblxuICBzdWJzY3JpYmVUb1BhY2thZ2VNYW5hZ2VyICgpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0aGlzLnBhY2thZ2VNYW5hZ2VyLm9uKCd0aGVtZS1pbnN0YWxsZWQgcGFja2FnZS1pbnN0YWxsZWQnLCAoe3BhY2t9KSA9PiB7XG4gICAgICBpZiAodGhpcy5wYWNrLm5hbWUgPT09IHBhY2submFtZSkge1xuICAgICAgICB0aGlzLmxvYWRQYWNrYWdlKClcbiAgICAgICAgdGhpcy51cGRhdGVJbnN0YWxsZWRTdGF0ZSgpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0aGlzLnBhY2thZ2VNYW5hZ2VyLm9uKCd0aGVtZS11bmluc3RhbGxlZCBwYWNrYWdlLXVuaW5zdGFsbGVkJywgKHtwYWNrfSkgPT4ge1xuICAgICAgaWYgKHRoaXMucGFjay5uYW1lID09PSBwYWNrLm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlSW5zdGFsbGVkU3RhdGUoKVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5wYWNrYWdlTWFuYWdlci5vbigndGhlbWUtdXBkYXRlZCBwYWNrYWdlLXVwZGF0ZWQnLCAoe3BhY2t9KSA9PiB7XG4gICAgICBpZiAodGhpcy5wYWNrLm5hbWUgPT09IHBhY2submFtZSkge1xuICAgICAgICB0aGlzLmxvYWRQYWNrYWdlKClcbiAgICAgICAgdGhpcy51cGRhdGVGaWxlQnV0dG9ucygpXG4gICAgICAgIHRoaXMucG9wdWxhdGUoKVxuICAgICAgfVxuICAgIH0pKVxuICB9XG5cbiAgb3Blbk1hcmtkb3duRmlsZSAocGF0aCkge1xuICAgIGlmIChhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZSgnbWFya2Rvd24tcHJldmlldycpKSB7XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGVuY29kZVVSSShgbWFya2Rvd24tcHJldmlldzovLyR7cGF0aH1gKSlcbiAgICB9IGVsc2Uge1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoKVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUZpbGVCdXR0b25zICgpIHtcbiAgICB0aGlzLmNoYW5nZWxvZ1BhdGggPSBudWxsXG4gICAgdGhpcy5saWNlbnNlUGF0aCA9IG51bGxcbiAgICB0aGlzLnJlYWRtZVBhdGggPSBudWxsXG5cbiAgICBjb25zdCBwYWNrYWdlUGF0aCA9IHRoaXMucGFjay5wYXRoICE9IG51bGwgPyB0aGlzLnBhY2sucGF0aCA6IGF0b20ucGFja2FnZXMucmVzb2x2ZVBhY2thZ2VQYXRoKHRoaXMucGFjay5uYW1lKVxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZnMubGlzdFN5bmMocGFja2FnZVBhdGgpKSB7XG4gICAgICBzd2l0Y2ggKHBhdGguYmFzZW5hbWUoY2hpbGQsIHBhdGguZXh0bmFtZShjaGlsZCkpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAnY2hhbmdlbG9nJzpcbiAgICAgICAgY2FzZSAnaGlzdG9yeSc6XG4gICAgICAgICAgdGhpcy5jaGFuZ2Vsb2dQYXRoID0gY2hpbGRcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdsaWNlbnNlJzpcbiAgICAgICAgY2FzZSAnbGljZW5jZSc6XG4gICAgICAgICAgdGhpcy5saWNlbnNlUGF0aCA9IGNoaWxkXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAncmVhZG1lJzpcbiAgICAgICAgICB0aGlzLnJlYWRtZVBhdGggPSBjaGlsZFxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnJlYWRtZVBhdGggJiYgdGhpcy5jaGFuZ2Vsb2dQYXRoICYmIHRoaXMubGljZW5zZVBhdGgpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2Vsb2dQYXRoKSB7XG4gICAgICB0aGlzLnJlZnMuY2hhbmdlbG9nQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlZnMuY2hhbmdlbG9nQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICB9XG5cbiAgICBpZiAodGhpcy5saWNlbnNlUGF0aCkge1xuICAgICAgdGhpcy5yZWZzLmxpY2Vuc2VCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVmcy5saWNlbnNlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICB9XG4gIH1cblxuICBnZXRTdGFydHVwVGltZSAoKSB7XG4gICAgY29uc3QgbG9hZFRpbWUgPSB0aGlzLnBhY2subG9hZFRpbWUgIT0gbnVsbCA/IHRoaXMucGFjay5sb2FkVGltZSA6IDBcbiAgICBjb25zdCBhY3RpdmF0ZVRpbWUgPSB0aGlzLnBhY2suYWN0aXZhdGVUaW1lICE9IG51bGwgPyB0aGlzLnBhY2suYWN0aXZhdGVUaW1lIDogMFxuICAgIHJldHVybiBsb2FkVGltZSArIGFjdGl2YXRlVGltZVxuICB9XG5cbiAgc2Nyb2xsVXAgKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgLT0gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQgLyAyMFxuICB9XG5cbiAgc2Nyb2xsRG93biAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCArPSBkb2N1bWVudC5ib2R5Lm9mZnNldEhlaWdodCAvIDIwXG4gIH1cblxuICBwYWdlVXAgKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgLT0gdGhpcy5lbGVtZW50Lm9mZnNldEhlaWdodFxuICB9XG5cbiAgcGFnZURvd24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgKz0gdGhpcy5lbGVtZW50Lm9mZnNldEhlaWdodFxuICB9XG5cbiAgc2Nyb2xsVG9Ub3AgKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgPSAwXG4gIH1cblxuICBzY3JvbGxUb0JvdHRvbSAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCA9IHRoaXMuZWxlbWVudC5zY3JvbGxIZWlnaHRcbiAgfVxufVxuXG5jbGFzcyBQYWNrYWdlQ2FyZENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yIChwcm9wcykge1xuICAgIHRoaXMucGFja2FnZUNhcmQgPSBuZXcgUGFja2FnZUNhcmQocHJvcHMubWV0YWRhdGEsIHByb3BzLnNldHRpbmdzVmlldywgcHJvcHMucGFja2FnZU1hbmFnZXIsIHByb3BzLm9wdGlvbnMpXG4gICAgdGhpcy5lbGVtZW50ID0gdGhpcy5wYWNrYWdlQ2FyZC5lbGVtZW50XG4gIH1cblxuICB1cGRhdGUgKCkge31cblxuICBkZXN0cm95ICgpIHt9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUdBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQTRDO0FBakI1QztBQUNBOztBQWtCQSxNQUFNQSxtQ0FBbUMsR0FBRyw4QkFBOEI7QUFFM0QsTUFBTUMsaUJBQWlCLENBQUM7RUFDckNDLFdBQVcsQ0FBRUMsSUFBSSxFQUFFQyxZQUFZLEVBQUVDLGNBQWMsRUFBRUMsZ0JBQWdCLEVBQUU7SUFDakUsSUFBSSxDQUFDSCxJQUFJLEdBQUdBLElBQUk7SUFDaEIsSUFBSSxDQUFDQyxZQUFZLEdBQUdBLFlBQVk7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