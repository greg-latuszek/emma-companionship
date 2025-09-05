# Requirements

## MVP Functional Requirements

1.  **FR1**: The system must allow authorized users (Delegates) to add, view, and edit community members and their attributes (e.g., name, status, roles, languages).
2.  **FR2**: The system must model and manage both `accompanying` and `supervising` relationships between members, ensuring a person cannot be both a Supervisor and a Companion to the same individual.
3.  **FR3**: The system must enforce all companionship constraints during assignment, including gender matching, experience levels, separation of power, language compatibility, and Companion from Fraternity preference.
4.  **FR4**: The system must provide visual dashboards (graphs/lists) for a Delegate's province, including views for "missing companionship," "overwhelmed" companions, and relationship "health."
5.  **FR5**: The system must support a workflow for assigning a new Companion to an Accompanied member, including gaining consent.
6.  **FR7**: The system must provide a mechanism for importing initial member data from CSV or Microsoft Excel files, including a validation and error-correction step.
7.  **FR8**: The system must implement role-based access control, restricting data visibility and editing capabilities based on the user's role and geographical hierarchy.
8.  **FR10 (Modified)**: Delegates will have a view for relationship health and will manually update the status (e.g., Green, Yellow, Red) for the MVP.
9.  **FR13**: The system must allow Delegates to reassign an Accompanied member between Companions via a direct drag-and-drop action on the graph view, serving as a 'quick record' for an offline agreement.

## Non-Functional Requirements

1.  **NFR1**: **Confidentiality:** The system must not store the content of any user dialogues and must protect all personal data with role-based access.
2.  **NFR2**: **Open Source:** The application's source code must be open-source to ensure transparency and build trust.
3.  **NFR3**: **Usability:** The user interface must be intuitive for non-technical users, particularly for adding new members and managing companionship relations.
4.  **NFR4**: **Scalability:** The system must handle views for higher-level delegates (Zone, International) by providing aggregated statistics or paginated lists, rather than attempting to render potentially massive graphs.
5.  **NFR5**: **Extensibility:** The backend architecture must be designed to be reused by a future mobile application.
6.  **NFR6**: **Configurability:** Key business rules (e.g., max companionship duration, "overwhelmed" threshold, health status timeframes) must be configurable by an administrator.
7.  **NFR7**: **Data Archiving:** When a companionship relation ends, its records must be archived for historical purposes rather than being deleted, without cluttering the active user interface.

---