# Koa devise

Koa 用户认证解决方案

## 目录

<details>

* [安装](#install)
* [使用](#useage)
* [License](#license)

</details>

## Install

安装

```bash
$ npm i [-S] koa-devise
```

## Useage

配置和使用

```js
const Koa = require('koa');
const devise = require('koa-devise');
const session = require('koa-session');

const app = new Koa();

app.keys = ['APP COOKIE SECRET KEY']
app
  // ...
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
  // ...
  ;
```

鉴权, 设置一个路由必须登录后才能访问

```js
app
  // ...
  .use(async(ctx, next) => {
    ctx.authenticate();
    ctx.body = 'User is Signed in if you can see this';
  })
  // ...
  ;
```

## License

MIT - [xiewulong](https://github.com/xiewulong)
