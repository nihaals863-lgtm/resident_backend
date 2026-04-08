import 'dotenv/config'; 
import app from './app.js';
import chargeRoutes from './routes/charge.routes.js';
import houseRoutes from './routes/house.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import remindersRoutes from './routes/reminders.routes.js';
import residentRoutes from './routes/resident.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import bankRoutes from './routes/bank.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import { seedSystemConfig } from './services/settings.service.js';

const PORT = process.env.PORT || 5000;

// Automate initial seeding
seedSystemConfig().then(() => {
  console.log('Database seeding checked/completed.');
}).catch(err => {
  console.error('Seeding error:', err);
});

app.use('/api/residents', residentRoutes);
app.use('/api/charges', chargeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
