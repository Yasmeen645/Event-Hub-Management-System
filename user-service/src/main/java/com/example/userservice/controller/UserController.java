package com.example.userservice.controller;
import com.example.userservice.dto.AuthDto;
import com.example.userservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<AuthDto.UserDto>> getAllUsers(
            @RequestHeader("X-User-Role") String role) {
        if (!role.equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // endpoint جديد يرجع كل الـ admins — بدون أي role check عشان event-service يقدر يستخدمه
    @GetMapping("/admins")
    public ResponseEntity<List<AuthDto.UserDto>> getAllAdmins() {
        return ResponseEntity.ok(userService.getAllAdmins());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthDto.UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleUserStatus(
            @PathVariable Long id,
            @RequestHeader("X-User-Role") String role) {
        if (!role.equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        userService.toggleUserStatus(id);
        return ResponseEntity.ok().build();
    }
}
