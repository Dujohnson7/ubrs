package com.ubrs.ubrs_backend.service.announcement;

import com.ubrs.ubrs_backend.domain.dto.announcement.AnnouncementRequestDto;
import com.ubrs.ubrs_backend.domain.dto.announcement.AnnouncementResponseDto;

import java.util.List;
import java.util.UUID;

public interface IAnnouncementService {
    AnnouncementResponseDto getAnnouncement(UUID announcementId);
    AnnouncementResponseDto saveAnnouncement(AnnouncementRequestDto requestDto);
    AnnouncementResponseDto updateAnnouncement(UUID announcementId, AnnouncementRequestDto requestDto);
    void deleteAnnouncement(UUID announcementId);
    List<AnnouncementResponseDto> getAllAnnouncements();
}
