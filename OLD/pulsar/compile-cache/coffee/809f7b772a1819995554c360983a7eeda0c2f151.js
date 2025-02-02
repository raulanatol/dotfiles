(function() {
  var path;

  path = require("path");

  module.exports = {
    repoForPath: function(goalPath) {
      var i, j, len, projectPath, ref;
      ref = atom.project.getPaths();
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        projectPath = ref[i];
        if (goalPath === projectPath || goalPath.indexOf(projectPath + path.sep) === 0) {
          return atom.project.getRepositories()[i];
        }
      }
      return null;
    },
    getStyleObject: function(el) {
      var camelizedAttr, property, styleObject, styleProperties, value;
      styleProperties = window.getComputedStyle(el);
      styleObject = {};
      for (property in styleProperties) {
        value = styleProperties.getPropertyValue(property);
        camelizedAttr = property.replace(/\-([a-z])/g, function(a, b) {
          return b.toUpperCase();
        });
        styleObject[camelizedAttr] = value;
      }
      return styleObject;
    },
    getFullExtension: function(filePath) {
      var basename, position;
      basename = path.basename(filePath);
      position = basename.indexOf('.');
      if (position > 0) {
        return basename.slice(position);
      } else {
        return '';
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvdHJlZS12aWV3L2xpYi9oZWxwZXJzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxXQUFBLEVBQWEsU0FBQyxRQUFEO0FBQ1gsVUFBQTtBQUFBO0FBQUEsV0FBQSw2Q0FBQTs7UUFDRSxJQUFHLFFBQUEsS0FBWSxXQUFaLElBQTJCLFFBQVEsQ0FBQyxPQUFULENBQWlCLFdBQUEsR0FBYyxJQUFJLENBQUMsR0FBcEMsQ0FBQSxLQUE0QyxDQUExRTtBQUNFLGlCQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBYixDQUFBLENBQStCLENBQUEsQ0FBQSxFQUR4Qzs7QUFERjthQUdBO0lBSlcsQ0FBYjtJQU1BLGNBQUEsRUFBZ0IsU0FBQyxFQUFEO0FBQ2QsVUFBQTtNQUFBLGVBQUEsR0FBa0IsTUFBTSxDQUFDLGdCQUFQLENBQXdCLEVBQXhCO01BQ2xCLFdBQUEsR0FBYztBQUNkLFdBQUEsMkJBQUE7UUFDRSxLQUFBLEdBQVEsZUFBZSxDQUFDLGdCQUFoQixDQUFpQyxRQUFqQztRQUNSLGFBQUEsR0FBZ0IsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsWUFBakIsRUFBK0IsU0FBQyxDQUFELEVBQUksQ0FBSjtpQkFBVSxDQUFDLENBQUMsV0FBRixDQUFBO1FBQVYsQ0FBL0I7UUFDaEIsV0FBWSxDQUFBLGFBQUEsQ0FBWixHQUE2QjtBQUgvQjthQUlBO0lBUGMsQ0FOaEI7SUFlQSxnQkFBQSxFQUFrQixTQUFDLFFBQUQ7QUFDaEIsVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBTCxDQUFjLFFBQWQ7TUFDWCxRQUFBLEdBQVcsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsR0FBakI7TUFDWCxJQUFHLFFBQUEsR0FBVyxDQUFkO2VBQXFCLFFBQVMsaUJBQTlCO09BQUEsTUFBQTtlQUErQyxHQUEvQzs7SUFIZ0IsQ0FmbEI7O0FBSEYiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSBcInBhdGhcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHJlcG9Gb3JQYXRoOiAoZ29hbFBhdGgpIC0+XG4gICAgZm9yIHByb2plY3RQYXRoLCBpIGluIGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgICBpZiBnb2FsUGF0aCBpcyBwcm9qZWN0UGF0aCBvciBnb2FsUGF0aC5pbmRleE9mKHByb2plY3RQYXRoICsgcGF0aC5zZXApIGlzIDBcbiAgICAgICAgcmV0dXJuIGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKVtpXVxuICAgIG51bGxcblxuICBnZXRTdHlsZU9iamVjdDogKGVsKSAtPlxuICAgIHN0eWxlUHJvcGVydGllcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKVxuICAgIHN0eWxlT2JqZWN0ID0ge31cbiAgICBmb3IgcHJvcGVydHkgb2Ygc3R5bGVQcm9wZXJ0aWVzXG4gICAgICB2YWx1ZSA9IHN0eWxlUHJvcGVydGllcy5nZXRQcm9wZXJ0eVZhbHVlIHByb3BlcnR5XG4gICAgICBjYW1lbGl6ZWRBdHRyID0gcHJvcGVydHkucmVwbGFjZSAvXFwtKFthLXpdKS9nLCAoYSwgYikgLT4gYi50b1VwcGVyQ2FzZSgpXG4gICAgICBzdHlsZU9iamVjdFtjYW1lbGl6ZWRBdHRyXSA9IHZhbHVlXG4gICAgc3R5bGVPYmplY3RcblxuICBnZXRGdWxsRXh0ZW5zaW9uOiAoZmlsZVBhdGgpIC0+XG4gICAgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKVxuICAgIHBvc2l0aW9uID0gYmFzZW5hbWUuaW5kZXhPZignLicpXG4gICAgaWYgcG9zaXRpb24gPiAwIHRoZW4gYmFzZW5hbWVbcG9zaXRpb24uLl0gZWxzZSAnJ1xuIl19
