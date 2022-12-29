"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _etch = _interopRequireDefault(require("etch"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */
/** @jsx etch.dom */

class ChangeLogView {
  constructor(props) {
    this.props = props;
    _etch.default.initialize(this);
    this.element.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (link && link.dataset.event) {
        this.props.reporterProxy.sendEvent(`clicked-welcome-${link.dataset.event}-link`);
      }
    });
  }
  didChangeShowChangeLog() {
    atom.config.set('welcome.showChangeLog', this.checked);
  }
  dismissVersion() {
    atom.config.set('welcome.lastViewedChangeLog', atom.getVersion().split(" ")[0]);
  }
  wasVersionDismissed() {
    const lastVersion = atom.config.get('welcome.lastViewedChangeLog');
    const curVersion = atom.getVersion().split(".");
    if (lastVersion[0] < curVersion[0] && lastVersion[1] < curVersion[1] && lastVersion[2].split(" ")[0] < curVersion[2].split(" ")[0]) {
      return false;
    } else {
      return true;
    }
  }
  update() {}
  serialize() {
    return {
      deserializer: 'ChangeLogView',
      uri: this.props.uri
    };
  }
  render() {
    return _etch.default.dom("div", {
      className: "welcome"
    }, _etch.default.dom("div", {
      className: "welcome-container"
    }, _etch.default.dom("div", {
      className: "header"
    }, _etch.default.dom("a", {
      title: "pulsar-edit.dev",
      href: atom.branding.urlWeb
    }, _etch.default.dom("h1", {
      className: "welcome-title"
    }, "Change Log"))), _etch.default.dom("div", {
      className: "welcome-panel"
    }, _etch.default.dom("p", null, "Take a look at some of the awesome things ", atom.branding.name, " has changed:"), _etch.default.dom("ul", null, _etch.default.dom("li", null, _etch.default.dom("a", {
      href: "https://github.com/pulsar-edit/pulsar/pull/28"
    }, "Bump to Electron 12 and Node 14")), _etch.default.dom("li", null, _etch.default.dom("a", {
      href: "https://github.com/pulsar-edit/pulsar/pull/7"
    }, "Added a rebranding API")), _etch.default.dom("li", null, _etch.default.dom("a", {
      href: "https://github.com/pulsar-edit/pulsar/pull/67"
    }, "Removed experimental file watchers on the editor")), _etch.default.dom("li", null, _etch.default.dom("a", {
      href: "https://github.com/pulsar-edit/pulsar/pull/131"
    }, "Ability to install packages from Git Repositories")), _etch.default.dom("li", null, _etch.default.dom("a", {
      href: "#"
    }, "Migrated to a new Repository Backend")), _etch.default.dom("li", null, _etch.default.dom("a", {
      href: "#"
    }, "Better error messages when a package fails to install.")), _etch.default.dom("li", null, _etch.default.dom("a", {
      href: "#"
    }, "Configuration file watching fixes")), _etch.default.dom("li", null, _etch.default.dom("a", {
      href: "#"
    }, "Bumped Tree-Sitter to 0.20.1 and all grammars to their recent versions")), _etch.default.dom("li", null, _etch.default.dom("a", {
      href: "#"
    }, "Native support for Apple Silicon")), _etch.default.dom("li", null, _etch.default.dom("a", {
      href: "https://github.com/pulsar-edit/pulsar/pull/105"
    }, "Removed Benchmark Mode")), _etch.default.dom("li", null, _etch.default.dom("a", {
      href: "https://github.com/pulsar-edit/pulsar/pull/59"
    }, "Bumped Async to v3.2.4")), _etch.default.dom("li", null, _etch.default.dom("a", {
      href: "https://github.com/pulsar-edit/pulsar/pull/40"
    }, "Removed all telemetry from the editor."))), _etch.default.dom("section", {
      className: "welcome-panel"
    }, _etch.default.dom("label", null, _etch.default.dom("input", {
      className: "input-checkbox",
      type: "checkbox",
      checked: atom.config.get('welcome.showChangeLog'),
      onchange: this.didChangeShowChangeLog
    }), "Show the Change Log after an update.")), _etch.default.dom("section", {
      className: "welcome-panel"
    }, _etch.default.dom("label", null, _etch.default.dom("input", {
      className: "input-checkbox",
      type: "checkbox",
      checked: this.wasVersionDismissed(),
      onchange: this.dismissVersion
    }), "Dismiss this Change Log")))));
  }
  getURI() {
    return this.props.uri;
  }
  getTitle() {
    return 'Change Log';
  }
  isEqual(other) {
    return other instanceof ChangeLogView;
  }
}
exports.default = ChangeLogView;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGFuZ2VMb2dWaWV3IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImV0Y2giLCJpbml0aWFsaXplIiwiZWxlbWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImxpbmsiLCJ0YXJnZXQiLCJjbG9zZXN0IiwiZGF0YXNldCIsInJlcG9ydGVyUHJveHkiLCJzZW5kRXZlbnQiLCJkaWRDaGFuZ2VTaG93Q2hhbmdlTG9nIiwiYXRvbSIsImNvbmZpZyIsInNldCIsImNoZWNrZWQiLCJkaXNtaXNzVmVyc2lvbiIsImdldFZlcnNpb24iLCJzcGxpdCIsIndhc1ZlcnNpb25EaXNtaXNzZWQiLCJsYXN0VmVyc2lvbiIsImdldCIsImN1clZlcnNpb24iLCJ1cGRhdGUiLCJzZXJpYWxpemUiLCJkZXNlcmlhbGl6ZXIiLCJ1cmkiLCJyZW5kZXIiLCJicmFuZGluZyIsInVybFdlYiIsIm5hbWUiLCJnZXRVUkkiLCJnZXRUaXRsZSIsImlzRXF1YWwiLCJvdGhlciJdLCJzb3VyY2VzIjpbImNoYW5nZWxvZy12aWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cbi8qKiBAanN4IGV0Y2guZG9tICovXG5cbmltcG9ydCBldGNoIGZyb20gJ2V0Y2gnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGFuZ2VMb2dWaWV3IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgZXRjaC5pbml0aWFsaXplKHRoaXMpO1xuXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgY29uc3QgbGluayA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdhJyk7XG4gICAgICBpZiAobGluayAmJiBsaW5rLmRhdGFzZXQuZXZlbnQpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5yZXBvcnRlclByb3h5LnNlbmRFdmVudChcbiAgICAgICAgICBgY2xpY2tlZC13ZWxjb21lLSR7bGluay5kYXRhc2V0LmV2ZW50fS1saW5rYFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZGlkQ2hhbmdlU2hvd0NoYW5nZUxvZygpIHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ3dlbGNvbWUuc2hvd0NoYW5nZUxvZycsIHRoaXMuY2hlY2tlZCk7XG4gIH1cblxuICBkaXNtaXNzVmVyc2lvbigpIHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ3dlbGNvbWUubGFzdFZpZXdlZENoYW5nZUxvZycsIGF0b20uZ2V0VmVyc2lvbigpLnNwbGl0KFwiIFwiKVswXSk7XG4gIH1cblxuICB3YXNWZXJzaW9uRGlzbWlzc2VkKCkge1xuICAgIGNvbnN0IGxhc3RWZXJzaW9uID0gYXRvbS5jb25maWcuZ2V0KCd3ZWxjb21lLmxhc3RWaWV3ZWRDaGFuZ2VMb2cnKTtcbiAgICBjb25zdCBjdXJWZXJzaW9uID0gYXRvbS5nZXRWZXJzaW9uKCkuc3BsaXQoXCIuXCIpO1xuICAgIGlmIChsYXN0VmVyc2lvblswXSA8IGN1clZlcnNpb25bMF0gJiYgbGFzdFZlcnNpb25bMV0gPCBjdXJWZXJzaW9uWzFdICYmIGxhc3RWZXJzaW9uWzJdLnNwbGl0KFwiIFwiKVswXSA8IGN1clZlcnNpb25bMl0uc3BsaXQoXCIgXCIpWzBdKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpIHt9XG5cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdDaGFuZ2VMb2dWaWV3JyxcbiAgICAgIHVyaTogdGhpcy5wcm9wcy51cmlcbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndlbGNvbWVcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3ZWxjb21lLWNvbnRhaW5lclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaGVhZGVyXCI+XG4gICAgICAgICAgICA8YSB0aXRsZT1cInB1bHNhci1lZGl0LmRldlwiIGhyZWY9e2F0b20uYnJhbmRpbmcudXJsV2VifT5cbiAgICAgICAgICAgICAgey8qIExPR08gR09FUyBIRVJFICovfVxuICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwid2VsY29tZS10aXRsZVwiPlxuICAgICAgICAgICAgICAgIENoYW5nZSBMb2dcbiAgICAgICAgICAgICAgPC9oMT5cbiAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndlbGNvbWUtcGFuZWxcIj5cbiAgICAgICAgICAgIDxwPlRha2UgYSBsb29rIGF0IHNvbWUgb2YgdGhlIGF3ZXNvbWUgdGhpbmdzIHthdG9tLmJyYW5kaW5nLm5hbWV9IGhhcyBjaGFuZ2VkOjwvcD5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vcHVsc2FyLWVkaXQvcHVsc2FyL3B1bGwvMjhcIj5cbiAgICAgICAgICAgICAgICAgIEJ1bXAgdG8gRWxlY3Ryb24gMTIgYW5kIE5vZGUgMTRcbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3B1bHNhci1lZGl0L3B1bHNhci9wdWxsLzdcIj5cbiAgICAgICAgICAgICAgICAgIEFkZGVkIGEgcmVicmFuZGluZyBBUElcbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3B1bHNhci1lZGl0L3B1bHNhci9wdWxsLzY3XCI+XG4gICAgICAgICAgICAgICAgICBSZW1vdmVkIGV4cGVyaW1lbnRhbCBmaWxlIHdhdGNoZXJzIG9uIHRoZSBlZGl0b3JcbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3B1bHNhci1lZGl0L3B1bHNhci9wdWxsLzEzMVwiPlxuICAgICAgICAgICAgICAgICAgQWJpbGl0eSB0byBpbnN0YWxsIHBhY2thZ2VzIGZyb20gR2l0IFJlcG9zaXRvcmllc1xuICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIjXCI+XG4gICAgICAgICAgICAgICAgICBNaWdyYXRlZCB0byBhIG5ldyBSZXBvc2l0b3J5IEJhY2tlbmRcbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiI1wiPlxuICAgICAgICAgICAgICAgICAgQmV0dGVyIGVycm9yIG1lc3NhZ2VzIHdoZW4gYSBwYWNrYWdlIGZhaWxzIHRvIGluc3RhbGwuXG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiNcIj5cbiAgICAgICAgICAgICAgICAgIENvbmZpZ3VyYXRpb24gZmlsZSB3YXRjaGluZyBmaXhlc1xuICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIjXCI+XG4gICAgICAgICAgICAgICAgICBCdW1wZWQgVHJlZS1TaXR0ZXIgdG8gMC4yMC4xIGFuZCBhbGwgZ3JhbW1hcnMgdG8gdGhlaXIgcmVjZW50IHZlcnNpb25zXG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiNcIj5cbiAgICAgICAgICAgICAgICAgIE5hdGl2ZSBzdXBwb3J0IGZvciBBcHBsZSBTaWxpY29uXG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9wdWxzYXItZWRpdC9wdWxzYXIvcHVsbC8xMDVcIj5cbiAgICAgICAgICAgICAgICAgIFJlbW92ZWQgQmVuY2htYXJrIE1vZGVcbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3B1bHNhci1lZGl0L3B1bHNhci9wdWxsLzU5XCI+XG4gICAgICAgICAgICAgICAgICBCdW1wZWQgQXN5bmMgdG8gdjMuMi40XG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9wdWxzYXItZWRpdC9wdWxzYXIvcHVsbC80MFwiPlxuICAgICAgICAgICAgICAgICAgUmVtb3ZlZCBhbGwgdGVsZW1ldHJ5IGZyb20gdGhlIGVkaXRvci5cbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgIDwvbGk+XG5cbiAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndlbGNvbWUtcGFuZWxcIj5cbiAgICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJpbnB1dC1jaGVja2JveFwiXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgICAgY2hlY2tlZD17YXRvbS5jb25maWcuZ2V0KCd3ZWxjb21lLnNob3dDaGFuZ2VMb2cnKX1cbiAgICAgICAgICAgICAgICAgIG9uY2hhbmdlPXt0aGlzLmRpZENoYW5nZVNob3dDaGFuZ2VMb2d9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICBTaG93IHRoZSBDaGFuZ2UgTG9nIGFmdGVyIGFuIHVwZGF0ZS5cbiAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndlbGNvbWUtcGFuZWxcIj5cbiAgICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJpbnB1dC1jaGVja2JveFwiXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy53YXNWZXJzaW9uRGlzbWlzc2VkKCl9XG4gICAgICAgICAgICAgICAgICBvbmNoYW5nZT17dGhpcy5kaXNtaXNzVmVyc2lvbn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIERpc21pc3MgdGhpcyBDaGFuZ2UgTG9nXG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGdldFVSSSgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy51cmk7XG4gIH1cblxuICBnZXRUaXRsZSgpIHtcbiAgICByZXR1cm4gJ0NoYW5nZSBMb2cnO1xuICB9XG5cbiAgaXNFcXVhbChvdGhlcikge1xuICAgIHJldHVybiBvdGhlciBpbnN0YW5jZW9mIENoYW5n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