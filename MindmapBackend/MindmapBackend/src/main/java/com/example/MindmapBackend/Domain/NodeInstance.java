package com.example.MindmapBackend.Domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class NodeInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "node_id", nullable = false)
    private Node node;

    @ManyToOne
    @JoinColumn(name = "mindmap_id", nullable = false)
    private Mindmap mindmap;

    private String label;
    private double x;
    private double y;
}
