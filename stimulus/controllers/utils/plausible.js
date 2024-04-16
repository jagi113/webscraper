export const sendPlausibleEvent = (event_name = "pageview") => {
    fetch("https://plausible.modrastrecha.sk/api/event", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: event_name,
            url: window.location,
            domain: window.location.hostname.split(".").slice(-2).join("."),
            url: window.location.href,
        }),
    });
};
