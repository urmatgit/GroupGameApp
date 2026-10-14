using System;
using GroupGame.Domain.Enums;

namespace GroupGame.Application.Contracts;

public record AttendanceRecordRequest(Guid UserId, AttendanceStatus Status);
