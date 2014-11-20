'use strict';

var app;

exports.init = function (myApp) {
  app = myApp;
};

exports.load = function (req, res, next, id) {
  if (id === 'new') return next();
  app.Event.load(id, function (err, event) {
    if (err) return app.err(err, res);
    if (!event) return app.err(new Error('Event not found!'), res);

    req.event = event;
    return next();
  });
};

exports.create = function (req, res) {
  var fields = {
    name: req.body.name,
    desc: req.body.desc,
    location: req.body.location,
    date: req.body.date,
    isAllDay: req.body.allDay,
    picture: req.body.picture,
    visibility: req.body.visibility,
    attendance: req.body.attendance
  };
  var creator = req.user;
  app.Event.create(fields, creator, function (err, event) {
    if (err) return app.err(err, res);
    res.jsonp(event.toJSON());
  });
};

exports.update = function (req, res) {
  var fields = {
    name: req.body.name,
    desc: req.body.desc,
    location: req.body.location,
    date: req.body.date,
    isAllDay: req.body.allDay,
    picture: req.body.picture,
    visibility: req.body.visibility,
    attendance: req.body.attendance
  };
  req.event.modify(fields, req.user, function (err, event) {
    if (err) return app.err(err, res);
    return res.jsonp(event.toJSON());
  });
}

exports.createPage = function (req, res) {
  return res.render('app/event.server.jade', {event: {edit: true}});
}

exports.query = function (req, res) {
  var date = new Date();

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setDate(1);
  date.setMonth(0);
  date.setYear(0);

  if (req.query.d) date.setDate(req.query.d);
  if (req.query.m) date.setMonth(req.query.m);
  if (req.query.y) date.setFullYear(req.query.y);

  var query = {
    date: {$gte: date}
  };

  app.Event.query(query, function (err, events) {
    if (err) return app.err(err, res);
    return res.jsonp(events);
  });
};

exports.show = function (req, res) {
  res.format({
    html: function () {
      return res.render('app/event.server.jade', {event: req.event});
    },
    json: function () {
      return res.jsonp(req.event);
    }
  });
};
