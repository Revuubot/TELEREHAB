import { Line } from 'react-chartjs-2';
import { auth } from '../auth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportCard({ report, onApprove }) {
  const errors = JSON.parse(report.errors || '[]');
  const repRoms = JSON.parse(report.rep_roms || '[]');
  
  const chartData = {
    labels: repRoms.map((_, i) => `Frame ${i + 1}`),
    datasets: [
      {
        label: 'Range of Motion',
        data: repRoms,
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Range of Motion Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Angle (degrees)',
        },
      },
    },
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="text-center mb-4">
        <div className="text-sm font-medium text-red-600 mb-2">
          AI-ASSISTIVE: For clinician review only — not a diagnosis.
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-lg font-medium">Exercise Stats</h3>
          <div className="mt-2 space-y-2">
            <p>Repetitions: {report.reps_counted}</p>
            <p>Average ROM: {report.avg_rom.toFixed(1)}°</p>
            <p>Score: {report.score.toFixed(1)}/100</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">Issues Detected</h3>
          <div className="mt-2">
            {errors.length === 0 ? (
              <p className="text-green-600">No issues detected</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, i) => (
                  <li key={i} className="text-red-600">
                    Rep {error.rep}: {error.type}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      {auth.isClinicianRole() && !report.clinician_approved && (
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => onApprove(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve Report
          </button>
          <button
            onClick={() => onApprove(false)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Request Review
          </button>
        </div>
      )}
      
      {report.clinician_approved !== null && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h4 className="font-medium mb-2">Clinician Review</h4>
          <p>
            Status:{' '}
            <span className={report.clinician_approved ? 'text-green-600' : 'text-red-600'}>
              {report.clinician_approved ? 'Approved' : 'Review Requested'}
            </span>
          </p>
          {report.clinician_notes && (
            <p className="mt-2">Notes: {report.clinician_notes}</p>
          )}
        </div>
      )}
    </div>
  );
}