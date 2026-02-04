import { getSqlClient } from './connection';

let sql: any = null;

async function getSql() {
  if (!sql) {
    sql = await getSqlClient();
  }
  return sql;
}

export async function migrateCMSTables() {
  console.log('🎨 Starting CMS database migration...');

  try {
    const dbSql = await getSql();

    // Create homepage_content table
    await dbSql`
      CREATE TABLE IF NOT EXISTS homepage_content (
        id TEXT PRIMARY KEY,
        hero_section JSONB,
        services_section JSONB,
        vision_mission_section JSONB,
        locations_section JSONB,
        footer_section JSONB,
        theme_settings JSONB,
        version VARCHAR(50) DEFAULT '1.0.0',
        is_active BOOLEAN DEFAULT true,
        published_at TIMESTAMP,
        created_by TEXT,
        updated_by TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ homepage_content table created');

    // Create cms_content_history table
    await dbSql`
      CREATE TABLE IF NOT EXISTS cms_content_history (
        id TEXT PRIMARY KEY,
        content_id TEXT NOT NULL,
        action VARCHAR(50) NOT NULL,
        content_snapshot JSONB,
        changed_fields JSONB,
        change_description TEXT,
        changed_by TEXT,
        changed_by_name VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ cms_content_history table created');

    // Create cms_settings table
    await dbSql`
      CREATE TABLE IF NOT EXISTS cms_settings (
        id TEXT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value JSONB,
        description TEXT,
        category VARCHAR(50) DEFAULT 'general',
        is_system BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ cms_settings table created');

    // Create indexes for better performance
    await dbSql`
      CREATE INDEX IF NOT EXISTS idx_homepage_content_active
      ON homepage_content(is_active, updated_at DESC);
    `;

    await dbSql`
      CREATE INDEX IF NOT EXISTS idx_cms_content_history_content_id
      ON cms_content_history(content_id, created_at DESC);
    `;

    await dbSql`
      CREATE INDEX IF NOT EXISTS idx_cms_settings_key
      ON cms_settings(setting_key);
    `;

    console.log('✅ CMS indexes created');

    console.log('🎉 CMS database migration completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ CMS migration error:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateCMSTables()
    .then(() => {
      console.log('✅ CMS Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ CMS Migration failed:', error);
      process.exit(1);
    });
}
