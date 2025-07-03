using System;
using System.Collections.Generic;

namespace be.Models;

public partial class BackupHistory
{
    public int Id { get; set; }

    public DateTime BackupTime { get; set; }

    public int UserId { get; set; }

    public string BackupPath { get; set; } = null!;

    public string? Note { get; set; }

    public virtual User User { get; set; } = null!;
}
