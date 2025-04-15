export const mockLearningProcesses = [
    {
      userId: 1, // Matches mockUsers[0].id
      completedGrammarIds: [1, 3, 5] // Array of completed grammar IDs
    },
    {
      userId: 2, // Matches mockUsers[1].id (if exists)
      completedGrammarIds: [2, 4]
    }
  ];
  
  // Helper function to get completed grammar IDs by user ID
  export const getCompletedGrammarsByUserId = (userId) => {
    const process = mockLearningProcesses.find(p => p.userId === userId);
    return process ? process.completedGrammarIds : [];
  };
  
  // Helper function to check if grammar is completed by user
  export const isGrammarCompleted = (userId, grammarId) => {
    const completedIds = getCompletedGrammarsByUserId(userId);
    return completedIds.includes(grammarId);
  };
  
  // Helper function to add completed grammar for user
  export const addCompletedGrammar = (userId, grammarId) => {
    let process = mockLearningProcesses.find(p => p.userId === userId);
    
    if (!process) {
      process = { userId, completedGrammarIds: [] };
      mockLearningProcesses.push(process);
    }
  
    if (!process.completedGrammarIds.includes(grammarId)) {
      process.completedGrammarIds.push(grammarId);
    }
  
    return process.completedGrammarIds;
  };