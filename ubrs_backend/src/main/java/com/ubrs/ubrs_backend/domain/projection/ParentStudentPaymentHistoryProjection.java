package com.ubrs.ubrs_backend.domain.projection;


import com.ubrs.ubrs_backend.util.EPaymentState;
import com.ubrs.ubrs_backend.util.ETerm;

import java.util.UUID;

public interface ParentStudentPaymentHistoryProjection {

    UUID getStudentId();

    String getStudentCode();

    String getFirstName();

    String getLastName();

    UUID getSchoolFeesId();

    String getFiscalYear();

    ETerm getTerm();

    Double getTotalAmountPaid();

    Double getRemainAmount();

    EPaymentState getPaymentStatus();
}
