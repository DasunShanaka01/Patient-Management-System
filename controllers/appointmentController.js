const { validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

const handleValidation = (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	return null;
};

const normalizeDateOnly = (dateInput) => {
	const date = new Date(dateInput);
	const normalized = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
	return normalized;
};

const checkAvailability = async (req, res, next) => {
	const validationError = handleValidation(req, res);
	if (validationError) return validationError;

	try {
		const { doctorName, date, time } = req.method === 'GET' ? req.query : req.body;
		const normalizedDate = normalizeDateOnly(date);

		const existing = await Appointment.findOne({
			doctorName,
			date: normalizedDate,
			time,
			status: { $ne: 'cancelled' },
		});

		const available = !existing;
		res.json({ available });
	} catch (err) {
		next(err);
	}
};

const createAppointment = async (req, res, next) => {
	const validationError = handleValidation(req, res);
	if (validationError) return validationError;

	try {
		const { patientId, date, time, doctorName } = req.body;
		const normalizedDate = normalizeDateOnly(date);

		const patient = await Patient.findOne({ patientId });
		if (!patient) {
			return res.status(404).json({ message: 'Patient not found' });
		}

		const conflict = await Appointment.findOne({
			doctorName,
			date: normalizedDate,
			time,
			status: { $ne: 'cancelled' },
		});

		if (conflict) {
			return res.status(409).json({ message: 'Doctor not available at that time' });
		}

		const appointment = await Appointment.create({
			patientId,
			date: normalizedDate,
			time,
			doctorName,
		});

		res.status(201).json(appointment);
	} catch (err) {
		next(err);
	}
};

const getAppointments = async (req, res, next) => {
	try {
		const { patientId, doctorName, status, date } = req.query;
		const filter = {};
		if (patientId) filter.patientId = patientId;
		if (doctorName) filter.doctorName = doctorName;
		if (status) filter.status = status;
		if (date) filter.date = normalizeDateOnly(date);

		const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 });
		res.json(appointments);
	} catch (err) {
		next(err);
	}
};

const getAppointmentById = async (req, res, next) => {
	try {
		const appointment = await Appointment.findById(req.params.id);
		if (!appointment) {
			return res.status(404).json({ message: 'Appointment not found' });
		}
		res.json(appointment);
	} catch (err) {
		next(err);
	}
};

const updateAppointment = async (req, res, next) => {
	const validationError = handleValidation(req, res);
	if (validationError) return validationError;

	try {
		const updates = { ...req.body };
		if (updates.date) updates.date = normalizeDateOnly(updates.date);

		const appointment = await Appointment.findById(req.params.id);
		if (!appointment) {
			return res.status(404).json({ message: 'Appointment not found' });
		}

		if (updates.patientId) {
			const patient = await Patient.findOne({ patientId: updates.patientId });
			if (!patient) {
				return res.status(404).json({ message: 'Patient not found' });
			}
		}

		if (updates.doctorName || updates.date || updates.time) {
			const doctorName = updates.doctorName || appointment.doctorName;
			const date = updates.date || appointment.date;
			const time = updates.time || appointment.time;

			const conflict = await Appointment.findOne({
				doctorName,
				date,
				time,
				status: { $ne: 'cancelled' },
				_id: { $ne: appointment._id },
			});

			if (conflict) {
				return res.status(409).json({ message: 'Doctor not available at that time' });
			}
		}

		Object.assign(appointment, updates);
		await appointment.save();
		res.json(appointment);
	} catch (err) {
		next(err);
	}
};

const cancelAppointment = async (req, res, next) => {
	try {
		const appointment = await Appointment.findById(req.params.id);
		if (!appointment) {
			return res.status(404).json({ message: 'Appointment not found' });
		}
		appointment.status = 'cancelled';
		await appointment.save();
		res.json(appointment);
	} catch (err) {
		next(err);
	}
};

const deleteAppointment = async (req, res, next) => {
	try {
		const appointment = await Appointment.findByIdAndDelete(req.params.id);
		if (!appointment) {
			return res.status(404).json({ message: 'Appointment not found' });
		}
		res.json({ message: 'Appointment deleted' });
	} catch (err) {
		next(err);
	}
};

module.exports = {
	checkAvailability,
	createAppointment,
	getAppointments,
	getAppointmentById,
	updateAppointment,
	cancelAppointment,
	deleteAppointment,
};
