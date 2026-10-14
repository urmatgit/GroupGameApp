using System.Collections.Generic;

namespace GroupGame.Application.Contracts;

public record MarkAttendanceRequest(List<AttendanceRecordRequest> Records);
