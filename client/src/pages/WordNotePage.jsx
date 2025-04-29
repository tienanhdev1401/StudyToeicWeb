import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import WordNoteService from '../services/wordNoteService';
import { FaPlus, FaEdit, FaTrash, FaBook, FaSearch } from 'react-icons/fa';
import '../styles/WordNotePage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const WordNotePage = () => {
    const { user } = useAuth();
    const [wordNotes, setWordNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');

    useEffect(() => {
        if (user && user.id) {
            fetchWordNotes();
        }
    }, [user]);

    const fetchWordNotes = async () => {
        if (!user || !user.id) {
            console.log('Không có user.id');
            return;
        }
        
        try {
            setLoading(true);
            const response = await WordNoteService.getWordNotesByLearnerId(user.id);
            if (response && response.data) {
                setWordNotes(response.data);
            } else {
                setWordNotes([]);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách ghi chú:', error);
            setWordNotes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = async () => {
        if (!user || !user.id) {
            console.log('Không có user.id');
            return;
        }

        try {
            const response = await WordNoteService.createWordNote({
                title: newNoteTitle,
                LearnerId: user.id
            });
            
            if (response && response.data) {
                setWordNotes(prevNotes => [...prevNotes, response.data]);
            }
            
            setNewNoteTitle('');
            setShowCreateModal(false);
            await fetchWordNotes();
        } catch (error) {
            console.error('Lỗi khi tạo ghi chú:', error);
        }
    };

    const handleOpenEditModal = (note) => {
        setEditingNote(note);
        setEditedTitle(note.title);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingNote(null);
        setEditedTitle('');
    };

    const handleUpdateTitle = async () => {
        if (!editingNote || !editedTitle.trim()) return;
        try {
            console.log(`Đang cập nhật note ${editingNote.id} với tiêu đề: ${editedTitle}`);
            setWordNotes(prevNotes => 
                prevNotes.map(note => 
                    note.id === editingNote.id ? { ...note, title: editedTitle } : note
                )
            );
            handleCloseEditModal();
        } catch (error) {
            console.error('Lỗi khi cập nhật tiêu đề ghi chú:', error);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
            try {
                await WordNoteService.deleteWordNote(noteId);
                setWordNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
            } catch (error) {
                console.error('Lỗi khi xóa ghi chú:', error);
            }
        }
    };

    const filteredNotes = wordNotes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <>
                <Header />
                <div className="wordnote-page-loading">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
        <Header/>
        <div className="wordnote-page-container">
            <div className="wordnote-page-header">
                <div className="wordnote-page-header-content">
                    <h1><FaBook className="wordnote-page-header-icon" /> Sổ tay từ vựng của tôi</h1>
                    <button 
                        className="btn btn-primary wordnote-page-create-btn"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <FaPlus /> Tạo ghi chú mới
                    </button>
                </div>
                <div className="wordnote-page-search-bar">
                    <FaSearch className="wordnote-page-search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm ghi chú..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="wordnote-page-grid">
                {filteredNotes.length === 0 ? (
                    <div className="wordnote-page-empty">
                        <FaBook className="wordnote-page-empty-icon" />
                        <p>Chưa có ghi chú nào. Hãy tạo ghi chú đầu tiên của bạn!</p>
                    </div>
                ) : (
                    filteredNotes.map(note => (
                        <div key={note.id} className="wordnote-page-card">
                            <div className="wordnote-page-card-header">
                                <div 
                                    className="wordnote-page-title" 
                                    onClick={() => window.location.href = `/word-note/${note.id}`}
                                    title="Xem chi tiết ghi chú"
                                >
                                    {note.title}
                                </div>
                                <div className="wordnote-page-card-actions">
                                    <button
                                        className="wordnote-page-icon-button wordnote-page-edit-icon"
                                        onClick={() => handleOpenEditModal(note)}
                                        title="Chỉnh sửa tiêu đề"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="wordnote-page-icon-button wordnote-page-delete-icon"
                                        onClick={() => handleDeleteNote(note.id)}
                                        title="Xóa"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                            <div className="wordnote-page-card-body">
                                <p>Số từ vựng: {note.vocabularies?.length || 0}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showCreateModal && (
                <div className="wordnote-page-modal-overlay">
                    <div className="wordnote-page-modal-content">
                        <h2>Tạo ghi chú mới</h2>
                        <input
                            type="text"
                            placeholder="Nhập tiêu đề ghi chú..."
                            value={newNoteTitle}
                            onChange={(e) => setNewNoteTitle(e.target.value)}
                            className="form-control"
                        />
                        <div className="wordnote-page-modal-actions">
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={handleCreateNote}
                                disabled={!newNoteTitle.trim()}
                            >
                                Tạo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && editingNote && (
                <div className="wordnote-page-modal-overlay">
                    <div className="wordnote-page-modal-content">
                        <h2>Chỉnh sửa tiêu đề ghi chú</h2>
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="form-control"
                            placeholder="Nhập tiêu đề mới..."
                        />
                        <div className="wordnote-page-modal-actions">
                            <button 
                                className="btn btn-secondary"
                                onClick={handleCloseEditModal}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={handleUpdateTitle}
                                disabled={!editedTitle.trim()}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <Footer/>
        </>
    );
};

export default WordNotePage; 