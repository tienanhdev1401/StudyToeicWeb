import { RowDataPacket } from 'mysql2';

export interface DashboardStats extends RowDataPacket {
  // User stats
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  userGrowthRate: number;

  // Test stats
  totalTests: number;
  totalAttempts: number;
  averageScore: number;
  mostPopularTests: {
    testId: number;
    title: string;
    attempts: number;
    averageScore: number;
  }[];

  // Learning progress stats
  completionRate: number;
  averageCompletionTime: number;
  progressByTopic: {
    topicId: number;
    topicName: string;
    completionPercentage: number;
  }[];
  
  // Time series data
  monthlyUserStats: {
    month: string;
    newUsers: number;
    activeUsers: number;
  }[];
  
  monthlyTestStats: {
    month: string;
    attempts: number;
    averageScore: number;
  }[];
}
