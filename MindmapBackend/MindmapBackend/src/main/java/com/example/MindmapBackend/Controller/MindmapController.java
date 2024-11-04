package com.example.MindmapBackend.Controller;


import com.example.MindmapBackend.Domain.Mindmap;
import com.example.MindmapBackend.Service.GenerateMindmapService;
import com.example.MindmapBackend.Service.MindmapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@CrossOrigin
@RequestMapping("/mindmaps")
public class MindmapController {

    @Autowired
    private MindmapService mindmapService;


    @Autowired
    private GenerateMindmapService generateMindmapService;



    @PostMapping("/generate/{userId}")
    public ResponseEntity<Void> generateMindmap(
            @PathVariable Integer userId,
            @RequestBody Map<String, String> requestBody) {
        String keyword = requestBody.get("keyword");

        try {
            List<Mindmap> existingMindmaps = mindmapService.getMindmapsByUser(userId);

            // Check if any existing mindmap titles contain the keyword
            boolean duplicateFound = existingMindmaps.stream()
                    .anyMatch(mindmap -> mindmap.getTitle().equalsIgnoreCase(keyword));

            if (duplicateFound) {
                System.out.println("Duplicate mindmap found for keyword: " + keyword);
                return ResponseEntity.status(409).build();
            }

            // Call Python script to generate mindmap data
            String mindmapData = generateMindmapService.generateMindmapData(userId, keyword);

            System.out.println("Mindmap data generated: " + mindmapData);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }



    @PostMapping("/user/{userId}")
    public ResponseEntity<Mindmap> createMindmap(@PathVariable Integer userId, @RequestBody Mindmap mindmap) {
        Mindmap newMindmap = mindmapService.createMindmap(userId, mindmap);
        return new ResponseEntity<>(newMindmap, HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Mindmap>> getMindmapsByUser(@PathVariable Integer userId) {
        List<Mindmap> mindmaps = mindmapService.getMindmapsByUser(userId);
        return new ResponseEntity<>(mindmaps, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mindmap> getMindmapById(@PathVariable Integer id) {
        Mindmap mindmap = mindmapService.getMindmapById(id);
        return new ResponseEntity<>(mindmap, HttpStatus.OK);
    }


 @GetMapping("/user/{userId}/search")
 public ResponseEntity<List<Mindmap>> searchMindMaps(
         @PathVariable Integer userId,
         @RequestParam String query) {

     List<Mindmap> mindmaps = mindmapService.searchMindMaps(query, userId);


     return ResponseEntity.ok(mindmaps);
 }


    @PutMapping("/{id}")
    public ResponseEntity<Mindmap> updateMindmap(@PathVariable Integer id, @RequestBody Mindmap mindmap) {
        Mindmap updatedMindmap = mindmapService.updateMindmap(id, mindmap);
        return new ResponseEntity<>(updatedMindmap, HttpStatus.OK);
    }
}
