import { Controller } from "@hotwired/stimulus";
import { loadScript, loadScriptWithInnerHTML } from "./utils/load_script";
import { is_sk, is_wedding } from "./utils/utils";

const idToGemiusCodes = {
    101: {
        homepage: "zDhAfbAgs1TfcPsxzDsxA8TVfQTZVzu6qWYQSUplssn.77",
        bazaar: "11A6tqr0L0x.FuhMt0e95rPWXhY_ni800EZmj9qFwuv.K7",
        forum: "11Ca1qr0P01FM1IH6KEys2XFXhZBlC80IYLsSz9CGjH.97",
        photoblog: "bPAwEkNbU7ORsurQRY_t77S4.s0_km7mcNDs24qVkir.n7",
        other: "bD3qH9Acfv8PsFh8JIbxF7d8fbt8rjruZEl6GCPUzUz.t7",
    },
    301: {
        homepage: "zN5AfTg5aweS1H_Jke0xK_UUHZIpr2LIc4xeR5dnXQX.i7",
        bazaar: "10Y6tiNx5v0t3qYajMJi8IZiXoyRGEcASxolMrRTwsP.V7",
        forum: "bPqQ0sreG_Yo6F9XKdCdSLS47Am_Y2xJkJFiNqJyFUj.g7",
        photoblog: "bVCa1srB9v3uYiCVUhT2b2XjTBLBoix3QYroFCcL7dv.A7",
        other: "bDhKgVhxRy.M3FYuUPNus7ccfZr8wCL2JIeeuGvMtQr.f7",
    },
    102: {
        homepage: "AkflpK9QSQhd5ruXTEgNEZevXhYUAa71LmaVv4Puu5b.B7",
        bazaar: "15aaeGNYv2cS9G92zDvUVcPcP1HWaqNBaBnOCdVxm3T.f7",
        forum: "d2AwFIN.0xaoQogRLbQgx5a0fdqpl7upGPjGNSqmRkz.l7",
        photoblog: "baCQ1Aup484zfSfl6qSAqaPN3wgG8OLwKIg4RdVea2P.z7",
        other: "nG5LAAi2tDXyB8SuFlCxLuTk7OkRswPgE0zDF5nd3jj.W7",
    },
    302: {
        homepage: "AkhFBq7Q2dr9yls9rHKVlcVHTBLZpyw3xDPrM3v_a4P.27",
        bazaar: "zUqQcurbY3wDKMgnSfqYRnYXP1JBPjsohd_dILylHVn.c7",
        forum: "d2A6FoL.L5RCX3_67KKcFcQ8fdo_gyLANL5UxC7vSM..b7",
        photoblog: "d1aa1oMyPxUIWOjD9RaBo3YX3whBPnra5YJdMGPkbYb.c7",
        other: "ogHrQL_bJBonPtQSY7N5J5evTMmspyw7FWALGAEY00..n7",
    },
    401: null,
};

export const getGemiusCode = (server_id, pathname) => {
    const codes = idToGemiusCodes[server_id];

    if (server_id === 101) {
        return "nc.r4r8vJ.UOnFLuGmHnV5YUj_hpgGePIhZc92UU9Rf.u7";
    }

    if (!codes || !pathname) {
        return null;
    }

    if (pathname === "/") {
        return codes.homepage;
    }

    if (pathname.startsWith("/market")) {
        return codes.bazaar;
    }

    if (pathname.startsWith("/forum")) {
        return codes.forum;
    }

    if (pathname.startsWith("/blog")) {
        return codes.photoblog;
    }

    return codes.other;
};

export const gemiusHit = (code) => {
    if (window.pp_gemius_hit) {
        window.pp_gemius_hit(code);
    }
};

export default class extends Controller {
    static values = {
        id: Number,
    };

    connect() {
        // not sure if this is the right way to check if gemius is loaded
        if (typeof window.gemius_init === "undefined") {
            this.gemiusLoaded = false;
        } else {
            this.gemiusLoaded = true;
        }
        this.renderScript();
        this.gemiusLoadOrHit();
    }

    gemiusLoadOrHit = () => {
        if (!this.gemiusLoaded) {
            loadScript({ src: this.gemiusScriptSrc(), async: "" }).then(
                () => (this.gemiusLoaded = true)
            );
        } else {
            gemiusHit(getGemiusCode(location.pathname));
        }
    };

    gemiusScriptSrc = () => {
        if (is_wedding && is_sk) {
            return `//gemius.zoznam.sk/xgemius.js`;
        }
        const countryCode = is_sk ? "sk" : "cz";
        return `//ga${countryCode}.hit.gemius.pl/xgemius.js`;
    };

    renderScript = () => {
        loadScriptWithInnerHTML(
            { type: "text/javascript" },
            `var pp_gemius_identifier = '${getGemiusCode(
                this.idValue,
                location.pathname
            )}';
            var pp_gemius_use_cmp = true;
            var pp_gemius_cmp_timeout = Infinity;`
        );
    };
}
