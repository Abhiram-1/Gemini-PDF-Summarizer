# 📄 Gemini PDF Summarizer

A modern web application that uses Google's Gemini AI to generate comprehensive summaries of PDF documents.

## ✨ Features

- **AI-Powered Summaries**: Leverage Google's Gemini AI to generate high-quality document summaries
- **Drag & Drop Upload**: Easy PDF file uploading with a modern interface
- **Custom Instructions**: Provide specific guidelines for your summary needs
- **Export Options**: Copy to clipboard or download summaries as text files
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Processing**: Status updates during document analysis


## 🛠️ Technology Stack

- **Backend**: Python, Flask
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **AI**: Google Generative AI (Gemini)

## 🧠 Implementation Method

The application uses **Context-Augmented Generation (CAG)** methodology, which:
- Processes entire documents within Gemini's large context window
- Maintains document coherence without chunking
- Produces comprehensive summaries that capture the document's key information

## 📋 Prerequisites

- Python 3.8+
- Google Generative AI API key

## ⚙️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gemini-pdf-summarizer.git
   cd gemini-pdf-summarizer
   ```

2. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up your Gemini API key:
   ```bash
   # Option 1: Create a .env file
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   
   # Option 2: Modify app.py directly (for development only)
   # Find the line: api_key = "YOUR_API_KEY_HERE"
   ```

4. Run the application:
   ```bash
   python app.py
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5001
   ```

## 🔧 Project Structure

```
gemini-pdf-summarizer/
│
├── app.py                  # Flask application
├── requirements.txt        # Dependencies
├── .env                    # Environment variables (create this)
├── static/                 # Static files
│   ├── css/
│   │   └── style.css       # CSS styling
│   └── js/
│       └── script.js       # Frontend logic
├── templates/              # HTML templates
│   └── index.html          # Main page
└── uploads/                # Temporary PDF storage
```

## 📝 Usage

1. Upload a PDF document using the drag-and-drop interface
2. Optionally enter custom instructions for the summary
3. Click "Generate Summary" and wait for processing
4. View your summary and use the copy or download buttons as needed

## 🔒 Security Notes

- API keys should be kept secure and not committed to public repositories
- For production, always use environment variables for sensitive data
- Uploaded PDFs are temporarily stored and automatically deleted after processing

## 🔍 How It Works

1. User uploads a PDF through the web interface
2. Flask backend receives and temporarily stores the file
3. The PDF is sent to Google's Gemini API with summary instructions
4. Gemini processes the document and generates a comprehensive summary
5. The summary is returned to the user's browser for display
