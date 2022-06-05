import * as fuapi from "../fuapi";
import { GetSessionActivityDetailResponse } from "../fuapi";

console.log("Injected!");

export var EDNAutomation = {
    maxScore: {
        evaluateInsideGroupItem: (userId: number): fuapi.EvaluateInsideGroupItem => ({
            userId: userId,
            cooperativePoint: 5,
            goodPoint: 5,
            hardWorkingPoint: 5,
        }),
    },
    getParamsOnActitvity: function (action: string) {
        const matches = Array.from(window.location.href.matchAll(/activity\?sessionid=(\d+)&activityId=(\d+)/gi))?.[0];
        if (!matches) {
            alert(
                "Please open an activity page to use this feature!\n" +
                    "Make sure your url bar show something like: https://fu.edunext.vn/en/session/activity?sessionid=110765&activityId=737622"
            );
            return { confirmation: false, sessionId: 0, activityId: 0 };
        }

        const [_, sessionId, activityId] = matches;

        const confirmation = confirm(`You are about to run ${action} action on this activity. Are you sure?`);
        if (confirmation) {
            return { confirmation: true, sessionId: parseInt(sessionId), activityId: parseInt(activityId) };
        } else {
            return { confirmation: false, sessionId: 0, activityId: 0 };
        }
    },
    getParamsOnSlot: function (action: string) {
        const sessionIdStr = window.location.href.matchAll(/sessionId=(\d+)/gi)?.next().value[1];
        if (!sessionIdStr) {
            alert(
                "Please open an activity page or slot detail page to use this feature!\n" +
                    "Make sure your url bar show something like:\n" +
                    "https://fu.edunext.vn/en/session/activity?sessionid=110765&activityId=737622\n" +
                    "https://fu.edunext.vn/en/session/detail?sessionId=110765"
            );

            return { confirmation: false, sessionId: 0 };
        }

        const sessionId = parseInt(sessionIdStr);
        const confirmation = confirm(`You are about to run ${action} action on this slot. Are you sure?`);
        if (confirmation) {
            return { confirmation: true, sessionId: sessionId };
        } else {
            return { confirmation: false, sessionId: 0 };
        }
    },
    getParamsOnClass: async function (action: string) {
         const matches = window.location.href
             .matchAll(/\/course\/([a-z0-9-]+).*\?classId=(\d+)/g)
            ?.next().value;
        
        if (matches) {
            alert(
                "Please open a course page to use this feature!\n" +
                    "Make sure your url bar show something like:\n" +
                    "https://fu.edunext.vn/en/course/operating-systems?classId=422\n"
            );
            return { confirmation: false, permalink: "", classId: 0, courseId: 0 };
        }

        const [_, permalink, classIdStr] = matches;
        const confirmation = confirm(`You are about to run ${action} action on this class. Are you sure?`);
        if (confirmation) {
            const courseId = (await fuapi.getCourseDetail(permalink)).data.id;
            return { confirmation: true, permalink, classId: parseInt(classIdStr), courseId };
        } else {
            return { confirmation: false, permalink: "", classId: 0, courseId: 0 };
        }
    },
    printResult: function (result: any) {
        console.log("RESULT:");
        console.log(result);
        alert(`Done! Read console to for details`);
    },
    evaluateActivity: async function (activityName: string, activityId: number, classId: number, groupId: number) {
        try {
            console.log(`Evaluating activity: ${activityName} (id: ${activityId})`);
            const groupMembers = await fuapi.getEvaluateInsideGroup(activityId, classId, groupId);
            const userIds = groupMembers.data.map((x) => x.userId);
            const grades = userIds.map((x) => this.maxScore.evaluateInsideGroupItem(x));
            await fuapi.evaluateInsideGroup(grades, activityId, classId, groupId);
            return { activityName: activityName, memberCount: groupMembers.data.length };
        } catch (e) {
            console.error(`Evaluating activity failed!: ${activityName} (id: ${activityId})\n${e}`);
            return { activityName: activityName, memberCount: 0 };
        }
    },
    handleGradeActivity: async function () {
        // Disable TypeScript because I don't want to create a declaration on EduNext api
        const wd = window as any;
        const { activityId, classId, groupId } = wd.EDNActivityControl.params;
        const activityName = document.querySelector<HTMLElement>(".edn-lesson-title")?.innerText ?? "Unknown";
        const result = await this.evaluateActivity(activityName, activityId, classId, groupId);
        console.log("RESULT:");
        console.log(result);
        alert(`Graded ${result.memberCount} members. Read console to for details`);
    },
    evaluateGradeSlot: async function (classId: number, sessionId: number) {
        const activities = await fuapi.getActivities(sessionId);
        const activityIds = activities.data.flatMap((d) => d.activities?.map((x) => x.id) ?? []);
        console.log(`Evaluating slot: ${activities.data[0].title} (id: ${sessionId})`);
        try {
            const detailedActivities = await Promise.all(
                activityIds.map((id) => fuapi.getSessionActivityDetail(id, sessionId))
            );
            const result = await Promise.all(
                detailedActivities.map((x) =>
                    this.evaluateActivity(x.data.activity.title, x.data.activity.id, classId, x.data.groupId)
                )
            );

            return { activities: result, title: activities.data[0].title, sessionId: sessionId };
        } catch (e) {
            console.error(`Evaluating slot failed: ${activities.data[0].title} (id: ${sessionId})\n${e}`);
            return { activities: [], title: activities.data[0].title, sessionId: sessionId };
        }
    },
    handleGradeSlot: async function () {
        // Disable TypeScript because I don't want to create a declaration on EduNext api
        const wd = window as any;
        const { classId } = wd.EDNActivityControl.params;

        const sessionIdStr = window.location.href.matchAll(/sessionId=(\d+)/g)?.next().value[1];
        if (!sessionIdStr) {
            alert("No sessionId found! Make sure you are on the slot detail and activity page.");
        }

        const sessionId = parseInt(sessionIdStr);
        const result = await this.evaluateGradeSlot(classId, sessionId);
        console.log("RESULT:");
        console.log(result);
        alert(`Graded ${result.activities.length} activities. Read console to for details`);
    },
    evaluateClass: async function (title: string, courseId: number, classId: number) {
        try {
            const resp = await fuapi.getSessionList(classId, courseId);
            console.log(`Evaluating class id: ${classId}`);
            const sessionIds = resp.data.sessions.map((x) => x.sessionId);
            const result = await Promise.all(sessionIds.map((x) => this.evaluateGradeSlot(classId, x)));
            return { title, slots: result };
        } catch (e) {
            console.error(`Evaluating class failed!: ${title} (id: ${classId})\n${e}`);
            return { title, slots: [] };
        }
    },
    handleGradeClass: async function () {
        const [_, permalink, classIdStr] = window.location.href
            .matchAll(/\/course\/([a-z0-9-]+).*\?classId=(\d+)/g)
            ?.next().value;
        const courseId = (await fuapi.getCourseDetail(permalink)).data.id;

        const result = await this.evaluateClass(permalink, courseId, parseInt(classIdStr));
        console.log("RESULT:");
        console.log(result);
        alert(`Graded ${result.slots.length} slots. Read console to for details`);
    },
    getAllComments: async function (contextId: number, courseId: number, groupId: number) {
        const groupComments = [];
        let cardsVoted;
        let noOfRemainingComment;
        let page = 1;
        do {
            const cmtResp = await fuapi.getComments(contextId, courseId, groupId, false, page);
            cardsVoted = cmtResp.CardsVoted;
            noOfRemainingComment = cmtResp.NumberOfRemainingComments;
            groupComments.push(...cmtResp.Comments);
            page = cmtResp.NextPage;
        } while (page != 0);

        const publicComments = [];
        page = 1;
        try {
            do {
                const cmtResp = await fuapi.getComments(contextId, courseId, 0, true, page);
                publicComments.push(...cmtResp.Comments);
                page = cmtResp.NextPage;
            } while (page != 0);
        } catch (e) {}

        return { cardsVoted, groupComments, publicComments, noOfRemainingComment };
    },
    createVotePayload: (
        commentId: number,
        ownerId: number,
        groupId: number,
        classInfo: GetSessionActivityDetailResponse,
        isVoted: boolean,
        cardType: number
    ) => ({
        CommentId: commentId,
        CardType: cardType,
        IsVoted: isVoted,
        OnwId: ownerId,
        CourseId: classInfo.data.activity.courseId,
        ActivityId: classInfo.data.activity.id,
        GroupId: groupId,
        CurrentUrl: `https://fu.edunext.vn/en/session/activity?sessionid=12&activityId=72`,
        ClientKey: `vote-${commentId}-${Date.now().valueOf()}`,
        ClassId: classInfo.data.userRoleInSession.classId,
        CurrentGroupId: classInfo.data.groupId,
    }),
    calculatePoints: async function (
        comments: fuapi.GetCommentsResponse["Comments"],
        cardsVoted: fuapi.GetCommentsResponse["CardsVoted"],
        classInfo: GetSessionActivityDetailResponse,
        cardType: number
    ) {
        const points = comments
            .filter((x) => !x.CreatedByCurrentUser)
            .map((x) => ({
                id: x.Id,
                ownerId: x.Creator,
                groupId: x.GroupId,
                point: x.Point,
                deductable: x.Cards.find((c) => c.IsVoted)?.CardValue ?? 0,
                votePoint: 0,
            }))
            .sort((a, b) => a.point - a.deductable - (b.point - b.deductable));

        const sCardVoted = cardsVoted
            .filter((x) => x.Type === cardType)
            .sort((a, b) => b.CardPoint - a.CardPoint)
            .map((x) => ({ card: x, point: x.CardPoint, limit: x.RemainVote + x.NumberVoted }));

        let index = 0;
        for (const card of sCardVoted) {
            for (let i = 0; i < card.limit; i++) {
                if (index >= points.length) {
                    break;
                }

                points[index++].votePoint += card.card.CardPoint;
            }
        }

        await Promise.all(
            points
                .filter((x) => x.deductable > 0 && x.deductable !== x.votePoint)
                .map(async (x) => {
                    const cardType = sCardVoted.find((c) => c.point === x.deductable)?.card.CardType;
                    if (cardType !== undefined) {
                        await fuapi.voteComment(
                            this.createVotePayload(x.id, x.ownerId, x.groupId, classInfo, true, cardType)
                        );
                    }
                })
        );

        await Promise.all(
            points
                .filter((x) => x.votePoint && x.deductable !== x.votePoint)
                .map(async (x) => {
                    const cardType = sCardVoted.find((c) => c.point === x.votePoint)?.card.CardType;
                    if (cardType !== undefined) {
                        await fuapi.voteComment(
                            this.createVotePayload(x.id, x.ownerId, x.groupId, classInfo, false, cardType)
                        );
                    }
                })
        );

        return points.filter((x) => x.deductable || x.votePoint);
    },
    distributeStars: async function (activityId: number, sessionId: number) {
        console.log(`Distributing stars for activityId: ${activityId}`);
        try {
            var act = await fuapi.getSessionActivityDetail(activityId, sessionId);
            console.log(`Distributing stars for activity ${act.data.activity.title}`);
            const comments = await this.getAllComments(
                act.data.activity.id,
                act.data.activity.courseId,
                act.data.groupId
            );

            const group = await this.calculatePoints(comments.groupComments, comments.cardsVoted, act, 0);
            const pub = await this.calculatePoints(comments.publicComments, comments.cardsVoted, act, 1);

            return { title: act.data.activity.title, activityId, group, pub };
        } catch (e) {
            console.error(`Distributing stars failed for activityId: ${activityId}\n${e}`);
        }
    },
    handleDistrbuteStarsOnActivity: async function () {
        const { confirmation, activityId, sessionId } = this.getParamsOnActitvity("distribute star evenly");
        if (!confirmation) return;

        const result = await this.distributeStars(activityId, sessionId);
        this.printResult(result);
    },
    distributeStarsOnSlot: async function (sessionId: number) {
        const activities = await fuapi.getActivities(sessionId);
        const activityIds = activities.data.flatMap((d) => d.activities?.map((x) => x.id) ?? []);
        console.log(`Distributing star on slot: ${activities.data[0].title} (id: ${sessionId})`);
        try {
            const result = await Promise.all(activityIds.map((x) => this.distributeStars(x, sessionId)));
            return { activities: result, title: activities.data[0].title, sessionId: sessionId };
        } catch (e) {
            console.error(`Distributing star on slot failed: ${activities.data[0].title} (id: ${sessionId})`);
            console.error(e);
            return { activities: [], title: activities.data[0].title, sessionId: sessionId };
        }
    },
    handleDistributeStarsOnSlot: async function () {
        const { confirmation, sessionId } = this.getParamsOnSlot("distribute star evenly");
        if (!confirmation) return;

        const result = await this.distributeStarsOnSlot(sessionId);
        this.printResult(result);
    },
    distributeStarsOnClass: async function (title: string, classId: number, courseId: number) {
        console.log(`Distributing star on class: ${title}`);
        try {
            const resp = await fuapi.getSessionList(classId, courseId);
            const sessionIds = resp.data.sessions.map((x) => x.sessionId);
            const result = await Promise.all(sessionIds.map((x) => this.distributeStarsOnSlot(x)));
            return { title, slots: result };
        } catch (e) {
            console.error(`Distributing star on class failed!: ${title} (id: ${classId})\n${e}`);
            return { title, slots: [] };
        }
    },
    handleDistributeStarsOnClass: async function () {
        const { confirmation, permalink, classId, courseId } = await this.getParamsOnClass("distribute star evenly");
        if (!confirmation) return;
            
        const result = await this.distributeStarsOnClass(permalink, classId, courseId);
        this.printResult(result);
    },
    createAddCommentPayload: (
        id: number,
        sessionId: number,
        content: string,
        activity: fuapi.GetSessionActivityDetailResponse
    ): fuapi.AddCommentPayload => ({
        id: id,
        ParentKey: activity.data.groupId,
        ContextId: activity.data.activity.id,
        Content: content,
        ParentId: 0,
        ParentIdComment: 0,
        ClientKey: `add-${activity.data.activity.id}-${new Date().valueOf()}`,
        CurrentUrl: `https://fu.edunext.vn/en/session/activity?sessionid=${sessionId}&activityId=${activity.data.activity.id}`,
        CourseId: activity.data.activity.courseId,
        ActivityId: activity.data.activity.id,
        ClassId: activity.data.userRoleInSession.classId,
        GroupId: activity.data.groupId,
        Pings: "{}",
    }),
    autofillActivity: async function (activityId: number, sessionId: number, minCommentLength: number) {
        console.log(`autofill for activityId: ${activityId}`);
        try {
            var act = await fuapi.getSessionActivityDetail(activityId, sessionId);
            let cmts = await this.getAllComments(act.data.activity.id, act.data.activity.courseId, act.data.groupId);
            if (cmts.noOfRemainingComment > 0) {
                await fuapi.addComment(this.createAddCommentPayload(0, sessionId, "<div>.</div>", act));
            }
            cmts = await this.getAllComments(act.data.activity.id, act.data.activity.courseId, act.data.groupId);
            const pc = cmts.groupComments.find((x) => x.CreatedByCurrentUser)?.Id;
            if (!pc) throw new Error("Cannot find posted comment!");

            const highestStar = cmts.groupComments
                .sort((a, b) => b.Point - a.Point)
                .find((x) => x.Content.length > minCommentLength);
            if (highestStar) {
                await fuapi.addComment(this.createAddCommentPayload(pc, sessionId, highestStar.Content, act));
            }

            return {
                activityId: activityId,
                title: act.data.activity.title,
                content: highestStar ? highestStar.Content : "<div>.</div>",
            };
        } catch (e) {
            console.error(`autofill failed for activityId: ${activityId}`);
            console.error(e);
            return { activityId: activityId, title: "", content: "" };
        }
    },
    handleAutofillActivity: async function () {
        const { confirmation, activityId, sessionId } = this.getParamsOnActitvity("autofill");
        if (!confirmation) return;

        const minLength = prompt("Please enter the minimum comment length to autofill: (default: 15)", "15") ?? "15";
        const result = await this.autofillActivity(activityId, sessionId, parseInt(minLength));
        this.printResult(result);
    },
    autofillSlot: async function (sessionId: number, minCommentLength: number) {
        const activities = await fuapi.getActivities(sessionId);
        const activityIds = activities.data.flatMap((d) => d.activities?.map((x) => x.id) ?? []);
        console.log(`Autofill on slot: ${activities.data[0].title} (id: ${sessionId})`);
        try {
            const result = await Promise.all(
                activityIds.map((x) => this.autofillActivity(x, sessionId, minCommentLength))
            );
            return { activities: result, title: activities.data[0].title, sessionId: sessionId };
        } catch (e) {
            console.error(`Autofill on slot failed: ${activities.data[0].title} (id: ${sessionId})`);
            console.error(e);
            return { activities: [], title: activities.data[0].title, sessionId: sessionId };
        }
    },
    handleAutofillSlot: async function () {
        const { confirmation, sessionId } = this.getParamsOnSlot("autofill");
        if (!confirmation) return;

        const minLength = prompt("Please enter the minimum comment length to autofill: (default: 15)", "15") ?? "15";
        const result = await this.autofillSlot(sessionId, parseInt(minLength));
        this.printResult(result);
    },
    autofillClass: async function (title: string, classId: number, courseId: number, minCommentLength: number) {
        console.log(`Autofill on class: ${title}`);
        try {
            const resp = await fuapi.getSessionList(classId, courseId);
            const sessionIds = resp.data.sessions.map((x) => x.sessionId);
            const result = await Promise.all(sessionIds.map((x) => this.autofillSlot(x, minCommentLength)));
            return { title, slots: result };
        } catch (e) {
            console.error(`Autofill on class failed!: ${title} (id: ${classId})\n${e}`);
            return { title, slots: [] };
        }
    },
    handleAutofillClass: async function () {
        const { confirmation, permalink, classId, courseId } = await this.getParamsOnClass("autofill");
        if (!confirmation) return;

        const minLength = prompt("Please enter the minimum comment length to autofill: (default: 15)", "15") ?? "15";
        const result = await this.autofillClass(permalink, classId, courseId, parseInt(minLength));
        this.printResult(result);
    }
};

Object.assign(window, { EDNAutomation });

export {};
