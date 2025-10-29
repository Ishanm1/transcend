# Transcend - TestFlight Deployment Guide

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com

2. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

3. **Expo Account**
   - Sign up at: https://expo.dev
   - Login: `eas login`

## Step 1: Configure EAS Project

1. Create an Expo project (if not done):
   ```bash
   eas init
   ```
   This will generate a project ID - update `app.json` with this ID in `extra.eas.projectId`

2. Configure your Apple Developer credentials:
   ```bash
   eas credentials
   ```

## Step 2: Update Configuration Files

### app.json
- ✅ Bundle Identifier: `com.transcendapp.meditation`
- ✅ Build Number: 1
- ✅ Privacy Permissions configured
- ⚠️ Update `extra.eas.projectId` with your actual project ID

### eas.json
- ⚠️ Update `submit.production.ios` with your Apple IDs:
  - `appleId`: Your Apple ID email
  - `ascAppId`: App Store Connect App ID (get from App Store Connect)
  - `appleTeamId`: Your Apple Developer Team ID

## Step 3: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: Transcend
   - **Primary Language**: English
   - **Bundle ID**: Select `com.transcendapp.meditation`
   - **SKU**: transcend-meditation-app
4. Save the App ID from the URL (format: 1234567890)

## Step 4: Build for TestFlight

1. **Build the app**:
   ```bash
   eas build --platform ios --profile production
   ```
   
   This will:
   - Bundle all assets (videos, audio, images)
   - Create an optimized iOS build
   - Upload to EAS servers
   - Takes ~15-30 minutes

2. **Submit to TestFlight**:
   ```bash
   eas submit --platform ios --latest
   ```
   
   Or manually:
   - Download the `.ipa` file from EAS dashboard
   - Upload via Transporter app or App Store Connect

## Step 5: TestFlight Setup

1. In App Store Connect, go to your app
2. Click "TestFlight" tab
3. Wait for build to process (~5-10 minutes)
4. Add test information:
   - **What to Test**: "Initial release - meditation breathing app"
   - **Test Notes**: Any specific areas to focus on

5. Add testers:
   - Internal testers (up to 100, immediate access)
   - External testers (up to 10,000, requires Apple review)

## Current App Configuration

### Features
- ✓ Box breathing meditation (4-4-4-4 pattern)
- ✓ Multiple environments (Ocean Waves, Forest Birdsong)
- ✓ Session tracking with calendar
- ✓ Profile customization
- ✓ Session screenshots and sharing
- ✓ Sound effects and haptics
- ✓ Glass morphism UI

### Assets Included
- App icon (1024x1024)
- Ocean waves video + audio
- Forest birdsong video + audio
- Breathing sound effects
- Om sound

### Permissions Required
- Camera (for profile picture)
- Photo Library (for profile picture)
- Audio (for background music)

## Build Size Estimate
- Videos: ~100 MB
- Audio files: ~15 MB
- Total app size: ~120-150 MB

## Troubleshooting

### Build fails with "Asset too large"
- Consider hosting videos remotely and streaming
- Or use lower resolution videos

### "Invalid Bundle Identifier"
- Ensure Bundle ID in app.json matches App Store Connect
- Make sure it's unique and follows reverse domain format

### Missing credentials
Run: `eas credentials` and follow prompts

### Build takes too long
- Normal build time: 15-30 minutes
- Check EAS dashboard for progress

## Post-Deployment

### Version Updates
1. Update `version` in app.json (e.g., "1.0.1")
2. Update `buildNumber` in app.json (e.g., "2")
3. Rebuild and resubmit

### Future Improvements
- Add more breathing techniques
- Cloud sync for session history
- Social features
- Guided meditations

## Support
- Expo Documentation: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- TestFlight: https://developer.apple.com/testflight/

---

**Ready to deploy!** 🚀
All necessary configurations are in place. Follow the steps above to push to TestFlight.

