import axios from 'axios';

const LEARNING_GOAL_URL = 'http://localhost:5000/api';

export const getLearningGoalByLearnerId = async (learnerId) => {
  try {
    const response = await axios.get(`${LEARNING_GOAL_URL}/learning-goal/learner/${learnerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createLearningGoal = async (learningGoalData) => {
  try {
    console.log(learningGoalData);
    const response = await axios.post(`${LEARNING_GOAL_URL}/learning-goal`, learningGoalData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateLearningGoal = async (id, learningGoalData) => {
  try {
    const response = await axios.put(`${LEARNING_GOAL_URL}/learning-goal/${id}`, learningGoalData);
    return response.data;
  } catch (error) {
    throw error;
  }
};