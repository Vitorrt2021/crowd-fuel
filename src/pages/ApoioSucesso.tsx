import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Heart, Home, Share2 } from 'lucide-react';

export default function ApoioSucesso() {
  const navigate = useNavigate();

  const compartilhar = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ApoiaColetivo',
          text: 'Acabei de apoiar uma causa importante! Venha conhecer outros apoios incríveis.',
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 px-8 pb-8">
          <div className="space-y-6">
            {/* Ícone de sucesso */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Título e mensagem */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
                Apoio Realizado!
              </h1>
              <p className="text-muted-foreground">
                Obrigado por apoiar esta causa! Seu apoio faz toda a diferença.
              </p>
            </div>

            {/* Ilustração */}
            <div className="py-4">
              <Heart className="h-12 w-12 text-primary mx-auto animate-pulse" />
            </div>

            {/* Informações adicionais */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p>
                Você receberá um comprovante do pagamento por email. 
                O valor será destinado diretamente para o criador do apoio.
              </p>
            </div>

            {/* Botões de ação */}
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                className="w-full"
                size="lg"
              >
                <Home className="h-4 w-4 mr-2" />
                Ver outros apoios
              </Button>
              
              <Button 
                variant="outline"
                onClick={compartilhar}
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar plataforma
              </Button>
            </div>

            {/* Mensagem motivacional */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
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