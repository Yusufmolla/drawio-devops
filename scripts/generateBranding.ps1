# Render the project's simple vector logo and favicon using Windows System.Drawing.
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path $PSScriptRoot -Parent
$imageDir = Join-Path $projectRoot 'public/img'
$bitmap = [System.Drawing.Bitmap]::new(256, 256)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
function Paint-RoundedRect($x, $y, $width, $height, $radius, $color) {
    $shape = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $diameter = 2 * $radius
    $shape.AddArc($x, $y, $diameter, $diameter, 180, 90)
    $shape.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
    $shape.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
    $shape.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
    $shape.CloseFigure()
    $brush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($color))
    $graphics.FillPath($brush, $shape)
    $brush.Dispose()
    $shape.Dispose()
}
Paint-RoundedRect 0 0 256 256 48 '#0f172a'
$pen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#38bdf8'), 16)
$pen.StartCap = $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$graphics.DrawLines($pen, [System.Drawing.Point[]]@(
    [System.Drawing.Point]::new(64,128), [System.Drawing.Point]::new(128,128),
    [System.Drawing.Point]::new(128,64), [System.Drawing.Point]::new(192,64)))
$graphics.DrawLines($pen, [System.Drawing.Point[]]@(
    [System.Drawing.Point]::new(128,128), [System.Drawing.Point]::new(128,192),
    [System.Drawing.Point]::new(192,192)))
Paint-RoundedRect 40 104 48 48 12 '#f8fafc'
Paint-RoundedRect 168 40 48 48 12 '#38bdf8'
Paint-RoundedRect 168 168 48 48 12 '#2dd4bf'
$bitmap.Save((Join-Path $imageDir 'logo.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Save((Join-Path $imageDir 'preview.png'), [System.Drawing.Imaging.ImageFormat]::Png)
# ICO container holding the full-resolution PNG.
$pngBytes = [System.IO.File]::ReadAllBytes((Join-Path $imageDir 'logo.png'))
$iconStream = [System.IO.File]::Create((Join-Path $imageDir 'favicon.ico'))
$writer = [System.IO.BinaryWriter]::new($iconStream)
$writer.Write([byte[]]@(0,0,1,0,1,0,0,0,0,0,1,0,32,0))
$writer.Write([int]$pngBytes.Length)
$writer.Write([int]22)
$writer.Write($pngBytes)
$writer.Dispose()
$pen.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
