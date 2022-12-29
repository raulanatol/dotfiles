"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _underscorePlus = _interopRequireDefault(require("underscore-plus"));
var _atom = require("atom");
var _etch = _interopRequireDefault(require("etch"));
var _fsPlus = _interopRequireDefault(require("fs-plus"));
var _grim = _interopRequireDefault(require("grim"));
var _marked = require("marked");
var _path = _interopRequireDefault(require("path"));
var _electron = require("electron");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */
/** @jsx etch.dom */

class DeprecationCopView {
  constructor({
    uri
  }) {
    this.uri = uri;
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(_grim.default.on('updated', () => {
      _etch.default.update(this);
    }));
    // TODO: Remove conditional when the new StyleManager deprecation APIs reach stable.
    if (atom.styles.onDidUpdateDeprecations) {
      this.subscriptions.add(atom.styles.onDidUpdateDeprecations(() => {
        _etch.default.update(this);
      }));
    }
    _etch.default.initialize(this);
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
  }
  serialize() {
    return {
      deserializer: this.constructor.name,
      uri: this.getURI(),
      version: 1
    };
  }
  destroy() {
    this.subscriptions.dispose();
    return _etch.default.destroy(this);
  }
  update() {
    return _etch.default.update(this);
  }
  render() {
    return _etch.default.dom("div", {
      className: "deprecation-cop pane-item native-key-bindings",
      tabIndex: "-1"
    }, _etch.default.dom("div", {
      className: "panel"
    }, _etch.default.dom("div", {
      className: "padded deprecation-overview"
    }, _etch.default.dom("div", {
      className: "pull-right btn-group"
    }, _etch.default.dom("button", {
      className: "btn btn-primary check-for-update",
      onclick: event => {
        event.preventDefault();
        this.checkForUpdates();
      }
    }, "Check for Updates"))), _etch.default.dom("div", {
      className: "panel-heading"
    }, _etch.default.dom("span", null, "Deprecated calls")), _etch.default.dom("ul", {
      className: "list-tree has-collapsable-children"
    }, this.renderDeprecatedCalls()), _etch.default.dom("div", {
      className: "panel-heading"
    }, _etch.default.dom("span", null, "Deprecated selectors")), _etch.default.dom("ul", {
      className: "selectors list-tree has-collapsable-children"
    }, this.renderDeprecatedSelectors())));
  }
  renderDeprecatedCalls() {
    const deprecationsByPackageName = this.getDeprecatedCallsByPackageName();
    const packageNames = Object.keys(deprecationsByPackageName);
    if (packageNames.length === 0) {
      return _etch.default.dom("li", {
        className: "list-item"
      }, "No deprecated calls");
    } else {
      //TODO_PULSAR: Validate 'atom core'
      return packageNames.sort().map(packageName => _etch.default.dom("li", {
        className: "deprecation list-nested-item collapsed"
      }, _etch.default.dom("div", {
        className: "deprecation-info list-item",
        onclick: event => event.target.parentElement.classList.toggle('collapsed')
      }, _etch.default.dom("span", {
        className: "text-highlight"
      }, packageName || 'atom core'), _etch.default.dom("span", null, ` (${_underscorePlus.default.pluralize(deprecationsByPackageName[packageName].length, 'deprecation')})`)), _etch.default.dom("ul", {
        className: "list"
      }, this.renderPackageActionsIfNeeded(packageName), deprecationsByPackageName[packageName].map(({
        deprecation,
        stack
      }) => _etch.default.dom("li", {
        className: "list-item deprecation-detail"
      }, _etch.default.dom("span", {
        className: "text-warning icon icon-alert"
      }), _etch.default.dom("div", {
        className: "list-item deprecation-message",
        innerHTML: (0, _marked.marked)(deprecation.getMessage())
      }), this.renderIssueURLIfNeeded(packageName, deprecation, this.buildIssueURL(packageName, deprecation, stack)), _etch.default.dom("div", {
        className: "stack-trace"
      }, stack.map(({
        functionName,
        location
      }) => _etch.default.dom("div", {
        className: "stack-line"
      }, _etch.default.dom("span", null, functionName), _etch.default.dom("span", null, " - "), _etch.default.dom("a", {
        className: "stack-line-location",
        href: location,
        onclick: event => {
          event.preventDefault();
          this.openLocation(location);
        }
      }, location)))))))));
    }
  }
  renderDeprecatedSelectors() {
    const deprecationsByPackageName = this.getDeprecatedSelectorsByPackageName();
    const packageNames = Object.keys(deprecationsByPackageName);
    if (packageNames.length === 0) {
      return _etch.default.dom("li", {
        className: "list-item"
      }, "No deprecated selectors");
    } else {
      return packageNames.map(packageName => _etch.default.dom("li", {
        className: "deprecation list-nested-item collapsed"
      }, _etch.default.dom("div", {
        className: "deprecation-info list-item",
        onclick: event => event.target.parentElement.classList.toggle('collapsed')
      }, _etch.default.dom("span", {
        className: "text-highlight"
      }, packageName)), _etch.default.dom("ul", {
        className: "list"
      }, this.renderPackageActionsIfNeeded(packageName), deprecationsByPackageName[packageName].map(({
        packagePath,
        sourcePath,
        deprecation
      }) => {
        const relativeSourcePath = _path.default.relative(packagePath, sourcePath);
        const issueTitle = `Deprecated selector in \`${relativeSourcePath}\``;
        const issueBody = `In \`${relativeSourcePath}\`: \n\n${deprecation.message}`;
        return _etch.default.dom("li", {
          className: "list-item source-file"
        }, _etch.default.dom("a", {
          className: "source-url",
          href: sourcePath,
          onclick: event => {
            event.preventDefault();
            this.openLocation(sourcePath);
          }
        }, relativeSourcePath), _etch.default.dom("ul", {
          className: "list"
        }, _etch.default.dom("li", {
          className: "list-item deprecation-detail"
        }, _etch.default.dom("span", {
          className: "text-warning icon icon-alert"
        }), _etch.default.dom("div", {
          className: "list-item deprecation-message",
          innerHTML: (0, _marked.marked)(deprecation.message)
        }), this.renderSelectorIssueURLIfNeeded(packageName, issueTitle, issueBody))));
      }))));
    }
  }
  renderPackageActionsIfNeeded(packageName) {
    if (packageName && atom.packages.getLoadedPackage(packageName)) {
      return _etch.default.dom("div", {
        className: "padded"
      }, _etch.default.dom("div", {
        className: "btn-group"
      }, _etch.default.dom("button", {
        className: "btn check-for-update",
        onclick: event => {
          event.preventDefault();
          this.checkForUpdates();
        }
      }, "Check for Update"), _etch.default.dom("button", {
        className: "btn disable-package",
        "data-package-name": packageName,
        onclick: event => {
          event.preventDefault();
          this.disablePackage(packageName);
        }
      }, "Disable Package")));
    } else {
      return '';
    }
  }
  encodeURI(str) {
    return encodeURI(str).replace(/#/g, '%23').replace(/;/g, '%3B').replace(/%20/g, '+');
  }
  renderSelectorIssueURLIfNeeded(packageName, issueTitle, issueBody) {
    const repoURL = this.getRepoURL(packageName);
    if (repoURL) {
      const issueURL = `${repoURL}/issues/new?title=${this.encodeURI(issueTitle)}&body=${this.encodeURI(issueBody)}`;
      return _etch.default.dom("div", {
        className: "btn-toolbar"
      }, _etch.default.dom("button", {
        className: "btn issue-url",
        "data-issue-title": issueTitle,
        "data-repo-url": repoURL,
        "data-issue-url": issueURL,
        onclick: event => {
          event.preventDefault();
          this.openIssueURL(repoURL, issueURL, issueTitle);
        }
      }, "Report Issue"));
    } else {
      return '';
    }
  }
  renderIssueURLIfNeeded(packageName, deprecation, issueURL) {
    if (packageName && issueURL) {
      const repoURL = this.getRepoURL(packageName);
      const issueTitle = `${deprecation.getOriginName()} is deprecated.`;
      return _etch.default.dom("div", {
        className: "btn-toolbar"
      }, _etch.default.dom("button", {
        className: "btn issue-url",
        "data-issue-title": issueTitle,
        "data-repo-url": repoURL,
        "data-issue-url": issueURL,
        onclick: event => {
          event.preventDefault();
          this.openIssueURL(repoURL, issueURL, issueTitle);
        }
      }, "Report Issue"));
    } else {
      return '';
    }
  }
  buildIssueURL(packageName, deprecation, stack) {
    const repoURL = this.getRepoURL(packageName);
    if (repoURL) {
      const title = `${deprecation.getOriginName()} is deprecated.`;
      const stacktrace = stack.map(({
        functionName,
        location
      }) => `${functionName} (${location})`).join('\n');
      const body = `${deprecation.getMessage()}\n\`\`\`\n${stacktrace}\n\`\`\``;
      return `${repoURL}/issues/new?title=${encodeURI(title)}&body=${encodeURI(body)}`;
    } else {
      return null;
    }
  }
  async openIssueURL(repoURL, issueURL, issueTitle) {
    const issue = await this.findSimilarIssue(repoURL, issueTitle);
    if (issue) {
      _electron.shell.openExternal(issue.html_url);
    } else if (process.platform === 'win32') {
      // Windows will not launch URLs greater than ~2000 bytes so we need to shrink it
      _electron.shell.openExternal((await this.shortenURL(issueURL)) || issueURL);
    } else {
      _electron.shell.openExternal(issueURL);
    }
  }
  async findSimilarIssue(repoURL, issueTitle) {
    const url = 'https://api.github.com/search/issues';
    const repo = repoURL.replace(/http(s)?:\/\/(\d+\.)?github.com\//gi, '');
    const query = `${issueTitle} repo:${repo}`;
    const response = await window.fetch(`${url}?q=${encodeURI(query)}&sort=created`, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.items) {
        const issues = {};
        for (const issue of data.items) {
          if (issue.title.includes(issueTitle) && !issues[issue.state]) {
            issues[issue.state] = issue;
          }
        }
        return issues.open || issues.closed;
      }
    }
  }
  async shortenURL(url) {
    let encodedUrl = encodeURIComponent(url).substr(0, 5000); // is.gd has 5000 char limit
    let incompletePercentEncoding = encodedUrl.indexOf('%', encodedUrl.length - 2);
    if (incompletePercentEncoding >= 0) {
      // Handle an incomplete % encoding cut-off
      encodedUrl = encodedUrl.substr(0, incompletePercentEncoding);
    }
    let result = await fetch('https://is.gd/create.php?format=simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `url=${encodedUrl}`
    });
    return result.text();
  }
  getRepoURL(packageName) {
    const loadedPackage = atom.packages.getLoadedPackage(packageName);
    if (loadedPackage && loadedPackage.metadata && loadedPackage.metadata.repository) {
      const url = loadedPackage.metadata.repository.url || loadedPackage.metadata.repository;
      return url.replace(/\.git$/, '');
    } else {
      return null;
    }
  }
  getDeprecatedCallsByPackageName() {
    const deprecatedCalls = _grim.default.getDeprecations();
    deprecatedCalls.sort((a, b) => b.getCallCount() - a.getCallCount());
    const deprecatedCallsByPackageName = {};
    for (const deprecation of deprecatedCalls) {
      const stacks = deprecation.getStacks();
      stacks.sort((a, b) => b.callCount - a.callCount);
      for (const stack of stacks) {
        let packageName = null;
        if (stack.metadata && stack.metadata.packageName) {
          packageName = stack.metadata.packageName;
        } else {
          packageName = (this.getPackageName(stack) || '').toLowerCase();
        }
        deprecatedCallsByPackageName[packageName] = deprecatedCallsByPackageName[packageName] || [];
        deprecatedCallsByPackageName[packageName].push({
          deprecation,
          stack
        });
      }
    }
    return deprecatedCallsByPackageName;
  }
  getDeprecatedSelectorsByPackageName() {
    const deprecatedSelectorsByPackageName = {};
    if (atom.styles.getDeprecations) {
      const deprecatedSelectorsBySourcePath = atom.styles.getDeprecations();
      for (const sourcePath of Object.keys(deprecatedSelectorsBySourcePath)) {
        const deprecation = deprecatedSelectorsBySourcePath[sourcePath];
        const components = sourcePath.split(_path.default.sep);
        const packagesComponentIndex = components.indexOf('packages');
        let packageName = null;
        let packagePath = null;
        if (packagesComponentIndex === -1) {
          packageName = 'Other'; // could be Atom Core or the personal style sheet
          packagePath = '';
        } else {
          packageName = components[packagesComponentIndex + 1];
          packagePath = components.slice(0, packagesComponentIndex + 1).join(_path.default.sep);
        }
        deprecatedSelectorsByPackageName[packageName] = deprecatedSelectorsByPackageName[packageName] || [];
        deprecatedSelectorsByPackageName[packageName].push({
          packagePath,
          sourcePath,
          deprecation
        });
      }
    }
    return deprecatedSelectorsByPackageName;
  }
  getPackageName(stack) {
    const packagePaths = this.getPackagePathsByPackageName();
    for (const [packageName, packagePath] of packagePaths) {
      if (packagePath.includes('.pulsar/dev/packages') || packagePath.includes('.pulsar/packages')) {
        packagePaths.set(packageName, _fsPlus.default.absolute(packagePath));
      }
    }
    for (let i = 1; i < stack.length; i++) {
      const {
        fileName
      } = stack[i];

      // Empty when it was run from the dev console
      if (!fileName) {
        return null;
      }

      // Continue to next stack entry if call is in node_modules
      if (fileName.includes(`${_path.default.sep}node_modules${_path.default.sep}`)) {
        continue;
      }
      for (const [packageName, packagePath] of packagePaths) {
        const relativePath = _path.default.relative(packagePath, fileName);
        if (!/^\.\./.test(relativePath)) {
          return packageName;
        }
      }
      if (atom.getUserInitScriptPath() === fileName) {
        return `Your local ${_path.default.basename(fileName)} file`;
      }
    }
    return null;
  }
  getPackagePathsByPackageName() {
    if (this.packagePathsByPackageName) {
      return this.packagePathsByPackageName;
    } else {
      this.packagePathsByPackageName = new Map();
      for (const pack of atom.packages.getLoadedPackages()) {
        this.packagePathsByPackageName.set(pack.name, pack.path);
      }
      return this.packagePathsByPackageName;
    }
  }
  checkForUpdates() {
    atom.workspace.open('atom://config/updates');
  }
  disablePackage(packageName) {
    if (packageName) {
      atom.packages.disablePackage(packageName);
    }
  }
  openLocation(location) {
    let pathToOpen = location.replace('file://', '');
    if (process.platform === 'win32') {
      pathToOpen = pathToOpen.replace(/^\//, '');
    }
    atom.open({
      pathsToOpen: [pathToOpen]
    });
  }
  getURI() {
    return this.uri;
  }
  getTitle() {
    return 'Deprecation Cop';
  }
  getIconName() {
    return 'alert';
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
exports.default = DeprecationCopView;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXByZWNhdGlvbkNvcFZpZXciLCJjb25zdHJ1Y3RvciIsInVyaSIsInN1YnNjcmlwdGlvbnMiLCJDb21wb3NpdGVEaXNwb3NhYmxlIiwiYWRkIiwiR3JpbSIsIm9uIiwiZXRjaCIsInVwZGF0ZSIsImF0b20iLCJzdHlsZXMiLCJvbkRpZFVwZGF0ZURlcHJlY2F0aW9ucyIsImluaXRpYWxpemUiLCJjb21tYW5kcyIsImVsZW1lbnQiLCJzY3JvbGxVcCIsInNjcm9sbERvd24iLCJwYWdlVXAiLCJwYWdlRG93biIsInNjcm9sbFRvVG9wIiwic2Nyb2xsVG9Cb3R0b20iLCJzZXJpYWxpemUiLCJkZXNlcmlhbGl6ZXIiLCJuYW1lIiwiZ2V0VVJJIiwidmVyc2lvbiIsImRlc3Ryb3kiLCJkaXNwb3NlIiwicmVuZGVyIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsImNoZWNrRm9yVXBkYXRlcyIsInJlbmRlckRlcHJlY2F0ZWRDYWxscyIsInJlbmRlckRlcHJlY2F0ZWRTZWxlY3RvcnMiLCJkZXByZWNhdGlvbnNCeVBhY2thZ2VOYW1lIiwiZ2V0RGVwcmVjYXRlZENhbGxzQnlQYWNrYWdlTmFtZSIsInBhY2thZ2VOYW1lcyIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJzb3J0IiwibWFwIiwicGFja2FnZU5hbWUiLCJ0YXJnZXQiLCJwYXJlbnRFbGVtZW50IiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwiXyIsInBsdXJhbGl6ZSIsInJlbmRlclBhY2thZ2VBY3Rpb25zSWZOZWVkZWQiLCJkZXByZWNhdGlvbiIsInN0YWNrIiwibWFya2VkIiwiZ2V0TWVzc2FnZSIsInJlbmRlcklzc3VlVVJMSWZOZWVkZWQiLCJidWlsZElzc3VlVVJMIiwiZnVuY3Rpb25OYW1lIiwibG9jYXRpb24iLCJvcGVuTG9jYXRpb24iLCJnZXREZXByZWNhdGVkU2VsZWN0b3JzQnlQYWNrYWdlTmFtZSIsInBhY2thZ2VQYXRoIiwic291cmNlUGF0aCIsInJlbGF0aXZlU291cmNlUGF0aCIsInBhdGgiLCJyZWxhdGl2ZSIsImlzc3VlVGl0bGUiLCJpc3N1ZUJvZHkiLCJtZXNzYWdlIiwicmVuZGVyU2VsZWN0b3JJc3N1ZVVSTElmTmVlZGVkIiwicGFja2FnZXMiLCJnZXRMb2FkZWRQYWNrYWdlIiwiZGlzYWJsZVBhY2thZ2UiLCJlbmNvZGVVUkkiLCJzdHIiLCJyZXBsYWNlIiwicmVwb1VSTCIsImdldFJlcG9VUkwiLCJpc3N1ZVVSTCIsIm9wZW5Jc3N1ZVVSTCIsImdldE9yaWdpbk5hbWUiLCJ0aXRsZSIsInN0YWNrdHJhY2UiLCJqb2luIiwiYm9keSIsImlzc3VlIiwiZmluZFNpbWlsYXJJc3N1ZSIsInNoZWxsIiwib3BlbkV4dGVybmFsIiwiaHRtbF91cmwiLCJwcm9jZXNzIiwicGxhdGZvcm0iLCJzaG9ydGVuVVJMIiwidXJsIiwicmVwbyIsInF1ZXJ5IiwicmVzcG9uc2UiLCJ3aW5kb3ciLCJmZXRjaCIsIm1ldGhvZCIsImhlYWRlcnMiLCJBY2NlcHQiLCJvayIsImRhdGEiLCJqc29uIiwiaXRlbXMiLCJpc3N1ZXMiLCJpbmNsdWRlcyIsInN0YXRlIiwib3BlbiIsImNsb3NlZCIsImVuY29kZWRVcmwiLCJlbmNvZGVVUklDb21wb25lbnQiLCJzdWJzdHIiLCJpbmNvbXBsZXRlUGVyY2VudEVuY29kaW5nIiwiaW5kZXhPZiIsInJlc3VsdCIsInRleHQiLCJsb2FkZWRQYWNrYWdlIiwibWV0YWRhdGEiLCJyZXBvc2l0b3J5IiwiZGVwcmVjYXRlZENhbGxzIiwiZ2V0RGVwcmVjYXRpb25zIiwiYSIsImIiLCJnZXRDYWxsQ291bnQiLCJkZXByZWNhdGVkQ2FsbHNCeVBhY2thZ2VOYW1lIiwic3RhY2tzIiwiZ2V0U3RhY2tzIiwiY2FsbENvdW50IiwiZ2V0UGFja2FnZU5hbWUiLCJ0b0xvd2VyQ2FzZSIsInB1c2giLCJkZXByZWNhdGVkU2VsZWN0b3JzQnlQYWNrYWdlTmFtZSIsImRlcHJlY2F0ZWRTZWxlY3RvcnNCeVNvdXJjZVBhdGgiLCJjb21wb25lbnRzIiwic3BsaXQiLCJzZXAiLCJwYWNrYWdlc0NvbXBvbmVudEluZGV4Iiwic2xpY2UiLCJwYWNrYWdlUGF0aHMiLCJnZXRQYWNrYWdlUGF0aHNCeVBhY2thZ2VOYW1lIiwic2V0IiwiZnMiLCJhYnNvbHV0ZSIsImkiLCJmaWxlTmFtZSIsInJlbGF0aXZlUGF0aCIsInRlc3QiLCJnZXRVc2VySW5pdFNjcmlwdFBhdGgiLCJiYXNlbmFtZSIsInBhY2thZ2VQYXRoc0J5UGFja2FnZU5hbWUiLCJNYXAiLCJwYWNrIiwiZ2V0TG9hZGVkUGFja2FnZXMiLCJ3b3Jrc3BhY2UiLCJwYXRoVG9PcGVuIiwicGF0aHNUb09wZW4iLCJnZXRUaXRsZSIsImdldEljb25OYW1lIiwic2Nyb2xsVG9wIiwiZG9jdW1lbnQiLCJvZmZzZXRIZWlnaHQiLCJzY3JvbGxIZWlnaHQiXSwic291cmNlcyI6WyJkZXByZWNhdGlvbi1jb3Atdmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG4vKiogQGpzeCBldGNoLmRvbSAqL1xuXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlLXBsdXMnO1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGV0Y2ggZnJvbSAnZXRjaCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cyc7XG5pbXBvcnQgR3JpbSBmcm9tICdncmltJztcbmltcG9ydCB7IG1hcmtlZCB9IGZyb20gJ21hcmtlZCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHNoZWxsIH0gZnJvbSAnZWxlY3Ryb24nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXByZWNhdGlvbkNvcFZpZXcge1xuICBjb25zdHJ1Y3Rvcih7IHVyaSB9KSB7XG4gICAgdGhpcy51cmkgPSB1cmk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgR3JpbS5vbigndXBkYXRlZCcsICgpID0+IHtcbiAgICAgICAgZXRjaC51cGRhdGUodGhpcyk7XG4gICAgICB9KVxuICAgICk7XG4gICAgLy8gVE9ETzogUmVtb3ZlIGNvbmRpdGlvbmFsIHdoZW4gdGhlIG5ldyBTdHlsZU1hbmFnZXIgZGVwcmVjYXRpb24gQVBJcyByZWFjaCBzdGFibGUuXG4gICAgaWYgKGF0b20uc3R5bGVzLm9uRGlkVXBkYXRlRGVwcmVjYXRpb25zKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICBhdG9tLnN0eWxlcy5vbkRpZFVwZGF0ZURlcHJlY2F0aW9ucygoKSA9PiB7XG4gICAgICAgICAgZXRjaC51cGRhdGUodGhpcyk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBldGNoLmluaXRpYWxpemUodGhpcyk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuc2Nyb2xsVXAoKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ2NvcmU6bW92ZS1kb3duJzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuc2Nyb2xsRG93bigpO1xuICAgICAgICB9LFxuICAgICAgICAnY29yZTpwYWdlLXVwJzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMucGFnZVVwKCk7XG4gICAgICAgIH0sXG4gICAgICAgICdjb3JlOnBhZ2UtZG93bic6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLnBhZ2VEb3duKCk7XG4gICAgICAgIH0sXG4gICAgICAgICdjb3JlOm1vdmUtdG8tdG9wJzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuc2Nyb2xsVG9Ub3AoKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ2NvcmU6bW92ZS10by1ib3R0b20nOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zY3JvbGxUb0JvdHRvbSgpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBzZXJpYWxpemUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc2VyaWFsaXplcjogdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgICAgdXJpOiB0aGlzLmdldFVSSSgpLFxuICAgICAgdmVyc2lvbjogMVxuICAgIH07XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgcmV0dXJuIGV0Y2guZGVzdHJveSh0aGlzKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICByZXR1cm4gZXRjaC51cGRhdGUodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwiZGVwcmVjYXRpb24tY29wIHBhbmUtaXRlbSBuYXRpdmUta2V5LWJpbmRpbmdzXCJcbiAgICAgICAgdGFiSW5kZXg9XCItMVwiXG4gICAgICA+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFuZWxcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZCBkZXByZWNhdGlvbi1vdmVydmlld1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdWxsLXJpZ2h0IGJ0bi1ncm91cFwiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5IGNoZWNrLWZvci11cGRhdGVcIlxuICAgICAgICAgICAgICAgIG9uY2xpY2s9e2V2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrRm9yVXBkYXRlcygpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBDaGVjayBmb3IgVXBkYXRlc1xuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lbC1oZWFkaW5nXCI+XG4gICAgICAgICAgICA8c3Bhbj5EZXByZWNhdGVkIGNhbGxzPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWUgaGFzLWNvbGxhcHNhYmxlLWNoaWxkcmVuXCI+XG4gICAgICAgICAgICB7dGhpcy5yZW5kZXJEZXByZWNhdGVkQ2FsbHMoKX1cbiAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lbC1oZWFkaW5nXCI+XG4gICAgICAgICAgICA8c3Bhbj5EZXByZWNhdGVkIHNlbGVjdG9yczwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8dWwgY2xhc3NOYW1lPVwic2VsZWN0b3JzIGxpc3QtdHJlZSBoYXMtY29sbGFwc2FibGUtY2hpbGRyZW5cIj5cbiAgICAgICAgICAgIHt0aGlzLnJlbmRlckRlcHJlY2F0ZWRTZWxlY3RvcnMoKX1cbiAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJEZXByZWNhdGVkQ2FsbHMoKSB7XG4gICAgY29uc3QgZGVwcmVjYXRpb25zQnlQYWNrYWdlTmFtZSA9IHRoaXMuZ2V0RGVwcmVjYXRlZENhbGxzQnlQYWNrYWdlTmFtZSgpO1xuICAgIGNvbnN0IHBhY2thZ2VOYW1lcyA9IE9iamVjdC5rZXlzKGRlcHJlY2F0aW9uc0J5UGFja2FnZU5hbWUpO1xuICAgIGlmIChwYWNrYWdlTmFtZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gPGxpIGNsYXNzTmFtZT1cImxpc3QtaXRlbVwiPk5vIGRlcHJlY2F0ZWQgY2FsbHM8L2xpPjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy9UT0RPX1BVTFNBUjogVmFsaWRhdGUgJ2F0b20gY29yZSdcbiAgICAgIHJldHVybiBwYWNrYWdlTmFtZXMuc29ydCgpLm1hcChwYWNrYWdlTmFtZSA9PiAoXG4gICAgICAgIDxsaSBjbGFzc05hbWU9XCJkZXByZWNhdGlvbiBsaXN0LW5lc3RlZC1pdGVtIGNvbGxhcHNlZFwiPlxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImRlcHJlY2F0aW9uLWluZm8gbGlzdC1pdGVtXCJcbiAgICAgICAgICAgIG9uY2xpY2s9e2V2ZW50ID0+XG4gICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2NvbGxhcHNlZCcpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1oaWdobGlnaHRcIj57cGFja2FnZU5hbWUgfHwgJ2F0b20gY29yZSd9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4+e2AgKCR7Xy5wbHVyYWxpemUoXG4gICAgICAgICAgICAgIGRlcHJlY2F0aW9uc0J5UGFja2FnZU5hbWVbcGFja2FnZU5hbWVdLmxlbmd0aCxcbiAgICAgICAgICAgICAgJ2RlcHJlY2F0aW9uJ1xuICAgICAgICAgICAgKX0pYH08L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdFwiPlxuICAgICAgICAgICAge3RoaXMucmVuZGVyUGFja2FnZUFjdGlvbnNJZk5lZWRlZChwYWNrYWdlTmFtZSl9XG4gICAgICAgICAgICB7ZGVwcmVjYXRpb25zQnlQYWNrYWdlTmFtZVtwYWNrYWdlTmFtZV0ubWFwKFxuICAgICAgICAgICAgICAoeyBkZXByZWNhdGlvbiwgc3RhY2sgfSkgPT4gKFxuICAgICAgICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJsaXN0LWl0ZW0gZGVwcmVjYXRpb24tZGV0YWlsXCI+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXdhcm5pbmcgaWNvbiBpY29uLWFsZXJ0XCIgLz5cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibGlzdC1pdGVtIGRlcHJlY2F0aW9uLW1lc3NhZ2VcIlxuICAgICAgICAgICAgICAgICAgICBpbm5lckhUTUw9e21hcmtlZChkZXByZWNhdGlvbi5nZXRNZXNzYWdlKCkpfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlcklzc3VlVVJMSWZOZWVkZWQoXG4gICAgICAgICAgICAgICAgICAgIHBhY2thZ2VOYW1lLFxuICAgICAgICAgICAgICAgICAgICBkZXByZWNhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWlsZElzc3VlVVJMKHBhY2thZ2VOYW1lLCBkZXByZWNhdGlvbiwgc3RhY2spXG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdGFjay10cmFjZVwiPlxuICAgICAgICAgICAgICAgICAgICB7c3RhY2subWFwKCh7IGZ1bmN0aW9uTmFtZSwgbG9jYXRpb24gfSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3RhY2stbGluZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e2Z1bmN0aW9uTmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj4gLSA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJzdGFjay1saW5lLWxvY2F0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj17bG9jYXRpb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s9e2V2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3BlbkxvY2F0aW9uKGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge2xvY2F0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgPC9saT5cbiAgICAgICkpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlckRlcHJlY2F0ZWRTZWxlY3RvcnMoKSB7XG4gICAgY29uc3QgZGVwcmVjYXRpb25zQnlQYWNrYWdlTmFtZSA9IHRoaXMuZ2V0RGVwcmVjYXRlZFNlbGVjdG9yc0J5UGFja2FnZU5hbWUoKTtcbiAgICBjb25zdCBwYWNrYWdlTmFtZXMgPSBPYmplY3Qua2V5cyhkZXByZWNhdGlvbnNCeVBhY2thZ2VOYW1lKTtcbiAgICBpZiAocGFja2FnZU5hbWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIDxsaSBjbGFzc05hbWU9XCJsaXN0LWl0ZW1cIj5ObyBkZXByZWNhdGVkIHNlbGVjdG9yczwvbGk+O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcGFja2FnZU5hbWVzLm1hcChwYWNrYWdlTmFtZSA9PiAoXG4gICAgICAgIDxsaSBjbGFzc05hbWU9XCJkZXByZWNhdGlvbiBsaXN0LW5lc3RlZC1pdGVtIGNvbGxhcHNlZFwiPlxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImRlcHJlY2F0aW9uLWluZm8gbGlzdC1pdGVtXCJcbiAgICAgICAgICAgIG9uY2xpY2s9e2V2ZW50ID0+XG4gICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2NvbGxhcHNlZCcpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1oaWdobGlnaHRcIj57cGFja2FnZU5hbWV9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3RcIj5cbiAgICAgICAgICAgIHt0aGlzLnJlbmRlclBhY2thZ2VBY3Rpb25zSWZOZWVkZWQocGFja2FnZU5hbWUpfVxuICAgICAgICAgICAge2RlcHJlY2F0aW9uc0J5UGFja2FnZU5hbWVbcGFja2FnZU5hbWVdLm1hcChcbiAgICAgICAgICAgICAgKHsgcGFja2FnZVBhdGgsIHNvdXJjZVBhdGgsIGRlcHJlY2F0aW9uIH0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWxhdGl2ZVNvdXJjZVBhdGggPSBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgcGFja2FnZVBhdGgsXG4gICAgICAgICAgICAgICAgICBzb3VyY2VQYXRoXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpc3N1ZVRpdGxlID0gYERlcHJlY2F0ZWQgc2VsZWN0b3IgaW4gXFxgJHtyZWxhdGl2ZVNvdXJjZVBhdGh9XFxgYDtcbiAgICAgICAgICAgICAgICBjb25zdCBpc3N1ZUJvZHkgPSBgSW4gXFxgJHtyZWxhdGl2ZVNvdXJjZVBhdGh9XFxgOiBcXG5cXG4ke1xuICAgICAgICAgICAgICAgICAgZGVwcmVjYXRpb24ubWVzc2FnZVxuICAgICAgICAgICAgICAgIH1gO1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICA8bGkgY2xhc3NOYW1lPVwibGlzdC1pdGVtIHNvdXJjZS1maWxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxhXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic291cmNlLXVybFwiXG4gICAgICAgICAgICAgICAgICAgICAgaHJlZj17c291cmNlUGF0aH1cbiAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrPXtldmVudCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcGVuTG9jYXRpb24oc291cmNlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIHtyZWxhdGl2ZVNvdXJjZVBhdGh9XG4gICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3RcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3NOYW1lPVwibGlzdC1pdGVtIGRlcHJlY2F0aW9uLWRldGFpbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC13YXJuaW5nIGljb24gaWNvbi1hbGVydFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImxpc3QtaXRlbSBkZXByZWNhdGlvbi1tZXNzYWdlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJIVE1MPXttYXJrZWQoZGVwcmVjYXRpb24ubWVzc2FnZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVyU2VsZWN0b3JJc3N1ZVVSTElmTmVlZGVkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaXNzdWVUaXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaXNzdWVCb2R5XG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgPC9saT5cbiAgICAgICkpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlclBhY2thZ2VBY3Rpb25zSWZOZWVkZWQocGFja2FnZU5hbWUpIHtcbiAgICBpZiAocGFja2FnZU5hbWUgJiYgYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKHBhY2thZ2VOYW1lKSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWRkZWRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cFwiPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gY2hlY2stZm9yLXVwZGF0ZVwiXG4gICAgICAgICAgICAgIG9uY2xpY2s9e2V2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tGb3JVcGRhdGVzKCk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIENoZWNrIGZvciBVcGRhdGVcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gZGlzYWJsZS1wYWNrYWdlXCJcbiAgICAgICAgICAgICAgZGF0YS1wYWNrYWdlLW5hbWU9e3BhY2thZ2VOYW1lfVxuICAgICAgICAgICAgICBvbmNsaWNrPXtldmVudCA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc2FibGVQYWNrYWdlKHBhY2thZ2VOYW1lKTtcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgRGlzYWJsZSBQYWNrYWdlXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9XG5cbiAgZW5jb2RlVVJJKHN0cikge1xuICAgIHJldHVybiBlbmNvZGVVUkkoc3RyKVxuICAgICAgLnJlcGxhY2UoLyMvZywgJyUyMycpXG4gICAgICAucmVwbGFjZSgvOy9nLCAnJTNCJylcbiAgICAgIC5yZXBsYWNlKC8lMjAvZywgJysnKTtcbiAgfVxuXG4gIHJlbmRlclNlbGVjdG9ySXNzdWVVUkxJZk5lZWRlZChwYWNrYWdlTmFtZSwgaXNzdWVUaXRsZSwgaXNzdWVCb2R5KSB7XG4gICAgY29uc3QgcmVwb1VSTCA9IHRoaXMuZ2V0UmVwb1VSTChwYWNrYWdlTmFtZSk7XG4gICAgaWYgKHJlcG9VUkwpIHtcbiAgICAgIGNvbnN0IGlzc3VlVVJMID0gYCR7cmVwb1VSTH0vaXNzdWVzL25ldz90aXRsZT0ke3RoaXMuZW5jb2RlVVJJKFxuICAgICAgICBpc3N1ZVRpdGxlXG4gICAgICApfSZib2R5PSR7dGhpcy5lbmNvZGVVUkkoaXNzdWVCb2R5KX1gO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tdG9vbGJhclwiPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBpc3N1ZS11cmxcIlxuICAgICAgICAgICAgZGF0YS1pc3N1ZS10aXRsZT17aXNzdWVUaXRsZX1cbiAgICAgICAgICAgIGRhdGEtcmVwby11cmw9e3JlcG9VUkx9XG4gICAgICAgICAgICBkYXRhLWlzc3VlLXVybD17aXNzdWVVUkx9XG4gICAgICAgICAgICBvbmNsaWNrPXtldmVudCA9PiB7XG4gICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIHRoaXMub3Blbklzc3VlVVJMKHJlcG9VUkwsIGlzc3VlVVJMLCBpc3N1ZVRpdGxlKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgUmVwb3J0IElzc3VlXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcklzc3VlVVJMSWZOZWVkZWQocGFja2FnZU5hbWUsIGRlcHJlY2F0aW9uLCBpc3N1ZVVSTCkge1xuICAgIGlmIChwYWNrYWdlTmFtZSAmJiBpc3N1ZVVSTCkge1xuICAgICAgY29uc3QgcmVwb1VSTCA9IHRoaXMuZ2V0UmVwb1VSTChwYWNrYWdlTmFtZSk7XG4gICAgICBjb25zdCBpc3N1ZVRpdGxlID0gYCR7ZGVwcmVjYXRpb24uZ2V0T3JpZ2luTmFtZSgpfSBpcyBkZXByZWNhdGVkLmA7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi10b29sYmFyXCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGlzc3VlLXVybFwiXG4gICAgICAgICAgICBkYXRhLWlzc3VlLXRpdGxlPXtpc3N1ZVRpdGxlfVxuICAgICAgICAgICAgZGF0YS1yZXBvLXVybD17cmVwb1VSTH1cbiAgICAgICAgICAgIGRhdGEtaXNzdWUtdXJsPXtpc3N1ZVVSTH1cbiAgICAgICAgICAgIG9uY2xpY2s9e2V2ZW50ID0+IHtcbiAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgdGhpcy5vcGVuSXNzdWVVUkwocmVwb1VSTCwgaXNzdWVVUkwsIGlzc3VlVGl0bGUpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBSZXBvcnQgSXNzdWVcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9XG5cbiAgYnVpbGRJc3N1ZVVSTChwYWNrYWdlTmFtZSwgZGVwcmVjYXRpb24sIHN0YWNrKSB7XG4gICAgY29uc3QgcmVwb1VSTCA9IHRoaXMuZ2V0UmVwb1VSTChwYWNrYWdlTmFtZSk7XG4gICAgaWYgKHJlcG9VUkwpIHtcbiAgICAgIGNvbnN0IHRpdGxlID0gYCR7ZGVwcmVjYXRpb24uZ2V0T3JpZ2luTmFtZSgpfSBpcyBkZXByZWNhdGVkLmA7XG4gICAgICBjb25zdCBzdGFja3RyYWNlID0gc3RhY2tcbiAgICAgICAgLm1hcCgoeyBmdW5jdGlvbk5hbWUsIGxvY2F0aW9uIH0pID0+IGAke2Z1bmN0aW9uTmFtZX0gKCR7bG9jYXRpb259KWApXG4gICAgICAgIC5qb2luKCdcXG4nKTtcbiAgICAgIGNvbnN0IGJvZHkgPSBgJHtkZXByZWNhdGlvbi5nZXRNZXNzYWdlKCl9XFxuXFxgXFxgXFxgXFxuJHtzdGFja3RyYWNlfVxcblxcYFxcYFxcYGA7XG4gICAgICByZXR1cm4gYCR7cmVwb1VSTH0vaXNzdWVzL25ldz90aXRsZT0ke2VuY29kZVVSSSh0aXRsZSl9JmJvZHk9JHtlbmNvZGVVUkkoXG4gICAgICAgIGJvZHlcbiAgICAgICl9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgb3Blbklzc3VlVVJMKHJlcG9VUkwsIGlzc3VlVVJMLCBpc3N1ZVRpdGxlKSB7XG4gICAgY29uc3QgaXNzdWUgPSBhd2FpdCB0aGlzLmZpbmRTaW1pbGFySXNzdWUocmVwb1VSTCwgaXNzdWVUaXRsZSk7XG4gICAgaWYgKGlzc3VlKSB7XG4gICAgICBzaGVsbC5vcGVuRXh0ZXJuYWwoaXNzdWUuaHRtbF91cmwpO1xuICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xuICAgICAgLy8gV2luZG93cyB3aWxsIG5vdCBsYXVuY2ggVVJMcyBncmVhdGVyIHRoYW4gfjIwMDAgYnl0ZXMgc28gd2UgbmVlZCB0byBzaHJpbmsgaXRcbiAgICAgIHNoZWxsLm9wZW5FeHRlcm5hbCgoYXdhaXQgdGhpcy5zaG9ydGVuVVJMKGlzc3VlVVJMKSkgfHwgaXNzdWVVUkwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzaGVsbC5vcGVuRXh0ZXJuYWwoaXNzdWVVUkwpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGZpbmRTaW1pbGFySXNzdWUocmVwb1VSTCwgaXNzdWVUaXRsZSkge1xuICAgIGNvbnN0IHVybCA9ICdodHRwczovL2FwaS5naXRodWIuY29tL3NlYXJjaC9pc3N1ZXMnO1xuICAgIGNvbnN0IHJlcG8gPSByZXBvVVJMLnJlcGxhY2UoL2h0dHAocyk/OlxcL1xcLyhcXGQrXFwuKT9naXRodWIuY29tXFwvL2dpLCAnJyk7XG4gICAgY29uc3QgcXVlcnkgPSBgJHtpc3N1ZVRpdGxlfSByZXBvOiR7cmVwb31gO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgd2luZG93LmZldGNoKFxuICAgICAgYCR7dXJsfT9xPSR7ZW5jb2RlVVJJKHF1ZXJ5KX0mc29ydD1jcmVhdGVkYCxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL3ZuZC5naXRodWIudjMranNvbicsXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcblxuICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIGlmIChkYXRhLml0ZW1zKSB7XG4gICAgICAgIGNvbnN0IGlzc3VlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGlzc3VlIG9mIGRhdGEuaXRlbXMpIHtcbiAgICAgICAgICBpZiAoaXNzdWUudGl0bGUuaW5jbHVkZXMoaXNzdWVUaXRsZSkgJiYgIWlzc3Vlc1tpc3N1ZS5zdGF0ZV0pIHtcbiAgICAgICAgICAgIGlzc3Vlc1tpc3N1ZS5zdGF0ZV0gPSBpc3N1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaXNzdWVzLm9wZW4gfHwgaXNzdWVzLmNsb3NlZDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBzaG9ydGVuVVJMKHVybCkge1xuICAgIGxldCBlbmNvZGVkVXJsID0gZW5jb2RlVVJJQ29tcG9uZW50KHVybCkuc3Vic3RyKDAsIDUwMDApOyAvLyBpcy5nZCBoYXMgNTAwMCBjaGFyIGxpbWl0XG4gICAgbGV0IGluY29tcGxldGVQZXJjZW50RW5jb2RpbmcgPSBlbmNvZGVkVXJsLmluZGV4T2YoXG4gICAgICAnJScsXG4gICAgICBlbmNvZGVkVXJsLmxlbmd0aCAtIDJcbiAgICApO1xuICAgIGlmIChpbmNvbXBsZXRlUGVyY2VudEVuY29kaW5nID49IDApIHtcbiAgICAgIC8vIEhhbmRsZSBhbiBpbmNvbXBsZXRlICUgZW5jb2RpbmcgY3V0LW9mZlxuICAgICAgZW5jb2RlZFVybCA9IGVuY29kZWRVcmwuc3Vic3RyKDAsIGluY29tcGxldGVQZXJjZW50RW5jb2RpbmcpO1xuICAgIH1cblxuICAgIGxldCByZXN1bHQgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9pcy5nZC9jcmVhdGUucGhwP2Zvcm1hdD1zaW1wbGUnLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnIH0sXG4gICAgICBib2R5OiBgdXJsPSR7ZW5jb2RlZFVybH1gXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0LnRleHQoKTtcbiAgfVxuXG4gIGdldFJlcG9VUkwocGFja2FnZU5hbWUpIHtcbiAgICBjb25zdCBsb2FkZWRQYWNrYWdlID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKHBhY2thZ2VOYW1lKTtcbiAgICBpZiAoXG4gICAgICBsb2FkZWRQYWNrYWdlICYmXG4gICAgICBsb2FkZWRQYWNrYWdlLm1ldGFkYXRhICYmXG4gICAgICBsb2FkZWRQYWNrYWdlLm1ldGFkYXRhLnJlcG9zaXRvcnlcbiAgICApIHtcbiAgICAgIGNvbnN0IHVybCA9XG4gICAgICAgIGxvYWRlZFBhY2thZ2UubWV0YWRhdGEucmVwb3NpdG9yeS51cmwgfHxcbiAgICAgICAgbG9hZGVkUGFja2FnZS5tZXRhZGF0YS5yZXBvc2l0b3J5O1xuICAgICAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC5naXQkLywgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXREZXByZWNhdGVkQ2FsbHNCeVBhY2thZ2VOYW1lKCkge1xuICAgIGNvbnN0IGRlcHJlY2F0ZWRDYWxscyA9IEdyaW0uZ2V0RGVwcmVjYXRpb25zKCk7XG4gICAgZGVwcmVjYXRlZENhbGxzLnNvcnQoKGEsIGIpID0+IGIuZ2V0Q2FsbENvdW50KCkgLSBhLmdldENhbGxDb3VudCgpKTtcbiAgICBjb25zdCBkZXByZWNhdGVkQ2FsbHNCeVBhY2thZ2VOYW1lID0ge307XG4gICAgZm9yIChjb25zdCBkZXByZWNhdGlvbiBvZiBkZXByZWNhdGVkQ2FsbHMpIHtcbiAgICAgIGNvbnN0IHN0YWNrcyA9IGRlcHJlY2F0aW9uLmdldFN0YWNrcygpO1xuICAgICAgc3RhY2tzLnNvcnQoKGEsIGIpID0+IGIuY2FsbENvdW50IC0gYS5jYWxsQ291bnQpO1xuICAgICAgZm9yIChjb25zdCBzdGFjayBvZiBzdGFja3MpIHtcbiAgICAgICAgbGV0IHBhY2thZ2VOYW1lID0gbnVsbDtcbiAgICAgICAgaWYgKHN0YWNrLm1ldGFkYXRhICYmIHN0YWNrLm1ldGFkYXRhLnBhY2thZ2VOYW1lKSB7XG4gICAgICAgICAgcGFja2FnZU5hbWUgPSBzdGFjay5tZXRhZGF0YS5wYWNrYWdlTmFtZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYWNrYWdlTmFtZSA9ICh0aGlzLmdldFBhY2thZ2VOYW1lKHN0YWNrKSB8fCAnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlcHJlY2F0ZWRDYWxsc0J5UGFja2FnZU5hbWVbcGFja2FnZU5hbWVdID1cbiAgICAgICAgICBkZXByZWNhdGVkQ2FsbHNCeVBhY2thZ2VOYW1lW3BhY2thZ2VOYW1lXSB8fCBbXTtcbiAgICAgICAgZGVwcmVjYXRlZENhbGxzQnlQYWNrYWdlTmFtZVtwYWNrYWdlTmFtZV0ucHVzaCh7IGRlcHJlY2F0aW9uLCBzdGFjayB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlcHJlY2F0ZWRDYWxsc0J5UGFja2FnZU5hbWU7XG4gIH1cblxuICBnZXREZXByZWNhdGVkU2VsZWN0b3JzQnlQYWNrYWdlTmFtZSgpIHtcbiAgICBjb25zdCBkZXByZWNhdGVkU2VsZWN0b3JzQnlQYWNrYWdlTmFtZSA9IHt9O1xuICAgIGlmIChhdG9tLnN0eWxlcy5nZXREZXByZWNhdGlvbnMpIHtcbiAgICAgIGNvbnN0IGRlcHJlY2F0ZWRTZWxlY3RvcnNCeVNvdXJjZVBhdGggPSBhdG9tLnN0eWxlcy5nZXREZXByZWNhdGlvbnMoKTtcbiAgICAgIGZvciAoY29uc3Qgc291cmNlUGF0aCBvZiBPYmplY3Qua2V5cyhkZXByZWNhdGVkU2VsZWN0b3JzQnlTb3VyY2VQYXRoKSkge1xuICAgICAgICBjb25zdCBkZXByZWNhdGlvbiA9IGRlcHJlY2F0ZWRTZWxlY3RvcnNCeVNvdXJjZVBhdGhbc291cmNlUGF0aF07XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSBzb3VyY2VQYXRoLnNwbGl0KHBhdGguc2VwKTtcbiAgICAgICAgY29uc3QgcGFja2FnZXNDb21wb25lbnRJbmRleCA9IGNvbXBvbmVudHMuaW5kZXhPZigncGFja2FnZXMnKTtcbiAgICAgICAgbGV0IHBhY2thZ2VOYW1lID0gbnVsbDtcbiAgICAgICAgbGV0IHBhY2thZ2VQYXRoID0gbnVsbDtcbiAgICAgICAgaWYgKHBhY2thZ2VzQ29tcG9uZW50SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgcGFja2FnZU5hbWUgPSAnT3RoZXInOyAvLyBjb3VsZCBiZSBBdG9tIENvcmUgb3IgdGhlIHBlcnNvbmFsIHN0eWxlIHNoZWV0XG4gICAgICAgICAgcGFja2FnZVBhdGggPSAnJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYWNrYWdlTmFtZSA9IGNvbXBvbmVudHNbcGFja2FnZXNDb21wb25lbnRJbmRleCArIDFdO1xuICAgICAgICAgIHBhY2thZ2VQYXRoID0gY29tcG9uZW50c1xuICAgICAgICAgICAgLnNsaWNlKDAsIHBhY2thZ2VzQ29tcG9uZW50SW5kZXggKyAxKVxuICAgICAgICAgICAgLmpvaW4ocGF0aC5zZXApO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVwcmVjYXRlZFNlbGVjdG9yc0J5UGFja2FnZU5hbWVbcGFja2FnZU5hbWVdID1cbiAgICAgICAgICBkZXByZWNhdGVkU2VsZWN0b3JzQnlQYWNrYWdlTmFtZVtwYWNrYWdlTmFtZV0gfHwgW107XG4gICAgICAgIGRlcHJlY2F0ZWRTZWxlY3RvcnNCeVBhY2thZ2VOYW1lW3BhY2thZ2VOYW1lXS5wdXNoKHtcbiAgICAgICAgICBwYWNrYWdlUGF0aCxcbiAgICAgICAgICBzb3VyY2VQYXRoLFxuICAgICAgICAgIGRlcHJlY2F0aW9uXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZXByZWNhdGVkU2VsZWN0b3JzQnlQYWNrYWdlTmFtZTtcbiAgfVxuXG4gIGdldFBhY2thZ2VOYW1lKHN0YWNrKSB7XG4gICAgY29uc3QgcGFja2FnZVBhdGhzID0gdGhpcy5nZXRQYWNrYWdlUGF0aHNCeVBhY2thZ2VOYW1lKCk7XG4gICAgZm9yIChjb25zdCBbcGFja2FnZU5hbWUsIHBhY2thZ2VQYXRoXSBvZiBwYWNrYWdlUGF0aHMpIHtcbiAgICAgIGlmIChcbiAgICAgICAgcGFja2FnZVBhdGguaW5jbHVkZXMoJy5wdWxzYXIvZGV2L3BhY2thZ2VzJykgfHxcbiAgICAgICAgcGFja2FnZVBhdGguaW5jbHVkZXMoJy5wdWxzYXIvcGFja2FnZXMnKVxuICAgICAgKSB7XG4gICAgICAgIHBhY2thZ2VQYXRocy5zZXQocGFja2FnZU5hbWUsIGZzLmFic29sdXRlKHBhY2thZ2VQYXRoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzdGFjay5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgeyBmaWxlTmFtZSB9ID0gc3RhY2tbaV07XG5cbiAgICAgIC8vIEVtcHR5IHdoZW4gaXQgd2FzIHJ1biBmcm9tIHRoZSBkZXYgY29uc29sZVxuICAgICAgaWYgKCFmaWxlTmFtZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udGludWUgdG8gbmV4dCBzdGFjayBlbnRyeSBpZiBjYWxsIGlzIGluIG5vZGVfbW9kdWxlc1xuICAgICAgaWYgKGZpbGVOYW1lLmluY2x1ZGVzKGAke3BhdGguc2VwfW5vZGVfbW9kdWxlcyR7cGF0aC5zZXB9YCkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgW3BhY2thZ2VOYW1lLCBwYWNrYWdlUGF0aF0gb2YgcGFja2FnZVBhdGhzKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHBhdGgucmVsYXRpdmUocGFja2FnZVBhdGgsIGZpbGVOYW1lKTtcbiAgICAgICAgaWYgKCEvXlxcLlxcLi8udGVzdChyZWxhdGl2ZVBhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIHBhY2thZ2VOYW1lO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChhdG9tLmdldFVzZXJJbml0U2NyaXB0UGF0aCgpID09PSBmaWxlTmFtZSkge1xuICAgICAgICByZXR1cm4gYFlvdXIgbG9jYWwgJHtwYXRoLmJhc2VuYW1lKGZpbGVOYW1lKX0gZmlsZWA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRQYWNrYWdlUGF0aHNCeVBhY2thZ2VOYW1lKCkge1xuICAgIGlmICh0aGlzLnBhY2thZ2VQYXRoc0J5UGFja2FnZU5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhY2thZ2VQYXRoc0J5UGFja2FnZU5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGFja2FnZVBhdGhzQnlQYWNrYWdlTmFtZSA9IG5ldyBNYXAoKTtcbiAgICAgIGZvciAoY29uc3QgcGFjayBvZiBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2VzKCkpIHtcbiAgICAgICAgdGhpcy5wYWNrYWdlUGF0aHNCeVBhY2thZ2VOYW1lLnNldChwYWNrLm5hbWUsIHBhY2sucGF0aCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5wYWNrYWdlUGF0aHNCeVBhY2thZ2VOYW1lO1xuICAgIH1cbiAgfVxuXG4gIGNoZWNrRm9yVXBkYXRlcygpIHtcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdhdG9tOi8vY29uZmlnL3VwZGF0ZXMnKTtcbiAgfVxuXG4gIGRpc2FibGVQYWNrYWdlKHBhY2thZ2VOYW1lKSB7XG4gICAgaWYgKHBhY2thZ2VOYW1lKSB7XG4gICAgICBhdG9tLnBhY2thZ2VzLmRpc2FibGVQYWNrYWdlKHBhY2thZ2VOYW1lKTtcbiAgICB9XG4gIH1cblxuICBvcGVuTG9jYXRpb24obG9jYXRpb24pIHtcbiAgICBsZXQgcGF0aFRvT3BlbiA9IGxvY2F0aW9uLnJlcGxhY2UoJ2ZpbGU6Ly8nLCAnJyk7XG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcbiAgICAgIHBhdGhUb09wZW4gPSBwYXRoVG9PcGVuLnJlcGxhY2UoL15cXC8vLCAnJyk7XG4gICAgfVxuICAgIGF0b20ub3Blbih7IHBhdGhzVG9PcGVuOiBbcGF0aFRvT3Blbl0gfSk7XG4gIH1cblxuICBnZXRVUkkoKSB7XG4gICAgcmV0dXJuIHRoaXMudXJpO1xuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuICdEZXByZWNhdGlvbiBDb3AnO1xuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKSB7XG4gICAgcmV0dXJuICdhbGVydCc7XG4gIH1cblxuICBzY3JvbGxVcCgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wIC09IGRvY3VtZW50LmJvZHkub2Zmc2V0SGVpZ2h0IC8gMjA7XG4gIH1cblxuICBzY3JvbGxEb3duKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgKz0gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQgLyAyMDtcbiAgfVxuXG4gIHBhZ2VVcCgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wIC09IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gIH1cblxuICBwYWdlRG93bigpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wICs9IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gIH1cblxuICBzY3JvbGxUb1RvcCgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wID0gMDtcbiAgfVxuXG4gIHNjcm9sbFRvQm90dG9tKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLmVsZW1lbnQuc2Nyb2xsSGVpZ2h0O1xuICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBaUM7QUFWakM7QUFDQTs7QUFXZSxNQUFNQSxrQkFBa0IsQ0FBQztFQUN0Q0MsV0FBVyxDQUFDO0lBQUVDO0VBQUksQ0FBQyxFQUFFO0lBQ25CLElBQUksQ0FBQ0EsR0FBRyxHQUFHQSxHQUFHO0lBQ2QsSUFBSSxDQUFDQyxhQUFhLEdBQUcsSUFBSUMseUJBQW1CLEVBQUU7SUFDOUMsSUFBSSxD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