namespace GroupGame.Domain.Enums;

public enum UserRole
{
    User = 1,
    Moderator = 2,
    Administrator = 3
}

public enum UserAccountStatus
{
    Active = 1,
    Suspended = 2,
    Blocked = 3,
    Deleted = 4
}

public enum GameStatus
{
    Draft = 1,
    Open = 2,
    Full = 3,
    StartingSoon = 4,
    InProgress = 5,
    Completed = 6,
    Cancelled = 7
}

public enum ParticipantStatus
{
    Main = 1,
    Waitlist = 2,
    Cancelled = 3,
    Removed = 4
}

public enum AttendanceStatus
{
    Attended = 1,
    NoShow = 2,
    Excused = 3
}

public enum RecurrenceType
{
    Weekly = 1,
    BiWeekly = 2,
    Monthly = 3
}

public enum ComplaintStatus
{
    Pending = 1,
    Investigating = 2,
    Resolved = 3,
    Dismissed = 4
}
