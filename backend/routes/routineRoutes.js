const express = require('express');
const router = express.Router();
const {
    getRoutines,
    findRoutine,
    createOrUpdateRoutine,
    updateRoutineById,
    deleteRoutine,
    analyzeLoad
} = require('../controllers/routineController');
const { idValidation } = require('../validators/validators');

router.route('/').get(getRoutines);
router.route('/find').get(findRoutine);
router.route('/analyze-load').get(analyzeLoad);

router.route('/').post(createOrUpdateRoutine);
router.route('/:id').delete(idValidation, deleteRoutine).put(updateRoutineById);

module.exports = router;
