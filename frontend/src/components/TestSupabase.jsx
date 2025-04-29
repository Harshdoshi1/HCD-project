import { useState, useEffect } from 'react';
import supabase from '../config/supabase';

const TestSupabase = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Try to fetch data from your Students table
        const { data, error } = await supabase
          .from('Students')
          .select('*')
          .limit(5);

        if (error) {
          throw error;
        }

        setData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Supabase Connection Test</h2>
      {data && data.length > 0 ? (
        <div>
          <h3>Successfully connected to Supabase!</h3>
          <p>Found {data.length} records in Students table:</p>
          <ul>
            {data.map((student) => (
              <li key={student.id}>
                {student.name} - {student.roll_number}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No data found in Students table</p>
      )}
    </div>
  );
};

export default TestSupabase; 