param (
    [Parameter(Mandatory=$true)]
    [string]$targetBrowser
)

# Validate the input
$supportedBrowsers = "chrome", "firefox"
if ($supportedBrowsers -notcontains $targetBrowser) {
    Write-Host "Invalid browser specified. Please enter 'chrome' or 'firefox'."
    exit
}

# Get the base folder name (excluding the drive)
$baseFolderName = (Split-Path -Leaf $PSScriptRoot)

# Create build folder if it doesn't exist
$buildFolder = "$PSScriptRoot\build"
if (-not (Test-Path $buildFolder)) {
    New-Item -ItemType Directory -Force -Path $buildFolder | Out-Null
}


$tempFolder = "$buildFolder\$baseFolderName" + "-$targetBrowser"
# delete first the temporary build folder
if (Test-Path $tempFolder) {
    Remove-Item -Path $tempFolder -Recurse -Force
}

# Create temporary build folder in the build directory
New-Item -ItemType Directory -Force -Path $tempFolder | Out-Null


# Copy all files except the script (.ps1), the build folder, and any manifest files into temporary build folder
$excludeFiles = @("*.ps1", "build", "manifest_*.json", "ReadMe.md", "docs", ".gitignore")  # Exclude the script, the build folder, and any manifest files
Get-ChildItem -Path $PSScriptRoot -Exclude $excludeFiles | Copy-Item -Destination $tempFolder -Recurse -Force

# Copy the appropriate manifest file based on the target browser
$manifestFile = "$PSScriptRoot\manifest_$targetBrowser.json"
if (Test-Path $manifestFile) {
    Copy-Item -Path $manifestFile -Destination "$tempFolder\manifest.json" -Force
} else {
    Write-Host "Manifest file for $targetBrowser not found: $manifestFile"
    exit
}

# Minify JavaScript file
$jsFilePath = "$tempFolder\inject.js"
if (Test-Path $jsFilePath) {
    # Read the content of the JavaScript file
    $jsContent = Get-Content $jsFilePath -Raw

    # Define the URL of the online JavaScript minification API
    $minifyApiUrl = "https://www.toptal.com/developers/javascript-minifier/api/raw"

    # Define the request body with the JavaScript content
    $body = @{
        input = $jsContent
    }

    # Invoke the API to minify the JavaScript content
    $response = Invoke-RestMethod -Uri $minifyApiUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"

    if ($response) {
        # Write the minified content back to the JavaScript file
        Set-Content -Path $jsFilePath -Value $response -Force

        Write-Host "JavaScript file minified using online API: $jsFilePath"
    } else {
        Write-Host "Failed to minify JavaScript file: $jsFilePath"
    }
} else {
    Write-Host "JavaScript file not found: $jsFilePath"
}

# Add the .NET assembly for compression
Add-Type -AssemblyName System.IO.Compression.FileSystem


$zipFileName = "$buildFolder\$baseFolderName" + "-$targetBrowser.zip"

# If the zip file already exists, delete it
if (Test-Path $zipFileName) {
    Remove-Item $zipFileName
}

# Create a new zip archive
$zip = [System.IO.Compression.ZipFile]::Open($zipFileName, 'Update')

# Get all files in the temporary build folder
$files = Get-ChildItem -Path $tempFolder -Recurse -File

# For each file, replace the backslashes in the file path with forward slashes
# and add the file to the zip archive with the modified file path
foreach ($file in $files) {
    $filePath = $file.FullName
    $zipFilePath = $filePath.Replace($tempFolder, '').Replace('\', '/')
    $zipFilePath = $zipFilePath.TrimStart('/')
    if (Test-Path $filePath) {
        $null = [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $filePath, $zipFilePath)
    }
}

# Save and close the zip archive
$zip.Dispose()

Write-Host "Extension zip file created: $zipFileName"