/*!
 * angular-kpax v0.0.1
 * Copyright(C) 2014 Dg Nechtan <dnechtan@gmail.com> (http://nechtan.github.io)
 */

angular.module('ngSocketIO', [])
  .provider('ioFactory', function () {
    'use strict';

    var defaultPrefix = 'socket:';
    var ioSocket = null;

    this.$get = ['$rootScope', '$timeout',
      function ($rootScope, $timeout) {

        var asyncAngularify = function (socket, callback) {
          return callback ? function () {
            var args = arguments;
            $timeout(function () {
              callback.apply(socket, args);
            }, 0);
          } : angular.noop;
        };

        return function ioFactory(options) {

          options = options || {};

          var socket = options.ioSocket || io.connect();
          var prefix = options.prefix || defaultPrefix;
          var defaultScope = options.scope || $rootScope;

          socket.on('error', function (reason) {
            if (/handshake/.test(reason)) {
              console.log('handshake error');
              socket.disconnect();
              if (options.failureRedirect) {
                window.location.href = options.failureRedirect;
              }
            }
          });

          var addListener = function (eventName, callback) {
            socket.on(eventName, asyncAngularify(socket, callback));
          };

          var wrappedSocket = {
            on: addListener,
            addListener: addListener,
            emit: function (eventName, data, callback) {
              return socket.emit(eventName, data, asyncAngularify(socket, callback));
            },
            removeListener: function () {
              return socket.removeListener.apply(socket, arguments);
            },
            forward: function (events, scope) {
              if (events instanceof Array === false) {
                events = [events];
              }
              if (!scope) {
                scope = defaultScope;
              }
              events.forEach(function (eventName) {
                var prefixedEvent = prefix + eventName;
                var forwardBroadcast = asyncAngularify(socket, function (data) {
                  scope.$broadcast(prefixedEvent, data);
                });
                scope.$on('$destroy', function () {
                  socket.removeListener(eventName, forwardBroadcast);
                });
                socket.on(eventName, forwardBroadcast);
              });
            }
          };

          return wrappedSocket;
        };
    }];

  });

angular.module('ngKpax', ['ngSocketIO'])
  .constant('KPAX_SCHEMA', 'kpax:')
  .constant('KPAX_VERSION', '0.0.1')
  .factory('kpax', ['ioFactory', 'KPAX_SCHEMA', 'KPAX_VERSION', '$cacheFactory', '$timeout',
    function (ioFactory, KPAX_SCHEMA, KPAX_VERSION, $cacheFactory, $timeout) {
      'use strict';

      var socket = ioFactory({
        failureRedirect: '/login'
      });

      var cache = $cacheFactory('kpax');

      var _fn = {}, verbs = {}, self = this;

      var newHash = function newHash(prefix) {
        return '_'.concat(prefix || '',
          new Date() * (KPAX_VERSION + Math.random()).replace(/\D/g, ''),
          Math.random().toString(36));
      };

      var $emit = function $emit(options, callback) {
        options = angular.extend({
          cache: true,
          method: 'get',
          url: '',
          params: {},
          data: {}
        }, options || {});
        var cached = false;
        var hash = newHash(options.method + ':' + options.url);
        if (options.cache) {
          var cacheKey = JSON.stringify([options.method, options.url, options.params]);
          if (cached = cache.get(cacheKey)) {
            callback(cached.data);
            return cached._hash;
          }
        }
        _fn[hash] = callback;
        socket.emit('kpax', {
          _hash: hash,
          _key: options.method + ':' + options.url,
          _cache: [options.cache, cacheKey],
          params: options.params
        });
        return hash;
      };

      var $on = function $on(verb, key, callback) {
        // Object jQuery-Ajax-Style
        if (angular.isObject(verb)) {
          var opt = verb;
          if (opt.hasOwnProperty('type'))
            verb = opt.type;
          if (opt.hasOwnProperty('method'))
            verb = opt.method;
          if (opt.hasOwnProperty('url'))
            key = opt.url
          if (angular.isFunction(key)) {
            callback = key;
          } else {
            if (opt.hasOwnProperty('success')) {
              callback = opt.success;
            }
          }
        }
        console.log('set $on', verb + ':' + key);
        _fn[verb + ':' + key] = callback || function (req, res) {
          res.send({});
        };
      };

      socket.on('kpax', function (data) {
        console.log('on kpax', data);
        if (_fn.hasOwnProperty(data._key) && angular.isFunction(_fn[data._key])) {
          console.log('$on _key', data._key);
          var _emit = function (ret) {
            socket.emit('kpax', {
              _hash: data._hash,
              _key: data._key,
              data: ret
            });
          };
          _fn[data._key].call(socket, data, {
            send: _emit,
            emit: _emit,
            json: _emit
          });
          return true;
        }
        if (angular.isFunction(_fn[data._hash])) {
          console.log('$on _hash', data);
          if (angular.isArray(data._cache) && data._cache[0]) {
            cache.put(data._cache[1], data);
            if (angular.isNumber(data._cache[0]) && data._cache[0] > 0) {
              $timeout(function () {
                cache.remove(data._cache[1])
              }, data._cache[0]);
            }
          }
          _fn[data._hash](data.data);
          _fn[data._hash] = null;
        }
      });

      ['get', 'post', 'delete', 'del', 'put', 'head'].map(function (verb) {
        verbs[verb] = function(url, data, params, callback) {
          if(angular.isFunction(params)) {
            callback = params;
          }
          $emit({
            url: url,
            method: verb,
            params: params,
            data: data,
            callback: callback
          })
        };
      });

      verbs.on = $on.bind(socket);
      verbs.emit = verbs.send = $emit.bind(socket);
      verbs.socket = socket;
      verbs.cache = cache;
      verbs.identify = function kpaxIdentify(id) {
        socket.emit('kpax:identify', id);
        return verbs;
      };
      return verbs;

}]);
