# Transcend React Native App

A React Native Expo app featuring a beautiful splash screen with the Transcend logo and a smooth image sequence animation.

## Features

- **Splash Screen**: Clean splash screen with "TRANSCEND" logo text
- **Image Sequence Animation**: Smooth 300-frame animation (000.png to 299.png) playing at 30 FPS
- **Centered Layout**: Animation container centered on screen
- **Loop Animation**: Animation continuously loops for seamless viewing

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npm start
   ```

3. Run on your preferred platform:
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

## Project Structure

```
transcend/
├── App.js                 # Main app component
├── assets/
│   ├── images/
│   │   └── bloom/        # Image sequence (000.png - 299.png)
│   ├── icon.png          # App icon
│   ├── splash.png        # Splash screen image
│   └── adaptive-icon.png # Android adaptive icon
├── package.json
├── app.json              # Expo configuration
└── babel.config.js
```

## Animation Details

- **Total Frames**: 300 images (000.png to 299.png)
- **Frame Rate**: 30 FPS
- **Loop**: Continuous loop
- **Container**: 80% screen width, 60% screen height
- **Position**: Centered on screen

## Customization

To modify the animation:
- Change `fps` variable in `App.js` to adjust frame rate
- Modify `totalFrames` to use different number of images
- Adjust container dimensions in `styles.animationContainer`
- Change splash screen duration by modifying the timeout in `useEffect`

## Requirements

- Node.js
- Expo CLI
- Expo Go app (for testing on device)
- iOS Simulator or Android Emulator (for testing on simulator)
