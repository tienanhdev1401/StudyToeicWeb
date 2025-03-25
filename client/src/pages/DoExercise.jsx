import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DoExercise = () => {
    const { partId } = useParams();
    console.log('Navigated to Part:', partId);

    return (
        <>
            <Header />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Hello World! Exercise Part {partId}</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <p>This is a sample page for TOEIC Exercise Part {partId}</p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default DoExercise;