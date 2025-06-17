# LifeHack25
Submission for LifeHack 2025 - Team GSquad (ID: 1)

# Release
1. Download the release build [Google Drive](https://drive.google.com/file/d/1PiPsECySvF4I5eS2S36robjHUnegmtzP/view?usp=sharing) [GitHub](https://github.com/Blerargh/LifeHack25/releases/download/v1.0/EcoLens.zip). If the link does not work, download the files directly from [Releases](https://github.com/Blerargh/LifeHack25/releases)

2. Go to `chrome://extensions/` and enable Developer Mode. An option to `Load Unpacked` should appear. 

![Image of `chrome://extensions/` header](image.png)

Extract and link the `EcoLens` folder and the extension is ready to be used on your browser.

# Development
1. Clone the GitHub repository
```bash
git clone https://github.com/Blerargh/LifeHack25.git
```
2. In the root folder, install the required dependencies
```bash
npm run setup
```
3. Add the Environment Variables for backend hosting in /backend/.env
``` bash
OPENROUTER_API_KEY = <Your Gemini API>
```
4. Run the development server
```bash
npm run dev
```
5. Go to `chrome://extensions/` and enable Developer Mode. An option to `Load Unpacked` should appear. 

![Image of `chrome://extensions/` header](image.png)

Link the `ecolens-extension/dist` folder and the extension is ready to be tested on your browser.
