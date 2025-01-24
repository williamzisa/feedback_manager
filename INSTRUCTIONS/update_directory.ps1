$projectRoot = "."
$outputFile = "./.notes/directory_structure.md"

# Lista di cartelle da escludere
$excludedFolders = @("node_modules", ".git", ".notes", ".next")

# Funzione per generare la struttura di directory in formato compatto con gestione della lunghezza delle righe
function Get-CompactDirectory {
    param (
        [string]$path,
        [int]$maxLineLength = 80
    )

    $result = @()
    $currentLine = ""

    foreach ($item in Get-ChildItem -Path $path -Force) {
        # Salta le cartelle escluse
        if ($excludedFolders -contains $item.Name) {
            continue
        }

        if ($item.PSIsContainer) {
            # Elabora la sottocartella in modo ricorsivo
            $subItems = Get-CompactDirectory -path $item.FullName -maxLineLength $maxLineLength
            $formatted = "$($item.Name)/{$subItems}"
        } else {
            $formatted = "$($item.Name)"
        }

        # Aggiungi elemento alla riga corrente se non supera la lunghezza massima
        if (($currentLine.Length + $formatted.Length + 2) -le $maxLineLength) {
            if ($currentLine -ne "") {
                $currentLine += ", "
            }
            $currentLine += $formatted
        } else {
            # Aggiungi la riga al risultato e inizia una nuova riga
            $result += $currentLine
            $currentLine = $formatted
        }
    }

    # Aggiungi l'ultima riga al risultato
    if ($currentLine -ne "") {
        $result += $currentLine
    }

    return $result -join "`n"
}

# Esegui la funzione e cattura l'output in una variabile
$directoryStructure = Get-CompactDirectory -path $projectRoot

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
