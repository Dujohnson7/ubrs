package com.ubrs.ubrs_backend.controller.announcement;

import com.ubrs.ubrs_backend.domain.dto.announcement.AnnouncementRequestDto;
import com.ubrs.ubrs_backend.domain.dto.announcement.AnnouncementResponseDto;
import com.ubrs.ubrs_backend.service.announcement.IAnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/announcement")
public class AnnouncementController {

    private final IAnnouncementService announcementService;

    @GetMapping("/all")
    public ResponseEntity<List<AnnouncementResponseDto>> getAllAnnouncement(){
        try {
            List<AnnouncementResponseDto> announcementDtoList = announcementService.getAllAnnouncements();
            if (Objects.nonNull(announcementDtoList)) {
                return ResponseEntity.ok(announcementDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @GetMapping("/{announcementId}")
    public ResponseEntity<?> getAnnouncementById(@PathVariable String announcementId) {
        try {
            AnnouncementResponseDto announcementDto = announcementService.getAnnouncement(UUID.fromString(announcementId));
            return ResponseEntity.ok(announcementDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerAnnouncement(@RequestBody AnnouncementRequestDto announcementDto) {
        try {
            AnnouncementResponseDto announcement =  announcementService.saveAnnouncement(announcementDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(announcement);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/update/{announcementId}")
    public ResponseEntity<?> updateAnnouncement(@RequestBody AnnouncementRequestDto announcementDto, @PathVariable String announcementId) {
        try {
            AnnouncementResponseDto announcement =  announcementService.updateAnnouncement(UUID.fromString(announcementId), announcementDto);
            return ResponseEntity.ok(announcement);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/delete/{announcementId}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable String announcementId) {
        try {
            announcementService.deleteAnnouncement(UUID.fromString(announcementId));
            return ResponseEntity.ok().body("Announcement has been delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

}
