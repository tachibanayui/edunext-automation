import Browser from "webextension-polyfill";
import { MessagePayload } from "../common";

// console.log("EduNext Automation Injecting...")
// Browser.scripting.executeScript({
//     target: { tabId:  }
// })

// const is = document.createElement('script');
// is.onload = function () {
//     (this as any).remove();
// };
// is.src = "./injectedScript.js";
// document.appendChild(is);
// (document.head || document.documentElement).appendChild(s);

const activityMatch = /\/activity\?sessionid=(\d+)&activityId=(\d+)/g;

Browser.runtime.onMessage.addListener((message: MessagePayload, sender) => {
    if (message.type === "FowardedContextMenu") {
        const { id } = message;
        switch (id) {
            case "auto-grade-activity":
                const isMatch = window.location.href.match(activityMatch);
                if (isMatch) {

                }
                break;
            case "print-edn":
                console.log("Printing Object start with EDN in the global scrope:");
                console.log(Object.keys(window));
                console.log(
                    Object.keys(window)
                        .filter((x) => x.startsWith("EDN"))
                        .map((x) => ({ name: x, val: window[x as any] }))
                );
                break;
        }
    } else if (message.type === "InjectScriptResponse") {
        if (!message.success)
            console.error("Cannot inject script, please reload your browser windows!")
    }
});

// Init
(async () => {
    const is: MessagePayload = {
        type: "InjectScript"
    }
    await Browser.runtime.sendMessage(undefined, is)
})()

