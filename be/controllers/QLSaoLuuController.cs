using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using be.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using ClosedXML.Excel;

namespace be.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QLSaoLuuController : ControllerBase
    {


        MyDbContext db;
        public QLSaoLuuController(MyDbContext context)
        {
            db = context;
        }


        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {

            try
            {
                var backups = await db.BackupHistories.Select(b => new
                {
                    b.Id,
                    b.BackupTime,
                    b.UserId,
                    b.BackupPath,
                    b.Note,
                    user = db.Users.Where(u => u.Id == b.UserId).Select(u => new
                    {
                        u.Id,
                        u.FirstName,
                        u.LastName,
                        u.Email
                    }).FirstOrDefault()

                }).ToListAsync();
                return Ok(backups);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }


        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateBackup createBackup)
        {
            if (createBackup == null)
            {
                return BadRequest("không được để trống.");
            }
            if (createBackup.backupPath == null || createBackup.backupPath.Trim() == "")
            {
                return BadRequest("không được để trống.");
            }
            if (createBackup.backupPath.Length > 255)
            {
                return BadRequest("đường dẫn quá dài.");
            }
            if (createBackup.note != null && createBackup.note.Length > 500)
            {
                return BadRequest("ghi chú quá dài.");
            }
            if (createBackup.note != null && createBackup.note.Trim() == "")
            {
                return BadRequest("không được để trống.");
            }
            if (createBackup.mail == null || createBackup.mail.Trim() == "")
            {
                return BadRequest("Email không được để trống.");
            }
            try
            {
                var user = await db.Users.FirstOrDefaultAsync(u => u.Email == createBackup.mail);
                if (user == null)
                {
                    return NotFound("User not found with the provided email.");
                }
                var newBackup = new BackupHistory
                {
                    UserId = user.Id,
                    BackupPath = createBackup.backupPath,
                    Note = createBackup.note,

                };

                db.BackupHistories.Add(newBackup);

                await db.SaveChangesAsync();

                return Ok(new
                {
                    message = "Backup created successfully",

                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }


        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var backup = await db.BackupHistories.FindAsync(id);
                if (backup == null)
                {
                    return NotFound("Backup not found.");
                }

                db.BackupHistories.Remove(backup);
                await db.SaveChangesAsync();

                return Ok(new { message = "Backup deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Updatebackup updateBackup)
        {
            if (updateBackup == null)
            {
                return BadRequest("Invalid backup data.");
            }
            if (updateBackup.backupPath == null || updateBackup.backupPath.Trim() == "")
            {
                return BadRequest("không được để trống.");
            }
            if (updateBackup.backupPath.Length > 255)
            {
                return BadRequest("đường dẫn quá dài.");
            }
            if (updateBackup.note != null && updateBackup.note.Length > 500)
            {
                return BadRequest("ghi chú quá dài.");
            }
            if (updateBackup.note != null && updateBackup.note.Trim() == "")
            {
                return BadRequest("không được để trống.");
            }
            try
            {
                var backup = await db.BackupHistories.FindAsync(id);
                if (backup == null)
                {
                    return NotFound("Backup not found.");
                }

                backup.BackupPath = updateBackup.backupPath;
                backup.Note = updateBackup.note;
                db.Entry(backup).State = EntityState.Modified;
                await db.SaveChangesAsync();

                return Ok(new { message = "Backup updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }


        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var backup = await db.BackupHistories.Select(b => new
                {
                    b.Id,
                    b.BackupTime,
                    b.UserId,
                    b.BackupPath,
                    b.Note,
                    user = db.Users.Where(u => u.Id == b.UserId).Select(u => new
                    {
                        u.Id,
                        u.FirstName,
                        u.LastName,
                        u.Email
                    }).FirstOrDefault()
                }).FirstOrDefaultAsync(b => b.Id == id);

                if (backup == null)
                {
                    return NotFound("Backup not found.");
                }

                return Ok(backup);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }


        [HttpGet("XuatFile")]
        public async Task<IActionResult> XuatFile()
        {
            try
            {
                var backups = await db.BackupHistories.Select(b => new
                {
                    b.Id,
                    b.BackupTime,
                    b.UserId,
                    b.BackupPath,
                    b.Note,
                    user = db.Users.Where(u => u.Id == b.UserId).Select(u => new
                    {
                        u.Id,
                        u.FirstName,
                        u.LastName,
                        u.Email
                    }).FirstOrDefault()

                }).ToListAsync();

               
                var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Backups History");
                worksheet.Cell(1, 1).Value = "Id";
                worksheet.Cell(1, 2).Value = "Backup Time";
                worksheet.Cell(1, 3).Value = "User Id";
                worksheet.Cell(1, 4).Value = "User Name";
                worksheet.Cell(1, 5).Value = "Backup Path";
                worksheet.Cell(1, 6).Value = "Note";

                int row = 2;
                foreach (var backup in backups)
                {
                    worksheet.Cell(row, 1).Value = backup.Id;
                    worksheet.Cell(row, 2).Value = backup.BackupTime;
                    worksheet.Cell(row, 3).Value = backup.UserId;
                    worksheet.Cell(row, 4).Value = $"{backup.user.FirstName} {backup.user.LastName}";
                    worksheet.Cell(row, 5).Value = backup.BackupPath;
                    worksheet.Cell(row, 6).Value = backup.Note;
                    row++;
                }
                var stream = new MemoryStream();
                workbook.SaveAs(stream);

                stream.Position = 0;

                string fileName= "backup_history"+DateTime.Now.ToString("yyyyMMdd_HHmmss") + ".xlsx";

              

                return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);

            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }


        [HttpGet("xuatFileCSV")]
        public async Task<IActionResult> XuatFileCSV()
        {
            try
            {
                var backups = await db.BackupHistories.Select(b => new
                {
                    b.Id,
                    b.BackupTime,
                    b.UserId,
                    b.BackupPath,
                    b.Note,
                    user = db.Users.Where(u => u.Id == b.UserId).Select(u => new
                    {
                        u.Id,
                        u.FirstName,
                        u.LastName,
                        u.Email
                    }).FirstOrDefault()

                }).ToListAsync();

                var csvContent = "Id,Backup Time,User Id,User Name,Backup Path,Note\n";
                foreach (var backup in backups)
                {
                    csvContent += $"{backup.Id},{backup.BackupTime},{backup.UserId},{backup.user.FirstName} {backup.user.LastName},{backup.BackupPath},{backup.Note}\n";
                }

                var stream = new MemoryStream();
                var writer = new StreamWriter(stream);
                writer.Write(csvContent);
                writer.Flush();
                stream.Position = 0;
                string fileName= "backup_history"+DateTime.Now.ToString("yyyyMMdd_HHmmss") + ".csv";
                return File(stream, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}