# Text Reader 🎙️

A modern and responsive web application that converts text to speech, allowing users to hear any text aloud with full control over playback speed.

## ✨ Features

- **Text-to-Speech**: Convert any text to audio using the browser's native Web Speech API
- **Speed Control**: Adjust playback speed from 0.5x to 2.0x using a desktop slider or a mobile-friendly drop-down
- **Modern Interface**: Clean and responsive design with attractive visual gradient
- **Data Persistence**: Save text in the browser for later access
- **Play and Stop**: Full control over playback with intuitive buttons
- **Brazilian Portuguese Support**: Automatic detection and selection of pt-BR voices when available
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices, with a full-width layout and tighter spacing on
  small screens for better readability
- **Mobile-friendly Controls**: Buttons and slider reorganize on viewports up to 360 px without overflowing the container

## 🎨 Branding

- The official application logo is available at [`public/assets/logo.svg`](public/assets/logo.svg) and is used as the in-app badge and site favicon.

## 🚀 How to Use

1. Open the application in your browser
2. Type or paste the text you want to hear in the text field
3. Click the **Play** button (▶) to start reading
4. Use the slider (desktop/tablet) or the drop-down select (mobile) to adjust the playback speed (0.5x to 2.0x)
5. Click the **Stop** button (⏹) to stop playback
6. Click the **Save** button (💾) to save the text in your browser

## 📋 Requirements

- Modern browser with Web Speech API support
- JavaScript enabled

## 🛠️ Technologies Used

- **HTML5**: Semantic structure
- **CSS3**: Styles with backdrop-filter and gradient support
- **TypeScript (ESM)**: Application logic compiled for modern browsers
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework (installed via npm)
- **PostCSS**: CSS processing and transformation
- **Inline SVG Icons**: Icons embedded directly in the markup (no external dependencies)
- **Web Speech API**: Native browser speech synthesis
- **Jest**: Unit testing framework
- **Playwright**: End-to-end testing framework

## 📦 Dependencies

This project uses modern build tools and development dependencies. For end users, no installation is required - the application runs directly in the browser.

### Development Dependencies

- **Vite**: Build tool and development server
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Jest**: Unit testing framework
- **Playwright**: End-to-end testing framework

## 📈 Analytics & Privacy

- Google Analytics (GA4) and Google Tag Manager now load from the deferred [`analytics.js`](public/analytics.js) file instead of inline snippets.
- The script waits for `requestIdleCallback` or the first user interaction (click, key press, pointer/touch) before injecting GA/GTM assets, freeing the critical rendering path while keeping telemetry intact.
- The GTM `<noscript>` iframe remains in the `<body>` to preserve baseline tracking for users without JavaScript.
- If your deployment requires explicit consent, set `window.APP_ANALYTICS_AUTO_START = false` in a script that runs before `analytics.js` and call `window.appAnalytics.init()` once consent is granted (or `window.appAnalytics.enableAutoStart()` to re-enable the deferred behaviour).
- After deploying, validate that GA/GTM receive events (e.g., GTM preview mode or GA real-time dashboard) and rerun the PageSpeed Insights test to compare results with the previous baseline.

## 💾 Local Storage

The application saves text in the browser's `localStorage`, allowing you to easily retrieve your content on future visits.

## 📊 PageSpeed Insights

- **Última medição (2025-11-12)**: tentativa de execução via PageSpeed Insights bloqueada pelo ambiente (resposta HTTP 403). Recomendamos repetir o teste em um ambiente conectado para capturar métricas atualizadas após a remoção dos ícones externos.

## 🎯 Available Voices

The application automatically tries to select a Brazilian Portuguese (pt-BR) voice if available on your system. If no pt-BR voice is found, the browser will use the system's default voice.

## 🌐 Supported Browsers

- ✅ Chrome/Chromium (version 25+)
- ✅ Firefox (version 49+)
- ✅ Safari (version 14.1+)
- ✅ Edge (version 79+)
- ⚠️ Opera (with partial support)

## 🧑‍💻 Development

### Requirements

- **Node.js >= 22 < 23**
- **Yarn 4.10** (via Corepack)

### Setup

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start development server:
   ```bash
   yarn dev
   ```
   The application will be available at `http://localhost:5173`

### Available Scripts

- `yarn dev` - Start Vite development server
- `yarn build` - Build production assets (compiles TypeScript and processes CSS with Vite)
- `yarn preview` - Preview the production build locally
- `yarn test` - Run all tests (unit and e2e)
- `yarn test:unit` - Run unit tests with Jest (uses JSDOM environment)
- `yarn test:e2e` - Run end-to-end tests with Playwright
- `yarn test:e2e:ui` - Run Playwright tests with UI mode

### Project Structure

```
src/
├── app/          # Main application logic
├── core/         # Business logic (e.g., rate calculations)
├── utils/        # Utility functions (e.g., storage helpers)
├── styles/       # CSS styles
└── main.ts       # Application entry point
```

## 📝 Notes

- Voice quality depends on the voices available on your operating system
- Some browsers may have limitations on text length for speech synthesis
- Playback speed may vary depending on the browser and operating system
- Icons are rendered inline as SVG, eliminating external dependencies
- The fixed footer now expands to the full viewport width on small screens, keeping calls to action easy to tap on mobile devices

## 💖 Donation Modal

- The PIX donation QR code now lives at [`assets/qr-code.svg`](assets/qr-code.svg) and is only requested when the donation modal opens for the first time via a lazily loaded `<img>` tag, keeping the initial HTML payload lean.
- A lightweight placeholder with fixed dimensions (`192x192`) prevents layout shifts before the QR code loads.
- The modal was validated on mobile viewports (Chrome DevTools responsive mode) to ensure the QR code loads and remains accessible on touch devices.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

Carlos Henrique Bernardes

## 🤝 Contributions

Contributions are welcome! Feel free to open issues or pull requests for improvements and bug fixes.

## 💡 Usage Tips

- Use slower speeds (0.5x - 1.0x) for better comprehension
- Use faster speeds (1.5x - 2.0x) for quick review
- Save frequently used texts for quick access
- Test different voices on your system to find the one that works best

## 🐛 Troubleshooting

### Voice is not working
- Check that JavaScript is enabled in your browser
- Try reloading the page
- Make sure your browser has permission to use speech synthesis

### Save button is disabled
- The Save button only becomes enabled after starting playback
- Check that there is available space in your browser's local storage

### Text is not read completely
- Some browsers have a text length limit for speech synthesis
- Try dividing the text into smaller parts

---

**Enjoy the Text Reader! 🎉**
