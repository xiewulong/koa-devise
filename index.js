/*!
 * Koa devise
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2018/02/08
 * since: 0.0.1
 */
'use strict';

const DEFAULT_OPTIONS = {
  context_key: 'user',       // Identity key in context, default: user
  login_url: '/user/login',  // Login in url for session none, default: '/user/login'
  session_key: 'user',       // Devise key in session, default: user
  timeout_in: 0,             // Expire time, default: 0(forever)
};

module.exports = (options = {}, identity = (id) => {}) => {
  if(typeof options == 'function') {
    [identity, options] = [options, identity];
  }

  options = Object.assign({}, DEFAULT_OPTIONS, options || {});
  options.referrer_session_key = `${options.session_key}_referrer`;

  return async (ctx, next) => {
    let now = + new Date();
    let user_session = ctx.session[options.session_key] || {};
    let timeout_in = user_session.timeout_in === undefined ? options.timeout_in : user_session.timeout_in;
    if(user_session.id && user_session.last_requested_at && (!timeout_in || now <= user_session.last_requested_at + timeout_in)) {
      if(ctx[options.context_key] = await identity(user_session.id)) {
        user_session.last_requested_at = now;
      }
    }

    Object.defineProperties(ctx, {
      authenticate: {
        configurable: false,
        enumerable: true,
        value(redirect = true) {
          let guest = !this[options.context_key];
          if(!guest) {
            return true;
          }

          if(!redirect || !options.login_url) {
            return false;
          }

          this.user_referrer = this.request.url;
          this.redirect(options.login_url);
        },
        writable: false,
      },
      login: {
        configurable: false,
        enumerable: true,
        value(id, timeout_in = options.timeout_in) {
          return this.session[options.session_key] = {id, timeout_in, last_requested_at: + new Date()};
        },
        writable: false,
      },
      logout: {
        configurable: false,
        enumerable: true,
        value() {
          delete this.session[options.referrer_session_key];
          return delete this.session[options.session_key];
        },
        writable: false,
      },
      user_referrer: {
        configurable: false,
        enumerable: true,
        get() {
          let user_referrer = this.session[options.referrer_session_key];
          delete this.session[options.referrer_session_key];
          return user_referrer;
        },
        set(value) {
          this.session[options.referrer_session_key] = value;
        },
      },
    });

    await next();
  };
};

module.exports.authenticate = (redirect = true, message = 'Unauthorized') => {
  return async (ctx, next) => {
    if(ctx.authenticate(redirect)) {
      return await next();
    }

    if(!redirect) {
      ctx.status = 401;
    }

    ctx.body = {message};
  };
};
