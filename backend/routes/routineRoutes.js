const express = require('express');
const router = express.Router();
const {
    getRoutines,
    findRoutine,
    createOrUpdateRoutine,
    deleteRoutine
} = require('../controllers/routineController');

router.route('/').get(getRoutines).post(createOrUpdateRoutine);
router.route('/find').get(findRoutine);
router.route('/:id').delete(deleteRoutine);

module.exports = router;
