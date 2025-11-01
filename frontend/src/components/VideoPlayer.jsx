export default function VideoPlayer({ videoPath }) {
  return (
    <div className="aspect-w-16 aspect-h-9">
      <video
        className="w-full"
        controls
        src={`http://localhost:8000${videoPath}`}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}