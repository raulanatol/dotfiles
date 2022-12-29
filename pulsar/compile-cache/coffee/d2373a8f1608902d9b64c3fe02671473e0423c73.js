(function() {
  var AtomIoClient, fs, glob, path, remote, request;

  fs = require('fs-plus');

  path = require('path');

  remote = require('electron').remote;

  glob = require('glob');

  request = require('request');

  module.exports = AtomIoClient = (function() {
    function AtomIoClient(packageManager, baseURL) {
      this.packageManager = packageManager;
      this.baseURL = baseURL;
      if (this.baseURL == null) {
        this.baseURL = 'https://api.pulsar-edit.dev/api/';
      }
      this.expiry = 1000 * 60 * 60 * 12;
      this.createAvatarCache();
      this.expireAvatarCache();
    }

    AtomIoClient.prototype.avatar = function(login, callback) {
      return this.cachedAvatar(login, (function(_this) {
        return function(err, cached) {
          var stale;
          if (cached) {
            stale = Date.now() - parseInt(cached.split('-').pop()) > _this.expiry;
          }
          if (cached && (!stale || !_this.online())) {
            return callback(null, cached);
          } else {
            return _this.fetchAndCacheAvatar(login, callback);
          }
        };
      })(this));
    };

    AtomIoClient.prototype["package"] = function(name, callback) {
      var data, packagePath;
      packagePath = "packages/" + name;
      data = this.fetchFromCache(packagePath);
      if (data) {
        return callback(null, data);
      } else {
        return this.request(packagePath, callback);
      }
    };

    AtomIoClient.prototype.featuredPackages = function(callback) {
      var data;
      data = this.fetchFromCache('packages/featured');
      if (data) {
        return callback(null, data);
      } else {
        return this.getFeatured(false, callback);
      }
    };

    AtomIoClient.prototype.featuredThemes = function(callback) {
      var data;
      data = this.fetchFromCache('themes/featured');
      if (data) {
        return callback(null, data);
      } else {
        return this.getFeatured(true, callback);
      }
    };

    AtomIoClient.prototype.getFeatured = function(loadThemes, callback) {
      return this.packageManager.getFeatured(loadThemes).then((function(_this) {
        return function(packages) {
          var cached, key;
          key = loadThemes ? 'themes/featured' : 'packages/featured';
          cached = {
            data: packages,
            createdOn: Date.now()
          };
          localStorage.setItem(_this.cacheKeyForPath(key), JSON.stringify(cached));
          return callback(null, packages);
        };
      })(this))["catch"](function(error) {
        return callback(error, null);
      });
    };

    AtomIoClient.prototype.request = function(path, callback) {
      var options;
      options = {
        url: "" + this.baseURL + path,
        headers: {
          'User-Agent': navigator.userAgent
        },
        gzip: true
      };
      return request(options, (function(_this) {
        return function(err, res, body) {
          var cached, error;
          if (err) {
            return callback(err);
          }
          try {
            body = _this.parseJSON(body);
            delete body.versions;
            cached = {
              data: body,
              createdOn: Date.now()
            };
            localStorage.setItem(_this.cacheKeyForPath(path), JSON.stringify(cached));
            return callback(err, cached.data);
          } catch (error1) {
            error = error1;
            return callback(error);
          }
        };
      })(this));
    };

    AtomIoClient.prototype.cacheKeyForPath = function(path) {
      return "settings-view:" + path;
    };

    AtomIoClient.prototype.online = function() {
      return navigator.onLine;
    };

    AtomIoClient.prototype.fetchFromCache = function(packagePath) {
      var cached;
      cached = localStorage.getItem(this.cacheKeyForPath(packagePath));
      cached = cached ? this.parseJSON(cached) : void 0;
      if ((cached != null) && (!this.online() || Date.now() - cached.createdOn < this.expiry)) {
        return cached.data;
      } else {
        return null;
      }
    };

    AtomIoClient.prototype.createAvatarCache = function() {
      return fs.makeTree(this.getCachePath());
    };

    AtomIoClient.prototype.avatarPath = function(login) {
      return path.join(this.getCachePath(), login + "-" + (Date.now()));
    };

    AtomIoClient.prototype.cachedAvatar = function(login, callback) {
      return glob(this.avatarGlob(login), (function(_this) {
        return function(err, files) {
          var createdOn, filename, i, imagePath, len, ref;
          if (err) {
            return callback(err);
          }
          files.sort().reverse();
          for (i = 0, len = files.length; i < len; i++) {
            imagePath = files[i];
            filename = path.basename(imagePath);
            ref = filename.split('-'), createdOn = ref[ref.length - 1];
            if (Date.now() - parseInt(createdOn) < _this.expiry) {
              return callback(null, imagePath);
            }
          }
          return callback(null, null);
        };
      })(this));
    };

    AtomIoClient.prototype.avatarGlob = function(login) {
      return path.join(this.getCachePath(), login + "-*([0-9])");
    };

    AtomIoClient.prototype.fetchAndCacheAvatar = function(login, callback) {
      var imagePath, requestObject;
      if (!this.online()) {
        return callback(null, null);
      } else {
        imagePath = this.avatarPath(login);
        requestObject = {
          url: "https://avatars.githubusercontent.com/" + login,
          headers: {
            'User-Agent': navigator.userAgent
          }
        };
        return request.head(requestObject, function(error, response, body) {
          var writeStream;
          if ((error != null) || response.statusCode !== 200 || !response.headers['content-type'].startsWith('image/')) {
            return callback(error);
          } else {
            writeStream = fs.createWriteStream(imagePath);
            writeStream.on('finish', function() {
              return callback(null, imagePath);
            });
            writeStream.on('error', function(error) {
              writeStream.close();
              try {
                if (fs.existsSync(imagePath)) {
                  fs.unlinkSync(imagePath);
                }
              } catch (error1) {}
              return callback(error);
            });
            return request(requestObject).pipe(writeStream);
          }
        });
      }
    };

    AtomIoClient.prototype.expireAvatarCache = function() {
      var deleteAvatar;
      deleteAvatar = (function(_this) {
        return function(child) {
          var avatarPath;
          avatarPath = path.join(_this.getCachePath(), child);
          return fs.unlink(avatarPath, function(error) {
            if (error && error.code !== 'ENOENT') {
              return console.warn("Error deleting avatar (" + error.code + "): " + avatarPath);
            }
          });
        };
      })(this);
      return fs.readdir(this.getCachePath(), function(error, _files) {
        var children, filename, files, i, key, len, parts, results, stamp;
        if (_files == null) {
          _files = [];
        }
        files = {};
        for (i = 0, len = _files.length; i < len; i++) {
          filename = _files[i];
          parts = filename.split('-');
          stamp = parts.pop();
          key = parts.join('-');
          if (files[key] == null) {
            files[key] = [];
          }
          files[key].push(key + "-" + stamp);
        }
        results = [];
        for (key in files) {
          children = files[key];
          children.sort();
          children.pop();
          results.push(children.forEach(deleteAvatar));
        }
        return results;
      });
    };

    AtomIoClient.prototype.getCachePath = function() {
      return this.cachePath != null ? this.cachePath : this.cachePath = path.join(remote.app.getPath('userData'), 'Cache', 'settings-view');
    };

    AtomIoClient.prototype.search = function(query, options) {
      var qs;
      qs = {
        q: query
      };
      if (options.themes) {
        qs.filter = 'theme';
      } else if (options.packages) {
        qs.filter = 'package';
      }
      options = {
        url: this.baseURL + "packages/search",
        headers: {
          'User-Agent': navigator.userAgent
        },
        qs: qs,
        gzip: true
      };
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return request(options, function(err, res, textBody) {
            var body, e, error;
            if (err) {
              error = new Error("Searching for \u201C" + query + "\u201D failed.");
              error.stderr = err.message;
              return reject(error);
            } else {
              try {
                body = _this.parseJSON(textBody);
                if (body.filter) {
                  resolve(body.filter(function(pkg) {
                    var ref;
                    return ((ref = pkg.releases) != null ? ref.latest : void 0) != null;
                  }).map(function(arg) {
                    var downloads, metadata, readme, repository, stargazers_count;
                    readme = arg.readme, metadata = arg.metadata, downloads = arg.downloads, stargazers_count = arg.stargazers_count, repository = arg.repository;
                    return Object.assign(metadata, {
                      readme: readme,
                      downloads: downloads,
                      stargazers_count: stargazers_count,
                      repository: repository.url
                    });
                  }));
                } else {

                }
                error = new Error("Searching for \u201C" + query + "\u201D failed.\n");
                error.stderr = "API returned: " + textBody;
                return reject(error);
              } catch (error1) {
                e = error1;
                error = new Error("Searching for \u201C" + query + "\u201D failed.");
                error.stderr = e.message + '\n' + textBody;
                return reject(error);
              }
            }
          });
        };
      })(this));
    };

    AtomIoClient.prototype.parseJSON = function(s) {
      return JSON.parse(s);
    };

    return AtomIoClient;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL0FwcGxpY2F0aW9ucy9QdWxzYXIuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvc2V0dGluZ3Mtdmlldy9saWIvYXRvbS1pby1jbGllbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNOLFNBQVUsT0FBQSxDQUFRLFVBQVI7O0VBRVgsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFFVixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1Msc0JBQUMsY0FBRCxFQUFrQixPQUFsQjtNQUFDLElBQUMsQ0FBQSxpQkFBRDtNQUFpQixJQUFDLENBQUEsVUFBRDs7UUFDN0IsSUFBQyxDQUFBLFVBQVc7O01BRVosSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFBLEdBQU8sRUFBUCxHQUFZLEVBQVosR0FBaUI7TUFDM0IsSUFBQyxDQUFBLGlCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQUxXOzsyQkFRYixNQUFBLEdBQVEsU0FBQyxLQUFELEVBQVEsUUFBUjthQUNOLElBQUMsQ0FBQSxZQUFELENBQWMsS0FBZCxFQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRCxFQUFNLE1BQU47QUFDbkIsY0FBQTtVQUFBLElBQW9FLE1BQXBFO1lBQUEsS0FBQSxHQUFRLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBQSxHQUFhLFFBQUEsQ0FBUyxNQUFNLENBQUMsS0FBUCxDQUFhLEdBQWIsQ0FBaUIsQ0FBQyxHQUFsQixDQUFBLENBQVQsQ0FBYixHQUFpRCxLQUFDLENBQUEsT0FBMUQ7O1VBQ0EsSUFBRyxNQUFBLElBQVcsQ0FBQyxDQUFJLEtBQUosSUFBYSxDQUFJ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QUFLLENBQUMsTUFBTixHQUFlLGdCQUFBLEdBQW1CO3VCQUNsQyxNQUFBLENBQU8sS0FBUCxFQWJGO2VBQUEsY0FBQTtnQkFlTTtnQkFDSixLQUFBLEdBQVEsSUFBSSxLQUFKLENBQVUsc0JBQUEsR0FBdUIsS0FBdkIsR0FBNkIsZ0JBQXZDO2dCQUNSLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBQyxDQUFDLE9BQUYsR0FBWSxJQUFaLEdBQW1CO3VCQUNsQyxNQUFBLENBQU8sS0FBUCxFQWxCRjtlQUxGOztVQURlLENBQWpCO1FBRFU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVo7SUFmTTs7MkJBMENSLFNBQUEsR0FBVyxTQUFDLENBQUQ7YUFDVCxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVg7SUFEUzs7Ozs7QUFoT2IiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbntyZW1vdGV9ID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbmdsb2IgPSByZXF1aXJlICdnbG9iJ1xucmVxdWVzdCA9IHJlcXVpcmUgJ3JlcXVlc3QnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEF0b21Jb0NsaWVudFxuICBjb25zdHJ1Y3RvcjogKEBwYWNrYWdlTWFuYWdlciwgQGJhc2VVUkwpIC0+XG4gICAgQGJhc2VVUkwgPz0gJ2h0dHBzOi8vYXBpLnB1bHNhci1lZGl0LmRldi9hcGkvJ1xuICAgICMgMTIgaG91ciBleHBpcnlcbiAgICBAZXhwaXJ5ID0gMTAwMCAqIDYwICogNjAgKiAxMlxuICAgIEBjcmVhdGVBdmF0YXJDYWNoZSgpXG4gICAgQGV4cGlyZUF2YXRhckNhY2hlKClcblxuICAjIFB1YmxpYzogR2V0IGFuIGF2YXRhciBpbWFnZSBmcm9tIHRoZSBmaWxlc3lzdGVtLCBmZXRjaGluZyBpdCBmaXJzdCBpZiBuZWNlc3NhcnlcbiAgYXZhdGFyOiAobG9naW4sIGNhbGxiYWNrKSAtPlxuICAgIEBjYWNoZWRBdmF0YXIgbG9naW4sIChlcnIsIGNhY2hlZCkgPT5cbiAgICAgIHN0YWxlID0gRGF0ZS5ub3coKSAtIHBhcnNlSW50KGNhY2hlZC5zcGxpdCgnLScpLnBvcCgpKSA+IEBleHBpcnkgaWYgY2FjaGVkXG4gICAgICBpZiBjYWNoZWQgYW5kIChub3Qgc3RhbGUgb3Igbm90IEBvbmxpbmUoKSlcbiAgICAgICAgY2FsbGJhY2sgbnVsbCwgY2FjaGVkXG4gICAgICBlbHNlXG4gICAgICAgIEBmZXRjaEFuZENhY2hlQXZhdGFyKGxvZ2luLCBjYWxsYmFjaylcblxuICAjIFB1YmxpYzogZ2V0IGEgcGFja2FnZSBmcm9tIHRoZSBhdG9tLmlvIEFQSSwgd2l0aCB0aGUgYXBwcm9wcmlhdGUgbGV2ZWwgb2ZcbiAgIyBjYWNoaW5nLlxuICBwYWNrYWdlOiAobmFtZSwgY2FsbGJhY2spIC0+XG4gICAgcGFja2FnZVBhdGggPSBcInBhY2thZ2VzLyN7bmFtZX1cIlxuICAgIGRhdGEgPSBAZmV0Y2hGcm9tQ2FjaGUocGFja2FnZVBhdGgpXG4gICAgaWYgZGF0YVxuICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSlcbiAgICBlbHNlXG4gICAgICBAcmVxdWVzdChwYWNrYWdlUGF0aCwgY2FsbGJhY2spXG5cbiAgZmVhdHVyZWRQYWNrYWdlczogKGNhbGxiYWNrKSAtPlxuICAgICMgVE9ETyBjbGVhbiB1cCBjYWNoaW5nIGNvcHlwYXN0YVxuICAgIGRhdGEgPSBAZmV0Y2hGcm9tQ2FjaGUgJ3BhY2thZ2VzL2ZlYXR1cmVkJ1xuICAgIGlmIGRhdGFcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpXG4gICAgZWxzZVxuICAgICAgQGdldEZlYXR1cmVkKGZhbHNlLCBjYWxsYmFjaylcblxuICBmZWF0dXJlZFRoZW1lczogKGNhbGxiYWNrKSAtPlxuICAgICMgVE9ETyBjbGVhbiB1cCBjYWNoaW5nIGNvcHlwYXN0YVxuICAgIGRhdGEgPSBAZmV0Y2hGcm9tQ2FjaGUgJ3RoZW1lcy9mZWF0dXJlZCdcbiAgICBpZiBkYXRhXG4gICAgICBjYWxsYmFjayhudWxsLCBkYXRhKVxuICAgIGVsc2VcbiAgICAgIEBnZXRGZWF0dXJlZCh0cnVlLCBjYWxsYmFjaylcblxuICBnZXRGZWF0dXJlZDogKGxvYWRUaGVtZXMsIGNhbGxiYWNrKSAtPlxuICAgICMgYXBtIGFscmVhZHkgZG9lcyB0aGlzLCBtaWdodCBhcyB3ZWxsIHVzZSBpdCBpbnN0ZWFkIG9mIHJlcXVlc3QgaSBndWVzcz8gVGhlXG4gICAgIyBkb3duc2lkZSBpcyB0aGF0IEkgbmVlZCB0byByZXBlYXQgY2FjaGluZyBsb2dpYyBoZXJlLlxuICAgIEBwYWNrYWdlTWFuYWdlci5nZXRGZWF0dXJlZChsb2FkVGhlbWVzKVxuICAgICAgLnRoZW4gKHBhY2thZ2VzKSA9PlxuICAgICAgICAjIGNvcHlwYXN0YSBmcm9tIGJlbG93XG4gICAgICAgIGtleSA9IGlmIGxvYWRUaGVtZXMgdGhlbiAndGhlbWVzL2ZlYXR1cmVkJyBlbHNlICdwYWNrYWdlcy9mZWF0dXJlZCdcbiAgICAgICAgY2FjaGVkID1cbiAgICAgICAgICBkYXRhOiBwYWNrYWdlc1xuICAgICAgICAgIGNyZWF0ZWRPbjogRGF0ZS5ub3coKVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShAY2FjaGVLZXlGb3JQYXRoKGtleSksIEpTT04uc3RyaW5naWZ5KGNhY2hlZCkpXG4gICAgICAgICMgZW5kIGNvcHlwYXN0YVxuICAgICAgICBjYWxsYmFjayhudWxsLCBwYWNrYWdlcylcbiAgICAgIC5jYXRjaCAoZXJyb3IpIC0+XG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKVxuXG4gIHJlcXVlc3Q6IChwYXRoLCBjYWxsYmFjaykgLT5cbiAgICBvcHRpb25zID0ge1xuICAgICAgdXJsOiBcIiN7QGJhc2VVUkx9I3twYXRofVwiXG4gICAgICBoZWFkZXJzOiB7J1VzZXItQWdlbnQnOiBuYXZpZ2F0b3IudXNlckFnZW50fVxuICAgICAgZ3ppcDogdHJ1ZVxuICAgIH1cblxuICAgIHJlcXVlc3Qgb3B0aW9ucywgKGVyciwgcmVzLCBib2R5KSA9PlxuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycikgaWYgZXJyXG5cbiAgICAgIHRyeVxuICAgICAgICAjIE5PVEU6IHJlcXVlc3QncyBqc29uIG9wdGlvbiBkb2VzIG5vdCBwb3B1bGF0ZSBlcnIgaWYgcGFyc2luZyBmYWlscyxcbiAgICAgICAgIyBzbyB3ZSBkbyBpdCBtYW51YWxseVxuICAgICAgICBib2R5ID0gQHBhcnNlSlNPTihib2R5KVxuICAgICAgICBkZWxldGUgYm9keS52ZXJzaW9uc1xuXG4gICAgICAgIGNhY2hlZCA9XG4gICAgICAgICAgZGF0YTogYm9keVxuICAgICAgICAgIGNyZWF0ZWRPbjogRGF0ZS5ub3coKVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShAY2FjaGVLZXlGb3JQYXRoKHBhdGgpLCBKU09OLnN0cmluZ2lmeShjYWNoZWQpKVxuICAgICAgICBjYWxsYmFjayhlcnIsIGNhY2hlZC5kYXRhKVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgY2FsbGJhY2soZXJyb3IpXG5cbiAgY2FjaGVLZXlGb3JQYXRoOiAocGF0aCkgLT5cbiAgICBcInNldHRpbmdzLXZpZXc6I3twYXRofVwiXG5cbiAgb25saW5lOiAtPlxuICAgIG5hdmlnYXRvci5vbkxpbmVcblxuICAjIFRoaXMgY291bGQgdXNlIGEgYmV0dGVyIG5hbWUsIHNpbmNlIGl0IGNoZWNrcyB3aGV0aGVyIGl0J3MgYXBwcm9wcmlhdGUgdG8gcmV0dXJuXG4gICMgdGhlIGNhY2hlZCBkYXRhIGFuZCBwcmV0ZW5kcyBpdCdzIG51bGwgaWYgaXQncyBzdGFsZSBhbmQgd2UncmUgb25saW5lXG4gIGZldGNoRnJvbUNhY2hlOiAocGFja2FnZVBhdGgpIC0+XG4gICAgY2FjaGVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oQGNhY2hlS2V5Rm9yUGF0aChwYWNrYWdlUGF0aCkpXG4gICAgY2FjaGVkID0gaWYgY2FjaGVkIHRoZW4gQHBhcnNlSlNPTihjYWNoZWQpXG4gICAgaWYgY2FjaGVkPyBhbmQgKG5vdCBAb25saW5lKCkgb3IgRGF0ZS5ub3coKSAtIGNhY2hlZC5jcmVhdGVkT24gPCBAZXhwaXJ5KVxuICAgICAgcmV0dXJuIGNhY2hlZC5kYXRhXG4gICAgZWxzZVxuICAgICAgIyBmYWxzeSBkYXRhIG1lYW5zIFwidHJ5IHRvIGhpdCB0aGUgbmV0d29ya1wiXG4gICAgICByZXR1cm4gbnVsbFxuXG4gIGNyZWF0ZUF2YXRhckNhY2hlOiAtPlxuICAgIGZzLm1ha2VUcmVlKEBnZXRDYWNoZVBhdGgoKSlcblxuICBhdmF0YXJQYXRoOiAobG9naW4pIC0+XG4gICAgcGF0aC5qb2luIEBnZXRDYWNoZVBhdGgoKSwgXCIje2xvZ2lufS0je0RhdGUubm93KCl9XCJcblxuICBjYWNoZWRBdmF0YXI6IChsb2dpbiwgY2FsbGJhY2spIC0+XG4gICAgZ2xvYiBAYXZhdGFyR2xvYihsb2dpbiksIChlcnIsIGZpbGVzKSA9PlxuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycikgaWYgZXJyXG4gICAgICBmaWxlcy5zb3J0KCkucmV2ZXJzZSgpXG4gICAgICBmb3IgaW1hZ2VQYXRoIGluIGZpbGVzXG4gICAgICAgIGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZShpbWFnZVBhdGgpXG4gICAgICAgIFsuLi4sIGNyZWF0ZWRPbl0gPSBmaWxlbmFtZS5zcGxpdCgnLScpXG4gICAgICAgIGlmIERhdGUubm93KCkgLSBwYXJzZUludChjcmVhdGVkT24pIDwgQGV4cGlyeVxuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBpbWFnZVBhdGgpXG4gICAgICBjYWxsYmFjayhudWxsLCBudWxsKVxuXG4gIGF2YXRhckdsb2I6IChsb2dpbikgLT5cbiAgICBwYXRoLmpvaW4gQGdldENhY2hlUGF0aCgpLCBcIiN7bG9naW59LSooWzAtOV0pXCJcblxuICBmZXRjaEFuZENhY2hlQXZhdGFyOiAobG9naW4sIGNhbGxiYWNrKSAtPlxuICAgIGlmIG5vdCBAb25saW5lKClcbiAgICAgIGNhbGxiYWNrKG51bGwsIG51bGwpXG4gICAgZWxzZVxuICAgICAgaW1hZ2VQYXRoID0gQGF2YXRhclBhdGggbG9naW5cbiAgICAgIHJlcXVlc3RPYmplY3QgPSB7XG4gICAgICAgIHVybDogXCJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLyN7bG9naW59XCJcbiAgICAgICAgaGVhZGVyczogeydVc2VyLUFnZW50JzogbmF2aWdhdG9yLnVzZXJBZ2VudH1cbiAgICAgIH1cbiAgICAgIHJlcXVlc3QuaGVhZCByZXF1ZXN0T2JqZWN0LCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSAtPlxuICAgICAgICBpZiBlcnJvcj8gb3IgcmVzcG9uc2Uuc3RhdHVzQ29kZSBpc250IDIwMCBvciBub3QgcmVzcG9uc2UuaGVhZGVyc1snY29udGVudC10eXBlJ10uc3RhcnRzV2l0aCgnaW1hZ2UvJylcbiAgICAgICAgICBjYWxsYmFjayhlcnJvcilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHdyaXRlU3RyZWFtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0gaW1hZ2VQYXRoXG4gICAgICAgICAgd3JpdGVTdHJlYW0ub24gJ2ZpbmlzaCcsIC0+IGNhbGxiYWNrKG51bGwsIGltYWdlUGF0aClcbiAgICAgICAgICB3cml0ZVN0cmVhbS5vbiAnZXJyb3InLCAoZXJyb3IpIC0+XG4gICAgICAgICAgICB3cml0ZVN0cmVhbS5jbG9zZSgpXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgZnMudW5saW5rU3luYyBpbWFnZVBhdGggaWYgZnMuZXhpc3RzU3luYyBpbWFnZVBhdGhcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycm9yKVxuICAgICAgICAgIHJlcXVlc3QocmVxdWVzdE9iamVjdCkucGlwZSh3cml0ZVN0cmVhbSlcblxuICAjIFRoZSBjYWNoZSBleHBpcnkgZG9lc24ndCBuZWVkIHRvIGJlIGNsZXZlciwgb3IgZXZlbiBjb21wYXJlIGRhdGVzLCBpdCBqdXN0XG4gICMgbmVlZHMgdG8gYWx3YXlzIGtlZXAgYXJvdW5kIHRoZSBuZXdlc3QgaXRlbSwgYW5kIHRoYXQgaXRlbSBvbmx5LiBUaGUgbG9jYWxTdG9yYWdlXG4gICMgY2FjaGUgdXBkYXRlcyBpbiBwbGFjZSwgc28gaXQgZG9lc24ndCBuZWVkIHRvIGJlIHB1cmdlZC5cblxuICBleHBpcmVBdmF0YXJDYWNoZTogLT5cbiAgICBkZWxldGVBdmF0YXIgPSAoY2hpbGQpID0+XG4gICAgICBhdmF0YXJQYXRoID0gcGF0aC5qb2luKEBnZXRDYWNoZVBhdGgoKSwgY2hpbGQpXG4gICAgICBmcy51bmxpbmsgYXZhdGFyUGF0aCwgKGVycm9yKSAtPlxuICAgICAgICBpZiBlcnJvciBhbmQgZXJyb3IuY29kZSBpc250ICdFTk9FTlQnICMgSWdub3JlIGNhY2hlIHBhdGhzIHRoYXQgZG9uJ3QgZXhpc3RcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJFcnJvciBkZWxldGluZyBhdmF0YXIgKCN7ZXJyb3IuY29kZX0pOiAje2F2YXRhclBhdGh9XCIpXG5cbiAgICBmcy5yZWFkZGlyIEBnZXRDYWNoZVBhdGgoKSwgKGVycm9yLCBfZmlsZXMpIC0+XG4gICAgICBfZmlsZXMgPz0gW11cbiAgICAgIGZpbGVzID0ge31cbiAgICAgIGZvciBmaWxlbmFtZSBpbiBfZmlsZXNcbiAgICAgICAgcGFydHMgPSBmaWxlbmFtZS5zcGxpdCgnLScpXG4gICAgICAgIHN0YW1wID0gcGFydHMucG9wKClcbiAgICAgICAga2V5ID0gcGFydHMuam9pbignLScpXG4gICAgICAgIGZpbGVzW2tleV0gPz0gW11cbiAgICAgICAgZmlsZXNba2V5XS5wdXNoIFwiI3trZXl9LSN7c3RhbXB9XCJcblxuICAgICAgZm9yIGtleSwgY2hpbGRyZW4gb2YgZmlsZXNcbiAgICAgICAgY2hpbGRyZW4uc29ydCgpXG4gICAgICAgIGNoaWxkcmVuLnBvcCgpICMga2VlcFxuICAgICAgICAjIFJpZ2h0IG5vdyBhIGJ1bmNoIG9mIGNsaWVudHMgbWlnaHQgYmUgaW5zdGFudGlhdGVkIGF0IG9uY2UsIHNvXG4gICAgICAgICMgd2UgY2FuIGp1c3QgaWdub3JlIGF0dGVtcHRzIHRvIHVubGluayBmaWxlcyB0aGF0IGhhdmUgYWxyZWFkeSBiZWVuIHJlbW92ZWRcbiAgICAgICAgIyAtIHRoaXMgc2hvdWxkIGJlIGZpeGVkIHdpdGggYSBzaW5nbGV0b24gY2xpZW50XG4gICAgICAgIGNoaWxkcmVuLmZvckVhY2goZGVsZXRlQXZhdGFyKVxuXG4gIGdldENhY2hlUGF0aDogLT5cbiAgICBAY2FjaGVQYXRoID89IHBhdGguam9pbihyZW1vdGUuYXBwLmdldFBhdGgoJ3VzZXJEYXRhJyksICdDYWNoZScsICdzZXR0aW5ncy12aWV3JylcblxuICBzZWFyY2g6IChxdWVyeSwgb3B0aW9ucykgLT5cbiAgICBxcyA9IHtxOiBxdWVyeX1cblxuICAgIGlmIG9wdGlvbnMudGhlbWVzXG4gICAgICBxcy5maWx0ZXIgPSAndGhlbWUnXG4gICAgZWxzZSBpZiBvcHRpb25zLnBhY2thZ2VzXG4gICAgICBxcy5maWx0ZXIgPSAncGFja2FnZSdcblxuICAgIG9wdGlvbnMgPSB7XG4gICAgICB1cmw6IFwiI3tAYmFzZVVSTH1wYWNrYWdlcy9zZWFyY2hcIlxuICAgICAgaGVhZGVyczogeydVc2VyLUFnZW50JzogbmF2aWdhdG9yLnVzZXJBZ2VudH1cbiAgICAgIHFzOiBxc1xuICAgICAgZ3ppcDogdHJ1ZVxuICAgIH1cblxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICByZXF1ZXN0IG9wdGlvbnMsIChlcnIsIHJlcywgdGV4dEJvZHkpID0+XG4gICAgICAgIGlmIGVyclxuICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKFwiU2VhcmNoaW5nIGZvciBcXHUyMDFDI3txdWVyeX1cXHUyMDFEIGZhaWxlZC5cIilcbiAgICAgICAgICBlcnJvci5zdGRlcnIgPSBlcnIubWVzc2FnZVxuICAgICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgIyBOT1RFOiByZXF1ZXN0J3MganNvbiBvcHRpb24gZG9lcyBub3QgcG9wdWxhdGUgZXJyIGlmIHBhcnNpbmcgZmFpbHMsXG4gICAgICAgICAgICAjIHNvIHdlIGRvIGl0IG1hbnVhbGx5XG4gICAgICAgICAgICBib2R5ID0gQHBhcnNlSlNPTih0ZXh0Qm9keSlcbiAgICAgICAgICAgIGlmIGJvZHkuZmlsdGVyXG4gICAgICAgICAgICAgIHJlc29sdmUoXG4gICAgICAgICAgICAgICAgYm9keS5maWx0ZXIgKHBrZykgLT4gcGtnLnJlbGVhc2VzPy5sYXRlc3Q/XG4gICAgICAgICAgICAgICAgICAgIC5tYXAgKHtyZWFkbWUsIG1ldGFkYXRhLCBkb3dubG9hZHMsIHN0YXJnYXplcnNfY291bnQsIHJlcG9zaXRvcnl9KSAtPlxuICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24gbWV0YWRhdGEsIHtyZWFkbWUsIGRvd25sb2Fkcywgc3RhcmdhemVyc19jb3VudCwgcmVwb3NpdG9yeTogcmVwb3NpdG9yeS51cmx9XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKFwiU2VhcmNoaW5nIGZvciBcXHUyMDFDI3txdWVyeX1cXHUyMDFEIGZhaWxlZC5cXG5cIilcbiAgICAgICAgICAgIGVycm9yLnN0ZGVyciA9IFwiQVBJIHJldHVybmVkOiBcIiArIHRleHRCb2R5XG4gICAgICAgICAgICByZWplY3QgZXJyb3JcblxuICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKFwiU2VhcmNoaW5nIGZvciBcXHUyMDFDI3txdWVyeX1cXHUyMDFEIGZhaWxlZC5cIilcbiAgICAgICAgICAgIGVycm9yLnN0ZGVyciA9IGUubWVzc2FnZSArICdcXG4nICsgdGV4dEJvZHlcbiAgICAgICAgICAgIHJlamVjdCBlcnJvclxuXG4gIHBhcnNlSlNPTjogKHMpIC0+XG4gICAgSlNPTi5wYXJzZShzKVxuIl19
