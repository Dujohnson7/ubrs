package com.ubrs.ubrs_backend.service.academicYear;

import com.ubrs.ubrs_backend.domain.dto.academicYear.AcademicYearRequestDto;
import com.ubrs.ubrs_backend.domain.dto.academicYear.AcademicYearResponseDto;
import com.ubrs.ubrs_backend.domain.entity.AcademicYear;
import com.ubrs.ubrs_backend.domain.mapper.AcademicYearMapper;
import com.ubrs.ubrs_backend.repository.IAcademicYearRepository;
import com.ubrs.ubrs_backend.util.EAcademicState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.ObjectNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class IAcademicYearServiceImpl implements IAcademicYearService{

    private final IAcademicYearRepository academicYearRepository;
    private final AcademicYearMapper academicYearMapper;

    @Override
    public AcademicYearResponseDto getAcademicYearById(UUID id) {

        AcademicYear foundAcademicYear = academicYearRepository.findAcademicYearByIdAndIsDeleted(id, false)
                .orElseThrow(() -> new RuntimeException("ACADEMIC YEAR NOT FOUND"));
        return academicYearMapper.toAcademicYearDto(foundAcademicYear);
    }

    @Override
    public AcademicYearResponseDto saveAcademicYear(AcademicYearRequestDto academicYearRequestDto) {
        AcademicYear academicYear = new AcademicYear();

        academicYear.setFiscalYear(academicYearRequestDto.getFiscalYear());
        academicYear.setAcademicYearStatus(EAcademicState.PENDING);
        AcademicYear result = academicYearRepository.save(academicYear);

        return academicYearMapper.toAcademicYearDto(result);
    }

    @Override
    public AcademicYearResponseDto updateAcademicYear(UUID academicYearId, AcademicYearRequestDto academicYearRequestDto) {
        AcademicYear existAcademicYear = academicYearRepository.findAcademicYearByIdAndIsDeleted(academicYearId, false).orElseThrow(() -> new ObjectNotFoundException(AcademicYear.class, "ACADEMIC YEAR NOT FOUND"));

        existAcademicYear.setFiscalYear(academicYearRequestDto.getFiscalYear());
        existAcademicYear.setAcademicYearStatus(academicYearRequestDto.getEAcademicStatus());
        AcademicYear result = academicYearRepository.save(existAcademicYear);
        return academicYearMapper.toAcademicYearDto(result);
    }

    @Override
    public void deleteAcademicYearById(UUID id) {
        AcademicYear existAcademicYear = academicYearRepository.findAcademicYearByIdAndIsDeleted(id, false).orElseThrow(() -> new ObjectNotFoundException(AcademicYear.class, "ACADEMIC YEAR NOT FOUND"));

        if (!existAcademicYear.getAcademicYearStatus().equals(EAcademicState.PENDING)){
            throw new RuntimeException("Sorry You can not delete this academicYear");
        }

        existAcademicYear.setIsDeleted(true);
        academicYearRepository.save(existAcademicYear);
    }

    @Override
    public void activateAcademicYear(UUID academicId) {
        AcademicYear existAcademicYear = academicYearRepository.findAcademicYearByIdAndIsDeleted(academicId, false).orElseThrow(() -> new ObjectNotFoundException(AcademicYear.class, "ACADEMIC YEAR NOT FOUND"));

        if (!existAcademicYear.getAcademicYearStatus().equals(EAcademicState.PENDING)){
            throw new RuntimeException("Sorry You can not Active  this Academic Year");
        }

        existAcademicYear.setAcademicYearStatus(EAcademicState.ACTIVE);


        AcademicYear recentActivatedAcademic = academicYearRepository.findAcademicYearByAcademicYearStatusAndIsDeleted(EAcademicState.ACTIVE, false).orElse(null);

        if (recentActivatedAcademic != null) {
            recentActivatedAcademic.setAcademicYearStatus(EAcademicState.DONE);
            academicYearRepository.save(recentActivatedAcademic);
        }

        academicYearRepository.save(existAcademicYear);

    }

    @Override
    public void completeAcademicYear(UUID academicId) {
        AcademicYear existAcademicYear = academicYearRepository.findAcademicYearByIdAndIsDeleted(academicId, false).orElseThrow(() -> new ObjectNotFoundException(AcademicYear.class, "ACADEMIC YEAR NOT FOUND"));

        if (!existAcademicYear.getAcademicYearStatus().equals(EAcademicState.ACTIVE)){
            throw new RuntimeException("Sorry You can not complete Academic Year which not Active");
        }

        existAcademicYear.setAcademicYearStatus(EAcademicState.DONE);

        academicYearRepository.save(existAcademicYear);

    }

    @Override
    public AcademicYearResponseDto getActiveAcademicYear() {

        AcademicYear foundAcademicYear = academicYearRepository.findAcademicYearByAcademicYearStatusAndIsDeleted(EAcademicState.ACTIVE, false)
                .orElseThrow(() -> new RuntimeException("Activate Academic Year Does Not Available"));
        return academicYearMapper.toAcademicYearDto(foundAcademicYear);
    }

    @Override
    public List<AcademicYearResponseDto> getAllAcademicYears() {
        List<AcademicYear> academicYearList = academicYearRepository.findAllByIsDeleted(false);
        return academicYearMapper.toAcademicYearDtoList(academicYearList);
    }

    @Override
    public long totalAcademicYears() {
        return academicYearRepository.countAllByAcademicYearStatusInAndIsDeleted(List.of(EAcademicState.DONE, EAcademicState.ACTIVE),false);
    }
}

