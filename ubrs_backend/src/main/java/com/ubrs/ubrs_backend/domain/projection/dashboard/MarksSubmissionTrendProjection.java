package com.ubrs.ubrs_backend.domain.projection.dashboard;

public interface MarksSubmissionTrendProjection {
    String getTerm();
    Long getApproved();
    Long getSubmitted();
    Long getPending();
    Long getRejected();
}
