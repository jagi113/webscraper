import { Controller } from "@hotwired/stimulus";
import { sendPlausibleEvent } from "./utils/plausible";

export default class extends Controller {
    sendEvent(event) {
        const eventName = event.params.eventName;

        if (!eventName) {
            return;
        }

        sendPlausibleEvent(eventName);
    }
}
