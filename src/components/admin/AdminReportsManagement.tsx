import React, { useState } from 'react';
import { ReportItem } from '../../types';

interface AdminReportsManagementProps {
  reports: ReportItem[];
  onResolveReport: (reportId: string, action: 'desestimar' | 'sancionar' | 'ocultar_contenido' | 'marcar_revisado', notes: string) => void;
}

export const AdminReportsManagement: React.FC<AdminReportsManagementProps> = ({
  reports,
  onResolveReport,
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'desestimar' | 'sancionar' | 'ocultar_contenido' | 'marcar_revisado'>('marcar_revisado');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const pendingReports = reports.filter((r) => r.status === 'pendiente');
  const resolvedReports = reports.filter((r) => r.status !== 'pendiente');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline font-bold text-xl text-[#012d1d] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#934b00]">report_problem</span>
            <span>Centro de Reportes y Moderación Comunitaria</span>
          </h2>
          <p className="text-xs text-[#717973]">
            Revisión de infracciones reportadas por miembros de la plataforma sobre prendas y conductas.
          </p>
        </div>

        <span className="text-xs font-bold text-[#934b00] bg-[#ffdcc1] px-3 py-1.5 rounded-xl">
          {pendingReports.length} reportes pendientes
        </span>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <h3 className="font-headline font-bold text-base text-[#012d1d]">
          Reportes Pendientes de Acción
        </h3>

        {pendingReports.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#c1c8c2]/50">
            <span className="material-symbols-outlined text-4xl text-[#2b694d] mb-2">
              check_circle
            </span>
            <p className="text-xs text-[#717973]">No hay denuncias pendientes de revisión.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReports.map((r) => (
              <div key={r.id} className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#ffdcc1] text-[#934b00]">
                      {r.reportedType}
                    </span>
                    <h4 className="font-headline font-bold text-sm text-[#012d1d] mt-1">
                      {r.reportedTitle}
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#717973]">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-xs bg-[#faf9f4] p-3 rounded-2xl border border-[#efeee9] space-y-1">
                  <p><span className="font-bold text-[#012d1d]">Reportado a:</span> {r.reportedUser}</p>
                  <p><span className="font-bold text-[#012d1d]">Reportado por:</span> {r.reportedBy} ({r.reporterRole})</p>
                  <p><span className="font-bold text-[#934b00]">Motivo:</span> {r.reason}</p>
                  {r.details && <p className="text-[#717973] text-[11px] pt-1">{r.details}</p>}
                </div>

                {r.reportedImageUrl && (
                  <img src={r.reportedImageUrl} alt="Evidencia" className="h-32 w-full object-cover rounded-xl bg-[#efeee9]" />
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedReport(r);
                      setResolutionNotes('');
                      setResolutionAction('marcar_revisado');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332]"
                  >
                    Resolver Reporte
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Reports */}
      {resolvedReports.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs space-y-4">
          <h3 className="font-headline font-bold text-base text-[#012d1d]">
            Reportes Resueltos Recientemente
          </h3>
          <div className="divide-y divide-[#efeee9]">
            {resolvedReports.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#012d1d]">{r.reportedTitle}</p>
                  <p className="text-[#717973] text-[11px]">Resolución: {r.resolutionNotes || 'Atendido conforme a directrices'}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#b0f1cc] text-[#002113]">
                  {r.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#c1c8c2]/50 shadow-2xl">
            <h3 className="font-headline font-bold text-lg text-[#012d1d]">
              Dictamen de Moderación
            </h3>
            <p className="text-xs text-[#717973]">
              Reporte sobre: <strong>{selectedReport.reportedTitle}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Acción Resolutiva</label>
                <select
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none"
                >
                  <option value="marcar_revisado">Marcar como Revisado (Sin falta grave)</option>
                  <option value="ocultar_contenido">Ocultar / Despublicar Contenido</option>
                  <option value="sancionar">Emitir Sanción al Usuario</option>
                  <option value="desestimar">Desestimar Reporte (Reporte infundado)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Notas de Resolución</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detalla las medidas adoptadas para el registro de auditoría..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#efeee9]">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#717973] hover:bg-[#efeee9]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onResolveReport(selectedReport.id, resolutionAction, resolutionNotes);
                  setSelectedReport(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#012d1d] text-white hover:bg-[#1b4332]"
              >
                Guardar Dictamen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
