(function () {
  class TaskPlugin {
    constructor(handlers, options = {}) {
      this.handlers = {};
      this.io = null;
      this.NotHandled = index_esm.NotHandled;
      this.options = options;

      if (options.Sentry) {
        options.Sentry.configureScope((scope) => {
          scope.setTag("powerupjs_version", "1.21.5");
        });
      }

      const self = this;
      Object.keys(handlers).forEach((command) => {
        self.handlers[command] = function handleCommand(...args) {
          const innerSelf = this;
          return bluebird_1
            .try(() => handlers[command].apply(innerSelf, args))
            .then(process$1);
        };
      });

      this.handlers.callback = function callback(t, cbOpts) {
        return CallbackCache.callback.call(this, t, cbOpts, process$1);
      };

      const anonymousHandlers = [
        "requestWithContext",
        "getAll",
        "get",
        "set",
        "remove",
        "safe",
        "localizeKey",
        "localizeKeys",
        "localizeNode",
        "board",
        "cards",
        "lists",
        "member",
        "organization",
      ];
      anonymousHandlers.forEach((method) => {
        if (lodash_has(HostHandlers, method)) {
          self[method] = HostHandlers[method];
        }
      });
    }

    connect() {
      const self = this;
      const io = initIO(
        this.handlers,
        immutable(this.options, {
          hostHandlers: immutable(HostHandlers, {
            getRestApi() {
              if (!self.restApi) {
                throw new restApiError.ApiNotConfiguredError(
                  "To use the API helper, make sure you specify appKey and appName when you call TrelloPowerup.initialize. For more, https://developers.trello.com/v1.0/reference#rest-api."
                );
              }

              self.restApi.t = this;
              return self.restApi;
            },
          }),
        })
      );
      this.io = io;
      return io
        .request("initialize", Object.keys(this.handlers))
        .then((init) => {
          io.secret = init.secret;
          window.locale = init.locale || "en";

          if (this.options.Sentry && typeof init === "object") {
            // configure static variables that we know won't change this session
            this.options.Sentry.configureScope((scope) => {
              scope.setTag("locale", window.locale);
              scope.setTag("trello_version", init.version || "unknown");

              if (init.member) {
                scope.setUser({
                  id: init.member,
                });
              }
            });
          }

          return initi18n(window.locale, this.options).then(() =>
            io.request("ready")
          );
        })
        .then(() => io);
    }

    request(command, options) {
      return this.io.request(command, options);
    }

    init() {
      if (this.options.appKey && this.options.appName) {
        this.restApi = new RestApi({
          t: this,
          appKey: this.options.appKey,
          appName: this.options.appName,
          apiOrigin: this.options.apiOrigin,
          authOrigin: this.options.authOrigin,
          localStorage: this.options.localStorage,
          tokenStorageKey: this.options.tokenStorageKey,
        });
        return this.connect().tap(() => this.restApi.init());
      }

      if (this.options.appKey || this.options.appName) {
        // if we got here bc they forgot to specify one of the options, try to help them out
        warn(
          "Both appKey and appName must be included to use the API. See more https://developers.trello.com/v1.0/reference#rest-api."
        );
      }

      return this.connect();
    }
  }

  class TaskIFrame {
    constructor(options = {}) {
      this.io = null;
      this.args = [
        {
          context: arg("context", options.context),
          secret: arg("secret", options.secret),
        },
      ].concat(arg("args"));
      this.secret = arg("secret", options.secret);
      this.options = options;
      window.locale = arg("locale", "en"); // we will start getting your localization ready immediately
      // but it won't be guaranteed ready to go until we call your render function

      this.i18nPromise = initi18n(window.locale, options); // since this is for a secondary iframe, if we don't have a secret something is probably wrong
      // Trello won't respond to our requests that don't include a secret

      if (!this.secret) {
        warn(
          "Power-Up iframe initialized without a secret. Requests to Trello will not work."
        );
        warn(
          "If this is an attachment-section or card-back-section make sure you call t.signUrl on the urls you provide."
        );
      }
    }

    init() {
      this.initSentry();
      this.connect();
      this.initApi();
    }

    connect() {
      const handlers = {
        callback(t, options) {
          return CallbackCache.callback.call(this, t, options, process$1);
        },
      };
      this.io = initIO(
        handlers,
        immutable(this.options, {
          secret: arg("secret"),
          hostHandlers: HostHandlers,
        })
      );
    }

    request(command, options) {
      return this.io.request(command, options);
    }

    render(fxRender) {
      if (typeof fxRender !== "function") {
        throw new TypeError("Argument passed to render must be a function");
      }

      const self = this; // cleanup old listeners in case this is called multiple times

      if (self.onMessage) {
        window.removeEventListener("message", self.onMessage, false);
      }

      self.onMessage = (e) => {
        if (e.source === window.parent && e.data === "render") {
          self.i18nPromise.then(() => {
            fxRender();
          });
        }
      };

      window.addEventListener("message", self.onMessage, false);
    }

    initApi() {
      if (!this.options.appKey || !this.options.appName) {
        // if we got here bc they forgot to specify one of the options, try to help them out
        if (this.options.appKey || this.options.appName) {
          warn(
            "Both appKey and appName must be included to use the API. See more at https://developers.trello.com/v1.0/reference#rest-api."
          );
        }

        return;
      }

      this.restApi = new RestApi({
        t: this,
        appKey: this.options.appKey,
        appName: this.options.appName,
        apiOrigin: this.options.apiOrigin,
        authOrigin: this.options.authOrigin,
        localStorage: this.options.localStorage,
        tokenStorageKey: this.options.tokenStorageKey,
      });
      this.restApi.init();
    }

    getRestApi() {
      if (!this.restApi) {
        throw new restApiError.ApiNotConfiguredError(
          "To use the API helper, make sure you specify appKey and appName when you call TrelloPowerUp.iframe. See more at https://developers.trello.com/v1.0/reference#rest-api"
        );
      }

      return this.restApi;
    }
    /**
     * If developers provide their Sentry object, we will be nice and help to set
     * as much context for them as possible. See:
     * https://docs.sentry.io/enriching-error-data/context/?platform=browser
     * https://docs.sentry.io/enriching-error-data/scopes/?platform=browser
     */

    initSentry() {
      if (this.options.Sentry) {
        // in the case of a secondary iframe, the context is signed into the URL
        // this means that we don't have to worry about it changing
        const context = arg("context", this.options.context);
        this.options.Sentry.configureScope((scope) => {
          scope.setTag("locale", arg("locale", "en"));
          scope.setTag("powerupjs_version", "1.21.5");

          if (!context || typeof context !== "object") {
            return;
          }

          scope.setTag("trello_version", context.version || "unknown");

          if (context.member) {
            scope.setUser({
              id: context.member,
            });
          }

          if (context.board) {
            scope.setTag("idBoard", context.board);
          }

          if (context.permissions) {
            Object.keys(context.permissions).forEach((perm) => {
              scope.setExtra(
                "".concat(perm, "_permission"),
                context.permissions[perm]
              );
            });
          }
        });
      }
    }
  }

  class TaskPowerPlug {
    constructor() {
      this.version = "1.21.5";
      //   this.CallbackCache = CallbackCache;
      //   this.PostMessageIO = index_esm;
      //   this.Promise = bluebird_1;
      this.util = {
        colors: {
          //   getHexString,
          //   namedColorStringToHex,
        },
        convert: {
          //   bytesToHexString,
          //   hexStringToUint8Array,
        },
        // crypto: simpleCrypto,
        // initLocalizer: initi18n,
        // makeErrorEnum,
        // relativeUrl,
      };
      //   this.restApiError = restApiError;
      this.initialize = this.initialize.bind(this);
      this.iframe = this.iframe.bind(this);
    }

    initialize(handlers, options) {
      if (this.iframeConnector != null) {
        warn(
          "Cannot call TrelloPowerUp.initialize() from a secondary iframe where you have already called TrelloPowerUp.iframe(). TrelloPowerUp.initialize() should only be called from your index connector page, and should not include a call to TrelloPowerUp.iframe()"
        );
      }

      if (this.indexConnector != null) {
        warn(
          "Warning: calling TrelloPowerUp.initialize() more than once will have no effect. It is expected that you call it only once on your index connector."
        );
        return this.indexConnector;
      }

      this.indexConnector = new TaskPlugin(handlers, options);
      this.indexConnector.init();
      return this.indexConnector;
    }

    iframe(options) {
      if (this.indexConnector != null) {
        warn(
          "Cannot call TrelloPowerUp.iframe() from your index connector where you call TrelloPowerUp.initialize(). TrelloPowerUp.iframe() is only used for secondary iframes you may create or request from Trello during the Power-Up lifecycle."
        );
      }

      if (this.iframeConnector != null) {
        return this.iframeConnector;
      }

      this.iframeConnector = new TaskIFrame(options);
      this.iframeConnector.init();
      return this.iframeConnector;
    }
  }

  (function () {
    // eslint-disable-next-line global-require
    window.TaskPowerPlug = new TaskPowerPlug();
  })();
})();
