import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Plus, Edit, Eye, Users } from 'lucide-react';
import { useInfinitepayUser } from '@/hooks/useInfinitepay';

interface Apoio {
  id: string;
  titulo: string;
  descricao: string;
  meta_valor: number;
  valor_atual: number;
  imagem_url?: string;
  status: string;
  created_at: string;
}

interface ApoiadorCount {
  apoio_id: string;
  count: number;
}

export default function MeusApoios() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useInfinitepayUser();
  
  const [apoios, setApoios] = useState<Apoio[]>([]);
  const [apoiadoresCount, setApoiadoresCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMeusApoios = async () => {
      try {
        // Buscar apoios do usuário
        const { data: apoiosData, error: apoiosError } = await supabase
          .from('apoios')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (apoiosError) throw apoiosError;
        setApoios(apoiosData || []);

        // Buscar contagem de apoiadores para cada apoio
        if (apoiosData && apoiosData.length > 0) {
          const apoioIds = apoiosData.map(a => a.id);
          const { data: countData, error: countError } = await supabase
            .from('apoiadores')
            .select('apoio_id')
            .in('apoio_id', apoioIds);

          if (countError) throw countError;

          // Contar apoiadores por apoio
          const counts: Record<string, number> = {};
          (countData || []).forEach((item: any) => {
            counts[item.apoio_id] = (counts[item.apoio_id] || 0) + 1;
          });
          setApoiadoresCount(counts);
        }
      } catch (error) {
        console.error('Erro ao carregar apoios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeusApoios();
  }, [user]);

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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso necessário</h2>
          <p className="text-muted-foreground mb-6">
            Você precisa estar logado no InfinitePay para ver seus apoios.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para início
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'concluido':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Meus Apoios</h1>
              <p className="text-muted-foreground">Gerencie todos os seus apoios criados</p>
            </div>
          </div>
          
          <Button onClick={() => navigate('/criar-apoio')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Apoio
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : apoios.length > 0 ? (
          <div className="space-y-6">
            {apoios.map((apoio) => {
              const progresso = (apoio.valor_atual / apoio.meta_valor) * 100;
              const valorAtualReais = apoio.valor_atual / 100;
              const metaValorReais = apoio.meta_valor / 100;
              const apoiadoresTotal = apoiadoresCount[apoio.id] || 0;

              return (
                <Card key={apoio.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Imagem */}
                      <div className="w-24 h-24 flex-shrink-0">
                        {apoio.imagem_url ? (
                          <img
                            src={apoio.imagem_url}
                            alt={apoio.titulo}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                            <Users className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold truncate">{apoio.titulo}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                              {apoio.descricao}
                            </p>
                          </div>
                          <Badge className={getStatusColor(apoio.status)}>
                            {getStatusText(apoio.status)}
                          </Badge>
                        </div>

                        {/* Métricas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Arrecadado</p>
                            <p className="font-semibold text-primary">
                              R$ {valorAtualReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Meta</p>
                            <p className="font-semibold">
                              R$ {metaValorReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Apoiadores</p>
                            <p className="font-semibold">{apoiadoresTotal}</p>
                          </div>
                        </div>

                        {/* Progresso */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{progresso.toFixed(1)}% da meta</span>
                            <span className="text-muted-foreground">
                              {new Date(apoio.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progresso, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/apoio/${apoio.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/editar-apoio/${apoio.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-16">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum apoio criado</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não criou nenhum apoio. Que tal começar agora?
              </p>
              <Button onClick={() => navigate('/criar-apoio')}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Apoio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}