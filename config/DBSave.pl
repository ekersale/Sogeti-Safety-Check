#!/usr/bin/perl -w

my $timeout = 43200;
my $SavePath = "/DBSave";
my $dbName = "sogeti-safety-check";

sub creatingSaveDir {
    unless(-e $SavePath or mkdir $SavePath) {
             return "false";
         }
    return "true";
}

sub creatingSave() {
    my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime(time);
    $year += 1900;
    $mon += 1;
    print $mon;
    my $DBPath = "db".$year.$mon.$mday.$hour.'.ssc';
    unless(-e $SavePath.'/'.$DBPath  or $SavePath.'/'.$DBPath) {
       return $SavePath.'/'.$DBPath;
    }
    return $SavePath.'/'.$DBPath;
}

sub saveDB {
    creatingSaveDir();
    my $DBPath = creatingSave();
    system('/usr/bin/mongodump --out '.$DBPath.' --db '.$dbName);
    return;
}

sub restoreDB {
    my $DBimport = shift;
    system('/usr/bin/mongorestore -d '.$dbName.' '.$SavePath.'/'.$DBimport.'/'.$dbName);
}

sub listSave() {
     opendir(DIR, $SavePath) or die $!;
     while (my $file = readdir(DIR)) {
        next if ($file =~ m/^\./);
    	print "$file\n";
      }
      closedir(DIR);
      return;
}

sub main {
    my ($option, $import) = @ARGV;
    if (not defined $option) {
        die "Missing option. Usage : ./DBSave.pl [export|restore|list]\n";
    }
    if (defined $option) {
        if ($option eq "export") {
            while (1) {
                saveDB();
                sleep($timeout)
            }
        }
        elsif ($option eq "restore") {
            if (not defined $import) {
                die "Missing option. Usage : ./DBSave.pl restore [ExportName]\n";
            }
            restoreDB($import);
        }
        elsif ($option eq "list") {
            listSave();
        }
        else {
            die "Unknown option. Usage : ./DBSave.pl [export|restore]"
        }
    }
}

main();
