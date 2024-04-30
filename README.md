# Hg-livekit

This is video conference app using Angular and Livekit.

## Run Frontend

Angular v17.13.0 (require Node v18)

### Clone the repo

```shell
git clone https://gitlab.com/hotelgenie/hg-livekit.git
cd hg-livekit
```

### Install npm packages

Install the `npm` packages described in the `package.json` and verify that it works:

```shell
npm install
npm start
```

The `npm start` command builds (compiles TypeScript and copies assets) the application into `dist/`, watches for changes to the source files, and runs `lite-server` on port `3000`.

Shut it down manually with `Ctrl-C`.

#### npm scripts

These are the most useful commands defined in `package.json`:

* `npm start` - runs the TypeScript compiler, asset copier, and a server at the same time, all three in "watch mode".
* `npm run build` - runs the TypeScript compiler and asset copier once.
* `npm run build:watch` - runs the TypeScript compiler and asset copier in "watch mode"; when changes occur to source files, they will be recompiled or copied into `dist/`.

These are the test-related scripts:

* `npm test` - builds the application and runs Intern tests (both unit and functional) one time.

## Run Backend

Node v16.15.0

```shell
nvm install 16.15.0
nvm use 16.15.0

cd server
npm install
node index.js
```

### APIs

- /getToken\
METHOD POST\
REQUEST room_name(string), participant_name(string)\
RESPONSE string(token)

* pipeline auto dploys to https://livekit-backend.phonegenie.app/
* direct access: http://34.106.7.178/
