// Constants
const LANGUAGES = [
    { code: "en-US", name: "English (US)", outputCode: "en" },
    { code: "es-ES", name: "Español (Spain)", outputCode: "es" },
    { code: "fr-FR", name: "Français", outputCode: "fr" },
    { code: "ht-HT", name: "Kreyòl Ayisyen", outputCode: "ht" }, // Example: Haitian Creole
    { code: "pt-BR", name: "Português (Brasil)", outputCode: "pt" },
    { code: "ar-SA", name: "Arabic (Saudi Arabia)", outputCode: "ar" },
    { code: "ru-RU", name: "Russian (Russia)", outputCode: "ru" },
    { code: "zh-CN", name: "Chinese (Mandarin, Simplified)", outputCode: "zh" },
    { code: "de-DE", name: "German (Germany)", outputCode: "de" },
    { code: "ja-JP", name: "Japanese (Japan)", outputCode: "ja" }
];

// DOM Elements - cached for performance
const elements = {
    inputSelect: null,
    outputSelect: null,
    startBtn: null,
    originalText: null,
    translatedText: null,
    speakBtn: null,
    messageBox: null, // New element for messages
    translationLoading: null // New element for loading indicator
};

// State management
let recognition = null;
let isRecording = false;
let currentTranscript = ''; // Store the latest full transcript

// Initialize the application
function init() {
    cacheElements();
    checkBrowserSupport(); // Check support early
    populateLanguageSelects();
    attachEventListeners();
    // Set initial default languages
    elements.inputSelect.value = "en-US";
    elements.outputSelect.value = "es";
}

// Cache DOM elements
function cacheElements() {
    elements.inputSelect = document.getElementById("inputLang");
    elements.outputSelect = document.getElementById("outputLang");
    elements.startBtn = document.getElementById("startRecording");
    elements.originalText = document.getElementById("originalText");
    elements.translatedText = document.getElementById("translatedText");
    elements.speakBtn = document.getElementById("speakTranslation");
    elements.messageBox = document.getElementById("messageBox");
    elements.translationLoading = document.getElementById("translationLoading");

    // Basic check to ensure elements are found
    if (!elements.inputSelect || !elements.outputSelect || !elements.startBtn || !elements.originalText || !elements.translatedText || !elements.speakBtn || !elements.messageBox || !elements.translationLoading) {
        console.error("One or more required DOM elements were not found. Check your HTML IDs.");
        showError("Application failed to initialize. Please check console for details.");
        // Disable buttons if critical elements are missing
        elements.startBtn.disabled = true;
        elements.speakBtn.disabled = true;
    }
}

// Check browser support
function checkBrowserSupport() {
    let supportMessages = [];

    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        supportMessages.push("Speech recognition is not fully supported in this browser. Please use Chrome or Edge for full functionality.");
        elements.startBtn.disabled = true;
    }

    if (!('speechSynthesis' in window)) {
        supportMessages.push("Speech synthesis (text-to-speech) is not supported in this browser.");
        elements.speakBtn.disabled = true;
    }

    if (supportMessages.length > 0) {
        showError(supportMessages.join(" "));
    }
}

// Populate language select dropdowns
function populateLanguageSelects() {
    // Ensure elements are cached before populating
    if (!elements.inputSelect || !elements.outputSelect) {
        console.error("Language select elements not available for population.");
        return;
    }

    const inputFragment = document.createDocumentFragment();
    const outputFragment = document.createDocumentFragment();

    LANGUAGES.forEach(lang => {
        const inputOption = createOption(lang.code, lang.name);
        inputFragment.appendChild(inputOption);

        const outputOption = createOption(lang.outputCode, lang.name);
        outputFragment.appendChild(outputOption);
    });

    elements.inputSelect.appendChild(inputFragment);
    elements.outputSelect.appendChild(outputFragment);

    console.log("Language select dropdowns populated.");
}

// Helper function to create option elements
function createOption(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    return option;
}

// Attach event listeners
function attachEventListeners() {
    elements.startBtn?.addEventListener("click", handleRecordingToggle);
    elements.speakBtn?.addEventListener("click", handleSpeakTranslation);

    // Add change listeners for language selection
    elements.inputSelect?.addEventListener("change", () => {
        showMessage("Input language changed to " + elements.inputSelect.options[elements.inputSelect.selectedIndex].text, "info");
        // No immediate action needed for input language change, it will apply on next recording
    });

    elements.outputSelect?.addEventListener("change", async () => {
        showMessage("Output language changed to " + elements.outputSelect.options[elements.outputSelect.selectedIndex].text, "info");
        // If there's an existing transcript, re-translate it
        if (currentTranscript && !isRecording) {
            elements.translatedText.textContent = "Re-translating...";
            await translateText(currentTranscript);
        }
    });

    console.log("Event listeners attached.");
}

// Handle recording toggle
function handleRecordingToggle() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

// Start speech recognition
function startRecording() {
    showError(""); // Clear any previous errors
    elements.originalText.textContent = "Listening...";
    elements.translatedText.textContent = "Waiting for speech...";
    currentTranscript = ''; // Clear previous transcript

    try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();

        recognition.lang = elements.inputSelect.value;
        recognition.interimResults = true; // Get interim results for live display
        recognition.maxAlternatives = 1;
        recognition.continuous = true; // Keep listening

        recognition.onstart = () => {
            isRecording = true;
            updateRecordingUI(true);
            showMessage("Microphone active. Start speaking.", "info");
        };

        recognition.onresult = handleSpeechResult;
        recognition.onerror = handleSpeechError;
        recognition.onend = () => {
            isRecording = false;
            updateRecordingUI(false);
            showMessage("Microphone stopped.", "info");
            // If there's a final transcript, ensure translation is triggered
            if (currentTranscript) {
                translateText(currentTranscript);
            } else {
                elements.originalText.textContent = "No speech detected.";
                elements.translatedText.textContent = "No translation.";
            }
        };

        recognition.start();
    } catch (error) {
        console.error("Failed to start speech recognition:", error);
        showError("Failed to start speech recognition. Please ensure microphone access is granted and try again.");
        isRecording = false;
        updateRecordingUI(false);
    }
}

// Stop speech recognition
function stopRecording() {
    if (recognition && isRecording) {
        recognition.stop();
        isRecording = false; // Ensure state is updated immediately
        updateRecordingUI(false);
    }
}

// Handle speech recognition result
async function handleSpeechResult(event) {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
        } else {
            interimTranscript += transcriptPart;
        }
    }

    // Display interim results live
    elements.originalText.textContent = finalTranscript || interimTranscript || "Listening...";

    if (finalTranscript) {
        currentTranscript = finalTranscript; // Store the final transcript
        elements.translatedText.textContent = "Translating...";
        showTranslationLoading(true);
        try {
            const translated = await translateText(finalTranscript);
            elements.translatedText.textContent = translated;
        } catch (error) {
            console.error("Translation error during result handling:", error);
            showError("Translation failed for this segment.");
            elements.translatedText.textContent = "Translation failed";
        } finally {
            showTranslationLoading(false);
        }
    }
}

// Handle speech recognition errors
function handleSpeechError(event) {
    console.error("Speech recognition error:", event.error);
    isRecording = false;
    updateRecordingUI(false);

    let errorMessage = "Speech recognition failed. ";
    switch (event.error) {
        case 'no-speech':
            errorMessage += "No speech detected. Please try speaking clearly.";
            break;
        case 'network':
            errorMessage += "Network error. Check your internet connection.";
            break;
        case 'not-allowed':
            errorMessage += "Microphone access denied. Please allow microphone access in your browser settings.";
            break;
        case 'aborted':
            errorMessage += "Speech recognition was aborted.";
            break;
        case 'language-not-supported':
            errorMessage += "The selected input language is not supported by your browser's speech recognition.";
            break;
        default:
            errorMessage += `Error: ${event.error}. Please try again.`;
    }
    showError(errorMessage);
    elements.originalText.textContent = "Error during speech recognition.";
    elements.translatedText.textContent = "No translation available.";
}

// Update recording UI
function updateRecordingUI(recording) {
    elements.startBtn.textContent = recording ? "🔴 Stop Recording" : "🎙 Start Speaking";
    elements.startBtn.classList.toggle("recording", recording); // Add/remove a class for styling
}

// Translate text using your backend API (e.g., /api/translate)
async function translateText(inputText) {
    if (!inputText.trim()) {
        showError("No text to translate.");
        return "No text to translate.";
    }

    const outputLangCode = elements.outputSelect.value; // Get the output language code (e.g., 'es')
    const sourceLangCode = elements.inputSelect.value; // Get the full source language code (e.g., 'en-US')

    // Find the full language names from the LANGUAGES array for the prompt
    const sourceLangName = LANGUAGES.find(lang => lang.code === sourceLangCode)?.name || sourceLangCode;
    const targetLangName = LANGUAGES.find(lang => lang.outputCode === outputLangCode)?.name || outputLangCode;


    showTranslationLoading(true);
    try {
        // IMPORTANT: This assumes you have a backend endpoint at /api/translate
        // that handles the actual call to the Generative AI (e.g., Gemini API).
        // If you don't have this, you'll need to implement it on your server.
        const response = await fetch("/api/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputText: inputText,
                // Sending the output language code as 'outputLang' to match backend's expected parameter
                outputLang: outputLangCode, // Changed from outputCode to outputLang
                languageName: targetLangName // This is the full target language name for the AI prompt
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
        if (!data.translation) {
            throw new Error("Translation response was empty or malformed.");
        }
        return data.translation;
    } catch (error) {
        console.error("Translation API error:", error);
        showError(`Translation service unavailable: ${error.message}`);
        return "Translation failed.";
    } finally {
        showTranslationLoading(false);
    }
}

// Handle text-to-speech
function handleSpeakTranslation() {
    const text = elements.translatedText.textContent;

    if (!text || text === "Translation failed" || text === "Translating..." || text === "Translation will appear here...") {
        showError("No valid translation available to speak.");
        return;
    }

    try {
        // Stop any ongoing speech
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = elements.outputSelect.value; // Use the outputCode for speech synthesis
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1; // Normal pitch

        utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event.error);
            showError("Speech synthesis failed. Please try again.");
        };

        speechSynthesis.speak(utterance);
    } catch (error) {
        console.error("Speech synthesis error:", error);
        showError("Speech synthesis failed. " + error.message);
    }
}

// Show error messages in the UI
function showError(message) {
    if (elements.messageBox) {
        elements.messageBox.textContent = message;
        elements.messageBox.classList.add("show");
        elements.messageBox.style.backgroundColor = '#fee2e2'; // Red-100
        elements.messageBox.style.borderColor = '#fca5a5'; // Red-400
        elements.messageBox.style.color = '#b91c1c'; // Red-700
    } else {
        console.error("Error message box not found:", message);
    }
}

// Show general info messages in the UI
function showMessage(message, type = "info") {
    if (elements.messageBox) {
        elements.messageBox.textContent = message;
        elements.messageBox.classList.add("show");
        // Set colors based on message type
        if (type === "info") {
            elements.messageBox.style.backgroundColor = '#e0f2fe'; // Blue-100
            elements.messageBox.style.borderColor = '#93c5fd'; // Blue-300
            elements.messageBox.style.color = '#1e40af'; // Blue-800
        }
        // Hide after a few seconds
        setTimeout(() => {
            elements.messageBox.classList.remove("show");
        }, 5000);
    }
}

// Show/hide translation loading indicator
function showTranslationLoading(show) {
    if (elements.translationLoading) {
        elements.translationLoading.style.display = show ? 'block' : 'none';
        elements.translatedText.style.display = show ? 'none' : 'block'; // Hide text when loading
    }
}


// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Trigger Vercel deployment after updating environment variables

