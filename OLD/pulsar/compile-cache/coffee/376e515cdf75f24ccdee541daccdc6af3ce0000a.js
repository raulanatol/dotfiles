(function() {
  var BufferedProcess, Client, CompositeDisposable, Emitter, PackageManager, _, createJsonParseError, createProcessError, handleProcessErrors, ref, semver,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  ref = require('atom'), BufferedProcess = ref.BufferedProcess, CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  semver = require('semver');

  Client = require('./atom-io-client');

  module.exports = PackageManager = (function() {
    PackageManager.prototype.CACHE_EXPIRY = 1000 * 60 * 10;

    function PackageManager() {
      this.setProxyServersAsync = bind(this.setProxyServersAsync, this);
      this.setProxyServers = bind(this.setProxyServers, this);
      this.packagePromises = [];
      this.apmCache = {
        loadOutdated: {
          value: null,
          expiry: 0
        }
      };
      this.emitter = new Emitter;
    }

    PackageManager.prototype.getClient = function() {
      return this.client != null ? this.client : this.client = new Client(this);
    };

    PackageManager.prototype.isPackageInstalled = function(packageName) {
      if (atom.packages.isPackageLoaded(packageName)) {
        return true;
      } else {
        return atom.packages.getAvailablePackageNames().indexOf(packageName) > -1;
      }
    };

    PackageManager.prototype.packageHasSettings = function(packageName) {
      var grammar, grammars, i, len, pack, ref1, schema;
      grammars = (ref1 = atom.grammars.getGrammars()) != null ? ref1 : [];
      for (i = 0, len = grammars.length; i < len; i++) {
        grammar = grammars[i];
        if (grammar.path) {
          if (grammar.packageName === packageName) {
            return true;
          }
        }
      }
      pack = atom.packages.getLoadedPackage(packageName);
      if ((pack != null) && !atom.packages.isPackageActive(packageName)) {
        pack.activateConfig();
      }
      schema = atom.config.getSchema(packageName);
      return (schema != null) && (schema.type !== 'any');
    };

    PackageManager.prototype.setProxyServers = function(callback) {
      var session;
      session = atom.getCurrentWindow().webContents.session;
      return session.resolveProxy('http://atom.io', (function(_this) {
        return function(httpProxy) {
          _this.applyProxyToEnv('http_proxy', httpProxy);
          return session.resolveProxy('https://pulsar-edit.dev', function(httpsProxy) {
            _this.applyProxyToEnv('https_proxy', httpsProxy);
            return callback();
          });
        };
      })(this));
    };

    PackageManager.prototype.setProxyServersAsync = function(callback) {
      var httpProxyPromise, httpsProxyPromise;
      httpProxyPromise = atom.resolveProxy('http://atom.io').then((function(_this) {
        return function(proxy) {
          return _this.applyProxyToEnv('http_proxy', proxy);
        };
      })(this));
      httpsProxyPromise = atom.resolveProxy('https://pulsar-edit.dev').then((function(_this) {
        return function(proxy) {
          return _this.applyProxyToEnv('https_proxy', proxy);
        };
      })(this));
      return Promise.all([httpProxyPromise, httpsProxyPromise]).then(callback);
    };

    PackageManager.prototype.applyProxyToEnv = function(envName, proxy) {
      if (proxy != null) {
        proxy = proxy.split(' ');
        switch (proxy[0].trim().toUpperCase()) {
          case 'DIRECT':
            delete process.env[envName];
            break;
          case 'PROXY':
            process.env[envName] = 'http://' + proxy[1];
        }
      }
    };

    PackageManager.prototype.runCommand = function(args, callback) {
      var bufferedProcess, command, errorLines, exit, outputLines, stderr, stdout;
      command = atom.packages.getApmPath();
      outputLines = [];
      stdout = function(lines) {
        return outputLines.push(lines);
      };
      errorLines = [];
      stderr = function(lines) {
        return errorLines.push(lines);
      };
      exit = function(code) {
        return callback(code, outputLines.join('\n'), errorLines.join('\n'));
      };
      args.push('--no-color');
      if (atom.config.get('core.useProxySettingsWhenCallingApm')) {
        bufferedProcess = new BufferedProcess({
          command: command,
          args: args,
          stdout: stdout,
          stderr: stderr,
          exit: exit,
          autoStart: false
        });
        if (atom.resolveProxy != null) {
          this.setProxyServersAsync(function() {
            return bufferedProcess.start();
          });
        } else {
          this.setProxyServers(function() {
            return bufferedProcess.start();
          });
        }
        return bufferedProcess;
      } else {
        return new BufferedProcess({
          command: command,
          args: args,
          stdout: stdout,
          stderr: stderr,
          exit: exit
        });
      }
    };

    PackageManager.prototype.loadInstalled = function(callback) {
      var apmProcess, args, errorMessage;
      args = ['ls', '--json'];
      errorMessage = 'Fetching local packages failed.';
      apmProcess = this.runCommand(args, function(code, stdout, stderr) {
        var error, packages, parseError, ref1;
        if (code === 0) {
          try {
            packages = (ref1 = JSON.parse(stdout)) != null ? ref1 : [];
          } catch (error1) {
            parseError = error1;
            error = createJsonParseError(errorMessage, parseError, stdout);
            return callback(error);
          }
          return callback(null, packages);
        } else {
          error = new Error(errorMessage);
          error.stdout = stdout;
          error.stderr = stderr;
          return callback(error);
        }
      });
      return handleProcessErrors(apmProcess, errorMessage, callback);
    };

    PackageManager.prototype.loadFeatured = function(loadThemes, callback) {
      var apmProcess, args, errorMessage, version;
      if (!callback) {
        callback = loadThemes;
        loadThemes = false;
      }
      args = ['featured', '--json'];
      version = atom.getVersion();
      if (loadThemes) {
        args.push('--themes');
      }
      if (semver.valid(version)) {
        args.push('--compatible', version);
      }
      errorMessage = 'Fetching featured packages failed.';
      apmProcess = this.runCommand(args, function(code, stdout, stderr) {
        var error, packages, parseError, ref1;
        if (code === 0) {
          try {
            packages = (ref1 = JSON.parse(stdout)) != null ? ref1 : [];
          } catch (error1) {
            parseError = error1;
            error = createJsonParseError(errorMessage, parseError, stdout);
            return callback(error);
          }
          return callback(null, packages);
        } else {
          error = new Error(errorMessage);
          error.stdout = stdout;
          error.stderr = stderr;
          return callback(error);
        }
      });
      return handleProcessErrors(apmProcess, errorMessage, callback);
    };

    PackageManager.prototype.loadOutdated = function(clearCache, callback) {
      var apmProcess, args, errorMessage, version;
      if (clearCache) {
        this.clearOutdatedCache();
      } else if (this.apmCache.loadOutdated.value && this.apmCache.loadOutdated.expiry > Date.now()) {
        return callback(null, this.apmCache.loadOutdated.value);
      }
      args = ['outdated', '--json'];
      version = atom.getVersion();
      if (semver.valid(version)) {
        args.push('--compatible', version);
      }
      errorMessage = 'Fetching outdated packages and themes failed.';
      apmProcess = this.runCommand(args, (function(_this) {
        return function(code, stdout, stderr) {
          var error, i, len, pack, packages, parseError, ref1, updatablePackages;
          if (code === 0) {
            try {
              packages = (ref1 = JSON.parse(stdout)) != null ? ref1 : [];
            } catch (error1) {
              parseError = error1;
              error = createJsonParseError(errorMessage, parseError, stdout);
              return callback(error);
            }
            updatablePackages = (function() {
              var i, len, results;
              results = [];
              for (i = 0, len = packages.length; i < len; i++) {
                pack = packages[i];
                if (!this.getVersionPinnedPackages().includes(pack != null ? pack.name : void 0)) {
                  results.push(pack);
                }
              }
              return results;
            }).call(_this);
            _this.apmCache.loadOutdated = {
              value: updatablePackages,
              expiry: Date.now() + _this.CACHE_EXPIRY
            };
            for (i = 0, len = updatablePackages.length; i < len; i++) {
              pack = updatablePackages[i];
              _this.emitPackageEvent('update-available', pack);
            }
            return callback(null, updatablePackages);
          } else {
            error = new Error(errorMessage);
            error.stdout = stdout;
            error.stderr = stderr;
            return callback(error);
          }
        };
      })(this));
      return handleProcessErrors(apmProcess, errorMessage, callback);
    };

    PackageManager.prototype.getVersionPinnedPackages = function() {
      var ref1;
      return (ref1 = atom.config.get('core.versionPinnedPackages')) != null ? ref1 : [];
    };

    PackageManager.prototype.clearOutdatedCache = function() {
      return this.apmCache.loadOutdated = {
        value: null,
        expiry: 0
      };
    };

    PackageManager.prototype.loadPackage = function(packageName, callback) {
      var apmProcess, args, errorMessage;
      args = ['view', packageName, '--json'];
      errorMessage = "Fetching package '" + packageName + "' failed.";
      apmProcess = this.runCommand(args, function(code, stdout, stderr) {
        var error, packages, parseError, ref1;
        if (code === 0) {
          try {
            packages = (ref1 = JSON.parse(stdout)) != null ? ref1 : [];
          } catch (error1) {
            parseError = error1;
            error = createJsonParseError(errorMessage, parseError, stdout);
            return callback(error);
          }
          return callback(null, packages);
        } else {
          error = new Error(errorMessage);
          error.stdout = stdout;
          error.stderr = stderr;
          return callback(error);
        }
      });
      return handleProcessErrors(apmProcess, errorMessage, callback);
    };

    PackageManager.prototype.loadCompatiblePackageVersion = function(packageName, callback) {
      var apmProcess, args, errorMessage;
      args = ['view', packageName, '--json', '--compatible', this.normalizeVersion(atom.getVersion())];
      errorMessage = "Fetching package '" + packageName + "' failed.";
      apmProcess = this.runCommand(args, function(code, stdout, stderr) {
        var error, packages, parseError, ref1;
        if (code === 0) {
          try {
            packages = (ref1 = JSON.parse(stdout)) != null ? ref1 : [];
          } catch (error1) {
            parseError = error1;
            error = createJsonParseError(errorMessage, parseError, stdout);
            return callback(error);
          }
          return callback(null, packages);
        } else {
          error = new Error(errorMessage);
          error.stdout = stdout;
          error.stderr = stderr;
          return callback(error);
        }
      });
      return handleProcessErrors(apmProcess, errorMessage, callback);
    };

    PackageManager.prototype.getInstalled = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.loadInstalled(function(error, result) {
            if (error) {
              return reject(error);
            } else {
              return resolve(result);
            }
          });
        };
      })(this));
    };

    PackageManager.prototype.getFeatured = function(loadThemes) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.loadFeatured(!!loadThemes, function(error, result) {
            if (error) {
              return reject(error);
            } else {
              return resolve(result);
            }
          });
        };
      })(this));
    };

    PackageManager.prototype.getOutdated = function(clearCache) {
      if (clearCache == null) {
        clearCache = false;
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.loadOutdated(clearCache, function(error, result) {
            if (error) {
              return reject(error);
            } else {
              return resolve(result);
            }
          });
        };
      })(this));
    };

    PackageManager.prototype.getPackage = function(packageName) {
      var base;
      return (base = this.packagePromises)[packageName] != null ? base[packageName] : base[packageName] = new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.loadPackage(packageName, function(error, result) {
            if (error) {
              return reject(error);
            } else {
              return resolve(result);
            }
          });
        };
      })(this));
    };

    PackageManager.prototype.satisfiesVersion = function(version, metadata) {
      var engine, ref1, ref2;
      engine = (ref1 = (ref2 = metadata.engines) != null ? ref2.atom : void 0) != null ? ref1 : '*';
      if (!semver.validRange(engine)) {
        return false;
      }
      return semver.satisfies(version, engine);
    };

    PackageManager.prototype.normalizeVersion = function(version) {
      if (typeof version === 'string') {
        version = version.split('-')[0];
      }
      return version;
    };

    PackageManager.prototype.update = function(pack, newVersion, callback) {
      var apmInstallSource, apmProcess, args, errorMessage, exit, name, onError, theme;
      name = pack.name, theme = pack.theme, apmInstallSource = pack.apmInstallSource;
      errorMessage = newVersion ? "Updating to \u201C" + name + "@" + newVersion + "\u201D failed." : "Updating to latest sha failed.";
      onError = (function(_this) {
        return function(error) {
          error.packageInstallError = !theme;
          _this.emitPackageEvent('update-failed', pack, error);
          return typeof callback === "function" ? callback(error) : void 0;
        };
      })(this);
      if ((apmInstallSource != null ? apmInstallSource.type : void 0) === 'git') {
        args = ['install', apmInstallSource.source];
      } else {
        args = ['install', name + "@" + newVersion];
      }
      exit = (function(_this) {
        return function(code, stdout, stderr) {
          var error;
          if (code === 0) {
            _this.clearOutdatedCache();
            if (typeof callback === "function") {
              callback();
            }
            return _this.emitPackageEvent('updated', pack);
          } else {
            error = new Error(errorMessage);
            error.stdout = stdout;
            error.stderr = stderr;
            return onError(error);
          }
        };
      })(this);
      this.emitPackageEvent('updating', pack);
      apmProcess = this.runCommand(args, exit);
      return handleProcessErrors(apmProcess, errorMessage, onError);
    };

    PackageManager.prototype.unload = function(name) {
      if (atom.packages.isPackageLoaded(name)) {
        if (atom.packages.isPackageActive(name)) {
          atom.packages.deactivatePackage(name);
        }
        return atom.packages.unloadPackage(name);
      }
    };

    PackageManager.prototype.install = function(pack, callback) {
      var activateOnFailure, activateOnSuccess, apmProcess, args, errorMessage, exit, name, nameWithVersion, onError, theme, version;
      name = pack.name, version = pack.version, theme = pack.theme;
      activateOnSuccess = !theme && !atom.packages.isPackageDisabled(name);
      activateOnFailure = atom.packages.isPackageActive(name);
      nameWithVersion = version != null ? name + "@" + version : name;
      this.unload(name);
      args = ['install', nameWithVersion, '--json'];
      errorMessage = "Installing \u201C" + nameWithVersion + "\u201D failed.";
      onError = (function(_this) {
        return function(error) {
          error.packageInstallError = !theme;
          _this.emitPackageEvent('install-failed', pack, error);
          return typeof callback === "function" ? callback(error) : void 0;
        };
      })(this);
      exit = (function(_this) {
        return function(code, stdout, stderr) {
          var err, error, packageInfo;
          if (code === 0) {
            try {
              packageInfo = JSON.parse(stdout)[0];
              pack = _.extend({}, pack, packageInfo.metadata);
              name = pack.name;
            } catch (error1) {
              err = error1;
            }
            _this.clearOutdatedCache();
            if (activateOnSuccess) {
              atom.packages.activatePackage(name);
            } else {
              atom.packages.loadPackage(name);
            }
            if (typeof callback === "function") {
              callback();
            }
            return _this.emitPackageEvent('installed', pack);
          } else {
            if (activateOnFailure) {
              atom.packages.activatePackage(name);
            }
            error = new Error(errorMessage);
            error.stdout = stdout;
            error.stderr = stderr;
            return onError(error);
          }
        };
      })(this);
      this.emitPackageEvent('installing', pack);
      apmProcess = this.runCommand(args, exit);
      return handleProcessErrors(apmProcess, errorMessage, onError);
    };

    PackageManager.prototype.uninstall = function(pack, callback) {
      var apmProcess, errorMessage, name, onError;
      name = pack.name;
      if (atom.packages.isPackageActive(name)) {
        atom.packages.deactivatePackage(name);
      }
      errorMessage = "Uninstalling \u201C" + name + "\u201D failed.";
      onError = (function(_this) {
        return function(error) {
          _this.emitPackageEvent('uninstall-failed', pack, error);
          return typeof callback === "function" ? callback(error) : void 0;
        };
      })(this);
      this.emitPackageEvent('uninstalling', pack);
      apmProcess = this.runCommand(['uninstall', '--hard', name], (function(_this) {
        return function(code, stdout, stderr) {
          var error;
          if (code === 0) {
            _this.clearOutdatedCache();
            _this.unload(name);
            _this.removePackageNameFromDisabledPackages(name);
            if (typeof callback === "function") {
              callback();
            }
            return _this.emitPackageEvent('uninstalled', pack);
          } else {
            error = new Error(errorMessage);
            error.stdout = stdout;
            error.stderr = stderr;
            return onError(error);
          }
        };
      })(this));
      return handleProcessErrors(apmProcess, errorMessage, onError);
    };

    PackageManager.prototype.installAlternative = function(pack, alternativePackageName, callback) {
      var eventArg, installPromise, uninstallPromise;
      eventArg = {
        pack: pack,
        alternative: alternativePackageName
      };
      this.emitter.emit('package-installing-alternative', eventArg);
      uninstallPromise = new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.uninstall(pack, function(error) {
            if (error) {
              return reject(error);
            } else {
              return resolve();
            }
          });
        };
      })(this));
      installPromise = new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.install({
            name: alternativePackageName
          }, function(error) {
            if (error) {
              return reject(error);
            } else {
              return resolve();
            }
          });
        };
      })(this));
      return Promise.all([uninstallPromise, installPromise]).then((function(_this) {
        return function() {
          callback(null, eventArg);
          return _this.emitter.emit('package-installed-alternative', eventArg);
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          console.error(error.message, error.stack);
          callback(error, eventArg);
          eventArg.error = error;
          return _this.emitter.emit('package-install-alternative-failed', eventArg);
        };
      })(this));
    };

    PackageManager.prototype.canUpgrade = function(installedPackage, availableVersion) {
      var installedVersion;
      if (installedPackage == null) {
        return false;
      }
      installedVersion = installedPackage.metadata.version;
      if (!semver.valid(installedVersion)) {
        return false;
      }
      if (!semver.valid(availableVersion)) {
        return false;
      }
      return semver.gt(availableVersion, installedVersion);
    };

    PackageManager.prototype.getPackageTitle = function(arg) {
      var name;
      name = arg.name;
      return _.undasherize(_.uncamelcase(name));
    };

    PackageManager.prototype.getRepositoryUrl = function(arg) {
      var metadata, ref1, ref2, repoName, repoUrl, repository;
      metadata = arg.metadata;
      repository = metadata.repository;
      repoUrl = (ref1 = (ref2 = repository != null ? repository.url : void 0) != null ? ref2 : repository) != null ? ref1 : '';
      if (repoUrl.match('git@github')) {
        repoName = repoUrl.split(':')[1];
        repoUrl = "https://github.com/" + repoName;
      }
      return repoUrl.replace(/\.git$/, '').replace(/\/+$/, '').replace(/^git\+/, '');
    };

    PackageManager.prototype.getRepositoryBugUri = function(arg) {
      var bugUri, bugs, metadata, ref1, ref2;
      metadata = arg.metadata;
      bugs = metadata.bugs;
      if (typeof bugs === 'string') {
        bugUri = bugs;
      } else {
        bugUri = (ref1 = (ref2 = bugs != null ? bugs.url : void 0) != null ? ref2 : bugs != null ? bugs.email : void 0) != null ? ref1 : this.getRepositoryUrl({
          metadata: metadata
        }) + '/issues/new';
        if (bugUri.includes('@')) {
          bugUri = 'mailto:' + bugUri;
        }
      }
      return bugUri;
    };

    PackageManager.prototype.checkNativeBuildTools = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var apmProcess;
          apmProcess = _this.runCommand(['install', '--check'], function(code, stdout, stderr) {
            if (code === 0) {
              return resolve();
            } else {
              return reject(new Error());
            }
          });
          return apmProcess.onWillThrowError(function(arg) {
            var error, handle;
            error = arg.error, handle = arg.handle;
            handle();
            return reject(error);
          });
        };
      })(this));
    };

    PackageManager.prototype.removePackageNameFromDisabledPackages = function(packageName) {
      return atom.config.removeAtKeyPath('core.disabledPackages', packageName);
    };

    PackageManager.prototype.emitPackageEvent = function(eventName, pack, error) {
      var ref1, ref2, theme;
      theme = (ref1 = pack.theme) != null ? ref1 : (ref2 = pack.metadata) != null ? ref2.theme : void 0;
      eventName = theme ? "theme-" + eventName : "package-" + eventName;
      return this.emitter.emit(eventName, {
        pack: pack,
        error: error
      });
    };

    PackageManager.prototype.on = function(selectors, callback) {
      var i, len, ref1, selector, subscriptions;
      subscriptions = new CompositeDisposable;
      ref1 = selectors.split(" ");
      for (i = 0, len = ref1.length; i < len; i++) {
        selector = ref1[i];
        subscriptions.add(this.emitter.on(selector, callback));
      }
      return subscriptions;
    };

    return PackageManager;

  })();

  createJsonParseError = function(message, parseError, stdout) {
    var error;
    error = new Error(message);
    error.stdout = '';
    error.stderr = parseError.message + ": " + stdout;
    return error;
  };

  createProcessError = function(message, processError) {
    var error;
    error = new Error(message);
    error.stdout = '';
    error.stderr = processError.message;
    return error;
  };

  handleProcessErrors = function(apmProcess, message, callback) {
    return apmProcess.onWillThrowError(function(arg) {
      var error, handle;
      error = arg.error, handle = arg.handle;
      handle();
      return callback(createProcessError(message, error));
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvc2V0dGluZ3Mtdmlldy9saWIvcGFja2FnZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0pBQUE7SUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQWtELE9BQUEsQ0FBUSxNQUFSLENBQWxELEVBQUMscUNBQUQsRUFBa0IsNkNBQWxCLEVBQXVDOztFQUN2QyxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBRVQsTUFBQSxHQUFTLE9BQUEsQ0FBUSxrQkFBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUNNOzZCQUVKLFlBQUEsR0FBYyxJQUFBLEdBQUssRUFBTCxHQUFROztJQUVULHdCQUFBOzs7TUFDWCxJQUFDLENBQUEsZUFBRCxHQUFtQjtNQUNuQixJQUFDLENBQUEsUUFBRCxHQUNFO1FBQUEsWUFBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLElBQVA7VUFDQSxNQUFBLEVBQVEsQ0FEUjtTQURGOztNQUlGLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtJQVBKOzs2QkFTYixTQUFBLEdBQVcsU0FBQTttQ0FDVCxJQUFDLENBQUEsU0FBRCxJQUFDLENBQUEsU0FBVSxJQUFJLE1BQUosQ0FBVyxJQUFYO0lBREY7OzZCQUdYLGtCQUFBLEdBQW9CLFNBQUMsV0FBRDtNQUNsQixJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixXQUE5QixDQUFIO2VBQ0UsS0FERjtPQUFBLE1BQUE7ZUFHRSxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFkLENBQUEsQ0FBd0MsQ0FBQyxPQUF6QyxDQUFpRCxXQUFqRCxDQUFBLEdBQWdFLENBQUMsRUFIbkU7O0lBRGtCOzs2QkFNcEIsa0JBQUEsR0FBb0IsU0FBQyxXQUFE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QUE0QixLQUE1QixDQUFUO0lBRjBCLENBQTVCO0VBRG9CO0FBOWN0QiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57QnVmZmVyZWRQcm9jZXNzLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5zZW12ZXIgPSByZXF1aXJlICdzZW12ZXInXG5cbkNsaWVudCA9IHJlcXVpcmUgJy4vYXRvbS1pby1jbGllbnQnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFBhY2thZ2VNYW5hZ2VyXG4gICMgTWlsbGlzZWNvbmQgZXhwaXJ5IGZvciBjYWNoZWQgbG9hZE91dGRhdGVkLCBldGMuIHZhbHVlc1xuICBDQUNIRV9FWFBJUlk6IDEwMDAqNjAqMTBcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAcGFja2FnZVByb21pc2VzID0gW11cbiAgICBAYXBtQ2FjaGUgPVxuICAgICAgbG9hZE91dGRhdGVkOlxuICAgICAgICB2YWx1ZTogbnVsbFxuICAgICAgICBleHBpcnk6IDBcblxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICBnZXRDbGllbnQ6IC0+XG4gICAgQGNsaWVudCA/PSBuZXcgQ2xpZW50KHRoaXMpXG5cbiAgaXNQYWNrYWdlSW5zdGFsbGVkOiAocGFja2FnZU5hbWUpIC0+XG4gICAgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VMb2FkZWQocGFja2FnZU5hbWUpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgYXRvbS5wYWNrYWdlcy5nZXRBdmFpbGFibGVQYWNrYWdlTmFtZXMoKS5pbmRleE9mKHBhY2thZ2VOYW1lKSA+IC0xXG5cbiAgcGFja2FnZUhhc1NldHRpbmdzOiAocGFja2FnZU5hbWUpIC0+XG4gICAgZ3JhbW1hcnMgPSBhdG9tLmdyYW1tYXJzLmdldEdyYW1tYXJzKCkgPyBbXVxuICAgIGZvciBncmFtbWFyIGluIGdyYW1tYXJzIHdoZW4gZ3JhbW1hci5wYXRoXG4gICAgICByZXR1cm4gdHJ1ZSBpZiBncmFtbWFyLnBhY2thZ2VOYW1lIGlzIHBhY2thZ2VOYW1lXG5cbiAgICBwYWNrID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKHBhY2thZ2VOYW1lKVxuICAgIHBhY2suYWN0aXZhdGVDb25maWcoKSBpZiBwYWNrPyBhbmQgbm90IGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKHBhY2thZ2VOYW1lKVxuICAgIHNjaGVtYSA9IGF0b20uY29uZmlnLmdldFNjaGVtYShwYWNrYWdlTmFtZSlcbiAgICBzY2hlbWE/IGFuZCAoc2NoZW1hLnR5cGUgaXNudCAnYW55JylcblxuICBzZXRQcm94eVNlcnZlcnM6IChjYWxsYmFjaykgPT5cbiAgICBzZXNzaW9uID0gYXRvbS5nZXRDdXJyZW50V2luZG93KCkud2ViQ29udGVudHMuc2Vzc2lvblxuICAgIHNlc3Npb24ucmVzb2x2ZVByb3h5ICdodHRwOi8vYXRvbS5pbycsIChodHRwUHJveHkpID0+XG4gICAgICBAYXBwbHlQcm94eVRvRW52KCdodHRwX3Byb3h5JywgaHR0cFByb3h5KVxuICAgICAgc2Vzc2lvbi5yZXNvbHZlUHJveHkgJ2h0dHBzOi8vcHVsc2FyLWVkaXQuZGV2JywgKGh0dHBzUHJveHkpID0+XG4gICAgICAgIEBhcHBseVByb3h5VG9FbnYoJ2h0dHBzX3Byb3h5JywgaHR0cHNQcm94eSlcbiAgICAgICAgY2FsbGJhY2soKVxuXG4gIHNldFByb3h5U2VydmVyc0FzeW5jOiAoY2FsbGJhY2spID0+XG4gICAgaHR0cFByb3h5UHJvbWlzZSA9IGF0b20ucmVzb2x2ZVByb3h5KCdodHRwOi8vYXRvbS5pbycpLnRoZW4oKHByb3h5KSA9PiBAYXBwbHlQcm94eVRvRW52KCdodHRwX3Byb3h5JywgcHJveHkpKVxuICAgIGh0dHBzUHJveHlQcm9taXNlID0gYXRvbS5yZXNvbHZlUHJveHkoJ2h0dHBzOi8vcHVsc2FyLWVkaXQuZGV2JykudGhlbigocHJveHkpID0+IEBhcHBseVByb3h5VG9FbnYoJ2h0dHBzX3Byb3h5JywgcHJveHkpKVxuICAgIFByb21pc2UuYWxsKFtodHRwUHJveHlQcm9taXNlLCBodHRwc1Byb3h5UHJvbWlzZV0pLnRoZW4oY2FsbGJhY2spXG5cbiAgYXBwbHlQcm94eVRvRW52OiAoZW52TmFtZSwgcHJveHkpIC0+XG4gICAgaWYgcHJveHk/XG4gICAgICBwcm94eSA9IHByb3h5LnNwbGl0KCcgJylcbiAgICAgIHN3aXRjaCBwcm94eVswXS50cmltKCkudG9VcHBlckNhc2UoKVxuICAgICAgICB3aGVuICdESVJFQ1QnIHRoZW4gZGVsZXRlIHByb2Nlc3MuZW52W2Vudk5hbWVdXG4gICAgICAgIHdoZW4gJ1BST1hZJyAgdGhlbiBwcm9jZXNzLmVudltlbnZOYW1lXSA9ICdodHRwOi8vJyArIHByb3h5WzFdXG4gICAgcmV0dXJuXG5cbiAgcnVuQ29tbWFuZDogKGFyZ3MsIGNhbGxiYWNrKSAtPlxuICAgIGNvbW1hbmQgPSBhdG9tLnBhY2thZ2VzLmdldEFwbVBhdGgoKVxuICAgIG91dHB1dExpbmVzID0gW11cbiAgICBzdGRvdXQgPSAobGluZXMpIC0+IG91dHB1dExpbmVzLnB1c2gobGluZXMpXG4gICAgZXJyb3JMaW5lcyA9IFtdXG4gICAgc3RkZXJyID0gKGxpbmVzKSAtPiBlcnJvckxpbmVzLnB1c2gobGluZXMpXG4gICAgZXhpdCA9IChjb2RlKSAtPlxuICAgICAgY2FsbGJhY2soY29kZSwgb3V0cHV0TGluZXMuam9pbignXFxuJyksIGVycm9yTGluZXMuam9pbignXFxuJykpXG5cbiAgICBhcmdzLnB1c2goJy0tbm8tY29sb3InKVxuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdjb3JlLnVzZVByb3h5U2V0dGluZ3NXaGVuQ2FsbGluZ0FwbScpXG4gICAgICBidWZmZXJlZFByb2Nlc3MgPSBuZXcgQnVmZmVyZWRQcm9jZXNzKHtjb21tYW5kLCBhcmdzLCBzdGRvdXQsIHN0ZGVyciwgZXhpdCwgYXV0b1N0YXJ0OiBmYWxzZX0pXG4gICAgICBpZiBhdG9tLnJlc29sdmVQcm94eT9cbiAgICAgICAgQHNldFByb3h5U2VydmVyc0FzeW5jIC0+IGJ1ZmZlcmVkUHJvY2Vzcy5zdGFydCgpXG4gICAgICBlbHNlXG4gICAgICAgIEBzZXRQcm94eVNlcnZlcnMgLT4gYnVmZmVyZWRQcm9jZXNzLnN0YXJ0KClcbiAgICAgIHJldHVybiBidWZmZXJlZFByb2Nlc3NcbiAgICBlbHNlXG4gICAgICByZXR1cm4gbmV3IEJ1ZmZlcmVkUHJvY2Vzcyh7Y29tbWFuZCwgYXJncywgc3Rkb3V0LCBzdGRlcnIsIGV4aXR9KVxuXG4gIGxvYWRJbnN0YWxsZWQ6IChjYWxsYmFjaykgLT5cbiAgICBhcmdzID0gWydscycsICctLWpzb24nXVxuICAgIGVycm9yTWVzc2FnZSA9ICdGZXRjaGluZyBsb2NhbCBwYWNrYWdlcyBmYWlsZWQuJ1xuICAgIGFwbVByb2Nlc3MgPSBAcnVuQ29tbWFuZCBhcmdzLCAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpIC0+XG4gICAgICBpZiBjb2RlIGlzIDBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgcGFja2FnZXMgPSBKU09OLnBhcnNlKHN0ZG91dCkgPyBbXVxuICAgICAgICBjYXRjaCBwYXJzZUVycm9yXG4gICAgICAgICAgZXJyb3IgPSBjcmVhdGVKc29uUGFyc2VFcnJvcihlcnJvck1lc3NhZ2UsIHBhcnNlRXJyb3IsIHN0ZG91dClcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IpXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhY2thZ2VzKVxuICAgICAgZWxzZVxuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpXG4gICAgICAgIGVycm9yLnN0ZG91dCA9IHN0ZG91dFxuICAgICAgICBlcnJvci5zdGRlcnIgPSBzdGRlcnJcbiAgICAgICAgY2FsbGJhY2soZXJyb3IpXG5cbiAgICBoYW5kbGVQcm9jZXNzRXJyb3JzKGFwbVByb2Nlc3MsIGVycm9yTWVzc2FnZSwgY2FsbGJhY2spXG5cbiAgbG9hZEZlYXR1cmVkOiAobG9hZFRoZW1lcywgY2FsbGJhY2spIC0+XG4gICAgdW5sZXNzIGNhbGxiYWNrXG4gICAgICBjYWxsYmFjayA9IGxvYWRUaGVtZXNcbiAgICAgIGxvYWRUaGVtZXMgPSBmYWxzZVxuXG4gICAgYXJncyA9IFsnZmVhdHVyZWQnLCAnLS1qc29uJ11cbiAgICB2ZXJzaW9uID0gYXRvbS5nZXRWZXJzaW9uKClcbiAgICBhcmdzLnB1c2goJy0tdGhlbWVzJykgaWYgbG9hZFRoZW1lc1xuICAgIGFyZ3MucHVzaCgnLS1jb21wYXRpYmxlJywgdmVyc2lvbikgaWYgc2VtdmVyLnZhbGlkKHZlcnNpb24pXG4gICAgZXJyb3JNZXNzYWdlID0gJ0ZldGNoaW5nIGZlYXR1cmVkIHBhY2thZ2VzIGZhaWxlZC4nXG5cbiAgICBhcG1Qcm9jZXNzID0gQHJ1bkNvbW1hbmQgYXJncywgKGNvZGUsIHN0ZG91dCwgc3RkZXJyKSAtPlxuICAgICAgaWYgY29kZSBpcyAwXG4gICAgICAgIHRyeVxuICAgICAgICAgIHBhY2thZ2VzID0gSlNPTi5wYXJzZShzdGRvdXQpID8gW11cbiAgICAgICAgY2F0Y2ggcGFyc2VFcnJvclxuICAgICAgICAgIGVycm9yID0gY3JlYXRlSnNvblBhcnNlRXJyb3IoZXJyb3JNZXNzYWdlLCBwYXJzZUVycm9yLCBzdGRvdXQpXG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yKVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhY2thZ2VzKVxuICAgICAgZWxzZVxuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpXG4gICAgICAgIGVycm9yLnN0ZG91dCA9IHN0ZG91dFxuICAgICAgICBlcnJvci5zdGRlcnIgPSBzdGRlcnJcbiAgICAgICAgY2FsbGJhY2soZXJyb3IpXG5cbiAgICBoYW5kbGVQcm9jZXNzRXJyb3JzKGFwbVByb2Nlc3MsIGVycm9yTWVzc2FnZSwgY2FsbGJhY2spXG5cbiAgbG9hZE91dGRhdGVkOiAoY2xlYXJDYWNoZSwgY2FsbGJhY2spIC0+XG4gICAgaWYgY2xlYXJDYWNoZVxuICAgICAgQGNsZWFyT3V0ZGF0ZWRDYWNoZSgpXG4gICAgIyBTaG9ydCBjaXJjdWl0IGlmIHdlIGhhdmUgY2FjaGVkIGRhdGEuXG4gICAgZWxzZSBpZiBAYXBtQ2FjaGUubG9hZE91dGRhdGVkLnZhbHVlIGFuZCBAYXBtQ2FjaGUubG9hZE91dGRhdGVkLmV4cGlyeSA+IERhdGUubm93KClcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBAYXBtQ2FjaGUubG9hZE91dGRhdGVkLnZhbHVlKVxuXG4gICAgYXJncyA9IFsnb3V0ZGF0ZWQnLCAnLS1qc29uJ11cbiAgICB2ZXJzaW9uID0gYXRvbS5nZXRWZXJzaW9uKClcbiAgICBhcmdzLnB1c2goJy0tY29tcGF0aWJsZScsIHZlcnNpb24pIGlmIHNlbXZlci52YWxpZCh2ZXJzaW9uKVxuICAgIGVycm9yTWVzc2FnZSA9ICdGZXRjaGluZyBvdXRkYXRlZCBwYWNrYWdlcyBhbmQgdGhlbWVzIGZhaWxlZC4nXG5cbiAgICBhcG1Qcm9jZXNzID0gQHJ1bkNvbW1hbmQgYXJncywgKGNvZGUsIHN0ZG91dCwgc3RkZXJyKSA9PlxuICAgICAgaWYgY29kZSBpcyAwXG4gICAgICAgIHRyeVxuICAgICAgICAgIHBhY2thZ2VzID0gSlNPTi5wYXJzZShzdGRvdXQpID8gW11cbiAgICAgICAgY2F0Y2ggcGFyc2VFcnJvclxuICAgICAgICAgIGVycm9yID0gY3JlYXRlSnNvblBhcnNlRXJyb3IoZXJyb3JNZXNzYWdlLCBwYXJzZUVycm9yLCBzdGRvdXQpXG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yKVxuXG4gICAgICAgIHVwZGF0YWJsZVBhY2thZ2VzID0gKHBhY2sgZm9yIHBhY2sgaW4gcGFja2FnZXMgd2hlbiBub3QgQGdldFZlcnNpb25QaW5uZWRQYWNrYWdlcygpLmluY2x1ZGVzKHBhY2s/Lm5hbWUpKVxuXG4gICAgICAgIEBhcG1DYWNoZS5sb2FkT3V0ZGF0ZWQgPVxuICAgICAgICAgIHZhbHVlOiB1cGRhdGFibGVQYWNrYWdlc1xuICAgICAgICAgIGV4cGlyeTogRGF0ZS5ub3coKSArIEBDQUNIRV9FWFBJUllcblxuICAgICAgICBmb3IgcGFjayBpbiB1cGRhdGFibGVQYWNrYWdlc1xuICAgICAgICAgIEBlbWl0UGFja2FnZUV2ZW50ICd1cGRhdGUtYXZhaWxhYmxlJywgcGFja1xuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHVwZGF0YWJsZVBhY2thZ2VzKVxuICAgICAgZWxzZVxuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpXG4gICAgICAgIGVycm9yLnN0ZG91dCA9IHN0ZG91dFxuICAgICAgICBlcnJvci5zdGRlcnIgPSBzdGRlcnJcbiAgICAgICAgY2FsbGJhY2soZXJyb3IpXG5cbiAgICBoYW5kbGVQcm9jZXNzRXJyb3JzKGFwbVByb2Nlc3MsIGVycm9yTWVzc2FnZSwgY2FsbGJhY2spXG5cbiAgZ2V0VmVyc2lvblBpbm5lZFBhY2thZ2VzOiAtPlxuICAgIGF0b20uY29uZmlnLmdldCgnY29yZS52ZXJzaW9uUGlubmVkUGFja2FnZXMnKSA/IFtdXG5cbiAgY2xlYXJPdXRkYXRlZENhY2hlOiAtPlxuICAgIEBhcG1DYWNoZS5sb2FkT3V0ZGF0ZWQgPVxuICAgICAgdmFsdWU6IG51bGxcbiAgICAgIGV4cGlyeTogMFxuXG4gIGxvYWRQYWNrYWdlOiAocGFja2FnZU5hbWUsIGNhbGxiYWNrKSAtPlxuICAgIGFyZ3MgPSBbJ3ZpZXcnLCBwYWNrYWdlTmFtZSwgJy0tanNvbiddXG4gICAgZXJyb3JNZXNzYWdlID0gXCJGZXRjaGluZyBwYWNrYWdlICcje3BhY2thZ2VOYW1lfScgZmFpbGVkLlwiXG5cbiAgICBhcG1Qcm9jZXNzID0gQHJ1bkNvbW1hbmQgYXJncywgKGNvZGUsIHN0ZG91dCwgc3RkZXJyKSAtPlxuICAgICAgaWYgY29kZSBpcyAwXG4gICAgICAgIHRyeVxuICAgICAgICAgIHBhY2thZ2VzID0gSlNPTi5wYXJzZShzdGRvdXQpID8gW11cbiAgICAgICAgY2F0Y2ggcGFyc2VFcnJvclxuICAgICAgICAgIGVycm9yID0gY3JlYXRlSnNvblBhcnNlRXJyb3IoZXJyb3JNZXNzYWdlLCBwYXJzZUVycm9yLCBzdGRvdXQpXG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yKVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhY2thZ2VzKVxuICAgICAgZWxzZVxuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpXG4gICAgICAgIGVycm9yLnN0ZG91dCA9IHN0ZG91dFxuICAgICAgICBlcnJvci5zdGRlcnIgPSBzdGRlcnJcbiAgICAgICAgY2FsbGJhY2soZXJyb3IpXG5cbiAgICBoYW5kbGVQcm9jZXNzRXJyb3JzKGFwbVByb2Nlc3MsIGVycm9yTWVzc2FnZSwgY2FsbGJhY2spXG5cbiAgbG9hZENvbXBhdGlibGVQYWNrYWdlVmVyc2lvbjogKHBhY2thZ2VOYW1lLCBjYWxsYmFjaykgLT5cbiAgICBhcmdzID0gWyd2aWV3JywgcGFja2FnZU5hbWUsICctLWpzb24nLCAnLS1jb21wYXRpYmxlJywgQG5vcm1hbGl6ZVZlcnNpb24oYXRvbS5nZXRWZXJzaW9uKCkpXVxuICAgIGVycm9yTWVzc2FnZSA9IFwiRmV0Y2hpbmcgcGFja2FnZSAnI3twYWNrYWdlTmFtZX0nIGZhaWxlZC5cIlxuXG4gICAgYXBtUHJvY2VzcyA9IEBydW5Db21tYW5kIGFyZ3MsIChjb2RlLCBzdGRvdXQsIHN0ZGVycikgLT5cbiAgICAgIGlmIGNvZGUgaXMgMFxuICAgICAgICB0cnlcbiAgICAgICAgICBwYWNrYWdlcyA9IEpTT04ucGFyc2Uoc3Rkb3V0KSA/IFtdXG4gICAgICAgIGNhdGNoIHBhcnNlRXJyb3JcbiAgICAgICAgICBlcnJvciA9IGNyZWF0ZUpzb25QYXJzZUVycm9yKGVycm9yTWVzc2FnZSwgcGFyc2VFcnJvciwgc3Rkb3V0KVxuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvcilcblxuICAgICAgICBjYWxsYmFjayhudWxsLCBwYWNrYWdlcylcbiAgICAgIGVsc2VcbiAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKVxuICAgICAgICBlcnJvci5zdGRvdXQgPSBzdGRvdXRcbiAgICAgICAgZXJyb3Iuc3RkZXJyID0gc3RkZXJyXG4gICAgICAgIGNhbGxiYWNrKGVycm9yKVxuXG4gICAgaGFuZGxlUHJvY2Vzc0Vycm9ycyhhcG1Qcm9jZXNzLCBlcnJvck1lc3NhZ2UsIGNhbGxiYWNrKVxuXG4gIGdldEluc3RhbGxlZDogLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgQGxvYWRJbnN0YWxsZWQgKGVycm9yLCByZXN1bHQpIC0+XG4gICAgICAgIGlmIGVycm9yXG4gICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpXG5cbiAgZ2V0RmVhdHVyZWQ6IChsb2FkVGhlbWVzKSAtPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBAbG9hZEZlYXR1cmVkICEhbG9hZFRoZW1lcywgKGVycm9yLCByZXN1bHQpIC0+XG4gICAgICAgIGlmIGVycm9yXG4gICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpXG5cbiAgZ2V0T3V0ZGF0ZWQ6IChjbGVhckNhY2hlID0gZmFsc2UpIC0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIEBsb2FkT3V0ZGF0ZWQgY2xlYXJDYWNoZSwgKGVycm9yLCByZXN1bHQpIC0+XG4gICAgICAgIGlmIGVycm9yXG4gICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpXG5cbiAgZ2V0UGFja2FnZTogKHBhY2thZ2VOYW1lKSAtPlxuICAgIEBwYWNrYWdlUHJvbWlzZXNbcGFja2FnZU5hbWVdID89IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBAbG9hZFBhY2thZ2UgcGFja2FnZU5hbWUsIChlcnJvciwgcmVzdWx0KSAtPlxuICAgICAgICBpZiBlcnJvclxuICAgICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlc29sdmUocmVzdWx0KVxuXG4gIHNhdGlzZmllc1ZlcnNpb246ICh2ZXJzaW9uLCBtZXRhZGF0YSkgLT5cbiAgICBlbmdpbmUgPSBtZXRhZGF0YS5lbmdpbmVzPy5hdG9tID8gJyonXG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBzZW12ZXIudmFsaWRSYW5nZShlbmdpbmUpXG4gICAgcmV0dXJuIHNlbXZlci5zYXRpc2ZpZXModmVyc2lvbiwgZW5naW5lKVxuXG4gIG5vcm1hbGl6ZVZlcnNpb246ICh2ZXJzaW9uKSAtPlxuICAgIFt2ZXJzaW9uXSA9IHZlcnNpb24uc3BsaXQoJy0nKSBpZiB0eXBlb2YgdmVyc2lvbiBpcyAnc3RyaW5nJ1xuICAgIHZlcnNpb25cblxuICB1cGRhdGU6IChwYWNrLCBuZXdWZXJzaW9uLCBjYWxsYmFjaykgLT5cbiAgICB7bmFtZSwgdGhlbWUsIGFwbUluc3RhbGxTb3VyY2V9ID0gcGFja1xuXG4gICAgZXJyb3JNZXNzYWdlID0gaWYgbmV3VmVyc2lvblxuICAgICAgXCJVcGRhdGluZyB0byBcXHUyMDFDI3tuYW1lfUAje25ld1ZlcnNpb259XFx1MjAxRCBmYWlsZWQuXCJcbiAgICBlbHNlXG4gICAgICBcIlVwZGF0aW5nIHRvIGxhdGVzdCBzaGEgZmFpbGVkLlwiXG4gICAgb25FcnJvciA9IChlcnJvcikgPT5cbiAgICAgIGVycm9yLnBhY2thZ2VJbnN0YWxsRXJyb3IgPSBub3QgdGhlbWVcbiAgICAgIEBlbWl0UGFja2FnZUV2ZW50ICd1cGRhdGUtZmFpbGVkJywgcGFjaywgZXJyb3JcbiAgICAgIGNhbGxiYWNrPyhlcnJvcilcblxuICAgIGlmIGFwbUluc3RhbGxTb3VyY2U/LnR5cGUgaXMgJ2dpdCdcbiAgICAgIGFyZ3MgPSBbJ2luc3RhbGwnLCBhcG1JbnN0YWxsU291cmNlLnNvdXJjZV1cbiAgICBlbHNlXG4gICAgICBhcmdzID0gWydpbnN0YWxsJywgXCIje25hbWV9QCN7bmV3VmVyc2lvbn1cIl1cblxuICAgIGV4aXQgPSAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpID0+XG4gICAgICBpZiBjb2RlIGlzIDBcbiAgICAgICAgQGNsZWFyT3V0ZGF0ZWRDYWNoZSgpXG4gICAgICAgIGNhbGxiYWNrPygpXG4gICAgICAgIEBlbWl0UGFja2FnZUV2ZW50ICd1cGRhdGVkJywgcGFja1xuICAgICAgZWxzZVxuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpXG4gICAgICAgIGVycm9yLnN0ZG91dCA9IHN0ZG91dFxuICAgICAgICBlcnJvci5zdGRlcnIgPSBzdGRlcnJcbiAgICAgICAgb25FcnJvcihlcnJvcilcblxuICAgIEBlbWl0UGFja2FnZUV2ZW50ICd1cGRhdGluZycsIHBhY2tcbiAgICBhcG1Qcm9jZXNzID0gQHJ1bkNvbW1hbmQoYXJncywgZXhpdClcbiAgICBoYW5kbGVQcm9jZXNzRXJyb3JzKGFwbVByb2Nlc3MsIGVycm9yTWVzc2FnZSwgb25FcnJvcilcblxuICB1bmxvYWQ6IChuYW1lKSAtPlxuICAgIGlmIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlTG9hZGVkKG5hbWUpXG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKG5hbWUpIGlmIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKG5hbWUpXG4gICAgICBhdG9tLnBhY2thZ2VzLnVubG9hZFBhY2thZ2UobmFtZSlcblxuICBpbnN0YWxsOiAocGFjaywgY2FsbGJhY2spIC0+XG4gICAge25hbWUsIHZlcnNpb24sIHRoZW1lfSA9IHBhY2tcbiAgICBhY3RpdmF0ZU9uU3VjY2VzcyA9IG5vdCB0aGVtZSBhbmQgbm90IGF0b20ucGFja2FnZXMuaXNQYWNrYWdlRGlzYWJsZWQobmFtZSlcbiAgICBhY3RpdmF0ZU9uRmFpbHVyZSA9IGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKG5hbWUpXG4gICAgbmFtZVdpdGhWZXJzaW9uID0gaWYgdmVyc2lvbj8gdGhlbiBcIiN7bmFtZX1AI3t2ZXJzaW9ufVwiIGVsc2UgbmFtZVxuXG4gICAgQHVubG9hZChuYW1lKVxuICAgIGFyZ3MgPSBbJ2luc3RhbGwnLCBuYW1lV2l0aFZlcnNpb24sICctLWpzb24nXVxuXG4gICAgZXJyb3JNZXNzYWdlID0gXCJJbnN0YWxsaW5nIFxcdTIwMUMje25hbWVXaXRoVmVyc2lvbn1cXHUyMDFEIGZhaWxlZC5cIlxuICAgIG9uRXJyb3IgPSAoZXJyb3IpID0+XG4gICAgICBlcnJvci5wYWNrYWdlSW5zdGFsbEVycm9yID0gbm90IHRoZW1lXG4gICAgICBAZW1pdFBhY2thZ2VFdmVudCAnaW5zdGFsbC1mYWlsZWQnLCBwYWNrLCBlcnJvclxuICAgICAgY2FsbGJhY2s/KGVycm9yKVxuXG4gICAgZXhpdCA9IChjb2RlLCBzdGRvdXQsIHN0ZGVycikgPT5cbiAgICAgIGlmIGNvZGUgaXMgMFxuICAgICAgICAjIGdldCByZWFsIHBhY2thZ2UgbmFtZSBmcm9tIHBhY2thZ2UuanNvblxuICAgICAgICB0cnlcbiAgICAgICAgICBwYWNrYWdlSW5mbyA9IEpTT04ucGFyc2Uoc3Rkb3V0KVswXVxuICAgICAgICAgIHBhY2sgPSBfLmV4dGVuZCh7fSwgcGFjaywgcGFja2FnZUluZm8ubWV0YWRhdGEpXG4gICAgICAgICAgbmFtZSA9IHBhY2submFtZVxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAjIHVzaW5nIG9sZCBhcG0gd2l0aG91dCAtLWpzb24gc3VwcG9ydFxuICAgICAgICBAY2xlYXJPdXRkYXRlZENhY2hlKClcbiAgICAgICAgaWYgYWN0aXZhdGVPblN1Y2Nlc3NcbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShuYW1lKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZShuYW1lKVxuXG4gICAgICAgIGNhbGxiYWNrPygpXG4gICAgICAgIEBlbWl0UGFja2FnZUV2ZW50ICdpbnN0YWxsZWQnLCBwYWNrXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKG5hbWUpIGlmIGFjdGl2YXRlT25GYWlsdXJlXG4gICAgICAgIGVycm9yID0gbmV3IEVycm9yKGVycm9yTWVzc2FnZSlcbiAgICAgICAgZXJyb3Iuc3Rkb3V0ID0gc3Rkb3V0XG4gICAgICAgIGVycm9yLnN0ZGVyciA9IHN0ZGVyclxuICAgICAgICBvbkVycm9yKGVycm9yKVxuXG4gICAgQGVtaXRQYWNrYWdlRXZlbnQoJ2luc3RhbGxpbmcnLCBwYWNrKVxuICAgIGFwbVByb2Nlc3MgPSBAcnVuQ29tbWFuZChhcmdzLCBleGl0KVxuICAgIGhhbmRsZVByb2Nlc3NFcnJvcnMoYXBtUHJvY2VzcywgZXJyb3JNZXNzYWdlLCBvbkVycm9yKVxuXG4gIHVuaW5zdGFsbDogKHBhY2ssIGNhbGxiYWNrKSAtPlxuICAgIHtuYW1lfSA9IHBhY2tcblxuICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UobmFtZSkgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUobmFtZSlcblxuICAgIGVycm9yTWVzc2FnZSA9IFwiVW5pbnN0YWxsaW5nIFxcdTIwMUMje25hbWV9XFx1MjAxRCBmYWlsZWQuXCJcbiAgICBvbkVycm9yID0gKGVycm9yKSA9PlxuICAgICAgQGVtaXRQYWNrYWdlRXZlbnQgJ3VuaW5zdGFsbC1mYWlsZWQnLCBwYWNrLCBlcnJvclxuICAgICAgY2FsbGJhY2s/KGVycm9yKVxuXG4gICAgQGVtaXRQYWNrYWdlRXZlbnQoJ3VuaW5zdGFsbGluZycsIHBhY2spXG4gICAgYXBtUHJvY2VzcyA9IEBydW5Db21tYW5kIFsndW5pbnN0YWxsJywgJy0taGFyZCcsIG5hbWVdLCAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpID0+XG4gICAgICBpZiBjb2RlIGlzIDBcbiAgICAgICAgQGNsZWFyT3V0ZGF0ZWRDYWNoZSgpXG4gICAgICAgIEB1bmxvYWQobmFtZSlcbiAgICAgICAgQHJlbW92ZVBhY2thZ2VOYW1lRnJvbURpc2FibGVkUGFja2FnZXMobmFtZSlcbiAgICAgICAgY2FsbGJhY2s/KClcbiAgICAgICAgQGVtaXRQYWNrYWdlRXZlbnQgJ3VuaW5zdGFsbGVkJywgcGFja1xuICAgICAgZWxzZVxuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpXG4gICAgICAgIGVycm9yLnN0ZG91dCA9IHN0ZG91dFxuICAgICAgICBlcnJvci5zdGRlcnIgPSBzdGRlcnJcbiAgICAgICAgb25FcnJvcihlcnJvcilcblxuICAgIGhhbmRsZVByb2Nlc3NFcnJvcnMoYXBtUHJvY2VzcywgZXJyb3JNZXNzYWdlLCBvbkVycm9yKVxuXG4gIGluc3RhbGxBbHRlcm5hdGl2ZTogKHBhY2ssIGFsdGVybmF0aXZlUGFja2FnZU5hbWUsIGNhbGxiYWNrKSAtPlxuICAgIGV2ZW50QXJnID0ge3BhY2ssIGFsdGVybmF0aXZlOiBhbHRlcm5hdGl2ZVBhY2thZ2VOYW1lfVxuICAgIEBlbWl0dGVyLmVtaXQoJ3BhY2thZ2UtaW5zdGFsbGluZy1hbHRlcm5hdGl2ZScsIGV2ZW50QXJnKVxuXG4gICAgdW5pbnN0YWxsUHJvbWlzZSA9IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBAdW5pbnN0YWxsIHBhY2ssIChlcnJvcikgLT5cbiAgICAgICAgaWYgZXJyb3IgdGhlbiByZWplY3QoZXJyb3IpIGVsc2UgcmVzb2x2ZSgpXG5cbiAgICBpbnN0YWxsUHJvbWlzZSA9IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBAaW5zdGFsbCB7bmFtZTogYWx0ZXJuYXRpdmVQYWNrYWdlTmFtZX0sIChlcnJvcikgLT5cbiAgICAgICAgaWYgZXJyb3IgdGhlbiByZWplY3QoZXJyb3IpIGVsc2UgcmVzb2x2ZSgpXG5cbiAgICBQcm9taXNlLmFsbChbdW5pbnN0YWxsUHJvbWlzZSwgaW5zdGFsbFByb21pc2VdKS50aGVuID0+XG4gICAgICBjYWxsYmFjayhudWxsLCBldmVudEFyZylcbiAgICAgIEBlbWl0dGVyLmVtaXQoJ3BhY2thZ2UtaW5zdGFsbGVkLWFsdGVybmF0aXZlJywgZXZlbnRBcmcpXG4gICAgLmNhdGNoIChlcnJvcikgPT5cbiAgICAgIGNvbnNvbGUuZXJyb3IgZXJyb3IubWVzc2FnZSwgZXJyb3Iuc3RhY2tcbiAgICAgIGNhbGxiYWNrKGVycm9yLCBldmVudEFyZylcbiAgICAgIGV2ZW50QXJnLmVycm9yID0gZXJyb3JcbiAgICAgIEBlbWl0dGVyLmVtaXQoJ3BhY2thZ2UtaW5zdGFsbC1hbHRlcm5hdGl2ZS1mYWlsZWQnLCBldmVudEFyZylcblxuICBjYW5VcGdyYWRlOiAoaW5zdGFsbGVkUGFja2FnZSwgYXZhaWxhYmxlVmVyc2lvbikgLT5cbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGluc3RhbGxlZFBhY2thZ2U/XG5cbiAgICBpbnN0YWxsZWRWZXJzaW9uID0gaW5zdGFsbGVkUGFja2FnZS5tZXRhZGF0YS52ZXJzaW9uXG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBzZW12ZXIudmFsaWQoaW5zdGFsbGVkVmVyc2lvbilcbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIHNlbXZlci52YWxpZChhdmFpbGFibGVWZXJzaW9uKVxuXG4gICAgc2VtdmVyLmd0KGF2YWlsYWJsZVZlcnNpb24sIGluc3RhbGxlZFZlcnNpb24pXG5cbiAgZ2V0UGFja2FnZVRpdGxlOiAoe25hbWV9KSAtPlxuICAgIF8udW5kYXNoZXJpemUoXy51bmNhbWVsY2FzZShuYW1lKSlcblxuICBnZXRSZXBvc2l0b3J5VXJsOiAoe21ldGFkYXRhfSkgLT5cbiAgICB7cmVwb3NpdG9yeX0gPSBtZXRhZGF0YVxuICAgIHJlcG9VcmwgPSByZXBvc2l0b3J5Py51cmwgPyByZXBvc2l0b3J5ID8gJydcbiAgICBpZiByZXBvVXJsLm1hdGNoICdnaXRAZ2l0aHViJ1xuICAgICAgcmVwb05hbWUgPSByZXBvVXJsLnNwbGl0KCc6JylbMV1cbiAgICAgIHJlcG9VcmwgPSBcImh0dHBzOi8vZ2l0aHViLmNvbS8je3JlcG9OYW1lfVwiXG4gICAgcmVwb1VybC5yZXBsYWNlKC9cXC5naXQkLywgJycpLnJlcGxhY2UoL1xcLyskLywgJycpLnJlcGxhY2UoL15naXRcXCsvLCAnJylcblxuICBnZXRSZXBvc2l0b3J5QnVnVXJpOiAoe21ldGFkYXRhfSkgLT5cbiAgICB7YnVnc30gPSBtZXRhZGF0YVxuICAgIGlmIHR5cGVvZiBidWdzIGlzICdzdHJpbmcnXG4gICAgICBidWdVcmkgPSBidWdzXG4gICAgZWxzZVxuICAgICAgYnVnVXJpID0gYnVncz8udXJsID8gYnVncz8uZW1haWwgPyB0aGlzLmdldFJlcG9zaXRvcnlVcmwoe21ldGFkYXRhfSkgKyAnL2lzc3Vlcy9uZXcnXG4gICAgICBpZiBidWdVcmkuaW5jbHVkZXMoJ0AnKVxuICAgICAgICBidWdVcmkgPSAnbWFpbHRvOicgKyBidWdVcmlcbiAgICBidWdVcmlcblxuICBjaGVja05hdGl2ZUJ1aWxkVG9vbHM6IC0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIGFwbVByb2Nlc3MgPSBAcnVuQ29tbWFuZCBbJ2luc3RhbGwnLCAnLS1jaGVjayddLCAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpIC0+XG4gICAgICAgIGlmIGNvZGUgaXMgMFxuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcigpKVxuXG4gICAgICBhcG1Qcm9jZXNzLm9uV2lsbFRocm93RXJyb3IgKHtlcnJvciwgaGFuZGxlfSkgLT5cbiAgICAgICAgaGFuZGxlKClcbiAgICAgICAgcmVqZWN0KGVycm9yKVxuXG4gIHJlbW92ZVBhY2thZ2VOYW1lRnJvbURpc2FibGVkUGFja2FnZXM6IChwYWNrYWdlTmFtZSkgLT5cbiAgICBhdG9tLmNvbmZpZy5yZW1vdmVBdEtleVBhdGgoJ2NvcmUuZGlzYWJsZWRQYWNrYWdlcycsIHBhY2thZ2VOYW1lKVxuXG4gICMgRW1pdHMgdGhlIGFwcHJvcHJpYXRlIGV2ZW50IGZvciB0aGUgZ2l2ZW4gcGFja2FnZS5cbiAgI1xuICAjIEFsbCBldmVudHMgYXJlIGVpdGhlciBvZiB0aGUgZm9ybSBgdGhlbWUtZm9vYCBvciBgcGFja2FnZS1mb29gIGRlcGVuZGluZyBvblxuICAjIHdoZXRoZXIgdGhlIGV2ZW50IGlzIGZvciBhIHRoZW1lIG9yIGEgbm9ybWFsIHBhY2thZ2UuIFRoaXMgbWV0aG9kIHN0YW5kYXJkaXplc1xuICAjIHRoZSBsb2dpYyB0byBkZXRlcm1pbmUgaWYgYSBwYWNrYWdlIGlzIGEgdGhlbWUgb3Igbm90IGFuZCBmb3JtYXRzIHRoZSBldmVudFxuICAjIG5hbWUgYXBwcm9wcmlhdGVseS5cbiAgI1xuICAjIGV2ZW50TmFtZSAtIFRoZSBldmVudCBuYW1lIHN1ZmZpeCB7U3RyaW5nfSBvZiB0aGUgZXZlbnQgdG8gZW1pdC5cbiAgIyBwYWNrIC0gVGhlIHBhY2thZ2UgZm9yIHdoaWNoIHRoZSBldmVudCBpcyBiZWluZyBlbWl0dGVkLlxuICAjIGVycm9yIC0gQW55IGVycm9yIGluZm9ybWF0aW9uIHRvIGJlIGluY2x1ZGVkIGluIHRoZSBjYXNlIG9mIGFuIGVycm9yLlxuICBlbWl0UGFja2FnZUV2ZW50OiAoZXZlbnROYW1lLCBwYWNrLCBlcnJvcikgLT5cbiAgICB0aGVtZSA9IHBhY2sudGhlbWUgPyBwYWNrLm1ldGFkYXRhPy50aGVtZVxuICAgIGV2ZW50TmFtZSA9IGlmIHRoZW1lIHRoZW4gXCJ0aGVtZS0je2V2ZW50TmFtZX1cIiBlbHNlIFwicGFja2FnZS0je2V2ZW50TmFtZX1cIlxuICAgIEBlbWl0dGVyLmVtaXQoZXZlbnROYW1lLCB7cGFjaywgZXJyb3J9KVxuXG4gIG9uOiAoc2VsZWN0b3JzLCBjYWxsYmFjaykgLT5cbiAgICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBmb3Igc2VsZWN0b3IgaW4gc2VsZWN0b3JzLnNwbGl0KFwiIFwiKVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQgQGVtaXR0ZXIub24oc2VsZWN0b3IsIGNhbGxiYWNrKVxuICAgIHN1YnNjcmlwdGlvbnNcblxuY3JlYXRlSnNvblBhcnNlRXJyb3IgPSAobWVzc2FnZSwgcGFyc2VFcnJvciwgc3Rkb3V0KSAtPlxuICBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKVxuICBlcnJvci5zdGRvdXQgPSAnJ1xuICBlcnJvci5zdGRlcnIgPSBcIiN7cGFyc2VFcnJvci5tZXNzYWdlfTogI3tzdGRvdXR9XCJcbiAgZXJyb3JcblxuY3JlYXRlUHJvY2Vzc0Vycm9yID0gKG1lc3NhZ2UsIHByb2Nlc3NFcnJvcikgLT5cbiAgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSlcbiAgZXJyb3Iuc3Rkb3V0ID0gJydcbiAgZXJyb3Iuc3RkZXJyID0gcHJvY2Vzc0Vycm9yLm1lc3NhZ2VcbiAgZXJyb3JcblxuaGFuZGxlUHJvY2Vzc0Vycm9ycyA9IChhcG1Qcm9jZXNzLCBtZXNzYWdlLCBjYWxsYmFjaykgLT5cbiAgYXBtUHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yICh7ZXJyb3IsIGhhbmRsZX0pIC0+XG4gICAgaGFuZGxlKClcbiAgICBjYWxsYmFjayhjcmVhdGVQcm9jZXNzRXJyb3IobWVzc2FnZSwgZXJyb3IpKVxuIl19
