var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.get('/step1', function (req, res, next) {
  res.render('step1', { title: 'Step1' });
});
router.get('/step2', function (req, res, next) {
  res.render('step2', { title: 'Step2' });
});
router.get('/step3', function (req, res, next) {
  res.render('step3', { title: 'Step3' });
});

module.exports = router;