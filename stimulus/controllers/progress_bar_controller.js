import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["line", "text"];
  static values = { projectId: String };

  connect() {
    // Construct the WebSocket URL with the project ID
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws"; // Handle
    const wsUrl = `${wsProtocol}://${window.location.host}/ws/scraping-progress/${this.projectIdValue}/`;

    console.log("Connecting to WebSocket:", wsUrl);

    // Create a new WebSocket connection
    this.socket = new WebSocket(wsUrl);

    // Set up WebSocket event handlers
    this.socket.onopen = () => {
      console.log("WebSocket connected!");
    };

    this.socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (error.target && error.target.readyState === WebSocket.CLOSED) {
        console.error("WebSocket was closed unexpectedly.");
      }
    };

    this.socket.onmessage = this.updateProgress.bind(this);
  }

  updateProgress(event) {
    const data = JSON.parse(event.data);
    const progress = data.progress;

    // Update progress line width
    this.lineTarget.style.width = `${progress}%`;

    // Update progress text
    this.textTarget.textContent = `${progress}%`;

    // Update styles based on progress
    if (progress > 10) {
      this.textTarget.classList.remove("text-amber-300", "relative", "ml-3");
      this.textTarget.classList.add("text-zinc-700", "place-self-center");
    } else {
      this.textTarget.classList.add("text-amber-300", "relative", "ml-3");
      this.textTarget.classList.remove("text-zinc-700", "place-self-center");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}
