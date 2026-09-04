 package com.ubrs.ubrs_backend.service.users;

import com.ubrs.ubrs_backend.config.JwtProvider;
import com.ubrs.ubrs_backend.domain.dto.parent.ParentStudentRequestDto;
import com.ubrs.ubrs_backend.domain.dto.parent.ParentStudentResponseDto;
import com.ubrs.ubrs_backend.domain.dto.users.LoginResponseDto;
import com.ubrs.ubrs_backend.domain.dto.users.UsersRequestDto;
import com.ubrs.ubrs_backend.domain.dto.users.UsersResponseDto;
import com.ubrs.ubrs_backend.domain.entity.ParentStudent;
import com.ubrs.ubrs_backend.domain.entity.Student;
import com.ubrs.ubrs_backend.domain.entity.Users;
import com.ubrs.ubrs_backend.domain.mapper.ParentStudentMapper;
import com.ubrs.ubrs_backend.domain.mapper.UsersMapper;
import com.ubrs.ubrs_backend.repository.IParentStudentRepository;
import com.ubrs.ubrs_backend.repository.IStudentRepository;
import com.ubrs.ubrs_backend.repository.IUserRepository;
import com.ubrs.ubrs_backend.util.ERole;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
@RequiredArgsConstructor
public class UsersServiceImpl implements IUsersService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final UsersMapper usersMapper;

    private final IParentStudentRepository parentStudentRepository;
    private final IStudentRepository studentRepository;
    private final ParentStudentMapper parentStudentMapper;

    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;

    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    private final Map<String, LocalDateTime> otpExpiryStorage = new ConcurrentHashMap<>();


    @Override
    public UsersResponseDto saveUser(UsersRequestDto usersDto) {

        if (userRepository.existsUsersByEmailAndIsDeleted(usersDto.getEmail(), false)) {
            throw new RuntimeException("Email already registered");
        }
        String tempPassword = String.format("UBRS%06d", new Random().nextInt(1_000_000));

        Users user = new Users();

        user.setProfile("userProfile.png");
        user.setNames(usersDto.getNames());
        user.setEmail(usersDto.getEmail());
        user.setPhone(usersDto.getPhone());
        user.setRole(usersDto.getRole());
        user.setSignature(usersDto.getSignature());

        user.setFirstTime(true);

        user.setUserStatus(true);

        user.setPassword(passwordEncoder.encode(tempPassword));

        Users savedUser = userRepository.save(user);

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(savedUser.getEmail());
        message.setSubject("UBRS Account Created");

        message.setText("Your UBRS account has been successfully created.\n\n"
                        + "Email: " + savedUser.getEmail() + "\n"
                        + "Temporary Password: " + tempPassword + "\n\n"
                        + "Please log in and change your password."
        );

        mailSender.send(message);

        return usersMapper.toUsersDto(savedUser);
    }


    @Override
    public LoginResponseDto loginUser(UsersRequestDto usersDto) {

        Users user = userRepository.findUsersByEmailAndUserStatusAndIsDeleted(usersDto.getEmail(), true, false)
                .orElseThrow(() -> new RuntimeException("USER NOT FOUND OR ACCOUNT IS INACTIVE"));

        Authentication authentication =
                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(usersDto.getEmail(), usersDto.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtProvider.generateToken(authentication);

        userRepository.save(user);

        LoginResponseDto response = new LoginResponseDto();

        response.setUser(usersMapper.toUsersDto(user));

        response.setToken(token);

        response.setMessage("Login successful");

        return response;
    }


    @Override
    public UsersResponseDto forgotPassword(String email) {

        Users user = userRepository.findUsersByEmailAndUserStatusAndIsDeleted(email, true, false)
                .orElseThrow(() -> new RuntimeException( "USER NOT FOUND OR ACCOUNT IS INACTIVE"));

        String otp = String.format("%06d",new Random().nextInt(1_000_000));

        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        otpStorage.put(user.getEmail(), otp);
        otpExpiryStorage.put(user.getEmail(), expiry);

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(user.getEmail());
        message.setSubject("UBRS Password Reset OTP");

        message.setText("Your password reset OTP is: " + otp + "\n\n"+ "This OTP will expire in 5 minutes.");

        mailSender.send(message);

        return usersMapper.toUsersDto(user);
    }

    @Override
    public UsersResponseDto verifyForgotPassword(String email, String otp) {

        Users user = userRepository
                .findUsersByEmailAndUserStatusAndIsDeleted(email, true, false)
                .orElseThrow(() -> new RuntimeException("USER NOT FOUND"));

        String storedOtp = otpStorage.get(email);

        LocalDateTime expiry = otpExpiryStorage.get(email);

        if (storedOtp == null || expiry == null) {
            throw new RuntimeException("OTP not found or expired");
        }

        if (LocalDateTime.now().isAfter(expiry)) {

            otpStorage.remove(email);
            otpExpiryStorage.remove(email);

            throw new RuntimeException("OTP has expired");
        }

        if (!storedOtp.equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        return usersMapper.toUsersDto(user);
    }

    @Override
    public UsersResponseDto changePassword(UUID userId, String thePassword) {

        Users foundUser = userRepository.findUsersByIdAndIsDeleted(userId, false)
                        .orElseThrow(() -> new RuntimeException( "USER NOT FOUND"));

        foundUser.setPassword(passwordEncoder.encode(thePassword));

        foundUser.setFirstTime(false);

        Users savedUser = userRepository.save(foundUser);

        return usersMapper.toUsersDto(savedUser);
    }

    @Override public UsersResponseDto resetPassword( String email, String otp, String newPassword) {

        String storedOtp = otpStorage.get(email);
        LocalDateTime expiry = otpExpiryStorage.get(email);
        if (storedOtp == null || expiry == null) {
            throw new RuntimeException( "Invalid or expired OTP" );
        }
        if (LocalDateTime.now().isAfter(expiry)) {
            otpStorage.remove(email);
            otpExpiryStorage.remove(email);
            throw new RuntimeException( "OTP has expired" );
        }
        if (!storedOtp.equals(otp)) {
            throw new RuntimeException( "Invalid OTP" );
        }

        Users user = userRepository.findUsersByEmailAndUserStatusAndIsDeleted( email, true, false )
                .orElseThrow(() -> new RuntimeException(  "USER NOT FOUND OR ACCOUNT IS INACTIVE" ) );
        user.setPassword( passwordEncoder.encode(newPassword) );
        user.setFirstTime(false); Users savedUser = userRepository.save(user);
        otpStorage.remove(email); otpExpiryStorage.remove(email); return usersMapper.toUsersDto(savedUser);
    }

    @Override
    public UsersResponseDto changePassword(String email, String oldPassword, String newPassword) {
        Users user = userRepository.findUsersByEmailAndUserStatusAndIsDeleted( email, true, false )
                .orElseThrow(() -> new RuntimeException("USER NOT FOUND OR ACCOUNT IS INACTIVE" ) );
        if (!passwordEncoder.matches( oldPassword, user.getPassword())) {
            throw new RuntimeException( "Invalid old password" ); }
        user.setPassword( passwordEncoder.encode(newPassword) );
        user.setFirstTime(false); Users savedUser = userRepository.save(user);
        return usersMapper.toUsersDto(savedUser);
    }

    @Override
    public void logoutUser() {
        SecurityContextHolder.clearContext();
    }

    @Override
    @Transactional
    public List<ParentStudentResponseDto> createParent(ParentStudentRequestDto requestDto) {

        Users parent = userRepository.findUsersByEmailAndIsDeleted(requestDto.getEmail(), false).orElse(null);

        String tempPassword = null;

        if (parent == null) {
            tempPassword = String.format("UBRS%06d", new Random().nextInt(1_000_000));

            parent = new Users();

            parent.setProfile("userProfile.png");
            parent.setNames(requestDto.getNames());
            parent.setEmail(requestDto.getEmail());
            parent.setPhone(requestDto.getPhone());
            parent.setRole(ERole.PARENT);
            parent.setFirstTime(true);
            parent.setUserStatus(true);
            parent.setPassword(passwordEncoder.encode(tempPassword));

            parent = userRepository.save(parent);

        } else {

            if (parent.getRole() != ERole.PARENT) {
                throw new RuntimeException("This email already belongs to another user");
            }
        }

        List<ParentStudentResponseDto> responses = new ArrayList<>();

        for (UUID studentId : requestDto.getStudentIds()) {

            Student student = studentRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

            if (parentStudentRepository.existsByParent_IdAndStudent_Id(parent.getId(), student.getId())) {
                throw new RuntimeException("Student " + student.getStudentCode() + " is already assigned to this parent");
            }

            ParentStudent parentStudent = new ParentStudent();

            parentStudent.setParent(parent);
            parentStudent.setStudent(student);

            ParentStudent saved = parentStudentRepository.save(parentStudent);

            responses.add(parentStudentMapper.toParentStudentDto(saved));
        }

        if (tempPassword != null) {

            SimpleMailMessage message = new SimpleMailMessage();

            message.setTo(parent.getEmail());
            message.setSubject("UBRS Parent Account Created");

            message.setText("Your UBRS parent account has been successfully created.\n\n"
                            + "Email: " + parent.getEmail() + "\n"
                            + "Temporary Password: " + tempPassword + "\n\n"
                            + "Please log in and change your password."
            );

            mailSender.send(message);
        }

        return responses;
    }

    @Override
    public List<ParentStudentResponseDto> getStudentsByParentId(UUID parentId) {
        Users parent = userRepository.findUsersByIdAndIsDeleted(parentId, false)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        if (parent.getRole() != ERole.PARENT) {
            throw new RuntimeException("User is not a parent");
        }
        return parentStudentMapper.toParentStudentDtoList(
                parentStudentRepository.findAllByParent_Id(parentId)
        );
    }

    @Override
    public UsersResponseDto updateUser(UUID userId, UsersRequestDto usersDto) {

        Users user = userRepository.findUsersByIdAndIsDeleted(userId,false)
                        .orElseThrow(() -> new RuntimeException("USER NOT FOUND"));

        if (usersDto.getProfile() != null) {
            user.setProfile(usersDto.getProfile());
        }

        if (usersDto.getNames() != null) {
            user.setNames(usersDto.getNames());
        }

        if (usersDto.getPhone() != null) {
            user.setPhone(usersDto.getPhone());
        }

        if (usersDto.getEmail() != null && !usersDto.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsUsersByEmailAndIsDeleted(usersDto.getEmail(), false)) {
                throw new RuntimeException("Email already registered");
            }

            user.setEmail(usersDto.getEmail());
        }

        if (usersDto.getRole() != null) {
            user.setRole(usersDto.getRole());
        }

        if (usersDto.getSignature() != null) {
            user.setSignature(usersDto.getSignature());
        }

        if (usersDto.getPassword() != null && !usersDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(usersDto.getPassword()));
            user.setFirstTime(false);
        }
        
        Users updatedUser = userRepository.save(user);

        return usersMapper.toUsersDto(updatedUser);
    }


    @Override
    public void deleteUser(UUID userId) {

        Users user = userRepository.findUsersByIdAndIsDeleted(userId,false)
                        .orElseThrow(() -> new RuntimeException("USER NOT FOUND"));

        user.setIsDeleted(true);
        userRepository.save(user);
    }


    @Override
    public void activateUser(UUID userId) {

        Users user = userRepository.findUsersByIdAndIsDeleted(userId, false)
                        .orElseThrow(() -> new RuntimeException("USER NOT FOUND"));
        user.setUserStatus(true);

        userRepository.save(user);
    }


    @Override
    public void deactivateUser(UUID userId) {

        Users user = userRepository.findUsersByIdAndIsDeleted(userId, false)
                .orElseThrow(() -> new RuntimeException("USER NOT FOUND"));
        user.setUserStatus(false);

        userRepository.save(user);
    }


    @Override
    public UsersResponseDto getUserById(UUID userId) {
        Users user = userRepository.findUsersByIdAndIsDeleted(userId, false)
                .orElseThrow(() -> new RuntimeException("USER NOT FOUND"));
        return usersMapper.toUsersDto(user);
    }

    @Override
    public UsersResponseDto getUserWithPassword(UUID userId, String password) {

        Users user = userRepository.findUsersByIdAndIsDeleted(userId, false)
                .orElseThrow(() -> new RuntimeException("USER NOT FOUND"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return usersMapper.toUsersDto(user);
    }



    @Override
    public List<UsersResponseDto> getAllUsers() {
        List<Users> users = userRepository.findAllByIsDeleted(false);
        return usersMapper.toUsersDtoList(users);
    }

    @Override
    public List<UsersResponseDto> getAllTeacher() {
        List<Users> users = userRepository.findAllTeacher();
        return usersMapper.toUsersDtoList(users);
    }

    @Override
    public List<UsersResponseDto> getAllTeacherWhoAreNotHeader() {
        List<Users> users = userRepository.findAllByRoleAndIsDeleted(ERole.TEACHER, false);
        return usersMapper.toUsersDtoList(users);
    }

    @Override
    public long totalTeacher() {
        return userRepository.countAllByRoleInAndUserStatusAndIsDeleted(List.of(ERole.TEACHER, ERole.CLASSTEACHER),true,false);
    }

    @Override
    public long totalClassTeacher() {
        return userRepository.countAllByRoleAndUserStatusAndIsDeleted(ERole.CLASSTEACHER,true,false);
    }
}