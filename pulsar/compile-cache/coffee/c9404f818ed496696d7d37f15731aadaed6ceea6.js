(function() {
  var AddDialog, Dialog, fs, path, repoForPath,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require('path');

  fs = require('fs-plus');

  Dialog = require('./dialog');

  repoForPath = require('./helpers').repoForPath;

  module.exports = AddDialog = (function(superClass) {
    extend(AddDialog, superClass);

    function AddDialog(initialPath, isCreatingFile) {
      var directoryPath, ref, relativeDirectoryPath;
      this.isCreatingFile = isCreatingFile;
      if (fs.isFileSync(initialPath)) {
        directoryPath = path.dirname(initialPath);
      } else {
        directoryPath = initialPath;
      }
      relativeDirectoryPath = directoryPath;
      ref = atom.project.relativizePath(directoryPath), this.rootProjectPath = ref[0], relativeDirectoryPath = ref[1];
      if (relativeDirectoryPath.length > 0) {
        relativeDirectoryPath += path.sep;
      }
      AddDialog.__super__.constructor.call(this, {
        prompt: "Enter the path for the new " + (isCreatingFile ? "file." : "folder."),
        initialPath: relativeDirectoryPath,
        select: false,
        iconClass: isCreatingFile ? 'icon-file-add' : 'icon-file-directory-create'
      });
    }

    AddDialog.prototype.onDidCreateFile = function(callback) {
      return this.emitter.on('did-create-file', callback);
    };

    AddDialog.prototype.onDidCreateDirectory = function(callback) {
      return this.emitter.on('did-create-directory', callback);
    };

    AddDialog.prototype.onConfirm = function(newPath) {
      var endsWithDirectorySeparator, error, ref;
      newPath = newPath.replace(/\s+$/, '');
      endsWithDirectorySeparator = newPath[newPath.length - 1] === path.sep;
      if (!path.isAbsolute(newPath)) {
        if (this.rootProjectPath == null) {
          this.showError("You must open a directory to create a file with a relative path");
          return;
        }
        newPath = path.join(this.rootProjectPath, newPath);
      }
      if (!newPath) {
        return;
      }
      try {
        if (fs.existsSync(newPath)) {
          return this.showError("'" + newPath + "' already exists.");
        } else if (this.isCreatingFile) {
          if (endsWithDirectorySeparator) {
            return this.showError("File names must not end with a '" + path.sep + "' character.");
          } else {
            fs.writeFileSync(newPath, '');
            if ((ref = repoForPath(newPath)) != null) {
              ref.getPathStatus(newPath);
            }
            this.emitter.emit('did-create-file', newPath);
            return this.close();
          }
        } else {
          fs.makeTreeSync(newPath);
          this.emitter.emit('did-create-directory', newPath);
          return this.cancel();
        }
      } catch (error1) {
        error = error1;
        return this.showError(error.message + ".");
      }
    };

    return AddDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvdHJlZS12aWV3L2xpYi9hZGQtZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsd0NBQUE7SUFBQTs7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBQ1IsY0FBZSxPQUFBLENBQVEsV0FBUjs7RUFFaEIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBQ1MsbUJBQUMsV0FBRCxFQUFjLGNBQWQ7QUFDWCxVQUFBO01BQUEsSUFBQyxDQUFBLGNBQUQsR0FBa0I7TUFFbEIsSUFBRyxFQUFFLENBQUMsVUFBSCxDQUFjLFdBQWQsQ0FBSDtRQUNFLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE9BQUwsQ0FBYSxXQUFiLEVBRGxCO09BQUEsTUFBQTtRQUdFLGFBQUEsR0FBZ0IsWUFIbEI7O01BS0EscUJBQUEsR0FBd0I7TUFDeEIsTUFBNEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLGFBQTVCLENBQTVDLEVBQUMsSUFBQyxDQUFBLHdCQUFGLEVBQW1CO01BQ25CLElBQXFDLHFCQUFxQixDQUFDLE1BQXRCLEdBQStCLENBQXBFO1FBQUEscUJBQUEsSUFBeUIsSUFBSSxDQUFDLElBQTlCOztNQUVBLDJDQUNFO1FBQUEsTUFBQSxFQUFRLDZCQUFBLEdBQWdDLENBQUcsY0FBSCxHQUF1QixPQUF2QixHQUFvQyxTQUFwQyxDQUF4QztRQUNBLFdBQUEsRUFBYSxxQkFEYjtRQUVBLE1BQUEsRUFBUSxLQUZSO1FBR0EsU0FBQSxFQUFjLGNBQUgsR0FBdUIsZUFBdkIsR0FBNEMsNEJBSHZEO09BREY7SUFaVzs7d0JBa0JiLGVBQUEsR0FBaUIsU0FBQyxRQUFEO2FBQ2YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksaUJBQVosRUFBK0IsUUFBL0I7SUFEZTs7d0JBR2pCLG9CQUFBLEdBQXNCLFNBQUMsUUFBRDthQUNwQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxzQkFBWixFQUFvQyxRQUFwQztJQURvQjs7d0JBR3RCLFNBQUEsR0FBVyxTQUFDLE9BQUQ7QUFDVCxVQUFBO01BQUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxPQUFSLENBQWdCLE1BQWhCLEVBQXdCLEVBQXhCO01BQ1YsMEJBQUEsR0FBNkIsT0FBUSxDQUFBLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQWpCLENBQVIsS0FBK0IsSUFBSSxDQUFDO01BQ2pFLElBQUEsQ0FBTyxJQUFJLENBQUMsVUFBTCxDQUFnQixPQUFoQixDQUFQO1FBQ0UsSUFBTyw0QkFBUDtVQUNFLElBQUMsQ0FBQSxTQUFELENBQVcsaUVBQVg7QUFDQSxpQkFGRjs7UUFJQSxPQUFBLEdBQVUsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsZUFBWCxFQUE0QixPQUE1QixFQUxaOztNQU9BLElBQUEsQ0FBYyxPQUFkO0FBQUEsZUFBQTs7QUFFQTtRQUNFLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxPQUFkLENBQUg7aUJBQ0UsSUFBQyxDQUFBLFNBQUQsQ0FBVyxHQUFBLEdBQUksT0FBSixHQUFZLG1CQUF2QixFQURGO1NBQUEsTUFFSyxJQUFHLElBQUMsQ0FBQSxjQUFKO1VBQ0gsSUFBRywwQkFBSDttQkFDRSxJQUFDLENBQUEsU0FBRCxDQUFXLGtDQUFBLEdBQW1DLElBQUksQ0FBQyxHQUF4QyxHQUE0QyxjQUF2RCxFQURGO1dBQUEsTUFBQTtZQUdFLEVBQUUsQ0FBQyxhQUFILENBQWlCLE9BQWpCLEVBQTBCLEVBQTFCOztpQkFDb0IsQ0FBRSxhQUF0QixDQUFvQyxPQUFwQzs7WUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxpQkFBZCxFQUFpQyxPQUFqQzttQkFDQSxJQUFDLENBQUEsS0FBRCxDQUFBLEVBTkY7V0FERztTQUFBLE1BQUE7VUFTSCxFQUFFLENBQUMsWUFBSCxDQUFnQixPQUFoQjtVQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLHNCQUFkLEVBQXNDLE9BQXRDO2lCQUNBLElBQUMsQ0FBQSxNQUFELENBQUEsRUFYRztTQUhQO09BQUEsY0FBQTtRQWVNO2VBQ0osSUFBQyxDQUFBLFNBQUQsQ0FBYyxLQUFLLENBQUMsT0FBUCxHQUFlLEdBQTVCLEVBaEJGOztJQVpTOzs7O0tBekJXO0FBTnhCIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5EaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZydcbntyZXBvRm9yUGF0aH0gPSByZXF1aXJlICcuL2hlbHBlcnMnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEFkZERpYWxvZyBleHRlbmRzIERpYWxvZ1xuICBjb25zdHJ1Y3RvcjogKGluaXRpYWxQYXRoLCBpc0NyZWF0aW5nRmlsZSkgLT5cbiAgICBAaXNDcmVhdGluZ0ZpbGUgPSBpc0NyZWF0aW5nRmlsZVxuXG4gICAgaWYgZnMuaXNGaWxlU3luYyhpbml0aWFsUGF0aClcbiAgICAgIGRpcmVjdG9yeVBhdGggPSBwYXRoLmRpcm5hbWUoaW5pdGlhbFBhdGgpXG4gICAgZWxzZVxuICAgICAgZGlyZWN0b3J5UGF0aCA9IGluaXRpYWxQYXRoXG5cbiAgICByZWxhdGl2ZURpcmVjdG9yeVBhdGggPSBkaXJlY3RvcnlQYXRoXG4gICAgW0Byb290UHJvamVjdFBhdGgsIHJlbGF0aXZlRGlyZWN0b3J5UGF0aF0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZGlyZWN0b3J5UGF0aClcbiAgICByZWxhdGl2ZURpcmVjdG9yeVBhdGggKz0gcGF0aC5zZXAgaWYgcmVsYXRpdmVEaXJlY3RvcnlQYXRoLmxlbmd0aCA+IDBcblxuICAgIHN1cGVyXG4gICAgICBwcm9tcHQ6IFwiRW50ZXIgdGhlIHBhdGggZm9yIHRoZSBuZXcgXCIgKyBpZiBpc0NyZWF0aW5nRmlsZSB0aGVuIFwiZmlsZS5cIiBlbHNlIFwiZm9sZGVyLlwiXG4gICAgICBpbml0aWFsUGF0aDogcmVsYXRpdmVEaXJlY3RvcnlQYXRoXG4gICAgICBzZWxlY3Q6IGZhbHNlXG4gICAgICBpY29uQ2xhc3M6IGlmIGlzQ3JlYXRpbmdGaWxlIHRoZW4gJ2ljb24tZmlsZS1hZGQnIGVsc2UgJ2ljb24tZmlsZS1kaXJlY3RvcnktY3JlYXRlJ1xuXG4gIG9uRGlkQ3JlYXRlRmlsZTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdkaWQtY3JlYXRlLWZpbGUnLCBjYWxsYmFjaylcblxuICBvbkRpZENyZWF0ZURpcmVjdG9yeTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdkaWQtY3JlYXRlLWRpcmVjdG9yeScsIGNhbGxiYWNrKVxuXG4gIG9uQ29uZmlybTogKG5ld1BhdGgpIC0+XG4gICAgbmV3UGF0aCA9IG5ld1BhdGgucmVwbGFjZSgvXFxzKyQvLCAnJykgIyBSZW1vdmUgdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgIGVuZHNXaXRoRGlyZWN0b3J5U2VwYXJhdG9yID0gbmV3UGF0aFtuZXdQYXRoLmxlbmd0aCAtIDFdIGlzIHBhdGguc2VwXG4gICAgdW5sZXNzIHBhdGguaXNBYnNvbHV0ZShuZXdQYXRoKVxuICAgICAgdW5sZXNzIEByb290UHJvamVjdFBhdGg/XG4gICAgICAgIEBzaG93RXJyb3IoXCJZb3UgbXVzdCBvcGVuIGEgZGlyZWN0b3J5IHRvIGNyZWF0ZSBhIGZpbGUgd2l0aCBhIHJlbGF0aXZlIHBhdGhcIilcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIG5ld1BhdGggPSBwYXRoLmpvaW4oQHJvb3RQcm9qZWN0UGF0aCwgbmV3UGF0aClcblxuICAgIHJldHVybiB1bmxlc3MgbmV3UGF0aFxuXG4gICAgdHJ5XG4gICAgICBpZiBmcy5leGlzdHNTeW5jKG5ld1BhdGgpXG4gICAgICAgIEBzaG93RXJyb3IoXCInI3tuZXdQYXRofScgYWxyZWFkeSBleGlzdHMuXCIpXG4gICAgICBlbHNlIGlmIEBpc0NyZWF0aW5nRmlsZVxuICAgICAgICBpZiBlbmRzV2l0aERpcmVjdG9yeVNlcGFyYXRvclxuICAgICAgICAgIEBzaG93RXJyb3IoXCJGaWxlIG5hbWVzIG11c3Qgbm90IGVuZCB3aXRoIGEgJyN7cGF0aC5zZXB9JyBjaGFyYWN0ZXIuXCIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKG5ld1BhdGgsICcnKVxuICAgICAgICAgIHJlcG9Gb3JQYXRoKG5ld1BhdGgpPy5nZXRQYXRoU3RhdHVzKG5ld1BhdGgpXG4gICAgICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNyZWF0ZS1maWxlJywgbmV3UGF0aClcbiAgICAgICAgICBAY2xvc2UoKVxuICAgICAgZWxzZVxuICAgICAgICBmcy5tYWtlVHJlZVN5bmMobmV3UGF0aClcbiAgICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNyZWF0ZS1kaXJlY3RvcnknLCBuZXdQYXRoKVxuICAgICAgICBAY2FuY2VsKClcbiAgICBjYXRjaCBlcnJvclxuICAgICAgQHNob3dFcnJvcihcIiN7ZXJyb3IubWVzc2FnZX0uXCIpXG4iXX0=
