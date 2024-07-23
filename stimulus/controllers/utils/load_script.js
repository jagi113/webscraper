export const loadElement = (attrsObj, elementName) => {
    const element = document.createElement(elementName);
    for (const key of Object.keys(attrsObj)) {
        element.setAttribute(key, attrsObj[key]);
    }

    document.head.appendChild(element);

    return new Promise((resolve, reject) => {
        element.onload = () => {
            resolve(element);
        };
        element.onerror = () => {
            reject(new Error(`Failed to load ${elementName}`));
        };
    });
};

export const loadElementWithInnerHTML = (attrsObj, elementName, innerHtml) => {
    const element = document.createElement(elementName);
    for (const key of Object.keys(attrsObj)) {
        element.setAttribute(key, attrsObj[key]);
    }

    element.innerHTML = innerHtml;
    document.head.appendChild(element);

    return new Promise((resolve, reject) => {
        element.onload = () => {
            resolve(element);
        };
    });
};

export const loadLink = (attrsObj) => {
    return loadElement(attrsObj, "link");
};

export const loadScript = (attrsObj) => {
    return loadElement(attrsObj, "script");
};

export const loadScriptWithInnerHTML = (attrsObj, innerHtml) => {
    return loadElementWithInnerHTML(attrsObj, "script", innerHtml);
};
export const loadScripts = (attrsObjects) => {
    return Promise.all(
        attrsObjects.map((attrObject) => loadScript(attrObject))
    );
};
