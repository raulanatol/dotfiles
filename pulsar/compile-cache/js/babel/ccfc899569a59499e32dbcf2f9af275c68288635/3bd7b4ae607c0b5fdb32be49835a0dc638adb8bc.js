'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _atomSelectList = _interopRequireDefault(require("atom-select-list"));
var _helpers = _interopRequireDefault(require("./helpers"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class DiffListView {
  constructor() {
    this.selectListView = new _atomSelectList.default({
      emptyMessage: 'No diffs in file',
      items: [],
      filterKeyForItem: diff => diff.lineText,
      elementForItem: diff => {
        const li = document.createElement('li');
        li.classList.add('two-lines');
        const primaryLine = document.createElement('div');
        primaryLine.classList.add('primary-line');
        primaryLine.textContent = diff.lineText;
        li.appendChild(primaryLine);
        const secondaryLine = document.createElement('div');
        secondaryLine.classList.add('secondary-line');
        secondaryLine.textContent = `-${diff.oldStart},${diff.oldLines} +${diff.newStart},${diff.newLines}`;
        li.appendChild(secondaryLine);
        return li;
      },
      didConfirmSelection: diff => {
        this.cancel();
        const bufferRow = diff.newStart > 0 ? diff.newStart - 1 : diff.newStart;
        this.editor.setCursorBufferPosition([bufferRow, 0], {
          autoscroll: true
        });
        this.editor.moveToFirstCharacterOfLine();
      },
      didCancelSelection: () => {
        this.cancel();
      }
    });
    this.selectListView.element.classList.add('diff-list-view');
    this.panel = atom.workspace.addModalPanel({
      item: this.selectListView,
      visible: false
    });
  }
  attach() {
    this.previouslyFocusedElement = document.activeElement;
    this.selectListView.reset();
    this.panel.show();
    this.selectListView.focus();
  }
  cancel() {
    this.panel.hide();
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
  }
  destroy() {
    this.cancel();
    this.panel.destroy();
    return this.selectListView.destroy();
  }
  async toggle() {
    const editor = atom.workspace.getActiveTextEditor();
    if (this.panel.isVisible()) {
      this.cancel();
    } else if (editor) {
      this.editor = editor;
      const repository = await (0, _helpers.default)(this.editor.getPath());
      let diffs = repository ? repository.getLineDiffs(this.editor.getPath(), this.editor.getText()) : [];
      if (!diffs) diffs = [];
      for (let diff of diffs) {
        const bufferRow = diff.newStart > 0 ? diff.newStart - 1 : diff.newStart;
        const lineText = this.editor.lineTextForBufferRow(bufferRow);
        diff.lineText = lineText ? lineText.trim() : '';
      }
      await this.selectListView.update({
        items: diffs
      });
      this.attach();
    }
  }
}
exports.default = DiffListView;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaWZmTGlzdFZpZXciLCJjb25zdHJ1Y3RvciIsInNlbGVjdExpc3RWaWV3IiwiU2VsZWN0TGlzdFZpZXciLCJlbXB0eU1lc3NhZ2UiLCJpdGVtcyIsImZpbHRlcktleUZvckl0ZW0iLCJkaWZmIiwibGluZVRleHQiLCJlbGVtZW50Rm9ySXRlbSIsImxpIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwicHJpbWFyeUxpbmUiLCJ0ZXh0Q29udGVudCIsImFwcGVuZENoaWxkIiwic2Vjb25kYXJ5TGluZSIsIm9sZFN0YXJ0Iiwib2xkTGluZXMiLCJuZXdTdGFydCIsIm5ld0xpbmVzIiwiZGlkQ29uZmlybVNlbGVjdGlvbiIsImNhbmNlbCIsImJ1ZmZlclJvdyIsImVkaXRvciIsInNldEN1cnNvckJ1ZmZlclBvc2l0aW9uIiwiYXV0b3Njcm9sbCIsIm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIiwiZGlkQ2FuY2VsU2VsZWN0aW9uIiwiZWxlbWVudCIsInBhbmVsIiwiYXRvbSIsIndvcmtzcGFjZSIsImFkZE1vZGFsUGFuZWwiLCJpdGVtIiwidmlzaWJsZSIsImF0dGFjaCIsInByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCIsImFjdGl2ZUVsZW1lbnQiLCJyZXNldCIsInNob3ciLCJmb2N1cyIsImhpZGUiLCJkZXN0cm95IiwidG9nZ2xlIiwiZ2V0QWN0aXZlVGV4dEVkaXRvciIsImlzVmlzaWJsZSIsInJlcG9zaXRvcnkiLCJyZXBvc2l0b3J5Rm9yUGF0aCIsImdldFBhdGgiLCJkaWZmcyIsImdldExpbmVEaWZmcyIsImdldFRleHQiLCJsaW5lVGV4dEZvckJ1ZmZlclJvdyIsInRyaW0iLCJ1cGRhdGUiXSwic291cmNlcyI6WyJkaWZmLWxpc3Qtdmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IFNlbGVjdExpc3RWaWV3IGZyb20gJ2F0b20tc2VsZWN0LWxpc3QnO1xuaW1wb3J0IHJlcG9zaXRvcnlGb3JQYXRoIGZyb20gJy4vaGVscGVycyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZMaXN0VmlldyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcgPSBuZXcgU2VsZWN0TGlzdFZpZXcoe1xuICAgICAgZW1wdHlNZXNzYWdlOiAnTm8gZGlmZnMgaW4gZmlsZScsXG4gICAgICBpdGVtczogW10sXG4gICAgICBmaWx0ZXJLZXlGb3JJdGVtOiBkaWZmID0+IGRpZmYubGluZVRleHQsXG4gICAgICBlbGVtZW50Rm9ySXRlbTogZGlmZiA9PiB7XG4gICAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgbGkuY2xhc3NMaXN0LmFkZCgndHdvLWxpbmVzJyk7XG5cbiAgICAgICAgY29uc3QgcHJpbWFyeUxpbmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcHJpbWFyeUxpbmUuY2xhc3NMaXN0LmFkZCgncHJpbWFyeS1saW5lJyk7XG4gICAgICAgIHByaW1hcnlMaW5lLnRleHRDb250ZW50ID0gZGlmZi5saW5lVGV4dDtcbiAgICAgICAgbGkuYXBwZW5kQ2hpbGQocHJpbWFyeUxpbmUpO1xuXG4gICAgICAgIGNvbnN0IHNlY29uZGFyeUxpbmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgc2Vjb25kYXJ5TGluZS5jbGFzc0xpc3QuYWRkKCdzZWNvbmRhcnktbGluZScpO1xuICAgICAgICBzZWNvbmRhcnlMaW5lLnRleHRDb250ZW50ID0gYC0ke2RpZmYub2xkU3RhcnR9LCR7ZGlmZi5vbGRMaW5lc30gKyR7XG4gICAgICAgICAgZGlmZi5uZXdTdGFydFxuICAgICAgICB9LCR7ZGlmZi5uZXdMaW5lc31gO1xuICAgICAgICBsaS5hcHBlbmRDaGlsZChzZWNvbmRhcnlMaW5lKTtcblxuICAgICAgICByZXR1cm4gbGk7XG4gICAgICB9LFxuICAgICAgZGlkQ29uZmlybVNlbGVjdGlvbjogZGlmZiA9PiB7XG4gICAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgICAgIGNvbnN0IGJ1ZmZlclJvdyA9IGRpZmYubmV3U3RhcnQgPiAwID8gZGlmZi5uZXdTdGFydCAtIDEgOiBkaWZmLm5ld1N0YXJ0O1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbYnVmZmVyUm93LCAwXSwge1xuICAgICAgICAgIGF1dG9zY3JvbGw6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKCk7XG4gICAgICB9LFxuICAgICAgZGlkQ2FuY2VsU2VsZWN0aW9uOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5zZWxlY3RMaXN0Vmlldy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2RpZmYtbGlzdC12aWV3Jyk7XG4gICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoe1xuICAgICAgaXRlbTogdGhpcy5zZWxlY3RMaXN0VmlldyxcbiAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfSk7XG4gIH1cblxuICBhdHRhY2goKSB7XG4gICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcucmVzZXQoKTtcbiAgICB0aGlzLnBhbmVsLnNob3coKTtcbiAgICB0aGlzLnNlbGVjdExpc3RWaWV3LmZvY3VzKCk7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgdGhpcy5wYW5lbC5oaWRlKCk7XG4gICAgaWYgKHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50KSB7XG4gICAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudC5mb2N1cygpO1xuICAgICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jYW5jZWwoKTtcbiAgICB0aGlzLnBhbmVsLmRlc3Ryb3koKTtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RMaXN0Vmlldy5kZXN0cm95KCk7XG4gIH1cblxuICBhc3luYyB0b2dnbGUoKSB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmICh0aGlzLnBhbmVsLmlzVmlzaWJsZSgpKSB7XG4gICAgICB0aGlzLmNhbmNlbCgpO1xuICAgIH0gZWxzZSBpZiAoZWRpdG9yKSB7XG4gICAgICB0aGlzLmVkaXRvciA9IGVkaXRvcjtcbiAgICAgIGNvbnN0IHJlcG9zaXRvcnkgPSBhd2FpdCByZXBvc2l0b3J5Rm9yUGF0aCh0aGlzLmVkaXRvci5nZXRQYXRoKCkpO1xuICAgICAgbGV0IGRpZmZzID0gcmVwb3NpdG9yeVxuICAgICAgICA/IHJlcG9zaXRvcnkuZ2V0TGluZURpZmZzKHRoaXMuZWRpdG9yLmdldFBhdGgoKSwgdGhpcy5lZGl0b3IuZ2V0VGV4dCgpKVxuICAgICAgICA6IFtdO1xuICAgICAgaWYgKCFkaWZmcykgZGlmZnMgPSBbXTtcbiAgICAgIGZvciAobGV0IGRpZmYgb2YgZGlmZnMpIHtcbiAgICAgICAgY29uc3QgYnVmZmVyUm93ID0gZGlmZi5uZXdTdGFydCA+IDAgPyBkaWZmLm5ld1N0YXJ0IC0gMSA6IGRpZmYubmV3U3RhcnQ7XG4gICAgICAgIGNvbnN0IGxpbmVUZXh0ID0gdGhpcy5lZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coYnVmZmVyUm93KTtcbiAgICAgICAgZGlmZi5saW5lVGV4dCA9IGxpbmVUZXh0ID8gbGluZVRleHQudHJpbSgpIDogJyc7XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHRoaXMuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHsgaXRlbXM6IGRpZmZzIH0pO1xuICAgICAgdGhpcy5hdHRhY2goKTtcbiAg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