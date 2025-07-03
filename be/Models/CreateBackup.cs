using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace be.Models
{
    public class CreateBackup
    {
       public string mail { get; set; }
       
        public string backupPath { get; set; }
        public string note{ get; set; }
    }
}