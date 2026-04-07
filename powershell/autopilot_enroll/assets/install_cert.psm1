function Invoke-InstallCert {
    param(
        [string]$CertUrl
    )
    # Ensure script stops on errors
    $ErrorActionPreference = "Stop"

    try {
        if (-not $CertUrl -or [string]::IsNullOrWhiteSpace($CertUrl)) {
            throw "The variable `$CertUrl` is not set or is empty."
        }

        # Temporary path to save the certificate
        $tempCertPath = Join-Path $env:TEMP "ZscalerRootCA.crt"

        Write-Host "Downloading Zscaler certificate from $zscalerCertUrl ..."
        Invoke-WebRequest -Uri $CertUrl -OutFile $tempCertPath -UseBasicParsing

        if (-not (Test-Path $tempCertPath)) {
            throw "Failed to download the certificate."
        }

        Write-Host "Importing certificate into Trusted Root Certification Authorities..."
        $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($tempCertPath)

        # Install into Local Machine store (requires admin rights)
        $store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
        $store.Open("ReadWrite")
        $store.Add($cert)
        $store.Close()

        Write-Host "Zscaler certificate installed successfully." -ForegroundColor Green
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        # Clean up temp file
        if (Test-Path $tempCertPath) {
            Remove-Item $tempCertPath -Force
        }
    }
}