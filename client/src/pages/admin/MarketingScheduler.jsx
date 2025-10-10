import React, { useEffect, useMemo, useState } from 'react';
import { marketingService } from '../../services/admin/admin.marketingService';
import { Editor } from '@tinymce/tinymce-react';
import '../../styles/ManageQuestion.css';

const MarketingScheduler = () => {
  const [ads, setAds] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({
    title: '',
    htmlContent: '',
    imageUrl: '',
    targetUrl: '',
    advertisementId: '',
    startDate: '',
    endDate: ''
  });
  const [mode, setMode] = useState('select'); // 'select' | 'create'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editForm, setEditForm] = useState({
    advertisementId: '',
    startDate: '',
    endDate: ''
  });
  
  // Advertisement management states
  const [isAdEditOpen, setIsAdEditOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [adEditForm, setAdEditForm] = useState({
    title: '',
    htmlContent: ''
  });
  const [showAdManagement, setShowAdManagement] = useState(false);
  
  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');

  const selectedAd = useMemo(() => {
    if (!form.advertisementId) return null;
    return ads.find(a => String(a.id) === String(form.advertisementId)) || null;
  }, [ads, form.advertisementId]);

  const previewData = useMemo(() => {
    if (mode === 'select' && selectedAd) {
      return {
        title: selectedAd.title,
        htmlContent: selectedAd.htmlContent,
        imageUrl: selectedAd.imageUrl,
        targetUrl: selectedAd.targetUrl
      };
    }
    return {
      title: form.title,
      htmlContent: form.htmlContent,
      imageUrl: form.imageUrl,
      targetUrl: form.targetUrl
    };
  }, [mode, selectedAd, form.title, form.htmlContent, form.imageUrl, form.targetUrl]);

  // Filtered and sorted campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(campaign => {
        const ad = ads.find(a => a.id === campaign.advertisementId);
        return (
          campaign.id.toString().includes(searchTerm.toLowerCase()) ||
          (ad && ad.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          campaign.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'title':
          const adA = ads.find(ad => ad.id === a.advertisementId);
          const adB = ads.find(ad => ad.id === b.advertisementId);
          aValue = adA ? adA.title : '';
          bValue = adB ? adB.title : '';
          break;
        case 'startDate':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case 'endDate':
          aValue = new Date(a.endDate);
          bValue = new Date(b.endDate);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [campaigns, ads, searchTerm, statusFilter, sortField, sortDirection]);

  // Paginated campaigns
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCampaigns.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCampaigns, currentPage, itemsPerPage]);

  // Total pages
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
      case 'running':
        return { bg: '#d1fae5', text: '#065f46', border: '#10b981' };
      case 'paused':
        return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
      case 'completed':
        return { bg: '#e0e7ff', text: '#3730a3', border: '#6366f1' };
      case 'cancelled':
        return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' };
    }
  };

  // Status text mapping
  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'running':
        return 'Running';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [adsRes, campRes] = await Promise.all([
        marketingService.listAdvertisements(),
        marketingService.listCampaigns()
      ]);
      setAds(adsRes.data || []);
      setCampaigns(campRes.data || []);
    } catch (e) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreateAdIfNeeded = async () => {
    if (mode === 'create') {
      const { title, htmlContent, imageUrl, targetUrl } = form;
      const res = await marketingService.createAdvertisement({ title, htmlContent, imageUrl, targetUrl });
      if (!res.success) throw new Error(res.message || 'Failed to create advertisement');
      return res.data.id;
    }
    return Number(form.advertisementId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Basic date validation: end after start
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate).getTime();
      const end = new Date(form.endDate).getTime();
      if (isFinite(start) && isFinite(end) && end <= start) {
        setError('End time must be after start time.');
        return;
      }
    }
    setLoading(true);
    try {
      const adId = await handleCreateAdIfNeeded();
      const res = await marketingService.createCampaign({
        advertisementId: adId,
        startDate: form.startDate,
        endDate: form.endDate
      });
      if (!res.success) throw new Error(res.message || 'Failed to create campaign');
      await fetchAll();
      setForm({ title: '', htmlContent: '', imageUrl: '', targetUrl: '', advertisementId: '', startDate: '', endDate: '' });
      setMode('select');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    setLoading(true);
    try {
      await marketingService.cancelCampaign(id);
      await fetchAll();
    } catch (e) {
      setError('Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setEditForm({
      advertisementId: campaign.advertisementId.toString(),
      startDate: new Date(campaign.startDate).toISOString().slice(0, 16),
      endDate: new Date(campaign.endDate).toISOString().slice(0, 16)
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await marketingService.updateCampaign(editingCampaign.id, editForm);
      await fetchAll();
      setIsEditOpen(false);
      setEditingCampaign(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update campaign');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id) => {
    setLoading(true);
    try {
      await marketingService.pauseCampaign(id);
      await fetchAll();
    } catch (e) {
      setError('Failed to pause campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async (id) => {
    setLoading(true);
    try {
      await marketingService.resumeCampaign(id);
      await fetchAll();
    } catch (e) {
      setError('Failed to resume campaign');
    } finally {
      setLoading(false);
    }
  };

  // Advertisement management handlers
  const handleEditAd = (ad) => {
    setEditingAd(ad);
    setAdEditForm({
      title: ad.title,
      htmlContent: ad.htmlContent
    });
    setIsAdEditOpen(true);
  };

  const handleAdEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await marketingService.updateAdvertisement(editingAd.id, adEditForm);
      await fetchAll();
      setIsAdEditOpen(false);
      setEditingAd(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update advertisement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advertisement?')) return;
    setLoading(true);
    try {
      await marketingService.deleteAdvertisement(id);
      await fetchAll();
    } catch (e) {
      setError('Failed to delete advertisement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="question-container">
      <div className="question-topic-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="question-header-title" style={{ margin: 0 }}>Marketing Scheduler</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button 
            onClick={() => setShowAdManagement(!showAdManagement)}
            style={{ 
              background: showAdManagement ? '#111827' : '#fff', 
              color: showAdManagement ? '#fff' : '#111827', 
              border: '1px solid #d1d5db', 
              padding: '8px 12px', 
              borderRadius: 6, 
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500
            }}
          >
            {showAdManagement ? 'Hide' : 'Manage'} Advertisements
          </button>
          {loading && <span style={{ fontSize: 12, color: '#666' }}>Loading...</span>}
        </div>
      </div>
      {error && (
        <div style={{ color: '#b42318', background: '#fee4e2', border: '1px solid #fecdca', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Advertisement Management Section */}
      {showAdManagement && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginBottom: 16 }}>
          <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
            <strong>Advertisement Management</strong>
            <div style={{ marginTop: 8, color: '#6b7280', fontSize: 12 }}>Manage your email advertisements - edit content and delete unused ads.</div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="question-table">
              <thead>
                <tr>
                  <th className="question-id-column" style={{ cursor: 'pointer', userSelect: 'none' }}>
                    ID
                  </th>
                  <th className="question-content-column" style={{ cursor: 'pointer', userSelect: 'none' }}>
                    Title
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }}>
                    Content Preview
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }}>
                    Created
                  </th>
                  <th className="question-actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: 16, color: '#6b7280', textAlign: 'center' }}>
                      No advertisements found.
                    </td>
                  </tr>
                )}
                {ads.map(ad => (
                  <tr key={ad.id}>
                    <td className="question-id-column">{ad.id}</td>
                    <td className="question-content-column">
                      <div style={{ fontWeight: 600, color: '#111827' }}>{ad.title}</div>
                    </td>
                    <td>
                      <div 
                        style={{ 
                          maxWidth: 300, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          color: '#6b7280',
                          fontSize: 12
                        }}
                        title={ad.htmlContent.replace(/<[^>]*>/g, '')}
                      >
                        {ad.htmlContent.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {ad.createdAt ? new Date(ad.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="question-actions-column">
                      <div className="question-actions-wrapper" style={{ justifyContent: 'flex-end', gap: 8 }}>
                        <button 
                          className="question-delete-btn" 
                          title="Edit" 
                          onClick={() => handleEditAd(ad)}
                          style={{ background: '#3b82f6', color: '#fff' }}
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        <button 
                          className="question-delete-btn" 
                          title="Delete" 
                          onClick={() => handleDeleteAd(ad.id)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
            <strong>Campaign Setup</strong>
            <div style={{ marginTop: 8, color: '#6b7280', fontSize: 12 }}>Select existing advertisement or create new one, then schedule.</div>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, padding: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="radio" checked={mode==='select'} onChange={() => setMode('select')} />
                <span>Select existing email campaign</span>
          </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="radio" checked={mode==='create'} onChange={() => setMode('create')} />
                <span>Create new email campaign</span>
          </label>
        </div>

        {mode === 'select' ? (
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ fontSize: 12, color: '#374151' }}>Campaign</label>
                <select value={form.advertisementId} onChange={e => setForm({ ...form, advertisementId: e.target.value })} required style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
                  <option value="">-- Select advertisement --</option>
            {ads.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
                {selectedAd && (
                  <div style={{ background: '#f9fafb', border: '1px dashed #e5e7eb', borderRadius: 8, padding: 12, color: '#374151' }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Subject: {selectedAd.title}</div>
                    {!!selectedAd.imageUrl && <img alt="preview" src={selectedAd.imageUrl} style={{ maxWidth: 240, borderRadius: 8, border: '1px solid #e5e7eb' }} />}
                    {!!selectedAd.targetUrl && (
                      <div style={{ marginTop: 8 }}>
                        <a href={selectedAd.targetUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>Target Link</a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <label style={{ fontSize: 12, color: '#374151' }}>Email Subject</label>
                  <input placeholder="Enter email subject..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Subject will be displayed on email sent to customers.</span>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <label style={{ fontSize: 12, color: '#374151' }}>Email Content (HTML)</label>
                  <Editor
                    apiKey="1w6cv14vn9vxpte2rrukp3g2j77lllo2ths7s5j3qad698cx"
                    value={form.htmlContent}
                    onEditorChange={value => setForm(prev => ({ ...prev, htmlContent: value }))}
                    init={{
                      height: 220,
                      menubar: false,
                      plugins: 'lists link',
                      toolbar: 'undo redo | bold italic underline | forecolor | bullist numlist | link | removeformat',
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Compose email content, you can add colors, lists, links.</span>
                </div>
                {/* Removed plain text mode for simplicity per request */}
                {false ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <label style={{ fontSize: 12, color: '#374151' }}>Nội dung email (Văn bản thuần)</label>
                    <textarea rows={8} style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Hệ thống sẽ tự chuyển văn bản này thành HTML chuẩn khi gửi.</span>
                  </div>
                ) : null}
                {/* Hidden fields for backward compatibility - not shown in UI */}
                <input type="hidden" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
                <input type="hidden" value={form.targetUrl} onChange={e => setForm({ ...form, targetUrl: e.target.value })} />
              </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <label style={{ fontSize: 12, color: '#374151' }}>Start Time</label>
                  <input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <label style={{ fontSize: 12, color: '#374151' }}>End Time</label>
                  <input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setIsPreviewOpen(true)} style={{ background: '#fff', color: '#111827', border: '1px solid #d1d5db', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>
                  Preview
                </button>
                <button type="submit" disabled={loading} style={{ background: '#111827', color: '#fff', border: '1px solid #111827', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Setting up...' : 'Setup'}
                </button>
              </div>
          </div>
          </form>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong>Schedule</strong>
            <span style={{ color: '#6b7280', fontSize: 12 }}>{filteredCampaigns.length} / {campaigns.length} items</span>
          </div>
          
          {/* Search and Filter Controls */}
          <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>Search:</label>
              <input
                type="text"
                placeholder="ID, title, status..."
                value={searchTerm}
                onChange={handleSearch}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, minWidth: 200 }}
              />
          </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>Status:</label>
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
              >
                <option value="all">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="running">Running</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
          </div>
        </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="question-table">
        <thead>
          <tr>
                  <th 
                    className="question-id-column" 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('id')}
                  >
                    ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="question-content-column"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('title')}
                  >
                    Advertisement {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('startDate')}
                  >
                    Start {sortField === 'startDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('endDate')}
                  >
                    End {sortField === 'endDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('status')}
                  >
                    Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="question-actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
                {paginatedCampaigns.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: 16, color: '#6b7280', textAlign: 'center' }}>
                      {searchTerm || statusFilter !== 'all' ? 'No matching results found.' : 'No schedules yet.'}
                    </td>
                  </tr>
                )}
                {paginatedCampaigns.map(c => {
                  const ad = ads.find(a => a.id === c.advertisementId);
                  const statusColor = getStatusColor(c.status);
                  return (
            <tr key={c.id}>
                      <td className="question-id-column">
                        <div className="question-id-cell">
                          <span className="question-id-number">{c.id}</span>
                        </div>
                      </td>
                      <td className="question-content-column">
                        <div style={{ fontWeight: 500 }}>{ad ? ad.title : `Ad #${c.advertisementId}`}</div>
                        {ad && (
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                            ID: {c.advertisementId}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>{new Date(c.startDate).toLocaleDateString()}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{new Date(c.startDate).toLocaleTimeString()}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>{new Date(c.endDate).toLocaleDateString()}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{new Date(c.endDate).toLocaleTimeString()}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 500,
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.border}`,
                            textTransform: 'capitalize'
                          }}
                        >
                          {getStatusText(c.status)}
                        </span>
                      </td>
                      <td className="question-actions-column">
                        <div className="question-actions-wrapper" style={{ justifyContent: 'flex-end', gap: 8 }}>
                {c.status === 'scheduled' && (
                            <>
                              <button 
                                className="question-delete-btn" 
                                title="Edit" 
                                onClick={() => handleEdit(c)}
                                style={{ background: '#3b82f6', color: '#fff' }}
                              >
                                <i className="fa-solid fa-edit"></i>
                              </button>
                              <button 
                                className="question-delete-btn" 
                                title="Cancel" 
                                onClick={() => handleCancel(c.id)}
                              >
                                <i className="fa-solid fa-ban"></i>
                              </button>
                            </>
                          )}
                          {c.status === 'running' && (
                            <button 
                              className="question-delete-btn" 
                              title="Pause" 
                              onClick={() => handlePause(c.id)}
                              style={{ background: '#f59e0b', color: '#fff' }}
                            >
                              <i className="fa-solid fa-pause"></i>
                            </button>
                          )}
                          {c.status === 'paused' && (
                            <button 
                              className="question-delete-btn" 
                              title="Resume" 
                              onClick={() => handleResume(c.id)}
                              style={{ background: '#10b981', color: '#fff' }}
                            >
                              <i className="fa-solid fa-play"></i>
                            </button>
                          )}
                        </div>
              </td>
            </tr>
                  );
                })}
        </tbody>
      </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: 16, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} items
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 4,
                    border: '1px solid #d1d5db',
                    background: currentPage === 1 ? '#f9fafb' : '#fff',
                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: 12
                  }}
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 4,
                    border: '1px solid #d1d5db',
                    background: currentPage === 1 ? '#f9fafb' : '#fff',
                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: 12
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: 12, color: '#374151', padding: '0 8px' }}>
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 4,
                    border: '1px solid #d1d5db',
                    background: currentPage === totalPages ? '#f9fafb' : '#fff',
                    color: currentPage === totalPages ? '#9ca3af' : '#374151',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: 12
                  }}
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 4,
                    border: '1px solid #d1d5db',
                    background: currentPage === totalPages ? '#f9fafb' : '#fff',
                    color: currentPage === totalPages ? '#9ca3af' : '#374151',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: 12
                  }}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advertisement Edit Modal */}
      {isAdEditOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }} onClick={() => setIsAdEditOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(800px, 100%)', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottom: '1px solid #e5e7eb' }}>
              <strong>Edit Advertisement</strong>
              <button onClick={() => setIsAdEditOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={handleAdEditSubmit} style={{ padding: 16, display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ fontSize: 12, color: '#374151' }}>Title</label>
                <input 
                  placeholder="Enter advertisement title..." 
                  value={adEditForm.title} 
                  onChange={e => setAdEditForm({ ...adEditForm, title: e.target.value })} 
                  required 
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} 
                />
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ fontSize: 12, color: '#374151' }}>Content (HTML)</label>
                <Editor
                  apiKey="1w6cv14vn9vxpte2rrukp3g2j77lllo2ths7s5j3qad698cx"
                  value={adEditForm.htmlContent}
                  onEditorChange={value => setAdEditForm(prev => ({ ...prev, htmlContent: value }))}
                  init={{
                    height: 300,
                    menubar: false,
                    plugins: 'lists link',
                    toolbar: 'undo redo | bold italic underline | forecolor | bullist numlist | link | removeformat',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                  }}
                />
                <span style={{ fontSize: 12, color: '#6b7280' }}>Compose email content, you can add colors, lists, links.</span>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setIsAdEditOpen(false)} 
                  style={{ background: '#fff', color: '#111827', border: '1px solid #d1d5db', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ background: '#111827', color: '#fff', border: '1px solid #111827', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Updating...' : 'Update Advertisement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Edit Modal */}
      {isEditOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }} onClick={() => setIsEditOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(600px, 100%)', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottom: '1px solid #e5e7eb' }}>
              <strong>Edit Campaign</strong>
              <button onClick={() => setIsEditOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ padding: 16, display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ fontSize: 12, color: '#374151' }}>Advertisement</label>
                <select 
                  value={editForm.advertisementId} 
                  onChange={e => setEditForm({ ...editForm, advertisementId: e.target.value })} 
                  required 
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
                >
                  <option value="">-- Select advertisement --</option>
                  {ads.map(a => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: 8, flex: 1 }}>
                  <label style={{ fontSize: 12, color: '#374151' }}>Start Time</label>
                  <input 
                    type="datetime-local" 
                    value={editForm.startDate} 
                    onChange={e => setEditForm({ ...editForm, startDate: e.target.value })} 
                    required 
                    style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} 
                  />
                </div>
                <div style={{ display: 'grid', gap: 8, flex: 1 }}>
                  <label style={{ fontSize: 12, color: '#374151' }}>End Time</label>
                  <input 
                    type="datetime-local" 
                    value={editForm.endDate} 
                    onChange={e => setEditForm({ ...editForm, endDate: e.target.value })} 
                    required 
                    style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)} 
                  style={{ background: '#fff', color: '#111827', border: '1px solid #d1d5db', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ background: '#111827', color: '#fff', border: '1px solid #111827', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Updating...' : 'Update Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPreviewOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }} onClick={() => setIsPreviewOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(1000px, 95vw)', height: 'min(700px, 85vh)', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
              <div>
                <strong>Email Preview</strong>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  Subject: {previewData.title || '(No subject)'}
                </div>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>×</button>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  Preview as it will appear in customer's email client
                </div>
              </div>
              
              <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                <div style={{ 
                  width: '100%', 
                  background: '#ffffff', 
                  borderRadius: 8, 
                  border: '1px solid #e5e7eb',
                  minHeight: '100%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ padding: 20 }}>
                    <div 
                      style={{ 
                        lineHeight: '1.6',
                        fontSize: '14px',
                        color: '#374151',
                        width: '100%',
                        overflow: 'visible'
                      }}
                      dangerouslySetInnerHTML={{ __html: previewData.htmlContent || '<em style="color: #9ca3af;">(Empty content)</em>' }} 
                    />
                  </div>
                </div>
              </div>
              
              <div style={{ padding: 16, borderTop: '1px solid #e5e7eb', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setIsPreviewOpen(false)} 
                  style={{ 
                    background: '#111827', 
                    color: '#fff', 
                    border: '1px solid #111827', 
                    padding: '10px 16px', 
                    borderRadius: 8, 
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingScheduler;


