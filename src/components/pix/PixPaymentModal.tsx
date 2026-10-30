'use client';

import { useState, useMemo, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Copy,
  Check,
  QrCode,
  CreditCard,
  ShieldCheck,
  X,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { generatePixBRCode } from '@/lib/pix';

export function PixQrCodeSvg({
  brCode,
  size = 188,
}: {
  brCode: string;
  size?: number;
}) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!brCode) return;
    QRCode.toDataURL(brCode, {
      width: size * 2,
      margin: 1,
      color: {
        dark: '#0B132B',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('Error generating Pix QRCode:', err));
  }, [brCode, size]);

  return (
    <div
      className="bg-white p-3 rounded-2xl border-2 border-slate-900 inline-flex items-center justify-center shadow-2xs overflow-hidden"
      style={{ width: size, height: size }}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="QR Code Pix Oficial"
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl" />
      )}
    </div>
  );
}

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerName: string;
  pixKey: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  pixBeneficiary?: string;
  serviceName: string;
  amount: number;
  allowEditAmount?: boolean;
  onPaymentConfirmed?: (method: 'pix' | 'stripe') => void;
}

export default function PixPaymentModal({
  isOpen,
  onClose,
  providerName,
  pixKey,
  pixKeyType = 'email',
  pixBeneficiary,
  serviceName,
  amount: initialAmount,
  allowEditAmount = false,
  onPaymentConfirmed,
}: PixPaymentModalProps) {
  const [method, setMethod] = useState<'pix' | 'stripe'>('pix');
  const [customAmount, setCustomAmount] = useState<number>(initialAmount);
  const [copiedBrCode, setCopiedBrCode] = useState(false);
  const [copiedRawKey, setCopiedRawKey] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  // Stripe Demo Card Inputs
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8891');
  const [cardName, setCardName] = useState('RAUL FREITAS');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('123');
  const [installments, setInstallments] = useState('1');

  const finalAmount = allowEditAmount ? customAmount : initialAmount;

  const brCode = useMemo(
    () =>
      generatePixBRCode({
        pixKey: pixKey || 'lucas.becker@arenasunset.com.br',
        pixKeyType,
        merchantName: pixBeneficiary || providerName,
        merchantCity: 'SAO PAULO',
        amount: finalAmount,
        description: serviceName,
      }),
    [pixKey, pixKeyType, pixBeneficiary, providerName, finalAmount, serviceName]
  );

  if (!isOpen) return null;

  const handleCopyBrCode = () => {
    navigator.clipboard.writeText(brCode);
    setCopiedBrCode(true);
    setTimeout(() => setCopiedBrCode(false), 2500);
  };

  const handleCopyRawKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedRawKey(true);
    setTimeout(() => setCopiedRawKey(false), 2500);
  };

  const handleConfirmPaid = () => {
    setPaidSuccess(true);
    if (onPaymentConfirmed) {
      onPaymentConfirmed(method);
    }
    setTimeout(() => {
      setPaidSuccess(false);
      onClose();
    }, 1600);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
              Checkout Direto ao Prestador
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
              Pagamento para {providerName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method Switcher: Pix QR Code (0% Taxa) vs Cartão Stripe */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMethod('pix')}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
              method === 'pix'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Pix com QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('stripe')}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
              method === 'stripe'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cartão (Stripe)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Service & Value Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Serviço Selecionado
              </p>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                {serviceName}
              </p>
            </div>

            {allowEditAmount ? (
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs font-extrabold text-slate-500">R$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded-lg border border-blue-400 text-right text-sm font-black text-slate-900 outline-none"
                />
              </div>
            ) : (
              <div className="text-right shrink-0">
                <span className="block text-[10px] text-slate-400">Valor Fixo</span>
                <span className="text-lg font-black text-blue-600">
                  R$ {finalAmount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}
          </div>

          {method === 'pix' ? (
            <div className="space-y-4">
              {/* Visual QR Code + Beneficiary */}
              <div className="flex flex-col items-center text-center space-y-2.5">
                <PixQrCodeSvg brCode={brCode} size={184} />
                <div>
                  <p className="text-xs font-extrabold text-slate-900">
                    Escaneie no app do seu banco
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Favorecido:{' '}
                    <strong className="text-slate-700">
                      {pixBeneficiary || providerName}
                    </strong>{' '}
                    • Chave ({pixKeyType.toUpperCase()}):{' '}
                    <strong className="text-blue-600">{pixKey}</strong>
                  </p>
                </div>
              </div>

              {/* Pix Copia e Cola Box */}
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Código Pix Copia e Cola (Com valor R$ {finalAmount} incluso):
                </label>
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600 break-all line-clamp-2 select-all">
                  {brCode}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyBrCode}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedBrCode ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copia e Cola Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Pix Copia e Cola</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyRawKey}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedRawKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chave Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-blue-600" />
                        <span>Só a Chave Pix</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Taxa R$ 0 (0%):</strong> O valor cai direto na conta bancária do prestador via Pix oficial (BR Code Banco Central).
                </span>
              </div>
            </div>
          ) : (
            /* STRIPE CREDIT CARD CHECKOUT */
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span className="font-extrabold">Stripe Checkout Seguro</span>
                </div>
                <span className="text-[10px] text-slate-400">Cartão de Crédito</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome no Cartão
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Validade
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Parcelamento
                </label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                >
                  <option value="1">1x de R$ {finalAmount.toFixed(2)} sem juros</option>
                  <option value="2">
                    2x de R$ {(finalAmount / 2).toFixed(2)} sem juros
                  </option>
                  <option value="3">
                    3x de R$ {(finalAmount / 3).toFixed(2)} sem juros
                  </option>
                </select>
              </div>
            </div>
          )}

          {paidSuccess ? (
            <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-extrabold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pagamento confirmado com sucesso!</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConfirmPaid}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {method === 'pix'
                  ? 'Já realizei o Pix / Confirmar'
                  : `Pagar R$ ${finalAmount.toFixed(2)} via Stripe`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
