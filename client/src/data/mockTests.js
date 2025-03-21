// data/mockTests.js
export const generateMockQuestions = () => {
    const questions = [];
    
    // Phần Nghe (Listening: Part 1-4)
    // Part 1: Câu 1-6
    for (let i = 1; i <= 6; i++) {
      questions.push(createQuestion(i, 1));
    }
    
    // Part 2: Câu 7-31 (25 câu)
    for (let i = 7; i <= 31; i++) {
      questions.push(createQuestion(i, 2));
    }
    
    // Part 3: Câu 32-70 (39 câu)
    for (let i = 32; i <= 70; i++) {
      questions.push(createQuestion(i, 3));
    }
    
    // Part 4: Câu 71-100 (30 câu)
    for (let i = 71; i <= 100; i++) {
      questions.push(createQuestion(i, 4));
    }
    
    // Phần Đọc (Reading: Part 5-7)
    // Part 5: Câu 101-130 (30 câu)
    for (let i = 101; i <= 130; i++) {
      questions.push(createQuestion(i, 5));
    }
    
    // Part 6: Câu 131-146 (16 câu)
    for (let i = 131; i <= 146; i++) {
      questions.push(createQuestion(i, 6));
    }
    
    // Part 7: Câu 147-200 (54 câu)
    for (let i = 147; i <= 200; i++) {
      questions.push(createQuestion(i, 7));
    }
    
    return questions;
  };
  
  const createQuestion = (id, part) => ({
    id,
    part,
    questionText: `Test câu hỏi ${id}`,
    answers: Array.from({length: 4}, (_, i) => ({
      id: i + 1,
      text: (i + 1).toString()
    })),
    answered: false,
    selectedAnswer: null
  });
  
  export const mockTests = {
    test1: {
      id: 1,
      title: "TEST ĐẦU VÀO (3)",
      duration: 120,
      parts: {
        listening: [
          { part: 1, questions: 6 },
          { part: 2, questions: 25 },
          { part: 3, questions: 39 },
          { part: 4, questions: 30 }
        ],
        reading: [
          { part: 5, questions: 30 },
          { part: 6, questions: 16 },
          { part: 7, questions: 54 }
        ]
      },
      questions: generateMockQuestions()
    },
  };