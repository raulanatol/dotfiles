"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _atom = require("atom");
var _electron = require("electron");
var _etch = _interopRequireDefault(require("etch"));
var _utils = require("./utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */
/** @jsx etch.dom */

let marked = null;
class PackageCard {
  constructor(pack, settingsView, packageManager, options = {}) {
    this.pack = pack;
    this.settingsView = settingsView;
    this.packageManager = packageManager;
    this.disposables = new _atom.CompositeDisposable();

    // It might be useful to either wrap this.pack in a class that has a
    // ::validate method, or add a method here. At the moment I think all cases
    // of malformed package metadata are handled here and in ::content but belt
    // and suspenders, you know
    this.client = this.packageManager.getClient();
    this.type = this.pack.theme ? 'theme' : 'package';
    this.name = this.pack.name;
    this.onSettingsView = options.onSettingsView;
    if (this.pack.latestVersion !== this.pack.version) {
      this.newVersion = this.pack.latestVersion;
    }
    if (this.pack.apmInstallSource && this.pack.apmInstallSource.type === 'git') {
      if (this.pack.apmInstallSource.sha !== this.pack.latestSha) {
        this.newSha = this.pack.latestSha;
      }
    }

    // Default to displaying the download count
    if (!options.stats) {
      options.stats = {
        downloads: true
      };
    }
    _etch.default.initialize(this);
    this.displayStats(options);
    this.handlePackageEvents();
    this.handleButtonEvents(options);
    this.loadCachedMetadata();

    // themes have no status and cannot be dis/enabled
    if (this.type === 'theme') {
      this.refs.statusIndicator.remove();
      this.refs.enablementButton.remove();
    }
    if (atom.packages.isBundledPackage(this.pack.name)) {
      this.refs.installButtonGroup.remove();
      this.refs.uninstallButton.remove();
    }
    if (!this.newVersion && !this.newSha) {
      this.refs.updateButtonGroup.style.display = 'none';
    }
    this.hasCompatibleVersion = true;
    this.updateInterfaceState();
  }
  render() {
    const displayName = (this.pack.gitUrlInfo ? this.pack.gitUrlInfo.project : this.pack.name) || '';
    const owner = (0, _utils.ownerFromRepository)(this.pack.repository);
    const description = this.pack.description || '';
    return _etch.default.dom("div", {
      className: "package-card col-lg-8"
    }, _etch.default.dom("div", {
      ref: "statsContainer",
      className: "stats pull-right"
    }, _etch.default.dom("span", {
      ref: "packageStars",
      className: "stats-item"
    }, _etch.default.dom("span", {
      ref: "stargazerIcon",
      className: "icon icon-star"
    }), _etch.default.dom("span", {
      ref: "stargazerCount",
      className: "value"
    })), _etch.default.dom("span", {
      ref: "packageDownloads",
      className: "stats-item"
    }, _etch.default.dom("span", {
      ref: "downloadIcon",
      className: "icon icon-cloud-download"
    }), _etch.default.dom("span", {
      ref: "downloadCount",
      className: "value"
    }))), _etch.default.dom("div", {
      className: "body"
    }, _etch.default.dom("h4", {
      className: "card-name"
    }, _etch.default.dom("a", {
      className: "package-name",
      ref: "packageName"
    }, displayName), _etch.default.dom("span", {
      className: "package-version"
    }, _etch.default.dom("span", {
      ref: "versionValue",
      className: "value"
    }, String(this.pack.version)))), _etch.default.dom("span", {
      ref: "packageDescription",
      className: "package-description"
    }, description), _etch.default.dom("div", {
      ref: "packageMessage",
      className: "package-message"
    })), _etch.default.dom("div", {
      className: "meta"
    }, _etch.default.dom("div", {
      ref: "metaUserContainer",
      className: "meta-user"
    }, _etch.default.dom("a", {
      ref: "avatarLink"
    }, _etch.default.dom("img", {
      ref: "avatar",
      className: "avatar",
      src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    })), _etch.default.dom("a", {
      ref: "loginLink",
      className: "author"
    }, owner)), _etch.default.dom("div", {
      className: "meta-controls"
    }, _etch.default.dom("div", {
      className: "btn-toolbar"
    }, _etch.default.dom("div", {
      ref: "updateButtonGroup",
      className: "btn-group"
    }, _etch.default.dom("button", {
      type: "button",
      className: "btn btn-info icon icon-cloud-download install-button",
      ref: "updateButton"
    }, "Update")), _etch.default.dom("div", {
      ref: "installAlternativeButtonGroup",
      className: "btn-group"
    }, _etch.default.dom("button", {
      type: "button",
      className: "btn btn-info icon icon-cloud-download install-button",
      ref: "installAlternativeButton"
    }, "Install Alternative")), _etch.default.dom("div", {
      ref: "installButtonGroup",
      className: "btn-group"
    }, _etch.default.dom("button", {
      type: "button",
      className: "btn btn-info icon icon-cloud-download install-button",
      ref: "installButton"
    }, "Install")), _etch.default.dom("div", {
      ref: "packageActionButtonGroup",
      className: "btn-group"
    }, _etch.default.dom("button", {
      type: "button",
      className: "btn icon icon-gear settings",
      ref: "settingsButton"
    }, "Settings"), _etch.default.dom("button", {
      type: "button",
      className: "btn icon icon-trashcan uninstall-button",
      ref: "uninstallButton"
    }, "Uninstall"), _etch.default.dom("button", {
      type: "button",
      className: "btn icon icon-playback-pause enablement",
      ref: "enablementButton"
    }, _etch.default.dom("span", {
      className: "disable-text"
    }, "Disable")), _etch.default.dom("button", {
      type: "button",
      className: "btn status-indicator",
      tabIndex: "-1",
      ref: "statusIndicator"
    }))))));
  }
  locateCompatiblePackageVersion(callback) {
    this.packageManager.loadCompatiblePackageVersion(this.pack.name, (err, pack) => {
      if (err != null) {
        console.error(err);
      }
      const packageVersion = pack.version;

      // A compatible version exist, we activate the install button and
      // set this.installablePack so that the install action installs the
      // compatible version of the package.
      if (packageVersion) {
        this.refs.versionValue.textContent = packageVersion;
        if (packageVersion !== this.pack.version) {
          this.refs.versionValue.classList.add('text-warning');
          this.refs.packageMessage.classList.add('text-warning');
          this.refs.packageMessage.textContent = `Version ${packageVersion} is not the latest version available for this package, but it's the latest that is compatible with your version of Atom.`;
        }
        this.installablePack = pack;
        this.hasCompatibleVersion = true;
      } else {
        this.hasCompatibleVersion = false;
        this.refs.versionValue.classList.add('text-error');
        this.refs.packageMessage.classList.add('text-error');
        this.refs.packageMessage.insertAdjacentText('beforeend', `There's no version of this package that is compatible with your Atom version. The version must satisfy ${this.pack.engines.atom}.`);
        console.error(`No available version compatible with the installed Atom version: ${atom.getVersion()}`);
      }
      callback();
    });
  }
  handleButtonEvents(options) {
    if (options && options.onSettingsView) {
      this.refs.settingsButton.style.display = 'none';
    } else {
      const clickHandler = event => {
        event.stopPropagation();
        this.settingsView.showPanel(this.pack.name, {
          back: options ? options.back : null,
          pack: this.pack
        });
      };
      this.element.addEventListener('click', clickHandler);
      this.disposables.add(new _atom.Disposable(() => {
        this.element.removeEventListener('click', clickHandler);
      }));
      this.refs.settingsButton.addEventListener('click', clickHandler);
      this.disposables.add(new _atom.Disposable(() => {
        this.refs.settingsButton.removeEventListener('click', clickHandler);
      }));
    }
    const installButtonClickHandler = event => {
      event.stopPropagation();
      this.install();
    };
    this.refs.installButton.addEventListener('click', installButtonClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.installButton.removeEventListener('click', installButtonClickHandler);
    }));
    const uninstallButtonClickHandler = event => {
      event.stopPropagation();
      this.uninstall();
    };
    this.refs.uninstallButton.addEventListener('click', uninstallButtonClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.uninstallButton.removeEventListener('click', uninstallButtonClickHandler);
    }));
    const installAlternativeButtonClickHandler = event => {
      event.stopPropagation();
      this.installAlternative();
    };
    this.refs.installAlternativeButton.addEventListener('click', installAlternativeButtonClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.installAlternativeButton.removeEventListener('click', installAlternativeButtonClickHandler);
    }));
    const updateButtonClickHandler = event => {
      event.stopPropagation();
      this.update().then(() => {
        let oldVersion = '';
        let newVersion = '';
        if (this.pack.apmInstallSource && this.pack.apmInstallSource.type === 'git') {
          oldVersion = this.pack.apmInstallSource.sha.substr(0, 8);
          newVersion = `${this.pack.latestSha.substr(0, 8)}`;
        } else if (this.pack.version && this.pack.latestVersion) {
          oldVersion = this.pack.version;
          newVersion = this.pack.latestVersion;
        }
        let detail = '';
        if (oldVersion && newVersion) {
          detail = `${oldVersion} -> ${newVersion}`;
        }
        const notification = atom.notifications.addSuccess(`Restart Atom to complete the update of \`${this.pack.name}\`.`, {
          dismissable: true,
          buttons: [{
            text: 'Restart now',
            onDidClick() {
              return atom.restartApplication();
            }
          }, {
            text: 'I\'ll do it later',
            onDidClick() {
              notification.dismiss();
            }
          }],
          detail
        });
      });
    };
    this.refs.updateButton.addEventListener('click', updateButtonClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.updateButton.removeEventListener('click', updateButtonClickHandler);
    }));
    const packageNameClickHandler = event => {
      event.stopPropagation();
      _electron.shell.openExternal(`https://web.pulsar-edit.dev/packages/${this.pack.name}`);
    };
    this.refs.packageName.addEventListener('click', packageNameClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.packageName.removeEventListener('click', packageNameClickHandler);
    }));
    const packageAuthorClickHandler = event => {
      event.stopPropagation();
      _electron.shell.openExternal(`https://pulsar-edit.dev/users/${(0, _utils.ownerFromRepository)(this.pack.repository)}`);
    };
    this.refs.loginLink.addEventListener('click', packageAuthorClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.loginLink.removeEventListener('click', packageAuthorClickHandler);
    }));
    this.refs.avatarLink.addEventListener('click', packageAuthorClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.avatarLink.removeEventListener('click', packageAuthorClickHandler);
    }));
    const enablementButtonClickHandler = event => {
      event.stopPropagation();
      event.preventDefault();
      if (this.isDisabled()) {
        atom.packages.enablePackage(this.pack.name);
      } else {
        atom.packages.disablePackage(this.pack.name);
      }
    };
    this.refs.enablementButton.addEventListener('click', enablementButtonClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.enablementButton.removeEventListener('click', enablementButtonClickHandler);
    }));
    const packageMessageClickHandler = event => {
      const target = event.target.closest('a');
      if (target) {
        event.stopPropagation();
        event.preventDefault();
        if (target.href && target.href.startsWith('atom:')) {
          atom.workspace.open(target.href);
        }
      }
    };
    this.refs.packageMessage.addEventListener('click', packageMessageClickHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.packageMessage.removeEventListener('click', packageMessageClickHandler);
    }));
  }
  destroy() {
    this.disposables.dispose();
    return _etch.default.destroy(this);
  }
  loadCachedMetadata() {
    this.client.avatar((0, _utils.ownerFromRepository)(this.pack.repository), (err, avatarPath) => {
      if (!err && avatarPath) {
        this.refs.avatar.src = `file://${avatarPath}`;
      }
    });
    this.client.package(this.pack.name, (err, data) => {
      // We don't need to actually handle the error here, we can just skip
      // showing the download count if there's a problem.
      if (!err) {
        if (data == null) {
          data = {};
        }
        if (this.pack.apmInstallSource && this.pack.apmInstallSource.type === 'git') {
          this.refs.downloadIcon.classList.remove('icon-cloud-download');
          this.refs.downloadIcon.classList.add('icon-git-branch');
          this.refs.downloadCount.textContent = this.pack.apmInstallSource.sha.substr(0, 8);
        } else {
          this.refs.stargazerCount.textContent = data.stargazers_count ? data.stargazers_count.toLocaleString() : '';
          this.refs.downloadCount.textContent = data.downloads ? data.downloads.toLocaleString() : '';
        }
      }
    });
  }
  updateInterfaceState() {
    this.refs.versionValue.textContent = (this.installablePack ? this.installablePack.version : null) || this.pack.version;
    if (this.pack.apmInstallSource && this.pack.apmInstallSource.type === 'git') {
      this.refs.downloadCount.textContent = this.pack.apmInstallSource.sha.substr(0, 8);
    }
    this.updateSettingsState();
    this.updateInstalledState();
    this.updateDisabledState();
  }
  updateSettingsState() {
    if (this.hasSettings() && !this.onSettingsView) {
      this.refs.settingsButton.style.display = '';
    } else {
      this.refs.settingsButton.style.display = 'none';
    }
  }

  // Section: disabled state updates

  updateDisabledState() {
    if (this.isDisabled()) {
      this.displayDisabledState();
    } else if (this.element.classList.contains('disabled')) {
      this.displayEnabledState();
    }
  }
  displayEnabledState() {
    this.element.classList.remove('disabled');
    if (this.type === 'theme') {
      this.refs.enablementButton.style.display = 'none';
    }
    this.refs.enablementButton.querySelector('.disable-text').textContent = 'Disable';
    this.refs.enablementButton.classList.add('icon-playback-pause');
    this.refs.enablementButton.classList.remove('icon-playback-play');
    this.refs.statusIndicator.classList.remove('is-disabled');
  }
  displayDisabledState() {
    this.element.classList.add('disabled');
    this.refs.enablementButton.querySelector('.disable-text').textContent = 'Enable';
    this.refs.enablementButton.classList.add('icon-playback-play');
    this.refs.enablementButton.classList.remove('icon-playback-pause');
    this.refs.statusIndicator.classList.add('is-disabled');
    this.refs.enablementButton.disabled = false;
  }

  // Section: installed state updates

  updateInstalledState() {
    if (this.isInstalled()) {
      this.displayInstalledState();
    } else {
      this.displayNotInstalledState();
    }
  }
  displayInstalledState() {
    if (this.newVersion || this.newSha) {
      this.refs.updateButtonGroup.style.display = '';
      if (this.newVersion) {
        this.refs.updateButton.textContent = `Update to ${this.newVersion}`;
      } else if (this.newSha) {
        this.refs.updateButton.textContent = `Update to ${this.newSha.substr(0, 8)}`;
      }
    } else {
      this.refs.updateButtonGroup.style.display = 'none';
    }
    this.refs.installButtonGroup.style.display = 'none';
    this.refs.installAlternativeButtonGroup.style.display = 'none';
    this.refs.packageActionButtonGroup.style.display = '';
    this.refs.uninstallButton.style.display = '';
  }
  displayNotInstalledState() {
    this.refs.uninstallButton.style.display = 'none';
    const atomVersion = this.packageManager.normalizeVersion(atom.getVersion());
    if (!this.packageManager.satisfiesVersion(atomVersion, this.pack)) {
      this.hasCompatibleVersion = false;
      this.setNotInstalledStateButtons();
      this.locateCompatiblePackageVersion(() => {
        this.setNotInstalledStateButtons();
      });
    } else {
      this.setNotInstalledStateButtons();
    }
  }
  setNotInstalledStateButtons() {
    if (!this.hasCompatibleVersion) {
      this.refs.installButtonGroup.style.display = 'none';
      this.refs.updateButtonGroup.style.display = 'none';
    } else if (this.newVersion || this.newSha) {
      this.refs.updateButtonGroup.style.display = '';
      this.refs.installButtonGroup.style.display = 'none';
    } else {
      this.refs.updateButtonGroup.style.display = 'none';
      this.refs.installButtonGroup.style.display = '';
    }
    this.refs.installAlternativeButtonGroup.style.display = 'none';
    this.refs.packageActionButtonGroup.style.display = 'none';
  }
  displayStats(options) {
    if (options && options.stats && options.stats.downloads) {
      this.refs.packageDownloads.style.display = '';
    } else {
      this.refs.packageDownloads.style.display = 'none';
    }
    if (options && options.stats && options.stats.stars) {
      this.refs.packageStars.style.display = '';
    } else {
      this.refs.packageStars.style.display = 'none';
    }
  }
  displayGitPackageInstallInformation() {
    this.refs.metaUserContainer.remove();
    this.refs.statsContainer.remove();
    const {
      gitUrlInfo
    } = this.pack;
    if (gitUrlInfo.default === 'shortcut') {
      this.refs.packageDescription.textContent = gitUrlInfo.https();
    } else {
      this.refs.packageDescription.textContent = gitUrlInfo.toString();
    }
    this.refs.installButton.classList.remove('icon-cloud-download');
    this.refs.installButton.classList.add('icon-git-commit');
    this.refs.updateButton.classList.remove('icon-cloud-download');
    this.refs.updateButton.classList.add('icon-git-commit');
  }
  displayAvailableUpdate(newVersion) {
    this.newVersion = newVersion;
    this.updateInterfaceState();
  }
  handlePackageEvents() {
    this.disposables.add(atom.packages.onDidDeactivatePackage(pack => {
      if (pack.name === this.pack.name) {
        this.updateDisabledState();
      }
    }));
    this.disposables.add(atom.packages.onDidActivatePackage(pack => {
      if (pack.name === this.pack.name) {
        this.updateDisabledState();
      }
    }));
    this.disposables.add(atom.config.onDidChange('core.disabledPackages', () => {
      this.updateDisabledState();
    }));
    this.subscribeToPackageEvent('package-installing theme-installing', () => {
      this.updateInterfaceState();
      this.refs.installButton.disabled = true;
      this.refs.installButton.classList.add('is-installing');
    });
    this.subscribeToPackageEvent('package-updating theme-updating', () => {
      this.updateInterfaceState();
      this.refs.updateButton.disabled = true;
      this.refs.updateButton.classList.add('is-installing');
    });
    this.subscribeToPackageEvent('package-installing-alternative', () => {
      this.updateInterfaceState();
      this.refs.installAlternativeButton.disabled = true;
      this.refs.installAlternativeButton.classList.add('is-installing');
    });
    this.subscribeToPackageEvent('package-uninstalling theme-uninstalling', () => {
      this.updateInterfaceState();
      this.refs.enablementButton.disabled = true;
      this.refs.uninstallButton.disabled = true;
      this.refs.uninstallButton.classList.add('is-uninstalling');
    });
    this.subscribeToPackageEvent('package-installed package-install-failed theme-installed theme-install-failed', () => {
      const loadedPack = atom.packages.getLoadedPackage(this.pack.name);
      const version = loadedPack && loadedPack.metadata ? loadedPack.metadata.version : null;
      if (version) {
        this.pack.version = version;
      }
      this.refs.installButton.disabled = false;
      this.refs.installButton.classList.remove('is-installing');
      this.updateInterfaceState();
    });
    this.subscribeToPackageEvent('package-updated theme-updated', () => {
      const loadedPack = atom.packages.getLoadedPackage(this.pack.name);
      const metadata = loadedPack ? loadedPack.metadata : null;
      if (metadata && metadata.version) {
        this.pack.version = metadata.version;
      }
      if (metadata && metadata.apmInstallSource) {
        this.pack.apmInstallSource = metadata.apmInstallSource;
      }
      this.newVersion = null;
      this.newSha = null;
      this.refs.updateButton.disabled = false;
      this.refs.updateButton.classList.remove('is-installing');
      this.updateInterfaceState();
    });
    this.subscribeToPackageEvent('package-update-failed theme-update-failed', () => {
      this.refs.updateButton.disabled = false;
      this.refs.updateButton.classList.remove('is-installing');
      this.updateInterfaceState();
    });
    this.subscribeToPackageEvent('package-uninstalled package-uninstall-failed theme-uninstalled theme-uninstall-failed', () => {
      this.newVersion = null;
      this.newSha = null;
      this.refs.enablementButton.disabled = false;
      this.refs.uninstallButton.disabled = false;
      this.refs.uninstallButton.classList.remove('is-uninstalling');
      this.updateInterfaceState();
    });
    this.subscribeToPackageEvent('package-installed-alternative package-install-alternative-failed', () => {
      this.refs.installAlternativeButton.disabled = false;
      this.refs.installAlternativeButton.classList.remove('is-installing');
      this.updateInterfaceState();
    });
  }
  isInstalled() {
    return this.packageManager.isPackageInstalled(this.pack.name);
  }
  isDisabled() {
    return atom.packages.isPackageDisabled(this.pack.name);
  }
  hasSettings() {
    return this.packageManager.packageHasSettings(this.pack.name);
  }
  subscribeToPackageEvent(event, callback) {
    this.disposables.add(this.packageManager.on(event, ({
      pack,
      error
    }) => {
      if (pack.pack != null) {
        pack = pack.pack;
      }
      const packageName = pack.name;
      if (packageName === this.pack.name) {
        callback(pack, error);
      }
    }));
  }

  /*
  Section: Methods that should be on a Package model
  */

  install() {
    this.packageManager.install(this.installablePack != null ? this.installablePack : this.pack, error => {
      if (error != null) {
        console.error(`Installing ${this.type} ${this.pack.name} failed`, error.stack != null ? error.stack : error, error.stderr);
      } else {
        // if a package was disabled before installing it, re-enable it
        if (this.isDisabled()) {
          atom.packages.enablePackage(this.pack.name);
        }
      }
    });
  }
  update() {
    if (!this.newVersion && !this.newSha) {
      return Promise.resolve();
    }
    const pack = this.installablePack != null ? this.installablePack : this.pack;
    const version = this.newVersion ? `v${this.newVersion}` : `#${this.newSha.substr(0, 8)}`;
    return new Promise((resolve, reject) => {
      this.packageManager.update(pack, this.newVersion, error => {
        if (error != null) {
          atom.assert(false, 'Package update failed', assertionError => {
            assertionError.metadata = {
              type: this.type,
              name: pack.name,
              version,
              errorMessage: error.message,
              errorStack: error.stack,
              errorStderr: error.stderr
            };
          });
          console.error(`Updating ${this.type} ${pack.name} to ${version} failed:\n`, error, error.stderr != null ? error.stderr : '');
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
  uninstall() {
    this.packageManager.uninstall(this.pack, error => {
      if (error != null) {
        console.error(`Uninstalling ${this.type} ${this.pack.name} failed`, error.stack != null ? error.stack : error, error.stderr);
      }
    });
  }
  installAlternative() {
    return;
  }
}
exports.default = PackageCard;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtYXJrZWQiLCJQYWNrYWdlQ2FyZCIsImNvbnN0cnVjdG9yIiwicGFjayIsInNldHRpbmdzVmlldyIsInBhY2thZ2VNYW5hZ2VyIiwib3B0aW9ucyIsImRpc3Bvc2FibGVzIiwiQ29tcG9zaXRlRGlzcG9zYWJsZSIsImNsaWVudCIsImdldENsaWVudCIsInR5cGUiLCJ0aGVtZSIsIm5hbWUiLCJvblNldHRpbmdzVmlldyIsImxhdGVzdFZlcnNpb24iLCJ2ZXJzaW9uIiwibmV3VmVyc2lvbiIsImFwbUluc3RhbGxTb3VyY2UiLCJzaGEiLCJsYXRlc3RTaGEiLCJuZXdTaGEiLCJzdGF0cyIsImRvd25sb2FkcyIsImV0Y2giLCJpbml0aWFsaXplIiwiZGlzcGxheVN0YXRzIiwiaGFuZGxlUGFja2FnZUV2ZW50cyIsImhhbmRsZUJ1dHRvbkV2ZW50cyIsImxvYWRDYWNoZWRNZXRhZGF0YSIsInJlZnMiLCJzdGF0dXNJbmRpY2F0b3IiLCJyZW1vdmUiLCJlbmFibGVtZW50QnV0dG9uIiwiYXRvbSIsInBhY2thZ2VzIiwiaXNCdW5kbGVkUGFja2FnZSIsImluc3RhbGxCdXR0b25Hcm91cCIsInVuaW5zdGFsbEJ1dHRvbiIsInVwZGF0ZUJ1dHRvbkdyb3VwIiwic3R5bGUiLCJkaXNwbGF5IiwiaGFzQ29tcGF0aWJsZVZlcnNpb24iLCJ1cGRhdGVJbnRlcmZhY2VTdGF0ZSIsInJlbmRlciIsImRpc3BsYXlOYW1lIiwiZ2l0VXJsSW5mbyIsInByb2plY3QiLCJvd25lciIsIm93bmVyRnJvbVJlcG9zaXRvcnkiLCJyZXBvc2l0b3J5IiwiZGVzY3JpcHRpb24iLCJTdHJpbmciLCJsb2NhdGVDb21wYXRpYmxlUGFja2FnZVZlcnNpb24iLCJjYWxsYmFjayIsImxvYWRDb21wYXRpYmxlUGFja2FnZVZlcnNpb24iLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJwYWNrYWdlVmVyc2lvbiIsInZlcnNpb25WYWx1ZSIsInRleHRDb250ZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwicGFja2FnZU1lc3NhZ2UiLCJpbnN0YWxsYWJsZVBhY2siLCJpbnNlcnRBZGphY2VudFRleHQiLCJlbmdpbmVzIiwiZ2V0VmVyc2lvbiIsInNldHRpbmdzQnV0dG9uIiwiY2xpY2tIYW5kbGVyIiwiZXZlbnQiLCJzdG9wUHJvcGFnYXRpb24iLCJzaG93UGFuZWwiLCJiYWNrIiwiZWxlbWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJEaXNwb3NhYmxlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImluc3RhbGxCdXR0b25DbGlja0hhbmRsZXIiLCJpbnN0YWxsIiwiaW5zdGFsbEJ1dHRvbiIsInVuaW5zdGFsbEJ1dHRvbkNsaWNrSGFuZGxlciIsInVuaW5zdGFsbCIsImluc3RhbGxBbHRlcm5hdGl2ZUJ1dHRvbkNsaWNrSGFuZGxlciIsImluc3RhbGxBbHRlcm5hdGl2ZSIsImluc3RhbGxBbHRlcm5hdGl2ZUJ1dHRvbiIsInVwZGF0ZUJ1dHRvbkNsaWNrSGFuZGxlciIsInVwZGF0ZSIsInRoZW4iLCJvbGRWZXJzaW9uIiwic3Vic3RyIiwiZGV0YWlsIiwibm90aWZpY2F0aW9uIiwibm90aWZpY2F0aW9ucyIsImFkZFN1Y2Nlc3MiLCJkaXNtaXNzYWJsZSIsImJ1dHRvbnMiLCJ0ZXh0Iiwib25EaWRDbGljayIsInJlc3RhcnRBcHBsaWNhdGlvbiIsImRpc21pc3MiLCJ1cGRhdGVCdXR0b24iLCJwYWNrYWdlTmFtZUNsaWNrSGFuZGxlciIsInNoZWxsIiwib3BlbkV4dGVybmFsIiwicGFja2FnZU5hbWUiLCJwYWNrYWdlQXV0aG9yQ2xpY2tIYW5kbGVyIiwibG9naW5MaW5rIiwiYXZhdGFyTGluayIsImVuYWJsZW1lbnRCdXR0b25DbGlja0hhbmRsZXIiLCJwcmV2ZW50RGVmYXVsdCIsImlzRGlzYWJsZWQiLCJlbmFibGVQYWNrYWdlIiwiZGlzYWJsZVBhY2thZ2UiLCJwYWNrYWdlTWVzc2FnZUNsaWNrSGFuZGxlciIsInRhcmdldCIsImNsb3Nlc3QiLCJocmVmIiwic3RhcnRzV2l0aCIsIndvcmtzcGFjZSIsIm9wZW4iLCJkZXN0cm95IiwiZGlzcG9zZSIsImF2YXRhciIsImF2YXRhclBhdGgiLCJzcmMiLCJwYWNrYWdlIiwiZGF0YSIsImRvd25sb2FkSWNvbiIsImRvd25sb2FkQ291bnQiLCJzdGFyZ2F6ZXJDb3VudCIsInN0YXJnYXplcnNfY291bnQiLCJ0b0xvY2FsZVN0cmluZyIsInVwZGF0ZVNldHRpbmdzU3RhdGUiLCJ1cGRhdGVJbnN0YWxsZWRTdGF0ZSIsInVwZGF0ZURpc2FibGVkU3RhdGUiLCJoYXNTZXR0aW5ncyIsImRpc3BsYXlEaXNhYmxlZFN0YXRlIiwiY29udGFpbnMiLCJkaXNwbGF5RW5hYmxlZFN0YXRlIiwicXVlcnlTZWxlY3RvciIsImRpc2FibGVkIiwiaXNJbnN0YWxsZWQiLCJkaXNwbGF5SW5zdGFsbGVkU3RhdGUiLCJkaXNwbGF5Tm90SW5zdGFsbGVkU3RhdGUiLCJpbnN0YWxsQWx0ZXJuYXRpdmVCdXR0b25Hcm91cCIsInBhY2thZ2VBY3Rpb25CdXR0b25Hcm91cCIsImF0b21WZXJzaW9uIiwibm9ybWFsaXplVmVyc2lvbiIsInNhdGlzZmllc1ZlcnNpb24iLCJzZXROb3RJbnN0YWxsZWRTdGF0ZUJ1dHRvbnMiLCJwYWNrYWdlRG93bmxvYWRzIiwic3RhcnMiLCJwYWNrYWdlU3RhcnMiLCJkaXNwbGF5R2l0UGFja2FnZUluc3RhbGxJbmZvcm1hdGlvbiIsIm1ldGFVc2VyQ29udGFpbmVyIiwic3RhdHNDb250YWluZXIiLCJkZWZhdWx0IiwicGFja2FnZURlc2NyaXB0aW9uIiwiaHR0cHMiLCJ0b1N0cmluZyIsImRpc3BsYXlBdmFpbGFibGVVcGRhdGUiLCJvbkRpZERlYWN0aXZhdGVQYWNrYWdlIiwib25EaWRBY3RpdmF0ZVBhY2thZ2UiLCJjb25maWciLCJvbkRpZENoYW5nZSIsInN1YnNjcmliZVRvUGFja2FnZUV2ZW50IiwibG9hZGVkUGFjayIsImdldExvYWRlZFBhY2thZ2UiLCJtZXRhZGF0YSIsImlzUGFja2FnZUluc3RhbGxlZCIsImlzUGFja2FnZURpc2FibGVkIiwicGFja2FnZUhhc1NldHRpbmdzIiwib24iLCJzdGFjayIsInN0ZGVyciIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiYXNzZXJ0IiwiYXNzZXJ0aW9uRXJyb3IiLCJlcnJvck1lc3NhZ2UiLCJtZXNzYWdlIiwiZXJyb3JTdGFjayIsImVycm9yU3RkZXJyIl0sInNvdXJjZXMiOlsicGFja2FnZS1jYXJkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cbi8qKiBAanN4IGV0Y2guZG9tICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCB7c2hlbGx9IGZyb20gJ2VsZWN0cm9uJ1xuaW1wb3J0IGV0Y2ggZnJvbSAnZXRjaCdcblxuaW1wb3J0IHtvd25lckZyb21SZXBvc2l0b3J5fSBmcm9tICcuL3V0aWxzJ1xuXG5sZXQgbWFya2VkID0gbnVsbFxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYWNrYWdlQ2FyZCB7XG4gIGNvbnN0cnVjdG9yIChwYWNrLCBzZXR0aW5nc1ZpZXcsIHBhY2thZ2VNYW5hZ2VyLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnBhY2sgPSBwYWNrXG4gICAgdGhpcy5zZXR0aW5nc1ZpZXcgPSBzZXR0aW5nc1ZpZXdcbiAgICB0aGlzLnBhY2thZ2VNYW5hZ2VyID0gcGFja2FnZU1hbmFnZXJcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgLy8gSXQgbWlnaHQgYmUgdXNlZnVsIHRvIGVpdGhlciB3cmFwIHRoaXMucGFjayBpbiBhIGNsYXNzIHRoYXQgaGFzIGFcbiAgICAvLyA6OnZhbGlkYXRlIG1ldGhvZCwgb3IgYWRkIGEgbWV0aG9kIGhlcmUuIEF0IHRoZSBtb21lbnQgSSB0aGluayBhbGwgY2FzZXNcbiAgICAvLyBvZiBtYWxmb3JtZWQgcGFja2FnZSBtZXRhZGF0YSBhcmUgaGFuZGxlZCBoZXJlIGFuZCBpbiA6OmNvbnRlbnQgYnV0IGJlbHRcbiAgICAvLyBhbmQgc3VzcGVuZGVycywgeW91IGtub3dcbiAgICB0aGlzLmNsaWVudCA9IHRoaXMucGFja2FnZU1hbmFnZXIuZ2V0Q2xpZW50KClcbiAgICB0aGlzLnR5cGUgPSB0aGlzLnBhY2sudGhlbWUgPyAndGhlbWUnIDogJ3BhY2thZ2UnXG4gICAgdGhpcy5uYW1lID0gdGhpcy5wYWNrLm5hbWVcbiAgICB0aGlzLm9uU2V0dGluZ3NWaWV3ID0gb3B0aW9ucy5vblNldHRpbmdzVmlld1xuXG4gICAgaWYgKHRoaXMucGFjay5sYXRlc3RWZXJzaW9uICE9PSB0aGlzLnBhY2sudmVyc2lvbikge1xuICAgICAgdGhpcy5uZXdWZXJzaW9uID0gdGhpcy5wYWNrLmxhdGVzdFZlcnNpb25cbiAgICB9XG5cbiAgICBpZiAodGhpcy5wYWNrLmFwbUluc3RhbGxTb3VyY2UgJiYgdGhpcy5wYWNrLmFwbUluc3RhbGxTb3VyY2UudHlwZSA9PT0gJ2dpdCcpIHtcbiAgICAgIGlmICh0aGlzLnBhY2suYXBtSW5zdGFsbFNvdXJjZS5zaGEgIT09IHRoaXMucGFjay5sYXRlc3RTaGEpIHtcbiAgICAgICAgdGhpcy5uZXdTaGEgPSB0aGlzLnBhY2subGF0ZXN0U2hhXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCB0byBkaXNwbGF5aW5nIHRoZSBkb3dubG9hZCBjb3VudFxuICAgIGlmICghb3B0aW9ucy5zdGF0cykge1xuICAgICAgb3B0aW9ucy5zdGF0cyA9IHtkb3dubG9hZHM6IHRydWV9XG4gICAgfVxuXG4gICAgZXRjaC5pbml0aWFsaXplKHRoaXMpXG5cbiAgICB0aGlzLmRpc3BsYXlTdGF0cyhvcHRpb25zKVxuICAgIHRoaXMuaGFuZGxlUGFja2FnZUV2ZW50cygpXG4gICAgdGhpcy5oYW5kbGVCdXR0b25FdmVudHMob3B0aW9ucylcbiAgICB0aGlzLmxvYWRDYWNoZWRNZXRhZGF0YSgpXG5cbiAgICAvLyB0aGVtZXMgaGF2ZSBubyBzdGF0dXMgYW5kIGNhbm5vdCBiZSBkaXMvZW5hYmxlZFxuICAgIGlmICh0aGlzLnR5cGUgPT09ICd0aGVtZScpIHtcbiAgICAgIHRoaXMucmVmcy5zdGF0dXNJbmRpY2F0b3IucmVtb3ZlKClcbiAgICAgIHRoaXMucmVmcy5lbmFibGVtZW50QnV0dG9uLnJlbW92ZSgpXG4gICAgfVxuXG4gICAgaWYgKGF0b20ucGFja2FnZXMuaXNCdW5kbGVkUGFja2FnZSh0aGlzLnBhY2submFtZSkpIHtcbiAgICAgIHRoaXMucmVmcy5pbnN0YWxsQnV0dG9uR3JvdXAucmVtb3ZlKClcbiAgICAgIHRoaXMucmVmcy51bmluc3RhbGxCdXR0b24ucmVtb3ZlKClcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMubmV3VmVyc2lvbiAmJiAhdGhpcy5uZXdTaGEpIHtcbiAgICAgIHRoaXMucmVmcy51cGRhdGVCdXR0b25Hcm91cC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgfVxuXG4gICAgdGhpcy5oYXNDb21wYXRpYmxlVmVyc2lvbiA9IHRydWVcbiAgICB0aGlzLnVwZGF0ZUludGVyZmFjZVN0YXRlKClcbiAgfVxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgZGlzcGxheU5hbWUgPSAodGhpcy5wYWNrLmdpdFVybEluZm8gPyB0aGlzLnBhY2suZ2l0VXJsSW5mby5wcm9qZWN0IDogdGhpcy5wYWNrLm5hbWUpIHx8ICcnXG4gICAgY29uc3Qgb3duZXIgPSBvd25lckZyb21SZXBvc2l0b3J5KHRoaXMucGFjay5yZXBvc2l0b3J5KVxuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gdGhpcy5wYWNrLmRlc2NyaXB0aW9uIHx8ICcnXG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9J3BhY2thZ2UtY2FyZCBjb2wtbGctOCc+XG4gICAgICAgIDxkaXYgcmVmPSdzdGF0c0NvbnRhaW5lcicgY2xhc3NOYW1lPSdzdGF0cyBwdWxsLXJpZ2h0Jz5cbiAgICAgICAgICA8c3BhbiByZWY9J3BhY2thZ2VTdGFycycgY2xhc3NOYW1lPSdzdGF0cy1pdGVtJz5cbiAgICAgICAgICAgIDxzcGFuIHJlZj0nc3RhcmdhemVySWNvbicgY2xhc3NOYW1lPSdpY29uIGljb24tc3RhcicgLz5cbiAgICAgICAgICAgIDxzcGFuIHJlZj0nc3RhcmdhemVyQ291bnQnIGNsYXNzTmFtZT0ndmFsdWUnIC8+XG4gICAgICAgICAgPC9zcGFuPlxuXG4gICAgICAgICAgPHNwYW4gcmVmPSdwYWNrYWdlRG93bmxvYWRzJyBjbGFzc05hbWU9J3N0YXRzLWl0ZW0nPlxuICAgICAgICAgICAgPHNwYW4gcmVmPSdkb3dubG9hZEljb24nIGNsYXNzTmFtZT0naWNvbiBpY29uLWNsb3VkLWRvd25sb2FkJyAvPlxuICAgICAgICAgICAgPHNwYW4gcmVmPSdkb3dubG9hZENvdW50JyBjbGFzc05hbWU9J3ZhbHVlJyAvPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J2JvZHknPlxuICAgICAgICAgIDxoNCBjbGFzc05hbWU9J2NhcmQtbmFtZSc+XG4gICAgICAgICAgICA8YSBjbGFzc05hbWU9J3BhY2thZ2UtbmFtZScgcmVmPSdwYWNrYWdlTmFtZSc+e2Rpc3BsYXlOYW1lfTwvYT5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0ncGFja2FnZS12ZXJzaW9uJz5cbiAgICAgICAgICAgICAgPHNwYW4gcmVmPSd2ZXJzaW9uVmFsdWUnIGNsYXNzTmFtZT0ndmFsdWUnPntTdHJpbmcodGhpcy5wYWNrLnZlcnNpb24pfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8L2g0PlxuICAgICAgICAgIDxzcGFuIHJlZj0ncGFja2FnZURlc2NyaXB0aW9uJyBjbGFzc05hbWU9J3BhY2thZ2UtZGVzY3JpcHRpb24nPntkZXNjcmlwdGlvbn08L3NwYW4+XG4gICAgICAgICAgPGRpdiByZWY9J3BhY2thZ2VNZXNzYWdlJyBjbGFzc05hbWU9J3BhY2thZ2UtbWVzc2FnZScgLz5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J21ldGEnPlxuICAgICAgICAgIDxkaXYgcmVmPSdtZXRhVXNlckNvbnRhaW5lcicgY2xhc3NOYW1lPSdtZXRhLXVzZXInPlxuICAgICAgICAgICAgPGEgcmVmPSdhdmF0YXJMaW5rJz5cbiAgICAgICAgICAgICAgey8qIEEgdHJhbnNwYXJlbnQgZ2lmIHNvIHRoZXJlIGlzIG5vIFwiYnJva2VuIGJvcmRlclwiICovfVxuICAgICAgICAgICAgICA8aW1nIHJlZj0nYXZhdGFyJyBjbGFzc05hbWU9J2F2YXRhcicgc3JjPSdkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQUFBQUFBUC8vL3lINUJBRUFBQUFBTEFBQUFBQUJBQUVBQUFJQlJBQTcnIC8+XG4gICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8YSByZWY9J2xvZ2luTGluaycgY2xhc3NOYW1lPSdhdXRob3InPntvd25lcn08L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J21ldGEtY29udHJvbHMnPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2J0bi10b29sYmFyJz5cbiAgICAgICAgICAgICAgPGRpdiByZWY9J3VwZGF0ZUJ1dHRvbkdyb3VwJyBjbGFzc05hbWU9J2J0bi1ncm91cCc+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSdidXR0b24nIGNsYXNzTmFtZT0nYnRuIGJ0bi1pbmZvIGljb24gaWNvbi1jbG91ZC1kb3dubG9hZCBpbnN0YWxsLWJ1dHRvbicgcmVmPSd1cGRhdGVCdXR0b24nPlVwZGF0ZTwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiByZWY9J2luc3RhbGxBbHRlcm5hdGl2ZUJ1dHRvbkdyb3VwJyBjbGFzc05hbWU9J2J0bi1ncm91cCc+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSdidXR0b24nIGNsYXNzTmFtZT0nYnRuIGJ0bi1pbmZvIGljb24gaWNvbi1jbG91ZC1kb3dubG9hZCBpbnN0YWxsLWJ1dHRvbicgcmVmPSdpbnN0YWxsQWx0ZXJuYXRpdmVCdXR0b24nPkluc3RhbGwgQWx0ZXJuYXRpdmU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgcmVmPSdpbnN0YWxsQnV0dG9uR3JvdXAnIGNsYXNzTmFtZT0nYnRuLWdyb3VwJz5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3NOYW1lPSdidG4gYnRuLWluZm8gaWNvbiBpY29uLWNsb3VkLWRvd25sb2FkIGluc3RhbGwtYnV0dG9uJyByZWY9J2luc3RhbGxCdXR0b24nPkluc3RhbGw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgcmVmPSdwYWNrYWdlQWN0aW9uQnV0dG9uR3JvdXAnIGNsYXNzTmFtZT0nYnRuLWdyb3VwJz5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3NOYW1lPSdidG4gaWNvbiBpY29uLWdlYXIgc2V0dGluZ3MnIHJlZj0nc2V0dGluZ3NCdXR0b24nPlNldHRpbmdzPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSdidXR0b24nIGNsYXNzTmFtZT0nYnRuIGljb24gaWNvbi10cmFzaGNhbiB1bmluc3RhbGwtYnV0dG9uJyByZWY9J3VuaW5zdGFsbEJ1dHRvbic+VW5pbnN0YWxsPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSdidXR0b24nIGNsYXNzTmFtZT0nYnRuIGljb24gaWNvbi1wbGF5YmFjay1wYXVzZSBlbmFibGVtZW50JyByZWY9J2VuYWJsZW1lbnRCdXR0b24nPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdkaXNhYmxlLXRleHQnPkRpc2FibGU8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSdidXR0b24nIGNsYXNzTmFtZT0nYnRuIHN0YXR1cy1pbmRpY2F0b3InIHRhYkluZGV4PSctMScgcmVmPSdzdGF0dXNJbmRpY2F0b3InIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgbG9jYXRlQ29tcGF0aWJsZVBhY2thZ2VWZXJzaW9uIChjYWxsYmFjaykge1xuICAgIHRoaXMucGFja2FnZU1hbmFnZXIubG9hZENvbXBhdGlibGVQYWNrYWdlVmVyc2lvbih0aGlzLnBhY2submFtZSwgKGVyciwgcGFjaykgPT4ge1xuICAgICAgaWYgKGVyciAhPSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBwYWNrYWdlVmVyc2lvbiA9IHBhY2sudmVyc2lvblxuXG4gICAgICAvLyBBIGNvbXBhdGlibGUgdmVyc2lvbiBleGlzdCwgd2UgYWN0aXZhdGUgdGhlIGluc3RhbGwgYnV0dG9uIGFuZFxuICAgICAgLy8gc2V0IHRoaXMuaW5zdGFsbGFibGVQYWNrIHNvIHRoYXQgdGhlIGluc3RhbGwgYWN0aW9uIGluc3RhbGxzIHRoZVxuICAgICAgLy8gY29tcGF0aWJsZSB2ZXJzaW9uIG9mIHRoZSBwYWNrYWdlLlxuICAgICAgaWYgKHBhY2thZ2VWZXJzaW9uKSB7XG4gICAgICAgIHRoaXMucmVmcy52ZXJzaW9uVmFsdWUudGV4dENvbnRlbnQgPSBwYWNrYWdlVmVyc2lvblxuICAgICAgICBpZiAocGFja2FnZVZlcnNpb24gIT09IHRoaXMucGFjay52ZXJzaW9uKSB7XG4gICAgICAgICAgdGhpcy5yZWZzLnZlcnNpb25WYWx1ZS5jbGFzc0xpc3QuYWRkKCd0ZXh0LXdhcm5pbmcnKVxuICAgICAgICAgIHRoaXMucmVmcy5wYWNrYWdlTWVzc2FnZS5jbGFzc0xpc3QuYWRkKCd0ZXh0LXdhcm5pbmcnKVxuICAgICAgICAgIHRoaXMucmVmcy5wYWNrYWdlTWVzc2FnZS50ZXh0Q29udGVudCA9IGBWZXJzaW9uICR7cGFja2FnZVZlcnNpb259IGlzIG5vdCB0aGUgbGF0ZXN0IHZlcnNpb24gYXZhaWxhYmxlIGZvciB0aGlzIHBhY2thZ2UsIGJ1dCBpdCdzIHRoZSBsYXRlc3QgdGhhdCBpcyBjb21wYXRpYmxlIHdpdGggeW91ciB2ZXJzaW9uIG9mIEF0b20uYFxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbnN0YWxsYWJsZVBhY2sgPSBwYWNrXG4gICAgICAgIHRoaXMuaGFzQ29tcGF0aWJsZVZlcnNpb24gPSB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmhhc0NvbXBhdGlibGVWZXJzaW9uID0gZmFsc2VcbiAgICAgICAgdGhpcy5yZWZzLnZlcnNpb25WYWx1ZS5jbGFzc0xpc3QuYWRkKCd0ZXh0LWVycm9yJylcbiAgICAgICAgdGhpcy5yZWZzLnBhY2thZ2VNZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ3RleHQtZXJyb3InKVxuICAgICAgICB0aGlzLnJlZnMucGFja2FnZU1lc3NhZ2UuaW5zZXJ0QWRqYWNlbnRUZXh0KFxuICAgICAgICAgICdiZWZvcmVlbmQnLFxuICAgICAgICAgIGBUaGVyZSdzIG5vIHZlcnNpb24gb2YgdGhpcyBwYWNrYWdlIHRoYXQgaXMgY29tcGF0aWJsZSB3aXRoIHlvdXIgQXRvbSB2ZXJzaW9uLiBUaGUgdmVyc2lvbiBtdXN0IHNhdGlzZnkgJHt0aGlzLnBhY2suZW5naW5lcy5hdG9tfS5gXG4gICAgICAgIClcbiAgICAgICAgY29uc29sZS5lcnJvcihgTm8gYXZhaWxhYmxlIHZlcnNpb24gY29tcGF0aWJsZSB3aXRoIHRoZSBpbnN0YWxsZWQgQXRvbSB2ZXJzaW9uOiAke2F0b20uZ2V0VmVyc2lvbigpfWApXG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrKClcbiAgICB9KVxuICB9XG5cbiAgaGFuZGxlQnV0dG9uRXZlbnRzIChvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5vblNldHRpbmdzVmlldykge1xuICAgICAgdGhpcy5yZWZzLnNldHRpbmdzQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY2xpY2tIYW5kbGVyID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIHRoaXMuc2V0dGluZ3NWaWV3LnNob3dQYW5lbCh0aGlzLnBhY2submFtZSwge2JhY2s6IG9wdGlvbnMgPyBvcHRpb25zLmJhY2sgOiBudWxsLCBwYWNrOiB0aGlzLnBhY2t9KVxuICAgICAgfVxuXG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGlja0hhbmRsZXIpXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrSGFuZGxlcikgfSkpXG5cbiAgICAgIHRoaXMucmVmcy5zZXR0aW5nc0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrSGFuZGxlcilcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdGhpcy5yZWZzLnNldHRpbmdzQnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xpY2tIYW5kbGVyKSB9KSlcbiAgICB9XG5cbiAgICBjb25zdCBpbnN0YWxsQnV0dG9uQ2xpY2tIYW5kbGVyID0gKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgdGhpcy5pbnN0YWxsKClcbiAgICB9XG4gICAgdGhpcy5yZWZzLmluc3RhbGxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpbnN0YWxsQnV0dG9uQ2xpY2tIYW5kbGVyKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdGhpcy5yZWZzLmluc3RhbGxCdXR0b24ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpbnN0YWxsQnV0dG9uQ2xpY2tIYW5kbGVyKSB9KSlcblxuICAgIGNvbnN0IHVuaW5zdGFsbEJ1dHRvbkNsaWNrSGFuZGxlciA9IChldmVudCkgPT4ge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIHRoaXMudW5pbnN0YWxsKClcbiAgICB9XG4gICAgdGhpcy5yZWZzLnVuaW5zdGFsbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHVuaW5zdGFsbEJ1dHRvbkNsaWNrSGFuZGxlcilcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRoaXMucmVmcy51bmluc3RhbGxCdXR0b24ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB1bmluc3RhbGxCdXR0b25DbGlja0hhbmRsZXIpIH0pKVxuXG4gICAgY29uc3QgaW5zdGFsbEFsdGVybmF0aXZlQnV0dG9uQ2xpY2tIYW5kbGVyID0gKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgdGhpcy5pbnN0YWxsQWx0ZXJuYXRpdmUoKVxuICAgIH1cbiAgICB0aGlzLnJlZnMuaW5zdGFsbEFsdGVybmF0aXZlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaW5zdGFsbEFsdGVybmF0aXZlQnV0dG9uQ2xpY2tIYW5kbGVyKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdGhpcy5yZWZzLmluc3RhbGxBbHRlcm5hdGl2ZUJ1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGluc3RhbGxBbHRlcm5hdGl2ZUJ1dHRvbkNsaWNrSGFuZGxlcikgfSkpXG5cbiAgICBjb25zdCB1cGRhdGVCdXR0b25DbGlja0hhbmRsZXIgPSAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB0aGlzLnVwZGF0ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBsZXQgb2xkVmVyc2lvbiA9ICcnXG4gICAgICAgIGxldCBuZXdWZXJzaW9uID0gJydcblxuICAgICAgICBpZiAodGhpcy5wYWNrLmFwbUluc3RhbGxTb3VyY2UgJiYgdGhpcy5wYWNrLmFwbUluc3RhbGxTb3VyY2UudHlwZSA9PT0gJ2dpdCcpIHtcbiAgICAgICAgICBvbGRWZXJzaW9uID0gdGhpcy5wYWNrLmFwbUluc3RhbGxTb3VyY2Uuc2hhLnN1YnN0cigwLCA4KVxuICAgICAgICAgIG5ld1ZlcnNpb24gPSBgJHt0aGlzLnBhY2subGF0ZXN0U2hhLnN1YnN0cigwLCA4KX1gXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wYWNrLnZlcnNpb24gJiYgdGhpcy5wYWNrLmxhdGVzdFZlcnNpb24pIHtcbiAgICAgICAgICBvbGRWZXJzaW9uID0gdGhpcy5wYWNrLnZlcnNpb25cbiAgICAgICAgICBuZXdWZXJzaW9uID0gdGhpcy5wYWNrLmxhdGVzdFZlcnNpb25cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZXRhaWwgPSAnJ1xuICAgICAgICBpZiAob2xkVmVyc2lvbiAmJiBuZXdWZXJzaW9uKSB7XG4gICAgICAgICAgZGV0YWlsID0gYCR7b2xkVmVyc2lvbn0gLT4gJHtuZXdWZXJzaW9ufWBcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKGBSZXN0YXJ0IEF0b20gdG8gY29tcGxldGUgdGhlIHVwZGF0ZSBvZiBcXGAke3RoaXMucGFjay5uYW1lfVxcYC5gLCB7XG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgICAgIHRleHQ6ICdSZXN0YXJ0IG5vdycsXG4gICAgICAgICAgICBvbkRpZENsaWNrICgpIHsgcmV0dXJuIGF0b20ucmVzdGFydEFwcGxpY2F0aW9uKCkgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogJ0lcXCdsbCBkbyBpdCBsYXRlcicsXG4gICAgICAgICAgICBvbkRpZENsaWNrICgpIHsgbm90aWZpY2F0aW9uLmRpc21pc3MoKSB9XG4gICAgICAgICAgfV0sXG4gICAgICAgICAgZGV0YWlsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLnJlZnMudXBkYXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdXBkYXRlQnV0dG9uQ2xpY2tIYW5kbGVyKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdGhpcy5yZWZzLnVwZGF0ZUJ1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHVwZGF0ZUJ1dHRvbkNsaWNrSGFuZGxlcikgfSkpXG5cbiAgICBjb25zdCBwYWNrYWdlTmFtZUNsaWNrSGFuZGxlciA9IChldmVudCkgPT4ge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIHNoZWxsLm9wZW5FeHRlcm5hbChgaHR0cHM6Ly93ZWIucHVsc2FyLWVkaXQuZGV2L3BhY2thZ2VzLyR7dGhpcy5wYWNrLm5hbWV9YClcbiAgICB9XG4gICAgdGhpcy5yZWZzLnBhY2thZ2VOYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGFja2FnZU5hbWVDbGlja0hhbmRsZXIpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4geyB0aGlzLnJlZnMucGFja2FnZU5hbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwYWNrYWdlTmFtZUNsaWNrSGFuZGxlcikgfSkpXG5cbiAgICBjb25zdCBwYWNrYWdlQXV0aG9yQ2xpY2tIYW5kbGVyID0gKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgc2hlbGwub3BlbkV4dGVybmFsKGBodHRwczovL3B1bHNhci1lZGl0LmRldi91c2Vycy8ke293bmVyRnJvbVJlcG9zaXRvcnkodGhpcy5wYWNrLnJlcG9zaXRvcnkpfWApXG4gICAgfVxuICAgIHRoaXMucmVmcy5sb2dpbkxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwYWNrYWdlQXV0aG9yQ2xpY2tIYW5kbGVyKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdGhpcy5yZWZzLmxvZ2luTGluay5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHBhY2thZ2VBdXRob3JDbGlja0hhbmRsZXIpIH0pKVxuICAgIHRoaXMucmVmcy5hdmF0YXJMaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGFja2FnZUF1dGhvckNsaWNrSGFuZGxlcilcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRoaXMucmVmcy5hdmF0YXJMaW5rLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGFja2FnZUF1dGhvckNsaWNrSGFuZGxlcikgfSkpXG5cbiAgICBjb25zdCBlbmFibGVtZW50QnV0dG9uQ2xpY2tIYW5kbGVyID0gKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgaWYgKHRoaXMuaXNEaXNhYmxlZCgpKSB7XG4gICAgICAgIGF0b20ucGFja2FnZXMuZW5hYmxlUGFja2FnZSh0aGlzLnBhY2submFtZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0b20ucGFja2FnZXMuZGlzYWJsZVBhY2thZ2UodGhpcy5wYWNrLm5hbWUpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucmVmcy5lbmFibGVtZW50QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZW5hYmxlbWVudEJ1dHRvbkNsaWNrSGFuZGxlcilcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRoaXMucmVmcy5lbmFibGVtZW50QnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZW5hYmxlbWVudEJ1dHRvbkNsaWNrSGFuZGxlcikgfSkpXG5cbiAgICBjb25zdCBwYWNrYWdlTWVzc2FnZUNsaWNrSGFuZGxlciA9IChldmVudCkgPT4ge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ2EnKVxuICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGlmICh0YXJnZXQuaHJlZiAmJiB0YXJnZXQuaHJlZi5zdGFydHNXaXRoKCdhdG9tOicpKSB7XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbih0YXJnZXQuaHJlZilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlZnMucGFja2FnZU1lc3NhZ2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwYWNrYWdlTWVzc2FnZUNsaWNrSGFuZGxlcilcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRoaXMucmVmcy5wYWNrYWdlTWVzc2FnZS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHBhY2thZ2VNZXNzYWdlQ2xpY2tIYW5kbGVyKSB9KSlcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgcmV0dXJuIGV0Y2guZGVzdHJveSh0aGlzKVxuICB9XG5cbiAgbG9hZENhY2hlZE1ldGFkYXRhICgpIHtcbiAgICB0aGlzLmNsaWVudC5hdmF0YXIob3duZXJGcm9tUmVwb3NpdG9yeSh0aGlzLnBhY2sucmVwb3NpdG9yeSksIChlcnIsIGF2YXRhclBhdGgpID0+IHtcbiAgICAgIGlmICghZXJyICYmIGF2YXRhclBhdGgpIHtcbiAgICAgICAgdGhpcy5yZWZzLmF2YXRhci5zcmMgPSBgZmlsZTovLyR7YXZhdGFyUGF0aH1gXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuY2xpZW50LnBhY2thZ2UodGhpcy5wYWNrLm5hbWUsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gYWN0dWFsbHkgaGFuZGxlIHRoZSBlcnJvciBoZXJlLCB3ZSBjYW4ganVzdCBza2lwXG4gICAgICAvLyBzaG93aW5nIHRoZSBkb3dubG9hZCBjb3VudCBpZiB0aGVyZSdzIGEgcHJvYmxlbS5cbiAgICAgIGlmICghZXJyKSB7XG4gICAgICAgIGlmIChkYXRhID09IG51bGwpIHtcbiAgICAgICAgICBkYXRhID0ge31cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnBhY2suYXBtSW5zdGFsbFNvdXJjZSAmJiB0aGlzLnBhY2suYXBtSW5zdGFsbFNvdXJjZS50eXBlID09PSAnZ2l0Jykge1xuICAgICAgICAgIHRoaXMucmVmcy5kb3dubG9hZEljb24uY2xhc3NMaXN0LnJlbW92ZSgnaWNvbi1jbG91ZC1kb3dubG9hZCcpXG4gICAgICAgICAgdGhpcy5yZWZzLmRvd25sb2FkSWNvbi5jbGFzc0xpc3QuYWRkKCdpY29uLWdpdC1icmFuY2gnKVxuICAgICAgICAgIHRoaXMucmVmcy5kb3dubG9hZENvdW50LnRleHRDb250ZW50ID0gdGhpcy5wYWNrLmFwbUluc3RhbGxTb3VyY2Uuc2hhLnN1YnN0cigwLCA4KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucmVmcy5zdGFyZ2F6ZXJDb3VudC50ZXh0Q29udGVudCA9IGRhdGEuc3RhcmdhemVyc19jb3VudCA/IGRhdGEuc3RhcmdhemVyc19jb3VudC50b0xvY2FsZVN0cmluZygpIDogJydcbiAgICAgICAgICB0aGlzLnJlZnMuZG93bmxvYWRDb3VudC50ZXh0Q29udGVudCA9IGRhdGEuZG93bmxvYWRzID8gZGF0YS5kb3dubG9hZHMudG9Mb2NhbGVTdHJpbmcoKSA6ICcnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgdXBkYXRlSW50ZXJmYWNlU3RhdGUgKCkge1xuICAgIHRoaXMucmVmcy52ZXJzaW9uVmFsdWUudGV4dENvbnRlbnQgPSAodGhpcy5pbnN0YWxsYWJsZVBhY2sgPyB0aGlzLmluc3RhbGxhYmxlUGFjay52ZXJzaW9uIDogbnVsbCkgfHwgdGhpcy5wYWNrLnZlcnNpb25cbiAgICBpZiAodGhpcy5wYWNrLmFwbUluc3RhbGxTb3VyY2UgJiYgdGhpcy5wYWNrLmFwbUluc3RhbGxTb3VyY2UudHlwZSA9PT0gJ2dpdCcpIHtcbiAgICAgIHRoaXMucmVmcy5kb3dubG9hZENvdW50LnRleHRDb250ZW50ID0gdGhpcy5wYWNrLmFwbUluc3RhbGxTb3VyY2Uuc2hhLnN1YnN0cigwLCA4KVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlU2V0dGluZ3NTdGF0ZSgpXG4gICAgdGhpcy51cGRhdGVJbnN0YWxsZWRTdGF0ZSgpXG4gICAgdGhpcy51cGRhdGVEaXNhYmxlZFN0YXRlKClcbiAgfVxuXG4gIHVwZGF0ZVNldHRpbmdzU3RhdGUgKCkge1xuICAgIGlmICh0aGlzLmhhc1NldHRpbmdzKCkgJiYgIXRoaXMub25TZXR0aW5nc1ZpZXcpIHtcbiAgICAgIHRoaXMucmVmcy5zZXR0aW5nc0J1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZWZzLnNldHRpbmdzQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICB9XG4gIH1cblxuICAvLyBTZWN0aW9uOiBkaXNhYmxlZCBzdGF0ZSB1cGRhdGVzXG5cbiAgdXBkYXRlRGlzYWJsZWRTdGF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuaXNEaXNhYmxlZCgpKSB7XG4gICAgICB0aGlzLmRpc3BsYXlEaXNhYmxlZFN0YXRlKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2Rpc2FibGVkJykpIHtcbiAgICAgIHRoaXMuZGlzcGxheUVuYWJsZWRTdGF0ZSgpXG4gICAgfVxuICB9XG5cbiAgZGlzcGxheUVuYWJsZWRTdGF0ZSAoKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVkJylcbiAgICBpZiAodGhpcy50eXBlID09PSAndGhlbWUnKSB7XG4gICAgICB0aGlzLnJlZnMuZW5hYmxlbWVudEJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgfVxuICAgIHRoaXMucmVmcy5lbmFibGVtZW50QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJy5kaXNhYmxlLXRleHQnKS50ZXh0Q29udGVudCA9ICdEaXNhYmxlJ1xuICAgIHRoaXMucmVmcy5lbmFibGVtZW50QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2ljb24tcGxheWJhY2stcGF1c2UnKVxuICAgIHRoaXMucmVmcy5lbmFibGVtZW50QnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2ljb24tcGxheWJhY2stcGxheScpXG4gICAgdGhpcy5yZWZzLnN0YXR1c0luZGljYXRvci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1kaXNhYmxlZCcpXG4gIH1cblxuICBkaXNwbGF5RGlzYWJsZWRTdGF0ZSAoKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJylcbiAgICB0aGlzLnJlZnMuZW5hYmxlbWVudEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCcuZGlzYWJsZS10ZXh0JykudGV4dENvbnRlbnQgPSAnRW5hYmxlJ1xuICAgIHRoaXMucmVmcy5lbmFibGVtZW50QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2ljb24tcGxheWJhY2stcGxheScpXG4gICAgdGhpcy5yZWZzLmVuYWJsZW1lbnRCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaWNvbi1wbGF5YmFjay1wYXVzZScpXG4gICAgdGhpcy5yZWZzLnN0YXR1c0luZGljYXRvci5jbGFzc0xpc3QuYWRkKCdpcy1kaXNhYmxlZCcpXG4gICAgdGhpcy5yZWZzLmVuYWJsZW1lbnRCdXR0b24uZGlzYWJsZWQgPSBmYWxzZVxuICB9XG5cbiAgLy8gU2VjdGlvbjogaW5zdGFsbGVkIHN0YXRlIHVwZGF0ZXNcblxuICB1cGRhdGVJbnN0YWxsZWRTdGF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuaXNJbnN0YWxsZWQoKSkge1xuICAgICAgdGhpcy5kaXNwbGF5SW5zdGFsbGVkU3RhdGUoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRpc3BsYXlOb3RJbnN0YWxsZWRTdGF0ZSgpXG4gICAgfVxuICB9XG5cbiAgZGlzcGxheUluc3RhbGxlZFN0YXRlICgpIHtcbiAgICBpZiAodGhpcy5uZXdWZXJzaW9uIHx8IHRoaXMubmV3U2hhKSB7XG4gICAgICB0aGlzLnJlZnMudXBkYXRlQnV0dG9uR3JvdXAuc3R5bGUuZGlzcGxheSA9ICcnXG4gICAgICBpZiAodGhpcy5uZXdWZXJzaW9uKSB7XG4gICAgICAgIHRoaXMucmVmcy51cGRhdGVCdXR0b24udGV4dENvbnRlbnQgPSBgVXBkYXRlIHRvICR7dGhpcy5uZXdWZXJzaW9ufWBcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5uZXdTaGEpIHtcbiAgICAgICAgdGhpcy5yZWZzLnVwZGF0ZUJ1dHRvbi50ZXh0Q29udGVudCA9IGBVcGRhdGUgdG8gJHt0aGlzLm5ld1NoYS5zdWJzdHIoMCwgOCl9YFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlZnMudXBkYXRlQnV0dG9uR3JvdXAuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIH1cblxuICAgIHRoaXMucmVmcy5pbnN0YWxsQnV0dG9uR3JvdXAuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIHRoaXMucmVmcy5pbnN0YWxsQWx0ZXJuYXRpdmVCdXR0b25Hcm91cC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgdGhpcy5yZWZzLnBhY2thZ2VBY3Rpb25CdXR0b25Hcm91cC5zdHlsZS5kaXNwbGF5ID0gJydcbiAgICB0aGlzLnJlZnMudW5pbnN0YWxsQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnJ1xuICB9XG5cbiAgZGlzcGxheU5vdEluc3RhbGxlZFN0YXRlICgpIHtcbiAgICB0aGlzLnJlZnMudW5pbnN0YWxsQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICBjb25zdCBhdG9tVmVyc2lvbiA9IHRoaXMucGFja2FnZU1hbmFnZXIubm9ybWFsaXplVmVyc2lvbihhdG9tLmdldFZlcnNpb24oKSlcbiAgICBpZiAoIXRoaXMucGFja2FnZU1hbmFnZXIuc2F0aXNmaWVzVmVyc2lvbihhdG9tVmVyc2lvbiwgdGhpcy5wYWNrKSkge1xuICAgICAgdGhpcy5oYXNDb21wYXRpYmxlVmVyc2lvbiA9IGZhbHNlXG4gICAgICB0aGlzLnNldE5vdEluc3RhbGxlZFN0YXRlQnV0dG9ucygpXG4gICAgICB0aGlzLmxvY2F0ZUNvbXBhdGlibGVQYWNrYWdlVmVyc2lvbigoKSA9PiB7IHRoaXMuc2V0Tm90SW5zdGFsbGVkU3RhdGVCdXR0b25zKCkgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXROb3RJbnN0YWxsZWRTdGF0ZUJ1dHRvbnMoKVxuICAgIH1cbiAgfVxuXG4gIHNldE5vdEluc3RhbGxlZFN0YXRlQnV0dG9ucyAoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0NvbXBhdGlibGVWZXJzaW9uKSB7XG4gICAgICB0aGlzLnJlZnMuaW5zdGFsbEJ1dHRvbkdyb3VwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICAgIHRoaXMucmVmcy51cGRhdGVCdXR0b25Hcm91cC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgfSBlbHNlIGlmICh0aGlzLm5ld1ZlcnNpb24gfHwgdGhpcy5uZXdTaGEpIHtcbiAgICAgIHRoaXMucmVmcy51cGRhdGVCdXR0b25Hcm91cC5zdHlsZS5kaXNwbGF5ID0gJydcbiAgICAgIHRoaXMucmVmcy5pbnN0YWxsQnV0dG9uR3JvdXAuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlZnMudXBkYXRlQnV0dG9uR3JvdXAuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgICAgdGhpcy5yZWZzLmluc3RhbGxCdXR0b25Hcm91cC5zdHlsZS5kaXNwbGF5ID0gJydcbiAgICB9XG4gICAgdGhpcy5yZWZzLmluc3RhbGxBbHRlcm5hdGl2ZUJ1dHRvbkdyb3VwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICB0aGlzLnJlZnMucGFja2FnZUFjdGlvbkJ1dHRvbkdyb3VwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgfVxuXG4gIGRpc3BsYXlTdGF0cyAob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuc3RhdHMgJiYgb3B0aW9ucy5zdGF0cy5kb3dubG9hZHMpIHtcbiAgICAgIHRoaXMucmVmcy5wYWNrYWdlRG93bmxvYWRzLnN0eWxlLmRpc3BsYXkgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlZnMucGFja2FnZURvd25sb2Fkcy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5zdGF0cyAmJiBvcHRpb25zLnN0YXRzLnN0YXJzKSB7XG4gICAgICB0aGlzLnJlZnMucGFja2FnZVN0YXJzLnN0eWxlLmRpc3BsYXkgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlZnMucGFja2FnZVN0YXJzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICB9XG4gIH1cblxuICBkaXNwbGF5R2l0UGFja2FnZUluc3RhbGxJbmZvcm1hdGlvbiAoKSB7XG4gICAgdGhpcy5yZWZzLm1ldGFVc2VyQ29udGFpbmVyLnJlbW92ZSgpXG4gICAgdGhpcy5yZWZzLnN0YXRzQ29udGFpbmVyLnJlbW92ZSgpXG4gICAgY29uc3Qge2dpdFVybEluZm99ID0gdGhpcy5wYWNrXG4gICAgaWYgKGdpdFVybEluZm8uZGVmYXVsdCA9PT0gJ3Nob3J0Y3V0Jykge1xuICAgICAgdGhpcy5yZWZzLnBhY2thZ2VEZXNjcmlwdGlvbi50ZXh0Q29udGVudCA9IGdpdFVybEluZm8uaHR0cHMoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlZnMucGFja2FnZURlc2NyaXB0aW9uLnRleHRDb250ZW50ID0gZ2l0VXJsSW5mby50b1N0cmluZygpXG4gICAgfVxuICAgIHRoaXMucmVmcy5pbnN0YWxsQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2ljb24tY2xvdWQtZG93bmxvYWQnKVxuICAgIHRoaXMucmVmcy5pbnN0YWxsQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2ljb24tZ2l0LWNvbW1pdCcpXG4gICAgdGhpcy5yZWZzLnVwZGF0ZUJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdpY29uLWNsb3VkLWRvd25sb2FkJylcbiAgICB0aGlzLnJlZnMudXBkYXRlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2ljb24tZ2l0LWNvbW1pdCcpXG4gIH1cblxuICBkaXNwbGF5QXZhaWxhYmxlVXBkYXRlIChuZXdWZXJzaW9uKSB7XG4gICAgdGhpcy5uZXdWZXJzaW9uID0gbmV3VmVyc2lvblxuICAgIHRoaXMudXBkYXRlSW50ZXJmYWNlU3RhdGUoKVxuICB9XG5cbiAgaGFuZGxlUGFja2FnZUV2ZW50cyAoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5wYWNrYWdlcy5vbkRpZERlYWN0aXZhdGVQYWNrYWdlKChwYWNrKSA9PiB7XG4gICAgICBpZiAocGFjay5uYW1lID09PSB0aGlzLnBhY2submFtZSkge1xuICAgICAgICB0aGlzLnVwZGF0ZURpc2FibGVkU3RhdGUoKVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSgocGFjaykgPT4ge1xuICAgICAgaWYgKHBhY2submFtZSA9PT0gdGhpcy5wYWNrLm5hbWUpIHtcbiAgICAgICAgdGhpcy51cGRhdGVEaXNhYmxlZFN0YXRlKClcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdjb3JlLmRpc2FibGVkUGFja2FnZXMnLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZURpc2FibGVkU3RhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpYmVUb1BhY2thZ2VFdmVudCgncGFja2FnZS1pbnN0YWxsaW5nIHRoZW1lLWluc3RhbGxpbmcnLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZUludGVyZmFjZVN0YXRlKClcbiAgICAgIHRoaXMucmVmcy5pbnN0YWxsQnV0dG9uLmRpc2FibGVkID0gdHJ1ZVxuICAgICAgdGhpcy5yZWZzLmluc3RhbGxCdXR0b24uY2xhc3NMaXN0LmFkZCgnaXMtaW5zdGFsbGluZycpXG4gICAgfSlcblxuICAgIHRoaXMuc3Vic2NyaWJlVG9QYWNrYWdlRXZlbnQoJ3BhY2thZ2UtdXBkYXRpbmcgdGhlbWUtdXBkYXRpbmcnLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZUludGVyZmFjZVN0YXRlKClcbiAgICAgIHRoaXMucmVmcy51cGRhdGVCdXR0b24uZGlzYWJsZWQgPSB0cnVlXG4gICAgICB0aGlzLnJlZnMudXBkYXRlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2lzLWluc3RhbGxpbmcnKVxuICAgIH0pXG5cbiAgICB0aGlzLnN1YnNjcmliZVRvUGFja2FnZUV2ZW50KCdwYWNrYWdlLWluc3RhbGxpbmctYWx0ZXJuYXRpdmUnLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZUludGVyZmFjZVN0YXRlKClcbiAgICAgIHRoaXMucmVmcy5pbnN0YWxsQWx0ZXJuYXRpdmVCdXR0b24uZGlzYWJsZWQgPSB0cnVlXG4gICAgICB0aGlzLnJlZnMuaW5zdGFsbEFsdGVybmF0aXZlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2lzLWluc3RhbGxpbmcnKVxuICAgIH0pXG5cbiAgICB0aGlzLnN1YnNjcmliZVRvUGFja2FnZUV2ZW50KCdwYWNrYWdlLXVuaW5zdGFsbGluZyB0aGVtZS11bmluc3RhbGxpbmcnLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZUludGVyZmFjZVN0YXRlKClcbiAgICAgIHRoaXMucmVmcy5lbmFibGVtZW50QnV0dG9uLmRpc2FibGVkID0gdHJ1ZVxuICAgICAgdGhpcy5yZWZzLnVuaW5zdGFsbEJ1dHRvbi5kaXNhYmxlZCA9IHRydWVcbiAgICAgIHRoaXMucmVmcy51bmluc3RhbGxCdXR0b24uY2xhc3NMaXN0LmFkZCgnaXMtdW5pbnN0YWxsaW5nJylcbiAgICB9KVxuXG4gICAgdGhpcy5zdWJzY3JpYmVUb1BhY2thZ2VFdmVudCgncGFja2FnZS1pbnN0YWxsZWQgcGFja2FnZS1pbnN0YWxsLWZhaWxlZCB0aGVtZS1pbnN0YWxsZWQgdGhlbWUtaW5zdGFsbC1mYWlsZWQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBsb2FkZWRQYWNrID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKHRoaXMucGFjay5uYW1lKVxuICAgICAgY29uc3QgdmVyc2lvbiA9IGxvYWRlZFBhY2sgJiYgbG9hZGVkUGFjay5tZXRhZGF0YSA/IGxvYWRlZFBhY2subWV0YWRhdGEudmVyc2lvbiA6IG51bGxcbiAgICAgIGlmICh2ZXJzaW9uKSB7XG4gICAgICAgIHRoaXMucGFjay52ZXJzaW9uID0gdmVyc2lvblxuICAgICAgfVxuICAgICAgdGhpcy5yZWZzLmluc3RhbGxCdXR0b24uZGlzYWJsZWQgPSBmYWxzZVxuICAgICAgdGhpcy5yZWZzLmluc3RhbGxCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaXMtaW5zdGFsbGluZycpXG4gICAgICB0aGlzLnVwZGF0ZUludGVyZmFjZVN0YXRlKClcbiAgICB9KVxuXG4gICAgdGhpcy5zdWJzY3JpYmVUb1BhY2thZ2VFdmVudCgncGFja2FnZS11cGRhdGVkIHRoZW1lLXVwZGF0ZWQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBsb2FkZWRQYWNrID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKHRoaXMucGFjay5uYW1lKVxuICAgICAgY29uc3QgbWV0YWRhdGEgPSBsb2FkZWRQYWNrID8gbG9hZGVkUGFjay5tZXRhZGF0YSA6IG51bGxcbiAgICAgIGlmIChtZXRhZGF0YSAmJiBtZXRhZGF0YS52ZXJzaW9uKSB7XG4gICAgICAgIHRoaXMucGFjay52ZXJzaW9uID0gbWV0YWRhdGEudmVyc2lvblxuICAgICAgfVxuXG4gICAgICBpZiAobWV0YWRhdGEgJiYgbWV0YWRhdGEuYXBtSW5zdGFsbFNvdXJjZSkge1xuICAgICAgICB0aGlzLnBhY2suYXBtSW5zdGFsbFNvdXJjZSA9IG1ldGFkYXRhLmFwbUluc3RhbGxTb3VyY2VcbiAgICAgIH1cblxuICAgICAgdGhpcy5uZXdWZXJzaW9uID0gbnVsbFxuICAgICAgdGhpcy5uZXdTaGEgPSBudWxsXG4gICAgICB0aGlzLnJlZnMudXBkYXRlQnV0dG9uLmRpc2FibGVkID0gZmFsc2VcbiAgICAgIHRoaXMucmVmcy51cGRhdGVCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaXMtaW5zdGFsbGluZycpXG4gICAgICB0aGlzLnVwZGF0ZUludGVyZmFjZVN0YXRlKClcbiAgICB9KVxuXG4gICAgdGhpcy5zdWJzY3JpYmVUb1BhY2thZ2VFdmVudCgncGFja2FnZS11cGRhdGUtZmFpbGVkIHRoZW1lLXVwZGF0ZS1mYWlsZWQnLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlZnMudXBkYXRlQnV0dG9uLmRpc2FibGVkID0gZmFsc2VcbiAgICAgIHRoaXMucmVmcy51cGRhdGVCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaXMtaW5zdGFsbGluZycpXG4gICAgICB0aGlzLnVwZGF0ZUludGVyZmFjZVN0YXRlKClcbiAgICB9KVxuXG4gICAgdGhpcy5zdWJzY3JpYmVUb1BhY2thZ2VFdmVudCgncGFja2FnZS11bmluc3RhbGxlZCBwYWNrYWdlLXVuaW5zdGFsbC1mYWlsZWQgdGhlbWUtdW5pbnN0YWxsZWQgdGhlbWUtdW5pbnN0YWxsLWZhaWxlZCcsICgpID0+IHtcbiAgICAgIHRoaXMubmV3VmVyc2lvbiA9IG51bGxcbiAgICAgIHRoaXMubmV3U2hhID0gbnVsbFxuICAgICAgdGhpcy5yZWZzLmVuYWJsZW1lbnRCdXR0b24uZGlzYWJsZWQgPSBmYWxzZVxuICAgICAgdGhpcy5yZWZzLnVuaW5zdGFsbEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlXG4gICAgICB0aGlzLnJlZnMudW5pbnN0YWxsQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXVuaW5zdGFsbGluZycpXG4gICAgICB0aGlzLnVwZGF0ZUludGVyZmFjZVN0YXRlKClcbiAgICB9KVxuXG4gICAgdGhpcy5zdWJzY3JpYmVUb1BhY2thZ2VFdmVudCgncGFja2FnZS1pbnN0YWxsZWQtYWx0ZXJuYXRpdmUgcGFja2FnZS1pbnN0YWxsLWFsdGVybmF0aXZlLWZhaWxlZCcsICgpID0+IHtcbiAgICAgIHRoaXMucmVmcy5pbnN0YWxsQWx0ZXJuYXRpdmVCdXR0b24uZGlzYWJsZWQgPSBmYWxzZVxuICAgICAgdGhpcy5yZWZzLmluc3RhbGxBbHRlcm5hdGl2ZUJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdpcy1pbnN0YWxsaW5nJylcbiAgICAgIHRoaXMudXBkYXRlSW50ZXJmYWNlU3RhdGUoKVxuICAgIH0pXG4gIH1cblxuICBpc0luc3RhbGxlZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFja2FnZU1hbmFnZXIuaXNQYWNrYWdlSW5zdGFsbGVkKHRoaXMucGFjay5uYW1lKVxuICB9XG5cbiAgaXNEaXNhYmxlZCAoKSB7XG4gICAgcmV0dXJuIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlRGlzYWJsZWQodGhpcy5wYWNrLm5hbWUpXG4gIH1cblxuICBoYXNTZXR0aW5ncyAoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFja2FnZU1hbmFnZXIucGFja2FnZUhhc1NldHRpbmdzKHRoaXMucGFjay5uYW1lKVxuICB9XG5cbiAgc3Vic2NyaWJlVG9QYWNrYWdlRXZlbnQgKGV2ZW50LCBjYWxsYmFjaykge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMucGFja2FnZU1hbmFnZXIub24oZXZlbnQsICh7cGFjaywgZXJyb3J9KSA9PiB7XG4gICAgICBpZiAocGFjay5wYWNrICE9IG51bGwpIHtcbiAgICAgICAgcGFjayA9IHBhY2sucGFja1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYWNrYWdlTmFtZSA9IHBhY2submFtZVxuICAgICAgaWYgKHBhY2thZ2VOYW1lID09PSB0aGlzLnBhY2submFtZSkge1xuICAgICAgICBjYWxsYmFjayhwYWNrLCBlcnJvcilcbiAgICAgIH1cbiAgICB9KSlcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IE1ldGhvZHMgdGhhdCBzaG91bGQgYmUgb24gYSBQYWNrYWdlIG1vZGVsXG4gICovXG5cbiAgaW5zdGFsbCAoKSB7XG4gICAgdGhpcy5wYWNrYWdlTWFuYWdlci5pbnN0YWxsKHRoaXMuaW5zdGFsbGFibGVQYWNrICE9IG51bGwgPyB0aGlzLmluc3RhbGxhYmxlUGFjayA6IHRoaXMucGFjaywgKGVycm9yKSA9PiB7XG4gICAgICBpZiAoZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBJbnN0YWxsaW5nICR7dGhpcy50eXBlfSAke3RoaXMucGFjay5uYW1lfSBmYWlsZWRgLCBlcnJvci5zdGFjayAhPSBudWxsID8gZXJyb3Iuc3RhY2sgOiBlcnJvciwgZXJyb3Iuc3RkZXJyKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gaWYgYSBwYWNrYWdlIHdhcyBkaXNhYmxlZCBiZWZvcmUgaW5zdGFsbGluZyBpdCwgcmUtZW5hYmxlIGl0XG4gICAgICAgIGlmICh0aGlzLmlzRGlzYWJsZWQoKSkge1xuICAgICAgICAgIGF0b20ucGFja2FnZXMuZW5hYmxlUGFja2FnZSh0aGlzLnBhY2submFtZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICB1cGRhdGUgKCkge1xuICAgIGlmICghdGhpcy5uZXdWZXJzaW9uICYmICF0aGlzLm5ld1NoYSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgfVxuXG4gICAgY29uc3QgcGFjayA9IHRoaXMuaW5zdGFsbGFibGVQYWNrICE9IG51bGwgPyB0aGlzLmluc3RhbGxhYmxlUGFjayA6IHRoaXMucGFja1xuICAgIGNvbnN0IHZlcnNpb24gPSB0aGlzLm5ld1ZlcnNpb24gPyBgdiR7dGhpcy5uZXdWZXJzaW9ufWAgOiBgIyR7dGhpcy5uZXdTaGEuc3Vic3RyKDAsIDgpfWBcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5wYWNrYWdlTWFuYWdlci51cGRhdGUocGFjaywgdGhpcy5uZXdWZXJzaW9uLCBlcnJvciA9PiB7XG4gICAgICAgIGlmIChlcnJvciAhPSBudWxsKSB7XG4gICAgICAgICAgYXRvbS5hc3NlcnQoZmFsc2UsICdQYWNrYWdlIHVwZGF0ZSBmYWlsZWQnLCBhc3NlcnRpb25FcnJvciA9PiB7XG4gICAgICAgICAgICBhc3NlcnRpb25FcnJvci5tZXRhZGF0YSA9IHtcbiAgICAgICAgICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgICAgICAgICBuYW1lOiBwYWNrLm5hbWUsXG4gICAgICAgICAgICAgIHZlcnNpb24sXG4gICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgICAgZXJyb3JTdGFjazogZXJyb3Iuc3RhY2ssXG4gICAgICAgICAgICAgIGVycm9yU3RkZXJyOiBlcnJvci5zdGRlcnJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFVwZGF0aW5nICR7dGhpcy50eXBlfSAke3BhY2submFtZX0gdG8gJHt2ZXJzaW9ufSBmYWlsZWQ6XFxuYCwgZXJyb3IsIGVycm9yLnN0ZGVyciAhPSBudWxsID8gZXJyb3Iuc3RkZXJyIDogJycpXG4gICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICB1bmluc3RhbGwgKCkge1xuICAgIHRoaXMucGFja2FnZU1hbmFnZXIudW5pbnN0YWxsKHRoaXMucGFjaywgKGVycm9yKSA9PiB7XG4gICAgICBpZiAoZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBVbmluc3RhbGxpbmcgJHt0aGlzLnR5cGV9ICR7dGhpcy5wYWNrLm5hbWV9IGZhaWxlZGAsIGVycm9yLnN0YWNrICE9IG51bGwgPyBlcnJvci5zdGFjayA6IGVycm9yLCBlcnJvci5zdGRlcnIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGluc3RhbGxBbHRlcm5hdGl2ZSAoKSB7XG4gICAgcmV0dXJuO1xuICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUdBO0FBQ0E7QUFDQTtBQUVBO0FBQTJDO0FBUDNDO0FBQ0E7O0FBUUEsSUFBSUEsTUFBTSxHQUFHLElBQUk7QUFFRixNQUFNQyxXQUFXLENBQUM7RUFDL0JDLFdBQVcsQ0FBRUMsSUFBSSxFQUFFQyxZQUFZLEVBQUVDLGNBQWMsRUFBRUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFO0lBQzdELElBQUksQ0FBQ0gsSUFBSSxHQUFHQSxJQUFJO0lBQ2hCLElBQUksQ0FBQ0MsWUFBWSxHQUFHQSxZQUFZO0lBQ2hDLElBQUksQ0FBQ0MsY0FBYyxHQUFHQSxjQUFjO0lBQ3BDLElBQUksQ0FBQ0UsV0FBVyxHQUFHLElBQUlDLHlCQUFtQixFQUFFOztJQUU1QztJQUNBO0lBQ0E7SUFDQTtJQUNBLElBQUksQ0FBQ0MsTUFBTSxHQUFHLElBQUksQ0FBQ0osY0FBYyxDQUFDSyxTQUFTLEVBQUU7SUFDN0MsSUFBSSxDQUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDUixJQUFJLENBQUNTLEtBQUssR0FBRyxPQUFPLEdBQUcsU0FBUztJQUNqRCxJQUFJLENBQUNDLElBQUksR0FBRyxJQUFJLENBQUNWLElBQUksQ0FBQ1UsSUFBSTtJQUMxQixJQUFJLENBQUNDLGNBQWMsR0FBR1IsT0FBTyxD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