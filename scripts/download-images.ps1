# =====================================================================
# Downloads all RevOnest images into local folders so the store works
# offline. Run from the Frontend/ root:  ./scripts/download-images.ps1
# =====================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"  # hides noisy per-byte progress

$catalogDir = "typescript-tailwind/images"
$homeDir = "home/images"
New-Item -ItemType Directory -Force -Path $catalogDir | Out-Null
New-Item -ItemType Directory -Force -Path $homeDir | Out-Null

# Catalog product images (width 600). filename => Unsplash photo id
$catalog = [ordered]@{
  "wireless-mouse"        = "photo-1527814050087-3793815479db"
  "mechanical-keyboard"   = "photo-1595225476474-87563907a212"
  "headphones"            = "photo-1505740420928-5e560c06d30e"
  "smart-watch"           = "photo-1523275335684-37898b6baf30"
  "steel-pan"             = "photo-1556908153-a1d0d57116a7"
  "espresso-machine"      = "photo-1608354580875-30bd4168b351"
  "chef-knife"            = "photo-1593618998160-e34014e67546"
  "electric-kettle"       = "photo-1748408082799-94daff13e792"
  "the-silent-patient"    = "photo-1544716278-ca5e3f4abd8c"
  "atomic-habits"         = "photo-1512820790803-83ca734da794"
  "deep-work"             = "photo-1589998059171-988d887df646"
  "midnight-library"      = "photo-1481627834876-b7833e8f5570"
  "running-shoes"         = "photo-1542291026-7eec264c27ff"
  "yoga-mat"              = "photo-1601925260368-ae2f83cf8b7f"
  "adjustable-dumbbell"   = "photo-1638536532686-d610adfc8e5c"
  "water-bottle"          = "photo-1602143407151-7111542de6e8"
  "foldable-phone"        = "photo-1657731739861-b21d95062cbf"
  "compact-laptop"        = "photo-1517336714731-489689fd1ca8"
  "retro-handheld"        = "photo-1531525645387-7f14be1bdbbd"
  "smart-glasses"         = "photo-1591076482161-42ce6da69f67"
  "air-fryer"             = "photo-1695089028114-ce28248f0ab9"
}

# Home-only images (hero at 900, category tiles at 500)
$homeImages = [ordered]@{
  "hero;900"              = "photo-1607082349566-187342175e2f"
  "cat-electronics;500"   = "photo-1498049794561-7780e7231661"
  "cat-kitchen;500"       = "photo-1556911220-bff31c812dba"
  "cat-books;500"         = "photo-1512820790803-83ca734da794"
  "cat-sports;500"        = "photo-1517836357463-d25dfeac3438"
}

function Save-Image($id, $width, $outFile) {
  $url = "https://images.unsplash.com/$id`?auto=format&fit=crop&w=$width&q=80"
  Write-Host "Downloading $outFile ..."
  Invoke-WebRequest -Uri $url -OutFile $outFile
}

foreach ($name in $catalog.Keys) {
  Save-Image $catalog[$name] 600 "$catalogDir/$name.jpg"
}

foreach ($key in $homeImages.Keys) {
  $parts = $key.Split(";")
  Save-Image $homeImages[$key] $parts[1] "$homeDir/$($parts[0]).jpg"
}

Write-Host "Done. Images saved to $catalogDir and $homeDir."
