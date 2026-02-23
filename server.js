require('dotenv').config({ override: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use((req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

// Basic error handler keeps responses consistent.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/patient-management';

mongoose
	.connect(MONGODB_URI)
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB', err);
		process.exit(1);
	});

process.on('unhandledRejection', (reason) => {
	console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
});
