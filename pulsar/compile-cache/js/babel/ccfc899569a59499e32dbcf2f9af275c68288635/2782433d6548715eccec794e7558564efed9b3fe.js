"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _atom = require("atom");
var _etch = _interopRequireDefault(require("etch"));
var _settingsPanel = _interopRequireDefault(require("./settings-panel"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */
/** @jsx etch.dom */

class EditorPanel {
  constructor() {
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
    }));
  }
  destroy() {
    this.subscriptions.dispose();
    return _etch.default.destroy(this);
  }
  update() {}
  render() {
    return _etch.default.dom("div", {
      tabIndex: "0",
      className: "panels-item",
      onclick: this.didClick
    }, _etch.default.dom(_settingsPanel.default, {
      namespace: "editor",
      icon: "code",
      note: `<div class="text icon icon-question" id="editor-settings-note" tabindex="-1">These settings are related to text editing. Some of these can be overriden on a per-language basis. Check language settings by clicking its package card in the <a class="link packages-open">Packages list</a>.</div>`
    }));
  }
  focus() {
    this.element.focus();
  }
  show() {
    this.element.style.display = '';
  }
  didClick(event) {
    const target = event.target.closest('.packages-open');
    if (target) {
      atom.workspace.open('atom://config/packages');
    }
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
exports.default = EditorPanel;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFZGl0b3JQYW5lbCIsImNvbnN0cnVjdG9yIiwiZXRjaCIsImluaXRpYWxpemUiLCJzdWJzY3JpcHRpb25zIiwiQ29tcG9zaXRlRGlzcG9zYWJsZSIsImFkZCIsImF0b20iLCJjb21tYW5kcyIsImVsZW1lbnQiLCJzY3JvbGxVcCIsInNjcm9sbERvd24iLCJwYWdlVXAiLCJwYWdlRG93biIsInNjcm9sbFRvVG9wIiwic2Nyb2xsVG9Cb3R0b20iLCJkZXN0cm95IiwiZGlzcG9zZSIsInVwZGF0ZSIsInJlbmRlciIsImRpZENsaWNrIiwiZm9jdXMiLCJzaG93Iiwic3R5bGUiLCJkaXNwbGF5IiwiZXZlbnQiLCJ0YXJnZXQiLCJjbG9zZXN0Iiwid29ya3NwYWNlIiwib3BlbiIsInNjcm9sbFRvcCIsImRvY3VtZW50IiwiYm9keSIsIm9mZnNldEhlaWdodCIsInNjcm9sbEhlaWdodCJdLCJzb3VyY2VzIjpbImVkaXRvci1wYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG4vKiogQGpzeCBldGNoLmRvbSAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5pbXBvcnQgZXRjaCBmcm9tICdldGNoJ1xuaW1wb3J0IFNldHRpbmdzUGFuZWwgZnJvbSAnLi9zZXR0aW5ncy1wYW5lbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWRpdG9yUGFuZWwge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgZXRjaC5pbml0aWFsaXplKHRoaXMpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4geyB0aGlzLnNjcm9sbFVwKCkgfSxcbiAgICAgICdjb3JlOm1vdmUtZG93bic6ICgpID0+IHsgdGhpcy5zY3JvbGxEb3duKCkgfSxcbiAgICAgICdjb3JlOnBhZ2UtdXAnOiAoKSA9PiB7IHRoaXMucGFnZVVwKCkgfSxcbiAgICAgICdjb3JlOnBhZ2UtZG93bic6ICgpID0+IHsgdGhpcy5wYWdlRG93bigpIH0sXG4gICAgICAnY29yZTptb3ZlLXRvLXRvcCc6ICgpID0+IHsgdGhpcy5zY3JvbGxUb1RvcCgpIH0sXG4gICAgICAnY29yZTptb3ZlLXRvLWJvdHRvbSc6ICgpID0+IHsgdGhpcy5zY3JvbGxUb0JvdHRvbSgpIH1cbiAgICB9KSlcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICByZXR1cm4gZXRjaC5kZXN0cm95KHRoaXMpXG4gIH1cblxuICB1cGRhdGUgKCkge31cblxuICByZW5kZXIgKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHRhYkluZGV4PScwJyBjbGFzc05hbWU9J3BhbmVscy1pdGVtJyBvbmNsaWNrPXt0aGlzLmRpZENsaWNrfT5cbiAgICAgICAgPFNldHRpbmdzUGFuZWxcbiAgICAgICAgICBuYW1lc3BhY2U9J2VkaXRvcidcbiAgICAgICAgICBpY29uPSdjb2RlJ1xuICAgICAgICAgIG5vdGU9e2A8ZGl2IGNsYXNzPVwidGV4dCBpY29uIGljb24tcXVlc3Rpb25cIiBpZD1cImVkaXRvci1zZXR0aW5ncy1ub3RlXCIgdGFiaW5kZXg9XCItMVwiPlRoZXNlIHNldHRpbmdzIGFyZSByZWxhdGVkIHRvIHRleHQgZWRpdGluZy4gU29tZSBvZiB0aGVzZSBjYW4gYmUgb3ZlcnJpZGVuIG9uIGEgcGVyLWxhbmd1YWdlIGJhc2lzLiBDaGVjayBsYW5ndWFnZSBzZXR0aW5ncyBieSBjbGlja2luZyBpdHMgcGFja2FnZSBjYXJkIGluIHRoZSA8YSBjbGFzcz1cImxpbmsgcGFja2FnZXMtb3BlblwiPlBhY2thZ2VzIGxpc3Q8L2E+LjwvZGl2PmB9IC8+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuICBmb2N1cyAoKSB7XG4gICAgdGhpcy5lbGVtZW50LmZvY3VzKClcbiAgfVxuXG4gIHNob3cgKCkge1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJydcbiAgfVxuXG4gIGRpZENsaWNrIChldmVudCkge1xuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCcucGFja2FnZXMtb3BlbicpXG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignYXRvbTovL2NvbmZpZy9wYWNrYWdlcycpXG4gICAgfVxuICB9XG5cbiAgc2Nyb2xsVXAgKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgLT0gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQgLyAyMFxuICB9XG5cbiAgc2Nyb2xsRG93biAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCArPSBkb2N1bWVudC5ib2R5Lm9mZnNldEhlaWdodCAvIDIwXG4gIH1cblxuICBwYWdlVXAgKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgLT0gdGhpcy5lbGVtZW50Lm9mZnNldEhlaWdodFxuICB9XG5cbiAgcGFnZURvd24gKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgKz0gdGhpcy5lbGVtZW50Lm9mZnNldEhlaWdodFxuICB9XG5cbiAgc2Nyb2xsVG9Ub3AgKCkge1xuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgPSAwXG4gIH1cblxuICBzY3JvbGxUb0JvdHRvbSAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCA9IHRoaXMuZWxlbWVudC5zY3JvbGxIZWlnaHRcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFHQTtBQUNBO0FBQ0E7QUFBNEM7QUFMNUM7QUFDQTs7QUFNZSxNQUFNQSxXQUFXLENBQUM7RUFDL0JDLFdBQVcsR0FBSTtJQUNiQyxhQUFJLENBQUNDLFVBQVUsQ0FBQyxJQUFJLENBQUM7SUFDckIsSUFBSSxDQUFDQyxhQUFhLEdBQUcsSUFBSUMseUJB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