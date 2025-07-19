package com.classHub.classHub.service;

import com.classHub.classHub.entity.Announcement;
import com.classHub.classHub.entity.Group;
import com.classHub.classHub.entity.User;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AnnouncementService {
    Announcement createAnnouncement(String content, Group group, User teacher);
    Announcement updateAnnouncement(Long id, String content, User teacher);
    void deleteAnnouncement(Long id, User teacher);
    List<Announcement> getAnnouncementsForGroup(Group group);
    Page<Announcement> getAnnouncementsForGroupPaginated(Group group, Pageable pageable);
    List<Announcement> getAnnouncementsForTeacher(User teacher);
    Announcement getAnnouncementById(Long id);
} 