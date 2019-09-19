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

    const price = calculatePrice(parseInt(order.typeOfGrain), parseInt(order.typeOfProtein));

    const newOrder = {
        'fstname': order.fstname,
        'lstname': order.lstname,
        'ordername': order.ordername,
        'amountOfGrain': parseInt(order.typeOfGrain),
        'typeOfProtein': parseInt(order.typeOfProtein),
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

    const newPrice = calculatePrice(parseInt(orderToUpdate.typeOfGrain), parseInt(orderToUpdate.typeOfProtein));

    const updatedOrder = {
        'fstname': orderToUpdate.fstname,
        'lstname': orderToUpdate.lstname,
        'ordername': orderToUpdate.ordername,
        'typeOfGrain': parseInt(orderToUpdate.typeOfGrain),
        'typeOfProtein': parseInt(orderToUpdate.typeOfProtein),
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

const calculatePrice = function (typeOfGrain, typeOfProtein) {
  const baseRiceBowlPrice = 9;
  const price = (baseRiceBowlPrice + typeOfGrain + typeOfProtein);
  return price;
};

app.listen( port );