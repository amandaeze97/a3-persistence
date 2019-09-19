const express = require( 'express' ),
    app = express(),
    bodyParser = require( 'body-parser' ),
    session   = require( 'express-session' ),
    passport  = require( 'passport' ),
    Local     = require( 'passport-local' ).Strategy,
    serveStatic = require('serve-static'),
    compression = require('compression'),
    port = 3000;

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low( adapter );
db.defaults({ users: [] }).write();

app.use( serveStatic( 'public' ) );
app.use( bodyParser.json() );
app.use( compression() );

app.use( session({ secret:'cats cats cats', resave: false, saveUninitialized: false }) );
app.use( passport.initialize() );
app.use( passport.session() );

//////////// PASSPORT CONFIGURATION ////////////
passport.use(new Local (
    function(username, password, done) {
        const user = db.get('users').find({ username: username }).value();

        if (!user) {
            return done(null, false, { message: 'User does not exist.'});
        }

        if (user.password !== password) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
    }
));

passport.serializeUser( ( user, done ) => done( null, user.username ) );

passport.deserializeUser( ( username, done ) => {
    const user = db.get('users').find( u => u.username === username ).value();

    if( user !== undefined ) {
        done( null, user )
    }else{
        done( null, false, { message:'user not found; session not restored' })
    }
});

//////////// SERVER METHODS ////////////

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/public/login.html');
});

app.post('/login',
    passport.authenticate('local'),
    function (request, response) { response.json({status: true})
    });

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login.html');
});

app.get('/orders', function (request, response) {
    const orders = db.get('users')
        .filter({username: request.session.passport.user})
        .map('orders')
        .value();

    response.send(JSON.stringify({data: orders[0]}));
});

app.post('/submit', function (request, response) {
    const order = request.body;

    const price = calculatePrice(parseInt(order.amountOfPork), parseInt(order.garlic));

    const newOrder = {
        'name': order.name,
        'dream': order.dream,
        'amountOfPork': parseInt(order.amountOfPork),
        'garlic': parseInt(order.garlic),
        'price': price
    };

    let orders = db.get('users')
        .filter({username: request.session.passport.user})
        .map('orders')
        .value();

    orders[0].push(newOrder);

    db.get('users')
        .filter({username: request.session.passport.user})
        .assign({orders: orders[0]})
        .write();

    response.writeHead( 200, "OK", {'Content-Type': 'application/json' });
    response.end();
});

app.post('/update', function (request, response) {
    const orderToUpdate = request.body;

    const newPrice = calculatePrice(parseInt(orderToUpdate.amountOfPork), parseInt(orderToUpdate.garlic));

    const updatedOrder = {
        'name': orderToUpdate.name,
        'dream': orderToUpdate.dream,
        'amountOfPork': parseInt(orderToUpdate.amountOfPork),
        'garlic': parseInt(orderToUpdate.garlic),
        'price': newPrice
    };

    let orders = db.get('users')
        .filter({username: request.session.passport.user})
        .map('orders')
        .value();

    orders[0].splice(orderToUpdate.index, 1, updatedOrder);

    db.get('users')
        .find({user: request.session.passport.user})
        .assign({orders: orders[0]})
        .write();

    response.writeHead( 200, "OK", {'Content-Type': 'application/json' });
    response.end();
});

app.post('/delete', function (request, response) {
    const orderNumber = request.body.orderNumber;

    let orders = db.get('users')
        .filter({username: request.session.passport.user})
        .map('orders')
        .value();

    orders[0].splice(orderNumber, 1);

    db.get('users')
        .filter({username: request.session.passport.user})
        .assign({orders: orders[0]})
        .write();

    response.writeHead( 200, "OK", {'Content-Type': 'application/json' });
    response.end();
});

const calculatePrice = function (amountOfPork, ifGarlic) {
  const baseRamenPrice = 7;
  const price = (baseRamenPrice + (2*amountOfPork) + ifGarlic);
  return price;
};

app.listen( port );




/**const http = require( 'http' ),
      fs   = require( 'fs' ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library used in the following line of code
      mime = require( 'mime' ),
      dir  = 'public/',
      port = 3000;

const appdata = [
  { 'fstname': 'Amanda', 'lstname': 'Ezeobiejesi', 'ordername': 'Pacific Centre', 'typeOfGrain': 0, 'typeOfProtein': 1, 'price': 10},
  { 'fstname': 'Chirstina', 'lstname': 'Zymaris', 'ordername': 'Crispy Bacon', 'typeOfGrain': 1, 'typeOfProtein': 1, 'price': 11},
  { 'fstname': 'Beza', 'lstname': 'Ayalew', 'ordername': 'Treasure Island', 'typeOfGrain': 0, 'typeOfProtein': 2, 'price': 11},

];

const server = http.createServer( function( request,response ) {
  if( request.method === 'GET' ) {
    handleGet( request, response )    
  } else if ( request.method === 'POST' ){
    handlePost( request, response ) 
  }
});

const handleGet = function( request, response ) {

  const filename = dir + request.url.slice( 1 );

  if( request.url === '/' ) {
    sendFile( response, 'public/index.html' )
  } else if ( request.url === '/orders' ){
    sendData( response, appdata );
  } else {
    sendFile( response, filename );
  }
};

const handlePost = function( request, response ) {
  let dataString = '';

  request.on( 'data', function( data ) {
      dataString += data 
  });

  request.on( 'end', function() {
    switch ( request.url ) {
      case '/submit':
        const order = JSON.parse( dataString );

        const price = calculatePrice(parseInt(order.typeOfGrain), parseInt(order.typeOfProtein));

        const newOrder = {
          'fstname': order.fstname,
          'lstname': order.lstname,
          'ordername': order.ordername,
          'typeOfGrain': parseInt(order.typeOfGrain),
          'typeOfProtein': parseInt(order.typeOfProtein),
          'price': price,
        };

        appdata.push(newOrder);

        response.writeHead( 200, "OK", {'Content-Type': 'text/plain' });
        response.end();

        break;

      case '/update':
        const orderToUpdate = JSON.parse(dataString);

        const newPrice = calculatePrice(parseInt(orderToUpdate.typeOfGrain), parseInt(orderToUpdate.typeOfProtein));

        const updatedOrder = {
          'fstname': orderToUpdate.fstname,
          'lstname': orderToUpdate.lstname,
          'ordername': orderToUpdate.ordername,
          'typeOfGrain': parseInt(orderToUpdate.typeOfGrain),
          'typeOfProtein': parseInt(orderToUpdate.typeOfProtein),
          'price': newPrice,
        };

        appdata.splice(orderToUpdate.index, 1, updatedOrder);

        response.writeHead( 200, "OK", {'Content-Type': 'text/plain'});
        response.end();

        break;

      case '/delete':
        const orderToDelete = JSON.parse(dataString);
        appdata.splice(orderToDelete.orderNumber, 1);
        response.writeHead( 200, "OK", {'Content-Type': 'text/plain'});
        response.end();

        break;

      default:
        response.end('404 Error: File not found');
        break;
    }
  })
};

const calculatePrice = function (typeOfGrain, typeOfProtein) {
  const baseRiceBowlPrice = 9;
  const price = baseRiceBowlPrice + typeOfGrain + typeOfProtein;
  return price;
};

const sendData = function( response, orders ) {
  const type = mime.getType( orders );
  response.writeHeader(200, { 'Content-Type': type });
  response.write(JSON.stringify({ data: orders }));
  response.end();
};

const sendFile = function( response, filename ) {
   const type = mime.getType( filename );

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { 'Content-Type': type });
       response.end( content )

     } else {
       // file not found, error code 404
       response.writeHeader( 404 );
       response.end( '404 Error: File Not Found' );
     }
   })
};

server.listen( process.env.PORT || port );**