package com.example.MindmapBackend.Controller;

import com.example.MindmapBackend.Domain.Edge;
import com.example.MindmapBackend.Domain.Mindmap;
import com.example.MindmapBackend.Domain.Node;
import com.example.MindmapBackend.Domain.PasteLinkRequest;
import com.example.MindmapBackend.Service.EdgeService;
import com.example.MindmapBackend.Service.MindmapService;
import com.example.MindmapBackend.Service.NodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/mindmaps")
public class NodeController {
    @Autowired
    private NodeService nodeService;

    @Autowired
    private MindmapService mindmapService;

    @Autowired
    private EdgeService edgeService;

    @GetMapping("/{nodeId}/link")
    public ResponseEntity<String> generateNodeLink(@PathVariable String nodeId) {
        String frontendBaseUrl = "http://yourfrontendurl.com";
        Node node = nodeService.getNodeById(nodeId);

        if (node != null) {
            String link = frontendBaseUrl + "/mindmap/" + node.getMindmaps().get(0).getId() + "/node/" + node.getId();
            return ResponseEntity.ok(link);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Node not found");
        }
    }




    @PostMapping("/paste-link")
    public ResponseEntity<String> attachNodeToMindmap(@RequestBody PasteLinkRequest pasteLinkRequest) {
        try {
            System.out.println("Request received: " + pasteLinkRequest);

            // Retrieve the node to attach and the target mindmap
            Node nodeToAttach = nodeService.getNodeById(pasteLinkRequest.getNodeId());
            Mindmap targetMindmap = mindmapService.getMindmapById(pasteLinkRequest.getTargetMindmapId());

            // Check if the node and mindmap exist
            if (nodeToAttach == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Node not found");
            }

            if (targetMindmap == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Target mindmap not found");
            }

            // Check if the node already exists in the target mindmap
            if (targetMindmap.getNodes().contains(nodeToAttach)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Node already exists in the target mindmap");
            }

            // Associate the node with the target mindmap
            targetMindmap.getNodes().add(nodeToAttach);

            // Retrieve the new parent node
            Node newParentNode = nodeService.getNodeById(pasteLinkRequest.getNewParentId());
            if (newParentNode != null) {
                // Add the new parent node to the nodeToAttach's parents
                nodeToAttach.getParents().add(newParentNode);

                // Create the edge between the new parent node and the node being attached
                Edge newEdge = edgeService.createEdge(newParentNode.getId(), nodeToAttach.getId(), new Edge());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("New parent node not found");
            }

            mindmapService.saveMindmap(targetMindmap);
            nodeService.saveNode(nodeToAttach);

            return ResponseEntity.ok("Node successfully attached to the new mindmap and edge created");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error attaching node: " + e.getMessage());
        }
    }



    @PostMapping("/mindmap/{mindmapId}/node")
    public ResponseEntity<Node> createNode(@PathVariable Integer mindmapId, @RequestBody Node node) {
        Node newNode = nodeService.createNode(mindmapId, node);
        return new ResponseEntity<>(newNode, HttpStatus.CREATED);
    }

    @GetMapping("/mindmap/{mindmapId}/node")
    public ResponseEntity<List<Node>> getNodesByMindMap(@PathVariable Integer mindmapId) { //(value = "id")
        List<Node> nodes = nodeService.getNodesByMindMap(mindmapId);
        return new ResponseEntity<>(nodes, HttpStatus.OK);
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
