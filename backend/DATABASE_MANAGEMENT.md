# Database Management Guide

This guide covers how to manage the database for the DataMingle backend using Flask-SQLAlchemy and Flask-Migrate.

## Current Setup

- **Database**: SQLite (development) - `backend/db.sqlite`
- **ORM**: Flask-SQLAlchemy 3.1.1
- **Migrations**: Flask-Migrate 4.1.0 (which uses Alembic)
- **Future**: PostgreSQL (production)

## Environment Setup

Always activate the conda environment before running database commands:

```bash
conda activate datamingle
cd backend
```

## Migration Commands

### Create a new migration

When you modify models (add/remove fields, tables, etc.):

```bash
flask db migrate -m "Description of changes"
```

### Apply migrations

To create/update the database with the latest schema:

```bash
flask db upgrade
```

### Downgrade (rollback)

To rollback to a previous migration:

```bash
flask db downgrade
```

### View migration history

```bash
flask db history
```

### View current revision

```bash
flask db current
```

## Database Commands

### Initialize database tables (without migrations)

```bash
flask init-db
```

### Reset database (drops and recreates all tables)

```bash
flask reset-db
```

## File Structure

```
backend/
├── db.sqlite                  # SQLite database file
├── migrations/                # Migration directory
│   ├── versions/              # Individual migration files
│   ├── alembic.ini           # Alembic configuration
│   ├── env.py                # Migration environment
│   └── script.py.mako        # Migration template
├── models/                   # Model definitions (currently unused)
├── config/                   # Database configuration
│   └── database.py          # Database config class
└── app.py                   # Main app with User model
```

## User Model

The User model integrates with WorkOS authentication:

- **workos_user_id**: Maps to WorkOS user ID (JWT 'sub' claim)
- **email**: User's email address
- **first_name/last_name**: User's name
- **profile_picture_url**: Profile image URL
- **is_active/is_admin**: Application-specific flags
- **timezone/language**: User preferences
- **created_at/updated_at/last_login_at**: Timestamps

## Adding New Models

1. Define the model in `app.py` (or move to separate files later)
2. Create a migration: `flask db migrate -m "Add ModelName table"`
3. Apply the migration: `flask db upgrade`

## Switching to PostgreSQL

When ready to switch to PostgreSQL:

1. Update `config/database.py` to use PostgreSQL configuration
2. Install PostgreSQL driver: `pip install psycopg2-binary`
3. Update environment variables
4. Create new migration for PostgreSQL: `flask db migrate -m "Switch to PostgreSQL"`

## Common Issues

### "No changes in schema detected"

- Ensure models are imported in `app.py`
- Check that model inherits from `db.Model`
- Verify the model is defined before creating the migration

### Migration conflicts

- Use `flask db merge` to merge conflicting migrations
- Or manually resolve conflicts and create new migration

### Reset everything

If you need a fresh start:

```bash
rm -rf migrations/
rm db.sqlite
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Best Practices

1. **Always create migrations for schema changes** - don't modify tables directly
2. **Review migration files** before applying them
3. **Test migrations** on a copy of production data
4. **Backup database** before major migrations
5. **Use descriptive migration messages**
6. **Don't edit existing migrations** - create new ones instead
