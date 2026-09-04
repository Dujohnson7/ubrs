package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.AcademicYear;
import com.ubrs.ubrs_backend.domain.entity.Grade;
import com.ubrs.ubrs_backend.domain.entity.SchoolClass;
import com.ubrs.ubrs_backend.domain.projection.grade.ClassGradeDetailProjection;
import com.ubrs.ubrs_backend.domain.projection.grade.ClassGradeStatusProjection;
import com.ubrs.ubrs_backend.util.EGradeState;
import com.ubrs.ubrs_backend.util.ETerm;
import com.ubrs.ubrs_backend.util.GradeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IGradeRepository extends JpaRepository<Grade, UUID> {

    Optional<Grade> findGradeByIdAndIsDeleted(UUID id, Boolean isDeleted);

    List<Grade> findAllByIsDeleted(Boolean isDeleted);

    boolean existsBySchoolClass_IdAndAcademicYear_IdAndTermAndCourse_IdAndGradeTypeAndSubmitStatusInAndIsDeleted(UUID schoolClassId, UUID academicYearId, ETerm term, UUID courseId, GradeType gradeType, List<EGradeState> submitStatus, Boolean isDeleted);

    List<Grade> findAllByAcademicYear_IdAndIsDeleted(UUID id, Boolean isDeleted);

    List<Grade> findGradeByAcademicYear_IdAndTermAndSchoolClass_IdAndIsDeleted(UUID academicYearId, ETerm term, UUID schoolClassId, Boolean isDeleted);

    List<Grade> findAllByAcademicYearAndTermAndCreatedByAndIsDeleted(AcademicYear academicYear, ETerm term, String createdBy, Boolean isDeleted);

    List<Grade> findAllByAcademicYear_IdAndTermAndCourse_IdAndIsDeleted(UUID academicYearId, ETerm term, UUID courseId, Boolean isDeleted);

    List<Grade> findAllByAcademicYear_IdAndSchoolClass_IdAndIsDeleted(UUID academicYearId, UUID schoolClassId, Boolean isDeleted);

    List<Grade> findAllByTeacher_IdAndIsDeleted(UUID teacherId, Boolean isDeleted);

    long countAllBySubmitStatusAndIsDeleted(EGradeState submitStatus, Boolean isDeleted);

    @Query("""
    SELECT
        sc.id AS classId,
        sc.name AS className,
        sc.classLevel AS classLevel,

        sc.classTeacher.names  AS classTeacher,
        
        g.academicYear.id as academicYearId,
        
        g.academicYear.fiscalYear as academicYear,

        g.term AS term,

        COUNT(DISTINCT g.course.id) AS subjects,

        COUNT(
            DISTINCT
            (CASE
                WHEN g.submitStatus = com.ubrs.ubrs_backend.util.EGradeState.APPROVED
                THEN g.course.id
            END)
        ) AS approved,

        CASE
            WHEN COUNT(DISTINCT g.course.id) = 0
                THEN 'NOT_SUBMITTED'

            WHEN COUNT(DISTINCT
            (CASE
                    WHEN g.submitStatus = com.ubrs.ubrs_backend.util.EGradeState.APPROVED
                    THEN g.course.id
                END)) = COUNT(DISTINCT g.course.id)
                THEN 'APPROVED'

            WHEN COUNT(DISTINCT
            (CASE
                    WHEN g.submitStatus IS NOT NULL
                    THEN g.course.id
                END)) = 0
                THEN 'NOT_SUBMITTED'

            WHEN COUNT(DISTINCT
            (CASE
                    WHEN g.submitStatus IS NOT NULL
                    THEN g.course.id
                END))< COUNT(DISTINCT g.course.id)
                THEN 'PARTIAL'

            ELSE 'SUBMITTED'
        END AS status

    FROM Grade g

    JOIN g.schoolClass sc

    WHERE g.isDeleted = false

    GROUP BY
        sc.id,
        sc.name,
        sc.classLevel,
        sc.classTeacher.names,
        g.term,
        g.academicYear.id,
        g.academicYear.fiscalYear

    ORDER BY
        sc.name,
        g.term
""")
    List<ClassGradeStatusProjection> findClassGradeStatus();

    @Query("""
    SELECT
        c.id AS courseId,
        c.courseName AS subject,

        MAX(tr.names) AS teacher,

        COUNT(DISTINCT gd.student.id) AS students,

        MAX(
            CASE
                WHEN g.gradeType =
                     com.ubrs.ubrs_backend.util.GradeType.TEST
                THEN g.maxMark
            END
        ) AS test,

        MAX(
            CASE
                WHEN g.gradeType =
                     com.ubrs.ubrs_backend.util.GradeType.EXAM
                THEN g.maxMark
            END
        ) AS exam,

        MAX(g.created) AS submittedAt,

        CASE
            WHEN SUM(
                CASE
                    WHEN g.submitStatus =
                         com.ubrs.ubrs_backend.util.EGradeState.APPROVED
                    THEN 1
                    ELSE 0
                END
            ) = COUNT(g.id)
            THEN com.ubrs.ubrs_backend.util.EGradeState.APPROVED

            WHEN SUM(
                CASE
                    WHEN g.submitStatus =
                         com.ubrs.ubrs_backend.util.EGradeState.REJECTED
                    THEN 1
                    ELSE 0
                END
            ) > 0
            THEN com.ubrs.ubrs_backend.util.EGradeState.REJECTED

            ELSE com.ubrs.ubrs_backend.util.EGradeState.SUBMITTED
        END AS status

    FROM Grade g

    JOIN g.course c

    LEFT JOIN g.teacher tr

    LEFT JOIN g.gradeDetails gd

    WHERE g.schoolClass.id = :classId
      AND g.academicYear.id = :academicYearId
      AND g.term = :term
      AND g.isDeleted = false

    GROUP BY
        c.id,
        c.courseName

    ORDER BY c.courseName
    """)
    List<ClassGradeDetailProjection> findClassGradeDetails(
            @Param("classId") UUID classId,
            @Param("academicYearId") UUID academicYearId,
            @Param("term") ETerm term
    );

    List<Grade> findAllByAcademicYear_IdAndTermAndSchoolClass_IdAndCourse_IdAndIsDeleted(UUID academicYearId, ETerm term, UUID schoolClassId, UUID courseId, Boolean isDeleted);

    @Query("""
    SELECT
        c.courseName AS subject,
        sc.classLevel AS level,
        AVG(gd.mark) AS averageMark
    FROM Grade g
    JOIN g.gradeDetails gd
    JOIN g.course c
    JOIN g.schoolClass sc
    WHERE g.isDeleted = false
      AND g.submitStatus = com.ubrs.ubrs_backend.util.EGradeState.APPROVED
      AND g.academicYear.id = :academicYearId
    GROUP BY c.courseName, sc.classLevel
    ORDER BY c.courseName
    """)
    List<Object[]> findAverageMarksBySubject(@Param("academicYearId") UUID academicYearId);

    @Query("""
    SELECT
        g.academicYear.fiscalYear AS academicYear,
        g.term AS term,
        g.submitStatus AS status,
        COUNT(DISTINCT g.course.id) AS count
    FROM Grade g
    WHERE g.isDeleted = false
    GROUP BY g.academicYear.fiscalYear, g.term, g.submitStatus
    ORDER BY g.academicYear.fiscalYear DESC, g.term
    """)
    List<Object[]> findMarksSubmissionTrends();

    @Query("""
    SELECT
        sc.name AS className,
        SUM(CASE WHEN gd.mark >= 80 THEN 1 ELSE 0 END) AS a1,
        SUM(CASE WHEN gd.mark >= 70 AND gd.mark < 80 THEN 1 ELSE 0 END) AS b2,
        SUM(CASE WHEN gd.mark >= 60 AND gd.mark < 70 THEN 1 ELSE 0 END) AS b3,
        SUM(CASE WHEN gd.mark >= 50 AND gd.mark < 60 THEN 1 ELSE 0 END) AS c4,
        SUM(CASE WHEN gd.mark < 50 THEN 1 ELSE 0 END) AS d,
        COUNT(gd.id) AS total
    FROM Grade g
    JOIN g.gradeDetails gd
    JOIN g.schoolClass sc
    WHERE g.isDeleted = false
      AND g.submitStatus = com.ubrs.ubrs_backend.util.EGradeState.APPROVED
      AND g.academicYear.id = :academicYearId
    GROUP BY sc.name
    ORDER BY sc.name
    """)
    List<Object[]> findGradeDistribution(@Param("academicYearId") UUID academicYearId);


}
