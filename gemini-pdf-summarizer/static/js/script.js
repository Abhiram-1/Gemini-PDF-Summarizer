document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const uploadForm = document.getElementById("upload-form");
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("pdf_file");
  const fileName = document.getElementById("file-name");
  const submitBtn = document.getElementById("submit-btn");
  const loadingSection = document.getElementById("loading-section");
  const resultSection = document.getElementById("result-section");
  const errorSection = document.getElementById("error-section");
  const statusMessage = document.getElementById("status-message");
  const summaryContent = document.getElementById("summary-content");
  const errorMessage = document.getElementById("error-message");
  const copyBtn = document.getElementById("copy-btn");
  const downloadBtn = document.getElementById("download-btn");
  const tryAgainBtn = document.getElementById("try-again-btn");

  // File Upload Handling with Drag and Drop
  dropZone.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    if (fileInput.files.length) {
      updateFileName(fileInput.files[0].name);
      dropZone.classList.add("highlight");
    } else {
      fileName.textContent = "";
      dropZone.classList.remove("highlight");
    }
  });

  // Drag and drop events
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(
      eventName,
      () => {
        dropZone.classList.add("highlight");
      },
      false
    );
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(
      eventName,
      () => {
        dropZone.classList.remove("highlight");
      },
      false
    );
  });

  dropZone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length && files[0].type === "application/pdf") {
      fileInput.files = files;
      updateFileName(files[0].name);
    } else if (files.length) {
      showError("Please upload a PDF file.");
    }
  });

  function updateFileName(name) {
    fileName.textContent = name;
  }

  // Form submission
  uploadForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!fileInput.files.length) {
      showError("Please select a PDF file to upload.");
      return;
    }

    // Get form data
    const formData = new FormData(uploadForm);

    // Show loading section
    submitBtn.disabled = true;
    resetSections();
    loadingSection.style.display = "block";
    statusMessage.textContent = "Uploading your PDF...";

    // Animate dots for loading message
    startLoadingAnimation();

    // Send upload request
    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          showError(data.error);
          return;
        }

        // Start polling for results
        statusMessage.textContent =
          "Our AI is analyzing your PDF and generating a comprehensive summary";

        // Get task ID from response
        const taskId = data.task_id;
        const promptValue = formData.get("prompt") || "";

        // Poll for results
        pollForResults(taskId, promptValue);
      })
      .catch((error) => {
        showError("Failed to upload file: " + error.message);
      });
  });

  // Loading animation with dots
  function startLoadingAnimation() {
    let dots = "";
    const loadingInterval = setInterval(() => {
      dots = dots.length < 3 ? dots + "." : "";
      const baseText =
        "Our AI is analyzing your PDF and generating a comprehensive summary";
      statusMessage.textContent = baseText + dots;
    }, 500);

    // Store the interval ID on the window to clear it later
    window.loadingInterval = loadingInterval;
  }

  function stopLoadingAnimation() {
    if (window.loadingInterval) {
      clearInterval(window.loadingInterval);
    }
  }

  // Poll for results
  function pollForResults(taskId, prompt) {
    // Construct URL with optional prompt parameter
    let url = `/summarize/${taskId}`;
    if (prompt) {
      url += `?prompt=${encodeURIComponent(prompt)}`;
    }

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        stopLoadingAnimation();

        if (data.error) {
          showError(data.error);
          return;
        }

        // Show summary
        summaryContent.innerHTML = formatSummary(data.summary);
        loadingSection.style.display = "none";
        resultSection.style.display = "block";
        submitBtn.disabled = false;

        // Scroll to results
        resultSection.scrollIntoView({ behavior: "smooth" });
      })
      .catch((error) => {
        stopLoadingAnimation();
        showError("Failed to generate summary: " + error.message);
      });
  }

  // Format summary with Markdown-like parsing
  function formatSummary(text) {
    if (!text) return "";

    // Clean up the text
    text = text.trim();

    // Basic Markdown-like formatting
    return (
      text
        // Convert headers
        .replace(/^#\s+(.*?)$/gm, "<h2>$1</h2>")
        .replace(/^##\s+(.*?)$/gm, "<h3>$1</h3>")
        .replace(/^###\s+(.*?)$/gm, "<h4>$1</h4>")
        // Convert bold
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Convert italics
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // Convert lists
        .replace(/^\s*-\s+(.*?)$/gm, "<li>$1</li>")
        .replace(/^\s*\d+\.\s+(.*?)$/gm, "<li>$1</li>")
        // Wrap paragraphs (text that doesn't start with < and contains content)
        .replace(/^([^<\n][^\n]*?)$/gm, "<p>$1</p>")
        // Clean up empty paragraphs
        .replace(/<p>\s*<\/p>/g, "")
        // Wrap list items in ul/ol tags
        .replace(/(<li>.*?<\/li>\n)+/g, "<ul>$&</ul>")
        // Fix any double-wrapped paragraphs
        .replace(/<p><p>(.*?)<\/p><\/p>/g, "<p>$1</p>")
        // Add space after paragraphs for better readability
        .replace(/<\/p>/g, "</p>\n")
    );
  }

  // Show error message
  function showError(message) {
    stopLoadingAnimation();
    errorMessage.textContent = message;
    resetSections();
    errorSection.style.display = "block";
    submitBtn.disabled = false;
  }

  // Reset all sections
  function resetSections() {
    loadingSection.style.display = "none";
    resultSection.style.display = "none";
    errorSection.style.display = "none";
  }

  // Copy summary to clipboard
  copyBtn.addEventListener("click", function () {
    const summaryText = summaryContent.innerText || summaryContent.textContent;

    navigator.clipboard
      .writeText(summaryText)
      .then(() => {
        copyBtn.innerHTML = '<i class="fas fa-check me-1"></i> Copied!';
        copyBtn.classList.add("copied");

        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy me-1"></i> Copy';
          copyBtn.classList.remove("copied");
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy to clipboard. Please try again.");
      });
  });

  // Download summary as text file
  downloadBtn.addEventListener("click", function () {
    const summaryText = summaryContent.innerText || summaryContent.textContent;
    const blob = new Blob([summaryText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Try again button
  tryAgainBtn.addEventListener("click", function () {
    resetSections();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
});
