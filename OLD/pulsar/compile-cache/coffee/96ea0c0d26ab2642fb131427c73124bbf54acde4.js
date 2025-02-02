(function() {
  var CLASSES, clone, firstCharsEqual, fs, path, propertyPrefixPattern;

  fs = require('fs');

  path = require('path');

  CLASSES = require('../completions.json');

  propertyPrefixPattern = /(?:^|\[|\(|,|=|:|\s)\s*(atom\.(?:[a-zA-Z]+\.?){0,2})$/;

  module.exports = {
    selector: '.source.coffee, .source.js',
    filterSuggestions: true,
    getSuggestions: function(arg) {
      var bufferPosition, editor, line;
      bufferPosition = arg.bufferPosition, editor = arg.editor;
      if (!this.isEditingAnAtomPackageFile(editor)) {
        return;
      }
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return this.getCompletions(line);
    },
    load: function() {
      this.loadCompletions();
      atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.scanProjectDirectories();
        };
      })(this));
      return this.scanProjectDirectories();
    },
    scanProjectDirectories: function() {
      this.packageDirectories = [];
      return atom.project.getDirectories().forEach((function(_this) {
        return function(directory) {
          if (directory == null) {
            return;
          }
          return _this.readMetadata(directory, function(error, metadata) {
            if (_this.isAtomPackage(metadata) || _this.isAtomCore(metadata)) {
              return _this.packageDirectories.push(directory);
            }
          });
        };
      })(this));
    },
    readMetadata: function(directory, callback) {
      return fs.readFile(path.join(directory.getPath(), 'package.json'), function(error, contents) {
        var metadata, parseError;
        if (error == null) {
          try {
            metadata = JSON.parse(contents);
          } catch (error1) {
            parseError = error1;
            error = parseError;
          }
        }
        return callback(error, metadata);
      });
    },
    isAtomPackage: function(metadata) {
      var ref, ref1;
      return (metadata != null ? (ref = metadata.engines) != null ? (ref1 = ref.atom) != null ? ref1.length : void 0 : void 0 : void 0) > 0;
    },
    isAtomCore: function(metadata) {
      return (metadata != null ? metadata.name : void 0) === 'atom';
    },
    isEditingAnAtomPackageFile: function(editor) {
      var directory, editorPath, i, len, parsedPath, ref, ref1;
      editorPath = editor.getPath();
      if (editorPath != null) {
        parsedPath = path.parse(editorPath);
        if (path.basename(parsedPath.dir) === '.atom') {
          if (parsedPath.base === 'init.coffee' || parsedPath.base === 'init.js') {
            return true;
          }
        }
      }
      ref1 = (ref = this.packageDirectories) != null ? ref : [];
      for (i = 0, len = ref1.length; i < len; i++) {
        directory = ref1[i];
        if (directory.contains(editorPath)) {
          return true;
        }
      }
      return false;
    },
    loadCompletions: function() {
      if (this.completions == null) {
        this.completions = {};
      }
      return this.loadProperty('atom', 'AtomEnvironment', CLASSES);
    },
    getCompletions: function(line) {
      var completion, completions, i, len, match, prefix, property, propertyCompletions, ref, ref1, ref2, ref3, segments;
      completions = [];
      match = (ref = propertyPrefixPattern.exec(line)) != null ? ref[1] : void 0;
      if (!match) {
        return completions;
      }
      segments = match.split('.');
      prefix = (ref1 = segments.pop()) != null ? ref1 : '';
      segments = segments.filter(function(segment) {
        return segment;
      });
      property = segments[segments.length - 1];
      propertyCompletions = (ref2 = (ref3 = this.completions[property]) != null ? ref3.completions : void 0) != null ? ref2 : [];
      for (i = 0, len = propertyCompletions.length; i < len; i++) {
        completion = propertyCompletions[i];
        if (!prefix || firstCharsEqual(completion.name, prefix)) {
          completions.push(clone(completion));
        }
      }
      return completions;
    },
    getPropertyClass: function(name) {
      var ref, ref1;
      return (ref = atom[name]) != null ? (ref1 = ref.constructor) != null ? ref1.name : void 0 : void 0;
    },
    loadProperty: function(propertyName, className, classes, parent) {
      var classCompletions, completion, i, len, propertyClass;
      classCompletions = classes[className];
      if (classCompletions == null) {
        return;
      }
      this.completions[propertyName] = {
        completions: []
      };
      for (i = 0, len = classCompletions.length; i < len; i++) {
        completion = classCompletions[i];
        this.completions[propertyName].completions.push(completion);
        if (completion.type === 'property') {
          propertyClass = this.getPropertyClass(completion.name);
          this.loadProperty(completion.name, propertyClass, classes);
        }
      }
    }
  };

  clone = function(obj) {
    var k, newObj, v;
    newObj = {};
    for (k in obj) {
      v = obj[k];
      newObj[k] = v;
    }
    return newObj;
  };

  firstCharsEqual = function(str1, str2) {
    return str1[0].toLowerCase() === str2[0].toLowerCase();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYXV0b2NvbXBsZXRlLWF0b20tYXBpL2xpYi9wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsT0FBQSxHQUFVLE9BQUEsQ0FBUSxxQkFBUjs7RUFFVixxQkFBQSxHQUF3Qjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSw0QkFBVjtJQUNBLGlCQUFBLEVBQW1CLElBRG5CO0lBR0EsY0FBQSxFQUFnQixTQUFDLEdBQUQ7QUFDZCxVQUFBO01BRGdCLHFDQUFnQjtNQUNoQyxJQUFBLENBQWMsSUFBQyxDQUFBLDBCQUFELENBQTRCLE1BQTVCLENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQUEsR0FBTyxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLENBQUMsY0FBYyxDQUFDLEdBQWhCLEVBQXFCLENBQXJCLENBQUQsRUFBMEIsY0FBMUIsQ0FBdEI7YUFDUCxJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFoQjtJQUhjLENBSGhCO0lBUUEsSUFBQSxFQUFNLFNBQUE7TUFDSixJQUFDLENBQUEsZUFBRCxDQUFBO01BQ0EsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBYixDQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLHNCQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7YUFDQSxJQUFDLENBQUEsc0JBQUQsQ0FBQTtJQUhJLENBUk47SUFhQSxzQkFBQSxFQUF3QixTQUFBO01BQ3RCLElBQUMsQ0FBQSxrQkFBRCxHQUFzQjthQUN0QixJQUFJLENB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QUQ7QUFDaEIsVUFBQTtpRkFBdUIsQ0FBRTtJQURULENBakVsQjtJQW9FQSxZQUFBLEVBQWMsU0FBQyxZQUFELEVBQWUsU0FBZixFQUEwQixPQUExQixFQUFtQyxNQUFuQztBQUNaLFVBQUE7TUFBQSxnQkFBQSxHQUFtQixPQUFRLENBQUEsU0FBQTtNQUMzQixJQUFjLHdCQUFkO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsV0FBWSxDQUFBLFlBQUEsQ0FBYixHQUE2QjtRQUFBLFdBQUEsRUFBYSxFQUFiOztBQUU3QixXQUFBLGtEQUFBOztRQUNFLElBQUMsQ0FBQSxXQUFZLENBQUEsWUFBQSxDQUFhLENBQUMsV0FBVyxDQUFDLElBQXZDLENBQTRDLFVBQTVDO1FBQ0EsSUFBRyxVQUFVLENBQUMsSUFBWCxLQUFtQixVQUF0QjtVQUNFLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLGdCQUFELENBQWtCLFVBQVUsQ0FBQyxJQUE3QjtVQUNoQixJQUFDLENBQUEsWUFBRCxDQUFjLFVBQVUsQ0FBQyxJQUF6QixFQUErQixhQUEvQixFQUE4QyxPQUE5QyxFQUZGOztBQUZGO0lBTlksQ0FwRWQ7OztFQWlGRixLQUFBLEdBQVEsU0FBQyxHQUFEO0FBQ04sUUFBQTtJQUFBLE1BQUEsR0FBUztBQUNULFNBQUEsUUFBQTs7TUFBQSxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVk7QUFBWjtXQUNBO0VBSE07O0VBS1IsZUFBQSxHQUFrQixTQUFDLElBQUQsRUFBTyxJQUFQO1dBQ2hCLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFSLENBQUEsQ0FBQSxLQUF5QixJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBUixDQUFBO0VBRFQ7QUE5RmxCIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5DTEFTU0VTID0gcmVxdWlyZSgnLi4vY29tcGxldGlvbnMuanNvbicpXG5cbnByb3BlcnR5UHJlZml4UGF0dGVybiA9IC8oPzpefFxcW3xcXCh8LHw9fDp8XFxzKVxccyooYXRvbVxcLig/OlthLXpBLVpdK1xcLj8pezAsMn0pJC9cblxubW9kdWxlLmV4cG9ydHMgPVxuICBzZWxlY3RvcjogJy5zb3VyY2UuY29mZmVlLCAuc291cmNlLmpzJ1xuICBmaWx0ZXJTdWdnZXN0aW9uczogdHJ1ZVxuXG4gIGdldFN1Z2dlc3Rpb25zOiAoe2J1ZmZlclBvc2l0aW9uLCBlZGl0b3J9KSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGlzRWRpdGluZ0FuQXRvbVBhY2thZ2VGaWxlKGVkaXRvcilcbiAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgIEBnZXRDb21wbGV0aW9ucyhsaW5lKVxuXG4gIGxvYWQ6IC0+XG4gICAgQGxvYWRDb21wbGV0aW9ucygpXG4gICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMgPT4gQHNjYW5Qcm9qZWN0RGlyZWN0b3JpZXMoKVxuICAgIEBzY2FuUHJvamVjdERpcmVjdG9yaWVzKClcblxuICBzY2FuUHJvamVjdERpcmVjdG9yaWVzOiAtPlxuICAgIEBwYWNrYWdlRGlyZWN0b3JpZXMgPSBbXVxuICAgIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLmZvckVhY2ggKGRpcmVjdG9yeSkgPT5cbiAgICAgIHJldHVybiB1bmxlc3MgZGlyZWN0b3J5P1xuICAgICAgQHJlYWRNZXRhZGF0YSBkaXJlY3RvcnksIChlcnJvciwgbWV0YWRhdGEpID0+XG4gICAgICAgIGlmIEBpc0F0b21QYWNrYWdlKG1ldGFkYXRhKSBvciBAaXNBdG9tQ29yZShtZXRhZGF0YSlcbiAgICAgICAgICBAcGFja2FnZURpcmVjdG9yaWVzLnB1c2goZGlyZWN0b3J5KVxuXG4gIHJlYWRNZXRhZGF0YTogKGRpcmVjdG9yeSwgY2FsbGJhY2spIC0+XG4gICAgZnMucmVhZEZpbGUgcGF0aC5qb2luKGRpcmVjdG9yeS5nZXRQYXRoKCksICdwYWNrYWdlLmpzb24nKSwgKGVycm9yLCBjb250ZW50cykgLT5cbiAgICAgIHVubGVzcyBlcnJvcj9cbiAgICAgICAgdHJ5XG4gICAgICAgICAgbWV0YWRhdGEgPSBKU09OLnBhcnNlKGNvbnRlbnRzKVxuICAgICAgICBjYXRjaCBwYXJzZUVycm9yXG4gICAgICAgICAgZXJyb3IgPSBwYXJzZUVycm9yXG4gICAgICBjYWxsYmFjayhlcnJvciwgbWV0YWRhdGEpXG5cbiAgaXNBdG9tUGFja2FnZTogKG1ldGFkYXRhKSAtPlxuICAgIG1ldGFkYXRhPy5lbmdpbmVzPy5hdG9tPy5sZW5ndGggPiAwXG5cbiAgaXNBdG9tQ29yZTogKG1ldGFkYXRhKSAtPlxuICAgIG1ldGFkYXRhPy5uYW1lIGlzICdhdG9tJ1xuXG4gIGlzRWRpdGluZ0FuQXRvbVBhY2thZ2VGaWxlOiAoZWRpdG9yKSAtPlxuICAgIGVkaXRvclBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgaWYgZWRpdG9yUGF0aD9cbiAgICAgIHBhcnNlZFBhdGggPSBwYXRoLnBhcnNlKGVkaXRvclBhdGgpXG4gICAgICBpZiBwYXRoLmJhc2VuYW1lKHBhcnNlZFBhdGguZGlyKSBpcyAnLmF0b20nXG4gICAgICAgIGlmIHBhcnNlZFBhdGguYmFzZSBpcyAnaW5pdC5jb2ZmZWUnIG9yIHBhcnNlZFBhdGguYmFzZSBpcyAnaW5pdC5qcydcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIGZvciBkaXJlY3RvcnkgaW4gQHBhY2thZ2VEaXJlY3RvcmllcyA/IFtdXG4gICAgICByZXR1cm4gdHJ1ZSBpZiBkaXJlY3RvcnkuY29udGFpbnMoZWRpdG9yUGF0aClcbiAgICBmYWxzZVxuXG4gIGxvYWRDb21wbGV0aW9uczogLT5cbiAgICBAY29tcGxldGlvbnMgPz0ge31cbiAgICBAbG9hZFByb3BlcnR5KCdhdG9tJywgJ0F0b21FbnZpcm9ubWVudCcsIENMQVNTRVMpXG5cbiAgZ2V0Q29tcGxldGlvbnM6IChsaW5lKSAtPlxuICAgIGNvbXBsZXRpb25zID0gW11cbiAgICBtYXRjaCA9ICBwcm9wZXJ0eVByZWZpeFBhdHRlcm4uZXhlYyhsaW5lKT9bMV1cbiAgICByZXR1cm4gY29tcGxldGlvbnMgdW5sZXNzIG1hdGNoXG5cbiAgICBzZWdtZW50cyA9IG1hdGNoLnNwbGl0KCcuJylcbiAgICBwcmVmaXggPSBzZWdtZW50cy5wb3AoKSA/ICcnXG4gICAgc2VnbWVudHMgPSBzZWdtZW50cy5maWx0ZXIgKHNlZ21lbnQpIC0+IHNlZ21lbnRcbiAgICBwcm9wZXJ0eSA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdXG4gICAgcHJvcGVydHlDb21wbGV0aW9ucyA9IEBjb21wbGV0aW9uc1twcm9wZXJ0eV0/LmNvbXBsZXRpb25zID8gW11cbiAgICBmb3IgY29tcGxldGlvbiBpbiBwcm9wZXJ0eUNvbXBsZXRpb25zIHdoZW4gbm90IHByZWZpeCBvciBmaXJzdENoYXJzRXF1YWwoY29tcGxldGlvbi5uYW1lLCBwcmVmaXgpXG4gICAgICBjb21wbGV0aW9ucy5wdXNoKGNsb25lKGNvbXBsZXRpb24pKVxuICAgIGNvbXBsZXRpb25zXG5cbiAgZ2V0UHJvcGVydHlDbGFzczogKG5hbWUpIC0+XG4gICAgYXRvbVtuYW1lXT8uY29uc3RydWN0b3I/Lm5hbWVcblxuICBsb2FkUHJvcGVydHk6IChwcm9wZXJ0eU5hbWUsIGNsYXNzTmFtZSwgY2xhc3NlcywgcGFyZW50KSAtPlxuICAgIGNsYXNzQ29tcGxldGlvbnMgPSBjbGFzc2VzW2NsYXNzTmFtZV1cbiAgICByZXR1cm4gdW5sZXNzIGNsYXNzQ29tcGxldGlvbnM/XG5cbiAgICBAY29tcGxldGlvbnNbcHJvcGVydHlOYW1lXSA9IGNvbXBsZXRpb25zOiBbXVxuXG4gICAgZm9yIGNvbXBsZXRpb24gaW4gY2xhc3NDb21wbGV0aW9uc1xuICAgICAgQGNvbXBsZXRpb25zW3Byb3BlcnR5TmFtZV0uY29tcGxldGlvbnMucHVzaChjb21wbGV0aW9uKVxuICAgICAgaWYgY29tcGxldGlvbi50eXBlIGlzICdwcm9wZXJ0eSdcbiAgICAgICAgcHJvcGVydHlDbGFzcyA9IEBnZXRQcm9wZXJ0eUNsYXNzKGNvbXBsZXRpb24ubmFtZSlcbiAgICAgICAgQGxvYWRQcm9wZXJ0eShjb21wbGV0aW9uLm5hbWUsIHByb3BlcnR5Q2xhc3MsIGNsYXNzZXMpXG4gICAgcmV0dXJuXG5cbmNsb25lID0gKG9iaikgLT5cbiAgbmV3T2JqID0ge31cbiAgbmV3T2JqW2tdID0gdiBmb3IgaywgdiBvZiBvYmpcbiAgbmV3T2JqXG5cbmZpcnN0Q2hhcnNFcXVhbCA9IChzdHIxLCBzdHIyKSAtPlxuICBzdHIxWzBdLnRvTG93ZXJDYXNlKCkgaXMgc3RyMlswXS50b0xvd2VyQ2FzZSgpXG4iXX0=
