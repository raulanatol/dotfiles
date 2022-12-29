(function() {
  var ButtonListTemplate, ButtonTemplate, DOMPurify, FatalMetaNotificationTemplate, MetaNotificationTemplate, NotificationElement, NotificationIssue, NotificationTemplate, TemplateHelper, UserUtilities, addSplitLinesToContainer, createDOMPurify, fs, marked, path, shell;

  createDOMPurify = require('dompurify');

  fs = require('fs-plus');

  path = require('path');

  marked = require('marked');

  shell = require('electron').shell;

  NotificationIssue = require('./notification-issue');

  TemplateHelper = require('./template-helper');

  UserUtilities = require('./user-utilities');

  DOMPurify = null;

  NotificationTemplate = "<div class=\"content\">\n  <div class=\"message item\"></div>\n  <div class=\"detail item\">\n    <div class=\"detail-content\"></div>\n    <a href=\"#\" class=\"stack-toggle\"></a>\n    <div class=\"stack-container\"></div>\n  </div>\n  <div class=\"meta item\"></div>\n</div>\n<div class=\"close icon icon-x\"></div>\n<div class=\"close-all btn btn-error\">Close All</div>";

  FatalMetaNotificationTemplate = "<div class=\"description fatal-notification\"></div>\n<div class=\"btn-toolbar\">\n  <a href=\"#\" class=\"btn-issue btn btn-error\"></a>\n  <a href=\"#\" class=\"btn-copy-report icon icon-clippy\" title=\"Copy error report to clipboard\"></a>\n</div>";

  MetaNotificationTemplate = "<div class=\"description\"></div>";

  ButtonListTemplate = "<div class=\"btn-toolbar\"></div>";

  ButtonTemplate = "<a href=\"#\" class=\"btn\"></a>";

  module.exports = NotificationElement = (function() {
    NotificationElement.prototype.animationDuration = 360;

    NotificationElement.prototype.visibilityDuration = 5000;

    NotificationElement.prototype.autohideTimeout = null;

    function NotificationElement(model, visibilityDuration) {
      this.model = model;
      this.visibilityDuration = visibilityDuration;
      this.fatalTemplate = TemplateHelper.create(FatalMetaNotificationTemplate);
      this.metaTemplate = TemplateHelper.create(MetaNotificationTemplate);
      this.buttonListTemplate = TemplateHelper.create(ButtonListTemplate);
      this.buttonTemplate = TemplateHelper.create(ButtonTemplate);
      this.element = document.createElement('atom-notification');
      if (this.model.getType() === 'fatal') {
        this.issue = new NotificationIssue(this.model);
      }
      this.renderPromise = this.render()["catch"](function(e) {
        console.error(e.message);
        return console.error(e.stack);
      });
      this.model.onDidDismiss((function(_this) {
        return function() {
          return _this.removeNotification();
        };
      })(this));
      if (!this.model.isDismissable()) {
        this.autohide();
        this.element.addEventListener('click', this.makeDismissable.bind(this), {
          once: true
        });
      }
      this.element.issue = this.issue;
      this.element.getRenderPromise = this.getRenderPromise.bind(this);
    }

    NotificationElement.prototype.getModel = function() {
      return this.model;
    };

    NotificationElement.prototype.getRenderPromise = function() {
      return this.renderPromise;
    };

    NotificationElement.prototype.render = function() {
      var buttonClass, closeAllButton, closeButton, description, detail, metaContainer, metaContent, notificationContainer, options, stack, stackContainer, stackToggle, toolbar;
      this.element.classList.add("" + (this.model.getType()));
      this.element.classList.add("icon", "icon-" + (this.model.getIcon()), "native-key-bindings");
      if (detail = this.model.getDetail()) {
        this.element.classList.add('has-detail');
      }
      if (this.model.isDismissable()) {
        this.element.classList.add('has-close');
      }
      if (detail && (this.model.getOptions().stack != null)) {
        this.element.classList.add('has-stack');
      }
      this.element.setAttribute('tabindex', '-1');
      this.element.innerHTML = NotificationTemplate;
      options = this.model.getOptions();
      notificationContainer = this.element.querySelector('.message');
      if (DOMPurify === null) {
        DOMPurify = createDOMPurify();
      }
      notificationContainer.innerHTML = DOMPurify.sanitize(marked(this.model.getMessage()));
      if (detail = this.model.getDetail()) {
        addSplitLinesToContainer(this.element.querySelector('.detail-content'), detail);
        if (stack = options.stack) {
          stackToggle = this.element.querySelector('.stack-toggle');
          stackContainer = this.element.querySelector('.stack-container');
          addSplitLinesToContainer(stackContainer, stack);
          stackToggle.addEventListener('click', (function(_this) {
            return function(e) {
              return _this.handleStackTraceToggleClick(e, stackContainer);
            };
          })(this));
          this.handleStackTraceToggleClick({
            currentTarget: stackToggle
          }, stackContainer);
        }
      }
      if (metaContent = options.description) {
        this.element.classList.add('has-description');
        metaContainer = this.element.querySelector('.meta');
        metaContainer.appendChild(TemplateHelper.render(this.metaTemplate));
        description = this.element.querySelector('.description');
        description.innerHTML = marked(metaContent);
      }
      if (options.buttons && options.buttons.length > 0) {
        this.element.classList.add('has-buttons');
        metaContainer = this.element.querySelector('.meta');
        metaContainer.appendChild(TemplateHelper.render(this.buttonListTemplate));
        toolbar = this.element.querySelector('.btn-toolbar');
        buttonClass = this.model.getType();
        if (buttonClass === 'fatal') {
          buttonClass = 'error';
        }
        buttonClass = "btn-" + buttonClass;
        options.buttons.forEach((function(_this) {
          return function(button) {
            var buttonEl;
            toolbar.appendChild(TemplateHelper.render(_this.buttonTemplate));
            buttonEl = toolbar.childNodes[toolbar.childNodes.length - 1];
            buttonEl.textContent = button.text;
            buttonEl.classList.add(buttonClass);
            if (button.className != null) {
              buttonEl.classList.add.apply(buttonEl.classList, button.className.split(' '));
            }
            if (button.onDidClick != null) {
              return buttonEl.addEventListener('click', function(e) {
                return button.onDidClick.call(_this, e);
              });
            }
          };
        })(this));
      }
      closeButton = this.element.querySelector('.close');
      closeButton.addEventListener('click', (function(_this) {
        return function() {
          return _this.handleRemoveNotificationClick();
        };
      })(this));
      closeAllButton = this.element.querySelector('.close-all');
      closeAllButton.classList.add(this.getButtonClass());
      closeAllButton.addEventListener('click', (function(_this) {
        return function() {
          return _this.handleRemoveAllNotificationsClick();
        };
      })(this));
      if (this.model.getType() === 'fatal') {
        return this.renderFatalError();
      } else {
        return Promise.resolve();
      }
    };

    NotificationElement.prototype.renderFatalError = function() {
      var copyReportButton, fatalContainer, fatalNotification, issueButton, packageName, promises, repoUrl;
      repoUrl = this.issue.getRepoUrl();
      packageName = this.issue.getPackageName();
      fatalContainer = this.element.querySelector('.meta');
      fatalContainer.appendChild(TemplateHelper.render(this.fatalTemplate));
      fatalNotification = this.element.querySelector('.fatal-notification');
      issueButton = fatalContainer.querySelector('.btn-issue');
      copyReportButton = fatalContainer.querySelector('.btn-copy-report');
      atom.tooltips.add(copyReportButton, {
        title: copyReportButton.getAttribute('title')
      });
      copyReportButton.addEventListener('click', (function(_this) {
        return function(e) {
          e.preventDefault();
          return _this.issue.getIssueBody().then(function(issueBody) {
            return atom.clipboard.write(issueBody);
          });
        };
      })(this));
      if ((packageName != null) && (repoUrl != null)) {
        fatalNotification.innerHTML = "The error was thrown from the <a href=\"" + repoUrl + "\">" + packageName + " package</a>. ";
      } else if (packageName != null) {
        issueButton.remove();
        fatalNotification.textContent = "The error was thrown from the " + packageName + " package. ";
      } else {
        fatalNotification.textContent = "This is likely a bug in Atom. ";
      }
      if (issueButton.parentNode != null) {
        if ((packageName != null) && (repoUrl != null)) {
          issueButton.textContent = "Create issue on the " + packageName + " package";
        } else {
          issueButton.textContent = "Create issue on atom/atom";
        }
        promises = [];
        promises.push(this.issue.findSimilarIssues());
        promises.push(UserUtilities.checkAtomUpToDate());
        if (packageName != null) {
          promises.push(UserUtilities.checkPackageUpToDate(packageName));
        }
        return Promise.all(promises).then((function(_this) {
          return function(allData) {
            var atomCheck, issue, issues, packageCheck, packagePath, ref;
            issues = allData[0], atomCheck = allData[1], packageCheck = allData[2];
            if ((issues != null ? issues.open : void 0) || (issues != null ? issues.closed : void 0)) {
              issue = issues.open || issues.closed;
              issueButton.setAttribute('href', issue.html_url);
              issueButton.textContent = "View Issue";
              fatalNotification.innerHTML += " This issue has already been reported.";
            } else if ((packageCheck != null) && !packageCheck.upToDate && !packageCheck.isCore) {
              issueButton.setAttribute('href', '#');
              issueButton.textContent = "Check for package updates";
              issueButton.addEventListener('click', function(e) {
                var command;
                e.preventDefault();
                command = 'settings-view:check-for-package-updates';
                return atom.commands.dispatch(atom.views.getView(atom.workspace), command);
              });
              fatalNotification.innerHTML += "<code>" + packageName + "</code> is out of date: " + packageCheck.installedVersion + " installed;\n" + packageCheck.latestVersion + " latest.\nUpgrading to the latest version may fix this issue.";
            } else if ((packageCheck != null) && !packageCheck.upToDate && packageCheck.isCore) {
              issueButton.remove();
              fatalNotification.innerHTML += "<br><br>\nLocally installed core Atom package <code>" + packageName + "</code> is out of date: " + packageCheck.installedVersion + " installed locally;\n" + packageCheck.versionShippedWithAtom + " included with the version of Atom you're running.\nRemoving the locally installed version may fix this issue.";
              packagePath = (ref = atom.packages.getLoadedPackage(packageName)) != null ? ref.path : void 0;
              if (fs.isSymbolicLinkSync(packagePath)) {
                fatalNotification.innerHTML += "<br><br>\nUse: <code>apm unlink " + packagePath + "</code>";
              }
            } else if ((atomCheck != null) && !atomCheck.upToDate) {
              issueButton.remove();
              fatalNotification.innerHTML += "Atom is out of date: " + atomCheck.installedVersion + " installed;\n" + atomCheck.latestVersion + " latest.\nUpgrading to the <a href='https://github.com/atom/atom/releases/tag/v" + atomCheck.latestVersion + "'>latest version</a> may fix this issue.";
            } else {
              fatalNotification.innerHTML += " You can help by creating an issue. Please explain what actions triggered this error.";
              issueButton.addEventListener('click', function(e) {
                e.preventDefault();
                issueButton.classList.add('opening');
                return _this.issue.getIssueUrlForSystem().then(function(issueUrl) {
                  shell.openExternal(issueUrl);
                  return issueButton.classList.remove('opening');
                });
              });
            }
          };
        })(this));
      } else {
        return Promise.resolve();
      }
    };

    NotificationElement.prototype.makeDismissable = function() {
      if (!this.model.isDismissable()) {
        clearTimeout(this.autohideTimeout);
        this.model.options.dismissable = true;
        this.model.dismissed = false;
        return this.element.classList.add('has-close');
      }
    };

    NotificationElement.prototype.removeNotification = function() {
      if (!this.element.classList.contains('remove')) {
        this.element.classList.add('remove');
        return this.removeNotificationAfterTimeout();
      }
    };

    NotificationElement.prototype.handleRemoveNotificationClick = function() {
      this.removeNotification();
      return this.model.dismiss();
    };

    NotificationElement.prototype.handleRemoveAllNotificationsClick = function() {
      var i, len, notification, notifications;
      notifications = atom.notifications.getNotifications();
      for (i = 0, len = notifications.length; i < len; i++) {
        notification = notifications[i];
        atom.views.getView(notification).removeNotification();
        if (notification.isDismissable() && !notification.isDismissed()) {
          notification.dismiss();
        }
      }
    };

    NotificationElement.prototype.handleStackTraceToggleClick = function(e, container) {
      if (typeof e.preventDefault === "function") {
        e.preventDefault();
      }
      if (container.style.display === 'none') {
        e.currentTarget.innerHTML = '<span class="icon icon-dash"></span>Hide Stack Trace';
        return container.style.display = 'block';
      } else {
        e.currentTarget.innerHTML = '<span class="icon icon-plus"></span>Show Stack Trace';
        return container.style.display = 'none';
      }
    };

    NotificationElement.prototype.autohide = function() {
      return this.autohideTimeout = setTimeout((function(_this) {
        return function() {
          return _this.removeNotification();
        };
      })(this), this.visibilityDuration);
    };

    NotificationElement.prototype.removeNotificationAfterTimeout = function() {
      if (this.element === document.activeElement) {
        atom.workspace.getActivePane().activate();
      }
      return setTimeout((function(_this) {
        return function() {
          return _this.element.remove();
        };
      })(this), this.animationDuration);
    };

    NotificationElement.prototype.getButtonClass = function() {
      var type;
      type = "btn-" + (this.model.getType());
      if (type === 'btn-fatal') {
        return 'btn-error';
      } else {
        return type;
      }
    };

    return NotificationElement;

  })();

  addSplitLinesToContainer = function(container, content) {
    var div, i, len, line, ref;
    if (typeof content !== 'string') {
      content = content.toString();
    }
    ref = content.split('\n');
    for (i = 0, len = ref.length; i < len; i++) {
      line = ref[i];
      div = document.createElement('div');
      div.classList.add('line');
      div.textContent = line;
      container.appendChild(div);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvbm90aWZpY2F0aW9ucy9saWIvbm90aWZpY2F0aW9uLWVsZW1lbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxXQUFSOztFQUNsQixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDUixRQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUVWLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSxzQkFBUjs7RUFDcEIsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVI7O0VBQ2pCLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSOztFQUVoQixTQUFBLEdBQVk7O0VBRVosb0JBQUEsR0FBdUI7O0VBY3ZCLDZCQUFBLEdBQWdDOztFQVFoQyx3QkFBQSxHQUEyQjs7RUFJM0Isa0JBQUEsR0FBcUI7O0VBSXJCLGNBQUEsR0FBaUI7O0VBSWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ007a0NBQ0osaUJBQUEsR0FBbUI7O2tDQUNuQixrQkFBQSxHQUFvQjs7a0NBQ3BCLGVBQUEsR0FBaUI7O0lBRUosNkJBQUMsS0FBRCxFQUFTLGtCQUFUO01BQUMsSUFBQyxDQUFBLFFBQUQ7TUFBUSxJQUFDLENBQUEscUJBQUQ7TUFDcEIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsY0FBYyxDQUFDLE1BQWYsQ0FBc0IsNkJBQXRCO01BQ2pCLElBQUMsQ0FBQSxZQUFELEdBQWdCLGNBQWMsQ0FBQyxNQUFmLENBQXNCLHdCQUF0QjtNQUNoQixJQUFDLENBQUEsa0JBQUQsR0FBc0IsY0FBYyxDQUFDLE1BQWYsQ0FBc0Isa0JBQXRCO01BQ3RCLElBQUMsQ0FB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QUFBLENBQUEsSUFBQSxDQUFYLEVBRUUsSUFBQyxDQUFBLGlCQUZIO0lBSDhCOztrQ0FPaEMsY0FBQSxHQUFnQixTQUFBO0FBQ2QsVUFBQTtNQUFBLElBQUEsR0FBTyxNQUFBLEdBQU0sQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQSxDQUFEO01BQ2IsSUFBRyxJQUFBLEtBQVEsV0FBWDtlQUE0QixZQUE1QjtPQUFBLE1BQUE7ZUFBNkMsS0FBN0M7O0lBRmM7Ozs7OztFQUlsQix3QkFBQSxHQUEyQixTQUFDLFNBQUQsRUFBWSxPQUFaO0FBQ3pCLFFBQUE7SUFBQSxJQUFnQyxPQUFPLE9BQVAsS0FBb0IsUUFBcEQ7TUFBQSxPQUFBLEdBQVUsT0FBTyxDQUFDLFFBQVIsQ0FBQSxFQUFWOztBQUNBO0FBQUEsU0FBQSxxQ0FBQTs7TUFDRSxHQUFBLEdBQU0sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDTixHQUFHLENBQUMsU0FBUyxDQUFDLEdBQWQsQ0FBa0IsTUFBbEI7TUFDQSxHQUFHLENBQUMsV0FBSixHQUFrQjtNQUNsQixTQUFTLENBQUMsV0FBVixDQUFzQixHQUF0QjtBQUpGO0VBRnlCO0FBblMzQiIsInNvdXJjZXNDb250ZW50IjpbImNyZWF0ZURPTVB1cmlmeSA9IHJlcXVpcmUgJ2RvbXB1cmlmeSdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xubWFya2VkID0gcmVxdWlyZSAnbWFya2VkJ1xue3NoZWxsfSA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5Ob3RpZmljYXRpb25Jc3N1ZSA9IHJlcXVpcmUgJy4vbm90aWZpY2F0aW9uLWlzc3VlJ1xuVGVtcGxhdGVIZWxwZXIgPSByZXF1aXJlICcuL3RlbXBsYXRlLWhlbHBlcidcblVzZXJVdGlsaXRpZXMgPSByZXF1aXJlICcuL3VzZXItdXRpbGl0aWVzJ1xuXG5ET01QdXJpZnkgPSBudWxsXG5cbk5vdGlmaWNhdGlvblRlbXBsYXRlID0gXCJcIlwiXG4gIDxkaXYgY2xhc3M9XCJjb250ZW50XCI+XG4gICAgPGRpdiBjbGFzcz1cIm1lc3NhZ2UgaXRlbVwiPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJkZXRhaWwgaXRlbVwiPlxuICAgICAgPGRpdiBjbGFzcz1cImRldGFpbC1jb250ZW50XCI+PC9kaXY+XG4gICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwic3RhY2stdG9nZ2xlXCI+PC9hPlxuICAgICAgPGRpdiBjbGFzcz1cInN0YWNrLWNvbnRhaW5lclwiPjwvZGl2PlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJtZXRhIGl0ZW1cIj48L2Rpdj5cbiAgPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJjbG9zZSBpY29uIGljb24teFwiPjwvZGl2PlxuICA8ZGl2IGNsYXNzPVwiY2xvc2UtYWxsIGJ0biBidG4tZXJyb3JcIj5DbG9zZSBBbGw8L2Rpdj5cblwiXCJcIlxuXG5GYXRhbE1ldGFOb3RpZmljYXRpb25UZW1wbGF0ZSA9IFwiXCJcIlxuICA8ZGl2IGNsYXNzPVwiZGVzY3JpcHRpb24gZmF0YWwtbm90aWZpY2F0aW9uXCI+PC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJidG4tdG9vbGJhclwiPlxuICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJidG4taXNzdWUgYnRuIGJ0bi1lcnJvclwiPjwvYT5cbiAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiYnRuLWNvcHktcmVwb3J0IGljb24gaWNvbi1jbGlwcHlcIiB0aXRsZT1cIkNvcHkgZXJyb3IgcmVwb3J0IHRvIGNsaXBib2FyZFwiPjwvYT5cbiAgPC9kaXY+XG5cIlwiXCJcblxuTWV0YU5vdGlmaWNhdGlvblRlbXBsYXRlID0gXCJcIlwiXG4gIDxkaXYgY2xhc3M9XCJkZXNjcmlwdGlvblwiPjwvZGl2PlxuXCJcIlwiXG5cbkJ1dHRvbkxpc3RUZW1wbGF0ZSA9IFwiXCJcIlxuICA8ZGl2IGNsYXNzPVwiYnRuLXRvb2xiYXJcIj48L2Rpdj5cblwiXCJcIlxuXG5CdXR0b25UZW1wbGF0ZSA9IFwiXCJcIlxuICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiYnRuXCI+PC9hPlxuXCJcIlwiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE5vdGlmaWNhdGlvbkVsZW1lbnRcbiAgYW5pbWF0aW9uRHVyYXRpb246IDM2MFxuICB2aXNpYmlsaXR5RHVyYXRpb246IDUwMDBcbiAgYXV0b2hpZGVUaW1lb3V0OiBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAbW9kZWwsIEB2aXNpYmlsaXR5RHVyYXRpb24pIC0+XG4gICAgQGZhdGFsVGVtcGxhdGUgPSBUZW1wbGF0ZUhlbHBlci5jcmVhdGUoRmF0YWxNZXRhTm90aWZpY2F0aW9uVGVtcGxhdGUpXG4gICAgQG1ldGFUZW1wbGF0ZSA9IFRlbXBsYXRlSGVscGVyLmNyZWF0ZShNZXRhTm90aWZpY2F0aW9uVGVtcGxhdGUpXG4gICAgQGJ1dHRvbkxpc3RUZW1wbGF0ZSA9IFRlbXBsYXRlSGVscGVyLmNyZWF0ZShCdXR0b25MaXN0VGVtcGxhdGUpXG4gICAgQGJ1dHRvblRlbXBsYXRlID0gVGVtcGxhdGVIZWxwZXIuY3JlYXRlKEJ1dHRvblRlbXBsYXRlKVxuXG4gICAgQGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdG9tLW5vdGlmaWNhdGlvbicpXG4gICAgQGlzc3VlID0gbmV3IE5vdGlmaWNhdGlvbklzc3VlKEBtb2RlbCkgaWYgQG1vZGVsLmdldFR5cGUoKSBpcyAnZmF0YWwnXG4gICAgQHJlbmRlclByb21pc2UgPSBAcmVuZGVyKCkuY2F0Y2ggKGUpIC0+XG4gICAgICBjb25zb2xlLmVycm9yIGUubWVzc2FnZVxuICAgICAgY29uc29sZS5lcnJvciBlLnN0YWNrXG5cbiAgICBAbW9kZWwub25EaWREaXNtaXNzID0+IEByZW1vdmVOb3RpZmljYXRpb24oKVxuXG4gICAgdW5sZXNzIEBtb2RlbC5pc0Rpc21pc3NhYmxlKClcbiAgICAgIEBhdXRvaGlkZSgpXG4gICAgICBAZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIEBtYWtlRGlzbWlzc2FibGUuYmluZCh0aGlzKSwge29uY2U6IHRydWV9XG5cbiAgICBAZWxlbWVudC5pc3N1ZSA9IEBpc3N1ZVxuICAgIEBlbGVtZW50LmdldFJlbmRlclByb21pc2UgPSBAZ2V0UmVuZGVyUHJvbWlzZS5iaW5kKHRoaXMpXG5cbiAgZ2V0TW9kZWw6IC0+IEBtb2RlbFxuXG4gIGdldFJlbmRlclByb21pc2U6IC0+IEByZW5kZXJQcm9taXNlXG5cbiAgcmVuZGVyOiAtPlxuICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQgXCIje0Btb2RlbC5nZXRUeXBlKCl9XCJcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkIFwiaWNvblwiLCBcImljb24tI3tAbW9kZWwuZ2V0SWNvbigpfVwiLCBcIm5hdGl2ZS1rZXktYmluZGluZ3NcIlxuXG4gICAgQGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGFzLWRldGFpbCcpIGlmIGRldGFpbCA9IEBtb2RlbC5nZXREZXRhaWwoKVxuICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hhcy1jbG9zZScpIGlmIEBtb2RlbC5pc0Rpc21pc3NhYmxlKClcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdoYXMtc3RhY2snKSBpZiBkZXRhaWwgYW5kIEBtb2RlbC5nZXRPcHRpb25zKCkuc3RhY2s/XG5cbiAgICBAZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJylcblxuICAgIEBlbGVtZW50LmlubmVySFRNTCA9IE5vdGlmaWNhdGlvblRlbXBsYXRlXG5cbiAgICBvcHRpb25zID0gQG1vZGVsLmdldE9wdGlvbnMoKVxuXG4gICAgbm90aWZpY2F0aW9uQ29udGFpbmVyID0gQGVsZW1lbnQucXVlcnlTZWxlY3RvcignLm1lc3NhZ2UnKVxuXG4gICAgaWYgRE9NUHVyaWZ5IGlzIG51bGxcbiAgICAgIERPTVB1cmlmeSA9IGNyZWF0ZURPTVB1cmlmeSgpXG4gICAgbm90aWZpY2F0aW9uQ29udGFpbmVyLmlubmVySFRNTCA9IERPTVB1cmlmeS5zYW5pdGl6ZShtYXJrZWQoQG1vZGVsLmdldE1lc3NhZ2UoKSkpXG5cbiAgICBpZiBkZXRhaWwgPSBAbW9kZWwuZ2V0RGV0YWlsKClcbiAgICAgIGFkZFNwbGl0TGluZXNUb0NvbnRhaW5lcihAZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZGV0YWlsLWNvbnRlbnQnKSwgZGV0YWlsKVxuXG4gICAgICBpZiBzdGFjayA9IG9wdGlvbnMuc3RhY2tcbiAgICAgICAgc3RhY2tUb2dnbGUgPSBAZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc3RhY2stdG9nZ2xlJylcbiAgICAgICAgc3RhY2tDb250YWluZXIgPSBAZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc3RhY2stY29udGFpbmVyJylcblxuICAgICAgICBhZGRTcGxpdExpbmVzVG9Db250YWluZXIoc3RhY2tDb250YWluZXIsIHN0YWNrKVxuXG4gICAgICAgIHN0YWNrVG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgKGUpID0+IEBoYW5kbGVTdGFja1RyYWNlVG9nZ2xlQ2xpY2soZSwgc3RhY2tDb250YWluZXIpXG4gICAgICAgIEBoYW5kbGVTdGFja1RyYWNlVG9nZ2xlQ2xpY2soe2N1cnJlbnRUYXJnZXQ6IHN0YWNrVG9nZ2xlfSwgc3RhY2tDb250YWluZXIpXG5cbiAgICBpZiBtZXRhQ29udGVudCA9IG9wdGlvbnMuZGVzY3JpcHRpb25cbiAgICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hhcy1kZXNjcmlwdGlvbicpXG4gICAgICBtZXRhQ29udGFpbmVyID0gQGVsZW1lbnQucXVlcnlTZWxlY3RvcignLm1ldGEnKVxuICAgICAgbWV0YUNvbnRhaW5lci5hcHBlbmRDaGlsZChUZW1wbGF0ZUhlbHBlci5yZW5kZXIoQG1ldGFUZW1wbGF0ZSkpXG4gICAgICBkZXNjcmlwdGlvbiA9IEBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kZXNjcmlwdGlvbicpXG4gICAgICBkZXNjcmlwdGlvbi5pbm5lckhUTUwgPSBtYXJrZWQobWV0YUNvbnRlbnQpXG5cbiAgICBpZiBvcHRpb25zLmJ1dHRvbnMgYW5kIG9wdGlvbnMuYnV0dG9ucy5sZW5ndGggPiAwXG4gICAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdoYXMtYnV0dG9ucycpXG4gICAgICBtZXRhQ29udGFpbmVyID0gQGVsZW1lbnQucXVlcnlTZWxlY3RvcignLm1ldGEnKVxuICAgICAgbWV0YUNvbnRhaW5lci5hcHBlbmRDaGlsZChUZW1wbGF0ZUhlbHBlci5yZW5kZXIoQGJ1dHRvbkxpc3RUZW1wbGF0ZSkpXG4gICAgICB0b29sYmFyID0gQGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi10b29sYmFyJylcbiAgICAgIGJ1dHRvbkNsYXNzID0gQG1vZGVsLmdldFR5cGUoKVxuICAgICAgYnV0dG9uQ2xhc3MgPSAnZXJyb3InIGlmIGJ1dHRvbkNsYXNzIGlzICdmYXRhbCdcbiAgICAgIGJ1dHRvbkNsYXNzID0gXCJidG4tI3tidXR0b25DbGFzc31cIlxuICAgICAgb3B0aW9ucy5idXR0b25zLmZvckVhY2ggKGJ1dHRvbikgPT5cbiAgICAgICAgdG9vbGJhci5hcHBlbmRDaGlsZChUZW1wbGF0ZUhlbHBlci5yZW5kZXIoQGJ1dHRvblRlbXBsYXRlKSlcbiAgICAgICAgYnV0dG9uRWwgPSB0b29sYmFyLmNoaWxkTm9kZXNbdG9vbGJhci5jaGlsZE5vZGVzLmxlbmd0aCAtIDFdXG4gICAgICAgIGJ1dHRvbkVsLnRleHRDb250ZW50ID0gYnV0dG9uLnRleHRcbiAgICAgICAgYnV0dG9uRWwuY2xhc3NMaXN0LmFkZChidXR0b25DbGFzcylcbiAgICAgICAgaWYgYnV0dG9uLmNsYXNzTmFtZT9cbiAgICAgICAgICBidXR0b25FbC5jbGFzc0xpc3QuYWRkLmFwcGx5KGJ1dHRvbkVsLmNsYXNzTGlzdCwgYnV0dG9uLmNsYXNzTmFtZS5zcGxpdCgnICcpKVxuICAgICAgICBpZiBidXR0b24ub25EaWRDbGljaz9cbiAgICAgICAgICBidXR0b25FbC5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIChlKSA9PlxuICAgICAgICAgICAgYnV0dG9uLm9uRGlkQ2xpY2suY2FsbCh0aGlzLCBlKVxuXG4gICAgY2xvc2VCdXR0b24gPSBAZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY2xvc2UnKVxuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgPT4gQGhhbmRsZVJlbW92ZU5vdGlmaWNhdGlvbkNsaWNrKClcblxuICAgIGNsb3NlQWxsQnV0dG9uID0gQGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNsb3NlLWFsbCcpXG4gICAgY2xvc2VBbGxCdXR0b24uY2xhc3NMaXN0LmFkZCBAZ2V0QnV0dG9uQ2xhc3MoKVxuICAgIGNsb3NlQWxsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgPT4gQGhhbmRsZVJlbW92ZUFsbE5vdGlmaWNhdGlvbnNDbGljaygpXG5cbiAgICBpZiBAbW9kZWwuZ2V0VHlwZSgpIGlzICdmYXRhbCdcbiAgICAgIEByZW5kZXJGYXRhbEVycm9yKClcbiAgICBlbHNlXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxuXG4gIHJlbmRlckZhdGFsRXJyb3I6IC0+XG4gICAgcmVwb1VybCA9IEBpc3N1ZS5nZXRSZXBvVXJsKClcbiAgICBwYWNrYWdlTmFtZSA9IEBpc3N1ZS5nZXRQYWNrYWdlTmFtZSgpXG5cbiAgICBmYXRhbENvbnRhaW5lciA9IEBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZXRhJylcbiAgICBmYXRhbENvbnRhaW5lci5hcHBlbmRDaGlsZChUZW1wbGF0ZUhlbHBlci5yZW5kZXIoQGZhdGFsVGVtcGxhdGUpKVxuICAgIGZhdGFsTm90aWZpY2F0aW9uID0gQGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZhdGFsLW5vdGlmaWNhdGlvbicpXG5cbiAgICBpc3N1ZUJ1dHRvbiA9IGZhdGFsQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5idG4taXNzdWUnKVxuXG4gICAgY29weVJlcG9ydEJ1dHRvbiA9IGZhdGFsQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5idG4tY29weS1yZXBvcnQnKVxuICAgIGF0b20udG9vbHRpcHMuYWRkKGNvcHlSZXBvcnRCdXR0b24sIHRpdGxlOiBjb3B5UmVwb3J0QnV0dG9uLmdldEF0dHJpYnV0ZSgndGl0bGUnKSlcbiAgICBjb3B5UmVwb3J0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEBpc3N1ZS5nZXRJc3N1ZUJvZHkoKS50aGVuIChpc3N1ZUJvZHkpIC0+XG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGlzc3VlQm9keSlcblxuICAgIGlmIHBhY2thZ2VOYW1lPyBhbmQgcmVwb1VybD9cbiAgICAgIGZhdGFsTm90aWZpY2F0aW9uLmlubmVySFRNTCA9IFwiVGhlIGVycm9yIHdhcyB0aHJvd24gZnJvbSB0aGUgPGEgaHJlZj1cXFwiI3tyZXBvVXJsfVxcXCI+I3twYWNrYWdlTmFtZX0gcGFja2FnZTwvYT4uIFwiXG4gICAgZWxzZSBpZiBwYWNrYWdlTmFtZT9cbiAgICAgIGlzc3VlQnV0dG9uLnJlbW92ZSgpXG4gICAgICBmYXRhbE5vdGlmaWNhdGlvbi50ZXh0Q29udGVudCA9IFwiVGhlIGVycm9yIHdhcyB0aHJvd24gZnJvbSB0aGUgI3twYWNrYWdlTmFtZX0gcGFja2FnZS4gXCJcbiAgICBlbHNlXG4gICAgICBmYXRhbE5vdGlmaWNhdGlvbi50ZXh0Q29udGVudCA9IFwiVGhpcyBpcyBsaWtlbHkgYSBidWcgaW4gQXRvbS4gXCJcblxuICAgICMgV2Ugb25seSBzaG93IHRoZSBjcmVhdGUgaXNzdWUgYnV0dG9uIGlmIGl0J3MgY2xlYXJseSBpbiBhdG9tIGNvcmUgb3IgaW4gYSBwYWNrYWdlIHdpdGggYSByZXBvIHVybFxuICAgIGlmIGlzc3VlQnV0dG9uLnBhcmVudE5vZGU/XG4gICAgICBpZiBwYWNrYWdlTmFtZT8gYW5kIHJlcG9Vcmw/XG4gICAgICAgIGlzc3VlQnV0dG9uLnRleHRDb250ZW50ID0gXCJDcmVhdGUgaXNzdWUgb24gdGhlICN7cGFja2FnZU5hbWV9IHBhY2thZ2VcIlxuICAgICAgZWxzZVxuICAgICAgICBpc3N1ZUJ1dHRvbi50ZXh0Q29udGVudCA9IFwiQ3JlYXRlIGlzc3VlIG9uIGF0b20vYXRvbVwiXG5cbiAgICAgIHByb21pc2VzID0gW11cbiAgICAgIHByb21pc2VzLnB1c2ggQGlzc3VlLmZpbmRTaW1pbGFySXNzdWVzKClcbiAgICAgIHByb21pc2VzLnB1c2ggVXNlclV0aWxpdGllcy5jaGVja0F0b21VcFRvRGF0ZSgpXG4gICAgICBwcm9taXNlcy5wdXNoIFVzZXJVdGlsaXRpZXMuY2hlY2tQYWNrYWdlVXBUb0RhdGUocGFja2FnZU5hbWUpIGlmIHBhY2thZ2VOYW1lP1xuXG4gICAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbiAoYWxsRGF0YSkgPT5cbiAgICAgICAgW2lzc3VlcywgYXRvbUNoZWNrLCBwYWNrYWdlQ2hlY2tdID0gYWxsRGF0YVxuXG4gICAgICAgIGlmIGlzc3Vlcz8ub3BlbiBvciBpc3N1ZXM/LmNsb3NlZFxuICAgICAgICAgIGlzc3VlID0gaXNzdWVzLm9wZW4gb3IgaXNzdWVzLmNsb3NlZFxuICAgICAgICAgIGlzc3VlQnV0dG9uLnNldEF0dHJpYnV0ZSgnaHJlZicsIGlzc3VlLmh0bWxfdXJsKVxuICAgICAgICAgIGlzc3VlQnV0dG9uLnRleHRDb250ZW50ID0gXCJWaWV3IElzc3VlXCJcbiAgICAgICAgICBmYXRhbE5vdGlmaWNhdGlvbi5pbm5lckhUTUwgKz0gXCIgVGhpcyBpc3N1ZSBoYXMgYWxyZWFkeSBiZWVuIHJlcG9ydGVkLlwiXG4gICAgICAgIGVsc2UgaWYgcGFja2FnZUNoZWNrPyBhbmQgbm90IHBhY2thZ2VDaGVjay51cFRvRGF0ZSBhbmQgbm90IHBhY2thZ2VDaGVjay5pc0NvcmVcbiAgICAgICAgICBpc3N1ZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnIycpXG4gICAgICAgICAgaXNzdWVCdXR0b24udGV4dENvbnRlbnQgPSBcIkNoZWNrIGZvciBwYWNrYWdlIHVwZGF0ZXNcIlxuICAgICAgICAgIGlzc3VlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgKGUpIC0+XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIGNvbW1hbmQgPSAnc2V0dGluZ3MtdmlldzpjaGVjay1mb3ItcGFja2FnZS11cGRhdGVzJ1xuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCBjb21tYW5kKVxuXG4gICAgICAgICAgZmF0YWxOb3RpZmljYXRpb24uaW5uZXJIVE1MICs9IFwiXCJcIlxuICAgICAgICAgICAgPGNvZGU+I3twYWNrYWdlTmFtZX08L2NvZGU+IGlzIG91dCBvZiBkYXRlOiAje3BhY2thZ2VDaGVjay5pbnN0YWxsZWRWZXJzaW9ufSBpbnN0YWxsZWQ7XG4gICAgICAgICAgICAje3BhY2thZ2VDaGVjay5sYXRlc3RWZXJzaW9ufSBsYXRlc3QuXG4gICAgICAgICAgICBVcGdyYWRpbmcgdG8gdGhlIGxhdGVzdCB2ZXJzaW9uIG1heSBmaXggdGhpcyBpc3N1ZS5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZWxzZSBpZiBwYWNrYWdlQ2hlY2s/IGFuZCBub3QgcGFja2FnZUNoZWNrLnVwVG9EYXRlIGFuZCBwYWNrYWdlQ2hlY2suaXNDb3JlXG4gICAgICAgICAgaXNzdWVCdXR0b24ucmVtb3ZlKClcblxuICAgICAgICAgIGZhdGFsTm90aWZpY2F0aW9uLmlubmVySFRNTCArPSBcIlwiXCJcbiAgICAgICAgICAgIDxicj48YnI+XG4gICAgICAgICAgICBMb2NhbGx5IGluc3RhbGxlZCBjb3JlIEF0b20gcGFja2FnZSA8Y29kZT4je3BhY2thZ2VOYW1lfTwvY29kZT4gaXMgb3V0IG9mIGRhdGU6ICN7cGFja2FnZUNoZWNrLmluc3RhbGxlZFZlcnNpb259IGluc3RhbGxlZCBsb2NhbGx5O1xuICAgICAgICAgICAgI3twYWNrYWdlQ2hlY2sudmVyc2lvblNoaXBwZWRXaXRoQXRvbX0gaW5jbHVkZWQgd2l0aCB0aGUgdmVyc2lvbiBvZiBBdG9tIHlvdSdyZSBydW5uaW5nLlxuICAgICAgICAgICAgUmVtb3ZpbmcgdGhlIGxvY2FsbHkgaW5zdGFsbGVkIHZlcnNpb24gbWF5IGZpeCB0aGlzIGlzc3VlLlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgcGFja2FnZVBhdGggPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UocGFja2FnZU5hbWUpPy5wYXRoXG4gICAgICAgICAgaWYgZnMuaXNTeW1ib2xpY0xpbmtTeW5jKHBhY2thZ2VQYXRoKVxuICAgICAgICAgICAgZmF0YWxOb3RpZmljYXRpb24uaW5uZXJIVE1MICs9IFwiXCJcIlxuICAgICAgICAgICAgPGJyPjxicj5cbiAgICAgICAgICAgIFVzZTogPGNvZGU+YXBtIHVubGluayAje3BhY2thZ2VQYXRofTwvY29kZT5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZWxzZSBpZiBhdG9tQ2hlY2s/IGFuZCBub3QgYXRvbUNoZWNrLnVwVG9EYXRlXG4gICAgICAgICAgaXNzdWVCdXR0b24ucmVtb3ZlKClcblxuICAgICAgICAgIGZhdGFsTm90aWZpY2F0aW9uLmlubmVySFRNTCArPSBcIlwiXCJcbiAgICAgICAgICAgIEF0b20gaXMgb3V0IG9mIGRhdGU6ICN7YXRvbUNoZWNrLmluc3RhbGxlZFZlcnNpb259IGluc3RhbGxlZDtcbiAgICAgICAgICAgICN7YXRvbUNoZWNrLmxhdGVzdFZlcnNpb259IGxhdGVzdC5cbiAgICAgICAgICAgIFVwZ3JhZGluZyB0byB0aGUgPGEgaHJlZj0naHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9yZWxlYXNlcy90YWcvdiN7YXRvbUNoZWNrLmxhdGVzdFZlcnNpb259Jz5sYXRlc3QgdmVyc2lvbjwvYT4gbWF5IGZpeCB0aGlzIGlzc3VlLlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgZmF0YWxOb3RpZmljYXRpb24uaW5uZXJIVE1MICs9IFwiIFlvdSBjYW4gaGVscCBieSBjcmVhdGluZyBhbiBpc3N1ZS4gUGxlYXNlIGV4cGxhaW4gd2hhdCBhY3Rpb25zIHRyaWdnZXJlZCB0aGlzIGVycm9yLlwiXG4gICAgICAgICAgaXNzdWVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAoZSkgPT5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgaXNzdWVCdXR0b24uY2xhc3NMaXN0LmFkZCgnb3BlbmluZycpXG4gICAgICAgICAgICBAaXNzdWUuZ2V0SXNzdWVVcmxGb3JTeXN0ZW0oKS50aGVuIChpc3N1ZVVybCkgLT5cbiAgICAgICAgICAgICAgc2hlbGwub3BlbkV4dGVybmFsKGlzc3VlVXJsKVxuICAgICAgICAgICAgICBpc3N1ZUJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuaW5nJylcblxuICAgICAgICByZXR1cm5cbiAgICBlbHNlXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxuXG4gIG1ha2VEaXNtaXNzYWJsZTogLT5cbiAgICB1bmxlc3MgQG1vZGVsLmlzRGlzbWlzc2FibGUoKVxuICAgICAgY2xlYXJUaW1lb3V0KEBhdXRvaGlkZVRpbWVvdXQpXG4gICAgICBAbW9kZWwub3B0aW9ucy5kaXNtaXNzYWJsZSA9IHRydWVcbiAgICAgIEBtb2RlbC5kaXNtaXNzZWQgPSBmYWxzZVxuICAgICAgQGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGFzLWNsb3NlJylcblxuICByZW1vdmVOb3RpZmljYXRpb246IC0+XG4gICAgdW5sZXNzIEBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncmVtb3ZlJylcbiAgICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3JlbW92ZScpXG4gICAgICBAcmVtb3ZlTm90aWZpY2F0aW9uQWZ0ZXJUaW1lb3V0KClcblxuICBoYW5kbGVSZW1vdmVOb3RpZmljYXRpb25DbGljazogLT5cbiAgICBAcmVtb3ZlTm90aWZpY2F0aW9uKClcbiAgICBAbW9kZWwuZGlzbWlzcygpXG5cbiAgaGFuZGxlUmVtb3ZlQWxsTm90aWZpY2F0aW9uc0NsaWNrOiAtPlxuICAgIG5vdGlmaWNhdGlvbnMgPSBhdG9tLm5vdGlmaWNhdGlvbnMuZ2V0Tm90aWZpY2F0aW9ucygpXG4gICAgZm9yIG5vdGlmaWNhdGlvbiBpbiBub3RpZmljYXRpb25zXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcobm90aWZpY2F0aW9uKS5yZW1vdmVOb3RpZmljYXRpb24oKVxuICAgICAgaWYgbm90aWZpY2F0aW9uLmlzRGlzbWlzc2FibGUoKSBhbmQgbm90IG5vdGlmaWNhdGlvbi5pc0Rpc21pc3NlZCgpXG4gICAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzKClcbiAgICByZXR1cm5cblxuICBoYW5kbGVTdGFja1RyYWNlVG9nZ2xlQ2xpY2s6IChlLCBjb250YWluZXIpIC0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdD8oKVxuICAgIGlmIGNvbnRhaW5lci5zdHlsZS5kaXNwbGF5IGlzICdub25lJ1xuICAgICAgZS5jdXJyZW50VGFyZ2V0LmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cImljb24gaWNvbi1kYXNoXCI+PC9zcGFuPkhpZGUgU3RhY2sgVHJhY2UnXG4gICAgICBjb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICBlbHNlXG4gICAgICBlLmN1cnJlbnRUYXJnZXQuaW5uZXJIVE1MID0gJzxzcGFuIGNsYXNzPVwiaWNvbiBpY29uLXBsdXNcIj48L3NwYW4+U2hvdyBTdGFjayBUcmFjZSdcbiAgICAgIGNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG5cbiAgYXV0b2hpZGU6IC0+XG4gICAgQGF1dG9oaWRlVGltZW91dCA9IHNldFRpbWVvdXQgPT5cbiAgICAgIEByZW1vdmVOb3RpZmljYXRpb24oKVxuICAgICwgQHZpc2liaWxpdHlEdXJhdGlvblxuXG4gIHJlbW92ZU5vdGlmaWNhdGlvbkFmdGVyVGltZW91dDogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKSBpZiBAZWxlbWVudCBpcyBkb2N1bWVudC5hY3RpdmVFbGVtZW50XG5cbiAgICBzZXRUaW1lb3V0ID0+XG4gICAgICBAZWxlbWVudC5yZW1vdmUoKVxuICAgICwgQGFuaW1hdGlvbkR1cmF0aW9uICMga2VlcCBpbiBzeW5jIHdpdGggQ1NTIGFuaW1hdGlvblxuXG4gIGdldEJ1dHRvbkNsYXNzOiAtPlxuICAgIHR5cGUgPSBcImJ0bi0je0Btb2RlbC5nZXRUeXBlKCl9XCJcbiAgICBpZiB0eXBlIGlzICdidG4tZmF0YWwnIHRoZW4gJ2J0bi1lcnJvcicgZWxzZSB0eXBlXG5cbmFkZFNwbGl0TGluZXNUb0NvbnRhaW5lciA9IChjb250YWluZXIsIGNvbnRlbnQpIC0+XG4gIGNvbnRlbnQgPSBjb250ZW50LnRvU3RyaW5nKCkgaWYgdHlwZW9mIGNvbnRlbnQgaXNudCAnc3RyaW5nJ1xuICBmb3IgbGluZSBpbiBjb250ZW50LnNwbGl0KCdcXG4nKVxuICAgIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZGl2LmNsYXNzTGlzdC5hZGQgJ2xpbmUnXG4gICAgZGl2LnRleHRDb250ZW50ID0gbGluZVxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpXG4gIHJldHVyblxuIl19
