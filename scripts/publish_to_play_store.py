#!/usr/bin/env python3
import sys
import os
import argparse

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except ImportError:
    print("Error: Missing google-api-python-client. Run: pip install google-api-python-client google-auth")
    sys.exit(1)

PACKAGE_NAME = "com.sanctum.wizardchess"
DEFAULT_KEY_FILE = "/home/milla/3d-Wizard-Chess/play-service-account.json"
DEFAULT_AAB_FILE = "/home/milla/3d-Wizard-Chess/android/app/build/outputs/bundle/release/app-release.aab"

def main():
    parser = argparse.ArgumentParser(description="Automated Google Play Store Publisher")
    parser.add_argument("--key", default=DEFAULT_KEY_FILE, help="Path to Google Play API Service Account JSON key")
    parser.add_argument("--aab", default=DEFAULT_AAB_FILE, help="Path to signed app-release.aab")
    parser.add_argument("--track", default="internal", choices=["internal", "alpha", "beta", "production"], help="Play Store track")
    args = parser.parse_args()

    if not os.path.exists(args.key):
        print("\n" + "=" * 70)
        print("❌ MISSING GOOGLE PLAY API KEY FILE!")
        print("=" * 70)
        print(f"File not found: {args.key}\n")
        print("To enable automated command-line publishing:")
        print("1. Go to Google Play Console -> Developer Account -> API Access")
        print("2. Create a Google Cloud Service Account with 'Release Manager' role")
        print("3. Download the JSON key file and save it to:")
        print(f"   {DEFAULT_KEY_FILE}")
        print("4. Re-run this script: python3 scripts/publish_to_play_store.py")
        print("=" * 70 + "\n")
        sys.exit(1)

    if not os.path.exists(args.aab):
        print(f"Error: AAB file not found at {args.aab}")
        sys.exit(1)

    print(f"🔐 Authenticating with Google Play API key: {args.key}...")
    credentials = service_account.Credentials.from_service_account_file(
        args.key,
        scopes=["https://www.googleapis.com/auth/androidpublisher"]
    )
    service = build("androidpublisher", "v3", credentials=credentials)

    print(f"📝 Creating Play Store edit session for package: {PACKAGE_NAME}...")
    edit_request = service.edits().insert(body={}, packageName=PACKAGE_NAME)
    edit = edit_request.execute()
    edit_id = edit["id"]
    print(f"✓ Edit session created (ID: {edit_id})")

    print(f"📦 Uploading AAB bundle ({os.path.getsize(args.aab) / (1024*1024):.2f} MB)...")
    media = MediaFileUpload(args.aab, mimetype="application/octet-stream", resumable=True)
    bundle_response = service.edits().bundles().upload(
        packageName=PACKAGE_NAME,
        editId=edit_id,
        media_body=media
    ).execute()
    version_code = bundle_response["versionCode"]
    print(f"✓ AAB version code {version_code} uploaded successfully!")

    print(f"🚀 Assigning version {version_code} to track '{args.track}'...")
    track_body = {
        "track": args.track,
        "releases": [{
            "versionCodes": [str(version_code)],
            "status": "completed",
            "name": f"1.0.{version_code} - Automated Release"
        }]
    }
    service.edits().tracks().update(
        packageName=PACKAGE_NAME,
        editId=edit_id,
        track=args.track,
        body=track_body
    ).execute()

    print("💾 Committing edit session to Google Play...")
    service.edits().commit(packageName=PACKAGE_NAME, editId=edit_id).execute()
    print("\n" + "=" * 70)
    print(f"🎉 SUCCESS! Released 3D Wizard Chess (v{version_code}) to '{args.track}' track!")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()
