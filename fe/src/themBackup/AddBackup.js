import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddBackup.css';

function AddBackup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mailUser: '',
    backupPath: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.mailUser || !formData.backupPath) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5078/api/QLSaoLuu/Create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mail: formData.mailUser,
          backupPath: formData.backupPath,
          note: formData.note
        })
      });
      if(response.status === 404) {
        throw new Error('email người dùng không tồn tại');
      }
      if (!response.ok) {
        throw new Error('Không thể tạo bản sao lưu mới');
      }

      // Thành công, quay về trang chính
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="add-backup-container">
      <div className="form-container">
        <h1>Thêm Mới Sao Lưu</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="backup-form">
          <div className="form-group">
            <label htmlFor="mailUser">Email Người Tạo <span className="required">*</span></label>
            <input
              type="email"
              id="mailUser"
              name="mailUser"
              value={formData.mailUser}
              onChange={handleInputChange}
              required
              placeholder="Nhập email người tạo sao lưu"
            />
          </div>

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
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Tạo Sao Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBackup;