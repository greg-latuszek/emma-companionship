# Epic 3: High-Value Workflows

**Expanded Goal**: The goal of this epic is to deliver the two most significant time-saving features for our Delegates. Now that the core data structures and basic visualization are in place, this epic focuses on automating the most burdensome administrative tasks: onboarding an entire province's data from a spreadsheet and guiding the user through the complex process of assigning a new companion.

## Story 3.1: Flexible Data Import from CSV/Excel
**As a** Delegate, 
**I want** to import my members from my own existing spreadsheet by mapping its columns to the system fields,
**so that** I can quickly onboard my province without reformatting my document.

**Acceptance Criteria**:
1. A Delegate can upload a CSV or Microsoft Excel file.
2. The system reads the header row of the file to identify the user's column names.
3. The user is presented with an interface where they can map their columns (e.g., "E-mail Address") to the system's required fields (e.g., "email").
4. After the Delegate defines and confirms the mapping, the system processes each subsequent row as a single person record.
5. The system validates the data during a pre-import scan and presents a summary of any errors (e.g., "Row 15: Invalid email format") for the user's review.
6. The Delegate has the option to proceed with importing only the valid rows, skipping the ones with errors.

## Story 3.2: Guided Companionship Assignment Wizard
**As a** Delegate, 
**I want** a guided workflow to assign a companion that includes tracking Province Head's approval, 
**so that** I am confident the assignment follows all rules.

**Acceptance Criteria**:
1. A Delegate can launch the assignment wizard for any member who needs a companion.
2. The wizard automatically presents a list of eligible companion candidates, filtered according to all business rule constraints (FR3).
3. The Delegate can select a candidate to create a "Proposal," which begins in a 'Pending PH Approval' status.
4. The system allows the Delegate to manually update the proposal's status to reflect the offline approval process. The status flow is: 'PH Approved' -> 'Proposed to Members' -> 'Accepted by Members'. The proposal can also be marked 'Rejected' at any stage.
5. Only when the status is marked 'Accepted by Members' is the formal companionship relationship created in the system.

---