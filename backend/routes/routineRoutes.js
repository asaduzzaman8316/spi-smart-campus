const express = require('express');
const router = express.Router();
const {
    getRoutines,
    findRoutine,
    createOrUpdateRoutine,
    deleteRoutine
} = require('../controllers/routineController');
const { idValidation } = require('../validators/validators');

router.route('/').get(getRoutines);
router.route('/find').get(findRoutine);

router.route('/').post(createOrUpdateRoutine);
router.route('/:id').delete(idValidation, deleteRoutine);

module.exports = router;
