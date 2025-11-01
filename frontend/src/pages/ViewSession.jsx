import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { auth } from '../auth';
import VideoPlayer from '../components/VideoPlayer';
import ReportCard from '../components/ReportCard';

export default function ViewSession() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      const sessionData = await api.getSession(auth.getToken(), id);
      setSession(sessionData);

      if (sessionData.report_ready) {
        const reportData = await api.getReport(auth.getToken(), id);
        setReport(reportData);
      }
    } catch (err) {
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approved) => {
    if (approving) return;
    
    setApproving(true);
    try {
      const notes = approved ? 'Exercise performed correctly' : 'Please review technique';
      const updatedReport = await api.approveReport(
        auth.getToken(),
        report.id,
        approved,
        notes
      );
      setReport(updatedReport);
    } catch (err) {
      setError('Failed to update approval status');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!session) {
    return <div>Session not found</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Session Review</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Exercise Video</h3>
          <VideoPlayer videoPath={session.video_path} />
          
          <div className="mt-4 bg-white p-4 rounded shadow">
            <h4 className="font-medium">Session Details</h4>
            <p className="text-gray-600">
              Recorded: {new Date(session.created_at).toLocaleString()}
            </p>
            <p className="text-gray-600">
              Status: {session.report_ready ? 'Analysis Complete' : 'Processing'}
            </p>
          </div>
        </div>

        <div>
          {session.report_ready && report ? (
            <div>
              <h3 className="text-lg font-medium mb-4">Exercise Analysis</h3>
              <ReportCard report={report} onApprove={handleApprove} />
            </div>
          ) : (
            <div className="bg-white p-6 rounded shadow">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 mb-4">
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-lg font-medium">Analyzing Exercise</p>
                <p className="text-gray-500 mt-2">Please wait while we process your session...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}