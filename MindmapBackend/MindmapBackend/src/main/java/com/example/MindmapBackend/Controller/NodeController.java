package com.example.MindmapBackend.Controller;

import com.example.MindmapBackend.Domain.Node;
import com.example.MindmapBackend.Domain.Video;
import com.example.MindmapBackend.Service.NodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin
@RequestMapping("/mindmaps")
public class NodeController {
    @Autowired
    private NodeService nodeService;

    @PostMapping("/mindmap/{mindmapId}/node")
    public ResponseEntity<Node> createNode(@PathVariable Integer mindmapId, @RequestBody Node node) {
        Node newNode = nodeService.createNode(mindmapId, node);
        return new ResponseEntity<>(newNode, HttpStatus.CREATED);
    }

    @GetMapping("/mindmap/{mindmapId}/node")
    public ResponseEntity<List<Node>> getNodesByMindMap(@PathVariable Integer mindmapId) { //(value = "id")
        List<Node> cards = nodeService.getNodesByMindMap(mindmapId);
        return new ResponseEntity<>(cards, HttpStatus.OK);
        //return nodeService.getNodesByMindMap(mindmapId);
    }
    @GetMapping("node/{id}")
    public ResponseEntity<Node> getNodeById(@PathVariable String id) {
        Node node = nodeService.getNodeById(id);
        return new ResponseEntity<>(node, HttpStatus.OK);
    }
    @PutMapping("/node/{id}")
    public ResponseEntity<?> updateNode(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return new ResponseEntity<>(nodeService.updateNode(id, updates), HttpStatus.OK);
    }
}
