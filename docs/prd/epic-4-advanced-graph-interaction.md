# Epic 4: Advanced Graph Interaction

**Expanded Goal**: The goal of this epic is to significantly enhance the user experience and utility of the Companionship Graph. We will transform it from a static, view-only diagram into a powerful, interactive tool. This epic will introduce the high-efficiency 'quick record' drag-and-drop feature, the critical ability for delegates to track and visualize relationship health, and powerful filtering capabilities.

## Story 4.1: Track and Display Relationship Health
**As a** Delegate, 
**I want** to set and see the health status of each companionship, 
**so that** I can quickly identify relationships that need my attention.

**Acceptance Criteria**: 
1. A Delegate can select a companionship relationship and manually set its health status (e.g., Green, Yellow, Red, Gray/Unknown).
2. The edges representing companionship relationships on the graph are colored according to their currently set health status.
3. A legend explaining the color codes is clearly visible on the graph view page.

## Story 4.2: Implement "Quick Record" Drag-and-Drop Reassignment
**As a** Delegate, 
**I want** to reassign an Accompanied member by dragging their node to a new Companion on the graph, 
**so that** I can record an agreed-upon change with a single, intuitive action.

**Acceptance Criteria**: 
1. On the graph view, a Delegate can drag an Accompanied member's node and drop it onto a valid Companion node.
2. The backend validates that the new relationship would not violate any business rule constraints before allowing the drop.
3. The action triggers a confirmation modal summarizing the change (e.g., "Reassign Mary Sims from The Roys to The Browns?").
4. Upon confirmation, the old companionship relationship is archived, and the new one is created.
5. The graph view updates immediately to reflect the change.

## Story 4.3: Graph Filtering Capabilities
**As a** Delegate, 
**I want** to filter the graph view, 
**so that** I can focus on specific relationships in a large province.

**Acceptance Criteria**: 
1. The graph view page contains a set of filter controls.
2. A Delegate can filter the graph to show only companionship relationships or to show both companionship and supervision relationships.
3. A Delegate can filter the graph to show only relationships connected to a specific Companion or Accompanied person/couple.
4. A Delegate can filter by the type of Accompanied member (e.g., couple, priest, single).
5. Applying a filter correctly and performantly updates the displayed graph.

***