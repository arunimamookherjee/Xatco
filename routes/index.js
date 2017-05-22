var express = require('express');
var router = express.Router();
var request = require('request');
var json_data_obj;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/new', function(req, res, next) {
    res.render('new', { title: 'Express' });
});


router.post('/new', function(req, res, next){
    request({
        url: 'https://slack.com/api/channels.history?token=xoxp-157305059732-157269328242-157540272292-1606768938cc7e7c53f6622d3e99c10c&channel=C4LGFR456&count=100000000000000&pretty=1',
        json: true
            }, function (error, response, body) {
        if (!error && response.statusCode === 200) {

            console.log(response.body.messages);
            res.send(response);

            json_data_obj= JSON.stringify(response.body.messages);

        }
        else
        {
            res.send("301");
        }

        });
    });

/* WATSON API for personality insight*/
router.get('/api', function(req, res, next)
{

    var PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
    var personality_insights = new PersonalityInsightsV3({
        username: '1f1f5151-dd1c-454c-bd53-54cc6fa9ab2b',
        password: 'kMehhPEsMZ8t',
        version_date: '2016-10-20',
        headers: {
            'X-Watson-Learning-Opt-Out': 'true'
        }

    });

    var params = {
        // Get the content items from the JSON file.
        content_items: require(json_data_obj).contentItems,
        consumption_preferences: true,
        raw_scores: true,
        headers: {
            'accept-language': 'en',
            'accept': 'application/json'
        }
    };


    personality_insights.profile(params, function(error, response) {
            if (error)
                console.log('Error:', error);
            else
            {console.log(JSON.stringify(response, null, 2));
            res.send(JSON.stringify(response, null, 2))
            }
        }
    );

});


module.exports = router;
