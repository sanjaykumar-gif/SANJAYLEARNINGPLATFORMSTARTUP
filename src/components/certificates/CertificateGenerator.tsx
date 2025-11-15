import { useEffect, useRef } from 'react';
import { Award, Download } from 'lucide-react';

interface CertificateGeneratorProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  instructorName: string;
  onGenerate: (certificateDataUrl: string) => void;
}

export function CertificateGenerator({
  studentName,
  courseName,
  completionDate,
  instructorName,
  onGenerate,
}: CertificateGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateCertificate();
  }, [studentName, courseName, completionDate, instructorName]);

  const generateCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 850;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 20;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 5;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    ctx.fillStyle = '#1E40AF';
    ctx.font = 'bold 60px serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 180);

    ctx.fillStyle = '#6B7280';
    ctx.font = '24px sans-serif';
    ctx.fillText('This is to certify that', canvas.width / 2, 280);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 48px serif';
    ctx.fillText(studentName, canvas.width / 2, 360);

    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 380);
    ctx.lineTo(900, 380);
    ctx.stroke();

    ctx.fillStyle = '#6B7280';
    ctx.font = '24px sans-serif';
    ctx.fillText('has successfully completed the course', canvas.width / 2, 450);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(courseName, canvas.width / 2, 520);

    const date = new Date(completionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    ctx.fillStyle = '#6B7280';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Completion Date: ${date}`, canvas.width / 2, 600);

    ctx.fillStyle = '#111827';
    ctx.font = 'italic 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText(instructorName, canvas.width / 2, 720);

    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 150, 740);
    ctx.lineTo(canvas.width / 2 + 150, 740);
    ctx.stroke();

    ctx.fillStyle = '#6B7280';
    ctx.font = '18px sans-serif';
    ctx.fillText('Instructor', canvas.width / 2, 770);

    const dataUrl = canvas.toDataURL('image/png');
    onGenerate(dataUrl);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `certificate-${courseName.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Your Certificate</h2>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download
        </button>
      </div>

      <div className="border-4 border-gray-200 rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-auto" />
      </div>

      <p className="text-center text-gray-600 mt-4">
        Congratulations on completing the course! Share your achievement with others.
      </p>
    </div>
  );
}
