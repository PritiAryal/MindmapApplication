package com.example.MindmapBackend.Controller;

import com.example.MindmapBackend.Domain.Edge;
import com.example.MindmapBackend.Service.EdgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/mindmaps")
public class EdgeController {
    @Autowired
    private EdgeService edgeService;


    @PostMapping("/edges/{sourceId}/{targetId}")
    public ResponseEntity<?> createEdge(
            @PathVariable String sourceId,
            @PathVariable String targetId,
            @RequestBody Edge edge) {

        try {
            Edge createdEdge = edgeService.createEdge(sourceId, targetId, edge);
            return ResponseEntity.ok(createdEdge);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("edges")
    public ResponseEntity<List<Edge>> getAllEdges() {
        List<Edge> edges = edgeService.getAllEdges();
        return ResponseEntity.ok(edges);
    }

    @GetMapping("/nodes/{nodeId}/edges")
    public ResponseEntity<List<Edge>> getEdgesBySource(@PathVariable String nodeId) {
        List<Edge> edges = edgeService.getEdgesBySource(nodeId);
        return ResponseEntity.ok(edges);
    }

    @GetMapping("edge/{id}")
    public ResponseEntity<Edge> getEdgeById(@PathVariable String id) {
        Optional<Edge> edge = edgeService.getEdgeById(id);
        return edge.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }



   @DeleteMapping("edge/{id}")
    public ResponseEntity<Void> deleteEdge(@PathVariable String id) {
        edgeService.deleteEdge(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/edge/{id}")
    public ResponseEntity<?> updateEdge(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return new ResponseEntity<>(edgeService.updateEdge(id, updates), HttpStatus.OK);
    }

}
