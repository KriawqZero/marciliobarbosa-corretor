import { BROKER_NAME, BROKER_PHONE_DISPLAY } from '@/lib/constants'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'

interface PropertyContactBoxProps {
  whatsappMessage: string
}

export function PropertyContactBox({ whatsappMessage }: PropertyContactBoxProps) {
  return (
    <>
      {/* Desktop sticky box */}
      <div className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-cinza-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-azul-escuro text-lg font-bold text-white">
              MB
            </div>
            <div>
              <p className="font-semibold text-cinza-900">{BROKER_NAME}</p>
              <p className="text-sm text-cinza-600">Corretor de Imóveis</p>
            </div>
          </div>

          <WhatsAppButton message={whatsappMessage} className="w-full" />

          <a
            href={`tel:+${BROKER_PHONE_DISPLAY.replace(/\D/g, '')}`}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-azul-escuro px-6 py-3 text-base font-semibold text-azul-escuro transition-colors hover:bg-azul-escuro hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {BROKER_PHONE_DISPLAY}
          </a>
        </div>
      </div>

      {/* Mobile fixed bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cinza-200 bg-white p-3 shadow-lg lg:hidden">
        <WhatsAppButton message={whatsappMessage} className="w-full" />
      </div>
    </>
  )
}
