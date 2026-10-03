import React, { useRef, useState, useEffect } from 'react';
import { Tenant, Unit, Property } from '../types';
import { format } from 'date-fns';
import { FileCheck, Printer, Check, Eraser, X, ShieldCheck } from 'lucide-react';

interface LeaseModalProps {
  tenant: Tenant;
  unit?: Unit;
  property?: Property;
  onClose: () => void;
  onSaveSignature: (signatureDataUrl: string) => void;
}

const LeaseModal: React.FC<LeaseModalProps> = ({
  tenant,
  unit,
  property,
  onClose,
  onSaveSignature
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasNewSignature, setHasNewSignature] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const rentAmount = unit?.rentAmount || 15000;
  const depositAmount = unit?.depositAmount || rentAmount;
  const propertyName = property?.name || 'Sunset Apartments';
  const propertyAddress = property?.address || '124 Sunset Blvd, Nairobi';
  const unitName = unit?.name || 'Unit 101';
  const startDate = tenant.leaseStart ? format(new Date(tenant.leaseStart), 'MMMM d, yyyy') : format(new Date(), 'MMMM d, yyyy');
  const endDate = tenant.leaseEnd ? format(new Date(tenant.leaseEnd), 'MMMM d, yyyy') : 'Periodic (Month-to-Month)';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasNewSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasNewSignature(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveSignature(dataUrl);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 print:p-0 print:bg-white">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:shadow-none print:max-h-none print:w-full print:rounded-none">
        
        {/* Header - Hidden on Print */}
        <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/40 print:hidden">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-lg">
            <FileCheck size={22} />
            <span>Residential Tenancy Lease Agreement</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer size={15} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Agreement Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-gray-800 dark:text-gray-200 text-sm leading-relaxed print:p-12 print:text-black">
          
          {/* Document Header */}
          <div className="text-center border-b pb-6 dark:border-gray-700">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white uppercase print:text-black">
              Standard Residential Tenancy Agreement
            </h1>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
              State of Contract • Reference Code: LSE-{tenant.id.toUpperCase()}-{unit?.id?.toUpperCase() || 'GEN'}
            </p>
          </div>

          {/* Section 1: The Parties */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider border-b pb-1 dark:border-gray-700 mb-2">
              1. The Parties & Premises
            </h3>
            <p>
              This Agreement is made on this <strong>{format(new Date(), 'do')}</strong> day of <strong>{format(new Date(), 'MMMM, yyyy')}</strong>, by and between the Landlord (Property Management) and the Tenant designated below:
            </p>
            <div className="mt-3 grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/30 p-3.5 rounded-lg border dark:border-gray-700 text-xs">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Tenant Full Name:</p>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{tenant.fullName}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">National ID / Passport:</p>
                <p className="font-medium text-gray-900 dark:text-white">{tenant.idNumber}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Phone & Email:</p>
                <p className="font-medium text-gray-900 dark:text-white">{tenant.phone} {tenant.email ? `• ${tenant.email}` : ''}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Leased Property / Estate:</p>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{propertyName}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Physical Address:</p>
                <p className="font-medium text-gray-900 dark:text-white">{propertyAddress}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Designated Unit / Apartment:</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400">{unitName}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Financial Terms */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider border-b pb-1 dark:border-gray-700 mb-2">
              2. Term, Monthly Rent & Security Deposit
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
              <li>
                <strong>Term Duration:</strong> Commencing on <strong>{startDate}</strong> until <strong>{endDate}</strong>.
              </li>
              <li>
                <strong>Monthly Rent:</strong> The agreed rental rate is <strong>Ksh {rentAmount.toLocaleString()}</strong> per calendar month, payable in advance on or before the <strong>5th day</strong> of each calendar month.
              </li>
              <li>
                <strong>Security Deposit:</strong> The Tenant deposits the sum of <strong>Ksh {depositAmount.toLocaleString()}</strong> as a security bond for damage inspection and fulfillment of all terms.
              </li>
              <li>
                <strong>Payment Channel:</strong> All remittances shall be paid via Bank Transfer, Authorized Mobile Money (Paybill/Till), or approved electronic gateway.
              </li>
            </ul>
          </div>

          {/* Section 3: Covenants */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider border-b pb-1 dark:border-gray-700 mb-2">
              3. Obligations & House Rules
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              The Tenant agrees to occupy the premises quietly without nuisance to neighbors, to keep the unit in sanitary condition, and to report structural or plumbing defects promptly. Unauthorized subletting or structural alterations are strictly prohibited without written consent.
            </p>
          </div>

          {/* Section 4: Signatures */}
          <div className="pt-4 border-t dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider mb-4">
              4. Execution & Digital Signatures
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Landlord Side */}
              <div className="p-4 border dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/20">
                <p className="text-xs font-semibold text-gray-500 uppercase">For Property Management / Landlord</p>
                <div className="h-24 flex items-center justify-center border-b border-dashed dark:border-gray-600 my-2">
                  <span className="font-serif italic text-2xl text-blue-900 dark:text-blue-300 font-bold">
                    PropMinds Authorized Signatory
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Author: Estate Administrator</span>
                  <span>Date: {format(new Date(), 'MMM d, yyyy')}</span>
                </div>
              </div>

              {/* Tenant Signature Area */}
              <div className="p-4 border dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/20">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Tenant Signature: {tenant.fullName}
                  </p>
                  {tenant.leaseSigned && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                      <ShieldCheck size={14} /> Signed on {tenant.leaseSignedDate ? format(new Date(tenant.leaseSignedDate), 'MMM d, yyyy') : 'Record'}
                    </span>
                  )}
                </div>

                {tenant.leaseSignature && !hasNewSignature ? (
                  <div className="h-24 flex items-center justify-center border-b border-dashed dark:border-gray-600 my-2 bg-white dark:bg-gray-800 rounded">
                    <img src={tenant.leaseSignature} alt="Tenant Signature" className="max-h-20 object-contain" />
                  </div>
                ) : (
                  <div className="my-2 print:border-b print:h-24">
                    <canvas
                      ref={canvasRef}
                      width={340}
                      height={96}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-24 border border-dashed border-gray-400 dark:border-gray-500 rounded bg-white cursor-crosshair touch-none"
                    />
                    <div className="flex justify-between items-center mt-1 print:hidden">
                      <span className="text-[11px] text-gray-400">Sign with finger or mouse</span>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
                      >
                        <Eraser size={12} /> Clear
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500">
                  <span>ID: {tenant.idNumber}</span>
                  <span>Date: {format(new Date(), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions - Hidden on Print */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-between items-center print:hidden">
          <div>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check size={15} /> Signature successfully saved to tenant ledger!
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {hasNewSignature && (
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Check size={15} /> Save Signed Contract
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeaseModal;
