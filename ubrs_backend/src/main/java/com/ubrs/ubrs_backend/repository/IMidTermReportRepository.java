package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.Grade;
import com.ubrs.ubrs_backend.domain.projection.studentReport.MidTermReportProjection;
import com.ubrs.ubrs_backend.util.ETerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IMidTermReportRepository extends JpaRepository<Grade, UUID> {

    @Query("""
    SELECT
        s.id AS studentId,
        s.studentCode AS studentCode,

        CONCAT(
            s.firstName,
            ' ',
            COALESCE(s.middleName, ''),
            ' ',
            s.lastName
        ) AS studentName,

        c.id AS courseId,
        c.courseCode AS courseCode,
        c.courseName AS courseName,

        g.term AS term,

        MAX(
            CASE
                WHEN g.gradeType = GradeType.MID_TERM
                THEN gd.mark
                ELSE NULL
            END
        ) AS midTermMark,

        MAX(
            CASE
                WHEN g.gradeType = GradeType.MID_TERM
                THEN g.maxMark
                ELSE NULL
            END
        ) AS midTermMaxMark
 
    FROM GradeDetails gd

    JOIN gd.grade g
    JOIN gd.student s
    JOIN g.course c

    WHERE g.academicYear.id = :academicYearId
      AND g.schoolClass.id = :schoolClassId
      AND g.submitStatus = EGradeState.SUBMITTED

      AND g.isDeleted = false
      AND gd.isDeleted = false
      AND s.isDeleted = false
      AND c.isDeleted = false

    GROUP BY
        s.id,
        s.studentCode,
        s.firstName,
        s.middleName,
        s.lastName,
        c.id,
        c.courseCode,
        c.courseName,
        g.term

    ORDER BY
        s.studentCode,
        c.courseName,
        g.term
    """)
    List<MidTermReportProjection> findMidTermReport(
            @Param("academicYearId") UUID academicYearId,
            @Param("schoolClassId") UUID schoolClassId
    );


    @Query("""
    SELECT
        s.id AS studentId,
        s.studentCode AS studentCode,

        CONCAT(
            s.firstName,
            ' ',
            COALESCE(s.middleName, ''),
            ' ',
            s.lastName
        ) AS studentName,

        c.id AS courseId,
        c.courseCode AS courseCode,
        c.courseName AS courseName,

        g.term AS term,

        MAX(
            CASE
                WHEN g.gradeType = GradeType.MID_TERM
                THEN gd.mark
                ELSE NULL
            END
        ) AS midTermMark,

        MAX(
            CASE
                WHEN g.gradeType = GradeType.MID_TERM
                THEN g.maxMark
                ELSE NULL
            END
        ) AS midTermMaxMark

    FROM GradeDetails gd
    JOIN gd.grade g
    JOIN gd.student s
    JOIN g.course c

    WHERE g.academicYear.id = :academicYearId
      AND g.schoolClass.id = :schoolClassId
      AND g.submitStatus = EGradeState.SUBMITTED
      AND g.term = :term

      AND g.isDeleted = false
      AND gd.isDeleted = false
      AND s.isDeleted = false
      AND c.isDeleted = false

    GROUP BY
        s.id,
        s.studentCode,
        s.firstName,
        s.middleName,
        s.lastName,
        c.id,
        c.courseCode,
        c.courseName,
        g.term

    ORDER BY
        s.studentCode,
        c.courseName
    """)
    List<MidTermReportProjection> findMidTermReportByTerm(
            @Param("academicYearId") UUID academicYearId,
            @Param("schoolClassId") UUID schoolClassId,
            @Param("term") ETerm term
    );


    @Query("""
    SELECT
        s.id AS studentId,
        s.studentCode AS studentCode,

        CONCAT(
            s.firstName,
            ' ',
            COALESCE(s.middleName, ''),
            ' ',
            s.lastName
        ) AS studentName,

        c.id AS courseId,
        c.courseCode AS courseCode,
        c.courseName AS courseName,

        g.term AS term,

        MAX(
            CASE
                WHEN g.gradeType = GradeType.MID_TERM
                THEN gd.mark
                ELSE NULL
            END
        ) AS midTermMark,

        MAX(
            CASE
                WHEN g.gradeType = GradeType.MID_TERM
                THEN g.maxMark
                ELSE NULL
            END
        ) AS midTermMaxMark

    FROM GradeDetails gd
    JOIN gd.grade g
    JOIN gd.student s
    JOIN g.course c
    JOIN ParentStudent ps
        ON ps.student = s

    WHERE g.academicYear.id = :academicYearId
      AND g.submitStatus = EGradeState.SUBMITTED

      AND (:term IS NULL OR g.term = :term)

      AND ps.parent.id = :parentId

      AND g.isDeleted = false
      AND gd.isDeleted = false
      AND s.isDeleted = false
      AND c.isDeleted = false

    GROUP BY
        s.id,
        s.studentCode,
        s.firstName,
        s.middleName,
        s.lastName,
        c.id,
        c.courseCode,
        c.courseName,
        g.term

    ORDER BY
        s.studentCode,
        c.courseName
    """)
    List<MidTermReportProjection> findMidTermReportByParent(
            @Param("parentId") UUID parentId,
            @Param("academicYearId") UUID academicYearId,
            @Param("term") ETerm term
    );
}
