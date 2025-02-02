(function() {
  var BufferedProcess, DEV_PACKAGE_PATH, fs, os, path, semver,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  os = require('os');

  fs = require('fs');

  path = require('path');

  semver = require('semver');

  BufferedProcess = require('atom').BufferedProcess;


  /*
  A collection of methods for retrieving information about the user's system for
  bug report purposes.
   */

  DEV_PACKAGE_PATH = path.join('dev', 'packages');

  module.exports = {

    /*
    Section: System Information
     */
    getPlatform: function() {
      return os.platform();
    },
    getOSVersion: function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          switch (_this.getPlatform()) {
            case 'darwin':
              return resolve(_this.macVersionText());
            case 'win32':
              return resolve(_this.winVersionText());
            case 'linux':
              return resolve(_this.linuxVersionText());
            default:
              return resolve((os.platform()) + " " + (os.release()));
          }
        };
      })(this));
    },
    macVersionText: function() {
      return this.macVersionInfo().then(function(info) {
        if (!(info.ProductName && info.ProductVersion)) {
          return 'Unknown macOS version';
        }
        return info.ProductName + " " + info.ProductVersion;
      });
    },
    macVersionInfo: function() {
      return new Promise(function(resolve, reject) {
        var plistBuddy, stdout;
        stdout = '';
        plistBuddy = new BufferedProcess({
          command: '/usr/libexec/PlistBuddy',
          args: ['-c', 'Print ProductVersion', '-c', 'Print ProductName', '/System/Library/CoreServices/SystemVersion.plist'],
          stdout: function(output) {
            return stdout += output;
          },
          exit: function() {
            var ProductName, ProductVersion, ref;
            ref = stdout.trim().split('\n'), ProductVersion = ref[0], ProductName = ref[1];
            return resolve({
              ProductVersion: ProductVersion,
              ProductName: ProductName
            });
          }
        });
        return plistBuddy.onWillThrowError(function(arg) {
          var handle;
          handle = arg.handle;
          handle();
          return resolve({});
        });
      });
    },
    linuxVersionText: function() {
      return this.linuxVersionInfo().then(function(info) {
        if (info.DistroName && info.DistroVersion) {
          return info.DistroName + " " + info.DistroVersion;
        } else {
          return (os.platform()) + " " + (os.release());
        }
      });
    },
    linuxVersionInfo: function() {
      return new Promise(function(resolve, reject) {
        var lsbRelease, stdout;
        stdout = '';
        lsbRelease = new BufferedProcess({
          command: 'lsb_release',
          args: ['-ds'],
          stdout: function(output) {
            return stdout += output;
          },
          exit: function(exitCode) {
            var DistroName, DistroVersion, ref;
            ref = stdout.trim().split(' '), DistroName = ref[0], DistroVersion = ref[1];
            return resolve({
              DistroName: DistroName,
              DistroVersion: DistroVersion
            });
          }
        });
        return lsbRelease.onWillThrowError(function(arg) {
          var handle;
          handle = arg.handle;
          handle();
          return resolve({});
        });
      });
    },
    winVersionText: function() {
      return new Promise(function(resolve, reject) {
        var data, systemInfo;
        data = [];
        systemInfo = new BufferedProcess({
          command: 'systeminfo',
          stdout: function(oneLine) {
            return data.push(oneLine);
          },
          exit: function() {
            var info, res;
            info = data.join('\n');
            info = (res = /OS.Name.\s+(.*)$/im.exec(info)) ? res[1] : 'Unknown Windows version';
            return resolve(info);
          }
        });
        return systemInfo.onWillThrowError(function(arg) {
          var handle;
          handle = arg.handle;
          handle();
          return resolve('Unknown Windows version');
        });
      });
    },

    /*
    Section: Installed Packages
     */
    getNonCorePackages: function() {
      return new Promise(function(resolve, reject) {
        var devPackageNames, nonCorePackages, pack;
        nonCorePackages = atom.packages.getAvailablePackageMetadata().filter(function(p) {
          return !atom.packages.isBundledPackage(p.name);
        });
        devPackageNames = atom.packages.getAvailablePackagePaths().filter(function(p) {
          return p.includes(DEV_PACKAGE_PATH);
        }).map(function(p) {
          return path.basename(p);
        });
        return resolve((function() {
          var i, len, ref, results;
          results = [];
          for (i = 0, len = nonCorePackages.length; i < len; i++) {
            pack = nonCorePackages[i];
            results.push(pack.name + " " + pack.version + " " + ((ref = pack.name, indexOf.call(devPackageNames, ref) >= 0) ? '(dev)' : ''));
          }
          return results;
        })());
      });
    },
    getLatestAtomData: function() {
      var githubHeaders;
      githubHeaders = new Headers({
        accept: 'application/vnd.github.v3+json',
        contentType: "application/json"
      });
      return fetch('https://atom.io/api/updates', {
        headers: githubHeaders
      }).then(function(r) {
        if (r.ok) {
          return r.json();
        } else {
          return Promise.reject(r.statusCode);
        }
      });
    },
    checkAtomUpToDate: function() {
      return this.getLatestAtomData().then(function(latestAtomData) {
        var installedVersion, latestVersion, ref, upToDate;
        installedVersion = (ref = atom.getVersion()) != null ? ref.replace(/-.*$/, '') : void 0;
        latestVersion = latestAtomData.name;
        upToDate = (installedVersion != null) && semver.gte(installedVersion, latestVersion);
        return {
          upToDate: upToDate,
          latestVersion: latestVersion,
          installedVersion: installedVersion
        };
      });
    },
    getPackageVersion: function(packageName) {
      var pack;
      pack = atom.packages.getLoadedPackage(packageName);
      return pack != null ? pack.metadata.version : void 0;
    },
    getPackageVersionShippedWithAtom: function(packageName) {
      return require(path.join(atom.getLoadSettings().resourcePath, 'package.json')).packageDependencies[packageName];
    },
    getLatestPackageData: function(packageName) {
      var githubHeaders;
      githubHeaders = new Headers({
        accept: 'application/vnd.github.v3+json',
        contentType: "application/json"
      });
      return fetch("https://atom.io/api/packages/" + packageName, {
        headers: githubHeaders
      }).then(function(r) {
        if (r.ok) {
          return r.json();
        } else {
          return Promise.reject(r.statusCode);
        }
      });
    },
    checkPackageUpToDate: function(packageName) {
      return this.getLatestPackageData(packageName).then((function(_this) {
        return function(latestPackageData) {
          var installedVersion, isCore, latestVersion, upToDate, versionShippedWithAtom;
          installedVersion = _this.getPackageVersion(packageName);
          upToDate = (installedVersion != null) && semver.gte(installedVersion, latestPackageData.releases.latest);
          latestVersion = latestPackageData.releases.latest;
          versionShippedWithAtom = _this.getPackageVersionShippedWithAtom(packageName);
          if (isCore = versionShippedWithAtom != null) {
            upToDate = (installedVersion != null) && semver.gte(installedVersion, versionShippedWithAtom);
          }
          return {
            isCore: isCore,
            upToDate: upToDate,
            latestVersion: latestVersion,
            installedVersion: installedVersion,
            versionShippedWithAtom: versionShippedWithAtom
          };
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvbm90aWZpY2F0aW9ucy9saWIvdXNlci11dGlsaXRpZXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1REFBQTtJQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDUixrQkFBbUIsT0FBQSxDQUFRLE1BQVI7OztBQUVwQjs7Ozs7RUFLQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVYsRUFBaUIsVUFBakI7O0VBRW5CLE1BQU0sQ0FBQyxPQUFQLEdBRUU7O0FBQUE7OztJQUlBLFdBQUEsRUFBYSxTQUFBO2FBQ1gsRUFBRSxDQUFDLFFBQUgsQ0FBQTtJQURXLENBSmI7SUFRQSxZQUFBLEVBQWMsU0FBQTthQUNaLElBQUksT0FBSixDQUFZLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNWLGtCQUFPLEtBQUMsQ0FBQSxXQUFELENBQUEsQ0FBUDtBQUFBLGlCQUNPLFFBRFA7cUJBQ3FCLE9BQUEsQ0FBUSxLQUFDLENBQUEsY0FBRCxDQUFBLENBQVI7QUFEckIsaUJBRU8sT0FGUDtxQkFFb0IsT0FBQSxDQUFRLEtBQUMsQ0FBQSxjQUFELENBQUEsQ0FBUjtBQUZwQixpQkFHTyxPQUhQO3FCQUdvQixPQUFBLENBQVEsS0FBQyxDQUFBLGdCQUFELENBQUEsQ0FBUjtBQUhwQjtxQkFJTyxPQUFBLENBQVUsQ0FBQyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUQsQ0FBQSxHQUFlLEdBQWYsR0FBaUIsQ0FBQyxFQUFFLENBQUMsT0FB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aUJBQWlCLENBQUMsUUFBUSxDQUFDO1VBQzNDLHNCQUFBLEdBQXlCLEtBQUMsQ0FBQSxnQ0FBRCxDQUFrQyxXQUFsQztVQUV6QixJQUFHLE1BQUEsR0FBUyw4QkFBWjtZQUtFLFFBQUEsR0FBVywwQkFBQSxJQUFzQixNQUFNLENBQUMsR0FBUCxDQUFXLGdCQUFYLEVBQTZCLHNCQUE3QixFQUxuQzs7aUJBT0E7WUFBQyxRQUFBLE1BQUQ7WUFBUyxVQUFBLFFBQVQ7WUFBbUIsZUFBQSxhQUFuQjtZQUFrQyxrQkFBQSxnQkFBbEM7WUFBb0Qsd0JBQUEsc0JBQXBEOztRQWJzQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEM7SUFEb0IsQ0F4SHRCOztBQWZGIiwic291cmNlc0NvbnRlbnQiOlsib3MgPSByZXF1aXJlICdvcydcbmZzID0gcmVxdWlyZSAnZnMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbnNlbXZlciA9IHJlcXVpcmUgJ3NlbXZlcidcbntCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSAnYXRvbSdcblxuIyMjXG5BIGNvbGxlY3Rpb24gb2YgbWV0aG9kcyBmb3IgcmV0cmlldmluZyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgdXNlcidzIHN5c3RlbSBmb3JcbmJ1ZyByZXBvcnQgcHVycG9zZXMuXG4jIyNcblxuREVWX1BBQ0tBR0VfUEFUSCA9IHBhdGguam9pbignZGV2JywgJ3BhY2thZ2VzJylcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMjI1xuICBTZWN0aW9uOiBTeXN0ZW0gSW5mb3JtYXRpb25cbiAgIyMjXG5cbiAgZ2V0UGxhdGZvcm06IC0+XG4gICAgb3MucGxhdGZvcm0oKVxuXG4gICMgT1MgdmVyc2lvbiBzdHJpbmdzIGxpZnRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9sZWUtZG9obS9idWctcmVwb3J0XG4gIGdldE9TVmVyc2lvbjogLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgc3dpdGNoIEBnZXRQbGF0Zm9ybSgpXG4gICAgICAgIHdoZW4gJ2RhcndpbicgdGhlbiByZXNvbHZlKEBtYWNWZXJzaW9uVGV4dCgpKVxuICAgICAgICB3aGVuICd3aW4zMicgdGhlbiByZXNvbHZlKEB3aW5WZXJzaW9uVGV4dCgpKVxuICAgICAgICB3aGVuICdsaW51eCcgdGhlbiByZXNvbHZlKEBsaW51eFZlcnNpb25UZXh0KCkpXG4gICAgICAgIGVsc2UgcmVzb2x2ZShcIiN7b3MucGxhdGZvcm0oKX0gI3tvcy5yZWxlYXNlKCl9XCIpXG5cbiAgbWFjVmVyc2lvblRleHQ6IC0+XG4gICAgQG1hY1ZlcnNpb25JbmZvKCkudGhlbiAoaW5mbykgLT5cbiAgICAgIHJldHVybiAnVW5rbm93biBtYWNPUyB2ZXJzaW9uJyB1bmxlc3MgaW5mby5Qcm9kdWN0TmFtZSBhbmQgaW5mby5Qcm9kdWN0VmVyc2lvblxuICAgICAgXCIje2luZm8uUHJvZHVjdE5hbWV9ICN7aW5mby5Qcm9kdWN0VmVyc2lvbn1cIlxuXG4gIG1hY1ZlcnNpb25JbmZvOiAtPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICBzdGRvdXQgPSAnJ1xuICAgICAgcGxpc3RCdWRkeSA9IG5ldyBCdWZmZXJlZFByb2Nlc3NcbiAgICAgICAgY29tbWFuZDogJy91c3IvbGliZXhlYy9QbGlzdEJ1ZGR5J1xuICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgJy1jJ1xuICAgICAgICAgICdQcmludCBQcm9kdWN0VmVyc2lvbidcbiAgICAgICAgICAnLWMnXG4gICAgICAgICAgJ1ByaW50IFByb2R1Y3ROYW1lJ1xuICAgICAgICAgICcvU3lzdGVtL0xpYnJhcnkvQ29yZVNlcnZpY2VzL1N5c3RlbVZlcnNpb24ucGxpc3QnXG4gICAgICAgIF1cbiAgICAgICAgc3Rkb3V0OiAob3V0cHV0KSAtPiBzdGRvdXQgKz0gb3V0cHV0XG4gICAgICAgIGV4aXQ6IC0+XG4gICAgICAgICAgW1Byb2R1Y3RWZXJzaW9uLCBQcm9kdWN0TmFtZV0gPSBzdGRvdXQudHJpbSgpLnNwbGl0KCdcXG4nKVxuICAgICAgICAgIHJlc29sdmUoe1Byb2R1Y3RWZXJzaW9uLCBQcm9kdWN0TmFtZX0pXG5cbiAgICAgIHBsaXN0QnVkZHkub25XaWxsVGhyb3dFcnJvciAoe2hhbmRsZX0pIC0+XG4gICAgICAgIGhhbmRsZSgpXG4gICAgICAgIHJlc29sdmUoe30pXG5cbiAgbGludXhWZXJzaW9uVGV4dDogLT5cbiAgICBAbGludXhWZXJzaW9uSW5mbygpLnRoZW4gKGluZm8pIC0+XG4gICAgICBpZiBpbmZvLkRpc3Ryb05hbWUgYW5kIGluZm8uRGlzdHJvVmVyc2lvblxuICAgICAgICBcIiN7aW5mby5EaXN0cm9OYW1lfSAje2luZm8uRGlzdHJvVmVyc2lvbn1cIlxuICAgICAgZWxzZVxuICAgICAgICBcIiN7b3MucGxhdGZvcm0oKX0gI3tvcy5yZWxlYXNlKCl9XCJcblxuICBsaW51eFZlcnNpb25JbmZvOiAtPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICBzdGRvdXQgPSAnJ1xuXG4gICAgICBsc2JSZWxlYXNlID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzc1xuICAgICAgICBjb21tYW5kOiAnbHNiX3JlbGVhc2UnXG4gICAgICAgIGFyZ3M6IFsnLWRzJ11cbiAgICAgICAgc3Rkb3V0OiAob3V0cHV0KSAtPiBzdGRvdXQgKz0gb3V0cHV0XG4gICAgICAgIGV4aXQ6IChleGl0Q29kZSkgLT5cbiAgICAgICAgICBbRGlzdHJvTmFtZSwgRGlzdHJvVmVyc2lvbl0gPSBzdGRvdXQudHJpbSgpLnNwbGl0KCcgJylcbiAgICAgICAgICByZXNvbHZlKHtEaXN0cm9OYW1lLCBEaXN0cm9WZXJzaW9ufSlcblxuICAgICAgbHNiUmVsZWFzZS5vbldpbGxUaHJvd0Vycm9yICh7aGFuZGxlfSkgLT5cbiAgICAgICAgaGFuZGxlKClcbiAgICAgICAgcmVzb2x2ZSh7fSlcblxuICB3aW5WZXJzaW9uVGV4dDogLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgZGF0YSA9IFtdXG4gICAgICBzeXN0ZW1JbmZvID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzc1xuICAgICAgICBjb21tYW5kOiAnc3lzdGVtaW5mbydcbiAgICAgICAgc3Rkb3V0OiAob25lTGluZSkgLT4gZGF0YS5wdXNoKG9uZUxpbmUpXG4gICAgICAgIGV4aXQ6IC0+XG4gICAgICAgICAgaW5mbyA9IGRhdGEuam9pbignXFxuJylcbiAgICAgICAgICBpbmZvID0gaWYgKHJlcyA9IC9PUy5OYW1lLlxccysoLiopJC9pbS5leGVjKGluZm8pKSB0aGVuIHJlc1sxXSBlbHNlICdVbmtub3duIFdpbmRvd3MgdmVyc2lvbidcbiAgICAgICAgICByZXNvbHZlKGluZm8pXG5cbiAgICAgIHN5c3RlbUluZm8ub25XaWxsVGhyb3dFcnJvciAoe2hhbmRsZX0pIC0+XG4gICAgICAgIGhhbmRsZSgpXG4gICAgICAgIHJlc29sdmUoJ1Vua25vd24gV2luZG93cyB2ZXJzaW9uJylcblxuICAjIyNcbiAgU2VjdGlvbjogSW5zdGFsbGVkIFBhY2thZ2VzXG4gICMjI1xuXG4gIGdldE5vbkNvcmVQYWNrYWdlczogLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgbm9uQ29yZVBhY2thZ2VzID0gYXRvbS5wYWNrYWdlcy5nZXRBdmFpbGFibGVQYWNrYWdlTWV0YWRhdGEoKS5maWx0ZXIoKHApIC0+IG5vdCBhdG9tLnBhY2thZ2VzLmlzQnVuZGxlZFBhY2thZ2UocC5uYW1lKSlcbiAgICAgIGRldlBhY2thZ2VOYW1lcyA9IGF0b20ucGFja2FnZXMuZ2V0QXZhaWxhYmxlUGFja2FnZVBhdGhzKCkuZmlsdGVyKChwKSAtPiBwLmluY2x1ZGVzKERFVl9QQUNLQUdFX1BBVEgpKS5tYXAoKHApIC0+IHBhdGguYmFzZW5hbWUocCkpXG4gICAgICByZXNvbHZlKFwiI3twYWNrLm5hbWV9ICN7cGFjay52ZXJzaW9ufSAje2lmIHBhY2submFtZSBpbiBkZXZQYWNrYWdlTmFtZXMgdGhlbiAnKGRldiknIGVsc2UgJyd9XCIgZm9yIHBhY2sgaW4gbm9uQ29yZVBhY2thZ2VzKVxuXG4gIGdldExhdGVzdEF0b21EYXRhOiAtPlxuICAgIGdpdGh1YkhlYWRlcnMgPSBuZXcgSGVhZGVycyh7XG4gICAgICBhY2NlcHQ6ICdhcHBsaWNhdGlvbi92bmQuZ2l0aHViLnYzK2pzb24nLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgfSlcbiAgICBmZXRjaCAnaHR0cHM6Ly9hdG9tLmlvL2FwaS91cGRhdGVzJywge2hlYWRlcnM6IGdpdGh1YkhlYWRlcnN9XG4gICAgICAudGhlbiAocikgLT4gaWYgci5vayB0aGVuIHIuanNvbigpIGVsc2UgUHJvbWlzZS5yZWplY3Qgci5zdGF0dXNDb2RlXG5cbiAgY2hlY2tBdG9tVXBUb0RhdGU6IC0+XG4gICAgQGdldExhdGVzdEF0b21EYXRhKCkudGhlbiAobGF0ZXN0QXRvbURhdGEpIC0+XG4gICAgICBpbnN0YWxsZWRWZXJzaW9uID0gYXRvbS5nZXRWZXJzaW9uKCk/LnJlcGxhY2UoLy0uKiQvLCAnJylcbiAgICAgIGxhdGVzdFZlcnNpb24gPSBsYXRlc3RBdG9tRGF0YS5uYW1lXG4gICAgICB1cFRvRGF0ZSA9IGluc3RhbGxlZFZlcnNpb24/IGFuZCBzZW12ZXIuZ3RlKGluc3RhbGxlZFZlcnNpb24sIGxhdGVzdFZlcnNpb24pXG4gICAgICB7dXBUb0RhdGUsIGxhdGVzdFZlcnNpb24sIGluc3RhbGxlZFZlcnNpb259XG5cbiAgZ2V0UGFja2FnZVZlcnNpb246IChwYWNrYWdlTmFtZSkgLT5cbiAgICBwYWNrID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKHBhY2thZ2VOYW1lKVxuICAgIHBhY2s/Lm1ldGFkYXRhLnZlcnNpb25cblxuICBnZXRQYWNrYWdlVmVyc2lvblNoaXBwZWRXaXRoQXRvbTogKHBhY2thZ2VOYW1lKSAtPlxuICAgIHJlcXVpcmUocGF0aC5qb2luKGF0b20uZ2V0TG9hZFNldHRpbmdzKCkucmVzb3VyY2VQYXRoLCAncGFja2FnZS5qc29uJykpLnBhY2thZ2VEZXBlbmRlbmNpZXNbcGFja2FnZU5hbWVdXG5cbiAgZ2V0TGF0ZXN0UGFja2FnZURhdGE6IChwYWNrYWdlTmFtZSkgLT5cbiAgICBnaXRodWJIZWFkZXJzID0gbmV3IEhlYWRlcnMoe1xuICAgICAgYWNjZXB0OiAnYXBwbGljYXRpb24vdm5kLmdpdGh1Yi52Mytqc29uJyxcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgIH0pXG4gICAgZmV0Y2ggXCJodHRwczovL2F0b20uaW8vYXBpL3BhY2thZ2VzLyN7cGFja2FnZU5hbWV9XCIsIHtoZWFkZXJzOiBnaXRodWJIZWFkZXJzfVxuICAgICAgLnRoZW4gKHIpIC0+IGlmIHIub2sgdGhlbiByLmpzb24oKSBlbHNlIFByb21pc2UucmVqZWN0IHIuc3RhdHVzQ29kZVxuXG4gIGNoZWNrUGFja2FnZVVwVG9EYXRlOiAocGFja2FnZU5hbWUpIC0+XG4gICAgQGdldExhdGVzdFBhY2thZ2VEYXRhKHBhY2thZ2VOYW1lKS50aGVuIChsYXRlc3RQYWNrYWdlRGF0YSkgPT5cbiAgICAgIGluc3RhbGxlZFZlcnNpb24gPSBAZ2V0UGFja2FnZVZlcnNpb24ocGFja2FnZU5hbWUpXG4gICAgICB1cFRvRGF0ZSA9IGluc3RhbGxlZFZlcnNpb24/IGFuZCBzZW12ZXIuZ3RlKGluc3RhbGxlZFZlcnNpb24sIGxhdGVzdFBhY2thZ2VEYXRhLnJlbGVhc2VzLmxhdGVzdClcbiAgICAgIGxhdGVzdFZlcnNpb24gPSBsYXRlc3RQYWNrYWdlRGF0YS5yZWxlYXNlcy5sYXRlc3RcbiAgICAgIHZlcnNpb25TaGlwcGVkV2l0aEF0b20gPSBAZ2V0UGFja2FnZVZlcnNpb25TaGlwcGVkV2l0aEF0b20ocGFja2FnZU5hbWUpXG5cbiAgICAgIGlmIGlzQ29yZSA9IHZlcnNpb25TaGlwcGVkV2l0aEF0b20/XG4gICAgICAgICMgQSBjb3JlIHBhY2thZ2UgaXMgb3V0IG9mIGRhdGUgaWYgdGhlIHZlcnNpb24gd2hpY2ggaXMgYmVpbmcgdXNlZFxuICAgICAgICAjIGlzIGxvd2VyIHRoYW4gdGhlIHZlcnNpb24gd2hpY2ggbm9ybWFsbHkgc2hpcHMgd2l0aCB0aGUgdmVyc2lvblxuICAgICAgICAjIG9mIEF0b20gd2hpY2ggaXMgcnVubmluZy4gVGhpcyB3aWxsIGhhcHBlbiB3aGVuIHRoZXJlJ3MgYSBsb2NhbGx5XG4gICAgICAgICMgaW5zdGFsbGVkIHZlcnNpb24gb2YgdGhlIHBhY2thZ2Ugd2l0aCBhIGxvd2VyIHZlcnNpb24gdGhhbiBBdG9tJ3MuXG4gICAgICAgIHVwVG9EYXRlID0gaW5zdGFsbGVkVmVyc2lvbj8gYW5kIHNlbXZlci5ndGUoaW5zdGFsbGVkVmVyc2lvbiwgdmVyc2lvblNoaXBwZWRXaXRoQXRvbSlcblxuICAgICAge2lzQ29yZSwgdXBUb0RhdGUsIGxhdGVzdFZlcnNpb24sIGluc3RhbGxlZFZlcnNpb24sIHZlcnNpb25TaGlwcGVkV2l0aEF0b219XG4iXX0=
