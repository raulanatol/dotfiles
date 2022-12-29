(function() {
  var COMPLETIONS, cssDocsURL, firstCharsEqual, firstInlinePropertyNameWithColonPattern, hasScope, importantPrefixPattern, inlinePropertyNameWithColonPattern, lineEndsWithSemicolon, propertyNamePrefixPattern, propertyNameWithColonPattern, pseudoSelectorPrefixPattern, tagSelectorPrefixPattern;

  COMPLETIONS = require('../completions.json');

  firstInlinePropertyNameWithColonPattern = /{\s*(\S+)\s*:/;

  inlinePropertyNameWithColonPattern = /(?:;.+?)*;\s*(\S+)\s*:/;

  propertyNameWithColonPattern = /^\s*(\S+)\s*:/;

  propertyNamePrefixPattern = /[a-zA-Z]+[-a-zA-Z]*$/;

  pseudoSelectorPrefixPattern = /:(:)?([a-z]+[a-z-]*)?$/;

  tagSelectorPrefixPattern = /(^|\s|,)([a-z]+)?$/;

  importantPrefixPattern = /(![a-z]+)$/;

  cssDocsURL = "https://developer.mozilla.org/en-US/docs/Web/CSS";

  module.exports = {
    selector: '.source.css, .source.sass, .source.css.postcss',
    disableForSelector: '.source.css .comment, .source.css .string, .source.sass .comment, .source.sass .string, .source.css.postcss .comment, source.css.postcss .string',
    properties: COMPLETIONS.properties,
    pseudoSelectors: COMPLETIONS.pseudoSelectors,
    tags: COMPLETIONS.tags,
    filterSuggestions: true,
    getSuggestions: function(request) {
      var completions, isSass, scopes, tagCompletions;
      completions = null;
      scopes = request.scopeDescriptor.getScopesArray();
      isSass = hasScope(scopes, 'source.sass', true);
      if (this.isCompletingValue(request)) {
        completions = this.getPropertyValueCompletions(request);
      } else if (this.isCompletingPseudoSelector(request)) {
        completions = this.getPseudoSelectorCompletions(request);
      } else {
        if (isSass && this.isCompletingNameOrTag(request)) {
          completions = this.getPropertyNameCompletions(request).concat(this.getTagCompletions(request));
        } else if (!isSass && this.isCompletingName(request)) {
          completions = this.getPropertyNameCompletions(request);
        }
      }
      if (!isSass && this.isCompletingTagSelector(request)) {
        tagCompletions = this.getTagCompletions(request);
        if (tagCompletions != null ? tagCompletions.length : void 0) {
          if (completions == null) {
            completions = [];
          }
          completions = completions.concat(tagCompletions);
        }
      }
      return completions;
    },
    onDidInsertSuggestion: function(arg) {
      var editor, suggestion;
      editor = arg.editor, suggestion = arg.suggestion;
      if (suggestion.type === 'property') {
        return setTimeout(this.triggerAutocomplete.bind(this, editor), 1);
      }
    },
    triggerAutocomplete: function(editor) {
      return atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', {
        activatedManually: false
      });
    },
    isCompletingValue: function(arg) {
      var beforePrefixBufferPosition, beforePrefixScopes, beforePrefixScopesArray, bufferPosition, editor, prefix, previousBufferPosition, previousScopes, previousScopesArray, scopeDescriptor, scopes;
      scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition, prefix = arg.prefix, editor = arg.editor;
      scopes = scopeDescriptor.getScopesArray();
      beforePrefixBufferPosition = [bufferPosition.row, Math.max(0, bufferPosition.column - prefix.length - 1)];
      beforePrefixScopes = editor.scopeDescriptorForBufferPosition(beforePrefixBufferPosition);
      beforePrefixScopesArray = beforePrefixScopes.getScopesArray();
      previousBufferPosition = [bufferPosition.row, Math.max(0, bufferPosition.column - 1)];
      previousScopes = editor.scopeDescriptorForBufferPosition(previousBufferPosition);
      previousScopesArray = previousScopes.getScopesArray();
      return (hasScope(scopes, 'meta.property-list.css') && prefix.trim() === ":") || (hasScope(previousScopesArray, 'meta.property-value.css')) || (hasScope(scopes, 'meta.property-list.scss') && prefix.trim() === ":") || (hasScope(previousScopesArray, 'meta.property-value.scss')) || (hasScope(scopes, 'meta.property-list.postcss') && prefix.trim() === ":") || (hasScope(previousScopesArray, 'meta.property-value.postcss')) || (hasScope(scopes, 'source.sass', true) && (hasScope(scopes, 'meta.property-value.sass') || (!hasScope(beforePrefixScopesArray, 'entity.name.tag.css') && prefix.trim() === ":")));
    },
    isCompletingName: function(arg) {
      var bufferPosition, editor, isAtBeginScopePunctuation, isAtEndScopePunctuation, isAtParentSymbol, isAtTerminator, isInPropertyList, isVariable, prefix, previousBufferPosition, previousScopes, previousScopesArray, scopeDescriptor, scopes;
      scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition, prefix = arg.prefix, editor = arg.editor;
      scopes = scopeDescriptor.getScopesArray();
      isAtTerminator = prefix.endsWith(';');
      isAtParentSymbol = prefix.endsWith('&');
      isVariable = hasScope(scopes, 'variable.css') || hasScope(scopes, 'variable.scss') || hasScope(scopes, 'variable.var.postcss');
      isInPropertyList = !isAtTerminator && (hasScope(scopes, 'meta.property-list.css') || hasScope(scopes, 'meta.property-list.scss') || hasScope(scopes, 'meta.property-list.postcss'));
      if (!isInPropertyList) {
        return false;
      }
      if (isAtParentSymbol || isVariable) {
        return false;
      }
      previousBufferPosition = [bufferPosition.row, Math.max(0, bufferPosition.column - prefix.length - 1)];
      previousScopes = editor.scopeDescriptorForBufferPosition(previousBufferPosition);
      previousScopesArray = previousScopes.getScopesArray();
      if (hasScope(previousScopesArray, 'entity.other.attribute-name.class.css') || hasScope(previousScopesArray, 'entity.other.attribute-name.id.css') || hasScope(previousScopesArray, 'entity.other.attribute-name.id') || hasScope(previousScopesArray, 'entity.other.attribute-name.parent-selector.css') || hasScope(previousScopesArray, 'entity.name.tag.reference.scss') || hasScope(previousScopesArray, 'entity.name.tag.scss') || hasScope(previousScopesArray, 'entity.name.tag.reference.postcss') || hasScope(previousScopesArray, 'entity.name.tag.postcss')) {
        return false;
      }
      isAtBeginScopePunctuation = hasScope(scopes, 'punctuation.section.property-list.begin.bracket.curly.css') || hasScope(scopes, 'punctuation.section.property-list.begin.bracket.curly.scss') || hasScope(scopes, 'punctuation.section.property-list.begin.postcss');
      isAtEndScopePunctuation = hasScope(scopes, 'punctuation.section.property-list.end.bracket.curly.css') || hasScope(scopes, 'punctuation.section.property-list.end.bracket.curly.scss') || hasScope(scopes, 'punctuation.section.property-list.end.postcss');
      if (isAtBeginScopePunctuation) {
        return prefix.endsWith('{');
      } else if (isAtEndScopePunctuation) {
        return !prefix.endsWith('}');
      } else {
        return true;
      }
    },
    isCompletingNameOrTag: function(arg) {
      var bufferPosition, editor, prefix, scopeDescriptor, scopes;
      scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition, editor = arg.editor;
      scopes = scopeDescriptor.getScopesArray();
      prefix = this.getPropertyNamePrefix(bufferPosition, editor);
      return this.isPropertyNamePrefix(prefix) && hasScope(scopes, 'meta.selector.css') && !hasScope(scopes, 'entity.other.attribute-name.id.css.sass') && !hasScope(scopes, 'entity.other.attribute-name.class.sass');
    },
    isCompletingTagSelector: function(arg) {
      var bufferPosition, editor, previousBufferPosition, previousScopes, previousScopesArray, scopeDescriptor, scopes, tagSelectorPrefix;
      editor = arg.editor, scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition;
      scopes = scopeDescriptor.getScopesArray();
      tagSelectorPrefix = this.getTagSelectorPrefix(editor, bufferPosition);
      if (!(tagSelectorPrefix != null ? tagSelectorPrefix.length : void 0)) {
        return false;
      }
      previousBufferPosition = [bufferPosition.row, Math.max(0, bufferPosition.column - 1)];
      previousScopes = editor.scopeDescriptorForBufferPosition(previousBufferPosition);
      previousScopesArray = previousScopes.getScopesArray();
      if (hasScope(scopes, 'meta.selector.css') || hasScope(previousScopesArray, 'meta.selector.css')) {
        return true;
      } else if (hasScope(scopes, 'source.css.scss', true) || hasScope(scopes, 'source.css.less', true) || hasScope(scopes, 'source.css.postcss', true)) {
        return !hasScope(previousScopesArray, 'meta.property-value.scss') && !hasScope(previousScopesArray, 'meta.property-value.css') && !hasScope(previousScopesArray, 'meta.property-value.postcss') && !hasScope(previousScopesArray, 'support.type.property-value.css');
      } else {
        return false;
      }
    },
    isCompletingPseudoSelector: function(arg) {
      var bufferPosition, editor, prefix, previousBufferPosition, previousScopes, previousScopesArray, scopeDescriptor, scopes;
      editor = arg.editor, scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition;
      scopes = scopeDescriptor.getScopesArray();
      previousBufferPosition = [bufferPosition.row, Math.max(0, bufferPosition.column - 1)];
      previousScopes = editor.scopeDescriptorForBufferPosition(previousBufferPosition);
      previousScopesArray = previousScopes.getScopesArray();
      if ((hasScope(scopes, 'meta.selector.css') || hasScope(previousScopesArray, 'meta.selector.css')) && !hasScope(scopes, 'source.sass', true)) {
        return true;
      } else if (hasScope(scopes, 'source.css.scss', true) || hasScope(scopes, 'source.css.less', true) || hasScope(scopes, 'source.sass', true) || hasScope(scopes, 'source.css.postcss', true)) {
        prefix = this.getPseudoSelectorPrefix(editor, bufferPosition);
        if (prefix) {
          previousBufferPosition = [bufferPosition.row, Math.max(0, bufferPosition.column - prefix.length - 1)];
          previousScopes = editor.scopeDescriptorForBufferPosition(previousBufferPosition);
          previousScopesArray = previousScopes.getScopesArray();
          return !hasScope(previousScopesArray, 'meta.property-name.scss') && !hasScope(previousScopesArray, 'meta.property-value.scss') && !hasScope(previousScopesArray, 'meta.property-value.postcss') && !hasScope(previousScopesArray, 'support.type.property-name.css') && !hasScope(previousScopesArray, 'support.type.property-value.css') && !hasScope(previousScopesArray, 'support.type.property-name.postcss');
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    isPropertyValuePrefix: function(prefix) {
      prefix = prefix.trim();
      return prefix.length > 0 && prefix !== ':';
    },
    isPropertyNamePrefix: function(prefix) {
      if (prefix == null) {
        return false;
      }
      prefix = prefix.trim();
      return prefix.length > 0 && prefix.match(/^[a-zA-Z-]+$/);
    },
    getImportantPrefix: function(editor, bufferPosition) {
      var line, ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (ref = importantPrefixPattern.exec(line)) != null ? ref[1] : void 0;
    },
    getPreviousPropertyName: function(bufferPosition, editor) {
      var column, line, propertyName, ref, ref1, ref2, row;
      row = bufferPosition.row, column = bufferPosition.column;
      while (row >= 0) {
        line = editor.lineTextForBufferRow(row);
        if (row === bufferPosition.row) {
          line = line.substr(0, column);
        }
        propertyName = (ref = inlinePropertyNameWithColonPattern.exec(line)) != null ? ref[1] : void 0;
        if (propertyName == null) {
          propertyName = (ref1 = firstInlinePropertyNameWithColonPattern.exec(line)) != null ? ref1[1] : void 0;
        }
        if (propertyName == null) {
          propertyName = (ref2 = propertyNameWithColonPattern.exec(line)) != null ? ref2[1] : void 0;
        }
        if (propertyName) {
          return propertyName;
        }
        row--;
      }
    },
    getPropertyValueCompletions: function(arg) {
      var addSemicolon, bufferPosition, completions, editor, i, importantPrefix, j, len, len1, prefix, property, ref, scopeDescriptor, scopes, value, values;
      bufferPosition = arg.bufferPosition, editor = arg.editor, prefix = arg.prefix, scopeDescriptor = arg.scopeDescriptor;
      property = this.getPreviousPropertyName(bufferPosition, editor);
      values = (ref = this.properties[property]) != null ? ref.values : void 0;
      if (values == null) {
        return null;
      }
      scopes = scopeDescriptor.getScopesArray();
      addSemicolon = !lineEndsWithSemicolon(bufferPosition, editor) && !hasScope(scopes, 'source.sass', true);
      completions = [];
      if (this.isPropertyValuePrefix(prefix)) {
        for (i = 0, len = values.length; i < len; i++) {
          value = values[i];
          if (firstCharsEqual(value, prefix)) {
            completions.push(this.buildPropertyValueCompletion(value, property, addSemicolon));
          }
        }
      } else if (!hasScope(scopes, 'keyword.other.unit.percentage.css') && !hasScope(scopes, 'keyword.other.unit.scss') && !hasScope(scopes, 'keyword.other.unit.css')) {
        for (j = 0, len1 = values.length; j < len1; j++) {
          value = values[j];
          completions.push(this.buildPropertyValueCompletion(value, property, addSemicolon));
        }
      }
      if (importantPrefix = this.getImportantPrefix(editor, bufferPosition)) {
        completions.push({
          type: 'keyword',
          text: '!important',
          displayText: '!important',
          replacementPrefix: importantPrefix,
          description: "Forces this property to override any other declaration of the same property. Use with caution.",
          descriptionMoreURL: cssDocsURL + "/Specificity#The_!important_exception"
        });
      }
      return completions;
    },
    buildPropertyValueCompletion: function(value, propertyName, addSemicolon) {
      var text;
      text = value;
      if (addSemicolon) {
        text += ';';
      }
      return {
        type: 'value',
        text: text,
        displayText: value,
        description: value + " value for the " + propertyName + " property",
        descriptionMoreURL: cssDocsURL + "/" + propertyName + "#Values"
      };
    },
    getPropertyNamePrefix: function(bufferPosition, editor) {
      var line, ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (ref = propertyNamePrefixPattern.exec(line)) != null ? ref[0] : void 0;
    },
    getPropertyNameCompletions: function(arg) {
      var activatedManually, bufferPosition, completions, editor, line, options, prefix, property, ref, scopeDescriptor, scopes;
      bufferPosition = arg.bufferPosition, editor = arg.editor, scopeDescriptor = arg.scopeDescriptor, activatedManually = arg.activatedManually;
      scopes = scopeDescriptor.getScopesArray();
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      if (hasScope(scopes, 'source.sass', true) && !line.match(/^(\s|\t)/)) {
        return [];
      }
      prefix = this.getPropertyNamePrefix(bufferPosition, editor);
      if (!(activatedManually || prefix)) {
        return [];
      }
      completions = [];
      ref = this.properties;
      for (property in ref) {
        options = ref[property];
        if (!prefix || firstCharsEqual(property, prefix)) {
          completions.push(this.buildPropertyNameCompletion(property, prefix, options));
        }
      }
      return completions;
    },
    buildPropertyNameCompletion: function(propertyName, prefix, arg) {
      var description;
      description = arg.description;
      return {
        type: 'property',
        text: propertyName + ": ",
        displayText: propertyName,
        replacementPrefix: prefix,
        description: description,
        descriptionMoreURL: cssDocsURL + "/" + propertyName
      };
    },
    getPseudoSelectorPrefix: function(editor, bufferPosition) {
      var line, ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (ref = line.match(pseudoSelectorPrefixPattern)) != null ? ref[0] : void 0;
    },
    getPseudoSelectorCompletions: function(arg) {
      var bufferPosition, completions, editor, options, prefix, pseudoSelector, ref;
      bufferPosition = arg.bufferPosition, editor = arg.editor;
      prefix = this.getPseudoSelectorPrefix(editor, bufferPosition);
      if (!prefix) {
        return null;
      }
      completions = [];
      ref = this.pseudoSelectors;
      for (pseudoSelector in ref) {
        options = ref[pseudoSelector];
        if (firstCharsEqual(pseudoSelector, prefix)) {
          completions.push(this.buildPseudoSelectorCompletion(pseudoSelector, prefix, options));
        }
      }
      return completions;
    },
    buildPseudoSelectorCompletion: function(pseudoSelector, prefix, arg) {
      var argument, completion, description;
      argument = arg.argument, description = arg.description;
      completion = {
        type: 'pseudo-selector',
        replacementPrefix: prefix,
        description: description,
        descriptionMoreURL: cssDocsURL + "/" + pseudoSelector
      };
      if (argument != null) {
        completion.snippet = pseudoSelector + "(${1:" + argument + "})";
      } else {
        completion.text = pseudoSelector;
      }
      return completion;
    },
    getTagSelectorPrefix: function(editor, bufferPosition) {
      var line, ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (ref = tagSelectorPrefixPattern.exec(line)) != null ? ref[2] : void 0;
    },
    getTagCompletions: function(arg) {
      var bufferPosition, completions, editor, i, len, prefix, ref, tag;
      bufferPosition = arg.bufferPosition, editor = arg.editor, prefix = arg.prefix;
      completions = [];
      if (prefix) {
        ref = this.tags;
        for (i = 0, len = ref.length; i < len; i++) {
          tag = ref[i];
          if (firstCharsEqual(tag, prefix)) {
            completions.push(this.buildTagCompletion(tag));
          }
        }
      }
      return completions;
    },
    buildTagCompletion: function(tag) {
      return {
        type: 'tag',
        text: tag,
        description: "Selector for <" + tag + "> elements"
      };
    }
  };

  lineEndsWithSemicolon = function(bufferPosition, editor) {
    var line, row;
    row = bufferPosition.row;
    line = editor.lineTextForBufferRow(row);
    return /;\s*$/.test(line);
  };

  hasScope = function(scopesArray, scope, checkEmbedded) {
    if (checkEmbedded == null) {
      checkEmbedded = false;
    }
    return scopesArray.indexOf(scope) !== -1 || (checkEmbedded && scopesArray.indexOf(scope + ".embedded.html") !== -1);
  };

  firstCharsEqual = function(str1, str2) {
    return str1[0].toLowerCase() === str2[0].toLowerCase();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYXV0b2NvbXBsZXRlLWNzcy9saWIvcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSOztFQUVkLHVDQUFBLEdBQTBDOztFQUMxQyxrQ0FBQSxHQUFxQzs7RUFDckMsNEJBQUEsR0FBK0I7O0VBQy9CLHlCQUFBLEdBQTRCOztFQUM1QiwyQkFBQSxHQUE4Qjs7RUFDOUIsd0JBQUEsR0FBMkI7O0VBQzNCLHNCQUFBLEdBQXlCOztFQUN6QixVQUFBLEdBQWE7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxnREFBVjtJQUNBLGtCQUFBLEVBQW9CLGtKQURwQjtJQUVBLFVBQUEsRUFBWSxXQUFXLENBQUMsVUFGeEI7SUFHQSxlQUFBLEVBQWlCLFdBQVcsQ0FBQyxlQUg3QjtJQUlBLElBQUEsRUFBTSxXQUFXLENBQUMsSUFKbEI7SUFTQSxpQkFBQSxFQUFtQixJQVRuQjtJQVdBLGNBQUEsRUFBZ0IsU0FBQyxPQUFEO0FBQ2QsVUFBQTtNQUFBLFdBQUEsR0FBYztNQUNkLE1BQUEsR0FBUyxPQUFPLENBQUMsZUFBZSxDQUFDLGNBQXhCLENBQUE7TUFDVCxNQUFBLEdBQVMsUUFBQSxDQUFTLE1BQVQsRUFBaUIsYUFBakIsRUFBZ0MsSUFBaEM7TUFFVCxJQUFHLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixPQUFuQixDQUFIO1FBQ0UsV0FBQSxHQUFjLElBQUMsQ0FBQSwyQkFBRCxDQUE2QixPQUE3QixFQURoQjtPQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsMEJBQUQsQ0FBNEIsT0FBNUIsQ0FBSDtRQUNILFdBQUEsR0FBYyxJQUFDLENBQUEsNEJBQUQsQ0FBOEIsT0FBOUIsRUFE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QUFvQixLQUFwQixDQUFBLEtBQWdDLENBQUMsQ0FBakMsSUFDRSxDQUFDLGFBQUEsSUFBa0IsV0FBVyxDQUFDLE9BQVosQ0FBdUIsS0FBRCxHQUFPLGdCQUE3QixDQUFBLEtBQW1ELENBQUMsQ0FBdkU7RUFGTzs7RUFJWCxlQUFBLEdBQWtCLFNBQUMsSUFBRCxFQUFPLElBQVA7V0FDaEIsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQVIsQ0FBQSxDQUFBLEtBQXlCLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFSLENBQUE7RUFEVDtBQTVUbEIiLCJzb3VyY2VzQ29udGVudCI6WyJDT01QTEVUSU9OUyA9IHJlcXVpcmUoJy4uL2NvbXBsZXRpb25zLmpzb24nKVxuXG5maXJzdElubGluZVByb3BlcnR5TmFtZVdpdGhDb2xvblBhdHRlcm4gPSAve1xccyooXFxTKylcXHMqOi8gIyAuZXhhbXBsZSB7IGRpc3BsYXk6IH1cbmlubGluZVByb3BlcnR5TmFtZVdpdGhDb2xvblBhdHRlcm4gPSAvKD86Oy4rPykqO1xccyooXFxTKylcXHMqOi8gIyAuZXhhbXBsZSB7IGRpc3BsYXk6IGJsb2NrOyBmbG9hdDogbGVmdDsgY29sb3I6IH0gKG1hdGNoIHRoZSBsYXN0IG9uZSlcbnByb3BlcnR5TmFtZVdpdGhDb2xvblBhdHRlcm4gPSAvXlxccyooXFxTKylcXHMqOi8gIyBkaXNwbGF5OlxucHJvcGVydHlOYW1lUHJlZml4UGF0dGVybiA9IC9bYS16QS1aXStbLWEtekEtWl0qJC9cbnBzZXVkb1NlbGVjdG9yUHJlZml4UGF0dGVybiA9IC86KDopPyhbYS16XStbYS16LV0qKT8kL1xudGFnU2VsZWN0b3JQcmVmaXhQYXR0ZXJuID0gLyhefFxcc3wsKShbYS16XSspPyQvXG5pbXBvcnRhbnRQcmVmaXhQYXR0ZXJuID0gLyghW2Etel0rKSQvXG5jc3NEb2NzVVJMID0gXCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1NcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHNlbGVjdG9yOiAnLnNvdXJjZS5jc3MsIC5zb3VyY2Uuc2FzcywgLnNvdXJjZS5jc3MucG9zdGNzcydcbiAgZGlzYWJsZUZvclNlbGVjdG9yOiAnLnNvdXJjZS5jc3MgLmNvbW1lbnQsIC5zb3VyY2UuY3NzIC5zdHJpbmcsIC5zb3VyY2Uuc2FzcyAuY29tbWVudCwgLnNvdXJjZS5zYXNzIC5zdHJpbmcsIC5zb3VyY2UuY3NzLnBvc3Rjc3MgLmNvbW1lbnQsIHNvdXJjZS5jc3MucG9zdGNzcyAuc3RyaW5nJ1xuICBwcm9wZXJ0aWVzOiBDT01QTEVUSU9OUy5wcm9wZXJ0aWVzXG4gIHBzZXVkb1NlbGVjdG9yczogQ09NUExFVElPTlMucHNldWRvU2VsZWN0b3JzXG4gIHRhZ3M6IENPTVBMRVRJT05TLnRhZ3NcblxuICAjIFRlbGwgYXV0b2NvbXBsZXRlIHRvIGZ1enp5IGZpbHRlciB0aGUgcmVzdWx0cyBvZiBnZXRTdWdnZXN0aW9ucygpLiBXZSBhcmVcbiAgIyBzdGlsbCBmaWx0ZXJpbmcgYnkgdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgcHJlZml4IGluIHRoaXMgcHJvdmlkZXIgZm9yXG4gICMgZWZmaWNpZW5jeS5cbiAgZmlsdGVyU3VnZ2VzdGlvbnM6IHRydWVcblxuICBnZXRTdWdnZXN0aW9uczogKHJlcXVlc3QpIC0+XG4gICAgY29tcGxldGlvbnMgPSBudWxsXG4gICAgc2NvcGVzID0gcmVxdWVzdC5zY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIGlzU2FzcyA9IGhhc1Njb3BlKHNjb3BlcywgJ3NvdXJjZS5zYXNzJywgdHJ1ZSlcblxuICAgIGlmIEBpc0NvbXBsZXRpbmdWYWx1ZShyZXF1ZXN0KVxuICAgICAgY29tcGxldGlvbnMgPSBAZ2V0UHJvcGVydHlWYWx1ZUNvbXBsZXRpb25zKHJlcXVlc3QpXG4gICAgZWxzZSBpZiBAaXNDb21wbGV0aW5nUHNldWRvU2VsZWN0b3IocmVxdWVzdClcbiAgICAgIGNvbXBsZXRpb25zID0gQGdldFBzZXVkb1NlbGVjdG9yQ29tcGxldGlvbnMocmVxdWVzdClcbiAgICBlbHNlXG4gICAgICBpZiBpc1Nhc3MgYW5kIEBpc0NvbXBsZXRpbmdOYW1lT3JUYWcocmVxdWVzdClcbiAgICAgICAgY29tcGxldGlvbnMgPSBAZ2V0UHJvcGVydHlOYW1lQ29tcGxldGlvbnMocmVxdWVzdClcbiAgICAgICAgICAuY29uY2F0KEBnZXRUYWdDb21wbGV0aW9ucyhyZXF1ZXN0KSlcbiAgICAgIGVsc2UgaWYgbm90IGlzU2FzcyBhbmQgQGlzQ29tcGxldGluZ05hbWUocmVxdWVzdClcbiAgICAgICAgY29tcGxldGlvbnMgPSBAZ2V0UHJvcGVydHlOYW1lQ29tcGxldGlvbnMocmVxdWVzdClcblxuICAgIGlmIG5vdCBpc1Nhc3MgYW5kIEBpc0NvbXBsZXRpbmdUYWdTZWxlY3RvcihyZXF1ZXN0KVxuICAgICAgdGFnQ29tcGxldGlvbnMgPSBAZ2V0VGFnQ29tcGxldGlvbnMocmVxdWVzdClcbiAgICAgIGlmIHRhZ0NvbXBsZXRpb25zPy5sZW5ndGhcbiAgICAgICAgY29tcGxldGlvbnMgPz0gW11cbiAgICAgICAgY29tcGxldGlvbnMgPSBjb21wbGV0aW9ucy5jb25jYXQodGFnQ29tcGxldGlvbnMpXG5cbiAgICBjb21wbGV0aW9uc1xuXG4gIG9uRGlkSW5zZXJ0U3VnZ2VzdGlvbjogKHtlZGl0b3IsIHN1Z2dlc3Rpb259KSAtPlxuICAgIHNldFRpbWVvdXQoQHRyaWdnZXJBdXRvY29tcGxldGUuYmluZCh0aGlzLCBlZGl0b3IpLCAxKSBpZiBzdWdnZXN0aW9uLnR5cGUgaXMgJ3Byb3BlcnR5J1xuXG4gIHRyaWdnZXJBdXRvY29tcGxldGU6IChlZGl0b3IpIC0+XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKSwgJ2F1dG9jb21wbGV0ZS1wbHVzOmFjdGl2YXRlJywge2FjdGl2YXRlZE1hbnVhbGx5OiBmYWxzZX0pXG5cbiAgaXNDb21wbGV0aW5nVmFsdWU6ICh7c2NvcGVEZXNjcmlwdG9yLCBidWZmZXJQb3NpdGlvbiwgcHJlZml4LCBlZGl0b3J9KSAtPlxuICAgIHNjb3BlcyA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpXG5cbiAgICBiZWZvcmVQcmVmaXhCdWZmZXJQb3NpdGlvbiA9IFtidWZmZXJQb3NpdGlvbi5yb3csIE1hdGgubWF4KDAsIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiAtIHByZWZpeC5sZW5ndGggLSAxKV1cbiAgICBiZWZvcmVQcmVmaXhTY29wZXMgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oYmVmb3JlUHJlZml4QnVmZmVyUG9zaXRpb24pXG4gICAgYmVmb3JlUHJlZml4U2NvcGVzQXJyYXkgPSBiZWZvcmVQcmVmaXhTY29wZXMuZ2V0U2NvcGVzQXJyYXkoKVxuXG4gICAgcHJldmlvdXNCdWZmZXJQb3NpdGlvbiA9IFtidWZmZXJQb3NpdGlvbi5yb3csIE1hdGgubWF4KDAsIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiAtIDEpXVxuICAgIHByZXZpb3VzU2NvcGVzID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKHByZXZpb3VzQnVmZmVyUG9zaXRpb24pXG4gICAgcHJldmlvdXNTY29wZXNBcnJheSA9IHByZXZpb3VzU2NvcGVzLmdldFNjb3Blc0FycmF5KClcblxuICAgIChoYXNTY29wZShzY29wZXMsICdtZXRhLnByb3BlcnR5LWxpc3QuY3NzJykgYW5kIHByZWZpeC50cmltKCkgaXMgXCI6XCIpIG9yXG4gICAgKGhhc1Njb3BlKHByZXZpb3VzU2NvcGVzQXJyYXksICdtZXRhLnByb3BlcnR5LXZhbHVlLmNzcycpKSBvclxuICAgIChoYXNTY29wZShzY29wZXMsICdtZXRhLnByb3BlcnR5LWxpc3Quc2NzcycpIGFuZCBwcmVmaXgudHJpbSgpIGlzIFwiOlwiKSBvclxuICAgIChoYXNTY29wZShwcmV2aW91c1Njb3Blc0FycmF5LCAnbWV0YS5wcm9wZXJ0eS12YWx1ZS5zY3NzJykpIG9yXG4gICAgKGhhc1Njb3BlKHNjb3BlcywgJ21ldGEucHJvcGVydHktbGlzdC5wb3N0Y3NzJykgYW5kIHByZWZpeC50cmltKCkgaXMgXCI6XCIpIG9yXG4gICAgKGhhc1Njb3BlKHByZXZpb3VzU2NvcGVzQXJyYXksICdtZXRhLnByb3BlcnR5LXZhbHVlLnBvc3Rjc3MnKSkgb3JcbiAgICAoaGFzU2NvcGUoc2NvcGVzLCAnc291cmNlLnNhc3MnLCB0cnVlKSBhbmQgKGhhc1Njb3BlKHNjb3BlcywgJ21ldGEucHJvcGVydHktdmFsdWUuc2FzcycpIG9yXG4gICAgICAobm90IGhhc1Njb3BlKGJlZm9yZVByZWZpeFNjb3Blc0FycmF5LCAnZW50aXR5Lm5hbWUudGFnLmNzcycpIGFuZCBwcmVmaXgudHJpbSgpIGlzIFwiOlwiKVxuICAgICkpXG5cbiAgaXNDb21wbGV0aW5nTmFtZTogKHtzY29wZURlc2NyaXB0b3IsIGJ1ZmZlclBvc2l0aW9uLCBwcmVmaXgsIGVkaXRvcn0pIC0+XG4gICAgc2NvcGVzID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KClcbiAgICBpc0F0VGVybWluYXRvciA9IHByZWZpeC5lbmRzV2l0aCgnOycpXG4gICAgaXNBdFBhcmVudFN5bWJvbCA9IHByZWZpeC5lbmRzV2l0aCgnJicpXG4gICAgaXNWYXJpYWJsZSA9IGhhc1Njb3BlKHNjb3BlcywgJ3ZhcmlhYmxlLmNzcycpIG9yXG4gICAgICBoYXNTY29wZShzY29wZXMsICd2YXJpYWJsZS5zY3NzJykgb3JcbiAgICAgIGhhc1Njb3BlKHNjb3BlcywgJ3ZhcmlhYmxlLnZhci5wb3N0Y3NzJylcbiAgICBpc0luUHJvcGVydHlMaXN0ID0gbm90IGlzQXRUZXJtaW5hdG9yIGFuZFxuICAgICAgKGhhc1Njb3BlKHNjb3BlcywgJ21ldGEucHJvcGVydHktbGlzdC5jc3MnKSBvclxuICAgICAgaGFzU2NvcGUoc2NvcGVzLCAnbWV0YS5wcm9wZXJ0eS1saXN0LnNjc3MnKSBvclxuICAgICAgaGFzU2NvcGUoc2NvcGVzLCAnbWV0YS5wcm9wZXJ0eS1saXN0LnBvc3Rjc3MnKSlcblxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgaXNJblByb3BlcnR5TGlzdFxuICAgIHJldHVybiBmYWxzZSBpZiBpc0F0UGFyZW50U3ltYm9sIG9yIGlzVmFyaWFibGVcblxuICAgIHByZXZpb3VzQnVmZmVyUG9zaXRpb24gPSBbYnVmZmVyUG9zaXRpb24ucm93LCBNYXRoLm1heCgwLCBidWZmZXJQb3NpdGlvbi5jb2x1bW4gLSBwcmVmaXgubGVuZ3RoIC0gMSldXG4gICAgcHJldmlvdXNTY29wZXMgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24ocHJldmlvdXNCdWZmZXJQb3NpdGlvbilcbiAgICBwcmV2aW91c1Njb3Blc0FycmF5ID0gcHJldmlvdXNTY29wZXMuZ2V0U2NvcGVzQXJyYXkoKVxuXG4gICAgcmV0dXJuIGZhbHNlIGlmIGhhc1Njb3BlKHByZXZpb3VzU2NvcGVzQXJyYXksICdlbnRpdHkub3RoZXIuYXR0cmlidXRlLW5hbWUuY2xhc3MuY3NzJykgb3JcbiAgICAgIGhhc1Njb3BlKHByZXZpb3VzU2NvcGVzQXJyYXksICdlbnRpdHkub3RoZXIuYXR0cmlidXRlLW5hbWUuaWQuY3NzJykgb3JcbiAgICAgIGhhc1Njb3BlKHByZXZpb3VzU2NvcGVzQXJyYXksICdlbnRpdHkub3RoZXIuYXR0cmlidXRlLW5hbWUuaWQnKSBvclxuICAgICAgaGFzU2NvcGUocHJldmlvdXNTY29wZXNBcnJheSwgJ2VudGl0eS5vdGhlci5hdHRyaWJ1dGUtbmFtZS5wYXJlbnQtc2VsZWN0b3IuY3NzJykgb3JcbiAgICAgIGhhc1Njb3BlKHByZXZpb3VzU2NvcGVzQXJyYXksICdlbnRpdHkubmFtZS50YWcucmVmZXJlbmNlLnNjc3MnKSBvclxuICAgICAgaGFzU2NvcGUocHJldmlvdXNTY29wZXNBcnJheSwgJ2VudGl0eS5uYW1lLnRhZy5zY3NzJykgb3JcbiAgICAgIGhhc1Njb3BlKHByZXZpb3VzU2NvcGVzQXJyYXksICdlbnRpdHkubmFtZS50YWcucmVmZXJlbmNlLnBvc3Rjc3MnKSBvclxuICAgICAgaGFzU2NvcGUocHJldmlvdXNTY29wZXNBcnJheSwgJ2VudGl0eS5uYW1lLnRhZy5wb3N0Y3NzJylcblxuICAgIGlzQXRCZWdpblNjb3BlUHVuY3R1YXRpb24gPSBoYXNTY29wZShzY29wZXMsICdwdW5jdHVhdGlvbi5zZWN0aW9uLnByb3BlcnR5LWxpc3QuYmVnaW4uYnJhY2tldC5jdXJseS5jc3MnKSBvclxuICAgICAgaGFzU2NvcGUoc2NvcGVzLCAncHVuY3R1YXRpb24uc2VjdGlvbi5wcm9wZXJ0eS1saXN0LmJlZ2luLmJyYWNrZXQuY3VybHkuc2NzcycpIG9yXG4gICAgICBoYXNTY29wZShzY29wZXMsICdwdW5jdHVhdGlvbi5zZWN0aW9uLnByb3BlcnR5LWxpc3QuYmVnaW4ucG9zdGNzcycpXG4gICAgaXNBdEVuZFNjb3BlUHVuY3R1YXRpb24gPSBoYXNTY29wZShzY29wZXMsICdwdW5jdHVhdGlvbi5zZWN0aW9uLnByb3BlcnR5LWxpc3QuZW5kLmJyYWNrZXQuY3VybHkuY3NzJykgb3JcbiAgICAgIGhhc1Njb3BlKHNjb3BlcywgJ3B1bmN0dWF0aW9uLnNlY3Rpb24ucHJvcGVydHktbGlzdC5lbmQuYnJhY2tldC5jdXJseS5zY3NzJykgb3JcbiAgICAgIGhhc1Njb3BlKHNjb3BlcywgJ3B1bmN0dWF0aW9uLnNlY3Rpb24ucHJvcGVydHktbGlzdC5lbmQucG9zdGNzcycpXG5cbiAgICBpZiBpc0F0QmVnaW5TY29wZVB1bmN0dWF0aW9uXG4gICAgICAjICogRGlzYWxsb3cgaGVyZTogYGNhbnZhcyx8e31gXG4gICAgICAjICogQWxsb3cgaGVyZTogYGNhbnZhcyx7fCB9YFxuICAgICAgcHJlZml4LmVuZHNXaXRoKCd7JylcbiAgICBlbHNlIGlmIGlzQXRFbmRTY29wZVB1bmN0dWF0aW9uXG4gICAgICAjICogRGlzYWxsb3cgaGVyZTogYGNhbnZhcyx7fXxgXG4gICAgICAjICogQWxsb3cgaGVyZTogYGNhbnZhcyx7IHx9YFxuICAgICAgbm90IHByZWZpeC5lbmRzV2l0aCgnfScpXG4gICAgZWxzZVxuICAgICAgdHJ1ZVxuXG4gIGlzQ29tcGxldGluZ05hbWVPclRhZzogKHtzY29wZURlc2NyaXB0b3IsIGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3J9KSAtPlxuICAgIHNjb3BlcyA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpXG4gICAgcHJlZml4ID0gQGdldFByb3BlcnR5TmFtZVByZWZpeChidWZmZXJQb3NpdGlvbiwgZWRpdG9yKVxuICAgIHJldHVybiBAaXNQcm9wZXJ0eU5hbWVQcmVmaXgocHJlZml4KSBhbmRcbiAgICAgIGhhc1Njb3BlKHNjb3BlcywgJ21ldGEuc2VsZWN0b3IuY3NzJykgYW5kXG4gICAgICBub3QgaGFzU2NvcGUoc2NvcGVzLCAnZW50aXR5Lm90aGVyLmF0dHJpYnV0ZS1uYW1lLmlkLmNzcy5zYXNzJykgYW5kXG4gICAgICBub3QgaGFzU2NvcGUoc2NvcGVzLCAnZW50aXR5Lm90aGVyLmF0dHJpYnV0ZS1uYW1lLmNsYXNzLnNhc3MnKVxuXG4gIGlzQ29tcGxldGluZ1RhZ1NlbGVjdG9yOiAoe2VkaXRvciwgc2NvcGVEZXNjcmlwdG9yLCBidWZmZXJQb3NpdGlvbn0pIC0+XG4gICAgc2NvcGVzID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KClcbiAgICB0YWdTZWxlY3RvclByZWZpeCA9IEBnZXRUYWdTZWxlY3RvclByZWZpeChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgdGFnU2VsZWN0b3JQcmVmaXg/Lmxlbmd0aFxuXG4gICAgcHJldmlvdXNCdWZmZXJQb3NpdGlvbiA9IFtidWZmZXJQb3NpdGlvbi5yb3csIE1hdGgubWF4KDAsIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiAtIDEpXVxuICAgIHByZXZpb3VzU2NvcGVzID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKHByZXZpb3VzQnVmZmVyUG9zaXRpb24pXG4gICAgcHJldmlvdXNTY29wZXNBcnJheSA9IHByZXZpb3VzU2NvcGVzLmdldFNjb3Blc0FycmF5KClcblxuICAgIGlmIGhhc1Njb3BlKHNjb3BlcywgJ21ldGEuc2VsZWN0b3IuY3NzJykgb3IgaGFzU2NvcGUocHJldmlvdXNTY29wZXNBcnJheSwgJ21ldGEuc2VsZWN0b3IuY3NzJylcbiAgICAgIHRydWVcbiAgICBlbHNlIGlmIGhhc1Njb3BlKHNjb3BlcywgJ3NvdXJjZS5jc3Muc2NzcycsIHRydWUpIG9yIGhhc1Njb3BlKHNjb3BlcywgJ3NvdXJjZS5jc3MubGVzcycsIHRydWUpIG9yIGhhc1Njb3BlKHNjb3BlcywgJ3NvdXJjZS5jc3MucG9zdGNzcycsIHRydWUpXG4gICAgICBub3QgaGFzU2NvcGUocHJldmlvdXNTY29wZXNBcnJheSwgJ21ldGEucHJvcGVydHktdmFsdWUuc2NzcycpIGFuZFxuICAgICAgICBub3QgaGFzU2NvcGUocHJldmlvdXNTY29wZXNBcnJheSwgJ21ldGEucHJvcGVydHktdmFsdWUuY3NzJykgYW5kXG4gICAgICAgIG5vdCBoYXNTY29wZShwcmV2aW91c1Njb3Blc0FycmF5LCAnbWV0YS5wcm9wZXJ0eS12YWx1ZS5wb3N0Y3NzJykgYW5kXG4gICAgICAgIG5vdCBoYXNTY29wZShwcmV2aW91c1Njb3Blc0FycmF5LCAnc3VwcG9ydC50eXBlLnByb3BlcnR5LXZhbHVlLmNzcycpXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICBpc0NvbXBsZXRpbmdQc2V1ZG9TZWxlY3RvcjogKHtlZGl0b3IsIHNjb3BlRGVzY3JpcHRvciwgYnVmZmVyUG9zaXRpb259KSAtPlxuICAgIHNjb3BlcyA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpXG4gICAgcHJldmlvdXNCdWZmZXJQb3NpdGlvbiA9IFtidWZmZXJQb3NpdGlvbi5yb3csIE1hdGgubWF4KDAsIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiAtIDEpXVxuICAgIHByZXZpb3VzU2NvcGVzID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKHByZXZpb3VzQnVmZmVyUG9zaXRpb24pXG4gICAgcHJldmlvdXNTY29wZXNBcnJheSA9IHByZXZpb3VzU2NvcGVzLmdldFNjb3Blc0FycmF5KClcbiAgICBpZiAoaGFzU2NvcGUoc2NvcGVzLCAnbWV0YS5zZWxlY3Rvci5jc3MnKSBvciBoYXNTY29wZShwcmV2aW91c1Njb3Blc0FycmF5LCAnbWV0YS5zZWxlY3Rvci5jc3MnKSkgYW5kIG5vdCBoYXNTY29wZShzY29wZXMsICdzb3VyY2Uuc2FzcycsIHRydWUpXG4gICAgICB0cnVlXG4gICAgZWxzZSBpZiBoYXNTY29wZShzY29wZXMsICdzb3VyY2UuY3NzLnNjc3MnLCB0cnVlKSBvciBoYXNTY29wZShzY29wZXMsICdzb3VyY2UuY3NzLmxlc3MnLCB0cnVlKSBvciBoYXNTY29wZShzY29wZXMsICdzb3VyY2Uuc2FzcycsIHRydWUpIG9yIGhhc1Njb3BlKHNjb3BlcywgJ3NvdXJjZS5jc3MucG9zdGNzcycsIHRydWUpXG4gICAgICBwcmVmaXggPSBAZ2V0UHNldWRvU2VsZWN0b3JQcmVmaXgoZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgIGlmIHByZWZpeFxuICAgICAgICBwcmV2aW91c0J1ZmZlclBvc2l0aW9uID0gW2J1ZmZlclBvc2l0aW9uLnJvdywgTWF0aC5tYXgoMCwgYnVmZmVyUG9zaXRpb24uY29sdW1uIC0gcHJlZml4Lmxlbmd0aCAtIDEpXVxuICAgICAgICBwcmV2aW91c1Njb3BlcyA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihwcmV2aW91c0J1ZmZlclBvc2l0aW9uKVxuICAgICAgICBwcmV2aW91c1Njb3Blc0FycmF5ID0gcHJldmlvdXNTY29wZXMuZ2V0U2NvcGVzQXJyYXkoKVxuICAgICAgICBub3QgaGFzU2NvcGUocHJldmlvdXNTY29wZXNBcnJheSwgJ21ldGEucHJvcGVydHktbmFtZS5zY3NzJykgYW5kXG4gICAgICAgICAgbm90IGhhc1Njb3BlKHByZXZpb3VzU2NvcGVzQXJyYXksICdtZXRhLnByb3BlcnR5LXZhbHVlLnNjc3MnKSBhbmRcbiAgICAgICAgICBub3QgaGFzU2NvcGUocHJldmlvdXNTY29wZXNBcnJheSwgJ21ldGEucHJvcGVydHktdmFsdWUucG9zdGNzcycpIGFuZFxuICAgICAgICAgIG5vdCBoYXNTY29wZShwcmV2aW91c1Njb3Blc0FycmF5LCAnc3VwcG9ydC50eXBlLnByb3BlcnR5LW5hbWUuY3NzJykgYW5kXG4gICAgICAgICAgbm90IGhhc1Njb3BlKHByZXZpb3VzU2NvcGVzQXJyYXksICdzdXBwb3J0LnR5cGUucHJvcGVydHktdmFsdWUuY3NzJykgYW5kXG4gICAgICAgICAgbm90IGhhc1Njb3BlKHByZXZpb3VzU2NvcGVzQXJyYXksICdzdXBwb3J0LnR5cGUucHJvcGVydHktbmFtZS5wb3N0Y3NzJylcbiAgICAgIGVsc2VcbiAgICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gIGlzUHJvcGVydHlWYWx1ZVByZWZpeDogKHByZWZpeCkgLT5cbiAgICBwcmVmaXggPSBwcmVmaXgudHJpbSgpXG4gICAgcHJlZml4Lmxlbmd0aCA+IDAgYW5kIHByZWZpeCBpc250ICc6J1xuXG4gIGlzUHJvcGVydHlOYW1lUHJlZml4OiAocHJlZml4KSAtPlxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgcHJlZml4P1xuICAgIHByZWZpeCA9IHByZWZpeC50cmltKClcbiAgICBwcmVmaXgubGVuZ3RoID4gMCBhbmQgcHJlZml4Lm1hdGNoKC9eW2EtekEtWi1dKyQvKVxuXG4gIGdldEltcG9ydGFudFByZWZpeDogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICBpbXBvcnRhbnRQcmVmaXhQYXR0ZXJuLmV4ZWMobGluZSk/WzFdXG5cbiAgZ2V0UHJldmlvdXNQcm9wZXJ0eU5hbWU6IChidWZmZXJQb3NpdGlvbiwgZWRpdG9yKSAtPlxuICAgIHtyb3csIGNvbHVtbn0gPSBidWZmZXJQb3NpdGlvblxuICAgIHdoaWxlIHJvdyA+PSAwXG4gICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylcbiAgICAgIGxpbmUgPSBsaW5lLnN1YnN0cigwLCBjb2x1bW4pIGlmIHJvdyBpcyBidWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgIHByb3BlcnR5TmFtZSA9IGlubGluZVByb3BlcnR5TmFtZVdpdGhDb2xvblBhdHRlcm4uZXhlYyhsaW5lKT9bMV1cbiAgICAgIHByb3BlcnR5TmFtZSA/PSBmaXJzdElubGluZVByb3BlcnR5TmFtZVdpdGhDb2xvblBhdHRlcm4uZXhlYyhsaW5lKT9bMV1cbiAgICAgIHByb3BlcnR5TmFtZSA/PSBwcm9wZXJ0eU5hbWVXaXRoQ29sb25QYXR0ZXJuLmV4ZWMobGluZSk/WzFdXG4gICAgICByZXR1cm4gcHJvcGVydHlOYW1lIGlmIHByb3BlcnR5TmFtZVxuICAgICAgcm93LS1cbiAgICByZXR1cm5cblxuICBnZXRQcm9wZXJ0eVZhbHVlQ29tcGxldGlvbnM6ICh7YnVmZmVyUG9zaXRpb24sIGVkaXRvciwgcHJlZml4LCBzY29wZURlc2NyaXB0b3J9KSAtPlxuICAgIHByb3BlcnR5ID0gQGdldFByZXZpb3VzUHJvcGVydHlOYW1lKGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpXG4gICAgdmFsdWVzID0gQHByb3BlcnRpZXNbcHJvcGVydHldPy52YWx1ZXNcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgdmFsdWVzP1xuXG4gICAgc2NvcGVzID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KClcbiAgICBhZGRTZW1pY29sb24gPSBub3QgbGluZUVuZHNXaXRoU2VtaWNvbG9uKGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpIGFuZCBub3QgaGFzU2NvcGUoc2NvcGVzLCAnc291cmNlLnNhc3MnLCB0cnVlKVxuXG4gICAgY29tcGxldGlvbnMgPSBbXVxuICAgIGlmIEBpc1Byb3BlcnR5VmFsdWVQcmVmaXgocHJlZml4KVxuICAgICAgZm9yIHZhbHVlIGluIHZhbHVlcyB3aGVuIGZpcnN0Q2hhcnNFcXVhbCh2YWx1ZSwgcHJlZml4KVxuICAgICAgICBjb21wbGV0aW9ucy5wdXNoKEBidWlsZFByb3BlcnR5VmFsdWVDb21wbGV0aW9uKHZhbHVlLCBwcm9wZXJ0eSwgYWRkU2VtaWNvbG9uKSlcbiAgICBlbHNlIGlmIG5vdCBoYXNTY29wZShzY29wZXMsICdrZXl3b3JkLm90aGVyLnVuaXQucGVyY2VudGFnZS5jc3MnKSBhbmQgIyBDU1NcbiAgICBub3QgaGFzU2NvcGUoc2NvcGVzLCAna2V5d29yZC5vdGhlci51bml0LnNjc3MnKSBhbmQgIyBTQ1NTIChUT0RPOiByZW1vdmUgaW4gQXRvbSAxLjE5LjApXG4gICAgbm90IGhhc1Njb3BlKHNjb3BlcywgJ2tleXdvcmQub3RoZXIudW5pdC5jc3MnKSAjIExlc3MsIFNhc3MgKFRPRE86IHJlbW92ZSBpbiBBdG9tIDEuMTkuMClcbiAgICAgICMgRG9uJ3QgY29tcGxldGUgaGVyZTogYHdpZHRoOiAxMDAlfGBcbiAgICAgIGZvciB2YWx1ZSBpbiB2YWx1ZXNcbiAgICAgICAgY29tcGxldGlvbnMucHVzaChAYnVpbGRQcm9wZXJ0eVZhbHVlQ29tcGxldGlvbih2YWx1ZSwgcHJvcGVydHksIGFkZFNlbWljb2xvbikpXG5cbiAgICBpZiBpbXBvcnRhbnRQcmVmaXggPSBAZ2V0SW1wb3J0YW50UHJlZml4KGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICAjIGF0dGVudGlvbjogcsOoZ2xlIGRhbmdlcmV1eFxuICAgICAgY29tcGxldGlvbnMucHVzaFxuICAgICAgICB0eXBlOiAna2V5d29yZCdcbiAgICAgICAgdGV4dDogJyFpbXBvcnRhbnQnXG4gICAgICAgIGRpc3BsYXlUZXh0OiAnIWltcG9ydGFudCdcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IGltcG9ydGFudFByZWZpeFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJGb3JjZXMgdGhpcyBwcm9wZXJ0eSB0byBvdmVycmlkZSBhbnkgb3RoZXIgZGVjbGFyYXRpb24gb2YgdGhlIHNhbWUgcHJvcGVydHkuIFVzZSB3aXRoIGNhdXRpb24uXCJcbiAgICAgICAgZGVzY3JpcHRpb25Nb3JlVVJMOiBcIiN7Y3NzRG9jc1VSTH0vU3BlY2lmaWNpdHkjVGhlXyFpbXBvcnRhbnRfZXhjZXB0aW9uXCJcblxuICAgIGNvbXBsZXRpb25zXG5cbiAgYnVpbGRQcm9wZXJ0eVZhbHVlQ29tcGxldGlvbjogKHZhbHVlLCBwcm9wZXJ0eU5hbWUsIGFkZFNlbWljb2xvbikgLT5cbiAgICB0ZXh0ID0gdmFsdWVcbiAgICB0ZXh0ICs9ICc7JyBpZiBhZGRTZW1pY29sb25cblxuICAgIHtcbiAgICAgIHR5cGU6ICd2YWx1ZSdcbiAgICAgIHRleHQ6IHRleHRcbiAgICAgIGRpc3BsYXlUZXh0OiB2YWx1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiI3t2YWx1ZX0gdmFsdWUgZm9yIHRoZSAje3Byb3BlcnR5TmFtZX0gcHJvcGVydHlcIlxuICAgICAgZGVzY3JpcHRpb25Nb3JlVVJMOiBcIiN7Y3NzRG9jc1VSTH0vI3twcm9wZXJ0eU5hbWV9I1ZhbHVlc1wiXG4gICAgfVxuXG4gIGdldFByb3BlcnR5TmFtZVByZWZpeDogKGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpIC0+XG4gICAgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICBwcm9wZXJ0eU5hbWVQcmVmaXhQYXR0ZXJuLmV4ZWMobGluZSk/WzBdXG5cbiAgZ2V0UHJvcGVydHlOYW1lQ29tcGxldGlvbnM6ICh7YnVmZmVyUG9zaXRpb24sIGVkaXRvciwgc2NvcGVEZXNjcmlwdG9yLCBhY3RpdmF0ZWRNYW51YWxseX0pIC0+XG4gICAgIyBEb24ndCBhdXRvY29tcGxldGUgcHJvcGVydHkgbmFtZXMgaW4gU0FTUyBvbiByb290IGxldmVsXG4gICAgc2NvcGVzID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KClcbiAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgIHJldHVybiBbXSBpZiBoYXNTY29wZShzY29wZXMsICdzb3VyY2Uuc2FzcycsIHRydWUpIGFuZCBub3QgbGluZS5tYXRjaCgvXihcXHN8XFx0KS8pXG5cbiAgICBwcmVmaXggPSBAZ2V0UHJvcGVydHlOYW1lUHJlZml4KGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpXG4gICAgcmV0dXJuIFtdIHVubGVzcyBhY3RpdmF0ZWRNYW51YWxseSBvciBwcmVmaXhcblxuICAgIGNvbXBsZXRpb25zID0gW11cbiAgICBmb3IgcHJvcGVydHksIG9wdGlvbnMgb2YgQHByb3BlcnRpZXMgd2hlbiBub3QgcHJlZml4IG9yIGZpcnN0Q2hhcnNFcXVhbChwcm9wZXJ0eSwgcHJlZml4KVxuICAgICAgY29tcGxldGlvbnMucHVzaChAYnVpbGRQcm9wZXJ0eU5hbWVDb21wbGV0aW9uKHByb3BlcnR5LCBwcmVmaXgsIG9wdGlvbnMpKVxuICAgIGNvbXBsZXRpb25zXG5cbiAgYnVpbGRQcm9wZXJ0eU5hbWVDb21wbGV0aW9uOiAocHJvcGVydHlOYW1lLCBwcmVmaXgsIHtkZXNjcmlwdGlvbn0pIC0+XG4gICAgdHlwZTogJ3Byb3BlcnR5J1xuICAgIHRleHQ6IFwiI3twcm9wZXJ0eU5hbWV9OiBcIlxuICAgIGRpc3BsYXlUZXh0OiBwcm9wZXJ0eU5hbWVcbiAgICByZXBsYWNlbWVudFByZWZpeDogcHJlZml4XG4gICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uXG4gICAgZGVzY3JpcHRpb25Nb3JlVVJMOiBcIiN7Y3NzRG9jc1VSTH0vI3twcm9wZXJ0eU5hbWV9XCJcblxuICBnZXRQc2V1ZG9TZWxlY3RvclByZWZpeDogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICBsaW5lLm1hdGNoKHBzZXVkb1NlbGVjdG9yUHJlZml4UGF0dGVybik/WzBdXG5cbiAgZ2V0UHNldWRvU2VsZWN0b3JDb21wbGV0aW9uczogKHtidWZmZXJQb3NpdGlvbiwgZWRpdG9yfSkgLT5cbiAgICBwcmVmaXggPSBAZ2V0UHNldWRvU2VsZWN0b3JQcmVmaXgoZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcHJlZml4XG5cbiAgICBjb21wbGV0aW9ucyA9IFtdXG4gICAgZm9yIHBzZXVkb1NlbGVjdG9yLCBvcHRpb25zIG9mIEBwc2V1ZG9TZWxlY3RvcnMgd2hlbiBmaXJzdENoYXJzRXF1YWwocHNldWRvU2VsZWN0b3IsIHByZWZpeClcbiAgICAgIGNvbXBsZXRpb25zLnB1c2goQGJ1aWxkUHNldWRvU2VsZWN0b3JDb21wbGV0aW9uKHBzZXVkb1NlbGVjdG9yLCBwcmVmaXgsIG9wdGlvbnMpKVxuICAgIGNvbXBsZXRpb25zXG5cbiAgYnVpbGRQc2V1ZG9TZWxlY3RvckNvbXBsZXRpb246IChwc2V1ZG9TZWxlY3RvciwgcHJlZml4LCB7YXJndW1lbnQsIGRlc2NyaXB0aW9ufSkgLT5cbiAgICBjb21wbGV0aW9uID1cbiAgICAgIHR5cGU6ICdwc2V1ZG8tc2VsZWN0b3InXG4gICAgICByZXBsYWNlbWVudFByZWZpeDogcHJlZml4XG4gICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb25cbiAgICAgIGRlc2NyaXB0aW9uTW9yZVVSTDogXCIje2Nzc0RvY3NVUkx9LyN7cHNldWRvU2VsZWN0b3J9XCJcblxuICAgIGlmIGFyZ3VtZW50P1xuICAgICAgY29tcGxldGlvbi5zbmlwcGV0ID0gXCIje3BzZXVkb1NlbGVjdG9yfSgkezE6I3thcmd1bWVudH19KVwiXG4gICAgZWxzZVxuICAgICAgY29tcGxldGlvbi50ZXh0ID0gcHNldWRvU2VsZWN0b3JcbiAgICBjb21wbGV0aW9uXG5cbiAgZ2V0VGFnU2VsZWN0b3JQcmVmaXg6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pXG4gICAgdGFnU2VsZWN0b3JQcmVmaXhQYXR0ZXJuLmV4ZWMobGluZSk/WzJdXG5cbiAgZ2V0VGFnQ29tcGxldGlvbnM6ICh7YnVmZmVyUG9zaXRpb24sIGVkaXRvciwgcHJlZml4fSkgLT5cbiAgICBjb21wbGV0aW9ucyA9IFtdXG4gICAgaWYgcHJlZml4XG4gICAgICBmb3IgdGFnIGluIEB0YWdzIHdoZW4gZmlyc3RDaGFyc0VxdWFsKHRhZywgcHJlZml4KVxuICAgICAgICBjb21wbGV0aW9ucy5wdXNoKEBidWlsZFRhZ0NvbXBsZXRpb24odGFnKSlcbiAgICBjb21wbGV0aW9uc1xuXG4gIGJ1aWxkVGFnQ29tcGxldGlvbjogKHRhZykgLT5cbiAgICB0eXBlOiAndGFnJ1xuICAgIHRleHQ6IHRhZ1xuICAgIGRlc2NyaXB0aW9uOiBcIlNlbGVjdG9yIGZvciA8I3t0YWd9PiBlbGVtZW50c1wiXG5cbmxpbmVFbmRzV2l0aFNlbWljb2xvbiA9IChidWZmZXJQb3NpdGlvbiwgZWRpdG9yKSAtPlxuICB7cm93fSA9IGJ1ZmZlclBvc2l0aW9uXG4gIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVxuICAvO1xccyokLy50ZXN0KGxpbmUpXG5cbmhhc1Njb3BlID0gKHNjb3Blc0FycmF5LCBzY29wZSwgY2hlY2tFbWJlZGRlZCA9IGZhbHNlKSAtPlxuICBzY29wZXNBcnJheS5pbmRleE9mKHNjb3BlKSBpc250IC0xIG9yXG4gICAgKGNoZWNrRW1iZWRkZWQgYW5kIHNjb3Blc0FycmF5LmluZGV4T2YoXCIje3Njb3BlfS5lbWJlZGRlZC5odG1sXCIpIGlzbnQgLTEpXG5cbmZpcnN0Q2hhcnNFcXVhbCA9IChzdHIxLCBzdHIyKSAtPlxuICBzdHIxWzBdLnRvTG93ZXJDYXNlKCkgaXMgc3RyMlswXS50b0xvd2VyQ2FzZSgpXG4iXX0=
