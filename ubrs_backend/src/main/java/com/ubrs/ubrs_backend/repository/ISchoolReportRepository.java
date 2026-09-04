package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.Grade;
import com.ubrs.ubrs_backend.domain.projection.schoolReport.ClassPerformanceProjection;
import com.ubrs.ubrs_backend.domain.projection.schoolReport.PromotionRetentionProjection;
import com.ubrs.ubrs_backend.domain.projection.schoolReport.SubjectPerformanceProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ISchoolReportRepository extends JpaRepository<Grade, UUID> {

    @Query(value = """
    WITH student_performance AS (
        SELECT
            sc.id AS class_id,
            sc.name AS class_name,
            ay.fiscal_year AS year,
            g.term AS term,
            gd.student_id,

            (
                SUM(gd.mark) /
                NULLIF(SUM(g.max_mark), 0)
            ) * 100 AS score

        FROM grade g

        JOIN school_class sc
            ON sc.id = g.school_class_id

        JOIN academic_year ay
            ON ay.id = g.academic_year_id

        JOIN grade_details gd
            ON gd.grade_id = g.id

        WHERE g.is_deleted = false
          AND gd.is_deleted = false

          AND (
              :academicYearId IS NULL
              OR g.academic_year_id = :academicYearId
          )

          AND (
              :term IS NULL
              OR g.term = :term
          )

          AND (
              :classId IS NULL
              OR g.school_class_id = :classId
          )

          AND g.submit_status = 'APPROVED'

        GROUP BY
            sc.id,
            sc.name,
            ay.fiscal_year,
            g.term,
            gd.student_id
    ),

    class_performance AS (
        SELECT
            class_id,
            class_name,
            year,
            term,

            COUNT(student_id) AS students,

            ROUND(
                AVG(score),
                2
            ) AS avg_score,

            ROUND(
                (
                    COUNT(
                        CASE
                            WHEN score >= 50
                            THEN 1
                        END
                    ) * 100.0
                    / NULLIF(COUNT(student_id), 0)
                ),
                2
            ) AS passing_rate,

            COUNT(
                CASE
                    WHEN score < 50
                    THEN 1
                END
            ) AS failing,

            MAX(score) AS highest_score

        FROM student_performance

        GROUP BY
            class_id,
            class_name,
            year,
            term
    )

    SELECT
        class_id AS "classId",
        class_name AS "className",
        students AS "students",
        avg_score AS "avgScore",
        passing_rate AS "passingRate",
        failing AS "failing",

        CASE
            WHEN highest_score >= 80 THEN 'A'
            WHEN highest_score >= 70 THEN 'B'
            WHEN highest_score >= 60 THEN 'C'
            WHEN highest_score >= 50 THEN 'D'
            ELSE 'F'
        END AS "topGrade",

        term AS "term",
        year AS "year"

    FROM class_performance

    ORDER BY class_name
    """,
            nativeQuery = true)
    List<ClassPerformanceProjection> findClassPerformance(
            @Param("academicYearId") UUID academicYearId,
            @Param("term") String term,
            @Param("classId") UUID classId
    );

    @Query(value = """
    WITH student_subject_scores AS (
        SELECT
            g.course_id AS course_id,
            c.course_name AS subject,

            g.school_class_id AS class_id,
            sc.name AS class_name,

            g.academic_year_id AS academic_year_id,
            ay.fiscal_year AS year,
            g.term AS term,

            gd.student_id AS student_id,

            (
                SUM(gd.mark) /
                NULLIF(SUM(g.max_mark), 0)
            ) * 100.0 AS score

        FROM grade g

        JOIN grade_details gd
            ON gd.grade_id = g.id

        JOIN course c
            ON c.id = g.course_id

        JOIN school_class sc
            ON sc.id = g.school_class_id

        JOIN academic_year ay
            ON ay.id = g.academic_year_id

        WHERE g.is_deleted = false
          AND gd.is_deleted = false

          AND g.academic_year_id = :academicYearId
          AND g.term = :term

          AND (
              :classId IS NULL
              OR g.school_class_id = :classId
          )

          AND g.submit_status = 'APPROVED'

        GROUP BY
            g.course_id,
            c.course_name,
            g.school_class_id,
            sc.name,
            g.academic_year_id,
            ay.fiscal_year,
            g.term,
            gd.student_id
    )

    SELECT
        course_id AS "courseId",

        subject AS "subject",

        class_id AS "classId",

        class_name AS "className",

        COUNT(DISTINCT student_id) AS "enrolled",

        ROUND(
            AVG(score),
            2
        ) AS "avgScore",

        ROUND(
            (
                COUNT(
                    CASE
                        WHEN score >= 50
                        THEN 1
                    END
                ) * 100.0
                /
                NULLIF(COUNT(student_id), 0)
            ),
            2
        ) AS "passRate",

        ROUND(
            MAX(score),
            2
        ) AS "highest",

        ROUND(
            MIN(score),
            2
        ) AS "lowest",

        term AS "term",

        year AS "year"

    FROM student_subject_scores

    GROUP BY
        course_id,
        subject,
        class_id,
        class_name,
        term,
        year

    ORDER BY
        subject,
        class_name
    """,
            nativeQuery = true)
    List<SubjectPerformanceProjection> findSubjectPerformance(
            @Param("academicYearId") UUID academicYearId,
            @Param("term") String term,
            @Param("classId") UUID classId
    );



    @Query("""
    SELECT
        sc.id AS classId,
        sc.name AS className,

        ay.id AS academicYearId,
        ay.fiscalYear AS academicYear,

        COUNT(s.id) AS totalStudents,

        SUM(
            CASE
                WHEN s.studentStatus =
                     com.ubrs.ubrs_backend.util.EStudentState.ACTIVE
                THEN 1
                ELSE 0
            END
        ) AS promoted,

        SUM(
            CASE
                WHEN s.studentStatus =
                     com.ubrs.ubrs_backend.util.EStudentState.FIRED
                THEN 1
                ELSE 0
            END
        ) AS repeated,

        SUM(
            CASE
                WHEN s.studentStatus =
                     com.ubrs.ubrs_backend.util.EStudentState.TRANSFER
                THEN 1
                ELSE 0
            END
        ) AS transferred,

        (
            SUM(
                CASE
                    WHEN s.studentStatus =
                         com.ubrs.ubrs_backend.util.EStudentState.ACTIVE
                    THEN 1
                    ELSE 0
                END
            ) * 100.0
            / NULLIF(COUNT(s.id), 0)
        ) AS promotionRate

    FROM Student s

    JOIN s.schoolClass sc

    JOIN AcademicYear ay
        ON ay.id = :academicYearId

    WHERE s.isDeleted = false
      AND sc.isDeleted = false

      AND (
          :classId IS NULL
          OR sc.id = :classId
      )

    GROUP BY
        sc.id,
        sc.name,
        ay.id,
        ay.fiscalYear

    ORDER BY sc.name
    """)
    List<PromotionRetentionProjection> findPromotionRetention(
            @Param("academicYearId") UUID academicYearId,
            @Param("classId") UUID classId
    );
/*
    @Query("""
    SELECT
        sc.id AS classId,
        sc.name AS className,

        ay.id AS academicYearId,
        ay.fiscalYear AS academicYear,

        COUNT(s.id) AS totalStudents,

        SUM(
            CASE
                WHEN s.studentStatus =
                     com.ubrs.ubrs_backend.util.EStudentState.PROMOTED
                THEN 1
                ELSE 0
            END
        ) AS promoted,

        SUM(
            CASE
                WHEN s.studentStatus =
                     com.ubrs.ubrs_backend.util.EStudentState.REPEATED
                THEN 1
                ELSE 0
            END
        ) AS repeated,

        SUM(
            CASE
                WHEN s.studentStatus =
                     com.ubrs.ubrs_backend.util.EStudentState.TRANSFERRED
                THEN 1
                ELSE 0
            END
        ) AS transferred,

        (
            SUM(
                CASE
                    WHEN s.studentStatus =
                         com.ubrs.ubrs_backend.util.EStudentStatus.PROMOTED
                    THEN 1
                    ELSE 0
                END
            ) * 100.0
            / NULLIF(COUNT(s.id), 0)
        ) AS promotionRate

    FROM Student s

    JOIN s.schoolClass sc

    JOIN AcademicYear ay
        ON ay.id = :academicYearId

    WHERE s.isDeleted = false
      AND sc.isDeleted = false

      AND (
          :classId IS NULL
          OR sc.id = :classId
      )

    GROUP BY
        sc.id,
        sc.name,
        ay.id,
        ay.fiscalYear

    ORDER BY sc.name
    """)
    List<PromotionRetentionProjection> findPromotionRetention(
            @Param("academicYearId") UUID academicYearId,
            @Param("classId") UUID classId
    );*/


}
