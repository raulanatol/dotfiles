"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fsPlus = _interopRequireDefault(require("fs-plus"));
var _etch = _interopRequireDefault(require("etch"));
var _atom = require("atom");
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */
/** @jsx etch.dom */

class KeyBindingResolverView {
  constructor() {
    this.keystrokes = null;
    this.usedKeyBinding = null;
    this.unusedKeyBindings = [];
    this.unmatchedKeyBindings = [];
    this.partiallyMatchedBindings = [];
    this.attached = false;
    this.disposables = new _atom.CompositeDisposable();
    this.keybindingDisposables = new _atom.CompositeDisposable();
    this.disposables.add(atom.workspace.getBottomDock().observeActivePaneItem(item => {
      if (item === this) {
        this.attach();
      } else {
        this.detach();
      }
    }));
    this.disposables.add(atom.workspace.getBottomDock().observeVisible(visible => {
      if (visible) {
        if (atom.workspace.getBottomDock().getActivePaneItem() === this) this.attach();
      } else {
        this.detach();
      }
    }));
    _etch.default.initialize(this);
  }
  getTitle() {
    return 'Key Binding Resolver';
  }
  getIconName() {
    return 'keyboard';
  }
  getDefaultLocation() {
    return 'bottom';
  }
  getAllowedLocations() {
    // TODO: Support left and right possibly
    return ['bottom'];
  }
  getURI() {
    return 'atom://keybinding-resolver';
  }
  serialize() {
    return {
      deserializer: 'keybinding-resolver/KeyBindingResolverView'
    };
  }
  destroy() {
    this.disposables.dispose();
    this.detach();
    return _etch.default.destroy(this);
  }
  attach() {
    if (this.attached) return;
    this.attached = true;
    this.keybindingDisposables = new _atom.CompositeDisposable();
    this.keybindingDisposables.add(atom.keymaps.onDidMatchBinding(({
      keystrokes,
      binding,
      keyboardEventTarget,
      eventType
    }) => {
      if (eventType === 'keyup' && binding == null) {
        return;
      }
      const unusedKeyBindings = atom.keymaps.findKeyBindings({
        keystrokes,
        target: keyboardEventTarget
      }).filter(b => b !== binding);
      const unmatchedKeyBindings = atom.keymaps.findKeyBindings({
        keystrokes
      }).filter(b => b !== binding && !unusedKeyBindings.includes(b));
      this.update({
        usedKeyBinding: binding,
        unusedKeyBindings,
        unmatchedKeyBindings,
        keystrokes
      });
    }));
    this.keybindingDisposables.add(atom.keymaps.onDidPartiallyMatchBindings(({
      keystrokes,
      partiallyMatchedBindings
    }) => {
      this.update({
        keystrokes,
        partiallyMatchedBindings
      });
    }));
    this.keybindingDisposables.add(atom.keymaps.onDidFailToMatchBinding(({
      keystrokes,
      keyboardEventTarget,
      eventType
    }) => {
      if (eventType === 'keyup') {
        return;
      }
      const unusedKeyBindings = atom.keymaps.findKeyBindings({
        keystrokes,
        target: keyboardEventTarget
      });
      const unmatchedKeyBindings = atom.keymaps.findKeyBindings({
        keystrokes
      }).filter(b => !unusedKeyBindings.includes(b));
      this.update({
        unusedKeyBindings,
        unmatchedKeyBindings,
        keystrokes
      });
    }));
  }
  detach() {
    if (!this.attached) return;
    this.attached = false;
    this.keybindingDisposables.dispose();
    this.keybindingDisposables = null;
  }
  update(props) {
    this.keystrokes = props.keystrokes;
    this.usedKeyBinding = props.usedKeyBinding;
    this.unusedKeyBindings = props.unusedKeyBindings || [];
    this.unmatchedKeyBindings = props.unmatchedKeyBindings || [];
    this.partiallyMatchedBindings = props.partiallyMatchedBindings || [];
    return _etch.default.update(this);
  }
  render() {
    return _etch.default.dom("div", {
      className: "key-binding-resolver"
    }, _etch.default.dom("div", {
      className: "panel-heading"
    }, this.renderKeystrokes()), _etch.default.dom("div", {
      className: "panel-body"
    }, this.renderKeyBindings()));
  }
  renderKeystrokes() {
    if (this.keystrokes) {
      if (this.partiallyMatchedBindings.length > 0) {
        return _etch.default.dom("span", {
          className: "keystroke highlight-info"
        }, this.keystrokes, " (partial)");
      } else {
        return _etch.default.dom("span", {
          className: "keystroke highlight-info"
        }, this.keystrokes);
      }
    } else {
      return _etch.default.dom("span", null, "Press any key");
    }
  }
  renderKeyBindings() {
    if (this.partiallyMatchedBindings.length > 0) {
      return _etch.default.dom("table", {
        className: "table-condensed"
      }, _etch.default.dom("tbody", null, this.partiallyMatchedBindings.map(binding => _etch.default.dom("tr", {
        className: "unused"
      }, _etch.default.dom("td", {
        className: "copy",
        onclick: () => this.copyKeybinding(binding)
      }, _etch.default.dom("span", {
        className: "icon icon-clippy"
      })), _etch.default.dom("td", {
        className: "command"
      }, binding.command), _etch.default.dom("td", {
        className: "keystrokes"
      }, binding.keystrokes), _etch.default.dom("td", {
        className: "selector"
      }, binding.selector), _etch.default.dom("td", {
        className: "source",
        onclick: () => this.openKeybindingFile(binding.source)
      }, binding.source)))));
    } else {
      let usedKeyBinding = '';
      if (this.usedKeyBinding) {
        usedKeyBinding = _etch.default.dom("tr", {
          className: "used"
        }, _etch.default.dom("td", {
          className: "copy",
          onclick: () => this.copyKeybinding(this.usedKeyBinding)
        }, _etch.default.dom("span", {
          className: "icon icon-clippy"
        })), _etch.default.dom("td", {
          className: "command"
        }, this.usedKeyBinding.command), _etch.default.dom("td", {
          className: "selector"
        }, this.usedKeyBinding.selector), _etch.default.dom("td", {
          className: "source",
          onclick: () => this.openKeybindingFile(this.usedKeyBinding.source)
        }, this.usedKeyBinding.source));
      }
      return _etch.default.dom("table", {
        className: "table-condensed"
      }, _etch.default.dom("tbody", null, usedKeyBinding, this.unusedKeyBindings.map(binding => _etch.default.dom("tr", {
        className: "unused"
      }, _etch.default.dom("td", {
        className: "copy",
        onclick: () => this.copyKeybinding(binding)
      }, _etch.default.dom("span", {
        className: "icon icon-clippy"
      })), _etch.default.dom("td", {
        className: "command"
      }, binding.command), _etch.default.dom("td", {
        className: "selector"
      }, binding.selector), _etch.default.dom("td", {
        className: "source",
        onclick: () => this.openKeybindingFile(binding.source)
      }, binding.source))), this.unmatchedKeyBindings.map(binding => _etch.default.dom("tr", {
        className: "unmatched"
      }, _etch.default.dom("td", {
        className: "copy",
        onclick: () => this.copyKeybinding(binding)
      }, _etch.default.dom("span", {
        className: "icon icon-clippy"
      })), _etch.default.dom("td", {
        className: "command"
      }, binding.command), _etch.default.dom("td", {
        className: "selector"
      }, binding.selector), _etch.default.dom("td", {
        className: "source",
        onclick: () => this.openKeybindingFile(binding.source)
      }, binding.source)))));
    }
  }
  isInAsarArchive(pathToCheck) {
    const {
      resourcePath
    } = atom.getLoadSettings();
    return pathToCheck.startsWith(`${resourcePath}${_path.default.sep}`) && _path.default.extname(resourcePath) === '.asar';
  }
  extractBundledKeymap(bundledKeymapPath) {
    const metadata = require(_path.default.join(atom.getLoadSettings().resourcePath, 'package.json'));
    const bundledKeymaps = metadata ? metadata._atomKeymaps : {};
    const keymapName = _path.default.basename(bundledKeymapPath);
    const extractedKeymapPath = _path.default.join(require('temp').mkdirSync('atom-bundled-keymap-'), keymapName);
    _fsPlus.default.writeFileSync(extractedKeymapPath, JSON.stringify(bundledKeymaps[keymapName] || {}, null, 2));
    return extractedKeymapPath;
  }
  extractBundledPackageKeymap(keymapRelativePath) {
    const packageName = keymapRelativePath.split(_path.default.sep)[1];
    const keymapName = _path.default.basename(keymapRelativePath);
    const metadata = atom.packages.packagesCache[packageName] || {};
    const keymaps = metadata.keymaps || {};
    const extractedKeymapPath = _path.default.join(require('temp').mkdirSync('atom-bundled-keymap-'), keymapName);
    _fsPlus.default.writeFileSync(extractedKeymapPath, JSON.stringify(keymaps[keymapRelativePath] || {}, null, 2));
    return extractedKeymapPath;
  }
  openKeybindingFile(keymapPath) {
    if (this.isInAsarArchive(keymapPath)) {
      keymapPath = this.extractBundledKeymap(keymapPath);
    } else if (keymapPath.startsWith('core:node_modules')) {
      keymapPath = this.extractBundledPackageKeymap(keymapPath.replace('core:', ''));
    } else if (keymapPath.startsWith('core:')) {
      keymapPath = this.extractBundledKeymap(keymapPath.replace('core:', ''));
    }
    atom.workspace.open(keymapPath);
  }
  copyKeybinding(binding) {
    let content;
    const keymapExtension = _path.default.extname(atom.keymaps.getUserKeymapPath());
    let escapedKeystrokes = binding.keystrokes.replace(/\\/g, '\\\\'); // Escape backslashes
    if (keymapExtension === '.cson') {
      content = `\
'${binding.selector}':
  '${escapedKeystrokes}': '${binding.command}'
`;
    } else {
      content = `\
"${binding.selector}": {
  "${escapedKeystrokes}": "${binding.command}"
}
`;
    }
    atom.notifications.addInfo('Keybinding Copied');
    return atom.clipboard.write(content);
  }
}
exports.default = KeyBindingResolverView;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLZXlCaW5kaW5nUmVzb2x2ZXJWaWV3IiwiY29uc3RydWN0b3IiLCJrZXlzdHJva2VzIiwidXNlZEtleUJpbmRpbmciLCJ1bnVzZWRLZXlCaW5kaW5ncyIsInVubWF0Y2hlZEtleUJpbmRpbmdzIiwicGFydGlhbGx5TWF0Y2hlZEJpbmRpbmdzIiwiYXR0YWNoZWQiLCJkaXNwb3NhYmxlcyIsIkNvbXBvc2l0ZURpc3Bvc2FibGUiLCJrZXliaW5kaW5nRGlzcG9zYWJsZXMiLCJhZGQiLCJhdG9tIiwid29ya3NwYWNlIiwiZ2V0Qm90dG9tRG9jayIsIm9ic2VydmVBY3RpdmVQYW5lSXRlbSIsIml0ZW0iLCJhdHRhY2giLCJkZXRhY2giLCJvYnNlcnZlVmlzaWJsZSIsInZpc2libGUiLCJnZXRBY3RpdmVQYW5lSXRlbSIsImV0Y2giLCJpbml0aWFsaXplIiwiZ2V0VGl0bGUiLCJnZXRJY29uTmFtZSIsImdldERlZmF1bHRMb2NhdGlvbiIsImdldEFsbG93ZWRMb2NhdGlvbnMiLCJnZXRVUkkiLCJzZXJpYWxpemUiLCJkZXNlcmlhbGl6ZXIiLCJkZXN0cm95IiwiZGlzcG9zZSIsImtleW1hcHMiLCJvbkRpZE1hdGNoQmluZGluZyIsImJpbmRpbmciLCJrZXlib2FyZEV2ZW50VGFyZ2V0IiwiZXZlbnRUeXBlIiwiZmluZEtleUJpbmRpbmdzIiwidGFyZ2V0IiwiZmlsdGVyIiwiYiIsImluY2x1ZGVzIiwidXBkYXRlIiwib25EaWRQYXJ0aWFsbHlNYXRjaEJpbmRpbmdzIiwib25EaWRGYWlsVG9NYXRjaEJpbmRpbmciLCJwcm9wcyIsInJlbmRlciIsInJlbmRlcktleXN0cm9rZXMiLCJyZW5kZXJLZXlCaW5kaW5ncyIsImxlbmd0aCIsIm1hcCIsImNvcHlLZXliaW5kaW5nIiwiY29tbWFuZCIsInNlbGVjdG9yIiwib3BlbktleWJpbmRpbmdGaWxlIiwic291cmNlIiwiaXNJbkFzYXJBcmNoaXZlIiwicGF0aFRvQ2hlY2siLCJyZXNvdXJjZVBhdGgiLCJnZXRMb2FkU2V0dGluZ3MiLCJzdGFydHNXaXRoIiwicGF0aCIsInNlcCIsImV4dG5hbWUiLCJleHRyYWN0QnVuZGxlZEtleW1hcCIsImJ1bmRsZWRLZXltYXBQYXRoIiwibWV0YWRhdGEiLCJyZXF1aXJlIiwiam9pbiIsImJ1bmRsZWRLZXltYXBzIiwiX2F0b21LZXltYXBzIiwia2V5bWFwTmFtZSIsImJhc2VuYW1lIiwiZXh0cmFjdGVkS2V5bWFwUGF0aCIsIm1rZGlyU3luYyIsImZzIiwid3JpdGVGaWxlU3luYyIsIkpTT04iLCJzdHJpbmdpZnkiLCJleHRyYWN0QnVuZGxlZFBhY2thZ2VLZXltYXAiLCJrZXltYXBSZWxhdGl2ZVBhdGgiLCJwYWNrYWdlTmFtZSIsInNwbGl0IiwicGFja2FnZXMiLCJwYWNrYWdlc0NhY2hlIiwia2V5bWFwUGF0aCIsInJlcGxhY2UiLCJvcGVuIiwiY29udGVudCIsImtleW1hcEV4dGVuc2lvbiIsImdldFVzZXJLZXltYXBQYXRoIiwiZXNjYXBlZEtleXN0cm9rZXMiLCJub3RpZmljYXRpb25zIiwiYWRkSW5mbyIsImNsaXBib2FyZCIsIndyaXRlIl0sInNvdXJjZXMiOlsia2V5YmluZGluZy1yZXNvbHZlci12aWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cbi8qKiBAanN4IGV0Y2guZG9tICovXG5cbmltcG9ydCBmcyBmcm9tICdmcy1wbHVzJ1xuaW1wb3J0IGV0Y2ggZnJvbSAnZXRjaCdcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtleUJpbmRpbmdSZXNvbHZlclZpZXcge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5rZXlzdHJva2VzID0gbnVsbFxuICAgIHRoaXMudXNlZEtleUJpbmRpbmcgPSBudWxsXG4gICAgdGhpcy51bnVzZWRLZXlCaW5kaW5ncyA9IFtdXG4gICAgdGhpcy51bm1hdGNoZWRLZXlCaW5kaW5ncyA9IFtdXG4gICAgdGhpcy5wYXJ0aWFsbHlNYXRjaGVkQmluZGluZ3MgPSBbXVxuICAgIHRoaXMuYXR0YWNoZWQgPSBmYWxzZVxuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5rZXliaW5kaW5nRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLndvcmtzcGFjZS5nZXRCb3R0b21Eb2NrKCkub2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtKGl0ZW0gPT4ge1xuICAgICAgaWYgKGl0ZW0gPT09IHRoaXMpIHtcbiAgICAgICAgdGhpcy5hdHRhY2goKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kZXRhY2goKVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS53b3Jrc3BhY2UuZ2V0Qm90dG9tRG9jaygpLm9ic2VydmVWaXNpYmxlKHZpc2libGUgPT4ge1xuICAgICAgaWYgKHZpc2libGUpIHtcbiAgICAgICAgaWYgKGF0b20ud29ya3NwYWNlLmdldEJvdHRvbURvY2soKS5nZXRBY3RpdmVQYW5lSXRlbSgpID09PSB0aGlzKSB0aGlzLmF0dGFjaCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRldGFjaCgpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICBldGNoLmluaXRpYWxpemUodGhpcylcbiAgfVxuXG4gIGdldFRpdGxlICgpIHtcbiAgICByZXR1cm4gJ0tleSBCaW5kaW5nIFJlc29sdmVyJ1xuICB9XG5cbiAgZ2V0SWNvbk5hbWUgKCkge1xuICAgIHJldHVybiAna2V5Ym9hcmQnXG4gIH1cblxuICBnZXREZWZhdWx0TG9jYXRpb24gKCkge1xuICAgIHJldHVybiAnYm90dG9tJ1xuICB9XG5cbiAgZ2V0QWxsb3dlZExvY2F0aW9ucyAoKSB7XG4gICAgLy8gVE9ETzogU3VwcG9ydCBsZWZ0IGFuZCByaWdodCBwb3NzaWJseVxuICAgIHJldHVybiBbJ2JvdHRvbSddXG4gIH1cblxuICBnZXRVUkkgKCkge1xuICAgIHJldHVybiAnYXRvbTovL2tleWJpbmRpbmctcmVzb2x2ZXInXG4gIH1cblxuICBzZXJpYWxpemUgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdrZXliaW5kaW5nLXJlc29sdmVyL0tleUJpbmRpbmdSZXNvbHZlclZpZXcnXG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICB0aGlzLmRldGFjaCgpXG4gICAgcmV0dXJuIGV0Y2guZGVzdHJveSh0aGlzKVxuICB9XG5cbiAgYXR0YWNoICgpIHtcbiAgICBpZiAodGhpcy5hdHRhY2hlZCkgcmV0dXJuXG5cbiAgICB0aGlzLmF0dGFjaGVkID0gdHJ1ZVxuICAgIHRoaXMua2V5YmluZGluZ0Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMua2V5YmluZGluZ0Rpc3Bvc2FibGVzLmFkZChhdG9tLmtleW1hcHMub25EaWRNYXRjaEJpbmRpbmcoKHtrZXlzdHJva2VzLCBiaW5kaW5nLCBrZXlib2FyZEV2ZW50VGFyZ2V0LCBldmVudFR5cGV9KSA9PiB7XG4gICAgICBpZiAoZXZlbnRUeXBlID09PSAna2V5dXAnICYmIGJpbmRpbmcgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgdW51c2VkS2V5QmluZGluZ3MgPSBhdG9tLmtleW1hcHNcbiAgICAgICAgLmZpbmRLZXlCaW5kaW5ncyh7a2V5c3Ryb2tlcywgdGFyZ2V0OiBrZXlib2FyZEV2ZW50VGFyZ2V0fSlcbiAgICAgICAgLmZpbHRlcigoYikgPT4gYiAhPT0gYmluZGluZylcblxuICAgICAgY29uc3QgdW5tYXRjaGVkS2V5QmluZGluZ3MgPSBhdG9tLmtleW1hcHNcbiAgICAgICAgLmZpbmRLZXlCaW5kaW5ncyh7a2V5c3Ryb2tlc30pXG4gICAgICAgIC5maWx0ZXIoKGIpID0+IGIgIT09IGJpbmRpbmcgJiYgIXVudXNlZEtleUJpbmRpbmdzLmluY2x1ZGVzKGIpKVxuXG4gICAgICB0aGlzLnVwZGF0ZSh7dXNlZEtleUJpbmRpbmc6IGJpbmRpbmcsIHVudXNlZEtleUJpbmRpbmdzLCB1bm1hdGNoZWRLZXlCaW5kaW5ncywga2V5c3Ryb2tlc30pXG4gICAgfSkpXG5cbiAgICB0aGlzLmtleWJpbmRpbmdEaXNwb3NhYmxlcy5hZGQoYXRvbS5rZXltYXBzLm9uRGlkUGFydGlhbGx5TWF0Y2hCaW5kaW5ncygoe2tleXN0cm9rZXMsIHBhcnRpYWxseU1hdGNoZWRCaW5kaW5nc30pID0+IHtcbiAgICAgIHRoaXMudXBkYXRlKHtrZXlzdHJva2VzLCBwYXJ0aWFsbHlNYXRjaGVkQmluZGluZ3N9KVxuICAgIH0pKVxuXG4gICAgdGhpcy5rZXliaW5kaW5nRGlzcG9zYWJsZXMuYWRkKGF0b20ua2V5bWFwcy5vbkRpZEZhaWxUb01hdGNoQmluZGluZygoe2tleXN0cm9rZXMsIGtleWJvYXJkRXZlbnRUYXJnZXQsIGV2ZW50VHlwZX0pID0+IHtcbiAgICAgIGlmIChldmVudFR5cGUgPT09ICdrZXl1cCcpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVudXNlZEtleUJpbmRpbmdzID0gYXRvbS5rZXltYXBzLmZpbmRLZXlCaW5kaW5ncyh7a2V5c3Ryb2tlcywgdGFyZ2V0OiBrZXlib2FyZEV2ZW50VGFyZ2V0fSlcbiAgICAgIGNvbnN0IHVubWF0Y2hlZEtleUJpbmRpbmdzID0gYXRvbS5rZXltYXBzXG4gICAgICAgIC5maW5kS2V5QmluZGluZ3Moe2tleXN0cm9rZXN9KVxuICAgICAgICAuZmlsdGVyKChiKSA9PiAhdW51c2VkS2V5QmluZGluZ3MuaW5jbHVkZXMoYikpXG5cbiAgICAgIHRoaXMudXBkYXRlKHt1bnVzZWRLZXlCaW5kaW5ncywgdW5tYXRjaGVkS2V5QmluZGluZ3MsIGtleXN0cm9rZXN9KVxuICAgIH0pKVxuICB9XG5cbiAgZGV0YWNoICgpIHtcbiAgICBpZiAoIXRoaXMuYXR0YWNoZWQpIHJldHVyblxuXG4gICAgdGhpcy5hdHRhY2hlZCA9IGZhbHNlXG4gICAgdGhpcy5rZXliaW5kaW5nRGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgdGhpcy5rZXliaW5kaW5nRGlzcG9zYWJsZXMgPSBudWxsXG4gIH1cblxuICB1cGRhdGUgKHByb3BzKSB7XG4gICAgdGhpcy5rZXlzdHJva2VzID0gcHJvcHMua2V5c3Ryb2tlc1xuICAgIHRoaXMudXNlZEtleUJpbmRpbmcgPSBwcm9wcy51c2VkS2V5QmluZGluZ1xuICAgIHRoaXMudW51c2VkS2V5QmluZGluZ3MgPSBwcm9wcy51bnVzZWRLZXlCaW5kaW5ncyB8fCBbXVxuICAgIHRoaXMudW5tYXRjaGVkS2V5QmluZGluZ3MgPSBwcm9wcy51bm1hdGNoZWRLZXlCaW5kaW5ncyB8fCBbXVxuICAgIHRoaXMucGFydGlhbGx5TWF0Y2hlZEJpbmRpbmdzID0gcHJvcHMucGFydGlhbGx5TWF0Y2hlZEJpbmRpbmdzIHx8IFtdXG4gICAgcmV0dXJuIGV0Y2gudXBkYXRlKHRoaXMpXG4gIH1cblxuICByZW5kZXIgKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0na2V5LWJpbmRpbmctcmVzb2x2ZXInPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncGFuZWwtaGVhZGluZyc+e3RoaXMucmVuZGVyS2V5c3Ryb2tlcygpfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncGFuZWwtYm9keSc+e3RoaXMucmVuZGVyS2V5QmluZGluZ3MoKX08L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIHJlbmRlcktleXN0cm9rZXMgKCkge1xuICAgIGlmICh0aGlzLmtleXN0cm9rZXMpIHtcbiAgICAgIGlmICh0aGlzLnBhcnRpYWxseU1hdGNoZWRCaW5kaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9J2tleXN0cm9rZSBoaWdobGlnaHQtaW5mbyc+e3RoaXMua2V5c3Ryb2tlc30gKHBhcnRpYWwpPC9zcGFuPlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT0na2V5c3Ryb2tlIGhpZ2hsaWdodC1pbmZvJz57dGhpcy5rZXlzdHJva2VzfTwvc3Bhbj5cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDxzcGFuPlByZXNzIGFueSBrZXk8L3NwYW4+XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyS2V5QmluZGluZ3MgKCkge1xuICAgIGlmICh0aGlzLnBhcnRpYWxseU1hdGNoZWRCaW5kaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8dGFibGUgY2xhc3NOYW1lPSd0YWJsZS1jb25kZW5zZWQnPlxuICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgIHt0aGlzLnBhcnRpYWxseU1hdGNoZWRCaW5kaW5ncy5tYXAoKGJpbmRpbmcpID0+IChcbiAgICAgICAgICAgICAgPHRyIGNsYXNzTmFtZT0ndW51c2VkJz5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPSdjb3B5JyBvbmNsaWNrPXsoKSA9PiB0aGlzLmNvcHlLZXliaW5kaW5nKGJpbmRpbmcpfT48c3BhbiBjbGFzc05hbWU9J2ljb24gaWNvbi1jbGlwcHknIC8+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPSdjb21tYW5kJz57YmluZGluZy5jb21tYW5kfTwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT0na2V5c3Ryb2tlcyc+e2JpbmRpbmcua2V5c3Ryb2tlc308L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9J3NlbGVjdG9yJz57YmluZGluZy5zZWxlY3Rvcn08L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9J3NvdXJjZScgb25jbGljaz17KCkgPT4gdGhpcy5vcGVuS2V5YmluZGluZ0ZpbGUoYmluZGluZy5zb3VyY2UpfT57YmluZGluZy5zb3VyY2V9PC90ZD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICApKX1cbiAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgdXNlZEtleUJpbmRpbmcgPSAnJ1xuICAgICAgaWYgKHRoaXMudXNlZEtleUJpbmRpbmcpIHtcbiAgICAgICAgdXNlZEtleUJpbmRpbmcgPSAoXG4gICAgICAgICAgPHRyIGNsYXNzTmFtZT0ndXNlZCc+XG4gICAgICAgICAgICA8dGQgY2xhc3NOYW1lPSdjb3B5JyBvbmNsaWNrPXsoKSA9PiB0aGlzLmNvcHlLZXliaW5kaW5nKHRoaXMudXNlZEtleUJpbmRpbmcpfT48c3BhbiBjbGFzc05hbWU9J2ljb24gaWNvbi1jbGlwcHknIC8+PC90ZD5cbiAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9J2NvbW1hbmQnPnt0aGlzLnVzZWRLZXlCaW5kaW5nLmNvbW1hbmR9PC90ZD5cbiAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9J3NlbGVjdG9yJz57dGhpcy51c2VkS2V5QmluZGluZy5zZWxlY3Rvcn08L3RkPlxuICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT0nc291cmNlJyBvbmNsaWNrPXsoKSA9PiB0aGlzLm9wZW5LZXliaW5kaW5nRmlsZSh0aGlzLnVzZWRLZXlCaW5kaW5nLnNvdXJjZSl9Pnt0aGlzLnVzZWRLZXlCaW5kaW5nLnNvdXJjZX08L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDx0YWJsZSBjbGFzc05hbWU9J3RhYmxlLWNvbmRlbnNlZCc+XG4gICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAge3VzZWRLZXlCaW5kaW5nfVxuICAgICAgICAgICAge3RoaXMudW51c2VkS2V5QmluZGluZ3MubWFwKChiaW5kaW5nKSA9PiAoXG4gICAgICAgICAgICAgIDx0ciBjbGFzc05hbWU9J3VudXNlZCc+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT0nY29weScgb25jbGljaz17KCkgPT4gdGhpcy5jb3B5S2V5YmluZGluZyhiaW5kaW5nKX0+PHNwYW4gY2xhc3NOYW1lPSdpY29uIGljb24tY2xpcHB5JyAvPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT0nY29tbWFuZCc+e2JpbmRpbmcuY29tbWFuZH08L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9J3NlbGVjdG9yJz57YmluZGluZy5zZWxlY3Rvcn08L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9J3NvdXJjZScgb25jbGljaz17KCkgPT4gdGhpcy5vcGVuS2V5YmluZGluZ0ZpbGUoYmluZGluZy5zb3VyY2UpfT57YmluZGluZy5zb3VyY2V9PC90ZD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgICAge3RoaXMudW5tYXRjaGVkS2V5QmluZGluZ3MubWFwKChiaW5kaW5nKSA9PiAoXG4gICAgICAgICAgICAgIDx0ciBjbGFzc05hbWU9J3VubWF0Y2hlZCc+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT0nY29weScgb25jbGljaz17KCkgPT4gdGhpcy5jb3B5S2V5YmluZGluZyhiaW5kaW5nKX0+PHNwYW4gY2xhc3NOYW1lPSdpY29uIGljb24tY2xpcHB5JyAvPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT0nY29tbWFuZCc+e2JpbmRpbmcuY29tbWFuZH08L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9J3NlbGVjdG9yJz57YmluZGluZy5zZWxlY3Rvcn08L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9J3NvdXJjZScgb25jbGljaz17KCkgPT4gdGhpcy5vcGVuS2V5YmluZGluZ0ZpbGUoYmluZGluZy5zb3VyY2UpfT57YmluZGluZy5zb3VyY2V9PC90ZD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICApKX1cbiAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIGlzSW5Bc2FyQXJjaGl2ZSAocGF0aFRvQ2hlY2spIHtcbiAgICBjb25zdCB7cmVzb3VyY2VQYXRofSA9IGF0b20uZ2V0TG9hZFNldHRpbmdzKClcbiAgICByZXR1cm4gcGF0aFRvQ2hlY2suc3RhcnRzV2l0aChgJHtyZXNvdXJjZVBhdGh9JHtwYXRoLnNlcH1gKSAmJiBwYXRoLmV4dG5hbWUocmVzb3VyY2VQYXRoKSA9PT0gJy5hc2FyJ1xuICB9XG5cbiAgZXh0cmFjdEJ1bmRsZWRLZXltYXAgKGJ1bmRsZWRLZXltYXBQYXRoKSB7XG4gICAgY29uc3QgbWV0YWRhdGEgPSByZXF1aXJlKHBhdGguam9pbihhdG9tLmdldExvYWRTZXR0aW5ncygpLnJlc291cmNlUGF0aCwgJ3BhY2thZ2UuanNvbicpKVxuICAgIGNvbnN0IGJ1bmRsZWRLZXltYXBzID0gbWV0YWRhdGEgPyBtZXRhZGF0YS5fYXRvbUtleW1hcHMgOiB7fVxuICAgIGNvbnN0IGtleW1hcE5hbWUgPSBwYXRoLmJhc2VuYW1lKGJ1bmRsZWRLZXltYXBQYXRoKVxuICAgIGNvbnN0IGV4dHJhY3RlZEtleW1hcFBhdGggPSBwYXRoLmpvaW4ocmVxdWlyZSgndGVtcCcpLm1rZGlyU3luYygnYXRvbS1idW5kbGVkLWtleW1hcC0nKSwga2V5bWFwTmFtZSlcbiAgICBmcy53cml0ZUZpbGVTeW5jKFxuICAgICAgZXh0cmFjdGVkS2V5bWFwUGF0aCxcbiAgICAgIEpTT04uc3RyaW5naWZ5KGJ1bmRsZWRLZXltYXBzW2tleW1hcE5hbWVdIHx8IHt9LCBudWxsLCAyKVxuICAgIClcbiAgICByZXR1cm4gZXh0cmFjdGVkS2V5bWFwUGF0aFxuICB9XG5cbiAgZXh0cmFjdEJ1bmRsZWRQYWNrYWdlS2V5bWFwIChrZXltYXBSZWxhdGl2ZVBhdGgpIHtcbiAgICBjb25zdCBwYWNrYWdlTmFtZSA9IGtleW1hcFJlbGF0aXZlUGF0aC5zcGxpdChwYXRoLnNlcClbMV1cbiAgICBjb25zdCBrZXltYXBOYW1lID0gcGF0aC5iYXNlbmFtZShrZXltYXBSZWxhdGl2ZVBhdGgpXG4gICAgY29uc3QgbWV0YWRhdGEgPSBhdG9tLnBhY2thZ2VzLnBhY2thZ2VzQ2FjaGVbcGFja2FnZU5hbWVdIHx8IHt9XG4gICAgY29uc3Qga2V5bWFwcyA9IG1ldGFkYXRhLmtleW1hcHMgfHwge31cbiAgICBjb25zdCBleHRyYWN0ZWRLZXltYXBQYXRoID0gcGF0aC5qb2luKHJlcXVpcmUoJ3RlbXAnKS5ta2RpclN5bmMoJ2F0b20tYnVuZGxlZC1rZXltYXAtJyksIGtleW1hcE5hbWUpXG4gICAgZnMud3JpdGVGaWxlU3luYyhcbiAgICAgIGV4dHJhY3RlZEtleW1hcFBhdGgsXG4gICAgICBKU09OLnN0cmluZ2lmeShrZXltYXBzW2tleW1hcFJlbGF0aXZlUGF0aF0gfHwge30sIG51bGwsIDIpXG4gICAgKVxuICAgIHJldHVybiBleHRyYWN0ZWRLZXltYXBQYXRoXG4gIH1cblxuICBvcGVuS2V5YmluZGluZ0ZpbGUgKGtleW1hcFBhdGgpIHtcbiAgICBpZiAodGhpcy5pc0luQXNhckFyY2hpdmUoa2V5bWFwUGF0aCkpIHtcbiAgICAgIGtleW1hcFBhdGggPSB0aGlzLmV4dHJhY3RCdW5kbGVkS2V5bWFwKGtleW1hcFBhdGgpXG4gICAgfSBlbHNlIGlmIChrZXltYXBQYXRoLnN0YXJ0c1dpdGgoJ2NvcmU6bm9kZV9tb2R1bGVzJykpIHtcbiAgICAgIGtleW1hcFBhdGggPSB0aGlzLmV4dHJhY3RCdW5kbGVkUGFja2FnZUtleW1hcChrZXltYXBQYXRoLnJlcGxhY2UoJ2NvcmU6JywgJycpKVxuICAgIH0gZWxzZSBpZiAoa2V5bWFwUGF0aC5zdGFydHNXaXRoKCdjb3JlOicpKSB7XG4gICAgICBrZXltYXBQYXRoID0gdGhpcy5leHRyYWN0QnVuZGxlZEtleW1hcChrZXltYXBQYXRoLnJlcGxhY2UoJ2NvcmU6JywgJycpKVxuICAgIH1cblxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oa2V5bWFwUGF0aClcbiAgfVxuXG4gIGNvcHlLZXliaW5kaW5nIChiaW5kaW5nKSB7XG4gICAgbGV0IGNvbnRlbnRcbiAgICBjb25zdCBrZXltYXBFeHRlbnNpb24gPSBwYXRoLmV4dG5hbWUoYXRvbS5rZXltYXBzLmdldFVzZXJLZXltYXBQYXRoKCkpXG4gICAgbGV0IGVzY2FwZWRLZXlzdHJva2VzID0gYmluZGluZy5rZXlzdHJva2VzLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJykgLy8gRXNjYXBlIGJhY2tzbGFzaGVzXG4gICAgaWYgKGtleW1hcEV4dGVuc2lvbiA9PT0gJy5jc29uJykge1xuICAgICAgY29udGVudCA9IGBcXFxuJyR7YmluZGluZy5zZWxlY3Rvcn0nOlxuICAnJHtlc2NhcGVkS2V5c3Ryb2tlc30nOiAnJHtiaW5kaW5nLmNvbW1hbmR9J1xuYFxuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50ID0gYFxcXG5cIiR7YmluZGluZy5zZWxlY3Rvcn1cIjoge1xuICBcIiR7ZXNjYXBlZEtleXN0cm9rZXN9XCI6IFwiJHtiaW5kaW5nLmNvbW1hbmR9XCJcbn1cbmBcbiAgICB9XG5cbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnS2V5YmluZGluZyBDb3BpZWQnKVxuICAgIHJldHVybiBhdG9tLmNsaXBib2FyZC53cml0ZShjb250ZW50KVxuICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQXVCO0FBTnZCO0FBQ0E7O0FBT2UsTUFBTUEsc0JBQXNCLENBQUM7RUFDMUNDLFdBQVcsR0FBSTtJQUNiLElBQUksQ0FBQ0MsVUFBVSxHQUFHLElBQUk7SUFDdEIsSUFBSSxDQUFDQyxjQUFjLEdBQUcsSUFBSTtJQUMxQixJQUFJLENBQUNDLGlCQUFpQixHQUFHLEVBQUU7SUFDM0IsSUFBSSxDQUFDQyxvQkFBb0IsR0FBRyxFQUFF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