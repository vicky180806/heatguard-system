from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Updating database schema...")
    
    # Check if columns exist and add them if not
    with db.engine.connect() as conn:
        # Get existing columns
        result = conn.execute(text("SHOW COLUMNS FROM user"))
        columns = [row[0] for row in result.fetchall()]
        
        alter_queries = []
        
        if 'phone' not in columns:
            alter_queries.append("ALTER TABLE user ADD COLUMN phone VARCHAR(20)")
        if 'location' not in columns:
            alter_queries.append("ALTER TABLE user ADD COLUMN location VARCHAR(100)")
        if 'profile_image' not in columns:
            alter_queries.append("ALTER TABLE user ADD COLUMN profile_image VARCHAR(200)")
        if 'last_login' not in columns:
            alter_queries.append("ALTER TABLE user ADD COLUMN last_login DATETIME")
        if 'search_count' not in columns:
            alter_queries.append("ALTER TABLE user ADD COLUMN search_count INTEGER DEFAULT 0")
            
        for query in alter_queries:
            print(f"Executing: {query}")
            conn.execute(text(query))
            
        if not alter_queries:
            print("No schema changes needed.")
        else:
            conn.commit()
            print("Schema update complete.")
