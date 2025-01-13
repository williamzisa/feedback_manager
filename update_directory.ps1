$projectRoot = "."
$outputFile = "./.notes/directory_structure.md"

# Lista di cartelle da escludere
$excludedFolders = @("node_modules", ".git", ".notes", ".next")

# Funzione per generare la struttura di directory in formato testuale
function Get-FormattedDirectory {
    param (
        [string]$path,
        [int]$indent = 0
    )

    $indentString = " " * $indent
    $content = ""

    foreach ($item in Get-ChildItem -Path $path -Force) {
        # Salta le cartelle escluse
        if ($excludedFolders -contains $item.Name) {
            continue
        }

        if ($item.PSIsContainer) {
            $content += "$indentString- **$($item.Name)/**`n"
            $content += Get-FormattedDirectory -path $item.FullName -indent ($indent + 1)
        } else {
            $content += "$indentString- $($item.Name)`n"
        }
    }

    return $content
}

# Esegui la funzione e cattura l'output in una variabile
$directoryStructure = Get-FormattedDirectory -path $projectRoot

# Prepara il contenuto in formato Markdown
$markdownContent = @"
# Current Directory Structure

## Core Components

\`\`\`
$directoryStructure
\`\`\`
"@

# (1) Crea la cartella .notes se non esiste
if (!(Test-Path -Path ".notes")) {
    New-Item -ItemType Directory -Path ".notes" | Out-Null
}

# (2) Scrive il contenuto nel file
$markdownContent | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "Directory structure updated in $($outputFile)"