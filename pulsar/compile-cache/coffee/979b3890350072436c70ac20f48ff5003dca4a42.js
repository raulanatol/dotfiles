(function() {
  var Dialog, MoveDialog, fs, path, repoForPath,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require('path');

  fs = require('fs-plus');

  Dialog = require('./dialog');

  repoForPath = require("./helpers").repoForPath;

  module.exports = MoveDialog = (function(superClass) {
    extend(MoveDialog, superClass);

    function MoveDialog(initialPath, arg) {
      var prompt;
      this.initialPath = initialPath;
      this.willMove = arg.willMove, this.onMove = arg.onMove, this.onMoveFailed = arg.onMoveFailed;
      if (fs.isDirectorySync(this.initialPath)) {
        prompt = 'Enter the new path for the directory.';
      } else {
        prompt = 'Enter the new path for the file.';
      }
      MoveDialog.__super__.constructor.call(this, {
        prompt: prompt,
        initialPath: atom.project.relativize(this.initialPath),
        select: true,
        iconClass: 'icon-arrow-right'
      });
    }

    MoveDialog.prototype.onConfirm = function(newPath) {
      var directoryPath, error, repo, rootPath;
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
      if (!this.isNewPathValid(newPath)) {
        this.showError("'" + newPath + "' already exists.");
        return;
      }
      directoryPath = path.dirname(newPath);
      try {
        if (typeof this.willMove === "function") {
          this.willMove({
            initialPath: this.initialPath,
            newPath: newPath
          });
        }
        if (!fs.existsSync(directoryPath)) {
          fs.makeTreeSync(directoryPath);
        }
        fs.moveSync(this.initialPath, newPath);
        if (typeof this.onMove === "function") {
          this.onMove({
            initialPath: this.initialPath,
            newPath: newPath
          });
        }
        if (repo = repoForPath(newPath)) {
          repo.getPathStatus(this.initialPath);
          repo.getPathStatus(newPath);
        }
        return this.close();
      } catch (error1) {
        error = error1;
        this.showError(error.message + ".");
        return typeof this.onMoveFailed === "function" ? this.onMoveFailed({
          initialPath: this.initialPath,
          newPath: newPath
        }) : void 0;
      }
    };

    MoveDialog.prototype.isNewPathValid = function(newPath) {
      var newStat, oldStat;
      try {
        oldStat = fs.statSync(this.initialPath);
        newStat = fs.statSync(newPath);
        return this.initialPath.toLowerCase() === newPath.toLowerCase() && oldStat.dev === newStat.dev && oldStat.ino === newStat.ino;
      } catch (error1) {
        return true;
      }
    };

    return MoveDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvdHJlZS12aWV3L2xpYi9tb3ZlLWRpYWxvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHlDQUFBO0lBQUE7OztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUNSLGNBQWUsT0FBQSxDQUFRLFdBQVI7O0VBRWhCLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUNTLG9CQUFDLFdBQUQsRUFBZSxHQUFmO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxjQUFEO01BQWUsSUFBQyxDQUFBLGVBQUEsVUFBVSxJQUFDLENBQUEsYUFBQSxRQUFRLElBQUMsQ0FBQSxtQkFBQTtNQUNoRCxJQUFHLEVBQUUsQ0FBQyxlQUFILENBQW1CLElBQUMsQ0FBQSxXQUFwQixDQUFIO1FBQ0UsTUFBQSxHQUFTLHdDQURYO09BQUEsTUFBQTtRQUdFLE1BQUEsR0FBUyxtQ0FIWDs7TUFLQSw0Q0FDRTtRQUFBLE1BQUEsRUFBUSxNQUFSO1FBQ0EsV0FBQSxFQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBYixDQUF3QixJQUFDLENBQUEsV0FBekIsQ0FEYjtRQUVBLE1BQUEsRUFBUSxJQUZSO1FBR0EsU0FBQSxFQUFXLGtCQUhYO09BREY7SUFOVzs7eUJBWWIsU0FBQSxHQUFXLFNBQUMsT0FBRDtBQUNULFVBQUE7TUFBQSxPQUFBLEdBQVUsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsTUFBaEIsRUFBd0IsRUFBeEI7TUFDVixJQUFBLENBQU8sSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBUDtRQUNHLFdBQVksSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxXQUE3QjtRQUNiLE9BQUEsR0FBVSxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBb0IsT0FBcEI7UUFDVixJQUFBLENBQWMsT0FBZDtBQUFBLGlCQUFBO1NBSEY7O01BS0EsSUFBRyxJQUFDLENBQUEsV0FBRCxLQUFnQixPQUFuQjtRQUNFLElBQUMsQ0FBQSxLQUFELENBQUE7QUFDQSxlQUZGOztNQUlBLElBQUEsQ0FBTyxJQUFDLENBQUEsY0FBRCxDQUFnQixPQUFoQixDQUFQO1FBQ0UsSUFBQyxDQUFBLFNBQUQsQ0FBVyxHQUFBLEdBQUksT0FBSixHQUFZLG1CQUF2QjtBQUNBLGVBRkY7O01BSUEsYUFBQSxHQUFnQixJQUFJLENBQUMsT0FBTCxDQUFhLE9BQWI7QUFDaEI7O1VBQ0UsSUFBQyxDQUFBLFNBQVU7WUFBQSxXQUFBLEVBQWEsSUFBQyxDQUFBLFdBQWQ7WUFBMkIsT0FBQSxFQUFTLE9BQXBDOzs7UUFDWCxJQUFBLENBQXNDLEVBQUUsQ0FBQyxVQUFILENBQWMsYUFBZCxDQUF0QztVQUFBLEVBQUUsQ0FBQyxZQUFILENBQWdCLGFBQWhCLEVBQUE7O1FBQ0EsRUFBRSxDQUFDLFFBQUgsQ0FBWSxJQUFDLENBQUEsV0FBYixFQUEwQixPQUExQjs7VUFDQSxJQUFDLENBQUEsT0FBUTtZQUFBLFdBQUEsRUFBYSxJQUFDLENBQUEsV0FBZDtZQUEyQixPQUFBLEVBQVMsT0FBcEM7OztRQUNULElBQUcsSUFBQSxHQUFPLFdBQUEsQ0FBWSxPQUFaLENBQVY7VUFDRSxJQUFJLENBQUMsYUFBTCxDQUFtQixJQUFDLENBQUEsV0FBcEI7VUFDQSxJQUFJLENBQUMsYUFBTCxDQUFtQixPQUFuQixFQUZGOztlQUdBLElBQUMsQ0FBQSxLQUFELENBQUEsRUFSRjtPQUFBLGNBQUE7UUFTTTtRQUNKLElBQUMsQ0FBQSxTQUFELENBQWMsS0FBSyxDQUFDLE9BQVAsR0FBZSxHQUE1Qjt5REFDQSxJQUFDLENBQUEsYUFBYztVQUFBLFdBQUEsRUFBYSxJQUFDLENBQUEsV0FBZDtVQUEyQixPQUFBLEVBQVMsT0FBcEM7b0JBWGpCOztJQWhCUzs7eUJBNkJYLGNBQUEsR0FBZ0IsU0FBQyxPQUFEO0FBQ2QsVUFBQTtBQUFBO1FBQ0UsT0FBQSxHQUFVLEVBQUUsQ0FBQyxRQUFILENBQVksSUFBQyxDQUFBLFdBQWI7UUFDVixPQUFBLEdBQVUsRUFBRSxDQUFDLFFBQUgsQ0FBWSxPQUFaO2VBS1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQUEsQ0FBQSxLQUE4QixPQUFPLENBQUMsV0FBUixDQUFBLENBQTlCLElBQ0UsT0FBTyxDQUFDLEdBQVIsS0FBZSxPQUFPLENBQUMsR0FEekIsSUFFRSxPQUFPLENBQUMsR0FBUixLQUFlLE9BQU8sQ0FBQyxJQVQzQjtPQUFBLGNBQUE7ZUFXRSxLQVhGOztJQURjOzs7O0tBMUNPO0FBTnpCIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5EaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZydcbntyZXBvRm9yUGF0aH0gPSByZXF1aXJlIFwiLi9oZWxwZXJzXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTW92ZURpYWxvZyBleHRlbmRzIERpYWxvZ1xuICBjb25zdHJ1Y3RvcjogKEBpbml0aWFsUGF0aCwge0B3aWxsTW92ZSwgQG9uTW92ZSwgQG9uTW92ZUZhaWxlZH0pIC0+XG4gICAgaWYgZnMuaXNEaXJlY3RvcnlTeW5jKEBpbml0aWFsUGF0aClcbiAgICAgIHByb21wdCA9ICdFbnRlciB0aGUgbmV3IHBhdGggZm9yIHRoZSBkaXJlY3RvcnkuJ1xuICAgIGVsc2VcbiAgICAgIHByb21wdCA9ICdFbnRlciB0aGUgbmV3IHBhdGggZm9yIHRoZSBmaWxlLidcblxuICAgIHN1cGVyXG4gICAgICBwcm9tcHQ6IHByb21wdFxuICAgICAgaW5pdGlhbFBhdGg6IGF0b20ucHJvamVjdC5yZWxhdGl2aXplKEBpbml0aWFsUGF0aClcbiAgICAgIHNlbGVjdDogdHJ1ZVxuICAgICAgaWNvbkNsYXNzOiAnaWNvbi1hcnJvdy1yaWdodCdcblxuICBvbkNvbmZpcm06IChuZXdQYXRoKSAtPlxuICAgIG5ld1BhdGggPSBuZXdQYXRoLnJlcGxhY2UoL1xccyskLywgJycpICMgUmVtb3ZlIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAgICB1bmxlc3MgcGF0aC5pc0Fic29sdXRlKG5ld1BhdGgpXG4gICAgICBbcm9vdFBhdGhdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKEBpbml0aWFsUGF0aClcbiAgICAgIG5ld1BhdGggPSBwYXRoLmpvaW4ocm9vdFBhdGgsIG5ld1BhdGgpXG4gICAgICByZXR1cm4gdW5sZXNzIG5ld1BhdGhcblxuICAgIGlmIEBpbml0aWFsUGF0aCBpcyBuZXdQYXRoXG4gICAgICBAY2xvc2UoKVxuICAgICAgcmV0dXJuXG5cbiAgICB1bmxlc3MgQGlzTmV3UGF0aFZhbGlkKG5ld1BhdGgpXG4gICAgICBAc2hvd0Vycm9yKFwiJyN7bmV3UGF0aH0nIGFscmVhZHkgZXhpc3RzLlwiKVxuICAgICAgcmV0dXJuXG5cbiAgICBkaXJlY3RvcnlQYXRoID0gcGF0aC5kaXJuYW1lKG5ld1BhdGgpXG4gICAgdHJ5XG4gICAgICBAd2lsbE1vdmU/KGluaXRpYWxQYXRoOiBAaW5pdGlhbFBhdGgsIG5ld1BhdGg6IG5ld1BhdGgpXG4gICAgICBmcy5tYWtlVHJlZVN5bmMoZGlyZWN0b3J5UGF0aCkgdW5sZXNzIGZzLmV4aXN0c1N5bmMoZGlyZWN0b3J5UGF0aClcbiAgICAgIGZzLm1vdmVTeW5jKEBpbml0aWFsUGF0aCwgbmV3UGF0aClcbiAgICAgIEBvbk1vdmU/KGluaXRpYWxQYXRoOiBAaW5pdGlhbFBhdGgsIG5ld1BhdGg6IG5ld1BhdGgpXG4gICAgICBpZiByZXBvID0gcmVwb0ZvclBhdGgobmV3UGF0aClcbiAgICAgICAgcmVwby5nZXRQYXRoU3RhdHVzKEBpbml0aWFsUGF0aClcbiAgICAgICAgcmVwby5nZXRQYXRoU3RhdHVzKG5ld1BhdGgpXG4gICAgICBAY2xvc2UoKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICBAc2hvd0Vycm9yKFwiI3tlcnJvci5tZXNzYWdlfS5cIilcbiAgICAgIEBvbk1vdmVGYWlsZWQ/KGluaXRpYWxQYXRoOiBAaW5pdGlhbFBhdGgsIG5ld1BhdGg6IG5ld1BhdGgpXG5cbiAgaXNOZXdQYXRoVmFsaWQ6IChuZXdQYXRoKSAtPlxuICAgIHRyeVxuICAgICAgb2xkU3RhdCA9IGZzLnN0YXRTeW5jKEBpbml0aWFsUGF0aClcbiAgICAgIG5ld1N0YXQgPSBmcy5zdGF0U3luYyhuZXdQYXRoKVxuXG4gICAgICAjIE5ldyBwYXRoIGV4aXN0cyBzbyBjaGVjayBpZiBpdCBwb2ludHMgdG8gdGhlIHNhbWUgZmlsZSBhcyB0aGUgaW5pdGlhbFxuICAgICAgIyBwYXRoIHRvIHNlZSBpZiB0aGUgY2FzZSBvZiB0aGUgZmlsZSBuYW1lIGlzIGJlaW5nIGNoYW5nZWQgb24gYSBvbiBhXG4gICAgICAjIGNhc2UgaW5zZW5zaXRpdmUgZmlsZXN5c3RlbS5cbiAgICAgIEBpbml0aWFsUGF0aC50b0xvd2VyQ2FzZSgpIGlzIG5ld1BhdGgudG9Mb3dlckNhc2UoKSBhbmRcbiAgICAgICAgb2xkU3RhdC5kZXYgaXMgbmV3U3RhdC5kZXYgYW5kXG4gICAgICAgIG9sZFN0YXQuaW5vIGlzIG5ld1N0YXQuaW5vXG4gICAgY2F0Y2hcbiAgICAgIHRydWUgIyBuZXcgcGF0aCBkb2VzIG5vdCBleGlzdCBzbyBpdCBpcyB2YWxpZFxuIl19
