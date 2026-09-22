$content = Get-Content 'D:\CODING\RIFAKHIRINDHOISETIAWAN\RIFAKHIRINDHOISETIAWAN\admin.html' -Raw
$i = $content.IndexOf('@media(max-width:640px)')
if ($i -eq -1) { Write-Host 'Not found'; exit 1 }
Write-Host "Found at: $i"

$brace = 0
for ($j = $i; $j -lt $content.Length; $j++) {
    $ch = $content[$j]
    if ($ch -eq '{') { $brace++ }
    elseif ($ch -eq '}') {
        $brace--
        if ($brace -eq 0) {
            $end = $j + 1
            break
        }
    }
}
Write-Host "Found end at: $end"
Write-Host "Final brace count: $brace"
$media = $content.Substring($i, $end - $i)
Write-Host "Media length: $($media.Length)"