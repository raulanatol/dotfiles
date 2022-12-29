(function() {
  var CompositeDisposable, Notification, NotificationElement, Notifications, NotificationsLog, StackTraceParser, fs, isCoreOrPackageStackTrace, ref;

  ref = require('atom'), Notification = ref.Notification, CompositeDisposable = ref.CompositeDisposable;

  fs = require('fs-plus');

  StackTraceParser = null;

  NotificationElement = require('./notification-element');

  NotificationsLog = require('./notifications-log');

  Notifications = {
    isInitialized: false,
    subscriptions: null,
    duplicateTimeDelay: 500,
    lastNotification: null,
    activate: function(state) {
      var CommandLogger, i, len, notification, ref1;
      CommandLogger = require('./command-logger');
      CommandLogger.start();
      this.subscriptions = new CompositeDisposable;
      ref1 = atom.notifications.getNotifications();
      for (i = 0, len = ref1.length; i < len; i++) {
        notification = ref1[i];
        this.addNotificationView(notification);
      }
      this.subscriptions.add(atom.notifications.onDidAddNotification((function(_this) {
        return function(notification) {
          return _this.addNotificationView(notification);
        };
      })(this)));
      this.subscriptions.add(atom.onWillThrowError(function(arg) {
        var line, match, message, options, originalError, preventDefault, url;
        message = arg.message, url = arg.url, line = arg.line, originalError = arg.originalError, preventDefault = arg.preventDefault;
        if (originalError.name === 'BufferedProcessError') {
          message = message.replace('Uncaught BufferedProcessError: ', '');
          return atom.notifications.addError(message, {
            dismissable: true
          });
        } else if (originalError.code === 'ENOENT' && !/\/atom/i.test(message) && (match = /spawn (.+) ENOENT/.exec(message))) {
          message = "'" + match[1] + "' could not be spawned.\nIs it installed and on your path?\nIf so please open an issue on the package spawning the process.";
          return atom.notifications.addError(message, {
            dismissable: true
          });
        } else if (!atom.inDevMode() || atom.config.get('notifications.showErrorsInDevMode')) {
          preventDefault();
          if (originalError.stack && !isCoreOrPackageStackTrace(originalError.stack)) {
            return;
          }
          options = {
            detail: url + ":" + line,
            stack: originalError.stack,
            dismissable: true
          };
          return atom.notifications.addFatalError(message, options);
        }
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'core:cancel', function() {
        var j, len1, ref2, results;
        ref2 = atom.notifications.getNotifications();
        results = [];
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          notification = ref2[j];
          results.push(notification.dismiss());
        }
        return results;
      }));
      this.subscriptions.add(atom.config.observe('notifications.defaultTimeout', (function(_this) {
        return function(value) {
          return _this.visibilityDuration = value;
        };
      })(this)));
      if (atom.inDevMode()) {
        this.subscriptions.add(atom.commands.add('atom-workspace', 'notifications:trigger-error', function() {
          var error, options;
          try {
            return abc + 2;
          } catch (error1) {
            error = error1;
            options = {
              detail: error.stack.split('\n')[1],
              stack: error.stack,
              dismissable: true
            };
            return atom.notifications.addFatalError("Uncaught " + (error.stack.split('\n')[0]), options);
          }
        }));
      }
      if (this.notificationsLog != null) {
        this.addNotificationsLogSubscriptions();
      }
      this.subscriptions.add(atom.workspace.addOpener((function(_this) {
        return function(uri) {
          if (uri === NotificationsLog.prototype.getURI()) {
            return _this.createLog();
          }
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'notifications:toggle-log', function() {
        return atom.workspace.toggle(NotificationsLog.prototype.getURI());
      }));
      return this.subscriptions.add(atom.commands.add('atom-workspace', 'notifications:clear-log', function() {
        var j, len1, ref2;
        ref2 = atom.notifications.getNotifications();
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          notification = ref2[j];
          notification.options.dismissable = true;
          notification.dismissed = false;
          notification.dismiss();
        }
        return atom.notifications.clear();
      }));
    },
    deactivate: function() {
      var ref1, ref2, ref3;
      this.subscriptions.dispose();
      if ((ref1 = this.notificationsElement) != null) {
        ref1.remove();
      }
      if ((ref2 = this.notificationsPanel) != null) {
        ref2.destroy();
      }
      if ((ref3 = this.notificationsLog) != null) {
        ref3.destroy();
      }
      this.subscriptions = null;
      this.notificationsElement = null;
      this.notificationsPanel = null;
      return this.isInitialized = false;
    },
    initializeIfNotInitialized: function() {
      if (this.isInitialized) {
        return;
      }
      this.subscriptions.add(atom.views.addViewProvider(Notification, (function(_this) {
        return function(model) {
          return new NotificationElement(model, _this.visibilityDuration);
        };
      })(this)));
      this.notificationsElement = document.createElement('atom-notifications');
      atom.views.getView(atom.workspace).appendChild(this.notificationsElement);
      return this.isInitialized = true;
    },
    createLog: function(state) {
      this.notificationsLog = new NotificationsLog(this.duplicateTimeDelay, state != null ? state.typesHidden : void 0);
      if (this.subscriptions != null) {
        this.addNotificationsLogSubscriptions();
      }
      return this.notificationsLog;
    },
    addNotificationsLogSubscriptions: function() {
      this.subscriptions.add(this.notificationsLog.onDidDestroy((function(_this) {
        return function() {
          return _this.notificationsLog = null;
        };
      })(this)));
      return this.subscriptions.add(this.notificationsLog.onItemClick((function(_this) {
        return function(notification) {
          var view;
          view = atom.views.getView(notification);
          view.makeDismissable();
          if (!view.element.classList.contains('remove')) {
            return;
          }
          view.element.classList.remove('remove');
          _this.notificationsElement.appendChild(view.element);
          notification.dismissed = false;
          return notification.setDisplayed(true);
        };
      })(this)));
    },
    addNotificationView: function(notification) {
      var ref1, ref2, timeSpan;
      if (notification == null) {
        return;
      }
      this.initializeIfNotInitialized();
      if (notification.wasDisplayed()) {
        return;
      }
      if (this.lastNotification != null) {
        timeSpan = notification.getTimestamp() - this.lastNotification.getTimestamp();
        if (!(timeSpan < this.duplicateTimeDelay && notification.isEqual(this.lastNotification))) {
          this.notificationsElement.appendChild(atom.views.getView(notification).element);
          if ((ref1 = this.notificationsLog) != null) {
            ref1.addNotification(notification);
          }
        }
      } else {
        this.notificationsElement.appendChild(atom.views.getView(notification).element);
        if ((ref2 = this.notificationsLog) != null) {
          ref2.addNotification(notification);
        }
      }
      notification.setDisplayed(true);
      return this.lastNotification = notification;
    }
  };

  isCoreOrPackageStackTrace = function(stack) {
    var file, i, len, ref1;
    if (StackTraceParser == null) {
      StackTraceParser = require('stacktrace-parser');
    }
    ref1 = StackTraceParser.parse(stack);
    for (i = 0, len = ref1.length; i < len; i++) {
      file = ref1[i].file;
      if (file === '<embedded>' || fs.isAbsolute(file)) {
        return true;
      }
    }
    return false;
  };

  module.exports = Notifications;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvbm90aWZpY2F0aW9ucy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQXNDLE9BQUEsQ0FBUSxNQUFSLENBQXRDLEVBQUMsK0JBQUQsRUFBZTs7RUFDZixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsZ0JBQUEsR0FBbUI7O0VBQ25CLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx3QkFBUjs7RUFDdEIsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSOztFQUVuQixhQUFBLEdBQ0U7SUFBQSxhQUFBLEVBQWUsS0FBZjtJQUNBLGFBQUEsRUFBZSxJQURmO0lBRUEsa0JBQUEsRUFBb0IsR0FGcEI7SUFHQSxnQkFBQSxFQUFrQixJQUhsQjtJQUtBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7QUFDUixVQUFBO01BQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVI7TUFDaEIsYUFBYSxDQUFDLEtBQWQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7QUFFckI7QUFBQSxXQUFBLHNDQUFBOztRQUFBLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixZQUFyQjtBQUFBO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxhQUFhLENBQUMsb0JBQW5CLENBQXdDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxZQUFEO2lCQUFrQixLQUFDLENBQUEsbUJBQUQsQ0FBcUIsWUFBckI7UUFBbEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhDLENBQW5CO01BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxnQkFBTCxDQUFzQixTQUFDLEdBQUQ7QUFDdkMsWUFBQTtR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LFlBQW5DO1dBRkY7U0FIRjtPQUFBLE1BQUE7UUFPRSxJQUFDLENBQUEsb0JBQW9CLENBQUMsV0FBdEIsQ0FBa0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLFlBQW5CLENBQWdDLENBQUMsT0FBbkU7O2NBQ2lCLENBQUUsZUFBbkIsQ0FBbUMsWUFBbkM7U0FSRjs7TUFVQSxZQUFZLENBQUMsWUFBYixDQUEwQixJQUExQjthQUNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtJQWhCRCxDQXpHckI7OztFQTJIRix5QkFBQSxHQUE0QixTQUFDLEtBQUQ7QUFDMUIsUUFBQTs7TUFBQSxtQkFBb0IsT0FBQSxDQUFRLG1CQUFSOztBQUNwQjtBQUFBLFNBQUEsc0NBQUE7TUFBSztNQUNILElBQUcsSUFBQSxLQUFRLFlBQVIsSUFBd0IsRUFBRSxDQUFDLFVBQUgsQ0FBYyxJQUFkLENBQTNCO0FBQ0UsZUFBTyxLQURUOztBQURGO1dBR0E7RUFMMEI7O0VBTzVCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBeklqQiIsInNvdXJjZXNDb250ZW50IjpbIntOb3RpZmljYXRpb24sIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcblN0YWNrVHJhY2VQYXJzZXIgPSBudWxsXG5Ob3RpZmljYXRpb25FbGVtZW50ID0gcmVxdWlyZSAnLi9ub3RpZmljYXRpb24tZWxlbWVudCdcbk5vdGlmaWNhdGlvbnNMb2cgPSByZXF1aXJlICcuL25vdGlmaWNhdGlvbnMtbG9nJ1xuXG5Ob3RpZmljYXRpb25zID1cbiAgaXNJbml0aWFsaXplZDogZmFsc2VcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuICBkdXBsaWNhdGVUaW1lRGVsYXk6IDUwMFxuICBsYXN0Tm90aWZpY2F0aW9uOiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBDb21tYW5kTG9nZ2VyID0gcmVxdWlyZSAnLi9jb21tYW5kLWxvZ2dlcidcbiAgICBDb21tYW5kTG9nZ2VyLnN0YXJ0KClcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAYWRkTm90aWZpY2F0aW9uVmlldyhub3RpZmljYXRpb24pIGZvciBub3RpZmljYXRpb24gaW4gYXRvbS5ub3RpZmljYXRpb25zLmdldE5vdGlmaWNhdGlvbnMoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLm5vdGlmaWNhdGlvbnMub25EaWRBZGROb3RpZmljYXRpb24gKG5vdGlmaWNhdGlvbikgPT4gQGFkZE5vdGlmaWNhdGlvblZpZXcobm90aWZpY2F0aW9uKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20ub25XaWxsVGhyb3dFcnJvciAoe21lc3NhZ2UsIHVybCwgbGluZSwgb3JpZ2luYWxFcnJvciwgcHJldmVudERlZmF1bHR9KSAtPlxuICAgICAgaWYgb3JpZ2luYWxFcnJvci5uYW1lIGlzICdCdWZmZXJlZFByb2Nlc3NFcnJvcidcbiAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UucmVwbGFjZSgnVW5jYXVnaHQgQnVmZmVyZWRQcm9jZXNzRXJyb3I6ICcsICcnKVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSwgZGlzbWlzc2FibGU6IHRydWUpXG5cbiAgICAgIGVsc2UgaWYgb3JpZ2luYWxFcnJvci5jb2RlIGlzICdFTk9FTlQnIGFuZCBub3QgL1xcL2F0b20vaS50ZXN0KG1lc3NhZ2UpIGFuZCBtYXRjaCA9IC9zcGF3biAoLispIEVOT0VOVC8uZXhlYyhtZXNzYWdlKVxuICAgICAgICBtZXNzYWdlID0gXCJcIlwiXG4gICAgICAgICAgJyN7bWF0Y2hbMV19JyBjb3VsZCBub3QgYmUgc3Bhd25lZC5cbiAgICAgICAgICBJcyBpdCBpbnN0YWxsZWQgYW5kIG9uIHlvdXIgcGF0aD9cbiAgICAgICAgICBJZiBzbyBwbGVhc2Ugb3BlbiBhbiBpc3N1ZSBvbiB0aGUgcGFja2FnZSBzcGF3bmluZyB0aGUgcHJvY2Vzcy5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICAgICAgZWxzZSBpZiBub3QgYXRvbS5pbkRldk1vZGUoKSBvciBhdG9tLmNvbmZpZy5nZXQoJ25vdGlmaWNhdGlvbnMuc2hvd0Vycm9yc0luRGV2TW9kZScpXG4gICAgICAgIHByZXZlbnREZWZhdWx0KClcblxuICAgICAgICAjIElnbm9yZSBlcnJvcnMgd2l0aCBubyBwYXRocyBpbiB0aGVtIHNpbmNlIHRoZXkgYXJlIGltcG9zc2libGUgdG8gdHJhY2VcbiAgICAgICAgaWYgb3JpZ2luYWxFcnJvci5zdGFjayBhbmQgbm90IGlzQ29yZU9yUGFja2FnZVN0YWNrVHJhY2Uob3JpZ2luYWxFcnJvci5zdGFjaylcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICBkZXRhaWw6IFwiI3t1cmx9OiN7bGluZX1cIlxuICAgICAgICAgIHN0YWNrOiBvcmlnaW5hbEVycm9yLnN0YWNrXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEZhdGFsRXJyb3IobWVzc2FnZSwgb3B0aW9ucylcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnY29yZTpjYW5jZWwnLCAtPlxuICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKSBmb3Igbm90aWZpY2F0aW9uIGluIGF0b20ubm90aWZpY2F0aW9ucy5nZXROb3RpZmljYXRpb25zKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdub3RpZmljYXRpb25zLmRlZmF1bHRUaW1lb3V0JywgKHZhbHVlKSA9PiBAdmlzaWJpbGl0eUR1cmF0aW9uID0gdmFsdWVcblxuICAgIGlmIGF0b20uaW5EZXZNb2RlKClcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnbm90aWZpY2F0aW9uczp0cmlnZ2VyLWVycm9yJywgLT5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgYWJjICsgMiAjIG5vcGVcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgIGRldGFpbDogZXJyb3Iuc3RhY2suc3BsaXQoJ1xcbicpWzFdXG4gICAgICAgICAgICBzdGFjazogZXJyb3Iuc3RhY2tcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEZhdGFsRXJyb3IoXCJVbmNhdWdodCAje2Vycm9yLnN0YWNrLnNwbGl0KCdcXG4nKVswXX1cIiwgb3B0aW9ucylcblxuICAgIEBhZGROb3RpZmljYXRpb25zTG9nU3Vic2NyaXB0aW9ucygpIGlmIEBub3RpZmljYXRpb25zTG9nP1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIgKHVyaSkgPT4gQGNyZWF0ZUxvZygpIGlmIHVyaSBpcyBOb3RpZmljYXRpb25zTG9nOjpnZXRVUkkoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnbm90aWZpY2F0aW9uczp0b2dnbGUtbG9nJywgLT4gYXRvbS53b3Jrc3BhY2UudG9nZ2xlKE5vdGlmaWNhdGlvbnNMb2c6OmdldFVSSSgpKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnbm90aWZpY2F0aW9uczpjbGVhci1sb2cnLCAtPlxuICAgICAgZm9yIG5vdGlmaWNhdGlvbiBpbiBhdG9tLm5vdGlmaWNhdGlvbnMuZ2V0Tm90aWZpY2F0aW9ucygpXG4gICAgICAgIG5vdGlmaWNhdGlvbi5vcHRpb25zLmRpc21pc3NhYmxlID0gdHJ1ZVxuICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzc2VkID0gZmFsc2VcbiAgICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmNsZWFyKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBub3RpZmljYXRpb25zRWxlbWVudD8ucmVtb3ZlKClcbiAgICBAbm90aWZpY2F0aW9uc1BhbmVsPy5kZXN0cm95KClcbiAgICBAbm90aWZpY2F0aW9uc0xvZz8uZGVzdHJveSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICBAbm90aWZpY2F0aW9uc0VsZW1lbnQgPSBudWxsXG4gICAgQG5vdGlmaWNhdGlvbnNQYW5lbCA9IG51bGxcblxuICAgIEBpc0luaXRpYWxpemVkID0gZmFsc2VcblxuICBpbml0aWFsaXplSWZOb3RJbml0aWFsaXplZDogLT5cbiAgICByZXR1cm4gaWYgQGlzSW5pdGlhbGl6ZWRcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnZpZXdzLmFkZFZpZXdQcm92aWRlciBOb3RpZmljYXRpb24sIChtb2RlbCkgPT5cbiAgICAgIG5ldyBOb3RpZmljYXRpb25FbGVtZW50KG1vZGVsLCBAdmlzaWJpbGl0eUR1cmF0aW9uKVxuXG4gICAgQG5vdGlmaWNhdGlvbnNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXRvbS1ub3RpZmljYXRpb25zJylcbiAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLmFwcGVuZENoaWxkKEBub3RpZmljYXRpb25zRWxlbWVudClcblxuICAgIEBpc0luaXRpYWxpemVkID0gdHJ1ZVxuXG4gIGNyZWF0ZUxvZzogKHN0YXRlKSAtPlxuICAgIEBub3RpZmljYXRpb25zTG9nID0gbmV3IE5vdGlmaWNhdGlvbnNMb2cgQGR1cGxpY2F0ZVRpbWVEZWxheSwgc3RhdGU/LnR5cGVzSGlkZGVuXG4gICAgQGFkZE5vdGlmaWNhdGlvbnNMb2dTdWJzY3JpcHRpb25zKCkgaWYgQHN1YnNjcmlwdGlvbnM/XG4gICAgQG5vdGlmaWNhdGlvbnNMb2dcblxuICBhZGROb3RpZmljYXRpb25zTG9nU3Vic2NyaXB0aW9uczogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG5vdGlmaWNhdGlvbnNMb2cub25EaWREZXN0cm95ID0+IEBub3RpZmljYXRpb25zTG9nID0gbnVsbFxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbm90aWZpY2F0aW9uc0xvZy5vbkl0ZW1DbGljayAobm90aWZpY2F0aW9uKSA9PlxuICAgICAgdmlldyA9IGF0b20udmlld3MuZ2V0Vmlldyhub3RpZmljYXRpb24pXG4gICAgICB2aWV3Lm1ha2VEaXNtaXNzYWJsZSgpXG5cbiAgICAgIHJldHVybiB1bmxlc3Mgdmlldy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncmVtb3ZlJylcbiAgICAgIHZpZXcuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdyZW1vdmUnKVxuICAgICAgQG5vdGlmaWNhdGlvbnNFbGVtZW50LmFwcGVuZENoaWxkKHZpZXcuZWxlbWVudClcbiAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzZWQgPSBmYWxzZVxuICAgICAgbm90aWZpY2F0aW9uLnNldERpc3BsYXllZCh0cnVlKVxuXG4gIGFkZE5vdGlmaWNhdGlvblZpZXc6IChub3RpZmljYXRpb24pIC0+XG4gICAgcmV0dXJuIHVubGVzcyBub3RpZmljYXRpb24/XG4gICAgQGluaXRpYWxpemVJZk5vdEluaXRpYWxpemVkKClcbiAgICByZXR1cm4gaWYgbm90aWZpY2F0aW9uLndhc0Rpc3BsYXllZCgpXG5cbiAgICBpZiBAbGFzdE5vdGlmaWNhdGlvbj9cbiAgICAgICMgZG8gbm90IHNob3cgZHVwbGljYXRlcyB1bmxlc3Mgc29tZSBhbW91bnQgb2YgdGltZSBoYXMgcGFzc2VkXG4gICAgICB0aW1lU3BhbiA9IG5vdGlmaWNhdGlvbi5nZXRUaW1lc3RhbXAoKSAtIEBsYXN0Tm90aWZpY2F0aW9uLmdldFRpbWVzdGFtcCgpXG4gICAgICB1bmxlc3MgdGltZVNwYW4gPCBAZHVwbGljYXRlVGltZURlbGF5IGFuZCBub3RpZmljYXRpb24uaXNFcXVhbChAbGFzdE5vdGlmaWNhdGlvbilcbiAgICAgICAgQG5vdGlmaWNhdGlvbnNFbGVtZW50LmFwcGVuZENoaWxkKGF0b20udmlld3MuZ2V0Vmlldyhub3RpZmljYXRpb24pLmVsZW1lbnQpXG4gICAgICAgIEBub3RpZmljYXRpb25zTG9nPy5hZGROb3RpZmljYXRpb24obm90aWZpY2F0aW9uKVxuICAgIGVsc2VcbiAgICAgIEBub3RpZmljYXRpb25zRWxlbWVudC5hcHBlbmRDaGlsZChhdG9tLnZpZXdzLmdldFZpZXcobm90aWZpY2F0aW9uKS5lbGVtZW50KVxuICAgICAgQG5vdGlmaWNhdGlvbnNMb2c/LmFkZE5vdGlmaWNhdGlvbihub3RpZmljYXRpb24pXG5cbiAgICBub3RpZmljYXRpb24uc2V0RGlzcGxheWVkKHRydWUpXG4gICAgQGxhc3ROb3RpZmljYXRpb24gPSBub3RpZmljYXRpb25cblxuaXNDb3JlT3JQYWNrYWdlU3RhY2tUcmFjZSA9IChzdGFjaykgLT5cbiAgU3RhY2tUcmFjZVBhcnNlciA/PSByZXF1aXJlICdzdGFja3RyYWNlLXBhcnNlcidcbiAgZm9yIHtmaWxlfSBpbiBTdGFja1RyYWNlUGFyc2VyLnBhcnNlKHN0YWNrKVxuICAgIGlmIGZpbGUgaXMgJzxlbWJlZGRlZD4nIG9yIGZzLmlzQWJzb2x1dGUoZmlsZSlcbiAgICAgIHJldHVybiB0cnVlXG4gIGZhbHNlXG5cbm1vZHVsZS5leHBvcnRzID0gTm90aWZpY2F0aW9uc1xuIl19
