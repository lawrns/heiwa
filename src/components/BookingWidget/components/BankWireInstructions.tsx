import { Copy, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { useState } from 'react';

interface BankWireInstructionsProps {
  totalAmount: number;
  currency: string;
  bookingReference?: string;
}

export function BankWireInstructions({ totalAmount, currency, bookingReference }: BankWireInstructionsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankDetails = {
    accountName: 'Heiwa House Costa Rica S.A.',
    iban: 'CR05015201001026284394',
    swift: 'BCCRCRSJXXX',
    bankName: 'Banco de Costa Rica',
    bankAddress: 'San José, Costa Rica',
  };

  const reference = bookingReference || `HW-${Date.now().toString().slice(-6)}`;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Building2 size={24} className="text-blue-600" />
        <div>
          <h4 className="font-semibold text-blue-900">Bank Wire Transfer Instructions</h4>
          <p className="text-sm text-blue-700">
            Please transfer the exact amount to complete your booking
          </p>
        </div>
      </div>

      {/* Transfer Amount */}
      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-orange-900">Transfer Amount:</span>
          <span className="text-2xl font-bold text-orange-600">
            {formatAmount(totalAmount)}
          </span>
        </div>
      </div>

      {/* Bank Details */}
      <div className="space-y-4">
        <h5 className="font-semibold text-gray-900">Bank Details</h5>
        
        <div className="grid gap-3">
          {/* Account Name */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
              <div className="text-sm font-medium text-gray-700">Account Name</div>
              <div className="text-gray-900">{bankDetails.accountName}</div>
            </div>
            <button
              onClick={() => copyToClipboard(bankDetails.accountName, 'accountName')}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Copy account name"
            >
              {copiedField === 'accountName' ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>

          {/* IBAN */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
              <div className="text-sm font-medium text-gray-700">IBAN</div>
              <div className="text-gray-900 font-mono">{bankDetails.iban}</div>
            </div>
            <button
              onClick={() => copyToClipboard(bankDetails.iban, 'iban')}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Copy IBAN"
            >
              {copiedField === 'iban' ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>

          {/* SWIFT */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
              <div className="text-sm font-medium text-gray-700">SWIFT/BIC</div>
              <div className="text-gray-900 font-mono">{bankDetails.swift}</div>
            </div>
            <button
              onClick={() => copyToClipboard(bankDetails.swift, 'swift')}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Copy SWIFT code"
            >
              {copiedField === 'swift' ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>

          {/* Bank Name & Address */}
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="text-sm font-medium text-gray-700">Bank</div>
            <div className="text-gray-900">{bankDetails.bankName}</div>
            <div className="text-sm text-gray-600">{bankDetails.bankAddress}</div>
          </div>

          {/* Reference */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div>
              <div className="text-sm font-medium text-yellow-800">Payment Reference</div>
              <div className="text-yellow-900 font-mono font-semibold">{reference}</div>
              <div className="text-xs text-yellow-700 mt-1">
                ⚠️ Include this reference in your transfer
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(reference, 'reference')}
              className="p-2 text-yellow-600 hover:text-yellow-800 transition-colors"
              title="Copy reference"
            >
              {copiedField === 'reference' ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h6 className="font-semibold text-amber-900">Important Notes</h6>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Transfer the exact amount: <strong>{formatAmount(totalAmount)}</strong></li>
              <li>• Include the payment reference: <strong>{reference}</strong></li>
              <li>• Transfers typically take 1-3 business days to process</li>
              <li>• Your booking will be confirmed once payment is received</li>
              <li>• You will receive an email confirmation after payment verification</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Questions about your transfer?{' '}
          <a href="mailto:bookings@heiwahouse.com" className="text-orange-600 hover:text-orange-700 underline">
            Contact our booking team
          </a>
        </p>
      </div>
    </div>
  );
}
