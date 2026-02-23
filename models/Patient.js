const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
	{
		patientId: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		NIC: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		dateOfBirth: {
			type: Date,
			required: true,
		},
		address: {
			type: String,
			required: true,
			trim: true,
		},
		previousCaseHistory: {
			type: String,
			default: '',
			trim: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Virtual age field keeps age accurate without manual updates.
patientSchema.virtual('age').get(function getAge() {
	if (!this.dateOfBirth) return null;
	const now = new Date();
	const dob = new Date(this.dateOfBirth);
	let age = now.getFullYear() - dob.getFullYear();
	const hasHadBirthdayThisYear =
		now.getMonth() > dob.getMonth() ||
		(now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());
	if (!hasHadBirthdayThisYear) age -= 1;
	return age;
});

module.exports = mongoose.model('Patient', patientSchema);
