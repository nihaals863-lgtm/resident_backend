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
<<<<<<< HEAD
import { seedAdminUser } from './services/userService.js';
=======
>>>>>>> b48dc082e40dd9b1b7d7ec9df2470b0d2555a3eb

const PORT = process.env.PORT || 5000;

// Automate initial seeding
<<<<<<< HEAD
const runSeeds = async () => {
  try {
    await seedSystemConfig();
    await seedAdminUser();
    console.log('Database seeding checked/completed.');
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

runSeeds();
=======
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
>>>>>>> b48dc082e40dd9b1b7d7ec9df2470b0d2555a3eb

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
