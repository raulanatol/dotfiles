(function() {
  module.exports = {
    unescapeEscapeSequence: function(string) {
      return string.replace(/\\(.)/gm, function(match, char) {
        if (char === 't') {
          return '\t';
        } else if (char === 'n') {
          return '\n';
        } else if (char === 'r') {
          return '\r';
        } else if (char === '\\') {
          return '\\';
        } else {
          return match;
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvZmluZC1hbmQtcmVwbGFjZS9saWIvZXNjYXBlLWhlbHBlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsc0JBQUEsRUFBd0IsU0FBQyxNQUFEO2FBQ3RCLE1BQU0sQ0FBQyxPQUFQLENBQWUsU0FBZixFQUEwQixTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ3hCLElBQUcsSUFBQSxLQUFRLEdBQVg7aUJBQ0UsS0FERjtTQUFBLE1BRUssSUFBRyxJQUFBLEtBQVEsR0FBWDtpQkFDSCxLQURHO1NBQUEsTUFFQSxJQUFHLElBQUEsS0FBUSxHQUFYO2lCQUNILEtBREc7U0FBQSxNQUVBLElBQUcsSUFBQSxLQUFRLElBQVg7aUJBQ0gsS0FERztTQUFBLE1BQUE7aUJBR0gsTUFIRzs7TUFQbUIsQ0FBMUI7SUFEc0IsQ0FBeEI7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIHVuZXNjYXBlRXNjYXBlU2VxdWVuY2U6IChzdHJpbmcpIC0+XG4gICAgc3RyaW5nLnJlcGxhY2UgL1xcXFwoLikvZ20sIChtYXRjaCwgY2hhcikgLT5cbiAgICAgIGlmIGNoYXIgaXMgJ3QnXG4gICAgICAgICdcXHQnXG4gICAgICBlbHNlIGlmIGNoYXIgaXMgJ24nXG4gICAgICAgICdcXG4nXG4gICAgICBlbHNlIGlmIGNoYXIgaXMgJ3InXG4gICAgICAgICdcXHInXG4gICAgICBlbHNlIGlmIGNoYXIgaXMgJ1xcXFwnXG4gICAgICAgICdcXFxcJ1xuICAgICAgZWxzZVxuICAgICAgICBtYXRjaFxuIl19
