#!/bin/bash

# Example usage:
script_name="Create User Login Scripts"
script_urls=(\
"https://rcsintunestorage.blob.core.windows.net/intune/Scripts/shell/manage_dock_apps.sh" \
)
script_base_path="/usr/local/bin"
agent_label="com.RCS.manage_dock_apps"

download_file() {
    local url=$1
    local dest_file=$2

    echo "Checking $dest..."

    # Get the last modified time of the remote file (in seconds since epoch)
    remote_last_modified=$(curl -sfI "$url" | grep -i ^Last-Modified: | sed -e 's/Last-Modified: //i' | tr -d '\r' | xargs -I{} date -j -f "%a, %d %b %Y %T %Z" "{}" +%s)

    if [ -f "$dest_file" ]; then
        # Get the last modified time of the local file (in seconds since epoch)
        local_last_modified=$(stat -f "%m" "$dest_file")
    else
        local_last_modified=0
        echo "Local file does not exist. It will be downloaded."
        return 0
    fi

    echo "Remote Last Modified: $remote_last_modified"
    echo "Local Last Modified : $local_last_modified"

    # Compare the last modified times
    if [ "$remote_last_modified" -gt "$local_last_modified" ]; then
        echo "The remote file is newer than the local file, downloading..."
        return 1
        curl -o "$dest_file" "$url"
    else
        echo "The local file is up-to-date."
        return 2
    fi
}

create_launch_agent() {
    script_path=$1
    agent_label=$2

    # Create the Launch Agent Property List (plist) content
    plist_content="<?xml version=\"1.0\" encoding=\"UTF-8\"?>
    <!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">
    <plist version=\"1.0\">
    <dict>
        <key>Label</key>
        <string>${agent_label}</string>
        <key>ProgramArguments</key>
        <array>
            <string>${script_path}</string>
        </array>
        <key>RunAtLoad</key>
        <true/>
        <key>KeepAlive</key>
        <true/>
    </dict>
    </plist>
    "

    # Define the path for the plist file
    plist_path="~/Library/LaunchAgents/${agent_label}.plist"

    # Write the plist content to the file
    echo "${plist_content}" > "${plist_path}"

    # Load the Launch Agent
    launchctl load "${plist_path}"
}


# Download script
download_file "$download_url" "$script_path"
result=$? # 0 is first time downloaded, 1 is version in cloud is newer, and 2 is local file is up to date.

# Only need to run this the first time the script is downloaded, if script updated the path remains the same
if [ "$result" -eq 0 ]; then
    # Set to execute whenever a user logs in
    create_launch_agent "${script_path}" "${agent_label}"   
fi


