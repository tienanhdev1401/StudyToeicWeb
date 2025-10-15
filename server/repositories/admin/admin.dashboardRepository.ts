import db from "../../config/db";
import { DashboardStats } from '../../models/Dashboard';

class AdminDashboardRepository {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      console.log('Getting dashboard stats...');

      // Get user stats
      console.log('Fetching user stats...');
      console.log('First day of month:', firstDayOfMonth.toISOString());
      const [userRows] = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as totalUsers,
          (SELECT COUNT(*) FROM users WHERE joinAt >= ?) as newUsersThisMonth,
          (SELECT COUNT(*) FROM users WHERE status = 'ACTIVE') as activeUsers
      `, [firstDayOfMonth]);
      const userStatsData = {
        totalUsers: Number(userRows?.totalUsers ?? 0),
        newUsersThisMonth: Number(userRows?.newUsersThisMonth ?? 0),
        activeUsers: Number(userRows?.activeUsers ?? 0)
      };
      console.log('User stats:', userStatsData);

      // Get test stats
      console.log('Fetching test stats...');
      const [testRows] = await db.query(`
        SELECT
          (SELECT COUNT(*) FROM tests) as totalTests,
          (SELECT COUNT(*) FROM submissions) as totalAttempts,
          (SELECT COALESCE(AVG(totalscore), 0) FROM submissions) as averageScore
      `);
      console.log('Raw test stats:', testRows); // Debug log
      const testStatsData = {
        totalTests: Number(testRows?.totalTests ?? 0),
        totalAttempts: Number(testRows?.totalAttempts ?? 0),
        averageScore: Number(testRows?.averageScore ?? 0)
      };
      console.log('Test stats:', testStatsData);

      // Get most popular tests
      console.log('Fetching popular tests...');
      const [popularTests] = await db.query(`
        SELECT 
          t.id as testId,
          t.title,
          COUNT(s.id) as attempts,
          COALESCE(AVG(s.totalscore), 0) as averageScore,
          COALESCE(AVG(s.listeningScore), 0) as avgListeningScore,
          COALESCE(AVG(s.readingScore), 0) as avgReadingScore
        FROM tests t
        LEFT JOIN submissions s ON t.id = s.TestId
        GROUP BY t.id, t.title
        ORDER BY COUNT(s.id) DESC
        LIMIT 5
      `);
      const popularTestsData = popularTests || [];
      console.log('Popular tests:', popularTestsData);

      // Get learning progress stats
      console.log('Fetching learning progress stats...');
      const [progressStats] = await db.query(`
        SELECT 
          COALESCE(
            COUNT(CASE WHEN progressStatus = 'COMPLETED' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0),
            0
          ) as completionRate,
          COALESCE(
            AVG(TIMESTAMPDIFF(MINUTE, createdAt, updatedAt)),
            0
          ) as averageCompletionTime
        FROM learningprocesses
        WHERE progressStatus IN ('COMPLETED', 'IN_PROGRESS')
      `);
      const progressStatsData = progressStats?.[0] || { completionRate: 0, averageCompletionTime: 0 };
      console.log('Progress stats:', progressStatsData);

      // Get monthly stats
      console.log('Fetching monthly user stats...');
      const [monthlyUserStats] = await db.query(`
        SELECT 
          DATE_FORMAT(joinAt, '%Y-%m') as month,
          COUNT(*) as newUsers,
          SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as activeUsers
        FROM users
        WHERE joinAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month
      `);
      const monthlyUserStatsData = monthlyUserStats || [];
      console.log('Monthly user stats:', monthlyUserStatsData);

      console.log('Fetching monthly test stats...');
      const [monthlyTestStats] = await db.query(`
        SELECT 
          DATE_FORMAT(s.createdAt, '%Y-%m') as month,
          COUNT(*) as attempts,
          COALESCE(AVG(s.totalscore), 0) as averageScore,
          COALESCE(AVG(s.listeningScore), 0) as avgListeningScore,
          COALESCE(AVG(s.readingScore), 0) as avgReadingScore,
          COALESCE(AVG(s.completionTime), 0) as avgCompletionTime
        FROM submissions s
        WHERE s.createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month
      `);
      const monthlyTestStatsData = monthlyTestStats || [];
      console.log('Monthly test stats:', monthlyTestStatsData);

      // Calculate user growth rate
      console.log('Calculating user growth rate...');
      const [previousRows] = await db.query(`
        SELECT COUNT(*) as count
        FROM users
        WHERE joinAt < ?
      `, [firstDayOfMonth]);
      console.log('Previous month count:', previousRows);

      const [currentRows] = await db.query(`
        SELECT COUNT(*) as count
        FROM users
        WHERE joinAt < ?
      `, [currentDate]);
      console.log('Current month count:', currentRows);

      const previousCount = previousRows[0]?.count || 0;
      const currentCount = currentRows[0]?.count || 0;
      console.log('Previous count:', previousCount);
      console.log('Current count:', currentCount);

      const userGrowthRate = previousCount > 0 
        ? ((currentCount - previousCount) / previousCount * 100)
        : 0;
      console.log('User growth rate:', userGrowthRate);

      const result = {
        ...userStatsData,
        ...testStatsData,
        userGrowthRate,
        mostPopularTests: popularTestsData,
        ...progressStatsData,
        monthlyUserStats: monthlyUserStatsData,
        monthlyTestStats: monthlyTestStatsData
      } as DashboardStats;

      console.log('Final dashboard stats:', result);
      return result;
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw error;
    }
  }
}

const adminDashboardRepository = new AdminDashboardRepository();
export default adminDashboardRepository;
