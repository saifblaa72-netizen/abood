"""Generate the VAPID key pair used to sign Web Push notifications.

Run once, then copy the two lines it prints into backend/.env:

    python generate_vapid_keys.py

The private key must stay secret. If it ever leaks, generate a new pair —
but note that every existing subscription becomes invalid, so customers
would have to allow notifications again.
"""
from cryptography.hazmat.primitives import serialization
from py_vapid import Vapid02
from py_vapid.jwt import b64urlencode


def main():
    vapid = Vapid02()
    vapid.generate_keys()

    private_key = b64urlencode(
        vapid.private_key.private_numbers().private_value.to_bytes(32, "big")
    )
    public_key = b64urlencode(
        vapid.public_key.public_bytes(
            serialization.Encoding.X962,
            serialization.PublicFormat.UncompressedPoint,
        )
    )

    print("أضيفي هذه الأسطر إلى ملف backend/.env ثم أعيدي تشغيل السيرفر:")
    print()
    print(f"VAPID_PUBLIC_KEY={public_key}")
    print(f"VAPID_PRIVATE_KEY={private_key}")
    print("VAPID_SUBJECT=mailto:info@waheebafashion.com")
    print()
    print("الواجهة تجلب المفتاح العام من السيرفر تلقائياً، فلا حاجة لأي إعداد فيها.")


if __name__ == "__main__":
    main()
