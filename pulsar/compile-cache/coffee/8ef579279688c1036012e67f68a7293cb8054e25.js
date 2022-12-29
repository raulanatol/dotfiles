(function() {
  var CommandLogger, FileURLRegExp, NotificationIssue, StackTraceParser, TITLE_CHAR_LIMIT, UserUtilities, fs, path,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs-plus');

  path = require('path');

  StackTraceParser = require('stacktrace-parser');

  CommandLogger = require('./command-logger');

  UserUtilities = require('./user-utilities');

  TITLE_CHAR_LIMIT = 100;

  FileURLRegExp = new RegExp('file://\w*/(.*)');

  module.exports = NotificationIssue = (function() {
    function NotificationIssue(notification) {
      this.notification = notification;
      this.normalizedStackPaths = bind(this.normalizedStackPaths, this);
    }

    NotificationIssue.prototype.findSimilarIssues = function() {
      var githubHeaders, issueTitle, query, repo, repoUrl;
      repoUrl = this.getRepoUrl();
      if (repoUrl == null) {
        repoUrl = 'atom/atom';
      }
      repo = repoUrl.replace(/http(s)?:\/\/(\d+\.)?github.com\//gi, '');
      issueTitle = this.getIssueTitle();
      query = issueTitle + " repo:" + repo;
      githubHeaders = new Headers({
        accept: 'application/vnd.github.v3+json',
        contentType: "application/json"
      });
      return fetch("https://api.github.com/search/issues?q=" + (encodeURIComponent(query)) + "&sort=created", {
        headers: githubHeaders
      }).then(function(r) {
        return r != null ? r.json() : void 0;
      }).then(function(data) {
        var issue, issues, j, len, ref;
        if ((data != null ? data.items : void 0) != null) {
          issues = {};
          ref = data.items;
          for (j = 0, len = ref.length; j < len; j++) {
            issue = ref[j];
            if (issue.title.indexOf(issueTitle) > -1 && (issues[issue.state] == null)) {
              issues[issue.state] = issue;
              if ((issues.open != null) && (issues.closed != null)) {
                return issues;
              }
            }
          }
          if ((issues.open != null) || (issues.closed != null)) {
            return issues;
          }
        }
        return null;
      })["catch"](function(e) {
        return null;
      });
    };

    NotificationIssue.prototype.getIssueUrlForSystem = function() {
      return this.getIssueUrl().then(function(issueUrl) {
        return fetch("https://is.gd/create.php?format=simple", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: "url=" + (encodeURIComponent(issueUrl))
        }).then(function(r) {
          return r.text();
        })["catch"](function(e) {
          return null;
        });
      });
    };

    NotificationIssue.prototype.getIssueUrl = function() {
      return this.getIssueBody().then((function(_this) {
        return function(issueBody) {
          var repoUrl;
          repoUrl = _this.getRepoUrl();
          if (repoUrl == null) {
            repoUrl = 'https://github.com/atom/atom';
          }
          return repoUrl + "/issues/new?title=" + (_this.encodeURI(_this.getIssueTitle())) + "&body=" + (_this.encodeURI(issueBody));
        };
      })(this));
    };

    NotificationIssue.prototype.encodeURI = function(str) {
      return encodeURI(str).replace(/#/g, '%23').replace(/;/g, '%3B').replace(/%20/g, '+');
    };

    NotificationIssue.prototype.getIssueTitle = function() {
      var title;
      title = this.notification.getMessage();
      title = title.replace(process.env.ATOM_HOME, '$ATOM_HOME');
      if (process.platform === 'win32') {
        title = title.replace(process.env.USERPROFILE, '~');
        title = title.replace(path.sep, path.posix.sep);
      } else {
        title = title.replace(process.env.HOME, '~');
      }
      if (title.length > TITLE_CHAR_LIMIT) {
        title = title.substring(0, TITLE_CHAR_LIMIT - 3) + '...';
      }
      return title.replace(/\r?\n|\r/g, "");
    };

    NotificationIssue.prototype.getIssueBody = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var nonCorePackagesPromise, systemPromise;
          if (_this.issueBody) {
            return resolve(_this.issueBody);
          }
          systemPromise = UserUtilities.getOSVersion();
          nonCorePackagesPromise = UserUtilities.getNonCorePackages();
          return Promise.all([systemPromise, nonCorePackagesPromise]).then(function(all) {
            var copyText, message, nonCorePackages, options, packageMessage, packageName, packageVersion, ref, ref1, repoUrl, rootUserStatus, systemName, systemUser;
            systemName = all[0], nonCorePackages = all[1];
            message = _this.notification.getMessage();
            options = _this.notification.getOptions();
            repoUrl = _this.getRepoUrl();
            packageName = _this.getPackageName();
            if (packageName != null) {
              packageVersion = (ref = atom.packages.getLoadedPackage(packageName)) != null ? (ref1 = ref.metadata) != null ? ref1.version : void 0 : void 0;
            }
            copyText = '';
            systemUser = process.env.USER;
            rootUserStatus = '';
            if (systemUser === 'root') {
              rootUserStatus = '**User**: root';
            }
            if ((packageName != null) && (repoUrl != null)) {
              packageMessage = "[" + packageName + "](" + repoUrl + ") package " + packageVersion;
            } else if (packageName != null) {
              packageMessage = "'" + packageName + "' package v" + packageVersion;
            } else {
              packageMessage = 'Atom Core';
            }
            _this.issueBody = "<!--\nHave you read Atom's Code of Conduct? By filing an Issue, you are expected to comply with it, including treating everyone with respect: https://github.com/atom/.github/blob/master/CODE_OF_CONDUCT.md\n\nDo you want to ask a question? Are you looking for support? The Atom message board is the best place for getting support: https://discuss.atom.io\n-->\n\n### Prerequisites\n\n* [ ] Put an X between the brackets on this line if you have done all of the following:\n    * Reproduced the problem in Safe Mode: <https://flight-manual.atom.io/hacking-atom/sections/debugging/#using-safe-mode>\n    * Followed all applicable steps in the debugging guide: <https://flight-manual.atom.io/hacking-atom/sections/debugging/>\n    * Checked the FAQs on the message board for common solutions: <https://discuss.atom.io/c/faq>\n    * Checked that your issue isn't already filed: <https://github.com/issues?q=is%3Aissue+user%3Aatom>\n    * Checked that there is not already an Atom package that provides the described functionality: <https://atom.io/packages>\n\n### Description\n\n<!-- Description of the issue -->\n\n### Steps to Reproduce\n\n1. <!-- First Step -->\n2. <!-- Second Step -->\n3. <!-- and so on… -->\n\n**Expected behavior:**\n\n<!-- What you expect to happen -->\n\n**Actual behavior:**\n\n<!-- What actually happens -->\n\n### Versions\n\n**Atom**: " + (atom.getVersion()) + " " + process.arch + "\n**Electron**: " + process.versions.electron + "\n**OS**: " + systemName + "\n**Thrown From**: " + packageMessage + "\n" + rootUserStatus + "\n\n### Stack Trace\n\n" + message + "\n\n```\nAt " + options.detail + "\n\n" + (_this.normalizedStackPaths(options.stack)) + "\n```\n\n### Commands\n\n" + (CommandLogger.instance().getText()) + "\n\n### Non-Core Packages\n\n```\n" + (nonCorePackages.join('\n')) + "\n```\n\n### Additional Information\n\n<!-- Any additional information, configuration or data that might be necessary to reproduce the issue. -->\n" + copyText;
            return resolve(_this.issueBody);
          });
        };
      })(this));
    };

    NotificationIssue.prototype.normalizedStackPaths = function(stack) {
      return stack != null ? stack.replace(/(^\W+at )([\w.]{2,} [(])?(.*)(:\d+:\d+[)]?)/gm, (function(_this) {
        return function(m, p1, p2, p3, p4) {
          return p1 + (p2 || '') + _this.normalizePath(p3) + p4;
        };
      })(this)) : void 0;
    };

    NotificationIssue.prototype.normalizePath = function(path) {
      return path.replace('file:///', '').replace(/[\/]/g, '\\').replace(fs.getHomeDirectory(), '~').replace(/\\/g, '/').replace(/.*(\/(app\.asar|packages\/).*)/, '$1');
    };

    NotificationIssue.prototype.getRepoUrl = function() {
      var packageName, packagePath, ref, ref1, ref2, ref3, ref4, repo, repoUrl;
      packageName = this.getPackageName();
      if (packageName == null) {
        return;
      }
      repo = (ref = atom.packages.getLoadedPackage(packageName)) != null ? (ref1 = ref.metadata) != null ? ref1.repository : void 0 : void 0;
      repoUrl = (ref2 = repo != null ? repo.url : void 0) != null ? ref2 : repo;
      if (!repoUrl) {
        if (packagePath = atom.packages.resolvePackagePath(packageName)) {
          try {
            repo = (ref3 = JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json')))) != null ? ref3.repository : void 0;
            repoUrl = (ref4 = repo != null ? repo.url : void 0) != null ? ref4 : repo;
          } catch (error) {}
        }
      }
      return repoUrl != null ? repoUrl.replace(/\.git$/, '').replace(/^git\+/, '') : void 0;
    };

    NotificationIssue.prototype.getPackageNameFromFilePath = function(filePath) {
      var packageName, ref, ref1, ref2, ref3;
      if (!filePath) {
        return;
      }
      packageName = (ref = /\/\.atom\/dev\/packages\/([^\/]+)\//.exec(filePath)) != null ? ref[1] : void 0;
      if (packageName) {
        return packageName;
      }
      packageName = (ref1 = /\\\.atom\\dev\\packages\\([^\\]+)\\/.exec(filePath)) != null ? ref1[1] : void 0;
      if (packageName) {
        return packageName;
      }
      packageName = (ref2 = /\/\.atom\/packages\/([^\/]+)\//.exec(filePath)) != null ? ref2[1] : void 0;
      if (packageName) {
        return packageName;
      }
      packageName = (ref3 = /\\\.atom\\packages\\([^\\]+)\\/.exec(filePath)) != null ? ref3[1] : void 0;
      if (packageName) {
        return packageName;
      }
    };

    NotificationIssue.prototype.getPackageName = function() {
      var file, getPackageName, i, j, options, packageName, packagePath, packagePaths, ref, stack;
      options = this.notification.getOptions();
      if (options.packageName != null) {
        return options.packageName;
      }
      if (!((options.stack != null) || (options.detail != null))) {
        return;
      }
      packagePaths = this.getPackagePathsByPackageName();
      for (packageName in packagePaths) {
        packagePath = packagePaths[packageName];
        if (packagePath.indexOf(path.join('.atom', 'dev', 'packages')) > -1 || packagePath.indexOf(path.join('.atom', 'packages')) > -1) {
          packagePaths[packageName] = fs.realpathSync(packagePath);
        }
      }
      getPackageName = (function(_this) {
        return function(filePath) {
          var isSubfolder, match, packName;
          filePath = /\((.+?):\d+|\((.+)\)|(.+)/.exec(filePath)[0];
          if (match = FileURLRegExp.exec(filePath)) {
            filePath = match[1];
          }
          filePath = path.normalize(filePath);
          if (path.isAbsolute(filePath)) {
            for (packName in packagePaths) {
              packagePath = packagePaths[packName];
              if (filePath === 'node.js') {
                continue;
              }
              isSubfolder = filePath.indexOf(path.normalize(packagePath + path.sep)) === 0;
              if (isSubfolder) {
                return packName;
              }
            }
          }
          return _this.getPackageNameFromFilePath(filePath);
        };
      })(this);
      if ((options.detail != null) && (packageName = getPackageName(options.detail))) {
        return packageName;
      }
      if (options.stack != null) {
        stack = StackTraceParser.parse(options.stack);
        for (i = j = 0, ref = stack.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          file = stack[i].file;
          if (!file) {
            return;
          }
          packageName = getPackageName(file);
          if (packageName != null) {
            return packageName;
          }
        }
      }
    };

    NotificationIssue.prototype.getPackagePathsByPackageName = function() {
      var j, len, pack, packagePathsByPackageName, ref;
      packagePathsByPackageName = {};
      ref = atom.packages.getLoadedPackages();
      for (j = 0, len = ref.length; j < len; j++) {
        pack = ref[j];
        packagePathsByPackageName[pack.name] = pack.path;
      }
      return packagePathsByPackageName;
    };

    return NotificationIssue;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvbm90aWZpY2F0aW9ucy9saWIvbm90aWZpY2F0aW9uLWlzc3VlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNEdBQUE7SUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxtQkFBUjs7RUFFbkIsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVI7O0VBQ2hCLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSOztFQUVoQixnQkFBQSxHQUFtQjs7RUFFbkIsYUFBQSxHQUFnQixJQUFJLE1BQUosQ0FBVyxpQkFBWDs7RUFFaEIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLDJCQUFDLFlBQUQ7TUFBQyxJQUFDLENBQUEsZUFBRDs7SUFBRDs7Z0NBRWIsaUJBQUEsR0FBbUIsU0FBQTtBQUNqQixVQUFBO01BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxVQUFELENBQUE7TUFDVixJQUE2QixlQUE3QjtRQUFBLE9BQUEsR0FBVSxZQUFWOztNQUNBLElBQUEsR0FBTyxPQUFPLENBQUMsT0FBUixDQUFnQixxQ0FBaEIsRUFBdUQsRUFBdkQ7TUFDUCxVQUFBLEdBQWEsSUFBQyxDQUFBLGFBQUQsQ0FBQTtNQUNiLEtBQUEsR0FBVyxVQUFELEdBQVksUUFBWixHQUFvQjtNQUM5QixhQUFBLEdBQWdCLElBQUksT0FBSixDQUFZO1FBQzFCLE1BQUEsRUFBUSxnQ0FEa0I7UUFFMUIsV0FBQSxFQUFhLGtCQUZhO09BQVo7YUFLaEIsS0FBQSxDQUFNLHlDQUFBLEdBQXlDLENBQUMsa0JBQUEsQ0FBbUIsS0FBbkIsQ0FBRCxDQUF6QyxHQUFvRSxlQUExRSxFQUEwRjtR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cmUgJ2ZzLXBsdXMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblN0YWNrVHJhY2VQYXJzZXIgPSByZXF1aXJlICdzdGFja3RyYWNlLXBhcnNlcidcblxuQ29tbWFuZExvZ2dlciA9IHJlcXVpcmUgJy4vY29tbWFuZC1sb2dnZXInXG5Vc2VyVXRpbGl0aWVzID0gcmVxdWlyZSAnLi91c2VyLXV0aWxpdGllcydcblxuVElUTEVfQ0hBUl9MSU1JVCA9IDEwMCAjIFRydW5jYXRlIGlzc3VlIHRpdGxlIHRvIDEwMCBjaGFyYWN0ZXJzIChpbmNsdWRpbmcgZWxsaXBzaXMpXG5cbkZpbGVVUkxSZWdFeHAgPSBuZXcgUmVnRXhwKCdmaWxlOi8vXFx3Ki8oLiopJylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTm90aWZpY2F0aW9uSXNzdWVcbiAgY29uc3RydWN0b3I6IChAbm90aWZpY2F0aW9uKSAtPlxuXG4gIGZpbmRTaW1pbGFySXNzdWVzOiAtPlxuICAgIHJlcG9VcmwgPSBAZ2V0UmVwb1VybCgpXG4gICAgcmVwb1VybCA9ICdhdG9tL2F0b20nIHVubGVzcyByZXBvVXJsP1xuICAgIHJlcG8gPSByZXBvVXJsLnJlcGxhY2UgL2h0dHAocyk/OlxcL1xcLyhcXGQrXFwuKT9naXRodWIuY29tXFwvL2dpLCAnJ1xuICAgIGlzc3VlVGl0bGUgPSBAZ2V0SXNzdWVUaXRsZSgpXG4gICAgcXVlcnkgPSBcIiN7aXNzdWVUaXRsZX0gcmVwbzoje3JlcG99XCJcbiAgICBnaXRodWJIZWFkZXJzID0gbmV3IEhlYWRlcnMoe1xuICAgICAgYWNjZXB0OiAnYXBwbGljYXRpb24vdm5kLmdpdGh1Yi52Mytqc29uJ1xuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgfSlcblxuICAgIGZldGNoIFwiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9zZWFyY2gvaXNzdWVzP3E9I3tlbmNvZGVVUklDb21wb25lbnQocXVlcnkpfSZzb3J0PWNyZWF0ZWRcIiwge2hlYWRlcnM6IGdpdGh1YkhlYWRlcnN9XG4gICAgICAudGhlbiAocikgLT4gcj8uanNvbigpXG4gICAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgaWYgZGF0YT8uaXRlbXM/XG4gICAgICAgICAgaXNzdWVzID0ge31cbiAgICAgICAgICBmb3IgaXNzdWUgaW4gZGF0YS5pdGVtc1xuICAgICAgICAgICAgaWYgaXNzdWUudGl0bGUuaW5kZXhPZihpc3N1ZVRpdGxlKSA+IC0xIGFuZCBub3QgaXNzdWVzW2lzc3VlLnN0YXRlXT9cbiAgICAgICAgICAgICAgaXNzdWVzW2lzc3VlLnN0YXRlXSA9IGlzc3VlXG4gICAgICAgICAgICAgIHJldHVybiBpc3N1ZXMgaWYgaXNzdWVzLm9wZW4/IGFuZCBpc3N1ZXMuY2xvc2VkP1xuXG4gICAgICAgICAgcmV0dXJuIGlzc3VlcyBpZiBpc3N1ZXMub3Blbj8gb3IgaXNzdWVzLmNsb3NlZD9cbiAgICAgICAgbnVsbFxuICAgICAgLmNhdGNoIChlKSAtPiBudWxsXG5cbiAgZ2V0SXNzdWVVcmxGb3JTeXN0ZW06IC0+XG4gICAgIyBXaW5kb3dzIHdpbGwgbm90IGxhdW5jaCBVUkxzIGdyZWF0ZXIgdGhhbiB+MjAwMCBieXRlcyBzbyB3ZSBuZWVkIHRvIHNocmluayBpdFxuICAgICMgQWxzbyBpcy5nZCBoYXMgYSBsaW1pdCBvZiA1MDAwIGJ5dGVzLi4uXG4gICAgQGdldElzc3VlVXJsKCkudGhlbiAoaXNzdWVVcmwpIC0+XG4gICAgICBmZXRjaCBcImh0dHBzOi8vaXMuZ2QvY3JlYXRlLnBocD9mb3JtYXQ9c2ltcGxlXCIsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHsnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCd9LFxuICAgICAgICBib2R5OiBcInVybD0je2VuY29kZVVSSUNvbXBvbmVudChpc3N1ZVVybCl9XCJcbiAgICAgIH1cbiAgICAgIC50aGVuIChyKSAtPiByLnRleHQoKVxuICAgICAgLmNhdGNoIChlKSAtPiBudWxsXG5cbiAgZ2V0SXNzdWVVcmw6IC0+XG4gICAgQGdldElzc3VlQm9keSgpLnRoZW4gKGlzc3VlQm9keSkgPT5cbiAgICAgIHJlcG9VcmwgPSBAZ2V0UmVwb1VybCgpXG4gICAgICByZXBvVXJsID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20nIHVubGVzcyByZXBvVXJsP1xuICAgICAgXCIje3JlcG9Vcmx9L2lzc3Vlcy9uZXc/dGl0bGU9I3tAZW5jb2RlVVJJKEBnZXRJc3N1ZVRpdGxlKCkpfSZib2R5PSN7QGVuY29kZVVSSShpc3N1ZUJvZHkpfVwiXG5cbiAgZW5jb2RlVVJJOiAoc3RyKSAtPlxuICAgIGVuY29kZVVSSShzdHIpLnJlcGxhY2UoLyMvZywgJyUyMycpLnJlcGxhY2UoLzsvZywgJyUzQicpLnJlcGxhY2UoLyUyMC9nLCAnKycpXG5cbiAgZ2V0SXNzdWVUaXRsZTogLT5cbiAgICB0aXRsZSA9IEBub3RpZmljYXRpb24uZ2V0TWVzc2FnZSgpXG4gICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKHByb2Nlc3MuZW52LkFUT01fSE9NRSwgJyRBVE9NX0hPTUUnKVxuICAgIGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJ1xuICAgICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKHByb2Nlc3MuZW52LlVTRVJQUk9GSUxFLCAnficpXG4gICAgICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UocGF0aC5zZXAsIHBhdGgucG9zaXguc2VwKSAjIFN0YW5kYXJkaXplIGlzc3VlIHRpdGxlc1xuICAgIGVsc2VcbiAgICAgIHRpdGxlID0gdGl0bGUucmVwbGFjZShwcm9jZXNzLmVudi5IT01FLCAnficpXG5cbiAgICBpZiB0aXRsZS5sZW5ndGggPiBUSVRMRV9DSEFSX0xJTUlUXG4gICAgICB0aXRsZSA9IHRpdGxlLnN1YnN0cmluZygwLCBUSVRMRV9DSEFSX0xJTUlUIC0gMykgKyAnLi4uJ1xuICAgIHRpdGxlLnJlcGxhY2UoL1xccj9cXG58XFxyL2csIFwiXCIpXG5cbiAgZ2V0SXNzdWVCb2R5OiAtPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICByZXR1cm4gcmVzb2x2ZShAaXNzdWVCb2R5KSBpZiBAaXNzdWVCb2R5XG4gICAgICBzeXN0ZW1Qcm9taXNlID0gVXNlclV0aWxpdGllcy5nZXRPU1ZlcnNpb24oKVxuICAgICAgbm9uQ29yZVBhY2thZ2VzUHJvbWlzZSA9IFVzZXJVdGlsaXRpZXMuZ2V0Tm9uQ29yZVBhY2thZ2VzKClcblxuICAgICAgUHJvbWlzZS5hbGwoW3N5c3RlbVByb21pc2UsIG5vbkNvcmVQYWNrYWdlc1Byb21pc2VdKS50aGVuIChhbGwpID0+XG4gICAgICAgIFtzeXN0ZW1OYW1lLCBub25Db3JlUGFja2FnZXNdID0gYWxsXG5cbiAgICAgICAgbWVzc2FnZSA9IEBub3RpZmljYXRpb24uZ2V0TWVzc2FnZSgpXG4gICAgICAgIG9wdGlvbnMgPSBAbm90aWZpY2F0aW9uLmdldE9wdGlvbnMoKVxuICAgICAgICByZXBvVXJsID0gQGdldFJlcG9VcmwoKVxuICAgICAgICBwYWNrYWdlTmFtZSA9IEBnZXRQYWNrYWdlTmFtZSgpXG4gICAgICAgIHBhY2thZ2VWZXJzaW9uID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKHBhY2thZ2VOYW1lKT8ubWV0YWRhdGE/LnZlcnNpb24gaWYgcGFja2FnZU5hbWU/XG4gICAgICAgIGNvcHlUZXh0ID0gJydcbiAgICAgICAgc3lzdGVtVXNlciA9IHByb2Nlc3MuZW52LlVTRVJcbiAgICAgICAgcm9vdFVzZXJTdGF0dXMgPSAnJ1xuXG4gICAgICAgIGlmIHN5c3RlbVVzZXIgaXMgJ3Jvb3QnXG4gICAgICAgICAgcm9vdFVzZXJTdGF0dXMgPSAnKipVc2VyKio6IHJvb3QnXG5cbiAgICAgICAgaWYgcGFja2FnZU5hbWU/IGFuZCByZXBvVXJsP1xuICAgICAgICAgIHBhY2thZ2VNZXNzYWdlID0gXCJbI3twYWNrYWdlTmFtZX1dKCN7cmVwb1VybH0pIHBhY2thZ2UgI3twYWNrYWdlVmVyc2lvbn1cIlxuICAgICAgICBlbHNlIGlmIHBhY2thZ2VOYW1lP1xuICAgICAgICAgIHBhY2thZ2VNZXNzYWdlID0gXCInI3twYWNrYWdlTmFtZX0nIHBhY2thZ2UgdiN7cGFja2FnZVZlcnNpb259XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHBhY2thZ2VNZXNzYWdlID0gJ0F0b20gQ29yZSdcblxuICAgICAgICBAaXNzdWVCb2R5ID0gXCJcIlwiXG4gICAgICAgICAgPCEtLVxuICAgICAgICAgIEhhdmUgeW91IHJlYWQgQXRvbSdzIENvZGUgb2YgQ29uZHVjdD8gQnkgZmlsaW5nIGFuIElzc3VlLCB5b3UgYXJlIGV4cGVjdGVkIHRvIGNvbXBseSB3aXRoIGl0LCBpbmNsdWRpbmcgdHJlYXRpbmcgZXZlcnlvbmUgd2l0aCByZXNwZWN0OiBodHRwczovL2dpdGh1Yi5jb20vYXRvbS8uZ2l0aHViL2Jsb2IvbWFzdGVyL0NPREVfT0ZfQ09ORFVDVC5tZFxuXG4gICAgICAgICAgRG8geW91IHdhbnQgdG8gYXNrIGEgcXVlc3Rpb24/IEFyZSB5b3UgbG9va2luZyBmb3Igc3VwcG9ydD8gVGhlIEF0b20gbWVzc2FnZSBib2FyZCBpcyB0aGUgYmVzdCBwbGFjZSBmb3IgZ2V0dGluZyBzdXBwb3J0OiBodHRwczovL2Rpc2N1c3MuYXRvbS5pb1xuICAgICAgICAgIC0tPlxuXG4gICAgICAgICAgIyMjIFByZXJlcXVpc2l0ZXNcblxuICAgICAgICAgICogWyBdIFB1dCBhbiBYIGJldHdlZW4gdGhlIGJyYWNrZXRzIG9uIHRoaXMgbGluZSBpZiB5b3UgaGF2ZSBkb25lIGFsbCBvZiB0aGUgZm9sbG93aW5nOlxuICAgICAgICAgICAgICAqIFJlcHJvZHVjZWQgdGhlIHByb2JsZW0gaW4gU2FmZSBNb2RlOiA8aHR0cHM6Ly9mbGlnaHQtbWFudWFsLmF0b20uaW8vaGFja2luZy1hdG9tL3NlY3Rpb25zL2RlYnVnZ2luZy8jdXNpbmctc2FmZS1tb2RlPlxuICAgICAgICAgICAgICAqIEZvbGxvd2VkIGFsbCBhcHBsaWNhYmxlIHN0ZXBzIGluIHRoZSBkZWJ1Z2dpbmcgZ3VpZGU6IDxodHRwczovL2ZsaWdodC1tYW51YWwuYXRvbS5pby9oYWNraW5nLWF0b20vc2VjdGlvbnMvZGVidWdnaW5nLz5cbiAgICAgICAgICAgICAgKiBDaGVja2VkIHRoZSBGQVFzIG9uIHRoZSBtZXNzYWdlIGJvYXJkIGZvciBjb21tb24gc29sdXRpb25zOiA8aHR0cHM6Ly9kaXNjdXNzLmF0b20uaW8vYy9mYXE+XG4gICAgICAgICAgICAgICogQ2hlY2tlZCB0aGF0IHlvdXIgaXNzdWUgaXNuJ3QgYWxyZWFkeSBmaWxlZDogPGh0dHBzOi8vZ2l0aHViLmNvbS9pc3N1ZXM/cT1pcyUzQWlzc3VlK3VzZXIlM0FhdG9tPlxuICAgICAgICAgICAgICAqIENoZWNrZWQgdGhhdCB0aGVyZSBpcyBub3QgYWxyZWFkeSBhbiBBdG9tIHBhY2thZ2UgdGhhdCBwcm92aWRlcyB0aGUgZGVzY3JpYmVkIGZ1bmN0aW9uYWxpdHk6IDxodHRwczovL2F0b20uaW8vcGFja2FnZXM+XG5cbiAgICAgICAgICAjIyMgRGVzY3JpcHRpb25cblxuICAgICAgICAgIDwhLS0gRGVzY3JpcHRpb24gb2YgdGhlIGlzc3VlIC0tPlxuXG4gICAgICAgICAgIyMjIFN0ZXBzIHRvIFJlcHJvZHVjZVxuXG4gICAgICAgICAgMS4gPCEtLSBGaXJzdCBTdGVwIC0tPlxuICAgICAgICAgIDIuIDwhLS0gU2Vjb25kIFN0ZXAgLS0+XG4gICAgICAgICAgMy4gPCEtLSBhbmQgc28gb27igKYgLS0+XG5cbiAgICAgICAgICAqKkV4cGVjdGVkIGJlaGF2aW9yOioqXG5cbiAgICAgICAgICA8IS0tIFdoYXQgeW91IGV4cGVjdCB0byBoYXBwZW4gLS0+XG5cbiAgICAgICAgICAqKkFjdHVhbCBiZWhhdmlvcjoqKlxuXG4gICAgICAgICAgPCEtLSBXaGF0IGFjdHVhbGx5IGhhcHBlbnMgLS0+XG5cbiAgICAgICAgICAjIyMgVmVyc2lvbnNcblxuICAgICAgICAgICoqQXRvbSoqOiAje2F0b20uZ2V0VmVyc2lvbigpfSAje3Byb2Nlc3MuYXJjaH1cbiAgICAgICAgICAqKkVsZWN0cm9uKio6ICN7cHJvY2Vzcy52ZXJzaW9ucy5lbGVjdHJvbn1cbiAgICAgICAgICAqKk9TKio6ICN7c3lzdGVtTmFtZX1cbiAgICAgICAgICAqKlRocm93biBGcm9tKio6ICN7cGFja2FnZU1lc3NhZ2V9XG4gICAgICAgICAgI3tyb290VXNlclN0YXR1c31cblxuICAgICAgICAgICMjIyBTdGFjayBUcmFjZVxuXG4gICAgICAgICAgI3ttZXNzYWdlfVxuXG4gICAgICAgICAgYGBgXG4gICAgICAgICAgQXQgI3tvcHRpb25zLmRldGFpbH1cblxuICAgICAgICAgICN7QG5vcm1hbGl6ZWRTdGFja1BhdGhzKG9wdGlvbnMuc3RhY2spfVxuICAgICAgICAgIGBgYFxuXG4gICAgICAgICAgIyMjIENvbW1hbmRzXG5cbiAgICAgICAgICAje0NvbW1hbmRMb2dnZXIuaW5zdGFuY2UoKS5nZXRUZXh0KCl9XG5cbiAgICAgICAgICAjIyMgTm9uLUNvcmUgUGFja2FnZXNcblxuICAgICAgICAgIGBgYFxuICAgICAgICAgICN7bm9uQ29yZVBhY2thZ2VzLmpvaW4oJ1xcbicpfVxuICAgICAgICAgIGBgYFxuXG4gICAgICAgICAgIyMjIEFkZGl0aW9uYWwgSW5mb3JtYXRpb25cblxuICAgICAgICAgIDwhLS0gQW55IGFkZGl0aW9uYWwgaW5mb3JtYXRpb24sIGNvbmZpZ3VyYXRpb24gb3IgZGF0YSB0aGF0IG1pZ2h0IGJlIG5lY2Vzc2FyeSB0byByZXByb2R1Y2UgdGhlIGlzc3VlLiAtLT5cbiAgICAgICAgICAje2NvcHlUZXh0fVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgcmVzb2x2ZShAaXNzdWVCb2R5KVxuXG4gIG5vcm1hbGl6ZWRTdGFja1BhdGhzOiAoc3RhY2spID0+XG4gICAgc3RhY2s/LnJlcGxhY2UgLyheXFxXK2F0ICkoW1xcdy5dezIsfSBbKF0pPyguKikoOlxcZCs6XFxkK1spXT8pL2dtLCAobSwgcDEsIHAyLCBwMywgcDQpID0+IHAxICsgKHAyIG9yICcnKSArXG4gICAgICBAbm9ybWFsaXplUGF0aChwMykgKyBwNFxuXG4gIG5vcm1hbGl6ZVBhdGg6IChwYXRoKSAtPlxuICAgIHBhdGgucmVwbGFjZSgnZmlsZTovLy8nLCAnJykgICAgICAgICAgICAgICAgICAgICAgICAgIyBSYW5kb21seSBpbnNlcnRlZCBmaWxlIHVybCBwcm90b2NvbHNcbiAgICAgICAgLnJlcGxhY2UoL1svXS9nLCAnXFxcXCcpICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBUZW1wIHN3aXRjaCBmb3IgV2luZG93cyBob21lIG1hdGNoaW5nXG4gICAgICAgIC5yZXBsYWNlKGZzLmdldEhvbWVEaXJlY3RvcnkoKSwgJ34nKSAgICAgICAgICAgICAjIFJlbW92ZSB1c2VycyBob21lIGRpciBmb3IgYXBtLWRldidlZCBwYWNrYWdlc1xuICAgICAgICAucmVwbGFjZSgvXFxcXC9nLCAnLycpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIFN3aXRjaCBcXCBiYWNrIHRvIC8gZm9yIGV2ZXJ5b25lXG4gICAgICAgIC5yZXBsYWNlKC8uKihcXC8oYXBwXFwuYXNhcnxwYWNrYWdlc1xcLykuKikvLCAnJDEnKSAjIFJlbW92ZSBldmVyeXRoaW5nIGJlZm9yZSBhcHAuYXNhciBvciBwYWNha2dlc1xuXG4gIGdldFJlcG9Vcmw6IC0+XG4gICAgcGFja2FnZU5hbWUgPSBAZ2V0UGFja2FnZU5hbWUoKVxuICAgIHJldHVybiB1bmxlc3MgcGFja2FnZU5hbWU/XG4gICAgcmVwbyA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZShwYWNrYWdlTmFtZSk/Lm1ldGFkYXRhPy5yZXBvc2l0b3J5XG4gICAgcmVwb1VybCA9IHJlcG8/LnVybCA/IHJlcG9cbiAgICB1bmxlc3MgcmVwb1VybFxuICAgICAgaWYgcGFja2FnZVBhdGggPSBhdG9tLnBhY2thZ2VzLnJlc29sdmVQYWNrYWdlUGF0aChwYWNrYWdlTmFtZSlcbiAgICAgICAgdHJ5XG4gICAgICAgICAgcmVwbyA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihwYWNrYWdlUGF0aCwgJ3BhY2thZ2UuanNvbicpKSk/LnJlcG9zaXRvcnlcbiAgICAgICAgICByZXBvVXJsID0gcmVwbz8udXJsID8gcmVwb1xuXG4gICAgcmVwb1VybD8ucmVwbGFjZSgvXFwuZ2l0JC8sICcnKS5yZXBsYWNlKC9eZ2l0XFwrLywgJycpXG5cbiAgZ2V0UGFja2FnZU5hbWVGcm9tRmlsZVBhdGg6IChmaWxlUGF0aCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIGZpbGVQYXRoXG5cbiAgICBwYWNrYWdlTmFtZSA9IC9cXC9cXC5hdG9tXFwvZGV2XFwvcGFja2FnZXNcXC8oW15cXC9dKylcXC8vLmV4ZWMoZmlsZVBhdGgpP1sxXVxuICAgIHJldHVybiBwYWNrYWdlTmFtZSBpZiBwYWNrYWdlTmFtZVxuXG4gICAgcGFja2FnZU5hbWUgPSAvXFxcXFxcLmF0b21cXFxcZGV2XFxcXHBhY2thZ2VzXFxcXChbXlxcXFxdKylcXFxcLy5leGVjKGZpbGVQYXRoKT9bMV1cbiAgICByZXR1cm4gcGFja2FnZU5hbWUgaWYgcGFja2FnZU5hbWVcblxuICAgIHBhY2thZ2VOYW1lID0gL1xcL1xcLmF0b21cXC9wYWNrYWdlc1xcLyhbXlxcL10rKVxcLy8uZXhlYyhmaWxlUGF0aCk/WzFdXG4gICAgcmV0dXJuIHBhY2thZ2VOYW1lIGlmIHBhY2thZ2VOYW1lXG5cbiAgICBwYWNrYWdlTmFtZSA9IC9cXFxcXFwuYXRvbVxcXFxwYWNrYWdlc1xcXFwoW15cXFxcXSspXFxcXC8uZXhlYyhmaWxlUGF0aCk/WzFdXG4gICAgcmV0dXJuIHBhY2thZ2VOYW1lIGlmIHBhY2thZ2VOYW1lXG5cbiAgZ2V0UGFja2FnZU5hbWU6IC0+XG4gICAgb3B0aW9ucyA9IEBub3RpZmljYXRpb24uZ2V0T3B0aW9ucygpXG5cbiAgICByZXR1cm4gb3B0aW9ucy5wYWNrYWdlTmFtZSBpZiBvcHRpb25zLnBhY2thZ2VOYW1lP1xuICAgIHJldHVybiB1bmxlc3Mgb3B0aW9ucy5zdGFjaz8gb3Igb3B0aW9ucy5kZXRhaWw/XG5cbiAgICBwYWNrYWdlUGF0aHMgPSBAZ2V0UGFja2FnZVBhdGhzQnlQYWNrYWdlTmFtZSgpXG4gICAgZm9yIHBhY2thZ2VOYW1lLCBwYWNrYWdlUGF0aCBvZiBwYWNrYWdlUGF0aHNcbiAgICAgIGlmIHBhY2thZ2VQYXRoLmluZGV4T2YocGF0aC5qb2luKCcuYXRvbScsICdkZXYnLCAncGFja2FnZXMnKSkgPiAtMSBvciBwYWNrYWdlUGF0aC5pbmRleE9mKHBhdGguam9pbignLmF0b20nLCAncGFja2FnZXMnKSkgPiAtMVxuICAgICAgICBwYWNrYWdlUGF0aHNbcGFja2FnZU5hbWVdID0gZnMucmVhbHBhdGhTeW5jKHBhY2thZ2VQYXRoKVxuXG4gICAgZ2V0UGFja2FnZU5hbWUgPSAoZmlsZVBhdGgpID0+XG4gICAgICBmaWxlUGF0aCA9IC9cXCgoLis/KTpcXGQrfFxcKCguKylcXCl8KC4rKS8uZXhlYyhmaWxlUGF0aClbMF1cblxuICAgICAgIyBTdGFjayB0cmFjZXMgbWF5IGJlIGEgZmlsZSBVUklcbiAgICAgIGlmIG1hdGNoID0gRmlsZVVSTFJlZ0V4cC5leGVjKGZpbGVQYXRoKVxuICAgICAgICBmaWxlUGF0aCA9IG1hdGNoWzFdXG5cbiAgICAgIGZpbGVQYXRoID0gcGF0aC5ub3JtYWxpemUoZmlsZVBhdGgpXG5cbiAgICAgIGlmIHBhdGguaXNBYnNvbHV0ZShmaWxlUGF0aClcbiAgICAgICAgZm9yIHBhY2tOYW1lLCBwYWNrYWdlUGF0aCBvZiBwYWNrYWdlUGF0aHNcbiAgICAgICAgICBjb250aW51ZSBpZiBmaWxlUGF0aCBpcyAnbm9kZS5qcydcbiAgICAgICAgICBpc1N1YmZvbGRlciA9IGZpbGVQYXRoLmluZGV4T2YocGF0aC5ub3JtYWxpemUocGFja2FnZVBhdGggKyBwYXRoLnNlcCkpIGlzIDBcbiAgICAgICAgICByZXR1cm4gcGFja05hbWUgaWYgaXNTdWJmb2xkZXJcbiAgICAgIEBnZXRQYWNrYWdlTmFtZUZyb21GaWxlUGF0aChmaWxlUGF0aClcblxuICAgIGlmIG9wdGlvbnMuZGV0YWlsPyBhbmQgcGFja2FnZU5hbWUgPSBnZXRQYWNrYWdlTmFtZShvcHRpb25zLmRldGFpbClcbiAgICAgIHJldHVybiBwYWNrYWdlTmFtZVxuXG4gICAgaWYgb3B0aW9ucy5zdGFjaz9cbiAgICAgIHN0YWNrID0gU3RhY2tUcmFjZVBhcnNlci5wYXJzZShvcHRpb25zLnN0YWNrKVxuICAgICAgZm9yIGkgaW4gWzAuLi5zdGFjay5sZW5ndGhdXG4gICAgICAgIHtmaWxlfSA9IHN0YWNrW2ldXG5cbiAgICAgICAgIyBFbXB0eSB3aGVuIGl0IHdhcyBydW4gZnJvbSB0aGUgZGV2IGNvbnNvbGVcbiAgICAgICAgcmV0dXJuIHVubGVzcyBmaWxlXG4gICAgICAgIHBhY2thZ2VOYW1lID0gZ2V0UGFja2FnZU5hbWUoZmlsZSlcbiAgICAgICAgcmV0dXJuIHBhY2thZ2VOYW1lIGlmIHBhY2thZ2VOYW1lP1xuXG4gICAgcmV0dXJuXG5cbiAgZ2V0UGFja2FnZVBhdGhzQnlQYWNrYWdlTmFtZTogLT5cbiAgICBwYWNrYWdlUGF0aHNCeVBhY2thZ2VOYW1lID0ge31cbiAgICBmb3IgcGFjayBpbiBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2VzKClcbiAgICAgIHBhY2thZ2VQYXRoc0J5UGFja2FnZU5hbWVbcGFjay5uYW1lXSA9IHBhY2sucGF0aFxuICAgIHBhY2thZ2VQYXRoc0J5UGFja2FnZU5hbWVcbiJdfQ==
