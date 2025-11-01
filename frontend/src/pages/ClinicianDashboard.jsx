import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { auth } from '../auth';

export default function ClinicianDashboard() {
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
      <h2 className="text-2xl font-bold mb-6">Clinician Dashboard</h2>

      <div className="bg-white shadow rounded-lg divide-y">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">
                  Exercise: {prescription.exercise_type}
                </h3>
                <p className="text-gray-600">
                  Patient ID: {prescription.patient_id}
                </p>
                <p className="text-gray-600">
                  {prescription.frequency}x per week, {prescription.sets} sets, {prescription.reps_per_set} reps
                </p>
                <p className="text-sm text-gray-500">
                  Prescribed on: {new Date(prescription.created_at).toLocaleDateString()}
                </p>
              </div>

              <Link
                to={`/session/${prescription.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Sessions
              </Link>
            </div>

            {prescription.sessions?.map((session) => (
              <div key={session.id} className="mt-4 p-4 bg-gray-50 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      Session on {new Date(session.created_at).toLocaleString()}
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