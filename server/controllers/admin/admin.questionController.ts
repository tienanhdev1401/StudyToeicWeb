import { Request, Response } from 'express';
import { Question } from '../../models/Question';
import { QuestionRepository } from '../../repositories/admin/admin.questionRepository';
import { QuestionInAPartRepository } from '../../repositories/admin/admin.questionInAPartRepository';
import { QuestionInAPart } from '../../models/QuestionInAPart';
import { ResourceRepository } from '../../repositories//admin/admin.resourceRepository';
import { exercisesQuestionRepository } from '../../repositories/admin/admin.exercisesQuestionRepository';
import bodyParser from 'body-parser';

export class QuestionController {
 
  static async getAllQuestions(req: Request, res: Response) {
    try {
      const questions = await QuestionRepository.findAll();
      return res.status(200).json({
        success: true,
        data: questions,
        message: 'Lấy danh sách câu hỏi thành công'
      });

    } catch (error) {
      console.error('QuestionController.getAllQuestions error:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }


  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
      }

      const question = await QuestionRepository.findById(id);
      if (!question) {
        return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
      }
      return res.status(200).json({ ...question});
    } catch (error) {
      console.error('QuestionController.getById error:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  }

  static async getQuestionsByIds(ids: number[]): Promise<Question[]> {
    return QuestionRepository.findByIds(ids);
  }
  
  static async getQuestionsByPartId(req: Request, res: Response) {
    try {
      console.log(req.body);
      const partId = parseInt(req.params.partId);
      if (isNaN(partId)) {
        return res.status(400).json({ error: 'ID phần không hợp lệ' });
      }
      
      // Lấy danh sách questionInAPart từ repository
      const questionInAParts = await QuestionInAPartRepository.findByPartId(partId);
      if (!questionInAParts || questionInAParts.length === 0) {
        return res.status(200).json([]);
      }
      
      // Lấy danh sách ID câu hỏi
      const questionIds = questionInAParts.map(q => q.QuestionId);
      
      // Lấy thông tin chi tiết của tất cả câu hỏi
      const questions = await QuestionRepository.findByIds(questionIds);
      
      // Kết hợp thông tin câu hỏi với số thứ tự
      const result = questionInAParts.map(qp => {
        const question = questions.find(q => q.id === qp.QuestionId);
        return {
          ...question,
          questionNumber: qp.questionNumber
        };
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('QuestionController.getQuestionsByPartId error:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  }

  static async createQuestion(req: Request, res: Response) {
    try {
      console.log("req.body: ", req.body);
      const partId = parseInt(req.params.partId);
      if (isNaN(partId)) {
        return res.status(400).json({ error: 'ID phần không hợp lệ' });
      }

      const {
        content,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        explainDetail,
        resourceData,
        questionNumber,
        audioUrl,
        imageUrl,
        explainResource
      } = req.body;

      // Validate required fields
      // if (!content || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      //   return res.status(400).json({ error: 'Thiếu thông tin câu hỏi bắt buộc' });
      // }

      // Create resource if audio or image URL is provided
      let resourceId = null;
      try {
        if (resourceData && (resourceData.audioUrl || resourceData.imageUrl || resourceData.explainResource)) {
          resourceId = await ResourceRepository.createResource(
            resourceData.explainResource || null,
            resourceData.audioUrl || null,
            resourceData.imageUrl || null
          );
        } else if(audioUrl || imageUrl || explainResource) {
            resourceId = await ResourceRepository.createResource(
              explainResource || null,
              audioUrl || null,
              imageUrl || null
            );
          }
        
      } catch (resourceError) {
        console.error('Error creating resource:', resourceError);
        // Continue without a resource if creation fails
      }

      // Create new question - match the constructor parameters
      const question = new Question(
        0, // ID will be assigned by DB
        content,
        correctAnswer,
        explainDetail || '', // explainDetail
        optionA,
        optionB,
        optionC,
        optionD,
        null // resource - will be set after creation
      );

      // Save question to database
      const savedQuestion = await QuestionRepository.create(question, resourceId);

      if (!savedQuestion || !savedQuestion.id) {
        return res.status(500).json({ error: 'Không thể tạo câu hỏi' });
      }

      // Link the question to the part
      const questionInPart = new QuestionInAPart(
        partId,
        savedQuestion.id,
        questionNumber
      );

      await QuestionInAPartRepository.create(questionInPart);

      return res.status(201).json({ 
        success: true, 
        message: 'Đã tạo câu hỏi thành công',
        data: { 
          ...savedQuestion, 
          questionNumber,
          resource: resourceId ? {
            id: resourceId,
            explainResource: resourceData?.explainResource || null,
            audioUrl: resourceData?.audioUrl || null,
            imageUrl: resourceData?.imageUrl || null
          } : null
        } 
      });
    } catch (error) {
      console.error('QuestionController.createQuestion error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Lỗi khi tạo câu hỏi'
      });
    }
  }

  static async updateQuestion(req: Request, res: Response) {
    try {
      const partId = parseInt(req.params.partId);
      const questionId = parseInt(req.params.questionId);

      if (isNaN(partId) || isNaN(questionId)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
      }

      // Check if the question exists
      const existingQuestions = await QuestionRepository.findByIds([questionId]);
      if (!existingQuestions || existingQuestions.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
      }

      const question = existingQuestions[0];

      // Check if the question is in the part
      const questionInPart = await QuestionInAPartRepository.findByPartIdAndQuestionId(partId, questionId);
      if (!questionInPart) {
        return res.status(404).json({ error: 'Câu hỏi không thuộc phần này' });
      }

      const {
        content,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        explainDetail,
        resourceData,
        questionNumber
      } = req.body;

      // Handle resource update or creation
      let resourceId = question.resource?.id || null;
      
      try {
        if (resourceData) {
          if (resourceId) {
            // Update existing resource
            await ResourceRepository.updateResource(
              resourceId,
              resourceData.explainResource || null,
              resourceData.audioUrl || null,
              resourceData.imageUrl || null
            );
          } else if (resourceData.audioUrl || resourceData.imageUrl || resourceData.explainResource) {
            // Create new resource
            resourceId = await ResourceRepository.createResource(
              resourceData.explainResource || null,
              resourceData.audioUrl || null,
              resourceData.imageUrl || null
            );
          }
        }
      } catch (resourceError) {
        console.error('Error managing resource:', resourceError);
        // Continue without modifying the resource if it fails
      }

      // Update question data - match the constructor parameters
      const updatedQuestion = new Question(
        questionId,
        content || question.content,
        correctAnswer || question.correctAnswer,
        explainDetail || question.explainDetail || '',
        optionA || question.optionA,
        optionB || question.optionB,
        optionC || question.optionC,
        optionD || question.optionD,
        question.resource
      );

      await QuestionRepository.update(updatedQuestion, resourceId);

      // Update question number if provided
      if (questionNumber !== undefined && questionNumber !== questionInPart.questionNumber) {
        await QuestionInAPartRepository.updateQuestionNumber(partId, questionId, questionNumber);
      }

      return res.status(200).json({
        success: true,
        message: 'Đã cập nhật câu hỏi thành công',
        data: { 
          ...updatedQuestion, 
          questionNumber: questionNumber || questionInPart.questionNumber,
          resource: resourceId ? {
            id: resourceId,
            explainResource: resourceData?.explainResource || null,
            audioUrl: resourceData?.audioUrl || null,
            imageUrl: resourceData?.imageUrl || null
          } : question.resource
        }
      });
    } catch (error) {
      console.error('QuestionController.updateQuestion error:', error);
      return res.status(500).json({
        success: false,
        error: 'Lỗi khi cập nhật câu hỏi'
      });
    }
  }

  static async deleteQuestion(req: Request, res: Response) {
    try {
      const partId = parseInt(req.params.partId);
      const questionId = parseInt(req.params.questionId);

      console.log("partid: ", partId + "questionid " +questionId);

      if (isNaN(partId) || isNaN(questionId)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
      }

      // Check if the question is in the part
      const questionInPart = await QuestionInAPartRepository.findByPartIdAndQuestionId(partId, questionId);
      if (!questionInPart) {
        return res.status(404).json({ error: 'Câu hỏi không thuộc phần này' });
      }

      // Remove the question from the part
      await QuestionInAPartRepository.delete(partId, questionId);

      // Check if the question is used in other parts
      const usedInOtherParts = await QuestionInAPartRepository.isQuestionUsedInOtherParts(questionId, partId);

      // If not used anywhere else, delete the question entirely
      if (!usedInOtherParts) {
        await QuestionRepository.delete(questionId);
      }

      return res.status(200).json({
        success: true,
        message: 'Đã xóa câu hỏi thành công'
      });
    } catch (error) {
      console.error('QuestionController.deleteQuestion error:', error);
      return res.status(500).json({
        success: false,
        error: 'Lỗi khi xóa câu hỏi'
      });
    }
  }


  static async createDefaultQuestion(req: Request, res: Response) {
    try {
      console.log("req.body: ", req.body);
      const {
        content,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        explainDetail,
        resourceData,
        questionNumber,
        audioUrl,
        imageUrl,
        explainResource
      } = req.body;

      // Validate required fields
      // if (!content || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      //   return res.status(400).json({ error: 'Thiếu thông tin câu hỏi bắt buộc' });
      // }

      // Create resource if audio or image URL is provided
      let resourceId = null;
      try {
        if (resourceData && (resourceData.audioUrl || resourceData.imageUrl || resourceData.explainResource)) {
          resourceId = await ResourceRepository.createResource(
            resourceData.explainResource || null,
            resourceData.audioUrl || null,
            resourceData.imageUrl || null
          );
        } else if(audioUrl || imageUrl || explainResource) {
            resourceId = await ResourceRepository.createResource(
              explainResource || null,
              audioUrl || null,
              imageUrl || null
            );
          }
        
      } catch (resourceError) {
        console.error('Error creating resource:', resourceError);
        // Continue without a resource if creation fails
      }

      // Create new question - match the constructor parameters
      const question = new Question(
        0, // ID will be assigned by DB
        content,
        correctAnswer,
        explainDetail || '', // explainDetail
        optionA,
        optionB,
        optionC,
        optionD,
        null // resource - will be set after creation
      );

      // Save question to database
      const savedQuestion = await QuestionRepository.create(question, resourceId);

      if (!savedQuestion || !savedQuestion.id) {
        return res.status(500).json({ error: 'Không thể tạo câu hỏi' });
      }
      return res.status(201).json({ 
        success: true, 
        message: 'Đã tạo câu hỏi thành công',
        data: { 
          ...savedQuestion, 
          resource: resourceId ? {
            id: resourceId,
            explainResource: resourceData?.explainResource || null,
            audioUrl: resourceData?.audioUrl || null,
            imageUrl: resourceData?.imageUrl || null
          } : null
        } 
      });
    } catch (error) {
      console.error('QuestionController.createQuestion error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Lỗi khi tạo câu hỏi'
      });
    }
  }
    
    static async updateDefaultQuestion(req: Request, res: Response) {
    try {
      const questionId = parseInt(req.params.id);

      if ( isNaN(questionId)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
      } 

      // Check if the question exists
      const existingQuestions = await QuestionRepository.findByIds([questionId]);
      if (!existingQuestions || existingQuestions.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
      }

      const question = existingQuestions[0];



      const {
        content,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        explainDetail,
        resourceData,
        questionNumber
      } = req.body;

      // Handle resource update or creation
      let resourceId = question.resource?.id || null;
      
      try {
        if (resourceData) {
          if (resourceId) {
            // Update existing resource
            await ResourceRepository.updateResource(
              resourceId,
              resourceData.explainResource || null,
              resourceData.audioUrl || null,
              resourceData.imageUrl || null
            );
          } else if (resourceData.audioUrl || resourceData.imageUrl || resourceData.explainResource) {
            // Create new resource
            resourceId = await ResourceRepository.createResource(
              resourceData.explainResource || null,
              resourceData.audioUrl || null,
              resourceData.imageUrl || null
            );
          }
        }
      } catch (resourceError) {
        console.error('Error managing resource:', resourceError);
        // Continue without modifying the resource if it fails
      }

      // Update question data - match the constructor parameters
      const updatedQuestion = new Question(
        questionId,
        content || question.content,
        correctAnswer || question.correctAnswer,
        explainDetail || question.explainDetail || '',
        optionA || question.optionA,
        optionB || question.optionB,
        optionC || question.optionC,
        optionD || question.optionD,
        question.resource
      );

      await QuestionRepository.update(updatedQuestion, resourceId);

      // Update question number if provided

      return res.status(200).json({
        success: true,
        message: 'Đã cập nhật câu hỏi thành công',
        data: { 
          ...updatedQuestion, 
          resource: resourceId ? {
            id: resourceId,
            explainResource: resourceData?.explainResource || null,
            audioUrl: resourceData?.audioUrl || null,
            imageUrl: resourceData?.imageUrl || null
          } : question.resource
        }
      });
    } catch (error) {
      console.error('QuestionController.updateQuestion error:', error);
      return res.status(500).json({
        success: false,
        error: 'Lỗi khi cập nhật câu hỏi'
      });
    }
  }

  static async deleteDefaultQuestion(req: Request, res: Response) {
     try {
      const questionId = parseInt(req.params.id);

      if (isNaN(questionId)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid question ID', 
          error: 'ID không hợp lệ' 
        });
      }

      // Kiểm tra xem câu hỏi có tồn tại không
      const question = await QuestionRepository.findById(questionId);
      if (!question) {
        return res.status(404).json({ 
          success: false,
          message: 'Question not found', 
          error: 'Không tìm thấy câu hỏi' 
        });
      }

      // Kiểm tra xem câu hỏi có được sử dụng trong các bài test không
      const usedInTests = await QuestionInAPartRepository.isQuestionUsedInTests(questionId);
      if (usedInTests) {
        return res.status(400).json({ 
          success: false,
          message: 'Cannot delete question: it is used in tests',
          error: 'Không thể xóa câu hỏi vì nó đang được sử dụng trong các bài test' 
        });
      }

      // Kiểm tra xem câu hỏi có được sử dụng trong các bài tập không
      const usedInExercises = await exercisesQuestionRepository.isQuestionUsedInExercises(questionId);
      if (usedInExercises) {
        return res.status(400).json({ 
          success: false,
          message: 'Cannot delete question: it is used in exercises',
          error: 'Không thể xóa câu hỏi vì nó đang được sử dụng trong các bài tập' 
        });
      }

      // Nếu không có ràng buộc nào, tiến hành xóa câu hỏi
      const isDeleted = await QuestionRepository.delete(questionId);
      if (!isDeleted) {
        return res.status(400).json({
          success: false,
          message: 'Failed to delete question',
          error: 'Không thể xóa câu hỏi'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Đã xóa câu hỏi thành công'
      });
    } catch (error) {
      console.error('QuestionController.deleteQuestion error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while deleting question',
        error: 'Lỗi khi xóa câu hỏi'
      });
    }
  }

  static async importQuestionsFromExcel(req: Request, res: Response) {
    try {
      const questions = req.body;
      console.log("questions: ", req.body);

      // Kiểm tra xem có dữ liệu được gửi lên không
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không có dữ liệu câu hỏi hợp lệ'
        });
      }

      // Khởi tạo mảng để lưu kết quả import
      const importedQuestions: any[] = [];
      const errors: any[] = [];

      // Xử lý từng câu hỏi
      for (const question of questions) {
        try {
         
          // Tạo resource nếu có audio hoặc image URL
          let resourceId = null;
          if (question.urlAudio || question.urlImage || question.explain_resource) {
            resourceId = await ResourceRepository.createResource(
              question.explain_resource || null,
              question.urlAudio || null,
              question.urlImage || null
            );
          }

          // Tạo câu hỏi mới
          const newQuestion = new Question(
            0, // ID sẽ được DB tự động gán
            question.content,
            question.correctAnswer,
            question.explainDetail || '',
            question.optionA,
            question.optionB,
            question.optionC,
            question.optionD,
            null // resource sẽ được set sau khi tạo
          );

          // Lưu câu hỏi vào database
          const savedQuestion = await QuestionRepository.create(newQuestion, resourceId);

          if (!savedQuestion || !savedQuestion.id) {
            throw new Error('Không thể tạo câu hỏi');
          }

          // Thêm câu hỏi đã import vào mảng kết quả
          importedQuestions.push({
            ...savedQuestion,
            resource: resourceId ? {
              id: resourceId,
              explain_resource: question.explain_resource || null,
              urlAudio: question.urlAudio || null,
              urlImage: question.urlImage || null
            } : null
          });
        } catch (error: any) {
          // Nếu có lỗi, thêm vào mảng errors
          errors.push({
            question: question,
            error: error.message
          });
        }
      }

      // Trả về kết quả
      return res.status(200).json({
        success: true,
        data: importedQuestions,
        errors: errors,
        message: `Đã import thành công ${importedQuestions.length} câu hỏi${errors.length > 0 ? `, ${errors.length} câu hỏi thất bại` : ''}`
      });
    } catch (error: any) {
      console.error('QuestionController.importQuestionsFromExcel error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi import câu hỏi từ file Excel: ' + error.message
      });
    }
  } 
}