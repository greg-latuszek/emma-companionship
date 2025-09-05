# Database Schema

This section transforms our conceptual data models into concrete PostgreSQL database schemas with proper relationships, constraints, and indexes for optimal performance and data integrity.

```sql
-- ====================================
-- Core Geographic and Organization Schema
-- ====================================

-- Geographic units for organizational hierarchy
CREATE TABLE geographic_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('sector', 'province', 'country', 'zone', 'community')),
    parent_id UUID REFERENCES geographic_units(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for geographic hierarchy queries
CREATE INDEX idx_geographic_units_parent_id ON geographic_units(parent_id);
CREATE INDEX idx_geographic_units_type ON geographic_units(type);
CREATE INDEX idx_geographic_units_name ON geographic_units(name);

-- ====================================
-- Member and Identity Schema
-- ====================================

-- Core member information
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    marital_status VARCHAR(20) NOT NULL CHECK (marital_status IN ('single', 'married', 'widowed', 'consecrated')),
    community_engagement_status VARCHAR(50) NOT NULL CHECK (community_engagement_status IN ('Looker-On', 'In-Probation', 'Commited', 'In-Fraternity-Probation', 'Fraternity')),
    accompanying_readiness VARCHAR(30) NOT NULL CHECK (accompanying_readiness IN ('Not Candidate', 'Candidate', 'Ready', 'Active', 'Overwhelmed', 'Deactivated')),
    languages TEXT[] NOT NULL DEFAULT '{}',
    geographic_unit_id UUID NOT NULL REFERENCES geographic_units(id) ON DELETE RESTRICT,
    
    -- Optional contact and personal information
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Argon2 hashed password
    phone VARCHAR(50),
    date_of_birth DATE,
    image_url TEXT,
    notes TEXT,
    consecrated_status VARCHAR(20) CHECK (consecrated_status IN ('priest', 'deacon', 'seminarian', 'sister', 'brother')),
    couple_id UUID REFERENCES couples(id) ON DELETE SET NULL,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes for member queries
CREATE INDEX idx_members_geographic_unit_id ON members(geographic_unit_id);
CREATE INDEX idx_members_accompanying_readiness ON members(accompanying_readiness);
CREATE INDEX idx_members_community_engagement ON members(community_engagement_status);
CREATE INDEX idx_members_gender ON members(gender);
CREATE INDEX idx_members_marital_status ON members(marital_status);
CREATE INDEX idx_members_consecrated_status ON members(consecrated_status);
CREATE INDEX idx_members_couple_id ON members(couple_id);
CREATE INDEX idx_members_name ON members(last_name, first_name);

-- Full-text search index for member search
CREATE INDEX idx_members_search ON members USING GIN (
    to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(email, ''))
);

-- Couple relationships
CREATE TABLE couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member1_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    member2_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    wedding_date DATE,
    number_of_children INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure couple members are unique
    CONSTRAINT unique_couple_members UNIQUE(member1_id, member2_id),
    CONSTRAINT no_self_couple CHECK (member1_id != member2_id)
);

CREATE INDEX idx_couples_member1_id ON couples(member1_id);
CREATE INDEX idx_couples_member2_id ON couples(member2_id);

-- ====================================
-- Role and Authorization Schema
-- ====================================

-- Role definitions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE CHECK (name IN ('Companionship Delegate', 'Supervisor', 'Admin')),
    level VARCHAR(20) NOT NULL CHECK (level IN ('sector', 'province', 'country', 'zone', 'international')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role assignments with geographic scope
CREATE TABLE role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    scope_id UUID NOT NULL REFERENCES geographic_units(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES members(id),
    
    -- Prevent duplicate role assignments
    CONSTRAINT unique_member_role_scope UNIQUE(member_id, role_id, scope_id)
);

CREATE INDEX idx_role_assignments_member_id ON role_assignments(member_id);
CREATE INDEX idx_role_assignments_role_id ON role_assignments(role_id);
CREATE INDEX idx_role_assignments_scope_id ON role_assignments(scope_id);

-- ====================================
-- Companionship and Relationship Schema
-- ====================================

-- Companionship relationships
CREATE TABLE companionships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companion_id UUID NOT NULL,
    companion_type VARCHAR(10) NOT NULL CHECK (companion_type IN ('member', 'couple')),
    accompanied_id UUID NOT NULL,
    accompanied_type VARCHAR(10) NOT NULL CHECK (accompanied_type IN ('member', 'couple')),
    status VARCHAR(20) NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'active', 'archived')),
    health_status VARCHAR(10) CHECK (health_status IN ('green', 'yellow', 'red', 'gray')),
    health_status_updated_at TIMESTAMP WITH TIME ZONE,  -- When the health status was last changed
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure valid date range
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date),
    -- Prevent self-companionship
    CONSTRAINT no_self_companionship CHECK (
        NOT (companion_id = accompanied_id AND companion_type = accompanied_type)
    )
);

-- Performance indexes for companionship queries
CREATE INDEX idx_companionships_companion ON companionships(companion_id, companion_type);
CREATE INDEX idx_companionships_accompanied ON companionships(accompanied_id, accompanied_type);
CREATE INDEX idx_companionships_status ON companionships(status);
CREATE INDEX idx_companionships_health_status ON companionships(health_status);
CREATE INDEX idx_companionships_date_range ON companionships(start_date, end_date);

-- ====================================
-- Approval Workflow Schema
-- ====================================

-- Approval process tracking
CREATE TABLE approval_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companionship_id UUID NOT NULL REFERENCES companionships(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure one approval process per companionship
    CONSTRAINT unique_companionship_approval UNIQUE(companionship_id)
);

CREATE INDEX idx_approval_processes_companionship_id ON approval_processes(companionship_id);
CREATE INDEX idx_approval_processes_status ON approval_processes(status);

-- Individual approval steps
CREATE TABLE approval_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_process_id UUID NOT NULL REFERENCES approval_processes(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    approver_role VARCHAR(50) NOT NULL CHECK (approver_role IN (
        'province_head', 'country_head', 'zone_delegate', 
        'zone_delegate_for_priests', 'zone_delegate_for_consecrated_sisters',
        'zone_companionship_delegate', 'international_companionship_delegate',
        'general_moderator', 'companion', 'accompanied'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES members(id),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique step order per process
    CONSTRAINT unique_process_step_order UNIQUE(approval_process_id, step_order)
);

CREATE INDEX idx_approval_steps_process_id ON approval_steps(approval_process_id);
CREATE INDEX idx_approval_steps_status ON approval_steps(status);
CREATE INDEX idx_approval_steps_approver_role ON approval_steps(approver_role);
CREATE INDEX idx_approval_steps_approved_by ON approval_steps(approved_by);

-- ====================================
-- Audit and History Schema
-- ====================================

-- Audit trail for sensitive operations
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES members(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);

-- ====================================
-- Database Functions and Triggers
-- ====================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couples_updated_at 
    BEFORE UPDATE ON couples 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companionships_updated_at 
    BEFORE UPDATE ON companionships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geographic_units_updated_at 
    BEFORE UPDATE ON geographic_units 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate geographic hierarchy (prevent cycles)
CREATE OR REPLACE FUNCTION validate_geographic_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent creating cycles in geographic hierarchy
    IF NEW.parent_id IS NOT NULL THEN
        -- Use a recursive CTE to check for cycles
        WITH RECURSIVE hierarchy_check AS (
            SELECT id, parent_id, 1 as level
            FROM geographic_units 
            WHERE id = NEW.parent_id
            
            UNION ALL
            
            SELECT gu.id, gu.parent_id, hc.level + 1
            FROM geographic_units gu
            JOIN hierarchy_check hc ON gu.id = hc.parent_id
            WHERE hc.level < 10 -- Prevent infinite recursion
        )
        SELECT 1 FROM hierarchy_check WHERE id = NEW.id;
        
        IF FOUND THEN
            RAISE EXCEPTION 'Cannot create geographic hierarchy cycle';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_geographic_hierarchy_trigger
    BEFORE INSERT OR UPDATE ON geographic_units
    FOR EACH ROW EXECUTE FUNCTION validate_geographic_hierarchy();

-- ====================================
-- Performance and Maintenance
-- ====================================

-- Partial indexes for active records
CREATE INDEX idx_active_companionships ON companionships(status, health_status) 
    WHERE status = 'active';

CREATE INDEX idx_pending_approvals ON approval_steps(approval_process_id, step_order) 
    WHERE status = 'pending';

-- Composite indexes for common query patterns
CREATE INDEX idx_member_location_readiness ON members(geographic_unit_id, accompanying_readiness, gender);
CREATE INDEX idx_companionship_timeline ON companionships(status, start_date, end_date) 
    WHERE status IN ('active', 'proposed');

-- ====================================
-- Initial Data and Constraints
-- ====================================

-- Insert default roles
INSERT INTO roles (name, level, description) VALUES
    ('Admin', 'international', 'System administrator with full access'),
    ('Supervisor', 'province', 'Province-level supervision role'),
    ('Companionship Delegate', 'province', 'Manages companionship assignments within province');

-- Add constraint to ensure couples reference valid members
-- (This will be enforced by foreign keys, but documented here for clarity)

-- Add constraint to ensure companionship participants exist
-- (This will be validated at application level due to polymorphic references)
```

-----
