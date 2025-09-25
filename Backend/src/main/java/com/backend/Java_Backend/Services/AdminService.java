// AdminService.java (in Services package)
package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.AdminDTO;
import com.backend.Java_Backend.DTO.CreateAdminDTO;
import com.backend.Java_Backend.DTO.UpdateAdminDTO;
import com.backend.Java_Backend.Models.Admin;
import com.backend.Java_Backend.Repository.AdminRepository;
import com.backend.Java_Backend.Security.PasswordHasher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {
    @Autowired
    private AdminRepository adminRepository;

    public AdminDTO getAdminById(UUID id) {
        return adminRepository.findById(id)
                .map(admin -> new AdminDTO(admin.getId(), admin.getUsername(), admin.getCreated_at()))
                .orElse(null);
    }

    public AdminDTO updateAdmin(UUID id, UpdateAdminDTO updateDTO) {
        return adminRepository.findById(id)
                .map(admin -> {
                    admin.setUsername(updateDTO.getUsername());
                    adminRepository.save(admin);
                    return new AdminDTO(admin.getId(), admin.getUsername(), admin.getCreated_at());
                })
                .orElse(null);
    }

    public boolean deleteAdmin(UUID id) {
        if (adminRepository.existsById(id)) {
            adminRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<AdminDTO> getAllAdmins() {
        return adminRepository.findAll().stream()
                .map(admin -> new AdminDTO(admin.getId(), admin.getUsername(), admin.getCreated_at()))
                .collect(Collectors.toList());
    }

    public AdminDTO createAdmin(CreateAdminDTO createDTO) {
        Admin admin = new Admin();
        admin.setUsername(createDTO.getUsername());
        admin.setPassword(PasswordHasher.hashPassword(createDTO.getPassword()));
        admin.setCreated_at(new Timestamp(System.currentTimeMillis()));
        admin = adminRepository.save(admin);
        return new AdminDTO(admin.getId(), admin.getUsername(), admin.getCreated_at());
    }
}
