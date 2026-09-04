package com.ubrs.ubrs_backend.service.courseAssignment;

import com.ubrs.ubrs_backend.domain.dto.courseAssignment.CourseAssignmentRequestDto;
import com.ubrs.ubrs_backend.domain.dto.courseAssignment.CourseAssignmentResponseDto;
import com.ubrs.ubrs_backend.domain.entity.Course;
import com.ubrs.ubrs_backend.domain.entity.CourseAssignment;
import com.ubrs.ubrs_backend.domain.entity.SchoolClass;
import com.ubrs.ubrs_backend.domain.entity.Users;
import com.ubrs.ubrs_backend.domain.mapper.CourseAssignmentMapper;
import com.ubrs.ubrs_backend.repository.ICourseAssignmentRepository;
import com.ubrs.ubrs_backend.repository.ICourseRepository;
import com.ubrs.ubrs_backend.repository.ISchoolClassRepository;
import com.ubrs.ubrs_backend.repository.IUserRepository;
import com.ubrs.ubrs_backend.util.EAssignmentState;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class CourseAssignmentServiceImpl implements ICourseAssignmentService {

    private final IUserRepository userRepository;
    private final ICourseAssignmentRepository courseAssignmentRepository;
    private final CourseAssignmentMapper courseAssigmentMapper;
    private final ISchoolClassRepository schoolClassRepository;
    private final ICourseRepository courseRepository;


    @Override
    public CourseAssignmentResponseDto getCourseAssignmentById(UUID courseAssignmentId) {
        CourseAssignment foundCourseAssignment = courseAssignmentRepository.findCourseAssignmentByIdAndIsDeleted(courseAssignmentId, false)
                .orElseThrow(() -> new RuntimeException("Course Assignment Not Found") );
        return courseAssigmentMapper.toCourseAssignmentDto(foundCourseAssignment);
    }

    @Override
    public CourseAssignmentResponseDto saveCourseAssignment(CourseAssignmentRequestDto courseAssignmentRequestDto) {

        if (courseAssignmentRequestDto == null) {
            throw new NullPointerException("Please fill Course Assignment Data");
        }

        CourseAssignment assignment = new CourseAssignment();

        Users teacher = userRepository.findUsersByIdAndIsDeleted(courseAssignmentRequestDto.getTeacherId(), false)
                .orElseThrow(() -> new RuntimeException("Teacher Not Found"));

        Course foundCourse = courseRepository.findCourseByIdAndIsDeleted(courseAssignmentRequestDto.getCourseId(), false)
                .orElseThrow(() -> new RuntimeException("Course Not Found") );

        SchoolClass foundSchoolClass = schoolClassRepository.findSchoolClassByIdAndIsDeleted(courseAssignmentRequestDto.getSchoolClassId(), false)
                .orElseThrow(() -> new RuntimeException("Class Not Found") );

        if (courseAssignmentRepository.existsByTeacher_IdAndCourse_IdAndSchoolClass_IdAndAssignmentStatusAndIsDeleted(courseAssignmentRequestDto.getTeacherId(),courseAssignmentRequestDto.getCourseId(), courseAssignmentRequestDto.getSchoolClassId(), EAssignmentState.ACTIVE, false)){
            throw new RuntimeException("Teacher already enroll that Course on This Class");
        }

        if (courseAssignmentRepository.existsByCourse_IdAndSchoolClass_IdAndAssignmentStatusAndIsDeleted(courseAssignmentRequestDto.getCourseId(), courseAssignmentRequestDto.getSchoolClassId(), EAssignmentState.ACTIVE, false)){
            throw new RuntimeException("Course is already enroll by another Teacher");
        }

        assignment.setTeacher(teacher);
        assignment.setCourse(foundCourse);
        assignment.setSchoolClass(foundSchoolClass);
        assignment.setAssignmentDate(LocalDate.now());
        assignment.setAssignmentStatus(EAssignmentState.ACTIVE);

        CourseAssignment result = courseAssignmentRepository.save(assignment);
        return courseAssigmentMapper.toCourseAssignmentDto(result);
    }

    @Override
    public CourseAssignmentResponseDto updateCourseAssignment(UUID courseAssignmentId, CourseAssignmentRequestDto courseAssignmentRequestDto) {

        CourseAssignment existCourseAssignment = courseAssignmentRepository.findCourseAssignmentByIdAndIsDeleted(courseAssignmentId, false)
                .orElseThrow(() -> new RuntimeException("Course Assignment Not Found") );

        if (!courseAssignmentRequestDto.getCourseId().equals(existCourseAssignment.getCourse().getId()) &&
                !courseAssignmentRepository.existsByCourse_IdAndSchoolClass_IdAndAssignmentStatusAndIsDeleted(courseAssignmentRequestDto.getCourseId(), courseAssignmentRequestDto.getSchoolClassId(), EAssignmentState.ACTIVE, false)
        ) {

            Course foundCourse = courseRepository.findCourseByIdAndIsDeleted(courseAssignmentRequestDto.getCourseId(), false)
                    .orElseThrow(() -> new RuntimeException("Course Not Found") );

            existCourseAssignment.setCourse(foundCourse);

        }

        if (!courseAssignmentRequestDto.getCourseId().equals(existCourseAssignment.getCourse().getId())) {

            SchoolClass foundSchoolClass = schoolClassRepository.findSchoolClassByIdAndIsDeleted(courseAssignmentRequestDto.getSchoolClassId(), false)
                    .orElseThrow(() -> new RuntimeException("Class Not Found") );

            existCourseAssignment.setSchoolClass(foundSchoolClass);
        }

        existCourseAssignment.setAssignmentDate(LocalDate.now());

        CourseAssignment result = courseAssignmentRepository.save(existCourseAssignment);
        return courseAssigmentMapper.toCourseAssignmentDto(result);
    }

    @Override
    public void deleteCourseAssignment(UUID courseAssignmentId) {

        CourseAssignment existCourseAssignment = courseAssignmentRepository.findCourseAssignmentByIdAndIsDeleted(courseAssignmentId, false)
                .orElseThrow(() -> new RuntimeException("Course Assignment Not Found") );

        existCourseAssignment.setIsDeleted(true);

        courseAssignmentRepository.save(existCourseAssignment);

    }

    @Override
    public void closeCourseAssignment(UUID courseAssignmentId) {

        CourseAssignment existCourseAssignment = courseAssignmentRepository.findCourseAssignmentByIdAndIsDeleted(courseAssignmentId, false)
                .orElseThrow(() -> new RuntimeException("Course Assignment Not Found") );

        existCourseAssignment.setClosedDate(LocalDate.now());
        existCourseAssignment.setAssignmentStatus(EAssignmentState.CLOSED);
        courseAssignmentRepository.save(existCourseAssignment);
    }

    @Override
    public List<CourseAssignmentResponseDto> getAllCourseAssignments() {
        List<CourseAssignment> courseAssignmentList =  courseAssignmentRepository.findAllByIsDeleted(false);
        return courseAssigmentMapper.toCourseAssignmentDtoList(courseAssignmentList);
    }

    @Override
    public List<CourseAssignmentResponseDto> getAllCourseAssignmentsByAssignmentStatus(EAssignmentState assignmentStatus) {
        List<CourseAssignment> courseAssignmentList =  courseAssignmentRepository.findAllByAssignmentStatusAndIsDeleted(assignmentStatus, false);
        return courseAssigmentMapper.toCourseAssignmentDtoList(courseAssignmentList);
    }

    @Override
    public List<CourseAssignmentResponseDto> getAllCourseAssignmentsByTeacher(UUID teacherId) {
        List<CourseAssignment> courseAssignmentList =  courseAssignmentRepository.findAllByTeacherIdAndIsDeleted(teacherId, false);
        return courseAssigmentMapper.toCourseAssignmentDtoList(courseAssignmentList);
    }

    @Override
    public long totalCourseByTeacher(UUID teacherId) {
        return courseAssignmentRepository.countAllByTeacher_IdAndAssignmentStatusAndIsDeleted(teacherId, EAssignmentState.ACTIVE, false);
    }
}
