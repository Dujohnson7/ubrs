package com.ubrs.ubrs_backend.service.schoolClass;

import com.ubrs.ubrs_backend.domain.dto.schoolClass.SchoolClassRequestDto;
import com.ubrs.ubrs_backend.domain.dto.schoolClass.SchoolClassResponseDto;
import com.ubrs.ubrs_backend.domain.entity.SchoolClass;
import com.ubrs.ubrs_backend.domain.entity.Users;
import com.ubrs.ubrs_backend.domain.mapper.SchoolClassMapper;
import com.ubrs.ubrs_backend.repository.ISchoolClassRepository;
import com.ubrs.ubrs_backend.repository.IStudentRepository;
import com.ubrs.ubrs_backend.repository.IUserRepository;
import com.ubrs.ubrs_backend.util.ERole;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class SchoolClassServiceImpl implements  ISchoolClassService{

    private final ISchoolClassRepository schoolClassRepository;
    private final IUserRepository userRepository;
    private final IStudentRepository studentRepository;
    private final SchoolClassMapper schoolClassMapper;

    @Override
    public SchoolClassResponseDto getSchoolClassById(UUID classId) {
        SchoolClass foundSchoolClass = schoolClassRepository.findSchoolClassByIdAndIsDeleted(classId, false)
                .orElseThrow(() -> new RuntimeException("School Class Not Found") );
        return schoolClassMapper.toSchoolClassDto(foundSchoolClass);
    }

    @Override
    public SchoolClassResponseDto saveClass(SchoolClassRequestDto schoolClassRequestDto) {

        if (schoolClassRequestDto == null) {
            throw new NullPointerException("Please fill school Data");
        }


        SchoolClass schoolClass = new SchoolClass();

        Users teacher = userRepository.findUsersByIdAndIsDeleted(schoolClassRequestDto.getClassTeacherId(), false)
                        .orElseThrow(() -> new RuntimeException("Teacher Not Found"));

        schoolClass.setName(schoolClassRequestDto.getName());
        schoolClass.setClassLevel(schoolClassRequestDto.getClassLevel());
        schoolClass.setClassTeacher(teacher);

        teacher.setRole(ERole.CLASSTEACHER);
        userRepository.save(teacher);

        SchoolClass result = schoolClassRepository.save(schoolClass);
        return schoolClassMapper.toSchoolClassDto(result);
    }

    @Override
    public SchoolClassResponseDto updateClass(UUID classId, SchoolClassRequestDto schoolClassRequestDto) {
        SchoolClass existSchoolClass = schoolClassRepository.findSchoolClassByIdAndIsDeleted(classId, false)
                .orElseThrow(() -> new RuntimeException("School Class Not Found") );

        existSchoolClass.setName(schoolClassRequestDto.getName());
        existSchoolClass.setClassLevel(schoolClassRequestDto.getClassLevel());

        if (existSchoolClass.getClassTeacher().getId().equals(schoolClassRequestDto.getClassTeacherId())) {
            Users teacher = userRepository.findUsersByIdAndIsDeleted(schoolClassRequestDto.getClassTeacherId(), false)
                    .orElseThrow(() -> new RuntimeException("Teacher Not Found"));
            existSchoolClass.setClassTeacher(teacher);

            teacher.setRole(ERole.CLASSTEACHER);
            userRepository.save(teacher);
        }

        SchoolClass result = schoolClassRepository.save(existSchoolClass);
        return schoolClassMapper.toSchoolClassDto(result);

    }

    @Override
    public void deleteClass(UUID classId) {

        SchoolClass existSchoolClass = schoolClassRepository.findSchoolClassByIdAndIsDeleted(classId, false)
                .orElseThrow(() -> new RuntimeException("School Class Not Found") );

        if (studentRepository.existsBySchoolClass_IdAndIsDeleted(classId, false)) {
            throw new RuntimeException("You are not allowed to delete this class");
        }

        existSchoolClass.setIsDeleted(true);
        schoolClassRepository.save(existSchoolClass);
    }

    @Override
    public List<SchoolClassResponseDto> getAllClasses() {
        List<SchoolClass> schoolClassList = schoolClassRepository.findAllByIsDeleted(false);
        return schoolClassMapper.toSchoolClassDtoList(schoolClassList);
    }

    @Override
    public List<SchoolClassResponseDto> getAllClassesBySchoolLevel(ESchoolLevel schoolLevel) {
        List<SchoolClass> schoolClassList = schoolClassRepository.findAllByClassLevelAndIsDeleted(schoolLevel, false);
        return schoolClassMapper.toSchoolClassDtoList(schoolClassList);
    }

    @Override
    public long totalClassesBySchoolLevel(ESchoolLevel schoolLevel) {
        return 0;
    }

    @Override
    public long totalClasses() {
        return 0;
    }
}
