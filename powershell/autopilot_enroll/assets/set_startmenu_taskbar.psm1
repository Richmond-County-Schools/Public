function Invoke-SetDefaultStartMenuLayout {
    param (
        [Parameter(Mandatory = $true)]
        [string]$startMenuPath,
        [string]$taskBarPath
    )

    # Get all user profile folders
    $usersStartMenu = get-childitem -path "C:\Users\*\AppData\Local\Packages\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\LocalState"

    # Copy Start menu to all users folders
    ForEach ($startmenu in $usersStartMenu) {
        Copy-Item -Path $startMenuPath -Destination $startmenu -Force
    }

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