"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _atomSelectList = _interopRequireDefault(require("atom-select-list"));
var _underscorePlus = require("underscore-plus");
var _fuzzaldrin = _interopRequireDefault(require("fuzzaldrin"));
var _fuzzaldrinPlus = _interopRequireDefault(require("fuzzaldrin-plus"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */

class CommandPaletteView {
  constructor(initiallyVisibleItemCount = 10) {
    this.filter = (items, query) => {
      if (query.length === 0) {
        return items;
      }
      const scoredItems = [];
      for (const item of items) {
        let score = this.fuzz.score(item.displayName, query);
        if (item.tags) {
          score += item.tags.reduce((currentScore, tag) => currentScore + this.fuzz.score(tag, query), 0);
        }
        if (item.description) {
          score += this.fuzz.score(item.description, query);
        }
        if (score > 0) {
          scoredItems.push({
            item,
            score
          });
        }
      }
      scoredItems.sort((a, b) => b.score - a.score);
      return scoredItems.map(i => i.item);
    };
    this.keyBindingsForActiveElement = [];
    this.selectListView = new _atomSelectList.default({
      initiallyVisibleItemCount: initiallyVisibleItemCount,
      // just for being able to disable visible-on-render in spec
      items: [],
      filter: this.filter,
      emptyMessage: 'No matches found',
      elementForItem: (item, {
        index,
        selected,
        visible
      }) => {
        if (!visible) {
          return document.createElement("li");
        }
        const li = document.createElement('li');
        li.classList.add('event', 'two-lines');
        li.dataset.eventName = item.name;
        const rightBlock = document.createElement('div');
        rightBlock.classList.add('pull-right');
        this.keyBindingsForActiveElement.filter(({
          command
        }) => command === item.name).forEach(keyBinding => {
          const kbd = document.createElement('kbd');
          kbd.classList.add('key-binding');
          kbd.textContent = (0, _underscorePlus.humanizeKeystroke)(keyBinding.keystrokes);
          rightBlock.appendChild(kbd);
        });
        li.appendChild(rightBlock);
        const leftBlock = document.createElement('div');
        const titleEl = document.createElement('div');
        titleEl.classList.add('primary-line');
        titleEl.title = item.name;
        leftBlock.appendChild(titleEl);
        const query = this.selectListView.getQuery();
        this.highlightMatchesInElement(item.displayName, query, titleEl);
        if (selected) {
          let secondaryEl = document.createElement('div');
          secondaryEl.classList.add('secondary-line');
          secondaryEl.style.display = 'flex';
          if (typeof item.description === 'string') {
            secondaryEl.appendChild(this.createDescription(item.description, query));
          }
          if (Array.isArray(item.tags)) {
            const matchingTags = item.tags.map(t => [t, this.fuzz.score(t, query)]).filter(([t, s]) => s > 0).sort((a, b) => a.s - b.s).map(([t, s]) => t);
            if (matchingTags.length > 0) {
              secondaryEl.appendChild(this.createTags(matchingTags, query));
            }
          }
          leftBlock.appendChild(secondaryEl);
        }
        li.appendChild(leftBlock);
        return li;
      },
      didConfirmSelection: keyBinding => {
        this.hide();
        const event = new CustomEvent(keyBinding.name, {
          bubbles: true,
          cancelable: true
        });
        this.activeElement.dispatchEvent(event);
      },
      didCancelSelection: () => {
        this.hide();
      }
    });
    this.selectListView.element.classList.add('command-palette');
  }
  async destroy() {
    await this.selectListView.destroy();
  }
  toggle() {
    if (this.panel && this.panel.isVisible()) {
      this.hide();
      return Promise.resolve();
    } else {
      return this.show();
    }
  }
  async show(showHiddenCommands = false) {
    if (!this.panel) {
      this.panel = atom.workspace.addModalPanel({
        item: this.selectListView
      });
    }
    if (!this.preserveLastSearch) {
      this.selectListView.reset();
    } else {
      this.selectListView.refs.queryEditor.selectAll();
    }
    this.activeElement = document.activeElement === document.body ? atom.views.getView(atom.workspace) : document.activeElement;
    this.keyBindingsForActiveElement = atom.keymaps.findKeyBindings({
      target: this.activeElement
    });
    const commandsForActiveElement = atom.commands.findCommands({
      target: this.activeElement
    }).filter(command => showHiddenCommands === !!command.hiddenInCommandPalette);
    commandsForActiveElement.sort((a, b) => a.displayName.localeCompare(b.displayName));
    await this.selectListView.update({
      items: commandsForActiveElement
    });
    this.previouslyFocusedElement = document.activeElement;
    this.panel.show();
    this.selectListView.focus();
  }
  hide() {
    this.panel.hide();
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
  }
  async update(props) {
    if (props.hasOwnProperty('preserveLastSearch')) {
      this.preserveLastSearch = props.preserveLastSearch;
    }
    if (props.hasOwnProperty('useAlternateScoring')) {
      this.useAlternateScoring = props.useAlternateScoring;
    }
  }
  get fuzz() {
    return this.useAlternateScoring ? _fuzzaldrinPlus.default : _fuzzaldrin.default;
  }
  highlightMatchesInElement(text, query, el) {
    const matches = this.fuzz.match(text, query);
    let matchedChars = [];
    let lastIndex = 0;
    for (const matchIndex of matches) {
      const unmatched = text.substring(lastIndex, matchIndex);
      if (unmatched) {
        if (matchedChars.length > 0) {
          const matchSpan = document.createElement('span');
          matchSpan.classList.add('character-match');
          matchSpan.textContent = matchedChars.join('');
          el.appendChild(matchSpan);
          matchedChars = [];
        }
        el.appendChild(document.createTextNode(unmatched));
      }
      matchedChars.push(text[matchIndex]);
      lastIndex = matchIndex + 1;
    }
    if (matchedChars.length > 0) {
      const matchSpan = document.createElement('span');
      matchSpan.classList.add('character-match');
      matchSpan.textContent = matchedChars.join('');
      el.appendChild(matchSpan);
    }
    const unmatched = text.substring(lastIndex);
    if (unmatched) {
      el.appendChild(document.createTextNode(unmatched));
    }
  }
  createDescription(description, query) {
    const descriptionEl = document.createElement('div');

    // in case of overflow, give full contents on long hover
    descriptionEl.title = description;
    Object.assign(descriptionEl.style, {
      flexGrow: 1,
      flexShrink: 1,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    });
    this.highlightMatchesInElement(description, query, descriptionEl);
    return descriptionEl;
  }
  createTag(tagText, query) {
    const tagEl = document.createElement('li');
    Object.assign(tagEl.style, {
      borderBottom: 0,
      display: 'inline',
      padding: 0
    });
    this.highlightMatchesInElement(tagText, query, tagEl);
    return tagEl;
  }
  createTags(matchingTags, query) {
    const tagsEl = document.createElement('ol');
    Object.assign(tagsEl.style, {
      display: 'inline',
      marginLeft: '4px',
      flexShrink: 0,
      padding: 0
    });
    const introEl = document.createElement('strong');
    introEl.textContent = 'matching tags: ';
    tagsEl.appendChild(introEl);
    matchingTags.map(t => this.createTag(t, query)).forEach((tagEl, i) => {
      tagsEl.appendChild(tagEl);
      if (i < matchingTags.length - 1) {
        const commaSpace = document.createElement('span');
        commaSpace.textContent = ', ';
        tagsEl.appendChild(commaSpace);
      }
    });
    return tagsEl;
  }
}
exports.default = CommandPaletteView;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb21tYW5kUGFsZXR0ZVZpZXciLCJjb25zdHJ1Y3RvciIsImluaXRpYWxseVZpc2libGVJdGVtQ291bnQiLCJmaWx0ZXIiLCJpdGVtcyIsInF1ZXJ5IiwibGVuZ3RoIiwic2NvcmVkSXRlbXMiLCJpdGVtIiwic2NvcmUiLCJmdXp6IiwiZGlzcGxheU5hbWUiLCJ0YWdzIiwicmVkdWNlIiwiY3VycmVudFNjb3JlIiwidGFnIiwiZGVzY3JpcHRpb24iLCJwdXNoIiwic29ydCIsImEiLCJiIiwibWFwIiwiaSIsImtleUJpbmRpbmdzRm9yQWN0aXZlRWxlbWVudCIsInNlbGVjdExpc3RWaWV3IiwiU2VsZWN0TGlzdFZpZXciLCJlbXB0eU1lc3NhZ2UiLCJlbGVtZW50Rm9ySXRlbSIsImluZGV4Iiwic2VsZWN0ZWQiLCJ2aXNpYmxlIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwibGkiLCJjbGFzc0xpc3QiLCJhZGQiLCJkYXRhc2V0IiwiZXZlbnROYW1lIiwibmFtZSIsInJpZ2h0QmxvY2siLCJjb21tYW5kIiwiZm9yRWFjaCIsImtleUJpbmRpbmciLCJrYmQiLCJ0ZXh0Q29udGVudCIsImh1bWFuaXplS2V5c3Ryb2tlIiwia2V5c3Ryb2tlcyIsImFwcGVuZENoaWxkIiwibGVmdEJsb2NrIiwidGl0bGVFbCIsInRpdGxlIiwiZ2V0UXVlcnkiLCJoaWdobGlnaHRNYXRjaGVzSW5FbGVtZW50Iiwic2Vjb25kYXJ5RWwiLCJzdHlsZSIsImRpc3BsYXkiLCJjcmVhdGVEZXNjcmlwdGlvbiIsIkFycmF5IiwiaXNBcnJheSIsIm1hdGNoaW5nVGFncyIsInQiLCJzIiwiY3JlYXRlVGFncyIsImRpZENvbmZpcm1TZWxlY3Rpb24iLCJoaWRlIiwiZXZlbnQiLCJDdXN0b21FdmVudCIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiYWN0aXZlRWxlbWVudCIsImRpc3BhdGNoRXZlbnQiLCJkaWRDYW5jZWxTZWxlY3Rpb24iLCJlbGVtZW50IiwiZGVzdHJveSIsInRvZ2dsZSIsInBhbmVsIiwiaXNWaXNpYmxlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzaG93Iiwic2hvd0hpZGRlbkNvbW1hbmRzIiwiYXRvbSIsIndvcmtzcGFjZSIsImFkZE1vZGFsUGFuZWwiLCJwcmVzZXJ2ZUxhc3RTZWFyY2giLCJyZXNldCIsInJlZnMiLCJxdWVyeUVkaXRvciIsInNlbGVjdEFsbCIsImJvZHkiLCJ2aWV3cyIsImdldFZpZXciLCJrZXltYXBzIiwiZmluZEtleUJpbmRpbmdzIiwidGFyZ2V0IiwiY29tbWFuZHNGb3JBY3RpdmVFbGVtZW50IiwiY29tbWFuZHMiLCJmaW5kQ29tbWFuZHMiLCJoaWRkZW5JbkNvbW1hbmRQYWxldHRlIiwibG9jYWxlQ29tcGFyZSIsInVwZGF0ZSIsInByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCIsImZvY3VzIiwicHJvcHMiLCJoYXNPd25Qcm9wZXJ0eSIsInVzZUFsdGVybmF0ZVNjb3JpbmciLCJmdXp6YWxkcmluUGx1cyIsImZ1enphbGRyaW4iLCJ0ZXh0IiwiZWwiLCJtYXRjaGVzIiwibWF0Y2giLCJtYXRjaGVkQ2hhcnMiLCJsYXN0SW5kZXgiLCJtYXRjaEluZGV4IiwidW5tYXRjaGVkIiwic3Vic3RyaW5nIiwibWF0Y2hTcGFuIiwiam9pbiIsImNyZWF0ZVRleHROb2RlIiwiZGVzY3JpcHRpb25FbCIsIk9iamVjdCIsImFzc2lnbiIsImZsZXhHcm93IiwiZmxleFNocmluayIsInRleHRPdmVyZmxvdyIsIndoaXRlU3BhY2UiLCJvdmVyZmxvdyIsImNyZWF0ZVRhZyIsInRhZ1RleHQiLCJ0YWdFbCIsImJvcmRlckJvdHRvbSIsInBhZGRpbmciLCJ0YWdzRWwiLCJtYXJnaW5MZWZ0IiwiaW50cm9FbCIsImNvbW1hU3BhY2UiXSwic291cmNlcyI6WyJjb21tYW5kLXBhbGV0dGUtdmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG5cbmltcG9ydCBTZWxlY3RMaXN0VmlldyBmcm9tICdhdG9tLXNlbGVjdC1saXN0J1xuaW1wb3J0IHtodW1hbml6ZUtleXN0cm9rZX0gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xuaW1wb3J0IGZ1enphbGRyaW4gZnJvbSAnZnV6emFsZHJpbidcbmltcG9ydCBmdXp6YWxkcmluUGx1cyBmcm9tICdmdXp6YWxkcmluLXBsdXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRQYWxldHRlVmlldyB7XG4gIGNvbnN0cnVjdG9yIChpbml0aWFsbHlWaXNpYmxlSXRlbUNvdW50ID0gMTApIHtcbiAgICB0aGlzLmtleUJpbmRpbmdzRm9yQWN0aXZlRWxlbWVudCA9IFtdXG4gICAgdGhpcy5zZWxlY3RMaXN0VmlldyA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICBpbml0aWFsbHlWaXNpYmxlSXRlbUNvdW50OiBpbml0aWFsbHlWaXNpYmxlSXRlbUNvdW50LCAvLyBqdXN0IGZvciBiZWluZyBhYmxlIHRvIGRpc2FibGUgdmlzaWJsZS1vbi1yZW5kZXIgaW4gc3BlY1xuICAgICAgaXRlbXM6IFtdLFxuICAgICAgZmlsdGVyOiB0aGlzLmZpbHRlcixcbiAgICAgIGVtcHR5TWVzc2FnZTogJ05vIG1hdGNoZXMgZm91bmQnLFxuICAgICAgZWxlbWVudEZvckl0ZW06IChpdGVtLCB7aW5kZXgsIHNlbGVjdGVkLCB2aXNpYmxlfSkgPT4ge1xuICAgICAgICBpZiAoIXZpc2libGUpIHtcbiAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICAgICAgbGkuY2xhc3NMaXN0LmFkZCgnZXZlbnQnLCAndHdvLWxpbmVzJylcbiAgICAgICAgbGkuZGF0YXNldC5ldmVudE5hbWUgPSBpdGVtLm5hbWVcblxuICAgICAgICBjb25zdCByaWdodEJsb2NrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgcmlnaHRCbG9jay5jbGFzc0xpc3QuYWRkKCdwdWxsLXJpZ2h0JylcblxuICAgICAgICB0aGlzLmtleUJpbmRpbmdzRm9yQWN0aXZlRWxlbWVudFxuICAgICAgICAuZmlsdGVyKCh7Y29tbWFuZH0pID0+IGNvbW1hbmQgPT09IGl0ZW0ubmFtZSlcbiAgICAgICAgLmZvckVhY2goa2V5QmluZGluZyA9PiB7XG4gICAgICAgICAgY29uc3Qga2JkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgna2JkJylcbiAgICAgICAgICBrYmQuY2xhc3NMaXN0LmFkZCgna2V5LWJpbmRpbmcnKVxuICAgICAgICAgIGtiZC50ZXh0Q29udGVudCA9IGh1bWFuaXplS2V5c3Ryb2tlKGtleUJpbmRpbmcua2V5c3Ryb2tlcylcbiAgICAgICAgICByaWdodEJsb2NrLmFwcGVuZENoaWxkKGtiZClcbiAgICAgICAgfSlcbiAgICAgICAgbGkuYXBwZW5kQ2hpbGQocmlnaHRCbG9jaylcblxuICAgICAgICBjb25zdCBsZWZ0QmxvY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBjb25zdCB0aXRsZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgdGl0bGVFbC5jbGFzc0xpc3QuYWRkKCdwcmltYXJ5LWxpbmUnKVxuICAgICAgICB0aXRsZUVsLnRpdGxlID0gaXRlbS5uYW1lXG4gICAgICAgIGxlZnRCbG9jay5hcHBlbmRDaGlsZCh0aXRsZUVsKVxuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5zZWxlY3RMaXN0Vmlldy5nZXRRdWVyeSgpXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TWF0Y2hlc0luRWxlbWVudChpdGVtLmRpc3BsYXlOYW1lLCBxdWVyeSwgdGl0bGVFbClcblxuICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgICBsZXQgc2Vjb25kYXJ5RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgIHNlY29uZGFyeUVsLmNsYXNzTGlzdC5hZGQoJ3NlY29uZGFyeS1saW5lJylcbiAgICAgICAgICBzZWNvbmRhcnlFbC5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnXG5cbiAgICAgICAgICBpZiAodHlwZW9mIGl0ZW0uZGVzY3JpcHRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBzZWNvbmRhcnlFbC5hcHBlbmRDaGlsZCh0aGlzLmNyZWF0ZURlc2NyaXB0aW9uKGl0ZW0uZGVzY3JpcHRpb24sIHF1ZXJ5KSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVtLnRhZ3MpKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGluZ1RhZ3MgPSBpdGVtLnRhZ3NcbiAgICAgICAgICAgICAgLm1hcCh0ID0+IFt0LCB0aGlzLmZ1enouc2NvcmUodCwgcXVlcnkpXSlcbiAgICAgICAgICAgICAgLmZpbHRlcigoW3QsIHNdKSA9PiBzID4gMClcbiAgICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEucyAtIGIucylcbiAgICAgICAgICAgICAgLm1hcCgoW3QsIHNdKSA9PiB0KVxuXG4gICAgICAgICAgICBpZiAobWF0Y2hpbmdUYWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgc2Vjb25kYXJ5RWwuYXBwZW5kQ2hpbGQodGhpcy5jcmVhdGVUYWdzKG1hdGNoaW5nVGFncywgcXVlcnkpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxlZnRCbG9jay5hcHBlbmRDaGlsZChzZWNvbmRhcnlFbClcbiAgICAgICAgfVxuXG4gICAgICAgIGxpLmFwcGVuZENoaWxkKGxlZnRCbG9jaylcbiAgICAgICAgcmV0dXJuIGxpXG4gICAgICB9LFxuICAgICAgZGlkQ29uZmlybVNlbGVjdGlvbjogKGtleUJpbmRpbmcpID0+IHtcbiAgICAgICAgdGhpcy5oaWRlKClcbiAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoa2V5QmluZGluZy5uYW1lLCB7YnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZX0pXG4gICAgICAgIHRoaXMuYWN0aXZlRWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KVxuICAgICAgfSxcbiAgICAgIGRpZENhbmNlbFNlbGVjdGlvbjogKCkgPT4ge1xuICAgICAgICB0aGlzLmhpZGUoKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5zZWxlY3RMaXN0Vmlldy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbW1hbmQtcGFsZXR0ZScpXG4gIH1cblxuICBhc3luYyBkZXN0cm95ICgpIHtcbiAgICBhd2FpdCB0aGlzLnNlbGVjdExpc3RWaWV3LmRlc3Ryb3koKVxuICB9XG5cbiAgdG9nZ2xlICgpIHtcbiAgICBpZiAodGhpcy5wYW5lbCAmJiB0aGlzLnBhbmVsLmlzVmlzaWJsZSgpKSB7XG4gICAgICB0aGlzLmhpZGUoKVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnNob3coKVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHNob3cgKHNob3dIaWRkZW5Db21tYW5kcyA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLnBhbmVsKSB7XG4gICAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7aXRlbTogdGhpcy5zZWxlY3RMaXN0Vmlld30pXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnByZXNlcnZlTGFzdFNlYXJjaCkge1xuICAgICAgdGhpcy5zZWxlY3RMaXN0Vmlldy5yZXNldCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcucmVmcy5xdWVyeUVkaXRvci5zZWxlY3RBbGwoKVxuICAgIH1cblxuICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IChkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBkb2N1bWVudC5ib2R5KSA/IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSkgOiBkb2N1bWVudC5hY3RpdmVFbGVtZW50XG4gICAgdGhpcy5rZXlCaW5kaW5nc0ZvckFjdGl2ZUVsZW1lbnQgPSBhdG9tLmtleW1hcHMuZmluZEtleUJpbmRpbmdzKHt0YXJnZXQ6IHRoaXMuYWN0aXZlRWxlbWVudH0pXG4gICAgY29uc3QgY29tbWFuZHNGb3JBY3RpdmVFbGVtZW50ID0gYXRvbS5jb21tYW5kc1xuICAgICAgICAuZmluZENvbW1hbmRzKHt0YXJnZXQ6IHRoaXMuYWN0aXZlRWxlbWVudH0pXG4gICAgICAgIC5maWx0ZXIoY29tbWFuZCA9PiBzaG93SGlkZGVuQ29tbWFuZHMgPT09ICEhY29tbWFuZC5oaWRkZW5JbkNvbW1hbmRQYWxldHRlKVxuICAgIGNvbW1hbmRzRm9yQWN0aXZlRWxlbWVudC5zb3J0KChhLCBiKSA9PiBhLmRpc3BsYXlOYW1lLmxvY2FsZUNvbXBhcmUoYi5kaXNwbGF5TmFtZSkpXG4gICAgYXdhaXQgdGhpcy5zZWxlY3RMaXN0Vmlldy51cGRhdGUoe2l0ZW1zOiBjb21tYW5kc0ZvckFjdGl2ZUVsZW1lbnR9KVxuXG4gICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50XG4gICAgdGhpcy5wYW5lbC5zaG93KClcbiAgICB0aGlzLnNlbGVjdExpc3RWaWV3LmZvY3VzKClcbiAgfVxuXG4gIGhpZGUgKCkge1xuICAgIHRoaXMucGFuZWwuaGlkZSgpXG4gICAgaWYgKHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50KSB7XG4gICAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudC5mb2N1cygpXG4gICAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IG51bGxcbiAgICB9XG4gIH1cblxuICBhc3luYyB1cGRhdGUgKHByb3BzKSB7XG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KCdwcmVzZXJ2ZUxhc3RTZWFyY2gnKSkge1xuICAgICAgdGhpcy5wcmVzZXJ2ZUxhc3RTZWFyY2ggPSBwcm9wcy5wcmVzZXJ2ZUxhc3RTZWFyY2hcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkoJ3VzZUFsdGVybmF0ZVNjb3JpbmcnKSkge1xuICAgICAgdGhpcy51c2VBbHRlcm5hdGVTY29yaW5nID0gcHJvcHMudXNlQWx0ZXJuYXRlU2NvcmluZ1xuICAgIH1cbiAgfVxuXG4gIGdldCBmdXp6ICgpIHtcbiAgICByZXR1cm4gdGhpcy51c2VBbHRlcm5hdGVTY29yaW5nID8gZnV6emFsZHJpblBsdXMgOiBmdXp6YWxkcmluXG4gIH1cblxuICBoaWdobGlnaHRNYXRjaGVzSW5FbGVtZW50ICh0ZXh0LCBxdWVyeSwgZWwpIHtcbiAgICBjb25zdCBtYXRjaGVzID0gdGhpcy5mdXp6Lm1hdGNoKHRleHQsIHF1ZXJ5KVxuICAgIGxldCBtYXRjaGVkQ2hhcnMgPSBbXVxuICAgIGxldCBsYXN0SW5kZXggPSAwXG4gICAgZm9yIChjb25zdCBtYXRjaEluZGV4IG9mIG1hdGNoZXMpIHtcbiAgICAgIGNvbnN0IHVubWF0Y2hlZCA9IHRleHQuc3Vic3RyaW5nKGxhc3RJbmRleCwgbWF0Y2hJbmRleClcbiAgICAgIGlmICh1bm1hdGNoZWQpIHtcbiAgICAgICAgaWYgKG1hdGNoZWRDaGFycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3QgbWF0Y2hTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgICAgbWF0Y2hTcGFuLmNsYXNzTGlzdC5hZGQoJ2NoYXJhY3Rlci1tYXRjaCcpXG4gICAgICAgICAgbWF0Y2hTcGFuLnRleHRDb250ZW50ID0gbWF0Y2hlZENoYXJzLmpvaW4oJycpXG4gICAgICAgICAgZWwuYXBwZW5kQ2hpbGQobWF0Y2hTcGFuKVxuICAgICAgICAgIG1hdGNoZWRDaGFycyA9IFtdXG4gICAgICAgIH1cblxuICAgICAgICBlbC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh1bm1hdGNoZWQpKVxuICAgICAgfVxuXG4gICAgICBtYXRjaGVkQ2hhcnMucHVzaCh0ZXh0W21hdGNoSW5kZXhdKVxuICAgICAgbGFzdEluZGV4ID0gbWF0Y2hJbmRleCArIDFcbiAgICB9XG5cbiAgICBpZiAobWF0Y2hlZENoYXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG1hdGNoU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgbWF0Y2hTcGFuLmNsYXNzTGlzdC5hZGQoJ2NoYXJhY3Rlci1tYXRjaCcpXG4gICAgICBtYXRjaFNwYW4udGV4dENvbnRlbnQgPSBtYXRjaGVkQ2hhcnMuam9pbignJylcbiAgICAgIGVsLmFwcGVuZENoaWxkKG1hdGNoU3BhbilcbiAgICB9XG5cbiAgICBjb25zdCB1bm1hdGNoZWQgPSB0ZXh0LnN1YnN0cmluZyhsYXN0SW5kZXgpXG4gICAgaWYgKHVubWF0Y2hlZCkge1xuICAgICAgZWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodW5tYXRjaGVkKSlcbiAgICB9XG4gIH1cblxuICBmaWx0ZXIgPSAoaXRlbXMsIHF1ZXJ5KSA9PiB7XG4gICAgaWYgKHF1ZXJ5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGl0ZW1zXG4gICAgfVxuXG4gICAgY29uc3Qgc2NvcmVkSXRlbXMgPSBbXVxuICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xuICAgICAgbGV0IHNjb3JlID0gdGhpcy5mdXp6LnNjb3JlKGl0ZW0uZGlzcGxheU5hbWUsIHF1ZXJ5KVxuICAgICAgaWYgKGl0ZW0udGFncykge1xuICAgICAgICBzY29yZSArPSBpdGVtLnRhZ3MucmVkdWNlKFxuICAgICAgICAgIChjdXJyZW50U2NvcmUsIHRhZykgPT4gY3VycmVudFNjb3JlICsgdGhpcy5mdXp6LnNjb3JlKHRhZywgcXVlcnkpLFxuICAgICAgICAgIDBcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgaWYgKGl0ZW0uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgc2NvcmUgKz0gdGhpcy5mdXp6LnNjb3JlKGl0ZW0uZGVzY3JpcHRpb24sIHF1ZXJ5KVxuICAgICAgfVxuXG4gICAgICBpZiAoc2NvcmUgPiAwKSB7XG4gICAgICAgIHNjb3JlZEl0ZW1zLnB1c2goe2l0ZW0sIHNjb3JlfSlcbiAgICAgIH1cbiAgICB9XG4gICAgc2NvcmVkSXRlbXMuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpXG4gICAgcmV0dXJuIHNjb3JlZEl0ZW1zLm1hcCgoaSkgPT4gaS5pdGVtKVxuICB9XG5cbiAgY3JlYXRlRGVzY3JpcHRpb24gKGRlc2NyaXB0aW9uLCBxdWVyeSkge1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgLy8gaW4gY2FzZSBvZiBvdmVyZmxvdywgZ2l2ZSBmdWxsIGNvbnRlbnRzIG9uIGxvbmcgaG92ZXJcbiAgICBkZXNjcmlwdGlvbkVsLnRpdGxlID0gZGVzY3JpcHRpb25cblxuICAgIE9iamVjdC5hc3NpZ24oZGVzY3JpcHRpb25FbC5zdHlsZSwge1xuICAgICAgZmxleEdyb3c6IDEsXG4gICAgICBmbGV4U2hyaW5rOiAxLFxuICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCcsXG4gICAgICBvdmVyZmxvdzogJ2hpZGRlbidcbiAgICB9KVxuICAgIHRoaXMuaGlnaGxpZ2h0TWF0Y2hlc0luRWxlbWVudChkZXNjcmlwdGlvbiwgcXVlcnksIGRlc2NyaXB0aW9uRWwpXG4gICAgcmV0dXJuIGRlc2NyaXB0aW9uRWxcbiAgfVxuXG4gIGNyZWF0ZVRhZyAodGFnVGV4dCwgcXVlcnkpIHtcbiAgICBjb25zdCB0YWdFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICBPYmplY3QuYXNzaWduKHRhZ0VsLnN0eWxlLCB7XG4gICAgICBib3JkZXJCb3R0b206IDAsXG4gICAgICBkaXNwbGF5OiAnaW5saW5lJyxcbiAgICAgIHBhZGRpbmc6IDBcbiAgICB9KVxuICAgIHRoaXMuaGlnaGxpZ2h0TWF0Y2hlc0luRWxlbWVudCh0YWdUZXh0LCBxdWVyeSwgdGFnRWwpXG4gICAgcmV0dXJuIHRhZ0VsXG4gIH1cblxuICBjcmVhdGVUYWdzIChtYXRjaGluZ1RhZ3MsIHF1ZXJ5KSB7XG4gICAgY29uc3QgdGFnc0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2wnKVxuICAgIE9iamVjdC5hc3NpZ24odGFnc0VsLnN0eWxlLCB7XG4gICAgICBkaXNwbGF5OiAnaW5saW5lJyxcbiAgICAgIG1hcmdpbkxlZnQ6ICc0cHgnLFxuICAgICAgZmxleFNocmluazogMCxcbiAgICAgIHBhZGRpbmc6IDBcbiAgICB9KVxuXG4gICAgY29uc3QgaW50cm9FbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0cm9uZycpXG4gICAgaW50cm9FbC50ZXh0Q29udGVudCA9ICdtYXRjaGluZyB0YWdzOiAnXG5cbiAgICB0YWdzRWwuYXBwZW5kQ2hpbGQoaW50cm9FbClcbiAgICBtYXRjaGluZ1RhZ3MubWFwKHQgPT4gdGhpcy5jcmVhdGVUYWcodCwgcXVlcnkpKS5mb3JFYWNoKCh0YWdFbCwgaSkgPT4ge1xuICAgICAgdGFnc0VsLmFwcGVuZENoaWxkKHRhZ0VsKVxuICAgICAgaWYgKGkgPCBtYXRjaGluZ1RhZ3MubGVuZ3RoIC0gMSkge1xuICAgICAgICBjb25zdCBjb21tYVNwYWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgIGNvbW1hU3BhY2UudGV4dENvbnRlbnQgPSAnLCAnXG4gICAgICAgIHRhZ3NFbC5hcHBlbmRDaGlsZChjb21tYVNwYWNlKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHRhZ3NFbFxuICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQTRDO0FBTDVDOztBQU9lLE1BQU1BLGtCQUFrQixDQUFDO0VBQ3RDQyxXQUFXLENBQUVDLHlCQUF5QixHQUFHLEVBQUUsRUFBRTtJQUFBLEtBMks3Q0MsTUFBTSxHQUFHLENBQUNDLEtBQUssRUFB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