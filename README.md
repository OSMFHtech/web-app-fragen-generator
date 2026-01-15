# QuestionForge - AI Question Generator for Moodle

An intelligent web application for **automated generation of Moodle-compatible question banks** using Large Language Models (LLMs).

---

## 🚀 Quick Start (Windows)

### **Easiest Way: One-Click Launcher**
1. Navigate to the project folder
2. **Double-click `start-app.bat`**
3. Wait 1-2 minutes for the build and server startup
4. The app automatically opens at `http://localhost:3000`

### **Requirements**
- ✅ [Node.js LTS](https://nodejs.org/) installed
- ✅ Internet connection (for LLM API)
- ✅ Modern browser (Chrome, Firefox, Edge)

---

## 📖 How to Use

### **1. Configure Your Settings**
- **Topic**: What subject are the questions about? (e.g., "Python Programming")
- **Language**: Deutsch (DE) or English (EN)
- **Question Type**: Multiple Choice or CodeRunner
- **Difficulty**: Easy / Medium / Hard
- **Number of Questions**: How many to generate?
- **Batch Size**: Questions per API call (3-5 recommended)

### **2. Generate Questions**
- Click **"Generate"** button
- Watch the progress indicator
- Each batch takes 30-60 seconds

### **3. Review & Approve**
- ✅ **Accept**: Question is good
- ❌ **Reject**: Remove question
- ✏️ **Edit**: Modify question text
- 🔄 **Regenerate**: Get an alternative

### **4. Validate & Export**
- Check the **"Checks"** section for validation warnings
- Fix any errors (marked with ❌)
- Click **"Export"** to download `questions.xml`

### **5. Import into Moodle**
1. Open your Moodle course
2. Go to **Question Bank**
3. Click **Import**
4. Select format: **Moodle XML**
5. Upload your `questions.xml`
6. Done! 🎉

---

## 📁 Project Structure

| File/Folder | Purpose |
|------------|---------|
| `app/page.js` | Landing page |
| `app/generator/page.js` | Main question generator UI |
| `app/about/page.js` | Project information |
| `app/contact/page.js` | Contact form |
| `app/api/generate/route.js` | AI question generation API |
| `app/api/regenerate/route.js` | Single question regeneration |
| `app/api/check-answer/route.js` | Answer verification API |
| `lib/moodleXml.js` | XML export formatter |
| `lib/translations.js` | EN/DE language strings |
| `docs/` | Full documentation (German & English) |

---

## ⚙️ Setup Instructions

### **For Developers**

```bash
# Clone or navigate to project
cd web-app fragen_generator

# Install dependencies
npm install

# Configure environment
# Copy .env.example to .env.local and add your API key
cp .env.example .env.local

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### **Environment Variables (.env.local)**

```bash
# Required: Your OpenRouter API key
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Optional: LLM model (default: gpt-4o-mini)
LLM_MODEL=gpt-4o-mini

# Optional: Email for contact form
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 🎯 Key Features

✨ **Smart AI Integration**
- Batch-based generation prevents context loss
- Multiple API calls for larger question banks
- Intelligent fallback on failures

🔍 **Quality Assurance**
- Human-in-the-loop review workflow
- Validation checks before export
- Support for multiple question types

📊 **Supported Question Types**
- Multiple Choice (single/multiple correct)
- CodeRunner (programming exercises)
- Select-and-Drag (matching exercises)
- List Options (definition matching)

🌍 **Multilingual**
- German (Deutsch) and English fully supported
- Auto-translates UI based on selection

📤 **Moodle Integration**
- Direct XML export compatible with Moodle
- Preserves question metadata
- Seamless import workflow

---

## 📚 Documentation

- **[Benutzerhandbuch.md](docs/Benutzerhanbuch.md)** - Complete German user guide
- **[Softwarearchitektur.md](docs/Softwarearchitektur.md)** - Technical architecture (German)

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14+, React 18+, CSS3 |
| **Backend** | Node.js (Next.js API Routes) |
| **AI** | OpenRouter API (LLM integration) |
| **State** | React Context API |
| **Export** | JavaScript + XML |
| **Styling** | Custom CSS with animations |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Node.js not found" | Install from https://nodejs.org/ (LTS version) |
| "Port 3000 in use" | Close other apps or restart Windows |
| "API Key invalid" | Check `.env.local` configuration |
| "Build fails" | Run `npm install` again, then `npm run build` |
| "No questions generated" | Check API key, try smaller batch size |

---

## 📞 Contact & Support

- **Project Supervisor**: Christoph Redl (redlch@technikum-wien.at)
- **Organization**: FH Technikum Wien
- **Department**: KF Artificial Intelligence & Data Analytics

---

## 📝 License

Developed for educational purposes at FH Technikum Wien.

---

**Version**: 1.0 | **Updated**: January 2026 | **Status**: Production Ready ✅







