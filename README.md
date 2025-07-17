## Healthcare Translation Web App with Generative AI

### Project Title: Healthcare Translation Web App with Generative AI
#### Objective
This web-based prototype enables real-time, multilingual translation between patients and healthcare providers. The application converts spoken input into text, provides a live transcript, and offers a translated version with audio playback. This project showcases technical proficiency, adaptability, and the efficient use of generative AI for rapid development.

#### Core Functionalities
**Real-time Voice-to-Text Transcription:** Converts spoken input into a text transcript using the browser's Web Speech API.

**Generative AI-Powered Translation:** Provides real-time translation of the transcribed text into a target language, leveraging the power of OpenAI's GPT-3.5 Turbo model. The AI is prompted to act as a "professional medical translator" to enhance accuracy for healthcare terminology.

**Audio Playback of Translated Text:** A "Read Translation" button allows users to listen to the translated text via the Web Speech Synthesis API.

**Dual Transcript Display:** Shows both the original spoken transcript and its translated version side-by-side (on desktop) or stacked (on mobile) for clear comparison.

**Language Selection:** Intuitive dropdown menus enable users to easily select both the input (source) and output (target) languages.

**Mobile-First Responsive Design:** The user interface is optimized for seamless experience across various devices, from mobile phones to desktops.

#### Technical Stack
**Frontend:**

HTML5: Structure of the web application.

CSS3: Styling and responsive design.

JavaScript (ES6+): Core application logic, DOM manipulation, and API interactions.

Web Speech API: For client-side speech recognition (voice-to-text) and speech synthesis (text-to-speech).

Backend (Serverless Function):

Node.js: Runtime environment for the serverless function.

OpenAI API: Utilized for generative AI-powered text translation (GPT-3.5 Turbo model).

**Deployment:**

Vercel: Platform used for deploying both the frontend web application and the backend serverless function.

Version Control:

Git & GitHub: For source code management and collaboration.

#### Setup & Deployment
Live Demo
The application is deployed and accessible live at:
https://healthcare-translator-psi.vercel.app/

#### Local Development
**To run the application locally:**

Clone the repository:

git clone <https://github.com/Noraxis-ai/healthcare-translator>
cd healthcare-translator

Backend Setup (Serverless Function):

Ensure your OpenAI API key is configured as an environment variable. Create a .env file in the root of your project (for local testing with Vercel CLI) with:

OPENAI_API_KEY=your_openai_secret_key_here

Note: For Vercel deployment, you must configure OPENAI_API_KEY directly in your Vercel project settings under "Environment Variables".

Install Vercel CLI (if not already installed):

npm install -g vercel

Run the development server:

vercel dev

This will start a local server, typically at http://localhost:3000, serving both your frontend and the api/translate.js function.

#### Deployment to Vercel
The project is configured for continuous deployment with Vercel.

**Link your project to Vercel:**

Sign up/Log in to Vercel.

Import your GitHub repository. Vercel will automatically detect the project structure.

Configure Environment Variables:

In your Vercel project settings, navigate to "Environment Variables".

Add a new variable with the name OPENAI_API_KEY and your OpenAI secret key as its value. Ensure the "Scopes" include "Production" and "Development".

#### Push to GitHub:

Any push to the main branch (or other configured branches) will automatically trigger a new deployment on Vercel.

#### Usage Guide
Access the App: Open the live link in your web browser.

Select Languages:

Choose your spoken language from the "Input Language" dropdown.

Select the language you want to translate to from the "Translate To" dropdown.

Start Speaking: Click the "🎙 Start Speaking" button. The button will change to "🔴 Stop Recording" and the "Original" text area will show "Listening...".

Speak Clearly: Speak into your microphone. As you speak, the "Original" text area will display your transcription.

Stop Speaking: Click the "🔴 Stop Recording" button when you are finished speaking.

View Translation: The "Translated" text area will then display the AI-generated translation. A "Translating..." indicator will appear during the process.

Listen to Translation: Click the "🔊 Read Translation" button to hear the translated text spoken aloud.

Error Messages: Any issues (e.g., microphone access, API errors) will be displayed in a message box at the top of the interface.

#### Security Considerations (Prototype)
**API Key Management:** The OpenAI API key is securely stored as an environment variable on Vercel's serverless platform, preventing its exposure in the client-side code. This is a crucial basic security measure.

**CORS Configuration:** The backend serverless function includes CORS (Cross-Origin Resource Sharing) headers to allow communication from the frontend, a standard web security practice.

**Data Handling:** For a production healthcare application, robust data encryption, strict access controls, and full compliance with patient privacy regulations (e.g., HIPAA) would be paramount. This prototype focuses on demonstrating core translation functionality.

#### Future Improvements
**Enhanced Medical Terminology Accuracy: Fine-tune the OpenAI prompt or explore domain-specific models/fine-tuning for even greater accuracy with complex medical jargon.**

Speaker Diarization: Differentiate between multiple speakers (patient vs. provider) in the transcript.

Conversation History: Implement a feature to maintain a history of the conversation (original and translated segments).

User Authentication: For real-world use, implement user authentication and authorization.

Offline Capability: Explore options for limited offline functionality.

Accessibility Enhancements: Further improve accessibility features beyond basic screen reader compatibility.

#### Contact
For any questions or feedback, please feel free to reach out.
