/// <reference types="chrome"/>
import Browser from "webextension-polyfill";
import { menu, MessagePayload } from "../common";

Browser.contextMenus.remove("edna-root");
menu();

Browser.runtime.onMessage.addListener(async (m: MessagePayload, s) => {
    switch (m.type) {
        case "InjectScript":
            if (!s.tab?.id) {
                const msg: MessagePayload = { type: "InjectScriptResponse", success: false, message: "Tab id not found!" };
                Browser.runtime.sendMessage(undefined, msg);
                return;
            }

            try {
                await Browser.scripting.executeScript({
                    world: "MAIN" as any,
                    target: { tabId: s.tab.id },
                    files: ["injectedScript.js"],
                });
    
                const msg: MessagePayload = { type: "InjectScriptResponse", success: true, message: "Tab id not found!" };
                Browser.tabs.sendMessage(s.tab.id, msg);
            } catch (e) {
                const msg: MessagePayload = { type: "InjectScriptResponse", success: false, message: "Unexpected error!" };
                Browser.tabs.sendMessage(s.tab.id, msg);
            }
    }
});

console.log("Backgroud script loaded!");
