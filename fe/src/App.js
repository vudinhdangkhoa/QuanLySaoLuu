import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import AddBackup from './themBackup/AddBackup';
import UpdateBackup from './updateBackup/updateBackup';
import './App.css';

function BackupList() {
  const navigate = useNavigate();
  const [backups, setBackups] = useState([]);
  const [originalBackups, setOriginalBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5078/api/QLSaoLuu/GetAll');
      if (!response.ok) {
        throw new Error('Failed to fetch backups');
      }
      const data = await response.json();
      setBackups(data);
      setOriginalBackups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ExportExcel = async () => {
    try {
      setExporting(true);
      setError(null);

      const response = await fetch('http://localhost:5078/api/QLSaoLuu/XuatFile', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Không thể xuất file Excel');
      }


      const contentDisposition = response.headers.get('content-disposition');
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0'); 
      const dd = String(today.getDate()).padStart(2, '0');

      const fileName = `backup_history_${yyyy}${mm}${dd}.xlsx`;

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }


      const blob = await response.blob();


      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;


      document.body.appendChild(link);
      link.click();


      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);


      alert('Xuất file Excel thành công!');

    } catch (err) {
      setError(err.message);
      alert('Lỗi khi xuất file: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const addNewBackup = () => {
    navigate('/add');
  };

  const editBackup = (id) => {
    navigate(`/update/${id}`);
  };

  const LocTheoThoiGian = () => {
    const dateInput = document.getElementById('datetime-filter').value;
    if (dateInput) {
      const filteredBackups = originalBackups.filter(backup => {
        const backupDate = new Date(backup.backupTime);
        const inputDate = new Date(dateInput);


        return backupDate.getFullYear() === inputDate.getFullYear() &&
          backupDate.getMonth() === inputDate.getMonth() &&
          backupDate.getDate() === inputDate.getDate();
      });
      setBackups(filteredBackups);
      setError(null);
    } else {
      alert('Vui lòng chọn ngày để lọc');
    }
  };

  const XoaLoc = () => {
    setBackups(originalBackups);
    document.getElementById('datetime-filter').value = '';
    setError(null);
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error">Lỗi: {error}</div>
        <button onClick={() => setError(null)}>Đóng</button>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <h1>Quản Lý Sao Lưu</h1>

        <div className="backup-list">
          <h2>Danh Sách Sao Lưu ({backups.length} bản ghi)</h2>

          <div className="filter-section">
            <div className="filter-group">
              <label htmlFor="datetime-filter">Lọc theo thời gian:</label>
              <input
                type="date"
                id="datetime-filter"
                className="datetime-input"
              />
            </div>
            <div className="filter-buttons">
              <button className="filter-btn" onClick={LocTheoThoiGian}>Lọc</button>
              <button className="clear-filter-btn" onClick={XoaLoc}>Xóa bộ lọc</button>
            </div>
          </div>

          {backups.length === 0 ? (
            <div className="no-data">Không có dữ liệu sao lưu</div>
          ) : (
            <div className="table-container">
              <table className="backup-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Thời Gian Sao Lưu</th>
                    <th>Người Thực Hiện</th>
                    <th>Đường Dẫn</th>
                    <th>Ghi Chú</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup) => (
                    <tr key={backup.id}>
                      <td>{backup.id}</td>
                      <td>{formatDate(backup.backupTime)}</td>
                      <td>
                        <div className="user-info">
                          <strong>{backup.user.firstName} {backup.user.lastName}</strong>
                          <br />
                          <small>{backup.user.email}</small>
                        </div>
                      </td>
                      <td className="path-cell" title={backup.backupPath}>
                        {backup.backupPath}
                      </td>
                      <td>{backup.note}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => editBackup(backup.id)}
                            title="Chỉnh sửa"
                          >
                            Sửa
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => {
                              if (window.confirm('Bạn có chắc chắn muốn xóa bản sao lưu này?')) {
                                fetch(`http://localhost:5078/api/QLSaoLuu/Delete/${backup.id}`, {
                                  method: 'DELETE',
                                })
                                  .then(response => {
                                    if (!response.ok) {
                                      throw new Error('Failed to delete backup');
                                    }
                                    fetchBackups();
                                  })
                                  .catch(err => setError(err.message));
                              }
                            }}
                            title="Xóa"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="button-group">
          <button className="refresh-btn" onClick={fetchBackups}>
            Làm Mới
          </button>
          <button className="refresh-btn" onClick={addNewBackup}>
            Thêm Mới
          </button>
          <button
            className="export-btn"
            onClick={ExportExcel}
            disabled={exporting || backups.length === 0}
          >
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BackupList />} />
        <Route path="/add" element={<AddBackup />} />
        <Route path="/update/:id" element={<UpdateBackup />} />
      </Routes>
    </Router>
  );
}

export default App;