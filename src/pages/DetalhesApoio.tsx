import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Share2, Heart, ArrowLeft, Calendar, User, Info, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCheckoutPayment } from '@/hooks/useInfinitepay';
import { useIsMobile, useDeviceInfo } from '@/hooks/use-mobile';

interface Apoio {
  id: string;
  titulo: string;
  descricao: string;
  beneficios?: string;
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
  const isMobile = useIsMobile();
  const { isIOS, isAndroid } = useDeviceInfo();
  
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
      <div className="min-h-screen bg-background p-3 sm:p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-6 sm:h-8 bg-muted rounded w-1/4"></div>
            <div className="aspect-video bg-muted rounded-lg"></div>
            <div className="h-6 sm:h-8 bg-muted rounded w-3/4"></div>
            <div className="h-16 sm:h-20 bg-muted rounded"></div>
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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            size={isMobile ? "sm" : "default"}
          >
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            Voltar
          </Button>
          
          <Button
            variant="outline"
            size={isMobile ? "sm" : "sm"}
            onClick={compartilhar}
          >
            {isMobile ? "Compartilhar" : "Compartilhar"}
            <Share2 className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold">{apoio.titulo}</h1>

          {/* Image */}
          {apoio.imagem_url && (
            <div className="aspect-video overflow-hidden rounded-lg">
              <img
                src={apoio.imagem_url}
                alt={apoio.titulo}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Progress Component */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                <Heart className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                Progresso da campanha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
              {/* Progress */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-medium">
                    R$ {valorAtualReais.toLocaleString('pt-BR', { minimumFractionDigits: isMobile ? 0 : 2 })}
                  </span>
                  <span className="text-muted-foreground">
                    de R$ {metaValorReais.toLocaleString('pt-BR', { minimumFractionDigits: isMobile ? 0 : 2 })}
                  </span>
                </div>
                
                <Progress 
                  value={Math.min(progresso, 100)} 
                  className="h-3 sm:h-4 bg-secondary"
                />
                
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>{progresso.toFixed(1)}% concluído</span>
                  <span>{apoiadores.length} apoiadores</span>
                </div>
              </div>

              {/* Support Button - Usa Drawer em mobile, Dialog em desktop */}
              {isMobile ? (
                <Drawer open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DrawerTrigger asChild>
                    <Button className="w-full" size="default">
                      <Heart className="h-4 w-4 mr-2" />
                      Apoiar agora
                    </Button>
                  </DrawerTrigger>
                    
                  <DrawerContent className="px-4 pb-6">
                    <DrawerHeader>
                      <DrawerTitle className="text-left">Apoiar: {apoio.titulo}</DrawerTitle>
                    </DrawerHeader>
                    
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="valor" className="text-sm">Valor do apoio (R$)</Label>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          min="1"
                          placeholder="0,00"
                          value={valor}
                          onChange={(e) => setValor(e.target.value)}
                          className="text-base"
                        />
                      </div>
                        
                      <div>
                        <Label htmlFor="nome" className="text-sm">Seu nome</Label>
                        <Input
                          id="nome"
                          placeholder="Como você quer aparecer"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="text-base"
                        />
                      </div>
                        
                      <div>
                        <Label htmlFor="email" className="text-sm">Email para contato</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="text-base"
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
                  </DrawerContent>
                </Drawer>
              ) : (
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
              )}
            </CardContent>
          </Card>

          {/* Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">

              {/* Description, Benefits and Supporters Tabs */}
              <Card className="mb-4 sm:mb-6">
                <CardContent className="p-0">
                  <Tabs defaultValue="sobre" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-12">
                      <TabsTrigger value="sobre" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Sobre</span>
                        <span className="sm:hidden">Sobre</span>
                      </TabsTrigger>
                      <TabsTrigger value="beneficios" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <Gift className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Benefícios</span>
                        <span className="sm:hidden">Benefícios</span>
                      </TabsTrigger>
                      <TabsTrigger value="apoiadores" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Apoiadores</span>
                        <span className="sm:hidden">Apoiadores</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="min-h-[200px]">
                      <TabsContent value="sobre" className="p-4 sm:p-6 m-0">
                        <p className="whitespace-pre-wrap text-sm sm:text-base">{apoio.descricao}</p>
                        <div className="flex items-center gap-4 mt-4 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 sm:h-4 w-3 sm:w-4" />
                            {isMobile ? new Date(apoio.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : `Criado em ${new Date(apoio.created_at).toLocaleDateString('pt-BR')}`}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="beneficios" className="p-4 sm:p-6 m-0">
                        {apoio.beneficios ? (
                          <p className="whitespace-pre-wrap text-sm sm:text-base">{apoio.beneficios}</p>
                        ) : (
                          <p className="text-muted-foreground text-sm sm:text-base text-center py-8">
                            Os benefícios deste apoio serão informados em breve.
                          </p>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="apoiadores" className="p-4 sm:p-6 m-0">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base sm:text-lg font-semibold">Apoiadores</h3>
                          <span className="text-sm text-muted-foreground">({apoiadores.length})</span>
                        </div>
                        
                        {apoiadores.length > 0 ? (
                          <div className="space-y-3 sm:space-y-4">
                            {apoiadores.slice(0, isMobile ? 5 : apoiadores.length).map((apoiador) => (
                              <div key={apoiador.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm sm:text-base">{apoiador.nome}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                      {new Date(apoiador.created_at).toLocaleDateString('pt-BR', isMobile ? { day: '2-digit', month: 'short' } : undefined)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-primary text-sm sm:text-base">
                                    R$ {(apoiador.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: isMobile ? 0 : 2 })}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {isMobile && apoiadores.length > 5 && (
                              <p className="text-center text-xs text-muted-foreground pt-2">
                                E mais {apoiadores.length - 5} apoiadores...
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm sm:text-base">
                            Seja o primeiro a apoiar esta causa!
                          </p>
                        )}
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}