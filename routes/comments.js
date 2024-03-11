

const express = require('express');
const { postComment, getComment, deleteComment, editComment } = require('../controllers/comments');
const auth = require('../middleware/auth');
const router= express.Router()


router.post('/post',auth,postComment)
router.get('/get',getComment)
router.delete('/delete/:id',auth,deleteComment)
router.patch('/edit/:id',auth,editComment)

module.exports = router;