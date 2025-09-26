import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Upload, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInfinitepayUser } from '@/hooks/useInfinitepay';
import { useIsMobile } from '@/hooks/use-mobile';

export default function CriarApoio() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: userLoading } = useInfinitepayUser();
  const isMobile = useIsMobile();
  
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [metaValor, setMetaValor] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [handleInfinitepay, setHandleInfinitepay] = useState(user?.handle || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Usuário não encontrado',
        description: 'É necessário estar logado no InfinitePay para criar um apoio.',
        variant: 'destructive',
      });
      return;
    }

    if (!titulo || !descricao || !metaValor || !handleInfinitepay) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const metaValorCentavos = Math.round(parseFloat(metaValor) * 100);
      
      const { data, error } = await supabase
        .from('apoios')
        .insert({
          titulo,
          descricao,
          meta_valor: metaValorCentavos,
          imagem_url: imagemUrl || null,
          user_id: user.id,
          handle_infinitepay: handleInfinitepay.replace('@', ''), // Remove @ se existir
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Apoio criado!',
        description: 'Seu apoio foi criado com sucesso e já está disponível.',
      });

      navigate(`/apoio/${data.id}`);
    } catch (error) {
      console.error('Erro ao criar apoio:', error);
      toast({
        title: 'Erro ao criar apoio',
        description: 'Não foi possível criar seu apoio. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">
        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 sm:mb-6"
          size={isMobile ? "sm" : "default"}
        >
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">Criar Novo Apoio</CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground">
              Conte sua história e mobilize pessoas para apoiar sua causa
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Título */}
              <div>
                <Label htmlFor="titulo" className="text-sm sm:text-base">Título do apoio *</Label>
                <Input
                  id="titulo"
                  placeholder="Dê um título marcante para seu apoio"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  maxLength={100}
                  className="text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {titulo.length}/100 caracteres
                </p>
              </div>

              {/* Descrição */}
              <div>
                <Label htmlFor="descricao" className="text-sm sm:text-base">Descrição *</Label>
                <Textarea
                  id="descricao"
                  placeholder="Conte sua história, explique por que precisa de apoio e como os recursos serão utilizados..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={isMobile ? 4 : 6}
                  maxLength={2000}
                  className="text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {descricao.length}/2000 caracteres
                </p>
              </div>

              {/* Meta de valor */}
              <div>
                <Label htmlFor="metaValor" className="text-sm sm:text-base">Meta de arrecadação (R$) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="metaValor"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0,00"
                    value={metaValor}
                    onChange={(e) => setMetaValor(e.target.value)}
                    className="pl-10 text-sm sm:text-base"
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Defina uma meta realista para seu apoio
                </p>
              </div>

              {/* URL da imagem */}
              <div>
                <Label htmlFor="imagemUrl" className="text-sm sm:text-base">URL da imagem (opcional)</Label>
                <div className="relative">
                  <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="imagemUrl"
                    type="url"
                    placeholder="https://exemplo.com/sua-imagem.jpg"
                    value={imagemUrl}
                    onChange={(e) => setImagemUrl(e.target.value)}
                    className="pl-10 text-sm sm:text-base"
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Uma imagem ajuda a conectar com os apoiadores
                </p>
              </div>

              {/* Handle InfinitePay */}
              <div>
                <Label htmlFor="handleInfinitepay" className="text-sm sm:text-base">Handle InfinitePay *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    @
                  </span>
                  <Input
                    id="handleInfinitepay"
                    placeholder="seu-handle"
                    value={handleInfinitepay}
                    onChange={(e) => setHandleInfinitepay(e.target.value)}
                    className="pl-8 text-sm sm:text-base"
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Handle que receberá os pagamentos dos apoiadores
                </p>
              </div>

              {/* Preview da imagem */}
              {imagemUrl && (
                <div>
                  <Label>Preview da imagem</Label>
                  <div className="mt-2 aspect-video overflow-hidden rounded-lg border">
                    <img
                      src={imagemUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        toast({
                          title: 'Erro na imagem',
                          description: 'Não foi possível carregar a imagem. Verifique a URL.',
                          variant: 'destructive',
                        });
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1 order-2 sm:order-1"
                  size={isMobile ? "default" : "default"}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !titulo || !descricao || !metaValor || !handleInfinitepay}
                  className="flex-1 order-1 sm:order-2"
                  size={isMobile ? "default" : "default"}
                >
                  {loading ? 'Criando...' : 'Criar Apoio'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}