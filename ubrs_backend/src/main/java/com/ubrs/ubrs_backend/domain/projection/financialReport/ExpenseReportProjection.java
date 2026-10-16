package com.ubrs.ubrs_backend.domain.projection.financialReport;

import java.time.LocalDate;
import java.util.UUID;

public interface ExpenseReportProjection {
    UUID getId();
    String getExpenseName();
    LocalDate getExpenseDate();
    Double getAmount();
}
