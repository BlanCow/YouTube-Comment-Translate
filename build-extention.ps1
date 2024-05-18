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

# Create temporary build folder in the build directory
$tempFolder = "$buildFolder\$baseFolderName" + "-$targetBrowser"
New-Item -ItemType Directory -Force -Path $tempFolder | Out-Null

# Copy all files except the script (.ps1), the build folder, and any manifest files into temporary build folder
$excludeFiles = @("*.ps1", "build", "manifest_*.json")  # Exclude the script, the build folder, and any manifest files
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



# Create zip file including the base folder name
$zipFileName = "$buildFolder\$baseFolderName" + "-$targetBrowser.zip"
if (Test-Path $zipFileName) {
    # Update existing zip file with the contents of the temporary build folder
    Compress-Archive -Path $tempFolder\* -DestinationPath $zipFileName -Update
} else {
    # If the zip file doesn't exist, simply create it
    Compress-Archive -Path $tempFolder\* -DestinationPath $zipFileName
}

Write-Host "Extension zip file created: $zipFileName"
