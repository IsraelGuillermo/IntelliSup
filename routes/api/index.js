const router = require('express').Router();
// Requiring our models and passport as we've configured it
const db = require('../../models');
const passport = require('../../config/passport');
const isAuthenticated = require('../../config/middleware/isAuthenticated');
// const supplier = require('../../models/supplier');
const { query } = require('express');
// Using the passport.authenticate middleware with our local strategy.
// If the user has valid login credentials, send them to the members page.
// Otherwise the user will be sent an error
router
  .route('/login', isAuthenticated)
  .post(passport.authenticate('local'), (req, res) => {
    // Sending back a password, even a hashed password, isn't a good idea
    res.redirect('/members');
  });

// Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
// how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
// otherwise send back an error
router.route('/signup', isAuthenticated).post((req, res) => {
  console.log('this is the sign up route', req.body);
  db.user
    .create(req.body)
    .then(() => {
      res.redirect('/members')
    })
    .catch((err) => {
      res.status(401).json(err);
    });
});

// Route for getting some data about our user to be used client side
router.route('/user_data', isAuthenticated).get((req, res) => {
  if (!req.user) {
    // The user is not logged in, send back an empty object
    return res.json({});
  }
  // Otherwise send back the user's email and id
  // Sending back a password, even a hashed password, isn't a good idea
  const { password, ...user } = req.user;
  res.json(user);
});
// matt added this API Route

router.route('/members', isAuthenticated).get((req, res) => {
  db.order
    .findAll({
      where: query,
      include: [db.supplier]
    })
    .then((results) => {
      res.json({ results });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.route('/members/:id').put((req, res) => {
  db.order
    .update(req.body, { where: { id: req.params.id } })
    .then((updated) => {
      res.json(updated);
    });
});
module.exports = router;
