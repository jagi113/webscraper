import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["line", "text"];
  static values = { websocketUrl: String };

  connect() {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsProtocol}://${window.location.host}${this.websocketUrlValue}`;
    this.socket = new WebSocket(wsUrl);
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

    this.lineTarget.style.width = `${progress}%`;

    this.textTarget.textContent = `${progress}%`;

    if (progress > 1) {
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
