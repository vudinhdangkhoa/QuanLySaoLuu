create database QL_SaoLuuDuLieu
go
use QL_SaoLuuDuLieu
go 

-- Tạo bảng Users
CREATE TABLE Users (
    id INT PRIMARY KEY, -- Khóa chính
    first_name NVARCHAR(30), -- Tên
    last_name NVARCHAR(30),  -- Họ
    email VARCHAR(30) UNIQUE -- Email duy nhất
);

-- Tạo bảng Backup_History để quản lý lịch sử sao lưu
CREATE TABLE Backup_History (
    id INT IDENTITY PRIMARY KEY, -- ID tự tăng
    backup_time DATETIME NOT NULL DEFAULT GETDATE(), -- Thời gian sao lưu
    user_id INT NOT NULL, -- Liên kết tới Users
    backup_path NVARCHAR(255) NOT NULL, -- Đường dẫn sao lưu
    note NVARCHAR(255), -- Ghi chú thêm (nếu có)
    FOREIGN KEY (user_id) REFERENCES Users(id) -- Ràng buộc khóa ngoại
);

-- Thêm 1 dòng vào bảng Users
INSERT INTO Users (id, first_name, last_name, email)
VALUES (1, N'Khoa', N'Vũ', 'vudinhdangkhoa03@gmail.com');

-- Thêm 5 dòng vào bảng Backup_History
INSERT INTO Backup_History (user_id, backup_path, note)
VALUES
(1, N'C:\Backups\2025-07-01.bak', N'Sao lưu đầu tiên'),
(1, N'D:\Data\Backup_2025-07-02.bak', N'Sao lưu định kỳ'),
(1, N'C:\Backup\System_2025-07-03.bak', N'Sao lưu hệ thống'),
(1, N'E:\Backup\Critical_2025-07-04.bak', N'Sao lưu quan trọng'),
(1, N'D:\Cloud\AutoBackup_2025-07-05.bak', N'Tự động sao lưu hằng ngày');

select * from Users
select * from Backup_History