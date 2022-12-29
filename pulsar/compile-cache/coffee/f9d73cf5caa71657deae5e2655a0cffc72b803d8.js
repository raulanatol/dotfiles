(function() {
  module.exports = {
    create: function(htmlString) {
      var template;
      template = document.createElement('template');
      template.innerHTML = htmlString;
      document.body.appendChild(template);
      return template;
    },
    render: function(template) {
      return document.importNode(template.content, true);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvbm90aWZpY2F0aW9ucy9saWIvdGVtcGxhdGUtaGVscGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsU0FBQyxVQUFEO0FBQ04sVUFBQTtNQUFBLFFBQUEsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixVQUF2QjtNQUNYLFFBQVEsQ0FBQyxTQUFULEdBQXFCO01BQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBZCxDQUEwQixRQUExQjthQUNBO0lBSk0sQ0FBUjtJQU1BLE1BQUEsRUFBUSxTQUFDLFFBQUQ7YUFDTixRQUFRLENBQUMsVUFBVCxDQUFvQixRQUFRLENBQUMsT0FBN0IsRUFBc0MsSUFBdEM7SUFETSxDQU5SOztBQURGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuICBjcmVhdGU6IChodG1sU3RyaW5nKSAtPlxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKVxuICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IGh0bWxTdHJpbmdcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRlbXBsYXRlKVxuICAgIHRlbXBsYXRlXG5cbiAgcmVuZGVyOiAodGVtcGxhdGUpIC0+XG4gICAgZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKVxuIl19
