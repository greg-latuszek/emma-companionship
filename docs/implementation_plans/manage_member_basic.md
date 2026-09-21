# Basic CRUD for member management - implementation plan

## Overview
db/migrations/002_members_table.sql carries schema for members.
Goal for this document is to plan implementation of Create/Read/Update/Delete
functionality of managing members. 

## Scope
Basic management which means not all fields are required to be handled.
We define scope by listing fields from member table that are out of scope,
all remaining fields are in scope:
- id - DB ID auto created
- first_name
- last_name
- gender
- marital_status
- consecrated_status
- community_engagement_status
- accompanying_readiness - default: 'Not Candidate'
- email
- phone
- notes
- member_type (should be removed since it was to differentiate members who are allowed to login
               into app from others. However, `is_active` does exactly that role)

### Out of scope
- date_of_birth (maybe will change just to class: youth (8-30), middle-age, elderly)
- languages (future update of language skills - requires ISO language codes)
- image_url (no handling of member image upload)
- profile_picture (already handled by auth functionality)
- geographic_unit_id (assignment to Geo-unit is future feature)
- couple_id (couple building is future feature)
- password_hash (future auth with email based registration/login flow)
- oauth_provider (already handled by auth functionality)
- oauth_id (already handled by auth functionality)
- is_active (activation panel is future feature)
- approved_by (activation panel is future feature)
- approved_at (activation panel is future feature)
- revoked_by (deactivation panel is future feature)
- revoked_at (deactivation panel is future feature)
- registry_check_result (future semi-automated activation)