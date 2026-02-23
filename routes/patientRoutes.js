const express = require('express');
const { body, param } = require('express-validator');
const patientController = require('../controllers/patientController');

const router = express.Router();

const patientValidators = [
	body('patientId').trim().notEmpty().withMessage('patientId is required'),
	body('name').trim().notEmpty().withMessage('name is required'),
	body('NIC').trim().notEmpty().withMessage('NIC is required'),
	body('dateOfBirth').isISO8601().toDate().withMessage('dateOfBirth must be a valid date'),
	body('address').trim().notEmpty().withMessage('address is required'),
	body('previousCaseHistory').optional().isString(),
];

router.post('/', patientValidators, patientController.createPatient);
router.get('/', patientController.getPatients);
router.get('/:patientId', param('patientId').notEmpty(), patientController.getPatientById);

router.put(
	'/:patientId',
	[
		param('patientId').notEmpty(),
		body('name').optional().trim().notEmpty(),
		body('NIC').optional().trim().notEmpty(),
		body('dateOfBirth').optional().isISO8601().toDate(),
		body('address').optional().trim().notEmpty(),
		body('previousCaseHistory').optional().isString(),
	],
	patientController.updatePatient
);

router.patch(
	'/:patientId/address',
	[param('patientId').notEmpty(), body('address').trim().notEmpty().withMessage('address is required')],
	patientController.updatePatientAddress
);

router.delete('/:patientId', param('patientId').notEmpty(), patientController.deletePatient);

module.exports = router;
