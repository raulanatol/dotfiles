(function() {
  var provider;

  provider = require('./provider');

  module.exports = {
    activate: function() {
      return provider.load();
    },
    getProvider: function() {
      return provider;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYXV0b2NvbXBsZXRlLWF0b20tYXBpL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsU0FBQTthQUFHLFFBQVEsQ0FBQyxJQUFULENBQUE7SUFBSCxDQUFWO0lBRUEsV0FBQSxFQUFhLFNBQUE7YUFBRztJQUFILENBRmI7O0FBSEYiLCJzb3VyY2VzQ29udGVudCI6WyJwcm92aWRlciA9IHJlcXVpcmUgJy4vcHJvdmlkZXInXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgYWN0aXZhdGU6IC0+IHByb3ZpZGVyLmxvYWQoKVxuXG4gIGdldFByb3ZpZGVyOiAtPiBwcm92aWRlclxuIl19
