export enum UserRole {
    STAFF = 'staff',
    CHIEF = 'chief',
    ADMIN = 'admin'
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    team_id: string;
    profile_photo_url?: string;
    team_name: string;
}

export enum CampaignStatus {
    PLANNED = 'planned',
    ACTIVE = 'active',
    PAUSED = 'paused',
    COMPLETE = 'complete'
}

export interface Campaign {
    id: string;
    team_id: string;
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    owner_id: string;
    status: CampaignStatus;
}

export interface Goal {
    id: string;
    campaign_id: string;
    description: string;
    target: number;
    current: number;
    progress_pct: number;
}

export enum InputType {
    LINK = 'link',
    NOTE = 'note',
    FILE = 'file',
    PRODUCT = 'product'
}

export interface Input {
    id:string;
    type: InputType;
    title: string;
    link_url?: string;
    campaign_id: string;
    created_by: string;
    created_at: string;
    campaigns?: { name: string };
    profiles?: { full_name: string };
}

export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    BLOCKED = 'blocked',
    DONE = 'done'
}

export enum TaskPriority {
    LOW = 'low',
    MED = 'med',
    HIGH = 'high',
    URGENT = 'urgent'
}

export interface Task {
    id: string;
    title: string;
    assignee_id: string;
    due_date?: string;
    status: TaskStatus;
    priority?: TaskPriority;
    campaign_id: string;
    campaigns?: { name: string };
    profiles?: { full_name: string };
}

export enum EngagementType {
    BRIEFING = 'briefing',
    COMMUNITY_MEETING = 'community_meeting',
    MEDIA_INTERVIEW = 'media_interview',
    STAKEHOLDER_MEET = 'stakeholder_meet'
}

export interface Engagement {
    id: string;
    date: string;
    type: EngagementType;
    audience?: string;
    location?: string;
    campaign_id: string;
    outcomes?: string;
    campaigns?: { name: string };
}

export enum Sentiment {
    NEGATIVE = 'negative',
    NEUTRAL = 'neutral',
    POSITIVE = 'positive'
}

export interface MediaLog {
    id: string;
    date: string;
    outlet: string;
    headline?: string;
    sentiment?: Sentiment;
    reach?: number;
    campaign_id: string;
    campaigns?: { name: string };
}

export enum MediaQueryStatus {
    NEW = 'new',
    ASSIGNED = 'assigned',
    ANSWERED = 'answered',
    CLOSED = 'closed'
}

export interface MediaQuery {
    id: string;
    date: string;
    outlet: string;
    topic: string;
    deadline?: string;
    status: MediaQueryStatus;
    assigned_to?: string;
    profiles?: { full_name: string };
}

export interface ComplanSection {
    title: string;
    content: string;
}