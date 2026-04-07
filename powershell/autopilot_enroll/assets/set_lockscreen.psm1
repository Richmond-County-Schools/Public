function Set-LockScreenImageFromURL {
    param (
        [Parameter(Mandatory = $true)]
        [string]$ImageUrl,

        [string]$DestinationFolder = "C:\Windows\Web\Screen",
        [string]$ImageName = "CustomLockScreen.jpg"
    )

    # Make sure the folder exists
    if (-not (Test-Path $DestinationFolder)) {
        New-Item -Path $DestinationFolder -ItemType Directory -Force | Out-Null
    }

    # Local path
    $DestinationPath = Join-Path $DestinationFolder $ImageName

    Write-Host "Downloading image from $ImageUrl to $DestinationPath..."

    try {
        Invoke-WebRequest -Uri $ImageUrl -OutFile $DestinationPath -UseBasicParsing -ErrorAction Stop
        Write-Host "Downloaded image."
    }
    catch {
        Write-Host "Failed to download image: $($_.Exception.Message)"
        return $false
    }

    # Registry path for lock screen policy
    $RegPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Personalization"

    # Create key if needed
    if (-not (Test-Path $RegPath)) {
        New-Item -Path $RegPath -Force | Out-Null
    }

    # Set the policy
    Set-ItemProperty -Path $RegPath -Name "LockScreenImage" -Value $DestinationPath

    Write-Host "Lock screen image policy set: $DestinationPath"

    return $true
}
