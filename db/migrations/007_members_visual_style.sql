-- Login members may choose a visual style. NULL means the application default.

ALTER TABLE members ADD COLUMN IF NOT EXISTS visual_style VARCHAR(32);

ALTER TABLE members DROP CONSTRAINT IF EXISTS members_visual_style_check;
ALTER TABLE members ADD CONSTRAINT members_visual_style_check
    CHECK (
        visual_style IS NULL
        OR visual_style IN ('semi-transparent', 'high-contrast')
    );
