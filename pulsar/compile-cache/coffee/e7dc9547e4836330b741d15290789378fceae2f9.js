(function() {
  var CharacterPattern, _;

  _ = require('underscore-plus');

  CharacterPattern = /[^\s]/;

  module.exports = {
    activate: function() {
      return this.commandDisposable = atom.commands.add('atom-text-editor', {
        'autoflow:reflow-selection': (function(_this) {
          return function(event) {
            return _this.reflowSelection(event.currentTarget.getModel());
          };
        })(this)
      });
    },
    deactivate: function() {
      var ref;
      if ((ref = this.commandDisposable) != null) {
        ref.dispose();
      }
      return this.commandDisposable = null;
    },
    reflowSelection: function(editor) {
      var range, reflowOptions, reflowedText;
      range = editor.getSelectedBufferRange();
      if (range.isEmpty()) {
        range = editor.getCurrentParagraphBufferRange();
      }
      if (range == null) {
        return;
      }
      reflowOptions = {
        wrapColumn: this.getPreferredLineLength(editor),
        tabLength: this.getTabLength(editor)
      };
      reflowedText = this.reflow(editor.getTextInRange(range), reflowOptions);
      return editor.getBuffer().setTextInRange(range, reflowedText);
    },
    reflow: function(text, arg) {
      var beginningLinesToIgnore, block, blockLines, currentLine, currentLineLength, endingLinesToIgnore, escapedLinePrefix, firstLine, i, j, latexTagEndRegex, latexTagRegex, latexTagStartRegex, leadingVerticalSpace, len, len1, linePrefix, linePrefixTabExpanded, lines, paragraphBlocks, paragraphs, ref, segment, tabLength, tabLengthInSpaces, trailingVerticalSpace, wrapColumn, wrappedLinePrefix, wrappedLines;
      wrapColumn = arg.wrapColumn, tabLength = arg.tabLength;
      paragraphs = [];
      text = text.replace(/\r\n?/g, '\n');
      leadingVerticalSpace = text.match(/^\s*\n/);
      if (leadingVerticalSpace) {
        text = text.substr(leadingVerticalSpace.length);
      } else {
        leadingVerticalSpace = '';
      }
      trailingVerticalSpace = text.match(/\n\s*$/);
      if (trailingVerticalSpace) {
        text = text.substr(0, text.length - trailingVerticalSpace.length);
      } else {
        trailingVerticalSpace = '';
      }
      paragraphBlocks = text.split(/\n\s*\n/g);
      if (tabLength) {
        tabLengthInSpaces = Array(tabLength + 1).join(' ');
      } else {
        tabLengthInSpaces = '';
      }
      for (i = 0, len = paragraphBlocks.length; i < len; i++) {
        block = paragraphBlocks[i];
        blockLines = block.split('\n');
        beginningLinesToIgnore = [];
        endingLinesToIgnore = [];
        latexTagRegex = /^\s*\\\w+(\[.*\])?\{\w+\}(\[.*\])?\s*$/g;
        latexTagStartRegex = /^\s*\\\w+\s*\{\s*$/g;
        latexTagEndRegex = /^\s*\}\s*$/g;
        while (blockLines.length > 0 && (blockLines[0].match(latexTagRegex) || blockLines[0].match(latexTagStartRegex))) {
          beginningLinesToIgnore.push(blockLines[0]);
          blockLines.shift();
        }
        while (blockLines.length > 0 && (blockLines[blockLines.length - 1].match(latexTagRegex) || blockLines[blockLines.length - 1].match(latexTagEndRegex))) {
          endingLinesToIgnore.unshift(blockLines[blockLines.length - 1]);
          blockLines.pop();
        }
        if (!(blockLines.length > 0)) {
          paragraphs.push(block);
          continue;
        }
        linePrefix = blockLines[0].match(/^\s*(\/\/|\/\*|;;|#'|\|\|\||--|[#%*>-])?\s*/g)[0];
        linePrefixTabExpanded = linePrefix;
        if (tabLengthInSpaces) {
          linePrefixTabExpanded = linePrefix.replace(/\t/g, tabLengthInSpaces);
        }
        if (linePrefix) {
          escapedLinePrefix = _.escapeRegExp(linePrefix);
          blockLines = blockLines.map(function(blockLine) {
            return blockLine.replace(RegExp("^" + escapedLinePrefix), '');
          });
        }
        blockLines = blockLines.map(function(blockLine) {
          return blockLine.replace(/^\s+/, '');
        });
        lines = [];
        currentLine = [];
        currentLineLength = linePrefixTabExpanded.length;
        wrappedLinePrefix = linePrefix.replace(/^(\s*)\/\*/, '$1  ').replace(/^(\s*)-(?!-)/, '$1 ');
        firstLine = true;
        ref = this.segmentText(blockLines.join(' '));
        for (j = 0, len1 = ref.length; j < len1; j++) {
          segment = ref[j];
          if (this.wrapSegment(segment, currentLineLength, wrapColumn)) {
            if (firstLine !== true) {
              if (linePrefix.search(/^\s*\/\*/) !== -1 || linePrefix.search(/^\s*-(?!-)/) !== -1) {
                linePrefix = wrappedLinePrefix;
              }
            }
            lines.push(linePrefix + currentLine.join(''));
            currentLine = [];
            currentLineLength = linePrefixTabExpanded.length;
            firstLine = false;
          }
          currentLine.push(segment);
          currentLineLength += segment.length;
        }
        lines.push(linePrefix + currentLine.join(''));
        wrappedLines = beginningLinesToIgnore.concat(lines.concat(endingLinesToIgnore));
        paragraphs.push(wrappedLines.join('\n').replace(/\s+\n/g, '\n'));
      }
      return leadingVerticalSpace + paragraphs.join('\n\n') + trailingVerticalSpace;
    },
    getTabLength: function(editor) {
      var ref;
      return (ref = atom.config.get('editor.tabLength', {
        scope: editor.getRootScopeDescriptor()
      })) != null ? ref : 2;
    },
    getPreferredLineLength: function(editor) {
      return atom.config.get('editor.preferredLineLength', {
        scope: editor.getRootScopeDescriptor()
      });
    },
    wrapSegment: function(segment, currentLineLength, wrapColumn) {
      return CharacterPattern.test(segment) && (currentLineLength + segment.length > wrapColumn) && (currentLineLength > 0 || segment.length < wrapColumn);
    },
    segmentText: function(text) {
      var match, re, segments;
      segments = [];
      re = /[\s]+|[^\s]+/g;
      while (match = re.exec(text)) {
        segments.push(match[0]);
      }
      return segments;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYXV0b2Zsb3cvbGliL2F1dG9mbG93LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixnQkFBQSxHQUFtQjs7RUFNbkIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLGlCQUFELEdBQXFCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFDbkI7UUFBQSwyQkFBQSxFQUE2QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEtBQUQ7bUJBQzNCLEtBQUMsQ0FBQSxlQUFELENBQWlCLEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBcEIsQ0FBQSxDQUFqQjtVQUQyQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0I7T0FEbUI7SUFEYixDQUFWO0lBS0EsVUFBQSxFQUFZLFNBQUE7QUFDVixVQUFBOztXQUFrQixDQUFFLE9BQXBCLENBQUE7O2FBQ0EsSUFBQyxDQUFBLGlCQUFELEdBQXFCO0lBRlgsQ0FMWjtJQVNBLGVBQUEsRUFBaUIsU0FBQyxNQUFEO0FBQ2YsVUFBQTtNQUFBLEtBQUEsR0FBUSxNQUFNLENBQUMsc0JBQVAsQ0FBQTtNQUNSLElBQW1ELEtBQUssQ0FBQyxPQUFOLENBQUEsQ0FBbkQ7UUFBQSxLQUFBLEdBQVEsTUFBTSxDQUFDLDhCQUFQLENBQUEsRUFBUjs7TUFDQSxJQUFjLGFBQWQ7QUFBQSxlQUFBOztNQUVBLGFBQUEsR0FDSTtRQUFBLFVBQUEsRUFBWSxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsTUFBeEIsQ0FBWjtRQUNBLFNBQUEsRUFBVyxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsQ0FEWDs7TUFF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ZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbkNoYXJhY3RlclBhdHRlcm4gPSAvLy9cbiAgW1xuICAgIF5cXHNcbiAgXVxuLy8vXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgYWN0aXZhdGU6IC0+XG4gICAgQGNvbW1hbmREaXNwb3NhYmxlID0gYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ2F1dG9mbG93OnJlZmxvdy1zZWxlY3Rpb24nOiAoZXZlbnQpID0+XG4gICAgICAgIEByZWZsb3dTZWxlY3Rpb24oZXZlbnQuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGNvbW1hbmREaXNwb3NhYmxlPy5kaXNwb3NlKClcbiAgICBAY29tbWFuZERpc3Bvc2FibGUgPSBudWxsXG5cbiAgcmVmbG93U2VsZWN0aW9uOiAoZWRpdG9yKSAtPlxuICAgIHJhbmdlID0gZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKVxuICAgIHJhbmdlID0gZWRpdG9yLmdldEN1cnJlbnRQYXJhZ3JhcGhCdWZmZXJSYW5nZSgpIGlmIHJhbmdlLmlzRW1wdHkoKVxuICAgIHJldHVybiB1bmxlc3MgcmFuZ2U/XG5cbiAgICByZWZsb3dPcHRpb25zID1cbiAgICAgICAgd3JhcENvbHVtbjogQGdldFByZWZlcnJlZExpbmVMZW5ndGgoZWRpdG9yKVxuICAgICAgICB0YWJMZW5ndGg6IEBnZXRUYWJMZW5ndGgoZWRpdG9yKVxuICAgIHJlZmxvd2VkVGV4dCA9IEByZWZsb3coZWRpdG9yLmdldFRleHRJblJhbmdlKHJhbmdlKSwgcmVmbG93T3B0aW9ucylcbiAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dEluUmFuZ2UocmFuZ2UsIHJlZmxvd2VkVGV4dClcblxuICByZWZsb3c6ICh0ZXh0LCB7d3JhcENvbHVtbiwgdGFiTGVuZ3RofSkgLT5cbiAgICBwYXJhZ3JhcGhzID0gW11cbiAgICAjIENvbnZlcnQgYWxsIFxcclxcbiBhbmQgXFxyIHRvIFxcbi4gVGhlIHRleHQgYnVmZmVyIHdpbGwgbm9ybWFsaXplIHRoZW0gbGF0ZXJcbiAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXHJcXG4/L2csICdcXG4nKVxuXG4gICAgbGVhZGluZ1ZlcnRpY2FsU3BhY2UgPSB0ZXh0Lm1hdGNoKC9eXFxzKlxcbi8pXG4gICAgaWYgbGVhZGluZ1ZlcnRpY2FsU3BhY2VcbiAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cihsZWFkaW5nVmVydGljYWxTcGFjZS5sZW5ndGgpXG4gICAgZWxzZVxuICAgICAgbGVhZGluZ1ZlcnRpY2FsU3BhY2UgPSAnJ1xuXG4gICAgdHJhaWxpbmdWZXJ0aWNhbFNwYWNlID0gdGV4dC5tYXRjaCgvXFxuXFxzKiQvKVxuICAgIGlmIHRyYWlsaW5nVmVydGljYWxTcGFjZVxuICAgICAgdGV4dCA9IHRleHQuc3Vic3RyKDAsIHRleHQubGVuZ3RoIC0gdHJhaWxpbmdWZXJ0aWNhbFNwYWNlLmxlbmd0aClcbiAgICBlbHNlXG4gICAgICB0cmFpbGluZ1ZlcnRpY2FsU3BhY2UgPSAnJ1xuXG4gICAgcGFyYWdyYXBoQmxvY2tzID0gdGV4dC5zcGxpdCgvXFxuXFxzKlxcbi9nKVxuICAgIGlmIHRhYkxlbmd0aFxuICAgICAgdGFiTGVuZ3RoSW5TcGFjZXMgPSBBcnJheSh0YWJMZW5ndGggKyAxKS5qb2luKCcgJylcbiAgICBlbHNlXG4gICAgICB0YWJMZW5ndGhJblNwYWNlcyA9ICcnXG5cbiAgICBmb3IgYmxvY2sgaW4gcGFyYWdyYXBoQmxvY2tzXG4gICAgICBibG9ja0xpbmVzID0gYmxvY2suc3BsaXQoJ1xcbicpXG5cbiAgICAgICMgRm9yIExhVGVYIHRhZ3Mgc3Vycm91bmRpbmcgdGhlIHRleHQsIHdlIHNpbXBseSBpZ25vcmUgdGhlbSwgYW5kXG4gICAgICAjIHJlcHJvZHVjZSB0aGVtIHZlcmJhdGltIGluIHRoZSB3cmFwcGVkIHRleHQuXG4gICAgICBiZWdpbm5pbmdMaW5lc1RvSWdub3JlID0gW11cbiAgICAgIGVuZGluZ0xpbmVzVG9JZ25vcmUgPSBbXVxuICAgICAgbGF0ZXhUYWdSZWdleCA9IC9eXFxzKlxcXFxcXHcrKFxcWy4qXFxdKT9cXHtcXHcrXFx9KFxcWy4qXFxdKT9cXHMqJC9nICAgICMgZS5nLiBcXGJlZ2lue3ZlcmJhdGltfVxuICAgICAgbGF0ZXhUYWdTdGFydFJlZ2V4ID0gL15cXHMqXFxcXFxcdytcXHMqXFx7XFxzKiQvZyAgICAgICAgICAgICAgICAgICAjIGUuZy4gXFxpdGVte1xuICAgICAgbGF0ZXhUYWdFbmRSZWdleCA9IC9eXFxzKlxcfVxccyokL2cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgZS5nLiB9XG4gICAgICB3aGlsZSBibG9ja0xpbmVzLmxlbmd0aCA+IDAgYW5kIChcbiAgICAgICAgICAgIGJsb2NrTGluZXNbMF0ubWF0Y2gobGF0ZXhUYWdSZWdleCkgb3JcbiAgICAgICAgICAgIGJsb2NrTGluZXNbMF0ubWF0Y2gobGF0ZXhUYWdTdGFydFJlZ2V4KSlcbiAgICAgICAgYmVnaW5uaW5nTGluZXNUb0lnbm9yZS5wdXNoKGJsb2NrTGluZXNbMF0pXG4gICAgICAgIGJsb2NrTGluZXMuc2hpZnQoKVxuICAgICAgd2hpbGUgYmxvY2tMaW5lcy5sZW5ndGggPiAwIGFuZCAoXG4gICAgICAgICAgICBibG9ja0xpbmVzW2Jsb2NrTGluZXMubGVuZ3RoIC0gMV0ubWF0Y2gobGF0ZXhUYWdSZWdleCkgb3JcbiAgICAgICAgICAgIGJsb2NrTGluZXNbYmxvY2tMaW5lcy5sZW5ndGggLSAxXS5tYXRjaChsYXRleFRhZ0VuZFJlZ2V4KSlcbiAgICAgICAgZW5kaW5nTGluZXNUb0lnbm9yZS51bnNoaWZ0KGJsb2NrTGluZXNbYmxvY2tMaW5lcy5sZW5ndGggLSAxXSlcbiAgICAgICAgYmxvY2tMaW5lcy5wb3AoKVxuXG4gICAgICAjIFRoZSBwYXJhZ3JhcGggbWlnaHQgYmUgYSBMYVRlWCBzZWN0aW9uIHdpdGggbm8gdGV4dCwgb25seSB0YWdzOlxuICAgICAgIyBcXGRvY3VtZW50Y2xhc3N7YXJ0aWNsZX1cbiAgICAgICMgSW4gdGhhdCBjYXNlLCB3ZSBoYXZlIG5vdGhpbmcgdG8gcmVmbG93LlxuICAgICAgIyBQdXNoIHRoZSB0YWdzIHZlcmJhdGltIGFuZCBjb250aW51ZSB0byB0aGUgbmV4dCBwYXJhZ3JhcGguXG4gICAgICB1bmxlc3MgYmxvY2tMaW5lcy5sZW5ndGggPiAwXG4gICAgICAgIHBhcmFncmFwaHMucHVzaChibG9jaylcbiAgICAgICAgY29udGludWVcblxuICAgICAgIyBUT0RPOiB0aGlzIGNvdWxkIGJlIG1vcmUgbGFuZ3VhZ2Ugc3BlY2lmaWMuIFVzZSB0aGUgYWN0dWFsIGNvbW1lbnQgY2hhci5cbiAgICAgICMgUmVtZW1iZXIgdGhhdCBgLWAgaGFzIHRvIGJlIHRoZSBsYXN0IGNoYXJhY3RlciBpbiB0aGUgY2hhcmFjdGVyIGNsYXNzLlxuICAgICAgbGluZVByZWZpeCA9IGJsb2NrTGluZXNbMF0ubWF0Y2goL15cXHMqKFxcL1xcL3xcXC9cXCp8Ozt8Iyd8XFx8XFx8XFx8fC0tfFsjJSo+LV0pP1xccyovZylbMF1cbiAgICAgIGxpbmVQcmVmaXhUYWJFeHBhbmRlZCA9IGxpbmVQcmVmaXhcbiAgICAgIGlmIHRhYkxlbmd0aEluU3BhY2VzXG4gICAgICAgIGxpbmVQcmVmaXhUYWJFeHBhbmRlZCA9IGxpbmVQcmVmaXgucmVwbGFjZSgvXFx0L2csIHRhYkxlbmd0aEluU3BhY2VzKVxuXG4gICAgICBpZiBsaW5lUHJlZml4XG4gICAgICAgIGVzY2FwZWRMaW5lUHJlZml4ID0gXy5lc2NhcGVSZWdFeHAobGluZVByZWZpeClcbiAgICAgICAgYmxvY2tMaW5lcyA9IGJsb2NrTGluZXMubWFwIChibG9ja0xpbmUpIC0+XG4gICAgICAgICAgYmxvY2tMaW5lLnJlcGxhY2UoLy8vXiN7ZXNjYXBlZExpbmVQcmVmaXh9Ly8vLCAnJylcblxuICAgICAgYmxvY2tMaW5lcyA9IGJsb2NrTGluZXMubWFwIChibG9ja0xpbmUpIC0+XG4gICAgICAgIGJsb2NrTGluZS5yZXBsYWNlKC9eXFxzKy8sICcnKVxuXG4gICAgICBsaW5lcyA9IFtdXG4gICAgICBjdXJyZW50TGluZSA9IFtdXG4gICAgICBjdXJyZW50TGluZUxlbmd0aCA9IGxpbmVQcmVmaXhUYWJFeHBhbmRlZC5sZW5ndGhcblxuICAgICAgd3JhcHBlZExpbmVQcmVmaXggPSBsaW5lUHJlZml4XG4gICAgICAgIC5yZXBsYWNlKC9eKFxccyopXFwvXFwqLywgJyQxICAnKVxuICAgICAgICAucmVwbGFjZSgvXihcXHMqKS0oPyEtKS8sICckMSAnKVxuXG4gICAgICBmaXJzdExpbmUgPSB0cnVlXG4gICAgICBmb3Igc2VnbWVudCBpbiBAc2VnbWVudFRleHQoYmxvY2tMaW5lcy5qb2luKCcgJykpXG4gICAgICAgIGlmIEB3cmFwU2VnbWVudChzZWdtZW50LCBjdXJyZW50TGluZUxlbmd0aCwgd3JhcENvbHVtbilcblxuICAgICAgICAgICMgSW5kZXBlbmRlbnQgb2YgbGluZSBwcmVmaXggZG9uJ3QgbWVzcyB3aXRoIGl0IG9uIHRoZSBmaXJzdCBsaW5lXG4gICAgICAgICAgaWYgZmlyc3RMaW5lIGlzbnQgdHJ1ZVxuICAgICAgICAgICAgIyBIYW5kbGUgQyBjb21tZW50c1xuICAgICAgICAgICAgaWYgbGluZVByZWZpeC5zZWFyY2goL15cXHMqXFwvXFwqLykgaXNudCAtMSBvciBsaW5lUHJlZml4LnNlYXJjaCgvXlxccyotKD8hLSkvKSBpc250IC0xXG4gICAgICAgICAgICAgIGxpbmVQcmVmaXggPSB3cmFwcGVkTGluZVByZWZpeFxuICAgICAgICAgIGxpbmVzLnB1c2gobGluZVByZWZpeCArIGN1cnJlbnRMaW5lLmpvaW4oJycpKVxuICAgICAgICAgIGN1cnJlbnRMaW5lID0gW11cbiAgICAgICAgICBjdXJyZW50TGluZUxlbmd0aCA9IGxpbmVQcmVmaXhUYWJFeHBhbmRlZC5sZW5ndGhcbiAgICAgICAgICBmaXJzdExpbmUgPSBmYWxzZVxuICAgICAgICBjdXJyZW50TGluZS5wdXNoKHNlZ21lbnQpXG4gICAgICAgIGN1cnJlbnRMaW5lTGVuZ3RoICs9IHNlZ21lbnQubGVuZ3RoXG4gICAgICBsaW5lcy5wdXNoKGxpbmVQcmVmaXggKyBjdXJyZW50TGluZS5qb2luKCcnKSlcblxuICAgICAgd3JhcHBlZExpbmVzID0gYmVnaW5uaW5nTGluZXNUb0lnbm9yZS5jb25jYXQobGluZXMuY29uY2F0KGVuZGluZ0xpbmVzVG9JZ25vcmUpKVxuICAgICAgcGFyYWdyYXBocy5wdXNoKHdyYXBwZWRMaW5lcy5qb2luKCdcXG4nKS5yZXBsYWNlKC9cXHMrXFxuL2csICdcXG4nKSlcblxuICAgIHJldHVybiBsZWFkaW5nVmVydGljYWxTcGFjZSArIHBhcmFncmFwaHMuam9pbignXFxuXFxuJykgKyB0cmFpbGluZ1ZlcnRpY2FsU3BhY2VcblxuICBnZXRUYWJMZW5ndGg6IChlZGl0b3IpIC0+XG4gICAgYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IudGFiTGVuZ3RoJywgc2NvcGU6IGVkaXRvci5nZXRSb290U2NvcGVEZXNjcmlwdG9yKCkpID8gMlxuXG4gIGdldFByZWZlcnJlZExpbmVMZW5ndGg6IChlZGl0b3IpIC0+XG4gICAgYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCcsIHNjb3BlOiBlZGl0b3IuZ2V0Um9vdFNjb3BlRGVzY3JpcHRvcigpKVxuXG4gIHdyYXBTZWdtZW50OiAoc2VnbWVudCwgY3VycmVudExpbmVMZW5ndGgsIHdyYXBDb2x1bW4pIC0+XG4gICAgQ2hhcmFjdGVyUGF0dGVybi50ZXN0KHNlZ21lbnQpIGFuZFxuICAgICAgKGN1cnJlbnRMaW5lTGVuZ3RoICsgc2VnbWVudC5sZW5ndGggPiB3cmFwQ29sdW1uKSBhbmRcbiAgICAgIChjdXJyZW50TGluZUxlbmd0aCA+IDAgb3Igc2VnbWVudC5sZW5ndGggPCB3cmFwQ29sdW1uKVxuXG4gIHNlZ21lbnRUZXh0OiAodGV4dCkgLT5cbiAgICBzZWdtZW50cyA9IFtdXG4gICAgcmUgPSAvW1xcc10rfFteXFxzXSsvZ1xuICAgIHNlZ21lbnRzLnB1c2gobWF0Y2hbMF0pIHdoaWxlIG1hdGNoID0gcmUuZXhlYyh0ZXh0KVxuICAgIHNlZ21lbnRzXG4iXX0=
