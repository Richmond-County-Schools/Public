$imageFileURL = "http://10.24.15.52/LocalSoftwareHosting/image.wim"

$response = Invoke-WebRequest -Uri $imageFileURL -Method Head
if (!$response) {
    Start-OSDCloud -OSEdition Education -Firmware -ZTI -Restart
}
else {
  Start-OSDCloud -ImageFileURL $imageFileURL -ImageIndex 1 -Firmware -Restart
}

