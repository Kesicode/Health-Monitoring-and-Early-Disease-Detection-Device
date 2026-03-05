"""QR code generation for animals."""
import base64
import io
import json

import qrcode
from qrcode.image.pure import PyPNGImage


def generate_animal_qr(animal_id: int, animal_name: str) -> str:
    """Generate QR code encoding animal info; return base64-encoded PNG."""
    data = json.dumps({"id": animal_id, "name": animal_name, "type": "agri_guard_animal"})
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=8, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(image_factory=PyPNGImage)
    buffer = io.BytesIO()
    img.save(buffer)
    return base64.b64encode(buffer.getvalue()).decode()
