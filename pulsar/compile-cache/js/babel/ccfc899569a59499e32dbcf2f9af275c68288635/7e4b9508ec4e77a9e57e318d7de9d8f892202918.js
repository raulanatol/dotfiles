"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _atom = require("atom");
var _etch = _interopRequireDefault(require("etch"));
var _underscorePlus = _interopRequireDefault(require("underscore-plus"));
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */
/** @jsx etch.dom */

class KeybindingsPanel {
  constructor() {
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
    this.otherPlatformPattern = new RegExp(`\\.platform-(?!${_underscorePlus.default.escapeRegExp(process.platform)}\\b)`);
    this.platformPattern = new RegExp(`\\.platform-${_underscorePlus.default.escapeRegExp(process.platform)}\\b`);
    this.disposables.add(this.refs.searchEditor.onDidStopChanging(() => {
      this.filterKeyBindings(this.keyBindings, this.refs.searchEditor.getText());
    }));
    this.disposables.add(atom.keymaps.onDidReloadKeymap(() => {
      this.loadKeyBindings();
    }));
    this.disposables.add(atom.keymaps.onDidUnloadKeymap(() => {
      this.loadKeyBindings();
    }));
    this.loadKeyBindings();
  }
  destroy() {
    this.disposables.dispose();
    return _etch.default.destroy(this);
  }
  update() {}
  render() {
    return _etch.default.dom("div", {
      className: "panels-item",
      tabIndex: "-1"
    }, _etch.default.dom("section", {
      className: "keybinding-panel section"
    }, _etch.default.dom("div", {
      className: "section-heading icon icon-keyboard"
    }, "Keybindings"), _etch.default.dom("div", {
      className: "text native-key-bindings",
      tabIndex: "-1"
    }, _etch.default.dom("span", {
      className: "icon icon-question"
    }), _etch.default.dom("span", null, "You can override these keybindings by copying "), _etch.default.dom("span", {
      className: "icon icon-clippy"
    }), _etch.default.dom("span", null, "and pasting them into "), _etch.default.dom("a", {
      className: "link",
      onclick: this.didClickOpenKeymapFile
    }, "your keymap file")), _etch.default.dom("div", {
      className: "editor-container"
    }, _etch.default.dom(_atom.TextEditor, {
      mini: true,
      ref: "searchEditor",
      placeholderText: "Search keybindings"
    })), _etch.default.dom("table", {
      className: "native-key-bindings table text",
      tabIndex: "-1"
    }, _etch.default.dom("col", {
      className: "keystroke"
    }), _etch.default.dom("col", {
      className: "command"
    }), _etch.default.dom("col", {
      className: "source"
    }), _etch.default.dom("col", {
      className: "selector"
    }), _etch.default.dom("thead", null, _etch.default.dom("tr", null, _etch.default.dom("th", {
      className: "keystroke"
    }, "Keystroke"), _etch.default.dom("th", {
      className: "command"
    }, "Command"), _etch.default.dom("th", {
      className: "source"
    }, "Source"), _etch.default.dom("th", {
      className: "selector"
    }, "Selector"))), _etch.default.dom("tbody", {
      ref: "keybindingRows"
    }))));
  }
  loadKeyBindings() {
    this.refs.keybindingRows.innerHTML = '';
    this.keyBindings = _underscorePlus.default.sortBy(atom.keymaps.getKeyBindings(), 'keystrokes');
    this.appendKeyBindings(this.keyBindings);
    this.filterKeyBindings(this.keyBindings, this.refs.searchEditor.getText());
  }
  focus() {
    this.refs.searchEditor.element.focus();
  }
  show() {
    this.element.style.display = '';
  }
  filterKeyBindings(keyBindings, filterString) {
    this.refs.keybindingRows.innerHTML = '';
    for (let keyBinding of keyBindings) {
      let {
        selector,
        keystrokes,
        command,
        source
      } = keyBinding;
      source = KeybindingsPanel.determineSource(source);
      var searchString = `${selector}${keystrokes}${command}${source}`.toLowerCase();
      if (!searchString) {
        continue;
      }
      const keywords = filterString.trim().toLowerCase().split(' ');
      if (keywords.every(keyword => searchString.indexOf(keyword) !== -1)) {
        this.appendKeyBinding(keyBinding);
      }
    }
  }
  appendKeyBindings(keyBindings) {
    for (const keyBinding of keyBindings) {
      this.appendKeyBinding(keyBinding);
    }
  }
  appendKeyBinding(keyBinding) {
    if (!this.showSelector(keyBinding.selector)) {
      return;
    }
    const element = this.elementForKeyBinding(keyBinding);
    element.dataset.keyBinding = keyBinding;
    this.refs.keybindingRows.appendChild(element);
  }
  showSelector(selector) {
    let segments;
    if (selector) {
      segments = selector.split(',') || [];
    } else {
      segments = [];
    }
    return segments.some(s => this.platformPattern.test(s) || !this.otherPlatformPattern.test(s));
  }
  elementForKeyBinding(keyBinding) {
    let {
      selector,
      keystrokes,
      command,
      source
    } = keyBinding;
    source = KeybindingsPanel.determineSource(source);
    const tr = document.createElement('tr');
    if (source === 'User') {
      tr.classList.add('is-user');
    }
    const keystrokeTd = document.createElement('td');
    keystrokeTd.classList.add('keystroke');
    const copyIcon = document.createElement('span');
    copyIcon.classList.add('icon', 'icon-clippy', 'copy-icon');
    copyIcon.onclick = () => {
      let content;
      const keymapExtension = _path.default.extname(atom.keymaps.getUserKeymapPath());
      const escapeCSON = input => {
        return JSON.stringify(input).slice(1, -1) // Remove wrapping double quotes
        .replace(/\\"/g, '"') // Unescape double quotes
        .replace(/'/g, '\\\''); // Escape single quotes
      };

      if (keymapExtension === '.cson') {
        content = `'${escapeCSON(selector)}':\n  '${escapeCSON(keystrokes)}': '${escapeCSON(command)}'`;
      } else {
        content = `${JSON.stringify(selector)}: {\n  ${JSON.stringify(keystrokes)}: ${JSON.stringify(command)}\n}`;
      }
      return atom.clipboard.write(content);
    };
    keystrokeTd.appendChild(copyIcon);
    const keystrokesSpan = document.createElement('span');
    keystrokesSpan.textContent = keystrokes;
    keystrokeTd.appendChild(keystrokesSpan);
    tr.appendChild(keystrokeTd);
    const commandTd = document.createElement('td');
    commandTd.classList.add('command');
    commandTd.textContent = command;
    tr.appendChild(commandTd);
    const sourceTd = document.createElement('td');
    sourceTd.classList.add('source');
    sourceTd.textContent = source;
    tr.appendChild(sourceTd);
    const selectorTd = document.createElement('td');
    selectorTd.classList.add('selector');
    selectorTd.textContent = selector;
    tr.appendChild(selectorTd);
    return tr;
  }
  didClickOpenKeymapFile(e) {
    e.preventDefault();
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'application:open-your-keymap');
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

  // Private: Returns a user friendly description of where a keybinding was
  // loaded from.
  //
  // * filePath:
  //   The absolute path from which the keymap was loaded
  //
  // Returns one of:
  // * `Core` indicates it comes from a bundled package.
  // * `User` indicates that it was defined by a user.
  // * `<package-name>` the package which defined it.
  // * `Unknown` if an invalid path was passed in.
  static determineSource(filePath) {
    if (!filePath) {
      return 'Unknown';
    }
    if (filePath.indexOf(_path.default.join(atom.getLoadSettings().resourcePath, 'keymaps')) === 0) {
      return 'Core';
    } else if (filePath === atom.keymaps.getUserKeymapPath()) {
      return 'User';
    } else {
      const pathParts = filePath.split(_path.default.sep);
      const packageNameIndex = pathParts.length - 3;
      const packageName = pathParts[packageNameIndex] != null ? pathParts[packageNameIndex] : '';
      return _underscorePlus.default.undasherize(_underscorePlus.default.uncamelcase(packageName));
    }
  }
}
exports.default = KeybindingsPanel;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLZXliaW5kaW5nc1BhbmVsIiwiY29uc3RydWN0b3IiLCJldGNoIiwiaW5pdGlhbGl6ZSIsImRpc3Bvc2FibGVzIiwiQ29tcG9zaXRlRGlzcG9zYWJsZSIsImFkZCIsImF0b20iLCJjb21tYW5kcyIsImVsZW1lbnQiLCJzY3JvbGxVcCIsInNjcm9sbERvd24iLCJwYWdlVXAiLCJwYWdlRG93biIsInNjcm9sbFRvVG9wIiwic2Nyb2xsVG9Cb3R0b20iLCJvdGhlclBsYXRmb3JtUGF0dGVybiIsIlJlZ0V4cCIsIl8iLCJlc2NhcGVSZWdFeHAiLCJwcm9jZXNzIiwicGxhdGZvcm0iLCJwbGF0Zm9ybVBhdHRlcm4iLCJyZWZzIiwic2VhcmNoRWRpdG9yIiwib25EaWRTdG9wQ2hhbmdpbmciLCJmaWx0ZXJLZXlCaW5kaW5ncyIsImtleUJpbmRpbmdzIiwiZ2V0VGV4dCIsImtleW1hcHMiLCJvbkRpZFJlbG9hZEtleW1hcCIsImxvYWRLZXlCaW5kaW5ncyIsIm9uRGlkVW5sb2FkS2V5bWFwIiwiZGVzdHJveSIsImRpc3Bvc2UiLCJ1cGRhdGUiLCJyZW5kZXIiLCJkaWRDbGlja09wZW5LZXltYXBGaWxlIiwia2V5YmluZGluZ1Jvd3MiLCJpbm5lckhUTUwiLCJzb3J0QnkiLCJnZXRLZXlCaW5kaW5ncyIsImFwcGVuZEtleUJpbmRpbmdzIiwiZm9jdXMiLCJzaG93Iiwic3R5bGUiLCJkaXNwbGF5IiwiZmlsdGVyU3RyaW5nIiwia2V5QmluZGluZyIsInNlbGVjdG9yIiwia2V5c3Ryb2tlcyIsImNvbW1hbmQiLCJzb3VyY2UiLCJkZXRlcm1pbmVTb3VyY2UiLCJzZWFyY2hTdHJpbmciLCJ0b0xvd2VyQ2FzZSIsImtleXdvcmRzIiwidHJpbSIsInNwbGl0IiwiZXZlcnkiLCJrZXl3b3JkIiwiaW5kZXhPZiIsImFwcGVuZEtleUJpbmRpbmciLCJzaG93U2VsZWN0b3IiLCJlbGVtZW50Rm9yS2V5QmluZGluZyIsImRhdGFzZXQiLCJhcHBlbmRDaGlsZCIsInNlZ21lbnRzIiwic29tZSIsInMiLCJ0ZXN0IiwidHIiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc0xpc3QiLCJrZXlzdHJva2VUZCIsImNvcHlJY29uIiwib25jbGljayIsImNvbnRlbnQiLCJrZXltYXBFeHRlbnNpb24iLCJwYXRoIiwiZXh0bmFtZSIsImdldFVzZXJLZXltYXBQYXRoIiwiZXNjYXBlQ1NPTiIsImlucHV0IiwiSlNPTiIsInN0cmluZ2lmeSIsInNsaWNlIiwicmVwbGFjZSIsImNsaXBib2FyZCIsIndyaXRlIiwia2V5c3Ryb2tlc1NwYW4iLCJ0ZXh0Q29udGVudCIsImNvbW1hbmRUZCIsInNvdXJjZVRkIiwic2VsZWN0b3JUZCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImRpc3BhdGNoIiwidmlld3MiLCJnZXRWaWV3Iiwid29ya3NwYWNlIiwic2Nyb2xsVG9wIiwiYm9keSIsIm9mZnNldEhlaWdodCIsInNjcm9sbEhlaWdodCIsImZpbGVQYXRoIiwiam9pbiIsImdldExvYWRTZXR0aW5ncyIsInJlc291cmNlUGF0aCIsInBhdGhQYXJ0cyIsInNlcCIsInBhY2thZ2VOYW1lSW5kZXgiLCJsZW5ndGgiLCJwYWNrYWdlTmFtZSIsInVuZGFzaGVyaXplIiwidW5jYW1lbGNhc2UiXSwic291cmNlcyI6WyJrZXliaW5kaW5ncy1wYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG4vKiogQGpzeCBldGNoLmRvbSAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIFRleHRFZGl0b3J9IGZyb20gJ2F0b20nXG5pbXBvcnQgZXRjaCBmcm9tICdldGNoJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2V5YmluZGluZ3NQYW5lbCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBldGNoLmluaXRpYWxpemUodGhpcylcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCwge1xuICAgICAgJ2NvcmU6bW92ZS11cCc6ICgpID0+IHsgdGhpcy5zY3JvbGxVcCgpIH0sXG4gICAgICAnY29yZTptb3ZlLWRvd24nOiAoKSA9PiB7IHRoaXMuc2Nyb2xsRG93bigpIH0sXG4gICAgICAnY29yZTpwYWdlLXVwJzogKCkgPT4geyB0aGlzLnBhZ2VVcCgpIH0sXG4gICAgICAnY29yZTpwYWdlLWRvd24nOiAoKSA9PiB7IHRoaXMucGFnZURvd24oKSB9LFxuICAgICAgJ2NvcmU6bW92ZS10by10b3AnOiAoKSA9PiB7IHRoaXMuc2Nyb2xsVG9Ub3AoKSB9LFxuICAgICAgJ2NvcmU6bW92ZS10by1ib3R0b20nOiAoKSA9PiB7IHRoaXMuc2Nyb2xsVG9Cb3R0b20oKSB9XG4gICAgfSkpXG4gICAgdGhpcy5vdGhlclBsYXRmb3JtUGF0dGVybiA9IG5ldyBSZWdFeHAoYFxcXFwucGxhdGZvcm0tKD8hJHtfLmVzY2FwZVJlZ0V4cChwcm9jZXNzLnBsYXRmb3JtKX1cXFxcYilgKVxuICAgIHRoaXMucGxhdGZvcm1QYXR0ZXJuID0gbmV3IFJlZ0V4cChgXFxcXC5wbGF0Zm9ybS0ke18uZXNjYXBlUmVnRXhwKHByb2Nlc3MucGxhdGZvcm0pfVxcXFxiYClcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMucmVmcy5zZWFyY2hFZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcoKCkgPT4ge1xuICAgICAgdGhpcy5maWx0ZXJLZXlCaW5kaW5ncyh0aGlzLmtleUJpbmRpbmdzLCB0aGlzLnJlZnMuc2VhcmNoRWRpdG9yLmdldFRleHQoKSlcbiAgICB9KSlcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20ua2V5bWFwcy5vbkRpZFJlbG9hZEtleW1hcCgoKSA9PiB7IHRoaXMubG9hZEtleUJpbmRpbmdzKCkgfSkpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5rZXltYXBzLm9uRGlkVW5sb2FkS2V5bWFwKCgpID0+IHsgdGhpcy5sb2FkS2V5QmluZGluZ3MoKSB9KSlcbiAgICB0aGlzLmxvYWRLZXlCaW5kaW5ncygpXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIHJldHVybiBldGNoLmRlc3Ryb3kodGhpcylcbiAgfVxuXG4gIHVwZGF0ZSAoKSB7fVxuXG4gIHJlbmRlciAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdwYW5lbHMtaXRlbScgdGFiSW5kZXg9Jy0xJz5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPSdrZXliaW5kaW5nLXBhbmVsIHNlY3Rpb24nPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZWN0aW9uLWhlYWRpbmcgaWNvbiBpY29uLWtleWJvYXJkJz5LZXliaW5kaW5nczwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSd0ZXh0IG5hdGl2ZS1rZXktYmluZGluZ3MnIHRhYkluZGV4PSctMSc+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J2ljb24gaWNvbi1xdWVzdGlvbicgLz5cbiAgICAgICAgICAgIDxzcGFuPllvdSBjYW4gb3ZlcnJpZGUgdGhlc2Uga2V5YmluZGluZ3MgYnkgY29weWluZyA8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J2ljb24gaWNvbi1jbGlwcHknIC8+XG4gICAgICAgICAgICA8c3Bhbj5hbmQgcGFzdGluZyB0aGVtIGludG8gPC9zcGFuPlxuICAgICAgICAgICAgPGEgY2xhc3NOYW1lPSdsaW5rJyBvbmNsaWNrPXt0aGlzLmRpZENsaWNrT3BlbktleW1hcEZpbGV9PnlvdXIga2V5bWFwIGZpbGU8L2E+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nZWRpdG9yLWNvbnRhaW5lcic+XG4gICAgICAgICAgICA8VGV4dEVkaXRvciBtaW5pIHJlZj0nc2VhcmNoRWRpdG9yJyBwbGFjZWhvbGRlclRleHQ9J1NlYXJjaCBrZXliaW5kaW5ncycgLz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9J25hdGl2ZS1rZXktYmluZGluZ3MgdGFibGUgdGV4dCcgdGFiSW5kZXg9Jy0xJz5cbiAgICAgICAgICAgIDxjb2wgY2xhc3NOYW1lPSdrZXlzdHJva2UnIC8+XG4gICAgICAgICAgICA8Y29sIGNsYXNzTmFtZT0nY29tbWFuZCcgLz5cbiAgICAgICAgICAgIDxjb2wgY2xhc3NOYW1lPSdzb3VyY2UnIC8+XG4gICAgICAgICAgICA8Y29sIGNsYXNzTmFtZT0nc2VsZWN0b3InIC8+XG4gICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPSdrZXlzdHJva2UnPktleXN0cm9rZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT0nY29tbWFuZCc+Q29tbWFuZDwvdGg+XG4gICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT0nc291cmNlJz5Tb3VyY2U8L3RoPlxuICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9J3NlbGVjdG9yJz5TZWxlY3RvcjwvdGg+XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgPHRib2R5IHJlZj0na2V5YmluZGluZ1Jvd3MnIC8+XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgbG9hZEtleUJpbmRpbmdzICgpIHtcbiAgICB0aGlzLnJlZnMua2V5YmluZGluZ1Jvd3MuaW5uZXJIVE1MID0gJydcbiAgICB0aGlzLmtleUJpbmRpbmdzID0gXy5zb3J0QnkoYXRvbS5rZXltYXBzLmdldEtleUJpbmRpbmdzKCksICdrZXlzdHJva2VzJylcbiAgICB0aGlzLmFwcGVuZEtleUJpbmRpbmdzKHRoaXMua2V5QmluZGluZ3MpXG4gICAgdGhpcy5maWx0ZXJLZXlCaW5kaW5ncyh0aGlzLmtleUJpbmRpbmdzLCB0aGlzLnJlZnMuc2VhcmNoRWRpdG9yLmdldFRleHQoKSlcbiAgfVxuXG4gIGZvY3VzICgpIHtcbiAgICB0aGlzLnJlZnMuc2VhcmNoRWRpdG9yLmVsZW1lbnQuZm9jdXMoKVxuICB9XG5cbiAgc2hvdyAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJ1xuICB9XG5cbiAgZmlsdGVyS2V5QmluZGluZ3MgKGtleUJpbmRpbmdzLCBmaWx0ZXJTdHJpbmcpIHtcbiAgICB0aGlzLnJlZnMua2V5YmluZGluZ1Jvd3MuaW5uZXJIVE1MID0gJydcbiAgICBmb3IgKGxldCBrZXlCaW5kaW5nIG9mIGtleUJpbmRpbmdzKSB7XG4gICAgICBsZXQge3NlbGVjdG9yLCBrZXlzdHJva2VzLCBjb21tYW5kLCBzb3VyY2V9ID0ga2V5QmluZGluZ1xuICAgICAgc291cmNlID0gS2V5YmluZGluZ3NQYW5lbC5kZXRlcm1pbmVTb3VyY2Uoc291cmNlKVxuICAgICAgdmFyIHNlYXJjaFN0cmluZyA9IGAke3NlbGVjdG9yfSR7a2V5c3Ryb2tlc30ke2NvbW1hbmR9JHtzb3VyY2V9YC50b0xvd2VyQ2FzZSgpXG4gICAgICBpZiAoIXNlYXJjaFN0cmluZykge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBrZXl3b3JkcyA9IGZpbHRlclN0cmluZy50cmltKCkudG9Mb3dlckNhc2UoKS5zcGxpdCgnICcpXG4gICAgICBpZiAoa2V5d29yZHMuZXZlcnkoa2V5d29yZCA9PiBzZWFyY2hTdHJpbmcuaW5kZXhPZihrZXl3b3JkKSAhPT0gLTEpKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kS2V5QmluZGluZyhrZXlCaW5kaW5nKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFwcGVuZEtleUJpbmRpbmdzIChrZXlCaW5kaW5ncykge1xuICAgIGZvciAoY29uc3Qga2V5QmluZGluZyBvZiBrZXlCaW5kaW5ncykge1xuICAgICAgdGhpcy5hcHBlbmRLZXlCaW5kaW5nKGtleUJpbmRpbmcpXG4gICAgfVxuICB9XG5cbiAgYXBwZW5kS2V5QmluZGluZyAoa2V5QmluZGluZykge1xuICAgIGlmICghdGhpcy5zaG93U2VsZWN0b3Ioa2V5QmluZGluZy5zZWxlY3RvcikpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRGb3JLZXlCaW5kaW5nKGtleUJpbmRpbmcpXG4gICAgZWxlbWVudC5kYXRhc2V0LmtleUJpbmRpbmcgPSBrZXlCaW5kaW5nXG4gICAgdGhpcy5yZWZzLmtleWJpbmRpbmdSb3dzLmFwcGVuZENoaWxkKGVsZW1lbnQpXG4gIH1cblxuICBzaG93U2VsZWN0b3IgKHNlbGVjdG9yKSB7XG4gICAgbGV0IHNlZ21lbnRzXG4gICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICBzZWdtZW50cyA9IHNlbGVjdG9yLnNwbGl0KCcsJykgfHwgW11cbiAgICB9IGVsc2Uge1xuICAgICAgc2VnbWVudHMgPSBbXVxuICAgIH1cblxuICAgIHJldHVybiBzZWdtZW50cy5zb21lKChzKSA9PiB0aGlzLnBsYXRmb3JtUGF0dGVybi50ZXN0KHMpIHx8ICF0aGlzLm90aGVyUGxhdGZvcm1QYXR0ZXJuLnRlc3QocykpXG4gIH1cblxuICBlbGVtZW50Rm9yS2V5QmluZGluZyAoa2V5QmluZGluZykge1xuICAgIGxldCB7c2VsZWN0b3IsIGtleXN0cm9rZXMsIGNvbW1hbmQsIHNvdXJjZX0gPSBrZXlCaW5kaW5nXG4gICAgc291cmNlID0gS2V5YmluZGluZ3NQYW5lbC5kZXRlcm1pbmVTb3VyY2Uoc291cmNlKVxuXG4gICAgY29uc3QgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpXG4gICAgaWYgKHNvdXJjZSA9PT0gJ1VzZXInKSB7XG4gICAgICB0ci5jbGFzc0xpc3QuYWRkKCdpcy11c2VyJylcbiAgICB9XG5cbiAgICBjb25zdCBrZXlzdHJva2VUZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJylcbiAgICBrZXlzdHJva2VUZC5jbGFzc0xpc3QuYWRkKCdrZXlzdHJva2UnKVxuXG4gICAgY29uc3QgY29weUljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBjb3B5SWNvbi5jbGFzc0xpc3QuYWRkKCdpY29uJywgJ2ljb24tY2xpcHB5JywgJ2NvcHktaWNvbicpXG4gICAgY29weUljb24ub25jbGljayA9ICgpID0+IHtcbiAgICAgIGxldCBjb250ZW50XG4gICAgICBjb25zdCBrZXltYXBFeHRlbnNpb24gPSBwYXRoLmV4dG5hbWUoYXRvbS5rZXltYXBzLmdldFVzZXJLZXltYXBQYXRoKCkpXG5cbiAgICAgIGNvbnN0IGVzY2FwZUNTT04gPSAoaW5wdXQpID0+IHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGlucHV0KVxuICAgICAgICAgIC5zbGljZSgxLCAtMSkgLy8gUmVtb3ZlIHdyYXBwaW5nIGRvdWJsZSBxdW90ZXNcbiAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpIC8vIFVuZXNjYXBlIGRvdWJsZSBxdW90ZXNcbiAgICAgICAgICAucmVwbGFjZSgvJy9nLCAnXFxcXFxcJycpIC8vIEVzY2FwZSBzaW5nbGUgcXVvdGVzXG4gICAgICB9XG5cbiAgICAgIGlmIChrZXltYXBFeHRlbnNpb24gPT09ICcuY3NvbicpIHtcbiAgICAgICAgY29udGVudCA9IGAnJHtlc2NhcGVDU09OKHNlbGVjdG9yKX0nOlxcbiAgJyR7ZXNjYXBlQ1NPTihrZXlzdHJva2VzKX0nOiAnJHtlc2NhcGVDU09OKGNvbW1hbmQpfSdgXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZW50ID0gYCR7SlNPTi5zdHJpbmdpZnkoc2VsZWN0b3IpfToge1xcbiAgJHtKU09OLnN0cmluZ2lmeShrZXlzdHJva2VzKX06ICR7SlNPTi5zdHJpbmdpZnkoY29tbWFuZCl9XFxufWBcbiAgICAgIH1cbiAgICAgIHJldHVybiBhdG9tLmNsaXBib2FyZC53cml0ZShjb250ZW50KVxuICAgIH1cbiAgICBrZXlzdHJva2VUZC5hcHBlbmRDaGlsZChjb3B5SWNvbilcblxuICAgIGNvbnN0IGtleXN0cm9rZXNTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAga2V5c3Ryb2tlc1NwYW4udGV4dENvbnRlbnQgPSBrZXlzdHJva2VzXG4gICAga2V5c3Ryb2tlVGQuYXBwZW5kQ2hpbGQoa2V5c3Ryb2tlc1NwYW4pXG4gICAgdHIuYXBwZW5kQ2hpbGQoa2V5c3Ryb2tlVGQpXG5cbiAgICBjb25zdCBjb21tYW5kVGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpXG4gICAgY29tbWFuZFRkLmNsYXNzTGlzdC5hZGQoJ2NvbW1hbmQnKVxuICAgIGNvbW1hbmRUZC50ZXh0Q29udGVudCA9IGNvbW1hbmRcbiAgICB0ci5hcHBlbmRDaGlsZChjb21tYW5kVGQpXG5cbiAgICBjb25zdCBzb3VyY2VUZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJylcbiAgICBzb3VyY2VUZC5jbGFzc0xpc3QuYWRkKCdzb3VyY2UnKVxuICAgIHNvdXJjZVRkLnRleHRDb250ZW50ID0gc291cmNlXG4gICAgdHIuYXBwZW5kQ2hpbGQoc291cmNlVGQpXG5cbiAgICBjb25zdCBzZWxlY3RvclRkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKVxuICAgIHNlbGVjdG9yVGQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0b3InKVxuICAgIHNlbGVjdG9yVGQudGV4dENvbnRlbnQgPSBzZWxlY3RvclxuICAgIHRyLmFwcGVuZENoaWxkKHNlbGVjdG9yVGQpXG5cbiAgICByZXR1cm4gdHJcbiAgfVxuXG4gIGRpZENsaWNrT3BlbktleW1hcEZpbGUgKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdhcHBsaWNhdGlvbjpvcGVuLXlvdXIta2V5bWFwJylcbiAgfVxuXG4gIHNjcm9sbFVwICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wIC09IGRvY3VtZW50LmJvZHkub2Zmc2V0SGVpZ2h0IC8gMjBcbiAgfVxuXG4gIHNjcm9sbERvd24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgKz0gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQgLyAyMFxuICB9XG5cbiAgcGFnZVVwICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wIC09IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgfVxuXG4gIHBhZ2VEb3duICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wICs9IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgfVxuXG4gIHNjcm9sbFRvVG9wICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wID0gMFxuICB9XG5cbiAgc2Nyb2xsVG9Cb3R0b20gKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLmVsZW1lbnQuc2Nyb2xsSGVpZ2h0XG4gIH1cblxuICAvLyBQcml2YXRlOiBSZXR1cm5zIGEgdXNlciBmcmllbmRseSBkZXNjcmlwdGlvbiBvZiB3aGVyZSBhIGtleWJpbmRpbmcgd2FzXG4gIC8vIGxvYWRlZCBmcm9tLlxuICAvL1xuICAvLyAqIGZpbGVQYXRoOlxuICAvLyAgIFRoZSBhYnNvbHV0ZSBwYXRoIGZyb20gd2hpY2ggdGhlIGtleW1hcCB3YXMgbG9hZGVkXG4gIC8vXG4gIC8vIFJldHVybnMgb25lIG9mOlxuICAvLyAqIGBDb3JlYCBpbmRpY2F0ZXMgaXQgY29tZXMgZnJvbSBhIGJ1bmRsZWQgcGFja2FnZS5cbiAgLy8gKiBgVXNlcmAgaW5kaWNhdGVzIHRoYXQgaXQgd2FzIGRlZmluZWQgYnkgYSB1c2VyLlxuICAvLyAqIGA8cGFja2FnZS1uYW1lPmAgdGhlIHBhY2thZ2Ugd2hpY2ggZGVmaW5lZCBpdC5cbiAgLy8gKiBgVW5rbm93bmAgaWYgYW4gaW52YWxpZCBwYXRoIHdhcyBwYXNzZWQgaW4uXG4gIHN0YXRpYyBkZXRlcm1pbmVTb3VyY2UgKGZpbGVQYXRoKSB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuICdVbmtub3duJ1xuICAgIH1cblxuICAgIGlmIChmaWxlUGF0aC5pbmRleE9mKHBhdGguam9pbihhdG9tLmdldExvYWRTZXR0aW5ncygpLnJlc291cmNlUGF0aCwgJ2tleW1hcHMnKSkgPT09IDApIHtcbiAgICAgIHJldHVybiAnQ29yZSdcbiAgICB9IGVsc2UgaWYgKGZpbGVQYXRoID09PSBhdG9tLmtleW1hcHMuZ2V0VXNlcktleW1hcFBhdGgoKSkge1xuICAgICAgcmV0dXJuICdVc2VyJ1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwYXRoUGFydHMgPSBmaWxlUGF0aC5zcGxpdChwYXRoLnNlcClcbiAgICAgIGNvbnN0IHBhY2thZ2VOYW1lSW5kZXggPSBwYXRoUGFydHMubGVuZ3RoIC0gM1xuICAgICAgY29uc3QgcGFja2FnZU5hbWUgPSBwYXRoUGFydHNbcGFja2FnZU5hbWVJbmRleF0gIT0gbnVsbCA/IHBhdGhQYXJ0c1twYWNrYWdlTmFtZUluZGV4XSA6ICcnXG4gICAgICByZXR1cm4gXy51bmRhc2hlcml6ZShfLnVuY2FtZWxjYXNlKHBhY2thZ2VOYW1lKSlcbiAgICB9XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFBdUI7QUFOdkI7QUFDQTs7QUFPZSxNQUFNQSxnQkFBZ0IsQ0FBQztFQUNwQ0MsV0FBVyxHQUFJO0lBQ2JDLGFBQUksQ0FBQ0MsVUFBVSxDQUFDLElBQUksQ0FBQztJQUNyQixJQUFJLENBQUNDLFdBQVcsR0FBRyxJQUFJQyx5QkFBbUIsRUFBRTtJQUM1QyxJQUFJLENBQUNELFdBQVcsQ0FBQ0UsR0FBRyxDQUFDQyxJQUFJLENBQUNDLFFBQVEsQ0FBQ0YsR0FBRyxDQUFDLElBQUksQ0FBQ0csT0FBTyxFQUFFO01BQ25ELGNBQWMsRUFBRSxNQUFNO1FBQUUsSUFBSSxDQUFDQyxRQUFRLEVBQUU7TUFBQyxDQUFDO01BQ3pDLGdCQUFnQixFQUFFLE1BQU07UUFBRSxJQUFJLENBQUNDLFVBQVUsRUFBRTtNQUFDLENBQUM7TUFDN0MsY0FBYyxFQUFFLE1BQU07UUFBRSxJQUFJLENBQUNDLE1BQU0sRUFBRTtNQUFDLENBQUM7TUFDdkMsZ0JBQWdCLEVBQUUsTUFBTTtRQUFFLElBQUksQ0FBQ0MsUUFBUSxFQUFFO01BQUMsQ0FBQztNQUMzQyxrQkFBa0IsRUFBRSxNQUFNO1FBQUUsSUFBSSxDQUFDQyxXQUFXLEVBQUU7TUFBQyxDQUFDO01BQ2hELHFCQUFxQixFQUFFLE1BQU07UUFBRSxJQUFJLENBQUNDLGNBQWMsRUFBRTtNQUFDO0lBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxDQUFDQyxvQkFBb0IsR0FBRyxJQUFJQyxNQUFNLENBQUUsa0JBQWlCQyx1QkFBQyxDQUFDQyxZQUFZLENBQUNDLE9BQU8sQ0FBQ0MsUUFBUSxDQUFFLE1BQUssQ0FBQztJQUNoRyxJQUFJLENBQUNDLGVBQWUsR0FBRyxJQUFJTCxNQUFNLENBQUUsZUFBY0MsdUJBQUMsQ0FBQ0MsWUFBWSxDQUFDQyxPQUFPLENBQUNDLFFBQVEsQ0FBRSxLQUFJLENBQUM7SUFFdkYsSUFBSSxDQUFDakIsV0FBVyxDQUFDRSxHQUFHLENBQUMsSUFBSSxDQUFDaUIsSUFBSSxDQUFDQyxZQUFZLENBQUNDLGlCQUFpQixDQUFDLE1BQU07TUFDbEUsSUFBSSxDQUFDQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUNDLFdBQVcsRUFBRSxJQUFJLENBQUNKLElBQUksQ0FBQ0MsWUFBWSxDQUFDSSxPQUFPLEVBQUUsQ0FBQztJQUM1RSxDQUFDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQ3hCLFdBQVcsQ0FBQ0UsR0FBRyxDQUFDQyxJQUFJLENBQUNzQixPQUFPLENBQUNDLGlCQUFpQixDQUFDLE1BQU07TUFBRSxJQUFJLENBQUNDLGVBQWUsRUFBRTtJQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RGLElBQUksQ0FBQzNCLFdBQVcsQ0FBQ0UsR0FBRyxDQUFDQyxJQUFJLENBQUNzQixPQUFPLENBQUNHLGlCQUFpQixDQUFDLE1BQU07TUFBRSxJQUFJLENBQUNELGVBQWUsRUFBRTtJQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RGLElBQUksQ0FBQ0EsZUFBZSxFQUFFO0VBQ3hCO0VBRUFFLE9BQU8sR0FBSTtJQUNULElBQUksQ0FBQzdCLFdBQVcsQ0FBQzhCLE9BQU8sRUFBRTtJQUMxQixPQUFPaEMsYUFBSSxDQUFDK0IsT0FBTyxDQUFDLElBQUksQ0FBQztFQUMzQjtFQUVBRSxNQUFNLEdBQUksQ0FBQztFQUVYQyxNQUFNLEdBQUk7SUFDUixPQUNFO01BQUssU0FBUyxFQUFDLGFBQWE7TUFBQyxRQUFRLEVBQUM7SUFBSSxHQUN4QztNQUFTLFNBQVMsRUFBQztJQUEwQixHQUMzQztNQUFLLFNBQVMsRUFBQztJQUFvQyxpQkFBa0IsRUFDckU7TUFBSyxTQUFTLEVBQUMsMEJBQTBCO01BQUMsUUFBUSxFQUFDO0lBQUksR0FDckQ7TUFBTSxTQUFTLEVBQUM7SUFBb0IsRUFBRyxFQUN2QyxpRkFBMkQsRUFDM0Q7TUFBTSxTQUFTLEVBQUM7SUFBa0IsRUFBRyxFQUNyQyx5REFBbUMsRUFDbkM7TUFBRyxTQUFTLEVBQUMsTUFBTTtNQUFDLE9BQU8sRUFBRSxJQUFJLENBQUNDO0lBQXVCLHNCQUFxQixDQUMxRSxFQUVOO01BQUssU0FBUyxFQUFDO0lBQWtCLEdBQy9CLGtCQUFDLGdCQUFVO01BQUMsSUFBSTtNQUFDLEdBQUcsRUFBQyxjQUFjO01BQUMsZUFBZSxFQUFDO0lBQW9CLEVBQUcsQ0FDdkUsRUFFTjtNQUFPLFNBQVMsRUFBQyxnQ0FBZ0M7TUFBQyxRQUFRLEVBQUM7SUFBSSxHQUM3RDtNQUFLLFNBQVMsRUFBQztJQUFXLEVBQUcsRUFDN0I7TUFBSyxTQUFTLEVBQUM7SUFBUyxFQUFHLEVBQzNCO01BQUssU0FBUyxFQUFDO0lBQVEsRUFBRyxFQUMxQjtNQUFLLFNBQVMsRUFBQztJQUFVLEVBQUcsRUFDNUIsaUNBQ0UsOEJBQ0U7TUFBSSxTQUFTLEVBQUM7SUFBVyxlQUFlLEVBQ3hDO01BQUksU0FBUyxFQUFDO0lBQVMsYUFBYSxFQUNwQztNQUFJLFNBQVMsRUFBQztJQUFRLFlBQVksRUFDbEM7TUFBSSxTQUFTLEVBQUM7SUFBVSxjQUFjLENBQ25DLENBQ0MsRUFDUjtNQUFPLEdBQUcsRUFBQztJQUFnQixFQUFHLENBQ3hCLENBQ0EsQ0FDTjtFQUVWO0VBRUFOLGVBQWUsR0FBSTtJQUNqQixJQUFJLENBQUNSLElBQUksQ0FBQ2UsY0FBYyxDQUFDQyxTQUFTLEdBQUcsRUFBRTtJQUN2QyxJQUFJLENBQUNaLFdBQVcsR0FBR1QsdUJBQUMsQ0FBQ3NCLE1BQU0sQ0FBQ2pDLElBQUksQ0FBQ3NCLE9BQU8sQ0FBQ1ksY0FBYyxFQUFFLEVBQUUsWUFBWSxDQUFDO0lBQ3hFLElBQUksQ0FBQ0MsaUJBQWlCLENBQUMsSUFBSSxDQUFDZixXQUFXLENBQUM7SUFDeEMsSUFBSSxDQUFDRCxpQkFBaUIsQ0FBQyxJQUFJLENBQUNDLFdBQVcsRUFBRSxJQUFJLENBQUNKLElBQUksQ0FBQ0MsWUFBWSxDQUFDSSxPQUFPLEVBQUUsQ0FBQztFQUM1RTtFQUVBZSxLQUFLLEdBQUk7SUFDUCxJQUFJLENBQUNwQixJQUFJLENBQUNDLFlBQVksQ0FBQ2YsT0FBTyxDQUFDa0MsS0FBSyxFQUFFO0VBQ3hDO0VBRUFDLElBQUksR0FBSTtJQUNOLElBQUksQ0FBQ25DLE9BQU8sQ0FBQ29DLEtBQUssQ0FBQ0MsT0FBTyxHQUFHLEVBQUU7RUFDakM7RUFFQXBCLGlCQUFpQixDQUFFQyxXQUFXLEVBQUVvQixZQUFZLEVBQUU7SUFDNUMsSUFBSSxDQUFDeEIsSUFBSSxDQUFDZSxjQUFjLENBQUNDLFNBQVMsR0FBRyxFQUFFO0lBQ3ZDLEtBQUssSUFBSVMsVUFBVSxJQUFJckIsV0FBVyxFQUFFO01BQ2xDLElBQUk7UUFBQ3NCLFFBQVE7UUFBRUMsVUFBVTtRQUFFQyxPQUFPO1FBQUVDO01BQU0sQ0FBQyxHQUFHSixVQUFVO01BQ3hESSxNQUFNLEdBQUdwRCxnQkFBZ0IsQ0FBQ3FELGVBQWUsQ0FBQ0QsTUFBTSxDQUFDO01BQ2pELElBQUlFLFlBQVksR0FBSSxHQUFFTCxRQUFTLEdBQUVDLFVBQVcsR0FBRUMsT0FBUSxHQUFFQyxNQUFPLEVBQUMsQ0FBQ0csV0FBVyxFQUFFO01BQzlFLElBQUksQ0FBQ0QsWUFBWSxFQUFFO1FBQ2pCO01BQ0Y7TUFFQSxNQUFNRSxRQUFRLEdBQUdULFlBQVksQ0FBQ1UsSUFBSSxFQUFFLENBQUNGLFdBQVcsRUFBRSxDQUFDRyxLQUFLLENBQUMsR0FBRyxDQUFDO01BQzdELElBQUlGLFFBQVEsQ0FBQ0csS0FBSyxDQUFDQyxPQUFPLElBQUlOLFlBQVksQ0FBQ08sT0FBTyxDQUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ25FLElBQUksQ0FBQ0UsZ0JBQWdCLENBQUNkLFVBQVUsQ0FBQztNQUNuQztJQUNGO0VBQ0Y7RUFFQU4saUJBQWlCLENBQUVmLFdBQVcsRUFBRTtJQUM5QixLQUFLLE1BQU1xQixVQUFVLElBQUlyQixXQUFXLEVBQUU7TUFDcEMsSUFBSSxDQUFDbUMsZ0JBQWdCLENBQUNkLFVBQVUsQ0FBQztJQUNuQztFQUNGO0VBRUFjLGdCQUFnQixDQUFFZCxVQUFVLEVBQUU7SUFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQ2UsWUFBWSxDQUFDZixVQUFVLENBQUNDLFFBQVEsQ0FBQyxFQUFFO01BQzNDO0lBQ0Y7SUFFQSxNQUFNeEMsT0FBTyxHQUFHLElBQUksQ0FBQ3VELG9CQUFvQixDQUFDaEIsVUFBVSxDQUFDO0lBQ3JEdkMsT0FBTyxDQUFDd0QsT0FBTyxDQUFDakIsVUFBVSxHQUFHQSxVQUFVO0lBQ3ZDLElBQUksQ0FBQ3pCLElBQUksQ0FBQ2UsY0FBYyxDQUFDNEIsV0FBVyxDQUFDekQsT0FBTyxDQUFDO0VBQy9DO0VBRUFzRCxZQUFZLENBQUVkLFFBQVEsRUFBRTtJQUN0QixJQUFJa0IsUUFBUTtJQUNaLElBQUlsQixRQUFRLEVBQUU7TUFDWmtCLFFBQVEsR0FBR2xCLFFBQVEsQ0FBQ1MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7SUFDdEMsQ0FBQyxNQUFNO01BQ0xTLFFBQVEsR0FBRyxFQUFFO0lBQ2Y7SUFFQSxPQUFPQSxRQUFRLENBQUNDLElBQUksQ0FBRUMsQ0FBQyxJQUFLLElBQUksQ0FBQy9DLGVBQWUsQ0FBQ2dELElBQUksQ0FBQ0QsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUNyRCxvQkFBb0IsQ0FBQ3NELElBQUksQ0FBQ0QsQ0FBQyxDQUFDLENBQUM7RUFDakc7RUFFQUwsb0JBQW9CLENBQUVoQixVQUFVLEVBQUU7SUFDaEMsSUFBSTtNQUFDQyxRQUFRO01BQUVDLFVBQVU7TUFBRUMsT0FBTztNQUFFQztJQUFNLENBQUMsR0FBR0osVUFBVTtJQUN4REksTUFBTSxHQUFHcEQsZ0JBQWdCLENBQUNxRCxlQUFlLENBQUNELE1BQU0sQ0FBQztJQUVqRCxNQUFNbUIsRUFBRSxHQUFHQyxRQUFRLENBQUNDLGFBQWEsQ0FBQyxJQUFJLENBQUM7SUFDdkMsSUFBSXJCLE1BQU0sS0FBSyxNQUFNLEVBQUU7TUFDckJtQixFQUFFLENBQUNHLFNBQVMsQ0FBQ3BFLEdBQUcsQ0FBQyxTQUFTLENBQUM7SUFDN0I7SUFFQSxNQUFNcUUsV0FBVyxHQUFHSCxRQUFRLENBQUNDLGFBQWEsQ0FBQyxJQUFJLENBQUM7SUFDaERFLFdBQVcsQ0FBQ0QsU0FBUyxDQUFDcEUsR0FBRyxDQUFDLFdBQVcsQ0FBQztJQUV0QyxNQUFNc0UsUUFBUSxHQUFHSixRQUFRLENBQUNDLGFBQWEsQ0FBQyxNQUFNLENBQUM7SUFDL0NHLFFBQVEsQ0FBQ0YsU0FBUyxDQUFDcEUsR0FBRyxDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsV0FBVyxDQUFDO0lBQzFEc0UsUUFBUSxDQUFDQyxPQUFPLEdBQUcsTUFBTTtNQUN2QixJQUFJQyxPQUFPO01BQ1gsTUFBTUMsZUFBZSxHQUFHQyxhQUFJLENBQUNDLE9BQU8sQ0FBQzFFLElBQUksQ0FBQ3NCLE9BQU8sQ0FBQ3FELGlCQUFpQixFQUFFLENBQUM7TUFFdEUsTUFBTUMsVUFBVSxHQUFJQyxLQUFLLElBQUs7UUFDNUIsT0FBT0MsSUFBSSxDQUFDQyxTQUFTLENBQUNGLEtBQUssQ0FBQyxDQUN6QkcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUEsQ0FDYkMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUFBLENBQ3JCQSxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFDO01BQzNCLENBQUM7O01BRUQsSUFBSVQsZUFBZSxLQUFLLE9BQU8sRUFBRTtRQUMvQkQsT0FBTyxHQUFJLElBQUdLLFVBQVUsQ0FBQ2xDLFFBQVEsQ0FBRSxVQUFTa0MsVUFBVSxDQUFDakMsVUFBVSxDQUFFLE9BQU1pQyxVQUFVLENBQUNoQyxPQUFPLENBQUUsR0FBRTtNQUNqRyxDQUFDLE1BQU07UUFDTDJCLE9BQU8sR0FBSSxHQUFFTyxJQUFJLENBQUNDLFNBQVMsQ0FBQ3JDLFFBQVEsQ0FBRSxVQUFTb0MsSUFBSSxDQUFDQyxTQUFTLENBQUNwQyxVQUFVLENBQUUsS0FBSW1DLElBQUksQ0FBQ0MsU0FBUyxDQUFDbkMsT0FBTyxDQUFFLEtBQUk7TUFDNUc7TUFDQSxPQUFPNUMsSUFBSSxDQUFDa0YsU0FBUyxDQUFDQyxLQUFLLENBQUNaLE9BQU8sQ0FBQztJQUN0QyxDQUFDO0lBQ0RILFdBQVcsQ0FBQ1QsV0FBVyxDQUFDVSxRQUFRLENBQUM7SUFFakMsTUFBTWUsY0FBYyxHQUFHbkIsUUFBUSxDQUFDQyxhQUFhLENBQUMsTUFBTSxDQUFDO0lBQ3JEa0IsY0FBYyxDQUFDQyxXQUFXLEdBQUcxQyxVQUFVO0lBQ3ZDeUIsV0FBVyxDQUFDVCxXQUFXLENBQUN5QixjQUFjLENBQUM7SUFDdkNwQixFQUFFLENBQUNMLFdBQVcsQ0FBQ1MsV0FBVyxDQUFDO0lBRTNCLE1BQU1rQixTQUFTLEdBQUdyQixRQUFRLENBQUNDLGFBQWEsQ0FBQyxJQUFJLENBQUM7SUFDOUNvQixTQUFTLENBQUNuQixTQUFTLENBQUNwRSxHQUFHLENBQUMsU0FBUyxDQUFDO0lBQ2xDdUYsU0FBUyxDQUFDRCxXQUFXLEdBQUd6QyxPQUFPO0lBQy9Cb0IsRUFBRSxDQUFDTCxXQUFXLENBQUMyQixTQUFTLENBQUM7SUFFekIsTUFBTUMsUUFBUSxHQUFHdEIsUUFBUSxDQUFDQyxhQUFhLENBQUMsSUFBSSxDQUFDO0lBQzdDcUIsUUFBUSxDQUFDcEIsU0FBUyxDQUFDcEUsR0FBRyxDQUFDLFFBQVEsQ0FBQztJQUNoQ3dGLFFBQVEsQ0FBQ0YsV0FBVyxHQUFHeEMsTUFBTTtJQUM3Qm1CLEVBQUUsQ0FBQ0wsV0FBVyxDQUFDNEIsUUFBUSxDQUFDO0lBRXhCLE1BQU1DLFVBQVUsR0FBR3ZCLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLElBQUksQ0FBQztJQUMvQ3NCLFVBQVUsQ0FBQ3JCLFNBQVMsQ0FBQ3BFLEdBQUcsQ0FBQyxVQUFVLENBQUM7SUFDcEN5RixVQUFVLENBQUNILFdBQVcsR0FBRzNDLFFBQVE7SUFDakNzQixFQUFFLENBQUNMLFdBQVcsQ0FBQzZCLFVBQVUsQ0FBQztJQUUxQixPQUFPeEIsRUFBRTtFQUNYO0VBRUFsQyxzQkFBc0IsQ0FBRTJELENBQUMsRUFBRTtJQUN6QkEsQ0FBQyxDQUFDQyxjQUFjLEVBQUU7SUFDbEIxRixJQUFJLENBQUNDLFFBQVEsQ0FBQzBGLFFBQVEsQ0FBQzNGLElBQUksQ0FBQzRGLEtBQUssQ0FBQ0MsT0FBTyxDQUFDN0YsSUFBSSxDQUFDOEYsU0FBUyxDQUFDLEVBQUUsOEJBQThCLENBQUM7RUFDNUY7RUFFQTNGLFFBQVEsR0FBSTtJQUNWLElBQUksQ0FBQ0QsT0FBTyxDQUFDNkYsU0FBUyxJQUFJOUIsUUFBUSxDQUFDK0IsSUFBSSxDQUFDQyxZQUFZLEdBQUcsRUFBRTtFQUMzRDtFQUVBN0YsVUFBVSxHQUFJO0lBQ1osSUFBSSxDQUFDRixPQUFPLENBQUM2RixTQUFTLElBQUk5QixRQUFRLENBQUMrQixJQUFJLENBQUNDLFlBQVksR0FBRyxFQUFFO0VBQzNEO0VBRUE1RixNQUFNLEdBQUk7SUFDUixJQUFJLENBQUNILE9BQU8sQ0FBQzZGLFNBQVMsSUFBSSxJQUFJLENBQUM3RixPQUFPLENBQUMrRixZQUFZO0VBQ3JEO0VBRUEzRixRQUFRLEdBQUk7SUFDVixJQUFJLENBQUNKLE9BQU8sQ0FBQzZGLFNBQVMsSUFBSSxJQUFJLENBQUM3RixPQUFPLENBQUMrRixZQUFZO0VBQ3JEO0VBRUExRixXQUFXLEdBQUk7SUFDYixJQUFJLENBQUNMLE9BQU8sQ0FBQzZGLFNBQVMsR0FBRyxDQUFDO0VBQzVCO0VBRUF2RixjQUFjLEdBQUk7SUFDaEIsSUFBSSxDQUFDTixPQUFPLENBQUM2RixTQUFTLEdBQUcsSUFBSSxDQUFDN0YsT0FBTyxDQUFDZ0csWUFBWTtFQUNwRDs7RUFFQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsT0FBT3BELGVBQWUsQ0FBRXFELFFBQVEsRUFBRTtJQUNoQyxJQUFJLENBQUNBLFFBQVEsRUFBRTtNQUNiLE9BQU8sU0FBUztJQUNsQjtJQUVBLElBQUlBLFFBQVEsQ0FBQzdDLE9BQU8sQ0FBQ21CLGFBQUksQ0FBQzJCLElBQUksQ0FBQ3BHLElBQUksQ0FBQ3FHLGVBQWUsRUFBRSxDQUFDQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7TUFDckYsT0FBTyxNQUFNO0lBQ2YsQ0FBQyxNQUFNLElBQUlILFFBQVEsS0FBS25HLElBQUksQ0FBQ3NCLE9BQU8sQ0FBQ3FELGlCQUFpQixFQUFFLEVBQUU7TUFDeEQsT0FBTyxNQUFNO0lBQ2YsQ0FBQyxNQUFNO01BQ0wsTUFBTTRCLFNBQVMsR0FBR0osUUFBUSxDQUFDaEQsS0FBSyxDQUFDc0IsYUFBSSxDQUFDK0IsR0FBRyxDQUFDO01BQzFDLE1BQU1DLGdCQUFnQixHQUFHRixTQUFTLENBQUNHLE1BQU0sR0FBRyxDQUFDO01BQzdDLE1BQU1DLFdBQVcsR0FBR0osU0FBUyxDQUFDRSxnQkFBZ0IsQ0FBQyxJQUFJLElBQUksR0FBR0YsU0FBUyxDQUFDRSxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUU7TUFDMUYsT0FBTzlGLHVCQUFDLENBQUNpRyxXQUFXLENBQUNqRyx1QkFBQyxDQUFDa0csV0FBVyxDQUFDRixXQUFXLENBQUMsQ0FBQztJQUNsRDtFQUNGO0FBQ0Y7QUFBQztBQUFBIn0=