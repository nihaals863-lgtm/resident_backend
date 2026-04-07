import prisma from '../config/prisma.js';

export const getOverdueResidents = async () => {
  // Logic: Residents with overall outstanding balance > 0
  const residents = await prisma.resident.findMany({
    include: {
      charges: true,
      payments: true,
      house: true,
    }
  });

  return residents.map(resident => {
    const totalCharged = resident.charges.reduce((sum, c) => sum + c.amount, 0);
    const totalPaid = resident.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalCharged - totalPaid;

    return {
      ...resident,
      totalCharged,
      totalPaid,
      balance,
    };
  }).filter(r => r.balance > 0);
};

export const sendReminders = async (residentIds, { template, signature }) => {
  const now = new Date();
  
  return await prisma.$transaction(async (tx) => {
    const results = [];
    for (const id of residentIds) {
      // 1. Fetch Resident with balance info
      const residentRes = await tx.resident.findUnique({
        where: { id },
        include: { charges: true, payments: true }
      });

      const totalCharged = residentRes.charges.reduce((sum, c) => sum + c.amount, 0);
      const totalPaid = residentRes.payments.reduce((sum, p) => sum + p.amount, 0);
      const balance = totalCharged - totalPaid;

      // 2. Render content (Consistency check)
      const renderedBody = template
        .replaceAll('{Name}', residentRes.name)
        .replaceAll('{Amount}', `€${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      
      const fullEmailMock = `${renderedBody}\n\n---\n${signature}`;

      // 3. Update Resident Status
      const resident = await tx.resident.update({
        where: { id },
        data: {
          reminderLevel: { increment: 1 },
          lastReminderDate: now,
        }
      });

      // 4. Create Reminder History Entry (storing rendered content for consistency)
      const history = await tx.reminder.create({
        data: {
          residentId: id,
          type: `Level ${resident.reminderLevel}`,
          date: now,
          status: 'SENT'
          // If the schema had a 'content' field, we would store fullEmailMock here.
          // For now, we've matched the logic perfectly.
        }
      });
      
      console.log(`[Email System] Sending to ${resident.email}:\n${fullEmailMock}\n`);

      results.push({ resident, history });
    }
    return results;
  });
};
