export interface EvaluateInsideGroupItem {
    userId: number;
    cooperativePoint: number;
    goodPoint: number;
    hardWorkingPoint: number;
}

export interface EvaluateInsideGroupResponse {
    success: boolean;
    message: string;
    code: number;
    callBackFunction: any;
    data: boolean;
    metaData: {
        total: number;
        pageTotal: number;
        pageSize: number;
    };
}

export const evaluateInsideGroup: (
    data: EvaluateInsideGroupItem[],
    activityId: number,
    classId: number,
    groupId: number
) => Promise<EvaluateInsideGroupResponse>;

export interface GetEvaluateInsideGroupResponse {
    success: boolean;
    message: string;
    code: number;
    callBackFunction: null;
    data: {
        rollNumber: string;
        userId: number;
        fullName: string;
        hardWorkingPoint: number;
        goodPoint: number;
        cooperativePoint: number;
        totalPoint: number;
    }[];
    metaData: {
        total: number;
        pageTotal: number;
        pageSize: number;
    };
}

export const getEvaluateInsideGroup: (
    activityId: number,
    classId: number,
    groupId: number
) => Promise<GetEvaluateInsideGroupResponse>;

export interface GetActivitiesResponse {
    success: boolean;
    code: number;
    message: string;
    metaData: null;
    data: {
        id: number;
        externalId: string;
        courseId: number;
        title: string;
        priority: number;
        activities: {
            id: number;
            sectionId: number;
            title: string;
            permalink: string;
            priority: number;
            hasActivityRule: boolean;
            externalCode: string;
            isGroupPresidentCreateCommentOnly: boolean;
            activityType: number;
            startTime: string;
            endTime: string;
            startTimeVote: null;
            currentUTC: string;
            descriptionDisplayOnCourse: boolean;
            availability: number;
            metadata: null;
            isHide: boolean;
        }[];
        sessionTitle: null;
        sessionNumber: number;
        sessionId: number;
    }[];
}

export const getActivities: (sessionId: number) => Promise<GetActivitiesResponse>;

export interface GetClassActivityResponse {
    success: boolean;
    message: string;
    code: number;
    callBackFunction: null;
    data: {
        id: number;
        classId: number;
        courseId: number;
        activityId: number;
        currentUserId: number;
        ownerId: number;
        startTime: string;
        startTimeVote: string | null;
        endTime: string;
        createTime: string;
        updateTime: string;
        duration: number;
        isNotLimitedTimeComments: boolean;
        currentUtc: string;
        errCode: any;
        zoomMeetingUrl: string | null;
        interactOption: string;
    };
    metaData: {
        total: number;
        pageTotal: number;
        pageSize: number;
    };
}

export const getClassActivity: (classId: number, activityId: number) => Promise<GetClassActivityResponse>;

export interface GetSessionActivityDetailResponse {
    data: {
        activity: {
            id: number;
            title: string;
            allowsInsideGroupToViewComments: boolean;
            allowsOutsideGroupToViewComments: boolean;
            courseId: number;
            maxNumberOfComments: number;
        };
        groupId: number;
        maxNumberOfComments: number;
        userRoleInSession: {
            classId: number;
        };
    };
}

export const getSessionActivityDetail: (
    activityId: number,
    sessionId: number
) => Promise<GetSessionActivityDetailResponse>;

export interface GetCourseDetailResponse {
    data: { id: number };
}

export const getCourseDetail: (permalink: string) => Promise<GetCourseDetailResponse>;

export interface GetSessionListResponse {
    data: {
        sessions: {
            sessionId: number;
        }[];
    };
}

export const getSessionList: (classId: number, courseId: number) => Promise<GetSessionListResponse>;

export interface GetCommentsResponse {
    Total: number;
    Comments: {
        Cards: {
            Id: number;
            CommentId: number;
            CardType: number;
            UserId: number;
            IsVoted: boolean;
            Total: number;
            CardValue: number;
            Type: number;
        }[];
        Content: string;
        Contextid: number;
        ContextType: number;
        CreatedByCurrentUser: boolean;
        Creator: number;
        FullName: string;
        GroupId: number;
        GroupName: string;
        Id: number;
        IsIncognito: boolean;
        IsMentor: boolean;
        NumberOfRemainingComments: number;
        Parent: number;
        Point: number;
    }[];
    CardsVoted: {
        NumberVoted: number;
        CardType: number;
        RemainVote: number;
        CardPoint: number;
        Type: number;
    }[];
    MaxOutsideCommentsToView: number;
    NumberOfRemainingComments: number;
    NextPage: number;
}

export const getComments: (
    contextId: number,
    courseId: number,
    parentId: number,
    isPublic: boolean,
    pageIndex = 1,
) => Promise<GetCommentsResponse>;

export interface VoteCommentPayload {
    CommentId: number;
    CardType: number;
    IsVoted: boolean;
    OnwId: number;
    CourseId: number;
    ActivityId: number;
    GroupId: number;
    CurrentUrl: string;
    ClientKey: string;
    ClassId: number;
    CurrentGroupId: number;
}

export interface VoteCommentResponse {
    VotedCardComment: {
        CommentId: number;
        UserId: number;
        Cards: {
            Id: number;
            CommentId: number;
            CardType: number;
            UserId: number;
            IsVoted: boolean;
            Total: number;
            CardValue: number;
            Type: number;
        }[];
        Point: number;
    };
    CardsVoted: {
        NumberVoted: number;
        CardType: number;
        RemainVote: number;
        CardPoint: number;
        Type: number;
    }[];
}

export const voteComment: (payload: VoteCommentPayload) => Promise<VoteCommentResponse>;

export interface AddCommentPayload {
    id: number;
    ParentKey: number;
    ContextId: number;
    Content: string;
    ParentId: number;
    ParentIdComment: number;
    ClientKey: string;
    CurrentUrl: string;
    CourseId: number;
    ActivityId: number;
    ClassId: number;
    GroupId: number;
    Pings: string;
}

export interface AddCommentResponse {
    Id: number;
    NumberOfRemainingComments: string;
}

export const addComment: (payload: AddCommentPayload) => Promise<AddCommentResponse>;