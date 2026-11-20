import { BookOpen, Calendar, Heart, HeartHandshake, Layers } from 'lucide-react';

interface QuickAccessStripProps {
  onSelectCard: (target: string) => void;
}

const CARDS = [
  {
    id: 'palavra-do-dia',
    title: 'Palavra do Dia',
    description: 'Reflexões diárias para sua caminhada com Deus',
    icon: BookOpen,
  },
  {
    id: 'estudos-biblicos',
    title: 'Estudos Bíblicos',
    description: 'Aprofunde seu conhecimento da Palavra',
    icon: Layers,
  },
  {
    id: 'agenda',
    title: 'Agenda da Igreja',
    description: 'Cultos, campanhas e eventos especiais',
    icon: Calendar,
  },
  {
    id: 'oracao',
    title: 'Pedidos de Oração',
    description: 'Envie seu pedido, oraremos por você',
    icon: HeartHandshake,
  },
  {
    id: 'dizimos',
    title: 'Dízimos e Ofertas',
    description: 'Contribua com a obra do Senhor',
    icon: Heart,
  },
];

export function QuickAccessStrip({ onSelectCard }: QuickAccessStripProps) {
  return (
    <section aria-label="Acesso rápido" className="relative z-20 mt-5 md:-mt-10 px-4 sm:px-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onSelectCard(card.id)}
                className="group flex min-h-[44px] flex-col items-center text-center rounded-xl border border-[#DFD6BE] bg-white px-4 py-5 shadow-[0_10px_28px_-12px_rgba(16,43,78,0.18)] hover:-translate-y-0.5 hover:border-[#C9A24D] hover:shadow-[0_14px_30px_-10px_rgba(16,43,78,0.22)] transition-all duration-200 cursor-pointer"
              >
                <div className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F8F6F0] text-[#8A6212] group-hover:bg-[#C9A24D]/20 transition-colors">
                  <Icon className="h-6 w-6 stroke-[2]" aria-hidden="true" />
                </div>
                <h2 className="font-serif-church text-[20px] font-bold leading-snug text-[#102B4E] group-hover:text-[#1D4B82] transition-colors">
                  {card.title}
                </h2>
                <p className="mt-1.5 text-[16px] leading-[1.5] font-normal text-[#334155]">
                  {card.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
