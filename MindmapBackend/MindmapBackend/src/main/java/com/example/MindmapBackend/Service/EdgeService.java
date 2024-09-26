package com.example.MindmapBackend.Service;

import com.example.MindmapBackend.Domain.Edge;
import com.example.MindmapBackend.Domain.Node;
import com.example.MindmapBackend.Repository.EdgeRepository;
import com.example.MindmapBackend.Repository.NodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class EdgeService {
    @Autowired
    private EdgeRepository edgeRepository;

    @Autowired
    private NodeRepository nodeRepository;


    @Transactional
    public Edge createEdge(String sourceId, String targetId, Edge edge) {
        Node sourceNode = nodeRepository.findById(sourceId)
                .orElseThrow(() -> new RuntimeException("Source node with id = " + sourceId + " not found"));

        Node targetNode = nodeRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("Target node with id = " + targetId + " not found"));

        edge.setSource(sourceNode);
        edge.setTarget(targetNode);
         edge.setId("e-" + sourceId + "-" + targetId);

        // Add edge to the respective node lists
        sourceNode.getOutgoingEdges().add(edge);
        targetNode.getIncomingEdges().add(edge);

        nodeRepository.save(sourceNode);
        nodeRepository.save(targetNode);

        return edgeRepository.save(edge);
    }



    @Transactional
    public List<Edge> getAllEdges() {
        return edgeRepository.findAll();
    }

    @Transactional
    public List<Edge> getEdgesBySource(String nodeId) {
        Optional<Node> nodeOptional = nodeRepository.findById(nodeId);
        if (nodeOptional.isPresent()) {
            Node node = nodeOptional.get();
            return node.getOutgoingEdges(); // Direct access to outgoing edges
        } else {
            throw new RuntimeException("Node with id " + nodeId + " not found.");
        }
    }

    @Transactional
    public Optional<Edge> getEdgeById(String id) {
        return edgeRepository.findById(id);
    }


    @Transactional
    public void deleteEdge(String id) {
        edgeRepository.deleteById(id);
    }

@Transactional
public Edge updateEdge(String id, Map<String, Object> updates) {
    return edgeRepository.findById(id)
            .map(existingEdge -> {
                String newSourceId = (String) updates.get("sourceId");
                String newTargetId = (String) updates.get("targetId");

                boolean sourceChanged = newSourceId != null && !newSourceId.equals(existingEdge.getSource().getId());
                boolean targetChanged = newTargetId != null && !newTargetId.equals(existingEdge.getTarget().getId());

                if (sourceChanged || targetChanged) {
                    // Delete the existing edge
                    deleteEdge(existingEdge.getId());

                    // Create a new edge with the updated source or target
                    Edge newEdge = new Edge();
                    newEdge.setHidden(existingEdge.isHidden());

                    Node newSourceNode = existingEdge.getSource();  // Default to existing source
                    Node newTargetNode = existingEdge.getTarget();  // Default to existing target

                    if (sourceChanged) {
                        newSourceNode = nodeRepository.findById(newSourceId)
                                .orElseThrow(() -> new RuntimeException("Source node not found"));
                    }

                    if (targetChanged) {
                        newTargetNode = nodeRepository.findById(newTargetId)
                                .orElseThrow(() -> new RuntimeException("Target node not found"));
                    }

                    newEdge.setSource(newSourceNode);
                    newEdge.setTarget(newTargetNode);

                    newEdge.setId("e-" + newSourceNode.getId() + "-" + newTargetNode.getId());

                    newSourceNode.getOutgoingEdges().add(newEdge);
                    newTargetNode.getIncomingEdges().add(newEdge);

                    nodeRepository.save(newSourceNode);
                    nodeRepository.save(newTargetNode);

                    return edgeRepository.save(newEdge);
                }

                if (updates.containsKey("hidden")) {
                    //existingEdge.setHidden((Boolean) updates.get("hidden"));
                    Boolean hidden = (Boolean) updates.get("hidden");
                    existingEdge.setHidden(hidden); // Apply the hidden field change
                }

                return edgeRepository.save(existingEdge);
            })
            .orElseThrow(() -> new RuntimeException("Edge not found"));
}
}
