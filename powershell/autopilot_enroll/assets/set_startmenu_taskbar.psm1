function Invoke-SetDefaultStartMenuLayout {
    param (
        [Parameter(Mandatory = $true)]
        [string]$StartMenuUrl,
        [string]$TaskBarUrl
    )

    $startMenuPath = (Join-Path -Path $PSScriptRoot -ChildPath (Split-Path $StartMenuUrl -Leaf)) 
    $taskBarPath = (Join-Path -Path $PSScriptRoot -ChildPath (Split-Path $TaskBarURL -Leaf)) 
    Invoke-WebRequest -Uri $StartMenuUrl -OutFile $startMenuPath -UseBasicParsing -ErrorAction Stop
    Invoke-WebRequest -Uri $StartMenuUrl -OutFile $taskBarPath -UseBasicParsing -ErrorAction Stop

    # Get all user profile folders
    $usersStartMenu = get-childitem -path "C:\Users\*\AppData\Local\Packages\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\LocalState"

    # Copy Start menu to all users folders
    ForEach ($startmenu in $usersStartMenu) {
        Copy-Item -Path $startMenuPath -Destination $startmenu -Force
    }

    # Create default user profile folders and copy start menu layout

    # Default profile path
    $defaultProfile = "C:\Users\default\AppData\Local\Packages\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\LocalState"

    # Create folder if it doesn't exist
    if(-not(Test-Path $defaultProfile)) {
        new-item $defaultProfile -ItemType Directory -Force
    }

    # Copy file
    Copy-Item -Path $startMenuPath -Destination $defaultProfile -Force

    $taskbarDefaultPath = "C:\Users\Default\AppData\Local\Microsoft\Windows\Shell"
    Copy-Item -Path $taskBarPath -Destination $taskbarDefaultPath -Force
}