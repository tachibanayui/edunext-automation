import Browser from "webextension-polyfill";
import { defineMenu, NativeOnClickCallback, RetriveMenuId } from "./context-tree-menu";

console.log("S");

interface ForwardedContextMenuMessage {
    type: "FowardedContextMenu";
    id: MenuId;
}

interface InjectScript {
    type: "InjectScript"
}

interface InjectScriptResponse {
    type: "InjectScriptResponse";
    success: boolean;
    message?: string;
}

export type MessagePayload = ForwardedContextMenuMessage | InjectScript | InjectScriptResponse;

const handlePrintEdn: NativeOnClickCallback = (info, tab) => {
    if (tab?.id) {
        Browser.scripting.executeScript({
            target: { tabId: tab.id },
            world: "MAIN" as any, // Not officially supported!
            func: () => {
                console.log("Printing Object start with EDN in the global scrope:");
                console.log(
                    Object.keys(window)
                        .filter((x) => x.startsWith("EDN"))
                        .map((x) => ({ name: x, val: window[x as any] }))
                );
            },
        });
    }
};


const callFromMain = (tabId: number, func: (...args: any[]) => any) => {
    Browser.scripting.executeScript({
        world: "MAIN" as any, // Not officially supported!
        target: { tabId: tabId },
        func: func
    })
}

export const menu = defineMenu([
    {
        title: "EduNext Automation...",
        onClicked: (info, tab) => handleForwardContextMenu(info, tab),
        contexts: ["page"],
        items: [
            {
                id: "auto-grade-activity",
                title: "Grade groupmates on this activity",
                onClicked: (info, tab) =>
                    tab?.id && callFromMain(tab.id, () => (window as any).EDNAutomation.handleGradeActivity()),
            },
            {
                id: "auto-grade-slot",
                title: "Grade groupmates on this slot",
                onClicked: (info, tab) =>
                    tab?.id && callFromMain(tab.id, () => (window as any).EDNAutomation.handleGradeSlot()),
            },
            {
                id: "auto-grade-class",
                title: "Grade groupmates on this class",
                onClicked: (info, tab) =>
                    tab?.id && callFromMain(tab.id, () => (window as any).EDNAutomation.handleGradeClass()),
            },
            { type: "separator" },
            {
                title: "Distribute stars evenly to groupmates",
                items: [
                    {
                        id: "distribute-stars-evenly-activity",
                        title: "On this activity",
                        onClicked: (info, tab) =>
                            tab?.id &&
                            callFromMain(tab.id, () => (window as any).EDNAutomation.handleDistrbuteStarsOnActivity()),
                    },
                    {
                        id: "distribute-stars-evenly-slot",
                        title: "On this slot",
                        onClicked: (info, tab) =>
                            tab?.id &&
                            callFromMain(tab.id, () => (window as any).EDNAutomation.handleDistributeStarsOnSlot()),
                    },
                    {
                        id: "distribute-stars-evenly-class",
                        title: "On this class",
                        onClicked: (info, tab) =>
                            tab?.id &&
                            callFromMain(tab.id, () => (window as any).EDNAutomation.handleDistributeStarsOnClass()),
                    },
                ],
            },
            {
                id: "sync-star-dist",
                title: "Distribute stars evenly (live)",
            },
            { type: "separator" },
            {
                title: "Autofill",
                items: [
                    {
                        id: "autofill-activity",
                        title: "On this activity",
                        onClicked: (info, tab) =>
                            tab?.id &&
                            callFromMain(tab.id, () => (window as any).EDNAutomation.handleAutofillActivity()),
                    },
                    {
                        id: "autofill-slot",
                        title: "On this slot",
                        onClicked: (info, tab) =>
                            tab?.id && callFromMain(tab.id, () => (window as any).EDNAutomation.handleAutofillSlot()),
                    },
                    {
                        id: "autofill-class",
                        title: "On this class",
                        onClicked: (info, tab) =>
                            tab?.id && callFromMain(tab.id, () => (window as any).EDNAutomation.handleAutofillClass()),
                    },
                ],
            },
            {
                title: "Debug",
                items: [
                    {
                        id: "print-edn",
                        title: "Print Edn objects in global scope",
                        onClicked: handlePrintEdn,
                    },
                    { id: "ping", title: "Ping!" },
                ],
            },
        ],
    },
]);

async function handleForwardContextMenu(info: Browser.Menus.OnClickData, tab: Browser.Tabs.Tab | undefined) {
    // const msg: MessagePayload = {
    //     type: "FowardedContextMenu",
    //     id: info.menuItemId.toString() as MenuId,
    // };
    // if (tab?.id) {
    //     await Browser.tabs.sendMessage(tab.id, msg);
    // }
}

export type MenuId = RetriveMenuId<typeof menu>;