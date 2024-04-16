import { MD5 } from "./md5";

export const last_domain_part = window.location.host.split(".").slice(-1)[0];
export const is_cz = last_domain_part === "cz";
export const is_sk = last_domain_part === "sk";
export const is_wedding =
    window.location.host.includes("mojasvadba") || window.location.host.includes("beremese");
export const is_living = window.location.host.includes("modrastrecha");
export const is_garden =
    window.location.host.includes("garden") || window.location.host.includes("zahrada");

export const is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);


export const getHashForPathname = (pathname) => {
    const hash = MD5(pathname);
    if (hash) {
        return hash.slice(0, 40);
    }
    return "";
};
