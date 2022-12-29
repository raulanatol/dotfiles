"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _marked = require("marked");
var _dompurify = _interopRequireDefault(require("dompurify"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** @babel */

function sanitize(html, readmeSrc) {
  const temporaryContainer = document.createElement('div');
  temporaryContainer.innerHTML = html;
  for (const checkbox of temporaryContainer.querySelectorAll('input[type="checkbox"]')) {
    checkbox.setAttribute('disabled', '');
  }
  let path = require('path');
  for (const image of temporaryContainer.querySelectorAll('img')) {
    let imageSrc = image.getAttribute('src');
    let changeImageSrc = true;

    // If src contains a protocol then it must be absolute
    if (/^(?:[a-z]+:)?\/\//i.test(imageSrc)) {
      changeImageSrc = false;
    }

    // If src contains a base64 encoded image it must be left unchanged
    if (/^data:image\/.*;base64/i.test(imageSrc)) {
      changeImageSrc = false;
    }

    // If path is absolute on file system it must be a local file, e.g. emoji
    if (path.isAbsolute(imageSrc)) {
      changeImageSrc = false;
    }

    // If imageSrc needs changing and readmeSrc isn't undefined (i.e. if package was unpublished)
    if (changeImageSrc && readmeSrc) {
      if (path.isAbsolute(readmeSrc)) {
        // If repoUrl is a local path (i.e. package is installed)
        image.setAttribute('src', path.join(readmeSrc, imageSrc));
      } else {
        // If repoUrl is a URL (i.e. package isn't installed)
        image.setAttribute('src', new URL(imageSrc, readmeSrc));
      }
    }
  }
  return (0, _dompurify.default)().sanitize(temporaryContainer.innerHTML);
}

// Displays the readme for a package, if it has one
// TODO Decide to keep this or current button-to-new-tab view
class PackageReadmeView {
  constructor(readme, readmeSrc) {
    this.element = document.createElement('section');
    this.element.classList.add('section');
    const container = document.createElement('div');
    container.classList.add('section-container');
    const heading = document.createElement('div');
    heading.classList.add('section-heading', 'icon', 'icon-book');
    heading.textContent = 'README';
    container.appendChild(heading);
    this.packageReadme = document.createElement('div');
    this.packageReadme.classList.add('package-readme', 'native-key-bindings');
    this.packageReadme.tabIndex = -1;
    container.appendChild(this.packageReadme);
    this.element.appendChild(container);
    (0, _marked.marked)(readme || '### No README.', {
      breaks: false
    }, (err, content) => {
      if (err) {
        this.packageReadme.innerHTML = '<h3>Error parsing README</h3>';
      } else {
        this.packageReadme.innerHTML = sanitize(content, readmeSrc);
      }
    });
  }
  destroy() {
    this.element.remove();
  }
}
exports.default = PackageReadmeView;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzYW5pdGl6ZSIsImh0bWwiLCJyZWFkbWVTcmMiLCJ0ZW1wb3JhcnlDb250YWluZXIiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJjaGVja2JveCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJzZXRBdHRyaWJ1dGUiLCJwYXRoIiwicmVxdWlyZSIsImltYWdlIiwiaW1hZ2VTcmMiLCJnZXRBdHRyaWJ1dGUiLCJjaGFuZ2VJbWFnZVNyYyIsInRlc3QiLCJpc0Fic29sdXRlIiwiam9pbiIsIlVSTCIsImNyZWF0ZURPTVB1cmlmeSIsIlBhY2thZ2VSZWFkbWVWaWV3IiwiY29uc3RydWN0b3IiLCJyZWFkbWUiLCJlbGVtZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiY29udGFpbmVyIiwiaGVhZGluZyIsInRleHRDb250ZW50IiwiYXBwZW5kQ2hpbGQiLCJwYWNrYWdlUmVhZG1lIiwidGFiSW5kZXgiLCJtYXJrZWQiLCJicmVha3MiLCJlcnIiLCJjb250ZW50IiwiZGVzdHJveSIsInJlbW92ZSJdLCJzb3VyY2VzIjpbInBhY2thZ2UtcmVhZG1lLXZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG5pbXBvcnQge21hcmtlZH0gZnJvbSAnbWFya2VkJ1xuaW1wb3J0IGNyZWF0ZURPTVB1cmlmeSBmcm9tICdkb21wdXJpZnknXG5cbmZ1bmN0aW9uIHNhbml0aXplIChodG1sLCByZWFkbWVTcmMpIHtcbiAgY29uc3QgdGVtcG9yYXJ5Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgdGVtcG9yYXJ5Q29udGFpbmVyLmlubmVySFRNTCA9IGh0bWxcblxuICBmb3IgKGNvbnN0IGNoZWNrYm94IG9mIHRlbXBvcmFyeUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSkge1xuICAgIGNoZWNrYm94LnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnJylcbiAgfVxuXG4gIGxldCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbiAgZm9yIChjb25zdCBpbWFnZSBvZiB0ZW1wb3JhcnlDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnaW1nJykpIHtcbiAgICBsZXQgaW1hZ2VTcmMgPSBpbWFnZS5nZXRBdHRyaWJ1dGUoJ3NyYycpXG5cbiAgICBsZXQgY2hhbmdlSW1hZ2VTcmMgPSB0cnVlXG5cbiAgICAvLyBJZiBzcmMgY29udGFpbnMgYSBwcm90b2NvbCB0aGVuIGl0IG11c3QgYmUgYWJzb2x1dGVcbiAgICBpZiAoL14oPzpbYS16XSs6KT9cXC9cXC8vaS50ZXN0KGltYWdlU3JjKSkge1xuICAgICAgY2hhbmdlSW1hZ2VTcmMgPSBmYWxzZVxuICAgIH1cblxuICAgIC8vIElmIHNyYyBjb250YWlucyBhIGJhc2U2NCBlbmNvZGVkIGltYWdlIGl0IG11c3QgYmUgbGVmdCB1bmNoYW5nZWRcbiAgICBpZiAoL15kYXRhOmltYWdlXFwvLio7YmFzZTY0L2kudGVzdChpbWFnZVNyYykpIHtcbiAgICAgIGNoYW5nZUltYWdlU3JjID0gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBJZiBwYXRoIGlzIGFic29sdXRlIG9uIGZpbGUgc3lzdGVtIGl0IG11c3QgYmUgYSBsb2NhbCBmaWxlLCBlLmcuIGVtb2ppXG4gICAgaWYgKHBhdGguaXNBYnNvbHV0ZShpbWFnZVNyYykpIHtcbiAgICAgIGNoYW5nZUltYWdlU3JjID0gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBJZiBpbWFnZVNyYyBuZWVkcyBjaGFuZ2luZyBhbmQgcmVhZG1lU3JjIGlzbid0IHVuZGVmaW5lZCAoaS5lLiBpZiBwYWNrYWdlIHdhcyB1bnB1Ymxpc2hlZClcbiAgICBpZiAoY2hhbmdlSW1hZ2VTcmMgJiYgcmVhZG1lU3JjKSB7XG4gICAgICBpZiAocGF0aC5pc0Fic29sdXRlKHJlYWRtZVNyYykpIHtcbiAgICAgICAgLy8gSWYgcmVwb1VybCBpcyBhIGxvY2FsIHBhdGggKGkuZS4gcGFja2FnZSBpcyBpbnN0YWxsZWQpXG4gICAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSgnc3JjJywgcGF0aC5qb2luKHJlYWRtZVNyYywgaW1hZ2VTcmMpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgcmVwb1VybCBpcyBhIFVSTCAoaS5lLiBwYWNrYWdlIGlzbid0IGluc3RhbGxlZClcbiAgICAgICAgaW1hZ2Uuc2V0QXR0cmlidXRlKCdzcmMnLCBuZXcgVVJMKGltYWdlU3JjLCByZWFkbWVTcmMpKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjcmVhdGVET01QdXJpZnkoKS5zYW5pdGl6ZSh0ZW1wb3JhcnlDb250YWluZXIuaW5uZXJIVE1MKVxufVxuXG4vLyBEaXNwbGF5cyB0aGUgcmVhZG1lIGZvciBhIHBhY2thZ2UsIGlmIGl0IGhhcyBvbmVcbi8vIFRPRE8gRGVjaWRlIHRvIGtlZXAgdGhpcyBvciBjdXJyZW50IGJ1dHRvbi10by1uZXctdGFiIHZpZXdcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhY2thZ2VSZWFkbWVWaWV3IHtcbiAgY29uc3RydWN0b3IgKHJlYWRtZSwgcmVhZG1lU3JjKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3NlY3Rpb24nKVxuXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc2VjdGlvbi1jb250YWluZXInKVxuXG4gICAgY29uc3QgaGVhZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgaGVhZGluZy5jbGFzc0xpc3QuYWRkKCdzZWN0aW9uLWhlYWRpbmcnLCAnaWNvbicsICdpY29uLWJvb2snKVxuICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSAnUkVBRE1FJ1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChoZWFkaW5nKVxuXG4gICAgdGhpcy5wYWNrYWdlUmVhZG1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLnBhY2thZ2VSZWFkbWUuY2xhc3NMaXN0LmFkZCgncGFja2FnZS1yZWFkbWUnLCAnbmF0aXZlLWtleS1iaW5kaW5ncycpXG4gICAgdGhpcy5wYWNrYWdlUmVhZG1lLnRhYkluZGV4ID0gLTFcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5wYWNrYWdlUmVhZG1lKVxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChjb250YWluZXIpXG5cbiAgICBtYXJrZWQocmVhZG1lIHx8ICcjIyMgTm8gUkVBRE1FLicsIHticmVha3M6IGZhbHNlfSwgKGVyciwgY29udGVudCkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICB0aGlzLnBhY2thZ2VSZWFkbWUuaW5uZXJIVE1MID0gJzxoMz5FcnJvciBwYXJzaW5nIFJFQURNRTwvaDM+J1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wYWNrYWdlUmVhZG1lLmlubmVySFRNTCA9IHNhbml0aXplKGNvbnRlbnQsIHJlYWRtZVNyYylcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpXG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUE7QUFDQTtBQUF1QztBQUh2Qzs7QUFLQSxTQUFTQSxRQUFRLENBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFO0VBQ2xDLE1BQU1DLGtCQUFrQixHQUFHQyxRQUFRLENBQUNDLGFBQWEsQ0FBQyxLQUFLLENBQUM7RUFDeERGLGtCQUFrQixDQUFDRyxTQUFTLEdBQUdMLElBQUk7RUFFbkMsS0FBSyxNQUFNTSxRQUFRLElBQUlKLGtCQUFrQixDQUFDSyxnQkFBZ0IsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO0lBQ3BGRCxRQUFRLENBQUNFLFlBQVksQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO0VBQ3ZDO0VB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