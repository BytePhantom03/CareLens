git init
git config user.name "BytePhantom03"
git config user.email "bytephantom03@example.com"

git add package.json package-lock.json vite.config.js index.html .gitignore
git commit -m "init project with react and vite"

git add src/config/ src/utils/promptBuilder.js src/services/geminiClient.js
git commit -m "setup api integration and prompt builder"

git add src/data/
git commit -m "add falls policy rules and samples"

git add src/services/checker.js
git commit -m "implement core checking logic"

git add src/App.jsx src/App.css src/main.jsx
git commit -m "build ui components for note validation"

git add README.md decision-log.txt src/utils/export.js
git commit -m "add docs and export utility"

# Add anything else left over
git add .
git commit -m "final polish"

git branch -M main
git remote add origin https://github.com/BytePhantom03/CareLens.git
git push -u origin main
