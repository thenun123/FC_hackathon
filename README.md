# ✋ ASL Translator

**Live Demo:** [https://asltranslator-taupe.vercel.app/](https://asltranslator-taupe.vercel.app/)

A real-time, browser-native American Sign Language (ASL) fingerspelling translator built for the FC Hackathon. This application leverages advanced client-side machine learning to detect and translate ASL signs directly in the browser—with **zero backend**, **zero API costs**, and maximum privacy.

## ✨ Features

- **Real-Time Translation:** Uses your webcam to instantly recognize ASL fingerspelling (A-Z) in real-time.
- **100% Browser-Side AI:** Powered by MediaPipe for hand tracking and a custom heuristic classifier. No video data is ever sent to a server.
- **Word & Sentence Builder:** Automatically concatenates recognized letters into words and sentences.
- **Space & Delete Gestures:** Special gestures (`SPACE` and `DEL`) for fluid typing without touching the keyboard.
- **Voice Input (Speech-to-ASL):** A powerful accessibility feature where hearing individuals can speak into the microphone, and the app displays the corresponding ASL signs letter-by-letter to help deaf individuals understand or learn.
- **ASL Dictionary:** A comprehensive reference guide for all letters and special gestures, complete with real training dataset images and practice modes.
- **Learn Mode:** Interactive practice sessions to master the alphabet with real-time feedback.
- **Statistics & Tracking:** Tracks your daily streak, total signs practiced, and per-letter accuracy to gamify the learning experience.
- **Beautiful, Accessible UI:** A premium, modern design system powered by Tailwind CSS and Framer Motion for buttery-smooth animations and a human-crafted aesthetic.

## 🛠️ Technology Stack

- **Frontend Framework:** React 18 + Vite
- **Styling:** Vanilla CSS (Custom Design System) + Tailwind CSS + Framer Motion
- **Machine Learning / Computer Vision:** Google MediaPipe (Hand Tracking)
- **Browser APIs:** Web Speech API (Speech-to-Text & Text-to-Speech)
- **Deployment:** Vercel (Serverless / Static Hosting)
- **State Management:** Zustand
- **Icons:** Lucide React

## 🚀 Why This Architecture? (The "$0 Cost" Advantage)

Traditional AI applications rely on heavy Python backends (like FastAPI or Flask) running on costly cloud GPUs (AWS, Railway, Render).

This project takes a **serverless, edge-first approach**:
1. All machine learning inference runs directly in the user's browser using WebAssembly.
2. The entire application is served statically via Vercel.
3. Total monthly hosting cost: **$0.00**.

## 💻 Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/thenun123/FC_hackathon.git
   cd FC_hackathon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port specified in your terminal).

*Note: Ensure your browser has permission to access the camera and microphone.*

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/thenun123/FC_hackathon/issues).

## 📄 License

This project is licensed under the MIT License.
