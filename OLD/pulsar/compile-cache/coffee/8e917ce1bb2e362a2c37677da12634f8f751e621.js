(function() {
  var CommandLogger, ignoredCommands, tenMinutes;

  ignoredCommands = {
    'show.bs.tooltip': true,
    'shown.bs.tooltip': true,
    'hide.bs.tooltip': true,
    'hidden.bs.tooltip': true,
    'editor:display-updated': true,
    'mousewheel': true
  };

  tenMinutes = 10 * 60 * 1000;

  module.exports = CommandLogger = (function() {
    CommandLogger.instance = function() {
      return this._instance != null ? this._instance : this._instance = new CommandLogger;
    };

    CommandLogger.start = function() {
      return this.instance().start();
    };

    CommandLogger.prototype.logSize = 16;

    function CommandLogger() {
      this.initLog();
    }

    CommandLogger.prototype.start = function() {
      return atom.commands.onWillDispatch((function(_this) {
        return function(event) {
          return _this.logCommand(event);
        };
      })(this));
    };

    CommandLogger.prototype.getText = function(externalData) {
      var lastTime, lines;
      lines = [];
      lastTime = Date.now();
      this.eachEvent((function(_this) {
        return function(event) {
          if (event.time > lastTime) {
            return;
          }
          if (!event.name || lastTime - event.time >= tenMinutes) {
            return;
          }
          return lines.push(_this.formatEvent(event, lastTime));
        };
      })(this));
      if (externalData) {
        lines.push("     " + (this.formatTime(0)) + " " + externalData.title);
      }
      lines.unshift('```');
      lines.push('```');
      return lines.join("\n");
    };

    CommandLogger.prototype.latestEvent = function() {
      return this.eventLog[this.logIndex];
    };

    CommandLogger.prototype.logCommand = function(command) {
      var event, name, ref, target, time;
      name = command.type, target = command.target, time = command.time;
      if ((ref = command.detail) != null ? ref.jQueryTrigger : void 0) {
        return;
      }
      if (name in ignoredCommands) {
        return;
      }
      event = this.latestEvent();
      if (event.name === name) {
        return event.count++;
      } else {
        this.logIndex = (this.logIndex + 1) % this.logSize;
        event = this.latestEvent();
        event.name = name;
        event.targetNodeName = target.nodeName;
        event.targetClassName = target.className;
        event.targetId = target.id;
        event.count = 1;
        return event.time = time != null ? time : Date.now();
      }
    };

    CommandLogger.prototype.calculateLastEventTime = function(data) {
      var lastTime;
      if (data) {
        return data.time;
      }
      lastTime = null;
      this.eachEvent(function(event) {
        return lastTime = event.time;
      });
      return lastTime;
    };

    CommandLogger.prototype.eachEvent = function(fn) {
      var j, offset, ref;
      for (offset = j = 1, ref = this.logSize; 1 <= ref ? j <= ref : j >= ref; offset = 1 <= ref ? ++j : --j) {
        fn(this.eventLog[(this.logIndex + offset) % this.logSize]);
      }
    };

    CommandLogger.prototype.formatCount = function(count) {
      switch (false) {
        case !(count < 2):
          return '    ';
        case !(count < 10):
          return "  " + count + "x";
        case !(count < 100):
          return " " + count + "x";
      }
    };

    CommandLogger.prototype.formatEvent = function(event, lastTime) {
      var classText, count, idText, j, klass, len, name, nodeText, ref, targetClassName, targetId, targetNodeName, time;
      count = event.count, time = event.time, name = event.name, targetNodeName = event.targetNodeName, targetClassName = event.targetClassName, targetId = event.targetId;
      nodeText = targetNodeName.toLowerCase();
      idText = targetId ? "#" + targetId : '';
      classText = '';
      if (targetClassName != null) {
        ref = targetClassName.split(" ");
        for (j = 0, len = ref.length; j < len; j++) {
          klass = ref[j];
          classText += "." + klass;
        }
      }
      return (this.formatCount(count)) + " " + (this.formatTime(lastTime - time)) + " " + name + " (" + nodeText + idText + classText + ")";
    };

    CommandLogger.prototype.formatTime = function(time) {
      var minutes, seconds;
      minutes = Math.floor(time / 60000);
      seconds = Math.floor(((time % 60000) / 1000) * 10) / 10;
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      if (Math.floor(seconds) !== seconds) {
        seconds = seconds + ".0";
      }
      return "-" + minutes + ":" + seconds;
    };

    CommandLogger.prototype.initLog = function() {
      var i;
      this.logIndex = 0;
      return this.eventLog = (function() {
        var j, ref, results;
        results = [];
        for (i = j = 0, ref = this.logSize; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          results.push({
            name: null,
            count: 0,
            targetNodeName: null,
            targetClassName: null,
            targetId: null,
            time: null
          });
        }
        return results;
      }).call(this);
    };

    return CommandLogger;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvbm90aWZpY2F0aW9ucy9saWIvY29tbWFuZC1sb2dnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtBO0FBQUEsTUFBQTs7RUFBQSxlQUFBLEdBQ0U7SUFBQSxpQkFBQSxFQUFtQixJQUFuQjtJQUNBLGtCQUFBLEVBQW9CLElBRHBCO0lBRUEsaUJBQUEsRUFBbUIsSUFGbkI7SUFHQSxtQkFBQSxFQUFxQixJQUhyQjtJQUlBLHdCQUFBLEVBQTBCLElBSjFCO0lBS0EsWUFBQSxFQUFjLElBTGQ7OztFQVFGLFVBQUEsR0FBYSxFQUFBLEdBQUssRUFBTCxHQUFVOztFQUt2QixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ0osYUFBQyxDQUFBLFFBQUQsR0FBVyxTQUFBO3NDQUNULElBQUMsQ0FBQSxZQUFELElBQUMsQ0FBQSxZQUFhLElBQUk7SUFEVDs7SUFHWCxhQUFDLENBQUEsS0FBRCxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsUUFBRCxDQUFBLENBQVcsQ0FBQyxLQUFaLENBQUE7SUFETTs7NEJBSVIsT0FBQSxHQUFTOztJQUdJLHVCQUFBO01BQ1gsSUFBQyxDQUFBLE9BQUQsQ0FBQTtJQURXOzs0QkFHYixLQUFBLEdBQU8sU0FBQTthQUNMLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBZCxDQUE2QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtpQkFDM0IsS0FBQyxDQUFBLFVBQUQsQ0FBWSxLQUFaO1FBRDJCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QjtJQURLOzs0QkFTUCxPQUFBLEdBQVMsU0FBQyxZQUFEO0FBQ1AsVUFBQTtNQUFBLEtBQUEsR0FBUTtNQUNSLFFBQUEsR0FBVyxJQUFJLENBQUMsR0FBTCxDQUFBO01BRVgsSUFBQyxDQUFBLFNBQUQsQ0FB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LElBRmhCO1lBR0EsZUFBQSxFQUFpQixJQUhqQjtZQUlBLFFBQUEsRUFBVSxJQUpWO1lBS0EsSUFBQSxFQUFNLElBTE47O0FBRFU7OztJQUZMOzs7OztBQXpKWCIsInNvdXJjZXNDb250ZW50IjpbIiMgT3JpZ2luYWxseSBmcm9tIGxlZS1kb2htL2J1Zy1yZXBvcnRcbiMgaHR0cHM6Ly9naXRodWIuY29tL2xlZS1kb2htL2J1Zy1yZXBvcnQvYmxvYi9tYXN0ZXIvbGliL2NvbW1hbmQtbG9nZ2VyLmNvZmZlZVxuXG4jIENvbW1hbmQgbmFtZXMgdGhhdCBhcmUgaWdub3JlZCBhbmQgbm90IGluY2x1ZGVkIGluIHRoZSBsb2cuIFRoaXMgdXNlcyBhbiBPYmplY3QgdG8gcHJvdmlkZSBmYXN0XG4jIHN0cmluZyBtYXRjaGluZy5cbmlnbm9yZWRDb21tYW5kcyA9XG4gICdzaG93LmJzLnRvb2x0aXAnOiB5ZXNcbiAgJ3Nob3duLmJzLnRvb2x0aXAnOiB5ZXNcbiAgJ2hpZGUuYnMudG9vbHRpcCc6IHllc1xuICAnaGlkZGVuLmJzLnRvb2x0aXAnOiB5ZXNcbiAgJ2VkaXRvcjpkaXNwbGF5LXVwZGF0ZWQnOiB5ZXNcbiAgJ21vdXNld2hlZWwnOiB5ZXNcblxuIyBUZW4gbWludXRlcyBpbiBtaWxsaXNlY29uZHMuXG50ZW5NaW51dGVzID0gMTAgKiA2MCAqIDEwMDBcblxuIyBQdWJsaWM6IEhhbmRsZXMgbG9nZ2luZyBhbGwgb2YgdGhlIEF0b20gY29tbWFuZHMgZm9yIHRoZSBhdXRvbWF0aWMgcmVwcm8gc3RlcHMgZmVhdHVyZS5cbiNcbiMgSXQgdXNlcyBhbiBhcnJheSBhcyBhIGNpcmN1bGFyIGRhdGEgc3RydWN0dXJlIHRvIGxvZyBvbmx5IHRoZSBtb3N0IHJlY2VudCBjb21tYW5kcy5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIENvbW1hbmRMb2dnZXJcbiAgQGluc3RhbmNlOiAtPlxuICAgIEBfaW5zdGFuY2UgPz0gbmV3IENvbW1hbmRMb2dnZXJcblxuICBAc3RhcnQ6IC0+XG4gICAgQGluc3RhbmNlKCkuc3RhcnQoKVxuXG4gICMgUHVibGljOiBNYXhpbXVtIHNpemUgb2YgdGhlIGxvZy5cbiAgbG9nU2l6ZTogMTZcblxuICAjIFB1YmxpYzogQ3JlYXRlcyBhIG5ldyBsb2dnZXIuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBpbml0TG9nKClcblxuICBzdGFydDogLT5cbiAgICBhdG9tLmNvbW1hbmRzLm9uV2lsbERpc3BhdGNoIChldmVudCkgPT5cbiAgICAgIEBsb2dDb21tYW5kKGV2ZW50KVxuXG4gICMgUHVibGljOiBGb3JtYXRzIHRoZSBjb21tYW5kIGxvZyBmb3IgdGhlIGJ1ZyByZXBvcnQuXG4gICNcbiAgIyAqIGBleHRlcm5hbERhdGFgIEFuIHtPYmplY3R9IGNvbnRhaW5pbmcgb3RoZXIgaW5mb3JtYXRpb24gdG8gaW5jbHVkZSBpbiB0aGUgbG9nLlxuICAjXG4gICMgUmV0dXJucyBhIHtTdHJpbmd9IG9mIHRoZSBNYXJrZG93biBmb3IgdGhlIHJlcG9ydC5cbiAgZ2V0VGV4dDogKGV4dGVybmFsRGF0YSkgLT5cbiAgICBsaW5lcyA9IFtdXG4gICAgbGFzdFRpbWUgPSBEYXRlLm5vdygpXG5cbiAgICBAZWFjaEV2ZW50IChldmVudCkgPT5cbiAgICAgIHJldHVybiBpZiBldmVudC50aW1lID4gbGFzdFRpbWVcbiAgICAgIHJldHVybiBpZiBub3QgZXZlbnQubmFtZSBvciBsYXN0VGltZSAtIGV2ZW50LnRpbWUgPj0gdGVuTWludXRlc1xuICAgICAgbGluZXMucHVzaChAZm9ybWF0RXZlbnQoZXZlbnQsIGxhc3RUaW1lKSlcblxuICAgIGlmIGV4dGVybmFsRGF0YVxuICAgICAgbGluZXMucHVzaChcIiAgICAgI3tAZm9ybWF0VGltZSgwKX0gI3tleHRlcm5hbERhdGEudGl0bGV9XCIpXG5cbiAgICBsaW5lcy51bnNoaWZ0KCdgYGAnKVxuICAgIGxpbmVzLnB1c2goJ2BgYCcpXG4gICAgbGluZXMuam9pbihcIlxcblwiKVxuXG4gICMgUHVibGljOiBHZXRzIHRoZSBsYXRlc3QgZXZlbnQgZnJvbSB0aGUgbG9nLlxuICAjXG4gICMgUmV0dXJucyB0aGUgZXZlbnQge09iamVjdH0uXG4gIGxhdGVzdEV2ZW50OiAtPlxuICAgIEBldmVudExvZ1tAbG9nSW5kZXhdXG5cbiAgIyBQdWJsaWM6IExvZ3MgdGhlIGNvbW1hbmQuXG4gICNcbiAgIyAqIGBjb21tYW5kYCBDb21tYW5kIHtPYmplY3R9IHRvIGJlIGxvZ2dlZFxuICAjICAgKiBgdHlwZWAgTmFtZSB7U3RyaW5nfSBvZiB0aGUgY29tbWFuZFxuICAjICAgKiBgdGFyZ2V0YCB7U3RyaW5nfSBkZXNjcmliaW5nIHdoZXJlIHRoZSBjb21tYW5kIHdhcyB0cmlnZ2VyZWRcbiAgbG9nQ29tbWFuZDogKGNvbW1hbmQpIC0+XG4gICAge3R5cGU6IG5hbWUsIHRhcmdldCwgdGltZX0gPSBjb21tYW5kXG4gICAgcmV0dXJuIGlmIGNvbW1hbmQuZGV0YWlsPy5qUXVlcnlUcmlnZ2VyXG4gICAgcmV0dXJuIGlmIG5hbWUgb2YgaWdub3JlZENvbW1hbmRzXG5cbiAgICBldmVudCA9IEBsYXRlc3RFdmVudCgpXG5cbiAgICBpZiBldmVudC5uYW1lIGlzIG5hbWVcbiAgICAgIGV2ZW50LmNvdW50KytcbiAgICBlbHNlXG4gICAgICBAbG9nSW5kZXggPSAoQGxvZ0luZGV4ICsgMSkgJSBAbG9nU2l6ZVxuICAgICAgZXZlbnQgPSBAbGF0ZXN0RXZlbnQoKVxuICAgICAgZXZlbnQubmFtZSA9IG5hbWVcbiAgICAgIGV2ZW50LnRhcmdldE5vZGVOYW1lID0gdGFyZ2V0Lm5vZGVOYW1lXG4gICAgICBldmVudC50YXJnZXRDbGFzc05hbWUgPSB0YXJnZXQuY2xhc3NOYW1lXG4gICAgICBldmVudC50YXJnZXRJZCA9IHRhcmdldC5pZFxuICAgICAgZXZlbnQuY291bnQgPSAxXG4gICAgICBldmVudC50aW1lID0gdGltZSA/IERhdGUubm93KClcblxuICAjIFByaXZhdGU6IENhbGN1bGF0ZXMgdGhlIHRpbWUgb2YgdGhlIGxhc3QgZXZlbnQgdG8gYmUgcmVwb3J0ZWQuXG4gICNcbiAgIyAqIGBkYXRhYCBEYXRhIGZyb20gYW4gZXh0ZXJuYWwgYnVnIHBhc3NlZCBpbiBmcm9tIGFub3RoZXIgcGFja2FnZS5cbiAgI1xuICAjIFJldHVybnMgdGhlIHtEYXRlfSBvZiB0aGUgbGFzdCBldmVudCB0aGF0IHNob3VsZCBiZSByZXBvcnRlZC5cbiAgY2FsY3VsYXRlTGFzdEV2ZW50VGltZTogKGRhdGEpIC0+XG4gICAgcmV0dXJuIGRhdGEudGltZSBpZiBkYXRhXG5cbiAgICBsYXN0VGltZSA9IG51bGxcbiAgICBAZWFjaEV2ZW50IChldmVudCkgLT4gbGFzdFRpbWUgPSBldmVudC50aW1lXG4gICAgbGFzdFRpbWVcblxuICAjIFByaXZhdGU6IEV4ZWN1dGVzIGEgZnVuY3Rpb24gb24gZWFjaCBldmVudCBpbiBjaHJvbm9sb2dpY2FsIG9yZGVyLlxuICAjXG4gICMgVGhpcyBmdW5jdGlvbiBpcyB1c2VkIGluc3RlYWQgb2Ygc2ltaWxhciB1bmRlcnNjb3JlIGZ1bmN0aW9ucyBiZWNhdXNlIHRoZSBsb2cgaXMgaGVsZCBpbiBhXG4gICMgY2lyY3VsYXIgYnVmZmVyLlxuICAjXG4gICMgKiBgZm5gIHtGdW5jdGlvbn0gdG8gZXhlY3V0ZSBmb3IgZWFjaCBldmVudCBpbiB0aGUgbG9nLlxuICAjICAgKiBgZXZlbnRgIEFuIHtPYmplY3R9IGRlc2NyaWJpbmcgdGhlIGV2ZW50IHBhc3NlZCB0byB5b3VyIGZ1bmN0aW9uLlxuICAjXG4gICMgIyMgRXhhbXBsZXNcbiAgI1xuICAjIFRoaXMgY29kZSB3b3VsZCBvdXRwdXQgdGhlIG5hbWUgb2YgZWFjaCBldmVudCB0byB0aGUgY29uc29sZS5cbiAgI1xuICAjIGBgYGNvZmZlZVxuICAjIGxvZ2dlci5lYWNoRXZlbnQgKGV2ZW50KSAtPlxuICAjICAgY29uc29sZS5sb2cgZXZlbnQubmFtZVxuICAjIGBgYFxuICBlYWNoRXZlbnQ6IChmbikgLT5cbiAgICBmb3Igb2Zmc2V0IGluIFsxLi5AbG9nU2l6ZV1cbiAgICAgIGZuKEBldmVudExvZ1soQGxvZ0luZGV4ICsgb2Zmc2V0KSAlIEBsb2dTaXplXSlcbiAgICByZXR1cm5cblxuICAjIFByaXZhdGU6IEZvcm1hdCB0aGUgY29tbWFuZCBjb3VudCBmb3IgcmVwb3J0aW5nLlxuICAjXG4gICMgUmV0dXJucyB0aGUge1N0cmluZ30gZm9ybWF0IG9mIHRoZSBjb21tYW5kIGNvdW50LlxuICBmb3JtYXRDb3VudDogKGNvdW50KSAtPlxuICAgIHN3aXRjaFxuICAgICAgd2hlbiBjb3VudCA8IDIgdGhlbiAnICAgICdcbiAgICAgIHdoZW4gY291bnQgPCAxMCB0aGVuIFwiICAje2NvdW50fXhcIlxuICAgICAgd2hlbiBjb3VudCA8IDEwMCB0aGVuIFwiICN7Y291bnR9eFwiXG5cbiAgIyBQcml2YXRlOiBGb3JtYXRzIGEgY29tbWFuZCBldmVudCBmb3IgcmVwb3J0aW5nLlxuICAjXG4gICMgKiBgZXZlbnRgIEV2ZW50IHtPYmplY3R9IHRvIGJlIGZvcm1hdHRlZC5cbiAgIyAqIGBsYXN0VGltZWAge0RhdGV9IG9mIHRoZSBsYXN0IGV2ZW50IHRvIHJlcG9ydC5cbiAgI1xuICAjIFJldHVybnMgdGhlIHtTdHJpbmd9IGZvcm1hdCBvZiB0aGUgY29tbWFuZCBldmVudC5cbiAgZm9ybWF0RXZlbnQ6IChldmVudCwgbGFzdFRpbWUpIC0+XG4gICAge2NvdW50LCB0aW1lLCBuYW1lLCB0YXJnZXROb2RlTmFtZSwgdGFyZ2V0Q2xhc3NOYW1lLCB0YXJnZXRJZH0gPSBldmVudFxuICAgIG5vZGVUZXh0ID0gdGFyZ2V0Tm9kZU5hbWUudG9Mb3dlckNhc2UoKVxuICAgIGlkVGV4dCA9IGlmIHRhcmdldElkIHRoZW4gXCIjI3t0YXJnZXRJZH1cIiBlbHNlICcnXG4gICAgY2xhc3NUZXh0ID0gJydcbiAgICBjbGFzc1RleHQgKz0gXCIuI3trbGFzc31cIiBmb3Iga2xhc3MgaW4gdGFyZ2V0Q2xhc3NOYW1lLnNwbGl0KFwiIFwiKSBpZiB0YXJnZXRDbGFzc05hbWU/XG4gICAgXCIje0Bmb3JtYXRDb3VudChjb3VudCl9ICN7QGZvcm1hdFRpbWUobGFzdFRpbWUgLSB0aW1lKX0gI3tuYW1lfSAoI3tub2RlVGV4dH0je2lkVGV4dH0je2NsYXNzVGV4dH0pXCJcblxuICAjIFByaXZhdGU6IEZvcm1hdCB0aGUgY29tbWFuZCB0aW1lIGZvciByZXBvcnRpbmcuXG4gICNcbiAgIyAqIGB0aW1lYCB7RGF0ZX0gdG8gZm9ybWF0XG4gICNcbiAgIyBSZXR1cm5zIHRoZSB7U3RyaW5nfSBmb3JtYXQgb2YgdGhlIGNvbW1hbmQgdGltZS5cbiAgZm9ybWF0VGltZTogKHRpbWUpIC0+XG4gICAgbWludXRlcyA9IE1hdGguZmxvb3IodGltZSAvIDYwMDAwKVxuICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKCgodGltZSAlIDYwMDAwKSAvIDEwMDApICogMTApIC8gMTBcbiAgICBzZWNvbmRzID0gXCIwI3tzZWNvbmRzfVwiIGlmIHNlY29uZHMgPCAxMFxuICAgIHNlY29uZHMgPSBcIiN7c2Vjb25kc30uMFwiIGlmIE1hdGguZmxvb3Ioc2Vjb25kcykgaXNudCBzZWNvbmRzXG4gICAgXCItI3ttaW51dGVzfToje3NlY29uZHN9XCJcblxuICAjIFByaXZhdGU6IEluaXRpYWxpemVzIHRoZSBsb2cgc3RydWN0dXJlIGZvciBzcGVlZC5cbiAgaW5pdExvZzogLT5cbiAgICBAbG9nSW5kZXggPSAwXG4gICAgQGV2ZW50TG9nID0gZm9yIGkgaW4gWzAuLi5AbG9nU2l6ZV1cbiAgICAgIG5hbWU6IG51bGxcbiAgICAgIGNvdW50OiAwXG4gICAgICB0YXJnZXROb2RlTmFtZTogbnVsbFxuICAgICAgdGFyZ2V0Q2xhc3NOYW1lOiBudWxsXG4gICAgICB0YXJnZXRJZDogbnVsbFxuICAgICAgdGltZTogbnVsbFxuIl19
