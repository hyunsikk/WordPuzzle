# Publishing Checklist - Vocab Bubbles by AM Studio

## Prerequisites

- [ ] Apple Developer account approved ($99/year) - https://developer.apple.com/programs/enroll/
- [ ] Expo account created - https://expo.dev/signup

## Step 1: Install & Login to EAS

```bash
cd mobile
npm install -g eas-cli
eas login
```

## Step 2: Initialize EAS Project

```bash
eas init
```

This will:
- Create a project on Expo servers
- Generate a project ID
- Update app.json automatically

## Step 3: Update Configuration

After `eas init`, update `eas.json` with your Apple credentials:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your@email.com",
      "ascAppId": "from App Store Connect",
      "appleTeamId": "from Apple Developer Portal"
    }
  }
}
```

**Where to find these:**
- `appleId`: Your Apple ID email
- `appleTeamId`: https://developer.apple.com/account → Membership → Team ID
- `ascAppId`: Create app in App Store Connect first, then find the Apple ID in App Information

## Step 4: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Platform: iOS
   - Name: Vocab Bubbles
   - Primary Language: English (US)
   - Bundle ID: com.amstudio.vocabbubbles
   - SKU: vocabbubbles-amstudio-001

## Step 5: Build for iOS

```bash
eas build --platform ios --profile production
```

- First build will prompt for Apple credentials
- EAS handles code signing automatically
- Build takes ~15-30 minutes
- You'll get a URL to track progress

## Step 6: Submit to App Store

```bash
eas submit --platform ios --latest
```

Or submit a specific build:
```bash
eas submit --platform ios --id BUILD_ID
```

## Step 7: Complete App Store Connect

After submission, go to App Store Connect to:

1. **Version Information**
   - Add screenshots (see STORE_LISTING.md for sizes)
   - Enter description from STORE_LISTING.md
   - Add keywords
   - Set "What's New" text

2. **App Information**
   - Category: Games > Word
   - Age Rating: 12+ (answer questionnaire)
   - Privacy Policy URL (required)

3. **Pricing**
   - Set to Free

4. **Submit for Review**
   - Click "Submit for Review"
   - Answer export compliance (select "No" - no encryption)
   - Answer content rights (select "Yes" - you own all content)

## Step 8: Wait for Review

- Typical review: 24-48 hours
- You'll receive email when approved or if issues found

## Quick Commands Reference

```bash
# Check build status
eas build:list

# Build for testing (internal distribution)
eas build --platform ios --profile preview

# View submission status
eas submit:list
```

## Troubleshooting

**"Bundle ID already exists"**
- Someone else registered it. Change in app.json to something unique.

**"Missing compliance information"**
- Add `ITSAppUsesNonExemptEncryption: false` to ios.infoPlist (already done)

**"Provisioning profile issues"**
- Run `eas credentials` to manage or reset credentials

## Support

- Expo EAS Docs: https://docs.expo.dev/build/introduction/
- App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
