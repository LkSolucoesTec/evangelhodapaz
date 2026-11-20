import { useState } from 'react';
import { Check, Copy, Heart, MapPin, Navigation } from 'lucide-react';
import type { SiteSettings } from '../types/church.ts';

interface TithesAndLocationGridProps {
  settings: SiteSettings;
}

const PIX_KEY = '11.110.613/0001-06';
const PIX_BENEFICIARY =
  'Comunidade Evangélica Pentecostal O Evangelho da Paz';

export function TithesAndLocationGrid({
  settings,
}: TithesAndLocationGridProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-6 pb-14 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">

        {/* Dízimos e Ofertas */}
        <div id="dizimos" className="flex flex-col lg:col-span-6">
          <div className="mb-4 flex items-center gap-2.5">
            <Heart
              className="h-6 w-6 shrink-0 text-[#8A6212]"
              aria-hidden="true"
            />
            <h2 className="font-serif-church text-[26px] font-bold leading-tight text-[#102B4E] lg:text-[28px]">
              Dízimos e Ofertas
            </h2>
          </div>

          <p className="mb-5 text-[17px] leading-[1.6] text-[#172B46] sm:text-[18px]">
            Contribua e seja um instrumento na obra de Deus.
            Sua oferta ajuda a manter a casa do Senhor e
            alcançar mais vidas.
          </p>

          <div className="flex flex-col items-center gap-5 rounded-xl border border-[#DFD6BE] bg-white p-5 shadow-md sm:flex-row sm:items-start">
            <div className="w-full max-w-[220px] shrink-0 rounded-lg border border-stone-200 bg-white p-2">
              <img
                src="/images/qrcodeoferta.png"
                alt="QR Code Pix oficial da igreja para dízimos e ofertas"
                className="aspect-square w-full object-contain"
                loading="lazy"
              />
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-[20px] font-bold text-[#102B4E]">
                Chave Pix — CNPJ
              </p>

              <p className="mt-2 break-all text-[17px] font-semibold text-[#172B46]">
                {PIX_KEY}
              </p>

              <p className="mt-3 text-base leading-relaxed text-[#334155]">
                <strong>Banco:</strong> Cora SCD 403
                <br />
                <strong>Agência:</strong> 001
                <br />
                <strong>Conta:</strong> 1279003-8
              </p>

              <button
                type="button"
                onClick={handleCopyPix}
                className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg border border-[#C9A24D] bg-[#FAF8F2] px-4 py-2.5 text-base font-semibold text-[#102B4E] transition-colors hover:bg-[#F2E5C7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#102B4E]"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" aria-hidden="true" />
                    Chave Copiada!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" aria-hidden="true" />
                    Copiar Chave Pix
                  </>
                )}
              </button>

              {copyError && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  Não foi possível copiar automaticamente.
                  Selecione e copie a chave acima.
                </p>
              )}
            </div>
          </div>

          <p className="mt-4 text-base leading-relaxed text-[#172B46]">
            <strong>Beneficiário:</strong> {PIX_BENEFICIARY}
          </p>

          <p className="mt-3 text-[15px] leading-relaxed text-[#334155]">
            Confira o nome do beneficiário antes de concluir
            sua contribuição no aplicativo do banco.
          </p>
        </div>

        {/* Onde Estamos — preservado */}
        <div
          id="onde-estamos"
          className="flex flex-col justify-between lg:col-span-6"
        >
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <MapPin
                className="h-6 w-6 shrink-0 text-[#8A6212]"
                aria-hidden="true"
              />
              <h2 className="font-serif-church text-[26px] font-bold leading-tight text-[#102B4E] lg:text-[28px]">
                Onde Estamos
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-12 sm:items-center">
              <div className="space-y-4 sm:col-span-5">
                <div className="flex items-start gap-2.5 text-[17px] text-[#172B46] sm:text-[18px]">
                  <MapPin
                    className="mt-1 h-5 w-5 shrink-0 text-[#8A6212]"
                    aria-hidden="true"
                  />
                  <div className="leading-[1.5]">
                    <p className="font-bold text-[#102B4E]">
                      {settings.address_line1}
                    </p>
                    <p>{settings.address_line2}</p>
                  </div>
                </div>

                <a
                  href={settings.maps_directions_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-gradient-to-b from-[#E5C16A] to-[#C4983B] px-5 py-2.5 text-base font-semibold text-[#102B4E] shadow-md transition-all hover:brightness-105"
                >
                  <Navigation
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>Como Chegar</span>
                </a>
              </div>

              <div className="sm:col-span-7">
                <div className="relative overflow-hidden rounded-xl border border-[#DFD6BE] bg-white shadow-md">
                  <div className="aspect-[16/10] w-full bg-slate-200">
                    <iframe
                      title="Street View da Comunidade Evangélica Pentecostal O Evangelho da Paz"
                      src={settings.maps_embed_url}
                      className="h-full w-full border-0"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center">
                    <a
                      href={settings.maps_directions_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-stone-300 bg-white/95 px-4 py-2 text-[15px] font-semibold text-[#102B4E] shadow-md transition-colors hover:bg-[#FAF8F2]"
                    >
                      <MapPin
                        className="h-4 w-4 text-[#8A6212]"
                        aria-hidden="true"
                      />
                      <span>Ver no Google Maps</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}


        