(function() {
  var Tile;

  module.exports = Tile = (function() {
    function Tile(item, priority, collection) {
      this.item = item;
      this.priority = priority;
      this.collection = collection;
    }

    Tile.prototype.getItem = function() {
      return this.item;
    };

    Tile.prototype.getPriority = function() {
      return this.priority;
    };

    Tile.prototype.destroy = function() {
      this.collection.splice(this.collection.indexOf(this), 1);
      return atom.views.getView(this.item).remove();
    };

    return Tile;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvc3RhdHVzLWJhci9saWIvdGlsZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxjQUFDLElBQUQsRUFBUSxRQUFSLEVBQW1CLFVBQW5CO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsV0FBRDtNQUFXLElBQUMsQ0FBQSxhQUFEO0lBQW5COzttQkFFYixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQTtJQURNOzttQkFHVCxXQUFBLEdBQWEsU0FBQTthQUNYLElBQUMsQ0FBQTtJQURVOzttQkFHYixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBb0IsSUFBcEIsQ0FBbkIsRUFBOEMsQ0FBOUM7YUFDQSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBQyxDQUFBLElBQXBCLENBQXlCLENBQUMsTUFBMUIsQ0FBQTtJQUZPOzs7OztBQVZYIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVGlsZVxuICBjb25zdHJ1Y3RvcjogKEBpdGVtLCBAcHJpb3JpdHksIEBjb2xsZWN0aW9uKSAtPlxuXG4gIGdldEl0ZW06IC0+XG4gICAgQGl0ZW1cblxuICBnZXRQcmlvcml0eTogLT5cbiAgICBAcHJpb3JpdHlcblxuICBkZXN0cm95OiAtPlxuICAgIEBjb2xsZWN0aW9uLnNwbGljZShAY29sbGVjdGlvbi5pbmRleE9mKHRoaXMpLCAxKVxuICAgIGF0b20udmlld3MuZ2V0VmlldyhAaXRlbSkucmVtb3ZlKClcbiJdfQ==
