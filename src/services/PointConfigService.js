import BaseService from './BaseService.js';

class PointConfigService extends BaseService {
  async getConfigForUser(userId) {
    try {
      const agg = await this.prisma.transactions.groupBy({
        by: ['userId'],
        where: { userId, status: 'SUCCESS' },
        _sum: { totalPaid: true }
      });
      const totalSpent = agg[0]?._sum.totalPaid ?? 0;
      console.log('Total spent for user', userId, ':', totalSpent);

      const config = await this.prisma.point_configs.findFirst({
        where: { minSpent: { lte: totalSpent } },
        orderBy: { minSpent: 'desc' }
      });
      console.log('Found config:', config);

      if (!config) {
        const bronze = await this.prisma.point_configs.findUnique({ where: { tierName: 'bronze' } });
        console.log('Bronze config:', bronze);
        return bronze;
      }
      return config;
    } catch (error) {
      console.error('Error in getConfigForUser:', error);
      throw error;
    }
  }

  async recalculateLevel(userId) {
    const config = await this.getConfigForUser(userId);
    await this.prisma.users.update({
      where: { id: userId },
      data: { level: config.levelNumber }
    });
    return config;
  }

  async getMileage(userId) {
    try {
      // Get current tier config
      const currentConfig = await this.getConfigForUser(userId);
      console.log('Current config in getMileage:', currentConfig);

      if (!currentConfig) {
        throw new Error('No point config found for user');
      }

      // Get total lifetime spending
      const agg = await this.prisma.transactions.groupBy({
        by: ['userId'],
        where: { userId, status: 'SUCCESS' },
        _sum: { totalPaid: true }
      });
      const totalSpent = agg[0]?._sum.totalPaid ?? 0;

      // Get next tier
      const nextConfig = await this.prisma.point_configs.findFirst({
        where: { minSpent: { gt: currentConfig.minSpent } },
        orderBy: { minSpent: 'asc' }
      });

      // Calculate progress percentage and amount needed
      let progress = 0;
      let amountNeeded = 0;

      if (nextConfig) {
        const tierRange = nextConfig.minSpent - currentConfig.minSpent;
        const spentInTier = totalSpent - currentConfig.minSpent;
        progress = Math.min(100, Math.floor((spentInTier / tierRange) * 100));
        amountNeeded = Math.max(0, nextConfig.minSpent - totalSpent);
      } else {
        progress = 100; // Max tier reached
      }

      return {
        currentTier: currentConfig,
        nextTier: nextConfig,
        totalSpent,
        progress,
        amountNeeded
      };
    } catch (error) {
      console.error('Error in getMileage:', error);
      throw error;
    }
  }
}

export default PointConfigService;
