package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.announcement.AnnouncementResponseDto;
import com.ubrs.ubrs_backend.domain.entity.Announcement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AnnouncementMapper {
    @Mapping(source = "id", target = "announcementId")
    AnnouncementResponseDto toAnnouncementDto(Announcement announcement);

    List<AnnouncementResponseDto> toAnnouncementDtoList(List<Announcement> announcements);
}
