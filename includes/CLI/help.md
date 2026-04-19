# AuthGuard CLI User Guide

This guide provides detailed instructions for using AuthGuard WP-CLI commands to manage logs and login redirects.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Logs Commands](#logs-commands)
- [Login Redirects Commands](#login-redirects-commands)
- [2FA Logs Commands](#2fa-logs-commands)
- [Common Workflows](#common-workflows)
- [Tips and Best Practices](#tips-and-best-practices)

## Prerequisites

Before using AuthGuard CLI commands, ensure you have:

1. **WP-CLI installed** - Verify installation:
   ```bash
   wp --version
   ```

2. **AuthGuard plugin activated** - The plugin must be active for CLI commands to work

3. **Database tables created** - Tables are automatically created on plugin activation

4. **Appropriate permissions** - You'll need file system and database permissions

## Logs Commands

### seed_logs

Seed the logs table with sample data for testing and development.

#### Usage

```bash
wp authguard seed_logs [--count=<number>]
```

#### Parameters

- `--count=<number>` - Number of log entries to create (default: 10)

#### Examples

**Create 10 log entries (default)**
```bash
wp authguard seed_logs
```

**Create 50 log entries**
```bash
wp authguard seed_logs --count=50
```

**Create 100 log entries**
```bash
wp authguard seed_logs --count=100
```

#### Output

The command displays:
- Progress bar during insertion
- Count of successfully inserted entries
- Count of failed entries (if any)
- Sample of inserted logs

### clear_logs

Clear all logs from the database table.

#### Usage

```bash
wp authguard clear_logs [--yes]
```

#### Parameters

- `--yes` - Skip confirmation prompt

#### Examples

**Clear logs with confirmation**
```bash
wp authguard clear_logs
```
This will prompt:
```
Are you sure you want to delete 50 log entries? [y/n]
```

**Clear logs without confirmation**
```bash
wp authguard clear_logs --yes
```

#### Notes

- This operation is **irreversible**
- All data will be deleted permanently
- Consider backing up your database before running

### show_logs

Display recent logs from the database.

#### Usage

```bash
wp authguard show_logs [--limit=<number>] [--format=<format>]
```

#### Parameters

- `--limit=<number>` - Number of logs to display (default: 10)
- `--format=<format>` - Output format: table, csv, json, yaml (default: table)

#### Examples

**Show 10 recent logs**
```bash
wp authguard show_logs
```

**Show 20 recent logs**
```bash
wp authguard show_logs --limit=20
```

**Show 50 recent logs**
```bash
wp authguard show_logs --limit=50
```

**Output in JSON format**
```bash
wp authguard show_logs --format=json
```

**Output in CSV format**
```bash
wp authguard show_logs --format=csv
```

**Output in YAML format**
```bash
wp authguard show_logs --format=yaml
```

**Combine limit and format**
```bash
wp authguard show_logs --limit=25 --format=json
```

#### Exporting Data

**Export logs to JSON file**
```bash
wp authguard show_logs --limit=100 --format=json > logs.json
```

**Export logs to CSV file**
```bash
wp authguard show_logs --limit=500 --format=csv > logs.csv
```

## Login Redirects Commands

### seed_login_redirects

Seed login redirects table with sample data for testing.

#### Usage

```bash
wp authguard seed_login_redirects [--count=<number>]
```

#### Parameters

- `--count=<number>` - Number of redirect entries to create (default: 10)

#### Examples

**Create 10 login redirect entries (default)**
```bash
wp authguard seed_login_redirects
```

**Create 50 login redirect entries**
```bash
wp authguard seed_login_redirects --count=50
```

**Create 100 login redirect entries**
```bash
wp authguard seed_login_redirects --count=100
```

#### Output

The command displays:
- Progress bar during insertion
- Count of successfully inserted redirects
- Count of failed redirects (if any)
- Sample of inserted redirects with ID, user_id, type, value, redirect_to, status, and created_at

#### Data Structure

Each redirect entry contains:
- `user_id` - ID of the user who created the rule
- `type` - Either 'user' or 'role'
- `value` - User ID (e.g., '1', '2', '3') or role slug (e.g., 'administrator', 'subscriber')
- `redirect_to` - Full URL to redirect to
- `status` - Either 'active' or 'inactive'

### clear_login_redirects

Clear all login redirects from the database table.

#### Usage

```bash
wp authguard clear_login_redirects [--yes]
```

#### Parameters

- `--yes` - Skip confirmation prompt

#### Examples

**Clear login redirects with confirmation**
```bash
wp authguard clear_login_redirects
```
This will prompt:
```
Are you sure you want to delete 50 login redirect entries? [y/n]
```

**Clear login redirects without confirmation**
```bash
wp authguard clear_login_redirects --yes
```

#### Notes

- This operation is **irreversible**
- All data will be deleted permanently
- Consider backing up your database before running

### show_login_redirects

Display recent login redirects from the database.

#### Usage

```bash
wp authguard show_login_redirects [--limit=<number>] [--format=<format>]
```

#### Parameters

- `--limit=<number>` - Number of redirects to display (default: 10)
- `--format=<format>` - Output format: table, csv, json, yaml (default: table)

#### Examples

**Show 10 recent login redirects**
```bash
wp authguard show_login_redirects
```

**Show 20 recent login redirects**
```bash
wp authguard show_login_redirects --limit=20
```

**Show 50 recent login redirects**
```bash
wp authguard show_login_redirects --limit=50
```

**Output in JSON format**
```bash
wp authguard show_login_redirects --format=json
```

**Output in CSV format**
```bash
wp authguard show_login_redirects --format=csv
```

**Output in YAML format**
```bash
wp authguard show_login_redirects --format=yaml
```

**Combine limit and format**
```bash
wp authguard show_login_redirects --limit=25 --format=json
```

#### Exporting Data

**Export login redirects to JSON file**
```bash
wp authguard show_login_redirects --limit=100 --format=json > redirects.json
```

**Export login redirects to CSV file**
```bash
wp authguard show_login_redirects --limit=500 --format=csv > redirects.csv
```

#### Table Schema

The `authguard_login_redirects` table has the following structure:

| Column      | Type      | Description                                                  |
|------------|-----------|-------------------------------------------------------------|
| ID         | bigint    | Auto-increment primary key                                     |
| user_id    | bigint    | ID of the user who created the rule                            |
| type       | varchar   | Type of redirect: 'user' or 'role'                           |
| value      | varchar   | User ID (e.g., '1', '2', '3') or role slug (e.g., 'administrator', 'subscriber') |
| redirect_to| varchar   | Full URL to redirect to (e.g., 'https://example.com/dashboard') |
| status     | varchar   | Status of redirect: 'active' or 'inactive'                     |
| created_at | datetime  | Timestamp when the rule was created                             |
| updated_at | datetime  | Timestamp when the rule was last updated                        |

#### Type and Value Combinations

**User-based redirects:**
- `type`: 'user'
- `value`: User ID (e.g., '1', '2', '3')
- Example: When user with ID 5 logs in, redirect them to their dashboard

**Role-based redirects:**
- `type`: 'role'
- `value`: Role slug (e.g., 'administrator', 'editor', 'author', 'subscriber', 'contributor')
- Example: When user with 'editor' role logs in, redirect them to admin area

## 2FA Logs Commands

### seed_2fa_logs

Seed 2FA logs table with sample data for testing two-factor authentication functionality.

#### Usage

```bash
wp authguard seed_2fa_logs [--count=<number>] [--days=<number>]
```

#### Parameters

- `--count=<number>` - Number of 2FA log entries to create (default: 10)
- `--days=<number>` - Number of days back to create logs for (default: 7)

#### Examples

**Create 10 2FA log entries for the last 7 days (default)**
```bash
wp authguard seed_2fa_logs
```

**Create 50 2FA log entries**
```bash
wp authguard seed_2fa_logs --count=50
```

**Create 100 2FA log entries for the last 30 days**
```bash
wp authguard seed_2fa_logs --count=100 --days=30
```

**Create 200 2FA log entries for the last 90 days**
```bash
wp authguard seed_2fa_logs --count=200 --days=90
```

#### Output

The command displays:
- Progress bar during insertion
- Count of successfully inserted 2FA logs
- Count of failed entries (if any)
- Sample of inserted 2FA logs with ID, user_id, method, status, ip_address, and created_at

#### Data Structure

Each 2FA log entry contains:
- `user_id` - ID of the user who attempted 2FA
- `method` - 2FA method used: 'email', 'sms', 'whatsapp', 'totp', 'hotp', or 'backup_code'
- `status` - Status of the 2FA attempt: 'sent', 'verified', 'failed', or 'expired'
- `code_hash` - Hashed version of the verification code (32-character string)
- `expires_at` - Timestamp when the code expires (for sent/failed/expired status)
- `verified_at` - Timestamp when the code was successfully verified (null for non-verified status)
- `ip_address` - IP address from which the 2FA attempt was made
- `user_agent` - User agent string of the browser/device used
- `attempts` - Number of verification attempts made (higher for failed status)
- `created_at` - Timestamp when the 2FA log entry was created

#### Status Scenarios

The seeding generates realistic scenarios:
- **Sent**: Code sent but not yet verified
- **Verified**: Code successfully entered and verified
- **Failed**: Incorrect code entered (may have multiple attempts)
- **Expired**: Code not verified within expiration time

### clear_2fa_logs

Clear all 2FA logs from database table.

#### Usage

```bash
wp authguard clear_2fa_logs [--yes]
```

#### Parameters

- `--yes` - Skip confirmation prompt

#### Examples

**Clear 2FA logs with confirmation**
```bash
wp authguard clear_2fa_logs
```
This will prompt:
```
Are you sure you want to delete 150 2FA log entries? [y/n]
```

**Clear 2FA logs without confirmation**
```bash
wp authguard clear_2fa_logs --yes
```

#### Notes

- This operation is **irreversible**
- All 2FA authentication history will be deleted permanently
- Consider backing up your database before running

### show_2fa_logs

Display recent 2FA logs from database with optional filtering.

#### Usage

```bash
wp authguard show_2fa_logs [--limit=<number>] [--format=<format>] [--status=<status>]
```

#### Parameters

- `--limit=<number>` - Number of 2FA logs to display (default: 10)
- `--format=<format>` - Output format: table, csv, json, yaml (default: table)
- `--status=<status>` - Filter by status: 'sent', 'verified', 'failed', or 'expired'

#### Examples

**Show 10 recent 2FA logs**
```bash
wp authguard show_2fa_logs
```

**Show 20 recent 2FA logs**
```bash
wp authguard show_2fa_logs --limit=20
```

**Show 50 recent 2FA logs**
```bash
wp authguard show_2fa_logs --limit=50
```

**Show only verified logs**
```bash
wp authguard show_2fa_logs --status=verified
```

**Show only failed logs**
```bash
wp authguard show_2fa_logs --status=failed
```

**Show only expired logs**
```bash
wp authguard show_2fa_logs --status=expired
```

**Output in JSON format**
```bash
wp authguard show_2fa_logs --format=json
```

**Output in CSV format**
```bash
wp authguard show_2fa_logs --format=csv
```

**Output in YAML format**
```bash
wp authguard show_2fa_logs --format=yaml
```

**Combine limit and status filter**
```bash
wp authguard show_2fa_logs --limit=25 --status=verified
```

**Combine all parameters**
```bash
wp authguard show_2fa_logs --limit=50 --status=failed --format=json
```

#### Exporting Data

**Export 2FA logs to JSON file**
```bash
wp authguard show_2fa_logs --limit=100 --format=json > 2fa-logs.json
```

**Export 2FA logs to CSV file**
```bash
wp authguard show_2fa_logs --limit=500 --format=csv > 2fa-logs.csv
```

**Export failed authentication attempts**
```bash
wp authguard show_2fa_logs --status=failed --format=json > failed-2fa-attempts.json
```

#### Table Schema

The `authguard_2fa_logs` table has the following structure:

| Column      | Type      | Description                                                  |
|------------|-----------|-------------------------------------------------------------|
| ID         | bigint    | Auto-increment primary key                                     |
| user_id    | bigint    | ID of the user who attempted 2FA                               |
| method     | enum      | 2FA method: 'email', 'sms', 'whatsapp', 'totp', 'hotp', 'backup_code' |
| status     | enum      | Status: 'sent', 'verified', 'failed', 'expired'                |
| code_hash  | varchar   | Hashed verification code (32 characters)                        |
| expires_at | datetime  | Timestamp when code expires                                    |
| verified_at | datetime  | Timestamp when code was verified (null for non-verified)          |
| ip_address | varchar   | IP address of the attempt                                    |
| user_agent | text      | User agent string of the browser/device                         |
| attempts   | tinyint   | Number of verification attempts                                |
| created_at | datetime  | Timestamp when the log entry was created                       |
| updated_at | datetime  | Timestamp when the log entry was last updated                   |

#### Method Types

- **Email**: OTP sent via email
- **SMS**: OTP sent via SMS message
- **WhatsApp**: OTP sent via WhatsApp
- **TOTP**: Time-based One-Time Password (Google Authenticator, etc.)
- **HOTP**: HMAC-based One-Time Password
- **Backup Code**: Recovery/backup code used

#### Status Flow

```
sent → verified (successful)
  ↓
  → expired (not verified in time)
  ↓
  → failed (incorrect code entered)
```

## Common Workflows

### Workflow 1: Fresh Test Environment

Set up a test environment with sample data:

```bash
# Step 1: Clear existing logs
wp authguard clear_logs --yes

# Step 2: Add 100 new test logs
wp authguard seed_logs --count=100

# Step 3: View the first 10 logs
wp authguard show_logs --limit=10

# Step 4: Export logs to JSON file
wp authguard show_logs --limit=100 --format=json > logs.json
```

### Workflow 2: Login Redirects Setup

Set up login redirects for testing:

```bash
# Clear existing redirects
wp authguard clear_login_redirects --yes

# Seed 50 test redirects
wp authguard seed_login_redirects --count=50

# Review the redirects
wp authguard show_login_redirects --limit=20

# Export to JSON for backup
wp authguard show_login_redirects --limit=50 --format=json > redirects-backup.json
```

### Workflow 3: Complete Data Reset

Reset both logs and login redirects:

```bash
# Clear all logs
wp authguard clear_logs --yes

# Clear all login redirects
wp authguard clear_login_redirects --yes

# Reseed logs
wp authguard seed_logs --count=100

# Reseed login redirects
wp authguard seed_login_redirects --count=50

# Verify data
wp authguard show_logs --limit=10
wp authguard show_login_redirects --limit=10
```

### Workflow 4: Data Analysis

Export and analyze data:

```bash
# Export all logs to CSV
wp authguard show_logs --limit=1000 --format=csv > logs_analysis.csv

# Export all redirects to JSON
wp authguard show_login_redirects --limit=500 --format=json > redirects_analysis.json

# Get summary counts
wp authguard show_logs --format=json | jq 'length'
wp authguard show_login_redirects --format=json | jq 'length'
```

### Workflow 5: 2FA Authentication Testing

Test two-factor authentication with realistic scenarios:

```bash
# Clear existing 2FA logs
wp authguard clear_2fa_logs --yes

# Seed 200 2FA logs for the last 30 days
wp authguard seed_2fa_logs --count=200 --days=30

# View recent 2FA activity
wp authguard show_2fa_logs --limit=20

# Check only failed attempts for security analysis
wp authguard show_2fa_logs --status=failed --limit=50

# Export all 2FA logs for the last 7 days
wp authguard show_2fa_logs --limit=100 --format=json > 2fa-logs-30days.json

# Analyze verification rate
# Count verified vs total
verified_count=$(wp authguard show_2fa_logs --status=verified --format=json | jq 'length')
total_count=$(wp authguard show_2fa_logs --format=json | jq 'length')
echo "Verification rate: $verified_count / $total_count"
```

### Workflow 6: Complete Reset

Reset all tables including 2FA logs:

```bash
# Clear all logs
wp authguard clear_logs --yes

# Clear all login redirects
wp authguard clear_login_redirects --yes

# Clear all 2FA logs
wp authguard clear_2fa_logs --yes

# Reseed logs
wp authguard seed_logs --count=100

# Reseed login redirects
wp authguard seed_login_redirects --count=50

# Reseed 2FA logs for last 30 days
wp authguard seed_2fa_logs --count=200 --days=30

# Verify all data
wp authguard show_logs --limit=10
wp authguard show_login_redirects --limit=10
wp authguard show_2fa_logs --limit=10
```

## Tips and Best Practices

### Performance Tips

1. **Use appropriate counts** - Don't seed too many entries at once:
   ```bash
   # Good: 100-500 entries
   wp authguard seed_logs --count=100

   # Bad: 10000+ entries (may timeout)
   wp authguard seed_logs --count=10000
   ```

2. **Export in batches** - When exporting large datasets:
   ```bash
   # Export in chunks of 1000
   wp authguard show_logs --limit=1000 --format=json > logs-1.json
   ```

3. **Use --yes flag** - For automation scripts, use `--yes` to skip prompts:
    ```bash
    wp authguard clear_logs --yes
    wp authguard clear_2fa_logs --yes
    ```

### Data Management

1. **Backup before clearing** - Always backup your database:
   ```bash
   wp db export backup-before-clear.sql
   wp authguard clear_logs --yes
   ```

2. **Use version control** - Track exported data files:
   ```bash
   git add logs.json redirects.json
   git commit -m "Add test data exports"
   ```

3. **Regular cleanup** - Schedule regular cleanup in cron:
    ```bash
    # Add to crontab - clean logs daily
    0 3 * * * wp authguard clear_logs --yes

    # Clean 2FA logs weekly (keep 30 days of data)
    0 2 * * 0 wp authguard clear_2fa_logs --yes && wp authguard seed_2fa_logs --days=30
    ```

### Testing Best Practices

1. **Start small** - Begin with small datasets:
   ```bash
   wp authguard seed_logs --count=10
   ```

2. **Verify data** - Check data after seeding:
   ```bash
   wp authguard show_logs --limit=5
   ```

3. **Use different formats** - Test with various output formats:
    ```bash
    wp authguard show_logs --format=json
    wp authguard show_logs --format=csv
    ```

### 2FA Testing Best Practices

1. **Test different scenarios** - Simulate various 2FA scenarios:
    ```bash
    # Test with different time periods
    wp authguard seed_2fa_logs --count=100 --days=7
    wp authguard seed_2fa_logs --count=100 --days=30
    wp authguard seed_2fa_logs --count=100 --days=90

    # Verify different status types
    wp authguard show_2fa_logs --status=verified
    wp authguard show_2fa_logs --status=failed
    wp authguard show_2fa_logs --status=expired
    ```

2. **Monitor authentication patterns** - Track 2FA usage:
    ```bash
    # Export and analyze 2FA methods used
    wp authguard show_2fa_logs --format=json > 2fa-stats.json

    # Count by method using jq
    wp authguard show_2fa_logs --format=json | jq 'group_by(.method) | map({method: .[0].method, count: length})'
    ```

3. **Security audit** - Regularly check failed attempts:
    ```bash
    # Get recent failed 2FA attempts
    wp authguard show_2fa_logs --status=failed --limit=100

    # Export for security analysis
    wp authguard show_2fa_logs --status=failed --format=json > security-audit.json
    ```

### Security Considerations

1. **Limit access** - Only allow trusted users to run these commands
2. **Use non-production environments** - Test in staging first
3. **Monitor usage** - Check command history:
   ```bash
   history | grep "wp authguard"
   ```

### Troubleshooting

**Command not found:**
```bash
# Verify WP-CLI is installed
wp --version

# Verify plugin is active
wp plugin list | grep authguard
```

**Table does not exist:**
```bash
# Reactivate the plugin to create tables
wp plugin deactivate authguard
wp plugin activate authguard
```

**Permission denied:**
```bash
# Run with sudo if necessary (not recommended)
sudo wp authguard seed_logs

# Better: Fix file permissions
chmod +x wp-cli.phar
```

**Database connection error:**
```bash
# Check database credentials
wp db check

# Verify database exists
wp db info
```

**2FA logs table not created:**
```bash
# Verify 2FA table exists
wp db query "SHOW TABLES LIKE 'wp_authguard_2fa_logs'"

# If not exists, reactivate plugin
wp plugin deactivate authguard
wp plugin activate authguard

# Or manually run the activation function
wp eval 'MosPress\Authpress\Core\Activator::activate();'
```

**Empty 2FA logs after seeding:**
```bash
# Check if data was inserted
wp db query "SELECT COUNT(*) FROM wp_authguard_2fa_logs"

# Check for errors in seeding
wp authguard seed_2fa_logs --count=1 --debug

# Verify user IDs exist (1-10 by default)
wp user list --fields=ID,user_login
```

## Getting Help

If you encounter issues:

1. Check WP-CLI documentation: https://wp-cli.org/
2. Review AuthGuard plugin documentation
3. Check WordPress debug logs:
   ```bash
   wp debug
   ```

## Version Information

To check your WP-CLI and AuthGuard versions:

```bash
wp --version
wp plugin list | grep authguard
```
