# LifeHack25
Submission for LifeHack 2025 - Team GSquad (ID: 1)

# Development
Below are the steps to create a local development server

1. Clone the GitHub repository
```bash
git clone https://github.com/Blerargh/LifeHack25.git
```
2. In the `ecolens` folder, install the required dependencies
```bash
cd ecolens
npm i
```
3. Prepare the deployment build
```bash
npm run build
```
4. Go to `chrome://extensions/` and enable Developer Mode

An option to `Load Unpacked` should appear. 

![Image of `chrome://extensions/` header](image.png)

Link the build folder and the extension is ready to be deployed!

Note to developers: The extension needs to be reloaded whenever changes are made to reflect any changes to the popup