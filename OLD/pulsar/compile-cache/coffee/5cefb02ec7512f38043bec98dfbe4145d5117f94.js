(function() {
  var CompositeDisposable, Disposable, Emitter, NotificationsLogItem, moment, ref;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  moment = require('moment');

  module.exports = NotificationsLogItem = (function() {
    NotificationsLogItem.prototype.subscriptions = null;

    NotificationsLogItem.prototype.timestampInterval = null;

    function NotificationsLogItem(notification) {
      this.notification = notification;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.render();
    }

    NotificationsLogItem.prototype.render = function() {
      var notificationElement, notificationView;
      notificationView = atom.views.getView(this.notification);
      notificationElement = this.renderNotification(notificationView);
      this.timestamp = document.createElement('div');
      this.timestamp.classList.add('timestamp');
      this.notification.moment = moment(this.notification.getTimestamp());
      this.subscriptions.add(atom.tooltips.add(this.timestamp, {
        title: this.notification.moment.format("ll LTS")
      }));
      this.updateTimestamp();
      this.timestampInterval = setInterval(this.updateTimestamp.bind(this), 60 * 1000);
      this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return clearInterval(_this.timestampInterval);
        };
      })(this)));
      this.element = document.createElement('li');
      this.element.classList.add('notifications-log-item', this.notification.getType());
      this.element.appendChild(notificationElement);
      this.element.appendChild(this.timestamp);
      this.element.addEventListener('click', (function(_this) {
        return function(e) {
          if (e.target.closest('.btn-toolbar a, .btn-toolbar button') == null) {
            return _this.emitter.emit('click');
          }
        };
      })(this));
      this.element.getRenderPromise = function() {
        return notificationView.getRenderPromise();
      };
      if (this.notification.getType() === 'fatal') {
        notificationView.getRenderPromise().then((function(_this) {
          return function() {
            return _this.element.replaceChild(_this.renderNotification(notificationView), notificationElement);
          };
        })(this));
      }
      return this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.element.remove();
        };
      })(this)));
    };

    NotificationsLogItem.prototype.renderNotification = function(view) {
      var button, buttons, i, j, len, len1, logButton, message, nButtons, nElement, ref1, ref2, tooltip;
      message = document.createElement('div');
      message.classList.add('message');
      message.innerHTML = view.element.querySelector(".content > .message").innerHTML;
      buttons = document.createElement('div');
      buttons.classList.add('btn-toolbar');
      nButtons = view.element.querySelector(".content > .meta > .btn-toolbar");
      if (nButtons != null) {
        ref1 = nButtons.children;
        for (i = 0, len = ref1.length; i < len; i++) {
          button = ref1[i];
          logButton = button.cloneNode(true);
          logButton.originalButton = button;
          logButton.addEventListener('click', function(e) {
            var newEvent;
            newEvent = new MouseEvent('click', e);
            return e.target.originalButton.dispatchEvent(newEvent);
          });
          ref2 = atom.tooltips.findTooltips(button);
          for (j = 0, len1 = ref2.length; j < len1; j++) {
            tooltip = ref2[j];
            this.subscriptions.add(atom.tooltips.add(logButton, tooltip.options));
          }
          buttons.appendChild(logButton);
        }
      }
      nElement = document.createElement('div');
      nElement.classList.add('notifications-log-notification', 'icon', "icon-" + (this.notification.getIcon()), this.notification.getType());
      nElement.appendChild(message);
      nElement.appendChild(buttons);
      return nElement;
    };

    NotificationsLogItem.prototype.getElement = function() {
      return this.element;
    };

    NotificationsLogItem.prototype.destroy = function() {
      this.subscriptions.dispose();
      return this.emitter.emit('did-destroy');
    };

    NotificationsLogItem.prototype.onClick = function(callback) {
      return this.emitter.on('click', callback);
    };

    NotificationsLogItem.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    NotificationsLogItem.prototype.updateTimestamp = function() {
      return this.timestamp.textContent = this.notification.moment.fromNow();
    };

    return NotificationsLogItem;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvbm90aWZpY2F0aW9ucy9saWIvbm90aWZpY2F0aW9ucy1sb2ctaXRlbS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTZDLE9BQUEsQ0FBUSxNQUFSLENBQTdDLEVBQUMscUJBQUQsRUFBVSw2Q0FBVixFQUErQjs7RUFDL0IsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQXVCO21DQUNyQixhQUFBLEdBQWU7O21DQUNmLGlCQUFBLEdBQW1COztJQUVOLDhCQUFDLFlBQUQ7TUFBQyxJQUFDLENBQUEsZUFBRDtNQUNaLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUhXOzttQ0FLYixNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBQyxDQUFBLFlBQXBCO01BQ25CLG1CQUFBLEdBQXNCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixnQkFBcEI7TUFFdEIsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNiLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQXJCLENBQXlCLFdBQXpCO01BQ0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLEdBQXVCLE1BQUEsQ0FBTyxJQUFDLENBQUEsWUFBWSxDQUFDLFlBQWQsQ0FBQSxDQUFQO01BQ3ZCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFNB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ZixJQUFDLENBQUEsU0FBUyxDQUFDLFdBQVgsR0FBeUIsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBckIsQ0FBQTtJQURWOzs7OztBQTVFbkIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xubW9tZW50ID0gcmVxdWlyZSAnbW9tZW50J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE5vdGlmaWNhdGlvbnNMb2dJdGVtXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgdGltZXN0YW1wSW50ZXJ2YWw6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEBub3RpZmljYXRpb24pIC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAcmVuZGVyKClcblxuICByZW5kZXI6IC0+XG4gICAgbm90aWZpY2F0aW9uVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhAbm90aWZpY2F0aW9uKVxuICAgIG5vdGlmaWNhdGlvbkVsZW1lbnQgPSBAcmVuZGVyTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvblZpZXcpXG5cbiAgICBAdGltZXN0YW1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBAdGltZXN0YW1wLmNsYXNzTGlzdC5hZGQoJ3RpbWVzdGFtcCcpXG4gICAgQG5vdGlmaWNhdGlvbi5tb21lbnQgPSBtb21lbnQoQG5vdGlmaWNhdGlvbi5nZXRUaW1lc3RhbXAoKSlcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQoQHRpbWVzdGFtcCwgdGl0bGU6IEBub3RpZmljYXRpb24ubW9tZW50LmZvcm1hdChcImxsIExUU1wiKSlcbiAgICBAdXBkYXRlVGltZXN0YW1wKClcbiAgICBAdGltZXN0YW1wSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChAdXBkYXRlVGltZXN0YW1wLmJpbmQodGhpcyksIDYwICogMTAwMClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgbmV3IERpc3Bvc2FibGUgPT4gY2xlYXJJbnRlcnZhbCBAdGltZXN0YW1wSW50ZXJ2YWxcblxuICAgIEBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ25vdGlmaWNhdGlvbnMtbG9nLWl0ZW0nLCBAbm90aWZpY2F0aW9uLmdldFR5cGUoKSlcbiAgICBAZWxlbWVudC5hcHBlbmRDaGlsZChub3RpZmljYXRpb25FbGVtZW50KVxuICAgIEBlbGVtZW50LmFwcGVuZENoaWxkKEB0aW1lc3RhbXApXG4gICAgQGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAoZSkgPT5cbiAgICAgIHVubGVzcyBlLnRhcmdldC5jbG9zZXN0KCcuYnRuLXRvb2xiYXIgYSwgLmJ0bi10b29sYmFyIGJ1dHRvbicpP1xuICAgICAgICBAZW1pdHRlci5lbWl0ICdjbGljaydcblxuICAgIEBlbGVtZW50LmdldFJlbmRlclByb21pc2UgPSAtPiBub3RpZmljYXRpb25WaWV3LmdldFJlbmRlclByb21pc2UoKVxuICAgIGlmIEBub3RpZmljYXRpb24uZ2V0VHlwZSgpIGlzICdmYXRhbCdcbiAgICAgIG5vdGlmaWNhdGlvblZpZXcuZ2V0UmVuZGVyUHJvbWlzZSgpLnRoZW4gPT5cbiAgICAgICAgQGVsZW1lbnQucmVwbGFjZUNoaWxkKEByZW5kZXJOb3RpZmljYXRpb24obm90aWZpY2F0aW9uVmlldyksIG5vdGlmaWNhdGlvbkVsZW1lbnQpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgbmV3IERpc3Bvc2FibGUgPT4gQGVsZW1lbnQucmVtb3ZlKClcblxuICByZW5kZXJOb3RpZmljYXRpb246ICh2aWV3KSAtPlxuICAgIG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCgnbWVzc2FnZScpXG4gICAgbWVzc2FnZS5pbm5lckhUTUwgPSB2aWV3LmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50ID4gLm1lc3NhZ2VcIikuaW5uZXJIVE1MXG5cbiAgICBidXR0b25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBidXR0b25zLmNsYXNzTGlzdC5hZGQoJ2J0bi10b29sYmFyJylcbiAgICBuQnV0dG9ucyA9IHZpZXcuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnQgPiAubWV0YSA+IC5idG4tdG9vbGJhclwiKVxuICAgIGlmIG5CdXR0b25zP1xuICAgICAgZm9yIGJ1dHRvbiBpbiBuQnV0dG9ucy5jaGlsZHJlblxuICAgICAgICBsb2dCdXR0b24gPSBidXR0b24uY2xvbmVOb2RlKHRydWUpXG4gICAgICAgIGxvZ0J1dHRvbi5vcmlnaW5hbEJ1dHRvbiA9IGJ1dHRvblxuICAgICAgICBsb2dCdXR0b24uYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAoZSkgLT5cbiAgICAgICAgICBuZXdFdmVudCA9IG5ldyBNb3VzZUV2ZW50KCdjbGljaycsIGUpXG4gICAgICAgICAgZS50YXJnZXQub3JpZ2luYWxCdXR0b24uZGlzcGF0Y2hFdmVudChuZXdFdmVudClcbiAgICAgICAgZm9yIHRvb2x0aXAgaW4gYXRvbS50b29sdGlwcy5maW5kVG9vbHRpcHMgYnV0dG9uXG4gICAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkKGxvZ0J1dHRvbiwgdG9vbHRpcC5vcHRpb25zKVxuICAgICAgICBidXR0b25zLmFwcGVuZENoaWxkKGxvZ0J1dHRvbilcblxuICAgIG5FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBuRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdub3RpZmljYXRpb25zLWxvZy1ub3RpZmljYXRpb24nLCAnaWNvbicsIFwiaWNvbi0je0Bub3RpZmljYXRpb24uZ2V0SWNvbigpfVwiLCBAbm90aWZpY2F0aW9uLmdldFR5cGUoKSlcbiAgICBuRWxlbWVudC5hcHBlbmRDaGlsZChtZXNzYWdlKVxuICAgIG5FbGVtZW50LmFwcGVuZENoaWxkKGJ1dHRvbnMpXG4gICAgbkVsZW1lbnRcblxuICBnZXRFbGVtZW50OiAtPiBAZWxlbWVudFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWRlc3Ryb3knXG5cbiAgb25DbGljazogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdjbGljaycsIGNhbGxiYWNrXG5cbiAgb25EaWREZXN0cm95OiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1kZXN0cm95JywgY2FsbGJhY2tcblxuICB1cGRhdGVUaW1lc3RhbXA6IC0+XG4gICAgQHRpbWVzdGFtcC50ZXh0Q29udGVudCA9IEBub3RpZmljYXRpb24ubW9tZW50LmZyb21Ob3coKVxuIl19
