import os
import uuid
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai

# Initialize Flask app
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max upload size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# DIRECTLY SET API KEY INSTEAD OF USING .ENV
api_key = "API"
genai.configure(api_key=api_key)
print(f"API key set directly in code")

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and generate summary."""
    # Check if file is in the request
    if 'pdf_file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['pdf_file']
    
    # Check if file is selected
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check file extension
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are allowed'}), 400
    
    try:
        # Generate unique filename
        unique_filename = f"{uuid.uuid4().hex}.pdf"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save file temporarily
        file.save(file_path)
        
        # Get custom prompt if provided
        prompt = request.form.get('prompt', None)
        
        # Start async task for summarization
        return jsonify({
            'status': 'processing',
            'task_id': unique_filename,
            'message': 'File uploaded successfully. Processing...'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/summarize/<task_id>', methods=['GET'])
def summarize(task_id):
    """Generate summary for the uploaded PDF."""
    try:
        # Get file path
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], task_id)
        
        # Check if file exists
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        # Get prompt parameter (optional)
        prompt = request.args.get('prompt', None)
        
        # Default prompt if none provided
        if not prompt:
            prompt = """
            Please provide a comprehensive summary of the uploaded document with the following:
            1. Key points and main arguments
            2. Important findings or conclusions
            3. Methodology (if applicable)
            4. Organize the summary with clear sections
            """
        
        # Upload the PDF to Gemini API
        sample_file = genai.upload_file(path=file_path, display_name=task_id)
        
        # Initialize the model
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        
        # Generate the summary
        response = model.generate_content([sample_file, prompt])
        summary = response.text
        
        # Clean up - delete the temporary file
        os.remove(file_path)
        
        return jsonify({
            'status': 'success',
            'summary': summary
        })
    
    except Exception as e:
        # Clean up in case of error
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5003) 