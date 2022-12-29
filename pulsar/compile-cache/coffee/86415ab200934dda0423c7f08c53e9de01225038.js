(function() {
  var _, capitalize, escapeHtml, escapeNode, escapeRegex, getReplacementResultsMessage, getSearchResultsMessage, preserveCase, sanitizePattern, showIf, titleize;

  _ = require('underscore-plus');

  escapeNode = null;

  escapeHtml = function(str) {
    if (escapeNode == null) {
      escapeNode = document.createElement('div');
    }
    escapeNode.innerText = str;
    return escapeNode.innerHTML;
  };

  escapeRegex = function(str) {
    return str.replace(/[.?*+^$[\]\\(){}|-]/g, function(match) {
      return "\\" + match;
    });
  };

  sanitizePattern = function(pattern) {
    pattern = escapeHtml(pattern);
    return pattern.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
  };

  getReplacementResultsMessage = function(arg) {
    var findPattern, replacePattern, replacedPathCount, replacementCount;
    findPattern = arg.findPattern, replacePattern = arg.replacePattern, replacedPathCount = arg.replacedPathCount, replacementCount = arg.replacementCount;
    if (replacedPathCount) {
      return "<span class=\"text-highlight\">Replaced <span class=\"highlight-error\">" + (sanitizePattern(findPattern)) + "</span> with <span class=\"highlight-success\">" + (sanitizePattern(replacePattern)) + "</span> " + (_.pluralize(replacementCount, 'time')) + " in " + (_.pluralize(replacedPathCount, 'file')) + "</span>";
    } else {
      return "<span class=\"text-highlight\">Nothing replaced</span>";
    }
  };

  getSearchResultsMessage = function(results) {
    var findPattern, matchCount, pathCount, replacedPathCount;
    if ((results != null ? results.findPattern : void 0) != null) {
      findPattern = results.findPattern, matchCount = results.matchCount, pathCount = results.pathCount, replacedPathCount = results.replacedPathCount;
      if (matchCount) {
        return (_.pluralize(matchCount, 'result')) + " found in " + (_.pluralize(pathCount, 'file')) + " for <span class=\"highlight-info\">" + (sanitizePattern(findPattern)) + "</span>";
      } else {
        return "No " + (replacedPathCount != null ? 'more' : '') + " results found for '" + (sanitizePattern(findPattern)) + "'";
      }
    } else {
      return '';
    }
  };

  showIf = function(condition) {
    if (condition) {
      return null;
    } else {
      return {
        display: 'none'
      };
    }
  };

  capitalize = function(str) {
    return str[0].toUpperCase() + str.toLowerCase().slice(1);
  };

  titleize = function(str) {
    return str.toLowerCase().replace(/(?:^|\s)\S/g, function(capital) {
      return capital.toUpperCase();
    });
  };

  preserveCase = function(text, reference) {
    if (reference === capitalize(reference.toLowerCase())) {
      return capitalize(text);
    } else if (reference === titleize(reference.toLowerCase())) {
      return titleize(text);
    } else if (reference === reference.toUpperCase()) {
      return text.toUpperCase();
    } else if (reference === reference.toLowerCase()) {
      return text.toLowerCase();
    } else {
      return text;
    }
  };

  module.exports = {
    escapeHtml: escapeHtml,
    escapeRegex: escapeRegex,
    sanitizePattern: sanitizePattern,
    getReplacementResultsMessage: getReplacementResultsMessage,
    getSearchResultsMessage: getSearchResultsMessage,
    showIf: showIf,
    preserveCase: preserveCase
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvZmluZC1hbmQtcmVwbGFjZS9saWIvcHJvamVjdC91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixVQUFBLEdBQWE7O0VBRWIsVUFBQSxHQUFhLFNBQUMsR0FBRDs7TUFDWCxhQUFjLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCOztJQUNkLFVBQVUsQ0FBQyxTQUFYLEdBQXVCO1dBQ3ZCLFVBQVUsQ0FBQztFQUhBOztFQUtiLFdBQUEsR0FBYyxTQUFDLEdBQUQ7V0FDWixHQUFHLENBQUMsT0FBSixDQUFZLHNCQUFaLEVBQW9DLFNBQUMsS0FBRDthQUFXLElBQUEsR0FBTztJQUFsQixDQUFwQztFQURZOztFQUdkLGVBQUEsR0FBa0IsU0FBQyxPQUFEO0lBQ2hCLE9BQUEsR0FBVSxVQUFBLENBQVcsT0FBWDtXQUNWLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEtBQWhCLEVBQXVCLEtBQXZCLENBQTZCLENBQUMsT0FBOUIsQ0FBc0MsS0FBdEMsRUFBNkMsS0FBN0M7RUFGZ0I7O0VBSWxCLDRCQUFBLEdBQStCLFNBQUMsR0FBRDtBQUM3QixRQUFBO0lBRCtCLCtCQUFhLHFDQUFnQiwyQ0FBbUI7SUFDL0UsSUFBRyxpQkFBSDthQUNFLDBFQUFBLEdBQTBFLENBQUMsZUFBQSxDQUFnQixXQUFoQixDQUFELENBQTFFLEdBQXdHLGlEQUF4RyxHQUF3SixDQUFDLGVBQUEsQ0FBZ0IsY0FBaEIsQ0FBRCxDQUF4SixHQUF5TCxVQUF6TCxHQUFrTSxDQUFDLENBQUMsQ0FBQyxTQUFGLENBQVksZ0JBQVosRUFBOEIsTUFBOUIsQ0FBRCxDQUFsTSxHQUF5TyxNQUF6TyxHQUE4TyxDQUFDLENBQUMsQ0FBQyxTQUFGLENBQVksaUJBQVosRUFBK0IsTUFBL0IsQ0FBRCxDQUE5TyxHQUFzUixVQUR4UjtLQUFBLE1BQUE7YUFHRSx5REFIRjs7RUFENkI7O0VBTS9CLHVCQUFBLEdBQTBCLFNBQUMsT0FBRDtBQUN4QixRQUFBO0lBQUEsSUFBRyx3REFBSDtNQUNHLGlDQUFELEVBQWMsK0JBQWQsRUFBMEIsNkJBQTFCLEVBQXFDO01BQ3JDLElBQUcsVUFBSDtlQUNJLENBQUMsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxVQUFaLEVBQXdCLFFBQXhCLENBQUQsQ0FBQSxHQUFtQyxZQUFuQyxHQUE4QyxDQUFDLENBQUMsQ0FBQyxTQUFGLENBQVksU0FBWixFQUF1QixNQUF2QixDQUFELENBQTlDLEdBQThFLHNDQUE5RSxHQUFtSCxDQUFDLGVBQUEsQ0FBZ0IsV0FBaEIsQ0FBRCxDQUFuSCxHQUFpSixVQURySjtPQUFBLE1BQUE7ZUFHRSxLQUFBLEdBQUssQ0FBSSx5QkFBSCxHQUEyQixNQUEzQixHQUF1QyxFQUF4QyxDQUFMLEdBQWdELHNCQUFoRCxHQUFxRSxDQUFDLGVBQUEsQ0FBZ0IsV0FBaEIsQ0FBRCxDQUFyRSxHQUFtRyxJQUhyRztPQUZGO0tBQUEsTUFBQTthQU9FLEdBUEY7O0VBRHdCOztFQVUxQixNQUFBLEdBQVMsU0FBQyxTQUFEO0lBQ1AsSUFBRyxTQUFIO2FBQ0UsS0FERjtLQUFBLE1BQUE7YUFHRTtRQUFDLE9BQUEsRUFBUyxNQUFWO1FBSEY7O0VBRE87O0VBTVQsVUFBQSxHQUFhLFNBQUMsR0FBRDtXQUFTLEdBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFQLENBQUEsQ0FBQSxHQUF1QixHQUFHLENBQUMsV0FBSixDQUFBLENBQWlCLENBQUMsS0FBbEIsQ0FBd0IsQ0FBeEI7RUFBaEM7O0VBQ2IsUUFBQSxHQUFXLFNBQUMsR0FBRDtXQUFTLEdBQUcsQ0FBQyxXQUFKLENBQUEsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQixhQUExQixFQUF5QyxTQUFDLE9BQUQ7YUFBYSxPQUFPLENBQUMsV0FBUixDQUFBO0lBQWIsQ0FBekM7RUFBVDs7RUFFWCxZQUFBLEdBQWUsU0FBQyxJQUFELEVBQU8sU0FBUDtJQUViLElBQUcsU0FBQSxLQUFhLFVBQUEsQ0FBVyxTQUFTLENBQUMsV0FBVixDQUFBLENBQVgsQ0FBaEI7YUFDRSxVQUFBLENBQVcsSUFBWCxFQURGO0tBQUEsTUFJSyxJQUFHLFNBQUEsS0FBYSxRQUFBLENBQVMsU0FBUyxDQUFDLFdBQVYsQ0FBQSxDQUFULENBQWhCO2FBQ0gsUUFBQSxDQUFTLElBQVQsRUFERztLQUFBLE1BSUEsSUFBRyxTQUFBLEtBQWEsU0FBUyxDQUFDLFdBQVYsQ0FBQSxDQUFoQjthQUNILElBQUksQ0FBQyxXQUFMLENBQUEsRUFERztLQUFBLE1BSUEsSUFBRyxTQUFBLEtBQWEsU0FBUyxDQUFDLFdBQVYsQ0FBQSxDQUFoQjthQUNILElBQUksQ0FBQyxXQUFMLENBQUEsRUFERztLQUFBLE1BQUE7YUFHSCxLQUhHOztFQWRROztFQW9CZixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLFlBQUEsVUFEZTtJQUNILGFBQUEsV0FERztJQUNVLGlCQUFBLGVBRFY7SUFDMkIsOEJBQUEsNEJBRDNCO0lBRWYseUJBQUEsdUJBRmU7SUFFVSxRQUFBLE1BRlY7SUFFa0IsY0FBQSxZQUZsQjs7QUE3RGpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuZXNjYXBlTm9kZSA9IG51bGxcblxuZXNjYXBlSHRtbCA9IChzdHIpIC0+XG4gIGVzY2FwZU5vZGUgPz0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZXNjYXBlTm9kZS5pbm5lclRleHQgPSBzdHJcbiAgZXNjYXBlTm9kZS5pbm5lckhUTUxcblxuZXNjYXBlUmVnZXggPSAoc3RyKSAtPlxuICBzdHIucmVwbGFjZSAvWy4/KiteJFtcXF1cXFxcKCl7fXwtXS9nLCAobWF0Y2gpIC0+IFwiXFxcXFwiICsgbWF0Y2hcblxuc2FuaXRpemVQYXR0ZXJuID0gKHBhdHRlcm4pIC0+XG4gIHBhdHRlcm4gPSBlc2NhcGVIdG1sKHBhdHRlcm4pXG4gIHBhdHRlcm4ucmVwbGFjZSgvXFxuL2csICdcXFxcbicpLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxuXG5nZXRSZXBsYWNlbWVudFJlc3VsdHNNZXNzYWdlID0gKHtmaW5kUGF0dGVybiwgcmVwbGFjZVBhdHRlcm4sIHJlcGxhY2VkUGF0aENvdW50LCByZXBsYWNlbWVudENvdW50fSkgLT5cbiAgaWYgcmVwbGFjZWRQYXRoQ291bnRcbiAgICBcIjxzcGFuIGNsYXNzPVxcXCJ0ZXh0LWhpZ2hsaWdodFxcXCI+UmVwbGFjZWQgPHNwYW4gY2xhc3M9XFxcImhpZ2hsaWdodC1lcnJvclxcXCI+I3tzYW5pdGl6ZVBhdHRlcm4oZmluZFBhdHRlcm4pfTwvc3Bhbj4gd2l0aCA8c3BhbiBjbGFzcz1cXFwiaGlnaGxpZ2h0LXN1Y2Nlc3NcXFwiPiN7c2FuaXRpemVQYXR0ZXJuKHJlcGxhY2VQYXR0ZXJuKX08L3NwYW4+ICN7Xy5wbHVyYWxpemUocmVwbGFjZW1lbnRDb3VudCwgJ3RpbWUnKX0gaW4gI3tfLnBsdXJhbGl6ZShyZXBsYWNlZFBhdGhDb3VudCwgJ2ZpbGUnKX08L3NwYW4+XCJcbiAgZWxzZVxuICAgIFwiPHNwYW4gY2xhc3M9XFxcInRleHQtaGlnaGxpZ2h0XFxcIj5Ob3RoaW5nIHJlcGxhY2VkPC9zcGFuPlwiXG5cbmdldFNlYXJjaFJlc3VsdHNNZXNzYWdlID0gKHJlc3VsdHMpIC0+XG4gIGlmIHJlc3VsdHM/LmZpbmRQYXR0ZXJuP1xuICAgIHtmaW5kUGF0dGVybiwgbWF0Y2hDb3VudCwgcGF0aENvdW50LCByZXBsYWNlZFBhdGhDb3VudH0gPSByZXN1bHRzXG4gICAgaWYgbWF0Y2hDb3VudFxuICAgICAgXCIje18ucGx1cmFsaXplKG1hdGNoQ291bnQsICdyZXN1bHQnKX0gZm91bmQgaW4gI3tfLnBsdXJhbGl6ZShwYXRoQ291bnQsICdmaWxlJyl9IGZvciA8c3BhbiBjbGFzcz1cXFwiaGlnaGxpZ2h0LWluZm9cXFwiPiN7c2FuaXRpemVQYXR0ZXJuKGZpbmRQYXR0ZXJuKX08L3NwYW4+XCJcbiAgICBlbHNlXG4gICAgICBcIk5vICN7aWYgcmVwbGFjZWRQYXRoQ291bnQ/IHRoZW4gJ21vcmUnIGVsc2UgJyd9IHJlc3VsdHMgZm91bmQgZm9yICcje3Nhbml0aXplUGF0dGVybihmaW5kUGF0dGVybil9J1wiXG4gIGVsc2VcbiAgICAnJ1xuXG5zaG93SWYgPSAoY29uZGl0aW9uKSAtPlxuICBpZiBjb25kaXRpb25cbiAgICBudWxsXG4gIGVsc2VcbiAgICB7ZGlzcGxheTogJ25vbmUnfVxuXG5jYXBpdGFsaXplID0gKHN0cikgLT4gc3RyWzBdLnRvVXBwZXJDYXNlKCkgKyBzdHIudG9Mb3dlckNhc2UoKS5zbGljZSgxKVxudGl0bGVpemUgPSAoc3RyKSAtPiBzdHIudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8oPzpefFxccylcXFMvZywgKGNhcGl0YWwpIC0+IGNhcGl0YWwudG9VcHBlckNhc2UoKSlcblxucHJlc2VydmVDYXNlID0gKHRleHQsIHJlZmVyZW5jZSkgLT5cbiAgIyBJZiByZXBsYWNlZCB0ZXh0IGlzIGNhcGl0YWxpemVkIChzdHJpY3QpIGxpa2UgYSBzZW50ZW5jZSwgY2FwaXRhbGl6ZSByZXBsYWNlbWVudFxuICBpZiByZWZlcmVuY2UgaXMgY2FwaXRhbGl6ZShyZWZlcmVuY2UudG9Mb3dlckNhc2UoKSlcbiAgICBjYXBpdGFsaXplKHRleHQpXG5cbiAgIyBJZiByZXBsYWNlZCB0ZXh0IGlzIHRpdGxlaXplZCAoaS5lLiwgZWFjaCB3b3JkIHN0YXJ0IHdpdGggYW4gdXBwZXJjYXNlKSwgdGl0bGVpemUgcmVwbGFjZW1lbnRcbiAgZWxzZSBpZiByZWZlcmVuY2UgaXMgdGl0bGVpemUocmVmZXJlbmNlLnRvTG93ZXJDYXNlKCkpXG4gICAgdGl0bGVpemUodGV4dClcblxuICAjIElmIHJlcGxhY2VkIHRleHQgaXMgdXBwZXJjYXNlLCB1cHBlcmNhc2UgcmVwbGFjZW1lbnRcbiAgZWxzZSBpZiByZWZlcmVuY2UgaXMgcmVmZXJlbmNlLnRvVXBwZXJDYXNlKClcbiAgICB0ZXh0LnRvVXBwZXJDYXNlKClcblxuICAjIElmIHJlcGxhY2VkIHRleHQgaXMgbG93ZXJjYXNlLCBsb3dlcmNhc2UgcmVwbGFjZW1lbnRcbiAgZWxzZSBpZiByZWZlcmVuY2UgaXMgcmVmZXJlbmNlLnRvTG93ZXJDYXNlKClcbiAgICB0ZXh0LnRvTG93ZXJDYXNlKClcbiAgZWxzZVxuICAgIHRleHRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZXNjYXBlSHRtbCwgZXNjYXBlUmVnZXgsIHNhbml0aXplUGF0dGVybiwgZ2V0UmVwbGFjZW1lbnRSZXN1bHRzTWVzc2FnZSxcbiAgZ2V0U2VhcmNoUmVzdWx0c01lc3NhZ2UsIHNob3dJZiwgcHJlc2VydmVDYXNlXG59XG4iXX0=
