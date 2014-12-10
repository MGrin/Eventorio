var mandrill = require('mandrill-api/mandrill');

var app;

module.exports = function (myApp) {
  app = myApp;
  app.email = new mandrill.Mandrill(app.config.mandrill.API_KEY);
  app.email.sendWelcomeMessage = sendWelcomeMessage;
  app.email.sendInvitationMail = sendInvitationMail;
};

var sendWelcomeMessage = function (user) {
  var message = {
    subject: 'Welcome to Eventorio!',
    from_email: 'info@eventorio.uk.to',
    from_name: 'Nikita@Eventorio',
    to: [{
      email: user.email,
      name: user.username,
      type: 'to'
    }],
    html: [
      '<h1>Welcome to Eventorio!</h1>',
      '<h3>Hi ' + user.username + ',</h3>',
      '<p>It is a pleasure for me to see you among Eventorio users.</p>',
      '<p>I would ask you to verify your email by clicking on ',
      '<a href="' + app.config.serverUrl + '/activation/' + user.id + '">this link</a></p>',
      'and again, welcome!</p>',
      '<p>Nikita Grishin</p>',
      '<p>Eventorio</p>'
    ].join('')
  };

  app.email.messages.send({
    message: message,
  }, function (result) {
    return app.logger.info('Welcome message sent to ' + user.email);
  }, function (err) {
    err.message = 'Mandrill error, Welcome message: ' + err.name + ' - ' + err.message;
    return app.err(err);
  });
};

var sendInvitationMail = function (organizator, user, event) {
  var message = {
    subject: 'You are invited to \"' + event.name + '\"!',
    from_email: 'invitations@eventorio.uk.to',
    from_name: organizator.username + '@Eventorio',
    to: [{
      email: user.email,
      name: user.username,
      type: 'to'
    }],
    html: [
    '<h1>' + organizator.username + ' invites you!</h1>',
    '<p>Hi, <b>' + user.username + '</b>. You was invited to a following event: <p>',
    '<p><b>\"' + event.name + '\"</b> by ' + organizator.username + '</p>',
    '<p>Here is the <a href=\"' + app.config.serverUrl + '/events/' + event.id + '\"> event page @Eventorio</a>',
    '<p></p>',
    '<p>See you there!</p>'
    ].join('')
  };

  app.email.messages.send({
    message: message,
  }, function (result) {
    return app.logger.info('Invitation message sent to ' + user.email);
  }, function (err) {
    err.message = 'Mandrill error, Welcome message: ' + err.name + ' - ' + err.message;
    return app.err(err);
  });
}