(function() {
  var Emitter, FindOptions, Params, _, escapeRegExp;

  _ = require('underscore-plus');

  Emitter = require('atom').Emitter;

  Params = ['findPattern', 'replacePattern', 'pathsPattern', 'useRegex', 'wholeWord', 'caseSensitive', 'inCurrentSelection', 'leadingContextLineCount', 'trailingContextLineCount'];

  module.exports = FindOptions = (function() {
    function FindOptions(state) {
      var ref, ref1, ref10, ref11, ref12, ref13, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
      if (state == null) {
        state = {};
      }
      this.emitter = new Emitter;
      this.findPattern = '';
      this.replacePattern = (ref = state.replacePattern) != null ? ref : '';
      this.pathsPattern = (ref1 = state.pathsPattern) != null ? ref1 : '';
      this.useRegex = (ref2 = (ref3 = state.useRegex) != null ? ref3 : atom.config.get('find-and-replace.useRegex')) != null ? ref2 : false;
      this.caseSensitive = (ref4 = (ref5 = state.caseSensitive) != null ? ref5 : atom.config.get('find-and-replace.caseSensitive')) != null ? ref4 : false;
      this.wholeWord = (ref6 = (ref7 = state.wholeWord) != null ? ref7 : atom.config.get('find-and-replace.wholeWord')) != null ? ref6 : false;
      this.inCurrentSelection = (ref8 = (ref9 = state.inCurrentSelection) != null ? ref9 : atom.config.get('find-and-replace.inCurrentSelection')) != null ? ref8 : false;
      this.leadingContextLineCount = (ref10 = (ref11 = state.leadingContextLineCount) != null ? ref11 : atom.config.get('find-and-replace.leadingContextLineCount')) != null ? ref10 : 0;
      this.trailingContextLineCount = (ref12 = (ref13 = state.trailingContextLineCount) != null ? ref13 : atom.config.get('find-and-replace.trailingContextLineCount')) != null ? ref12 : 0;
    }

    FindOptions.prototype.onDidChange = function(callback) {
      return this.emitter.on('did-change', callback);
    };

    FindOptions.prototype.onDidChangeUseRegex = function(callback) {
      return this.emitter.on('did-change-useRegex', callback);
    };

    FindOptions.prototype.onDidChangeReplacePattern = function(callback) {
      return this.emitter.on('did-change-replacePattern', callback);
    };

    FindOptions.prototype.serialize = function() {
      var j, len, param, result;
      result = {};
      for (j = 0, len = Params.length; j < len; j++) {
        param = Params[j];
        result[param] = this[param];
      }
      return result;
    };

    FindOptions.prototype.set = function(newParams) {
      var changedParams, j, key, len, param, val;
      if (newParams == null) {
        newParams = {};
      }
      changedParams = {};
      for (j = 0, len = Params.length; j < len; j++) {
        key = Params[j];
        if ((newParams[key] != null) && newParams[key] !== this[key]) {
          if (changedParams == null) {
            changedParams = {};
          }
          this[key] = changedParams[key] = newParams[key];
        }
      }
      if (Object.keys(changedParams).length) {
        for (param in changedParams) {
          val = changedParams[param];
          this.emitter.emit("did-change-" + param);
        }
        this.emitter.emit('did-change', changedParams);
      }
      return changedParams;
    };

    FindOptions.prototype.getFindPatternRegex = function(forceUnicode) {
      var expression, flags, i, j, ref;
      if (forceUnicode == null) {
        forceUnicode = false;
      }
      for (i = j = 0, ref = this.findPattern.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        if (this.findPattern.charCodeAt(i) > 128) {
          forceUnicode = true;
          break;
        }
      }
      flags = 'gm';
      if (!this.caseSensitive) {
        flags += 'i';
      }
      if (forceUnicode) {
        flags += 'u';
      }
      if (this.useRegex) {
        expression = this.findPattern;
      } else {
        expression = escapeRegExp(this.findPattern);
      }
      if (this.wholeWord) {
        expression = "\\b" + expression + "\\b";
      }
      return new RegExp(expression, flags);
    };

    return FindOptions;

  })();

  escapeRegExp = function(string) {
    return string.replace(/[\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvZmluZC1hbmQtcmVwbGFjZS9saWIvZmluZC1vcHRpb25zLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSCxVQUFXLE9BQUEsQ0FBUSxNQUFSOztFQUVaLE1BQUEsR0FBUyxDQUNQLGFBRE8sRUFFUCxnQkFGTyxFQUdQLGNBSE8sRUFJUCxVQUpPLEVBS1AsV0FMTyxFQU1QLGVBTk8sRUFPUCxvQkFQTyxFQVFQLHlCQVJPLEVBU1AsMEJBVE87O0VBWVQsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHFCQUFDLEtBQUQ7QUFDWCxVQUFBOztRQURZLFFBQU07O01BQ2xCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLElBQUMsQ0FBQSxXQUFELEdBQWU7TUFDZixJQUFDLENBQUEsY0FBRCxnREFBeUM7TUFDekMsSUFBQyxDQUFBLFlBQUQsZ0RBQXFDO01BQ3JDLElBQUMsQ0FBQSxRQUFELG1IQUE0RTtNQUM1RSxJQUFDLENBQUEsYUFBRCw2SEFBMkY7TUFDM0YsSUFBQyxDQUFBLFNBQUQscUhBQStFO01BQy9FLElBQUMsQ0FBQSxrQkFBRCx1SUFBMEc7TUFDMUcsSUFBQyxDQUFBLHVCQUFELHFKQUF5SDtNQUN6SCxJQUFDLENBQUEsd0JBQUQsdUpBQTRIO0lBWGpIOzswQkFhYixXQUFBLEdBQWEsU0FBQyxRQUFEO2FBQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixRQUExQjtJQURXOzswQkFHYixtQkFBQSxHQUFxQixTQUFDLFFBQUQ7YUFDbkIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVkscUJBQVosRUFBbUMsUUFBbkM7SUFEbUI7OzBCQUdyQix5QkFBQSxHQUEyQixTQUFDLFFBQUQ7YUFDekIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksMkJBQVosRUFBeUMsUUFBekM7SUFEeUI7OzBCQUczQixTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxNQUFBLEdBQVM7QUFDVCxXQUFBLHdDQUFBOztRQUNFLE1BQU8sQ0FBQSxLQUFBLENBQVAsR0FBZ0IsSUFBSyxDQUFBLEtBQUE7QUFEdkI7YUFFQTtJQUpTOzswQkFNWCxHQUFBLEdBQUssU0FBQyxTQUFEO0FBQ0gsVUFBQTs7UUFESSxZQUFVOztNQUNkLGFBQUEsR0FBZ0I7QUFDaEIsV0FBQSx3Q0FBQTs7UUFDRSxJQUFHLHdCQUFBLElBQW9CLFNBQVUsQ0FBQSxHQUFBLENBQVYsS0FBb0IsSUFBSyxDQUFBLEdBQUEsQ0FBaEQ7O1lBQ0UsZ0JBQWlCOztVQUNqQixJQUFLLENBQUEsR0FBQSxDQUFMLEdBQVksYUFBYyxDQUFBLEdBQUEsQ0FBZCxHQUFxQixTQUFVLENBQUEsR0FBQSxFQUY3Qzs7QUFERjtNQUtBLElBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxhQUFaLENBQTBCLENBQUMsTUFBOUI7QUFDRSxhQUFBLHNCQUFBOztVQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGFBQUEsR0FBYyxLQUE1QjtBQURGO1FBRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsWUFBZCxFQUE0QixhQUE1QixFQUhGOztBQUlBLGFBQU87SUFYSjs7MEJBYUwsbUJBQUEsR0FBcUIsU0FBQyxZQUFEO0FBQ25CLFVBQUE7O1FBRG9CLGVBQWU7O0FBQ25DLFdBQVMsa0dBQVQ7UUFDRSxJQUFHLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUF3QixDQUF4QixDQUFBLEdBQTZCLEdBQWhDO1VBQ0UsWUFBQSxHQUFlO0FBQ2YsZ0JBRkY7O0FBREY7TUFLQSxLQUFBLEdBQVE7TUFDUixJQUFBLENBQW9CLElBQUMsQ0FBQSxhQUFyQjtRQUFBLEtBQUEsSUFBUyxJQUFUOztNQUNBLElBQWdCLFlBQWhCO1FBQUEsS0FBQSxJQUFTLElBQVQ7O01BRUEsSUFBRyxJQUFDLENBQUEsUUFBSjtRQUNFLFVBQUEsR0FBYSxJQUFDLENBQUEsWUFEaEI7T0FBQSxNQUFBO1FBR0UsVUFBQSxHQUFhLFlBQUEsQ0FBYSxJQUFDLENBQUEsV0FBZCxFQUhmOztNQUtBLElBQXNDLElBQUMsQ0FBQSxTQUF2QztRQUFBLFVBQUEsR0FBYSxLQUFBLEdBQU0sVUFBTixHQUFpQixNQUE5Qjs7YUFFQSxJQUFJLE1BQUosQ0FBVyxVQUFYLEVBQXVCLEtBQXZCO0lBakJtQjs7Ozs7O0VBdUJ2QixZQUFBLEdBQWUsU0FBQyxNQUFEO1dBQ2IsTUFBTSxDQUFDLE9BQVAsQ0FBZSx1QkFBZixFQUF3QyxNQUF4QztFQURhO0FBakZmIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cblBhcmFtcyA9IFtcbiAgJ2ZpbmRQYXR0ZXJuJ1xuICAncmVwbGFjZVBhdHRlcm4nXG4gICdwYXRoc1BhdHRlcm4nXG4gICd1c2VSZWdleCdcbiAgJ3dob2xlV29yZCdcbiAgJ2Nhc2VTZW5zaXRpdmUnXG4gICdpbkN1cnJlbnRTZWxlY3Rpb24nXG4gICdsZWFkaW5nQ29udGV4dExpbmVDb3VudCdcbiAgJ3RyYWlsaW5nQ29udGV4dExpbmVDb3VudCdcbl1cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRmluZE9wdGlvbnNcbiAgY29uc3RydWN0b3I6IChzdGF0ZT17fSkgLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG5cbiAgICBAZmluZFBhdHRlcm4gPSAnJ1xuICAgIEByZXBsYWNlUGF0dGVybiA9IHN0YXRlLnJlcGxhY2VQYXR0ZXJuID8gJydcbiAgICBAcGF0aHNQYXR0ZXJuID0gc3RhdGUucGF0aHNQYXR0ZXJuID8gJydcbiAgICBAdXNlUmVnZXggPSBzdGF0ZS51c2VSZWdleCA/IGF0b20uY29uZmlnLmdldCgnZmluZC1hbmQtcmVwbGFjZS51c2VSZWdleCcpID8gZmFsc2VcbiAgICBAY2FzZVNlbnNpdGl2ZSA9IHN0YXRlLmNhc2VTZW5zaXRpdmUgPyBhdG9tLmNvbmZpZy5nZXQoJ2ZpbmQtYW5kLXJlcGxhY2UuY2FzZVNlbnNpdGl2ZScpID8gZmFsc2VcbiAgICBAd2hvbGVXb3JkID0gc3RhdGUud2hvbGVXb3JkID8gYXRvbS5jb25maWcuZ2V0KCdmaW5kLWFuZC1yZXBsYWNlLndob2xlV29yZCcpID8gZmFsc2VcbiAgICBAaW5DdXJyZW50U2VsZWN0aW9uID0gc3RhdGUuaW5DdXJyZW50U2VsZWN0aW9uID8gYXRvbS5jb25maWcuZ2V0KCdmaW5kLWFuZC1yZXBsYWNlLmluQ3VycmVudFNlbGVjdGlvbicpID8gZmFsc2VcbiAgICBAbGVhZGluZ0NvbnRleHRMaW5lQ291bnQgPSBzdGF0ZS5sZWFkaW5nQ29udGV4dExpbmVDb3VudCA/IGF0b20uY29uZmlnLmdldCgnZmluZC1hbmQtcmVwbGFjZS5sZWFkaW5nQ29udGV4dExpbmVDb3VudCcpID8gMFxuICAgIEB0cmFpbGluZ0NvbnRleHRMaW5lQ291bnQgPSBzdGF0ZS50cmFpbGluZ0NvbnRleHRMaW5lQ291bnQgPyBhdG9tLmNvbmZpZy5nZXQoJ2ZpbmQtYW5kLXJlcGxhY2UudHJhaWxpbmdDb250ZXh0TGluZUNvdW50JykgPyAwXG5cbiAgb25EaWRDaGFuZ2U6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbignZGlkLWNoYW5nZScsIGNhbGxiYWNrKVxuXG4gIG9uRGlkQ2hhbmdlVXNlUmVnZXg6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbignZGlkLWNoYW5nZS11c2VSZWdleCcsIGNhbGxiYWNrKVxuXG4gIG9uRGlkQ2hhbmdlUmVwbGFjZVBhdHRlcm46IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbignZGlkLWNoYW5nZS1yZXBsYWNlUGF0dGVybicsIGNhbGxiYWNrKVxuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICByZXN1bHQgPSB7fVxuICAgIGZvciBwYXJhbSBpbiBQYXJhbXNcbiAgICAgIHJlc3VsdFtwYXJhbV0gPSB0aGlzW3BhcmFtXVxuICAgIHJlc3VsdFxuXG4gIHNldDogKG5ld1BhcmFtcz17fSkgLT5cbiAgICBjaGFuZ2VkUGFyYW1zID0ge31cbiAgICBmb3Iga2V5IGluIFBhcmFtc1xuICAgICAgaWYgbmV3UGFyYW1zW2tleV0/IGFuZCBuZXdQYXJhbXNba2V5XSBpc250IHRoaXNba2V5XVxuICAgICAgICBjaGFuZ2VkUGFyYW1zID89IHt9XG4gICAgICAgIHRoaXNba2V5XSA9IGNoYW5nZWRQYXJhbXNba2V5XSA9IG5ld1BhcmFtc1trZXldXG5cbiAgICBpZiBPYmplY3Qua2V5cyhjaGFuZ2VkUGFyYW1zKS5sZW5ndGhcbiAgICAgIGZvciBwYXJhbSwgdmFsIG9mIGNoYW5nZWRQYXJhbXNcbiAgICAgICAgQGVtaXR0ZXIuZW1pdChcImRpZC1jaGFuZ2UtI3twYXJhbX1cIilcbiAgICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UnLCBjaGFuZ2VkUGFyYW1zKVxuICAgIHJldHVybiBjaGFuZ2VkUGFyYW1zXG5cbiAgZ2V0RmluZFBhdHRlcm5SZWdleDogKGZvcmNlVW5pY29kZSA9IGZhbHNlKSAtPlxuICAgIGZvciBpIGluIFswLi5AZmluZFBhdHRlcm4ubGVuZ3RoXVxuICAgICAgaWYgQGZpbmRQYXR0ZXJuLmNoYXJDb2RlQXQoaSkgPiAxMjhcbiAgICAgICAgZm9yY2VVbmljb2RlID0gdHJ1ZVxuICAgICAgICBicmVha1xuXG4gICAgZmxhZ3MgPSAnZ20nXG4gICAgZmxhZ3MgKz0gJ2knIHVubGVzcyBAY2FzZVNlbnNpdGl2ZVxuICAgIGZsYWdzICs9ICd1JyBpZiBmb3JjZVVuaWNvZGVcblxuICAgIGlmIEB1c2VSZWdleFxuICAgICAgZXhwcmVzc2lvbiA9IEBmaW5kUGF0dGVyblxuICAgIGVsc2VcbiAgICAgIGV4cHJlc3Npb24gPSBlc2NhcGVSZWdFeHAoQGZpbmRQYXR0ZXJuKVxuXG4gICAgZXhwcmVzc2lvbiA9IFwiXFxcXGIje2V4cHJlc3Npb259XFxcXGJcIiBpZiBAd2hvbGVXb3JkXG5cbiAgICBuZXcgUmVnRXhwKGV4cHJlc3Npb24sIGZsYWdzKVxuXG4jIFRoaXMgaXMgZGlmZmVyZW50IGZyb20gXy5lc2NhcGVSZWdFeHAsIHdoaWNoIGVzY2FwZXMgZGFzaGVzLiBFc2NhcGVkIGRhc2hlc1xuIyBhcmUgbm90IGFsbG93ZWQgb3V0c2lkZSBvZiBjaGFyYWN0ZXIgY2xhc3NlcyBpbiBSZWdFeHBzIHdpdGggdGhlIGB1YCBmbGFnLlxuI1xuIyBTZWUgYXRvbS9maW5kLWFuZC1yZXBsYWNlIzEwMjJcbmVzY2FwZVJlZ0V4cCA9IChzdHJpbmcpIC0+XG4gIHN0cmluZy5yZXBsYWNlKC9bXFwvXFxcXF4kKis/LigpfFtcXF17fV0vZywgJ1xcXFwkJicpXG4iXX0=
