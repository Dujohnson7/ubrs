package com.ubrs.ubrs_backend.domain.dto.announcement;

import com.ubrs.ubrs_backend.util.EReminderState;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class AnnouncementRequestDto {
    private String message;
    private EReminderState reminderState;
    private LocalDateTime activeTime;
    private LocalDateTime expireTime;
}
