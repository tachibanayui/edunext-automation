// TODO: show hide item based on url

import Browser from "webextension-polyfill";
const rid: () => string = require("randomid");

export type Menu<T extends string> = (string | MenuItem<T> | Group<T>)[];
export type RetriveMenuId<T> = T extends CreateMenuReturn<infer P>
    ? P
    : T extends (...args: any[]) => any
    ? ReturnType<T>["name"]
    : never;

/**
 * create a tree menu definition
 * @param tree The context menu tree
 * @returns A function to create menu
 */
export const defineMenu =
    <T extends string>(tree: Menu<T>) =>
    (parentId?: string, noHandler = false) =>
        createMenu(tree, parentId, noHandler);

/**
 * Create a context menu tree
 * @param tree The context menu tree
 * @param parentId parentId for root level menu items
 * @param noHandler Set this to true to prevent registering onclick handler
 * @returns An onject contains a handler and a dummy field to retrieve type
 */
export const createMenu = <T extends string>(
    tree: Menu<T>,
    parentId?: string,
    noHandler = false
): CreateMenuReturn<T> => {
    const lookups = {} as Lookups;
    const declaredGroups = {} as DeclaredGroups<T>;

    createMenu0(tree, lookups, declaredGroups, parentId, undefined, undefined);
    const handler = createHandler(lookups);
    if (!noHandler) Browser.contextMenus.onClicked.addListener(handler);

    return { handler };
};

const createMenu0 = <T extends string>(
    tree: Menu<T>,

    lookups: Lookups,
    declaredGroups: DeclaredGroups<T>,

    parentId?: string,
    handledParentId?: string,
    group?: Group<T>
): void => {
    const extraFields = group ? extractFields(group, declaredGroups) : {};

    for (const x of tree) {
        if (typeof x === "string") {
            const id = rid();
            const { items, onClicked, onCreated, ...rest } = { ...extraFields } as MenuItem<T>;
            Browser.contextMenus.create(
                {
                    ...rest,
                    id,
                    title: x,
                    parentId,
                },
                onCreated
            );
            lookups[id] = { handler: onClicked, handledParentId };
        } else if ((x as Group<T>).groupId || (x as Group<T>).groupItems) {
            const group = x as Group<T>;
            const { groupId, groupItems, groupOnClicked } = group;

            groupId && (declaredGroups[groupId] = x as Group<T>);
            if (groupOnClicked) {
                const gid = groupId ?? `anon-group-${rid()}`;
                lookups[gid] = { handler: groupOnClicked, handledParentId: handledParentId };
                groupItems && createMenu0(groupItems, lookups, declaredGroups, parentId, gid, group);
            } else {
                groupItems && createMenu0(groupItems, lookups, declaredGroups, parentId, handledParentId, group);
            }
        } else {
            const id = x.id ?? rid();
            const { items, inlineGroup, onClicked, onCreated, ...rest } = { ...extraFields, ...x } as MenuItem<T>;
            Browser.contextMenus.create(
                {
                    id,
                    parentId,
                    ...rest,
                },
                onCreated
            );

            lookups[id] = { handler: onClicked, handledParentId };
            if (items) {
                createMenu0(items, lookups, declaredGroups, id, onClicked ? id : handledParentId, inlineGroup ?? group);
            }
        }
    }
};

const extractFields = <T extends string>(group: Group<T>, declaredGroups: DeclaredGroups<T>): MenuItem<T> => {
    const res = {} as MenuItem<T>;
    expandGroup(group, declaredGroups).forEach((x) => Object.assign(res, x));
    return res;
};

const expandGroup = <T extends string>(group: Group<T>, declaredGroups: DeclaredGroups<T>): MenuItem<T>[] => {
    const { groupId, groupItems, inherrits, groupOnClicked, ...rest } = group;
    if (typeof inherrits === "string") {
        return [...expandGroup(declaredGroups[inherrits], declaredGroups), rest];
    } else if (Array.isArray(inherrits)) {
        return [...inherrits.flatMap((x) => expandGroup(declaredGroups[x], declaredGroups))];
    } else {
        return [rest];
    }
};

const createHandler =
    (handlers: Lookups): NativeOnClickCallback =>
    (info, tab) => {
        console.log("handler", handlers, info);
        const cHandler = handlers[info.menuItemId];
        if (cHandler) {
            if (cHandler.handler) {
                cHandler.handler(info, tab);
            } else if (cHandler.handledParentId) {
                handlers[cHandler.handledParentId]?.handler?.(info, tab);
            }
        }
    };

// type Handlers = Record<string, { handler?: OnClickCallback, path: string[] } | undefined>;

type Lookups = Record<string, { handler?: NativeOnClickCallback; handledParentId?: string } | undefined>;
type DeclaredGroups<T extends string> = Record<string, Group<T>>;
type CreateMenuReturn<T extends string> = { handler: NativeOnClickCallback; name?: T };
type Parameter<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never;

export type NativeOnClickCallback = Parameter<typeof Browser.contextMenus.onClicked.addListener>[0];
type OCCP = Parameter<NativeOnClickCallback>;

type NativeMenu0 = Parameter<typeof Browser.contextMenus.create>[0];
type NativeMenu<T extends string> = NativeMenu0 & {
    id?: T;
    parentId?: never;
    onCreated?: () => void;
    onClicked?: NativeOnClickCallback;
};

/**
 * Represent a context menu item in the browser
 */
export type MenuItem<T extends string> = NativeMenu<T> & {
    /**
     * The sub-menu items. Every item in the array will have the parentId field set to this item's id.
     */
    items?: Menu<T>

    /**
     * Syntax sugar for groups.
     */
    inlineGroup?: Group<T>
};

/**
 * A group is a container that menu items inside it will inherrit properties defined in group.
 * A group on its own doesn't do anything
 *
 * Note: a group must specify either {@link groupId} or {@link groupItem} otherwise it will
 * be treated as a MenuItem!
 *
 * Note: a group will not inherrit properties from their parent
 */
export type Group<T extends string> = NativeMenu<T> & {
    /**
     * The id of the group. If not specified, the group will be treated as a MenuItem
     */
    groupId?: string;
    /**
     * Group items will inherrit properties from the group. 
     * Note that a group is not a MenuItem so it isn't the parent of the group items
     */
    groupItems?: Menu<T>;

    /**
     * Sepcify how group item and menu item merge when both are specified
     * - "append-start": group item will be prepended to menu item</li>
     * - "append-end": group item will be appended to menu item
     * - "ignored": group item will be ignored
     * @default "ignored"
     */
    //itemResolutionMode?: "append-start" | "append-end" | "ignored";

    /**
     * Behave the same as {@link MenuItem.items} but their id and parentId
     *  will be evaluated based on the context of the menu item inherriting this group
     */
    //items?: Menu<T>
    
    /**
     * -------------------------
     * 
     * Warning: Use groupId field instead, this field is ignored
     */
    id?: undefined;
    /**
     * Id of groups this group will inherrit properties from.
     *
     * Note: A group can only inherrit groups that already defined before it!
     */
    inherrits?: string | string[];
    /**
     * Callback when a item in this group was clicked
     */
    groupOnClicked?: NativeOnClickCallback;
} & ({ groupId: string } | { groupItems: Menu<T> });
