const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
	{
		patientId: {
			type: String,
			required: true,
			trim: true,
		},
		date: {
			type: Date,
			required: true,
		},
		time: {
			type: String,
			required: true,
			trim: true,
			match: /^([01]\d|2[0-3]):[0-5]\d$/, // HH:mm 24h
		},
		doctorName: {
			type: String,
			required: true,
			trim: true,
		},
		status: {
			type: String,
			enum: ['scheduled', 'cancelled', 'completed'],
			default: 'scheduled',
		},
	},
	{
		timestamps: true,
	}
);

appointmentSchema.index({ doctorName: 1, date: 1, time: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
