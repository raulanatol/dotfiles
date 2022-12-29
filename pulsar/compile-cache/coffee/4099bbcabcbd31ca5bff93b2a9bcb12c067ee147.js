(function() {
  var CompositeDisposable, Disposable, Emitter, NotificationsLog, NotificationsLogItem, ref, typeIcons;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  NotificationsLogItem = require('./notifications-log-item');

  typeIcons = {
    fatal: 'bug',
    error: 'flame',
    warning: 'alert',
    info: 'info',
    success: 'check'
  };

  module.exports = NotificationsLog = (function() {
    NotificationsLog.prototype.subscriptions = null;

    NotificationsLog.prototype.logItems = [];

    NotificationsLog.prototype.typesHidden = {
      fatal: false,
      error: false,
      warning: false,
      info: false,
      success: false
    };

    function NotificationsLog(duplicateTimeDelay, typesHidden) {
      this.duplicateTimeDelay = duplicateTimeDelay;
      if (typesHidden == null) {
        typesHidden = null;
      }
      if (typesHidden != null) {
        this.typesHidden = typesHidden;
      }
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.notifications.onDidClearNotifications((function(_this) {
        return function() {
          return _this.clearLogItems();
        };
      })(this)));
      this.render();
      this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.clearLogItems();
        };
      })(this)));
    }

    NotificationsLog.prototype.render = function() {
      var button, header, i, icon, lastNotification, len, notification, ref1, timeSpan, type;
      this.element = document.createElement('div');
      this.element.classList.add('notifications-log');
      header = document.createElement('header');
      this.element.appendChild(header);
      this.list = document.createElement('ul');
      this.list.classList.add('notifications-log-items');
      this.element.appendChild(this.list);
      for (type in typeIcons) {
        icon = typeIcons[type];
        button = document.createElement('button');
        button.classList.add('notification-type', 'btn', 'icon', "icon-" + icon, type);
        button.classList.toggle('show-type', !this.typesHidden[type]);
        this.list.classList.toggle("hide-" + type, this.typesHidden[type]);
        button.dataset.type = type;
        button.addEventListener('click', (function(_this) {
          return function(e) {
            return _this.toggleType(e.target.dataset.type);
          };
        })(this));
        this.subscriptions.add(atom.tooltips.add(button, {
          title: "Toggle " + type + " notifications"
        }));
        header.appendChild(button);
      }
      button = document.createElement('button');
      button.classList.add('notifications-clear-log', 'btn', 'icon', 'icon-trashcan');
      button.addEventListener('click', function(e) {
        return atom.commands.dispatch(atom.views.getView(atom.workspace), "notifications:clear-log");
      });
      this.subscriptions.add(atom.tooltips.add(button, {
        title: "Clear notifications"
      }));
      header.appendChild(button);
      lastNotification = null;
      ref1 = atom.notifications.getNotifications();
      for (i = 0, len = ref1.length; i < len; i++) {
        notification = ref1[i];
        if (lastNotification != null) {
          timeSpan = notification.getTimestamp() - lastNotification.getTimestamp();
          if (!(timeSpan < this.duplicateTimeDelay && notification.isEqual(lastNotification))) {
            this.addNotification(notification);
          }
        } else {
          this.addNotification(notification);
        }
        lastNotification = notification;
      }
      return this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.element.remove();
        };
      })(this)));
    };

    NotificationsLog.prototype.destroy = function() {
      this.subscriptions.dispose();
      return this.emitter.emit('did-destroy');
    };

    NotificationsLog.prototype.getElement = function() {
      return this.element;
    };

    NotificationsLog.prototype.getURI = function() {
      return 'atom://notifications/log';
    };

    NotificationsLog.prototype.getTitle = function() {
      return 'Log';
    };

    NotificationsLog.prototype.getLongTitle = function() {
      return 'Notifications Log';
    };

    NotificationsLog.prototype.getIconName = function() {
      return 'alert';
    };

    NotificationsLog.prototype.getDefaultLocation = function() {
      return 'bottom';
    };

    NotificationsLog.prototype.getAllowedLocations = function() {
      return ['left', 'right', 'bottom'];
    };

    NotificationsLog.prototype.serialize = function() {
      return {
        typesHidden: this.typesHidden,
        deserializer: 'notifications/NotificationsLog'
      };
    };

    NotificationsLog.prototype.toggleType = function(type, force) {
      var button, hide;
      button = this.element.querySelector(".notification-type." + type);
      hide = !button.classList.toggle('show-type', force);
      this.list.classList.toggle("hide-" + type, hide);
      return this.typesHidden[type] = hide;
    };

    NotificationsLog.prototype.addNotification = function(notification) {
      var logItem;
      logItem = new NotificationsLogItem(notification);
      logItem.onClick((function(_this) {
        return function() {
          return _this.emitter.emit('item-clicked', notification);
        };
      })(this));
      this.logItems.push(logItem);
      return this.list.insertBefore(logItem.getElement(), this.list.firstChild);
    };

    NotificationsLog.prototype.onItemClick = function(callback) {
      return this.emitter.on('item-clicked', callback);
    };

    NotificationsLog.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    NotificationsLog.prototype.clearLogItems = function() {
      var i, len, logItem, ref1;
      ref1 = this.logItems;
      for (i = 0, len = ref1.length; i < len; i++) {
        logItem = ref1[i];
        logItem.destroy();
      }
      return this.logItems = [];
    };

    return NotificationsLog;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvbm90aWZpY2F0aW9ucy9saWIvbm90aWZpY2F0aW9ucy1sb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE2QyxPQUFBLENBQVEsTUFBUixDQUE3QyxFQUFDLHFCQUFELEVBQVUsNkNBQVYsRUFBK0I7O0VBQy9CLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwwQkFBUjs7RUFFdkIsU0FBQSxHQUNFO0lBQUEsS0FBQSxFQUFPLEtBQVA7SUFDQSxLQUFBLEVBQU8sT0FEUDtJQUVBLE9BQUEsRUFBUyxPQUZUO0lBR0EsSUFBQSxFQUFNLE1BSE47SUFJQSxPQUFBLEVBQVMsT0FKVDs7O0VBTUYsTUFBTSxDQUFDLE9BQVAsR0FBdUI7K0JBQ3JCLGFBQUEsR0FBZTs7K0JBQ2YsUUFBQSxHQUFVOzsrQkFDVixXQUFBLEdBQ0U7TUFBQSxLQUFBLEVBQU8sS0FBUDtNQUNBLEtBQUEsRUFBTyxLQURQO01BRUEsT0FBQSxFQUFTLEtBRlQ7TUFHQSxJQUFBLEVBQU0sS0FITjtNQUlBLE9BQUEsRUFBUyxLQUpUOzs7SUFNVywwQkFBQyxrQkFBRCxFQUFzQixXQUF0QjtNQUFDLElBQUMsQ0FBQSxxQkFBRDs7UUFBcUIsY0FBYzs7TUFDL0MsSUFBOEIsbUJBQTlCO1FBQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxZQUFmOztNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxhQUFhLENBQUMsdUJBQW5CLENBQTJDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsYUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNDLENBQW5CO01BQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLFVBQUosQ0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLGFBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFmLENBQW5CO0lBTlc7OytCQVFiLE1BQUEsR0FBUSxTQUFBO0FBQ04sVUFBQTtNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDWCxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixtQkFBdkI7TUFFQSxNQUFBLEdBQVMsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkI7TUFDVCxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsTUFBckI7TUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRLFFBQVEsQ0FBQyxhQUFULENBQXVCLElBQXZCO01BQ1IsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBaEIsQ0FBb0IseUJBQXBCO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLElBQUMsQ0FBQSxJQUF0QjtBQUVBLFdBQUEsaUJBQUE7O1FBQ0UsTUFBQSxHQUFTLFFBQVEsQ0FBQyxhQUFULENBQXVCLFFBQXZCO1FBQ1QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFqQixDQUFxQixtQkFBckIsRUFBMEMsS0FBMUMsRUFBaUQsTUFBakQsRUFBeUQsT0FBQSxHQUFRLElBQWpFLEVBQXlFLElBQXpFO1FBQ0EsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFqQixDQUF3QixXQUF4QixFQUFxQyxDQUFJLElBQUMsQ0FBQSxXQUFZLENBQUEsSUFBQSxDQUF0RDtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQWhCLENBQXVCLE9BQUEsR0FBUSxJQUEvQixFQUF1QyxJQUFDLENBQUEsV0FBWSxDQUFBLElBQUEsQ0FBcEQ7UUFDQSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQWYsR0FBc0I7UUFDdEIsTUFBTSxDQUFDLGdCQUFQLENBQXdCLE9BQXhCLEVBQWlDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsQ0FBRDttQkFBTyxLQUFDLENBQUEsVUFBRCxDQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQTdCO1VBQVA7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDO1FBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixNQUFsQixFQUEwQjtVQUFDLEtBQUEsRUFBTyxTQUFBLEdBQVUsSUFBVixHQUFlLGdCQUF2QjtTQUExQixDQUFuQjtRQUNBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLE1BQW5CO0FBUkY7TUFVQSxNQUFBLEdBQVMsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkI7TUFDVCxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQWpCLENBQXFCLHlCQUFyQixFQUFnRCxLQUFoRCxFQUF1RCxNQUF2RCxFQUErRCxlQUEvRDtNQUNBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixPQUF4QixFQUFpQyxTQUFDLENBQUQ7ZUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUF2QixFQUEyRCx5QkFBM0Q7TUFBUCxDQUFqQztNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsTUFBbEIsRUFBMEI7UUFBQyxLQUFBLEVBQU8scUJBQVI7T0FBMUIsQ0FBbkI7TUFDQSxNQUFNLENBQUMsV0FBUCxDQUFtQixNQUFuQjtNQUVBLGdCQUFBLEdBQW1CO0FBQ25CO0FBQUEsV0FBQSxzQ0FBQTs7UUFDRSxJQUFHLHdCQUFIO1VBRUUsUUFBQSxHQUFXLFlBQVksQ0FBQyxZQUFiLENBQUEsQ0FBQSxHQUE4QixnQkFBZ0IsQ0FBQyxZQUFqQixDQUFBO1VBQ3pDLElBQUEsQ0FBQSxDQUFPLFFBQUEsR0FBVyxJQUFDLENBQUEsa0JBQVosSUFBbUMsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsZ0JBQXJCLENBQTFDLENBQUE7WUFDRSxJQUFDLENBQUEsZUFBRCxDQUFpQixZQUFqQixFQURGO1dBSEY7U0FBQSxNQUFBO1VBTUUsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsWUFBakIsRUFORjs7UUFRQSxnQkFBQSxHQUFtQjtBQVRyQjthQVdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLFVBQUosQ0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZixDQUFuQjtJQXZDTTs7K0JBeUNSLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7YUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxhQUFkO0lBRk87OytCQUlULFVBQUEsR0FBWSxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUo7OytCQUVaLE1BQUEsR0FBUSxTQUFBO2FBQUc7SUFBSDs7K0JBRVIsUUFBQSxHQUFVLFNBQUE7YUFBRztJQUFIOzsrQkFFVixZQUFBLEdBQWMsU0FBQTthQUFHO0lBQUg7OytCQUVkLFdBQUEsR0FBYSxTQUFBO2FBQUc7SUFBSDs7K0JBRWIsa0JBQUEsR0FBb0IsU0FBQTthQUFHO0lBQUg7OytCQUVwQixtQkFBQSxHQUFxQixTQUFBO2FBQUcsQ0FBQyxNQUFELEVBQVMsT0FBVCxFQUFrQixRQUFsQjtJQUFIOzsrQkFFckIsU0FBQSxHQUFXLFNBQUE7QUFDVCxhQUFPO1FBQ0osYUFBRCxJQUFDLENBQUEsV0FESTtRQUVMLFlBQUEsRUFBYyxnQ0FGVDs7SUFERTs7K0JBTVgsVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLEtBQVA7QUFDVixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxPQUFPLENBQUMsYUFBVCxDQUF1QixxQkFBQSxHQUFzQixJQUE3QztNQUNULElBQUEsR0FBTyxDQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBakIsQ0FBd0IsV0FBeEIsRUFBcUMsS0FBckM7TUFDWCxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFoQixDQUF1QixPQUFBLEdBQVEsSUFBL0IsRUFBdUMsSUFBdkM7YUFDQSxJQUFDLENBQUEsV0FBWSxDQUFBLElBQUEsQ0FBYixHQUFxQjtJQUpYOzsrQkFNWixlQUFBLEdBQWlCLFNBQUMsWUFBRDtBQUNmLFVBQUE7TUFBQSxPQUFBLEdBQVUsSUFBSSxvQkFBSixDQUF5QixZQUF6QjtNQUNWLE9BQU8sQ0FBQyxPQUFSLENBQWdCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxjQUFkLEVBQThCLFlBQTlCO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCO01BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsT0FBZjthQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsWUFBTixDQUFtQixPQUFPLENBQUMsVUFBUixDQUFBLENBQW5CLEVBQXlDLElBQUMsQ0FBQSxJQUFJLENBQUMsVUFBL0M7SUFKZTs7K0JBTWpCLFdBQUEsR0FBYSxTQUFDLFFBQUQ7YUFDWCxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxjQUFaLEVBQTRCLFFBQTVCO0lBRFc7OytCQUdiLFlBQUEsR0FBYyxTQUFDLFFBQUQ7YUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLFFBQTNCO0lBRFk7OytCQUdkLGFBQUEsR0FBZSxTQUFBO0FBQ2IsVUFBQTtBQUFBO0FBQUEsV0FBQSxzQ0FBQTs7UUFBQSxPQUFPLENBQUMsT0FBUixDQUFBO0FBQUE7YUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZO0lBRkM7Ozs7O0FBL0dqQiIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5Ob3RpZmljYXRpb25zTG9nSXRlbSA9IHJlcXVpcmUgJy4vbm90aWZpY2F0aW9ucy1sb2ctaXRlbSdcblxudHlwZUljb25zID1cbiAgZmF0YWw6ICdidWcnXG4gIGVycm9yOiAnZmxhbWUnXG4gIHdhcm5pbmc6ICdhbGVydCdcbiAgaW5mbzogJ2luZm8nXG4gIHN1Y2Nlc3M6ICdjaGVjaydcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBOb3RpZmljYXRpb25zTG9nXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgbG9nSXRlbXM6IFtdXG4gIHR5cGVzSGlkZGVuOlxuICAgIGZhdGFsOiBmYWxzZVxuICAgIGVycm9yOiBmYWxzZVxuICAgIHdhcm5pbmc6IGZhbHNlXG4gICAgaW5mbzogZmFsc2VcbiAgICBzdWNjZXNzOiBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yOiAoQGR1cGxpY2F0ZVRpbWVEZWxheSwgdHlwZXNIaWRkZW4gPSBudWxsKSAtPlxuICAgIEB0eXBlc0hpZGRlbiA9IHR5cGVzSGlkZGVuIGlmIHR5cGVzSGlkZGVuP1xuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20ubm90aWZpY2F0aW9ucy5vbkRpZENsZWFyTm90aWZpY2F0aW9ucyA9PiBAY2xlYXJMb2dJdGVtcygpXG4gICAgQHJlbmRlcigpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+IEBjbGVhckxvZ0l0ZW1zKClcblxuICByZW5kZXI6IC0+XG4gICAgQGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ25vdGlmaWNhdGlvbnMtbG9nJylcblxuICAgIGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2hlYWRlcicpXG4gICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQoaGVhZGVyKVxuXG4gICAgQGxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpXG4gICAgQGxpc3QuY2xhc3NMaXN0LmFkZCgnbm90aWZpY2F0aW9ucy1sb2ctaXRlbXMnKVxuICAgIEBlbGVtZW50LmFwcGVuZENoaWxkKEBsaXN0KVxuXG4gICAgZm9yIHR5cGUsIGljb24gb2YgdHlwZUljb25zXG4gICAgICBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxuICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ25vdGlmaWNhdGlvbi10eXBlJywgJ2J0bicsICdpY29uJywgXCJpY29uLSN7aWNvbn1cIiwgdHlwZSlcbiAgICAgIGJ1dHRvbi5jbGFzc0xpc3QudG9nZ2xlKCdzaG93LXR5cGUnLCBub3QgQHR5cGVzSGlkZGVuW3R5cGVdKVxuICAgICAgQGxpc3QuY2xhc3NMaXN0LnRvZ2dsZShcImhpZGUtI3t0eXBlfVwiLCBAdHlwZXNIaWRkZW5bdHlwZV0pXG4gICAgICBidXR0b24uZGF0YXNldC50eXBlID0gdHlwZVxuICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgKGUpID0+IEB0b2dnbGVUeXBlKGUudGFyZ2V0LmRhdGFzZXQudHlwZSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnRvb2x0aXBzLmFkZChidXR0b24sIHt0aXRsZTogXCJUb2dnbGUgI3t0eXBlfSBub3RpZmljYXRpb25zXCJ9KVxuICAgICAgaGVhZGVyLmFwcGVuZENoaWxkKGJ1dHRvbilcblxuICAgIGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ25vdGlmaWNhdGlvbnMtY2xlYXItbG9nJywgJ2J0bicsICdpY29uJywgJ2ljb24tdHJhc2hjYW4nKVxuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIChlKSAtPiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksIFwibm90aWZpY2F0aW9uczpjbGVhci1sb2dcIilcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQoYnV0dG9uLCB7dGl0bGU6IFwiQ2xlYXIgbm90aWZpY2F0aW9uc1wifSlcbiAgICBoZWFkZXIuYXBwZW5kQ2hpbGQoYnV0dG9uKVxuXG4gICAgbGFzdE5vdGlmaWNhdGlvbiA9IG51bGxcbiAgICBmb3Igbm90aWZpY2F0aW9uIGluIGF0b20ubm90aWZpY2F0aW9ucy5nZXROb3RpZmljYXRpb25zKClcbiAgICAgIGlmIGxhc3ROb3RpZmljYXRpb24/XG4gICAgICAgICMgZG8gbm90IHNob3cgZHVwbGljYXRlcyB1bmxlc3Mgc29tZSBhbW91bnQgb2YgdGltZSBoYXMgcGFzc2VkXG4gICAgICAgIHRpbWVTcGFuID0gbm90aWZpY2F0aW9uLmdldFRpbWVzdGFtcCgpIC0gbGFzdE5vdGlmaWNhdGlvbi5nZXRUaW1lc3RhbXAoKVxuICAgICAgICB1bmxlc3MgdGltZVNwYW4gPCBAZHVwbGljYXRlVGltZURlbGF5IGFuZCBub3RpZmljYXRpb24uaXNFcXVhbChsYXN0Tm90aWZpY2F0aW9uKVxuICAgICAgICAgIEBhZGROb3RpZmljYXRpb24obm90aWZpY2F0aW9uKVxuICAgICAgZWxzZVxuICAgICAgICBAYWRkTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbilcblxuICAgICAgbGFzdE5vdGlmaWNhdGlvbiA9IG5vdGlmaWNhdGlvblxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+IEBlbGVtZW50LnJlbW92ZSgpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtZGVzdHJveSdcblxuICBnZXRFbGVtZW50OiAtPiBAZWxlbWVudFxuXG4gIGdldFVSSTogLT4gJ2F0b206Ly9ub3RpZmljYXRpb25zL2xvZydcblxuICBnZXRUaXRsZTogLT4gJ0xvZydcblxuICBnZXRMb25nVGl0bGU6IC0+ICdOb3RpZmljYXRpb25zIExvZydcblxuICBnZXRJY29uTmFtZTogLT4gJ2FsZXJ0J1xuXG4gIGdldERlZmF1bHRMb2NhdGlvbjogLT4gJ2JvdHRvbSdcblxuICBnZXRBbGxvd2VkTG9jYXRpb25zOiAtPiBbJ2xlZnQnLCAncmlnaHQnLCAnYm90dG9tJ11cblxuICBzZXJpYWxpemU6IC0+XG4gICAgcmV0dXJuIHtcbiAgICAgIEB0eXBlc0hpZGRlblxuICAgICAgZGVzZXJpYWxpemVyOiAnbm90aWZpY2F0aW9ucy9Ob3RpZmljYXRpb25zTG9nJ1xuICAgIH1cblxuICB0b2dnbGVUeXBlOiAodHlwZSwgZm9yY2UpIC0+XG4gICAgYnV0dG9uID0gQGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5ub3RpZmljYXRpb24tdHlwZS4je3R5cGV9XCIpXG4gICAgaGlkZSA9IG5vdCBidXR0b24uY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdy10eXBlJywgZm9yY2UpXG4gICAgQGxpc3QuY2xhc3NMaXN0LnRvZ2dsZShcImhpZGUtI3t0eXBlfVwiLCBoaWRlKVxuICAgIEB0eXBlc0hpZGRlblt0eXBlXSA9IGhpZGVcblxuICBhZGROb3RpZmljYXRpb246IChub3RpZmljYXRpb24pIC0+XG4gICAgbG9nSXRlbSA9IG5ldyBOb3RpZmljYXRpb25zTG9nSXRlbShub3RpZmljYXRpb24pXG4gICAgbG9nSXRlbS5vbkNsaWNrID0+IEBlbWl0dGVyLmVtaXQoJ2l0ZW0tY2xpY2tlZCcsIG5vdGlmaWNhdGlvbilcbiAgICBAbG9nSXRlbXMucHVzaCBsb2dJdGVtXG4gICAgQGxpc3QuaW5zZXJ0QmVmb3JlKGxvZ0l0ZW0uZ2V0RWxlbWVudCgpLCBAbGlzdC5maXJzdENoaWxkKVxuXG4gIG9uSXRlbUNsaWNrOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2l0ZW0tY2xpY2tlZCcsIGNhbGxiYWNrXG5cbiAgb25EaWREZXN0cm95OiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1kZXN0cm95JywgY2FsbGJhY2tcblxuICBjbGVhckxvZ0l0ZW1zOiAtPlxuICAgIGxvZ0l0ZW0uZGVzdHJveSgpIGZvciBsb2dJdGVtIGluIEBsb2dJdGVtc1xuICAgIEBsb2dJdGVtcyA9IFtdXG4iXX0=
