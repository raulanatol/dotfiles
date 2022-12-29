"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _atom = require("atom");
var _etch = _interopRequireDefault(require("etch"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */
/** @jsx etch.dom */

function isSupported() {
  return ['win32', 'darwin'].includes(process.platform);
}
function isDefaultProtocolClient() {
  return require('electron').remote.app.isDefaultProtocolClient('atom', process.execPath, ['--uri-handler', '--']);
}
function setAsDefaultProtocolClient() {
  // This Electron API is only available on Windows and macOS. There might be some
  // hacks to make it work on Linux; see https://github.com/electron/electron/issues/6440
  return isSupported() && require('electron').remote.app.setAsDefaultProtocolClient('atom', process.execPath, ['--uri-handler', '--']);
}
class UriHandlerPanel {
  constructor() {
    this.handleChange = this.handleChange.bind(this);
    this.handleBecomeProtocolClient = this.handleBecomeProtocolClient.bind(this);
    this.isDefaultProtocolClient = isDefaultProtocolClient();
    this.uriHistory = [];
    _etch.default.initialize(this);
    this.subscriptions = new _atom.CompositeDisposable();
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
    }), atom.uriHandlerRegistry.onHistoryChange(() => {
      this.uriHistory = atom.uriHandlerRegistry.getRecentlyHandledURIs();
      _etch.default.update(this);
    }));
  }
  destroy() {
    this.subscriptions.dispose();
    return _etch.default.destroy(this);
  }
  update() {}
  render() {
    const schema = atom.config.getSchema('core.uriHandlerRegistration');
    return _etch.default.dom("div", {
      className: "panels-item",
      tabIndex: "0"
    }, _etch.default.dom("form", {
      className: "general-panel section"
    }, _etch.default.dom("div", {
      className: "settings-panel"
    }, _etch.default.dom("div", {
      className: "section-container"
    }, _etch.default.dom("div", {
      className: "block section-heading icon icon-device-desktop"
    }, "URI Handling"), _etch.default.dom("div", {
      className: "text icon icon-question"
    }, "These settings determine how Atom handles atom:// URIs."), _etch.default.dom("div", {
      className: "section-body"
    }, _etch.default.dom("div", {
      className: "control-group"
    }, _etch.default.dom("div", {
      className: "controls"
    }, _etch.default.dom("label", {
      className: "control-label"
    }, _etch.default.dom("div", {
      className: "setting-title"
    }, "URI Handler Registration"), _etch.default.dom("div", {
      className: "setting-description"
    }, this.renderRegistrationDescription())), _etch.default.dom("button", {
      className: "btn btn-primary",
      disabled: !isSupported() || this.isDefaultProtocolClient,
      style: {
        fontSize: '1.25em',
        display: 'block'
      },
      onClick: this.handleBecomeProtocolClient
    }, "Register as default atom:// protocol handler"))), _etch.default.dom("div", {
      className: "control-group"
    }, _etch.default.dom("div", {
      className: "controls"
    }, _etch.default.dom("label", {
      className: "control-label"
    }, _etch.default.dom("div", {
      className: "setting-title"
    }, "Default Registration"), _etch.default.dom("div", {
      className: "setting-description"
    }, schema.description)), _etch.default.dom("select", {
      id: "core.uriHandlerRegistration",
      className: "form-control",
      onChange: this.handleChange,
      value: atom.config.get('core.uriHandlerRegistration')
    }, schema.enum.map(({
      description,
      value
    }) => _etch.default.dom("option", {
      value: value
    }, description))))), _etch.default.dom("div", {
      className: "control-group"
    }, _etch.default.dom("div", {
      className: "controls"
    }, _etch.default.dom("label", {
      className: "controls-label"
    }, _etch.default.dom("div", {
      className: "setting-title"
    }, "Recent URIs")), _etch.default.dom("table", {
      className: "uri-history"
    }, _etch.default.dom("tr", null, _etch.default.dom("th", null, "URI"), _etch.default.dom("th", null, "Handled By")), this.uriHistory.map(this.renderHistoryRow.bind(this))))))))));
  }
  renderHistoryRow(item, idx) {
    return _etch.default.dom("tr", {
      key: item.id,
      className: ""
    }, _etch.default.dom("td", null, item.uri), _etch.default.dom("td", null, item.handled ? this.renderItem(item) : _etch.default.dom("em", null, "not handled")));
  }
  renderItem(item) {
    if (item.host === 'core') {
      return _etch.default.dom("em", null, "core");
    } else {
      return _etch.default.dom("a", {
        href: `atom://config/packages/${item.host}`,
        onClick: this.handlePackageLinkClicked
      }, item.host);
    }
  }
  handlePackageLinkClicked(evt) {
    evt.preventDefault();
    atom.workspace.open(evt.target.getAttribute('href'));
  }
  renderRegistrationDescription() {
    if (this.isDefaultProtocolClient) {
      return 'Atom is already the default handler for atom:// URIs.';
    } else if (isSupported()) {
      return 'Register Atom as the default handler for atom:// URIs.';
    } else {
      return 'Registration as the default handler for atom:// URIs is only supported on Windows and macOS.';
    }
  }
  handleChange(evt) {
    atom.config.set('core.uriHandlerRegistration', evt.target.value);
  }
  handleBecomeProtocolClient(evt) {
    evt.preventDefault();
    if (setAsDefaultProtocolClient()) {
      this.isDefaultProtocolClient = isDefaultProtocolClient();
      _etch.default.update(this);
    } else {
      atom.notifications.addError('Could not become default protocol client');
    }
  }
  focus() {
    this.element.focus();
  }
  show() {
    this.element.style.display = '';
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
exports.default = UriHandlerPanel;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc1N1cHBvcnRlZCIsImluY2x1ZGVzIiwicHJvY2VzcyIsInBsYXRmb3JtIiwiaXNEZWZhdWx0UHJvdG9jb2xDbGllbnQiLCJyZXF1aXJlIiwicmVtb3RlIiwiYXBwIiwiZXhlY1BhdGgiLCJzZXRBc0RlZmF1bHRQcm90b2NvbENsaWVudCIsIlVyaUhhbmRsZXJQYW5lbCIsImNvbnN0cnVjdG9yIiwiaGFuZGxlQ2hhbmdlIiwiYmluZCIsImhhbmRsZUJlY29tZVByb3RvY29sQ2xpZW50IiwidXJpSGlzdG9yeSIsImV0Y2giLCJpbml0aWFsaXplIiwic3Vic2NyaXB0aW9ucyIsIkNvbXBvc2l0ZURpc3Bvc2FibGUiLCJhZGQiLCJhdG9tIiwiY29tbWFuZHMiLCJlbGVtZW50Iiwic2Nyb2xsVXAiLCJzY3JvbGxEb3duIiwicGFnZVVwIiwicGFnZURvd24iLCJzY3JvbGxUb1RvcCIsInNjcm9sbFRvQm90dG9tIiwidXJpSGFuZGxlclJlZ2lzdHJ5Iiwib25IaXN0b3J5Q2hhbmdlIiwiZ2V0UmVjZW50bHlIYW5kbGVkVVJJcyIsInVwZGF0ZSIsImRlc3Ryb3kiLCJkaXNwb3NlIiwicmVuZGVyIiwic2NoZW1hIiwiY29uZmlnIiwiZ2V0U2NoZW1hIiwicmVuZGVyUmVnaXN0cmF0aW9uRGVzY3JpcHRpb24iLCJmb250U2l6ZSIsImRpc3BsYXkiLCJkZXNjcmlwdGlvbiIsImdldCIsImVudW0iLCJtYXAiLCJ2YWx1ZSIsInJlbmRlckhpc3RvcnlSb3ciLCJpdGVtIiwiaWR4IiwiaWQiLCJ1cmkiLCJoYW5kbGVkIiwicmVuZGVySXRlbSIsImhvc3QiLCJoYW5kbGVQYWNrYWdlTGlua0NsaWNrZWQiLCJldnQiLCJwcmV2ZW50RGVmYXVsdCIsIndvcmtzcGFjZSIsIm9wZW4iLCJ0YXJnZXQiLCJnZXRBdHRyaWJ1dGUiLCJzZXQiLCJub3RpZmljYXRpb25zIiwiYWRkRXJyb3IiLCJmb2N1cyIsInNob3ciLCJzdHlsZSIsInNjcm9sbFRvcCIsImRvY3VtZW50IiwiYm9keSIsIm9mZnNldEhlaWdodCIsInNjcm9sbEhlaWdodCJdLCJzb3VyY2VzIjpbInVyaS1oYW5kbGVyLXBhbmVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cbi8qKiBAanN4IGV0Y2guZG9tICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCBldGNoIGZyb20gJ2V0Y2gnXG5cbmZ1bmN0aW9uIGlzU3VwcG9ydGVkICgpIHtcbiAgcmV0dXJuIFsnd2luMzInLCAnZGFyd2luJ10uaW5jbHVkZXMocHJvY2Vzcy5wbGF0Zm9ybSlcbn1cblxuZnVuY3Rpb24gaXNEZWZhdWx0UHJvdG9jb2xDbGllbnQgKCkge1xuICByZXR1cm4gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGUuYXBwLmlzRGVmYXVsdFByb3RvY29sQ2xpZW50KCdhdG9tJywgcHJvY2Vzcy5leGVjUGF0aCwgWyctLXVyaS1oYW5kbGVyJywgJy0tJ10pXG59XG5cbmZ1bmN0aW9uIHNldEFzRGVmYXVsdFByb3RvY29sQ2xpZW50ICgpIHtcbiAgLy8gVGhpcyBFbGVjdHJvbiBBUEkgaXMgb25seSBhdmFpbGFibGUgb24gV2luZG93cyBhbmQgbWFjT1MuIFRoZXJlIG1pZ2h0IGJlIHNvbWVcbiAgLy8gaGFja3MgdG8gbWFrZSBpdCB3b3JrIG9uIExpbnV4OyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2VsZWN0cm9uL2VsZWN0cm9uL2lzc3Vlcy82NDQwXG4gIHJldHVybiBpc1N1cHBvcnRlZCgpICYmIHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlLmFwcC5zZXRBc0RlZmF1bHRQcm90b2NvbENsaWVudCgnYXRvbScsIHByb2Nlc3MuZXhlY1BhdGgsIFsnLS11cmktaGFuZGxlcicsICctLSddKVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVcmlIYW5kbGVyUGFuZWwge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5oYW5kbGVDaGFuZ2UgPSB0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVCZWNvbWVQcm90b2NvbENsaWVudCA9IHRoaXMuaGFuZGxlQmVjb21lUHJvdG9jb2xDbGllbnQuYmluZCh0aGlzKVxuICAgIHRoaXMuaXNEZWZhdWx0UHJvdG9jb2xDbGllbnQgPSBpc0RlZmF1bHRQcm90b2NvbENsaWVudCgpXG4gICAgdGhpcy51cmlIaXN0b3J5ID0gW11cbiAgICBldGNoLmluaXRpYWxpemUodGhpcylcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAgICdjb3JlOm1vdmUtdXAnOiAoKSA9PiB7IHRoaXMuc2Nyb2xsVXAoKSB9LFxuICAgICAgICAnY29yZTptb3ZlLWRvd24nOiAoKSA9PiB7IHRoaXMuc2Nyb2xsRG93bigpIH0sXG4gICAgICAgICdjb3JlOnBhZ2UtdXAnOiAoKSA9PiB7IHRoaXMucGFnZVVwKCkgfSxcbiAgICAgICAgJ2NvcmU6cGFnZS1kb3duJzogKCkgPT4geyB0aGlzLnBhZ2VEb3duKCkgfSxcbiAgICAgICAgJ2NvcmU6bW92ZS10by10b3AnOiAoKSA9PiB7IHRoaXMuc2Nyb2xsVG9Ub3AoKSB9LFxuICAgICAgICAnY29yZTptb3ZlLXRvLWJvdHRvbSc6ICgpID0+IHsgdGhpcy5zY3JvbGxUb0JvdHRvbSgpIH1cbiAgICAgIH0pLFxuICAgICAgYXRvbS51cmlIYW5kbGVyUmVnaXN0cnkub25IaXN0b3J5Q2hhbmdlKCgpID0+IHtcbiAgICAgICAgdGhpcy51cmlIaXN0b3J5ID0gYXRvbS51cmlIYW5kbGVyUmVnaXN0cnkuZ2V0UmVjZW50bHlIYW5kbGVkVVJJcygpXG4gICAgICAgIGV0Y2gudXBkYXRlKHRoaXMpXG4gICAgICB9KVxuICAgIClcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICByZXR1cm4gZXRjaC5kZXN0cm95KHRoaXMpXG4gIH1cblxuICB1cGRhdGUgKCkge31cblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHNjaGVtYSA9IGF0b20uY29uZmlnLmdldFNjaGVtYSgnY29yZS51cmlIYW5kbGVyUmVnaXN0cmF0aW9uJylcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0ncGFuZWxzLWl0ZW0nIHRhYkluZGV4PScwJz5cbiAgICAgICAgPGZvcm0gY2xhc3NOYW1lPSdnZW5lcmFsLXBhbmVsIHNlY3Rpb24nPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZXR0aW5ncy1wYW5lbCc+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2VjdGlvbi1jb250YWluZXInPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nYmxvY2sgc2VjdGlvbi1oZWFkaW5nIGljb24gaWNvbi1kZXZpY2UtZGVza3RvcCc+VVJJIEhhbmRsaW5nPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSd0ZXh0IGljb24gaWNvbi1xdWVzdGlvbic+VGhlc2Ugc2V0dGluZ3MgZGV0ZXJtaW5lIGhvdyBBdG9tIGhhbmRsZXMgYXRvbTovLyBVUklzLjwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2VjdGlvbi1ib2R5Jz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29udHJvbC1ncm91cCc+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29udHJvbHMnPlxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPSdjb250cm9sLWxhYmVsJz5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2V0dGluZy10aXRsZSc+VVJJIEhhbmRsZXIgUmVnaXN0cmF0aW9uPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NldHRpbmctZGVzY3JpcHRpb24nPlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVyUmVnaXN0cmF0aW9uRGVzY3JpcHRpb24oKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nYnRuIGJ0bi1wcmltYXJ5J1xuICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshaXNTdXBwb3J0ZWQoKSB8fCB0aGlzLmlzRGVmYXVsdFByb3RvY29sQ2xpZW50fVxuICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7Zm9udFNpemU6ICcxLjI1ZW0nLCBkaXNwbGF5OiAnYmxvY2snfX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZUJlY29tZVByb3RvY29sQ2xpZW50fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgUmVnaXN0ZXIgYXMgZGVmYXVsdCBhdG9tOi8vIHByb3RvY29sIGhhbmRsZXJcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb250cm9sLWdyb3VwJz5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb250cm9scyc+XG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9J2NvbnRyb2wtbGFiZWwnPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZXR0aW5nLXRpdGxlJz5EZWZhdWx0IFJlZ2lzdHJhdGlvbjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZXR0aW5nLWRlc2NyaXB0aW9uJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzY2hlbWEuZGVzY3JpcHRpb259XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgICAgICAgICBpZD0nY29yZS51cmlIYW5kbGVyUmVnaXN0cmF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nZm9ybS1jb250cm9sJ1xuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17YXRvbS5jb25maWcuZ2V0KCdjb3JlLnVyaUhhbmRsZXJSZWdpc3RyYXRpb24nKX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIHtzY2hlbWEuZW51bS5tYXAoKHtkZXNjcmlwdGlvbiwgdmFsdWV9KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPXt2YWx1ZX0+e2Rlc2NyaXB0aW9ufTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbnRyb2wtZ3JvdXAnPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbnRyb2xzJz5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT0nY29udHJvbHMtbGFiZWwnPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZXR0aW5nLXRpdGxlJz5SZWNlbnQgVVJJczwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPSd1cmktaGlzdG9yeSc+XG4gICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoPlVSSTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGg+SGFuZGxlZCBCeTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICB7dGhpcy51cmlIaXN0b3J5Lm1hcCh0aGlzLnJlbmRlckhpc3RvcnlSb3cuYmluZCh0aGlzKSl9XG4gICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9mb3JtPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgcmVuZGVySGlzdG9yeVJvdyAoaXRlbSwgaWR4KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDx0clxuICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgIGNsYXNzTmFtZT0nJ1xuICAgICAgPlxuICAgICAgICA8dGQ+e2l0ZW0udXJpfTwvdGQ+XG4gICAgICAgIDx0ZD5cbiAgICAgICAgICB7aXRlbS5oYW5kbGVkXG4gICAgICAgICAgICA/IHRoaXMucmVuZGVySXRlbShpdGVtKVxuICAgICAgICAgICAgOiA8ZW0+bm90IGhhbmRsZWQ8L2VtPlxuICAgICAgICAgIH08L3RkPlxuICAgICAgPC90cj5cbiAgICApXG4gIH1cblxuICByZW5kZXJJdGVtIChpdGVtKSB7XG4gICAgaWYgKGl0ZW0uaG9zdCA9PT0gJ2NvcmUnKSB7XG4gICAgICByZXR1cm4gPGVtPmNvcmU8L2VtPlxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gPGEgaHJlZj17YGF0b206Ly9jb25maWcvcGFja2FnZXMvJHtpdGVtLmhvc3R9YH0gb25DbGljaz17dGhpcy5oYW5kbGVQYWNrYWdlTGlua0NsaWNrZWR9PntpdGVtLmhvc3R9PC9hPlxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZVBhY2thZ2VMaW5rQ2xpY2tlZCAoZXZ0KSB7XG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KClcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGV2dC50YXJnZXQuZ2V0QXR0cmlidXRlKCdocmVmJykpXG4gIH1cblxuICByZW5kZXJSZWdpc3RyYXRpb25EZXNjcmlwdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaXNEZWZhdWx0UHJvdG9jb2xDbGllbnQpIHtcbiAgICAgIHJldHVybiAnQXRvbSBpcyBhbHJlYWR5IHRoZSBkZWZhdWx0IGhhbmRsZXIgZm9yIGF0b206Ly8gVVJJcy4nXG4gICAgfSBlbHNlIGlmIChpc1N1cHBvcnRlZCgpKSB7XG4gICAgICByZXR1cm4gJ1JlZ2lzdGVyIEF0b20gYXMgdGhlIGRlZmF1bHQgaGFuZGxlciBmb3IgYXRvbTovLyBVUklzLidcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdSZWdpc3RyYXRpb24gYXMgdGhlIGRlZmF1bHQgaGFuZGxlciBmb3IgYXRvbTovLyBVUklzIGlzIG9ubHkgc3VwcG9ydGVkIG9uIFdpbmRvd3MgYW5kIG1hY09TLidcbiAgICB9XG4gIH1cblxuICBoYW5kbGVDaGFuZ2UgKGV2dCkge1xuICAgIGF0b20uY29uZmlnLnNldCgnY29yZS51cmlIYW5kbGVyUmVnaXN0cmF0aW9uJywgZXZ0LnRhcmdldC52YWx1ZSlcbiAgfVxuXG4gIGhhbmRsZUJlY29tZVByb3RvY29sQ2xpZW50IChldnQpIHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKVxuICAgIGlmIChzZXRBc0RlZmF1bHRQcm90b2NvbENsaWVudCgpKSB7XG4gICAgICB0aGlzLmlzRGVmYXVsdFByb3RvY29sQ2xpZW50ID0gaXNEZWZhdWx0UHJvdG9jb2xDbGllbnQoKVxuICAgICAgZXRjaC51cGRhdGUodGhpcylcbiAgICB9IGVsc2Uge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdDb3VsZCBub3QgYmVjb21lIGRlZmF1bHQgcHJvdG9jb2wgY2xpZW50JylcbiAgICB9XG4gIH1cblxuICBmb2N1cyAoKSB7XG4gICAgdGhpcy5lbGVtZW50LmZvY3VzKClcbiAgfVxuXG4gIHNob3cgKCkge1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJydcbiAgfVxuXG4gIHNjcm9sbFVwICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wIC09IGRvY3VtZW50LmJvZHkub2Zmc2V0SGVpZ2h0IC8gMjBcbiAgfVxuXG4gIHNjcm9sbERvd24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgKz0gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQgLyAyMFxuICB9XG5cbiAgcGFnZVVwICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wIC09IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgfVxuXG4gIHBhZ2VEb3duICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wICs9IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgfVxuXG4gIHNjcm9sbFRvVG9wICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wID0gMFxuICB9XG5cbiAgc2Nyb2xsVG9Cb3R0b20gKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLmVsZW1lbnQuc2Nyb2xsSGVpZ2h0XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBR0E7QUFDQTtBQUF1QjtBQUp2QjtBQUNBOztBQUtBLFNBQVNBLFdBQVcsR0FBSTtFQUN0QixPQUFPLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDQyxRQUFRLENBQUNDLE9BQU8sQ0FBQ0MsUUFBUSxDQUFDO0FBQ3ZEO0FBRUEsU0FBU0MsdUJBQXVCLEdBQUk7RUFDbEMsT0FBT0MsT0FBTyxDQUFDLFVBQVUsQ0FBQyxD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