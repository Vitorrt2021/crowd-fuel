import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface Apoio {
  id: string;
  titulo: string;
  descricao: string;
  meta_valor: number;
  valor_atual: number;
  imagem_url?: string;
  status: string;
}

interface ApoioCardProps {
  apoio: Apoio;
}

export function ApoioCard({ apoio }: ApoioCardProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const progresso = (apoio.valor_atual / apoio.meta_valor) * 100;
  const valorAtualReais = apoio.valor_atual / 100;
  const metaValorReais = apoio.meta_valor / 100;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          onClick={() => navigate(`/apoio/${apoio.id}`)}>
      <CardHeader className="p-0">
        {apoio.imagem_url && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={apoio.imagem_url}
              alt={apoio.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <CardTitle className="text-base sm:text-xl line-clamp-2 group-hover:text-primary transition-colors">
          {apoio.titulo}
        </CardTitle>
        
        <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 sm:line-clamp-3">
          {apoio.descricao}
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="font-medium">
              R$ {valorAtualReais.toLocaleString('pt-BR', { minimumFractionDigits: isMobile ? 0 : 2 })}
            </span>
            <span className="text-muted-foreground">
              {isMobile ? 'Meta: ' : 'Meta: R$ '}{metaValorReais.toLocaleString('pt-BR', { minimumFractionDigits: isMobile ? 0 : 2 })}
            </span>
          </div>
          
          <Progress 
            value={Math.min(progresso, 100)} 
            className="h-2 sm:h-3 bg-secondary"
          />
          
          <div className="text-xs sm:text-sm text-muted-foreground">
            {progresso.toFixed(1)}% concluído
          </div>
        </div>
        
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/apoio/${apoio.id}`);
          }}
          className="w-full"
          variant="outline"
          size={isMobile ? "sm" : "default"}
        >
          Saber mais
        </Button>
      </CardContent>
    </Card>
  );
}