# Social network for developers (server) - MERN

This project was made using MREN, you can view it [here](https://developer-social-website.herokuapp.com/).

> MERN is a fullstack implementation in MongoDB, Expressjs, React/Redux, Nodejs.

MERN stack is the idea of using Javascript/Node for fullstack web development.

## to clone or download (server)

```terminal
$ git clone https://github.com/halevyoren/-full-stack-social-network-server.git
$ npm i
```

# Usage (run server app on your machine)

## Prerequirements

- [MongoDB](https://gist.github.com/nrollr/9f523ae17ecdbb50311980503409aeb3)
- [Node](https://nodejs.org/en/download/) ^10.0.0
- [npm](https://nodejs.org/en/download/package-manager/)

notice, you need client and server runs concurrently in different terminal session, in order to make them talk to each other

## Server-side usage(PORT: 5000)

### Prepare your secret and mongoURI

(You need to add a jwtSecret and mongoURI in config/default.json to connect to MongoDB)

```terminal
$ cd config
$ touch default.json
```

edit the default.json file such that it looks like this:

```terminal
{
"mongoURI": your mongoURI in parenthesis,
  "jwtSecret": your jwtSecret in parenthesis,
}
```

### Start

```terminal
$ cd server   // go to server folder
$ npm install       // npm install pacakges
$ npm run server// run it locally
$ npm run build // this will build the server code to es5 js codes and generate a dist file
```

### in case you upload your server to a site (e.g heroku)

remember to update the file of [client/package.json](https://github.com/halevyoren/full-stack-blog-client/blob/main/package.json)

```javascript
 "proxy": "https://your-heroku-app.herokuapp.com"
```

(switch "your-heroku-app" with the name of your heroku app)

# Dependencies(tech-stacks)

| Client-side                           | Server-side                    |
| ------------------------------------- | ------------------------------ |
| "axios": "^0.21.1"                    | "bcryptjs": "^2.4.3"           |
| "moment": "^2.29.1"                   | "config": "^3.3.6"             |
| "react": "^17.0.2"                    | "express": "^4.17.1"           |
| "react-dom": "^17.0.2"                | "express-validator": "^6.10.0" |
| "react-icons": "^4.2.0"               | "gravatar": "^1.8.1"           |
| "react-moment": "^1.1.1"              | "jsonwebtoken": "^8.5.1"       |
| "react-redux": "^7.2.3"               | "mongoose": "^5.12.4"          |
| "react-router-dom": "^5.2.0"          | "request": "^2.88.2"           |
| "react-scripts": "4.0.3"              |
| "redux": "^4.0.5"                     |
| "redux-devtools-extension": "^2.13.9" |
| "redux-thunk": "^2.3.0"               |
| "uuid": "^8.3.2"                      |
