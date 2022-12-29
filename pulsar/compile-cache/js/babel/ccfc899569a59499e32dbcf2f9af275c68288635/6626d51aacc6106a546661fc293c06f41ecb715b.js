'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Selector = void 0;
var _atomSelectList = _interopRequireDefault(require("atom-select-list"));
var _atom = require("atom");
var _main = require("./main");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class Selector {
  // Make a selector object (should be called once)
  constructor(selectorItems) {
    this.lineEndingListView = void 0;
    this.modalPanel = void 0;
    this.previousActivePane = void 0;
    // Defining a SelectListView with methods - https://github.com/atom/atom-select-list
    this.lineEndingListView = new _atomSelectList.default({
      // an array containing the objects you want to show in the select list
      items: selectorItems,
      // called whenever an item needs to be displayed.
      elementForItem: lineEnding => {
        const element = document.createElement('li');
        element.textContent = lineEnding.name;
        return element;
      },
      // called to retrieve a string property on each item and that will be used to filter them.
      filterKeyForItem: lineEnding => {
        return lineEnding.name;
      },
      // called when the user clicks or presses Enter on an item. // use `=>` for `this`
      didConfirmSelection: lineEnding => {
        const editor = atom.workspace.getActiveTextEditor();
        if (editor instanceof _atom.TextEditor) {
          (0, _main.setLineEnding)(editor, lineEnding.value);
        }
        this.hide();
      },
      // called when the user presses Esc or the list loses focus. // use `=>` for `this`
      didCancelSelection: () => {
        this.hide();
      }
    });

    // Adding SelectListView to panel
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.lineEndingListView
    });
  }

  // Show a selector object
  show() {
    this.previousActivePane = atom.workspace.getActivePane();

    // Show selector
    this.lineEndingListView.reset();
    this.modalPanel.show();
    this.lineEndingListView.focus();
  }

  // Hide a selector
  hide() {
    // hide modal panel
    this.modalPanel.hide();
    // focus on the previous active pane
    this.previousActivePane.activate();
  }

  // Dispose selector
  dispose() {
    this.lineEndingListView.destroy();
    this.modalPanel.destroy();
    this.modalPanel = null;
  }
}
exports.Selector = Selector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZWxlY3RvciIsImNvbnN0cnVjdG9yIiwic2VsZWN0b3JJdGVtcyIsImxpbmVFbmRpbmdMaXN0VmlldyIsIm1vZGFsUGFuZWwiLCJwcmV2aW91c0FjdGl2ZVBhbmUiLCJTZWxlY3RMaXN0VmlldyIsIml0ZW1zIiwiZWxlbWVudEZvckl0ZW0iLCJsaW5lRW5kaW5nIiwiZWxlbWVudCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInRleHRDb250ZW50IiwibmFtZSIsImZpbHRlcktleUZvckl0ZW0iLCJkaWRDb25maXJtU2VsZWN0aW9uIiwiZWRpdG9yIiwiYXRvbSIsIndvcmtzcGFjZSIsImdldEFjdGl2ZVRleHRFZGl0b3IiLCJUZXh0RWRpdG9yIiwic2V0TGluZUVuZGluZyIsInZhbHVlIiwiaGlkZSIsImRpZENhbmNlbFNlbGVjdGlvbiIsImFkZE1vZGFsUGFuZWwiLCJpdGVtIiwic2hvdyIsImdldEFjdGl2ZVBhbmUiLCJyZXNldCIsImZvY3VzIiwiYWN0aXZhdGUiLCJkaXNwb3NlIiwiZGVzdHJveSJdLCJzb3VyY2VzIjpbInNlbGVjdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgU2VsZWN0TGlzdFZpZXcgZnJvbSAnYXRvbS1zZWxlY3QtbGlzdCc7XG5cbmltcG9ydCB7IFRleHRFZGl0b3IgfSBmcm9tICdhdG9tJztcbmltcG9ydCB7IHNldExpbmVFbmRpbmcgfSBmcm9tICcuL21haW4nO1xuXG5leHBvcnQgY2xhc3MgU2VsZWN0b3Ige1xuICBsaW5lRW5kaW5nTGlzdFZpZXc7XG4gIG1vZGFsUGFuZWw7XG4gIHByZXZpb3VzQWN0aXZlUGFuZTtcblxuICAvLyBNYWtlIGEgc2VsZWN0b3Igb2JqZWN0IChzaG91bGQgYmUgY2FsbGVkIG9uY2UpXG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9ySXRlbXMpIHtcbiAgICAvLyBEZWZpbmluZyBhIFNlbGVjdExpc3RWaWV3IHdpdGggbWV0aG9kcyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20tc2VsZWN0LWxpc3RcbiAgICB0aGlzLmxpbmVFbmRpbmdMaXN0VmlldyA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICAvLyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBvYmplY3RzIHlvdSB3YW50IHRvIHNob3cgaW4gdGhlIHNlbGVjdCBsaXN0XG4gICAgICBpdGVtczogc2VsZWN0b3JJdGVtcyxcblxuICAgICAgLy8gY2FsbGVkIHdoZW5ldmVyIGFuIGl0ZW0gbmVlZHMgdG8gYmUgZGlzcGxheWVkLlxuICAgICAgZWxlbWVudEZvckl0ZW06IGxpbmVFbmRpbmcgPT4ge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IGxpbmVFbmRpbmcubmFtZTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICB9LFxuXG4gICAgICAvLyBjYWxsZWQgdG8gcmV0cmlldmUgYSBzdHJpbmcgcHJvcGVydHkgb24gZWFjaCBpdGVtIGFuZCB0aGF0IHdpbGwgYmUgdXNlZCB0byBmaWx0ZXIgdGhlbS5cbiAgICAgIGZpbHRlcktleUZvckl0ZW06IGxpbmVFbmRpbmcgPT4ge1xuICAgICAgICByZXR1cm4gbGluZUVuZGluZy5uYW1lO1xuICAgICAgfSxcblxuICAgICAgLy8gY2FsbGVkIHdoZW4gdGhlIHVzZXIgY2xpY2tzIG9yIHByZXNzZXMgRW50ZXIgb24gYW4gaXRlbS4gLy8gdXNlIGA9PmAgZm9yIGB0aGlzYFxuICAgICAgZGlkQ29uZmlybVNlbGVjdGlvbjogbGluZUVuZGluZyA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgaWYgKGVkaXRvciBpbnN0YW5jZW9mIFRleHRFZGl0b3IpIHtcbiAgICAgICAgICBzZXRMaW5lRW5kaW5nKGVkaXRvciwgbGluZUVuZGluZy52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICB9LFxuXG4gICAgICAvLyBjYWxsZWQgd2hlbiB0aGUgdXNlciBwcmVzc2VzIEVzYyBvciB0aGUgbGlzdCBsb3NlcyBmb2N1cy4gLy8gdXNlIGA9PmAgZm9yIGB0aGlzYFxuICAgICAgZGlkQ2FuY2VsU2VsZWN0aW9uOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQWRkaW5nIFNlbGVjdExpc3RWaWV3IHRvIHBhbmVsXG4gICAgdGhpcy5tb2RhbFBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7XG4gICAgICBpdGVtOiB0aGlzLmxpbmVFbmRpbmdMaXN0Vmlld1xuICAgIH0pO1xuICB9XG5cbiAgLy8gU2hvdyBhIHNlbGVjdG9yIG9iamVjdFxuICBzaG93KCkge1xuICAgIHRoaXMucHJldmlvdXNBY3RpdmVQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpO1xuXG4gICAgLy8gU2hvdyBzZWxlY3RvclxuICAgIHRoaXMubGluZUVuZGluZ0xpc3RWaWV3LnJlc2V0KCk7XG4gICAgdGhpcy5tb2RhbFBhbmVsLnNob3coKTtcbiAgICB0aGlzLmxpbmVFbmRpbmdMaXN0Vmlldy5mb2N1cygpO1xuICB9XG5cbiAgLy8gSGlkZSBhIHNlbGVjdG9yXG4gIGhpZGUoKSB7XG4gICAgLy8gaGlkZSBtb2RhbCBwYW5lbFxuICAgIHRoaXMubW9kYWxQYW5lbC5oaWRlKCk7XG4gICAgLy8gZm9jdXMgb24gdGhlIHByZXZpb3VzIGFjdGl2ZSBwYW5lXG4gICAgdGhpcy5wcmV2aW91c0FjdGl2ZVBhbmUuYWN0aXZhdGUoKTtcbiAgfVxuXG4gIC8vIERpc3Bvc2Ugc2VsZWN0b3JcbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmxpbmVFbmRpbmdMaXN0Vmlldy5kZXN0cm95KCk7XG4gICAgdGhpcy5tb2RhbFBhbmVsLmRlc3Ryb3koKTtcbiAgICB0aGlzLm1vZGFsUGFuZWwgPSBudWxsO1xuICB9XG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLFdBQVc7O0FBQUM7RUFBQTtBQUFBO0FBQUE7QUFFWjtBQUVBO0FBQ0E7QUFBdUM7QUFFaEMsTUFBTUEsUUFBUSxDQUFDO0VBS3BCO0VBQ0FDLFdBQVcsQ0FBQ0MsYUFBYSxFQUFFO0lBQUEsS0FMM0JDLGtCQUFrQjtJQUFBLEtBQ2xCQyxVQUFVO0lBQUEsS0FDVkMsa0JBQWtCO0lBSWhCO0lBQ0EsSUFBSSxDQUFDRixrQkFBa0IsR0FBRyxJQUFJRyx1QkFBYyxDQUFDO01BQzNDO01BQ0FDLEtBQUssRUFBRUwsYUFBYTtNQUVwQjtNQUNBTSxjQUFjLEVBQUVDLFVBQVUsSUFBSTtRQUM1QixNQUFNQyxPQUFPLEdBQUdDLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLElBQUksQ0FBQztRQUM1Q0YsT0FBTyxDQUFDRyxXQUFXLEdBQUdKLFVBQVUsQ0FBQ0ssSUFBSTtRQUNyQyxPQUFPSixPQUFPO01BQ2hCLENBQUM7TUFFRDtNQUNBSyxnQkFBZ0IsRUFBRU4sVUFBVSxJQUFJO1FBQzlCLE9BQU9BLFVBQVUsQ0FBQ0ssSUFBSTtNQUN4QixDQUFDO01BRUQ7TUFDQUUsbUJBQW1CLEVBQUVQLFVBQVUsSUFBSTtRQUNqQyxNQUFNUSxNQUFNLEdBQUdDLElBQUksQ0FBQ0MsU0FBUyxDQUFDQyxtQkFBbUIsRUFBRTtRQUNuRCxJQUFJSCxNQUFNLFlBQVlJLGdCQUFVLEVBQUU7VUFDaEMsSUFBQUMsbUJBQWEsRUFBQ0wsTUFBTSxFQUFFUixVQUFVLENBQUNjLEtBQUssQ0FBQztRQUN6QztRQUNBLElBQUksQ0FBQ0MsSUFBSSxFQUFFO01BQ2IsQ0FBQztNQUVEO01BQ0FDLGtCQUFrQixFQUFFLE1BQU07UUFDeEIsSUFBSSxDQUFDRCxJQUFJLEVBQUU7TUFDYjtJQUNGLENBQUMsQ0FBQzs7SUFFRjtJQUNBLElBQUksQ0FBQ3BCLFVBQVUsR0FBR2MsSUFBSSxDQUFDQyxTQUFTLENBQUNPLGFBQWEsQ0FBQztNQUM3Q0MsSUFBSSxFQUFFLElBQUksQ0FBQ3hCO0lBQ2IsQ0FBQyxDQUFDO0VBQ0o7O0VBRUE7RUFDQXlCLElBQUksR0FBRztJQUNMLElBQUksQ0FBQ3ZCLGtCQUFrQixHQUFHYSxJQUFJLENBQUNDLFNBQVMsQ0FBQ1UsYUFBYSxFQUFFOztJQUV4RDtJQUNBLElBQUksQ0FBQzFCLGtCQUFrQixDQUFDMkIsS0FBSyxFQUFFO0lBQy9CLElBQUksQ0FBQzFCLFVBQVUsQ0FBQ3dCLElBQUksRUFBRTtJQUN0QixJQUFJLENBQUN6QixrQkFBa0IsQ0FBQzRCLEtBQUssRUFBRTtFQUNqQzs7RUFFQTtFQUNBUCxJQUFJLEdBQUc7SUFDTDtJQUNBLElBQUksQ0FBQ3BCLFVBQVUsQ0FBQ29CLElBQUksRUFBRTtJQUN0QjtJQUNBLElBQUksQ0FBQ25CLGtCQUFrQixDQUFDMkIsUUFBUSxFQUFFO0VBQ3BDOztFQUVBO0VBQ0FDLE9BQU8sR0FBRztJQUNSLElBQUksQ0FBQzlCLGtCQUFrQixDQUFDK0IsT0FBTyxFQUFFO0lBQ2pDLElBQUksQ0FBQzlCLFVBQVUsQ0FBQzhCLE9BQU8sRUFBRTtJQUN6QixJQUFJLENBQUM5QixVQUFVLEdBQUcsSUFBSTtFQUN4QjtBQUNGO0FBQUMifQ==