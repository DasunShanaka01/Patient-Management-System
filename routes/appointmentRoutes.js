const express = require('express');
const { body, param, query } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

const appointmentValidators = [
	body('patientId').trim().notEmpty().withMessage('patientId is required'),
	body('date').isISO8601().withMessage('date is required').toDate(),
	body('time')
		.matches(/^([01]\d|2[0-3]):[0-5]\d$/)
		.withMessage('time must be HH:mm in 24h format'),
	body('doctorName').trim().notEmpty().withMessage('doctorName is required'),
];

router.get(
	'/availability',
	[
		query('doctorName').trim().notEmpty(),
		query('date').isISO8601().toDate(),
		query('time').matches(/^([01]\d|2[0-3]):[0-5]\d$/),
	],
	appointmentController.checkAvailability
);

router.post('/', appointmentValidators, appointmentController.createAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/:id', param('id').isMongoId(), appointmentController.getAppointmentById);

router.put(
	'/:id',
	[
		param('id').isMongoId(),
		body('patientId').optional().trim().notEmpty(),
		body('date').optional().isISO8601().toDate(),
		body('time').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/),
		body('doctorName').optional().trim().notEmpty(),
		body('status').optional().isIn(['scheduled', 'cancelled', 'completed']),
	],
	appointmentController.updateAppointment
);

router.patch('/:id/cancel', param('id').isMongoId(), appointmentController.cancelAppointment);
router.delete('/:id', param('id').isMongoId(), appointmentController.deleteAppointment);

module.exports = router;
