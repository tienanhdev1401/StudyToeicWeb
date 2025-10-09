import database from '../config/db';
import { Submission } from '../models/Submission';
import { SubmissionBuilder } from '../builder/SubmissionBuilder';

export class SubmissionRepository {
  async createSubmission(submission: Submission): Promise<number> {
    try {
      const result = await database.query(
        `INSERT INTO submissions 
        (tittle, totalscore, listeningScore, readingScore, completionTime, userAnswer, LearnerId, TestId) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          submission.tittle,
          submission.totalscore,
          submission.listeningScore,
          submission.readingScore,
          submission.completionTime,
          JSON.stringify(submission.userAnswer),
          submission.LearnerId,
          submission.TestId
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  }

  async getSubmissionById(id: number): Promise<Submission | null> {
    try {
      const results = await database.query('SELECT * FROM submissions WHERE id = ?', [id]);
      
      if (results.length === 0) {
        return null;
      }
      
      const row = results[0];
      return new SubmissionBuilder()
        .setId(row.id)
        .setTittle(row.tittle)
        .setTotalscore(row.totalscore)
        .setListeningScore(row.listeningScore)
        .setReadingScore(row.readingScore)
        .setCompletionTime(row.completionTime)
        .setUserAnswer(row.userAnswer ? JSON.parse(row.userAnswer) : null)
        .setCreatedAt(row.createdAt)
        .setUpdatedAt(row.updatedAt)
        .setLearnerId(row.LearnerId)
        .setTestId(row.TestId)
        .build();
    } catch (error) {
      console.error(`Error getting submission with ID ${id}:`, error);
      throw error;
    }
  }

  async getSubmissionsByLearnerId(learnerId: number): Promise<Submission[]> {
    try {
      const results = await database.query(
        'SELECT * FROM submissions WHERE LearnerId = ? ORDER BY createdAt DESC',
        [learnerId]
      );
      
      return results.map((row: any) => 
        new SubmissionBuilder()
          .setId(row.id)
          .setTittle(row.tittle)
          .setTotalscore(row.totalscore)
          .setListeningScore(row.listeningScore)
          .setReadingScore(row.readingScore)
          .setCompletionTime(row.completionTime)
          .setUserAnswer(row.userAnswer ? JSON.parse(row.userAnswer) : null)
          .setCreatedAt(row.createdAt)
          .setUpdatedAt(row.updatedAt)
          .setLearnerId(row.LearnerId)
          .setTestId(row.TestId)
          .build()
      );
    } catch (error) {
      console.error(`Error getting submissions for learner ${learnerId}:`, error);
      throw error;
    }
  }

  async getSubmissionsByTestId(testId: number): Promise<Submission[]> {
    try {
      const results = await database.query(
        'SELECT * FROM submissions WHERE TestId = ? ORDER BY createdAt DESC',
        [testId]
      );
      
      return results.map((row: any) => 
        new SubmissionBuilder()
          .setId(row.id)
          .setTittle(row.tittle)
          .setTotalscore(row.totalscore)
          .setListeningScore(row.listeningScore)
          .setReadingScore(row.readingScore)
          .setCompletionTime(row.completionTime)
          .setUserAnswer(row.userAnswer ? JSON.parse(row.userAnswer) : null)
          .setCreatedAt(row.createdAt)
          .setUpdatedAt(row.updatedAt)
          .setLearnerId(row.LearnerId)
          .setTestId(row.TestId)
          .build()
      );
    } catch (error) {
      console.error(`Error getting submissions for test ${testId}:`, error);
      throw error;
    }
  }

  async updateSubmission(id: number, submission: Partial<Submission>): Promise<boolean> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (submission.tittle !== undefined) {
        updateFields.push('tittle = ?');
        updateValues.push(submission.tittle);
      }

      if (submission.totalscore !== undefined) {
        updateFields.push('totalscore = ?');
        updateValues.push(submission.totalscore);
      }

      if (submission.listeningScore !== undefined) {
        updateFields.push('listeningScore = ?');
        updateValues.push(submission.listeningScore);
      }

      if (submission.readingScore !== undefined) {
        updateFields.push('readingScore = ?');
        updateValues.push(submission.readingScore);
      }

      if (submission.completionTime !== undefined) {
        updateFields.push('completionTime = ?');
        updateValues.push(submission.completionTime);
      }

      if (submission.userAnswer !== undefined) {
        updateFields.push('userAnswer = ?');
        updateValues.push(JSON.stringify(submission.userAnswer));
      }

      if (submission.LearnerId !== undefined) {
        updateFields.push('LearnerId = ?');
        updateValues.push(submission.LearnerId);
      }

      if (submission.TestId !== undefined) {
        updateFields.push('TestId = ?');
        updateValues.push(submission.TestId);
      }

      updateFields.push('updatedAt = NOW()');

      if (updateFields.length === 0) {
        return false;
      }

      updateValues.push(id);

      const result = await database.query(
        `UPDATE submissions SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating submission ${id}:`, error);
      throw error;
    }
  }

  async deleteSubmission(id: number): Promise<boolean> {
    try {
      const result = await database.query(
        'DELETE FROM submissions WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting submission ${id}:`, error);
      throw error;
    }
  }
}

export const submissionRepository = new SubmissionRepository(); 