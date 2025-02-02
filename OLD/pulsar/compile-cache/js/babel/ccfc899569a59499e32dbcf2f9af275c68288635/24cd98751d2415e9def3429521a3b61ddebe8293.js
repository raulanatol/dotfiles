"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _etch = _interopRequireDefault(require("etch"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
class GuideView {
  constructor(props) {
    this.props = props;
    this.brand = atom.branding.name;
    this.didClickProjectButton = this.didClickProjectButton.bind(this);
    this.didClickGitButton = this.didClickGitButton.bind(this);
    this.didClickGitHubButton = this.didClickGitHubButton.bind(this);
    this.didClickTeletypeButton = this.didClickTeletypeButton.bind(this);
    this.didClickPackagesButton = this.didClickPackagesButton.bind(this);
    this.didClickThemesButton = this.didClickThemesButton.bind(this);
    this.didClickStylingButton = this.didClickStylingButton.bind(this);
    this.didClickInitScriptButton = this.didClickInitScriptButton.bind(this);
    this.didClickSnippetsButton = this.didClickSnippetsButton.bind(this);
    this.didExpandOrCollapseSection = this.didExpandOrCollapseSection.bind(this);
    _etch.default.initialize(this);
  }
  update() {}
  render() {
    return _etch.default.dom("div", {
      className: "welcome is-guide"
    }, _etch.default.dom("div", {
      className: "welcome-container"
    }, _etch.default.dom("section", {
      className: "welcome-panel"
    }, _etch.default.dom("h1", {
      className: "welcome-title"
    }, "Get to know ", this.brand, "!"), _etch.default.dom("details", _extends({
      className: "welcome-card"
    }, this.getSectionProps('project')), _etch.default.dom("summary", {
      className: "welcome-summary icon icon-repo"
    }, "Open a ", _etch.default.dom("span", {
      className: "welcome-highlight"
    }, "Project")), _etch.default.dom("div", {
      className: "welcome-detail"
    }, _etch.default.dom("p", null, _etch.default.dom("img", {
      className: "welcome-img",
      src: "atom://welcome/assets/project.svg"
    })), _etch.default.dom("p", null, "In ", this.brand, " you can open individual files or a whole folder as a project. Opening a folder will ad a tree view, on the left side (by default), listing all the files and folders belonging to your project."), _etch.default.dom("p", null, _etch.default.dom("button", {
      ref: "projectButton",
      onclick: this.didClickProjectButton,
      className: "btn btn-primary"
    }, "Open a Project")), _etch.default.dom("p", {
      className: "welcome-note"
    }, _etch.default.dom("strong", null, "Next time:"), " You can also open projects from the menu, keyboard shortcut or by dragging a folder onto the", this.brand, " dock icon."))), _etch.default.dom("details", _extends({
      className: "welcome-card"
    }, this.getSectionProps('git')), _etch.default.dom("summary", {
      className: "welcome-summary icon icon-mark-github"
    }, "Version control with", ' ', _etch.default.dom("span", {
      class: "welcome-highlight"
    }, "Git and GitHub")), _etch.default.dom("div", {
      className: "welcome-detail"
    }, _etch.default.dom("p", null, _etch.default.dom("img", {
      className: "welcome-img",
      src: "atom://welcome/assets/package.svg"
    })), _etch.default.dom("p", null, "Track changes to your code as you work. Branch, commit, push, and pull without leaving the comfort of your editor. Collaborate with other developers on GitHub."), _etch.default.dom("p", null, _etch.default.dom("button", {
      onclick: this.didClickGitButton,
      className: "btn btn-primary inline-block"
    }, "Open the Git panel"), _etch.default.dom("button", {
      onclick: this.didClickGitHubButton,
      className: "btn btn-primary inline-block"
    }, "Open the GitHub panel")), _etch.default.dom("p", {
      className: "welcome-note"
    }, _etch.default.dom("strong", null, "Next time:"), " You can toggle the Git tab by clicking on the", _etch.default.dom("span", {
      className: "icon icon-diff"
    }), " button in your status bar."))), _etch.default.dom("details", _extends({
      className: "welcome-card"
    }, this.getSectionProps('teletype')), _etch.default.dom("summary", {
      className: "welcome-summary icon icon-radio-tower"
    }, "Collaborate in real time with", ' ', _etch.default.dom("span", {
      class: "welcome-highlight"
    }, "Teletype")), _etch.default.dom("div", {
      className: "welcome-detail"
    }, _etch.default.dom("p", null, _etch.default.dom("img", {
      className: "welcome-img",
      src: "atom://welcome/assets/code.svg"
    })), _etch.default.dom("p", null, "Share your workspace with team members and collaborate on code in real time."), _etch.default.dom("p", null, _etch.default.dom("button", {
      onclick: this.didClickTeletypeButton,
      className: "btn btn-primary inline-block"
    }, "Install Teletype for ", this.brand)))), _etch.default.dom("details", _extends({
      className: "welcome-card"
    }, this.getSectionProps('packages')), _etch.default.dom("summary", {
      className: "welcome-summary icon icon-package"
    }, "Install a ", _etch.default.dom("span", {
      className: "welcome-highlight"
    }, "Package")), _etch.default.dom("div", {
      className: "welcome-detail"
    }, _etch.default.dom("p", null, _etch.default.dom("img", {
      className: "welcome-img",
      src: "atom://welcome/assets/package.svg"
    })), _etch.default.dom("p", null, "One of the best things about ", this.brand, " is the package ecosystem. Installing packages adds new features and functionality you can use to make the editor suit your needs. Let's install one."), _etch.default.dom("p", null, _etch.default.dom("button", {
      ref: "packagesButton",
      onclick: this.didClickPackagesButton,
      className: "btn btn-primary"
    }, "Open Installer")), _etch.default.dom("p", {
      className: "welcome-note"
    }, _etch.default.dom("strong", null, "Next time:"), " You can install new packages from the settings."))), _etch.default.dom("details", _extends({
      className: "welcome-card"
    }, this.getSectionProps('themes')), _etch.default.dom("summary", {
      className: "welcome-summary icon icon-paintcan"
    }, "Choose a ", _etch.default.dom("span", {
      class: "welcome-highlight"
    }, "Theme")), _etch.default.dom("div", {
      className: "welcome-detail"
    }, _etch.default.dom("p", null, _etch.default.dom("img", {
      className: "welcome-img",
      src: "atom://welcome/assets/theme.svg"
    })), _etch.default.dom("p", null, this.brand, " comes with preinstalled themes. Let's try a few."), _etch.default.dom("p", null, _etch.default.dom("button", {
      ref: "themesButton",
      onclick: this.didClickThemesButton,
      className: "btn btn-primary"
    }, "Open the theme picker")), _etch.default.dom("p", null, "You can also install themes created by the ", this.brand, " community. To install new themes, click on \"+ Install\" and switch the toggle to \"themes\"."), _etch.default.dom("p", {
      className: "welcome-note"
    }, _etch.default.dom("strong", null, "Next time:"), " You can switch themes from the settings."))), _etch.default.dom("details", _extends({
      className: "welcome-card"
    }, this.getSectionProps('styling')), _etch.default.dom("summary", {
      className: "welcome-summary icon icon-paintcan"
    }, "Customize the ", _etch.default.dom("span", {
      class: "welcome-highlight"
    }, "Styling")), _etch.default.dom("div", {
      className: "welcome-detail"
    }, _etch.default.dom("p", null, _etch.default.dom("img", {
      className: "welcome-img",
      src: "atom://welcome/assets/code.svg"
    })), _etch.default.dom("p", null, "You can customize almost anything by adding your own CSS/LESS."), _etch.default.dom("p", null, _etch.default.dom("button", {
      ref: "stylingButton",
      onclick: this.didClickStylingButton,
      className: "btn btn-primary"
    }, "Open your Stylesheet")), _etch.default.dom("p", null, "Now uncomment some of the examples or try your own"), _etch.default.dom("p", {
      className: "welcome-note"
    }, _etch.default.dom("strong", null, "Next time:"), " You can open your stylesheet from Menu ", this.getApplicationMenuName(), "."))), _etch.default.dom("details", _extends({
      className: "welcome-card"
    }, this.getSectionProps('init-script')), _etch.default.dom("summary", {
      className: "welcome-summary icon icon-code"
    }, "Hack on the ", _etch.default.dom("span", {
      class: "welcome-highlight"
    }, "Init Script")), _etch.default.dom("div", {
      className: "welcome-detail"
    }, _etch.default.dom("p", null, _etch.default.dom("img", {
      className: "welcome-img",
      src: "atom://welcome/assets/code.svg"
    })), _etch.default.dom("p", null, "The init script is a bit of JavaScript or CoffeeScript run at startup. You can use it to quickly change the behaviour of", this.brand, "."), _etch.default.dom("p", null, _etch.default.dom("button", {
      ref: "initScriptButton",
      onclick: this.didClickInitScriptButton,
      className: "btn btn-primary"
    }, "Open your Init Script")), _etch.default.dom("p", null, "Uncomment some of the examples or try out your own."), _etch.default.dom("p", {
      className: "welcome-note"
    }, _etch.default.dom("strong", null, "Next time:"), " You can open your init script from Menu > ", this.getApplicationMenuName(), "."))), _etch.default.dom("details", _extends({
      className: "welcome-card"
    }, this.getSectionProps('snippets')), _etch.default.dom("summary", {
      className: "welcome-summary icon icon-code"
    }, "Add a ", _etch.default.dom("span", {
      class: "welcome-highlight"
    }, "Snippet")), _etch.default.dom("div", {
      className: "welcome-detail"
    }, _etch.default.dom("p", null, _etch.default.dom("img", {
      className: "welcome-img",
      src: "atom://welcome/assets/code.svg"
    })), _etch.default.dom("p", null, this.brand, " snippets allow you to enter a simple prefix in the editor and hit tab to expand the prefix into a larger code block with templated values."), _etch.default.dom("p", null, _etch.default.dom("button", {
      ref: "snippetsButton",
      onclick: this.didClickSnippetsButton,
      className: "btn btn-primary"
    }, "Open your Snippets")), _etch.default.dom("p", null, "In your snippets file, type ", _etch.default.dom("code", null, "snip"), " then hit", ' ', _etch.default.dom("code", null, "tab"), ". The ", _etch.default.dom("code", null, "snip"), " snippet will expand to create a snippet!"), _etch.default.dom("p", {
      className: "welcome-note"
    }, _etch.default.dom("strong", null, "Next time:"), " You can open your snippets in Menu > ", this.getApplicationMenuName(), "."))), _etch.default.dom("details", _extends({
      className: "welcome-card"
    }, this.getSectionProps('shortcuts')), _etch.default.dom("summary", {
      className: "welcome-summary icon icon-keyboard"
    }, "Learn ", _etch.default.dom("span", {
      class: "welcome-highlight"
    }, "Keyboard Shortcuts")), _etch.default.dom("div", {
      className: "welcome-detail"
    }, _etch.default.dom("p", null, _etch.default.dom("img", {
      className: "welcome-img",
      src: "atom://welcome/assets/shortcut.svg"
    })), _etch.default.dom("p", null, "If you only remember one keyboard shortcut make it", ' ', _etch.default.dom("kbd", {
      className: "welcome-key"
    }, this.getCommandPaletteKeyBinding()), ". This keystroke toggles the command palette, which lists every ", this.brand, " command. It's a good way to learn more shortcuts. Yes, you can try it now!"), _etch.default.dom("p", null, "If you want to use these guides again use the command palette", ' ', _etch.default.dom("kbd", {
      className: "welcome-key"
    }, this.getCommandPaletteKeyBinding()), ' ', "and search for ", _etch.default.dom("span", {
      className: "text-highlight"
    }, "Welcome"), "."))))));
  }
  getSectionProps(sectionName) {
    const props = {
      dataset: {
        section: sectionName
      },
      onclick: this.didExpandOrCollapseSection
    };
    if (this.props.openSections && this.props.openSections.indexOf(sectionName) !== -1) {
      props.open = true;
    }
    return props;
  }
  getCommandPaletteKeyBinding() {
    if (process.platform === 'darwin') {
      return 'cmd-shift-p';
    } else {
      return 'ctrl-shift-p';
    }
  }
  getApplicationMenuName() {
    if (process.platform === 'darwin') {
      return 'Pulsar';
    } else if (process.platform === 'linux') {
      return 'Edit';
    } else {
      return 'File';
    }
  }
  serialize() {
    return {
      deserializer: this.constructor.name,
      openSections: this.getOpenSections(),
      uri: this.getURI()
    };
  }
  getURI() {
    return this.props.uri;
  }
  getTitle() {
    return 'Welcome Guide';
  }
  isEqual(other) {
    return other instanceof GuideView;
  }
  getOpenSections() {
    return Array.from(this.element.querySelectorAll('details[open]')).map(sectionElement => sectionElement.dataset.section);
  }
  didClickProjectButton() {
    this.props.reporterProxy.sendEvent('clicked-project-cta');
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'application:open');
  }
  didClickGitButton() {
    this.props.reporterProxy.sendEvent('clicked-git-cta');
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'github:toggle-git-tab');
  }
  didClickGitHubButton() {
    this.props.reporterProxy.sendEvent('clicked-github-cta');
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'github:toggle-github-tab');
  }
  didClickPackagesButton() {
    this.props.reporterProxy.sendEvent('clicked-packages-cta');
    atom.workspace.open('atom://config/install', {
      split: 'left'
    });
  }
  didClickThemesButton() {
    this.props.reporterProxy.sendEvent('clicked-themes-cta');
    atom.workspace.open('atom://config/themes', {
      split: 'left'
    });
  }
  didClickStylingButton() {
    this.props.reporterProxy.sendEvent('clicked-styling-cta');
    atom.workspace.open('atom://.pulsar/stylesheet', {
      split: 'left'
    });
  }
  didClickInitScriptButton() {
    this.props.reporterProxy.sendEvent('clicked-init-script-cta');
    atom.workspace.open('atom://.pulsar/init-script', {
      split: 'left'
    });
  }
  didClickSnippetsButton() {
    this.props.reporterProxy.sendEvent('clicked-snippets-cta');
    atom.workspace.open('atom://.pulsar/snippets', {
      split: 'left'
    });
  }
  didClickTeletypeButton() {
    this.props.reporterProxy.sendEvent('clicked-teletype-cta');
    atom.workspace.open('atom://config/packages/teletype', {
      split: 'left'
    });
  }
  didExpandOrCollapseSection(event) {
    const sectionName = event.currentTarget.closest('details').dataset.section;
    const action = event.currentTarget.hasAttribute('open') ? 'collapse' : 'expand';
    this.props.reporterProxy.sendEvent(`${action}-${sectionName}-section`);
  }
}
exports.default = GuideView;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHdWlkZVZpZXciLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiYnJhbmQiLCJhdG9tIiwiYnJhbmRpbmciLCJuYW1lIiwiZGlkQ2xpY2tQcm9qZWN0QnV0dG9uIiwiYmluZCIsImRpZENsaWNrR2l0QnV0dG9uIiwiZGlkQ2xpY2tHaXRIdWJCdXR0b24iLCJkaWRDbGlja1RlbGV0eXBlQnV0dG9uIiwiZGlkQ2xpY2tQYWNrYWdlc0J1dHRvbiIsImRpZENsaWNrVGhlbWVzQnV0dG9uIiwiZGlkQ2xpY2tTdHlsaW5nQnV0dG9uIiwiZGlkQ2xpY2tJbml0U2NyaXB0QnV0dG9uIiwiZGlkQ2xpY2tTbmlwcGV0c0J1dHRvbiIsImRpZEV4cGFuZE9yQ29sbGFwc2VTZWN0aW9uIiwiZXRjaCIsImluaXRpYWxpemUiLCJ1cGRhdGUiLCJyZW5kZXIiLCJnZXRTZWN0aW9uUHJvcHMiLCJnZXRBcHBsaWNhdGlvbk1lbnVOYW1lIiwiZ2V0Q29tbWFuZFBhbGV0dGVLZXlCaW5kaW5nIiwic2VjdGlvbk5hbWUiLCJkYXRhc2V0Iiwic2VjdGlvbiIsIm9uY2xpY2siLCJvcGVuU2VjdGlvbnMiLCJpbmRleE9mIiwib3BlbiIsInByb2Nlc3MiLCJwbGF0Zm9ybSIsInNlcmlhbGl6ZSIsImRlc2VyaWFsaXplciIsImdldE9wZW5TZWN0aW9ucyIsInVyaSIsImdldFVSSSIsImdldFRpdGxlIiwiaXNFcXVhbCIsIm90aGVyIiwiQXJyYXkiLCJmcm9tIiwiZWxlbWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJtYXAiLCJzZWN0aW9uRWxlbWVudCIsInJlcG9ydGVyUHJveHkiLCJzZW5kRXZlbnQiLCJjb21tYW5kcyIsImRpc3BhdGNoIiwidmlld3MiLCJnZXRWaWV3Iiwid29ya3NwYWNlIiwic3BsaXQiLCJldmVudCIsImN1cnJlbnRUYXJnZXQiLCJjbG9zZXN0IiwiYWN0aW9uIiwiaGFzQXR0cmlidXRlIl0sInNvdXJjZXMiOlsiZ3VpZGUtdmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG4vKiogQGpzeCBldGNoLmRvbSAqL1xuXG5pbXBvcnQgZXRjaCBmcm9tICdldGNoJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3VpZGVWaWV3IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgdGhpcy5icmFuZCA9IGF0b20uYnJhbmRpbmcubmFtZTtcbiAgICB0aGlzLmRpZENsaWNrUHJvamVjdEJ1dHRvbiA9IHRoaXMuZGlkQ2xpY2tQcm9qZWN0QnV0dG9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5kaWRDbGlja0dpdEJ1dHRvbiA9IHRoaXMuZGlkQ2xpY2tHaXRCdXR0b24uYmluZCh0aGlzKTtcbiAgICB0aGlzLmRpZENsaWNrR2l0SHViQnV0dG9uID0gdGhpcy5kaWRDbGlja0dpdEh1YkJ1dHRvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZGlkQ2xpY2tUZWxldHlwZUJ1dHRvbiA9IHRoaXMuZGlkQ2xpY2tUZWxldHlwZUJ1dHRvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZGlkQ2xpY2tQYWNrYWdlc0J1dHRvbiA9IHRoaXMuZGlkQ2xpY2tQYWNrYWdlc0J1dHRvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZGlkQ2xpY2tUaGVtZXNCdXR0b24gPSB0aGlzLmRpZENsaWNrVGhlbWVzQnV0dG9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5kaWRDbGlja1N0eWxpbmdCdXR0b24gPSB0aGlzLmRpZENsaWNrU3R5bGluZ0J1dHRvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZGlkQ2xpY2tJbml0U2NyaXB0QnV0dG9uID0gdGhpcy5kaWRDbGlja0luaXRTY3JpcHRCdXR0b24uYmluZCh0aGlzKTtcbiAgICB0aGlzLmRpZENsaWNrU25pcHBldHNCdXR0b24gPSB0aGlzLmRpZENsaWNrU25pcHBldHNCdXR0b24uYmluZCh0aGlzKTtcbiAgICB0aGlzLmRpZEV4cGFuZE9yQ29sbGFwc2VTZWN0aW9uID0gdGhpcy5kaWRFeHBhbmRPckNvbGxhcHNlU2VjdGlvbi5iaW5kKFxuICAgICAgdGhpc1xuICAgICk7XG4gICAgZXRjaC5pbml0aWFsaXplKHRoaXMpO1xuICB9XG5cbiAgdXBkYXRlKCkge31cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2VsY29tZSBpcy1ndWlkZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndlbGNvbWUtY29udGFpbmVyXCI+XG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2VsY29tZS1wYW5lbFwiPlxuICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cIndlbGNvbWUtdGl0bGVcIj5HZXQgdG8ga25vdyB7dGhpcy5icmFuZH0hPC9oMT5cblxuICAgICAgICAgICAgPGRldGFpbHNcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2VsY29tZS1jYXJkXCJcbiAgICAgICAgICAgICAgey4uLnRoaXMuZ2V0U2VjdGlvblByb3BzKCdwcm9qZWN0Jyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzdW1tYXJ5IGNsYXNzTmFtZT1cIndlbGNvbWUtc3VtbWFyeSBpY29uIGljb24tcmVwb1wiPlxuICAgICAgICAgICAgICAgIE9wZW4gYSA8c3BhbiBjbGFzc05hbWU9XCJ3ZWxjb21lLWhpZ2hsaWdodFwiPlByb2plY3Q8L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3VtbWFyeT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3ZWxjb21lLWRldGFpbFwiPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3ZWxjb21lLWltZ1wiXG4gICAgICAgICAgICAgICAgICAgIHNyYz1cImF0b206Ly93ZWxjb21lL2Fzc2V0cy9wcm9qZWN0LnN2Z1wiXG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgIEluIHt0aGlzLmJyYW5kfSB5b3UgY2FuIG9wZW4gaW5kaXZpZHVhbCBmaWxlcyBvciBhIHdob2xlIGZvbGRlciBhcyBhXG4gICAgICAgICAgICAgICAgICBwcm9qZWN0LiBPcGVuaW5nIGEgZm9sZGVyIHdpbGwgYWQgYSB0cmVlIHZpZXcsIG9uIHRoZSBsZWZ0IHNpZGUgXG4gICAgICAgICAgICAgICAgICAoYnkgZGVmYXVsdCksIGxpc3RpbmcgYWxsIHRoZSBmaWxlcyBhbmQgZm9sZGVycyBiZWxvbmdpbmcgdG8geW91ciBwcm9qZWN0LlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgcmVmPVwicHJvamVjdEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s9e3RoaXMuZGlkQ2xpY2tQcm9qZWN0QnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICBPcGVuIGEgUHJvamVjdFxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndlbGNvbWUtbm90ZVwiPlxuICAgICAgICAgICAgICAgICAgPHN0cm9uZz5OZXh0IHRpbWU6PC9zdHJvbmc+IFlvdSBjYW4gYWxzbyBvcGVuIHByb2plY3RzIGZyb21cbiAgICAgICAgICAgICAgICAgIHRoZSBtZW51LCBrZXlib2FyZCBzaG9ydGN1dCBvciBieSBkcmFnZ2luZyBhIGZvbGRlciBvbnRvIHRoZVxuICAgICAgICAgICAgICAgICAge3RoaXMuYnJhbmR9IGRvY2sgaWNvbi5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kZXRhaWxzPlxuXG4gICAgICAgICAgICA8ZGV0YWlscyBjbGFzc05hbWU9XCJ3ZWxjb21lLWNhcmRcIiB7Li4udGhpcy5nZXRTZWN0aW9uUHJvcHMoJ2dpdCcpfT5cbiAgICAgICAgICAgICAgPHN1bW1hcnkgY2xhc3NOYW1lPVwid2VsY29tZS1zdW1tYXJ5IGljb24gaWNvbi1tYXJrLWdpdGh1YlwiPlxuICAgICAgICAgICAgICAgIFZlcnNpb24gY29udHJvbCB3aXRoeycgJ31cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIndlbGNvbWUtaGlnaGxpZ2h0XCI+R2l0IGFuZCBHaXRIdWI8L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3VtbWFyeT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3ZWxjb21lLWRldGFpbFwiPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3ZWxjb21lLWltZ1wiXG4gICAgICAgICAgICAgICAgICAgIHNyYz1cImF0b206Ly93ZWxjb21lL2Fzc2V0cy9wYWNrYWdlLnN2Z1wiXG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgIFRyYWNrIGNoYW5nZXMgdG8geW91ciBjb2RlIGFzIHlvdSB3b3JrLiBCcmFuY2gsIGNvbW1pdCwgcHVzaCxcbiAgICAgICAgICAgICAgICAgIGFuZCBwdWxsIHdpdGhvdXQgbGVhdmluZyB0aGUgY29tZm9ydCBvZiB5b3VyIGVkaXRvci5cbiAgICAgICAgICAgICAgICAgIENvbGxhYm9yYXRlIHdpdGggb3RoZXIgZGV2ZWxvcGVycyBvbiBHaXRIdWIuXG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrPXt0aGlzLmRpZENsaWNrR2l0QnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnkgaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgT3BlbiB0aGUgR2l0IHBhbmVsXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25jbGljaz17dGhpcy5kaWRDbGlja0dpdEh1YkJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5IGlubGluZS1ibG9ja1wiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIE9wZW4gdGhlIEdpdEh1YiBwYW5lbFxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndlbGNvbWUtbm90ZVwiPlxuICAgICAgICAgICAgICAgICAgPHN0cm9uZz5OZXh0IHRpbWU6PC9zdHJvbmc+IFlvdSBjYW4gdG9nZ2xlIHRoZSBHaXQgdGFiIGJ5XG4gICAgICAgICAgICAgICAgICBjbGlja2luZyBvbiB0aGVcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1kaWZmXCIgLz4gYnV0dG9uIGluIHlvdXIgc3RhdHVzIGJhci5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kZXRhaWxzPlxuXG4gICAgICAgICAgICA8ZGV0YWlsc1xuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3ZWxjb21lLWNhcmRcIlxuICAgICAgICAgICAgICB7Li4udGhpcy5nZXRTZWN0aW9uUHJvcHMoJ3RlbGV0eXBlJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzdW1tYXJ5IGNsYXNzTmFtZT1cIndlbGNvbWUtc3VtbWFyeSBpY29uIGljb24tcmFkaW8tdG93ZXJcIj5cbiAgICAgICAgICAgICAgICBDb2xsYWJvcmF0ZSBpbiByZWFsIHRpbWUgd2l0aHsnICd9XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ3ZWxjb21lLWhpZ2hsaWdodFwiPlRlbGV0eXBlPC9zcGFuPlxuICAgICAgICAgICAgICA8L3N1bW1hcnk+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2VsY29tZS1kZXRhaWxcIj5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2VsY29tZS1pbWdcIlxuICAgICAgICAgICAgICAgICAgICBzcmM9XCJhdG9tOi8vd2VsY29tZS9hc3NldHMvY29kZS5zdmdcIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICBTaGFyZSB5b3VyIHdvcmtzcGFjZSB3aXRoIHRlYW0gbWVtYmVycyBhbmQgY29sbGFib3JhdGUgb24gY29kZVxuICAgICAgICAgICAgICAgICAgaW4gcmVhbCB0aW1lLlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25jbGljaz17dGhpcy5kaWRDbGlja1RlbGV0eXBlQnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnkgaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgSW5zdGFsbCBUZWxldHlwZSBmb3Ige3RoaXMuYnJhbmR9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kZXRhaWxzPlxuXG4gICAgICAgICAgICA8ZGV0YWlsc1xuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3ZWxjb21lLWNhcmRcIlxuICAgICAgICAgICAgICB7Li4udGhpcy5nZXRTZWN0aW9uUHJvcHMoJ3BhY2thZ2VzJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzdW1tYXJ5IGNsYXNzTmFtZT1cIndlbGNvbWUtc3VtbWFyeSBpY29uIGljb24tcGFja2FnZVwiPlxuICAgICAgICAgICAgICAgIEluc3RhbGwgYSA8c3BhbiBjbGFzc05hbWU9XCJ3ZWxjb21lLWhpZ2hsaWdodFwiPlBhY2thZ2U8L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3VtbWFyeT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3ZWxjb21lLWRldGFpbFwiPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3ZWxjb21lLWltZ1wiXG4gICAgICAgICAgICAgICAgICAgIHNyYz1cImF0b206Ly93ZWxjb21lL2Fzc2V0cy9wYWNrYWdlLnN2Z1wiXG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgIE9uZSBvZiB0aGUgYmVzdCB0aGluZ3MgYWJvdXQge3RoaXMuYnJhbmR9IGlzIHRoZSBwYWNrYWdlIGVjb3N5c3RlbS5cbiAgICAgICAgICAgICAgICAgIEluc3RhbGxpbmcgcGFja2FnZXMgYWRkcyBuZXcgZmVhdHVyZXMgYW5kIGZ1bmN0aW9uYWxpdHkgeW91XG4gICAgICAgICAgICAgICAgICBjYW4gdXNlIHRvIG1ha2UgdGhlIGVkaXRvciBzdWl0IHlvdXIgbmVlZHMuIExldCdzIGluc3RhbGwgb25lLlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgcmVmPVwicGFja2FnZXNCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrPXt0aGlzLmRpZENsaWNrUGFja2FnZXNCdXR0b259XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIE9wZW4gSW5zdGFsbGVyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2VsY29tZS1ub3RlXCI+XG4gICAgICAgICAgICAgICAgICA8c3Ryb25nPk5leHQgdGltZTo8L3N0cm9uZz4gWW91IGNhbiBpbnN0YWxsIG5ldyBwYWNrYWdlcyBmcm9tXG4gICAgICAgICAgICAgICAgICB0aGUgc2V0dGluZ3MuXG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGV0YWlscz5cblxuICAgICAgICAgICAgPGRldGFpbHNcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2VsY29tZS1jYXJkXCJcbiAgICAgICAgICAgICAgey4uLnRoaXMuZ2V0U2VjdGlvblByb3BzKCd0aGVtZXMnKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHN1bW1hcnkgY2xhc3NOYW1lPVwid2VsY29tZS1zdW1tYXJ5IGljb24gaWNvbi1wYWludGNhblwiPlxuICAgICAgICAgICAgICAgIENob29zZSBhIDxzcGFuIGNsYXNzPVwid2VsY29tZS1oaWdobGlnaHRcIj5UaGVtZTwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9zdW1tYXJ5PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndlbGNvbWUtZGV0YWlsXCI+XG4gICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndlbGNvbWUtaW1nXCJcbiAgICAgICAgICAgICAgICAgICAgc3JjPVwiYXRvbTovL3dlbGNvbWUvYXNzZXRzL3RoZW1lLnN2Z1wiXG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD57dGhpcy5icmFuZH0gY29tZXMgd2l0aCBwcmVpbnN0YWxsZWQgdGhlbWVzLiBMZXQncyB0cnkgYSBmZXcuPC9wPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICByZWY9XCJ0aGVtZXNCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrPXt0aGlzLmRpZENsaWNrVGhlbWVzQnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICBPcGVuIHRoZSB0aGVtZSBwaWNrZXJcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgIFlvdSBjYW4gYWxzbyBpbnN0YWxsIHRoZW1lcyBjcmVhdGVkIGJ5IHRoZSB7dGhpcy5icmFuZH0gY29tbXVuaXR5LiBUb1xuICAgICAgICAgICAgICAgICAgaW5zdGFsbCBuZXcgdGhlbWVzLCBjbGljayBvbiBcIisgSW5zdGFsbFwiIGFuZCBzd2l0Y2ggdGhlIHRvZ2dsZVxuICAgICAgICAgICAgICAgICAgdG8gXCJ0aGVtZXNcIi5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2VsY29tZS1ub3RlXCI+XG4gICAgICAgICAgICAgICAgICA8c3Ryb25nPk5leHQgdGltZTo8L3N0cm9uZz4gWW91IGNhbiBzd2l0Y2ggdGhlbWVzIGZyb20gdGhlXG4gICAgICAgICAgICAgICAgICBzZXR0aW5ncy5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kZXRhaWxzPlxuXG4gICAgICAgICAgICA8ZGV0YWlsc1xuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3ZWxjb21lLWNhcmRcIlxuICAgICAgICAgICAgICB7Li4udGhpcy5nZXRTZWN0aW9uUHJvcHMoJ3N0eWxpbmcnKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHN1bW1hcnkgY2xhc3NOYW1lPVwid2VsY29tZS1zdW1tYXJ5IGljb24gaWNvbi1wYWludGNhblwiPlxuICAgICAgICAgICAgICAgIEN1c3RvbWl6ZSB0aGUgPHNwYW4gY2xhc3M9XCJ3ZWxjb21lLWhpZ2hsaWdodFwiPlN0eWxpbmc8L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3VtbWFyeT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3ZWxjb21lLWRldGFpbFwiPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3ZWxjb21lLWltZ1wiXG4gICAgICAgICAgICAgICAgICAgIHNyYz1cImF0b206Ly93ZWxjb21lL2Fzc2V0cy9jb2RlLnN2Z1wiXG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgIFlvdSBjYW4gY3VzdG9taXplIGFsbW9zdCBhbnl0aGluZyBieSBhZGRpbmcgeW91ciBvd24gQ1NTL0xFU1MuXG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICByZWY9XCJzdHlsaW5nQnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgb25jbGljaz17dGhpcy5kaWRDbGlja1N0eWxpbmdCdXR0b259XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIE9wZW4geW91ciBTdHlsZXNoZWV0XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPHA+Tm93IHVuY29tbWVudCBzb21lIG9mIHRoZSBleGFtcGxlcyBvciB0cnkgeW91ciBvd248L3A+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2VsY29tZS1ub3RlXCI+XG4gICAgICAgICAgICAgICAgICA8c3Ryb25nPk5leHQgdGltZTo8L3N0cm9uZz4gWW91IGNhbiBvcGVuIHlvdXIgc3R5bGVzaGVldCBmcm9tXG4gICAgICAgICAgICAgICAgICBNZW51IHt0aGlzLmdldEFwcGxpY2F0aW9uTWVudU5hbWUoKX0uXG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGV0YWlscz5cblxuICAgICAgICAgICAgPGRldGFpbHNcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2VsY29tZS1jYXJkXCJcbiAgICAgICAgICAgICAgey4uLnRoaXMuZ2V0U2VjdGlvblByb3BzKCdpbml0LXNjcmlwdCcpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3VtbWFyeSBjbGFzc05hbWU9XCJ3ZWxjb21lLXN1bW1hcnkgaWNvbiBpY29uLWNvZGVcIj5cbiAgICAgICAgICAgICAgICBIYWNrIG9uIHRoZSA8c3BhbiBjbGFzcz1cIndlbGNvbWUtaGlnaGxpZ2h0XCI+SW5pdCBTY3JpcHQ8L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3VtbWFyeT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3ZWxjb21lLWRldGFpbFwiPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3ZWxjb21lLWltZ1wiXG4gICAgICAgICAgICAgICAgICAgIHNyYz1cImF0b206Ly93ZWxjb21lL2Fzc2V0cy9jb2RlLnN2Z1wiXG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgIFRoZSBpbml0IHNjcmlwdCBpcyBhIGJpdCBvZiBKYXZhU2NyaXB0IG9yIENvZmZlZVNjcmlwdCBydW4gYXRcbiAgICAgICAgICAgICAgICAgIHN0YXJ0dXAuIFlvdSBjYW4gdXNlIGl0IHRvIHF1aWNrbHkgY2hhbmdlIHRoZSBiZWhhdmlvdXIgb2ZcbiAgICAgICAgICAgICAgICAgIHt0aGlzLmJyYW5kfS5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHJlZj1cImluaXRTY3JpcHRCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrPXt0aGlzLmRpZENsaWNrSW5pdFNjcmlwdEJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgT3BlbiB5b3VyIEluaXQgU2NyaXB0XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPHA+VW5jb21tZW50IHNvbWUgb2YgdGhlIGV4YW1wbGVzIG9yIHRyeSBvdXQgeW91ciBvd24uPC9wPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndlbGNvbWUtbm90ZVwiPlxuICAgICAgICAgICAgICAgICAgPHN0cm9uZz5OZXh0IHRpbWU6PC9zdHJvbmc+IFlvdSBjYW4gb3BlbiB5b3VyIGluaXQgc2NyaXB0IGZyb21cbiAgICAgICAgICAgICAgICAgIE1lbnUgPiB7dGhpcy5nZXRBcHBsaWNhdGlvbk1lbnVOYW1lKCl9LlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2RldGFpbHM+XG5cbiAgICAgICAgICAgIDxkZXRhaWxzXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndlbGNvbWUtY2FyZFwiXG4gICAgICAgICAgICAgIHsuLi50aGlzLmdldFNlY3Rpb25Qcm9wcygnc25pcHBldHMnKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHN1bW1hcnkgY2xhc3NOYW1lPVwid2VsY29tZS1zdW1tYXJ5IGljb24gaWNvbi1jb2RlXCI+XG4gICAgICAgICAgICAgICAgQWRkIGEgPHNwYW4gY2xhc3M9XCJ3ZWxjb21lLWhpZ2hsaWdodFwiPlNuaXBwZXQ8L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3VtbWFyeT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3ZWxjb21lLWRldGFpbFwiPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3ZWxjb21lLWltZ1wiXG4gICAgICAgICAgICAgICAgICAgIHNyYz1cImF0b206Ly93ZWxjb21lL2Fzc2V0cy9jb2RlLnN2Z1wiXG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgIHt0aGlzLmJyYW5kfSBzbmlwcGV0cyBhbGxvdyB5b3UgdG8gZW50ZXIgYSBzaW1wbGUgcHJlZml4IGluIHRoZSBlZGl0b3JcbiAgICAgICAgICAgICAgICAgIGFuZCBoaXQgdGFiIHRvIGV4cGFuZCB0aGUgcHJlZml4IGludG8gYSBsYXJnZXIgY29kZSBibG9jayB3aXRoXG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZWQgdmFsdWVzLlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgcmVmPVwic25pcHBldHNCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrPXt0aGlzLmRpZENsaWNrU25pcHBldHNCdXR0b259XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIE9wZW4geW91ciBTbmlwcGV0c1xuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgSW4geW91ciBzbmlwcGV0cyBmaWxlLCB0eXBlIDxjb2RlPnNuaXA8L2NvZGU+IHRoZW4gaGl0eycgJ31cbiAgICAgICAgICAgICAgICAgIDxjb2RlPnRhYjwvY29kZT4uIFRoZSA8Y29kZT5zbmlwPC9jb2RlPiBzbmlwcGV0IHdpbGwgZXhwYW5kIHRvXG4gICAgICAgICAgICAgICAgICBjcmVhdGUgYSBzbmlwcGV0IVxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3ZWxjb21lLW5vdGVcIj5cbiAgICAgICAgICAgICAgICAgIDxzdHJvbmc+TmV4dCB0aW1lOjwvc3Ryb25nPiBZb3UgY2FuIG9wZW4geW91ciBzbmlwcGV0cyBpbiBNZW51XG4gICAgICAgICAgICAgICAgICA+IHt0aGlzLmdldEFwcGxpY2F0aW9uTWVudU5hbWUoKX0uXG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGV0YWlscz5cblxuICAgICAgICAgICAgPGRldGFpbHNcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2VsY29tZS1jYXJkXCJcbiAgICAgICAgICAgICAgey4uLnRoaXMuZ2V0U2VjdGlvblByb3BzKCdzaG9ydGN1dHMnKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHN1bW1hcnkgY2xhc3NOYW1lPVwid2VsY29tZS1zdW1tYXJ5IGljb24gaWNvbi1rZXlib2FyZFwiPlxuICAgICAgICAgICAgICAgIExlYXJuIDxzcGFuIGNsYXNzPVwid2VsY29tZS1oaWdobGlnaHRcIj5LZXlib2FyZCBTaG9ydGN1dHM8L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3VtbWFyeT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3ZWxjb21lLWRldGFpbFwiPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3ZWxjb21lLWltZ1wiXG4gICAgICAgICAgICAgICAgICAgIHNyYz1cImF0b206Ly93ZWxjb21lL2Fzc2V0cy9zaG9ydGN1dC5zdmdcIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICBJZiB5b3Ugb25seSByZW1lbWJlciBvbmUga2V5Ym9hcmQgc2hvcnRjdXQgbWFrZSBpdHsnICd9XG4gICAgICAgICAgICAgICAgICA8a2JkIGNsYXNzTmFtZT1cIndlbGNvbWUta2V5XCI+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLmdldENvbW1hbmRQYWxldHRlS2V5QmluZGluZygpfVxuICAgICAgICAgICAgICAgICAgPC9rYmQ+XG4gICAgICAgICAgICAgICAgICAuIFRoaXMga2V5c3Ryb2tlIHRvZ2dsZXMgdGhlIGNvbW1hbmQgcGFsZXR0ZSwgd2hpY2ggbGlzdHNcbiAgICAgICAgICAgICAgICAgIGV2ZXJ5IHt0aGlzLmJyYW5kfSBjb21tYW5kLiBJdCdzIGEgZ29vZCB3YXkgdG8gbGVhcm4gbW9yZSBzaG9ydGN1dHMuXG4gICAgICAgICAgICAgICAgICBZZXMsIHlvdSBjYW4gdHJ5IGl0IG5vdyFcbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICBJZiB5b3Ugd2FudCB0byB1c2UgdGhlc2UgZ3VpZGVzIGFnYWluIHVzZSB0aGUgY29tbWFuZCBwYWxldHRleycgJ31cbiAgICAgICAgICAgICAgICAgIDxrYmQgY2xhc3NOYW1lPVwid2VsY29tZS1rZXlcIj5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuZ2V0Q29tbWFuZFBhbGV0dGVLZXlCaW5kaW5nKCl9XG4gICAgICAgICAgICAgICAgICA8L2tiZD57JyAnfVxuICAgICAgICAgICAgICAgICAgYW5kIHNlYXJjaCBmb3IgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1oaWdobGlnaHRcIj5XZWxjb21lPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2RldGFpbHM+XG4gICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBnZXRTZWN0aW9uUHJvcHMoc2VjdGlvbk5hbWUpIHtcbiAgICBjb25zdCBwcm9wcyA9IHtcbiAgICAgIGRhdGFzZXQ6IHsgc2VjdGlvbjogc2VjdGlvbk5hbWUgfSxcbiAgICAgIG9uY2xpY2s6IHRoaXMuZGlkRXhwYW5kT3JDb2xsYXBzZVNlY3Rpb25cbiAgICB9O1xuICAgIGlmIChcbiAgICAgIHRoaXMucHJvcHMub3BlblNlY3Rpb25zICYmXG4gICAgICB0aGlzLnByb3BzLm9wZW5TZWN0aW9ucy5pbmRleE9mKHNlY3Rpb25OYW1lKSAhPT0gLTFcbiAgICApIHtcbiAgICAgIHByb3BzLm9wZW4gPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gcHJvcHM7XG4gIH1cblxuICBnZXRDb21tYW5kUGFsZXR0ZUtleUJpbmRpbmcoKSB7XG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgICByZXR1cm4gJ2NtZC1zaGlmdC1wJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdjdHJsLXNoaWZ0LXAnO1xuICAgIH1cbiAgfVxuXG4gIGdldEFwcGxpY2F0aW9uTWVudU5hbWUoKSB7XG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgICByZXR1cm4gJ1B1bHNhcic7XG4gICAgfSBlbHNlIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnbGludXgnKSB7XG4gICAgICByZXR1cm4gJ0VkaXQnO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ0ZpbGUnO1xuICAgIH1cbiAgfVxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzZXJpYWxpemVyOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsXG4gICAgICBvcGVuU2VjdGlvbnM6IHRoaXMuZ2V0T3BlblNlY3Rpb25zKCksXG4gICAgICB1cmk6IHRoaXMuZ2V0VVJJKClcbiAgICB9O1xuICB9XG5cbiAgZ2V0VVJJKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnVyaTtcbiAgfVxuXG4gIGdldFRpdGxlKCkge1xuICAgIHJldHVybiAnV2VsY29tZSBHdWlkZSc7XG4gIH1cblxuICBpc0VxdWFsKG90aGVyKSB7XG4gICAgcmV0dXJuIG90aGVyIGluc3RhbmNlb2YgR3VpZGVWaWV3O1xuICB9XG5cbiAgZ2V0T3BlblNlY3Rpb25zKCkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkZXRhaWxzW29wZW5dJykpLm1hcChcbiAgICAgIHNlY3Rpb25FbGVtZW50ID0+IHNlY3Rpb25FbGVtZW50LmRhdGFzZXQuc2VjdGlvblxuICAgICk7XG4gIH1cblxuICBkaWRDbGlja1Byb2plY3RCdXR0b24oKSB7XG4gICAgdGhpcy5wcm9wcy5yZXBvcnRlclByb3h5LnNlbmRFdmVudCgnY2xpY2tlZC1wcm9qZWN0LWN0YScpO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgJ2FwcGxpY2F0aW9uOm9wZW4nXG4gICAgKTtcbiAgfVxuXG4gIGRpZENsaWNrR2l0QnV0dG9uKCkge1xuICAgIHRoaXMucHJvcHMucmVwb3J0ZXJQcm94eS5zZW5kRXZlbnQoJ2NsaWNrZWQtZ2l0LWN0YScpO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgJ2dpdGh1Yjp0b2dnbGUtZ2l0LXRhYidcbiAgICApO1xuICB9XG5cbiAgZGlkQ2xpY2tHaXRIdWJCdXR0b24oKSB7XG4gICAgdGhpcy5wcm9wcy5yZXBvcnRlclByb3h5LnNlbmRFdmVudCgnY2xpY2tlZC1naXRodWItY3RhJyk7XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgICAnZ2l0aHViOnRvZ2dsZS1naXRodWItdGFiJ1xuICAgICk7XG4gIH1cblxuICBkaWRDbGlja1BhY2thZ2VzQnV0dG9uKCkge1xuICAgIHRoaXMucHJvcHMucmVwb3J0ZXJQcm94eS5zZW5kRXZlbnQoJ2NsaWNrZWQtcGFja2FnZXMtY3RhJyk7XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbignYXRvbTovL2NvbmZpZy9pbnN0YWxsJywgeyBzcGxpdDogJ2xlZnQnIH0pO1xuICB9XG5cbiAgZGlkQ2xpY2tUaGVtZXNCdXR0b24oKSB7XG4gICAgdGhpcy5wcm9wcy5yZXBvcnRlclByb3h5LnNlbmRFdmVudCgnY2xpY2tlZC10aGVtZXMtY3RhJyk7XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbignYXRvbTovL2NvbmZpZy90aGVtZXMnLCB7IHNwbGl0OiAnbGVmdCcgfSk7XG4gIH1cblxuICBkaWRDbGlja1N0eWxpbmdCdXR0b24oKSB7XG4gICAgdGhpcy5wcm9wcy5yZXBvcnRlclByb3h5LnNlbmRFdmVudCgnY2xpY2tlZC1zdHlsaW5nLWN0YScpO1xuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ2F0b206Ly8ucHVsc2FyL3N0eWxlc2hlZXQnLCB7IHNwbGl0OiAnbGVmdCcgfSk7XG4gIH1cblxuICBkaWRDbGlja0luaXRTY3JpcHRCdXR0b24oKSB7XG4gICAgdGhpcy5wcm9wcy5yZXBvcnRlclByb3h5LnNlbmRFdmVudCgnY2xpY2tlZC1pbml0LXNjcmlwdC1jdGEnKTtcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdhdG9tOi8vLnB1bHNhci9pbml0LXNjcmlwdCcsIHsgc3BsaXQ6ICdsZWZ0JyB9KTtcbiAgfVxuXG4gIGRpZENsaWNrU25pcHBldHNCdXR0b24oKSB7XG4gICAgdGhpcy5wcm9wcy5yZXBvcnRlclByb3h5LnNlbmRFdmVudCgnY2xpY2tlZC1zbmlwcGV0cy1jdGEnKTtcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdhdG9tOi8vLnB1bHNhci9zbmlwcGV0cycsIHsgc3BsaXQ6ICdsZWZ0JyB9KTtcbiAgfVxuXG4gIGRpZENsaWNrVGVsZXR5cGVCdXR0b24oKSB7XG4gICAgdGhpcy5wcm9wcy5yZXBvcnRlclByb3h5LnNlbmRFdmVudCgnY2xpY2tlZC10ZWxldHlwZS1jdGEnKTtcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdhdG9tOi8vY29uZmlnL3BhY2thZ2VzL3RlbGV0eXBlJywgeyBzcGxpdDogJ2xlZnQnIH0pO1xuICB9XG5cbiAgZGlkRXhwYW5kT3JDb2xsYXBzZVNlY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zdCBzZWN0aW9uTmFtZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuY2xvc2VzdCgnZGV0YWlscycpLmRhdGFzZXQuc2VjdGlvbjtcbiAgICBjb25zdCBhY3Rpb24gPSBldmVudC5jdXJyZW50VGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnb3BlbicpXG4gICAgICA/ICdjb2xsYXBzZSdcbiAgICAgIDogJ2V4cGFuZCc7XG4gICAgdGhpcy5wcm9wcy5yZXBvcnRlclByb3h5LnNlbmRFdmVudChgJHthY3Rpb259LSR7c2VjdGlvbk5hbWV9LXNlY3Rpb25gKTtcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFHQTtBQUF3QjtBQUFBO0FBRVQsTUFBTUEsU0FBUyxDQUFDO0VBQzdCQyxXQUFXLENBQUNDLEtBQUssRUFBRTtJQUNqQixJQUFJLENBQUNBLEtBQUssR0FBR0EsS0FBSztJQUNsQixJQUFJLENBQUNDLEtBQUssR0FBR0MsSUFBSSxDQUFDQyxRQUFRLENBQUNDLElBQUk7SUFDL0IsSUFBSSxDQUFDQyxxQkFBcUIsR0FBRyxJQUFJLENBQUNBLHFCQUFxQixDQUFDQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ2xFLElBQUksQ0FBQ0MsaUJBQWlCLEdBQUcsSUFBSSxDQUFDQSxpQkFBaUIsQ0FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQztJQUMxRCxJQUFJLENBQUNFLG9CQUFvQixHQUFHLElBQUksQ0FBQ0Esb0JBQW9CLENBQUNGLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDaEUsSUFBSSxDQUFDRyxzQkFBc0IsR0FBRyxJQUFJLENBQUNBLHNCQUFzQixDQUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3BFLElBQUksQ0FBQ0ksc0JBQXNCLEdBQUcsSUFBSSxDQUFDQSxzQkFBc0IsQ0FBQ0osSUFBSSxDQUFDLElBQUksQ0FBQztJQUNwRSxJQUFJLENBQUNLLG9CQUFvQixHQUFHLElBQUksQ0FBQ0Esb0JBQW9CLENBQUNMLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDaEUsSUFBSSxDQUFD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