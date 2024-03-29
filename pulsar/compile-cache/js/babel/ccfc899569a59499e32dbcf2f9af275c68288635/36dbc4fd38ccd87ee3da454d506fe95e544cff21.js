'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _selectorKit = require("selector-kit");
var _scopeHelpers = require("./scope-helpers");
class ProviderMetadata {
  constructor(provider, apiVersion) {
    this.provider = provider;
    this.apiVersion = apiVersion;

    // TODO API: remove this when 2.0 support is removed
    if (this.provider.selector != null) {
      this.scopeSelectors = _selectorKit.Selector.create(this.provider.selector);
    } else {
      this.scopeSelectors = _selectorKit.Selector.create(this.provider.scopeSelector);
    }

    // TODO API: remove this when 2.0 support is removed
    if (this.provider.disableForSelector != null) {
      this.disableForScopeSelectors = _selectorKit.Selector.create(this.provider.disableForSelector);
    } else if (this.provider.disableForScopeSelector != null) {
      this.disableForScopeSelectors = _selectorKit.Selector.create(this.provider.disableForScopeSelector);
    }

    // TODO API: remove this when 1.0 support is removed
    let providerBlacklist;
    if (this.provider.providerblacklist && this.provider.providerblacklist['autocomplete-plus-fuzzyprovider']) {
      providerBlacklist = this.provider.providerblacklist['autocomplete-plus-fuzzyprovider'];
    }
    if (providerBlacklist) {
      this.disableDefaultProviderSelectors = _selectorKit.Selector.create(providerBlacklist);
    }
  }
  getLabels() {
    // The default label will let the provider be used for
    // the main text editors of the workspace.
    return this.provider.labels || ['workspace-center'];
  }
  matchesScopeChain(scopeChain) {
    if (this.disableForScopeSelectors != null) {
      if ((0, _scopeHelpers.selectorsMatchScopeChain)(this.disableForScopeSelectors, scopeChain)) {
        return false;
      }
    }
    if ((0, _scopeHelpers.selectorsMatchScopeChain)(this.scopeSelectors, scopeChain)) {
      return true;
    } else {
      return false;
    }
  }
  shouldDisableDefaultProvider(scopeChain) {
    if (this.disableDefaultProviderSelectors != null) {
      return (0, _scopeHelpers.selectorsMatchScopeChain)(this.disableDefaultProviderSelectors, scopeChain);
    } else {
      return false;
    }
  }
  getSpecificity(scopeChain) {
    const selector = (0, _scopeHelpers.selectorForScopeChain)(this.scopeSelectors, scopeChain);
    if (selector) {
      return selector.getSpecificity();
    } else {
      return 0;
    }
  }
}
exports.default = ProviderMetadata;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm92aWRlck1ldGFkYXRhIiwiY29uc3RydWN0b3IiLCJwcm92aWRlciIsImFwaVZlcnNpb24iLCJzZWxlY3RvciIsInNjb3BlU2VsZWN0b3JzIiwiU2VsZWN0b3IiLCJjcmVhdGUiLCJzY29wZVNlbGVjdG9yIiwiZGlzYWJsZUZvclNlbGVjdG9yIiwiZGlzYWJsZUZvclNjb3BlU2VsZWN0b3JzIiwiZGlzYWJsZUZvclNjb3BlU2VsZWN0b3IiLCJwcm92aWRlckJsYWNrbGlzdCIsInByb3ZpZGVyYmxhY2tsaXN0IiwiZGlzYWJsZURlZmF1bHRQcm92aWRlclNlbGVjdG9ycyIsImdldExhYmVscyIsImxhYmVscyIsIm1hdGNoZXNTY29wZUNoYWluIiwic2NvcGVDaGFpbiIsInNlbGVjdG9yc01hdGNoU2NvcGVDaGFpbiIsInNob3VsZERpc2FibGVEZWZhdWx0UHJvdmlkZXIiLCJnZXRTcGVjaWZpY2l0eSIsInNlbGVjdG9yRm9yU2NvcGVDaGFpbiJdLCJzb3VyY2VzIjpbInByb3ZpZGVyLW1ldGFkYXRhLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7IFNlbGVjdG9yIH0gZnJvbSAnc2VsZWN0b3Ita2l0J1xuaW1wb3J0IHsgc2VsZWN0b3JGb3JTY29wZUNoYWluLCBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4gfSBmcm9tICcuL3Njb3BlLWhlbHBlcnMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb3ZpZGVyTWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvciAocHJvdmlkZXIsIGFwaVZlcnNpb24pIHtcbiAgICB0aGlzLnByb3ZpZGVyID0gcHJvdmlkZXJcbiAgICB0aGlzLmFwaVZlcnNpb24gPSBhcGlWZXJzaW9uXG5cbiAgICAvLyBUT0RPIEFQSTogcmVtb3ZlIHRoaXMgd2hlbiAyLjAgc3VwcG9ydCBpcyByZW1vdmVkXG4gICAgaWYgKHRoaXMucHJvdmlkZXIuc2VsZWN0b3IgIT0gbnVsbCkge1xuICAgICAgdGhpcy5zY29wZVNlbGVjdG9ycyA9IFNlbGVjdG9yLmNyZWF0ZSh0aGlzLnByb3ZpZGVyLnNlbGVjdG9yKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNjb3BlU2VsZWN0b3JzID0gU2VsZWN0b3IuY3JlYXRlKHRoaXMucHJvdmlkZXIuc2NvcGVTZWxlY3RvcilcbiAgICB9XG5cbiAgICAvLyBUT0RPIEFQSTogcmVtb3ZlIHRoaXMgd2hlbiAyLjAgc3VwcG9ydCBpcyByZW1vdmVkXG4gICAgaWYgKHRoaXMucHJvdmlkZXIuZGlzYWJsZUZvclNlbGVjdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuZGlzYWJsZUZvclNjb3BlU2VsZWN0b3JzID0gU2VsZWN0b3IuY3JlYXRlKHRoaXMucHJvdmlkZXIuZGlzYWJsZUZvclNlbGVjdG9yKVxuICAgIH0gZWxzZSBpZiAodGhpcy5wcm92aWRlci5kaXNhYmxlRm9yU2NvcGVTZWxlY3RvciAhPSBudWxsKSB7XG4gICAgICB0aGlzLmRpc2FibGVGb3JTY29wZVNlbGVjdG9ycyA9IFNlbGVjdG9yLmNyZWF0ZSh0aGlzLnByb3ZpZGVyLmRpc2FibGVGb3JTY29wZVNlbGVjdG9yKVxuICAgIH1cblxuICAgIC8vIFRPRE8gQVBJOiByZW1vdmUgdGhpcyB3aGVuIDEuMCBzdXBwb3J0IGlzIHJlbW92ZWRcbiAgICBsZXQgcHJvdmlkZXJCbGFja2xpc3RcbiAgICBpZiAodGhpcy5wcm92aWRlci5wcm92aWRlcmJsYWNrbGlzdCAmJiB0aGlzLnByb3ZpZGVyLnByb3ZpZGVyYmxhY2tsaXN0WydhdXRvY29tcGxldGUtcGx1cy1mdXp6eXByb3ZpZGVyJ10pIHtcbiAgICAgIHByb3ZpZGVyQmxhY2tsaXN0ID0gdGhpcy5wcm92aWRlci5wcm92aWRlcmJsYWNrbGlzdFsnYXV0b2NvbXBsZXRlLXBsdXMtZnV6enlwcm92aWRlciddXG4gICAgfVxuICAgIGlmIChwcm92aWRlckJsYWNrbGlzdCkge1xuICAgICAgdGhpcy5kaXNhYmxlRGVmYXVsdFByb3ZpZGVyU2VsZWN0b3JzID0gU2VsZWN0b3IuY3JlYXRlKHByb3ZpZGVyQmxhY2tsaXN0KVxuICAgIH1cbiAgfVxuXG4gIGdldExhYmVscyAoKSB7XG4gICAgLy8gVGhlIGRlZmF1bHQgbGFiZWwgd2lsbCBsZXQgdGhlIHByb3ZpZGVyIGJlIHVzZWQgZm9yXG4gICAgLy8gdGhlIG1haW4gdGV4dCBlZGl0b3JzIG9mIHRoZSB3b3Jrc3BhY2UuXG4gICAgcmV0dXJuIHRoaXMucHJvdmlkZXIubGFiZWxzIHx8IFsnd29ya3NwYWNlLWNlbnRlciddXG4gIH1cblxuICBtYXRjaGVzU2NvcGVDaGFpbiAoc2NvcGVDaGFpbikge1xuICAgIGlmICh0aGlzLmRpc2FibGVGb3JTY29wZVNlbGVjdG9ycyAhPSBudWxsKSB7XG4gICAgICBpZiAoc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluKHRoaXMuZGlzYWJsZUZvclNjb3BlU2VsZWN0b3JzLCBzY29wZUNoYWluKSkgeyByZXR1cm4gZmFsc2UgfVxuICAgIH1cblxuICAgIGlmIChzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4odGhpcy5zY29wZVNlbGVjdG9ycywgc2NvcGVDaGFpbikpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIHNob3VsZERpc2FibGVEZWZhdWx0UHJvdmlkZXIgKHNjb3BlQ2hhaW4pIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlRGVmYXVsdFByb3ZpZGVyU2VsZWN0b3JzICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4odGhpcy5kaXNhYmxlRGVmYXVsdFByb3ZpZGVyU2VsZWN0b3JzLCBzY29wZUNoYWluKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBnZXRTcGVjaWZpY2l0eSAoc2NvcGVDaGFpbikge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gc2VsZWN0b3JGb3JTY29wZUNoYWluKHRoaXMuc2NvcGVTZWxlY3RvcnMsIHNjb3BlQ2hhaW4pXG4gICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICByZXR1cm4gc2VsZWN0b3IuZ2V0U3BlY2lmaWNpdHkoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gMFxuICAgIH1cbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiQUFBQSxXQUFXOztBQUFBO0VBQUE7QUFBQTtBQUFBO0FBRVg7QUFDQTtBQUVlLE1BQU1BLGdCQUFnQixDQUFDO0VBQ3BDQyxXQUFXLENBQUVDLFFBQVEsRUFBRUMsVUFBVSxFQUFFO0lBQ2pDLElBQUksQ0FBQ0QsUUFBUSxHQUFHQSxRQUFRO0lBQ3hCLElBQUksQ0FBQ0MsVUFBVSxHQUFHQSxVQUFVOztJQUU1QjtJQUNBLElBQUksSUFBSSxDQUFDRCxRQUFRLENBQUNFLFFBQVEsSUFBSSxJQUFJLEVBQUU7TUFDbEMsSUFBSSxDQUFDQyxjQUFjLEdBQUdDLHFCQUFRLENBQUNDLE1BQU0sQ0FBQyxJQUFJLENBQUNMLFFBQVEsQ0FBQ0UsUUFBUSxDQUFDO0lBQy9ELENBQUMsTUFBTTtNQUNMLElBQUksQ0FBQ0MsY0FBYyxHQUFHQyxxQkFBUSxDQUFDQyxNQUFNLENBQUMsSUFBSSxDQUFDTCxRQUFRLENBQUNNLGFBQWEsQ0FBQztJQUNwRTs7SUFFQTtJQUNBLElBQUksSUFBSSxDQUFDTixRQUFRLENBQUNPLGtCQUFrQixJQUFJLElBQUksRUFBRTtNQUM1QyxJQUFJLENBQUNDLHdCQUF3QixHQUFHSixxQkFBUSxDQUFDQyxNQUFNLENBQUMsSUFBSSxDQUFDTCxRQUFRLENBQUNPLGtCQUFrQixDQUFDO0lBQ25GLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQ1AsUUFBUSxDQUFDUyx1QkFBdUIsSUFBSSxJQUFJLEVBQUU7TUFDeEQsSUFBSSxDQUFDRCx3QkFBd0IsR0FBR0oscUJBQVEsQ0FBQ0MsTUFBTSxDQUFDLElBQUksQ0FBQ0wsUUFBUSxDQUFDUyx1QkFBdUIsQ0FBQztJQUN4Rjs7SUFFQTtJQUNBLElBQUlDLGlCQUFpQjtJQUNyQixJQUFJLElBQUksQ0FBQ1YsUUFBUSxDQUFDVyxpQkFBaUIsSUFBSSxJQUFJLENBQUNYLFFBQVEsQ0FBQ1csaUJBQWlCLENBQUMsaUNBQWlDLENBQUMsRUFBRTtNQUN6R0QsaUJBQWlCLEdBQUcsSUFBSSxDQUFDVixRQUFRLENBQUNXLGlCQUFpQixDQUFDLGlDQUFpQyxDQUFDO0lBQ3hGO0lBQ0EsSUFBSUQsaUJBQWlCLEVBQUU7TUFDckIsSUFBSSxDQUFDRSwrQkFBK0IsR0FBR1IscUJBQVEsQ0FBQ0MsTUFBTSxDQUFDSyxpQkFBaUIsQ0FBQztJQUMzRTtFQUNGO0VBRUFHLFNBQVMsR0FBSTtJQUNYO0lBQ0E7SUFDQSxPQUFPLElBQUksQ0FBQ2IsUUFBUSxDQUFDYyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztFQUNyRDtFQUVBQyxpQkFBaUIsQ0FBRUMsVUFBVSxFQUFFO0lBQzdCLElBQUksSUFBSSxDQUFDUix3QkFBd0IsSUFBSSxJQUFJLEVBQUU7TUFDekMsSUFBSSxJQUFBUyxzQ0FBd0IsRUFBQyxJQUFJLENBQUNULHdCQUF3QixFQUFFUSxVQUFVLENBQUMsRUFBRTtRQUFFLE9BQU8sS0FBSztNQUFDO0lBQzFGO0lBRUEsSUFBSSxJQUFBQyxzQ0FBd0IsRUFBQyxJQUFJLENBQUNkLGNBQWMsRUFBRWEsVUFBVSxDQUFDLEVBQUU7TUFDN0QsT0FBTyxJQUFJO0lBQ2IsQ0FBQyxNQUFNO01BQ0wsT0FBTyxLQUFLO0lBQ2Q7RUFDRjtFQUVBRSw0QkFBNEIsQ0FBRUYsVUFBVSxFQUFFO0lBQ3hDLElBQUksSUFBSSxDQUFDSiwrQkFBK0IsSUFBSSxJQUFJLEVBQUU7TUFDaEQsT0FBTyxJQUFBSyxzQ0FBd0IsRUFBQyxJQUFJLENBQUNMLCtCQUErQixFQUFFSSxVQUFVLENBQUM7SUFDbkYsQ0FBQyxNQUFNO01BQ0wsT0FBTyxLQUFLO0lBQ2Q7RUFDRjtFQUVBRyxjQUFjLENBQUVILFVBQVUsRUFBRTtJQUMxQixNQUFNZCxRQUFRLEdBQUcsSUFBQWtCLG1DQUFxQixFQUFDLElBQUksQ0FBQ2pCLGNBQWMsRUFBRWEsVUFBVSxDQUFDO0lBQ3ZFLElBQUlkLFFBQVEsRUFBRTtNQUNaLE9BQU9BLFFBQVEsQ0FBQ2lCLGNBQWMsRUFBRTtJQUNsQyxDQUFDLE1BQU07TUFDTCxPQUFPLENBQUM7SUFDVjtFQUNGO0FBQ0Y7QUFBQztBQUFBIn0=