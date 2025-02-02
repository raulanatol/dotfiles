(function() {
  var DefaultFileIcons, fs, path;

  fs = require('fs-plus');

  path = require('path');

  DefaultFileIcons = (function() {
    function DefaultFileIcons() {}

    DefaultFileIcons.prototype.iconClassForPath = function(filePath) {
      var extension;
      extension = path.extname(filePath);
      if (fs.isSymbolicLinkSync(filePath)) {
        return 'icon-file-symlink-file';
      } else if (fs.isReadmePath(filePath)) {
        return 'icon-book';
      } else if (fs.isCompressedExtension(extension)) {
        return 'icon-file-zip';
      } else if (fs.isImageExtension(extension)) {
        return 'icon-file-media';
      } else if (fs.isPdfExtension(extension)) {
        return 'icon-file-pdf';
      } else if (fs.isBinaryExtension(extension)) {
        return 'icon-file-binary';
      } else {
        return 'icon-file-text';
      }
    };

    return DefaultFileIcons;

  })();

  module.exports = new DefaultFileIcons;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvdHJlZS12aWV3L2xpYi9kZWZhdWx0LWZpbGUtaWNvbnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVEOzs7K0JBQ0osZ0JBQUEsR0FBa0IsU0FBQyxRQUFEO0FBQ2hCLFVBQUE7TUFBQSxTQUFBLEdBQVksSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiO01BRVosSUFBRyxFQUFFLENBQUMsa0JBQUgsQ0FBc0IsUUFBdEIsQ0FBSDtlQUNFLHlCQURGO09BQUEsTUFFSyxJQUFHLEVBQUUsQ0FBQyxZQUFILENBQWdCLFFBQWhCLENBQUg7ZUFDSCxZQURHO09BQUEsTUFFQSxJQUFHLEVBQUUsQ0FBQyxxQkFBSCxDQUF5QixTQUF6QixDQUFIO2VBQ0gsZ0JBREc7T0FBQSxNQUVBLElBQUcsRUFBRSxDQUFDLGdCQUFILENBQW9CLFNBQXBCLENBQUg7ZUFDSCxrQkFERztPQUFBLE1BRUEsSUFBRyxFQUFFLENBQUMsY0FBSCxDQUFrQixTQUFsQixDQUFIO2VBQ0gsZ0JBREc7T0FBQSxNQUVBLElBQUcsRUFBRSxDQUFDLGlCQUFILENBQXFCLFNBQXJCLENBQUg7ZUFDSCxtQkFERztPQUFBLE1BQUE7ZUFHSCxpQkFIRzs7SUFiVzs7Ozs7O0VBa0JwQixNQUFNLENBQUMsT0FBUCxHQUFpQixJQUFJO0FBdEJyQiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5jbGFzcyBEZWZhdWx0RmlsZUljb25zXG4gIGljb25DbGFzc0ZvclBhdGg6IChmaWxlUGF0aCkgLT5cbiAgICBleHRlbnNpb24gPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpXG5cbiAgICBpZiBmcy5pc1N5bWJvbGljTGlua1N5bmMoZmlsZVBhdGgpXG4gICAgICAnaWNvbi1maWxlLXN5bWxpbmstZmlsZSdcbiAgICBlbHNlIGlmIGZzLmlzUmVhZG1lUGF0aChmaWxlUGF0aClcbiAgICAgICdpY29uLWJvb2snXG4gICAgZWxzZSBpZiBmcy5pc0NvbXByZXNzZWRFeHRlbnNpb24oZXh0ZW5zaW9uKVxuICAgICAgJ2ljb24tZmlsZS16aXAnXG4gICAgZWxzZSBpZiBmcy5pc0ltYWdlRXh0ZW5zaW9uKGV4dGVuc2lvbilcbiAgICAgICdpY29uLWZpbGUtbWVkaWEnXG4gICAgZWxzZSBpZiBmcy5pc1BkZkV4dGVuc2lvbihleHRlbnNpb24pXG4gICAgICAnaWNvbi1maWxlLXBkZidcbiAgICBlbHNlIGlmIGZzLmlzQmluYXJ5RXh0ZW5zaW9uKGV4dGVuc2lvbilcbiAgICAgICdpY29uLWZpbGUtYmluYXJ5J1xuICAgIGVsc2VcbiAgICAgICdpY29uLWZpbGUtdGV4dCdcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRGVmYXVsdEZpbGVJY29uc1xuIl19
