import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ApoioCard } from '@/components/ApoioCard';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart } from 'lucide-react';
import { useInfinitepayUser } from '@/hooks/useInfinitepay';

interface Apoio {
  id: string;
  titulo: string;
  descricao: string;
  meta_valor: number;
  valor_atual: number;
  imagem_url?: string;
  status: string;
}

export default function Home() {
  const [apoios, setApoios] = useState<Apoio[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useInfinitepayUser();

  useEffect(() => {
    const fetchApoios = async () => {
      try {
        const { data, error } = await supabase
          .from('apoios')
          .select('*')
          .eq('status', 'ativo')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApoios(data || []);
      } catch (error) {
        console.error('Erro ao carregar apoios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApoios();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">ApoiaColetivo</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/meus-apoios')}
                >
                  Meus Apoios
                </Button>
              )}
              <Button onClick={() => navigate('/criar-apoio')}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Apoio
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Transforme sonhos em realidade
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Una-se a milhares de pessoas que apoiam causas importantes e fazem a diferença na vida de outros
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/criar-apoio')}
            className="text-lg px-8 py-6"
          >
            <Plus className="h-5 w-5 mr-2" />
            Começar um Apoio
          </Button>
        </div>
      </section>

      {/* Apoios em Destaque */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold">Apoios em Destaque</h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg p-6 animate-pulse">
                  <div className="aspect-video bg-muted rounded-lg mb-4"></div>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : apoios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apoios.map((apoio) => (
                <ApoioCard key={apoio.id} apoio={apoio} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Nenhum apoio encontrado</h4>
              <p className="text-muted-foreground mb-6">
                Seja o primeiro a criar um apoio coletivo!
              </p>
              <Button onClick={() => navigate('/criar-apoio')}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Apoio
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}