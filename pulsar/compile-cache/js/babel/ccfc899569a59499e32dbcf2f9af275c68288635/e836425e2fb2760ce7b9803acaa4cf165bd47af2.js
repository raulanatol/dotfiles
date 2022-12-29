"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/** @babel */
var _default = {
  activate() {
    this.stack = [];
    this.workspaceSubscription = atom.commands.add('atom-workspace', {
      'symbols-view:toggle-project-symbols': () => {
        this.createProjectView().toggle();
      }
    });
    this.editorSubscription = atom.commands.add('atom-text-editor', {
      'symbols-view:toggle-file-symbols': () => {
        this.createFileView().toggle();
      },
      'symbols-view:go-to-declaration': () => {
        this.createGoToView().toggle();
      },
      'symbols-view:return-from-declaration': () => {
        this.createGoBackView().toggle();
      }
    });
  },
  deactivate() {
    if (this.fileView != null) {
      this.fileView.destroy();
      this.fileView = null;
    }
    if (this.projectView != null) {
      this.projectView.destroy();
      this.projectView = null;
    }
    if (this.goToView != null) {
      this.goToView.destroy();
      this.goToView = null;
    }
    if (this.goBackView != null) {
      this.goBackView.destroy();
      this.goBackView = null;
    }
    if (this.workspaceSubscription != null) {
      this.workspaceSubscription.dispose();
      this.workspaceSubscription = null;
    }
    if (this.editorSubscription != null) {
      this.editorSubscription.dispose();
      this.editorSubscription = null;
    }
  },
  createFileView() {
    if (this.fileView) {
      return this.fileView;
    }
    const FileView = require('./file-view');
    this.fileView = new FileView(this.stack);
    return this.fileView;
  },
  createProjectView() {
    if (this.projectView) {
      return this.projectView;
    }
    const ProjectView = require('./project-view');
    this.projectView = new ProjectView(this.stack);
    return this.projectView;
  },
  createGoToView() {
    if (this.goToView) {
      return this.goToView;
    }
    const GoToView = require('./go-to-view');
    this.goToView = new GoToView(this.stack);
    return this.goToView;
  },
  createGoBackView() {
    if (this.goBackView) {
      return this.goBackView;
    }
    const GoBackView = require('./go-back-view');
    this.goBackView = new GoBackView(this.stack);
    return this.goBackView;
  }
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhY3RpdmF0ZSIsInN0YWNrIiwid29ya3NwYWNlU3Vic2NyaXB0aW9uIiwiYXRvbSIsImNvbW1hbmRzIiwiYWRkIiwiY3JlYXRlUHJvamVjdFZpZXciLCJ0b2dnbGUiLCJlZGl0b3JTdWJzY3JpcHRpb24iLCJjcmVhdGVGaWxlVmlldyIsImNyZWF0ZUdvVG9WaWV3IiwiY3JlYXRlR29CYWNrVmlldyIsImRlYWN0aXZhdGUiLCJmaWxlVmlldyIsImRlc3Ryb3kiLCJwcm9qZWN0VmlldyIsImdvVG9WaWV3IiwiZ29CYWNrVmlldyIsImRpc3Bvc2UiLCJGaWxlVmlldyIsInJlcXVpcmUiLCJQcm9qZWN0VmlldyIsIkdvVG9WaWV3IiwiR29CYWNrVmlldyJdLCJzb3VyY2VzIjpbIm1haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMuc3RhY2sgPSBbXTtcblxuICAgIHRoaXMud29ya3NwYWNlU3Vic2NyaXB0aW9uID0gYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ3N5bWJvbHMtdmlldzp0b2dnbGUtcHJvamVjdC1zeW1ib2xzJzogKCkgPT4ge1xuICAgICAgICB0aGlzLmNyZWF0ZVByb2plY3RWaWV3KCkudG9nZ2xlKCk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5lZGl0b3JTdWJzY3JpcHRpb24gPSBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICdzeW1ib2xzLXZpZXc6dG9nZ2xlLWZpbGUtc3ltYm9scyc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5jcmVhdGVGaWxlVmlldygpLnRvZ2dsZSgpO1xuICAgICAgfSxcbiAgICAgICdzeW1ib2xzLXZpZXc6Z28tdG8tZGVjbGFyYXRpb24nOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuY3JlYXRlR29Ub1ZpZXcoKS50b2dnbGUoKTtcbiAgICAgIH0sXG4gICAgICAnc3ltYm9scy12aWV3OnJldHVybi1mcm9tLWRlY2xhcmF0aW9uJzogKCkgPT4ge1xuICAgICAgICB0aGlzLmNyZWF0ZUdvQmFja1ZpZXcoKS50b2dnbGUoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAodGhpcy5maWxlVmlldyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmZpbGVWaWV3LmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuZmlsZVZpZXcgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnByb2plY3RWaWV3ICE9IG51bGwpIHtcbiAgICAgIHRoaXMucHJvamVjdFZpZXcuZGVzdHJveSgpO1xuICAgICAgdGhpcy5wcm9qZWN0VmlldyA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ29Ub1ZpZXcgIT0gbnVsbCkge1xuICAgICAgdGhpcy5nb1RvVmlldy5kZXN0cm95KCk7XG4gICAgICB0aGlzLmdvVG9WaWV3ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nb0JhY2tWaWV3ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuZ29CYWNrVmlldy5kZXN0cm95KCk7XG4gICAgICB0aGlzLmdvQmFja1ZpZXcgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLndvcmtzcGFjZVN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICB0aGlzLndvcmtzcGFjZVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLndvcmtzcGFjZVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZWRpdG9yU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIHRoaXMuZWRpdG9yU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuZWRpdG9yU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlRmlsZVZpZXcoKSB7XG4gICAgaWYgKHRoaXMuZmlsZVZpZXcpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbGVWaWV3O1xuICAgIH1cbiAgICBjb25zdCBGaWxlVmlldyAgPSByZXF1aXJlKCcuL2ZpbGUtdmlldycpO1xuICAgIHRoaXMuZmlsZVZpZXcgPSBuZXcgRmlsZVZpZXcodGhpcy5zdGFjayk7XG4gICAgcmV0dXJuIHRoaXMuZmlsZVZpZXc7XG4gIH0sXG5cbiAgY3JlYXRlUHJvamVjdFZpZXcoKSB7XG4gICAgaWYgKHRoaXMucHJvamVjdFZpZXcpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb2plY3RWaWV3O1xuICAgIH1cbiAgICBjb25zdCBQcm9qZWN0VmlldyAgPSByZXF1aXJlKCcuL3Byb2plY3QtdmlldycpO1xuICAgIHRoaXMucHJvamVjdFZpZXcgPSBuZXcgUHJvamVjdFZpZXcodGhpcy5zdGFjayk7XG4gICAgcmV0dXJuIHRoaXMucHJvamVjdFZpZXc7XG4gIH0sXG5cbiAgY3JlYXRlR29Ub1ZpZXcoKSB7XG4gICAgaWYgKHRoaXMuZ29Ub1ZpZXcpIHtcbiAgICAgIHJldHVybiB0aGlzLmdvVG9WaWV3O1xuICAgIH1cbiAgICBjb25zdCBHb1RvVmlldyA9IHJlcXVpcmUoJy4vZ28tdG8tdmlldycpO1xuICAgIHRoaXMuZ29Ub1ZpZXcgPSBuZXcgR29Ub1ZpZXcodGhpcy5zdGFjayk7XG4gICAgcmV0dXJuIHRoaXMuZ29Ub1ZpZXc7XG4gIH0sXG5cbiAgY3JlYXRlR29CYWNrVmlldygpIHtcbiAgICBpZiAodGhpcy5nb0JhY2tWaWV3KSB7XG4gICAgICByZXR1cm4gdGhpcy5nb0JhY2tWaWV3O1xuICAgIH1cbiAgICBjb25zdCBHb0JhY2tWaWV3ID0gcmVxdWlyZSgnLi9nby1iYWNrLXZpZXcnKTtcbiAgICB0aGlzLmdvQmFja1ZpZXcgPSBuZXcgR29CYWNrVmlldyh0aGlzLnN0YWNrKTtcbiAgICByZXR1cm4gdGhpcy5nb0JhY2tWaWV3O1xuICB9LFxufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFBQSxlQUVl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