"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _atom = require("atom");
var _underscorePlus = _interopRequireDefault(require("underscore-plus"));
var _collapsibleSectionPanel = _interopRequireDefault(require("./collapsible-section-panel"));
var _richDescription = require("./rich-description");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */

const SCOPED_SETTINGS = ['autoIndent', 'autoIndentOnPaste', 'invisibles', 'nonWordCharacters', 'preferredLineLength', 'scrollPastEnd', 'showIndentGuide', 'showInvisibles', 'softWrap', 'softWrapAtPreferredLineLength', 'softWrapHangingIndent', 'tabLength', 'tabType'];
class SettingsPanel extends _collapsibleSectionPanel.default {
  constructor(options = {}) {
    super();
    let namespace = options.namespace;
    this.element = document.createElement('section');
    this.element.classList.add('section', 'settings-panel');
    this.options = options;
    this.disposables = new _atom.CompositeDisposable();
    let settings;
    if (this.options.scopeName) {
      namespace = 'editor';
      settings = {};
      for (const name of SCOPED_SETTINGS) {
        settings[name] = atom.config.get(name, {
          scope: [this.options.scopeName]
        });
      }
    } else {
      settings = atom.config.get(namespace);
    }
    this.element.appendChild(this.elementForSettings(namespace, settings));
    this.disposables.add(this.bindInputFields());
    this.disposables.add(this.bindSelectFields());
    this.disposables.add(this.bindEditors());
    this.disposables.add(this.bindTooltips());
    this.disposables.add(this.handleEvents());
  }
  destroy() {
    this.disposables.dispose();
    this.element.remove();
  }
  elementForSettings(namespace, settings) {
    if (_underscorePlus.default.isEmpty(settings)) {
      return document.createDocumentFragment();
    }
    let {
      title
    } = this.options;
    const includeTitle = this.options.includeTitle != null ? this.options.includeTitle : true;
    if (includeTitle) {
      if (title == null) {
        title = `${_underscorePlus.default.undasherize(_underscorePlus.default.uncamelcase(namespace))} Settings`;
      }
    } else {
      if (title == null) {
        title = 'Settings';
      }
    }
    const icon = this.options.icon != null ? this.options.icon : 'gear';
    const {
      note
    } = this.options;
    const sortedSettings = this.sortSettings(namespace, settings);
    const container = document.createElement('div');
    container.classList.add('section-container');
    const heading = document.createElement('div');
    heading.classList.add('block', 'section-heading', 'icon', `icon-${icon}`);
    heading.textContent = title;
    container.appendChild(heading);
    if (note) {
      container.insertAdjacentHTML('beforeend', note);
    }
    const body = document.createElement('div');
    body.classList.add('section-body');
    for (const name of sortedSettings) {
      body.appendChild(elementForSetting(namespace, name, settings[name]));
    }
    container.appendChild(body);
    return container;
  }
  sortSettings(namespace, settings) {
    return sortSettings(namespace, settings);
  }
  bindInputFields() {
    const disposables = Array.from(this.element.querySelectorAll('input[id]')).map(input => {
      let type = input.type;
      let name = type === 'radio' ? input.name : input.id;
      this.observe(name, value => {
        if (type === 'checkbox') {
          input.checked = value;
        } else if (type === 'radio') {
          input.checked = value === this.parseValue(atom.config.getSchema(name).type, input.value);
        } else {
          if (type === 'color') {
            if (value && value.toHexString && value.toHexString()) {
              value = value.toHexString();
            }
          }
          if (value) {
            input.value = value;
          }
        }
      });
      const changeHandler = () => {
        let value = input.value;
        if (type === 'checkbox') {
          value = input.checked;
        } else if (type === 'radio') {
          value = this.parseValue(atom.config.getSchema(name).type, value);
        } else {
          value = this.parseValue(type, value);
        }
        if (type === 'color') {
          // This is debounced since the color wheel fires lots of events
          // as you are dragging it around
          clearTimeout(this.colorDebounceTimeout);
          this.colorDebounceTimeout = setTimeout(() => {
            this.set(name, value);
          }, 100);
        } else {
          this.set(name, value);
        }
      };
      input.addEventListener('change', changeHandler);
      return new _atom.Disposable(() => input.removeEventListener('change', changeHandler));
    });
    return new _atom.CompositeDisposable(...disposables);
  }
  observe(name, callback) {
    let params = {
      sources: [atom.config.getUserConfigPath()]
    };
    if (this.options.scopeName != null) {
      params.scope = [this.options.scopeName];
    }
    this.disposables.add(atom.config.observe(name, params, callback));
  }
  isDefault(name) {
    let params = {
      sources: [atom.config.getUserConfigPath()]
    };
    if (this.options.scopeName != null) {
      params.scope = [this.options.scopeName];
    }
    let defaultValue = this.getDefault(name);
    let value = atom.config.get(name, params);
    return value == null || defaultValue === value;
  }
  getDefault(name) {
    let params = {
      excludeSources: [atom.config.getUserConfigPath()]
    };
    if (this.options.scopeName != null) {
      params.scope = [this.options.scopeName];
    }
    let defaultValue = atom.config.get(name, params);
    if (this.options.scopeName != null) {
      // If the unscoped default is the same as the scoped default, check the actual config.cson
      // to make sure that there isn't a non-default value that is overriding the scoped value
      // For example: the default editor.tabLength is 2, but if someone sets it to 4
      // the above check still returns 2 and not 4 for a scoped editor.tabLength,
      // because it bypasses config.cson.
      if (atom.config.get(name, {
        excludeSources: [atom.config.getUserConfigPath()]
      }) === defaultValue) {
        defaultValue = atom.config.get(name);
      }
    }
    return defaultValue;
  }
  set(name, value) {
    if (this.options.scopeName) {
      if (value === undefined) {
        atom.config.unset(name, {
          scopeSelector: this.options.scopeName
        });
        return true;
      } else {
        return atom.config.set(name, value, {
          scopeSelector: this.options.scopeName
        });
      }
    } else {
      return atom.config.set(name, value);
    }
  }
  setText(editor, name, type, value) {
    let stringValue;
    if (this.isDefault(name)) {
      stringValue = '';
    } else {
      stringValue = this.valueToString(value) || '';
    }
    if (stringValue === editor.getText() || _underscorePlus.default.isEqual(value, this.parseValue(type, editor.getText()))) {
      return;
    }
    editor.setText(stringValue);
    editor.moveToEndOfLine();
  }
  bindSelectFields() {
    const disposables = Array.from(this.element.querySelectorAll('select[id]')).map(select => {
      const name = select.id;
      this.observe(name, value => {
        select.value = value;
      });
      const changeHandler = () => {
        this.set(name, select.value);
      };
      select.addEventListener('change', changeHandler);
      return new _atom.Disposable(() => select.removeEventListener('change', changeHandler));
    });
    return new _atom.CompositeDisposable(...disposables);
  }
  bindEditors() {
    const disposables = Array.from(this.element.querySelectorAll('atom-text-editor')).map(editorElement => {
      let editor = editorElement.getModel();
      let name = editorElement.id;
      let type = editorElement.getAttribute('type');
      let defaultValue = this.valueToString(this.getDefault(name));
      if (defaultValue != null) {
        editor.setPlaceholderText(`Default: ${defaultValue}`);
      }
      const subscriptions = new _atom.CompositeDisposable();
      const focusHandler = () => {
        if (this.isDefault(name)) {
          editor.setText(this.valueToString(this.getDefault(name)) || '');
        }
      };
      editorElement.addEventListener('focus', focusHandler);
      subscriptions.add(new _atom.Disposable(() => editorElement.removeEventListener('focus', focusHandler)));
      const blurHandler = () => {
        if (this.isDefault(name)) {
          editor.setText('');
        }
      };
      editorElement.addEventListener('blur', blurHandler);
      subscriptions.add(new _atom.Disposable(() => editorElement.removeEventListener('blur', blurHandler)));
      this.observe(name, value => {
        this.setText(editor, name, type, value);
      });
      subscriptions.add(editor.onDidStopChanging(() => {
        const {
          minimum,
          maximum
        } = atom.config.getSchema(name);
        const value = this.parseValue(type, editor.getText());
        if (minimum != null && value < minimum) {
          this.set(name, minimum);
          this.setText(editor, name, type, minimum);
        } else if (maximum != null && value > maximum) {
          this.set(name, maximum);
          this.setText(editor, name, type, maximum);
        } else if (!this.set(name, value)) {
          this.setText(editor, name, type, atom.config.get(name));
        }
      }));
      return subscriptions;
    });
    return new _atom.CompositeDisposable(...disposables);
  }
  bindTooltips() {
    const disposables = Array.from(this.element.querySelectorAll('input[id], select[id], atom-text-editor[id]')).map(element => {
      const schema = atom.config.getSchema(element.id);
      let defaultValue = this.valueToString(this.getDefault(element.id));
      if (defaultValue != null) {
        if (schema.enum && _underscorePlus.default.findWhere(schema.enum, {
          value: defaultValue
        })) {
          defaultValue = _underscorePlus.default.findWhere(schema.enum, {
            value: defaultValue
          }).description;
        }
        return atom.tooltips.add(element, {
          title: `Default: ${defaultValue}`,
          delay: {
            show: 100
          },
          placement: 'auto left'
        });
      } else {
        return new _atom.Disposable(() => {}); // no-op
      }
    });

    return new _atom.CompositeDisposable(...disposables);
  }
  valueToString(value) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return null;
      }
      return value.map(val => val.toString().replace(/,/g, '\\,')).join(', ');
    } else if (value != null) {
      return value.toString();
    } else {
      return null;
    }
  }
  parseValue(type, value) {
    if (value === '') {
      return undefined;
    } else if (type === 'number') {
      let floatValue = parseFloat(value);
      if (isNaN(floatValue)) {
        return value;
      } else {
        return floatValue;
      }
    } else if (type === 'integer') {
      let intValue = parseInt(value);
      if (isNaN(intValue)) {
        return value;
      } else {
        return intValue;
      }
    } else if (type === 'array') {
      let arrayValue = (value || '').split(',');
      arrayValue = arrayValue.reduce((values, val) => {
        const last = values.length - 1;
        if (last >= 0 && values[last].endsWith('\\')) {
          values[last] = values[last].replace(/\\$/, ',') + val;
        } else {
          values.push(val);
        }
        return values;
      }, []);
      return arrayValue.filter(val => val).map(val => val.trim());
    } else {
      return value;
    }
  }
}

/*
 * Space Pen Helpers
 */
exports.default = SettingsPanel;
let isEditableArray = function (array) {
  for (let item of array) {
    if (!_underscorePlus.default.isString(item)) {
      return false;
    }
  }
  return true;
};
function sortSettings(namespace, settings) {
  return _underscorePlus.default.chain(settings).keys().sortBy(name => name).sortBy(name => {
    const schema = atom.config.getSchema(`${namespace}.${name}`);
    return schema ? schema.order : null;
  }).value();
}
function elementForSetting(namespace, name, value) {
  if (namespace === 'core') {
    if (name === 'themes') {
      return document.createDocumentFragment();
    } // Handled in the Themes panel
    if (name === 'disabledPackages') {
      return document.createDocumentFragment();
    } // Handled in the Packages panel
    if (name === 'customFileTypes') {
      return document.createDocumentFragment();
    }
    if (name === 'uriHandlerRegistration') {
      return document.createDocumentFragment();
    } // Handled in the URI Handler panel
  }

  if (namespace === 'editor') {
    // There's no global default for these, they are defined by language packages
    if (['commentStart', 'commentEnd', 'increaseIndentPattern', 'decreaseIndentPattern', 'foldEndPattern'].includes(name)) {
      return document.createDocumentFragment();
    }
  }
  const controlGroup = document.createElement('div');
  controlGroup.classList.add('control-group');
  const controls = document.createElement('div');
  controls.classList.add('controls');
  controlGroup.appendChild(controls);
  let schema = atom.config.getSchema(`${namespace}.${name}`);
  if (schema && schema.enum) {
    controls.appendChild(elementForOptions(namespace, name, value, {
      radio: schema.radio
    }));
  } else if (schema && schema.type === 'color') {
    controls.appendChild(elementForColor(namespace, name, value));
  } else if (_underscorePlus.default.isBoolean(value) || schema && schema.type === 'boolean') {
    controls.appendChild(elementForCheckbox(namespace, name, value));
  } else if (_underscorePlus.default.isArray(value) || schema && schema.type === 'array') {
    if (isEditableArray(value)) {
      controls.appendChild(elementForArray(namespace, name, value));
    }
  } else if (_underscorePlus.default.isObject(value) || schema && schema.type === 'object') {
    controls.appendChild(elementForObject(namespace, name, value));
  } else {
    controls.appendChild(elementForEditor(namespace, name, value));
  }
  return controlGroup;
}
function getSettingTitle(keyPath, name) {
  if (name == null) {
    name = '';
  }
  const schema = atom.config.getSchema(keyPath);
  const title = schema != null ? schema.title : null;
  return title || _underscorePlus.default.uncamelcase(name).split('.').map(_underscorePlus.default.capitalize).join(' ');
}
function elementForOptions(namespace, name, value, {
  radio = false
}) {
  let keyPath = `${namespace}.${name}`;
  let schema = atom.config.getSchema(keyPath);
  let options = schema && schema.enum ? schema.enum : [];
  const fragment = document.createDocumentFragment();
  const label = document.createElement('label');
  label.classList.add('control-label');
  const titleDiv = document.createElement('div');
  titleDiv.classList.add('setting-title');
  titleDiv.textContent = getSettingTitle(keyPath, name);
  label.appendChild(titleDiv);
  const descriptionDiv = document.createElement('div');
  descriptionDiv.classList.add('setting-description');
  descriptionDiv.innerHTML = (0, _richDescription.getSettingDescription)(keyPath);
  label.appendChild(descriptionDiv);
  fragment.appendChild(label);
  fragment.appendChild(enumOptions(options, {
    keyPath,
    radio
  }));
  return fragment;
}
function elementForCheckbox(namespace, name, value) {
  let keyPath = `${namespace}.${name}`;
  const div = document.createElement('div');
  div.classList.add('checkbox');
  const label = document.createElement('label');
  label.for = keyPath;
  const input = document.createElement('input');
  input.id = keyPath;
  input.type = 'checkbox';
  input.classList.add('input-checkbox');
  label.appendChild(input);
  const titleDiv = document.createElement('div');
  titleDiv.classList.add('setting-title');
  titleDiv.textContent = getSettingTitle(keyPath, name);
  label.appendChild(titleDiv);
  div.appendChild(label);
  const descriptionDiv = document.createElement('div');
  descriptionDiv.classList.add('setting-description');
  descriptionDiv.innerHTML = (0, _richDescription.getSettingDescription)(keyPath);
  div.appendChild(descriptionDiv);
  return div;
}
function elementForColor(namespace, name, value) {
  let keyPath = `${namespace}.${name}`;
  const div = document.createElement('div');
  div.classList.add('color');
  const label = document.createElement('label');
  label.for = keyPath;
  const input = document.createElement('input');
  input.id = keyPath;
  input.type = 'color';
  label.appendChild(input);
  const titleDiv = document.createElement('div');
  titleDiv.classList.add('setting-title');
  titleDiv.textContent = getSettingTitle(keyPath, name);
  label.appendChild(titleDiv);
  div.appendChild(label);
  const descriptionDiv = document.createElement('div');
  descriptionDiv.classList.add('setting-description');
  descriptionDiv.innerHTML = (0, _richDescription.getSettingDescription)(keyPath);
  div.appendChild(descriptionDiv);
  return div;
}
function elementForEditor(namespace, name, value) {
  let keyPath = `${namespace}.${name}`;
  let type = _underscorePlus.default.isNumber(value) ? 'number' : 'string';
  const fragment = document.createDocumentFragment();
  const label = document.createElement('label');
  label.classList.add('control-label');
  const titleDiv = document.createElement('div');
  titleDiv.classList.add('setting-title');
  titleDiv.textContent = getSettingTitle(keyPath, name);
  label.appendChild(titleDiv);
  const descriptionDiv = document.createElement('div');
  descriptionDiv.classList.add('setting-description');
  descriptionDiv.innerHTML = (0, _richDescription.getSettingDescription)(keyPath);
  label.appendChild(descriptionDiv);
  fragment.appendChild(label);
  const controls = document.createElement('div');
  controls.classList.add('controls');
  const editorContainer = document.createElement('div');
  editorContainer.classList.add('editor-container');
  const editor = new _atom.TextEditor({
    mini: true
  });
  editor.element.id = keyPath;
  editor.element.setAttribute('type', type);
  editorContainer.appendChild(editor.element);
  controls.appendChild(editorContainer);
  fragment.appendChild(controls);
  return fragment;
}
function elementForArray(namespace, name, value) {
  let keyPath = `${namespace}.${name}`;
  const fragment = document.createDocumentFragment();
  const label = document.createElement('label');
  label.classList.add('control-label');
  const titleDiv = document.createElement('div');
  titleDiv.classList.add('setting-title');
  titleDiv.textContent = getSettingTitle(keyPath, name);
  label.appendChild(titleDiv);
  const descriptionDiv = document.createElement('div');
  descriptionDiv.classList.add('setting-description');
  descriptionDiv.innerHTML = (0, _richDescription.getSettingDescription)(keyPath);
  label.appendChild(descriptionDiv);
  fragment.appendChild(label);
  const controls = document.createElement('div');
  controls.classList.add('controls');
  const editorContainer = document.createElement('div');
  editorContainer.classList.add('editor-container');
  const editor = new _atom.TextEditor({
    mini: true
  });
  editor.element.id = keyPath;
  editor.element.setAttribute('type', 'array');
  editorContainer.appendChild(editor.element);
  controls.appendChild(editorContainer);
  fragment.appendChild(controls);
  return fragment;
}
function elementForObject(namespace, name, value) {
  if (_underscorePlus.default.keys(value).length === 0) {
    return document.createDocumentFragment();
  } else {
    let keyPath = `${namespace}.${name}`;
    let schema = atom.config.getSchema(keyPath);
    let isCollapsed = schema.collapsed === true;
    const section = document.createElement('section');
    section.classList.add('sub-section');
    if (isCollapsed) {
      section.classList.add('collapsed');
    }
    const h3 = document.createElement('h3');
    h3.classList.add('sub-section-heading', 'has-items');
    h3.textContent = getSettingTitle(keyPath, name);
    section.appendChild(h3);
    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('setting-description');
    descriptionDiv.innerHTML = (0, _richDescription.getSettingDescription)(keyPath);
    section.appendChild(descriptionDiv);
    const div = document.createElement('div');
    div.classList.add('sub-section-body');
    for (const key of sortSettings(keyPath, value)) {
      div.appendChild(elementForSetting(namespace, `${name}.${key}`, value[key]));
    }
    section.appendChild(div);
    return section;
  }
}
function enumOptions(options, {
  keyPath,
  radio
}) {
  const containerTag = radio ? 'fieldset' : 'select';
  const container = document.createElement(containerTag);
  container.id = keyPath;
  const containerClass = radio ? 'input-radio-group' : 'form-control';
  container.classList.add(containerClass);
  const conversion = radio ? optionToRadio : optionToSelect;
  const optionElements = options.map(option => conversion(option, keyPath));
  for (const optionElement of optionElements) {
    container.appendChild(optionElement);
  }
  return container;
}
function optionToRadio(option, keyPath) {
  const button = document.createElement('input');
  const label = document.createElement('label');
  label.classList.add('input-label');
  let value;
  let description = '';
  if (option.hasOwnProperty('value')) {
    value = option.value;
    description = option.description;
  } else {
    value = option;
    description = option;
  }
  button.classList.add('input-radio');
  button.id = `${keyPath}[${value}]`;
  button.name = keyPath;
  button.type = 'radio';
  button.value = value;
  label.appendChild(button);
  label.appendChild(document.createTextNode(description));
  return label;
}
function optionToSelect(option, keyPath) {
  const optionElement = document.createElement('option');
  if (option.hasOwnProperty('value')) {
    optionElement.value = option.value;
    optionElement.textContent = option.description;
  } else {
    optionElement.value = option;
    optionElement.textContent = option;
  }
  return optionElement;
}
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTQ09QRURfU0VUVElOR1MiLCJTZXR0aW5nc1BhbmVsIiwiQ29sbGFwc2libGVTZWN0aW9uUGFuZWwiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJuYW1lc3BhY2UiLCJlbGVtZW50IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiZGlzcG9zYWJsZXMiLCJDb21wb3NpdGVEaXNwb3NhYmxlIiwic2V0dGluZ3MiLCJzY29wZU5hbWUiLCJuYW1lIiwiYXRvbSIsImNvbmZpZyIsImdldCIsInNjb3BlIiwiYXBwZW5kQ2hpbGQiLCJlbGVtZW50Rm9yU2V0dGluZ3MiLCJiaW5kSW5wdXRGaWVsZHMiLCJiaW5kU2VsZWN0RmllbGRzIiwiYmluZEVkaXRvcnMiLCJiaW5kVG9vbHRpcHMiLCJoYW5kbGVFdmVudHMiLCJkZXN0cm95IiwiZGlzcG9zZSIsInJlbW92ZSIsIl8iLCJpc0VtcHR5IiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsInRpdGxlIiwiaW5jbHVkZVRpdGxlIiwidW5kYXNoZXJpemUiLCJ1bmNhbWVsY2FzZSIsImljb24iLCJub3RlIiwic29ydGVkU2V0dGluZ3MiLCJzb3J0U2V0dGluZ3MiLCJjb250YWluZXIiLCJoZWFkaW5nIiwidGV4dENvbnRlbnQiLCJpbnNlcnRBZGphY2VudEhUTUwiLCJib2R5IiwiZWxlbWVudEZvclNldHRpbmciLCJBcnJheSIsImZyb20iLCJxdWVyeVNlbGVjdG9yQWxsIiwibWFwIiwiaW5wdXQiLCJ0eXBlIiwiaWQiLCJvYnNlcnZlIiwidmFsdWUiLCJjaGVja2VkIiwicGFyc2VWYWx1ZSIsImdldFNjaGVtYSIsInRvSGV4U3RyaW5nIiwiY2hhbmdlSGFuZGxlciIsImNsZWFyVGltZW91dCIsImNvbG9yRGVib3VuY2VUaW1lb3V0Iiwic2V0VGltZW91dCIsInNldCIsImFkZEV2ZW50TGlzdGVuZXIiLCJEaXNwb3NhYmxlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNhbGxiYWNrIiwicGFyYW1zIiwic291cmNlcyIsImdldFVzZXJDb25maWdQYXRoIiwiaXNEZWZhdWx0IiwiZGVmYXVsdFZhbHVlIiwiZ2V0RGVmYXVsdCIsImV4Y2x1ZGVTb3VyY2VzIiwidW5kZWZpbmVkIiwidW5zZXQiLCJzY29wZVNlbGVjdG9yIiwic2V0VGV4dCIsImVkaXRvciIsInN0cmluZ1ZhbHVlIiwidmFsdWVUb1N0cmluZyIsImdldFRleHQiLCJpc0VxdWFsIiwibW92ZVRvRW5kT2ZMaW5lIiwic2VsZWN0IiwiZWRpdG9yRWxlbWVudCIsImdldE1vZGVsIiwiZ2V0QXR0cmlidXRlIiwic2V0UGxhY2Vob2xkZXJUZXh0Iiwic3Vic2NyaXB0aW9ucyIsImZvY3VzSGFuZGxlciIsImJsdXJIYW5kbGVyIiwib25EaWRTdG9wQ2hhbmdpbmciLCJtaW5pbXVtIiwibWF4aW11bSIsInNjaGVtYSIsImVudW0iLCJmaW5kV2hlcmUiLCJkZXNjcmlwdGlvbiIsInRvb2x0aXBzIiwiZGVsYXkiLCJzaG93IiwicGxhY2VtZW50IiwiaXNBcnJheSIsImxlbmd0aCIsInZhbCIsInRvU3RyaW5nIiwicmVwbGFjZSIsImpvaW4iLCJmbG9hdFZhbHVlIiwicGFyc2VGbG9hdCIsImlzTmFOIiwiaW50VmFsdWUiLCJwYXJzZUludCIsImFycmF5VmFsdWUiLCJzcGxpdCIsInJlZHVjZSIsInZhbHVlcyIsImxhc3QiLCJlbmRzV2l0aCIsInB1c2giLCJmaWx0ZXIiLCJ0cmltIiwiaXNFZGl0YWJsZUFycmF5IiwiYXJyYXkiLCJpdGVtIiwiaXNTdHJpbmciLCJjaGFpbiIsImtleXMiLCJzb3J0QnkiLCJvcmRlciIsImluY2x1ZGVzIiwiY29udHJvbEdyb3VwIiwiY29udHJvbHMiLCJlbGVtZW50Rm9yT3B0aW9ucyIsInJhZGlvIiwiZWxlbWVudEZvckNvbG9yIiwiaXNCb29sZWFuIiwiZWxlbWVudEZvckNoZWNrYm94IiwiZWxlbWVudEZvckFycmF5IiwiaXNPYmplY3QiLCJlbGVtZW50Rm9yT2JqZWN0IiwiZWxlbWVudEZvckVkaXRvciIsImdldFNldHRpbmdUaXRsZSIsImtleVBhdGgiLCJjYXBpdGFsaXplIiwiZnJhZ21lbnQiLCJsYWJlbCIsInRpdGxlRGl2IiwiZGVzY3JpcHRpb25EaXYiLCJpbm5lckhUTUwiLCJnZXRTZXR0aW5nRGVzY3JpcHRpb24iLCJlbnVtT3B0aW9ucyIsImRpdiIsImZvciIsImlzTnVtYmVyIiwiZWRpdG9yQ29udGFpbmVyIiwiVGV4dEVkaXRvciIsIm1pbmkiLCJzZXRBdHRyaWJ1dGUiLCJpc0NvbGxhcHNlZCIsImNvbGxhcHNlZCIsInNlY3Rpb24iLCJoMyIsImtleSIsImNvbnRhaW5lclRhZyIsImNvbnRhaW5lckNsYXNzIiwiY29udmVyc2lvbiIsIm9wdGlvblRvUmFkaW8iLCJvcHRpb25Ub1NlbGVjdCIsIm9wdGlvbkVsZW1lbnRzIiwib3B0aW9uIiwib3B0aW9uRWxlbWVudCIsImJ1dHRvbiIsImhhc093blByb3BlcnR5IiwiY3JlYXRlVGV4dE5vZGUiXSwic291cmNlcyI6WyJzZXR0aW5ncy1wYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSwgVGV4dEVkaXRvcn0gZnJvbSAnYXRvbSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUtcGx1cydcbmltcG9ydCBDb2xsYXBzaWJsZVNlY3Rpb25QYW5lbCBmcm9tICcuL2NvbGxhcHNpYmxlLXNlY3Rpb24tcGFuZWwnXG5pbXBvcnQge2dldFNldHRpbmdEZXNjcmlwdGlvbn0gZnJvbSAnLi9yaWNoLWRlc2NyaXB0aW9uJ1xuXG5jb25zdCBTQ09QRURfU0VUVElOR1MgPSBbXG4gICdhdXRvSW5kZW50JyxcbiAgJ2F1dG9JbmRlbnRPblBhc3RlJyxcbiAgJ2ludmlzaWJsZXMnLFxuICAnbm9uV29yZENoYXJhY3RlcnMnLFxuICAncHJlZmVycmVkTGluZUxlbmd0aCcsXG4gICdzY3JvbGxQYXN0RW5kJyxcbiAgJ3Nob3dJbmRlbnRHdWlkZScsXG4gICdzaG93SW52aXNpYmxlcycsXG4gICdzb2Z0V3JhcCcsXG4gICdzb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCcsXG4gICdzb2Z0V3JhcEhhbmdpbmdJbmRlbnQnLFxuICAndGFiTGVuZ3RoJyxcbiAgJ3RhYlR5cGUnXG5dXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNldHRpbmdzUGFuZWwgZXh0ZW5kcyBDb2xsYXBzaWJsZVNlY3Rpb25QYW5lbCB7XG4gIGNvbnN0cnVjdG9yIChvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpXG4gICAgbGV0IG5hbWVzcGFjZSA9IG9wdGlvbnMubmFtZXNwYWNlXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3NlY3Rpb24nLCAnc2V0dGluZ3MtcGFuZWwnKVxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIGxldCBzZXR0aW5nc1xuICAgIGlmICh0aGlzLm9wdGlvbnMuc2NvcGVOYW1lKSB7XG4gICAgICBuYW1lc3BhY2UgPSAnZWRpdG9yJ1xuICAgICAgc2V0dGluZ3MgPSB7fVxuICAgICAgZm9yIChjb25zdCBuYW1lIG9mIFNDT1BFRF9TRVRUSU5HUykge1xuICAgICAgICBzZXR0aW5nc1tuYW1lXSA9IGF0b20uY29uZmlnLmdldChuYW1lLCB7c2NvcGU6IFt0aGlzLm9wdGlvbnMuc2NvcGVOYW1lXX0pXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldHRpbmdzID0gYXRvbS5jb25maWcuZ2V0KG5hbWVzcGFjZSlcbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Rm9yU2V0dGluZ3MobmFtZXNwYWNlLCBzZXR0aW5ncykpXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0aGlzLmJpbmRJbnB1dEZpZWxkcygpKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuYmluZFNlbGVjdEZpZWxkcygpKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuYmluZEVkaXRvcnMoKSlcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0aGlzLmJpbmRUb29sdGlwcygpKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuaGFuZGxlRXZlbnRzKCkpXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuICB9XG5cbiAgZWxlbWVudEZvclNldHRpbmdzIChuYW1lc3BhY2UsIHNldHRpbmdzKSB7XG4gICAgaWYgKF8uaXNFbXB0eShzZXR0aW5ncykpIHtcbiAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcbiAgICB9XG5cbiAgICBsZXQge3RpdGxlfSA9IHRoaXMub3B0aW9uc1xuICAgIGNvbnN0IGluY2x1ZGVUaXRsZSA9IHRoaXMub3B0aW9ucy5pbmNsdWRlVGl0bGUgIT0gbnVsbCA/IHRoaXMub3B0aW9ucy5pbmNsdWRlVGl0bGUgOiB0cnVlXG4gICAgaWYgKGluY2x1ZGVUaXRsZSkge1xuICAgICAgaWYgKHRpdGxlID09IG51bGwpIHtcbiAgICAgICAgdGl0bGUgPSBgJHtfLnVuZGFzaGVyaXplKF8udW5jYW1lbGNhc2UobmFtZXNwYWNlKSl9IFNldHRpbmdzYFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGl0bGUgPT0gbnVsbCkge1xuICAgICAgICB0aXRsZSA9ICdTZXR0aW5ncydcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpY29uID0gdGhpcy5vcHRpb25zLmljb24gIT0gbnVsbCA/IHRoaXMub3B0aW9ucy5pY29uIDogJ2dlYXInXG4gICAgY29uc3Qge25vdGV9ID0gdGhpcy5vcHRpb25zXG4gICAgY29uc3Qgc29ydGVkU2V0dGluZ3MgPSB0aGlzLnNvcnRTZXR0aW5ncyhuYW1lc3BhY2UsIHNldHRpbmdzKVxuXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc2VjdGlvbi1jb250YWluZXInKVxuXG4gICAgY29uc3QgaGVhZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgaGVhZGluZy5jbGFzc0xpc3QuYWRkKCdibG9jaycsICdzZWN0aW9uLWhlYWRpbmcnLCAnaWNvbicsIGBpY29uLSR7aWNvbn1gKVxuICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSB0aXRsZVxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChoZWFkaW5nKVxuXG4gICAgaWYgKG5vdGUpIHtcbiAgICAgIGNvbnRhaW5lci5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG5vdGUpXG4gICAgfVxuXG4gICAgY29uc3QgYm9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgYm9keS5jbGFzc0xpc3QuYWRkKCdzZWN0aW9uLWJvZHknKVxuICAgIGZvciAoY29uc3QgbmFtZSBvZiBzb3J0ZWRTZXR0aW5ncykge1xuICAgICAgYm9keS5hcHBlbmRDaGlsZChlbGVtZW50Rm9yU2V0dGluZyhuYW1lc3BhY2UsIG5hbWUsIHNldHRpbmdzW25hbWVdKSlcbiAgICB9XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJvZHkpXG5cbiAgICByZXR1cm4gY29udGFpbmVyXG4gIH1cblxuICBzb3J0U2V0dGluZ3MgKG5hbWVzcGFjZSwgc2V0dGluZ3MpIHtcbiAgICByZXR1cm4gc29ydFNldHRpbmdzKG5hbWVzcGFjZSwgc2V0dGluZ3MpXG4gIH1cblxuICBiaW5kSW5wdXRGaWVsZHMgKCkge1xuICAgIGNvbnN0IGRpc3Bvc2FibGVzID0gQXJyYXkuZnJvbSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbaWRdJykpLm1hcCgoaW5wdXQpID0+IHtcbiAgICAgIGxldCB0eXBlID0gaW5wdXQudHlwZVxuICAgICAgbGV0IG5hbWUgPSB0eXBlID09PSAncmFkaW8nID8gaW5wdXQubmFtZSA6IGlucHV0LmlkXG5cbiAgICAgIHRoaXMub2JzZXJ2ZShuYW1lLCAodmFsdWUpID0+IHtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdjaGVja2JveCcpIHtcbiAgICAgICAgICBpbnB1dC5jaGVja2VkID0gdmFsdWVcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAncmFkaW8nKSB7XG4gICAgICAgICAgaW5wdXQuY2hlY2tlZCA9ICh2YWx1ZSA9PT0gdGhpcy5wYXJzZVZhbHVlKGF0b20uY29uZmlnLmdldFNjaGVtYShuYW1lKS50eXBlLCBpbnB1dC52YWx1ZSkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdjb2xvcicpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS50b0hleFN0cmluZyAmJiB2YWx1ZS50b0hleFN0cmluZygpKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9IZXhTdHJpbmcoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgaW5wdXQudmFsdWUgPSB2YWx1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgY29uc3QgY2hhbmdlSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgbGV0IHZhbHVlID0gaW5wdXQudmFsdWVcbiAgICAgICAgaWYgKHR5cGUgPT09ICdjaGVja2JveCcpIHtcbiAgICAgICAgICB2YWx1ZSA9IGlucHV0LmNoZWNrZWRcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAncmFkaW8nKSB7XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLnBhcnNlVmFsdWUoYXRvbS5jb25maWcuZ2V0U2NoZW1hKG5hbWUpLnR5cGUsIHZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gdGhpcy5wYXJzZVZhbHVlKHR5cGUsIHZhbHVlKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdjb2xvcicpIHtcbiAgICAgICAgICAvLyBUaGlzIGlzIGRlYm91bmNlZCBzaW5jZSB0aGUgY29sb3Igd2hlZWwgZmlyZXMgbG90cyBvZiBldmVudHNcbiAgICAgICAgICAvLyBhcyB5b3UgYXJlIGRyYWdnaW5nIGl0IGFyb3VuZFxuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmNvbG9yRGVib3VuY2VUaW1lb3V0KVxuICAgICAgICAgIHRoaXMuY29sb3JEZWJvdW5jZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHsgdGhpcy5zZXQobmFtZSwgdmFsdWUpIH0sIDEwMClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNldChuYW1lLCB2YWx1ZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBjaGFuZ2VIYW5kbGVyKVxuICAgICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IGlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGNoYW5nZUhhbmRsZXIpKVxuICAgIH0pXG5cbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoLi4uZGlzcG9zYWJsZXMpXG4gIH1cblxuICBvYnNlcnZlIChuYW1lLCBjYWxsYmFjaykge1xuICAgIGxldCBwYXJhbXMgPSB7c291cmNlczogW2F0b20uY29uZmlnLmdldFVzZXJDb25maWdQYXRoKCldfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2NvcGVOYW1lICE9IG51bGwpIHtcbiAgICAgIHBhcmFtcy5zY29wZSA9IFt0aGlzLm9wdGlvbnMuc2NvcGVOYW1lXVxuICAgIH1cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKG5hbWUsIHBhcmFtcywgY2FsbGJhY2spKVxuICB9XG5cbiAgaXNEZWZhdWx0IChuYW1lKSB7XG4gICAgbGV0IHBhcmFtcyA9IHtzb3VyY2VzOiBbYXRvbS5jb25maWcuZ2V0VXNlckNvbmZpZ1BhdGgoKV19XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zY29wZU5hbWUgIT0gbnVsbCkge1xuICAgICAgcGFyYW1zLnNjb3BlID0gW3RoaXMub3B0aW9ucy5zY29wZU5hbWVdXG4gICAgfVxuICAgIGxldCBkZWZhdWx0VmFsdWUgPSB0aGlzLmdldERlZmF1bHQobmFtZSlcbiAgICBsZXQgdmFsdWUgPSBhdG9tLmNvbmZpZy5nZXQobmFtZSwgcGFyYW1zKVxuICAgIHJldHVybiAodmFsdWUgPT0gbnVsbCkgfHwgKGRlZmF1bHRWYWx1ZSA9PT0gdmFsdWUpXG4gIH1cblxuICBnZXREZWZhdWx0IChuYW1lKSB7XG4gICAgbGV0IHBhcmFtcyA9IHtleGNsdWRlU291cmNlczogW2F0b20uY29uZmlnLmdldFVzZXJDb25maWdQYXRoKCldfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2NvcGVOYW1lICE9IG51bGwpIHtcbiAgICAgIHBhcmFtcy5zY29wZSA9IFt0aGlzLm9wdGlvbnMuc2NvcGVOYW1lXVxuICAgIH1cblxuICAgIGxldCBkZWZhdWx0VmFsdWUgPSBhdG9tLmNvbmZpZy5nZXQobmFtZSwgcGFyYW1zKVxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2NvcGVOYW1lICE9IG51bGwpIHtcbiAgICAgIC8vIElmIHRoZSB1bnNjb3BlZCBkZWZhdWx0IGlzIHRoZSBzYW1lIGFzIHRoZSBzY29wZWQgZGVmYXVsdCwgY2hlY2sgdGhlIGFjdHVhbCBjb25maWcuY3NvblxuICAgICAgLy8gdG8gbWFrZSBzdXJlIHRoYXQgdGhlcmUgaXNuJ3QgYSBub24tZGVmYXVsdCB2YWx1ZSB0aGF0IGlzIG92ZXJyaWRpbmcgdGhlIHNjb3BlZCB2YWx1ZVxuICAgICAgLy8gRm9yIGV4YW1wbGU6IHRoZSBkZWZhdWx0IGVkaXRvci50YWJMZW5ndGggaXMgMiwgYnV0IGlmIHNvbWVvbmUgc2V0cyBpdCB0byA0XG4gICAgICAvLyB0aGUgYWJvdmUgY2hlY2sgc3RpbGwgcmV0dXJucyAyIGFuZCBub3QgNCBmb3IgYSBzY29wZWQgZWRpdG9yLnRhYkxlbmd0aCxcbiAgICAgIC8vIGJlY2F1c2UgaXQgYnlwYXNzZXMgY29uZmlnLmNzb24uXG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KG5hbWUsIHtleGNsdWRlU291cmNlczogW2F0b20uY29uZmlnLmdldFVzZXJDb25maWdQYXRoKCldfSkgPT09IGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICBkZWZhdWx0VmFsdWUgPSBhdG9tLmNvbmZpZy5nZXQobmFtZSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICB9XG5cbiAgc2V0IChuYW1lLCB2YWx1ZSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuc2NvcGVOYW1lKSB7XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhdG9tLmNvbmZpZy51bnNldChuYW1lLCB7c2NvcGVTZWxlY3RvcjogdGhpcy5vcHRpb25zLnNjb3BlTmFtZX0pXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYXRvbS5jb25maWcuc2V0KG5hbWUsIHZhbHVlLCB7c2NvcGVTZWxlY3RvcjogdGhpcy5vcHRpb25zLnNjb3BlTmFtZX0pXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhdG9tLmNvbmZpZy5zZXQobmFtZSwgdmFsdWUpXG4gICAgfVxuICB9XG5cbiAgc2V0VGV4dCAoZWRpdG9yLCBuYW1lLCB0eXBlLCB2YWx1ZSkge1xuICAgIGxldCBzdHJpbmdWYWx1ZVxuICAgIGlmICh0aGlzLmlzRGVmYXVsdChuYW1lKSkge1xuICAgICAgc3RyaW5nVmFsdWUgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJpbmdWYWx1ZSA9IHRoaXMudmFsdWVUb1N0cmluZyh2YWx1ZSkgfHwgJydcbiAgICB9XG5cbiAgICBpZiAoc3RyaW5nVmFsdWUgPT09IGVkaXRvci5nZXRUZXh0KCkgfHwgXy5pc0VxdWFsKHZhbHVlLCB0aGlzLnBhcnNlVmFsdWUodHlwZSwgZWRpdG9yLmdldFRleHQoKSkpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBlZGl0b3Iuc2V0VGV4dChzdHJpbmdWYWx1ZSlcbiAgICBlZGl0b3IubW92ZVRvRW5kT2ZMaW5lKClcbiAgfVxuXG4gIGJpbmRTZWxlY3RGaWVsZHMgKCkge1xuICAgIGNvbnN0IGRpc3Bvc2FibGVzID0gQXJyYXkuZnJvbSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2VsZWN0W2lkXScpKS5tYXAoKHNlbGVjdCkgPT4ge1xuICAgICAgY29uc3QgbmFtZSA9IHNlbGVjdC5pZFxuICAgICAgdGhpcy5vYnNlcnZlKG5hbWUsIHZhbHVlID0+IHsgc2VsZWN0LnZhbHVlID0gdmFsdWUgfSlcbiAgICAgIGNvbnN0IGNoYW5nZUhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0KG5hbWUsIHNlbGVjdC52YWx1ZSlcbiAgICAgIH1cbiAgICAgIHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBjaGFuZ2VIYW5kbGVyKVxuICAgICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHNlbGVjdC5yZW1vdmVFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBjaGFuZ2VIYW5kbGVyKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKC4uLmRpc3Bvc2FibGVzKVxuICB9XG5cbiAgYmluZEVkaXRvcnMgKCkge1xuICAgIGNvbnN0IGRpc3Bvc2FibGVzID0gQXJyYXkuZnJvbSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYXRvbS10ZXh0LWVkaXRvcicpKS5tYXAoKGVkaXRvckVsZW1lbnQpID0+IHtcbiAgICAgIGxldCBlZGl0b3IgPSBlZGl0b3JFbGVtZW50LmdldE1vZGVsKClcbiAgICAgIGxldCBuYW1lID0gZWRpdG9yRWxlbWVudC5pZFxuICAgICAgbGV0IHR5cGUgPSBlZGl0b3JFbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpXG4gICAgICBsZXQgZGVmYXVsdFZhbHVlID0gdGhpcy52YWx1ZVRvU3RyaW5nKHRoaXMuZ2V0RGVmYXVsdChuYW1lKSlcblxuICAgICAgaWYgKGRlZmF1bHRWYWx1ZSAhPSBudWxsKSB7XG4gICAgICAgIGVkaXRvci5zZXRQbGFjZWhvbGRlclRleHQoYERlZmF1bHQ6ICR7ZGVmYXVsdFZhbHVlfWApXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICAgIGNvbnN0IGZvY3VzSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaXNEZWZhdWx0KG5hbWUpKSB7XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQodGhpcy52YWx1ZVRvU3RyaW5nKHRoaXMuZ2V0RGVmYXVsdChuYW1lKSkgfHwgJycpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBmb2N1c0hhbmRsZXIpXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgZm9jdXNIYW5kbGVyKSkpXG5cbiAgICAgIGNvbnN0IGJsdXJIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5pc0RlZmF1bHQobmFtZSkpIHtcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgYmx1ckhhbmRsZXIpXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCBibHVySGFuZGxlcikpKVxuXG4gICAgICB0aGlzLm9ic2VydmUobmFtZSwgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0VGV4dChlZGl0b3IsIG5hbWUsIHR5cGUsIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nKCgpID0+IHtcbiAgICAgICAgY29uc3Qge21pbmltdW0sIG1heGltdW19ID0gYXRvbS5jb25maWcuZ2V0U2NoZW1hKG5hbWUpXG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5wYXJzZVZhbHVlKHR5cGUsIGVkaXRvci5nZXRUZXh0KCkpXG4gICAgICAgIGlmIChtaW5pbXVtICE9IG51bGwgJiYgdmFsdWUgPCBtaW5pbXVtKSB7XG4gICAgICAgICAgdGhpcy5zZXQobmFtZSwgbWluaW11bSlcbiAgICAgICAgICB0aGlzLnNldFRleHQoZWRpdG9yLCBuYW1lLCB0eXBlLCBtaW5pbXVtKVxuICAgICAgICB9IGVsc2UgaWYgKG1heGltdW0gIT0gbnVsbCAmJiB2YWx1ZSA+IG1heGltdW0pIHtcbiAgICAgICAgICB0aGlzLnNldChuYW1lLCBtYXhpbXVtKVxuICAgICAgICAgIHRoaXMuc2V0VGV4dChlZGl0b3IsIG5hbWUsIHR5cGUsIG1heGltdW0pXG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc2V0KG5hbWUsIHZhbHVlKSkge1xuICAgICAgICAgIHRoaXMuc2V0VGV4dChlZGl0b3IsIG5hbWUsIHR5cGUsIGF0b20uY29uZmlnLmdldChuYW1lKSlcbiAgICAgICAgfVxuICAgICAgfSkpXG5cbiAgICAgIHJldHVybiBzdWJzY3JpcHRpb25zXG4gICAgfSlcblxuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSguLi5kaXNwb3NhYmxlcylcbiAgfVxuXG4gIGJpbmRUb29sdGlwcyAoKSB7XG4gICAgY29uc3QgZGlzcG9zYWJsZXMgPSBBcnJheS5mcm9tKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtpZF0sIHNlbGVjdFtpZF0sIGF0b20tdGV4dC1lZGl0b3JbaWRdJykpLm1hcCgoZWxlbWVudCkgPT4ge1xuICAgICAgY29uc3Qgc2NoZW1hID0gYXRvbS5jb25maWcuZ2V0U2NoZW1hKGVsZW1lbnQuaWQpXG4gICAgICBsZXQgZGVmYXVsdFZhbHVlID0gdGhpcy52YWx1ZVRvU3RyaW5nKHRoaXMuZ2V0RGVmYXVsdChlbGVtZW50LmlkKSlcbiAgICAgIGlmIChkZWZhdWx0VmFsdWUgIT0gbnVsbCkge1xuICAgICAgICBpZiAoc2NoZW1hLmVudW0gJiYgXy5maW5kV2hlcmUoc2NoZW1hLmVudW0sIHt2YWx1ZTogZGVmYXVsdFZhbHVlfSkpIHtcbiAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBfLmZpbmRXaGVyZShzY2hlbWEuZW51bSwge3ZhbHVlOiBkZWZhdWx0VmFsdWV9KS5kZXNjcmlwdGlvblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhdG9tLnRvb2x0aXBzLmFkZChlbGVtZW50LCB7XG4gICAgICAgICAgdGl0bGU6IGBEZWZhdWx0OiAke2RlZmF1bHRWYWx1ZX1gLFxuICAgICAgICAgIGRlbGF5OiB7c2hvdzogMTAwfSxcbiAgICAgICAgICBwbGFjZW1lbnQ6ICdhdXRvIGxlZnQnXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge30pIC8vIG5vLW9wXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSguLi5kaXNwb3NhYmxlcylcbiAgfVxuXG4gIHZhbHVlVG9TdHJpbmcgKHZhbHVlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWUubWFwKCh2YWwpID0+IHZhbC50b1N0cmluZygpLnJlcGxhY2UoLywvZywgJ1xcXFwsJykpLmpvaW4oJywgJylcbiAgICB9IGVsc2UgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgcGFyc2VWYWx1ZSAodHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgbGV0IGZsb2F0VmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKVxuICAgICAgaWYgKGlzTmFOKGZsb2F0VmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZsb2F0VmFsdWVcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdpbnRlZ2VyJykge1xuICAgICAgbGV0IGludFZhbHVlID0gcGFyc2VJbnQodmFsdWUpXG4gICAgICBpZiAoaXNOYU4oaW50VmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGludFZhbHVlXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnYXJyYXknKSB7XG4gICAgICBsZXQgYXJyYXlWYWx1ZSA9ICh2YWx1ZSB8fCAnJykuc3BsaXQoJywnKVxuICAgICAgYXJyYXlWYWx1ZSA9IGFycmF5VmFsdWUucmVkdWNlKCh2YWx1ZXMsIHZhbCkgPT4ge1xuICAgICAgICBjb25zdCBsYXN0ID0gdmFsdWVzLmxlbmd0aCAtIDFcbiAgICAgICAgaWYgKGxhc3QgPj0gMCAmJiB2YWx1ZXNbbGFzdF0uZW5kc1dpdGgoJ1xcXFwnKSkge1xuICAgICAgICAgIHZhbHVlc1tsYXN0XSA9IHZhbHVlc1tsYXN0XS5yZXBsYWNlKC9cXFxcJC8sICcsJykgKyB2YWxcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZXMucHVzaCh2YWwpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlc1xuICAgICAgfSwgW10pXG4gICAgICByZXR1cm4gYXJyYXlWYWx1ZS5maWx0ZXIoKHZhbCkgPT4gdmFsKS5tYXAoKHZhbCkgPT4gdmFsLnRyaW0oKSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICB9XG59XG5cbi8qXG4gKiBTcGFjZSBQZW4gSGVscGVyc1xuICovXG5cbmxldCBpc0VkaXRhYmxlQXJyYXkgPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgZm9yIChsZXQgaXRlbSBvZiBhcnJheSkge1xuICAgIGlmICghXy5pc1N0cmluZyhpdGVtKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHNvcnRTZXR0aW5ncyAobmFtZXNwYWNlLCBzZXR0aW5ncykge1xuICByZXR1cm4gXy5jaGFpbihzZXR0aW5ncylcbiAgICAua2V5cygpXG4gICAgLnNvcnRCeSgobmFtZSkgPT4gbmFtZSlcbiAgICAuc29ydEJ5KChuYW1lKSA9PiB7XG4gICAgICBjb25zdCBzY2hlbWEgPSBhdG9tLmNvbmZpZy5nZXRTY2hlbWEoYCR7bmFtZXNwYWNlfS4ke25hbWV9YClcbiAgICAgIHJldHVybiBzY2hlbWEgPyBzY2hlbWEub3JkZXIgOiBudWxsXG4gICAgfSlcbiAgICAudmFsdWUoKVxufVxuXG5mdW5jdGlvbiBlbGVtZW50Rm9yU2V0dGluZyAobmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSkge1xuICBpZiAobmFtZXNwYWNlID09PSAnY29yZScpIHtcbiAgICBpZiAobmFtZSA9PT0gJ3RoZW1lcycpIHsgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSB9IC8vIEhhbmRsZWQgaW4gdGhlIFRoZW1lcyBwYW5lbFxuICAgIGlmIChuYW1lID09PSAnZGlzYWJsZWRQYWNrYWdlcycpIHsgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSB9IC8vIEhhbmRsZWQgaW4gdGhlIFBhY2thZ2VzIHBhbmVsXG4gICAgaWYgKG5hbWUgPT09ICdjdXN0b21GaWxlVHlwZXMnKSB7IHJldHVybiBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCkgfVxuICAgIGlmIChuYW1lID09PSAndXJpSGFuZGxlclJlZ2lzdHJhdGlvbicpIHsgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSB9IC8vIEhhbmRsZWQgaW4gdGhlIFVSSSBIYW5kbGVyIHBhbmVsXG4gIH1cblxuICBpZiAobmFtZXNwYWNlID09PSAnZWRpdG9yJykge1xuICAgIC8vIFRoZXJlJ3Mgbm8gZ2xvYmFsIGRlZmF1bHQgZm9yIHRoZXNlLCB0aGV5IGFyZSBkZWZpbmVkIGJ5IGxhbmd1YWdlIHBhY2thZ2VzXG4gICAgaWYgKFsnY29tbWVudFN0YXJ0JywgJ2NvbW1lbnRFbmQnLCAnaW5jcmVhc2VJbmRlbnRQYXR0ZXJuJywgJ2RlY3JlYXNlSW5kZW50UGF0dGVybicsICdmb2xkRW5kUGF0dGVybiddLmluY2x1ZGVzKG5hbWUpKSB7XG4gICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgY29udHJvbEdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgY29udHJvbEdyb3VwLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtZ3JvdXAnKVxuXG4gIGNvbnN0IGNvbnRyb2xzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgY29udHJvbHMuY2xhc3NMaXN0LmFkZCgnY29udHJvbHMnKVxuICBjb250cm9sR3JvdXAuYXBwZW5kQ2hpbGQoY29udHJvbHMpXG5cbiAgbGV0IHNjaGVtYSA9IGF0b20uY29uZmlnLmdldFNjaGVtYShgJHtuYW1lc3BhY2V9LiR7bmFtZX1gKVxuICBpZiAoc2NoZW1hICYmIHNjaGVtYS5lbnVtKSB7XG4gICAgY29udHJvbHMuYXBwZW5kQ2hpbGQoZWxlbWVudEZvck9wdGlvbnMobmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSwge3JhZGlvOiBzY2hlbWEucmFkaW99KSlcbiAgfSBlbHNlIGlmIChzY2hlbWEgJiYgc2NoZW1hLnR5cGUgPT09ICdjb2xvcicpIHtcbiAgICBjb250cm9scy5hcHBlbmRDaGlsZChlbGVtZW50Rm9yQ29sb3IobmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSkpXG4gIH0gZWxzZSBpZiAoXy5pc0Jvb2xlYW4odmFsdWUpIHx8IChzY2hlbWEgJiYgc2NoZW1hLnR5cGUgPT09ICdib29sZWFuJykpIHtcbiAgICBjb250cm9scy5hcHBlbmRDaGlsZChlbGVtZW50Rm9yQ2hlY2tib3gobmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSkpXG4gIH0gZWxzZSBpZiAoXy5pc0FycmF5KHZhbHVlKSB8fCAoc2NoZW1hICYmIHNjaGVtYS50eXBlID09PSAnYXJyYXknKSkge1xuICAgIGlmIChpc0VkaXRhYmxlQXJyYXkodmFsdWUpKSB7XG4gICAgICBjb250cm9scy5hcHBlbmRDaGlsZChlbGVtZW50Rm9yQXJyYXkobmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSkpXG4gICAgfVxuICB9IGVsc2UgaWYgKF8uaXNPYmplY3QodmFsdWUpIHx8IChzY2hlbWEgJiYgc2NoZW1hLnR5cGUgPT09ICdvYmplY3QnKSkge1xuICAgIGNvbnRyb2xzLmFwcGVuZENoaWxkKGVsZW1lbnRGb3JPYmplY3QobmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSkpXG4gIH0gZWxzZSB7XG4gICAgY29udHJvbHMuYXBwZW5kQ2hpbGQoZWxlbWVudEZvckVkaXRvcihuYW1lc3BhY2UsIG5hbWUsIHZhbHVlKSlcbiAgfVxuXG4gIHJldHVybiBjb250cm9sR3JvdXBcbn1cblxuZnVuY3Rpb24gZ2V0U2V0dGluZ1RpdGxlIChrZXlQYXRoLCBuYW1lKSB7XG4gIGlmIChuYW1lID09IG51bGwpIHtcbiAgICBuYW1lID0gJydcbiAgfVxuICBjb25zdCBzY2hlbWEgPSBhdG9tLmNvbmZpZy5nZXRTY2hlbWEoa2V5UGF0aClcbiAgY29uc3QgdGl0bGUgPSBzY2hlbWEgIT0gbnVsbCA/IHNjaGVtYS50aXRsZSA6IG51bGxcbiAgcmV0dXJuIHRpdGxlIHx8IF8udW5jYW1lbGNhc2UobmFtZSkuc3BsaXQoJy4nKS5tYXAoXy5jYXBpdGFsaXplKS5qb2luKCcgJylcbn1cblxuZnVuY3Rpb24gZWxlbWVudEZvck9wdGlvbnMgKG5hbWVzcGFjZSwgbmFtZSwgdmFsdWUsIHtyYWRpbyA9IGZhbHNlfSkge1xuICBsZXQga2V5UGF0aCA9IGAke25hbWVzcGFjZX0uJHtuYW1lfWBcbiAgbGV0IHNjaGVtYSA9IGF0b20uY29uZmlnLmdldFNjaGVtYShrZXlQYXRoKVxuICBsZXQgb3B0aW9ucyA9IChzY2hlbWEgJiYgc2NoZW1hLmVudW0pID8gc2NoZW1hLmVudW0gOiBbXVxuXG4gIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cbiAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpXG4gIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtbGFiZWwnKVxuXG4gIGNvbnN0IHRpdGxlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgdGl0bGVEaXYuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy10aXRsZScpXG4gIHRpdGxlRGl2LnRleHRDb250ZW50ID0gZ2V0U2V0dGluZ1RpdGxlKGtleVBhdGgsIG5hbWUpXG4gIGxhYmVsLmFwcGVuZENoaWxkKHRpdGxlRGl2KVxuXG4gIGNvbnN0IGRlc2NyaXB0aW9uRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZGVzY3JpcHRpb25EaXYuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy1kZXNjcmlwdGlvbicpXG4gIGRlc2NyaXB0aW9uRGl2LmlubmVySFRNTCA9IGdldFNldHRpbmdEZXNjcmlwdGlvbihrZXlQYXRoKVxuICBsYWJlbC5hcHBlbmRDaGlsZChkZXNjcmlwdGlvbkRpdilcblxuICBmcmFnbWVudC5hcHBlbmRDaGlsZChsYWJlbClcbiAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZW51bU9wdGlvbnMob3B0aW9ucywge2tleVBhdGgsIHJhZGlvfSkpXG5cbiAgcmV0dXJuIGZyYWdtZW50XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRGb3JDaGVja2JveCAobmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSkge1xuICBsZXQga2V5UGF0aCA9IGAke25hbWVzcGFjZX0uJHtuYW1lfWBcblxuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBkaXYuY2xhc3NMaXN0LmFkZCgnY2hlY2tib3gnKVxuXG4gIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKVxuICBsYWJlbC5mb3IgPSBrZXlQYXRoXG5cbiAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpXG4gIGlucHV0LmlkID0ga2V5UGF0aFxuICBpbnB1dC50eXBlID0gJ2NoZWNrYm94J1xuICBpbnB1dC5jbGFzc0xpc3QuYWRkKCdpbnB1dC1jaGVja2JveCcpXG4gIGxhYmVsLmFwcGVuZENoaWxkKGlucHV0KVxuXG4gIGNvbnN0IHRpdGxlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgdGl0bGVEaXYuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy10aXRsZScpXG4gIHRpdGxlRGl2LnRleHRDb250ZW50ID0gZ2V0U2V0dGluZ1RpdGxlKGtleVBhdGgsIG5hbWUpXG4gIGxhYmVsLmFwcGVuZENoaWxkKHRpdGxlRGl2KVxuICBkaXYuYXBwZW5kQ2hpbGQobGFiZWwpXG5cbiAgY29uc3QgZGVzY3JpcHRpb25EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBkZXNjcmlwdGlvbkRpdi5jbGFzc0xpc3QuYWRkKCdzZXR0aW5nLWRlc2NyaXB0aW9uJylcbiAgZGVzY3JpcHRpb25EaXYuaW5uZXJIVE1MID0gZ2V0U2V0dGluZ0Rlc2NyaXB0aW9uKGtleVBhdGgpXG4gIGRpdi5hcHBlbmRDaGlsZChkZXNjcmlwdGlvbkRpdilcblxuICByZXR1cm4gZGl2XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRGb3JDb2xvciAobmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSkge1xuICBsZXQga2V5UGF0aCA9IGAke25hbWVzcGFjZX0uJHtuYW1lfWBcblxuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBkaXYuY2xhc3NMaXN0LmFkZCgnY29sb3InKVxuXG4gIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKVxuICBsYWJlbC5mb3IgPSBrZXlQYXRoXG5cbiAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpXG4gIGlucHV0LmlkID0ga2V5UGF0aFxuICBpbnB1dC50eXBlID0gJ2NvbG9yJ1xuICBsYWJlbC5hcHBlbmRDaGlsZChpbnB1dClcblxuICBjb25zdCB0aXRsZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHRpdGxlRGl2LmNsYXNzTGlzdC5hZGQoJ3NldHRpbmctdGl0bGUnKVxuICB0aXRsZURpdi50ZXh0Q29udGVudCA9IGdldFNldHRpbmdUaXRsZShrZXlQYXRoLCBuYW1lKVxuICBsYWJlbC5hcHBlbmRDaGlsZCh0aXRsZURpdilcbiAgZGl2LmFwcGVuZENoaWxkKGxhYmVsKVxuXG4gIGNvbnN0IGRlc2NyaXB0aW9uRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZGVzY3JpcHRpb25EaXYuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy1kZXNjcmlwdGlvbicpXG4gIGRlc2NyaXB0aW9uRGl2LmlubmVySFRNTCA9IGdldFNldHRpbmdEZXNjcmlwdGlvbihrZXlQYXRoKVxuICBkaXYuYXBwZW5kQ2hpbGQoZGVzY3JpcHRpb25EaXYpXG5cbiAgcmV0dXJuIGRpdlxufVxuXG5mdW5jdGlvbiBlbGVtZW50Rm9yRWRpdG9yIChuYW1lc3BhY2UsIG5hbWUsIHZhbHVlKSB7XG4gIGxldCBrZXlQYXRoID0gYCR7bmFtZXNwYWNlfS4ke25hbWV9YFxuICBsZXQgdHlwZSA9IF8uaXNOdW1iZXIodmFsdWUpID8gJ251bWJlcicgOiAnc3RyaW5nJ1xuXG4gIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cbiAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpXG4gIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtbGFiZWwnKVxuXG4gIGNvbnN0IHRpdGxlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgdGl0bGVEaXYuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy10aXRsZScpXG4gIHRpdGxlRGl2LnRleHRDb250ZW50ID0gZ2V0U2V0dGluZ1RpdGxlKGtleVBhdGgsIG5hbWUpXG4gIGxhYmVsLmFwcGVuZENoaWxkKHRpdGxlRGl2KVxuXG4gIGNvbnN0IGRlc2NyaXB0aW9uRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZGVzY3JpcHRpb25EaXYuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy1kZXNjcmlwdGlvbicpXG4gIGRlc2NyaXB0aW9uRGl2LmlubmVySFRNTCA9IGdldFNldHRpbmdEZXNjcmlwdGlvbihrZXlQYXRoKVxuICBsYWJlbC5hcHBlbmRDaGlsZChkZXNjcmlwdGlvbkRpdilcbiAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQobGFiZWwpXG5cbiAgY29uc3QgY29udHJvbHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBjb250cm9scy5jbGFzc0xpc3QuYWRkKCdjb250cm9scycpXG5cbiAgY29uc3QgZWRpdG9yQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZWRpdG9yQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2VkaXRvci1jb250YWluZXInKVxuXG4gIGNvbnN0IGVkaXRvciA9IG5ldyBUZXh0RWRpdG9yKHttaW5pOiB0cnVlfSlcbiAgZWRpdG9yLmVsZW1lbnQuaWQgPSBrZXlQYXRoXG4gIGVkaXRvci5lbGVtZW50LnNldEF0dHJpYnV0ZSgndHlwZScsIHR5cGUpXG4gIGVkaXRvckNvbnRhaW5lci5hcHBlbmRDaGlsZChlZGl0b3IuZWxlbWVudClcbiAgY29udHJvbHMuYXBwZW5kQ2hpbGQoZWRpdG9yQ29udGFpbmVyKVxuICBmcmFnbWVudC5hcHBlbmRDaGlsZChjb250cm9scylcblxuICByZXR1cm4gZnJhZ21lbnRcbn1cblxuZnVuY3Rpb24gZWxlbWVudEZvckFycmF5IChuYW1lc3BhY2UsIG5hbWUsIHZhbHVlKSB7XG4gIGxldCBrZXlQYXRoID0gYCR7bmFtZXNwYWNlfS4ke25hbWV9YFxuXG4gIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cbiAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpXG4gIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtbGFiZWwnKVxuXG4gIGNvbnN0IHRpdGxlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgdGl0bGVEaXYuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy10aXRsZScpXG4gIHRpdGxlRGl2LnRleHRDb250ZW50ID0gZ2V0U2V0dGluZ1RpdGxlKGtleVBhdGgsIG5hbWUpXG4gIGxhYmVsLmFwcGVuZENoaWxkKHRpdGxlRGl2KVxuXG4gIGNvbnN0IGRlc2NyaXB0aW9uRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZGVzY3JpcHRpb25EaXYuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy1kZXNjcmlwdGlvbicpXG4gIGRlc2NyaXB0aW9uRGl2LmlubmVySFRNTCA9IGdldFNldHRpbmdEZXNjcmlwdGlvbihrZXlQYXRoKVxuICBsYWJlbC5hcHBlbmRDaGlsZChkZXNjcmlwdGlvbkRpdilcbiAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQobGFiZWwpXG5cbiAgY29uc3QgY29udHJvbHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBjb250cm9scy5jbGFzc0xpc3QuYWRkKCdjb250cm9scycpXG5cbiAgY29uc3QgZWRpdG9yQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZWRpdG9yQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2VkaXRvci1jb250YWluZXInKVxuXG4gIGNvbnN0IGVkaXRvciA9IG5ldyBUZXh0RWRpdG9yKHttaW5pOiB0cnVlfSlcbiAgZWRpdG9yLmVsZW1lbnQuaWQgPSBrZXlQYXRoXG4gIGVkaXRvci5lbGVtZW50LnNldEF0dHJpYnV0ZSgndHlwZScsICdhcnJheScpXG4gIGVkaXRvckNvbnRhaW5lci5hcHBlbmRDaGlsZChlZGl0b3IuZWxlbWVudClcbiAgY29udHJvbHMuYXBwZW5kQ2hpbGQoZWRpdG9yQ29udGFpbmVyKVxuICBmcmFnbWVudC5hcHBlbmRDaGlsZChjb250cm9scylcblxuICByZXR1cm4gZnJhZ21lbnRcbn1cblxuZnVuY3Rpb24gZWxlbWVudEZvck9iamVjdCAobmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSkge1xuICBpZiAoXy5rZXlzKHZhbHVlKS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG4gIH0gZWxzZSB7XG4gICAgbGV0IGtleVBhdGggPSBgJHtuYW1lc3BhY2V9LiR7bmFtZX1gXG4gICAgbGV0IHNjaGVtYSA9IGF0b20uY29uZmlnLmdldFNjaGVtYShrZXlQYXRoKVxuICAgIGxldCBpc0NvbGxhcHNlZCA9IHNjaGVtYS5jb2xsYXBzZWQgPT09IHRydWVcblxuICAgIGNvbnN0IHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJylcbiAgICBzZWN0aW9uLmNsYXNzTGlzdC5hZGQoJ3N1Yi1zZWN0aW9uJylcbiAgICBpZiAoaXNDb2xsYXBzZWQpIHtcbiAgICAgIHNlY3Rpb24uY2xhc3NMaXN0LmFkZCgnY29sbGFwc2VkJylcbiAgICB9XG5cbiAgICBjb25zdCBoMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJylcbiAgICBoMy5jbGFzc0xpc3QuYWRkKCdzdWItc2VjdGlvbi1oZWFkaW5nJywgJ2hhcy1pdGVtcycpXG4gICAgaDMudGV4dENvbnRlbnQgPSBnZXRTZXR0aW5nVGl0bGUoa2V5UGF0aCwgbmFtZSlcbiAgICBzZWN0aW9uLmFwcGVuZENoaWxkKGgzKVxuXG4gICAgY29uc3QgZGVzY3JpcHRpb25EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRlc2NyaXB0aW9uRGl2LmNsYXNzTGlzdC5hZGQoJ3NldHRpbmctZGVzY3JpcHRpb24nKVxuICAgIGRlc2NyaXB0aW9uRGl2LmlubmVySFRNTCA9IGdldFNldHRpbmdEZXNjcmlwdGlvbihrZXlQYXRoKVxuICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoZGVzY3JpcHRpb25EaXYpXG5cbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRpdi5jbGFzc0xpc3QuYWRkKCdzdWItc2VjdGlvbi1ib2R5JylcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBzb3J0U2V0dGluZ3Moa2V5UGF0aCwgdmFsdWUpKSB7XG4gICAgICBkaXYuYXBwZW5kQ2hpbGQoZWxlbWVudEZvclNldHRpbmcobmFtZXNwYWNlLCBgJHtuYW1lfS4ke2tleX1gLCB2YWx1ZVtrZXldKSlcbiAgICB9XG4gICAgc2VjdGlvbi5hcHBlbmRDaGlsZChkaXYpXG5cbiAgICByZXR1cm4gc2VjdGlvblxuICB9XG59XG5cbmZ1bmN0aW9uIGVudW1PcHRpb25zIChvcHRpb25zLCB7a2V5UGF0aCwgcmFkaW99KSB7XG4gIGNvbnN0IGNvbnRhaW5lclRhZyA9IHJhZGlvID8gJ2ZpZWxkc2V0JyA6ICdzZWxlY3QnXG4gIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoY29udGFpbmVyVGFnKVxuICBjb250YWluZXIuaWQgPSBrZXlQYXRoXG4gIGNvbnN0IGNvbnRhaW5lckNsYXNzID0gcmFkaW8gPyAnaW5wdXQtcmFkaW8tZ3JvdXAnIDogJ2Zvcm0tY29udHJvbCdcbiAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoY29udGFpbmVyQ2xhc3MpXG5cbiAgY29uc3QgY29udmVyc2lvbiA9IHJhZGlvID8gb3B0aW9uVG9SYWRpbyA6IG9wdGlvblRvU2VsZWN0XG4gIGNvbnN0IG9wdGlvbkVsZW1lbnRzID0gb3B0aW9ucy5tYXAob3B0aW9uID0+IGNvbnZlcnNpb24ob3B0aW9uLCBrZXlQYXRoKSlcblxuICBmb3IgKGNvbnN0IG9wdGlvbkVsZW1lbnQgb2Ygb3B0aW9uRWxlbWVudHMpIHsgY29udGFpbmVyLmFwcGVuZENoaWxkKG9wdGlvbkVsZW1lbnQpIH1cblxuICByZXR1cm4gY29udGFpbmVyXG59XG5cbmZ1bmN0aW9uIG9wdGlvblRvUmFkaW8gKG9wdGlvbiwga2V5UGF0aCkge1xuICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpXG4gIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKVxuICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdpbnB1dC1sYWJlbCcpXG4gIGxldCB2YWx1ZVxuICBsZXQgZGVzY3JpcHRpb24gPSAnJ1xuICBpZiAob3B0aW9uLmhhc093blByb3BlcnR5KCd2YWx1ZScpKSB7XG4gICAgdmFsdWUgPSBvcHRpb24udmFsdWVcbiAgICBkZXNjcmlwdGlvbiA9IG9wdGlvbi5kZXNjcmlwdGlvblxuICB9IGVsc2Uge1xuICAgIHZhbHVlID0gb3B0aW9uXG4gICAgZGVzY3JpcHRpb24gPSBvcHRpb25cbiAgfVxuICBidXR0b24uY2xhc3NMaXN0LmFkZCgnaW5wdXQtcmFkaW8nKVxuICBidXR0b24uaWQgPSBgJHtrZXlQYXRofVske3ZhbHVlfV1gXG4gIGJ1dHRvbi5uYW1lID0ga2V5UGF0aFxuICBidXR0b24udHlwZSA9ICdyYWRpbydcbiAgYnV0dG9uLnZhbHVlID0gdmFsdWVcbiAgbGFiZWwuYXBwZW5kQ2hpbGQoYnV0dG9uKVxuICBsYWJlbC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkZXNjcmlwdGlvbikpXG4gIHJldHVybiBsYWJlbFxufVxuXG5mdW5jdGlvbiBvcHRpb25Ub1NlbGVjdCAob3B0aW9uLCBrZXlQYXRoKSB7XG4gIGNvbnN0IG9wdGlvbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKVxuICBpZiAob3B0aW9uLmhhc093blByb3BlcnR5KCd2YWx1ZScpKSB7XG4gICAgb3B0aW9uRWxlbWVudC52YWx1ZSA9IG9wdGlvbi52YWx1ZVxuICAgIG9wdGlvbkVsZW1lbnQudGV4dENvbnRlbnQgPSBvcHRpb24uZGVzY3JpcHRpb25cbiAgfSBlbHNlIHtcbiAgICBvcHRpb25FbGVtZW50LnZhbHVlID0gb3B0aW9uXG4gICAgb3B0aW9uRWxlbWVudC50ZXh0Q29udGVudCA9IG9wdGlvblxuICB9XG4gIHJldHVybiBvcHRpb25FbGVtZW50XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQXdEO0FBTHhEOztBQU9BLE1BQU1BLGVBQWUsR0FBRyxDQUN0QixZQUFZLEVBQ1osbUJBQW1CLEVBQ25CLFlBQVksRUFDWixtQkFBbUIsRUFDbkIscUJBQXFCLEVBQ3JCLGVBQWUsRUFDZixpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLFVBQVUsRUFDViwrQkFBK0IsRUFDL0IsdUJBQXVCLEVBQ3ZCLFdBQVcsRUFDWCxTQUFTLENBQ1Y7QUFF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