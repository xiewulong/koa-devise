/*!
 * App
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2018/02/08
 * since: 0.0.1
 */
'use strict';

const Koa = require('koa');
const session = require('koa-session');
const devise = require('../');

const app = module.exports = new Koa();
const development = app.env === 'development';
const production = app.env === 'production';

app.keys = ['APP COOKIE SECRET KEY'];
app
  .use(session(app))
  .use(devise({
    // context_key: 'user',       // Identity key in context, default: user
    // login_url: '/user/login',  // Login in url for session none, default: '/user/login'
    // session_key: 'user',       // Devise key in session, default: user
    // timeout_in: 0,             // Expire time, default: 0 is session max age
  }, (id) => {
    // Return user identity after get user by id, it can be a promise
    return {
      id: 1,
      username: 'Username',
      // ...
    };
  }))
  .use(async(ctx, next) => {
    if(ctx.path == '/user/login') { // Login
      console.log(ctx.login(1));
      return ctx.redirect('back', '/');
    } else if(ctx.path == '/user/logout') { // Logout
      console.log(ctx.logout());
      return ctx.redirect('back', '/');
    }

    ctx.type = 'html';
    ctx.body = ctx.authenticate(false) && `${ctx.user.username}, <a href=\"/user/logout\">Sign out</a>` || "<a href=\"/user/login\">Sign in</a>";
  })
  .use(async (ctx) => {
    ctx.status = 404;

    let text = 'Page Not Found';
    switch(ctx.accepts('html', 'json')) {
      case 'html':
        ctx.type = 'html';
        ctx.body = `<p>${text}</p>`;
        break;
      case 'json':
        ctx.body = {message: text};
        break;
      default:
        ctx.type = 'text';
        ctx.body = text;
    }
  })
  ;

!module.parent && app.listen(3000);
