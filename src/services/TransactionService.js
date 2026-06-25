import BaseService from './BaseService.js';
import PointConfigService from './PointConfigService.js';

class TransactionService extends BaseService {

  async createTransaction({ userId, targetAccount, purchaseDetails, billing }) {
    // Cek user & saldo poin
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User tidak ditemukan");
    if (billing.pointsUsed > user.points) throw new Error("Poin tidak cukup");

    const invoiceId = `RAST7-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const newTransaction = await this.prisma.transactions.create({
      data: {
        invoiceId,
        userId,
        accountId: targetAccount.accountId,
        zoneId: targetAccount.zoneId,
        gameName: purchaseDetails.gameName,
        itemName: purchaseDetails.itemName,
        itemQty: purchaseDetails.itemQty,
        paymentMethod: purchaseDetails.paymentMethod,
        basePrice: billing.basePrice,
        taxAmount: billing.taxAmount,
        discountPoints: billing.pointsUsed,
        totalPaid: billing.totalPaid,
        waktu: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
        status: "SUCCESS"
      }
    });

    // Potong poin jika digunakan
    if (billing.pointsUsed > 0) {
      await this.prisma.users.update({
        where: { id: userId },
        data: { points: { decrement: billing.pointsUsed } }
      });
    }

    // Tambah poin reward (dynamic rate based on user tier)
    const pointConfigService = new PointConfigService(this.prisma);
    const config = await pointConfigService.getConfigForUser(userId);
    const rewardPoints = Math.floor(billing.totalPaid * config.rewardRate);
    if (rewardPoints > 0) {
      await this.prisma.users.update({
        where: { id: userId },
        data: { points: { increment: rewardPoints } }
      });
    }

    // Update user level based on new spending
    await pointConfigService.recalculateLevel(userId);

    return newTransaction;
  }

  async getHistory(userId) {
    return await this.prisma.transactions.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async redeemVoucher(userId, code) {
    const voucher = await this.prisma.vouchers.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!voucher || !voucher.isActive) {
      throw new Error("Kode voucher tidak valid atau sudah tidak aktif.");
    }
    if (voucher.validUntil && new Date(voucher.validUntil) < new Date()) {
      throw new Error("Kode voucher sudah kedaluwarsa.");
    }
    if (voucher.usedCount >= voucher.quota) {
      throw new Error("Kuota voucher sudah habis.");
    }

    // Cek apakah user sudah pernah redeem voucher ini (kecuali admin)
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User tidak ditemukan.");
    }
    if (!user.isAdmin) {
      const existing = await this.prisma.voucher_redemptions.findFirst({
        where: { userId, voucherId: voucher.id }
      });
      if (existing) {
        throw new Error("Kode voucher sudah pernah digunakan.");
      }
    }

    // Update poin user & voucher dalam satu transaksi atomik
    await this.prisma.$transaction([
      this.prisma.users.update({
        where: { id: userId },
        data: { points: { increment: voucher.rewardValue } }
      }),
      this.prisma.vouchers.update({
        where: { id: voucher.id },
        data: { usedCount: { increment: 1 } }
      }),
      this.prisma.voucher_redemptions.create({
        data: { userId, voucherId: voucher.id, code: voucher.code }
      })
    ]);

    const updatedUser = await this.prisma.users.findUnique({ where: { id: userId } });
    return { newPoints: updatedUser.points, rewardValue: voucher.rewardValue };
  }

  async getLeaderboard() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate total spent per user in the last 30 days
    const result = await this.prisma.transactions.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: 'SUCCESS'
      },
      _sum: { totalPaid: true },
      orderBy: { _sum: { totalPaid: 'desc' } },
      take: 10
    });

    // Enrich with username from users table
    const enriched = await Promise.all(result.map(async (entry, index) => {
      const user = await this.prisma.users.findUnique({
        where: { id: entry.userId },
        select: { username: true }
      });
      return {
        rank: index + 1,
        username: user?.username ?? 'Unknown',
        totalSpent: entry._sum.totalPaid ?? 0
      };
    }));

    return enriched;
  }
}

export default TransactionService;
