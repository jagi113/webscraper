!(function () {
    if (
        void 0 === window.Reflect ||
        void 0 === window.customElements ||
        window.customElements.polyfillWrapFlushCallback
    )
        return;
    const e = HTMLElement,
        t = function () {
            return Reflect.construct(e, [], this.constructor);
        };
    (window.HTMLElement = t),
        (HTMLElement.prototype = e.prototype),
        (HTMLElement.prototype.constructor = HTMLElement),
        Object.setPrototypeOf(HTMLElement, e);
})(),
    (function (e) {
        function t(e, t, s) {
            throw new e(
                "Failed to execute 'requestSubmit' on 'HTMLFormElement': " +
                    t +
                    ".",
                s
            );
        }
        "function" != typeof e.requestSubmit &&
            (e.requestSubmit = function (e) {
                e
                    ? (!(function (e, s) {
                          e instanceof HTMLElement ||
                              t(
                                  TypeError,
                                  "parameter 1 is not of type 'HTMLElement'"
                              ),
                              "submit" == e.type ||
                                  t(
                                      TypeError,
                                      "The specified element is not a submit button"
                                  ),
                              e.form == s ||
                                  t(
                                      DOMException,
                                      "The specified element is not owned by this form element",
                                      "NotFoundError"
                                  );
                      })(e, this),
                      e.click())
                    : (((e = document.createElement("input")).type = "submit"),
                      (e.hidden = !0),
                      this.appendChild(e),
                      e.click(),
                      this.removeChild(e));
            });
    })(HTMLFormElement.prototype);
const submittersByForm = new WeakMap();
function findSubmitterFromClickTarget(e) {
    const t =
            e instanceof Element
                ? e
                : e instanceof Node
                ? e.parentElement
                : null,
        s = t ? t.closest("input, button") : null;
    return "submit" == (null == s ? void 0 : s.type) ? s : null;
}
function clickCaptured(e) {
    const t = findSubmitterFromClickTarget(e.target);
    t && t.form && submittersByForm.set(t.form, t);
}
var FrameLoadingStyle,
    FetchMethod,
    FormSubmissionState,
    FormEnctype,
    TimingMetric,
    VisitState;
!(function () {
    if ("submitter" in Event.prototype) return;
    let e;
    if ("SubmitEvent" in window && /Apple Computer/.test(navigator.vendor))
        e = window.SubmitEvent.prototype;
    else {
        if ("SubmitEvent" in window) return;
        e = window.Event.prototype;
    }
    addEventListener("click", clickCaptured, !0),
        Object.defineProperty(e, "submitter", {
            get() {
                if (
                    "submit" == this.type &&
                    this.target instanceof HTMLFormElement
                )
                    return submittersByForm.get(this.target);
            },
        });
})(),
    (function (e) {
        (e.eager = "eager"), (e.lazy = "lazy");
    })(FrameLoadingStyle || (FrameLoadingStyle = {}));
class FrameElement extends HTMLElement {
    constructor() {
        super(),
            (this.loaded = Promise.resolve()),
            (this.delegate = new FrameElement.delegateConstructor(this));
    }
    static get observedAttributes() {
        return ["disabled", "loading", "src"];
    }
    connectedCallback() {
        this.delegate.connect();
    }
    disconnectedCallback() {
        this.delegate.disconnect();
    }
    reload() {
        const { src: e } = this;
        (this.src = null), (this.src = e);
    }
    attributeChangedCallback(e) {
        "loading" == e
            ? this.delegate.loadingStyleChanged()
            : "src" == e
            ? this.delegate.sourceURLChanged()
            : this.delegate.disabledChanged();
    }
    get src() {
        return this.getAttribute("src");
    }
    set src(e) {
        e ? this.setAttribute("src", e) : this.removeAttribute("src");
    }
    get loading() {
        return frameLoadingStyleFromString(this.getAttribute("loading") || "");
    }
    set loading(e) {
        e ? this.setAttribute("loading", e) : this.removeAttribute("loading");
    }
    get disabled() {
        return this.hasAttribute("disabled");
    }
    set disabled(e) {
        e
            ? this.setAttribute("disabled", "")
            : this.removeAttribute("disabled");
    }
    get autoscroll() {
        return this.hasAttribute("autoscroll");
    }
    set autoscroll(e) {
        e
            ? this.setAttribute("autoscroll", "")
            : this.removeAttribute("autoscroll");
    }
    get complete() {
        return !this.delegate.isLoading;
    }
    get isActive() {
        return this.ownerDocument === document && !this.isPreview;
    }
    get isPreview() {
        var e, t;
        return null ===
            (t =
                null === (e = this.ownerDocument) || void 0 === e
                    ? void 0
                    : e.documentElement) || void 0 === t
            ? void 0
            : t.hasAttribute("data-turbo-preview");
    }
}
function frameLoadingStyleFromString(e) {
    switch (e.toLowerCase()) {
        case "lazy":
            return FrameLoadingStyle.lazy;
        default:
            return FrameLoadingStyle.eager;
    }
}
function expandURL(e) {
    return new URL(e.toString(), document.baseURI);
}
function getAnchor(e) {
    let t;
    return e.hash
        ? e.hash.slice(1)
        : (t = e.href.match(/#(.*)$/))
        ? t[1]
        : void 0;
}
function getAction(e, t) {
    return expandURL(
        (null == t ? void 0 : t.getAttribute("formaction")) ||
            e.getAttribute("action") ||
            e.action
    );
}
function getExtension(e) {
    return (getLastPathComponent(e).match(/\.[^.]*$/) || [])[0] || "";
}
function isHTML(e) {
    return !!getExtension(e).match(/^(?:|\.(?:htm|html|xhtml))$/);
}
function isPrefixedBy(e, t) {
    const s = getPrefix(t);
    return e.href === expandURL(s).href || e.href.startsWith(s);
}
function locationIsVisitable(e, t) {
    return isPrefixedBy(e, t) && isHTML(e);
}
function getRequestURL(e) {
    const t = getAnchor(e);
    return null != t ? e.href.slice(0, -(t.length + 1)) : e.href;
}
function toCacheKey(e) {
    return getRequestURL(e);
}
function urlsAreEqual(e, t) {
    return expandURL(e).href == expandURL(t).href;
}
function getPathComponents(e) {
    return e.pathname.split("/").slice(1);
}
function getLastPathComponent(e) {
    return getPathComponents(e).slice(-1)[0];
}
function getPrefix(e) {
    return addTrailingSlash(e.origin + e.pathname);
}
function addTrailingSlash(e) {
    return e.endsWith("/") ? e : e + "/";
}
class FetchResponse {
    constructor(e) {
        this.response = e;
    }
    get succeeded() {
        return this.response.ok;
    }
    get failed() {
        return !this.succeeded;
    }
    get clientError() {
        return this.statusCode >= 400 && this.statusCode <= 499;
    }
    get serverError() {
        return this.statusCode >= 500 && this.statusCode <= 599;
    }
    get redirected() {
        return this.response.redirected;
    }
    get location() {
        return expandURL(this.response.url);
    }
    get isHTML() {
        return (
            this.contentType &&
            this.contentType.match(
                /^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/
            )
        );
    }
    get statusCode() {
        return this.response.status;
    }
    get contentType() {
        return this.header("Content-Type");
    }
    get responseText() {
        return this.response.clone().text();
    }
    get responseHTML() {
        return this.isHTML
            ? this.response.clone().text()
            : Promise.resolve(void 0);
    }
    header(e) {
        return this.response.headers.get(e);
    }
}
function dispatch(e, { target: t, cancelable: s, detail: i } = {}) {
    const r = new CustomEvent(e, { cancelable: s, bubbles: !0, detail: i });
    return (
        t && t.isConnected
            ? t.dispatchEvent(r)
            : document.documentElement.dispatchEvent(r),
        r
    );
}
function nextAnimationFrame() {
    return new Promise((e) => requestAnimationFrame(() => e()));
}
function nextEventLoopTick() {
    return new Promise((e) => setTimeout(() => e(), 0));
}
function nextMicrotask() {
    return Promise.resolve();
}
function parseHTMLDocument(e = "") {
    return new DOMParser().parseFromString(e, "text/html");
}
function unindent(e, ...t) {
    const s = interpolate(e, t).replace(/^\n/, "").split("\n"),
        i = s[0].match(/^\s+/),
        r = i ? i[0].length : 0;
    return s.map((e) => e.slice(r)).join("\n");
}
function interpolate(e, t) {
    return e.reduce((e, s, i) => {
        return e + s + (null == t[i] ? "" : t[i]);
    }, "");
}
function uuid() {
    return Array.apply(null, { length: 36 })
        .map((e, t) =>
            8 == t || 13 == t || 18 == t || 23 == t
                ? "-"
                : 14 == t
                ? "4"
                : 19 == t
                ? (Math.floor(4 * Math.random()) + 8).toString(16)
                : Math.floor(15 * Math.random()).toString(16)
        )
        .join("");
}
function getAttribute(e, ...t) {
    for (const s of t.map((t) => (null == t ? void 0 : t.getAttribute(e))))
        if ("string" == typeof s) return s;
    return null;
}
function markAsBusy(...e) {
    for (const t of e)
        "turbo-frame" == t.localName && t.setAttribute("busy", ""),
            t.setAttribute("aria-busy", "true");
}
function clearBusyState(...e) {
    for (const t of e)
        "turbo-frame" == t.localName && t.removeAttribute("busy"),
            t.removeAttribute("aria-busy");
}
function fetchMethodFromString(e) {
    switch (e.toLowerCase()) {
        case "get":
            return FetchMethod.get;
        case "post":
            return FetchMethod.post;
        case "put":
            return FetchMethod.put;
        case "patch":
            return FetchMethod.patch;
        case "delete":
            return FetchMethod.delete;
    }
}
!(function (e) {
    (e[(e.get = 0)] = "get"),
        (e[(e.post = 1)] = "post"),
        (e[(e.put = 2)] = "put"),
        (e[(e.patch = 3)] = "patch"),
        (e[(e.delete = 4)] = "delete");
})(FetchMethod || (FetchMethod = {}));
class FetchRequest {
    constructor(e, t, s, i = new URLSearchParams(), r = null) {
        (this.abortController = new AbortController()),
            (this.resolveRequestPromise = (e) => {}),
            (this.delegate = e),
            (this.method = t),
            (this.headers = this.defaultHeaders),
            (this.body = i),
            (this.url = s),
            (this.target = r);
    }
    get location() {
        return this.url;
    }
    get params() {
        return this.url.searchParams;
    }
    get entries() {
        return this.body ? Array.from(this.body.entries()) : [];
    }
    cancel() {
        this.abortController.abort();
    }
    async perform() {
        var e, t;
        const { fetchOptions: s } = this;
        null === (t = (e = this.delegate).prepareHeadersForRequest) ||
            void 0 === t ||
            t.call(e, this.headers, this),
            await this.allowRequestToBeIntercepted(s);
        try {
            this.delegate.requestStarted(this);
            const e = await fetch(this.url.href, s);
            return await this.receive(e);
        } catch (e) {
            if ("AbortError" !== e.name)
                throw (this.delegate.requestErrored(this, e), e);
        } finally {
            this.delegate.requestFinished(this);
        }
    }
    async receive(e) {
        const t = new FetchResponse(e);
        return (
            dispatch("turbo:before-fetch-response", {
                cancelable: !0,
                detail: { fetchResponse: t },
                target: this.target,
            }).defaultPrevented
                ? this.delegate.requestPreventedHandlingResponse(this, t)
                : t.succeeded
                ? this.delegate.requestSucceededWithResponse(this, t)
                : this.delegate.requestFailedWithResponse(this, t),
            t
        );
    }
    get fetchOptions() {
        var e;
        return {
            method: FetchMethod[this.method].toUpperCase(),
            credentials: "same-origin",
            headers: this.headers,
            redirect: "follow",
            body: this.isIdempotent ? null : this.body,
            signal: this.abortSignal,
            referrer:
                null === (e = this.delegate.referrer) || void 0 === e
                    ? void 0
                    : e.href,
        };
    }
    get defaultHeaders() {
        return { Accept: "text/html, application/xhtml+xml" };
    }
    get isIdempotent() {
        return this.method == FetchMethod.get;
    }
    get abortSignal() {
        return this.abortController.signal;
    }
    async allowRequestToBeIntercepted(e) {
        const t = new Promise((e) => (this.resolveRequestPromise = e));
        dispatch("turbo:before-fetch-request", {
            cancelable: !0,
            detail: {
                fetchOptions: e,
                url: this.url,
                resume: this.resolveRequestPromise,
            },
            target: this.target,
        }).defaultPrevented && (await t);
    }
}
class AppearanceObserver {
    constructor(e, t) {
        (this.started = !1),
            (this.intersect = (e) => {
                const t = e.slice(-1)[0];
                (null == t ? void 0 : t.isIntersecting) &&
                    this.delegate.elementAppearedInViewport(this.element);
            }),
            (this.delegate = e),
            (this.element = t),
            (this.intersectionObserver = new IntersectionObserver(
                this.intersect
            ));
    }
    start() {
        this.started ||
            ((this.started = !0),
            this.intersectionObserver.observe(this.element));
    }
    stop() {
        this.started &&
            ((this.started = !1),
            this.intersectionObserver.unobserve(this.element));
    }
}
class StreamMessage {
    constructor(e) {
        (this.templateElement = document.createElement("template")),
            (this.templateElement.innerHTML = e);
    }
    static wrap(e) {
        return "string" == typeof e ? new this(e) : e;
    }
    get fragment() {
        const e = document.createDocumentFragment();
        for (const t of this.foreignElements)
            e.appendChild(document.importNode(t, !0));
        return e;
    }
    get foreignElements() {
        return this.templateChildren.reduce(
            (e, t) =>
                "turbo-stream" == t.tagName.toLowerCase() ? [...e, t] : e,
            []
        );
    }
    get templateChildren() {
        return Array.from(this.templateElement.content.children);
    }
}
function formEnctypeFromString(e) {
    switch (e.toLowerCase()) {
        case FormEnctype.multipart:
            return FormEnctype.multipart;
        case FormEnctype.plain:
            return FormEnctype.plain;
        default:
            return FormEnctype.urlEncoded;
    }
}
(StreamMessage.contentType = "text/vnd.turbo-stream.html"),
    (function (e) {
        (e[(e.initialized = 0)] = "initialized"),
            (e[(e.requesting = 1)] = "requesting"),
            (e[(e.waiting = 2)] = "waiting"),
            (e[(e.receiving = 3)] = "receiving"),
            (e[(e.stopping = 4)] = "stopping"),
            (e[(e.stopped = 5)] = "stopped");
    })(FormSubmissionState || (FormSubmissionState = {})),
    (function (e) {
        (e.urlEncoded = "application/x-www-form-urlencoded"),
            (e.multipart = "multipart/form-data"),
            (e.plain = "text/plain");
    })(FormEnctype || (FormEnctype = {}));
class FormSubmission {
    constructor(e, t, s, i = !1) {
        (this.state = FormSubmissionState.initialized),
            (this.delegate = e),
            (this.formElement = t),
            (this.submitter = s),
            (this.formData = buildFormData(t, s)),
            (this.location = expandURL(this.action)),
            this.method == FetchMethod.get &&
                mergeFormDataEntries(this.location, [...this.body.entries()]),
            (this.fetchRequest = new FetchRequest(
                this,
                this.method,
                this.location,
                this.body,
                this.formElement
            )),
            (this.mustRedirect = i);
    }
    static confirmMethod(e, t) {
        return confirm(e);
    }
    get method() {
        var e;
        return (
            fetchMethodFromString(
                (
                    (null === (e = this.submitter) || void 0 === e
                        ? void 0
                        : e.getAttribute("formmethod")) ||
                    this.formElement.getAttribute("method") ||
                    ""
                ).toLowerCase()
            ) || FetchMethod.get
        );
    }
    get action() {
        var e;
        const t =
            "string" == typeof this.formElement.action
                ? this.formElement.action
                : null;
        return (
            (null === (e = this.submitter) || void 0 === e
                ? void 0
                : e.getAttribute("formaction")) ||
            this.formElement.getAttribute("action") ||
            t ||
            ""
        );
    }
    get body() {
        return this.enctype == FormEnctype.urlEncoded ||
            this.method == FetchMethod.get
            ? new URLSearchParams(this.stringFormData)
            : this.formData;
    }
    get enctype() {
        var e;
        return formEnctypeFromString(
            (null === (e = this.submitter) || void 0 === e
                ? void 0
                : e.getAttribute("formenctype")) || this.formElement.enctype
        );
    }
    get isIdempotent() {
        return this.fetchRequest.isIdempotent;
    }
    get stringFormData() {
        return [...this.formData].reduce(
            (e, [t, s]) => e.concat("string" == typeof s ? [[t, s]] : []),
            []
        );
    }
    get confirmationMessage() {
        return this.formElement.getAttribute("data-turbo-confirm");
    }
    get needsConfirmation() {
        return null !== this.confirmationMessage;
    }
    async start() {
        const { initialized: e, requesting: t } = FormSubmissionState;
        if (this.needsConfirmation) {
            if (
                !FormSubmission.confirmMethod(
                    this.confirmationMessage,
                    this.formElement
                )
            )
                return;
        }
        if (this.state == e)
            return (this.state = t), this.fetchRequest.perform();
    }
    stop() {
        const { stopping: e, stopped: t } = FormSubmissionState;
        if (this.state != e && this.state != t)
            return (this.state = e), this.fetchRequest.cancel(), !0;
    }
    prepareHeadersForRequest(e, t) {
        if (!t.isIdempotent) {
            const t =
                getCookieValue(getMetaContent("csrf-param")) ||
                getMetaContent("csrf-token");
            t && (e["X-CSRF-Token"] = t),
                (e.Accept = [StreamMessage.contentType, e.Accept].join(", "));
        }
    }
    requestStarted(e) {
        var t;
        (this.state = FormSubmissionState.waiting),
            null === (t = this.submitter) ||
                void 0 === t ||
                t.setAttribute("disabled", ""),
            dispatch("turbo:submit-start", {
                target: this.formElement,
                detail: { formSubmission: this },
            }),
            this.delegate.formSubmissionStarted(this);
    }
    requestPreventedHandlingResponse(e, t) {
        this.result = { success: t.succeeded, fetchResponse: t };
    }
    requestSucceededWithResponse(e, t) {
        if (t.clientError || t.serverError)
            this.delegate.formSubmissionFailedWithResponse(this, t);
        else if (
            this.requestMustRedirect(e) &&
            responseSucceededWithoutRedirect(t)
        ) {
            const e = new Error(
                "Form responses must redirect to another location"
            );
            this.delegate.formSubmissionErrored(this, e);
        } else
            (this.state = FormSubmissionState.receiving),
                (this.result = { success: !0, fetchResponse: t }),
                this.delegate.formSubmissionSucceededWithResponse(this, t);
    }
    requestFailedWithResponse(e, t) {
        (this.result = { success: !1, fetchResponse: t }),
            this.delegate.formSubmissionFailedWithResponse(this, t);
    }
    requestErrored(e, t) {
        (this.result = { success: !1, error: t }),
            this.delegate.formSubmissionErrored(this, t);
    }
    requestFinished(e) {
        var t;
        (this.state = FormSubmissionState.stopped),
            null === (t = this.submitter) ||
                void 0 === t ||
                t.removeAttribute("disabled"),
            dispatch("turbo:submit-end", {
                target: this.formElement,
                detail: Object.assign({ formSubmission: this }, this.result),
            }),
            this.delegate.formSubmissionFinished(this);
    }
    requestMustRedirect(e) {
        return !e.isIdempotent && this.mustRedirect;
    }
}
function buildFormData(e, t) {
    const s = new FormData(e),
        i = null == t ? void 0 : t.getAttribute("name"),
        r = null == t ? void 0 : t.getAttribute("value");
    return i && null != r && s.get(i) != r && s.append(i, r), s;
}
function getCookieValue(e) {
    if (null != e) {
        const t = (document.cookie ? document.cookie.split("; ") : []).find(
            (t) => t.startsWith(e)
        );
        if (t) {
            const e = t.split("=").slice(1).join("=");
            return e ? decodeURIComponent(e) : void 0;
        }
    }
}
function getMetaContent(e) {
    const t = document.querySelector(`meta[name="${e}"]`);
    return t && t.content;
}
function responseSucceededWithoutRedirect(e) {
    return 200 == e.statusCode && !e.redirected;
}
function mergeFormDataEntries(e, t) {
    const s = new URLSearchParams();
    for (const [e, i] of t) i instanceof File || s.append(e, i);
    return (e.search = s.toString()), e;
}
class Snapshot {
    constructor(e) {
        this.element = e;
    }
    get children() {
        return [...this.element.children];
    }
    hasAnchor(e) {
        return null != this.getElementForAnchor(e);
    }
    getElementForAnchor(e) {
        return e
            ? this.element.querySelector(`[id='${e}'], a[name='${e}']`)
            : null;
    }
    get isConnected() {
        return this.element.isConnected;
    }
    get firstAutofocusableElement() {
        return this.element.querySelector("[autofocus]");
    }
    get permanentElements() {
        return [...this.element.querySelectorAll("[id][data-turbo-permanent]")];
    }
    getPermanentElementById(e) {
        return this.element.querySelector(`#${e}[data-turbo-permanent]`);
    }
    getPermanentElementMapForSnapshot(e) {
        const t = {};
        for (const s of this.permanentElements) {
            const { id: i } = s,
                r = e.getPermanentElementById(i);
            r && (t[i] = [s, r]);
        }
        return t;
    }
}
class FormInterceptor {
    constructor(e, t) {
        (this.submitBubbled = (e) => {
            const t = e.target;
            if (
                !e.defaultPrevented &&
                t instanceof HTMLFormElement &&
                t.closest("turbo-frame, html") == this.element
            ) {
                const s = e.submitter || void 0;
                "dialog" !=
                    ((null == s ? void 0 : s.getAttribute("formmethod")) ||
                        t.method) &&
                    this.delegate.shouldInterceptFormSubmission(t, s) &&
                    (e.preventDefault(),
                    e.stopImmediatePropagation(),
                    this.delegate.formSubmissionIntercepted(t, s));
            }
        }),
            (this.delegate = e),
            (this.element = t);
    }
    start() {
        this.element.addEventListener("submit", this.submitBubbled);
    }
    stop() {
        this.element.removeEventListener("submit", this.submitBubbled);
    }
}
class View {
    constructor(e, t) {
        (this.resolveRenderPromise = (e) => {}),
            (this.resolveInterceptionPromise = (e) => {}),
            (this.delegate = e),
            (this.element = t);
    }
    scrollToAnchor(e) {
        const t = this.snapshot.getElementForAnchor(e);
        t
            ? (this.scrollToElement(t), this.focusElement(t))
            : this.scrollToPosition({ x: 0, y: 0 });
    }
    scrollToAnchorFromLocation(e) {
        this.scrollToAnchor(getAnchor(e));
    }
    scrollToElement(e) {
        e.scrollIntoView();
    }
    focusElement(e) {
        e instanceof HTMLElement &&
            (e.hasAttribute("tabindex")
                ? e.focus()
                : (e.setAttribute("tabindex", "-1"),
                  e.focus(),
                  e.removeAttribute("tabindex")));
    }
    scrollToPosition({ x: e, y: t }) {
        this.scrollRoot.scrollTo(e, t);
    }
    scrollToTop() {
        this.scrollToPosition({ x: 0, y: 0 });
    }
    get scrollRoot() {
        return window;
    }
    async render(e) {
        const { isPreview: t, shouldRender: s, newSnapshot: i } = e;
        if (s)
            try {
                (this.renderPromise = new Promise(
                    (e) => (this.resolveRenderPromise = e)
                )),
                    (this.renderer = e),
                    this.prepareToRenderSnapshot(e);
                const s = new Promise(
                    (e) => (this.resolveInterceptionPromise = e)
                );
                this.delegate.allowsImmediateRender(
                    i,
                    this.resolveInterceptionPromise
                ) || (await s),
                    await this.renderSnapshot(e),
                    this.delegate.viewRenderedSnapshot(i, t),
                    this.finishRenderingSnapshot(e);
            } finally {
                delete this.renderer,
                    this.resolveRenderPromise(void 0),
                    delete this.renderPromise;
            }
        else this.invalidate();
    }
    invalidate() {
        this.delegate.viewInvalidated();
    }
    prepareToRenderSnapshot(e) {
        this.markAsPreview(e.isPreview), e.prepareToRender();
    }
    markAsPreview(e) {
        e
            ? this.element.setAttribute("data-turbo-preview", "")
            : this.element.removeAttribute("data-turbo-preview");
    }
    async renderSnapshot(e) {
        await e.render();
    }
    finishRenderingSnapshot(e) {
        e.finishRendering();
    }
}
class FrameView extends View {
    invalidate() {
        this.element.innerHTML = "";
    }
    get snapshot() {
        return new Snapshot(this.element);
    }
}
class LinkInterceptor {
    constructor(e, t) {
        (this.clickBubbled = (e) => {
            this.respondsToEventTarget(e.target)
                ? (this.clickEvent = e)
                : delete this.clickEvent;
        }),
            (this.linkClicked = (e) => {
                this.clickEvent &&
                    this.respondsToEventTarget(e.target) &&
                    e.target instanceof Element &&
                    this.delegate.shouldInterceptLinkClick(
                        e.target,
                        e.detail.url
                    ) &&
                    (this.clickEvent.preventDefault(),
                    e.preventDefault(),
                    this.delegate.linkClickIntercepted(e.target, e.detail.url)),
                    delete this.clickEvent;
            }),
            (this.willVisit = () => {
                delete this.clickEvent;
            }),
            (this.delegate = e),
            (this.element = t);
    }
    start() {
        this.element.addEventListener("click", this.clickBubbled),
            document.addEventListener("turbo:click", this.linkClicked),
            document.addEventListener("turbo:before-visit", this.willVisit);
    }
    stop() {
        this.element.removeEventListener("click", this.clickBubbled),
            document.removeEventListener("turbo:click", this.linkClicked),
            document.removeEventListener("turbo:before-visit", this.willVisit);
    }
    respondsToEventTarget(e) {
        const t =
            e instanceof Element
                ? e
                : e instanceof Node
                ? e.parentElement
                : null;
        return t && t.closest("turbo-frame, html") == this.element;
    }
}
class Bardo {
    constructor(e) {
        this.permanentElementMap = e;
    }
    static preservingPermanentElements(e, t) {
        const s = new this(e);
        s.enter(), t(), s.leave();
    }
    enter() {
        for (const e in this.permanentElementMap) {
            const [, t] = this.permanentElementMap[e];
            this.replaceNewPermanentElementWithPlaceholder(t);
        }
    }
    leave() {
        for (const e in this.permanentElementMap) {
            const [t] = this.permanentElementMap[e];
            this.replaceCurrentPermanentElementWithClone(t),
                this.replacePlaceholderWithPermanentElement(t);
        }
    }
    replaceNewPermanentElementWithPlaceholder(e) {
        const t = createPlaceholderForPermanentElement(e);
        e.replaceWith(t);
    }
    replaceCurrentPermanentElementWithClone(e) {
        const t = e.cloneNode(!0);
        e.replaceWith(t);
    }
    replacePlaceholderWithPermanentElement(e) {
        const t = this.getPlaceholderById(e.id);
        null == t || t.replaceWith(e);
    }
    getPlaceholderById(e) {
        return this.placeholders.find((t) => t.content == e);
    }
    get placeholders() {
        return [
            ...document.querySelectorAll(
                "meta[name=turbo-permanent-placeholder][content]"
            ),
        ];
    }
}
function createPlaceholderForPermanentElement(e) {
    const t = document.createElement("meta");
    return (
        t.setAttribute("name", "turbo-permanent-placeholder"),
        t.setAttribute("content", e.id),
        t
    );
}
class Renderer {
    constructor(e, t, s, i = !0) {
        (this.currentSnapshot = e),
            (this.newSnapshot = t),
            (this.isPreview = s),
            (this.willRender = i),
            (this.promise = new Promise(
                (e, t) => (this.resolvingFunctions = { resolve: e, reject: t })
            ));
    }
    get shouldRender() {
        return !0;
    }
    prepareToRender() {}
    finishRendering() {
        this.resolvingFunctions &&
            (this.resolvingFunctions.resolve(), delete this.resolvingFunctions);
    }
    createScriptElement(e) {
        if ("false" == e.getAttribute("data-turbo-eval")) return e;
        {
            const t = document.createElement("script");
            return (
                this.cspNonce && (t.nonce = this.cspNonce),
                (t.textContent = e.textContent),
                (t.async = !1),
                copyElementAttributes(t, e),
                t
            );
        }
    }
    preservingPermanentElements(e) {
        Bardo.preservingPermanentElements(this.permanentElementMap, e);
    }
    focusFirstAutofocusableElement() {
        const e = this.connectedSnapshot.firstAutofocusableElement;
        elementIsFocusable(e) && e.focus();
    }
    get connectedSnapshot() {
        return this.newSnapshot.isConnected
            ? this.newSnapshot
            : this.currentSnapshot;
    }
    get currentElement() {
        return this.currentSnapshot.element;
    }
    get newElement() {
        return this.newSnapshot.element;
    }
    get permanentElementMap() {
        return this.currentSnapshot.getPermanentElementMapForSnapshot(
            this.newSnapshot
        );
    }
    get cspNonce() {
        var e;
        return null ===
            (e = document.head.querySelector('meta[name="csp-nonce"]')) ||
            void 0 === e
            ? void 0
            : e.getAttribute("content");
    }
}
function copyElementAttributes(e, t) {
    for (const { name: s, value: i } of [...t.attributes]) e.setAttribute(s, i);
}
function elementIsFocusable(e) {
    return e && "function" == typeof e.focus;
}
class FrameRenderer extends Renderer {
    get shouldRender() {
        return !0;
    }
    async render() {
        await nextAnimationFrame(),
            this.preservingPermanentElements(() => {
                this.loadFrameElement();
            }),
            this.scrollFrameIntoView(),
            await nextAnimationFrame(),
            this.focusFirstAutofocusableElement(),
            await nextAnimationFrame(),
            this.activateScriptElements();
    }
    loadFrameElement() {
        var e;
        const t = document.createRange();
        t.selectNodeContents(this.currentElement), t.deleteContents();
        const s = this.newElement,
            i =
                null === (e = s.ownerDocument) || void 0 === e
                    ? void 0
                    : e.createRange();
        i &&
            (i.selectNodeContents(s),
            this.currentElement.appendChild(i.extractContents()));
    }
    scrollFrameIntoView() {
        if (this.currentElement.autoscroll || this.newElement.autoscroll) {
            const e = this.currentElement.firstElementChild,
                t = readScrollLogicalPosition(
                    this.currentElement.getAttribute("data-autoscroll-block"),
                    "end"
                );
            if (e) return e.scrollIntoView({ block: t }), !0;
        }
        return !1;
    }
    activateScriptElements() {
        for (const e of this.newScriptElements) {
            const t = this.createScriptElement(e);
            e.replaceWith(t);
        }
    }
    get newScriptElements() {
        return this.currentElement.querySelectorAll("script");
    }
}
function readScrollLogicalPosition(e, t) {
    return "end" == e || "start" == e || "center" == e || "nearest" == e
        ? e
        : t;
}
class ProgressBar {
    constructor() {
        (this.hiding = !1),
            (this.value = 0),
            (this.visible = !1),
            (this.trickle = () => {
                this.setValue(this.value + Math.random() / 100);
            }),
            (this.stylesheetElement = this.createStylesheetElement()),
            (this.progressElement = this.createProgressElement()),
            this.installStylesheetElement(),
            this.setValue(0);
    }
    static get defaultCSS() {
        return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 9999;
        transition:
          width ${ProgressBar.animationDuration}ms ease-out,
          opacity ${ProgressBar.animationDuration / 2}ms ${
            ProgressBar.animationDuration / 2
        }ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
    }
    show() {
        this.visible ||
            ((this.visible = !0),
            this.installProgressElement(),
            this.startTrickling());
    }
    hide() {
        this.visible &&
            !this.hiding &&
            ((this.hiding = !0),
            this.fadeProgressElement(() => {
                this.uninstallProgressElement(),
                    this.stopTrickling(),
                    (this.visible = !1),
                    (this.hiding = !1);
            }));
    }
    setValue(e) {
        (this.value = e), this.refresh();
    }
    installStylesheetElement() {
        document.head.insertBefore(
            this.stylesheetElement,
            document.head.firstChild
        );
    }
    installProgressElement() {
        (this.progressElement.style.width = "0"),
            (this.progressElement.style.opacity = "1"),
            document.documentElement.insertBefore(
                this.progressElement,
                document.body
            ),
            this.refresh();
    }
    fadeProgressElement(e) {
        (this.progressElement.style.opacity = "0"),
            setTimeout(e, 1.5 * ProgressBar.animationDuration);
    }
    uninstallProgressElement() {
        this.progressElement.parentNode &&
            document.documentElement.removeChild(this.progressElement);
    }
    startTrickling() {
        this.trickleInterval ||
            (this.trickleInterval = window.setInterval(
                this.trickle,
                ProgressBar.animationDuration
            ));
    }
    stopTrickling() {
        window.clearInterval(this.trickleInterval), delete this.trickleInterval;
    }
    refresh() {
        requestAnimationFrame(() => {
            this.progressElement.style.width = `${10 + 90 * this.value}%`;
        });
    }
    createStylesheetElement() {
        const e = document.createElement("style");
        return (
            (e.type = "text/css"), (e.textContent = ProgressBar.defaultCSS), e
        );
    }
    createProgressElement() {
        const e = document.createElement("div");
        return (e.className = "turbo-progress-bar"), e;
    }
}
ProgressBar.animationDuration = 300;
class HeadSnapshot extends Snapshot {
    constructor() {
        super(...arguments),
            (this.detailsByOuterHTML = this.children
                .filter((e) => !elementIsNoscript(e))
                .map((e) => elementWithoutNonce(e))
                .reduce((e, t) => {
                    const { outerHTML: s } = t,
                        i =
                            s in e
                                ? e[s]
                                : {
                                      type: elementType(t),
                                      tracked: elementIsTracked(t),
                                      elements: [],
                                  };
                    return Object.assign(Object.assign({}, e), {
                        [s]: Object.assign(Object.assign({}, i), {
                            elements: [...i.elements, t],
                        }),
                    });
                }, {}));
    }
    get trackedElementSignature() {
        return Object.keys(this.detailsByOuterHTML)
            .filter((e) => this.detailsByOuterHTML[e].tracked)
            .join("");
    }
    getScriptElementsNotInSnapshot(e) {
        return this.getElementsMatchingTypeNotInSnapshot("script", e);
    }
    getStylesheetElementsNotInSnapshot(e) {
        return this.getElementsMatchingTypeNotInSnapshot("stylesheet", e);
    }
    getElementsMatchingTypeNotInSnapshot(e, t) {
        return Object.keys(this.detailsByOuterHTML)
            .filter((e) => !(e in t.detailsByOuterHTML))
            .map((e) => this.detailsByOuterHTML[e])
            .filter(({ type: t }) => t == e)
            .map(({ elements: [e] }) => e);
    }
    get provisionalElements() {
        return Object.keys(this.detailsByOuterHTML).reduce((e, t) => {
            const {
                type: s,
                tracked: i,
                elements: r,
            } = this.detailsByOuterHTML[t];
            return null != s || i
                ? r.length > 1
                    ? [...e, ...r.slice(1)]
                    : e
                : [...e, ...r];
        }, []);
    }
    getMetaValue(e) {
        const t = this.findMetaElementByName(e);
        return t ? t.getAttribute("content") : null;
    }
    findMetaElementByName(e) {
        return Object.keys(this.detailsByOuterHTML).reduce((t, s) => {
            const {
                elements: [i],
            } = this.detailsByOuterHTML[s];
            return elementIsMetaElementWithName(i, e) ? i : t;
        }, void 0);
    }
}
function elementType(e) {
    return elementIsScript(e)
        ? "script"
        : elementIsStylesheet(e)
        ? "stylesheet"
        : void 0;
}
function elementIsTracked(e) {
    return "reload" == e.getAttribute("data-turbo-track");
}
function elementIsScript(e) {
    return "script" == e.tagName.toLowerCase();
}
function elementIsNoscript(e) {
    return "noscript" == e.tagName.toLowerCase();
}
function elementIsStylesheet(e) {
    const t = e.tagName.toLowerCase();
    return (
        "style" == t || ("link" == t && "stylesheet" == e.getAttribute("rel"))
    );
}
function elementIsMetaElementWithName(e, t) {
    return "meta" == e.tagName.toLowerCase() && e.getAttribute("name") == t;
}
function elementWithoutNonce(e) {
    return e.hasAttribute("nonce") && e.setAttribute("nonce", ""), e;
}
class PageSnapshot extends Snapshot {
    constructor(e, t) {
        super(e), (this.headSnapshot = t);
    }
    static fromHTMLString(e = "") {
        return this.fromDocument(parseHTMLDocument(e));
    }
    static fromElement(e) {
        return this.fromDocument(e.ownerDocument);
    }
    static fromDocument({ head: e, body: t }) {
        return new this(t, new HeadSnapshot(e));
    }
    clone() {
        return new PageSnapshot(this.element.cloneNode(!0), this.headSnapshot);
    }
    get headElement() {
        return this.headSnapshot.element;
    }
    get rootLocation() {
        var e;
        return expandURL(
            null !== (e = this.getSetting("root")) && void 0 !== e ? e : "/"
        );
    }
    get cacheControlValue() {
        return this.getSetting("cache-control");
    }
    get isPreviewable() {
        return "no-preview" != this.cacheControlValue;
    }
    get isCacheable() {
        return "no-cache" != this.cacheControlValue;
    }
    get isVisitable() {
        return "reload" != this.getSetting("visit-control");
    }
    getSetting(e) {
        return this.headSnapshot.getMetaValue(`turbo-${e}`);
    }
}
!(function (e) {
    (e.visitStart = "visitStart"),
        (e.requestStart = "requestStart"),
        (e.requestEnd = "requestEnd"),
        (e.visitEnd = "visitEnd");
})(TimingMetric || (TimingMetric = {})),
    (function (e) {
        (e.initialized = "initialized"),
            (e.started = "started"),
            (e.canceled = "canceled"),
            (e.failed = "failed"),
            (e.completed = "completed");
    })(VisitState || (VisitState = {}));
const defaultOptions = {
    action: "advance",
    historyChanged: !1,
    visitCachedSnapshot: () => {},
    willRender: !0,
};
var SystemStatusCode, PageStage;
!(function (e) {
    (e[(e.networkFailure = 0)] = "networkFailure"),
        (e[(e.timeoutFailure = -1)] = "timeoutFailure"),
        (e[(e.contentTypeMismatch = -2)] = "contentTypeMismatch");
})(SystemStatusCode || (SystemStatusCode = {}));
class Visit {
    constructor(e, t, s, i = {}) {
        (this.identifier = uuid()),
            (this.timingMetrics = {}),
            (this.followedRedirect = !1),
            (this.historyChanged = !1),
            (this.scrolled = !1),
            (this.snapshotCached = !1),
            (this.state = VisitState.initialized),
            (this.delegate = e),
            (this.location = t),
            (this.restorationIdentifier = s || uuid());
        const {
            action: r,
            historyChanged: n,
            referrer: o,
            snapshotHTML: a,
            response: c,
            visitCachedSnapshot: h,
            willRender: l,
        } = Object.assign(Object.assign({}, defaultOptions), i);
        (this.action = r),
            (this.historyChanged = n),
            (this.referrer = o),
            (this.snapshotHTML = a),
            (this.response = c),
            (this.isSamePage = this.delegate.locationWithActionIsSamePage(
                this.location,
                this.action
            )),
            (this.visitCachedSnapshot = h),
            (this.willRender = l),
            (this.scrolled = !l);
    }
    get adapter() {
        return this.delegate.adapter;
    }
    get view() {
        return this.delegate.view;
    }
    get history() {
        return this.delegate.history;
    }
    get restorationData() {
        return this.history.getRestorationDataForIdentifier(
            this.restorationIdentifier
        );
    }
    get silent() {
        return this.isSamePage;
    }
    start() {
        this.state == VisitState.initialized &&
            (this.recordTimingMetric(TimingMetric.visitStart),
            (this.state = VisitState.started),
            this.adapter.visitStarted(this),
            this.delegate.visitStarted(this));
    }
    cancel() {
        this.state == VisitState.started &&
            (this.request && this.request.cancel(),
            this.cancelRender(),
            (this.state = VisitState.canceled));
    }
    complete() {
        this.state == VisitState.started &&
            (this.recordTimingMetric(TimingMetric.visitEnd),
            (this.state = VisitState.completed),
            this.adapter.visitCompleted(this),
            this.delegate.visitCompleted(this),
            this.followRedirect());
    }
    fail() {
        this.state == VisitState.started &&
            ((this.state = VisitState.failed), this.adapter.visitFailed(this));
    }
    changeHistory() {
        var e;
        if (!this.historyChanged) {
            const t =
                    this.location.href ===
                    (null === (e = this.referrer) || void 0 === e
                        ? void 0
                        : e.href)
                        ? "replace"
                        : this.action,
                s = this.getHistoryMethodForAction(t);
            this.history.update(s, this.location, this.restorationIdentifier),
                (this.historyChanged = !0);
        }
    }
    issueRequest() {
        this.hasPreloadedResponse()
            ? this.simulateRequest()
            : this.shouldIssueRequest() &&
              !this.request &&
              ((this.request = new FetchRequest(
                  this,
                  FetchMethod.get,
                  this.location
              )),
              this.request.perform());
    }
    simulateRequest() {
        this.response &&
            (this.startRequest(), this.recordResponse(), this.finishRequest());
    }
    startRequest() {
        this.recordTimingMetric(TimingMetric.requestStart),
            this.adapter.visitRequestStarted(this);
    }
    recordResponse(e = this.response) {
        if (((this.response = e), e)) {
            const { statusCode: t } = e;
            isSuccessful(t)
                ? this.adapter.visitRequestCompleted(this)
                : this.adapter.visitRequestFailedWithStatusCode(this, t);
        }
    }
    finishRequest() {
        this.recordTimingMetric(TimingMetric.requestEnd),
            this.adapter.visitRequestFinished(this);
    }
    loadResponse() {
        if (this.response) {
            const { statusCode: e, responseHTML: t } = this.response;
            this.render(async () => {
                this.cacheSnapshot(),
                    this.view.renderPromise && (await this.view.renderPromise),
                    isSuccessful(e) && null != t
                        ? (await this.view.renderPage(
                              PageSnapshot.fromHTMLString(t),
                              !1,
                              this.willRender
                          ),
                          this.adapter.visitRendered(this),
                          this.complete())
                        : (await this.view.renderError(
                              PageSnapshot.fromHTMLString(t)
                          ),
                          this.adapter.visitRendered(this),
                          this.fail());
            });
        }
    }
    getCachedSnapshot() {
        const e =
            this.view.getCachedSnapshotForLocation(this.location) ||
            this.getPreloadedSnapshot();
        if (
            e &&
            (!getAnchor(this.location) ||
                e.hasAnchor(getAnchor(this.location))) &&
            ("restore" == this.action || e.isPreviewable)
        )
            return e;
    }
    getPreloadedSnapshot() {
        if (this.snapshotHTML)
            return PageSnapshot.fromHTMLString(this.snapshotHTML);
    }
    hasCachedSnapshot() {
        return null != this.getCachedSnapshot();
    }
    loadCachedSnapshot() {
        const e = this.getCachedSnapshot();
        if (e) {
            const t = this.shouldIssueRequest();
            this.render(async () => {
                this.cacheSnapshot(),
                    this.isSamePage
                        ? this.adapter.visitRendered(this)
                        : (this.view.renderPromise &&
                              (await this.view.renderPromise),
                          await this.view.renderPage(e, t, this.willRender),
                          this.adapter.visitRendered(this),
                          t || this.complete());
            });
        }
    }
    followRedirect() {
        var e;
        this.redirectedToLocation &&
            !this.followedRedirect &&
            (null === (e = this.response) || void 0 === e
                ? void 0
                : e.redirected) &&
            (this.adapter.visitProposedToLocation(this.redirectedToLocation, {
                action: "replace",
                response: this.response,
            }),
            (this.followedRedirect = !0));
    }
    goToSamePageAnchor() {
        this.isSamePage &&
            this.render(async () => {
                this.cacheSnapshot(), this.adapter.visitRendered(this);
            });
    }
    requestStarted() {
        this.startRequest();
    }
    requestPreventedHandlingResponse(e, t) {}
    async requestSucceededWithResponse(e, t) {
        const s = await t.responseHTML,
            { redirected: i, statusCode: r } = t;
        null == s
            ? this.recordResponse({
                  statusCode: SystemStatusCode.contentTypeMismatch,
                  redirected: i,
              })
            : ((this.redirectedToLocation = t.redirected ? t.location : void 0),
              this.recordResponse({
                  statusCode: r,
                  responseHTML: s,
                  redirected: i,
              }));
    }
    async requestFailedWithResponse(e, t) {
        const s = await t.responseHTML,
            { redirected: i, statusCode: r } = t;
        null == s
            ? this.recordResponse({
                  statusCode: SystemStatusCode.contentTypeMismatch,
                  redirected: i,
              })
            : this.recordResponse({
                  statusCode: r,
                  responseHTML: s,
                  redirected: i,
              });
    }
    requestErrored(e, t) {
        this.recordResponse({
            statusCode: SystemStatusCode.networkFailure,
            redirected: !1,
        });
    }
    requestFinished() {
        this.finishRequest();
    }
    performScroll() {
        this.scrolled ||
            ("restore" == this.action
                ? this.scrollToRestoredPosition() ||
                  this.scrollToAnchor() ||
                  this.view.scrollToTop()
                : this.scrollToAnchor() || this.view.scrollToTop(),
            this.isSamePage &&
                this.delegate.visitScrolledToSamePageLocation(
                    this.view.lastRenderedLocation,
                    this.location
                ),
            (this.scrolled = !0));
    }
    scrollToRestoredPosition() {
        const { scrollPosition: e } = this.restorationData;
        if (e) return this.view.scrollToPosition(e), !0;
    }
    scrollToAnchor() {
        const e = getAnchor(this.location);
        if (null != e) return this.view.scrollToAnchor(e), !0;
    }
    recordTimingMetric(e) {
        this.timingMetrics[e] = new Date().getTime();
    }
    getTimingMetrics() {
        return Object.assign({}, this.timingMetrics);
    }
    getHistoryMethodForAction(e) {
        switch (e) {
            case "replace":
                return history.replaceState;
            case "advance":
            case "restore":
                return history.pushState;
        }
    }
    hasPreloadedResponse() {
        return "object" == typeof this.response;
    }
    shouldIssueRequest() {
        return (
            !this.isSamePage &&
            ("restore" == this.action
                ? !this.hasCachedSnapshot()
                : this.willRender)
        );
    }
    cacheSnapshot() {
        this.snapshotCached ||
            (this.view
                .cacheSnapshot()
                .then((e) => e && this.visitCachedSnapshot(e)),
            (this.snapshotCached = !0));
    }
    async render(e) {
        this.cancelRender(),
            await new Promise((e) => {
                this.frame = requestAnimationFrame(() => e());
            }),
            await e(),
            delete this.frame,
            this.performScroll();
    }
    cancelRender() {
        this.frame && (cancelAnimationFrame(this.frame), delete this.frame);
    }
}
function isSuccessful(e) {
    return e >= 200 && e < 300;
}
class BrowserAdapter {
    constructor(e) {
        (this.progressBar = new ProgressBar()),
            (this.showProgressBar = () => {
                this.progressBar.show();
            }),
            (this.session = e);
    }
    visitProposedToLocation(e, t) {
        this.navigator.startVisit(e, uuid(), t);
    }
    visitStarted(e) {
        e.loadCachedSnapshot(),
            e.issueRequest(),
            e.changeHistory(),
            e.goToSamePageAnchor();
    }
    visitRequestStarted(e) {
        this.progressBar.setValue(0),
            e.hasCachedSnapshot() || "restore" != e.action
                ? this.showVisitProgressBarAfterDelay()
                : this.showProgressBar();
    }
    visitRequestCompleted(e) {
        e.loadResponse();
    }
    visitRequestFailedWithStatusCode(e, t) {
        switch (t) {
            case SystemStatusCode.networkFailure:
            case SystemStatusCode.timeoutFailure:
            case SystemStatusCode.contentTypeMismatch:
                return this.reload();
            default:
                return e.loadResponse();
        }
    }
    visitRequestFinished(e) {
        this.progressBar.setValue(1), this.hideVisitProgressBar();
    }
    visitCompleted(e) {}
    pageInvalidated() {
        this.reload();
    }
    visitFailed(e) {}
    visitRendered(e) {}
    formSubmissionStarted(e) {
        this.progressBar.setValue(0), this.showFormProgressBarAfterDelay();
    }
    formSubmissionFinished(e) {
        this.progressBar.setValue(1), this.hideFormProgressBar();
    }
    showVisitProgressBarAfterDelay() {
        this.visitProgressBarTimeout = window.setTimeout(
            this.showProgressBar,
            this.session.progressBarDelay
        );
    }
    hideVisitProgressBar() {
        this.progressBar.hide(),
            null != this.visitProgressBarTimeout &&
                (window.clearTimeout(this.visitProgressBarTimeout),
                delete this.visitProgressBarTimeout);
    }
    showFormProgressBarAfterDelay() {
        null == this.formProgressBarTimeout &&
            (this.formProgressBarTimeout = window.setTimeout(
                this.showProgressBar,
                this.session.progressBarDelay
            ));
    }
    hideFormProgressBar() {
        this.progressBar.hide(),
            null != this.formProgressBarTimeout &&
                (window.clearTimeout(this.formProgressBarTimeout),
                delete this.formProgressBarTimeout);
    }
    reload() {
        window.location.reload();
    }
    get navigator() {
        return this.session.navigator;
    }
}
class CacheObserver {
    constructor() {
        this.started = !1;
    }
    start() {
        this.started ||
            ((this.started = !0),
            addEventListener(
                "turbo:before-cache",
                this.removeStaleElements,
                !1
            ));
    }
    stop() {
        this.started &&
            ((this.started = !1),
            removeEventListener(
                "turbo:before-cache",
                this.removeStaleElements,
                !1
            ));
    }
    removeStaleElements() {
        const e = [...document.querySelectorAll('[data-turbo-cache="false"]')];
        for (const t of e) t.remove();
    }
}
class FormSubmitObserver {
    constructor(e) {
        (this.started = !1),
            (this.submitCaptured = () => {
                removeEventListener("submit", this.submitBubbled, !1),
                    addEventListener("submit", this.submitBubbled, !1);
            }),
            (this.submitBubbled = (e) => {
                if (!e.defaultPrevented) {
                    const t =
                            e.target instanceof HTMLFormElement
                                ? e.target
                                : void 0,
                        s = e.submitter || void 0;
                    if (t) {
                        "dialog" !=
                            ((null == s
                                ? void 0
                                : s.getAttribute("formmethod")) ||
                                t.getAttribute("method")) &&
                            this.delegate.willSubmitForm(t, s) &&
                            (e.preventDefault(),
                            this.delegate.formSubmitted(t, s));
                    }
                }
            }),
            (this.delegate = e);
    }
    start() {
        this.started ||
            (addEventListener("submit", this.submitCaptured, !0),
            (this.started = !0));
    }
    stop() {
        this.started &&
            (removeEventListener("submit", this.submitCaptured, !0),
            (this.started = !1));
    }
}
class FrameRedirector {
    constructor(e) {
        (this.element = e),
            (this.linkInterceptor = new LinkInterceptor(this, e)),
            (this.formInterceptor = new FormInterceptor(this, e));
    }
    start() {
        this.linkInterceptor.start(), this.formInterceptor.start();
    }
    stop() {
        this.linkInterceptor.stop(), this.formInterceptor.stop();
    }
    shouldInterceptLinkClick(e, t) {
        return this.shouldRedirect(e);
    }
    linkClickIntercepted(e, t) {
        const s = this.findFrameElement(e);
        s && s.delegate.linkClickIntercepted(e, t);
    }
    shouldInterceptFormSubmission(e, t) {
        return this.shouldSubmit(e, t);
    }
    formSubmissionIntercepted(e, t) {
        const s = this.findFrameElement(e, t);
        s &&
            (s.removeAttribute("reloadable"),
            s.delegate.formSubmissionIntercepted(e, t));
    }
    shouldSubmit(e, t) {
        var s;
        const i = getAction(e, t),
            r = this.element.ownerDocument.querySelector(
                'meta[name="turbo-root"]'
            ),
            n = expandURL(
                null !== (s = null == r ? void 0 : r.content) && void 0 !== s
                    ? s
                    : "/"
            );
        return this.shouldRedirect(e, t) && locationIsVisitable(i, n);
    }
    shouldRedirect(e, t) {
        const s = this.findFrameElement(e, t);
        return !!s && s != e.closest("turbo-frame");
    }
    findFrameElement(e, t) {
        const s =
            (null == t ? void 0 : t.getAttribute("data-turbo-frame")) ||
            e.getAttribute("data-turbo-frame");
        if (s && "_top" != s) {
            const e = this.element.querySelector(`#${s}:not([disabled])`);
            if (e instanceof FrameElement) return e;
        }
    }
}
class History {
    constructor(e) {
        (this.restorationIdentifier = uuid()),
            (this.restorationData = {}),
            (this.started = !1),
            (this.pageLoaded = !1),
            (this.onPopState = (e) => {
                if (this.shouldHandlePopState()) {
                    const { turbo: t } = e.state || {};
                    if (t) {
                        this.location = new URL(window.location.href);
                        const { restorationIdentifier: e } = t;
                        (this.restorationIdentifier = e),
                            this.delegate.historyPoppedToLocationWithRestorationIdentifier(
                                this.location,
                                e
                            );
                    }
                }
            }),
            (this.onPageLoad = async (e) => {
                await nextMicrotask(), (this.pageLoaded = !0);
            }),
            (this.delegate = e);
    }
    start() {
        this.started ||
            (addEventListener("popstate", this.onPopState, !1),
            addEventListener("load", this.onPageLoad, !1),
            (this.started = !0),
            this.replace(new URL(window.location.href)));
    }
    stop() {
        this.started &&
            (removeEventListener("popstate", this.onPopState, !1),
            removeEventListener("load", this.onPageLoad, !1),
            (this.started = !1));
    }
    push(e, t) {
        this.update(history.pushState, e, t);
    }
    replace(e, t) {
        this.update(history.replaceState, e, t);
    }
    update(e, t, s = uuid()) {
        const i = { turbo: { restorationIdentifier: s } };
        e.call(history, i, "", t.href),
            (this.location = t),
            (this.restorationIdentifier = s);
    }
    getRestorationDataForIdentifier(e) {
        return this.restorationData[e] || {};
    }
    updateRestorationData(e) {
        const { restorationIdentifier: t } = this,
            s = this.restorationData[t];
        this.restorationData[t] = Object.assign(Object.assign({}, s), e);
    }
    assumeControlOfScrollRestoration() {
        var e;
        this.previousScrollRestoration ||
            ((this.previousScrollRestoration =
                null !== (e = history.scrollRestoration) && void 0 !== e
                    ? e
                    : "auto"),
            (history.scrollRestoration = "manual"));
    }
    relinquishControlOfScrollRestoration() {
        this.previousScrollRestoration &&
            ((history.scrollRestoration = this.previousScrollRestoration),
            delete this.previousScrollRestoration);
    }
    shouldHandlePopState() {
        return this.pageIsLoaded();
    }
    pageIsLoaded() {
        return this.pageLoaded || "complete" == document.readyState;
    }
}
class LinkClickObserver {
    constructor(e) {
        (this.started = !1),
            (this.clickCaptured = () => {
                removeEventListener("click", this.clickBubbled, !1),
                    addEventListener("click", this.clickBubbled, !1);
            }),
            (this.clickBubbled = (e) => {
                if (this.clickEventIsSignificant(e)) {
                    const t =
                            (e.composedPath && e.composedPath()[0]) || e.target,
                        s = this.findLinkFromClickTarget(t);
                    if (s) {
                        const t = this.getLocationForLink(s);
                        this.delegate.willFollowLinkToLocation(s, t) &&
                            (e.preventDefault(),
                            this.delegate.followedLinkToLocation(s, t));
                    }
                }
            }),
            (this.delegate = e);
    }
    start() {
        this.started ||
            (addEventListener("click", this.clickCaptured, !0),
            (this.started = !0));
    }
    stop() {
        this.started &&
            (removeEventListener("click", this.clickCaptured, !0),
            (this.started = !1));
    }
    clickEventIsSignificant(e) {
        return !(
            (e.target && e.target.isContentEditable) ||
            e.defaultPrevented ||
            e.which > 1 ||
            e.altKey ||
            e.ctrlKey ||
            e.metaKey ||
            e.shiftKey
        );
    }
    findLinkFromClickTarget(e) {
        if (e instanceof Element)
            return e.closest("a[href]:not([target^=_]):not([download])");
    }
    getLocationForLink(e) {
        return expandURL(e.getAttribute("href") || "");
    }
}
function isAction(e) {
    return "advance" == e || "replace" == e || "restore" == e;
}
class Navigator {
    constructor(e) {
        this.delegate = e;
    }
    proposeVisit(e, t = {}) {
        this.delegate.allowsVisitingLocationWithAction(e, t.action) &&
            (locationIsVisitable(e, this.view.snapshot.rootLocation)
                ? this.delegate.visitProposedToLocation(e, t)
                : (window.location.href = e.toString()));
    }
    startVisit(e, t, s = {}) {
        this.stop(),
            (this.currentVisit = new Visit(
                this,
                expandURL(e),
                t,
                Object.assign({ referrer: this.location }, s)
            )),
            this.currentVisit.start();
    }
    submitForm(e, t) {
        this.stop(),
            (this.formSubmission = new FormSubmission(this, e, t, !0)),
            this.formSubmission.start();
    }
    stop() {
        this.formSubmission &&
            (this.formSubmission.stop(), delete this.formSubmission),
            this.currentVisit &&
                (this.currentVisit.cancel(), delete this.currentVisit);
    }
    get adapter() {
        return this.delegate.adapter;
    }
    get view() {
        return this.delegate.view;
    }
    get history() {
        return this.delegate.history;
    }
    formSubmissionStarted(e) {
        "function" == typeof this.adapter.formSubmissionStarted &&
            this.adapter.formSubmissionStarted(e);
    }
    async formSubmissionSucceededWithResponse(e, t) {
        if (e == this.formSubmission) {
            const s = await t.responseHTML;
            if (s) {
                e.method != FetchMethod.get && this.view.clearSnapshotCache();
                const { statusCode: i, redirected: r } = t,
                    n = {
                        action: this.getActionForFormSubmission(e),
                        response: {
                            statusCode: i,
                            responseHTML: s,
                            redirected: r,
                        },
                    };
                this.proposeVisit(t.location, n);
            }
        }
    }
    async formSubmissionFailedWithResponse(e, t) {
        const s = await t.responseHTML;
        if (s) {
            const e = PageSnapshot.fromHTMLString(s);
            t.serverError
                ? await this.view.renderError(e)
                : await this.view.renderPage(e),
                this.view.scrollToTop(),
                this.view.clearSnapshotCache();
        }
    }
    formSubmissionErrored(e, t) {
        console.error(t);
    }
    formSubmissionFinished(e) {
        "function" == typeof this.adapter.formSubmissionFinished &&
            this.adapter.formSubmissionFinished(e);
    }
    visitStarted(e) {
        this.delegate.visitStarted(e);
    }
    visitCompleted(e) {
        this.delegate.visitCompleted(e);
    }
    locationWithActionIsSamePage(e, t) {
        const s = getAnchor(e),
            i = getAnchor(this.view.lastRenderedLocation),
            r = "restore" === t && void 0 === s;
        return (
            "replace" !== t &&
            getRequestURL(e) ===
                getRequestURL(this.view.lastRenderedLocation) &&
            (r || (null != s && s !== i))
        );
    }
    visitScrolledToSamePageLocation(e, t) {
        this.delegate.visitScrolledToSamePageLocation(e, t);
    }
    get location() {
        return this.history.location;
    }
    get restorationIdentifier() {
        return this.history.restorationIdentifier;
    }
    getActionForFormSubmission(e) {
        const { formElement: t, submitter: s } = e,
            i = getAttribute("data-turbo-action", s, t);
        return isAction(i) ? i : "advance";
    }
}
!(function (e) {
    (e[(e.initial = 0)] = "initial"),
        (e[(e.loading = 1)] = "loading"),
        (e[(e.interactive = 2)] = "interactive"),
        (e[(e.complete = 3)] = "complete");
})(PageStage || (PageStage = {}));
class PageObserver {
    constructor(e) {
        (this.stage = PageStage.initial),
            (this.started = !1),
            (this.interpretReadyState = () => {
                const { readyState: e } = this;
                "interactive" == e
                    ? this.pageIsInteractive()
                    : "complete" == e && this.pageIsComplete();
            }),
            (this.pageWillUnload = () => {
                this.delegate.pageWillUnload();
            }),
            (this.delegate = e);
    }
    start() {
        this.started ||
            (this.stage == PageStage.initial &&
                (this.stage = PageStage.loading),
            document.addEventListener(
                "readystatechange",
                this.interpretReadyState,
                !1
            ),
            addEventListener("pagehide", this.pageWillUnload, !1),
            (this.started = !0));
    }
    stop() {
        this.started &&
            (document.removeEventListener(
                "readystatechange",
                this.interpretReadyState,
                !1
            ),
            removeEventListener("pagehide", this.pageWillUnload, !1),
            (this.started = !1));
    }
    pageIsInteractive() {
        this.stage == PageStage.loading &&
            ((this.stage = PageStage.interactive),
            this.delegate.pageBecameInteractive());
    }
    pageIsComplete() {
        this.pageIsInteractive(),
            this.stage == PageStage.interactive &&
                ((this.stage = PageStage.complete), this.delegate.pageLoaded());
    }
    get readyState() {
        return document.readyState;
    }
}
class ScrollObserver {
    constructor(e) {
        (this.started = !1),
            (this.onScroll = () => {
                this.updatePosition({
                    x: window.pageXOffset,
                    y: window.pageYOffset,
                });
            }),
            (this.delegate = e);
    }
    start() {
        this.started ||
            (addEventListener("scroll", this.onScroll, !1),
            this.onScroll(),
            (this.started = !0));
    }
    stop() {
        this.started &&
            (removeEventListener("scroll", this.onScroll, !1),
            (this.started = !1));
    }
    updatePosition(e) {
        this.delegate.scrollPositionChanged(e);
    }
}
class StreamObserver {
    constructor(e) {
        (this.sources = new Set()),
            (this.started = !1),
            (this.inspectFetchResponse = (e) => {
                const t = fetchResponseFromEvent(e);
                t &&
                    fetchResponseIsStream(t) &&
                    (e.preventDefault(), this.receiveMessageResponse(t));
            }),
            (this.receiveMessageEvent = (e) => {
                this.started &&
                    "string" == typeof e.data &&
                    this.receiveMessageHTML(e.data);
            }),
            (this.delegate = e);
    }
    start() {
        this.started ||
            ((this.started = !0),
            addEventListener(
                "turbo:before-fetch-response",
                this.inspectFetchResponse,
                !1
            ));
    }
    stop() {
        this.started &&
            ((this.started = !1),
            removeEventListener(
                "turbo:before-fetch-response",
                this.inspectFetchResponse,
                !1
            ));
    }
    connectStreamSource(e) {
        this.streamSourceIsConnected(e) ||
            (this.sources.add(e),
            e.addEventListener("message", this.receiveMessageEvent, !1));
    }
    disconnectStreamSource(e) {
        this.streamSourceIsConnected(e) &&
            (this.sources.delete(e),
            e.removeEventListener("message", this.receiveMessageEvent, !1));
    }
    streamSourceIsConnected(e) {
        return this.sources.has(e);
    }
    async receiveMessageResponse(e) {
        const t = await e.responseHTML;
        t && this.receiveMessageHTML(t);
    }
    receiveMessageHTML(e) {
        this.delegate.receivedMessageFromStream(new StreamMessage(e));
    }
}
function fetchResponseFromEvent(e) {
    var t;
    const s =
        null === (t = e.detail) || void 0 === t ? void 0 : t.fetchResponse;
    if (s instanceof FetchResponse) return s;
}
function fetchResponseIsStream(e) {
    var t;
    return (null !== (t = e.contentType) && void 0 !== t ? t : "").startsWith(
        StreamMessage.contentType
    );
}
class ErrorRenderer extends Renderer {
    async render() {
        this.replaceHeadAndBody(), this.activateScriptElements();
    }
    replaceHeadAndBody() {
        const { documentElement: e, head: t, body: s } = document;
        e.replaceChild(this.newHead, t), e.replaceChild(this.newElement, s);
    }
    activateScriptElements() {
        for (const e of this.scriptElements) {
            const t = e.parentNode;
            if (t) {
                const s = this.createScriptElement(e);
                t.replaceChild(s, e);
            }
        }
    }
    get newHead() {
        return this.newSnapshot.headSnapshot.element;
    }
    get scriptElements() {
        return [...document.documentElement.querySelectorAll("script")];
    }
}
class PageRenderer extends Renderer {
    get shouldRender() {
        return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
    }
    prepareToRender() {
        this.mergeHead();
    }
    async render() {
        this.willRender && this.replaceBody();
    }
    finishRendering() {
        super.finishRendering(),
            this.isPreview || this.focusFirstAutofocusableElement();
    }
    get currentHeadSnapshot() {
        return this.currentSnapshot.headSnapshot;
    }
    get newHeadSnapshot() {
        return this.newSnapshot.headSnapshot;
    }
    get newElement() {
        return this.newSnapshot.element;
    }
    mergeHead() {
        this.copyNewHeadStylesheetElements(),
            this.copyNewHeadScriptElements(),
            this.removeCurrentHeadProvisionalElements(),
            this.copyNewHeadProvisionalElements();
    }
    replaceBody() {
        this.preservingPermanentElements(() => {
            this.activateNewBody(), this.assignNewBody();
        });
    }
    get trackedElementsAreIdentical() {
        return (
            this.currentHeadSnapshot.trackedElementSignature ==
            this.newHeadSnapshot.trackedElementSignature
        );
    }
    copyNewHeadStylesheetElements() {
        for (const e of this.newHeadStylesheetElements)
            document.head.appendChild(e);
    }
    copyNewHeadScriptElements() {
        for (const e of this.newHeadScriptElements)
            document.head.appendChild(this.createScriptElement(e));
    }
    removeCurrentHeadProvisionalElements() {
        for (const e of this.currentHeadProvisionalElements)
            document.head.removeChild(e);
    }
    copyNewHeadProvisionalElements() {
        for (const e of this.newHeadProvisionalElements)
            document.head.appendChild(e);
    }
    activateNewBody() {
        document.adoptNode(this.newElement),
            this.activateNewBodyScriptElements();
    }
    activateNewBodyScriptElements() {
        for (const e of this.newBodyScriptElements) {
            const t = this.createScriptElement(e);
            e.replaceWith(t);
        }
    }
    assignNewBody() {
        document.body && this.newElement instanceof HTMLBodyElement
            ? document.body.replaceWith(this.newElement)
            : document.documentElement.appendChild(this.newElement);
    }
    get newHeadStylesheetElements() {
        return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(
            this.currentHeadSnapshot
        );
    }
    get newHeadScriptElements() {
        return this.newHeadSnapshot.getScriptElementsNotInSnapshot(
            this.currentHeadSnapshot
        );
    }
    get currentHeadProvisionalElements() {
        return this.currentHeadSnapshot.provisionalElements;
    }
    get newHeadProvisionalElements() {
        return this.newHeadSnapshot.provisionalElements;
    }
    get newBodyScriptElements() {
        return this.newElement.querySelectorAll("script");
    }
}
class SnapshotCache {
    constructor(e) {
        (this.keys = []), (this.snapshots = {}), (this.size = e);
    }
    has(e) {
        return toCacheKey(e) in this.snapshots;
    }
    get(e) {
        if (this.has(e)) {
            const t = this.read(e);
            return this.touch(e), t;
        }
    }
    put(e, t) {
        return this.write(e, t), this.touch(e), t;
    }
    clear() {
        this.snapshots = {};
    }
    read(e) {
        return this.snapshots[toCacheKey(e)];
    }
    write(e, t) {
        this.snapshots[toCacheKey(e)] = t;
    }
    touch(e) {
        const t = toCacheKey(e),
            s = this.keys.indexOf(t);
        s > -1 && this.keys.splice(s, 1), this.keys.unshift(t), this.trim();
    }
    trim() {
        for (const e of this.keys.splice(this.size)) delete this.snapshots[e];
    }
}
class PageView extends View {
    constructor() {
        super(...arguments),
            (this.snapshotCache = new SnapshotCache(10)),
            (this.lastRenderedLocation = new URL(location.href));
    }
    renderPage(e, t = !1, s = !0) {
        const i = new PageRenderer(this.snapshot, e, t, s);
        return this.render(i);
    }
    renderError(e) {
        const t = new ErrorRenderer(this.snapshot, e, !1);
        return this.render(t);
    }
    clearSnapshotCache() {
        this.snapshotCache.clear();
    }
    async cacheSnapshot() {
        if (this.shouldCacheSnapshot) {
            this.delegate.viewWillCacheSnapshot();
            const { snapshot: e, lastRenderedLocation: t } = this;
            await nextEventLoopTick();
            const s = e.clone();
            return this.snapshotCache.put(t, s), s;
        }
    }
    getCachedSnapshotForLocation(e) {
        return this.snapshotCache.get(e);
    }
    get snapshot() {
        return PageSnapshot.fromElement(this.element);
    }
    get shouldCacheSnapshot() {
        return this.snapshot.isCacheable;
    }
}
class Session {
    constructor() {
        (this.navigator = new Navigator(this)),
            (this.history = new History(this)),
            (this.view = new PageView(this, document.documentElement)),
            (this.adapter = new BrowserAdapter(this)),
            (this.pageObserver = new PageObserver(this)),
            (this.cacheObserver = new CacheObserver()),
            (this.linkClickObserver = new LinkClickObserver(this)),
            (this.formSubmitObserver = new FormSubmitObserver(this)),
            (this.scrollObserver = new ScrollObserver(this)),
            (this.streamObserver = new StreamObserver(this)),
            (this.frameRedirector = new FrameRedirector(
                document.documentElement
            )),
            (this.drive = !0),
            (this.enabled = !0),
            (this.progressBarDelay = 500),
            (this.started = !1);
    }
    start() {
        this.started ||
            (this.pageObserver.start(),
            this.cacheObserver.start(),
            this.linkClickObserver.start(),
            this.formSubmitObserver.start(),
            this.scrollObserver.start(),
            this.streamObserver.start(),
            this.frameRedirector.start(),
            this.history.start(),
            (this.started = !0),
            (this.enabled = !0));
    }
    disable() {
        this.enabled = !1;
    }
    stop() {
        this.started &&
            (this.pageObserver.stop(),
            this.cacheObserver.stop(),
            this.linkClickObserver.stop(),
            this.formSubmitObserver.stop(),
            this.scrollObserver.stop(),
            this.streamObserver.stop(),
            this.frameRedirector.stop(),
            this.history.stop(),
            (this.started = !1));
    }
    registerAdapter(e) {
        this.adapter = e;
    }
    visit(e, t = {}) {
        this.navigator.proposeVisit(expandURL(e), t);
    }
    connectStreamSource(e) {
        this.streamObserver.connectStreamSource(e);
    }
    disconnectStreamSource(e) {
        this.streamObserver.disconnectStreamSource(e);
    }
    renderStreamMessage(e) {
        document.documentElement.appendChild(StreamMessage.wrap(e).fragment);
    }
    clearCache() {
        this.view.clearSnapshotCache();
    }
    setProgressBarDelay(e) {
        this.progressBarDelay = e;
    }
    get location() {
        return this.history.location;
    }
    get restorationIdentifier() {
        return this.history.restorationIdentifier;
    }
    historyPoppedToLocationWithRestorationIdentifier(e, t) {
        this.enabled
            ? this.navigator.startVisit(e, t, {
                  action: "restore",
                  historyChanged: !0,
              })
            : this.adapter.pageInvalidated();
    }
    scrollPositionChanged(e) {
        this.history.updateRestorationData({ scrollPosition: e });
    }
    willFollowLinkToLocation(e, t) {
        return (
            this.elementDriveEnabled(e) &&
            locationIsVisitable(t, this.snapshot.rootLocation) &&
            this.applicationAllowsFollowingLinkToLocation(e, t)
        );
    }
    followedLinkToLocation(e, t) {
        const s = this.getActionForLink(e);
        this.convertLinkWithMethodClickToFormSubmission(e) ||
            this.visit(t.href, { action: s });
    }
    convertLinkWithMethodClickToFormSubmission(e) {
        const t = e.getAttribute("data-turbo-method");
        if (t) {
            const s = document.createElement("form");
            (s.method = t),
                (s.action = e.getAttribute("href") || "undefined"),
                (s.hidden = !0),
                e.hasAttribute("data-turbo-confirm") &&
                    s.setAttribute(
                        "data-turbo-confirm",
                        e.getAttribute("data-turbo-confirm")
                    );
            const i = this.getTargetFrameForLink(e);
            return (
                i
                    ? (s.setAttribute("data-turbo-frame", i),
                      s.addEventListener("turbo:submit-start", () =>
                          s.remove()
                      ))
                    : s.addEventListener("submit", () => s.remove()),
                document.body.appendChild(s),
                dispatch("submit", { cancelable: !0, target: s })
            );
        }
        return !1;
    }
    allowsVisitingLocationWithAction(e, t) {
        return (
            this.locationWithActionIsSamePage(e, t) ||
            this.applicationAllowsVisitingLocation(e)
        );
    }
    visitProposedToLocation(e, t) {
        extendURLWithDeprecatedProperties(e),
            this.adapter.visitProposedToLocation(e, t);
    }
    visitStarted(e) {
        extendURLWithDeprecatedProperties(e.location),
            e.silent ||
                this.notifyApplicationAfterVisitingLocation(
                    e.location,
                    e.action
                );
    }
    visitCompleted(e) {
        this.notifyApplicationAfterPageLoad(e.getTimingMetrics());
    }
    locationWithActionIsSamePage(e, t) {
        return this.navigator.locationWithActionIsSamePage(e, t);
    }
    visitScrolledToSamePageLocation(e, t) {
        this.notifyApplicationAfterVisitingSamePageLocation(e, t);
    }
    willSubmitForm(e, t) {
        const s = getAction(e, t);
        return (
            this.elementDriveEnabled(e) &&
            (!t || this.elementDriveEnabled(t)) &&
            locationIsVisitable(expandURL(s), this.snapshot.rootLocation)
        );
    }
    formSubmitted(e, t) {
        this.navigator.submitForm(e, t);
    }
    pageBecameInteractive() {
        (this.view.lastRenderedLocation = this.location),
            this.notifyApplicationAfterPageLoad();
    }
    pageLoaded() {
        this.history.assumeControlOfScrollRestoration();
    }
    pageWillUnload() {
        this.history.relinquishControlOfScrollRestoration();
    }
    receivedMessageFromStream(e) {
        this.renderStreamMessage(e);
    }
    viewWillCacheSnapshot() {
        var e;
        (null === (e = this.navigator.currentVisit) || void 0 === e
            ? void 0
            : e.silent) || this.notifyApplicationBeforeCachingSnapshot();
    }
    allowsImmediateRender({ element: e }, t) {
        return !this.notifyApplicationBeforeRender(e, t).defaultPrevented;
    }
    viewRenderedSnapshot(e, t) {
        (this.view.lastRenderedLocation = this.history.location),
            this.notifyApplicationAfterRender();
    }
    viewInvalidated() {
        this.adapter.pageInvalidated();
    }
    frameLoaded(e) {
        this.notifyApplicationAfterFrameLoad(e);
    }
    frameRendered(e, t) {
        this.notifyApplicationAfterFrameRender(e, t);
    }
    applicationAllowsFollowingLinkToLocation(e, t) {
        return !this.notifyApplicationAfterClickingLinkToLocation(e, t)
            .defaultPrevented;
    }
    applicationAllowsVisitingLocation(e) {
        return !this.notifyApplicationBeforeVisitingLocation(e)
            .defaultPrevented;
    }
    notifyApplicationAfterClickingLinkToLocation(e, t) {
        return dispatch("turbo:click", {
            target: e,
            detail: { url: t.href },
            cancelable: !0,
        });
    }
    notifyApplicationBeforeVisitingLocation(e) {
        return dispatch("turbo:before-visit", {
            detail: { url: e.href },
            cancelable: !0,
        });
    }
    notifyApplicationAfterVisitingLocation(e, t) {
        return (
            markAsBusy(document.documentElement),
            dispatch("turbo:visit", { detail: { url: e.href, action: t } })
        );
    }
    notifyApplicationBeforeCachingSnapshot() {
        return dispatch("turbo:before-cache");
    }
    notifyApplicationBeforeRender(e, t) {
        return dispatch("turbo:before-render", {
            detail: { newBody: e, resume: t },
            cancelable: !0,
        });
    }
    notifyApplicationAfterRender() {
        return dispatch("turbo:render");
    }
    notifyApplicationAfterPageLoad(e = {}) {
        return (
            clearBusyState(document.documentElement),
            dispatch("turbo:load", {
                detail: { url: this.location.href, timing: e },
            })
        );
    }
    notifyApplicationAfterVisitingSamePageLocation(e, t) {
        dispatchEvent(
            new HashChangeEvent("hashchange", {
                oldURL: e.toString(),
                newURL: t.toString(),
            })
        );
    }
    notifyApplicationAfterFrameLoad(e) {
        return dispatch("turbo:frame-load", { target: e });
    }
    notifyApplicationAfterFrameRender(e, t) {
        return dispatch("turbo:frame-render", {
            detail: { fetchResponse: e },
            target: t,
            cancelable: !0,
        });
    }
    elementDriveEnabled(e) {
        const t = null == e ? void 0 : e.closest("[data-turbo]");
        return this.drive
            ? !t || "false" != t.getAttribute("data-turbo")
            : !!t && "true" == t.getAttribute("data-turbo");
    }
    getActionForLink(e) {
        const t = e.getAttribute("data-turbo-action");
        return isAction(t) ? t : "advance";
    }
    getTargetFrameForLink(e) {
        const t = e.getAttribute("data-turbo-frame");
        if (t) return t;
        {
            const t = e.closest("turbo-frame");
            if (t) return t.id;
        }
    }
    get snapshot() {
        return this.view.snapshot;
    }
}
function extendURLWithDeprecatedProperties(e) {
    Object.defineProperties(e, deprecatedLocationPropertyDescriptors);
}
const deprecatedLocationPropertyDescriptors = {
        absoluteURL: {
            get() {
                return this.toString();
            },
        },
    },
    session = new Session(),
    { navigator: navigator$1 } = session;
function start() {
    session.start();
}
function registerAdapter(e) {
    session.registerAdapter(e);
}
function visit(e, t) {
    session.visit(e, t);
}
function connectStreamSource(e) {
    session.connectStreamSource(e);
}
function disconnectStreamSource(e) {
    session.disconnectStreamSource(e);
}
function renderStreamMessage(e) {
    session.renderStreamMessage(e);
}
function clearCache() {
    session.clearCache();
}
function setProgressBarDelay(e) {
    session.setProgressBarDelay(e);
}
function setConfirmMethod(e) {
    FormSubmission.confirmMethod = e;
}
var Turbo = Object.freeze({
    __proto__: null,
    navigator: navigator$1,
    session: session,
    PageRenderer: PageRenderer,
    PageSnapshot: PageSnapshot,
    start: start,
    registerAdapter: registerAdapter,
    visit: visit,
    connectStreamSource: connectStreamSource,
    disconnectStreamSource: disconnectStreamSource,
    renderStreamMessage: renderStreamMessage,
    clearCache: clearCache,
    setProgressBarDelay: setProgressBarDelay,
    setConfirmMethod: setConfirmMethod,
});
class FrameController {
    constructor(e) {
        (this.fetchResponseLoaded = (e) => {}),
            (this.currentFetchRequest = null),
            (this.resolveVisitPromise = () => {}),
            (this.connected = !1),
            (this.hasBeenLoaded = !1),
            (this.settingSourceURL = !1),
            (this.element = e),
            (this.view = new FrameView(this, this.element)),
            (this.appearanceObserver = new AppearanceObserver(
                this,
                this.element
            )),
            (this.linkInterceptor = new LinkInterceptor(this, this.element)),
            (this.formInterceptor = new FormInterceptor(this, this.element));
    }
    connect() {
        this.connected ||
            ((this.connected = !0),
            (this.reloadable = !1),
            this.loadingStyle == FrameLoadingStyle.lazy &&
                this.appearanceObserver.start(),
            this.linkInterceptor.start(),
            this.formInterceptor.start(),
            this.sourceURLChanged());
    }
    disconnect() {
        this.connected &&
            ((this.connected = !1),
            this.appearanceObserver.stop(),
            this.linkInterceptor.stop(),
            this.formInterceptor.stop());
    }
    disabledChanged() {
        this.loadingStyle == FrameLoadingStyle.eager && this.loadSourceURL();
    }
    sourceURLChanged() {
        (this.loadingStyle == FrameLoadingStyle.eager || this.hasBeenLoaded) &&
            this.loadSourceURL();
    }
    loadingStyleChanged() {
        this.loadingStyle == FrameLoadingStyle.lazy
            ? this.appearanceObserver.start()
            : (this.appearanceObserver.stop(), this.loadSourceURL());
    }
    async loadSourceURL() {
        if (
            !this.settingSourceURL &&
            this.enabled &&
            this.isActive &&
            (this.reloadable || this.sourceURL != this.currentURL)
        ) {
            const e = this.currentURL;
            if (((this.currentURL = this.sourceURL), this.sourceURL))
                try {
                    (this.element.loaded = this.visit(
                        expandURL(this.sourceURL)
                    )),
                        this.appearanceObserver.stop(),
                        await this.element.loaded,
                        (this.hasBeenLoaded = !0);
                } catch (t) {
                    throw ((this.currentURL = e), t);
                }
        }
    }
    async loadResponse(e) {
        (e.redirected || (e.succeeded && e.isHTML)) &&
            (this.sourceURL = e.response.url);
        try {
            const t = await e.responseHTML;
            if (t) {
                const { body: s } = parseHTMLDocument(t),
                    i = new Snapshot(await this.extractForeignFrameElement(s)),
                    r = new FrameRenderer(this.view.snapshot, i, !1, !1);
                this.view.renderPromise && (await this.view.renderPromise),
                    await this.view.render(r),
                    session.frameRendered(e, this.element),
                    session.frameLoaded(this.element),
                    this.fetchResponseLoaded(e);
            }
        } catch (e) {
            console.error(e), this.view.invalidate();
        } finally {
            this.fetchResponseLoaded = () => {};
        }
    }
    elementAppearedInViewport(e) {
        this.loadSourceURL();
    }
    shouldInterceptLinkClick(e, t) {
        return (
            !e.hasAttribute("data-turbo-method") &&
            this.shouldInterceptNavigation(e)
        );
    }
    linkClickIntercepted(e, t) {
        (this.reloadable = !0), this.navigateFrame(e, t);
    }
    shouldInterceptFormSubmission(e, t) {
        return this.shouldInterceptNavigation(e, t);
    }
    formSubmissionIntercepted(e, t) {
        this.formSubmission && this.formSubmission.stop(),
            (this.reloadable = !1),
            (this.formSubmission = new FormSubmission(this, e, t));
        const { fetchRequest: s } = this.formSubmission;
        this.prepareHeadersForRequest(s.headers, s),
            this.formSubmission.start();
    }
    prepareHeadersForRequest(e, t) {
        e["Turbo-Frame"] = this.id;
    }
    requestStarted(e) {
        markAsBusy(this.element);
    }
    requestPreventedHandlingResponse(e, t) {
        this.resolveVisitPromise();
    }
    async requestSucceededWithResponse(e, t) {
        await this.loadResponse(t), this.resolveVisitPromise();
    }
    requestFailedWithResponse(e, t) {
        console.error(t), this.resolveVisitPromise();
    }
    requestErrored(e, t) {
        console.error(t), this.resolveVisitPromise();
    }
    requestFinished(e) {
        clearBusyState(this.element);
    }
    formSubmissionStarted({ formElement: e }) {
        markAsBusy(e, this.findFrameElement(e));
    }
    formSubmissionSucceededWithResponse(e, t) {
        const s = this.findFrameElement(e.formElement, e.submitter);
        this.proposeVisitIfNavigatedWithAction(s, e.formElement, e.submitter),
            s.delegate.loadResponse(t);
    }
    formSubmissionFailedWithResponse(e, t) {
        this.element.delegate.loadResponse(t);
    }
    formSubmissionErrored(e, t) {
        console.error(t);
    }
    formSubmissionFinished({ formElement: e }) {
        clearBusyState(e, this.findFrameElement(e));
    }
    allowsImmediateRender(e, t) {
        return !0;
    }
    viewRenderedSnapshot(e, t) {}
    viewInvalidated() {}
    async visit(e) {
        var t;
        const s = new FetchRequest(
            this,
            FetchMethod.get,
            e,
            new URLSearchParams(),
            this.element
        );
        return (
            null === (t = this.currentFetchRequest) ||
                void 0 === t ||
                t.cancel(),
            (this.currentFetchRequest = s),
            new Promise((e) => {
                (this.resolveVisitPromise = () => {
                    (this.resolveVisitPromise = () => {}),
                        (this.currentFetchRequest = null),
                        e();
                }),
                    s.perform();
            })
        );
    }
    navigateFrame(e, t, s) {
        const i = this.findFrameElement(e, s);
        this.proposeVisitIfNavigatedWithAction(i, e, s),
            i.setAttribute("reloadable", ""),
            (i.src = t);
    }
    proposeVisitIfNavigatedWithAction(e, t, s) {
        const i = getAttribute("data-turbo-action", s, t, e);
        if (isAction(i)) {
            const { visitCachedSnapshot: t } = new SnapshotSubstitution(e);
            e.delegate.fetchResponseLoaded = (s) => {
                if (e.src) {
                    const { statusCode: r, redirected: n } = s,
                        o = {
                            statusCode: r,
                            redirected: n,
                            responseHTML:
                                e.ownerDocument.documentElement.outerHTML,
                        };
                    session.visit(e.src, {
                        action: i,
                        response: o,
                        visitCachedSnapshot: t,
                        willRender: !1,
                    });
                }
            };
        }
    }
    findFrameElement(e, t) {
        var s;
        return null !==
            (s = getFrameElementById(
                getAttribute("data-turbo-frame", t, e) ||
                    this.element.getAttribute("target")
            )) && void 0 !== s
            ? s
            : this.element;
    }
    async extractForeignFrameElement(e) {
        let t;
        const s = CSS.escape(this.id);
        try {
            if (
                (t = activateElement(
                    e.querySelector(`turbo-frame#${s}`),
                    this.currentURL
                ))
            )
                return t;
            if (
                (t = activateElement(
                    e.querySelector(`turbo-frame[src][recurse~=${s}]`),
                    this.currentURL
                ))
            )
                return await t.loaded, await this.extractForeignFrameElement(t);
            console.error(
                `Response has no matching <turbo-frame id="${s}"> element`
            );
        } catch (e) {
            console.error(e);
        }
        return new FrameElement();
    }
    formActionIsVisitable(e, t) {
        return locationIsVisitable(
            expandURL(getAction(e, t)),
            this.rootLocation
        );
    }
    shouldInterceptNavigation(e, t) {
        const s =
            getAttribute("data-turbo-frame", t, e) ||
            this.element.getAttribute("target");
        if (e instanceof HTMLFormElement && !this.formActionIsVisitable(e, t))
            return !1;
        if (!this.enabled || "_top" == s) return !1;
        if (s) {
            const e = getFrameElementById(s);
            if (e) return !e.disabled;
        }
        return (
            !!session.elementDriveEnabled(e) &&
            !(t && !session.elementDriveEnabled(t))
        );
    }
    get id() {
        return this.element.id;
    }
    get enabled() {
        return !this.element.disabled;
    }
    get sourceURL() {
        if (this.element.src) return this.element.src;
    }
    get reloadable() {
        return this.findFrameElement(this.element).hasAttribute("reloadable");
    }
    set reloadable(e) {
        const t = this.findFrameElement(this.element);
        e ? t.setAttribute("reloadable", "") : t.removeAttribute("reloadable");
    }
    set sourceURL(e) {
        (this.settingSourceURL = !0),
            (this.element.src = null != e ? e : null),
            (this.currentURL = this.element.src),
            (this.settingSourceURL = !1);
    }
    get loadingStyle() {
        return this.element.loading;
    }
    get isLoading() {
        return (
            void 0 !== this.formSubmission ||
            void 0 !== this.resolveVisitPromise()
        );
    }
    get isActive() {
        return this.element.isActive && this.connected;
    }
    get rootLocation() {
        var e;
        const t = this.element.ownerDocument.querySelector(
            'meta[name="turbo-root"]'
        );
        return expandURL(
            null !== (e = null == t ? void 0 : t.content) && void 0 !== e
                ? e
                : "/"
        );
    }
}
class SnapshotSubstitution {
    constructor(e) {
        (this.visitCachedSnapshot = ({ element: e }) => {
            var t;
            const { id: s, clone: i } = this;
            null === (t = e.querySelector("#" + s)) ||
                void 0 === t ||
                t.replaceWith(i);
        }),
            (this.clone = e.cloneNode(!0)),
            (this.id = e.id);
    }
}
function getFrameElementById(e) {
    if (null != e) {
        const t = document.getElementById(e);
        if (t instanceof FrameElement) return t;
    }
}
function activateElement(e, t) {
    if (e) {
        const s = e.getAttribute("src");
        if (null != s && null != t && urlsAreEqual(s, t))
            throw new Error(
                `Matching <turbo-frame id="${e.id}"> element has a source URL which references itself`
            );
        if (
            (e.ownerDocument !== document && (e = document.importNode(e, !0)),
            e instanceof FrameElement)
        )
            return e.connectedCallback(), e.disconnectedCallback(), e;
    }
}
const StreamActions = {
    after() {
        this.targetElements.forEach((e) => {
            var t;
            return null === (t = e.parentElement) || void 0 === t
                ? void 0
                : t.insertBefore(this.templateContent, e.nextSibling);
        });
    },
    append() {
        this.removeDuplicateTargetChildren(),
            this.targetElements.forEach((e) => e.append(this.templateContent));
    },
    before() {
        this.targetElements.forEach((e) => {
            var t;
            return null === (t = e.parentElement) || void 0 === t
                ? void 0
                : t.insertBefore(this.templateContent, e);
        });
    },
    prepend() {
        this.removeDuplicateTargetChildren(),
            this.targetElements.forEach((e) => e.prepend(this.templateContent));
    },
    remove() {
        this.targetElements.forEach((e) => e.remove());
    },
    replace() {
        this.targetElements.forEach((e) => e.replaceWith(this.templateContent));
    },
    update() {
        this.targetElements.forEach((e) => {
            (e.innerHTML = ""), e.append(this.templateContent);
        });
    },
};
class StreamElement extends HTMLElement {
    async connectedCallback() {
        try {
            await this.render();
        } catch (e) {
            console.error(e);
        } finally {
            this.disconnect();
        }
    }
    async render() {
        var e;
        return null !== (e = this.renderPromise) && void 0 !== e
            ? e
            : (this.renderPromise = (async () => {
                  this.dispatchEvent(this.beforeRenderEvent) &&
                      (await nextAnimationFrame(), this.performAction());
              })());
    }
    disconnect() {
        try {
            this.remove();
        } catch (e) {}
    }
    removeDuplicateTargetChildren() {
        this.duplicateChildren.forEach((e) => e.remove());
    }
    get duplicateChildren() {
        var e;
        const t = this.targetElements
                .flatMap((e) => [...e.children])
                .filter((e) => !!e.id),
            s = [
                ...(null === (e = this.templateContent) || void 0 === e
                    ? void 0
                    : e.children),
            ]
                .filter((e) => !!e.id)
                .map((e) => e.id);
        return t.filter((e) => s.includes(e.id));
    }
    get performAction() {
        if (this.action) {
            const e = StreamActions[this.action];
            if (e) return e;
            this.raise("unknown action");
        }
        this.raise("action attribute is missing");
    }
    get targetElements() {
        return this.target
            ? this.targetElementsById
            : this.targets
            ? this.targetElementsByQuery
            : void this.raise("target or targets attribute is missing");
    }
    get templateContent() {
        return this.templateElement.content.cloneNode(!0);
    }
    get templateElement() {
        if (this.firstElementChild instanceof HTMLTemplateElement)
            return this.firstElementChild;
        this.raise("first child element must be a <template> element");
    }
    get action() {
        return this.getAttribute("action");
    }
    get target() {
        return this.getAttribute("target");
    }
    get targets() {
        return this.getAttribute("targets");
    }
    raise(e) {
        throw new Error(`${this.description}: ${e}`);
    }
    get description() {
        var e, t;
        return null !==
            (t = (
                null !== (e = this.outerHTML.match(/<[^>]+>/)) && void 0 !== e
                    ? e
                    : []
            )[0]) && void 0 !== t
            ? t
            : "<turbo-stream>";
    }
    get beforeRenderEvent() {
        return new CustomEvent("turbo:before-stream-render", {
            bubbles: !0,
            cancelable: !0,
        });
    }
    get targetElementsById() {
        var e;
        const t =
            null === (e = this.ownerDocument) || void 0 === e
                ? void 0
                : e.getElementById(this.target);
        return null !== t ? [t] : [];
    }
    get targetElementsByQuery() {
        var e;
        const t =
            null === (e = this.ownerDocument) || void 0 === e
                ? void 0
                : e.querySelectorAll(this.targets);
        return 0 !== t.length ? Array.prototype.slice.call(t) : [];
    }
}
(FrameElement.delegateConstructor = FrameController),
    customElements.define("turbo-frame", FrameElement),
    customElements.define("turbo-stream", StreamElement),
    (() => {
        let e = document.currentScript;
        if (e && !e.hasAttribute("data-turbo-suppress-warning"))
            for (; (e = e.parentElement); )
                if (e == document.body)
                    return console.warn(
                        unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `,
                        e.outerHTML
                    );
    })(),
    (window.Turbo = Turbo),
    start();
