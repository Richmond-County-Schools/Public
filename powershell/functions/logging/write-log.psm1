Function Write-Log {
    param(
        [Parameter(Mandatory=$false)]
        [string]$Level = "INFO",  # Set default value to "INFO"
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [Parameter(Mandatory=$false)]
        [int]$maxLogSizeMB = 10
    )

    # Validate outside of the param block so it can still be logged if the level paramater is wrong
    if ($PSBoundParameters.ContainsKey('Level')) {
        # Validate against the specified values
        if ($Level -notin ("DEBUG", "INFO", "WARN", "ERROR")) {
            $errorMessage = "$Level is an invalid value for Level parameter. Valid values are DEBUG, INFO, WARN, ERROR."
            Write-Error  $errorMessage
            $Message = "$errorMessage - $Message"
            $Level = "WARN"
        }
    }

    # Compare the priority of logging level
    $LogPriority = @{
        "DEBUG" = 0
        "INFO"  = 1
        "WARN"  = 2
        "ERROR" = 3
    }

    if($LogPriority[$Level] -ge $LogPriority[$Global:logLevel]) {
        # Determine whether the script is running in user or system context
        $userName = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        if ($userName -eq "NT AUTHORITY\SYSTEM") {
            $Global:orgFolder = "$env:ProgramData\$orgName"
        }
        else {
            $Global:orgFolder = "$Home\AppData\Roaming\$orgName"
        }

        $logFolder = "$orgFolder\Logs"
        $logFile = "$logFolder\$scriptName.log"

        # Create organization folder and log if they don't exist
        try {
            if (!(Test-Path $orgFolder)) {
                New-Item $orgFolder -ItemType Directory -Force | Out-Null
            }
            if (!(Test-Path $logFolder)) {
                New-Item $logFolder -ItemType Directory -Force | Out-Null
            }
            if (!(Test-Path $logFile)) {
                New-Item $logFile -ItemType File -Force | Out-Null
            }
            else {
                # Check log file size and truncate if necessary
                $logFileInfo = Get-Item $logFile
                if ($logFileInfo.Length / 1MB -gt $maxLogSizeMB) {
                    $streamWriter = New-Object System.IO.StreamWriter($logFile, $false)
                    $streamWriter.Write("")
                    $streamWriter.Close()
                    Write-Log -Level "INFO" -Message "Log file truncated due to exceeding maximum size."
                }
            }
        }
        catch {
            Write-Error "Failed to create log directory or file: $_"
        }

        # Set log date stamp
        $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $LogEntry = "$Timestamp [$Level] $Message"
        $streamWriter = New-Object System.IO.StreamWriter($logFile, $true)
        $streamWriter.WriteLine($LogEntry)
        $streamWriter.Close()
    }
}