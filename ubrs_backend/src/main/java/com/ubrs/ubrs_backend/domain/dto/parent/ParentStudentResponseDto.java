package com.ubrs.ubrs_backend.domain.dto.parent;

import com.ubrs.ubrs_backend.domain.dto.student.StudentResponseDto;
import com.ubrs.ubrs_backend.domain.dto.users.UsersResponseDto;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ParentStudentRespondDto {
    private UsersResponseDto parent;
    private StudentResponseDto student;
}
