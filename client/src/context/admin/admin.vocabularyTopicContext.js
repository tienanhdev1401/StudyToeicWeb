import React, { createContext, useState, useContext, useEffect } from 'react';
import vocabularyTopicService from '../../services/admin/admin.vocabularyTopicService';

const VocabularyTopicContext = createContext();

export const VocabularyTopicProvider = ({ children }) => {
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    
    const fetchVocabularyTopic = async () => {
      try {
        setLoading(true);
        const topicData = await vocabularyTopicService.getAllVocabularyTopics();
        setTopic(topicData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching topic:', err);
      } finally {
        setLoading(false);
      }
    };
  
  
  
    return (
      <VocabularyTopicContext.Provider value={{ 
        topic, 
        loading, 
        error, 
        fetchVocabularyTopic
      }}>
        {children}
      </VocabularyTopicContext.Provider>
    );
  };
  
  export const useVocabularyTopic = () => {
    return useContext(VocabularyTopicContext);
  };