$logFolder = "C:\ProgramData\RCS\Logs\MDM_Disk_Cleanup"
$logFile = Join-Path -Path $logFolder -ChildPath "$((Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")).log"
if (-not (Test-Path -Path $logFolder)) {
    New-Item -Path $logFolder -ItemType Directory
}
else {
    $oldLogs = Get-ChildItem -Path $logFolder -File
    if ($oldLogs.Count -gt 0) {
        $oldLogs | Remove-Item -Force
    }

}

$VerbosePreference = "Continue"
Start-Transcript -Path $logFile

$userName = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
Write-Verbose "Current User: $userName"
if ($userName -eq "NT AUTHORITY\SYSTEM") {
    Write-Verbose "Running in System context"
}
else {
   Write-Verbose "Running in User context"
}

Get-ExecutionPolicy -List

$cleanupResults = 'Cleanup Results:'
$totalCount = 0

### Clean MDM Folder (Intune LOB Content)
Write-Verbose "Cleaning MDM Folder"

$mdmFolderPath = "C:\Windows\system32\config\systemprofile\AppData\Local\mdm"
$systemLocalAppDataPath = "C:\Windows\system32\config\systemprofile\AppData\Local"
Write-Verbose "Current Veriables:"
Write-Verbose "MDM Folder Path: $mdmFolderPath"
Write-Verbose "System Local AppData Folder Path: $systemLocalAppDataPath"
if (Test-Path -Path $systemLocalAppDataPath) {
    Write-Verbose "System Local AppData Folder found"
    Set-Location $systemLocalAppDataPath
    Write-Verbose "Set location to System Local AppData Folder"
    Write-Verbose "Getting contents of System Local AppData Folder with Force"
    $appDataContents = Get-ChildItem -Path $systemLocalAppDataPath -Force
    Write-Verbose "Found $($appDataContents.Count) items in System Local AppData Folder"
    if ($appDataContents.Count -eq 0) {
        Write-Verbose "No items found in System Local AppData Folder"
    }
    else {
        Write-Verbose "Local AppData Contents:"
        foreach ($item in $appDataContents) {
            if ($item.PSIsContainer) {
                Write-Verbose "Folder: $($item.Name)"
            }
            else {
                Write-Verbose "File: $($item.Name)"
            }
        }
    }
    Write-Verbose ""
    Write-Verbose ""
    Write-Verbose "Getting contents of System Local AppData Folder with Force and System"
    $appDataContents = Get-ChildItem -Path $systemLocalAppDataPath -Force -System
    Write-Verbose "Found $($appDataContents.Count) items in System Local AppData Folder"
    if ($appDataContents.Count -eq 0) {
        Write-Verbose "No items found in System Local AppData Folder"
    }
    else {
        Write-Verbose "Local AppData Contents:"
        foreach ($item in $appDataContents) {
            if ($item.PSIsContainer) {
                Write-Verbose "Folder: $($item.Name)"
            }
            else {
                Write-Verbose "File: $($item.Name)"
            }
        }
    }
    Write-Verbose ""
    Write-Verbose ""
    Write-Verbose "Getting contents of System Local AppData Folder with Force and Hidden"
    $appDataContents = Get-ChildItem -Path $systemLocalAppDataPath -Force -Hidden
    Write-Verbose "Found $($appDataContents.Count) items in System Local AppData Folder"
    if ($appDataContents.Count -eq 0) {
        Write-Verbose "No items found in System Local AppData Folder"
    }
    else {
        Write-Verbose "Local AppData Contents:"
        foreach ($item in $appDataContents) {
            if ($item.PSIsContainer) {
                Write-Verbose "Folder: $($item.Name)"
            }
            else {
                Write-Verbose "File: $($item.Name)"
            }
        }
    }
    Write-Verbose "Getting MSI files in System Local AppData Folder with Recurse and Force"
    $appDataMSIContents = Get-ChildItem -Path $systemLocalAppDataPath -Filter "*.msi" -Recurse -Force -ErrorAction Continue
    Write-Verbose "Found $($appDataMSIContents.Count) MSI files in System Local AppData Folder"
    if ($appDataMSIContents.Count -gt 0) {
        Write-Verbose "MSI Contents:"
        foreach ($item in $appDataMSIContents) {
            Write-Verbose "MSI File: $($item.Name)"
        }
    }
    else {
        Write-Verbose "No MSI files found in System Local AppData Folder"
    }
    Write-Verbose ""
    Write-Verbose ""
    Write-Verbose "Getting MDM Folder in System Local AppData Folder with Recurse and Force"
    $appDataMDMContents = Get-ChildItem -Path $systemLocalAppDataPath -Include "mdm\*" -Recurse -Force -Hidden -System
    Write-Verbose "Found $($appDataMDMContents.Count) MDM Folder in System Local AppData Folder"
    if ($appDataMDMContents.Count -gt 0) {
        Write-Verbose "MDM Contents:"
        foreach ($item in $appDataMDMContents) {
            Write-Verbose "MDM Folder: $($item.Name)"
        }
    }
    else {
        Write-Verbose "No MDM Folder found in System Local AppData Folder"
    }
    Write-Verbose ""
    Write-Verbose ""
    try {
        Write-Verbose "Setting location to MDM Folder using relative path"
        Set-Location .\MDM
    }
    catch {
        Write-Verbose "Could not set location to MDM Folder using relative path"
    }
    Write-Verbose "Checking if MDM Folder exists with relative path in System Local AppData Folder"
    if (test-path -Path ".\mdm") {
        Write-Verbose "MDM Folder found in System Local AppData Folder"
        $mdmContents = Get-ChildItem -Path ".\MDM"
        Write-Verbose "Found $($mdmContents.Count) items in MDM Folder"
        Write-Verbose "Contents: $($mdmContents | ForEach-Object { $_.Name })"
    }
    else {
        Write-Verbose "MDM Folder not found with relative path in System Local AppData Folder"
    }
    try {
        Write-Verbose "Setting location to MDM Folder using full path"
        Set-Location $mdmFolderPath
    }
    catch {
        Write-Verbose "Could not set location to MDM Folder using full path"
    }
}
Write-Verbose "Checking if MDM Folder exists with full path"
if (Test-Path -Path $mdmFolderPath) {
    Write-Verbose "MDM Folder found with full path"
    $currentDate = Get-Date
    $mdmDeleteAge = $currentDate.AddDays(-7)
    # Grant Full Control permissions to the current user for the specified folder
    Write-Verbose "Checking permissions for MDM Folder"
    try {
        Write-Verbose "Attempting to get files from MDM Folder with LastWriteTime older than $mdmDeleteAge"
        $oldFiles = Get-ChildItem -Path $mdmFolderPath -File | Where-Object { $_.LastWriteTime -lt $mdmDeleteAge }
    }
    catch {
        Write-Verbose "Could not get files from MDM Folder, trying to set permissions"
        $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        $acl = Get-Acl -Path $mdmFolderPath
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($currentUser, "FullControl", "Allow")
        $acl.SetAccessRule($rule)
        Set-Acl -Path $mdmFolderPath -AclObject $acl
    }
    Write-Verbose "Getting files older $mdmDeleteAge from MDM Folder"
    $oldFiles = Get-ChildItem -Path $mdmFolderPath -File | Where-Object { $_.LastWriteTime -lt $mdmDeleteAge }
    if ($oldFiles.Count -gt 0) {
        Write-Verbose "Found $($oldFiles.Count) files in MDM Folder to delete"
        $mdmFilesCount = ($oldFiles | Measure-Object -Property Length -Sum).Sum / 1MB
        try {
            $oldFiles | Remove-Item -Force
        }
        catch {
            Write-Verbose "Could not delete files from MDM Folder"
            $mdmFilesCount = 0
            $oldFiles | ForEach-Object {
                try {
                    $_ | Remove-Item -Force
                    $mdmFilesCount += $_.Length / 1MB
                }
                catch {
                    Write-Verbose "Could not delete file $($_.FullName)"
                }
            }
        }
        $cleanupResults += " MDM Folder ($mdmFilesCount MB)"
        $totalCount += $mdmFilesCount
    } 
    else {
        Write-Verbose "No files found in MDM Folder to delete"
    }
} else {
    Write-Verbose "MDM Folder not found with full path"
    $cleanupResults += " -MDM: folder not found"
}

$cleanupResults += " Total: $mdmFilesCount MB"
Write-Verbose $cleanupResults

Stop-Transcript
Exit 0