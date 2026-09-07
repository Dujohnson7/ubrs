package com.ubrs.ubrs_backend.service.users;

import com.ubrs.ubrs_backend.domain.dto.parent.ParentStudentRequestDto;
import com.ubrs.ubrs_backend.domain.dto.parent.ParentStudentResponseDto;
import com.ubrs.ubrs_backend.domain.dto.users.LoginResponseDto;
import com.ubrs.ubrs_backend.domain.dto.users.UsersRequestDto;
import com.ubrs.ubrs_backend.domain.dto.users.UsersResponseDto;

import java.util.List;
import java.util.UUID;

public interface IUsersService {
    UsersResponseDto saveUser(UsersRequestDto usersDto);
    LoginResponseDto loginUser(UsersRequestDto usersDto);
    UsersResponseDto forgotPassword(String email);
    UsersResponseDto verifyForgotPassword(String email, String otp);
    UsersResponseDto changePassword(UUID userId, String thePassword);
    UsersResponseDto resetPassword( String email, String otp, String newPassword );
    UsersResponseDto changePassword( String email, String oldPassword, String newPassword );
    void logoutUser();

    List<ParentStudentResponseDto> getStudentsByParentId(UUID parentId);
    UsersResponseDto updateUser(UUID userId, UsersRequestDto usersDto);
    void deleteUser(UUID userId);
    void activateUser(UUID userId);
    void deactivateUser(UUID userId);

    UsersResponseDto getUserById(UUID userId);
    UsersResponseDto getUserWithPassword(UUID userId, String password);
    List<UsersResponseDto> getAllUsers();
    List<UsersResponseDto> getAllTeacher();
    List<UsersResponseDto> getAllTeacherWhoAreNotHeader();

    long totalTeacher();
    long totalClassTeacher();



    List<ParentStudentResponseDto> createParent(ParentStudentRequestDto requestDto);
    List<ParentStudentResponseDto> updateParent(UUID parentId, ParentStudentRequestDto requestDto);
    List<UsersResponseDto> getAllParentsStudents();
    List<ParentStudentResponseDto> getAllParentsStudentsByParentId(UUID parentId);
}
