"""QR code generation for devices."""
import base64
import io
import json

import qrcode


def generate_device_qr(serial_number: str) -> str:
    """Generate QR code encoding device serial; return base64-encoded PNG."""
    data = json.dumps({"serial": serial_number, "type": "agri_guard_device"})
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=8, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image()  # uses PIL factory (qrcode[pil] / Pillow already in requirements)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode()
