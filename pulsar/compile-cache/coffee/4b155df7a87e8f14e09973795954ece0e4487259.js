(function() {
  var Bookmarks, BookmarksView, CompositeDisposable, ReactBookmarks, disposables, editorsBookmarks;

  CompositeDisposable = require('atom').CompositeDisposable;

  Bookmarks = null;

  ReactBookmarks = null;

  BookmarksView = require('./bookmarks-view');

  editorsBookmarks = null;

  disposables = null;

  module.exports = {
    activate: function(bookmarksByEditorId) {
      var bookmarksView, watchedEditors;
      editorsBookmarks = [];
      watchedEditors = new WeakSet();
      bookmarksView = null;
      disposables = new CompositeDisposable;
      atom.commands.add('atom-workspace', 'bookmarks:view-all', function() {
        if (bookmarksView == null) {
          bookmarksView = new BookmarksView(editorsBookmarks);
        }
        return bookmarksView.show();
      });
      return atom.workspace.observeTextEditors(function(textEditor) {
        var bookmarks, state;
        if (watchedEditors.has(textEditor)) {
          return;
        }
        if (Bookmarks == null) {
          Bookmarks = require('./bookmarks');
        }
        if (state = bookmarksByEditorId[textEditor.id]) {
          bookmarks = Bookmarks.deserialize(textEditor, state);
        } else {
          bookmarks = new Bookmarks(textEditor);
        }
        editorsBookmarks.push(bookmarks);
        watchedEditors.add(textEditor);
        return disposables.add(textEditor.onDidDestroy(function() {
          var index;
          index = editorsBookmarks.indexOf(bookmarks);
          if (index !== -1) {
            editorsBookmarks.splice(index, 1);
          }
          bookmarks.destroy();
          return watchedEditors["delete"](textEditor);
        }));
      });
    },
    deactivate: function() {
      var bookmarks, i, len;
      if (typeof bookmarksView !== "undefined" && bookmarksView !== null) {
        bookmarksView.destroy();
      }
      for (i = 0, len = editorsBookmarks.length; i < len; i++) {
        bookmarks = editorsBookmarks[i];
        bookmarks.deactivate();
      }
      return disposables.dispose();
    },
    serialize: function() {
      var bookmarks, bookmarksByEditorId, i, len;
      bookmarksByEditorId = {};
      for (i = 0, len = editorsBookmarks.length; i < len; i++) {
        bookmarks = editorsBookmarks[i];
        bookmarksByEditorId[bookmarks.editor.id] = bookmarks.serialize();
      }
      return bookmarksByEditorId;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYm9va21hcmtzL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixTQUFBLEdBQVk7O0VBQ1osY0FBQSxHQUFpQjs7RUFDakIsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVI7O0VBQ2hCLGdCQUFBLEdBQW1COztFQUNuQixXQUFBLEdBQWM7O0VBRWQsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxTQUFDLG1CQUFEO0FBQ1IsVUFBQTtNQUFBLGdCQUFBLEdBQW1CO01BQ25CLGNBQUEsR0FBaUIsSUFBSSxPQUFKLENBQUE7TUFDakIsYUFBQSxHQUFnQjtNQUNoQixXQUFBLEdBQWMsSUFBSTtNQUVsQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ0Usb0JBREYsRUFDd0IsU0FBQTs7VUFDcEIsZ0JBQWlCLElBQUksYUFBSixDQUFrQixnQkFBbEI7O2VBQ2pCLGFBQWEsQ0FBQyxJQUFkLENBQUE7TUFGb0IsQ0FEeEI7YUFLQSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLFNBQUMsVUFBRDtBQUNoQyxZQUFBO1FBQUEsSUFBVSxjQUFjLENBQUMsR0FBZixDQUFtQixVQUFuQixDQUFWO0FBQUEsaUJBQUE7OztVQUVBLFlBQWEsT0FBQSxDQUFRLGFBQVI7O1FBQ2IsSUFBRyxLQUFBLEdBQVEsbUJBQW9CLENBQUEsVUFBVSxDQUFDLEVBQVgsQ0FBL0I7VUFDRSxTQUFBLEdBQVksU0FBUyxDQUFDLFdBQVYsQ0FBc0IsVUFBdEIsRUFBa0MsS0FBbEMsRUFEZDtTQUFBLE1BQUE7VUFHRSxTQUFBLEdBQVksSUFBSSxTQUFKLENBQWMsVUFBZCxFQUhkOztRQUlBLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLFNBQXRCO1FBQ0EsY0FBYyxDQUFDLEdBQWYsQ0FBbUIsVUFBbkI7ZUFDQSxXQUFXLENBQUMsR0FBWixDQUFnQixVQUFVLENBQUMsWUFBWCxDQUF3QixTQUFBO0FBQ3RDLGNBQUE7VUFBQSxLQUFBLEdBQVEsZ0JBQWdCLENBQUMsT0FBakIsQ0FBeUIsU0FBekI7VUFDUixJQUFxQyxLQUFBLEtBQVcsQ0FBQyxDQUFqRDtZQUFBLGdCQUFnQixDQUFDLE1BQWpCLENBQXdCLEtBQXhCLEVBQStCLENBQS9CLEVBQUE7O1VBQ0EsU0FBUyxDQUFDLE9BQVYsQ0FBQTtpQkFDQSxjQUFjLEVBQUMsTUFBRCxFQUFkLENBQXNCLFVBQXRCO1FBSnNDLENBQXhCLENBQWhCO01BVmdDLENBQWxDO0lBWFEsQ0FBVjtJQTJCQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7O1FBQUEsYUFBYSxDQUFFLE9BQWYsQ0FBQTs7QUFDQSxXQUFBLGtEQUFBOztRQUFBLFNBQVMsQ0FBQyxVQUFWLENBQUE7QUFBQTthQUNBLFdBQVcsQ0FBQyxPQUFaLENBQUE7SUFIVSxDQTNCWjtJQWdDQSxTQUFBLEVBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxtQkFBQSxHQUFzQjtBQUN0QixXQUFBLGtEQUFBOztRQUNFLG1CQUFvQixDQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBakIsQ0FBcEIsR0FBMkMsU0FBUyxDQUFDLFNBQVYsQ0FBQTtBQUQ3QzthQUVBO0lBSlMsQ0FoQ1g7O0FBVEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5Cb29rbWFya3MgPSBudWxsXG5SZWFjdEJvb2ttYXJrcyA9IG51bGxcbkJvb2ttYXJrc1ZpZXcgPSByZXF1aXJlICcuL2Jvb2ttYXJrcy12aWV3J1xuZWRpdG9yc0Jvb2ttYXJrcyA9IG51bGxcbmRpc3Bvc2FibGVzID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGFjdGl2YXRlOiAoYm9va21hcmtzQnlFZGl0b3JJZCkgLT5cbiAgICBlZGl0b3JzQm9va21hcmtzID0gW11cbiAgICB3YXRjaGVkRWRpdG9ycyA9IG5ldyBXZWFrU2V0KClcbiAgICBib29rbWFya3NWaWV3ID0gbnVsbFxuICAgIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnYm9va21hcmtzOnZpZXctYWxsJywgLT5cbiAgICAgICAgYm9va21hcmtzVmlldyA/PSBuZXcgQm9va21hcmtzVmlldyhlZGl0b3JzQm9va21hcmtzKVxuICAgICAgICBib29rbWFya3NWaWV3LnNob3coKVxuXG4gICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzICh0ZXh0RWRpdG9yKSAtPlxuICAgICAgcmV0dXJuIGlmIHdhdGNoZWRFZGl0b3JzLmhhcyh0ZXh0RWRpdG9yKVxuXG4gICAgICBCb29rbWFya3MgPz0gcmVxdWlyZSAnLi9ib29rbWFya3MnXG4gICAgICBpZiBzdGF0ZSA9IGJvb2ttYXJrc0J5RWRpdG9ySWRbdGV4dEVkaXRvci5pZF1cbiAgICAgICAgYm9va21hcmtzID0gQm9va21hcmtzLmRlc2VyaWFsaXplKHRleHRFZGl0b3IsIHN0YXRlKVxuICAgICAgZWxzZVxuICAgICAgICBib29rbWFya3MgPSBuZXcgQm9va21hcmtzKHRleHRFZGl0b3IpXG4gICAgICBlZGl0b3JzQm9va21hcmtzLnB1c2goYm9va21hcmtzKVxuICAgICAgd2F0Y2hlZEVkaXRvcnMuYWRkKHRleHRFZGl0b3IpXG4gICAgICBkaXNwb3NhYmxlcy5hZGQgdGV4dEVkaXRvci5vbkRpZERlc3Ryb3kgLT5cbiAgICAgICAgaW5kZXggPSBlZGl0b3JzQm9va21hcmtzLmluZGV4T2YoYm9va21hcmtzKVxuICAgICAgICBlZGl0b3JzQm9va21hcmtzLnNwbGljZShpbmRleCwgMSkgaWYgaW5kZXggaXNudCAtMVxuICAgICAgICBib29rbWFya3MuZGVzdHJveSgpXG4gICAgICAgIHdhdGNoZWRFZGl0b3JzLmRlbGV0ZSh0ZXh0RWRpdG9yKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgYm9va21hcmtzVmlldz8uZGVzdHJveSgpXG4gICAgYm9va21hcmtzLmRlYWN0aXZhdGUoKSBmb3IgYm9va21hcmtzIGluIGVkaXRvcnNCb29rbWFya3NcbiAgICBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICBzZXJpYWxpemU6IC0+XG4gICAgYm9va21hcmtzQnlFZGl0b3JJZCA9IHt9XG4gICAgZm9yIGJvb2ttYXJrcyBpbiBlZGl0b3JzQm9va21hcmtzXG4gICAgICBib29rbWFya3NCeUVkaXRvcklkW2Jvb2ttYXJrcy5lZGl0b3IuaWRdID0gYm9va21hcmtzLnNlcmlhbGl6ZSgpXG4gICAgYm9va21hcmtzQnlFZGl0b3JJZFxuIl19
