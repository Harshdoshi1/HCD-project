import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'https://fqibilumwjasewfxcdwh.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaWJpbHVtd2phc2V3ZnhjZHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Njc2NDQsImV4cCI6MjA2MDU0MzY0NH0.-XTukCqtDulFmkdHp-P1wbx_zO8YMB5LDTJvKojAarQ',
  );
  
  runApp(const MyApp());
}

final supabase = Supabase.instance.client;

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HCD Project',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  List<Map<String, dynamic>> _students = [];
  List<Map<String, dynamic>> _batches = [];
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      // Load students
      final studentsResponse = await supabase
          .from('Students')
          .select('id, name, email, enrollmentNumber, batchId, currentsemester')
          .order('name');

      // Load batches
      final batchesResponse = await supabase
          .from('Batches')
          .select('id, batchName, courseType, currentSemester')
          .order('batchName');

      if (studentsResponse.error != null) {
        throw studentsResponse.error!;
      }

      if (batchesResponse.error != null) {
        throw batchesResponse.error!;
      }

      setState(() {
        _students = List<Map<String, dynamic>>.from(studentsResponse.data);
        _batches = List<Map<String, dynamic>>.from(batchesResponse.data);
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Error loading data: ${e.toString()}';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('HCD Project'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Students'),
              Tab(text: 'Batches'),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _loadData,
            ),
          ],
        ),
        body: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error.isNotEmpty
                ? Center(child: Text(_error, style: const TextStyle(color: Colors.red)))
                : TabBarView(
                    children: [
                      _buildStudentsTab(),
                      _buildBatchesTab(),
                    ],
                  ),
      ),
    );
  }

  Widget _buildStudentsTab() {
    return _students.isEmpty
        ? const Center(child: Text('No students found'))
        : ListView.builder(
            itemCount: _students.length,
            itemBuilder: (context, index) {
              final student = _students[index];
              return ListTile(
                title: Text(student['name'] ?? 'Unknown'),
                subtitle: Text(student['enrollmentNumber'] ?? 'Unknown'),
                trailing: Text('Semester: ${student['currentsemester']}'),
                onTap: () => _showStudentDetails(student),
              );
            },
          );
  }

  Widget _buildBatchesTab() {
    return _batches.isEmpty
        ? const Center(child: Text('No batches found'))
        : ListView.builder(
            itemCount: _batches.length,
            itemBuilder: (context, index) {
              final batch = _batches[index];
              return ListTile(
                title: Text(batch['batchName'] ?? 'Unknown'),
                subtitle: Text('Type: ${batch['courseType'] ?? 'Unknown'}'),
                trailing: Text('Current Semester: ${batch['currentSemester']}'),
                onTap: () => _showBatchStudents(batch),
              );
            },
          );
  }

  Future<void> _showStudentDetails(Map<String, dynamic> student) async {
    // Get student marks
    final marksResponse = await supabase
        .from('Gettedmarks')
        .select('subjectId, ese, cse, ia, tw, viva')
        .eq('studentId', student['id']);

    if (marksResponse.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading marks: ${marksResponse.error!.message}')),
      );
      return;
    }

    final marks = List<Map<String, dynamic>>.from(marksResponse.data);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(student['name']),
        content: SizedBox(
          width: double.maxFinite,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Enrollment: ${student['enrollmentNumber']}'),
              Text('Email: ${student['email']}'),
              Text('Current Semester: ${student['currentsemester']}'),
              const SizedBox(height: 16),
              const Text('Marks:', style: TextStyle(fontWeight: FontWeight.bold)),
              marks.isEmpty
                  ? const Text('No marks available')
                  : SizedBox(
                      height: 200,
                      child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: marks.length,
                        itemBuilder: (context, index) {
                          final mark = marks[index];
                          return Card(
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Subject: ${mark['subjectId']}'),
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                                    children: [
                                      _buildMarkItem('ESE', mark['ese']),
                                      _buildMarkItem('CSE', mark['cse']),
                                      _buildMarkItem('IA', mark['ia']),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                                    children: [
                                      _buildMarkItem('TW', mark['tw']),
                                      _buildMarkItem('VIVA', mark['viva']),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildMarkItem(String label, dynamic value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
        Text(value?.toString() ?? '0'),
      ],
    );
  }

  Future<void> _showBatchStudents(Map<String, dynamic> batch) async {
    // Get students in this batch
    final batchStudentsResponse = await supabase
        .from('Students')
        .select('id, name, enrollmentNumber')
        .eq('batchId', batch['id'])
        .order('name');

    if (batchStudentsResponse.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading batch students: ${batchStudentsResponse.error!.message}')),
      );
      return;
    }

    final batchStudents = List<Map<String, dynamic>>.from(batchStudentsResponse.data);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${batch['batchName']} Students'),
        content: SizedBox(
          width: double.maxFinite,
          height: 300,
          child: batchStudents.isEmpty
              ? const Center(child: Text('No students in this batch'))
              : ListView.builder(
                  itemCount: batchStudents.length,
                  itemBuilder: (context, index) {
                    final student = batchStudents[index];
                    return ListTile(
                      title: Text(student['name']),
                      subtitle: Text(student['enrollmentNumber']),
                      onTap: () {
                        Navigator.of(context).pop();
                        // Find the full student data
                        final fullStudent = _students.firstWhere(
                          (s) => s['id'] == student['id'],
                          orElse: () => student,
                        );
                        _showStudentDetails(fullStudent);
                      },
                    );
                  },
                ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}
