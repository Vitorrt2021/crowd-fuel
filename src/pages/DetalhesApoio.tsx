import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Share2, Heart, ArrowLeft, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCheckoutPayment } from '@/hooks/useInfinitepay';

interface Apoio {
  id: string;
  titulo: string;
  descricao: string;
  meta_valor: number;
  valor_atual: number;
  imagem_url?: string;
  handle_infinitepay: string;
  created_at: string;
}

interface Apoiador {
  id: string;
  nome: string;
  valor: number;
  created_at: string;
}

export default function DetalhesApoio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { executePayment, loading: paymentLoading } = useCheckoutPayment();
  
  const [apoio, setApoio] = useState<Apoio | null>(null);
  const [apoiadores, setApoiadores] = useState<Apoiador[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [valor, setValor] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchApoio = async () => {
      try {
        const { data: apoioData, error: apoioError } = await supabase
          .from('apoios')
          .select('*')
          .eq('id', id)
          .single();

        if (apoioError) throw apoioError;
        setApoio(apoioData);

        const { data: apoiadoresData, error: apoiadoresError } = await supabase
          .from('apoiadores')
          .select('*')
          .eq('apoio_id', id)
          .order('created_at', { ascending: false });

        if (apoiadoresError) throw apoiadoresError;
        setApoiadores(apoiadoresData || []);
      } catch (error) {
        console.error('Erro ao carregar apoio:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os detalhes do apoio.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApoio();
  }, [id, toast]);

  const handleApoiar = async () => {
    if (!apoio || !valor || !nome || !email) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos para continuar.',
        variant: 'destructive',
      });
      return;
    }

    const valorCentavos = Math.round(parseFloat(valor) * 100);
    
    try {
      // Create checkout via edge function
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: apoio.handle_infinitepay,
          order_nsu: `APOIO_${Date.now()}`,
          items: [{
            quantity: 1,
            price: valorCentavos,
            description: `Apoio para: ${apoio.titulo}`
          }],
          customer: {
            name: nome,
            email: email
          }
        })
      });

      const { url } = await response.json();
      
      // Process payment with InfinitePay
      const paymentResult = await executePayment(url);
      
      if (paymentResult) {
        // Save supporter data
        await supabase
          .from('apoiadores')
          .insert({
            apoio_id: apoio.id,
            nome,
            email,
            valor: valorCentavos,
            transaction_nsu: paymentResult.transactionNsu
          });

        toast({
          title: 'Apoio realizado!',
          description: 'Obrigado por apoiar esta causa.',
        });

        navigate('/apoio-sucesso');
      }
    } catch (error) {
      console.error('Erro ao processar apoio:', error);
      toast({
        title: 'Erro no pagamento',
        description: 'Não foi possível processar seu apoio. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const compartilhar = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: apoio?.titulo,
          text: apoio?.descricao,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="aspect-video bg-muted rounded-lg"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!apoio) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Apoio não encontrado</h2>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para início
          </Button>
        </div>
      </div>
    );
  }

  const progresso = (apoio.valor_atual / apoio.meta_valor) * 100;
  const valorAtualReais = apoio.valor_atual / 100;
  const metaValorReais = apoio.meta_valor / 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {apoio.imagem_url && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={apoio.imagem_url}
                  alt={apoio.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title and Actions */}
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold flex-1">{apoio.titulo}</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={compartilhar}
                className="ml-4"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre este apoio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{apoio.descricao}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Criado em {new Date(apoio.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supporters */}
            <Card>
              <CardHeader>
                <CardTitle>Apoiadores ({apoiadores.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {apoiadores.length > 0 ? (
                  <div className="space-y-4">
                    {apoiadores.map((apoiador) => (
                      <div key={apoiador.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{apoiador.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(apoiador.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary">
                            R$ {(apoiador.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Seja o primeiro a apoiar esta causa!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Support Widget */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Apoiar esta causa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      R$ {valorAtualReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-muted-foreground">
                      de R$ {metaValorReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <Progress 
                    value={Math.min(progresso, 100)} 
                    className="h-4 bg-secondary"
                  />
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{progresso.toFixed(1)}% concluído</span>
                    <span>{apoiadores.length} apoiadores</span>
                  </div>
                </div>

                {/* Support Button */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Heart className="h-4 w-4 mr-2" />
                      Apoiar agora
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apoiar: {apoio.titulo}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="valor">Valor do apoio (R$)</Label>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          min="1"
                          placeholder="0,00"
                          value={valor}
                          onChange={(e) => setValor(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="nome">Seu nome</Label>
                        <Input
                          id="nome"
                          placeholder="Como você quer aparecer"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email para contato</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      
                      <Button 
                        onClick={handleApoiar}
                        disabled={paymentLoading || !valor || !nome || !email}
                        className="w-full"
                        size="lg"
                      >
                        {paymentLoading ? 'Processando...' : `Apoiar com R$ ${valor || '0,00'}`}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}