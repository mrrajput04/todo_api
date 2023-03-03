const express = require('express');
const {verifyToken,mailVerify} = require('../auth/verifyToken');
const userCon = require('../controllers/userController');
const todoCon = require('../controllers/todoController');
const tagsCon = require('../controllers/tagsController')
const passwordVerify = require('../middlewares/passwordVerification');
// const verify = require('../view/verify')
// const {emailService} = require('../services/emailVerify')


const router = express.Router();

router.get('/',userCon.getApi)

router.post('/register',userCon.userRegister)

router.post('/login',userCon.userLogin)

router.post('/forgot-password',userCon.forgetPassword)

router.post('/otpVerification',userCon.otpVerify)

router.put('/verify-reset-password',verifyToken,passwordVerify,userCon.resetPassword)

router.post('/addTodo',verifyToken,todoCon.addTodo)

router.get('/showTodo',verifyToken,todoCon.showTodo)

router.put('/updateTodo',todoCon.updateTodo)

router.delete('/deleteTodo',todoCon.deleteTodo)

router.post('/addTags',tagsCon.addTags)

router.get('/showTag',tagsCon.showTag)

router.put('/updateTag',tagsCon.updateTag)

router.delete('/deleteTag',tagsCon.deleteTag)

router.get('/verify:email',mailVerify,userCon.verifyEmail)

module.exports = router;