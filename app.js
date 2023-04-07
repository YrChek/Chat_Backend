const http = require('http');
const Koa = require('koa');
const Router = require('@koa/router');
const WS = require('ws');

const app = new Koa();
const router = new Router();
const users = {
  Александр: 'Чат существует',
  Иван: 'Чат существует',
};
let nickname;

router.get('', (ctx) => {
  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.status = 200;
  ctx.response.body = 'Hello';
});

router.get('/registration', (ctx) => {
  const key = ctx.request.query.name;
  ctx.response.set('Access-Control-Allow-Origin', '*');
  const name = users[key];
  if (name) {
    ctx.response.status = 406;
    ctx.response.body = 'Такое имя уже существует в чате';
    return;
  }
  nickname = key;
  users[nickname] = '';
  const list = Object.keys(users);
  ctx.response.status = 201;
  ctx.response.body = list;
});

app.use(router.routes());

const server = http.createServer(app.callback());
const port = process.env.PORT || 7080;
const wsServer = new WS.Server({
  server,
});

wsServer.on('connection', (app) => {
  app.on('message', (e) => {
    const text = e.toString();
    Array.from(wsServer.clients)
      .filter((client) => client.readyState === WS.OPEN)
      .forEach((client) => client.send(`{"status": "none", "id": "${id}", "text": "${text}"}`));
  });

  app.on('close', () => {
    delete users[id];
    Array.from(wsServer.clients)
      .filter((client) => client.readyState === WS.OPEN)
      .forEach((client) => client.send(`{"status": "del", "id": "${id}"}`));
  });

  if (!nickname) {
    app.close(1008, 'Нарушение регистрации');
  }
  const id = nickname;
  nickname = undefined;
  users[id] = app;
  Array.from(wsServer.clients)
    .filter((client) => client.readyState === WS.OPEN)
    .forEach((client) => client.send(`{"status": "add", "id": "${id}"}`));
});

server.listen(port);
