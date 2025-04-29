# Supabase Integration Guide

This document explains how to use the Supabase integration in your HCD project to sync data between your local MySQL database and Supabase, allowing you to access your data from a Flutter application.

## Overview

The integration consists of several components:

1. **Supabase Client Files** - Connection to your Supabase project
2. **Supabase Service** - Functions to sync data between MySQL and Supabase
3. **Sync Controller** - API endpoints to trigger synchronization
4. **Sync Middleware** - Automatic synchronization after data changes
5. **Sync Script** - Manual synchronization utility

## How to Use

### Initial Data Synchronization

To perform an initial full synchronization of all your data to Supabase:

```bash
node backend/sync.js
```

This will sync your local MySQL database and then push all the data to Supabase.

### API Endpoints for Synchronization

The following API endpoints are available for triggering synchronization:

- `POST /api/sync/all` - Sync all data
- `POST /api/sync/users` - Sync only users
- `POST /api/sync/batches` - Sync only batches
- `POST /api/sync/semesters` - Sync only semesters
- `POST /api/sync/faculties` - Sync only faculties
- `POST /api/sync/subjects` - Sync only subjects
- `POST /api/sync/unique-sub-degrees` - Sync only unique sub degrees
- `POST /api/sync/unique-sub-diplomas` - Sync only unique sub diplomas
- `POST /api/sync/assign-subjects` - Sync only assign subjects
- `POST /api/sync/component-weightages` - Sync only component weightages
- `POST /api/sync/component-marks` - Sync only component marks
- `POST /api/sync/students` - Sync only students
- `POST /api/sync/getted-marks` - Sync only getted marks
- `POST /api/sync/participation-types` - Sync only participation types

Example using curl:

```bash
curl -X POST http://localhost:5001/api/sync/all
```

### Automatic Synchronization

The system includes a middleware that can automatically sync data to Supabase whenever changes are made through your API. To use this middleware, you need to apply it to your routes.

For example, to apply it to user routes:

```javascript
const { syncAfterRequest } = require('./middleware/supabaseSync');

// Apply middleware to specific routes
router.post('/register', syncAfterRequest('users'), authController.registerUser);
```

## Flutter Integration

In your Flutter application, you can use the Supabase Flutter SDK to connect to your Supabase project:

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'https://fqibilumwjasewfxcdwh.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaWJpbHVtd2phc2V3ZnhjZHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Njc2NDQsImV4cCI6MjA2MDU0MzY0NH0.-XTukCqtDulFmkdHp-P1wbx_zO8YMB5LDTJvKojAarQ',
  );
  
  runApp(MyApp());
}

// Access Supabase client
final supabase = Supabase.instance.client;
```

Then you can query your data:

```dart
// Example: Get all students
final response = await supabase
  .from('Students')
  .select()
  .order('name');

if (response.error == null) {
  final students = response.data;
  // Use the students data
} else {
  // Handle error
}
```

## Troubleshooting

If you encounter issues with the synchronization:

1. Check your Supabase URL and API keys in both backend and frontend client files
2. Ensure your Supabase tables match the schema defined in your SQL
3. Check the console logs for detailed error messages during synchronization
4. Make sure your MySQL database is properly connected and accessible

## Security Considerations

- The backend uses the service role key which has full access to your database
- The frontend uses the anon key which has restricted access
- Make sure to set up proper Row Level Security (RLS) policies in Supabase to control access to your data

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Supabase Flutter SDK](https://supabase.io/docs/reference/dart/introduction)
