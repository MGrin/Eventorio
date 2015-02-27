var loadRoutes = function (app) {
  app.path = {
    landing: '/',
    dashboard: '/dashboard',
    calendar: '/calendar',
    news: '/news',
    policy: '/policy',

    // Authorization and activation routes
    login: '/login',
    restorePassword: '/restorePassword',
    changePassword: '/changePassword',
    logout: '/logout'
  };
};

if (typeof app === 'undefined') {
  // Server side load
  module.exports = loadRoutes;
} else {
  loadRoutes(app);
}