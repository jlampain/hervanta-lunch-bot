/*jslint node: true */
/*jslint esversion: 6 */
"user strict";
const moment = require('moment'),
    _ = require('lodash'),
    restaurants = require('./restaurants'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    config = require('./config'),
    msgDefaults = {
        response_type: 'in_channel',
        username: 'lunchbot',
        icon_emoji: config('ICON_EMOJI')
    };

/*
Set the Fi local, this will help us to parse linkosuo menus
 */
moment.locale('fi', {
    weekdaysMin: "Su_Ma_Ti_Ke_To_Pe_La".split("_")
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.send("I'm lunch-bot");
});

/*
Handle bot commands
 */
app.post('/commands/lunchbot', (req, res) => {
    let payload = req.body;
    if (!payload || payload.token !== config('LUNCHBOT_COMMAND_TOKEN')) {
        let err = 'Invalid slack token was provided';
        console.log(err);
        res.status(401).end(err);
        return;
    } else {
        // get menus
        restaurants.menus().then(m => {
            // filter if needed
            if (payload.text) {
                let f = _.filter(m, attachment => {
                    return attachment.title.match(new RegExp(payload.text, 'i'));
                });
                if (!_.isEmpty(f)) {
                    m = f;
                }
            }
            // response back to slack
            let msg = _.defaults({
                channel: payload.channel_name,
                attachments: m
            }, msgDefaults);
            res.set('content-type', 'application/json');
            res.status(200).json(msg);
            return;
        });
    }
});

app.listen(config('PORT'), (err) => {
    if (err) throw err;
    console.log('Lunchbot lives on PORT ' + config('PORT'));
});

/*
restaurants.menus().then(m => {
   
   let f = _.filter(m, attachment => { return attachment.title.match(new RegExp('hermiaaa', 'i')); });
      if (!_.isEmpty(f)) {
        m = f
      };
  
  console.log(m)
});
*/