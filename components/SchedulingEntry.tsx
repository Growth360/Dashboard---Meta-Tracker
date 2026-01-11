import React, { useState, useEffect } from 'react';
import { Save, Calendar, Phone, Users, UserX, CheckCircle, DollarSign, Briefcase, ShoppingBag, Award } from 'lucide-react';
import { DailyPerformance } from '../types';

interface SchedulingEntryProps {
  onSave: (date: string, data: Partial<DailyPerformance>) => void;
  existingData: DailyPerformance[];
}

export const SchedulingEntry: React.FC<SchedulingEntryProps> = ({ onSave, existingData }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Form State
  const [formData, setFormData] = useState({
    agendasAut: 0,
    agendasSet: 0,
    agCualificado: 0,
    llamadas: 0,
    asistencias: 0,
    cancelaciones: 0,
    cierres: 0,
    ventas: 0,
    facturado: 0
  });

  // Load existing data when date changes
  useEffect(() => {
    const dayData = existingData.find(d => d.date === selectedDate);
    if (dayData) {
      setFormData({
        agendasAut: dayData.agendasAut || 0,
        agendasSet: dayData.agendasSet || 0,
        agCualificado: dayData.agCualificado || 0,
        llamadas: dayData.llamadas || 0,
        asistencias: dayData.asistencias || 0,
        cancelaciones: dayData.cancelaciones || 0,
        cierres: dayData.cierres || 0,
        ventas: dayData.ventas || 0,
        facturado: dayData.facturado || dayData.revenue || 0
      });
    } else {
      // Reset defaults if no data exists for that day
      setFormData({
        agendasAut: 0,
        agendasSet: 0,
        agCualificado: 0,
        llamadas: 0,
        asistencias: 0,
        cancelaciones: 0,
        cierres: 0,
        ventas: 0,
        facturado: 0
      });
    }
  }, [selectedDate, existingData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedDate, formData);
  };

  const InputField = ({ 
    label, 
    name, 
    value, 
    icon: Icon, 
    colorClass = "text-slate-500", 
    bgClass = "bg-slate-50",
    prefix = "" 
  }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
        <Icon size={14} className={colorClass} />
        {label}
      </label>
      <div className={`flex items-center border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all ${bgClass}`}>
        <span className="text-slate-400 font-medium mr-1">{prefix}</span>
        <input
          type="number"
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={(e) => e.target.select()}
          className={`w-full bg-transparent outline-none text-slate-800 font-semibold ${bgClass}`}
          min="0"
          step={name === 'facturado' ? '0.01' : '1'}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-indigo-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Registro Diario de Actividad</h2>
            <p className="text-sm text-slate-500 mt-1">Ingresa los métricas manuales de tu equipo de ventas y setters.</p>
          </div>
          
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-sm">
            <div className="px-3 text-slate-500 border-r border-slate-200">
              <Calendar size={18} />
            </div>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-700 text-sm font-medium focus:ring-0 border-none outline-none pl-3 pr-2 py-1.5 cursor-pointer"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Section 1: Agendamiento */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="p-1.5 bg-purple-100 text-purple-600 rounded">
                   <Briefcase size={16} />
                </div>
                <h3 className="font-bold text-slate-800">Agendamiento</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="Agendas Auto" 
                  name="agendasAut" 
                  value={formData.agendasAut} 
                  icon={CheckCircle} 
                  colorClass="text-purple-500"
                />
                <InputField 
                  label="Agendas Setter" 
                  name="agendasSet" 
                  value={formData.agendasSet} 
                  icon={Users} 
                  colorClass="text-purple-500"
                />
                <InputField 
                  label="Ag. Cualificadas" 
                  name="agCualificado" 
                  value={formData.agCualificado} 
                  icon={Award} 
                  colorClass="text-purple-600"
                />
              </div>
            </div>

            {/* Section 2: Gestión de Llamadas */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
                   <Phone size={16} />
                </div>
                <h3 className="font-bold text-slate-800">Gestión de Llamadas</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Llamadas" name="llamadas" value={formData.llamadas} icon={Phone} />
                <div className="hidden md:block"></div> {/* Spacer */}
                <InputField 
                  label="Asistencias" 
                  name="asistencias" 
                  value={formData.asistencias} 
                  icon={CheckCircle} 
                  colorClass="text-emerald-500"
                  bgClass="bg-emerald-50/30"
                />
                <InputField 
                  label="Cancelaciones" 
                  name="cancelaciones" 
                  value={formData.cancelaciones} 
                  icon={UserX} 
                  colorClass="text-red-500"
                  bgClass="bg-red-50/30"
                />
              </div>
            </div>

            {/* Section 3: Cierre y Ventas */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded">
                   <DollarSign size={16} />
                </div>
                <h3 className="font-bold text-slate-800">Cierre y Ventas</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <InputField 
                  label="Cierres" 
                  name="cierres" 
                  value={formData.cierres} 
                  icon={CheckCircle} 
                  colorClass="text-emerald-600"
                />
                <InputField 
                  label="Ventas (Cant.)" 
                  name="ventas" 
                  value={formData.ventas} 
                  icon={ShoppingBag} 
                  colorClass="text-emerald-600"
                />
              </div>
              
              <div className="pt-2">
                <InputField 
                  label="Facturado Total" 
                  name="facturado" 
                  value={formData.facturado} 
                  icon={DollarSign} 
                  colorClass="text-emerald-700" 
                  bgClass="bg-emerald-50 border-emerald-200"
                  prefix="$"
                />
              </div>
            </div>

            {/* Summary Preview */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-center">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Resumen Calculado</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Total Agendas:</span>
                  <span className="font-bold text-slate-900">{formData.agendasAut + formData.agendasSet}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Tasa Asistencia:</span>
                  <span className="font-bold text-slate-900">
                    {((formData.agendasAut + formData.agendasSet) > 0 
                      ? (formData.asistencias / (formData.agendasAut + formData.agendasSet) * 100) 
                      : 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Tasa Cierre:</span>
                  <span className="font-bold text-slate-900">
                    {(formData.asistencias > 0 
                      ? (formData.cierres / formData.asistencias * 100) 
                      : 0).toFixed(1)}%
                  </span>
                </div>
                 <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200 mt-2">
                  <span className="font-bold text-emerald-700">Beneficio Est.:</span>
                  <span className="font-bold text-emerald-700">
                    Calculado al guardar
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              type="submit" 
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transform active:scale-95 transition-all"
            >
              <Save size={18} />
              Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};