package com.ubrs.ubrs_backend.service.course;

import com.ubrs.ubrs_backend.domain.dto.course.CourseRequestDto;
import com.ubrs.ubrs_backend.domain.dto.course.CourseResponseDto;
import com.ubrs.ubrs_backend.domain.entity.Course;
import com.ubrs.ubrs_backend.domain.mapper.CourseMapper;
import com.ubrs.ubrs_backend.repository.ICourseRepository;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class CourseServiceImpl implements ICourseService {

    private final ICourseRepository courseRepository;
    private final CourseMapper courseMapper;

    @Override
    public CourseResponseDto getCourseById(UUID courseId) {
        Course foundCourse = courseRepository.findCourseByIdAndIsDeleted(courseId, false)
                .orElseThrow(() -> new RuntimeException("Course Not Found") );
        return courseMapper.toCourseDto(foundCourse);
    }

    @Override
    public CourseResponseDto saveCourse(CourseRequestDto courseRequestDto) {

        if (courseRequestDto == null) {
            throw new NullPointerException("Please fill course Data");
        }

        Course course = new Course();

        course.setCourseCode(courseRequestDto.getCourseCode());
        course.setCourseName(courseRequestDto.getCourseName());
        course.setCourseHours(courseRequestDto.getCourseHours());
        course.setCourseLevel(courseRequestDto.getCourseLevel());

        Course result = courseRepository.save(course);
        return courseMapper.toCourseDto(result);
    }

    @Override
    public CourseResponseDto updateCourse(UUID courseId, CourseRequestDto courseRequestDto) {
        Course existCourse = courseRepository.findCourseByIdAndIsDeleted(courseId, false)
                .orElseThrow(() -> new RuntimeException("Course Not Found") );

        existCourse.setCourseCode(courseRequestDto.getCourseCode());
        existCourse.setCourseName(courseRequestDto.getCourseName());
        existCourse.setCourseHours(courseRequestDto.getCourseHours());
        existCourse.setCourseLevel(courseRequestDto.getCourseLevel());


        Course result = courseRepository.save(existCourse);
        return courseMapper.toCourseDto(result);

    }

    @Override
    public void deleteCourse(UUID courseId) {

        Course existCourse = courseRepository.findCourseByIdAndIsDeleted(courseId, false)
                .orElseThrow(() -> new RuntimeException("Course Not Found") );

        existCourse.setIsDeleted(true);
        courseRepository.save(existCourse);
    }

    @Override
    public List<CourseResponseDto> getAllCourses() {
        List<Course> courseList = courseRepository.findAllByIsDeleted(false);
        return courseMapper.toCourseDtoList(courseList);
    }

    @Override
    public List<CourseResponseDto> getAllCoursesBySchoolLevel(ESchoolLevel schoolLevel) {
        List<Course> courseList = courseRepository.findAllByCourseLevelAndIsDeleted(schoolLevel, false);
        return courseMapper.toCourseDtoList(courseList);
    }

    @Override
    public List<CourseResponseDto> getAllCoursesByTeacher(UUID teacherId) {
        List<Course> courseList = courseRepository.findAllByTeacherId(teacherId);
        return courseMapper.toCourseDtoList(courseList);
    }

    @Override
    public List<CourseResponseDto> getAllCoursesByTeacherAndSchoolClass(UUID teacherId, UUID schoolClassId) {
        List<Course> courseList = courseRepository.findAllByTeacherIdAndSchoolClassId(teacherId, schoolClassId);
        return courseMapper.toCourseDtoList(courseList);
    }

    @Override
    public List<CourseResponseDto> getAllCoursesByClass(UUID classId) {
        List<Course> courseList = courseRepository.findAllCourseByClassId(classId);
        return courseMapper.toCourseDtoList(courseList);
    }

    @Override
    public List<CourseResponseDto> getAllCoursesNotYetAssign(UUID classId) {
        List<Course> courseList = courseRepository.findAllCoursesNotYetAssign(classId);
        return courseMapper.toCourseDtoList(courseList);
    }

    @Override
    public long totalCourses() {
        return courseRepository.countAllByIsDeleted(false);
    }

    @Override
    public long totalCourseBySchoolLevel(ESchoolLevel schoolLevel) {
        return courseRepository.countAllByCourseLevelAndIsDeleted(schoolLevel, false);
    }
}
