import React from 'react';
import { useParams } from 'react-router-dom';
import { mockGrammars } from '../data/mockGrammars';
import '../styles/GrammarDetail.css'; 
import Header from '../components/Header';
import Footer from '../components/Footer';


const GrammarDetail = () => {
    const { topicSlug } = useParams();

    const topicKey = Object.keys(mockGrammars).find(
        key => key.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') === topicSlug
    );

    const topic = mockGrammars[topicKey];

    if (!topic) {
        return <div className="error-message">Topic not found</div>;
    }

    return (
        <>
        <Header></Header>
        <div className="grammar-detail-container">
            <div className="grammar-detail-content">
                <h1 className="grammar-title">{topic.title}</h1>
                <div className="grammar-text" dangerouslySetInnerHTML={{ __html: topic.content }} />
            </div>
        </div>
        <Footer></Footer>
        </>
        
    );
};
export default GrammarDetail;
