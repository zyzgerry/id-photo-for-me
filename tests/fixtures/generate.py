"""Recreate synthetic fixtures: Pillow and pillow-heif are development tools only."""
from pathlib import Path
from PIL import Image, ImageDraw
import pillow_heif

pillow_heif.register_heif_opener()
root = Path(__file__).parent
image = Image.new('RGB', (120, 80))
draw = ImageDraw.Draw(image)
for box, color in [((0,0,59,39),'red'), ((60,0,119,39),'lime'),
                   ((0,40,59,79),'blue'), ((60,40,119,79),'yellow')]:
    draw.rectangle(box, fill=color)
image.save(root / 'quadrants.heic', quality=95)
exif = Image.Exif()
exif[274] = 6
image.save(root / 'orientation-6.jpg', quality=98, subsampling=0, exif=exif)
