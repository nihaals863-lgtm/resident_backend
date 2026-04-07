import prisma from '../config/prisma.js';

export const allocatePayment = async (paymentId, allocations) => {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    let totalAllocated = 0;

    for (const allocation of allocations) {
      const { chargeId, amount } = allocation;

      if (amount <= 0) continue;

      const charge = await tx.charge.findUnique({
        where: { id: chargeId },
      });

      if (!charge) {
        throw new Error(`Charge not found: ${chargeId}`);
      }

      await tx.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          chargeId: charge.id,
          amount: amount,
        },
      });

      const newPaidAmount = charge.paidAmount + amount;

      let newStatus = 'UNPAID';
      if (newPaidAmount >= charge.amount) {
        newStatus = 'PAID';
      } else if (newPaidAmount > 0) {
        newStatus = 'PARTIAL';
      }

      await tx.charge.update({
        where: { id: charge.id },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      });

      totalAllocated += amount;
    }

    if (totalAllocated > payment.amount) {
      throw new Error('Total allocated amount exceeds the payment amount');
    }

    const unallocatedAmount = payment.amount - totalAllocated;

    if (unallocatedAmount > 0) {
      await tx.resident.update({
        where: { id: payment.residentId },
        data: {
          creditBalance: {
            increment: unallocatedAmount,
          },
        },
      });
    }

    return {
      success: true,
      paymentId: payment.id,
      totalAllocated,
      unallocatedAmount,
    };
  });
};

export const recordPayment = async (data) => {
  const { residentId, amount, date, method, note } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. Create the payment record
    const payment = await tx.payment.create({
      data: {
        residentId,
        amount,
        date: new Date(date),
        method,
        note: note || null,
      }
    });

    // 2. Find unpaid charges for this resident, ordered by month/date
    const unpaidCharges = await tx.charge.findMany({
      where: {
        residentId,
        status: { in: ['UNPAID', 'PARTIAL'] }
      },
      orderBy: {
        month: 'asc' // Simplistic: Should probably be date-based
      }
    });

    let remainingAmount = amount;
    const allocations = [];

    for (const charge of unpaidCharges) {
      if (remainingAmount <= 0) break;

      const needed = charge.amount - charge.paidAmount;
      const toAllocate = Math.min(remainingAmount, needed);

      if (toAllocate > 0) {
        await tx.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            chargeId: charge.id,
            amount: toAllocate
          }
        });

        const newPaidAmount = charge.paidAmount + toAllocate;
        const newStatus = newPaidAmount >= charge.amount ? 'PAID' : 'PARTIAL';

        await tx.charge.update({
          where: { id: charge.id },
          data: {
            paidAmount: newPaidAmount,
            status: newStatus
          }
        });

        remainingAmount -= toAllocate;
        allocations.push({ chargeId: charge.id, amount: toAllocate });
      }
    }

    // 3. If any amount remains, it goes to creditBalance
    if (remainingAmount > 0) {
      await tx.resident.update({
        where: { id: residentId },
        data: {
          creditBalance: { increment: remainingAmount }
        }
      });
    }

    return {
      payment,
      allocated: amount - remainingAmount,
      toCredit: remainingAmount
    };
  });
};

export const getAllPayments = async () => {
  return await prisma.payment.findMany({
    include: {
      resident: {
        include: {
          house: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });
};
