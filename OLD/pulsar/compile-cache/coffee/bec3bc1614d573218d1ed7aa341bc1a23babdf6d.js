(function() {
  var CompositeDisposable, GitRepositoryAsync, GitView, _, ref;

  _ = require("underscore-plus");

  ref = require("atom"), CompositeDisposable = ref.CompositeDisposable, GitRepositoryAsync = ref.GitRepositoryAsync;

  module.exports = GitView = (function() {
    function GitView() {
      this.element = document.createElement('status-bar-git');
      this.element.classList.add('git-view');
      this.createBranchArea();
      this.createCommitsArea();
      this.createStatusArea();
      this.activeItemSubscription = atom.workspace.getCenter().onDidChangeActivePaneItem((function(_this) {
        return function() {
          return _this.subscribeToActiveItem();
        };
      })(this));
      this.projectPathSubscription = atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.subscribeToRepositories();
        };
      })(this));
      this.subscribeToRepositories();
      this.subscribeToActiveItem();
    }

    GitView.prototype.createBranchArea = function() {
      var branchIcon;
      this.branchArea = document.createElement('div');
      this.branchArea.classList.add('git-branch', 'inline-block');
      this.element.appendChild(this.branchArea);
      this.element.branchArea = this.branchArea;
      branchIcon = document.createElement('span');
      branchIcon.classList.add('icon', 'icon-git-branch');
      this.branchArea.appendChild(branchIcon);
      this.branchLabel = document.createElement('span');
      this.branchLabel.classList.add('branch-label');
      this.branchArea.appendChild(this.branchLabel);
      return this.element.branchLabel = this.branchLabel;
    };

    GitView.prototype.createCommitsArea = function() {
      this.commitsArea = document.createElement('div');
      this.commitsArea.classList.add('git-commits', 'inline-block');
      this.element.appendChild(this.commitsArea);
      this.commitsAhead = document.createElement('span');
      this.commitsAhead.classList.add('icon', 'icon-arrow-up', 'commits-ahead-label');
      this.commitsArea.appendChild(this.commitsAhead);
      this.commitsBehind = document.createElement('span');
      this.commitsBehind.classList.add('icon', 'icon-arrow-down', 'commits-behind-label');
      return this.commitsArea.appendChild(this.commitsBehind);
    };

    GitView.prototype.createStatusArea = function() {
      this.gitStatus = document.createElement('div');
      this.gitStatus.classList.add('git-status', 'inline-block');
      this.element.appendChild(this.gitStatus);
      this.gitStatusIcon = document.createElement('span');
      this.gitStatusIcon.classList.add('icon');
      this.gitStatus.appendChild(this.gitStatusIcon);
      return this.element.gitStatusIcon = this.gitStatusIcon;
    };

    GitView.prototype.subscribeToActiveItem = function() {
      var activeItem, ref1;
      activeItem = this.getActiveItem();
      if ((ref1 = this.savedSubscription) != null) {
        ref1.dispose();
      }
      this.savedSubscription = activeItem != null ? typeof activeItem.onDidSave === "function" ? activeItem.onDidSave((function(_this) {
        return function() {
          return _this.update();
        };
      })(this)) : void 0 : void 0;
      return this.update();
    };

    GitView.prototype.subscribeToRepositories = function() {
      var i, len, ref1, ref2, repo, results;
      if ((ref1 = this.repositorySubscriptions) != null) {
        ref1.dispose();
      }
      this.repositorySubscriptions = new CompositeDisposable;
      ref2 = atom.project.getRepositories();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        repo = ref2[i];
        if (!(repo != null)) {
          continue;
        }
        this.repositorySubscriptions.add(repo.onDidChangeStatus((function(_this) {
          return function(arg) {
            var path, status;
            path = arg.path, status = arg.status;
            if (path === _this.getActiveItemPath()) {
              return _this.update();
            }
          };
        })(this)));
        results.push(this.repositorySubscriptions.add(repo.onDidChangeStatuses((function(_this) {
          return function() {
            return _this.update();
          };
        })(this))));
      }
      return results;
    };

    GitView.prototype.destroy = function() {
      var ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
      if ((ref1 = this.activeItemSubscription) != null) {
        ref1.dispose();
      }
      if ((ref2 = this.projectPathSubscription) != null) {
        ref2.dispose();
      }
      if ((ref3 = this.savedSubscription) != null) {
        ref3.dispose();
      }
      if ((ref4 = this.repositorySubscriptions) != null) {
        ref4.dispose();
      }
      if ((ref5 = this.branchTooltipDisposable) != null) {
        ref5.dispose();
      }
      if ((ref6 = this.commitsAheadTooltipDisposable) != null) {
        ref6.dispose();
      }
      if ((ref7 = this.commitsBehindTooltipDisposable) != null) {
        ref7.dispose();
      }
      return (ref8 = this.statusTooltipDisposable) != null ? ref8.dispose() : void 0;
    };

    GitView.prototype.getActiveItemPath = function() {
      var ref1;
      return (ref1 = this.getActiveItem()) != null ? typeof ref1.getPath === "function" ? ref1.getPath() : void 0 : void 0;
    };

    GitView.prototype.getRepositoryForActiveItem = function() {
      var i, len, ref1, repo, rootDir, rootDirIndex;
      rootDir = atom.project.relativizePath(this.getActiveItemPath())[0];
      rootDirIndex = atom.project.getPaths().indexOf(rootDir);
      if (rootDirIndex >= 0) {
        return atom.project.getRepositories()[rootDirIndex];
      } else {
        ref1 = atom.project.getRepositories();
        for (i = 0, len = ref1.length; i < len; i++) {
          repo = ref1[i];
          if (repo) {
            return repo;
          }
        }
      }
    };

    GitView.prototype.getActiveItem = function() {
      return atom.workspace.getCenter().getActivePaneItem();
    };

    GitView.prototype.update = function() {
      var repo;
      repo = this.getRepositoryForActiveItem();
      this.updateBranchText(repo);
      this.updateAheadBehindCount(repo);
      return this.updateStatusText(repo);
    };

    GitView.prototype.updateBranchText = function(repo) {
      var head, ref1;
      if (this.showGitInformation(repo)) {
        head = repo.getShortHead(this.getActiveItemPath());
        this.branchLabel.textContent = head;
        if (head) {
          this.branchArea.style.display = '';
        }
        if ((ref1 = this.branchTooltipDisposable) != null) {
          ref1.dispose();
        }
        return this.branchTooltipDisposable = atom.tooltips.add(this.branchArea, {
          title: "On branch " + head
        });
      } else {
        return this.branchArea.style.display = 'none';
      }
    };

    GitView.prototype.showGitInformation = function(repo) {
      var itemPath;
      if (repo == null) {
        return false;
      }
      if (itemPath = this.getActiveItemPath()) {
        return atom.project.contains(itemPath);
      } else {
        return this.getActiveItem() == null;
      }
    };

    GitView.prototype.updateAheadBehindCount = function(repo) {
      var ahead, behind, itemPath, ref1, ref2, ref3;
      if (!this.showGitInformation(repo)) {
        this.commitsArea.style.display = 'none';
        return;
      }
      itemPath = this.getActiveItemPath();
      ref1 = repo.getCachedUpstreamAheadBehindCount(itemPath), ahead = ref1.ahead, behind = ref1.behind;
      if (ahead > 0) {
        this.commitsAhead.textContent = ahead;
        this.commitsAhead.style.display = '';
        if ((ref2 = this.commitsAheadTooltipDisposable) != null) {
          ref2.dispose();
        }
        this.commitsAheadTooltipDisposable = atom.tooltips.add(this.commitsAhead, {
          title: (_.pluralize(ahead, 'commit')) + " ahead of upstream"
        });
      } else {
        this.commitsAhead.style.display = 'none';
      }
      if (behind > 0) {
        this.commitsBehind.textContent = behind;
        this.commitsBehind.style.display = '';
        if ((ref3 = this.commitsBehindTooltipDisposable) != null) {
          ref3.dispose();
        }
        this.commitsBehindTooltipDisposable = atom.tooltips.add(this.commitsBehind, {
          title: (_.pluralize(behind, 'commit')) + " behind upstream"
        });
      } else {
        this.commitsBehind.style.display = 'none';
      }
      if (ahead > 0 || behind > 0) {
        return this.commitsArea.style.display = '';
      } else {
        return this.commitsArea.style.display = 'none';
      }
    };

    GitView.prototype.clearStatus = function() {
      return this.gitStatusIcon.classList.remove('icon-diff-modified', 'status-modified', 'icon-diff-added', 'status-added', 'icon-diff-ignored', 'status-ignored');
    };

    GitView.prototype.updateAsNewFile = function() {
      var textEditor;
      this.clearStatus();
      this.gitStatusIcon.classList.add('icon-diff-added', 'status-added');
      if (textEditor = atom.workspace.getActiveTextEditor()) {
        this.gitStatusIcon.textContent = "+" + (textEditor.getLineCount());
        this.updateTooltipText((_.pluralize(textEditor.getLineCount(), 'line')) + " in this new file not yet committed");
      } else {
        this.gitStatusIcon.textContent = '';
        this.updateTooltipText();
      }
      return this.gitStatus.style.display = '';
    };

    GitView.prototype.updateAsModifiedFile = function(repo, path) {
      var stats;
      stats = repo.getDiffStats(path);
      this.clearStatus();
      this.gitStatusIcon.classList.add('icon-diff-modified', 'status-modified');
      if (stats.added && stats.deleted) {
        this.gitStatusIcon.textContent = "+" + stats.added + ", -" + stats.deleted;
        this.updateTooltipText((_.pluralize(stats.added, 'line')) + " added and " + (_.pluralize(stats.deleted, 'line')) + " deleted in this file not yet committed");
      } else if (stats.added) {
        this.gitStatusIcon.textContent = "+" + stats.added;
        this.updateTooltipText((_.pluralize(stats.added, 'line')) + " added to this file not yet committed");
      } else if (stats.deleted) {
        this.gitStatusIcon.textContent = "-" + stats.deleted;
        this.updateTooltipText((_.pluralize(stats.deleted, 'line')) + " deleted from this file not yet committed");
      } else {
        this.gitStatusIcon.textContent = '';
        this.updateTooltipText();
      }
      return this.gitStatus.style.display = '';
    };

    GitView.prototype.updateAsIgnoredFile = function() {
      this.clearStatus();
      this.gitStatusIcon.classList.add('icon-diff-ignored', 'status-ignored');
      this.gitStatusIcon.textContent = '';
      this.gitStatus.style.display = '';
      return this.updateTooltipText("File is ignored by git");
    };

    GitView.prototype.updateTooltipText = function(text) {
      var ref1;
      if ((ref1 = this.statusTooltipDisposable) != null) {
        ref1.dispose();
      }
      if (text) {
        return this.statusTooltipDisposable = atom.tooltips.add(this.gitStatusIcon, {
          title: text
        });
      }
    };

    GitView.prototype.updateStatusText = function(repo) {
      var hideStatus, itemPath, ref1, status;
      hideStatus = (function(_this) {
        return function() {
          _this.clearStatus();
          return _this.gitStatus.style.display = 'none';
        };
      })(this);
      itemPath = this.getActiveItemPath();
      if (this.showGitInformation(repo) && (itemPath != null)) {
        status = (ref1 = repo.getCachedPathStatus(itemPath)) != null ? ref1 : 0;
        if (repo.isStatusNew(status)) {
          return this.updateAsNewFile();
        }
        if (repo.isStatusModified(status)) {
          return this.updateAsModifiedFile(repo, itemPath);
        }
        if (repo.isPathIgnored(itemPath)) {
          return this.updateAsIgnoredFile();
        } else {
          return hideStatus();
        }
      } else {
        return hideStatus();
      }
    };

    return GitView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvc3RhdHVzLWJhci9saWIvZ2l0LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQTRDLE9BQUEsQ0FBUSxNQUFSLENBQTVDLEVBQUMsNkNBQUQsRUFBc0I7O0VBRXRCLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxpQkFBQTtNQUNYLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsZ0JBQXZCO01BQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbkIsQ0FBdUIsVUFBdkI7TUFFQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLGdCQUFELENBQUE7TUFFQSxJQUFDLENBQUEsc0JBQUQsR0FBMEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFmLENBQUEsQ0FBMEIsQ0FBQyx5QkFBM0IsQ0FBcUQsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUM3RSxLQUFDLENBQUEscUJBQUQsQ0FBQTtRQUQ2RTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckQ7TUFFMUIsSUFBQyxDQUFBLHVCQUFELEdBQTJCLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWIsQ0FBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUN2RCxLQUFDLENBQUEsdUJBQUQsQ0FBQTtRQUR1RDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7TUFFM0IsSUFBQyxDQUFBLHVCQUFELENBQUE7TUFDQSxJQUFDLENBQUEscUJBQUQsQ0FBQTtJQWJXOztzQkFlYixnQkFBQSxHQUFrQixTQUFBO0FBQ2hC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Q0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ1gsS0FBQyxDQUFBLFdBQUQsQ0FBQTtpQkFDQSxLQUFDLENBQUEsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFqQixHQUEyQjtRQUZoQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFJYixRQUFBLEdBQVcsSUFBQyxDQUFBLGlCQUFELENBQUE7TUFDWCxJQUFHLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixJQUFwQixDQUFBLElBQThCLGtCQUFqQztRQUNFLE1BQUEsZ0VBQThDO1FBQzlDLElBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsTUFBakIsQ0FBSDtBQUNFLGlCQUFPLElBQUMsQ0FBQSxlQUFELENBQUEsRUFEVDs7UUFHQSxJQUFHLElBQUksQ0FBQyxnQkFBTCxDQUFzQixNQUF0QixDQUFIO0FBQ0UsaUJBQU8sSUFBQyxDQUFBLG9CQUFELENBQXNCLElBQXRCLEVBQTRCLFFBQTVCLEVBRFQ7O1FBR0EsSUFBRyxJQUFJLENBQUMsYUFBTCxDQUFtQixRQUFuQixDQUFIO2lCQUNFLElBQUMsQ0FBQSxtQkFBRCxDQUFBLEVBREY7U0FBQSxNQUFBO2lCQUdFLFVBQUEsQ0FBQSxFQUhGO1NBUkY7T0FBQSxNQUFBO2VBYUUsVUFBQSxDQUFBLEVBYkY7O0lBTmdCOzs7OztBQTFNcEIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSBcInVuZGVyc2NvcmUtcGx1c1wiXG57Q29tcG9zaXRlRGlzcG9zYWJsZSwgR2l0UmVwb3NpdG9yeUFzeW5jfSA9IHJlcXVpcmUgXCJhdG9tXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgR2l0Vmlld1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0YXR1cy1iYXItZ2l0JylcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdnaXQtdmlldycpXG5cbiAgICBAY3JlYXRlQnJhbmNoQXJlYSgpXG4gICAgQGNyZWF0ZUNvbW1pdHNBcmVhKClcbiAgICBAY3JlYXRlU3RhdHVzQXJlYSgpXG5cbiAgICBAYWN0aXZlSXRlbVN1YnNjcmlwdGlvbiA9IGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gPT5cbiAgICAgIEBzdWJzY3JpYmVUb0FjdGl2ZUl0ZW0oKVxuICAgIEBwcm9qZWN0UGF0aFN1YnNjcmlwdGlvbiA9IGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzID0+XG4gICAgICBAc3Vic2NyaWJlVG9SZXBvc2l0b3JpZXMoKVxuICAgIEBzdWJzY3JpYmVUb1JlcG9zaXRvcmllcygpXG4gICAgQHN1YnNjcmliZVRvQWN0aXZlSXRlbSgpXG5cbiAgY3JlYXRlQnJhbmNoQXJlYTogLT5cbiAgICBAYnJhbmNoQXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgQGJyYW5jaEFyZWEuY2xhc3NMaXN0LmFkZCgnZ2l0LWJyYW5jaCcsICdpbmxpbmUtYmxvY2snKVxuICAgIEBlbGVtZW50LmFwcGVuZENoaWxkKEBicmFuY2hBcmVhKVxuICAgIEBlbGVtZW50LmJyYW5jaEFyZWEgPSBAYnJhbmNoQXJlYVxuXG4gICAgYnJhbmNoSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIGJyYW5jaEljb24uY2xhc3NMaXN0LmFkZCgnaWNvbicsICdpY29uLWdpdC1icmFuY2gnKVxuICAgIEBicmFuY2hBcmVhLmFwcGVuZENoaWxkKGJyYW5jaEljb24pXG5cbiAgICBAYnJhbmNoTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBAYnJhbmNoTGFiZWwuY2xhc3NMaXN0LmFkZCgnYnJhbmNoLWxhYmVsJylcbiAgICBAYnJhbmNoQXJlYS5hcHBlbmRDaGlsZChAYnJhbmNoTGFiZWwpXG4gICAgQGVsZW1lbnQuYnJhbmNoTGFiZWwgPSBAYnJhbmNoTGFiZWxcblxuICBjcmVhdGVDb21taXRzQXJlYTogLT5cbiAgICBAY29tbWl0c0FyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIEBjb21taXRzQXJlYS5jbGFzc0xpc3QuYWRkKCdnaXQtY29tbWl0cycsICdpbmxpbmUtYmxvY2snKVxuICAgIEBlbGVtZW50LmFwcGVuZENoaWxkKEBjb21taXRzQXJlYSlcblxuICAgIEBjb21taXRzQWhlYWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBAY29tbWl0c0FoZWFkLmNsYXNzTGlzdC5hZGQoJ2ljb24nLCAnaWNvbi1hcnJvdy11cCcsICdjb21taXRzLWFoZWFkLWxhYmVsJylcbiAgICBAY29tbWl0c0FyZWEuYXBwZW5kQ2hpbGQoQGNvbW1pdHNBaGVhZClcblxuICAgIEBjb21taXRzQmVoaW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgQGNvbW1pdHNCZWhpbmQuY2xhc3NMaXN0LmFkZCgnaWNvbicsICdpY29uLWFycm93LWRvd24nLCAnY29tbWl0cy1iZWhpbmQtbGFiZWwnKVxuICAgIEBjb21taXRzQXJlYS5hcHBlbmRDaGlsZChAY29tbWl0c0JlaGluZClcblxuICBjcmVhdGVTdGF0dXNBcmVhOiAtPlxuICAgIEBnaXRTdGF0dXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIEBnaXRTdGF0dXMuY2xhc3NMaXN0LmFkZCgnZ2l0LXN0YXR1cycsICdpbmxpbmUtYmxvY2snKVxuICAgIEBlbGVtZW50LmFwcGVuZENoaWxkKEBnaXRTdGF0dXMpXG5cbiAgICBAZ2l0U3RhdHVzSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIEBnaXRTdGF0dXNJY29uLmNsYXNzTGlzdC5hZGQoJ2ljb24nKVxuICAgIEBnaXRTdGF0dXMuYXBwZW5kQ2hpbGQoQGdpdFN0YXR1c0ljb24pXG4gICAgQGVsZW1lbnQuZ2l0U3RhdHVzSWNvbiA9IEBnaXRTdGF0dXNJY29uXG5cbiAgc3Vic2NyaWJlVG9BY3RpdmVJdGVtOiAtPlxuICAgIGFjdGl2ZUl0ZW0gPSBAZ2V0QWN0aXZlSXRlbSgpXG5cbiAgICBAc2F2ZWRTdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuICAgIEBzYXZlZFN1YnNjcmlwdGlvbiA9IGFjdGl2ZUl0ZW0/Lm9uRGlkU2F2ZT8gPT4gQHVwZGF0ZSgpXG5cbiAgICBAdXBkYXRlKClcblxuICBzdWJzY3JpYmVUb1JlcG9zaXRvcmllczogLT5cbiAgICBAcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEByZXBvc2l0b3J5U3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBmb3IgcmVwbyBpbiBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKCkgd2hlbiByZXBvP1xuICAgICAgQHJlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmFkZCByZXBvLm9uRGlkQ2hhbmdlU3RhdHVzICh7cGF0aCwgc3RhdHVzfSkgPT5cbiAgICAgICAgQHVwZGF0ZSgpIGlmIHBhdGggaXMgQGdldEFjdGl2ZUl0ZW1QYXRoKClcbiAgICAgIEByZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5hZGQgcmVwby5vbkRpZENoYW5nZVN0YXR1c2VzID0+XG4gICAgICAgIEB1cGRhdGUoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGFjdGl2ZUl0ZW1TdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuICAgIEBwcm9qZWN0UGF0aFN1YnNjcmlwdGlvbj8uZGlzcG9zZSgpXG4gICAgQHNhdmVkU3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcbiAgICBAcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBicmFuY2hUb29sdGlwRGlzcG9zYWJsZT8uZGlzcG9zZSgpXG4gICAgQGNvbW1pdHNBaGVhZFRvb2x0aXBEaXNwb3NhYmxlPy5kaXNwb3NlKClcbiAgICBAY29tbWl0c0JlaGluZFRvb2x0aXBEaXNwb3NhYmxlPy5kaXNwb3NlKClcbiAgICBAc3RhdHVzVG9vbHRpcERpc3Bvc2FibGU/LmRpc3Bvc2UoKVxuXG4gIGdldEFjdGl2ZUl0ZW1QYXRoOiAtPlxuICAgIEBnZXRBY3RpdmVJdGVtKCk/LmdldFBhdGg/KClcblxuICBnZXRSZXBvc2l0b3J5Rm9yQWN0aXZlSXRlbTogLT5cbiAgICBbcm9vdERpcl0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoQGdldEFjdGl2ZUl0ZW1QYXRoKCkpXG4gICAgcm9vdERpckluZGV4ID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkuaW5kZXhPZihyb290RGlyKVxuICAgIGlmIHJvb3REaXJJbmRleCA+PSAwXG4gICAgICBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKClbcm9vdERpckluZGV4XVxuICAgIGVsc2VcbiAgICAgIGZvciByZXBvIGluIGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKSB3aGVuIHJlcG9cbiAgICAgICAgcmV0dXJuIHJlcG9cblxuICBnZXRBY3RpdmVJdGVtOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLmdldEFjdGl2ZVBhbmVJdGVtKClcblxuICB1cGRhdGU6IC0+XG4gICAgcmVwbyA9IEBnZXRSZXBvc2l0b3J5Rm9yQWN0aXZlSXRlbSgpXG4gICAgQHVwZGF0ZUJyYW5jaFRleHQocmVwbylcbiAgICBAdXBkYXRlQWhlYWRCZWhpbmRDb3VudChyZXBvKVxuICAgIEB1cGRhdGVTdGF0dXNUZXh0KHJlcG8pXG5cbiAgdXBkYXRlQnJhbmNoVGV4dDogKHJlcG8pIC0+XG4gICAgaWYgQHNob3dHaXRJbmZvcm1hdGlvbihyZXBvKVxuICAgICAgaGVhZCA9IHJlcG8uZ2V0U2hvcnRIZWFkKEBnZXRBY3RpdmVJdGVtUGF0aCgpKVxuICAgICAgQGJyYW5jaExhYmVsLnRleHRDb250ZW50ID0gaGVhZFxuICAgICAgQGJyYW5jaEFyZWEuc3R5bGUuZGlzcGxheSA9ICcnIGlmIGhlYWRcbiAgICAgIEBicmFuY2hUb29sdGlwRGlzcG9zYWJsZT8uZGlzcG9zZSgpXG4gICAgICBAYnJhbmNoVG9vbHRpcERpc3Bvc2FibGUgPSBhdG9tLnRvb2x0aXBzLmFkZCBAYnJhbmNoQXJlYSwgdGl0bGU6IFwiT24gYnJhbmNoICN7aGVhZH1cIlxuICAgIGVsc2VcbiAgICAgIEBicmFuY2hBcmVhLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICBzaG93R2l0SW5mb3JtYXRpb246IChyZXBvKSAtPlxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgcmVwbz9cblxuICAgIGlmIGl0ZW1QYXRoID0gQGdldEFjdGl2ZUl0ZW1QYXRoKClcbiAgICAgIGF0b20ucHJvamVjdC5jb250YWlucyhpdGVtUGF0aClcbiAgICBlbHNlXG4gICAgICBub3QgQGdldEFjdGl2ZUl0ZW0oKT9cblxuICB1cGRhdGVBaGVhZEJlaGluZENvdW50OiAocmVwbykgLT5cbiAgICB1bmxlc3MgQHNob3dHaXRJbmZvcm1hdGlvbihyZXBvKVxuICAgICAgQGNvbW1pdHNBcmVhLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICAgIHJldHVyblxuXG4gICAgaXRlbVBhdGggPSBAZ2V0QWN0aXZlSXRlbVBhdGgoKVxuICAgIHthaGVhZCwgYmVoaW5kfSA9IHJlcG8uZ2V0Q2FjaGVkVXBzdHJlYW1BaGVhZEJlaGluZENvdW50KGl0ZW1QYXRoKVxuICAgIGlmIGFoZWFkID4gMFxuICAgICAgQGNvbW1pdHNBaGVhZC50ZXh0Q29udGVudCA9IGFoZWFkXG4gICAgICBAY29tbWl0c0FoZWFkLnN0eWxlLmRpc3BsYXkgPSAnJ1xuICAgICAgQGNvbW1pdHNBaGVhZFRvb2x0aXBEaXNwb3NhYmxlPy5kaXNwb3NlKClcbiAgICAgIEBjb21taXRzQWhlYWRUb29sdGlwRGlzcG9zYWJsZSA9IGF0b20udG9vbHRpcHMuYWRkIEBjb21taXRzQWhlYWQsIHRpdGxlOiBcIiN7Xy5wbHVyYWxpemUoYWhlYWQsICdjb21taXQnKX0gYWhlYWQgb2YgdXBzdHJlYW1cIlxuICAgIGVsc2VcbiAgICAgIEBjb21taXRzQWhlYWQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG4gICAgaWYgYmVoaW5kID4gMFxuICAgICAgQGNvbW1pdHNCZWhpbmQudGV4dENvbnRlbnQgPSBiZWhpbmRcbiAgICAgIEBjb21taXRzQmVoaW5kLnN0eWxlLmRpc3BsYXkgPSAnJ1xuICAgICAgQGNvbW1pdHNCZWhpbmRUb29sdGlwRGlzcG9zYWJsZT8uZGlzcG9zZSgpXG4gICAgICBAY29tbWl0c0JlaGluZFRvb2x0aXBEaXNwb3NhYmxlID0gYXRvbS50b29sdGlwcy5hZGQgQGNvbW1pdHNCZWhpbmQsIHRpdGxlOiBcIiN7Xy5wbHVyYWxpemUoYmVoaW5kLCAnY29tbWl0Jyl9IGJlaGluZCB1cHN0cmVhbVwiXG4gICAgZWxzZVxuICAgICAgQGNvbW1pdHNCZWhpbmQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG4gICAgaWYgYWhlYWQgPiAwIG9yIGJlaGluZCA+IDBcbiAgICAgIEBjb21taXRzQXJlYS5zdHlsZS5kaXNwbGF5ID0gJydcbiAgICBlbHNlXG4gICAgICBAY29tbWl0c0FyZWEuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG4gIGNsZWFyU3RhdHVzOiAtPlxuICAgIEBnaXRTdGF0dXNJY29uLmNsYXNzTGlzdC5yZW1vdmUoJ2ljb24tZGlmZi1tb2RpZmllZCcsICdzdGF0dXMtbW9kaWZpZWQnLCAnaWNvbi1kaWZmLWFkZGVkJywgJ3N0YXR1cy1hZGRlZCcsICdpY29uLWRpZmYtaWdub3JlZCcsICdzdGF0dXMtaWdub3JlZCcpXG5cbiAgdXBkYXRlQXNOZXdGaWxlOiAtPlxuICAgIEBjbGVhclN0YXR1cygpXG5cbiAgICBAZ2l0U3RhdHVzSWNvbi5jbGFzc0xpc3QuYWRkKCdpY29uLWRpZmYtYWRkZWQnLCAnc3RhdHVzLWFkZGVkJylcbiAgICBpZiB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBAZ2l0U3RhdHVzSWNvbi50ZXh0Q29udGVudCA9IFwiKyN7dGV4dEVkaXRvci5nZXRMaW5lQ291bnQoKX1cIlxuICAgICAgQHVwZGF0ZVRvb2x0aXBUZXh0KFwiI3tfLnBsdXJhbGl6ZSh0ZXh0RWRpdG9yLmdldExpbmVDb3VudCgpLCAnbGluZScpfSBpbiB0aGlzIG5ldyBmaWxlIG5vdCB5ZXQgY29tbWl0dGVkXCIpXG4gICAgZWxzZVxuICAgICAgQGdpdFN0YXR1c0ljb24udGV4dENvbnRlbnQgPSAnJ1xuICAgICAgQHVwZGF0ZVRvb2x0aXBUZXh0KClcblxuICAgIEBnaXRTdGF0dXMuc3R5bGUuZGlzcGxheSA9ICcnXG5cbiAgdXBkYXRlQXNNb2RpZmllZEZpbGU6IChyZXBvLCBwYXRoKSAtPlxuICAgIHN0YXRzID0gcmVwby5nZXREaWZmU3RhdHMocGF0aClcbiAgICBAY2xlYXJTdGF0dXMoKVxuXG4gICAgQGdpdFN0YXR1c0ljb24uY2xhc3NMaXN0LmFkZCgnaWNvbi1kaWZmLW1vZGlmaWVkJywgJ3N0YXR1cy1tb2RpZmllZCcpXG4gICAgaWYgc3RhdHMuYWRkZWQgYW5kIHN0YXRzLmRlbGV0ZWRcbiAgICAgIEBnaXRTdGF0dXNJY29uLnRleHRDb250ZW50ID0gXCIrI3tzdGF0cy5hZGRlZH0sIC0je3N0YXRzLmRlbGV0ZWR9XCJcbiAgICAgIEB1cGRhdGVUb29sdGlwVGV4dChcIiN7Xy5wbHVyYWxpemUoc3RhdHMuYWRkZWQsICdsaW5lJyl9IGFkZGVkIGFuZCAje18ucGx1cmFsaXplKHN0YXRzLmRlbGV0ZWQsICdsaW5lJyl9IGRlbGV0ZWQgaW4gdGhpcyBmaWxlIG5vdCB5ZXQgY29tbWl0dGVkXCIpXG4gICAgZWxzZSBpZiBzdGF0cy5hZGRlZFxuICAgICAgQGdpdFN0YXR1c0ljb24udGV4dENvbnRlbnQgPSBcIisje3N0YXRzLmFkZGVkfVwiXG4gICAgICBAdXBkYXRlVG9vbHRpcFRleHQoXCIje18ucGx1cmFsaXplKHN0YXRzLmFkZGVkLCAnbGluZScpfSBhZGRlZCB0byB0aGlzIGZpbGUgbm90IHlldCBjb21taXR0ZWRcIilcbiAgICBlbHNlIGlmIHN0YXRzLmRlbGV0ZWRcbiAgICAgIEBnaXRTdGF0dXNJY29uLnRleHRDb250ZW50ID0gXCItI3tzdGF0cy5kZWxldGVkfVwiXG4gICAgICBAdXBkYXRlVG9vbHRpcFRleHQoXCIje18ucGx1cmFsaXplKHN0YXRzLmRlbGV0ZWQsICdsaW5lJyl9IGRlbGV0ZWQgZnJvbSB0aGlzIGZpbGUgbm90IHlldCBjb21taXR0ZWRcIilcbiAgICBlbHNlXG4gICAgICBAZ2l0U3RhdHVzSWNvbi50ZXh0Q29udGVudCA9ICcnXG4gICAgICBAdXBkYXRlVG9vbHRpcFRleHQoKVxuXG4gICAgQGdpdFN0YXR1cy5zdHlsZS5kaXNwbGF5ID0gJydcblxuICB1cGRhdGVBc0lnbm9yZWRGaWxlOiAtPlxuICAgIEBjbGVhclN0YXR1cygpXG5cbiAgICBAZ2l0U3RhdHVzSWNvbi5jbGFzc0xpc3QuYWRkKCdpY29uLWRpZmYtaWdub3JlZCcsICAnc3RhdHVzLWlnbm9yZWQnKVxuICAgIEBnaXRTdGF0dXNJY29uLnRleHRDb250ZW50ID0gJydcbiAgICBAZ2l0U3RhdHVzLnN0eWxlLmRpc3BsYXkgPSAnJ1xuICAgIEB1cGRhdGVUb29sdGlwVGV4dChcIkZpbGUgaXMgaWdub3JlZCBieSBnaXRcIilcblxuICB1cGRhdGVUb29sdGlwVGV4dDogKHRleHQpIC0+XG4gICAgQHN0YXR1c1Rvb2x0aXBEaXNwb3NhYmxlPy5kaXNwb3NlKClcbiAgICBpZiB0ZXh0XG4gICAgICBAc3RhdHVzVG9vbHRpcERpc3Bvc2FibGUgPSBhdG9tLnRvb2x0aXBzLmFkZCBAZ2l0U3RhdHVzSWNvbiwgdGl0bGU6IHRleHRcblxuICB1cGRhdGVTdGF0dXNUZXh0OiAocmVwbykgLT5cbiAgICBoaWRlU3RhdHVzID0gPT5cbiAgICAgIEBjbGVhclN0YXR1cygpXG4gICAgICBAZ2l0U3RhdHVzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgIGl0ZW1QYXRoID0gQGdldEFjdGl2ZUl0ZW1QYXRoKClcbiAgICBpZiBAc2hvd0dpdEluZm9ybWF0aW9uKHJlcG8pIGFuZCBpdGVtUGF0aD9cbiAgICAgIHN0YXR1cyA9IHJlcG8uZ2V0Q2FjaGVkUGF0aFN0YXR1cyhpdGVtUGF0aCkgPyAwXG4gICAgICBpZiByZXBvLmlzU3RhdHVzTmV3KHN0YXR1cylcbiAgICAgICAgcmV0dXJuIEB1cGRhdGVBc05ld0ZpbGUoKVxuXG4gICAgICBpZiByZXBvLmlzU3RhdHVzTW9kaWZpZWQoc3RhdHVzKVxuICAgICAgICByZXR1cm4gQHVwZGF0ZUFzTW9kaWZpZWRGaWxlKHJlcG8sIGl0ZW1QYXRoKVxuXG4gICAgICBpZiByZXBvLmlzUGF0aElnbm9yZWQoaXRlbVBhdGgpXG4gICAgICAgIEB1cGRhdGVBc0lnbm9yZWRGaWxlKClcbiAgICAgIGVsc2VcbiAgICAgICAgaGlkZVN0YXR1cygpXG4gICAgZWxzZVxuICAgICAgaGlkZVN0YXR1cygpXG4iXX0=
