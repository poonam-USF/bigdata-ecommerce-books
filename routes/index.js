var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
//var client = require('./connection.js');
var Product = require('../models/product');
var Order = require('../models/order');
//var ProductsSearch= require('../models/searchproducts');
var elasticsearch = require('elasticsearch');
var client = require('./connection.js');
//var client = new elasticsearch.Client();

/*/var redis = require('redis');
//var client = redis.createClient(12067, 'redis-12067.c9.us-east-1-4.ec2.cloud.redislabs.com', {no_ready_check: true});
client.auth('password', function (err) {
    if (err) throw err;
});

client.on('connect', function() {console.log('Connected to Redis');
});*/

/* GET home page. */


router.get('/', function (req, res, next) {

    var successMsg = req.flash('success')[0];
    Product.find(function (err, docs) {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/index', {title: 'Book e-commerce', products: productChunks, successMsg: successMsg, noMessages: !successMsg});
    });
});
//Using Amazon Elastic Search and display results
router.get('/search',function(req,response,next)
{
    var pageNum= 1;
    var perPage=6;
    var userQuery = req.query['query'];
    console.log(userQuery);
    var searchParams = {
        index: 'bookshopping',
        type: 'books',
        body: {
            query: {
               multi_match: {
                    fields: ["title","authors"],
                    query: userQuery,
                    fuzziness: "AUTO"
               }
            }
        }};
    client.search(searchParams, function (error, res) {
        if (error) {
           // console.log("search error: " + error);
            throw error;
        }
            var results = res.hits.hits.map(function (i) {
                return i['_source'];
            });
            var productChunks = [];
            var chunkSize = 3;
            for (var i = 0; i < results.length; i += chunkSize) {
                productChunks.push(results.slice(i, i + chunkSize));
                console.log(productChunks);
                console.log("reached here");
            }
            response.render('shop/search', {
                title: 'Book e-commerce', products: productChunks
            });
        });
});


/*router.get('/shoppingcart', function(req, res, next) {
        res.render('shop/shoppingcart');
    });*/

router.get('/contactus', function(req, res, next) {
    res.render('layouts/contactus',{title: 'Book Ecommerce'});
});
router.get('/aboutus', function(req, res, next) {
    //var productId = req.params.id;
   // var cart = new Cart(req.session.cart ? req.session.cart : {});
        res.render('layouts/aboutus',{title: 'Book Ecommerce'});
    });


router.get('/loadProduct', function (req, res) {
    console.log("Calling MongoDB to load product Details!");
    var productId = req.query._id;
    console.log(productId)
    Product.find({_id: productId}, function(err, product) {
        console.log("Connect to MongoDB");
        console.log("productName from MongoDb"+product);
        res.render('shop/product', {title: 'Book Ecommerce', products: product});
    });
});


module.exports = router;
//module.exports= client;

/*function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}*/
