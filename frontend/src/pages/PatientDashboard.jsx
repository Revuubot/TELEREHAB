import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { auth } from '../auth';

export default function PatientDashboard() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const data = await api.getPrescriptions(auth.getToken());
      setPrescriptions(data);
    } catch (err) {
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Exercises</h2>
        <Link
          to="/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Record New Session
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg divide-y">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium">
                Exercise: {prescription.exercise_type}
              </h3>
              <p className="text-gray-600">
                {prescription.frequency}x per week
              </p>
              <p className="text-gray-600">
                {prescription.sets} sets of {prescription.reps_per_set} reps
              </p>
              <p className="text-sm text-gray-500">
                Prescribed on: {new Date(prescription.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Recent Sessions</h4>
              {prescription.sessions?.map((session) => (
                <div key={session.id} className="bg-gray-50 p-4 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {new Date(session.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Status: {session.report_ready ? 'Report Available' : 'Processing'}
                      </p>
                    </div>
                    {session.report_ready && (
                      <Link
                        to={`/session/${session.id}`}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        View Report
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              
              {(!prescription.sessions || prescription.sessions.length === 0) && (
                <p className="text-gray-500 text-center p-4">
                  No sessions recorded yet
                </p>
              )}
            </div>
          </div>
        ))}

        {prescriptions.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No prescriptions found
          </div>
        )}
      </div>
    </div>
  );
}