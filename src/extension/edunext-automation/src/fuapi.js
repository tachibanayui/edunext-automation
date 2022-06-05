export {};

export const evaluateInsideGroup = async (data, activityId, classId, groupId) =>
    await new Promise((resolve, reject) => {
        EDNCommon.Ajax({
            method: "POST",
            url: EDNConfig.ApiUrl.evulateInsideGroup(activityId, classId, groupId),
            contentType: "application/json",
            data: JSON.stringify(data),
            unformatedData: true,
            Success: (data) => (data.message ? reject(data.message) : resolve(data)),
            Error: (ex) => reject(ex),
        });
    });

export const getEvaluateInsideGroup = async (activityId, classId, groupId) =>
    await new Promise((resolve, reject) => {
        EDNCommon.Ajax({
            method: "GET",
            url: EDNConfig.ApiUrl.getEvulateInsideGroup(activityId, classId, groupId),
            Success: (data) => (data.message ? reject(data.message) : resolve(data)),
            Error: (ex) => reject(ex),
        });
    });

export const getActivities = async (sessionId) =>
    await new Promise((resolve, reject) => {
        EDNCommon.Ajax({
            url: EDNConfig.ApiUrl.getListActivityOfSession(sessionId),
            method: "GET",
            contentType: "application/json",
            unformatedData: true,
            Success: (data) => (Array.isArray(data.data) ? resolve(data) : reject(data)),
            Error: (ex) => reject(ex),
        });
    });

export const getClassActivity = async (classId, activityId) =>
    await new Promise((resolve, reject) => {
        EDNCommon.Ajax({
            method: "GET",
            url: EDNConfig.ApiUrl.getClassActivity(classId, activityId),
            Success: (data) => (data.code == 200 && data.data != null ? resolve(data) : reject(data)),
            Error: (ex) => reject(ex),
        });
    });

export const getSessionActivityDetail = async (activityId, sessionId) =>
    await new Promise((resolve, reject) => {
        EDNCommon.Ajax({
            method: "GET",
            url: EDNConfig.ApiUrl.getActivityDetail(activityId, sessionId),
            unformatedData: true,
            Success: (data) => (data.code == 200 && data.data != null ? resolve(data) : reject(data)),
            Error: (ex) => reject(ex),
        });
    });

export const getCourseDetail = async (permalink) =>
    await new Promise((resolve, reject) => {
        EDNCommon.Ajax({
            method: "GET",
            url: EDNConfig.ApiUrl.getCourseDetail(permalink),
            unformatedData: true,
            Success: (data) => (data.code == 200 && data.data != null ? resolve(data) : reject(data)),
            Error: (ex) => reject(ex),
        });
    });


export const getSessionList = async (classId, courseId) =>
    await new Promise((resolve, reject) => {
        EDNCommon.Ajax({
            method: "GET",
            url: EDNConfig.ApiUrl.getSessionByCourseId(classId, courseId),
            unformatedData: true,
            Success: (data) => (data.code == 200 && data.data != null ? resolve(data) : reject(data)),
            Error: (ex) => reject(ex),
        });
    });

export const getComments = async (contextId, courseId, parentId, isPublic, pageIndex = 1) =>
    await new Promise((resolve, reject) => {
        EDNCommon.Ajax({
            method: "GET",
            url: `https://fuapi.edunext.vn/comment/v1/activity/get-comments?Contextid=${contextId}&CourseId=${courseId}&ParentKey=${parentId}&isPublic=${isPublic}&pageIndex=${pageIndex}`,
            unformatedData: true,
            Success: (data) => resolve(data),
            Error: (ex) => reject(ex),
        });
    });

export const voteComment = async (payload) =>
    await new Promise((resolve, reject) => {
        EDNCommon.Ajax({
            method: "POST",
            url: EDNConfig.ApiUrl.addCard,
            contentType: "application/json",
            unformatedData: true,
            data: JSON.stringify(payload),
            Success: (data) => resolve(data),
            Error: (ex) => reject(ex),
        });
    });


export const addComment = async (payload) =>
    await new Promise((resolve, reject) => {
        EDNCommon.Ajax({
            url: EDNConfig.ApiUrl.addComment,
            method: "post",
            data: JSON.stringify(payload),
            contentType: "application/json",
            unformatedData: true,
            Success: (data) => resolve(data),
            Error: (ex) => reject(ex),
        });
    });