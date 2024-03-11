function Get-AccessToken {
    param (
        [Parameter(Mandatory = $true)]
        [string]$tenantID,
        [Parameter(Mandatory = $true)]
        [string]$appID,
        [Parameter(Mandatory = $true)]
        [string]$appSecret
    )
    Write-Log -Message "Obtaining Auth Token"
    $accessTokenUrl = "https://login.microsoftonline.com/$tenantID/oauth2/v2.0/token"
    $tokenRequestBody = @{
        "grant_type"    = "client_credentials"
        "scope"         = "https://graph.microsoft.com/.default"
        "client_id"     = $appID
        "client_secret" = $appSecret
    }   
    Try {
        Write-Log -Level "DEBUG" -Message "Calling $accessTokenUrl with body: $tokenRequestBody"
        $tokenResponse = Invoke-RestMethod -Uri $accessTokenUrl -Method POST -Body $tokenRequestBody
        Write-Log -Level "DEBUG" -Message "Response: $tokenResponse"
    }
    Catch {
        Write-Log -Message "Failed to obtain Auth Token: $_"
    }
    return $tokenResponse.access_token
}