<#
# Example usage:
$ProfilePath = Join-Path $PSScriptRoot 'wifi_profile.xml'

if (-not (Connect-WiFiProfile -ProfileXmlPath $ProfilePath)) {
    Write-Host "Exiting — Wi-Fi connection failed."
    exit 1
}

Write-Host "Continuing with the rest of the script..."

#>

function Connect-WiFiProfile {
    param (
        [Parameter(Mandatory = $true)]
        [string]$ProfileXmlPath
    )

    if (!(Test-Path $ProfileXmlPath)) {
        Write-Host "Wi-Fi profile XML not found at $ProfileXmlPath"
        return $false
    }

    Write-Host "Reading SSID from: $ProfileXmlPath"

    # Parse XML and get <name>
    try {
        [xml]$xml = Get-Content $ProfileXmlPath
        $SSID = $xml.WLANProfile.name
    } catch {
        Write-Host "Failed to read SSID from XML."
        return $false
    }

    Write-Host "Found SSID: $SSID"

    # Add profile
    Write-Host "Adding Wi-Fi profile..."
    netsh wlan add profile filename="$ProfileXmlPath" user=current

    # Connect
    Write-Host "Connecting to $SSID..."
    netsh wlan connect name=$SSID

    Start-Sleep -Seconds 5

    # Verify connection
    $currentSSID = netsh wlan show interfaces | Select-String ' SSID' | ForEach-Object {
        $_.ToString().Split(':')[1].Trim()
    }

    if ($currentSSID -contains $SSID) {
        Write-Host "Successfully connected to $SSID."
        return $true
    } else {
        Write-Host "Failed to connect to $SSID."
        return $false
    }
}
