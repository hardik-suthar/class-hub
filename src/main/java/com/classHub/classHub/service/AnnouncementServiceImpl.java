package com.classHub.classHub.service;

import com.classHub.classHub.entity.Announcement;
import com.classHub.classHub.entity.Group;
import com.classHub.classHub.entity.User;
import com.classHub.classHub.repo.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
public class AnnouncementServiceImpl implements AnnouncementService {
    @Autowired
    private AnnouncementRepository announcementRepository;

    @Override
    @Transactional
    public Announcement createAnnouncement(String content, Group group, User teacher) {
        Announcement announcement = new Announcement();
        announcement.setContent(content);
        announcement.setGroup(group);
        announcement.setTeacher(teacher);
        return announcementRepository.save(announcement);
    }

    @Override
    @Transactional
    public Announcement updateAnnouncement(Long id, String content, User teacher) {
        Announcement announcement = announcementRepository.findById(id).orElseThrow();
        if (!announcement.getTeacher().getId().equals(teacher.getId())) throw new RuntimeException("Not your announcement");
        announcement.setContent(content);
        return announcementRepository.save(announcement);
    }

    @Override
    @Transactional
    public void deleteAnnouncement(Long id, User teacher) {
        Announcement announcement = announcementRepository.findById(id).orElseThrow();
        if (!announcement.getTeacher().getId().equals(teacher.getId())) throw new RuntimeException("Not your announcement");
        announcementRepository.delete(announcement);
    }

    @Override
    public List<Announcement> getAnnouncementsForGroup(Group group) {
        return announcementRepository.findByGroup(group);
    }

    @Override
    public Page<Announcement> getAnnouncementsForGroupPaginated(Group group, Pageable pageable) {
        return announcementRepository.findByGroupOrderByCreatedAtDesc(group, pageable);
    }

    @Override
    public List<Announcement> getAnnouncementsForTeacher(User teacher) {
        return announcementRepository.findByTeacher(teacher);
    }

    @Override
    public Announcement getAnnouncementById(Long id) {
        return announcementRepository.findById(id).orElseThrow();
    }
} 