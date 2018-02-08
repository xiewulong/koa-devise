/*!
 * Koa devise
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2018/02/08
 * since: 0.0.1
 */
'use strict';

const default_options = {
  context_key: 'user',       // Identity key in context, default: user
  login_url: '/user/login',  // Login in url for session none, default: '/user/login'
  session_key: 'user',       // Devise key in session, default: user
  timeout_in: 0,             // Expire time, default: 0(forever)
};

module.exports = (options = {}, identity = (id) => {}) => {
  if(typeof options == 'function') {
    [identity, options] = [options, identity];
  }

  options = Object.assign({}, default_options, options || {});

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
        value(redirect_url) {
          let guest = !this[options.context_key];

          if(redirect_url === false) {
            return !guest;
          }

          guest && this.redirect(redirect_url || options.login_url);
        },
      },
      login: {
        value(id, timeout_in = options.timeout_in) {
          return this.session[options.session_key] = {id, timeout_in, last_requested_at: + new Date()};
        },
      },
      logout: {
        value() {
          return delete this.session[options.session_key];
        },
      },
    });

    await next();
  };
};
