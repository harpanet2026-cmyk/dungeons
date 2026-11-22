import React, { useState } from 'react';
import { ItemCategory } from '../../core/data/equipmentCatalog';
import { Swords, Shield, FlaskConical, Wrench, Sparkles, Package } from 'lucide-react';

interface ItemThumbnailProps {
  imageUrl?: string;
  name: string;
  category?: ItemCategory | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ItemThumbnail: React.FC<ItemThumbnailProps> = ({
  imageUrl,
  name,
  category = 'geral',
  size = 'md',
  className = ''
}) => {
  const [hasError, setHasError] = useState<boolean>(false);

  // Tamanhos com proporção 3:4 (retrato vertical)
  const sizeClasses = {
    sm: 'w-11 h-[59px]', // ~3:4 pequeno
    md: 'w-14 h-[75px]', // ~3:4 padrão para cards
    lg: 'w-28 h-[148px]' // ~3:4 expandido para inspeção/comparação
  }[size];

  const getCategoryIcon = () => {
    switch (category) {
      case 'arma':
        return <Swords className="h-1/2 w-1/2 text-amber-500/80" />;
      case 'armadura':
      case 'escudo':
        return <Shield className="h-1/2 w-1/2 text-blue-400/80" />;
      case 'pocao':
        return <FlaskConical className="h-1/2 w-1/2 text-red-400/80" />;
      case 'ferramenta':
        return <Wrench className="h-1/2 w-1/2 text-stone-400" />;
      case 'item_magico':
        return <Sparkles className="h-1/2 w-1/2 text-purple-400/80" />;
      default:
        return <Package className="h-1/2 w-1/2 text-amber-600/70" />;
    }
  };

  if (imageUrl && !hasError) {
    return (
      <div
        className={`relative flex-shrink-0 overflow-hidden rounded-md border border-amber-900/60 bg-black shadow-md ${sizeClasses} ${className}`}
      >
        <img
          src={imageUrl}
          alt={name}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        {/* Vinheta sutil e borda interna dark fantasy */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>
    );
  }

  // Fallback escuro com gradiente temático e ícone
  return (
    <div
      className={`relative flex flex-shrink-0 items-center justify-center rounded-md border border-stone-800 bg-gradient-to-b from-stone-900 to-[#121015] shadow-inner ${sizeClasses} ${className}`}
      title={name}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent opacity-80" />
      {getCategoryIcon()}
    </div>
  );
};
