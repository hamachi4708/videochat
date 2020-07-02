var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/step1', function(req, res, next) {
  res.render('step1', { title: 'Step1' });
});

module.exports = router;