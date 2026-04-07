<#
Create txt file

 # Your client secret
$plainTextSecret = '<app_secret>'

# Password you will give to technicians
$password = Read-Host "Set deployment password" -AsSecureString

# Convert password to key (32 bytes for AES)
$key = (New-Object Security.Cryptography.SHA256Managed).ComputeHash(
    [Text.Encoding]::UTF8.GetBytes(
        [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
        )
    )
)

# Encrypt the secret
$secureSecret = ConvertTo-SecureString $plainTextSecret -AsPlainText -Force
$encrypted = $secureSecret | ConvertFrom-SecureString -Key $key

# Save to file
$encrypted | Out-File "C:\autopilot.txt" 

#>

function Invoke-ObtainTxtContents {
    param(
        [string]$Url
    )

    # Prompt technician
    $techCode = Read-Host "Enter deployment password" -AsSecureString

    # Recreate key
    $key = (New-Object Security.Cryptography.SHA256Managed).ComputeHash(
        [Text.Encoding]::UTF8.GetBytes(
            [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [Runtime.InteropServices.Marshal]::SecureStringToBSTR($techCode)
            )
        )
    )

    # Get encrypted secret
    $txtPath = "$env:TEMP\autopilot.txt"
    Invoke-WebRequest -Uri $Url -OutFile $txtPath | Out-Null
    $encrypted = Get-Content $txtPath

    # Decrypt
    $txtFile = ConvertTo-SecureString $encrypted -Key $key
    $txtContents = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($txtFile)
    ) 

    Remove-Item $txtPath -Force | Out-Null

    return $txtContents
}