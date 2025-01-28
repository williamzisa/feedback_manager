# Imposta il percorso del file di output
$outputFile = "./.cursorrules"

# Lista di cartelle da escludere
$excludedFolders = @("node_modules", ".git", ".notes", ".next", "INSTRUCTIONS")

# Delimitatori per la sezione
$startMarker = "<!-- START STRUCTURE -->"
$endMarker = "<!-- END STRUCTURE -->"

# Funzione per generare la struttura della directory in formato testo
function Get-TreeStructure {
    param (
        [string]$path,
        [string]$prefix = "",
        [string]$branch = "|--",
        [string]$lastBranch = "\--"
    )

    $result = @()
    $items = Get-ChildItem -Path $path -Force | Where-Object { -not ($excludedFolders -contains $_.Name) }

    for ($i = 0; $i -lt $items.Count; $i++) {
        $item = $items[$i]
        $isLast = ($i -eq $items.Count - 1)

        $currentPrefix = if ($isLast) { $lastBranch } else { $branch }
        $nextPrefix = if ($isLast) { "    " } else { "|   " }

        if ($item.PSIsContainer) {
            # Per le cartelle, aggiungi il nome e chiama ricorsivamente
            $result += "$prefix$currentPrefix $($item.Name)"
            $result += Get-TreeStructure -path $item.FullName -prefix ($prefix + $nextPrefix)
        } else {
            # Per i file, aggiungi solo il nome
            $result += "$prefix$currentPrefix $($item.Name)"
        }
    }
    return $result
}

# Genera la struttura della directory con ritorni a capo
$directoryStructure = (Get-TreeStructure -path ".") -join "`n"

# Controlla se il file esiste
if (-Not (Test-Path -Path $outputFile)) {
    # Crea il file se non esiste
    New-Item -ItemType File -Path $outputFile -Force | Out-Null
}

# Leggi il contenuto del file
$fileContent = Get-Content -Path $outputFile -Raw

# Trova la sezione delimitata
if ($fileContent -match [regex]::Escape($startMarker) -and $fileContent -match [regex]::Escape($endMarker)) {
    # Aggiorna la sezione esistente
    $updatedContent = $fileContent -replace "(?s)$([regex]::Escape($startMarker)).*?$([regex]::Escape($endMarker))", "$startMarker`n`n````$directoryStructure`n`````n$endMarker"
} else {
    # Aggiungi la sezione se non esiste
    $updatedContent = $fileContent + "`n`n$startMarker`n`n````$directoryStructure`n`````n$endMarker"
}

# Scrivi il contenuto aggiornato nel file con ritorni a capo
$updatedContent | Set-Content -Path $outputFile -Encoding UTF8

Write-Host "Directory structure updated in $outputFile"
