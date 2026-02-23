const { validationResult } = require('express-validator');
const Patient = require('../models/Patient');

const handleValidation = (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	return null;
};

const createPatient = async (req, res, next) => {
	const validationError = handleValidation(req, res);
	if (validationError) return validationError;

	try {
		const patient = await Patient.create(req.body);
		res.status(201).json(patient);
	} catch (err) {
		if (err.code === 11000) {
			return res.status(409).json({ message: 'patientId or NIC already exists' });
		}
		next(err);
	}
};

const getPatients = async (req, res, next) => {
	try {
		const { name, patientId } = req.query;
		const filter = {};
		if (name) filter.name = new RegExp(name, 'i');
		if (patientId) filter.patientId = patientId;
		const patients = await Patient.find(filter).sort({ createdAt: -1 });
		res.json(patients);
	} catch (err) {
		next(err);
	}
};

const getPatientById = async (req, res, next) => {
	try {
		const patient = await Patient.findOne({ patientId: req.params.patientId });
		if (!patient) {
			return res.status(404).json({ message: 'Patient not found' });
		}
		res.json(patient);
	} catch (err) {
		next(err);
	}
};

const updatePatient = async (req, res, next) => {
	const validationError = handleValidation(req, res);
	if (validationError) return validationError;

	try {
		const updates = { ...req.body };
		delete updates.patientId; // avoid changing primary identifier

		const patient = await Patient.findOneAndUpdate(
			{ patientId: req.params.patientId },
			updates,
			{ new: true, runValidators: true }
		);

		if (!patient) {
			return res.status(404).json({ message: 'Patient not found' });
		}
		res.json(patient);
	} catch (err) {
		if (err.code === 11000) {
			return res.status(409).json({ message: 'NIC already exists' });
		}
		next(err);
	}
};

const updatePatientAddress = async (req, res, next) => {
	const validationError = handleValidation(req, res);
	if (validationError) return validationError;

	try {
		const patient = await Patient.findOneAndUpdate(
			{ patientId: req.params.patientId },
			{ address: req.body.address },
			{ new: true, runValidators: true }
		);

		if (!patient) {
			return res.status(404).json({ message: 'Patient not found' });
		}
		res.json(patient);
	} catch (err) {
		next(err);
	}
};

const deletePatient = async (req, res, next) => {
	try {
		const patient = await Patient.findOneAndDelete({ patientId: req.params.patientId });
		if (!patient) {
			return res.status(404).json({ message: 'Patient not found' });
		}
		res.json({ message: 'Patient deleted' });
	} catch (err) {
		next(err);
	}
};

module.exports = {
	createPatient,
	getPatients,
	getPatientById,
	updatePatient,
	updatePatientAddress,
	deletePatient,
};
