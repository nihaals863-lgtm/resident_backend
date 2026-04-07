import prisma from '../config/prisma.js';

const getMonthsBetween = (startDate) => {
  const start = new Date(startDate);
  const end = new Date();
  const startDay = start.getDate();
  
  const months = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const currentEnd = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= currentEnd) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    
    // Only add the month if the billing day has passsed in that month
    // OR if it's a past month.
    let isPastMonth = current < currentEnd;
    let isCurrentMonthAndDue = (current.getFullYear() === end.getFullYear() && 
                                current.getMonth() === end.getMonth() && 
                                end.getDate() >= startDay);

    if (isPastMonth || isCurrentMonthAndDue) {
      months.push(`${year}-${month}`);
    }
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
};

export const generateMonthlyCharges = async (residentId) => {
  const resident = await prisma.resident.findUnique({
    where: { id: residentId },
    include: { chargeDefs: true }
  });

  if (!resident) {
    throw new Error('Resident not found');
  }

  const generatedCharges = [];
  const start = new Date(resident.startDate);
  const billingDay = start.getDate();

  for (const def of resident.chargeDefs) {
    const months = getMonthsBetween(def.startDate);

    for (const monthStr of months) {
      const existingCharge = await prisma.charge.findFirst({
        where: {
          residentId: residentId,
          type: def.type,
          month: monthStr
        }
      });

      if (!existingCharge) {
        // Calculate the actual charge date using the billing day
        const [year, month] = monthStr.split('-').map(Number);
        
        // Handle last day of month if billing day doesn't exist (e.g. 31st in Feb)
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        const actualDay = Math.min(billingDay, lastDayOfMonth);
        const chargeDate = new Date(year, month - 1, actualDay);

        const newCharge = await prisma.charge.create({
          data: {
            residentId: residentId,
            type: def.type,
            amount: def.amount,
            month: monthStr,
            date: chargeDate,
            status: 'UNPAID',
            paidAmount: 0
          }
        });
        generatedCharges.push(newCharge);
      }
    }
  }

  return {
    success: true,
    generatedCount: generatedCharges.length,
    charges: generatedCharges
  };
};

export const globalSyncCharges = async () => {
  const residents = await prisma.resident.findMany({
    select: { id: true }
  });

  let totalGenerated = 0;
  for (const resident of residents) {
    const result = await generateMonthlyCharges(resident.id);
    totalGenerated += result.generatedCount;
  }

  return { success: true, totalGenerated };
};

export const getResidentCharges = async (residentId) => {
  return await prisma.charge.findMany({
    where: { residentId },
    orderBy: { month: 'desc' }
  });
};

export const addChargeDefinition = async (data) => {
  const { residentId, type, amount, startDate } = data;
  return await prisma.chargeDefinition.create({
    data: {
      residentId,
      type,
      amount,
      startDate: new Date(startDate)
    }
  });
};

export const getChargeDefinitions = async (residentId) => {
  return await prisma.chargeDefinition.findMany({
    where: { residentId }
  });
};

export const deleteChargeDefinition = async (id) => {
  return await prisma.chargeDefinition.delete({
    where: { id }
  });
};

export const createManualCharge = async (data) => {
  const { residentId, amount, month, type, status, date, note, description } = data;
  
  // Create a charge that defaults to UNPAID for manual entries
  return await prisma.charge.create({
    data: {
      residentId,
      amount: parseFloat(amount),
      month,
      type: type || 'Other',
      description,
      status: status || 'UNPAID',
      date: date ? new Date(date) : new Date(),
      paidAmount: 0
    }
  });
};
