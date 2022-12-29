(function() {
  var LaunchModeView;

  module.exports = LaunchModeView = (function() {
    function LaunchModeView(arg) {
      var devMode, ref, safeMode;
      ref = arg != null ? arg : {}, safeMode = ref.safeMode, devMode = ref.devMode;
      this.element = document.createElement('status-bar-launch-mode');
      this.element.classList.add('inline-block', 'icon', 'icon-color-mode');
      if (devMode) {
        this.element.classList.add('text-error');
        this.tooltipDisposable = atom.tooltips.add(this.element, {
          title: 'This window is in dev mode'
        });
      } else if (safeMode) {
        this.element.classList.add('text-success');
        this.tooltipDisposable = atom.tooltips.add(this.element, {
          title: 'This window is in safe mode'
        });
      }
    }

    LaunchModeView.prototype.detachedCallback = function() {
      var ref;
      return (ref = this.tooltipDisposable) != null ? ref.dispose() : void 0;
    };

    return LaunchModeView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvc3RhdHVzLWJhci9saWIvbGF1bmNoLW1vZGUtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyx3QkFBQyxHQUFEO0FBQ1gsVUFBQTswQkFEWSxNQUFvQixJQUFuQix5QkFBVTtNQUN2QixJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLHdCQUF2QjtNQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLGNBQXZCLEVBQXVDLE1BQXZDLEVBQStDLGlCQUEvQztNQUNBLElBQUcsT0FBSDtRQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLFlBQXZCO1FBQ0EsSUFBQyxDQUFBLGlCQUFELEdBQXFCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsT0FBbkIsRUFBNEI7VUFBQSxLQUFBLEVBQU8sNEJBQVA7U0FBNUIsRUFGdkI7T0FBQSxNQUdLLElBQUcsUUFBSDtRQUNILElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLGNBQXZCO1FBQ0EsSUFBQyxDQUFBLGlCQUFELEdBQXFCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsT0FBbkIsRUFBNEI7VUFBQSxLQUFBLEVBQU8sNkJBQVA7U0FBNUIsRUFGbEI7O0lBTk07OzZCQVViLGdCQUFBLEdBQWtCLFNBQUE7QUFDaEIsVUFBQTt5REFBa0IsQ0FBRSxPQUFwQixDQUFBO0lBRGdCOzs7OztBQVpwQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIExhdW5jaE1vZGVWaWV3XG4gIGNvbnN0cnVjdG9yOiAoe3NhZmVNb2RlLCBkZXZNb2RlfT17fSkgLT5cbiAgICBAZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0YXR1cy1iYXItbGF1bmNoLW1vZGUnKVxuICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lubGluZS1ibG9jaycsICdpY29uJywgJ2ljb24tY29sb3ItbW9kZScpXG4gICAgaWYgZGV2TW9kZVxuICAgICAgQGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndGV4dC1lcnJvcicpXG4gICAgICBAdG9vbHRpcERpc3Bvc2FibGUgPSBhdG9tLnRvb2x0aXBzLmFkZChAZWxlbWVudCwgdGl0bGU6ICdUaGlzIHdpbmRvdyBpcyBpbiBkZXYgbW9kZScpXG4gICAgZWxzZSBpZiBzYWZlTW9kZVxuICAgICAgQGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndGV4dC1zdWNjZXNzJylcbiAgICAgIEB0b29sdGlwRGlzcG9zYWJsZSA9IGF0b20udG9vbHRpcHMuYWRkKEBlbGVtZW50LCB0aXRsZTogJ1RoaXMgd2luZG93IGlzIGluIHNhZmUgbW9kZScpXG5cbiAgZGV0YWNoZWRDYWxsYmFjazogLT5cbiAgICBAdG9vbHRpcERpc3Bvc2FibGU/LmRpc3Bvc2UoKVxuIl19
