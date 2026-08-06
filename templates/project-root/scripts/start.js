import { API_URL, BACKEND, FRONTEND_URL } from "./lib/stack.js";

console.log("");
console.log("This project runs two processes, each in its own terminal:");
console.log("");
console.log("  Terminal 1: npm run dev:backend");
if (BACKEND === "Express") {
  console.log("              starts the Express API on " + API_URL);
} else if (BACKEND === "FastAPI") {
  console.log("              starts the FastAPI server (uvicorn) on " + API_URL);
} else {
  console.log("              starts the backend API on " + API_URL);
}
console.log("");
console.log("  Terminal 2: npm run dev:frontend");
console.log("              starts the Vite dev server on " + FRONTEND_URL);
console.log("");
console.log("Then open " + FRONTEND_URL + " in your browser.");
console.log("If setup is incomplete, the Setup Wizard guides you through the rest.");
console.log("");
