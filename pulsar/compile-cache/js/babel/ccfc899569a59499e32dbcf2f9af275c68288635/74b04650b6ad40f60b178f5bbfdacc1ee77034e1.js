'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _getIconServices = _interopRequireDefault(require("./get-icon-services"));
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class MRUItemView {
  initialize(listView, item) {
    this.listView = listView;
    this.item = item;
    this.element = document.createElement('li');
    this.element.itemViewData = this;
    this.element.classList.add('two-lines');
    this.itemPath = null;
    if (item.getPath && typeof item.getPath === 'function') {
      this.itemPath = item.getPath();
    }
    const repo = MRUItemView.repositoryForPath(this.itemPath);
    if (repo != null) {
      const statusIconDiv = document.createElement('div');
      const status = repo.getCachedPathStatus(this.itemPath);
      if (repo.isStatusNew(status)) {
        statusIconDiv.className = 'status status-added icon icon-diff-added';
        this.element.appendChild(statusIconDiv);
      } else if (repo.isStatusModified(status)) {
        statusIconDiv.className = 'status status-modified icon icon-diff-modified';
        this.element.appendChild(statusIconDiv);
      }
    }
    this.firstLineDiv = this.element.appendChild(document.createElement('div'));
    this.firstLineDiv.classList.add('primary-line', 'file');
    if (typeof item.getIconName === 'function') {
      if (atom.config.get('tabs.showIcons')) this.firstLineDiv.classList.add('icon', 'icon-' + item.getIconName());
    } else {
      (0, _getIconServices.default)().updateMRUIcon(this);
    }
    this.firstLineDiv.setAttribute('data-name', item.getTitle());
    this.firstLineDiv.innerText = item.getTitle();
    if (this.itemPath) {
      this.firstLineDiv.setAttribute('data-path', this.itemPath);
      const secondLineDiv = this.element.appendChild(document.createElement('div'));
      secondLineDiv.classList.add('secondary-line', 'path', 'no-icon');
      secondLineDiv.innerText = this.itemPath;
    }
  }
  select() {
    this.element.classList.add('selected');
  }
  unselect() {
    this.element.classList.remove('selected');
  }
  static repositoryForPath(filePath) {
    if (filePath) {
      const projectPaths = atom.project.getPaths();
      for (let i = 0; i < projectPaths.length; i++) {
        if (filePath === projectPaths[i] || filePath.startsWith(projectPaths[i] + _path.default.sep)) {
          return atom.project.getRepositories()[i];
        }
      }
    }
    return null;
  }
}
exports.default = MRUItemView;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNUlVJdGVtVmlldyIsImluaXRpYWxpemUiLCJsaXN0VmlldyIsIml0ZW0iLCJlbGVtZW50IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaXRlbVZpZXdEYXRhIiwiY2xhc3NMaXN0IiwiYWRkIiwiaXRlbVBhdGgiLCJnZXRQYXRoIiwicmVwbyIsInJlcG9zaXRvcnlGb3JQYXRoIiwic3RhdHVzSWNvbkRpdiIsInN0YXR1cyIsImdldENhY2hlZFBhdGhTdGF0dXMiLCJpc1N0YXR1c05ldyIsImNsYXNzTmFtZSIsImFwcGVuZENoaWxkIiwiaXNTdGF0dXNNb2RpZmllZCIsImZpcnN0TGluZURpdiIsImdldEljb25OYW1lIiwiYXRvbSIsImNvbmZpZyIsImdldCIsImdldEljb25TZXJ2aWNlcyIsInVwZGF0ZU1SVUljb24iLCJzZXRBdHRyaWJ1dGUiLCJnZXRUaXRsZSIsImlubmVyVGV4dCIsInNlY29uZExpbmVEaXYiLCJzZWxlY3QiLCJ1bnNlbGVjdCIsInJlbW92ZSIsImZpbGVQYXRoIiwicHJvamVjdFBhdGhzIiwicHJvamVjdCIsImdldFBhdGhzIiwiaSIsImxlbmd0aCIsInN0YXJ0c1dpdGgiLCJwYXRoIiwic2VwIiwiZ2V0UmVwb3NpdG9yaWVzIl0sInNvdXJjZXMiOlsibXJ1LWl0ZW0tdmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgZ2V0SWNvblNlcnZpY2VzIGZyb20gJy4vZ2V0LWljb24tc2VydmljZXMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNUlVJdGVtVmlldyB7XG4gIGluaXRpYWxpemUgKGxpc3RWaWV3LCBpdGVtKSB7XG4gICAgdGhpcy5saXN0VmlldyA9IGxpc3RWaWV3XG4gICAgdGhpcy5pdGVtID0gaXRlbVxuXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICAgIHRoaXMuZWxlbWVudC5pdGVtVmlld0RhdGEgPSB0aGlzXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3R3by1saW5lcycpXG5cbiAgICB0aGlzLml0ZW1QYXRoID0gbnVsbFxuICAgIGlmIChpdGVtLmdldFBhdGggJiYgdHlwZW9mIGl0ZW0uZ2V0UGF0aCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5pdGVtUGF0aCA9IGl0ZW0uZ2V0UGF0aCgpXG4gICAgfVxuXG4gICAgY29uc3QgcmVwbyA9IE1SVUl0ZW1WaWV3LnJlcG9zaXRvcnlGb3JQYXRoKHRoaXMuaXRlbVBhdGgpXG4gICAgaWYgKHJlcG8gIT0gbnVsbCkge1xuICAgICAgY29uc3Qgc3RhdHVzSWNvbkRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICBjb25zdCBzdGF0dXMgPSByZXBvLmdldENhY2hlZFBhdGhTdGF0dXModGhpcy5pdGVtUGF0aClcbiAgICAgIGlmIChyZXBvLmlzU3RhdHVzTmV3KHN0YXR1cykpIHtcbiAgICAgICAgc3RhdHVzSWNvbkRpdi5jbGFzc05hbWUgPSAnc3RhdHVzIHN0YXR1cy1hZGRlZCBpY29uIGljb24tZGlmZi1hZGRlZCdcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHN0YXR1c0ljb25EaXYpXG4gICAgICB9IGVsc2UgaWYgKHJlcG8uaXNTdGF0dXNNb2RpZmllZChzdGF0dXMpKSB7XG4gICAgICAgIHN0YXR1c0ljb25EaXYuY2xhc3NOYW1lID0gJ3N0YXR1cyBzdGF0dXMtbW9kaWZpZWQgaWNvbiBpY29uLWRpZmYtbW9kaWZpZWQnXG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChzdGF0dXNJY29uRGl2KVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuZmlyc3RMaW5lRGl2ID0gdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKVxuICAgIHRoaXMuZmlyc3RMaW5lRGl2LmNsYXNzTGlzdC5hZGQoJ3ByaW1hcnktbGluZScsICdmaWxlJylcbiAgICBpZiAodHlwZW9mIGl0ZW0uZ2V0SWNvbk5hbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ3RhYnMuc2hvd0ljb25zJykpIHRoaXMuZmlyc3RMaW5lRGl2LmNsYXNzTGlzdC5hZGQoJ2ljb24nLCAnaWNvbi0nICsgaXRlbS5nZXRJY29uTmFtZSgpKVxuICAgIH0gZWxzZSB7XG4gICAgICBnZXRJY29uU2VydmljZXMoKS51cGRhdGVNUlVJY29uKHRoaXMpXG4gICAgfVxuICAgIHRoaXMuZmlyc3RMaW5lRGl2LnNldEF0dHJpYnV0ZSgnZGF0YS1uYW1lJywgaXRlbS5nZXRUaXRsZSgpKVxuICAgIHRoaXMuZmlyc3RMaW5lRGl2LmlubmVyVGV4dCA9IGl0ZW0uZ2V0VGl0bGUoKVxuXG4gICAgaWYgKHRoaXMuaXRlbVBhdGgpIHtcbiAgICAgIHRoaXMuZmlyc3RMaW5lRGl2LnNldEF0dHJpYnV0ZSgnZGF0YS1wYXRoJywgdGhpcy5pdGVtUGF0aClcbiAgICAgIGNvbnN0IHNlY29uZExpbmVEaXYgPSB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpXG4gICAgICBzZWNvbmRMaW5lRGl2LmNsYXNzTGlzdC5hZGQoJ3NlY29uZGFyeS1saW5lJywgJ3BhdGgnLCAnbm8taWNvbicpXG4gICAgICBzZWNvbmRMaW5lRGl2LmlubmVyVGV4dCA9IHRoaXMuaXRlbVBhdGhcbiAgICB9XG4gIH1cblxuICBzZWxlY3QgKCkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG4gIH1cblxuICB1bnNlbGVjdCAoKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJylcbiAgfVxuXG4gIHN0YXRpYyByZXBvc2l0b3J5Rm9yUGF0aCAoZmlsZVBhdGgpIHtcbiAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgIGNvbnN0IHByb2plY3RQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2plY3RQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZmlsZVBhdGggPT09IHByb2plY3RQYXRoc1tpXSB8fCBmaWxlUGF0aC5zdGFydHNXaXRoKHByb2plY3RQYXRoc1tpXSArIHBhdGguc2VwKSkge1xuICAgICAgICAgIHJldHVybiBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKClbaV1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLFdBQVc7O0FBQUE7RUFBQTtBQUFBO0FBQUE7QUFFWDtBQUNBO0FBQXVCO0FBRVIsTUFBTUEsV0FBVyxDQUFDO0VBQy9CQyxVQUFVLENBQUVDLFFBQVEsRUFBRUMsSUFBSSxFQUFFO0lBQzFCLElBQUksQ0FBQ0QsUUFBUSxHQUFHQSxRQUFRO0lBQ3hCLElBQUksQ0FBQ0MsSUFBSSxHQUFHQSxJQUFJO0lBRWhCLElBQUksQ0FBQ0MsT0FBTyxHQUFHQyxRQUFRLENBQUNDLGFBQWEsQ0FBQyxJQUFJLENBQUM7SUFDM0MsSUFBSSxDQUFDRixPQUFPLENBQUNHLFlBQVksR0FBRyxJQUFJO0lBQ2hDLElBQUksQ0FBQ0gsT0FBTyxDQUFDSSxTQUFTLENBQUNDLEdBQUcsQ0FBQyxXQUFXLENBQUM7SUFFdkMsSUFBSSxDQUFDQyxRQUFRLEdBQUcsSUFBSTtJQUNwQixJQUFJUCxJQUFJLENBQUNRLE9BQU8sSUFBSSxPQUFPUixJQUFJLENBQUNRLE9BQU8sS0FBSyxVQUFVLEVBQUU7TUFDdEQsSUFBSSxDQUFDRCxRQUFRLEdBQUdQLElBQUksQ0FBQ1EsT0FBTyxFQUFFO0lBQ2hDO0lBRUEsTUFBTUMsSUFBSSxHQUFHWixXQUFXLENBQUNhLGlCQUFpQixDQUFDLElBQUksQ0FBQ0gsUUFBUSxDQUFDO0lBQ3pELElBQUlFLElBQUksSUFBSSxJQUFJLEVBQUU7TUFDaEIsTUFB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