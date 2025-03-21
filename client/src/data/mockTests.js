// data/mockTests.js
export const generateMockQuestions = () => {
  const questions = [];
  let resourceCounter = 1;

  // Part 1: Picture Description (6 questions)
  for (let i = 1; i <= 6; i++) {
      questions.push({
          id: i,
          part: 1,
          imageUrl: `https://cdn-media.sforum.vn/storage/app/media/ctv_seo3/mau-background-dep-12.jpg`,
          resourceId: `part1_${i}`,
          answers: generateAnswers(1),
      });
  }

  // Part 2: Question-Response (25 questions)
  for (let i = 7; i <= 31; i++) {
      questions.push({
          id: i,
          part: 2,
          audioUrl: `https://www.youtube.com/watch?v=B3ZbsOhNTas`,
          resourceId: `part2_${i}`,
          answers: generateAnswers(2),
      });
  }

  // Part 3: Conversations (13 conversations, 3 questions each)
  for (let i = 0; i < 13; i++) {
      const resourceId = `part3_conv_${resourceCounter++}`;
      for (let j = 0; j < 3; j++) {
          questions.push({
              id: 32 + (i * 3) + j,
              part: 3,
              resourceId,
              audioUrl: `https://example.com/audio/${resourceId}.mp3`,
              chart: i % 2 === 0 ? `https://example.com/charts/part3_${i}.png` : null,
              questionText: `What is the main topic of conversation ${i + 1}?`,
              answers: generateAnswers(3),
          });
      }
  }

  // Part 4: Short Talks (10 talks, 3 questions each)
  for (let i = 0; i < 10; i++) {
      const resourceId = `part4_talk_${resourceCounter++}`;
      for (let j = 0; j < 3; j++) {
          questions.push({
              id: 71 + (i * 3) + j,
              part: 4,
              resourceId,
              audioUrl: `https://example.com/audio/${resourceId}.mp3`,
              questionText: `What is the main purpose of talk ${i + 1}?`,
              answers: generateAnswers(4),
          });
      }
  }

  // Part 5: Incomplete Sentences (30 questions)
  for (let i = 101; i <= 130; i++) {
      questions.push({
          id: i,
          part: 5,
          sentence: `The company announced ______ new policy yesterday. (Câu ${i})`,
          answers: generateAnswers(5),
      });
  }

  // Part 6: Text Completion (4 passages, 4 questions each)
  for (let i = 0; i < 4; i++) {
      const resourceId = `part6_passage_${resourceCounter++}`;
      for (let j = 0; j < 4; j++) {
          questions.push({
              id: 131 + (i * 4) + j,
              part: 6,
              resourceId,
              passageText: [
                  `The annual conference will be held from ______ to ______.`, 
                  `All participants must register ______.`
              ],
              answers: generateAnswers(6),
          });
      }
  }

  // Part 7: Reading Comprehension
  // Single passages (10 passages, 2-4 questions each)
  let questionId = 147;
  for (let i = 0; i < 10; i++) {
      const resourceId = `part7_single_${resourceCounter++}`;
      const questionCount = 2 + (i % 3); // 2-4 questions per passage
      for (let j = 0; j < questionCount; j++) {
          questions.push({
              id: questionId++,
              part: 7,
              resourceId,
              passages: [{
                  title: `Announcement ${i + 1}`,
                  content: [`Content of announcement ${i + 1}`]
              }],
              answers: generateAnswers(7),
          });
      }
  }

  // Double passages (3 pairs, 5 questions each)
  for (let i = 0; i < 3; i++) {
      const resourceId = `part7_double_${resourceCounter++}`;
      for (let j = 0; j < 5; j++) {
          questions.push({
              id: questionId++,
              part: 7,
              resourceId,
              passages: [
                  { title: `Email ${i + 1}`, content: [`Email content ${i + 1}`] },
                  { title: `Memo ${i + 1}`, content: [`Memo content ${i + 1}`] }
              ],
              answers: generateAnswers(7),
          });
      }
  }

  return questions;
};

const generateAnswers = (part) => {
  const answers = [];
  const answerCount = part === 2 ? 3 : 4; // Part 2 chỉ có 3 lựa chọn
  for (let i = 0; i < answerCount; i++) {
      answers.push({
          id: String.fromCharCode(65 + i), // A, B, C, D
          text: `Answer ${String.fromCharCode(65 + i)}`,
          isCorrect: i === 0 // Mặc định đáp án đầu tiên là đúng
      });
  }
  return answers;
};

export const mockTests = {
  test1: {
      id: "full_test",
      title: "Full TOEIC Practice Test",
      duration: 120,
      questions: generateMockQuestions()
  }
};