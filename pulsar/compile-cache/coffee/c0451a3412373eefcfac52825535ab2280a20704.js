(function() {
  var CompositeDisposable, CursorPositionView, Emitter, FileInfoView, GitView, Grim, LaunchModeView, SelectionCountView, StatusBarView, ref,
    slice = [].slice;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  Grim = require('grim');

  StatusBarView = require('./status-bar-view');

  FileInfoView = require('./file-info-view');

  CursorPositionView = require('./cursor-position-view');

  SelectionCountView = require('./selection-count-view');

  GitView = require('./git-view');

  LaunchModeView = require('./launch-mode-view');

  module.exports = {
    activate: function() {
      var devMode, launchModeView, ref1, safeMode;
      this.emitters = new Emitter();
      this.subscriptions = new CompositeDisposable();
      this.statusBar = new StatusBarView();
      this.attachStatusBar();
      this.subscriptions.add(atom.config.onDidChange('status-bar.fullWidth', (function(_this) {
        return function() {
          return _this.attachStatusBar();
        };
      })(this)));
      this.updateStatusBarVisibility();
      this.statusBarVisibilitySubscription = atom.config.observe('status-bar.isVisible', (function(_this) {
        return function() {
          return _this.updateStatusBarVisibility();
        };
      })(this));
      atom.commands.add('atom-workspace', 'status-bar:toggle', (function(_this) {
        return function() {
          if (_this.statusBarPanel.isVisible()) {
            return atom.config.set('status-bar.isVisible', false);
          } else {
            return atom.config.set('status-bar.isVisible', true);
          }
        };
      })(this));
      ref1 = atom.getLoadSettings(), safeMode = ref1.safeMode, devMode = ref1.devMode;
      if (safeMode || devMode) {
        launchModeView = new LaunchModeView({
          safeMode: safeMode,
          devMode: devMode
        });
        this.statusBar.addLeftTile({
          item: launchModeView.element,
          priority: -1
        });
      }
      this.fileInfo = new FileInfoView();
      this.statusBar.addLeftTile({
        item: this.fileInfo.element,
        priority: 0
      });
      this.cursorPosition = new CursorPositionView();
      this.statusBar.addLeftTile({
        item: this.cursorPosition.element,
        priority: 1
      });
      this.selectionCount = new SelectionCountView();
      this.statusBar.addLeftTile({
        item: this.selectionCount.element,
        priority: 2
      });
      this.gitInfo = new GitView();
      return this.gitInfoTile = this.statusBar.addRightTile({
        item: this.gitInfo.element,
        priority: 0
      });
    },
    deactivate: function() {
      var ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
      if ((ref1 = this.statusBarVisibilitySubscription) != null) {
        ref1.dispose();
      }
      this.statusBarVisibilitySubscription = null;
      if ((ref2 = this.gitInfo) != null) {
        ref2.destroy();
      }
      this.gitInfo = null;
      if ((ref3 = this.fileInfo) != null) {
        ref3.destroy();
      }
      this.fileInfo = null;
      if ((ref4 = this.cursorPosition) != null) {
        ref4.destroy();
      }
      this.cursorPosition = null;
      if ((ref5 = this.selectionCount) != null) {
        ref5.destroy();
      }
      this.selectionCount = null;
      if ((ref6 = this.statusBarPanel) != null) {
        ref6.destroy();
      }
      this.statusBarPanel = null;
      if ((ref7 = this.statusBar) != null) {
        ref7.destroy();
      }
      this.statusBar = null;
      if ((ref8 = this.subscriptions) != null) {
        ref8.dispose();
      }
      this.subscriptions = null;
      if ((ref9 = this.emitters) != null) {
        ref9.dispose();
      }
      this.emitters = null;
      if (atom.__workspaceView != null) {
        return delete atom.__workspaceView.statusBar;
      }
    },
    updateStatusBarVisibility: function() {
      if (atom.config.get('status-bar.isVisible')) {
        return this.statusBarPanel.show();
      } else {
        return this.statusBarPanel.hide();
      }
    },
    provideStatusBar: function() {
      return {
        addLeftTile: this.statusBar.addLeftTile.bind(this.statusBar),
        addRightTile: this.statusBar.addRightTile.bind(this.statusBar),
        getLeftTiles: this.statusBar.getLeftTiles.bind(this.statusBar),
        getRightTiles: this.statusBar.getRightTiles.bind(this.statusBar),
        disableGitInfoTile: this.gitInfoTile.destroy.bind(this.gitInfoTile)
      };
    },
    attachStatusBar: function() {
      var panelArgs;
      if (this.statusBarPanel != null) {
        this.statusBarPanel.destroy();
      }
      panelArgs = {
        item: this.statusBar,
        priority: 0
      };
      if (atom.config.get('status-bar.fullWidth')) {
        return this.statusBarPanel = atom.workspace.addFooterPanel(panelArgs);
      } else {
        return this.statusBarPanel = atom.workspace.addBottomPanel(panelArgs);
      }
    },
    legacyProvideStatusBar: function() {
      var statusbar;
      statusbar = this.provideStatusBar();
      return {
        addLeftTile: function() {
          var args;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          Grim.deprecate("Use version ^1.0.0 of the status-bar Service API.");
          return statusbar.addLeftTile.apply(statusbar, args);
        },
        addRightTile: function() {
          var args;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          Grim.deprecate("Use version ^1.0.0 of the status-bar Service API.");
          return statusbar.addRightTile.apply(statusbar, args);
        },
        getLeftTiles: function() {
          Grim.deprecate("Use version ^1.0.0 of the status-bar Service API.");
          return statusbar.getLeftTiles();
        },
        getRightTiles: function() {
          Grim.deprecate("Use version ^1.0.0 of the status-bar Service API.");
          return statusbar.getRightTiles();
        }
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvc3RhdHVzLWJhci9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFJQUFBO0lBQUE7O0VBQUEsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyw2Q0FBRCxFQUFzQjs7RUFDdEIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLG1CQUFSOztFQUNoQixZQUFBLEdBQWUsT0FBQSxDQUFRLGtCQUFSOztFQUNmLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx3QkFBUjs7RUFDckIsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHdCQUFSOztFQUNyQixPQUFBLEdBQVUsT0FBQSxDQUFRLFlBQVI7O0VBQ1YsY0FBQSxHQUFpQixPQUFBLENBQVEsb0JBQVI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksT0FBSixDQUFBO01BQ1osSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSSxtQkFBSixDQUFBO01BRWpCLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBSSxhQUFKLENBQUE7TUFDYixJQUFDLENBQUEsZUFBRCxDQUFBO01BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixzQkFBeEIsRUFBZ0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNqRSxLQUFDLENBQUEsZUFBRCxDQUFBO1FBRGlFO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoRCxDQUFuQjtNQUdBLElBQUMsQ0FBQSx5QkFBRCxDQUFBO01BRUEsSUFBQyxDQUFBLCtC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RCxHQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWYsQ0FBOEIsU0FBOUIsRUFEcEI7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQThCLFNBQTlCLEVBSHBCOztJQUplLENBbEZqQjtJQWdHQSxzQkFBQSxFQUF3QixTQUFBO0FBQ3RCLFVBQUE7TUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLGdCQUFELENBQUE7YUFFWjtRQUFBLFdBQUEsRUFBYSxTQUFBO0FBQ1gsY0FBQTtVQURZO1VBQ1osSUFBSSxDQUFDLFNBQUwsQ0FBZSxtREFBZjtpQkFDQSxTQUFTLENBQUMsV0FBVixrQkFBc0IsSUFBdEI7UUFGVyxDQUFiO1FBR0EsWUFBQSxFQUFjLFNBQUE7QUFDWixjQUFBO1VBRGE7VUFDYixJQUFJLENBQUMsU0FBTCxDQUFlLG1EQUFmO2lCQUNBLFNBQVMsQ0FBQyxZQUFWLGtCQUF1QixJQUF2QjtRQUZZLENBSGQ7UUFNQSxZQUFBLEVBQWMsU0FBQTtVQUNaLElBQUksQ0FBQyxTQUFMLENBQWUsbURBQWY7aUJBQ0EsU0FBUyxDQUFDLFlBQVYsQ0FBQTtRQUZZLENBTmQ7UUFTQSxhQUFBLEVBQWUsU0FBQTtVQUNiLElBQUksQ0FBQyxTQUFMLENBQWUsbURBQWY7aUJBQ0EsU0FBUyxDQUFDLGFBQVYsQ0FBQTtRQUZhLENBVGY7O0lBSHNCLENBaEd4Qjs7QUFWRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5HcmltID0gcmVxdWlyZSAnZ3JpbSdcblN0YXR1c0JhclZpZXcgPSByZXF1aXJlICcuL3N0YXR1cy1iYXItdmlldydcbkZpbGVJbmZvVmlldyA9IHJlcXVpcmUgJy4vZmlsZS1pbmZvLXZpZXcnXG5DdXJzb3JQb3NpdGlvblZpZXcgPSByZXF1aXJlICcuL2N1cnNvci1wb3NpdGlvbi12aWV3J1xuU2VsZWN0aW9uQ291bnRWaWV3ID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24tY291bnQtdmlldydcbkdpdFZpZXcgPSByZXF1aXJlICcuL2dpdC12aWV3J1xuTGF1bmNoTW9kZVZpZXcgPSByZXF1aXJlICcuL2xhdW5jaC1tb2RlLXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgYWN0aXZhdGU6IC0+XG4gICAgQGVtaXR0ZXJzID0gbmV3IEVtaXR0ZXIoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgQHN0YXR1c0JhciA9IG5ldyBTdGF0dXNCYXJWaWV3KClcbiAgICBAYXR0YWNoU3RhdHVzQmFyKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnc3RhdHVzLWJhci5mdWxsV2lkdGgnLCA9PlxuICAgICAgQGF0dGFjaFN0YXR1c0JhcigpXG5cbiAgICBAdXBkYXRlU3RhdHVzQmFyVmlzaWJpbGl0eSgpXG5cbiAgICBAc3RhdHVzQmFyVmlzaWJpbGl0eVN1YnNjcmlwdGlvbiA9XG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICdzdGF0dXMtYmFyLmlzVmlzaWJsZScsID0+XG4gICAgICAgIEB1cGRhdGVTdGF0dXNCYXJWaXNpYmlsaXR5KClcblxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdzdGF0dXMtYmFyOnRvZ2dsZScsID0+XG4gICAgICBpZiBAc3RhdHVzQmFyUGFuZWwuaXNWaXNpYmxlKClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0ICdzdGF0dXMtYmFyLmlzVmlzaWJsZScsIGZhbHNlXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20uY29uZmlnLnNldCAnc3RhdHVzLWJhci5pc1Zpc2libGUnLCB0cnVlXG5cbiAgICB7c2FmZU1vZGUsIGRldk1vZGV9ID0gYXRvbS5nZXRMb2FkU2V0dGluZ3MoKVxuICAgIGlmIHNhZmVNb2RlIG9yIGRldk1vZGVcbiAgICAgIGxhdW5jaE1vZGVWaWV3ID0gbmV3IExhdW5jaE1vZGVWaWV3KHtzYWZlTW9kZSwgZGV2TW9kZX0pXG4gICAgICBAc3RhdHVzQmFyLmFkZExlZnRUaWxlKGl0ZW06IGxhdW5jaE1vZGVWaWV3LmVsZW1lbnQsIHByaW9yaXR5OiAtMSlcblxuICAgIEBmaWxlSW5mbyA9IG5ldyBGaWxlSW5mb1ZpZXcoKVxuICAgIEBzdGF0dXNCYXIuYWRkTGVmdFRpbGUoaXRlbTogQGZpbGVJbmZvLmVsZW1lbnQsIHByaW9yaXR5OiAwKVxuXG4gICAgQGN1cnNvclBvc2l0aW9uID0gbmV3IEN1cnNvclBvc2l0aW9uVmlldygpXG4gICAgQHN0YXR1c0Jhci5hZGRMZWZ0VGlsZShpdGVtOiBAY3Vyc29yUG9zaXRpb24uZWxlbWVudCwgcHJpb3JpdHk6IDEpXG5cbiAgICBAc2VsZWN0aW9uQ291bnQgPSBuZXcgU2VsZWN0aW9uQ291bnRWaWV3KClcbiAgICBAc3RhdHVzQmFyLmFkZExlZnRUaWxlKGl0ZW06IEBzZWxlY3Rpb25Db3VudC5lbGVtZW50LCBwcmlvcml0eTogMilcblxuICAgIEBnaXRJbmZvID0gbmV3IEdpdFZpZXcoKVxuICAgIEBnaXRJbmZvVGlsZSA9IEBzdGF0dXNCYXIuYWRkUmlnaHRUaWxlKGl0ZW06IEBnaXRJbmZvLmVsZW1lbnQsIHByaW9yaXR5OiAwKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN0YXR1c0JhclZpc2liaWxpdHlTdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuICAgIEBzdGF0dXNCYXJWaXNpYmlsaXR5U3Vic2NyaXB0aW9uID0gbnVsbFxuXG4gICAgQGdpdEluZm8/LmRlc3Ryb3koKVxuICAgIEBnaXRJbmZvID0gbnVsbFxuXG4gICAgQGZpbGVJbmZvPy5kZXN0cm95KClcbiAgICBAZmlsZUluZm8gPSBudWxsXG5cbiAgICBAY3Vyc29yUG9zaXRpb24/LmRlc3Ryb3koKVxuICAgIEBjdXJzb3JQb3NpdGlvbiA9IG51bGxcblxuICAgIEBzZWxlY3Rpb25Db3VudD8uZGVzdHJveSgpXG4gICAgQHNlbGVjdGlvbkNvdW50ID0gbnVsbFxuXG4gICAgQHN0YXR1c0JhclBhbmVsPy5kZXN0cm95KClcbiAgICBAc3RhdHVzQmFyUGFuZWwgPSBudWxsXG5cbiAgICBAc3RhdHVzQmFyPy5kZXN0cm95KClcbiAgICBAc3RhdHVzQmFyID0gbnVsbFxuXG4gICAgQHN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbnVsbFxuXG4gICAgQGVtaXR0ZXJzPy5kaXNwb3NlKClcbiAgICBAZW1pdHRlcnMgPSBudWxsXG5cbiAgICBkZWxldGUgYXRvbS5fX3dvcmtzcGFjZVZpZXcuc3RhdHVzQmFyIGlmIGF0b20uX193b3Jrc3BhY2VWaWV3P1xuXG4gIHVwZGF0ZVN0YXR1c0JhclZpc2liaWxpdHk6IC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0ICdzdGF0dXMtYmFyLmlzVmlzaWJsZSdcbiAgICAgIEBzdGF0dXNCYXJQYW5lbC5zaG93KClcbiAgICBlbHNlXG4gICAgICBAc3RhdHVzQmFyUGFuZWwuaGlkZSgpXG5cbiAgcHJvdmlkZVN0YXR1c0JhcjogLT5cbiAgICBhZGRMZWZ0VGlsZTogQHN0YXR1c0Jhci5hZGRMZWZ0VGlsZS5iaW5kKEBzdGF0dXNCYXIpXG4gICAgYWRkUmlnaHRUaWxlOiBAc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZS5iaW5kKEBzdGF0dXNCYXIpXG4gICAgZ2V0TGVmdFRpbGVzOiBAc3RhdHVzQmFyLmdldExlZnRUaWxlcy5iaW5kKEBzdGF0dXNCYXIpXG4gICAgZ2V0UmlnaHRUaWxlczogQHN0YXR1c0Jhci5nZXRSaWdodFRpbGVzLmJpbmQoQHN0YXR1c0JhcilcbiAgICBkaXNhYmxlR2l0SW5mb1RpbGU6IEBnaXRJbmZvVGlsZS5kZXN0cm95LmJpbmQoQGdpdEluZm9UaWxlKVxuXG4gIGF0dGFjaFN0YXR1c0JhcjogLT5cbiAgICBAc3RhdHVzQmFyUGFuZWwuZGVzdHJveSgpIGlmIEBzdGF0dXNCYXJQYW5lbD9cblxuICAgIHBhbmVsQXJncyA9IHtpdGVtOiBAc3RhdHVzQmFyLCBwcmlvcml0eTogMH1cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N0YXR1cy1iYXIuZnVsbFdpZHRoJylcbiAgICAgIEBzdGF0dXNCYXJQYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZEZvb3RlclBhbmVsIHBhbmVsQXJnc1xuICAgIGVsc2VcbiAgICAgIEBzdGF0dXNCYXJQYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsIHBhbmVsQXJnc1xuXG4gICMgRGVwcmVjYXRlZFxuICAjXG4gICMgV3JhcCBkZXByZWNhdGlvbiBjYWxscyBvbiB0aGUgbWV0aG9kcyByZXR1cm5lZCByYXRoZXIgdGhhblxuICAjIFNlcnZpY2VzIEFQSSBtZXRob2Qgd2hpY2ggd291bGQgYmUgcmVnaXN0ZXJlZCBhbmQgdHJpZ2dlclxuICAjIGEgZGVwcmVjYXRpb24gY2FsbFxuICBsZWdhY3lQcm92aWRlU3RhdHVzQmFyOiAtPlxuICAgIHN0YXR1c2JhciA9IEBwcm92aWRlU3RhdHVzQmFyKClcblxuICAgIGFkZExlZnRUaWxlOiAoYXJncy4uLikgLT5cbiAgICAgIEdyaW0uZGVwcmVjYXRlKFwiVXNlIHZlcnNpb24gXjEuMC4wIG9mIHRoZSBzdGF0dXMtYmFyIFNlcnZpY2UgQVBJLlwiKVxuICAgICAgc3RhdHVzYmFyLmFkZExlZnRUaWxlKGFyZ3MuLi4pXG4gICAgYWRkUmlnaHRUaWxlOiAoYXJncy4uLikgLT5cbiAgICAgIEdyaW0uZGVwcmVjYXRlKFwiVXNlIHZlcnNpb24gXjEuMC4wIG9mIHRoZSBzdGF0dXMtYmFyIFNlcnZpY2UgQVBJLlwiKVxuICAgICAgc3RhdHVzYmFyLmFkZFJpZ2h0VGlsZShhcmdzLi4uKVxuICAgIGdldExlZnRUaWxlczogLT5cbiAgICAgIEdyaW0uZGVwcmVjYXRlKFwiVXNlIHZlcnNpb24gXjEuMC4wIG9mIHRoZSBzdGF0dXMtYmFyIFNlcnZpY2UgQVBJLlwiKVxuICAgICAgc3RhdHVzYmFyLmdldExlZnRUaWxlcygpXG4gICAgZ2V0UmlnaHRUaWxlczogLT5cbiAgICAgIEdyaW0uZGVwcmVjYXRlKFwiVXNlIHZlcnNpb24gXjEuMC4wIG9mIHRoZSBzdGF0dXMtYmFyIFNlcnZpY2UgQVBJLlwiKVxuICAgICAgc3RhdHVzYmFyLmdldFJpZ2h0VGlsZXMoKVxuIl19
