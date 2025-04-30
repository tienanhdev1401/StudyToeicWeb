import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getRoadmapConfig,
  updateLevelThresholds,
  updateLearningMethods,
  updatePhaseContent,
  updateResources,
  resetConfig
} from '../../services/adminRoadmapConfigService';
import { toast } from 'react-toastify';
import '../../styles/RoadmapConfigAdmin.css';

const RoadmapConfigAdmin = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('levels');
  const [activeLevel, setActiveLevel] = useState('Beginner');
  const [activePhase, setActivePhase] = useState('phase1');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();

  // Lấy thông tin người dùng từ localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    // Chỉ gọi fetchRoadmapConfig khi component mount hoặc khi user thay đổi
    fetchRoadmapConfig();
  }, [navigate]); // Chỉ phụ thuộc vào navigate, không phụ thuộc vào user

  const fetchRoadmapConfig = async () => {
    try {
      setLoading(true);
      const response = await getRoadmapConfig();
      
      if (response.success) {
        setConfig(response.data);
      } else {
        toast.error(response.message || "Không thể tải cấu hình roadmap");
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải cấu hình roadmap:", error);
      toast.error("Đã xảy ra lỗi khi tải cấu hình roadmap");
      setLoading(false);
    }
  };

  const handleLevelThresholdChange = (level, value) => {
    const updatedConfig = { ...config };
    updatedConfig.levelThresholds[level] = parseInt(value, 10);
    setConfig(updatedConfig);
  };

  const handleLearningMethodChange = (level, index, value) => {
    const updatedConfig = { ...config };
    updatedConfig.learningMethodTemplates[level][index] = value;
    setConfig(updatedConfig);
  };

  const handleAddLearningMethod = (level) => {
    const updatedConfig = { ...config };
    updatedConfig.learningMethodTemplates[level].push("**Phương pháp mới**: Thêm mô tả ở đây.");
    setConfig(updatedConfig);
  };

  const handleRemoveLearningMethod = (level, index) => {
    const updatedConfig = { ...config };
    updatedConfig.learningMethodTemplates[level].splice(index, 1);
    setConfig(updatedConfig);
  };

  const handlePhaseContentChange = (phase, level, section, index, value) => {
    const updatedConfig = { ...config };
    if (!updatedConfig.phaseTemplates[phase][level][section]) {
      updatedConfig.phaseTemplates[phase][level][section] = [];
    }
    updatedConfig.phaseTemplates[phase][level][section][index] = value;
    setConfig(updatedConfig);
  };

  const handleAddPhaseContent = (phase, level, section) => {
    const updatedConfig = { ...config };
    if (!updatedConfig.phaseTemplates[phase][level][section]) {
      updatedConfig.phaseTemplates[phase][level][section] = [];
    }
    updatedConfig.phaseTemplates[phase][level][section].push("Nội dung mới");
    setConfig(updatedConfig);
  };

  const handleRemovePhaseContent = (phase, level, section, index) => {
    const updatedConfig = { ...config };
    if (updatedConfig.phaseTemplates[phase][level][section]) {
      updatedConfig.phaseTemplates[phase][level][section].splice(index, 1);
      setConfig(updatedConfig);
    }
  };

  const handleResourceChange = (level, section, index, value) => {
    const updatedConfig = { ...config };
    updatedConfig.resources[level][section][index] = value;
    setConfig(updatedConfig);
  };

  const handleAddResource = (level, section) => {
    const updatedConfig = { ...config };
    updatedConfig.resources[level][section].push("Tài nguyên mới");
    setConfig(updatedConfig);
  };

  const handleRemoveResource = (level, section, index) => {
    const updatedConfig = { ...config };
    updatedConfig.resources[level][section].splice(index, 1);
    setConfig(updatedConfig);
  };

  const saveLevelThresholds = async () => {
    try {
      setSaving(true);
      const response = await updateLevelThresholds(config.levelThresholds);
      
      if (response.success) {
        toast.success("Đã lưu ngưỡng cấp độ thành công");
      } else {
        toast.error(response.message || "Không thể lưu ngưỡng cấp độ");
      }
      
      setSaving(false);
    } catch (error) {
      console.error("Lỗi khi lưu ngưỡng cấp độ:", error);
      toast.error("Đã xảy ra lỗi khi lưu ngưỡng cấp độ");
      setSaving(false);
    }
  };

  const saveLearningMethods = async () => {
    try {
      setSaving(true);
      const response = await updateLearningMethods(activeLevel, config.learningMethodTemplates[activeLevel]);
      
      if (response.success) {
        toast.success(`Đã lưu phương pháp học cho cấp độ ${activeLevel} thành công`);
      } else {
        toast.error(response.message || "Không thể lưu phương pháp học");
      }
      
      setSaving(false);
    } catch (error) {
      console.error("Lỗi khi lưu phương pháp học:", error);
      toast.error("Đã xảy ra lỗi khi lưu phương pháp học");
      setSaving(false);
    }
  };

  const savePhaseContent = async () => {
    try {
      setSaving(true);
      // Đảm bảo dữ liệu tồn tại trước khi lưu
      if (!config.phaseTemplates[activePhase][activeLevel]) {
        toast.error("Không thể lưu vì dữ liệu không tồn tại");
        setSaving(false);
        return;
      }
      
      const response = await updatePhaseContent(
        activePhase, 
        activeLevel, 
        config.phaseTemplates[activePhase][activeLevel]
      );
      
      if (response.success) {
        toast.success(`Đã lưu nội dung giai đoạn ${activePhase} cho cấp độ ${activeLevel} thành công`);
      } else {
        toast.error(response.message || "Không thể lưu nội dung giai đoạn");
      }
      
      setSaving(false);
    } catch (error) {
      console.error("Lỗi khi lưu nội dung giai đoạn:", error);
      toast.error("Đã xảy ra lỗi khi lưu nội dung giai đoạn");
      setSaving(false);
    }
  };

  const saveResources = async () => {
    try {
      setSaving(true);
      const response = await updateResources(activeLevel, config.resources[activeLevel]);
      
      if (response.success) {
        toast.success(`Đã lưu tài nguyên học tập cho cấp độ ${activeLevel} thành công`);
      } else {
        toast.error(response.message || "Không thể lưu tài nguyên học tập");
      }
      
      setSaving(false);
    } catch (error) {
      console.error("Lỗi khi lưu tài nguyên học tập:", error);
      toast.error("Đã xảy ra lỗi khi lưu tài nguyên học tập");
      setSaving(false);
    }
  };

  const handleResetConfig = async () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục cấu hình mặc định? Tất cả các thay đổi sẽ bị mất.")) {
      try {
        setResetting(true);
        const response = await resetConfig();
        
        if (response.success) {
          setConfig(response.data);
          toast.success("Đã khôi phục cấu hình mặc định thành công");
        } else {
          toast.error(response.message || "Không thể khôi phục cấu hình mặc định");
        }
        
        setResetting(false);
      } catch (error) {
        console.error("Lỗi khi khôi phục cấu hình mặc định:", error);
        toast.error("Đã xảy ra lỗi khi khôi phục cấu hình mặc định");
        setResetting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="roadmap-admin-loading">
        <div className="roadmap-admin-spinner"></div>
        <p>Đang tải cấu hình roadmap...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="roadmap-admin-error">
        <h2>Không thể tải cấu hình roadmap</h2>
        <button className="roadmap-admin-btn" onClick={fetchRoadmapConfig}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="roadmap-admin-container">
      <div className="roadmap-admin-header">
        <h1>Quản Lý Cấu Hình Lộ Trình TOEIC</h1>
        <button 
          className="roadmap-admin-btn roadmap-admin-reset-btn"
          onClick={handleResetConfig}
          disabled={resetting}
        >
          {resetting ? 'Đang khôi phục...' : 'Khôi phục cấu hình mặc định'}
        </button>
      </div>

      <div className="roadmap-admin-tabs">
        <button 
          className={`roadmap-admin-tab ${activeSection === 'levels' ? 'active' : ''}`}
          onClick={() => setActiveSection('levels')}
        >
          Ngưỡng cấp độ
        </button>
        <button 
          className={`roadmap-admin-tab ${activeSection === 'methods' ? 'active' : ''}`}
          onClick={() => setActiveSection('methods')}
        >
          Phương pháp học
        </button>
        <button 
          className={`roadmap-admin-tab ${activeSection === 'phases' ? 'active' : ''}`}
          onClick={() => setActiveSection('phases')}
        >
          Nội dung giai đoạn
        </button>
        <button 
          className={`roadmap-admin-tab ${activeSection === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveSection('resources')}
        >
          Tài nguyên học tập
        </button>
      </div>

      <div className="roadmap-admin-content">
        {activeSection === 'levels' && (
          <div className="roadmap-admin-section">
            <h2>Ngưỡng điểm các cấp độ</h2>
            <div className="roadmap-admin-level-thresholds">
              {Object.entries(config.levelThresholds).map(([level, threshold], index) => (
                <div key={index} className="roadmap-admin-input-group">
                  <label className="roadmap-admin-label">{level}:</label>
                  <input
                    type="number"
                    className="roadmap-admin-input"
                    value={threshold}
                    onChange={(e) => handleLevelThresholdChange(level, e.target.value)}
                    min="0"
                    max="990"
                  />
                </div>
              ))}
            </div>
            <button 
              className="roadmap-admin-btn roadmap-admin-save-btn"
              onClick={saveLevelThresholds}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu ngưỡng cấp độ'}
            </button>
          </div>
        )}

        {activeSection === 'methods' && (
          <div className="roadmap-admin-section">
            <h2>Phương pháp học tập</h2>
            <div className="roadmap-admin-level-selector">
              {Object.keys(config.learningMethodTemplates).map((level) => (
                <button
                  key={level}
                  className={`roadmap-admin-level-btn ${activeLevel === level ? 'active' : ''}`}
                  onClick={() => setActiveLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="roadmap-admin-methods">
              {config.learningMethodTemplates[activeLevel].map((method, index) => (
                <div key={index} className="roadmap-admin-method-item">
                  <textarea
                    className="roadmap-admin-textarea"
                    value={method}
                    onChange={(e) => handleLearningMethodChange(activeLevel, index, e.target.value)}
                    rows="3"
                  />
                  <button 
                    className="roadmap-admin-btn roadmap-admin-remove-btn"
                    onClick={() => handleRemoveLearningMethod(activeLevel, index)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button 
                className="roadmap-admin-btn roadmap-admin-add-btn"
                onClick={() => handleAddLearningMethod(activeLevel)}
              >
                Thêm phương pháp
              </button>
            </div>
            <button 
              className="roadmap-admin-btn roadmap-admin-save-btn"
              onClick={saveLearningMethods}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu phương pháp học'}
            </button>
          </div>
        )}

        {activeSection === 'phases' && (
          <div className="roadmap-admin-section">
            <h2>Nội dung giai đoạn</h2>
            <div className="roadmap-admin-selectors">
              <div className="roadmap-admin-level-selector">
                {Object.keys(config.phaseTemplates.phase1).map((level) => (
                  <button
                    key={level}
                    className={`roadmap-admin-level-btn ${activeLevel === level ? 'active' : ''}`}
                    onClick={() => setActiveLevel(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="roadmap-admin-phase-selector">
                {Object.keys(config.phaseTemplates).map((phase) => (
                  <button
                    key={phase}
                    className={`roadmap-admin-phase-btn ${activePhase === phase ? 'active' : ''}`}
                    onClick={() => {
                      setActivePhase(phase);
                      // Tạo cấu trúc cho phase nếu chưa tồn tại
                      if (!config.phaseTemplates[phase][activeLevel]) {
                        const updatedConfig = { ...config };
                        updatedConfig.phaseTemplates[phase][activeLevel] = {
                          activities: [],
                          dailyRoutine: [],
                          resources: []
                        };
                        
                        // Thêm các thuộc tính đặc biệt cho phase4
                        if (phase === 'phase4') {
                          updatedConfig.phaseTemplates[phase][activeLevel].preTesting = [];
                          updatedConfig.phaseTemplates[phase][activeLevel].advices = [];
                        }
                        
                        setConfig(updatedConfig);
                      }
                    }}
                  >
                    {phase === 'phase1' ? 'Giai đoạn 1' : 
                     phase === 'phase2' ? 'Giai đoạn 2' : 
                     phase === 'phase3' ? 'Giai đoạn 3' : 'Giai đoạn 4'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="roadmap-admin-phase-content">
              {/* Kiểm tra xem dữ liệu có tồn tại không */}
              {!config.phaseTemplates[activePhase] || !config.phaseTemplates[activePhase][activeLevel] ? (
                <div className="roadmap-admin-loading">
                  <p>Không có dữ liệu cho cấp độ này. Vui lòng tạo trước khi chỉnh sửa.</p>
                  <button
                    className="roadmap-admin-btn"
                    onClick={() => {
                      const updatedConfig = { ...config };
                      if (!updatedConfig.phaseTemplates[activePhase]) {
                        updatedConfig.phaseTemplates[activePhase] = {};
                      }
                      updatedConfig.phaseTemplates[activePhase][activeLevel] = {
                        activities: ["Hoạt động mẫu"],
                        dailyRoutine: ["Hoạt động hàng ngày mẫu"],
                        resources: ["Tài nguyên mẫu"]
                      };
                      
                      if (activePhase === 'phase4') {
                        updatedConfig.phaseTemplates[activePhase][activeLevel].preTesting = ["Hướng dẫn trước thi mẫu"];
                        updatedConfig.phaseTemplates[activePhase][activeLevel].advices = ["Lời khuyên mẫu"];
                      }
                      
                      setConfig(updatedConfig);
                    }}
                  >
                    Tạo mẫu dữ liệu
                  </button>
                </div>
              ) : (
                <>
                  <div className="roadmap-admin-section-wrapper">
                    <h3>Hoạt động</h3>
                    {Array.isArray(config.phaseTemplates[activePhase][activeLevel].activities) &&
                     config.phaseTemplates[activePhase][activeLevel].activities.map((activity, index) => (
                      <div key={index} className="roadmap-admin-content-item">
                        <textarea
                          className="roadmap-admin-textarea"
                          value={activity}
                          onChange={(e) => handlePhaseContentChange(activePhase, activeLevel, 'activities', index, e.target.value)}
                          rows="2"
                        />
                        <button 
                          className="roadmap-admin-btn roadmap-admin-remove-btn"
                          onClick={() => handleRemovePhaseContent(activePhase, activeLevel, 'activities', index)}
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                    <button 
                      className="roadmap-admin-btn roadmap-admin-add-btn"
                      onClick={() => handleAddPhaseContent(activePhase, activeLevel, 'activities')}
                    >
                      Thêm hoạt động
                    </button>
                  </div>

                  <div className="roadmap-admin-section-wrapper">
                    <h3>Hoạt động hàng ngày</h3>
                    {Array.isArray(config.phaseTemplates[activePhase][activeLevel].dailyRoutine) &&
                     config.phaseTemplates[activePhase][activeLevel].dailyRoutine.map((routine, index) => (
                      <div key={index} className="roadmap-admin-content-item">
                        <textarea
                          className="roadmap-admin-textarea"
                          value={routine}
                          onChange={(e) => handlePhaseContentChange(activePhase, activeLevel, 'dailyRoutine', index, e.target.value)}
                          rows="2"
                        />
                        <button 
                          className="roadmap-admin-btn roadmap-admin-remove-btn"
                          onClick={() => handleRemovePhaseContent(activePhase, activeLevel, 'dailyRoutine', index)}
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                    <button 
                      className="roadmap-admin-btn roadmap-admin-add-btn"
                      onClick={() => handleAddPhaseContent(activePhase, activeLevel, 'dailyRoutine')}
                    >
                      Thêm hoạt động hàng ngày
                    </button>
                  </div>

                  <div className="roadmap-admin-section-wrapper">
                    <h3>Tài nguyên sử dụng</h3>
                    {Array.isArray(config.phaseTemplates[activePhase][activeLevel].resources) &&
                     config.phaseTemplates[activePhase][activeLevel].resources.map((resource, index) => (
                      <div key={index} className="roadmap-admin-content-item">
                        <textarea
                          className="roadmap-admin-textarea"
                          value={resource}
                          onChange={(e) => handlePhaseContentChange(activePhase, activeLevel, 'resources', index, e.target.value)}
                          rows="2"
                        />
                        <button 
                          className="roadmap-admin-btn roadmap-admin-remove-btn"
                          onClick={() => handleRemovePhaseContent(activePhase, activeLevel, 'resources', index)}
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                    <button 
                      className="roadmap-admin-btn roadmap-admin-add-btn"
                      onClick={() => handleAddPhaseContent(activePhase, activeLevel, 'resources')}
                    >
                      Thêm tài nguyên
                    </button>
                  </div>

                  {activePhase === 'phase4' && (
                    <>
                      <div className="roadmap-admin-section-wrapper">
                        <h3>Trước kỳ thi</h3>
                        {Array.isArray(config.phaseTemplates[activePhase][activeLevel].preTesting) &&
                         config.phaseTemplates[activePhase][activeLevel].preTesting.map((item, index) => (
                          <div key={index} className="roadmap-admin-content-item">
                            <textarea
                              className="roadmap-admin-textarea"
                              value={item}
                              onChange={(e) => handlePhaseContentChange(activePhase, activeLevel, 'preTesting', index, e.target.value)}
                              rows="2"
                            />
                            <button 
                              className="roadmap-admin-btn roadmap-admin-remove-btn"
                              onClick={() => handleRemovePhaseContent(activePhase, activeLevel, 'preTesting', index)}
                            >
                              Xóa
                            </button>
                          </div>
                        ))}
                        <button 
                          className="roadmap-admin-btn roadmap-admin-add-btn"
                          onClick={() => handleAddPhaseContent(activePhase, activeLevel, 'preTesting')}
                        >
                          Thêm hướng dẫn trước thi
                        </button>
                      </div>

                      <div className="roadmap-admin-section-wrapper">
                        <h3>Lời khuyên</h3>
                        {Array.isArray(config.phaseTemplates[activePhase][activeLevel].advices) &&
                         config.phaseTemplates[activePhase][activeLevel].advices.map((advice, index) => (
                          <div key={index} className="roadmap-admin-content-item">
                            <textarea
                              className="roadmap-admin-textarea"
                              value={advice}
                              onChange={(e) => handlePhaseContentChange(activePhase, activeLevel, 'advices', index, e.target.value)}
                              rows="2"
                            />
                            <button 
                              className="roadmap-admin-btn roadmap-admin-remove-btn"
                              onClick={() => handleRemovePhaseContent(activePhase, activeLevel, 'advices', index)}
                            >
                              Xóa
                            </button>
                          </div>
                        ))}
                        <button 
                          className="roadmap-admin-btn roadmap-admin-add-btn"
                          onClick={() => handleAddPhaseContent(activePhase, activeLevel, 'advices')}
                        >
                          Thêm lời khuyên
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            
            <button 
              className="roadmap-admin-btn roadmap-admin-save-btn"
              onClick={savePhaseContent}
              disabled={saving || !config.phaseTemplates[activePhase] || !config.phaseTemplates[activePhase][activeLevel]}
            >
              {saving ? 'Đang lưu...' : 'Lưu nội dung giai đoạn'}
            </button>
          </div>
        )}

        {activeSection === 'resources' && (
          <div className="roadmap-admin-section">
            <h2>Tài nguyên học tập</h2>
            <div className="roadmap-admin-level-selector">
              {Object.keys(config.resources).map((level) => (
                <button
                  key={level}
                  className={`roadmap-admin-level-btn ${activeLevel === level ? 'active' : ''}`}
                  onClick={() => setActiveLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
            
            <div className="roadmap-admin-resources">
              <div className="roadmap-admin-section-wrapper">
                <h3>Sách và tài liệu</h3>
                {config.resources[activeLevel].books.map((book, index) => (
                  <div key={index} className="roadmap-admin-content-item">
                    <input
                      type="text"
                      className="roadmap-admin-input"
                      value={book}
                      onChange={(e) => handleResourceChange(activeLevel, 'books', index, e.target.value)}
                    />
                    <button 
                      className="roadmap-admin-btn roadmap-admin-remove-btn"
                      onClick={() => handleRemoveResource(activeLevel, 'books', index)}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button 
                  className="roadmap-admin-btn roadmap-admin-add-btn"
                  onClick={() => handleAddResource(activeLevel, 'books')}
                >
                  Thêm sách/tài liệu
                </button>
              </div>

              <div className="roadmap-admin-section-wrapper">
                <h3>Ứng dụng và website</h3>
                {config.resources[activeLevel].apps.map((app, index) => (
                  <div key={index} className="roadmap-admin-content-item">
                    <input
                      type="text"
                      className="roadmap-admin-input"
                      value={app}
                      onChange={(e) => handleResourceChange(activeLevel, 'apps', index, e.target.value)}
                    />
                    <button 
                      className="roadmap-admin-btn roadmap-admin-remove-btn"
                      onClick={() => handleRemoveResource(activeLevel, 'apps', index)}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button 
                  className="roadmap-admin-btn roadmap-admin-add-btn"
                  onClick={() => handleAddResource(activeLevel, 'apps')}
                >
                  Thêm ứng dụng/website
                </button>
              </div>

              <div className="roadmap-admin-section-wrapper">
                <h3>Khóa học trực tuyến</h3>
                {config.resources[activeLevel].courses.map((course, index) => (
                  <div key={index} className="roadmap-admin-content-item">
                    <input
                      type="text"
                      className="roadmap-admin-input"
                      value={course}
                      onChange={(e) => handleResourceChange(activeLevel, 'courses', index, e.target.value)}
                    />
                    <button 
                      className="roadmap-admin-btn roadmap-admin-remove-btn"
                      onClick={() => handleRemoveResource(activeLevel, 'courses', index)}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button 
                  className="roadmap-admin-btn roadmap-admin-add-btn"
                  onClick={() => handleAddResource(activeLevel, 'courses')}
                >
                  Thêm khóa học
                </button>
              </div>
            </div>
            
            <button 
              className="roadmap-admin-btn roadmap-admin-save-btn"
              onClick={saveResources}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu tài nguyên học tập'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapConfigAdmin; 