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

function Invoke-GetComputerObject {
    param (
        [string]$accessToken
    )
    
    # Retrieve computer ID from Microsoft Graph
    $url = "https://graph.microsoft.com/v1.0/devices?`$filter=displayName eq '$ENV:ComputerName'"
    $headers = @{
        Authorization    = "Bearer $accessToken"
        ConsistencyLevel = "eventual"
    }
    
    try {
        Write-Log -Level "DEBUG" -Message "Retrieving device ID from Microsoft Graph using URL: $url"
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        Write-Log -Level "DEBUG" -Message "Response: $($response.value)"
        return $response.value
    } catch {
        Write-Output "Error retrieving device ID: $_"
    }
}    

function Invoke-GetComputerGroups {
    param (
        [string]$accessToken,
        [string]$azureId
    )

    # Retrieve group members from Microsoft Graph
    $getGroupMembersUrl = "https://graph.microsoft.com/v1.0/devices/$azureId/memberOf"
    $headers = @{
        Authorization    = "Bearer $accessToken"
        ConsistencyLevel = "eventual"
    }
    Write-Log -Level "DEBUG" -Message "Retrieving group members from Microsoft Graph using URL: $getGroupMembersUrl"
    $deviceGroups = Invoke-RestMethod -Uri $getGroupMembersUrl -Headers $headers -Method GET -ContentType "application/json"
    Write-Log -Level "DEBUG" -Message "Response: $($deviceGroups.value)"

    return $deviceGroups.value
}
