### How to build

In case you don't want to setup local backend server (with api),
go to the `source/api/js/api.js` file and change the 3rd line to:

```js
var hostPrefix = '//users.mmcs.sfedu.ru:3001'
```

You need the `gulp` tool to build project,
the `node-static` webserver to host derived static files,
and all project dependencies to be installed:

```bash
$ npm i
$ sudo npm i -g gulp node-static

# run static server as background process
$ cd www; static &

# make gulp to look after files and build if smth changes
$ gulp watch
```
