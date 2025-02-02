(function() {
  var CopyDialog, Dialog, fs, path, repoForPath,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require('path');

  fs = require('fs-plus');

  Dialog = require('./dialog');

  repoForPath = require("./helpers").repoForPath;

  module.exports = CopyDialog = (function(superClass) {
    extend(CopyDialog, superClass);

    function CopyDialog(initialPath, arg) {
      this.initialPath = initialPath;
      this.onCopy = arg.onCopy;
      CopyDialog.__super__.constructor.call(this, {
        prompt: 'Enter the new path for the duplicate.',
        initialPath: atom.project.relativize(this.initialPath),
        select: true,
        iconClass: 'icon-arrow-right'
      });
    }

    CopyDialog.prototype.onConfirm = function(newPath) {
      var activeEditor, error, repo, rootPath;
      newPath = newPath.replace(/\s+$/, '');
      if (!path.isAbsolute(newPath)) {
        rootPath = atom.project.relativizePath(this.initialPath)[0];
        newPath = path.join(rootPath, newPath);
        if (!newPath) {
          return;
        }
      }
      if (this.initialPath === newPath) {
        this.close();
        return;
      }
      if (fs.existsSync(newPath)) {
        this.showError("'" + newPath + "' already exists.");
        return;
      }
      activeEditor = atom.workspace.getActiveTextEditor();
      if ((activeEditor != null ? activeEditor.getPath() : void 0) !== this.initialPath) {
        activeEditor = null;
      }
      try {
        if (fs.isDirectorySync(this.initialPath)) {
          fs.copySync(this.initialPath, newPath);
          if (typeof this.onCopy === "function") {
            this.onCopy({
              initialPath: this.initialPath,
              newPath: newPath
            });
          }
        } else {
          fs.copy(this.initialPath, newPath, (function(_this) {
            return function() {
              if (typeof _this.onCopy === "function") {
                _this.onCopy({
                  initialPath: _this.initialPath,
                  newPath: newPath
                });
              }
              return atom.workspace.open(newPath, {
                activatePane: true,
                initialLine: activeEditor != null ? activeEditor.getLastCursor().getBufferRow() : void 0,
                initialColumn: activeEditor != null ? activeEditor.getLastCursor().getBufferColumn() : void 0
              });
            };
          })(this));
        }
        if (repo = repoForPath(newPath)) {
          repo.getPathStatus(this.initialPath);
          repo.getPathStatus(newPath);
        }
        return this.close();
      } catch (error1) {
        error = error1;
        return this.showError(error.message + ".");
      }
    };

    return CopyDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvdHJlZS12aWV3L2xpYi9jb3B5LWRpYWxvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHlDQUFBO0lBQUE7OztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUNSLGNBQWUsT0FBQSxDQUFRLFdBQVI7O0VBRWhCLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUNTLG9CQUFDLFdBQUQsRUFBZSxHQUFmO01BQUMsSUFBQyxDQUFBLGNBQUQ7TUFBZSxJQUFDLENBQUEsU0FBRixJQUFFO01BQzVCLDRDQUNFO1FBQUEsTUFBQSxFQUFRLHVDQUFSO1FBQ0EsV0FBQSxFQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBYixDQUF3QixJQUFDLENBQUEsV0FBekIsQ0FEYjtRQUVBLE1BQUEsRUFBUSxJQUZSO1FBR0EsU0FBQSxFQUFXLGtCQUhYO09BREY7SUFEVzs7eUJBT2IsU0FBQSxHQUFXLFNBQUMsT0FBRDtBQUNULFVBQUE7TUFBQSxPQUFBLEdBQVUsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsTUFBaEIsRUFBd0IsRUFBeEI7TUFDVixJQUFBLENBQU8sSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBUDtRQUNHLFdBQVksSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxXQUE3QjtRQUNiLE9BQUEsR0FBVSxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBb0IsT0FBcEI7UUFDVixJQUFBLENBQWMsT0FBZDtBQUFBLGlCQUFBO1NBSEY7O01BS0EsSUFBRyxJQUFDLENBQUEsV0FBRCxLQUFnQixPQUFuQjtRQUNFLElBQUMsQ0FBQSxLQUFELENBQUE7QUFDQSxlQUZGOztNQUlBLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxPQUFkLENBQUg7UUFDRSxJQUFDLENBQUEsU0FBRCxDQUFXLEdBQUEsR0FBSSxPQUFKLEdBQVksbUJBQXZCO0FBQ0EsZUFGRjs7TUFJQSxZQUFBLEdBQWUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO01BQ2YsNEJBQTJCLFlBQVksQ0FBRSxPQUFkLENBQUEsV0FBQSxLQUEyQixJQUFDLENBQUEsV0FBdkQ7UUFBQSxZQUFBLEdBQWUsS0FBZjs7QUFDQTtRQUNFLElBQUcsRUFBRSxDQUFDLGVBQUgsQ0FBbUIsSUFBQyxDQUFBLFdBQXBCLENBQUg7VUFDRSxFQUFFLENBQUMsUUFBSCxDQUFZLElBQUMsQ0FBQSxXQUFiLEVBQTBCLE9BQTFCOztZQUNBLElBQUMsQ0FBQSxPQUFRO2NBQUMsV0FBQSxFQUFhLElBQUMsQ0FBQSxXQUFmO2NBQTRCLE9BQUEsRUFBUyxPQUFyQzs7V0FGWDtTQUFBLE1BQUE7VUFJRSxFQUFFLENBQUMsSUFBSCxDQUFRLElBQUMsQ0FBQSxXQUFULEVBQXNCLE9BQXRCLEVBQStCLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUE7O2dCQUM3QixLQUFDLENBQUEsT0FBUTtrQkFBQyxXQUFBLEVBQWEsS0FBQyxDQUFBLFdBQWY7a0JBQTRCLE9BQUEsRUFBUyxPQUFyQzs7O3FCQUNULElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixPQUFwQixFQUNFO2dCQUFBLFlBQUEsRUFBYyxJQUFkO2dCQUNBLFdBQUEseUJBQWEsWUFBWSxDQUFFLGFBQWQsQ0FBQSxDQUE2QixDQUFDLFlBQTlCLENBQUEsVUFEYjtnQkFFQSxhQUFBLHlCQUFlLFlBQVksQ0FBRSxhQUFkLENBQUEsQ0FBNkIsQ0FBQyxlQUE5QixDQUFBLFVBRmY7ZUFERjtZQUY2QjtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0IsRUFKRjs7UUFVQSxJQUFHLElBQUEsR0FBTyxXQUFBLENBQVksT0FBWixDQUFWO1VBQ0UsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBQyxDQUFBLFdBQXBCO1VBQ0EsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsT0FBbkIsRUFGRjs7ZUFHQSxJQUFDLENBQUEsS0FBRCxDQUFBLEVBZEY7T0FBQSxjQUFBO1FBZU07ZUFDSixJQUFDLENBQUEsU0FBRCxDQUFjLEtBQUssQ0FBQyxPQUFQLEdBQWUsR0FBNUIsRUFoQkY7O0lBakJTOzs7O0tBUlk7QUFOekIiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbkRpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9nJ1xue3JlcG9Gb3JQYXRofSA9IHJlcXVpcmUgXCIuL2hlbHBlcnNcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDb3B5RGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIGNvbnN0cnVjdG9yOiAoQGluaXRpYWxQYXRoLCB7QG9uQ29weX0pIC0+XG4gICAgc3VwZXJcbiAgICAgIHByb21wdDogJ0VudGVyIHRoZSBuZXcgcGF0aCBmb3IgdGhlIGR1cGxpY2F0ZS4nXG4gICAgICBpbml0aWFsUGF0aDogYXRvbS5wcm9qZWN0LnJlbGF0aXZpemUoQGluaXRpYWxQYXRoKVxuICAgICAgc2VsZWN0OiB0cnVlXG4gICAgICBpY29uQ2xhc3M6ICdpY29uLWFycm93LXJpZ2h0J1xuXG4gIG9uQ29uZmlybTogKG5ld1BhdGgpIC0+XG4gICAgbmV3UGF0aCA9IG5ld1BhdGgucmVwbGFjZSgvXFxzKyQvLCAnJykgIyBSZW1vdmUgdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgIHVubGVzcyBwYXRoLmlzQWJzb2x1dGUobmV3UGF0aClcbiAgICAgIFtyb290UGF0aF0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoQGluaXRpYWxQYXRoKVxuICAgICAgbmV3UGF0aCA9IHBhdGguam9pbihyb290UGF0aCwgbmV3UGF0aClcbiAgICAgIHJldHVybiB1bmxlc3MgbmV3UGF0aFxuXG4gICAgaWYgQGluaXRpYWxQYXRoIGlzIG5ld1BhdGhcbiAgICAgIEBjbG9zZSgpXG4gICAgICByZXR1cm5cblxuICAgIGlmIGZzLmV4aXN0c1N5bmMobmV3UGF0aClcbiAgICAgIEBzaG93RXJyb3IoXCInI3tuZXdQYXRofScgYWxyZWFkeSBleGlzdHMuXCIpXG4gICAgICByZXR1cm5cblxuICAgIGFjdGl2ZUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGFjdGl2ZUVkaXRvciA9IG51bGwgdW5sZXNzIGFjdGl2ZUVkaXRvcj8uZ2V0UGF0aCgpIGlzIEBpbml0aWFsUGF0aFxuICAgIHRyeVxuICAgICAgaWYgZnMuaXNEaXJlY3RvcnlTeW5jKEBpbml0aWFsUGF0aClcbiAgICAgICAgZnMuY29weVN5bmMoQGluaXRpYWxQYXRoLCBuZXdQYXRoKVxuICAgICAgICBAb25Db3B5Pyh7aW5pdGlhbFBhdGg6IEBpbml0aWFsUGF0aCwgbmV3UGF0aDogbmV3UGF0aH0pXG4gICAgICBlbHNlXG4gICAgICAgIGZzLmNvcHkgQGluaXRpYWxQYXRoLCBuZXdQYXRoLCA9PlxuICAgICAgICAgIEBvbkNvcHk/KHtpbml0aWFsUGF0aDogQGluaXRpYWxQYXRoLCBuZXdQYXRoOiBuZXdQYXRofSlcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuIG5ld1BhdGgsXG4gICAgICAgICAgICBhY3RpdmF0ZVBhbmU6IHRydWVcbiAgICAgICAgICAgIGluaXRpYWxMaW5lOiBhY3RpdmVFZGl0b3I/LmdldExhc3RDdXJzb3IoKS5nZXRCdWZmZXJSb3coKVxuICAgICAgICAgICAgaW5pdGlhbENvbHVtbjogYWN0aXZlRWRpdG9yPy5nZXRMYXN0Q3Vyc29yKCkuZ2V0QnVmZmVyQ29sdW1uKClcbiAgICAgIGlmIHJlcG8gPSByZXBvRm9yUGF0aChuZXdQYXRoKVxuICAgICAgICByZXBvLmdldFBhdGhTdGF0dXMoQGluaXRpYWxQYXRoKVxuICAgICAgICByZXBvLmdldFBhdGhTdGF0dXMobmV3UGF0aClcbiAgICAgIEBjbG9zZSgpXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIEBzaG93RXJyb3IoXCIje2Vycm9yLm1lc3NhZ2V9LlwiKVxuIl19
