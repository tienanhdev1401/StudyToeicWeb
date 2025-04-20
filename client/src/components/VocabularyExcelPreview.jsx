import React from 'react';

const VocabularyExcelPreview = ({ vocabularies }) => {
  if (!vocabularies || vocabularies.length === 0) {
    return null;
  }

  return (
    <div className="vocabulary-excel-preview">
      <h3>Từ vựng đã đọc từ file Excel ({vocabularies.length} từ)</h3>
      <div className="excel-preview-container">
        <table className="preview-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Từ vựng</th>
              <th>Nghĩa</th>
              <th>Từ đồng nghĩa</th>
              <th>Phiên âm</th>
            </tr>
          </thead>
          <tbody>
            {vocabularies.slice(0, 5).map((vocab, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{vocab.content}</td>
                <td>{vocab.meaning}</td>
                <td>{vocab.synonym ? (typeof vocab.synonym === 'string' ? vocab.synonym : JSON.stringify(vocab.synonym)) : ''}</td>
                <td>{vocab.transcribe}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {vocabularies.length > 5 && (
          <div className="preview-more">
            <p>...và {vocabularies.length - 5} từ vựng khác</p>
          </div>
        )}
      </div>
      <style jsx="true">{`
        .vocabulary-excel-preview {
          margin-top: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 10px;
          background-color: #f9f9f9;
        }
        
        .vocabulary-excel-preview h3 {
          margin-top: 0;
          font-size: 16px;
          color: #333;
        }
        
        .excel-preview-container {
          max-height: 250px;
          overflow-y: auto;
        }
        
        .preview-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .preview-table th, .preview-table td {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: left;
        }
        
        .preview-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .preview-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .preview-more {
          text-align: center;
          padding: 8px;
          color: #666;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default VocabularyExcelPreview; 