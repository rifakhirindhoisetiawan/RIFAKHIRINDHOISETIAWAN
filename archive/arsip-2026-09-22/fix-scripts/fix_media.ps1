$content = Get-Content 'D:\CODING\RIFAKHIRINDHOISETIAWAN\RIFAKHIRINDHOISETIAWAN\admin.html' -Raw

$i = $content.IndexOf('@media(max-width:640px)')
if ($i -eq -1) { Write-Host 'Not found'; exit 1 }

$brace = 0
for ($j = $i; $j -lt $content.Length; $j++) {
    if ($content[$j] -eq '{') { $brace++ }
    elseif ($content[$j] -eq '}') {
        $brace--
        if ($brace -eq 0) {
            $end = $j + 1
            break
        }
    }
}

$oldMedia = $content.Substring($i, $end - $i)
Write-Host "Found: $($oldMedia.Length) chars"

$newMedia = @"
@media(max-width:640px){
      .top-wrap{display:flex;flex-direction:column;gap:16px;align-items:stretch;padding:12px}
      .top-wrap .foto-box{width:100% !important;max-width:none;aspect-ratio:9/16;border-radius:12px}
      .top-row{padding:4px 0 !important;gap:4px !important}
      .top-row > div:first-child{font-size:15px !important;min-height:40px;padding:10px 8px}
      .top-row input{font-size:16px !important;font-weight:800 !important;text-align:left !important;padding:10px 4px}
      .tab-bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:12px;overflow-x:auto;-webkit-overflow-scrolling:touch}
      .tab-btn{flex:0 0 auto;min-width:72px;min-height:48px;padding:12px 16px;font-size:14px;aspect-ratio:auto}
      .tab-empty{flex:0 0 auto;width:48px;height:48px;min-height:48px;aspect-ratio:1/1}
      .foto-act{flex:0 0 auto;width:48px;height:48px;min-height:48px;aspect-ratio:1/1}
      .table-title{min-height:46px;padding:10px 0;font-size:15px}
      .bahan-add-head{width:46px;height:46px;min-height:46px}
"@

if ($content.Contains($oldMedia)) {
    $newContent = $content.Replace($oldMedia, $newMedia)
    Set-Content -Path 'D:\CODING\RIFAKHIRINDHOISETIAWAN\RIFAKHIRINDHOISETIAWAN\admin.html' -Value $newContent -Encoding UTF8
    Write-Host 'Done'
} else {
    Write-Host 'Old media not found exactly'
    Write-Host "Old length: $($oldMedia.Length)"
    Write-Host "First 200: $($oldMedia.Substring(0, [Math]::Min(200, $oldMedia.Length)))"
}