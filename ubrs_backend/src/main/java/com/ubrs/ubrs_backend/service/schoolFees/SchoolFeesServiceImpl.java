package com.ubrs.ubrs_backend.service.schoolFees;

import com.ubrs.ubrs_backend.domain.dto.schoolFees.SchoolFeesRequestDto;
import com.ubrs.ubrs_backend.domain.dto.schoolFees.SchoolFeesResponseDto;
import com.ubrs.ubrs_backend.domain.entity.AcademicYear;
import com.ubrs.ubrs_backend.domain.entity.SchoolFees;
import com.ubrs.ubrs_backend.domain.mapper.SchoolFeesMapper;
import com.ubrs.ubrs_backend.repository.IAcademicYearRepository;
import com.ubrs.ubrs_backend.repository.ISchoolFeesRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class SchoolFeesServiceImpl implements ISchoolFeesService{

    private final ISchoolFeesRepository  schoolFeesRepository;
    private final IAcademicYearRepository academicYearRepository;
    private final SchoolFeesMapper schoolFeesMapper;

    @Override
    public SchoolFeesResponseDto getSchoolFees(UUID schoolFeesId) {
        SchoolFees existsFees = schoolFeesRepository.findSchoolFeesByIdAndIsDeleted(schoolFeesId, false).orElseThrow(() -> new RuntimeException("School Fees Not Found"));
        return schoolFeesMapper.toSchoolFeesDto(existsFees);
    }

    @Override
    public SchoolFeesResponseDto saveSchoolFees(SchoolFeesRequestDto feesRequestDto) {
        SchoolFees fees = new SchoolFees();

        AcademicYear foundAcademicYear = academicYearRepository.findAcademicYearByIdAndIsDeleted(feesRequestDto.getAcademicYearId(), false).orElseThrow(() -> new RuntimeException("Academic Year Not Found"));
        
        if (schoolFeesRepository.existsByAcademicYear_IdAndIsDeleted(foundAcademicYear.getId(), false)){
            throw new RuntimeException("School Fees On That Academic Is Already Exists");
        }

        fees.setAcademicYear(foundAcademicYear);
        fees.setPrimaryFees(feesRequestDto.getPrimaryFees() == null ? 0 : feesRequestDto.getPrimaryFees());
        fees.setNurseryFees(feesRequestDto.getNurseryFees() == null ? 0 : feesRequestDto.getNurseryFees());

        SchoolFees saveFees = schoolFeesRepository.save(fees);
        return schoolFeesMapper.toSchoolFeesDto(saveFees);
    }

    @Override
    public SchoolFeesResponseDto updateSchoolFees(UUID schoolFeesId, SchoolFeesRequestDto feesRequestDto) {
        SchoolFees existsFees = schoolFeesRepository.findSchoolFeesByIdAndIsDeleted(schoolFeesId, false).orElseThrow(() -> new RuntimeException("School Fees Not Found"));

        existsFees.setPrimaryFees(feesRequestDto.getPrimaryFees());
        existsFees.setNurseryFees(feesRequestDto.getNurseryFees());

        SchoolFees updateFees = schoolFeesRepository.save(existsFees);
        return schoolFeesMapper.toSchoolFeesDto(updateFees);
    }

    @Override
    public void deleteSchoolFees(UUID schoolFeesId) {
        SchoolFees existsFees = schoolFeesRepository.findSchoolFeesByIdAndIsDeleted(schoolFeesId, false).orElseThrow(() -> new RuntimeException("School Fees Not Found"));

        existsFees.setIsDeleted(true);
        schoolFeesRepository.save(existsFees);
    }

    @Override
    public List<SchoolFeesResponseDto> getAllSchoolFees() {
        List<SchoolFees>  schoolFeesList = schoolFeesRepository.findAllByIsDeleted(false);
        return schoolFeesMapper.toSchoolFeesDtoList(schoolFeesList);
    }
}
