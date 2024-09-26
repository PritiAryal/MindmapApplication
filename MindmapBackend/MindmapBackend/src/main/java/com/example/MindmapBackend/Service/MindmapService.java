package com.example.MindmapBackend.Service;


import com.example.MindmapBackend.Domain.Applicationuser;
import com.example.MindmapBackend.Domain.Mindmap;
import com.example.MindmapBackend.Repository.ApplicationuserRepository;
import com.example.MindmapBackend.Repository.MindmapRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MindmapService {

    @Autowired
    private MindmapRepository mindmapRepository;


    @Autowired
    private ApplicationuserRepository applicationuserRepository;

    // Create a new Mindmap for a specific user
    @Transactional
    public Mindmap createMindmap(Integer userId, Mindmap mindmap) {
        return applicationuserRepository.findById(userId)
                .map(applicationuser -> {
                    mindmap.setApplicationuser(applicationuser);  // Set the user who creates the mindmap
                    return mindmapRepository.save(mindmap);
                }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public List<Mindmap> searchMindMaps(String query, Integer userId) {
        // Fetch mind maps by userId and query
        return mindmapRepository.findByApplicationuserIdAndTitleContaining(userId, query);
    }

    @Transactional
    public List<Mindmap> getMindmapsByUser(Integer userId) {
        return mindmapRepository.findByApplicationuserId(userId);
    }

    @Transactional
    public Mindmap getMindmapById(Integer id) {
        return mindmapRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mindmap not found"));
    }

    @Transactional
    public Mindmap updateMindmap(Integer id, Mindmap newMindmap) {
        return mindmapRepository.findById(id)
                .map(mindmap -> {
                    mindmap.setTitle(newMindmap.getTitle());
                    return mindmapRepository.save(mindmap);
                }).orElseThrow(() -> new RuntimeException("Mindmap not found"));
    }
}
