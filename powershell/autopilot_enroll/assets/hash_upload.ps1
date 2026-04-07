# Azure App Credentials
$TenantId = 'd67a5538-3013-4aad-bc46-b9bd7f7012c1'
$AppId = 'e4f16fb3-813c-4526-89a1-1af81ac5f9c3'
$functionsFolder = Join-Path $PSScriptRoot 'functions'
$ProfilePath = Join-Path $PSScriptRoot 'wifi_profile.xml'
$UI_EXE = Join-Path $PSScriptRoot 'ui++\UI++64.exe'
$UI_CONFIG = Join-Path $PSScriptRoot 'ui++\UI++.xml'
$LockScreenURL = "https://raw.githubusercontent.com/Richmond-County-Schools/Public/main/branding/wallpaper.jpg"
$bloatURL = "https://raw.githubusercontent.com/Richmond-County-Schools/Public/refs/heads/main/powershell/bloat_apps.txt"
$startMenuURL = "https://raw.githubusercontent.com/Richmond-County-Schools/Public/refs/heads/main/powershell/start2.bin"
$taskBarURL = "https://raw.githubusercontent.com/Richmond-County-Schools/Public/refs/heads/main/powershell/LayoutModification.xml"
$zscalerCertUrl = "https://raw.githubusercontent.com/Richmond-County-Schools/Public/refs/heads/main/certs/ZscalerRootCertificate-2048-SHA256-Feb2025.crt"
$regPath = "HKLM:\SOFTWARE\RCS\DeviceInfo"
$iisIP = "10.24.15.52"
$iisURL = "http://$iisIP/LocalSoftwareHosting/assets/"
$fileName = "autopilot.txt"
$txtUrl = $iisUrl + $fileName

# Import all functions from the specified folder
Get-ChildItem -Path $functionsFolder -Filter '*.psm1' | ForEach-Object {
    $functionPath = $_.FullName
    if (Test-Path $functionPath) {
        Write-Host "Importing function from: $functionPath"
        Import-Module -Name $functionPath -Force
    } else {
        Write-Host "Function file not found: $functionPath"
    }
}

# Connect to Wi-Fi using the profile XML if not already connected to the internet
if (-not (Test-Connection -ComputerName "8.8.8.8" -Count 1 -Quiet)) {
    Write-Host "Internet not reachable, attempting to connect to WiFi..."
    
    if (-not (Test-Path $ProfilePath)) {
        Read-Host "WiFi profile XML not found at $ProfilePath. Please connect to the internet and press Enter to continue"
    }
    else {
        Write-Host "Using WiFi profile from: $ProfilePath"
        Connect-WiFiProfile -ProfileXmlPath $ProfilePath
    }

    # Check if "8.8.8.8" is reachable making 5 attempts
    $pingSuccess = $false
    for ($i = 0; $i -lt 5; $i++) {
        if (Test-Connection -ComputerName "8.8.8.8" -Count 1 -Quiet) {
            $pingSuccess = $true
            break
        }
        Start-Sleep -Seconds 1
    }

    if (-not $pingSuccess) {
        Write-Host "Exiting...Internet connectivity check failed."
        exit 1
    }
    else {
        Write-Host "Successfully connected to the internet."
    }
} else {
    Write-Host "Already connected to the internet."
}

# Run UI++ and WAIT for it to exit
Write-Host "Launching UI++..."
Write-Host "EXE: $UI_EXE"
Write-Host "$UI_CONFIG"

Start-Process -FilePath $UI_EXE -ArgumentList "/config:`"$UI_CONFIG`"" -Wait

Write-Host "UI++ has finished."

########################
# AutoPilot Upload
########################

# Read values from registry
$displayName = (Get-ItemProperty -Path $regPath -Name DisplayName -ErrorAction SilentlyContinue).DisplayName
$groupTag    = (Get-ItemProperty -Path $regPath -Name GroupTag -ErrorAction SilentlyContinue).GroupTag

# Fallback or logging
if (-not $displayName) { Write-Warning "DisplayName not found in registry." }
if (-not $groupTag)    { Write-Warning "GroupTag not found in registry." }

Write-Host "$displayName grouptag is $groupTag"

if (Set-LockScreenImageFromURL -ImageUrl $LockScreenURL) {
    Write-Host "Lock screen image applied successfully."
} else {
    Write-Host "Failed to set lock screen image."
}

Invoke-SetDefaultStartMenuLayout -StartMenuURL $startMenuURL -TaskBarURL $taskBarURL

Invoke-InstallCert -CertUrl $zscalerCertUrl

# Remove bloatware
Invoke-RemoveBloatware -RemoveListUrl $bloatURL


# Continue with upload logic
Write-Host "Continuing with hash upload..."

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned

# Install NuGet package provider
try {
    Write-Output "Installing NuGet..."
    Install-PackageProvider -Name NuGet -Force -Scope AllUsers -Confirm:$false
    Write-Output "NuGet installed"
}
catch {
    Write-Error "Failed to install NuGet: $_"
    Exit 1
}

# Install Get-WindowsAutoPilotInfo script
try {
    Write-Output "Installing Get-WindowsAutoPilotInfo.ps1..."
    Install-Script -Name Get-WindowsAutoPilotInfo -Scope AllUsers -Force
    Write-Output "Get-WindowsAutoPilotInfo.ps1 installed"
}
catch {
    Write-Error "Failed to install Get-WindowsAutoPilotInfo.ps1: $_"
    Exit 1
}

$AppSecret = Invoke-ObtainTxtContents -Url $txtUrl

# Run Get-WindowsAutoPilotInfo script
try {
    Write-Output "Uploading hash for $displayName..."
    Get-WindowsAutoPilotInfo.ps1 -TenantId $TenantId -AppId $AppId -AppSecret $AppSecret -Online -AssignedComputerName $displayName -GroupTag $groupTag -Assign
    Write-Output "Get-WindowsAutoPilotInfo.ps1 completed"
}
catch {
    Write-Error "Failed to run Get-WindowsAutoPilotInfo.ps1: $_"
    Exit 1
}

# Remove the folder containing the script and everything in it
try {
    Write-Output "Removing script folder: $PSScriptRoot"
    Remove-Item -Path $PSScriptRoot -Recurse -Force -ErrorAction Stop
    Write-Output "Script folder removed successfully"
}
catch {
    Write-Error "Failed to remove script folder: $_"
    Exit 1
}

# Restart the computer
try {
    Write-Output "Restarting the computer..."
    Restart-Computer -Force
}
catch {
    Write-Error "Failed to restart the computer: $_"
    Exit 1
}
