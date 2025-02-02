"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = _interopRequireDefault(require("path"));
var _underscorePlus = _interopRequireDefault(require("underscore-plus"));
var _etch = _interopRequireDefault(require("etch"));
var _atom = require("atom");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */
/** @jsx etch.dom */

// View to display the snippets that a package has registered.
class PackageSnippetsView {
  constructor(pack, snippetsProvider) {
    this.pack = pack;
    this.namespace = this.pack.name;
    this.snippetsProvider = snippetsProvider;
    this.packagePath = _path.default.join(pack.path, _path.default.sep);
    _etch.default.initialize(this);
    this.disposables = new _atom.CompositeDisposable();
    this.updateSnippetsView();
    const packagesWithSnippetsDisabled = atom.config.get('core.packagesWithSnippetsDisabled') || [];
    this.refs.snippetToggle.checked = !packagesWithSnippetsDisabled.includes(this.namespace);
    const changeHandler = event => {
      event.stopPropagation();
      const value = this.refs.snippetToggle.checked;
      if (value) {
        atom.config.removeAtKeyPath('core.packagesWithSnippetsDisabled', this.namespace);
      } else {
        atom.config.pushAtKeyPath('core.packagesWithSnippetsDisabled', this.namespace);
      }
      this.updateSnippetsView();
    };
    this.refs.snippetToggle.addEventListener('change', changeHandler);
    this.disposables.add(new _atom.Disposable(() => {
      this.refs.snippetToggle.removeEventListener('change', changeHandler);
    }));
  }
  destroy() {
    this.disposables.dispose();
    return _etch.default.destroy(this);
  }
  update() {}
  render() {
    return _etch.default.dom("section", {
      className: "section"
    }, _etch.default.dom("div", {
      className: "section-heading icon icon-code"
    }, "Snippets"), _etch.default.dom("div", {
      className: "checkbox"
    }, _etch.default.dom("label", {
      for: "toggleSnippets"
    }, _etch.default.dom("input", {
      id: "toggleSnippets",
      className: "input-checkbox",
      type: "checkbox",
      ref: "snippetToggle"
    }), _etch.default.dom("div", {
      className: "setting-title"
    }, "Enable")), _etch.default.dom("div", {
      className: "setting-description"
    }, 'Disable this if you want to prevent this package’s snippets from appearing as suggestions or if you want to customize them in your snippets file.')), _etch.default.dom("table", {
      className: "package-snippets-table table native-key-bindings text",
      tabIndex: -1
    }, _etch.default.dom("thead", null, _etch.default.dom("tr", null, _etch.default.dom("th", null, "Trigger"), _etch.default.dom("th", null, "Name"), _etch.default.dom("th", null, "Scope"), _etch.default.dom("th", null, "Body"))), _etch.default.dom("tbody", {
      ref: "snippets"
    })));
  }
  getSnippetProperties() {
    const packageProperties = {};
    for (const {
      name,
      properties,
      selectorString
    } of this.snippetsProvider.getSnippets()) {
      if (name && name.indexOf && name.indexOf(this.packagePath) === 0) {
        const object = properties.snippets != null ? properties.snippets : {};
        for (let key in object) {
          const snippet = object[key];
          if (snippet != null) {
            snippet.selectorString = selectorString;
            if (packageProperties[key] == null) {
              packageProperties[key] = snippet;
            }
          }
        }
      }
    }
    return _underscorePlus.default.values(packageProperties).sort((snippet1, snippet2) => {
      const prefix1 = snippet1.prefix != null ? snippet1.prefix : '';
      const prefix2 = snippet2.prefix != null ? snippet2.prefix : '';
      return prefix1.localeCompare(prefix2);
    });
  }
  getSnippets(callback) {
    const snippetsPackage = atom.packages.getLoadedPackage('snippets');
    const snippetsModule = snippetsPackage ? snippetsPackage.mainModule : null;
    if (snippetsModule) {
      if (snippetsModule.loaded) {
        callback(this.getSnippetProperties());
      } else {
        snippetsModule.onDidLoadSnippets(() => callback(this.getSnippetProperties()));
      }
    } else {
      callback([]); // eslint-disable-line standard/no-callback-literal
    }
  }

  updateSnippetsView() {
    const packagesWithSnippetsDisabled = atom.config.get('core.packagesWithSnippetsDisabled') || [];
    const snippetsDisabled = packagesWithSnippetsDisabled.includes(this.namespace);
    this.getSnippets(snippets => {
      this.refs.snippets.innerHTML = '';
      if (snippetsDisabled) {
        this.refs.snippets.classList.add('text-subtle');
      } else {
        this.refs.snippets.classList.remove('text-subtle');
      }
      for (let {
        body,
        bodyText,
        name,
        prefix,
        selectorString
      } of snippets) {
        if (name == null) {
          name = '';
        }
        if (prefix == null) {
          prefix = '';
        }
        if (body == null) {
          body = bodyText || '';
        }
        if (selectorString == null) {
          selectorString = '';
        }
        const row = document.createElement('tr');
        const prefixTd = document.createElement('td');
        prefixTd.classList.add('snippet-prefix');
        prefixTd.textContent = prefix;
        row.appendChild(prefixTd);
        const nameTd = document.createElement('td');
        nameTd.textContent = name;
        row.appendChild(nameTd);
        const scopeTd = document.createElement('td');
        scopeTd.classList.add('snippet-scope-name');
        scopeTd.textContent = selectorString;
        row.appendChild(scopeTd);
        const bodyTd = document.createElement('td');
        bodyTd.classList.add('snippet-body');
        row.appendChild(bodyTd);
        this.refs.snippets.appendChild(row);
        this.createButtonsForSnippetRow(bodyTd, {
          body,
          prefix,
          scope: selectorString,
          name
        });
      }
      if (this.refs.snippets.children.length > 0) {
        this.element.style.display = '';
      } else {
        this.element.style.display = 'none';
      }
    });
  }
  createButtonsForSnippetRow(td, {
    scope,
    body,
    name,
    prefix
  }) {
    let buttonContainer = document.createElement('div');
    buttonContainer.classList.add('btn-group', 'btn-group-xs');
    let viewButton = document.createElement('button');
    let copyButton = document.createElement('button');
    viewButton.setAttribute('type', 'button');
    viewButton.textContent = 'View';
    viewButton.classList.add('btn', 'snippet-view-btn');
    let tooltip = atom.tooltips.add(viewButton, {
      title: body,
      html: false,
      trigger: 'click',
      placement: 'auto left',
      'class': 'snippet-body-tooltip'
    });
    this.disposables.add(tooltip);
    copyButton.setAttribute('type', 'button');
    copyButton.textContent = 'Copy';
    copyButton.classList.add('btn', 'snippet-copy-btn');
    copyButton.addEventListener('click', event => {
      event.preventDefault();
      return this.writeSnippetToClipboard({
        scope,
        body,
        name,
        prefix
      });
    });
    buttonContainer.appendChild(viewButton);
    buttonContainer.appendChild(copyButton);
    td.appendChild(buttonContainer);
  }
  writeSnippetToClipboard({
    scope,
    body,
    name,
    prefix
  }) {
    let content;
    const extension = _path.default.extname(this.snippetsProvider.getUserSnippetsPath());
    body = body.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    if (extension === '.cson') {
      body = body.replace(/'/g, `\\'`);
      content = `
'${scope}':
  '${name}':
    'prefix': '${prefix}'
    'body': '${body}'
`;
    } else {
      body = body.replace(/"/g, `\\"`);
      content = `
  "${scope}": {
    "${name}": {
      "prefix": "${prefix}",
      "body": "${body}"
    }
  }
`;
    }
    atom.clipboard.write(content);
  }
}
exports.default = PackageSnippetsView;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYWNrYWdlU25pcHBldHNWaWV3IiwiY29uc3RydWN0b3IiLCJwYWNrIiwic25pcHBldHNQcm92aWRlciIsIm5hbWVzcGFjZSIsIm5hbWUiLCJwYWNrYWdlUGF0aCIsInBhdGgiLCJqb2luIiwic2VwIiwiZXRjaCIsImluaXRpYWxpemUiLCJkaXNwb3NhYmxlcyIsIkNvbXBvc2l0ZURpc3Bvc2FibGUiLCJ1cGRhdGVTbmlwcGV0c1ZpZXciLCJwYWNrYWdlc1dpdGhTbmlwcGV0c0Rpc2FibGVkIiwiYXRvbSIsImNvbmZpZyIsImdldCIsInJlZnMiLCJzbmlwcGV0VG9nZ2xlIiwiY2hlY2tlZCIsImluY2x1ZGVzIiwiY2hhbmdlSGFuZGxlciIsImV2ZW50Iiwic3RvcFByb3BhZ2F0aW9uIiwidmFsdWUiLCJyZW1vdmVBdEtleVBhdGgiLCJwdXNoQXRLZXlQYXRoIiwiYWRkRXZlbnRMaXN0ZW5lciIsImFkZCIsIkRpc3Bvc2FibGUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZGVzdHJveSIsImRpc3Bvc2UiLCJ1cGRhdGUiLCJyZW5kZXIiLCJnZXRTbmlwcGV0UHJvcGVydGllcyIsInBhY2thZ2VQcm9wZXJ0aWVzIiwicHJvcGVydGllcyIsInNlbGVjdG9yU3RyaW5nIiwiZ2V0U25pcHBldHMiLCJpbmRleE9mIiwib2JqZWN0Iiwic25pcHBldHMiLCJrZXkiLCJzbmlwcGV0IiwiXyIsInZhbHVlcyIsInNvcnQiLCJzbmlwcGV0MSIsInNuaXBwZXQyIiwicHJlZml4MSIsInByZWZpeCIsInByZWZpeDIiLCJsb2NhbGVDb21wYXJlIiwiY2FsbGJhY2siLCJzbmlwcGV0c1BhY2thZ2UiLCJwYWNrYWdlcyIsImdldExvYWRlZFBhY2thZ2UiLCJzbmlwcGV0c01vZHVsZSIsIm1haW5Nb2R1bGUiLCJsb2FkZWQiLCJvbkRpZExvYWRTbmlwcGV0cyIsInNuaXBwZXRzRGlzYWJsZWQiLCJpbm5lckhUTUwiLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJib2R5IiwiYm9keVRleHQiLCJyb3ciLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJwcmVmaXhUZCIsInRleHRDb250ZW50IiwiYXBwZW5kQ2hpbGQiLCJuYW1lVGQiLCJzY29wZVRkIiwiYm9keVRkIiwiY3JlYXRlQnV0dG9uc0ZvclNuaXBwZXRSb3ciLCJzY29wZSIsImNoaWxkcmVuIiwibGVuZ3RoIiwiZWxlbWVudCIsInN0eWxlIiwiZGlzcGxheSIsInRkIiwiYnV0dG9uQ29udGFpbmVyIiwidmlld0J1dHRvbiIsImNvcHlCdXR0b24iLCJzZXRBdHRyaWJ1dGUiLCJ0b29sdGlwIiwidG9vbHRpcHMiLCJ0aXRsZSIsImh0bWwiLCJ0cmlnZ2VyIiwicGxhY2VtZW50IiwicHJldmVudERlZmF1bHQiLCJ3cml0ZVNuaXBwZXRUb0NsaXBib2FyZCIsImNvbnRlbnQiLCJleHRlbnNpb24iLCJleHRuYW1lIiwiZ2V0VXNlclNuaXBwZXRzUGF0aCIsInJlcGxhY2UiLCJjbGlwYm9hcmQiLCJ3cml0ZSJdLCJzb3VyY2VzIjpbInBhY2thZ2Utc25pcHBldHMtdmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG4vKiogQGpzeCBldGNoLmRvbSAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xuaW1wb3J0IGV0Y2ggZnJvbSAnZXRjaCdcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcblxuLy8gVmlldyB0byBkaXNwbGF5IHRoZSBzbmlwcGV0cyB0aGF0IGEgcGFja2FnZSBoYXMgcmVnaXN0ZXJlZC5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhY2thZ2VTbmlwcGV0c1ZpZXcge1xuICBjb25zdHJ1Y3RvciAocGFjaywgc25pcHBldHNQcm92aWRlcikge1xuICAgIHRoaXMucGFjayA9IHBhY2tcbiAgICB0aGlzLm5hbWVzcGFjZSA9IHRoaXMucGFjay5uYW1lXG4gICAgdGhpcy5zbmlwcGV0c1Byb3ZpZGVyID0gc25pcHBldHNQcm92aWRlclxuICAgIHRoaXMucGFja2FnZVBhdGggPSBwYXRoLmpvaW4ocGFjay5wYXRoLCBwYXRoLnNlcClcbiAgICBldGNoLmluaXRpYWxpemUodGhpcylcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMudXBkYXRlU25pcHBldHNWaWV3KClcblxuICAgIGNvbnN0IHBhY2thZ2VzV2l0aFNuaXBwZXRzRGlzYWJsZWQgPSBhdG9tLmNvbmZpZy5nZXQoJ2NvcmUucGFja2FnZXNXaXRoU25pcHBldHNEaXNhYmxlZCcpIHx8IFtdXG4gICAgdGhpcy5yZWZzLnNuaXBwZXRUb2dnbGUuY2hlY2tlZCA9ICFwYWNrYWdlc1dpdGhTbmlwcGV0c0Rpc2FibGVkLmluY2x1ZGVzKHRoaXMubmFtZXNwYWNlKVxuXG4gICAgY29uc3QgY2hhbmdlSGFuZGxlciA9IChldmVudCkgPT4ge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5yZWZzLnNuaXBwZXRUb2dnbGUuY2hlY2tlZFxuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIGF0b20uY29uZmlnLnJlbW92ZUF0S2V5UGF0aCgnY29yZS5wYWNrYWdlc1dpdGhTbmlwcGV0c0Rpc2FibGVkJywgdGhpcy5uYW1lc3BhY2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLmNvbmZpZy5wdXNoQXRLZXlQYXRoKCdjb3JlLnBhY2thZ2VzV2l0aFNuaXBwZXRzRGlzYWJsZWQnLCB0aGlzLm5hbWVzcGFjZSlcbiAgICAgIH1cbiAgICAgIHRoaXMudXBkYXRlU25pcHBldHNWaWV3KClcbiAgICB9XG5cbiAgICB0aGlzLnJlZnMuc25pcHBldFRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBjaGFuZ2VIYW5kbGVyKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdGhpcy5yZWZzLnNuaXBwZXRUb2dnbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgY2hhbmdlSGFuZGxlcikgfSkpXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIHJldHVybiBldGNoLmRlc3Ryb3kodGhpcylcbiAgfVxuXG4gIHVwZGF0ZSAoKSB7fVxuXG4gIHJlbmRlciAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT0nc2VjdGlvbic+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZWN0aW9uLWhlYWRpbmcgaWNvbiBpY29uLWNvZGUnPlNuaXBwZXRzPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjaGVja2JveCc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0ndG9nZ2xlU25pcHBldHMnPlxuICAgICAgICAgICAgPGlucHV0IGlkPSd0b2dnbGVTbmlwcGV0cycgY2xhc3NOYW1lPSdpbnB1dC1jaGVja2JveCcgdHlwZT0nY2hlY2tib3gnIHJlZj0nc25pcHBldFRvZ2dsZScgLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZXR0aW5nLXRpdGxlJz5FbmFibGU8L2Rpdj5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZXR0aW5nLWRlc2NyaXB0aW9uJz5cbiAgICAgICAgICAgIHsnRGlzYWJsZSB0aGlzIGlmIHlvdSB3YW50IHRvIHByZXZlbnQgdGhpcyBwYWNrYWdl4oCZcyBzbmlwcGV0cyBmcm9tIGFwcGVhcmluZyBhcyBzdWdnZXN0aW9ucyBvciBpZiB5b3Ugd2FudCB0byBjdXN0b21pemUgdGhlbSBpbiB5b3VyIHNuaXBwZXRzIGZpbGUuJ31cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT0ncGFja2FnZS1zbmlwcGV0cy10YWJsZSB0YWJsZSBuYXRpdmUta2V5LWJpbmRpbmdzIHRleHQnIHRhYkluZGV4PXstMX0+XG4gICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICA8dGg+VHJpZ2dlcjwvdGg+XG4gICAgICAgICAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgICAgICAgICAgPHRoPlNjb3BlPC90aD5cbiAgICAgICAgICAgICAgPHRoPkJvZHk8L3RoPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgIDx0Ym9keSByZWY9J3NuaXBwZXRzJyAvPlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgPC9zZWN0aW9uPlxuICAgIClcbiAgfVxuXG4gIGdldFNuaXBwZXRQcm9wZXJ0aWVzICgpIHtcbiAgICBjb25zdCBwYWNrYWdlUHJvcGVydGllcyA9IHt9XG4gICAgZm9yIChjb25zdCB7bmFtZSwgcHJvcGVydGllcywgc2VsZWN0b3JTdHJpbmd9IG9mIHRoaXMuc25pcHBldHNQcm92aWRlci5nZXRTbmlwcGV0cygpKSB7XG4gICAgICBpZiAobmFtZSAmJiBuYW1lLmluZGV4T2YgJiYgbmFtZS5pbmRleE9mKHRoaXMucGFja2FnZVBhdGgpID09PSAwKSB7XG4gICAgICAgIGNvbnN0IG9iamVjdCA9IHByb3BlcnRpZXMuc25pcHBldHMgIT0gbnVsbCA/IHByb3BlcnRpZXMuc25pcHBldHMgOiB7fVxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgY29uc3Qgc25pcHBldCA9IG9iamVjdFtrZXldXG4gICAgICAgICAgaWYgKHNuaXBwZXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgc25pcHBldC5zZWxlY3RvclN0cmluZyA9IHNlbGVjdG9yU3RyaW5nXG4gICAgICAgICAgICBpZiAocGFja2FnZVByb3BlcnRpZXNba2V5XSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHBhY2thZ2VQcm9wZXJ0aWVzW2tleV0gPSBzbmlwcGV0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF8udmFsdWVzKHBhY2thZ2VQcm9wZXJ0aWVzKS5zb3J0KChzbmlwcGV0MSwgc25pcHBldDIpID0+IHtcbiAgICAgIGNvbnN0IHByZWZpeDEgPSBzbmlwcGV0MS5wcmVmaXggIT0gbnVsbCA/IHNuaXBwZXQxLnByZWZpeCA6ICcnXG4gICAgICBjb25zdCBwcmVmaXgyID0gc25pcHBldDIucHJlZml4ICE9IG51bGwgPyBzbmlwcGV0Mi5wcmVmaXggOiAnJ1xuICAgICAgcmV0dXJuIHByZWZpeDEubG9jYWxlQ29tcGFyZShwcmVmaXgyKVxuICAgIH0pXG4gIH1cblxuICBnZXRTbmlwcGV0cyAoY2FsbGJhY2spIHtcbiAgICBjb25zdCBzbmlwcGV0c1BhY2thZ2UgPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ3NuaXBwZXRzJylcbiAgICBjb25zdCBzbmlwcGV0c01vZHVsZSA9IHNuaXBwZXRzUGFja2FnZSA/IHNuaXBwZXRzUGFja2FnZS5tYWluTW9kdWxlIDogbnVsbFxuICAgIGlmIChzbmlwcGV0c01vZHVsZSkge1xuICAgICAgaWYgKHNuaXBwZXRzTW9kdWxlLmxvYWRlZCkge1xuICAgICAgICBjYWxsYmFjayh0aGlzLmdldFNuaXBwZXRQcm9wZXJ0aWVzKCkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzbmlwcGV0c01vZHVsZS5vbkRpZExvYWRTbmlwcGV0cygoKSA9PiBjYWxsYmFjayh0aGlzLmdldFNuaXBwZXRQcm9wZXJ0aWVzKCkpKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsYmFjayhbXSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBzdGFuZGFyZC9uby1jYWxsYmFjay1saXRlcmFsXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlU25pcHBldHNWaWV3ICgpIHtcbiAgICBjb25zdCBwYWNrYWdlc1dpdGhTbmlwcGV0c0Rpc2FibGVkID0gYXRvbS5jb25maWcuZ2V0KCdjb3JlLnBhY2thZ2VzV2l0aFNuaXBwZXRzRGlzYWJsZWQnKSB8fCBbXVxuICAgIGNvbnN0IHNuaXBwZXRzRGlzYWJsZWQgPSBwYWNrYWdlc1dpdGhTbmlwcGV0c0Rpc2FibGVkLmluY2x1ZGVzKHRoaXMubmFtZXNwYWNlKVxuXG4gICAgdGhpcy5nZXRTbmlwcGV0cygoc25pcHBldHMpID0+IHtcbiAgICAgIHRoaXMucmVmcy5zbmlwcGV0cy5pbm5lckhUTUwgPSAnJ1xuXG4gICAgICBpZiAoc25pcHBldHNEaXNhYmxlZCkge1xuICAgICAgICB0aGlzLnJlZnMuc25pcHBldHMuY2xhc3NMaXN0LmFkZCgndGV4dC1zdWJ0bGUnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWZzLnNuaXBwZXRzLmNsYXNzTGlzdC5yZW1vdmUoJ3RleHQtc3VidGxlJylcbiAgICAgIH1cblxuICAgICAgZm9yIChsZXQge2JvZHksIGJvZHlUZXh0LCBuYW1lLCBwcmVmaXgsIHNlbGVjdG9yU3RyaW5nfSBvZiBzbmlwcGV0cykge1xuICAgICAgICBpZiAobmFtZSA9PSBudWxsKSB7XG4gICAgICAgICAgbmFtZSA9ICcnXG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJlZml4ID09IG51bGwpIHtcbiAgICAgICAgICBwcmVmaXggPSAnJ1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJvZHkgPT0gbnVsbCkge1xuICAgICAgICAgIGJvZHkgPSBib2R5VGV4dCB8fCAnJ1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGVjdG9yU3RyaW5nID09IG51bGwpIHtcbiAgICAgICAgICBzZWxlY3RvclN0cmluZyA9ICcnXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpXG5cbiAgICAgICAgY29uc3QgcHJlZml4VGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpXG4gICAgICAgIHByZWZpeFRkLmNsYXNzTGlzdC5hZGQoJ3NuaXBwZXQtcHJlZml4JylcbiAgICAgICAgcHJlZml4VGQudGV4dENvbnRlbnQgPSBwcmVmaXhcbiAgICAgICAgcm93LmFwcGVuZENoaWxkKHByZWZpeFRkKVxuXG4gICAgICAgIGNvbnN0IG5hbWVUZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJylcbiAgICAgICAgbmFtZVRkLnRleHRDb250ZW50ID0gbmFtZVxuICAgICAgICByb3cuYXBwZW5kQ2hpbGQobmFtZVRkKVxuXG4gICAgICAgIGNvbnN0IHNjb3BlVGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpXG4gICAgICAgIHNjb3BlVGQuY2xhc3NMaXN0LmFkZCgnc25pcHBldC1zY29wZS1uYW1lJylcbiAgICAgICAgc2NvcGVUZC50ZXh0Q29udGVudCA9IHNlbGVjdG9yU3RyaW5nXG4gICAgICAgIHJvdy5hcHBlbmRDaGlsZChzY29wZVRkKVxuXG4gICAgICAgIGNvbnN0IGJvZHlUZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJylcbiAgICAgICAgYm9keVRkLmNsYXNzTGlzdC5hZGQoJ3NuaXBwZXQtYm9keScpXG4gICAgICAgIHJvdy5hcHBlbmRDaGlsZChib2R5VGQpXG5cbiAgICAgICAgdGhpcy5yZWZzLnNuaXBwZXRzLmFwcGVuZENoaWxkKHJvdylcbiAgICAgICAgdGhpcy5jcmVhdGVCdXR0b25zRm9yU25pcHBldFJvdyhib2R5VGQsIHtib2R5LCBwcmVmaXgsIHNjb3BlOiBzZWxlY3RvclN0cmluZywgbmFtZX0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnJlZnMuc25pcHBldHMuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBjcmVhdGVCdXR0b25zRm9yU25pcHBldFJvdyAodGQsIHtzY29wZSwgYm9keSwgbmFtZSwgcHJlZml4fSkge1xuICAgIGxldCBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGJ1dHRvbkNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdidG4tZ3JvdXAnLCAnYnRuLWdyb3VwLXhzJylcblxuICAgIGxldCB2aWV3QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgICBsZXQgY29weUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG5cbiAgICB2aWV3QnV0dG9uLnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKVxuICAgIHZpZXdCdXR0b24udGV4dENvbnRlbnQgPSAnVmlldydcbiAgICB2aWV3QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bicsICdzbmlwcGV0LXZpZXctYnRuJylcblxuICAgIGxldCB0b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQodmlld0J1dHRvbiwge1xuICAgICAgdGl0bGU6IGJvZHksXG4gICAgICBodG1sOiBmYWxzZSxcbiAgICAgIHRyaWdnZXI6ICdjbGljaycsXG4gICAgICBwbGFjZW1lbnQ6ICdhdXRvIGxlZnQnLFxuICAgICAgJ2NsYXNzJzogJ3NuaXBwZXQtYm9keS10b29sdGlwJ1xuICAgIH0pXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0b29sdGlwKVxuXG4gICAgY29weUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJylcbiAgICBjb3B5QnV0dG9uLnRleHRDb250ZW50ID0gJ0NvcHknXG4gICAgY29weUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4nLCAnc25pcHBldC1jb3B5LWJ0bicpXG5cbiAgICBjb3B5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm4gdGhpcy53cml0ZVNuaXBwZXRUb0NsaXBib2FyZCh7c2NvcGUsIGJvZHksIG5hbWUsIHByZWZpeH0pXG4gICAgfSlcblxuICAgIGJ1dHRvbkNvbnRhaW5lci5hcHBlbmRDaGlsZCh2aWV3QnV0dG9uKVxuICAgIGJ1dHRvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChjb3B5QnV0dG9uKVxuXG4gICAgdGQuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKVxuICB9XG5cbiAgd3JpdGVTbmlwcGV0VG9DbGlwYm9hcmQgKHtzY29wZSwgYm9keSwgbmFtZSwgcHJlZml4fSkge1xuICAgIGxldCBjb250ZW50XG4gICAgY29uc3QgZXh0ZW5zaW9uID0gcGF0aC5leHRuYW1lKHRoaXMuc25pcHBldHNQcm92aWRlci5nZXRVc2VyU25pcHBldHNQYXRoKCkpXG4gICAgYm9keSA9IGJvZHkucmVwbGFjZSgvXFxuL2csICdcXFxcbicpLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxuICAgIGlmIChleHRlbnNpb24gPT09ICcuY3NvbicpIHtcbiAgICAgIGJvZHkgPSBib2R5LnJlcGxhY2UoLycvZywgYFxcXFwnYClcbiAgICAgIGNvbnRlbnQgPSBgXG4nJHtzY29wZX0nOlxuICAnJHtuYW1lfSc6XG4gICAgJ3ByZWZpeCc6ICcke3ByZWZpeH0nXG4gICAgJ2JvZHknOiAnJHtib2R5fSdcbmBcbiAgICB9IGVsc2Uge1xuICAgICAgYm9keSA9IGJvZHkucmVwbGFjZSgvXCIvZywgYFxcXFxcImApXG4gICAgICBjb250ZW50ID0gYFxuICBcIiR7c2NvcGV9XCI6IHtcbiAgICBcIiR7bmFtZX1cIjoge1xuICAgICAgXCJwcmVmaXhcIjogXCIke3ByZWZpeH1cIixcbiAgICAgIFwiYm9keVwiOiBcIiR7Ym9keX1cIlxuICAgIH1cbiAgfVxuYFxuICAgIH1cblxuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGNvbnRlbnQpXG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFBb0Q7QUFOcEQ7QUFDQTs7QUFPQTtBQUNlLE1BQU1BLG1CQUFt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