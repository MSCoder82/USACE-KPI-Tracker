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
    team_id: string | null;
    profile_photo_url?: string;
    teams?: {
        id: string;
        name: string;
    } | null;
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
    created_at?: string;
    profiles?: { full_name: string };
}

export type KpiType = 'total_media_reach' | 'positive_media_logs' | 'total_engagements' | 'total_outputs';

export const KpiOptions: { value: KpiType; label: string }[] = [
    { value: 'total_media_reach', label: 'Total Media Reach' },
    { value: 'positive_media_logs', label: 'Positive Media Stories' },
    { value: 'total_engagements', label: 'Total Engagements' },
    { value: 'total_outputs', label: 'Total PA Outputs' },
];

export interface Goal {
    id: string;
    campaign_id: string;
    team_id: string;
    description: string;
    kpi_type: KpiType;
    target_value: number;
    created_at: string;
}

export interface GoalProgress {
    goal_id: string;
    description: string;
    kpi_type: KpiType;
    target_value: number;
    current_value: number;
    campaign_name: string;
}


export enum InputCategory {
    OUTPUT = 'OUTPUT',
    OUTTAKE = 'OUTTAKE',
    OUTCOME = 'OUTCOME'
}

export interface Input {
    id: string;
    category: InputCategory;
    name: string; // e.g., 'News release' or 'Reach/Impressions'
    custom_name?: string; // for 'Other' option
    quantity?: number;
    notes?: string;
    links?: string[];
    campaign_id?: string;
    created_by: string;
    created_at: string;
    team_id: string;
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
    description?: string;
    assignee_id: string;
    due_date?: string;
    status: TaskStatus;
    priority?: TaskPriority;
    campaign_id: string;
    team_id: string;
    // FIX: Add optional created_at property to align with database schema and fix usage in DashboardScreen.
    created_at?: string;
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
    team_id: string;
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
    team_id: string;
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
    team_id: string;
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

export interface Team {
    id: string;
    name: string;
}

export interface SocialConnection {
    id: string;
    team_id: string;
    platform: string;
    connection_name: string;
    custom_url?: string;
    connected_at: string;
    profiles?: { full_name: string };
}

export interface SocialPost {
    id: string;
    connection_id: string;
    platform: string;
    post_id: string;
    post_text: string;
    post_url: string;
    author_name: string;
    author_handle: string;
    author_avatar_url: string;
    metrics: {
        likes?: number;
        retweets?: number;
        replies?: number;
        views?: number;
    };
    posted_at: string;
}