import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Heart, Home, Share2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

export default function ApoioSucesso() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const compartilhar = async () => {
    // Em mobile, tenta compartilhar nativamente
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: 'ApoiaAI',
          text: 'Acabei de apoiar uma causa importante! Venha conhecer outros apoios incríveis.',
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
        // Se falhar no mobile, copia para clipboard como fallback
        navigator.clipboard.writeText(window.location.origin);
        toast({
          title: 'Link copiado!',
          description: 'O link foi copiado para a área de transferência.',
        });
      }
    } else {
      // Em desktop, sempre copia para área de transferência
      navigator.clipboard.writeText(window.location.origin);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6 sm:pt-8 px-4 sm:px-8 pb-6 sm:pb-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Ícone de sucesso */}
            <div className="flex justify-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="h-7 sm:h-8 w-7 sm:w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Título e mensagem */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                Apoio Realizado!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground px-2">
                Obrigado por apoiar esta causa! Seu apoio faz toda a diferença.
              </p>
            </div>

            {/* Ilustração */}
            <div className="py-3 sm:py-4">
              <Heart className="h-10 sm:h-12 w-10 sm:w-12 text-primary mx-auto animate-pulse" />
            </div>

            {/* Informações adicionais */}
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground">
              <p>
                Você receberá um comprovante do pagamento por email. 
                O valor será destinado diretamente para o criador do apoio.
              </p>
            </div>

            {/* Botões de ação */}
            <div className="space-y-2 sm:space-y-3">
              <Button 
                onClick={() => navigate('/')}
                className="w-full"
                size={isMobile ? "default" : "lg"}
              >
                <Home className="h-4 w-4 mr-2" />
                Ver outros apoios
              </Button>
              
              <Button 
                variant="outline"
                onClick={compartilhar}
                className="w-full"
                size={isMobile ? "default" : "default"}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>

            {/* Mensagem motivacional */}
            <div className="pt-3 sm:pt-4 border-t">
              <p className="text-xs sm:text-sm text-muted-foreground">
                💡 <strong>Você sabia?</strong> Cada apoio, por menor que seja, 
                pode transformar a vida de alguém. Continue espalhando o bem!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}