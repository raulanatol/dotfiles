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

class GeneralPanel {
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
      ref: "panel",
      namespace: "core",
      icon: "settings",
      note: `<div class="text icon icon-question" id="core-settings-note" tabindex="-1">These are Atom's core settings which affect behavior unrelated to text editing. Individual packages may have their own additional settings found within their package card in the <a class="link packages-open">Packages list</a>.</div>`
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
exports.default = GeneralPanel;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHZW5lcmFsUGFuZWwiLCJjb25zdHJ1Y3RvciIsImV0Y2giLCJpbml0aWFsaXplIiwic3Vic2NyaXB0aW9ucyIsIkNvbXBvc2l0ZURpc3Bvc2FibGUiLCJhZGQiLCJhdG9tIiwiY29tbWFuZHMiLCJlbGVtZW50Iiwic2Nyb2xsVXAiLCJzY3JvbGxEb3duIiwicGFnZVVwIiwicGFnZURvd24iLCJzY3JvbGxUb1RvcCIsInNjcm9sbFRvQm90dG9tIiwiZGVzdHJveSIsImRpc3Bvc2UiLCJ1cGRhdGUiLCJyZW5kZXIiLCJkaWRDbGljayIsImZvY3VzIiwic2hvdyIsInN0eWxlIiwiZGlzcGxheSIsImV2ZW50IiwidGFyZ2V0IiwiY2xvc2VzdCIsIndvcmtzcGFjZSIsIm9wZW4iLCJzY3JvbGxUb3AiLCJkb2N1bWVudCIsImJvZHkiLCJvZmZzZXRIZWlnaHQiLCJzY3JvbGxIZWlnaHQiXSwic291cmNlcyI6WyJnZW5lcmFsLXBhbmVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cbi8qKiBAanN4IGV0Y2guZG9tICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCBldGNoIGZyb20gJ2V0Y2gnXG5pbXBvcnQgU2V0dGluZ3NQYW5lbCBmcm9tICcuL3NldHRpbmdzLXBhbmVsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHZW5lcmFsUGFuZWwge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgZXRjaC5pbml0aWFsaXplKHRoaXMpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4geyB0aGlzLnNjcm9sbFVwKCkgfSxcbiAgICAgICdjb3JlOm1vdmUtZG93bic6ICgpID0+IHsgdGhpcy5zY3JvbGxEb3duKCkgfSxcbiAgICAgICdjb3JlOnBhZ2UtdXAnOiAoKSA9PiB7IHRoaXMucGFnZVVwKCkgfSxcbiAgICAgICdjb3JlOnBhZ2UtZG93bic6ICgpID0+IHsgdGhpcy5wYWdlRG93bigpIH0sXG4gICAgICAnY29yZTptb3ZlLXRvLXRvcCc6ICgpID0+IHsgdGhpcy5zY3JvbGxUb1RvcCgpIH0sXG4gICAgICAnY29yZTptb3ZlLXRvLWJvdHRvbSc6ICgpID0+IHsgdGhpcy5zY3JvbGxUb0JvdHRvbSgpIH1cbiAgICB9KSlcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICByZXR1cm4gZXRjaC5kZXN0cm95KHRoaXMpXG4gIH1cblxuICB1cGRhdGUgKCkge31cblxuICByZW5kZXIgKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHRhYkluZGV4PScwJyBjbGFzc05hbWU9J3BhbmVscy1pdGVtJyBvbmNsaWNrPXt0aGlzLmRpZENsaWNrfT5cbiAgICAgICAgPFNldHRpbmdzUGFuZWxcbiAgICAgICAgICByZWY9J3BhbmVsJ1xuICAgICAgICAgIG5hbWVzcGFjZT0nY29yZSdcbiAgICAgICAgICBpY29uPSdzZXR0aW5ncydcbiAgICAgICAgICBub3RlPXtgPGRpdiBjbGFzcz1cInRleHQgaWNvbiBpY29uLXF1ZXN0aW9uXCIgaWQ9XCJjb3JlLXNldHRpbmdzLW5vdGVcIiB0YWJpbmRleD1cIi0xXCI+VGhlc2UgYXJlIEF0b20ncyBjb3JlIHNldHRpbmdzIHdoaWNoIGFmZmVjdCBiZWhhdmlvciB1bnJlbGF0ZWQgdG8gdGV4dCBlZGl0aW5nLiBJbmRpdmlkdWFsIHBhY2thZ2VzIG1heSBoYXZlIHRoZWlyIG93biBhZGRpdGlvbmFsIHNldHRpbmdzIGZvdW5kIHdpdGhpbiB0aGVpciBwYWNrYWdlIGNhcmQgaW4gdGhlIDxhIGNsYXNzPVwibGluayBwYWNrYWdlcy1vcGVuXCI+UGFja2FnZXMgbGlzdDwvYT4uPC9kaXY+YH0gLz5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIGZvY3VzICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuZm9jdXMoKVxuICB9XG5cbiAgc2hvdyAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJ1xuICB9XG5cbiAgZGlkQ2xpY2sgKGV2ZW50KSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5wYWNrYWdlcy1vcGVuJylcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdhdG9tOi8vY29uZmlnL3BhY2thZ2VzJylcbiAgICB9XG4gIH1cblxuICBzY3JvbGxVcCAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCAtPSBkb2N1bWVudC5ib2R5Lm9mZnNldEhlaWdodCAvIDIwXG4gIH1cblxuICBzY3JvbGxEb3duICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wICs9IGRvY3VtZW50LmJvZHkub2Zmc2V0SGVpZ2h0IC8gMjBcbiAgfVxuXG4gIHBhZ2VVcCAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCAtPSB0aGlzLmVsZW1lbnQub2Zmc2V0SGVpZ2h0XG4gIH1cblxuICBwYWdlRG93biAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCArPSB0aGlzLmVsZW1lbnQub2Zmc2V0SGVpZ2h0XG4gIH1cblxuICBzY3JvbGxUb1RvcCAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCA9IDBcbiAgfVxuXG4gIHNjcm9sbFRvQm90dG9tICgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wID0gdGhpcy5lbGVtZW50LnNjcm9sbEhlaWdodFxuICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUdBO0FBQ0E7QUFDQTtBQUE0QztBQUw1QztBQUNBOztBQU1lLE1BQU1BLFlBQVksQ0FBQztFQUNoQ0MsV0FBVyxHQUFJO0lBQ2JDLGFBQUksQ0FBQ0MsVUFBVSxDQUFDLElBQUksQ0FBQztJQUNyQixJQUFJLENBQUNDLGFBQWEsR0FBRyxJQUFJQyx5QkFBbUIsRUFBRTtJQUM5QyxJQUFJLENBQUNELGFBQWEsQ0FBQ0UsR0FBRyxDQUFDQyxJQUFJLENBQUNDLFFBQVEsQ0FBQ0YsR0FBRyxDQUFDLElBQUksQ0FBQ0csT0FBTyxFQUFFO01BQ3JELGNBQWMsRUFBRSxNQUFNO1FBQUUsSUFBSSxDQUFDQyxRQUFRLEVBQUU7TUFBQyxDQUFDO01BQ3pDLGdCQUFnQixFQUFFLE1BQU07UUFBRSxJQUFJLENBQUNDLFVBQVUsRUFBRTtNQUFDLENBQUM7TUFDN0MsY0FBYyxFQUFFLE1BQU07UUFBRSxJQUFJLENBQUNDLE1BQU0sRUFBRTtNQUFDLENBQUM7TUFDdkMsZ0JBQWdCLEVBQUUsTUFBTTtRQUFFLElBQUksQ0FBQ0MsUUFBUSxFQUFFO01BQUMsQ0FBQztNQUMzQyxrQkFBa0IsRUFBRSxNQUFNO1FBQUUsSUFBSSxDQUFDQyxXQUFXLEVBQUU7TUFBQyxDQUFDO01BQ2hELHFCQUFxQixFQUFFLE1BQU07UUFBRSxJQUFJLENBQUNDLGNBQWMsRUFBRTtNQUFDO0lBQ3ZELENBQUMsQ0FBQyxDQUFDO0VBQ0w7RUFFQUMsT0FBTyxHQUFJO0lBQ1QsSUFBSSxDQUFDWixhQUFhLENBQUNhLE9BQU8sRUFBRTtJQUM1QixPQUFPZixhQUFJLENBQUNjLE9BQU8sQ0FBQyxJQUFJLENBQUM7RUFDM0I7RUFFQUUsTUFBTSxHQUFJLENBQUM7RUFFWEMsTUFBTSxHQUFJO0lBQ1IsT0FDRTtNQUFLLFFBQVEsRUFBQyxHQUFHO01BQUMsU0FBUyxFQUFDLGFBQWE7TUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDQztJQUFTLEdBQy9ELGtCQUFDLHNCQUFhO01BQ1osR0FBRyxFQUFDLE9BQU87TUFDWCxTQUFTLEVBQUMsTUFBTTtNQUNoQixJQUFJLEVBQUMsVUFBVTtNQUNmLElBQUksRUFBRztJQUFxVCxFQUFHLENBQzdUO0VBRVY7RUFFQUMsS0FBSyxHQUFJO0lBQ1AsSUFBSSxDQUFDWixPQUFPLENBQUNZLEtBQUssRUFBRTtFQUN0QjtFQUVBQyxJQUFJLEdBQUk7SUFDTixJQUFJLENBQUNiLE9BQU8sQ0FBQ2MsS0FBSyxDQUFDQyxPQUFPLEdBQUcsRUFBRTtFQUNqQztFQUVBSixRQUFRLENBQUVLLEtBQUssRUFBRTtJQUNmLE1BQU1DLE1BQU0sR0FBR0QsS0FBSyxDQUFDQyxNQUFNLENBQUNDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztJQUNyRCxJQUFJRCxNQUFNLEVBQUU7TUFDVm5CLElBQUksQ0FBQ3FCLFNBQVMsQ0FBQ0MsSUFBSSxDQUFDLHdCQUF3QixDQUFDO0lBQy9DO0VBQ0Y7RUFFQW5CLFFBQVEsR0FBSTtJQUNWLElBQUksQ0FBQ0QsT0FBTyxDQUFDcUIsU0FBUyxJQUFJQyxRQUFRLENBQUNDLElBQUksQ0FBQ0MsWUFBWSxHQUFHLEVBQUU7RUFDM0Q7RUFFQXRCLFVBQVUsR0FBSTtJQUNaLElBQUksQ0FBQ0YsT0FBTyxDQUFDcUIsU0FBUyxJQUFJQyxRQUFRLENBQUNDLElBQUksQ0FBQ0MsWUFBWSxHQUFHLEVBQUU7RUFDM0Q7RUFFQXJCLE1BQU0sR0FBSTtJQUNSLElBQUksQ0FBQ0gsT0FBTyxDQUFDcUIsU0FBUyxJQUFJLElBQUksQ0FBQ3JCLE9BQU8sQ0FBQ3dCLFlBQVk7RUFDckQ7RUFFQXBCLFFBQVEsR0FBSTtJQUNWLElBQUksQ0FBQ0osT0FBTyxDQUFDcUIsU0FBUyxJQUFJLElBQUksQ0FBQ3JCLE9BQU8sQ0FBQ3dCLFlBQVk7RUFDckQ7RUFFQW5CLFdBQVcsR0FBSTtJQUNiLElBQUksQ0FBQ0wsT0FBTyxDQUFDcUIsU0FBUyxHQUFHLENBQUM7RUFDNUI7RUFFQWYsY0FBYyxHQUFJO0lBQ2hCLElBQUksQ0FBQ04sT0FBTyxDQUFDcUIsU0FBUyxHQUFHLElBQUksQ0FBQ3JCLE9BQU8sQ0FBQ3lCLFlBQVk7RUFDcEQ7QUFDRjtBQUFDO0FBQUEifQ==