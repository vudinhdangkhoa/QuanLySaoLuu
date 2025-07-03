import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './updateBackup.css';

function UpdateBackup() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    backupPath: '',
    note: ''
  });
  const [backupInfo, setBackupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBackupById();
  }, [id]);

  const fetchBackupById = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5078/api/QLSaoLuu/GetById/${id}`);
      if (!response.ok) {
        throw new Error('Không thể tải thông tin backup');
      }
      const data = await response.json();
      setBackupInfo(data);
      setFormData({
        backupPath: data.backupPath,
        note: data.note || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.backupPath) {
      setError('Vui lòng điền đường dẫn sao lưu');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5078/api/QLSaoLuu/Update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backupPath: formData.backupPath,
          note: formData.note
        })
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật backup');
      }

      // Thành công, quay về trang chính
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="update-backup-container">
        <div className="loading">Đang tải thông tin...</div>
      </div>
    );
  }

  if (error && !backupInfo) {
    return (
      <div className="update-backup-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/')} className="back-btn">
          Quay Lại
        </button>
      </div>
    );
  }

  return (
    <div className="update-backup-container">
      <div className="form-container">
        <h1>Cập Nhật Sao Lưu</h1>
        
        {backupInfo && (
          <div className="backup-info">
            <h3>Thông Tin Backup</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>ID:</label>
                <span>{backupInfo.id}</span>
              </div>
              <div className="info-item">
                <label>Thời Gian Tạo:</label>
                <span>{formatDate(backupInfo.backupTime)}</span>
              </div>
              <div className="info-item">
                <label>Người Thực Hiện:</label>
                <span>{backupInfo.user.firstName} {backupInfo.user.lastName}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{backupInfo.user.email}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="backup-form">
          <div className="form-group">
            <label htmlFor="backupPath">Đường Dẫn Sao Lưu <span className="required">*</span></label>
            <input
              type="text"
              id="backupPath"
              name="backupPath"
              value={formData.backupPath}
              onChange={handleInputChange}
              required
              placeholder="Ví dụ: C:\Backups\backup_2025-07-03.bak"
            />
          </div>

          <div className="form-group">
            <label htmlFor="note">Ghi Chú</label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows="4"
              placeholder="Nhập ghi chú cho bản sao lưu..."
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={handleCancel}
              disabled={updating}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={updating}
            >
              {updating ? 'Đang cập nhật...' : 'Cập Nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateBackup;