function Invoke-RemoveBloatware {
    param (
        [Parameter(Mandatory = $false)]
        [string]$RemoveListUrl = "https://raw.githubusercontent.com/Richmond-County-Schools/Public/refs/heads/main/powershell/bloat_apps.txt"
    )

# Local temp copy
$LocalRemoveList = Join-Path $PSScriptRoot "remove_list.txt"

# -- DOWNLOAD -----------------------

Write-Host "Downloading removal list from $RemoveListUrl..."
Invoke-WebRequest -Uri $RemoveListUrl -OutFile $LocalRemoveList -UseBasicParsing

if (!(Test-Path $LocalRemoveList)) {
    Write-Host "Failed to download removal list."
    exit 1
}

# -- PARSE --------------------------

# Simple format:
# Lines starting with PKG: are AppX / Provisioned packages
# Lines starting with PRG: are traditional programs
# Example:
#   PKG: AD2F1837.HPJumpStarts
#   PRG: HP Wolf Security

$UninstallPackages = @()
$UninstallPrograms = @()

Get-Content $LocalRemoveList | ForEach-Object {
    if ($_ -match "^PKG:\s*(.+)$") {
        $UninstallPackages += $Matches[1].Trim()
    }
    elseif ($_ -match "^PRG:\s*(.+)$") {
        $UninstallPrograms += $Matches[1].Trim()
    }
}

Write-Host "Packages to remove: $($UninstallPackages.Count)"
Write-Host "Programs to remove: $($UninstallPrograms.Count)"

# -- GATHER INSTALLED ----------------

$InstalledPackages = Get-AppxPackage -AllUsers |
    Where-Object { $UninstallPackages -contains $_.Name }

$ProvisionedPackages = Get-AppxProvisionedPackage -Online |
    Where-Object { $UninstallPackages -contains $_.DisplayName }

$InstalledPrograms = Get-Package -Scope AllUsers |
    Where-Object { $UninstallPrograms -contains $_.Name }

# -- REMOVE APPX PROVISIONED ---------

ForEach ($ProvPackage in $ProvisionedPackages) {
    Write-Host "Removing provisioned package: [$($ProvPackage.DisplayName)]..."
    Try {
        Remove-AppxProvisionedPackage -PackageName $ProvPackage.PackageName -Online -ErrorAction Stop
        Write-Host "Removed provisioned package: [$($ProvPackage.DisplayName)]"
    }
    Catch { Write-Warning "Failed to remove provisioned package: [$($ProvPackage.DisplayName)]" }
}

# -- REMOVE APPX INSTALLED ------------

ForEach ($AppxPackage in $InstalledPackages) {
    Write-Host "Removing Appx package: [$($AppxPackage.Name)]..."
    Try {
        Remove-AppxPackage -Package $AppxPackage.PackageFullName -AllUsers -ErrorAction Stop
        Write-Host "Removed Appx package: [$($AppxPackage.Name)]"
    }
    Catch { Write-Warning "Failed to remove Appx package: [$($AppxPackage.Name)]" }
}

# -- REMOVE TRADITIONAL PROGRAMS ------

ForEach ($Program in $InstalledPrograms) {
    Write-Host "Uninstalling: [$($Program.Name)]..."
    Try {
        $Program | Uninstall-Package -AllVersions -Force -ErrorAction Stop
        Write-Host "Uninstalled: [$($Program.Name)]"
    }
    Catch { Write-Warning "Failed to uninstall: [$($Program.Name)]" }
}

# -- OPTIONAL: CLEANUP ---------------

Remove-Item $LocalRemoveList -Force -ErrorAction SilentlyContinue

Write-Host "Finished removing bloatware!"
}
