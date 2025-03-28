import React from 'react';
import { FaBook } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/LearnGrammar.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { mockGrammars } from '../data/mockGrammars';

const LearnGrammar = () => {
    const navigate = useNavigate();
    // const grammarItems = [
    //     { id: 1, title: "NOUNS" },
    //     { id: 2, title: "ADJECTIVES" },
    //     { id: 3, title: "ADVERBS" },
    //     { id: 4, title: "NOUN, ADJECTIVE, ADVERB EXERCISES" },
    //     { id: 5, title: "PRONOUNS" },
    //     { id: 6, title: "PREPOSITIONS" },
    //     { id: 7, title: "CONJUNCTIONS" },
    //     { id: 8, title: "NUMERIC EXPRESSIONS BEFORE NOUNS" },
    //     { id: 9, title: "VERB TENSES" },
    //     { id: 10, title: "MODAL VERBS" },
    //     { id: 11, title: "CONDITIONAL SENTENCES" },
    //     { id: 12, title: "PASSIVE VOICE" },
    //     { id: 13, title: "REPORTED SPEECH" }
    // ];

    const grammarItems = Object.values(mockGrammars);

    const handleViewDetail = (topic) => {
        const topicSlug = topic.title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
        
        navigate(`/learn-grammar/${topicSlug}`);
    };


  return (
    <>
    <Header></Header>
    <div className="grammarcontainer">
      <div className="card">
        <div className="header">
          <h1 className="title">Grammar Topics</h1>
          <span className="counter">0/{grammarItems.length} topics</span>
        </div>
        
        <div className="test-list">
          {grammarItems.map(item => (
            <div key={item.id} className="test-item">
              <div className="item-content">
                <span className="item-number">{item.id.toString().padStart(2, '0')}</span>
                <FaBook className="item-icon" />
                <span className="item-title" onClick={() => handleViewDetail(item)} >{item.title}</span>
              </div>
              <span className="item-score">-</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer></Footer>
    </>
  );
};

export default LearnGrammar;