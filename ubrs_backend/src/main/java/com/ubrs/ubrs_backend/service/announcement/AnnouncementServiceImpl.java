package com.ubrs.ubrs_backend.service.announcement;

import com.ubrs.ubrs_backend.domain.dto.announcement.AnnouncementRequestDto;
import com.ubrs.ubrs_backend.domain.dto.announcement.AnnouncementResponseDto;
import com.ubrs.ubrs_backend.domain.entity.Announcement;
import com.ubrs.ubrs_backend.domain.mapper.AnnouncementMapper;
import com.ubrs.ubrs_backend.repository.IAnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements IAnnouncementService{

    private final IAnnouncementRepository announcementRepository;
    private final AnnouncementMapper announcementMapper;

    @Override
    public AnnouncementResponseDto getAnnouncement(UUID announcementId) {
        Announcement announcement = announcementRepository.findAnnouncementById(announcementId).orElseThrow(()-> new RuntimeException("Announcement not found"));
        return announcementMapper.toAnnouncementDto(announcement);
    }

    @Override
    public AnnouncementResponseDto saveAnnouncement(AnnouncementRequestDto requestDto) {
        Announcement announcement = new Announcement();

        announcement.setMessage(requestDto.getMessage());
        announcement.setReminderState(requestDto.getReminderState());
        announcement.setActiveTime(requestDto.getActiveTime());
        announcement.setExpireTime(requestDto.getExpireTime());

        Announcement announcementSaved = announcementRepository.save(announcement);
        return announcementMapper.toAnnouncementDto(announcementSaved);
    }

    @Override
    public AnnouncementResponseDto updateAnnouncement(UUID announcementId, AnnouncementRequestDto requestDto) {
        Announcement existAnnouncement = announcementRepository.findAnnouncementById(announcementId).orElseThrow(()-> new RuntimeException("Announcement not found"));

        existAnnouncement.setMessage(requestDto.getMessage());
        existAnnouncement.setReminderState(requestDto.getReminderState());
        existAnnouncement.setActiveTime(requestDto.getActiveTime());
        existAnnouncement.setExpireTime(requestDto.getExpireTime());

        Announcement announcementSaved = announcementRepository.save(existAnnouncement);
        return announcementMapper.toAnnouncementDto(announcementSaved);
    }

    @Override
    public void deleteAnnouncement(UUID announcementId) {
        Announcement existAnnouncement = announcementRepository.findAnnouncementById(announcementId).orElseThrow(()-> new RuntimeException("Announcement not found"));
        announcementRepository.delete(existAnnouncement);
    }

    @Override
    public List<AnnouncementResponseDto> getAllAnnouncements() {
        List<Announcement> announcementsList = announcementRepository.findAll();
        return announcementMapper.toAnnouncementDtoList(announcementsList);
    }
}
