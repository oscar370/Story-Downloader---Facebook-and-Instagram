# 📥 Story Downloader - Facebook & Instagram

🧩 A user script to download **stories (videos & images)** from Facebook and Instagram — supports both production and development modes!

---

## 🌐 For Users

👉 **Install directly from GreasyFork:**  
🔗 [https://greasyfork.org/en/scripts/507431-story-downloader-facebook-and-instagram](https://greasyfork.org/en/scripts/507431-story-downloader-facebook-and-instagram)

✔️ **Features**:

- Works on Facebook and Instagram web
- Downloads stories in one click
- Automatically detects videos and images
- Lightweight and open-source

---

## 🛠️ For Developers

Want to contribute or run it in development mode with live reloading?

### ⚙️ Requirements

- Node.js & npm
- Tampermonkey (or similar user script manager)
- A Chromium-based browser (Chrome, Edge, Brave, etc.)
- A text editor (e.g. VSCode)

---

### 📢 Important Tampermonkey Setup

✅ To use `file://` paths in development:

1. Go to your browser's **Extensions page**.
2. **Enable Developer Mode.**
3. Open the **Tampermonkey extension settings**.
4. Enable the option: **"Allow access to file URLs."**

> This is required for Tampermonkey to load the script directly from your local machine.

---

### 📦 Install dependencies

```bash
npm install
```

---

### 🧪 Development Mode

1. Set your desired output path in a .env file at the project root:

```env
DEV_REQUIRE_PATH=file:///[your-path]/dist/script.dev.user.js
```

> 📍 Use forward slashes / even on Windows.

2. Run the development watcher:

```bash
npm run dev
```

3. Create a dev userscript in Tampermonkey with the following header:

```js
// ==UserScript==
// @name         Story Downloader - Facebook and Instagram - Dev
// @namespace    https://github.com/oscar370
// @version      0.0.0
// @description  Download stories (videos and images) from Facebook and Instagram.
// @author       oscar370
// @match        *.facebook.com/*
// @match        *.instagram.com/*
// @grant        none
// @license      GPL3
// @require      file:///[your-path]/dist/script.dev.user.js
// ==/UserScript==
```

> 📍 Refresh your browser tab to reload changes after each build!

---

### 📤 Production Build

To build the optimized userscript for sharing:

```bash
npm run build
```

This generates:

```bash
dist/script.prod.user.js
```

You can upload this file to GitHub and link it on GreasyFork.

---

### 📁 Project Structure

```bash
.
├── dist/
│   ├── script.dev.user.js
│   └── script.prod.user.js
├── src/
│   └── main.ts
├── .env
├── build-dev-watch.js
├── build-prod.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🤝 Contributing

Pull requests, issues, and suggestions are welcome!
Just make sure to describe the change clearly and follow the coding style.

---

## Happy downloading! 🎉
