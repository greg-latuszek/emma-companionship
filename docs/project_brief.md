# Project Brief: emmaCompanionship

## Executive Summary

emmaCompanionship is a relations tracking application designed to help Companionship Delegates manage and maintain the complex system of companionship and supervision relationships within a community. The primary problem it solves is the administrative difficulty of tracking these relationships, ensuring they adhere to a strict set of rules, and monitoring their overall health, a task currently handled by manual tools like Excel. The target users for the initial phase are the Companionship Delegates at the Province, Zone, and International levels, as well as Province Heads. The application's key value is providing visual tools and structured workflows to efficiently find suitable companions, monitor relationship health, identify overwhelmed members, and ensure every eligible community member receives guidance.

## Problem Statement

Community relationship managers, known as Companionship Delegates, are responsible for a complex network of interpersonal relationships. These relationships are governed by strict constraints, including gender matching, experience levels, separation of authority, and language barriers. Currently, managing this system with tools like Excel is inefficient and prone to error. This manual process makes it difficult to:

* Visually comprehend the entire relationship graph for a province.
* Efficiently find eligible "Companions" for "Accompanied" members while respecting all constraints.
* Identify members who are eligible for companionship but currently have no one assigned.
* Detect "overwhelmed" Companions who are supporting too many people.
* Monitor the health of relationships, which is determined by the frequency of meetings.
* Manage cross-province assignments when a local Companion cannot be found.

The impact of this inefficiency can lead to unhealthy or neglected relationships, members lacking necessary support, and Companion burnout.

## Proposed Solution

The proposed solution is an open-source web application that models the community relationships as a graph, with a dedicated frontend and backend. The application will serve as a centralized tool for Companionship Delegates to manage their duties.

Key features will include:

* **Visual Dashboards**: Instead of spreadsheets, Delegates will use interactive graphs and lists to view the companionship network. Specific views will be available for overall health, missing companionships, overwhelmed companions, and finding new companion candidates.
* **Workflow Automation**: The application will guide Delegates through core processes like assigning a new Companion, handling change requests, and rebalancing workloads for overwhelmed members.
* **Constraint Enforcement**: The system will automatically filter and suggest companion candidates based on the complex set of rules (gender, experience, power separation, etc.), preventing invalid assignments.
* **Data Management**: A central database will hold all community members and their relevant attributes, with the ability to initially import data from CSV or Excel files.

## Target Users

The primary user group for Phase 1 are the **Companionship Delegates (CD)** at all hierarchical levels (Province, Zone, International) and **Province Heads (PH)**. Their main goal is to effectively and efficiently manage the companionship system within their designated geographical area.

## Goals & Success Metrics

* **Business Objectives**:
    * Improve the operational efficiency of Companionship Delegates.
    * Increase the percentage of "healthy" companionship relationships within the community.
    * Ensure 100% of eligible community members are assigned a Companion.
    * Reduce the administrative burden and risk of burnout for Companions.
* **User Success Metrics**:
    * Reduced time spent finding and assigning a suitable Companion.
    * A clear, at-a-glance understanding of the companionship network's health.
    * High confidence in the data's accuracy and adherence to community rules.
* **Key Performance Indicators (KPIs)**:
    * Decrease in the number of members on the "missing companionship" list.
    * Decrease in the number of relationships with a "red" or "yellow" health status.
    * Time-to-assignment for new companionship requests.

## MVP Scope

The initial version (Phase 1) will focus on providing the core management tools for Companionship Delegates.

* **Core Features (Must Have)**:
    * System for adding, editing, and managing community members and their attributes (name, status, roles, languages, etc.).
    * A fault-tolerant wizard for initial data import from CSV and Microsoft Excel files.
    * Workflows to assign companionships (both within a province and cross-province).
    * A mechanism for Delegates to record meeting dates or cadences to track relationship health.
    * Visual dashboards: "overall graph," "missing companionship view," "new companions view," "overwhelmed view," "companionship health view," and "companion health view."
    * Role-based access control: Province Delegates can edit their own province data. Higher-level delegates have filtered, read-only statistical views.
* **Out of Scope for MVP**:
    * Direct in-app communication (chat, voice, video calls).
    * Calendar integration for scheduling meetings.
    * Accounts or features for non-Delegate community members.
    * Direct drag-and-drop editing of the relationship graphs.
    * A native mobile application.

## Post-MVP Vision

* **Phase 2**: Introduce features for all community members (non-Delegates), allowing them to manage their companionship meetings. This includes calendar integration (Google, Outlook) and links to external communication tools (Phone call, WhatsApp). This will enable auto-population of relationship health data.
* **Phase 3**: Implement a native, secure, and encrypted voice/video call feature within the application to enhance confidential communication.
* **Long-Term**: Develop advanced statistical dashboards and charts for higher-level delegates to provide deeper insights into the health of the entire community's companionship system.

## Technical Considerations

* **Platform**: The application will be a web application with a distinct frontend and backend.
* **Extensibility**: The architecture must be designed to allow for the future development of a mobile app that reuses the backend services created in Phase 1.
* **Open Source**: The project will be open-source to build trust and allow for verification of its confidentiality measures.

## Constraints & Assumptions

* **Constraints**:
    * **Confidentiality**: The application must not store the content of any dialogues. All user data must be protected, with access restricted based on roles.
    * **Companionship Rules**: The system must enforce all documented rules regarding gender, experience, consecrated status, and the separation of supervision and companionship.
    * **Language**: Companionship can only be established between members who share a common language.
* **Key Assumptions**:
    * The consent process for establishing a companionship relationship will be handled by the Delegates outside the application for Phase 1.
    * Initial data imported from Excel will likely be inconsistent across different provinces, requiring a robust and user-friendly data validation and cleanup process during import.

## Risks & Open Questions

* **Key Risks**:
    * **Data Import Complexity**: The variability and potential messiness of existing Excel sheets pose a significant risk to the initial data loading phase.
    * **Scalability of Visuals**: Graph visualizations for large geographical areas (Zones or the entire Community) may become too cluttered to be usable. The solution must implement smart filtering, pagination, and aggregation.
    * **User Expectations**: Delegates might intuitively expect to edit relationships directly on the graph (e.g., drag-and-drop). The design specifies graphs as non-editable dashboards that launch workflows, which could create a point of friction.
    * **Delegate Couple Accounts**: A clear strategy is needed to handle "delegate couples" to avoid conflicting edits or confusion, while maintaining an audit trail of individual actions.
* **Open Questions**:
    * What is the detailed, step-by-step approval workflow for establishing a cross-province companionship relationship?
    * What are the specific conditions under which confidentiality may be broken?

## Next Steps

* **PM Handoff**: This Project Brief provides the full context for emmaCompanionship. The next step is to engage the Product Manager (PM) to begin creating the detailed Product Requirements Document (PRD).