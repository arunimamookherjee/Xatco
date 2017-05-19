var express = require('express');
var router = express.Router();
var mongodb=require('mongodb');
var http = require("http");
var https = require("https");
var request = require('request');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

var redis = require('redis');
var client = redis.createClient(6379,'127.0.0.1');




var r1;
/* GET home page. */


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/pay', function(req, res) {
    res.render('pay', { title: 'Pay' });
});

router.get('/home', function(req, res) {
    res.render('home', { title: 'Home' });
});
router.get('/login', function(req, res){
    res.render('login', {title: 'Welcome Back'});
});

router.get('/slackBot', function(req, res) {

    res.render('slackBot', { title: 'Slackbot' });
});


router.get('/start_chat', function(req, res) {

    res.render('start_chat', { title: 'Chat' });
});

router.get('/payment', function(req, res){
    res.render('payment', { title: 'Payment' })
});

router.get('/signin', function(req,res){
    res.render('signin', {title:'Signin'});
});

router.get('/chat', function(req,res){
    res.render('temp2', {title:'Chat'});
});
///*****************deleting user******************************************************************************
router.post('/remove_em', function (req,res) {
    var em=req.body.content;
   // console.log(em);

    client.del(em, function(err, response) {
        if (response == 1) {
            console.log("Deleted Successfully!")
        } else{
            console.log("Cannot delete")
        }});

});

///*****************redis check*********************************************************************************//
client.on('error', function(error){
    console.log("Error while creating the socket connection");
    console.log(error);
});

/*
 client.set('email','token',redis.print);
 client.get('email', function(error, value))
 {
 if(error)
 {   throw error; }
 console.log("the value is : " + value)
 }
 */

router.post('/redis_Check', function (req,res) {
    var em=req.body.content;

        //console.log("*********************************");
        //console.log(em);

    client.get(em, function(error, value)
    {
        console.log('inside get');
            if(error)
            {
                console.log(error);
                res.send("404");
            }
            else
            {
                if(value==null)
                {client.set(em,true,redis.print);
                    res.send("400");
                }
                else
                {res.send("404");}
            }

    }

    );

});

///******************Get token*********************************************************************************//
router.post('/get_token', function(req,res)
{
    var em=req.body.email;
    //console.log(req);
    //console.log(req.body.email);
    var MongoClient=mongodb.MongoClient;
    var url='mongodb://localhost:27017/slack';


                MongoClient.connect(url, function (err, db)
                {

                    if(err)
                    {
                        console.log("eeerror");

                    }
                    else
                        {

                        //console.log("********************Connected COOL*********Connected COOL**************************");

                        var collection=db.collection('registrations');

                        collection.find({ "Email" : em }).toArray(function (err, result) {
                            if(err){
                                res.send(err);
                            }
                            else if(result.length)
                            {
                                db.close();
                                    console.log(result);
                                    var payload={token_s: result[0].Token, domain: result[0].Domain};


                                var token = jwt.sign(payload,'JsP3Pt2zrKATMQRH');
                                console.log(req.headers.host);
                                res.send(token);


                            }
                            else{
                                db.close();
                                res.send("007");
                            }


                        })


                    }
                });




});

//**********************************Creating a channel********************************************************************************************//
router.post('/create_channel', function(req, res) {

   // console.log(req);
   //console.log(req.body.channel_name);
var tok_s=req.body.token;
var verifiedJwt = jwt.verify(tok_s,'JsP3Pt2zrKATMQRH');
var tok=verifiedJwt.token_s;



if(tok===null )
    res.send("0000");

var case_no=req.body.case_no;
console.log(case_no);
var channel_id;

if(req.headers.host===verifiedJwt.domain)
switch(case_no)
{
    case "1" : //creating channel
                var channel=req.body.channel_name;



                request({
                    url:'https://slack.com/api/channels.create?token='+tok+'&name='+channel+'&pretty=1',
                    json: true
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                       if(body.ok)
                       { console.log(" cool!");
                           channel_id=body.channel.id;
                           res.json({ foo: channel_id, bar: true } );
                       }
                       else
                       {
                           //console.log('Join a previously created channel');
                           //*********Join a previously created channel************//
                           request({
                               url:'https://slack.com/api/channels.join?token='+tok+'&name='+channel+'&pretty=1',
                               json: true
                           }, function (error, response, body) {
                               if (!error && response.statusCode === 200) {

                                   channel_id=body.channel.id;
                                   //console.log(channel_id);
                                   request({
                                       url: 'https://slack.com/api/channels.history?token='+ tok+'&channel='+channel+'&pretty=1',
                                       json: true
                                   }, function (error, response, body) {
                                       if (!error && response.statusCode === 200)
                                       {

                                         res.json({ foo: channel_id, bar: false} );
                                       }
                                       else
                                       { console.log("*************text error");

                                       }


                                   });


                               }
                               else
                                  res.send("101");
                           });

                           //******************************************************//
                       }

                    }
                    else
                        console.log("hi...ERROR");
                });
        console.log("channel id is "+channel_id);
        break;
    case "2":
                var ch_id=req.body.channel_id;
                console.log(ch_id);
                var user_id=[];
                //****Getting the list of all members in the goup****/
                request({
                    url:'https://slack.com/api/users.list?token='+tok+'&pretty=1',
                    json: true
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {

                        for(var j=0;j<body.members.length;j++)
                        {
                            user_id.push(body.members[j].id);
                            //console.log("Entered the relm "+j);
                            //console.log("user ids "+user_id[j]);

                            request({
                                url: 'https://slack.com/api/channels.invite?token='+ tok + '&channel=' + ch_id + '&user=' + user_id[j] + '&pretty=1',
                                json: true
                            }, function (error, response, body) {
                                if (!error && response.statusCode === 200) {
                                    //console.log(body);
                                   // console.log('******added '+user_id[j]+'*********');
                                }
                                else
                                {}//console.log("hi.couldn't add "+user_id[j]+" ..ERROR");

                            });

                        }
                        res.send("All members added successfully");
                       // console.log("All members added successfully");
                        console.log(user_id.length);

                    }
                    else
                    { console.log("hi...ERROR");
                        res.send("202");}
                });

                //****now, adding the members***********//



        break;

    case "3":  //***********sending messages from frontend to the channel***********//
               // console.log("**************************sending message*************************************");
                var text=req.body.content;
                var ch=req.body.channel_id;
                var toke=req.body.token;
               // console.log(text+"................"+ch+"................."+toke);
                //console.log(req.body);
                request({
                    url: 'https://slack.com/api/chat.postMessage?token='+tok +'&channel='+ch+'&text='+text+'&pretty=1',
                    json: true
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        //console.log(body);
                        //console.log("***********text sent*****************");
                    }
                    else
                    {}//console.log("*************text error");

                });

                res.send(ch_id);
                    break;

    case "4": //******************************** Receiving messages**********it's a different case remember**************************/
                var ch1=req.body.channel_id;
                var tok_is=req.body.token;

                var tok1 = jwt.verify(tok_is,'JsP3Pt2zrKATMQRH');
                //console.log(tok);
                //console.log("trippy..."+tok1);

        request({
                    url: 'https://slack.com/api/channels.history?token='+ tok+'&channel='+ch1+'&pretty=1',
                    json: true
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                     //   console.log(body);
                      //  console.log("***********text sent*****************");
                        res.send(body);
                    }
                    else
                    { //console.log("*************text error");
                        res.send(body);
                    }


                });
                break;




    default:
        console.log("Entered default area");
        res.send("No match for any condition");
}
else
    res.send("104");


});
//*********************************************Getting data from slack channel **************************************************************************/
router.get('/check', function(req, res) {

    request({
        url:'https://slack.com/api/channels.history?token=xoxp-157305059732-157269328242-157540272292-1606768938cc7e7c53f6622d3e99c10c&channel=C540SHVSQ&pretty=1',
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body);// Print the json response

            res.send(body);
        }
        else
            console.log("hi...ERROR");
    })

});
//***********************************************************************************************************************/
router.post('/next', function (req,res) {
    var token=req.param('reg');
    res.render('start_chat', { 'token':token});
});


// ****************************for SIGN INN getting details from database and checking passowrd and stuff**************//
router.post('/login', function(req, res)
{
    var MongoClient=mongodb.MongoClient;
    var url='mongodb://localhost:27017/slack';

    //console.log("Enteredddd eeerror");
    MongoClient.connect(url, function (err, db)
    {

        if(err)
        {
            console.log("eeerror");

        }
        else {
            var email = req.param('em');
            var password = req.param('pass');
            console.log("/********************Connected to server  all is COOL***********************************/");

            console.log(email+"   "+ password);
            var collection=db.collection('registrations');

            collection.find({ "Email" : email }).toArray(function (err, result) {
                if(err){
                    res.send(err);
                }
                else if(result.length){


                 if(result[0].Password===password) {
                     console.log("okay");

                     res.render('welcome', {name: email, foo: true, bar: result[0].Token, dom: result[0].Domain});
                 }
                 else{
                     res.render('signin');
                 }
                }
                else{
                   res.render('signin');
                }
                db.close();

            })


        }
    });

});

//*******************************Payment********************************************************************************/

router.post('/payment', function(req, res)
{

});

//***********************************from welcome-->add token, adding slack legacy token*******************************//

router.post('/add_token', function(req,res)
{
    var MongoClient=mongodb.MongoClient;
    var url='mongodb://localhost:27017/slack';

    console.log("Enteredddd eeerror");
    MongoClient.connect(url, function (err, db)
    {
       // console.log(req);
        console.log("lalala " +  req.param('em') +" "+ req.param('token')+" "+ req.param('domain'));
        if(err)
        {
            console.log("eeerror");

        }
        else {
            var email = req.param('em');
            var token = req.param('token');
            var dom= req.param('domain');
            console.log("Connected to server Arunima+ ALl is COOL");

           // db.registrations.update( { Email : "bhandu@gmail.com" } , { Token : "abc"})
            var collection = db.collection('registrations').update(
                { Email: req.param('em') },
                { $set: { Token: req.param('token'), Domain: req.param('domain')} } ,
                function (err, object) {
                    if (err) {
                        console.warn("COOL");
                    } else {
                        console.dir("ho gaya");
                    }
                });
            res.render('welcome', { name: email, foo: true, bar: token, domain:dom });
            db.close();
        }
            });
});

//*********************Adding Sign up details to the database**********************************************************/


router.post('/subscribe', function(req,res)
{
    var MongoClient=mongodb.MongoClient;
    var url='mongodb://localhost:27017/slack';

    MongoClient.connect(url, function (err, db)
    {
        if(err)
        {
            console.log("Error occured");
        }
        else
        {
            console.log("Connected to server");
            var collection=db.collection('registrations');
            var reg1={

                Name: req.param('reg'),
                Mob:req.param('mob'),
                Email:req.param('em'),
                Date:req.param('datee'),
                Password:req.param('passw'),
                Payment_Id: req.param('payment_id')
            };

            collection.insert([reg1], function(err, result){
                if(err)
                {
                    console.log("Could not insert data");
                }
                else
                {
                    r1=reg1;


                    res.render('welcome', { name: req.param('em') });






                }
                db.close();
            });
        }

    });

});


///******************I don't remeber*********************************************************************************//
    router.post('/add_reg', function(req,res)
{
    var MongoClient=mongodb.MongoClient;
    var url='mongodb://localhost:27017/slack';

    MongoClient.connect(url, function (err, db)
    {
        if(err)
        {
            console.log("Error occured");
        }
        else
        {
            console.log("Connected to server");
            var collection=db.collection('registrations');
            var reg1={
                registration: req.body.name,
                date:req.body.date,
                mobile: req.body.mobile
            };
            collection.insert([reg1], function(err, result){
                if(err)
                {
                    console.log("Could not insert data");
                }
                else
                {
                    res.locals.place = reg1;
                    console.log(reg1);
                    res.render('welcome', {data: reg1});
                }
                db.close();
            });
        }

    });

});
//****************************************Normal display of details of database*********************************************//

router.get('/thelist', function (req,res) {
    var MongoClient=mongodb.MongoClient;
    var url='mongodb://localhost:27017/slack';

    MongoClient.connect(url,function (err, db) {
        if(err){
            console.log("Error");
        }
        else{
            console.log("Connection Established");

            var collection=db.collection('registrations');
            collection.find({}).toArray(function (err, result) {
                if(err){
                    res.send(err);
                }
                else if(result.length){
                    res.render('registration_list', {"registration_list":result});
                }
                else{
                    res.send('Nothing found');
                }
                db.close();

            })
        }
    })
});

module.exports = router;
