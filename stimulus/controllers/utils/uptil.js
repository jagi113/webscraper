const uptil = (el, f) => {
    if (el) return f(el) ? el : uptil(el.parentNode, f);
};

export default uptil;
