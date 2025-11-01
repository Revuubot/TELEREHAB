import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { auth } from '../auth';

export default function UploadSession() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const data = await api.getPrescriptions(auth.getToken());
      setPrescriptions(data);
      if (data.length > 0) {
        setSelectedPrescription(data[0].id.toString());
      }
    } catch (err) {
      setError('Failed to load prescriptions');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a valid video file');
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedPrescription) {
      setError('Please select a prescription and video file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const data = await api.uploadSession(
        auth.getToken(),
        parseInt(selectedPrescription),
        selectedFile
      );
      navigate(`/session/${data.id}`);
    } catch (err) {
      setError('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Record Exercise Session</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Prescription
          </label>
          <select
            value={selectedPrescription}
            onChange={(e) => setSelectedPrescription(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {prescriptions.map((prescription) => (
              <option key={prescription.id} value={prescription.id}>
                {prescription.exercise_type} - {prescription.sets} sets of {prescription.reps_per_set} reps
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload Video
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="mt-1 block w-full"
          />
          <p className="mt-1 text-sm text-gray-500">
            Please ensure you're visible in the frame and performing the exercise as prescribed
          </p>
        </div>

        <button
          type="submit"
          disabled={uploading || !selectedFile}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            (uploading || !selectedFile) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload Session'}
        </button>
      </form>
    </div>
  );
}